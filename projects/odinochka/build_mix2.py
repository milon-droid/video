# Сведение серии 2: голос (vo/ep2/*.wav по timeline) + звуки (sfx.py) + музыка → remotion/public/ep2-mix.wav
import json, re, subprocess, os
R = 'remotion/src/ep2/timeline.ts'; src = open(R).read()
dur = json.load(open('remotion/public/vo2/durations.json'))
raw = re.findall(r"\{ id: '(\w+)', d: ([\d.]+)((?:, vo: \[(?:\['w\w+', [\d.]+\],? ?)*\])?) \}", src)
shots = []; a = 0
for sid, d, vo in raw:
    vos0 = re.findall(r"\['(w\w+)', ([\d.]+)\]", vo or ''); vos = []; prev = -1
    for v, at in vos0:
        at = max(float(at), prev + .25); prev = at + dur.get(v, 2); vos.append((v, at))
    need = max([float(at) + dur.get(v, 2) + .35 for v, at in vos] + [0])
    dd = max(float(d), need); shots.append((sid, a, dd, vos)); a += dd
TOTAL = a; st = {s: b for s, b, _, _ in shots}
print('план', len(shots), 'всего', round(TOTAL, 2))
L = lambda id, g=.8, **k: dict(type='lib', id=id, gain=g, **k)
S = lambda ty, g=.6, **k: dict(type=ty, gain=g, **k)
GORE = lambda n=1: L(f'oc-GORESqsh_BloodSquishSlimy_OS_0{n}', .9)
BONE = lambda n=1: L(f'oc-GOREBone_BonesBreaking_OS_0{n}', .8)
C = {
 'a0': [(0, S('drone', .35, dur=3)), (0, S('hum', .3, dur=1.3)), (.6, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .4)), (1.15, L('cinematic-drum-massive', 1.0)), (1.2, GORE(1)), (1.2, L('oc-CREAHmn_GiantDeathScream_OS_01', .5)), (1.25, BONE(1))],
 'a2': [(.3, L('whoosh-medium-hard', .6, rate=.8)), (.55, L('cinematic-drum-massive', 1.0)), (.55, L('impact-deep-hard', .6)), (.6, S('charge', .3, dur=1.0))],
 'b0': [(0, S('hum', .35, dur=4.2)), (0, S('drone', .25, dur=4.2)), (1.0, S('step', .4)), (1.9, S('step', .4))],
 'b1': [(0, S('hum', .3, dur=2.6)), (0, L('oc-VOXWhsp_WhispersCreepy_OS_01', .3))],
 'b2': [(0, S('crackle', .5, dur=1.8)), (1.6, S('hiss', .3, dur=1.0)), (0, S('hum', .3, dur=3.4))],
 'b3': [(0, S('hum', .3, dur=4.4)), (.3, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .25))],
 'b6': [(0, S('hum', .4, dur=3.2)), (0, L('bsb-heartbeat-slow', .6))],
 'e1': [(0, S('hum', .45, dur=3.2)), (0, L('bsb-heartbeat-fast', .7))] + [(.3 + i * .45, S('step', .45)) for i in range(6)],
 'e2': [(0, S('hum', .5, dur=1.2)), (.5, S('charge', .5, dur=.7)), (1.18, L('cinematic-drum-massive', 1.0)), (1.2, GORE(2)), (1.2, BONE(2)), (1.2, L('oc-CREAHmn_GiantDeathScream_OS_01', .6, rate=1.3)), (1.6, S('thud', .9)), (1.3, L('faller-1s-strong', .5))],
 'e3': [(.2, S('charge', .5, dur=.6)), (.88, L('impact-heavy-hard', .9)), (.9, GORE(3)), (.9, BONE(3)), (1.3, S('thud', .8)), (1.0, S('breath_in', .6))],
 'e4': [(0, L('fs-run', .0)), (.1, S('step', .5)), (.35, S('step', .5)), (.7, L('whoosh-fast-hard', .7)), (.72, L('oc-FGHTImpt_PunchRegular_OS_01', .5))],
 'c6': [(.7, L('whoosh-fast-medium', .6)), (1.0, L('cinematic-metal-big', .7)), (2.4, S('breath_in', .5)), (2.6, S('hum', .3, dur=1.0))],
 'c7': [(0, S('hum', .7, dur=3.2)), (0, L('bsb-heartbeat-fast', .8)), (.4, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .4))],
 'c8': [(0, L('whoosh-medium-hard', .8)), (.45, L('oc-GLASBrk_WindowPaneSmallBreak_OS_01', 1.0)), (.45, L('oc-GLASBrk_GlassBottleBreak_OS_01', .8)), (.45, L('cinematic-drum-massive', 1.0)), (.5, L('oc-CREAHmn_GiantDeathScream_OS_01', .6, rate=.7)), (.9, S('tinkle', .5, dur=1.5))],
 'f1': [(0, S('hum50', .2, dur=5.4)), (0, L('bsb-heartbeat-slow', .4))],
 'f2': [(.3, L('impact-deep-hard', .9)), (.3, S('rattle', .5, dur=1.5)), (.5, L('oc-TRNSbwy_SubwayPassbyEnter_OS_01', .7)), (.9, S('beep', .2))],
 'g1': [(0, L('oc-TRNDoor_TrainDoorsOpen_OS_01', .7)), (0, S('drone', .4, dur=3.4))] + [(x, L('oc-METLImpt_HammerAnvil_OS_01', .35 + i * .08)) for i, x in enumerate([.6, 1.2, 1.8, 2.3, 2.7, 3.0])],
 'g2': [(.3, L('whoosh-medium-hard', .8, rate=.6)), (.55, L('cinematic-drum-massive', 1.0)), (.55, L('impact-deep-hard', 1.0)), (.6, S('debris', .6, dur=1.0)), (.9, L('oc-CREAHmn_GiantEffort_OS_01', 1.0, rate=.7)), (1.0, S('roar', .4, dur=1.4, pitch=.5))],
 'g6': [(0, L('oc-CREAHmn_GiantHurt_OS_01', 1.0, rate=.6)), (0, S('roar', .5, dur=2.0, pitch=.4)), (0, L('cinematic-metal-massive', .6))],
 'g3': [(.5, S('charge', .4, dur=.4)), (.7, L('whoosh-fast-hard', .8)), (.7, S('crackle', .7, dur=1.0)), (1.1, L('impact-heavy-hard', 1.0)), (1.1, S('boom', .7)), (1.6, S('zap', .9, dur=.5)), (1.62, L('cinematic-drum-big', .7)), (2.4, L('oc-CREAHmn_GiantEffort_OS_01', .8, rate=.8))],
 'g4': [(.1, L('whoosh-medium-hard', .9, rate=.6)), (.7, L('cinematic-metal-massive', 1.0)), (.7, S('debris', .7, dur=1.0)), (.72, GORE(4)), (.75, L('oc-CREAHmn_GiantHurt_OS_02', .0))],
 'g5': [(.1, L('oc-TRNDoor_TrainDoorsClose_OS_01', .9)), (1.3, L('cinematic-metal-big', .9)), (1.3, GORE(1)), (1.3, BONE(1)), (1.35, L('oc-CREAHmn_GiantHurt_OS_03', 1.0, rate=.7)), (1.6, L('oc-TRNSbwy_SubwayPassbyEnter_OS_01', .7)), (2.4, L('cinematic-drum-massive', .9)), (2.4, L('oc-CREAHmn_GiantDeathScream_OS_01', .6, rate=.8))],
 'h1': [(0, S('rattle', .5, dur=4.6)), (0, S('engine', .4, dur=4.6)), (.4, S('glitch', .4))],
 'h2': [(0, S('wind', .6, dur=5.0)), (0, L('bass-rumble-long', .8)), (1.0, L('oc-TRNElec_TrainPassby_OS_01', .7)), (2.4, L('faller-2s-soft', .8))],
 'h3': [(0, S('wind', .5, dur=1.4)), (1.3, L('cinematic-drum-massive', 1.0)), (1.3, S('charge', .5, dur=1.0)), (1.8, S('tinkle', .3, dur=1.5))],
}
cues = []
sd = {x[0]: x[2] for x in shots}
for sid, cs in C.items():
    if sid not in st: continue
    for t, c in cs:
        if c.get('gain', 1) <= 0: continue
        c = {**c, 't': round(st[sid] + t, 3)}
        if c.get('id') in ('bsb-bsb-3040', 'bsb-bsb-3032', 'bsb-bsb-3039', 'bsb-bsb-3043') and 'dur' not in c: c['dur'] = round(sd[sid] - t + .15, 2)  # атмосфера — ровно на план
        cues.append(c)
