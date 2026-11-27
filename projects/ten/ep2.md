# Серия 2 «The Date» (EN, 720p) — сценарий и раскадровка

Сериал — максимум 3 серии (пользователь, 2026-11-26): 1 «Shadow Quit» → 2 «The Date» → 3 финал «Without Them» (любовь, хэппи-энд).
Идея серии: тени могут встретиться только если хозяева рядом → тень Sam заставляет его позвать девушку (Mia — та самая с хвостиком из клиффхэнгера 1-й серии).
Двигатель комедии — правило №2: «днём тень копирует хозяина — когда кто-то смотрит». Поворот: тень Mia так же командует ею. Мысль: тени свели людей, а людям понравились они сами.

| # | Кадр | Реплики |
|---|------|---------|
| 1 ХУК | День, кафе. Sam застыл у двери с цветком; его тень на стене толкает его в спину двумя руками — он влетает внутрь | Sam: «My shadow has a crush. / Guess who has to ask her out.» Тень: «Move, Sam!» |
| 2 | Утро, коридор: на стене записка Term #5 + штамп DUE TODAY, тень стучит по ней | Sam: «Term five: introduce him to her owner.» Тень: «Today. Or I quit again.» |
| 3 | Зеркало/стена: тень примеряет цилиндр, бабочку | «Hat? Or no hat?» — «Dude, you're a shadow. Everything you wear is black.» — «Black is slimming.» |
| 4 | Окно-правило (рассказчик) | «Rule number two. In daylight, a shadow copies its owner.» + штамп «WHEN ANYONE'S LOOKING» |
| 5 | Кафе: Mia у окна с книгой; на стене её тень с хвостиком. Тень Sam — сердечки | «That's her. Ponytail. Ten out of ten.» — «Which one?» — «Both, dumbass. Go!» |
| 6 | Sam подходит, садится; на стене тени робко косятся друг на друга | «Hi. Is this seat... taken?» — Mia: «It is now.» |
| 7 | Шёпот тени: наклоняйся → тени на стене ближе → локоть сбивает чашку | «Lean in.» «Closer...» — «Shit! Sorry!» |
| 8 | Руки ползут по столу; на стене ладони теней касаются — искры; у людей руки касаются — оба отдёрнули | «Now. Her hand.» |
| 9 ПОВОРОТ | Mia шипит на свою тень. Оба смотрят на стену — тени замерли «как положено» и насвистывают | Mia: «Stop it! He'll notice!» Sam: «Did your shadow just tell you to touch my hand?» Mia: «...Did yours?» |
| 10 | Смех; знакомство; на стене тени обнимаются и кружатся — бариста роняет поднос (правило нарушено) | «Mine dragged me here. Three blocks.» «Mine shoved me through the door.» «I'm Mia.» «Sam.» |
| 11 | Закат, прогулка: люди идут на расстоянии, их длинные тени на асфальте держатся за руки, кружатся | Sam: «We talked for three hours. / The shadows never stopped dancing.» |
| 12 | Ночь, дверь Mia под фонарём. Тени тянутся поцеловаться — хозяевам надо наклониться… фонарь гаснет | «Sam. Lean. LEAN!» → темно, только глаза: «No. No no no no!» |
| 13 | Фонарь снова горит. Mia на ступеньке | «Sam? Next time... ...without them.» Тень: «Without WHO?!» |
| 14 | Sam идёт домой довольный, тень дуется на стене | «Stargazing. Zero light. Zero shadows.» — «You sneaky little shit.» |
| 15 | Финальная плашка | «Should I go... without him?» / Tell us in the comments / FINAL EPISODE · without them |

## Статус
- 2026-11-26: сценарий написан (полная воля), голос `vo/ep2-en.json` → `vo/ep2en/` (новая роль `mia_en`). Код — `three/src/ep2.js` + `index-ep2.html`.
- 2026-11-26: пользователь: «Сначала дай без озвучки, потом разберемся если сценарий ок» → синтез голоса остановлен (готово 15 реплик в vo/ep2en),
  v1 без голоса: реплики текстом, музыка `audio/ep2/score2.py`, звуки `audio/ep2/build_sfx2.py` → `mix2-novo.wav`. Рендер `render/ep2-v1-video.mp4` → `shadow-quit-ep2-v1-novo.mp4`.
  Монтаж и время реплик — `three/src/ep2-lines.js` (`build(durs)`: план удлиняется под реплики); длительности — `audio/ep2/durs.py`.
  Сборка: `python3 audio/ep2/durs.py` → esbuild `src/ep2.js` → `dist/bundle-ep2.js` → render `index-ep2.html`; превью `bash three/sheet2.sh out.jpg t…`.
