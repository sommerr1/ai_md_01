# PM Process — {{PROJECT_NAME}}

Дата: {{DATE}}

## Режим

- On-demand, без жёсткого ритма.
- Каждая идея → `inbox/backlog.md`.
- Kanban — операционный слой исполнения.

## Минимум документации

- Перед реализацией — PRD в `product/prd/`.
- Micro-PRD (до 15 строк) — для мелких задач.
- User cases в `product/use-cases/` — для UI/UX.

## Переход в разработку

- Нельзя брать задачу из чата без trail в backlog/PRD.
- Задача: ID `PM-XXX`, статус ≥ `spec-ready`.
- Декомпозиция → `kanban/active/KB-XXX-*.md` со ссылкой на PRD.

## Kanban

- Активные: `kanban/active/` (`backlog`, `in-progress`)
- Завершённые: `kanban/done/`
- Pipeline: skill `/kanban_run_task`

## Критерии переходов (Inbox)

| From | To | Критерий |
|------|-----|----------|
| captured | triaged | value/effort/risk оценены |
| triaged | spec-ready | scope v1 и «готово» определены |
| spec-ready | in-kanban | PRD + карточки в kanban/active |
| in-kanban | done | карточки в done + registry |
