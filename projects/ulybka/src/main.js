// «SMILE» — проклятый мультфильм 1932 года. Планы, монтаж по голосу, субтитры, плёнка.
import { g, reset, camera, film, INK, PAPER, G1, G2, G3, G4, G5, ell, fillStroke, path, clamp, lerp, win, sm, ease, outE, inE, inoutE, backE, noise, h1, on12, spring } from './core.js';
import { tippy, pig, flower, sun, house, tree, viewer, cone, glove, hose } from './chars.js';
import { sky, hills, fence, sign, rock, cloud, interior, windowFrame, paintCan, theaterBg, titleCard, leader } from './world.js';
import LINES from '../vo/lines.json';
import DUR from '../vo/durations.json';

const LIME = '"Lime"', SLAB = '"Slab"';
const BEAT = .5; const beat = t => Math.abs(Math.sin(Math.PI * t / BEAT)); // всё пружинит в такт (120 уд/мин)
const D = id => DUR[id] ?? 2;
const SHOTS = [
  { id: 'H', lines: [], min: 3.3 },
  { id: 'T', lines: [], min: 2.6 },
  { id: 'S2', lines: ['a01'], lead: .5, tail: .9, min: 4.6 },
  { id: 'S3', lines: ['a02'], lead: .3, tail: 1.4, min: 4.4 },
  { id: 'S4a', lines: [], min: 2.4 },
  { id: 'S4b', lines: ['t01'], lead: .6, tail: .9, min: 3.4 },
  { id: 'S5', lines: ['a03'], lead: 1.1, tail: 1.2, min: 5 },
  { id: 'S6', lines: ['c01'], lead: .5, tail: .8, min: 4.2 },
  { id: 'S7', lines: ['t02'], lead: .4, tail: 2.6, min: 5 },
  { id: 'S8', lines: [], min: 3.6 },
  { id: 'S9', lines: ['c02'], lead: 2.4, tail: 1.2, min: 4.6 },
  { id: 'S10', lines: ['a04'], lead: 2.3, tail: .7, min: 5.2 },
  { id: 'S11', lines: ['t03'], lead: .9, tail: 1.2, min: 4.4 },
  { id: 'S12', lines: [], min: 3.8 },
  { id: 'S13', lines: ['a05'], lead: 1.2, tail: 1.8, min: 6 },
  { id: 'S14', lines: ['c03'], lead: .25, tail: 1.6, min: 2.8 },
  { id: 'END', lines: [], min: 3.2 },
];
let T0 = 0; const VO = [];
for (const s of SHOTS) { let t = s.lead || 0; s.t0 = T0; s.v = []; s.lines.forEach((id, i) => { if (i) t += .3; const L = LINES.lines.find(l => l.id === id); VO.push({ id, t: T0 + t, d: D(id), text: L.text, role: L.role }); s.v.push(t); t += D(id); }); s.d = Math.max(s.min, t + (s.tail || 0)); T0 += s.d; }
export const TOTAL = T0; window.SHOTS = SHOTS.map(s => ({ id: s.id, t0: s.t0, d: s.d })); window.VO_TIMELINE = VO;

