# score.py EP — музыка (живое фортепиано C4 + группа виолончелей F#2/F#4, транспонирование по нотам) + фоли по cues{EP}.json
# python3 audio/score.py 1  → audio/mix1.wav
import sys, json, subprocess, numpy as np
from pathlib import Path
SR = 48000; D = Path(__file__).parent; ROOT = D.parent.parent.parent; EP = sys.argv[1] if len(sys.argv) > 1 else '1'
def load(p, off=0, dur=None):
    a = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(a, np.float32).astype(np.float64); x = x[int(off * SR):]
    if dur: x = x[:int(dur * SR)]
    return x
LIB = {s['id']: s for s in json.loads((ROOT / 'assets/sfx-library/index.json').read_text())}
def lib(i, **k): return load(ROOT / 'assets/sfx-library' / LIB[i]['file'], **k)
R = lambda n: next(D.glob('rec/' + n + '*'))
PIANO = load(R('c4-ec5d6c')); PIANO /= np.abs(PIANO).max()
CLO = load(R('cello-section-vibrato-sustain-f-2')); CLO /= np.abs(CLO).max()
CHI = load(R('cello-section-vibrato-sustain-f-4')); CHI /= np.abs(CHI).max()
def shift(x, semi): r = 2 ** (semi / 12); return np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x)
def env(x, a=.01, r=.4, dur=None):
    x = x.copy(); n = len(x); na = int(a * SR); x[:na] *= np.linspace(0, 1, na)[:n]
    if dur is not None:
        e = int(dur * SR); nr = int(r * SR)
        if e < n: x = x[:e + nr]; x[e:] *= np.linspace(1, 0, len(x) - e)
    return x
PC = {}
def piano(n, dur=3, v=.6):
    k = (n, round(dur, 2))
    if k not in PC: PC[k] = env(shift(PIANO, n - 60), .003, .5, dur)
    return PC[k] * v * (0.75 + 0.25 * (n > 66))
def cello(n, dur, v=.4, a=.6, r=1.2):
    src, base = (CLO, 42) if n < 56 else (CHI, 66)
    x = shift(src[int(.25 * SR):], n - base)
    while len(x) < (dur + r) * SR: x = np.concatenate([x, x[int(2 * SR):]])
    return env(x, a, r, dur) * v

DUR = json.load(open(D / f'cues{EP}.json'))['dur']; CUES = json.load(open(D / f'cues{EP}.json'))['cues']
N = int((DUR + 3) * SR); M = np.zeros((2, N)); FX = np.zeros((2, N))
def put(buf, x, t, v=1., pan=0.):
    i = int(t * SR); x = x[:max(0, N - i)] * v
    buf[0, i:i + len(x)] += x * np.sqrt((1 - pan) / 2) * 1.41; buf[1, i:i + len(x)] += x * np.sqrt((1 + pan) / 2) * 1.41

