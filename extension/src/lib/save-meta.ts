import { buildDefaultFilename, sanitizeFilename } from './filename';
import { formatLocalDate } from './frontmatter';
import { buildTitleFromPayload } from './markdown';
import type { SaveMeta, ThreadPayload } from '../types/thread';

export function buildSaveMeta(payload: ThreadPayload, filenameInput?: string): SaveMeta {
  const date = new Date();
  const title = buildTitleFromPayload(payload);
  const filename = sanitizeFilename(
    filenameInput?.replace(/\.md$/i, '') || buildDefaultFilename(title, date),
  );

  return {
    filename,
    sourceUrl: payload.sourceUrl,
    title,
    date: formatLocalDate(date),
  };
}
