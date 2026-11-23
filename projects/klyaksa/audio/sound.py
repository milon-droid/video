#!/usr/bin/env python3
"""КЛЯКСА — звук целиком. Своя музыка: кото и сякухати (синтез), сё-аккорд, тайко (запись CC0) →
лад «ин» (тайна, погоня) → лад «ё» (светлый финал). Реальные шлепки, капли, рык, гонг (assets/sfx, CC0).
    python3 audio/sound.py → audio/mix.wav (48 кГц)
"""
import numpy as np, subprocess, json, os
from scipy.signal import fftconvolve, butter, sosfilt
SR = 48000; DUR = 48.2; N = int(DUR * SR)
ROOT = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(ROOT); REPO = os.path.dirname(os.path.dirname(PRJ))
rng = np.random.default_rng(7)
def db(v): return 10 ** (v / 20)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
LIB = {s['id']: s for s in json.load(open(f'{REPO}/assets/sfx-library/index.json'))}
def lib(n): return load(f"{REPO}/assets/sfx-library/{LIB[n]['file']}")
def loc(n): return load(f'{PRJ}/assets/sfx/{n}.mp3')
def norm(x, pk=.9): m = np.abs(x).max(); return x / m * pk if m > 0 else x
def lpf(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hpf(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bpf(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def st(x, pan=0.):
    if x.ndim == 2: return x
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.41, x * r * 1.41], 1)
BUS = {k: np.zeros((N, 2)) for k in ['mus', 'sfx', 'amb', 'verb']}
def put(bus, x, t, g=0., pan=0., send=0.):
    x = st(x, pan) * db(g); i = int(t * SR)
    if i >= N or i + len(x) <= 0: return
    a = max(0, -i); x = x[a:]; i = max(0, i); n = min(len(x), N - i)
    BUS[bus][i:i + n] += x[:n]
    if send: BUS['verb'][i:i + n] += x[:n] * send
def seg(x, a, b, fi=.005, fo=.05):
    y = x[int(a * SR):int(b * SR)].copy(); n = len(y)
    if n == 0: return y
    y[:int(fi * SR)] *= np.linspace(0, 1, int(fi * SR))[:, None]; nf = min(n, int(fo * SR)); y[-nf:] *= np.linspace(1, 0, nf)[:, None]; return y
def speed(x, r):   # смена высоты ресемплом
    n = int(len(x) / r); idx = np.arange(n) * r; i0 = idx.astype(int); f = (idx - i0)[:, None]; i1 = np.minimum(i0 + 1, len(x) - 1)
    return x[i0] * (1 - f) + x[i1] * f
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
# ---------------- инструменты
def koto(m, dur=2.2, vel=1., bend=0., bt=.25, bright=1.):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = mf(m) * 2 ** ((bend * np.clip((t - bt) / .12, 0, 1)) / 12)
    ph = np.cumsum(fr) / SR; y = np.zeros(n)
    for k in range(1, 14):
        inh = 1 + .0006 * k * k
        y += np.sin(2 * np.pi * ph * k * inh + k) * (1 / k ** 1.05) * np.exp(-t * (1.6 + k * .9 / bright)) * (1 + .35 * (k == 3))
    nz = rng.standard_normal(n) * np.exp(-t * 60) * .25; y += bpf(nz, 1500, 6000)
    y *= np.minimum(1, t / .002) * vel; return y * .35
def flute(m, dur, vel=1., scoop=1., vib=.5, breath=.3):
    n = int(dur * SR); t = np.arange(n) / SR
    v = 1 + .006 * vib * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .35) / .4, 0, 1)
    fr = mf(m) * 2 ** (-scoop * np.exp(-t * 9) / 12) * v; ph = np.cumsum(fr) / SR
    y = np.sin(2 * np.pi * ph) + .22 * np.sin(4 * np.pi * ph + .5) + .07 * np.sin(6 * np.pi * ph)
    br = bpf(rng.standard_normal(n), mf(m) * .8, min(mf(m) * 4, 15000)) * breath
    env = np.minimum(1, t / .09) * np.minimum(1, (dur - t) / .25).clip(0, 1) * (1 + .25 * np.sin(np.pi * t / dur))
    chiff = bpf(rng.standard_normal(n), 2000, 8000) * np.exp(-t * 30) * .3
    return (y * .5 + br * (.5 + .5 * env) * .6 + chiff) * env * vel * .3
