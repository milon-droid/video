#!/usr/bin/env python3
"""«COLD» v3 — звук на настоящих записях (CC0, audio/lib, список — audio/lib/CREDITS.md):
рычание и лай собаки, скрип пола, испуганное дыхание, шёпот, хоррор-удары, крики на скримере, гул дома; + синтез: писк камеры,
сердце-удары, дроны и подъёмы, свеча. Голос — по таймлайну, фон приглушается под ним.  → audio/mix.wav"""
import json, subprocess, os, re
import numpy as np
R = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(HERE); LIBA = os.path.join(PRJ, '../../assets/sfx-library')
rng = np.random.default_rng(11)
D = json.load(open(os.path.join(PRJ, 'vo/durations.json')))
src = open(os.path.join(PRJ, 'src/main.js')).read(); blk = src[src.index('const SHOTS = ['):src.index('];', src.index('const SHOTS = ['))]
SH, VO, T = {}, [], 0
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\](?:, lead: ([\d.]+))?(?:, gap: ([\d.]+))?(?:, tail: ([\d.]+))?, min: ([\d.]+)", blk):
    i, ls, lead, gap, tail, mn = m.groups(); ls = re.findall(r"'(\w+)'", ls); t = float(lead or 0); v = []
    for k, l in enumerate(ls):
        if k: t += float(gap or .3)
        VO.append((l, T + t)); v.append(t); t += D[l]
    d = max(float(mn), t + float(tail or 0)); SH[i] = dict(t0=T, d=d, v=v); T += d
TOTAL = T; N = int((TOTAL + .1) * R); L = np.zeros(N); Rr = np.zeros(N)
S = lambda k, o=0: SH[k]['t0'] + o
V = lambda k, i=0: SH[k]['t0'] + SH[k]['v'][i]
QS = float(re.search(r'const QS = ([\d.]+)', src).group(1))
MICRO = [float(x) for x in re.search(r'const MICRO = \[([^\]]*)\]', src).group(1).split(',')]
GFL = [(a_, float(b_)) for a_, b_ in re.findall(r"\['(\w+)', (-?[\d.]+)\]", re.search(r'const GFL = \[(.*?)\];', src).group(1))]
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
def load(name, rate=1.0, af=None, lib=True):
    p = os.path.join(HERE, 'lib', name) if lib else os.path.join(LIBA, name)
    flt = f'asetrate={int(R*rate)},aresample={R}' if rate != 1 else 'anull'
    if af: flt += ',' + af
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-af', flt, '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(b, np.float32).astype(np.float64); return x / (np.abs(x).max() + 1e-9)
def seg(x, a, b, fa=.05, fr=.2): y = x[int(a * R):int(b * R)]; return y * env(len(y), fa, fr)
X = lambda n: np.arange(n) / R
def tone(n, f): return np.sin(2 * np.pi * f * X(n))

