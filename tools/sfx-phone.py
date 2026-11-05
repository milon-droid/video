#!/usr/bin/env python3
"""«Телефонная проверка» звуков: что останется от каждого звука на динамике смартфона.

    python3 tools/sfx-phone.py projects/<имя>/sfx-ep1.json [ещё.json ...] [--hp 300]

Динамик телефона почти не воспроизводит частоты ниже ~300 Гц: гул, сердце 50 Гц, мотор 32 Гц, рокот,
бочка — пропадают, хотя в наушниках звучат. Для каждого звука (кроме голоса и фоновой музыки)
считается, сколько дБ он теряет после фильтра 300 Гц (уже с автоматическим «верхним слоем» из sfx.py). Потеря больше 10 дБ — звук «исчезнет» у зрителя:
нужен верхний слой (щелчок, хруст, лязг, шорох, гармоники) — `"bright": true` в cue (tools/sfx.py).
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib.util
spec = importlib.util.spec_from_file_location("sfxmod", str(Path(__file__).resolve().parent / "sfx.py")); S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)

ap = argparse.ArgumentParser(); ap.add_argument("cues", nargs="+"); ap.add_argument("--hp", type=float, default=300); ap.add_argument("--limit", type=float, default=10)
a = ap.parse_args()
def render(c):
    if c["type"] == "lib": x, _ = S.lib_sound(c); return x
    if c["type"] in ("file", "duck"): return None
    return S.gen(dict(c))
bad_total = 0
for f in a.cues:
    cues = json.load(open(f, encoding="utf-8")); print(f"\n{f}")
    seen = {}
    for c in cues:
        if c["type"] in ("file", "duck"): continue
        key = c.get("id") or f'{c["type"]}:{c.get("pitch", 1)}:{c.get("freq", "")}'
        if key in seen: seen[key][1].append(c["t"]); continue
        x = render(c)
        if x is None or not len(x): continue
        x = S.phone_bright(np.asarray(x, float), c); full = np.sqrt(np.mean(x ** 2)) + 1e-12; hp = S.band(x, a.hp, 20000); ph = np.sqrt(np.mean(hp ** 2)) + 1e-12
        seen[key] = [20 * np.log10(full / ph), [c["t"]]]
    for key, (loss, ts) in sorted(seen.items(), key=lambda kv: -kv[1][0]):
        flag = "  [!] пропадёт на телефоне" if loss > a.limit else ""
        if loss > a.limit: bad_total += 1
        print(f"  {key:34s} −{loss:5.1f} дБ  (на {', '.join(f'{t:.1f}' for t in ts[:5])}{'…' if len(ts) > 5 else ''} с){flag}")
print(f"\nИтого звуков, которые пропадут на телефоне: {bad_total}")