def sho(ms, dur, vel=1.):   # сё: стоячий кластер с биениями
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros((n, 2))
    for j, m in enumerate(ms):
        for d, p in [(-.4, -.6), (.4, .6)]:
            f = mf(m) * 2 ** (d / 1200); s = np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) + .1 * np.sin(6 * np.pi * f * t); y += st(s, p) * .5
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2).clip(0, 1); return y * env[:, None] * vel * .05 / len(ms) ** .5
def thump(f0=75, f1=42, dur=1.2, vel=1.):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f1 + (f0 - f1) * np.exp(-t * 12)
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 4.5) + bpf(rng.standard_normal(n), 100, 900) * np.exp(-t * 40) * .4
    return y * vel
def shime(vel=1.):
    n = int(.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 420 * t) * np.exp(-t * 40) + bpf(rng.standard_normal(n), 2000, 7000) * np.exp(-t * 70) * .6) * vel * .4
def whistle(f0, f1, dur, vel=1.):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / dur) ** 2 * vel * .2
def hiss(dur, a=800, b=6000, vel=1.):
    n = int(dur * SR); t = np.arange(n) / SR; x = bpf(rng.standard_normal(n), a, b)
    gr = (rng.random(n) < .002).astype(float); gr = np.convolve(gr, np.exp(-np.arange(200) / 30), 'same')
    return (x * .4 + x * gr * 2) * np.sin(np.pi * np.clip(t / dur, 0, 1)) * vel * .3
