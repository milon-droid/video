#!/usr/bin/env python3
"""Звук «Didn't Want To Anyway»: cue-лист из timeline.json → sfx.json (потом tools/sfx.py).
    python3 projects/ne-ochen/build_sfx.py && python3 tools/sfx.py projects/ne-ochen/sfx.json -o projects/popal/remotion/public/ne-mix.wav --duration 46.5
Музыка — до раскрытия в ложе, затем резкая тишина (по ТЗ), тихий фон комнаты, финальный свисток на чёрном."""
import json, pathlib
R = pathlib.Path(__file__).resolve().parent
TL = json.load(open(R.parent / "popal/remotion/src/ne/timeline.json"))
S = {s["id"]: s for s in TL["shots"]}; A = lambda sid, t=0: round(S[sid]["a"] + t, 3)
c = []
def lib(t, i, g=1, r=1, al="sync"): c.append({"t": t, "type": "lib", "id": i, "gain": g, "rate": r, "align": al})
def syn(t, ty, g=1, **k): c.append({"t": t, "type": ty, "gain": g, **k})
reveal = A("lounge", 1.0)
c.append({"t": 0, "type": "file", "path": "projects/ne-ochen/render/music.wav", "gain": .45, "dur": reveal})
for s in TL["shots"]:
    if "vo" in s:
        f = "b2_echo" if s["id"] == "flash" else s["vo"]
        c.append({"t": A(s["id"], s["at"]), "type": "file", "path": f"projects/ne-ochen/assets/vo2/{f}.wav", "gain": 1, "voice": True})
# 1: ТВ, диван, телефон
lib(A("tv", .3), "shimmer-long-soft", .35, 1, "start"); lib(A("tv", 2.4), "whoosh-slow-soft", .5, 1, "start")
lib(A("couch", 1.0), "impact-heavy-firm", .7, 1.6); lib(A("couch", 1.02), "bsb-snow-steps-quick", .6, 1.6, "start"); syn(A("couch", 1.0), "pop", .5)
lib(A("grab", .3), "zip-out-soft", .6)
for k in range(24): syn(A("phone", .25 + k * .085), "click", .25)
lib(A("phone", 2.3), "zip-out-medium", .7); lib(A("phone", 4.15), "notification-message-in-clear", .9)
lib(A("toss", 1.0), "whoosh-fast-medium", .7); lib(A("toss", 1.45), "impact-deep-soft", .45)
# 2–3: стадион (гул трибун до коридора)
t = A("bench")
while t < A("corridor"): lib(round(t, 3), "celebration-applause-small", .22, .8, "start"); t += 2.6
syn(A("bench", .15), "refwhistle", .5, dur=.35); lib(A("bench", .45), "whoosh-fast-soft", .6)
lib(A("shake", .35), "impact-heavy-firm", .55, 1.9); lib(A("shake", .8), "impact-heavy-firm", .35, 1.7); lib(A("shake", 1.15), "impact-heavy-firm", .35, 1.7)
lib(A("run", .3), "impact-heavy-firm", .5, 1.3)
lib(A("box", .15), "shimmer-long-sparkle", .4, 1, "start")
syn(A("hearts", .35), "boing", .5)
lib(A("miss", .3), "whoosh-medium-hard", .5, 1, "start"); lib(A("miss", .55), "impact-deep-hard", .9); lib(A("miss", .6), "whoosh-fast-hard", .7, .8, "start")
syn(A("fans", .05), "wah", .6); lib(A("fans", .05), "celebration-applause-big", .5, .55, "start")
# 4–5: коридор, дверь, твист, тишина
lib(A("corridor", 1.05), "shimmer-long-bright", .45, 1, "start"); syn(A("corridor", 1.05), "pop", .5)
lib(A("door", .2), "bsb-door-creak-open", .7, 1, "start")
syn(reveal - .12, "rewind", .55, dur=.35)
syn(reveal + .25, "wind", .05, dur=TL["total"] - reveal - .25)     # еле слышный фон комнаты, без цифровой тишины
lib(A("flash", 0), "whoosh-slow-soft", .5, .8, "start")
syn(A("hide", .5), "brush", .3)
syn(A("black", .15), "refwhistle", .7, dur=.25); syn(A("black", .55), "refwhistle", .7, dur=.25); syn(A("black", .95), "refwhistle", .8, dur=1.0)
json.dump(c, open(R / "sfx.json", "w"), ensure_ascii=False, indent=0); print(len(c), "звуков, раскрытие", reveal)
