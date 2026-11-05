#!/usr/bin/env python3
"""Время каждого слова по озвучке (faster-whisper, локально, без ключей) → для караоке-субтитров.

    python3 tools/words.py lines.json vo_dir -o words.json [--model base]

lines.json — те же фразы, что для tools/vo.py: [{"id", "text", "caption"?: "текст субтитра, если он другой (перевод)"}].
Результат: {id: [время начала каждого слова субтитра, с]} — слова субтитра берутся из "caption" или "text",
времена — из распознанных слов (по пропорции символов), так что совпадает и при мелких ошибках распознавания.
Первый запуск скачивает модель (~150 МБ для base).
"""
import argparse, json, re
from pathlib import Path
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("vo_dir"); ap.add_argument("-o", "--out", required=True); ap.add_argument("--model", default="base")
a = ap.parse_args()
from faster_whisper import WhisperModel
m = WhisperModel(a.model, device="cpu", compute_type="int8")
out = {}
for ln in json.loads(Path(a.lines).read_text(encoding="utf-8")):
    wav = Path(a.vo_dir) / f"{ln['id']}.wav"
    lang = "kk" if ln.get("voice", "").startswith("kk") else "ru"
    import subprocess, numpy as np  # звук через ffmpeg (не зависит от версии PyAV)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, dtype=np.float32), language=lang, word_timestamps=True, vad_filter=False)
    rec = [(w.start, w.end, w.word.strip()) for s in segs for w in (s.words or []) if w.word.strip()]
    cap = [w for w in re.sub(r"\*\*", "", ln.get("caption", ln["text"])).split() if w not in ("—", "-")]
    if not rec: out[ln["id"]] = []; continue
    if len(rec) == len(cap) and not ln.get("caption"): times = [r[0] for r in rec]
    else:  # пропорционально длине слов по распознанной речи
        spans = [(s, e, max(1, len(w))) for s, e, w in rec]; tot = sum(c for *_, c in spans); ctot = sum(len(w) for w in cap); times = []; acc = 0
        for w in cap:
            pos = acc / ctot * tot; run = 0
            for s, e, c in spans:
                if run + c >= pos: times.append(round(s + (e - s) * (pos - run) / c, 3)); break
                run += c
            else: times.append(spans[-1][0])
            acc += len(w)
    out[ln["id"]] = [round(x, 3) for x in times]
    print(ln["id"], lang, len(rec), "слов распознано →", " ".join(f"{w}@{t:.2f}" for w, t in zip(cap, out[ln["id"]])))
Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1))
