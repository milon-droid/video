#!/usr/bin/env python3
"""Звуки серии 2 по монтажу (времена событий — как в three/src/ep2.js) → sfx2.json для tools/sfx.py."""
import json, os, sys
R0 = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R0)
from timing import load
TM = load(); ST, AT, D = TM['starts'], TM['at'], TM['durs']; SH = dict(TM['shots'])
end = lambda k: ST[k] + SH[k]
C = []
def lib(t, id, g=.7, **k): C.append({"t": round(t, 3), "type": "lib", "id": id, "gain": g, **k})
def syn(t, ty, g=.6, **k): C.append({"t": round(t, 3), "type": ty, "gain": g, **k})
def amb(k0, k1, id, g): lib(ST[k0], id, g, dur=round(end(k1) - ST[k0], 2), align="start")
# переходы «тень-шторка»
for k in ('S4', 'S5', 'S11', 'S12', 'S15'): lib(ST[k] - .4, "whoosh-slow-soft", .75, align="start")
# 1 ХУК: улица, разворот, рывок за худи, толчок, дверь с колокольчиком
amb('S1', 'S1', "oc-AMBUrbn_CityEuroDaytime_LOOP_01", .22)
for i in range(3): lib(.6 + i * .3, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
lib(1.25, "foley-fabric-slide", .8); lib(1.25, "move-spring", .35, rate=1.3); lib(1.27, "whoosh-fast-soft", .5, align="start")
PUSH = AT['a3'] + .15; IN = PUSH + .35
lib(PUSH, "whoosh-fast-hard", .6, align="start"); lib(PUSH + .05, "impact-light-soft", .6)
lib(PUSH + .1, "oc-DOORGlas_GlassDoorOpen_OS_01", .55, align="start"); lib(PUSH + .15, "props-shop-bell", .6, align="start")
lib(IN + .05, "pop-large-bubble", .5); lib(IN + .4, "shimmer-medium-bright", .3, align="start")
# 2–3 коридор: тук-тук пальцем, штамп, цилиндр и бабочка «пуф», «ба-дум» на шутку
s2 = ST['S2']; amb('S2', 'S3', "oc-AMBHome_RoomTone_LOOP_01", .3)
for i in range(6): lib(s2 + .65 + i * .35, "click-latch-soft", .45)
lib(AT['b2'] - .05, "impact-heavy-firm", .7); lib(AT['b2'] - .05, "click-clap-firm", .4)
lib(AT['c1'] + .1, "pop-large-in", .6); lib(AT['c1'] + .12, "shimmer-medium-bright", .25, align="start")
lib(AT['c2'] + .9, "pop-large-in", .55)
syn(AT['c3'] + D['c3'] + .05, "boing", .25)
# 4 правило: шелест карточки, штамп
lib(ST['S4'] + .1, "appear-flip-slow", .5, align="start"); lib(AT['d2'], "impact-heavy-firm", .7); lib(AT['d2'], "click-clap-firm", .35)
# 5–10 кафе: гул зала, кофемашина, страницы
amb('S5', 'S10', "oc-CRWDConv_Restaurant_LOOP_01", .16)
lib(ST['S5'] + .4, "oc-PAPRHndl_BookPageTurns_OS_01", .35, align="start")
lib(ST['S5'] + 1.0, "shimmer-long-soft", .35, align="start")  # «влюбился»
s6 = ST['S6']
for i in range(5): lib(s6 + .15 + i * .42, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .25, align="start")
lib(AT['f2'] + D['f2'] + .9, "foley-fabric-slide", .45)  # садится
# 7 чашка: стук, падение, «плюх», пауза
K = AT['g3'] - .3
lib(K, "foley-glass-touch", .8); lib(K + .3, "oc-PLASImpt_PlasticCupDrop_OS_01", .55); syn(K + .32, "puff", .4)
# 8 руки: касание — искра, отдёргивание
TOUCH = ST['S8'] + 2.9
lib(TOUCH, "shimmer-long-sparkle", .55, align="start"); lib(TOUCH + .35, "whoosh-fast-soft", .55, align="start"); lib(TOUCH + .36, "foley-fabric-touch", .5)
# 9 поворот: тени замирают и насвистывают
LOOK2 = AT['i3'] + D['i3'] + .2
lib(LOOK2, "whoosh-fast-soft", .45, align="start")
# 10 знакомство: рукопожатие, объятие теней, поднос
SHAKE = AT['j4'] + .2; HUG = SHAKE + .3; DROP = HUG + .6
lib(SHAKE, "click-clap-soft", .5); lib(HUG, "shimmer-long-bright", .45, align="start"); lib(HUG + .1, "whoosh-medium-soft", .45, align="start")
for i in range(2): lib(ST['S10'] + 1.0 + i * .5, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i), .2, align="start")
lib(DROP + .3, "oc-METLImpt_MetalObjDrop_OS_01", .75); lib(DROP + .35, "foley-glass-touch", .6); lib(DROP + .45, "oc-PLASImpt_PlasticCupDrop_OS_01", .5)
# 11 закат: птицы, шаги
amb('S11', 'S11', "oc-AMBForst_ForestBirds_OS_02", .25)
for i in range(int(SH['S11'] / .55)): lib(ST['S11'] + .2 + i * .55, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .14, align="start")
lib(ST['S11'] + 3.6, "shimmer-long-soft", .35, align="start")
# 12–14 ночь: сверчки; фонарь мигает и гаснет; снова включается; дверь
amb('S12', 'S14', "oc-AMBForst_Night_LOOP_01", .3)
OFF = AT['l2'] - .45
for i in range(4): lib(OFF - .5 + i * .12, "mechanical-switch-light", .4)
lib(OFF, "mechanical-switch-heavy", .7); lib(OFF + .02, "digital-interference", .25)
s13 = ST['S13']
for i in range(3): lib(s13 + .05 + i * .12, "mechanical-switch-light", .4)
lib(AT['m3'] + .8, "oc-DOORGlas_GlassDoorOpen_OS_01", .35, align="start"); lib(AT['m3'] + .1, "pop-large-out", .5)
for i in range(int(SH['S14'] / .56)): lib(ST['S14'] + .2 + i * .56, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .22, align="start")
# 15 финал: мягкий хвост
lib(ST['S15'] + .2, "shimmer-long-soft", .3, align="start")
json.dump(C, open(os.path.join(R0, 'sfx2.json'), 'w'), indent=0)
print(len(C), 'звуков; длина', round(TM['total'], 2))