# ===== записи =====
GROWL = load('dog-growling-2694c5.mp3'); GROWL2 = load('doggrowlingsnarlinggrumbling-ed0e3d.mp3'); GROWL3 = load('animal-dog-growl-01-9f52e0.mp3')
ANGRY = load('angry-dog-1870b5.mp3'); BARK = load('aggressive-barking-dog-1-10804b.mp3')
CREAK = load('creaking-wood-4-steps-d9fe70.mp3'); CREAK1 = load('wood-creak-single-v1-6b26dd.mp3'); FLOOR = load('creaking-floor-owi-e1bb2d.mp3')
BREATH = load('scared-breathing-2-2c99df.mp3'); BREATH2 = load('scared-breath-a41801.mp3')
WHISP = load('unreal-whispers-e28695.mp3'); WHISP_R = WHISP[::-1].copy()
STING_M = load('metallic-horror-stinger-c11866.mp3'); STING3 = load('stinger-3-1aa8d3.mp3')
SCREAM_D = load('demonic-woman-scream-0fc81e.mp3'); SCREAM_M = load('forest-monster-scream1-92ce69.mp3')
DRONE = load('horror-drone-ambience-8c4120.mp3'); AMB = load('ambience04-adb569.mp3')
SHUT = load('sfx-kit/sounds/mechanical/mechanical-shutter-light.wav', lib=False)
CORRUPT = load('sfx-kit/sounds/digital/digital-corrupt.wav', lib=False); INTERF = load('sfx-kit/sounds/digital/digital-interference.wav', lib=False)
WHF = load('sfx-kit/sounds/whooshes/whoosh-fast-medium.wav', lib=False); WHS = load('sfx-kit/sounds/whooshes/whoosh-slow-soft.wav', lib=False)
HB = load('bigsoundbank/1930.flac', lib=False)
def loop(x, n): return np.tile(x, n // len(x) + 1)[:n]

# ===== фон дома: гул, тишина «с давлением» =====
t = np.arange(N) / R
def curve(points): xs, ys = zip(*points); return np.interp(t, xs, ys)
Mz = V('M') + D['l14']
tens = curve([(0, .4), (S('H') + 2.9, .4), (S('A'), .3), (S('E'), .4), (S('F'), .6), (S('I'), .85), (S('L'), 1.0), (Mz + .1, 1.0), (Mz + .25, .05), (S('N') + .9, .15), (S('O'), .8), (S('Q'), .6), (S('Q') + 1.5, .5), (S('Q') + 1.8, 0), (TOTAL, 0)])
drone = loop(DRONE, N) * .14; amb = loop(AMB, N) * .05
whine = tone(N, 11800) * .0012
L += drone * tens + amb + whine; Rr += np.roll(drone, 2400) * tens + np.roll(amb, 4800) + whine
# низкие биения — давление, растут к зеркалу
low = (tone(N, 41.2) + .8 * tone(N, 41.9) + .4 * tone(N, 61.7)) * .06 * np.clip((tens - .3) / .7, 0, 1)
L += low; Rr += low

def boom(tt, g=1., f0=50):
    n = int(2.4 * R); x = X(n); y = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-x * 8))) / R) * np.exp(-x * 1.6) + band(n, 30, 300) * np.exp(-x * 8) * .5; put(y * .6 * g, tt)
def blip(tt, f=1900, g=.06): n = int(.05 * R); put(tone(n, f) * env(n, .002, .03) * g, tt)
def riser(t0, dur, g=.25):
    n = int(dur * R); x = X(n); y = band(n, 300, 6000) * (x / dur) ** 2.5 + np.sin(2 * np.pi * np.cumsum(200 + 900 * (x / dur) ** 2) / R) * (x / dur) ** 2 * .3; put(y * g, t0)

# ===== ХУК =====
put(CORRUPT * .25, 0.0); boom(0.02, .6)
put(seg(STING_M, 0, 4, .002, 1.5) * .5, 2.45)
put(seg(GROWL2, 3, 6.6, .3, .4) * .3, 0.2, 1, .3)
put(CORRUPT * .6, 2.45); boom(2.45, 1.1, 42); put(seg(WHISP_R, 0, 1.5, .05, .4) * .4, 2.4, 1, -.3)
blip(.3, 2200, .08)

# ===== КАМЕРА: включение, NUC =====
NUC = [S('B') + .35, S('F') + .15]
for n_ in NUC: put(SHUT * .9, n_ + .27); put(SHUT * .35, n_ + .02)
for k, f in enumerate([880, 1320, 1760]): n = int(.07 * R); put(tone(n, f) * env(n, .003, .03) * .08, S('B') + .1 + k * .12)
blip(S('A') + .35); blip(S('C') + .35); blip(S('C') + SH['C']['v'][1]); blip(S('G') + .35); blip(V('G', 1) + .3, 1500)
for k in range(2): blip(S('I') + .95 + k * .09, 2400, .08)
put(WHS * .5, S('C') + SH['C']['v'][1] - .3); put(WHS * .45, S('E') + .5); put(WHF * .7, S('I') + .2); put(WHF * 1.0, S('O')); put(WHF * 1.1, S('Q'))

# ===== СОБАКА: настоящее рычание и лай =====
put(seg(GROWL, 2, 2 + SH['A']['d'] + SH['B']['d'], .4, .5) * .6, S('A') + .05, 1, .35)
put(seg(GROWL, 14, 14 + SH['C']['v'][1] + .4, .2, .4) * .45, S('C'), 1, .2)
for k in range(10): n = int(.03 * R); put(band(n, 2500, 7000) * env(n, .001, .02) * .07, S('D') + .1 + k * .25 + (k % 2) * .06, 1, -.2)
put(seg(GROWL2, 10, 10 + SH['E']['d'] + .5, .2, .5) * .65, S('E'), 1, -.3)
put(seg(GROWL3, 0, 2.3, .01, .3) * .6, S('E') + 1.4, 1, -.3)
put(seg(GROWL2, 20, 20 + SH['O']['d'] + 1.4, .05, .3) * .6, S('O') + .15, 1, .05)
for k, a in enumerate([.35, .85, 1.25]): put(BARK * (1.0 if k != 1 else .9), S('P') + a + .04, 1, .05)
put(seg(ANGRY, 2, 2 + SH['P']['d'] - .3, .02, .3) * .25, S('P') + 1.5, 1, 0)

