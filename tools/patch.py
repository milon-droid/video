#!/usr/bin/env python3
"""Переделать только фрагмент готового ролика: отрендерить отрезок сцены и вклеить его на место.

    python3 tools/patch.py projects/<имя>/src/ep1.html projects/<имя>/out/ep1.mp4 --from 24.6 --to 35.5 -o out.mp4 [--scale 0.6667] [--crf 20] [--audio mix.wav]

Сцены детерминированы по времени, поэтому кадры отрезка совпадают с полным рендером, а остальное видео
не перерисовывается (правка 10 с из 58 — в ~5 раз быстрее). Границы округляются до кадра.
Звук берётся из исходного ролика; если звук тоже менялся — --audio mix.wav (потом tools/master.py).
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("scene"); ap.add_argument("base"); ap.add_argument("--from", dest="t0", type=float, required=True); ap.add_argument("--to", dest="t1", type=float, required=True)
ap.add_argument("-o", "--out", required=True); ap.add_argument("--scale", default="0.6667"); ap.add_argument("--crf", default="20"); ap.add_argument("--audio")
a = ap.parse_args()
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate,width,height:format=duration", "-of", "json", a.base], capture_output=True, text=True).stdout)
num, den = map(int, pr["streams"][0]["r_frame_rate"].split("/")); fps = num / den; dur = float(pr["format"]["duration"])
f0, f1 = round(a.t0 * fps), round(min(a.t1, dur) * fps); t0, t1 = f0 / fps, f1 / fps  # ровно по кадрам
td = Path(tempfile.mkdtemp()); seg = td / "seg.mp4"
subprocess.run(["node", str(ROOT / "tools/render.mjs"), a.scene, "--from", f"{t0:.6f}", "--to", f"{t1:.6f}", "--scale", a.scale, "--crf", a.crf, "-o", str(seg)], check=True, stdout=subprocess.DEVNULL)
fc = (f"[0:v]trim=start_frame=0:end_frame={f0},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];"
      f"[0:v]trim=start_frame={f1},setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[v]")
cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.base, "-i", str(seg)] + (["-i", a.audio] if a.audio else []) + \
      ["-filter_complex", fc, "-map", "[v]", "-map", "2:a" if a.audio else "0:a?", "-c:v", "libx264", "-crf", a.crf, "-preset", "medium", "-pix_fmt", "yuv420p",
       "-c:a", "aac" if a.audio else "copy", "-b:a", "192k", "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out]
subprocess.run(cmd, check=True)
print(f"вклеено {t0:.2f}–{t1:.2f} с ({f1 - f0} кадров) → {a.out}")
