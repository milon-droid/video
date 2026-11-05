// «ҚУАТ» · серия 2 «200 тенге» (0:58). Таймкоды и тексты — по ТЗ, раздел 7; заряд и время — из одной функции (раздел 8).
// Учтены минусы с.1: в кадре сразу герой и действие, руки — кистями, моргание и губы по голосу, нет «мёртвых» чёрных секунд.
'use strict';
const DUR = 58, EP = 2;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));

// ───── сюжетное время (день 2) и заряд ─────
// с.1 кончилась на 0% в 00:15; сон +10%/ч → 9 ч 48 мин → 98% в 10:03 («проспал десять часов»)
STORY_CLOCK[2] = [[0, '12:41'], [3, '10:03'], [8, '10:31', 'ff'], [13, '12:30'], [18, '12:40', 'ff'], [22.39, '13:20'], [22.4, '14:06'], [27, '21:10'], [32, '21:14'], [37, '21:20'], [42, '21:30'], [47, '21:31', 'ff'], [52, '21:34'], [53, '21:35']];
const HOOK_T = [.9, .95, 1.0];                                  // хук = 12:41, три телефона разом (тот же момент, что начало монтажа)
const QUEUE_T = [13.7, 14.15, 14.6, 15.05, 15.5];               // 98 → 88
const MONTAGE = [[18.15, 'phone'], [18.18, 'phone'], [18.21, 'phone'], ...[18.5, 18.75, 19.0, 19.25, 19.5, 19.8, 20.1, 20.4].map(t => [t, 'phone']), [20.8, 'laptop'],
  ...[21.05, 21.25, 21.45, 21.65].map(t => [t, 'phone']), [21.85, 'laptop'], ...[22.0, 22.08, 22.16, 22.24, 22.32].map(t => [t, 'phone'])]; // 88 → 82 → 72 → 66 → 60 → 52 → 46 → 36
const VAHTA_T = [28.4, 29.2];                                   // два телефона в ладонях у турникета: 22 → 18
const LAPTOP_TRY = 38.0, APAI_GRAB = 38.45;                     // ток пошёл в ноутбук — апай кладёт ладонь на запястье, ток замер
const BLACKOUT = 51.7;
BATTERY[2] = { start: 88, showAt: 0, events: [...HOOK_T.map(t => [t, 'phone', .08]), [3, { set: 98 }], ...QUEUE_T.map(t => [t, 'phone']), ...MONTAGE.map(([t, k]) => [t, k, .06]),
  [22.4, { set: 18 }],  // 13:20 → 14:06: ещё 9 телефонов за полчаса до пары (36 → 18), вне кадра
  [27, { set: 22 }],    // 14:10–15:22 спал на паре (+12%) → 30; вечером 4 телефона (−8) → 22
  ...VAHTA_T.map(t => [t, 'phone'])] };
const hudBase = t => ({ time: storyClock(EP, t), temp: '−29°', battery: batteryShown(EP, t), rate: batteryRate(EP, t), stamp: t >= 3 && t < 5.4 ? 'УТРОМ' : null });
const lightK = (t, at, dec = 6) => t < at ? 0 : Math.exp(-(t - at) * dec);
const STUDS = (() => { const hairs = ['short', 'long', 'bun', 'buzz', 'beanie', 'short', 'long', 'bun'], tops = ['#5b7fb0', '#b0475f', '#3d8a6a', '#7a5cb0', '#c48a3a', '#4a5a7a', '#a34a8a', '#2f7f8f'];
  return Array.from({ length: 16 }, (_, i) => ({ hair: hairs[i % 8], top: tops[(i * 3) % 8], skin: ['#e3a67f', '#d9a07a', '#c98b64', '#e7b493'][i % 4], lvl: [3, 1, 5, 2, 8, 1, 4, 2, 6, 1, 3, 2, 7, 1, 2, 4][i] })); })();
const sFace = (q, o = {}) => ({ hair: q.hair, skin: q.skin, seed: q.top.length + q.lvl, ...o });

// ───── 0:00–0:03 хук: три телефона в ладонях заряжаются на глазах ─────
function hookPhones(t) { roomWall(t, { winX: 700, winY: 240, winW: 300, winH: 380 }); dim(.1); glow(540, 900, 600, 'rgba(61,255,143,.12)');
  const wow = t > HOOK_T[2], pts = beka(520, 1640, 2.25, t, { hideLegs: true, lean: wow ? -.03 * AK.overshoot(win(t, HOOK_T[2], HOOK_T[2] + .4)) : 0, armL: [-.9, 2.75], armR: [.9, -2.75], face: { streak: 1, mouth: wow ? 'grin' : 'smirk', look: 0, lookY: wow ? 0 : 1, brow: 'up' } });
  const ph = [[pts.handL[0] + 10, pts.handL[1] - 90, -.18], [pts.handR[0] - 30, pts.handR[1] - 100, .1], [pts.handR[0] + 70, pts.handR[1] - 80, .3]];
  ph.forEach(([x, y, r2], i) => { phone(x, y, 1.7, [3, 1, 5][i], { rot: r2, full: t >= HOOK_T[i] ? 1 : 0 }); });
  ph.forEach(([x, y], i) => ChargeFlow(t, { t0: HOOK_T[i] - .55, dur: .55, path: [[x, y + 40], i ? pts.handR : pts.handL, i ? pts.elbowR : pts.elbowL, pts.heart], dir: 'give', popup: t >= HOOK_T[i] ? { x: x + [-30, 0, 40][i], y: y - [150, 250, 150][i], text: '100%', size: 46 } : null, size: 1.2 })); }