- 2026-11-27 v2 (по отзыву, реестр `ep2-trebovaniya.md` п.3–17): холодное начало (тени целуются, хозяева деревянные) → ◀◀ REWIND → флэшбек LAST NIGHT
  (тень удрала) → Sam троллит, тень стесняется → Term #5: угроза-манипуляция → «Manipulation again?» → «Sorry. I really like her, man. Please.» →
  гэг с котом (Пиксель отбирает цилиндр) → правило №2 «A shadow can't leave its owner. *Unless it quits» → поиск (хвост Пикселя, метла, хвостик в окне)
  → дверь (за ней зал) → кафе (одна чашка — Mia; рука-резина тени не дотягивается: «Fucking leash. WALK!») → прогулка: тени танцуют, дип, поцелуй
  → ночь: фонарь гаснет → тень Mia увольняется и уходит к тени Sam → «Where's my shadow?!» → RULE #1: TILL SUNSET → «Will Mia make it to sunset?» (~1:59).
- 2026-11-27 v3 с озвучкой: основная `render/shadow-quit-ep2-v3.mp4` (1:47, без клиффхэнгера) + варианты `-A` «Папа», `-B` «Малыш», `-C» «Обмен» (по 12 с).
  Сборка части: `EP2_PART=main|A|B|C bash audio/ep2/mix2.sh`; рендер `index-ep2[-A|-B|-C].html`; мукс с `apad` до длины видео. Голос ×1.1, рассказчик ×1.32 (+7 дБ).
  Ждём: выбор концовки, отзыв.
- 2026-11-28 v4 `render/shadow-quit-ep2-v4.mp4` (1:33): правило №2 «shadows touch only when their owners do» (+ «unless a shadow quits»), ~30 реплик,
  хук — держатся за руки, тени целуются, бариста «!!»; дом: кухня 2 реплики + коридор 3 + кот с облачком-мыслью; бегун с хвостиком (крупно → отъезд);
  фасад общим планом; салфетки — касание рук; поцелуй: взгляд на стену → пауза → бариста → «…Wow.»; прогулка за руку + «Sometimes you just need a push.»;
  конец — свет снова зажёгся. Клиффхэнгеры: 3 идеи текстом (соседи-тренды / помада на тени / чужая тень папы) + прошлые A/B/C видео.
- 2026-11-28 v5 `render/shadow-quit-ep2-v5.mp4` (1:43): бегун — тень не достаёт → Sam врезается в бегуна → касание → тени целуются → «…Sup.» → «Nope.» → бегство;
  вжух-переходы (S1, S5, S10B, S11); дверь — видно зал; «Lean in.» «Closer…» → чашка; знакомство + монтаж «10 min… 2 hours later» → рукопожатие → поцелуй →
  взгляд → бариста → «…Wow.» → неловкая пауза; прогулка 10,5 с, 7 фаз теней, V.O. «Sometimes you just need a push. / Even if it comes from your own shadow.»
- 2026-11-28 v6 `render/shadow-quit-ep2-v6.mp4` (1:49): «Morning, Speedy. Run far last night?» — «Tactical retreat.»; бегун как в v4 + рывок и щелчок резинки;
  правило «A shadow is glued to its owner. Stretches 1 step. Max.» + «GET CLOSE.»; видимая резинка-«жвачка» от ног тени к хозяину (бегун, кафе, поцелуй, дверь);
  монтаж «прошло время» — 6 склеек по 0,6 с (рассказ, тени-курицы, Mia прыскает, Sam-курица, часы, хохот); толчки камеры на панчлайнах.
- 2026-11-29 v7 `render/shadow-quit-ep2-v7.mp4` (1:41): без окна-правила и резинки; логика — тень командует (иначе уволится), тени целуются потому что не сдерживаются;
  хук без бариста; «Manipulation again?» и «I can't do this.» (обрезаны дубли); после «Wow» тени продолжают целоваться; эмоциональные дубли (s9, s10, g7, g8, l4, b19; p5 отклонён — «A.S.S.»);
  суперсэмплинг ×1.6 (window.SUPERSAMPLE), цветокоррекция, контровой свет; звуки: курица, чмоки, чашки, щелчок.
- 2026-11-29 клиффхэнгеры-отрезки (с момента включения света): `render/shadow-quit-ep2-cliff-{D,E,F,G}.mp4` — D «Next time… without them» → тени «What the f—» → чёрный;
  E соседи аплодируют + вирусное видео → «Oh no. Not again.»; F помада на тени → утром не оттирается; G тень папы Mia на двери → «WHERE IS MY SHADOW?!» → «…Hi?».
  Сборка: `EP2_PART=D bash audio/ep2/mix2.sh`, страницы `index-ep2-{D..G}.html`. Исправлен баг mix2.sh: `echo "-E"` печатал пусто → затирался основной микс.
- 2026-11-29 клиффхэнгеры v3 (ставка + вопрос в комменты): `render/shadow-quit-ep2-cliff-{N,O,P}.mp4` —
  N «Next time… without them» → тени переглядываются, щурятся → заставка: глаза в темноте, мел «Final Episode», «Without us? …How cute.», «NO SHADOWS ALLOWED» перечёркнуто тенью, «Can Sam do it ALONE?»;
  O бывший тени Mia («Hands off my girl, shorty.» — «Sam. Hold my hat.») → SHADOW FIGHT / «Team Shadow or Team Ex?»;
  P утро: тени сбежали (записка «Back by sunset. Probably.»), Mia: «our shadows eloped», рука Sam тает, таймер TILL SUNSET → «Will they find them in time?». Ждём выбор.
- 2026-11-29 концовка SHADOW FIGHT (выбрана идея): `render/shadow-quit-ep2-ending-{QE,RE}.mp4` (21,7 с, с заходом S12) — свет гаснет → фары красной машины →
  QE: дверь открыта, сиденье пустое, из машины выползает самовольная тень (бывший тени Mia) и вырастает на стене; RE: выходит здоровяк, его огромная тень;
  «Oh. Um… this is my ex.» — «Hands off my girl, shorty.» — «Sam. Hold my hat.» → экран файтинга (полоски здоровья, VS, ROUND 1, FIGHT!), «Team Shadow or Team Ex?».
  Полные серии: части `Q`/`R` (index-ep2-Q/R.html), `EP2_PART=Q bash audio/ep2/mix2.sh`.
- 2026-11-27 концовка SHADOW FIGHT v2 по отзыву («странные тени в темноте, машина слабая, с человеком непонятно, бой плоский, нет ставки, мат можно»):
  `render/shadow-quit-ep2-ending-RE2.mp4` (43,3 с, с заходом S12). Только вариант с хозяином (R/RE). Темнота — только глаза теней (починена прозрачность хвостика/юбки) →
  бас, лоурайдер с гидравликой, фары → «Oh shit. Brad.» — «Who the fuck is Brad?» — «My ex. His shadow's worse.» → нога из двери, стоп-кадр-титр BRAD → тень-гигант,
  тень Sam крадётся прочь → «Don't you dare run again.» → «Hands off my girl, shorty.» → «She's coming with me.» (тянет тень Mia, Mia тает) → «Sam. Hold my hat.» (Sam ловит шляпу)
  → «Dude, he's twice your size!» — «Good. More to hit.» → арена-закат силуэтами (та же улица, кот, зрители), ROUND 1 / FIGHT (диктор ann_en), уворот, 9 HITS · DAMAGE 0,
  «That tickles.», нокдаун, SHADOW POWER READY, прыжок → стоп-кадр TO BE CONTINUED / FINAL EPISODE · tomorrow / Team Shadow or Team Brad?
  Полная серия с этой концовкой ≈ 2:16 (часть R). Ждём отзыв.
- 2026-11-27 «дерзкий монтаж, как концовка — склеивай; начало дерзче, с фишками»: в начало добавлены стоп-кадр «кто есть кто» (H), шкала SHADOW'S DIGNITY → K.O. (FB),
  повтор ×0.5 с маркером «“tactical”» (S2, во время b19), титр-удар TERM #5 (S2B), красные флажки на «Manipulation again?», табло PIXEL 1 : 0 SHADOW (CAT) + звуки.
  Полная серия с концовкой Shadow Fight — часть R → `render/shadow-quit-ep2-v8.mp4` (~2:17). Урезать — позже (просьба пользователя).
