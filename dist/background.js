// Background script for Twitter Auto Poster
chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitter Auto Poster extension installed');
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    // Forward status updates to popup if it's open
    chrome.runtime.sendMessage(request).catch(() => {
      // Popup might be closed, ignore error
    });
  }
});

// Clean up storage when extension is disabled/removed
chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.set({isAutoPosting: false});
});