// ───── 0:03–0:08 утро: проснулся на 98% ─────
function wakeBed(t) { roomWall(t, { winX: 620, winY: 260, winW: 360, winH: 420, light: 1 }); dayWindow(620, 260, 360, 420, t); ctx.strokeStyle = '#e9e4d8'; ctx.lineWidth = 12; ctx.strokeRect(620, 260, 360, 420);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,230,170,.18)'; ctx.beginPath(); ctx.moveTo(620, 680); ctx.lineTo(980, 680); ctx.lineTo(700, 1600); ctx.lineTo(80, 1600); ctx.closePath(); ctx.fill(); ctx.restore(); // утренний луч
  bed(-40, 1180, 1160, { blanket: '#3d6b8a', back: 0 }); rr(40, 860, 360, 170, 70); fillOL('#eae6dc', 6); ctx.fillStyle = '#5a3d2c'; ctx.fillRect(-100, 1320, W + 200, H);
  const open = E.out(win(t, 3.9, 4.3)), turn = AK.overshoot(win(t, 4.2, 4.6)); bekaHead(240 + turn * 20, 850 - turn * 30, 190, { rot: lerp(-.25, -.08, turn), lid: 1 - open, look: lerp(.2, 1, turn), streak: 1, mouth: open > .5 ? 'o' : 'flat', noBlink: open < 1 });
  ctx.fillStyle = '#3d6b8a'; rr(330, 900, 760, 260, 90); fillOL('#3d6b8a', 6); // одеяло
  rr(860, 1060, 160, 260, 10); fillOL('#8a5a3a', 5); const ring = t < 4.4; phone(940, 1000, 1.1, 64, { rot: ring ? Math.sin(t * 60) * .08 : 0 }); // будильник на табурете
  if (ring) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(940, 1000, 90 + i * 30 + ((t * 120) % 30), -.9, -.2); ctx.stroke(); } } }
function wakeSit(t) { roomWall(t, { winX: 620, winY: 260, winW: 360, winH: 420 }); dayWindow(620, 260, 360, 420, t); ctx.strokeStyle = '#e9e4d8'; ctx.lineWidth = 12; ctx.strokeRect(620, 260, 360, 420);
  const st = clamp(AK.anticip(win(t, 5.45, 6.4), .25), -.3, 1.1), yawn = t > 5.6 && t < 6.9;
  beka(480, 1720, 2.2, t, { hideLegs: true, armL: [lerp(-.3, -2.8, st), lerp(.3, -.2, st)], armR: [lerp(.3, 2.8, st), lerp(-.3, .2, st)], face: { streak: 1, mouth: yawn ? 'o' : 'smile', lid: yawn ? .6 : 0, brow: yawn ? null : 'up' } });
  bed(-60, 1720, 1200, { blanket: '#3d6b8a', back: 0 }); ctx.fillStyle = '#3d6b8a'; rr(40, 1420, 1000, 300, 80); fillOL('#3d6b8a', 6);
  const k = E.back(win(t, 6.1, 6.5)); if (k > 0) { ctx.save(); ctx.translate(780, 360 + 0); ctx.scale(k, k); ctx.fillStyle = 'rgba(10,15,30,.92)'; rr(-200, -40, 400, 80, 16); ctx.fill(); ctx.strokeStyle = T.charge; ctx.lineWidth = 3; ctx.stroke(); txt('СОН  +10% / ЧАС', 0, 2, 34, T.charge, { align: 'center', font: 'Mont' }); ctx.restore(); } } // правило 6
// ───── 0:08–0:13 чат общаги и общага смотрит на дверь 412 ─────
const CHAT = [{ at: 8.2, name: 'Айжан 407', text: 'в 412 живёт ПАУЭРБАНК. серьёзно', col: T.pink }, { at: 9.0, name: 'Тимур', text: 'за 200 тг до 100%??', col: T.low },
  { at: 9.8, name: 'Ержан 412', text: 'очередь с 12:30! наличка / перевод', col: T.cyan, me: true }, { at: 10.5, name: 'Мадина', text: 'я первая!!!', col: '#b98cff' }, { at: 10.9, name: 'Асет 409', text: 'у меня ноут, можно?', col: T.warm }];
function chatScene(t) { roomWall(t, { winX: -200, light: .6 }); dim(.25); const L = armTo(300, 2100, 430, 1180, { pose: 'grip', w: 150, col: '#ff8a2a', skin: '#c98b64', bend: -.1 }); // телефон в руке Ержана
  GroupChat(t, CHAT, { y: 350, h: 760 }); const n = CHAT.filter(m => t >= m.at).length; ctx.fillStyle = T.empty; circle(860, 370, 34); ctx.fill(); txt(String(38 + n * 9), 860, 372, 28, '#fff', { align: 'center' }); }
function hallLook(t) { corridorSide(t, 620 * 6 - 300); const turn = E.io(win(t, 11.6, 12.2)); // дверь 412 в центре
  [[120, 0], [330, 1], [760, 2], [960, 3]].forEach(([x, i]) => { const q = STUDS[i]; student(x, 1640, 1.55, t, { topCol: q.top, skin: q.skin, armR: [2.3, .5], face: sFace(q, { look: lerp(0, x < 540 ? 1 : -1, turn), lookY: lerp(1, 0, turn), mouth: turn > .5 ? 'o' : 'flat', brow: turn > .5 ? 'up' : null }), holdR: (hx, hy) => { phone(hx - 4, hy - 34, 1, q.lvl); glow(hx, hy - 34, 80, 'rgba(79,216,255,.35)'); } }); });
  if (turn > .3) { ctx.save(); ctx.globalAlpha = turn; ctx.fillStyle = 'rgba(10,15,30,.9)'; rr(400, 430, 280, 80, 16); ctx.fill(); ctx.strokeStyle = T.charge; ctx.lineWidth = 4; ctx.stroke(); txt('ПАУЭРБАНК', 540, 472, 40, T.charge, { align: 'center' }); ctx.restore(); } }
