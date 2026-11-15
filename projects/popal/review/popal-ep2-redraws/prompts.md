# «Попал», серия 2 — промпты для перерисовки

Созданы встроенной генерацией изображений по референсам из ролика. Оригинальные кадры включены в папку `references`. У каждого результата сохранён исходный альфа-канал.

## 01-rescue-net-opening.png

Освобождение: раскрытие сети. Таймкод: **00:22,7–00:23,3**.

Референсы в порядке передачи: [references/frame_023.000.jpg](references/frame_023.000.jpg), [references/frame_024.000.jpg](references/frame_024.000.jpg).

```text
Use case: illustration-story.
Asset type: transparent PNG key pose to repair the existing 2D cartoon video, not a new character redesign.
Style: match the supplied video's simple flat 2D cutout/vector-like cartoon exactly: clean geometric shapes, almost no outlines, flat matte fills and only one restrained shade per shape, no surface texture, no 3D volume, no photorealism, no painterly rendering. Preserve the reference head/body proportions and narrow elongated legs. The subjects are young ADULTS represented as stylized cartoon avatars.
Max: identical angular round head, short dark brown spiky hair with three crown points and brown arc highlight, big brown eyes, light warm skin, slate blue hoodie with off-white drawstrings and kangaroo pocket, navy slim trousers, grey shoes with red soles.
Lira: identical long straight golden blonde hair, long pointed elf ears with pink interiors, emerald green eyes and thick black eyelashes, gold forehead band with green central diamond, three green dangling ear ornaments, cream long-sleeved V-neck tunic with thin gold trim, brown belt and gold buckle, dark green leggings, flat brown boots, dark green cape. Keep the costume fully clothed.
Composition: ONE key pose only, whole figures and all props fully inside frame, at least 8% empty margins, no clipping or edge tangencies. Actual transparent alpha background. No forest, ground plane, HUD, subtitles, letters, logos or watermark. No extra people, extra limbs, missing limbs or disconnected hands.
References: image 1 is the existing suspended-net scene and exact character models; image 2 shows Lira upright for costume details. Redraw a missing transition, preserving these identities.
Action: Max is lower LEFT, feet planted wide, knees flexed, looking upward with alarm, BOTH arms reaching up toward Lira to catch her. NO bruise on Max yet. Lira is above and to the RIGHT of him, still mostly upside down, head lower than her feet, just sliding out of the OPEN SIDE of a loosened brown diamond-mesh rope net. Show a visibly broken short top suspension cord and the net peeling away behind her, leaving her head, both arms and torso clearly visible instead of tangled in front of her face. Her hair hangs down with gravity, cape falls toward her head. Her expression is surprised. The two bodies and open net must be clearly separable; no ropes through flesh, no body teleportation. No branch needed; show only the short broken hanging cord attached to net. Max's palms are below her upper body, not yet touching. No frying pan or bow here; they are out of this shot during the catch. All clothing remains covering her torso and hips even upside down.
```

## 02-rescue-catching-lira.png

Освобождение: ловля. Таймкод: **00:23,3–00:23,6**.

Референсы в порядке передачи: [01-rescue-net-opening.png](01-rescue-net-opening.png), [references/frame_024.000.jpg](references/frame_024.000.jpg).

```text
Use case: illustration-story.
Asset type: transparent full-body PNG key pose 2 of the rescue action.
Image 1 locks the EXACT existing Max and Lira character identities, costumes, proportions, hair, faces, colors and flat 2D cutout style. Image 2 is the original video reference for Lira's outfit. Preserve all these designs, no new costumes, no 3D, texture or detailed rendering. These are stylized young adult avatars.
Action: immediately after the upside-down fall, Lira has rolled sideways and Max CATCHES HER ACROSS BOTH FOREARMS. Max is toward image LEFT, facing a little right, both feet on the same ground level, stance wide, knees deeply BENT under the unexpected weight, torso leaning backward as he starts to lose balance. Alarmed big brown eyes. No slap mark yet. His two elbows are bent, connected naturally to two sleeves. One forearm clearly supports Lira's UPPER BACK and SHOULDERS, the other supports her THIGHS near the knees; neither hand grips her neck or head.
Lira is now diagonal/horizontal across his arms, head toward image-left and bent knees/boots toward image-right. Her face looks startled at Max. Both her arms are visible and extended for balance, her hair and green cape flow down and to the side. Cream tunic, belt, green leggings fully cover her; flat brown boots, jewelry and forehead green diamond unchanged. There must be TWO complete coherent bodies, four arms total, four legs total, all connected. Clearly separate Max's supporting forearms from Lira's arms; no merged limbs.
A loosened empty brown rope net is crumpled on the lower RIGHT beside them, no longer around Lira, in the same flat geometric diamond mesh as image 1. No suspended net, no second Lira, no bow or pan (the airborne pan is handled separately in animation).
Single continuous key pose, not a sequence sheet. Full figures, net, hands and shoes completely visible with ample clear margins. Transparent alpha background; no ground plane, environment, shadows, motion trails, text, HUD or effects.
```

