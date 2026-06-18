console.log('[ai-md] service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ai-md] extension installed');
});
