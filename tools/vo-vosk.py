#!/usr/bin/env python3
"""Озвучка локальной моделью Vosk TTS (Apache 2.0, 57 дикторов, ударения по словарю на 2 млн слов) — заметно живее Piper.

    python3 tools/vo-vosk.py lines.json -o projects/<имя>/assets/vo/ep1 [--check]

lines.json: [{"id": "n01", "text": "Фраза", "speaker": 26, "speed": 1.0, "pitch": 1.0, "fx": "radio|dead|whisper"}]
  speaker — номер диктора (подобраны для «ПОПАЛ»: 26 — нарратор, низкий тёплый; 7 — молодой парень; 49 — женский средний;
            29 — высокий женский (слайм, с pitch 1.2); 46 — низкий женский; 13 — самый низкий мужской; 39 — низкий мужской).
  Ударение в слове, которого нет в словаре (имена, сленг), ставить знаком «+» перед ударной гласной: «Эльд+ория», «дод+еп».
--check — только проверить: какие слова не найдены в словаре и без «+» (их ударение синтез угадает плохо).
Модель (≈ 700 МБ, один раз): https://alphacephei.com/vosk/models/vosk-model-tts-ru-0.10-multi.zip → assets/voices/
Ставится: pip install --user vosk-tts
"""
import argparse, json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "assets/voices/vosk-model-tts-ru-0.10-multi"
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out"); ap.add_argument("--check", action="store_true"); ap.add_argument("--only", help="id через запятую")
a = ap.parse_args()
lines = json.loads(Path(a.lines).read_text(encoding="utf-8"))
if a.only: lines = [l for l in lines if l["id"] in a.only.split(",")]
dic = set()
with open(MODEL / "dictionary", encoding="utf-8") as f:
    for row in f: dic.add(row.split(" ", 1)[0])
bad = []
for ln in lines:
    for w in re.findall(r"[а-яёА-ЯЁ+\-]+", ln["text"]):
        lw = w.lower().strip("-")
        if lw and "+" not in lw and lw not in dic and lw.replace("ё", "е") not in dic: bad.append((ln["id"], w))
if bad: print("нет в словаре (поставить «+» перед ударной гласной):", ", ".join(f"{i}:{w}" for i, w in bad))
if a.check: sys.exit(0)
from vosk_tts import Model, Synth
synth = Synth(Model(model_path=str(MODEL)))
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
dfile = out / "durations.json"; durs = json.loads(dfile.read_text()) if dfile.exists() else {}
for ln in lines:
    raw, wav = out / f"{ln['id']}.raw.wav", out / f"{ln['id']}.wav"
    synth.synth(ln["text"], str(raw), speaker_id=ln.get("speaker", 26), speech_rate=ln.get("speed", 1.0))
    # обработка как в vo.py: убрать гул, теплее, плотнее, лёгкая комната
    af = "highpass=f=70,lowpass=f=11000,equalizer=f=160:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.5:g=1,acompressor=threshold=-20dB:ratio=2.2:attack=8:release=120,aecho=0.85:0.6:24|41:0.07|0.04,aresample=48000"
    p = ln.get("pitch", 1.0)
    if p != 1.0: af = f"aresample=48000,asetrate={int(48000 * p)},aresample=48000,atempo={1 / p:.4f}," + af
    fx = ln.get("fx")
    if fx == "whisper": af += ",highpass=f=300,acompressor=threshold=-28dB:ratio=3,aecho=0.8:0.7:60|120:0.2|0.12"
    if fx == "dead": af += ",highpass=f=60,lowpass=f=6000,acrusher=bits=12:mix=0.12,aecho=0.8:0.85:70|150|260:0.35|0.25|0.15"
    if fx == "radio": af += ",highpass=f=300,lowpass=f=3600,acrusher=bits=10:mix=0.25"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af + ",silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.06", str(wav)], check=True); raw.unlink()
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    durs[ln["id"]] = round(d, 3); print(f"{ln['id']}: {d:.2f} с — {ln['text']}")
dfile.write_text(json.dumps(durs, ensure_ascii=False, indent=1))
