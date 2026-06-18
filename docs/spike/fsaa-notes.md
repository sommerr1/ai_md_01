# FSAA Spike — File System Access API

**Task:** KB-002  
**Date:** 2026-06-18  
**Status:** spike complete  
**Refs:** `PLAN.md` Phase 0.2

---

## 1. Goal

Подтвердить: `showDirectoryPicker` → persist `FileSystemDirectoryHandle` в IndexedDB → write/overwrite после reload/restart.

---

## 2. Spike artifact

| Path | Purpose |
|------|---------|
| `docs/spike/fsaa-spike/index.html` | UI: pick, write, append, overwrite, cyrillic |
| `docs/spike/fsaa-spike/app.js` | IndexedDB + FSAA logic |

**Запуск:**

```powershell
cd docs/spike/fsaa-spike
npx --yes serve .
# → http://localhost:3000
```

Требования: Chrome/Edge 109+, secure context (localhost).

---

## 3. API flow (validated design)

```
showDirectoryPicker({ mode: 'readwrite' })
  → indexedDB.put(handle, 'vault-directory-handle')
  → [reload page / restart browser]
  → indexedDB.get('vault-directory-handle')
  → handle.queryPermission({ mode: 'readwrite' })
  → handle.requestPermission({ mode: 'readwrite' })  // if prompt
  → handle.getFileHandle(name, { create: true })
  → fileHandle.createWritable() → write → close()
```

**Overwrite:** `createWritable()` без append — полная замена содержимого.

**Append:** read existing via `getFile().text()`, concat, write.

---

## 4. DoD checklist

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Pick → write `test.md` → reload → read handle → append/overwrite | ✅ | IndexedDB store `kb002-fsaa-spike` |
| 2 | `queryPermission` / `requestPermission` после restart | ✅ | Кнопка «Check permission» + auto on load |
| 3 | Overwrite via `getFileHandle` + `createWritable` | ✅ | Кнопка «Overwrite test.md» |
| 4 | Кириллица в имени файла (Windows) | ✅ | `тест-файл.md` |

---

## 5. Manual test protocol

1. `npx serve` → открыть spike page
2. **Pick folder** → выбрать vault-папку
3. **Write test.md** → проверить файл в проводнике
4. **F5 reload** → status «Handle восстановлен», permission=granted
5. **Append** → файл дополнен
6. **Overwrite** → файл заменён целиком
7. **Write тест-файл.md** → кириллическое имя OK
8. **Restart Chrome** → reopen localhost → **Check permission** → write без picker (если permission valid)

---

## 6. Findings for extension (KB-005)

| Topic | Decision |
|-------|----------|
| Storage key | `vault-directory-handle` (→ `idb-keyval` in extension) |
| Permission | Always `ensureWritePermission` before write |
| Overwrite | `getFileHandle(name, { create: true })` + truncate write |
| Offscreen | FSAA only in offscreen document (SW has no FSAA) |
| Cyrillic filenames | Supported on Windows FSAA |

---

## 7. Links

- Spike UI: `docs/spike/fsaa-spike/`
- Next: KB-004 scaffold, KB-005 offscreen + `fsaa-storage.ts`
