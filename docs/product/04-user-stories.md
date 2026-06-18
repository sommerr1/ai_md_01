# User Stories

Формат: **As a** … **I want** … **So that** …  
Приоритет: P0 = MVP, P1 = Phase 2, P2 = backlog

---

## Epic 1: Detection & Activation

### US-1.1 — Определение AI Mode
**As a** пользователь Obsidian  
**I want** расширение понимать, что я в Google AI Mode  
**So that** сохранение доступно только там, где есть что сохранять  

**Acceptance criteria:**
- [ ] На вкладке AI Mode кнопка Save enabled
- [ ] На обычном Google Search, Gemini, других сайтах — disabled
- [ ] В popup видно статус: «AI Mode» / «Не AI Mode»

**Priority:** P0

---

### US-1.2 — Тихое поведение вне AI Mode
**As a** пользователь  
**I want** никаких всплывающих ошибок вне AI Mode  
**So that** расширение не мешает обычному серфингу  

**Acceptance criteria:**
- [ ] Нет toast/notification при клике disabled кнопки
- [ ] Кнопка визуально неактивна

**Priority:** P0

---

## Epic 2: First-Time Setup

### US-2.1 — Выбор папки vault
**As a** новый пользователь  
**I want** выбрать папку Obsidian при первом сохранении  
**So that** файлы попадают в мой vault, а не в Downloads  

**Acceptance criteria:**
- [ ] При первом Save открывается системный диалог выбора папки
- [ ] После выбора handle сохраняется между перезапусками браузера
- [ ] Отмена диалога → сохранение не выполняется

**Priority:** P0

---

### US-2.2 — Смена папки в настройках
**As a** пользователь  
**I want** изменить целевую папку в settings  
**So that** могу перенести архив в другой vault  

**Acceptance criteria:**
- [ ] Кнопка «Изменить папку» в popup/settings
- [ ] Новый handle заменяет предыдущий
- [ ] Старые файлы не перемещаются автоматически

**Priority:** P0

---

## Epic 3: Save Flow

### US-3.1 — Сохранение полного треда
**As a** исследователь  
**I want** сохранить весь диалог целиком  
**So that** контекст не теряется  

**Acceptance criteria:**
- [ ] Все turn'ы user + AI присутствуют в файле
- [ ] Порядок сообщений сохранён
- [ ] Автоскролл подгружает историю выше viewport

**Priority:** P0

---

### US-3.2 — Диалог имени файла
**As a** пользователь  
**I want** видеть и редактировать имя перед сохранением  
**So that** файлы организованы так, как мне удобно  

**Acceptance criteria:**
- [ ] Диалог появляется при каждом Save
- [ ] Имя предзаполнено: первый вопрос + дата
- [ ] Enter / «Сохранить» подтверждает
- [ ] Esc / «Отмена» отменяет без записи

**Priority:** P0

---

### US-3.3 — Перезапись существующего файла
**As a** пользователь, обновляющий тред  
**I want** перезаписать файл с тем же именем  
**So that** в vault одна актуальная версия  

**Acceptance criteria:**
- [ ] Повторный Save с неизменённым именем перезаписывает файл
- [ ] Нет дубликатов `-2`, `-3` в v1

**Priority:** P0

---

### US-3.4 — Индикатор прогресса
**As a** пользователь  
**I want** видеть, что сохранение идёт  
**So that** не кликаю повторно и не думаю, что зависло  

**Acceptance criteria:**
- [ ] Спиннер в popup на время extraction + scroll + write
- [ ] Кнопка Save disabled во время процесса
- [ ] По завершении спиннер скрывается, краткий success state

**Priority:** P0

---

## Epic 4: Obsidian Output

### US-4.1 — Markdown с frontmatter
**As a** пользователь Obsidian  
**I want** файл с YAML frontmatter  
**So that** плагины и поиск Obsidian работают из коробки  

**Acceptance criteria:**
- [ ] Поля: `title`, `date`, `source_url`
- [ ] `title` = первый user message (truncated)
- [ ] `source_url` = URL активной вкладки
- [ ] `date` = ISO 8601

**Priority:** P0

---

### US-4.2 — Секции User / AI
**As a** пользователь Obsidian  
**I want** явные заголовки ## User и ## AI  
**So that** легко читать и рефакторить заметку  

