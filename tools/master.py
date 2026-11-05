#!/usr/bin/env python3
"""Мастер звука в ролике: двухпроходный loudnorm (точно −14 LUFS, пик ≤ −1 dBTP — цель −1,5 с запасом), видео копируется без перекодирования.

    python3 tools/master.py raw.mp4 out.mp4 [--duration 58] [--i -14] [--tp -1] [--lra 9] [--audio mix.wav]

--audio — взять звук из отдельного файла (иначе из raw.mp4).
"""
import argparse, json, re, subprocess
ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--duration", type=float); ap.add_argument("--audio")
ap.add_argument("--i", type=float, default=-14); ap.add_argument("--tp", type=float, default=-1.5); ap.add_argument("--lra", type=float, default=9)
a = ap.parse_args()
asrc = a.audio or a.src; pre = "alimiter=limit=0.6:level=false"
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", asrc, "-af", f"{pre},loudnorm=I={a.i}:TP={a.tp}:LRA={a.lra}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", m, re.S)[-1])
af = (f"{pre},loudnorm=I={a.i}:TP={a.tp}:LRA={a.lra}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.src] + (["-i", a.audio, "-map", "0:v", "-map", "1:a"] if a.audio else []) + (["-t", str(a.duration)] if a.duration else []) + \
      ["-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", a.out]
subprocess.run(cmd, check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", a.out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]; P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1]
print(f"мастер → {a.out}: {I} LUFS, пик {P} dBTP")
