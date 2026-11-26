#!/usr/bin/env python3
"""Звук «PIECES»: живые записи стекла, колокола, собора + «стеклянная гармоника» и стеклянные колокольчики (чистые тона), хор в финале.
python3 audio/score.py → audio/mix.wav"""
import json, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); REC = D + '/rec/'; LIB = os.path.abspath(D + '/../../../assets/sfx-library') + '/'
SR = 48000
cj = json.load(open(D + '/cues.json')); DUR = cj['dur'] + 0.6
N = int(DUR * SR)
bus = {k: np.zeros((N, 2), np.float32) for k in ('amb', 'mus', 'sfx')}
_c = {}
def load(f, a=0, b=None):
    k = (f, a, b)
    if k in _c: return _c[k]
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(a)] + (['-t', str(b - a)] if b else []) + ['-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
    _c[k] = x; return x
R = lambda n: REC + n
L = lambda n: LIB + n
def fft_filter(x, lp=None, hp=None):
    n = len(x); X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lp: g *= 1 / np.sqrt(1 + (f / lp) ** 4)
    if hp: g *= 1 / np.sqrt(1 + (hp / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g[:, None], n, axis=0).astype(np.float32)
def rate(x, r):  # варислоу: r>1 выше и короче
    if r == 1: return x
    n = int(len(x) / r); i = np.arange(n) * r
    return np.stack([np.interp(i, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
def env(x, fi=0.005, fo=0.05):
    n = len(x); e = np.ones(n, np.float32)
    a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] *= np.linspace(1, 0, b)
    return x * e[:, None]
def put(b, x, t, g=1.0, pan=0.0, dur=None, fi=0.005, fo=0.05, r=1, lp=None, hp=None, loop=False):
    if x is None or len(x) == 0: return
    x = rate(x, r)
    if dur:
        n = int(dur * SR)
        if loop and len(x) < n: x = np.tile(x, (n // len(x) + 1, 1))
        x = x[:n]
    if lp or hp: x = fft_filter(x, lp, hp)
    x = env(x, fi, fo) * g
    pl, pr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(x)); x = x[:j - i]
    bus[b][i:j, 0] += x[:, 0] * pl; bus[b][i:j, 1] += x[:, 1] * pr
# ---------- реверб (свёртка с синтетическим залом) ----------
def ir(t60=1.6, pre=0.012):
    n = int(t60 * SR); rng = np.random.default_rng(3); t = np.arange(n) / SR
    h = rng.standard_normal((n, 2)).astype(np.float32) * np.exp(-6.9 * t / t60)[:, None]
    h[:int(pre * SR)] = 0; h = fft_filter(h, lp=6000, hp=200); return h / np.sqrt((h ** 2).sum()) * 0.9
def conv(x, h):
    n = len(x) + len(h); m = 1 << (n - 1).bit_length()
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], m) * np.fft.rfft(h[:, c], m), m)[:len(x)] for c in (0, 1)], 1).astype(np.float32)

def norm(x, pk=0.9):
    m = np.abs(x).max() if len(x) else 0
    return x * (pk / m) if m > 1e-6 else x
# ---------- синтез: стеклянная гармоника и колокольчики ----------
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def harm(t, m, dur, g=.2, pan=0, att=.25):
    n = int((dur + 1.6) * SR); tt = np.arange(n) / SR; f = mf(m)
    a = np.minimum(1, tt / att) ** 1.5; rel = np.clip((dur + 1.6 - tt) / 1.6, 0, 1) ** 2; e = a * np.where(tt < dur, 1, rel)
    trem = 1 + .12 * np.sin(2 * np.pi * 5.3 * tt + m)
    y = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * (f + .7) * tt + 1) + .18 * np.sin(2 * np.pi * f * 2 * tt) + .06 * np.sin(2 * np.pi * f * 3.01 * tt)) * e * trem
    s = np.stack([y, y], 1).astype(np.float32) * .3
    put('mus', s, t, g, pan, fi=.001, fo=.2)
