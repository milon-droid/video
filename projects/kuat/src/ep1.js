// «ҚУАТ» · серия 1 «Молния» (0:58). Таймкоды и тексты — по ТЗ, раздел 7; заряд и время — из одной функции (раздел 8).
'use strict';
const DUR = 58, EP = 1;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));

// ───── сюжетное время и заряд (единый источник для HUD) ─────
STORY_CLOCK[1] = [[0, '23:40'], [3, '22:40'], [8, '22:41'], [13, '22:55'], [18, '23:10'], [23, '23:36'], [27, '23:40'], [31, '23:44'], [35, '23:58'], [41, '00:02'], [46, '00:09'], [51, '00:15']];
const MAST = 640, STRIKE = 28.3, HALL = [36.2, 37.3, 38.4, 39.5], STRIP_AT = 41.2, LAPTOP = 51.0;
const STRIP = [41.7, 42.2, 42.65, 43.05, 43.45, 43.8, 44.15, 44.5, 44.85, 45.2]; // 10 телефонов на удлинителе: 23 → 3%
BATTERY[1] = { start: 0, showAt: STRIP_AT, events: [[STRIKE, 31, .05], ...HALL.map(t => [t, 'phone']), ...STRIP.map(t => [t, 'phone']), [LAPTOP, 'laptop', .25]] };
const hudBase = t => ({ time: storyClock(EP, t), temp: '−31°', battery: batteryShown(EP, t), rate: batteryRate(EP, t), appear: win(t, STRIP_AT, STRIP_AT + .45), stamp: t >= 3 && t < 5.6 ? 'ЧАС НАЗАД' : null });
const lightK = (t, at, dec = 6) => t < at ? 0 : Math.exp(-(t - at) * dec);
const breathe = t => Math.sin(t * 2.2) * 6;

// ───── 0:00–0:03 хук: метель, молния бьёт в антенну на крыше общаги, кадр белеет ─────
const HOOK1 = .55, HOOK2 = 2.05;
function hookRoof(t) { const L = lightK(t, HOOK1, 3), [sx, sy] = shake(t, HOOK1, 34, 5); ctx.save(); ctx.translate(sx, sy); roof(t, { mastX: MAST, flashK: L * .8 }); dim(.05);
  const arm = [2.75, .15], hd = handOf(470, 1560, 1.6, 1, arm); beka(470 + (MAST - hd[0]), 1560, 1.6, t, { armR: arm, armL: [-1.2, -.6], face: { mouth: t > HOOK1 ? 'o' : 'grit', look: 1, lookY: -1, stat: t > HOOK1 ? 1 : .3, lid: 0, noBlink: 1 } });
  if (t >= HOOK1 && t < HOOK1 + .6) { bolt(MAST - 240, -80, MAST, 560, 31, { w: 18, a: 1 - (t - HOOK1) / .6 }); bolt(MAST + 280, -80, MAST, 560, 7, { w: 9, a: .7 * (1 - (t - HOOK1) / .6), branches: 1 }); }
  if (t > HOOK1) { const r = seeded(Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,230,255,.9)'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { let x = MAST, y = 600 + r() * 300; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - .6) * 80; y += 50; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); } // ток по руке и мачте
  snow(t, .95, 300, 1.2); ctx.restore(); flash(t, HOOK1); }
function hook(t) { const L = Math.max(lightK(t, HOOK1, 5), lightK(t, HOOK2, 4)), [sx, sy] = shake(t, HOOK2, 26, 6);
  ctx.save(); ctx.translate(sx, sy); nightSky(t, L * .8); dorm(t, { lit: L, antennaGlow: L });
  person(600, 560, .24, t, { armR: [2.7, .1], face: {} }); // крошечный Бека у антенны
  for (const [at, sd] of [[HOOK2, 12]]) if (t >= at && t < at + .45) bolt(430 + sd * 8, -60, 660, 262, sd, { w: 12, a: 1 - (t - at) / .32 });
  snow(t, .9, 220, 1.1); ctx.restore();
  flash(t, HOOK2); const wk = E.in2(win(t, 2.45, 3)); if (wk > 0) { ctx.fillStyle = `rgba(245,250,255,${wk})`; ctx.fillRect(0, 0, W, H); } }
// ───── 0:03–0:08 комната: Бека над ТОЭ, красная «2» в зачётке ─────
const ROOMCLOCK = (t, x = 250, y = 520) => { const [hh, mm] = storyClock(EP, t).split(':').map(Number); return [x, y, hh, mm]; };
function deskScene(t) { roomWall(t, { winX: 660, winY: 300, clock: ROOMCLOCK(t, 230, 470) });
  const blink = (t % 3.1) > 2.95 ? 1 : 0, s = 2.6, y = 1600 + Math.sin(t * 1.4) * 4;
  beka(500, y, s, t, { hideLegs: true, armLen: [116, 121], armL: [-.602, 3.317], armR: [.602, -3.317], face: { brow: 'sad', lookY: 1, lid: blink ? 1 : .25, mouth: 'flat' } });
  ctx.fillStyle = '#a7774f'; ctx.fillRect(-100, 1080, W + 200, 90); fillOL('#a7774f', 0); ctx.fillStyle = '#7d5236'; ctx.fillRect(-100, 1170, W + 200, H); ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-100, 1080); ctx.lineTo(W + 100, 1080); ctx.moveTo(-100, 1170); ctx.lineTo(W + 100, 1170); ctx.stroke(); // стол
  notebook(500, 1120, .9, 'ТОЭ', .04); notebook(250, 1110, .7, 'ТОЭ-2', -.15, '#8a3b52'); deskLamp(860, 1100, 1); noodles(130, 1140, .9, t); }
