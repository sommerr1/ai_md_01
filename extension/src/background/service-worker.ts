import { sendToOffscreen } from './offscreen-manager';
import type { RuntimeMessage } from '../types/messages';

console.log('[ai-md] service worker loaded');

const OFFSCREEN_MESSAGE_TYPES = new Set<RuntimeMessage['type']>([
  'PICK_FOLDER',
  'GET_FOLDER_STATUS',
  'WRITE_FILE',
]);

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ai-md] extension installed');
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage & { __offscreen?: boolean }, sender, sendResponse) => {
  if (message.__offscreen) return false;

  if (!message?.type || !OFFSCREEN_MESSAGE_TYPES.has(message.type)) {
    return false;
  }

  if (sender.url?.includes('offscreen.html')) {
    return false;
  }

  void sendToOffscreen<unknown>(message as Record<string, unknown>)
    .then(sendResponse)
    .catch((err: unknown) => {
      sendResponse({
        type: 'WRITE_ERROR',
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : String(err),
      });
    });

  return true;
});
