#!/usr/bin/env python3
"""«Послушать» озвучку перед сдачей: одна команда, сводка по каждой реплике.

    ~/.venvs/kokoro/bin/python tools/vo-listen.py lines.json <папка с <id>.wav> [--model small] [--lang ru]

Проверяет: слова (Whisper распознаёт обратно, сходство с текстом, норма ≥ 85 %), темп (слогов/с: рус. 4–7.5 норма),
паузы внутри фразы > 0.8 с, обрыв в конце (тишина < 40 мс), перегруз (пик ≥ −0.3 dBFS), тихо/громко (RMS),
затем интонацию вопросов/восклицаний (`vo-intonation.py`) и, если стоит Qwen-детектор, ударения (`vo-stress-check.py`).
Что ловится — чинить сразу (новый дубль, `vo-bend.py`, обрезка); в отчёте пользователю — короткая сводка.
Тембр, живость, «похож ли на героя» — не меряется, это на слух пользователя.
"""
import argparse, json, re, subprocess, sys, os, difflib
from pathlib import Path
import numpy as np, librosa
from faster_whisper import WhisperModel
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("dir")
ap.add_argument("--model", default="small"); ap.add_argument("--lang", default=None); a = ap.parse_args()
spec = json.load(open(a.lines)); m = WhisperModel(a.model, device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^\w ]", "", s.lower().replace("ё", "е")).split()
VOW = re.compile(r"[аеёиоуыэюяaeiouy]", re.I)
bad = 0
print(f"{'id':6} {'слова':>6} {'слог/с':>6} {'пик':>6} {'RMS':>6}  замечания")
for ln in spec["lines"]:
    f = Path(a.dir) / f"{ln['id']}.wav"
    if not f.exists(): print(f"{ln['id']:6} нет файла"); bad += 1; continue
    y, sr = librosa.load(f, sr=16000); notes = []
    lang = a.lang or spec.get("roles", {}).get(ln.get("role"), {}).get("lang") or ("ru" if re.search("[а-я]", ln["text"], re.I) else "en")
    segs, _ = m.transcribe(str(f), language=lang, word_timestamps=True)
    words = [w for s in segs for w in s.words]; heard = " ".join(w.word.strip() for w in words)
    sim = difflib.SequenceMatcher(None, norm(ln["text"]), norm(heard)).ratio() * 100
    if sim < 85: notes.append(f"слышно: «{heard.strip()}»")
    iv = librosa.effects.split(y, top_db=35); speech = sum(e - s for s, e in iv) / sr
    rate = len(VOW.findall(ln["text"])) / max(speech, 0.1)
    if lang == "ru" and not 4 <= rate <= 7.5: notes.append("медленно" if rate < 4 else "быстро")
    gaps = [(iv[i+1][0] - iv[i][1]) / sr for i in range(len(iv) - 1)]
    if gaps and max(gaps) > 0.8: notes.append(f"пауза {max(gaps):.1f} с")
    if len(iv) and (len(y) - iv[-1][1]) / sr < 0.04: notes.append("обрыв в конце")
    peak = 20 * np.log10(np.abs(y).max() + 1e-9); rms = 20 * np.log10(np.sqrt(np.mean(y**2)) + 1e-9)
    if peak >= -0.3: notes.append("перегруз")
    if rms < -32: notes.append("тихо")
    bad += bool(notes)
    print(f"{ln['id']:6} {sim:5.0f}% {rate:6.1f} {peak:6.1f} {rms:6.1f}  {'; '.join(notes) or 'ок'}")
T = Path(__file__).parent
if any(re.search(r"[?!]", l["text"]) for l in spec["lines"]):
    print("\n— интонация:"); r = subprocess.run([sys.executable, T / "vo-intonation.py", a.lines, a.dir], capture_output=True, text=True)
    print(r.stdout.strip()); bad += r.stdout.count("ПЛОХО")
q = Path.home() / ".venvs/qwentts/bin/python"; head = Path.home() / "models/rus/meter/head.pt"
if q.exists() and head.exists() and any(re.search("[а-я]", l["text"], re.I) for l in spec["lines"]):
    print("\n— ударения:"); subprocess.run([q, T / "vo-stress-check.py", a.lines, a.dir], env={**os.environ, "METER2_HEAD": str(head)})
else: print("\n— ударения по звуку: детектор не установлен (bash tools/setup-voice.sh qwen), проверены только по тексту")
print(f"\nИтог: замечаний — {bad} (реплик {len(spec['lines'])})")
