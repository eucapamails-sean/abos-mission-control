// openrouter.js — OpenRouter API Integration for ABOS

const MODEL_MAP = {
  'claude-4-opus': 'anthropic/claude-sonnet-4',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'gpt-5': 'openai/gpt-4o',
  'gpt-4o': 'openai/gpt-4o',
  'gemini-2.0-flash': 'google/gemini-2.0-flash-001',
  'deepseek-v3': 'deepseek/deepseek-chat',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
  'gemma-2-27b': 'google/gemma-2-27b-it',
  'mistral-large': 'mistralai/mistral-large-latest'
};

const OpenRouterAPI = {
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  modelsEndpoint: 'https://openrouter.ai/api/v1/models',

  /**
   * Resolve a display model name to an OpenRouter model ID
   */
  resolveModel(displayName) {
    return MODEL_MAP[displayName] || displayName;
  },

  /**
   * Build request headers
   */
  _headers(apiKey) {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://abos.ai',
      'X-Title': 'ABOS Mission Control'
    };
  },

  /**
   * Stream a chat completion from OpenRouter.
   * Returns an object { reader, response } for streaming control.
   * Call onChunk(text) for each text chunk, onDone() when complete, onError(err) on failure.
   */
  async streamChat(apiKey, model, messages, systemPrompt, options = {}) {
    const resolvedModel = this.resolveModel(model);
    
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const body = {
      model: resolvedModel,
      messages: allMessages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this._headers(apiKey),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.error?.code || `HTTP ${response.status}`;
      throw new OpenRouterError(errorMsg, response.status, errorData);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      reader,
      async process(onChunk, onDone, onError) {
        let buffer = '';
        let fullText = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  onChunk(delta, fullText);
                }
              } catch (e) {
                // Skip malformed JSON chunks
              }
            }
          }
          onDone(fullText);
        } catch (err) {
          if (err.name === 'AbortError') {
            onDone(fullText);
          } else {
            onError(err);
          }
        }
      }
    };
  },

  /**
   * Non-streaming chat completion
   */
  async chat(apiKey, model, messages, systemPrompt, options = {}) {
    const resolvedModel = this.resolveModel(model);
    
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const body = {
      model: resolvedModel,
      messages: allMessages,
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this._headers(apiKey),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.error?.code || `HTTP ${response.status}`;
      throw new OpenRouterError(errorMsg, response.status, errorData);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  },

  /**
   * Test if an API key is valid by fetching models
   */
  async testKey(apiKey) {
    try {
      const response = await fetch(this.modelsEndpoint, {
        headers: this._headers(apiKey)
      });
      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}` };
      }
      const data = await response.json();
      return { valid: true, modelCount: data.data?.length || 0 };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  },

  /**
   * Get available models
   */
  async getModels(apiKey) {
    const response = await fetch(this.modelsEndpoint, {
      headers: this._headers(apiKey)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch models: HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  }
};

/**
 * Custom error class for OpenRouter API errors
 */
class OpenRouterError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.data = data;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isRateLimit() {
    return this.status === 429;
  }

  get isModelError() {
    return this.status === 404 || (this.data?.error?.code === 'model_not_found');
  }

  get userMessage() {
    if (this.isAuthError) return 'Invalid API key. Please check your OpenRouter API key in Settings.';
    if (this.isRateLimit) return 'Rate limit reached. Please wait a moment before sending another message.';
    if (this.isModelError) return 'Model not available. Try selecting a different model.';
    return `API Error: ${this.message}`;
  }
}
