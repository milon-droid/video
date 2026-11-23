# MAP — МАЯК
src/engine.js — E (слои бумаги paper{z,draw,shadow,tint,glow}, камера S.cam, glow/flushGlow = bloom, post), A (K ключи, ease, lag, blink)
src/paper.js — P: poly/smooth/fill/blob/cloud/wave/foam/rock/rain/grass/spark
src/chars.js — C.person(c,'mira'|'grandpa',pose) с IK (ikR/ikL), C.firefly, C.fireflyGlow
src/world.js — Wd: flash/setFlashes (молнии), sky, sea, lighthouse, cliff, ship/shipGlow, lens, roomBack, pal (ночь→рассвет)
src/story.js — кадры 1–8 + помощники (label, shards, smoke, sparks, halo, lever, wheel, deck, extWide, room, gallery, railing, beam)
src/story2.js — кадры 9–19 (meadow, FF светлячки луга, lhBeam); src/main.js — диспетчер
audio/sound.py — звук. Превью: node still.cjs out.png t1 t2…; рендер: node render.cjs render/mayak.mp4
