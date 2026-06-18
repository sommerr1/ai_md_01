# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.0.8] - 2026-06-18

### Added
- KB-008 Markdown pipeline: Turndown+GFM, `buildMarkdown`, YAML frontmatter, filename sanitization

## [0.0.7] - 2026-06-18

### Added
- KB-007 scroll + extract: `scrollToTopUntilStable`, `extractTurns`, `EXTRACT_THREAD` handler, `EXTRACT_ERROR` codes

## [0.0.6] - 2026-06-18

### Added
- KB-006 AI Mode detection: `detection.ts` (URL + DOM, RU/EN labels), content script `GET_STATUS`, popup enable/disable

## [0.0.5] - 2026-06-18

### Added
- KB-005 Offscreen + FSAA: `fsaa-storage.ts` (idb-keyval persist, write/overwrite), offscreen message handlers, SW proxy, vitest tests

## [0.0.4] - 2026-06-18

### Added
- KB-004 extension scaffold: MV3 + Vite + `@crxjs/vite-plugin`, TypeScript strict, stub src tree per PLAN §6
- `extension/npm run build` produces loadable `dist/`

## [0.0.3] - 2026-06-18

### Added
- KB-003 Turndown spike: sample HTML, `convert.mjs` (GFM + media/citation rules), `turndown-notes.md`, `output/sample.md`

## [0.0.2] - 2026-06-18

### Added
- KB-002 FSAA spike: `docs/spike/fsaa-notes.md`, interactive stub `docs/spike/fsaa-spike/` (IndexedDB persist, overwrite, Cyrillic filenames)

## [0.0.1] - 2026-06-18

### Added
- KB-001 DOM spike: `docs/spike/dom-notes.md` with URL patterns, selectors, scroll root, role heuristics (RU/EN)
- Console extraction script `docs/spike/spike-extract.js` for DevTools validation on AI Mode pages