// ───── 0:13–0:18 очередь у 412, Ержан принимает деньги ─────
const Q_X = [-80, 60, 200, 340, 480];
function queueDoor(t) { const sc = 620 * 6 - 80; corridorSide(t, sc);
  ctx.save(); rr(530, 560, 260, 990, 6); ctx.clip(); ctx.fillStyle = '#e6c695'; ctx.fillRect(530, 560, 260, 990); ctx.restore(); // открытая дверь 412, свет комнаты
  // клиенты подходят по одному: телефон к ладони Беки
  const sh = QUEUE_T.reduce((acc, tc) => acc + E.io(win(t, tc + .15, tc + .45)), 0); // очередь сдвигается после каждого касания
  for (let i = 5; i >= 0; i--) { const q = STUDS[i + 2], slot = i - sh, x = 440 - 150 * slot, moving = sh % 1 > .02 && sh % 1 < .98, a = clamp(1 + slot * 2.5); if (a <= 0 || x < -200) continue; const front = Math.abs(slot) < .5;
    ctx.save(); ctx.globalAlpha = a; student(x, 1540, 1.4, t, { walk: moving ? sh * Math.PI * 2 : null, topCol: q.top, skin: q.skin, armR: front ? [2.0, -.1] : [.3, .4], face: sFace(q, { look: front ? 1 : .5, mouth: slot < 0 ? 'smile' : 'flat' }), holdR: (hx, hy) => phone(hx + 6, hy - 20, .95, q.lvl, { full: i < QUEUE_T.length && t >= QUEUE_T[i] ? 1 : 0 }) }); ctx.restore(); }
  const pts = beka(680, 1560, 1.45, t, { straps: false, armL: [-1.95, .1], armR: [.2, .2], face: { streak: 1, mouth: 'smirk', look: -1 } });
  QUEUE_T.forEach((tc, i) => { const [hx, hy] = handOf(440, 1540, 1.4, 1, [2.0, -.1]); ChargeFlow(t, { t0: tc - .3, dur: .3, path: [[hx + 6, hy - 20], pts.handL, pts.elbowL, pts.shoulderL, pts.heart], dir: 'give', popup: t >= tc ? { x: hx, y: hy - 140, text: '100%', size: 44 } : null }); });
  erzhan(950, 1560, 1.4, t, { armL: [-.9, 2.2], armR: [.5, -1.6], face: { mouth: talking(t, TALK.erzhan) ? 'open' : 'grin', look: -.6 },
    holdL: (x, y) => notebook(x + 10, y - 40, .55, '412 · ₸', -.2, '#a34a8a'), holdR: (x, y) => { for (let i = 0; i < Math.min(5, 1 + Math.floor((t - 13) * 1.5)); i++) { circle(x, y - 10 - i * 14, 20); fillOL('#d9c27a', 3); } } }); }
function erzhanMoney(t) { roomWall(t, { winX: -200, light: .8 }); dim(.1); const flip = (t * 3) % 1;
  erzhan(520, 1900, 2.3, t, { sit: true, armL: [-.6, 2.2], armR: [.7, -2.0], face: { mouth: talking(t, TALK.erzhan) ? 'open' : 'grin', look: 0, brow: 'up' },
    holdR: (x, y) => { for (let i = 0; i < 4; i++) { circle(x + 10, y - 20 - i * 16, 30); fillOL('#d9c27a', 4); } },
    holdL: (x, y) => { for (let i = 0; i < 5; i++) { circle(x - 10, y - 20 - i * 16, 30); fillOL('#d9c27a', 4); } } });
  if (t > 16.2) { const k = win(t, 16.2, 16.9); circle(lerp(200, 300, k), lerp(900, 1230, E.in2(k)) - Math.sin(k * Math.PI) * 200, 26); fillOL('#d9c27a', 4); }
  [[15.9, '+200 ₸ · перевод'], [16.6, '+200 ₸ · перевод'], [17.3, '+200 ₸ · перевод']].forEach(([at, s2], i) => { const k = E.out(win(t, at, at + .25)); if (k <= 0) return; const y = 420 + i * 100; ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 300, 0); ctx.fillStyle = 'rgba(14,42,34,.95)'; rr(150, y, 720, 80, 20); ctx.fill(); ctx.strokeStyle = T.charge; ctx.lineWidth = 3; ctx.stroke(); txt(s2, 190, y + 42, 40, T.charge); ctx.restore(); }); } // уведомления о переводах