# финальный удар на титр
pass
json.dump(sorted(cues, key=lambda c: c['t']), open('sfx-ep2.json', 'w'), ensure_ascii=False)
A = 'remotion/public/audio'; os.makedirs(A, exist_ok=True)
# пространство: метро — длинное эхо, вагон — короткое тесное, остальное — сухо
STATION = {'g1', 'g2', 'g6', 'g3', 'g4'}
def zone_at(tt):
    for sid, b, dd, _ in shots:
        if b <= tt < b + dd: return 'station' if sid in STATION else 'train' if sid[0] in 'abecfh' and sid not in ('a2', 'h2', 'h3') else 'dry'
    return 'dry'
REV = {'station': 'aecho=0.8:0.75:140|310|520:0.42|0.28|0.16', 'train': 'aecho=0.7:0.6:18|37:0.32|0.2,lowpass=f=9500', 'dry': 'anull'}
VOREV = {'station': ',aecho=0.8:0.6:140|300:0.28|0.16', 'train': ',aecho=0.7:0.5:20|40:0.22|0.13', 'dry': ''}
stems = []
for z in REV:
    zc = [c for c in cues if zone_at(c['t']) == z]
    json.dump(zc, open(f'/tmp/claude-0/ep2sfx-{z}.json', 'w'))
    subprocess.run(['python3', '../../tools/sfx.py', f'/tmp/claude-0/ep2sfx-{z}.json', '-o', f'/tmp/claude-0/ep2sfx-{z}.wav', '--duration', str(TOTAL)], check=True, capture_output=True)
    stems.append(z)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *sum([['-i', f'/tmp/claude-0/ep2sfx-{z}.wav'] for z in stems], []), '-filter_complex',
    ';'.join(f'[{i}]{REV[z]}[z{i}]' for i, z in enumerate(stems)) + ';' + ''.join(f'[z{i}]' for i in range(len(stems))) + f'amix=inputs={len(stems)}:normalize=0', f'{A}/sfx2.wav'], check=True)
