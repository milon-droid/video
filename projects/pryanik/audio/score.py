#!/usr/bin/env python3
"""Звук «CROOKED»: музыкальная шкатулка (синтез гребёнки), пиццикато (Карплус-Стронг), тёплый «струнный» фон,
живые записи: глазурь, лопатка, коробка, колокольчик двери, выключатель, свеча, ветер, часы, дрожащая посуда,
полночные колокола и салют, бубенцы. python3 audio/score.py → audio/mix.wav"""
import subprocess, os, numpy as np, wave
D = os.path.dirname(os.path.abspath(__file__)); REC = D + '/rec/'
SR = 48000; DUR = 68.5 + 0.5; N = int(DUR * SR)
bus = {k: np.zeros((N, 2), np.float32) for k in ('amb', 'mus', 'sfx')}
_c = {}
def load(f, a=0, b=None):
    k = (f, a, b)
    if k in _c: return _c[k]
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(a)] + (['-t', str(b - a)] if b else []) + ['-i', REC + f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).reshape(-1, 2).copy(); _c[k] = x; return x
def fft_filter(x, lp=None, hp=None):
    n = len(x); X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(n, 1 / SR); g = np.ones_like(f)
    if lp: g *= 1 / np.sqrt(1 + (f / lp) ** 4)
    if hp: g *= 1 / np.sqrt(1 + (hp / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g[:, None], n, axis=0).astype(np.float32)
def rate(x, r):
    if r == 1: return x
    n = int(len(x) / r); i = np.arange(n) * r
    return np.stack([np.interp(i, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
def env(x, fi=0.005, fo=0.05):
    n = len(x); e = np.ones(n, np.float32); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] *= np.linspace(1, 0, b)
    return x * e[:, None]
def norm(x, pk=0.9):
    m = np.abs(x).max() if len(x) else 0
    return x * (pk / m) if m > 1e-6 else x
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
def ir(t60=1.6, pre=0.012, lp=6000):
    n = int(t60 * SR); rng = np.random.default_rng(3); t = np.arange(n) / SR
    h = rng.standard_normal((n, 2)).astype(np.float32) * np.exp(-6.9 * t / t60)[:, None]
    h[:int(pre * SR)] = 0; h = fft_filter(h, lp=lp, hp=180); return h / np.sqrt((h ** 2).sum()) * 0.9
def conv(x, h):
    n = len(x) + len(h); m = 1 << (n - 1).bit_length()
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], m) * np.fft.rfft(h[:, c], m), m)[:len(x)] for c in (0, 1)], 1).astype(np.float32)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
st = lambda y, pan=0: np.stack([y * np.cos((pan + 1) * np.pi / 4) * 1.414, y * np.sin((pan + 1) * np.pi / 4) * 1.414], 1).astype(np.float32)
# ---------- инструменты ----------
def mbox(t, m, g=.2, pan=0, bend=0, dec=2.4):
    """музыкальная шкатулка: язычок гребёнки — основной тон + негармоничные обертоны + щелчок штифта; bend — съезд вниз (полутона)"""
    n = int(dec * 1.8 * SR); tt = np.arange(n) / SR; f = mf(m) * 2 ** (-bend * np.minimum(1, tt / .5) / 12)
    ph = 2 * np.pi * np.cumsum(f) / SR; y = np.zeros(n)
    for k, (p, a, d) in enumerate([(1, 1, 1), (2.0, .12, .45), (5.93, .35, .14), (9.57, .16, .07), (14.3, .06, .04)]):
        y += a * np.sin(ph * p + k) * np.exp(-tt / (dec * d))
    y *= np.minimum(1, tt / .0015)
    ck = np.random.default_rng(int(m * 7 + t * 100)).standard_normal(int(.004 * SR)) * np.exp(-np.arange(int(.004 * SR)) / 40) * .25
    y[:len(ck)] += ck
    put('mus', st(y * .3, pan), t, g, fi=0, fo=.2)
