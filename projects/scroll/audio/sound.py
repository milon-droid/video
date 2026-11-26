#!/usr/bin/env python3
"""FOR YOU — звук: в ленте быстрый бит и звуки роликов, в комнате тишина; свайпы, уведомления, вибрация, сердце. → mix.wav"""
import json, subprocess, os, sys, wave, numpy as np
SR = 48000; DUR = 43.0; N = int(SR * DUR); NE = N + 4 * SR
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
LIB = os.path.join(ROOT, 'assets/sfx-library'); IDX = {e['id']: e for e in json.load(open(os.path.join(LIB, 'index.json')))}
SF = os.path.join(HERE, '../assets/sfx'); rng = np.random.default_rng(9)
bus = {k: np.zeros((NE, 2)) for k in ('mus', 'sfx', 'amb')}
def dec(f, a=0, b=None):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).astype(float)
    x = x[int(a * SR):int(b * SR) if b else None]; x /= np.abs(x).max() + 1e-9; n = min(len(x), int(.02 * SR)); x[-n:] *= np.linspace(1, 0, n); return x
L = lambda i, a=0, b=None: dec(os.path.join(LIB, IDX[i]['file']), a, b)
F = lambda f, a=0, b=None: dec(os.path.join(SF, f), a, b)
def put(x, t, g=1., pan=0., b='sfx'):
    i = int(t * SR); x = np.asarray(x)
    if i < 0: x = x[-i:]; i = 0
    if i >= NE: return
    x = x[:NE - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[b][i:i + len(x), 0] += x * g * l * 1.41; bus[b][i:i + len(x), 1] += x * g * r * 1.41
def rs(x, k): n = int(len(x) / k); return np.interp(np.arange(n) * k, np.arange(len(x)), x)
def lpv(x, fc): k = max(1, int(SR / fc / 2)); w = np.hanning(2 * k + 1); w /= w.sum(); return np.convolve(x, w, 'same')
def sine(f, d, a=.003, r=.1): n = int(SR * d); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(np.full(n, f) if np.isscalar(f) else f) / SR) * np.minimum(1, t / a) * np.exp(-t / r)
# таймлайн (как в story.js)
FEEDS = [(0, [('A', 1.5), ('B', 1.1), ('C', 1.0)]), (6.2, [('D', .85), ('E', .85), ('F', .85), ('G', .85)]), (12.8, [(k, .6) for k in 'HIJKLM']), (21.8, [(k, .47) for k in 'NOPWRSTX'])]
ZK = [(0, 1), (3.6, 1), (4.4, 0), (5.4, 0), (6.2, 1), (9.6, 1), (10.2, 0), (12.0, 0), (12.8, 1), (16.4, 1), (17.0, 0), (21.0, 0), (21.8, 1), (25.6, 1), (26.2, 0), (30.6, 0), (31.4, 1), (34.4, 1), (35.2, 0), (40.6, 0), (DUR, 1)]
FACE = [(12.0, 12.8), (21.0, 21.8)]
def zoom(t):
    for (a, va), (b, vb) in zip(ZK, ZK[1:]):
        if t <= b: u = min(1, max(0, (t - a) / (b - a))); u = 4 * u ** 3 if u < .5 else 1 - (-2 * u + 2) ** 3 / 2; return va + (vb - va) * u
    return 1
