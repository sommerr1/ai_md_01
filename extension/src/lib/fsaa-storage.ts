import { get, set } from 'idb-keyval';

export const VAULT_HANDLE_KEY = 'vault-directory-handle';

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await set(VAULT_HANDLE_KEY, handle);
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  const handle = await get<FileSystemDirectoryHandle>(VAULT_HANDLE_KEY);
  return handle ?? undefined;
}

export async function ensureWritePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const query = await handle.queryPermission({ mode: 'readwrite' });
  if (query === 'granted') return true;
  const request = await handle.requestPermission({ mode: 'readwrite' });
  return request === 'granted';
}

export async function writeFileToDirectory(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string,
): Promise<void> {
  const allowed = await ensureWritePermission(dirHandle);
  if (!allowed) throw new Error('PERMISSION_DENIED');

  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
