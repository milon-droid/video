#!/usr/bin/env python3
"""Оригинальная музыка «ТЕНЬ УВОЛИЛАСЬ», серия 1 — синтез с нуля (numpy/scipy), под монтаж по секундам.
Инструменты: челеста (FM), щипковые (Карплус—Стронг), контрабас, фортепиано, струнный пад, щётки, хлопки, мьюзик-бокс.
python3 score.py out.wav"""
import sys, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from warp import warp, TOTAL, INS
SR = 44100; DUR = TOTAL
RAW = False
SHIFT_AT, SHIFT = 66.6, 2.2   # с серии v4: договор удлинил план 14 на 2,2 с
L = np.zeros(int(SR * (DUR + 3))); R = np.zeros_like(L); VERB = np.zeros_like(L)
rng = np.random.default_rng(7)
NOTES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def hz(n):
    k = NOTES[n[0]]; i = 1
    if n[i] in '#b': k += 1 if n[i] == '#' else -1; i += 1
    return 440 * 2 ** ((k + 12 * (int(n[i:]) + 1) - 69) / 12)
def put(sig, t, gain=1., pan=0., verb=.2):
    if t >= SHIFT_AT: t += SHIFT
    if not RAW: t = warp(t)
    i = int(t * SR)
    if i >= len(L): return
    j = min(len(L), i + len(sig)); s = sig[:j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.41; R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.41; VERB[i:j] += s * verb
def env(n, a=.005, r=.1, sus=1.):
    e = np.ones(n) * sus; na = max(1, min(n // 2, int(a * SR))); nr = max(1, min(n // 2, int(r * SR))); e[:na] = np.linspace(0, sus, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def lp(x, f, o=2): return sosfilt(butter(o, f / (SR / 2), 'low', output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f / (SR / 2), 'high', output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a / (SR / 2), b / (SR / 2)], 'band', output='sos'), x)
T = lambda d: np.arange(int(d * SR)) / SR

# --- инструменты ---
def pluck(f, d=1.2, bright=.5, damp=.996):
    N = int(SR / f); buf = rng.uniform(-1, 1, N); buf = lp(buf, 1500 + bright * 6000) if bright < 1 else buf; out = np.zeros(int(d * SR))
    for i in range(len(out)): v = buf[i % N]; out[i] = v; buf[i % N] = damp * .5 * (v + buf[(i + 1) % N])
    return out * env(len(out), .001, .05)
def celesta(f, d=1.6):
    t = T(d); m = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    return (np.sin(2 * np.pi * f * t + m) * .7 + np.sin(2 * np.pi * f * 2 * t) * .2 * np.exp(-t * 4)) * np.exp(-t * 2.6) * env(len(t), .002, .1)
def musicbox(f, d=2.2):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t * 8) + .25 * np.sin(2 * np.pi * f * 6.9 * t) * np.exp(-t * 12)) * np.exp(-t * 2.2) * env(len(t), .001, .2) * .6
def piano(f, d=2.5, v=1.):
    t = T(d); s = np.zeros_like(t)
    for h in range(1, 8): fh = f * h * (1 + .0004 * h * h); s += np.sin(2 * np.pi * fh * t) * (1 / h ** 1.3) * np.exp(-t * (1.2 + h * .7))
    ham = lp(rng.uniform(-1, 1, len(t)), 3000) * np.exp(-t * 60) * .3
    return (s + ham) * env(len(t), .003, .3) * v * .5
def pad(fs, d, a=1.2, r=1.5, cut=1800, det=.006):
    t = T(d); s = np.zeros_like(t)
    for f in fs:
        for k in (-1, 0, 1): ph = rng.uniform(0, 1); s += (2 * ((f * (1 + det * k) * t + ph) % 1) - 1)
    s = lp(s, cut, 2) / (len(fs) * 3); return s * env(len(t), a, r)
def bass(f, d=.5, v=1.):
    t = T(d); s = pluck(f, d, .2, .993) * .8 + np.sin(2 * np.pi * f * t) * np.exp(-t * 3) * .6; return s * env(len(t), .002, .06) * v
def kick(v=1.):
    t = T(.35); f = 45 + 110 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * v
def brush(v=1., d=.18):
    t = T(d); return bp(rng.uniform(-1, 1, len(t)), 1800, 9000) * np.exp(-t * 22) * v * .6
def snare(v=1.):
    t = T(.25); return (bp(rng.uniform(-1, 1, len(t)), 1200, 7000) * np.exp(-t * 18) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * .5) * v * .7
def clap(v=1.):
    t = T(.3); n = bp(rng.uniform(-1, 1, len(t)), 900, 5000); e = sum(np.exp(-np.clip(t - o, 0, None) * 60) * (t >= o) for o in (0, .012, .024)) + np.exp(-t * 14) * .5
    return n * e * v * .5
def hat(v=1.):
    t = T(.06); return hp(rng.uniform(-1, 1, len(t)), 7000) * np.exp(-t * 70) * v * .35
def tick(v=1., f=1800):
    t = T(.05); return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * v
def boom(v=1., d=2.5):
    t = T(d); f = 30 + 60 * np.exp(-t * 4); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6) + lp(rng.uniform(-1, 1, len(t)), 200) * np.exp(-t * 3) * .4) * v
