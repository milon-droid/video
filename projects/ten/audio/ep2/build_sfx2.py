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
    for k in ('FB', 'SS', 'S12'): lib(ST[k] - .4, "whoosh-slow-soft", .75, align="start")
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
    lib(AT['b13'] + .9, "impact-heavy-firm", .7); lib(AT['b13'] + .9, "click-clap-firm", .4)
    # CAT: цилиндр «пуф», кот готовится, прыжок, удар, шипение, цилиндр на коте
    c = ST['CAT']; amb('CAT', 'CAT', "oc-AMBHome_RoomTone_LOOP_01", .3)
    lib(c + .15, "pop-large-in", .6); lib(c + 1.45, "whoosh-fast-medium", .6, align="start"); lib(c + 1.75, "foley-fabric-touch", .7); lib(c + 1.76, "impact-light-soft", .6)
    syn(c + 1.8, "hiss", .45, dur=.6, lo=2500, hi=8000, pulse=0); lib(c + 2.15, "impact-light-soft", .5); lib(c + 2.3, "pop-large-bubble", .5)
    # S4 правило
    pass  # правило убрано: lib(ST['S4'] + .1, "appear-flip-slow", .
    # SS поиск: улица, быстрые шаги, кот, «нашёл»
    amb('SS', 'S1', "oc-AMBUrbn_CityEuroDaytime_LOOP_01", .2)
    for i in range(int(SH['SS'] / .32)): lib(ST['SS'] + .1 + i * .32, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .18, align="start")
    lib(AT['s9'], "shimmer-medium-bright", .3, align="start"); lib(AT['s6'] - .1, "impact-light-soft", .4); syn(AT['s10'] + .1, "wah", .3); lib(AT['s4'], "shimmer-long-sparkle", .5, align="start")
    # S1 дверь
    s1 = ST['S1']; G_ = AT['p4'] + 1.0; lib(G_, "foley-fabric-slide", .8); lib(G_, "move-spring", .35, rate=1.3)
    PUSH = AT['p2'] + .3; IN = PUSH + .75
    lib(PUSH, "whoosh-fast-hard", .6, align="start"); lib(PUSH + .05, "impact-light-soft", .6)
    lib(PUSH + .1, "oc-DOORGlas_GlassDoorOpen_OS_01", .55, align="start"); lib(PUSH + .15, "props-shop-bell", .6, align="start"); lib(IN + .4, "shimmer-medium-bright", .3, align="start")
    # кафе
    amb('S5', 'S10B', "oc-CRWDConv_Restaurant_LOOP_01", .15)
    for k in ('S1', 'S5', 'S10B', 'S11'): lib(ST[k] - .22, "whoosh-fast-hard", .55, align="start")
    for k in range(6): lib(ST['S10B'] + k * .6, "whoosh-fast-soft", .4, align="start")
    lib(ST['S10B'] + 1.35, "pop-large-bubble", .5); lib(ST['S10B'] + 1.4, "props-drip", .4, align="start")
    lib(ST['S5'] + .3, "oc-PAPRHndl_BookPageTurns_OS_01", .3, align="start"); lib(ST['S5'] + .7, "shimmer-long-soft", .3, align="start")
    lib(AT['e5'], "whoosh-fast-soft", .45, align="start")
    for i in range(5): lib(ST['S6'] + .15 + i * .42, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .22, align="start")
    lib(AT['f2'] + D['f2'] + .9, "foley-fabric-slide", .45)
    K = AT['g3'] - .3; lib(K, "foley-glass-touch", .8); lib(K + .3, "oc-PLASImpt_PlasticCupDrop_OS_01", .55); syn(K + .32, "puff", .4)
    TOUCH = ST['S8'] + 2.9; lib(TOUCH, "shimmer-long-sparkle", .55, align="start"); lib(TOUCH + .35, "whoosh-fast-soft", .5, align="start"); lib(TOUCH + .4, "transform-stretch", .45, align="start", rate=1.4)
    LOOK2 = AT['i3'] + D['i3'] + .2; lib(LOOK2, "whoosh-fast-soft", .45, align="start")
    SHAKE = ST['S10B'] + 3.85; KISS = SHAKE + .45; DROP = KISS + .6 + 1.6 + .4
    lib(SHAKE, "click-clap-soft", .5); lib(KISS, "pop-large-bubble", .6); lib(KISS + .05, "shimmer-long-bright", .45, align="start")
    for i in range(6): lib(KISS + .3 + i * .45, "pop-large-bubble", .35, rate=.8 + (i % 3) * .15)
    lib(DROP + .3, "oc-METLImpt_MetalObjDrop_OS_01", .75); lib(DROP + .35, "foley-glass-touch", .6); lib(DROP + .45, "oc-PLASImpt_PlasticCupDrop_OS_01", .5)
    # S11 закат
    amb('S11', 'S11', "oc-AMBForst_ForestBirds_OS_02", .22)
    for i in range(int(SH['S11'] / .55)): lib(ST['S11'] + .2 + i * .55, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .12, align="start")
    lib(ST['S11'] + 1.6, "whoosh-medium-soft", .4, align="start"); lib(ST['S11'] + 5.2, "pop-large-bubble", .5); lib(ST['S11'] + 5.25, "shimmer-long-soft", .35, align="start")
    # ночь
    amb('S12', 'S12', "oc-AMBForst_Night_LOOP_01", .28)
    OFF = AT['l2'] - .45
    for i in range(4): lib(OFF - .5 + i * .12, "mechanical-switch-light", .4)
    lib(OFF, "mechanical-switch-heavy", .7); lib(OFF + .02, "digital-interference", .25)
    ON = AT['l2'] + D['l2'] + .2
    if PART not in 'QR':
        for i in range(3): lib(ON + i * .1, "mechanical-switch-light", .45)

    # ещё звуки: курица на побеге и в монтаже, чмоки поцелуев, звон чашек, щелчок «Nope»
    lib(AT['fb2'] + .2, "oc-BIRDFowl_Chicken_OS_01", .45, align="start")
    lib(ST['S10B'] + .6, "oc-BIRDFowl_Chicken_OS_01", .5, align="start"); lib(ST['S10B'] + 1.8, "oc-BIRDFowl_Chicken_OS_01", .4, align="start", rate=1.2)
    for k in range(3): lib(ST['S10B'] + 2.4 + k * .18, "foley-glass-touch", .45)
    for k in range(7): lib(ST['H'] + .3 + k * .55, "pop-large-bubble", .35, rate=.75 + (k % 3) * .12)
    lib(AT['s10'], "move-spring", .5, rate=1.4)

