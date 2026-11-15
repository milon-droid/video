# Блэкаут, серия 1 — задания для Higgsfield (полный список)

> **FOR THE ASSISTANT (Claude with Higgsfield MCP).** If you received this file together with `blackout-ep1-higgsfield-tasks.zip`
> and no other instructions — this file IS the task. Do this without asking:
> 1. Unzip the archive. Upload the images from `refs/` to Higgsfield (media_upload → PUT → media_confirm; if your sandbox cannot
>    reach it, use media_upload_widget and ask the user to drop the images there).
> 2. Follow "Блок 1" below as your rules for every task (models, settings, 2 start-frame variants, defect check, file names).
> 3. Run **package A only**: the 3 probes C1, C2, C3 from `PROBES-README.md` (section "Сообщение для чата").
> 4. Show the results, give job IDs, and STOP. Continue with packages B → C → D → E only after the user writes «дальше»
>    (or names a package). Package F (voice) only on explicit request. Reply to the user in Russian.


Основа: ТЗ `FABLE-HIGGSFIELD-TZ.md` и 44 замечания `review.md` (архив пользователя от 15.11). Картинки — папка `assets` из того же архива
(здесь же копия: `projects/blackout/assets/ep1v4/`).

## Почему генерации — в чате Claude, а не здесь
Higgsfield MCP в Claude Code подключён, но безлимит отсюда не тратится (сервис отвечает `unlim.available: false`, на счету 10 кредитов).
Поэтому: **генерируете в чате Claude с Higgsfield → присылаете сюда MP4/PNG → я проверяю покадрово и монтирую.**

## Порядок
1. **Пакет A — 3 пробы** (`probes/README.md`). Без них не начинать: проверяем, держит ли модель руки, хват и лица.
2. Если пробы приняты — пакеты B (квартира), C (новости), D (город), E (дверь, фасад, стол). Можно параллельно в разных чатах.
3. Пакет F — проба голоса (голоса серии 1 нет, см. внизу).

## Что я делаю здесь сам (НЕ генерировать)
Адресник «проспект Абая / улица Байтурсынова» (редактируемый текст на стене), экраны телефона (чат, «Подключение…», вызов),
карта Евразии с подсветкой регионов, плашки новостей и подписи стран, три карточки «ЗУБРИТ/ЛИСТАЕТ/ГЛАДИТ» (нарезка из клипов
B), мгновенное выключение света (склейка «свет → темнота» одной геометрии), содержимое экрана ТВ (ведущая поверх тёмного экрана),
субтитры, титры, финальная карточка, звук, сведение, экспорт.

---

## Блок 1 — вставить в чат Claude один раз в начале (правила для всех заданий)

```text
You are producing clips for a 2D animated series with Higgsfield. I will paste tasks one by one. For EVERY task:

1. Upload the reference images I attach (check they are really uploaded to Higgsfield before generating).
2. STEP 1 (start frame, if the task has one): generate_image with model nano_banana_pro, resolution 2k, the aspect ratio given in the task, 2 variants, all listed refs as image_references. Show me both and pick the one with the cleanest anatomy: whole arms, hands attached to wrists, correct seated poses, props touching hands, same faces/clothes as the refs, no text.
3. STEP 2 (video): generate_video with model seedance_2_0 (use my unlimited generations), mode std, resolution 720p, the task's aspect ratio, duration as given (default 5 s), generate_audio false. start_image = the chosen start frame (or the file named in the task), end_image only if the task names one, image_references = the character views named in the task (max 9 images total).
   If seedance_2_0 is unavailable, use seedance_2_5 mode omni_reference with the same inputs; say which one you used.
4. Append this style block to every video prompt:
   "Restrained flat 2D illustration style identical to the start frame. Ordinary young people, natural faces, no glamour, no 3D or photorealism. Clear physical action with preparation, action and a natural settle; people react at slightly different moments. Stable anatomy, continuous sleeves, coherent elbows and wrists, attached hands, grounded feet, stable props. Camera locked unless the task says otherwise. No generated text, captions, logos, UI or news graphics. Do not replace the performance with camera motion over a frozen picture. No pose teleportation, no object disappearing, no dancing, no generic body sway."
5. After each task report: task ID, job IDs (image + video), model and settings, and an honest defect check (broken arms, extra hands, sliding grip, changed face, warped props). If there is a clear defect, redo ONCE with a corrected start frame and say what you changed.
6. File names for downloads: <TASK-ID>_start_v<N>.png and <TASK-ID>_v<N>.mp4.
Story rules: Dias always wears the white bathrobe in this episode. Phones and flashlights work on batteries; mains power and ALL backup generators are dead after the blackout. Never show who knocks at the door.
```

