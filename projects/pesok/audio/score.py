#!/usr/bin/env python3
"""ПЕСОК — звук: реальные записи песка на стекле (CC0) + своя музыка (шкатулка, гитара Карплус-Стронг, струнный пад).
python3 projects/pesok/audio/score.py → projects/pesok/audio/mix.wav (48 кГц, стерео)
Таймкоды — из story.js (SHOTS)."""
import numpy as np, wave, json, os
SR = 48000
DUR = 57.0
ROOT = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(ROOT, '../../../assets/sfx-library')
rng = np.random.default_rng(7)
N = int(SR * (DUR + 3))
L = np.zeros(N); R = np.zeros(N); RV = np.zeros(N)  # RV — посыл на реверб (моно)

def tt(d): return np.arange(int(SR * d)) / SR
def add(sig, t, g=1., pan=0., rev=0.):
    i = int(t * SR); sig = np.asarray(sig) * g
    if i >= N: return
    n = min(len(sig), N - i); s = sig[:n]
    L[i:i+n] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+n] += s * np.sqrt((1 + pan) / 2) * 1.414
    if rev: RV[i:i+n] += s * rev
def env(n, a, d, sus=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-np.maximum(0, t - a) / d)
def adsr(d, a, r):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, np.maximum(0, d - t) / max(r, 1e-4))
def white(d): return rng.standard_normal(int(SR * d))
def brown(d):
    x = np.cumsum(rng.standard_normal(int(SR * d))); x -= np.convolve(x, np.ones(2001) / 2001, 'same'); return x / (np.abs(x).max() + 1e-9)
def fftfilt(x, lo=0, hi=SR / 2, soft=.25):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo > 0: m *= np.clip((f - lo * (1 - soft)) / (lo * soft * 2 + 1e-9), 0, 1)
    if hi < SR / 2: m *= np.clip((hi * (1 + soft) - f) / (hi * soft * 2 + 1e-9), 0, 1)
    return np.fft.irfft(X * m, len(x))
def sweep(x, fc, bw=.6):  # полоса, центр которой меняется во времени: fc(t_array)
    W = 4096; H = 1024; win = np.hanning(W); out = np.zeros(len(x) + W); norm = np.zeros(len(x) + W)
    f = np.fft.rfftfreq(W, 1 / SR); xp = np.concatenate([x, np.zeros(W)])
    for i in range(0, len(x), H):
        c = fc(i / SR); m = np.exp(-0.5 * (np.log2((f + 1) / c) / bw) ** 2)
        out[i:i+W] += np.fft.irfft(np.fft.rfft(xp[i:i+W] * win) * m, W) * win; norm[i:i+W] += win ** 2
    return (out / np.maximum(norm, 1e-3))[:len(x)]
def saw(f, d, det=0.):
    t = tt(d); ph = np.cumsum(np.full(len(t), f) if np.isscalar(f) else f) / SR
    return 2 * (ph % 1) - 1
def sq(f, d, duty=.5):
    t = tt(d); ph = np.cumsum(np.full(len(t), f) if np.isscalar(f) else f) / SR; return np.where(ph % 1 < duty, 1., -1.)
def sine(f, d):
    ph = np.cumsum(np.full(int(SR * d), f) if np.isscalar(f) else f) / SR; return np.sin(2 * np.pi * ph)
def crush(x, bits=6, hold=4): y = np.round(x * 2 ** bits) / 2 ** bits; return np.repeat(y[::hold], hold)[:len(x)]
def lib(name, rate=1.):
    meta = {d['id']: d for d in json.load(open(os.path.join(LIB, 'index.json')))}[name]
    import subprocess
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', os.path.join(LIB, meta['file']), '-f', 'f32le', '-ac', '1', '-ar', str(int(SR / rate)), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)
def nt(n): return 440 * 2 ** ((n - 69) / 12)  # MIDI → Гц

E = lambda k: 4 * k ** 3 if k < .5 else 1 - (-2 * k + 2) ** 3 / 2
# ---------------- таймкоды ----------------
S = [0, 2.55, 6.25, 9.25, 12.45, 15.45, 19.25, 23.25, 25.85, 28.25, 32.65, 36.05, 41.65]
IMPACT = S[2] + .32

