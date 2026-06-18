#!/usr/bin/env python3
"""Сканер артефактов Cursor: skills, rules, mcp, hooks."""

from __future__ import annotations

import hashlib
import json
import os
import platform
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore

KIT_DIR = Path(__file__).resolve().parent
CONFIG_PATH = KIT_DIR / "config.yaml"
CATALOG_PATH = KIT_DIR / "catalog.json"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)


def load_config() -> dict[str, Any]:
    if yaml is None:
        print("Установи PyYAML: pip install pyyaml", file=sys.stderr)
        sys.exit(1)
    if not CONFIG_PATH.exists():
        return {"scan_roots": {"win": [], "wsl": []}, "global_paths": {"win": [], "wsl": []}}
    with CONFIG_PATH.open(encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def is_wsl() -> bool:
    if platform.system() != "Linux":
        return False
    try:
        with open("/proc/version", encoding="utf-8") as f:
            return "microsoft" in f.read().lower()
    except OSError:
        return False


def active_platform_key() -> str:
    return "wsl" if is_wsl() else "win"


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def parse_frontmatter(text: str) -> dict[str, str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}
    block = m.group(1)
    result: dict[str, str] = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        result[key.strip()] = val.strip().strip('"').strip("'")
    return result


def project_name(root: Path, path: Path) -> str:
    try:
        rel = path.relative_to(root)
        if not rel.parts or rel.parts[0] == ".cursor":
            return root.name
        return rel.parts[0]
    except ValueError:
        return path.parent.name


def scan_skills_in_dir(
    skills_dir: Path,
    root: Path,
    platform_key: str,
    artifacts: dict[str, dict],
    *,
    builtin: bool = False,
) -> None:
    try:
        if not skills_dir.is_dir():
            return
    except OSError:
        return
    for skill_md in skills_dir.glob("*/SKILL.md"):
        skill_dir = skill_md.parent
        skill_id = skill_dir.name
        text = skill_md.read_text(encoding="utf-8", errors="replace")
        meta = parse_frontmatter(text)
        name = meta.get("name", skill_id)
        description = meta.get("description", "")
        if not description:
            for line in text.splitlines():
                if line.strip() and not line.startswith("#") and not line.startswith("---"):
                    description = line.strip()[:200]
                    break

        key = f"skill:{skill_id}"
        source = {
            "project": project_name(root, skill_dir),
            "path": str(skill_dir),
            "skill_file": str(skill_md),
            "platform": platform_key,
            "builtin": builtin,
            "modified_at": datetime.fromtimestamp(
                skill_md.stat().st_mtime, tz=timezone.utc
            ).isoformat(),
            "sha256": file_sha256(skill_md),
        }
        if key not in artifacts:
            artifacts[key] = {
                "id": skill_id,
                "type": "skill",
                "name": name,
                "description": description,
                "sources": [],
            }
        artifacts[key]["sources"].append(source)
        if len(source["modified_at"]) > 0:
            newest = max(artifacts[key]["sources"], key=lambda s: s["modified_at"])
            artifacts[key]["name"] = name
            artifacts[key]["description"] = description
            artifacts[key]["recommended_source"] = newest["path"]


def scan_rules(project_dir: Path, root: Path, platform_key: str, artifacts: dict) -> None:
    rules_dir = project_dir / ".cursor" / "rules"
    if not rules_dir.is_dir():
        return
    for rule_file in list(rules_dir.glob("*.mdc")) + list(rules_dir.glob("*.md")):
        rule_id = rule_file.stem
        text = rule_file.read_text(encoding="utf-8", errors="replace")
        meta = parse_frontmatter(text)
        description = meta.get("description", rule_file.name)
        key = f"rule:{rule_id}"
        source = {
            "project": project_name(root, project_dir),
            "path": str(rule_file),
            "platform": platform_key,
            "modified_at": datetime.fromtimestamp(
                rule_file.stat().st_mtime, tz=timezone.utc
            ).isoformat(),
            "sha256": file_sha256(rule_file),
        }
        if key not in artifacts:
            artifacts[key] = {
                "id": rule_id,
                "type": "rule",
                "name": rule_id,
                "description": description,
                "sources": [],
            }
        artifacts[key]["sources"].append(source)


def scan_mcp(project_dir: Path, root: Path, platform_key: str, artifacts: dict) -> None:
    mcp_file = project_dir / ".cursor" / "mcp.json"
    if not mcp_file.is_file():
        return
    try:
        data = json.loads(mcp_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return
    servers = data.get("mcpServers") or {}
    proj = project_name(root, project_dir)
    for server_name, server_cfg in servers.items():
        key = f"mcp:{server_name}"
        description = f"MCP server '{server_name}' из проекта {proj}"
        if isinstance(server_cfg, dict) and server_cfg.get("command"):
            description += f" ({server_cfg['command']})"
        source = {
            "project": proj,
            "path": str(mcp_file),
            "server_name": server_name,
            "platform": platform_key,
            "modified_at": datetime.fromtimestamp(
                mcp_file.stat().st_mtime, tz=timezone.utc
            ).isoformat(),
            "sha256": file_sha256(mcp_file),
            "config": server_cfg,
        }
        if key not in artifacts:
            artifacts[key] = {
                "id": server_name,
                "type": "mcp",
                "name": server_name,
                "description": description,
                "sources": [],
            }
        artifacts[key]["sources"].append(source)


def scan_hooks(project_dir: Path, root: Path, platform_key: str, artifacts: dict) -> None:
    hooks_file = project_dir / ".cursor" / "hooks.json"
    if not hooks_file.is_file():
        return
    proj = project_name(root, project_dir)
    key = f"hook:{proj}"
    source = {
        "project": proj,
        "path": str(hooks_file),
        "platform": platform_key,
        "modified_at": datetime.fromtimestamp(
            hooks_file.stat().st_mtime, tz=timezone.utc
        ).isoformat(),
        "sha256": file_sha256(hooks_file),
    }
    if key not in artifacts:
        artifacts[key] = {
            "id": f"hooks-{proj}",
            "type": "hook",
            "name": f"hooks ({proj})",
            "description": f"Cursor hooks из проекта {proj}",
            "sources": [],
        }
    artifacts[key]["sources"].append(source)


def scan_project(project_dir: Path, root: Path, platform_key: str, artifacts: dict) -> None:
    scan_skills_in_dir(project_dir / ".cursor" / "skills", root, platform_key, artifacts)
    scan_rules(project_dir, root, platform_key, artifacts)
    scan_mcp(project_dir, root, platform_key, artifacts)
    scan_hooks(project_dir, root, platform_key, artifacts)


def scan_root(root: Path, platform_key: str, artifacts: dict, skip_names: set[str]) -> None:
    try:
        if not root.is_dir():
            print(f"  skip (missing): {root}")
            return
    except OSError as e:
        print(f"  skip (access): {root} ({e})")
        return
    print(f"  scanning: {root}")
    if (root / ".cursor").exists():
        scan_project(root, root, platform_key, artifacts)
    try:
        entries = sorted(root.iterdir())
    except OSError as e:
        print(f"  skip listing: {root} ({e})")
        return
    for entry in entries:
        if not entry.is_dir():
            continue
        if entry.name in skip_names or entry.name.startswith("."):
            continue
        try:
            scan_project(entry, root, platform_key, artifacts)
        except OSError as e:
            print(f"  skip project: {entry} ({e})")


def scan_global_skills(path: Path, platform_key: str, artifacts: dict, exclude_builtin: bool) -> None:
    if not path.is_dir():
        return
    builtin = "skills-cursor" in path.parts
    if builtin and exclude_builtin:
        return
    print(f"  global skills: {path}")
    scan_skills_in_dir(path, path.parent, platform_key, artifacts, builtin=builtin)


def dedupe_sources(artifacts: dict) -> None:
    for art in artifacts.values():
        seen: set[str] = set()
        unique = []
        for s in art["sources"]:
            fp = f"{s['path']}:{s.get('sha256', '')}"
            if fp in seen:
                continue
            seen.add(fp)
            unique.append(s)
        art["sources"] = sorted(unique, key=lambda x: x["modified_at"], reverse=True)
        if art["sources"]:
            art["recommended_source"] = art["sources"][0]["path"]


def run_scan() -> dict[str, Any]:
    config = load_config()
    platform_key = active_platform_key()
    skip_names = set(config.get("skip_dir_names") or [])

    roots_cfg = config.get("scan_roots") or {}
    global_cfg = config.get("global_paths") or {}
    exclude_builtin = bool(config.get("exclude_builtin_skills", False))

    roots: list[Path] = [Path(p) for p in roots_cfg.get(platform_key, [])]
    # На Windows также сканируем win-пути, если запуск из WSL с mount
    if platform_key == "wsl":
        roots.extend(Path(p) for p in roots_cfg.get("win", []) if Path(p).is_dir())

    globals_paths = [Path(p) for p in global_cfg.get(platform_key, [])]

    artifacts: dict[str, dict] = {}

    print(f"cursor-kit scan [{platform_key}]")
    for root in roots:
        scan_root(root, platform_key, artifacts, skip_names)

    for gpath in globals_paths:
        scan_global_skills(gpath, platform_key, artifacts, exclude_builtin)

    dedupe_sources(artifacts)

    catalog = {
        "version": 1,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "platform": platform_key,
        "kit_home": str(KIT_DIR),
        "must_have": config.get("must_have") or [],
        "artifact_count": len(artifacts),
        "artifacts": sorted(artifacts.values(), key=lambda a: (a["type"], a["id"])),
    }
    return catalog


def main() -> None:
    catalog = run_scan()
    CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nOK: {catalog['artifact_count']} artifacts -> {CATALOG_PATH}")
    by_type: dict[str, int] = {}
    for a in catalog["artifacts"]:
        by_type[a["type"]] = by_type.get(a["type"], 0) + 1
    for t, n in sorted(by_type.items()):
        print(f"  {t}: {n}")


if __name__ == "__main__":
    main()