function gradeClose(t) { ctx.fillStyle = '#9a6b45'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.strokeStyle = 'rgba(60,35,20,.25)'; ctx.lineWidth = 4; for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(-200, i * 110 + 30); ctx.bezierCurveTo(300, i * 110 + 60, 700, i * 110, 1300, i * 110 + 40); ctx.stroke(); }
  glow(540, 700, 800, 'rgba(255,236,190,.35)');
  ctx.save(); ctx.translate(540, 680); ctx.rotate(-.04); rr(-430, -470, 860, 940, 16); fillOL('#2f5d4a', 8); rr(-405, -445, 395, 890, 6); fillOL('#f4f1ea', 4); rr(10, -445, 395, 890, 6); fillOL('#f4f1ea', 4);
  txt('ЗАЧЁТНАЯ', -207, -380, 42, '#2f5d4a', { align: 'center' }); txt('КНИЖКА', -207, -330, 42, '#2f5d4a', { align: 'center' }); txt('2 КУРС', -207, -250, 34, T.ink, { align: 'center', weight: 800 });
  ctx.strokeStyle = 'rgba(30,40,60,.25)'; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(40, -360 + i * 100); ctx.lineTo(380, -360 + i * 100); ctx.stroke(); }
  [['МАТЕМАТИКА', '4'], ['ФИЗИКА', '4'], ['ИНФОРМАТИКА', '5']].forEach(([a, b], i) => { txt(a, 50, -390 + i * 100, 30, T.ink, { weight: 800 }); txt(b, 350, -390 + i * 100, 40, '#2a4a8a', { align: 'center' }); });
  txt('ТОЭ', 50, -90, 56, T.ink); const k = E.back(win(t, 6.0, 6.35)); if (k > 0) { ctx.save(); ctx.translate(310, -50); ctx.scale(k, k); ctx.rotate(-.12); txt('2', 0, 0, 230, T.empty, { align: 'center', stroke: 0 }); ctx.strokeStyle = T.empty; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 6, 120, 140, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  ctx.restore(); }
// ───── 0:08–0:13 Ержан с телефоном на 1% ─────
const stick = (dx, dy, lvl, s = 1) => (x, y) => { ctx.strokeStyle = '#222'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke(); phone(x + dx * 1.15, y + dy * 1.15, s, lvl); };
function erzhanBed(t) { roomWall(t, { winX: 120, winY: 320, winW: 300, clock: null }); ctx._t = t;
  bed(-60, 1560, 1200, { blanket: '#7a3b6a' }); const wave = Math.sin(t * 9) * .18;
  erzhan(540, 1500, 2.1, t, { sit: true, armR: [2.35 + wave, .25], armL: [-.7, 1.6], face: { mouth: speaking(t, TALK.erzhan) ? 'open' : 'smile', brow: 'up', look: .6 }, holdR: stick(10, -80, 1, 1.25) });
  ctx.fillStyle = '#7a3b6a'; rr(80, 1420, 920, 300, 60); fillOL('#7a3b6a', 6); } // одеяло на коленях
function erzhanClose(t) { roomWall(t, { winX: -40, winY: 300, winW: 300 }); dim(.15); ctx._t = t; const jab = E.out(win(t, 10.6, 10.9));
  erzhanHead(380, 760, 300, { mouth: speaking(t, TALK.erzhan) ? 'open' : 'flat', brow: 'up', look: 1 }); ctx.save(); ctx.translate(lerp(900, 780, jab), lerp(900, 760, jab)); ctx.rotate(.08); phone(0, 0, 4.4, 1); if (Math.floor(t * 3) % 2 === 0) glow(0, 0, 260, 'rgba(255,77,77,.35)'); ctx.restore();
  hand(lerp(860, 760, jab), lerp(1230, 1110, jab), 1.1, .08, { pose: 'grip', skin: '#c98b64', cuff: '#ff8a2a' }); }
// ───── 0:13–0:18 очередь к единственной розетке ─────
const QUEUE = (() => { const r = seeded(12), hairs = ['short', 'long', 'bun', 'buzz', 'beanie', 'short', 'long'], tops = ['#5b7fb0', '#b0475f', '#3d8a6a', '#7a5cb0', '#c48a3a', '#4a5a7a', '#a34a8a', '#2f7f8f'];
  return Array.from({ length: 12 }, (_, i) => ({ hair: hairs[i % hairs.length], top: tops[i % tops.length], skin: ['#e3a67f', '#d9a07a', '#c98b64', '#e7b493'][i % 4], lvl: [1, 3, 2, 5, 1, 4, 2, 1, 7, 3, 2, 1][i], ph: r() * 6 })); })();
function queueFar(t) { corridorPersp(t, { vx: 520, vy: 760 }); outlet(612, 880, .6);
  for (let i = 11; i >= 0; i--) { const z = Math.pow(.8, i), q = QUEUE[i], x = lerp(612, 900, z) - 40 * z, y = lerp(905, 2330, z), s = 1.75 * z;
    student(x, y, s, t, { topCol: q.top, top: i % 5 === 3 ? 'pajama' : 'hoodie', armR: [2.2, .7], face: { hair: q.hair, skin: q.skin, lookY: 1, mouth: 'flat', look: -.5 }, skin: q.skin, holdR: (hx, hy) => phone(hx - 6, hy - 30, .8, q.lvl, { rot: -.2 }) }); }
  beka(190, 2000, 1.9, t, { straps: true, armL: [-.1, .2], face: { mouth: 'smirk', look: 1, brow: 'up' } }); }
function queueRow(t, scroll) { corridorSide(t, scroll * .3); ctx.save(); ctx.translate(-scroll, 0);
  for (let i = 0; i < 5; i++) { const q = QUEUE[i + 3], x = 200 + i * 260; student(x, 1660, 1.6, t, { topCol: q.top, armR: [2.4, .6], skin: q.skin, face: { hair: q.hair, skin: q.skin, lookY: 1, look: .3, lid: .3 }, holdR: (hx, hy) => phone(hx - 4, hy - 34, .9, q.lvl, { rot: -.15 }) }); }
  const bt = win(t, 16.8, 17.3); beka(1500, 1680, 1.65, t, { straps: true, face: { mouth: bt > .5 ? 'smirk' : 'flat', look: lerp(-1, 1, bt), brow: 'up' } }); ctx.restore(); }
