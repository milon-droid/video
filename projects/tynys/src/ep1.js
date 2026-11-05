// «Тыныс» · серия 1 «Ступень» (0:58). Таймкоды и тексты — по ТЗ, раздел 7; счётчик ДЕМ — реальные секунды (вдох 24,6 → выдох 31,6 = 00:07).
'use strict';
const DUR = 58, EP = 1;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const ON = 24.6, OFF = ON + RECORDS[EP]; // сила включена: вдох → выдох
const hudBase = t => ({ place: 'ҰЛЫТАУ', time: storyClock(EP, t), temp: '−12°' });
const shake = (t, t0, amp = 30, dec = 7) => t < t0 ? [0, 0] : [Math.sin((t - t0) * 71) * amp * Math.exp(-(t - t0) * dec), Math.cos((t - t0) * 53) * amp * Math.exp(-(t - t0) * dec)];
const flash = (t, t0, a = .9) => { if (t >= t0 && t < t0 + 2 / 30) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(-200, -200, W + 400, H + 400); } };
const dim = a => { ctx.fillStyle = `rgba(11,26,42,${a})`; ctx.fillRect(-200, -200, W + 400, H + 400); };
function hand(x, y, rot, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(-30, 0, 60, 420, 26); fillOL(HOOD, 6); ctx.beginPath(); ctx.ellipse(0, -10, 44, 52, 0, 0, Math.PI * 2); fillOL(SKIN, 6);
  for (let i = 0; i < 4; i++) { rr(-40 + i * 22, -78, 18, 46, 9); fillOL(SKIN, 4); } ctx.restore(); }
function dirtMound(x, y, w, h, col = '#6b4824') { ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, Math.PI, 0); ctx.lineTo(x + w, y + 10); ctx.lineTo(x - w, y + 10); ctx.closePath(); fillOL(col, 5);
  const r = seeded(x | 0); ctx.fillStyle = 'rgba(242,245,247,.8)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x + (r() - .5) * w * 1.4, y - r() * h * .6, 30 + r() * 40, 8, 0, 0, Math.PI * 2); ctx.fill(); } }
function debris(t, t0, x, y, n = 18, spread = 1) { if (t < t0) return; const r = seeded(77), dt = t - t0; for (let i = 0; i < n; i++) { const a = -Math.PI * (.1 + .8 * r()), v = (500 + r() * 900) * spread, gx = x + Math.cos(a) * v * dt, gy = y + Math.sin(a) * v * dt + 900 * dt * dt;
    if (gy > y + 60) continue; ctx.save(); ctx.translate(gx, gy); ctx.rotate(dt * 8 + i); ctx.fillStyle = i % 3 ? '#5a3d20' : '#2a2a30'; ctx.fillRect(-8 - r() * 10, -6, 16 + r() * 20, 12); ctx.restore(); } }
function dustRing(t, t0, x, y, w = 1, col = '201,144,57') { AK.dust(t, t0, x, y, { w, rgb: col }); } // мягкое облако: вспухает и оседает

