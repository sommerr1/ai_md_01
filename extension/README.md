# Google AI Mode → Obsidian

## Build

```powershell
npm install
npm run build
npm test
```

## Sideload (Chrome / Edge)

1. `npm run build`
2. Open `chrome://extensions` or `edge://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select `extension/dist/`

## Usage

1. Open Google Search AI Mode (`udm=50`)
2. Click extension icon → **Изменить папку** (first time)
3. **Сохранить** → confirm filename → wait for spinner

## Debug

Set `debug: true` in `chrome.storage.local` to enable verbose logs (no content logged by default).