## 03-rescue-soft-landing.png

Освобождение: мягкая посадка. Таймкод: **00:23,6–00:24,2**.

Референсы в порядке передачи: [01-rescue-net-opening.png](01-rescue-net-opening.png), [references/frame_024.000.jpg](references/frame_024.000.jpg).

```text
Use case: illustration-story.
Asset type: transparent PNG final key pose of the comic rescue landing.
Image 1 fixes Max and Lira's exact existing faces, clothing, proportions and simple flat vector-like 2D cutout style. Image 2 is the original video's target composition after landing, but correct the anatomically rigid floating bodies.
Draw the SAME two fully clothed young adult cartoon characters. Max has fallen backward and is LYING on his BACK, head at IMAGE LEFT, torso horizontal, legs extending to IMAGE RIGHT. His head and shoulders rest on the implied ground; one knee bends slightly and the other leg lies down. Both grey shoes/red soles are visible, both slate-blue hoodie sleeves and both open hands spread to the sides naturally. No slap bruise yet; surprised face looking upward, open mouth. Keep his short dark spiky hair, big brown eyes and narrow body.
Lira has landed safely upright seated ACROSS HIS LOWER TORSO/UPPER THIGHS in the same slapstick arrangement as image 2, not intimate or sexual. She faces mostly viewer, slightly to left, balancing with both visible hands near her own knees. Both green-clad legs are bent, both brown boots visibly rest on the implied ground alongside Max. Her cream gold-trimmed tunic, belt, green cape and long blonde hair cover her normally, long pink elf ears, green eyes, forehead diamond and green earrings match source. Her face is surprised and flustered. Show the weight and contact with small bends in Max's torso and limbs, not a rigid upright sprite rotated 90 degrees. No limbs passing through the other body.
The loosened empty brown diamond-mesh net lies crumpled on the ground at far RIGHT, separate from their feet. No pan or bow in this pose; the pan trajectory is a separate animation layer.
Single key pose only, TWO bodies, no duplicate heads or extra limbs. Wide composition fits entire Max head-to-shoes and entire Lira including hair and net, all with generous transparent margins. True transparent alpha background, no forest, ground slab, dust, glow, HUD, captions or watermark. Match the original clean flat illustration, no new textured or realistic rendering.
```

## 04-max-touching-lira-ear.png

Касание уха. Таймкод: **00:32–00:34**.

Референсы в порядке передачи: [references/frame_032.500.jpg](references/frame_032.500.jpg).

