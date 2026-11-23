#!/usr/bin/env python3
"""МАЯК — звук целиком: своя музыка (шторм: барабаны и низкие струнные → «перекличка» калимбы светлячков →
хор и оркестр на луче → тихий рассвет), шторм из реальных записей, шорохи бумаги, гудок корабля.
    python3 audio/sound.py  → audio/mix.wav (48 кГц, 60 с)
"""
import numpy as np, subprocess, json, os
from scipy.signal import fftconvolve, lfilter, butter, sosfilt
SR = 48000; DUR = 60.0; N = int(DUR * SR)
ROOT = os.path.dirname(os.path.abspath(__file__)); PRJ = os.path.dirname(ROOT); REPO = os.path.dirname(os.path.dirname(PRJ))
rng = np.random.default_rng(23)
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
def loc(name): return load(f'{PRJ}/assets/sfx/{name}')
def noise(dur): return rng.standard_normal(int(dur * SR))
def seg_(x, a, b): return x[int(a * SR):int(b * SR)].copy()
# ---------------- инструменты (новые для этого ролика)
def kalimba(m, dur=2.2, vel=.6):
    f = mf(m); n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / .9) + .35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / .35) \
        + .22 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .07) + .1 * np.sin(2 * np.pi * f * 8.9 * t) * np.exp(-t / .03)
    y[:int(.004 * SR)] *= np.linspace(0, 1, int(.004 * SR)); clk = hpf(rng.standard_normal(int(.006 * SR)), 3000) * .15; y[:len(clk)] += clk
    return y * vel * .3
def bellm(m, dur=4.0, amp=.2):
    f = mf(m); n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for r, a, d in [(.5, .4, 2.5), (1, 1, 2.2), (1.19, .5, 1.6), (1.56, .35, 1.2), (2, .45, 1.0), (2.74, .3, .7), (3.76, .18, .45), (5.4, .1, .25)]:
        y += a * np.sin(2 * np.pi * f * r * t + rng.random() * 6) * np.exp(-t / d)
    y[:200] *= np.linspace(0, 1, 200); return y * amp * .25
def choir(ms, dur, amp=.1, att=1.5, rel=2.0, vowel=(800, 1150, 2900)):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; src = np.zeros((n, 2))
    for m in ms:
        f = mf(m)
        for j in range(4):
            vib = 1 + .006 * np.sin(2 * np.pi * (5 + j * .37) * t + j * 2); ph = np.cumsum(f * (1 + (j - 1.5) * .004) * vib) / SR
            s_ = 2 * (ph % 1) - 1; pan = (j - 1.5) / 2; src[:, 0] += s_ * (1 - pan) * .5; src[:, 1] += s_ * (1 + pan) * .5
    y = sum(bp(src, fo * .85, fo * 1.15) * g for fo, g in zip(vowel, (1, .6, .25)))
    e = env_ad(n, att); e[int(dur * SR):] *= np.linspace(1, 0, n - int(dur * SR)); return y * e[:, None] * amp * 3 / max(1, len(ms)) ** .5
def tremolo(ms, dur, amp=.08, att=.8, rel=1.2, rate=11):
    y = strings(ms, dur, 1.0, att, rel, 2400); t = np.arange(len(y)) / SR; return y * (.55 + .45 * np.abs(np.sin(np.pi * rate * t)))[:, None] * amp
def taiko(amp=.5, f0=130, f1=48, dec=.45):
    n = int(1.4 * SR); t = np.arange(n) / SR; fr = f1 + (f0 - f1) * np.exp(-t / .05); y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / dec)
    y += lpf(rng.standard_normal(n), 900) * np.exp(-t / .03) * .5; return y * amp
def boom(amp=.6, dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR; fr = 30 + 60 * np.exp(-t / .15); y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 1.0)
    y += lpf(rng.standard_normal(n), 400) * np.exp(-t / .4) * .6; return y * amp
def riser(dur, amp=.12, f0=300, f1=5000):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur; x = rng.standard_normal(n); y = np.zeros(n)
    for i in range(0, n, 2400):  # полосовой шум со скользящей частотой (кусками)
        fc = f0 * (f1 / f0) ** (i / n); y[i:i + 2400] = bp(x[i:i + 2400 + 2400], fc * .8, min(fc * 1.25, 20000))[:len(y[i:i + 2400])]
    return y * k ** 2 * amp
