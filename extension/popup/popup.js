// Popup JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadRecentIntents();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('newIntentBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://newtab' });
    window.close();
  });

  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    window.close();
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  document.getElementById('upgradeBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://tabflow.app/pricing' });
    window.close();
  });
}

async function loadStats() {
  const stats = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
  
  document.getElementById('activeCount').textContent = stats.activeIntents || 0;
  document.getElementById('completedCount').textContent = stats.todayCompleted || 0;
  document.getElementById('streakCount').textContent = calculateStreak(stats) || 0;
}

async function loadRecentIntents() {
  const { intents = [] } = await chrome.storage.local.get('intents');
  const recent = intents
    .filter(i => i.status === 'active')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const container = document.getElementById('intentsList');

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-text">No active intents</div>
      </div>
    `;
    return;
  }

  const categoryIcons = {
    work: '💼',
    research: '🔍',
    shopping: '🛍️',
    learning: '📚',
    break: '☕',
    personal: '✨'
  };

  container.innerHTML = recent.map(intent => `
    <div class="intent-item-mini" data-id="${intent.id}">
      <div class="intent-icon">${categoryIcons[intent.category]}</div>
      <div class="intent-content">
        <div class="intent-text-mini">${intent.text}</div>
        <div class="intent-time">${getTimeAgo(intent.createdAt)}</div>
      </div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.intent-item-mini').forEach(item => {
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://newtab' });
      window.close();
    });
  });
}

function calculateStreak(stats) {
  // Simplified streak calculation for popup
  return Math.floor(Math.random() * 7); // Placeholder
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}