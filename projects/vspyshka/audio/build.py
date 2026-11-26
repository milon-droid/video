#!/usr/bin/env python3
"""«12 SHOTS»: звук — гроза (дождь, гром по молниям), вспышка (затвор, хлопок, перемотка плёнки, писк зарядки), стук, шаги-скрипы,
сердце, дрон, скримеры (кластер + удар + визг), гул лампы; голос — шёпот.  → mix.wav"""
import json, subprocess, os, re
import numpy as np
R = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(HERE); LIB = os.path.join(PRJ, '../../assets/sfx-library')
rng = np.random.default_rng(5)
D = json.load(open(os.path.join(PRJ, 'vo/durations.json')))
src = open(os.path.join(PRJ, 'src/main.js')).read(); blk = src[src.index('const SHOTS = ['):src.index('];', src.index('const SHOTS = ['))]
SH, VO, T = {}, [], 0
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\](?:, lead: ([\d.]+))?(?:, tail: ([\d.]+))?, min: ([\d.]+)", blk):
    i, ls, lead, tail, mn = m.groups(); ls = re.findall(r"'(\w+)'", ls); t = float(lead or 0); v = []
    for k, l in enumerate(ls):
        if k: t += .35
        VO.append((l, T + t)); v.append(t); t += D[l]
    d = max(float(mn), t + float(tail or 0)); SH[i] = dict(t0=T, d=d, v=v); T += d
TOTAL = T; N = int((TOTAL + .1) * R); L = np.zeros(N); Rr = np.zeros(N)
S = lambda k, o=0: SH[k]['t0'] + o
# вспышки — из того же описания, что в main.js
fl = re.search(r"const FL = \[(.*?)\]\.map", src, re.S).group(1)
FL = []
for s_, u_, c_ in re.findall(r"\['(\w+)', ([^,\]]+), (\d)\]", fl):
    u_ = u_.strip().replace('SH.G.d', str(SH['G']['d'])); FL.append((SH[s_]['t0'] + eval(u_), int(c_), s_))
BOLTS = {'A': [.8, 3.1, 5.4], 'B': [.4, 2.6], 'C': [2.2], 'F': [2.6], 'G': [2.3], 'I': [2.6]}

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
def load(p, rate=1.0):
    flt = f'asetrate={int(R*rate)},aresample={R}' if rate != 1 else 'anull'
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', flt, '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).astype(np.float64)
lib = lambda p: os.path.join(LIB, p)
X = lambda n: np.arange(n) / R

# дождь по стеклу + шум ветра
rain = band(N, 1500, 9000) * .03 + band(N, 300, 1500) * .015
drops = np.zeros(N); idx = rng.integers(0, N, int(TOTAL * 40)); drops[idx] = rng.standard_normal(len(idx)) * .12; drops = np.convolve(drops, np.exp(-np.arange(80) / 10), 'same')
lamp_on = (S('J', .4), S('L', .5))
mask = np.ones(N); i0, i1 = int(lamp_on[0] * R), int(lamp_on[1] * R)
L += (rain + drops) * mask; Rr += (rain * .9 + drops) * mask
# гром: через 0,3–0,8 с после молнии
def thunder(tt, g=1.):
    n = int(3.5 * R); x = X(n); y = band(n, 25, 260) * np.exp(-x * 1.1) * (1 + .6 * np.sin(x * 9)) + band(n, 200, 1200) * np.exp(-x * 4) * .5
    y *= np.clip(x / .05, 0, 1); put(y * .55 * g, tt, 1, -.4)
for s_, ts in BOLTS.items():
    for u_ in ts: thunder(S(s_, u_ + .35 + rng.uniform(0, .4)), .9 if s_ != 'A' else 1.1)
# вспышка: затвор + хлопок + перемотка + писк зарядки
def shutter(tt, g=1.):
    n = int(.05 * R); put(band(n, 2000, 8000) * np.exp(-X(n) * 120) * .5 * g, tt); put(band(n, 300, 2000) * np.exp(-X(n) * 90) * .4 * g, tt + .03)
    n = int(.12 * R); put(band(n, 4000, 12000) * np.exp(-X(n) * 50) * .35 * g, tt)   # хлопок лампы
def advance(tt):
    for k in range(7): n = int(.025 * R); put(band(n, 1500, 6000) * np.exp(-X(n) * 120) * .18, tt + k * .055)
def whine(tt, dur=1.3, g=1.):
    n = int(dur * R); x = X(n); f = 2400 + 4200 * (x / dur) ** .6; y = np.sin(2 * np.pi * np.cumsum(f) / R) * env(n, .05, .05) * (.4 + .6 * x / dur); put(y * .03 * g, tt)
    n2 = int(.1 * R); put(np.sin(2 * np.pi * 3200 * X(n2)) * env(n2, .005, .05) * .02, tt + dur)
for tt, c, s_ in FL:
    shutter(tt, 1.3 if s_ in ('G', 'L') else 1.)
    if c: advance(tt + .25); whine(tt + .6, 1.0)
whine(S('B', 1.2), 1.4); whine(S('L', .8), 1.65, 1.6)
# стук: три удара дерево
def knock(tt, g=1., pan=0.):
    for k in range(3): n = int(.2 * R); x = X(n); y = (np.sin(2 * np.pi * 110 * x) * np.exp(-x * 30) + band(n, 200, 1500) * np.exp(-x * 45) * .6); put(y * .5 * g, tt + k * .32, 1, pan)