// ───── 0:18–0:23 ремонт за 200 ₸ ─────
function repairClose(t) { ctx.fillStyle = '#8f6340'; ctx.fillRect(-200, -200, W + 400, H + 400); glow(520, 640, 760, 'rgba(255,236,190,.4)');
  ctx.save(); ctx.translate(520, 650); ctx.rotate(.05); rr(-270, -460, 540, 920, 60); fillOL('#22283c', 8); rr(-240, -430, 480, 860, 40); fillOL('#3a4258', 4);
  rr(-200, -100, 400, 470, 18); fillOL('#2b2f3a', 4); txt('3.85V', 0, 120, 44, '#9aa3b5', { align: 'center', font: 'JBM', weight: 800 }); // аккумулятор
  rr(-200, -400, 400, 260, 14); fillOL('#2e7d5a', 4); for (let i = 0; i < 5; i++) { rr(-170 + i * 72, -360 + (i % 2) * 60, 54, 54, 6); fillOL('#1a1d26', 3); } // плата
  for (const [sx, sy] of [[-210, -400], [210, -400], [-210, 400], [210, 400]]) { circle(sx, sy, 16); fillOL('#b8bcc6', 3); ctx.strokeStyle = T.ol; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 9, sy); ctx.lineTo(sx + 9, sy); ctx.stroke(); }
  ctx.restore(); const turn = t * 6; ctx.save(); ctx.translate(735, 1040); ctx.rotate(-.75); // отвёртка в винт у правого нижнего угла
  rr(-14, -260, 28, 260, 8); fillOL('#c8ccd6', 4); rr(-40, -520, 80, 270, 30); fillOL('#e5383b', 5); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { const yy = -500 + ((i * 80 + turn * 40) % 240); ctx.beginPath(); ctx.moveTo(-30, yy); ctx.lineTo(30, yy); ctx.stroke(); } ctx.restore();
  armTo(1250, 180, 520, 700, { pose: 'grip', w: 120, bend: -.1 }); // кисть на ручке отвёртки
  for (const [x, y] of [[180, 1150], [260, 1180], [880, 1170]]) { circle(x, y, 10); fillOL('#b8bcc6', 3); } }
function repairHand(t) { const fl = lightK(t, 21.8, 3) * (t > 21.8 ? 1 : 0); roomWall(t, { winX: 380, winY: 260, winW: 340, winH: 420, winFlash: fl, clock: ROOMCLOCK(t, 900, 420) });
  const give = E.io(win(t, 20.8, 21.5)), coin = win(t, 22.0, 22.6);
  const gx = lerp(560, 430, give);
  student(250, 1720, 2.0, t, { topCol: '#b0475f', armR: [lerp(1.2, 1.5, give), lerp(.3, -.1, give)], armL: [-.15, .1], skin: '#e7b493', face: { hair: 'long', skin: '#e7b493', mouth: give > .6 ? 'smile' : 'flat', look: 1, brow: give > .6 ? 'up' : null },
    holdR: coin < 1 ? (x, y) => { if (coin > 0) return; circle(x + 12, y - 8, 22); fillOL('#d9c27a', 4); txt('200', x + 12, y - 8, 16, T.ink, { align: 'center', font: 'JBM', weight: 800 }); } : null });
  beka(760, 1720, 2.0, t, { straps: false, armL: [lerp(1.7, 1.9, give) * -1 + 3.6, 0], armR: [.3, .2], face: { mouth: 'smirk', look: -1 },
    holdL: (x, y) => phone(x - 10, y - 30, 1.3, give > .5 ? 86 : 0, { lit: give > .5, rot: -.2 }) });
  if (coin > 0) { const cx = lerp(470, 660, E.io(coin)), cy = lerp(1050, 1140, E.io(coin)) - Math.sin(coin * Math.PI) * 160; ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.cos(coin * 12), 1); circle(0, 0, 26); fillOL('#d9c27a', 4); ctx.restore(); }
  if (fl > 0) glow(550, 470, 500, `rgba(61,255,143,${.35 * fl})`); }
// ───── 0:23–0:27 крыша: люк, антенна ─────
function hatch(t) { nightSky(t); cityFar(t, 820, { k: .8 }); ctx.fillStyle = '#2b3557'; ctx.fillRect(-200, 900, W + 400, H); ctx.fillStyle = T.snow; ctx.fillRect(-200, 900, W + 400, H);
  ctx.fillStyle = 'rgba(150,170,210,.4)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(120 + i * 230, 1000 + (i % 2) * 80, 180, 24, 0, 0, Math.PI * 2); ctx.fill(); }
  antenna(840, 960, 1.4, t); ctx.save(); ctx.translate(840, 960); ctx.rotate(.3 + Math.sin(t * 5) * .03); ctx.restore();
  ctx.beginPath(); ctx.moveTo(220, 1180); ctx.lineTo(860, 1180); ctx.lineTo(960, 1560); ctx.lineTo(120, 1560); ctx.closePath(); fillOL('#1a1410', 8); const g = ctx.createLinearGradient(0, 1180, 0, 1560); g.addColorStop(0, 'rgba(242,215,166,.2)'); g.addColorStop(1, 'rgba(242,215,166,.7)'); ctx.fillStyle = g; ctx.fill(); // люк, тёплый свет снизу
  ctx.save(); ctx.translate(860, 1180); ctx.rotate(-1.2); rr(0, -20, 640, 40, 8); fillOL('#5a6a8a', 5); ctx.restore(); // открытая крышка
  const up = E.out(win(t, 23.1, 24.2)); ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, 1560 + 200); ctx.clip();
  beka(540, lerp(2300, 1780, up), 1.9, t, { straps: false, armL: [lerp(.2, 2.6, up), -.6], armR: [lerp(-.2, -2.6, up), .6], face: { mouth: 'grit', brow: 'angry', lid: .4, look: .5 } }); ctx.restore();
  ctx.save(); ctx.globalAlpha = .9; snow(t, 1, 380, 1.3); ctx.restore(); }
