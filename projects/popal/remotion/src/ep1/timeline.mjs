// «ПОПАЛ», серия 1 v4 — единый модуль серии: планы, голос, субтитры, звук, табло STATS.
// v4 (правки пользователя): нарратор-рассказчик (Vosk TTS, диктор 26), спокойный темп (планы 3–6 с), начало с донером и колой,
// без «других избранных», «додеп», инфографика автомата, гусь из пруда, новый Король демонов (бык, гачи), выбор — чиби-Желе.
// Время каждого плана считается от длины реплик (durations.json), поэтому перемонтаж не ломает синхрон.
import D from '../data/durations.json' with { type: 'json' };
import WORDS from '../data/words.json' with { type: 'json' };

// n — нарратор (за кадром, рот закрыт), остальные — в кадре (рот по голосу)
export const SPEAKER = { a1: 'n', a3: 'max', a4: 'n', b1: 'n', c1: 'courier', c2: 'courier', d1: 'n', s1: 'max', e1: 'n', e2: 'max', f1: 'lumina', f2: 'max', f3: 'lumina', g1: 'n', g2: 'n',
  h1: 'lumina', h2: 'n', h3: 'lumina', h4: 'max', h5: 'lumina', i1: 'n', i2: 'n', j1: 'slime', j2: 'max', k1: 'n', k2: 'max', k3: 'n', k4: 'max',
  l1: 'n', l2: 'max', l3: 'slime', m1: 'n', m2: 'king', m3: 'succ', m4: 'king', w1: 'max', w2: 'slime', n2: 'slime' };
export const NAME = { courier: 'КУРЬЕР', lumina: 'БОГИНЯ ЛЮМИНА', slime: 'ЖЕЛЕ', king: 'КОРОЛЬ ДЕМОНОВ', succ: 'ЛИЛИАНА', max: 'МАКС' };
// субтитры: {слово} — акцент (жёлтым), мат со звёздочкой; число слов = числу слов реплики (тире не считается)
const CAP = { a1: 'Это Макс. Через минуту он {умрёт}. Из-за {донера}.', a3: 'Колы нет. {Всухомятку} я его есть не буду.', a4: 'И Макс пошёл за {сушняком}.',
  b1: 'В аниме героя сбивает {грузовик}. А Макса сбил {курьер}. С его же {донером}.', c1: 'Ваш заказ. {Пять звёзд} поставите?', c2: '{Избранный} доставлен.',
  d1: 'Так Макс и умер. {Девственником}.', s1: 'Стоп. Я что, {умер?!} А {донер?!}', e1: 'На том свете — {очередь}. Но Макс — {избранный}. Такой {один на тысячу лет}.', e2: 'О, быстро!',
  f1: 'Перерождение. Мир — {Эльдория}. Вопросы?', f2: 'А можно мир, где {девушки-кошки}?', f3: 'Кошки — {по подписке}.',
  g1: 'Сила — {один}. Здоровье — {один}. Аура — {ноль}.', g2: 'Сила и здоровье растут с {опытом}. Аура — только от {побед}.',
  h1: 'Теперь дар. {Крути}.', h2: 'Меч выпадает {раз из ста}. Сковородка — {девяносто семь} раз из ста.', h3: '{Сковорода Судьбы}. Не промахивается.',
  h4: 'Не-не-не, это {кринж}. {Додеп!} Дай ещё прокрутку!', h5: '{Пошёл на*ер}.', i1: 'Так Макс попал в {Эльдорию}. Две луны, летающие острова...', i2: '...и {пруд}.',
  j1: 'Ты как сюда {упал}?', j2: 'Желе разговаривает. Всё, {кукуха} поехала.', k1: 'Но в этом пруду плавал гусь. И гусь был {очень зол}.',
  k2: 'Блин, это не простой гусь. Это {вражеский моб!}', k3: '{Адский гусь}, разведчик Короля демонов. Один щипок — и {конец}.', k4: 'Надо его {сковородкой} прибить!',
  l1: 'Первая {победа!}', l2: 'Ма-ам...', l3: '{Минус} аура.', m1: 'А тем временем в {землях демонов}...', m2: 'Сковородкой. Моего {гуся}.',
  m3: 'Мне им {заняться}, повелитель?', m4: 'Найти. Привести. {Живым — необязательно}.', w1: 'Желе, а куда {нам}?', w2: 'Впереди {развилка}.',
  n2: '{Эльфийки} или {дракон}? Пишите в комментах!' };

