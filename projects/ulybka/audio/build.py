#!/usr/bin/env python3
"""«SMILE»: вся звуковая дорожка — свой регтайм (страйд-пианино + кларнет), который ломается: скрип пластинки, минор вдвое медленнее,
плывущая лента, музыкальная шкатулка; треск проектора, мультяшные шумы, скримеры, голоса с «радио» 30-х.  → mix.wav"""
import json, subprocess, os, re
import numpy as np
R = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(HERE); LIB = os.path.join(PRJ, '../../assets/sfx-library')
rng = np.random.default_rng(3)
D = json.load(open(os.path.join(PRJ, 'vo/durations.json')))
src = open(os.path.join(PRJ, 'src/main.js')).read(); blk = src[src.index('const SHOTS = ['):src.index('];', src.index('const SHOTS = ['))]
SH, VO, T = {}, [], 0
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\](?:, lead: ([\d.]+))?(?:, tail: ([\d.]+))?, min: ([\d.]+)", blk):
    i, ls, lead, tail, mn = m.groups(); ls = re.findall(r"'(\w+)'", ls); t = float(lead or 0); v = []
    for k, l in enumerate(ls):
        if k: t += .3
        VO.append((l, T + t)); v.append(t); t += D[l]
    d = max(float(mn), t + float(tail or 0)); SH[i] = dict(t0=T, d=d, v=v); T += d
TOTAL = T; N = int((TOTAL + .1) * R); L = np.zeros(N); Rr = np.zeros(N)
S = lambda k, o=0: SH[k]['t0'] + o
V = lambda k, i=0: SH[k]['t0'] + SH[k]['v'][i]

def put(x, t, g=1., pan=0.):
    i = int(t * R)
    if i >= N or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[:N - i] * g; L[i:i + len(x)] += x * np.sqrt((1 - pan) / 2) * 1.414; Rr[i:i + len(x)] += x * np.sqrt((1 + pan) / 2) * 1.414
def env(n, a=.005, r=.05):
    e = np.ones(n); na, nr = min(n, int(a * R)), min(n, int(r * R))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def band(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / R); m = ((f >= lo) & (f <= hi)).astype(float)
    y = np.fft.irfft(X * m, n); return y / (np.abs(y).max() + 1e-9)
def load(p, rate=1.0, af=None):
    flt = f'asetrate={int(R*rate)},aresample={R}' if rate != 1 else 'anull'
    if af: flt += ',' + af
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', flt, '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).astype(np.float64)
lib = lambda p: os.path.join(LIB, p)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

# ===== инструменты =====
def piano(m, dur, vel=1., detune=1.0):
    n = int((dur + .6) * R); t = np.arange(n) / R; f = mf(m) * detune
    y = sum((1 / k ** 1.3) * np.sin(2 * np.pi * f * k * t * (1 + .0004 * k)) * np.exp(-t * (2.2 + k * .9)) for k in range(1, 8))
    y += .6 * sum((1 / k ** 1.3) * np.sin(2 * np.pi * f * 1.004 * k * t) * np.exp(-t * (2.2 + k * .9)) for k in range(1, 5))  # «расстроенное» пианино
    return y * env(n, .002, .25) * vel * .16
def clar(m, dur, vel=1., vib=5.5):
    n = int(dur * R); t = np.arange(n) / R; f = mf(m) * (1 + .006 * np.sin(2 * np.pi * vib * t) * np.clip(t / .15, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / R; y = np.sin(ph) + .45 * np.sin(3 * ph) + .2 * np.sin(5 * ph) + .08 * np.sin(7 * ph)
    return y * env(n, .025, .06) * vel * .07
def mbox(m, vel=1.):
    n = int(1.6 * R); t = np.arange(n) / R; f = mf(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + .4 * np.sin(2 * np.pi * f * 4.03 * t) * np.exp(-t * 8) + .2 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
    return y * env(n, .001, .2) * vel * .12
def brush(vel=1.):
    n = int(.12 * R); return band(n, 3000, 9000) * np.exp(-np.arange(n) / R * 40) * vel * .05
def kick(vel=1.):
    n = int(.25 * R); t = np.arange(n) / R; return np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t * 30)) / R) * np.exp(-t * 14) * vel * .25

