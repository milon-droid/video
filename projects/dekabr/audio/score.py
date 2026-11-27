#!/usr/bin/env python3
"""DECEMBER — звук. Рождественские мелодии общественного достояния (Deck the Halls, We Wish You a Merry Christmas,
Silent Night, Jingle Bells) — своя аранжировка синтезом: колокольчики (глокеншпиль), челеста, пиццикато (Карплус-Стронг),
мягкий пад, бубенцы; живые записи CC0 (бубенцы, лопата по снегу, камин, колокол, детский смех) + sfx-kit.
python3 projects/dekabr/audio/score.py → projects/dekabr/audio/mix.wav"""
import numpy as np, wave, os, subprocess, json
SR = 48000; DUR = 44.5
ROOT = os.path.dirname(os.path.abspath(__file__)); AU = os.path.join(ROOT, '../assets/audio'); LIB = os.path.join(ROOT, '../../../assets/sfx-library')
rng = np.random.default_rng(5)
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
def load(path, a=0, b=None):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout, np.int16) / 32768.
    x = x[int(a * SR): int(b * SR) if b else None].copy(); x /= (np.abs(x).max() + 1e-9)
    f = min(len(x) // 4, int(.03 * SR)); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); return x
IDX = {d['id']: d for d in json.load(open(os.path.join(LIB, 'index.json')))}
lib = lambda i, **k: load(os.path.join(LIB, IDX[i]['file']), **k)
au = lambda n, **k: load(os.path.join(AU, n), **k)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def mid(s): # 'F#4' → midi
    n = NOTE[s[0]]; k = 1
    if s[1] == '#': n += 1; k = 2
    if s[1] == 'b': n -= 1; k = 2
    return 12 * (int(s[k:]) + 1) + n

# ---------- инструменты
def glock(m, d=1.6, g=1.):
    t = tt(d); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .7) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .18) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .07)
    return x * np.minimum(1, t / .002) * .32 * g
def celesta(m, d=1.4, g=1.):
    t = tt(d); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .6) + .3 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t / .1) + .12 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / .3)
    return x * np.minimum(1, t / .002) * .3 * g
def pluck(m, d=.9, g=1., bright=.5):  # Карплус-Стронг
    f = hz(m); n = int(SR * d); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); buf = fftfilt(np.tile(buf, 4), 0, 2000 + bright * 6000)[:p]
    out = np.zeros(n); b = buf.copy()
    for i in range(n): out[i] = b[i % p]; b[i % p] = .5 * (b[i % p] + b[(i + 1) % p]) * .996
    return out * .5 * g
def pad(ms, d, g=1.):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.08, .08): x += np.sin(2 * np.pi * hz(m) * (1 + det / 100) * t + rng.random() * 6) + .3 * np.sin(4 * np.pi * hz(m) * t)
    env = np.minimum(1, t / .4) * np.minimum(1, (d - t) / .5).clip(0); return fftfilt(x, 0, 2200) * env * .045 * g
def bell(m, d=3., g=1.):  # церковный колокол (негармонические парциалы)
    t = tt(d); f = hz(m); x = np.zeros(len(t))
    for r, a, dec in [(.5, .6, 2.5), (1, 1, 1.8), (1.19, .5, 1.2), (1.5, .4, 1.0), (2, .5, .8), (2.74, .3, .5), (3.76, .2, .3)]: x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dec)
    return x * np.minimum(1, t / .003) * .18 * g
def jingle(g=1.):  # бубенцы синтезом (короткий «тряск»)
    t = tt(.25); x = fftfilt(rng.standard_normal(len(t)), 5000, 14000) * np.exp(-t / .06)
    for k in range(5): x += np.sin(2 * np.pi * (5200 + k * 913) * t) * np.exp(-t / .04) * .3
    return x * .25 * g

CH = {'C': [48, 52, 55], 'F': [53, 57, 60], 'G': [55, 59, 62], 'Am': [57, 60, 64], 'Dm': [50, 53, 57], 'Em': [52, 55, 59], 'D': [50, 54, 57], 'G7': [55, 59, 65]}
def harmon(m, key='C'):
    pc = m % 12; opts = ['C', 'F', 'G', 'Am', 'Dm', 'Em'] if key == 'C' else ['G', 'C', 'D', 'Em', 'Am']
    for c in opts:
        if pc in [x % 12 for x in CH[c]]: return c
    return opts[0]
