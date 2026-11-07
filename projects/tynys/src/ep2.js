// «Тыныс» · серия 2 «1988» (0:58). Тексты — ТЗ раздел 7; ДЕМ — реальные секунды (вдох 25,8 → выдох 37,8 = 00:12, RECORDS[2]).
// По knowledge/visual-style.md: крупное табло (архивный режим для 1988), жёсткие склейки, белая вспышка — переход в архив, руки с локтем,
// рот по голосу, музыка без дыр (кроме 1 с тишины по ТЗ), штампы «БЕЗ ЭКИПАЖА» / «НЕТ СВЯЗИ», звуковые слова. Урок ҚУАТ: руки не крупнее головы.
'use strict';
const DUR = 58, EP = 2;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const ON = 25.8, OFF = ON + RECORDS[EP], LOST = 9.8;
const CLOCK2 = [[11.2, 22 * 60], [22.6, 13 * 60], [40.4, 2 * 60 + 10]]; /* день 1 22:00 → день 2 13:00 → ночь 02:10; минуты идут в реальном времени */
const clock2 = t => { let i = CLOCK2.length - 1; while (i > 0 && CLOCK2[i][0] > t) i--; const m = (CLOCK2[i][1] + Math.floor((t - CLOCK2[i][0]) / 60)) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const ARCH = [[0, 7.2, '15.11.1988 · БАЙҚОҢЫР', '06:00'], [7.2, 11.2, '15.11.1988 · ЦУП', '09:20'], [15.2, 19.2, '15.11.1988 · ЮБИЛЕЙНЫЙ', '11:40'], [19.2, 22.6, '16.11.1988 · ҰЛЫТАУ', '23:40']];
const archAt = t => ARCH.find(([a, b]) => t >= a && t < b);
function hudBase(t) { const ar = archAt(t); if (ar) return { archive: ar[2], time: ar[3] };
  const day = t < 22.6 ? ['ҰЛЫТАУ', '−14°'] : t < 40.4 ? ['ҰЛЫТАУ', '−8°'] : ['ҰЛЫТАУ', '−16°']; const h = { place: day[0], temp: day[1], time: clock2(t) };
  if (t >= ON - .3 && t < OFF) h.dem = t < ON ? 0 : Math.min(t - ON, OFF - ON - .001); if (t >= OFF && t < 40.4) h.record = mmss(RECORDS[EP]);
  if (t > OFF - 2.6 && t < OFF) h.alert = .5 + .5 * Math.sin(t * 14); return h; }
const shake = (t, t0, amp = 30, dec = 7) => t < t0 ? [0, 0] : [Math.sin((t - t0) * 71) * amp * Math.exp(-(t - t0) * dec), Math.cos((t - t0) * 53) * amp * Math.exp(-(t - t0) * dec)];
const flash = (t, t0, a = .9) => { if (t >= t0 && t < t0 + 2 / 30) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(-200, -200, W + 400, H + 400); } };
const dim = a => { ctx.fillStyle = `rgba(11,26,42,${a})`; ctx.fillRect(-200, -200, W + 400, H + 400); };
const mouthOf = (t, id) => window.VO_MOUTH ? AK.mouth(t, VO_MOUTH[id], VO_AT[id]) : 0;
const clipboard = (x, y) => { ctx.save(); ctx.translate(x - 10, y - 50); ctx.rotate(-.2); rr(-40, -60, 80, 110, 6); fillOL('#c9a66b', 4); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-32, -46, 64, 84); ctx.restore(); };

// крупный план Ерасыла: плечи в худи + шарф по размеру головы (без «палки» шарфа под субтитрами)
function erasylBust(x, y, r, t, o = {}) { ctx.beginPath(); ctx.ellipse(x, y + r * 1.75, r * 1.35, r * .95, 0, Math.PI, 0); ctx.lineTo(x + r * 1.35, y + r * 3); ctx.lineTo(x - r * 1.35, y + r * 3); ctx.closePath(); fillOL(HOOD, 6);
  rr(x - r * .7, y + r * .78, r * 1.4, r * .36, r * .16); fillOL(T.sky, 6); ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -2; i <= 2; i++) ctx.fillRect(x + i * r * .22 - 5, y + r * .82, 10, r * .28);
  ctx.save(); ctx.translate(x, y); erasylHead(0, 0, r, o); ctx.restore(); }