```text
Use case: illustration-story.
Asset type: transparent PNG key pose to repair the existing 2D cartoon video, not a new character redesign.
Style: match the supplied video's simple flat 2D cutout/vector-like cartoon exactly: clean geometric shapes, almost no outlines, flat matte fills and only one restrained shade per shape, no surface texture, no 3D volume, no photorealism, no painterly rendering. Preserve the reference head/body proportions and narrow elongated legs. The subjects are young ADULTS represented as stylized cartoon avatars.
Max: identical angular round head, short dark brown spiky hair with three crown points and brown arc highlight, big brown eyes, light warm skin, slate blue hoodie with off-white drawstrings and kangaroo pocket, navy slim trousers, grey shoes with red soles.
Lira: identical long straight golden blonde hair, long pointed elf ears with pink interiors, emerald green eyes and thick black eyelashes, gold forehead band with green central diamond, three green dangling ear ornaments, cream long-sleeved V-neck tunic with thin gold trim, brown belt and gold buckle, dark green leggings, flat brown boots, dark green cape. Keep the costume fully clothed.
Composition: ONE key pose only, whole figures and all props fully inside frame, at least 8% empty margins, no clipping or edge tangencies. Actual transparent alpha background. No forest, ground plane, HUD, subtitles, letters, logos or watermark. No extra people, extra limbs, missing limbs or disconnected hands.
Input image is the edit target and identity reference. Correct the hand/ear contact while preserving the original left-right staging. Max stands on IMAGE LEFT and Lira on IMAGE RIGHT, both full body and mostly frontal. Max has the pink-red slap mark on HIS RIGHT cheek, which is on the viewer's LEFT in this frontal pose. Fix that mark to that cheek; do not mirror it. Max smiles curiously at her ear.
Max's LEFT arm, on viewer-right, is raised toward the outer tip of Lira's RIGHT elf ear, the ear nearest him. Show the ENTIRE hand visibly IN FRONT of the ear against transparent negative space: index fingertip gently touches the outside ear tip; thumb and other fingers naturally curl below it, not buried in hair, not gripping the face, no finger inside ear. The wrist connects naturally to the hoodie sleeve. Lira's ear is slightly tilted from the light touch and she has a flustered mildly irritated blush, looking sideways at him. Separate fingers from hair and earrings with clear readable shapes.
Place one charcoal frying pan with grey oval interior highlight and a straight brown handle lying beside Max's outer foot at bottom-left, fully visible and separate, to show he put it down to free his hand. No second pan. Lira's brown bow remains slung diagonally behind her shoulder as in reference. Two characters only. No text or effects.
```

## 05-back-to-back-bow-drawn.png

Спиной к спине: натяжение лука. Таймкод: **01:05–01:08**.

Референсы в порядке передачи: [references/frame_065.500.jpg](references/frame_065.500.jpg), [references/frame_032.500.jpg](references/frame_032.500.jpg).

```text
Use case: illustration-story.
Asset type: transparent PNG key pose to repair the existing 2D cartoon video, not a new character redesign.
Style: match the supplied video's simple flat 2D cutout/vector-like cartoon exactly: clean geometric shapes, almost no outlines, flat matte fills and only one restrained shade per shape, no surface texture, no 3D volume, no photorealism, no painterly rendering. Preserve the reference head/body proportions and narrow elongated legs. The subjects are young ADULTS represented as stylized cartoon avatars.
Max: identical angular round head, short dark brown spiky hair with three crown points and brown arc highlight, big brown eyes, light warm skin, slate blue hoodie with off-white drawstrings and kangaroo pocket, navy slim trousers, grey shoes with red soles.
Lira: identical long straight golden blonde hair, long pointed elf ears with pink interiors, emerald green eyes and thick black eyelashes, gold forehead band with green central diamond, three green dangling ear ornaments, cream long-sleeved V-neck tunic with thin gold trim, brown belt and gold buckle, dark green leggings, flat brown boots, dark green cape. Keep the costume fully clothed.
Composition: ONE key pose only, whole figures and all props fully inside frame, at least 8% empty margins, no clipping or edge tangencies. Actual transparent alpha background. No forest, ground plane, HUD, subtitles, letters, logos or watermark. No extra people, extra limbs, missing limbs or disconnected hands.
Reference image 1 provides costumes and weapons, NOT the flawed frontal pose. Image 2 locks Max's slap mark to his right cheek (viewer-left in a frontal view).
Draw a TRUE BACK-TO-BACK defensive stance: Max on IMAGE LEFT in a left-facing three-quarter PROFILE, Lira on IMAGE RIGHT in a right-facing three-quarter PROFILE. Their upper BACKS/shoulder blades touch at the center. They look in OPPOSITE directions, outward away from one another, NOT both toward camera. Their legs are separately visible, knees slightly bent, weight planted. Keep their original slim proportions.
Max holds his ONE frying pan by the brown handle securely in HIS LEFT hand, out in front toward IMAGE LEFT at shoulder height, ready to block/strike. Bowl charcoal with grey inner oval highlight. Keep pan and both feet fully visible. Right hand balances at waist. Pink slap mark remains on his anatomical right cheek.
Lira aims her brown wooden recurve bow toward IMAGE RIGHT. Her LEFT hand holds the bow grip at arm's length; her RIGHT hand draws the white string back to the corner of her cheek, elbow behind her. A single wooden arrow is correctly nocked, resting on bow, horizontal, arrowhead points RIGHT. The arrow and bow stay entirely on Lira's right side of the composition and never pass through Max. Clearly show two hands, full curved bow and triangular taut string, fingers touching string, straight arrow shaft aligned with aim. Determined faces. No enemies, fire, smoke, glow, speed lines or floating arrows. Sufficient wide composition to contain both weapons and both whole figures.
```

