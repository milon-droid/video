// «Блэкаут» с.2 «Хаос на улицах» — общие данные серии: тайминг от длин реплик, субтитры, табло, звуковые события.
// Время плана = max(минимум, реплики плана + хвост) — длина серии известна до рендера, перезапись голоса не ломает синхрон.
// Импортируют Remotion (TSX) и scripts/export-ep2.mjs (sfx-ep2.json, out/ep2.srt, storyboard/ep2.json).
import VO_DUR from '../data/ep2-durations.json' with { type: 'json' };
import WORDS from '../data/ep2-words.json' with { type: 'json' };
import { buildCaptions } from '../ep1/shared.mjs';

export const FPS = 30;
// реплики: текст субтитра (**акцент**), кто говорит
export const LINES = {
  n01: ['Стучал Алишер, наш друг. Он пришёл пешком **из метро**.'],
  a01: ['Поезд встал прямо в **тоннеле**!', 'alisher'],
  n02: ['Вагон дёрнулся, люди попадали, и свет **погас**.'],
  n03: ['Люди шли по шпалам до «Байконура» с **фонариками**.'],
  n04: ['Алишер живёт в Калкамане. Домой ему теперь **не добраться**.'],
  n05: ['А Диас думал только об **Аружан**.'],
  d01: ['Она ждёт у кафе. Я **иду** туда.', 'dias'],
  b01: ['Одного **не отпустим**.', 'beka'],
  n06: ['Вчетвером мы вышли в тёмный **город**.'],
  n07: ['И тут снова этот **гул**.'],
  n08: ['Над проспектом пронёсся **второй** истребитель.'],
  n09: ['Светофоры погасли. Улицы заполнились **людьми**.'],
  n10: ['Люди бежали прямо перед **бамперами**.'],
  d02: ['**Аружан**?!', 'dias'],
  n11: ['Но в такси сидел **незнакомый** старик.'],
  k01: ['До Арбата минут **двадцать**. Пошли.', 'alikhan'],
  n12: ['И вдруг сверху донеслись **удары** и скрежет.'],
  n13: ['Вниз по склону нёсся тяжёлый **самосвал**.'],
  n14: ['Водитель жал на тормоз. Педаль **проваливалась**.'],
  n15: ['И он **не тормозил**.'],
};
export const SPEAKER = Object.fromEntries(Object.entries(LINES).filter(([, v]) => v[1]).map(([k, v]) => [k, v[1]]));
// планы: [id, реплики, минимум (с), пауза до первой реплики, что в кадре]
const PLAN = [
  ['e2s01', ['n01'], 3.6, .3, 'дверь распахивается: Алишер в пыли, пар изо рта, луч фонарика'],
  ['e2s02', ['a01'], 2.8, .35, 'кухня в темноте: Алишер жадно пьёт из кружки, трое светят телефонами'],
  ['e2s03', ['n02'], 3.4, .35, 'воспоминание: вагон тормозит, люди падают вперёд, лампы гаснут'],
  ['e2s04', ['n03'], 3.6, .2, 'тоннель в перспективу: цепочка людей с фонариками по шпалам, впереди огонёк станции'],
  ['e2s05', ['n04'], 3.8, .25, 'кухня: Алишер садится, на телефоне «Нет сети», Бека кладёт руку на плечо'],
  ['e2s06', ['n05'], 3.0, .25, 'Диас у окна натягивает куртку, хватает ключи, в очках — фары внизу'],
  ['e2s07a', [], 1.7, 0, 'телефон Диаса: «Ты где? Ответь» — «Не доставлено», батарея 31%'],
  ['e2s07b', ['d01'], 2.6, .1, 'лицо Диаса: решился'],
  ['e2s08', ['b01'], 2.8, .7, 'механические часы Алихана 20:05 крупно; Бека в олимпийке'],
  ['e2s09', ['n06'], 3.2, .3, 'лестница сверху вниз: перила спиралью, четверо бегут вниз с фонариками'],
  ['e2s10', ['n07'], 3.2, .9, 'двор: выходят из подъезда, листья; нарастает гул, все поднимают головы'],
  ['e2s11', ['n08'], 3.2, .2, 'истребитель низко над проспектом, тень по толпе, люди пригибаются'],
  ['e2s12', ['n09'], 3.8, .3, 'проспект: толпа с фонариками, мёртвые светофоры, поток фар'],
  ['e2s13', ['n10'], 3.2, .3, 'перекрёсток: люди перебегают перед бамперами, водитель сигналит'],
  ['e2s14a', ['d02'], 1.9, .55, 'Диас бросается к такси с шашечкой'],
  ['e2s14b', ['n11'], 2.9, .3, 'в окне такси — незнакомый старик; плечи Диаса опускаются'],
  ['e2s15', ['k01'], 3.0, .3, 'Алихан догоняет; умные часы Беки: НЕТ СЕТИ, пульс 128'],
  ['e2s16', ['n12'], 3.2, .25, 'сверху удары и скрежет: четверо резко оборачиваются, стоп-кадр'],
  ['e2s17', ['n13'], 3.2, .2, 'вниз по склону несутся фары самосвала, искры о припаркованные машины'],
  ['e2s18', ['n14'], 3.4, .2, 'кабина: водитель жмёт тормоз, педаль в пол, приборка мигает'],
  ['e2s19', [], 2.2, 0, 'четверо застыли, фары в лоб, лица заливает белым'],
  ['e2s20', [], 1.0, 0, 'фары на весь кадр, тишина'],
  ['e2s21', ['n15'], 1.8, .35, 'шёпот на белом'],
  ['e2s22', [], 2.6, 0, 'EndCard: ОН НЕ ТОРМОЗИТ · ЧАСТЬ 3 →'],
];
const GAP = .14, TAIL = .3;
export const VO_AT = {}; export const SHOTS = [];
{ let t = 0;
  for (const [id, vo, min, lead, what] of PLAN) { let v = t + lead;
    for (const k of vo) { VO_AT[k] = +v.toFixed(3); v += (VO_DUR[k] ?? 2) + GAP; }
    const end = Math.max(t + min, vo.length ? v - GAP + TAIL : 0); SHOTS.push([id, +t.toFixed(3), +end.toFixed(3), what]); t = end; } }
