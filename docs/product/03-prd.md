# PRD — Google AI Mode → Obsidian Saver

**Версия:** 1.0  
**Статус:** Approved (post grill)  
**Платформа:** Chrome, Edge (Manifest V3)

---

## 1. Overview

### 1.1 Summary

Расширение сохраняет полный текстовый тред из **Google Search AI Mode** в выбранную папку Obsidian vault в формате Markdown.

### 1.2 Goals

- Сократить время архивации AI-диалога с ~10 мин до < 30 сек (включая автоскролл).
- Обеспечить совместимость с Obsidian: frontmatter, секции User/AI, стандартный MD.

### 1.3 Non-goals (v1)

- Gemini, AI Overviews, обычный Google Search
- Медиа (изображения, видео)
- Облачная синхронизация, аккаунты, аналитика контента

---

## 2. User Personas

### Persona A — «Исследователь в Obsidian»

- Использует Google AI Mode для deep research
- Ведёт vault с проектными заметками
- Хочет один клик → файл в нужной папке

### Persona B — «Аналитик с повторными сессиями»

- Возвращается к тому же чату и обновляет сохранённый файл
- Ожидает перезапись при том же имени файла

---

## 3. Functional Requirements

### FR-1: AI Mode Detection

| ID | Requirement |
|----|-------------|
| FR-1.1 | Расширение активно только на `google.com` / `google.<tld>` в режиме AI Mode |
| FR-1.2 | Детекция по URL-паттерну + наличию UI-маркера («Режим ИИ» / «AI Mode») |
| FR-1.3 | Вне AI Mode кнопка Save **disabled**, без toast/уведомлений |

### FR-2: Content Extraction

| ID | Requirement |
|----|-------------|
| FR-2.1 | Извлекать **весь тред** — все turn'ы user + AI в сессии |
| FR-2.2 | Перед извлечением выполнить **автоскролл вверх** до загрузки всей истории |
| FR-2.3 | Пропускать изображения и видео; сохранять только текстовый контент |
| FR-2.4 | Сохранять ссылки как Markdown `[text](url)` |

### FR-3: Markdown Conversion

| ID | Requirement |
|----|-------------|
| FR-3.1 | Формат файла: `.md` с YAML frontmatter |
| FR-3.2 | Frontmatter fields: `title`, `date`, `source_url` |
| FR-3.3 | Каждый turn: секция `## User` или `## AI` |
| FR-3.4 | Поддержка: заголовки, списки, bold/italic, code blocks (с language tag если есть), таблицы |

**Пример выходного файла:**

```markdown
---
title: "При создании мобильного приложения..."
date: 2026-06-18
source_url: https://www.google.com/search?...
---

## User

При создании мобильного приложения что учесть?

## AI

При создании мобильного приложения ведёт целый комплекс решений...

- Пункт 1
- Пункт 2

```python
example()
```
```

### FR-4: File Storage (File System Access API)

| ID | Requirement |
|----|-------------|
| FR-4.1 | Пользователь **один раз** выбирает целевую папку через системный диалог |
| FR-4.2 | Handle папки персистится между сессиями (IndexedDB) |
| FR-4.3 | Все файлы сохраняются **flat** в выбранную папку (без подпапок) |
| FR-4.4 | При отзыве permission — повторный запрос папки при следующем сохранении |

### FR-5: Filename & Overwrite

| ID | Requirement |
|----|-------------|
| FR-5.1 | Дефолтное имя: **первый вопрос пользователя + дата**, обрезка до N символов (N=80, TBD в impl) |
| FR-5.2 | Перед сохранением **всегда** показывать диалог с предзаполненным именем |
| FR-5.3 | Пользователь может изменить имя или подтвердить дефолт (Enter) |
| FR-5.4 | Повторное сохранение с **тем же именем** → **перезапись** файла |
| FR-5.5 | Санитизация имени: недопустимые символы ОС заменяются на `_` |

### FR-6: Extension UI (Popup)

| ID | Requirement |
|----|-------------|
| FR-6.1 | Кнопка **«Сохранить»** в popup расширения |
| FR-6.2 | Во время сохранения — **спиннер**, блокировка повторного клика |
| FR-6.3 | Settings: «Изменить папку», отображение текущего пути (если доступен) |
| FR-6.4 | Статус: AI Mode detected / not detected |

### FR-7: First Run

| ID | Requirement |
|----|-------------|
| FR-7.1 | Если папка не выбрана — при первом Save открыть диалог выбора папки |
| FR-7.2 | Без выбранной папки сохранение не выполняется |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | p95 время сохранения (тред до 30 turn'ов) < 20 сек |
| NFR-2 | Работа в Chrome и Edge последних 2 major versions |
| NFR-3 | Локали Google: RU, EN (минимум) |
| NFR-4 | Permissions: минимальный набор (`activeTab`, storage, FSAA где применимо) |
| NFR-5 | Контент чатов не отправляется на внешние серверы |
| NFR-6 | Расширение не модифицирует страницу Google (no injected UI в v1) |

---

## 5. Technical Constraints

- **Manifest V3** — service worker вместо background page
- **FSAA** — запись только в ранее разрешённую папку; нет silent write в произвольный путь
- **Content script** — доступ к DOM AI Mode для extraction
- **DOM fragility** — селекторы Google нестабильны; нужна стратегия версионирования

---

## 6. Edge Cases

| Case | Expected behavior |
|------|-------------------|
| Пустой тред | Save disabled, нет диалога |
| AI Mode, но тред ещё генерируется | Сохранить текущее состояние; опционально warning (Phase 2) |
| Очень длинный первый вопрос | Обрезка имени до N символов + `...` |
| Кириллица в имени файла | Разрешена (Windows/NTFS) |
| Две вкладки с разными чатами | Save работает на **активной** вкладке |
| FSAA permission revoked | Re-prompt folder on next save |
| Google изменил DOM | Error в popup: «Не удалось извлечь чат. Обновите расширение.» |

---

## 7. Success Metrics

| Metric | Target (30 дней post-launch) |
|--------|----------------------------|
| Save success rate | > 95% |
| Median save time | < 10 сек |
| D7 retention (установивших) | > 20% |
| Support tickets «broken after Google update» | < 10% installs |

---

## 8. Open Questions (deferred)

- Точное значение N для обрезки имени файла
- Поведение при streaming-ответе (save mid-generation)
- Публикация: open source vs closed

---

## 9. Appendix: Terminology

| Term | Definition |
|------|------------|
| AI Mode | Google Search «Режим ИИ» — отдельный conversational search UI |
| Turn | Одна пара user message + AI response |
| FSAA | File System Access API — браузерный API выбора и записи в папку |
| Vault | Корень или подпапка хранилища Obsidian |
