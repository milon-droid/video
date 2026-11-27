#!/usr/bin/env python3
"""SNOW GLOBE — звук. Музыка синтезом: стеклянная гармоника (трение по бокалам: чистые парциалы, медленная атака,
вибрато, шорох трения) + челеста (молоточек по пластине: негармонические парциалы, быстрый спад) + низкий пад.
Плюс живые записи CC0 (Freesound: вода, стекло, коробка, дверь, налив) и sfx-kit/BigSoundBank (CC0).
python3 projects/globus/audio/score.py → projects/globus/audio/mix.wav"""
import numpy as np, wave, os, subprocess, json
SR = 48000; DUR = 44.2
ROOT = os.path.dirname(os.path.abspath(__file__)); AU = os.path.join(ROOT, '../assets/audio'); LIB = os.path.join(ROOT, '../../../assets/sfx-library')
rng = np.random.default_rng(11)
N = int(SR * (DUR + 2)); L = np.zeros(N); R = np.zeros(N); RV = np.zeros(N)
def tt(d): return np.arange(int(SR * d)) / SR
def add(sig, t, g=1., pan=0., rev=0.):
    i = int(t * SR); sig = np.asarray(sig, float) * g
    if i < 0: sig = sig[-i:]; i = 0
    if i >= N: return
    n = min(len(sig), N - i); s = sig[:n]
    L[i:i+n] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+n] += s * np.sqrt((1 + pan) / 2) * 1.414
    if rev: RV[i:i+n] += s * rev
def fftfilt(x, lo=0, hi=SR / 2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo > 0: m *= np.clip((f - lo * .75) / (lo * .5), 0, 1)
    if hi < SR / 2: m *= np.clip((hi * 1.25 - f) / (hi * .5), 0, 1)
    return np.fft.irfft(X * m, len(x))
def load(path, a=0, b=None, norm=True):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout, np.int16) / 32768.
    x = x[int(a * SR): int(b * SR) if b else None].copy()
    if norm and np.abs(x).max() > 0: x /= np.abs(x).max()
    f = min(len(x) // 4, int(.02 * SR)); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); return x
IDX = {d['id']: d for d in json.load(open(os.path.join(LIB, 'index.json')))}
def lib(i, **k): return load(os.path.join(LIB, IDX[i]['file']), **k)
def au(name, **k): return load(os.path.join(AU, name), **k)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- инструменты
def armonica(m, d, g=1., att=.35):
    t = tt(d); f = hz(m); vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .8)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + .28 * np.sin(2 * ph) + .08 * np.sin(3 * ph + .5)
    env = np.minimum(1, t / att) * np.minimum(1, (d - t) / .6).clip(0)
    rub = fftfilt(rng.standard_normal(len(t)), f * .9, f * 1.2) * .05 * env  # шорох мокрого пальца по стеклу
    return (x * env * .3 + rub) * g
def celesta(m, d=2.2, g=1.):
    t = tt(d); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .9) + .35 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t / .12) + .15 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .25)
    x *= np.minimum(1, t / .002); return x * .35 * g
def pad(ms, d, g=1.):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .07): x += np.sin(2 * np.pi * hz(m) * (1 + det / 100) * t + rng.random() * 6)
    env = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5).clip(0); return fftfilt(x, 0, 1800) * env * .07 * g
def tick(g=1.):  # деревянный «тик» года
    t = tt(.08); return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .01) + fftfilt(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t / .006) * .4) * g
def crunch(g=1.):  # шаг по снегу (крошечный)
    t = tt(.09); return fftfilt(rng.standard_normal(len(t)), 1200, 7000) * np.exp(-t / .03) * (1 + .5 * np.sin(t * 900)) * .25 * g
def wind(d, g=1.):
    t = tt(d); x = rng.standard_normal(len(t)); x = np.cumsum(x); x -= np.convolve(x, np.ones(4001) / 4001, 'same')
    x = fftfilt(x, 200, 1200); x /= np.abs(x).max(); mod = .6 + .4 * np.sin(2 * np.pi * .13 * t + 1) * np.sin(2 * np.pi * .07 * t)
    return x * mod * g
def hum(d, g=1.):  # лампочка в домике на последней батарейке
    t = tt(d); x = np.sin(2 * np.pi * 100 * t) * .5 + np.sin(2 * np.pi * 200 * t) * .3
    cr = (rng.random(len(t)) < .0015) * rng.standard_normal(len(t)) * 3
    return fftfilt(x + cr, 60, 3000) * .05 * g

