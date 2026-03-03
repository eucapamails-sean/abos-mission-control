// app.js — ABOS Core App Logic, Routing, State

// State
let currentRoute = 'dashboard';
let currentAgentId = null;
let sidebarCollapsed = false;
let sidebarMobileOpen = false;
let memoryPanelOpen = false;
let memoryActiveTab = 'memory'; // 'memory' | 'history'
let currentTheme = 'dark';
let selectedModel = 'claude-3.5-sonnet';
let isTyping = false;

// AI Configuration state
const aiConfig = {
  openrouterKey: '',
  openaiKey: '',
  anthropicKey: '',
  googleKey: '',
  xaiKey: '',
  deepseekKey: '',
  defaultModel: 'claude-3.5-sonnet',
  temperature: 0.7,
  maxTokens: 4096,
  perAgentModels: {}
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set dark mode as default
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Initialize memory store (needs AgentDefs from agents.js)
  MemoryStore.init();
  
  // Build sidebar
  renderSidebar();
  
  // Handle routing
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
});

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const parts = hash.split('/');
  
  if (parts[0] === 'agent' && parts[1]) {
    currentRoute = 'agent';
    currentAgentId = parts[1];
  } else {
    currentRoute = parts[0] || 'dashboard';
    currentAgentId = null;
  }
  
  // Update active sidebar item
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === hash || item.dataset.route === (parts[0] === 'agent' ? `agent/${parts[1]}` : parts[0]));
  });
  
  renderContent();
}

function navigate(route) {
  window.location.hash = route;
}

function handleKeyboard(e) {
  // Cmd/Ctrl + K for search focus
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const search = document.querySelector('.header-search input');
    if (search) search.focus();
  }
}

