import type { ThreadTurn } from '../types/thread';

export const SELECTOR_VERSION = 2;

export const USER_TURN_SELECTORS = [
  '[data-query-text]',
  '[data-user-query]',
] as const;

export const AI_TURN_SELECTORS = [
  'div.mZJni',
] as const;

export const TURN_SELECTORS = [
  ...USER_TURN_SELECTORS,
  ...AI_TURN_SELECTORS,
] as const;

export const FALLBACK_TURN_SELECTORS = [
  'div[role="complementary"] div.mZJni',
  '#center_col div.mZJni',
] as const;

export function findAimcRoot(root: Document | Element = document): Element | null {
  return root.querySelector('div[data-subtree="aimc"]');
}

export function findScrollRoot(root: Document | Element = document): Element | null {
  const aimc = findAimcRoot(root);
  if (aimc) {
    let el: Element | null = aimc;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return aimc;
  }

  const thread = root.querySelector('[data-session-thread-id]');
  if (thread?.parentElement) {
    let el: Element | null = thread.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 50) return el;
      el = el.parentElement;
    }
  }

  return root.querySelector('#center_col');
}

function hasCitationPill(el: Element): boolean {
  return !!el.querySelector('button[data-icl-uuid][data-amic="true"]');
}

function collectTurnCandidates(root: Element): Element[] {
  const seen = new Set<Element>();
  const nodes: Element[] = [];

  const selectorGroups = [TURN_SELECTORS, FALLBACK_TURN_SELECTORS];
  for (const group of selectorGroups) {
    for (const selector of group) {
      root.querySelectorAll(selector).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        nodes.push(el);
      });
    }
    if (nodes.length > 0) break;
  }

  return dedupeNestedNodes(nodes);
}

function dedupeNestedNodes(nodes: Element[]): Element[] {
  return nodes.filter(
    (node) => !nodes.some((other) => other !== node && other.contains(node)),
  );
}

function sortDocumentOrder(nodes: Element[]): Element[] {
  return [...nodes].sort((a, b) => {
    if (a === b) return 0;
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

export function inferTurnRole(element: Element): ThreadTurn['role'] {
  if (hasCitationPill(element) || element.matches('div.mZJni')) return 'ai';
  if (element.matches('[data-query-text], [data-user-query]')) return 'user';
  const tag = element.tagName.toLowerCase();
  if (['h1', 'h2', 'h3'].includes(tag) && !hasCitationPill(element)) return 'user';
  if (element.querySelector('div.mZJni')) return 'ai';
  return (element.textContent?.trim().length ?? 0) < 300 ? 'user' : 'ai';
}

export function sanitizeTurnHtml(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('img, video, figure, svg').forEach((node) => node.remove());
  clone.querySelectorAll('button[data-icl-uuid][data-amic="true"]').forEach((node) => node.remove());
  return clone.innerHTML;
}

function getExtractionContainer(root: Document | Element): Element {
  const fromAimc = findAimcRoot(root);
  if (fromAimc) return fromAimc;
  const center = root.querySelector('#center_col');
  if (center) return center;
  return root instanceof Element ? root : root.documentElement;
}

export function extractTurns(root: Document | Element = document): ThreadTurn[] {
  const container = getExtractionContainer(root);
  const candidates = sortDocumentOrder(collectTurnCandidates(container));

  return candidates.map((element) => ({
    role: inferTurnRole(element),
    html: sanitizeTurnHtml(element),
    plainText: element.textContent?.trim() ?? '',
  }));
}
