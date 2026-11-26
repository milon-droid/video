#!/usr/bin/env python3
"""Музыка серии 2 «The Date» — свой синтез (инструменты из ../score.py), привязка к монтажу ep2-lines.js.
Романтическая комедия: щипковые-«крадущиеся» (хук), джазовый лаунж в кафе (щётки, контрабас, пиано),
тема любви (пиано + челеста + струнный пад) на закате, тишина при погасшем фонаре, мьюзик-бокс в конце.
python3 score2.py music2.wav"""
import sys, os, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
R0 = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R0)
from timing import load
TM = load(); ST, AT, D = TM['starts'], TM['at'], TM['durs']; DUR = TM['total']
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
def chord(ns, t, d, g=.25, pan=0, cut=1600): put(pad([hz(n) for n in ns], d, .4, .8, cut), t, g, pan, .5)

# ===== A. ХУК (S1): «крадущиеся» щипки, рывок, толчок, тёплый аккорд за дверью =====
bpm = 120; b = 60 / bpm
for i, n in enumerate(['D3', 'F3', 'A3', 'F3', 'D3', 'F3', 'Bb3', 'A3']):
    if i * b * .5 < 1.2: put(pluck(hz(n), .4, .3), .05 + i * b * .5, .5, -.2, .1)
put(swell(.5, .7), 1.25 - .45, .5, 0, .2)
put(pluck(hz('C#3'), .3, .2), 1.25, .7, 0, .1)
PUSH = AT['a3'] + .15
put(riser(.8, .6), PUSH - .8, .35, 0, .3)
put(boom(.5, 1.0), PUSH, .5, 0, .2)
chord(['F3', 'A3', 'C4', 'E4'], PUSH + .3, end('S1') - PUSH + .5, .22)
for k, n in enumerate(['C5', 'F5', 'A5', 'C6']): put(celesta(hz(n)), PUSH + .45 + k * .12, .25, .3, .5)