## 06-back-to-back-arrow-released.png

Спиной к спине: отпускание стрелы. Таймкод: **01:05–01:12, фаза после натяжения**.

Референсы в порядке передачи: [05-back-to-back-bow-drawn.png](05-back-to-back-bow-drawn.png).

```text
Use case: illustration-story.
Asset type: transparent PNG next animation key pose immediately after the archery wind-up in the supplied image.
Input image is the exact edit target: PRESERVE BOTH original cartoon characters, identities, faces, flat 2D cutout style, costumes, body proportions, the true opposite-facing back-to-back stance, Max on image-left aiming pan LEFT and Lira on image-right aiming bow RIGHT. No restyling.
Change ONLY Lira's shooting action to the moment JUST AFTER THE ARROW LEAVES THE BOW. Her LEFT bow-holding arm stays extended straight toward image-right in exactly the same position. Her RIGHT string hand has released with relaxed open fingers and moved a little backward beside her jaw in the natural follow-through. Her bow string is now straight/resting from upper to lower bow tip, no longer stretched to her cheek. The arrow is no longer on the string or in her right hand.
Exactly ONE full wooden arrow is airborne to the RIGHT of the entire bow, horizontal, arrowhead points RIGHT, a small clear gap between its rear feather/nock and the bow. It must not overlap her face, hand, Max, pan or any body. Keep full arrow visible with empty space beyond its point. Widen the transparent canvas toward the RIGHT as needed rather than cropping the arrow or shortening it into a dart. Both characters' feet remain planted and upper backs touch; Max's raised frying pan and pose stay unchanged, pink slap mark stays on the SAME anatomical cheek as reference.
No motion lines, arrow duplicates, target, opponents, text, subtitles, stage, fog or environmental background. Full body and full equipment, generous margins, actual transparent alpha. This is ONE key pose, not a multi-frame sheet.
```

## 07-liliana-full-body.png

Лилиана: цельная фигура для **обеих серий**. Серия 1: **01:44–01:46**, первое представленное появление в тронном зале. Серия 2: **01:36–01:40**, появление у Макса. Промпт ниже использовал кадр второй серии как референс внешности; он не ограничивает применение рисунка только этой серией.

Референсы в порядке передачи: [references/frame_096.500.jpg](references/frame_096.500.jpg).

```text
Use case: illustration-story.
Asset type: FULL BODY transparent PNG of Liliana for the supplied 2D cartoon.
Input image: exact appearance and flat visual style reference for the purple-haired horned demon woman on image-right ONLY. Do not include Max, slime, background, HUD, mist, text or campfire.
Preserve her exact recognizable face and design: pale lavender-pink skin, narrow fuchsia eyes with dark lashes, small confident closed pink smile, long straight very dark purple hair forming a broad tapered silhouette, short rounded curved front fringe, two long black/dark-purple horns curving outward and upward, symmetrical pointed angular purple bat wings behind her shoulders.
Complete the currently cut-off torso into a coherent full body of a young ADULT woman in the SAME SIMPLE FLAT 2D CUTOUT STYLE: matte solid colors, no outline, restrained one-step shading, same stylized head-to-body proportions as other adults in video. Long plain black-violet dress with the same broad square neckline as reference, fitted sleeves to wrists, modest long skirt to ankles, simple dark shoes visible below the hem. No lingerie, armor, jewelry or added fantasy decorations. Both relaxed arms and BOTH hands clearly visible at her sides, one hand turned slightly palm up in a welcoming conversational gesture. Upright stance, facing camera with a slight three-quarter turn toward IMAGE LEFT as she addresses Max. Full intact connected anatomy, complete dress hem, feet and wing tips visible.
True transparent alpha background with generous 8–10% empty margins on every side, no fog or magic baked into the silhouette, no rectangular crop across torso, no floating bust, no ground plane or shadow, no text, no watermark. This should drop into the existing scene, with its existing pink smoke added separately by the editor.
```

