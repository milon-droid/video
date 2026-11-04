#!/usr/bin/env python3
"""Озвучка текста локальным синтезом речи Piper (бесплатно, без интернета после загрузки голоса).

    python3 tools/vo.py lines.json -o projects/<имя>/assets/vo [--voice ru_RU-dmitri-medium] [--speed 1.08]

lines.json: [{"id": "s1", "text": "Фраза для плана 1"}, ...]
Результат: <id>.wav для каждой фразы и durations.json {id: секунды}.
Голос скачать (один раз, ~63 МБ, лицензия датасета CC0):
  https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/dmitri/medium → assets/voices/
Ставится: pip install --user piper-tts
Числа писать словами, кавычки и сокращения убирать — синтез читает буквально.
Ударения синтез ставит сам и может ошибаться. Проверка без прослушивания — фонетика:
  python3 -c "from piper import PiperVoice as V; v=V.load('assets/voices/ru_RU-dmitri-medium.onnx'); print(v.phonemize('текст'))"
  (знак ˈ стоит перед ударной гласной). Исправление — фраза целиком в фонетике: [[ spˈojlʲiry ]].
  Знак ударения над буквой (´) синтез игнорирует.
"""
import argparse, json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out", required=True)
ap.add_argument("--voice", default="ru_RU-dmitri-medium"); ap.add_argument("--speed", type=float, default=1.02, help="1.0 — обычно, больше — быстрее")
ap.add_argument("--noise", type=float, default=0.75, help="живость интонации (выше — меньше робот, но больше «плавает»)")
ap.add_argument("--noise-w", type=float, default=0.9)
ap.add_argument("--raw", action="store_true", help="без обработки звука")
a = ap.parse_args()
model = ROOT / "assets" / "voices" / f"{a.voice}.onnx"
if not model.exists(): sys.exit(f"нет голоса {model} — см. описание в начале файла")
out = Path(a.out); out.mkdir(parents=True, exist_ok=True); durs = {}
for ln in json.loads(Path(a.lines).read_text(encoding="utf-8")):
    wav = out / f"{ln['id']}.wav"
    raw = out / f"{ln['id']}.raw.wav"
    subprocess.run([sys.executable, "-m", "piper", "-m", str(model), "-f", str(raw), "--length-scale", str(1 / a.speed), "--sentence-silence", "0.18",
                    "--noise-scale", str(a.noise), "--noise-w-scale", str(a.noise_w)], input=ln["text"], text=True, check=True, capture_output=True)
    # обработка: убрать гул, чуть теплее и плотнее, лёгкая «комната» — меньше металла в голосе
    af = "anull" if a.raw else "highpass=f=80,lowpass=f=9500,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.5:g=-2.5,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,aecho=0.85:0.6:28|47:0.10|0.06,aresample=48000"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, str(wav)], check=True); raw.unlink()
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    durs[ln["id"]] = round(d, 3); print(f"{ln['id']}: {d:.2f} с — {ln['text']}")
(out / "durations.json").write_text(json.dumps(durs, ensure_ascii=False, indent=1))
