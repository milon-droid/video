#!/usr/bin/env python3
"""ГЛУБИНА — весь звук своим синтезом (numpy) + 3 CC0-звука (всплеск, пузыри, глухой удар).
python3 projects/glubina/audio/score.py  →  projects/glubina/audio/mix.wav (48 кГц, стерео)
Таймкоды — из story.js (SHOTS)."""
import numpy as np, wave, json, os
SR = 48000
DUR = 41.65 + 0.0
ROOT = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(ROOT, '../../../assets/sfx-library')
rng = np.random.default_rng(7)
N = int(SR * (DUR + 3))
L = np.zeros(N); R = np.zeros(N); RV = np.zeros(N)  # RV — посыл на реверб (моно)

def tt(d): return np.arange(int(SR * d)) / SR
def add(sig, t, g=1., pan=0., rev=0.):
    i = int(t * SR); sig = np.asarray(sig) * g
    if i >= N: return
    n = min(len(sig), N - i); s = sig[:n]
    L[i:i+n] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+n] += s * np.sqrt((1 + pan) / 2) * 1.414
    if rev: RV[i:i+n] += s * rev
def env(n, a, d, sus=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-np.maximum(0, t - a) / d)
def adsr(d, a, r):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, np.maximum(0, d - t) / max(r, 1e-4))
def white(d): return rng.standard_normal(int(SR * d))
def brown(d):
    x = np.cumsum(rng.standard_normal(int(SR * d))); x -= np.convolve(x, np.ones(2001) / 2001, 'same'); return x / (np.abs(x).max() + 1e-9)
def fftfilt(x, lo=0, hi=SR / 2, soft=.25):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo > 0: m *= np.clip((f - lo * (1 - soft)) / (lo * soft * 2 + 1e-9), 0, 1)
    if hi < SR / 2: m *= np.clip((hi * (1 + soft) - f) / (hi * soft * 2 + 1e-9), 0, 1)
    return np.fft.irfft(X * m, len(x))
def sweep(x, fc, bw=.6):  # полоса, центр которой меняется во времени: fc(t_array)
    W = 4096; H = 1024; win = np.hanning(W); out = np.zeros(len(x) + W); norm = np.zeros(len(x) + W)
    f = np.fft.rfftfreq(W, 1 / SR); xp = np.concatenate([x, np.zeros(W)])
    for i in range(0, len(x), H):
        c = fc(i / SR); m = np.exp(-0.5 * (np.log2((f + 1) / c) / bw) ** 2)
        out[i:i+W] += np.fft.irfft(np.fft.rfft(xp[i:i+W] * win) * m, W) * win; norm[i:i+W] += win ** 2
    return (out / np.maximum(norm, 1e-3))[:len(x)]
def saw(f, d, det=0.):
    t = tt(d); ph = np.cumsum(np.full(len(t), f) if np.isscalar(f) else f) / SR
    return 2 * (ph % 1) - 1
def sq(f, d, duty=.5):
    t = tt(d); ph = np.cumsum(np.full(len(t), f) if np.isscalar(f) else f) / SR; return np.where(ph % 1 < duty, 1., -1.)
def sine(f, d):
    ph = np.cumsum(np.full(int(SR * d), f) if np.isscalar(f) else f) / SR; return np.sin(2 * np.pi * ph)
def crush(x, bits=6, hold=4): y = np.round(x * 2 ** bits) / 2 ** bits; return np.repeat(y[::hold], hold)[:len(x)]
def lib(name, rate=1.):
    meta = {d['id']: d for d in json.load(open(os.path.join(LIB, 'index.json')))}[name]
    import subprocess
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', os.path.join(LIB, meta['file']), '-f', 'f32le', '-ac', '1', '-ar', str(int(SR / rate)), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)
def nt(n): return 440 * 2 ** ((n - 69) / 12)  # MIDI → Гц

