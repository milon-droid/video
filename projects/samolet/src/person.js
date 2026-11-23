// Человек целиком, анфас: ноги, тело, руки по IK, голова из частей. Все размеры — в радиусах головы R.
const SKIN = ink(.3, .02, .36), SKIN_D = ink(.48, .1, .5);
const HAIRC = { mop: ink(.72, .05, .92), short: ink(.72, .05, .92), grey: ink(.18, .32, .2), white: PAPER, bun: ink(.7, .95, .7), dark: ink(.7, .95, .7), pig: ink(.72, .05, .92) };
const OUTFIT = {
  stripes: [ink(0, 0, .95), ink(0, .8, .1)], tee: [ink(0, .75, .15), null], suit: [ink(.55, 1, .45), ink(0, 0, 0)],
  gown: [ink(.4, 1, .25), null], dress: [PAPER, ink(.9, 0, .2)], cardigan: [ink(.75, .2, .55), null],
  sweater: [ink(.85, .1, .3), null], pajama: [ink(.1, .55, 0), ink(0, 0, .6)], shirt: [ink(0, .35, 0), ink(.9, .1, .9)],
};
const BODY = { boy: [2.2, 2.2, .9], girl: [1.9, 1.9, .8], man: [3.0, 2.8, 1.12], old: [2.8, 2.6, 1.08], woman: [2.9, 2.6, 1.0] };

function ikArm(s, h, L, side) {
  let dx = h[0] - s[0], dy = h[1] - s[1], d = Math.hypot(dx, dy);
  if (d > 2 * L - 1) { const k = (2 * L - 1) / d; dx *= k; dy *= k; d = 2 * L - 1; }
  const a = Math.acos(clamp(d / (2 * L), -1, 1)), b = Math.atan2(dy, dx);
  const c1 = [s[0] + Math.cos(b + a) * L, s[1] + Math.sin(b + a) * L], c2 = [s[0] + Math.cos(b - a) * L, s[1] + Math.sin(b - a) * L];
  const sc = c => side * c[0] + .9 * c[1];
  return [sc(c1) > sc(c2) ? c1 : c2, [s[0] + dx, s[1] + dy]];
}

function personGeom(P) {
  const R = P.R, [leg, tor, shw] = BODY[P.kind], sit = P.sit || 0;
  const br = Math.sin(P.t * 1.8 + (P.seed || 0)) * .03 * R;
  const hipY = P.y - leg * R * (1 - .52 * sit) + (P.bob || 0), hx = P.x;
  const shY = hipY - tor * R * (1 - .08 * (P.lean || 0)) + br + (P.kind === 'old' ? .15 * R : 0);
  const shX = hx + (P.lean2 || 0) * R;
  const hc = [shX + (P.headDX || 0) * R, shY - 1.12 * R];
  return { R, leg, tor, shw, sit, hipY, hx, shY, shX, hc };
}