// ---------- общие куски ----------
function town(t, o = {}) { // широкий план Санниvилля
  const b = o.freeze ? 0 : beat(t), fr = o.freeze ? 0 : 1, tq = on12(t);
  sky(t, o.dark || 0);
  sun({ x: 800, y: 560, r: 125, t: tq * fr, grinW: o.sunGrin || 1, teeth: o.teeth || 0, look: o.look || [0, 0], shrink: 0 });
  cloud(250, 560, .75, t * fr, 1, o.grin || 1); cloud(520, 760, .5, t * fr + 2, 1, o.grin || 1);
  hills(t);
  house({ x: 170, y: 1230, s: .72, face: 1, bob: b, grinW: o.grin || 1, look: o.hlook || 0 }); house({ x: 930, y: 1210, s: .62, face: 1, bob: beat(t + .25) * fr, grinW: o.grin || 1, look: o.hlook || 0 });
  tree({ x: 690, y: 1240, s: .62, face: 1, t: tq * fr, grinW: o.grin || 1 });
  fence(-40, 300, 1420, .8);
}
function flowersFront(t, o = {}) {
  const fr = o.freeze ? 0 : 1;
  [[60, 1900, .95, 0], [250, 1960, 1.05, 1.2], [880, 1930, 1, 2.1], [1040, 1880, .9, .6]].forEach(([x, y, s, ph], i) => {
    const turnTo = o.turnTo ?? 0; // поворот голов к Типпи
    flower({ x, y, s, t: on12(t) * fr, ph, sway: fr ? undefined : .02 * Math.sin(i), look: [turnTo * (x < 540 ? 1 : -1), 0], tilt: turnTo * (x < 540 ? .35 : -.35) + (o.lean || 0) * (x < 540 ? .3 : -.3), grinW: o.grin || 1, shrink: 0, hollow: o.hollowIdx === i ? 1 : 0 });
  });
}
const tippyDefault = (t, extra) => ({ t, s: 1, mouth: 'grin', blink: (t % 3.1) < .1 ? 1 : 0, ...extra });