# ===== B. КОРИДОР (S2–S3): комедийный щипковый бас 112 bpm + мотив тени на челесте =====
t0, t1 = sh('S2'), end('S3'); bpm = 112; b = 60 / bpm
PROG = [('F2', ['F3', 'A3', 'C4']), ('D2', ['D3', 'F3', 'A3']), ('Bb1', ['Bb2', 'D3', 'F3']), ('C2', ['C3', 'E3', 'G3'])]
i = 0; t = t0
while t < t1 - .3:
    root, ch = PROG[(i // 4) % 4]; beat = i % 4
    put(bass(hz(root) * (1.5 if beat == 2 else 1), b * .9), t, .55, 0, .05)
    if beat in (1, 3): [put(pluck(hz(n), .25, .7), t + b * .5, .16, .25 - k * .2, .1) for k, n in enumerate(ch)]
    put(brush(.5), t, .25, .3, .05)
    i += 1; t += b
MOT = ['A5', 'G5', 'F5', 'G5', 'A5', 'C6', 'A5']
for k, n in enumerate(MOT): put(celesta(hz(n)), AT['c1'] + .1 + k * b * .5, .2, -.3, .5)
put(celesta(hz('F6')), AT['c3'] + D['c3'] + .05, .3, .3, .6); put(celesta(hz('C6')), AT['c3'] + D['c3'] + .2, .25, .3, .6)

# ===== C. ПРАВИЛО (S4): низкий гул, тиканье =====
t0, t1 = sh('S4'), end('S4')
put(drone(hz('D2'), t1 - t0 + .5, .8), t0, .5, 0, .3)
for k in range(int((t1 - t0) / .5)): put(tick(.5, 1500 if k % 2 else 1900), t0 + .25 + k * .5, .25, .3 if k % 2 else -.3, .1)
put(boom(.6, 1.6), AT['d2'], .4, 0, .3)

# ===== D. КАФЕ (S5–S10): джазовый лаунж 92 bpm (щётки, контрабас, пиано Fmaj7–Em7–Dm7–G7) =====
LOUNGE = [('F2', ['A3', 'C4', 'E4', 'F4']), ('E2', ['G3', 'B3', 'D4', 'E4']), ('D2', ['F3', 'A3', 'C4', 'E4']), ('G2', ['F3', 'B3', 'D4', 'G4'])]
WALK = {'F2': ['F2', 'A2', 'C3', 'E3'], 'E2': ['E2', 'G2', 'B2', 'D3'], 'D2': ['D2', 'F2', 'A2', 'C3'], 'G2': ['G2', 'B2', 'D3', 'F3']}
def lounge(t0, t1, v=1., bright=0):
    b = 60 / 92; i = 0; t = t0
    while t < t1 - .1:
        root, ch = LOUNGE[(i // 4) % 4]; beat = i % 4
        put(bass(hz(WALK[root][beat]), b * .95), t, .5 * v, -.1, .05)
        put(brush(.55, .22), t, .22 * v, .35, .05); put(brush(.35, .1), t + b * .66, .14 * v, .35, .05)
        if beat == 0: [put(piano(hz(n), 2.2, .55), t + .02 * k, .2 * v, .1 * k - .1, .35) for k, n in enumerate(ch)]
        if beat == 2 and bright: put(celesta(hz(ch[-1]) * 2), t, .12 * v * bright, .3, .5)
        i += 1; t += b
KNOCK = AT['g3'] - .3
lounge(sh('S5') + .2, KNOCK, .9)
# «Lean in… Closer…» — напряжение: тремоло-пад растёт
put(pad([hz('C4'), hz('E4'), hz('G4')], KNOCK - AT['g1'], 1.5, .1, 2200), AT['g1'], .18, 0, .4)
put(riser(KNOCK - AT['g2'], .5), AT['g2'], .2, 0, .3)
# S8: руки ползут — тихий пиццикато по шагам, касание — блёстки челесты + расцвет
TOUCH = sh('S8') + 2.9
for k in range(8): put(pluck(hz(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'][k]), .3, .6), sh('S8') + .9 + k * .25, .25, 0, .2)
for k, n in enumerate(['C6', 'E6', 'G6', 'C7', 'E7']): put(celesta(hz(n)), TOUCH + k * .07, .22, .4 - k * .15, .6)
chord(['F3', 'A3', 'C4', 'E4', 'G4'], TOUCH, 2.0, .3, 0, 2400)
# S9: музыка замирает на «Stop it!» → вопросительные щипки → свист теней (в sfx)
for k, n in enumerate(['E4', 'G4', 'B4']): put(pluck(hz(n), .5, .6), AT['i2'] + D['i2'] + .1 + k * .18, .25, 0, .3)
put(pluck(hz('D5'), .6, .6), AT['i3'] + D['i3'] + .1, .25, 0, .3)
# свист «невинных» теней: чистый тон с вибрато, мелодия
def whistle(f, d):
    t = T(d); fm = f * (1 + .012 * np.sin(2 * np.pi * 6 * t)); s = np.sin(2 * np.pi * np.cumsum(fm) / SR) + .04 * rng.uniform(-1, 1, len(t))
    return s * env(len(t), .03, .06) * .5
LOOK2 = AT['i3'] + D['i3'] + .2
for k, (n, d) in enumerate([('G6', .25), ('E6', .25), ('G6', .25), ('C7', .45), ('B6', .2), ('G6', .5)]):
    put(whistle(hz(n), d), LOOK2 + .45 + sum(x[1] for x in [('G6', .25), ('E6', .25), ('G6', .25), ('C7', .45), ('B6', .2), ('G6', .5)][:k]) * 1.05, .22, .2, .3)
# S10: смех → лаунж ярче; объятие теней — расцвет
HUG = AT['j4'] + .5
lounge(sh('S10') + .3, HUG, 1.0, 1)
chord(['F3', 'C4', 'F4', 'A4', 'C5'], HUG, end('S10') - HUG + .8, .32, 0, 3000)
for k, n in enumerate(['A5', 'C6', 'F6', 'A6']): put(celesta(hz(n)), HUG + .1 + k * .1, .22, .3, .6)
put(swell(.6, .8), HUG - .6, .3, 0, .3)

# ===== E. ТЕМА ЛЮБВИ (S11, закат): пиано-аккорды, мелодия, струнный пад =====
t0, t1 = sh('S11'), end('S11')
LOVE = [(0, 'F2', ['F3', 'A3', 'C4', 'E4']), (1.8, 'A1', ['E3', 'A3', 'C4', 'E4']), (3.6, 'Bb1', ['F3', 'Bb3', 'D4', 'F4']), (5.4, 'C2', ['E3', 'G3', 'C4', 'E4'])]
for o, bn, ch in LOVE:
    if t0 + o < t1: put(bass(hz(bn), 1.8, .8), t0 + o, .45, 0, .2); [put(piano(hz(n), 2.6, .5), t0 + o + k * .05, .2, k * .1 - .15, .45) for k, n in enumerate(ch)]; chord(ch, t0 + o, 2.2, .14, 0, 2000)
MEL = [(.2, 'C5'), (.6, 'A5'), (1.1, 'G5'), (1.5, 'F5'), (2.0, 'E5'), (2.4, 'C5'), (3.0, 'D5'), (3.8, 'D5'), (4.2, 'F5'), (4.7, 'Bb5'), (5.2, 'A5'), (5.6, 'G5'), (6.2, 'C6'), (6.8, 'A5')]
for o, n in MEL:
    if t0 + o < t1 + .5: put(piano(hz(n), 2.0, .7), t0 + o, .26, .1, .6); put(celesta(hz(n)), t0 + o, .1, -.2, .6)

# ===== F. НОЧЬ У ДВЕРИ (S12–S13): пэд + сердце; фонарь гаснет — тишина и удар =====
t0 = sh('S12'); OFF = AT['l2'] - .45
chord(['D3', 'F3', 'A3', 'C4'], t0, OFF - t0 + .1, .2, 0, 1400)
for k in range(int((OFF - (t0 + 1.5)) / .7)): put(heart(.8), t0 + 1.5 + k * max(.42, .7 - k * .04), .45, 0, .1)
put(boom(.7, 1.4), OFF, .45, 0, .2)
t0 = sh('S13')
for k, n in enumerate(['A5', 'F5', 'C5', 'F5', 'A5', 'G5']): put(musicbox(hz(n)), t0 + .6 + k * .45, .3, .2, .6)
chord(['F3', 'A3', 'C4'], t0 + .5, AT['m3'] - t0 - .3, .16, 0, 1500)
put(boom(.5, .8), AT['m3'], .4, 0, .1); [put(pluck(hz(n), .3, .9), AT['m3'] + k * .06, .35, 0, .1) for k, n in enumerate(['C#4', 'E4', 'G4', 'Bb4'])]

# ===== G. ДОМОЙ (S14): щипковый шаг + мотив тени =====
t0, t1 = sh('S14'), end('S14'); b = 60 / 104; i = 0; t = t0 + .2
while t < t1:
    put(bass(hz(['F2', 'C2', 'D2', 'A1'][(i // 2) % 4]), b * .8), t, .45, 0, .05); put(pluck(hz(['A3', 'C4', 'F4', 'C4'][i % 4]), .25, .7), t + b * .5, .18, .3, .1); put(brush(.4), t + b * .5, .15, .3, .05)
    i += 1; t += b
for k, n in enumerate(MOT): put(celesta(hz(n)), AT['n2'] + D['n2'] + .1 + k * .14, .2, -.3, .5)

# ===== H. ФИНАЛ (S15): мьюзик-бокс, тема любви =====
t0 = sh('S15')
for k, (o, n) in enumerate(MEL[:9]): put(musicbox(hz(n)), t0 + .2 + o * .6, .3, .2, .6)
chord(['F3', 'A3', 'C4', 'E4'], t0, DUR - t0 + 1, .16, 0, 1400)

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
