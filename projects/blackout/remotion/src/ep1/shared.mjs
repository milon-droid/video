// «Блэкаут» с.1 v3 — общие данные серии: тайминг, планы, субтитры, табло, звуковые события.
// Импортируют и Remotion (TSX), и node-скрипт scripts/export-ep1.mjs (sfx-ep1.json, ep1.srt, storyboard/ep1.json).
import WORDS from '../data/words.json' with { type: 'json' };

export const FPS = 30, DUR = 83.8;
export const OUT = 62.6; // 20:03 — свет гаснет в кухне
export const VO_AT = { n01: .05, n02: 3.1, n03: 6.1, a01: 10.4, n04: 14.1, n05: 19.25, n06: 22.3, n07: 25.15, d01: 29.15, b01: 31.3, n08: 35.2, d02: 41.9, an1: 44.95, an2: 47.2, an3: 53.0, an4: 58.15, n09: 64.55, n10: 71.5, n11: 76.6 };
export const VO_GAIN = { n01: 8, n07: 6.5, n11: 12, d02: 9.5, an4: 7, a01: 4.6, b01: 4.4, d01: 4.6 };
export const VO_CUT = { an4: 2.98 };
export const SPEAKER = { a01: 'alikhan', d01: 'dias', d02: 'dias', b01: 'beka', an1: 'anchor', an2: 'anchor', an3: 'anchor', an4: 'anchor' };
export const VT = id => WORDS[id] ? WORDS[id].map(x => +(x + VO_AT[id]).toFixed(3)) : null;
export const KNOCK_AT = VT('n11')[5]; // первый удар — на слове «застучал»
export const KNOCKS = (() => { const a = []; let t = KNOCK_AT; for (const d of [.42, .32, .3, .3, .28, .34, .3, .28, .3]) { a.push(+t.toFixed(3)); t += d; } return a; })();
export const KNOCKS_END = [80.95, 81.25, 81.55];
export const HOOK_K = [.15, .42, .7, .98];
export const REWIND = [1.2, 1.9];
export const CITY = { zhk: 64.5, people: 65.55, nt: 66.6, cat: 67.75, kt: 68.75 };
export const MAP_OFF = { europe: 47.9, russia: 49.0, japan: 50.6, wkz: 59.9 };

