// «ҚУАТ» · серия 3 «Народ» (0:58). Тексты и таймкоды — по ТЗ, раздел 7; заряд и время — одна функция (раздел 8: 22 → 2 → 27 → 7%).
// По knowledge/visual-style.md: крупное табло, которое растёт по сюжету; жёсткие склейки; музыка под всей серией;
// ночь со светом (фонари, экран, зелёное свечение); штампы, «рентген» на разряде, знаки эмоций, звуковые слова.
// Медицина (раздел 9 ТЗ): на мониторе фибрилляция (ритм, который бьют током), а не ровная линия; «Отойти!» — руки у всех вверх.
'use strict';
const DUR = 58, EP = 3;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));

// ───── сюжет: день 4, 02:10–02:30, −34° ─────
STORY_CLOCK[3] = [[0, '02:10'], [20.2, '02:12'], [24.6, '02:13'], [30.2, '02:15'], [35.2, '02:17'], [40, '02:19'], [45, '02:24'], [51, '02:30']];
const DEF1 = 7.6, READY1 = 9.4, SHOCK1 = 12.8, DEF2 = 35.45, READY2 = 36.2, SHOCK2 = 36.9, SINUS = 37.6;
const PB = [30.45, 31.35, 32.5, 33.4, 34.2];                  // пауэрбанки в ладони: +5 каждый (2 → 27)
BATTERY[3] = { start: 22, showAt: 0, events: [[DEF1, 'defib', READY1 - DEF1], ...PB.map(t => [t, 'powerbank', .25]), [DEF2, 'defib', READY2 - DEF2]] };
const pbCount = t => PB.filter(x => t >= x).length;
const hudBase = t => ({ time: storyClock(EP, t), temp: '−34°', battery: batteryShown(EP, t), rate: batteryRate(EP, t),
  rows: t >= 28 ? [{ label: 'ПАУЭРБАНКИ', value: '×' + pbCount(t), col: T.charge, at: 28, flash: PB.filter(x => t >= x).pop() }] : [] });
const ecgMode = tt => tt < SINUS ? 'vf' : 'sinus';
const lightK = (t, at, dec = 6) => t < at ? 0 : Math.exp(-(t - at) * dec);
const cprComp = t => Math.max(0, Math.sin(t * Math.PI * 2 * 1.9)); // массаж сердца ~110 в минуту
const STUDS = (() => { const hairs = ['short', 'long', 'bun', 'buzz', 'beanie', 'short', 'long', 'bun'], tops = ['#5b7fb0', '#b0475f', '#3d8a6a', '#7a5cb0', '#c48a3a', '#4a5a7a', '#a34a8a', '#2f7f8f'];
  return Array.from({ length: 16 }, (_, i) => ({ hair: hairs[i % 8], top: tops[(i * 3) % 8], skin: ['#e3a67f', '#d9a07a', '#c98b64', '#e7b493'][i % 4], pb: ['#4a5a7a', '#b0475f', '#2f7f8f', '#c48a3a', '#7a5cb0'][i % 5] })); })();
const sFace = (q, o = {}) => ({ hair: q.hair, skin: q.skin, seed: q.top.length, ...o });
const talking = (t, ids) => !!window.VO_MOUTH && ids.some(id => AK.mouth(t, window.VO_MOUTH[id], VO_AT[id]) > .3);
const mouthK = (t, ids) => window.VO_MOUTH ? Math.max(0, ...ids.map(id => AK.mouth(t, window.VO_MOUTH[id], VO_AT[id]))) : 0;

// ───── вахта ночью без света: аварийная лампа, фонарь на полу, зелёный заряд ─────
function vahtaNight(t, { beam = 1 } = {}) { vahtaBg(t, { light: .42 }); glow(200, 330, 420, 'rgba(229,56,59,.35)'); rr(120, 290, 160, 70, 10); fillOL('#5a1a1a', 4); txt('ВЫХОД', 200, 326, 34, '#ffd0d0', { align: 'center' }); // аварийная табличка
  booth(560, 420, 470, 520, () => { ctx.fillStyle = '#2a2018'; ctx.fillRect(560, 420, 470, 520); keyBoard(600, 470); }); // вахта пустая, тёмная
  ctx.fillStyle = '#3a2e26'; ctx.fillRect(-300, 1100, W + 600, H); glow(540, 1100, 700, `rgba(255,236,190,${.18 * beam})`); }
// апай на полу (голова слева): возвращает точку сердца и головы
const AP = { fx: 830, fy: 1000, s: 1.35 };
function apaiLying(t, { jolt = 0, breath = 0, mask = 0, maskFog = 0, eyes = 1 } = {}) { const imp = AK.impact(t, jolt || -9, { amp: 0, squash: .2, dur: .3 }); ctx.save(); ctx.translate(AP.fx, AP.fy); ctx.rotate(-Math.PI / 2); ctx.scale(imp.sx, 1 + (1 - imp.sy) * 1.5 + breath * .04);
  apai(0, 0, AP.s, t, { shadow: false, still: 1, armL: [-.2, .1], armR: [.2, -.1], face: { lid: 1 - eyes, mouth: 'flat', noBlink: eyes < 1, glasses: false } }); ctx.restore();
  const heart = [AP.fx - 262 * AP.s, AP.fy - 80 * AP.s], head = [AP.fx - 400 * AP.s, AP.fy]; if (mask) oxyMask(head[0] + 4, head[1] - 10, 120, maskFog); return { heart, head }; }
