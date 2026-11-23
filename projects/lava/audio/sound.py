#!/usr/bin/env python3
"""ЛАВА — звук целиком: своя музыка «лаунж 70-х» (орган с лесли, круглый бас, щётки, вибрафон),
остановка/разгон плёнки, реальные CC0-записи + синтез. Выход: audio/mix.wav (48 кГц, стерео).
    python3 audio/sound.py [--dur 49]
"""
import numpy as np, subprocess, json, sys, os
SR = 48000
ROOT = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(ROOT); REPO = os.path.dirname(os.path.dirname(PRJ))
DUR = 48.75
for i, a in enumerate(sys.argv):
    if a == '--dur': DUR = float(sys.argv[i + 1])
N = int(DUR * SR)
rng = np.random.default_rng(7)

def load(path, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(sr), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
LIB = {s['id']: s for s in json.load(open(f'{REPO}/assets/sfx-library/index.json'))}
_cache = {}
def snd(name):
    if name not in _cache:
        p = f'{PRJ}/assets/sfx/{name}.flac'
        if not os.path.exists(p): p = f"{REPO}/assets/sfx-library/{LIB[name]['file']}"
        _cache[name] = load(p)
    return _cache[name]
def resample(x, rate):
    if rate == 1: return x
    idx = np.arange(0, len(x) - 1, rate); i0 = idx.astype(int); f = (idx - i0)[:, None]
    return x[i0] * (1 - f) + x[i0 + 1] * f
def db(v): return 10 ** (v / 20)
def fade(x, a=.005, b=.02):
    n = len(x); fa = min(n, int(a * SR)); fb = min(n, int(b * SR))
    if fa: x[:fa] *= np.linspace(0, 1, fa)[:, None]
    if fb: x[-fb:] *= np.linspace(1, 0, fb)[:, None]
    return x
def lp(x, fc):  # однополюсный ФНЧ
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = np.zeros(x.shape[1:])
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x, axis=0)
def hp(x, fc): return x - lp(x, fc)
def bp(x, lo, hi): return lp(hp(x, lo), hi)

buses = {k: np.zeros((N, 2)) for k in ('music', 'sfx', 'amb')}
def put(bus, x, t, gain=0., pan=0.):
    i = int(t * SR); x = x * db(gain)
    if x.ndim == 1: x = np.stack([x, x], 1)
    if pan: x = x * np.array([np.sqrt(.5 - pan / 2) * 1.414, np.sqrt(.5 + pan / 2) * 1.414])
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x));
    if j > i: buses[bus][i:j] += x[:j - i]
def S(name, t, gain=0., rate=1., start=0., length=None, pan=0., a=.002, b=.03, bus='sfx'):
    x = snd(name); x = x[int(start * SR):] if start else x
    if length: x = x[:int(length * SR)]
    x = fade(resample(x, rate).copy(), a, b); put(bus, x, t, gain, pan)

T = lambda d: np.arange(int(d * SR)) / SR
def env_adsr(n, a=.005, d=.1, s=.6, r=.2, hold=None):
    t = np.arange(n) / SR; hold = hold if hold is not None else n / SR - r
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    e = e * np.where(t > hold, np.clip(1 - (t - hold) / r, 0, 1), 1); return e

# ================= МУЗЫКА (в «плёночном» времени τ) =================
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
MLEN = 60.0
MN = int(MLEN * SR)
mus = {k: np.zeros((MN, 2)) for k in ('organ', 'bass', 'drums', 'vib', 'pad')}
def mput(k, x, t, g=0., pan=0.):
    i = int(t * SR)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x * db(g)
    if pan: x = x * np.array([1 - max(pan, 0), 1 + min(pan, 0)])
    j = min(MN, i + len(x))
    if j > i and i >= 0: mus[k][i:j] += x[:j - i]