SFX = os.path.join(ROOT, '../assets/sfx')
_DUR = {}
def rec(name, off=0., dur=None, rate=1.):
    import subprocess
    if name not in _DUR: _DUR[name] = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(SFX, name + '.mp3')], capture_output=True, text=True).stdout)
    span = _DUR[name] - (dur or 0) * rate - .1
    off = off % max(span, .1)
    a = ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(off)] + (['-t', str(dur * rate)] if dur else []) + ['-i', os.path.join(SFX, name + '.mp3'), '-f', 'f32le', '-ac', '1', '-ar', str(int(SR / rate)), '-']
    x = np.frombuffer(subprocess.run(a, capture_output=True).stdout, dtype=np.float32).astype(float)
    return x
def norm(x, rms=.1):
    r = np.sqrt(np.mean(x ** 2)) + 1e-9; return x * rms / r
def fade(x, a=.05, b=.2):
    n = len(x); e = np.ones(n); na, nb = int(a * SR), int(b * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nb: e[-nb:] = np.minimum(e[-nb:], np.linspace(1, 0, nb))
    return x * e

# ---------------- таймкоды (story.js)
SH = [0, 3.4, 7.4, 13.4, 17.6, 22.8, 27.0, 31.2, 35.0, 38.6, 42.6, 45.2, 51.6, 57.0]
TR = {3.4: 1.2, 7.4: 1.1, 13.4: 1.1, 17.6: 1.0, 22.8: 1.1, 27.0: 1.2, 31.2: 1.1, 35.0: .9, 38.6: 1.0, 42.6: .7, 45.2: 1.2}
LINES = [(8.5, 'Daddy, build a castle with me?'), (10.85, 'Later.'), (14.4, 'Can we go to the beach?'), (15.85, 'Later, sweetie.'),
         (19.2, 'Dad, look!'), (20.55, 'Later.'), (23.3, 'Beach this weekend?'), (25.0, 'Later, Dad.'), (27.9, 'Bye, Dad!'),
         (40.5, 'Grandpa, build a castle with me?')]

# ---------------- инструменты
def musicbox(f, d=2.2, v=1.):
    t = tt(d); x = np.zeros(len(t))
    for r, a, dec in [(1, 1, 1.4), (2.0, .25, .5), (3.0, .18, .35), (5.4, .12, .12), (8.9, .05, .05)]:
        x += a * np.sin(2 * np.pi * f * r * t + r) * np.exp(-t / dec)
    click = white(.004) * np.linspace(1, 0, int(SR * .004)) * .3
    x[:len(click)] += click
    return x * v * np.minimum(1, t / .002)
def pluck(f, d=2.5, v=1., bright=.5):   # Карплус-Стронг (нейлоновая струна)
    n = int(SR * d); p = int(SR / f); buf = rng.uniform(-1, 1, p) * (1 - bright) + np.sin(np.linspace(0, 2 * np.pi, p)) * bright
    out = np.zeros(n); b = buf.copy(); i = 0
    for k in range(n):
        out[k] = b[i]; j = (i + 1) % p; b[i] = .4985 * (b[i] + b[j]); i = j
    return fftfilt(out, 60, 5000) * v
def pad(f, d, v=1., att=.8, rel=1.2, cold=0.):  # струнный пад: пилы с вибрато, мягкий фильтр
    t = tt(d); vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.)
    x = sum(saw(f * dt * vib, d) for dt in (1, 1.004, .996)) / 3 + .3 * saw(f * 2 * vib, d)
    x = fftfilt(x, 80, 1600 - cold * 800) * adsr(d, att, rel)
    return x * v
def bell(f, d=3., v=1.):
    t = tt(d); return v * sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dec) for r, a, dec in [(1, 1, 2.2), (2.76, .4, .9), (5.4, .2, .4), (8.93, .1, .2)])

# ---------------- музыка: тема «замок» (ре мажор, 3/4)
BPM = 84; BT = 60 / BPM
MEL = [(78, 2), (81, 1), (79, 1), (78, 1), (76, 1), (74, 3), (69, 2), (71, 1), (73, 1), (74, 1), (76, 1), (78, 3),
       (79, 1), (78, 1), (76, 1), (74, 1), (76, 1), (73, 1), (74, 3)]