---

## Пакет A — пробы (уже готов)
`projects/blackout/higgsfield/probes/README.md` — тесты C1 (кудрявый за столом), C2 (телефон), C3 (глажка).
Если пробы приняты, их же клипы идут в S05, S06, S12 (Диас), S13.

---

## Пакет B — квартира

Схема квартиры для всех заданий (по `room-lit-v3.jpg`): ТВ на стене слева вверху, под ним маленький стол с монитором (место кудрявого),
в центре обеденный стол с лапшой и кружками, справа окно со шторами (у окна гладильная доска Диаса). **Входная дверь — за кадром справа.**
Сначала делается один «мастер-кадр» B0, остальные общие планы — его правки, чтобы мебель и люди не переставлялись.

Персонажи (прикладывать): C1 `student-front-v3.png` + `student-profile-v3.png`; C2 `blue-front-v3.png` + `blue-profile-v3.png`;
C3 `dias-robe-front-v3.png` + `dias-robe-profile-v3.png`.

```text
TASK B0 — master wide frame of the apartment (image only, no video)
Refs: room-lit-v3.jpg, student-front-v3.png, student-profile-v3.png, blue-front-v3.png, blue-profile-v3.png, dias-robe-front-v3.png, dias-robe-profile-v3.png
Aspect 9:16. Prompt: "The exact room from room-lit-v3: TV on the wall top-left, small desk with monitor under it, dining table with three noodle cups and mugs in the centre, window with orange curtains on the right, calendar on the beige wall. Full room visible from ceiling lamp to floor, normal floor under all furniture and people. The curly-haired student in the short red plaid shirt sits on a chair at the small desk, three-quarter back view, pelvis on the seat, feet on the floor, pen in hand over an open notebook next to the keyboard. The young man in the navy tracksuit stands behind the dining table, holding a smartphone in his right hand at chest height, screen toward him. Dias with dark rectangular glasses and a tied white bathrobe stands at a blue ironing board near the window, the board's legs on the floor, a light-blue shirt lying on it, right hand on a white iron resting on the shirt, left hand holding the collar. TV screen is OFF: plain dark glass. Warm evening ceiling light. Everyone at a natural real-world scale relative to the table. No text."
Pick the variant with correct scale, whole arms and the TV clearly off. Send me B0_start_v1.png.
```

```text
TASK S03 — everyone busy (00:05,6–00:07,8)
start_image: chosen B0 frame. image_references: the 6 character views. Duration 5 s.
Video prompt: "Static wide shot. Three roommates each busy with their own task, not in sync: the curly student writes a short line in his notebook and glances at the monitor; the tracksuit guy swipes once with his thumb on his phone and reads; Dias makes one short pass with the iron over the light-blue shirt while his left hand keeps the collar flat. Nobody looks at the camera. The TV stays off."
```

```text
TASK S07 — Dias reads a message, softer face (00:15,8–00:17,4)
Refs: dias-robe-front-v3.png, dias-robe-profile-v3.png, room-lit-v3.jpg. Aspect 9:16.
Start frame prompt: "Medium shot from the waist up, Dias with dark rectangular glasses in the tied white bathrobe stands by the window from the room reference, the ironing board edge visible at the bottom. He holds a smartphone in his left hand at chest height, screen facing HIM (we see the back of the phone), right index finger just above the glass. Warm evening light, calm face."
Video prompt: "He reads a new message, his index finger taps the screen once, his expression softens into a small shy smile, his eyes stay on the phone. The phone stays in the same hand with a firm grip, back of the phone toward camera."
```

```text
TASK S09 — phone put away, back to ironing (00:20,7–00:21,8)
start_image: the LAST frame of S07 (export it). Refs: dias-robe-front-v3.png, dias-robe-profile-v3.png. Duration 5 s.
Video prompt: "Dias lowers the phone and places it face-down on the windowsill beside him with his left hand, then his left hand returns to the shirt collar on the board while his right hand takes the iron handle again. The phone stays visible on the sill. Continuous motion, no jump."
```

