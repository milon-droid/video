#!/usr/bin/env python3
"""Проверка интонации готовой озвучки: вопросы (?) — подъём тона в конце, восклицания (!) — конец не «падает» и не тише фразы.

    ~/.venvs/qwentts/bin/python tools/vo-intonation.py lines.json <папка с wav> [--only a1,b1]

Для каждой реплики с «?» или «!» по последнему слову фразы (тайминг слов faster-whisper) меряет:
  ? — тон последнего слова против медианы фразы (полутона); норма ≥ +1.5 пт (русский вопрос ИК-3 — подъём на ударном слоге);
  ! — тон и громкость последнего слова против фразы; норма: тон ≥ −1 пт и громкость ≥ −4 дБ.
Печатает ОК / ПЛОХО. Плохой вопрос чинится `tools/vo-bend.py file.wav "слово" --peak 4` или новым дублем (`vo-qwen.py --cands 6`).
Вместе с `tools/vo-stress-check.py` (ударения по звуку) — полная проверка перед сборкой.
"""
import argparse, json, re, subprocess
from pathlib import Path
import numpy as np, librosa
from faster_whisper import WhisperModel
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("dir"); ap.add_argument("--only"); a = ap.parse_args()
lines = json.loads(Path(a.lines).read_text(encoding="utf-8"))["lines"]
if a.only: lines = [l for l in lines if l["id"] in a.only.split(",")]
wm = WhisperModel("small", device="cpu", compute_type="int8")
st = lambda x, y: 12 * np.log2(max(x, 1) / max(y, 1))
norm = lambda s: re.sub(r"[^а-яa-z0-9]", "", s.lower().replace("ё", "е"))
bad = 0
for ln in lines:
    t = ln["text"]
    if "?" not in t and "!" not in t: continue
    f = Path(a.dir) / f"{ln['id']}.wav"
    if not f.exists(): continue
    y, sr = librosa.load(f, sr=16000)
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=450, sr=sr, frame_length=1024, hop_length=160)
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=160)[0]
    words = [w for s in wm.transcribe(y, language="ru", word_timestamps=True)[0] for w in s.words]
    # каждое «?»/«!» в тексте → слово перед ним (по порядку слов текста)
    tw = re.findall(r"[А-Яа-яЁё+*\-]+[^А-Яа-яЁё+*\-\s]*", t.replace("+", ""))
    for i, w in enumerate(tw):
        mk = "?" if "?" in w else "!" if "!" in w else None
        if not mk: continue
        # найти это слово среди распознанных (по совпадению начала), иначе — по доле позиции
        key = norm(w)[:4]; cand = [x for x in words if norm(x.word)[:4] == key]
        if cand: s0, s1 = cand[0].start, cand[0].end
        else: k = int(len(words) * (i + 1) / len(tw)) - 1; s0, s1 = (words[k].start, words[k].end) if words else (0, len(y) / sr)
        fr = lambda s: int(s * sr / 160)
        ph_end = fr(s1); allv = f0[:ph_end]; allv = allv[~np.isnan(allv)]
        wv = f0[fr(s0):fr(s1) + 1]; wv = wv[~np.isnan(wv)]
        if len(allv) < 5 or len(wv) < 2: print(ln["id"], mk, w, "— мало голоса, проверить на слух"); continue
        med = np.median(allv); pk = np.percentile(wv, 85); dv = st(pk, med)
        de = 20 * np.log10((rms[fr(s0):fr(s1) + 1].mean() + 1e-9) / (rms[:ph_end].mean() + 1e-9))
        ok = dv >= 1.5 if mk == "?" else (dv >= -1 and de >= -4)
        bad += not ok
        print(f"{ln['id']} {mk} «{w}»: тон {dv:+.1f} пт, громкость {de:+.1f} дБ — {'ОК' if ok else 'ПЛОХО'}")
print("плохих:", bad)
