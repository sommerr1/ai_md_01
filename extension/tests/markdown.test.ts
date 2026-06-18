import { describe, expect, it } from 'vitest';
import { buildDefaultFilename, sanitizeFilename } from '../src/lib/filename';
import { buildFrontmatter, formatLocalDate } from '../src/lib/frontmatter';
import { buildMarkdown, createTurndownService, turnToMarkdown } from '../src/lib/markdown';
import type { ThreadPayload } from '../src/types/thread';

const SAMPLE_AI_HTML = `
  <p><strong>TypeScript</strong> is a typed superset.</p>
  <pre><code class="language-python">print("hi")</code></pre>
  <table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>
  <p>See <a href="https://example.com">Example</a>.</p>
`;

describe('frontmatter', () => {
  it('emits ordered fields with quoted title and source_url', () => {
    const fm = buildFrontmatter({
      title: 'Hello "world"',
      date: '2026-06-18',
      source_url: 'https://google.com/search?q=test&udm=50',
    });
    expect(fm).toContain('title: "Hello \\"world\\""');
    expect(fm.indexOf('title:')).toBeLessThan(fm.indexOf('date:'));
    expect(fm.indexOf('date:')).toBeLessThan(fm.indexOf('source_url:'));
  });

  it('uses local date formatting', () => {
    expect(formatLocalDate(new Date(2026, 5, 18))).toBe('2026-06-18');
  });
});

describe('filename', () => {
  it('sanitizes invalid characters', () => {
    expect(sanitizeFilename('bad/name:test')).toBe('bad_name_test');
  });

  it('builds default filename from first user message and date', () => {
    const name = buildDefaultFilename('What is TypeScript?', new Date(2026, 5, 18));
    expect(name).toContain('What is TypeScript');
    expect(name).toContain('2026-06-18');
    expect(name.length).toBeLessThanOrEqual(80);
  });
});

describe('markdown', () => {
  it('renders User/AI sections with GFM features', () => {
    const td = createTurndownService();
    const userMd = turnToMarkdown({ role: 'user', html: '<p>Question?</p>', plainText: 'Question?' }, td);
    const aiMd = turnToMarkdown({ role: 'ai', html: SAMPLE_AI_HTML, plainText: 'answer' }, td);

    expect(userMd.startsWith('## User')).toBe(true);
    expect(aiMd.startsWith('## AI')).toBe(true);
    expect(aiMd).toMatch(/```python/);
    expect(aiMd).toMatch(/\| A \| B \|/);
    expect(aiMd).toMatch(/\[Example\]\(https:\/\/example\.com\)/);
  });

  it('buildMarkdown produces Obsidian-ready document', () => {
    const payload: ThreadPayload = {
      turns: [
        { role: 'user', html: '<p>What is TS?</p>', plainText: 'What is TS?' },
        { role: 'ai', html: SAMPLE_AI_HTML, plainText: 'TypeScript...' },
      ],
      sourceUrl: 'https://www.google.com/search?q=ts&udm=50',
      extractedAt: '2026-06-18T12:00:00.000Z',
    };

    const md = buildMarkdown(payload, {
      filename: 'What is TS 2026-06-18',
      sourceUrl: payload.sourceUrl,
      title: 'What is TS?',
      date: '2026-06-18',
    });

    expect(md.startsWith('---')).toBe(true);
    expect(md).toContain('## User');
    expect(md).toContain('## AI');
    expect(md).toContain('source_url:');
    expect(md).not.toMatch(/<img|<video/i);
  });
});