// ───── 0:00–0:03 хук: «Буран» на старте, рядом молодой Ата ─────
function hook(t) { launchPad(t); glow(760, 760, 500, 'rgba(255,240,210,.25)');
  ata(230, 1700, 1.7, t, { young: 1, armR: [-.4, -2.2], armL: [.3, .5], look: 1, mouth: 0, hold: clipboard }); }
// ───── 0:03–0:07 «Буран» в небе без экипажа ─────
function flight(t) { skyFlight(t, win(t, 3, 7.2)); FX.stamp(t, 5.0, 'БЕЗ ЭКИПАЖА', 520, 1050, { col: T.gold, size: 80, rot: -.08, life: 2.2 }); }
// ───── 0:07–0:11 радар: отметка уходит влево, «НЕТ СВЯЗИ» ─────
function radar(t) { RadarScreen(t, 7.2, LOST); FX.stamp(t, LOST + .15, 'НЕТ СВЯЗИ', 520, 1040, { col: '#e5383b', size: 92, rot: -.1, life: 1.3 }); }
// ───── 0:11–0:15 сегодня: кухня, Ата с кесе ─────
function kitchenTwo(t) { kitchen(t); const pour = win(t, 11.3, 12.4);
  erasyl(250, 1560, 1.7, t, { armL: [.3, -1.6], armR: [-.3, 1.6], look: 1 }); // локти на столе
  ata(800, 1560, 1.75, t, { armR: [2.2, .6], armL: [-.3, 1.5], look: -1, mouth: mouthOf(t, 'e2s04'), hold: (x, y) => { if (pour < 1) { ctx.save(); ctx.translate(x - 20, y - 20); ctx.rotate(-.5 * E.io(pour)); rr(-50, -40, 100, 80, 30); fillOL('#2a6fb0', 5); ctx.restore(); } } }); // чайник
  ctx.fillStyle = '#7a4e32'; ctx.fillRect(-300, 1080, W + 600, 70); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-300, 1060, W + 600, 30); for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#c0392b' : '#f4f1ea'; ctx.fillRect(-300 + i * 90, 1060, 45, 30); }
  kese(420, 1050, 1.1); kese(660, 1050, 1.1, pour > .3 ? 1 : 0); steamRise(660, 990, t, pour); if (pour > 0 && pour < 1) { ctx.strokeStyle = '#b5652a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(700, 860); ctx.quadraticCurveTo(690, 960, 664, 1000); ctx.stroke(); } }
function erasylListen(t) { kitchen(t); dim(.1); const k = E.out(win(t, 13.4, 13.8)); erasylBust(540, 760, 290, t, { look: .4, eyes: lerp(1, 1.25, k), blink: AK.blink(t, 3) }); FX.emote(t, 13.9, '?', 830, 470, 1, 1.2); }
// ───── 0:15–0:19 флешбэк: отсек, молодой Ата достаёт сферу, перчатки в инее ─────
function bayWide(t) { cargoBay(t); const lift = E.out(win(t, 15.4, 16.6));
  ata(540, 1840, 1.9, t, { young: 1, gloves: 1, armL: [lerp(.6, 2.7, lift), -.3], armR: [lerp(-.6, -2.7, lift), .3], look: 0, mouth: 0 }); sphere(540, lerp(960, 560, lift), 150, t, 1); /* сфера над головой, перед фигурой — ключевой предмет виден */ fog(540, 1000, t, 1, -1, 1); fog(540, 1000, t + 1.2, 1, 1, 1); }
function gloves(t) { cargoBay(t); dim(.15); const fr = win(t, 17.3, 19.0); sphere(540, 860, 260, t, 1);
  for (const sx of [-1, 1]) { const hx = 540 + sx * 230, hy = 980; ctx.save(); ctx.translate(hx, hy); ctx.rotate(sx * -.5); rr(-70, 0, 140, 600, 50); fillOL('#f2efe6', 6); rr(-80, -110, 160, 140, 50); fillOL('#3a4a5a', 6); for (let i = 0; i < 4; i++) { rr(-74 + i * 38, -170, 32, 80, 16); fillOL('#3a4a5a', 5); } ctx.restore();
    FrostOverlay(fr, { x: hx - 110, y: hy - 200, w: 220, h: 260 }, { x: hx, y: hy - 80 }, 31 + sx); } } // иней растёт по перчаткам
// ───── 0:19–0:22,6 ночь 1988: фары, Ата закапывает ящик ─────
function bury(t) { ctx.fillStyle = '#0d1424'; ctx.fillRect(-300, -300, W + 600, H + 600); hills(1000, '#1a2238', 3, 120); ctx.fillStyle = '#2a2a30'; ctx.fillRect(-300, 1050, W + 600, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(1080, 0, 200, 0); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(1080, 1180); ctx.lineTo(0, 900); ctx.lineTo(0, 1700); ctx.closePath(); ctx.fill(); ctx.restore(); // фары
  glow(1060, 1180, 120, 'rgba(255,240,200,.9)'); dirt(380, 1420, t); crate(380, 1500, .7, { open: 0 });
  const dig = (t * 1.3) % 1, sw = AK.anticip(dig, .25); ata(660, 1560, 1.9, t, { young: 1, armL: [lerp(-.2, .9, sw), lerp(-1.2, -.3, sw)], armR: [lerp(.2, 1.3, sw), lerp(1.2, .2, sw)], look: -1, mouth: 0,
    hold: (x, y) => { ctx.strokeStyle = '#6b4a32'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x - 60, y - 120); ctx.lineTo(x + 40, y + 140); ctx.stroke(); ctx.fillStyle = '#9aa3b5'; ctx.beginPath(); ctx.ellipse(x + 50, y + 170, 30, 44, -.4, 0, Math.PI * 2); ctx.fill(); } });
  if (dig > .55 && dig < .8) AK.dust(t, t - (dig - .55) / 1.3, 430, 1440, { w: .35, rgb: '90,80,70', n: 6 }); }
function dirt(x, y, t) { ctx.fillStyle = '#3a2e26'; ctx.beginPath(); ctx.ellipse(x - 220, y, 160, 70, 0, Math.PI, 0); ctx.fill(); }
// ───── 0:22,6–0:25,8 двор: «Пока не выдохнешь — ты космос», вдох ─────
const BALLS = [[-90, 0, 46, 0], [10, -10, 38, 1.1], [90, 6, 50, 2.3], [-40, 20, 30, 3.1], [60, 26, 34, 4.2], [-120, 30, 28, 5], [130, 34, 30, 5.7], [0, 40, 42, 6.4]];
function yardTalk(t) { yard(t); const inh = win(t, 25.1, 25.8);
  bucket(380, 1520, 1.3, 1); erasyl(230, 1540, 1.6, t, { armR: [.6, -.4], armL: [-.2, .2], look: 1, puff: inh > .6 ? 1 : 0, gasp: inh > 0 && inh < .6 ? t : 0 });
  ata(830, 1560, 1.65, t, { armR: [2.6, .3], armL: [-.4, .3], look: -1, mouth: mouthOf(t, 'e2s07') }); }
// ───── сила 0:25,8–0:37,8: вода из ведра поднимается шарами ─────
function ballPos(t, i, drop = 0) { const [dx, dy, r, ph] = BALLS[i], lift = E.out(win(t, ON + .1 + i * .08, ON + 1.8 + i * .08)), x = 380 + dx * 2.2 + Math.sin(t * .6 + ph) * 30, y0 = 1330 + dy, y1 = 760 + dy * 4 - (i % 3) * 120 + Math.cos(t * .5 + ph) * 26;
  const y = lerp(y0, y1, lift); if (!drop) return [x, y, r]; const d = AK.drop(drop, 1), tx = 830 + (dx - 10) * .8, ty = 1000 + (i % 3) * 30; return [lerp(x, tx, E.out(drop)), lerp(y, ty, d), r]; }
function powerWide(t) { const drop = t >= OFF ? win(t, OFF, OFF + .55) : 0, [sx, sy] = shake(t, OFF, 26, 6); ctx.save(); ctx.translate(sx, sy); yard(t);
  bucket(380, 1520, 1.3, t < ON ? 1 : .25); erasyl(230, 1540, 1.6, t, { armR: [.6, -.4], armL: [-.2, .2], look: 1, puff: t < OFF ? 1 : 0, red: t < OFF ? .4 * win(t, ON, OFF) : 0, gasp: t >= OFF ? t : 0 });
  const laugh = t > OFF + .3; ata(830, 1560, 1.65, t, { armL: laugh ? [-2.5, -.4] : [-.4, .3], armR: laugh ? [2.5, .4] : [2.6, .3], look: -1, mouth: laugh ? 'laugh' : 0 });
  for (let i = 0; i < BALLS.length; i++) { const [x, y, r] = ballPos(t, i, drop); if (drop < 1) waterBall(x, y, r * 1.6, t, i); }
  if (t >= OFF + .45) { for (let i = 0; i < 9; i++) AK.puff(830 + (i - 4) * 50, 980 + Math.abs(i - 4) * 14 - (t - OFF) * 60, 50 + (t - OFF) * 40, '160,210,240', .7 * Math.exp(-(t - OFF - .45) * 2.5)); } // брызги на Ата
  if (t < OFF) { frozenSnow(t, .6); VacuumBubble(t, 300, 1050, 620, E.out(win(t, ON, ON + .25))); }
  ctx.restore(); flash(t, OFF, .6); FX.onomato(t, OFF + .45, 'ПЛЮХ!', 760, 760, { col: T.vacuum, size: 100, life: .9 }); }
function powerFace(t) { yard(t); dim(.1); erasylBust(540, 780, 290, t, { puff: 1, red: .2 + .3 * win(t, 29.2, 32.4), eyes: 1.2, look: .4, blink: AK.blink(t, 3), smile: 1 });
  for (let i = 0; i < 4; i++) { const ph = i * 1.6, x = 540 + Math.sin(t * .5 + ph) * 380, y = 640 + Math.cos(t * .4 + ph) * 330 - (i % 2) * 60; waterBall(x, y, 50 + i * 12, t, ph); }
  waterBall(260 + (t - 29.2) * 120, 1020, 120, t, 9); // ближний шар проплывает перед камерой
  frozenSnow(t, .5); VacuumBubble(t, 540, 820, 560, 1); }
function ataFinger(t) { yard(t); dim(.08); const r = 360, pokeK = E.out(win(t, 32.8, 33.5)); ctx.save(); ctx.translate(560, 820); ataHead(0, 0, 300, t, { look: -.6, blink: AK.blink(t, 5), mouth: pokeK > .5 ? 'laugh' : 0, reflect: .6 }); ctx.restore();
  waterBall(330, 600 + Math.sin(t * 1.2) * 20, 130 * (1 + .1 * Math.sin((t - 33.5) * 14) * (t > 33.5 ? Math.exp(-(t - 33.5) * 2) : 0)), t, 2); // палец касается шара — шар дрожит
  const fx = lerp(820, 470, pokeK), fy = lerp(860, 650, pokeK); ctx.beginPath(); ctx.moveTo(1180, 1180); ctx.lineTo(1180, 1000); ctx.lineTo(fx + 90, fy - 32); ctx.lineTo(fx + 100, fy + 32); ctx.closePath(); fillOL('#e8e2d6', 5); /* рукав сужается к кисти */
  circle(fx + 70, fy, 40); fillOL('#d7a07a', 5); rr(fx - 10, fy - 13, 80, 26, 13); fillOL('#d7a07a', 4); /* кисть с указательным пальцем */
  frozenSnow(t, .5); VacuumBubble(t, 540, 820, 700, 1); }
function powerStrain(t) { yard(t); dim(.15); const red = lerp(.45, 1, win(t, 35.2, 37.6)), j = win(t, 36.2, 37.8) * Math.sin(t * 50) * 8; ctx.save(); ctx.translate(540 + j, 820); erasylHead(0, 0, 340, { puff: 1, red, eyes: 1.3 + .1 * Math.sin(t * 9), strain: 1, blink: 1 }); ctx.restore();
  const vg = ctx.createRadialGradient(540, 820, lerp(700, 380, win(t, 35.2, 37.8)), 540, 820, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(120,10,10,.75)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); // виньетка сжимается
  frozenSnow(t, .5); VacuumBubble(t, 540, 820, 560, 1); }
// ───── 0:40–0:50 ночь: тетрадь пропала, пятно гептила ─────
function workshopDoor(t) { workshop(t); const k = E.out(win(t, 40.6, 41.2)); erasyl(400, 1720, 1.9, t, { armR: [1.6, .2], armL: [-.3, .3], look: 1, eyes: 1.2, hold: (x, y) => flashlight(x, y, 1.6, -.3, 1) }); }
function flashlight(x, y, s, rot, k = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, `rgba(255,245,210,${.5 * k})`); g.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(30, -12); ctx.lineTo(900, -230); ctx.lineTo(900, 230); ctx.lineTo(30, 12); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.scale(s / 2.6, s / 2.6); rr(-60, -12, 80, 24, 8); fillOL('#2a2f3e', 3); ctx.restore(); }
function shelfClose(t) { workshop(t); ctx.save(); ctx.translate(-580, -750); ctx.scale(1.9, 1.9); workshop(t); ctx.restore(); dim(.2); const sweep = Math.sin((t - 42.6) * 1.5) * .15;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(560 + sweep * 600, 1000, 30, 560, 1000, 520); g.addColorStop(0, 'rgba(255,245,210,.55)'); g.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1300); ctx.restore(); }
function stainClose(t) { ctx.fillStyle = '#2a1e16'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = '#5a4030'; ctx.fillRect(-300, 600, W + 600, 700); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 5; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-300, 640 + i * 80); ctx.lineTo(W + 300, 660 + i * 80); ctx.stroke(); } // верстак
  ctx.save(); ctx.translate(540, 940); ctx.scale(2, 2); ctx.translate(-540, -940); heptylStain(540, 940, t, 1); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([16, 12]); ctx.lineWidth = 5; rr(330, 700, 420, 300, 10); ctx.stroke(); ctx.setLineDash([]); /* пунктир — где лежала тетрадь */ ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(540, 900, 600, 'rgba(255,245,210,.25)'); ctx.restore(); }
