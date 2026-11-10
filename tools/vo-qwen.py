#!/usr/bin/env python3
"""Озвучка Qwen3-TTS (Apache 2.0, локально на CPU): голос персонажа создаётся по описанию (VoiceDesign),
реплики читает русская модель с точными ударениями (siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf) — живее Vosk и Piper.

    ~/.venvs/qwentts/bin/python tools/vo-qwen.py lines.json -o projects/<имя>/assets/vo/ep1 [--only a1,b1] [--check] [--lang English]
  English: hf download Qwen/Qwen3-TTS-12Hz-1.7B-Base --local-dir ~/models/base

lines.json: {"roles": {"narrator": {"instruct": "Deep warm male narrator...", "ref": "Фраза-образец голоса."}, ...},
             "lines": [{"id": "a1", "role": "narrator", "text": "Это Макс.", "fx": "radio|dead|whisper", "pitch": 1.0, "speed": 1.0}]}
Ударения: ставятся автоматически по словарю Vosk на каждое слово (модель обучена на полностью размеченном тексте);
свою — знаком «+» перед ударной гласной («д+онера»), он главнее словаря. --check печатает размеченный текст без синтеза.
Дубли (--cands 4): у вопросов берётся дубль с самым заметным подъёмом тона к «?», у роли с "low": true — с самым низким голосом
(особенно в начале фразы). Длинные паузы между фразами (модель любит драматичные 1–1,5 с) ужимаются до 0,3 с.
Скорость: ≈ 5–6 с счёта на 1 с речи (4 ядра). Установка (отдельное окружение, ≈ 1 ГБ + модели 9 ГБ):
  python3 -m venv ~/.venvs/qwentts && ~/.venvs/qwentts/bin/pip install "torch==2.11.0+cpu" "torchaudio==2.11.0+cpu" --index-url https://download.pytorch.org/whl/cpu
  ~/.venvs/qwentts/bin/pip install qwen-tts soundfile "huggingface_hub[cli]"
  ~/.venvs/qwentts/bin/hf download Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign --local-dir ~/models/vd
  ~/.venvs/qwentts/bin/hf download siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf --local-dir ~/models/rus --exclude "lora/*" "scripts/*" "meter/*" "eval/*"
"""
import argparse, json, re, subprocess, sys, os
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DIC_PATH = ROOT / "assets/voices/vosk-model-tts-ru-0.10-multi/dictionary"
REF_DIR = ROOT / "assets/voices/qwen-ref"
VOW = "аеёиоуыэюя"
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out"); ap.add_argument("--only"); ap.add_argument("--check", action="store_true")
ap.add_argument("--cands", type=int, default=1, help="дублей на реплику; лучший выбирается по замеру тона (вопрос — подъём к концу, король — низкий голос)")
ap.add_argument("--lang", default="Russian", help="English и др.: без разметки ударений, клон — базовой моделью --base")
ap.add_argument("--base", default=os.path.expanduser("~/models/base"))
ap.add_argument("--vd", default=os.path.expanduser("~/models/vd")); ap.add_argument("--rus", default=os.path.expanduser("~/models/rus"))
a = ap.parse_args()
cfg = json.loads(Path(a.lines).read_text(encoding="utf-8")); roles, lines = cfg["roles"], cfg["lines"]
if a.only: lines = [l for l in lines if l["id"] in a.only.split(",")]

dic, pr = {}, {}
with open(DIC_PATH, encoding="utf-8") as f:
    for row in f:
        it = row.split(maxsplit=2); p = float(it[1])
        if pr.get(it[0], 0) < p: dic[it[0]] = it[2].split(); pr[it[0]] = p
def stress_word(w):
    """слово → со знаком ударения U+0301 после ударной гласной"""
    if "+" in w: i = w.index("+"); return w[:i] + w[i + 1] + "́" + w[i + 2:]
    lw = w.lower()
    nv = [i for i, c in enumerate(lw) if c in VOW]
    if len(nv) < 2 or "ё" in lw: return w
    ph = dic.get(lw) or dic.get(lw.replace("ё", "е"))
    if not ph: return w
    vph = [x for x in ph if x[-1] in "01"]
    k = next((i for i, x in enumerate(vph) if x.endswith("1")), None)
    if k is None or k >= len(nv): return w
    i = nv[k]; return w[:i + 1] + "́" + w[i + 1:]
def mark(text):
    if a.lang != "Russian": return text
    return re.sub(r"[А-Яа-яЁё+]+(?:-[А-Яа-яЁё+]+)*", lambda m: "-".join(stress_word(p) for p in m.group(0).split("-")), text)
if a.check:
    for l in lines: print(l["id"], mark(l["text"]))
    sys.exit(0)