def brass(ms, dur, amp=.08, att=.25, rel=1.0):
    n = int((dur + rel) * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in ms:
        for j in range(3): y += saw(mf(m) * (1 + (j - 1) * .003), t)
    env = env_ad(n, att); env[int(dur * SR):] *= np.linspace(1, 0, n - int(dur * SR))
    # фильтр «раскрывается» по огибающей: две полосы смешиваем
    y = lpf(y, 900) * (1 - .5 * env) + lpf(y, 2600) * .5 * env; return st(y * env * amp / max(1, len(ms)) ** .5)
def hum(dur, amp=.06, f=100):  # гул лампы
    n = int(dur * SR); t = np.arange(n) / SR; y = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3, 5, 7)); return y * amp
def crackle(dur, amp=.2, rate=40):
    n = int(dur * SR); y = np.zeros(n)
    for _ in range(int(rate * dur)):
        i = rng.integers(0, max(1, n - 800)); l = rng.integers(40, 600); y[i:i + l] += hpf(rng.standard_normal(l), 1500) * rng.random() * np.exp(-np.arange(l) / (l / 4))
    return y * amp
def flutter(dur, amp=.05, rate=70, fc=220):  # крылья светлячка
    n = int(dur * SR); t = np.arange(n) / SR; return bp(rng.standard_normal(n), fc, fc * 6) * (.5 + .5 * np.sin(2 * np.pi * rate * t)) * amp * env_ad(n, .1, .2)
def puff(dur=.4, amp=.2):  # задули свечу
    n = int(dur * SR); return bp(rng.standard_normal(n), 300, 2500) * env_ad(n, .03, dur * .8) * amp
def curve(pts):  # огибающая громкости по ключам (время, дБ) → массив N
    tt = np.arange(N) / SR; return db(np.interp(tt, [p[0] for p in pts], [p[1] for p in pts]))
# ================================================================ МУЗЫКА
# Хук: гул лампы с миганием → тишина
FLASHES = [1.45, 2.55, 4.7, 6.35, 9.9, 13.6, 18.4, 20.6, 25.2, 31.2]
# 1) шторм 2.2–21: низкий бурдон ре минор + барабаны на смене планов + тремоло струн нарастает
put('music', strings([38, 45], 19.5, .16, 1.5, 2.5, 700), 2.0, send=.2)
put('music', strings([50, 53, 57], 8.0, .07, 3.0, 2.0, 1100), 6.0, send=.4)
for tt, a in [(2.2, .55), (6.0, .4), (8.6, .35), (11.4, .5), (12.75, .6), (14.4, .45), (17.6, .5)]:
    put('music', taiko(a), tt, send=.25)
for i, tt in enumerate(np.arange(11.4, 20.6, .75)):  # тревожный пульс
    put('music', taiko(.18 + .02 * i, 110, 60, .25), tt, pan=(-.3 if i % 2 else .3), send=.2)
put('music', tremolo([50, 53, 58], 3.2, .06), 11.4, send=.3)     # Dm → B♭
put('music', tremolo([50, 55, 58], 3.2, .07), 14.4, send=.3)     # Gm
put('music', tremolo([49, 52, 57], 3.4, .08, rel=2.5), 17.6, send=.3)  # A (доминанта, без разрешения)
put('music', strings([81], 4.2, .035, 1.0, 1.5, 3000), 20.8, send=.6)  # одинокая высокая нота — пауза перед светлячком
# 2) светлячок: два мигания = две ноты калимбы (позывной A5–E6)
for tt, m in [(22.8, 81), (23.1, 88)]: put('music', kalimba(m, 2.5, .7), tt, send=.6)
# 3) сигнал фонариком: 3 вспышки = D5 F#5 A5; ответы с луга — те же ноты выше и дальше
for tt, m in [(24.9, 74), (25.35, 78), (25.8, 81)]: put('music', kalimba(m, 2.0, .65), tt, pan=.25, send=.4)
for tt, m, p in [(26.6, 86, -.4), (27.05, 90, .5), (27.15, 93, -.6), (27.35, 86, .3), (27.4, 81, -.2), (27.5, 90, .6)]: put('music', kalimba(m, 2.5, .45), tt, pan=p, send=.7)
# 4) луг отвечает: каскад калимбы (ре мажор пентатоника), плотность растёт; хор и струны вступают
pent = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95]
for i in range(150):
    tt = 27.6 + (i / 150) ** .8 * 6.4 + rng.random() * .08; m = pent[rng.integers(0, len(pent))]
    put('music', kalimba(m, 1.6, .11 + .17 * rng.random()), tt, pan=rng.uniform(-.8, .8), send=.7)