# ---------------- музыка ----------------
def mus_ep1():
    put(M, piano(74, 2.5, .55), 0.0, pan=.1); put(M, cello(50, 2.4, .3), 0.0)          # хук: D5 + виолончель D3
    for i, n in enumerate([69, 74, 78, 81, 78, 74]): put(M, piano(n, .35, .32), 3.0 + i * .33, pan=-.2 + i * .08)   # класс: игриво
    put(M, piano(47, 2.5, .45), 5.3); put(M, piano(50, 2.5, .3), 5.3)                    # смех → низкое Bm
    for t, n in [(7.4, 59), (8.3, 66), (9.2, 62), (10.1, 61)]: put(M, piano(n, 1.4, .38), t, pan=.15)   # дождь
    put(M, cello(47, 3.6, .22, 1, 1.5), 7.2)
    # тёплая тема: D | Bm | G | A, 66 bpm, такт 3.636 с
    bt = 60 / 66; t0 = 11.0; ch = {'D': [50, 57, 62, 66], 'Bm': [47, 54, 59, 62], 'G': [43, 50, 55, 59], 'A': [45, 52, 57, 61]}
    prog = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D']
    mel = [[(78, 2), (76, 1), (74, 1)], [(74, 2), (73, 1), (71, 1)], [(71, 2), (69, 1), (67, 1)], [(69, 3), (73, 1)],
           [(78, 2), (79, 1), (81, 1)], [(78, 2), (76, 1), (74, 1)], [(74, 1.5), (76, .5), (78, 1), (79, 1)], [(81, 3), (78, 1)], [(78, 4)]]
    for b, c in enumerate(prog):
        tb = t0 + b * 4 * bt
        if tb > 42.4: break
        big = 1.25 if tb >= 35 else 1.0
        for q, ni in enumerate([0, 1, 2, 1]):
            put(M, piano(ch[c][ni] + (12 if ni == 2 else 0), bt * 1.5, .3 * big), tb + q * bt, pan=-.25)
        if b >= 1:
            tq = 0
            for n, l in mel[b]:
                if tb + tq < 42.2: put(M, piano(n + (12 if tb >= 35 else 0) * 0, l * bt, .42 * big), tb + tq * bt, pan=.2)
                tq += l
        if tb >= 22.0: put(M, cello(ch[c][0] + 12, 4 * bt, .2 * big, .5, 1.0), tb, pan=-.1)
        if tb >= 33.0: put(M, cello(ch[c][3] + 12, 4 * bt, .16, .6, 1.0), tb, pan=.2)
    put(M, piano(86, 2, .3), 37.4, pan=.3); put(M, piano(90, 2, .25), 37.7, pan=.35)     # «правда» картины
    # ночь: тишина, низкий гул, диссонанс на промахе
    put(M, cello(38, 6.2, .16, 2, 1.5), 42.6); put(M, piano(66, 2.5, .3), 43.4)
    put(M, piano(68, 3, .35), 44.5, pan=-.2); put(M, piano(69, 3, .3), 44.52, pan=.2)
    # два тюбика: секунда B–C, повисает
    put(M, cello(35, 6.5, .2, 1.2, 1), 48.9); put(M, piano(59, 3, .38), 49.3); put(M, piano(60, 3, .3), 49.32)
    put(M, piano(62, 2, .28), 51.2); put(M, piano(61, 3, .3), 52.7)
    # карточка: Bm7, недосказанность
    for i, n in enumerate([47, 54, 62, 69]): put(M, piano(n, 3, .38), 55.75 + i * .06)
    put(M, cello(47, 3, .25, .3, 1.2), 55.7); put(M, cello(66, 2.8, .14, .6, 1.2), 55.9)