function coughing(t) { workshop(t); dim(.1); for (let i = 0; i < 6; i++) AK.puff(540 + Math.sin(t + i) * 300, 900 + Math.cos(t * .7 + i) * 300, 220, '255,107,26', .18); // оранжевая дымка
  const c = Math.sin(t * 18) * (t > 47.4 ? 1 : 0); erasylBust(520 + c * 8, 800, 290, t, { cough: 1, eyes: .45, strain: 1, blink: 1 }); circle(700 + c * 8, 960, 46); fillOL(SKIN, 5); /* кулак у рта */ FX.onomato(t, 47.6, 'КХЕ!', 820, 600, { col: T.heptyl, size: 90, life: .7 }); FX.onomato(t, 48.6, 'КХЕ-КХЕ!', 800, 660, { col: T.heptyl, size: 80, life: .8 }); }
// ───── 0:49,8–0:55,5 тишина, Ата в свете фонаря: «Гептил» ─────
function ataSil(t) { workshop(t); dim(.45); ctx.save(); ctx.globalAlpha = .9; ata(540, 1700, 2.0, t, { armL: [-.2, .2], armR: [.2, -.2], look: 0, mouth: 0, still: 1 }); ctx.restore(); dim(.35); }
function ataPale(t) { ctx.fillStyle = '#05070d'; ctx.fillRect(-300, -300, W + 600, H + 600); const pale = win(t, 51.0, 53.0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 1300, 50, 540, 900, 900); g.addColorStop(0, 'rgba(255,245,210,.6)'); g.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); // фонарь снизу
  ctx.save(); ctx.translate(540, 860); ataHead(0, 0, 320, t, { look: 0, blink: AK.blink(t, 5), mouth: mouthOf(t, 'e2s11') }); ctx.restore();
  ctx.fillStyle = `rgba(150,180,220,${.35 * pale})`; ctx.beginPath(); ctx.arc(540, 860, 322, 0, Math.PI * 2); ctx.fill(); // бледнеет
  if (t > 53.2) AK.smoke(200, 1300, t, { k: win(t, 53.2, 54) * .7, rgb: '255,107,26', h: 700, n: 8, wind: 60, size: .7, seed: 4 }); } // оранжевая струйка проплывает

