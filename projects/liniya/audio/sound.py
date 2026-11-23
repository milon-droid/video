#!/usr/bin/env python3
"""ЛИНИЯ — звук целиком: своё «войлочное» фортепиано и струнные (ля минор, 60 уд/мин = пульс),
писк монитора в тональности, тон остановки сердца → нота струнных, звуки луча (вжик, письмо, нить, перелив),
звонок велосипеда, хлопок зонта, звон кольца; записи: дождь, комната, птицы (Oculus CC BY), ткань, сердце, часы (CC0).
    python3 audio/sound.py    → audio/mix.wav (48 кГц стерео, 52 с)
"""
import numpy as np, subprocess, json, os
from scipy.signal import fftconvolve, lfilter, butter, sosfilt
SR = 48000; DUR = 52.0; N = int(DUR * SR)
ROOT = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(ROOT); REPO = os.path.dirname(os.path.dirname(PRJ))
rng = np.random.default_rng(11)
def db(v): return 10 ** (v / 20)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
LIB = {s['id']: s for s in json.load(open(f'{REPO}/assets/sfx-library/index.json'))}
def lib(name): return load(f"{REPO}/assets/sfx-library/{LIB[name]['file']}")
def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], 'band', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def lpf(x, fc, order=2): return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x, axis=0)
def hpf(x, fc, order=2): return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x, axis=0)
def env_ad(n, a, d=None):
    e = np.ones(n); na = min(n, int(a * SR));
    if na: e[:na] = np.linspace(0, 1, na)
    if d: nd = min(n, int(d * SR)); e[-nd:] *= np.linspace(1, 0, nd)
    return e
def st(x, pan=0.):
    if x.ndim == 2: return x
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.41, x * r * 1.41], 1)
BUS = {k: np.zeros((N, 2)) for k in ['music', 'sfx', 'amb', 'verb']}
def put(bus, x, t, g=0., pan=0., send=0.):
    x = st(x, pan) * db(g); i = int(t * SR)
    if i >= N or i + len(x) <= 0: return
    a = max(0, -i); x = x[a:]; i = max(0, i); n = min(len(x), N - i)
    BUS[bus][i:i + n] += x[:n]
    if send: BUS['verb'][i:i + n] += x[:n] * send
def loop(x, dur):
    n = int(dur * SR); reps = int(np.ceil(n / len(x))) + 1; return np.tile(x, (reps, 1))[:n]
def fadeio(x, a, b):
    n = len(x); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None]
    if nb: x[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return x
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
# ---------------- инструменты
def piano(m, dur=2.5, vel=.6):
    f = mf(m); n = int((dur + .4) * SR); t = np.arange(n) / SR; y = np.zeros(n)
    B = .00035; low = max(.4, min(1.6, 220 / f))
    for k in range(1, 12):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 12000: break
        amp = (1 / k ** 1.15) * np.exp(-k * (.42 - .18 * vel)); tau = (3.2 * low) / (1 + .55 * k)
        for det in (-.0006, .0006):
            y += amp * np.exp(-t / tau) * np.sin(2 * np.pi * fk * (1 + det) * t + rng.random() * 6)
    ham = lpf(rng.standard_normal(int(.012 * SR)), 2500) * .25 * vel; y[:len(ham)] += ham
    y *= env_ad(n, .004); rel = int(.35 * SR); y[int(dur * SR):] *= np.linspace(1, 0, n - int(dur * SR)) if n > int(dur * SR) else 1
    return y * vel * .22
def saw(f, t): return 2 * ((f * t) % 1) - 1
def strings(ms, dur, amp=.1, att=1.4, rel=1.8, bright=1600):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; L = np.zeros(n); R = np.zeros(n)
    for m in ms:
        f = mf(m)
        for j in range(5):
            d = (j - 2) * .0025 + rng.normal(0, .0008); vib = 1 + .0025 * np.sin(2 * np.pi * (4.6 + j * .3) * t + j)
            ph = np.cumsum(f * (1 + d) * vib) / SR; s = 2 * (ph % 1) - 1
            pan = (j - 2) / 2.5; L += s * (1 - pan) * .5; R += s * (1 + pan) * .5
    y = np.stack([L, R], 1); y = lpf(y, bright, 2); y = hpf(y, 90)
    e = env_ad(n, att); e[int(dur * SR):] *= np.linspace(1, 0, n - int(dur * SR)); y *= e[:, None]
    return y * amp / max(1, len(ms)) ** .5
def sine(f, dur, amp=.2, att=.003, rel=.02, h2=0.):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.sin(2 * np.pi * f * t) + h2 * np.sin(4 * np.pi * f * t)
    return y * env_ad(n, att, rel) * amp
def bell(f, dur=1.6, amp=.2, ratios=(1, 2.76, 5.4, 8.93), decays=(1, .6, .35, .2)):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for r, d in zip(ratios, decays): y += np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dur * d * .5)) / r ** .5
    return y * env_ad(n, .002) * amp
