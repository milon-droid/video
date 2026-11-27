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
    put(drone(hz('D2'), SH_('S4') + .5, .8), sh('S4'), .5, 0, .3)
    for k in range(int(SH_('S4') / .5)): put(tick(.5, 1500 if k % 2 else 1900), sh('S4') + .25 + k * .5, .25, .3 if k % 2 else -.3, .1)
    put(boom(.6, 1.6), AT['d4'], .4, 0, .3)
    # SS поиск: крадущийся шаг; «THERE» — блёстки
    sneak(sh('SS'), AT['s4'], 1.0)
    for k, n in enumerate(['C6', 'E6', 'G6', 'C7']): put(celesta(hz(n)), AT['s4'] + k * .08, .25, .3, .6)
    # S1 дверь: рывок, толчок, тёплый аккорд за дверью
    s1 = sh('S1'); PUSH = max(s1 + 2.4, AT['p2'] + .1)
    put(swell(.5, .7), s1 + .75, .5, 0, .2); put(pluck(hz('C#3'), .3, .2), s1 + 1.2, .7, 0, .1)
    put(riser(.8, .6), PUSH - .8, .35, 0, .3); put(boom(.5, 1.0), PUSH, .5, 0, .2)
    chord(['F3', 'A3', 'C4', 'E4'], PUSH + .3, end('S1') - PUSH + .5, .22)
    for k, n in enumerate(['C5', 'F5', 'A5', 'C6']): put(celesta(hz(n)), PUSH + .45 + k * .12, .25, .3, .5)
    # S5–S10 кафе
    KNOCK = AT['g3'] - .3
    lounge(sh('S5') + .2, KNOCK, .9)
    put(pad([hz('C4'), hz('E4'), hz('G4')], KNOCK - AT['g4'], 1.5, .1, 2200), AT['g4'], .18, 0, .4); put(riser(KNOCK - AT['g5'], .5), AT['g5'], .2, 0, .3)
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
    HUG = AT['j4'] + .5
    lounge(sh('S10') + .3, HUG, 1.0, 1)
    chord(['F3', 'C4', 'F4', 'A4', 'C5'], HUG, end('S10') - HUG + .8, .32, 0, 3000)
    for k, n in enumerate(['A5', 'C6', 'F6', 'A6']): put(celesta(hz(n)), HUG + .1 + k * .1, .22, .3, .6)
    # S11 тема любви, ритм на танце
    t0, t1 = sh('S11'), end('S11')
    LOVE = [(0, 'F2', ['F3', 'A3', 'C4', 'E4']), (1.75, 'A1', ['E3', 'A3', 'C4', 'E4']), (3.5, 'Bb1', ['F3', 'Bb3', 'D4', 'F4']), (5.25, 'C2', ['E3', 'G3', 'C4', 'E4'])]
    for o, bn, ch in LOVE:
        if t0 + o < t1: put(bass(hz(bn), 1.8, .8), t0 + o, .45, 0, .2); [put(piano(hz(n), 2.6, .5), t0 + o + k * .05, .2, k * .1 - .15, .45) for k, n in enumerate(ch)]; chord(ch, t0 + o, 2.2, .14, 0, 2000)
    for k in range(8): put(kick(.7), t0 + 3.0 + k * .25, .25, 0, 0); put(clap(.6), t0 + 3.125 + k * .5, .2, .2, .1)
    MEL = [(.2, 'C5'), (.6, 'A5'), (1.1, 'G5'), (1.5, 'F5'), (2.0, 'E5'), (2.4, 'C5'), (3.0, 'D5'), (3.8, 'D5'), (4.2, 'F5'), (4.7, 'Bb5'), (5.2, 'A5'), (5.6, 'G5'), (6.2, 'C6'), (6.8, 'A5')]
    for o, n in MEL:
        if t0 + o < t1 + .3: put(piano(hz(n), 2.0, .7), t0 + o, .26, .1, .6); put(celesta(hz(n)), t0 + o, .1, -.2, .6)
    # S12 ночь: пэд + сердце → тишина
    t0 = sh('S12'); OFF = AT['l2'] - .45
    chord(['D3', 'F3', 'A3', 'C4'], t0, OFF - t0 + .1, .2, 0, 1400)
    for k in range(int((OFF - (t0 + 1.2)) / .6)): put(heart(.8), t0 + 1.2 + k * max(.42, .65 - k * .04), .45, 0, .1)
    put(boom(.7, 1.4), OFF, .45, 0, .2)
    # S13: конец основной части — мьюзик-бокс, тёплый аккорд, вопросительный щипок на «Without who?»
    t0 = sh('S13')
    for k, n in enumerate(['A5', 'F5', 'C5', 'F5', 'A5', 'G5', 'F5']): put(musicbox(hz(n)), t0 + .5 + k * .42, .3, .2, .6)
    chord(['F3', 'A3', 'C4', 'E4'], t0 + .4, DUR - t0, .18, 0, 1600)
    [put(pluck(hz(n), .4, .8), AT['m4'] + D['m4'] + .05 + k * .15, .3, 0, .2) for k, n in enumerate(['E4', 'G4', 'B4'])]


def variants():
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
    c = 'C' + PART; t0 = sh(c)
    for k, (o, n) in enumerate([(0, 'A4'), (.5, 'C5'), (1.0, 'E5'), (1.5, 'D5'), (2.0, 'C5'), (2.6, 'B4'), (3.1, 'A4')]): put(musicbox(hz(n)), t0 + .2 + o, .3, .2, .6)
    chord(['A2', 'C3', 'E3'], t0, DUR - t0 + 1, .16, 0, 1200)

if PART == 'main': main_music()
else: variants()

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