// планы: [id, начало, конец, что в кадре]
export const SHOTS = [
  ['e1s01', 0, 3.0, 'хук: 20:03, прихожая в темноте, дверь дёргается от ударов, перемотка на «пять» → 19:58'],
  ['e1s02', 3.0, 6.0, 'угол сталинки снизу вверх, таблички на глухом простенке угла'],
  ['e1s03', 6.0, 7.9, 'кухня, общий план: Бека заливает три доширака, Алихан у компьютера, Диас у гладильной доски'],
  ['e1s04', 7.9, 10.3, 'три панели-комикса: ЗУБРИТ / ЛИСТАЕТ / ГЛАДИТ'],
  ['e1s05', 10.3, 14.0, 'Алихан за компьютером, ест не отрываясь'],
  ['e1s06', 14.0, 15.9, 'Диас гладит рубашку на доске, на подоконнике вибрирует телефон'],
  ['e1s07a', 15.9, 17.4, 'лицо Диаса, экран в очках'],
  ['e1s07b', 17.4, 19.0, 'чат с Аружан: «Уже в такси» / «Буду у кафе через 15 минут»'],
  ['e1s08a', 19.0, 20.7, 'Диас печатает «Выхожу через 5 минут», две галочки'],
  ['e1s08b', 20.7, 22.0, 'Диас в рубашке застёгивается, улыбается'],
  ['e1s09', 22.0, 25.0, 'рябь в чашке, вилка дрожит, календарь и стекло дрожат'],
  ['e1s10', 25.0, 27.4, 'истребитель над крышами, тряска'],
  ['e1s11', 27.4, 29.0, 'кухня: люстра раскачивается, коробки подпрыгивают'],
  ['e1s12', 29.0, 31.0, 'Диас застыл с утюгом: «Это что за хрень?!»'],
  ['e1s13', 31.0, 33.2, 'Бека хватает телефон, роутер мигает красным'],
  ['e1s14', 33.2, 35.0, 'паблик «АЛМАТЫ СЕЙЧАС» — Connecting…, 4G и Wi-Fi перечёркнуты'],
  ['e1s15a', 35.0, 37.3, 'Диас пишет, экран в очках'],
  ['e1s15b', 37.3, 40.0, 'чат: «Ты где? Ответь» — «Не доставлено»'],
  ['e1s16a', 40.0, 41.8, 'вызов «Аружан» → «Нет сети»'],
  ['e1s16b', 41.8, 44.0, 'Диас с телефоном у уха, шёпот'],
  ['e1s17', 44.0, 47.0, 'Алихан включает ТВ с пульта: экстренный выпуск'],
  ['e1s18a', 47.0, 48.7, 'видео очевидцев: Европа, взрыв подстанции'],
  ['e1s18b', 48.7, 50.4, 'видео: Россия, город гаснет под молниями'],
  ['e1s18c', 50.4, 52.0, 'видео: Япония, неон гаснет'],
  ['e1s19a', 52.0, 55.4, 'карта: тьма с запада и востока'],
  ['e1s19b', 55.4, 57.2, 'лица в синем свете ТВ'],
  ['e1s20a', 57.2, 59.3, 'диктор сбивается, ей подают листок'],
  ['e1s20b', 59.3, 61.2, 'карта: гаснет Западный Казахстан, тьма у Алматы'],
  ['e1s21', 61.2, 62.3, 'ТВ схлопывается в точку'],
  ['e1s22', 62.3, 64.3, 'кухня: гаснут монитор, люстра, утюг'],
  ['e1s23a', 64.3, 65.3, 'ЖК гаснут сверху вниз'],
  ['e1s23b', 65.3, 66.4, 'прохожие замирают, включают фонарики'],
  ['e1s23c', 66.4, 67.5, '«Нурлы Тау» и гостиница гаснут по этажам'],
  ['e1s23d', 67.5, 68.5, 'собор гаснет'],
  ['e1s23e', 68.5, 69.6, 'огни Кок-Тобе мигают и гаснут'],
  ['e1s23f', 69.6, 71.2, 'общий план: тёмный город, горы под луной, редкие фары'],
  ['e1s24', 71.2, 73.4, 'Диас у тёмного окна, «Не доставлено» в очках'],
  ['e1s25', 73.4, 75.6, 'вид вниз на проспект: фары, такси, мигалки, фонарики'],
  ['e1s26', 75.6, 76.6, 'тишина: трое в темноте, отсвет мигалок на потолке'],
  ['e1s27', 76.6, 77.9, 'шёпот; на «застучал» — удар, все к двери'],
  ['e1s28', 77.9, 80.8, 'дверь в луче, частые удары, свет и тень ног под дверью'],
  ['e1s29', 80.8, DUR, 'EndCard: КТО-ТО СТУЧИТ · ЧАСТЬ 2 →'],
];