def noise(dur): return rng.standard_normal(int(dur * SR))
def whip(dur=.16, f0=300, f1=2600, amp=.25):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur; ph = np.cumsum(f0 * (f1 / f0) ** k) / SR
    y = np.sin(2 * np.pi * ph) * np.sin(np.pi * k) ** .5 + bp(noise(dur), 1500, 7000) * .4 * np.sin(np.pi * k)
    return y * amp
def writing(dur, amp=.08, seed=0):
    """луч пишет: шорох по стеклу люминофора + тонкий «свист» с дрожанием"""
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    mod = np.abs(np.sin(2 * np.pi * (6 + 3 * np.sin(t * 2.1 + seed)) * t)) ** 1.5 * (.6 + .4 * np.sin(t * 13 + seed))
    s = bp(r.standard_normal(n), 2200, 7500) * mod * .7
    f = 1400 + 500 * np.sin(2 * np.pi * 1.7 * t + seed) + 300 * np.sin(2 * np.pi * 5.3 * t)
    s += np.sin(2 * np.pi * np.cumsum(f) / SR) * .12 * mod
    return s * env_ad(n, .03, .08) * amp
def thread(dur, f0=1600, f1=500, amp=.06):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur; f = f0 * (f1 / f0) ** k
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (.7 + .3 * np.sin(2 * np.pi * 9 * t)) + bp(noise(dur), 3000, 8000) * .25
    return y * np.sin(np.pi * k) ** .7 * amp
def shimmer(dur=.7, base=880, amp=.07):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur; y = np.zeros(n)
    for j, r in enumerate([1, 1.5, 2, 3, 4]):
        f = base * r * 2 ** (k * .9); y += np.sin(2 * np.pi * np.cumsum(f) / SR + j) / (j + 1)
    return y * np.sin(np.pi * k) ** 1.3 * amp
def crackle(dur, rate=14, amp=.05):
    n = int(dur * SR); y = np.zeros(n); idx = rng.integers(0, n, int(rate * dur)); y[idx] = rng.standard_normal(len(idx)) * rng.random(len(idx)) ** 3
    y = bp(y, 900, 6000) * 4 + lpf(rng.standard_normal(n), 300) * .02
    return y * amp
# ================= МУЗЫКА =================
Am = [45, 52, 57, 60, 64]; Fm = [41, 48, 53, 57, 60]; Cm = [48, 55, 60, 64, 67]; Gm = [43, 50, 55, 59, 62]; AM = [45, 52, 57, 61, 64]
def chordtones(c): return c[1:]
# интро 4.0–9.3: одиночные ноты на каждый удар сердца
for i, m in enumerate([57, 64, 60, 64, 57, 65, 60, 65]):
    t = 4.0 + i * .66
    if t < 9.2: put('music', piano(m, 2.2, .38 + .04 * (i % 2)), t, pan=-.2 + .1 * (i % 3), send=.5)
