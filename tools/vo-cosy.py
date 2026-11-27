#!/usr/bin/env python3
"""CosyVoice 3 (Fun-CosyVoice3-0.5B-2512): копия голоса по образцу, рус/англ. Медленно на CPU (~5 с счёта на 1 с речи) — в фоне.
Запуск: ~/.venvs/cosy/bin/python tools/vo-cosy.py lines.json outdir
JSON: {"roles": {"sam": {"ref_wav": "assets/voices/qwen-ref/ten_sam_ru.wav", "ref": "<точный текст образца>",
        "instruct": "по желанию: Speak fast and sarcastic"}}, "lines": [{"id","role","text"}]}
Установка: bash tools/setup-voice.sh cosy"""
import sys, os, json
R = os.path.expanduser('~/models/cosyvoice'); sys.path += [R, R + '/third_party/Matcha-TTS']
import torchaudio
from cosyvoice.cli.cosyvoice import AutoModel
spec, out = json.load(open(sys.argv[1])), sys.argv[2]; os.makedirs(out, exist_ok=True)
m = AutoModel(model_dir=os.path.expanduser('~/models/cosyvoice3-0.5b'))
P = 'You are a helpful assistant.'
for ln in spec['lines']:
    r = spec['roles'][ln['role']]
    if r.get('instruct'):
        g = m.inference_instruct2(ln['text'], f"{P} {r['instruct']}<|endofprompt|>", r['ref_wav'], stream=False)
    else:
        g = m.inference_zero_shot(ln['text'], f"{P}<|endofprompt|>{r['ref']}", r['ref_wav'], stream=False)
    import torch; a = torch.cat([x['tts_speech'] for x in g], 1)
    torchaudio.save(f"{out}/{ln['id']}.wav", a, m.sample_rate); print(ln['id'], round(a.shape[1] / m.sample_rate, 2))
