#!/usr/bin/env python3
"""Из дублей <id>.cN.wav выбрать самый разборчивый по Whisper (сходство с "check"/"text", штраф за длину) → <id>.wav.
    ~/.venvs/qwentts/bin/python tools/vo-whisper-pick.py lines.json <папка> [--lang ru] [--model small] [--maxlen 3.5]"""
import argparse, json, glob, os, subprocess, difflib, numpy as np
from faster_whisper import WhisperModel
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("dir"); ap.add_argument("--lang", default="ru"); ap.add_argument("--model", default="small"); ap.add_argument("--maxlen", type=float, default=3.5)
a = ap.parse_args(); L = {l["id"]: l for l in json.load(open(a.lines))["lines"]}
wm = WhisperModel(a.model, device="cpu", compute_type="int8")
norm = lambda s: ''.join(ch for ch in s.lower().replace('ё', 'е') if ch.isalnum())
for i, ln in L.items():
    cands = sorted(glob.glob(f"{a.dir}/{i}.c*.wav"))
    if not cands: continue
    best = None
    for f in cands:
        x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
        txt = " ".join(s.text.strip() for s in wm.transcribe(x, language=a.lang, beam_size=5)[0]); d = len(x) / 16000
        sim = difflib.SequenceMatcher(None, norm(txt), norm(ln.get("check", ln["text"]))).ratio(); sc = sim - .02 * max(0, d - a.maxlen)
        print(i, os.path.basename(f), f"{sim:.2f}", f"{d:.2f}s", txt, flush=True)
        if best is None or sc > best[0]: best = (sc, f, txt, d)
    os.replace(best[1], f"{a.dir}/{i}.wav"); print("ВЫБРАН", i, best[2], f"{best[3]:.2f}s", flush=True)
    for f in cands:
        if os.path.exists(f): os.remove(f)