// ───── 0:18–0:22,4 монтаж касаний под бит: 88 → 60 → 36 ─────
const BG_BEAT = ['#2a3458', '#5b2a4a', '#1f4a3e', '#4a3a1e', '#2a2a5a', '#5a2a2a'];
function montage(t) { let i = MONTAGE.findIndex(([tc]) => tc > t); if (i < 0) i = MONTAGE.length; const ev = Math.max(0, i - 1), [tc, kind] = MONTAGE[ev];
  ctx.fillStyle = BG_BEAT[ev % BG_BEAT.length]; ctx.fillRect(-300, -300, W + 600, H + 600); const pulse = lightK(t, tc, 8); glow(540, 820, 700, `rgba(61,255,143,${.25 * pulse})`);
  ctx.save(); ctx.translate(540, 820); ctx.rotate((ev % 2 ? 1 : -1) * .05); ctx.scale(1 + .04 * pulse, 1 + .04 * pulse); ctx.translate(-540, -820);
  const laptop = kind === 'laptop', near = win(t, tc - .12, tc), dev = MONTAGE[Math.min(MONTAGE.length - 1, i)] || MONTAGE[ev], incoming = t < tc;
  const rc = AK.impact(t, tc, { amp: 0, squash: .1, dur: .16 }), ry = (1 - rc.sy) * 260; armTo(260, 1900, 400, 1000 + ry, { pose: 'flat', w: 150, bend: .1 }); armTo(820, 1900, 680, 1000 + ry, { pose: 'flat', w: 150, bend: -.1 }); // ладони Беки снизу, отдача на касании
  const side = ev % 2 ? 1 : -1, cx = 540, cy = 760, sleeve = STUDS[ev % 16].top;
  if (laptop) { rr(cx - 300, cy - 260, 600, 360, 20); fillOL('#2a2f3e', 7); ctx.fillStyle = t >= tc ? '#0e2a22' : '#05060b'; rr(cx - 270, cy - 230, 540, 300, 8); ctx.fill(); txt(t >= tc ? '100%' : '6%', cx, cy - 80, 90, t >= tc ? T.charge : T.empty, { align: 'center', font: 'JBM', weight: 800 }); rr(cx - 330, cy + 100, 660, 60, 14); fillOL('#3a4052', 6); }
  else { armTo(cx + side * 700, 300, cx + side * 60, cy - 120, { pose: 'grip', w: 110, col: sleeve, skin: STUDS[ev % 16].skin, bend: side * .1 }); phone(cx, cy, 2.4, STUDS[ev % 16].lvl, { full: t >= tc ? 1 : 0 }); }
  ctx.restore();
  ChargeFlow(t, { t0: tc, dur: .14, path: [[cx, cy + 60], [540, 1100], [540, 1500], [540, 1950]], dir: 'give', size: 1.3, popup: { x: cx + (laptop ? 0 : side * -190), y: cy - (laptop ? 320 : 120), text: laptop ? 'НОУТБУК −6%' : 'ТЕЛЕФОН −2%', size: 44 }, popLife: .5 });
  const big = laptop ? 1 : 0; if (big) txt('−6%', 540, 1060, 120, T.low, { align: 'center', stroke: 14, alpha: win(t, tc, tc + .1) }); }
// ───── 0:22,4–0:27 лекция: засыпает лицом в ТОЭ ─────
function lecture(t) { auditorium(t); const nod = Math.max(0, Math.sin(t * 2.2)) * win(t, 22.6, 24.6);
  student(860, 1000, 1.6, t, { topCol: '#6b5a4a', legsCol: '#3a3342', armR: [lerp(2.6, 2.9, (Math.sin(t * 2) + 1) / 2), .2], face: { hair: 'buzz', hairCol: '#9aa0a8', glasses: 1, beard: 1, mouth: Math.sin(t * 9) > 0 ? 'open' : 'flat', look: -1 } }); // преподаватель у доски
  ctx.fillStyle = '#7d5236'; rr(-100, 1260, W + 200, 90, 10); ctx.fill(); ctx.fillStyle = '#5e3d27'; ctx.fillRect(-100, 1350, W + 200, H);
  beka(420, 1700, 1.9, t, { hideLegs: true, armL: [-.4, 1.9], armR: [.4, -1.9], face: { streak: 1, lid: lerp(.4, .9, nod), mouth: 'flat', lookY: 1, rot: nod * .2 } });
  ctx.fillStyle = '#7d5236'; ctx.fillRect(-100, 1180, W + 200, 100); ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-100, 1180); ctx.lineTo(W + 100, 1180); ctx.stroke(); notebook(420, 1220, .8, 'ТОЭ', .03);
  for (const [x, q] of [[110, STUDS[9]], [980, STUDS[12]]]) studentHead(x, 1050, 90, sFace(q, { lookY: 1 })); }
function faceDesk(t) { ctx.fillStyle = '#7d5236'; ctx.fillRect(-300, -300, W + 600, H + 600); glow(540, 700, 800, 'rgba(255,250,230,.2)');
  ctx.save(); ctx.translate(520, 900); ctx.rotate(-.05); rr(-420, -300, 840, 560, 10); fillOL('#f4f1ea', 6); ctx.strokeStyle = 'rgba(40,60,120,.3)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-400, -240 + i * 56); ctx.lineTo(400, -240 + i * 56); ctx.stroke(); }
  txt('Z = R + jX', -330, -200, 50, '#2a4a8a', { font: 'JBM', weight: 700 }); txt('I = U/Z ...', -330, -130, 50, '#2a4a8a', { font: 'JBM', weight: 700 }); ctx.restore();
  const drop = AK.drop(win(t, 24.8, 25.45), 1), y = lerp(560, 780, drop); bekaHead(560, y, 280, { rot: lerp(-.1, -.5, drop), lid: drop > .9 ? 1 : lerp(.85, 1, drop), streak: 1, mouth: drop > .9 ? 'o' : 'flat', noBlink: 1 });
  if (t > 25.4) for (let i = 0; i < 3; i++) { const ph = ((t - 25.4) * .6 + i / 3) % 1; txt('Z', 820 + ph * 120, 560 - ph * 260, 60 + ph * 40, T.cyan, { stroke: 8, alpha: 1 - ph }); } }
