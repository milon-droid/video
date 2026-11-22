// Герой: худи, сидит за столом лицом к нам. Рисуется из частей: тело, голова (глаза/брови/рот), руки по IK.
const SKIN = ink(.3, .02, .36), SKIN_D = ink(.48, .1, .5), HOOD = ink(.12, .86, .1), HOOD_D = ink(.3, 1, .25),
  HAIR = ink(.72, .95, .7), JEANS = ink(.3, .75, .15), WOOD = ink(.5, .14, .78), WOOD_D = ink(.75, .35, .9);

function heroGeom(P) {
  const dy = P.dk * 700, hx = 680 + (P.dx || 0), hy = 1390 + dy;
  const br = Math.sin(P.t * 1.7) * 3;
  const tr = P.tremble || 0, tx = tr * 4 * Math.sin(P.t * 63), ty = tr * 3 * Math.cos(P.t * 51);
  const shY = hy - 510 + 30 * P.lean + br, shX = hx - 10 * P.lean + tx * .5;
  const hc = [hx - 30 * P.lean + tx, shY - 165 + 8 * P.lean + br * .3 + ty];
  return { dy, hx, hy, shX, shY, hc, hs: 1 + .06 * P.lean };
}

function drawChairBack(ctx) {
  rr(ctx, 540, 1010, 280, 300, 26); fill(ctx, WOOD); stroke(ctx, 6);
  rr(ctx, 575, 1045, 210, 40, 10); fill(ctx, WOOD_D);
  for (const x of [568, 792]) { ctx.beginPath(); ctx.moveTo(x, 1420); ctx.lineTo(x, 1705); stroke(ctx, 22, OUT); ctx.beginPath(); ctx.moveTo(x, 1420); ctx.lineTo(x, 1700); stroke(ctx, 12, WOOD); }
}

function drawLegs(ctx, G, P) {
  if (P.dk > .25) return;
  for (const s of [-1, 1]) {
    const x = G.hx + s * 58;
    ctx.beginPath(); ctx.moveTo(x, 1440); ctx.lineTo(x + s * 6, 1668); stroke(ctx, 72); stroke(ctx, 60, JEANS);
    ctx.beginPath(); ctx.ellipse(x + s * 14, 1690, 52, 24, 0, 0, 7); fill(ctx, PAPER); stroke(ctx, 6);
    ctx.beginPath(); ctx.moveTo(x + s * 14 - 30, 1694); ctx.lineTo(x + s * 14 + 30, 1694); stroke(ctx, 7, ink(1, 0, .2));
  }
}

function drawTorso(ctx, G, P) {
  const { hx, hy, shX, shY, hc } = G;
  // шея
  rr(ctx, hc[0] - 30, hc[1] + 60, 60, shY - hc[1] - 50, 14); fill(ctx, SKIN_D);
  // худи
  ctx.beginPath();
  ctx.moveTo(hx - 118, hy + 60);
  ctx.bezierCurveTo(hx - 128, hy - 120, shX - 150, shY + 40, shX - 112, shY - 6);
  ctx.quadraticCurveTo(shX, shY - 34, shX + 112, shY - 6);
  ctx.bezierCurveTo(shX + 150, shY + 40, hx + 128, hy - 120, hx + 118, hy + 60);
  ctx.closePath(); fill(ctx, HOOD); stroke(ctx, 7);
  // складки и тень под грудью
  ctx.beginPath(); ctx.moveTo(shX - 70, shY + 150); ctx.quadraticCurveTo(shX - 40, shY + 175, shX - 10, shY + 160); stroke(ctx, 5, HOOD_D);
  ctx.beginPath(); ctx.moveTo(shX + 60, shY + 210); ctx.quadraticCurveTo(shX + 85, shY + 230, shX + 100, shY + 205); stroke(ctx, 5, HOOD_D);
  // капюшон-воротник
  ctx.beginPath(); ctx.moveTo(shX - 82, shY - 4); ctx.quadraticCurveTo(shX, shY + 64, shX + 82, shY - 4);
  ctx.quadraticCurveTo(shX, shY + 26, shX - 82, shY - 4); fill(ctx, HOOD_D); stroke(ctx, 5);
  // шнурки
  const sw = Math.sin(P.t * 2.3) * 4 + (P.wind || 0) * 18;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(shX + s * 26, shY + 26); ctx.quadraticCurveTo(shX + s * 30 + sw * .5, shY + 70, shX + s * 24 + sw, shY + 112); stroke(ctx, 5, ink(0, .2, .05));
    rr(ctx, shX + s * 24 + sw - 6, shY + 108, 12, 22, 4); fill(ctx, ink(.9, .1, 1)); stroke(ctx, 3);
  }
}

