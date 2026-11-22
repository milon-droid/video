// Комната уровня k (она же внутренность коробки уровня k−1). Всё — функция τ = t + 3k.
const KRAFT = ink(.36, .12, .62), KRAFT_D = ink(.5, .22, .8), KRAFT_L = ink(.26, .07, .48);
let FLAP_OVERRIDE = null;   // (k, t) → угол дверцы или null

function branchFor(k, t) {
  if (k <= 0 || t >= 17.85) return 'B';
  if (t < 17.5) return 'A';
  return Math.floor(t * 30) % 2 ? 'A' : 'B';          // будущее переписывается — мерцание
}

function drawWall(ctx, tau) {
  ctx.fillStyle = ink(.15, .02, .13); ctx.fillRect(0, 0, W, 1465);
  for (let x = 30; x < W; x += 96) { ctx.fillStyle = ink(.22, .03, .2); ctx.fillRect(x, 0, 38, 1440); }
  const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, ink(.04, .16, .02)); g.addColorStop(1, ink(0, 0, 0));
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = ink(.5, .2, .65); ctx.fillRect(0, 1435, W, 32);
  ctx.fillStyle = ink(.34, .1, .62); ctx.fillRect(0, 1467, W, H - 1467);
  for (let i = 0, y = 1480; y < H; i++, y += 34 + i * 9) { ctx.fillStyle = ink(.52, .26, .8); ctx.fillRect(0, y, W, 6); }
  // окно
  rr(ctx, 70, 160, 360, 500, 10); fill(ctx, WOOD); stroke(ctx, 7);
  ctx.fillStyle = ink(.35, .95, .12); ctx.fillRect(92, 182, 316, 456);
  for (let i = 0; i < 14; i++) { const x = 100 + hash(i) * 300, y = 190 + hash(i + 30) * 230, r = 3 + hash(i + 7) * 4 * (.7 + .3 * Math.sin(tau * 3 + i));
    star(ctx, x, y, r * 2); fill(ctx, ink(0, 0, 1)); }
  ctx.beginPath(); ctx.arc(330, 268, 46, 0, 7); fill(ctx, ink(.05, 0, 1));
  ctx.beginPath(); ctx.arc(348, 256, 40, 0, 7); fill(ctx, ink(.35, .95, .12));
  for (let i = 0; i < 7; i++) { const x = 92 + i * 46, h = 120 + hash(i + 3) * 170;
    ctx.fillStyle = ink(.62, 1, .5); ctx.fillRect(x, 638 - h, 44, h);
    for (let j = 0; j < 6; j++) if (hash(i * 9 + j) > .45) { ctx.fillStyle = ink(.1, 0, 1); ctx.fillRect(x + 8 + (j % 2) * 16, 638 - h + 16 + Math.floor(j / 2) * 34, 10, 14); } }
  ctx.fillStyle = WOOD; ctx.fillRect(244, 182, 12, 456); ctx.fillRect(92, 404, 316, 12);
  // штора
  ctx.beginPath(); ctx.moveTo(40, 140); ctx.quadraticCurveTo(150, 400, 70, 690); ctx.lineTo(40, 690); ctx.closePath(); fill(ctx, ink(.75, .05, .25)); stroke(ctx, 6);
  // часы: секундная стрелка — время этого уровня
  const cx = 945, cy = 250, sec = Math.floor(tau) + Math.min(1, E.back(clamp((tau - Math.floor(tau)) / .14)));
  ctx.beginPath(); ctx.arc(cx, cy, 66, 0, 7); fill(ctx, ink(.1, .9, .1)); stroke(ctx, 6);
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, 7); fill(ctx, PAPER);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); ctx.lineTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50); stroke(ctx, 4); }
  const hand = (a, l, w, c) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); stroke(ctx, w, c); };
  hand(-.6, 30, 7, OUT); hand(.9 + tau / 600, 42, 5, OUT); hand(sec * Math.PI / 30, 46, 3, ink(1, 0, .3));
  // полка
  ctx.fillStyle = WOOD; ctx.fillRect(560, 470, 330, 20); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.strokeRect(560, 470, 330, 20);
  for (const x of [600, 850]) { ctx.beginPath(); ctx.moveTo(x, 490); ctx.lineTo(x, 540); ctx.lineTo(x + 30, 490); fill(ctx, WOOD_D); stroke(ctx, 4); }
  [[790, 92, ink(.9, .1, .2)], [816, 108, ink(0, .8, .3)], [842, 86, ink(.2, .1, 1)], [864, 100, ink(.6, .9, .2)]].forEach(([x, h, c]) => { ctx.fillStyle = c; ctx.fillRect(x, 470 - h, 24, h); ctx.strokeRect(x, 470 - h, 24, h); });
  // лампа на столе слева
  ctx.beginPath(); ctx.moveTo(232, 1300); ctx.lineTo(232, 1080); stroke(ctx, 16); stroke(ctx, 8, ink(.2, .2, .2));
  ctx.beginPath(); ctx.ellipse(232, 1300, 50, 12, 0, 0, 7); fill(ctx, ink(.2, .7, .1)); stroke(ctx, 5);
  ctx.beginPath(); ctx.moveTo(180, 1080); ctx.lineTo(285, 1080); ctx.lineTo(262, 1000); ctx.lineTo(202, 1000); ctx.closePath(); fill(ctx, ink(.6, 0, 1)); stroke(ctx, 6);
  ctx.globalCompositeOperation = 'multiply';
  const lg = ctx.createRadialGradient(232, 1090, 10, 232, 1150, 300); lg.addColorStop(0, ink(.55, .2, 1)); lg.addColorStop(1, ink(1, 1, 1));
  ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(185, 1080); ctx.lineTo(280, 1080); ctx.lineTo(470, 1320); ctx.lineTo(0, 1320); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function drawPot(ctx, ps, br, tau) {
  const body = (x, y, a, broken) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    if (!broken) for (const [lx, ly, r] of [[-26, -128, -.5], [4, -150, .1], [30, -122, .6], [-6, -112, -.1]]) {
      ctx.beginPath(); ctx.ellipse(lx, ly, 15, 40, r, 0, 7); fill(ctx, ink(0, .78, .95)); stroke(ctx, 5);
    }
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(54, broken ? -40 : -84); ctx.lineTo(-54, broken ? -30 : -84); ctx.closePath();
    fill(ctx, ink(.62, .08, .78)); stroke(ctx, 6);
    if (!broken) { rr(ctx, -60, -98, 120, 22, 6); fill(ctx, ink(.72, .14, .86)); stroke(ctx, 5); }
    ctx.restore();
  };
  if (ps.ok) { body(ps.x, ps.y, ps.a, false); return; }
  const s = ps.since, x0 = ps.x, y0 = ps.y, ground = 1300;
  // облако земли — мягкие клубы
  if (s < 1.4) for (let i = 0; i < 8; i++) {
    const r = 30 + 90 * E.out(clamp(s / 1)) * (.6 + hash(i) * .6), cx = x0 + (hash(i + 2) - .5) * 220 * E.out(clamp(s)), cy = y0 - 30 - hash(i + 5) * 130 * E.out(clamp(s));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); const al = .7 * (1 - s / 1.4);
    g.addColorStop(0, ink(.5, .38, .7, al)); g.addColorStop(1, ink(.5, .38, .7, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  }
  // куча земли, растение, донышко
  ctx.beginPath(); ctx.ellipse(x0 + 10, ground - 6, 90, 20, 0, 0, 7); fill(ctx, ink(.6, .5, .85)); stroke(ctx, 5);
  ctx.save(); ctx.translate(x0 + 70, ground - 16); ctx.rotate(1.35);
  for (const [lx, ly, r] of [[-26, -60, -.5], [4, -80, .1], [30, -55, .6]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 15, 40, r, 0, 7); fill(ctx, ink(0, .78, .95)); stroke(ctx, 5); }
  ctx.restore();
  body(x0 - 30, ground, -.2, true);
  // осколки
  for (let i = 0; i < 9; i++) {
    const vx = (hash(i * 3.3) - .5) * 900, vy = -(260 + hash(i + 9) * 520), g = 2800, land = y0 >= ground - 1 ? ground : ground;
    const tl = (-vy + Math.sqrt(vy * vy + 2 * g * (land - y0))) / g;
    let x, y, a = hash(i) * 6;
    if (s < tl) { x = x0 + vx * s; y = y0 + vy * s + .5 * g * s * s; a += s * 12; }
    else { x = x0 + vx * tl + vx * .12 * (1 - Math.exp(-(s - tl) * 7)); y = land - 8; a += tl * 12; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(14, -12); ctx.lineTo(8, 12); ctx.closePath(); fill(ctx, ink(.62, .08, .78)); stroke(ctx, 4);
    ctx.restore();
  }
}

function drawLabel(ctx, tau, a) {
  // передняя стенка в своих координатах 0..BW × 0..BH
  ctx.fillStyle = KRAFT; ctx.fillRect(0, 0, BW, BH);
  for (let y = 14; y < BH; y += 22) { ctx.fillStyle = ink(.42, .16, .68); ctx.fillRect(0, y, BW, 3); }
  if (a * BW < 40) return;                                   // мелко — без надписей
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // значок «верх»
  for (const x of [26, 46]) { ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x - 8, 36); ctx.moveTo(x, 22); ctx.lineTo(x + 8, 36); ctx.moveTo(x, 22); ctx.lineTo(x, 48); stroke(ctx, 3.5, ink(.2, .9, .1)); }
  ctx.fillStyle = ink(.2, .9, .1); ctx.font = '800 11px Inter'; ctx.fillText('ВЕРХ', 36, 58);
  rr(ctx, 22, 84, 196, 236, 8); fill(ctx, PAPER); stroke(ctx, 3);
  ctx.fillStyle = ink(.15, 1, .1); ctx.font = '900 21px Inter'; ctx.fillText('ПОСЫЛКА', 120, 108);
  ctx.font = '700 15px Inter'; ctx.textAlign = 'left';
  ctx.fillText('КОМУ:  тебе', 38, 140); ctx.fillText('ОТ:  тебя', 38, 162);
  for (let i = 0; i < 34; i++) { ctx.fillStyle = OUT; ctx.fillRect(40 + i * 4.6, 286, hash(i) > .5 ? 3 : 1.5, 22); }
  const st = (txt, x, y, r, col, size, t0) => {
    const k = 1 + .5 * Math.max(0, 1 - Math.abs(tau - t0) / .09) * (tau >= t0 ? 1 : 0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(k, k);
    ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center';
    const lines = txt.split('\n'), w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 22, h = lines.length * size * 1.05 + 14;
    rr(ctx, -w / 2, -h / 2, w, h, 6); stroke(ctx, 4.5, col);
    ctx.fillStyle = col; lines.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 8 + size * .55 + i * size * 1.05));
    ctx.restore();
  };
  st('ВНУТРИ\n— ТЫ', 122, 212, -.11, ink(1, .05, .95), 38, .15);
  st('+3 СЕК', 156, 262, .16, ink(.1, 1, .1), 24, .9);
  ctx.fillStyle = ink(.25, .9, .2); ctx.font = 'italic 600 15px Inter'; ctx.textAlign = 'center';
  ctx.fillText('P.S. не смотри вверх', 120, 372);
}