// ───── голос, субтитры ─────
const VO_AT = { e2s01: .05, e2s02: 3.2, e2s03: 7.4, e2s04: 11.45, e2s05: 15.3, e2s06: 19.3, e2s07: 22.75, e2s08: 38.3, e2s09: 40.6, e2s10: 45.0, e2s11: 51.2 };
const VO_GAIN = { e2s01: 4.6, e2s04: 3.4, e2s07: 3.4, e2s11: 3.6 };
const VT = id => window.VO_WORDS && window.VO_WORDS[id] ? window.VO_WORDS[id].map(x => x + VO_AT[id]) : null;
const CAPS = buildCaptions([
  [0, 3, 'Мой дед строил **«Буран»**', { times: VT('e2s01'), whole: true, size: 72, maxW: 860 }],
  [3.1, 7.3, 'В 1988-м он слетал в космос **один раз**. Без людей', { times: VT('e2s02') }],
  [7.35, 11.2, 'Перед посадкой он вдруг **свернул** и пропал с радаров', { times: VT('e2s03') }],
  [11.4, 15.2, 'Он был **не пустой**', { times: VT('e2s04'), speaker: 'ata' }],
  [15.25, 19.2, 'В отсеке летел «Объект ноль». **Кусок орбиты**', { times: VT('e2s05') }],
  [19.25, 22.6, 'Дед спрятал его, чтобы из него **не сделали оружие**', { times: VT('e2s06') }],
  [22.7, 25.8, 'Пока не выдохнешь — ты **космос**', { times: VT('e2s07'), speaker: 'ata' }],
  [26.3, 29.0, 'Вода **летает**', { title: true, times: [26.3, 26.7] }],
  [38.25, 40.4, 'Двенадцать секунд. **Рекорд**', { times: VT('e2s08') }],
  [40.55, 44.8, 'Ночью пропала дедова **тетрадь**', { times: VT('e2s09') }],
  [44.95, 49.8, 'На её месте — пятно. Пахнет **ракетным топливом**', { times: VT('e2s10') }],
  [51.15, 55.5, '**Гептил**', { times: VT('e2s11'), speaker: 'heptyl' }],
], { tail: .3 });
CAPS[0].words.forEach(w => w.t = Math.min(w.t, 1.2)); CAPS[0].a = 0;
window.CAPTION_PHRASES = CAPS;

