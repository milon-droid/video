#!/usr/bin/env python3
"""Разбор видео-референса по кадрам.

    python3 tools/ref.py <файл.mp4 | ссылка> [-o папка] [--thresh 0.3]

Ссылки скачиваются через yt-dlp (pip install yt-dlp). YouTube из облака обычно
не отдаёт видео (проверка на бота) — тогда попросить у пользователя файл.

Результат в папке (по умолчанию refs/<имя>/):
  report.md   — длина, число планов, средняя длина плана, таблица планов, громкость
  shots-N.png — по кадру из середины каждого плана, с номером и таймкодом
  hook.png    — первые 3 с каждые 0.25 с (разбор хука)
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "fonts" / "Inter-Bold.otf"


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def fetch(url, outdir):
    outdir.mkdir(parents=True, exist_ok=True)
    r = run([sys.executable, "-m", "yt_dlp", "-f", "b[height<=1920]/bv*+ba/b", "--merge-output-format", "mp4", "--no-playlist", "-o", str(outdir / "source.%(ext)s"), url])
    files = list(outdir.glob("source.*"))
    if r.returncode or not files:
        sys.exit("Не удалось скачать по ссылке (для YouTube/TikTok это обычно проверка на бота).\n"
                 "Попросите у пользователя сам ролик файлом.\n" + r.stderr[-400:])
    return files[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("-o", "--out")
    ap.add_argument("--thresh", type=float, default=0.22, help="чувствительность к склейкам (меньше = больше склеек)")
    a = ap.parse_args()
    is_url = re.match(r"https?://", a.src)
    name = re.sub(r"[^\w-]+", "-", Path(a.src).stem if not is_url else a.src.split("/")[-1].split("?")[0])[:40] or "ref"
    out = Path(a.out) if a.out else ROOT / "refs" / name
    out.mkdir(parents=True, exist_ok=True)
    path = fetch(a.src, out) if is_url else Path(a.src)

    info = json.loads(run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)]).stdout)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    dur = float(info["format"]["duration"])
    num, den = map(int, v.get("avg_frame_rate", "30/1").split("/"))
    fps = num / den if den else 30

    # склейки
    r = run(["ffmpeg", "-hide_banner", "-i", str(path), "-vf", f"select='gt(scene,{a.thresh})',showinfo", "-f", "null", "-"])
    cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stderr)]
    bounds = [0.0] + [c for c in cuts if c > 0.15] + [dur]
    shots = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1) if bounds[i + 1] - bounds[i] > 0.05]

    # громкость
    lr = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"]).stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", lr)

    # листы планов
    tw, th = 216, int(216 * int(v["height"]) / int(v["width"]))
    frames = out / "frames"; frames.mkdir(exist_ok=True)
    for f in frames.glob("*.png"): f.unlink()
    for i, (s0, s1) in enumerate(shots):
        mid = (s0 + s1) / 2
        label = f"#{i + 1}  {s0:.1f}s  {s1 - s0:.1f}s"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{mid:.3f}", "-i", str(path), "-frames:v", "1", "-vf",
             f"scale={tw}:{th},drawtext=fontfile='{FONT}':text='{label}':x=4:y=4:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.65", str(frames / f"s{i:04d}.png")])
    per = 40
    sheets = []
    for k in range(0, len(shots), per):
        sheet = out / f"shots-{k // per + 1}.png"
        lst = out / "list.txt"
        lst.write_text("".join(f"file '{(frames / f's{i:04d}.png').as_posix()}'\n" for i in range(k, min(k + per, len(shots)))))
        cols = 8
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-vf", f"tile={cols}x{(min(per, len(shots) - k) + cols - 1) // cols}:padding=3:color=0x222222", "-frames:v", "1", str(sheet)])
        sheets.append(sheet.name)
    # хук: первые 3 с
    run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-t", "3", "-vf",
         f"fps=4,scale={tw}:{th},drawtext=fontfile='{FONT}':text='%{{pts\\:hms}}':x=4:y=4:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.65,tile=6x2:padding=3:color=0x222222",
         "-frames:v", "1", str(out / "hook.png")])

    lens = [s1 - s0 for s0, s1 in shots]
    rep = [f"# Референс: {name}", "", f"Источник: {a.src}", f"Формат: {v['width']}×{v['height']}, {fps:.0f} fps, {dur:.1f} с",
           f"Планов: {len(shots)}; средняя длина {sum(lens) / len(lens):.2f} с; мин {min(lens):.2f} с; макс {max(lens):.2f} с",
           f"Громкость: {lufs[-1] + ' LUFS' if lufs else 'нет звука'}", "", f"Листы планов: {', '.join(sheets)}; хук: hook.png", "",
           "| # | Начало | Длина |", "|---|--------|-------|"] + [f"| {i + 1} | {s0:.2f} | {s1 - s0:.2f} |" for i, (s0, s1) in enumerate(shots)]
    (out / "report.md").write_text("\n".join(rep) + "\n", encoding="utf-8")
    print("\n".join(rep[:7]))
    print(f"→ {out}")


if __name__ == "__main__":
    main()
