document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const postCountSelect = document.getElementById('postCount');
  const intervalMinInput = document.getElementById('intervalMin');
  const intervalMaxInput = document.getElementById('intervalMax');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['groqApiKey', 'postCount', 'intervalMin', 'intervalMax'], function(result) {
    if (result.groqApiKey) {
      apiKeyInput.value = result.groqApiKey;
    }
    if (result.postCount) {
      postCountSelect.value = result.postCount;
    }
    if (result.intervalMin) {
      intervalMinInput.value = result.intervalMin;
    }
    if (result.intervalMax) {
      intervalMaxInput.value = result.intervalMax;
    }
  });

  // Check if auto posting is running
  chrome.storage.local.get(['isAutoPosting'], function(result) {
    if (result.isAutoPosting) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      showStatus('Auto posting is running...', 'info');
    }
  });

  startBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const postCount = parseInt(postCountSelect.value);
    const intervalMin = parseInt(intervalMinInput.value);
    const intervalMax = parseInt(intervalMaxInput.value);

    if (!apiKey) {
      showStatus('Please enter your Groq API key', 'error');
      return;
    }

    if (intervalMin >= intervalMax) {
      showStatus('Minimum interval must be less than maximum interval', 'error');
      return;
    }

    // Save settings
    chrome.storage.sync.set({
      groqApiKey: apiKey,
      postCount: postCount,
      intervalMin: intervalMin,
      intervalMax: intervalMax
    });

    // Start auto posting
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tab = tabs[0];
      
      if (!tab.url.includes('twitter.com') && !tab.url.includes('x.com')) {
        showStatus('Please navigate to Twitter/X first', 'error');
        return;
      }

      chrome.tabs.sendMessage(tab.id, {
        action: 'startAutoPosting',
        config: {
          apiKey: apiKey,
          postCount: postCount,
          intervalMin: intervalMin,
          intervalMax: intervalMax
        }
      }, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: Please refresh the Twitter page and try again', 'error');
          return;
        }
        
        if (response && response.success) {
          startBtn.disabled = true;
          stopBtn.disabled = false;
          showStatus(`Starting auto posting (${postCount} posts)...`, 'success');
          
          chrome.storage.local.set({isAutoPosting: true});
        } else {
          showStatus('Failed to start auto posting', 'error');
        }
      });
    });
  });

  stopBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'stopAutoPosting'}, function(response) {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        showStatus('Auto posting stopped', 'info');
        
        chrome.storage.local.set({isAutoPosting: false});
      });
    });
  });

  // Add test cursor button
  const testCursorBtn = document.getElementById('testCursorBtn');
  testCursorBtn.addEventListener('click', function() {
    showStatus('Testing cursor movement...', 'info');
    console.log('🖱️ Testing cursor movement from popup...');
    
    // Send message directly to background script
    chrome.runtime.sendMessage({action: 'moveCursor'}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('❌ Error from background:', chrome.runtime.lastError);
        showStatus('❌ Background script error: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('📥 Background response:', response);
        if (response && response.success) {
          showStatus('✅ Cursor movement test initiated!', 'success');
        } else {
          showStatus('⚠️ Test failed - check console', 'error');
        }
      }
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }

  // Listen for status updates from content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
      showStatus(request.message, request.type);
      
      if (request.finished) {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        chrome.storage.local.set({isAutoPosting: false});
      }
    }
  });
});