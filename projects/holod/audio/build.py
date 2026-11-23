#!/usr/bin/env python3
"""«ХОЛОД»: вся звуковая дорожка (numpy + ffmpeg): своя хоррор-партитура (гул, биения, дыхание камеры),
синтез рычания, щелчки затвора NUC, писк интерфейса, шаги, сердце, лай, сбой; голос — по таймлайну.
  python3 build.py  →  mix.wav (48 кГц стерео, до мастера)"""
import json, subprocess, os, re, sys
import numpy as np
R = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(HERE); LIB = os.path.join(PRJ, '../../assets/sfx-library')
rng = np.random.default_rng(7)

# --- таймлайн (та же логика, что в main.js) ---
D = json.load(open(os.path.join(PRJ, 'vo/durations.json')))
src = open(os.path.join(PRJ, 'src/main.js')).read(); blk = src[src.index('const SHOTS = ['):src.index('];', src.index('const SHOTS = ['))]
SH, VO, T = {}, [], 0
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\], lead: ([\d.]+)(?:, gap: ([\d.]+))?, tail: ([\d.]+), min: ([\d.]+)", blk):
    i, ls, lead, gap, tail, mn = m.groups(); ls = re.findall(r"'(\w+)'", ls); t = float(lead); v = []
    for k, l in enumerate(ls):
        if k: t += float(gap or .3)
        VO.append((l, T + t)); v.append(t); t += D[l]
    d = max(float(mn), t + float(tail)); SH[i] = dict(t0=T, d=d, v=v); T += d
TOTAL = T; N = int((TOTAL + .05) * R)
L = np.zeros(N); Rr = np.zeros(N)

def load(path, rate=1.0):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', f'asetrate={int(R*rate)},aresample={R}' if rate != 1 else 'anull', '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(p, np.float32).astype(np.float64)
def put(x, t, g=1.0, pan=0.0):
    i = int(t * R);
    if i >= N: return
    x = x[:N - i] * g; a = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
    if i < 0: x = x[-i:]; i = 0
    L[i:i + len(x)] += x * a[0]; Rr[i:i + len(x)] += x * a[1]
def env(n, a=.01, r=.1):
    e = np.ones(n); na, nr = int(a * R), int(r * R)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def band(n, lo, hi, tilt=0.0):  # шум в полосе (через спектр)
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / R)
    m = ((f >= lo) & (f <= hi)).astype(float); m = np.convolve(m, np.ones(64) / 64, 'same')
    if tilt: m *= (np.maximum(f, 20) / 1000) ** tilt
    y = np.fft.irfft(X * m, n); return y / (np.abs(y).max() + 1e-9)
def tone(n, f, ph=0):
    t = np.arange(n) / R; return np.sin(2 * np.pi * f * t + ph)
def lib(name): return os.path.join(LIB, name)
S = lambda k, off=0: SH[k]['t0'] + off
V = lambda k, i=0: SH[k]['t0'] + SH[k]['v'][i]

# ===== ПАРТИТУРА =====
t = np.arange(N) / R
# комнатный тон + тонкий писк электроники камеры
room = band(N, 60, 900, -.6) * .018
whine = tone(N, 11800) * .0012 * (1 + .3 * np.sin(t * .7))
L += room + whine; Rr += room * .9 + whine
# гул: низкие синусы с биениями, напряжение растёт к зеркалу; провал до тишины на «это я»
def curve(points):
    xs, ys = zip(*points); return np.interp(t, xs, ys)
tens = curve([(0, .45), (S('A'), .25), (S('E'), .35), (S('F'), .55), (S('I'), .8), (S('L'), 1.0), (V('M') + D['l14'] + .1, 1.0), (V('M') + D['l14'] + .25, 0), (S('N') + .9, 0.05), (S('O'), .7), (S('P') + PEND - .2, 1), (S('P') + PEND + .5, 0), (S('P') + PEND + 2.0, 0), (S('P') + PEND + 2.2, .6), (TOTAL, .5)])
drone = (tone(N, 41.2) + .8 * tone(N, 41.9) + .5 * tone(N, 61.7) + .35 * tone(N, 82.6 + .3 * np.sin(t * .2))) * .075
diss = (tone(N, 233.1) + tone(N, 246.9 + .8 * np.sin(t * .13)) + .6 * tone(N, 349.2)) * .012 * np.clip((tens - .4) / .6, 0, 1)
air = band(N, 1500, 6000, -.3) * .02
airL = air * (.5 + .5 * np.sin(t * .31)); airR = air * (.5 + .5 * np.cos(t * .27))
L += drone * tens + diss * tens + airL * tens; Rr += drone * tens * .95 + diss * tens * 1.05 + airR * tens
# хук: сбой + удар в первый кадр
def boom(tt, g=1, f0=55):
    n = int(2.4 * R); x = np.arange(n) / R; f = f0 * (1 + 1.4 * np.exp(-x * 9))
    y = np.sin(2 * np.pi * np.cumsum(f) / R) * np.exp(-x * 1.6) + band(n, 30, 300) * np.exp(-x * 8) * .5; put(y * .55, tt, g)