// ---------- ПЛАНЫ ----------
const SHOT = {
  H(u, s) { // хук: ракорд 3-2 → Типпи машет → кадр крика (2 кадра) → надпись
    if (u < .7) { reset(); leader(u < .35 ? 3 : 2, (u % .35) / .35, LIME); return { flick: 1.4 }; }
    const tq = on12(u);
    camera(540, 1180 - u * 10, 1.55 + u * .03);
    sky(u); hills(u, 0);
    const flash = u > 1.95 && u < 2.03;
    if (flash) { camera(540, 900, 2.4); g.fillStyle = PAPER; g.fillRect(-500, -500, 2200, 3000); pig({ x: 540, y: 1300, s: 1.4, t: u, peel: 1, scream: 1 }); return { flick: 2, expo: 1.15, jump: .01 }; }
    tippy(tippyDefault(tq, { x: 540, y: 1620, bob: beat(u), armR: { hand: [80, -190], pose: 'wave', bend: -30 + Math.sin(tq * 14) * 30 }, look: [0, .2] }));
    return { hook: 1 };
  },
  T(u) { reset(); titleCard(u, LIME, 1 + spring(u, 0, 2, 5) * .05 - .05); return { flick: 1.2 }; },
  S2(u, s) { // Санниvилль: все улыбаются, Типпи скачет с мороженым
    const k = u / s.d; camera(lerp(480, 600, k), 1250, 1.0);
    town(u); flowersFront(u);
    const x = lerp(-120, 560, ease(u, 0, s.d * .85)), ph = x / 70 * Math.PI;
    tippy(tippyDefault(on12(u), { x, y: 1700, s: .7, walk: ph, walkAmp: 1 - ease(u, s.d * .8, s.d), cone: 1, armR: { hand: [40, 40], pose: 'hold', bend: -30 }, bob: beat(u) * .5 }));
    return {};
  },
  S3(u, s) { // табличка правила, мэр показывает на неё
    const k = ease(u, 0, s.d, inoutE); camera(lerp(640, 600, k), lerp(1300, 1250, k), lerp(1.05, 1.25, k));
    town(u);
    sign(330, 1640, .95, on12(u), LIME);
    pig({ x: 800, y: 1760, s: .8, t: on12(u), bob: beat(u), handL: [-250, -330 + Math.sin(on12(u) * 6) * 10], poseL: 'point', handR: [150, -180], look: [-.6, 0], tilt: Math.sin(on12(u) * 3) * .05 });
    flowersFront(u, { hollowIdx: (u > 2.6 && u < 2.69) ? 2 : -1 });
    return {};
  },
  S4a(u, s) { // спотыкается о камень, мороженое летит
    camera(560, 1350, 1.15); town(u); rock(560, 1720, 1.2);
    const trip = ease(u, .55, .75); const x = lerp(260, 560, ease(u, 0, .7)), ph = x / 60 * Math.PI;
    const fall = ease(u, .7, 1.05, inE);
    if (u < 1.05) tippy(tippyDefault(on12(u), { x, y: 1720, s: .75, walk: ph, walkAmp: 1 - trip, lean: trip * .5 + fall * .9, cone: u < .78 ? 1 : 0, mouth: trip > .3 ? 'o' : 'grin', armR: { hand: [40 + trip * 60, 40 - trip * 140], pose: 'hold' }, shrink: trip * .5 }));
    else { // лежит, отскок
      const bnc = Math.abs(Math.sin((u - 1.05) * 9)) * Math.exp(-(u - 1.05) * 5) * 30;
      tippy(tippyDefault(on12(u), { x: 690, y: 1700 - bnc, s: .75, lean: 1.45, squash: .08, mouth: 'o', armL: { hand: [-120, -40] }, armR: { hand: [120, -60] }, look: [0, -1] }));
    }
    // полёт и шлепок
    if (u > .78) { const f = ease(u, .78, 1.35); const cx = lerp(640, 900, f), cy = lerp(1500, 1760, f) - Math.sin(f * Math.PI) * 420;
      if (f < 1) { g.save(); g.translate(cx, cy); g.rotate(f * 8); cone(0, 0, .8); g.restore(); } else splat(900, 1760, ease(u, 1.35, 1.5)); }
    flowersFront(u); return {};
  },
  S4b(u, s) { // крупно: улыбка сползает в грусть, слёзы
    const k = ease(u, .2, .9);
    camera(540, 1130, 2.3 - u * .04);
    sky(u); hills(u, 0);
    tippy(tippyDefault(on12(u), { x: 540, y: 1600, mouth: k < .5 ? 'smile' : 'frown', grinW: 1 - k * .5, brows: k, tears: ease(u, 1.0, 1.6), look: [.3, .6] }));
    return {};
  },
  S5(u, s) { // скрип пластинки — всё замирает; головы поворачиваются к Типпи; улыбки растут
    const k = ease(u, .9, s.d - .4);
    camera(560, 1300, 1.05 + u * .02);
    town(u, { freeze: 1, sunGrin: 1 + k * .9, teeth: k > .3 ? 1 : 0, grin: 1 + k * .7, look: [-.6 * k, .5 * k], hlook: -k, dark: k * .35 });
    tippy(tippyDefault(0, { x: 470, y: 1720, s: .7, mouth: 'frown', tears: .6, look: [k * .6, 0], shrink: k * .6, tremble: k }));
    flowersFront(u, { freeze: 1, turnTo: k, grin: 1 + k * .7 });
    return { jump: u < .08 ? .015 : 0, flick: 1 + k };
  },
  S6(u, s) { // «Улыбнись. Улыбнись.» — все шагают к ней в такт
    const k = ease(u, 0, s.d), b = Math.abs(Math.sin(Math.PI * u / .7));
    camera(540, 1380, 1.1 + k * .25);
    town(u, { freeze: 1, sunGrin: 1.9, teeth: 1, grin: 1.7, look: [-.4, .6], dark: .4 });
    pig({ x: lerp(1000, 760, k), y: 1780, s: .8 + k * .15, t: 0, bob: b, grinW: 1.3, handL: [-200, -240], handR: [200, -240], look: [-1, 0], tilt: Math.sin(u * 4.5) * .06 });
    tippy(tippyDefault(0, { x: lerp(440, 300, k), y: 1720, s: .7, mouth: 'frown', shrink: .8, tremble: 1, lean: -.1, armL: { hand: [-60, 60] }, armR: { hand: [60, 60] }, look: [1, 0] }));
    flowersFront(u, { freeze: 1, turnTo: 1, lean: k, grin: 1.7 });
    return { flick: 1.6 };
  },
  S7(u, s) { // крупно мэр: улыбка-наклейка сползает → крик (СКРИМЕР 1)
    const pk = ease(u, s.v[0] + .9, s.v[0] + 2.4, inE), scr = ease(u, s.v[0] + 2.1, s.v[0] + 2.35);
    const punch = scr > 0 ? 1 + spring(u, s.v[0] + 2.1, 4, 6) * .25 : 1;
    camera(540, 1170, (1.6 + u * .04) * punch, scr * noise(4, u * 40) * .03);
    sky(u, .5); hills(u, 0);
    pig({ x: 540, y: 1600, s: 1.2, t: 0, peel: pk, peelDir: 1, scream: scr, grinW: 1.3, handL: [-190, -150], handR: [190, -150], look: [0, 0], shrink: 0 });
    // Типпи — затылок на переднем плане
    if (u < s.v[0] + 2.1) { g.save(); ell(140, 1850, 130, 120); g.fillStyle = INK; g.fill(); path([[60, 1760], [80, 1640], [140, 1740]], true); g.fill(); path([[200, 1740], [250, 1650], [240, 1770]], true); g.fill(); g.restore(); }
    return { flick: 1 + scr * 2, expo: 1 + scr * .15, jump: scr > 0 && scr < 1 ? .02 : 0 };
  },
  S8(u, s) { // бежит в дом, хлопает дверью, прячется
    if (u < 1.4) { camera(540, 1350, 1.0); town(u, { freeze: 1, grin: 1.7, sunGrin: 1.9, teeth: 1, dark: .45 });
      const x = lerp(400, 140, ease(u, 0, 1.1)), ph = u * 30;
      tippy(tippyDefault(on12(u), { x, y: 1700, s: .7, walk: ph, walkAmp: 1.4, lean: -.35, mouth: 'scream', shrink: 1, armL: { hand: [-100, -20] }, armR: { hand: [100, -60] } }));
      for (let k = 0; k < 5; k++) { const a = ((u * 3 + k / 5) % 1); ell(x + 60 + a * 160, 1690 - a * 30, 20 + a * 30, 14 + a * 20); g.fillStyle = `rgba(243,239,228,${.8 * (1 - a)})`; g.fill(); }
      flowersFront(u, { freeze: 1, turnTo: 1, grin: 1.7 });
      return { flick: 1.5 }; }
    camera(540, 1250, 1.15); interior(u, .35);
    windowFrame(560, 560, 400, 420, () => { g.fillStyle = PAPER; g.fillRect(560, 560, 400, 420); });
    const pant = Math.sin(u * 14) * .02;
    tippy(tippyDefault(on12(u), { x: 360, y: 1560, s: .9, squash: pant, mouth: 'o', shrink: .7, tremble: .6, look: [1, -.4], armL: { hand: [-20, -170], pose: 'open', bend: 20 }, armR: { hand: [10, -150], pose: 'open', bend: -30 } }));
    return { flick: 1.2, jump: u > 1.4 && u < 1.48 ? .012 : 0 };
  },
  S9(u, s) { // окно: солнце опускается и заглядывает — «Нашла.» (СКРИМЕР 2)
    const k = ease(u, .4, s.v[0] - .1, inoutE), scr = ease(u, s.v[0], s.v[0] + .2);
    const punch = 1 + scr * .6 + spring(u, s.v[0], 3, 6) * .15 * (scr > 0);
    camera(760, 770, 1.6 * punch); interior(u, .55);
    windowFrame(560, 560, 400, 420, () => { g.fillStyle = PAPER; g.fillRect(560, 560, 400, 420); sun({ x: 760, y: lerp(260, 820, k), r: 330, t: 0, grinW: 1.4 + scr * .6, teeth: 1, look: [0, .8], shrink: k * .9, brow: -k }); });
    tippy(tippyDefault(0, { x: 400, y: 1560, s: .9, mouth: scr > 0 ? 'scream' : 'o', shrink: 1, tremble: 1, look: [1, -.6] }));
    return { flick: 1.3 + scr, expo: 1 + scr * .12 };
  },
  S10(u, s) { // рисует себе улыбку краской → снаружи «Вот так лучше!»
    if (u < s.v[0] - .1) { const p = ease(u, .4, s.v[0] - .5);
      camera(560, 1180, 1.9); interior(u, .4); paintCan(760, 1580, 1);
      tippy(tippyDefault(on12(u), { x: 520, y: 1600, mouth: 'frown', tears: 1, paint: p, look: [0, -.2], brush: 1, armR: { hand: [lerp(-120, 20, (Math.sin(u * 7) + 1) / 2) - 40, -100], pose: 'hold', bend: -40 }, armL: { hand: [-10, 90] } }));
      return { flick: 1.2 }; }
    camera(560, 1300, 1.05); town(u, { grin: 1.2, sunGrin: 1.3 });
    tippy(tippyDefault(on12(u), { x: 470, y: 1720, s: .7, mouth: 'frown', paint: 1, drips: .4, bob: beat(u) * .5 }));
    pig({ x: 780, y: 1770, s: .7, t: on12(u), bob: beat(u), handL: [-170, -280], poseL: 'wave', painted: 1 });
    flowersFront(u, { grin: 1.2 });
    return {};
  },
  S11(u, s) { // крупно: нарисованная улыбка, слёзы; на фоне у всех — тоже нарисованные (поворот 1)
    camera(540, 1120, 2.0 - u * .03); sky(u, .25); hills(u, 0);
    // мэр за спиной: та же кривая улыбка краской со стёками
    pig({ x: 800, y: 1420, s: .55, t: 0, peel: 1, scream: .0, handL: [-150, -170], handR: [150, -170] });
    g.save(); g.translate(800, 1420); g.scale(.6, .6); g.translate(0, -400 + 70); g.lineWidth = 18; g.strokeStyle = INK; g.beginPath(); g.moveTo(-80, -10); g.bezierCurveTo(-50, 70, 50, 70, 82, -12); g.stroke();
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-40 + k * 40, 50); g.lineTo(-40 + k * 40, 50 + 40 + k * 20); g.lineWidth = 9; g.stroke(); } g.restore();
    tippy(tippyDefault(on12(u), { x: 400, y: 1640, mouth: 'frown', paint: 1, drips: .6 + u * .05, tears: 1, look: [0, .4], tremble: .4, squash: Math.sin(u * 8) * .01 }));
    return {};
  },
  S12(u, s) { // хватает край кадра и отгибает его, как занавес — за ним тёмный кинозал
    const pull = ease(u, 1.0, 2.6, inoutE), off = pull * 620;
    reset(); theaterBg(u, 1);
    [[1150, .95, 4], [1500, 1.25, 3], [1880, 1.6, 3]].forEach(([y, sc, n], r) => { for (let i = 0; i < n; i++) viewer(70 + i * 200 * sc + r * 30, y, sc, 1, (i + r) % 3, .4, 1.15); });
    // мультфильм уезжает вправо
    reset(); g.save(); g.translate(off, 0); g.beginPath(); g.rect(0, 0, 1080, 1920); g.clip();
    g.translate(540, 960); g.scale(1.05, 1.05); g.translate(-560, -1300);
    town(u, { grin: 1.3, sunGrin: 1.3 }); flowersFront(u, { grin: 1.3 });
    g.restore();
    reset(); g.save(); g.translate(off, 0);
    g.fillStyle = INK; g.fillRect(-26, 0, 26, 1920);                                    // край плёнки
    for (let y = 30; y < 1920; y += 90) { g.fillStyle = G4; g.beginPath(); g.roundRect(-20, y, 14, 40, 4); g.fill(); }  // перфорация
    g.restore();
    // Типпи у края, держит его обеими руками
    const x = 40 + off + 150, walk = 1 - ease(u, .5, 1.0);
    tippy(tippyDefault(on12(u), { x: lerp(520, x, ease(u, 0, 1.0)), y: 1560, s: .85, walk: u * 14, walkAmp: walk, mouth: 'frown', paint: 1, drips: .8, look: [-1, 0], shrink: pull * .8, armL: { hand: [-170, -40], pose: 'fist', bend: 30 }, armR: { hand: [-110, 0], pose: 'fist', bend: -10 }, lean: -.12 * (1 - walk) }));
    return { flick: 1.3 };
  },
  S13(u, s) { // с последнего ряда: головы поворачиваются к нам. «КТО-ТО ПЕРЕСТАЛ УЛЫБАТЬСЯ»
    reset(); theaterBg(u, 1);
    // экран вдалеке
    g.save(); g.beginPath(); g.rect(90, 220, 900, 640); g.clip(); g.translate(90, 220); g.scale(.84, .84); g.translate(0, -650);
    g.save(); g.scale(1, 1); town(u, { grin: 1.6, sunGrin: 1.6, teeth: 1 }); g.restore(); g.restore();
    g.fillStyle = 'rgba(243,239,228,.06)'; g.fillRect(90, 220, 900, 640);
    const z = 1 + u * .03; g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
    const rows = [[1080, .8, 6], [1330, 1.05, 5], [1620, 1.35, 4], [1960, 1.75, 3]];
    rows.forEach(([y, sc, n], r) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * 200 * sc + (r % 2) * 50; const order = (3 - r) * .25 + h1(i + r * 9) * .6;
      const tn = ease(u, s.v[0] + .6 + order, s.v[0] + 1.0 + order, inoutE); viewer(x, y, sc, tn, (i + r) % 3, .45, 1.15); } });
    g.restore();
    return { you: ease(u, s.v[0] + D('a05') - .2, s.v[0] + D('a05') + .2), flick: 1.3 };
  },
  S14(u, s) { // «Улыбнись.» — солнце вырывается с экрана (СКРИМЕР 3) → прожиг
    const z = ease(u, .2, 1.1, inE);
    reset(); theaterBg(u, .6);
    camera(540, 900, 1 + z * 5);
    sun({ x: 540, y: 900, r: 220, t: 0, grinW: 2.1, teeth: 1, look: [0, .3], shrink: 1 - z });
    return { burn: ease(u, 1.0, 1.6) * .9, burnP: [.5, .45], expo: 1 + z * .2, flick: 2, jump: z > .5 ? (h1(Math.floor(u * 24)) - .5) * .02 : 0 };
  },
  END(u, s) { // «THE END» в диафрагме, за ней — нарисованная улыбка
    reset(); g.fillStyle = INK; g.fillRect(0, 0, 1080, 1920);
    const r = lerp(700, 0, ease(u, 1.6, 2.8, inE));
    g.save(); ell(540, 960, r, r); g.clip(); g.fillStyle = G1; g.fillRect(0, 0, 1080, 1920);
    g.fillStyle = INK; g.textAlign = 'center'; g.font = `130px ${LIME}`; g.fillText('THE END', 540, 900);
    g.lineWidth = 22; g.strokeStyle = INK; g.beginPath(); g.moveTo(400, 1000); g.bezierCurveTo(440, 1100, 640, 1100, 680, 998); g.stroke();
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(470 + k * 70, 1070); g.lineTo(470 + k * 70, 1070 + ease(u, .3, 2.5) * (60 + k * 30)); g.lineWidth = 11; g.stroke(); }
    g.restore();
    return { flick: 1.5, fade: 1 - ease(u, s.d - .4, s.d) };
  },
};
function splat(x, y, k) {
  g.save(); g.translate(x, y); g.scale(.5 + k * .5, .5 + k * .5);
  path([[-80, 0], [-60, -30], [-20, -20], [0, -50], [30, -18], [70, -34], [90, 0], [40, 12], [-30, 14]], true); fillStroke(PAPER, 6);
  g.save(); g.translate(30, -40); g.rotate(.5); cone(0, 0, 0); g.restore(); g.restore();
}

