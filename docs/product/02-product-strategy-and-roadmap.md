# Product Strategy & Roadmap

## Стратегический контекст

| Фактор | Оценка |
|--------|--------|
| Рынок | Нишевый инструмент; конкуренты — ручной copy-paste, общие «save page» extensions |
| Дифференциация | AI Mode detection + Obsidian MD + FSAA persistent folder |
| Риск | Хрупкость DOM Google; FSAA не во всех сценариях |
| Moat | Качество конвертации MD, UX для Obsidian, скорость адаптации к UI Google |

## Стратегические ставки

1. **Глубина > ширина** — один источник (AI Mode), один sink (Obsidian MD), один UX (popup).
2. **Локальность** — без backend, без аккаунта, без облака.
3. **Доверие** — прозрачный scope, disabled вне AI Mode, явный выбор папки.

## Позиционирование

> «Расширение для тех, кто думает в Obsidian, а ищет в Google AI Mode.»

Не конкурируем с универсальными clipper'ами — мы **специализированный мост** между двумя продуктами.

## Go-to-Market (lean)

| Канал | Действие |
|-------|----------|
| Obsidian community | Reddit r/ObsidianMD, форум, showcase |
| Product Hunt / Chrome Web Store | Listing с демо-GIF |
| Word of mouth | Бесплатный MVP, открытый repo (опционально) |

## Roadmap

### Phase 0 — Discovery & Design (1–2 недели)

- [ ] Reverse-engineer DOM AI Mode (RU + EN локали)
- [ ] Spike: FSAA write + handle persistence
- [ ] Spike: HTML → Markdown конвертация (таблицы, code blocks, списки)
- [ ] Wireframes popup (settings, save dialog, spinner)

### Phase 1 — MVP (3–4 недели)

**Theme:** Save full thread to Obsidian

| Epic | Deliverable |
|------|-------------|
| Detection | URL + UI marker «Режим ИИ» / AI Mode |
| Extraction | Auto-scroll + parse full thread |
| Conversion | MD + frontmatter (title, date, source_url) + ## User / ## AI |
| Storage | FSAA folder picker, flat save, overwrite on same name |
| UX | Popup: Save, rename dialog, spinner, settings (change folder) |
| Quality | Chrome + Edge, RU/EN UI Google |

**Exit criteria:** 10 тестовых тредов сохранены без потери структуры; p95 save < 20 с.

### Phase 2 — Hardening (2 недели)

- [ ] Обработка отзыва FSAA permission → re-pick folder
- [ ] Санитизация имён файлов (кириллица, спецсимволы)
- [ ] Error states в popup (DOM changed, empty thread)
- [ ] Chrome Web Store submission

### Phase 3 — v2 Core ([06-prd-v2.md](./06-prd-v2.md))

**Theme:** Multi-source + форматы + медиа + Mermaid

| Этап | Deliverable |
|------|-------------|
| v2.0-alpha | Выбор формата (onboarding + settings): `md`, `md+yaml`, `md+obsidian` |
| v2.0-beta | Extractor: `gemini.google.com` |
| v2.1 | Extractor: `copilot.microsoft.com` |
| v2.2 | Медиа в `attachments/`; Mermaid validate/fix для Obsidian |
| v2.3 | Форматы `html`, `json`, `dual` (HTML+MD) |

**Exit criteria:** 3 источника, 6 форматов, >85% media attach, >90% mermaid OK в Obsidian sample.

### Phase 4 — Growth (backlog)

| Приоритет | Feature |
|-----------|---------|
| P1 | Настраиваемый шаблон frontmatter + tags |
| P2 | Горячая клавиша |
| P2 | Подпапки по дате / настраиваемый path template |
| P3 | Brave, Arc, Opera |
| P3 | Append-only mode (дописать новые turn'ы) |
| P4 | Firefox (другой API для файлов) |

## Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Google меняет DOM | Высокая | Версионирование селекторов, fallback heuristics, быстрый patch release |
| FSAA handle invalid | Средняя | Graceful re-prompt, статус в settings |
| Длинные треды (>100 turn) | Средняя | Timeout + partial save warning (Phase 2) |
| Store rejection | Н低 | Минимальные permissions, privacy policy |

## KPI по фазам

| Phase | KPI |
|-------|-----|
| MVP | 50 установок, 5 внешних beta-тестеров |
| Hardening | < 5% failed saves, Store approved |
| Growth | 500 MAU, NPS > 30 |
