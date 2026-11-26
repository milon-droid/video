# STITCHED — музыка (синтез: шкатулка, пульс, «пианино», пэд) + звуки (записи Freesound CC0 + sfx-library CC0) → mix.wav
# python3 score.py   (только numpy + ffmpeg)
import numpy as np, subprocess, os, wave
SR = 48000; DUR = 59.0; N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(HERE, '../../../assets/sfx-library')
rng = np.random.default_rng(7)

def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768
_lib = {}
def lib(name):
    if name not in _lib:
        import json
        idx = json.load(open(os.path.join(LIB, 'index.json')))
        items = idx if isinstance(idx, list) else idx.get('sounds', list(idx.values()))
        f = None
        for it in items:
            if isinstance(it, dict) and it.get('id') == name: f = it['file']
        if f is None:
            for root, _, fs in os.walk(LIB):
                for x in fs:
                    if x.rsplit('.', 1)[0] == name: f = os.path.relpath(os.path.join(root, x), LIB)
        _lib[name] = load(os.path.join(LIB, f))
    return _lib[name]
_rec = {}
def rec(name):
    if name not in _rec: _rec[name] = load(os.path.join(HERE, 'rec', name + '.wav'))
    return _rec[name]

music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32)
def put(buf, t, x, g=1.0, pan=0.0, fi=0.0, fo=0.0, dur=None):
    if x.ndim == 1: x = np.stack([x, x], 1)
    if dur is not None: x = x[:int(dur * SR)]
    x = x.copy()
    if fi > 0: n = min(len(x), int(fi * SR)); x[:n] *= np.linspace(0, 1, n)[:, None]
    if fo > 0: n = min(len(x), int(fo * SR)); x[-n:] *= np.linspace(1, 0, n)[:, None]
    a = int(t * SR)
    if a < 0: x = x[-a:]; a = 0
    b = min(N, a + len(x))
    if b <= a: return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.41, np.sin((pan + 1) * np.pi / 4) * 1.41
    buf[a:b, 0] += x[:b - a, 0] * g * min(l, 1.2); buf[a:b, 1] += x[:b - a, 1] * g * min(r, 1.2)
def seg(x, a, b): return x[int(a * SR):int(b * SR)]
def loopseg(x, a, b, dur):
    s = seg(x, a, b); n = int(dur * SR); reps = int(np.ceil(n / len(s))) + 1
    out = np.concatenate([s] * reps)[:n]; return out

# ---------- инструменты ----------
def nf(n):  # имя ноты → частота
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    k = names[n[0]]; i = 1
    if n[i] == '#': k += 1; i += 1
    elif n[i] == 'b': k -= 1; i += 1
    o = int(n[i:]); return 440 * 2 ** ((k + 12 * (o + 1) - 69) / 12)
def mbox(f, d=1.6, vel=1.0, det=0.0):  # музыкальная шкатулка: язычок гребёнки
    t = np.arange(int(d * SR)) / SR; f = f * (1 + det)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1) + .32 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / .35) \
        + .16 * np.sin(2 * np.pi * f * 5.43 * t) * np.exp(-t / .06) + .05 * np.sin(2 * np.pi * f * 9.1 * t) * np.exp(-t / .02)
    cl = rng.standard_normal(len(t)) * np.exp(-t / .002) * .25
    x = (x + cl) * np.minimum(1, t / .0015)
    return x * vel * .22
def piano(f, d=3.0, vel=1.0):
    t = np.arange(int(d * SR)) / SR; x = np.zeros_like(t)
    for h, a, dec in [(1, 1, 1.6), (2, .45, .9), (3, .22, .55), (4, .12, .35), (5, .06, .25)]:
        x += a * np.sin(2 * np.pi * f * h * t * (1 + .0004 * h * h)) * np.exp(-t / dec)
    x *= np.minimum(1, t / .004) * (1 - np.exp(-(d - t) / .05))
    return x * vel * .16