CH = [[50, 57, 62], [55, 59, 62], [50, 57, 62], [45, 52, 57], [45, 52, 61], [50, 57, 62], [55, 59, 62], [45, 52, 61], [50, 57, 62]]
def theme(t0, bars=9, mb=1., gt=1., st=0., speed=1., detune=0., minor=False, start_bar=0, transpose=0, mbdec=1.):
    bt = BT / speed; tcur = t0; bi = 0; acc = 0
    seq = []
    for n, b in MEL:
        seq.append((tcur, n, b)); tcur += b * bt
    for (ts, n, b) in seq:
        bar = int((ts - t0) / (3 * bt) + 1e-6)
        if bar < start_bar or bar >= start_bar + bars: continue
        nn = n + transpose
        if minor and nn % 12 in (6,): nn -= 1   # F# → F (ре минор-окраска)
        wob = 1 + detune * (rng.random() - .5) * .06
        if mb > 0: add(musicbox(nt(nn) * wob, 2.4 * mbdec, .16 * mb), ts - start_bar * 3 * bt, pan=.25, rev=.35)
    for i, chd in enumerate(CH):
        if i < start_bar or i >= start_bar + bars: continue
        tb = t0 + (i - start_bar) * 3 * bt
        chd2 = [c + transpose - (1 if minor and (c + transpose) % 12 == 6 else 0) for c in chd]
        if gt > 0:
            for k, c in enumerate([chd2[0], chd2[1], chd2[2], chd2[1] + 12, chd2[2], chd2[1]]):
                add(pluck(nt(c) * (1 + detune * (rng.random() - .5) * .03), 1.8, .12 * gt, .4), tb + k * bt / 2, pan=-.25, rev=.25)
        if st > 0:
            for c in chd2: add(pad(nt(c), 3 * bt + .9, .05 * st, .5, .9), tb, pan=(c % 3 - 1) * .3, rev=.5)
    return t0 + bars * 3 * bt

# ---------------- монтаж музыки
# хук: три ноты шкатулки + низкий удар
for i, n in enumerate([78, 81, 86]): add(musicbox(nt(n), 2.6, .2), .02 + i * .22, pan=.2, rev=.4)
add(sine(np.linspace(70, 38, int(SR * 1.6)), 1.6) * env(int(SR * 1.6), .004, .45) * .55, 0.0)
add(fftfilt(brown(1.6), 20, 140) * env(int(SR * 1.6), .002, .35) * .35, 0.0)
add(sine(np.linspace(60, 36, int(SR * 1.4)), 1.4) * env(int(SR * 1.4), .004, .4) * .4, 3.3)   # удар на входе в историю
# 3.4–10.85: тема тепло (шкатулка + гитара)
theme(3.6, bars=4, mb=1, gt=.8)
theme(3.6 + 4 * 3 * BT, bars=1, mb=.9, gt=.7, start_bar=4)    # до «Later.»
# после «Later.» — висит одна нота, потом минор
add(musicbox(nt(69), 3.5, .14), 10.95, rev=.6)
add(pad(nt(47), 3.5, .05, 1.2, 1.5), 11.2, rev=.5)
theme(12.2, bars=3, mb=.7, gt=.5, minor=True, start_bar=0, transpose=-2)     # дождь: тише и в миноре
theme(12.2 + 3 * 3 * BT, bars=2, mb=.6, gt=.4, minor=True, start_bar=3, transpose=-2)
theme(18.2, bars=3, mb=.8, gt=.6, start_bar=0)                                # пляж
add(musicbox(nt(66), 3.0, .13), 20.6, rev=.6)                                 # «Later.» — опять повисшая нота
add(pad(nt(43), 6.0, .05, 1.5, 2.0, cold=.5), 22.5, rev=.6)                   # подросток: холод
add(pad(nt(50), 4.0, .04, 1.5, 2.0, cold=.5), 23.6, rev=.6)
theme(27.6, bars=2, mb=0, gt=.8, start_bar=3)                                 # отъезд: гитара
add(musicbox(nt(74), 3.0, .12), 29.9, rev=.6); add(musicbox(nt(69), 3.0, .1), 30.4, rev=.6)
# 31.2–35: шкатулка ускоряется, расстраивается и заводится до остановки
tcur = 31.3; sp = 1.3
for i, (n, b) in enumerate(MEL * 2):
    if tcur > 35.0: break
    k = (tcur - 31.3) / 3.7
    add(musicbox(nt(n) * (1 - k * .06 * (i % 2)), 1.6, .13 * (1 - k * .5)), tcur, pan=.2, rev=.3)
    tcur += b * BT / (sp + k * 1.8)