const wt = (id, i) => (WORDS[id] || [])[i] ?? i * D[id] / 8;
const HIT = .3 + wt('b1', 9) - .12; // удар — перед «С его же донером»
// [id плана, мин. длительность, [[реплика, сдвиг от начала плана]], [[сдвиг, звук, громкость, доп.]]]
// звук: строка с дефисом/oc-/bsb- — библиотека (tools/sfx-find.py), иначе — синтез tools/sfx.py
const AF = (id, gap = .25) => ['after', id, gap]; // реплика сразу после другой реплики этого же плана
const SPEC = [
  ['room', 4.6, [['a1', .3]], [[0, 'hum', .15, { dur: 7 }], [1.6, 'wah', .45, { dur: .9, pitch: .6 }], [2.8, 'notification-message-in-clear', .6], [3.4, 'click-tap-soft', .5], [3.8, 'notification-success-chime', .55]]],
  ['fridge', 4.6, [['a3', .5], ['a4', AF('a3', .2)]], [[0, 'foley-wood-slide', .4], [.25, 'mechanical-latch-light', .6], [.3, 'hum50', .2, { dur: 3 }], [3.4, 'bsb-door-creak-close', .4]]],
  ['street', HIT, [['b1', .3, true]], [[0, 'engine', .45, { dur: HIT }], [.1, 'bsb-wind-foley', .25, { dur: HIT }], [HIT - 1.3, 'notification-message-in-clear', .5], [HIT - .9, 'riser-1s-strong', .55], [HIT - .35, 'horn', .7]]],
  ['freeze', 2.9, [], [[0, 'impact-heavy-hard', 1, { bright: 2 }], [0, 'oc-GLASBrk_GlassBottleBreak_OS_01', .4], [.05, 'whoosh-slow-medium', .6], [1.35, 'cinematic-slam-big', .8, { bright: 2 }], [1.4, 'sting-bold-short', .5]]],
  ['courier', 2.8, [['c1', .3]], [[0, 'foley-paper-slide', .6], [.1, 'siren', .1, { dur: 2.9 }]]],
  ['visor', 3.9, [['c2', .8]], [[0, 'digital-scan-clear', .5], [.6, 'digital-radio', .3], [2.6, 'appear-materialise', .7], [3.3, 'whoosh-medium-hard', .6]]],
  ['soul', 4.9, [['d1', .3], ['s1', AF('d1', .25)]], [[0, 'shimmer-long-soft', .45], [.2, 'reverse-whoosh-long-soft', .35], [-1.1, 'riser-2s-soft', .5], [-1.0, 'shimmer-long-bright', .5]]],
  ['hall', 6.3, [['e1', .3], ['e2', AF('e1', .2)]], [[0, 'murmur', .2, { dur: 6 }], [1.1, 'shimmer-medium-bright', .5], [3.6, 'notification-success-ding-ding', .7]]],
  ['window', 3.6, [['f1', .3]], [[0, 'keyboard-typing-quick-medium', .3], [1.6, 'swipe-fast-soft', .5], [2.2, 'swipe-fast-firm', .5]]],
  ['catsAsk', 2.0, [['f2', .15]], [[0, 'foley-fabric-slide', .4]]],
  ['catsNo', 2.0, [['f3', .5]], [[1.9, 'click-snap-medium', .4]]],
  ['system', 4.0, [['g1', .4]], [[.15, 'impact-medium-firm', .8], [.4, 'digital-power-up', .5], [.7, 'pop-medium-in', .6], [1.65, 'pop-medium-in', .6], [2.6, 'pop-medium-in', .6]]],
  ['lore2', 3.6, [['g2', .3]], [[0, 'whoosh-medium-soft', .5], [.3, 'pop-small-in', .5], [1.0, 'pop-small-in', .5], [2.2, 'shimmer-medium-sparkle', .5], [3.2, 'notification-failure-low', .4]]],
  ['slot', 3.9, [['h1', .2]], [[1.6, 'mechanical-latch-heavy', .8], [1.75, 'rattle', .35, { dur: 1.4 }], [1.75, 'time-clock-fast', .5], [3.1, 'mechanical-switch-heavy', .6], [3.25, 'mechanical-switch-heavy', .6], [3.4, 'mechanical-switch-heavy', .6], [3.5, 'money-coins-pour', .5], [3.5, 'notification-success-fanfare', .45]]],
  ['odds', 4.6, [['h2', .25]], [[0, 'whoosh-medium-soft', .5], [.4, 'data-chart-reveal', .5], [1.2, 'data-bar-grow', .4], [3.0, 'data-countup-medium', .5], [4.2, 'notification-failure-wobble', .4]]],
  ['item', 2.6, [['h3', .25]], [[0, 'shimmer-long-bright', .55], [.1, 'cinematic-metal-big', .25, { bright: 2 }]]],
  ['dodep', 3.8, [['h4', .2]], [[.1, 'foley-fabric-slide', .4], [2.4, 'impact-light-firm', .6]]],
  ['nah', 2.2, [['h5', .3]], [[1.15, 'swipe-medium-firm', .7], [1.25, 'reverse-whoosh-medium-strong', .6], [1.45, 'faller-2s-strong', .6]]],
  ['fall', 4.0, [['i1', .2]], [[0, 'bsb-wind-strong-outside', .5, { dur: 4.5 }], [3.4, 'cinematic-thunder-big', .2]]],
  ['splash', 1.6, [['i2', .55]], [[.12, 'props-splash', 1], [.2, 'impact-medium-soft', .6, { bright: 2 }], [.7, 'props-drip', .4]]],
  ['slime', 4.7, [['j1', .3], ['j2', AF('j1', .2)]], [[0, 'oc-GORESqsh_BloodSquishSlimy_OS_02', .4], [.4, 'pop-small-bubble', .5], [1.7, 'props-drip', .3]]],
  ['gooseUp', 4.0, [['k1', .3]], [[0, 'props-drip', .3], [1.8, 'bass-rumble-medium', .4], [2.4, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .5, { dur: 1 }], [3.0, 'honk', 1], [3.0, 'impact-heavy-soft', .7, { bright: 2 }]]],
  ['chase', 3.4, [['k2', .2]], [[0, 'honk', .6], [1.4, 'honk', .5], [1.5, 'impact-light-firm', .6], [2.9, 'honk', .6], [3.0, 'impact-light-firm', .6]]],
  ['lore3', 4.1, [['k3', .3]], [[0, 'props-book-close', .5], [.4, 'props-page-turn', .5], [3.2, 'notification-alert-clear', .5]]],
  ['corner', 2.1, [['k4', .25]], [[0, 'impact-light-firm', .5], [1.1, 'shimmer-short-sparkle', .6]]],
  ['throw', 2.5, [], [[0, 'whoosh-slow-hard', .8], [.55, 'cinematic-metal-big', .5, { bright: 2 }], [.55, 'tone-ding-high', .5], [.95, 'cinematic-metal-big', .45, { bright: 2 }], [.95, 'tone-ding-mid', .5], [1.4, 'bonk', 1], [1.42, 'impact-heavy-hard', .9], [2.0, 'impact-deep-soft', .7], [2.35, 'impact-light-soft', .5]]],
  ['levelup', 2.0, [['l1', .45]], [[0, 'oc-MUSCStngr_LevelUpOrchestral_OS_01', .7], [.3, 'data-countup-medium', .5], [.2, 'shimmer-long-bright', .5]]],
  ['groin', 2.8, [['l2', .6], ['l3', AF('l2', .15)]], [[0, 'whoosh-medium-hard', .6], [.55, 'cinematic-metal-massive', .45], [.58, 'bonk', .6], [1.7, 'data-decrease-short', .6]]],
  ['throne', 4.5, [['m1', .3], ['m2', AF('m1', .35)]], [[0, 'bass-rumble-long', .5], [0, 'crackle', .3, { dur: 4.5 }], [.2, 'cinematic-thunder-big', .3]]],
  ['succ', 2.2, [['m3', .2]], [[0, 'shimmer-medium-soft', .4], [.1, 'foley-fabric-slide', .3]]],
  ['eyes', 3.2, [['m4', .2]], [[.15, 'boom-drop-strong', .7], [1.9, 'cinematic-thunder-massive', .5], [1.9, 'cinematic-drum-massive', .6]]],
  ['walk', 3.4, [['w1', .3], ['w2', AF('w1', .2)]], [[0, 'bsb-wind-foley', .25, { dur: 4.5 }], [.2, 'move-bounce', .3], [1.4, 'move-bounce', .3], [2.6, 'move-bounce', .3]]],
  ['forkAsk', 3.4, [['n2', .4]], [[0, 'whoosh-medium-soft', .4], [.5, 'move-bounce', .5], [1.7, 'move-bounce', .4], [2.9, 'move-bounce', .4]]],
  ['split', 3.0, [], [[0, 'whoosh-medium-medium', .5], [.15, 'pop-large-in', .5], [.4, 'pop-large-in', .5], [.7, 'impact-medium-firm', .5], [1.2, 'sting-bright-long', .45]]],
];