E = lambda k: 4 * k ** 3 if k < .5 else 1 - (-2 * k + 2) ** 3 / 2
# ---------------- таймкоды ----------------
S = [0, 2.55, 6.25, 9.25, 12.45, 15.45, 19.25, 23.25, 25.85, 28.25, 32.65, 36.05, 41.65]
IMPACT = S[2] + .32

# ---------------- звуковые объекты ----------------
def twang(big=False):
    d = 1.4 if big else .8; t = tt(d); f0 = 760 if big else 980
    x = sum(np.sin(2 * np.pi * f0 * k * (1 - .04 * t) * t + k) * np.exp(-t * (5 + k * 2.5)) / (1 + i) for i, k in enumerate([1, 2.76, 5.4, 8.93]))
    x += white(d) * np.exp(-t * 60) * .8 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 9) * (1.4 if big else .6)
    return x * .5
def creak(d):
    t = tt(d); f = 95 + 25 * np.sin(t * 3.1) + 18 * np.cumsum(rng.standard_normal(len(t))) / np.sqrt(len(t)) * 40
    x = saw(np.abs(f), d) * (0.4 + .6 * np.abs(np.sin(t * 23 + np.sin(t * 7) * 3)))
    return fftfilt(x, 300, 1800) * adsr(d, .1, .2)
def boom(d=2.4):
    t = tt(d); f = 28 + 70 * np.exp(-t * 4); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    return x + fftfilt(white(d), 0, 220) * np.exp(-t * 3) * .9
def blip(f=1800, d=.03, bits=5):
    t = tt(d); return crush(sq(f, d) * np.exp(-t * 90), bits, 3) * .3
def knock(f=420):
    d = .35; t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (14 + k * 6)) for k in [1, 2.7, 5.2])
    return x * .4 + fftfilt(white(d), 0, 900) * np.exp(-t * 50) * .6
def heart():
    d = .5; t = tt(d); th = lambda o, g: np.sin(2 * np.pi * (52 - 10 * np.clip(t - o, 0, 1) * 8) * (t - o)) * np.exp(-np.maximum(0, t - o) * 18) * (t >= o) * g
    return th(0, 1) + th(.18, .7)
def step():
    d = .25; t = tt(d); return fftfilt(white(d), 0, 380) * np.exp(-t * 30) * .9 + np.sin(2 * np.pi * 62 * t) * np.exp(-t * 25) * .6
def chime(f=1318):
    d = 2.5; t = tt(d); return sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.5 + k)) / k for k in [1, 2.01, 3.03, 4.2]) * .25
def pad(notes, d, cutoff=900, det=.006, a=.6, r=1.):
    x = sum(saw(nt(n) * (1 + det * j), d) for n in notes for j in (-1, 0, 1)) / (3 * len(notes))
    return fftfilt(x, 30, cutoff) * adsr(d, a, r)
def pluck(n, d=.5, bits=None):
    t = tt(d); x = sq(nt(n), d, .25) * np.exp(-t * 7); x = crush(x, bits, 2) if bits else x
    return fftfilt(x, 0, 4000) * .35
def shriek(d=1.0):
    t = tt(d); f = 700 + 700 * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .5 + 120 * np.sin(2 * np.pi * 37 * t)
    x = np.tanh(3 * sine(f, d) + .6 * sine(f * 1.51, d)) * adsr(d, .03, .4) * .35
    g = saw(70 + 20 * np.sin(t * 30), d) * (0.5 + .5 * np.sin(2 * np.pi * 23 * t)) * adsr(d, .05, .5)
    return x + fftfilt(g, 0, 700) * .6 + fftfilt(white(d), 1500, 6000) * adsr(d, .01, .5) * .25
def buzz(d):
    t = tt(d); x = sum(np.sin(2 * np.pi * 100 * k * t) / k for k in range(1, 12, 2)); return np.tanh(x * 2) * .15 + fftfilt(white(d), 3000, 9000) * .04