put('music', strings([45, 57], 4.6, .05, att=2.5, rel=1.5), 5.0, send=.4)
# воспоминания 9.3–23.5: Am F C G по 2 с, арпеджио + мелодия + струнные
prog = [Am, Fm, Cm, Gm, Am, Fm, Cm, Gm]
mel = [[76, 74], [72, 69], [67, 72], [71, 74], [76, 79], [77, 76], [72, 76], [74, 71]]
for b, ch in enumerate(prog[:7]):
    t0 = 9.6 + b * 2.0
    put('music', piano(ch[0] - 12 + 12, 2.0, .45), t0, pan=-.3, send=.35)
    arp = [ch[1], ch[2], ch[3], ch[4], ch[3], ch[2]]
    for j, m in enumerate(arp): put('music', piano(m + 12 * (j in (3,)), 1.2, .3 + .05 * (j == 0)), t0 + j * .333, pan=.25 - .1 * (j % 3), send=.45)
    if b >= 1:
        for j, m in enumerate(mel[b]): put('music', piano(m, 1.6, .5), t0 + j * 1.0, pan=.1, send=.55)
    put('music', strings(chordtones(ch)[:3], 2.0, .07 + .012 * b, att=.9, rel=1.2), t0, send=.5)
# скамейка 23.5–27: нежно, медленно
for i, m in enumerate([64, 60, 57, 60, 65, 60, 57, 53]):
    put('music', piano(m, 1.8, .34), 23.7 + i * .45, pan=-.1, send=.6)
put('music', strings([57, 60, 64], 3.0, .06, att=1.0, rel=1.4), 23.6, send=.5)
# палата-2 27.6–38: редкие ноты, нарастание к касанию рук (34.8)
for i, (m, t) in enumerate([(57, 28.2), (64, 29.2), (60, 30.2), (65, 31.2), (60, 32.2), (64, 33.0), (67, 33.6), (72, 34.2)]):
    put('music', piano(m, 2.4, .36 + .03 * i), t, pan=.15 * (-1) ** i, send=.6)
put('music', strings([45, 57, 60], 5.2, .05, att=2.5, rel=1.0), 28.0, send=.5)
put('music', strings([48, 55, 64], 2.0, .07, att=1.2, rel=.8), 32.6, send=.5)
put('music', strings([41, 53, 57, 60, 67], 3.6, .13, att=.9, rel=2.6), 34.6, send=.7)     # касание: Fadd9
for m, dt in [(69, 0), (72, .35), (76, .7), (79, 1.05)]: put('music', piano(m, 2.5, .42), 34.75 + dt, pan=.2, send=.7)
put('music', strings([33, 45], 4.0, .05, att=1.5, rel=2.0), 37.6, send=.4)               # пустота перед ударом
# финал 41.4–52: тон остановки (ля) перетекает в струнные, F C G → A мажор
put('music', strings([57, 69], 3.5, .07, att=2.0, rel=.6), 42.2, send=.5)
for t0, ch, d in [(44.0, Fm, 2.0), (46.0, Cm, 2.0), (48.0, Gm, 2.0), (50.0, AM, 2.0)]:
    put('music', strings(chordtones(ch), d, .1, att=.8 if t0 > 44 else 1.4, rel=1.6), t0, send=.6)
    put('music', piano(ch[0], 2.2, .4), t0, pan=-.3, send=.5)
for m, t in [(72, 44.5), (69, 45.3), (72, 46.5), (76, 47.3), (74, 48.5), (71, 49.3), (73, 50.1), (76, 50.5), (81, 50.9)]:
    put('music', piano(m, 2.2, .44), t, pan=.15, send=.6)
