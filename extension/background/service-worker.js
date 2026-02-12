// Background Service Worker
const API_URL = 'https://tabflow-api.vercel.app/api';
let activeIntents = [];
let tabIntentMap = {}; // Maps tab IDs to intent IDs

// Initialize
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First install - show onboarding
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
    
    // Initialize storage
    await chrome.storage.local.set({
      intents: [],
      stats: {
        totalIntents: 0,
        completedIntents: 0,
        skippedTabs: 0,
        installDate: Date.now()
      },
      settings: {
        autoGroupTabs: true,
        enableNotifications: true,
        enableAI: false,
        enableSync: false
      }
    });
  }

  // Load active intents
  await loadActiveIntents();
  
  // Update badge
  await updateBadge();
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'INTENT_CREATED':
      await handleIntentCreated(message.intent, sender.tab);
      break;
    
    case 'INTENT_COMPLETED':
      await handleIntentCompleted(message.intentId);
      break;
    
    case 'TAB_SKIPPED':
      await handleTabSkipped();
      break;
    
    case 'UPDATE_BADGE':
      await updateBadge(message.count);
      break;
    
    case 'GET_STATS':
      return await getStats();
    
    case 'SYNC_DATA':
      return await syncAllData();
  }
}

async function handleIntentCreated(intent, tab) {
  // Add intent to active list
  activeIntents.push(intent);
  
  // Map tab to intent
  if (tab) {
    tabIntentMap[tab.id] = intent.id;
  }
  
  // Update stats
  const { stats } = await chrome.storage.local.get('stats');
  stats.totalIntents++;
  await chrome.storage.local.set({ stats });
  
  // Set alarm to check for abandoned tabs
  chrome.alarms.create(`check-intent-${intent.id}`, { delayInMinutes: 30 });
}

async function handleIntentCompleted(intentId) {
  activeIntents = activeIntents.filter(i => i.id !== intentId);
  
  // Update stats
  const { stats } = await chrome.storage.local.get('stats');
  stats.completedIntents++;
  await chrome.storage.local.set({ stats });
  
  // Clear alarm
  chrome.alarms.clear(`check-intent-${intentId}`);
  
  // Update badge
  await updateBadge();
}

async function handleTabSkipped() {
  const { stats } = await chrome.storage.local.get('stats');
  stats.skippedTabs++;
  await chrome.storage.local.set({ stats });
}

// Tab tracking
chrome.tabs.onCreated.addListener(async (tab) => {
  // New tab created - will be handled by newtab override
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  // Check if tab was associated with an intent
  const intentId = tabIntentMap[tabId];
  if (intentId) {
    const { intents } = await chrome.storage.local.get('intents');
    const intent = intents.find(i => i.id === intentId);
    
    if (intent) {
      // Remove tab from intent
      intent.tabIds = intent.tabIds.filter(id => id !== tabId);
      
      // If no more tabs, suggest completion
      if (intent.tabIds.length === 0 && intent.status === 'active') {
        const { settings } = await chrome.storage.local.get('settings');
        if (settings.enableNotifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
            title: 'Intent Complete?',
            message: `Did you complete: ${intent.text}?`,
            buttons: [
              { title: 'Yes, mark complete' },
              { title: 'Not yet' }
            ],
            requireInteraction: true
          }, (notificationId) => {
            // Store intent ID for notification click handler
            chrome.storage.local.set({ 
              [`notification-${notificationId}`]: intentId 
            });
          });
        }
      }
      
      // Update intent
      await chrome.storage.local.set({ intents });
    }
    
    delete tabIntentMap[tabId];
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Track URL changes for intent association
    const intentId = tabIntentMap[tabId];
    if (intentId) {
      // Could analyze if URL matches intent
      await analyzeIntentProgress(intentId, tab.url);
    }
  }
});

