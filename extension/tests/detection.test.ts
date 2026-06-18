import { describe, expect, it } from 'vitest';
import {
  AI_MODE_TAB_LABELS,
  countTurnNodes,
  detectAiMode,
  isAiModeDom,
  isAiModeUrl,
  isGoogleHost,
} from '../src/lib/detection';

describe('detection', () => {
  it('isGoogleHost matches google TLDs', () => {
    expect(isGoogleHost('https://www.google.com/search')).toBe(true);
    expect(isGoogleHost('https://www.google.ru/search')).toBe(true);
    expect(isGoogleHost('https://gemini.google.com/')).toBe(true);
    expect(isGoogleHost('https://example.com/')).toBe(false);
  });

  it('isAiModeUrl requires udm=50 on google host', () => {
    expect(isAiModeUrl('https://www.google.com/search?q=test&udm=50')).toBe(true);
    expect(isAiModeUrl('https://www.google.com/search?q=test')).toBe(false);
    expect(isAiModeUrl('https://gemini.google.com/?udm=50')).toBe(false);
  });

  it('isAiModeDom detects aimc subtree', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-subtree="aimc"><p>answer</p></div>';
    expect(isAiModeDom(root)).toBe(true);
  });

  it('isAiModeDom detects active AI Mode tab label', () => {
    const root = document.createElement('div');
    root.innerHTML = `<button role="tab" aria-selected="true">${AI_MODE_TAB_LABELS[0]}</button>`;
    expect(isAiModeDom(root)).toBe(true);
  });

  it('detectAiMode requires URL and DOM signals', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-subtree="aimc"></div>';
    const url = 'https://www.google.com/search?q=x&udm=50';
    expect(detectAiMode(url, root)).toBe(true);
    expect(detectAiMode('https://www.google.com/search?q=x', root)).toBe(false);
  });

  it('countTurnNodes counts known turn selectors', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-subtree="aimc">
        <div data-query-text>q1</div>
        <div class="mZJni">a1</div>
      </div>`;
    expect(countTurnNodes(root)).toBe(2);
  });
});
