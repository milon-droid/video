#!/usr/bin/env python3
"""Озвучка Chatterbox Multilingual (Resemble AI, MIT): клон голоса по образцу, 23 языка, сила эмоции (exaggeration).
Для русского живее Qwen3-TTS (пользователь отклонил Qwen-русский как «робот», 2026-11-10).

    ~/.venvs/cbox/bin/python tools/vo-cbox.py lines.json -o <папка> --ref ref.wav [--only a3,c1] [--cands 4] [--lang ru]
Установка: python3 -m venv ~/.venvs/cbox && ~/.venvs/cbox/bin/pip install chatterbox-tts
lines.json — как у vo-qwen.py; у реплики можно "say" (текст для синтеза), "exag" (0.3…1.2, по умолчанию 0.7), "cfg" (0.2…0.7, ниже — медленнее и выразительнее).
Дубли сохраняются как <id>.cN.wav; выбрать лучший по Whisper: ~/.venvs/qwentts/bin/python tools/vo-whisper-pick.py lines.json <папка> --lang ru
"""
import argparse, json, os, subprocess
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out", required=True); ap.add_argument("--ref", required=True)
ap.add_argument("--only"); ap.add_argument("--cands", type=int, default=3); ap.add_argument("--lang", default="ru")
a = ap.parse_args()
torch.set_num_threads(os.cpu_count() or 4)
cfg = json.load(open(a.lines)); lines = [l for l in cfg["lines"] if not a.only or l["id"] in a.only.split(",")]
os.makedirs(a.out, exist_ok=True)
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
AF = ("highpass=f=70,lowpass=f=12000,silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.4:stop_threshold=-42dB:stop_silence=0.3"
      ",areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,apad=pad_dur=0.06,aresample=48000")
for ln in lines:
    for k in range(a.cands):
        w = m.generate(ln.get("say", ln["text"]).replace("+", ""), language_id=a.lang, audio_prompt_path=a.ref, exaggeration=ln.get("exag", .7), cfg_weight=ln.get("cfg", .4))
        raw = f"{a.out}/{ln['id']}.c{k}.raw.wav"; ta.save(raw, w, m.sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", AF, f"{a.out}/{ln['id']}.c{k}.wav"], check=True); os.remove(raw)
        print(ln["id"], k, "ok", flush=True)
