# «Попал», серия 1 — перерисовка ключевых поз Макса

Созданы встроенной генерацией изображений по кадрам `popal-ep1-draft4.mp4`. Все три файла — PNG с прозрачным фоном, каждый содержит отдельную опорную позу. Это рисунки для дальнейшей анимации, а не готовые анимированные сцены и не послойный риг.

## Файлы и применение

| Файл | Куда поставить | Что исправляет |
|---|---|---|
| [Падение со сковородой](max-falling-with-pan-transparent.png) | 01:07,7–01:10, затем согласовать с падением в воду | Предмет остаётся в той же руке после портала. |
| [Замах](max-pan-windup-transparent.png) | 01:30,5–01:32,3, перед существующим полётом | Видно, что замахивается рука со сковородой. |
| [Отпускание](max-pan-release-transparent.png) | После замаха, перед планом летящего оружия | Видны раскрытая кисть и отделившаяся сковорода; направление — влево по экрану. |

Во всех позах бросающая рука — анатомически левая рука Макса: в исходном фронтальном кадре она справа для зрителя. При броске она проходит перед грудью влево. Не зеркалить только одну фазу.

## Указания для сборки

- Подогнать масштаб персонажа к исходной сцене по голове и росту. В замахе и отпускании совместить положение опорных стоп, чтобы они не скользили.
- Сковорода в отдельных генерациях немного отличается по масштабу и углу. Для окончательной анимации использовать один рисунок сковороды отдельным слоем: привязать к кисти до отпускания, затем отсоединить и продолжить полёт. Привести диаметр и длину ручки к исходному реквизиту.
- Между замахом и отпусканием нужны промежуточные положения руки, поворот корпуса и перенос веса. Простая смена двух PNG даст скачок.
- Рисунки приближают стиль ролика, но имеют немного более мягкую заливку. При финальной сборке согласовать плоские цвета и пропорции с исходной моделью Макса.
- При падении предмет вращается вместе с кистью. Для сцены в пруду отдельно показать, где сковорода оказалась и как Макс её поднимает.
- Возврат после попадания и последующее падение оружия всё ещё требуют отдельных фаз; эти три рисунка их не заменяют.

## Референсы

- [Исходная модель и рука со сковородой, 01:07](popal-ep1-draft4-evidence/01-07-pan.jpg)
- [Детали сковороды, 01:01,5](popal-ep1-draft4-evidence/01-01-pan-detail.jpg)

## Полные промпты

Первые два промпта использовали оба исходных кадра выше. Для третьего референсом служил уже созданный рисунок замаха.

### 1. max-falling-with-pan-transparent.png

```text
Use case: illustration-story.
Asset type: full-body transparent PNG key pose for the existing 2D animated video.
Reference images show the SAME original character Max; image 1 is the primary identity, proportions, palette and flat cartoon style reference, image 2 shows the frying pan. Redraw Max as the identical character: big round head, dark brown spiky hair with three distinct pointed tufts and a subtle brown arc highlight, large brown eyes, pale warm skin, no facial hair, small adult slim body, slate blue hoodie with off-white drawstrings and kangaroo pocket, dark navy slim trousers, simple grey shoes with red soles. Match the source's simple flat vector-like cutout animation, restrained polygon shading, clean shapes, no ink outline, no texture, no 3D. Preserve the original elongated legs and head/body proportions; do not turn him into a toddler.
The frying pan is a single dark charcoal circular bowl with grey interior oval highlight and a straight brown handle. At the start Max holds it in HIS ANATOMICAL LEFT HAND (the hand on the viewer's RIGHT in the frontal reference). Keep this handedness.
Single character, entire body and entire pan comfortably inside the canvas with generous clear margins, transparent alpha background. No environment, HUD, subtitles, text, captions, portal, goose, duplicated limbs, duplicated pan, motion trails or shadow ground plane.
Pose: Max falling through the air after the portal at 01:07–01:10. His body is diagonally tilted, head toward upper left, feet toward lower right, both knees slightly bent and feet separated. Alarmed wide eyes and open mouth. His anatomical left arm reaches outward on the viewer-right side and that hand clearly wraps securely around the brown pan handle; the pan remains firmly in his grip and follows his wrist. Other hand open for balance. Show both legs, both shoes, two anatomically coherent arms and a clearly readable pan silhouette. This is a falling pose, not a standing pose.
```

