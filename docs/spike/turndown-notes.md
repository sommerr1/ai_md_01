# Turndown Spike — HTML → Markdown

**Task:** KB-003  
**Date:** 2026-06-18  
**Status:** spike complete  
**Refs:** `PLAN.md` Phase 0.3

---

## 1. Artifacts

| Path | Purpose |
|------|---------|
| `docs/spike/turndown-spike/sample-ai-response.html` | Synthetic AI response HTML |
| `docs/spike/turndown-spike/convert.mjs` | Turndown + GFM + custom rules |
| `docs/spike/turndown-spike/output/sample.md` | Generated Obsidian-ready MD |

**Run:**

```powershell
cd docs/spike/turndown-spike
npm install
npm run convert
```

---

## 2. Turndown config (→ extension `markdown.ts`)

```javascript
TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  + turndown-plugin-gfm
  + remove: img, video, svg
  + remove: button[data-icl-uuid][data-amic]  (citation pills)
```

---

## 3. Conversion matrix

| Element | Result | Quality |
|---------|--------|---------|
| Nested lists | `-` bullets, 4-space indent | ✅ Good |
| Fenced code + language | ` ```typescript ` preserved | ✅ Good |
| Inline code | backticks | ✅ Good |
| Links | `[text](url)` | ✅ Good |
| GFM tables | pipe table | ✅ Good |
| **Bold** | `**text**` | ✅ Good |
| Headings | `##` atx | ✅ Good |
| img / video / svg | removed | ✅ By design |
| Citation pills | removed | ✅ v1 (no inline cite export) |
| Strikethrough | `~text~` (single tilde) | ⚠️ Minor — Obsidian accepts; prefer `~~` in KB-008 if needed |
| Task lists | `- [x]` / `- [ ]` | ✅ Good |
| Empty lines after media strip | extra blank lines | ⚠️ Minor — trim in KB-008 |

**Critical artifacts:** none — output readable in Obsidian.

---

## 4. DoD

- [x] Sample HTML → Turndown + GFM
- [x] Losses documented (strikethrough tilde, blank lines after media)
- [x] Custom rule: remove img, video, svg
- [x] Output readable in Obsidian

---

## 5. KB-008 follow-ups

1. Post-process: collapse 3+ newlines → 2
2. Optional: strikethrough rule `~~` for Obsidian parity
3. Strip wrapper divs from Google DOM before turndown
4. Unit tests on `sample-ai-response.html` + 2–3 real snapshots

---

## 6. Sample output excerpt

See `docs/spike/turndown-spike/output/sample.md`.
