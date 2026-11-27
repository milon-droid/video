#!/usr/bin/env python3
"""Kokoro: быстрый синтез готовыми голосами (без клона). Запуск: ~/.venvs/kokoro/bin/python tools/vo-kokoro.py lines.json outdir
JSON: {"roles": {"sam": {"voice": "dima"|"am_puck"|..., "lang": "ru"|"en", "speed": 1.05}}, "lines": [{"id","role","text"}]}
ru — HF zaakirio/kokoro-ru (голоса dima, sveta, masha; веса OpenRAIL), ударения RUAccent (сверять!), en — hexgrad/Kokoro-82M (54 голоса).
Установка: bash tools/setup-voice.sh kokoro"""
import sys, os, json, shutil, tempfile, numpy as np, soundfile as sf, torch
spec, out = json.load(open(sys.argv[1])), sys.argv[2]; os.makedirs(out, exist_ok=True)
RU = os.path.expanduser('~/models/kokoro-ru')
ru = en = None
for ln in spec['lines']:
    r = spec['roles'][ln['role']]; v = r.get('voice', 'dima'); sp = ln.get('speed', r.get('speed', 1.05))
    if r.get('lang', 'ru') == 'ru':
        if ru is None:
            d = tempfile.mkdtemp(); shutil.copy(RU + '/ru_g2p.py', d); sys.path.insert(0, d)
            from ru_g2p import RuG2P
            from kokoro import KModel
            g2p = RuG2P(espeak_data=RU + '/espeak-data', vocab_path=RU + '/kokoro-config.json'); ru = {}
        ck = 'kokoro-ru-v2-dima.pth' if v == 'dima' else 'kokoro-ru-v2-base.pth'
        if ck not in ru: ru[ck] = KModel(config=RU + '/kokoro-config.json', model=f'{RU}/{ck}').eval()
        pack = torch.load(f'{RU}/voices/{v}.pt', map_location='cpu', weights_only=False)
        ipa, _ = g2p.phonemize(ln['text']); print(ln['id'], g2p.accentuate(ln['text']))
        with torch.no_grad(): a = ru[ck](ipa, pack[len(ipa) - 1], sp, return_output=True).audio.numpy()
    else:
        if en is None:
            from kokoro import KPipeline
            en = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
        a = np.concatenate([x.audio.numpy() for x in en(ln['text'], voice=v, speed=sp)]); print(ln['id'], v)
    sf.write(f"{out}/{ln['id']}.wav", a, 24000)