def riser(d=2., v=1.):
    t = T(d); k = t / d; n = rng.uniform(-1, 1, len(t)); out = np.zeros_like(t); seg = 2048
    for i in range(0, len(t), seg): c = 400 + 7000 * k[i] ** 2; out[i:i + seg] = bp(n[i:i + seg], c * .7, min(c * 1.4, 20000))
    return out * k ** 2 * v
def swell(d=2., v=1.):
    t = T(d); return hp(rng.uniform(-1, 1, len(t)), 4000) * (t / d) ** 3 * v * .5
def drone(f, d, v=1.):
    t = T(d); s = sum(np.sin(2 * np.pi * f * m * t + np.sin(2 * np.pi * .2 * t) * m) / m for m in (1, 2, 3, 5)); return lp(s, 900) * env(len(t), 1., 1.) * v * .4
def heart(v=1.):
    t = T(.4); return (np.sin(2 * np.pi * 55 * t) * np.exp(-t * 14) + np.sin(2 * np.pi * 50 * np.clip(t - .17, 0, None)) * np.exp(-np.clip(t - .17, 0, None) * 14) * (t > .17) * .7) * v

# ===== A. НОЧЬ (0–7.2): таинственная челеста, щелчок «чпок» на 1.05 =====
put(pad([hz('D3'), hz('A3'), hz('F4')], 7.4, a=.6, r=1.2, cut=1200), 0, .5, 0, .4)
mot = [('D5', 0), ('F5', .35), ('A5', .7), ('G5', 1.6), ('F5', 1.95), ('E5', 2.3), ('D5', 2.9)]
for n, o in mot: put(celesta(hz(n)), .1 + o, .32, .3, .5)
put(bass(hz('D2'), 1.2, 1.2), 1.05, .9, 0, .2)
for k, n in enumerate(['A4', 'C5', 'D5', 'F5', 'A5', 'D6']): put(celesta(hz(n), 1.2), 3.6 + k * .14, .22, -.3 + k * .12, .6)  # тень встаёт
put(celesta(hz('A5'), 2), 5.3, .2, .2, .7); put(celesta(hz('C#5'), 2), 5.9, .2, -.2, .7)
# ===== B. УТРО (7.2–18.4): комедийные щипки, 108 bpm =====
bt = 60 / 108
def bar_comic(t0, root, chord, nb=1, minor=False):
    for b in range(nb * 4):
        tt = t0 + b * bt
        put(bass(hz(root[b % len(root)]), bt * .6), tt, .8, -.1, .1)
        if b % 2 == 1: put(pluck(hz(chord[0]), .4, .8) + pluck(hz(chord[1]), .4, .8) + pluck(hz(chord[2]), .4, .8), tt, .22, .3, .25)
        put(tick(.25 if b % 2 else .4, 1400 if b % 2 else 1000), tt + bt * .5 * (b % 2), .5, .5, .1)