// Notification click handler
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const { [`notification-${notificationId}`]: intentId } = await chrome.storage.local.get(`notification-${notificationId}`);
  
  if (intentId) {
    if (buttonIndex === 0) {
      // Mark complete
      const { intents } = await chrome.storage.local.get('intents');
      const intent = intents.find(i => i.id === intentId);
      if (intent) {
        intent.status = 'completed';
        intent.completedAt = Date.now();
        await chrome.storage.local.set({ intents });
        await handleIntentCompleted(intentId);
      }
    }
    
    // Clear notification data
    await chrome.storage.local.remove(`notification-${notificationId}`);
  }
  
  chrome.notifications.clear(notificationId);
});

// Alarms for abandoned tab detection
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('check-intent-')) {
    const intentId = alarm.name.replace('check-intent-', '');
    const { intents } = await chrome.storage.local.get('intents');
    const intent = intents.find(i => i.id === intentId);
    
    if (intent && intent.status === 'active') {
      // Check if tabs are still open
      const activeTabs = await Promise.all(
        intent.tabIds.map(async (tabId) => {
          try {
            await chrome.tabs.get(tabId);
            return true;
          } catch {
            return false;
          }
        })
      );
      
      if (!activeTabs.some(active => active)) {
        // All tabs closed, show reminder
        const { settings } = await chrome.storage.local.get('settings');
        if (settings.enableNotifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
            title: 'Abandoned Intent?',
            message: `You haven't touched: ${intent.text} in 30 minutes`,
            priority: 1
          });
        }
      }
    }
  }
});

// Daily stats cleanup (remove old completed intents)
chrome.alarms.create('daily-cleanup', { periodInMinutes: 1440 }); // 24 hours

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'daily-cleanup') {
    const { intents } = await chrome.storage.local.get('intents');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Keep only last 30 days of completed intents
    const filtered = intents.filter(intent => {
      if (intent.status === 'active') return true;
      if (intent.status === 'completed' && intent.completedAt > thirtyDaysAgo) return true;
      return false;
    });
    
    await chrome.storage.local.set({ intents: filtered });
  }
});

// Helper functions
async function loadActiveIntents() {
  const { intents = [] } = await chrome.storage.local.get('intents');
  activeIntents = intents.filter(i => i.status === 'active');
}

async function updateBadge(count) {
  if (count === undefined) {
    await loadActiveIntents();
    count = activeIntents.length;
  }
  
  if (count > 0) {
    await chrome.action.setBadgeText({ text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

async function getStats() {
  const { stats, intents = [] } = await chrome.storage.local.get(['stats', 'intents']);
  
  // Calculate additional stats
  const today = new Date().toDateString();
  const todayIntents = intents.filter(i => 
    new Date(i.createdAt).toDateString() === today
  );
  const todayCompleted = todayIntents.filter(i => i.status === 'completed').length;
  
  return {
    ...stats,
    todayIntents: todayIntents.length,
    todayCompleted,
    activeIntents: activeIntents.length,
    totalIntents: intents.length
  };
}

async function analyzeIntentProgress(intentId, url) {
  // Placeholder for AI-powered intent progress analysis
  // Could check if URL matches intent keywords
  // Could use ML to determine if user is on-track
  
  const { intents } = await chrome.storage.local.get('intents');
  const intent = intents.find(i => i.id === intentId);
  
  if (intent) {
    // Simple keyword matching
    const keywords = intent.text.toLowerCase().split(' ');
    const urlLower = url.toLowerCase();
    
    const matches = keywords.filter(keyword => 
      urlLower.includes(keyword)
    ).length;
    
    // If good match, could show encouragement notification
    if (matches >= Math.min(3, keywords.length)) {
      console.log(`Good progress on intent: ${intent.text}`);
    }
  }
}

async function syncAllData() {
  const { user, intents, stats } = await chrome.storage.local.get(['user', 'intents', 'stats']);
  
  if (!user) return { success: false, error: 'Not logged in' };
  
  try {
    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ intents, stats })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Sync failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize on startup
loadActiveIntents();
updateBadge();