export const SHOTS = []; export const VO = []; let at = 0;
for (const [id, min, vo, cues] of SPEC) {
  const off = {}; vo.forEach(([v, o]) => { off[v] = Array.isArray(o) ? off[o[1]] + D[o[1]] + o[2] : o; });
  const end = Math.max(min, ...vo.filter(q => !q[2]).map(([v]) => off[v] + D[v] + .15));
  const a = Math.round(at * 30) / 30, b = Math.round((at + end) * 30) / 30;
  SHOTS.push({ id, a, b, cues }); vo.forEach(([v]) => VO.push({ id: v, t: +(a + off[v]).toFixed(3), d: D[v], who: SPEAKER[v] })); at = b; }
export const DUR = at;
export const SHOT = Object.fromEntries(SHOTS.map(s => [s.id, s]));
export const HIT_AT = HIT;
// абсолютное время реплики и её i-го слова (для событий, привязанных к голосу)
export const VO_AT = id => (VO.find(v => v.id === id) || { t: 0 }).t;
export const WORD_AT = (id, i) => VO_AT(id) + wt(id, i);

// фразы субтитров: по предложениям, длинные — пополам; слова загораются по голосу
export const CAPS = [];
for (const v of VO) {
  const toks = []; CAP[v.id].split(/\s+/).forEach(w => { if (w === '—' && toks.length) toks[toks.length - 1] += ' —'; else if (w !== '—') toks.push(w); }); const tm = WORDS[v.id] || []; let inA = false;
  const tw = i => v.t + (tm[i] ?? (i * v.d / toks.length));
  const all = toks.map((raw, i) => { if (raw.startsWith('{')) inA = true; const accent = inA; if (raw.includes('}')) inA = false; return { text: raw.replace(/[{}]/g, ''), t: tw(i), accent }; });
  const sents = []; let cur = []; all.forEach((w, i) => { cur.push(w); if (/[.?!…]$/.test(w.text) || i === all.length - 1) { sents.push(cur); cur = []; } });
  const chunks = []; for (const s of sents) { const n = s.length; if (n <= 5) { chunks.push(s); continue; } const k = Math.ceil(n / Math.ceil(n / 4)); for (let i = 0; i < n; i += k) chunks.push(s.slice(i, i + k)); }
  const merged = []; for (const c of chunks) { const l = merged[merged.length - 1]; if (l && (c.length === 1 || l.length === 1) && l.length + c.length <= 4) l.push(...c); else merged.push([...c]); }
  merged.forEach((c, i) => CAPS.push({ who: v.who, vo: v.id, a: c[0].t - .05, b: i < merged.length - 1 ? merged[i + 1][0].t - .06 : v.t + v.d + .3, words: c })); }
