#!/usr/bin/env python3
"""Оригинальная фоновая музыка (синтез, без чужих треков и сэмплов).

    python3 tools/music.py -o music.wav --duration 30 [--style synthwave|trap|comedy] [--bpm 96] [--seed 1]

synthwave — неоновые 80-е / Майами: бочка-снейр, басовые восьмые, широкий пэд, арпеджио.
trap      — медленный хип-хоп бит: 808-бас, хэты с триолями, мягкий пэд.
tynys     — тема героя: 4-тактовый рифф, электронный бит + домбра (струна Карплус–Стронг), --bpm 100.
kuat      — тема «ҚУАТ»: 4 такта, синт-бит, «зарядная» арпеджио, --bpm 112 (--seed 2 — полная версия с лидом).
isekai    — фэнтези-аниме «ПОПАЛ»: арфа, струнный пэд, колокольчик, лёгкий бит, --bpm 104 (--seed 2 — без бита).
dark      — тёмный эмбиент для хоррора: низкий гул, медленно дышащий минорный кластер, холодный шелест; без мелодии и ритма.
Громкость на выходе умеренная; в ролике ставить тихо (gain 0.25–0.4) под эффекты.
"""
import argparse, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser(); ap.add_argument("-o", "--out", required=True); ap.add_argument("--duration", type=float, required=True)
ap.add_argument("--style", default="synthwave"); ap.add_argument("--bpm", type=float, default=96); ap.add_argument("--seed", type=int, default=1)
a = ap.parse_args()
rng = np.random.default_rng(a.seed)
n = int(a.duration * SR); L = np.zeros(n); R = np.zeros(n)
beat = 60 / a.bpm
note = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def smooth(x, k):  # дешёвый ФНЧ: скользящее среднее
    if k <= 1: return x
    return np.convolve(x, np.ones(k) / k, mode="same")

def add(x, t, gl=1.0, gr=1.0):
    i = int(t * SR)
    if i >= n: return
    x = x[: n - i]; L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr

def env(len_s, a=0.005, d=0.2):
    tt = np.arange(int(len_s * SR)) / SR
    return np.minimum(1, tt / a) * np.exp(-tt / d)

def saw(f, len_s, detune=0.0):
    tt = np.arange(int(len_s * SR)) / SR
    return 2 * ((tt * f * (1 + detune)) % 1) - 1

# аккорды (минор, «ночной город»): Am – F – C – G, по 2 такта
PROG = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [52, 55, 60]), (55, [55, 59, 62])]
bar = 4 * beat
total_beats = int(a.duration / beat) + 1

def kick(t, big=False):
    ln = 0.45 if big else 0.32; tt = np.arange(int(ln * SR)) / SR
    f = 50 + (130 if big else 110) * np.exp(-tt * 28); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * (6 if big else 9))
    add(x * 0.9, t)

def snare(t):
    ln = 0.28; m = int(ln * SR); x = rng.uniform(-1, 1, m); x = x - smooth(x, 6)
    tone = np.sin(2 * np.pi * 190 * np.arange(m) / SR)
    add((x * 0.55 + tone * 0.25) * env(ln, 0.001, 0.09), t, 0.9, 1.0)

def hat(t, open_=False, g=0.18):
    ln = 0.12 if not open_ else 0.3; m = int(ln * SR); x = rng.uniform(-1, 1, m); x = x - smooth(x, 3)
    add(x * env(ln, 0.0005, 0.02 if not open_ else 0.09) * g, t, 0.8, 1.0)

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
if a.style == "dark":
    tt = np.arange(n) / SR
    lfo = lambda hz, ph=0: 0.5 + 0.5 * np.sin(2 * np.pi * hz * tt + ph)
    base = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 55.4 * tt + 1) + 0.35 * np.sin(2 * np.pi * 82.4 * tt)) * (0.6 + 0.4 * lfo(0.05))
    grit = band(saw(55, a.duration, 0.003)[:n] + saw(54.7, a.duration)[:n], 40, 400) * 0.25 * lfo(0.03, 2)
    pad = np.zeros(n)
    for i, m in enumerate([45, 48, 52, 53, 57]):  # A, C, E, F, A — минор с полутоном (тревога)
        w = smooth(saw(note(m), a.duration, 0.002 * (i - 2))[:n], 60); pad += w * (0.25 + 0.75 * lfo(0.021 + i * 0.006, i * 1.3)) ** 2
    pad = band(pad, 80, 900) * 0.18
    air = band(rng.uniform(-1, 1, n), 2500, 6500) * 0.05 * lfo(0.04, 4) ** 3
    sub = np.sin(2 * np.pi * 36.7 * tt) * 0.25 * lfo(0.017, 1)
    mono = base * 0.35 + grit + pad + air + sub
    d = int(0.023 * SR); L[:] = mono; R[d:] = mono[:-d]; R[:d] = mono[:d]
    total_beats = 0
