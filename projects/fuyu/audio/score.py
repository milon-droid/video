#!/usr/bin/env python3
"""Звук «20 WINTERS»: кабуки-партитура из живых записей (сямисэн по нотам, цукэ, хёсиги, тайко) + атмосферы и шумы.
python3 audio/score.py  → audio/mix.wav (48 кГц стерео, без мастера)"""
import json, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); REC = D + '/rec/'; LIB = os.path.abspath(D + '/../../../assets/sfx-library') + '/'
SR = 48000
cj = json.load(open(D + '/cues.json')); DUR = cj['dur'] + 0.6
N = int(DUR * SR)
bus = {k: np.zeros((N, 2), np.float32) for k in ('amb', 'mus', 'sfx')}
_c = {}
def load(f, a=0, b=None):
    k = (f, a, b)
    if k in _c: return _c[k]
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(a)] + (['-t', str(b - a)] if b else []) + ['-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
    _c[k] = x; return x
R = lambda n: REC + n
L = lambda n: LIB + n
def fft_filter(x, lp=None, hp=None):
    n = len(x); X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lp: g *= 1 / np.sqrt(1 + (f / lp) ** 4)
    if hp: g *= 1 / np.sqrt(1 + (hp / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g[:, None], n, axis=0).astype(np.float32)
def rate(x, r):  # варислоу: r>1 выше и короче
    if r == 1: return x
    n = int(len(x) / r); i = np.arange(n) * r
    return np.stack([np.interp(i, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
def env(x, fi=0.005, fo=0.05):
    n = len(x); e = np.ones(n, np.float32)
    a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] *= np.linspace(1, 0, b)
    return x * e[:, None]
def put(b, x, t, g=1.0, pan=0.0, dur=None, fi=0.005, fo=0.05, r=1, lp=None, hp=None, loop=False):
    if x is None or len(x) == 0: return
    x = rate(x, r)
    if dur:
        n = int(dur * SR)
        if loop and len(x) < n: x = np.tile(x, (n // len(x) + 1, 1))
        x = x[:n]
    if lp or hp: x = fft_filter(x, lp, hp)
    x = env(x, fi, fo) * g
    pl, pr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(x)); x = x[:j - i]
    bus[b][i:j, 0] += x[:, 0] * pl; bus[b][i:j, 1] += x[:, 1] * pr
# ---------- реверб (свёртка с синтетическим залом) ----------
def ir(t60=1.6, pre=0.012):
    n = int(t60 * SR); rng = np.random.default_rng(3); t = np.arange(n) / SR
    h = rng.standard_normal((n, 2)).astype(np.float32) * np.exp(-6.9 * t / t60)[:, None]
    h[:int(pre * SR)] = 0; h = fft_filter(h, lp=6000, hp=200); return h / np.sqrt((h ** 2).sum()) * 0.9
def conv(x, h):
    n = len(x) + len(h); m = 1 << (n - 1).bit_length()
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], m) * np.fft.rfft(h[:, c], m), m)[:len(x)] for c in (0, 1)], 1).astype(np.float32)
# ---------- инструменты ----------
SHAM = load(R('analog-shamisen-1-stereo-d2-d6-6409d5.mp3'))
def sham_note(n, length=1.9):
    a = int((2 * n + 0.0) * SR); x = SHAM[a:a + int(length * SR)].copy()
    k = np.argmax(np.abs(x[:int(.25 * SR), 0]) > 0.02)  # срез до атаки
    return x[max(0, k - 40):]
ROOT = 12  # D3
IN = [0, 1, 5, 7, 8]      # лад мияко-буси (тёмный)
YO = [0, 2, 5, 7, 9]      # лад ё (светлый)
def deg(scale, d, root=ROOT):
    o, i = divmod(d, 5); return root + scale[i] + 12 * o
def sham(t, d, g=.5, scale=IN, length=1.6, pan=0, root=ROOT):
    n = deg(scale, d, root); n = max(0, min(48, n))
    put('mus', sham_note(n, length), t, g, pan, fo=.25)
WB = load(R('wood-block-hit-c807c3.mp3')); WH = load(R('wood-hit-f59ad5.mp3')); WB2 = load(R('wood-block-2d74df.mp3'))
def tsuke(t, g=1.0):  # «бата-н»: два удара деревом по доске
    for k, dt in ((0, 0), (1, .045)):
        put('sfx', WH, t + dt, g * (.7 if k == 0 else 1.0), 0, r=.82); put('sfx', WB, t + dt, g * .5, 0, r=.7, lp=5000)
