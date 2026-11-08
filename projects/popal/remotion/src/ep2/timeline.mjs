// «ПОПАЛ», серия 2 «Не трогай уши» (ветка ЭЛЬФИЙКИ) — единый модуль серии: планы, голос, субтитры, звук, табло STATS.
// Как в серии 1: время плана = max(мин. длительность, реплики + 0,15 с) из durations.json, поэтому перемонтаж не ломает синхрон.
import D from '../data/ep2/durations.json' with { type: 'json' };
import WORDS from '../data/ep2/words.json' with { type: 'json' };
import { STATS_EP1 } from '../ep1/timeline.mjs';

const ROLE = { narrator: 'n', max: 'max', lira: 'lira', slime: 'slime', imp: 'imp', elves: 'elves', king: 'king', succ: 'succ' };
const LINES = { a1: 'narrator', a2: 'max', b1: 'narrator', d1: 'narrator', d2: 'lira', d3: 'narrator', e1: 'max', e2: 'max', e3: 'narrator', f1: 'lira', g1: 'max', g2: 'lira', g3: 'lira',
  h1: 'narrator', i1: 'lira', i2: 'max', j1: 'narrator', k1: 'lira', k2: 'max', k3: 'lira', k4: 'narrator', l1: 'narrator', l2: 'lira', m1: 'narrator', m2: 'imp', m3: 'max', n1: 'narrator',
  o1: 'elves', o2: 'max', o3: 'lira', p1: 'narrator', p2: 'king', q2: 'succ', q3: 'succ', q4: 'max', q5: 'slime', q6: 'max', r1: 'slime' };
export const SPEAKER = Object.fromEntries(Object.entries(LINES).map(([k, r]) => [k, ROLE[r]]));
export const NAME = { lira: 'ЛИРА', slime: 'ЖЕЛЕ', imp: 'ГЛАВНЫЙ БЕС', elves: 'СЁСТРЫ', king: 'КОРОЛЬ ДЕМОНОВ', succ: 'ЛИЛИАНА', max: 'МАКС' };
// субтитры: {слово} — акцент (жёлтым), мат со звёздочкой; число слов = числу слов реплики (тире не считается)
export const CAP = { a1: 'Вы выбрали {эльфиек}. Макс — {тоже}.', a2: '{Эльфийки!} Наконец-то нормальный {исекай!}',
  b1: 'Напомним: сила — {два}, аура — {сто}. Статус — {девственник}.', d1: 'И тут Макс нашёл {эльфийку}. Правда, {вверх ногами}.', d2: 'Чего уставился? {Снимай} меня, {бл*ть!}',
  d3: 'Это {Лира}. Лучшая {лучница} леса.', e1: '{Сковорода}, не подведи!', e2: '{Мягкая} посадка...', e3: '{Минус десять} ауры.', f1: 'Человек. Ещё и с {кухонной утварью}.',
  g1: 'А уши {настоящие?}', g2: 'Не {трогай} уши!', g3: '...Ладно. {Ещё раз} тронь.', h1: 'Уши эльфиек чувствительнее {в сто раз}. Трогать — только {с согласия}.',
  i1: 'Бесы утащили моих {сестёр}. Всю {деревню}.', i2: 'Все {эльфийки...} в плену?', j1: 'Лагерь {бесов}. И очень {плохая музыка}.',
  k1: 'План такой: я {стреляю}, ты {отвлекаешь}.', k2: 'А как {отвлекать?}', k3: 'Ты человек. Просто {будь собой}.', k4: 'Макс был собой. {Очень громко}.',
  l1: '{Спиной к спине}. Как в настоящем {аниме}.', l2: '{Слева!}', m1: 'Но тут вышел {главный бес}.', m2: '{Человечишка!} Я сожру твою {сковородку!}', m3: '{Подавись!}',
  n1: 'Аура — {тысяча!} И новый союзник — {Лира}.', o1: '{Герой!} Наш {герой!}', o2: 'Мама, я {в раю}.', o3: 'Руки {убрал}. Герой.',
  p1: 'А тем временем в {землях демонов}...', p2: 'Бесов. Тоже. {Сковородкой}. Лилиана — {твой выход}.', q2: 'Привет, {сладкий}. Отведу тебя к {Королю}.', q3: 'Цена — {одна ночь}.',
  q4: 'Это {ловушка?}', q5: '{Сто процентов}.', q6: '...Но {какая}.', r1: '{Согласиться} или {отказать}? Пишите в комментах!' };