# ===== регтайм =====
CH = {'C': [48, 52, 55, 60, 64, 67], 'A7': [45, 49, 52, 55, 61, 64], 'D7': [50, 54, 57, 60, 62, 66], 'G7': [43, 47, 50, 53, 59, 62], 'F': [41, 45, 48, 53, 57, 60], 'C7': [48, 52, 55, 58, 64, 70], 'Fm': [41, 44, 48, 53, 56, 60],
      'Am': [45, 48, 52, 57, 60, 64], 'Dm': [50, 53, 57, 62, 65, 69], 'E7': [40, 44, 47, 50, 56, 59]}
PROG = ['C', 'A7', 'D7', 'G7', 'C', 'C7', 'F', 'Fm']
MINOR = {'C': 'Am', 'A7': 'E7', 'D7': 'Dm', 'G7': 'E7', 'C7': 'Am', 'F': 'Dm', 'Fm': 'E7'}
PAT = [(0, 2, .75), (.75, 1, .25), (1, 3, .5), (1.5, 4, .5), (2, 2, .75), (2.75, 1, .25), (3, 0, .5), (3.5, 2, .5)]  # (доля, индекс тона мелодии, длительность)
def rag(t0, t1, beat=.5, minor=False, box=False, wow=0., vel=1.):
    bars = int(np.ceil((t1 - t0) / (beat * 4)))
    for b in range(bars):
        c = PROG[b % len(PROG)]; c = MINOR[c] if minor else c; tones = CH[c]; tb = t0 + b * beat * 4
        for k in range(4):
            tt = tb + k * beat
            if tt >= t1: break
            w = 1 + wow * np.sin(tt * 2.1) * .03
            if box: continue
            if k % 2 == 0: put(piano(tones[0] - 12, beat * .9, .9 * vel, w), tt); put(kick(.5 * vel), tt)
            else: [put(piano(m, beat * .5, .55 * vel, w), tt + .01 * j) for j, m in enumerate(tones[1:4])]; put(brush(vel), tt)
        mel = [m + 12 for m in tones[3:]] + [tones[3] + 24]
        for (pos, idx, du) in PAT:
            tt = tb + pos * beat
            if tt >= t1: break
            m = mel[min(idx, len(mel) - 1)]
            if box: put(mbox(m + 12, .8 * vel), tt, 1, .2); continue
            put(clar(m, du * beat * .95, vel, 5.5), tt, 1, .15)
# ===== проектор и плёнка =====
t = np.arange(N) / R
proj = band(N, 800, 5000) * (np.clip(np.sin(2 * np.pi * 24 * t), 0, 1) ** 8) * .05 + band(N, 60, 300) * .012
crackle = np.zeros(N); idx = rng.integers(0, N, int(TOTAL * 30)); crackle[idx] = rng.standard_normal(len(idx)) * .25
crackle = np.convolve(crackle, np.exp(-np.arange(60) / 8), 'same')
hiss = band(N, 2000, 9000) * .008
L += proj + crackle + hiss; Rr += proj * .95 + crackle + hiss

def scratch(tt, g=1.):  # скрип пластинки
    n = int(.45 * R); x = np.arange(n) / R; f = 600 + 2400 * np.abs(np.sin(x * 14))
    y = band(n, 300, 6000) * (np.sin(2 * np.pi * np.cumsum(f) / R) * .5 + .5) * env(n, .005, .1); put(y * .45 * g, tt)
def sweep(tt, f0, f1, dur, g=.12, vib=0):
    n = int(dur * R); x = np.arange(n) / R; f = np.geomspace(f0, f1, n) * (1 + vib * np.sin(2 * np.pi * 7 * x))
    put(np.sin(2 * np.pi * np.cumsum(f) / R) * env(n, .01, .05) * g, tt)
def boom(tt, g=1., f0=50):
    n = int(2.2 * R); x = np.arange(n) / R; y = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-x * 8))) / R) * np.exp(-x * 1.8) + band(n, 30, 400) * np.exp(-x * 9) * .6
    put(y * .5 * g, tt)
def sting(tt, g=1.):  # оркестровый «удар» хоррора: кластер струн + удар
    n = int(2.5 * R); x = np.arange(n) / R
    y = sum(np.sin(2 * np.pi * np.cumsum(f * (1 + .02 * np.sin(x * 40 + f))) / R) for f in (622, 659, 698, 932, 988)) * np.exp(-x * 1.4) * .05
    y += band(n, 1500, 8000) * np.exp(-x * 5) * .15; put(y * g, tt); boom(tt, g)
def tear(tt, dur=.9, g=1.):
    n = int(dur * R); y = band(n, 500, 7000) * (np.abs(rng.standard_normal(n)) > 1.4) * env(n, .02, .2); y = np.convolve(y, np.ones(30) / 30, 'same'); put(y * 1.6 * g, tt)