### 2. max-pan-windup-transparent.png

```text
Use case: illustration-story.
Asset type: full-body transparent PNG key pose for the existing 2D animated video.
Reference images show the SAME original character Max; image 1 is the primary identity, proportions, palette and flat cartoon style reference, image 2 shows the frying pan. Redraw Max as the identical character: big round head, dark brown spiky hair with three distinct pointed tufts and a subtle brown arc highlight, large brown eyes, pale warm skin, no facial hair, small adult slim body, slate blue hoodie with off-white drawstrings and kangaroo pocket, dark navy slim trousers, simple grey shoes with red soles. Match the source's simple flat vector-like cutout animation, restrained polygon shading, clean shapes, no ink outline, no texture, no 3D. Preserve the original elongated legs and head/body proportions; do not turn him into a toddler.
The frying pan is a single dark charcoal circular bowl with grey interior oval highlight and a straight brown handle. At the start Max holds it in HIS ANATOMICAL LEFT HAND (the hand on the viewer's RIGHT in the frontal reference). Keep this handedness.
Single character, entire body and entire pan comfortably inside the canvas with generous clear margins, transparent alpha background. No environment, HUD, subtitles, text, captions, portal, goose, duplicated limbs, duplicated pan, motion trails or shadow ground plane.
Pose: a clear throwing WIND-UP for the action at 01:30–01:32, preparing to throw toward IMAGE LEFT. Max faces mostly the camera, turned a little to image left, eyes looking image left, determined expression. His anatomical LEFT arm on viewer-right is the throwing arm; shoulder raised, elbow bent, gripping the pan handle beside and above his viewer-right shoulder, ready to sweep across his body toward image left. The pan is still held, not airborne. His other arm extends a little toward image left for balance. Knees slightly bent, both shoes planted apart. Ensure the throwing hand connects naturally to the sleeve and handle; clearly show the bent elbow, forearm and pan. No extra arms.
```

### 3. max-pan-release-transparent.png

```text
Use case: illustration-story.
Asset type: transparent full-body animation key pose, immediate FOLLOW-THROUGH after the wind-up in image 1.
Input image 1: exact character, style, costume, dimensions, face identity and preceding wind-up pose. Preserve all these design invariants. This is Max from the same 2D cartoon, slate-blue hoodie, navy slim trousers, grey shoes with red soles, spiky dark brown hair, large brown eyes. Preserve the restrained flat 2D shading; no new illustration style or rendering.
Change only the action to the next key pose: Max has JUST THROWN the pan toward IMAGE LEFT. His anatomical LEFT arm (formerly the raised throwing arm on image-right) now sweeps diagonally ACROSS THE FRONT OF HIS CHEST toward image-left, naturally connected to its original shoulder on image-right. This throwing arm stays clearly in front and is visible all the way from shoulder to elbow to wrist. Its hand is open, fingers extended toward the released pan. The brown handle has just separated from that open hand by a small visible gap. The pan is entirely airborne at the far IMAGE LEFT, round charcoal bowl and grey inner oval highlight, brown handle pointing back toward the open hand. This one pan is clearly separated from the hand; no second pan in the original wind-up location.
His OTHER arm is lowered behind/beside his body on image-left for balance, its hand near his hip, so there is no confusing second outstretched arm. Torso follows through, knees slightly bent, shoes planted, gaze follows pan to image-left, focused eyebrows. Anatomy must be coherent: two arms, no disconnected limbs, no arm switching; exactly one pan.
Composition: SINGLE full-body character and entire pan, generous empty margins on all sides, no cropping. Transparent alpha background, no scene, ground, motion lines, HUD, words, labels or watermark. This is a clean key pose, not a collage or multi-frame sheet.
```