function danaCPR(t, x, chestY, s = 1.75, { comp = 1, hands = 'down', faceO = {} } = {}) { const c = comp ? cprComp(t) : 0, y = chestY + 145 * s + c * 44; /* толчок заметный: 44 px */
  const pts = dana(x, y, s, t, { kneel: 1, lean: c * .03, armL: hands === 'up' ? [-2.7, .2] : [.25, 0], armR: hands === 'up' ? [2.7, -.2] : [-.25, 0], face: { mouth: talking(t, TALK.dana) ? 'open' : 'flat', brow: 'angry', lookY: hands === 'up' ? -.5 : 1, ...faceO } });
  return pts; }
function handsOnChest(t, x, y, comp = 1) { const c = comp ? cprComp(t) : 0; hand(x - 10, y + 6 + c * 44, .9, Math.PI, { pose: 'flat', skin: '#e7b493', cuff: '#f4f6fa' }); hand(x + 12, y + c * 44, .9, Math.PI, { pose: 'flat', skin: '#e7b493', cuff: '#f4f6fa' }); }

// ───── 0:00–0:03 хук: массаж сердца в темноте ─────
function hook(t) { vahtaNight(t); const ap = AP;
  beka(940, 1170, 1.55, t, { kneel: 1, armL: [-1.3, .9], armR: [.4, .3], face: { streak: 1, mouth: 'o', brow: 'up', look: -1, lookY: .5, noBlink: 1 }, holdL: (x, y) => flashlight(x, y, 1.1, Math.PI + .5, 1, { len: 700, spread: .2 }) });
  danaCPR(t, 466, 881); const { heart } = apaiLying(t); handsOnChest(t, heart[0], 881);
  FX.backGlow(940, 900, 380, '61,255,143', .45); // зелёный свет от рук Беки
  ['РАЗ!', 'ДВА!', 'ТРИ!', 'ЧЕТЫРЕ!'].forEach((w, i) => { const tw = VT('e3d01'); if (tw) FX.onomato(t, tw[i], w, 640 + (i % 2) * 70, 520 - i * 20, { col: T.pink, size: 70, life: .55 }); }); }
// ───── 0:03–0:07 дефибриллятор разряжен ─────
function aedWall(t) { vahtaNight(t); dim(.15); rr(220, 520, 640, 520, 20); fillOL('#e5e2d8', 8); rr(240, 540, 600, 480, 12); ctx.fillStyle = '#2b2f3a'; ctx.fill(); // шкаф на стене
  aed(540, 790, 1.35, t, { screen: 'battery' }); FX.backGlow(540, 790, 520, '229,56,59', .3 + .2 * (Math.floor(t * 3) % 2));
  flashlight(1200, 1300, 1.4, -2.55, .9, { len: 1100, spread: .16 }); }
function bekaRealize(t) { vahtaNight(t); dim(.2); const [hx, hy, hr] = AK.handheld(t, 7, 3); ctx.save(); ctx.translate(hx, hy); ctx.rotate(hr);
  FX.backGlow(540, 760, 560, '229,56,59', .5); const rise = E.out(win(t, 6.2, 6.9)); bekaHead(520, 720, 290, { streak: 1, mouth: rise > .5 ? 'o' : 'flat', brow: 'up', lookY: lerp(0, 1, rise), look: 0 });
  for (const sx of [-1, 1]) armTo(540 + sx * 320, 2100, 540 + sx * 230, lerp(1700, 1120, rise), { pose: 'open', w: 140, bend: sx * .05 });
  if (rise > .5) FX.backGlow(540, 1100, 360, '61,255,143', rise - .5); FX.emote(t, 6.3, '!', 820, 420, 1.1, 1.1); ctx.restore(); }
// ───── 0:07–0:12 ладони на приборе: 22 → 2%, «ГОТОВ» ─────
function chargeAED(t, t0 = DEF1, t1 = READY1) { vahtaNight(t); dim(.1); ctx.fillStyle = '#3a2e26'; ctx.fillRect(-300, 1020, W + 600, H); // прибор на полу, вид сверху-спереди
  const lvl = win(t, t0, t1), scr = t < t0 ? 'battery' : t < t1 ? 'charging' : 'ready'; aed(540, 760, 1.6, t, { screen: scr, level: lvl, btnGlow: t >= t1 ? .6 + .4 * Math.sin(t * 12) : 0 });
  const slam = AK.anticip(win(t, t0 - .45, t0), .15), hit = AK.impact(t, t0, { amp: 10 });
  const L = [lerp(140, 270, slam) + hit.dx, lerp(1250, 940, slam)], R = [lerp(940, 810, slam) + hit.dx, lerp(1250, 940, slam)];
  armTo(-120, 1800, L[0], L[1], { pose: 'flat', w: 140, bend: .1 }); armTo(1200, 1800, R[0], R[1], { pose: 'flat', w: 140, bend: -.1 });
  for (const [P, x0] of [[L, -120], [R, 1200]]) ChargeFlow(t, { t0, dur: t1 - t0, path: [P, [x0 * .4 + 300, 1400], [540, 1920]], dir: 'give', size: 1.3, dots: 14 });
  if (t >= t0) ChargeFlow(t, { t0: t1, dur: .01, path: [[540, 600], [540, 599]], dots: 0, popup: { x: 540, y: 500, text: 'ДЕФИБРИЛЛЯТОР ГОТОВ', size: 46, col: T.low } });
  FX.backGlow(540, 1000, 600, '61,255,143', lvl * .5 * (t < t1 ? 1 : .4)); }
