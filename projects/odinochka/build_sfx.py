# Дорожка эффектов серии 1: cue по планам (время от начала плана) → sfx-ep1.json
import json, re
src = open('remotion/src/ep1/timeline.ts').read()
ids = re.findall(r"id: '(s\d+)', d: ([\d.]+)", src); st = {}; a = 0
for i, d in ids: st[i] = a; a += float(d)
TOTAL = a
L = lambda id, g=.8, **k: dict(type='lib', id=id, gain=g, **k)
S = lambda ty, g=.6, **k: dict(type=ty, gain=g, **k)
C = {
 's01': [(0, S('wind', .5, dur=3.4)), (0, S('drone', .35, dur=3.4))],
 's02': [(.2, L('bass-rumble-long', .8)), (.3, L('whoosh-medium-hard', .5)), (.9, L('whoosh-medium-hard', .45, rate=.8)), (1.5, L('whoosh-medium-hard', .5, rate=.9)), (1.0, S('roar', .35, dur=2.2))],
 's03': [(.45, L('whoosh-fast-soft', .4)), (1.15, L('cinematic-drum-massive', 1.0)), (1.15, S('roar', .55, dur=1.0))],
 's04': [(0, L('cinematic-slam-massive', .9)), (.35, S('tone', .2, dur=1.2, freq=110))],
 's05': [(0, S('wind', .35, dur=4)), (0, S('hum', .3, dur=4)), (.5, S('siren', .12, dur=3))],
 's06': [(.1 + i * .12, L('click-tap-firm', .5)) for i in range(6)] + [(1.15, S('lowbat', .45)), (1.65, S('beep', .3)), (2.15, S('beep', .3))],
 's07': [(0, S('hiss', .35, dur=3.8))] + [(.2 + i * .47, S('step', .45)) for i in range(8)],
 's08': [(0, S('hum', .2, dur=4.6)), (.55, L('impact-light-firm', .4))],
 's09': [(.1, S('step', .5)), (.4, S('step', .5)), (.85, L('whoosh-fast-medium', .6)), (.95, L('impact-heavy-hard', 1.0)), (1.3, L('impact-deep-hard', 1.0)), (1.35, S('debris', .5, dur=.8)), (1.5, S('brush', .4, dur=.7))],
 's10': [(0, S('hum', .2, dur=4)), (1.0, L('click-tap-medium', .5)), (1.6, L('notification-failure-fall', .5))],
 's11': [(0, L('phone-vibrate-table', .7)), (.45, L('click-tap-firm', .6))],
 's12': [(1.4, S('breath_in', .35))],
 's13': [(0, S('hum', .35, dur=3.6))] + [(.2 + i * .45, S('step', .25, pitch=.8)) for i in range(7)],
 's14': [(.2, S('charge', .6, dur=2.0)), (.3, L('whoosh-medium-hard', .6, rate=.7)), (2.2, L('cinematic-drum-big', .8))],
 's15': [(.1, S('roar', .45, dur=.6, pitch=1.6)), (.55, L('whoosh-fast-medium', .6)), (.75, L('impact-heavy-firm', .9)), (1.05, S('step', .5)), (1.25, S('step', .5)), (1.45, L('whoosh-medium-hard', .6)), (1.55, L('cinematic-drum-big', 1.0)), (1.6, L('impact-heavy-hard', .9)), (2.0, S('thud', .6))],
 's16': [(.2, S('tinkle', .4, dur=3)), (.2, S('chord', .15, dur=3))],
 's17': [(.3, S('crackle', .35, dur=3.3)), (.3, S('hum', .25, dur=3.3))],
 's18': [(.1, S('murmur', .3, dur=2)), (2.4, L('swish-medium', .4))],
 's19': [(.5, L('bass-rumble-long', .9)), (.6, S('debris', .55, dur=2.6)), (1.2, S('chord', .25, dur=2.6))],
 's20': [(0, S('drone', .4, dur=4)), (0, S('crackle', .25, dur=4))],
 's21': [(.3, S('charge', .35, dur=1.4))] + [(.3 + i * .12, S('tinkle', .12, dur=.3)) for i in range(10)],
 's22': [(0, S('crackle', .3, dur=2.8))],
 's23': [(.5, L('cinematic-slam-massive', 1.0)), (.6, S('puff', .5)), (.65, S('wind', .3, dur=1.2))],
 's24': [(.3 + i * .3125, L('impact-heavy-firm', .85)) for i in range(7)],
 's25': [(.5, S('debris', .5, dur=1.4)), (.5, L('bass-rumble-short', .7))],
 's26': [(.4, S('charge', .5, dur=.6)), (.95, L('cinematic-drum-big', .9))],
 's27': [(.2, S('charge', .4, dur=.8)), (1.0, S('zap', .9, dur=.5)), (1.0, L('cinematic-thunder-massive', .9))],
 's28': [(0, L('oc-VOXFem_Female01DeathScream_OS_01', .6)), (0, S('murmur', .4, dur=2.8))] + [(.1 + i * .22, S('step', .4)) for i in range(10)],
 's29': [(0, L('bsb-heartbeat-slow', .8))],
 's30': [(1.5, L('whoosh-medium-hard', .5)), (2.2, L('impact-deep-hard', .9))],
 's31': [(.65, S('thud', .5)), (.55, S('thud', .4)), (.9, S('thud', .4)), (1.95, S('thud', .6))] + [(b, S('zap', .7, dur=.4)) for b in (1.2, 1.9, 2.6)] + [(b, L('whoosh-fast-medium', .6)) for b in (1.2, 1.9, 2.6)],
 's32': [(0, L('bsb-heartbeat-slow', .9)), (.3, S('debris', .4, dur=2.3)), (.3, L('bass-rumble-medium', .6))],
 's33': [(.3, L('cinematic-drum-massive', .9)), (.3, S('chord', .3, dur=2.4))],
 's34': [(0, L('bsb-heartbeat-fast', .8)), (3.0, L('cinematic-slam-massive', 1.0)), (3.0, S('wind', .25, dur=1.4))],
}
out = []
for sid, cs in C.items():
    for t, c in cs: out.append({**c, 't': round(st[sid] + t, 3)})
json.dump(sorted(out, key=lambda c: c['t']), open('sfx-ep1.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'cues, total', TOTAL)
