// memory.js — ABOS Memory & Conversation Storage System (CGI-bin backed)

const CGI_BIN = '__CGI_BIN__';

const MemoryStore = {
  // Per-agent memory stores
  memories: {},
  // Per-agent conversation histories
  conversations: {},
  // Per-agent session lists
  sessions: {},
  // Global activity feed
  activityFeed: [],
  // Current session IDs per agent
  currentSessions: {},
  // Settings cache
  settings: {},
  // Initialization state
  _initialized: false,
  _initPromise: null,

  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  },

  async _doInit() {
    // Initialize local structures for all agents
    AgentDefs.forEach(agent => {
      this.memories[agent.id] = [];
      this.conversations[agent.id] = {};
      this.sessions[agent.id] = [];
    });

    // Seed local defaults first (instant render)
    this._seedDefaultsLocal();
    this.activityFeed = generateInitialActivity();
    this._initialized = true;

    // Then try backend load
    await this._loadFromBackend();
  },

  async _loadFromBackend() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const [settingsData, memoryData] = await Promise.all([
        this._fetchAPI('/settings').catch(() => null),
        this._fetchAPI('/memory').catch(() => null)
      ]);
      clearTimeout(timeout);

      // Load settings
      if (settingsData && typeof settingsData === 'object' && !settingsData.error) {
        this.settings = settingsData;
      }

      // Load memories — replace local defaults if backend has data
      if (Array.isArray(memoryData) && memoryData.length > 0) {
        // Clear local defaults first
        AgentDefs.forEach(agent => { this.memories[agent.id] = []; });
        memoryData.forEach(m => {
          const agentId = m.agent_id;
          if (!this.memories[agentId]) this.memories[agentId] = [];
          this.memories[agentId].push({
            id: m.id,
            key: m.key,
            value: m.value,
            timestamp: m.created_at,
            agentId: agentId
          });
        });
      }

      // Load sessions and conversations for each agent
      const sessionPromises = AgentDefs.map(agent => this._loadAgentSessions(agent.id));
      await Promise.all(sessionPromises);

      // Check if backend had session data; if so it replaced defaults
      // If backend was empty, seed defaults to backend
      const hasBackendSessions = AgentDefs.some(a => {
        const sessions = this.sessions[a.id];
        return sessions.length > 0 && sessions[0]._fromBackend;
      });
      if (!hasBackendSessions) {
        // Backend is empty — push local defaults
        await this._seedDefaults();
      }
    } catch (err) {
      console.warn('Backend unavailable, using in-memory defaults:', err.message);
    }
  },

  async _loadAgentSessions(agentId) {
    try {
      const sessionsData = await this._fetchAPI(`/sessions?agent_id=${encodeURIComponent(agentId)}`);
      if (Array.isArray(sessionsData) && sessionsData.length > 0) {
        this.sessions[agentId] = sessionsData.map(s => ({
          id: s.id,
          title: s.title,
          createdAt: s.created_at,
          messageCount: s.message_count || 0,
          _fromBackend: true
        }));

        // Set current session to the most recent
        this.currentSessions[agentId] = this.sessions[agentId][0].id;

        // Clear local conversations and load from backend
        this.conversations[agentId] = {};
        for (const session of this.sessions[agentId]) {
          const msgs = await this._fetchAPI(`/conversations?agent_id=${encodeURIComponent(agentId)}&session_id=${encodeURIComponent(session.id)}`).catch(() => []);
          if (Array.isArray(msgs)) {
            this.conversations[agentId][session.id] = msgs.map(m => ({
              id: m.id?.toString() || ('msg-' + Date.now() + Math.random().toString(36).slice(2,6)),
              role: m.role,
              content: m.content,
              timestamp: m.created_at
            }));
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to load sessions for ${agentId}:`, err.message);
    }
  },

  // Seed demo data into the backend (push existing local data)
  async _seedDefaults() {
    // Bulk seed to backend
    const bulkData = { sessions: [], conversations: [], memories: [] };

    AgentDefs.forEach(agent => {
      const sessions = this.sessions[agent.id] || [];
      sessions.forEach(s => {
        bulkData.sessions.push({
          id: s.id,
          agent_id: agent.id,
          title: s.title,
          message_count: s.messageCount || 0,
          created_at: s.createdAt
        });
      });

      Object.keys(this.conversations[agent.id] || {}).forEach(sessionId => {
        const msgs = this.conversations[agent.id][sessionId] || [];
        msgs.forEach(m => {
          bulkData.conversations.push({
            agent_id: agent.id,
            session_id: sessionId,
            role: m.role,
            content: m.content,
            created_at: m.timestamp
          });
        });
      });

      (this.memories[agent.id] || []).forEach(m => {
        bulkData.memories.push({
          id: m.id,
          agent_id: agent.id,
          key: m.key,
          value: m.value,
          created_at: m.timestamp
        });
      });
    });

    try {
      await this._fetchAPI('/bulk-seed', 'POST', bulkData);
    } catch (err) {
      console.warn('Failed to seed backend:', err.message);
    }
  },

  // Local-only default seeding (same as original init)
  _seedDefaultsLocal() {
    AgentDefs.forEach(agent => {
      this.memories[agent.id] = (agent.initialMemory || []).map(m => ({
        ...m,
        agentId: agent.id,
        timestamp: m.timestamp || new Date().toISOString()
      }));
      this.conversations[agent.id] = {};
      this.sessions[agent.id] = [];

      const sessionId = this._createSessionLocal(agent.id, agent.initialSessionTitle || 'Session 1');
      if (agent.initialConversation) {
        this.conversations[agent.id][sessionId] = agent.initialConversation.map(msg => ({
          ...msg,
          id: 'msg-' + Date.now() + Math.random().toString(36).slice(2,6),
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }));
      }
    });
  },

  _createSessionLocal(agentId, title) {
    const sessionId = 's-' + Date.now() + Math.random().toString(36).slice(2,6);
    if (!this.sessions[agentId]) this.sessions[agentId] = [];
    this.sessions[agentId].unshift({
      id: sessionId,
      title: title || `Session ${this.sessions[agentId].length + 1}`,
      createdAt: new Date().toISOString(),
      messageCount: 0
    });
    this.conversations[agentId][sessionId] = [];
    this.currentSessions[agentId] = sessionId;
    return sessionId;
  },

  // ---- API helpers ----
  async _fetchAPI(path, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${CGI_BIN}/api.py${path}`, opts);
    return res.json();
  },

  // ---- Settings ----
  async loadSettings() {
    try {
      const data = await this._fetchAPI('/settings');
      if (data && typeof data === 'object' && !data.error) {
        this.settings = data;
      }
    } catch (err) {
      console.warn('Failed to load settings:', err.message);
    }
    return this.settings;
  },

  async saveSettings(settingsObj) {
    this.settings = { ...this.settings, ...settingsObj };
    try {
      await this._fetchAPI('/settings', 'POST', settingsObj);
    } catch (err) {
      console.warn('Failed to save settings:', err.message);
    }
  },

  // Memory CRUD
  addMemory(agentId, key, value) {
    if (!this.memories[agentId]) this.memories[agentId] = [];
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'mem-' + Date.now() + Math.random().toString(36).slice(2),
      key,
      value,
      timestamp: new Date().toISOString(),
      agentId
    };
    this.memories[agentId].unshift(entry);
    this.addActivity(agentId, 'memory', `Stored: "${key}"`, 'success');

    // Async write to backend
    this._fetchAPI('/memory', 'POST', { id: entry.id, agentId, key, value }).catch(() => {});

    return entry;
  },

  updateMemory(agentId, memoryId, key, value) {
    const mem = this.memories[agentId]?.find(m => m.id === memoryId);
    if (mem) {
      mem.key = key;
      mem.value = value;
      mem.timestamp = new Date().toISOString();

      // Async write to backend
      this._fetchAPI('/memory', 'PUT', { id: memoryId, key, value }).catch(() => {});
    }
    return mem;
  },

  deleteMemory(agentId, memoryId) {
    if (this.memories[agentId]) {
      this.memories[agentId] = this.memories[agentId].filter(m => m.id !== memoryId);

      // Async delete from backend
      this._fetchAPI(`/memory?id=${encodeURIComponent(memoryId)}`, 'DELETE').catch(() => {});
    }
  },

  getMemories(agentId) {
    return this.memories[agentId] || [];
  },

  getAllMemories() {
    const all = [];
    Object.keys(this.memories).forEach(agentId => {
      this.memories[agentId].forEach(m => all.push({ ...m, agentId }));
    });
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Session management
  createSession(agentId, title) {
    const sessionId = 's-' + Date.now() + Math.random().toString(36).slice(2,6);
    if (!this.sessions[agentId]) this.sessions[agentId] = [];
    const sessionObj = {
      id: sessionId,
      title: title || `Session ${this.sessions[agentId].length + 1}`,
      createdAt: new Date().toISOString(),
      messageCount: 0
    };
    this.sessions[agentId].unshift(sessionObj);
    this.conversations[agentId][sessionId] = [];
    this.currentSessions[agentId] = sessionId;

    // Async write to backend
    this._fetchAPI('/sessions', 'POST', { id: sessionId, agentId, title: sessionObj.title }).catch(() => {});

    return sessionId;
  },

  getCurrentSession(agentId) {
    return this.currentSessions[agentId] || (this.sessions[agentId]?.[0]?.id);
  },

  getSessions(agentId) {
    return this.sessions[agentId] || [];
  },

  // Conversation management
  addMessage(agentId, role, content) {
    const sessionId = this.getCurrentSession(agentId);
    if (!sessionId) return;
    if (!this.conversations[agentId]) this.conversations[agentId] = {};
    if (!this.conversations[agentId][sessionId]) this.conversations[agentId][sessionId] = [];
    
    const msg = {
      id: 'msg-' + Date.now() + Math.random().toString(36).slice(2,6),
      role,
      content,
      timestamp: new Date().toISOString()
    };
    this.conversations[agentId][sessionId].push(msg);
    
    // Update session message count
    const session = this.sessions[agentId]?.find(s => s.id === sessionId);
    if (session) session.messageCount++;

    // Async write to backend
    this._fetchAPI('/conversations', 'POST', {
      agentId,
      sessionId,
      role,
      content
    }).catch(() => {});
    
    return msg;
  },

  getMessages(agentId, sessionId) {
    const sid = sessionId || this.getCurrentSession(agentId);
    return this.conversations[agentId]?.[sid] || [];
  },

  // Activity feed
  addActivity(agentId, type, description, status = 'success') {
    const agent = AgentDefs.find(a => a.id === agentId);
    this.activityFeed.unshift({
      id: 'act-' + Date.now(),
      agentId,
      agentName: agent?.name || agentId,
      agentIcon: agent?.icon || '🤖',
      type,
      description,
      status,
      timestamp: new Date().toISOString()
    });
    // Keep last 100
    if (this.activityFeed.length > 100) this.activityFeed.length = 100;
  },

  getActivities(filter = {}) {
    let feed = this.activityFeed;
    if (filter.agentId) feed = feed.filter(a => a.agentId === filter.agentId);
    if (filter.type) feed = feed.filter(a => a.type === filter.type);
    return feed;
  }
};

function generateInitialActivity() {
  const now = Date.now();
  const activities = [
    { agentId: 'seo', agentName: 'SEO Agent', agentIcon: '🔍', type: 'task', description: 'Completed full SEO audit for techflow.io', status: 'success', timestamp: new Date(now - 120000).toISOString() },
    { agentId: 'website-builder', agentName: 'Website Builder', agentIcon: '🌐', type: 'task', description: 'Deployed landing page v2.4 to production', status: 'success', timestamp: new Date(now - 300000).toISOString() },
    { agentId: 'email', agentName: 'Email Agent', agentIcon: '📧', type: 'task', description: 'Sent drip sequence batch #47 (2,340 recipients)', status: 'success', timestamp: new Date(now - 480000).toISOString() },
    { agentId: 'lead-gen', agentName: 'Lead Gen Agent', agentIcon: '🎯', type: 'task', description: 'Enriched 156 new leads from LinkedIn scrape', status: 'success', timestamp: new Date(now - 720000).toISOString() },
    { agentId: 'analytics', agentName: 'Analytics Agent', agentIcon: '📊', type: 'task', description: 'Generated weekly KPI report', status: 'success', timestamp: new Date(now - 900000).toISOString() },
    { agentId: 'content', agentName: 'Content Agent', agentIcon: '📝', type: 'task', description: 'Published "AI in SaaS: 2026 Trends" blog post', status: 'success', timestamp: new Date(now - 1200000).toISOString() },
    { agentId: 'backlink', agentName: 'Backlink Agent', agentIcon: '🔗', type: 'task', description: 'Found 23 new backlink opportunities (DA 40+)', status: 'success', timestamp: new Date(now - 1500000).toISOString() },
    { agentId: 'sales', agentName: 'Sales Agent', agentIcon: '💰', type: 'task', description: 'Updated pipeline: 3 deals moved to Negotiation', status: 'success', timestamp: new Date(now - 1800000).toISOString() },
    { agentId: 'compliance', agentName: 'Compliance Agent', agentIcon: '🛡️', type: 'task', description: 'GDPR audit completed — 2 issues flagged', status: 'pending', timestamp: new Date(now - 2100000).toISOString() },
    { agentId: 'voice-ai', agentName: 'Voice AI Agent', agentIcon: '📞', type: 'task', description: 'Completed 47 outbound calls, 12 appointments set', status: 'success', timestamp: new Date(now - 2400000).toISOString() },
    { agentId: 'marketing', agentName: 'Marketing Agent', agentIcon: '📣', type: 'task', description: 'A/B test results: Variant B wins (+18% CTR)', status: 'success', timestamp: new Date(now - 3000000).toISOString() },
    { agentId: 'scraper', agentName: 'Scraper Agent', agentIcon: '🤖', type: 'task', description: 'Extracted pricing data from 45 competitor sites', status: 'success', timestamp: new Date(now - 3600000).toISOString() },
    { agentId: 'back-office', agentName: 'Back Office Agent', agentIcon: '🏢', type: 'task', description: 'Processed 12 invoices totaling $34,200', status: 'success', timestamp: new Date(now - 4200000).toISOString() },
    { agentId: 'app-builder', agentName: 'App Builder Agent', agentIcon: '📱', type: 'error', description: 'Build failed: dependency conflict in auth module', status: 'error', timestamp: new Date(now - 4800000).toISOString() },
  ];
  return activities.map((a, i) => ({ ...a, id: 'act-init-' + i }));
}