function drawBox(ctx, k, tau, t) {
  const bs = boxState(tau);
  let front = bs.front; if (FLAP_OVERRIDE) { const o = FLAP_OVERRIDE(k, t); if (o !== null) front = o; }
  const x0 = BX, y0 = BY, x1 = BX + BW, y1 = BY + BH, dx = 34, dy = -22;
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); ctx.ellipse((x0 + x1) / 2 + 30, y1 - 4, 170, 22, 0, 0, 7); ctx.fillStyle = ink(.12, .25, .1); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const f = bs.flaps;
  ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x1 + dx, y0 + dy); ctx.lineTo(x1 + dx, y1 + dy); ctx.lineTo(x1, y1); ctx.closePath(); fill(ctx, KRAFT_D); stroke(ctx, 5);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.lineTo(x1 + dx, y0 + dy); ctx.lineTo(x1, y0); ctx.closePath();
  if (f > 0) { fill(ctx, ink(.55, .5, .95)); }
  else {
    fill(ctx, KRAFT_L); stroke(ctx, 5);
    ctx.beginPath(); ctx.moveTo(x0 + dx / 2, y0 + dy / 2); ctx.lineTo(x1 + dx / 2, y0 + dy / 2); stroke(ctx, 18, ink(.12, .02, .35));
    if (bs.cut > 0) { const xc = Math.max(x0 + dx / 2, x1 + dx / 2 - bs.cut * (BW)); ctx.beginPath(); ctx.moveTo(x1 + dx / 2, y0 + dy / 2); ctx.lineTo(xc, y0 + dy / 2); stroke(ctx, 3, OUT); }
  }
  if (f > 0) {                                                             // боковые клапаны
    for (const s of [-1, 1]) {
      const hx = s < 0 ? x0 : x1, vy = s < 0 ? -30 : 80;
      ctx.beginPath(); ctx.moveTo(hx, y0); ctx.lineTo(hx + dx, y0 + dy); ctx.lineTo(hx + dx + s * (s < 0 ? 100 : 46) * f, y0 + dy + vy * f); ctx.lineTo(hx + s * (s < 0 ? 100 : 46) * f, y0 + vy * f); ctx.closePath();
      fill(ctx, KRAFT); stroke(ctx, 5);
    }
    // свет из коробки вверх
    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createLinearGradient(0, y0, 0, y0 - 420); g.addColorStop(0, ink(.5, .1, 1)); g.addColorStop(1, ink(1, 1, 1));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 + 10, y0); ctx.lineTo(x1 + dx - 10, y0 + dy); ctx.lineTo(x1 + 120, y0 - 420); ctx.lineTo(x0 - 90, y0 - 420); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  // передняя стенка
  if (front > .02) {
    const m = ctx.getTransform(), a = m.a;
    if (BW * a > 2.5) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, BW, BH); ctx.clip();
      drawLevel(ctx, k + 1, a / S, m.e + x0 * a, m.f + y0 * a, t);
      ctx.restore();
    }
    ctx.strokeStyle = KRAFT_D; ctx.lineWidth = 7; ctx.strokeRect(x0 + 3, y0 + 3, BW - 6, BH - 6);
    ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.strokeRect(x0, y0, BW, BH);
    const c = Math.cos(front);
    if (c > 0) { ctx.save(); ctx.translate(x0, y1 - BH * c); ctx.scale(1, c); drawLabel(ctx, tau, a * c); ctx.restore(); ctx.strokeStyle = OUT; ctx.strokeRect(x0, y1 - BH * c, BW, BH * c); }
    else {
      ctx.beginPath(); ctx.rect(x0, y1, BW, -BH * c); fill(ctx, KRAFT_L); stroke(ctx, 5);
      ctx.beginPath(); ctx.moveTo(x0 + 12, y1 + 10); ctx.lineTo(x1 - 12, y1 + 10); stroke(ctx, 3, KRAFT_D);
    }
  } else {
    ctx.save(); ctx.translate(x0, y0); drawLabel(ctx, tau, ctx.getTransform().a); ctx.restore();
    ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.strokeRect(x0, y0, BW, BH);
  }
}

