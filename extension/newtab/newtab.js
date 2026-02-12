// API Configuration
const API_URL = 'https://tabflow-api.vercel.app/api';
let currentUser = null;
let skipTimer = null;
let selectedCategory = 'work';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  setupEventListeners();
  startClockUpdate();
  updateUI();
});

async function initializeApp() {
  // Load user data
  const { user } = await chrome.storage.local.get('user');
  currentUser = user;

  // Update sync status
  updateSyncStatus();

  // Load settings
  const settings = await getSettings();
  applySettings(settings);

  // Load active intents
  await loadActiveIntents();

  // Load statistics
  await updateStatistics();

  // Show AI suggestions if enabled
  if (settings.enableAI) {
    await showAISuggestions();
  }
}

function setupEventListeners() {
  // Intent input
  const intentInput = document.getElementById('intentInput');
  intentInput.addEventListener('input', handleIntentInput);

  // Category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });

  // Action buttons
  document.getElementById('createBtn').addEventListener('click', createIntent);
  document.getElementById('skipBtn').addEventListener('click', skipTab);
  document.getElementById('voiceBtn').addEventListener('click', startVoiceInput);

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // View all
  document.getElementById('viewAllBtn')?.addEventListener('click', openDashboard);

  // Auto-skip timer
  startSkipTimer();
}

function handleIntentInput(e) {
  const charCount = e.target.value.length;
  document.getElementById('charCount').textContent = charCount;

  // Enable/disable create button
  const createBtn = document.getElementById('createBtn');
  createBtn.disabled = charCount === 0;

  // Reset skip timer on input
  resetSkipTimer();
}

function selectCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

async function createIntent() {
  const intentInput = document.getElementById('intentInput');
  const intentText = intentInput.value.trim();

  if (!intentText) {
    showToast('Please enter an intention', 'error');
    return;
  }

  // Create intent object
  const intent = {
    id: generateId(),
    text: intentText,
    category: selectedCategory,
    createdAt: Date.now(),
    tabIds: [],
    status: 'active',
    completedAt: null
  };

  // Save intent
  await saveIntent(intent);

  // Get current tab
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Associate tab with intent
  intent.tabIds.push(currentTab.id);
  await updateIntent(intent);

  // Create tab group
  const settings = await getSettings();
  if (settings.autoGroupTabs) {
    await createTabGroup(intent);
  }

  // Update badge
  await updateBadge();

  // Sync to cloud if enabled
  if (settings.enableSync && currentUser) {
    await syncToCloud(intent);
  }

  // Show success
  showToast(`Intent created: ${intentText}`, 'success');

  // Navigate to intended URL or close tab
  const url = await predictIntendedURL(intentText, selectedCategory);
  if (url) {
    window.location.href = url;
  } else {
    // Stay on new tab but refresh intent list
    intentInput.value = '';
    document.getElementById('charCount').textContent = '0';
    await loadActiveIntents();
    await updateStatistics();
  }
}

async function saveIntent(intent) {
  const { intents = [] } = await chrome.storage.local.get('intents');
  intents.push(intent);
  await chrome.storage.local.set({ intents });

  // Send to background for tracking
  chrome.runtime.sendMessage({
    type: 'INTENT_CREATED',
    intent
  });
}

async function updateIntent(intent) {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const index = intents.findIndex(i => i.id === intent.id);
  if (index !== -1) {
    intents[index] = intent;
    await chrome.storage.local.set({ intents });
  }
}

async function completeIntent(intentId) {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const intent = intents.find(i => i.id === intentId);
  
  if (intent) {
    intent.status = 'completed';
    intent.completedAt = Date.now();
    await chrome.storage.local.set({ intents });

    // Update statistics
    await updateStatistics();

    // Show notification
    const settings = await getSettings();
    if (settings.enableNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: 'Intent Completed! 🎉',
        message: `You completed: ${intent.text}`,
        priority: 1
      });
    }

    // Sync to cloud
    if (settings.enableSync && currentUser) {
      await syncToCloud(intent);
    }

    // Refresh UI
    await loadActiveIntents();
    showToast('Intent marked as complete!', 'success');
  }
}

async function deleteIntent(intentId) {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const filtered = intents.filter(i => i.id !== intentId);
  await chrome.storage.local.set({ intents: filtered });

  // Refresh UI
  await loadActiveIntents();
  await updateStatistics();
  showToast('Intent deleted', 'info');
}

async function loadActiveIntents() {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const activeIntents = intents.filter(i => i.status === 'active');

  const container = document.getElementById('intentsGrid');
  const section = document.getElementById('activeIntents');

  if (activeIntents.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = activeIntents.slice(0, 6).map(intent => createIntentCard(intent)).join('');

  // Add event listeners
  document.querySelectorAll('.intent-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => completeIntent(btn.dataset.id));
  });

  document.querySelectorAll('.intent-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteIntent(btn.dataset.id));
  });
}

