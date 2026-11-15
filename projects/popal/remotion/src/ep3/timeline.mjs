// «ПОПАЛ», серия 3 «Железная воля» (ветка ОТКАЗАТЬ — остаться с Лирой). БЕЗ ОЗВУЧКИ: длительность реплики считается
// по числу слов (время на чтение), слова субтитров загораются равномерно. Остальное — как в серии 2.
import { STATS_EP2 } from '../ep2/timeline.mjs';

export const SPEAKER = { a1: 'n', a2: 'max', b1: 'lira', b2: 'succ', c1: 'succ', d1: 'n', d2: 'slime', d3: 'max', e1: 'succ', e2: 'max', f1: 'lira', g1: 'lira', g2: 'max',
  g3: 'succ', g4: 'max', h1: 'n', h2: 'succ', i1: 'succ', i2: 'succ', i3: 'lira', j1: 'n', k1: 'max', k2: 'n', k3: 'lira', l1: 'king', l2: 'king', m1: 'n', m2: 'max',
  n1: 'knight', n2: 'knight', n3: 'lira', o1: 'n', p1: 'slime' };
export const NAME = { lira: 'ЛИРА', slime: 'ЖЕЛЕ', king: 'КОРОЛЬ ДЕМОНОВ', succ: 'ЛИЛИАНА', max: 'МАКС', knight: 'РЫЦАРЬ СМЕРТИ' };
// субтитры: {слово} — акцент (жёлтым), мат со звёздочкой
export const CAP = { a1: 'Вы выбрали: {остаться с эльфийкой}.', a2: '{Нет.} Я остаюсь {с Лирой}.',
  b1: 'Я {не просила!}', b2: 'Мне не отказывали {триста лет!}', c1: 'Тогда — {чары соблазна!}',
  d1: 'Чары {отскочили}. Спасибо, {двадцать семь лет} одиночества.', d2: 'Сковородка... ты такая {чугунная}...', d3: 'Желе, {фу}.',
  e1: 'Ты что, {из камня?!}', e2: 'Из {отдела продаж}.', f1: '{Руки} от него {убрала!}',
  g1: '{Добить?}', g2: '{Стой.} Она просто {на работе}.', g3: 'Триста лет. {Без выходных}. Без отпуска.', g4: 'Знакомо. У нас это называлось {«мы — семья»}.',
  h1: 'Сковорода Судьбы впервые {пожарила яичницу}.', h2: 'Мне никто... {не готовил}.',
  i1: 'Вот {короткий путь} к замку. Я вас {не видела}.', i2: 'А ты, ушастая, {не тормози}. Он {годный}.', i3: 'Он {не мой!}',
  j1: 'Победа {яичницей}. Аура — {за три тысячи!}', k1: '{За мной!} Я знаю дорогу!', k2: 'Он {не знал}. И застрял {в плаще Лиры}.', k3: 'Вылезай. Из. {Моего. Плаща.}',
  l1: 'Лилиана... ест {яичницу?!}', l2: 'Рыцарь смерти. {К воротам}.', m1: 'К утру они дошли до {замка Короля}.', m2: 'Как {мой офис}. Только {уютнее}.',
  n1: 'Король ждёт. {Только избранного}.', n2: 'Эльфийку — {в темницу}.', n3: 'Макс! {Не лезь!} Иди к Королю!',
  o1: 'Ворота {закрываются}. Лиру {уносят}.', p1: '{Спасти Лиру} или {бежать к Королю}? Пишите в комментах!' };
