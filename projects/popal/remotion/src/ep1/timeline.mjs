// «ПОПАЛ», серия 1 — единый модуль серии: планы, голос, субтитры, звук, табло STATS.
// Время каждого плана считается от длины реплик (durations.json), поэтому перемонтаж не ломает синхрон.
// Используется и Remotion (картинка), и scripts/export.mjs (sfx-ep1.json для tools/sfx.py, srt).
import D from '../data/durations.json' with { type: 'json' };
import WORDS from '../data/words.json' with { type: 'json' };

// кто говорит: zk — мысли Макса за кадром (рот закрыт), остальные — в кадре (рот по голосу)
export const SPEAKER = { s01: 'zk', s02: 'zk', s04: 'courier', s05a: 'courier', s05b: 'zk', s06: 'zk', s07: 'zk', s08: 'max', s09: 'zk', s10: 'lumina', s11a: 'max', s11b: 'lumina',
  s12: 'zk', s13: 'zk', s14: 'lumina', s15a: 'lumina', s15b: 'lumina', s16: 'max', s17: 'lumina', s18: 'zk', s19: 'zk', s20a: 'slime', s20b: 'max', s21: 'zk', s22: 'slime',
  s23: 'zk', s24: 'max', s26: 'zk', s27a: 'max', s27b: 'slime', s28: 'zk', s29: 'king', s30: 'succ', s31: 'king', s32: 'max', s33: 'zk' };
export const NAME = { courier: 'КУРЬЕР', lumina: 'БОГИНЯ ЛЮМИНА', slime: 'ЖЕЛЕ', king: 'КОРОЛЬ ДЕМОНОВ', succ: 'ЛИЛИАНА', max: 'МАКС' };
// текст субтитров: {слово} — акцент (жёлтым), мат со звёздочкой; число слов = числу слов реплики
const CAP = { s01: 'В аниме попаданцев сбивает {грузовик}.', s02: 'Меня сбил {курьер}. С моим же заказом.', s04: 'Ваш заказ. {Пять звёзд} поставите?',
  s05a: 'Избранный номер {четыре тысячи девяносто шесть}. Доставлен.', s05b: 'Чего?', s06: 'Двадцать семь лет. Ипотека осталась. {Девственность} — тоже.',
  s07: 'Рай? Нет. {Электронная очередь}.', s08: 'О, быстро!', s09: 'Оказалось, таких, как я, — {тысячи}. Нас отправляют спасать {чужие миры}.',
  s10: 'Перерождение по квоте. Мир — {Эльдория}. Не ной.', s11a: 'А можно мир, где {девушки-кошки}?', s11b: 'Кошки — {по подписке}.',
  s12: 'Сила — {один}. Здоровье — {один}. Аура — {ноль}.', s13: 'Как я в {понедельник}.', s14: 'Сила и здоровье {качаются}. Аура — только от {побед} и {эпичных} моментов. Опозорился — {минус}.',
  s15a: 'Дар. {Крути}.', s15b: '{Сковорода Судьбы}. Не промахивается.', s16: 'Вы, {бл*ть}, издеваетесь?', s17: '{Следующий!}', s18: '{Эльдория}. Две луны, летающие острова...',
  s19: '...и {лужа}.', s20a: 'Мужик, ты на мне {сидел}.', s20b: 'Желе говорит. {Кукуха} всё.', s21: 'Гусь. Размером с {холодильник}.', s22: '{Адский гусь!} Разведчик Короля демонов. Они чуют {новеньких!}',
  s23: 'Со сковородкой. Против гуся. С силой {один}.', s24: 'Ну, сковородочка... {выручай}.', s26: 'Первая победа. {Плюс аура}.', s27a: 'Ма-а-ам...', s27b: '{Минус} аура.',
  s28: 'Кажется, я кого-то {разбудил}.', s29: 'Сковородкой. Моего {гуся}.', s30: 'Мне им {заняться}, повелитель?', s31: 'Найти. Привести. {Живым — необязательно}.',
  s32: 'Домой — на ремонте. {Ну конечно}.', s33: 'Куда идти — решаете {вы}. Пишите в комментах: {эльфийки} или {дракон}.' };