// ───── 0:00–0:03 хук: огненная ступень падает в закатную степь ─────
const STG = { x: 580, y: 740, s: 1.15, rot: Math.PI + .5 }, DIR = [-.479, .878];
function fall(t) { const T0 = 2.2, [sx, sy] = shake(t, T0, 40, 5); ctx.save(); ctx.translate(sx, sy); steppe(t, { horizon: 1000 });
  if (t < T0) { // ступень летит издалека к нам: растёт, за ней огненный хвост и дым — всё в кадре с первого кадра
    const kk = q => E.in2(clamp(q)), P = q => { const e = kk(q); return [lerp(800, STG.x, e), lerp(400, STG.y, e), lerp(.36, STG.s, e)]; }, q0 = win(t, 0, T0) * .85 + .15 * win(t, 0, T0) ** 3, tail = (x, y, s2, d) => [x + 400 * .48 * s2 + d * .48, y - 400 * .88 * s2 - d * .88];
    { const [px, py, ps] = P(q0); for (let i = 16; i >= 1; i--) { const [tx, ty] = tail(px, py, ps, i * 60); AK.puff(tx + (AK.noise1(i * 1.3 + t) - .5) * 60, ty, 60 + i * 14, '60,50,55', .5 * (1 - i / 17)); } } // дымный след до края кадра
    const [x, y, s2] = P(q0), [fx, fy] = tail(x, y, s2, 0); glow(x, y, 700 * s2, 'rgba(255,150,50,.5)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const d = i * 70 * s2; ctx.fillStyle = `rgba(255,${200 - i * 15},${90 - i * 8},${.55 * (1 - i / 8)})`; circle(fx + d * .48, fy - d * .88, (80 - i * 4) * s2 + 20); ctx.fill(); } ctx.restore(); // огненный хвост
    rocketStage(x, y, s2, STG.rot, { fire: 1, scorch: .5 }); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x - 198 * s2 / STG.s, y + 363 * s2 / STG.s, 220 * s2, 'rgba(255,200,120,.8)'); ctx.restore(); // раскалённый нос
    const sp = seeded(Math.floor(t * 30)); ctx.fillStyle = '#ffd27a'; for (let i = 0; i < 18; i++) { const d = sp() * 600 * s2; circle(fx + d * .48 + (sp() - .5) * 140 * s2, fy - d * .88 + (sp() - .5) * 140 * s2, 3 + sp() * 6); ctx.fill(); } } // искры
  else { smokeColumn(400, 1060, t - T0 + 1.5, E.out(win(t, T0, T0 + .6)), '60,50,50'); const pen = AK.overshoot(win(t, T0, T0 + .3)), im = AK.impact(t, T0, { squash: .22, dur: .3 }); rocketStage(STG.x - 30 + 30 * pen, STG.y - 50 + 50 * pen, STG.s, STG.rot, { fire: Math.max(0, .6 - (t - T0) * 1.5), scorch: 1 }); // входит в грунт с перелётом
    ctx.save(); ctx.translate(390, 1110); ctx.scale(im.sx, im.sy); ctx.translate(-390, -1110); dirtMound(390, 1110, 290, 110); ctx.restore(); dustRing(t, T0, 390, 1080, 1.1); debris(t, T0, 390, 1080, 22, 1); }
  ctx.restore(); flash(t, T0); }
// ───── 0:03–0:07 УАЗ несётся к дыму ─────
function uazCrew(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, Math.sin(t * 22) * 4); ctx.beginPath(); ctx.rect(-60, -200, 110, 72); ctx.rect(70, -200, 70, 72); ctx.clip();
  erasylHead(-5, -146, 40, { look: 1, smile: 1 }); ataHead(108, -144, 38, t, { look: 1 }); ctx.restore(); }
function drive(t) { const k = win(t, 3, 7); steppeSky(t, 1); ctx.save(); ctx.translate(-120 * k, 0); hills(860, '#7d5a86', 3, 160); ctx.restore(); ctx.save(); ctx.translate(-260 * k, 0); hills(900, '#9a6a4e', 7, 90); ctx.restore(); steppeGround(930, t);
  smokeColumn(860, 900, t + 3, 1, '60,50,50'); rocketStage(880, 930, .22, Math.PI + .5, { scorch: 1 }); // дым над местом падения
  ctx.strokeStyle = 'rgba(255,240,210,.45)'; ctx.lineWidth = 5; for (let i = 0; i < 12; i++) { const yy = 1180 + i * 50, x0 = ((i * 397 - t * 2600) % 1500 + 1500) % 1500 - 200; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + 180, yy); ctx.stroke(); } // скорость
  const x = lerp(400, 560, E.io(k)); dustTrail(x - 400, 1110, t); uaz(x, 1130, 2.2, t); uazCrew(x, 1130, 2.2, t); }
