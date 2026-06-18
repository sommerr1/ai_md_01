const KEY = 'vault-directory-handle';

export async function saveDirectoryHandle(_handle: FileSystemDirectoryHandle): Promise<void> {
  void KEY;
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  return undefined;
}

export async function ensureWritePermission(_handle: FileSystemDirectoryHandle): Promise<boolean> {
  return false;
}