def bell(t, m, g=.15, pan=0, dec=2.2):
    n = int(dec * 1.6 * SR); tt = np.arange(n) / SR; f = mf(m); y = np.zeros(n)
    for k, (p, a, d) in enumerate([(1, 1, 1), (2.76, .45, .5), (5.40, .25, .28), (8.93, .12, .16), (2.0, .2, .7)]):
        y += a * np.sin(2 * np.pi * f * p * tt + k) * np.exp(-tt / (dec * d))
    y *= np.minimum(1, tt / .002)
    put('mus', np.stack([y, y], 1).astype(np.float32) * .25, t, g, pan, fi=0, fo=.1)
def chord(t, ms, dur, g=.07, att=.5):
    for i, m in enumerate(ms): harm(t, m, dur, g, pan=(i - 1) * .35, att=att)
def arp(t0, t1, ms, step, g=.1, up=12, pan=.3):
    t = t0; i = 0
    while t < t1:
        seq = ms + [m + 12 for m in ms]
        bell(t, seq[i % len(seq)] + up, g, pan=pan * np.sin(i * 1.7)); t += step(t) if callable(step) else step; i += 1
D_, Bm, G_, A_, Em = [62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64], [52, 55, 59]
# ---------- атмосферы и шумы ----------
REC_ = {'birds': (R('french-birds-morning-spring-5e6822.mp3'), 30, 50), 'crick': (R('crickets-night-2-965e86.mp3'), 10, 30),
        'church': (R('quiet-ambience-in-a-small-church-sanctuary-b9cb09.mp3'), 20, 50), 'chimes': (R('koshi-wind-chimes-medium-67d4ab.mp3'), 8, 30)}
def amb(id, t, dur, g):
    if id == 'amb_day': put('amb', load(*REC_['birds']), t, g * .5, dur=dur, fi=.3, fo=.5, loop=True)
    elif id == 'amb_room': put('amb', norm(load(*REC_['church']), .3), t, g, dur=dur, fi=.3, fo=.5, loop=True)
    elif id == 'amb_eve': put('amb', load(*REC_['birds']), t, g * .3, dur=dur, fi=.4, fo=.5, lp=3000, loop=True); put('amb', norm(load(*REC_['chimes']), .2), t, g * .5, dur=dur, fi=.5, fo=.5)
    elif id == 'amb_night': put('amb', norm(load(*REC_['crick']), .25), t, g, dur=dur, fi=.4, fo=.5, loop=True)
    elif id == 'amb_winter': put('amb', norm(load(R('cold-wind-loop-294727.mp3')), .3), t, g, dur=dur, fi=.6, fo=.6, loop=True)
    elif id == 'amb_church': put('amb', norm(load(*REC_['church']), .35), t, g, dur=dur, fi=.5, fo=.6, loop=True)
