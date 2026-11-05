#!/usr/bin/env python3
"""Синтез простых звуковых эффектов по таймкодам (без внешних файлов и сервисов).

    python3 tools/sfx.py cues.json -o sfx.wav --duration 30

cues.json — список событий:
    [{"t": 0.15, "type": "step", "gain": 0.6}, {"t": 3.6, "type": "ff", "dur": 0.8}, ...]

Типы: note (freq), step, skid, beep, bloop, click, glitch, ff (перемотка вперёд), rewind,
boing, whistle, thud, bonk, drone, pop, puff, wah (грустный спуск), tick, boom,
wind, tires, hum (печка), engine, snowstep, heartbeat, murmur (речь из телевизора), tone (ровный писк), chord (аккорд-пэд: notes, attack).
Общие параметры: t (с), gain (0..1), dur (с), pitch (множитель частоты), pan (−1..1).

Звуки из библиотеки (сначала bash tools/get-sfx.sh, найти: python3 tools/sfx-find.py "запрос"):
    {"t": 10.15, "type": "lib", "id": "oc-METLImpt_HammerAnvil_OS_01", "gain": 0.9, "rate": 1.0, "align": "sync"}
    align: "sync" — точка синхронизации звука (момент удара) ставится ровно на t; "start" — начало звука на t.
"""
import argparse
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(1)


def env(n, a=0.005, r=0.1):
    """Огибающая: быстрая атака, экспоненциальный спад."""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e


def noise(n):
    return rng.uniform(-1, 1, n)


def lowpass(x, k):
    """Простой однополюсный ФНЧ, k in (0,1): меньше — глуше."""
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc)
        y[i] = acc
    return y


