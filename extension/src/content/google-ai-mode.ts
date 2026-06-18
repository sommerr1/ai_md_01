import type { RuntimeMessage, StatusResponse } from '../types/messages';
import { countTurnNodes, detectAiMode } from '../lib/detection';

console.log('[ai-md] content script loaded');

function buildStatus(): StatusResponse {
  const aiMode = detectAiMode(location.href);
  const turnCount = aiMode ? countTurnNodes() : 0;
  return { type: 'STATUS_RESPONSE', aiMode, turnCount };
}

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (response: StatusResponse) => void) => {
    if (message.type === 'GET_STATUS') {
      sendResponse(buildStatus());
      return true;
    }
    return false;
  },
);
