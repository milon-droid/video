#!/usr/bin/env python3
"""Knock Knock — звук: «песня про луну» (гитара Карплус–Стронг), стуки, дождь, шаги, голоса. → mix.wav"""
import json, subprocess, os, wave, numpy as np
SR = 48000; DUR = 49.6; N = int(SR * DUR); NE = N + 6 * SR
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
LIB = os.path.join(ROOT, 'assets/sfx-library'); IDX = {e['id']: e for e in json.load(open(os.path.join(LIB, 'index.json')))}
SF = os.path.join(HERE, '../assets/sfx'); rng = np.random.default_rng(5)
bus = {k: np.zeros((NE, 2)) for k in ('mus', 'sfx', 'amb')}
def dec(f, a=0, b=None, norm=True):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).astype(float)
    x = x[int(a * SR):int(b * SR) if b else None]
    if norm: x /= np.abs(x).max() + 1e-9
    n = min(len(x), int(.03 * SR)); x[-n:] *= np.linspace(1, 0, n); return x
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
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(m, dur=1.6, g=1., bright=.5, det=0.):
    P = int(SR / (mtof(m) * (1 + det))); n = int(SR * dur); y = np.zeros(n + P)
    y[:P] = lpv(rng.uniform(-1, 1, P), 2000 + 6000 * bright) if P > 20 else rng.uniform(-1, 1, P)
    d = .996 if m < 60 else .993
    for s in range(P, n + P, P):
        prev = y[s - P:s]; nxt = d * .5 * (prev + np.roll(prev, 1)); y[s:s + P] = nxt[:len(y[s:s + P])]
    return y[P:] * g * np.minimum(1, np.arange(n) / (SR * .002))
CH = {'G': [43, 50, 55, 59, 62, 67], 'Em': [40, 47, 52, 55, 59, 64], 'C': [48, 52, 55, 60, 64], 'D': [50, 57, 62, 66, 69]}
MOON = [(71, 1), (74, 1), (76, 2), (74, 1), (71, 1), (69, 2), (67, 1), (69, 1), (71, 1.5), (69, .5), (67, 4)]    # «песня про луну»
def strum(ch, t, g=.5, down=True, bright=.45, out=0.):
    ns = CH[ch] if down else CH[ch][::-1]
    for j, m in enumerate(ns): put(pluck(m + (out * (j % 2)), 1.8, 1, bright, det=out * .01), t + j * .012, g * (.8 + .2 * (j == 0)), (j - 2.5) * .08, 'mus')
def song(t0, beat, g=.45, prog='G Em C D', reps=1, mel=True, out=0.):
    t = t0
    for _ in range(reps):
        for ch in prog.split():
            for k in range(4): strum(ch, t + k * beat, g * (1 if k == 0 else .55), k % 2 == 0, out=out)
            t += 4 * beat
    if mel:
        tm = t0
        for m, b in MOON * reps:
            if tm > t: break
            put(pluck(m, 1.5, 1, .7), tm, g * .9, .15, 'mus'); tm += b * beat
    return t
muff = lambda x: lpv(x, 450) * 1.6
# 1) через пол — глухое неумелое бренчание (в начале и в конце петли)
def muffled(t0, t1):
    tmp = {k: v.copy() for k, v in bus.items()}; bus['mus'][:] = 0
    t = t0
    while t < t1: strum(['G', 'C', 'D', 'Em'][int(t * 2) % 4], t, .5, out=.6); t += .45
    seg = bus['mus'].copy(); bus['mus'][:] = tmp['mus']
    bus['mus'][:, 0] += muff(seg[:, 0]); bus['mus'][:, 1] += muff(seg[:, 1])
muffled(DUR - 1.4, DUR + 2.6)
# 2) Лео играет (чисто, но с кривой нотой), отвечает на стук, джем, песня про луну
t = 2.7
while t < 6.5: strum(['G', 'C'][int(t * 2) % 2], t, .35, out=.3 if int(t * 3) % 5 == 0 else 0); t += .5
for tt in (9.7, 10.1, 10.3): strum('G', tt, .55)
song(11.0, BEAT := .6, .4)
song(20.0, .55, .35, 'G Em', 1, True)
song(27.0, .45, .28, 'C G', 1, False)
tm = song(32.5, .53, .45, 'G Em C D', 1, True); song(tm, .53, .42, 'G Em C D', 1, True)
song(41.0, .75, .3, 'G Em', 1, True)
for i in range(12): put(pluck(84 + [0, 4, 7, 12][i % 4], 1.4, 1, .9), 32.6 + i * .7, .12, .4, 'mus')        # колокольчики лет
for m in (55, 59, 62, 67): put(pluck(m, 3, 1, .3), 47.9, .2, 0, 'mus')
# ---------- стуки ----------
k1, k2 = F('knocking-on-wood-a3d8e7.mp3', 3.15, 3.38), F('knocking-on-wood-a3d8e7.mp3', 4.7, 4.92)
KU = [.35, .95, 1.55, 8.6, 9.0, 9.2, 24.6, 24.9]
for i, k in enumerate(KU):
    camf2 = 3.0 < k < 8.0 or k > 20                                     # слышим снизу — глуше
    x = (k1 if i % 2 else k2); put(lpv(x, 900) * 1.4 if camf2 else x, k - .01, .9, .1)
