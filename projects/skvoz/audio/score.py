#!/usr/bin/env python3
"""DAY 214 — звук. Новое: фортепиано с войлоком (синтез: неровные обертоны, удар молоточка, «плёнка»), колёса поезда как метроном,
настоящие записи карандаша/ластика/страниц (CC0), двери и смех (Oculus, CC BY 4.0).
python3 projects/skvoz/audio/score.py → projects/skvoz/audio/mix.wav"""
import numpy as np, subprocess, os, wave
SR = 48000; DUR = 65.6
ROOT = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(ROOT, '../../../assets/sfx-library')
rng = np.random.default_rng(214)
N = int(SR * (DUR + 1))
L = np.zeros(N); R = np.zeros(N); RV = np.zeros(N)
def tt(d): return np.arange(int(SR * d)) / SR
def add(sig, t, g=1., pan=0., rev=0.):
    i = int(t * SR); sig = np.asarray(sig, float) * g
    if i >= N or i < 0: return
    n = min(len(sig), N - i); s = sig[:n]
    L[i:i+n] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+n] += s * np.sqrt((1 + pan) / 2) * 1.414
    if rev: RV[i:i+n] += s * rev
def lp(x, fc):  # однополюсный ФНЧ ×2
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); z = 0.
    from scipy.signal import lfilter
    y = lfilter([1 - a], [1, -a], x); return lfilter([1 - a], [1, -a], y)
def bp(x, lo, hi):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def load(rel):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(LIB, rel), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9)
K = 'sfx-kit/sounds/'
PENCIL = load(K + 'writing-and-drawing/writing-pencil-draw.wav'); WRITE = load(K + 'writing-and-drawing/writing-pencil-write.wav')
ERASER = load(K + 'writing-and-drawing/writing-eraser.wav'); TICK = load(K + 'writing-and-drawing/writing-pencil-tick.wav')
PAGE = load(K + 'everyday-props/props-page-turn.wav'); FLIP = load(K + 'appear-and-vanish/appear-flip-quick.wav')
TOUCH = load(K + 'foley/foley-paper-touch.wav'); SLIDE = load(K + 'foley/foley-paper-slide.wav')
HEART = load('bigsoundbank/1929.flac')
DOPEN = load('meta-open-sound/corpora/oculus-audio-pack/ogg/TRNDoor_TrainDoorsOpen_OS_01.ogg')
DCLOSE = load('meta-open-sound/corpora/oculus-audio-pack/ogg/TRNDoor_TrainDoorsClose_OS_01.ogg')
LAUGH = load('meta-open-sound/corpora/oculus-audio-pack/ogg/VOXLaff_Female01Laugh_OS_02.ogg')