def hz(m): return 440 * 2 ** ((m - 69) / 12)
# Dm9 – G13 – Bbmaj7 – A7(sus→7)
CH = [[50, 53, 57, 60, 64], [43, 53, 57, 59, 64], [46, 53, 57, 58, 62], [45, 52, 55, 59, 61]]
ROOTS = [38, 43, 34, 33]
def organ(notes, dur, leslie=6.2, bright=1.):
    t = T(dur); y = np.zeros_like(t)
    bars = [(.5, .55), (1, 1.), (1.5, .45), (2, .55), (3, .25 * bright), (4, .22 * bright), (6, .08 * bright)]
    for m in notes:
        f = hz(m)
        vib = 1 + .0035 * np.sin(2 * np.pi * leslie * t + m)
        ph = 2 * np.pi * f * np.cumsum(vib) / SR
        for r, a in bars: y += a * np.sin(ph * r)
    y /= len(notes) * 2.2
    am = 1 + .25 * np.sin(2 * np.pi * leslie * t)
    e = env_adsr(len(t), .012, .05, .9, .08)
    L = y * am * e; R = y * (2 - am) * e * .95
    return np.stack([L, R], 1)
def bass(m, dur, glide_from=None):
    t = T(dur); f0 = hz(m)
    f = np.full_like(t, f0)
    if glide_from: g = np.clip(t / .06, 0, 1); f = hz(glide_from) * (1 - g) + f0 * g
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + .35 * np.sin(2 * ph) + .12 * np.sin(3 * ph)
    y = np.tanh(y * 1.4) * env_adsr(len(t), .006, .18, .55, .07)
    return y * .5
def kick(): t = T(.35); f = 48 + 70 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * .9
def brush(d=.22, c=5200):
    x = rng.standard_normal(int(d * SR)); x = bp(x[:, None], 1800, c)[:, 0]
    t = T(d); return x * (np.clip(t / .03, 0, 1) * np.exp(-t * 9)) * .5
def tick(): x = rng.standard_normal(int(.05 * SR)); x = hp(x[:, None], 6000)[:, 0]; return x * np.exp(-T(.05) * 90) * .35
def rim(): t = T(.06); return (np.sin(2 * np.pi * 1700 * t) * .6 + rng.standard_normal(len(t)) * .3) * np.exp(-t * 70) * .4
def vib(m, dur, trem=5.5):
    t = T(dur); f = hz(m)
    y = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 6)
    return y * np.exp(-t * 1.6) * (1 + .3 * np.sin(2 * np.pi * trem * t)) * env_adsr(len(t), .002, .1, 1, .1) * .45
def pad(notes, dur):
    t = T(dur); y = np.zeros_like(t)
    for m in notes:
        for d in (-.07, .07): y += np.sin(2 * np.pi * hz(m) * (1 + d / 100) * t + d * 9)
    return y / len(notes) * .35 * env_adsr(len(t), .8, .1, 1, .8)

# секции в τ: (начало, конец, что играет)
def section_mask(tau, secs):
    for a, b, v in secs:
        if a <= tau < b: return v
    return {}