# ===== КОРИДОР: скрип шагов, дыхание, сквозняк =====
put(seg(CREAK, 0, 5.8, .02, .3) * .55, S('E') + .7, 1, .2)
put(seg(CREAK, 0, 5.8, .02, .3) * .6, S('F') + .1, 1, .1)
put(seg(FLOOR, 0, 4.2, .05, .4) * .4, S('F') + 2.8, 1, .3)
put(seg(BREATH, 0, min(9.6, S('I') - S('F')), .5, .6) * .3, S('F') + .3, 1, -.1)
n = int((S('L') - S('F')) * R); put(band(n, 200, 1200) * env(n, 1.5, 1.5) * .05 * (.6 + .4 * np.sin(X(n) * .9)), S('F'), 1, .1)
# свеча: тихий треск пламени + низкая нота при вопросе
n = int((SH['G']['d'] - SH['G']['v'][1] + .6) * R); cr = np.zeros(n); ix = rng.integers(0, n, 60); cr[ix] = rng.standard_normal(60) * .3; cr = np.convolve(cr, np.exp(-np.arange(200) / 30), 'same'); put(cr * .25, V('G', 1) - .6, 1, -.4)
put(seg(STING3, 0, 2.0, .01, .6) * .35, V('G', 1) + .4)
# Джесс дышит во сне
br = load('meta-open-sound/corpora/oculus-audio-pack/ogg/HMNBrth_FemaleBreathing_OS_01.ogg', lib=False); n = int(SH['G']['d'] * R); put(br[:n] * env(n, .4, .6) * .2, S('G'), 1, -.3)

# ===== ЗЕРКАЛО: удар-появление, сердце, шёпот, подъём =====
put(seg(STING_M, 0, 5, .002, 1.5) * .4, S('I') + 1.0)
a0, a1 = S('I') + 1.0, Mz + .08; n = int((a1 - a0) * R); put(loop(HB, n) * np.linspace(.3, .7, n) * env(n, .5, .02), a0)
step = lambda tt: put(seg(CREAK1, 0, 1.0, .005, .2) * .55, tt, 1, rng.uniform(-.2, .2))
J = SH['J']; step(J['t0'] + J['v'][0] + 1.05); step(J['t0'] + J['v'][0] + 2.25)
put(seg(WHISP, 0, 6, .8, 1.0) * .13, S('Kk'), 1, -.5); put(seg(WHISP_R, 2, 7, .8, 1.0) * .1, S('Kk') + .5, 1, .5)
riser(S('L'), Mz + .1 - S('L'), .22)
boom(Mz + .1, 1.3, 44); n = int(4 * R); put(tone(n, 4100) * np.exp(-X(n) * .7) * .025 * env(n, .05, 1), Mz + .1)
n = int(3 * R); put((tone(n, 1046) + tone(n, 1108) + tone(n, 1567)) * .012 * env(n, 1.2, 1), S('N') + .5)
put(seg(FLOOR, 1, 3, .1, .4) * .35, S('N') + .2, 1, -.4)

# ===== ФИНАЛ: пустое зеркало → затемнение, «03:14», почти тишина (зритель думает — конец) → ВНЕЗАПНЫЙ скример =====
q = S('Q')
put(seg(BREATH2, 0, 1.6, .2, .4) * .25, q + .2, 1, 0)
blip(q + 1.75, 1200, .05)                                                           # REC выключился
n = int((QS - 1.8) * R); put(tone(n, 6200) * .004 * env(n, .5, .1), q + 1.8)       # тонкий звон в тишине
qs = q + QS
SCR = np.zeros(int(2.0 * R)); a_ = seg(SCREAM_D, .05, 2.0, .001, .3); b_ = seg(SCREAM_M, 0, 2.0, .001, .3)
SCR[:len(a_)] += a_ * .9; SCR[:len(b_)] += b_ * .8
SCR = np.tanh(SCR * 2.2) * .8                                                       # перегруз — крик «в лицо»
put(SCR[:int(.62 * R)] * env(int(.62 * R), .001, .04) * 1.4, qs, 1, 0)
put(seg(STING_M, 0, .62, .0005, .04) * 1.0, qs); boom(qs, 2.0, 36)
n = int(.6 * R); put(band(n, 80, 9000) * env(n, .0005, .05) * .9, qs)               # удар шума
put(CORRUPT[:int(.6 * R)] * 1.0, qs + .03); put(INTERF[:int(.55 * R)] * .7, qs + .08)
for k in range(6): n = int(.04 * R); put(band(n, 300, 6000) * .5, qs + .05 + k * .09, 1, (-1) ** k * .6)   # рваные сбои
# после — резкий обрыв: тишина, только короткий гул «в ушах»
n = int(1.2 * R); put(tone(n, 3100) * np.exp(-X(n) * 2) * .02, qs + .62)