for (let i = 0; i < CAPS.length - 1; i++) CAPS[i].b = Math.min(CAPS[i].b, CAPS[i + 1].a - .02);

// звук: голос, музыка по частям серии, эффекты из SPEC
export const CUES = [];
const S = id => SHOT[id].a;
const GAIN = { n: 4.4, max: 4.4, lumina: 4.6, slime: 4.6, courier: 4.4, king: 7.5, succ: 9 };
VO.forEach(v => CUES.push({ t: v.t, type: 'file', path: `projects/popal/assets/vo/ep1v5/${v.id}.wav`, gain: GAIN[v.who] ?? 4.4 }));
const M = 'projects/popal/assets/music/';
const music = (file, t0, t1, gain, from = 0) => CUES.push({ t: t0, type: 'file', path: M + file, gain, from, dur: +(t1 - t0).toFixed(2), voice: false });
music('calm.wav', 0, S('street'), .3);
music('street.wav', S('street'), S('freeze'), .38);
music('dark.wav', S('soul'), S('hall') + .3, .3, 8);                 // тишина смерти
music('calm.wav', S('hall'), S('nah') + 1.2, .3, 6);                 // тот свет — спокойная тема
music('isekai.wav', S('fall'), S('corner') + .3, .38);                // музыка обрывается на «прибить»
music('isekai.wav', S('throw') + 1.4, S('throne'), .4, 30);
music('dark.wav', S('throne'), S('walk'), .36);
music('isekai.wav', S('walk'), DUR, .34, 40);
SHOTS.forEach(s => s.cues.forEach(([o, snd, gain, ex]) => { if (!gain) return; const t = +((o < 0 ? s.b : s.a) + o).toFixed(3);
  CUES.push(snd.includes('-') || snd.startsWith('oc') || snd.startsWith('bsb') ? { t, type: 'lib', id: snd, gain, ...(ex || {}) } : { t, type: snd === 'honk' ? 'horn' : snd, gain, ...(snd === 'honk' ? { dur: .35, pitch: 1.9 } : {}), ...(ex || {}) }); }));