def hyoshigi(t, g=1.0):
    put('sfx', WB2, t, g * .9, -.1, r=1.25, hp=600); put('sfx', WB, t + .004, g * .6, .1, r=1.4)
TT1 = load(R('taiko-tom-1-short-dc1506.mp3')); TT4 = load(R('taiko-tom-4-c8e139.mp3'))
DRUMBIG = load(L('sfx-kit/sounds/cinematic-hits/cinematic-drum-big.wav'))
def taiko(t, g=1.0, big=False):
    put('mus', TT4, t, g * .9, 0, r=.62, lp=2500); put('mus', TT1, t, g * .5, 0, r=.55, lp=1800)
    if big and DRUMBIG is not None: put('mus', DRUMBIG, t, g * .55, 0, lp=3000)
HB = load(R('single-heartbeat-clean-hq-beatsmith-f17a90.mp3'))
# ---------- карта сигналов из story.js ----------
idx = {d['id']: d for d in json.load(open(LIB + 'index.json'))}
def lib(i): return load(LIB + idx[i]['file']) if i in idx else None
FIRE = load(R('fire-crackling-c0194a.mp3')); WIND = load(R('atm-int-wind-howl-cold-winter-09-stereo-257c93.mp3'))
RAIN = load(R('rain-heavy-close-to-window-to-05-3f1ee1.mp3')); SNOW = load(R('footsteps-snow-crunchy-close-391f5d.mp3'))
CROWS = load(R('crows-in-tree-873500.mp3')); BIRDS = load(R('french-birds-morning-spring-5e6822.mp3'), 30, 45)
BELL = load(R('temple-bell-valley-of-the-temples-5ef835.mp3'), 0, 9)
UNSH = load(R('unsheathing-a-katana-sword-blade-sfx-eebb19.mp3')); SHEATH = load(R('katana-sheath-787844.mp3'), 0, 1.5)
SW1 = load(R('swosh-swinging-sword-37-084c97.mp3')); SW2 = load(R('fast-sword-swing-sound-518ead.mp3')); SWN = load(R('fx-swoosh-normal-for-swords-sticks-punches-etc-82951e.mp3'))
PR1 = load(R('paper-ripping-ee6074.mp3')); PR3 = load(R('paper-rip-3-1512dd.mp3')); PR4 = load(R('paper-rip-4-1ba3c1.mp3'))
def noise(d, lp=None, hp=None, seed=0):
    x = np.random.default_rng(seed).standard_normal((int(d * SR), 2)).astype(np.float32) * .2
    return fft_filter(x, lp, hp)
def swish(t, g=.4, d=.45, lp=3000, hp=500):  # барэн / мазок кистью: шорох бумаги
    x = noise(d, lp, hp, int(t * 100)); e = np.sin(np.linspace(0, np.pi, len(x))) ** 2; put('sfx', x * e[:, None], t, g)
def drone(t, d, g=.4, rise=False):
    n = int(d * SR); tt = np.arange(n) / SR
    f0 = 55 * (1 + (tt / d) * .5 if rise else 1)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    x = (np.sin(ph) + .4 * np.sin(2.01 * ph) + .15 * np.sin(3.02 * ph)) * .25
    x = x * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .5) * (1 + (tt / d) * 1.5 if rise else 1)
    put('mus', np.stack([x, x * .97], 1).astype(np.float32), t, g)
