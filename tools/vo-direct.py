#!/usr/bin/env python3
"""Озвучка «с режиссурой» (Qwen3-TTS, локально): реплика = куски с эмоцией, акцентными словами и точными паузами.

    ~/.venvs/qwentts/bin/python tools/vo-direct.py script.json -o <папка> [--only a1,s1] [--vd 3] [--clone 3]

script.json: {"roles": {"bobik": {"voice": "описание голоса по-английски (VoiceDesign)", "ref": "bobik"}, ...},
              "lines": [{"id": "s1", "role": "bobik", "text": "субтитр", "parts": [
                  {"t": "Стоп. Я что, умер?!", "emo": "terrified, voice shaking", "acc": ["умер"], "pause": 0.35},
                  {"t": "А шав+уха?!", "emo": "desperate hysterical scream", "acc": ["шавуха"]}]}]}
  t — текст куска (ударение «+» как в vo-qwen.py), emo — эмоция по-английски, acc — слова с акцентом, pause — пауза после куска (с), maxpause — предел пауз внутри куска.
  Тембр одного персонажа — только --clone (--vd 0): дубли VoiceDesign звучат разными людьми.
  Реплика без parts = один кусок из "say"/"text" и "emo".
Дубли каждого куска: --vd из VoiceDesign (описание голоса + эмоция; эмоции слушается лучше) и --clone из клона голоса роли
(assets/voices/qwen-ref/<ref>.wav, русская модель с ударениями; эмоция подаётся той же инструкцией).
Отбор: ударения по звуку (meter2) без ошибок, текст по Whisper ≥ 0,8, тембр (x-vector) не дальше 0,08 от лучшего из дублей
и не ниже --spk-min к образцу роли → из них самый выразительный: размах тона + акцентные слова громче и выше фразы.
Потом: края тишины срезаются, паузы внутри куска ≤ --pause, акцентные слова +--acc-db дБ, куски склеиваются с паузами.
Отчёт по дублям — <папка>/report.txt. Модели грузятся по очереди (обе сразу не влезают в 15 ГБ).
"""
import argparse, json, os, re, subprocess, sys, difflib, importlib.util
from pathlib import Path
import numpy as np, soundfile as sf, torch
ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("-o", "--out", required=True); ap.add_argument("--only")
ap.add_argument("--vd", type=int, default=3); ap.add_argument("--clone", type=int, default=3)
ap.add_argument("--pause", type=float, default=0.45); ap.add_argument("--acc-db", type=float, default=2.0); ap.add_argument("--spk-min", type=float, default=0.55)
a = ap.parse_args()
cfg = json.loads(Path(a.script).read_text(encoding="utf-8")); roles = cfg["roles"]
lines = [l for l in cfg["lines"] if not a.only or l["id"] in a.only.split(",")]
out = Path(a.out); out.mkdir(parents=True, exist_ok=True); tmp = out / "_cands"; tmp.mkdir(exist_ok=True)
# разметка ударений — из vo-qwen.py (словарь Vosk + «+»)
src = (ROOT / "tools/vo-qwen.py").read_text(encoding="utf-8"); ns = {"__file__": str(ROOT / "tools/vo-qwen.py")}
exec(src[:src.index("if a.check:")].replace("a = ap.parse_args()", "a = ap.parse_args([sys.argv[1]])"), ns); mark = ns["mark"]
torch.set_num_threads(os.cpu_count() or 4)
from qwen_tts import Qwen3TTSModel
parts = []  # (line_id, k, part, role)
for l in lines:
    ps = l.get("parts") or [{"t": l.get("say", l["text"]), "emo": l.get("emo", ""), "acc": l.get("acc", [])}]
    for k, p in enumerate(ps): parts.append((l["id"], k, p, l["role"]))