# ================= ЗВУКИ =================
# хук: писк, тон остановки, тревога, обрыв
put('sfx', sine(880, .14, .32, rel=.03, h2=.08), 0.0)
put('sfx', sine(880, .95 - .30, .3, att=.01, rel=.004, h2=.08), 0.30)          # тон остановки, обрыв на 0.95
for k in range(2): put('sfx', sine(988, .09, .12) + 0, 0.42 + k * .25, pan=.3)  # тревога
put('sfx', whip(.18, 260, 2400, .28), 0.93)
put('sfx', writing(1.62 - 1.0, .11, 1), 1.0)
put('sfx', sine(1760, .05, .05), 2.1, pan=.4, send=.4); put('sfx', sine(2093, .05, .04), 2.22, pan=.4, send=.4)  # любопытный «бип-бип»
put('sfx', lib('whoosh-slow-soft'), 3.0, g=-8)
put('sfx', thread(2.4, 1500, 420, .07), 3.25, pan=-.2, send=.3)
put('sfx', bell(2637, .5, .06, (1, 2.4), (1, .4)), 5.68, send=.4)               # «тинь» о руку
put('sfx', shimmer(.7, 660, .05), 5.7, send=.4)
put('sfx', writing(1.5, .08, 2), 6.4, pan=.1)
put('sfx', thread(.7, 900, 1800, .05), 7.9)
put('sfx', lib('reverse-whoosh-long-soft'), 9.3 - 1.35, g=-6, send=.3)
put('sfx', shimmer(.8, 440, .07), 9.3, send=.5)
# воспоминания: плёнка
put('amb', np.stack([crackle(18.3), crackle(18.3)], 1), 9.3, g=-4)
# велосипед: цепь, звонок
for i in range(int(3.4 / .085)):
    tt = 10.0 + i * .085 * (1 + max(0, (i * .085 - 2.3)) * .8)
    if tt < 13.4: put('sfx', bp(noise(.012), 2500, 7000) * .06 * env_ad(int(.012 * SR), .001, .006), tt, pan=-.2)