const nw = id => CAP[id].split(/\s+/).filter(w => w !== '—').length;
// время на чтение: 0,55 с + 0,34 с на слово
const D = Object.fromEntries(Object.keys(CAP).map(id => [id, +(0.55 + 0.34 * nw(id)).toFixed(2)]));
const AF = (id, gap = .2) => ['after', id, gap];
// [id плана, мин. длительность, [[реплика, сдвиг от начала плана]], [[сдвиг, звук, громкость, доп.]]]
const SPEC = [
  ['hook', 4.2, [['a1', .15], ['a2', AF('a1', .2)]], [[0, 'crackle', .3, { dur: 4.4 }], [.1, 'whoosh-medium-soft', .5], [.25, 'impact-medium-firm', .7], [2.2, 'pop-medium-in', .5]]],
  ['refuse', 4.4, [['b1', .2], ['b2', AF('b1', .25)]], [[.15, 'heartbeat', .5, { dur: 1.2 }], [.2, 'shimmer-short-sparkle', .4], [1.6, 'whoosh-fast-soft', .5], [1.7, 'notification-failure-low', .5], [2.6, 'click-snap-firm', .6]]],
  ['charm', 3.4, [['c1', .2]], [[.2, 'riser-1s-strong', .5], [1.2, 'oc-MAGSpel_MagicSpell_OS_01', .6], [1.3, 'shimmer-long-bright', .5], [1.9, 'pop-small-bubble', .5], [2.2, 'pop-small-bubble', .5], [2.5, 'pop-small-bubble', .5]]],
  ['iron', 4.6, [['d1', 1.0]], [[.1, 'tone-ding-high', .6], [.35, 'tone-ding-high', .5], [.6, 'tone-ding-high', .5], [.75, 'notification-failure-low', .4], [1.0, 'digital-power-up', .5], [1.1, 'whoosh-medium-soft', .4], [2.6, 'pop-medium-in', .5]]],
  ['slimeLove', 4.2, [['d2', .5], ['d3', AF('d2', .2)]], [[.1, 'pop-small-bubble', .6], [.4, 'shimmer-medium-soft', .5], [.5, 'heartbeat', .45, { dur: 1.6 }], [1.2, 'move-bounce', .4], [3.0, 'pop-medium-out', .5]]],
  ['stone', 3.8, [['e1', .25], ['e2', AF('e1', .25)]], [[0, 'whoosh-slow-hard', .5], [.1, 'bass-rumble-medium', .4], [.3, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .4, { dur: 1.2 }], [2.2, 'pop-small-in', .4]]],
  ['arrow', 3.4, [['f1', .2]], [[.3, 'foley-wood-touch', .6], [1.25, 'swish-hard', .8], [1.27, 'whoosh-fast-soft', .5], [1.62, 'impact-light-firm', .9], [1.65, 'foley-wood-touch', .7], [1.9, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .4, { dur: .8 }]]],
  ['bonk', 3.0, [], [[.25, 'whoosh-medium-hard', .7], [.95, 'bonk', 1], [.96, 'impact-medium-firm', .7], [.97, 'cinematic-metal-big', .5, { bright: 2 }], [1.5, 'whoosh-slow-medium', .5], [1.95, 'impact-heavy-soft', .8], [2.3, 'whoosh-medium-soft', .4], [2.6, 'impact-light-soft', .5]]],
  ['mercy', 3.6, [['g1', .3], ['g2', AF('g1', .3)]], [[0, 'crackle', .25, { dur: 3.8 }], [.2, 'foley-wood-touch', .5], [1.2, 'foley-fabric-slide', .5], [1.3, 'impact-light-soft', .5]]],
  ['overtime', 5.6, [['g3', .3], ['g4', AF('g3', .3)]], [[0, 'crackle', .25, { dur: 5.8 }], [.3, 'notification-failure-fall', .35], [2.9, 'pop-small-in', .4]]],
  ['egg', 3.6, [['h1', .5]], [[0, 'crackle', .4, { dur: 3.8 }], [.15, 'click-snap-firm', .7], [.3, 'props-splash', .35], [.4, 'hiss', .5, { dur: 2.8 }], [1.9, 'shimmer-medium-sparkle', .5], [2.6, 'tone-ding-high', .5]]],
  ['tears', 3.4, [['h2', .7]], [[0, 'crackle', .2, { dur: 3.6 }], [.2, 'pop-small-bubble', .5], [.7, 'shimmer-long-soft', .5], [1.5, 'pop-small-bubble', .35], [2.2, 'pop-small-bubble', .35]]],
  ['map', 7.2, [['i1', .4], ['i2', AF('i1', .3)], ['i3', AF('i2', .15)]], [[0, 'crackle', .2, { dur: 7.4 }], [.2, 'foley-fabric-slide', .5], [.5, 'pop-medium-in', .5], [1.2, 'shimmer-short-sparkle', .4], [3.6, 'whoosh-medium-soft', .4], [6.2, 'heartbeat', .5, { dur: 1 }], [6.3, 'pop-medium-out', .5]]],
  ['levelup', 3.6, [['j1', .5]], [[0, 'oc-MUSCStngr_LevelUpOrchestral_OS_01', .7], [.3, 'data-countup-medium', .5], [.2, 'shimmer-long-bright', .5], [-1.0, 'notification-success-fanfare', .45]]],
  ['cloak', 7.2, [['k1', .2], ['k2', AF('k1', .9)], ['k3', AF('k2', .25)]], [[.1, 'whoosh-medium-soft', .5], [1.5, 'whoosh-fast-soft', .6], [1.75, 'foley-fabric-slide', .8], [1.9, 'impact-light-soft', .7], [2.2, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .5, { dur: 1.6 }], [3.5, 'data-decrease-short', .6], [5.2, 'foley-fabric-slide', .4]]],
  ['throne', 5.0, [['l1', .5], ['l2', AF('l1', .35)]], [[0, 'bass-rumble-long', .5], [0, 'crackle', .3, { dur: 5 }], [.3, 'cinematic-thunder-big', .3], [2.7, 'impact-heavy-hard', .7, { bright: 2 }], [3.0, 'oc-FEETHmn_ShoeMetalLand_OS_01', .6]]],
  ['castle', 6.2, [['m1', .4], ['m2', AF('m1', .5)]], [[0, 'bsb-wind-foley', .3, { dur: 6.4 }], [0, 'bass-rumble-long', .4], [.3, 'whoosh-slow-medium', .4], [3.4, 'impact-deep-soft', .5]]],
  ['knight', 4.6, [['n1', 1.9]], [[0, 'bass-rumble-long', .5], [.2, 'mechanical-latch-heavy', .7], [.3, 'bsb-heavy-chain', .4], [.9, 'oc-FEETHmn_ShoeMetalLand_OS_01', .8], [1.4, 'oc-FEETHmn_ShoeMetalLand_OS_02', .8], [1.45, 'impact-heavy-hard', .6, { bright: 2 }], [1.9, 'sting-bold-short', .45]]],
  ['grab', 5.4, [['n2', .25], ['n3', AF('n2', .5)]], [[.3, 'whoosh-fast-soft', .7], [.55, 'oc-CHAINMvmt_ChainsCreepy_OS_01', .5], [.6, 'impact-medium-firm', .8], [.9, 'foley-fabric-slide', .6], [1.2, 'whoosh-slow-medium', .5], [2.4, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .3, { dur: 1 }]]],
  ['dilemma', 3.8, [['o1', .4]], [[0, 'riser-2s-soft', .5], [.2, 'bsb-heavy-chain', .4], [.3, 'bass-rumble-long', .5], [1.0, 'heartbeat', .6, { dur: 2.6 }], [2.2, 'impact-deep-soft', .5]]],
  ['ask', 4.4, [['p1', .45]], [[0, 'whoosh-medium-soft', .4], [.5, 'move-bounce', .5], [1.7, 'move-bounce', .4], [2.9, 'move-bounce', .4]]],
  ['split', 4.6, [], [[0, 'whoosh-medium-medium', .5], [.15, 'pop-large-in', .5], [.4, 'pop-large-in', .5], [.7, 'impact-medium-firm', .5], [1.2, 'sting-bright-long', .45], [2.2, 'pop-medium-in', .5]]],
];