// ───── 0:27–0:32 вахта: апай светит фонариком ─────
function vahtaPass(t) { vahtaBg(t, { light: .55 }); turnstile(560, 1640, 1.5, t * .4); const beam = E.out(win(t, 27.2, 27.6)), onHands = win(t, 28.6, 29.0);
  const pts = beka(560, 1720, 2.0, t, { armL: [-.8, 2.45], armR: [.8, -2.45], straps: true, face: { streak: 1, lid: lerp(.0, .7, beam * (1 - onHands)), mouth: beam > .5 ? 'grit' : 'smirk', look: onHands ? 0 : -.5, lookY: onHands, brow: 'sad' } });
  const ph = [[pts.handL[0], pts.handL[1] - 70], [pts.handR[0], pts.handR[1] - 70]]; ph.forEach(([x, y], i) => phone(x, y, 1.3, [4, 2][i], { full: t >= VAHTA_T[i] ? 1 : 0 }));
  ph.forEach(([x, y], i) => ChargeFlow(t, { t0: VAHTA_T[i] - .8, dur: .8, path: [[x, y + 40], i ? pts.handR : pts.handL, i ? pts.elbowR : pts.elbowL, pts.heart], dir: 'give', popup: t >= VAHTA_T[i] ? { x, y: y - 130, text: '100%', size: 44 } : null }));
  const tx = lerp(pts.head[0], (ph[0][0] + ph[1][0]) / 2, onHands), ty = lerp(pts.head[1], ph[0][1], onHands); flashlight(-60, 760, 1.6, Math.atan2(ty - 760, tx + 60), beam, { len: 1200, spread: .16 }); }
function apaiBooth(t, { glassesOff = 0, photo = 0 } = {}) { vahtaBg(t, { light: .7, clock: [900, 260, 21, 12] }); keyBoard(60, 420);
  booth(160, 560, 760, 700, () => { photoTEC(700, 760, .8, t, { hi: photo }); apai(470, 1500, 1.7, t, { armR: glassesOff ? [lerp(.4, 2.7, glassesOff), lerp(0, .5, glassesOff)] : [1.6, .3], armL: [-.3, .3], face: { mouth: talking(t, TALK.apai) ? 'open' : 'flat', look: .6, brow: 'up', glasses: glassesOff < .55 },
    holdR: glassesOff ? (glassesOff >= .55 ? (x, y) => glassesInHand(x, y, .9) : null) : (x, y) => flashlight(x, y, 1.1, -.1, 1, { len: 700, spread: .14 }) }); thermos(880, 1240); });
  rr(240, 1340, 380, 140, 10); fillOL('#f4f1ea', 4); txt('ЖУРНАЛ', 430, 1410, 34, T.ink, { align: 'center' }); }
function photoClose(t) { vahtaBg(t, { light: .8 }); ctx.save(); rr(0, 0, W, H, 0); ctx.fillStyle = '#e8c890'; ctx.fillRect(-300, -300, W + 600, H + 600); glow(540, 700, 700, 'rgba(255,220,150,.5)'); ctx.restore();
  photoTEC(540, 780, 2.1, t, { hi: win(t, 35.6, 36.2) }); }
// ───── 0:37–0:42 ладонь апай на запястье: ток замер ─────
function wristStop(t) { vahtaBg(t, { light: .65 }); dim(.15); const reach = E.out(win(t, 37.1, LAPTOP_TRY)), grab = E.out(win(t, APAI_GRAB - .25, APAI_GRAB));
  ctx.save(); ctx.translate(820, 980); ctx.rotate(-.15); rr(-260, -200, 420, 280, 20); fillOL('#2a2f3e', 7); ctx.fillStyle = '#05060b'; rr(-235, -175, 370, 230, 8); ctx.fill(); txt('4%', -50, -60, 80, T.empty, { align: 'center', font: 'JBM', weight: 800 }); rr(-280, 80, 460, 50, 12); fillOL('#3a4052', 6); ctx.restore(); // ноутбук студента
  armTo(1250, 1500, 900, 1110, { pose: 'grip', w: 120, col: STUDS[5].top, skin: STUDS[5].skin, bend: .1 });
  const hx = lerp(260, 600, reach), hy = lerp(1060, 990, reach); armTo(-200, 1200, hx, hy, { pose: 'flat', w: 140, bend: -.08 });
  const path = [[hx + 30, hy - 30], [hx - 200, hy + 40], [-40, 1150]]; ChargeFlow(t, { t0: LAPTOP_TRY, dur: 4, path, dir: 'give', size: 1.3, freezeAt: APAI_GRAB });
  if (grab > 0) { const ax = lerp(560, 330, grab), ay = lerp(300, 940, grab); armTo(380, -200, ax, ay, { pose: 'grip', w: 130, col: '#5b4a6e', skin: '#d7a07a', bend: .12 }); ctx.strokeStyle = '#d4b04a'; ctx.lineWidth = 6; circle(ax - 20, ay - 60, 14); ctx.stroke(); } }
function bekaLooks(t) { vahtaBg(t, { light: .6 }); dim(.1); const pull = E.io(win(t, 39.8, 40.6));
  booth(560, 420, 520, 700, () => { apai(800, 1380, 1.45, t, { armL: [-1.4, .4], face: { mouth: talking(t, TALK.apai) ? 'open' : 'flat', look: -1, lookY: .3, brow: 'angry' } }); });
  beka(330, 1840, 2.15, t, { armR: [lerp(1.6, .5, pull), lerp(.2, 1.4, pull)], armL: [-.2, .2], straps: true, face: { streak: 1, look: lerp(.3, 1, pull), lookY: lerp(1, 0, pull), mouth: 'flat', brow: 'sad' } }); }