for k in range(2): put('sfx', bell(2350, 1.1, .16), 11.2 + k * .16, pan=-.1, send=.35)
put('sfx', lpf(noise(.25), 900) * .08 * env_ad(int(.25 * SR), .01, .2), 13.3)        # тормоз
# дождь в воспоминаниях
rain = lib('oc-RAINInt_ForestCabinRain_LOOP_01')
put('amb', fadeio(loop(rain, 5.0), 1.2, .7), 12.3, g=-6)
# зонт: хлопок
put('sfx', lpf(noise(.07), 1600) * .5 * env_ad(int(.07 * SR), .002, .05) + 0, 14.9, send=.2)
put('sfx', sine(95, .12, .35, rel=.1), 14.9)
put('sfx', bp(noise(2.0), 500, 3000) * .03, 15.0, pan=.2)                               # капли по зонту
for i in range(26): put('sfx', bp(noise(.01), 1200, 5000) * .12 * env_ad(int(.01 * SR), .001, .008), 15.0 + rng.random() * 2.0, pan=rng.uniform(-.5, .5))
# переходы-морфинги
for t in (13.6, 17.0, 20.0, 23.5): put('sfx', shimmer(.65, 523, .045), t, send=.6); put('sfx', lib('whoosh-slow-soft'), t - .1, g=-14)
# кольцо
put('sfx', bell(1976, 2.4, .1, (1, 2.0, 3.01, 4.1), (1, .7, .5, .3)), 18.4, send=.6)
for j, f in enumerate([3136, 3951, 4699]): put('sfx', bell(f, 1.2, .04, (1, 2.4), (1, .4)), 18.9 + j * .07, pan=.3, send=.7)
# годы тикают
clock = lib('time-clock-fast'); put('sfx', fadeio(clock[:int(1.1 * SR)].copy(), .05, .2), 21.0, g=-10)
# шаги уходящего сына
for i in range(6): put('sfx', lpf(noise(.05), 500) * .12 * env_ad(int(.05 * SR), .003, .04), 22.3 + i * .19, pan=.1 + i * .1)
# скамейка: ветер и листья
put('amb', np.stack([lpf(noise(4.0), 500), lpf(noise(4.0), 500)], 1) * .05 * env_ad(int(4 * SR), 1.0, 1.0)[:, None], 23.5)
put('sfx', bp(noise(2.0), 1500, 6000) * .015, 24.2, pan=.4)
# перемотка назад, выход из глаза
put('sfx', lib('reverse-whoosh-long-soft'), 26.4, g=-5, send=.3)
put('sfx', thread(.9, 400, 2200, .06), 26.7)
put('sfx', whip(.25, 2200, 300, .16), 27.6)
# палата-2
put('sfx', bp(noise(1.0), 300, 1200) * .03 * env_ad(SR, .4, .5), 29.2, pan=-.3)       # запотевание (выдох)
put('sfx', writing(3.2, .07, 3), 29.9, pan=-.3, send=.2)
fab = lib('foley-fabric-slide'); fab2 = lib('foley-fabric-touch')
put('sfx', fab, 33.6, g=-6); put('sfx', fab, 34.3, g=-4, pan=-.1); put('sfx', fab2, 34.85, g=-5)
put('sfx', bell(880, 2.5, .05, (1, 2, 3), (1, .6, .4)), 34.85, send=.6)
put('sfx', thread(2.0, 700, 1300, .05), 35.6, send=.3)
put('sfx', lib('whoosh-slow-soft'), 38.1, g=-10)
# последний удар — сердце
hb = lib('bsb-heartbeat-slow'); put('sfx', fadeio(hb[:int(.9 * SR)].copy(), .005, .2), 39.75, g=-3)
put('sfx', sine(880, .22, .2, rel=.12, h2=.05), 39.95, send=.6)
put('music', piano(57, 3.0, .4), 39.95, send=.6)
# тон остановки — мягкий, в тональности; переходит в струнные
tone = sine(880, 3.4, .1, att=.25, rel=1.6, h2=.02) + sine(440, 3.4, .06, att=.25, rel=1.6)
put('sfx', tone, 41.4, send=.5)
put('sfx', lib('whoosh-slow-soft'), 41.9, g=-14)
# птицы на рассвете
birds = lib('oc-AMBForst_ForestBirds_OS_01'); put('amb', fadeio(loop(birds, 7.0), 2.0, .1), 45.0, g=-10)
put('sfx', writing(1.6, .06, 4), 47.0, send=.3)
# ---- атмосфера палаты: дождь за стеклом + тон комнаты
roomt = lib('oc-AMBHome_RoomTone_LOOP_01')
rain_in = lpf(rain, 1800)
put('amb', fadeio(loop(rain_in, 6.5), 1.2, .4), 2.9, g=-12); put('amb', fadeio(loop(roomt, 6.5), 1.0, .4), 2.9, g=-14)
put('amb', fadeio(loop(rain_in, 16.4), .3, 3.0), 27.6, g=-12); put('amb', fadeio(loop(roomt, 18.0), .3, 3.0), 27.6, g=-14)
put('amb', fadeio(loop(roomt, 3.0), .02, 2.0), 0.0, g=-20)   # чтобы хук не был в цифровой тишине
# ================= сведение =================
def reverb(x, sec=3.2, pre=.025):
    n = int(sec * SR); t = np.arange(n) / SR; ir = np.zeros((n + int(pre * SR), 2))
    for c in range(2): ir[int(pre * SR):, c] = rng.standard_normal(n) * np.exp(-t / (sec / 6.9)) * (1 + .3 * np.sin(t * 7 + c))
    ir[:, 0] = lpf(ir[:, 0], 6000); ir[:, 1] = lpf(ir[:, 1], 5500); ir /= np.sqrt((ir ** 2).sum(0))
    return np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
mus = BUS['music']; verb = reverb(BUS['verb'] + mus * .25)
mix = mus * 1.0 + verb * .9 + BUS['sfx'] * 1.0 + BUS['amb'] * 1.0
# мягкий общий хвост
fo = int(.9 * SR); mix[-fo:] *= np.linspace(1, .15, fo)[:, None]
mix /= max(1e-6, np.abs(mix).max()) / .7
import wave
out = f'{ROOT}/mix.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('ok', out, f'{len(mix) / SR:.2f} c')
