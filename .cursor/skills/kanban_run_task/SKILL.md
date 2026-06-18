---
name: kanban-run-task
description: Берет первую задачу со статусом in_progress из канбан-процесса, формирует описание, план, DoD, реализует изменения, при необходимости добавляет и запускает тесты, затем выполняет /changelog-release, /rebuild, коммит+push code-репо и только в самом конце переносит задачу в done в PM-репо. Использовать, когда нужно провести задачу из канбана до полностью готового к доставке состояния.
triggers: ["kanban_run_task", "kanban-run-task", "kanban task", "in_progress", "канбан", "взять задачу из канбана"]
disable-model-invocation: true
---

# Kanban Run Task

## Что делает скилл

Проводит первую задачу со статусом `in-progress` по полному delivery-циклу: от формализации задачи и плана до реализации в **code-репо**, тестов, релизных артефактов, rebuild и публикации в git. Карточку закрывает в **PM-репо** (`pm/` submodule).

## Где искать карточки (обязательно)

PM-репо: [ai_md_01_pm](https://github.com/sommerr1/ai_md_01_pm), в code-репо — submodule `pm/`.

- Активные карточки: `pm/kanban/active/*.md` (только верхний уровень, без `done/`).
- Завершённые: `pm/kanban/done/*.md`.
- Папку `in_progress/` не использовать и не искать.
- Статус — из frontmatter поля `status` (`in-progress` или `in_progress`).

Если submodule пуст: `git submodule update --init pm`.

## Обязательный pipeline

1. Брать первую карточку из `pm/kanban/active/*.md` со статусом `in-progress`
2. Составить описание таска (цель, контекст, результат)
3. План реализации
4. DoD
5. Реализовать в code-репо (корень проекта, не `pm/`)
6. Тесты при изменении логики/контрактов
7. `/changelog-release` в code-репо
8. `/rebuild`
9. Commit + push **code-репо** (`ai_md_01`)
10. Только после успешного push — перенос карточки в `pm/kanban/done/`, `status: done`, `completedAt`
11. Commit + push **PM-репо** (`pm/` или `ai_md_01_pm`)

## Инструкции

1. Найди первую задачу в `pm/kanban/active/` со статусом `in-progress`. Если нет — остановись.
2. Прочитай связанные `prd`, `use_cases` из frontmatter карточки.
3. Реализация — только в code-репо.
4. После push code-репо: перенеси карточку, обнови `pm/registry/feature_registry.md` при необходимости.
5. Зафиксируй изменения в `pm/` (submodule pointer в code-репо тоже обновить).

## Формат отчёта

- Карточка, описание, план, DoD
- Что реализовано, тесты
- Changelog/rebuild статус
- SHA push code-репо и PM-репо

## Правила

- Не пропускать шаги pipeline.
- Не переводить карточку в `done` до push code-репо.
- Для PowerShell не использовать `&&`, использовать `;`.