// ───── сцены: [начало, конец, id, рисование, hud, склейка] — по умолчанию жёсткая; в архив и из архива — белая вспышка ─────
const H0 = t => hudBase(t);
const SC = [
  [0, 3, 'e2s01', t => push(t, 0, 3, () => hook(t), 600, 900, 1.04, 1.12), H0],
  [3, 7.2, 'e2s02', t => push(t, 3, 7.2, () => flight(t), 540, 820, 1, 1.1), H0],
  [7.2, 11.2, 'e2s03', t => push(t, 7.2, 11.2, () => radar(t), 540, 860, 1, 1.1), H0],
  [11.2, 13.2, 'e2s04a', t => push(t, 11.2, 13.2, () => kitchenTwo(t), 540, 1000, 1, 1.06), H0, 'flash'],
  [13.2, 15.2, 'e2s04b', t => push(t, 13.2, 15.2, () => erasylListen(t), 540, 800, 1.05, 1.12), H0],
  [15.2, 17.2, 'e2s05a', t => push(t, 15.2, 17.2, () => bayWide(t), 540, 1000, 1, 1.08), H0, 'flash'],
  [17.2, 19.2, 'e2s05b', t => push(t, 17.2, 19.2, () => gloves(t), 540, 900, 1, 1.1), H0],
  [19.2, 22.6, 'e2s06', t => push(t, 19.2, 22.6, () => bury(t), 520, 1300, 1, 1.08), H0, 'whip'],
  [22.6, ON, 'e2s07', t => push(t, 22.6, ON, () => yardTalk(t), 540, 1100, 1, 1.06), H0, 'flash'],
  [ON, 29.2, 'e2s08a', t => push(t, ON, 29.2, () => powerWide(t), 400, 1000, 1, 1.08), H0, 'none'],
  [29.2, 32.4, 'e2s08b', t => push(t, 29.2, 32.4, () => powerFace(t), 540, 820, 1, 1.08), H0],
  [32.4, 35.2, 'e2s08c', t => push(t, 32.4, 35.2, () => ataFinger(t), 520, 760, 1, 1.08), H0],
  [35.2, OFF, 'e2s08d', t => cam(1 + .1 * E.io(win(t, 35.2, OFF)), 540, 820, () => powerStrain(t), ...AK.handheld(t, 8, 2).slice(0, 2)), H0],
  [OFF, 40.4, 'e2s09', t => push(t, OFF, 40.4, () => powerWide(t), 600, 1100, 1.05, 1.12), H0],
  [40.4, 42.6, 'e2s10a', t => push(t, 40.4, 42.6, () => workshopDoor(t), 500, 1000, 1, 1.08), H0, 'dip'], // прошло время — затемнение
  [42.6, 44.8, 'e2s10b', t => push(t, 42.6, 44.8, () => shelfClose(t), 600, 900, 1, 1.1), H0],
  [44.8, 47.2, 'e2s11a', t => push(t, 44.8, 47.2, () => stainClose(t), 540, 960, 1, 1.12), H0],
  [47.2, 49.8, 'e2s11b', t => cam(1.04, 520, 860, () => coughing(t), ...AK.handheld(t, 9, 5).slice(0, 2)), H0],
  [49.8, 50.8, 'e2s12', t => ataSil(t), H0],
  [50.8, 55.5, 'e2s13', t => push(t, 50.8, 55.5, () => ataPale(t), 540, 860, 1, 1.16), H0],
  [55.5, 58.01, 'e2s14', t => EndCard(t, 55.5, 'Тетрадь 1988 украли', 'ЧАСТЬ 3 →'), null],
];
function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud, cutKind = 'none'] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore();
  const ar = archAt(t); if (ar) ArchiveFrame(t, ar[2]); if (i > 0) AK.cut(t, a, cutKind);
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(2, t); KineticCaption(t, CAPS); }

