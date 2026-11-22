#!/usr/bin/env python3
"""КОРОБКА — звук: своя музыкальная шкатулка + часы + синтез чихов + SFX из библиотек. → mix.wav (48 кГц, стерео)."""
import json, subprocess, numpy as np, os, sys
SR = 48000; DUR = 39.5; N = int(SR * DUR); NE = N + 15 * SR   # хвост после конца заворачивается в начало (петля)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
LIB = os.path.join(ROOT, 'assets/sfx-library'); IDX = {e['id']: e for e in json.load(open(os.path.join(LIB, 'index.json')))}
rng = np.random.default_rng(7)
mix = np.zeros((N, 2)); bus = {'mus': np.zeros((NE, 2)), 'sfx': np.zeros((NE, 2)), 'amb': np.zeros((NE, 2))}

def load(i):
    f = os.path.join(LIB, IDX[i]['file'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); return x / (np.abs(x).max() + 1e-9)
def put(x, t, g=1., pan=0., b='sfx'):
    i = int(t * SR); x = np.asarray(x)
    if i >= NE: return
    x = x[:NE - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[b][i:i + len(x), 0] += x * g * l * 1.41; bus[b][i:i + len(x), 1] += x * g * r * 1.41
def rs(x, k):            # перепитч ресемплингом (k>1 — выше и короче)
    n = int(len(x) / k); return np.interp(np.arange(n) * k, np.arange(len(x)), x)
def env(n, a=.005, d=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / a)
    return e * (np.exp(-t / d) if d else 1)
def lp(x, fc):           # однополюсный ФНЧ
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lpv(x, fc):          # быстрый ФНЧ через свёртку окна (fc ~ SR/len)
    k = max(1, int(SR / fc / 2)); w = np.hanning(2 * k + 1); w /= w.sum(); return np.convolve(x, w, 'same')
def bp(x, lo, hi): return lpv(x, hi) - lpv(x, lo)
def verb(x, sec=1.2, mixw=.3):
    n = int(SR * sec); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5 / sec); ir = lpv(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 4
    y = np.convolve(x, ir)[:len(x) + n]; out = np.zeros(len(y)); out[:len(x)] += x * (1 - mixw); return out + y * mixw
def noise(sec): return rng.standard_normal(int(SR * sec))
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- музыкальная шкатулка ----------
def tine(m, g=1., dec=1.8, det=0.):
    f = mtof(m) * (1 + det); n = int(SR * dec * 2.2); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / dec) + .32 * np.sin(2 * np.pi * f * 2.003 * t) * np.exp(-t / (dec * .4))
         + .18 * np.sin(2 * np.pi * f * 5.42 * t) * np.exp(-t / .16) + .07 * np.sin(2 * np.pi * f * 9.1 * t) * np.exp(-t / .05))
    y += noise(n / SR)[:n] * np.exp(-t / .004) * .25
    y *= np.minimum(1, t / .0015)
    return y * g * .5
THEME = [(57, 60, 64), (62, 60, 59), (60, 64, 69), (67, 64, 60), (62, 65, 64), (59, None, None)]
BASS = [45, 41, 45, 48, 50, 52]
def theme_notes(t0, bars, beat=1 / 3, shift=0, vel=1.):
    ev = []
    for b in range(bars):
        mel, bs = THEME[b % 6], BASS[b % 6]
        for j, m in enumerate(mel):
            if m is not None: ev.append((t0 + (b * 3 + j) * beat, m + shift, vel * (1 if j == 0 else .8)))
        ev.append((t0 + b * 3 * beat, bs + shift, vel * .55))
        ev.append((t0 + (b * 3 + 1.5) * beat, bs + 12 + 7 + shift, vel * .25))
    return ev
def play(ev, gain=1., pan=0., dec=1.8, cut=None):
    for t, m, v in ev:
        if cut and t >= cut: continue
        put(tine(m, v, dec, det=(hash((t, m)) % 7 - 3) * 4e-4), t, gain, pan + (m - 60) / 40, 'mus')