def C(t, id, g=1, o={}):
    d = o.get('dur')
    if id == 'hyoshigi_double': hyoshigi(t, g); hyoshigi(t + .26, g * 1.1)
    elif id == 'hyoshigi_roll':
        tt = t; dt = .32
        for k in range(16): hyoshigi(tt, g * (.55 + k / 30)); tt += dt; dt = max(.05, dt * .82)
        hyoshigi(tt + .25, g * 1.2)
    elif id == 'room_tone_fire': put('amb', FIRE, t, g * .55, 0, dur=d, fi=.3, fo=.4, loop=True)
    elif id in ('wind_cold', 'wind_howl', 'wind_soft'): put('amb', WIND[int((t * 7 % 40) * SR):], t, g * (.8 if id != 'wind_soft' else .45), 0, dur=d, fi=.5, fo=.6, lp=6000 if id == 'wind_soft' else None)
    elif id == 'rain': put('amb', RAIN, t, g * .9, 0, dur=d, fi=.15, fo=.3, loop=True)
    elif id == 'footsteps_snow': put('amb', SNOW[int(3 * SR):], t, g * .7, 0, dur=d, fi=.2, fo=.4)
    elif id == 'crows': put('amb', CROWS, t, g * .7, .3, dur=3.5, fo=.8)
    elif id in ('spring_birds', 'dawn_birds'): put('amb', BIRDS, t, g * .8, 0, dur=d, fi=.4, fo=.6)
    elif id == 'temple_bell': put('mus', BELL, t, g * .7, 0, dur=4.5, fo=1.5)
    elif id == 'sword_raise': put('sfx', SHEATH, t, g * .5, 0, dur=.6, r=1.2)
    elif id in ('swing', 'swing_big'):
        put('sfx', SW1 if id == 'swing' else SWN, t, g * .9, 0, r=.9 if id == 'swing' else .8)
        if id == 'swing_big': put('sfx', SW2, t + .05, g * .7, 0, r=.75)
    elif id == 'tsuke_hit': tsuke(t, g)
    elif id == 'tsuke_soft': put('sfx', WH, t, g * .55, 0, r=.8)
    elif id == 'taiko_big': taiko(t, g, True)
    elif id == 'splash':
        x = lib('props-splash'); put('sfx', x, t, g * .7, .2, r=.8, lp=4000)
    elif id == 'body_fall': put('sfx', lib('impact-heavy-soft'), t, g * .8, .2, lp=1500)
    elif id == 'heartbeat': put('sfx', HB, t, g * .9, 0, lp=900)
    elif id in ('drone_low', 'drone_rise'): drone(t, d or 2, g * .45, id == 'drone_rise')
    elif id == 'tear_drip': put('sfx', lib('click-clip-soft'), t + 1.1, g * .3, 0, r=.5, lp=3000)
    elif id == 'print_pass':
        for k in range(4): swish(t + k * .075, g * .32, .16, lp=4000, hp=900)
        put('sfx', WH, t + .32, g * .25, 0, r=.55, lp=1200)
    elif id == 'shamisen_motif':
        for k, (dd, dt) in enumerate([(9, 0), (8, .32), (7, .64), (5, 1.25), (6, 1.6), (5, 1.9)]): sham(t + dt, dd, g * .5, pan=-.2)
    elif id == 'shamisen_sad':
        for k, (dd, dt) in enumerate([(7, 0), (6, .45), (5, .9)]): sham(t + dt, dd, g * .45, pan=.2, length=1.9)
    elif id == 'shamisen_low':
        for dd, dt in [(2, 0), (1, .7), (0, 1.6)]: sham(t + dt, dd, g * .5, length=1.9)
    elif id == 'shamisen_pluck_hi': sham(t, 12, g * .4, length=1.5)
    elif id in ('shamisen_resolve', 'shamisen_end'):
        mel = [(5, 0), (6, .5), (7, 1.0), (9, 1.5), (8, 2.25), (7, 2.75), (5, 3.5)] if id == 'shamisen_resolve' else [(7, 0), (9, .6), (10, 1.2), (9, 2.1), (7, 2.9), (5, 3.8)]
        for dd, dt in mel: sham(t + dt, dd, g * .5, scale=YO, length=1.9)
    elif id == 'hook_motif':
        tsuke(t, .6); [sham(t + dt, dd, .55) for dd, dt in [(10, .05), (9, .3), (8, .55), (5, 1.1)]]
    elif id == 'hook_flash': put('sfx', SWN, t, g * .5, 0, r=1.4); tsuke(t + .02, .7)
    elif id == 'brush_stroke': swish(t, g * .45, .35, lp=2500, hp=400)
    elif id in ('paper_rip',): put('sfx', PR1, t, g * .8, -.2, dur=.7)
    elif id == 'paper_slash': put('sfx', PR3, t, g * .9, 0, r=.85); put('sfx', PR4, t + .02, g * .7, 0); put('sfx', lib('whoosh-fast-hard'), t - .05, g * .5, 0)
    elif id in ('paper_rustle', 'paper_flutter'): put('sfx', PR4, t, g * .45, 0, r=.7, lp=3000); swish(t + .1, g * .25, .5)
    elif id == 'snow_reach': put('sfx', SNOW[int(5 * SR):int(5.4 * SR)], t, g * .7)
    elif id == 'sword_drag': put('sfx', SHEATH[int(.2 * SR):], t, g * .4, 0, dur=.9, r=.8, lp=3000)
    elif id == 'seal_stamp': put('sfx', lib('impact-medium-soft'), t, g * .8, 0); put('sfx', WH, t, g * .3, 0, r=.6, lp=1500)
    elif id == 'unsheathe': put('sfx', UNSH, t, g * .8, 0, dur=1.2, fo=.3)
    elif id == 'thunder': put('amb', lib('cinematic-thunder-big'), t, g * .5, 0, lp=1500)
    elif id == 'wave_roar':
        put('amb', lib('bass-rumble-long'), t, g * .6, 0, dur=d)
        put('amb', noise(d, 1800, 120, 9) * np.linspace(.3, 1.2, int(d * SR))[:, None], t, g * .9, 0, fi=.4, fo=.4)
    elif id == 'water_splash': put('sfx', lib('props-splash'), t, g * .9, 0, r=.7); put('sfx', noise(.8, 6000, 800, 4), t, g * .5, 0, fo=.5)
    elif id == 'whoosh_hat': put('sfx', lib('whoosh-medium-hard'), t, g * .7, .3)
    elif id == 'door_slam': put('sfx', lib('foley-wood-slide'), t - .18, g * .8, 0, r=.8); put('sfx', WH, t + .05, g * .9, 0, r=.6); put('sfx', lib('impact-heavy-soft'), t + .05, g * .6)
    elif id == 'cloth': swish(t, g * .3, .4, lp=1800, hp=200)
    elif id == 'curtain': swish(t, g * .6, 1.0, lp=2000, hp=150)
    elif id == 'silence_drop': pass
    elif id == 'silence': pass
