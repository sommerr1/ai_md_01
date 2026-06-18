# Google AI Mode → Obsidian Saver

Chrome/Edge MV3 extension: save Google Search AI Mode chats to Obsidian vault as Markdown.

## Quick start

```powershell
cd extension
npm install
npm run build
npm test
```

Load unpacked: `chrome://extensions` → Developer mode → **Load unpacked** → `extension/dist/`

## MVP scope

- Google AI Mode detection (RU/EN), full thread auto-scroll + extract
- YAML frontmatter + GFM markdown
- File System Access API (flat save to vault folder)
- Popup: save, rename, folder picker

## Privacy

All processing is local. No content is sent to external servers.

## Docs

- [Manual test matrix](docs/manual-test-matrix.md)
- [MVP verification](docs/MVP-VERIFICATION.md)
- [PLAN.md](PLAN.md)