SECS = [
    (2.4, 6.0, {'organ': 1, 'bass': 1, 'pad': 1}),                       # отъезд: орган+бас
    (6.0, 12.6, {'organ': 1, 'bass': 1, 'drums': 1}),                    # грув
    (12.6, 15.3, {'organ': 1, 'bass': 1, 'drums': 1, 'vib_up': 1}),     # всплытие
    (15.3, 17.2, {'pad': 1}),                                            # провал (уа-уа отдельно)
    (17.2, 22.0, {'organ': 1, 'bass': 1, 'drums': 1}),
    (22.0, 26.0, {'organ_trem': 1, 'pad': 1}),                           # разогрев — напряжение
    (29.55, 34.6, {'organ': 1, 'bass': 1, 'drums': 2, 'vib': 1}),       # свобода — полный
    (34.6, 40.0, {'organ': 1, 'bass': 1, 'drums': 2, 'vib': 1}),        # под остановкой плёнки
]
def build_music():
    beat0 = 2.4
    nb = int((MLEN - beat0) / BEAT)
    for b in range(nb):
        tb = beat0 + b * BEAT
        sec = section_mask(tb + .01, SECS)
        bar = b // 4; bi = b % 4; ch = (bar % 4)
        if not sec: continue
        if 'organ' in sec:
            # комп: долгий аккорд на 1, стабы на «2и» и «4»
            if bi == 0: mput('organ', organ(CH[ch], BEAT * 1.4, bright=1.3 if sec.get('drums') == 2 else 1), tb, -2)
            if bi == 1: mput('organ', organ(CH[ch], BEAT * .35), tb + BEAT * .5, -5)
            if bi == 3: mput('organ', organ(CH[ch], BEAT * .5), tb, -5)
        if 'organ_trem' in sec and bi == 0:
            mput('organ', organ(CH[0] if bar % 2 == 0 else CH[3], BAR * 1.02, leslie=9 + 3 * (tb - 22) / 4), tb, -4)
        if 'pad' in sec and bi == 0: mput('pad', pad(CH[ch][1:], BAR * 1.1), tb, -8)
        if 'bass' in sec:
            r = ROOTS[ch]; pat = [r, r + 7, r + 12, r + 10]
            mput('bass', bass(pat[bi], BEAT * .9, glide_from=pat[bi - 1] if bi == 2 else None), tb, -1)
            if bi == 3: mput('bass', bass(r + 7, BEAT * .4), tb + BEAT * .66, -6)
        if 'drums' in sec:
            if bi in (0, 2): mput('drums', kick(), tb, -3)
            if bi in (1, 3): mput('drums', brush(.28), tb, -4)
            sw = BEAT * .66
            mput('drums', tick(), tb, -12); mput('drums', tick(), tb + sw, -14, .3)
            if sec['drums'] == 2 and bi == 3: mput('drums', rim(), tb + sw, -8, -.3)
        if 'vib' in sec:
            mel = [74, 77, 81, 79, 77, 74, 72, 74]
            if bi in (0, 1, 2) or b % 2: mput('vib', vib(mel[(b * 3) % len(mel)], BEAT * 1.8), tb + (BEAT * .66 if b % 2 else 0), -6, .25)
        if 'vib_up' in sec:
            for k, m in enumerate([62, 65, 69, 72]): mput('vib', vib(m + 12 * ((b % 2)), BEAT * .9), tb + k * BEAT / 4, -9, -.2)
    # мягкий «хвост» органа в провал: уа-уа (тромбон-орган вниз)
    t = T(1.9); f = hz(57) * 2 ** (-np.clip(t / 1.7, 0, 1) * 7 / 12) * (1 + .012 * np.sin(2 * np.pi * 5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; y = (np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph)) * env_adsr(len(t), .05, .2, .8, .3)
    for k, st in enumerate([0, .45, .9]):
        seg = y[int(st * SR):int((st + .5 + (k == 2) * .9) * SR)]
        mput('organ', np.stack([seg, seg], 1) * .35 * env_adsr(len(seg), .02, .1, 1, .1)[:, None], 15.35 + st, -2)
    return mus
build_music()
MIX = {'organ': -1, 'bass': -2, 'drums': -3, 'vib': -2, 'pad': -2}
music_tau = sum(mus[k] * db(g) for k, g in MIX.items())
# вход музыки — подъём органа
music_tau[:int(2.4 * SR)] = 0

# ---- карта плёнки: t → τ (остановка 34.6–36.9, тишина, разгон 41.4–42.3) ----
def tau_map(t):
    out = np.empty_like(t)
    s0, s1 = 34.6, 36.9     # торможение
    r0, r1 = 41.4, 42.3     # разгон
    stop_len = (s1 - s0) / 2            # интеграл линейного спада 1→0
    for i, x in enumerate(t):
        if x < s0: out[i] = x
        elif x < s1: u = x - s0; out[i] = s0 + u - u * u / (2 * (s1 - s0))
        elif x < r0: out[i] = s0 + stop_len
        elif x < r1: u = x - r0; out[i] = s0 + stop_len + u * u / (2 * (r1 - r0))
        else: out[i] = s0 + stop_len + (r1 - r0) / 2 + (x - r1)
    return out
tt = np.arange(N) / SR
tau = tau_map(tt[::48]); tau = np.interp(tt, tt[::48], tau)
mi = np.clip(tau * SR, 0, MN - 2); i0 = mi.astype(int); fr = (mi - i0)[:, None]
music = music_tau[i0] * (1 - fr) + music_tau[i0 + 1] * fr
# в момент полной остановки и в тишине — ноль; на торможении глушим верха (плёнка тянется)
moving = (tt < 36.85) | (tt > 41.42)
music *= moving[:, None]
# после прыжка (46.0) — музыка обрывается щелчком лампы
music *= (tt < 46.0)[:, None]
music[(tt >= 45.98) & (tt < 46.0)] *= np.linspace(1, 0, ((tt >= 45.98) & (tt < 46.0)).sum())[:, None]
buses['music'] += music

# ================= АТМОСФЕРА =================
def hum(d):
    t = T(d); y = np.sin(2 * np.pi * 60 * t) * .5 + np.sin(2 * np.pi * 120 * t) * .3 + np.sin(2 * np.pi * 180 * t) * .1
    return y * .05
put('amb', hum(DUR), 0, -10)
uw = snd('underwater'); uw_loop = np.tile(uw, (int(DUR / (len(uw) / SR)) + 2, 1))[:N]
inside = np.zeros(N)
for a, b in [(0, 2.4), (6.0, 9.6), (11.2, 30.4), (46.0, 49.0)]:
    inside[int(a * SR):int(b * SR)] = 1
inside = lp(inside[:, None], 6)[:, 0]
buses['amb'] += lp(uw_loop, 900) * inside[:, None] * db(-10)
# комнатный воздух (розовый шум)
room = lp(rng.standard_normal((N, 2)), 400) * .02
buses['amb'] += room
# птицы на рассвете
rb = snd('robins')
bird_env = np.clip((tt - 39.2) / 2.5, 0, 1) * (tt < 46.0)
seg = rb[:N - int(38.8 * SR)]
buses['amb'][int(38.8 * SR):int(38.8 * SR) + len(seg)] += seg * bird_env[int(38.8 * SR):int(38.8 * SR) + len(seg), None] * db(-8)

# ================= ЭФФЕКТЫ =================
def thud(f=70, d=.35, g=0.):
    t = T(d); fr = f + 60 * np.exp(-t * 25); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 11) * db(g)