def sfx(id, t, g):
    if id == 'kick': put('sfx', norm(load(R('soccer-kick-d61c47.mp3'))), t - .02, g * .8)
    elif id == 'crack': put('sfx', norm(load(R('glass-shattering-hit-01-38c3f4.mp3'))), t, g * .7, r=.8)
    elif id == 'shatter':
        put('sfx', norm(load(R('window-breaking-6ecbea.mp3'))), t - .05, g * .9)
        put('sfx', norm(load(R('slow-motion-glass-shatter-caaa37.mp3'))), t + .05, g * .5, lp=9000)
    elif id == 'hit_low':
        n = int(1.4 * SR); tt = np.arange(n) / SR; y = np.sin(2 * np.pi * (48 * np.exp(-tt * 1.5) + 30) * tt) * np.exp(-tt * 2.6)
        put('sfx', np.stack([y, y], 1).astype(np.float32) * .8, 1.15, g)
    elif id == 'shards_fall': put('sfx', norm(load(R('glass-shattering-and-falling-3ed519.mp3'), 1.0)), t, g * .45, lp=8000)
    elif id == 'tinkle': put('sfx', norm(load(R('20131119-whine-bottles-clinging-zoomh6yx-68e4f9.mp3'))), t, g * .4, pan=.3)
    elif id == 'glass_pick': put('sfx', norm(load(L('sfx-kit/sounds/foley/foley-glass-touch.wav'))), t, g * .55, pan=np.sin(t) * .3)
    elif id == 'shimmer': put('sfx', norm(load(R('koshi-wind-chimes-medium-67d4ab.mp3'), 8.3, 11.5)), t, g * .5, fi=.1, fo=.8)
    elif id == 'chime': put('sfx', norm(load(R('koshi-wind-chimes-medium-67d4ab.mp3'), 25.0, 27.5)), t, g * .4, fi=.05, fo=.8)
    elif id == 'solder': put('sfx', norm(load(R('match-sizzle-01-2a7723.mp3'), .9, 2.1)), t, g * .45, hp=900, fi=.02, fo=.3)
    elif id == 'lamp': pass
    elif id == 'cut_glass': put('sfx', norm(load(L('sfx-kit/sounds/foley/foley-glass-slide.wav'))), t + .2, g * .5, r=1.2)
    elif id == 'flare': bell(t, 98, g * .25); bell(t + .05, 105, g * .15)
    elif id == 'glass_small': put('sfx', norm(load(R('glass-shatter-5-522b02.mp3'))), t, g * .75)
    elif id == 'bell': put('sfx', norm(load(R('old-church-bell-2f1efb.mp3'))), t, g * .6, fo=.5); put('sfx', norm(load(R('deep-church-bell-4c33c4.mp3'), 0, 1.15)), t, g * .35, r=.85, fo=.4)
    elif id == 'crack_slow':
        x = norm(load(L('sfx-kit/sounds/foley/foley-glass-slide.wav'))); put('sfx', x, t, g * .5, r=.45, lp=4000); put('sfx', norm(load(R('glass-shattering-hit-01-38c3f4.mp3'))), t + 1.2, g * .25, r=.6, lp=3000)
    elif id == 'box': put('sfx', norm(load(R('little-wooden-box-opening-and-closing-4631d5.mp3'), 6.4, 7.5)), t, g * .6)
    elif id == 'paper': put('sfx', norm(load(R('unrolling-a-paper-map-17d0c1.mp3'), 1.2, 3.0)), t, g * .5, fo=.4)
    elif id == 'heal': bell(t, 86, g * .3); bell(t + .12, 93, g * .22); bell(t + .24, 98, g * .18)
    elif id == 'cup_break': put('sfx', norm(load(R('ceramic-cup-shatters-on-tile-floor-3f9b08.mp3'))), t, g * .55); put('sfx', norm(load(R('glass-shatter-4-f90e2c.mp3'))), t+.02, g * .2, r=1.3)
    elif id == 'swell': pass
cues = cj['cues']
for c in cues:
    if c['id'].startswith('amb_'): amb(c['id'], c['t'], c.get('dur', 3), c['g'])
    else: sfx(c['id'], c['t'], c['g'])
