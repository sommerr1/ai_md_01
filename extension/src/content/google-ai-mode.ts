import type { RuntimeMessage, StatusResponse } from '../types/messages';
import type { ThreadPayload } from '../types/thread';
import { countTurnNodes, detectAiMode } from '../lib/detection';
import { ExtractError } from '../lib/extract-errors';
import { extractTurns, findScrollRoot } from '../lib/extractor';
import { scrollToTopUntilStable } from '../lib/scroller';

console.log('[ai-md] content script loaded');

function buildStatus(): StatusResponse {
  const aiMode = detectAiMode(location.href);
  const turnCount = aiMode ? countTurnNodes() : 0;
  return { type: 'STATUS_RESPONSE', aiMode, turnCount };
}

async function handleExtract(): Promise<ThreadPayload> {
  const scrollRoot = findScrollRoot();
  if (!scrollRoot) {
    throw new ExtractError('DOM_CHANGED', 'Scroll root not found');
  }

  await scrollToTopUntilStable(scrollRoot);
  const turns = extractTurns();

  if (turns.length === 0) {
    throw new ExtractError('EMPTY_THREAD', 'No turns found in thread');
  }

  return {
    turns,
    sourceUrl: location.href,
    extractedAt: new Date().toISOString(),
  };
}

chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    _sender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.type === 'GET_STATUS') {
      sendResponse(buildStatus());
      return true;
    }

    if (message.type === 'EXTRACT_THREAD') {
      void handleExtract()
        .then((payload) => sendResponse({ type: 'THREAD_EXTRACTED', payload }))
        .catch((err: unknown) => {
          if (err instanceof ExtractError) {
            sendResponse({ type: 'EXTRACT_ERROR', code: err.code, message: err.message });
            return;
          }
          sendResponse({ type: 'EXTRACT_ERROR', code: 'DOM_CHANGED', message: String(err) });
        });
      return true;
    }

    return false;
  },
);
