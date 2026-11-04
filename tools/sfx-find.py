#!/usr/bin/env python3
"""Найти звук в библиотеке: python3 tools/sfx-find.py "heavy metal impact" [-n 10]"""
import argparse, json
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("query"); ap.add_argument("-n", type=int, default=10); a = ap.parse_args()
idx = json.loads((Path(__file__).resolve().parent.parent / "assets/sfx-library/index.json").read_text())
q = a.query.lower().split()
scored = sorted(((sum(w in s["text"] for w in q) + (2 if all(w in s["text"] for w in q) else 0), s) for s in idx), key=lambda x: -x[0])
for sc, s in scored[: a.n]:
    if sc <= 0: break
    print(f"{sc:2d}  {s['id']:<48} {('%.2fs' % s['dur']) if s['dur'] else '     '}  {s['license'][:6]}  {s['name'][:50]}")
