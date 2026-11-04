#!/usr/bin/env python3
"""Проверка готового ролика под TikTok/Reels/Shorts.

    python3 tools/qa.py video.mp4 [--frames 9] [--no-safe]

Печатает отчёт (разрешение, fps, кодек, длительность, громкость) и сохраняет
контактный лист кадров с наложенными зонами интерфейса:
    <папка видео>/qa/<имя>-sheet.png
Код выхода 1, если есть критичные проблемы.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

FONT = Path(__file__).resolve().parent.parent / "fonts" / "Inter-Bold.otf"


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)])
    if r.returncode:
        sys.exit(f"ffprobe не открыл файл: {r.stderr.strip()}")
    return json.loads(r.stdout)


def loudness(path):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"])
    txt = r.stderr
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", txt)
    p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", txt)
    return (float(i[-1]) if i else None, float(p[-1]) if p else None)


def contact_sheet(path, out, duration, w, h, n, safe):
    cols = 3
    rows = (n + cols - 1) // cols
    step = duration / n
    tw = 360
    th = int(tw * h / w)
    sx, sy = tw / 1080, th / 1920
    boxes = ""
    if safe:
        zones = [(0, 0, 1080, 220), (0, 1500, 1080, 420), (920, 220, 160, 1280)]
        boxes = "".join(
            f",drawbox=x={int(x*sx)}:y={int(y*sy)}:w={int(zw*sx)}:h={int(zh*sy)}:color=red@0.30:t=fill"
            for x, y, zw, zh in zones
        )
    vf = (
        f"fps=1/{step:.4f},scale={tw}:{th}{boxes},"
        f"drawtext=fontfile='{FONT}':text='%{{pts\\:hms}}':x=8:y=8:fontsize=22:"
        f"fontcolor=white:box=1:boxcolor=black@0.6,tile={cols}x{rows}:padding=6:color=0x222222"
    )
    r = run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{step/2:.3f}", "-i", str(path),
             "-vf", vf, "-frames:v", "1", str(out)])
    return r.returncode == 0, r.stderr.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--frames", type=int, default=9)
    ap.add_argument("--no-safe", action="store_true")
    a = ap.parse_args()
    path = Path(a.video)
    info = probe(path)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    au = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"].get("duration", 0))
    problems, warns = [], []

    if not v:
        sys.exit("нет видеодорожки")
    w, h = v["width"], v["height"]
    num, den = map(int, v.get("avg_frame_rate", "0/1").split("/"))
    fps = num / den if den else 0
    print(f"Файл:        {path}  ({path.stat().st_size/1e6:.1f} МБ)")
    print(f"Видео:       {w}×{h}, {fps:.2f} fps, {v['codec_name']}, {v.get('pix_fmt')}")
    print(f"Длительность:{dur:.2f} с")

    if (w, h) != (1080, 1920):
        (warns if abs(w / h - 9 / 16) < 0.01 else problems).append(f"разрешение {w}×{h}, ожидается 1080×1920 (9:16)")
    if v["codec_name"] != "h264":
        problems.append(f"кодек {v['codec_name']}, нужен h264")
    if v.get("pix_fmt") != "yuv420p":
        problems.append(f"pix_fmt {v.get('pix_fmt')}, нужен yuv420p (иначе не играет на телефонах)")
    if not 23 <= fps <= 60:
        problems.append(f"fps {fps:.2f} вне 24–60")
    if dur < 3:
        warns.append("ролик короче 3 с")
    if dur > 90:
        warns.append("ролик длиннее 90 с — для коротких видео обычно 15–60 с")

    if au:
        lufs, peak = loudness(path)
        print(f"Аудио:       {au['codec_name']}, {au.get('sample_rate')} Гц, {lufs} LUFS, пик {peak} dBFS")
        if lufs is not None and not -16 <= lufs <= -12:
            warns.append(f"громкость {lufs} LUFS, рекомендуется около −14 (loudnorm=I=-14:TP=-1:LRA=11)")
        if peak is not None and peak > -0.5:
            warns.append(f"пик {peak} dBFS — возможен клиппинг")
    else:
        warns.append("нет аудиодорожки (немые ролики хуже продвигаются; добавить музыку/звук?)")

    out_dir = path.parent / "qa"
    out_dir.mkdir(exist_ok=True)
    sheet = out_dir / f"{path.stem}-sheet.png"
    ok, err = contact_sheet(path, sheet, dur, w, h, a.frames, not a.no_safe)
    print(f"Контактный лист: {sheet}" if ok else f"Контактный лист не создан: {err}")
    if ok and not a.no_safe:
        print("  (красное — зоны интерфейса: текст и важное туда не ставить)")

    for p in problems:
        print(f"[ОШИБКА] {p}")
    for wmsg in warns:
        print(f"[ВНИМАНИЕ] {wmsg}")
    if not problems and not warns:
        print("[OK] технических замечаний нет")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