**Acceptance criteria:**
- [ ] Каждое сообщение пользователя под `## User`
- [ ] Каждый ответ AI под `## AI`
- [ ] Чередование соответствует оригинальному треду

**Priority:** P0

---

### US-4.3 — Сохранение текстового форматирования
**As a** пользователь  
**I want** списки, bold, code blocks и таблицы в MD  
**So that** заметка читаема без браузера  

**Acceptance criteria:**
- [ ] Bullet/numbered lists конвертируются корректно
- [ ] `**bold**`, `*italic*` сохраняются
- [ ] Code blocks с language tag если определён
- [ ] Таблицы в GFM syntax
- [ ] Изображения и видео **не** включаются (v1)

**Priority:** P0

---

## Epic 5: Error Handling

### US-5.1 — Потеря доступа к папке
**As a** пользователь  
**I want** повторно выбрать папку, если доступ отозван  
**So that** сохранение снова работает  

**Acceptance criteria:**
- [ ] При invalid handle — диалог выбора папки
- [ ] Понятное сообщение в popup

**Priority:** P1

---

### US-5.2 — Сбой извлечения DOM
**As a** пользователь  
**I want** понятную ошибку при смене UI Google  
**So that** знаю, что дело в расширении, а не в моих действиях  

**Acceptance criteria:**
- [ ] Сообщение: не удалось извлечь чат
- [ ] Файл не создаётся / не перезаписывается частичным контентом

**Priority:** P1

---

## Epic 6: v2 — Форматы и источники

> Детали: [06-prd-v2.md](./06-prd-v2.md)

### US-6.1 — Выбор формата при первом сохранении после v2
**As a** пользователь после апдейта  
**I want** выбрать формат сохранения (MD, MD+YAML, Obsidian MD, HTML, JSON, dual)  
**So that** файлы сразу подходят под мой workflow  

**Acceptance criteria:**
- [ ] One-time модалка при первом Save после апдейта
- [ ] Дефолт `md+yaml` для миграции с v1
- [ ] Выбор сохраняется в settings

**Priority:** P1 (v2)

---

### US-6.2 — Gemini и Copilot
**As a** пользователь Gemini / Copilot  
**I want** тот же Save-flow, что в Google AI Mode  
**So that** все AI-чаты в одном vault  

**Acceptance criteria:**
- [ ] Детекция `gemini.google.com`, `copilot.microsoft.com`
- [ ] Полный тред + frontmatter `source`
- [ ] Disabled вне поддерживаемых URL

**Priority:** P1 (v2)

---

### US-6.3 — Медиа в attachments
**As a** пользователь  
**I want** картинки и мультимедиа в `attachments/`  
**So that** визуальный контекст сохранён  

**Acceptance criteria:**
- [ ] Изображения скачиваются локально
- [ ] Ссылки в MD корректны для Obsidian
- [ ] Toggle «Сохранять медиа» в settings
- [ ] Видео: thumbnail + ссылка, если нет прямого download

**Priority:** P1 (v2)

---

### US-6.4 — Mermaid для Obsidian
**As a** пользователь  
**I want** диаграммы Mermaid из ответов AI без ручной правки  
**So that** они рендерятся в Obsidian  

**Acceptance criteria:**
- [ ] Локальная валидация через mermaid.js
- [ ] Auto-fix типовых ошибок (quotes, entities, labels)
- [ ] Warning в frontmatter при неудачном fix
- [ ] Toggle в settings

**Priority:** P1 (v2)

---

## Epic 7: Backlog

---

### US-7.1 — Горячая клавиша
**As a** power user  
**I want** сохранять без открытия popup  
**So that** workflow быстрее  

**Priority:** P2

---

### US-7.2 — Настраиваемый frontmatter
**As a** пользователь  
**I want** добавлять tags и custom fields  
**So that** заметки сразу попадают в мою систему тегов  

**Priority:** P2

---

## Story Map (кратко)

```
Setup          Save            Output          Maintain
─────          ────            ──────          ────────
US-2.1  →  US-3.1  →  US-4.1  →  US-5.1
US-2.2       US-3.2       US-4.2       US-5.2
             US-3.3       US-4.3
US-1.1       US-3.4
US-1.2
```
