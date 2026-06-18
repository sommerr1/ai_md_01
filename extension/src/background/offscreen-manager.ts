export const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/offscreen.html';

export async function ensureOffscreenDocument(): Promise<void> {
  if (await chrome.offscreen.hasDocument()) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.DOM_PARSER],
    justification: 'File System Access API for saving Markdown files to Obsidian vault',
  });
}

export async function sendToOffscreen<T>(message: Record<string, unknown>): Promise<T> {
  await ensureOffscreenDocument();
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ ...message, __offscreen: true }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response as T);
    });
  });
}