function drawHead(ctx, G, P) {
  const [cx, cy] = G.hc, u = P.headUp || 0, fy = -30 * u;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(P.tilt || 0);
  const sq = P.squash || 0; ctx.scale(G.hs * (1 + sq * .1), G.hs * (1 - sq * .16));
  // уши
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 106, 10 + fy * .4, 22, 28, 0, 0, 7); fill(ctx, SKIN); stroke(ctx, 6); }
  // лицо
  ctx.beginPath(); ctx.ellipse(0, 0, 108, 120, 0, 0, 7); fill(ctx, SKIN); stroke(ctx, 7);
  if (u > .05) { ctx.beginPath(); ctx.ellipse(0, 112, 70 * u, 14 * u, 0, 0, 7); fill(ctx, SKIN_D); }
  // волосы
  const fr = -52 + fy * .9, wd = (P.wind || 0) * 30;
  ctx.beginPath(); ctx.moveTo(-116, 22 + fy * .5);
  ctx.bezierCurveTo(-130, -120 + fy * .3, -40, -150, 10, -146);
  ctx.bezierCurveTo(80, -146, 136, -100, 116, 22 + fy * .5);
  const tufts = 9;
  for (let i = 0; i <= tufts; i++) {
    const x = 110 - i * 220 / tufts, y = fr + (i % 2 ? -18 : 6) + (i === 0 || i === tufts ? 40 : 0);
    ctx.lineTo(x + wd * (i % 2), y);
  }
  ctx.closePath(); fill(ctx, HAIR); stroke(ctx, 6);
  // вихры
  for (const [x, a] of [[-20, -.5], [10, .2], [36, .7]]) {
    ctx.beginPath(); ctx.moveTo(x, -140); ctx.quadraticCurveTo(x + 10 + wd, -186, x + 40 * Math.sin(a) + wd * 1.5, -196 + Math.abs(a) * 20); stroke(ctx, 14, HAIR);
  }
  if (P.soil) for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-60 + i * 20, -136 + (i % 3) * 8, 16, 11, i, 0, 7); fill(ctx, ink(.6, .5, .85)); }
  // румянец
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 64, 36 + fy, 18, 0, 7); fill(ctx, ink(.55, 0, .12, .8)); }
  // глаза
  const op = clamp(P.eyeOpen * blink(P.t)), wide = P.wide || 0;
  for (const s of [-1, 1]) {
    const ex = s * 40, ey = -2 + fy, rx = 24 + wide * 3, ry = 28 * (1 + .18 * wide);
    if (P.dizzy) {
      ctx.beginPath(); for (let a = 0; a < 12; a += .3) ctx.lineTo(ex + Math.cos(a + P.t * 9 * s) * a * 1.9, ey + Math.sin(a + P.t * 9 * s) * a * 1.9); stroke(ctx, 5);
    } else if (op < .14) {
      ctx.beginPath(); ctx.moveTo(ex - rx, ey + 2); ctx.quadraticCurveTo(ex, ey + (P.squeeze ? -10 : 12), ex + rx, ey + 2); stroke(ctx, 7);
    } else {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * op, 0, 0, 7); fill(ctx, PAPER); ctx.clip();
      const pr = 11.5 * (1 - .3 * wide);
      ctx.beginPath(); ctx.arc(ex + P.lookX * 11, ey + P.lookY * 13, pr, 0, 7); fill(ctx, ink(.6, 1, .45));
      ctx.beginPath(); ctx.arc(ex + P.lookX * 11 + 4, ey + P.lookY * 13 - 5, 3.5, 0, 7); fill(ctx, PAPER);
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * op, 0, 0, 7); stroke(ctx, 6);
    }
  }
  // брови
  const by = -50 + fy - (P.browUp || 0) * 13 - wide * 6, fu = P.furrow || 0;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 16, by + fu * 11); ctx.quadraticCurveTo(s * 40, by - 8 - fu * 2, s * 64, by + 2 - fu * 4); stroke(ctx, 12, HAIR);
  }
  // нос
  ctx.beginPath(); ctx.moveTo(-5, 18 + fy); ctx.quadraticCurveTo(8, 32 + fy, -4, 36 + fy); stroke(ctx, 5, ink(.6, .15, .5));
  // рот
  const my = 62 + fy, O = P.mouthO || 0, sm = P.smile || 0, mo = P.mouthOpen || 0;
  if (P.dizzy) {
    ctx.beginPath(); for (let x = -28; x <= 28; x += 4) ctx.lineTo(x, my + Math.sin(x * .3 + P.t * 8) * 5); stroke(ctx, 6);
  } else if (O > .3) {
    ctx.beginPath(); ctx.ellipse(0, my + 4, 11 + 6 * O, 9 + 17 * O, 0, 0, 7); fill(ctx, ink(.75, .9, .45)); stroke(ctx, 6);
  } else {
    const w = 32 + 6 * Math.abs(sm), cy0 = my - sm * 9, cc = my + sm * 9;
    if (mo < .06) { ctx.beginPath(); ctx.moveTo(-w, cy0); ctx.quadraticCurveTo(0, cc + sm * 6, w, cy0); stroke(ctx, 7); }
    else {
      ctx.beginPath(); ctx.moveTo(-w, cy0); ctx.quadraticCurveTo(0, cc, w, cy0);
      ctx.quadraticCurveTo(0, cc + 10 + mo * 46, -w, cy0); ctx.closePath(); fill(ctx, ink(.75, .9, .45));
      ctx.save(); ctx.clip();
      ctx.beginPath(); ctx.ellipse(0, cc + mo * 34, 20, 13, 0, 0, 7); fill(ctx, ink(.8, .1, .4));
      if (sm > .5) { ctx.fillStyle = PAPER; ctx.fillRect(-w, cc - 30, 2 * w, 30 + 9); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-w, cy0); ctx.quadraticCurveTo(0, cc, w, cy0); ctx.quadraticCurveTo(0, cc + 10 + mo * 46, -w, cy0); stroke(ctx, 6);
    }
  }
  // пот
  if (P.sweat > 0) for (const [x, ph] of [[96, 0], [-100, .5]]) {
    const k = ((P.t * .7 + ph) % 1), y = -40 + k * 90;
    ctx.globalAlpha = P.sweat * (1 - k);
    ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 12, y + 2, x, y + 8); ctx.quadraticCurveTo(x - 12, y + 2, x, y - 18);
    fill(ctx, ink(0, .6, .08)); stroke(ctx, 3);
    ctx.globalAlpha = 1;
  }
  // свет из коробки снизу
  if (P.glow > 0) {
    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createRadialGradient(-70, 150, 10, -70, 150, 260);
    g.addColorStop(0, ink(1 - .25 * P.glow, 1 - .85 * P.glow, 1)); g.addColorStop(1, ink(1, 1, 1));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 140, 160, 0, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  // звёзды над головой (после удара горшком)
  if (P.dizzy) for (let i = 0; i < 3; i++) {
    const a = P.t * 5 + i * 2.1;
    star(ctx, cx + Math.cos(a) * 120, cy - 150 + Math.sin(a) * 26, 24, a); fill(ctx, ink(.3, 0, 1)); stroke(ctx, 5);
  }
}