```text
TASK S12 — the jet roar: everyone stops (00:27,4–00:30,9)
start_image: chosen B0 frame (or last frame of S03). Refs: 6 character views. Duration 5 s.
Video prompt: "A sudden loud roar from outside. Each person reacts differently and at slightly different moments: the curly student freezes mid-writing, lifts the pen off the page and looks up toward the window; the tracksuit guy lowers his phone a little and turns his head to the window; Dias stops the iron, stands it upright on the board, his eyes lift first and then his head turns toward the window, shoulders tense. Mouths mostly closed, one brief open-mouth startle at most. Room geometry stays exactly the same."
```

```text
TASK S15 — Dias texts Aruzhan, worry grows (00:35–00:37,8)
Refs: dias-robe-front-v3.png, dias-robe-profile-v3.png, room-lit-v3.jpg. Aspect 9:16.
Start frame prompt: "Close-medium shot, chest up: Dias with dark rectangular glasses, white bathrobe, holds a smartphone with both hands in front of his chest, both thumbs on the glass, screen facing him. Window with orange curtain behind him. Warm evening light, slightly worried face."
Video prompt: "He types a short message with both thumbs, presses send, then waits looking at the screen; his brows draw together and his shoulders rise a little as no reply comes. Hands keep holding the phone, no smile."
```

```text
TASK S17 — phone to the ear (00:41,9–00:43,9)
Refs: dias-robe-front-v3.png, dias-robe-profile-v3.png, room-lit-v3.jpg. Aspect 9:16.
Start frame prompt: "Medium shot, waist up: Dias with dark rectangular glasses in the white bathrobe holds a smartphone to his right ear, fingers wrapped around the phone, elbow down and close to the body, forearm NOT crossing his mouth or glasses. Three-quarter view, eyes looking down to the side, not at camera. Window behind. Warm evening light."
Video prompt: "He listens, waiting for the call to connect. A small anxious breath, he shifts his weight, closes his eyes for a moment and whispers a few words, then opens his eyes and keeps listening. The phone stays pressed to his ear in the same grip the whole time."
```

```text
TASK S18 — the TV is switched on (00:43,9–00:46)
start_image: chosen B0 frame with a small TV remote added in the curly student's right hand (make this edit with nano_banana_pro first: "same image, the curly student now holds a small black TV remote in his right hand, seated at the desk, nothing else changes").
Refs: 6 character views. Duration 5 s.
Video prompt: "The curly student raises the remote toward the TV on the wall and presses a button. The tracksuit guy and Dias turn their heads and then their bodies toward the TV, the tracksuit guy lowering his phone, Dias leaving the iron upright on the board. All three end up watching the TV. IMPORTANT: the TV screen stays plain dark glass for the whole clip (the picture will be added later), camera locked."
```

```text
TASK N07 — watching the news, Dias more tense (00:57,2–00:57,9)
start_image: the LAST frame of S18. Duration 5 s.
Video prompt: "All three keep watching the TV with growing concern; the curly student leans forward slightly, the tracksuit guy glances at Dias, Dias presses his lips together and grips his phone tighter. Soft cool flickering light from the TV falls on their faces. TV screen stays plain glass. Camera locked."
```

```text
TASK S19 — after the power cut (01:01,9–01:04,4)
Refs: room-blackout-v3.jpg, the chosen B0 frame, 6 character views. Aspect 9:16.
Start frame prompt (edit of B0): "The same image as the B0 frame but in total darkness, matching room-blackout-v3: ceiling lamp, monitor, TV and neighbouring windows are OFF, the room is dark blue. Same furniture, same people in the same places. The tracksuit guy and Dias each hold their phone with the screen ON; cool phone light falls only on their hands and the nearest part of their faces, no glow around the heads."
Video prompt: "In the dark room the curly student stops typing, takes his hand off the keyboard and turns toward the others; the tracksuit guy lifts his phone and taps it, checking for signal; Dias holds his phone up and looks around, worried. Phone screens are the only light and move with the hands. No lamp or screen turns back on."
```