export const SHOTS = []; export const VO = []; let at = 0;
for (const [id, min, vo, cues] of SPEC) {
  const off = {}; vo.forEach(([v, o]) => { off[v] = Array.isArray(o) ? off[o[1]] + D[o[1]] + o[2] : o; });
  const end = Math.max(min, ...vo.map(([v]) => off[v] + D[v] + .25));
  const a = Math.round(at * 30) / 30, b = Math.round((at + end) * 30) / 30;
  SHOTS.push({ id, a, b, cues }); vo.forEach(([v]) => VO.push({ id: v, t: +(a + off[v]).toFixed(3), d: D[v], who: SPEAKER[v] })); at = b; }
export const DUR = at;
export const SHOT = Object.fromEntries(SHOTS.map(s => [s.id, s]));
export const VO_AT = id => (VO.find(v => v.id === id) || { t: 0 }).t;
export const WORD_AT = (id, i) => VO_AT(id) + i * D[id] / nw(id);

// фразы субтитров: по предложениям, длинные — пополам; слова загораются равномерно (озвучки нет)
export const CAPS = [];
for (const v of VO) {
  const toks = []; CAP[v.id].split(/\s+/).forEach(w => { if (w === '—' && toks.length) toks[toks.length - 1] += ' —'; else if (w !== '—') toks.push(w); }); let inA = false;
  const tw = i => v.t + i * (v.d - .45) / toks.length;
  const all = toks.map((raw, i) => { if (raw.startsWith('{')) inA = true; const accent = inA; if (raw.includes('}')) inA = false; return { text: raw.replace(/[{}]/g, ''), t: tw(i), accent }; });
  const sents = []; let cur = []; all.forEach((w, i) => { cur.push(w); if (/[.?!…]$/.test(w.text) || i === all.length - 1) { sents.push(cur); cur = []; } });
  const chunks = []; for (const s of sents) { const n = s.length; if (n <= 5) { chunks.push(s); continue; } const k = Math.ceil(n / Math.ceil(n / 4)); for (let i = 0; i < n; i += k) chunks.push(s.slice(i, i + k)); }
  const merged = []; for (const c of chunks) { const l = merged[merged.length - 1]; if (l && (c.length === 1 || l.length === 1) && l.length + c.length <= 4) l.push(...c); else merged.push([...c]); }
  merged.forEach((c, i) => CAPS.push({ who: v.who, vo: v.id, a: c[0].t - .05, b: i < merged.length - 1 ? merged[i + 1][0].t - .06 : v.t + v.d + .15, words: c })); }
