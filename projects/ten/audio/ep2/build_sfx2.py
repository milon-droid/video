#!/usr/bin/env python3
"""Звуки серии 2 по монтажу (времена событий — как в three/src/ep2.js) → sfx2.json для tools/sfx.py."""
import json, os, sys
R0 = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R0)
from timing import load
PART = os.environ.get('EP2_PART', 'main'); TM = load(); ST, AT, D = TM['starts'], TM['at'], TM['durs']; SH = dict(TM['shots'])
end = lambda k: ST[k] + SH[k]
C = []
def lib(t, id, g=.7, **k): C.append({"t": round(t, 3), "type": "lib", "id": id, "gain": g, **k})
def syn(t, ty, g=.6, **k): C.append({"t": round(t, 3), "type": ty, "gain": g, **k})
def amb(k0, k1, id, g): lib(ST[k0], id, g, dur=round(end(k1) - ST[k0], 2), align="start")
def main_sfx():
    for k in ('FB', 'S4', 'SS', 'S5', 'S11', 'S12'): lib(ST[k] - .4, "whoosh-slow-soft", .75, align="start")
    # H: зал, поцелуй теней, «перемотка»
    h = ST['H']; amb('H', 'H', "oc-CRWDConv_Restaurant_LOOP_01", .15); lib(h + .3, "shimmer-long-soft", .35, align="start")
    lib(end('H') - .8, "transform-stretch", .5, align="start", rate=1.6); lib(end('H') - .45, "whoosh-fast-hard", .55, align="start")
    # FB: ночь, шаги, «ой» и побег
    fb = ST['FB']; amb('FB', 'FB', "oc-AMBForst_Night_LOOP_01", .3)
    for i in range(4): lib(fb + .2 + i * .45, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .2, align="start")
    RUN = AT['fb2'] - .2; lib(RUN - .5, "pop-large-out", .5); lib(RUN, "whoosh-fast-soft", .7, align="start"); lib(RUN + .1, "move-spring", .3, rate=1.6)
    # S2–S2B коридор: смех Sam, записка шлёп, штамп
    amb('S2', 'S2B', "oc-AMBHome_RoomTone_LOOP_01", .3)
    lib(AT['b12'] + .1, "shimmer-medium-bright", .25, align="start")
    lib(AT['b13'] + .2, "foley-paper-touch", .7); lib(AT['b13'] + .22, "click-clap-medium", .4)
    lib(AT['b4'] - .05, "impact-heavy-firm", .7); lib(AT['b4'] - .05, "click-clap-firm", .4)
    # CAT: цилиндр «пуф», кот готовится, прыжок, удар, шипение, цилиндр на коте
    c = ST['CAT']; amb('CAT', 'CAT', "oc-AMBHome_RoomTone_LOOP_01", .3)
    lib(c + .15, "pop-large-in", .6); lib(c + 1.45, "whoosh-fast-medium", .6, align="start"); lib(c + 1.75, "foley-fabric-touch", .7); lib(c + 1.76, "impact-light-soft", .6)
    syn(c + 1.8, "hiss", .45, dur=.6, lo=2500, hi=8000, pulse=0); lib(c + 2.15, "impact-light-soft", .5); lib(c + 2.3, "pop-large-bubble", .5)
    # S4 правило
    lib(ST['S4'] + .1, "appear-flip-slow", .5, align="start"); lib(AT['d4'], "impact-heavy-firm", .7); lib(AT['d4'], "click-clap-firm", .35)
    # SS поиск: улица, быстрые шаги, кот, «нашёл»
    amb('SS', 'S1', "oc-AMBUrbn_CityEuroDaytime_LOOP_01", .2)
    for i in range(int(SH['SS'] / .32)): lib(ST['SS'] + .1 + i * .32, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .18, align="start")
    lib(AT['s5'], "shimmer-medium-bright", .3, align="start"); lib(AT['s6'] - .1, "impact-light-soft", .4); syn(AT['s7'] + .2, "wah", .3); lib(AT['s4'], "shimmer-long-sparkle", .5, align="start")
    # S1 дверь
    s1 = ST['S1']; lib(s1 + 1.2, "foley-fabric-slide", .8); lib(s1 + 1.2, "move-spring", .35, rate=1.3)
    PUSH = max(s1 + 2.4, AT['p2'] + .1); IN = PUSH + .4
    lib(PUSH, "whoosh-fast-hard", .6, align="start"); lib(PUSH + .05, "impact-light-soft", .6)
    lib(PUSH + .1, "oc-DOORGlas_GlassDoorOpen_OS_01", .55, align="start"); lib(PUSH + .15, "props-shop-bell", .6, align="start"); lib(IN + .4, "shimmer-medium-bright", .3, align="start")
    # кафе
    amb('S5', 'S10', "oc-CRWDConv_Restaurant_LOOP_01", .15)
    lib(ST['S5'] + .3, "oc-PAPRHndl_BookPageTurns_OS_01", .3, align="start"); lib(ST['S5'] + .7, "shimmer-long-soft", .3, align="start")
    E4 = AT['e4']; lib(AT['e3'] + .3, "transform-stretch", .5, align="start"); lib(E4 + .5, "move-spring", .5); lib(E4 + .5, "whoosh-fast-soft", .45, align="start")
    for i in range(5): lib(ST['S6'] + .15 + i * .42, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .22, align="start")
    lib(AT['f2'] + D['f2'] + .9, "foley-fabric-slide", .45)
    K = AT['g3'] - .3; lib(K, "foley-glass-touch", .8); lib(K + .3, "oc-PLASImpt_PlasticCupDrop_OS_01", .55); syn(K + .32, "puff", .4)
    TOUCH = ST['S8'] + 2.9; lib(TOUCH, "shimmer-long-sparkle", .55, align="start"); lib(TOUCH + .35, "whoosh-fast-soft", .5, align="start"); lib(TOUCH + .4, "transform-stretch", .45, align="start", rate=1.4)
    LOOK2 = AT['i3'] + D['i3'] + .2; lib(LOOK2, "whoosh-fast-soft", .45, align="start")
    SHAKE = AT['j4'] + .2; HUG = SHAKE + .3; DROP = HUG + .6; KISS = HUG + 1.7
    lib(SHAKE, "click-clap-soft", .5); lib(HUG, "shimmer-long-bright", .45, align="start"); lib(HUG + .1, "whoosh-medium-soft", .45, align="start"); lib(KISS, "pop-large-bubble", .45)
    lib(DROP + .3, "oc-METLImpt_MetalObjDrop_OS_01", .75); lib(DROP + .35, "foley-glass-touch", .6); lib(DROP + .45, "oc-PLASImpt_PlasticCupDrop_OS_01", .5)
    # S11 закат
    amb('S11', 'S11', "oc-AMBForst_ForestBirds_OS_02", .22)
    for i in range(int(SH['S11'] / .55)): lib(ST['S11'] + .2 + i * .55, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .12, align="start")
    lib(ST['S11'] + 1.6, "whoosh-medium-soft", .4, align="start"); lib(ST['S11'] + 5.2, "pop-large-bubble", .5); lib(ST['S11'] + 5.25, "shimmer-long-soft", .35, align="start")
    # ночь
    amb('S12', 'S13', "oc-AMBForst_Night_LOOP_01", .28)
    OFF = AT['l2'] - .45
    for i in range(4): lib(OFF - .5 + i * .12, "mechanical-switch-light", .4)
    lib(OFF, "mechanical-switch-heavy", .7); lib(OFF + .02, "digital-interference", .25)
    s13 = ST['S13']
    for i in range(3): lib(s13 + .05 + i * .12, "mechanical-switch-light", .4)
    GO = AT['m2'] + D['m2'] + .1; lib(GO + .8, "oc-DOORGlas_GlassDoorOpen_OS_01", .4, align="start"); lib(GO + 1.0, "click-latch-medium", .5)

