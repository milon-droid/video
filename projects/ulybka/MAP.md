# Карта кода «SMILE»
- `src/core.js`: холст рисунка (сетка 1080×1920), тона плёнки INK…PAPER, `camera()`, `on12()` (12 рисунков/с), `film()` — WebGL-шейдер плёнки (зерно, пыль, волоски, царапины, мерцание, дрожание, ореол, гейт, прожиг `burn`).
- `src/chars.js`: `hose` (рука-шланг), `glove`, `shoe`, `pieEye` (shrink — зрачок-точка, hollow — пустые глазницы), `tippy` (рты grin/smile/frown/scream/o, `paint`+`drips` — нарисованная улыбка, слёзы, хвост, шаг), `pig` (мэр, `peel` — улыбка-наклейка, `scream`), `flower`, `sun` (teeth, grinW), `house`, `tree`, `viewer` (зритель: затылок → лицо с нарисованной улыбкой).
- `src/world.js`: небо, холмы, забор, табличка «RULE No.1 ALWAYS SMILE!», камень, облака с лицами, интерьер, окно, банка краски, кинозал (луч проектора), титр, ракорд.
- `src/main.js`: 17 планов `SHOT.H…END`, монтаж по `vo/durations.json`, субтитры, надпись хука, «YOU STOPPED SMILING».
- `audio/build.py`: регтайм-синтез, ломка музыки, проектор, шумы, скримеры, голоса с «радио» → `audio/mix.wav`.
## Команды
- Лист: `bash sheet.sh out.jpg 1 5 …`; таймлайн `python3 tl.py`.
- Голос: `~/.venvs/qwentts/bin/python tools/vo-qwen.py projects/ulybka/vo/lines.json -o projects/ulybka/vo/take1 --lang English --cands 2 --pause 0.5` → `cp take1/durations.json vo/`.
- Рендер: `node ../../tools/render.mjs index.html -o render/video.mp4 --workers 4` → `python3 audio/build.py` → `python3 ../../tools/master.py render/video.mp4 render/smile-720.mp4 --audio audio/mix.wav`.
