// Background service worker for Think First extension

// Constants
const BLOCK_DURATION = 10 * 1000; // 10 seconds for testing (change to 5 * 60 * 1000 for production)
const BLOCKED_URLS = ['chatgpt.com', 'chat.openai.com'];

// Session storage (per-tab tracking)
const activeSessions = new Map();

// Check if URL is a blocked AI site
function isBlockedSite(url) {
  if (!url) return false;
  return BLOCKED_URLS.some(blockedUrl => url.includes(blockedUrl));
}

// Get or create session for a tab
async function getSession(tabId) {
  return activeSessions.get(tabId) || null;
}

// Save session data
async function saveSession(tabId, sessionData) {
  activeSessions.set(tabId, sessionData);
}

// Check if we should block this navigation
async function checkAndBlock(tabId) {
  const session = await getSession(tabId);

  // If no session or session already completed, start new block
  if (!session || session.completed) {
    const blockSession = {
      tabId,
      startTime: Date.now(),
      endTime: Date.now() + BLOCK_DURATION,
      completed: false,
      notes: ''
    };

    await saveSession(tabId, blockSession);

    // Send message to content script to show overlay
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_BLOCK',
        endTime: blockSession.endTime,
        duration: BLOCK_DURATION
      });
    } catch (error) {
      // Tab might not be ready yet, content script will check on load
      console.log('Could not send message to tab:', error);
    }
  } else if (!session.completed) {
    // Session exists and not completed, re-show overlay (e.g., after refresh)
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_BLOCK',
        endTime: session.endTime,
        duration: BLOCK_DURATION
      });
    } catch (error) {
      console.log('Could not send message to tab:', error);
    }
  }
}

// Handle navigation to ChatGPT
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check when page starts loading
  if (changeInfo.status === 'loading' && isBlockedSite(tab.url)) {
    checkAndBlock(tabId);
  }
});

// Handle completion message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BLOCK_COMPLETE') {
    handleCompletion(sender.tab.id, message.notes);
    sendResponse({ success: true });
  } else if (message.type === 'CHECK_BLOCK_STATUS') {
    // Content script asking if it should show block
    getSession(sender.tab.id).then(session => {
      if (session && !session.completed) {
        sendResponse({
          shouldBlock: true,
          endTime: session.endTime,
          duration: BLOCK_DURATION
        });
      } else {
        sendResponse({ shouldBlock: false });
      }
    });
    return true; // Keep channel open for async response
  }
  return true;
});

// Handle block completion
async function handleCompletion(tabId, notes) {
  // Mark session as completed
  const session = await getSession(tabId);
  if (session) {
    session.completed = true;
    session.notes = notes;
    await saveSession(tabId, session);
  }

  // Increment streak and total completed
  const data = await chrome.storage.local.get(['streak', 'totalCompleted', 'lastCompleted']);

  const newStreak = (data.streak || 0) + 1;
  const newTotal = (data.totalCompleted || 0) + 1;

  await chrome.storage.local.set({
    streak: newStreak,
    totalCompleted: newTotal,
    lastCompleted: Date.now()
  });

  console.log(`Block completed! New streak: ${newStreak}`);
}

// Clean up sessions when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  activeSessions.delete(tabId);
});

// Initialize - check existing tabs on extension load
chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => {
    if (tab.id && isBlockedSite(tab.url)) {
      checkAndBlock(tab.id);
    }
  });
});

console.log('Think First extension loaded!');
