# DOM Spike — Google AI Mode

**Task:** KB-001  
**Date:** 2026-06-18  
**Status:** spike complete (selectors v1, fallback array)  
**Sources:** live DevTools research, cloro.dev, decodo.com, discoveredlabs.com

---

## 1. URL detection

| Signal | Value | Notes |
|--------|-------|-------|
| **Primary param** | `udm=50` | Universal Display Mode = AI Mode |
| **Optional** | `aep=11` | Additional AI Mode routing (not always present) |
| **Query** | `q=<text>` | Current / initial query |
| **Locale** | `hl`, `gl` | RU: `hl=ru&gl=ru`, EN: `hl=en&gl=us` |

**Examples:**

```
https://www.google.com/search?q=typescript+basics&udm=50
https://www.google.com/search?q=что+такое+typescript&udm=50&hl=ru&gl=ru
```

**Detection function (planned):**

```typescript
export function isAiModeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith('google.com') && u.searchParams.get('udm') === '50';
  } catch {
    return false;
  }
}
```

---

## 2. UI tab marker (RU / EN)

AI Mode tab in Google search navigation:

| Locale | Tab label | Selector strategy |
|--------|-----------|-------------------|
| EN | `AI Mode` | `a[href*="udm=50"]`, or link text match |
| RU | `Режим ИИ` | same + text heuristic |

**DOM heuristic:**

```javascript
const AI_MODE_LABELS = ['AI Mode', 'Режим ИИ'];
function isAiModeDom() {
  if (new URL(location.href).searchParams.get('udm') === '50') return true;
  return AI_MODE_LABELS.some(label =>
    [...document.querySelectorAll('a, button, [role="tab"]')]
      .some(el => el.textContent?.trim() === label && el.getAttribute('aria-selected') === 'true')
  );
}
```

---

## 3. Container & thread structure

### 3.1 Root containers (fallback chain)

| Priority | Selector | Purpose |
|----------|----------|---------|
| 1 | `div[data-subtree="aimc"]` | AI Mode content subtree (most stable attribute) |
| 2 | `[data-session-thread-id]` | Session thread anchor (cloro.dev) |
| 3 | `div[role="complementary"]` | Fallback layout variant |
| 4 | `#center_col` | Last resort within SERP shell |

### 3.2 Thread session

- Attribute: `data-session-thread-id` on inner thread node
- Parent chain holds turn blocks; streaming injects via `/async/folwr` into `data-container-id` targets

### 3.3 Turn nodes

Multi-turn layout (conversation after follow-ups):

| Role | Heuristic | Selectors / signals |
|------|-----------|---------------------|
| **user** | Repeated query echo / user bubble | `[data-query-text]`, `[data-user-query]`, elements with class patterns `*query*`, heading-like blocks before AI response |
| **ai** | Generated answer block | `div.mZJni` (observed Dec 2025–Jun 2026), blocks inside `aimc` with citation pills |

**Citation pills (AI blocks):**

```css
button[data-icl-uuid][data-amic="true"]
```

**Role detection algorithm (v1):**

1. Find scroll root → collect candidate turn blocks inside `aimc`
2. Blocks containing `[data-icl-uuid]` → `role: ai`
3. Blocks matching user query pattern (short text, no citations, often bold/heading) → `role: user`
4. Alternate order: user → ai → user → ai

---

## 4. Scroll root

| Priority | Selector | Notes |
|----------|----------|-------|
| 1 | `div[data-subtree="aimc"]` with `overflow: auto/scroll` | Primary scroll container |
| 2 | Closest scrollable ancestor of `[data-session-thread-id]` | `scrollHeight > clientHeight` |
| 3 | `#center_col` | SERP main column fallback |

**Find scroll root (spike snippet):**

```javascript
function findScrollRoot() {
  const aimc = document.querySelector('div[data-subtree="aimc"]');
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
  if (thread) {
    let el = thread.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 50) return el;
      el = el.parentElement;
    }
  }
  return document.documentElement;
}
```

---

## 5. Lazy load on scroll up

**Observed behavior:**

| Metric | Value |
|--------|-------|
| Initial stream delay | ~500 ms until first chunk |
| Full response stream | ~6.5 s (single turn) |
| Lazy history load after scroll up | **300–800 ms** before new nodes appear |
| Loading indicator | Height increase on scroll root; optional spinner inside `aimc` |
| Sentinel | `scrollHeight` growth without user input at `scrollTop === 0` |

**Scroll-up test protocol:**

1. Open AI Mode, run 3+ turn dialog
2. Scroll to bottom (latest turn)
3. Set `scrollTop = 0`, wait 500 ms, count turn nodes
4. Repeat scroll-up; record `performance.now()` delta until node count increases
5. Expected: new nodes within 800 ms (p95)

**Recommended scroller params (for KB-007):**

```typescript
{ maxIterations: 50, settleMs: 600, iterationDelayMs: 400 }
```

---

## 6. Extraction spike

Console script: `docs/spike/spike-extract.js` — paste in DevTools on AI Mode page.

**Exit criteria met:**

- [x] Selectors documented (scroll root, turns, roles, URL)
- [x] Console script extracts ≥1 turn with fallback chain
- [x] Lazy load protocol documented
- [x] RU + EN UI markers documented

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Class names change (`mZJni`) | Prefer `data-subtree`, `data-session-thread-id`; fallback array in extractor |
| A/B experiments | `SELECTOR_VERSION = 1`, log mismatch count |
| Streaming partial save | Document in PRD; optional `isStreaming` flag later |

---

## 8. Links

- Spike script: `docs/spike/spike-extract.js`
- PLAN Phase 0.1: `PLAN.md`
- Next: KB-006 detection, KB-007 scroll+extract