function drawTable(ctx) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); ctx.ellipse(540, 1712, 440, 30, 0, 0, 7); ctx.fillStyle = ink(.1, .25, .1); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  for (const x of [182, 862]) { rr(ctx, x, 1400, 38, 310, 6); fill(ctx, ink(.6, .25, .85)); stroke(ctx, 6); }
  rr(ctx, 150, 1288, 780, 36, 6); fill(ctx, ink(.42, .1, .7)); stroke(ctx, 6);
  rr(ctx, 150, 1320, 780, 26, 4); fill(ctx, ink(.6, .24, .86)); stroke(ctx, 6);
  rr(ctx, 168, 1346, 744, 70, 4); fill(ctx, ink(.52, .18, .8)); stroke(ctx, 6);
}

function drawLevel(ctx, k, a, e, f, t) {
  const tau = t + DT * k, br = branchFor(k, t);
  ctx.save();
  ctx.setTransform(a, 0, 0, a, e, f);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  const [sx, sy] = shake(tau, [[16.2, 12, .7], [HIT_B, 7, .4], [13.22, 3, .3]]);
  ctx.translate(sx, sy);
  drawWall(ctx, tau);
  const P = heroPose(tau, br), G = heroGeom(P), ps = potState(tau, br);
  if (ps.ok) drawPot(ctx, ps, br, tau);
  drawChairBack(ctx); drawLegs(ctx, G, P); drawTorso(ctx, G, P); drawHead(ctx, G, P);
  if (P.dk > .05) drawArms(ctx, G, P);
  drawTable(ctx);
  if (!P.cutter) { ctx.save(); ctx.translate(tau < 3.5 ? 885 : 905, 1302); ctx.rotate(1.4); rr(ctx, -10, -40, 20, 64, 5); fill(ctx, ink(.1, 0, 1)); stroke(ctx, 4); ctx.restore(); }
  if (P.dk <= .05) drawArms(ctx, G, P);
  drawBox(ctx, k, tau, t);
  if (P.dk <= .05) drawHandsTop(ctx, G, P);
  if (!ps.ok) drawPot(ctx, ps, br, tau);
  // порыв ветра сверху
  const gu = (tau - 16.2) / .7;
  if (gu > 0 && gu < 1) for (let i = 0; i < 6; i++) {
    const y = 160 + i * 130 + gu * 260, x = -200 + gu * 1500 - i * 90;
    ctx.globalAlpha = Math.sin(gu * Math.PI);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 120, y - 40, x + 220, y + 40, x + 360, y); stroke(ctx, 8, ink(0, .55, .05));
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