function ik(s, h, side, hx) {
  const L = 178; let dx = h[0] - s[0], dy = h[1] - s[1], d = Math.hypot(dx, dy);
  if (d > 2 * L - 2) { const k = (2 * L - 2) / d; dx *= k; dy *= k; d = 2 * L - 2; }
  const a = Math.acos(clamp(d / (2 * L), -1, 1)), b = Math.atan2(dy, dx);
  const c1 = [s[0] + Math.cos(b + a) * L, s[1] + Math.sin(b + a) * L], c2 = [s[0] + Math.cos(b - a) * L, s[1] + Math.sin(b - a) * L];
  const e = (side * (c1[0] - c2[0]) > 0) ? c1 : c2;
  return [e, [s[0] + dx, s[1] + dy]];
}

function drawArms(ctx, G, P) {
  for (const [side, hand] of [[-1, P.hA], [1, P.hB]]) {
    const s = [G.shX + side * 104, G.shY + 22];
    const [e, h] = ik(s, [hand[0], hand[1] + G.dy], side, G.hx);
    ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(e[0], e[1]); ctx.lineTo(h[0], h[1]);
    stroke(ctx, 66); stroke(ctx, 54, HOOD);
    const k = 30 / Math.hypot(h[0] - e[0], h[1] - e[1]);
    ctx.beginPath(); ctx.moveTo(h[0] - (h[0] - e[0]) * k, h[1] - (h[1] - e[1]) * k); ctx.lineTo(h[0], h[1]); stroke(ctx, 56, HOOD_D);
    if (side > 0 && P.cutter) {
      ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(-.5);
      rr(ctx, -12, -70, 24, 80, 6); fill(ctx, ink(.1, 0, 1)); stroke(ctx, 5);
      ctx.beginPath(); ctx.moveTo(-6, -70); ctx.lineTo(0, -98); ctx.lineTo(6, -70); fill(ctx, PAPER); stroke(ctx, 4);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(h[0], h[1], 31, 0, 7); fill(ctx, SKIN); stroke(ctx, 6);
    ctx.beginPath(); ctx.arc(h[0] - side * 24, h[1] - 12, 13, 0, 7); fill(ctx, SKIN); stroke(ctx, 5);
  }
}
