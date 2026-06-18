# PRD v2 — Расширенный экспорт в Obsidian

**Версия:** 2.0  
**Статус:** Draft  
**Зависимость:** v1 (MVP) shipped  
**Платформа:** Chrome, Edge (Manifest V3)

---

## 1. Overview

### 1.1 Summary

v2 расширяет мост «AI-чат → Obsidian vault»:

- **выбор формата** сохранения (не только MD+YAML);
- **новые источники:** `gemini.google.com`, `copilot.microsoft.com`;
- **медиа** в `attachments/`;
- **нормализация Mermaid** для корректного рендера в Obsidian.

### 1.2 Goals

- Один продукт — три AI-поверхности с единым UX сохранения.
- Пользователь контролирует формат вывода под свой vault workflow.
- Визуальный контекст (картинки, вложения) не теряется при архивации.
- Диаграммы Mermaid из ответов AI открываются в Obsidian без ручной правки.

### 1.3 Non-goals (v2)

- AI Overviews, обычный Google Search
- Firefox / Safari
- Облачная синхронизация, аккаунты
- Редактирование чатов внутри расширения
- Видео-плеер offline (только poster/thumbnail + ссылка на источник, если прямое скачивание невозможно)

---

## 2. Форматы сохранения

### 2.1 Поддерживаемые форматы

| ID | Формат | Расширение | Описание |
|----|--------|------------|----------|
| `md` | Plain Markdown | `.md` | GFM без YAML frontmatter; секции `## User` / `## AI` |
| `md+yaml` | Markdown + YAML | `.md` | **Дефолт v1** — frontmatter (`title`, `date`, `source_url`, `source`) + секции User/AI |
| `md+obsidian` | Obsidian Markdown | `.md` | Как `md+yaml` + AI-ответы в callouts `> [!ai]`, wikilinks на локальные вложения `![[attachments/...]]` |
| `html` | Self-contained HTML | `.html` | Один файл: стили inline, ссылки на медиа относительные или data-URI для мелких assets |
| `json` | Structured export | `.json` | Массив turn'ов + metadata + raw HTML на сообщение (для автоматизации) |
| `dual` | HTML + Markdown | `.html` + `.md` | Пара файлов с общим basename; MD — для Obsidian, HTML — pixel-close архив |

### 2.2 Выбор формата — UX

| Момент | Поведение |
|--------|-----------|
| **Первое сохранение после апдейта до v2** | Модальное окно: «Выберите формат сохранения» + краткое описание каждого варианта + preview примера (1 экран) |
| **Settings (popup)** | Dropdown «Формат сохранения» — тот же список; изменение применяется к следующим сохранениям |
| **Миграция с v1** | Если ключ `exportFormat` отсутствует → показать onboarding-диалог; дефолт `md+yaml` (обратная совместимость) |

### 2.3 FR — Export Format

| ID | Requirement |
|----|-------------|
| FR-F1 | Хранить `exportFormat` в `chrome.storage.sync` (fallback `local`) |
| FR-F2 | Onboarding-диалог показывается **один раз** после апдейта; флаг `formatOnboardingDone` |
| FR-F3 | Конвертер — единый pipeline: `Thread → CanonicalModel → FormatAdapter` |
| FR-F4 | Для `dual` — атомарная запись обоих файлов; при ошибке второго — откат или явная ошибка в popup |
| FR-F5 | Имя файла: тот же basename, расширение по формату (для `dual` — два расширения) |

---

## 3. Новые источники (Gemini, Copilot)

### 3.1 Scope

| Источник | URL | Детекция |
|----------|-----|----------|
| Google AI Mode | `google.<tld>/search` + UI «Режим ИИ» / AI Mode | v1 (без изменений) |
| Gemini | `gemini.google.com` | URL host + маркер chat UI |
| Microsoft Copilot | `copilot.microsoft.com` | URL host + маркер conversation UI |

### 3.2 Архитектура адаптеров

```
Content Script (per host)
    → ExtractorAdapter (google-ai | gemini | copilot)
    → CanonicalThread { turns[], metadata, media[] }
    → Save Pipeline (shared)
```

### 3.3 FR — Multi-source

| ID | Requirement |
|----|-------------|
| FR-S1 | Отдельный content script / модуль extractor на каждый host |
| FR-S2 | Popup статус: `AI Mode` / `Gemini` / `Copilot` / `Не поддерживается` |
| FR-S3 | Frontmatter field `source`: `google-ai-mode` \| `gemini` \| `copilot` |
| FR-S4 | Автоскролл + полный тред — как в v1, для каждого адаптера |
| FR-S5 | Вне поддерживаемых URL — кнопка disabled, без уведомлений |
| FR-S6 | `manifest.json`: `host_permissions` для `gemini.google.com`, `copilot.microsoft.com` |

### 3.4 Риски DOM

Каждый адаптер версионируется независимо (`selectors.v1.json` per source). Сбой одного источника не ломает остальные.

---

## 4. Медиа и вложения

### 4.1 Поведение

