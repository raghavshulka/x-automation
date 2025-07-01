// Background script for Twitter Auto Poster - Enhanced Version
chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitter Auto Poster extension installed - Enhanced Version');
  console.log('🆔 Extension ID:', chrome.runtime.id);
  
  // Initialize storage with default state
  chrome.storage.local.set({
    autoPosterState: {
      isRunning: false,
      currentPostCount: 0,
      totalPosts: 0,
      sessionStartTime: null,
      lastPostTime: null,
      errors: [],
      postHistory: []
    }
  });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    // Forward status updates to all tabs and popup
    chrome.runtime.sendMessage(request).catch(() => {
      // Popup might be closed, ignore error
    });
    
    // Also send to all tabs in case multiple Twitter tabs are open
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
          chrome.tabs.sendMessage(tab.id, request).catch(() => {
            // Tab might not have content script loaded, ignore
          });
        }
      });
    });
    
    // Update storage with latest state if provided
    if (request.state) {
      chrome.storage.local.set({ autoPosterState: request.state });
    }
  } else if (request.action === 'moveCursor') {
    // Handle cursor movement request using native messaging
    console.log('🎯 Background script received cursor movement request');
    handleCursorMovement();
    sendResponse({ success: true, message: "Cursor movement initiated" });
    return true; // Keep message channel open for async response
  }
});

// Function to handle cursor movement using native messaging
function handleCursorMovement() {
  console.log('🖱️ Attempting to start cursor movement...');
  console.log('🆔 Current extension ID:', chrome.runtime.id);
  
  try {
    // Connect to native messaging host
    console.log('📡 Connecting to native messaging host: com.xautomation.cursormover');
    const port = chrome.runtime.connectNative('com.xautomation.cursormover');
    
    if (!port) {
      console.error('❌ Failed to create native messaging port');
      return;
    }
    
    console.log('✅ Native messaging port created successfully');
    
    // Handle disconnection FIRST (before sending message)
    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        console.error('❌ Native messaging connection failed:', chrome.runtime.lastError.message);
        console.error('💡 Error details:', chrome.runtime.lastError);
        console.error('🔧 This usually means:');
        console.error('   1. Extension ID mismatch in manifest');
        console.error('   2. Native messaging host not found');
        console.error('   3. Permission denied');
      } else {
        console.log('✅ Native messaging disconnected normally');
      }
    });
    
    // Handle response
    port.onMessage.addListener((response) => {
      console.log('📥 Received response from native host:', response);
      if (response.success) {
        console.log('✅ Cursor movement completed:', response.message);
      } else {
        console.error('❌ Cursor movement failed:', response.error);
      }
      port.disconnect();
    });
    
    // Send cursor movement request
    console.log('📤 Sending cursor movement request...');
    port.postMessage({ action: 'moveCursor' });
    
  } catch (error) {
    console.error("❌ Error setting up cursor movement:", error);
  }
}

// Clean up storage when extension is disabled/removed
chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.set({
    autoPosterState: {
      isRunning: false,
      currentPostCount: 0,
      totalPosts: 0,
      sessionStartTime: null,
      lastPostTime: null,
      errors: [],
      postHistory: []
    }
  });
});

// Keep service worker alive
chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Just a heartbeat to keep the service worker active
    console.log('Background service worker heartbeat');
  }
});