put(load(lib('sfx-kit/sounds/digital/digital-corrupt.wav')) * .35, 0.0, 1)
boom(0.02, .7)
put(tone(int(.09 * R), 2200) * env(int(.09 * R), .005, .04) * .1, S('H') + .3)   # писк изотермы

# ===== РЫЧАНИЕ (синтез): шум в полосе 90–700 Гц × неровные пульсы голосовых связок =====
def growl(dur, g=1, f=28):
    n = int(dur * R); x = np.arange(n) / R
    rate = f + 6 * np.sin(x * 2.3) + 3 * rng.standard_normal(n).cumsum() / np.sqrt(n) * 4
    ph = np.cumsum(rate) / R; pulse = np.clip(np.sin(2 * np.pi * ph), 0, 1) ** 3
    body = band(n, 90, 700, -.4) * pulse + band(n, 700, 2500) * pulse * .25
    sw = .55 + .45 * np.sin(x * 1.1 + 1) ** 2  # вдохи-выдохи
    return body * sw * env(n, .25, .4) * g
put(growl(SH['A']['d'] + SH['B']['d'] + .5, .5), S('A') + .1, 1, .35)
put(growl(SH['C']['v'][1] + .3, .35), S('C'), 1, .2)
put(growl(SH['E']['d'] + .6, .55), S('E'), 1, -.3)
put(growl(SH['O']['d'] + SH['P']['d'] - 1.8, .8, 31), S('O') + .2, 1, .1)

# ===== КАМЕРА: включение, затвор NUC, писки замеров =====
shutter = load(lib('sfx-kit/sounds/mechanical/mechanical-shutter-light.wav'))
PEND = SH['P']['d'] - 4.4
nucs = [S('B') + .35, S('F') + .15, S('P') + PEND]
for n_ in nucs: put(shutter, n_ + .27, .9); put(shutter, n_ + .02, .35)
for k, f in enumerate([880, 1320, 1760]): n = int(.07 * R); put(tone(n, f) * env(n, .003, .03) * .09, S('B') + .1 + k * .12)
put(tone(int(.16 * R), 660) * env(int(.16 * R), .003, .1) * .09, S('B') + 1.3)
blip = lambda tt, f=1900, g=.07: put(tone(int(.05 * R), f) * env(int(.05 * R), .002, .03) * g, tt)
blip(S('A') + .35); blip(S('C') + .35); blip(S('C') + SH['C']['v'][1]); blip(S('G') + .35); blip(S('G') + SH['G']['v'][0] + 1.6, 1500)
blip(S('M') + .35, 1500, .09)
for k in range(2): blip(S('I') + .95 + k * .09, 2400, .08)
blip(V('D') + 1.0, 1200, .1); blip(V('Kk') + .7, 1200, .1)
# панорамы — воздух
wh = load(lib('sfx-kit/sounds/whooshes/whoosh-slow-soft.wav'))
whf = load(lib('sfx-kit/sounds/whooshes/whoosh-fast-medium.wav'))
put(wh, S('C') + SH['C']['v'][1] - .3, .5); put(wh, S('E') + .5, .45); put(whf, S('I') + .2, .7); put(whf, S('O'), 1.0)

# ===== ШАГИ (мягкие, босиком): глухой удар + скрип половицы =====
def step(tt, g=1):
    n = int(.18 * R); x = np.arange(n) / R
    y = band(n, 60, 400) * np.exp(-x * 30) + tone(n, 70) * np.exp(-x * 25) * .4
    put(y * .22 * g, tt, 1, rng.uniform(-.2, .2))
