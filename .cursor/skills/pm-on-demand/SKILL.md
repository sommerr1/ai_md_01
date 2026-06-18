---
name: pm-on-demand
description: Run lightweight on-demand PM flow with inbox backlog, short PRD, use cases, and kanban handoff in pm/ submodule. Use when user asks to capture ideas, triage feature requests, or formalize planning before implementation.
triggers: ["pm", "pm backlog", "pm_backlog", "prd", "ондеманд планирование", "планирование фич"]
disable-model-invocation: true
---

# PM On-Demand

PM-артефакты в submodule `pm/` → [ai_md_01_pm](https://github.com/sommerr1/ai_md_01_pm).

Инициализация: `git submodule update --init pm`

## Workflow

1. Идея → `pm/inbox/backlog.md` (ID `PM-XXX`, value/effort/risk).
2. Triage: статус `captured` → `triaged` → `spec-ready`.
3. PRD → `pm/product/prd/PRD-XXX-*.md` (шаблон: `pm/templates/prd.md`).
4. User cases → `pm/product/use-cases/UC-XXX-*.md` (шаблон: `pm/templates/use-case.md`).
5. Декомпозиция → `pm/kanban/active/KB-XXX-*.md` (шаблон: `pm/templates/card-kanban.md`).
6. После релиза → `pm/registry/feature_registry.md` + `pm/kanban/done/`.

## Пути

| Артефакт | Путь |
|----------|------|
| Backlog | `pm/inbox/backlog.md` |
| PRD | `pm/product/prd/` |
| Epics | `pm/product/epics/` |
| Use cases | `pm/product/use-cases/` |
| Kanban active | `pm/kanban/active/` |
| Kanban done | `pm/kanban/done/` |
| Registry | `pm/registry/feature_registry.md` |
| Правила | `pm/PROCESS.md` |

## Constraints

- Лёгкие, детерминированные доки.
- Не начинать реализацию из чата без trail в backlog/PRD.
- Micro-PRD для мелких задач; полный PRD + UC для UI/рискованных.
- Старые пути `.devtool/features/` и `.cursor/workflow/pm/specs/` не использовать.

## Output

- Ответ на русском, кратко.
- Указывать конкретные пути в `pm/`.