play(theme_notes(1.6, 11), .5, cut=13.0)                                   # знакомство
play([(38.25, 57, .8), (38.25 + 1 / 3, 60, .7), (38.25 + 2 / 3, 64, .7), (38.25 + 1.0, 45, .6)], .4, dec=.5)   # закрывающая фраза — затихает до стыка
play([(t, m + 12, v * .6) for t, m, v in theme_notes(7.4, 4, beat=1 / 6)], .25, cut=9.7)   # блеск при наезде
play(theme_notes(13.5, 2, shift=12), .38, cut=15.0)                        # «он впереди» — выше
# заводная шкатулка кончается: ноты реже и ниже
tt = 15.0
for i, m in enumerate([64, 62, 60, 59, 57, 56, 55]):
    put(rs(tine(m, .9, 2.4), 1 - i * .035), tt, .45, 0, 'mus'); tt += .3 + i * .07
play([(19.65 + i * .16, m, 1.) for i, m in enumerate([60, 64, 67, 72, 76])], .6, dec=1.4)   # триумф
play([(19.65 + .8, 48, .8), (19.65 + .8, 55, .5), (19.65 + .8, 64, .6), (19.65 + .8, 72, .7)], .5, dec=2.5)
# жуткая шкатулка внизу на раскрытии
play([(t, m - 12, v) for t, m, v in theme_notes(28.4, 2, beat=.5)], .5, dec=3.0, cut=30.8)
# перемотка: тема задом наперёд с ускорением
fw = np.zeros(int(SR * 11))
for t, m, v in theme_notes(0, 10, beat=1 / 3):
    x = tine(m, v); i = int(t * SR); fw[i:i + len(x)] += x[:len(fw) - i]
rev = fw[::-1]; T = 7.4; n = int(SR * T); u = np.arange(n) / n
pos = np.cumsum(.8 + 4.5 * u ** 2); pos = pos / pos[-1] * (len(rev) - 1)
seg = np.interp(pos, np.arange(len(rev)), rev) * np.minimum(1, u * 6)
put(seg, 30.6, .5, 0, 'mus')

# ---------- часы ----------
def tick(hi=True, g=1.):
    n = int(SR * .05); t = np.arange(n) / SR
    y = bp(noise(.05), 1800, 5200 if hi else 3800) * np.exp(-t / .006) + np.sin(2 * np.pi * (2100 if hi else 1500) * t) * np.exp(-t / .01) * .4
    return y * g
for s in range(0, 39):
    if 24 <= s <= 27: continue
    loud = .1 if s < 24 else .07
    put(tick(s % 2 == 0), s + .5, loud, .35, 'amb')
for t0 in (24.9, 25.7, 26.5):
    put(tick(True, 1), t0, .55, 0); put(rs(tick(False, 1), .5), t0, .4, 0)

# ---------- синтез чихов и вдохов ----------
def sneeze(k=1., big=False):
    a = .55 / k; n = int(SR * a); t = np.arange(n) / SR
    inh = bp(noise(a), 500, 1400 + 900 * t[-1]) * (t / a) ** 2 * .5                       # «а-а-а»
    f0 = 170 * k; m = int(SR * .26 / k); tm = np.arange(m) / SR
    ch = bp(noise(.07 / k), 2400 * k, 7000) * np.exp(-np.arange(int(SR * .07 / k)) / SR / (.03 / k)) * 1.3   # «ч»
    ph = np.cumsum(2 * np.pi * f0 * (1.25 - .45 * tm / tm[-1]) / SR)
    oo = (np.sign(np.sin(ph)) * .4 + np.sin(ph)) * np.exp(-tm / (.09 / k)) * np.minimum(1, tm / .01)
    oo = lpv(oo, 900 * k) * 1.6 + bp(noise(.26 / k), 800, 3000)[:m] * np.exp(-tm / (.06 / k)) * .4
    y = np.concatenate([inh, ch, oo])
    return y
SF = os.path.join(os.path.dirname(__file__), '../assets/sfx')
def loadf(f, a=0, b=None):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(SF, f), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); x = x[int(a * SR):int(b * SR) if b else None]; x /= np.abs(x).max() + 1e-9
    n = min(len(x), int(.08 * SR)); x[-n:] *= np.linspace(1, 0, n); return x