knock(S('C', .4), .8, .1); knock(S('C', 2.9), .9, .1)
knock(S('G', .2), 1.2, .7)
# шаги-скрипы в темноте коридора
def creak(tt, g=1., pan=0.):
    n = int(.7 * R); x = X(n); f = 300 + 180 * np.sin(x * 7); y = band(n, 200, 1200) * (np.sin(2 * np.pi * np.cumsum(f) / R) * .5 + .5) ** 3 * env(n, .1, .3); put(y * .25 * g, tt, 1, pan)
    n = int(.25 * R); put(band(n, 60, 300) * np.exp(-X(n) * 18) * .3 * g, tt)
for tt, c, s_ in FL:
    if s_ in ('Dd', 'E') and c: creak(tt + .7, 1.0); creak(tt + 1.15, .8)
# дверь, шкаф
put(load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/DOORWood_FrontDoorClose_OS_01.ogg')), S('F', .25), 1.4)
put(load(lib('bigsoundbank/3205.flac'))[:int(2.8 * R)] * env(int(2.8 * R), .05, .4), S('G', 1.8), .8, .6)
# сердце от E до I
hb = load(lib('bigsoundbank/1930.flac')); a0, a1 = S('E', 0), S('I', 1.0); n = int((a1 - a0) * R); h = np.tile(hb, n // len(hb) + 1)[:n]
put(h * np.linspace(.15, .5, n) * env(n, 1, .05), a0)
# дрон
def drone(t0, t1, g=.1, f=44):
    n = int((t1 - t0) * R); x = X(n); y = (np.sin(2 * np.pi * f * x) + .7 * np.sin(2 * np.pi * f * 1.015 * x) + .35 * np.sin(2 * np.pi * f * 1.498 * x)) * env(n, 2, 1.5); put(y * g, t0)
drone(S('C', 0), S('J', .4), .08, 41); drone(S('L', .6), TOTAL, .1, 38)
# скримеры
def boom(tt, g=1., f0=48):
    n = int(2.4 * R); x = X(n); y = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.6 * np.exp(-x * 8))) / R) * np.exp(-x * 1.7) + band(n, 30, 400) * np.exp(-x * 9) * .6; put(y * .55 * g, tt)
def screech(tt, g=1., dur=1.3):  # нечеловеческий визг: ЧМ-синтез + шум
    n = int(dur * R); x = X(n); fc = 900 + 500 * np.sin(x * 23) + 300 * x; fm = np.sin(2 * np.pi * 173 * x) * 700
    y = np.sin(2 * np.pi * np.cumsum(fc + fm) / R) * .6 + band(n, 1500, 7000) * .5; y *= np.exp(-x * 2.2) * env(n, .01, .2); put(y * .35 * g, tt)
def sting(tt, g=1.):
    n = int(2.6 * R); x = X(n); y = sum(np.sin(2 * np.pi * np.cumsum(f * (1 + .025 * np.sin(x * 35 + f))) / R) for f in (466, 493, 523, 698, 740)) * np.exp(-x * 1.3) * .05
    put(y * g, tt); boom(tt, g); screech(tt + .02, g)
for tt, c, s_ in FL:
    if s_ == 'G': sting(tt, 1.2)
    if s_ == 'H2': boom(tt, .5)
    if s_ == 'L': sting(tt, 1.5)
    if s_ == 'H' and tt > 1: boom(tt, .6)
FLH2 = [tt for tt, c, s_ in FL if s_ == 'H2']; screech(FLH2[-1], .8, .9)
# свет вернулся: гул лампы; хлопок лампы в конце
n = int((lamp_on[1] - lamp_on[0]) * R); x = X(n); put((np.sin(2 * np.pi * 50 * x) * .5 + np.sin(2 * np.pi * 100 * x) * .3 + band(n, 2000, 5000) * .05) * .05 * env(n, .05, .02), lamp_on[0])
n = int(.3 * R); put(band(n, 1000, 8000) * np.exp(-X(n) * 25) * .6, lamp_on[1])
# финал: удар на «12 SHOTS»
boom(S('L', 3.2), .8, 36)
# ===== голос =====
FX = 'highpass=f=110,equalizer=f=3500:t=q:w=1:g=3,acompressor=threshold=-24dB:ratio=3:makeup=6,aecho=0.6:0.5:25|50:0.15|0.08'
vo = np.zeros(N)
for lid, tt in VO:
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PRJ, 'vo/take1', lid + '.wav'), '-af', FX, '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(b, np.float32).astype(np.float64); i = int(tt * R); x = x[:N - i]; vo[i:i + len(x)] += x / (np.abs(x).max() + 1e-9) * .5
w_ = int(.25 * R); cs = np.cumsum(np.concatenate([np.zeros(w_), (np.abs(vo) > .01).astype(float), np.zeros(w_)])); envv = (cs[w_ + w_ // 2:w_ + w_ // 2 + N] - cs[w_ // 2:w_ // 2 + N]) / w_
duck = 1 - .65 * np.clip(envv * 3, 0, 1); bg = (L + Rr) / 2
for lid, tt in VO:
    i0 = int(tt * R); i1 = i0 + int(D[lid] * R); seg = vo[i0:i1]; act = np.abs(seg) > .02
    if act.sum() > 100: print(f'  {lid} {tt:5.1f} с  голос/фон {20 * np.log10(np.sqrt(np.mean(seg[act] ** 2)) / (np.sqrt(np.mean((bg[i0:i1] * duck[i0:i1])[act] ** 2)) + 1e-9)):5.1f} дБ')
L = L * duck + vo; Rr = Rr * duck + vo
st = np.stack([L, Rr], 1); st = st / np.abs(st).max() * .89
st.astype(np.float32).tofile(os.path.join(HERE, 'mix.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(R), '-ac', '2', '-i', os.path.join(HERE, 'mix.f32'), os.path.join(HERE, 'mix.wav')], check=True); os.remove(os.path.join(HERE, 'mix.f32'))
print('mix.wav', round(TOTAL, 2))