// [id плана, мин. длительность, [[реплика, сдвиг от начала плана]], [[сдвиг, звук, громкость, доп.]]]
// звук: строка с дефисом — id из библиотеки (tools/sfx-find.py), без дефиса — синтез tools/sfx.py
const SPEC = [
  ['hook', 2.4, [['s01', .1]], [[0, 'engine', .5, { dur: 2.4 }], [.2, 'notification-message-in-clear', .5], [1.5, 'riser-1s-strong', .55], [1.9, 'horn', .7]]],
  ['freeze', 2.0, [['s02', .1]], [[0, 'impact-heavy-hard', 1], [0, 'oc-GLASBrk_GlassBottleBreak_OS_01', .45], [.05, 'whoosh-slow-medium', .6], [.1, 'boom-hit-medium', .6]]],
  ['title', 1.55, [], [[0, 'cinematic-slam-big', .85, { bright: 2 }], [0, 'impact-medium-hard', .7], [.05, 'sting-bold-short', .5]]],
  ['courier', 2.6, [['s04', .2]], [[0, 'foley-paper-slide', .6], [.1, 'siren', .12, { dur: 2.5 }]]],
  ['visor', 4.2, [['s05a', .25]], [[0, 'digital-scan-clear', .5], [.6, 'digital-radio', .35], [2.8, 'appear-materialise', .7], [3.4, 'whoosh-medium-hard', .6]]],
  ['pov', 1.15, [['s05b', .25]], [[0, 'shimmer-long-soft', .5]]],
  ['void', 3.9, [['s06', .2]], [[0, 'hum50', .25, { dur: 3.9 }], [0, 'shimmer-medium-bright', .4], [1.4, 'click-toggle-off-soft', .5], [2.6, 'click-toggle-on-soft', .5]]],
  ['hall', 2.7, [['s07', .2]], [[0, 'murmur', .2, { dur: 2.7 }], [1.6, 'mechanical-ratchet-light', .6]]],
  ['board', 1.4, [['s08', .45]], [[.1, 'notification-success-ding-ding', .7]]],
  ['lore1', 4.3, [['s09', .25]], [[0, 'whoosh-medium-soft', .5], [.3, 'props-page-turn', .5], [1.5, 'data-countup-medium', .4], [3.0, 'appear-burst', .4]]],
  ['window', 4.6, [['s10', .1]], [[0, 'keyboard-typing-quick-medium', .35], [1.6, 'swipe-fast-soft', .5], [2.1, 'swipe-fast-soft', .5], [2.6, 'swipe-fast-firm', .5]]],
  ['catsAsk', 2.05, [['s11a', .1]], [[0, 'foley-fabric-slide', .4]]],
  ['catsNo', 2.35, [['s11b', .25]], [[.0, 'foley-glass-touch', .3], [2.0, 'click-snap-medium', .4]]],
  ['system', 3.6, [['s12', .55]], [[.15, 'impact-medium-firm', .8], [.4, 'digital-power-up', .5], [.7, 'pop-medium-in', .6], [1.65, 'pop-medium-in', .6], [2.6, 'pop-medium-in', .6]]],
  ['monday', 1.3, [['s13', .1]], [[0, 'notification-failure-wobble', .35]]],
  ['lore2', 7.45, [['s14', .15]], [[0, 'whoosh-medium-soft', .5], [.2, 'data-bar-grow', .5], [1.3, 'data-bar-grow', .5], [2.5, 'shimmer-medium-sparkle', .55], [5.5, 'notification-failure-low', .5]]],
  ['lever', 1.65, [['s15a', .1]], [[1.0, 'mechanical-latch-heavy', .8]]],
  ['reels', 4.1, [['s15b', 1.3]], [[0, 'rattle', .4, { dur: 1.2 }], [0, 'time-clock-fast', .5], [1.2, 'mechanical-switch-heavy', .6], [1.3, 'money-coins-pour', .55], [1.35, 'notification-success-fanfare', .5]]],
  ['pan', 1.6, [['s16', .15]], [[0, 'cinematic-metal-big', .25, { bright: 2 }]]],
  ['swipe', 1.75, [['s17', .1]], [[.75, 'swipe-medium-firm', .7], [.85, 'reverse-whoosh-medium-strong', .6], [1.05, 'oc-CREAHmn_TrollDeathScream_OS_01', .0], [1.0, 'faller-2s-strong', .6]]],
  ['fall', 3.3, [['s18', .35]], [[0, 'bsb-wind-strong-outside', .55, { dur: 3.3 }], [2.4, 'cinematic-thunder-big', .2]]],
  ['splash', 1.4, [['s19', .55]], [[.12, 'props-splash', 1], [.2, 'impact-medium-soft', .6], [.6, 'props-drip', .4]]],
  ['slime', 4.15, [['s20a', .2], ['s20b', 2.25]], [[0, 'oc-GORESqsh_BloodSquishSlimy_OS_02', .45], [.4, 'pop-small-bubble', .5], [2.2, 'props-drip', .3]]],
  ['goose', 2.9, [['s21', .95]], [[0, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .5, { dur: .8 }], [.75, 'impact-heavy-soft', .8, { bright: 2 }], [.75, 'impact-medium-firm', .6], [.85, 'honk', 1]]],
  ['lore3', 4.05, [['s22', .1]], [[0, 'props-book-close', .5], [.4, 'props-page-turn', .5], [2.6, 'notification-alert-clear', .5]]],
  ['chase', 3.15, [['s23', .1]], [[0, 'honk', .6], [.2, 'tone', .25, { dur: .12, freq: 1800 }], [.6, 'tone', .25, { dur: .12, freq: 1800 }], [1.0, 'tone', .25, { dur: .12, freq: 1800 }], [1.4, 'tone', .25, { dur: .12, freq: 1800 }], [1.5, 'honk', .5], [2.6, 'honk', .6]]],
  ['corner', 1.9, [['s24', .2]], [[0, 'impact-light-firm', .6], [.9, 'shimmer-short-sparkle', .6]]],
  ['throw', 2.9, [], [[0, 'whoosh-slow-hard', .8], [.55, 'cinematic-metal-big', .5, { bright: 2 }], [.55, 'tone-ding-high', .5], [.95, 'cinematic-metal-big', .45, { bright: 2 }], [.95, 'tone-ding-mid', .5], [1.4, 'bonk', 1], [1.42, 'impact-heavy-hard', .9], [2.0, 'impact-deep-soft', .7], [2.35, 'impact-light-soft', .5]]],
  ['levelup', 2.9, [['s26', .55]], [[0, 'oc-MUSCStngr_LevelUpOrchestral_OS_01', .7], [.3, 'data-countup-medium', .5], [.2, 'shimmer-long-bright', .5]]],
  ['groin', 3.0, [['s27a', .75], ['s27b', 1.75]], [[0, 'whoosh-medium-hard', .6], [.55, 'cinematic-metal-massive', .45], [.58, 'bonk', .6], [1.7, 'data-decrease-short', .6]]],
  ['signal', 2.5, [['s28', .75]], [[0, 'digital-scan-clear', .5], [.3, 'oc-LASRGun_LaserShootUI_OS_01', .6], [.6, 'cinematic-thunder-big', .35]]],
  ['throne', 3.0, [['s29', .45]], [[0, 'bass-rumble-long', .4], [0, 'crackle', .3, { dur: 3 }], [.2, 'shimmer-long-soft', .3]]],
  ['succ', 2.45, [['s30', .2]], [[0, 'shimmer-medium-soft', .4], [.1, 'foley-fabric-slide', .3]]],
  ['eyes', 3.85, [['s31', .2]], [[.15, 'boom-drop-strong', .7], [2.0, 'cinematic-thunder-massive', .55], [2.0, 'cinematic-drum-massive', .6]]],
  ['signpost', 2.85, [['s32', .45]], [[0, 'bsb-wind-foley', .4, { dur: 2.85 }], [.2, 'foley-wood-touch', .5], [1.6, 'foley-wood-slide', .4]]],
  ['choice', 4.9, [['s33', .3]], [[0, 'whoosh-medium-medium', .5], [.2, 'pop-large-in', .5], [.45, 'pop-large-in', .5], [1.5, 'time-clock', .35], [3.0, 'heartbeat', .4], [3.8, 'heartbeat', .4]]],
  ['end', 2.3, [], [[0, 'sting-bright-long', .5], [0, 'bsb-wind-foley', .3, { dur: 2.3 }]]],
];