def band(x, lo=0.0, hi=24000.0):
    """Быстрый полосовой фильтр через БПФ (для длинных шумов)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def slow(n, rate, seed):
    """Медленная случайная огибающая 0..1 (порывы)."""
    r = np.random.default_rng(seed); k = max(2, int(n / SR * rate) + 2)
    pts = r.uniform(0, 1, k); return np.interp(np.linspace(0, k - 1, n), np.arange(k), pts)


def sweep(f0, f1, dur, shape="sin", curve=1.0):
    n = int(dur * SR)
    k = np.linspace(0, 1, n) ** curve
    f = f0 + (f1 - f0) * k
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if shape == "sq":
        return np.sign(np.sin(ph))
    return np.sin(ph)


LIB = None


def lib_sound(c):
    """Загрузить звук из assets/sfx-library через ffmpeg (моно 48 кГц), со сдвигом по точке синхронизации."""
    global LIB
    import subprocess
    from pathlib import Path
    root = Path(__file__).resolve().parent.parent / "assets" / "sfx-library"
    if LIB is None:
        LIB = {s["id"]: s for s in json.loads((root / "index.json").read_text())}
    s = LIB.get(c["id"])
    if s is None:
        raise ValueError(f"нет звука в библиотеке: {c['id']} (python3 tools/sfx-find.py)")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(root / s["file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    rate = c.get("rate", 1.0)
    if rate != 1.0:
        x = np.interp(np.arange(0, len(x), rate), np.arange(len(x)), x)
    if c.get("dur"):
        n = int(c["dur"] * SR); x = x[:n] * np.minimum(1, np.linspace(1, 0, len(x[:n])) * 12)
    shift = (s.get("sync") or 0) / rate if c.get("align", "sync") == "sync" else 0
    return x, shift


def gen(c):
    ty, p = c["type"], c.get("pitch", 1.0)
    d = c.get("dur")
    if ty == "note":  # нота с тембром маримбы: {"type": "note", "freq": 659.25}
        d = d or 0.6
        n = int(d * SR); t = np.arange(n) / SR; f = c.get("freq", 440.0) * p
        x = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(2 * np.pi * 4.0 * f * t) * np.exp(-t * 30) + 0.12 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t * 60)
        return x * np.minimum(1, t / 0.002) * np.exp(-t * 6.5)
    if ty == "step":
        n = int(0.09 * SR)
        x = lowpass(noise(n), 0.08) * 3 + 0.6 * sweep(120 * p, 60 * p, 0.09)
        return x * env(n, 0.002, 0.03)
    if ty == "tick":
        n = int(0.03 * SR)
        return sweep(2400 * p, 1800 * p, 0.03) * env(n, 0.0005, 0.008)
    if ty == "skid":
        d = d or 0.45
        n = int(d * SR)
        x = noise(n)
        x = x - lowpass(x, 0.25)  # ВЧ-шум
        x = x * (0.6 + 0.4 * sweep(9, 3, d)) * np.linspace(1, 0, n) ** 0.7
        return x * 0.7 + 0.25 * sweep(900 * p, 500 * p, d, "saw") * np.linspace(1, 0, n)
    if ty == "beep":
        n = int(0.16 * SR)
        x = sweep(1320 * p, 1320 * p, 0.08, "sq")
        x = np.concatenate([x, sweep(1760 * p, 1760 * p, 0.08, "sq")])
        return lowpass(x, 0.3) * env(n, 0.002, 0.12)
    if ty == "bloop":
        d = d or 0.18
        n = int(d * SR)
        return sweep(300 * p, 1200 * p, d, curve=0.5) * env(n, 0.003, d * 0.6)
    if ty == "click":
        n = int(0.06 * SR)
        x = sweep(3000 * p, 900 * p, 0.06) * env(n, 0.0005, 0.012) + 0.6 * noise(n) * env(n, 0.0005, 0.004)
        return x
    if ty == "glitch":
        d = d or 0.2
        n = int(d * SR)
        x = np.zeros(n)
        pos = 0
        while pos < n:
            ln = int(rng.uniform(0.008, 0.03) * SR)
            f = rng.uniform(200, 2500) * p
            seg = sweep(f, f * rng.uniform(.5, 2), ln / SR, "sq") * rng.uniform(.3, 1)
            if rng.random() < .4:
                seg = noise(ln) * .8
            m = min(len(seg), n - pos)
            x[pos:pos + m] = seg[:m]
            pos += ln
        return np.round(x * 4) / 4 * 0.7  # «биткраш»
    if ty in ("ff", "rewind"):
        d = d or 0.6
        n = int(d * SR)
        up = ty == "ff"
        f0, f1 = (300, 2400) if up else (2200, 200)
        tone = sweep(f0 * p, f1 * p, d, "saw", curve=1.6 if up else 0.6)
        wob = 1 + 0.35 * np.sin(2 * np.pi * np.cumsum(np.linspace(18, 40, n)) / SR)
        x = lowpass(tone * wob, 0.25) * 0.6 + 0.3 * (noise(n) - lowpass(noise(n), 0.2))
        e = np.minimum(1, np.linspace(0, 1, n) * 6) * np.minimum(1, np.linspace(1, 0, n) * 4)
        return x * e
    if ty == "boing":
        d = d or 0.35
        n = int(d * SR)
        f = 220 * p * (1 + 0.6 * np.exp(-np.arange(n) / SR * 10) * np.sin(2 * np.pi * 14 * np.arange(n) / SR))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR)
        return x * env(n, 0.003, d * 0.5)
    if ty == "whistle":
        d = d or 1.0
        n = int(d * SR)
        x = sweep(2400 * p, 700 * p, d, curve=1.3) * (0.7 + 0.3 * np.linspace(0, 1, n))
        return x * np.minimum(1, np.linspace(0, 1, n) * 5) * 0.5
    if ty in ("thud", "boom"):
        d = d or (0.6 if ty == "thud" else 1.2)
        n = int(d * SR)
        x = sweep(110 * p, 38 * p, d, curve=0.4) + 0.9 * lowpass(noise(n), 0.03) * 4
        return np.tanh(x * 1.6) * env(n, 0.002, d * 0.3)
    if ty == "bonk":
        n = int(0.25 * SR)
        x = sweep(500 * p, 180 * p, 0.25, curve=0.5) + 0.4 * sweep(1100 * p, 400 * p, 0.25)
        return x * env(n, 0.001, 0.07)
    if ty == "drone":
        d = d or 3.0
        n = int(d * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 55 * p * t) + 0.5 * np.sin(2 * np.pi * 82.5 * p * t + np.sin(t * 2)) + 0.3 * lowpass(noise(n), 0.01) * 6
        e = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.3)
        return x * e * 0.35
    if ty == "pop":
        n = int(0.12 * SR)
        return sweep(900 * p, 250 * p, 0.12, curve=0.4) * env(n, 0.001, 0.03) + 0.4 * noise(n) * env(n, 0.0005, 0.01)
    if ty == "puff":
        d = d or 0.5
        n = int(d * SR)
        x = lowpass(noise(n), 0.12) * 2.5
        return x * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.6
    if ty == "wah":
        d = d or 0.5
        n = int(d * SR)
        x = sweep(700 * p, 240 * p, d, "saw", curve=0.8)
        x = lowpass(x, 0.18) * (1 + 0.4 * np.sin(2 * np.pi * 7 * np.arange(n) / SR))
        return x * np.minimum(1, np.linspace(0, 1, n) * 20) * np.linspace(1, .4, n)
    # ── длинные фоны и бытовые шумы (синтез, CC0 по определению) ──
    if ty in ("wind", "tires", "hum", "engine"):
        d = d or 5.0
        n = int(d * SR); t = np.arange(n) / SR; nz = noise(n)
        e = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
        if ty == "wind":
            g = slow(n, 0.7, int(p * 100) % 999)
            x = band(nz, 150 * p, 900 * p) * (0.35 + 0.9 * g) + 0.4 * band(nz, 900, 2500) * g ** 2
            return x / (np.abs(x).max() or 1) * e
        if ty == "tires":
            x = band(nz, 300, 4000) * (0.8 + 0.2 * slow(n, 3, 5)) + 0.5 * band(nz, 40, 160)
            return x / (np.abs(x).max() or 1) * e * 0.8
        if ty == "hum":
            x = 0.5 * band(nz, 60, 500) + 0.25 * np.sin(2 * np.pi * 100 * p * t) + 0.1 * np.sin(2 * np.pi * 200 * p * t)
            return x / (np.abs(x).max() or 1) * e * 0.6
        f = 32 * p * (1 + 0.04 * np.sin(2 * np.pi * 0.7 * t))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sign(np.sin(3 * ph)) * 0.3 + 0.4 * band(nz, 30, 300)
        return np.tanh(x * 1.2) / 1.6 * e
    if ty == "tone":  # ровный писк (кардиомонитор): {"type": "tone", "freq": 1000, "dur": 1}
        d = d or 1.0
        n = int(d * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * c.get("freq", 1000) * p * t) * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .03) * 0.5
    if ty == "chord":  # нарастающий аккорд-пэд: {"type": "chord", "notes": [57, 60, 64], "dur": 4, "attack": 2}
        d = d or 4.0
        n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
        for i, m in enumerate(c.get("notes", [57, 60, 64])):
            f = 440 * 2 ** ((m - 69) / 12) * p
            for det in (-.004, .004): x += 2 * ((t * f * (1 + det) + i * .13) % 1) - 1
        x = band(x, 60, 2200 if c.get("warm") else 1500)
        att = c.get("attack", 2.0); e = np.minimum(1, t / att) ** 2 * np.minimum(1, (d - t) / 0.8)
        return x / (np.abs(x).max() or 1) * e
    if ty == "murmur":  # неразборчивая речь за стеной / из телевизора
        d = d or 5.0
        n = int(d * SR); t = np.arange(n) / SR
        syl = slow(n, 9, 7) ** 2 * (0.4 + 0.6 * slow(n, 0.8, 8))
        x = band(noise(n), 250 * p, 2600 * p) * syl + 0.3 * np.sin(2 * np.pi * (140 + 30 * slow(n, 3, 9)) * t) * syl
        return x / (np.abs(x).max() or 1) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .3)
    if ty == "snowstep":
        n = int(0.22 * SR); t = np.arange(n) / SR
        crunch = band(noise(n), 1500, 7000) * (rng.uniform(0, 1, n) > 0.55)
        x = crunch * np.exp(-t * 18) + 0.6 * band(noise(n), 100, 600) * np.exp(-t * 30)
        return x / (np.abs(x).max() or 1)
    if ty == "heartbeat":
        n = int(0.7 * SR); t = np.arange(n) / SR
        b = lambda t0: np.sin(2 * np.pi * 50 * p * (t - t0)) * np.exp(-np.maximum(t - t0, 0) * 18) * (t >= t0)
        return np.tanh((b(0) + 0.7 * b(0.24)) * 1.5)
    raise ValueError(f"неизвестный тип звука: {ty}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cues")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--no-norm", action="store_true", help="не нормализовать громкость (для сравнения дорожек между собой)")
    a = ap.parse_args()
    cues = json.load(open(a.cues, encoding="utf-8"))
    n = int(a.duration * SR)
    mix = np.zeros((n, 2))
    for c in cues:
        shift = 0
        if c["type"] == "lib":
            x, shift = lib_sound(c)
            x = x * c.get("gain", 0.7)
        elif c["type"] == "file":  # любой звуковой файл (озвучка, музыка): {"type": "file", "path": "...", "t": 1.0, "from"?: с, "dur"?: с}
            import subprocess
            from pathlib import Path
            fp = Path(c["path"]); fp = fp if fp.is_absolute() else Path(__file__).resolve().parent.parent / fp
            raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(fp), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
            x = np.frombuffer(raw, dtype=np.float32).astype(np.float64) * c.get("gain", 1.0)
            if c.get("from"): x = x[int(c["from"] * SR):]  # начать файл не с начала
            if c.get("dur"):  # обрезать с короткими затуханиями
                x = x[:int(c["dur"] * SR)].copy(); f = min(len(x) // 2, int(0.05 * SR))
                if f: x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        else:
            x = gen(c) * c.get("gain", 0.7)
        i = int((c["t"] - shift) * SR)
        if i < 0:
            x, i = x[-i:], 0
        if i >= n:
            continue
        x = x[: n - i]
        pan = c.get("pan", 0.0)
        mix[i:i + len(x), 0] += x * np.sqrt((1 - pan) / 2) * 1.414
        mix[i:i + len(x), 1] += x * np.sqrt((1 + pan) / 2) * 1.414
    if not a.no_norm:
        peak = np.abs(mix).max() or 1
        mix = mix / peak * 0.89
    mix = np.clip(mix, -1, 1)
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(a.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{len(cues)} звуков → {a.out} ({a.duration:.1f} с)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