tt = np.arange(NE) / SR; ZE = np.array([zoom(x % DUR if x < DUR else x - DUR) for x in tt[::480]]); ZE = np.interp(np.arange(NE), np.arange(0, NE, 480), ZE)
for a, b in FACE: ZE[int(a * SR):int(b * SR)] = .35
DEADM = (tt > 30.4) & (tt < 39.0)
# ---------- бит ленты: kick + hat + коровий колокол (phonk-ish), темп растёт ----------
def kick(): n = int(.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(55 + 140 * np.exp(-t * 30)) / SR) * np.exp(-t * 7)
def hat(): n = int(.05 * SR); return (rng.standard_normal(n) - lpv(rng.standard_normal(n), 6000)) * np.exp(-np.arange(n) / SR * 80)
def bell(f): n = int(.4 * SR); t = np.arange(n) / SR; return (np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * 1.48 * t) * .5) * np.exp(-t * 9)
mel = [76, 79, 76, 74, 76, 79, 81, 79]; mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
t = 0.; i = 0
while t < DUR + 3:
    bpm = 140 if t < 12 else 155 if t < 21.8 else 175
    st = 60 / bpm / 2
    if i % 4 == 0: put(kick(), t, .9, 0, 'mus')
    put(hat(), t, .25 if i % 2 else .15, .3, 'mus')
    if i % 2 == 0: put(lpv(bell(mtof(mel[(i // 2) % 8])), 4000), t, .22, -.2, 'mus')
    t += st; i += 1
# ---------- звуки роликов ----------
def clip_sfx(k, t0, d):
    if k == 'A':
        st = F('footsteps-wooden-stairs-3-ac0a94.mp3', .1, 1.6); put(rs(st, 1.6)[:int(d * SR)], t0, .35, .1); put(L('whoosh-fast-soft'), t0 + d * .45, .35, .2)
    elif k == 'B':
        n = int(d * SR); x = np.arange(n) / SR; put((np.sin(2 * np.pi * 110 * x) + .5 * np.sin(2 * np.pi * 112.5 * x) + .3 * np.sin(2 * np.pi * 330 * x * (1 + .01 * np.sin(x * 9)))) * np.minimum(1, x / .05) * .5, t0, .4, 0)
    elif k == 'C':
        c = F('paper-rustle-910aa4.mp3', .2, .5); j = 0
        while j * .28 < d: put(rs(c, 1.8), t0 + j * .28, .45, -.1); put(L('click-clip-firm'), t0 + j * .28, .3); j += 1
    elif k == 'D':
        j = 0
        while j * .7 < d: put(L('pop-large-in'), t0 + j * .7 + .1, .45, (j % 2 - .5) * .4); j += 1
        put(L('move-spring'), t0, .2)
    elif k == 'E':
        put(rs(L('transform-stretch'), 1.4), t0 + .5, .4); put(L('impact-heavy-firm'), t0 + .68, .7); put(L('appear-burst'), t0 + .7, .35)
        n = int(.6 * SR); x = np.arange(n) / SR; put(lpv(rng.standard_normal(n), 2000) * np.minimum(1, x / .3) * .3, t0, .3)
    elif k == 'F':                                         # раннер: монетки, свист прыжка
        for j in range(int(d / .18)): put(sine(1568 if j % 2 else 2093, .12, r=.05), t0 + j * .18, .25, .3)
        put(L('whoosh-fast-soft'), t0 + .2, .35)
    elif k == 'G':                                         # слайм: хлюп и пузыри
        for j in range(3): n = int(.25 * SR); x = np.arange(n) / SR; put(lpv(rng.standard_normal(n), 700) * np.sin(np.pi * x / x[-1]) * 1.4, t0 + j * .3, .4, (j - 1) * .3)
        put(rs(L('pop-large-in'), .7), t0 + .5, .3)
    elif k == 'H':                                         # домино: каскад щелчков
        for j in range(int(d / .07)): put(rs(L('click-clip-firm'), .8 + (j % 3) * .1), t0 + j * .07, .3 + .02 * j, (j % 5 - 2) * .15)
    elif k == 'I':                                         # торт: нож режет
        n = int(.35 * SR); x = np.arange(n) / SR; put((rng.standard_normal(n) - lpv(rng.standard_normal(n), 1500)) * np.sin(np.pi * x / x[-1]) * .5, t0 + .15, .4); put(L('impact-light-soft'), t0 + .5, .4)
    elif k == 'J':                                         # плинко: звоночки по колышкам
        for j in range(int(d / .055)): put(sine(1800 + 400 * ((j * 7) % 5), .08, r=.03), t0 + j * .055, .18, (j % 3 - 1) * .3)
    elif k == 'K':                                         # бесконечный зум: восходящий тон
        n = int(d * SR); x = np.arange(n) / SR; put(np.sin(2 * np.pi * np.cumsum(220 * 2 ** (x * 2.5)) / SR) * np.minimum(1, x / .1) * .35, t0, .4)
    elif k == 'L':                                         # краска льётся
        n = int(d * SR); x = np.arange(n) / SR; put(lpv(rng.standard_normal(n), 900) * (1 + .5 * np.sin(x * 40)) * np.minimum(1, x / .05) * .9, t0, .4)
    elif k == 'M':                                         # кот: стакан падает и бьётся
        put(rs(L('swipe-fast-soft'), .8), t0 + .3, .3); put(L('impact-light-firm'), t0 + .5, .7)
        for j in range(6): put(sine(2600 + j * 500, .15, r=.05), t0 + .52 + j * .02, .25, (j - 3) * .2)
    elif k == 'N':                                         # яйцо шипит
        n = int(d * SR); x = np.arange(n) / SR; put((rng.standard_normal(n) - lpv(rng.standard_normal(n), 3000)) * (.6 + .4 * rng.random(n) ** 8) * .45, t0, .45); put(L('impact-light-soft'), t0 + .15, .4)
    elif k == 'O':                                         # блок-паркур: глухие прыжки
        for j in range(int(d / .23)): put(lpv(L('impact-light-firm'), 1200) * 1.5, t0 + j * .23, .45)
    elif k == 'P':                                         # логотип: бип при отскоке
        for j in range(2): put(sine(880, .1, r=.04), t0 + .12 + j * .2, .3, (j - .5) * .6)
    elif k == 'Q':
        for j in range(int(d / .1)): put(L('click-clip-soft'), t0 + j * .1, .2)
    elif k == 'R':                                         # сортировка: плинк шарика
        for j in range(int(d / .12)): put(sine(1046 * 2 ** ((j % 5) / 12 * 3), .15, r=.06), t0 + j * .12, .3)
    elif k == 'S':                                         # маркер скрипит по бумаге
        n = int(d * SR); x = np.arange(n) / SR; put(np.sin(2 * np.pi * np.cumsum(1400 + 200 * np.sin(x * 30)) / SR) * (rng.random(n) > .3) * .2, t0, .35)
    elif k == 'T':                                         # мойка ковра: струя воды
        n = int(d * SR); put(lpv(rng.standard_normal(n), 5000) * .8, t0, .5); put(lpv(rng.standard_normal(n), 300) * 1.5, t0, .3)
    elif k == 'W':                                         # мукбанг: чавк и хлюп лапши
        for j in range(int(d / .14)): n = int(.1 * SR); x = np.arange(n) / SR; put(lpv(rng.standard_normal(n), 1500 + 800 * (j % 2)) * np.sin(np.pi * x / x[-1]) * 1.5, t0 + j * .14, .5)
        n = int(.3 * SR); x = np.arange(n) / SR; put(np.sin(2 * np.pi * np.cumsum(600 + 1200 * x) / SR) * lpv(rng.standard_normal(n), 2500) * 3 * np.sin(np.pi * x / x[-1]), t0 + .05, .4)
    elif k == 'X':                                         # сплит: «голос» озвучки (роботичный слог) + игра
        for j in range(int(d / .11)): put(sine(np.full(int(.09 * SR), 180 + 40 * (j % 3)), .09, r=.08) * (np.sign(np.sin(np.arange(int(.09 * SR)) * .02)) * .3 + .7), t0 + j * .11, .3)
        put(sine(1568, .1, r=.05), t0 + .2, .2, .3)
for t0, cl in FEEDS:
    tt0 = t0
    for j, (k, d) in enumerate(cl):
        clip_sfx(k, tt0, d)
        if j > 0 or t0 > 0: put(L('swipe-fast-firm'), tt0 - .02, .55, .2)
        tt0 += d
clip_sfx('A', 40.6, 2.4 + 1.5)                                     # конец: паркур снова (идёт через стык)
# ---------- комната: тишина, часы, уведомления, пёс, таймлапс ----------
def ping(): a = sine(1320, .3, r=.08) * .6; return a + sine(1760, .3, r=.1)
for t0 in (10.4, 17.1, 18.1, 19.1, 26.4): put(ping(), t0, .4, .2); put(L('swipe-fast-soft'), t0 + .8, .4, .2)
n = int(1.4 * SR); x = np.arange(n) / SR; put((np.sin(2 * np.pi * 950 * x) * (x % .5 < .33)) * .25 * np.exp(-x * .3), 27.8, .5, .2)   # «номер не обслуживается» — три тона
for j, f in enumerate((913, 1428, 1776)): put(sine(f, .33, r=.5) * .5, 27.85 + j * .36, .35, .2)
n = int(.6 * SR); x = np.arange(n) / SR; whine = np.sin(2 * np.pi * np.cumsum(900 + 300 * np.sin(x * 6) - 400 * x) / SR) * np.sin(np.pi * x / x[-1]) * .3
put(lpv(whine, 2500), 4.8, .5, -.4)
tick = lambda: lpv(rng.standard_normal(int(.03 * SR)), 5000) * np.exp(-np.arange(int(.03 * SR)) / SR / .005)
for a, b in ((10.2, 11.8), (17, 21), (26.2, 30.4)):
    j = 0
    while a + j * .09 < b: put(tick(), a + j * .09, .2, .3, 'amb'); j += 1
    put(L('whoosh-slow-soft'), a, .35); put(L('whoosh-slow-soft'), b - .8, .3)
for x0 in (4.4, 10.2, 17.0, 26.2): put(L('whoosh-fast-soft'), x0 - .6, .4)          # отъезды
put(L('faller-1s-strong'), 30.35, .6); put(rs(L('faller-1s-soft'), .7), 30.5, .4)
hb = L('bsb-heartbeat-fast'); put(hb[:int(4.0 * SR)], 31.0, .8)
put(L('cinematic-thunder-big')[:int(2.5 * SR)], 32.6, .55); put(L('impact-deep-hard'), 32.62, .7)          # шок + трещина
n = int(4 * SR); x = np.arange(n) / SR; put((np.sin(2 * np.pi * 55 * x) + .6 * np.sin(2 * np.pi * 58.5 * x)) * np.minimum(1, x / 1.5) * .5, 31.0, .5, 0, 'amb')
for j in range(24): put(sine(1200 + j * 30, .05, r=.02), 35.5 + .8 * (1 - (1 - j / 24) ** .5), .25)                      # годы бегут
for j, t0 in enumerate((36.35, 36.9, 37.45, 38.0, 38.4)): put(L('impact-heavy-soft'), t0, .7 if j in (2, 4) else .45)   # урок
put(L('glitch-short') if 'glitch-short' in IDX else L('digital-corrupt'), 31.9, .45)                            # молодой → старый
put(L('phone-vibrate-table'), 39.0, .8); put(ping(), 39.05, .5)
put(L('whoosh-fast-medium'), 40.7, .45)
for a, b in FACE: n = int((b - a) * SR); x = np.arange(n) / SR; put(np.sin(2 * np.pi * 55 * x) * .5 * np.minimum(1, x / .1), a, .5, 0, 'amb')
hb2 = L('bsb-heartbeat-slow')
for t0 in (17.0, 26.2): put(hb2[:int(4 * SR)] * np.linspace(.2, 1, int(4 * SR))[:len(hb2[:int(4 * SR)])], t0, .45, 0, 'amb')
room = lpv(rng.standard_normal(NE), 200) * .04; put(room, 0, 1, 0, 'amb')
# музыка и звуки роликов слышны, только когда смотрим в ленту (z), в комнате — глухо и тихо; телефон сел — тишина
g = np.clip(ZE, 0, 1) ** 1.5; g[DEADM[:NE]] = 0
for b in ('mus',):
    muf = np.stack([lpv(bus[b][:, 0], 500), lpv(bus[b][:, 1], 500)], 1)
    bus[b] = bus[b] * g[:, None] + muf * (1 - g[:, None]) * .25 * (~DEADM[:NE])[:, None]
sfx_feed = bus['sfx'].copy()
# петля: хвост за концом — в начало (там тот же паркур)
for b in bus:
    tl = bus[b][N:].copy(); bus[b] = bus[b][:N].copy(); bus[b][:len(tl)] += tl
M = bus['mus'] * .8 + bus['sfx'] + bus['amb']; M /= np.abs(M).max() * 1.12
with wave.open(os.path.join(HERE, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((M * 32767).astype('<i2').tobytes())
print('ok')
