# Запрос ассетов — «Не очень-то и хотелось» (Вини, Сэди, Диоманде), v7

Зачем: в v6 посадка и руки сделаны поворотом частей стоящей картинки — отсюда «деревянность».
Нужны **готовые рисунки поз**: сидящие тела и руки в ключевых положениях. Я режу их на части, ставлю
на сцену и анимирую между ними (смена ключевых рисунков + движение частей + мимика моим ригом).

## Как генерировать (общее для всех)
1. В каждый запрос **прикладывайте картинку-образец персонажа** из `projects/ne-ochen/assets/chars/`
   (какую — указано в пункте). Лицо, причёска, одежда, цвета — как на образце.
2. В конец каждого промпта добавляйте общий блок **STYLE** (ниже) — без него стиль «поплывёт».
3. Если генератор не умеет прозрачный фон — сплошной ярко-зелёный `#00FF00`, я уберу сам.
4. Лицо — спокойное, рот закрыт, глаза открыты, смотрит в камеру (эмоции, моргание и рот я анимирую сам).
   Исключения указаны в пункте.
5. Если вышло не то (лишние пальцы, другое лицо, другая одежда) — просто перегенерируйте, плохие не присылайте.

**STYLE (вставлять в конец каждого промпта):**
```
Same character, same face, same hairstyle, same outfit and the exact same art style as the attached reference image:
flat 2D cartoon vector illustration, clean bold dark outlines, soft cel shading, big expressive eyes, slightly big head,
friendly proportions. Full body visible, centered, straight front view, plain transparent background
(or solid pure green #00FF00 if transparency is not possible), no floor, no cast shadow, no furniture, no text,
no watermark, no frame. Correct anatomy: exactly five fingers on each hand. Vertical 9:16, high resolution.
```

---

## А. Сидящие позы (сиденье не рисовать — сидит «на невидимом ящике», диван/скамейку/кресло подставлю сам)

Ассет #01 для проекта ne-ochen
Тип: изображение
Что изображено: Вини дома сидит на диване, руки на бёдрах
Где используется: сцены «Until today» и «I'm Vinícius Júnior», 00:03–00:10 (база для всех домашних поз)
Образец: `vinicius-home-transparent.png`
Промпт: `The character is sitting on an invisible seat, front view, relaxed, back straight, knees bent at 90 degrees
and pointing toward the viewer (thighs foreshortened), feet flat on the ground shoulder-width apart, both hands resting
on his thighs, arms relaxed.` + STYLE
Формат: PNG, вертикаль 9:16, прозрачный фон: да
Имя файла: ne-ochen-01-vini-home-sit.png

Ассет #02 для проекта ne-ochen
Тип: изображение
Что изображено: Вини дома сидит и печатает в телефоне двумя большими пальцами
Где используется: сцена «I invited her…», 00:10–00:14
Образец: `vinicius-home-transparent.png`
Промпт: `The character is sitting on an invisible seat, front view, knees toward the viewer, feet flat on the ground,
holding a black smartphone with both hands at chest level, typing with both thumbs, elbows bent close to the body,
head slightly tilted down, eyes looking down at the phone screen, confident little smile.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-02-vini-home-sit-typing.png

Ассет #03 для проекта ne-ochen
Тип: изображение
Что изображено: Вини дома сидит, замахнулся телефоном, чтобы швырнуть его
Где используется: сцена «Whatever. Didn't want to anyway», 00:14–00:16
Образец: `vinicius-home-transparent.png`
Промпт: `The character is sitting on an invisible seat, front view, knees toward the viewer, torso twisted slightly to his
right, right arm raised high and pulled back behind his head holding a black smartphone ready to throw it,
left hand resting on his left thigh, annoyed face, eyebrows down.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-03-vini-home-sit-throw.png

Ассет #04 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме сидит на скамейке запасных, грустит, подбородок на кулаке
Где используется: сцена «the bench is my best friend», 00:17–00:21
Образец: `vinicius-kit-transparent.png`
Промпт: `The character in his football kit is sitting on an invisible bench, front view, leaning forward, right elbow on
his right knee, chin resting on his right fist, left forearm lying across his left thigh, knees toward the viewer,
feet on the ground, shoulders dropped, bored and sad face, eyes half-closed.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-04-vini-kit-sit-sad.png

Ассет #05 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме сидит прямо, руки на бёдрах (за миг до прыжка)
Где используется: сцена «Finally! My moment!», 00:21–00:22
Образец: `vinicius-kit-transparent.png`
Промпт: `The character in his football kit is sitting on an invisible bench, front view, back straight, knees bent at
90 degrees toward the viewer, feet flat, both hands pressing on his thighs as if about to stand up.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-05-vini-kit-sit.png

