#!/usr/bin/env python3
"""Огибающая голоса для движения рта (липсинк «по громкости»), 30 значений в секунду, 0..1.

    python3 tools/mouth.py projects/<имя>/assets/vo/ep1 -o projects/<имя>/src/ep1-mouth.js [--fps 30]

Читает все *.wav в папке и пишет window.VO_MOUTH = {id: {fps, v: [...]}}.
В сцене: const m = AK.mouth(t, VO_MOUTH.e1s11, VO_AT.e1s11) → открыть рот на m (templates/components/anim-kit.js).
"""
import argparse, json, pathlib, subprocess
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("vo_dir"); ap.add_argument("-o", "--out", required=True); ap.add_argument("--fps", type=int, default=30)
a = ap.parse_args(); SR = 16000; out = {}
for f in sorted(pathlib.Path(a.vo_dir).glob("*.wav")):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32); hop = SR // a.fps; n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)]) if n else np.zeros(0)
    if n:
        db = 20 * np.log10(rms + 1e-6); lo, hi = np.percentile(db, 20), np.percentile(db, 97)
        v = np.clip((db - lo) / max(1e-3, hi - lo), 0, 1); v = np.convolve(v, [.25, .5, .25], mode="same")  # сгладить дрожь
        v[v < .12] = 0
    else: v = rms
    out[f.stem] = {"fps": a.fps, "v": [round(float(y), 2) for y in v]}
pathlib.Path(a.out).write_text("window.VO_MOUTH = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(f"рот: {len(out)} реплик → {a.out}")