function drawPerson(ctx, P) {
  const G = personGeom(P), { R, hipY, hx, shY, shX, shw, sit } = G, [c1, c2] = OUTFIT[P.outfit] || OUTFIT.tee;
  const lw = Math.max(1.5, R * .07);
  // ноги
  const pants = P.pants || ink(.3, .8, .15);
  for (const s of [-1, 1]) {
    const kx = hx + s * .42 * R, ky = sit > .5 ? hipY + .3 * R : hipY;
    if (P.outfit !== 'dress' && P.outfit !== 'gown') {
      ctx.beginPath(); ctx.moveTo(hx + s * .4 * R, hipY - .1 * R); ctx.lineTo(kx, ky); ctx.lineTo(P.x + s * .48 * R + (P.legSwing || 0) * s * R, P.y - .18 * R);
      stroke(ctx, .62 * R + lw * 2); stroke(ctx, .62 * R, pants);
    } else {
      ctx.beginPath(); ctx.moveTo(P.x + s * .4 * R, P.y - .9 * R); ctx.lineTo(P.x + s * .46 * R, P.y - .18 * R); stroke(ctx, .34 * R + lw * 2); stroke(ctx, .34 * R, SKIN);
    }
    ctx.beginPath(); ctx.ellipse(P.x + s * .55 * R + (P.legSwing || 0) * s * R, P.y - .1 * R, .42 * R, .18 * R, 0, 0, 7); fill(ctx, P.shoes || ink(.6, .9, .4)); stroke(ctx, lw);
  }
  // тело
  const top = shY - .1 * R, bot = P.outfit === 'dress' || P.outfit === 'gown' ? P.y - (P.outfit === 'gown' ? .5 : .85) * R : hipY + .25 * R;
  const wb = P.outfit === 'dress' || P.outfit === 'gown' ? shw * 1.45 : shw * .92;
  ctx.beginPath(); ctx.moveTo(shX - shw * R, top + .25 * R); ctx.quadraticCurveTo(shX - shw * R, top - .1 * R, shX - shw * .5 * R, top - .08 * R);
  ctx.lineTo(shX + shw * .5 * R, top - .08 * R); ctx.quadraticCurveTo(shX + shw * R, top - .1 * R, shX + shw * R, top + .25 * R);
  ctx.lineTo(hx + wb * R, bot); ctx.lineTo(hx - wb * R, bot); ctx.closePath();
  fill(ctx, c1);
  ctx.save(); ctx.clip();
  if (P.outfit === 'stripes' || P.outfit === 'pajama') for (let y = top + .2 * R; y < bot; y += .42 * R) { ctx.fillStyle = c2; ctx.fillRect(hx - 3 * R, y, 6 * R, .18 * R); }
  if (P.outfit === 'suit' || P.outfit === 'cardigan') { ctx.fillStyle = P.outfit === 'suit' ? PAPER : ink(.3, .05, .3); ctx.beginPath(); ctx.moveTo(shX - .35 * R, top - .05 * R); ctx.lineTo(shX + .35 * R, top - .05 * R); ctx.lineTo(shX, top + 1.1 * R); ctx.fill(); }
  if (P.outfit === 'suit') { ctx.beginPath(); ctx.moveTo(shX - .1 * R, top + .1 * R); ctx.lineTo(shX + .1 * R, top + .1 * R); ctx.lineTo(shX + .14 * R, top + .9 * R); ctx.lineTo(shX, top + 1.05 * R); ctx.lineTo(shX - .14 * R, top + .9 * R); fill(ctx, ink(.9, .1, .3)); }
  if (P.outfit === 'cardigan') for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(shX + .05 * R, top + (.6 + i * .45) * R, .07 * R, 0, 7); fill(ctx, ink(.3, .9, .2)); }
  if (P.outfit === 'dress') { ctx.fillStyle = c2; ctx.fillRect(hx - 3 * R, hipY - .1 * R, 6 * R, .2 * R); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(shX - shw * R, top + .25 * R); ctx.quadraticCurveTo(shX - shw * R, top - .1 * R, shX - shw * .5 * R, top - .08 * R);
  ctx.lineTo(shX + shw * .5 * R, top - .08 * R); ctx.quadraticCurveTo(shX + shw * R, top - .1 * R, shX + shw * R, top + .25 * R);
  ctx.lineTo(hx + wb * R, bot); ctx.lineTo(hx - wb * R, bot); ctx.closePath(); stroke(ctx, lw);
  // шея
  rr(ctx, G.hc[0] - .26 * R, G.hc[1] + .6 * R, .52 * R, shY - G.hc[1] - .6 * R, .1 * R); fill(ctx, SKIN_D);
  if (!P.armsFront) drawArmsP(ctx, G, P, c1, lw);
  drawHeadP(ctx, G, P, lw);
  if (P.armsFront) drawArmsP(ctx, G, P, c1, lw);
  return G;
}