# заводной механизм замедляется и щёлкает
for i in range(7): add(musicbox(nt(74 - i * 2) * .985, 1.4, .1 * (1 - i / 9)), 35.05 + i * (.25 + i * .09), rev=.5)
add(pad(nt(38), 4.0, .045, 1.0, 1.5, cold=.8), 35.0, rev=.6)
# 40.5: внучка — шкатулка возвращается робко
for i, (n, b) in enumerate(MEL[:6]): add(musicbox(nt(n), 2.4, .12), 40.6 + sum(bb for _, bb in MEL[:i]) * BT * 1.05, pan=.2, rev=.5)
# 43.4 «NOW.» — свет: струнный аккорд и колокольчик
for c in [50, 57, 62, 66]: add(pad(nt(c), 3.4, .06, .35, 1.2), 43.3, rev=.6)
add(bell(nt(86), 3.5, .1), 43.55, rev=.5)
# 45.2–51.2: полная тема
theme(45.25, bars=9, mb=1.1, gt=1., st=1.)
# 51.2 последняя песчинка — колокольчик, финальный аккорд и тишина песка
add(bell(nt(90), 4.0, .14), 51.22, rev=.7); add(bell(nt(86), 4.0, .08), 51.25, rev=.7)
for c in [38, 50, 57, 62, 66, 69]: add(pad(nt(c), 5.6, .05, 1.2, 2.8), 51.4, rev=.6)
for i, n in enumerate([74, 78, 81, 86]): add(musicbox(nt(n), 3.5, .11), 52.0 + i * .5, pan=.2, rev=.6)
MUS_END = True

# ---------------- шумы и foley (реальные записи)
def bed(name, t0, t1, off, rms, fi=.6, fo=.8, pan=0., rev=0., rate=1.):
    x = rec(name, off, t1 - t0, rate); x = fade(norm(x, rms), fi, fo); add(x, t0, pan=pan, rev=rev)
# песочные часы — шорох всё время, громче в хуке и на крупном плане
bed('hourglass', 0, 3.6, 20, .06, .01, .4)
bed('hourglass', 3.4, 35.2, 60, .012, 1., 1.)
bed('hourglass', 35.0, 38.8, 120, .05, .3, .6)
bed('hourglass', 45.2, 51.25, 200, .02, 1.2, .05)          # струя останавливается на последней песчинке
bed('pour-glass1', 0, 2.2, 3, .05, .01, .9, pan=-.1)
# переходы — ладонь сметает песок / песок сыплется
for i, (t, d) in enumerate(TR.items()):
    nm = ['pour-glass1', 'brush', 'grainy', 'pour-glass2', 'brush', 'pour-sand', 'grainy', 'brush', 'grainy', 'pour-glass2', 'pour-glass1'][i]
    bed(nm, t - .05, t + d + .2, 2 + i * 1.7, .07, .12, .35, pan=(i % 3 - 1) * .4, rev=.15)
# письмо пальцем — короткий скрип песка
def writing(t, n):
    d = max(.35, n * .045)
    x = rec('brush', 10 + (t * 3.7) % 30, d + .1); x = fftfilt(x, 1500, 9000); x = fade(norm(x, .03), .02, .08)
    add(x, t, pan=.1, rev=.1)