# ---------- музыка ----------
# A: после удара — одна нота
harm(1.7, 69, 2.6, .22); harm(3.3, 74, 1.6, .14, pan=.2)
# B: тема (5.0–13.4)
for i, ch in enumerate([D_, Bm, G_, A_]): chord(5.0 + i * 2.1, ch, 2.0, .05)
for (t, m, d) in [(5.5, 78, .8), (6.3, 81, .8), (7.2, 86, 1.3), (8.6, 85, .45), (9.1, 83, .8), (10.0, 81, .8), (10.9, 78, 1.4), (12.4, 76, .9)]: harm(t, m, d, .17)
arp(9.6, 13.3, [62, 66, 69], .42, .05)
# C: ночь (13.4–18.4)
for i, ch in enumerate([D_, Bm, G_, A_]): chord(13.4 + i * 1.25, ch, 1.2, .045)
arp(13.4, 18.3, [62, 66, 69, 74], .31, .07)
for (t, m, d) in [(13.8, 74, .9), (14.7, 78, .9), (15.6, 81, 1.2), (17.0, 79, 1.2)]: harm(t, m, d, .14)
# D: годы (18.4–24)
for i, ch in enumerate([G_, A_, Bm, G_, A_, D_]): chord(18.4 + i * .935, ch, .9, .045, att=.2)
arp(18.4, 23.9, [55, 59, 62], .2335, .065)
# E: падение — тишина — смех
arp(24.0, 25.35, [62, 66, 69], .28, .05)
for (t, m) in [(26.0, 86), (26.15, 90), (26.3, 93), (26.6, 90), (26.75, 93), (26.9, 98)]: bell(t, m, .1, pan=.4)
chord(26.1, D_, 2.1, .04)
# F: зима — без музыки, низкий гул
harm(29.0, 47, 4.0, .12, att=1.2); harm(29.4, 54, 3.6, .07, att=1.2)
# G: ящик и записка
harm(34.2, 71, 1.2, .14); harm(35.0, 74, 1.0, .14); chord(35.7, G_, 1.7, .06); bell(35.7, 79, .1); chord(37.4, A_, 1.6, .06)
harm(36.4, 78, 1.0, .12); harm(37.5, 76, 1.4, .12)
# H: сборка — ускоряющиеся арпеджио
seq = [D_, G_, A_, Bm, G_, A_]
for i, ch in enumerate(seq): chord(39.0 + i * .83, ch, .8, .05 + i * .006, att=.2)
arp(39.0, 44.0, [62, 66, 69], lambda t: .26 - (t - 39) * .028, .07)
chord(44.0, [50, 62, 66, 69, 74], 2.0, .07, att=.15); bell(44.0, 86, .12)
# J: собор — хор + тема
CH = load(R('church-choir-cebfc9.mp3'), 0.6, 21)
put('mus', norm(CH, .5), 46.1, .55, fi=1.8, fo=1.5, dur=12.4, lp=7000)
for i, ch in enumerate([D_, Bm, G_, A_, D_, Bm]): chord(46.0 + i * 2.0, ch, 1.95, .04, att=.6)
for (t, m, d) in [(46.6, 78, .9), (47.5, 81, .9), (48.4, 86, 1.6), (50.3, 85, .5), (50.8, 83, .9)]: harm(t, m, d, .13)
# K: финал
for (t, m, d) in [(52.4, 78, .9), (53.3, 81, .9), (54.2, 86, 1.5), (55.3, 85, .5), (55.8, 83, .7), (56.5, 81, .7)]: harm(t, m, d, .15)
chord(52.0, G_, 2.6, .045); chord(54.6, A_, 2.6, .045); chord(57.25, [50, 62, 66, 69, 74, 78], 1.3, .07, att=.1); bell(57.25, 86, .14); bell(57.3, 74, .12)
# ---------- сведение ----------
mus = bus['mus']
# пригибание музыки на падениях/бое
for (a, b) in [(25.35, 25.95), (48.85, 49.5)]:
    i, j = int(a * SR), int(b * SR); e = np.ones(N, np.float32); k = int(.08 * SR)
    e[i:j] = .15; e[i - k:i] = np.linspace(1, .15, k); e[j:j + k] = np.linspace(.15, 1, k); mus *= e[:, None]
H = ir(3.2)
bus['mus'] = mus + conv(mus, H) * .55
bus['sfx'] += conv(bus['sfx'], ir(1.4)) * .22
mix = bus['amb'] * .8 + bus['mus'] * 1.0 + bus['sfx'] * 1.0
mix /= max(1e-6, np.abs(mix).max()) / .9
import wave
w = wave.open(D + '/mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close(); print('ok', DUR)
