// Background service worker for Live Chess Cloud Extension
// Handles script injection into page context

chrome.runtime.onInstalled.addListener(() => {
  console.log('Live Chess Cloud Extension installed');
});

// Listen for messages from content script to inject interceptor
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectInterceptor') {
    if (!sender.tab || !sender.tab.id) {
      sendResponse({ success: false, error: 'No tab information' });
      return false;
    }
    
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['request-interceptor.js'],
      world: 'MAIN'
    }).then(() => {
      console.log('Live Chess Cloud: Request interceptor injected into page');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Live Chess Cloud: Failed to inject interceptor:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  return false;
});