for t, s in LINES: writing(t, len(s))
writing(0.0, 15); writing(.55, 12); writing(4.4, 14); writing(43.6, 4)
writing(51.8, 24); writing(53.3, 18); writing(53.9, 15)
# дождь, прибой, чайки
bed('rain', 13.0, 18.2, 20, .06, .8, .9, rev=.1)
bed('surf', 17.4, 23.2, 2, .05, .8, 1.0)
x = rec('surf', 14, 3.0); add(fade(norm(x, .1), .5, 1.2), 20.9)                 # волна смывает замок
bed('surf', 45.0, 57.0, 8, .04, 1.2, .1)
bed('seagull', 17.9, 19.6, 0, .03, .05, .4, pan=-.4, rev=.3); bed('seagull', 46.2, 47.8, 1.5, .025, .05, .4, pan=.4, rev=.3)
# шаги
bed('childsteps', 7.4, 8.7, 4, .05, .05, .2, pan=-.4)
bed('steps', 38.6, 39.9, 6, .05, .05, .25, pan=-.2, rate=1.15)
bed('steps', 13.4, 17.6, 12, .018, .5, .5, pan=.3)                              # папа ходит с телефоном
bed('steps', 28.85, 29.3, 20, .04, .05, .2, pan=.1)
# библиотека CC0
def LB(id_, t, g=1., pan=0., rev=0., rate=1., dur=None, off=0.):
    x = lib(id_, rate)
    if off: x = x[int(off * SR):]
    if dur: x = fade(x[:int(dur * SR)], .005, .1)
    add(x, t, g, pan, rev)
for i in range(30):   # клавиатура
    t = 7.5 + i * .11 + rng.random() * .05
    if t < 10.8 or 11.6 < t < 13.0: LB(['keyboard-letter-soft', 'keyboard-letter-medium'][i % 2], t, .18, .3)
for i in range(34):
    t = 31.3 + i * .11; LB('keyboard-letter-soft', t, .12, .3)
for t in (8.75, 9.2, 9.65, 10.1): LB('foley-fabric-touch', t, .35, -.2)            # дёргает за рукав
LB('foley-plastic-touch', 11.42, .5, -.3); LB('impact-light-soft', 11.45, .35, -.3)   # ставит ведёрко
for i in range(8): LB('impact-light-soft', 17.7 + i * .2, .18, .2)                     # хлопает по замку
LB('foley-fabric-slide', 24.95, .35, .3)                                              # надевает наушники
bed('doorclose', 25.95, 26.65, 0, .14, .005, .2, pan=.3, rev=.3)
LB('bsb-car-door-outside', 29.3, .45, .3, dur=1.2)
LB('bsb-car-start-depart', 29.35, .4, .3, dur=2.6, off=2.4)
LB('time-clock', 31.25, .35, 0); LB('time-clock-fast', 33.0, .35, 0)
for i in range(5): LB('whoosh-fast-soft', 31.5 + i * .77, .25, -.3)                  # листки календаря
LB('bsb-heartbeat-slow', 35.6, .5, 0, dur=3.0)
LB('props-doorbell', 38.75, .45, .3, rev=.2)
LB('bsb-door-creak-open', 39.75, .35, .3, dur=1.4)
for i in range(10): LB('impact-light-soft', 45.7 + i * .3, .16, (i % 2 - .5) * .4)    # строят замок
LB('impact-medium-soft', 47.2, .35, -.2)                                              # ведёрко — башня
LB('foley-plastic-slide', 46.6, .3, -.2)

# ---------------- реверб и сведение
def reverb(x, sec=2.4):
    n = int(SR * sec); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (sec / 6.9)); ir = fftfilt(ir, 200, 6000)
    m = len(x) + n; F = np.fft.rfft(np.pad(x, (0, n))) * np.fft.rfft(np.pad(ir, (0, len(x))))
    return np.fft.irfft(F, m)[:len(x)] / np.sqrt(np.sum(ir ** 2)) * .35
rv = reverb(RV)
Lm = L + rv; Rm = R + np.roll(rv, int(SR * .013))
end = int(SR * DUR)
Lm, Rm = Lm[:end], Rm[:end]
pk = max(np.abs(Lm).max(), np.abs(Rm).max()); Lm /= pk / .8; Rm /= pk / .8
st = np.stack([Lm, Rm], 1); out = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ROOT, 'mix.wav'), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('ok mix.wav', DUR)
