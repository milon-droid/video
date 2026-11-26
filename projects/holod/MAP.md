# Карта кода «ХОЛОД» (свой движок: three.js → температура → шейдер тепловизора)
- `src/core.js`: рендерер, `rtT` (float °C, 432×768, MSAA), `tMat()` — материал-температура (T, градиент, шум, стойки стен, края, источники тепла `setHeat`, декаль-маска, излучательность по углу), `thermalMirror()` (Reflector в градусах, слои), `steamPoints()` (пар добавляет тепло), `POST` — шейдер камеры (палитра, изотерма, ореолы, шум, NUC, сбой, зум), `renderThermal()` + `readT()` (замер °C из карты), `project()`.
- `src/rig.js`: персонажи из отрезков между суставами: `makeHuman/poseHuman` (IK рук и ног, шаг, голова, `cold` — 4 °C, `device` — камера у лица, `slim`, `longHair`, `dress`), `makeDog/poseDog` (рычание, лай, хвост, уши).
- `src/set.js`: квартира (гостиная с окном-стеклом и батареей, коридор с холодными следами/ладонями и зеркалом, спальня с одеялом-рельефом), `steam()`.
- `src/main.js`: персонажи, рука на переднем плане (`poseHand`), 16 планов `SHOT.H…P`, монтаж по `vo/durations.json`, NUC, HUD, точечные замеры, хук, карточка правила, рамка зеркала, субтитры CC.
- `audio/build.py`: вся звуковая дорожка (партитура numpy, синтез рычания, затвор, шаги, сердце, лай Oculus CC BY, голос с приглушением фона) → `audio/mix.wav`.
## Команды
- Лист: `bash sheet.sh out.jpg 1.5 5 …` (SC, COLS); таймлайн `python3 tl.py`.
- Голос: `~/.venvs/qwentts/bin/python tools/vo-qwen.py projects/holod/vo/lines.json -o projects/holod/vo/take1 --lang English --cands 2 --pause 0.5` → скопировать `take1/durations.json` в `vo/`.
- Рендер: `node ../../tools/render.mjs index.html -o render/video.mp4 --workers 4` → `python3 audio/build.py` → mux + `tools/master.py`.