# ---------- музыка
D = [62, 66, 69]; G = [55, 59, 62]; A_ = [57, 61, 64]; Bm = [59, 62, 66]; Em = [52, 55, 59]
# 1–2: волшебный Сочельник (0–7.4)
for i, (ch, t0) in enumerate([(D, 0), (G, 1.85), (D, 3.7), (A_, 5.55)]):
    add(pad([c - 12 for c in ch], 2.3), t0, .9, 0, .3)
    for k, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]): add(celesta(m), t0 + k * .46, .55, -.3 + k * .2, .5)
add(armonica(74, 3.4), .2, .55, .2, .6); add(armonica(78, 3.6), 3.7, .5, -.2, .6)
# 3: годы — вальс челесты (7.4–13)
mel = [74, 78, 81, 79, 78, 76, 74, 76, 78, 74, 71, 73]
for i, m in enumerate(mel):
    t0 = 7.4 + i * .46; add(celesta(m + 12, 1.6), t0, .5, .2 * np.sin(i), .5)
    if i % 3 == 0: add(celesta(50 + [0, 7, 5, 7][i // 3 % 4], 1.6), t0, .35, 0, .3)
for ch, t0 in [(D, 7.4), (G, 8.8), (Bm, 10.2), (A_, 11.6)]: add(pad(ch, 1.6), t0, 1, 0, .4)
# 4: выросла — одинокая гармоника вниз (13–17)
for k, m in enumerate([78, 76, 74, 71]): add(armonica(m, 1.6), 13.0 + k * .95, .5, 0, .8)
add(pad([47, 54, 59], 4.4), 13.0, 1.1, 0, .5)
# 5: коробка — почти тишина, низкий гул, редкие ноты (17–25.5)
add(pad([38, 45], 8.5), 17.0, 1.3, 0, .3)
for t0, m in [(17.6, 71), (19.4, 69), (21.0, 66)]: add(armonica(m, 2.2, att=.6), t0, .3, 0, .9)
add(armonica(62, 4.0), 21.3, .25, 0, .7); add(armonica(64, 3.0), 23.0, .25, 0, .7)
# 6: падение — нарастающий стеклянный кластер, обрыв на ударе (25.5–27.35)
for k, m in enumerate([74, 75, 77, 80, 81]): add(armonica(m, 27.35 - (25.5 + k * .2), att=.5) * np.linspace(.3, 1, int(SR * (27.35 - (25.5 + k * .2)))), 25.5 + k * .2, .28, -.4 + k * .2, .4)
# после удара — пусто, одна низкая нота
add(armonica(50, 3.0, att=1.), 28.0, .35, 0, .8)
# 7: нашли — тепло возвращается (30.5–37)
for ch, t0, d in [(G, 30.5, 2.0), (D, 32.2, 1.6), (Em, 33.7, 1.8), (A_, 35.5, 1.6)]: add(pad([c - 12 for c in ch] + ch, d + .5), t0, 1., 0, .4)
add(armonica(71, 1.8), 30.7, .45, 0, .7); add(armonica(74, 1.6), 32.3, .45, 0, .7); add(armonica(76, 1.8), 33.8, .45, 0, .7); add(armonica(73, 1.6), 35.5, .45, 0, .7)
# 8–9: снег снова — радостный вальс, всё вместе (37–44.2)
mel2 = [74, 78, 81, 86, 85, 83, 81, 83, 85, 86, 81, 78, 79, 81, 83, 86]
for i, m in enumerate(mel2):
    t0 = 37.0 + i * .3; add(celesta(m, 1.8), t0, .55, .25 * np.sin(i * 1.3), .5)
for ch, t0 in [(D, 37.0), (G, 38.8), (D, 40.6), (A_, 41.8), (D, 42.6)]: add(pad([c - 12 for c in ch] + ch, 2.2), t0, 1.1, 0, .4)
add(armonica(78, 3.5), 37.2, .45, -.2, .6); add(armonica(81, 3.0), 40.0, .45, .2, .6)
add(armonica(86, 1.8), 42.2, .5, 0, .8)
for m in [74, 78, 81, 86]: add(celesta(m, 2.4), 41.85, .45, 0, .7)

# ---------- атмосфера: ветер за окном, комната
add(wind(13.2), 0, .08, -.3, .2); add(wind(4.2), 13.0, .05); add(wind(8.8), 17.0, .035); add(wind(5.2), 25.3, .1, .3, .3)
add(wind(13.8), 30.5, .04); add(hum(2.6), 17.9, 1.)

# ---------- шумы
slosh = au('water-sloshing-82d586.mp3', a=.3, b=2.2); slosh2 = au('water-glass-bottle-sloshing-3-095b15.mp3', a=.2, b=3.0)
glint = lambda: [celesta(m, 1.2) for m in (93, 98, 100)]
for t0, g in [(0, 1), (4.0, .9), (7.4, .7), (8.8, .7), (10.2, .7), (11.6, .55), (37.0, 1), (41.5, .5)]:
    add(slosh, t0 - .05, .55 * g, 0, .2); add(lib('whoosh-medium-soft'), t0 - .1, .25 * g)
    for k, c in enumerate(glint()): add(c, t0 + .15 + k * .09, .18 * g, .5 - k * .5, .6)
# хук: тупой толчок «неба»
add(lib('impact-deep-soft'), 0, .45)
# коробка: кладут, клапаны закрываются
box = au('cardboard-box-open-close-163d5d.mp3')
add(box[:int(1.1 * SR)], 14.2, .5, .1); add(box[int(2.3 * SR):], 15.6 - .2, .6, 0)
# годы: тиканье
for y in range(7): add(tick(), 17.3 + y * 3.2 / 7, .35, 0, .3)
# бег и удары о стекло
for a, b in [(20.8, 21.8), (22.2, 23.0), (23.4, 24.3)]:
    n = int((b - a) / .16)
    for k in range(n): add(crunch(), a + k * (b - a) / n, .7, -.2)
for h, g in [(21.8, .5), (23.0, .7), (24.3, 1.)]:
    add(lib('foley-glass-touch'), h, .8 * g, -.3, .4); add(lib('impact-light-soft'), h, .6 * g, -.3); add(slosh2[:int(1.2 * SR)], h + .05, .35 * g, 0, .3)
# полка: скрежет коробки, падение, удар
add(fftfilt(rng.standard_normal(int(SR * .9)), 300, 1500) * np.linspace(0, .12, int(SR * .9)), 25.5, 1.)
add(box[int(2.3 * SR):int(3.0 * SR)], 26.1, .5)
add(lib('faller-1s-soft'), 26.45, .5)
add(lib('impact-heavy-firm'), 27.35, 1.); add(au('glass-25409e.mp3', a=0, b=.9), 27.36, .55, -.2, .3)
add(au('glass-baby-food-jar-smashed-on-concrete-708f11.mp3', a=0, b=.5), 27.4, .25, .2, .4); add(slosh, 27.4, .6, 0, .3)
# утечка: капли и пузыри
drops = lib('bsb-drops-water')
add(drops[:int(3.0 * SR)], 27.8, .45, -.3, .3)
for k in range(12): add(lib(['pop-small-bubble', 'pop-medium-bubble'][k % 2]), 29.1 + k * .11 + rng.random() * .05, .25, rng.random() - .5, .4)
# дверь, шаги
add(au('door-creak-02-83976a.mp3'), 30.45, .5, .4, .4)
for k in range(3): add(lib('impact-light-soft'), 30.9 + k * .32, .35, .3)
# налив и скотч
add(au('pouring-water-in-glass1-f4fc7c.mp3', a=2.6, b=4.3), 33.8, .6, -.2, .3)
add(lib('props-tape'), 34.95, .6, .1)
add(lib('foley-glass-slide'), 35.6, .4)
# финал glean — мягкий звон
add(celesta(98, 2.0), 41.9, .25, 0, .8)

# ---------- реверб (свёртка с шумовым хвостом) и сведение
ir = rng.standard_normal(int(SR * 2.4)) * np.exp(-np.arange(int(SR * 2.4)) / SR / .55); ir = fftfilt(ir, 200, 7000); ir /= np.sqrt((ir ** 2).sum())
def conv(x, h):
    n = len(x) + len(h); F = 1 << (n - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(h, F), F)[:len(x)]
wet = conv(RV, ir) * .9
irR = np.roll(ir, 211)
L += wet; R += conv(RV, irR) * .9
out = np.stack([L, R], 1)[:int(SR * DUR)]
fo = int(SR * .8); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
out /= np.abs(out).max() * 1.1
p = os.path.join(ROOT, 'mix.wav')
with wave.open(p, 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok', p)