for (const c of CAPS) { const sh = SHOTS.find(q => c.a + .06 >= q.a && c.a + .06 < q.b); if (sh) c.b = Math.min(c.b, sh.b - .02); }
for (let i = 0; i < CAPS.length - 1; i++) CAPS[i].b = Math.min(CAPS[i].b, CAPS[i + 1].a - .02);

// звук: музыка по частям серии и эффекты из SPEC (голоса нет)
export const CUES = [];
const S = id => SHOT[id].a, E = id => SHOT[id].b;
const M = 'projects/popal/assets/music/';
const music = (file, t0, t1, gain, from = 0) => CUES.push({ t: +t0.toFixed(2), type: 'file', path: M + file, gain, from, dur: +(t1 - t0).toFixed(2), voice: false });
music('sultry.wav', 0, S('charm'), .5);
music('camp.wav', S('iron') + .9, S('stone'), .5);                      // комедия: чары отскочили, Желе влюбился
music('battle.wav', S('stone'), S('bonk') + .95, .6);                   // бой обрывается на БОНК
music('calm.wav', S('mercy'), S('levelup'), .5, 4);
music('isekai.wav', S('levelup') + .2, S('cloak') + 1.75, .6, 20);      // фанфары обрываются на плаще
music('camp.wav', S('cloak') + 2.4, S('throne'), .5, 8);
music('dark.wav', S('throne'), S('ask'), .6, 2);
music('isekai.wav', S('ask'), DUR, .55, 40);
SHOTS.forEach(s => s.cues.forEach(([o, snd, gain, ex]) => { if (!gain) return; const t = +((o < 0 ? s.b : s.a) + o).toFixed(3);
  CUES.push(snd.includes('-') || snd.startsWith('oc') || snd.startsWith('bsb') ? { t, type: 'lib', id: snd, gain, ...(ex || {}) } : { t, type: snd, gain, ...(ex || {}) }); }));
CUES.push({ t: DUR - 2.5, type: 'wind', gain: .22, dur: 2.5 });          // хвост до последнего кадра

// табло героя: начало — итог серии 2, конец — 12 · 8 · 3 500 (план сериала)
export const STATS_EP3 = { start: STATS_EP2.end, end: { str: 12, hp: 8, aura: 3500 } };
const EV = () => [{ t: S('levelup') + .55, str: 12 }, { t: S('levelup') + .75, hp: 8 }, { t: S('levelup') + .95, aura: 3550 }, { t: S('cloak') + 3.5, aura: 3500 }];
export function statsAt(t) { const s = { ...STATS_EP3.start, hit: -9, gain: -9, loss: -9 }; let prev = 0;
  for (const e of EV()) { if (t < e.t) break; if (e.str) { s.strGain = e.str - s.str; s.strAt = e.t; s.str = e.str; s.gain = e.t; } if (e.hp) { s.hpGain = e.hp - s.hp; s.hpAt = e.t; s.hp = e.hp; s.gain = e.t; } if (e.aura != null) { prev = s.aura; s.aura = e.aura; if (e.aura > prev) s.gain = e.t; else s.loss = e.t; s.auraFrom = prev; s.auraAt = e.t; } }
  return s; }
export const HUD_FROM = 1.0;
export const HUD_HIDE = [[S('egg'), E('egg')], [S('throne'), E('throne')], [S('ask'), DUR + 1]];