function createIntentCard(intent) {
  const categoryColors = {
    work: '#4299e1',
    research: '#9f7aea',
    shopping: '#ed8936',
    learning: '#48bb78',
    break: '#f6ad55',
    personal: '#ed64a6'
  };

  const categoryIcons = {
    work: '💼',
    research: '🔍',
    shopping: '🛍️',
    learning: '📚',
    break: '☕',
    personal: '✨'
  };

  const timeAgo = getTimeAgo(intent.createdAt);
  const tabCount = intent.tabIds?.length || 0;

  return `
    <div class="intent-item">
      <div class="intent-header">
        <div class="intent-category" style="background: ${categoryColors[intent.category]}20; color: ${categoryColors[intent.category]}">
          <span>${categoryIcons[intent.category]}</span>
          <span>${intent.category}</span>
        </div>
        <div class="intent-actions">
          <button class="btn-icon intent-complete-btn" data-id="${intent.id}" title="Mark as complete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
          <button class="btn-icon intent-delete-btn" data-id="${intent.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="intent-text">${intent.text}</div>
      <div class="intent-meta">
        <span>⏱️ ${timeAgo}</span>
        <span class="intent-tabs">📑 ${tabCount} ${tabCount === 1 ? 'tab' : 'tabs'}</span>
      </div>
    </div>
  `;
}

async function createTabGroup(intent) {
  const categoryColors = {
    work: 'blue',
    research: 'purple',
    shopping: 'orange',
    learning: 'green',
    break: 'yellow',
    personal: 'pink'
  };

  try {
    const groupId = await chrome.tabs.group({
      tabIds: intent.tabIds
    });

    await chrome.tabGroups.update(groupId, {
      title: intent.text.substring(0, 30),
      color: categoryColors[intent.category]
    });
  } catch (error) {
    console.error('Error creating tab group:', error);
  }
}

async function updateStatistics() {
  const { intents = [], stats = {} } = await chrome.storage.local.get(['intents', 'stats']);

  // Today's stats
  const today = new Date().toDateString();
  const todayIntents = intents.filter(i => 
    new Date(i.createdAt).toDateString() === today
  );
  const completedToday = todayIntents.filter(i => i.status === 'completed').length;

  document.getElementById('todayCount').textContent = todayIntents.length;
  document.getElementById('completedToday').textContent = completedToday;

  // Active intents
  const active = intents.filter(i => i.status === 'active').length;
  document.getElementById('activeIntents').textContent = active;

  // Streak
  const streak = calculateStreak(intents);
  document.getElementById('streakCount').textContent = streak;

  // Average completion time
  const completedIntents = intents.filter(i => i.status === 'completed' && i.completedAt);
  if (completedIntents.length > 0) {
    const avgTime = completedIntents.reduce((sum, intent) => {
      return sum + (intent.completedAt - intent.createdAt);
    }, 0) / completedIntents.length;
    document.getElementById('avgCompletionTime').textContent = formatDuration(avgTime);
  } else {
    document.getElementById('avgCompletionTime').textContent = '0m';
  }

  // Productivity score
  const score = todayIntents.length > 0 
    ? Math.round((completedToday / todayIntents.length) * 100) 
    : 0;
  document.getElementById('productivityScore').textContent = `${score}%`;
}

