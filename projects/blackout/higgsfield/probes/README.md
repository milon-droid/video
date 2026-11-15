# Пакет: три пробы для Higgsfield (серия 1, пересборка)

Запускать **в чате Claude** (там работает безлимит Higgsfield), не в Claude Code.

## Как пользоваться
1. Откройте новый чат Claude с подключённым Higgsfield.
2. Приложите 8 картинок из этой папки (персонажи анфас/профиль и две комнаты).
3. Вставьте целиком блок «Сообщение для чата» ниже.
4. Готовые клипы (MP4) и выбранные стартовые кадры пришлите в чат Claude Code. Я проверю их покадрово.

Картинки:
| Файл | Кто/что |
|---|---|
| `student-front-v3.png`, `student-profile-v3.png` | C1: кудрявый, клетчатая рубашка |
| `blue-front-v3.png`, `blue-profile-v3.png` | C2: парень в синем спортивном костюме |
| `dias-robe-front-v3.png`, `dias-robe-profile-v3.png` | C3: Диас, очки, белый халат |
| `room-lit-v3.jpg` | общая комната квартиры (ТВ, стол, компьютер) |
| `study-cozy-room.jpg` | рабочий уголок C1 (стол, тетрадь, монитор, стул) |

---

## Сообщение для чата

```text
I attached 8 reference images for a 2D animated series. Please make 3 short test clips with Higgsfield. They're tests of motion quality before the full episode, so follow the steps exactly and don't add anything.

For EACH test do two steps:
STEP 1 — start frame. Generate an image (9:16 vertical, 2 variants) using the listed character and room references as image references. Keep the exact flat 2D illustration style, faces, hair, clothing, proportions and room. No text, captions or logos. Show me the variants and pick the one with the cleanest anatomy (whole arms, hands attached, correct seated pose, props touching hands).
STEP 2 — video. Animate the chosen frame: model seedance_2_0 (use my unlimited generations), mode std, 720p, 9:16, duration 5 s, generate_audio false. start_image = chosen frame; image_references = the two character views for that test. If seedance_2_0 is unavailable, use kling3_0 with the same frame.
Then show me the result and tell me the job IDs of the image and video, the model and the settings used. If a clip has broken arms, extra hands, a sliding grip or a changed face, say so and redo that test once with a corrected start frame.

Shared style rules for every video prompt (append to each):
"Restrained flat 2D illustration style identical to the start frame. Ordinary young university students, natural faces, no glamour, no 3D or photorealism. One clear physical action with preparation, action and a natural settle. Stable anatomy, continuous sleeves, coherent elbows and wrists, attached hands, grounded feet, stable props. Camera locked: no zoom, no pan. No generated text, captions, logos or UI. Do not replace the performance with camera motion over a frozen picture. No pose teleportation, no object disappearance, no dancing, no generic body sway."

TEST C1 — curly-haired student at his desk
Refs: student-front-v3.png, student-profile-v3.png, study-cozy-room.jpg
Start frame prompt: "The curly-haired student in the short red plaid shirt and dark trousers sits correctly on the dark chair at the wooden desk from the room reference, three-quarter view facing the desk, pelvis on the seat, both slippers flat on the rug. Open notebook in front of him, pen in his right hand touching the page, left forearm resting on the desk. Monitor and keyboard on the desk. Evening, warm desk-lamp light."
Video prompt: "He reads the notebook and writes a short line with the pen. He hears his roommates, stops writing, his eyes shift toward them first, then his head turns slightly, and he raises his left palm in a small irritated 'give me a moment' gesture, shoulder and elbow leading, wrist and fingers finishing. Then the hand returns to the desk and he looks back at the notebook. He stays seated the whole time, feet planted, chair fixed under him."

TEST C2 — student in navy tracksuit with phone
Refs: blue-front-v3.png, blue-profile-v3.png, room-lit-v3.jpg
Start frame prompt: "The young man in the navy tracksuit with white side stripes stands in the room from the reference, medium-full shot from the knees up, slight three-quarter angle. He holds a smartphone in his right hand at chest height, screen facing him, thumb resting on the glass; left arm relaxed at his side. TV on the wall and the table behind him. Evening, warm ceiling light."
Video prompt: "He looks down at the phone and makes one clear swipe with his thumb on the screen. He waits a beat, frowns slightly at the screen, then lifts his eyes and glances to his left toward a roommate off-screen, head following the eyes. The phone stays in the same hand with a firm grip; his body stays calm."

TEST C3 — Dias ironing in a white bathrobe
Refs: dias-robe-front-v3.png, dias-robe-profile-v3.png, room-lit-v3.jpg
Start frame prompt: "The young man with short black hair, dark rectangular glasses and a tied white bathrobe stands behind a blue ironing board in the room from the reference, medium shot, three-quarter view. A light-blue shirt lies flat on the board. His right hand grips the handle of a white steam iron whose sole rests on the shirt; his left hand holds the shirt collar flat, away from the iron. The board's legs stand on the floor. Evening, warm ceiling light."
Video prompt: "He makes one short pass with the iron, the sole sliding on the shirt fabric while the left hand keeps the cloth smooth. A sudden distant noise: he stops, sets the iron upright on the board, his eyes lift first, then his head turns toward the sound; his shoulders react slightly after the glance. The board stays fixed on the floor; the iron, fingers and wrist stay connected."
```

---

## Что я проверю у присланных клипов (из ТЗ, раздел 11)
- Действие читается: есть начало и результат, двигается герой, а не камера.
- Анатомия: цельные рукава, нужное число рук, кисти на месте, стопы и таз опираются.
- Контакт: ручка на бумаге, палец на экране, подошва утюга на ткани, герой сидит на стуле.
- Лицо и одежда не меняются за клип.

Удачный способ разошлём на все планы серии (таблицы S и N в ТЗ). Неудачный исправим на этих же пробах.

## Журнал клипов
| Тест | Стартовый кадр (job ID) | Видео (job ID) | Модель/настройки | Итог | Причина отказа |
|---|---|---|---|---|---|
| C1 | | | | | |
| C2 | | | | | |
| C3 | | | | | |
