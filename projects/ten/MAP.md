# Карта кода «ТЕНЬ УВОЛИЛАСЬ» (свой движок: three.js + 2D-компоновщик)

Новый стиль (по просьбе пользователя — всё новое): пластилиновые 3D-игрушки, настоящие тени, тилт-шифт «миниатюра», свечение, зерно.
Шрифты: Unbounded (текст), Caveat (рукописные письма тени) — OFL, `three/fonts/`.

## three/src
- `core.js`: рендерер (720×1280, мягкие тени, ACES), `clay()` материалы, геометрии `G` (rbox — скруглённый куб), `canvasTex` (+ перерисовка после загрузки шрифтов), `composite()` — тилт-шифт, bloom, тёплый/холодный тон, виньетка, зерно; дальше 2D в сетке 1080×1920.
- `toy.js`: `makeToy(LOOK)` — персонаж-игрушка (плечо-локоть-кисть, бедро-колено-стопа, лицо: глаза моргают/смотрят, веки, брови по `expr`, рот `mouth/smile`, волосы-комки); `POSE`, `keys()` — позы по ключам с перелётом, `walk(dist, run)` — шаг от пути; `applyPose`; `setFade(T, sat, alpha, cast)` — растворение (alphaHash) и обесцвечивание. Тень-персонаж: `makeShade()` / `placeShade({rise 0 лежит…1 на стене, len, yaw, turn})`, светящиеся глаза `mood`.
- `sets.js`: декорации `night` (+неон «ПРОФСОЮЗ ТЕНЕЙ»), `kitchen` (+кот `makeCat/poseCat`), `hall` (стена-холст `paint`, `handLines` — рукописные буквы с подтёками), `loop` (миниатюра), `day` (улица, автобус, ограждение), `plaza` (фонтан-капли, танцоры, зрители), `roof` (закат, вентшахта-холст).
- `overlay.js`: `narr` (слова выпрыгивают), `shadowSay` (реплика тени), `sunHud` + `SUN_KEYS` (таймер заката — одна функция), `stamp`, `shadowWipe` (переход-клякса с глазами), `motes`.
- `main.js`: 16 планов `S.S1…S16`, монтаж `SHOTS`, переходы `WIPES`, `window.renderFrame`.

## Команды
- Лист превью: `bash three/sheet.sh out.jpg 0.5 3 10 …` (собирает бандл сам).
- Рендер 720p: `cd three && node_modules/.bin/esbuild src/main.js --bundle --format=iife --outfile=dist/bundle.js` → `node tools/render.mjs projects/ten/three/index.html -o projects/ten/render/video.mp4 --workers 4` (~25 мин).
- Звук: `cd audio && python3 score.py music.wav` (своя музыка, numpy/scipy) → `python3 build_sfx.py` → `python3 tools/sfx.py projects/ten/audio/sfx.json -o projects/ten/audio/sfx.wav --duration 73.6` → микс (ep1.md «Статус»).