function calculateStreak(intents) {
  const completedDates = intents
    .filter(i => i.status === 'completed')
    .map(i => new Date(i.completedAt).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < completedDates.length; i++) {
    const date = new Date(completedDates[i]);
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function showAISuggestions() {
  const hour = new Date().getHours();
  const suggestions = [];

  // Time-based suggestions
  if (hour >= 9 && hour < 12) {
    suggestions.push('Review morning emails and priorities');
    suggestions.push('Plan important meetings');
  } else if (hour >= 12 && hour < 14) {
    suggestions.push('Quick lunch break');
    suggestions.push('Catch up on team messages');
  } else if (hour >= 14 && hour < 17) {
    suggestions.push('Deep work session');
    suggestions.push('Complete pending tasks');
  } else if (hour >= 17 && hour < 20) {
    suggestions.push('Wrap up and plan tomorrow');
    suggestions.push('Personal development time');
  }

  // Pattern-based suggestions
  const { intents = [] } = await chrome.storage.local.get('intents');
  const recentIntents = intents.slice(-10);
  const categories = recentIntents.reduce((acc, intent) => {
    acc[intent.category] = (acc[intent.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
  if (topCategory) {
    suggestions.push(`Continue your ${topCategory} tasks`);
  }

  // Show suggestions
  if (suggestions.length > 0) {
    const container = document.getElementById('suggestions');
    const list = document.getElementById('suggestionsList');
    
    list.innerHTML = suggestions.slice(0, 3).map(suggestion => `
      <div class="suggestion-item" onclick="useSuggestion('${suggestion}')">
        ${suggestion}
      </div>
    `).join('');

    container.style.display = 'block';
  }
}

function useSuggestion(text) {
  const intentInput = document.getElementById('intentInput');
  intentInput.value = text;
  intentInput.dispatchEvent(new Event('input'));
  intentInput.focus();
}

async function predictIntendedURL(intentText, category) {
  // Simple URL prediction based on keywords
  const lowerText = intentText.toLowerCase();

  if (lowerText.includes('email') || lowerText.includes('gmail')) {
    return 'https://gmail.com';
  }
  if (lowerText.includes('calendar') || lowerText.includes('meeting')) {
    return 'https://calendar.google.com';
  }
  if (lowerText.includes('github') || lowerText.includes('code')) {
    return 'https://github.com';
  }
  if (lowerText.includes('docs') || lowerText.includes('document')) {
    return 'https://docs.google.com';
  }
  if (lowerText.includes('notion')) {
    return 'https://notion.so';
  }

  // Category-based defaults
  if (category === 'shopping') {
    return 'https://www.google.com/search?q=' + encodeURIComponent(intentText);
  }
  if (category === 'research' || category === 'learning') {
    return 'https://www.google.com/search?q=' + encodeURIComponent(intentText);
  }

  return null; // Stay on new tab
}

function startVoiceInput() {
  const voiceBtn = document.getElementById('voiceBtn');
  const intentInput = document.getElementById('intentInput');

  if (!('webkitSpeechRecognition' in window)) {
    showToast('Voice input not supported in this browser', 'error');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    voiceBtn.classList.add('recording');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    intentInput.value = transcript;
    intentInput.dispatchEvent(new Event('input'));
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showToast('Voice input error', 'error');
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('recording');
  };

  recognition.start();
}

function startSkipTimer() {
  const skipBtn = document.getElementById('skipBtn');
  let countdown = 3;

  skipTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(skipTimer);
      skipBtn.textContent = 'Skip';
    } else {
      skipBtn.textContent = `Skip (${countdown}s)`;
    }
  }, 1000);
}

function resetSkipTimer() {
  if (skipTimer) {
    clearInterval(skipTimer);
    document.getElementById('skipBtn').textContent = 'Skip';
  }
}

function skipTab() {
  // Record skip for analytics
  chrome.runtime.sendMessage({ type: 'TAB_SKIPPED' });
  
  // Navigate to blank or close
  showToast('Tab skipped', 'info');
  
  // You could navigate to a search engine or specific URL
  window.location.href = 'https://www.google.com';
}

function startClockUpdate() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
  const date = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  document.getElementById('timeDisplay').textContent = time;
  document.getElementById('dateDisplay').textContent = date;

  // Update greeting
  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  document.getElementById('greeting').textContent = greeting;
}

function openSettings() {
  document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

async function saveSettings() {
  const settings = {
    autoGroupTabs: document.getElementById('autoGroupTabs').checked,
    enableNotifications: document.getElementById('enableNotifications').checked,
    enableAI: document.getElementById('enableAI').checked,
    enableSync: document.getElementById('enableSync').checked
  };

  await chrome.storage.local.set({ settings });
  showToast('Settings saved!', 'success');
  closeSettings();

  // Reapply settings
  applySettings(settings);
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return settings || {
    autoGroupTabs: true,
    enableNotifications: true,
    enableAI: false,
    enableSync: false
  };
}

function applySettings(settings) {
  document.getElementById('autoGroupTabs').checked = settings.autoGroupTabs;
  document.getElementById('enableNotifications').checked = settings.enableNotifications;
  document.getElementById('enableAI').checked = settings.enableAI;
  document.getElementById('enableSync').checked = settings.enableSync;
}

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
}

async function syncToCloud(intent) {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify(intent)
    });

    if (response.ok) {
      updateSyncStatus(true);
    }
  } catch (error) {
    console.error('Sync error:', error);
    updateSyncStatus(false);
  }
}

function updateSyncStatus(synced = true) {
  const syncStatus = document.getElementById('syncStatus');
  if (synced) {
    syncStatus.innerHTML = '<span class="sync-icon">☁️</span><span class="sync-text">Synced</span>';
  } else {
    syncStatus.innerHTML = '<span class="sync-icon">⚠️</span><span class="sync-text">Not synced</span>';
  }
}

async function updateBadge() {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const active = intents.filter(i => i.status === 'active').length;
  
  chrome.runtime.sendMessage({
    type: 'UPDATE_BADGE',
    count: active
  });
}

function updateUI() {
  // Trigger initial animations
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
  }, 100);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Make functions globally accessible for inline event handlers
window.useSuggestion = useSuggestion;
window.completeIntent = completeIntent;
window.deleteIntent = deleteIntent;