def play(mel, t0, beat, inst=glock, g=1., key='C', bass=True, padg=1., bells_on=True, oct=0, chord_every=2):
    t = t0; acc = 0.
    for i, (n, d) in enumerate(mel):
        if n != 'r':
            m = mid(n) + oct; add(inst(m, max(.6, d * beat * 1.6)), t, g, .15 * np.sin(i), .45)
            if acc % chord_every < 1e-6:
                c = harmon(mid(n), key); dd = beat * chord_every
                if bass: add(pluck(CH[c][0] - 12, min(1.2, dd)), t, .55 * g, -.1, .2)
                add(pad(CH[c], dd + .3), t, padg * g, 0, .5)
        if bells_on and abs(acc - round(acc)) < 1e-6: add(jingle(), t, .35 * g, .5, .2)
        t += d * beat; acc += d
    return t
# ---------- мелодии (общественное достояние)
DECK = [('G4', 1.5), ('F4', .5), ('E4', 1), ('D4', 1), ('C4', 1), ('D4', 1), ('E4', 1), ('C4', 1),
        ('D4', .5), ('E4', .5), ('F4', .5), ('D4', .5), ('E4', 1.5), ('D4', .5), ('C4', 1), ('B3', 1), ('C4', 2)]
WISH = [('D4', 1), ('G4', 1), ('G4', .5), ('A4', .5), ('G4', .5), ('F#4', .5), ('E4', 1), ('E4', 1), ('E4', 1), ('A4', 1), ('A4', .5), ('B4', .5), ('A4', .5), ('G4', .5),
        ('F#4', 1), ('D4', 1), ('D4', 1), ('B4', 1), ('B4', .5), ('C5', .5), ('B4', .5), ('A4', .5), ('G4', 1), ('E4', 1), ('D4', .5), ('D4', .5), ('E4', 1), ('A4', 1), ('F#4', 1), ('G4', 2)]