put('music', choir([62, 66, 69], 6.4, .05, 2.5, 2.5), 27.8, send=.6)
put('music', strings([50, 57, 62, 66], 6.4, .08, 2.5, 1.0, 1600), 27.6, send=.4)
put('music', strings([43, 55, 62, 71], 3.4, .1, .8, 1.0, 2000), 30.6, send=.4)   # G
put('music', choir([67, 71, 74], 3.4, .06, .8, 1.0), 30.6, send=.6)
put('music', strings([45, 57, 64, 73], 3.0, .12, .5, .6, 2400), 34.0, send=.4)  # A — к кульминации
put('music', riser(2.4, .16), 34.0)
# 5) кольца линзы: 7 колоколов вверх, удар на полном свете
for i, m in enumerate([62, 66, 69, 74, 78, 81, 86]): put('music', bellm(m, 3.5, .22), 35.0 + i * .18, pan=(i - 3) * .12, send=.6)
put('music', boom(.75), 36.4); put('music', taiko(.8, 150, 40, .7), 36.4, send=.3)
# 6) луч и спасение: тема в полный рост D – Bm – G – A | G – A – D
prog = [(37.0, [38, 50, 57, 62, 66]), (39.35, [47, 50, 59, 62, 66]), (41.7, [43, 55, 59, 62, 67]), (44.05, [45, 52, 57, 61, 64])]
for tt, ch in prog:
    put('music', strings(ch, 2.45, .27, .3, 1.2, 2600), tt, send=.4); put('music', brass(ch[1:4], 2.3, .07, .2, .8), tt, send=.35)
    put('music', choir(ch[2:], 2.4, .05, .4, 1.2), tt, send=.6)
    for b in range(4): put('music', taiko(.6 if b == 0 else .32, 120, 50, .35), tt + b * .59, send=.2)
mel = [(37.0, 74, 1.2), (38.2, 78, .6), (38.8, 81, 1.0), (39.35, 83, 1.2), (40.55, 81, .6), (41.15, 78, .6), (41.7, 79, 1.2), (42.9, 78, .6), (43.5, 76, .6), (44.05, 76, 1.2), (45.25, 73, .6), (45.85, 74, 2.0)]
for tt, m, d in mel: put('music', strings([m], d, .06, .06, .5, 3500), tt, send=.5); put('music', kalimba(m + 12, 1.5, .35), tt, send=.5)
put('music', strings([38, 50, 57, 62, 66, 69], 3.0, .22, .2, 2.0, 2400), 46.4, send=.5); put('music', taiko(.6), 46.4, send=.3)
put('music', brass([62, 66, 69], 2.0, .07, .15, 1.2), 46.4, send=.4)
# 7) рассвет: тихо — калимба темы + тёплый хор; финальный позывной и аккорд
put('music', choir([62, 66, 69, 76], 11.0, .035, 2.5, 3.0, (650, 1100, 2700)), 48.6, send=.7)
put('music', strings([38, 50, 57], 11.0, .06, 2.5, 3.0, 900), 48.6, send=.4)
dawn = [(49.3, 74), (49.9, 78), (50.5, 81), (51.7, 83), (52.3, 81), (53.0, 78), (54.2, 79), (54.8, 78), (55.4, 76)]
for tt, m in dawn: put('music', kalimba(m, 2.4, .4), tt, send=.6)
for tt, m in [(56.9, 81), (57.35, 88)]: put('music', kalimba(m, 2.8, .65), tt, send=.7)
put('music', strings([50, 57, 62, 66, 69, 76], 3.0, .09, 1.0, 1.2, 2000), 58.4, send=.6)
put('music', kalimba(86, 3.0, .35), 58.4, send=.8); put('music', kalimba(74, 3.0, .3), 58.45, send=.8)
# ================================================================ ШУМЫ
# хук: гул лампы мигает в такт картинке, хлоп, осколки
hm = hum(.9, .08); tt_ = np.arange(len(hm)) / SR
gate = np.where(tt_ > .55, (np.floor(tt_ * 24) % 3 != 1).astype(float) * .9 + .1, .6 + .4 * np.abs(np.sin(tt_ * 31) * np.sin(tt_ * 13.7)))
put('sfx', hm * gate, 0.0); put('sfx', crackle(.85, .05, 20), 0.0)
put('sfx', lib('oc-GLASBrk_WindowPaneSmallBreak_OS_01'), .85, g=0, send=.3); put('sfx', lib('pop-small-bubble') if 'pop-small-bubble' in LIB else noise(.01), .85, g=6)
put('sfx', boom(.4, 1.5), .85)
pc = loc('paper_crumple.mp3'); put('sfx', seg_(pc, 0, 1.2), .9, g=-4, pan=.2)
# надписи: бумажный «шлёп»
pf = loc('paper_flap.mp3')
def paper_snap(t, g=-6, k=0):
    i = [1.0, 6.3, 11.2, 18.0, 26.0, 33.5][k % 6]; put('sfx', fadeio(seg_(pf, i, i + .35), .002, .15), t, g=g, pan=.1)