// ───── 0:07–0:12 кратер, ступень, из трещины торчит ящик ─────
function craterScene(t, figures = 1) { const settle = t > 9.6 ? Math.sin((t - 9.6) * 30) * .01 * Math.exp(-(t - 9.6) * 3) : 0; steppe(t, { horizon: 760 });
  ctx.fillStyle = '#5a3d20'; ctx.beginPath(); ctx.ellipse(540, 1050, 520, 180, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a2614'; ctx.beginPath(); ctx.ellipse(540, 1070, 420, 130, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 7; for (const [a2, l] of [[.3, 300], [1.2, 260], [2.4, 320], [3.4, 280], [4.6, 300], [5.6, 240]]) { ctx.beginPath(); ctx.moveTo(540, 1060); let x = 540, y = 1060; for (let q = 1; q <= 4; q++) { x += Math.cos(a2 + q * .2) * l / 4; y += Math.sin(a2 + q * .2) * l / 4 * .4; ctx.lineTo(x, y); } ctx.stroke(); }
  smokeColumn(660, 820, t, .8); rocketStage(660, 760, .95, .7 + settle, { scorch: 1 }); dirtMound(560, 1010, 230, 70, '#4a3018');
  ctx.save(); ctx.translate(330, 990); ctx.rotate(-.18); crate(0, 0, .62, { snowK: .45 }); ctx.restore(); dirtMound(300, 1085, 190, 40, '#4a3018'); // ящик выбило из грунта
  if (figures) { erasyl(860, 1145, .85, t, { look: -1 }); ata(985, 1150, .8, t, { look: -1 }); } }
// ───── 0:12–0:16 трафарет крупно, рука смахивает снег ─────
function groundClose(t) { ctx.fillStyle = '#4a3018'; ctx.fillRect(-200, -200, W + 400, H + 400); const r = seeded(5); ctx.fillStyle = 'rgba(242,245,247,.85)'; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.ellipse(r() * W, r() * H, 60 + r() * 160, 20 + r() * 30, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 40; i++) { circle(r() * W, r() * H, 6 + r() * 14); ctx.fill(); } }
function stencil(t) { groundClose(t); const sk = 1 - E.io(win(t, 12.5, 14.8)); ctx.save(); ctx.translate(540, 790); ctx.rotate(-.05); crate(0, 0, 2.5, { snowK: sk }); ctx.restore();
  const ex = 540 + 2.5 * (-200 + 400 * (1 - sk)), out = E.io(win(t, 14.8, 15.4)); hand(ex + 60 + out * 500, 800 + Math.sin(t * 14) * 30 + out * 300, -.5, 1.1); // рука у края снега
  if (sk > 0 && sk < 1) { const rr2 = seeded(Math.floor(t * 20)); ctx.fillStyle = 'rgba(242,245,247,.9)'; for (let i = 0; i < 14; i++) { circle(ex + 40 + rr2() * 200, 620 + rr2() * 340, 5 + rr2() * 10); ctx.fill(); } } }
// ───── 0:16–0:21 ящик открывается: внутри промороженная сфера ─────
function crateOpen(t) { groundClose(t); dim(.25); const op = E.out(win(t, 16.3, 17.3)), cy = 840, top = cy - 120 * 1.9;
  if (op > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, top + 4); ctx.clip(); sphere(540, lerp(top + 220, top - 60, op), 190, t, op); ctx.restore(); // сфера показывается над краем
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = -3; i <= 3; i++) { ctx.fillStyle = `rgba(155,231,255,${.12 * op})`; ctx.beginPath(); ctx.moveTo(540 + i * 90, top); ctx.lineTo(540 + i * 230 - 70, top - 900); ctx.lineTo(540 + i * 230 + 70, top - 900); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  crate(540, cy, 1.9, { open: op }); fog(540, top + 30, t, op, -1, 1.2); fog(540, top + 30, t + 1.3, op, 1, 1.2); }
function sphereTop(t) { ctx.fillStyle = '#2b1e14'; ctx.fillRect(-200, -200, W + 400, H + 400); rr(90, 360, 900, 840, 20); fillOL('#5b4a3a', 8); rr(140, 410, 800, 740, 12); ctx.fillStyle = '#120c08'; ctx.fill(); // ящик сверху
  ctx.save(); rr(140, 410, 800, 740, 12); ctx.clip(); FrostOverlay(.7, { x: 140, y: 410, w: 800, h: 740 }, 'edges', 17); sphere(540, 780, 300, t, 1); ctx.restore(); fog(540, 760, t, .9, -1, 1.4); fog(540, 760, t + 1.7, .9, 1, 1.4); }
// ───── 0:21–0:24,6 туман в лицо: кашель, вдох, щёки надуты ─────
function faceBg(t) { steppe(t, { horizon: 1250 }); ctx.save(); ctx.globalAlpha = .6; smokeColumn(820, 1200, t, 1); ctx.restore(); dim(.15); }
function inhale(t) { const [hx0, hy0, hr0] = AK.handheld(t, 9, 6); ctx.translate(hx0, hy0); ctx.rotate(hr0); faceBg(t); const cough = t > 21.7 && t < 23.7, jx = cough ? Math.sin(t * 40) * 10 : 0, gasp = t >= 23.7 && t < 24.15, puff = t >= 24.15;
  erasyl(540 + jx, 1909, 3.1, t, { cough, gasp: gasp ? (t - 23.7) : 0, puff: puff ? 1 : 0, eyes: puff ? 1.3 : cough ? .4 : gasp ? 1.4 : 1, strain: cough || puff });
  const fk = E.out(win(t, 21, 21.8)) * (1 - win(t, 23.9, 24.25)), fx = lerp(-100, 540, fk), fy = lerp(1300, 820, fk); // облако тумана летит в лицо, на вдохе втягивается
  for (let i = 0; i < 9; i++) { const a = i * .7 + t * 1.3, r0 = 60 + i * 16; ctx.fillStyle = `rgba(190,238,255,${.13 * (fk > 0 ? 1 : 0) * (1 - win(t, 23.9, 24.25))})`; circle(fx + Math.cos(a) * 180 - 120, fy + Math.sin(a) * 110 + 140, r0 + 60); ctx.fill(); } } // туман клубится у рта, лицо видно
// ───── 0:24,6–0:31,6 сила: всё потеряло вес ─────
const ITEMS = [[300, 1125, 'rock', 40, .1], [385, 1140, 'bolt', 34, .5], [660, 1138, 'plate', 52, .8], [730, 1118, 'rock', 30, .3], [440, 1100, 'bolt', 26, .9], [600, 1090, 'rock', 24, .6], [230, 1030, 'plate', 44, .2], [790, 1060, 'bolt', 30, .45], [530, 1150, 'rock', 46, .7], [170, 1110, 'rock', 34, .35], [880, 1140, 'plate', 38, .65]];
const HAT0 = [860, 590], HAT1 = [700, 440];
function hatPos(t) { const k = E.io(win(t, ON + .3, OFF)), d = AK.drop(win(t, OFF, OFF + .8), 2); const x = lerp(HAT0[0], HAT1[0], k), y = lerp(HAT0[1], HAT1[1], k); return [lerp(x, 760, d), lerp(y, 1130, d), lerp(0, 2.4, k) * (1 - d) + d * .3]; }
function powerWide(t) { const on = t < OFF, lift = win(t, ON + .1, ON + 1.6), drop = on ? 0 : win(t, OFF, OFF + .7), [sx, sy] = shake(t, OFF, 34, 6);
  ctx.save(); ctx.translate(sx, sy); craterScene(on ? ON : t, 0); dim(.1); glow(330, 960, 170, 'rgba(155,231,255,.5)');
  const aLift = on ? E.out(lift) * 36 : 36 * (1 - AK.drop(win(t, OFF, OFF + .45), 1)); ata(860, 1135 - aLift, 1.2, t, { hat: false, look: -1, reach: on ? 1 : 0 });
  const [hx, hy, hr] = hatPos(t); tubeteika(hx, hy, 90, hr);
  erasyl(520, 1135, 1.35, t, { lean: on ? 0 : .14 * Math.sin(win(t, OFF, OFF + .9) * Math.PI) * (1 - win(t, OFF + .9, OFF + 2) * .5), puff: on ? 1 : 0, gasp: on ? 0 : t - OFF + .01, red: on ? .45 * win(t, ON, OFF) : 0, eyes: on ? 1.25 : 1.4, strain: on });
  FloatObjects(t, ITEMS, lift, drop); if (!on) { for (const [x, y] of ITEMS) dustRing(t, OFF + .3, x, y + 10, .25); ctx.save(); ctx.globalAlpha = 1 - win(t, OFF, OFF + 1); fog(520, 720, t, 1, 1, .8); ctx.restore(); snow(t, .7, 10); } // выдох облаком, снег снова падает
  if (on) { frozenSnow(t, 1); VacuumBubble(t, 520, 800, 440, E.out(win(t, ON, ON + .25))); }
  ctx.restore(); if (!on) flash(t, OFF, .7); }
function powerAta(t) { craterScene(ON, 0); dim(.15); cam(1.45, 790, 560, () => { ata(860, 1135 - 36, 1.2, t, { hat: false, look: -1, reach: 1 }); const [hx, hy, hr] = hatPos(t); tubeteika(hx, hy, 90, hr);
    FloatObjects(t, ITEMS, 1); }, -230, 260); frozenSnow(t, 1); VacuumBubble(t, -200, 820, 1100, 1); }
function powerFace(t) { const [hx0, hy0, hr0] = AK.handheld(t, 9, 9); ctx.translate(hx0, hy0); ctx.rotate(hr0); faceBg(ON); const red = lerp(.45, 1, win(t, 29.6, 31.4)), j = win(t, 30.4, 31.6) * Math.sin(t * 50) * 8;
  erasyl(540 + j, 2203, 3.7, t, { puff: 1, red, eyes: 1.3 + .1 * Math.sin(t * 9), strain: 1 });
  ctx.fillStyle = 'rgba(200,240,255,.9)'; for (const [x0, y0, ph] of [[300, 560, 0], [790, 600, .5]]) { const yy = y0 + ((t * 60 + ph * 100) % 120); ctx.beginPath(); ctx.ellipse(x0, yy, 12, 18, 0, 0, Math.PI * 2); ctx.fill(); } // пот висит в невесомости
  frozenSnow(t, 1); VacuumBubble(t, 540, 760, 470, 1); }
// ───── 0:35,5–0:39 задыхается на коленях (правило 7) ─────
function vapor(x, y, t, period = .7) { const ph = (t % period) / period; ctx.fillStyle = `rgba(242,245,247,${.55 * (1 - ph)})`; for (let i = 0; i < 4; i++) { circle(x + ph * 90 + i * 16, y - ph * 40 + i * 6, 18 + ph * 50 + i * 6); ctx.fill(); } }
function gasping(t) { const [hx0, hy0, hr0] = AK.handheld(t, 9, 7); ctx.translate(hx0, hy0); ctx.rotate(hr0); craterScene(t, 0); dim(.2); const bob = Math.sin(t * 9) * 8; erasyl(540, 1145 + bob * .3, 1.8, t, { kneel: 1, handsKnees: 1, gasp: t, eyes: .6 + .2 * Math.sin(t * 9) });
  vapor(560, 1145 - 330 * 1.8 + 80 * .47 * 1.8 + bob * .3, t); snow(t, .8, 10); }
// ───── 0:39–0:44 Ата на коленях смотрит на ящик ─────
function ataKneel(t) { craterScene(t, 0); dim(.15); ctx.save(); ctx.globalAlpha = .55; erasyl(120, 1010, .6, t, { kneel: 1, handsKnees: 1, gasp: t }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1040 - 120 * .8 + 4); ctx.clip(); sphere(790, 955, 85, t, 1); ctx.restore(); crate(790, 1040, .8, { open: 1 });
  ata(360, 1145, 1.7, t, { mouth: AK.mouth(t, window.VO_MOUTH && VO_MOUTH.e1s11, VO_AT.e1s11), kneel: 1, look: 1, reach: E.io(win(t, 41.5, 42.6)) > .5 ? 1 : 0 }); snow(t, .8, 60); }
// ───── 0:44–0:49 в глазах деда отражается сфера ─────
function ataEyes(t) { ctx.fillStyle = '#1a2230'; ctx.fillRect(-200, -200, W + 400, H + 400); glow(540, 900, 900, 'rgba(155,231,255,.18)'); const rf = E.out(win(t, 44.3, 45.4));
  ataHead(540, 930, 580, t, { reflect: rf, look: .4 }); for (const s2 of [-1, 1]) { const ex = 540 + s2 * 580 * .32 + .4 * 580 * .1, ey = 930 + 580 * .02; glow(ex, ey, 90, `rgba(155,231,255,${.6 * rf})`); ctx.save(); ctx.globalAlpha = rf; const g = ctx.createRadialGradient(ex - 8, ey - 8, 2, ex, ey, 30); g.addColorStop(0, '#e9fbff'); g.addColorStop(.6, '#7fd6ef'); g.addColorStop(1, '#2a7c9a');
    circle(ex, ey, 30 * (1 + .06 * Math.sin(t * 2.2))); ctx.fillStyle = g; ctx.fill(); ctx.fillStyle = '#fff'; circle(ex - 10, ey - 12, 6); ctx.fill(); ctx.restore(); } } // в каждом глазу — маленькая пульсирующая сфера
// ───── 0:49–0:55,5 на гребне — Гептил ─────
function ridge(t) { steppeSky(t, 1); dim(.12); hills(1000, '#5d3f5e', 11, 100); ctx.fillStyle = '#2a1e2a'; ctx.beginPath(); ctx.moveTo(-50, H); ctx.lineTo(-50, 1180); ctx.quadraticCurveTo(300, 1060, 620, 1120); ctx.quadraticCurveTo(900, 1170, 1130, 1260); ctx.lineTo(1130, H); ctx.closePath(); ctx.fill(); // гребень против солнца
  glow(640, 760, 520, 'rgba(255,107,26,.18)'); heptyl(640, 1130, 1.5, t, { binoc: E.io(win(t, 49.6, 50.6)) }); }
function heptylClose(t) { steppeSky(t, 1); dim(.35); glow(540, 700, 600, 'rgba(255,107,26,.22)'); heptyl(560, 2096, 3.2, t, {}); for (const sx of [-1, 1]) glow(560 + sx * 62 * 3.2, 2096 - 390 * 3.2, 110, `rgba(255,107,26,${.35 + .15 * Math.sin(t * 3)})`); }

// ───── голос (черновой синтез Piper) и субтитры по пословным меткам из tools/words.py ─────
const VO_AT = { e1s01: 0.05, e1s02: 3.2, e1s03: 7.3, e1s04: 12.3, e1s05: 16.5, e1s09: 32.2, e1s11: 39.6, e1s12: 44.5, e1s13: 50.7 };
const VO_GAIN = { e1s01: 4.6, e1s02: 4.2, e1s04: 3.4, e1s05: 3.8, e1s11: 3.4, e1s12: 3.9, e1s13: 4.0 };
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);
const CAPS = buildCaptions([
  [0.0, 3.0, 'В нашу степь **падает небо**. Раз в месяц', { times: VT('e1s01'), whole: true, size: 60, maxW: 900 }],
  [3.0, 7.0, 'Мы приезжаем первыми. Металл — это **деньги**', { times: VT('e1s02') }],
  [7.0, 12.0, 'Но в этот раз ступень **выбила из земли** что-то старое', { times: VT('e1s03') }],
  [12.0, 16.0, '«Объект ноль». **Тридцать восемь лет** под землёй', { times: VT('e1s04') }],
  [16.0, 21.0, 'Внутри было что-то, что **дышало**', { times: VT('e1s05') }],
  [25.0, 29.4, 'Всё **потеряло вес**', { title: true, times: [25.0, 25.45, 25.9] }],
  [32.0, 35.5, 'Я выдохнул — и всё **рухнуло**', { times: VT('e1s09') }],
  [39.5, 44.0, 'Я **закопал** его в 1988-м', { times: VT('e1s11'), speaker: 'ata' }],
  [44.4, 49.0, 'Дед знал эту **коробку**', { times: VT('e1s12') }],
  [50.6, 53.2, 'И не только **дед**', { times: VT('e1s13') }],
], { tail: .3 });
CAPS[0].words.forEach(w => w.t = Math.min(w.t, 1.4)); CAPS[0].a = 0; // хук: виден с первого кадра и дочитан к 1,4 с
window.CAPTION_PHRASES = CAPS;