# ================= РАССТАНОВКА =================
# Подводный фон (до выныривания), с провалом громкости в темноте
bed = fftfilt(brown(32.8) * .8 + white(32.8) * .02, 25, 420)
bt = tt(32.8); be = 0.55 + .25 * np.sin(bt * .4)
be *= np.interp(bt, [0, 6.5, 6.6, 11.3, 12, 32.5, 32.8], [1, 1, .6, .6, .35, .8, 0])
add(bed * be, 0, .35, rev=.0)

# --- 1. Трос (0–2.55)
add(creak(2.1), 0, .55, -.2, .2)
for i, s0 in enumerate([.25, .9, 2.0]):
    add(twang(i == 2), s0, .9 if i == 2 else .65, (-.3, .3, 0)[i], .35)
    p = lib('pop-medium-bubble'); [add(p, s0 + .05 + k * .06, .25, rng.uniform(-.5, .5)) for k in range(4)]
add(fftfilt(white(.6), 200, 3000) * env(int(SR * .6), .3, .15), 1.85, .25, rev=.3)  # вдох-рывок перед обрывом
# пульс-остинато: низкий бас 8-ми, ускоряется к обрыву
for k in range(14):
    tk = k * .18; add(fftfilt(saw(nt(28), .16), 0, 300 + k * 40) * adsr(.16, .005, .1), tk, .35)
# --- 2. Падение (2.55–6.25): свист потока, тикающий счётчик, медузы
dfall = IMPACT - S[1] + .05
rush = sweep(white(dfall), lambda x: 300 + 2400 * np.sin(np.pi * min(1, x / dfall)) ** 2, .8)
add(rush * adsr(dfall, .3, .05), S[1], .5, 0, .2)
add(pad([40, 47, 52], dfall, 1200, a=.5, r=.05), S[1], .35, 0, .3)
prev = 400
for i in range(int(3.6 * 60)):
    tl = i / 60; d = 400 + (10994 - 400) * E(min(1, tl / 3.6))
    if int(d / 250) != int(prev / 250): add(blip(1500 + d / 10), S[1] + tl, .35, .3)
    prev = d
for t0, pan in [(.3, -.6), (1.2, .6), (1.9, -.4), (2.5, .5)]: add(chime(1568 + 200 * pan), S[1] + t0 + .5, .18, pan, .6)
# --- 3. Удар о дно
add(boom(), IMPACT, 1.0, 0, .3)
add(lib('impact-deep-soft'), IMPACT, .7)
add(fftfilt(brown(3), 0, 200) * env(SR * 3, .05, 1.0), IMPACT, .6, 0, .2)
for k in range(8): add(blip(1100, .015, 4), S[2] + .7 + k / 30, .25)                    # 10,994 M
for k in range(26): add(blip(900, .012, 4), S[2] + 1.25 + k / 30 + (.25 if k > 10 else 0), .18)  # подпись
# --- 4. Фонарь: стук, треск, смерть
flick = [(0, 1), (.55, 1), (.62, .2), (.7, 1), (.95, .1), (1.0, .9), (1.3, .3), (1.36, .8), (1.62, 0), (1.75, .5), (1.8, 0), (2.05, .25), (2.1, 0), (3.2, 0)]
for (a, v), (b, _) in zip(flick, flick[1:]):
    if v > 0: add(buzz(b - a) * v, S[3] + a, .45, .1)
    add(fftfilt(white(.03), 2000, 9000) * np.exp(-tt(.03) * 120), S[3] + a, .3, .1)
for k in range(4, 12):
    tk = k / 7
    if .45 < tk < 1.7 and k % 2: add(knock(380), S[3] + tk, .6, .1, .2)