const wt = (id, i) => (WORDS[id] || [])[i] ?? i * D[id] / 8;
const AF = (id, gap = .25) => ['after', id, gap];
// [id плана, мин. длительность, [[реплика, сдвиг от начала плана]], [[сдвиг, звук, громкость, доп.]]]
// звук: строка с дефисом/oc-/bsb- — библиотека (tools/sfx-find.py), иначе — синтез tools/sfx.py; отрицательный сдвиг — от конца плана
const SPEC = [
  ['hook', 4.8, [['a1', .3], ['a2', AF('a1', .25)]], [[0, 'bsb-wind-foley', .2, { dur: 5 }], [.1, 'brush', .5, { dur: .8 }], [1.4, 'shimmer-medium-sparkle', .5], [2.3, 'pop-small-bubble', .4]]],
  ['card', 3.6, [['b1', .25]], [[0, 'whoosh-medium-soft', .5], [.15, 'digital-power-up', .4], [.6, 'pop-small-in', .5], [1.2, 'pop-small-in', .5], [2.4, 'notification-failure-low', .45]]],
  ['net', 4.4, [['d1', .3], ['d2', AF('d1', .25)]], [[0, 'brush', .5, { dur: .8 }], [.4, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .3, { dur: .8 }], [.8, 'whoosh-slow-medium', .4]]],
  ['lira', 2.6, [['d3', .2]], [[0, 'shimmer-short-sparkle', .5], [.3, 'pop-medium-in', .5]]],
  ['throw', 2.3, [['e1', .1]], [[1.0, 'whoosh-medium-hard', .7], [1.45, 'cinematic-metal-big', .5, { bright: 2 }], [1.47, 'tone-ding-high', .5]]],
  ['land', 2.4, [['e2', 1.0]], [[0, 'whoosh-slow-medium', .5], [.5, 'impact-heavy-soft', .9, { bright: 2 }], [.55, 'oc-CLOTHFlp_FlagFlapping_LOOP_01', .3, { dur: .4 }]]],
  ['slap', 2.2, [['e3', .7]], [[.15, 'impact-light-firm', .9], [.15, 'oc-GORESqsh_BloodSquishSlimy_OS_02', .15], [.65, 'data-decrease-short', .6]]],
  ['stand', 3.0, [['f1', .3]], [[0, 'foley-fabric-slide', .5], [.3, 'foley-fabric-slide', .3]]],
  ['ears', 2.9, [['g1', .2], ['g2', AF('g1', .1)]], [[1.3, 'whoosh-fast-soft', .5], [1.35, 'pop-medium-out', .5]]],
  ['earsYes', 3.0, [['g3', .95]], [[0, 'bsb-wind-foley', .15, { dur: 1 }], [.95, 'shimmer-medium-soft', .4], [1.0, 'heartbeat', .5, { dur: 1.2 }]]],
  ['lore4', 4.6, [['h1', .3]], [[0, 'whoosh-medium-soft', .5], [.4, 'pop-small-in', .5], [1.5, 'pop-small-in', .5], [2.8, 'notification-alert-clear', .45]]],
  ['sisters', 4.5, [['i1', .3], ['i2', AF('i1', .25)]], [[0, 'bass-rumble-medium', .3], [.4, 'bsb-heavy-chain', .3]]],
  ['motiv', 2.2, [], [[0, 'riser-1s-strong', .5], [.9, 'data-countup-medium', .5], [1.5, 'impact-medium-firm', .7], [1.5, 'shimmer-long-bright', .4]]],
  ['camp', 3.6, [['j1', .4]], [[0, 'crackle', .35, { dur: 3.8 }], [0, 'thud', .55], [.5, 'thud', .55], [1.0, 'thud', .55], [1.5, 'thud', .55], [2.0, 'thud', .55], [2.5, 'thud', .55], [3.0, 'thud', .55]]],
  ['plan', 5.4, [['k1', .3], ['k2', AF('k1', .2)], ['k3', AF('k2', .2)]], [[0, 'crackle', .2, { dur: 5.6 }], [0, 'brush', .3, { dur: .8 }]]],
  ['oops', 3.0, [['k4', 1.3]], [[.2, 'click-snap-firm', .9], [.2, 'foley-wood-touch', .6], [.55, 'whoosh-fast-soft', .5], [.85, 'cinematic-metal-big', .8, { bright: 2 }], [.9, 'props-splash', .6], [1.15, 'boom-drop-strong', .4]]],
  ['backs', 3.2, [['l1', .3]], [[0, 'riser-2s-soft', .4], [.5, 'sting-bold-short', .45]]],
  ['fight', 3.6, [['l2', .2]], [[.4, 'swish-hard', .6], [.55, 'impact-light-firm', .5], [.9, 'bonk', .8], [1.25, 'swish-hard', .6], [1.6, 'bonk', .8], [2.0, 'impact-light-firm', .6], [2.3, 'bonk', .9], [2.9, 'swish-hard', .5], [3.0, 'bonk', .9]]],
  ['boss', 4.2, [['m1', .2], ['m2', AF('m1', .3)]], [[0, 'bass-rumble-long', .4], [.3, 'impact-heavy-hard', .7, { bright: 2 }], [1.0, 'impact-heavy-hard', .6, { bright: 2 }]]],
  ['rico', 3.0, [['m3', .1]], [[.4, 'whoosh-slow-hard', .45], [.75, 'bonk', .7], [1.0, 'bonk', .7], [1.25, 'bonk', .7], [1.5, 'bonk', .7], [1.95, 'cinematic-metal-massive', .6], [1.97, 'bonk', 1], [1.98, 'impact-heavy-hard', .9], [2.5, 'impact-deep-soft', .7]]],
  ['levelup', 3.2, [['n1', .5]], [[0, 'oc-MUSCStngr_LevelUpOrchestral_OS_01', .7], [.3, 'data-countup-medium', .5], [.2, 'shimmer-long-bright', .5], [-1.0, 'notification-success-fanfare', .45]]],
  ['freed', 3.6, [['o1', .5], ['o2', AF('o1', .3)]], [[0, 'mechanical-latch-heavy', .6], [.2, 'bsb-heavy-chain', .3], [1.2, 'pop-small-bubble', .55], [1.6, 'pop-small-bubble', .55], [2.0, 'pop-small-bubble', .55]]],
  ['jealous', 2.4, [['o3', .35]], [[.1, 'foley-fabric-slide', .5], [.2, 'transform-stretch', .4]]],
  ['throne', 5.0, [['p1', .3], ['p2', AF('p1', .35)]], [[0, 'bass-rumble-long', .5], [0, 'crackle', .3, { dur: 5 }], [.2, 'cinematic-thunder-big', .3]]],
  ['campfire', 4.0, [['q2', 1.3]], [[0, 'crackle', .35, { dur: 4.2 }], [.3, 'reverse-whoosh-medium-strong', .45], [.6, 'shimmer-long-soft', .5]]],
  ['offer', 2.4, [['q3', .3]], [[0, 'shimmer-medium-soft', .4], [.1, 'foley-fabric-slide', .3]]],
  ['trap', 4.0, [['q4', .25], ['q5', AF('q4', .2)], ['q6', AF('q5', .3)]], [[0, 'crackle', .25, { dur: 4.2 }], [2.0, 'pop-small-bubble', .4]]],
  ['ask', 3.4, [['r1', .35]], [[0, 'whoosh-medium-soft', .4], [.5, 'move-bounce', .5], [1.7, 'move-bounce', .4], [2.9, 'move-bounce', .4]]],
  ['split', 2.8, [], [[0, 'whoosh-medium-medium', .5], [.15, 'pop-large-in', .5], [.4, 'pop-large-in', .5], [.7, 'impact-medium-firm', .5], [1.2, 'sting-bright-long', .45]]],
];