// ============================================
// SIDEBAR
// ============================================
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <a class="sidebar-logo" href="#dashboard" onclick="navigate('dashboard')">
        ${getLogoSVG(24)}
        <span>ABOS</span>
      </a>
      <button class="sidebar-collapse-btn" onclick="toggleSidebar()" title="Collapse sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 19l-7-7 7-7"/><path d="M18 19V5"/></svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section">
        <div class="sidebar-section-label">Command Center</div>
        <a class="sidebar-item" data-route="dashboard" onclick="navigate('dashboard')">
          <span class="sidebar-item-icon">⚡</span>
          <span class="sidebar-item-text">Dashboard</span>
        </a>
        <a class="sidebar-item" data-route="activity" onclick="navigate('activity')">
          <span class="sidebar-item-icon">📋</span>
          <span class="sidebar-item-text">Activity Feed</span>
        </a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-label">AI Agents</div>
        ${AgentDefs.map(agent => `
          <a class="sidebar-item" data-route="agent/${agent.id}" onclick="navigate('agent/${agent.id}')">
            <span class="sidebar-item-icon">${agent.icon}</span>
            <span class="sidebar-item-text">${agent.name}</span>
            <span class="status-dot ${AgentStatusData[agent.id]?.status || 'offline'}"></span>
          </a>
        `).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-label">Settings</div>
        <a class="sidebar-item" data-route="ai-config" onclick="navigate('ai-config')">
          <span class="sidebar-item-icon">⚙️</span>
          <span class="sidebar-item-text">AI Configuration</span>
        </a>
        <a class="sidebar-item" data-route="memory-page" onclick="navigate('memory-page')">
          <span class="sidebar-item-icon">🧠</span>
          <span class="sidebar-item-text">Memory & Context</span>
        </a>
        <a class="sidebar-item" data-route="integrations" onclick="navigate('integrations')">
          <span class="sidebar-item-icon">🔌</span>
          <span class="sidebar-item-text">Integrations</span>
        </a>
        <a class="sidebar-item" data-route="account" onclick="navigate('account')">
          <span class="sidebar-item-icon">👤</span>
          <span class="sidebar-item-text">Account</span>
        </a>
      </div>
    </nav>
    <div class="sidebar-bottom">
      <a class="sidebar-item" onclick="toggleTheme()">
        <span class="sidebar-item-icon" id="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
        <span class="sidebar-item-text" id="theme-text">${currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </a>
    </div>
  `;
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  document.querySelector('.app').classList.toggle('sidebar-collapsed', sidebarCollapsed);
}

function toggleMobileSidebar() {
  sidebarMobileOpen = !sidebarMobileOpen;
  document.getElementById('sidebar').classList.toggle('mobile-open', sidebarMobileOpen);
  document.getElementById('mobile-overlay').classList.toggle('visible', sidebarMobileOpen);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-text');
  if (icon) icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  if (text) text.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

// ============================================
// CONTENT RENDERER
// ============================================
function renderContent() {
  const main = document.getElementById('main-content');
  if (!main) return;
  
  // Reset overflow (chat sets it to hidden)
  main.style.overflow = '';
  
  // Close mobile sidebar on navigation
  if (sidebarMobileOpen) toggleMobileSidebar();
  
  switch(currentRoute) {
    case 'dashboard': renderDashboard(main); break;
    case 'activity': renderActivityPage(main); break;
    case 'agent': renderAgentChat(main); break;
    case 'ai-config': renderAIConfig(main); break;
    case 'memory-page': renderMemoryPage(main); break;
    case 'integrations': renderIntegrationsPage(main); break;
    case 'account': renderAccountPage(main); break;
    default: renderDashboard(main);
  }
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard(container) {
  const kpis = DashboardData.kpis;
  const activities = MemoryStore.getActivities().slice(0, 8);
  
  container.innerHTML = `
    <div class="main-content">
      <div class="page-header">
        <h1 class="page-title">Command Center</h1>
        <p class="page-desc">Overview of all autonomous agents and business operations</p>
      </div>
      
      <!-- KPI Cards -->
      <div class="kpi-grid">
        ${kpis.map(kpi => `
          <div class="kpi-card">
            <div class="kpi-label">${kpi.label}</div>
            <div class="kpi-value">${kpi.value}</div>
            <div class="kpi-delta ${kpi.deltaType}">${kpi.delta}</div>
          </div>
        `).join('')}
      </div>
      
      <!-- Agent Status Grid -->
      <div class="section-header">
        <div>
          <h2 class="section-title">Agent Status</h2>
          <p class="section-subtitle">14 agents configured — 8 active</p>
        </div>
      </div>
      <div class="agent-grid">
        ${AgentDefs.map(agent => {
          const statusData = AgentStatusData[agent.id] || {};
          return `
            <div class="agent-card" onclick="navigate('agent/${agent.id}')">
              <div class="agent-card-top">
                <div class="agent-icon">${agent.icon}</div>
                <div class="agent-card-info">
                  <div class="agent-card-name">${agent.name}</div>
                  <div class="agent-card-status">
                    <span class="status-dot ${statusData.status || 'offline'}" style="width:6px;height:6px;border-radius:50%;display:inline-block;"></span>
                    ${(statusData.status || 'offline').charAt(0).toUpperCase() + (statusData.status || 'offline').slice(1)} · ${agent.model}
                  </div>
                </div>
              </div>
              <div class="agent-card-last-action">${agent.lastAction} · ${agent.lastActionTime}</div>
              <button class="agent-card-open" onclick="event.stopPropagation(); navigate('agent/${agent.id}')">Open</button>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- Two column: Activity + Chart -->
      <div class="dashboard-bottom-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-4); margin-top:var(--space-2);">
        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Activity</span>
            <button class="btn btn-sm btn-ghost" onclick="navigate('activity')">View All</button>
          </div>
          <div class="activity-list">
            ${activities.map(act => `
              <div class="activity-item">
                <div class="activity-icon">${act.agentIcon}</div>
                <div class="activity-content">
                  <div class="activity-text"><strong>${act.agentName}</strong> ${act.description}</div>
                  <div class="activity-meta">${formatTimeAgo(act.timestamp)}</div>
                </div>
                <span class="activity-status ${act.status}">${act.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Model Usage Chart -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Model Usage (Tokens)</span>
            <span class="text-xs text-muted">Last 7 days</span>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="model-usage-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Render chart
  requestAnimationFrame(() => initModelUsageChart());
}

function initModelUsageChart() {
  const canvas = document.getElementById('model-usage-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DashboardData.modelUsage.labels,
      datasets: [{
        data: DashboardData.modelUsage.data,
        backgroundColor: DashboardData.modelUsage.colors,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 28,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface-2').trim() || '#1a1a25',
          titleColor: '#e8e8f0',
          bodyColor: '#8888a0',
          borderColor: '#2a2a3a',
          borderWidth: 1,
          cornerRadius: 6,
          padding: 10,
          callbacks: {
            label: ctx => ctx.parsed.y.toLocaleString() + ' tokens'
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: '#555570',
            font: { size: 10, family: 'Inter' },
            maxRotation: 45,
          },
          border: { display: false }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { 
            color: '#555570',
            font: { size: 10, family: 'Inter' },
            callback: v => (v/1000) + 'K'
          },
          border: { display: false }
        }
      }
    }
  });
}

// ============================================
// ACTIVITY PAGE
// ============================================
function renderActivityPage(container) {
  const activities = MemoryStore.getActivities();
  
  container.innerHTML = `
    <div class="main-content">
      <div class="page-header">
        <h1 class="page-title">Activity Feed</h1>
        <p class="page-desc">Complete log of all agent actions and system events</p>
      </div>
      
      <div class="filter-bar">
        <select id="activity-agent-filter" onchange="filterActivities()">
          <option value="">All Agents</option>
          ${AgentDefs.map(a => `<option value="${a.id}">${a.icon} ${a.name}</option>`).join('')}
        </select>
        <select id="activity-status-filter" onchange="filterActivities()">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      
      <div class="card">
        <div class="activity-list" id="activity-list">
          ${activities.map(act => renderActivityItem(act)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderActivityItem(act) {
  return `
    <div class="activity-item" data-agent="${act.agentId}" data-status="${act.status}">
      <div class="activity-icon">${act.agentIcon}</div>
      <div class="activity-content">
        <div class="activity-text"><strong>${act.agentName}</strong> ${act.description}</div>
        <div class="activity-meta">${formatTimeAgo(act.timestamp)} · ${act.type}</div>
      </div>
      <span class="activity-status ${act.status}">${act.status}</span>
    </div>
  `;
}

function filterActivities() {
  const agentFilter = document.getElementById('activity-agent-filter')?.value;
  const statusFilter = document.getElementById('activity-status-filter')?.value;
  
  document.querySelectorAll('#activity-list .activity-item').forEach(item => {
    const matchAgent = !agentFilter || item.dataset.agent === agentFilter;
    const matchStatus = !statusFilter || item.dataset.status === statusFilter;
    item.style.display = (matchAgent && matchStatus) ? '' : 'none';
  });
}

// ============================================
// AGENT CHAT
// ============================================
function renderAgentChat(container) {
  const agent = AgentDefs.find(a => a.id === currentAgentId);
  if (!agent) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤖</div><div class="empty-state-text">Agent not found</div></div>';
    container.style.overflow = '';
    return;
  }
  // Disable main scroll for chat view — chat messages handle their own scroll
  container.style.overflow = 'hidden';
  
  const statusData = AgentStatusData[agent.id] || {};
  const messages = MemoryStore.getMessages(agent.id);
  const memories = MemoryStore.getMemories(agent.id);
  const sessions = MemoryStore.getSessions(agent.id);
  
  container.innerHTML = `
    <div class="chat-layout ${memoryPanelOpen ? 'memory-open' : ''}" id="chat-layout">
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-agent-icon">${agent.icon}</div>
          <div class="chat-agent-info">
            <div class="chat-agent-name">${agent.name}</div>
            <div class="chat-agent-status-bar">
              <span class="dot" style="background:var(--color-${statusData.status === 'active' ? 'success' : statusData.status === 'idle' ? 'warning' : 'text-faint'})"></span>
              <span>${(statusData.status || 'offline').charAt(0).toUpperCase() + (statusData.status || 'offline').slice(1)}</span>
              <span class="model-tag">${agent.model}</span>
              <span style="color:var(--color-text-faint)">${messages.length} messages</span>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="header-btn" onclick="startNewSession('${agent.id}')" title="New Session">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button class="header-btn ${memoryPanelOpen ? 'text-primary' : ''}" onclick="toggleMemoryPanel()" title="Toggle Memory">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
            </button>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          ${agent.quickActions.map(action => `
            <button class="quick-action-btn" onclick="sendQuickAction('${agent.id}', '${action}')">${action}</button>
          `).join('')}
        </div>
        
        <!-- Messages -->
        <div class="chat-messages" id="chat-messages">
          ${messages.map((msg, i) => renderMessage(msg, agent, i)).join('')}
        </div>
        
        <!-- Input -->
        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <textarea class="chat-input" id="chat-input" 
              placeholder="Message ${agent.name}..." 
              rows="1"
              onkeydown="handleChatKeydown(event, '${agent.id}')"
              oninput="autoResize(this)"></textarea>
            <button class="chat-send-btn" onclick="sendMessage('${agent.id}')" id="send-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Memory Panel -->
      ${memoryPanelOpen ? `
      <div class="memory-panel" id="memory-panel">
        <div class="memory-panel-header">
          <span class="memory-panel-title">Context</span>
          <button class="header-btn" onclick="toggleMemoryPanel()" style="width:24px;height:24px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="memory-tabs">
          <button class="memory-tab ${memoryActiveTab === 'memory' ? 'active' : ''}" onclick="switchMemoryTab('memory')">Memory</button>
          <button class="memory-tab ${memoryActiveTab === 'history' ? 'active' : ''}" onclick="switchMemoryTab('history')">History</button>
        </div>
        <div class="memory-content" id="memory-content">
          ${memoryActiveTab === 'memory' ? renderMemoryEntries(agent.id, memories) : renderSessionHistory(agent.id, sessions)}
        </div>
        ${memoryActiveTab === 'memory' ? `
        <div style="padding:var(--space-2) var(--space-3); border-top:1px solid var(--color-border-subtle);">
          <button class="btn btn-sm btn-secondary w-full" onclick="showAddMemoryDialog('${agent.id}')">+ Add Memory</button>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
  `;
  
  // Scroll to bottom
  requestAnimationFrame(() => {
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  });
}

function renderMessage(msg, agent, index) {
  const isUser = msg.role === 'user';
  const parsedContent = typeof marked !== 'undefined' ? marked.parse(msg.content) : msg.content.replace(/\n/g, '<br>');
  
  return `
    <div class="message ${msg.role}" style="animation-delay: ${index * 0.05}s">
      <div class="message-avatar">${isUser ? '👤' : agent.icon}</div>
      <div>
        <div class="message-bubble">${parsedContent}</div>
        <div class="message-time">${formatTime(msg.timestamp)}</div>
      </div>
    </div>
  `;
}

function renderMemoryEntries(agentId, memories) {
  if (memories.length === 0) {
    return '<div style="text-align:center;padding:var(--space-6);color:var(--color-text-faint);font-size:var(--text-xs);">No memories stored yet</div>';
  }
  return memories.map(mem => `
    <div class="memory-entry">
      <div class="memory-entry-key">${escapeHtml(mem.key)}</div>
      <div class="memory-entry-value">${escapeHtml(mem.value)}</div>
      <div class="memory-entry-time">${formatTimeAgo(mem.timestamp)}</div>
      <div class="memory-entry-actions">
        <button class="memory-entry-btn" onclick="editMemory('${agentId}', '${mem.id}')">Edit</button>
        <button class="memory-entry-btn delete" onclick="deleteMemoryEntry('${agentId}', '${mem.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderSessionHistory(agentId, sessions) {
  if (sessions.length === 0) {
    return '<div style="text-align:center;padding:var(--space-6);color:var(--color-text-faint);font-size:var(--text-xs);">No sessions yet</div>';
  }
  const currentSession = MemoryStore.getCurrentSession(agentId);
  return sessions.map(session => `
    <div class="history-item ${session.id === currentSession ? 'active' : ''}" onclick="switchSession('${agentId}', '${session.id}')" style="${session.id === currentSession ? 'background:var(--color-primary-muted)' : ''}">
      <div class="history-item-title">${escapeHtml(session.title)}</div>
      <div class="history-item-time">${session.messageCount} messages · ${formatTimeAgo(session.createdAt)}</div>
    </div>
  `).join('');
}

function sendMessage(agentId) {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const content = input.value.trim();
  if (!content || isTyping) return;
  
  // Add user message
  MemoryStore.addMessage(agentId, 'user', content);
  input.value = '';
  autoResize(input);
  
  // Re-render messages
  const messagesEl = document.getElementById('chat-messages');
  const agent = AgentDefs.find(a => a.id === agentId);
  const messages = MemoryStore.getMessages(agentId);
  
  messagesEl.innerHTML = messages.map((msg, i) => renderMessage(msg, agent, i)).join('');
  
  // Show typing indicator
  isTyping = true;
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="message-avatar" style="background:var(--color-primary-muted);color:var(--color-primary);width:28px;height:28px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:13px;">${agent.icon}</div>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  `;
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  // Simulate response after delay
  const delay = 1000 + Math.random() * 1500;
  setTimeout(() => {
    isTyping = false;
    const responseContent = getAgentMockResponse(agentId);
    MemoryStore.addMessage(agentId, 'assistant', responseContent);
    MemoryStore.addActivity(agentId, 'chat', 'Responded to user message', 'success');
    
    // Remove typing indicator and render new message
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    const updatedMessages = MemoryStore.getMessages(agentId);
    messagesEl.innerHTML = updatedMessages.map((msg, i) => renderMessage(msg, agent, i)).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }, delay);
}

function sendQuickAction(agentId, action) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = action;
    sendMessage(agentId);
  }
}

function handleChatKeydown(e, agentId) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(agentId);
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function toggleMemoryPanel() {
  memoryPanelOpen = !memoryPanelOpen;
  renderAgentChat(document.getElementById('main-content'));
}

function switchMemoryTab(tab) {
  memoryActiveTab = tab;
  const agent = AgentDefs.find(a => a.id === currentAgentId);
  if (!agent) return;
  
  const content = document.getElementById('memory-content');
  if (!content) return;
  
  document.querySelectorAll('.memory-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.toLowerCase() === tab);
  });
  
  if (tab === 'memory') {
    content.innerHTML = renderMemoryEntries(agent.id, MemoryStore.getMemories(agent.id));
  } else {
    content.innerHTML = renderSessionHistory(agent.id, MemoryStore.getSessions(agent.id));
  }
}

function startNewSession(agentId) {
  const title = prompt('Session name:', `Session ${MemoryStore.getSessions(agentId).length + 1}`);
  if (!title) return;
  MemoryStore.createSession(agentId, title);
  renderAgentChat(document.getElementById('main-content'));
}

function switchSession(agentId, sessionId) {
  MemoryStore.currentSessions[agentId] = sessionId;
  renderAgentChat(document.getElementById('main-content'));
}

function showAddMemoryDialog(agentId) {
  const key = prompt('Memory key (e.g., "Company Name"):');
  if (!key) return;
  const value = prompt('Memory value:');
  if (!value) return;
  MemoryStore.addMemory(agentId, key, value);
  renderAgentChat(document.getElementById('main-content'));
}

function editMemory(agentId, memoryId) {
  const mem = MemoryStore.getMemories(agentId).find(m => m.id === memoryId);
  if (!mem) return;
  const key = prompt('Edit key:', mem.key);
  if (!key) return;
  const value = prompt('Edit value:', mem.value);
  if (!value) return;
  MemoryStore.updateMemory(agentId, memoryId, key, value);
  renderAgentChat(document.getElementById('main-content'));
}

function deleteMemoryEntry(agentId, memoryId) {
  MemoryStore.deleteMemory(agentId, memoryId);
  renderAgentChat(document.getElementById('main-content'));
}

// ============================================
// AI CONFIGURATION PAGE
// ============================================
function renderAIConfig(container) {
  container.innerHTML = `
    <div class="main-content settings-layout">
      <div class="page-header">
        <h1 class="page-title">AI Configuration</h1>
        <p class="page-desc">Manage API keys, model selection, and usage</p>
      </div>
      
      <!-- API Keys -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">API Keys</div>
          <div class="settings-section-desc">Connect your AI providers. Keys are stored in-memory only.</div>
        </div>
        <div class="settings-section-body">
          ${renderAPIKeyField('OpenRouter', 'openrouterKey', 'sk-or-v1-...')}
          ${renderAPIKeyField('OpenAI', 'openaiKey', 'sk-...')}
          ${renderAPIKeyField('Anthropic', 'anthropicKey', 'sk-ant-...')}
          ${renderAPIKeyField('Google AI', 'googleKey', 'AIza...')}
          ${renderAPIKeyField('xAI', 'xaiKey', 'xai-...')}
          ${renderAPIKeyField('DeepSeek', 'deepseekKey', 'sk-...')}
        </div>
      </div>
      
      <!-- Model Selection -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">Model Selection</div>
          <div class="settings-section-desc">Configure default and per-agent models</div>
        </div>
        <div class="settings-section-body">
          <div class="form-group">
            <label class="form-label">Default Model</label>
            <select class="form-select w-full" onchange="aiConfig.defaultModel = this.value">
              <optgroup label="HIGH">
                <option ${aiConfig.defaultModel === 'claude-4-opus' ? 'selected' : ''} value="claude-4-opus">Claude 4 Opus</option>
                <option ${aiConfig.defaultModel === 'gpt-5' ? 'selected' : ''} value="gpt-5">GPT-5</option>
              </optgroup>
              <optgroup label="STANDARD">
                <option ${aiConfig.defaultModel === 'claude-3.5-sonnet' ? 'selected' : ''} value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option ${aiConfig.defaultModel === 'gpt-4o' ? 'selected' : ''} value="gpt-4o">GPT-4o</option>
              </optgroup>
              <optgroup label="FAST">
                <option ${aiConfig.defaultModel === 'gemini-2.0-flash' ? 'selected' : ''} value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option ${aiConfig.defaultModel === 'deepseek-v3' ? 'selected' : ''} value="deepseek-v3">DeepSeek V3</option>
              </optgroup>
              <optgroup label="FREE">
                <option ${aiConfig.defaultModel === 'llama-3.3-70b' ? 'selected' : ''} value="llama-3.3-70b">Llama 3.3 70B</option>
                <option ${aiConfig.defaultModel === 'gemma-2-27b' ? 'selected' : ''} value="gemma-2-27b">Gemma 2 27B</option>
              </optgroup>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Temperature: <span id="temp-val">${aiConfig.temperature}</span></label>
            <input type="range" min="0" max="2" step="0.1" value="${aiConfig.temperature}" 
              oninput="aiConfig.temperature = parseFloat(this.value); document.getElementById('temp-val').textContent = this.value">
          </div>
          
          <div class="form-group">
            <label class="form-label">Max Tokens: <span id="tokens-val">${aiConfig.maxTokens}</span></label>
            <input type="range" min="256" max="32768" step="256" value="${aiConfig.maxTokens}"
              oninput="aiConfig.maxTokens = parseInt(this.value); document.getElementById('tokens-val').textContent = this.value">
          </div>
          
          <!-- Per-Agent Model Override -->
          <label class="form-label" style="margin-top:var(--space-4)">Per-Agent Model Override</label>
          <table class="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Current Model</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              ${AgentDefs.map(agent => `
                <tr>
                  <td>${agent.icon} ${agent.name}</td>
                  <td><span class="mono text-xs">${agent.model}</span></td>
                  <td>
                    <select class="form-select" style="height:28px;font-size:11px;" onchange="aiConfig.perAgentModels['${agent.id}']=this.value">
                      <option value="">Default</option>
                      <option value="claude-4-opus">Claude 4 Opus</option>
                      <option value="claude-3.5-sonnet" ${agent.model === 'claude-3.5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                      <option value="gpt-5">GPT-5</option>
                      <option value="gpt-4o" ${agent.model === 'gpt-4o' ? 'selected' : ''}>GPT-4o</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="deepseek-v3">DeepSeek V3</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Cost Dashboard -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">Cost Dashboard</div>
          <div class="settings-section-desc">Token usage and spending overview</div>
        </div>
        <div class="settings-section-body">
          <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="kpi-card">
              <div class="kpi-label">Today</div>
              <div class="kpi-value">$18.40</div>
              <div class="kpi-delta negative">↑ 12% vs avg</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">This Week</div>
              <div class="kpi-value">$124.50</div>
              <div class="kpi-delta positive">↓ 5% vs last week</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">This Month</div>
              <div class="kpi-value">$487.20</div>
              <div class="kpi-delta neutral">On track for $620</div>
            </div>
          </div>
          <table class="data-table mt-3">
            <thead>
              <tr><th>Model</th><th>Input Tokens</th><th>Output Tokens</th><th>Cost</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="mono text-xs">claude-3.5-sonnet</span></td><td class="tabular-nums">2,847,000</td><td class="tabular-nums">1,423,500</td><td class="tabular-nums">$198.40</td></tr>
              <tr><td><span class="mono text-xs">gpt-4o</span></td><td class="tabular-nums">1,920,000</td><td class="tabular-nums">860,000</td><td class="tabular-nums">$142.30</td></tr>
              <tr><td><span class="mono text-xs">gemini-2.0-flash</span></td><td class="tabular-nums">3,450,000</td><td class="tabular-nums">1,100,000</td><td class="tabular-nums">$68.20</td></tr>
              <tr><td><span class="mono text-xs">deepseek-v3</span></td><td class="tabular-nums">1,800,000</td><td class="tabular-nums">720,000</td><td class="tabular-nums">$45.80</td></tr>
              <tr><td><span class="mono text-xs">llama-3.3-70b</span></td><td class="tabular-nums">1,200,000</td><td class="tabular-nums">480,000</td><td class="tabular-nums">$32.50</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAPIKeyField(label, configKey, placeholder) {
  return `
    <div class="form-group">
      <label class="form-label">${label} API Key</label>
      <div class="form-input-group">
        <input type="password" class="form-input" id="key-${configKey}" 
          placeholder="${placeholder}" value="${aiConfig[configKey]}"
          oninput="aiConfig['${configKey}'] = this.value">
        <button class="btn btn-secondary btn-sm" onclick="toggleKeyVisibility('key-${configKey}')">Show</button>
        <button class="btn btn-primary btn-sm" onclick="testConnection('${label}')">Test</button>
      </div>
    </div>
  `;
}

function toggleKeyVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const btn = input.nextElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

function testConnection(provider) {
  showToast(`Testing ${provider} connection...`, 'info');
  setTimeout(() => showToast(`${provider} connection successful!`, 'success'), 1500);
}

// ============================================
// MEMORY PAGE
// ============================================
function renderMemoryPage(container) {
  const allMemories = MemoryStore.getAllMemories();
  
  container.innerHTML = `
    <div class="main-content">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h1 class="page-title">Memory & Context</h1>
          <p class="page-desc">${allMemories.length} entries across all agents</p>
        </div>
        <button class="btn btn-secondary" onclick="exportMemory()">Export JSON</button>
      </div>
      
      <div class="filter-bar">
        <select id="memory-agent-filter" onchange="filterMemoryPage()">
          <option value="">All Agents</option>
          ${AgentDefs.map(a => `<option value="${a.id}">${a.icon} ${a.name}</option>`).join('')}
        </select>
        <input type="text" id="memory-search" placeholder="Search memories..." oninput="filterMemoryPage()">
      </div>
      
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Key</th>
              <th>Value</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="memory-table-body">
            ${allMemories.map(mem => {
              const agent = AgentDefs.find(a => a.id === mem.agentId);
              return `
                <tr data-agent="${mem.agentId}" data-key="${escapeHtml(mem.key).toLowerCase()}" data-value="${escapeHtml(mem.value).toLowerCase()}">
                  <td>${agent?.icon || '🤖'} <span class="text-xs">${agent?.name || mem.agentId}</span></td>
                  <td><strong class="text-primary">${escapeHtml(mem.key)}</strong></td>
                  <td class="text-muted" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(mem.value)}</td>
                  <td class="text-faint text-xs">${formatTimeAgo(mem.timestamp)}</td>
                  <td>
                    <button class="btn btn-sm btn-ghost" onclick="deleteMemoryFromPage('${mem.agentId}', '${mem.id}')">Delete</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterMemoryPage() {
  const agentFilter = document.getElementById('memory-agent-filter')?.value;
  const searchQuery = document.getElementById('memory-search')?.value.toLowerCase() || '';
  
  document.querySelectorAll('#memory-table-body tr').forEach(row => {
    const matchAgent = !agentFilter || row.dataset.agent === agentFilter;
    const matchSearch = !searchQuery || row.dataset.key?.includes(searchQuery) || row.dataset.value?.includes(searchQuery);
    row.style.display = (matchAgent && matchSearch) ? '' : 'none';
  });
}

function deleteMemoryFromPage(agentId, memoryId) {
  MemoryStore.deleteMemory(agentId, memoryId);
  renderMemoryPage(document.getElementById('main-content'));
}

function exportMemory() {
  const data = JSON.stringify(MemoryStore.getAllMemories(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'abos-memory-export.json';
  a.click();
  showToast('Memory exported as JSON', 'success');
}

// ============================================
// INTEGRATIONS PAGE
// ============================================
function renderIntegrationsPage(container) {
  const integrations = [
    { name: 'Slack', icon: '💬', status: 'connected', desc: 'Send notifications and receive commands' },
    { name: 'Google Workspace', icon: '📨', status: 'connected', desc: 'Email, Calendar, Drive integration' },
    { name: 'Stripe', icon: '💳', status: 'connected', desc: 'Payment processing and invoicing' },
    { name: 'HubSpot', icon: '🔶', status: 'disconnected', desc: 'CRM and marketing automation' },
    { name: 'Notion', icon: '📓', status: 'disconnected', desc: 'Knowledge base and documentation' },
    { name: 'GitHub', icon: '🐙', status: 'connected', desc: 'Code repositories and CI/CD' },
    { name: 'Zapier', icon: '⚡', status: 'disconnected', desc: 'Connect 5,000+ apps' },
    { name: 'Twilio', icon: '📱', status: 'connected', desc: 'Voice and SMS communications' },
  ];
  
  container.innerHTML = `
    <div class="main-content settings-layout">
      <div class="page-header">
        <h1 class="page-title">Integrations</h1>
        <p class="page-desc">Connect your business tools to ABOS agents</p>
      </div>
      
      <div style="display:grid; gap:var(--space-3);">
        ${integrations.map(int => `
          <div class="card" style="padding:var(--space-4); display:flex; align-items:center; gap:var(--space-3);">
            <div style="font-size:24px;">${int.icon}</div>
            <div style="flex:1;">
              <div style="font-size:var(--text-sm); font-weight:600; color:var(--color-text);">${int.name}</div>
              <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${int.desc}</div>
            </div>
            <span class="badge ${int.status === 'connected' ? 'badge-success' : 'badge-neutral'}">${int.status === 'connected' ? 'Connected' : 'Disconnected'}</span>
            <button class="btn btn-sm ${int.status === 'connected' ? 'btn-ghost' : 'btn-primary'}">${int.status === 'connected' ? 'Configure' : 'Connect'}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================
// ACCOUNT PAGE
// ============================================
function renderAccountPage(container) {
  container.innerHTML = `
    <div class="main-content settings-layout">
      <div class="page-header">
        <h1 class="page-title">Account</h1>
        <p class="page-desc">Manage your ABOS account settings</p>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">Profile</div>
        </div>
        <div class="settings-section-body">
          <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4);">
            <div class="header-avatar" style="width:56px;height:56px;font-size:20px;">AB</div>
            <div>
              <div style="font-size:var(--text-sm);font-weight:600;">ABOS Admin</div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);">admin@abos.ai</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" class="form-input" value="ABOS Admin">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="admin@abos.ai">
          </div>
          <button class="btn btn-primary">Save Changes</button>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">Preferences</div>
        </div>
        <div class="settings-section-body">
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Dark Mode</div>
              <div class="settings-row-desc">Use dark color scheme</div>
            </div>
            <div class="toggle ${currentTheme === 'dark' ? 'active' : ''}" onclick="toggleTheme(); this.classList.toggle('active');"></div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Agent Notifications</div>
              <div class="settings-row-desc">Receive alerts when agents complete tasks</div>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Auto-save Conversations</div>
              <div class="settings-row-desc">Automatically save all chat history</div>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-title">Danger Zone</div>
        </div>
        <div class="settings-section-body">
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Clear All Data</div>
              <div class="settings-row-desc">Delete all memories, conversations, and settings</div>
            </div>
            <button class="btn btn-danger btn-sm">Clear Data</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// UTILITIES
// ============================================
function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return date.toLocaleDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="color:var(--color-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'}); margin-right:var(--space-2);">●</span> ${message}`;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getLogoSVG(size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <!-- Outer hexagon -->
      <path d="M24 2L43.6 13V35L24 46L4.4 35V13L24 2Z" stroke="var(--color-primary)" stroke-width="2.5" fill="none"/>
      <!-- Inner network nodes -->
      <circle cx="24" cy="14" r="3" fill="var(--color-primary)"/>
      <circle cx="15" cy="28" r="3" fill="var(--color-primary)"/>
      <circle cx="33" cy="28" r="3" fill="var(--color-primary)"/>
      <circle cx="24" cy="24" r="4" fill="var(--color-primary)" opacity="0.3"/>
      <!-- Connection lines -->
      <line x1="24" y1="14" x2="15" y2="28" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.6"/>
      <line x1="24" y1="14" x2="33" y2="28" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.6"/>
      <line x1="15" y1="28" x2="33" y2="28" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.6"/>
      <!-- Center pulse -->
      <circle cx="24" cy="24" r="2" fill="var(--color-primary)"/>
    </g>
  </svg>`;
}