# голос: дорожка из реплик на своих местах (диктор — с эхом станции)
vo_in, vo_f = [], []
for sid, b, dd, vos in shots:
    for v, at in vos:
        f = f'vo/ep2/{v}.wav'
        if not os.path.exists(f): continue
        i = len(vo_in) // 2; vo_in += ['-i', f]; ms = int((b + float(at)) * 1000)
        role = [l['role'] for l in json.load(open('vo/ep2.json'))['lines'] if l['id'] == v][0]
        fx = {'announcer': ',aecho=0.8:0.6:120|260:0.35|0.2,highpass=f=250,lowpass=f=6000',
              'collector': ',asetrate=48000*0.88,aresample=48000,atempo=1.136,lowshelf=f=160:g=4,acrusher=bits=12:mix=0.15',
              'father': ',highpass=f=120,aecho=0.6:0.5:60:0.2,asetrate=48000*0.97,aresample=48000'}.get(role, '')
        fx += VOREV[zone_at(b + float(at) + .1)]
        if role == 'kirill':  # ровный тембр: подтянуть высокие под средний центроид Кирилла
            import numpy as np
            xx = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
            S_ = np.abs(np.fft.rfft(xx * np.hanning(len(xx)))); fr = np.fft.rfftfreq(len(xx), 1 / 16000); cen = (S_ * fr).sum() / S_.sum()
            g = max(-4, min(6, (2300 - cen) / 120)); fx += f',highshelf=f=2200:g={g:.1f}'
        fx += ',highpass=f=80,acompressor=threshold=0.08:ratio=3:attack=5:release=120:makeup=2,equalizer=f=3000:t=q:w=1:g=3'
        vo_f.append(f'[{i}]aresample=48000,aformat=channel_layouts=mono{fx},adelay={ms}|{ms}[v{i}]')
