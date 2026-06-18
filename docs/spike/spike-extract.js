/**
 * KB-001 DOM spike — run in DevTools console on Google AI Mode page (udm=50).
 * Usage: copy-paste entire file, then check output: window.__AI_MODE_SPIKE__
 */
(function aiModeSpikeExtract() {
  const AI_MODE_LABELS = ['AI Mode', 'Режим ИИ'];

  function isAiModeUrl() {
    try {
      return new URL(location.href).searchParams.get('udm') === '50';
    } catch {
      return false;
    }
  }

  function isAiModeDom() {
    if (isAiModeUrl()) return true;
    return AI_MODE_LABELS.some((label) =>
      [...document.querySelectorAll('a, button, [role="tab"]')].some(
        (el) => el.textContent?.trim() === label && el.getAttribute('aria-selected') === 'true',
      ),
    );
  }

  function findAimcRoot() {
    return document.querySelector('div[data-subtree="aimc"]');
  }

  function findScrollRoot() {
    const aimc = findAimcRoot();
    if (aimc) {
      let el = aimc;
      while (el && el !== document.body) {
        const s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el;
        el = el.parentElement;
      }
      return aimc;
    }
    const thread = document.querySelector('[data-session-thread-id]');
    if (thread?.parentElement) {
      let el = thread.parentElement;
      while (el) {
        if (el.scrollHeight > el.clientHeight + 50) return el;
        el = el.parentElement;
      }
    }
    return document.documentElement;
  }

  function hasCitationPill(el) {
    return !!el.querySelector('button[data-icl-uuid][data-amic="true"]');
  }

  function collectTurnCandidates(root) {
    const selectors = [
      '[data-session-thread-id]',
      'div.mZJni',
      '[data-query-text]',
      '[data-user-query]',
    ];
    const seen = new Set();
    const nodes = [];

    for (const sel of selectors) {
      root.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        nodes.push(el);
      });
    }

    if (nodes.length === 0) {
      root.querySelectorAll('div, section, article').forEach((el) => {
        const text = el.innerText?.trim() ?? '';
        if (text.length < 20 || text.length > 20000) return;
        if (el.querySelector('div.mZJni') && el !== root) return;
        if (seen.has(el)) return;
        const childHasText = [...el.children].some((c) => (c.innerText?.trim().length ?? 0) > 30);
        if (childHasText && !hasCitationPill(el)) return;
        seen.add(el);
        nodes.push(el);
      });
    }

    return nodes;
  }

  function inferRole(el) {
    if (hasCitationPill(el) || el.matches('div.mZJni')) return 'ai';
    if (el.matches('[data-query-text], [data-user-query]')) return 'user';
    const tag = el.tagName.toLowerCase();
    if (['h1', 'h2', 'h3'].includes(tag) && !hasCitationPill(el)) return 'user';
    if (el.querySelector('div.mZJni')) return 'ai';
    return el.innerText?.length < 300 ? 'user' : 'ai';
  }

  function extractTurns() {
    const root = findAimcRoot() ?? document.querySelector('#center_col') ?? document.body;
    const candidates = collectTurnCandidates(root);
    return candidates.map((el) => ({
      role: inferRole(el),
      plainText: el.innerText?.trim().slice(0, 500) ?? '',
      htmlLength: el.innerHTML?.length ?? 0,
      selector: el.matches('div.mZJni')
        ? 'div.mZJni'
        : el.getAttribute('data-session-thread-id')
          ? '[data-session-thread-id]'
          : el.tagName.toLowerCase(),
    }));
  }

  async function measureLazyLoad(scrollRoot, samples = 3) {
    const delays = [];
    for (let i = 0; i < samples; i++) {
      const before = extractTurns().length;
      const t0 = performance.now();
      scrollRoot.scrollTop = 0;
      scrollRoot.dispatchEvent(new Event('scroll', { bubbles: true }));
      let after = before;
      while (performance.now() - t0 < 2000) {
        await new Promise((r) => setTimeout(r, 100));
        after = extractTurns().length;
        if (after > before) break;
      }
      if (after > before) delays.push(Math.round(performance.now() - t0));
    }
    return { samples: delays, avgMs: delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null };
  }

  const scrollRoot = findScrollRoot();
  const result = {
    url: location.href,
    isAiModeUrl: isAiModeUrl(),
    isAiModeDom: isAiModeDom(),
    aimcFound: !!findAimcRoot(),
    scrollRoot: {
      tag: scrollRoot.tagName,
      scrollHeight: scrollRoot.scrollHeight,
      clientHeight: scrollRoot.clientHeight,
    },
    turns: extractTurns(),
    turnCount: extractTurns().length,
  };

  window.__AI_MODE_SPIKE__ = result;
  console.log('[KB-001 spike]', result);

  measureLazyLoad(scrollRoot).then((lazy) => {
    result.lazyLoad = lazy;
    console.log('[KB-001 lazy load]', lazy);
  });

  return result;
})();
