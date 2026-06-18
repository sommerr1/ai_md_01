# Manual test matrix (T1–T10)

| # | Case | Expected | Status |
|---|------|----------|--------|
| T1 | First save, no folder | Folder picker → save | manual |
| T2 | Repeat save same name | Overwrite | manual |
| T3 | RU Google AI Mode | OK | manual |
| T4 | EN Google AI Mode | OK | manual |
| T5 | Long thread 30+ turns | All turns, < 20s | manual |
| T6 | Code + table in response | MD intact | automated sample |
| T7 | Non-Google tab | Disabled | manual |
| T8 | Regular Google search | Disabled | manual |
| T9 | Revoke folder permission | Re-pick | manual |
| T10 | Cyrillic filename | OK on Windows | manual |

Automated unit tests cover markdown, extraction, detection, FSAA helpers (21+ tests).