// ───── сцены: [начало, конец, id, рисование, hud] ─────
const H0 = t => hudBase(t);
const SC = [
  [0, 3, 'e1s01', t => push(t, 0, 3, () => fall(t), 540, 900, 1, 1.08), H0],
  [3, 7, 'e1s02', t => push(t, 3, 7, () => drive(t), 540, 1000, 1, 1.06), H0, 'whip'],
  [7, 9.6, 'e1s03a', t => push(t, 7, 9.6, () => craterScene(t), 540, 950, 1, 1.06), H0],
  [9.6, 12, 'e1s03b', t => cam(lerp(1.9, 2.2, E.io(win(t, 9.6, 12))), 330, 990, () => craterScene(t), 210, -190), H0, 'none'], // наезд на ящик в трещине — склейка «в движении»
  [12, 16, 'e1s04', t => push(t, 12, 16, () => stencil(t), 540, 790, 1, 1.08), H0],
  [16, 18.5, 'e1s05a', t => push(t, 16, 18.5, () => crateOpen(t), 540, 780, 1, 1.08), H0],
  [18.5, 21, 'e1s05b', t => push(t, 18.5, 21, () => sphereTop(t), 540, 780, 1, 1.1), H0],
  [21, ON, 'e1s06', t => push(t, 21, ON, () => inhale(t), 540, 720, 1, 1.12), t => ({ ...H0(t), dem: t > 24.15 ? 0 : null })],
  [ON, 27.4, 'e1s07a', t => push(t, ON, 27.4, () => powerWide(t), 520, 820, 1, 1.08), t => ({ ...H0(t), dem: t - ON }), 'none'],
  [27.4, 29.6, 'e1s07b', t => push(t, 27.4, 29.6, () => powerAta(t), 700, 700, 1, 1.08), t => ({ ...H0(t), dem: t - ON })],
  [29.6, OFF, 'e1s08', t => push(t, 29.6, OFF, () => powerFace(t), 540, 760, 1, 1.1), t => ({ ...H0(t), dem: Math.min(t - ON, OFF - ON - .001), alert: t > 30.6 ? .5 + .5 * Math.sin(t * 14) : 0 })],
  [OFF, 35.5, 'e1s09', t => push(t, OFF + .3, 35.5, () => powerWide(t), 520, 820, 1, 1.1), t => ({ ...H0(t), record: t < 34.6 ? mmss(RECORDS[EP]) : null }), 'none'],
  [35.5, 39, 'e1s10', t => push(t, 35.5, 39, () => gasping(t), 540, 800, 1, 1.08), H0],
  [39, 44, 'e1s11', t => push(t, 39, 44, () => ataKneel(t), 560, 800, 1, 1.08), H0],
  [44, 49, 'e1s12', t => push(t, 44, 49, () => ataEyes(t), 560, 940, 1.25, 1.5), H0],
  [49, 52.4, 'e1s13a', t => push(t, 49, 52.4, () => ridge(t), 640, 800, 1, 1.08), H0],
  [52.4, 55.5, 'e1s13b', t => push(t, 52.4, 55.5, () => heptylClose(t), 560, 720, 1, 1.1), H0],
  [55.5, 58.01, 'e1s14', t => EndCard(t, 55.5, 'Когда я не дышу — мир теряет вес', 'ЧАСТЬ 2 →'), null],
];
function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud, cutKind] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore(); if (i > 0) AK.cut(t, a, cutKind || 'dip');
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(1, t); KineticCaption(t, CAPS); }

