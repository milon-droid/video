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
# мечта: клуб
put(pad([hz('F3'), hz('A3'), hz('C4'), hz('E4')], 3.2, .4, .8, 2400), 2.55, .4, 0, .6)
for k, n in enumerate(['C5', 'E5', 'G5', 'B5', 'C6', 'B5', 'G5', 'E5', 'A5', 'C6', 'E6', 'C6']): put(celesta(hz(n), 1.4), 2.6 + k * .22, .26, -.4 + (k % 4) * .25, .7)
put(swell(.8, .5), 1.85, .5, 0, .4)
for k in range(3): put(heart(.5), 3.0 + k * .7, .5, 0, .2)
# неловкая точка
put(pad([hz('C3'), hz('G3'), hz('E4')], 3.1, .3, 1.0, 1600), 5.4, .3, 0, .5)
put(pluck(hz('C4'), .6, .8), 5.6, .4); put(celesta(hz('E6'), 1.2), 5.65, .3, .3, .6)
for o, n in [(7.0, 'E3'), (7.25, 'D3'), (7.6, 'C3')]: put(pluck(hz(n), .5, .6), o, .5, .1, .2)
put(musicbox(hz('G5')), 7.9, .35, 0, .6)
ir_t = T(2.0); ir = rng.uniform(-1, 1, len(ir_t)) * np.exp(-ir_t * 2.6); ir = lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
from scipy.signal import fftconvolve
wet = fftconvolve(VERB, ir)[:len(L)]
out = np.stack([L + wet * .9, R + wet * .9], 1)[:int(8.5 * SR)]; out = out / (np.abs(out).max() + 1e-9) * .7
with wave.open('alt_cue.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
print('alt_cue.wav')
