# Карта кода «ОДИНОЧКА» (Remotion, `remotion/`)

Серия = `src/epN/timeline.ts` (SHOTS: id, длительность, реплики) + планы `ShotsA–D.tsx` + `map.ts` (id → компонент) + `Ep1.tsx` (планы + субтитры). Композиция `Ep1` в `src/Root.tsx`.
Превью: `node scripts/sheet.mjs out.jpg <сек…>` (SCALE=.3, COLS=4) — один лист. Рендер: см. CLAUDE.md, вывод в `render/` (не в git).
Звук: `python3 build_sfx.py` → `sfx-ep1.json` → `tools/sfx.py` → `public/audio/sfx.wav`; музыка `tools/music.py --style epic|dark` (epic: тайко+хор, `--seed 2` без барабанов) → микс ffmpeg в `public/ep1-mix.wav` (команда — ep1.md, «Статус»).

## src/kit
- `fx.tsx`: Defs (фильтры blur/glow), Grain, Vignette, SpeedLines, DashLines, Flash, isImpact+ImpactWrap (инверсия), Lids (моргание кадра), Rays, Smoke (свой градиент), Fog, Rain, Motes, shakeXY, cam(z,fx,fy,dx,dy,rot)
- `ui.tsx`: SysWin (окно Системы, печать текста), Caption (субтитр с именем), Title, RankLadder, Phone

## src/chars
- `head.tsx`: Head (аниме-лицо из частей: глаза моргают/смотрят/светятся `glow`, брови по `expr`, рот `mouth`, пот, слёзы, волосы по стилю `kirill|liza|nastya|zhora|mikh|slick|buzz|curly`)
- `body.tsx`: Figure (риг анфас: руки-локти-кисти, ноги-колени; костюм Costume: hood/box/coat/armor/logo; rim — контровой свет), POSES, PK (позы по ключам с перелётом), walkPose (фаза из пути), blend
- `cast.tsx`: LK (внешность) и CS (костюмы): kirill/kirillHurt, nastya, liza, mikh, zhora, coll1/coll2, r1/r2; костюмы courier, kirillRaid, shadow (плащ)
- `monsters.tsx`: Upyr, Statue (гусляр/звонарь, поворот и поклон головы), Idol (улыбка, глаза, поворот), ShadowSoldier (rise), BowFigure (поклон сбоку)

## src/bg
- `moscow.tsx`: Vysotka, KremlinTower, KremlinWall, Basil, MoscowCity, Ostankino, Panelka, Gate (Врата), Sky, starD
- `places.tsx`: Stairwell (подъезд, надпись «ВОЛКОВ, ВЕРНИ ДОЛГ»), Kitchen, MetroStreet (дождь, «М»), MetroStation (сталинская, арки), Cave, Temple (lit, red)

## Координаты
Кадр 1080×1920; фигура — начало между ступнями, s=1 ≈ 820 px; субтитры y≈1290 (лица выше 1100).