export const DUR = SHOTS[SHOTS.length - 1][2];
export const SH = Object.fromEntries(SHOTS.map(([id, a, b]) => [id, [a, b]]));
export const VO_END = id => VO_AT[id] + (VO_DUR[id] ?? 2);
// время слова: из ep2-words.json (относительно начала реплики), иначе — равномерно
export const VT = id => { const n = LINES[id][0].replace(/\*\*/g, '').split(/\s+/).filter(w => w && w !== '—').length;
  const w = WORDS[id]; if (w && w.length === n) return w.map(x => +(x + VO_AT[id]).toFixed(3));
  const d = VO_DUR[id] ?? 2; return Array.from({ length: n }, (_, i) => +(VO_AT[id] + d * i / n * .92).toFixed(3)); };
const shotOf = id => SHOTS.find(([, a, b]) => VO_AT[id] >= a && VO_AT[id] < b);
export const CAPS = buildCaptions(Object.keys(LINES).filter(k => k in VO_AT).map(k => { const s = shotOf(k), b = Math.max(VO_END(k) + .25, s ? s[2] : 0);
  return [VO_AT[k], k === 'n15' ? SH.e2s21[1] + 1.7 : b, LINES[k][0], { times: VT(k), speaker: SPEAKER[k] || 'narrator' }]; }));

// ───── табло: 20:04 → (воспоминание 20:01 с перемоткой) → 20:09; связи нет всю серию ─────
const FB = [SH.e2s03[0], SH.e2s05[0]];
export const REWIND = [FB[0], FB[0] + .6];
const CLOCK = [[0, '20:04'], [REWIND[1], '20:01'], [FB[1], '20:04'], [SH.e2s06[0], '20:05'], [SH.e2s10[0], '20:06'], [SH.e2s12[0], '20:07'], [SH.e2s14a[0], '20:08'], [SH.e2s16[0], '20:09']];
export function storyAt(t) { const pick = arr => { let i = arr.length - 1; while (i > 0 && arr[i][0] > t) i--; return arr[i][1]; };
  let time = pick(CLOCK), rewind = 0;
  if (t >= REWIND[0] && t < REWIND[1]) { rewind = (t - REWIND[0]) / (REWIND[1] - REWIND[0]); time = '20:0' + Math.round(4 - 3 * rewind); }
  return { time, signal: 'lost', rewind, flashback: t >= FB[0] && t < FB[1] }; }

// ключевые моменты
export const T = {
  doorOpen: .25, gulp: SH.e2s02[0] + .3, brake: SH.e2s03[0] + .75, lampsOff: SH.e2s03[0] + 1.6,
  jacket: SH.e2s06[0] + .2, keys: SH.e2s06[0] + 1.9, fail: SH.e2s07a[0] + .55,
  rumble: SH.e2s10[0] + .5, jet: SH.e2s11[0] + .5, horn: SH.e2s13[0] + 1.1, taxiRun: SH.e2s14a[0] + .1, knockGlass: SH.e2s14a[0] + .5,
  crash1: SH.e2s16[0] + .1, turn: SH.e2s16[0] + .7, freeze: SH.e2s16[0] + 1.1, sparks: SH.e2s17[0] + 1.3, pedal: SH.e2s18[0] + 1.0,
  white: SH.e2s20[0], end: SH.e2s22[0],
};

