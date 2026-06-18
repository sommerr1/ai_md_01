let debugEnabled = false;

void chrome.storage.local.get('debug').then((result) => {
  debugEnabled = result.debug === true;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.debug) {
    debugEnabled = changes.debug.newValue === true;
  }
});

export function debug(...args: unknown[]): void {
  if (!debugEnabled) return;
  console.debug('[ai-md]', ...args);
}

export function isDebugEnabled(): boolean {
  return debugEnabled;
}
