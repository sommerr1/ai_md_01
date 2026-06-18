import type { RuntimeMessage, StatusResponse } from '../types/messages';
import type { ThreadPayload } from '../types/thread';
import { countTurnNodes, detectAiMode } from '../lib/detection';
import { ExtractError } from '../lib/extract-errors';
import { extractTurns, findScrollRoot } from '../lib/extractor';
import { buildDefaultFilename } from '../lib/filename';
import { scrollToTopUntilStable } from '../lib/scroller';

console.log('[ai-md] content script loaded');

function buildStatus(): StatusResponse {
  const aiMode = detectAiMode(location.href);
  const turnCount = aiMode ? countTurnNodes() : 0;
  return { type: 'STATUS_RESPONSE', aiMode, turnCount };
}

function buildPreview() {
  const turns = extractTurns();
  const firstUser = turns.find((turn) => turn.role === 'user');
  const firstMessage = firstUser?.plainText ?? '';
  return {
    type: 'PREVIEW_RESPONSE' as const,
    firstMessage,
    defaultFilename: firstMessage ? buildDefaultFilename(firstMessage, new Date()) : undefined,
  };
}

async function handleExtract(): Promise<ThreadPayload> {
  const scrollRoot = findScrollRoot();
  if (!scrollRoot) {
    throw new ExtractError('DOM_CHANGED', 'Scroll root not found');
  }

  const scrollResult = await scrollToTopUntilStable(scrollRoot);
  const turns = extractTurns();

  if (turns.length === 0) {
    throw new ExtractError('EMPTY_THREAD', 'No turns found in thread');
  }

  return {
    turns,
    sourceUrl: location.href,
    extractedAt: new Date().toISOString(),
    partial: scrollResult.partial,
  };
}

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (response: unknown) => void) => {
    if (message.type === 'GET_STATUS') {
      sendResponse(buildStatus());
      return true;
    }

    if (message.type === 'GET_PREVIEW') {
      sendResponse(buildPreview());
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