def variants():
    if PART in ('QE', 'RE'):
        amb('S12', 'S12', "oc-AMBForst_Night_LOOP_01", .28); OFF = AT['l2'] - .45
        for i in range(4): lib(OFF - .5 + i * .12, "mechanical-switch-light", .4)
        lib(OFF, "mechanical-switch-heavy", .7); lib(OFF + .02, "digital-interference", .25)
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
    if PART in 'DEFGNO': amb('X' + PART, 'X' + PART, "oc-AMBForst_Night_LOOP_01", .26)
    if PART == 'N':
        GO = AT['m2'] + D['m2'] + .2; lib(GO + .8, "oc-DOORGlas_GlassDoorOpen_OS_01", .35, align="start"); lib(GO + 1.0, "click-latch-medium", .5); lib(GO + 1.5, "shimmer-medium-bright", .25, align="start")
        k0 = ST['KN']; lib(k0 + .4, "writing-marker-write", .5, align="start"); lib(AT['cw2'] + 1.2, "impact-heavy-firm", .7); lib(AT['cw2'] + 2.0, "whoosh-fast-hard", .6, align="start")
    if PART == 'O':
        for i in range(4): lib(ST['XO'] + .6 + i * .25, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .3, align="start")
        lib(AT['sh1'] + .4, "pop-large-in", .5); lib(ST['KO'] + .1, "impact-deep-hard", .8)
    if PART == 'P':
        amb('XP', 'XP', "oc-AMBHome_RoomTone_LOOP_01", .3); lib(AT['mp1'] - .8, "props-doorbell", .0); lib(AT['sp1'] + .6, "shimmer-long-soft", .3, align="start"); lib(AT['sp1'] + .6, "time-clock-fast", .3, align="start")
        lib(ST['KP'] - .4, "whoosh-slow-soft", .6, align="start")
    if PART in ('Q', 'R', 'QE', 'RE'):
        t0 = ST['XQ']; DO = AT['ms2'] + D['ms2'] + .25; BS = DO + .45; FZ0 = BS + 1.1; FZ1 = FZ0 + 1.7; G1 = FZ1 + 1.3; SH = AT['sh1']; S2 = AT['sh2']
        amb('XQ', 'XQ', "oc-AMBForst_Night_LOOP_01", .22)
        lib(t0 + .5, "oc-VEHCar_CarEngineSlow_LOOP_01", .55, dur=round(DO - t0 - .2, 2), align="start"); lib(t0 + 1.6, "bsb-tires-screech", .45, align="start")
        for i, dt in enumerate([0, .27, .5]): lib(t0 + 2.3 + dt, "oc-MACHInd_Hydraulic_OS_01", .45 - i * .1, align="start"); lib(t0 + 2.42 + dt, "impact-light-soft", .45 - i * .1)
        lib(t0 + .85, "mechanical-switch-heavy", .5); lib(t0 + .9, "shimmer-long-soft", .3, align="start")
        lib(DO, "oc-VEHDoor_CarDoorOpen_OS_01", .8, align="start")
        lib(BS + .05, "oc-FEETHmn_ShoeConcreteLand_OS_01", .9, align="start"); lib(BS + .07, "impact-deep-soft", .5); lib(BS + .7, "foley-fabric-slide", .5)
        lib(FZ0, "cinematic-slam-big", .85, align="start"); lib(FZ0 + .1, "whoosh-fast-hard", .6, align="start"); lib(FZ0 + .35, "impact-heavy-firm", .5); lib(FZ0 + .6, "click-clap-firm", .45)
        lib(FZ1 - .05, "oc-VEHDoor_CarDoorClose_OS_01", .6, align="start")
        for i in range(4): lib(FZ1 + i * .3, "oc-FEETHmn_ShoeConcreteLand_OS_0%d" % (1 + i % 2), .45, align="start")
        lib(FZ1 + .1, "transform-stretch", .6, align="start", rate=.7); lib(FZ1 + .2, "reverse-whoosh-long-strong", .4, align="start")
        lib(G1 + .1, "oc-GOREBone_SkullCracking_OS_01", .35, align="start"); lib(G1 + .45, "oc-GOREBone_SkullCracking_OS_02", .35, align="start")
        for i in range(5): lib(G1 + .2 + i * .25, "oc-FEETHmn_ShoeConcreteLand_OS_02", .12, align="start", rate=1.4)
        lib(AT['sb2'] - .1, "whoosh-fast-soft", .4, align="start")
        lib(AT['ex2'] + .2, "transform-stretch", .5, align="start", rate=1.3); lib(AT['ex2'] + .4, "shimmer-long-sparkle", .45, align="start"); lib(AT['ex2'] + .5, "digital-interference", .2)
        lib(SH + .5, "whoosh-fast-medium", .55, align="start"); lib(SH + 1.15, "foley-fabric-touch", .6)
        lib(S2 + .45, "oc-GOREBone_SkullCracking_OS_01", .45, align="start"); lib(S2 + .85, "oc-GOREBone_SkullCracking_OS_02", .45, align="start"); lib(S2 + .3, "digital-power-up", .4, align="start")
        k0 = ST['KQ']; A1 = AT['an1']; A2 = AT['an2']; E3 = AT['ex3']; F0 = E3 - 2.2; F1 = E3 - 1.25; F2 = E3 + D['ex3'] + .1; HIT = F2 + .3; F3 = F2 + 1.15; F4 = F3 + 1.25; F5 = F4 + .95
        lib(k0 - .2, "whoosh-slow-soft", .6, align="start"); lib(k0 + .05, "impact-deep-hard", .6)
        lib(A2, "cinematic-slam-big", .7, align="start")
        lib(F0, "oc-FEETHmn_ShoeConcreteLand_OS_01", .5, align="start"); lib(F0 + .3, "whoosh-medium-hard", .7, align="start"); lib(F0 + .32, "reverse-whoosh-medium-strong", .3, align="start")
        n = 0; t = F1
        while t < E3 - .1: lib(t, "oc-FGHTImpt_Kick_OS_0%d" % (1 + n % 5), .38, align="start", rate=1.25); n += 1; t += 1 / 7
        lib(F2, "whoosh-medium-hard", .6, align="start"); lib(HIT, "oc-FGHTImpt_PunchHardest_OS_01", .95, align="start"); lib(HIT, "impact-deep-hard", .7)
        lib(HIT + .05, "faller-1s-strong", .4, align="start"); lib(HIT + .6, "impact-heavy-firm", .7); lib(HIT + .62, "oc-FEETHmn_ShoeConcreteLand_OS_02", .6, align="start")
        lib(F3 + .6, "digital-power-up", .55, align="start"); lib(F3 + 1.0, "oc-UIMisc_Powerup_OS_01", .45, align="start")
        lib(F4, "oc-FEETHmn_ShoeConcreteLand_OS_01", .5, align="start"); lib(F4 + .1, "reverse-whoosh-long-strong", .5, align="start"); lib(F4 + .2, "whoosh-slow-soft", .5, align="start")
        lib(F5, "oc-FGHTImpt_PunchHarder_OS_01", .9, align="start"); lib(F5, "cinematic-slam-big", .9, align="start"); lib(F5 + .05, "bsb-ice-crack-1", .45, align="start")
        lib(F5 + .45, "whoosh-fast-hard", .5, align="start"); lib(F5 + .9, "pop-large-in", .4); lib(F5 + 1.3, "pop-large-in", .35)
    if PART in ('N', 'O', 'P', 'Q', 'R', 'QE', 'RE'):
        json.dump(C, open(os.path.join(R0, 'sfx2-%s.json' % PART), 'w'), indent=0); return
    if PART == 'D': lib(AT['wf1'] - .3, "whoosh-fast-soft", .45, align="start")
    if PART == 'E':
        lib(ST['XE'] + .6, "celebration-applause-big", .6, align="start"); lib(ST['XE'] + 1.0, "celebration-applause-small", .5, align="start")
        for k in range(4): lib(ST['XE'] + 1.4 + k * .25, "digital-denied", .0)
        lib(ST['XE'] + 1.4, "shimmer-medium-bright", .35, align="start")
    if PART == 'F':
        lib(ST['XF'] + .3, "oc-DOORGlas_GlassDoorOpen_OS_01", .4, align="start"); lib(ST['XF'] + 1.5, "shimmer-long-sparkle", .4, align="start")
        M = AT['lp2'] + D['lp2'] + .5
        for k in range(10): lib(M + .2 + k * .17, "foley-fabric-slide", .35)
    if PART == 'G':
        lib(AT['dd1'] - .2, "mechanical-switch-light", .5); lib(AT['dd1'] + D['dd1'] + 1.0, "click-latch-firm", .5); lib(AT['dd1'] + D['dd1'] + 1.2, "click-latch-firm", .5)
    c = ('K' if PART in 'DEFG' else 'C') + PART
    if PART != 'D': lib(ST[c] - .4, "whoosh-slow-soft", .7, align="start")
    lib(ST[c] + .2, "time-clock-fast", .2, align="start")

if PART in ('main', 'Q', 'R'): main_sfx()
if PART != 'main': variants()
json.dump(C, open(os.path.join(R0, 'sfx2%s.json' % ('' if PART == 'main' else '-' + PART)), 'w'), indent=0)
print(len(C), 'звуков; длина', round(TM['total'], 2))