for i, (rt, ch) in enumerate([(['F2', 'C3'], ['F4', 'A4', 'C5']), (['C2', 'G2'], ['E4', 'G4', 'C5']), (['F2', 'C3'], ['F4', 'A4', 'C5'])]):
    bar_comic(7.2 + i * 4 * bt, rt, ch)
for n, o in [('C6', 0), ('A5', .28), ('F5', .56), ('G5', 1.1), ('A5', 1.38)]: put(celesta(hz(n), 1.0), 7.5 + o, .22, -.3, .3)
put(np.zeros(1), 0)  # стоп на «У меня — нет» (10.15): пауза
put(boom(.7, 1.5), 10.15, .7, 0, .3); put(piano(hz('D3'), 2, 1) + piano(hz('Ab3'), 2, .8), 10.15, .5, 0, .4)
for i, (rt, ch) in enumerate([(['F2', 'Ab2'], ['F4', 'Ab4', 'C5']), (['Db2', 'Ab2'], ['Db4', 'F4', 'Ab4']), (['C2', 'G2'], ['C4', 'E4', 'G4']), (['F2', 'C3'], ['F4', 'Ab4', 'C5'])]):
    bar_comic(11.6 + i * 4 * bt, rt, ch)
for k in range(10): put(pluck(hz(['F5', 'Ab5', 'G5', 'F5', 'E5'][k % 5]), .5, .9), 12.6 + k * bt * .5, .14, .4, .3)  # «скрип букв»
# ===== C. ПЕТЛЯ (18.4–22.4): ускорение до штампа 21.1; потом тревога =====
tt = 18.4; k = 0
while tt < 21.05: put(tick(.5, 1600), tt, .5, -.4 + .8 * (k % 2), .1); put(bass(hz(['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'][k % 8]), .2), tt, .5, 0, .1); dt = max(.06, .42 * (1 - (tt - 18.4) / 2.9) ** 1.4); tt += dt; k += 1
put(riser(2.6, .5), 18.5, .6, 0, .2)
put(boom(1.0, 2.5), 21.1, 1.0, 0, .3); put(piano(hz('C2'), 3, 1) + piano(hz('C3'), 3, 1) + piano(hz('Gb3'), 3, .8), 21.1, .6, 0, .5)
put(drone(hz('C2'), 5.2), 22.3, .6, 0, .3)
for i in range(9): put(tick(.35, 900), 22.6 + i * .55, .45, .6, .2); put(heart(.6), 22.9 + i * 1.1 if i < 4 else 99, .7, 0, .1)
for k2, n in enumerate(['G6', 'E6', 'C7', 'B6']): put(celesta(hz(n), 1.4), 24.8 + k2 * .4, .12, .4, .7)
# ===== D. ПОГОНЯ (27.4–47.2) =====
put(riser(2.6, .5), 27.5, .5, 0, .2)
for k2 in range(8): put(pluck(hz(['A4', 'C5', 'E5', 'A5'][k2 % 4]), .4, .9), 27.6 + k2 * .3, .18, -.3 + .2 * (k2 % 4), .3)
put(swell(1.2, .7), 29.0, .6, 0, .3); put(kick(1), 30.1, .9); put(snare(1), 30.1, .5)
for k2 in range(8): put(snare(.4 + k2 * .07), 31.2 + k2 * .125, .7, .1, .15)  # проход к грув
bt2 = 60 / 128; CH = [('A2', ['A3', 'C4', 'E4']), ('F2', ['F3', 'A3', 'C4']), ('C3', ['C4', 'E4', 'G4']), ('G2', ['G3', 'B3', 'D4']),
                       ('A2', ['A3', 'C4', 'E4']), ('F2', ['F3', 'A3', 'C4']), ('C3', ['C4', 'E4', 'G4']), ('E2', ['E3', 'G#3', 'B3'])]