def pad(freqs, d, vel=1.0):
    t = np.arange(int(d * SR)) / SR; x = np.zeros((len(t), 2))
    for f in freqs:
        for k, dt in enumerate([-.004, 0, .005]):
            ph = rng.random() * 6.28
            s = 2 * ((f * (1 + dt) * t + ph / 6.28) % 1) - 1
            x[:, k % 2] += s; x[:, 1 - k % 2] += s * .5
    x = lowpass(x, 900)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.5)
    return x * env[:, None] * vel * .018
def lowpass(x, fc):
    X = np.fft.rfft(x, axis=0); fr = np.fft.rfftfreq(len(x), 1 / SR); h = 1 / np.sqrt(1 + (fr / fc) ** 4)
    return np.fft.irfft(X * h[:, None] if x.ndim == 2 else X * h, n=len(x), axis=0)
def reverb(x, dec=2.2, wet=.3):
    n = int(dec * SR); t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (dec / 6.9))[:, None]; ir[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))[:, None]
    ir = lowpass(ir, 5000); ir /= np.sqrt((ir ** 2).sum(0))
    L = len(x) + n; F = 1 << int(np.ceil(np.log2(L)))
    y = np.fft.irfft(np.fft.rfft(x, F, axis=0) * np.fft.rfft(ir, F, axis=0), F, axis=0)[:len(x)]
    return x * (1 - wet) + y * wet * 2.2
def thump(f=55, d=.5):
    t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t * (1 + .6 * np.exp(-t / .03))) * np.exp(-t / .16) * .35

# ---------- тема (своя колыбельная, 3/4) ----------
THEME = [('E5', 'G5', 'C6'), ('B5', 'G5', 'E5'), ('F5', 'A5', 'D6'), ('C6', None, 'G5'),
         ('E5', 'G5', 'C6'), ('D6', 'C6', 'A5'), ('G5', 'F5', 'D5'), ('C5', None, None)]
BASS = ['C3', 'E3', 'F3', 'C3', 'C3', 'F3', 'G2', 'C3']
CH = [('E4', 'G4'), ('E4', 'G4'), ('F4', 'A4'), ('E4', 'G4'), ('E4', 'G4'), ('F4', 'A4'), ('D4', 'F4'), ('E4', 'G4')]
def play_bar(buf, t0, bi, beat, inst=mbox, minor=False, vel=1.0, det=0.0):
    mel = THEME[bi % 8]; b = BASS[bi % 8]; ch = CH[bi % 8]
    sub = (lambda n: n.replace('E', 'Eb').replace('B', 'Bb').replace('A', 'Ab')) if minor else (lambda n: n)
    for k, n in enumerate(mel):
        if n: put(buf, t0 + k * beat, inst(nf(sub(n)), vel=vel, det=det) if inst is mbox else inst(nf(sub(n)), vel=vel), .9, pan=.15)
    put(buf, t0, (mbox(nf(sub(b)) * 2, 2.0, .8, det) if inst is mbox else piano(nf(sub(b)), 3.5, .8)), .9, pan=-.2)
    for k in (1, 2):
        for n in ch: put(buf, t0 + k * beat, (mbox(nf(sub(n)), 1.0, .35, det) if inst is mbox else piano(nf(sub(n)), 1.6, .35)), .8, pan=-.05)

# A: 0–17.0 — «идеальная» шкатулка, 132 bpm (бит .4545)
beat = 60 / 132; bar = beat * 3
order = [0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 1, 2, 3]  # бары 8–11: застряла петля (дама ×3)
t = 0.0; bi = 0
while t < 17.0 - bar * .5:
    b = order[bi] if bi < len(order) else bi % 8
    play_bar(music, t, b, beat); t += bar; bi += 1
# B: 17.0–20.6 — шкатулка заводится вниз (распускается небо): темп и высота падают
tt = 17.0; rate = 1.0; k = 0
for n in ['E5', 'G5', 'C6', 'B5', 'G5', 'E5', 'F5', 'A5', 'D6', 'C6']:
    put(music, tt, mbox(nf(n) * rate, 1.8), .9 * rate); tt += beat / rate; rate *= .9; k += 1
    if tt > 20.6: break