# ===== ТРЕВОГА НЕПРЕРЫВНО: сердце снизу, далёкие стуки, шёпот, сбои, вспышки силуэта =====
a0, a1 = S('A'), S('I') + 1.0; n = int((a1 - a0) * R); put(loop(HB, n) * np.linspace(.08, .22, n) * env(n, 2, .5), a0)
for tt, pan in [(S('B') + 1.6, -.8), (S('D') + 2.2, .7), (S('F') + 3.6, -.6), (S('N') + 2.4, .8)]:     # далёкий стук — откуда?
    for k in range(3): n = int(.2 * R); x_ = X(n); put((np.sin(2 * np.pi * 95 * x_) * np.exp(-x_ * 28) + band(n, 150, 900) * np.exp(-x_ * 40) * .5) * .16, tt + k * .38, 1, pan)
for m in MICRO: n = int(.07 * R); put(band(n, 1500, 9000) * env(n, .001, .02) * .25, m, 1, rng.uniform(-.5, .5)); blip(m, 3400, .03)
for sid, tt in GFL:
    st = S(sid) + (SH[sid]['d'] + tt if tt < 0 else tt)
    put(seg(WHISP_R, 0, .7, .3, .02) * .35, st - .65, 1, rng.uniform(-.6, .6))          # шёпот-всасывание перед вспышкой
    put(seg(STING3, 0, .5, .001, .25) * .45, st); boom(st, .35, 46)
for tt in [S('C') + 2.8, S('F') + 1.6, S('Kk') + .4]: put(seg(WHISP, 3, 4.6, .3, .6) * .12, tt, 1, rng.choice([-.8, .8]))

# ===== ГОЛОС =====
fx = {'holod_dan': 'highpass=f=80,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=3:makeup=4',
      'holod_jess': 'highpass=f=150,equalizer=f=4000:t=q:w=1:g=2,acompressor=threshold=-24dB:ratio=3:makeup=5,aecho=0.7:0.6:45|90:0.25|0.12'}
lines = {l['id']: l for l in json.load(open(os.path.join(PRJ, 'vo/lines.json')))['lines']}
vo = np.zeros(N)
for lid, tt in VO:
    b_ = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PRJ, 'vo/take1', lid + '.wav'), '-af', fx[lines[lid]['role']], '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(b_, np.float32).astype(np.float64); i = int(tt * R); x = x[:N - i]; vo[i:i + len(x)] += x / (np.abs(x).max() + 1e-9) * .5
w_ = int(.25 * R); cs = np.cumsum(np.concatenate([np.zeros(w_), (np.abs(vo) > .01).astype(float), np.zeros(w_)])); envv = (cs[w_ + w_ // 2:w_ + w_ // 2 + N] - cs[w_ // 2:w_ // 2 + N]) / w_
duck = 1 - .6 * np.clip(envv * 3, 0, 1)
bg = (L + Rr) / 2
for lid, tt in VO:
    i0 = int(tt * R); i1 = i0 + int(D[lid] * R); s_ = vo[i0:i1]; act = np.abs(s_) > .02
    if act.sum() > 100: print(f'  {lid} {tt:5.1f} с  голос/фон {20 * np.log10(np.sqrt(np.mean(s_[act] ** 2)) / (np.sqrt(np.mean((bg[i0:i1] * duck[i0:i1])[act] ** 2)) + 1e-9)):5.1f} дБ')
L = L * duck + vo; Rr = Rr * duck + vo
st = np.stack([L, Rr], 1); st = st / np.abs(st).max() * .89
st.astype(np.float32).tofile(os.path.join(HERE, 'mix.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(R), '-ac', '2', '-i', os.path.join(HERE, 'mix.f32'), os.path.join(HERE, 'mix.wav')], check=True); os.remove(os.path.join(HERE, 'mix.f32'))
print('mix.wav', round(TOTAL, 2))