// ───── звук: CC0-библиотеки и синтез; фирменный звук силы — duck + keep (сердце и 8 кГц) ─────
const RIFF = 'projects/tynys/assets/riff.wav', BED = 'projects/tynys/assets/bed-ep1.wav';
const beats = (() => { const out = []; let t = ON + .2; while (t < OFF - .05) { out.push(+t.toFixed(3)); t += lerp(.95, .38, (t - ON) / (OFF - ON)); } return out; })(); // сердце ускоряется
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/tynys/assets/vo/ep1/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 0, type: 'lib', id: 'bass-rumble-long', gain: .25 }, { t: 0, type: 'engine', dur: 2.3, gain: .1, pitch: .7 }, { t: 1.6, type: 'lib', id: 'whoosh-slow-hard', gain: .4 }, // далёкий рёв
  { t: 2.2, type: 'lib', id: 'impact-deep-hard', gain: 1.0 }, { t: 2.2, type: 'lib', id: 'cinematic-thunder-big', gain: .35 },                                        // удар
  { t: 3, type: 'file', path: RIFF, gain: .17, dur: 4.2 }, { t: 3, type: 'engine', dur: 4, gain: .07, pitch: 1.4 }, { t: 3, type: 'tires', dur: 4, gain: .03 },     // мотор, рифф домбры
  { t: 7, type: 'wind', dur: 17.6, gain: .07 }, { t: 7, type: 'file', path: BED, gain: .09, dur: 17.6 },
  { t: 9.6, type: 'lib', id: 'bsb-metal-gate-creak', gain: .45, align: 'start', dur: 1.9 },                                                                           // скрип металла
  { t: 12.6, type: 'lib', id: 'swish-soft', gain: .5 }, { t: 13.3, type: 'lib', id: 'swish-medium', gain: .4 }, { t: 14.1, type: 'lib', id: 'swish-soft', gain: .4 }, // снег смахивают
  { t: 16.3, type: 'lib', id: 'bsb-door-creak-open', gain: .45, align: 'start', dur: 1.2 }, { t: 16.8, type: 'hiss', dur: 4.2, lo: 3000, hi: 9000, gain: .05, attack: .6, pulse: .35 }, // крышка, шипение инея
  { t: 17.85, type: 'heartbeat', gain: .3, pitch: .6 }, { t: 20.71, type: 'heartbeat', gain: .3, pitch: .6 }, { t: 18.6, type: 'lib', id: 'bsb-ice-crack-1', gain: .35, align: 'start', dur: 1.2 }, // пульс сферы
  { t: 21.1, type: 'lib', id: 'whoosh-medium-soft', gain: .5 }, { t: 21.75, type: 'lib', id: 'bsb-cough-man', gain: .8, align: 'start', dur: 1.95 },
  { t: 23.75, type: 'breath_in', dur: .45, gain: .7 },                                                                                                                 // резкий вдох
  { t: ON, type: 'duck', dur: OFF - ON, db: -30, ramp: .2, lp: 500 },                                                                                                  // звук пропадает
  ...beats.map(t => ({ t, type: 'heartbeat', gain: .9, keep: true })), { t: ON, type: 'tone', freq: 8000, dur: OFF - ON, gain: .035, keep: true },                     // остаются сердце и 8 кГц
  { t: OFF, type: 'lib', id: 'impact-deep-hard', gain: 1.0 }, { t: OFF, type: 'lib', id: 'cinematic-metal-big', gain: .7 }, { t: OFF + .25, type: 'lib', id: 'impact-heavy-firm', gain: .5 }, { t: OFF + .32, type: 'lib', id: 'impact-heavy-firm', gain: .4, rate: 1.2 }, // мир возвращается ударом, лязг
  { t: OFF + .1, type: 'lib', id: 'bsb-breathless-man', gain: .75, align: 'start', dur: 7.2 }, { t: OFF, type: 'wind', dur: 21.4, gain: .07 }, { t: 35.5, type: 'file', path: BED, gain: .08, from: 17.6, dur: 17.4 },
  { t: 39, type: 'lib', id: 'bsb-wind-strong-outside', gain: .22, align: 'start', dur: 5 },                                                                           // ветер
  { t: 44, type: 'hum', dur: 5, gain: .06, pitch: .5 },                                                                                                                // низкий гул
  { t: 49.7, type: 'hiss', dur: .9, lo: 1500, hi: 7000, gain: .22 }, { t: 51.6, type: 'hiss', dur: .7, lo: 1500, hi: 7000, gain: .14 }, { t: 52.5, type: 'hiss', dur: .6, lo: 1500, hi: 7000, gain: .22 }, // клапан
  // 53,2–55,5 — тишина перед финальной фразой
  { t: 55.5, type: 'file', path: RIFF, gain: .34, from: 4.8, dur: 2.5 }, { t: 55.5, type: 'lib', id: 'impact-deep-firm', gain: .4 },                                 // рифф на карточке
];
// ───── раскадровка для storyboard/ep1.json (схема «Счётчика») ─────
window.STORYBOARD = { episode: EP, title: 'Ступень', duration: DUR, hud: { place: 'ҰЛЫТАУ', temp: '−12°', record: mmss(RECORDS[EP]) },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), vo: c.length ? { speaker: id === 'e1s11' ? 'ata' : c[0].title ? 'title' : 'erasyl', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: +s.t.toFixed(2) })), hud: h ? { time: h.time, dem: h.dem == null ? null : mmss(h.dem), record: h.record || null } : null,
      overlays: a === 0 ? ['PartSticker:1'] : id === 'e1s14' ? ['EndCard'] : /e1s0[78]/.test(id) ? ['VacuumBubble', 'FloatObjects'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