Ассет #06 для проекта ne-ochen
Тип: изображение
Что изображено: Диоманде в форме сидит на скамейке и машет рукой вверх (флешбэк)
Где используется: флешбэк, 00:46–00:48
Образец: `diomande-kit-transparent.png`
Промпт: `The character in his football kit (number 25) is sitting on an invisible bench, front view, knees toward the
viewer, feet flat, right arm raised high waving with an open palm, fingers spread, left hand on his left thigh,
looking up, big happy smile with teeth.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-06-diom-kit-sit-wave.png

Ассет #07 для проекта ne-ochen
Тип: изображение
Что изображено: Диоманде в олимпийке сидит в VIP-ложе, рука вытянута вдоль спинки дивана (за спиной у Сэди), смеётся
Где используется: ложа, 00:28–00:30 и 00:41–00:46 (момент «Диоманде рядом с Сэди»)
Образец: `diomande-casual-transparent.png`
Промпт: `The character is sitting on an invisible sofa, front view, relaxed and confident, leaning slightly to his left
(viewer's right), his left arm stretched out sideways along the top of an invisible sofa backrest at shoulder height,
hand relaxed and hanging over it, right hand resting on his right thigh, knees toward the viewer, feet on the ground,
laughing, head tilted toward his left.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-07-diom-casual-sit-arm.png

Ассет #08 для проекта ne-ochen
Тип: изображение
Что изображено: Сэди в чёрном платье сидит в VIP-ложе, колени вместе, руки на коленях
Где используется: ложа, 00:28–00:30, 00:41–00:46 (база)
Образец: `sadie-vip-transparent.png`
Промпт: `The character in her black dress is sitting on an invisible sofa, front view, elegant posture, knees together and
pointing toward the viewer, lower legs slightly angled to one side, ankles together, both hands resting on her knees,
leaning slightly to her right (viewer's left).` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-08-sadie-sit.png

Ассет #09 для проекта ne-ochen
Тип: изображение
Что изображено: Сэди сидит и смеётся, прикрывая рот ладонью
Где используется: ложа, 00:43–00:46
Образец: `sadie-vip-transparent.png`
Промпт: `The character in her black dress is sitting on an invisible sofa, front view, knees together toward the viewer,
laughing, her right hand covering her mouth with fingertips, eyes squinted from laughter, left hand on her knee,
shoulders slightly raised, leaning to her right (viewer's left).` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-09-sadie-sit-laugh.png

---

## Б. Руки в ключевых моментах (стоя, в полный рост)

Ассет #10 для проекта ne-ochen
Тип: изображение
Что изображено: букет отдельно — красные розы в крафт-бумаге с лентой
Где используется: коридор, дверь, финал, 00:38–00:50
Промпт: `A bouquet of seven red roses with green leaves, wrapped in brown kraft paper with a white ribbon, upright,
stems at the bottom, front view, flat 2D cartoon vector illustration, clean bold dark outlines, soft cel shading,
transparent background, no hands, no text.`
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-10-bouquet.png

Ассет #11 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме держит букет обеими руками перед грудью, улыбается
Где используется: коридор → вход в ложу, 00:39–00:46
Образец: `vinicius-kit-transparent.png` + картинка #10 (чтобы букет был тот же)
Промпт: `The character in his football kit is standing, front view, holding the bouquet of red roses from the second
reference image with both hands in front of his chest, hands wrapped around the paper below the flowers,
elbows bent, proud big smile.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-11-vini-kit-bouquet-front.png

Ассет #12 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме держит букет одной рукой, опущенной вдоль тела (букет вниз головой)
Где используется: финал, «улыбка сползла», 00:45–00:48
Образец: `vinicius-kit-transparent.png` + картинка #10
Промпт: `The character in his football kit is standing, front view, his right arm hanging down along his body loosely
holding the bouquet of red roses from the second reference image by the stems, flowers pointing down to the floor,
left arm hanging relaxed, shoulders dropped, confused disappointed face.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-12-vini-kit-bouquet-down.png

Ассет #13 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме прячет букет за спиной (обе руки за спиной, видны цветы сбоку)
Где используется: финал, «прячет букет», 00:48–00:50
Образец: `vinicius-kit-transparent.png` + картинка #10
Промпт: `The character in his football kit is standing, front view, both arms behind his back hiding the bouquet of red
roses from the second reference image, a few roses peeking out beside his right hip, shoulders hunched, head slightly
down, sad face, about to cry.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-13-vini-kit-bouquet-hide.png

Ассет #14 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме держит ладонь на сердце, влюблённый
Где используется: «Wait… is that Sadie?!», 00:30–00:32
Образец: `vinicius-kit-transparent.png`
Промпт: `The character in his football kit is standing, front view, right hand pressed flat on the left side of his chest
over his heart, left arm relaxed, head tilted, dreamy love-struck smile.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-14-vini-kit-heart.png

Ассет #15 для проекта ne-ochen
Тип: изображение
Что изображено: Вини в форме машет рукой вверх (ложе), другая рука на поясе
Где используется: «Knew it. She couldn't resist», 00:36–00:38
Образец: `vinicius-kit-transparent.png`
Промпт: `The character in his football kit is standing, front view, right arm raised high above his head waving with
an open palm and spread fingers, left hand on his hip, looking up, smug confident smile.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-15-vini-kit-wave.png

Ассет #16 для проекта ne-ochen
Тип: изображение
Что изображено: Диоманде в форме, вид 3/4 вправо, хлопает по плечу (рука вытянута вперёд на уровне плеча)
Где используется: замена «Thanks, bro», 00:24–00:27
Образец: `diomande-kit-transparent.png`
Промпт: `The character in his football kit (number 25) is standing in three-quarter view facing to the right, his right arm
stretched forward at shoulder height with an open palm as if patting someone's shoulder, left arm relaxed, friendly
smile.` + STYLE (замените в STYLE «straight front view» на «three-quarter view facing right»)
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-16-diom-kit-pat.png

Ассет #17 для проекта ne-ochen
Тип: изображение
Что изображено: Сэди стоит в ложе и машет рукой вниз (на поле)
Где используется: ложа, 00:28–00:30 и флешбэк
Образец: `sadie-vip-transparent.png`
Промпт: `The character in her black dress is standing, front view, right arm raised to shoulder height waving with an open
palm and fingers together, left hand resting on her stomach, looking slightly down, sweet smile.` + STYLE
Формат: PNG, 9:16, прозрачный фон: да
Имя файла: ne-ochen-17-sadie-wave.png

---

## В. Наборы кистей (для плавной анимации между позами)

Одна картинка = набор кистей одного персонажа на сетке. Я вырезаю каждую кисть и подменяю по кадрам
(так руки «живут»: сжимаются, раскрываются, хватают букет и телефон).

Ассет #18 для проекта ne-ochen
Тип: изображение
Что изображено: набор кистей Вини (тёмная кожа, как на образце)
Где используется: все сцены с Вини
Образец: `vinicius-kit-transparent.png`
Промпт: `Character sheet of hands only for the attached character: 12 separate right hands with a short piece of wrist,
same skin tone, same outline and shading style, arranged in a neat 4x3 grid with lots of empty space between them,
each hand isolated and not touching others: 1 relaxed open hand side view, 2 open palm facing viewer fingers together,
3 open palm fingers spread (waving), 4 back of the hand, 5 fist front, 6 fist side view, 7 thumbs up, 8 pointing
index finger, 9 hand gripping a cylinder (C-shape grip, for holding a bouquet), 10 hand holding a phone with thumb on
screen, 11 hand flat pressed on something (palm toward viewer, fingers slightly bent), 12 hand hanging loosely,
fingers curled. Flat 2D cartoon vector, clean bold dark outlines, soft cel shading, transparent background, no arms,
no text, no numbers, exactly five fingers on each hand.`
Формат: PNG, квадрат 1:1, прозрачный фон: да
Имя файла: ne-ochen-18-hands-vini.png

Ассет #19 для проекта ne-ochen
Тип: изображение
Что изображено: набор кистей Диоманде — тот же промпт, что #18
Образец: `diomande-kit-transparent.png`
Имя файла: ne-ochen-19-hands-diom.png

Ассет #20 для проекта ne-ochen
Тип: изображение
Что изображено: набор кистей Сэди — тот же промпт, что #18, но в пунктах 9–12:
`9 hand covering a mouth (fingertips up), 10 hand resting on a knee, 11 hand waving with fingers together,
12 hand with fingers slightly curled, elegant, with a thin gold bracelet on the left wrist only if visible on the reference.`
Образец: `sadie-vip-transparent.png`
Имя файла: ne-ochen-20-hands-sadie.png

---

**Минимум, без которого не начинать:** #01, #04, #07, #08, #10, #11, #13, #18–#20.
Остальные улучшат конкретные моменты; без них эти моменты остаются как в v6.
Куда класть: в чат или в `assets/incoming/` — разложу в `projects/ne-ochen/assets/poses/`.
