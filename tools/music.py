#!/usr/bin/env python3
"""Оригинальная фоновая музыка (синтез, без чужих треков и сэмплов).

    python3 tools/music.py -o music.wav --duration 30 [--style synthwave|trap] [--bpm 96] [--seed 1]

synthwave — неоновые 80-е / Майами: бочка-снейр, басовые восьмые, широкий пэд, арпеджио.
trap      — медленный хип-хоп бит: 808-бас, хэты с триолями, мягкий пэд.
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