for c in cj['cues']: C(c['t'], c['id'], c['g'], c)
# ---------- музыка монтажа: тайко-ритм + остинато сямисэна (10.9–24.7) ----------
bpm = 120; beat = 60 / bpm
LOOP = load(R('taiko-drumloop-001-120-98b496.mp3'))
for k, t0 in enumerate(np.arange(10.9, 24.7, 8.0)):
    put('mus', LOOP, t0, .28 + k * .06, 0, dur=min(8.0, 24.75 - t0), fi=.3 if k == 0 else .01, fo=.4, lp=4000)
riff = [0, 2, 3, 2, 0, 1, 0, -1]
for b in range(int((24.6 - 10.9) / (beat / 2))):
    t = 10.9 + b * beat / 2; sec = int((t - 10.9) / 3.5)
    dd = riff[b % 8] + (5 if sec >= 2 else 0) + (2 if sec >= 3 else 0)
    if b % 16 in (14,): continue
    sham(t, dd + 5, .16 + sec * .03, length=.5, pan=(-.3 if b % 2 else .3))
# крещендо к ми-э: учащающиеся удары тайко
tt = 36.2; dt = .45
while tt < 38.1: taiko(tt, .35 + (tt - 36.2) * .3); tt += dt; dt = max(.09, dt * .8)
# ---------- эхо зала на музыку и цукэ ----------
H = ir(1.7)
bus['mus'] += conv(bus['mus'], H) * .35
bus['sfx'] += conv(bus['sfx'], ir(1.1)) * .18
# ---------- автоматизация: тишина перед ударом ----------
def duck(b, a, z, lvl, ramp=.25):
    i, j, r = int(a * SR), int(z * SR), int(ramp * SR); e = np.ones(N, np.float32)
    e[i:j] = lvl; e[max(0, i - r):i] = np.linspace(1, lvl, min(r, i)); e[j:j + r] = np.linspace(lvl, 1, len(e[j:j + r]))
    bus[b] *= e[:, None]
for b in ('amb', 'mus'): duck(b, 48.95, 50.05, .03, .35)
duck('sfx', 49.1, 49.98, .15, .2)
mix = bus['amb'] * .8 + bus['mus'] * 1.0 + bus['sfx'] * 1.0
pk = np.abs(mix).max(); mix = mix / pk * .89
import wave
w = wave.open(D + '/mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
print('ok', DUR, 'peak', pk)
