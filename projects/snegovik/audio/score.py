#!/usr/bin/env python3
"""ONE CONDITION (снеговик) — звук. Рождественские мелодии общественного достояния (Deck the Halls, We Wish You a Merry Christmas,
Silent Night, Jingle Bells) — своя аранжировка синтезом: колокольчики (глокеншпиль), челеста, пиццикато (Карплус-Стронг),
мягкий пад, бубенцы; живые записи CC0 (бубенцы, лопата по снегу, камин, колокол, детский смех) + sfx-kit.
python3 projects/dekabr/audio/score.py → projects/dekabr/audio/mix.wav"""
import numpy as np, wave, os, subprocess, json
SR = 48000; DUR = 42.5
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

JINGLE = [('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('E4', 1), ('E4', 2), ('E4', 1), ('G4', 1), ('C4', 1.5), ('D4', .5), ('E4', 4),
          ('F4', 1), ('F4', 1), ('F4', 1.5), ('F4', .5), ('F4', 1), ('E4', 1), ('E4', 1), ('E4', .5), ('E4', .5), ('E4', 1), ('D4', 1), ('D4', 1), ('E4', 1), ('D4', 2), ('G4', 2)]
DECK = [('G4', 1.5), ('F4', .5), ('E4', 1), ('D4', 1), ('C4', 1), ('D4', 1), ('E4', 1), ('C4', 1), ('D4', .5), ('E4', .5), ('F4', .5), ('D4', .5), ('E4', 1.5), ('D4', .5), ('C4', 1), ('B3', 1), ('C4', 2)]
SILENT = [('G4', 1.5), ('A4', .5), ('G4', 1), ('E4', 3), ('G4', 1.5), ('A4', .5), ('G4', 1), ('E4', 3)]
AULD = [('C4', 1), ('F4', 1.5), ('F4', .5), ('F4', 1), ('A4', 1), ('G4', 1.5), ('F4', .5), ('G4', 1), ('A4', 1), ('F4', 1.5), ('F4', .5), ('A4', 1), ('C5', 1), ('D5', 3),
        ('D5', 1), ('C5', 1.5), ('A4', .5), ('A4', 1), ('F4', 1), ('G4', 1.5), ('F4', .5), ('G4', 1), ('A4', 1), ('F4', 1.5), ('D4', .5), ('D4', 1), ('C4', 1), ('F4', 3)]
CH['Bb'] = [46, 50, 53]; CH['C7'] = [48, 52, 58]
def harmonF(m):
    pc = m % 12
    for c in ['F', 'Bb', 'C', 'Dm', 'Am', 'Gm']:
        CH.setdefault('Gm', [55, 58, 62])
        if pc in [x % 12 for x in CH[c]]: return c
    return 'F'
# «за стеклом»: рендер вечеринки в отдельный буфер, потом фильтр по времени
SAVE = (L.copy(), R.copy(), RV.copy())
L[:] = 0; R[:] = 0; RV[:] = 0
b = .3; t = 0.0
while t < 33.4:
    t = play(JINGLE if int(t / 9.6) % 2 == 0 else DECK, t, b, glock, .8, padg=.9)
PL, PR = L.copy(), R.copy()
L[:], R[:], RV[:] = SAVE
# огибающая «открытости»: 1 — слышно ярко (внутри или дверь открыта), 0 — глухо через стекло
op = np.zeros(N); tm = np.arange(N) / SR
def seg(a, bb, v): op[(tm >= a) & (tm < bb)] = v
seg(0, 3.2, 1); seg(4.5, 7.0, .8); seg(19.0, 20.7, .5); seg(20.7, 24.0, .8); seg(27.2, 33.4, 1)
op = np.convolve(op, np.ones(int(SR * .25)) / int(SR * .25), 'same')
for X, Y in ((PL, L), (PR, R)):
    dull = fftfilt(X, 0, 500)
    vol = np.where(tm < 33.4, 1, 0) * (1 - (tm > 33.0) * np.clip((tm - 33.0) / .4, 0, 1))
    Y += (dull * .55 * (1 - op) + X * op) * vol
# одиночество: тихий Silent Night (13–19) и одна низкая нота (24–27)
play(SILENT, 13.4, .42, celesta, .5, padg=1.1, bass=False, bells_on=False, oct=12)
add(pad([45, 52, 57], 3.2), 24.0, 1.4, 0, .6)
# отсчёт: колокольчик ×3 и полночь — Auld Lang Syne
for k in range(3): add(bell(72, 1.2), 33.4 + k * .4, .5, 0, .5)
t = play(AULD, 34.6, .27, glock, 1.0, key='C', padg=1.3)
for m in [53, 57, 60, 65, 69, 72]: add(glock(m, 2.5), min(t, 41.6), .5, (m - 62) / 20, .7)
add(bell(53, 3.0), 41.6, .5, 0, .6)

# ---------- шумы
add(fftfilt(rng.standard_normal(int(SR * 42)), 150, 900) * .06, 3.2, .8)   # ветер снаружи
crunch = lambda: fftfilt(rng.standard_normal(int(SR * .1)), 1200, 7000) * np.exp(-np.arange(int(SR * .1)) / SR / .03) * .35
for k in range(8): add(crunch(), 5.2 + k * .17, .9, .3)   # Мия бежит в дом
for k in range(8): add(crunch(), 22.0 + k * .08, .9, -.2)
for k in range(20): add(crunch(), 27.6 + k * .2 + rng.random() * .05, .8, rng.random() - .5)  # семья выходит
add(lib('mechanical-latch-heavy'), 4.5, .5, .3); add(lib('impact-medium-soft'), 7.0, .5, .3)   # дверь
add(lib('mechanical-latch-heavy'), 20.4, .5, .3); add(lib('impact-medium-soft'), 25.6, .55, .3); add(lib('mechanical-latch-heavy'), 27.2, .7, .3)
thump = lambda: fftfilt(rng.standard_normal(int(SR * .15)), 60, 400) * np.exp(-np.arange(int(SR * .15)) / SR / .04)
for k in range(4): add(thump(), 8.2 + k * .4, .8, .2)    # прыжки снеговика
for k in range(2): add(thump(), 13.0 + k * .33, .7, -.2)
add(fftfilt(rng.standard_normal(int(SR * 1.0)), 3000, 12000) * np.linspace(1, 0, int(SR * 1.0)) * .25, 10.5, 1., .2)   # шипение тающей руки
for k in range(6): add(lib('pop-small-bubble'), 10.6 + k * .12, .4, .2)
add(lib('whoosh-medium-soft'), 11.4, .3)
for k in range(6): add(crunch(), 13.4 + k * .4, .6, -.3)  # лепит стол
add(lib('foley-glass-touch'), 15.9, .35, -.3); add(lib('foley-glass-touch'), 16.2, .35, -.2)
add(lib('whoosh-medium-soft'), 22.1, .2); add(lib('impact-medium-soft'), 29.0, .5)   # стол поставили
for k in range(6): add(lib('foley-glass-touch'), 29.3 + k * .15, .3, rng.random() - .5)
gig = au('giggling-5d5f41.mp3')
add(gig[:int(2.0 * SR)], 28.4, .3, .3, .3); add(gig[int(3 * SR):int(6 * SR)], 34.7, .45, 0, .4)
for k in range(6):  # салют: хлопок и треск
    tb = 34.7 + k * .45; boom = fftfilt(rng.standard_normal(int(SR * .9)), 40, 300) * np.exp(-np.arange(int(SR * .9)) / SR / .25)
    add(boom, tb, .9, rng.random() - .5, .6); cr = (rng.random(int(SR * 1.2)) < .004) * rng.standard_normal(int(SR * 1.2)); add(fftfilt(cr, 2000, 10000) * 2, tb + .3, .5, rng.random() - .5, .5)
for k in range(2):
    tb = 38.4 + k * .45; boom = fftfilt(rng.standard_normal(int(SR * .9)), 40, 300) * np.exp(-np.arange(int(SR * .9)) / SR / .25); add(boom, tb, .6, .3, .6)
sp = (rng.random(int(SR * 4.0)) < .02) * rng.standard_normal(int(SR * 4.0)); add(fftfilt(sp, 3000, 12000) * .8, 38.3, .5, -.3, .2)   # бенгальский огонь
add(au('sleigh-bells-0cee4f.mp3')[int(2 * SR):int(5 * SR)], 39.0, .2, 0, .4)
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