# ---------------- фоли ----------------
BR = load(R('paint-brush'))
def sfx(c):
    i, t, v, o = c['id'], c['t'], c['v'], c.get('o', {}); d = o.get('dur')
    if i == 'brush': put(FX, BR[int(5.0 * SR):int(5.9 * SR)] * 1.6, t, v * .9)
    elif i == 'brushlong':
        x = np.concatenate([BR[int(s * SR):int((s + 1.2) * SR)] for s in [51, 57.5, 78, 94, 96.5]]); put(FX, env(x[:int((d or 4) * SR)], .1, .3, (d or 4) - .3) * 1.3, t, v)
    elif i == 'slip': put(FX, shift(BR[int(57.5 * SR):int(58.5 * SR)], 3) * 2, t, v); put(FX, lib('whoosh-fast-soft'), t, v * .5)
    elif i == 'swipe': put(FX, lib('whoosh-slow-soft'), t, v * .7)
    elif i == 'hook': put(FX, lib('whoosh-slow-soft')[::-1].copy(), max(0, t - .2), v * .4)
    elif i == 'class': put(FX, env(load(R('class-room-ambient'), 12, d or 4.4), .3, .5, (d or 4.4) - .5), t, v * .7)
    elif i == 'gallery': put(FX, env(load(R('class-room-ambient'), 40, d or 7.4), .5, .8, (d or 7.4) - .8), t, v * .35)
    elif i == 'laugh': put(FX, env(load(R('r08-33-pre-teens'), 9.2, 3.2), .05, .6, 2.6), t, v * 1.6)
    elif i == 'truth': put(FX, piano(93, 1.5, .25), t, v); put(FX, piano(98, 1.5, .18), t + .08, v)
    elif i == 'rain': put(FX, env(load(R('rain-on-street'), 3, (d or 4) + .5), .4, .6, d or 4), t - .3, v * 1.1)
    elif i == 'steps': [put(FX, lib('bsb-snow-steps-quick', off=.0, dur=.35), t + k * .6, v * .4, pan=(-.1 if k % 2 else .1)) for k in range(int((d or 3) / .6))]
    elif i == 'room':
        n = int((d or 4) * SR); b = np.cumsum(np.random.default_rng(3).normal(0, 1, n)); b -= np.convolve(b, np.ones(4801) / 4801, 'same'); b /= np.abs(b).max() + 1e-9
        put(FX, env(b, .5, .5, (d or 4) - .5) * .05, t, v)
    elif i == 'paper': put(FX, lib('foley-fabric-slide'), t, v * .7)
    elif i == 'hum': put(FX, cello(62, 1.2, .0), t, 0)
    elif i == 'pen': x = lib('writing-marker-draw'); put(FX, x[:int((d or 1) * SR)], t, v * .8)
    elif i == 'warmnote': put(FX, piano(86, 1.5, .2), t + .9, v)
    elif i == 'tea': put(FX, env(load(R('tea-pouring'), 1.0, 2.6), .2, .5, 2.1), t, v * .5)
    elif i in ('cup', 'glass'): put(FX, lib('foley-glass-touch'), t, v * .8)
    elif i == 'heart': put(FX, lib('bsb-heartbeat-slow', dur=1.0), t, v * 1.2)
    elif i == 'wind': put(FX, env(lib('bsb-wind-whistle-chimney', off=2, dur=d or 3.5), .5, .6, (d or 3.5) - .6), t, v * .6)
    elif i == 'applause': put(FX, env(lib('celebration-applause-small'), .3, .5, 2.4), t, v * .7)
    elif i == 'camera': put(FX, lib('mechanical-shutter-light'), t, v)
    elif i == 'clock':
        x = lib('time-clock'); x = np.tile(x, int((d or 6) / 3) + 1)[:int((d or 6) * SR)]; put(FX, env(x, .3, .5, (d or 6) - .5), t, v * .75)
    elif i == 'glasses': put(FX, lib('click-clip-medium'), t, v * .6)
    elif i == 'breath': put(FX, lib('whoosh-slow-soft') * .5, t, v * .5)
    elif i == 'tubes': put(FX, lib('foley-fabric-touch'), t, v)
    elif i in ('drone', 'endnote', 'hook2', 'endnote2', 'split', 'merge', 'swell'): pass
for c in CUES: sfx(c)
globals().get('mus_ep' + EP, lambda: None)()

# зал: короткая реверберация (шумовой хвост) на музыке
ir = np.random.default_rng(1).normal(0, 1, int(1.6 * SR)) * np.exp(-np.arange(int(1.6 * SR)) / (0.35 * SR)); ir /= np.sqrt((ir ** 2).sum())
from numpy.fft import rfft, irfft
def conv(x): L = len(x) + len(ir); n = 1 << (L - 1).bit_length(); return irfft(rfft(x, n) * rfft(ir, n), n)[:len(x)]
Mw = np.stack([conv(M[0]), conv(M[1][::-1])[::-1] * 0 + conv(M[1])])
OUT = M * .8 + Mw * .35 + FX + np.stack([conv(FX[0]), conv(FX[1])]) * .12
OUT = OUT[:, :int((DUR + .05) * SR)]
fl = int(.3 * SR); OUT[:, -fl:] *= np.linspace(1, 0, fl)
OUT /= np.abs(OUT).max() / .9
import wave
w = wave.open(str(D / f'mix{EP}.wav'), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((OUT.T * 32767).astype('<i2').tobytes()); w.close(); print('ok', D / f'mix{EP}.wav', OUT.shape[1] / SR)