// ---------- субтитры и надписи ----------
function captions(t) {
  const v = VO.find(l => t >= l.t - .05 && t < l.t + l.d + .3); if (!v) return;
  const words = v.text.split(' '), tot = v.text.length; let acc = 0, n = 0;
  for (const w of words) { if (t >= v.t + (acc / tot) * v.d * .9 - .04) n++; acc += w.length + 1; }
  reset(); g.font = `60px ${SLAB}`; g.textAlign = 'left';
  const lines = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > 900) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur);
  let idx = 0; const lh = 78, y0 = 1330 - (lines.length - 1) * lh / 2;
  const col = v.role === 'ul_tippy' ? PAPER : v.role === 'ul_chorus' ? '#e9e2d0' : PAPER;
  lines.forEach((ln, li) => { const lw = ln.split(' '); const vis = lw.filter((_, j) => idx + j < n).join(' '); idx += lw.length; if (!vis) return;
    const full = g.measureText(ln).width, x = 540 - full / 2, y = y0 + li * lh;
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText(vis, x, y); g.fillStyle = col; g.fillText(vis, x, y); });
  if (v.role === 'ul_chorus') { g.font = `30px ${SLAB}`; }
}
function hookText(u) {
  const a = ease(u, .75, .9) * (1 - ease(u, 3.0, 3.25)); if (a <= 0) return;
  reset(); g.globalAlpha = a; g.textAlign = 'center';
  g.fillStyle = 'rgba(18,17,16,.82)'; g.fillRect(60, 250, 960, 330);
  g.fillStyle = PAPER; g.font = `82px ${LIME}`; g.fillText('THIS CARTOON WAS', 540, 360); g.fillText('SHOWN ONLY ONCE.', 540, 455);
  g.font = `46px ${SLAB}`; g.fillStyle = '#e8dcc0'; g.fillText(u > 2.05 ? 'in 1932. Nobody left smiling.' : 'in 1932.', 540, 535);
  g.globalAlpha = 1;
}
function youText(a) {
  if (a <= 0) return; reset(); g.textAlign = 'center';
  const s = 1 + (1 - a) * .3; g.save(); g.translate(540, 520); g.scale(s, s); g.globalAlpha = a;
  g.fillStyle = PAPER; g.font = `120px ${LIME}`; g.lineWidth = 14; g.strokeStyle = INK; g.strokeText('YOU', 0, 0); g.fillText('YOU', 0, 0);
  g.font = `64px ${LIME}`; g.strokeText('STOPPED SMILING.', 0, 90); g.fillText('STOPPED SMILING.', 0, 90); g.restore(); g.globalAlpha = 1;
}

// ---------- кадр ----------
window.SCENE = { duration: TOTAL, fps: 30, width: 720, height: 1280 };
let fontsReady = null;
window.renderFrame = async T => {
  if (!fontsReady) fontsReady = Promise.all([new FontFace('Lime', 'url(fonts/limelight-latin-400-normal.woff2)'), new FontFace('Slab', 'url(fonts/roboto-slab-latin-800-normal.woff2)', { weight: '800' })].map(f => f.load().then(ff => document.fonts.add(ff))));
  await fontsReady;
  const s = SHOTS.find(x => T >= x.t0 && T < x.t0 + x.d) || SHOTS[SHOTS.length - 1]; const u = T - s.t0;
  reset(); g.fillStyle = PAPER; g.fillRect(0, 0, 1080, 1920);
  const o = SHOT[s.id](u, s) || {};
  if (o.hook) hookText(u);
  if (o.you) youText(o.you);
  captions(T);
  film(T, o);
};