// ───── субтитры: фразы по 3–5 слов, предлог не висит в конце ─────
const GLUE = new Set(['В', 'ВО', 'НА', 'К', 'КО', 'С', 'СО', 'У', 'О', 'ОБ', 'ПО', 'ИЗ', 'ЗА', 'ДО', 'ОТ', 'НЕ', 'НИ', 'И', 'А', 'НО', 'ДЛЯ', 'ПРО', 'ПРИ', 'БЕЗ', '—']);
export const glued = w => GLUE.has(w.text.replace(/[«»"]/g, '')) || /^\d/.test(w.text);
export function buildCaptions(list, { lead = .05, tail = .35 } = {}) { const out = [];
  for (const [a, b, raw, opt = {}] of list) { const words = []; let acc = false;
    for (const tok of raw.split(/\s+/).filter(Boolean)) { let w = tok; if (w.startsWith('**')) { acc = true; w = w.slice(2); } const en = w.includes('**'); w = w.replace(/\*\*/g, ''); words.push({ text: w.toUpperCase(), accent: acc }); if (en) acc = false; }
    const segs = []; let cur = []; words.forEach(w => { cur.push(w); if (/[.!?…]$/.test(w.text)) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const split = []; for (const sg of segs) { if (sg.length <= 5) { split.push(sg); continue; } const parts = Math.ceil(sg.length / 5), per = Math.ceil(sg.length / parts); for (let i = 0; i < sg.length; i += per) split.push(sg.slice(i, i + per)); }
    const nw = x => x.filter(w => w.text !== '—').length, ph = [];
    for (const sg of split) { const last = ph[ph.length - 1]; if (last && (nw(last) < 3 || nw(sg) < 3) && nw(last) + nw(sg) <= 5) last.push(...sg); else if (last && nw(sg) < 2) { const all = [...last, ...sg], h = Math.ceil(all.length / 2); ph[ph.length - 1] = all.slice(0, h); ph.push(all.slice(h)); } else ph.push([...sg]); }
    for (let i = 0; i < ph.length - 1; i++) while (ph[i].length > 1 && glued(ph[i][ph[i].length - 1])) ph[i + 1].unshift(ph[i].pop());
    const n = words.length, t0 = a + lead, t1 = b - tail; let k = 0, j = 0, prev = t0;
    for (const p of ph) { for (const w of p) { if (opt.times) { w.t = w.text === '—' ? prev : +(opt.times[j++] ?? prev).toFixed(3); prev = w.t; } else w.t = +(t0 + (t1 - t0) * k / n).toFixed(3); k++; }
      out.push({ a: p[0].t, b, words: p.filter(w => w.text !== '—'), speaker: opt.speaker || 'narrator' }); } }
  out.forEach((p, i) => { const nx = out[i + 1]; if (nx && nx.a < p.b) p.b = nx.a; }); return out; }
const hook0 = (() => { const v = VT('n01'); v[0] = 0; return v; })();
export const CAPS = buildCaptions([
  [0, 3.0, 'До конца света оставалось **пять минут**', { times: hook0 }],
  [3.0, 6.0, 'Старая **сталинка** на Абая — Байтурсынова', { times: VT('n02') }],
  [6.0, 10.3, 'Мы ужинали дошираком. Каждый был занят **своим**.', { times: VT('n03') }],
  [10.3, 14.0, 'Не мешайте, у меня завтра **рубежка**.', { times: VT('a01'), speaker: 'alikhan' }],
  [14.0, 19.0, 'А у Диаса — свидание. Она уже ехала на **такси**.', { times: VT('n04') }],
  [19.0, 22.0, 'Это сообщение ещё успело **дойти**.', { times: VT('n05') }],
  [22.0, 25.0, 'Сначала задрожали **стены**.', { times: VT('n06') }],
  [25.0, 29.0, 'Над крышей с рёвом пронёсся **истребитель**.', { times: VT('n07') }],
  [29.0, 31.0, 'Это что за **хрень**?!', { times: VT('d01'), speaker: 'dias' }],
  [31.0, 35.0, 'Надо чекнуть паблики, чьи это **учения**!', { times: VT('b01'), speaker: 'beka' }],
  [35.0, 40.0, 'Диас написал ей. Сообщения **не доходили**.', { times: VT('n08') }],
  [40.0, 44.0, 'Давай же… **давай**…', { times: VT('d02'), speaker: 'dias' }],
  [44.0, 47.0, 'Внимание. **Экстренное** сообщение.', { times: VT('an1'), speaker: 'anchor' }],
  [47.0, 52.9, 'Масштабные перебои в России, в Восточной Европе и даже в **Японии**.', { times: VT('an2'), speaker: 'anchor' }],
  [52.9, 58.1, 'Из Европы передают: молнии уничтожают **подстанции**.', { times: VT('an3'), speaker: 'anchor' }],
  [58.1, 61.2, 'Простите… Блэкаут накрыл весь **Западный Казахстан**…', { times: VT('an4').slice(0, 6), speaker: 'anchor' }],
  [64.3, 69.2, 'И весь Алматы погрузился во **тьму**.', { times: VT('n09') }],
  [71.2, 75.6, 'А где-то там, в темноте, ехала **Аружан**.', { times: VT('n10') }],
  [76.6, 80.8, 'И в этой тьме кто-то **застучал** в дверь.', { times: VT('n11') }],
]);

// ───── табло: время и связь (раздел 8 ТЗ) ─────
const CLOCK = [[0, '20:03'], [1.9, '19:58'], [14.0, '19:59'], [19.0, '20:00'], [25.0, '20:01'], [44.0, '20:02'], [OUT, '20:03']], SIGNAL = [[0, 'lost'], [1.9, 'full'], [33.6, 'lost']];
export function storyAt(t) { const pick = arr => { let i = arr.length - 1; while (i > 0 && arr[i][0] > t) i--; return arr[i][1]; }; let time = pick(CLOCK), rewind = 0;
  if (t >= REWIND[0] && t < REWIND[1]) { rewind = (t - REWIND[0]) / (REWIND[1] - REWIND[0]); const e = rewind < .5 ? 2 * rewind * rewind : 1 - (-2 * rewind + 2) ** 2 / 2, m = Math.round(3 - 5 * e); time = m >= 0 ? '20:0' + m : '19:5' + (10 + m); }
  return { time, signal: pick(SIGNAL), rewind }; }

// ───── звук: события для tools/sfx.py (только CC0 и синтез), дрон без дыр, вместо цифровой тишины — фон комнаты ─────
const VOP = id => `projects/blackout/assets/vo/ep1/${id}.wav`, BED = 'projects/blackout/assets/drone.wav', BEDM = 'projects/blackout/assets/drone-muffled.wav';
const knock = (t, g = 1) => [{ t, type: 'knock', gain: .9 * g, pitch: .9 + (t * 7 % 1) * .2 }, { t: t + .005, type: 'lib', id: 'impact-deep-soft', gain: .25 * g }];
const range = (a, n, d) => Array.from({ length: n }, (_, i) => +(a + i * d).toFixed(3));
export const CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: VOP(id), gain: VO_GAIN[id] || 4.2, ...(VO_CUT[id] ? { dur: VO_CUT[id] } : {}) })),
  { t: 0, type: 'file', path: BED, gain: .5, dur: 62.6 }, { t: OUT, type: 'file', path: BEDM, gain: .6, from: 2, dur: 75.6 - OUT }, { t: 76.6, type: 'file', path: BEDM, gain: .45, from: 20, dur: 5.3 },
  // хук
  { t: .15, type: 'lib', id: 'impact-deep-hard', gain: .5 }, ...HOOK_K.flatMap(k => knock(k, .6)), { t: .2, type: 'rattle', dur: .9, gain: .25 }, { t: REWIND[0], type: 'rewind', dur: .7, gain: .5 }, { t: REWIND[0], type: 'glitch', gain: .2 }, { t: REWIND[1], type: 'lib', id: 'whoosh-slow-hard', gain: .2 },
  // город и кухня
  { t: 3.0, type: 'murmur', dur: 3, gain: .06, pitch: .7 }, { t: 3.0, type: 'engine', dur: 3, gain: .05, pitch: .6 }, { t: 3.0, type: 'wind', dur: 3, gain: .08 }, { t: 4.3, type: 'lib', id: 'foley-paper-touch', gain: .2 },
  { t: 6.1, type: 'hiss', dur: .9, lo: 400, hi: 3000, gain: .12, pulse: 7 }, { t: 7.25, type: 'lib', id: 'foley-fabric-touch', gain: .2 }, { t: 7.45, type: 'lib', id: 'foley-fabric-touch', gain: .2 },
  ...[7.95, 8.05, 8.15].map(t => ({ t, type: 'lib', id: 'swipe-fast-soft', gain: .2 })), { t: 8.4, type: 'lib', id: 'keyboard-letter-soft', gain: .2 }, { t: 9.0, type: 'lib', id: 'click-tap-soft', gain: .2 }, { t: 9.6, type: 'hiss', dur: .5, lo: 2000, hi: 8000, gain: .07 },
  ...range(10.4, 22, .16).map((t, i) => ({ t: t + (i % 3) * .03, type: 'lib', id: i % 2 ? 'keyboard-letter-soft' : 'keyboard-letter-medium', gain: .22 })),
  ...[14.2, 14.55, 14.9, 15.25].map(t => ({ t, type: 'hiss', dur: .4, lo: 2000, hi: 8000, gain: .08 })), { t: 14.9, type: 'lib', id: 'phone-vibrate-table', gain: .5 }, { t: 17.7, type: 'lib', id: 'notification-message-in-clear', gain: .5 },
  ...range(19.1, 6, .1).map(t => ({ t, type: 'lib', id: 'click-tap-soft', gain: .2 })), { t: 19.85, type: 'lib', id: 'notification-message-out-clear', gain: .45 }, { t: 20.7, type: 'lib', id: 'foley-fabric-slide', gain: .25 },
  // предвестие и истребитель
  { t: 22.0, type: 'roar', dur: 3.6, attack: 3.0, dist: .9, pitch: .45, gain: .5 }, { t: 22.2, type: 'rattle', dur: 2.6, gain: .12 }, { t: 23.4, type: 'rattle', dur: 1.6, gain: .15, pitch: 1.4 },
  { t: 24.4, type: 'jet', dur: 5.6, peak: .26, gain: .8 }, { t: 25.85, type: 'lib', id: 'impact-deep-firm', gain: .5 }, { t: 25.9, type: 'rattle', dur: 1.8, gain: .3 }, { t: 27.4, type: 'tinkle', dur: 2.2, gain: .35 }, { t: 27.4, type: 'rattle', dur: 1.4, gain: .35, pitch: .8 }, ...[27.5, 27.75, 28.0].map(t => ({ t, type: 'bonk', gain: .15, pitch: 1.5 })),
  { t: 29.15, type: 'hiss', dur: .5, lo: 2000, hi: 8000, gain: .05 }, { t: 31.05, type: 'lib', id: 'foley-fabric-slide', gain: .3 }, { t: 32.8, type: 'lib', id: 'notification-failure-low', gain: .35 },
  { t: 33.5, type: 'lib', id: 'click-tap-firm', gain: .4 }, { t: 33.6, type: 'glitch', gain: .12 }, { t: 34.2, type: 'lib', id: 'click-tap-firm', gain: .4 },
  ...[35.4, 35.55, 35.7, 36.2, 36.35, 37.3].map(t => ({ t, type: 'lib', id: 'click-tap-soft', gain: .25 })), { t: 38.4, type: 'lib', id: 'notification-failure-thud', gain: .5 },
  ...[40.3, 40.75].map(t => ({ t, type: 'tone', freq: 425, dur: .35, gain: .14 })), ...[41.1, 41.45, 41.8].map(t => ({ t, type: 'tone', freq: 425, dur: .2, gain: .16 })), ...[42.6, 42.85, 43.1, 43.35].map(t => ({ t, type: 'tone', freq: 425, dur: .14, gain: .03 })),
  // телевизор и новости: больше экшена — сирены, взрыв подстанции, гром, толпа
  { t: 44.2, type: 'lib', id: 'click-button-firm', gain: .5 }, { t: 44.3, type: 'murmur', dur: .5, gain: .12, pitch: 1.3 }, { t: 44.85, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: 44.88, type: 'chord', notes: [146.8, 220, 293.7], dur: 1.2, attack: .02, gain: .18 },
  { t: 47.0, type: 'siren', dur: 1.7, dist: .5, gain: .22 }, { t: 47.0, type: 'murmur', dur: 1.7, gain: .14, pitch: 1.6 }, { t: 47.75, type: 'zap', dur: .5, gain: .25 }, { t: 47.8, type: 'lib', id: 'impact-deep-hard', gain: .5 }, { t: 47.8, type: 'boom', gain: .25 },
  { t: 48.7, type: 'lib', id: 'cinematic-thunder-big', gain: .3 }, { t: 49.0, type: 'lib', id: 'bass-sub-drop-short', gain: .4 }, { t: 48.7, type: 'murmur', dur: 1.7, gain: .12, pitch: 1.3 },
  { t: 50.4, type: 'murmur', dur: 1.6, gain: .14, pitch: 1.8 }, { t: 50.6, type: 'powerdown', dur: .9, gain: .3 }, { t: 50.4, type: 'siren', dur: 1.6, dist: .7, gain: .14, pitch: 1.1 },
  { t: 52.0, type: 'lib', id: 'bass-rumble-medium', gain: .3 }, { t: 52.6, type: 'lib', id: 'cinematic-thunder-big', gain: .15 }, { t: 54.2, type: 'lib', id: 'bass-rumble-medium', gain: .25 },
  ...[55.4, 56.2, 57.4, 58.2, 59.0, 59.7, 60.4].map((t, i) => ({ t, type: 'heartbeat', gain: .25 + i * .02, pitch: .8 + i * .04 })), { t: 57.8, type: 'lib', id: 'foley-paper-slide', gain: .3 },
  { t: MAP_OFF.wkz, type: 'lib', id: 'bass-sub-drop-short', gain: .45 }, { t: 60.4, type: 'lib', id: 'bass-rumble-medium', gain: .3 },
  // блэкаут
  { t: 61.15, type: 'lib', id: 'digital-corrupt', gain: .4 }, { t: 61.2, type: 'zap', dur: .35, gain: .2 }, { t: 61.3, type: 'lib', id: 'bsb-crt-off', gain: .4, align: 'start', dur: .9 },
  { t: OUT - .25, type: 'zap', dur: .2, gain: .12 }, { t: OUT, type: 'lib', id: 'click-toggle-on-soft', gain: .5 }, { t: OUT, type: 'powerdown', dur: 1.3, gain: .45 }, { t: OUT + .02, type: 'powerdown', dur: .5, gain: .2, pitch: 2.2 }, { t: OUT, type: 'lib', id: 'impact-deep-hard', gain: .6 },
  // город гаснет: гул обрывается, щелчки районов, крики, гудки, удар на Кок-Тобе
  { t: 64.3, type: 'murmur', dur: .3, gain: .12, pitch: .7 }, { t: 64.3, type: 'engine', dur: .25, gain: .1, pitch: .6 }, { t: CITY.zhk, type: 'lib', id: 'click-toggle-soft', gain: .4 }, { t: CITY.zhk + .3, type: 'click', gain: .1, pitch: .5 },
  { t: CITY.people, type: 'lib', id: 'click-toggle-soft', gain: .35 }, { t: CITY.people + .25, type: 'murmur', dur: 1.3, gain: .22, pitch: 1.3 }, { t: 65.9, type: 'horn', dur: .6, gain: .12 }, { t: 66.05, type: 'lib', id: 'click-button-soft', gain: .25 },
  { t: CITY.nt, type: 'lib', id: 'click-toggle-soft', gain: .35 }, ...[0, .1, .2, .3].map(d => ({ t: CITY.nt + .1 + d, type: 'click', gain: .07, pitch: .4 + d })), { t: CITY.cat, type: 'lib', id: 'click-toggle-on-soft', gain: .35 },
  { t: CITY.kt + .45, type: 'lib', id: 'impact-deep-hard', gain: .55 }, { t: CITY.kt + .45, type: 'powerdown', dur: 1.0, gain: .3, pitch: .6 },
  // улица в темноте: ветер, сирены вдалеке, гудки, крики
  { t: 69.6, type: 'wind', dur: 6, gain: .1 }, { t: 70.0, type: 'siren', dur: 5.6, dist: .85, gain: .12 }, { t: 70.4, type: 'horn', dur: .4, gain: .08 }, { t: 72.2, type: 'murmur', dur: 2, gain: .1, pitch: 1.4 }, { t: 73.5, type: 'horn', dur: .25, gain: .1 }, { t: 73.8, type: 'horn', dur: .25, gain: .1 }, { t: 74.4, type: 'horn', dur: .7, gain: .07, pitch: .9 },
  // тишина 75,6–76,6: без музыки и голоса, но не цифровой ноль — тикают механические часы Алихана, дыхание
  ...[75.7, 76.2].map(t => ({ t, type: 'tick', gain: .25, pitch: .9 })), { t: 75.65, type: 'breath_in', dur: .6, gain: .12 }, { t: 75.6, type: 'wind', dur: 1, gain: .025 },
  // стук: первый — на «застучал»
  ...KNOCKS.flatMap((k, i) => knock(k, i < 5 ? .45 : 1)), { t: KNOCK_AT, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: 78.6, type: 'step', gain: .06, pitch: .7 }, { t: 79.2, type: 'step', gain: .06, pitch: .7 },
  { t: 80.8, type: 'lib', id: 'impact-deep-firm', gain: .35 }, ...KNOCKS_END.flatMap(k => knock(k, 1.1)), { t: 81.9, type: 'wind', dur: 1.95, gain: .04 }, { t: 82.4, type: 'tick', gain: .15, pitch: .9 }, { t: 83.4, type: 'tick', gain: .15, pitch: .9 },
];
