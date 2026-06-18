const MAX_LEN = 80;

export function buildDefaultFilename(_firstUserMessage: string, _date: Date): string {
  return 'untitled';
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LEN);
}
