// memory.js — ABOS Memory & Conversation Storage System

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

  init() {
    // Initialize memory and conversations for all agents
    AgentDefs.forEach(agent => {
      this.memories[agent.id] = agent.initialMemory || [];
      this.conversations[agent.id] = {};
      this.sessions[agent.id] = [];
      
      // Create initial session with pre-loaded conversations
      const sessionId = this.createSession(agent.id, agent.initialSessionTitle || 'Session 1');
      if (agent.initialConversation) {
        this.conversations[agent.id][sessionId] = agent.initialConversation.map(msg => ({
          ...msg,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }));
      }
    });
    
    // Pre-populate activity feed
    this.activityFeed = generateInitialActivity();
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
    return entry;
  },

  updateMemory(agentId, memoryId, key, value) {
    const mem = this.memories[agentId]?.find(m => m.id === memoryId);
    if (mem) {
      mem.key = key;
      mem.value = value;
      mem.timestamp = new Date().toISOString();
    }
    return mem;
  },

  deleteMemory(agentId, memoryId) {
    if (this.memories[agentId]) {
      this.memories[agentId] = this.memories[agentId].filter(m => m.id !== memoryId);
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
