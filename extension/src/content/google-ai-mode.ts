import type { RuntimeMessage } from '../types/messages';

console.log('[ai-md] content script loaded');

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: unknown) => void) => {
    if (message.type === 'GET_STATUS') {
      sendResponse({ type: 'STATUS_RESPONSE', aiMode: false, turnCount: 0 });
      return true;
    }
    return false;
  },
);
