// Add this to the background.js temporarily to get the extension ID
console.log("Extension ID:", chrome.runtime.id);

// Or add this to popup.js
if (chrome && chrome.runtime && chrome.runtime.id) {
  console.log("🆔 Extension ID:", chrome.runtime.id);
} 