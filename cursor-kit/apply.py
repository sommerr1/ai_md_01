#!/usr/bin/env python3
"""Применить выбранные артефакты из catalog.json к текущему проекту."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore

KIT_DIR = Path(__file__).resolve().parent
CATALOG_PATH = KIT_DIR / "catalog.json"
BUNDLES_PATH = KIT_DIR / "bundles.yaml"
SCAFFOLDS_DIR = KIT_DIR / "scaffolds"
TEXT_SUFFIXES = {".md", ".yaml", ".yml", ".json", ".txt", ".gitkeep"}


def load_catalog() -> dict:
    if not CATALOG_PATH.exists():
        print(f"Каталог не найден. Сначала: python {KIT_DIR / 'scan.py'}", file=sys.stderr)
        sys.exit(1)
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def load_bundles() -> dict:
    if yaml is None or not BUNDLES_PATH.exists():
        return {"bundles": {}, "auto_scaffold_for_skills": {}}
    data = yaml.safe_load(BUNDLES_PATH.read_text(encoding="utf-8")) or {}
    return {
        "bundles": data.get("bundles") or {},
        "auto_scaffold_for_skills": data.get("auto_scaffold_for_skills") or {},
    }


def find_artifact(catalog: dict, artifact_id: str, artifact_type: str | None = None) -> dict | None:
    for art in catalog.get("artifacts", []):
        if art["id"] == artifact_id and (artifact_type is None or art["type"] == artifact_type):
            return art
    return None


def pick_source(art: dict, platform: str | None) -> dict:
    sources = art.get("sources") or []
    if not sources:
        raise ValueError(f"Нет источников для {art['id']}")
    if platform:
        for s in sources:
            if s.get("platform") == platform:
                return s
    return sources[0]


def apply_skill(source: dict, target_project: Path, *, dry_run: bool) -> None:
    skill_dir = Path(source["path"])
    dest = target_project / ".cursor" / "skills" / skill_dir.name
    if dry_run:
        print(f"  [dry-run] skill: {skill_dir} -> {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  ! skill exists, skip: {dest.name}")
        return
    shutil.copytree(skill_dir, dest)
    print(f"  + skill: {dest.name}")


def apply_rule(source: dict, target_project: Path, *, dry_run: bool) -> None:
    rule_file = Path(source["path"])
    dest = target_project / ".cursor" / "rules" / rule_file.name
    if dry_run:
        print(f"  [dry-run] rule: {rule_file} -> {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  ! rule exists, skip: {dest.name}")
        return
    shutil.copy2(rule_file, dest)
    print(f"  + rule: {dest.name}")


def merge_mcp(source: dict, target_project: Path, *, dry_run: bool) -> None:
    server_name = source.get("server_name") or source.get("config", {})
    cfg = source.get("config")
    if not cfg:
        raise ValueError("Нет конфигурации MCP в source")

    mcp_path = target_project / ".cursor" / "mcp.json"
    if dry_run:
        print(f"  [dry-run] mcp: add server '{server_name}' -> {mcp_path}")
        return

    mcp_path.parent.mkdir(parents=True, exist_ok=True)
    if mcp_path.exists():
        data = json.loads(mcp_path.read_text(encoding="utf-8"))
    else:
        data = {"mcpServers": {}}

    servers = data.setdefault("mcpServers", {})
    if server_name in servers:
        print(f"  ! mcp '{server_name}' exists, skip")
        return
    servers[server_name] = cfg
    mcp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  + mcp: {server_name}")


def apply_hook(source: dict, target_project: Path, *, dry_run: bool) -> None:
    hooks_file = Path(source["path"])
    dest = target_project / ".cursor" / "hooks.json"
    if dry_run:
        print(f"  [dry-run] hook: {hooks_file} -> {dest}")
        return
    if dest.exists():
        print("  ! hooks.json exists, skip")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(hooks_file, dest)
    print("  + hooks.json")


def apply_one(art: dict, target_project: Path, *, platform: str | None, dry_run: bool) -> None:
    source = pick_source(art, platform)
    print(f"> {art['type']}/{art['id']} from {source.get('project', '?')}")

    if art["type"] == "skill":
        apply_skill(source, target_project, dry_run=dry_run)
    elif art["type"] == "rule":
        apply_rule(source, target_project, dry_run=dry_run)
    elif art["type"] == "mcp":
        merge_mcp(source, target_project, dry_run=dry_run)
    elif art["type"] == "hook":
        apply_hook(source, target_project, dry_run=dry_run)
    else:
        print(f"  ? unknown type: {art['type']}")


def scaffold_source_dir(scaffold_id: str) -> Path:
    base = SCAFFOLDS_DIR / scaffold_id
    if not base.is_dir():
        raise FileNotFoundError(f"Scaffold not found: {scaffold_id}")
    manifest = base / "manifest.yaml"
    if manifest.exists() and yaml is not None:
        meta = yaml.safe_load(manifest.read_text(encoding="utf-8")) or {}
        sub = meta.get("target_dir") or scaffold_id
        candidate = base / sub
        if candidate.is_dir():
            return candidate
    inner = base / scaffold_id
    if inner.is_dir():
        return inner
    return base


def render_placeholders(text: str, project_name: str) -> str:
    return (
        text.replace("{{PROJECT_NAME}}", project_name)
        .replace("{{DATE}}", date.today().isoformat())
    )


def deploy_scaffold(
    scaffold_id: str,
    target_project: Path,
    *,
    dry_run: bool,
    force: bool = False,
) -> None:
    src_root = scaffold_source_dir(scaffold_id)
    manifest_path = SCAFFOLDS_DIR / scaffold_id / "manifest.yaml"
    target_subdir = scaffold_id
    if manifest_path.exists() and yaml is not None:
        meta = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
        target_subdir = meta.get("target_dir") or scaffold_id

    deploy_root = target_project / target_subdir
    project_name = target_project.name
    created = 0
    skipped = 0

    print(f"> scaffold/{scaffold_id} -> {deploy_root}")

    for src in sorted(src_root.rglob("*")):
        if not src.is_file():
            continue
        rel = src.relative_to(src_root)
        dest = deploy_root / rel
        if dest.exists() and not force:
            skipped += 1
            if dry_run:
                print(f"  [dry-run] skip exists: {rel}")
            continue
        if dry_run:
            print(f"  [dry-run] scaffold: {rel}")
            created += 1
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix.lower() in TEXT_SUFFIXES or src.name == ".gitkeep":
            content = render_placeholders(src.read_text(encoding="utf-8"), project_name)
            dest.write_text(content, encoding="utf-8")
        else:
            shutil.copy2(src, dest)
        print(f"  + scaffold: {rel}")
        created += 1

    if not dry_run:
        print(f"  scaffold done: +{created}, skip {skipped}")


def resolve_bundle(bundle_name: str, bundles_cfg: dict) -> tuple[list[str], list[str]]:
    bundle = bundles_cfg.get("bundles", {}).get(bundle_name)
    if not bundle:
        raise ValueError(f"Bundle not found: {bundle_name}")
    skills = list(bundle.get("skills") or [])
    scaffolds = list(bundle.get("scaffolds") or [])
    return skills, scaffolds


def collect_auto_scaffolds(skill_ids: list[str], bundles_cfg: dict, explicit: list[str]) -> list[str]:
    result = list(explicit)
    auto_map = bundles_cfg.get("auto_scaffold_for_skills") or {}
    for sid in skill_ids:
        sc = auto_map.get(sid)
        if sc and sc not in result:
            result.append(sc)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Применить артефакты cursor-kit к проекту")
    parser.add_argument("ids", nargs="*", help="id артефактов или bundle name с --bundle")
    parser.add_argument("--project", type=Path, default=Path.cwd(), help="Целевой проект")
    parser.add_argument("--type", help="Тип артефакта (skill, rule, mcp, hook)")
    parser.add_argument("--platform", choices=["win", "wsl"], help="Предпочитаемая платформа источника")
    parser.add_argument("--bundle", help="Имя набора из bundles.yaml (pm-on-demand, kanban, pm-full)")
    parser.add_argument("--scaffold", action="append", default=[], metavar="ID", help="Развернуть scaffold (pm)")
    parser.add_argument("--no-scaffold", action="store_true", help="Не разворачивать scaffold автоматически")
    parser.add_argument("--scaffold-only", action="store_true", help="Только scaffold, без skills")
    parser.add_argument("--force-scaffold", action="store_true", help="Перезаписать существующие файлы scaffold")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    catalog = load_catalog()
    bundles_cfg = load_bundles()
    target = args.project.resolve()

    skill_ids: list[str] = []
    scaffold_ids: list[str] = list(args.scaffold)

    if args.bundle:
        b_skills, b_scaffolds = resolve_bundle(args.bundle, bundles_cfg)
        skill_ids.extend(b_skills)
        for s in b_scaffolds:
            if s not in scaffold_ids:
                scaffold_ids.append(s)

    if args.ids:
        skill_ids.extend(args.ids)

    if not args.no_scaffold and not args.scaffold_only:
        scaffold_ids = collect_auto_scaffolds(skill_ids, bundles_cfg, scaffold_ids)

    print(f"Project: {target}")

    if not args.scaffold_only:
        for aid in skill_ids:
            art = find_artifact(catalog, aid, args.type)
            if not art:
                print(f"X not found: {aid}", file=sys.stderr)
                continue
            apply_one(art, target, platform=args.platform, dry_run=args.dry_run)

    for sid in scaffold_ids:
        deploy_scaffold(
            sid,
            target,
            dry_run=args.dry_run,
            force=args.force_scaffold,
        )


if __name__ == "__main__":
    main()