# C: 21.5–27 — гул студии и стеклянная дрожь
t = np.arange(int(5.8 * SR)) / SR
dr = (np.sin(2 * np.pi * 65.4 * t) + .5 * np.sin(2 * np.pi * 98.1 * t) + .25 * np.sin(2 * np.pi * 130.8 * t * 1.003)) * np.minimum(1, t / 1.5) * np.minimum(1, (5.8 - t) / 1.0) * .05
put(music, 21.4, dr, 1.0)
for i, n in enumerate(['C6', 'G5', 'E6', 'B5', 'C6', 'G5']): put(music, 22.4 + i * .75, mbox(nf(n), 2.0, .45, det=.012 * (i % 2)), .7, pan=(-.5 + i * .2))
# D: 27–37 — минор, медленнее, пульс
beat2 = 60 / 100; bar2 = beat2 * 3; t0 = 27.0; bi = 0
while t0 < 36.6:
    play_bar(music, t0, bi, beat2, minor=True, vel=.85, det=.006 * np.sin(bi)); t0 += bar2; bi += 1
for i in range(int(10 / beat2)): put(music, 27.0 + i * beat2, thump(52), .8 if i % 3 == 0 else .35)
# E: 37–42 — подъём, удар, тишина
for i in range(16):
    tt = 37.0 + i * (.5 - i * .02)
    if tt < 38.9: put(music, tt, thump(50 + i * 2), .5 + i * .04)
t = np.arange(int(1.9 * SR)) / SR; rs = rng.standard_normal(len(t)) * (t / 1.9) ** 2 * .06
put(music, 37.0, lowpass(rs, 3000), 1.0)
# F: 40.2–57.5 — тёплый финал: «пианино» тема медленно + пэд
beat3 = 60 / 84; bar3 = beat3 * 3; t0 = 41.6; bi = 0
chords = [['C3', 'G3', 'E4'], ['A2', 'E3', 'C4'], ['F2', 'C3', 'A3'], ['G2', 'D3', 'B3'], ['C3', 'G3', 'E4'], ['F2', 'C3', 'A3'], ['G2', 'D3', 'B3'], ['C3', 'G3', 'E4']]
while t0 < 55.0:
    play_bar(music, t0, bi, beat3, inst=piano, vel=.9); t0 += bar3; bi += 1
for i, c in enumerate(chords):
    put(music, 41.6 + i * bar3 * 1.0 - .3, pad([nf(n) for n in c], bar3 + 1.6), 1.0)
put(music, t0, piano(nf('C5'), 4.5, 1.0), 1.0); put(music, t0, piano(nf('G4'), 4.5, .6), 1.0); put(music, t0, piano(nf('C3'), 4.5, .8), 1.0)
put(music, t0 + .02, mbox(nf('C6'), 3.0, .7), .8, pan=.3)
music = reverb(music, 2.4, .32).astype(np.float32)
# музыка уходит под голос событий: в разрыве (раскрытие) тише
def env_set(buf, pts):
    tt = np.arange(N) / SR; e = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts]); buf *= e[:, None]
env_set(music, [(0, 1), (16.8, 1), (17.2, .9), (21.3, .8), (27, .9), (37, 1), (38.95, 1), (39.0, .25), (40.0, .25), (41.5, 1), (59, 1)])

# ---------- атмосфера ----------
put(amb, 0.0, loopseg(rec('birds'), 10, 40, 21.6), .55, fi=.3, fo=1.2)
put(amb, 12.4, loopseg(rec('rain'), 5, 30, 4.4), .9, fi=.4, fo=.6)
put(amb, 21.6, lowpass(rng.standard_normal((int(5.5 * SR), 2)).astype(np.float32), 300) * .05, 1.0, fi=1.0, fo=.8)  # тон комнаты студии
put(amb, 27.0, loopseg(rec('birds'), 60, 80, 6.0), .25, fi=.5, fo=1.5)
put(amb, 32.5, loopseg(lib('bsb-wind-foley'), 1, 12, 26.5), .2, fi=1.5, fo=2.0)