# настоящие чихи (Freesound, CC0): крошечный в коробке, мой, великан сверху
put(rs(loadf('man-sneezing-sneeze-2-9b3eff.mp3', .8, 2.4), 1.6), 10.2 - (1.54 - .8) / 1.6, .4, -.2)
put(loadf('sneeze-d1bd38.mp3', .6, 2.4), 13.22 - (1.29 - .6), .9, .1)
g = verb(lpv(rs(loadf('man-sneezing-sneeze-694a72.mp3', .5, 2.0), .62), 3000), 2.2, .45); put(g, 16.2 - (1.17 - .5) / .62, 1.0, 0)
def gasp(g=1.):
    n = int(SR * .28); t = np.arange(n) / SR; return bp(noise(.28), 900, 3200) * np.sin(np.pi * t / t[-1]) ** 1.5 * g
put(gasp(), 15.35, .5, .1); put(gasp(.8), 6.6, .45, .1); put(gasp(.7), 27.05, .5, 0)

# ---------- SFX из библиотек ----------
L = lambda i: load(i)
thump = lambda: np.sin(2 * np.pi * np.cumsum(np.linspace(90, 40, int(SR * .35))) / SR) * np.exp(-np.arange(int(SR * .35)) / SR / .1)
put(L('impact-heavy-soft'), .15, .9); put(thump(), .15, .8); put(L('click-clip-firm'), .15, .5)
put(L('impact-light-soft'), .9, .8); put(thump(), .9, .5)
put(L('whoosh-fast-soft'), 1.45, .5)
put(L('click-toggle-firm'), 3.55, .45, .3)
put(rs(L('props-tape'), .85), 3.85, .7, -.1)
put(L('props-box-open'), 4.6, .7, -.3); put(rs(L('props-box-open'), 1.1), 4.95, .6, .3)
for i, m in enumerate([76, 79, 83, 88]): put(tine(m, .5, 1.2), 4.7 + i * .12, .25, .2, 'mus')
put(L('whoosh-fast-soft'), 6.5, .35); put(L('impact-deep-soft'), 6.82, .8); put(rs(L('impact-light-soft'), 1.3), 7.05, .3)
put(L('whoosh-slow-soft'), 7.4, .45)
# крошечный горшок внутри
for i in range(3): put(tine(91 + i * 2, .4, .5), 14.9 + i * .08, .2, -.2, 'mus')
# ветер от великанского чиха
nw = noise(1.6); tw = np.arange(len(nw)) / SR; gust = bp(nw, 200, 1600) * np.sin(np.pi * np.minimum(1, tw / 1.6)) ** 2
put(loadf('wind-gust-72f441.mp3', 0, 2.4) * np.minimum(1, np.arange(int(2.4 * SR)) / SR / .15), 16.15, .8, 0); put(L('bass-rumble-medium'), 16.1, .6)
# качание горшка: дребезг и скрип
for i, tt in enumerate(np.arange(16.35, 17.45, .11)): put(rs(L('impact-light-firm'), 1.6 + .2 * (i % 3)), tt, .18 + i * .015, .2)
put(L('whoosh-fast-hard'), 17.12, .6)
fl = np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 600, int(SR * .45))) / SR) * .25; put(fl, 17.5, .25, .2)
put(L('digital-corrupt'), 17.5, .35)
put(L('impact-heavy-firm'), 17.96, .8, .15); put(loadf('breaking-pot-long-ae5adf.mp3', .7, 2.6), 17.96 - .12, 1.0, .15)   # настоящий разбитый горшок
put(rs(loadf('breaking-pot-low-5b77f8.mp3', 1.3, 2.4), 1.7), 14.81 - .065, .35, -.2)                                    # крошечный горшок в коробке
dirt = bp(noise(.6), 300, 2500) * np.exp(-np.arange(int(SR * .6)) / SR / .15); put(dirt, 17.97, .5, .1)
put(L('pop-large-in'), 19.7, .4); put(L('impact-light-firm'), 20.05, .55); put(rs(L('impact-light-firm'), .9), 20.08, .5)
# страх: сердце, гул, звон
hb = L('bsb-heartbeat-slow'); put(hb[:int(SR * 3.4)] * np.linspace(.3, 1, int(SR * 3.4))[:len(hb[:int(SR * 3.4)])], 24.0, .7)
n = int(SR * 3.4); tdr = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 55 * tdr) + .5 * np.sin(2 * np.pi * 58.3 * tdr) + .3 * np.sin(2 * np.pi * 110.7 * tdr)) * (tdr / 3.4) ** 2
put(drone, 23.9, .35, 0, 'amb')
ring = np.sin(2 * np.pi * 6200 * tdr) * (tdr / 3.4) ** 3 * .05; put(ring, 23.9, .5)
put(L('sting-airy-short'), 24.0, .25)
# взгляд вверх → тишина → удар
put(L('cinematic-thunder-big'), 27.62, .55); put(L('impact-deep-hard'), 27.62, .8)
n = int(SR * 3); tp = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * mtof(m) * tp + i) for i, m in enumerate([45, 52, 57, 60, 64])) * np.minimum(1, tp / 1.2) * np.exp(-np.maximum(0, tp - 2) * 2)
put(lpv(pad, 1500) * .12, 28.3, .8, 0, 'mus')
put(L('whoosh-slow-soft'), 28.4, .5); put(L('whoosh-slow-soft'), 29.95, .4)
# перемотка
cas = L('bsb-cassette-rewind'); put(cas[:int(SR * 7.4)], 30.6, .5)
for k in range(9):
    tk = 30.6 + 7.4 * np.sqrt((k + 1) / 9) - .12
    put(rs(L('whoosh-fast-medium'), 1 + k * .08), tk, .3, (-1) ** k * .3)
