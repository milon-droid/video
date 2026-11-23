#!/usr/bin/env python3
"""Музыка вставки альтернативной концовки (8,5 с): неловкие щипки → мечтательная челеста в клубе → неловкая точка. → alt_cue.wav"""
import sys, wave, numpy as np
sys.argv = [sys.argv[0], '/dev/null']
exec(open('score.py').read().split('# ===== A. НОЧЬ')[0])   # берём инструменты из score.py
L[:] = 0; R[:] = 0; VERB[:] = 0
SHIFT_AT = 1e9
# неловкие щипки
for o, n in [(.35, 'G3'), (.7, 'F3'), (1.05, 'E3'), (1.9, 'D3'), (2.15, 'D3')]: put(pluck(hz(n), .5, .7), o, .55, -.1, .2)
put(tick(.4, 1200), 1.7, .5); put(tick(.4, 900), 1.85, .5)
# флешбек 1 (2.4–5.0): клубный грув челестой
put(pad([hz('F3'), hz('A3'), hz('C4'), hz('E4')], 2.8, .3, .6, 2400), 2.85, .4, 0, .6)
for k, n in enumerate(['C5', 'E5', 'G5', 'B5', 'C6', 'B5', 'G5', 'E5', 'A5', 'C6', 'E6']): put(celesta(hz(n), 1.2), 2.95 + k * .22, .26, -.4 + (k % 4) * .25, .7)
for k in range(5): put(kick(.6), 2.95 + k * .48, .4); put(hat(1), 3.19 + k * .48, .3, .3)
# флешбек 2 (5.0–7.2): слоумо — арфа-глиссандо и низкий свелл
put(swell(1.2, .6), 5.4, .5)
for k, n in enumerate(['C4', 'E4', 'G4', 'B4', 'D5', 'E5', 'G5', 'B5', 'D6']): put(pluck(hz(n), 2.4, .95), 6.05 + k * .07, .25, -.5 + k * .12, .7)
put(pad([hz('D3'), hz('F#3'), hz('A3'), hz('C#4')], 2.4, .6, .8, 1400), 6.0, .4, 0, .7)
for k in range(2): put(heart(.6), 6.6 + k * .9, .5)
# флешбек 3 (7.2–9.4): лунная походка — фанк-бас
for k, n in enumerate(['E2', 'E2', 'G2', 'A2', 'E2', 'D2', 'E2', 'G2']): put(bass(hz(n), .25, 1), 8.45 + k * .27, .6, 0, .1)
for k in range(8): put(clap(.7) if k % 2 else kick(.6), 8.45 + k * .27, .35, .1, .2)
put(celesta(hz('E6'), 1), 10.2, .3, .3, .6)
# снова на крыше (9.4–14): мечтательно-неловко
put(pad([hz('C3'), hz('G3'), hz('E4'), hz('A4')], 6.4, .4, 1.0, 1700), 9.95, .3, 0, .6)
for k, n in enumerate(['G5', 'E5', 'C5', 'D5', 'E5']): put(musicbox(hz(n)), 10.1 + k * .45, .3, .1, .6)
for o, n in [(13.2, 'E3'), (13.45, 'D3'), (13.8, 'C3')]: put(pluck(hz(n), .5, .6), o, .5, .1, .2)
put(musicbox(hz('G5')), 14.1, .35, 0, .6)
ir_t = T(2.0); ir = rng.uniform(-1, 1, len(ir_t)) * np.exp(-ir_t * 2.6); ir = lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
from scipy.signal import fftconvolve
wet = fftconvolve(VERB, ir)[:len(L)]
out = np.stack([L + wet * .9, R + wet * .9], 1)[:int(16.0 * SR)]; out = out / (np.abs(out).max() + 1e-9) * .7
with wave.open('alt_cue.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('alt_cue.wav')