def pluck(t, m, g=.2, pan=0, dec=.996, bright=.5):
    """пиццикато Карплус-Стронг"""
    f = mf(m); L = int(SR / f); n = int(1.6 * SR); rng = np.random.default_rng(int(m * 13 + t * 7))
    buf = rng.uniform(-1, 1, L); buf = np.convolve(buf, [bright, 1 - bright], 'same'); out = []
    for i in range(n // L + 1):
        out.append(buf.copy()); buf = dec * .5 * (buf + np.roll(buf, -1))
    y = np.concatenate(out)[:n]
    y *= np.minimum(1, np.arange(n) / 40)
    put('mus', st(y * .35, pan), t, g, fi=0, fo=.3, lp=3500)
def pad(t, ms, dur, g=.05, att=1.2, rel=1.5, lp=1800):
    """тёплый струнный фон: расстроенные пилы через фильтр"""
    n = int((dur + rel) * SR); tt = np.arange(n) / SR; y = np.zeros((n, 2))
    for m in ms:
        for k, dt in enumerate([-.11, 0, .13]):
            f = mf(m) * 2 ** (dt / 12); ph = (2 * np.pi * f * tt + k * 2.1 + m)
            s = 2 * ((ph / (2 * np.pi)) % 1) - 1
            y[:, k % 2] += s * (1 + .2 * np.sin(2 * np.pi * (.2 + k * .07) * tt))
    e = np.minimum(1, tt / att) * np.clip((dur + rel - tt) / rel, 0, 1) ** 1.5
    y = y * e[:, None] / (len(ms) * 3)
    put('mus', fft_filter(y.astype(np.float32), lp=lp, hp=120), t, g, fi=0, fo=.1)
def celesta(t, m, g=.12, pan=0):
    n = int(2.2 * SR); tt = np.arange(n) / SR; f = mf(m)
    y = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 1.6) * np.minimum(1, tt / .002)
    put('mus', st(y * .3, pan), t, g, fi=0, fo=.2)
# ---------- тема (оригинальная): вальс ре мажор; (доля, нота, длит.) ----------
THEME = [(0, 78, 1), (1, 81, 1), (2, 86, 1), (3, 85, 2), (5, 83, 1), (6, 81, 1), (7, 78, 1), (8, 79, 1), (9, 76, 3),
         (12, 76, 1), (13, 79, 1), (14, 83, 1), (15, 81, 2), (17, 79, 1), (18, 78, 1), (19, 76, 1), (20, 73, 1), (21, 74, 3)]