put(L('cinematic-slam-big')[:int(1.3 * SR)] * np.linspace(1, 0, int(1.3 * SR)) ** 2, 37.95, .9); put(L('impact-deep-hard'), 38.0, .8); put(thump(), 38.0, .8)
# ночная комната: тихий шум и далёкий город на всё время
amb = lpv(noise(NE / SR), 500) * .6 + lpv(noise(NE / SR), 120) * 1.2
put(amb[:N] * .05, 0, 1, 0, 'amb')

# петля: всё, что звучит после конца, слышно в начале
# первый просмотр начинается чисто: ничего не переливается через стык, только ровный фон комнаты и ритм часов
fo = np.linspace(1, 0, int(.3 * SR))
for b in bus:
    bus[b] = bus[b][:N].copy(); bus[b][-len(fo):] *= fo[:, None] if b != 'amb' else 1
# ---------- голос героя ----------
LNG = sys.argv[1] if len(sys.argv) > 1 else 'ru'
VO = json.load(open(os.path.join(os.path.dirname(__file__), 'vo_times.json' if LNG == 'ru' else 'vo_times_en.json')))
vo = np.zeros((N, 2)); act = np.zeros(N)
for vid, t0 in VO.items():
    f = os.path.join(os.path.dirname(__file__), '../assets/vo/ep1' + ('' if LNG == 'ru' else '_en'), vid + '.wav')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float); x /= np.abs(x).max() + 1e-9
    x = x - lpv(x, 90) * .9
    x *= {'l6': 1.5, 'e6': 1.9, 'e7': 1.5}.get(vid, 1.)                                   # убрать гул
    i = int(t0 * SR); x = x[:N - i]; vo[i:i + len(x), 0] += x; vo[i:i + len(x), 1] += x; act[i:i + len(x)] = 1
duck = 1 - .82 * np.clip(lpv(act, 4) * 1.6, 0, 1)                # музыка и фон под голосом ≈ −10 дБ
for b, k in (('mus', 1), ('amb', 1), ('sfx', .8)):
    bus[b] *= (1 - (1 - duck) * k)[:, None]
M = bus['mus'] * .9 + bus['sfx'] * 1.0 + bus['amb'] * 1.0 + vo * 1.0
bg = bus['mus'] * .9 + bus['sfx'] + bus['amb']
for vid, t0 in VO.items():
    i, j = int(t0 * SR), int((t0 + 1.2) * SR)
    r = lambda a: 20 * np.log10(np.sqrt(np.mean(a[i:j] ** 2)) + 1e-9)
    print(vid, 'голос−фон', round(r(vo * 1.0) - r(bg), 1), 'дБ')
k = int(.03 * SR); M[:k] *= 1; 
M /= np.abs(M).max() * 1.12
out = os.path.join(os.path.dirname(__file__), 'mix.wav' if LNG == 'ru' else 'mix_en.wav')
import wave
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((M * 32767).astype('<i2').tobytes())
print('ok', out)
