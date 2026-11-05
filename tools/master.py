#!/usr/bin/env python3
"""Мастер звука в ролике: двухпроходный loudnorm (точно −14 LUFS, пик ≤ −1 dBTP — цель −1,5 с запасом), видео копируется без перекодирования.

    python3 tools/master.py raw.mp4 out.mp4 [--duration 58] [--i -14] [--tp -1] [--lra 9] [--audio mix.wav]

--audio — взять звук из отдельного файла (иначе из raw.mp4).
"""
import argparse, json, re, subprocess
ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--duration", type=float); ap.add_argument("--audio")
ap.add_argument("--i", type=float, default=-14); ap.add_argument("--tp", type=float, default=-1.5); ap.add_argument("--lra", type=float, default=9)
a = ap.parse_args()
asrc = a.audio or a.src
# предлимитер под нужное усиление: громкие удары + тихая речь → loudnorm поднимет всё на g дБ, поэтому пики режем заранее до (TP − g − 0,5)
m0 = subprocess.run(["ffmpeg", "-hide_banner", "-i", asrc, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
i0 = float(json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", m0, re.S)[-1])["input_i"]); g = a.i - i0
lim = min(0.9, max(0.05, 10 ** ((a.tp - 0.5 - g) / 20))); pre = f"alimiter=limit={lim:.4f}:attack=2:release=60:level=false"
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", asrc, "-af", f"{pre},loudnorm=I={a.i}:TP={a.tp}:LRA={a.lra}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", m, re.S)[-1])
af = (f"{pre},loudnorm=I={a.i}:TP={a.tp}:LRA={a.lra}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=192000,alimiter=limit={10 ** ((a.tp - 1.0) / 20):.4f}:attack=1:release=40:level=false,aresample=48000")  # страховка пика: лимитер на 4× частоте ≈ true peak, запас 1 дБ на AAC
cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.src] + (["-i", a.audio, "-map", "0:v", "-map", "1:a"] if a.audio else []) + (["-t", str(a.duration)] if a.duration else []) + \
      ["-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", a.out]
subprocess.run(cmd, check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", a.out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]; P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1]
print(f"мастер → {a.out}: {I} LUFS, пик {P} dBTP")
