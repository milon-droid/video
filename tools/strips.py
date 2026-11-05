#!/usr/bin/env python3
"""Полоски движения: по ряду кадров (8 к/с) на каждый момент — чтобы увидеть анимацию, а не только композицию.
Лист раскадровки (qa.py --step 2) показывает кадр раз в 2 с и не ловит: удар без отдачи, скольжение,
«телепорт» позы, рывки, механическую синусоиду, застывшее лицо. Эти полоски — ловят.

    python3 tools/strips.py video.mp4 --at 28.2,35.5,41.0 [--len 1.5] [--fps 8] [-o strips.png]

Каждая строка — один момент: кадры с шагом 1/fps от t до t+len, подписаны временем.
Смотреть глазами: есть ли подготовка (замах), перелёт и отскок, вторичное движение (волосы, рукава, голова запаздывает),
крутятся ли колёса, не «прыгает» ли поза между кадрами, двигается ли рот у говорящего.
"""
import argparse, subprocess, tempfile, pathlib
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--at", required=True, help="моменты через запятую, с")
ap.add_argument("--len", type=float, default=1.5); ap.add_argument("--fps", type=float, default=8); ap.add_argument("--w", type=int, default=150); ap.add_argument("-o", "--out", default="")
a = ap.parse_args(); vid = pathlib.Path(a.video); out = pathlib.Path(a.out) if a.out else vid.parent / "qa" / f"{vid.stem}-strips.png"; out.parent.mkdir(parents=True, exist_ok=True)
moments = [float(x) for x in a.at.split(",") if x.strip()]; n = int(round(a.len * a.fps)) + 1; W = a.w; H = int(W * 16 / 9)
sheet = Image.new("RGB", (n * W + 70, len(moments) * (H + 6)), "black"); d = ImageDraw.Draw(sheet)
with tempfile.TemporaryDirectory() as tmp:
    for r, t0 in enumerate(moments):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", str(vid), "-t", f"{a.len + .01:.3f}", "-vf", f"fps={a.fps},scale={W}:{H}", f"{tmp}/r{r}_%03d.png"], check=True)
        frames = sorted(pathlib.Path(tmp).glob(f"r{r}_*.png"))[:n]; y = r * (H + 6); d.text((4, y + 4), f"{t0:.1f}s", fill="yellow")
        for i, f in enumerate(frames): sheet.paste(Image.open(f), (70 + i * W, y)); d.text((72 + i * W, y + H - 14), f"{t0 + i / a.fps:.2f}", fill="white")
sheet.save(out); print(f"полоски: {len(moments)} моментов × {n} кадров → {out}")
