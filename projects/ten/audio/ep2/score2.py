#!/usr/bin/env python3
"""Музыка серии 2 «The Date» — свой синтез (инструменты из ../score.py), привязка к монтажу ep2-lines.js.
Романтическая комедия: щипковые-«крадущиеся» (хук), джазовый лаунж в кафе (щётки, контрабас, пиано),
тема любви (пиано + челеста + струнный пад) на закате, тишина при погасшем фонаре, мьюзик-бокс в конце.
python3 score2.py music2.wav"""
import sys, os, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
R0 = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R0)
from timing import load
PART = os.environ.get('EP2_PART', 'main'); TM = load(); ST, AT, D = TM['starts'], TM['at'], TM['durs']; DUR = TM['total']
SR = 44100
src = open(os.path.join(R0, '..', 'score.py')).read()
blk = src[src.index('NOTES = '):src.index('# ===== A.')]
blk = blk[:blk.index('def put(')] + blk[blk.index('def env('):]
L = np.zeros(int(SR * (DUR + 4))); R = np.zeros_like(L); VERB = np.zeros_like(L)
rng = np.random.default_rng(11)
exec(blk)
def put(sig, t, gain=1., pan=0., verb=.2):
    i = int(t * SR)
    if i >= len(L) or i < 0: return
    j = min(len(L), i + len(sig)); s = sig[:j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.41; R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.41; VERB[i:j] += s * verb
sh = lambda k: ST[k]
end = lambda k: ST[k] + dict(TM['shots'])[k]
SH_ = lambda k: dict(TM['shots'])[k]
def chord(ns, t, d, g=.25, pan=0, cut=1600): put(pad([hz(n) for n in ns], d, .4, .8, cut), t, g, pan, .5)

def lounge(t0, t1, v=1., bright=0):
    b = 60 / 92; i = 0; t = t0
    LOUNGE = [('F2', ['A3', 'C4', 'E4', 'F4']), ('E2', ['G3', 'B3', 'D4', 'E4']), ('D2', ['F3', 'A3', 'C4', 'E4']), ('G2', ['F3', 'B3', 'D4', 'G4'])]
    WALK = {'F2': ['F2', 'A2', 'C3', 'E3'], 'E2': ['E2', 'G2', 'B2', 'D3'], 'D2': ['D2', 'F2', 'A2', 'C3'], 'G2': ['G2', 'B2', 'D3', 'F3']}
    while t < t1 - .1:
        root, ch = LOUNGE[(i // 4) % 4]; beat = i % 4
        put(bass(hz(WALK[root][beat]), b * .95), t, .5 * v, -.1, .05)
        put(brush(.55, .22), t, .22 * v, .35, .05); put(brush(.35, .1), t + b * .66, .14 * v, .35, .05)
        if beat == 0: [put(piano(hz(n), 2.2, .55), t + .02 * k, .2 * v, .1 * k - .1, .35) for k, n in enumerate(ch)]
        if beat == 2 and bright: put(celesta(hz(ch[-1]) * 2), t, .12 * v * bright, .3, .5)
        i += 1; t += b
def comic(t0, t1, bpm=112, v=1.):
    b = 60 / bpm; PROG = [('F2', ['F3', 'A3', 'C4']), ('D2', ['D3', 'F3', 'A3']), ('Bb1', ['Bb2', 'D3', 'F3']), ('C2', ['C3', 'E3', 'G3'])]; i = 0; t = t0
    while t < t1 - .2:
        root, ch = PROG[(i // 4) % 4]; beat = i % 4
        put(bass(hz(root) * (1.5 if beat == 2 else 1), b * .9), t, .5 * v, 0, .05)
        if beat in (1, 3): [put(pluck(hz(n), .25, .7), t + b * .5, .15 * v, .25 - k * .2, .1) for k, n in enumerate(ch)]
        put(brush(.5), t, .22 * v, .3, .05); i += 1; t += b
def sneak(t0, t1, v=1.):
    b = 60 / 120; seq = ['D3', 'F3', 'A3', 'F3', 'D3', 'F3', 'Bb3', 'A3']; i = 0; t = t0
    while t < t1 - .1: put(pluck(hz(seq[i % 8]), .35, .3), t, .45 * v, -.2 + (i % 2) * .4, .1); i += 1; t += b * .5
def cricket(d):
    n = int(SR * d); tt = np.arange(n) / SR; car = np.sin(2 * np.pi * 4300 * tt); gate = ((tt * 18) % 1 < .45) * ((tt * 1.6) % 1 < .55)
    return car * gate * .3
def whist(notes, dur=.32):
    out = []
    for f in notes:
        n = int(SR * dur); tt = np.arange(n) / SR; fr = f * (1 + .03 * np.sin(2 * np.pi * 5.5 * tt)); ph = 2 * np.pi * np.cumsum(fr) / SR
        out.append(np.sin(ph) * np.minimum(1, tt / .03) * np.minimum(1, (dur - tt) / .06))
    return np.concatenate(out) * .4
def main_music():
    MOT = ['A5', 'G5', 'F5', 'G5', 'A5', 'C6', 'A5']
    # H: холодное начало — томный пэд и лаунж, хлоп-«перемотка»
    lounge(sh('H') + .1, end('H') - .7, .8, 1); chord(['F3', 'A3', 'C4', 'E4'], sh('H'), SH_('H'), .2)
    put(riser(.6, .6), end('H') - .8, .3, 0, .2); put(swell(.5, .7), end('H') - .5, .4, 0, .2)
    # FB: ночь, челеста-мотив тени → паника (быстрые щипки вниз)
    chord(['D3', 'F3', 'A3'], sh('FB'), SH_('FB'), .16, 0, 1200)
    for k, n in enumerate(MOT[:4]): put(celesta(hz(n)), sh('FB') + .3 + k * .3, .2, -.2, .5)
    RUN = AT['fb2'] - .2
    for k, n in enumerate(['C6', 'A5', 'F5', 'D5', 'C5', 'A4', 'F4', 'D4']): put(pluck(hz(n), .2, .8), RUN + k * .07, .3, .3 - k * .08, .1)
    # S2–S2B: комедийный щипковый бас; на «crush» — дразнящая челеста; на «Please» — тёплый аккорд
    comic(sh('S2'), AT['b15'] - .1)
    for k, n in enumerate(['C6', 'A5', 'C6', 'A5']): put(celesta(hz(n)), AT['b12'] + .1 + k * .18, .2, .3, .5)
    chord(['F3', 'A3', 'C4', 'E4'], AT['b15'], end('S2B') - AT['b15'] + .3, .24, 0, 1800); put(piano(hz('A4'), 2.5, .6), AT['b15'] + .3, .25, 0, .5); put(piano(hz('C5'), 2.5, .6), AT['b15'] + .9, .25, 0, .5)
    # CAT: крадущиеся щипки → прыжок → крах цилиндра
    sneak(sh('CAT') + .6, sh('CAT') + 1.45, .8); put(riser(.4, .5), sh('CAT') + 1.05, .3, 0, .2); put(boom(.5, .8), sh('CAT') + 1.75, .35, 0, .1)
    for k, n in enumerate(['G4', 'F#4', 'F4', 'E4']): put(pluck(hz(n), .5, .5), sh('CAT') + 2.2 + k * .2, .3, 0, .2)
    # S4 правило
    pass  # правило убрано: put(drone(hz('D2'), SH_('S4') + .5, .8),
    pass  # правило убрано: for k in range(int(SH_('S4') / .5)): put
    pass  # правило убрано: put(boom(.6, 1.6), AT['d4'], .4, 0, .3)
    # SS поиск: крадущийся шаг; «THERE» — блёстки
    sneak(AT['s10'] - .1, AT['s4'], 1.0)
    for k, n in enumerate(['C6', 'E6', 'G6', 'C7']): put(celesta(hz(n)), AT['s4'] + k * .08, .25, .3, .6)
    # S1 дверь: рывок, толчок, тёплый аккорд за дверью
    s1 = sh('S1'); PUSH = AT['p2'] + .3
    put(swell(.5, .7), AT['p4'] + .55, .5, 0, .2); put(pluck(hz('C#3'), .3, .2), AT['p4'] + 1.0, .7, 0, .1)
    put(riser(.8, .6), PUSH - .8, .35, 0, .3); put(boom(.5, 1.0), PUSH, .5, 0, .2)
    chord(['F3', 'A3', 'C4', 'E4'], PUSH + .3, end('S1') - PUSH + .5, .22)
    for k, n in enumerate(['C5', 'F5', 'A5', 'C6']): put(celesta(hz(n)), PUSH + .45 + k * .12, .25, .3, .5)
    AWK = AT['s6'] + D['s6'] + .1; R0 = sh('SS'); SCR = AT['s6'] - .4
    chord(['F3', 'A3', 'C4', 'E4'], R0, SCR - R0, .26, 0, 2600)
    for k, n in enumerate(['A5', 'C6', 'E6', 'F6', 'E6', 'C6', 'A5', 'C6']):
        if R0 + .3 + k * .4 < SCR - .1: put(celesta(hz(n)), R0 + .3 + k * .4, .26, .2, .6)
    sw = int(SR * .5); tt = np.arange(sw) / SR; fr = 900 * np.exp(-tt * 5) + 120; ph = 2 * np.pi * np.cumsum(fr) / SR
    scr = (np.sign(np.sin(ph)) * .5 + rng.standard_normal(sw) * .5) * np.exp(-tt * 3) * (1 - np.exp(-tt * 80)); put(scr, SCR, .35, 0, .05)
    put(cricket(1.9), AWK, .35, .4, .3); put(whist([hz("G5"), hz("E5"), hz("G5"), hz("C6")]), AWK + .65, .3, -.2, .3)
    # S5–S10 кафе
    KNOCK = AT['g9'] - .15
    lounge(sh('S5') + .2, KNOCK, .9)
    S7 = sh('S7'); put(pad([hz('C4'), hz('E4'), hz('G4')], KNOCK - S7, 1.5, .1, 2200), S7, .18, 0, .4)
    for k, n in enumerate(['E3', 'D3', 'E3', 'G3']): put(pluck(hz(n), .25, .5), KNOCK - 1.1 + k * .25, .3, -.2, .1)  # крадущиеся щипки
    TOUCH = sh('S8') + 2.9
    for k in range(8): put(pluck(hz(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'][k]), .3, .6), sh('S8') + .9 + k * .25, .25, 0, .2)
    for k, n in enumerate(['C6', 'E6', 'G6', 'C7', 'E7']): put(celesta(hz(n)), TOUCH + k * .07, .22, .4 - k * .15, .6)
    chord(['F3', 'A3', 'C4', 'E4', 'G4'], TOUCH, 2.0, .3, 0, 2400)
    for k, n in enumerate(['E4', 'G4', 'B4']): put(pluck(hz(n), .5, .6), AT['i2'] + D['i2'] + .1 + k * .18, .25, 0, .3)
    def whistle(f, d):
        t = T(d); fm = f * (1 + .012 * np.sin(2 * np.pi * 6 * t)); s = np.sin(2 * np.pi * np.cumsum(fm) / SR) + .04 * rng.uniform(-1, 1, len(t))
        return s * env(len(t), .03, .06) * .5
    LOOK2 = AT['i3'] + D['i3'] + .2; WH = [('G6', .25), ('E6', .25), ('G6', .25), ('C7', .45), ('B6', .2), ('G6', .5)]
    for k, (n, d) in enumerate(WH): put(whistle(hz(n), d), LOOK2 + .45 + sum(x[1] for x in WH[:k]) * 1.05, .22, .2, .3)
    HUG = sh('S10B') + 4.3
    lounge(sh('S10') + .3, HUG, 1.0, 1)
    for k in range(6): put(swell(.2, .5), sh('S10B') + k * .6 - .1, .2, 0, .1); put(kick(.8), sh('S10B') + k * .6, .3, 0, 0); put(clap(.7), sh('S10B') + k * .6 + .3, .25, .2, .1)
    chord(['F3', 'C4', 'F4', 'A4', 'C5'], HUG, end('S10B') - HUG + .8, .32, 0, 3000)
    for k, n in enumerate(['A5', 'C6', 'F6', 'A6']): put(celesta(hz(n)), HUG + .1 + k * .1, .22, .3, .6)
    # S11 тема любви, ритм на танце
    t0, t1 = sh('S11'), end('S11')
    LOVE = [('F2', ['F3', 'A3', 'C4', 'E4']), ('A1', ['E3', 'A3', 'C4', 'E4']), ('Bb1', ['F3', 'Bb3', 'D4', 'F4']), ('C2', ['E3', 'G3', 'C4', 'E4'])]
    o = 0; i = 0
    while t0 + o < t1:
        bn, ch = LOVE[i % 4]; put(bass(hz(bn), 1.8, .8), t0 + o, .45, 0, .2); [put(piano(hz(n), 2.6, .5), t0 + o + k * .05, .2, k * .1 - .15, .45) for k, n in enumerate(ch)]; chord(ch, t0 + o, 2.2, .14, 0, 2000); o += 1.75; i += 1
    for k in range(int((t1 - t0 - 2.8) / .25)): put(kick(.7), t0 + 2.8 + k * .5, .25, 0, 0); put(clap(.6), t0 + 3.05 + k * .5, .2, .2, .1)
    MEL = [(.2, 'C5'), (.6, 'A5'), (1.1, 'G5'), (1.5, 'F5'), (2.0, 'E5'), (2.4, 'C5'), (3.0, 'D5'), (3.8, 'D5'), (4.2, 'F5'), (4.7, 'Bb5'), (5.2, 'A5'), (5.6, 'G5'), (6.2, 'C6'), (6.8, 'A5')]
    for rep in (0, 7.0):
        for o, n in MEL:
            if t0 + rep + o < t1 + .3: put(piano(hz(n), 2.0, .7), t0 + rep + o, .26, .1, .6); put(celesta(hz(n)), t0 + rep + o, .1, -.2, .6)
    # S12 ночь: пэд + сердце → тишина
    t0 = sh('S12'); OFF = AT['l2'] - .45
    chord(['D3', 'F3', 'A3', 'C4'], t0, OFF - t0 + .1, .2, 0, 1400)
    for k in range(int((OFF - (t0 + 1.2)) / .6)): put(heart(.8), t0 + 1.2 + k * max(.42, .65 - k * .04), .45, 0, .1)
    put(boom(.7, 1.4), OFF, .45, 0, .2)
    # финал: свет снова зажёгся — короткий «упс»-аккорд и щипки
    ON = AT['l2'] + D['l2'] + .2
    if PART in ('Q', 'R', 'QE', 'RE'): return
    put(pluck(hz('E4'), .4, .8), ON, .35, 0, .2); put(pluck(hz('C4'), .5, .8), ON + .25, .3, 0, .2); chord(['F3', 'Ab3', 'C4'], ON, DUR - ON + .5, .2, 0, 1500)

def variants():
    if PART in ('QE', 'RE'):
        t0 = sh('S12'); OFF = AT['l2'] - .45
        chord(['D3', 'F3', 'A3', 'C4'], t0, OFF - t0 + .1, .2, 0, 1400)
        for k in range(int((OFF - (t0 + 1.2)) / .6)): put(heart(.8), t0 + 1.2 + k * max(.42, .65 - k * .04), .45, 0, .1)
        put(boom(.7, 1.4), OFF, .45, 0, .2)
    if PART == 'A':  # «Папа»: удар, низкие струны, бег-щипки
        t0 = sh('XA'); put(boom(.9, 2.0), t0 + .4, .55, 0, .3); put(drone(hz('C2'), SH_('XA'), 1.), t0 + .4, .5, 0, .3); chord(['C3', 'Eb3', 'Gb3', 'A3'], t0 + .4, SH_('XA') - .4, .2, 0, 1300)
        for k in range(8): put(heart(.9), AT['x1'] + D['x1'] + .1 + k * .45, .5, 0, .1)
        R_ = AT['x3'] + D['x3'] + .1; sneak(R_, end('XA'), 1.2); put(boom(.6, 1.0), end('XA') - .2, .45, 0, .2)
    if PART == 'B':  # «Малыш»: нежная колыбельная → стоп-удар → музыкальная шкатулка
        t0 = sh('XB'); comic(t0, AT['y2'] - .2, 100, .7); put(boom(.8, 1.4), AT['y2'] - .15, .5, 0, .2)
        for k, n in enumerate(['C6', 'E6', 'G6', 'E6', 'C6']): put(musicbox(hz(n)), AT['y3'] + .1 + k * .3, .32, .2, .6)
    if PART == 'C':  # «Обмен»: игривый щипковый бас + звонок + кокетливая челеста
        t0 = sh('XC'); comic(t0, end('XC'), 116, .8)
        for k, n in enumerate(['A5', 'C6', 'E6', 'A6']): put(celesta(hz(n)), AT['z3'] + k * .1, .25, .3, .6)
    if PART == 'D':  # мьюзик-бокс → две тени поворачиваются → обрыв в тишину
        t0 = sh('XD'); [put(musicbox(hz(n)), t0 + .4 + k * .45, .3, .2, .6) for k, n in enumerate(['A5', 'F5', 'C5', 'F5', 'A5', 'G5'])]; chord(['F3', 'A3', 'C4', 'E4'], t0, end('XD') - t0, .2, 0, 1600)
        put(riser(.5, .6), AT['wf1'] - .5, .3, 0, .2)
    if PART == 'E':
        t0 = sh('XE'); comic(t0 + .5, end('XE'), 120, .8); put(boom(.6, 1.0), AT['nn1'] - .1, .4, 0, .2)
    if PART == 'F':
        t0 = sh('XF'); chord(['F3', 'A3', 'C4', 'E4'], t0, 3.5, .22, 0, 1800); [put(celesta(hz(n)), t0 + .4 + k * .3, .2, .2, .6) for k, n in enumerate(['C6', 'A5', 'F5', 'A5', 'C6'])]
        comic(t0 + AT['lp2'] - t0 + D['lp2'] + .5, end('XF'), 126, .8)
    if PART == 'G':
        t0 = sh('XG'); put(boom(.9, 2.0), AT['dd1'] - .05, .55, 0, .3); put(drone(hz('C2'), SH_('XG'), 1.), t0 + .8, .5, 0, .3); chord(['C3', 'Eb3', 'Gb3', 'A3'], AT['dd1'], end('XG') - AT['dd1'], .2, 0, 1300)
        for k in range(6): put(heart(.9), AT['dd1'] + D['dd1'] + .3 + k * .45, .5, 0, .1)
    if PART == 'N':  # тёплый мьюзик-бокс → тени переглядываются: зловещий низ → заставка: челеста-мотив тени в миноре, удар на «NO SHADOWS»
        t0 = sh('XN'); [put(musicbox(hz(n)), t0 + .4 + k * .42, .3, .2, .6) for k, n in enumerate(['A5', 'F5', 'C5', 'F5', 'A5', 'G5', 'F5'])]; chord(['F3', 'A3', 'C4', 'E4'], t0, end('XN') - t0 - 1.0, .2, 0, 1600)
        put(drone(hz('D2'), 3.0, 1.), end('XN') - 1.8, .5, 0, .3); put(riser(1.0, .5), end('XN') - 1.0, .3, 0, .3)
        k0 = sh('KN'); [put(celesta(hz(n)), k0 + .3 + k * .28, .25, -.2, .6) for k, n in enumerate(['A5', 'G5', 'F5', 'E5', 'D5'])]; chord(['D3', 'F3', 'A3'], k0, DUR - k0, .2, 0, 1200)
        put(boom(.8, 1.6), AT['cw2'] + 1.2, .5, 0, .3); put(boom(.6, 1.0), AT['cw2'] + 2.0, .4, 0, .2)
    if PART == 'O':
        t0 = sh('XO'); put(bass(hz('E1'), 1.5), t0 + .6, .6, 0, .1); [put(kick(.9), t0 + .6 + k * .5, .35, 0, 0) for k in range(int((end('XO') - t0 - .6) / .5))]
        put(boom(.7, 1.2), AT['ex1'] - .05, .5, 0, .2); put(riser(1.0, .6), AT['sh1'] - .2, .3, 0, .3)
        k0 = sh('KO'); put(boom(1.0, 1.8), k0 + .1, .6, 0, .3); [put(snare(.9), k0 + .1 + k * .25, .3, 0, .1) for k in range(8)]
    if PART == 'P':
        t0 = sh('XP'); comic(t0, AT['mp1'] - .2, 104, .6); put(boom(.8, 1.6), AT['sp1'] - .05, .5, 0, .2); put(drone(hz('D2'), end('XP') - AT['sp1'] + 3, 1.), AT['sp1'], .5, 0, .3)
        for k in range(int((DUR - AT['sp1']) / .5)): put(tick(.6, 1700), AT['sp1'] + .6 + k * .5, .25, 0, .1)
    if PART in ('Q', 'R', 'QE', 'RE'):  # бас машины → тишина на двери → удар стоп-кадра → тяжёлый бит → тишина «Hold my hat» → бой (тайко-бит) → удар-стоп
        t0 = sh('XQ'); DO = AT['ms2'] + D['ms2'] + .25; BS = DO + .45; FZ0 = BS + 1.1; FZ1 = FZ0 + 1.3; SH = AT['lg1']; S2 = AT['sh3']
        put(drone(hz('D2'), DO - t0, 1.), t0, .35, 0, .3)
        k = 0
        while t0 + .4 + k * .48 < DO - .1:
            tt = t0 + .4 + k * .48; g = min(1, .35 + k * .12) * (.45 if any(AT[x] - .1 < tt < AT[x] + D[x] for x in ('mb1', 'sb1', 'ms2')) else 1); put(kick(1.0), tt, .5 * g, 0, 0); put(bass(hz('E1'), .4), tt, .45 * g, 0, .05); put(hat(.6), tt + .24, .14 * g, .3, 0); k += 1
        put(boom(.6, 1.0), AT['mb1'] - .05, .35, 0, .2)
        put(boom(.9, 1.6), BS, .45, 0, .3); put(riser(1.0, .6), BS + .1, .3, 0, .2)
        put(boom(1.3, 2.4), FZ0, .75, 0, .4); put(swell(1.2, .8), FZ0 + .1, .3, 0, .4)
        put(drone(hz('C2'), SH - FZ1, 1.), FZ1, .45, 0, .3); chord(['C3', 'Eb3', 'Gb3'], FZ1, SH - FZ1, .18, 0, 1100)
        k = 0
        while FZ1 + k * .6 < SH - .3:
            tt = FZ1 + k * .6; put(kick(1.0), tt, .45, 0, 0); put(hat(.7), tt + .3, .16, .3, 0)
            if k % 2: put(snare(.9), tt, .25, 0, .15)
            k += 1
        put(boom(.7, 1.2), AT['ex1'] - .05, .45, 0, .2); put(boom(.8, 1.4), AT['ex2'] - .05, .5, 0, .2); put(riser(1.4, .5), AT['ex2'] + .6, .25, 0, .2)
        put(riser(max(.6, S2 - SH - .3), .7), SH + .2, .3, 0, .3); put(boom(.8, 1.4), AT['ex4'] - .05, .45, 0, .2); put(boom(1.0, 2.0), S2 + .3, .6, 0, .3)
        k0 = sh('KQ'); A1 = AT['an1']; A2 = AT['an2']; TPL = k0 + 1.3; TPR = TPL + 2.3; TP1 = TPR + 2.4; LUN = A2 + .1; FZ = LUN + .5
        put(boom(1.0, 1.8), k0 + .05, .55, 0, .3); put(drone(hz('D2'), FZ - k0, 1.), k0, .35, 0, .3); chord(['D3', 'F3', 'A3'], k0, FZ - k0, .14, 0, 1200)
        k = 0
        while k0 + .4 + k * .5 < A1 - .2:   # тайко-шаг: удар на каждую строку таблицы
            tt = k0 + .4 + k * .5; put(kick(1.0), tt, .45, 0, .1); put(boom(.35, .5), tt, .18, 0, .2)
            if k % 2: put(snare(.7), tt + .25, .18, 0, .15)
            k += 1
        put(boom(1.4, 2.6), A1 - .2, .45, 0, .4)
        k = 0
        while A1 + .5 + k * .07 < A2: put(kick(.6 + .4 * k / 12), A1 + .5 + k * .07, .22 + .02 * k, 0, 0); k += 1
        put(boom(1.2, 2.0), A2 + .3, .55, 0, .3); put(riser(FZ - A2, .9), A2, .4, 0, .3)
        put(boom(1.6, 3.0), FZ, .9, 0, .5); chord(['D2', 'A2', 'D3', 'F3'], FZ + .6, DUR - FZ, .2, 0, 1200)
        return
    if PART in 'NOP': return
    c = ('K' if PART in 'DEFG' else 'C') + PART; t0 = sh(c)
    if PART == 'D': t0 += .6
    for k, (o, n) in enumerate([(0, 'A4'), (.5, 'C5'), (1.0, 'E5'), (1.5, 'D5'), (2.0, 'C5'), (2.6, 'B4'), (3.1, 'A4')]): put(musicbox(hz(n)), t0 + .2 + o, .3, .2, .6)
    chord(['A2', 'C3', 'E3'], t0, DUR - t0 + 1, .16, 0, 1200)

if PART in ('main', 'Q', 'R'): main_music()
if PART != 'main': variants()

# реверб и запись
ir_t = T(2.4); ir = rng.uniform(-1, 1, len(ir_t)) * np.exp(-ir_t * 2.4); ir = lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
wet = fftconvolve(VERB, ir)[:len(L)]; wetR = fftconvolve(VERB, np.roll(ir, 300))[:len(L)]
out = np.stack([L + wet * .9, R + wetR * .9], 1)[:int(DUR * SR)]
out = out / (np.abs(out).max() + 1e-9) * .89
fade = int(.8 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
import wave
with wave.open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(R0, 'music2.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok', round(out.shape[0] / SR, 2))