function drawArmsP(ctx, G, P, c1, lw) {
  const { R, shY, shX, shw, hipY } = G, L = G.tor * R * .5;
  for (const side of [-1, 1]) {
    const s = [shX + side * (shw - .2) * R, shY + .15 * R];
    const tgt = (side < 0 ? P.hA : P.hB) || [s[0] + side * .35 * R, hipY + .1 * R];
    const [e, h] = ikArm(s, tgt, L, side);
    ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(e[0], e[1]); ctx.lineTo(h[0], h[1]);
    stroke(ctx, .42 * R + lw * 2); stroke(ctx, .42 * R, P.outfit === 'dress' ? SKIN : c1);
    ctx.beginPath(); ctx.arc(h[0], h[1], .24 * R, 0, 7); fill(ctx, SKIN); stroke(ctx, lw);
    if (side < 0) P._hA = h; else P._hB = h;
  }
}

function drawHeadP(ctx, G, P, lw) {
  const R = G.R, [cx, cy] = G.hc, f = (P.face || 0) * .25, hairC = HAIRC[P.hair] || HAIRC.mop;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(P.tilt || 0); ctx.scale(R / 100, R / 100);
  const L = lw * 100 / R;
  // пучок/хвостики — за головой
  if (P.hair === 'bun') { ctx.beginPath(); ctx.arc(0, -118, 42, 0, 7); fill(ctx, hairC); stroke(ctx, L); }
  if (P.hair === 'pig') for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 108, -10, 26, 44, s * .5, 0, 7); fill(ctx, hairC); stroke(ctx, L); }
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 94 + f * 20, 8, 18, 24, 0, 0, 7); fill(ctx, SKIN); stroke(ctx, L); }
  ctx.beginPath(); ctx.ellipse(0, 0, 94, 100, 0, 0, 7); fill(ctx, SKIN); stroke(ctx, L);
  // волосы
  const wd = (P.wind || 0) * 20;
  if (P.hair === 'white') {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 82, -36, 26, 34, s * .3, 0, 7); fill(ctx, PAPER); stroke(ctx, L); }
    ctx.beginPath(); ctx.ellipse(-30, -70, 26, 12, -.4, 0, 7); fill(ctx, ink(.05, 0, .1));
  } else if (P.hair) {
    const sh = P.hair === 'short' || P.hair === 'grey' || P.hair === 'dark', fr = sh ? -62 : -46, cap = sh ? .78 : 1;
    ctx.beginPath(); ctx.moveTo(-100, 10);
    ctx.bezierCurveTo(-112, -110 * cap, -30, -132, 8, -128);
    ctx.bezierCurveTo(78, -128, 118, -96, 100, 10);
    for (let i = 0; i <= 8; i++) { const x = 96 - i * 24, y = fr + (i % 2 ? -14 : 6) + (i === 0 || i === 8 ? 40 : 0); ctx.lineTo(x + wd * (i % 2), y); }
    ctx.closePath(); fill(ctx, hairC); stroke(ctx, L);
    if (P.hair === 'mop' || P.hair === 'pig') for (const [x, a] of [[-14, -.6], [16, .5]]) { ctx.beginPath(); ctx.moveTo(x, -122); ctx.quadraticCurveTo(x + 10 + wd, -162, x + 34 * Math.sin(a) + wd, -170); stroke(ctx, 12, hairC); }
  }
  // морщины
  if (P.age >= 60) for (const y of [-58, -46]) { ctx.beginPath(); ctx.moveTo(-34 + f * 30, y); ctx.quadraticCurveTo(f * 30, y - 6, 34 + f * 30, y); stroke(ctx, 3.5, SKIN_D); }
  // веснушки / румянец
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 54 + f * 30, 30, 15, 0, 7); fill(ctx, ink(.55, 0, .12, P.blow ? 1 : .75)); }
  if (P.age < 20) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((i % 3 - 1) * 12 + (i < 3 ? -52 : 52) + f * 30, 18 + Math.floor(i % 2) * 8, 3, 0, 7); fill(ctx, ink(.6, .1, .7)); }
  // глаза
  const op = clamp((P.eye ?? 1) * blink(P.t + (P.seed || 0))), ex0 = f * 30;
  for (const s of [-1, 1]) {
    const ex = s * 34 + ex0, ey = -6, rx = 19, ry = 23 * (1 + .2 * (P.wide || 0));
    if (op < .15) { ctx.beginPath(); ctx.moveTo(ex - rx, ey + 2); ctx.quadraticCurveTo(ex, ey + (P.happyEyes ? -10 : 10), ex + rx, ey + 2); stroke(ctx, 6); }
    else {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * op, 0, 0, 7); fill(ctx, PAPER); ctx.clip();
      const lk = P.look || [0, 0];
      ctx.beginPath(); ctx.arc(ex + lk[0] * 9, ey + lk[1] * 11, 9.5, 0, 7); fill(ctx, ink(.6, 1, .45));
      ctx.beginPath(); ctx.arc(ex + lk[0] * 9 + 3, ey + lk[1] * 11 - 4, 3, 0, 7); fill(ctx, PAPER);
      ctx.restore(); ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry * op, 0, 0, 7); stroke(ctx, 5);
    }
  }
  if (P.glasses) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 34 + ex0, -6, 28, 0, 7); stroke(ctx, 5); } ctx.beginPath(); ctx.moveTo(-6 + ex0, -8); ctx.lineTo(6 + ex0, -8); stroke(ctx, 5); }
  // брови
  const bc = P.hair === 'white' ? ink(.2, .35, .2) : (P.hair === 'bun' ? HAIRC.bun : HAIRC.mop), by = -44 - (P.brow || 0) * 11, fu = P.furrow || 0;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 13 + ex0, by + fu * 9); ctx.quadraticCurveTo(s * 34 + ex0, by - 7 - fu * 2, s * 54 + ex0, by + 2 - fu * 3); stroke(ctx, 10, bc); }
  // нос
  ctx.beginPath(); ctx.moveTo(-4 + f * 40, 12); ctx.quadraticCurveTo(8 + f * 40, 26, -3 + f * 40, 29); stroke(ctx, 4.5, ink(.6, .15, .5));
  // рот
  const my = 54, O = P.O || 0, sm = P.smile || 0, mo = P.open || 0, mx = f * 34;
  if (P.blow) { ctx.beginPath(); ctx.ellipse(mx, my, 8, 9, 0, 0, 7); fill(ctx, ink(.75, .9, .45)); stroke(ctx, 5); }
  else if (O > .3) { ctx.beginPath(); ctx.ellipse(mx, my + 3, 9 + 5 * O, 8 + 14 * O, 0, 0, 7); fill(ctx, ink(.75, .9, .45)); stroke(ctx, 5); }
  else {
    const w = 27 + 5 * Math.abs(sm), c0 = my - sm * 8, cc = my + sm * 8;
    if (mo < .06) { ctx.beginPath(); ctx.moveTo(mx - w, c0); ctx.quadraticCurveTo(mx, cc + sm * 5, mx + w, c0); stroke(ctx, 6); }
    else {
      ctx.beginPath(); ctx.moveTo(mx - w, c0); ctx.quadraticCurveTo(mx, cc, mx + w, c0); ctx.quadraticCurveTo(mx, cc + 8 + mo * 38, mx - w, c0); ctx.closePath();
      fill(ctx, ink(.75, .9, .45)); ctx.save(); ctx.clip();
      ctx.beginPath(); ctx.ellipse(mx, cc + mo * 28, 16, 10, 0, 0, 7); fill(ctx, ink(.8, .1, .4));
      if (sm > .5) { ctx.fillStyle = PAPER; ctx.fillRect(mx - w, cc - 26, 2 * w, 26 + 7); }
      ctx.restore(); stroke(ctx, 5);
    }
  }
  ctx.restore();
}