function stepBack(t) { vahtaNight(t); const sway = Math.sin(t * 2.6) * .06, back = E.out(win(t, 10, 10.6));
  beka(860, 1180, 1.55, t, { kneel: 1, lean: sway - back * .1, armL: [-2.5, -.3], armR: [2.5, .3], face: { streak: 1, lid: .55, mouth: 'open', brow: 'sad', look: -1 } });
  danaCPR(t, 466, 881, 1.75, { comp: 0, hands: 'down' }); const { heart } = apaiLying(t); pads(heart[0], heart[1] - 30, 1); hand(heart[0] - 10, 890, .9, Math.PI, { pose: 'flat', skin: '#e7b493', cuff: '#f4f6fa' });
  aed(740, 1020, .55, t, { screen: 'ready', level: 1, btnGlow: .5 }); ctx.strokeStyle = '#d8d4ca'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(700, 1040); ctx.bezierCurveTo(640, 1080, 560, 1000, heart[0], heart[1] - 30); ctx.stroke(); // провода к электродам
  FX.emote(t, 10.4, 'sweat', 980, 560, .9, 1.4); }
// ───── 0:12–0:16 «Отойти!» — разряд — нет ритма ─────
function shock(t, at) { const fl = lightK(t, at, 3); vahtaNight(t, { beam: 1 + fl * 2 }); if (fl > 0) { ctx.fillStyle = `rgba(200,230,255,${.35 * fl})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
  const clear = E.out(win(t, at - .9, at - .5)); beka(900, 1180, 1.5, t, { kneel: 1, lean: -.06 * clear, armL: [lerp(-.6, -2.8, clear), .2], armR: [lerp(.6, 2.8, clear), -.2], face: { streak: 1, mouth: 'o', brow: 'up', look: -1, noBlink: 1 } });
  danaCPR(t, 380, 881, 1.6, { comp: 0, hands: 'up' }); const { heart } = apaiLying(t, { jolt: at }); pads(heart[0], heart[1] - 30, 1);
  aed(700, 1030, .6, t, { screen: 'ecg', modeAt: ecgMode, btnGlow: t < at ? 1 : 0 }); hand(780, 1000, .7, -.4, { pose: 'point', skin: '#e7b493', cuff: '#f4f6fa' }); // Дана жмёт кнопку, сама ни к кому не прикасается
  FX.xray(t >= at && t < at + .12 ? 1 : 0, () => { const [hx, hy] = heart; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(hx + 30, hy + 10, 160 + i * 6, 40 + i * 26, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } // рёбра
    ctx.beginPath(); ctx.moveTo(hx - 20, hy - 30); ctx.bezierCurveTo(hx - 90, hy - 100, hx - 120, hy + 10, hx - 20, hy + 70); ctx.bezierCurveTo(hx + 80, hy + 10, hx + 50, hy - 100, hx - 20, hy - 30); ctx.stroke(); }); // сердце светится внутри
  FX.onomato(t, at + .05, 'РАЗРЯД!', 600, 1060, { col: T.low, size: 104, life: .9 }); }
function ecgClose(t, { stampAt = null, stampText = '', stampCol = T.empty } = {}) { vahtaNight(t); dim(.35); aed(540, 700, 2.0, t, { screen: 'ecg', modeAt: ecgMode }); FX.backGlow(540, 820, 600, ecgMode(t) === 'sinus' ? '61,255,143' : '229,56,59', .3);
  if (stampAt != null) FX.stamp(t, stampAt, stampText, 520, 1040, { col: stampCol, size: 96, rot: -.1, life: 3 }); }
// ───── 0:16–0:20 «Ещё один разряд — и я отключусь» ─────
function bekaTwo(t) { vahtaNight(t); dim(.25); const [hx, hy, hr] = AK.handheld(t, 10, 7); ctx.save(); ctx.translate(hx, hy); ctx.rotate(hr);
  FX.backGlow(520, 760, 560, '229,56,59', .35 + .25 * Math.sin(t * 9)); beka(520, 1900, 2.6, t, { hideLegs: true, lean: Math.sin(t * 2.3) * .05, armL: [-.3, .3], armR: [.3, -.3], face: { streak: 1, lid: .55, mouth: 'open', brow: 'sad', look: .3, sweat: t * 2 } });
  FX.emote(t, 16.5, 'sweat', 780, 470, 1, 2); ctx.restore(); }
function cprAgain(t) { vahtaNight(t); danaCPR(t, 466, 881); const { heart } = apaiLying(t); pads(heart[0], heart[1] - 30, 1); handsOnChest(t, heart[0], 881);
  beka(930, 1180, 1.5, t, { kneel: 1, armL: [-.3, 2.2], armR: [.3, -2.2], face: { streak: 1, lid: .5, mouth: 'flat', lookY: 1, look: -.4, brow: 'sad' } }); FX.backGlow(930, 900, 300, '229,56,59', .3); }
// ───── 0:20–0:24 Ержан: стрим и крик в коридор ─────
function erzhanLive(t) { vahtaNight(t); dim(.1); FX.backGlow(540, 800, 600, '79,216,255', .3);
  erzhan(580, 1880, 2.3, t, { armL: [-2.3, -.35], armR: [.6, 1.6], face: { mouth: talking(t, ['e3s06']) ? 'open' : 'flat', brow: 'angry', look: -.6 },
    holdL: (x, y) => { /* координаты руки — внутри фигуры (масштаб 2.3) */ ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y - 40); ctx.stroke(); phone(x + 16, y - 80, .7, 64, { rot: .15 }); if (t > 20.5) { ctx.fillStyle = T.empty; rr(x - 8, y - 140, 50, 18, 4); ctx.fill(); txt('ЭФИР', x + 17, y - 131, 12, '#fff', { align: 'center' }); } } });
  FX.emote(t, 20.25, '!', 800, 480, 1.2, 1.3); if (talking(t, ['e3s06'])) FX.onomato(t, 21.2, 'НА ВАХТУ!', 700, 1060, { col: T.cyan, size: 66, life: 1.3, rot: .06 }); }
const DOORS_T = [22.75, 22.95, 23.15, 23.35, 23.55, 23.75];
function doorsWake(t) { corridorSide(t, 620 * 3, { light: .3 }); dim(.25);
  DOORS_T.forEach((at, i) => { const dx = (i - 1) * 620 - 620 * 3 + 620 * 3 - 60 + (i % 2) * 0, k = E.out(win(t, at, at + .2)); const x = 40 + i * 175, y = 560; if (k <= 0) return; // двери распахиваются по очереди — каскад света
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#f2d7a6'; ctx.fillRect(x, y, 150, 760); student(x + 75, 1320, 1.0, t, { topCol: STUDS[i].top, top: 'pajama', skin: STUDS[i].skin, armR: [1.9, -.2], face: sFace(STUDS[i], { mouth: 'o', look: 1, brow: 'up' }), holdR: (hx, hy) => flashlight(hx, hy, .9, .2, k, { len: 500, spread: .2 }) }); ctx.restore(); });
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 8; for (let i = 0; i < 3; i++) { const ph = ((t - 22.6) * 1.4 + i / 3) % 1; ctx.beginPath(); ctx.arc(540, 900, 150 + ph * 700, -.4, .4); ctx.stroke(); ctx.beginPath(); ctx.arc(540, 900, 150 + ph * 700, Math.PI - .4, Math.PI + .4); ctx.stroke(); } } // эхо крика
// ───── 0:24–0:30 общага бежит вниз ─────
function stairsRun(t) { const sc = (t - 24.6) * 160; ctx.save(); ctx.translate(-sc * .4, -sc); stairs(t, { light: .75 });
  for (let i = 0; i < 7; i++) { const q = STUDS[i + 3], d = (t - 24.6) * 420 + i * 230, x = -40 + d * .62, y = 300 + d * .99 + 130; if (y > 2600 + sc) continue;
    student(x, y, 1.15, t, { walk: d / 140 * Math.PI, top: i % 2 ? 'pajama' : 'hoodie', topCol: q.top, skin: q.skin, lean: .12, armL: [-1.2, -.6], armR: [1.4, .4], face: sFace(q, { mouth: 'open', look: 1, brow: 'up' }),
      holdR: (hx, hy) => powerbank(hx, hy - 30, .7, { col: q.pb, leds: 4 }), holdL: (hx, hy) => flashlight(hx, hy, .8, .9 + Math.sin(t * 6 + i) * .2, 1, { len: 420, spread: .2 }) }); }
  ctx.restore(); }
function runFront(t) { corridorPersp(t, { vx: 540, vy: 760, light: .55 }); glow(540, 800, 700, 'rgba(255,236,190,.15)');
  for (let i = 5; i >= 0; i--) { const q = STUDS[i + 6], z = clamp(((t - 27.4) * .32 + (5 - i) * .16)), s = lerp(.5, 2.0, z * z), x = 540 + (i % 2 ? 1 : -1) * lerp(40, 300, z) + (i - 2.5) * 20, y = lerp(980, 2150, z * z);
    student(x, y, s, t, { walk: t * 14 + i, topCol: q.top, top: i % 3 ? 'pajama' : 'hoodie', skin: q.skin, armR: [2.6, .2], face: sFace(q, { mouth: 'open', brow: 'up' }), holdR: (hx, hy) => powerbank(hx, hy - 40, .9, { col: q.pb, glowK: .6 }) }); } }
// ───── 0:30–0:35 пауэрбанки в ладони: 2 → 27% ─────
function palmsPB(t) { vahtaNight(t); dim(.2); FX.backGlow(540, 860, 520, '61,255,143', .25 + .12 * pbCount(t));
  const cup = [[360, 1000], [720, 1000]]; armTo(120, 2100, cup[0][0], cup[0][1], { pose: 'open', w: 150, bend: .08 }); armTo(960, 2100, cup[1][0], cup[1][1], { pose: 'open', w: 150, bend: -.08 });
  PB.slice(0, 3).forEach((at, i) => { const q = STUDS[i + 2], k = E.out(win(t, at - .45, at)), side = i % 2 ? 1 : -1, tx = 540 + (i - 1) * 150, ty = 860 - i * 30, sx = 540 + side * 760, sy = 120;
    const x = lerp(sx, tx, k), y = lerp(sy, ty, k); if (t < at + .25) armTo(sx + side * 200, -260, x + side * 30, y - 60, { pose: 'grip', w: 110, col: q.top, skin: q.skin, bend: side * .08 }); // рука студента кладёт пауэрбанк
    if (k > 0) powerbank(x, y, 1.15, { col: q.pb, rot: (i - 1) * .2, leds: t >= at ? 4 : 2, glowK: lightK(t, at, 3) });
    ChargeFlow(t, { t0: at, dur: .6, path: [[tx, ty + 60], [540, 1300], [540, 1950]], dir: 'take', size: 1.2, popup: { x: tx, y: ty - 150, text: '+5%', size: 56 } }); }); }
function bekaPB(t) { vahtaNight(t); dim(.15); const n = pbCount(t); FX.backGlow(540, 760, 520, '61,255,143', .2 + .15 * n);
  const pts = beka(540, 1720, 2.4, t, { hideLegs: true, armL: [-.7, 2.3], armR: [.7, -2.3], face: { streak: 1, lid: lerp(.5, 0, n / 5), mouth: n >= 4 ? 'smile' : 'flat', brow: 'up', lookY: 1 } });
  const cx = (pts.handL[0] + pts.handR[0]) / 2, cy = (pts.handL[1] + pts.handR[1]) / 2 - 60; for (let i = 0; i < n; i++) powerbank(cx + (i - 2) * 60, cy - (i % 2) * 30, .85, { col: STUDS[i + 2].pb, rot: (i - 2) * .15, glowK: .5 });
  PB.slice(3).forEach((at, i) => { const side = i ? 1 : -1, k = E.out(win(t, at - .4, at)); if (t < at + .2) armTo(540 + side * 640, 2000, lerp(540 + side * 420, cx + side * 70, k), cy + 30, { pose: 'grip', w: 110, col: STUDS[i + 9].top, skin: STUDS[i + 9].skin, bend: side * .1 });
    ChargeFlow(t, { t0: at, dur: .6, path: [[cx + side * 60, cy], pts.handL, pts.elbowL, pts.heart], dir: 'take', size: 1.2, popup: { x: cx + side * 120, y: cy - 200, text: '+5%', size: 56 } }); }); }
// ───── 0:35–0:40 второй разряд — есть пульс ─────
function apaiWake(t) { vahtaNight(t); dim(.15); const br = Math.max(0, Math.sin((t - 39) * 2.4)), open = E.out(win(t, 39.3, 39.8)); ctx.save(); ctx.translate(540, 900); ctx.rotate(-.08);
  apaiHead(0, 0, 330, { lid: 1 - open * .7, mouth: 'o', brow: 'up', glasses: false, noBlink: 1 }); ctx.restore(); FX.backGlow(540, 900, 500, '255,179,71', .3 + .2 * br);
  FX.onomato(t, 39.05, 'ВДОХ', 820, 600, { col: T.warm, size: 80, life: .9 }); }
// ───── 0:40–0:45 стрим: 2K → 340K; ликование ─────
const CHAT3 = [{ at: 40.3, name: 'dana.med', text: 'ОНА ДЫШИТ!!!', col: T.pink }, { at: 40.9, name: 'timur_407', text: 'общага, вы легенды', col: T.low }, { at: 41.5, name: 'aizhan', text: 'ПАУЭРБАНК ГЕРОЙ', col: T.charge }, { at: 42.1, name: 'gost_0', text: 'это постановка?', col: '#9aa3b5' }];
function streamScene(t) { StreamFrame(t, { title: 'ПАУЭРБАНК СПАС ВАХТЁРШУ', viewers: tt => 2000 * Math.pow(170, E.io(win(tt, 40.2, 42.4))), chat: CHAT3, hearts: 7,
  drawVideo: () => { vahtaNight(t); for (let i = 0; i < 5; i++) { const q = STUDS[i]; student(220 + i * 160, 1500, 1.1, t, { topCol: q.top, skin: q.skin, top: 'pajama', armL: [-2.6 - .2 * Math.sin(t * 8 + i), -.2], armR: [2.6 + .2 * Math.sin(t * 8 + i), .2], face: sFace(q, { mouth: 'grin', brow: 'up' }) }); } } }); }
function cheer(t) { vahtaNight(t); FX.backGlow(540, 800, 700, '255,210,63', .25);
  [[90, 0], [250, 1], [830, 2], [990, 3]].forEach(([x, i]) => { const q = STUDS[i + 8], up = AK.overshoot(win(t, 42.6 + i * .08, 42.85 + i * .08)), hop = Math.abs(Math.sin(t * 7 + i)) * 30;
    student(x, 1640 - hop, 1.45, t, { topCol: q.top, top: i % 2 ? 'pajama' : 'hoodie', skin: q.skin, armL: [lerp(-.3, -2.8, up), -.2], armR: [lerp(.3, 2.8, up), .2], face: sFace(q, { mouth: 'grin', brow: 'up' }) }); });
  beka(540, 1700, 1.75, t, { lean: Math.sin(t * 2) * .04, armL: [-.4, .3], armR: [.4, -.3], straps: false, face: { streak: 1, mouth: 'smile', lid: .35, brow: 'up' } });
  FX.emote(t, 43.2, 'heart', 680, 820, .8, 1.6); FX.onomato(t, 42.7, 'УРА-А-А!', 540, 520, { col: T.low, size: 100, life: 1.2 }); }
// ───── 0:45–0:50 «Ты не один» ─────
function apaiMask(t) { vahtaNight(t); dim(.2); FX.backGlow(540, 860, 560, '255,179,71', .35); ctx.save(); ctx.translate(540, 860); ctx.rotate(-.08); apaiHead(0, 0, 330, { lid: .45, mouth: 'flat', brow: 'up', glasses: false, look: .6 }); ctx.restore();
  oxyMask(540, 860, 330, mouthK(t, ['e3s11'])); } // маска запотевает в такт голосу
function handsWarm(t) { vahtaNight(t); dim(.25); FX.backGlow(540, 900, 600, '255,179,71', .35); const st = Math.sin((t - 47.6) * 3) * 40;
  armTo(-200, 1300, 600, 980, { pose: 'flat', w: 150, bend: -.05 }); // рука Беки
  armTo(1300, 600, 640 + st, 860, { pose: 'flat', w: 130, col: '#5b4a6e', skin: '#d7a07a', bend: .1, wristRot: .3 }); ctx.strokeStyle = '#d4b04a'; ctx.lineWidth = 7; circle(610 + st, 800, 16); ctx.stroke(); } // апай гладит по руке, кольцо
function bekaQuiet(t) { vahtaNight(t); dim(.45); bekaHead(520, 820, 300, { streak: 1, lid: .55, mouth: 'flat', brow: 'up', noBlink: 1 }); }
// ───── 0:51–0:55,5 сообщение от ruslan.miner ─────
const RUS_AT = 51.1;
function phoneMsg(t) { vahtaNight(t); dim(.5); rr(-100, 1100, W + 200, 300, 0); ctx.fillStyle = '#5a4030'; ctx.fill(); const vib = t > RUS_AT && t < RUS_AT + .6 ? Math.sin(t * 90) * 6 : 0;
  FX.backGlow(540, 900, 700, '138,92,255', clamp((t - RUS_AT) * 2) * .6); notifyPhone(t, 540 + vib, 900, 1.0, { at: RUS_AT, name: 'ruslan.miner', lines: [['Видел видео.', RUS_AT + .3], ['Есть работа.', RUS_AT + .8], ['10 000 000 ₸/мес', RUS_AT + 1.4, 1]] }); }
function bekaPurple(t) { ctx.fillStyle = '#0c0a18'; ctx.fillRect(-300, -300, W + 600, H + 600); FX.backGlow(540, 1300, 900, '138,92,255', .8); const wide = E.out(win(t, 53.8, 54.2));
  bekaHead(520, 800, 310, { streak: 1, lid: lerp(.3, 0, wide), mouth: wide > .5 ? 'o' : 'flat', brow: 'up', lookY: 1, noBlink: wide > 0 }); FX.emote(t, 54.3, '?', 820, 420, 1.1, 1.2); }

// ───── голос и субтитры ─────
const VO_AT = { e3s01: .05, e3d01: 1.85, e3s02: 3.25, e3s03: 7.3, e3d02: 12.05, e3d03: 14.35, e3s05: 16.3, e3s06: 20.4, e3s07: 24.7, e3s08: 30.4, e3d02b: 36.1, e3d04: 38.15, e3s10: 40.3, e3s11: 45.45 };
const VO_FILE = { e3d02b: 'e3d02' };
const VO_GAIN = { e3s01: 4.4, e3d01: 2.2, e3d02: 4.0, e3d02b: 4.0, e3d03: 3.8, e3d04: 4.0, e3s06: 3.4, e3s11: 3.0 };
const VT = id => window.VO_WORDS && window.VO_WORDS[VO_FILE[id] || id] ? window.VO_WORDS[VO_FILE[id] || id].map(x => x + VO_AT[id]) : null;
if (window.VO_MOUTH && window.VO_MOUTH.e3d02) window.VO_MOUTH.e3d02b = window.VO_MOUTH.e3d02;
const TALK = { dana: ['e3d01', 'e3d02', 'e3d02b', 'e3d03', 'e3d04'] };
const CAPS = buildCaptions([
  [0, 3, 'У апай **остановилось сердце**', { times: VT('e3s01'), whole: true, size: 70, maxW: 860 }],
  [3.2, 7.2, 'А дефибриллятор **разряжен**', { times: VT('e3s02') }],
  [7.25, 11.8, 'Один разряд — **20%**. У меня было 22', { times: VT('e3s03') }],
  [12.0, 13.2, '**Отойти!**', { times: VT('e3d02'), speaker: 'dana' }],
  [14.3, 16.2, 'Нет ритма. **Ещё раз!**', { times: VT('e3d03'), speaker: 'dana' }],
  [16.25, 20, 'Ещё один разряд — и я **отключусь**', { times: VT('e3s05') }],
  [20.35, 24.4, 'Пацаны! Все **пауэрбанки** — на вахту!', { times: VT('e3s06'), speaker: 'erzhan' }],
  [24.65, 30, 'И общага **побежала**', { times: VT('e3s07') }],
  [30.35, 35.2, 'Плюс пять. Плюс пять. **Плюс пять**', { times: VT('e3s08') }],
  [36.05, 37.4, '**Отойти!**', { times: VT('e3d02b'), speaker: 'dana' }],
  [38.1, 40, '**Есть пульс!**', { times: VT('e3d04'), speaker: 'dana' }],
  [40.25, 45, 'К утру меня видели **триста тысяч**', { times: VT('e3s10') }],
  [45.4, 50, 'Ты **не один**', { times: VT('e3s11'), speaker: 'apai' }],
], { tail: .3 });
CAPS[0].words.forEach(w => w.t = Math.min(w.t, 1.4)); CAPS[0].a = 0;
window.CAPTION_PHRASES = CAPS;

// ───── сцены: [начало, конец, id, рисование, hud, склейка] — по умолчанию жёсткая склейка ─────
const HD = t => hudBase(t);
const SC = [
  [0, 3, 'e3s01', t => push(t, 0, 3, () => hook(t), 540, 900, 1.06, 1.14), HD],
  [3, 5.4, 'e3s02a', t => push(t, 3, 5.4, () => aedWall(t), 540, 790, 1, 1.12), HD],
  [5.4, 7.4, 'e3s02b', t => bekaRealize(t), HD],
  [7.4, 10, 'e3s03a', t => push(t, 7.4, 10, () => chargeAED(t), 540, 800, 1, 1.08), HD],
  [10, 12, 'e3s03b', t => push(t, 10, 12, () => stepBack(t), 600, 900, 1, 1.06), HD],
  [12, 14.3, 'e3s04a', t => push(t, 12, 14.3, () => shock(t, SHOCK1), 540, 900, 1, 1.05), HD],
  [14.3, 16.25, 'e3s04b', t => push(t, 14.3, 16.25, () => ecgClose(t, { stampAt: 14.5, stampText: 'НЕТ РИТМА', stampCol: T.empty }), 540, 820, 1, 1.08), HD],
  [16.25, 18.6, 'e3s05a', t => bekaTwo(t), HD],
  [18.6, 20.2, 'e3s05b', t => push(t, 18.6, 20.2, () => cprAgain(t), 540, 900, 1.04, 1.1), HD],
  [20.2, 22.6, 'e3s06a', t => push(t, 20.2, 22.6, () => erzhanLive(t), 520, 900, 1, 1.12), HD],
  [22.6, 24.6, 'e3s06b', t => push(t, 22.6, 24.6, () => doorsWake(t), 540, 900, 1, 1.08), HD, 'whip'],
  [24.6, 27.4, 'e3s07a', t => stairsRun(t), HD, 'whip'],
  [27.4, 30.2, 'e3s07b', t => runFront(t), HD],
  [30.2, 32.85, 'e3s08a', t => push(t, 30.2, 32.85, () => palmsPB(t), 540, 900, 1, 1.06), HD, 'whip'],
  [32.85, 35.2, 'e3s08b', t => push(t, 32.85, 35.2, () => bekaPB(t), 540, 900, 1, 1.08), HD],
  [35.2, 36.5, 'e3s09a', t => chargeAED(t, DEF2, READY2), HD],
  [36.5, 37.4, 'e3s09b', t => shock(t, SHOCK2), HD],
  [37.4, 39, 'e3s09c', t => push(t, 37.4, 39, () => ecgClose(t, { stampAt: 38.2, stampText: 'ЕСТЬ ПУЛЬС', stampCol: T.charge }), 540, 820, 1, 1.08), HD],
  [39, 40, 'e3s09d', t => push(t, 39, 40, () => apaiWake(t), 540, 900, 1.05, 1.12), HD],
  [40, 42.6, 'e3s10a', t => streamScene(t), HD],
  [42.6, 45, 'e3s10b', t => push(t, 42.6, 45, () => cheer(t), 540, 1000, 1, 1.07), HD],
  [45, 47.6, 'e3s11a', t => push(t, 45, 47.6, () => apaiMask(t), 540, 860, 1, 1.08), HD],
  [47.6, 50, 'e3s11b', t => push(t, 47.6, 50, () => handsWarm(t), 600, 900, 1, 1.1), HD],
  [50, 51, 'e3s12', t => push(t, 50, 51, () => bekaQuiet(t), 520, 820, 1, 1.04), HD],
  [51, 53.4, 'e3s13a', t => push(t, 51, 53.4, () => phoneMsg(t), 540, 900, 1, 1.1), HD],
  [53.4, 55.5, 'e3s13b', t => push(t, 53.4, 55.5, () => bekaPurple(t), 520, 800, 1, 1.12), HD],
  [55.5, 58.01, 'e3s14', t => EndCard(t, 55.5, 'Взял бы **10 миллионов**?', 'ЧАСТЬ 4 →'), null],
];
function drawFrame(t) { NOW = t; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud, cut = 'none'] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore();
  AK.cut(t, a, cut); if (id === 'e3s04a' || id === 'e3s09b') { const s2 = id === 'e3s04a' ? SHOCK1 : SHOCK2; if (t >= s2 + .12 && t < s2 + .12 + 2 / 30) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(0, 0, W, H); } } // вспышка после рентгена
  post(t); const g = ctx.createLinearGradient(0, 1100, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 1100, W, H - 1100); // затемнение низа под субтитры
  if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(3, t); KineticCaption(t, CAPS); }

// ───── звук: музыка без дыр (кроме тишины 50–51 по ТЗ), каждое событие — свой звук ─────
const THEME = 'projects/kuat/assets/theme.wav', THEME2 = 'projects/kuat/assets/theme-full.wav', BED = 'projects/kuat/assets/bed-ep3.wav';
const ringIn = (t0, n, gap) => Array.from({ length: n }, (_, i) => +(t0 + i * gap).toFixed(3));
const comps = (a, b) => ringIn(a + .02, Math.floor((b - a) * 1.9), 1 / 1.9);
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/kuat/assets/vo/ep3/${VO_FILE[id] || id}.wav`, gain: VO_GAIN[id] || 4.2 })),
  { t: 0, type: 'file', path: BED, gain: .08, dur: 50 }, { t: 51, type: 'file', path: BED, gain: .07, from: 51, dur: 4.5 }, // подложка
  ...comps(0, 3).map(t => ({ t, type: 'thud', gain: .12, pitch: 1.4 })), ...comps(18.6, 20.2).map(t => ({ t, type: 'thud', gain: .1, pitch: 1.4 })), // толчки массажа
  { t: 0, type: 'heartbeat', gain: .15, pitch: 1.3 }, { t: 1, type: 'heartbeat', gain: .15, pitch: 1.3 },
  ...ringIn(3.3, 3, .55).map(t => ({ t, type: 'beep', gain: .22, pitch: .55 })), { t: 6.3, type: 'pop', gain: .3 }, // ошибка прибора, «!»
  { t: DEF1 - .05, type: 'lib', id: 'click-clap-firm', gain: .3 }, { t: DEF1, type: 'hum50', dur: READY1 - DEF1, gain: .1, attack: .1 }, { t: DEF1, type: 'ff', dur: READY1 - DEF1, gain: .1 }, { t: DEF1, type: 'charge', gain: .25, pitch: .7 },
  { t: READY1, type: 'tone', freq: 1320, dur: .12, gain: .12 }, { t: READY1 + .18, type: 'tone', freq: 1320, dur: .12, gain: .12 }, // «готов»
  { t: 10.45, type: 'lib', id: 'whoosh-fast-soft', gain: .1 },
  { t: SHOCK1, type: 'zap', dur: .5, gain: .5 }, { t: SHOCK1, type: 'lib', id: 'impact-deep-firm', gain: .45 }, { t: SHOCK1 + .03, type: 'thud', gain: .3 },
  ...ringIn(14.3, 4, .5).map(t => ({ t, type: 'beep', gain: .12, pitch: .45 })), { t: 14.5, type: 'lib', id: 'impact-deep-firm', gain: .25 }, // тревога прибора, удар штампа
  { t: 16.8, type: 'lowbat', gain: .3 }, ...ringIn(16.3, 4, .55).map(t => ({ t, type: 'heartbeat', gain: .2 })),
  { t: 20.25, type: 'pop', gain: .25 }, { t: 20.5, type: 'bloop', gain: .15 }, // «!», включил эфир
  { t: 20.65, type: 'file', path: 'projects/kuat/assets/vo/ep3/e3s06.wav', gain: 1.0 }, { t: 20.95, type: 'file', path: 'projects/kuat/assets/vo/ep3/e3s06.wav', gain: .4 }, // эхо крика
  ...DOORS_T.map((t, i) => ({ t, type: 'lib', id: i % 2 ? 'click-latch-firm' : 'click-latch-medium', gain: .3, pan: -.6 + i * .24 })), { t: 22.6, type: 'murmur', dur: 2, gain: .05 },
  { t: 24.6, type: 'file', path: THEME, gain: .16, dur: 8.57 }, { t: 33.17, type: 'file', path: THEME, gain: .2, dur: 3.2 }, // бит нарастает
  ...ringIn(24.65, 36, .15).map((t, i) => ({ t, type: 'step', gain: .14, pitch: .8 + (i % 5) * .08, pan: (i % 3 - 1) * .4 })), { t: 24.6, type: 'lib', id: 'whoosh-medium-hard', gain: .15 },
  { t: 27.4, type: 'murmur', dur: 2.8, gain: .06, pitch: 1.2 }, { t: 28, type: 'pop', gain: .25 },
  ...PB.flatMap(t => [{ t: t - .3, type: 'lib', id: 'whoosh-fast-soft', gain: .08 }, { t, type: 'charge', gain: .25, pitch: 1.2 }, { t, type: 'hum50', dur: .5, gain: .07 }]),
  { t: DEF2 - .05, type: 'lib', id: 'click-clap-firm', gain: .3 }, { t: DEF2, type: 'ff', dur: READY2 - DEF2, gain: .1 }, { t: READY2, type: 'tone', freq: 1320, dur: .1, gain: .12 },
  { t: SHOCK2, type: 'zap', dur: .5, gain: .5 }, { t: SHOCK2, type: 'lib', id: 'impact-deep-firm', gain: .45 },
  ...ringIn(SINUS, 4, .8).map(t => ({ t, type: 'tone', freq: 1000, dur: .09, gain: .12 })), { t: 38.2, type: 'lib', id: 'impact-deep-firm', gain: .2 }, { t: 39.05, type: 'breath_in', dur: .7, gain: .3 },
  { t: 40, type: 'file', path: THEME2, gain: .18, dur: 5 }, { t: 40, type: 'lib', id: 'celebration-applause-big', gain: .1, align: 'start', dur: 4.6 }, ...CHAT3.map(c => ({ t: c.at, type: 'bloop', gain: .12, pitch: 1.4 })),
  { t: 42.7, type: 'lib', id: 'celebration-applause-small', gain: .1, align: 'start', dur: 2.2 }, { t: 43.2, type: 'pop', gain: .2 },
  { t: 45, type: 'chord', notes: [57, 60, 64], dur: 5, attack: 1.2, gain: .05, warm: 1 }, // нежный пэд
  // 50,0–51,0 — тишина перед финальным сообщением
  { t: RUS_AT, type: 'lib', id: 'phone-vibrate-table', gain: .35, align: 'start', dur: .7 }, { t: RUS_AT + .3, type: 'bloop', gain: .14, pitch: .7 }, { t: RUS_AT + 1.4, type: 'lib', id: 'impact-deep-firm', gain: .25 },
  { t: 51, type: 'drone', dur: 4.5, gain: .07, pitch: .6 }, { t: 54.3, type: 'pop', gain: .18 },
  { t: 55.5, type: 'file', path: THEME, gain: .36, dur: 2.5 },
];
// ───── раскадровка storyboard/ep3.json ─────
window.STORYBOARD = { episode: EP, title: 'Народ', duration: DUR, hud: { place: 'АСТАНА', temp: '−34°', battery: { start: 22, low: 2, peak: 27, end: 7 } },
  scenes: SC.map(([a, b, id, , hud, cut]) => { const h = hud ? hud(a + .01) : null, he = hud ? hud(Math.min(b, DUR) - .02) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), cut: cut || 'none', vo: c.length ? { speaker: c[0].speaker || 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && s.type !== 'file').map(s => ({ id: s.id || s.type, at: +s.t.toFixed(2) })), hud: h ? { time: h.time, battery: Math.round(h.battery), batteryEnd: Math.round(he.battery) } : null,
      overlays: a === 0 ? ['PartSticker:3'] : id === 'e3s14' ? ['EndCard'] : id === 'e3s10a' ? ['StreamFrame'] : /e3s(03a|08a|08b|09a)/.test(id) ? ['ChargeFlow'] : /e3s(04b|09c)/.test(id) ? ['Stamp'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