```text
TASK S22 — Dias at the dark window takes a flashlight (01:11,2–01:13,4)
Refs: room-blackout-v3.jpg, dias-robe-front-v3.png, dias-robe-profile-v3.png. Aspect 9:16.
Start frame prompt: "Dark room at night, medium shot: Dias with dark rectangular glasses in the white bathrobe stands at the dark window, holding a lit smartphone in his right hand, a small black pocket flashlight lies on the windowsill next to him. Cool phone light on his hand and face only. The city outside the window is dark."
Video prompt: "He looks at the phone screen with no signal, presses his lips, glances out of the dark window, then picks up the small flashlight from the sill with his left hand and switches it on; its beam starts at the lens. The phone stays in his right hand."
```

```text
TASK S24 — the knock (01:15,6–01:17,9)
start_image: the LAST frame of S19 (dark room, phones lit). Refs: 6 character views. Duration 5 s.
Video prompt: "Silence in the dark room. Then a knock is heard from the front door, off-screen to the RIGHT. First their eyes move toward the door, a moment later their heads, then shoulders: Dias first, then the tracksuit guy, the curly student last (he stays seated and turns on the chair, feet planted). Phones stay in their hands. Nobody walks to the door."
```

---

## Пакет C — новости (вымышленный выпуск)

```text
TASK N01 — anchor opens the bulletin (00:46–00:47,8)
start_image: tv-anchor.jpg (as is). Aspect 16:9. Duration 5 s.
Video prompt: "The same fictional news anchor at the desk finishes reading a line on her paper, lifts her eyes to the camera and starts an urgent announcement with restrained concern: small breath, natural slight head movement, talking mouth. One hand slightly adjusts the paper, the other stays on the desk. Same face, jacket and studio. No smile, no text or graphics."
```

```text
TASK N08 — same anchor, worse news (00:57,9–00:59,8)
start_image: tv-anchor.jpg. Aspect 16:9. Duration 5 s.
Video prompt: "The same anchor stumbles: she pauses mid-sentence, glances down at her paper, a second sheet is slid onto her desk from the side by an off-screen hand, she looks at it, then looks back up at the camera, more alarmed, and continues speaking. Hands keep the papers, nothing teleports. Same face and studio, no graphics."
```

```text
TASK N02 — Russia, eyewitness video (00:47,8–00:49,1)
start_image: tv-russia.jpg. Aspect 9:16. Duration 5 s.
Video prompt: "Fictional eyewitness clip on a dark residential street right after a city-wide power cut. The car in the lane keeps driving with its battery headlights on; an older man in the foreground notices the darkness, stops and looks up at the dead windows; the woman next to him checks her phone, its light on her face; the others turn their heads at different moments. Small natural hand-held camera response only; people and the car move by themselves. Buildings and faces stay stable."
```

```text
TASK N03 — Eastern Europe (00:49,1–00:50,7)
start_image: tv-eastern-europe.jpg. Aspect 9:16. Duration 5 s.
Video prompt: "Fictional eyewitness clip on an Eastern European street. The tram completes a controlled stop as its interior lights go out; a red-haired man notices and supports his elderly companion by the forearm; a woman in a teal coat checks her phone; a car passes in its own separate lane with headlights on. People react at slightly different moments with ordinary concerned faces. Small natural hand-held camera response; tram, car and people move independently of the camera."
```

```text
TASK N04 — Japan (00:50,7–00:52,5)
start_image: tv-japan.jpg. Aspect 9:16. Duration 5 s.
Video prompt: "Fictional eyewitness clip on a Japanese city street with the shop signs already dark. A cyclist rolls to a stop at the kerb and looks at his phone; a couple stops walking and looks up at the dead signs, one points; a scooter's headlight passes in the background. Different people react at different moments. Small natural hand-held camera response only. Same people and street, no text appears on the signs."
```

```text
TASK N06 — substation: smoke after the strike (00:55–00:57,2)
start_image: tv-substation-aftermath.jpg. Aspect 16:9. Duration 5 s.
Video prompt: "Static night shot of the same electrical substation right after a lightning strike. A thin grey smoke wisp rises from one scorched insulator on the left gantry and drifts in the wind; a few faint sparks die out at that spot; distant clouds flicker once with sheet lightning. Equipment, fence and transformer stay exactly in place. No fire, no explosion, no people, no text."
(Сам удар молнии смонтирую здесь из tv-substation-strike.jpg со вспышкой — генерировать не нужно.)
```