# ---------- поезд: скорость (та же функция, что в story.js)
def ss(a, b, v): k = np.clip((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k)
def eio(k): k = np.clip(k, 0, 1); return np.where(k < .5, 4 * k ** 3, 1 - (-2 * k + 2) ** 3 / 2)
def speed(t):
    t = np.asarray(t, float)
    X = 11.8
    return np.where(t < 15.6 + X, 1, np.where(t < 17.2 + X, 1 - eio((t - 15.6 - X) / 1.6), np.where(t < 22.3 + X, 0, np.where(t < 24 + X, eio((t - 22.3 - X) / 1.7), 1))))
T = np.arange(N) / SR
sp = speed(T)
# в «нарисованных» планах (крупные, её блокнот) поезд тише
inside = 1 - .6 * (ss(6.7, 6.9, T) - ss(15.0, 15.3, T)) - .3 * (ss(18.7, 18.9, T) - ss(27.3, 27.5, T)) - .55 * (ss(35.0, 35.3, T) - ss(43.9, 44.1, T)) - .6 * (ss(56.7, 56.9, T) - ss(65, 65.6, T))
rum = lp(rng.standard_normal(N), 90) * 9 + lp(rng.standard_normal(N), 400) * .6
rum *= (.25 + .75 * sp) * np.clip(inside, .2, 1) * .5 * ss(3.2, 3.7, T)
add(rum, 0, .9, 0)
# стук колёс «та-так» по пройденному пути
dist = np.cumsum(sp) / SR * 300
def clack():
    d = tt(.09); n = rng.standard_normal(len(d)) * np.exp(-d * 60); return bp(n, 300, 2500) + np.sin(2 * np.pi * 95 * d) * np.exp(-d * 40) * .8
CL = clack(); seg_len = 260.
k = 1
while True:
    idx = np.searchsorted(dist, k * seg_len)
    if idx >= N: break
    t = idx / SR
    if t > 3.4:
        g = .22 * (.4 + .6 * sp[idx]) * max(.2, inside[idx])
        add(CL, t, g, -.2); add(CL, t + .11 * (1.4 - .4 * sp[idx]), g * .8, .2)
    k += 1
# тормоза: тонкий визг + шипение
d = tt(1.7); sq = np.sin(2 * np.pi * np.cumsum(1900 - 500 * d / 1.7) / SR) * np.sin(np.pi * d / 1.7) ** 2
add(sq, 27.4, .03, .3); add(bp(rng.standard_normal(int(SR * 1.2)), 2000, 6000) * np.exp(-tt(1.2) * 2.5), 28.9, .1, 0)
add(DOPEN, 29.3, .32, .5, .1); add(DCLOSE, 33.8, .35, .5, .1)

# ---------- фортепиано с войлоком
def note_hz(m): return 440 * 2 ** ((m - 69) / 12)
def piano(m, dur=2.4, vel=.7):
    f = note_hz(m); d = tt(dur + 1.2); s = np.zeros(len(d)); B = .00025
    for h in range(1, 9):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 9000: break
        amp = vel ** (1 + h * .25) / h ** 1.15
        dec = 1.6 + 2.4 / h
        s += amp * np.sin(2 * np.pi * fh * d + rng.uniform(0, 6)) * np.exp(-d / (dec * (1.2 - m / 140)))
    s += .25 * np.sin(2 * np.pi * f * 1.003 * d) * np.exp(-d / 2.5) * vel   # лёгкая расстройка
    ham = bp(rng.standard_normal(len(d)), 600, 3500) * np.exp(-d * 90) * .25 * vel  # молоточек
    s = s + ham
    s *= np.minimum(1, d / .004) * np.where(d < dur, 1, np.exp(-(d - dur) * 6))
    return lp(s, 1800 + 2600 * vel)   # войлок глушит верх
def pad(ms, dur, g=.1):  # струнный пэд: пилы, медленная атака
    d = tt(dur); s = np.zeros(len(d))
    for m in ms:
        for dt in (-.08, .0, .07):
            ph = np.cumsum(np.full(len(d), note_hz(m) * 2 ** (dt / 12))) / SR
            s += (2 * (ph % 1) - 1) * .3
    s = lp(s, 1100) * np.minimum(1, d / 1.2) * np.minimum(1, (dur - d) / 1.5)
    return s * g
def bell(m, vel=.5):
    d = tt(2.5); f = note_hz(m); return (np.sin(2 * np.pi * f * d) + .4 * np.sin(2 * np.pi * f * 2.76 * d) * np.exp(-d * 4)) * np.exp(-d * 1.6) * vel

BEAT = 60 / 84
# аккорды: Dmaj9 – Bm7 – Gmaj7 – A(sus)
CH = [[50, 57, 62, 64, 66, 69], [47, 54, 59, 62, 66, 69], [43, 50, 55, 59, 62, 66], [45, 52, 57, 59, 64, 69]]
MEL = [74, 73, 69, 71, 69, 66, 64, 66]
def arpeggio(t0, bars, dens=1, vel=.5, mel=False, ch=CH):
    for b in range(bars):
        c = ch[b % 4]; tb = t0 + b * 4 * BEAT
        add(piano(c[0] - 12, 3.6, vel * .9), tb, .5, -.1, .2)
        pat = [1, 3, 2, 4, 3, 5, 2, 4] if dens > 1 else [1, 3, 5, 3]
        step = 4 * BEAT / len(pat)
        for i, n in enumerate(pat):
            add(piano(c[n], 1.6, vel * (.85 + .15 * rng.random())), tb + i * step + rng.uniform(-.01, .01), .32, .15 * (n - 3) / 2, .25)
        if mel:
            add(piano(MEL[(2 * b) % 8], 2.4, vel + .1), tb, .42, .05, .35); add(piano(MEL[(2 * b + 1) % 8], 2.0, vel), tb + 2 * BEAT, .38, .05, .35)

# ХУК: быстрые восходящие ноты по перевороту страниц
RIFF_T = [0, .42, .78, 1.06, 1.3, 1.5, 1.68, 1.84, 1.98, 2.1, 2.21, 2.31, 2.41, 2.51, 2.62, 2.74, 2.88, 3.04]
SC = [62, 64, 66, 69, 71, 74, 76, 78, 81]
for i, t in enumerate(RIFF_T):
    add(piano(SC[i % 9] + (12 if i > 8 else 0) - 12, .6, .45 + .02 * i), t + .02, .3, (i % 2 - .5) * .4, .3)
    add(FLIP, t + .26 if i == 0 else t, .35 + .015 * i, (i % 2 - .5) * .3)
add(piano(38, 3.5, .8), 2.0, .6, 0, .3); add(piano(50, 3.5, .6), 2.0, .35, 0, .3)
for t in (0, 1.0, 2.0): add(TOUCH, t + .05, .5, .1)
add(PAGE, 3.22, .5, .2)
# DAY 1: он рисует пейзаж, входит она — первый цвет (звон), карандаш замирает
add(PENCIL, 3.4, .3, -.3); add(PENCIL[:int(SR * .6)], 4.1, .25, -.3); add(TICK, 4.72, .6, -.2)
for i, m in enumerate([81, 85, 88, 93, 90]): add(bell(m, .28), 4.35 + i * .09, .3, .3 - i * .12, .7)
add(pad([57, 64, 69, 73], 3.5, .05), 4.4)
add(piano(69, 2.5, .45), 5.6, .35, 0, .5); add(piano(74, 2.5, .4), 6.0, .3, 0, .5)
for t in (5.7, 7.3, 8.9): add(TOUCH, t + .05, .45, .1)
add(PAGE, 6.8, .4, 0)
for i, t in enumerate(np.arange(6.95, 8.7, .6)): add(PENCIL[:int(SR * .62)], t, .4, (i % 2 - .5) * .3)
for i, t in enumerate(np.arange(8.85, 9.6, .25)): add(PENCIL[int(SR * .2):int(SR * .45)], t, .35, .2)   # красный карандаш — короткие штрихи
arpeggio(6.8, 3, dens=1, vel=.4, mel=True)
for t in (9.9, 11.3, 12.7, 13.9): add(PAGE, t, .45, .15)
add(bell(88, .25), 11.6, .25, .3, .6)
for i in range(7): add(PENCIL[:int(SR * .16)], 13.9 + .1 + i * .1, .45, (i % 2 - .5) * .4)   # зачёркивания
add(piano(62, 2, .35), 14.4, .3, 0, .5)
# ===== настоящее (старое время + 11.8)
X = 11.8
add(PAGE, 15.0, .4, .2)
for i, t in enumerate(np.arange(3.5, 5.8, .55)): add(PENCIL[:int(SR * .7)], t + X, .32, (i % 2 - .5) * .5)
add(WRITE, 3.55 + X, .45, -.2)
arpeggio(3.4 + X, 3, dens=1, vel=.42, mel=True)
add(piano(81, 1.2, .5), 8.6 + X, .3, .2, .4); add(piano(78, 1.2, .45), 8.85 + X, .3, .2, .4)
add(TICK, 9.98 + X, .7, .3); add(SLIDE, 9.66 + X, .6, 0); add(TOUCH, 9.78 + X, .5, .2)
add(piano(43, 2, .8), 9.66 + X, .45, 0, .3); add(piano(42, 2, .7), 9.8 + X, .4, 0, .3)
for (a, b, c, d) in [(10.95, 11.45, 11.7, 12.2), (12.35, 13.0, 13.2, 13.75), (13.9, 14.5, 14.7, 15.25)]:
    add(WRITE[:int(SR * (b - a + .1))], a + X, .5, -.1); add(ERASER, c + X, .5, .15); add(ERASER[:int(SR * .4)], c + .3 + X, .35, .25)
add(TOUCH, 10.75 + X, .3, 0)
for i, m in enumerate([66, 64, 62]): add(piano(m, 1.2, .35), 11.45 + i * 1.55 + X, .3, 0, .4)
add(piano(57, 2, .3), 15.25 + X, .25, 0, .4)
add(pad([50, 57, 62], 4.5, .06), 15.6 + X)
add(HEART[:int(SR * 3.2)], 17.6 + X, .55, 0)
add(piano(74, 3, .5), 19.0 + X, .35, 0, .5); add(piano(73, 3, .45), 19.0 + X, .2, 0, .5)
add(SLIDE, 20.5 + X, .5, .2); add(TOUCH, 20.85 + X, .5, .2)
for t, m in [(21.2, 69), (21.9, 66), (22.6, 62)]: add(piano(m, 2.4, .4), t + X, .35, 0, .5)
# её блокнот
add(SLIDE, 35.1, .5, 0); add(PAGE, 35.2, .5, 0)
for t in (36.1, 37.4, 38.6, 39.8): add(PAGE, t, .45, .15)
for t in (40.9, 41.2, 41.45, 41.7, 42.0): add(FLIP, t, .38, -.1)
arpeggio(35.2, 3, dens=2, vel=.45, mel=True)
for i, m in enumerate([86, 81, 83, 78, 81]): add(bell(m, .3), 36.2 + i * 1.2, .25, .3, .5)
add(WRITE[:int(SR * .9)], 42.05, .35, 0); add(WRITE[:int(SR * .6)], 42.95, .35, 0)
# цвет затекает
add(pad([50, 57, 62, 66, 69], 4.5, .1), 43.0)
for i, m in enumerate([74, 78, 81, 86, 90]): add(bell(m, .3), 44.1 + i * .2, .3, -.3 + i * .15, .6)
# DAY 215
add(PAGE, 46.3, .5, 0)
arpeggio(46.3, 4, dens=2, vel=.55, mel=True)
add(pad([50, 57, 62, 66], 6.0, .09), 46.3); add(pad([43, 50, 55, 59, 62], 6.0, .09), 51.8)
# возвращает её скетчбук
add(SLIDE, 48.5, .5, 0); add(TOUCH, 49.25, .55, .2); add(piano(76, 1.8, .4), 49.25, .25, .2, .5)
add(WRITE[:int(SR * .7)], 50.4, .5, -.1)
# она смущается: тихие высокие ноты
add(piano(86, 2, .3), 51.65, .22, .3, .6); add(piano(81, 2, .28), 52.05, .2, .3, .6); add(bell(90, .2), 52.4, .18, .2, .7)
# разговор в профиль
add(pad([47, 54, 59, 62, 66], 4.2, .07), 52.8)
for i, m in enumerate([78, 76, 74, 76]): add(piano(m, 1.6, .35), 53.0 + i * 1.0, .25, 0, .5)
# вдвоём, общий блокнот: маленький рисунок появляется
add(pad([55, 62, 66, 71], 3.0, .08), 56.8)
for i, m in enumerate([83, 86, 90]): add(bell(m, .25), 57.1 + i * .7, .2, -.2 + i * .2, .6)
for t in np.arange(57.0, 59.2, .55): add(PENCIL[:int(SR * .5)], t, .28, -.2)
for t in (58.2, 58.7, 59.1): add(SLIDE[:int(SR * .25)], t, .2, .3)
# общая страница (как в v2)
add(PAGE, 59.6, .45, 0)
for i, t in enumerate(np.arange(59.7, 62.2, .5)): add(PENCIL[:int(SR * .55)], t, .34, -.25 + .1 * (i % 2))
for t in np.arange(61.0, 63.6, .4): add(SLIDE[:int(SR * .3)], t, .22, .3)
add(TOUCH, 60.25, .45, 0); add(TOUCH, 61.65, .45, 0)
add(piano(74, 4, .55), 60.2, .4, 0, .5); add(piano(78, 4, .5), 61.6, .35, 0, .5)
arpeggio(59.6, 1, dens=1, vel=.4, mel=False)
for m in [38, 50, 57, 62, 66, 69, 76]: add(piano(m, 4.5, .55), 63.2, .3, (m - 57) / 40, .5)
add(WRITE[:int(SR * .6)], 63.8, .4, 0); add(bell(86, .3), 64.0, .3, .2, .7)

# ---------- реверб (простые гребёнки) и мастер-сумма
def reverb(x):
    y = np.zeros_like(x)
    for dl, g in [(1557, .82), (1617, .81), (1491, .83), (1422, .84), (1277, .85), (1356, .84)]:
        d = int(dl * SR / 44100); b = np.zeros_like(x); b[d:] = x[:-d]
        from scipy.signal import lfilter
        y += lfilter([1], np.r_[1, np.zeros(d - 1), -g], x) * .16
    return lp(y, 4000)
rv = reverb(RV)
L += rv; R += np.roll(rv, 240)
# лёгкий шум «плёнки/бумаги» на всё время — без цифровой тишины
hiss = lp(rng.standard_normal(N), 3000) * .004
L += hiss; R += hiss
mx = np.stack([L, R], 1)[:int(SR * DUR)]
fade = np.minimum(1, (DUR - np.arange(len(mx)) / SR) / 1.2)[:, None]
mx *= np.clip(fade, 0, 1)
mx /= np.abs(mx).max() + 1e-9; mx *= .89
with wave.open(os.path.join(ROOT, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mx * 32767).astype(np.int16).tobytes())
print('ok', len(mx) / SR)
