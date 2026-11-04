#!/usr/bin/env python3
"""Озвучка текста локальным синтезом речи Piper (бесплатно, без интернета после загрузки голоса).

    python3 tools/vo.py lines.json -o projects/<имя>/assets/vo [--voice ru_RU-dmitri-medium] [--speed 1.08]

lines.json: [{"id": "s1", "text": "Фраза для плана 1"}, ...]
Результат: <id>.wav для каждой фразы и durations.json {id: секунды}.
Голос скачать (один раз, ~63 МБ, лицензия датасета CC0):
  https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/dmitri/medium → assets/voices/
Ставится: pip install --user piper-tts
Числа писать словами, кавычки и сокращения убирать — синтез читает буквально.
Ударения синтез ставит сам и может ошибаться: проверять на слух, при ошибке — заменить слово или
поставить знак ударения «+» перед гласной не поддерживается, лучше перефразировать.
"""
import argparse, json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out", required=True)
ap.add_argument("--voice", default="ru_RU-dmitri-medium"); ap.add_argument("--speed", type=float, default=1.08, help="1.0 — обычно, больше — быстрее")
a = ap.parse_args()
model = ROOT / "assets" / "voices" / f"{a.voice}.onnx"
if not model.exists(): sys.exit(f"нет голоса {model} — см. описание в начале файла")
out = Path(a.out); out.mkdir(parents=True, exist_ok=True); durs = {}
for ln in json.loads(Path(a.lines).read_text(encoding="utf-8")):
    wav = out / f"{ln['id']}.wav"
    subprocess.run([sys.executable, "-m", "piper", "-m", str(model), "-f", str(wav), "--length-scale", str(1 / a.speed), "--sentence-silence", "0.12"],
                   input=ln["text"], text=True, check=True, capture_output=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    durs[ln["id"]] = round(d, 3); print(f"{ln['id']}: {d:.2f} с — {ln['text']}")
(out / "durations.json").write_text(json.dumps(durs, ensure_ascii=False, indent=1))
