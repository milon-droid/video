#!/usr/bin/env python3
"""Вопросительная интонация вручную: плавно поднять тон на слове реплики (ffmpeg rubberband, темп не меняется).

    python3 tools/vo-bend.py file.wav "Вопросы" [--peak 3.5] [--at 0.45] [--tail 1.0]

Слово ищется распознаванием (faster-whisper). Контур как у русского вопроса (ИК-3): подъём к ударному слогу
(--at — доля слова, где ударение), пик --peak полутонов, к концу слова спад до --tail полутонов. Файл перезаписывается.
"""
import argparse, subprocess, numpy as np, shutil, re
ap = argparse.ArgumentParser(); ap.add_argument("wav"); ap.add_argument("word"); ap.add_argument("--peak", type=float, default=3.5)
ap.add_argument("--at", type=float, default=.45); ap.add_argument("--tail", type=float, default=1.0); a = ap.parse_args()
from faster_whisper import WhisperModel
pcm = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", a.wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32)
segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(pcm, language="ru", word_timestamps=True)
key = a.word.lower().replace("ё", "е"); hit = None
for s in segs:
    for w in s.words:
        if re.sub(r"[^а-яё]", "", w.word.lower()).replace("ё", "е") == key: hit = (w.start, w.end)
if not hit: raise SystemExit(f"слово «{a.word}» не найдено")
s0, s1 = hit; L = s1 - s0
pts = [(s0 - .02, 0), (s0 + L * a.at * .5, a.peak * .45), (s0 + L * a.at, a.peak), (s0 + L * min(.95, a.at + .3), (a.peak + a.tail) / 2), (s1, a.tail), (s1 + .15, 0)]
cmds = []
for (t0, p0), (t1, p1) in zip(pts, pts[1:]):  # ступеньки по 25 мс
    n = max(1, int((t1 - t0) / .025))
    for k in range(n): t = t0 + (t1 - t0) * k / n; p = p0 + (p1 - p0) * k / n; cmds.append(f"{max(0, t):.3f} rubberband pitch {2 ** (p / 12):.4f}")
cmds.append(f"{pts[-1][0]:.3f} rubberband pitch 1.0")
tmp = a.wav + ".bend.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.wav, "-af", f"asendcmd=c='{';'.join(cmds)}',rubberband=pitch=1.0:formant=preserved", tmp], check=True)
shutil.move(tmp, a.wav); print(f"«{a.word}» {s0:.2f}–{s1:.2f} с: подъём до +{a.peak} пт")