export const SHOTS = []; export const VO = []; let at = 0;
for (const [id, min, vo, cues] of SPEC) {
  const off = {}; vo.forEach(([v, o]) => { off[v] = Array.isArray(o) ? off[o[1]] + D[o[1]] + o[2] : o; });
  const end = Math.max(min, ...vo.map(([v]) => off[v] + D[v] + .15));
  const a = Math.round(at * 30) / 30, b = Math.round((at + end) * 30) / 30;
  SHOTS.push({ id, a, b, cues }); vo.forEach(([v]) => VO.push({ id: v, t: +(a + off[v]).toFixed(3), d: D[v], who: SPEAKER[v] })); at = b; }
export const DUR = at;
export const SHOT = Object.fromEntries(SHOTS.map(s => [s.id, s]));
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
const S = id => SHOT[id].a, E = id => SHOT[id].b;
const GAIN = { n: 4.4, max: 4.4, lira: 4.6, slime: 4.6, imp: 4.6, elves: 4.6, king: 7.5, succ: 9 };
VO.forEach(v => CUES.push({ t: v.t, type: 'file', path: v.id === 'p1' ? 'projects/popal/assets/vo/ep1v5/m1.wav' : `projects/popal/assets/vo/ep2/${v.id}.wav`, gain: (v.id === 'm3' ? 6.5 : GAIN[v.who] ?? 4.4) }));
const M = 'projects/popal/assets/music/';
const music = (file, t0, t1, gain, from = 0) => CUES.push({ t: +t0.toFixed(2), type: 'file', path: M + file, gain, from, dur: +(t1 - t0).toFixed(2), voice: false });
music('isekai.wav', 0, S('net'), .34);
music('calm.wav', S('net'), S('sisters'), .3, 4);
music('dark.wav', S('sisters'), S('camp'), .3);
music('camp.wav', S('camp'), S('oops') + .85, .3);                     // «очень плохая музыка» бесов — обрывается на котле
music('battle.wav', S('backs'), E('rico') - .9, .4);                   // бой; пауза перед КРИТ
music('isekai.wav', S('levelup') + .2, S('throne'), .4, 20);
music('dark.wav', S('throne'), S('campfire'), .36, 6);
music('sultry.wav', S('campfire'), S('ask'), .32);
music('isekai.wav', S('ask'), DUR, .34, 40);
SHOTS.forEach(s => s.cues.forEach(([o, snd, gain, ex]) => { if (!gain) return; const t = +((o < 0 ? s.b : s.a) + o).toFixed(3);
  CUES.push(snd.includes('-') || snd.startsWith('oc') || snd.startsWith('bsb') ? { t, type: 'lib', id: snd, gain, ...(ex || {}) } : { t, type: snd === 'honk' ? 'horn' : snd, gain, ...(snd === 'honk' ? { dur: .35, pitch: 1.9 } : {}), ...(ex || {}) }); }));