for k in range(5): step(S('E') + .8 + k * .45, .8)
for k in range(9): step(S('F') + .2 + k * SH['F']['d'] / 9.5)
creak = load(lib('bigsoundbank/3205.flac'))
put(creak[int(.3 * R):int(1.6 * R)] * env(int(1.3 * R), .1, .5) * .25, S('F') + 2.6, 1, .3)
J = SH['J']; step(J['t0'] + J['v'][0] + 1.05, 1.1); step(J['t0'] + J['v'][0] + 2.25, 1.1)
put(creak[int(.4 * R):int(1.4 * R)] * env(int(1.0 * R), .1, .4) * .22, S('N') + .2, 1, -.4)
# холодный сквозняк в коридоре
n = int((S('L') - S('F')) * R); put(band(n, 200, 1200) * env(n, 1.5, 1.5) * .05 * (.6 + .4 * np.sin(np.arange(n) / R * .9)), S('F'), 1, .1)

# ===== СОБАКА: когти по полу у окна, лай =====
for k in range(10): n = int(.03 * R); put(band(n, 2500, 7000) * env(n, .001, .02) * .08, S('D') + .1 + k * .25 + (k % 2) * .06, 1, -.2)
barks = [load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/ANMLDog_DogBark_OS_01.ogg')), load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/ANMLDog_DogBark_OS_02.ogg'))]
for k, a in enumerate([.35, .85, 1.25]): put(barks[k % 2], S('P') + a + .06, 1.1, .05)

# ===== ДЖЕСС: дыхание во сне =====
br = load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/HMNBrth_FemaleBreathing_OS_01.ogg'))
g0 = SH['G']; n = int(g0['d'] * R); put(br[:n] * env(n, .4, .6) * .35, S('G'), 1, -.3)

# ===== СЕРДЦЕ: от I до M, ускоряется; обрыв на «это я» =====
hb = load(lib('bigsoundbank/1930.flac'))
a0, a1 = S('I') + 1.0, V('M') + D['l14'] + .08; n = int((a1 - a0) * R)
h = hb[:n] if len(hb) >= n else np.pad(hb, (0, n - len(hb)))
put(h * np.linspace(.35, .9, n) * env(n, .5, .02), a0, 1)
# «это я»: удар + звон в ушах
boom(V('M') + D['l14'] + .1, 1.2, 45)
n = int(4 * R); x = np.arange(n) / R; put(tone(n, 4100) * np.exp(-x * .7) * .025 * env(n, .05, 1), V('M') + D['l14'] + .1, 1)
# Джесс появляется — тихий высокий кластер
n = int(3 * R); x = np.arange(n) / R
put((tone(n, 1046) + tone(n, 1108) + tone(n, 1567)) * .012 * env(n, 1.2, 1), S('N') + .5, 1)
# конец: сбой, выключение
n_end = S('P') + PEND
put(load(lib('sfx-kit/sounds/digital/digital-interference.wav')), S('P') + .3, .35)
put(load(lib('sfx-kit/sounds/digital/digital-corrupt.wav')), n_end - .1, .8)
n = int(.7 * R); x = np.arange(n) / R; put(np.sin(2 * np.pi * np.cumsum(900 * np.exp(-x * 5) + 40) / R) * env(n, .005, .2) * .12, n_end + .35)
boom(n_end + .4, .8, 38)

