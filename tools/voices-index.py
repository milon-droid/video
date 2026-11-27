#!/usr/bin/env python3
"""Реестр голосов: собрать assets/voices/VOICES.md из всех lines.json проектов (роль → проекты, описание, образец).
    python3 tools/voices-index.py
Запускать после каждой новой роли. Перед синтезом голос героя брать ТОЛЬКО по этому реестру (одна роль = один файл
assets/voices/qwen-ref/<роль>.wav); новая роль — новое уникальное имя <проект>_<герой>[_en], не переиспользовать чужое."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "assets/voices/qwen-ref"
roles = {}
for f in sorted(ROOT.glob("projects/*/**/*.json")):
    if "node_modules" in f.parts or "render" in f.parts: continue
    try: d = json.loads(f.read_text(encoding="utf-8"))
    except Exception: continue
    if not isinstance(d, dict) or not isinstance(d.get("roles"), dict) or "lines" not in d: continue
    proj = f.relative_to(ROOT).parts[1]
    for name, r in d["roles"].items():
        if not isinstance(r, dict): continue
        e = roles.setdefault(name, {"projects": set(), "instruct": "", "wav": "", "files": set()})
        e["projects"].add(proj); e["files"].add(str(f.relative_to(ROOT)))
        e["instruct"] = e["instruct"] or r.get("instruct", "") or r.get("desc", "")
        e["wav"] = e["wav"] or r.get("wav", "")
for w in REF.glob("*.wav"):
    roles.setdefault(w.stem, {"projects": set(), "instruct": "", "wav": "", "files": set()})
out = ["# Реестр голосов (собирается `python3 tools/voices-index.py`, руками не править — кроме раздела «Заметки»)", "",
       "Голос героя — только отсюда. Образец: `assets/voices/qwen-ref/<роль>.wav` (+ .txt с точным текстом).", "",
       "| Роль | Проекты | Образец | Описание голоса |", "|---|---|---|---|"]
for name in sorted(roles, key=lambda n: (sorted(roles[n]["projects"]) or ["~"], n)):
    e = roles[name]; wav = (REF / f"{name}.wav")
    has = "✅" if wav.exists() else ("`" + e["wav"] + "`" if e["wav"] else "❌ нет")
    desc = re.sub(r"\s+", " ", e["instruct"])[:140].replace("|", "/")
    out.append(f"| `{name}` | {', '.join(sorted(e['projects'])) or '—'} | {has} | {desc} |")
notes = ROOT / "assets/voices/VOICES.md"
keep = ""
if notes.exists() and "## Заметки" in notes.read_text(encoding="utf-8"):
    keep = notes.read_text(encoding="utf-8").split("## Заметки", 1)[1]
out += ["", "## Заметки" + (keep or "\n- Тень (ten): Sam = роль `senya_en` (EN). Русский Sam — выбирается сравнением 2026-11-27.\n")]
notes.write_text("\n".join(out), encoding="utf-8")
print(f"{len(roles)} ролей → {notes.relative_to(ROOT)}")
