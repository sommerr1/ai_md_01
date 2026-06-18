import { formatLocalDate } from './frontmatter';

export const MAX_FILENAME_LEN = 80;

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_FILENAME_LEN);
}

export function buildDefaultFilename(firstUserMessage: string, date: Date): string {
  const datePart = formatLocalDate(date);
  const suffix = ` ${datePart}`;
  const maxBaseLen = MAX_FILENAME_LEN - suffix.length;
  const base = sanitizeFilename(firstUserMessage.replace(/\.md$/i, '')) || 'untitled';
  return sanitizeFilename(`${base.slice(0, Math.max(maxBaseLen, 1))}${suffix}`);
}