| Тип | Действие |
|-----|----------|
| Изображения (`img`, inline в ответе) | Скачать в `attachments/` рядом с vault-папкой или в подпапку `attachments/` внутри выбранной save-папки |
| Сгенерированные / chart images | То же; dedupe по content-hash |
| SVG | Сохранить как `.svg` или inline в MD при `md+obsidian` |
| Видео | Poster/thumbnail в attachments + ссылка `[video](url)`; прямое скачивание — если URL доступен без auth |
| Файлы-вложения (Copilot/Gemini) | Скачать при публичном URL; иначе — текстовая ссылка |

### 4.2 Структура путей

```
{vault_folder}/
  my-chat-2026-06-18.md
  attachments/
    my-chat-2026-06-18/
      img-001-a1b2c3.png
      img-002-d4e5f6.webp
```

Плоский режим v1 для `.md` сохраняется; `attachments/{basename}/` — единственная подпапка в v2.

### 4.3 FR — Media

| ID | Requirement |
|----|-------------|
| FR-M1 | Настройка «Сохранять медиа» (toggle, default **on** в v2) |
| FR-M2 | Имена файлов: `{basename}/img-{seq}-{hash8}.{ext}` |
| FR-M3 | В MD: `![alt](attachments/{basename}/img-001-....png)` или `![[attachments/...]]` в `md+obsidian` |
| FR-M4 | Повторное сохранение с тем же basename → перезапись MD/HTML **и** merge/replace attachments той же сессии |
| FR-M5 | CORS/auth-blocked URL → placeholder `*[image unavailable]*` + оригинальный URL в footnote |
| FR-M6 | Лимит размера одного файла: 10 MB (configurable); превышение — skip + warning в popup |

---

## 5. Mermaid — валидация для Obsidian

### 5.1 Проблема

AI часто вставляет Mermaid с синтаксисом, который ломается в Obsidian: smart quotes, неэкранированные `[]`, HTML entities, `graph` vs `flowchart`, subgraph без кавычек, emoji в node id.

### 5.2 Pipeline

```
extract code block (language: mermaid)
    → normalize (quotes, entities, whitespace)
    → parse via mermaid.js (bundled, offline)
    → if invalid: auto-fix heuristics OR wrap in ```mermaid + warning comment
    → emit Obsidian-compatible block
```

### 5.3 Правила нормализации

| Проверка | Действие |
|----------|----------|
| Smart quotes `""''` | Заменить на ASCII `"` / `'` |
| HTML entities (`&lt;`, `&amp;`) | Декодировать |
| Node labels с `()` без кавычек | Обернуть в `["..."]` |
| `graph TD` legacy | Оставить (Obsidian поддерживает) или upgrade до `flowchart TD` |
| Пустой / битый блок | Оставить как code block + HTML comment `<!-- mermaid: validation failed -->` |
| Несколько mermaid в одном turn | Каждый блок валидируется отдельно |

### 5.4 FR — Mermaid

| ID | Requirement |
|----|-------------|
| FR-MM1 | Валидация только для блоков с lang `mermaid` (и alias: `mermaidjs`) |
| FR-MM2 | Парсинг **локально**, без отправки диаграмм на сервер |
| FR-MM3 | Настройка «Исправлять Mermaid автоматически» (default on) |
| FR-MM4 | При неудачном auto-fix — сохранить исходник + YAML field `mermaid_warnings: [{line, message}]` в frontmatter (только `md+yaml` / `md+obsidian`) |
| FR-MM5 | Unit-тесты: ≥10 реальных AI-generated mermaid samples → render OK в Obsidian 1.6+ |

---

## 6. UI / Settings (v2 additions)

| Элемент | Описание |
|---------|----------|
| Формат сохранения | Dropdown (§2.1) |
| Сохранять медиа | Toggle |
| Исправлять Mermaid | Toggle |
| Источник (read-only) | Текущая вкладка: Google AI / Gemini / Copilot |
| Onboarding v2 | One-time modal после апдейта |

Остальной UX v1 (папка, rename dialog, spinner, overwrite) без изменений.

---

## 7. Non-Functional (v2)

| ID | Requirement |
|----|-------------|
| NFR-V2-1 | p95 save с медиа (≤5 images) < 30 сек |
| NFR-V2-2 | Размер бандла +mermaid ≤ 500 KB gzip (tree-shake) |
| NFR-V2-3 | Три extractor-а покрыты smoke-тестами на fixture HTML |
| NFR-V2-4 | Контент по-прежнему не уходит на внешние серверы (кроме fetch медиа по URL пользователя) |

---

## 8. Success Metrics (v2)

| Metric | Target |
|--------|--------|
| % saves с Gemini/Copilot от всех saves | > 25% через 60 дней |
| Mermaid blocks render OK в Obsidian (manual sample) | > 90% |
| Media attach success rate | > 85% |
| Format onboarding completion | > 95% |

---

## 9. Release plan

| Этап | Deliverable |
|------|-------------|
| v2.0-alpha | Форматы `md`, `md+yaml`, `md+obsidian` + onboarding |
| v2.0-beta | Gemini extractor |
| v2.1 | Copilot extractor |
| v2.2 | Медиа + Mermaid pipeline |
| v2.3 | `html`, `json`, `dual` |

---

## 10. Open Questions

- `attachments/` внутри save-папки vs соседняя папка vault root?
- Copilot enterprise (M365) — отдельный host?
- Политика Store: дополнительные host_permissions