---

## Пакет D — город и канатная дорога

Принцип: стартовый кадр «свет + люди» → конечный кадр «темнота + те же люди» → видео между ними (люди двигаются, свет гаснет).
Люди — новые, обычные горожане в стиле серии; в каждой локации свой состав. Референс стиля людей: `civilians-concerned.png`.

```text
TASK D1 — Hotel Kazakhstan (01:05–01:06)
Step 1a (image, 9:16, refs hotel-kazakhstan-lit.jpg + civilians-concerned.png): "The exact image hotel-kazakhstan-lit, unchanged, plus small ordinary passers-by in the same 2D style at the correct scale near the entrance: a woman pulling a small suitcase, a man in a short jacket talking to his companion who looks at a phone. People shown full-body, natural proportions, different faces and clothes. No text."
Step 1b (image, 9:16, refs: chosen 1a + hotel-kazakhstan-blackout.jpg): "The same image as reference 1 with identical people in identical positions, but the hotel and street lights are off exactly as in hotel-kazakhstan-blackout; only the phone screen glows on the hand and face of the person holding it."
Step 2 (video): start_image = 1a, end_image = 1b, 5 s. Prompt: "The passers-by walk slowly; suddenly all the hotel windows and street lamps go out at once. The woman with the suitcase slows down and stops, the man turns to his companion, she raises her phone. Camera locked, building unchanged."
```

```text
TASK D2 — Ascension Cathedral (01:06–01:07)
Same 3 steps with ascension-cathedral-lit.jpg / ascension-cathedral-blackout.jpg.
People: "an adult pulling a child closer by the hand, on the path, not blocking the entrance or domes".
Video prompt: "They walk along the path; the cathedral lights go out at once; the adult stops, draws the child close and looks back at the dark facade. Camera locked."
```

```text
TASK D3 — Arbat pedestrian street (01:07–01:08)
Same 3 steps with arbat-lit.jpg / arbat-blackout.jpg. NO cars on the pedestrian alley.
People: "a young couple walking and talking, and an adult with a teenager".
Video prompt: "The couple walks and talks; the street lamps go out; they stop mid-step, one raises a phone and its light comes on, the teenager grabs the adult's sleeve. Camera locked."
```

```text
TASK D4 — Kok-Tobe cableway, one continuous shot (01:08–01:10)
start_image: koktobe-cableway-lit-v2.jpg, end_image: koktobe-cableway-reaction-v2.jpg. Aspect 9:16. Duration 6 s.
Video prompt: "One continuous shot of the gondola cableway over Almaty at night. The large silver cabin (a young man and a young woman) and the small green cabin (a different grey-haired woman with a bun in a mustard coat) glide along intact steel ropes, hanging plumb vertical from their hangers. The city lights below suddenly go out. The cabins slow down smoothly and stop without jumping. After a short pause: the man turns to the woman and presses a hand to his own chest, she puts her palm on the inside of the glass; the woman in the far cabin looks down and covers her mouth. No generator restart, no falling, no sparks, no extra people, camera locked."
```

```text
TASK D5 — dark city, traffic on battery lights (01:09,9–01:11,2)
start_image: city-blackout.jpg. Aspect 9:16. Duration 5 s.
Video prompt: "The dark city at night with mountains. On the avenue at the bottom, cars keep driving in their lanes with headlights and red tail lights, keeping distance from each other, wheels and light moving together with the car bodies. All windows and street lamps stay dark. Camera locked."
```

```text
TASK D6 — Aruzhan's taxi (01:13,4–01:15,6)
Step 1 (image, 9:16, ref city-blackout.jpg): "Street-level view of the same dark Almaty avenue at night as in the reference, all windows and lamps dark, a yellow taxi with a roof sign and a woman's silhouette in the back seat in the right lane, two other cars in separate lanes, headlights lighting the asphalt in front of the cars. Same 2D style. No readable text."
Step 2 (video, 5 s): "The yellow taxi drives through the dark avenue in its own lane, headlights on the asphalt; another car passes in the opposite lane; no car passes through another. Camera slowly pans with the taxi."
```

