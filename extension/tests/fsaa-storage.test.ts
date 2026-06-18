import { describe, expect, it, vi } from 'vitest';
import { writeFileToDirectory, ensureWritePermission } from '../src/lib/fsaa-storage';

describe('fsaa-storage', () => {
  it('ensureWritePermission returns true when granted', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
      requestPermission: vi.fn(),
    } as unknown as FileSystemDirectoryHandle;

    await expect(ensureWritePermission(handle)).resolves.toBe(true);
    expect(handle.requestPermission).not.toHaveBeenCalled();
  });

  it('writeFileToDirectory throws PERMISSION_DENIED when not granted', async () => {
    const handle = {
      queryPermission: vi.fn().mockResolvedValue('prompt'),
      requestPermission: vi.fn().mockResolvedValue('denied'),
    } as unknown as FileSystemDirectoryHandle;

    await expect(writeFileToDirectory(handle, 'test.md', 'x')).rejects.toThrow('PERMISSION_DENIED');
  });

  it('writeFileToDirectory overwrites file via createWritable', async () => {
    const writable = { write: vi.fn(), close: vi.fn() };
    const fileHandle = {
      createWritable: vi.fn().mockResolvedValue(writable),
    };
    const dirHandle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
      getFileHandle: vi.fn().mockResolvedValue(fileHandle),
    } as unknown as FileSystemDirectoryHandle;

    await writeFileToDirectory(dirHandle, 'note.md', '# hello');

    expect(dirHandle.getFileHandle).toHaveBeenCalledWith('note.md', { create: true });
    expect(writable.write).toHaveBeenCalledWith('# hello');
    expect(writable.close).toHaveBeenCalled();
  });
});
