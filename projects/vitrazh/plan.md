# «PIECES» (vitrazh) — план
Стиль (новый): **живой витраж** — мир из цветного стекла в свинце, свет сзади (небо/солнце/лампа/рассвет), фактура стекла (волны, пузырьки,
толщина, преломление солнца), грязь у свинца, ореол; лица и складки — гризайль (краска по стеклу), моргают и говорят.
Переходы: экран бьётся на 3D-осколки от удара; сборка витража из летящих кусков; свет за стеклом гаснет/вспыхивает.
Звук: живые записи стекла, колокол, собор, хор; музыка — синтез «стеклянной гармоники» и стеклянных колокольчиков (ре мажор, тема).
Смысл: витраж — это разбитое стекло, которое кто-то отказался выбросить. Без голоса, текст англ.
| t, с | план |
|---|---|
| 0–1.15 | ХУК: мальчик бьёт мяч прямо в камеру → трещины по экрану. «I WAS 8 WHEN I BROKE IT.» |
| 1.15–5 | Экран разлетается осколками; внутри мастерской — окно с дырой, в дыре испуганный мальчик. «IT WAS THE OLD GLAZIER'S WINDOW.» |
| 5–9.6 | Мальчик съёжился; стекольщик поднимает красный осколок к солнцу, смотрит сквозь него, улыбается. «HE DIDN'T YELL.» → «HE SAID: BRING ME EVERY PIECE.» |
| 9.6–13.4 | Закат: мальчик собирает осколки в ящик. «EVERY. SINGLE. PIECE.» |
| 13.4–18.4 | Ночь, лампа: стекольщик паяет узор из осколков, искры; мальчик в восторге. «NOTHING HERE GETS THROWN AWAY.» |
| 18.4–24 | Годы: AGE 10 (весна) / 14 (осень) / 18 (зима); учится резать, паять, поднимает свою первую панель. «HE TAUGHT ME FOR TEN YEARS.» |
| 24–28.4 | Руки дрожат, синий кусок падает и бьётся; стекольщик хохочет: «HA! MORE PIECES.» |
| 28.4–33.4 | Зима, пустой табурет, фартук на крючке; по лицу юноши идёт трещина. «THEN HE WAS GONE.» колокол |
| 33.4–39 | Ящик под верстаком: осколки того самого окна + эскиз витража и записка «I kept every piece. Finish it.» |
| 39–46 | Сборка витража из летящих кусков, свинец и искры; трещина на лице юноши заполняется золотым свинцом, он улыбается |
| 46–52 | Собор на рассвете: витраж зажигается, цветной свет на полу; девочка роняет чашку, мужчина (повзрослевший) встаёт на колено: «BRING ME EVERY PIECE.» |
| 52–58.5 | Витраж крупно: «A STAINED GLASS WINDOW IS JUST BROKEN GLASS / THAT SOMEONE REFUSED TO THROW AWAY.» → «PIECES» |
## Карта кода
src/engine.js — E: холсты G (цвет стекла), M (R свинец, G гризайль, B семя куска), T (R тип стекла, G силуэт, B свечение), O (надписи поверх);
  E.piece/lead/mosaic, краска E.pline/pfill/pgrad/pvig/pscratch, свечение E.emit/emitDot, E.banner (лента-филактерия), E.obanner (поверх);
  шейдер 1 — стекло на свету (E.L: небо/солнце/лампа), шейдер 2 — ореол, интерьер собора (E.FX.room, win, лучи, проекция на пол, силуэты), плёнка;
  осколки E.shatter={key,cx,cy,u,draw} (3D-треугольники со снимком); сборка E.ASM(idx)->{u,dx,dy} + E.flushASM; E.SIL — рисовать силуэтом.
src/chars.js — C.head (лицо гризайлем: моргание, брови, рот smile/laugh/o/frown/sad, очки-свинец, трещина crack + heal золотом), C.fig (old/man/youth/boy/girl; углы: + вперёд), C.fold.
src/world.js — Wd.mood (day/eve/night/winter/dawn), sky/sun/hills/house/church, wall/window/shelf/table/lamp, shard/box/ball/iron/sparks/snow, cracks, design (финальный витраж).
src/story.js — 12 планов + cue() → audio/cues.json (node cues.cjs).
audio/score.py — микшер: записи audio/rec (Freesound CC0, CREDITS.md) + sfx-kit, синтез гармоники harm()/bell()/arp(), хор, свёртка-зал.
Рендер: node render.cjs render/vit_raw.mp4 (~?) → python3 ../../tools/master.py render/vit_raw.mp4 render/vitrazh.mp4 --audio audio/mix.wav; лист: node stills.cjs out.png t…
Шрифты: Cinzel, Cormorant Garamond (OFL). Подпись: «A stained glass window is just broken glass someone refused to throw away. 🪟» #stainedglass #animation #shortfilm
## Статус
- v1 (2026-11-26): движок, 12 планов, звук, рендер 720p — сдаётся на отзыв