// ───── звук: подложка без дыр; сила — duck + keep (сердце и 8 кГц) ─────
const RIFF = 'projects/tynys/assets/riff.wav', BED = 'projects/tynys/assets/bed-ep2.wav';
const ringIn = (t0, n, gap) => Array.from({ length: n }, (_, i) => +(t0 + i * gap).toFixed(3));
const beats = (() => { const out = []; let t = ON + .2; while (t < OFF - .05) { out.push(+t.toFixed(3)); t += lerp(.95, .36, (t - ON) / (OFF - ON)); } return out; })();
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/tynys/assets/vo/ep2/${id}.wav`, gain: VO_GAIN[id] || 4.2 })),
  { t: 0, type: 'file', path: BED, gain: .08, dur: 49.8 }, { t: 50.8, type: 'file', path: BED, gain: .07, from: 50.8, dur: 4.7 }, // подложка, тишина 49,8–50,8
  { t: 0, type: 'click', gain: .4, pitch: .6 }, ...ringIn(0, 22, .5).filter(t => archAt(t)).map(t => ({ t, type: 'tick', gain: .07, pitch: .5 })), { t: 0, type: 'hiss', dur: 7.2, lo: 1500, hi: 6000, gain: .025 }, // проектор, плёнка
  { t: .2, type: 'lib', id: 'bass-rumble-long', gain: .18 }, { t: 3, type: 'wind', dur: 4.2, gain: .06, pitch: 1.4 }, { t: 3.2, type: 'lib', id: 'digital-radio', gain: .12 }, { t: 5.0, type: 'lib', id: 'impact-deep-firm', gain: .22 },
  ...ringIn(7.3, 4, .6).filter(t => t < LOST).map(t => ({ t, type: 'tone', freq: 1500, dur: .08, gain: .07 })), { t: LOST, type: 'tone', freq: 1500, dur: .6, gain: .07 }, { t: LOST + .15, type: 'lib', id: 'impact-deep-firm', gain: .28 }, { t: LOST + .4, type: 'lib', id: 'digital-corrupt', gain: .15 },
  { t: 11.2, type: 'flash_cut', gain: 0 }, { t: 11.3, type: 'hiss', dur: 1.1, lo: 400, hi: 2200, gain: .08, pulse: 9 }, { t: 11.2, type: 'file', path: RIFF, gain: .06, from: 0, dur: 4 }, { t: 13.9, type: 'pop', gain: .2 }, // чай льётся
  { t: 15.2, type: 'lib', id: 'whoosh-slow-hard', gain: .15 }, { t: 15.4, type: 'hiss', dur: 3.8, lo: 3000, hi: 9000, gain: .05, attack: .6, pulse: .35 }, { t: 15.5, type: 'heartbeat', gain: .25, pitch: .6 }, { t: 17.3, type: 'lib', id: 'bsb-ice-crack-1', gain: .3, align: 'start', dur: 1.2 },
  { t: 19.2, type: 'lib', id: 'whoosh-fast-hard', gain: .15 }, { t: 19.2, type: 'wind', dur: 3.4, gain: .08 }, ...ringIn(19.6, 4, 1 / 1.3).map(t => ({ t, type: 'snowstep', gain: .3 })), ...ringIn(19.75, 4, 1 / 1.3).map(t => ({ t, type: 'thud', gain: .12, pitch: 1.2 })),
  { t: 22.6, type: 'file', path: RIFF, gain: .12, from: 0, dur: 3.2 }, { t: 25.15, type: 'breath_in', dur: .5, gain: .5 },
  { t: ON, type: 'duck', dur: OFF - ON, db: -30, ramp: .2, lp: 500 }, ...beats.map(t => ({ t, type: 'heartbeat', gain: .8, keep: true })), { t: ON, type: 'tone', freq: 8000, dur: OFF - ON, gain: .03, keep: true },
  { t: 33.5, type: 'bloop', gain: .12, pitch: .7, keep: true }, // палец в шаре — единственный звук внутри тишины
  { t: OFF, type: 'lib', id: 'impact-deep-hard', gain: .7 }, { t: OFF + .45, type: 'lib', id: 'props-splash', gain: .6 }, { t: OFF + .55, type: 'lib', id: 'props-splash', gain: .4, rate: 1.2 }, { t: OFF + .1, type: 'lib', id: 'bsb-breathless-man', gain: .45, align: 'start', dur: 2.5 },
  { t: OFF, type: 'file', path: RIFF, gain: .14, from: 4.8, dur: 2.6 },
  { t: 40.4, type: 'lib', id: 'bsb-door-creak-open', gain: .4, align: 'start', dur: 1.4 }, { t: 40.4, type: 'wind', dur: 9.4, gain: .05, pitch: .8 }, { t: 40.7, type: 'lib', id: 'click-button-firm', gain: .3 },
  { t: 44.8, type: 'hiss', dur: 5, lo: 800, hi: 5000, gain: .08, pulse: .6, attack: .3 }, { t: 47.4, type: 'lib', id: 'bsb-cough-man', gain: .55, align: 'start', dur: 2.2 },
  // 49,8–50,8 — тишина перед финальной фразой
  { t: 50.8, type: 'click', gain: .2 }, { t: 51.2, type: 'lib', id: 'impact-deep-hard', gain: .45 }, { t: 53.2, type: 'hiss', dur: 2, lo: 1500, hi: 7000, gain: .06 },
  { t: 55.5, type: 'file', path: RIFF, gain: .32, from: 4.8, dur: 2.5 }, { t: 55.5, type: 'lib', id: 'impact-deep-firm', gain: .3 },
].filter(c => c.type !== 'flash_cut');
// ───── раскадровка storyboard/ep2.json ─────
window.STORYBOARD = { episode: EP, title: '1988', duration: DUR, hud: { place: 'ҰЛЫТАУ / архив 1988', record: mmss(RECORDS[EP]) },
  scenes: SC.map(([a, b, id, , hud, cut]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), cut: cut || 'none', vo: c.length ? { speaker: c[0].speaker || (c[0].title ? 'title' : 'erasyl'), text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && s.type !== 'file').map(s => ({ id: s.id || s.type, at: +s.t.toFixed(2) })), hud: h ? { time: h.time, archive: h.archive || null, dem: h.dem == null ? null : mmss(h.dem), record: h.record || null } : null,
      overlays: [a === 0 ? 'PartSticker:2' : null, archAt(a + .01) ? 'ArchiveFrame' : null, id === 'e2s03' ? 'RadarScreen' : null, /e2s08/.test(id) ? 'VacuumBubble' : null, id === 'e2s14' ? 'EndCard' : null].filter(Boolean) }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
