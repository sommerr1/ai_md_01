/**
 * KB-002 FSAA spike — IndexedDB persist + overwrite.
 * Requires secure context (localhost/https) and user gesture for picker.
 */

const DB_NAME = 'kb002-fsaa-spike';
const STORE = 'handles';
const HANDLE_KEY = 'vault-directory-handle';

const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');

function log(msg, ok = true) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  logEl.textContent = line + logEl.textContent;
  console.log(msg);
  return ok;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandle(handle) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(HANDLE_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function ensureWritePermission(handle) {
  const q = await handle.queryPermission({ mode: 'readwrite' });
  if (q === 'granted') return true;
  const r = await handle.requestPermission({ mode: 'readwrite' });
  return r === 'granted';
}

async function writeFile(handle, filename, content, append = false) {
  const ok = await ensureWritePermission(handle);
  if (!ok) throw new Error('PERMISSION_DENIED');

  const fileHandle = await handle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();

  if (append) {
    const existing = await fileHandle.getFile();
    const prev = await existing.text();
    await writable.write(prev + content);
  } else {
    await writable.write(content);
  }
  await writable.close();
  return filename;
}

async function refreshStatus() {
  if (!('showDirectoryPicker' in window)) {
    statusEl.innerHTML = '<span class="err">File System Access API недоступен (нужен Chrome/Edge + localhost).</span>';
    return;
  }

  const handle = await loadHandle();
  if (!handle) {
    statusEl.textContent = 'Папка не выбрана. Нажмите «Pick folder».';
    return;
  }

  const perm = await handle.queryPermission({ mode: 'readwrite' });
  const name = handle.name ?? '(unknown)';
  statusEl.innerHTML = `<span class="ok">Handle восстановлен из IndexedDB: «${name}», permission=${perm}</span>`;
}

document.getElementById('btn-pick').addEventListener('click', async () => {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await saveHandle(handle);
    log(`Saved handle: ${handle.name}`);
    await refreshStatus();
  } catch (e) {
    log(`Pick failed: ${e.message}`, false);
  }
});

document.getElementById('btn-write').addEventListener('click', async () => {
  try {
    const handle = await loadHandle();
    if (!handle) return log('No handle — pick folder first', false);
    const content = `# FSAA spike\n\nCreated: ${new Date().toISOString()}\n`;
    await writeFile(handle, 'test.md', content);
    log('Wrote test.md (create)');
  } catch (e) {
    log(`Write failed: ${e.message}`, false);
  }
});

document.getElementById('btn-append').addEventListener('click', async () => {
  try {
    const handle = await loadHandle();
    if (!handle) return log('No handle', false);
    await writeFile(handle, 'test.md', `\nAppended: ${new Date().toISOString()}\n`, true);
    log('Appended to test.md');
  } catch (e) {
    log(`Append failed: ${e.message}`, false);
  }
});

document.getElementById('btn-overwrite').addEventListener('click', async () => {
  try {
    const handle = await loadHandle();
    if (!handle) return log('No handle', false);
    const content = `# Overwritten\n\n${new Date().toISOString()}\n`;
    await writeFile(handle, 'test.md', content, false);
    log('Overwrote test.md via getFileHandle + createWritable');
  } catch (e) {
    log(`Overwrite failed: ${e.message}`, false);
  }
});

document.getElementById('btn-cyrillic').addEventListener('click', async () => {
  try {
    const handle = await loadHandle();
    if (!handle) return log('No handle', false);
    const name = 'тест-файл.md';
    await writeFile(handle, name, `# Кириллица\n\nИмя файла: ${name}\n`);
    log(`Wrote ${name} (Cyrillic filename)`);
  } catch (e) {
    log(`Cyrillic write failed: ${e.message}`, false);
  }
});

document.getElementById('btn-perm').addEventListener('click', async () => {
  try {
    const handle = await loadHandle();
    if (!handle) return log('No handle', false);
    const q = await handle.queryPermission({ mode: 'readwrite' });
    log(`queryPermission=${q}`);
    if (q !== 'granted') {
      const r = await handle.requestPermission({ mode: 'readwrite' });
      log(`requestPermission=${r}`);
    }
    await refreshStatus();
  } catch (e) {
    log(`Permission check failed: ${e.message}`, false);
  }
});

refreshStatus().catch((e) => log(e.message, false));
