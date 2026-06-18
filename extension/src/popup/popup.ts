import type { StatusResponse } from '../types/messages';

const statusEl = document.getElementById('status');
const saveBtn = document.getElementById('btn-save') as HTMLButtonElement | null;

async function refreshStatus(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    if (statusEl) statusEl.textContent = 'No active tab';
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  try {
    const response = (await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' })) as StatusResponse;
    const turns = response.turnCount ?? 0;
    if (statusEl) {
      statusEl.textContent = response.aiMode
        ? `AI Mode detected (${turns} turn${turns === 1 ? '' : 's'})`
        : 'Not Google AI Mode';
    }
    if (saveBtn) saveBtn.disabled = !response.aiMode || turns === 0;
  } catch {
    if (statusEl) statusEl.textContent = 'Not Google AI Mode';
    if (saveBtn) saveBtn.disabled = true;
  }
}

void refreshStatus();

document.getElementById('btn-save')?.addEventListener('click', () => {
  console.log('[ai-md] save clicked (scaffold)');
});