for k in (43.0, 43.25): put(lpv(k1, 900) * 1.4, k - .01, .9, .1)
for k in (6.8, 7.0, 48.0, 48.2): put(rs(k2, .9), k - .01, .85, -.1)
for i in range(8): put(lpv(k1, 1500), 11.0 + i * 1.2, .35, .2)          # швабра отбивает ритм в джеме
# ---------- прочее ----------
PR = lambda: F('paper-rustle-910aa4.mp3')
for tt in (16.0, 17.9, 21.5, 22.3, 23.5): put(PR(), tt - .25, .45, .3)
put(L('writing-pencil-draw'), 21.55, .45, .2)
steps = F('footsteps-wooden-stairs-3-ac0a94.mp3', .1, 2.4); put(steps, 26.6, .55, -.2); put(rs(steps, 1.1), 26.9, .45, .2)
put(L('impact-light-firm'), 31.8, .4, 0); put(rs(L('impact-light-firm'), 1.6), 31.83, .35, 0)       # чокнулись кружками
put(L('impact-light-soft'), 32.6, .4, -.2)                                                          # коробка
put(F('baby-giggle-b38737.mp3', .2, 1.6), 35.6, .45, .2)
for i in range(7): put(L('click-clip-soft'), 32.5 + i * (8.5 / 6), .4, 0)
tick = lambda hi: lpv(rng.standard_normal(int(.04 * SR)), 5000) * np.exp(-np.arange(int(.04 * SR)) / SR / .006)
for i in range(int(8.5 / .5)): put(tick(i % 2), 32.5 + i * .5, .25, .3, 'amb')
# дождь ночью (через стык — ровный фон)
rainx = F('rain-hitting-window-2-0bbfcb.mp3'); rain = np.tile(rainx, 4)[:NE]
tt = np.arange(NE) / SR; renv = np.clip(1 - np.clip((tt - 26.0) / .8, 0, 1) + np.clip((tt - 40.6) / .8, 0, 1), 0, 1)
renv[N:] = 1; put(rain * renv * .18, 0, 1, 0, 'amb')
put(lpv(rng.standard_normal(NE), 300) * .03, 0, 1, 0, 'amb')
# ---------- петля и голос ----------
for b in bus:
    tl = bus[b][N:].copy(); bus[b] = bus[b][:N].copy()
    if b in ('amb', 'mus'): bus[b][:len(tl)] += tl          # глухая гитара снизу и дождь переходят через стык (это одна и та же сцена)
VO = json.load(open(os.path.join(HERE, 'vo_times.json')))
vo = np.zeros((N, 2)); act = np.zeros(N)
for vid, t0 in VO.items():
    f = os.path.join(HERE, '../assets/vo', vid + '.wav')
    if not os.path.exists(f): continue
    x = dec(f); x = x - lpv(x, 90) * .9; i = int(t0 * SR); x = x[:N - i]
    vo[i:i + len(x)] += x[:, None]; act[i:i + len(x)] = 1
duck = 1 - .75 * np.clip(lpv(act, 4) * 1.6, 0, 1)
for b, k in (('mus', 1), ('amb', .6), ('sfx', .5)): bus[b] *= (1 - (1 - duck) * k)[:, None]
bg = bus['mus'] * .9 + bus['sfx'] + bus['amb']
for vid, t0 in VO.items():
    i, j = int(t0 * SR), int((t0 + 1.0) * SR); r = lambda a: 20 * np.log10(np.sqrt(np.mean(a[i:j] ** 2)) + 1e-9)
    print(vid, 'голос−фон', round(r(vo) - r(bg), 1))
M = bg + vo; M /= np.abs(M).max() * 1.12
with wave.open(os.path.join(HERE, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((M * 32767).astype('<i2').tobytes())
print('ok')