CHORDS = [(50, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (45, [61, 64, 67]), (52, [62, 67, 71]), (45, [61, 64, 69]), (54, [62, 66, 69]), (50, [62, 66, 69])]
def waltz(t0, bpm, bars=8, g=1., mel=True, bass=True, oom=True, bells=False, cel=False, tr=0, crooked_end=False, mel_g=.22):
    b = 60 / bpm
    for (beat, m, d) in THEME:
        if beat >= bars * 3: break
        bend = 1 if (crooked_end and beat == 21) else 0
        if mel: mbox(t0 + beat * b, m + tr, mel_g * g, pan=.15, bend=bend)
        if cel and mel: celesta(t0 + beat * b + .005, m + tr - 12, .06 * g, pan=-.2)
    for i in range(bars):
        root, ch = CHORDS[i % 8]; tb = t0 + i * 3 * b
        if bass: pluck(tb, root + tr - 12, .3 * g, pan=-.1, bright=.35)
        if oom:
            for k in (1, 2):
                for j, m in enumerate(ch): pluck(tb + k * b + j * .004, m + tr, .07 * g, pan=.25 - j * .25, bright=.6)
        if bells:
            put('mus', load('sleighhit.mp3'), tb, .12 * g, pan=.4, fi=0)
            put('mus', load('sleighhit.mp3'), tb + 1.5 * b, .06 * g, pan=-.4, fi=0, r=1.05)
    return t0 + bars * 3 * b
# ---------- музыка по сценам ----------
# S1 хук: три ноты шкатулки, на соскальзывании — нота «съезжает» вниз
mbox(0.05, 78, .2); mbox(0.45, 81, .2); mbox(0.85, 86, .22); mbox(1.45, 85, .2, bend=.0); mbox(1.75, 83, .22, bend=2.5, dec=1.5)
mbox(2.6, 71, .12); mbox(2.85, 70, .1, bend=1)
# S2–S3: вальс игриво (104 bpm) с 3.7
waltz(3.75, 104, bars=8, g=.9, bells=True)
waltz(3.75 + 8 * 3 * 60 / 104, 104, bars=3, g=.75, mel=False)
# пауза-«замирание» лопатки над ним 14.75–15.25, «нет»: две низкие ноты пиццикато
pluck(15.3, 45, .4); pluck(15.55, 44, .35)
# S3b коробка: короткая каденция
mbox(16.4, 74, .2); mbox(16.7, 78, .2); mbox(17.0, 81, .2); mbox(17.3, 86, .22)
# S4 одиночество: тема медленно, си минор, редкая
waltz(18.7, 66, bars=3, g=.65, oom=False, tr=-3, crooked_end=False, mel_g=.2)
# выключатель 23.0 — тишина. S5 ночь: колыбельная (шкатулка заводится, медленно)
waltz(25.6, 58, bars=4, g=.5, bass=False, oom=False, mel_g=.2)
pad(25.4, [50, 57, 62, 66], 7.6, .035, att=2.5)
# S6: тяжёлый фон, только редкие ноты
pad(33.2, [47, 54, 59, 62], 11.4, .04, att=2.0, lp=1400)
for (t, m) in [(34.4, 71), (36.3, 74), (38.2, 73), (40.1, 69), (42.0, 71)]: mbox(t, m, .14, pan=-.1)
# S7b раскрытие: тёплый подъём
pad(45.4, [50, 57, 62, 66, 69], 5.4, .055, att=1.6)
for (t, m) in [(45.9, 78), (46.5, 81), (47.1, 86), (47.9, 85), (48.4, 83), (48.9, 81), (49.5, 78)]: mbox(t, m, .2, pan=.1)
celesta(47.1, 74, .08); celesta(49.5, 66, .06)
# S8: тема тихо, затем полночь — полный вальс с бубенцами
pad(50.6, [47, 54, 59, 62], 2.4, .04); pad(53.0, [45, 52, 57, 61], 2.6, .045)
for (t, m) in [(50.9, 74), (51.8, 78), (52.7, 76), (53.6, 73), (54.5, 74)]: mbox(t, m, .16)
end = waltz(55.65, 96, bars=8, g=1.05, bells=True, cel=True)
pad(55.6, [50, 57, 62, 66], 12.4, .045, att=1.0)
mbox(end, 86, .22); mbox(end + .02, 74, .18); celesta(end, 62, .1); pluck(end, 38, .35)
# ---------- шумы и записи ----------
A = lambda f, t, g, **k: put('amb', load(f), t, g, **k)
def S(f, t, g, a=0, b=None, **k): put('sfx', load(f, a, b), t, g, **k)
# пекарня: тихий гул (ветер очень тихо с низами) 0–23
put('amb', load('wind.mp3', 30, 53), 0, .08, fi=.5, fo=.4, lp=600)
# глазурь: выдавливание
S('squelch2.mp3', 0.0, .25, 0.0, .4, r=1.3); S('squelch2.mp3', 0.9, .22, 1.1, 2.1, r=1.15, lp=5000); S('squelch.mp3', 1.95, .35, r=.8)
S('squelch2.mp3', 2.0, .25, 2.8, 3.3, r=.7)
# ахнул: тихий «ик» — высокий хихик-вдох
S('giggle.mp3', 2.08, .22, 0.0, .25, r=1.7, hp=600)
# идеальные хихикают
S('giggle2.mp3', 6.0, .3, 2.1, 3.3, r=1.55, hp=400, pan=-.3); S('giggle.mp3', 6.15, .25, r=1.5, pan=.3)
# лопатка: скрежет на каждый подъём
from math import floor
lifts = []; tt = 9.1
for i in range(11): lifts.append(tt); tt += .62 if i < 3 else .45
for i, t in enumerate(lifts):
    S('scrape1.mp3' if i % 2 == 0 else 'scrape2.mp3', t + .05, .22, .15, .55, r=1.25 + (i % 3) * .08, pan=-.3 + (i % 3) * .2, hp=500)
    S('shing.mp3', t + .3, .06, 0, .3, r=1.4, hp=1500)
# последняя: подъезд, замирание, толчок + удар о бортик
S('scrape2.mp3', 14.45, .25, .2, .55, r=1.1); S('scrape1.mp3', 15.25, .3, .2, .5, r=.9)
S('box.mp3', 15.55, .18, 1.2, 1.5, r=1.8, hp=300)
# коробка: крышка, бант, колокольчик двери, дверь
S('box.mp3', 16.6, .35, 2.3, 2.75); S('sleighhit.mp3', 16.9, .12, r=1.3)
S('shopbell.mp3', 17.6, .35, .2, 2.6); S('box.mp3', 18.2, .12, 3.5, 3.9, r=.7, lp=1500)
# S4: шаги по противню (крекер — тихо), мазок глазури, выключатель
for t in [18.75, 19.05, 19.35]: S('crackersteps.mp3', t, .14, 1.25, 1.55, r=1.6, hp=900)
S('squelch.mp3', 20.5, .25, r=1.4); S('squelch2.mp3', 20.9, .2, 1.7, 2.1, r=1.3)
S('switch.mp3', 23.0, .5)
# после выключателя: ночь — ветер за окном и свеча
put('amb', load('wind.mp3', 120, 168), 23.1, .22, fi=1.5, fo=1.0, lp=2500)
put('amb', load('candle.mp3', 10, 55), 25.2, .4, fi=.6, fo=1.0, hp=200)
# прыжок с противня и шаги по скатерти
S('crackersteps.mp3', 25.95, .16, 2.3, 2.6, r=1.4, lp=3000)
for k in range(13): S('crackersteps.mp3', 26.25 + k * .38, .08, [0.35, 1.25, 2.3, 3.4][k % 4], [0.6, 1.5, 2.55, 3.65][k % 4], r=1.7, lp=2500, hp=500, pan=-.4 + k * .06)
# звяк ложки в чашке
S('spooncup.mp3', 31.25, .4, 1.0, 2.0, pan=.5)
# S6–S7: часы на руке (тикают громко рядом), дрожь посуды
put('sfx', load('watch.mp3', 0, 12), 33.2, .16, fi=.4, fo=.3, pan=.3)
S('crockery.mp3', 33.4, .22, 4.0, 15.0, fi=.3, fo=.8, lp=6000)
S('crockery.mp3', 41.6, .2, 6.0, 9.4, fi=.1, fo=.9, lp=6000)
S('crackersteps.mp3', 42.0, .14, 2.3, 2.6, r=1.3); S('spooncup.mp3', 42.45, .25, 4.8, 5.2, r=1.2)  # прыжок на блюдце — звяк
# в чае: тишина, только капля и тихий вдох
S('spooncup.mp3', 45.5, .12, 5.0, 5.5, r=.7, lp=3000)
# S8: чашка — звяк; полночь: колокол + салют и люди
S('spooncup.mp3', 50.7, .2, 7.0, 7.6)
S('midnight.mp3', 53.3, .5, 0, 9.5, fi=.05, fo=1.5)
put('amb', load('nye.mp3', 18.0, 33.0), 55.4 - 2.35 + 2.35, .55, fi=.3, fo=2.5, lp=9000)
S('sleigh.mp3', 57.6, .2, 4.3, 6.5, fi=.05, fo=.6)  # он машет — бубенцы
# хвост атмосферы до конца
put('amb', load('candle.mp3', 60, 80), 62.0, .3, fi=1, fo=1.5, hp=200)
# ---------- сведение ----------
mus = bus['mus']
bus['mus'] = mus + conv(mus, ir(2.2, lp=7000)) * .45
bus['sfx'] += conv(bus['sfx'], ir(.9)) * .18
mix = bus['amb'] * 1.0 + bus['mus'] * 1.0 + bus['sfx'] * 1.0
mix /= max(1e-6, np.abs(mix).max()) / .9
w = wave.open(D + '/mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close(); print('ok', DUR)