// ───── 0:42–0:47 у окна вахты, город за стеклом, 18% ─────
function windowNight(t) { ctx.fillStyle = '#0a1226'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.save(); rr(80, 260, 920, 1100, 10); ctx.clip(); nightSky(t); cityFar(t, 1250, { k: t > 46.3 ? .6 : 1 }); snow(t, .6, 120, .8);
  if (t > 46.3) { ctx.fillStyle = 'rgba(5,8,18,.7)'; ctx.fillRect(80, 900, 300, 460); } ctx.restore(); // далёкий район уже погас
  ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 30; ctx.strokeRect(80, 260, 920, 1100); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(540, 260); ctx.lineTo(540, 1360); ctx.stroke();
  glow(540, 1600, 700, 'rgba(255,200,130,.25)'); beka(540, 1960, 2.5, t, { armL: [-.3, .4], armR: [.3, -.4], straps: true, face: { streak: 1, mouth: 'flat', brow: 'sad', look: .4, lookY: -.3 } }); }
// ───── 0:47–0:52 город гаснет кварталами, волна идёт к общаге ─────
const DORM = { i: 5, j: 10, label: 'ОБЩАГА' }, WAVE0 = [0, 0];
function cityDark(t) { const R = lerp(0, 12.9, win(t, 47.2, BLACKOUT)); /* общага гаснет одной из последних */ CityGrid(t, { mark: DORM, dark: (i, j) => clamp((R - Math.hypot(i - WAVE0[0], j - WAVE0[1])) * 2.5) }); }
// ───── 0:53–0:55,5 тёмный коридор: фонарик апай и зелёные руки Беки ─────
function darkHall(t) { ctx.fillStyle = '#04060c'; ctx.fillRect(-300, -300, W + 600, H + 600); const take = E.out(win(t, 53.3, 53.8)), boost = win(t, 54.0, 55.0), fl = t < 54 ? (Math.floor(t * 9) % 3 ? .35 : .1) : lerp(.4, 1, boost);
  ctx.save(); ctx.globalAlpha = .5; corridorSide(t, 620 * 6 - 300, { light: .2 }); ctx.restore(); dim(.6);
  const ap = apai(800, 1680, 1.75, t, { armL: [-2.0, -.5], armR: [.3, .3], face: { look: -1, brow: 'up', mouth: 'flat' } });
  const bk = beka(290, 1700, 1.75, t, { straps: true, armR: [lerp(.4, 2.05, take), lerp(.2, .45, take)], armL: [-.3, .3], face: { streak: 1, look: 1, lookY: -.3, mouth: 'flat', brow: 'up' } });
  const fx = ap.handL[0] - 20, fy = ap.handL[1] - 10; flashlight(fx, fy, 1.5, -1.9, fl, { len: 1300, spread: .25 }); glow(540, 900, 600, `rgba(255,245,210,${.12 * fl})`);
  if (take > .9) ChargeFlow(t, { t0: 53.8, dur: 3, path: [[fx, fy], bk.handR, bk.elbowR, bk.shoulderR, bk.heart], dir: 'give', size: 1.2, dots: 16 }); }
// ───── голос (черновой синтез) и субтитры ─────
const VO_AT = { e2s01: .05, e2s02: 3.3, e2s03: 8.15, e2s04: 13.3, e2s05: 18.1, e2s06: 22.5, e2s07: 29.5, e2s08: 32.3, e2s09: 38.75, e2s10: 42.3, e2s11: 53.1 };
const VO_GAIN = { e2s01: 4.4, e2s02: 4.2, e2s03: 4.2, e2s04: 3.4, e2s05: 4.3, e2s06: 4.3, e2s07: 3.2, e2s08: 4.2, e2s09: 3.2, e2s10: 4.2, e2s11: 4.4 };
const VT = id => window.VO_WORDS && window.VO_WORDS[id] ? window.VO_WORDS[id].map(x => x + VO_AT[id]) : null;
const VEND = id => VO_AT[id] + (window.VO_WORDS && window.VO_WORDS[id] ? window.VO_WORDS[id].slice(-1)[0] + .5 : 2);
const TALK = { erzhan: ['e2s04'], apai: ['e2s07', 'e2s09'] }; // рот по огибающей голоса
const talking = (t, ids) => !!window.VO_MOUTH && ids.some(id => AK.mouth(t, window.VO_MOUTH[id], VO_AT[id]) > .3);
const CAPS = buildCaptions([
  [0, 3, '200 тенге — за то, что я **подержу** ваш телефон', { times: VT('e2s01'), whole: true, size: 62, maxW: 880 }],
  [3.2, 8, 'Проспал десять часов. Зарядился до **девяноста восьми**', { times: VT('e2s02') }],
  [8.1, 13, 'К обеду вся общага знала **номер комнаты**', { times: VT('e2s03') }],
  [13.2, 17.8, 'Наличными или переводом, **бизнес**!', { times: VT('e2s04'), speaker: 'erzhan' }],
  [18.0, 22.4, 'Минус два процента за телефон. Минус шесть за **ноутбук**', { times: VT('e2s05') }],
  [22.45, 27, 'Ниже двадцати я засыпаю **где угодно**', { times: VT('e2s06') }],
  [29.4, 32.2, 'Энергия **ниоткуда** не берётся, сынок', { times: VT('e2s07'), speaker: 'apai' }],
  [32.25, 37, 'Наша вахтёрша тридцать лет была электриком **на ТЭЦ**', { times: VT('e2s08') }],
  [38.7, 42.2, 'Кто отдаёт — тот **слабеет**', { times: VT('e2s09'), speaker: 'apai' }],
  [42.25, 47, 'Я хотел просто заработать. На **маму** и на пересдачу', { times: VT('e2s10') }],
  [53.05, 55.5, 'Город **погас**. А я — единственная розетка', { times: VT('e2s11') }],
], { tail: .3 });
CAPS[0].words.forEach(w => w.t = Math.min(w.t, 1.4)); CAPS[0].a = 0;
window.CAPTION_PHRASES = CAPS;

