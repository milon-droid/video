#!/usr/bin/env python3
"""Собрать общий каталог звуков assets/sfx-library/index.json из sfx-kit, Oculus Audio Pack и BigSoundBank."""
import json, re, sys
from pathlib import Path
lib = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/sfx-library")
out = []
kit = lib / "sfx-kit" / "sounds.json"
if kit.exists():
    d = json.loads(kit.read_text())
    for s in d["sounds"] if "sounds" in d else []:
        out.append({"id": s["id"], "file": str(Path("sfx-kit") / s["file"]), "license": "CC0", "name": s.get("name", ""),
                    "text": " ".join([s.get("name", ""), s.get("description", ""), " ".join(s.get("use_for", [])), " ".join(s.get("tags", [])), s.get("category", "")]).lower(),
                    "dur": s.get("duration"), "sync": (s.get("sync") or {}).get("at", 0), "lufs": (s.get("level") or {}).get("lufs")})
UCS = {"FEET": "footstep step walk run", "TOON": "cartoon toon comedy", "METL": "metal", "FGHT": "fight punch hit", "WHSH": "whoosh", "SWSH": "swish",
       "VOX": "voice", "UI": "interface ui", "CREA": "creature", "MUSC": "music stinger", "CLOTH": "cloth", "WOOD": "wood", "PLAS": "plastic", "GORE": "squash splat",
       "DOOR": "door", "MECH": "mechanical", "WATR": "water", "BLLT": "bullet shell", "AMB": "ambience", "ANML": "animal", "VEH": "vehicle", "TOOL": "tool", "OBJ": "object", "WEAP": "weapon"}
oc = lib / "meta-open-sound" / "corpora" / "oculus-audio-pack" / "ogg"
if oc.exists():
    for f in sorted(oc.glob("*.ogg")):
        m = re.match(r"([A-Z]+)([A-Z][a-z]+)?_([A-Za-z0-9]+)", f.stem); cat = m.group(1) if m else ""
        words = re.sub(r"([a-z])([A-Z])", r"\1 \2", f.stem.replace("_", " ")).lower()
        extra = " ".join(v for k, v in UCS.items() if f.stem.startswith(k))
        out.append({"id": "oc-" + f.stem, "file": str(f.relative_to(lib)), "license": "CC BY 4.0 (Oculus Audio Pack by Meta)", "name": f.stem,
                    "text": (words + " " + extra).lower(), "dur": None, "sync": 0, "lufs": None})
bsb = lib / "bigsoundbank" / "sounds.json"
if bsb.exists():
    for n, m in json.loads(bsb.read_text()).items():
        out.append({"id": "bsb-" + m["name"], "file": "bigsoundbank/" + m.get("file", f"{n}.flac"), "license": "CC0 (BigSoundBank)", "name": m["title"],
                    "text": (m["title"] + " " + m["name"].replace("-", " ") + " " + m["tags"]).lower(), "dur": None, "sync": 0, "lufs": None})
(lib / "index.json").write_text(json.dumps(out, ensure_ascii=False))
print(f"каталог: {len(out)} звуков → {lib / 'index.json'}")
