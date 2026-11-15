#!/usr/bin/env python3
"""Русская озвучка ESpeech-TTS-1 (Apache 2.0, F5-TTS, локально на CPU): клон голоса по образцу 6–12 с
живой речи + автоматические ударения RUAccent. Только русский. Английский — tools/vo-qwen.py.

    ~/.venvs/espeech/bin/python tools/vo-espeech.py lines.json -o projects/<имя>/assets/vo/ep1 [--only a1,b1] [--check] [--cands 3]

lines.json: {"roles": {"narrator": {"wav": "assets/voices/ru-ref/male_calm.wav"}},   # текст образца — рядом в .txt
             "lines": [{"id": "a1", "role": "narrator", "text": "Это Макс.", "say": "Это М+акс.", "speed": 1.0}]}
"say" — текст для синтеза (произношение), "text" — для субтитров. Ударения ставит RUAccent; своё — «+» перед ударной
гласной в нужном слове («д+онера»), остальные слова размечаются автоматически. --check печатает разметку без синтеза.
Числа писать словами. Образец голоса: чистая речь 6–12 с, точный текст в .txt (без него модель путает слова).
--cands N — N дублей с разными seed (a1_c1.wav …), лучший выбрать на слух; без --cands пишется a1.wav.
Скорость на 4 ядрах без видеокарты: ≈ 27 с счёта на 1 с речи (nfe 32), ≈ 13 с (--nfe 16, для черновика) — синтез в фоне.
--model pod — вариант «podcaster» (разговорнее), по умолчанию rlv2. --nfe 32 (меньше — быстрее и грубее).
Установка (≈ 2 ГБ + модели 2,7 ГБ каждая):
  python3 -m venv ~/.venvs/espeech && ~/.venvs/espeech/bin/pip install "torch==2.11.0+cpu" "torchaudio==2.11.0+cpu" --index-url https://download.pytorch.org/whl/cpu
  ~/.venvs/espeech/bin/pip install f5-tts ruaccent soundfile "huggingface_hub[cli]" && ~/.venvs/espeech/bin/pip install "transformers<5" "datasets<4"
  (transformers 5 ломает RUAccent: token_type_ids)
  ~/.venvs/espeech/bin/hf download ESpeech/ESpeech-TTS-1_RL-V2 --local-dir ~/models/espeech-rlv2
  ~/.venvs/espeech/bin/hf download ESpeech/ESpeech-TTS-1_podcaster --local-dir ~/models/espeech-pod
"""
import argparse, json, os, re, time
from pathlib import Path
import soundfile as sf, torch, torchaudio

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("-o", "--out"); ap.add_argument("--only")
ap.add_argument("--check", action="store_true"); ap.add_argument("--cands", type=int, default=0)
ap.add_argument("--model", default="rlv2", choices=["rlv2", "pod"]); ap.add_argument("--nfe", type=int, default=32)
ap.add_argument("--seed", type=int, default=1)
a = ap.parse_args()
cfg = json.loads(Path(a.lines).read_text(encoding="utf-8")); roles, lines = cfg["roles"], cfg["lines"]
if a.only: lines = [l for l in lines if l["id"] in a.only.split(",")]

from ruaccent import RUAccent
acc = RUAccent(); acc.load(omograph_model_size="turbo3.1", use_dictionary=True, tiny_mode=False)
def mark(t):
    """RUAccent на всё, но слова, где «+» поставлен вручную, остаются как написаны."""
    auto = acc.process_all(t.replace("+", ""))
    mine, got = t.split(" "), auto.split(" ")
    if len(mine) != len(got): return t if "+" in t else auto
    return " ".join(m if "+" in m else g for m, g in zip(mine, got))

def ref_of(role):
    r = roles[role]; wav = ROOT / r["wav"] if not os.path.isabs(r["wav"]) else Path(r["wav"])
    txt = r.get("text") or wav.with_suffix(".txt").read_text(encoding="utf-8").strip()
    return wav, txt

if a.check:
    for l in lines: print(l["id"], mark(l.get("say", l["text"])))
    raise SystemExit

def _load(p, *x, **k):  # torchaudio ≥ 2.9 хочет torchcodec — читаем через soundfile
    d, sr = sf.read(str(p), dtype="float32", always_2d=True); return torch.from_numpy(d.T.copy()), sr
torchaudio.load = _load
from f5_tts.infer.utils_infer import load_model, load_vocoder, infer_process, preprocess_ref_audio_text
from f5_tts.model import DiT
mdir = Path(os.path.expanduser(f"~/models/espeech-{a.model}"))
ckpt = next(mdir.glob("*.pt"), None) or next(mdir.glob("*.safetensors"))
model = load_model(DiT, dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4), str(ckpt),
                   vocab_file=str(mdir / "vocab.txt"), device="cpu")
voc = load_vocoder(device="cpu")
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
refs = {}
for l in lines:
    if l["role"] not in refs:
        w, t = ref_of(l["role"]); refs[l["role"]] = preprocess_ref_audio_text(str(w), mark(t))
    ra, rt = refs[l["role"]]; gt = mark(l.get("say", l["text"]))
    for c in range(max(a.cands, 1)):
        torch.manual_seed(a.seed + c); t0 = time.time()
        wave, sr, _ = infer_process(ra, rt, gt, model, voc, cross_fade_duration=0.15, nfe_step=a.nfe,
                                    speed=l.get("speed", 1.0), device="cpu")
        name = f"{l['id']}_c{c+1}.wav" if a.cands else f"{l['id']}.wav"
        sf.write(out / name, wave, sr)
        print(f"{name}  {len(wave)/sr:.1f} с за {time.time()-t0:.0f} с  | {gt}", flush=True)