// ───── сцены ─────
const HD = t => hudBase(t);
const SC = [
  [0, 3, 'e2s01', t => push(t, 0, 3, () => hookPhones(t), 520, 900, 1.04, 1.12), HD],
  [3, 5.4, 'e2s02a', t => push(t, 3, 5.4, () => wakeBed(t), 300, 1150, 1, 1.1), HD],
  [5.4, 8, 'e2s02b', t => push(t, 5.4, 8, () => wakeSit(t), 500, 800, 1, 1.07), HD],
  [8, 11.3, 'e2s03a', t => push(t, 8, 11.3, () => chatScene(t), 540, 700, 1, 1.06), HD],
  [11.3, 13, 'e2s03b', t => push(t, 11.3, 13, () => hallLook(t), 540, 900, 1, 1.08), HD],
  [13, 15.6, 'e2s04a', t => pan(t, 13, 15.6, () => queueDoor(t), -50), HD],
  [15.6, 18, 'e2s04b', t => push(t, 15.6, 18, () => erzhanMoney(t), 520, 900, 1, 1.1), HD],
  [18, 22.4, 'e2s05', t => montage(t), HD],
  [22.4, 24.8, 'e2s06a', t => push(t, 22.4, 24.8, () => lecture(t), 420, 1000, 1, 1.1), HD],
  [24.8, 27, 'e2s06b', t => push(t, 24.8, 27, () => faceDesk(t), 560, 800, 1, 1.12), HD],
  [27, 29.4, 'e2s07a', t => push(t, 27, 29.4, () => vahtaPass(t), 560, 900, 1, 1.08), HD],
  [29.4, 32, 'e2s07b', t => push(t, 29.4, 32, () => apaiBooth(t), 470, 950, 1, 1.08), HD],
  [32, 34.6, 'e2s08a', t => push(t, 32, 34.6, () => apaiBooth(t, { glassesOff: E.io(win(t, 32.3, 33.3)), photo: win(t, 33.6, 34.2) }), 600, 900, 1.05, 1.2), HD],
  [34.6, 37, 'e2s08b', t => push(t, 34.6, 37, () => photoClose(t), 540, 800, 1, 1.15), HD],
  [37, 39.8, 'e2s09a', t => push(t, 37, 39.8, () => wristStop(t), 500, 950, 1, 1.1), HD],
  [39.8, 42, 'e2s09b', t => push(t, 39.8, 42, () => bekaLooks(t), 450, 900, 1, 1.08), HD],
  [42, 47, 'e2s10', t => push(t, 42, 47, () => windowNight(t), 540, 900, 1.12, 1), HD], // отъезд камеры
  [47, 52, 'e2s11', t => push(t, 47, 52, () => cityDark(t), 790, 1500, 1, 1.2), HD],
  [52, 53, 'e2s12', t => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }, HD],
  [53, 55.5, 'e2s13', t => push(t, 53, 55.5, () => darkHall(t), 560, 1000, 1, 1.1), HD],
  [55.5, 58.01, 'e2s14', t => EndCard(t, 55.5, 'Энергия **ниоткуда** не берётся', 'ЧАСТЬ 3 →'), null],
];
function drawFrame(t) { NOW = t; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore();
  const k = 1 - win(t, a, a + .12); if (i > 0 && k > 0 && id !== 'e2s05') { ctx.fillStyle = `rgba(0,0,0,${k * .7})`; ctx.fillRect(0, 0, W, H); }
  if (id === 'e2s11' && t > BLACKOUT && t < BLACKOUT + .1) { ctx.fillStyle = 'rgba(220,230,255,.7)'; ctx.fillRect(0, 0, W, H); } // хлопок
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(2, t); KineticCaption(t, CAPS); }