n = len(vo_f)
fc = ';'.join(vo_f) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={TOTAL}[vo]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *vo_in, '-filter_complex', fc, '-map', '[vo]', '-ac', '2', '-ar', '48000', f'{A}/vo2.wav'], check=True)
# музыка по сценам: хук — эпик, дом — пианино, поезд — тёмный эмбиент + нарастание, финал — трагический эпик
lib = f'{A}/lib'
END = TOTAL
M = [  # файл, с какой секунды трека, начало в ролике, длина, громкость, fade in, fade out
 ('horror-drone-magmi.mp3', 0, 0, st['a2'] + .4, .6, .1, .3),
 ('epic-loop-fusionwolf.mp3', 0, st['a2'] + .5, st['b0'] - st['a2'] - .4, .7, .05, .4),
 ('strings-choir-sad-szegvari.mp3', 4, st['b0'], st['e1'] - st['b0'], .65, 1.0, .6),
 ('horror-intense-magmi.mp3', 0, st['e1'], st['c6'] - st['e1'] + .3, .6, .3, .4),
 ('ambient-horror-track-01.ogg', 0, st['c6'], st['f1'] - st['c6'] - .6, .6, .5, .1),
 ('strings-choir-slow-szegvari.mp3', 6, st['f1'], st['g1'] - st['f1'], .55, 1.0, .5),
 ('eyes-in-the-shadows.ogg', 0, st['g1'], st['g2'] - st['g1'] + .5, .6, .5, .2),
 ('epic-loop-fusionwolf.mp3', 40, st['g2'] + .5, st['h1'] - st['g2'] - .5, .9, .05, .6),
 ('time-of-the-apocalypse.ogg', 0, st['h1'], END - st['h1'], .8, 1.0, 1.5),
]
ins, fs = [], []
for i, (f, off, at, ln, g, fi, fo) in enumerate(M):
    ins += ['-ss', str(off), '-t', str(ln), '-i', f'{lib}/{f}']; ms = int(at * 1000)
    fs.append(f'[{i}]aresample=48000,aformat=channel_layouts=stereo,volume={g},afade=t=in:d={fi},afade=t=out:st={max(0, ln - fo)}:d={fo},adelay={ms}|{ms}[m{i}]')
fc = ';'.join(fs) + ';' + ''.join(f'[m{i}]' for i in range(len(M))) + f'amix=inputs={len(M)}:normalize=0,apad=whole_dur={TOTAL}[mu]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[mu]', '-ar', '48000', f'{A}/music2.wav'], check=True)
# сведение: музыка приглушается под голос (sidechain), голос громче фона
fc = ('[2]asplit=3[vo1][vo2][vo3];[0]volume=0.35,equalizer=f=2500:t=q:w=1.2:g=-4[mu];[mu][vo1]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=500[mud];'
      '[1]volume=0.8[sf0];[sf0][vo3]sidechaincompress=threshold=0.03:ratio=4:attack=10:release=300[sf];'
      f'[vo2]volume=2.2[vv];[mud][sf][vv]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=0:{TOTAL}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{A}/music2.wav', '-i', f'{A}/sfx2.wav', '-i', f'{A}/vo2.wav', '-filter_complex', fc, '-map', '[out]', '-ar', '48000', 'remotion/public/ep2-mix.wav'], check=True)
print('микс готов', round(TOTAL, 2), 'с')