// ───── звук (только CC0-библиотеки и синтез), дрон без дыр; в конце — хвост ветра до последнего кадра ─────
const VOP = id => `projects/blackout/assets/vo/ep2v2/${id}.wav`, BED = 'projects/blackout/assets/drone.wav', BEDM = 'projects/blackout/assets/drone-muffled.wav';
export const VO_GAIN = {};
const range = (a, n, d) => Array.from({ length: n }, (_, i) => +(a + i * d).toFixed(3));
const s = id => SH[id][0];
export const CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: VOP(id), gain: VO_GAIN[id] || 4.2 })),
  { t: 0, type: 'file', path: BEDM, gain: .55, dur: T.white - .3 }, { t: T.white + 1.0, type: 'file', path: BEDM, gain: .4, from: 30, dur: DUR - T.white - 1.0 },
  // 1. дверь: щеколда, скрип, тяжёлое дыхание
  { t: .05, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: .1, type: 'click', gain: .3, pitch: .6 }, { t: .2, type: 'skid', dur: .5, gain: .12, pitch: .35 }, { t: .55, type: 'thud', gain: .3, pitch: .8 }, { t: .3, type: 'wind', dur: 3, gain: .07 },
  ...[.7, 1.5, 2.3, 3.0].map(t => ({ t, type: 'breath_in', dur: .45, gain: .14 })),
  // 2. кухня: глотки, тиканье
  ...[0, .45, .9].map(d => ({ t: T.gulp + d, type: 'bloop', gain: .12, pitch: .5 })), ...range(s('e2s02'), 5, .55).map(t => ({ t, type: 'tick', gain: .12, pitch: .9 })),
  // 3. воспоминание: перемотка, торможение, удар, лампы гаснут
  { t: REWIND[0], type: 'rewind', dur: .6, gain: .4 }, { t: REWIND[0], type: 'glitch', gain: .18 }, { t: s('e2s03') + .3, type: 'engine', dur: 1.2, gain: .12, pitch: 1.4 },
  { t: T.brake - .1, type: 'skid', dur: 1.3, gain: .3, pitch: 1.6 }, { t: T.brake + .35, type: 'lib', id: 'impact-deep-hard', gain: .45 }, { t: T.brake + .4, type: 'murmur', dur: 1.2, gain: .14, pitch: 1.4 },
  ...[0, .25, .5].map(d => ({ t: T.lampsOff + d, type: 'click', gain: .18, pitch: .5 })), { t: T.lampsOff + .5, type: 'powerdown', dur: .9, gain: .3 },
  // 4. тоннель: шаги с эхом, капли
  ...range(s('e2s04') + .1, 12, .3).map((t, i) => ({ t, type: 'step', gain: .1 + (i % 3) * .02, pitch: .7 + (i % 4) * .05 })), { t: s('e2s04'), type: 'hum', dur: SH.e2s04[1] - SH.e2s04[0], gain: .05, pitch: .6 },
  ...[.6, 1.7, 2.9].map(d => ({ t: s('e2s04') + d, type: 'bloop', gain: .06, pitch: 1.8 })),
  // 5–8. кухня: стул, рука на плечо, куртка, ключи, «не доставлено», часы
  { t: s('e2s05') + .3, type: 'lib', id: 'foley-fabric-slide', gain: .3 }, { t: s('e2s05') + 1.6, type: 'lib', id: 'foley-fabric-touch', gain: .3 },
  { t: T.jacket, type: 'lib', id: 'foley-fabric-slide', gain: .4 }, { t: T.jacket + .5, type: 'lib', id: 'foley-fabric-touch', gain: .3 }, { t: T.keys, type: 'tinkle', dur: .35, gain: .3, pitch: 1.6 },
  { t: s('e2s07a') + .15, type: 'lib', id: 'click-tap-soft', gain: .25 }, { t: T.fail, type: 'lib', id: 'notification-failure-thud', gain: .5 },
  ...range(s('e2s08'), 6, .5).map(t => ({ t, type: 'tick', gain: .3, pitch: .9 })), { t: s('e2s08') + .2, type: 'lib', id: 'foley-fabric-slide', gain: .3 },
  // 9–10. лестница, двор, гул
  ...range(s('e2s09') + .1, 14, .2).map((t, i) => ({ t, type: 'step', gain: .2 + (i % 2) * .05, pitch: .8 + (i % 3) * .1 })), { t: s('e2s09'), type: 'hum', dur: 3, gain: .04, pitch: .5 },
  { t: s('e2s10') + .1, type: 'thud', gain: .35 }, { t: s('e2s10') + .12, type: 'knock', gain: .3, pitch: .7 }, { t: s('e2s10'), type: 'wind', dur: SH.e2s10[1] - SH.e2s10[0] + .3, gain: .12 },
  { t: T.rumble, type: 'roar', dur: SH.e2s11[0] - T.rumble + .6, attack: 2.4, dist: .9, pitch: .45, gain: .45 }, { t: T.rumble + .8, type: 'rattle', dur: 1.6, gain: .12 },
  // 11. истребитель
  { t: T.jet - 1.2, type: 'jet', dur: 5.2, peak: .26, gain: .8 }, { t: T.jet + .35, type: 'lib', id: 'impact-deep-firm', gain: .5 }, { t: T.jet + .4, type: 'rattle', dur: 1.6, gain: .3 }, { t: T.jet + .5, type: 'murmur', dur: 1.6, gain: .2, pitch: 1.5 },
  // 12–13. проспект, перекрёсток
  { t: s('e2s12'), type: 'murmur', dur: 3.8, gain: .16, pitch: 1.2 }, { t: s('e2s12'), type: 'engine', dur: 3.8, gain: .08, pitch: .6 }, ...[.8, 2.1, 3.0].map((d, i) => ({ t: s('e2s12') + d, type: 'horn', dur: .25 + i * .1, gain: .08 })),
  { t: s('e2s13'), type: 'murmur', dur: 3.2, gain: .18, pitch: 1.4 }, { t: T.horn, type: 'horn', dur: 1.1, gain: .2 }, { t: T.horn - .4, type: 'skid', dur: .6, gain: .2 }, { t: s('e2s13') + 2.3, type: 'horn', dur: .3, gain: .12, pitch: 1.2 },
  // 14–15. такси, часы
  ...range(T.taxiRun, 4, .14).map(t => ({ t, type: 'step', gain: .2, pitch: 1.1 })), ...[0, .18].map(d => ({ t: T.knockGlass + d, type: 'knock', gain: .3, pitch: 1.6 })), { t: s('e2s14a'), type: 'engine', dur: 4.8, gain: .1, pitch: .5 },
  { t: s('e2s14b') + 1.6, type: 'lib', id: 'bass-rumble-medium', gain: .18 }, { t: s('e2s15') + .4, type: 'beep', gain: .15, pitch: 1.4 }, { t: s('e2s15'), type: 'murmur', dur: 3, gain: .12, pitch: 1.2 },
  // 16–18. удары и скрежет, самосвал, кабина
  { t: T.crash1, type: 'lib', id: 'impact-deep-hard', gain: .5 }, { t: T.crash1 + .05, type: 'boom', gain: .2 }, { t: T.crash1 + .5, type: 'skid', dur: 1.5, gain: .35, pitch: .7 }, { t: T.crash1 + 1.3, type: 'lib', id: 'impact-deep-firm', gain: .4 },
  { t: T.turn, type: 'lib', id: 'whoosh-slow-hard', gain: .3 }, { t: T.freeze, type: 'lib', id: 'bass-sub-drop-short', gain: .4 }, { t: s('e2s16') + 1.0, type: 'murmur', dur: 2, gain: .2, pitch: 1.7 },
  { t: s('e2s17'), type: 'engine', dur: 3.4, gain: .35, pitch: .4 }, { t: s('e2s17') + .5, type: 'horn', dur: 2.6, gain: .25, pitch: .7 }, ...[T.sparks, T.sparks + .7].map(t => ({ t, type: 'lib', id: 'impact-deep-hard', gain: .45 })), { t: T.sparks, type: 'zap', dur: .5, gain: .2 }, { t: T.sparks + .1, type: 'skid', dur: 1.2, gain: .3, pitch: .6 },
  { t: s('e2s18'), type: 'engine', dur: 3.4, gain: .3, pitch: .45 }, ...range(s('e2s18') + .3, 6, .5).map((t, i) => ({ t, type: 'heartbeat', gain: .25 + i * .02, pitch: .9 + i * .05 })), ...range(T.pedal, 5, .32).map(t => ({ t, type: 'beep', gain: .1, pitch: 2 })), { t: T.pedal, type: 'thud', gain: .3, pitch: .7 },
  // 19–20. фары в лоб: гудок нарастает и обрывается на белом; секунда «тишины» — только ветер
  { t: s('e2s19'), type: 'horn', dur: T.white - s('e2s19'), gain: .35, pitch: .7 }, { t: s('e2s19'), type: 'engine', dur: T.white - s('e2s19'), gain: .4, pitch: .5 }, ...range(s('e2s19') + .2, 4, .42).map(t => ({ t, type: 'heartbeat', gain: .3, pitch: 1.2 })),
  { t: T.white, type: 'wind', dur: DUR - T.white, gain: .05 }, { t: T.end, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: T.end + 1.6, type: 'tick', gain: .12, pitch: .9 },
];
