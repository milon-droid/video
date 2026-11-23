#!/usr/bin/env python3
"""Звуки серии 1 по монтажу → sfx.json (формат tools/sfx.py). Время — глобальное (с)."""
import json
C = []
def lib(t, id, g=.7, **k): C.append({"t": round(t, 3), "type": "lib", "id": id, "gain": g, **k})
def syn(t, ty, g=.6, **k): C.append({"t": round(t, 3), "type": ty, "gain": g, **k})
# 1–2 ночь: сверчки, шаги, «жвачка» и «чпок», глаза, тень встаёт
lib(0, "oc-AMBForst_Night_LOOP_01", .35, dur=7.3, align="start")
for i in range(8): lib(.12 + i * .4, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .35 - i * .02, align="start")
lib(.5, "transform-stretch", .7, align="start"); lib(1.05, "pop-large-bubble", 1.0, align="sync"); lib(1.06, "impact-light-soft", .5)
lib(1.7, "shimmer-medium-bright", .35, align="start")
lib(3.55, "reverse-whoosh-long-soft", .6, align="start"); lib(4.6, "shimmer-long-soft", .3, align="start")
lib(5.35, "transform-stretch", .45, align="start", rate=.8)
for i in range(3): lib(6.15 + i * .45, "impact-light-soft", .25)
# переходы «тень-шторка»
for w in (7.2, 32.2, 47.2, 66.6): lib(w - .4, "whoosh-slow-soft", .8, align="start")
# 3 кухня
lib(7.2, "oc-AMBForst_ForestBirds_OS_01", .3, dur=5.2, align="start"); lib(7.3, "bsb-kettle-electric", .25, dur=5, align="start")
lib(7.75, "pop-large-in", .5); lib(8.2, "pop-large-in", .5)
syn(8.35, "hiss", .55, dur=.9, lo=2500, hi=8000, pulse=0)
lib(9.8, "digital-denied", .55); lib(10.05, "whoosh-fast-soft", .6, align="start")
# 4 письмо
lib(12.6, "writing-marker-write", .55, align="start"); lib(13.9, "writing-marker-draw", .5, align="start"); lib(15.2, "writing-marker-write", .5, align="start")
lib(14.4, "props-drip", .35, align="start"); lib(15.2, "impact-heavy-firm", .8); lib(16.0, "click-clap-medium", .5); lib(16.4, "writing-scribble", .45, align="start")
# 5 петля: штамп
lib(21.1, "impact-deep-hard", .9); lib(21.1, "click-clap-firm", .5)
# 6 P.S. и рука
lib(22.6, "writing-marker-write", .45, align="start"); lib(23.9, "writing-scribble", .35, align="start")
lib(24.9, "shimmer-long-sparkle", .45, align="start"); lib(26.0, "shimmer-long-soft", .35, align="start")
lib(25.0, "time-clock-fast", .2, align="start")
# 7 телефон → рывок
lib(27.6, "notification-message-in-clear", .6); lib(28.7, "pop-small-bubble", .5)
lib(29.9, "whoosh-medium-soft", .5, align="start"); lib(31.3, "whoosh-fast-soft", .7, align="start")
# 8 погоня: город, автобус, бег, прыжок
lib(32.2, "oc-AMBUrbn_CityEuroDaytime_LOOP_01", .22, dur=15, align="start")
lib(32.3, "oc-VEHCar_CarEngineHigh_LOOP_01", .13, dur=4.8, align="start", rate=.6)
lib(33.0, "whoosh-slow-hard", .4, align="start")
for i in range(9): lib(32.3 + i * .38, "oc-FEETHmn_ShoeConcreteRun_OS_0%d" % (1 + i % 2), .4, align="start")
lib(35.7, "whoosh-fast-soft", .6, align="start"); lib(36.3, "impact-heavy-soft", .7)
for i in range(2): lib(36.6 + i * .38, "oc-FEETHmn_ShoeConcreteRun_OS_0%d" % (1 + i % 2), .4, align="start")
# 9 танцы
lib(38.6, "celebration-applause-small", .28, align="start"); lib(39.8, "celebration-applause-big", .22, align="start")
for i in range(5): lib(37.3 + i * .38, "oc-FEETHmn_ShoeConcreteRun_OS_0%d" % (1 + i % 2), .3, align="start")
# 10 фонтан
syn(42.2, "hiss", .25, dur=5, lo=500, hi=4000, pulse=0)
lib(43.6, "props-splash", .65, align="start"); lib(44.4, "props-splash", .6, align="start"); lib(45.2, "props-splash", .5, align="start")
for i in range(12): lib(42.3 + i * .38, "oc-FEETHmn_ShoeConcreteRun_OS_0%d" % (1 + i % 2), .3, align="start")
# 11–14 крыша: ветер, шаги, буквы, возвращение, ладони
syn(47.2, "hiss", .14, dur=19.4, lo=150, hi=900, pulse=0)
lib(47.2, "oc-MUSCChim_WindChimes_LOOP_01", .12, dur=19, align="start")
for i in range(4): lib(47.4 + i * .42, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
lib(53.5, "shimmer-long-soft", .4, align="start"); lib(53.9, "writing-marker-write", .45, align="start"); lib(55.0, "writing-marker-draw", .4, align="start")
for i in range(3): lib(59.3 + i * .45, "impact-light-soft", .22)
lib(60.4, "reverse-whoosh-long-soft", .6, align="start"); lib(61.2, "notification-success-sparkle", .6); lib(61.2, "shimmer-long-bright", .5, align="start")
lib(62.0, "writing-marker-write", .3, align="start")
lib(65.35, "impact-light-soft", .8); lib(65.35, "shimmer-medium-bright", .45, align="start")
# 15 неон
syn(66.6, "hum50", .25, dur=4.6, attack=.1); lib(66.6, "oc-AMBForst_Night_LOOP_01", .25, dur=7, align="start")
syn(68.6, "zap", .45, dur=.5); syn(68.9, "zap", .3, dur=.3)
for i in range(4): lib(66.7 + i * .4, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
lib(69.45, "shimmer-medium-bright", .25, align="start", rate=.7)
# 16 финал: хвост атмосферы до конца
lib(71.0, "oc-AMBForst_Night_LOOP_01", .2, dur=2.6, align="start")
# v4: план 14 удлинён на 2,2 с — всё с 66.6 сдвигается; удар кулачков и договор — заново
OLD_BUMP = [c for c in C if abs(c["t"] - 65.35) < .01]
for c in OLD_BUMP: C.remove(c)
for c in C:
    if c["t"] >= 66.6 - .41: c["t"] = round(c["t"] + 2.2, 3)
lib(22.45, "impact-light-soft", .7); lib(22.45, "foley-card-slide", .6, align="start"); lib(23.55, "writing-marker-draw", .5, align="start")
lib(61.75, "impact-light-soft", .6); lib(61.75, "foley-card-slide", .5, align="start"); lib(62.6, "writing-marker-tick", .5)
lib(64.4, "whoosh-medium-soft", .6, align="start")
for i in range(4): lib(65.0 + i * .42, "writing-marker-tick", .7); lib(64.8 + i * .42, "pop-small-bubble", .4)
lib(66.55, "writing-scribble", .55, align="start"); lib(66.85, "impact-heavy-soft", .7); lib(67.1, "impact-deep-hard", .6); lib(67.3, "whoosh-fast-soft", .6, align="start")
lib(68.3, "impact-light-soft", .8); lib(68.3, "shimmer-medium-bright", .45, align="start")
lib(35.55, "impact-heavy-firm", .5)
# EN-финал: старый крючок (неон, забастовка) убран: всё в v5 68.8–73.2, кроме шторки
C[:] = [c for c in C if not (68.8 <= c["t"] < 73.2)]
from warp import warp
for c in C: c["t"] = round(warp(c["t"]), 3)
A0 = warp(68.8 - .001)
for o, idd, g in [(.35, "click-clap-medium", .3), (1.7, "pop-small-bubble", .5), (2.55, "shimmer-long-soft", .5), (5.4, "whoosh-medium-soft", .5), (5.6, "pop-large-in", .6), (7.4, "foley-card-slide", .5)]: lib(A0 + o, idd, g, align="start")
G0 = warp(68.8)
for i in range(4): lib(G0 + .1 + i * .4, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
for i in range(6): lib(G0 + .5 + i * .36, "click-clip-soft", .35)
lib(G0 + 2.65, "notification-success-sparkle", .5); lib(G0 + 3.7, "whoosh-medium-soft", .6, align="start"); lib(G0 + 4.4, "move-spring", .45, align="start")
lib(G0, "oc-AMBForst_Night_LOOP_01", .25, dur=10, align="start")
json.dump(C, open("sfx.json", "w"), ensure_ascii=False, indent=0)
print(len(C), "cues")