// ───── звук ─────
const THEME = 'projects/kuat/assets/theme.wav', BED = 'projects/kuat/assets/bed-ep1.wav';
const ringIn = (t0, n, gap) => Array.from({ length: n }, (_, i) => t0 + i * gap);
const touch = (t, g = .22, p = 1) => [{ t, type: 'charge', gain: g, pitch: p }, { t, type: 'hum50', dur: .45, gain: g * .3 }];
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/kuat/assets/vo/ep2/${id}.wav`, gain: VO_GAIN[id] || 4 })),
  { t: 0, type: 'file', path: THEME, gain: .1, dur: 3 }, { t: .35, type: 'hum50', dur: .7, gain: .07 }, ...HOOK_T.flatMap((t, i) => touch(t, .16, 1 + i * .1)),
  { t: 3.05, type: 'lib', id: 'time-alarm', gain: .16, align: 'start', dur: 1.35 }, { t: 3, type: 'hum', dur: 5, gain: .03 }, { t: 6.1, type: 'pop', gain: .25 },
  ...CHAT.map(m => ({ t: m.at, type: 'bloop', gain: .2, pitch: 1.3 })), { t: 11.3, type: 'murmur', dur: 1.7, gain: .05 }, { t: 11.7, type: 'lib', id: 'whoosh-fast-soft', gain: .25 },
  { t: 13, type: 'murmur', dur: 5, gain: .06 }, { t: 13, type: 'murmur', dur: 5, gain: .04, pitch: 1.3 }, ...QUEUE_T.flatMap(t => touch(t - .3, .16)), ...ringIn(13.4, 4, 1.1).map(t => ({ t, type: 'lib', id: 'money-coin-drop', gain: .18 })),
  { t: 15.7, type: 'lib', id: 'money-coin-stack', gain: .25 }, { t: 16.3, type: 'lib', id: 'money-coin-spin', gain: .2, align: 'start', dur: 1.2 }, { t: 15.9, type: 'lib', id: 'celebration-applause-small', gain: .08, align: 'start', dur: 2 },
  { t: 18, type: 'file', path: THEME, gain: .1, dur: 4.4 }, ...MONTAGE.map(([t, k], i) => ({ t, type: 'charge', gain: k === 'laptop' ? .12 : .05, pitch: k === 'laptop' ? .7 : 1 + (i % 4) * .08 })),
  { t: 20.8, type: 'lib', id: 'impact-deep-firm', gain: .12 }, { t: 21.85, type: 'lib', id: 'impact-deep-firm', gain: .12 },
  { t: 22.4, type: 'murmur', dur: 4.6, gain: .05, pitch: .8 }, { t: 22.6, type: 'lib', id: 'writing-chalk-write', gain: .15, align: 'start', dur: 1.3 }, { t: 22.5, type: 'lowbat', gain: .15 }, { t: 25.25, type: 'thud', gain: .3 },
  { t: 27, type: 'hum', dur: 15, gain: .025, pitch: .8 }, { t: 27.2, type: 'lib', id: 'click-latch-firm', gain: .4 }, { t: 27.4, type: 'lib', id: 'click-rocker-medium', gain: .2 }, ...VAHTA_T.flatMap(t => touch(t - .8, .17)),
  { t: 32.4, type: 'lib', id: 'click-latch-soft', gain: .2 }, { t: 33.6, type: 'tone', freq: 880, dur: .4, gain: .03 },
  { t: LAPTOP_TRY, type: 'charge', gain: .18 }, { t: LAPTOP_TRY, type: 'hum50', dur: APAI_GRAB - LAPTOP_TRY + .6, gain: .1, release: .6 }, { t: APAI_GRAB, type: 'lib', id: 'click-clap-firm', gain: .25 },
  { t: 42, type: 'wind', dur: 5, gain: .04 }, { t: 42, type: 'file', path: BED, gain: .08, dur: 10 }, { t: 46.3, type: 'thud', gain: .12, pitch: .6 },
  ...ringIn(47.4, 9, .48).map((t, i) => ({ t, type: 'click', gain: .14, pitch: .5 - i * .02 })), { t: 47, type: 'hum50', dur: 4.7, gain: .06, release: 1.5 }, { t: BLACKOUT, type: 'lib', id: 'impact-deep-hard', gain: .35, dur: .3 }, { t: BLACKOUT, type: 'powerdown', dur: .3, gain: .1, pitch: .5 },
  // 52,0–53,0 — тишина перед финальной фразой
  { t: 53.3, type: 'click', gain: .12 }, { t: 53.6, type: 'hum50', dur: 1.9, gain: .07 }, { t: 53.6, type: 'charge', gain: .15, pitch: .8 },
  ...MONTAGE.filter((_, i) => i % 2 === 0).map(([t]) => ({ t: t - .08, type: 'lib', id: 'whoosh-fast-soft', gain: .05 })),
  ...QUEUE_T.map(t => ({ t: t + .2, type: 'step', gain: .12, pitch: .9 })), ...ringIn(27.1, 4, .18).map(t => ({ t, type: 'tick', gain: .18, pitch: .5 })),
  { t: 5.5, type: 'breath_in', dur: .6, gain: .15 }, { t: 4.25, type: 'lib', id: 'swipe-fast-soft', gain: .15 }, { t: 25.45, type: 'thud', gain: .12, pitch: 1.3 },
  { t: 27, type: 'file', path: BED, gain: .045, from: 12, dur: 10 },
  { t: 55.5, type: 'file', path: THEME, gain: .36, dur: 2.5 },
];
// ───── раскадровка storyboard/ep2.json ─────
window.STORYBOARD = { episode: EP, title: '200 тенге', duration: DUR, hud: { place: 'АСТАНА', temp: '−29°', battery: { start: 98, mid: 36, end: 18 } },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null, he = hud ? hud(Math.min(b, DUR) - .02) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), vo: c.length ? { speaker: c[0].speaker || 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && s.type !== 'file').map(s => ({ id: s.id || s.type, at: +s.t.toFixed(2) })), hud: h ? { time: h.time, battery: h.battery == null ? null : Math.round(h.battery), batteryEnd: he.battery == null ? null : Math.round(he.battery) } : null,
      overlays: a === 0 ? ['PartSticker:2', 'ChargeFlow'] : id === 'e2s14' ? ['EndCard'] : id === 'e2s03a' ? ['GroupChat'] : id === 'e2s11' ? ['CityGrid'] : /e2s(04a|05|07a|09a|13)/.test(id) ? ['ChargeFlow'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