LEAD = ['E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5', 'E5', 'D5', 'C5']
for bar in range(8):
    t0 = 32.2 + bar * 4 * bt2; root, ch = CH[bar]
    for b in range(4):
        tb = t0 + b * bt2; put(kick(.9), tb, .85 if b % 2 == 0 else .5)
        if b % 2 == 1: put(snare(.8), tb, .55, .05, .2)
        if bar >= 2 and b % 2 == 1: put(clap(1), tb, .45, -.1, .3)   # хлопки — танцы
        for e in range(2): put(hat(1), tb + e * bt2 / 2, .5, .4, .05); put(bass(hz(root) * (1.5 if e and b == 3 else 1), bt2 * .45, 1), tb + e * bt2 / 2, .55, -.05, .05)
        put(sum(pluck(hz(n), .35, .95) for n in ch), tb + bt2 / 2, .2, .35, .2)
    for q in range(2): put(celesta(hz(LEAD[(bar * 2 + q) % 16]), .8), t0 + q * 2 * bt2 + bt2 * .5, .22, -.3, .35)
    if bar >= 6: put(pad([hz(n) for n in ch], 4 * bt2 + .3, .3, .3, 2500), t0, .18, 0, .4)
put(swell(1.0, .5), 46.2, .5)
# ===== E. КРЫША (47.2–53.2): тихо, сердце, одинокая челеста =====
put(pad([hz('A2'), hz('E3'), hz('C4')], 6.4, 1.0, 1.4, 900), 47.2, .45, 0, .5)
for i in range(5): put(heart(.55), 47.6 + i * 1.15, .6, 0, .1)
for n, o in [('E5', .6), ('C5', 1.9), ('A4', 3.2), ('B4', 4.6)]: put(celesta(hz(n), 2.2), 47.2 + o, .2, .25, .8)
# ===== F. ЭМОЦИЯ (53.2–66.6): фортепиано и струнные, расцвет на 61.2 =====
PROG = [(53.2, ['C3', 'G3', 'E4'], 'C2'), (54.9, ['B2', 'G3', 'D4'], 'G1'), (56.5, ['A2', 'E3', 'C4'], 'A1'), (58.2, ['F2', 'C3', 'A3'], 'F1'),
        (59.8, ['G2', 'D3', 'B3'], 'G1'), (61.2, ['C3', 'G3', 'E4', 'C5'], 'C2'), (62.8, ['F2', 'C3', 'A3', 'F4'], 'F1'), (64.4, ['C3', 'G3', 'E4', 'G4'], 'C2'), (65.5, ['A2', 'E3', 'C4', 'E4'], 'A1'), (66.55, ['F2', 'C3', 'A3', 'F4'], 'F1')]
for i, (t0, ch, bs) in enumerate(PROG):
    d = (PROG[i + 1][0] if i + 1 < len(PROG) else 66.59) - t0
    big = 1.6 if t0 >= 61.2 else 1.0
    put(pad([hz(n) for n in ch], d + .6, .5 if t0 != 61.2 else .05, .7, 1600 if t0 < 61.2 else 2600, .004), t0, .32 * big, 0, .55)
    put(piano(hz(bs), 3, .9), t0, .45, -.1, .4)
    for k2, n in enumerate(ch): put(piano(hz(n) * 2, 2.2, .6), t0 + k2 * .18, .3, -.2 + k2 * .15, .45)
MEL = [(53.6, 'E5'), (54.3, 'G5'), (55.2, 'D5'), (56.0, 'E5'), (56.8, 'C5'), (57.6, 'E5'), (58.5, 'F5'), (59.3, 'A5'), (60.1, 'G5'), (60.6, 'B5'), (61.2, 'C6'), (62.0, 'E6'), (62.8, 'F6'), (63.6, 'E6'), (64.4, 'G6')]
for t0, n in MEL: put(piano(hz(n), 2.2, .8), t0, .3, .15, .55)
put(swell(1.4, .9), 59.8, .6, 0, .4); put(boom(.5, 3), 61.2, .5, 0, .5)
for k2, n in enumerate(['C6', 'E6', 'G6', 'C7']): put(celesta(hz(n), 1.6), 61.25 + k2 * .09, .2, -.3 + k2 * .2, .7)
for k3 in range(4): put(pluck(hz(['C5', 'E5', 'G5', 'C6'][k3]), .5, .9), 65.0 + k3 * .42, .3, .2, .3)   # галочки в договоре
put(celesta(hz('C6'), 1.2), 66.5 - SHIFT + SHIFT, .0)   # хлопок ладоней 65.4
put(celesta(hz('C6'), 1.4), 66.1, .3, .3, .5); put(celesta(hz('G6'), 1.4), 66.25, .3, -.3, .5); put(boom(.35, 1.5), 66.1, .4, 0, .3)  # кулачок → 68.3
# ===== G. КРЮЧОК (66.6–71): тёмный гул, неон, удар =====
put(drone(hz('D1') * 2, 4.8, 1.2), 66.6, .8, 0, .3)
put(pad([hz('D2'), hz('Ab2'), hz('D3')], 4.6, .1, 1.2, 700), 66.6, .45, 0, .4)
put(boom(.9, 1.5), 66.6, .7, 0, .3)
put(piano(hz('D2'), 2, 1) + piano(hz('Ab2'), 2, 1), 68.6, .55, 0, .5)
put(boom(1.0, 2.6), 69.4, 1.0, 0, .4)
# ===== H. ФИНАЛ (71–73.6): мьюзик-бокс с мотивом тени =====
for n, o in mot: put(musicbox(hz(n) * (1 if n[-1] != '6' else 1)), 71.1 + o * .75, .35, .2, .6)