const MAST_TILT = t => lerp(.32, 0, E.io(win(t, 25.4, 26.6)));
function roofWide(t, { fly = 0, lie = 0, lit = 0 } = {}) { const [sx, sy] = shake(t, STRIKE, 40, 5); ctx.save(); ctx.translate(sx, sy);
  roof(t, { mastX: MAST, flashK: lit }); dim(.08);
  ctx.save(); ctx.translate(MAST, 1330); ctx.rotate(MAST_TILT(t)); ctx.translate(-MAST, -1330); ctx.restore();
  if (!fly && !lie) { const arm = [2.75, .15], hd = handOf(470, 1560, 1.6, 1, arm); beka(470 + (MAST - hd[0]), 1560, 1.6, t, { armR: arm, armL: [-.4, -.5], face: { mouth: 'grit', look: 1, lookY: -1, stat: lit ? 1 : win(t, 26.4, 27) * .4 } }); }
  else if (fly) { const k = E.out(win(t, STRIKE, STRIKE + 1.1)), x = lerp(520, 780, k), y = lerp(1560, 1660, k) - Math.sin(k * Math.PI) * 300; ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0, -1.5, k)); beka(0, 0, lerp(1.6, 1.3, k), t, { armR: [2.4, .2], armL: [-2.4, -.2], face: { mouth: 'o', streak: 1, stat: 1 - k * .5, lid: 0 } }); ctx.restore();
    if (k > .95) { const pk = win(t, STRIKE + 1.05, STRIKE + 1.8); for (let i = 0; i < 12; i++) { ctx.fillStyle = `rgba(238,243,248,${.8 * (1 - pk)})`; circle(300 + i * 40 + Math.cos(i) * pk * 120, 1680 - Math.abs(Math.sin(i * 2.1)) * pk * 220, 26 + pk * 30); ctx.fill(); } } }
  if (t >= STRIKE && t < STRIKE + .5) { bolt(MAST - 260, -80, MAST, 560, 31, { w: 16, a: 1 - (t - STRIKE) / .5 }); bolt(MAST + 300, -80, MAST, 560, 7, { w: 8, a: .7 * (1 - (t - STRIKE) / .5), branches: 1 }); }
  snow(t, .95, 300, 1.2); ctx.restore(); }
