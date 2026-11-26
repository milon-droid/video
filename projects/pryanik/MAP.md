# Карта кода «CROOKED»
- `src/engine.js` — движок рельефа: холсты C (цвет) / H (высота, искры, глянец) / M (материал, свечение, глубина); `E.obj` — объект с
  объединением высот «максимумом»; примитивы `E.fill` (скос `bev`, купол `dome`), `E.tube` (трубка: глазурь, руки), `E.dot`, `E.texture`
  (узоры E.PAT: pores, crumb, sugar, wood, linen, knit, skin, paper); `E.pipeText` — текст глазурью; шейдеры F1 (свет, тени, глянец) и F2 (DOF, ореол, тонмаппинг).
  Свет: `E.L` (Lp — позиция свечи в экранных координатах, L2 — салют), эффекты `E.FX` (focus, dof, bloom, exposure, fade). `E.toScreen` — мир→экран.
- `src/chars.js` — пряничный человечек `CH.draw(o)` (позы рук/ног, лицо: глаза, зрачки, брови, рот: crooked/mood/droop/drip/smear/mouthP), `CH.walk`.
- `src/world.js` — противень, насадка, лопатка, коробка/крышка, ложка с отражением; стена с окном (снег, огни, салют), скатерть, свеча, мандарин,
  чашка (перевёрнутая, чай, пар), рука бабушки с часами `WD.handCup`, ладонь `WD.palm` (не используется), отражение лица в чае `WD.teaReflection`.
- `src/story.js` — сцены `shot(a,b,f)`, подписи `cap`, расписание лопатки `LIFT`, салют `FW`.
- `audio/score.py` — вся звуковая дорожка → `audio/mix.wav`; записи в `audio/rec/` (CC0, `CREDITS.md`).
- Рендер: `node render.cjs render/video.mp4` (4 потока, ~25 мин на 68 с); кадры: `SCALE=.3 node stills.cjs out.png t1 t2…`.
