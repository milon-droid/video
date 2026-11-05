#!/usr/bin/env python3
"""Баланс «голос / фон»: насколько голос громче всего остального в каждой реплике (цель ≈ +10 дБ).

    python3 tools/vo-balance.py projects/<имя>/sfx-ep1.json [--duration 58] [--vo /vo/] [--win 1.6]

Голос — cue типа "file", в пути которого есть --vo (по умолчанию «/vo/»); остальное — фон.
Микс собирается tools/sfx.py как в ролике (с автоприглушением фона), голос и фон сравниваются по RMS в окне от начала каждой реплики.
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("cues"); ap.add_argument("--duration", type=float); ap.add_argument("--vo", default="/vo/"); ap.add_argument("--win", type=float, default=1.6); ap.add_argument("--target", type=float, default=10); ap.add_argument("--fixed", action="store_true", help="окно фиксированной длины --win вместо длины реплики"); ap.add_argument("--margin", default=None, help="передать в sfx.py --voice-margin (0 — без автоприглушения)")
a = ap.parse_args(); cues = json.load(open(a.cues, encoding="utf-8"))
vo = [c for c in cues if c["type"] == "file" and a.vo in c.get("path", "")]; bg = [c for c in cues if c not in vo]
if not vo: sys.exit("нет реплик голоса (cue type=file с «/vo/» в пути)")
D = a.duration or max(c["t"] for c in cues) + 8; td = Path(tempfile.mkdtemp())
def load(f): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
(td / "c.json").write_text(json.dumps(cues))  # один микс как в ролике (с автоприглушением), голос и фон — отдельными дорожками
subprocess.run([sys.executable, str(ROOT / "tools/sfx.py"), str(td / "c.json"), "-o", str(td / "m.wav"), "--duration", str(D), "--no-norm", "--stems", str(td)] + (["--voice-margin", a.margin] if a.margin is not None else []), capture_output=True, check=True)
v, b = load(td / "voice.wav"), load(td / "bg.wav"); low = []
ap2 = 20 * np.log10(np.sqrt(np.convolve(v.astype(float) ** 2, np.ones(800) / 800, "same")) + 1e-9)  # огибающая голоса 50 мс
for c in vo:
    i0 = int(c["t"] * 16000); i1 = min(len(v), i0 + int(a.win * 16000) if a.fixed else len(v)); seg = slice(i0, i1)
    act = np.where(ap2[seg] > ap2[seg].max() - 25)[0] if i1 > i0 else []  # только где голос реально звучит (не тише пика реплики на 25 дБ)
    if not a.fixed and len(act): last = act[-1]; gaps = np.where(np.diff(act) > 16000 * .6)[0]; act = act[:gaps[0] + 1] if len(gaps) else act  # до конца этой реплики
    idx = i0 + np.array(act, int) if len(act) else np.arange(i0, i1)
    rv = np.sqrt(np.mean(v[idx].astype(float) ** 2)) + 1e-9; rb = np.sqrt(np.mean(b[idx].astype(float) ** 2)) + 1e-9; d = 20 * np.log10(rv / rb)
    mark = "  [!] голос тонет — убавить фон или поднять gain голоса" if d < a.target - 2 else ""
    if mark: low.append(c["t"])
    print(f"  {Path(c['path']).stem:10s} {c['t']:6.1f} с  голос громче фона на {d:5.1f} дБ{mark}")
print(f"Итого: {len(vo)} реплик, тонут {len(low)}")
