import type { RuntimeMessage } from '../types/messages';
import {
  loadDirectoryHandle,
  saveDirectoryHandle,
  writeFileToDirectory,
} from '../lib/fsaa-storage';

console.log('[ai-md] offscreen document loaded');

const OFFSCREEN_TYPES = new Set(['PICK_FOLDER', 'GET_FOLDER_STATUS', 'WRITE_FILE']);

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage & { __offscreen?: boolean }, sender, sendResponse: (response: unknown) => void) => {
    const fromOffscreen = sender.url?.includes('offscreen.html');
    const routed = message.__offscreen === true;
    if (!routed && fromOffscreen) return false;
    if (!routed && !OFFSCREEN_TYPES.has(message.type)) return false;
    if (routed && fromOffscreen) return false;

    void handleOffscreenMessage(message)
      .then(sendResponse)
      .catch((err: unknown) => {
        const code = err instanceof Error && err.message === 'PERMISSION_DENIED'
          ? 'PERMISSION_DENIED'
          : 'UNKNOWN';
        sendResponse({ type: 'WRITE_ERROR', code, message: String(err) });
      });
    return true;
  },
);

async function handleOffscreenMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case 'PICK_FOLDER':
      return pickFolder();
    case 'GET_FOLDER_STATUS':
      return getFolderStatus();
    case 'WRITE_FILE':
      return writeFile(message.filename, message.content);
    default:
      return undefined;
  }
}

async function pickFolder(): Promise<{ type: 'FOLDER_SET'; displayName: string }> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('FSAA_NOT_SUPPORTED');
  }
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  await saveDirectoryHandle(handle);
  return { type: 'FOLDER_SET', displayName: handle.name };
}

async function getFolderStatus(): Promise<{
  type: 'FOLDER_STATUS';
  hasFolder: boolean;
  displayName?: string;
}> {
  const handle = await loadDirectoryHandle();
  if (!handle) {
    return { type: 'FOLDER_STATUS', hasFolder: false };
  }
  return { type: 'FOLDER_STATUS', hasFolder: true, displayName: handle.name };
}

async function writeFile(
  filename: string,
  content: string,
): Promise<{ type: 'WRITE_SUCCESS'; filename: string } | { type: 'WRITE_ERROR'; code: string }> {
  const handle = await loadDirectoryHandle();
  if (!handle) {
    return { type: 'WRITE_ERROR', code: 'NO_FOLDER' };
  }

  try {
    await writeFileToDirectory(handle, filename, content);
    return { type: 'WRITE_SUCCESS', filename };
  } catch (err) {
    if (err instanceof Error && err.message === 'PERMISSION_DENIED') {
      return { type: 'WRITE_ERROR', code: 'PERMISSION_DENIED' };
    }
    throw err;
  }
}