plain = lambda t: t.replace("+", "")
def gen_clone(m, text, instruct, items):
    """клон голоса + инструкция (модель её видит тем же входом, что VoiceDesign)"""
    vcp = m._prompt_items_to_voice_clone_prompt(items)
    ids = m._tokenize_texts([m._build_assistant_text(text)]); ref_ids = [m._tokenize_texts([m._build_ref_text(items[0].ref_text)])[0]]
    ins = [m._tokenize_texts([m._build_instruct_text(instruct)])[0]] if instruct else None
    codes, _ = m.model.generate(input_ids=ids, ref_ids=ref_ids, voice_clone_prompt=vcp, instruct_ids=ins, languages=["Russian"], non_streaming_mode=False, **m._merge_generate_kwargs())
    rc = vcp["ref_code"][0]; c = torch.cat([rc, codes[0]], 0)
    w, fs = m.model.speech_tokenizer.decode([{"audio_codes": c}]); w = w[0]; cut = int(rc.shape[0] / c.shape[0] * w.shape[0]); return w[cut:], fs
# 1) VoiceDesign
if a.vd:
    vd = Qwen3TTSModel.from_pretrained(os.path.expanduser("~/models/vd"), device_map="cpu", dtype=torch.float32)
    for lid, k, p, r in parts:
        ins = (roles[r]["voice"] + " Emotion and delivery: " + p.get("emo", "")).strip()
        for j in range(a.vd):
            f = tmp / f"{lid}_{k}_vd{j}.wav"
            if f.exists(): continue
            w, sr = vd.generate_voice_design(text=plain(p["t"]), language="Russian", instruct=ins, do_sample=True, temperature=.9); sf.write(f, w[0], sr)
        print("vd", lid, k, flush=True)
    del vd
# 2) клон (русская модель с ударениями) + x-vector образцов
rus = Qwen3TTSModel.from_pretrained(os.path.expanduser("~/models/rus"), device_map="cpu", dtype=torch.float32)
REF = ROOT / "assets/voices/qwen-ref"; items, refvec = {}, {}
def xvec(path):
    it = rus.create_voice_clone_prompt(ref_audio=str(path), ref_text="", x_vector_only_mode=True)[0]
    v = it.ref_spk_embedding.flatten().float().numpy(); return v / np.linalg.norm(v)
for r in {p[3] for p in parts}:
    nm = roles[r].get("ref", r)
    items[r] = rus.create_voice_clone_prompt(ref_audio=str(REF / f"{nm}.wav"), ref_text=(REF / f"{nm}.txt").read_text(encoding="utf-8"))
    refvec[r] = xvec(REF / f"{nm}.wav")
for lid, k, p, r in parts:
    for j in range(a.clone):
        f = tmp / f"{lid}_{k}_cl{j}.wav"
        if f.exists(): continue
        w, sr = gen_clone(rus, mark(p["t"]), p.get("emo", ""), items[r]); sf.write(f, w, sr)
    for j in range(p.get("plain_takes", 0)):  # дубли без инструкции: эмоция иногда сбивает ударение
        f = tmp / f"{lid}_{k}_pl{j}.wav"
        if not f.exists(): w, sr = gen_clone(rus, mark(p["t"]), "", items[r]); sf.write(f, w, sr)
    print("clone", lid, k, flush=True)