# ---------- звуки событий ----------
SEW = rec('sewing')
def machine(t, d, g=.55, fast=False): put(sfx, t, loopseg(SEW, 6, 30, d), g, fi=.05, fo=.12)
machine(0.0, 2.55, .5); put(sfx, 2.55, lib('whoosh-medium-hard'), .5, pan=.4)
put(sfx, 1.6, lib('foley-fabric-touch'), .3, pan=-.3)  # взмах рукой
for i, tt in enumerate([7.95, 8.9, 9.85]): put(sfx, tt, lib('notification-success-pluck'), .38, pan=.3)  # одинаковый «динь» — петля
for tt in np.arange(7.7, 10.6, .38): put(sfx, tt, lib('foley-fabric-touch'), .14, pan=.2)  # шаги дамы
for tt in [13.6, 15.2]: put(sfx, tt, seg(lib('bsb-door-creak-open'), .2, 1.0), .35, pan=0, fo=.2)  # облако тянут за нитки
put(sfx, 18.25, seg(rec('broderie'), 8.6, 11.0), 1.1)            # нитку тянут
for tt in [18.6, 19.3, 19.9]: put(sfx, tt, lib('props-tape'), .55, pan=-.2)  # ряды распускаются
put(sfx, 20.2, lib('impact-light-hard'), .3)
put(sfx, 21.55, lib('whoosh-slow-soft'), .7); put(sfx, 22.6, lib('bass-sub-drop-short'), .5)
CH = [23.6, 24.3, 24.9, 25.5, 26.1, 27.4, 28.6, 30.4, 31.4, 33.2, 34.4, 35.6, 43.2, 44.3, 45.5, 46.6, 48.4]
for tt in CH: put(sfx, tt, lib('pop-large-bubble'), .22, pan=-.4)
put(sfx, 23.85, lib('swipe-fast-soft'), .25)
machine(27.1, 2.0, .6); put(sfx, 29.1, lib('whoosh-fast-soft'), .4)
put(sfx, 28.0, lib('impact-light-hard'), .55); put(sfx, 28.0, lib('bass-sub-drop-short'), .45)  # все разом повернулись
machine(29.4, 1.2, .6); machine(30.8, 1.0, .55); put(sfx, 31.85, lib('whoosh-medium-hard'), .45, pan=.4)
put(sfx, 30.0, lib('foley-fabric-slide'), .3)  # Олли пятится
put(sfx, 33.6, loopseg(lib('bsb-heartbeat-slow'), 0, 6, 3.6), .55, fi=.5, fo=.5)
for tt in [32.6, 33.0, 33.4, 33.8]: put(sfx, tt, lib('foley-fabric-touch'), .25)
put(sfx, 37.9, lib('foley-fabric-slide'), .4); put(sfx, 38.4, lib('foley-fabric-slide'), .35)
put(sfx, 38.7, lib('whoosh-medium-hard'), .6, pan=-.3); put(sfx, 38.95, lib('impact-heavy-hard'), .8); put(sfx, 38.95, lib('bass-sub-drop-short'), .6)
put(sfx, 39.65, lib('whoosh-fast-soft'), .45); put(sfx, 40.2, lib('impact-medium-soft'), .6)
put(sfx, 40.05, seg(rec('broderie'), 16.6, 17.6), .8)  # шарф цепляется
for tt in np.arange(40.6, 50.0, .385): put(sfx, tt, lib('foley-fabric-touch'), .16, pan=.15)  # шаги по ткани
for tt in np.arange(42.2, 49.6, .62): put(sfx, tt, seg(rec('broderie'), 33.2, 33.5), .35, fo=.05)  # строчка прошивается
for a, b in [(50.2, 1.0), (51.2, 1.1), (52.8, 1.0), (53.8, 1.0)]: put(sfx, a, seg(rec('broderie'), 45.0, 45.0 + b), .7, fo=.1)

mix = music * .55 + amb * .7 + sfx * 1.0
mix = np.tanh(mix * 1.1) / 1.1
mix *= .9 / max(1e-6, np.abs(mix).max())
w = wave.open(os.path.join(HERE, 'mix.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print('mix.wav', DUR, 's')