t = tt(.6); add(np.sin(2 * np.pi * np.cumsum(600 * np.exp(-t * 6) + 50) / SR) * adsr(.6, .01, .3) * .3, S[3] + 2.1)  # выключение
add(blip(660, .25, 4) * 1.5, S[3] + 2.2, .3)
for k in range(9): add(heart(), S[3] + 2.3 + k * (.95 - k * .03), .8)                      # сердце в темноте
# --- 5–8. Огонёк: тёплое гудение, ближе — громче
lt0 = S[4] + .15; lt1 = S[8] + .35; ld = lt1 - lt0; t = tt(ld)
hum = (sine(196 * (1 + .004 * np.sin(t * 5)), ld) + .6 * sine(293.7, ld) + .25 * sine(392 * (1 + .003 * np.sin(t * 3)), ld)) * (0.7 + .3 * np.sin(t * 2.2))
he = np.interp(t, [0, .6, 1.5, S[5] - lt0, S[6] - lt0, S[7] - lt0, S[8] - lt0, ld], [0, .25, .3, .4, .6, .8, 1, 0])
add(hum * he, lt0, .22, .2, .4)
add(chime(1760), S[4] + .2, .25, .3, .7)
add(chime(1318), S[4] + 1.55, .2, .2, .7)
for i in range(13):  # шаги в иле
    tc = (i * np.pi + np.pi / 2) / 5.4
    if tc < 3.8: add(step(), S[5] + tc, .75, -.2 + (i % 2) * .2)
for k in range(2):  # дыхание в шлеме
    tb = S[5] + .3 + k * 1.8; add(fftfilt(white(1.4), 300, 2500) * np.sin(np.pi * tt(1.4) / 1.4) ** 2, tb, .1)