def variants():
    if PART == 'A':
        amb('XA', 'XA', "oc-AMBForst_Night_LOOP_01", .28); t0 = ST['XA']; lib(t0 + .4, "oc-DOORGlas_GlassDoorOpen_OS_01", .7, align="start"); lib(t0 + .45, "impact-heavy-firm", .6)
        for i in range(6): lib(AT['x1'] + D['x1'] - .3 + i * .18, "click-latch-firm", .5)
        R_ = AT['x3'] + D['x3'] + .1; lib(R_, "whoosh-fast-hard", .7, align="start")
        for i in range(6): lib(R_ + .1 + i * .15, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
    if PART == 'B':
        amb('XB', 'XB', "oc-AMBHome_RoomTone_LOOP_01", .3); t0 = ST['XB']; lib(AT['y1'] + D['y1'] + .3, "pop-large-in", .4)
        syn(AT['y2'] - .1, "puff", .6); lib(AT['y2'] - .1, "props-drip", .5, align="start"); lib(AT['y3'] + .4, "shimmer-medium-bright", .3, align="start")
    if PART == 'C':
        amb('XC', 'XC', "oc-AMBHome_RoomTone_LOOP_01", .3); r0 = AT['z1'] + D['z1']
        lib(r0, "props-doorbell", .0); [lib(r0 + i * .5, "digital-radio", .0) for i in range(0)]
        for i in range(4): syn(r0 + i * .3, "tick", .4)
        lib(AT['z3'] + .3, "shimmer-medium-bright", .3, align="start"); lib(AT['z3'] + .5, "pop-large-bubble", .4)
    lib(ST['C' + PART] - .4, "whoosh-slow-soft", .7, align="start"); lib(ST['C' + PART] + .2, "time-clock-fast", .2, align="start")

if PART == 'main': main_sfx()
else: variants()
json.dump(C, open(os.path.join(R0, 'sfx2%s.json' % ('' if PART == 'main' else '-' + PART)), 'w'), indent=0)
print(len(C), 'звуков; длина', round(TM['total'], 2))
