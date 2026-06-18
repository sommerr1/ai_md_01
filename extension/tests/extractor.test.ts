import { describe, expect, it, vi } from 'vitest';
import { extractTurns, inferTurnRole, sanitizeTurnHtml } from '../src/lib/extractor';
import { scrollToTopUntilStable } from '../src/lib/scroller';

function buildThreadHtml(turnCount: number): string {
  const parts: string[] = ['<div data-subtree="aimc">'];
  for (let i = 0; i < turnCount; i += 1) {
    if (i % 2 === 0) {
      parts.push(`<div data-query-text>User question ${i / 2 + 1}</div>`);
    } else {
      parts.push(
        `<div class="mZJni">AI answer ${(i + 1) / 2}<button data-icl-uuid="u${i}" data-amic="true">[1]</button></div>`,
      );
    }
  }
  parts.push('</div>');
  return parts.join('');
}

describe('extractor', () => {
  it('extracts 5 turns in user→ai order', () => {
    const root = document.createElement('div');
    root.innerHTML = buildThreadHtml(5);
    const turns = extractTurns(root);

    expect(turns).toHaveLength(5);
    expect(turns.map((t) => t.role)).toEqual(['user', 'ai', 'user', 'ai', 'user']);
    expect(turns[0].plainText).toContain('User question 1');
    expect(turns[1].plainText).toContain('AI answer 1');
  });

  it('collects user queries alongside ai blocks', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-subtree="aimc">
        <div data-query-text>First question</div>
        <div class="mZJni">First answer<button data-icl-uuid="1" data-amic="true">[1]</button></div>
        <div data-query-text>Second question</div>
        <div class="mZJni">Second answer<button data-icl-uuid="2" data-amic="true">[1]</button></div>
      </div>
    `;
    const turns = extractTurns(root);
    expect(turns.map((t) => t.role)).toEqual(['user', 'ai', 'user', 'ai']);
  });

  it('extracts 22 turns for lazy-load sized threads', () => {
    const root = document.createElement('div');
    root.innerHTML = buildThreadHtml(22);
    const turns = extractTurns(root);
    expect(turns).toHaveLength(22);
  });

  it('strips img, video, figure from html', () => {
    const el = document.createElement('div');
    el.innerHTML = '<p>text</p><img src="x"/><video></video><figure>f</figure>';
    const html = sanitizeTurnHtml(el);
    expect(html).not.toMatch(/<img|<video|<figure/i);
    expect(html).toContain('text');
  });

  it('infers ai role from citation pill', () => {
    const el = document.createElement('div');
    el.innerHTML = '<button data-icl-uuid="x" data-amic="true">[1]</button>';
    expect(inferTurnRole(el)).toBe('ai');
  });
});

describe('scroller', () => {
  it('scrollToTopUntilStable settles when height stable', async () => {
    const root = document.createElement('div');
    Object.defineProperty(root, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(root, 'scrollTop', { configurable: true, writable: true, value: 500 });
    root.scrollTop = 500;
    root.dispatchEvent = vi.fn();

    const result = await scrollToTopUntilStable(root, {
      settleMs: 50,
      iterationDelayMs: 20,
      timeoutMs: 2000,
    });

    expect(result.timedOut).toBe(false);
    expect(root.scrollTop).toBe(0);
  });
});