# 3) оценка дублей
import librosa
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.expanduser("~/models/rus/meter")); os.environ.setdefault("METER2_HEAD", os.path.expanduser("~/models/rus/meter/head.pt"))
from meter2 import judge, marked_index
wm = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^а-яa-z0-9]", "", s.lower().replace("ё", "е"))
rep = open(out / "report.txt", "a", encoding="utf-8")
def clean(f, mp=None):
    """края тишины и длинные паузы внутри — ffmpeg, 48 кГц (mp — свой предел паузы куска, "maxpause")"""
    g = f.with_suffix(".c.wav"); mp = a.pause if mp is None else mp
    af = ("highpass=f=70,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2:attack=8:release=120,"
          f"silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.06:stop_periods=-1:stop_duration={mp + .1}:stop_threshold=-50dB:stop_silence={mp},"
          "areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.08,areverse,aresample=48000")  # мягкий порог и запас: тихие начала/концы слов не срезаются
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(f), "-af", af, str(g)], check=True); return g
def evaluate(f, p, r):
    g = clean(f, p.get("maxpause")); y48, _ = sf.read(g); y = librosa.resample(np.asarray(y48, np.float32), orig_sr=48000, target_sr=16000)
    if len(y) < 1600: return None
    marked = mark(p["t"]); bad, badw, good, foc = 0.0, [], [], 0.0
    forced = {plain(w).lower() for w in re.findall(r"[А-Яа-яЁё+]+", p["t"]) if "+" in w}  # ударение задано вручную — ошибка тут вдвое хуже
    for w, rr in zip(re.findall(r"[А-Яа-яЁё́+]+(?:-[А-Яа-яЁё́+]+)*", marked), judge(y, 16000, marked)):
        e = marked_index(w)
        if e is None or rr["best"] is None or len(rr["vowel_scores"] or []) < 2: continue
        isf = w.replace("́", "").lower() in forced
        if rr["best"] != e: bad += rr["margin"] * (2 if isf else 1); badw.append(w); foc -= rr["margin"] if isf else 0
        else: good.append(rr["margin"]); foc += rr["margin"] if isf else 0
    good = float(np.mean(good)) if good else 0.0
    raw, rs = sf.read(f); raw = np.asarray(raw, float).ravel(); tail = raw[-int(rs * .04):]  # модель оборвала последний слог: в конце файла ещё громко
    cut = 20 * np.log10((np.sqrt((tail ** 2).mean()) + 1e-9) / (np.abs(raw).max() + 1e-9)) > -30
    words = [w for s in wm.transcribe(y, language="ru", word_timestamps=True)[0] for w in s.words]
    txt = " ".join(w.word for w in words); sim = difflib.SequenceMatcher(None, norm(txt), norm(plain(p["t"]))).ratio()
    if re.search(r"\d", txt):  # Whisper пишет числа цифрами: сравнить без чисел с обеих сторон
        NUM = r"\b(ноль|один|одна|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|ста)\b"
        sim = difflib.SequenceMatcher(None, re.sub(r"\d", "", norm(txt)), norm(re.sub(NUM, "", plain(p["t"]).lower()))).ratio()
    spk = float(np.dot(xvec(g), refvec[r]))
    f0 = librosa.pyin(y, fmin=60, fmax=500, sr=16000, frame_length=1024, hop_length=160)[0]; v = f0[~np.isnan(f0)]
    rng = float(np.percentile(12 * np.log2(v), 95) - np.percentile(12 * np.log2(v), 5)) if len(v) > 10 else 0
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=160)[0]; med = np.median(v) if len(v) else 1; acc, spans = 0.0, []
    for aw in p.get("acc", []):
        hit = [w for w in words if norm(w.word)[:4] == norm(aw)[:4]]
        if not hit: acc -= 2; continue
        s0, s1 = hit[0].start, hit[0].end; spans.append((s0, s1)); fr = slice(int(s0 * 100), int(s1 * 100) + 1)
        de = 20 * np.log10((rms[fr].mean() + 1e-9) / (rms.mean() + 1e-9)); wv = f0[fr]; wv = wv[~np.isnan(wv)]
        dp = 12 * np.log2(np.percentile(wv, 85) / med) if len(wv) > 1 else 0; acc += min(de, 6) + min(dp, 6)
    if p.get("acc"): acc /= len(p["acc"])
    return dict(f=g, bad=bad, badw=badw, good=good, cut=cut, foc=foc, sim=sim, spk=spk, rng=rng, acc=acc, spans=spans, dur=len(y) / 16000, txt=txt)
