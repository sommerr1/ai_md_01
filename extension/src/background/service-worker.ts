import { ensureOffscreenDocument, sendToOffscreen } from './offscreen-manager';
import { buildMarkdown } from '../lib/markdown';
import { debug } from '../lib/logger';
import { buildSaveMeta } from '../lib/save-meta';
import { getActiveGoogleTab, sendTabMessage } from '../lib/tab-messages';
import type { RuntimeMessage, SaveError, SaveErrorCode, StatusResponse } from '../types/messages';
import type { ThreadPayload } from '../types/thread';

console.log('[ai-md] service worker loaded');

let savingInProgress = false;

type ExtractResponse =
  | { type: 'THREAD_EXTRACTED'; payload: ThreadPayload }
  | { type: 'EXTRACT_ERROR'; code: string; message?: string };

type FolderStatusResponse = {
  type: 'FOLDER_STATUS';
  hasFolder: boolean;
  displayName?: string;
};

type WriteResponse =
  | { type: 'WRITE_SUCCESS'; filename: string }
  | { type: 'WRITE_ERROR'; code: string; message?: string };

function saveError(code: SaveErrorCode, message?: string): SaveError {
  return { type: 'SAVE_ERROR', code, message };
}

async function handleSaveRequest(
  filename: string,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  if (savingInProgress) {
    return saveError('TIMEOUT', 'Save already in progress');
  }

  savingInProgress = true;
  try {
    const tabId = sender.tab?.id ?? (await getActiveGoogleTab())?.id;
    if (!tabId) return saveError('NO_TAB', 'Active Google tab not found');

    const status = await sendTabMessage<StatusResponse>(tabId, { type: 'GET_STATUS' });
    if (!status?.aiMode) return saveError('NOT_AI_MODE');

    const folderStatus = await sendToOffscreen<FolderStatusResponse>({ type: 'GET_FOLDER_STATUS' });
    if (!folderStatus.hasFolder) return saveError('NO_FOLDER');

    const extractResponse = await sendTabMessage<ExtractResponse>(tabId, { type: 'EXTRACT_THREAD' });
    if (extractResponse.type === 'EXTRACT_ERROR') {
      const code: SaveErrorCode =
        extractResponse.code === 'EMPTY_THREAD' || extractResponse.code === 'DOM_CHANGED'
          ? extractResponse.code
          : 'DOM_CHANGED';
      return saveError(code, extractResponse.message);
    }

    const payload = extractResponse.payload;
    if (!payload.turns.length) return saveError('EMPTY_THREAD');

    const meta = buildSaveMeta(payload, filename);
    const content = buildMarkdown(payload, meta);
    debug('save pipeline built markdown', { filename: meta.filename, turns: payload.turns.length });

    const writeResponse = await sendToOffscreen<WriteResponse>({
      type: 'WRITE_FILE',
      filename: `${meta.filename}.md`,
      content,
    });

    if (writeResponse.type === 'WRITE_ERROR') {
      const code: SaveErrorCode =
        writeResponse.code === 'PERMISSION_DENIED' || writeResponse.code === 'NO_FOLDER'
          ? (writeResponse.code as SaveErrorCode)
          : 'UNKNOWN';
      return saveError(code, writeResponse.message);
    }

    return {
      type: 'SAVE_SUCCESS',
      filename: meta.filename,
      partial: payload.partial === true,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return saveError('TIMEOUT');
    }
    return saveError('DOM_CHANGED', err instanceof Error ? err.message : String(err));
  } finally {
    savingInProgress = false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ai-md] extension installed');
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage & { __offscreen?: boolean }, sender, sendResponse) => {
    if (message.__offscreen) return false;

    void (async () => {
      try {
        switch (message.type) {
          case 'GET_FOLDER_STATUS':
          case 'PICK_FOLDER':
            sendResponse(await sendToOffscreen(message as Record<string, unknown>));
            break;
          case 'SAVE_REQUEST':
            sendResponse(await handleSaveRequest(message.filename, sender));
            break;
          default:
            return;
        }
      } catch (err) {
        sendResponse(saveError('UNKNOWN', err instanceof Error ? err.message : String(err)));
      }
    })();

    return true;
  },
);
