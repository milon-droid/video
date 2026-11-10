#!/usr/bin/env python3
# ~/.venvs/qwentts/bin/python tools/vo-pick.py lines.json <папка> a3,c1 5  — N дублей VoiceDesign, Whisper выбирает самый разборчивый ("check" — эталон текста)
# Несколько дублей VoiceDesign на реплику → Whisper → лучший по совпадению текста (и короче при равенстве)
import json, sys, os, subprocess, difflib, numpy as np, soundfile as sf, torch
from qwen_tts import Qwen3TTSModel
from faster_whisper import WhisperModel
cfg, out, ids, N = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3].split(','), int(sys.argv[4])
roles = cfg["roles"]; L = {l["id"]: l for l in cfg["lines"]}
torch.set_num_threads(os.cpu_count() or 4)
vd = Qwen3TTSModel.from_pretrained(os.path.expanduser("~/models/vd"), device_map="cpu", dtype=torch.float32)
wm = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: ''.join(ch for ch in s.lower().replace('ё', 'е') if ch.isalnum())
AF = ("highpass=f=70,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2:attack=8:release=120,silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.4:stop_threshold=-42dB:stop_silence=0.3"
      ",areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,apad=pad_dur=0.06,aresample=48000")
for i in ids:
    ln = L[i]; target = ln.get("check", ln["text"]); best = None
    for k in range(N):
        w, sr = vd.generate_voice_design(text=ln.get("say", ln["text"]).replace("+", ""), language="Russian", instruct=(roles[ln["role"]]["instruct"] + " " + ln.get("emo", "")).strip(), do_sample=True, temperature=.9)
        raw = f"{out}/{i}.c{k}.raw.wav"; wav = f"{out}/{i}.c{k}.wav"; sf.write(raw, w[0], sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", AF, wav], check=True); os.remove(raw)
        x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
        txt = " ".join(s.text.strip() for s in wm.transcribe(x, language="ru", beam_size=5)[0]); sim = difflib.SequenceMatcher(None, norm(txt), norm(target)).ratio(); d = len(x) / 16000
        sc = sim - .02 * max(0, d - 3.2); print(i, k, f"{sim:.2f}", f"{d:.2f}s", txt, flush=True)
        if best is None or sc > best[0]: best = (sc, wav, txt, d)
    os.replace(best[1], f"{out}/{i}.wav"); print("ВЫБРАН", i, best[2], f"{best[3]:.2f}s", flush=True)
    for k in range(N):
        p = f"{out}/{i}.c{k}.wav"
        if os.path.exists(p): os.remove(p)