SILENT = [('G4', 1.5), ('A4', .5), ('G4', 1), ('E4', 3), ('G4', 1.5), ('A4', .5), ('G4', 1), ('E4', 3)]
JINGLE = [('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('G4', 1), ('C4', 1.5), ('D4', .5), ('E4', 4)]

# 1. 0–14: Deck the Halls ×2 (дни бегут), колокольчики + пиццикато + бубенцы
b = 14.0 / 32
t = play(DECK, 0.0, b, glock, .9, padg=.8)
play(DECK, t, b, celesta, .95, padg=1.)
for k in range(int(14 / (b * 2))): add(pluck(84 if k % 2 else 79, .3, bright=.9), k * b * 2 + b, .12, .4)  # «тик» дней
# 2. 14–31.5: We Wish You a Merry Christmas ×2, тише под бытовые звуки
b2 = 17.5 / (sum(d for _, d in WISH) * 2)
t = play(WISH, 14.0, b2, celesta, .65, key='G', padg=.9)
play(WISH, t, b2, glock, .6, key='G', padg=.9)
# 3. 31.5–34.5: Silent Night — шкатулка, без бубенцов
play(SILENT, 31.6, 2.9 / 12, celesta, .55, padg=1.2, bass=False, bells_on=False, oct=12)
# 4. 34.5–39.4: колокол + Jingle Bells бодро
for k, m in enumerate([60, 67, 64, 60]): add(bell(m, 3.5), 34.5 + k * .55, .7, -.3 + k * .2, .7)
play(JINGLE, 35.0, 4.4 / 16, glock, .95, padg=1.)
# 5. 39.4–44.5: We Wish … первая строка + финальный аккорд
WISH1 = WISH[:10]
t = play(WISH1, 39.6, .34, glock, .9, key='G', padg=1.)
for m in [55, 59, 62, 67, 71, 74]: add(glock(m, 3.2), t + .05, .5, (m - 64) / 20, .7)
add(pad(CH['G'] + [67], 3.0), t, 1.6, 0, .6); add(bell(55, 3.5), t, .5, 0, .6)

# ---------- атмосфера и шумы
sleigh = au('sleigh-bells-0cee4f.mp3')
add(sleigh[:int(3.0 * SR)], 0.0, .22, .3, .3)
add(fftfilt(rng.standard_normal(int(SR * 14)), 200, 900) * .05, 0, .6)   # ветер над городом
for k, tt0 in enumerate([1.2, 4.0, 7.3, 10.6]): add(lib('whoosh-medium-soft'), tt0, .18)  # пролёт дрона
# семья 1: лопата
sh = au('metal-shovel-into-icy-snow-422358.mp3'); sh2 = au('shovel-sand-gravel-snow-3f4501.mp3')
for k in range(5): add(sh[int((2 + k * 3) * SR):int((3 + k * 3) * SR)], 14.2 + k * .62, .45, -.2, .2)
add(sh2, 15.6, .4, .2); add(au('giggling-5d5f41.mp3', a=0, b=2.0), 15.0, .25, .4, .3)
# семья 2: венок, гирлянда щёлк, олень
add(lib('click-toggle-firm'), 19.0, .6, .1); add(lib('click-toggle-firm'), 19.9, .6, .3)
for k in range(8): add(celesta(84 + (k % 4) * 3, .5), 19.0 + k * .1, .18, -.4 + k * .1, .5)
add(au('giggling-5d5f41.mp3', a=3.0, b=5.0), 19.8, .3, .2, .3)
# кухня
for k in range(4): add(fftfilt(rng.standard_normal(int(SR * .9)), 2000, 9000) * np.linspace(.2, .05, int(SR * .9)) * .1, 21.3 + k * .8, .7, -.2)  # шкворчит
add(lib('mechanical-latch-heavy'), 22.0, .4); add(lib('foley-glass-touch'), 23.2, .4, .3)
# гостиная: камин
fire = au('fireplace-crackling-e8cfb1.mp3')
add(fire[:int(3.6 * SR)], 24.6, .35, -.3, .2); add(fire[int(4 * SR):int(9 * SR)], 34.6, .25, -.3, .2)
for k in range(3): add(lib('pop-small-bubble'), 25.1 + k * .3, .3, -.3 + k * .3)
# столовая: посуда, дверь, гости
for k in range(8): add(lib(['foley-glass-touch', 'click-tap-medium'][k % 2]), 28.4 + k * .16, .35, -.3 + k * .08, .3)
add(lib('mechanical-latch-heavy'), 30.2, .4, .4); add(au('giggling-5d5f41.mp3', a=5.0, b=7.0), 30.4, .3, .4, .3)
# ночь: бубенцы саней проезжают
s2 = au('sleigh-bells-0cee4f.mp3', a=6, b=9.0); add(s2 * np.linspace(0, 1, len(s2)) * np.linspace(1, .3, len(s2)) ** .5, 32.0, .35, -.6, .6)
# утро: бумага, смех
for k in range(10): add(fftfilt(rng.standard_normal(int(SR * .2)), 1500, 9000) * np.exp(-np.arange(int(SR * .2)) / SR / .06) * .5, 35.9 + k * .13, .6, rng.random() - .5)
add(au('giggling-5d5f41.mp3', a=0, b=3.5), 35.8, .4, 0, .3)
add(au('church-bell-sound-2d14bb.mp3', a=0, b=4.0), 34.6, .25, .3, .5)
add(sleigh[int(10 * SR):int(13 * SR)], 41.6, .25, 0, .4)

# ---------- реверб и сведение
ir = rng.standard_normal(int(SR * 2.0)) * np.exp(-np.arange(int(SR * 2.0)) / SR / .45); ir = fftfilt(ir, 250, 8000); ir /= np.sqrt((ir ** 2).sum())
def conv(x, h):
    n = len(x) + len(h); F = 1 << (n - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(h, F), F)[:len(x)]
L += conv(RV, ir) * .7; R += conv(RV, np.roll(ir, 173)) * .7
out = np.stack([L, R], 1)[:int(SR * DUR)]; fo = int(SR * .6); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
out /= np.abs(out).max() * 1.1
with wave.open(os.path.join(ROOT, 'mix.wav'), 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok')