# ===== ГОЛОС ТЕНИ: хамское бормотание под реплики (без слов) =====
VOW = [(700, 1200), (400, 2000), (300, 800), (500, 1500), (650, 1000)]
def mumble(t0, dur, base=105, v=1.):
    tt = t0; k = 0
    while tt < t0 + dur:
        d = .07 + rng.uniform(0, .08); f = base * (1 + rng.uniform(-.15, .35)) * (1.25 if k % 5 == 4 else 1); t = T(d)
        saw = 2 * ((f * t + np.sin(2 * np.pi * 30 * t) * .02) % 1) - 1
        f1, f2 = VOW[rng.integers(len(VOW))]; s = bp(saw, f1 * .8, f1 * 1.25) + bp(saw, f2 * .85, f2 * 1.2) * .5
        s *= np.sin(np.pi * t / d) ** .6 * (1 + .3 * np.sin(2 * np.pi * 28 * t))
        put(s * 2.2, tt, .55 * v, -.15, .15); tt += d + (rng.uniform(.03, .12) if rng.uniform() < .25 else .01); k += 1
# бормотание заменено настоящим голосом тени (vo/ep1, v6)

# ===== заполнение вставок (EN-финал): мягкий пэд в тональности места + альтернативная концовка + длинный хвост =====
RAW = True
FILL = {16.7: ['F3', 'Ab3', 'C4'], 22.4: ['C3', 'G3', 'C4'], 25.05: ['C3', 'Gb3', 'C4'], 30.1: ['A2', 'E3', 'C4'], 57.6: ['A2', 'E3', 'C4', 'E4'], 64.4: ['C3', 'G3', 'E4'], 67.4: ['F2', 'C3', 'A3']}
for p, e in INS:
    if p in FILL: put(pad([hz(n) for n in FILL[p]], e + .8, .3, .5, 1500), warp(p - .001) - .2, .32, 0, .5)
import wave as _w
with _w.open('alt_cue.wav') as w: cue = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(float) / 32768
i0 = int(warp(68.8 - .001) * SR); n = min(len(cue), len(L) - i0); L[i0:i0 + n] += cue[:n, 0] * .9; R[i0:i0 + n] += cue[:n, 1] * .9
for k, (n_, o) in enumerate([('C5', 0), ('E5', .5), ('G5', 1.0), ('E5', 1.5), ('C6', 2.0)]): put(musicbox(hz(n_)), warp(73.0) + 1.0 + o, .3, .2, .6)
RAW = False

# реверб: экспоненциальный шум 2.4 с
ir_t = T(2.4); ir = rng.uniform(-1, 1, len(ir_t)) * np.exp(-ir_t * 2.4); ir = lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
wet = fftconvolve(VERB, ir)[:len(L)]; wetR = fftconvolve(VERB, np.roll(ir, 300))[:len(L)]
outL = L + wet * .9; outR = R + wetR * .9
out = np.stack([outL, outR], 1)[:int(DUR * SR)]
out = out / (np.abs(out).max() + 1e-9) * .89
fade = int(.6 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
import wave
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok', out.shape[0] / SR)
