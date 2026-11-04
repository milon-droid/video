#!/usr/bin/env python3
"""Субтитры в стиле TikTok/Reels: из размеченного текста в .ass для вшивания ffmpeg.

Формат входа (по строке на титр, пустые строки и # — игнорируются):

    0:00.0 - 0:01.6 | Ты делаешь это неправильно
    0:01.6 - 0:03.2 | Вот как надо

Время: С.с, М:СС.с или Ч:ММ:СС.с.

Примеры:
    python3 tools/captions.py subs.txt -o subs.ass --karaoke --upper
    ffmpeg -i in.mp4 -vf "subtitles=subs.ass:fontsdir=fonts" -c:a copy out.mp4
"""
import argparse
import re
import sys
from pathlib import Path

LINE_RE = re.compile(r"^\s*([\d:.,]+)\s*-\s*([\d:.,]+)\s*\|\s*(.+?)\s*$")


def parse_time(s: str) -> float:
    parts = s.replace(",", ".").split(":")
    t = 0.0
    for p in parts:
        t = t * 60 + float(p)
    return t


def ass_time(t: float) -> str:
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def hex_to_ass(color: str) -> str:
    c = color.lstrip("#")
    r, g, b = c[0:2], c[2:4], c[4:6]
    return f"&H00{b}{g}{r}".upper()


def karaoke(text: str, dur: float) -> str:
    words = text.split()
    weights = [max(len(w), 2) for w in words]
    total = sum(weights)
    out = []
    left = int(round(dur * 100))
    for i, (w, wt) in enumerate(zip(words, weights)):
        k = left if i == len(words) - 1 else int(round(dur * 100 * wt / total))
        left -= k
        out.append(f"{{\\kf{k}}}{w}")
    return " ".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("-o", "--out", help="выходной .ass (по умолчанию рядом с входом)")
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1920)
    ap.add_argument("--size", type=int, default=84, help="кегль при высоте 1920")
    ap.add_argument("--font", default="Inter Black")
    ap.add_argument("--color", default="#FFFFFF", help="цвет текста")
    ap.add_argument("--accent", default="#FFE600", help="цвет подсветки слов (karaoke)")
    ap.add_argument("--outline", type=float, default=7)
    ap.add_argument("--y", type=int, default=1430, help="нижняя линия титра по высоте 1920 (выше зоны UI)")
    ap.add_argument("--karaoke", action="store_true", help="подсвечивать слова по ходу речи")
    ap.add_argument("--upper", action="store_true", help="ВЕРХНИЙ РЕГИСТР")
    a = ap.parse_args()

    k = a.height / 1920
    events = []
    for n, raw in enumerate(Path(a.input).read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        m = LINE_RE.match(raw)
        if not m:
            print(f"строка {n}: не понял формат: {raw!r}", file=sys.stderr)
            return 1
        start, end, text = parse_time(m[1]), parse_time(m[2]), m[3]
        if end <= start:
            print(f"строка {n}: конец раньше начала", file=sys.stderr)
            return 1
        if a.upper:
            text = text.upper()
        body = karaoke(text, end - start) if a.karaoke else text
        events.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Main,,0,0,0,,{body}")

    primary = hex_to_ass(a.accent if a.karaoke else a.color)
    secondary = hex_to_ass(a.color)
    margin_v = int((1920 - a.y) * k)
    style = (
        f"Style: Main,{a.font},{int(a.size * k)},{primary},{secondary},&H00000000,&H80000000,"
        f"0,0,0,0,100,100,0,0,1,{a.outline * k:.1f},2,2,{int(90 * k)},{int(180 * k)},{margin_v},1"
    )
    ass = "\n".join([
        "[Script Info]",
        "ScriptType: v4.00+",
        f"PlayResX: {a.width}",
        f"PlayResY: {a.height}",
        "WrapStyle: 0",
        "ScaledBorderAndShadow: yes",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding",
        style,
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
        *events,
        "",
    ])
    out = Path(a.out) if a.out else Path(a.input).with_suffix(".ass")
    out.write_text(ass, encoding="utf-8")
    print(f"{len(events)} титров → {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