# ===== СТРАХ: новые сцены =====
# F2: каждый новый след — тихое ледяное «тшш» и хруст
for k in range(5): n = int(.35 * R); put(band(n, 3000, 9000) * env(n, .01, .3) * .05, S('F2') + .5 + k * (SH['F2']['d'] - .8) / 5, 1, rng.uniform(-.3, .3))
for k in range(6): step(S('F2') + .3 + k * .62, .9)
# G2: она смотрит — резкий удар-стинг + визг струн
boom(S('G2') + .02, 1.3, 50)
n = int(2.2 * R); x = np.arange(n) / R
screech = sum(np.sin(2 * np.pi * np.cumsum(f0 * (1 + .03 * np.sin(x * 37 + f0))) / R) for f0 in (1480, 1568, 1661, 2217)) * np.exp(-x * 1.6) * .03
put(screech + band(n, 2000, 8000) * np.exp(-x * 4) * .08, S('G2') + .02, 1)
# дыхание героя в коридоре — всё чаще к зеркалу
mbr = load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/HMNBrth_MaleBreathing_OS_01.ogg'))
n = int((S('L') - S('F')) * R); mb = np.tile(mbr, n // len(mbr) + 1)[:n]; put(mb * env(n, 2, 1) * .22, S('F'), 1)
n = int((S('M') - S('L') + .8) * R); mb2 = load(lib('meta-open-sound/corpora/oculus-audio-pack/ogg/HMNBrth_MaleBreathing_OS_01.ogg'), 1.25); mb2 = np.tile(mb2, n // len(mb2) + 1)[:n]; put(mb2 * env(n, .3, .4) * .28, S('L'), 1)
# тревога LOW TEMP: двойной писк, мигает 3 раза в секунду
a0 = S('I') + 1.1
for k in range(int((S('M') - a0) * 1.5)):
    tt = a0 + k / 1.5; n = int(.08 * R); put(tone(n, 2900) * env(n, .003, .03) * .06, tt); put(tone(n, 2900) * env(n, .003, .03) * .06, tt + .12)
# пульс-удары снизу (давление) от I до M
for k in range(int((S('M') - S('I')) / .9)): boom(S('I') + .5 + k * .9, .25 + .25 * k / 10, 48)
# финал: LAST RECORDING → TODAY (удар) → «опять рычит»
boom(S('P') + PEND + 2.1, 1.1, 40)
n = int(.6 * R); x = np.arange(n) / R; put(band(n, 300, 6000) * (x / .6) ** 3 * .25, S('P') + PEND + 1.5)
put(growl(3.2, .6, 27), S('P') + PEND + 3.0, 1, .4)

# ===== ГОЛОС =====
fx = {'holod_dan': 'highpass=f=80,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=3:makeup=4',
      'holod_jess': 'highpass=f=150,equalizer=f=4000:t=q:w=1:g=2,acompressor=threshold=-24dB:ratio=3:makeup=5,aecho=0.7:0.6:45|90:0.25|0.12'}
lines = {l['id']: l for l in json.load(open(os.path.join(PRJ, 'vo/lines.json')))['lines']}
vo = np.zeros(N)
for lid, tt in VO:
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PRJ, 'vo/take2' if os.path.exists(os.path.join(PRJ, 'vo/take2', lid + '.wav')) else 'vo/take1', lid + '.wav'), '-af', fx[lines[lid]['role']], '-ac', '1', '-ar', str(R), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(p, np.float32).astype(np.float64); i = int(tt * R); x = x[:N - i]; vo[i:i + len(x)] += x
# фон под голосом приглушить (≈ −9 дБ), голос по центру
w_ = int(.25 * R); cs = np.cumsum(np.concatenate([np.zeros(w_), (np.abs(vo) > .01).astype(float), np.zeros(w_)])); envv = (cs[w_ + w_ // 2:w_ + w_ // 2 + N] - cs[w_ // 2:w_ // 2 + N]) / w_; duck = 1 - .62 * np.clip(envv * 3, 0, 1)
L = L * duck * 1.8 + vo * 1.0; Rr = Rr * duck * 1.8 + vo * 1.0
# проверка баланса: голос громче фона по каждой реплике (цель ≈ +10 дБ)
bg = (L - vo + Rr - vo) / 2
for lid, tt in VO:
    i0 = int(tt * R); i1 = i0 + int(D[lid] * R); seg = vo[i0:i1]; act = np.abs(seg) > .02
    if act.sum() < 100: continue
    rv = np.sqrt(np.mean(seg[act] ** 2)); rb = np.sqrt(np.mean(bg[i0:i1][act] ** 2)) + 1e-9
    print(f'  {lid} {tt:5.1f} с  голос/фон {20 * np.log10(rv / rb):5.1f} дБ')
mx = np.abs(np.stack([L, Rr])).max(); st = np.stack([L, Rr], 1) / mx * .89
st.astype(np.float32).tofile(os.path.join(HERE, 'mix.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(R), '-ac', '2', '-i', os.path.join(HERE, 'mix.f32'), os.path.join(HERE, 'mix.wav')], check=True)
os.remove(os.path.join(HERE, 'mix.f32'))
print('mix.wav', round(TOTAL, 2), 'с')