res = {}
for lid, k, p, r in parts:
    cands = [c for c in (evaluate(f, p, r) for f in sorted(tmp.glob(f"{lid}_{k}_*.wav")) if not f.name.endswith(".c.wav")) if c]
    for j in range(6):  # все дубли пустые/обрывки — досинтезировать
        if cands: break
        f = tmp / f"{lid}_{k}_re{j}.wav"; w, sr = gen_clone(rus, mark(p["t"]), p.get("emo", ""), items[r]); sf.write(f, w, sr)
        c = evaluate(f, p, r); cands += [c] if c else []
    if not cands: print("НЕ ВЫШЛО", lid, k, flush=True); continue
    top = max(c["spk"] for c in cands)
    ok = [c for c in cands if c["bad"] < .3 and c["sim"] >= .8 and c["spk"] >= max(a.spk_min, top - .08)] or \
         [c for c in cands if c["sim"] >= .7 and c["spk"] >= top - .12] or cands
    best = max(ok, key=lambda c: c["rng"] * .3 + c["acc"] - 5 * c["bad"] + 20 * (c["sim"] - 1) + 3 * c["good"] - 6 * c["cut"] + p.get("focus_w", 0) * c["foc"])
    for c in cands:
        rep.write(f"{lid}.{k} {'★' if c is best else ' '} {c['f'].name:18s} удар:{c['bad']:.2f}/{c['good']:.2f}/{c['foc']:+.2f}{' ОБРЫВ' if c['cut'] else ''}{'(' + ','.join(c['badw']) + ')' if c['badw'] else ''} "
                  f"текст:{c['sim']:.2f} тембр:{c['spk']:.2f} размах:{c['rng']:.1f} акцент:{c['acc']:+.1f} {c['dur']:.1f}с | {c['txt']}\n")
    res[(lid, k)] = best; print(lid, k, "→", best["f"].name, f"акцент {best['acc']:+.1f} размах {best['rng']:.1f} тембр {best['spk']:.2f}", flush=True)
rep.close()
# 4) акценты громче, склейка кусков с паузами
durs = json.loads((out / "durations.json").read_text()) if (out / "durations.json").exists() else {}
for l in lines:
    ps = l.get("parts") or [{"pause": 0}]; segs = []
    for k, p in enumerate(ps):
        b = res.get((l["id"], k))
        if b is None: break
        af = ",".join(f"volume={a.acc_db}dB:enable='between(t,{s0:.2f},{s1 + .05:.2f})'" for s0, s1 in b["spans"]) or "anull"
        g = tmp / f"{l['id']}_{k}.acc.wav"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(b["f"]), "-af", af, "-ar", "48000", "-ac", "1", str(g)], check=True)
        segs.append(g)
        if k < len(ps) - 1:
            s = tmp / f"{l['id']}_{k}.sil.wav"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=mono", "-t", str(p.get("pause", .3)), str(s)], check=True); segs.append(s)
    if not segs or res.get((l["id"], len(ps) - 1)) is None: print("ПРОПУСК", l["id"], "— не все куски вышли", flush=True); continue
    lst = tmp / f"{l['id']}.txt"; lst.write_text("".join(f"file '{s.resolve()}'\n" for s in segs))
    dst = out / f"{l['id']}.wav"
    pt = roles[l["role"]].get("pitch", 1.0)  # низкий злодей: тон и тембр ниже (как "pitch" в vo-qwen.py)
    pf = f"asetrate={int(48000 * pt)},aresample=48000,atempo={1 / pt:.4f}," if pt != 1.0 else ""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-af", pf + "apad=pad_dur=0.06", "-ar", "48000", "-ac", "1", str(dst)], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dst)], capture_output=True, text=True).stdout)
    durs[l["id"]] = round(d, 3); print("готово", l["id"], f"{d:.2f} с")
(out / "durations.json").write_text(json.dumps(durs, ensure_ascii=False, indent=1))
