import { describe, expect, it } from 'vitest';
import { buildSaveMeta } from '../src/lib/save-meta';
import type { ThreadPayload } from '../src/types/thread';

const payload: ThreadPayload = {
  turns: [
    { role: 'user', html: '<p>Q</p>', plainText: 'What is TS?' },
    { role: 'ai', html: '<p>A</p>', plainText: 'Answer' },
  ],
  sourceUrl: 'https://www.google.com/search?q=ts&udm=50',
  extractedAt: '2026-06-18T12:00:00.000Z',
};

describe('save-meta', () => {
  it('builds meta from payload and custom filename', () => {
    const meta = buildSaveMeta(payload, 'custom-name');
    expect(meta.filename).toBe('custom-name');
    expect(meta.title).toBe('What is TS?');
    expect(meta.sourceUrl).toBe(payload.sourceUrl);
    expect(meta.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