def pluck(f, ln, damp=.996, amp=1.0):
    m = int(ln * SR); N = max(2, int(SR / f)); buf = rng.uniform(-1, 1, N); out = np.empty(m)
    for i in range(m):
        j = i % N; out[i] = buf[j]; buf[j] = damp * .5 * (buf[j] + buf[(j + 1) % N])
    return out * amp * np.minimum(1, (m - np.arange(m)) / (0.03 * SR))
if a.style == "tynys":
    s16 = beat / 4; strum = "x.xx.xx.x.xx.xxx"  # домбра: ритм «бас–верх» восьмыми и шестнадцатыми
    riff = [(50, 57), (50, 57), (48, 55), (45, 52)]  # D, D, C, A — нижняя струна + квинта
    mel = [69, 0, 72, 69, 67, 0, 65, 67, 69, 0, 72, 74, 72, 0, 69, 0]
    for b in range(total_beats):
        t = b * beat; bar = (b // 4) % 4; lo, hi = riff[bar]
        if b % 4 in (0, 2): kick(t)
        if b % 4 in (1, 3): snare(t)
        for q in range(4): hat(t + q * s16, g=.08)
        for q in range(4):
            if strum[(b % 4) * 4 + q] == "x": tq = t + q * s16; add(pluck(note(lo), .5, .995, .32), tq, .9, 1); add(pluck(note(hi), .45, .994, .22), tq + .012, 1, .9)
        if b % 8 >= 4:
            for q in range(4):
                m = mel[(b % 4) * 4 + q]
                if m: add(pluck(note(m), .4, .993, .2), t + q * s16, .8, 1)
        if b % 4 == 0: add(np.tanh(np.sin(2 * np.pi * note(lo - 24) * np.arange(int(bar * 0 + 4 * beat * SR)) / SR) * 1.5) * np.exp(-np.arange(int(4 * beat * SR)) / SR * 1.2) * .3, t)
    total_beats = 0
if a.style == "kuat":  # тема «ҚУАТ»: 4 такта, бочка «четыре в пол», пульсирующий бас-синт, «зарядная» арпеджио вверх, --bpm 112
    s16 = beat / 4; prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
    full = a.seed >= 2  # --seed 2: полная версия (с.5) с лидом
    lead = [76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 76, 0, 72, 0, 0, 0]
    for b in range(total_beats):
        t = b * beat; bar = (b // 4) % 4; root, ch = prog[bar]
        kick(t, big=(b % 4 == 0))
        if b % 4 in (1, 3): snare(t)
        for q in range(4): hat(t + q * s16, open_=(q == 2), g=.07 if q != 2 else .1)
        for q in range(4):  # бас шестнадцатыми с «сайдчейном» от бочки
            ln = s16 * .9; x = smooth(saw(note(root - 12), ln, .003) + saw(note(root - 12), ln, -.003), 14) * env(ln, .003, .09)
            add(x * (0.12 if q == 0 else 0.26), t + q * s16)
        for q in range(4):  # арпеджио растёт по октаве к концу такта — как шкала заряда
            m = ch[(b * 4 + q) % 3] + 12 + 12 * ((b % 4) >= 2)
            ln = s16; x = np.sin(2 * np.pi * note(m) * np.arange(int(ln * SR)) / SR) * env(ln, .002, .06)
            add(x * 0.11, t + q * s16, .7 if q % 2 else 1, 1 if q % 2 else .7)
        if full and b % 8 >= 4:
            for q in range(4):
                m = lead[(b % 4) * 4 + q]
                if m: ln = s16 * 1.8; add(smooth(saw(note(m), ln, .005), 6) * env(ln, .005, .18) * .12, t + q * s16)
        if b % 4 == 0:  # пэд на такт
            ln = 4 * beat; pad = np.zeros(int(ln * SR))
            for m in ch: pad += smooth(saw(note(m), ln, -.006) + saw(note(m), ln, .006), 40)
            tt = np.arange(len(pad)) / SR; e = np.minimum(1, tt / .3) * np.minimum(1, (ln - tt) / .3) * (0.5 + 0.5 * np.minimum(1, (tt % beat) / (beat * .6)))
            add(pad * e * 0.035, t, 1, .85); add(pad * e * 0.035, t + .012, .85, 1)
    total_beats = 0
if a.style == "isekai":  # фэнтези-аниме: арфа-арпеджио, струнный пэд, колокольчик-мелодия, лёгкий бит; --seed 2 — без бита (спокойно)
    s16 = beat / 4; prog = [(50, [62, 66, 69]), (47, [62, 66, 71]), (43, [62, 67, 71]), (45, [61, 64, 69])]  # D Bm G A
    drums = a.seed != 2
    bell = [74, 0, 78, 0, 81, 0, 78, 76, 74, 0, 73, 0, 71, 0, 69, 0]
    for b in range(total_beats):
        t = b * beat; bar = (b // 4) % 4; root, ch = prog[bar]
        if drums:
            if b % 4 in (0, 2) or b % 8 == 7: kick(t, big=(b % 4 == 0))
            if b % 4 in (1, 3): snare(t)
            for q in range(2): hat(t + q * beat / 2, g=.06)
        for q in range(4):  # арфа: аккорд вверх-вниз шестнадцатыми
            seq = ch + [ch[0] + 12]; m = seq[[0, 1, 2, 3][q] if (b % 2 == 0) else [3, 2, 1, 0][q]] + 12
            add(pluck(note(m), .6, .997, .16), t + q * s16, .7 if q % 2 else 1, 1 if q % 2 else .7)
        if b % 2 == 0: add(pluck(note(root - 12), 1.2, .998, .3), t)
        if b % 8 >= 4:
            m = bell[(b % 4) * 4]; m2 = bell[(b % 4) * 4 + 2]
            for mm, dt in ((m, 0), (m2, 2 * s16)):
                if mm: ln = .9; tt = np.arange(int(ln * SR)) / SR; add((np.sin(2 * np.pi * note(mm) * tt) + .3 * np.sin(2 * np.pi * note(mm) * 3.01 * tt)) * np.exp(-tt * 3.5) * .09, t + dt, .9, 1)
        if b % 4 == 0:  # струнный пэд на такт
            ln = 4 * beat; pad = np.zeros(int(ln * SR))
            for m in ch + [root]: pad += smooth(saw(note(m), ln, -.004) + saw(note(m), ln, .004), 60)
            tt = np.arange(len(pad)) / SR; e = np.minimum(1, tt / .5) * np.minimum(1, (ln - tt) / .5)
            add(pad * e * 0.03, t, 1, .85); add(pad * e * 0.03, t + .015, .85, 1)
    total_beats = 0
if a.style == "comedy":  # комедия: свинг, пиццикато-бас «на цыпочках», маримба-мелодия, хлопок на 2 и 4, шейкер; мажор C–Am–F–G
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
    sw = beat * 2 / 3  # свинг: вторая восьмая сдвинута
    mel = [72, 76, 79, 76, 77, 76, 74, 0, 72, 74, 76, 72, 71, 0, 67, 0, 69, 72, 76, 72, 77, 76, 74, 72, 71, 72, 74, 0, 79, 0, 0, 0]
    def marimba(f, ln=.5, g=.14):
        tt = np.arange(int(ln * SR)) / SR
        return (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9) + .35 * np.sin(2 * np.pi * f * 4.0 * tt) * np.exp(-tt * 30) + .15 * np.sin(2 * np.pi * f * 10 * tt) * np.exp(-tt * 60)) * g
    def pizz(f, ln=.35, g=.32):
        tt = np.arange(int(ln * SR)) / SR; x = np.sin(2 * np.pi * f * tt) + .4 * np.sin(4 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)
        return x * np.minimum(1, tt / .004) * np.exp(-tt * 11) * g
    def clap(t):
        for d in (0, .011, .023):
            m = int(.12 * SR); x = rng.uniform(-1, 1, m); x = band(x, 900, 6000); add(x * env(.12, .001, .03) * .22, t + d, .9, 1)
    for b in range(total_beats):
        t = b * beat; bi = b % 4; root, ch = prog[(b // 4) % 4]
        # пиццикато-бас: корень — квинта, «шажками» на каждую долю, на 4-й — подход
        bm = [root, root + 7, root + 12, root + 7][bi] - 12
        add(pizz(note(bm)), t); add(pizz(note(bm + 12), .2, .12), t + sw, .8, 1)
        if bi in (1, 3): clap(t)
        hat(t, g=.05); hat(t + sw, g=.08)  # шейкер
        if bi in (0, 2):  # аккорд маримбой
            for k, m in enumerate(ch): add(marimba(note(m), .45, .05), t + k * .012, .8, 1)
        for q, dt in enumerate((0, sw)):  # мелодия восьмыми (свинг), в каждом втором проходе — октавой выше
            m = mel[(b * 2 + q) % len(mel)]
            if m: add(marimba(note(m + (12 if (b // 16) % 2 else 0)), .55, .16), t + dt, 1, .85)
        if b % 16 == 15:  # «подмигивание»: глиссандо свистулькой в конце фразы
            ln = beat * .9; tt = np.arange(int(ln * SR)) / SR; fq = note(84) * (1 + .5 * tt / ln)
            add(np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.minimum(1, tt / .03) * np.minimum(1, (ln - tt) / .1) * .05, t)
    total_beats = 0
for b in range(total_beats):
    t = b * beat; bi = b % 4; chord = PROG[(b // 8) % 4]
    if a.style == "trap":
        if bi in (0,) or (b % 8 == 6): kick(t, big=True)
        if bi == 2: snare(t)
        for s in range(4 if b % 4 != 3 else 6):
            hat(t + s * beat / (4 if b % 4 != 3 else 6), g=0.12)
        if bi == 0:  # 808-бас
            ln = bar * 0.9; tt = np.arange(int(ln * SR)) / SR; f = note(chord[0] - 24)
            add(np.tanh(np.sin(2 * np.pi * f * tt) * 1.8) * np.exp(-tt * 0.9) * 0.45, t)
    else:
        if bi in (0, 2): kick(t)
        if bi in (1, 3): snare(t)
        for s in range(2): hat(t + s * beat / 2, open_=(s == 1 and bi == 3))
        for s in range(2):  # бас восьмыми
            ln = beat / 2 * 0.9; x = smooth(saw(note(chord[0] - 12), ln), 18) * env(ln, 0.004, 0.18)
            add(x * 0.32, t + s * beat / 2)
        for s in range(4):  # арпеджио шестнадцатыми
            m = chord[1][(b * 4 + s) % 3] + 12 * (1 + (s % 2))
            ln = beat / 4; x = smooth(saw(note(m), ln, 0.004), 4) * env(ln, 0.002, 0.07)
            add(x * 0.07, t + s * beat / 4, 1.0 if s % 2 else 0.6, 0.6 if s % 2 else 1.0)
    if b % 8 == 0:  # пэд на 2 такта
        ln = 2 * bar; pad = np.zeros(int(ln * SR))
        for m in chord[1]:
            pad += smooth(saw(note(m), ln, -0.006) + saw(note(m), ln, 0.006), 40)
        tt = np.arange(len(pad)) / SR; e = np.minimum(1, tt / 0.6) * np.minimum(1, (ln - tt) / 0.6)
        add(pad * e * 0.05, t, 1.0, 0.85); add(pad * e * 0.05, t + 0.012, 0.85, 1.0)

mix = np.stack([L, R], 1)
fade = np.minimum(1, np.arange(n) / (1.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.2 * SR))
mix *= fade[:, None]; mix = np.tanh(mix * 1.2); mix = mix / (np.abs(mix).max() or 1) * 0.8
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"музыка {a.style}, {a.bpm:.0f} BPM, {a.duration:.1f} с → {a.out}")