CUES.push({ t: DUR - 2.5, type: 'wind', gain: .22, dur: 2.5 });          // хвост комнаты до последнего кадра

// табло героя (одна функция на весь сериал): серии 2–5 начинаются с итога этой
export const STATS_EP1 = { start: { str: 1, hp: 1, aura: 0 }, end: { str: 2, hp: 1, aura: 100 } };
const EV = () => [{ t: SHOT.levelup.a + .35, str: 2 }, { t: SHOT.levelup.a + .45, aura: 120 }, { t: SHOT.groin.a + 1.7, aura: 100 }];
export function statsAt(t) { const s = { ...STATS_EP1.start, hit: -9, gain: -9, loss: -9, hpBar: 1 }; let prev = 0;
  for (const e of EV()) { if (t < e.t) break; if (e.str) { s.str = e.str; s.gain = e.t; } if (e.aura != null) { prev = s.aura; s.aura = e.aura; if (e.aura > prev) s.gain = e.t; else s.loss = e.t; s.auraFrom = prev; s.auraAt = e.t; } }
  const hits = [SHOT.splash.a + .12, SHOT.chase.a + 1.5, SHOT.chase.a + 3.0, SHOT.groin.a + .55];
  for (const h of hits) if (t >= h) s.hit = h;
  s.hpBar = t < hits[0] ? 1 : t < hits[1] ? .7 : t < hits[2] ? .45 : t < hits[3] ? .3 : .15;
  return s; }
export const HUD_FROM = SHOT.system.a + .55; // табло появляется у богини («СИСТЕМА ПОДКЛЮЧЕНА»)
export const HUD_HIDE = [[SHOT.throne.a, SHOT.walk.a], [SHOT.split.a, DUR + 1]]; // в землях демонов табло Макса нет
