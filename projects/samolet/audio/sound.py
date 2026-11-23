#!/usr/bin/env python3
"""HELLO, FUTURE ME — звук: синтез гитары (Карплус–Стронг) + свист мелодии, SFX сценок, голоса. → mix.wav"""
import json, subprocess, os, wave, numpy as np
SR = 48000
def herm(keys, t):
    for i in range(1, len(keys)):
        if t <= keys[i][0]:
            t0, x0, v0 = keys[i - 1]; t1, x1, v1 = keys[i]; h = t1 - t0; u = (t - t0) / h
            return (2 * u**3 - 3 * u**2 + 1) * x0 + (u**3 - 2 * u**2 + u) * h * v0 + (-2 * u**3 + 3 * u**2) * x1 + (u**3 - u**2) * h * v1
    return keys[-1][1]
FX = [[5.62, 790, 1200], [6.8, 1650, 450], [29.8, 11000, 400], [31.0, 11560, 0]]
HEART_T = 6.8
while herm(FX, HEART_T) < 5300: HEART_T += .002
HOLDS = [(0, 2.2), (3.2, 1.6), (35.0, 6.0)]
HR = [s0 + sum(l for _, l in HOLDS[:i]) for i, (s0, _) in enumerate(HOLDS)]     # начало паузы во времени ролика
DUR = 46 + sum(h[1] for h in HOLDS); N = int(SR * DUR); NE = N + 12 * SR
REAL = lambda t: t + sum(l for s0, l in HOLDS if t > s0 + 1e-6)   # время сюжета → время ролика
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
LIB = os.path.join(ROOT, 'assets/sfx-library'); IDX = {e['id']: e for e in json.load(open(os.path.join(LIB, 'index.json')))}
SF = os.path.join(HERE, '../assets/sfx'); rng = np.random.default_rng(3)
bus = {k: np.zeros((NE, 2)) for k in ('mus', 'sfx', 'amb')}
def dec(f, a=0, b=None):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).astype(float)
    x = x[int(a * SR):int(b * SR) if b else None]; x /= np.abs(x).max() + 1e-9
    n = min(len(x), int(.05 * SR)); x[-n:] *= np.linspace(1, 0, n); x[:n // 5] *= np.linspace(0, 1, n // 5); return x
L = lambda i, a=0, b=None: dec(os.path.join(LIB, IDX[i]['file']), a, b)
F = lambda f, a=0, b=None: dec(os.path.join(SF, f), a, b)
def put(x, t, g=1., pan=0., b='sfx', real=False):
    i = int((t if real else REAL(t)) * SR); x = np.asarray(x)
    if i < 0: x = x[-i:]; i = 0
    if i >= NE: return
    x = x[:NE - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[b][i:i + len(x), 0] += x * g * l * 1.41; bus[b][i:i + len(x), 1] += x * g * r * 1.41
def rs(x, k): n = int(len(x) / k); return np.interp(np.arange(n) * k, np.arange(len(x)), x)
def lpv(x, fc): k = max(1, int(SR / fc / 2)); w = np.hanning(2 * k + 1); w /= w.sum(); return np.convolve(x, w, 'same')
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- гитара: Карплус–Стронг блоками ----------
def pluck(m, dur=1.6, g=1., bright=.5):
    P = int(SR / mtof(m)); n = int(SR * dur); y = np.zeros(n + P)
    y[:P] = lpv(rng.uniform(-1, 1, P), 2000 + 6000 * bright) if P > 20 else rng.uniform(-1, 1, P)
    d = .996 if m < 60 else .993
    for s in range(P, n + P, P):
        prev = y[s - P:s]; nxt = d * .5 * (prev + np.roll(prev, 1)); y[s:s + P] = nxt[:len(y[s:s + P])]
    y = y[P:]; return y * g * np.minimum(1, np.arange(n) / (SR * .002))
CH = {'C': [48, 55, 60, 64, 67], 'G': [43, 50, 55, 59, 62], 'Am': [45, 52, 57, 60, 64], 'F': [41, 48, 53, 57, 60], 'Em': [40, 47, 52, 55, 59], 'Dm': [50, 57, 62, 65]}
def arp(ch, t0, bar, g=.5, pan=0):
    notes = CH[ch]; pat = [0, 2, 3, 4, 3, 2, 1, 3]
    for i, k in enumerate(pat): put(pluck(notes[k % len(notes)], 1.4, 1, .4), t0 + i * bar / 8, g * (1 if i == 0 else .7), pan + (k - 2) * .1, 'mus')
def whistle(seq, t0, beat, g=.25):          # seq: [(midi|None, beats)]
    t = t0
    for m, b in seq:
        if m is not None:
            n = int(SR * b * beat * .95); tt = np.arange(n) / SR; f = mtof(m + 12) * (1 + .006 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt / .2))
            y = np.sin(2 * np.pi * np.cumsum(f) / SR) + .08 * rng.standard_normal(n); env = np.minimum(1, tt / .04) * np.minimum(1, (tt[-1] - tt) / .06 + .01)
            put(lpv(y, 5000) * env, t, g, .1, 'mus')
        t += b * beat
BEAT = .6; BAR = 4 * BEAT
PROG = ['C', 'G', 'Am', 'F'] * 3 + ['F', 'G', 'C']
MEL = [[(64, 1), (67, 1), (69, 1), (67, 1)], [(62, 2), (59, 2)], [(60, 1), (64, 1), (62, 1), (60, 1)], [(57, 3), (None, 1)],
       [(64, 1), (67, 1), (72, 1.5), (71, .5)], [(69, 2), (67, 2)], [(65, 1), (64, 1), (62, 1), (60, 1)], [(62, 4)]]
T0 = 5.62
for i, ch in enumerate(PROG):
    tb = T0 + i * BAR
    if tb > 31.2: break
    night = 13 < i * BAR + T0 - 5 < 17
    arp(ch, tb, BAR, .32 if night else .42)
    if i >= 1 and not night: whistle(MEL[(i - 1) % 8], tb, BEAT, .2)
for k, ch in enumerate(['Am', 'F', 'C', 'G']):                                          # скамейка — тихо, медленно
    for j, m in enumerate(CH[ch][1:4]): put(pluck(m, 2.2, 1, .25), 31.4 + k * 1.3 + j * .25, .3, (j - 1) * .2, 'mus')
put(pluck(48, 3, 1, .3), 38.75, .4, 0, 'mus'); put(pluck(64, 3, 1, .3), 38.8, .3, 0, 'mus')
# зимой — колокольчики
for i in range(10): put(pluck(84 + [0, 3, 7, 12][i % 4], 1.2, 1, .9), 27.0 + i * .6, .12, .4, 'mus')
# перемотка: музыка полёта задом наперёд с ускорением
seg = bus['mus'][int(8 * SR):int(30 * SR), 0].copy()[::-1]
T = 43.8 - 39.1; n = int(SR * T); u = np.arange(n) / n; pos = np.cumsum(.9 + 5 * np.sin(np.pi * u) ** 2); pos = pos / pos[-1] * (len(seg) - 1)
put(np.interp(pos, np.arange(len(seg)), seg) * np.minimum(1, u * 8) * np.minimum(1, (1 - u) * 6), 39.1, .6, 0, 'mus')
put(L('bsb-cassette-rewind')[:n], 39.1, .35)

# ---------- где самолётик проходит кварталы (та же формула, что в story.js) ----------
def herm(keys, t):
    for i in range(1, len(keys)):
        if t <= keys[i][0]:
            t0, x0, v0 = keys[i - 1]; t1, x1, v1 = keys[i]; h = t1 - t0; u = (t - t0) / h
            return (2 * u**3 - 3 * u**2 + 1) * x0 + (u**3 - 2 * u**2 + u) * h * v0 + (-2 * u**3 + 3 * u**2) * x1 + (u**3 - u**2) * h * v1
    return keys[-1][1]
RX = [[38.8, 11380, -900], [39.8, 10400, -2400], [43.5, 2500, -2000], [44.5, 1700, -540]]
TS = np.arange(5.62, 31.0, .005); XS = np.array([herm(FX, t) for t in TS])
def when(x): return float(TS[np.argmin(np.abs(XS - x))])
TR = np.arange(38.8, 44.5, .005); XR = np.array([herm(RX, t) for t in TR])
def whenR(x): return float(TR[np.argmin(np.abs(XR - x))])
BL = [(1500, 1500), (3000, 1500), (4500, 1600), (6100, 1500), (7600, 1600), (9200, 1500)]
P = lambda b, p: when(BL[b][0] + p * BL[b][1])
# ---------- SFX ----------
PR = lambda: F('paper-rustle-910aa4.mp3')
# класс: самолётик садится, лист, карандаш, бросок
put(L('whoosh-slow-soft'), DUR - 1.3, .3, .3, real=True)   # снаружи в конце: влетает в окно
for tt, g in [(.72, .55), (3.15, .5), (4.55, .55)]: put(PR(), tt - .28, g, -.1)
put(L('writing-pencil-draw'), 3.55, .55, .1); put(rs(L('writing-pencil-draw'), 1.1), 4.1, .45, .15)
put(L('whoosh-fast-medium'), 5.5, .55, .3)
# кварталы
put(F('guitar-strum-4197b3.mp3', 0, 3.2) * np.linspace(1, 0, int(3.2 * SR)) ** .5, P(0, .3), .45, .2)
put(L('whoosh-fast-soft'), P(1, .3), .4, 0); put(L('celebration-applause-small'), P(1, .35), .35, .2)
put(F('baby-giggle-b38737.mp3', .1, 2.2), P(3, .55) - .5, .55, .1)
put(F('bicycle-bell-c6-c6e543.mp3'), P(4, .25), .45, .2); put(F('bicycle-bell-c6-c6e543.mp3'), P(4, .6), .45, .3)
put(L('celebration-applause-small'), P(4, .45), .25, .2)
put(F('candle-blow-b16be1.mp3', 1.0, 2.6), P(5, .47) - .34, .7, 0); put(L('celebration-applause-small'), P(5, .52), .45, 0)
# скамейка
put(L('whoosh-slow-soft'), 30.4, .35); put(L('impact-light-soft'), 31.0, .3)
for tt in (31.5, 36.3, 37.8): put(PR(), tt - .28, .5, 0)
put(L('whoosh-fast-medium'), 38.65, .55, -.3)
for x in (9950, 8400, 6850, 5300, 3750, 2250): put(rs(L('whoosh-fast-soft'), 1.1), whenR(x) - .1, .3, -.2)
# фон: птицы и тихая комната на стыке (фон переходит через стык — он ровный); на улице — ветер, зимой — снег
birds = F('birds-chirping-01-down-small-park-lane-71d69c.mp3')
amb = np.zeros(NE); seg = birds[:int(9 * SR)]
for st in (DUR - 3.0, -3.0 + 0):                                     # класс в конце и в начале — одна и та же запись через стык
    pass
i0 = int((DUR - 2.5) * SR); x = np.concatenate([birds, birds])[:int(9.5 * SR)]; amb[i0:i0 + len(x)] += x
env = np.ones(NE); tt = np.arange(NE) / SR
env *= np.where(tt < DUR - 2.5, 0, 1) * 1
amb *= np.clip((tt - (DUR - 2.5)) / .8, 0, 1)
tail = tt - DUR; amb *= np.where(tt >= DUR, np.clip((7.0 - tail) / 1.2, 0, 1), 1)   # к началу полёта (6–7 с) птицы стихают
put(amb, 0, .22, 0, 'amb')
room = lpv(rng.standard_normal(NE), 400) * .5; put(room, 0, .05, 0, 'amb')
wind = lpv(rng.standard_normal(int(25 * SR)), 900) * np.sin(np.linspace(0, np.pi, int(25 * SR))) ** 2
put(wind, 6.0, .08, 0, 'amb')
snow = L('bsb-wind-foley')[:int(8 * SR)]; put(snow * np.sin(np.linspace(0, np.pi, len(snow))), 28.5, .12, 0, 'amb')

# паузы: мальчик понимает (H1), старик отвечает (H2) — время ролика
H1, H2 = HR[1], HR[2]
for j, m in enumerate([72, 76, 79, 84]): put(pluck(m, 1.6, 1, .8), H1 + .75 + j * .07, .2, .2, 'mus', real=True)
def echo(x, d=.18, k=.4, n=4):
    y = np.zeros(len(x) + int(d * SR * n))
    for i in range(n): y[int(i * d * SR):int(i * d * SR) + len(x)] += x * k ** i
    return lpv(y, 3500)
for i, snd in enumerate([L('celebration-applause-small', 0, .9), L('celebration-applause-big', 0, 1.0), F('baby-giggle-b38737.mp3', .3, 1.3), F('bicycle-bell-c6-c6e543.mp3')]):
    tf = H2 + 3.0 + [1, 3, 4, 6][i] * .33; put(L('click-clip-soft'), tf, .5, 0, real=True); put(echo(snd), tf + .03, .18, (i - 1.5) * .3, real=True)
for j, m in enumerate([48, 55, 60, 64, 67, 72]): put(pluck(m, 3.5, 1, .3), H2 + 3.0 + j * .06, .22, (j - 2.5) * .15, 'mus', real=True)
for j, m in enumerate([45, 52, 57, 60, 64, 69]): put(pluck(m, 4.0, 1, .25), H2 + 6.0 + j * .09, .2, (j - 2.5) * .15, 'mus', real=True)   # «Better.»
for i in range(8): put(L('click-clip-soft'), H2 + 3.0 + i * .33, .45, 0, real=True)                                                 # 8 карточек
# класс изнутри: самолётик влетает в окно (шелест полёта), садится на парту; соседка пишет
put(rs(L('whoosh-slow-soft'), .8), .1, .35, .4, real=True); put(L('whoosh-fast-soft'), 1.3, .3, 0, real=True); put(L('impact-light-soft'), 2.0, .45, -.2, real=True)
put(L('writing-pencil-draw'), .1, .2, .3, real=True); put(L('writing-pencil-draw'), 1.6, .15, .3, real=True)
# свадьба: обычные аплодисменты, когда самолётик рисует сердце (музыка не прерывается)
HS = 6.8
while herm(FX, HS) < 4826: HS += .002
put(L('celebration-applause-big')[:int(3.5 * SR)] * np.linspace(1, 0, int(3.5 * SR)), HS + .8, .35, .1)
put(L('writing-pencil-draw'), 36.6, .45, -.1); put(L('writing-pencil-draw'), 37.2, .4, -.1)
# ---------- голос ----------
VO = {'k1': REAL(1.35), 'k1b': H1 + .7, 'k2a': REAL(3.7), 'k2': REAL(5.95), 'o1': REAL(31.25), 'r1': H2 + .05, 'r2': H2 + 2.4, 'r3': H2 + 6.0, 'o3': REAL(37.3)}   # время ролика
for b in bus:                                            # петля: через стык переходит только ровный фон
    tl = bus[b][N:].copy(); bus[b] = bus[b][:N].copy()
    if b == 'amb': bus[b][:len(tl)] += tl
    else: bus[b][-int(.3 * SR):] *= np.linspace(1, 0, int(.3 * SR))[:, None]
vo = np.zeros((N, 2)); act = np.zeros(N)
for vid, t0 in VO.items():
    f = os.path.join(HERE, '../assets/vo', vid + '.wav')
    if not os.path.exists(f): continue
    x = dec(f); x = x - lpv(x, 90) * .9; i = int(t0 * SR); x = x[:N - i]
    vo[i:i + len(x)] += x[:, None]; act[i:i + len(x)] = 1
duck = 1 - .8 * np.clip(lpv(act, 4) * 1.6, 0, 1)
for b, k in (('mus', 1), ('amb', .6), ('sfx', .7)): bus[b] *= (1 - (1 - duck) * k)[:, None]
bg = bus['mus'] * .9 + bus['sfx'] + bus['amb']
for vid, t0 in VO.items():
    i, j = int(t0 * SR), int((t0 + 1.0) * SR); r = lambda a: 20 * np.log10(np.sqrt(np.mean(a[i:j] ** 2)) + 1e-9)
    print(vid, 'голос−фон', round(r(vo) - r(bg), 1))
M = bg + vo; M /= np.abs(M).max() * 1.12
with wave.open(os.path.join(HERE, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((M * 32767).astype('<i2').tobytes())
print('ok')
