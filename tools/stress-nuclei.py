#!/usr/bin/env python3
"""Вторая, независимая проверка ударения по звуку: ударный гласный в русском — самый длинный и громкий (часто и выше).
Ищет в слове ядра слогов (пики громкости в звонких кадрах), сравнивает длительность, громкость и тон ядер.

    ~/.venvs/qwentts/bin/python tools/stress-nuclei.py file.wav "слово" [ожидаемый_номер_гласной_с_1]

Печатает ядра и номер ударного гласного по звуку. Как модуль: stress_by_nuclei(y16k, s0, s1, n_vowels) -> (индекс|None, уверенность).
Используется в tools/vo-direct.py вместе с детектором meter2: дубль годен, только если оба согласны.
"""
import sys, numpy as np, librosa
VOW = "аеёиоуыэюя"
def stress_by_nuclei(y, s0, s1, nv, sr=16000):
    if nv < 2: return None, 0.0
    a, b = max(0, int((s0 - .03) * sr)), min(len(y), int((s1 + .05) * sr)); x = y[a:b]
    if len(x) < sr * .12: return None, 0.0
    hop = 160; rms = librosa.feature.rms(y=x, frame_length=400, hop_length=hop)[0]; db = 20 * np.log10(rms + 1e-6)
    db = np.convolve(db, np.ones(3) / 3, mode="same")
    f0, vf, _ = librosa.pyin(x, fmin=60, fmax=500, sr=sr, frame_length=1024, hop_length=hop)
    n = min(len(db), len(vf)); db, vf, f0 = db[:n], vf[:n], f0[:n]
    floor = np.percentile(db, 20); peaks = []
    for i in range(1, n - 1):
        if db[i] >= db[i - 1] and db[i] >= db[i + 1] and db[i] > floor + 6 and (vf[max(0, i - 1):i + 2].any()):
            peaks.append(i)
    # слить близкие пики (< 70 мс), оставить самые выраженные
    merged = []
    for i in peaks:
        if merged and i - merged[-1] < 7:
            if db[i] > db[merged[-1]]: merged[-1] = i
        else: merged.append(i)
    if len(merged) < nv:
        return None, 0.0
    # вершины с наибольшей «выступаемостью» над соседними провалами
    def prom(i):
        l = db[max(0, i - 12):i].min() if i > 0 else db[i]; r = db[i + 1:i + 13].min() if i + 1 < n else db[i]
        return db[i] - max(l, r)
    sel = sorted(sorted(merged, key=prom, reverse=True)[:nv])
    feats = []
    for i in sel:
        thr = db[i] - 4; l = i; r = i
        while l > 0 and db[l - 1] > thr and vf[l - 1]: l -= 1
        while r < n - 1 and db[r + 1] > thr and vf[r + 1]: r += 1
        p = f0[l:r + 1]; p = p[~np.isnan(p)]
        feats.append(((r - l + 1) * hop / sr, db[i], np.median(p) if len(p) else np.nan))
    d = np.array([f[0] for f in feats]); e = np.array([f[1] for f in feats]); p = np.array([f[2] for f in feats])
    z = lambda v: (v - np.nanmean(v)) / (np.nanstd(v) + 1e-6)
    pz = z(12 * np.log2(np.where(np.isnan(p), np.nanmean(p), p))) if np.isfinite(p).any() else np.zeros(nv)
    score = z(d) + z(e) + .5 * pz; o = np.argsort(score)[::-1]
    return int(o[0]), float(score[o[0]] - score[o[1]])
if __name__ == "__main__":
    from faster_whisper import WhisperModel
    f, word = sys.argv[1], sys.argv[2].lower(); exp = int(sys.argv[3]) - 1 if len(sys.argv) > 3 else None
    y, _ = librosa.load(f, sr=16000)
    ws = [w for s in WhisperModel("small", device="cpu", compute_type="int8").transcribe(y, language="ru", word_timestamps=True)[0] for w in s.words]
    hit = [w for w in ws if w.word.strip(" ,.!?").lower().replace("ё", "е")[:4] == word.replace("ё", "е")[:4]]
    if not hit: print("слово не найдено:", " ".join(w.word for w in ws)); sys.exit(1)
    nv = sum(c in VOW for c in word); k, m = stress_by_nuclei(y, hit[0].start, hit[0].end, nv)
    print(f"{f}: «{word}» ударный гласный по звуку: {None if k is None else k + 1} (уверенность {m:.2f})" + ("" if exp is None or k is None else (" — ОК" if k == exp else " — НЕ ТАМ")))
