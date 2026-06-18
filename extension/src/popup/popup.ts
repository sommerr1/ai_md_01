import type {
  PreviewResponse,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
  StatusResponse,
} from '../types/messages';

const statusEl = document.getElementById('status');
const folderStatusEl = document.getElementById('folder-status');
const saveBtn = document.getElementById('btn-save') as HTMLButtonElement;
const pickFolderBtn = document.getElementById('btn-pick-folder') as HTMLButtonElement;
const settingsBtn = document.getElementById('btn-settings') as HTMLButtonElement;
const settingsPanel = document.getElementById('settings-panel');
const filenameInput = document.getElementById('filename-input') as HTMLInputElement;
const spinnerEl = document.getElementById('spinner');
const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');

let activeTabId: number | undefined;
let aiModeEnabled = false;
let saving = false;
let settingsOpen = false;

const ERROR_MESSAGES: Record<SaveErrorCode, string> = {
  NOT_AI_MODE: 'Откройте Google AI Mode',
  NO_FOLDER: 'Выберите папку vault',
  NO_TAB: 'Нет активной вкладки Google',
  PERMISSION_DENIED: 'Выберите папку снова',
  EMPTY_THREAD: 'Нечего сохранять',
  DOM_CHANGED: 'Не удалось извлечь чат',
  TIMEOUT: 'Попробуйте ещё раз',
  UNKNOWN: 'Ошибка сохранения',
};

type PreviewResponseMsg = PreviewResponse & { type: 'PREVIEW_RESPONSE' };

function hideMessages(): void {
  errorEl?.classList.add('hidden');
  successEl?.classList.add('hidden');
}

function showError(code: SaveErrorCode, message?: string): void {
  if (!errorEl) return;
  errorEl.textContent = message ?? ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN;
  errorEl.classList.remove('hidden');
  successEl?.classList.add('hidden');
}

function showSuccess(text: string): void {
  if (!successEl) return;
  successEl.textContent = text;
  successEl.classList.remove('hidden');
  errorEl?.classList.add('hidden');
}

function setSettingsOpen(open: boolean): void {
  settingsOpen = open;
  settingsPanel?.classList.toggle('hidden', !open);
  settingsBtn?.setAttribute('aria-expanded', String(open));
}

function toggleSettings(): void {
  setSettingsOpen(!settingsOpen);
}

function setBusy(busy: boolean): void {
  saving = busy;
  spinnerEl?.classList.toggle('hidden', !busy);
  saveBtn.disabled = busy || !aiModeEnabled;
  pickFolderBtn.disabled = busy;
}

async function sendRuntime<T>(message: unknown): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>;
}

async function sendTab<T>(message: unknown): Promise<T> {
  if (!activeTabId) throw new Error('NO_TAB');
  return chrome.tabs.sendMessage(activeTabId, message) as Promise<T>;
}

async function refreshFolderStatus(): Promise<void> {
  try {
    const response = await sendRuntime<{ type: 'FOLDER_STATUS'; hasFolder: boolean; displayName?: string }>({
      type: 'GET_FOLDER_STATUS',
    });
    if (folderStatusEl) {
      folderStatusEl.textContent = response.hasFolder
        ? `Папка: ${response.displayName ?? 'выбрана'}`
        : 'Папка не выбрана';
    }
  } catch {
    if (folderStatusEl) folderStatusEl.textContent = 'Папка не выбрана';
  }
}

async function refreshDefaultFilename(): Promise<void> {
  if (!activeTabId || !aiModeEnabled) return;

  try {
    const preview = await sendTab<PreviewResponseMsg>({ type: 'GET_PREVIEW' });
    const defaultName = preview.defaultFilename ?? preview.firstMessage ?? 'untitled';
    if (!filenameInput.value.trim() || filenameInput.dataset.auto === 'true') {
      filenameInput.value = defaultName;
      filenameInput.dataset.auto = 'true';
    }
  } catch {
    // keep current filename
  }
}

async function refreshStatus(): Promise<void> {
  hideMessages();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;

  if (!activeTabId) {
    if (statusEl) statusEl.textContent = 'Нет активной вкладки';
    aiModeEnabled = false;
    saveBtn.disabled = true;
    return;
  }

  try {
    const response = await sendTab<StatusResponse>({ type: 'GET_STATUS' });
    const turns = response.turnCount ?? 0;
    aiModeEnabled = response.aiMode && turns > 0;
    if (statusEl) {
      statusEl.textContent = response.aiMode
        ? turns > 0
          ? `AI Mode (${turns} turn${turns === 1 ? '' : 's'})`
          : 'AI Mode (нет сообщений)'
        : 'Не Google AI Mode';
    }
    saveBtn.disabled = !aiModeEnabled || saving;
  } catch {
    aiModeEnabled = false;
    if (statusEl) statusEl.textContent = 'Не Google AI Mode';
    saveBtn.disabled = true;
  }

  await refreshFolderStatus();
  await refreshDefaultFilename();
}

async function onSaveClick(): Promise<void> {
  if (!aiModeEnabled || saving) return;
  hideMessages();

  const filename = filenameInput.value.trim();
  if (!filename) {
    showError('EMPTY_THREAD', 'Введите имя файла');
    return;
  }

  setBusy(true);

  try {
    const response = await sendRuntime<SaveSuccess | SaveError>({
      type: 'SAVE_REQUEST',
      filename,
    });

    if (response.type === 'SAVE_ERROR') {
      showError(response.code as SaveErrorCode, response.message);
      if (response.code === 'NO_FOLDER') {
        setSettingsOpen(true);
        await pickFolder();
      }
      return;
    }

    const suffix = response.partial ? ' (частично)' : '';
    showSuccess(`Сохранено: ${response.filename}.md${suffix}`);
  } catch {
    showError('TIMEOUT');
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function pickFolder(): Promise<void> {
  if (saving) return;
  hideMessages();
  setBusy(true);
  try {
    await sendRuntime({ type: 'PICK_FOLDER' });
    await refreshFolderStatus();
  } catch {
    showError('PERMISSION_DENIED');
  } finally {
    setBusy(false);
  }
}

settingsBtn.addEventListener('click', () => toggleSettings());
saveBtn.addEventListener('click', () => void onSaveClick());
pickFolderBtn.addEventListener('click', () => void pickFolder());

filenameInput.addEventListener('input', () => {
  filenameInput.dataset.auto = 'false';
});

filenameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    void onSaveClick();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    setSettingsOpen(false);
    filenameInput.blur();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsOpen) {
    setSettingsOpen(false);
  }
});

void refreshStatus();