def whoosh(d=.5, up=True, g=0.):
    x = rng.standard_normal(int(d * SR)); t = T(d)
    cut = (400 + 3000 * (t / d if up else 1 - t / d))
    y = np.zeros_like(x); a = 0
    for i in range(0, len(x), 256):
        fc = cut[i]; al = np.exp(-2 * np.pi * fc / SR)
        seg = x[i:i + 256]; o = np.empty_like(seg)
        for j, v in enumerate(seg): a = al * a + (1 - al) * v; o[j] = a
        y[i:i + 256] = o
    return y * np.sin(np.pi * t / d) ** 2 * 1.2 * db(g)
def riser(d=3.6):
    t = T(d); f = 180 * 2 ** (t / d * 3)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + bp(rng.standard_normal((len(t), 1)), 1500, 6000)[:, 0] * .3 * (t / d)
    return y * (t / d) ** 2
def chime(m0=84, n=6, step=.07):
    out = np.zeros(int((n * step + 1.5) * SR))
    for k in range(n):
        v = vib(m0 + [0, 3, 7, 10, 12, 15, 19][k % 7], 1.2); i = int(k * step * SR); out[i:i + len(v)] += v
    return out * .5
def blinktick(): return tick() * .6

# 1. ХУК
put('sfx', whoosh(.2, True), -.03, -8)
S('glasstap', .15, 2, rate=.62)            # стук в стекло — ниже, «тупее»
S('splat', .16, -2)
put('sfx', thud(85, .3), .16, -2)
S('glasstap2', .2, -12, rate=.5)
S('slime13', 1.0, -4, rate=1.1)             # отлипает
put('sfx', blinktick(), 1.6, -10)
S('pop-small-bubble', 1.85, -10); S('pop-small-bubble', 2.1, -12, rate=1.2)
# 2. отъезд
put('sfx', whoosh(1.4, False), 2.4, -16)
put('sfx', blinktick(), 3.3, -14); put('sfx', blinktick(), 5.0, -14)
# 3. пассажиры
S('goo', 6.3, -14, start=.2, length=1.0, rate=.8)
S('goo', 8.0, -15, start=1.3, length=1.0, rate=.75)
S('pop-medium-bubble', 7.1, -12); S('pop-small-bubble', 9.0, -12)
put('sfx', blinktick(), 7.1, -14); put('sfx', blinktick(), 8.2, -14)
# 4. крышка далеко — тихий звон металла
S('lidring', 9.75, -24, start=1.0, length=1.4, rate=1.5)
# 5. решимость
S('transform-stretch', 11.75, -10, rate=1.3)
S('pop-medium-in', 12.0, -8)
# 6. всплытие и провал
S('bubbles', 12.7, -12, length=2.0)
S('goo', 15.2, -14, start=.1, length=.8, rate=.6)
# 7. автостоп
S('transform-stretch', 17.4, -10)
S('move-spring', 17.65, -8, rate=1.1)
S('splat', 18.4, -9, rate=.9)
S('goo', 19.0, -6, start=0, length=2.6, rate=.85)
S('slime13', 20.55, -2, rate=.8)
S('pop-large-out', 20.6, -4)
put('sfx', whoosh(.8, False), 20.9, -12)
put('sfx', blinktick(), 18.9, -12)
# 8. разогрев
sz = snd('sizzle')[:int(4.2 * SR)].copy(); szt = T(4.2)
sz *= np.clip((szt - .3) / 3, 0, 1)[:, None] ** 1.5
put('sfx', sz, 22.0, -10)
put('sfx', riser(3.9), 22.1, -10)
for k in range(12):
    S('pop-small-bubble', 22.9 + k * .27 + .05 * np.sin(k * 3), -12 + (k % 3) * -2, rate=1 + .15 * (k % 4))
