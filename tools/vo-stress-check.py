#!/usr/bin/env python3
"""Проверка ударений в готовой озвучке по звуку (детектор meter2 из siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf;
обучен частично на Silero — только как внутренняя проверка, в ролик не идёт).

    METER2_HEAD=~/models/rus/meter/head.pt ~/.venvs/qwentts/bin/python tools/vo-stress-check.py lines.json <папка с wav> [--only a1,b1]

Ожидаемое ударение — та же разметка, что в tools/vo-qwen.py (словарь + «+»). Печатает слова, где звук не совпал.
"""
import sys, json, re, argparse, importlib.util, os
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("dir"); ap.add_argument("--only"); a = ap.parse_args()
sys.path.insert(0, os.path.expanduser("~/models/rus/meter"))
from meter2 import judge_file, marked_index
spec = importlib.util.spec_from_file_location("vq", Path(__file__).with_name("vo-qwen.py"))
src = Path(__file__).with_name("vo-qwen.py").read_text(encoding="utf-8")
ns = {"__file__": str(Path(__file__).with_name("vo-qwen.py"))}; exec(src[:src.index("if a.check:")].replace("a = ap.parse_args()", "a = ap.parse_args([sys.argv[1]])"), ns)  # mark() и словарь
cfg = json.loads(Path(a.lines).read_text(encoding="utf-8")); bad = 0
for ln in cfg["lines"]:
    if a.only and ln["id"] not in a.only.split(","): continue
    marked = ns["mark"](ln["text"]); words = re.findall(r"[А-Яа-яЁё́+]+(?:-[А-Яа-яЁё́+]+)*", marked)
    res = judge_file(str(Path(a.dir) / f"{ln['id']}.wav"), marked)
    for w, r in zip(words, res):
        exp = marked_index(w)
        if exp is None or r["best"] is None or len(r["vowel_scores"] or []) < 2: continue
        if r["best"] != exp:
            bad += 1; print(f"{ln['id']}: «{w}» — ждали гласную {exp + 1}, в звуке {r['best'] + 1} (уверенность {r['margin']:.2f})")
print("несовпадений:", bad)