def drone(t0, t1, g=.1, f=55):
    n = int((t1 - t0) * R); x = np.arange(n) / R
    y = (np.sin(2 * np.pi * f * x) + .7 * np.sin(2 * np.pi * f * 1.012 * x) + .4 * np.sin(2 * np.pi * f * 1.5 * x) + .25 * band(n, 40, 200)) * env(n, 1, 1); put(y * g, t0)

# ===== партитура по планам =====
for k, tt in enumerate([0, .35]): put(np.sin(2 * np.pi * 1000 * np.arange(int(.08 * R)) / R) * .12, tt + .02)  # писк ракорда
rag(S('H', .7), S('S4b', .3), vel=1.)
sting(S('H', 1.95), .5)                                       # кадр-вспышка крика в хуке
sweep(S('S2', .2), 500, 1500, .4, .08)                        # слайд-свисток на появлении
sweep(S('S4a', .6), 1400, 400, .25, .1); put(load(lib('sfx-kit/sounds/whooshes/whoosh-fast-soft.wav')), S('S4a', .75), .6)
n = int(.25 * R); put(band(n, 80, 900) * np.exp(-np.arange(n) / R * 18) * .5, S('S4a', 1.07))  # падение
n = int(.3 * R); put(band(n, 200, 2500) * np.exp(-np.arange(n) / R * 14) * .5, S('S4a', 1.35))  # шлёп мороженого
for k, m in enumerate([55, 54, 53, 52]): put(clar(m - 12, .45 if k < 3 else 1.0, 1.2, 3), S('S4b', .9 + k * .45))  # грустный «уа-уа»
scratch(S('S5', .0), 1.2)
drone(S('S5', .5), S('S7', 3.5), .09, 49)
for k in range(4): n = int(.6 * R); put(band(n, 150, 900) * env(n, .2, .3) * (np.sin(np.arange(n) / R * 50) * .5 + .5) * .22, S('S5', 1.2 + k * .6), 1, (-1) ** k * .5)  # скрип поворотов голов
rag(S('S6', 0), S('S7', 0), beat=.7, minor=True, vel=.8)
put(load(lib('bigsoundbank/1929.flac'))[:int(SH['S7']['d'] * R)] * .28, S('S7', 0))
sweep(S('S7', SH['S7']['v'][0] + .9), 200, 900, 1.2, .05, .02)  # сползание наклейки
scr = load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/CREAHmn_TrollDeathScream_OS_01.ogg'), 1.35)
put(scr * .9, S('S7', SH['S7']['v'][0] + 2.1)); sting(S('S7', SH['S7']['v'][0] + 2.1), 1.2)
# бег: семенящие шаги, хлопок двери
for k in range(14): n = int(.04 * R); put(band(n, 1500, 5000) * np.exp(-np.arange(n) / R * 80) * .3, S('S8', .05 + k * .085), 1, .3)
sweep(S('S8', .2), 900, 1800, .8, .06)
put(load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/DOORWood_FrontDoorClose_OS_01.ogg')), S('S8', 1.4), 1.2)
n = int(2 * R); put(band(n, 300, 2000) * (np.sin(np.arange(n) / R * 14 * np.pi) ** 2) * env(n, .1, .5) * .12, S('S8', 1.6), 1, -.3)  # тяжёлое дыхание
drone(S('S9', 0), S('S10', 1), .12, 41); n = int(SH['S9']['v'][0] * R); put(band(n, 30, 120) * np.linspace(0, .4, n), S('S9', 0))
sting(V('S9') + D['c02'] + .05, 1.3)
for k in range(8): n = int(.25 * R); put(band(n, 1000, 5000) * env(n, .03, .12) * .15, S('S10', .5 + k * .32), 1, rng.uniform(-.4, .4))  # мазки кистью
rag(S('S10', SH['S10']['v'][0] - .1), S('S11', 0), wow=1.4, vel=.8)
rag(S('S11', 0), S('S12', 1), box=True, vel=.9)
tear(S('S12', 1.0), 1.6, 1.)
drone(S('S12', 1.5), S('S14', 0), .1, 46)
sting(S('S13', SH['S13']['v'][0] + D['a05'] - .1), 1.0)
sweep(S('S14', .2), 80, 400, 1.0, .12); sting(S('S14', .25 + D['c03'] + .05), 1.6)
n = int(2.5 * R); put(band(n, 200, 6000) * (np.abs(rng.standard_normal(n)) > 1.0) * np.exp(-np.arange(n) / R * 1.2) * .6, S('S14', .3 + D['c03']))  # прожиг
# конец плёнки: хлопанье хвоста бобины
for k in range(int(SH['END']['d'] * 9)): n = int(.03 * R); put(band(n, 500, 4000) * np.exp(-np.arange(n) / R * 90) * .35, S('END', .1 + k / 9))
for k, m in enumerate([72, 76, 79]): put(mbox(m - (k == 2), .8), S('END', .6 + k * .45))

# ===== голоса =====
RADIO = 'highpass=f=280,lowpass=f=3800,acompressor=threshold=-20dB:ratio=4:makeup=5,acrusher=bits=11:mix=0.15'
FX = {'a01': RADIO, 'a02': RADIO, 'a03': 'asetrate=24000*0.8,aresample=24000,' + RADIO + ',aecho=0.7:0.6:80|160:0.3|0.2',
      'a04': 'vibrato=f=4:d=0.25,' + RADIO, 'a05': 'asetrate=24000*0.86,aresample=24000,' + RADIO + ',aecho=0.7:0.7:120|240:0.35|0.25',
      't01': 'highpass=f=150,lowpass=f=6000,acompressor=threshold=-22dB:ratio=3:makeup=4', 't02': 'highpass=f=150,lowpass=f=6000,acompressor=threshold=-22dB:ratio=3:makeup=4',
      't03': 'lowpass=f=900,acompressor=threshold=-24dB:ratio=3:makeup=8',  # сквозь нарисованный рот — глухо
      'c01': 'highpass=f=120,aecho=0.8:0.8:60|130|210:0.4|0.3|0.25', 'c02': 'asetrate=24000*0.85,aresample=24000,aecho=0.8:0.8:60|130:0.4|0.3', 'c03': 'asetrate=24000*0.8,aresample=24000,aecho=0.8:0.85:90|200|330:0.45|0.35|0.25'}
STRETCH = {'a03': 1 / .8, 'a05': 1 / .86, 'c02': 1 / .85, 'c03': 1 / .8}
vo = np.zeros(N)
for lid, tt in VO:
    x = load(os.path.join(PRJ, 'vo/take1', lid + '.wav'), af=FX[lid])
    if lid.startswith('c'):  # хор: три копии с разной высотой и сдвигом
        x2 = load(os.path.join(PRJ, 'vo/take1', lid + '.wav'), af='asetrate=24000*0.93,aresample=24000,' + FX[lid]); x3 = load(os.path.join(PRJ, 'vo/take1', lid + '.wav'), af='asetrate=24000*1.08,aresample=24000,' + FX[lid])
        n = max(len(x), len(x2) + 2400, len(x3) + 4000); y = np.zeros(n); y[:len(x)] += x; y[2400:2400 + len(x2)] += x2 * .7; y[4000:4000 + len(x3)] += x3 * .6; x = y
    i = int(tt * R); x = x[:N - i]; vo[i:i + len(x)] += x / (np.abs(x).max() + 1e-9) * .5
w_ = int(.25 * R); cs = np.cumsum(np.concatenate([np.zeros(w_), (np.abs(vo) > .01).astype(float), np.zeros(w_)])); envv = (cs[w_ + w_ // 2:w_ + w_ // 2 + N] - cs[w_ // 2:w_ // 2 + N]) / w_
duck = 1 - .7 * np.clip(envv * 3, 0, 1)
bg = (L + Rr) / 2
for lid, tt in VO:
    i0 = int(tt * R); i1 = i0 + int(D[lid] * STRETCH.get(lid, 1) * R); seg = vo[i0:i1]; act = np.abs(seg) > .02
    if act.sum() > 100: print(f'  {lid} {tt:5.1f} с  голос/фон {20 * np.log10(np.sqrt(np.mean(seg[act] ** 2)) / (np.sqrt(np.mean((bg[i0:i1] * duck[i0:i1])[act] ** 2)) + 1e-9)):5.1f} дБ')
L = L * duck + vo; Rr = Rr * duck + vo
st = np.stack([L, Rr], 1); st = st / np.abs(st).max() * .89
st.astype(np.float32).tofile(os.path.join(HERE, 'mix.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(R), '-ac', '2', '-i', os.path.join(HERE, 'mix.f32'), os.path.join(HERE, 'mix.wav')], check=True); os.remove(os.path.join(HERE, 'mix.f32'))
print('mix.wav', round(TOTAL, 2))