CUES.push({ t: DUR - 2.5, type: 'wind', gain: .22, dur: 2.5 });          // хвост до последнего кадра

// табло героя: начало — итог серии 1, конец — 5 · 3 · 1 000 (план сериала)
export const STATS_EP2 = { start: STATS_EP1.end, end: { str: 5, hp: 3, aura: 1000 } };
const EV = () => [{ t: S('slap') + .65, aura: 90 }, { t: S('levelup') + .55, str: 5 }, { t: S('levelup') + .75, hp: 3 }, { t: S('levelup') + .95, aura: 1000 }];
export function statsAt(t) { const s = { ...STATS_EP2.start, hit: -9, gain: -9, loss: -9, hpBar: 1 }; let prev = 0;
  for (const e of EV()) { if (t < e.t) break; if (e.str) { s.str = e.str; s.gain = e.t; } if (e.hp) { s.hp = e.hp; s.gain = e.t; } if (e.aura != null) { prev = s.aura; s.aura = e.aura; if (e.aura > prev) s.gain = e.t; else s.loss = e.t; s.auraFrom = prev; s.auraAt = e.t; } }
  const hits = [S('land') + .5, S('oops') + .85, S('fight') + .55, S('fight') + 2.0];
  for (const h of hits) if (t >= h) s.hit = h;
  s.hpBar = t >= S('levelup') + .75 ? 1 : t < hits[0] ? 1 : t < hits[1] ? .8 : t < hits[2] ? .6 : t < hits[3] ? .4 : .25;
  return s; }
export const HUD_FROM = E('card') - .2;
export const HUD_HIDE = [[S('lore4'), E('lore4')], [S('motiv'), E('motiv')], [S('throne'), S('campfire')], [S('ask'), DUR + 1]];
// карточка героя — цифры итога серии 1
export const CARD = { ...STATS_EP1.end, item: 'Сковорода Судьбы', status: 'девственник', cls: 'Попаданец', lvl: 2 };