for k, tt in enumerate([1.0, 3.4, 9.3, 13.5, 19.5, 38.6, 58.4]): paper_snap(tt, -8, k)
# громы на вспышках (большой — на 2.55)
th_b, th_m = lib('cinematic-thunder-big'), lib('cinematic-thunder-massive')
for tt in FLASHES:
    big = tt in (2.55, 25.2); x = th_m if big else th_b; put('sfx', x, tt + .05, g=(-2 if big else -9), send=.2)
# корабельный гудок вдали
hn = loc('horn.mp3'); put('sfx', lpf(fadeio(seg_(hn, 0, 3.0), .05, 1.0), 1500), 4.0, g=-6, pan=-.5, send=.5)
# подзорная труба
put('sfx', lib('click-latch-firm'), 7.35, g=-6); put('sfx', lib('foley-wood-slide') if 'foley-wood-slide' in LIB else noise(.01), 7.1, g=-8)
# бег по железному полу к рубильнику
steps = [lib(f'oc-FEETHmn_ShoeMetalRun_OS_0{i}') for i in range(1, 6)]
for i, tt in enumerate(np.arange(11.45, 12.2, .21)): put('sfx', steps[i % 5], tt, g=-8, pan=-.2 + i * .1)
put('sfx', lib('mechanical-latch-heavy'), 12.5, g=-4)
put('sfx', lib('cinematic-metal-big'), 12.75, g=-10, send=.2); put('sfx', crackle(.7, .25, 70), 12.75, send=.2); put('sfx', hum(.3, .05, 120) * env_ad(int(.3 * SR), .01, .25), 12.75)
# свеча: огонёк, порыв, «фу», дым
wd = loc('wind.mp3')
put('sfx', fadeio(seg_(wd, 6, 7.5), .4, .5), 15.5, g=-2, pan=-.4, send=.2); put('sfx', fadeio(seg_(pf, 40, 41.0), .05, .3), 15.8, g=-6)
put('sfx', puff(.45, .25), 16.1)
# фонарик: щелчок, мигание батареек
fo_ = loc('flash_on.mp3'); foo = loc('flash_onoff.mp3')
put('sfx', fo_, 17.85, g=-2)
for tt in [19.15, 19.3, 19.5, 19.62]: put('sfx', fo_, tt, g=-8)
# светлячок: шорох крыльев, посадка
put('sfx', flutter(1.25, .05), 21.0, pan=-.3); put('sfx', lib('click-clip-soft'), 22.2, g=-12)
for tt in [24.9, 25.35, 25.8]: put('sfx', fo_, tt - .02, g=-5)
# луг: подъём роя
put('sfx', lib('shimmer-long-sparkle'), 29.0, g=-8, send=.5); put('sfx', lib('whoosh-medium-soft'), 29.3, g=-10)
put('sfx', flutter(6.0, .03, 90, 300), 28.6, send=.4); put('sfx', lib('shimmer-long-soft'), 31.0, g=-10, send=.6)
put('sfx', flutter(2.4, .035, 90, 300), 34.0, pan=-.5, send=.4)
# луч: «вум»
put('sfx', lib('whoosh-medium-hard'), 36.95, g=-4); put('sfx', boom(.35, 2.0), 37.0); put('sfx', lib('cinematic-metal-big'), 38.4, g=-14, send=.3)
# штурвал: скрип дерева, корабль кренится
cr = lib('oc-WOODFric_CreaksCreepy_OS_01'); cr2 = lib('oc-WOODFric_CreaksCreepy_OS_02')
put('sfx', cr, 41.1, g=-6); put('sfx', cr2, 42.1, g=-6); put('sfx', cr, 43.6, g=-8, pan=.3)
# волны о скалы, бумажный разворот корабля, два гудка «спасибо»
sp = lib('props-splash')
for tt in [43.5, 44.3, 45.1, 45.9]: put('sfx', sp, tt, g=-6, pan=-.5, send=.3)
put('sfx', fadeio(seg_(pf, 12.0, 13.2), .05, .3), 44.0, g=-4)
fh = loc('foghorn.mp3'); put('sfx', fadeio(seg_(fh, 0, 1.0), .03, .3), 45.2, g=-6, send=.5); put('sfx', fadeio(seg_(fh, 0, 1.6), .03, .6), 45.85, g=-6, send=.5)
# прыжки: два приземления
land = [lib('oc-FEETHmn_ShoeMetalLand_OS_01'), lib('oc-FEETHmn_ShoeMetalLand_OS_02')]
put('sfx', land[0], 47.25, g=-4); put('sfx', land[1], 47.9, g=-4)
# рассвет → шаги, объятие
walk = [lib(f'oc-FEETHmn_ShoeMetalWalk_OS_0{i}') for i in range(1, 6)]
for i, tt in enumerate(np.arange(53.0, 54.0, .2)): put('sfx', walk[i % 5], tt, g=-12, pan=-.4 + i * .1)
pr = loc('paper_rustle.mp3'); put('sfx', fadeio(seg_(pr, 3, 4.2), .05, .5), 54.1, g=-8)
put('sfx', flutter(1.4, .04), 58.1, pan=.3)
# ================================================================ АТМОСФЕРА
INT = [(0, 2.2), (6.0, 8.6), (11.4, 17.6), (34.0, 37.0), (46.4, 48.6), (53.0, 56.0)]
def is_int(tt): return any(a <= tt < b for a, b in INT)
rain = loop(lib('oc-RAIN_CityRain_LOOP_01'), DUR); rain_in = lpf(rain, 1300)
sea = loop(lib('oc-WATRWave_OceanWaves_LOOP_01'), DUR); wind = loop(loc('wind.mp3'), DUR)
tt = np.arange(N) / SR; ins = np.array([is_int(x) for x in tt[::480]]).astype(float); ins = np.repeat(ins, 480)[:N]
k = int(.08 * SR); ins = np.convolve(ins, np.ones(k) / k, 'same')  # плавные переходы на склейках
storm = curve([(0, 0), (46.0, 0), (48.6, -30), (60, -60)])
BUS['amb'] += rain * (db(-6) * (1 - ins) * storm)[:, None] + rain_in * (db(-9) * ins * storm)[:, None]
BUS['amb'] += sea * (db(-8) * (1 - ins) * storm)[:, None] + lpf(sea, 600) * (db(-16) * ins * storm)[:, None]
BUS['amb'] += wind * (db(-12) * storm)[:, None] * (1 - .6 * ins)[:, None]
# в паузе перед светлячком — дождь тише, чтобы «слышно» было мигание
BUS['amb'] *= curve([(0, 0), (21.0, 0), (21.6, -6), (24.4, -6), (25.0, 0), (60, 0)])[:, None]
calm = loop(lib('oc-AMBSea_BeachWavesStonesBirds_LOOP_01'), 12.0); put('amb', fadeio(calm, 1.5, .1), 48.0, g=-10)
chimes = loop(lib('oc-MUSCChim_WindChimes_LOOP_01'), 11.0); put('amb', fadeio(chimes, 2.5, .1), 49.0, g=-22)
room = loop(lib('oc-AMBHome_RoomTone_LOOP_01'), DUR); BUS['amb'] += room * (db(-26) * np.ones(N))[:, None]
# ================================================================ СВЕДЕНИЕ
def reverb(x, sec=3.0, pre=.03):
    n = int(sec * SR); t = np.arange(n) / SR; ir = np.zeros((n + int(pre * SR), 2))
    for c in range(2): ir[int(pre * SR):, c] = rng.standard_normal(n) * np.exp(-t / (sec / 6.9))
    ir[:, 0] = lpf(ir[:, 0], 6000); ir[:, 1] = lpf(ir[:, 1], 5500); ir /= np.sqrt((ir ** 2).sum(0))
    return np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
mus = BUS['music']; verb = reverb(BUS['verb'] + mus * .2)
mix = mus * 1.0 + verb * .8 + BUS['sfx'] * 1.0 + BUS['amb'] * .9
mix = hpf(mix, 30)
mix /= max(1e-6, np.abs(mix).max()) / .8
import wave
out = f'{ROOT}/mix.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('ok', out, f'{len(mix) / SR:.2f} c')