S('transform-stretch', 24.6, -8, rate=.8)
# 9. ракета и удар
put('sfx', whoosh(.55, True), 26.0, -2)
S('whoosh-fast-hard', 26.05, -6)
S('impact-heavy-hard', 26.55, 0)
S('lidring', 26.55, -8, length=1.0)
S('splat', 26.56, -4)
put('sfx', thud(60, .5), 26.55, 0)
# 10. крышку выбивает
for k, tS in enumerate([27.95, 28.75]):
    put('sfx', whoosh(.25, True), tS - .25, -12)
    S('impact-medium-hard', tS, -2 + k)
    S('liddrop', tS, -6 + k * 2, start=.0, length=.5)
    S('splat', tS + .01, -8)
    put('sfx', thud(65, .3), tS, -4)
put('sfx', whoosh(.3, True), 29.3, -8)
S('pop-large-out', 29.55, 2, rate=.75)          # «чпок» пробки
S('impact-heavy-hard', 29.55, -3)
S('lidring', 29.6, -10, length=1.2, rate=1.1)
put('sfx', whoosh(.9, True), 29.62, -6)
S('liddrop', 30.95, -14, start=0, length=2.5, pan=-.4)   # крышка грохочет где-то на столе
# 11. выход
S('goo', 30.45, -6, start=.4, length=1.0, rate=1.1)
S('slime13', 31.2, -6, rate=1.25)
put('sfx', chime(84, 5, .09), 31.5, -12)
put('sfx', blinktick(), 31.7, -12); put('sfx', blinktick(), 33.3, -12)
S('pop-small-in', 32.7, -10)
# 12. холод
cold = bp(rng.standard_normal((int(4.6 * SR), 1)), 300, 2500)[:, 0] * np.sin(np.pi * T(4.6) / 4.6) * .25
put('sfx', cold, 34.2, -10)
for k, tc in enumerate([35.1, 35.9, 36.5, 37.4]):
    S(f'bsb-ice-crack-{k % 3 + 1}', tc, -8 - k, length=.8)
put('sfx', blinktick(), 34.9, -12)
# 13. рассвет и оттаивание
put('sfx', chime(76, 7, .16), 39.6, -14)
S('matchsizzle', 40.6, -10)
S('goo', 41.1, -12, start=.4, length=.8, rate=1.3)
put('sfx', blinktick(), 41.9, -10); put('sfx', blinktick(), 42.2, -10)
S('pop-medium-in', 42.6, -8)
# 14. прыжок
S('transform-stretch', 43.6, -8, rate=1.2)
S('move-spring', 44.0, -6)
put('sfx', whoosh(1.0, True), 44.05, -6)
put('sfx', chime(88, 4, .06), 44.3, -12)
# 15. финал-петля
S('click-rocker-firm', 46.0, -6)                 # щелчок — назад в лампу
put('sfx', blinktick(), 47.05, -8)
S('pop-small-bubble', 47.3, -10)
put('sfx', whoosh(.5, True), 48.35, -6)
S('glasstap', 48.8, 2, rate=.62)
S('splat', 48.81, -2)
put('sfx', thud(85, .3), 48.81, -2)

# ================= СВЕДЕНИЕ =================
mix = buses['music'] * db(-6) + buses['sfx'] * db(-1) + buses['amb'] * db(-3)
# мягкий лимит
mix = np.tanh(mix * 1.2) / 1.2
out = f'{ROOT}/mix.wav'
import wave
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print('mix →', out, f'{DUR:.1f} с, пик {np.abs(mix).max():.2f}')