// ───── 0:27–0:31 удар молнии ─────
function gripClose(t) { roof(t, { mastX: 760, flashK: lightK(t, 27.6, 8) * .5 }); dim(.15); const st = win(t, 27.2, 28.2);
  bekaHead(380, 860, 290, { mouth: 'grit', brow: 'angry', look: 1, lookY: -1, stat: st, lid: .2 });
  armTo(860, 1850, 790, 720, { pose: 'grip', w: 115, bend: .08 }); // рука сжимает мачту
  if (st > .2) { const r = seeded(Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(184,220,255,.9)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { let x = 760, y = 300 + r() * 500; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (r() - .5) * 60; y += 30; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); } // искры по мачте
  snow(t, .9, 300, 1.2); }
function lying(t) { roof(t, { mastX: MAST }); dim(.2); const sm = win(t, 29.6, 31); for (let i = 0; i < 6; i++) { const ph = (t * .3 + i / 6) % 1; ctx.fillStyle = `rgba(60,60,70,${.35 * (1 - ph)})`; circle(MAST + Math.sin(i + t) * 30, 560 - ph * 400, 40 + ph * 80); ctx.fill(); } // антенна дымится
  ctx.save(); ctx.translate(780, 1660); ctx.rotate(-1.5); beka(0, 0, 1.3, t, { armR: [2.4, .2], armL: [-2.4, -.2], face: { lid: 1, streak: 1, mouth: 'flat' } }); ctx.restore();
  if (Math.floor(t * 8) % 5 === 0) glow(MAST, 600, 80, 'rgba(184,220,255,.8)'); snow(t, .9, 260, 1.1); }
// ───── 0:31–0:35 лежит в снегу: глаза открываются, седая прядь, точки по рукам ─────
const snowBg = t => snowField(t);
function faceSnow(t) { snowBg(t); ctx.save(); ctx.beginPath(); ctx.ellipse(500, 760, 470, 430, 0, 0, Math.PI * 2); ctx.fillStyle = HOODIE_D; ctx.fill(); ctx.restore(); // капюшон вокруг головы
  const open = E.out(win(t, 31.7, 32.4)); bekaHead(500, 760, 330, { lid: 1 - open * .9, streak: 1, mouth: open > .5 ? 'o' : 'flat', look: 0, brow: 'up' });
  for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(238,243,248,.95)'; circle(260 + i * 60, 500 + ((i * 137 + t * 30) % 600), 7); ctx.fill(); } snow(t, .6, 0, .25); }
function armSnow(t) { snowBg(t); ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, 760); ctx.bezierCurveTo(140, 840, 230, 930, 320, 960); ctx.quadraticCurveTo(420, 1000, 560, 1100); ctx.stroke(); rr(500, 1080, 150, 70, 14); fillOL('#e9edf2', 5); // провод и удлинитель
  const tw = Math.sin(t * 9) * .03; armTo(1200, 380, 350, 960, { pose: 'grip', w: 150, bend: .1, wristRot: tw }); // кисть сжимает провод
  ChargeFlow(t, { t0: 33.2, dur: 1.7, path: [[330, 1010], [560, 800], [800, 580], [1100, 440]], dir: 'take', size: 1.4, dots: 18 }); }
// ───── 0:35–0:41 коридор: каждый телефон, которого он касается, — 100% ─────
const WALK_V = 250, walkScroll = t => (t - 35) * WALK_V, BX = 330;
const HALL_ST = HALL.map((tc, i) => ({ x: (tc - 35) * WALK_V + BX + 330, q: QUEUE[(i * 3 + 1) % 12], tc }));
function hallway(t) { const sc = walkScroll(t); corridorSide(t, sc);
  ctx.save(); ctx.translate(-sc, 0); for (const st of HALL_ST) { const on = t >= st.tc, sx = st.x - 140; student(sx, 1580, 1.5, t, { topCol: st.q.top, armR: [2.05, .2], skin: st.q.skin, face: { hair: st.q.hair, skin: st.q.skin, mouth: on ? 'o' : 'flat', look: on ? -.8 : 0, lookY: on ? 0 : 1, brow: on ? 'up' : null }, holdR: (hx, hy) => phone(hx + 10, hy - 20, 1.05, st.q.lvl, { full: on ? 1 - .7 * win(t, st.tc + .5, st.tc + 1.5) : 0 }) }); } ctx.restore();
  const ph = t * Math.PI * 2 * 1.5, lean = .1 + Math.sin(t * 3.1) * .06, near = HALL_ST.find(st => t > st.tc - .35 && t < st.tc + .45), reach = near ? 1 - Math.abs(t - near.tc) / .45 : 0;
  const pts = beka(BX, 1700, 1.7, t, { walk: ph, lean, straps: true, armR: [lerp(.5, 1.85, clamp(reach * 1.4)), lerp(.2, -.1, reach)], armL: [-.5, .4], face: { streak: 1, lid: .45, mouth: 'open', brow: 'sad', look: 1 } });
  for (const st of HALL_ST) { const px = st.x - sc - 140, ph2 = handOf(px, 1580, 1.5, 1, [2.05, .2]); ChargeFlow(t, { t0: st.tc, dur: .55, path: [[ph2[0] + 10, ph2[1] - 20], pts.handR, pts.elbowR, pts.shoulderR, pts.heart], dir: 'give', popup: { x: ph2[0] + 10, y: ph2[1] - 130, text: '100%' } }); } }
// ───── 0:41–0:46 удлинитель на 10 телефонов: HUD впервые, 23 → 3% ─────
function stripClose(t) { ctx.fillStyle = '#a9b39a'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.fillStyle = '#93a084'; ctx.fillRect(-200, 980, W + 400, H); ctx.fillStyle = '#6e5e4e'; ctx.fillRect(-200, 1120, W + 400, H); glow(540, 300, 700, 'rgba(240,250,255,.2)');
  outlet(160, 560, 1.1); ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(160, 560); ctx.quadraticCurveTo(170, 660, 260, 640); ctx.stroke();
  const pts = powerStrip(540, 640, 1, 10, { phonesY: 360, spread: .95 });
  pts.forEach(([x, y], i) => { const on = t >= STRIP[i]; phone(x, y, 1.0, QUEUE[i].lvl, { full: on ? 1 - .6 * win(t, STRIP[i] + .4, STRIP[i] + 1.2) : 0, rot: (i - 4.5) * .05 }); });
  const slam = E.out(win(t, 40.9, STRIP_AT)), hx = lerp(820, 600, slam), hy = lerp(240, 600, slam);
  armTo(1250, -150, hx + 30, hy - 70, { pose: 'flat', w: 140, bend: .12 });
  ChargeFlow(t, { t0: STRIP_AT, dur: STRIP[9] - STRIP_AT + .3, path: [[hx, hy], [hx + 160, hy - 260], [950, 120], [1150, -100]], dir: 'give', size: 1.5, dots: 20 });
  if (t > STRIP_AT && t < STRIP[9] + .3) { const r = seeded(Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(61,255,143,.9)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { let x = 300 + r() * 480, y = 600; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 3; j++) { x += (r() - .5) * 40; y += 26; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
  pts.forEach(([x, y], i) => ChargeFlow(t, { t0: STRIP[i], dur: .2, path: [[x, y - 40], [x, y - 140]], dir: 'give', popup: { x, y: y - 150, text: '100%', size: 40 }, dots: 4 })); }
function stripFace(t) { corridorSide(t, 2100); dim(.1); const sag = win(t, 43.6, 46);
  rr(930, 940, 320, 110, 30); fillOL('#f4f1ea', 6); // удлинитель у края кадра
  const pts = beka(400, 1840, 2.5, t, { hideLegs: false, lean: lerp(.04, .12, sag), straps: true, armR: [1.78, .02], armL: [-.3, .3], face: { streak: 1, lid: lerp(.35, .7, sag) + Math.sin(t * 7) * .05, mouth: 'open', brow: 'sad', look: 1, sweat: t * 2 } });
  ChargeFlow(t, { t0: 43.6, dur: STRIP[9] - 43.6 + .3, path: [pts.handR, pts.elbowR, pts.shoulderR, pts.heart], dir: 'give', size: 1.3, dots: 16 });
  STRIP.forEach((tc, i) => { if (tc < 43.6) return; const x = 160 + ((i * 197) % 760); glow(x, 1650, 160 * lightK(t, tc, 3), 'rgba(61,255,143,.6)'); }); }
// ───── 0:46–0:50 дверь 412: «Три процента» ─────
function doorway(t) { const step = E.io(win(t, 48.3, 49.6)); roomWall(t, { winX: 760, winY: 360, winW: 260, winH: 380, clock: null, light: .75 });
  rr(300, 420, 460, 1100, 8); ctx.fillStyle = '#e9f2ff'; ctx.fill(); ctx.save(); rr(300, 420, 460, 1100, 8); ctx.clip(); corridorPersp(t, { vx: 530, vy: 900 }); ctx.restore(); ctx.strokeStyle = '#5a3d2c'; ctx.lineWidth = 34; ctx.strokeRect(300, 420, 460, 1100); // дверной проём, свет коридора
  ctx.save(); ctx.translate(300, 420); ctx.rotate(0); rr(-190, 0, 190, 1100, 6); fillOL('#7a4e32', 5); rr(-150, 90, 110, 50, 6); fillOL('#e9e4d8', 3); txt('412', -95, 116, 32, T.ink, { align: 'center', font: 'JBM', weight: 800 }); ctx.restore(); // открытая дверь
  const s = lerp(2.0, 2.35, step), x = lerp(540, 600, step), y = lerp(1700, 1820, step), sway = Math.sin(t * 2.4) * .07;
  glow(530, 900, 520, 'rgba(240,250,255,.35)');
  beka(x, y, s, t, { lean: sway + step * .12, armL: [lerp(-2.4, -.5, step), lerp(-.5, .3, step)], armR: [lerp(.4, 1.4, step), .3], straps: true, face: { streak: 1, lid: .6 + Math.sin(t * 5) * .08, mouth: 'open', brow: 'sad', look: .5 } });
  erzhan(930, 2020, 1.6, t, { sit: true, armL: [-.4, 1.4], armR: [.6, -1.2], face: { mouth: 'o', look: -1, brow: 'up' } });
  rr(720, 1560, 300, 200, 14); fillOL('#2a2f3e', 6); txt('ЭФИР', 870, 1660, 40, T.cyan, { align: 'center' }); } // ноутбук Ержана (крышкой к нам)
function laptopHand(t) { roomWall(t, { winX: -200, winY: 200, light: .55 }); bed(-200, 1700, 1500, { blanket: '#7a3b6a', back: 0 }); const lit = t >= LAPTOP;
  ctx.save(); ctx.translate(560, 980); rr(-380, -520, 760, 470, 26); fillOL('#2a2f3e', 8); rr(-345, -490, 690, 410, 10); ctx.fillStyle = lit ? '#0e2a22' : '#05060b'; ctx.fill();
  if (!lit) { ctx.strokeStyle = T.empty; ctx.lineWidth = 8; rr(-80, -320, 140, 70, 10); ctx.stroke(); txt('0%', 0, -200, 54, T.empty, { align: 'center', font: 'JBM', weight: 800, alpha: Math.floor(t * 2) % 2 ? 1 : .4 }); }
  else { txt('ЭФИР', -300, -440, 44, T.cyan); txt('50%', 0, -280, 90, T.charge, { align: 'center', font: 'JBM', weight: 800 }); }
  ctx.beginPath(); ctx.moveTo(-400, -50); ctx.lineTo(400, -50); ctx.lineTo(470, 120); ctx.lineTo(-470, 120); ctx.closePath(); fillOL('#3a4052', 8); for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 11; c++) { rr(-370 + c * 67 + r2 * 10, -30 + r2 * 46, 54, 36, 6); ctx.fillStyle = '#23283a'; ctx.fill(); } ctx.restore();
  const k = E.in2(win(t, 49.6, LAPTOP)), hx = lerp(260, 440, k), hy = lerp(380, 1010, k); // рука падает медленно — тишина
  armTo(-150, -200, hx - 20, hy - 40, { pose: 'flat', w: 130, bend: -.15 });
  ChargeFlow(t, { t0: LAPTOP, dur: .3, path: [[hx, hy + 30], [hx - 160, hy - 260], [60, 120], [-150, -200]], dir: 'give', popup: { x: 700, y: 440, text: 'НОУТБУК 50%' }, size: 1.4 }); }
// ───── 0:51,3–0:55,5 выключение ─────
const PD = 51.3;
// 0:53–0:55,5 клиффхэнгер: все телефоны общаги на 100%, Бека на нуле спит
function cliffRoom(t) { roomWall(t, { winX: 700, winY: 300, winW: 300, light: .35 }); rr(330, 380, 330, 960, 8); ctx.save(); rr(330, 380, 330, 960, 8); ctx.clip(); corridorPersp(t, { vx: 500, vy: 820, light: .5 });
  for (let i = 0; i < 5; i++) { const z = Math.pow(.78, i), x = lerp(500, 600, z), y = lerp(900, 1360, z); glow(x, y - 330 * z, 120 * z, 'rgba(61,255,143,.7)'); phone(x, y - 330 * z, .9 * z, 100, { full: 1 }); } ctx.restore(); // в коридоре — зелёные экраны
  ctx.strokeStyle = '#5a3d2c'; ctx.lineWidth = 30; ctx.strokeRect(330, 380, 330, 960); bed(-120, 1640, 1320, { blanket: '#3d6b8a' });
  ctx.save(); ctx.translate(380, 1540); ctx.rotate(1.52); beka(0, 0, 1.25, t, { armR: [.6, .4], armL: [-2.2, -.3], face: { lid: 1, streak: 1, mouth: 'flat' } }); ctx.restore(); // спит поперёк кровати
  const k = 1; erzhan(860, 1700, 1.6, t, { sit: true, armR: [-2.5, -.5], armL: [-2.4, -.6], face: { mouth: 'o', look: -1, brow: 'up' }, holdL: (x, y) => { phone(x - 10, y - 50, 1.5, 1, { full: k }); if (k > 0) glow(x, y - 50, 300 * k, 'rgba(61,255,143,.45)'); } }); }
function sleepFace(t) { roomWall(t, { winX: -300, light: .5 }); ctx.fillStyle = '#7a3b6a'; ctx.fillRect(-200, 1100, W + 400, H); rr(80, 380, 920, 520, 120); fillOL('#eae6dc', 6); // подушка
  const lid = clamp(.45 + E.io(win(t, PD, PD + .9)) * .55); bekaHead(520, 760, 300, { rot: -1.35, lid, streak: 1, mouth: 'flat' }); }

// ───── голос (черновой синтез Piper) и субтитры по меткам слов (tools/words.py) ─────
const VO_AT = { e1s01: .05, e1s02: 3.2, e1s03: 8.3, e1s04: 13.2, e1s05: 18.2, e1s06: 23.2, e1s07: 31.3, e1s08: 38.5, e1s09: 41.4, e1s10: 46.3, e1s11: 51.6 };
const VO_GAIN = { e1s01: 4.4, e1s02: 4.0, e1s03: 3.4, e1s04: 4.0, e1s05: 4.0, e1s06: 4.0, e1s07: 4.4, e1s08: 3.4, e1s09: 4.2, e1s10: 4.4, e1s11: 4.4 };
const VT = id => window.VO_WORDS && window.VO_WORDS[id] ? window.VO_WORDS[id].map(x => x + VO_AT[id]) : null;
const CAPS = buildCaptions([
  [0, 3, 'Меня ударило **молнией**. Зимой. В общаге', { times: VT('e1s01'), whole: true, size: 66, maxW: 860 }],
  [3.1, 8, 'Я второкурсник-энергетик. И я **заваливаю** ТОЭ', { times: VT('e1s02') }],
  [8.2, 12.9, 'Бека, зарядка есть? У меня **один процент**!', { times: VT('e1s03'), speaker: 'erzhan' }],
  [13.1, 18, 'Одна розетка на этаж. Сорок человек. **Классика**', { times: VT('e1s04') }],
  [18.1, 23, 'Я подрабатываю ремонтом. 200 тенге — и твой телефон **живой**', { times: VT('e1s05') }],
  [23.1, 27, 'Антенна снова отвалилась. Я полез **на крышу**', { times: VT('e1s06') }],
  [31.2, 35, 'Я должен был **умереть**', { times: VT('e1s07') }],
  [38.4, 41.2, 'Бека, что ты **сделал**?!', { times: VT('e1s08'), speaker: 'erzhan' }],
  [41.3, 46, 'А потом я увидел **свой заряд**', { times: VT('e1s09') }],
  [46.2, 50, 'Три **процента**', { times: VT('e1s10') }],
  [51.5, 55.5, 'Ноль. **Выключение**', { times: VT('e1s11') }],
], { tail: .3 });
CAPS[0].words.forEach(w => w.t = Math.min(w.t, 1.4)); CAPS[0].a = 0; // хук виден с первого кадра и дочитан к 1,4 с
window.CAPTION_PHRASES = CAPS;
const TALK = { erzhan: [[VO_AT.e1s03 + .05, VO_AT.e1s03 + 2.7]] }; // губы двигаются, пока звучит реплика

// ───── сцены: [начало, конец, id, рисование, hud] ─────
const HD = t => hudBase(t);
const SC = [
  [0, 1.6, 'e1s01a', t => push(t, 0, 1.6, () => hookRoof(t), MAST, 900, 1.05, 1.12), HD],
  [1.6, 3, 'e1s01b', t => push(t, 1.6, 3, () => hook(t), 660, 420, 1, 1.12), HD],
  [3, 5.6, 'e1s02a', t => push(t, 3, 5.6, () => deskScene(t), 500, 700, 1, 1.07), HD],
  [5.6, 8, 'e1s02b', t => push(t, 5.6, 8, () => gradeClose(t), 690, 640, 1, 1.12), HD],
  [8, 10.6, 'e1s03a', t => push(t, 8, 10.6, () => erzhanBed(t), 540, 700, 1, 1.07), HD],
  [10.6, 13, 'e1s03b', t => push(t, 10.6, 13, () => erzhanClose(t), 600, 760, 1, 1.08), HD],
  [13, 15.6, 'e1s04a', t => push(t, 13, 15.6, () => queueFar(t), 600, 820, 1, 1.12), HD],
  [15.6, 18, 'e1s04b', t => queueRow(t, lerp(0, 760, E.io(win(t, 15.6, 18)))), HD],
  [18, 20.6, 'e1s05a', t => push(t, 18, 20.6, () => repairClose(t), 520, 650, 1, 1.08), HD],
  [20.6, 23, 'e1s05b', t => push(t, 20.6, 23, () => repairHand(t), 520, 700, 1, 1.06), HD],
  [23, 25, 'e1s06a', t => push(t, 23, 25, () => hatch(t), 540, 1100, 1, 1.08), HD],
  [25, 27, 'e1s06b', t => push(t, 25, 27, () => roofWide(t), MAST, 900, 1, 1.08), HD],
  [27, STRIKE, 'e1s07a', t => push(t, 27, STRIKE, () => gripClose(t), 600, 760, 1, 1.1), HD],
  [STRIKE, 29.6, 'e1s07b', t => roofWide(t, { fly: 1, lit: lightK(t, STRIKE, 3) }), HD],
  [29.6, 31, 'e1s07c', t => push(t, 29.6, 31, () => lying(t), 300, 1500, 1, 1.15), HD],
  [31, 33, 'e1s08a', t => push(t, 31, 33, () => faceSnow(t), 500, 760, 1.05, 1.15), HD],
  [33, 35, 'e1s08b', t => push(t, 33, 35, () => armSnow(t), 500, 800, 1, 1.08), HD],
  [35, 41, 'e1s09', t => hallway(t), HD],
  [41, 43.6, 'e1s10a', t => push(t, 41, 43.6, () => stripClose(t), 540, 700, 1, 1.08), HD],
  [43.6, 46, 'e1s10b', t => push(t, 43.6, 46, () => stripFace(t), 420, 800, 1, 1.1), HD],
  [46, 49.6, 'e1s11', t => push(t, 46, 49.6, () => doorway(t), 540, 900, 1, 1.08), HD],
  [49.6, PD, 'e1s12', t => push(t, 49.6, PD, () => laptopHand(t), 520, 800, 1, 1.06), HD],
  [PD, 53, 'e1s13', t => { push(t, PD, 53, () => sleepFace(t), 520, 760, 1, 1.1); PowerDown(t, PD + .1, { eyesY: 800 }); }, HD],
  [53, 55.5, 'e1s13b', t => push(t, 53, 55.5, () => cliffRoom(t), 520, 1000, 1, 1.1), HD],
  [55.5, 58.01, 'e1s14', t => EndCard(t, 55.5, 'Я — **ПАУЭРБАНК**', 'ЧАСТЬ 2 →'), null],
];
function drawFrame(t) { NOW = t; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore();
  const k = 1 - win(t, a, a + .12); if (i > 0 && k > 0 && id !== 'e1s07b') { ctx.fillStyle = `rgba(0,0,0,${k * .7})`; ctx.fillRect(0, 0, W, H); }
  if (id === 'e1s07b') flash(t, STRIKE, '255,255,255', 1);
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(1, t); KineticCaption(t, CAPS); }

// ───── звук: CC0-библиотеки и свои синтезированные звуки силы ─────
const THEME = 'projects/kuat/assets/theme.wav', BED = 'projects/kuat/assets/bed-ep1.wav';
const ringIn = (t0, n, gap) => Array.from({ length: n }, (_, i) => t0 + i * gap);
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/kuat/assets/vo/ep1/${id}.wav`, gain: VO_GAIN[id] || 4 })),
  // хук: метель, два удара молнии
  { t: 0, type: 'wind', dur: 3, gain: .12, pitch: 1.3 }, { t: HOOK1, type: 'lib', id: 'cinematic-thunder-big', gain: .28 }, { t: HOOK1, type: 'zap', dur: .9, gain: .22 }, { t: HOOK2, type: 'lib', id: 'cinematic-thunder-massive', gain: .32 }, { t: HOOK2, type: 'zap', dur: .5, gain: .3 },
  // комната: часы, общажный гул
  ...ringIn(3.05, 5, 1).map(t => ({ t, type: 'tick', gain: .35, pitch: .8 })), { t: 3, type: 'hum', dur: 10, gain: .04, pitch: .9 }, { t: 6.0, type: 'lib', id: 'impact-deep-firm', gain: .35 },
  { t: 8.05, type: 'lowbat', gain: .2 }, { t: 11.2, type: 'lowbat', gain: .18 },
  // коридор: голоса очереди
  { t: 13, type: 'murmur', dur: 5, gain: .09 }, { t: 13, type: 'murmur', dur: 5, gain: .06, pitch: 1.3 }, { t: 13, type: 'file', path: THEME, gain: .13, dur: 10 },
  // ремонт
  ...ringIn(18.3, 6, .38).map(t => ({ t, type: 'click', gain: .2, pitch: 1.6 })), { t: 21.8, type: 'lib', id: 'bass-rumble-medium', gain: .3 }, { t: 22.05, type: 'lib', id: 'money-coin-drop', gain: .4 },
  // крыша
  { t: 23, type: 'lib', id: 'bsb-wind-strong-outside', gain: .22, align: 'start', dur: 5.3 }, { t: 23.1, type: 'lib', id: 'bsb-metal-gate-creak', gain: .25, align: 'start', dur: 1.2 }, { t: 25.5, type: 'lib', id: 'bsb-metal-gate-creak', gain: .2, align: 'start', dur: .9, rate: 1.3 },
  { t: 27.2, type: 'zap', dur: 1.0, gain: .14 }, { t: 27.6, type: 'lib', id: 'bass-rumble-medium', gain: .3 },
  // удар
  { t: STRIKE, type: 'lib', id: 'cinematic-thunder-massive', gain: .7 }, { t: STRIKE, type: 'zap', dur: .9, gain: .6 }, { t: STRIKE, type: 'lib', id: 'impact-deep-hard', gain: .7 }, { t: STRIKE + 1.05, type: 'lib', id: 'impact-heavy-firm', gain: .4 }, { t: STRIKE + 1.1, type: 'snowstep', gain: .6 },
  { t: STRIKE + 1.2, type: 'tone', freq: 4200, dur: 1.6, gain: .05 }, { t: 29.6, type: 'wind', dur: 5.4, gain: .025, pitch: .8 }, // звенящая тишина
  ...[31.15, 31.9, 32.6, 33.3, 34.0, 34.7].map(t => ({ t, type: 'heartbeat', gain: .2 })), { t: 33.2, type: 'hum50', dur: 1.8, gain: .08 }, { t: 33.2, type: 'charge', gain: .22, pitch: .8 },
  // коридор: зарядка цепочкой
  { t: 35, type: 'murmur', dur: 6, gain: .03 }, ...ringIn(35.1, 16, .37).map((t, i) => ({ t, type: 'step', gain: .14, pitch: i % 2 ? .9 : 1.05 })),
  ...HALL.flatMap(t => [{ t, type: 'charge', gain: .24 }, { t, type: 'hum50', dur: .6, gain: .07 }]),
  // удлинитель: гул всё время, каждый телефон — звук зарядки и шаг шкалы, писк быстрее
  { t: STRIP_AT, type: 'zap', dur: .35, gain: .25 }, { t: STRIP_AT, type: 'hum50', dur: STRIP[9] - STRIP_AT + .4, gain: .06, attack: .05 },
  ...STRIP.flatMap((t, i) => [{ t, type: 'charge', gain: .13, pitch: 1 + i * .04 }, { t: t + .05, type: 'beep', gain: .06, pitch: 1 + i * .06 }]), { t: STRIP[6] + .1, type: 'lowbat', gain: .22 },
  { t: STRIP_AT, type: 'file', path: BED, gain: .05, dur: 8.6 },
  // дверь, «три процента»
  { t: 47.5, type: 'lowbat', gain: .55 }, { t: 48.4, type: 'step', gain: .35 }, { t: 49.0, type: 'step', gain: .35 },
  // 50,0–51,0 — тишина перед финальной фразой
  { t: LAPTOP, type: 'charge', gain: .35, pitch: .7 }, { t: LAPTOP, type: 'hum50', dur: .3, gain: .14 }, { t: PD + .1, type: 'powerdown', dur: 1.2, gain: .15 },
  { t: 53.05, type: 'charge', gain: .1, pitch: 1.2 }, { t: 53, type: 'murmur', dur: 2.5, gain: .015 },
  { t: 55.5, type: 'file', path: THEME, gain: .38, dur: 2.5 }, { t: 55.5, type: 'zap', dur: .25, gain: .2 },
];
// ───── раскадровка storyboard/ep1.json ─────
window.STORYBOARD = { episode: EP, title: 'Молния', duration: DUR, hud: { place: 'АСТАНА', temp: '−31°', battery: { start: null, show: 23, end: 0 } },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null, he = hud ? hud(Math.min(b, DUR) - .02) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), vo: c.length ? { speaker: c[0].speaker || 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && s.type !== 'file').map(s => ({ id: s.id || s.type, at: +s.t.toFixed(2) })), hud: h ? { time: h.time, battery: h.battery == null ? null : Math.round(h.battery), batteryEnd: he.battery == null ? null : Math.round(he.battery) } : null,
      overlays: a === 0 ? ['PartSticker:1'] : id === 'e1s14' ? ['EndCard'] : id === 'e1s13' ? ['PowerDown'] : /e1s(08b|09|10a|10b|12)/.test(id) ? ['ChargeFlow'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