const words = s => s.replace(/\*/g, '').split(/\s+/).filter(w => w && w !== '—' && w !== '-');
export const SHOTS = []; export const VO = []; let at = 0;
for (const [id, min, vo, cues] of SPEC) {
  const end = Math.max(min, ...vo.map(([v, o]) => o + D[v] + .18));
  const a = Math.round(at * 30) / 30, b = Math.round((at + end) * 30) / 30;
  SHOTS.push({ id, a, b, cues }); vo.forEach(([v, o]) => VO.push({ id: v, t: +(a + o).toFixed(3), d: D[v], who: SPEAKER[v] })); at = b; }
export const DUR = at;
export const SHOT = Object.fromEntries(SHOTS.map(s => [s.id, s]));

// фразы субтитров: делятся по концу предложения или через 4 слова; слова загораются по голосу
export const CAPS = [];
for (const v of VO) {
  const toks = []; CAP[v.id].split(/\s+/).forEach(w => { if (w === '—' && toks.length) toks[toks.length - 1] += ' —'; else if (w !== '—') toks.push(w); }); const tm = WORDS[v.id] || []; let inA = false;
  const tw = i => v.t + (tm[i] ?? (i * v.d / toks.length));
  const all = toks.map((raw, i) => { if (raw.startsWith('{')) inA = true; const accent = inA; if (raw.includes('}')) inA = false; return { text: raw.replace(/[{}]/g, ''), t: tw(i), accent }; });
  const sents = []; let cur = []; all.forEach((w, i) => { cur.push(w); if (/[.?!…]$/.test(w.text) || i === all.length - 1) { sents.push(cur); cur = []; } });
  const chunks = []; for (const s of sents) { const n = s.length; if (n <= 5) { chunks.push(s); continue; } const k = Math.ceil(n / Math.ceil(n / 4)); for (let i = 0; i < n; i += k) chunks.push(s.slice(i, i + k)); }
  // слишком короткие соседние фразы (1 слово) склеиваем, если вместе ≤ 5 слов
  const merged = []; for (const c of chunks) { const l = merged[merged.length - 1]; if (l && (c.length === 1 || l.length === 1) && l.length + c.length <= 4) l.push(...c); else merged.push([...c]); }
  merged.forEach((c, i) => CAPS.push({ who: v.who, vo: v.id, a: c[0].t - .05, b: i < merged.length - 1 ? merged[i + 1][0].t - .06 : v.t + v.d + .25, words: c })); }
