---
name: to-obsidian
description: По вызову /to-obsidian копирует markdown-файлы проекта в папку Obsidian на Windows в подпапку с именем проекта. Использовать, когда пользователь просит экспортировать заметки проекта в Obsidian.
triggers: ["to-obsidian", "obsidian", "экспорт в обсидиан", "сбросить в обсидиан", "sync to obsidian"]
disable-model-invocation: true
---

# To Obsidian

## Цель

По вызову скилла мд файлы из проекта копируются в `C:\Users\HP\Documents\obsidian\obs\projects` в подпапку с именем проекта.

WSL-путь назначения: `/mnt/c/Users/HP/Documents/obsidian/obs/projects/<project_name>`.

## Обязательные правила

1. Всегда предлагать выбор с чекбоксами какие файлы закинуть.
2. Варианты выбора:
   - `all` - копировать все `*.md` файлы
   - `select` - выбирать по одному (мультивыбор чекбоксами)
3. Если файл уже существует — переписать.
4. Каталоги в Obsidian создавать только для путей с `.md`; пустые папки не переносить.
5. Отвечать пользователю кратко на русском.

## Workflow

1. Определи `PROJECT_ROOT` (текущий workspace) и `PROJECT_NAME="$(basename "$PROJECT_ROOT")"`.
2. Спроси режим через `AskQuestion`:
   - `all`
   - `select`
3. Собери список `*.md` файлов в проекте (относительные пути).
4. Если выбран `select`, покажи второй `AskQuestion` с `allow_multiple: true` и чекбоксами по каждому файлу.
5. Создай папку назначения: `/mnt/c/Users/HP/Documents/obsidian/obs/projects/$PROJECT_NAME`.
6. Выполни копирование с перезаписью.
7. Верни короткий отчет: режим, количество, путь назначения, список файлов.

## Команды (Bash/WSL)

```bash
PROJECT_ROOT="/project/rag_kb_01"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
DEST_ROOT="/mnt/c/Users/HP/Documents/obsidian/obs/projects"
DEST_DIR="$DEST_ROOT/$PROJECT_NAME"
mkdir -p "$DEST_DIR"
```

Режим `all` (только каталоги с `.md`, без пустых папок):

```bash
/home/hp/.cursor/skills/to-obsidian/scripts/export_to_obsidian.sh all
```

Режим `select` (перезапись каждого выбранного файла):

```bash
/home/hp/.cursor/skills/to-obsidian/scripts/export_to_obsidian.sh select "$rel1" "$rel2"
```