# нарастающий гул пасти + сердце
dr = S[8] - S[6]; t = tt(dr)
add(pad([28, 29, 35], dr, 260, det=.01, a=dr * .8, r=.1) * 1.4, S[6], .55, 0, .3)
add(fftfilt(saw(55 + 3 * np.sin(t * 2), dr), 0, 160) * np.interp(t, [0, dr * .5, dr], [0, .2, .5]) * (0.5 + .5 * np.sin(t * 13)), S[6], .4)
add(sweep(white(.9), lambda x: 200 + 300 * x, .5) * adsr(.9, .3, .3), S[7] + .45, .35, .3)  # глаз открывается — влажный скрип
add(pad([52, 53, 58, 64, 65], 1.6, 2400, det=.012, a=.01, r=1.2), S[7] + 1.5, .7, 0, .5)    # стинг на лицо
add(boom(1.4), S[7] + 1.5, .35)
for k in range(5): add(heart(), S[7] + 1.6 + k * .42, .7)
# --- 9. Вспышка
ON = S[8] + .32
add(knock(260), ON - .03, 1.0, -.2, .3); add(lib('impact-heavy-hard'), ON - .03, .6)
add(fftfilt(white(.5), 2500, 12000) * env(SR // 2, .005, .08), ON, .6, 0, .3)
add(sweep(white(.8), lambda x: 600 + 5000 * x, .7) * env(int(SR * .8), .01, .3), ON, .5, 0, .3)
add(shriek(1.1), S[8] + .45, .8, .3, .4)
p = lib('pop-large-bubble'); [add(p, S[8] + .55 + k * .05, .25, rng.uniform(-.6, .6), .2) for k in range(10)]
# --- 10. Подъём: драйв
d10 = S[10] - S[9] + .15; t = tt(d10)
add(sweep(white(d10), lambda x: 400 + 3000 * (x / d10) ** 1.5, .9) * adsr(d10, .2, .1), S[9], .5, 0, .2)
bpm = 150; st = 60 / bpm / 2; seq = [40, 40, 47, 40, 43, 40, 47, 45]
for k in range(int(4.35 / st)):
    tk = S[9] + k * st; n = seq[k % 8] + (5 if k >= 16 else 0) + (7 if k >= 24 else 0)
    add(fftfilt(saw(nt(n - 12), st * .9), 0, 500 + k * 25) * adsr(st * .9, .005, .08), tk, .4)
    if k % 2 == 0: add(pluck(n + 24, .2, 5), tk, .14, .4 if k % 4 else -.4, .2)
    if k % 4 == 0: add(np.sin(2 * np.pi * 50 * tt(.18)) * np.exp(-tt(.18) * 20), tk, .6)  # бочка
prev = 10994
for i in range(int(4.2 * 60)):
    tl = i / 60; d = 10994 * (1 - E(min(1, tl / 4.2)))
    if int(d / 300) != int(prev / 300): add(blip(800 + d / 8), S[9] + tl, .25, -.3)
    prev = d
for k in range(8): add(fftfilt(white(.12), 200, 1200) * env(int(SR * .12), .01, .05), S[9] + k * .55 + .1, .2, .4)  # хвост бьёт
# --- 11. Выныривание
BR = S[10] + .15
sp = lib('props-splash')
add(sp, BR, 1.0, 0, .2); add(lib('props-splash', .7), BR + .02, .8, -.3); add(fftfilt(white(1.2), 300, 8000) * env(int(SR * 1.2), .005, .25), BR, .5, .2)
add(sp, S[10] + 1.15, .8, -.2); add(lib('props-splash', .8), S[10] + 1.55, .7, .4)
waves_d = DUR + 3 - S[10]; t = tt(waves_d)
wv = fftfilt(brown(waves_d), 120, 1800) * (0.55 + .45 * np.sin(2 * np.pi * t / 3.2) ** 2)
add(wv * np.minimum(1, t / .2), S[10], 1.4, 0)
add(fftfilt(white(waves_d), 2000, 7000) * .03 * (0.5 + .5 * np.sin(t * 1.3)), S[10], 1.0)
add(pad([52, 56, 59, 64], 3.3, 2200, a=.05, r=1.6), BR, .45, 0, .4)                      # облегчение: ми мажор
for k, n in enumerate([64, 68, 71, 76]): add(pluck(n, .6), S[10] + 1.8 + k * .09, .3, -.2 + k * .15, .4)
add(fftfilt(white(.7), 300, 3000) * np.sin(np.pi * tt(.7) / .7), S[10] + 1.3, .3)            # жадный вдох
# --- 12. Финал: мигание и ответ из глубины
def lureblip(f1, f2, g=1.): return np.concatenate([sine(f1, .12) * adsr(.12, .005, .06), np.zeros(int(SR * .08)), sine(f2, .14) * adsr(.14, .005, .08)]) * g
add(lureblip(660, 880), S[11] + .5, .35, .2, .3)
add(lureblip(660, 880), S[11] + .9, .3, .2, .3)
dd = S[12] - S[11] - .9; add(pad([28, 35], dd + 1, 300, a=2, r=.6), S[11] + .9, .5, 0, .3)  # темнота снова
add(lureblip(330, 440), S[11] + 2.7, .4, 0, .9); add(lureblip(330, 440), S[11] + 3.1, .4, 0, .9)
pent = [57, 59, 62, 64, 66, 69, 71, 74]
for i in range(1, 46):
    t0 = 3.3 + i * .08 if i < 7 else 3.8 + ((i * .618) % 1) * .7
    add(sine(nt(pent[i % 8] - 12), .25) * adsr(.25, .01, .2), S[11] + t0, .12, rng.uniform(-.8, .8), .8)
add(boom(2.5), S[11] + 4.0, .8, 0, .4)
add(pad([40, 41, 46, 52], 1.6, 900, det=.015, a=.02, r=1.3), S[11] + 4.0, .55, 0, .6)
add(np.sin(2 * np.pi * 40 * tt(1.5)) * np.exp(-tt(1.5) * 3), S[11] + 5.15, .9, 0, .4)        # все огни гаснут

# ---------------- реверб и сведение ----------------
ir_n = int(SR * 2.6); ti = np.arange(ir_n) / SR
irL = rng.standard_normal(ir_n) * np.exp(-ti * 2.4); irR = rng.standard_normal(ir_n) * np.exp(-ti * 2.4)
irL = fftfilt(irL, 0, 5000); irR = fftfilt(irR, 0, 5000)
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h)))); return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[:len(x)]
wetL = conv(RV, irL) * .05; wetR = conv(RV, irR) * .05
mix = np.stack([L + wetL, R + wetR], 1)[:int(SR * DUR)]
mix /= np.abs(mix).max() / .9
out = os.path.join(ROOT, 'mix.wav'); w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print('ok', out, round(DUR, 2))