```text
TASK D7 — fighter jet over the city (00:24,9–00:27,4)
start_image: city-lit.jpg. image_references: fighter-jet.png. Aspect 9:16. Duration 5 s.
Video prompt: "A single dark fighter jet like the reference flies fast over the lit city from the lower left to the upper right in one straight path, small in the sky relative to the buildings, wings rigid, a faint heat shimmer behind it. The city stays still, slight camera shake as it passes. No missiles, no explosions, no long light beams."
```

---

## Пакет E — дверь, фасад, стол

```text
TASK E1 — the door in the flashlight (00:00–00:01,9 and 01:17,9–01:20,9, one clip for both)
start_image: door-flashlight.jpg. Aspect 9:16. Duration 6 s.
Video prompt: "The closed apartment door at night in the beam of a flashlight held by a hand in a white bathrobe sleeve from the lower left. The hand trembles slightly and then steadies, the light spot on the door moves a little with the hand. Three sharp knocks from the other side: the door jolts slightly in its frame with each knock, dust is NOT needed. The door stays closed, nobody is shown, no sparks or particles."
```

```text
TASK E2 — the old building, quiet street life (00:01,9–00:05,6)
start_image: historic-street.jpg. Aspect 9:16. Duration 5 s.
Video prompt: "Evening street at the corner of an old four-storey residential building. A few autumn leaves fall and drift; a lit window flickers as someone passes inside; the lamp above the entrance glows; a pedestrian walks along the far sidewalk. The building, its two blue street-name plates (keep them BLANK, no letters) and the camera stay completely still."
(Тексты табличек вставлю здесь сам, поэтому камера и таблички должны стоять неподвижно.)
```

```text
TASK E3 — the table trembles (00:21,8–00:24,9)
Step 1 (image, 9:16, ref room-lit-v3.jpg): "Close shot of the dining table from room-lit-v3: three noodle cups with steam, mugs of tea, salt shaker, pepper, bread on a plate, cutlery, napkins, a few crumbs, red-white checked tablecloth with a short overhang, table legs on the floor. Warm evening light."
Step 2 (video, 5 s): "First a weak vibration: the tea in one mug ripples, the salt shaker rattles a little. Then a stronger jolt: spoons clink, the cups shake but stay on the table and keep their size. The table and camera do not slide."
```

---

## Пакет F — голос (проба, необязательно)
Голоса серии 1 **нет** (в черновике v4 были только субтитры, эффекты и музыка: файлы озвучки потерялись, русские движки здесь удалены).
Если живого голоса не будет — проба в чате Claude через Higgsfield `text2speech_v2` (variant `elevenlabs`, у вас безлимит):

```text
TASK F1 — voice test, 3 lines (no video)
Use generate_audio with model text2speech_v2, variant elevenlabs, a calm low male Russian narrator preset voice (list the Russian-capable voices first and tell me which you picked). Generate 3 separate files:
F1_n01: «До конца света оставалось пять минут.»
F1_n09: «И весь Алматы погрузился во тьму.»
F1_n11 (whisper): «И в этой тьме кто-то застучал в дверь.»
Also one young male voice for a roommate: F1_d01: «Это что за хрень?!»
Send me the files and the voice IDs.
```
После вашего «ок» по пробе — весь текст серии одним заданием (список реплик дам).

---

## Как вернуть результат
Файлы `<ID>_start_vN.png` и `<ID>_vN.mp4` — прямо в этот чат (можно архивом < 30 МБ) + строка «ID — job ID — модель — что не так».
Я проверю: действие читается (начало → результат), руки цельные, хват держится, лица и халат не меняются, свет гаснет без возврата,
машины не проезжают друг сквозь друга. Брак — конкретная правка промпта по этому одному заданию.

## Журнал
| ID | Старт (job) | Видео (job) | Модель | Итог | Причина отказа |
|---|---|---|---|---|---|
| B0 | | — | | | |
| S03 | | | | | |
| S07 | | | | | |
| S09 | | | | | |
| S12 | | | | | |
| S15 | | | | | |
| S17 | | | | | |
| S18 | | | | | |
| N07 | | | | | |
| S19 | | | | | |
| S22 | | | | | |
| S24 | | | | | |
| N01 | — | | | | |
| N08 | — | | | | |
| N02 | — | | | | |
| N03 | — | | | | |
| N04 | — | | | | |
| N06 | — | | | | |
| D1–D7 | | | | | |
| E1–E3 | | | | | |
| F1 | — | — | | | |