def gong(vel=1.):
    n = int(6 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a, d in [(88, 1, .5), (176.5, .6, .7), (231, .5, .9), (297, .4, 1.1), (402, .3, 1.5), (533, .25, 2), (690, .15, 2.6)]:
        y += a * np.sin(2 * np.pi * f * t * (1 + .002 * np.exp(-t * 2))) * np.exp(-t * d)
    y += bpf(rng.standard_normal(n), 300, 4000) * np.exp(-t * 15) * .3
    return y * vel * .25
def ir(sec=2.6):
    n = int(sec * SR); t = np.arange(n) / SR; e = np.exp(-t * 6.9 / sec)
    L = lpf(rng.standard_normal(n), 6000) * e; R = lpf(rng.standard_normal(n), 6000) * e; return np.stack([L, R], 1) * .03
# ---------------- лад
IN = [62, 63, 67, 69, 70, 74, 75, 79, 81, 82, 86]     # D Eb G A Bb
YO = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86]     # D E G A B
def K(t, m, dur=2., vel=1., pan=0., g=-6, send=.25, **kw): put('mus', koto(m, dur, vel, **kw), t, g, pan, send)
def F(t, m, dur, vel=1., g=-8, send=.45, **kw): put('mus', flute(m, dur, vel, **kw), t, g, .1, send)
# ======================= МУЗЫКА
# 0–3.2: хук — тишина, дыхание флейты нарастает к падению
F(.05, 74, 1.0, .5, g=-14, scoop=0, breath=1.2)
K(1.8, 86, 1.4, .7, pan=.3); K(2.5, 79, 1, .6, pan=-.4); K(2.85, 81, 1, .6, pan=.4); K(3.12, 67, 2, .7, bend=-1, bt=.15)
# 3.2–7: раскрытие свитка — флейта и сё
put('mus', sho([62, 69, 74, 76, 81], 5.2, 1.), 3.0, -2, send=.4)
for t, m, d in [(3.4, 74, 1.1), (4.5, 75, .5), (5.0, 79, .9), (5.9, 81, 1.0)]: F(t, m, d, .9, scoop=1.2)
for i, m in enumerate([62, 69, 74, 75, 79]): K(3.3 + i * .14, m, 2.5, .55, pan=-.5 + i * .25, g=-10)
put('mus', thump(55, 38, 2.5, .6), 6.0, -6, send=.3)
for k in range(10): put('mus', shime(.4 + k * .05), 6.0 + k * .1, -10)
# 7–9: напряжение: низкий гул + сердце-барабан ускоряется
put('mus', sho([50, 51, 57], 2.2, 1.5), 7.0, 0, send=.3)
tt = 7.05
while tt < 8.9: put('mus', thump(70, 45, .6, .5), tt, -8); tt += max(.18, .5 - (tt - 7) * .17)
for k in range(14): K(7.9 + k * .065, 82 if k % 2 else 81, .3, .35, pan=.3, g=-14)
# 9.4–14: погоня — тайко + остинато кото (лад ин, 140 уд/мин)
TK = loc('taiko'); hits = [.02, .31, .78, 1.15, 1.62, 3.12, 3.5, 3.72, 5.21, 5.45]
def tk(i, t, g=-6, pan=0.): a = hits[i]; put('mus', seg(TK, a - .01, a + .45), t, g, pan, .15)
b = 60 / 140; pat = [74, 81, 82, 81, 79, 81, 75, 74]
for j in range(int((14.0 - 9.4) / (b / 2))):
    t = 9.4 + j * b / 2; K(t, pat[j % 8] - (12 if (j // 8) % 2 else 0), .5, .5, pan=.25 if j % 2 else -.25, g=-12, send=.1)
    if j % 4 == 0: tk(j // 4 % 5, t, -5)
    if j % 4 == 2: put('mus', shime(.6), t, -9)
for j in range(8): F(9.6 + j * .55, [74, 75, 79, 81, 82, 81, 79, 75][j], .5, .7, g=-13, scoop=.6, vib=0)
# 14–17.7: прятки — почти тишина, редкие ноты
for t, m in [(14.9, 62), (15.6, 63), (16.3, 62)]: K(t, m, 2.5, .5, g=-12, send=.5)
put('mus', sho([74, 75], 2.6, .9), 14.6, -6, send=.4)
K(17.12, 74, 1.5, 1., bend=-3, bt=.05, g=-4)   # «бвоу» — обнаружен
# 17.75–24.6: побег со стаей и падение
for j in range(int((24.0 - 17.8) / (b / 2))):
    t = 17.8 + j * b / 2
    if 21.6 < t < 22.0: continue
    K(t, pat[(j + 3) % 8], .45, .45, pan=.25 if j % 2 else -.25, g=-13, send=.1)
    if j % 4 == 0 and t < 23: tk((j // 4 + 2) % 5, t, -6)
    if j % 2 == 1 and t < 23: put('mus', shime(.45), t, -11)
for j, m in enumerate([81, 82, 86, 82, 81, 79]): F(18.4 + j * .3, m, .28, .7, g=-12, scoop=.3, vib=0)
for k in range(12): K(23.0 + k * .08, 63 if k % 2 else 62, .3, .4, g=-12)
# 24.6–29.5: вода смывает — зловещая флейта и сё
put('mus', sho([50, 57, 63], 5.0, 1.6), 24.8, 0, send=.4)
for t, m, d in [(25.6, 62, 1.4), (27.1, 63, 1.6), (28.8, 62, .8)]: F(t, m, d, 1., g=-9, scoop=1.5, breath=.6)
tt = 29.5
while tt < 30.55: put('mus', thump(70, 45, .5, .5), tt, -9); tt += max(.12, .32 - (tt - 29.5) * .2)
put('mus', whistle(300, 900, 1.0, .5), 29.55, -14)
# 31.9–35.3: нежно у головы дракона (лад ё)
put('mus', sho([62, 69, 71, 76, 81], 3.6, 1.), 31.9, -3, send=.5)
for i, m in enumerate([62, 67, 69, 71, 74, 76, 79, 81]): K(32.0 + i * .22, m, 2.4, .5, pan=-.6 + i * .17, g=-10, send=.4)
K(32.8, 86, 2, .6, g=-8); K(33.6, 75, 1.5, .5, bend=-1, g=-9)
F(32.4, 76, 1.2, .8, g=-10); F(33.7, 74, .6, .7, g=-11)
tk(5, 34.15, -3); tk(6, 34.3, -4)
# 35.3–48.2: пробуждение и полёт — тайко-ансамбль, флейта-тема, кото (лад ё)
put('mus', gong(1.2), 35.3, -2, send=.6)
put('mus', sho([62, 69, 74, 76, 79, 83], 3.0, 1.4), 35.4, -2, send=.5)
for k in range(16): put('mus', shime(.25 + k * .05), 36.4 + k * .07, -8)
B2 = 60 / 100
for j in range(int((44.4 - 37.55) / (B2 / 2))):
    t = 37.55 + j * B2 / 2
    if j % 4 == 0: put('mus', thump(85, 48, 1.0, 1.), t, -6, send=.2); tk(j // 4 % 5, t, -6)
    if j % 4 == 3: tk(7, t, -8)
    if j % 2 == 1: put('mus', shime(.5), t, -11)
    K(t, [62, 69, 74, 76, 79, 76, 74, 69][j % 8] + (12 if (j // 8) % 2 else 0), .6, .45, pan=.3 if j % 2 else -.3, g=-13, send=.15)
theme = [(38.6, 74, .6), (39.2, 76, .6), (39.8, 79, 1.2), (41.0, 81, .6), (41.6, 83, .6), (42.2, 86, 1.6), (43.9, 83, .3), (44.4, 81, 1.0), (45.6, 79, .7), (46.3, 74, 1.8)]
for t, m, d in theme: F(t, m, d, 1., g=-6, scoop=.8, vib=.8)
K(43.85, 98, 1.5, .8, g=-6)   # подмигивание
put('mus', sho([62, 66, 69, 74, 76, 81], 4.0, 1.3), 44.3, -2, send=.6)
for i, m in enumerate([62, 69, 74, 76, 79, 81, 86]): K(44.4 + i * .12, m, 3, .55, pan=-.6 + i * .2, g=-9, send=.5)
for i, m in enumerate([50, 62, 69, 74, 78, 81]): K(47.0 + i * .04, m, 1.2, .7, g=-7, send=.6)
put('mus', thump(70, 40, 1.4, 1.), 46.9, -3, send=.3)
# ======================= ЗВУКИ СОБЫТИЙ
S1, S2, S3 = loc('splat1'), loc('splat2'), loc('splat3'); WD = loc('drop1')
def drop(t, g=-6, r=1.): put('sfx', speed(seg(WD, 2.0, 2.4), r), t, g, send=.2)
put('sfx', lib('props-drip'), .4, -12)
put('sfx', whistle(1600, 500, .4, .6), .55, -14)
put('sfx', S1, .95, -1, send=.2); put('sfx', thump(90, 40, 1.0, .9), .95, -4); put('sfx', speed(S2, .8), .97, -8)
put('sfx', lib('pop-small-bubble'), 1.75, -6); put('sfx', lib('pop-small-bubble'), 2.3, -16)
put('sfx', loc('deepwhoosh'), 3.0, -6, send=.3)
put('sfx', speed(loc('slurp'), .6), 6.15, -12)               # глоток
put('sfx', speed(loc('swoosh2'), .7), 7.0, -12)
put('sfx', hiss(1.6, 200, 1200, .6), 7.2, -10)              # тень кисти опускается
put('sfx', lib('move-spring'), 8.85, -14)
put('sfx', S2, 9.03, 0); put('sfx', thump(80, 40, 1.0, 1.), 9.03, -2); put('sfx', lib('foley-paper-touch'), 9.03, -6)
put('sfx', lib('pop-medium-bubble'), 9.35, -10); put('sfx', lib('pop-small-bubble'), 10.05, -12)
put('sfx', whistle(500, 900, 2.9, .4), 10.05, -16)           # катится по спине
for t, s in [(10.86, S3), (12.02, S1)]: put('sfx', s, t, -1); put('sfx', thump(80, 42, .8, .9), t, -3)
put('sfx', loc('swoosh1'), 13.0, -6); put('sfx', whistle(400, 1200, .5, .4), 13.0, -14); put('sfx', whistle(1200, 400, .5, .4), 13.5, -14)
put('sfx', lib('pop-large-bubble'), 14.0, -6); put('sfx', whistle(900, 300, .4, .5), 14.4, -12)
for t in [15.4, 16.0, 16.6]: put('sfx', speed(loc('swoosh2'), .55), t, -15)
put('sfx', lib('pop-small-bubble'), 17.0, -10); put('sfx', loc('dswoosh'), 17.15, -6); put('sfx', lib('pop-large-bubble'), 17.45, -6)
put('sfx', loc('swoosh1'), 17.75, -8)
W1, W2 = loc('wing1'), loc('wing2')
put('sfx', norm(W2, .5), 18.2, -4); put('sfx', norm(W1, .5), 18.9, -6); put('sfx', norm(W2, .4), 19.6, -8)
put('sfx', loc('dswoosh'), 19.85, -1, send=.2); put('sfx', lib('foley-paper-touch'), 19.9, -4); put('sfx', norm(W1, .5), 20.0, -4)
put('sfx', whistle(1400, 300, 1.6, .6), 20.0, -11)
put('sfx', lib('impact-light-soft'), 21.6, -4); put('sfx', lib('move-spring'), 21.62, -12)
put('sfx', hiss(1.1, 300, 2000, .5), 21.9, -12)
put('sfx', S3, 24.56, 0); put('sfx', thump(80, 40, 1.0, 1.), 24.56, -2)
put('sfx', speed(loc('swoosh2'), .7), 25.4, -10); put('sfx', speed(loc('swoosh2'), .6), 26.0, -12)
put('sfx', whistle(200, 500, .45, .3), 26.3, -16)
drop(26.92, -2, .9); put('sfx', loc('wsplash'), 26.95, -12); put('sfx', hiss(2.4, 600, 5000, .8), 27.0, -6, send=.3)   # смывание
drop(27.6, -16, 1.6)
drop(30.88, -3, .85); put('sfx', loc('wsplash'), 30.9, -10)
put('sfx', loc('swoosh1'), 30.7, -6); put('sfx', lib('foley-wood-touch'), 31.05, -4)
put('sfx', loc('deepwhoosh'), 31.2, -2, send=.3); put('sfx', lib('whoosh-medium-hard'), 31.5, -6)
put('mus', thump(70, 40, 1.4, .8), 31.9, -4, send=.3)
put('sfx', lib('pop-small-bubble'), 32.8, -14)
put('sfx', loc('swoosh1'), 34.8, -8); put('sfx', whistle(500, 1300, .5, .4), 34.8, -14)
put('sfx', seg(loc('gong2'), 0, 9, fo=3), 35.3, -3, send=.4); put('sfx', thump(60, 35, 2, 1.), 35.3, -3)
put('sfx', hiss(1.4, 3000, 12000, .4), 35.4, -16)
put('sfx', thump(50, 30, 1.0, .8), 36.2, -6)
put('sfx', loc('slurp'), 36.6, -8); put('sfx', speed(loc('slurp'), 1.3), 36.9, -12)
put('sfx', lib('bass-rumble-medium'), 36.9, -4)
put('sfx', seg(loc('roar2'), .15, 4.6, fi=.05, fo=.6), 37.5, 0, send=.25); put('sfx', speed(seg(loc('roar1'), .6, 2.6), .8), 37.6, -6)
put('sfx', lib('cinematic-thunder-big'), 37.55, -6, send=.2)
put('sfx', loc('deepwhoosh'), 38.3, -4)
for t in [39.6, 41.0, 42.6, 44.6, 46.0]: put('sfx', speed(loc('deepwhoosh'), .8), t, -12)
for i, t in enumerate(np.linspace(45.2, 46.8, 9)): put('sfx', speed(lib('foley-paper-touch'), .8 + .05 * (i % 3)), t, -14)
put('sfx', lib('impact-deep-soft'), 46.9, 0); put('sfx', lib('foley-paper-touch'), 46.92, -6)
# атмосфера: тихий ветер + бумага, до последнего кадра
wind = lpf(rng.standard_normal(N), 700) * (0.6 + .4 * np.sin(np.arange(N) / SR * .4)); put('amb', st(wind * .02), 0)
wf = lpf(rng.standard_normal(int(4 * SR)), 1200) * np.sin(np.linspace(0, np.pi, int(4 * SR))) ** 2 * .06; put('amb', st(wf), 38.0)
# ======================= СВЕДЕНИЕ
v = fftconvolve(BUS['verb'], ir(), axes=0)[:N]
mix = BUS['mus'] * db(-1) + BUS['sfx'] * db(0) + BUS['amb'] * db(-2) + v * db(-4)
mix = hpf(mix, 30); mix[-int(.5 * SR):] *= np.linspace(1, .3, int(.5 * SR))[:, None]
mix = mix / np.abs(mix).max() * .9
import wave
with wave.open(f'{ROOT}/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('ok', ROOT + '/mix.wav')
