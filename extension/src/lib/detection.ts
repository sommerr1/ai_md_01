export const AI_MODE_TAB_LABELS = ['AI Mode', 'Режим ИИ'] as const;

export const AIMc_SELECTORS = [
  'div[data-subtree="aimc"]',
  '[data-session-thread-id]',
] as const;

export function isGoogleHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === 'google.com' || host.endsWith('.google.com')) return true;
    return /^([a-z0-9-]+\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
  } catch {
    return false;
  }
}

export function isAiModeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!isGoogleHost(url)) return false;
    const host = parsed.hostname.toLowerCase();
    if (host.startsWith('gemini.')) return false;
    return parsed.searchParams.get('udm') === '50';
  } catch {
    return false;
  }
}

export function isAiModeDom(root: Document | Element = document): boolean {
  for (const selector of AIMc_SELECTORS) {
    if (root.querySelector(selector)) return true;
  }

  return AI_MODE_TAB_LABELS.some((label) =>
    Array.from(root.querySelectorAll('a, button, [role="tab"]')).some(
      (el) => el.textContent?.trim() === label && el.getAttribute('aria-selected') === 'true',
    ),
  );
}

export function detectAiMode(url: string, root: Document | Element = document): boolean {
  return isGoogleHost(url) && isAiModeUrl(url) && isAiModeDom(root);
}

export function countTurnNodes(root: Document | Element = document): number {
  const aimc = root.querySelector('div[data-subtree="aimc"]') ?? root;

  const selectors = [
    '[data-session-thread-id]',
    'div.mZJni',
    '[data-query-text]',
    '[data-user-query]',
  ];

  const seen = new Set<Element>();
  for (const selector of selectors) {
    aimc.querySelectorAll(selector).forEach((el) => seen.add(el));
  }

  if (seen.size > 0) return seen.size;

  return aimc.querySelectorAll('button[data-icl-uuid][data-amic="true"]').length > 0 ? 1 : 0;
}
