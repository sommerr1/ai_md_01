# Kanban — {{PROJECT_NAME}}

Одна карточка = одна единица работы.

## Расположение

| Статус | Папка |
|--------|-------|
| `backlog`, `in-progress` | `kanban/active/` |
| `done` | `kanban/done/` |

## Frontmatter (обязательно)

```yaml
---
id: "KB-001-short-slug"
status: "backlog"
priority: "medium"
prd: "PRD-001"
created: "YYYY-MM-DDTHH:MM:SS.000Z"
modified: "YYYY-MM-DDTHH:MM:SS.000Z"
---
```

## Pipeline

Skill `/kanban_run_task` — первая карточка `in-progress` в `active/` → реализация → changelog → done.

Шаблон карточки: `templates/card-kanban.md`