for (let i = 0; i < CAPS.length - 1; i++) CAPS[i].b = Math.min(CAPS[i].b, CAPS[i + 1].a - .02);

// звук: голос, музыка по частям серии, эффекты из SPEC
export const CUES = [];
const S = id => SHOT[id].a;
VO.forEach(v => CUES.push({ t: v.t, type: 'file', path: `projects/popal/assets/vo/ep1/${v.id}.wav`, gain: v.who === 'king' ? 7.5 : v.who === 'succ' ? 14 : v.who === 'lumina' || v.who === 'slime' ? 4.6 : 4.2 }));
const M = 'projects/popal/assets/music/';
const music = (file, t0, t1, gain, from = 0) => CUES.push({ t: t0, type: 'file', path: M + file, gain, from, dur: +(t1 - t0).toFixed(2), voice: false });
music('street.wav', 0, S('freeze'), .4);
music('calm.wav', S('void'), S('catsNo') + 1.0, .32);               // пауза-«бум-тсс» после «Кошки — по подписке»
music('calm.wav', S('system'), S('swipe') + 1.0, .32, 12);
music('isekai.wav', S('fall'), S('corner') + .25, .4);                 // музыка обрывается на «выручай»
music('isekai.wav', S('throw') + 1.4, S('signal') + .5, .42, 30);
music('dark.wav', S('signal') + .3, S('signpost'), .38);
music('calm.wav', S('signpost'), DUR, .34, 24);
SHOTS.forEach(s => s.cues.forEach(([o, snd, gain, ex]) => { if (!gain) return; const t = +(s.a + o).toFixed(3);
  CUES.push(snd.includes('-') || snd.startsWith('oc') || snd.startsWith('bsb') ? { t, type: 'lib', id: snd, gain, ...(ex || {}) } : { t, type: snd === 'honk' ? 'horn' : snd, gain, ...(snd === 'honk' ? { dur: .35, pitch: 1.9 } : {}), ...(ex || {}) }); }));
CUES.push({ t: DUR - 2.3, type: 'wind', gain: .25, dur: 2.3 });          // хвост комнаты до последнего кадра

// табло героя (одна функция на весь сериал): события → значения. Серии 2–5 начинаются с итога этой.
export const STATS_EP1 = { start: { str: 1, hp: 1, aura: 0 }, end: { str: 2, hp: 1, aura: 100 } };
const EV = () => [
  { t: SHOT.levelup.a + .35, str: 2 }, { t: SHOT.levelup.a + .45, aura: 120 }, { t: SHOT.groin.a + 1.7, aura: 100 }];
export function statsAt(t) { const s = { ...STATS_EP1.start, hit: -9, gain: -9, loss: -9, hpBar: 1 }; let prevAura = 0;
  for (const e of EV()) { if (t < e.t) break; if (e.str) { s.str = e.str; s.gain = e.t; } if (e.aura != null) { prevAura = s.aura; s.aura = e.aura; if (e.aura > prevAura) s.gain = e.t; else s.loss = e.t; s.auraFrom = prevAura; s.auraAt = e.t; } }
  // удары и падения: полоска здоровья проседает, но уровень 1 держится
  const hits = [SHOT.splash.a + .12, SHOT.chase.a + .9, SHOT.chase.a + 2.1, SHOT.groin.a + .55];
  for (const h of hits) if (t >= h) s.hit = h;
  s.hpBar = t < SHOT.splash.a + .12 ? 1 : t < SHOT.chase.a + .9 ? .7 : t < SHOT.chase.a + 2.1 ? .45 : t < SHOT.groin.a + .55 ? .3 : .15;
  return s; }
export const HUD_FROM = SHOT.system.a + .55; // табло появляется в окне богини («СИСТЕМА ПОДКЛЮЧЕНА»)
export const HUD_HIDE = [[SHOT.throne.a, SHOT.signpost.a], [SHOT.end.a, DUR + 1]]; // у Короля демонов табло Макса нет