import numpy as np, soundfile as sf, torch
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(os.cpu_count() or 4)
REF_DIR.mkdir(parents=True, exist_ok=True)
need = sorted({l["role"] for l in lines if not (REF_DIR / f"{l['role']}.wav").exists()})
if need:  # голоса по описанию
    vd = Qwen3TTSModel.from_pretrained(a.vd, device_map="cpu", dtype=torch.float32)
    for r in need:
        w, sr = vd.generate_voice_design(text=roles[r]["ref"], language=a.lang, instruct=roles[r]["instruct"])
        sf.write(REF_DIR / f"{r}.wav", w[0], sr); (REF_DIR / f"{r}.txt").write_text(roles[r]["ref"], encoding="utf-8"); print("голос", r, round(len(w[0]) / sr, 1), "с")
    del vd
tts = Qwen3TTSModel.from_pretrained(a.rus if a.lang == "Russian" else a.base, device_map="cpu", dtype=torch.float32)
prompts = {}
def f0_track(y, sr):
    """высота тона по кадрам 40 мс (автокорреляция), 0 — нет голоса"""
    y = np.asarray(y, float); fr = int(sr * .04); out = []
    for i in range(0, len(y) - fr, fr // 2):
        x = y[i:i + fr]; x = x - x.mean()
        if np.sqrt((x ** 2).mean()) < .02: out.append(0); continue
        ac = np.correlate(x, x, "full")[fr - 1:]; lo, hi = int(sr / 400), int(sr / 60); k = lo + int(np.argmax(ac[lo:hi]))
        out.append(sr / k if ac[k] > .35 * ac[0] else 0)
    return np.array(out)
def st(a_, b_): return 12 * np.log2(max(a_, 1) / max(b_, 1))
def score(y, sr, ln, role):
    f = f0_track(y, sr); v = f[f > 0]
    if len(v) < 6: return -99, "нет голоса"
    sc, inf = 0.0, ""
    t = ln["text"]
    if "?" in t:  # подъём тона к вопросу: конец вопросительной части против её середины
        q = t.index("?") + 1; end = int(len(f) * min(1, q / len(t) * 1.04)); seg = f[:end]; vs = seg[seg > 0]
        if len(vs) >= 6:
            n = len(vs); rise = st(np.median(vs[int(n * .7):]), np.median(vs[int(n * .3):int(n * .7)]))
            sc += rise; inf += f"подъём {rise:+.1f} пт "
    if role.get("low"):  # король: низко везде и особенно в начале
        head = f[:int(len(f) * .3)]; hv = head[head > 0]
        hi = np.percentile(hv, 90) if len(hv) else np.median(v)
        sc -= .08 * hi + .04 * np.median(v); inf += f"начало {hi:.0f} Гц, медиана {np.median(v):.0f} Гц "
    return sc, inf
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
dfile = out / "durations.json"; durs = json.loads(dfile.read_text()) if dfile.exists() else {}
for ln in lines:
    r = ln["role"]
    if r not in prompts: prompts[r] = tts.create_voice_clone_prompt(ref_audio=str(REF_DIR / f"{r}.wav"), ref_text=(REF_DIR / f"{r}.txt").read_text(encoding="utf-8"))
    best, best_s, info = None, -1e9, ""
    for k in range(max(1, a.cands)):
        w, sr = tts.generate_voice_clone(text=mark(ln["text"]), language="Russian", voice_clone_prompt=prompts[r]) if a.lang == "Russian" else tts.generate_voice_clone(text=ln["text"], language=a.lang, voice_clone_prompt=prompts[r])
        sc, inf = score(w[0], sr, ln, roles[r])
        if sc > best_s: best, best_s, info = w[0], sc, inf
    raw, wav = out / f"{ln['id']}.raw.wav", out / f"{ln['id']}.wav"; sf.write(raw, best, sr)
    af = "highpass=f=70,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2:attack=8:release=120"
    p = ln.get("pitch", 1.0)
    if p != 1.0: af = f"aresample=48000,asetrate={int(48000 * p)},aresample=48000,atempo={1 / p:.4f}," + af
    sp = ln.get("speed", 1.0)
    if sp != 1.0: af += f",atempo={sp}"
    fx = ln.get("fx")
    if fx == "whisper": af += ",highpass=f=250,acompressor=threshold=-28dB:ratio=3,aecho=0.8:0.7:60|120:0.2|0.12"
    if fx == "dead": af += ",highpass=f=60,lowpass=f=6000,acrusher=bits=12:mix=0.12,aecho=0.8:0.85:70|150|260:0.35|0.25|0.15"
    if fx == "radio": af += ",highpass=f=300,lowpass=f=3600,acrusher=bits=10:mix=0.25"
    # тишина: в начале и конце — убрать, паузы внутри длиннее 0,4 с — сжать до 0,3 с
    af += (",silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.4:stop_threshold=-42dB:stop_silence=0.3"
           ",areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,apad=pad_dur=0.06,aresample=48000")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, str(wav)], check=True); raw.unlink()
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    durs[ln["id"]] = round(d, 3); dfile.write_text(json.dumps(durs, ensure_ascii=False, indent=1)); print(f"{ln['id']}: {d:.2f} с — {ln['text']}  {info}", flush=True)
