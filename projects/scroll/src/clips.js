// 22 «залипательных» ролика ленты. Пространство ролика 1080×1920, lt — время внутри ролика.
const NEON = ink(1, 0, .2), NEON_B = ink(0, 1, 0), NEON_Y = ink(0, 0, 1), INK = OUT;
const glow = (ctx, x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, ink(0, 0, 0, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
const vgrad = (ctx, c0, c1) => { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); };
const title = (ctx, txt, y = 520, size = 64, col = PAPER) => { ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .22; ctx.strokeStyle = INK; ctx.strokeText(txt, 540, y); ctx.fillStyle = col; ctx.fillText(txt, 540, y); ctx.restore(); };
function heartShape(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * .9); ctx.bezierCurveTo(x - s * 1.5, y - s * .1, x - s * .6, y - s * 1.2, x, y - s * .35); ctx.bezierCurveTo(x + s * .6, y - s * 1.2, x + s * 1.5, y - s * .1, x, y + s * .9); }
function uiOverlay(ctx, user, cap, likes, prog, lt) {
  const g = ctx.createLinearGradient(0, 1400, 0, 1920); g.addColorStop(0, ink(0, 0, 0, 0)); g.addColorStop(1, ink(.5, .8, .4, .55)); ctx.fillStyle = g; ctx.fillRect(0, 1400, 1080, 520);
  ctx.beginPath(); ctx.arc(985, 900, 58, 0, 7); fill(ctx, NEON_B); stroke(ctx, 6, PAPER); ctx.beginPath(); ctx.arc(985, 965, 20, 0, 7); fill(ctx, NEON);                 // аватар
  heartShape(ctx, 985, 1090, 46); fill(ctx, NEON); stroke(ctx, 5, PAPER);
  ctx.beginPath(); ctx.ellipse(985, 1270, 50, 42, 0, 0, 7); ctx.moveTo(960, 1300); ctx.lineTo(950, 1335); ctx.lineTo(990, 1308); fill(ctx, PAPER);                    // комментарии
  ctx.beginPath(); ctx.moveTo(945, 1470); ctx.lineTo(1010, 1440); ctx.lineTo(1010, 1415); ctx.lineTo(1040, 1455); ctx.lineTo(1010, 1495); ctx.lineTo(1010, 1470); ctx.quadraticCurveTo(970, 1470, 945, 1500); ctx.closePath(); fill(ctx, PAPER);   // поделиться
  ctx.font = '800 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.fillText(likes, 985, 1170); ctx.fillText('4.2K', 985, 1360); ctx.fillText('share', 985, 1545);
  ctx.save(); ctx.translate(985, 1680); ctx.rotate(lt * 3); ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); fill(ctx, INK); ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); fill(ctx, NEON_Y); ctx.restore();   // пластинка
  ctx.textAlign = 'left'; ctx.font = '900 46px Inter'; ctx.fillStyle = PAPER; ctx.fillText(user, 50, 1650);
  ctx.font = '700 38px Inter'; ctx.fillText(cap, 50, 1715); ctx.font = '700 32px Inter'; ctx.fillText('♫ original sound', 50, 1780);
  ctx.fillStyle = ink(.3, .4, .3); ctx.fillRect(0, 1880, 1080, 10); ctx.fillStyle = PAPER; ctx.fillRect(0, 1880, 1080 * clamp(prog), 10);
}
// A — паркур по крышам (сумерки, три слоя глубины, след движения)
function clipParkour(ctx, lt) {
  const X = lt * 900; vgrad(ctx, ink(.55, .95, 0), ink(1, .25, .7));
  for (let i = 0; i < 30; i++) { star(ctx, (hash(i) * 1080 - X * .02 + 1080) % 1080, hash(i + 9) * 700, 5, 0); fill(ctx, PAPER); }
  ctx.beginPath(); ctx.arc(800, 520, 150, 0, 7); fill(ctx, ink(0, 0, 1)); glow(ctx, 800, 520, 320, ink(0, 0, .5, .5));
  for (const [k, c, base, hh] of [[.15, ink(.75, 1, .55), 1450, 700], [.35, ink(.85, 1, .7), 1550, 520]]) {
    const off = X * k; for (let i = Math.floor(off / 230) - 1; i < Math.floor(off / 230) + 7; i++) { const x = i * 230 - off, h = 300 + hash(i * 1.7 + k) * hh; ctx.fillStyle = c; ctx.fillRect(x, base - h, 210, 1920); if (hash(i + k * 3) > .5) { ctx.fillRect(x + 90, base - h - 80, 12, 80); } } }
  const roof = i => ({ x: i * 700 + hash(i * 3) * 120, w: 520 + hash(i + 7) * 120, y: 1250 + (hash(i + 3) - .5) * 160 });
  const i0 = Math.floor((X - 400) / 700) - 1;
  for (let i = i0; i < i0 + 5; i++) { const r = roof(i), x = r.x - X; ctx.fillStyle = ink(.92, 1, .82); ctx.fillRect(x, r.y, r.w, 1920 - r.y); ctx.fillStyle = NEON_Y; ctx.fillRect(x, r.y, r.w, 16);
    rr(ctx, x + r.w * .55, r.y - 70, 110, 70, 6); fill(ctx, ink(.6, .8, .5)); stroke(ctx, 5);
    for (let wy = r.y + 80; wy < 1900; wy += 110) for (let wx = x + 40; wx < x + r.w - 60; wx += 100) { ctx.fillStyle = hash(wx * 7 + wy + i) > .55 ? NEON_Y : ink(.65, 1, .55); ctx.fillRect(wx, wy, 52, 62); } }
  const wx = X + 330, ri = Math.floor(wx / 700), cur = roof(ri), nr = roof(ri + 1);
  let y = cur.y, air = 0; const ja = cur.x + cur.w - 60, jb = nr.x + 40;
  if (wx > ja && wx < jb) { air = (wx - ja) / (jb - ja); y = lerp(cur.y, nr.y, air) - Math.sin(air * Math.PI) * 330; }
  if (air > 0) for (let i = 0; i < 6; i++) { ctx.fillStyle = ink(0, 0, 0, 0); ctx.beginPath(); ctx.moveTo(250 - i * 40, y - 220 + i * 30); ctx.lineTo(120 - i * 60, y - 220 + i * 30); stroke(ctx, 6, PAPER); }   // линии скорости
  const flip = air > 0 && ri % 3 === 0 ? air * Math.PI * 2 : 0, rc = lt * 14, rr2 = air ? 1.2 : Math.sin(rc);
  for (let ghost = 2; ghost >= 0; ghost--) {
    ctx.save(); ctx.globalAlpha = ghost ? .18 : 1; ctx.translate(330 - ghost * 40, y - 150 + ghost * 6); ctx.rotate(flip - ghost * .2);
    const limb = (a, l1, l2, b, c) => { ctx.beginPath(); ctx.moveTo(0, a); ctx.lineTo(Math.sin(b) * l1, a + Math.cos(b) * l1); ctx.lineTo(Math.sin(b) * l1 + Math.sin(b * .5 - .6) * l2, a + Math.cos(b) * l1 + Math.cos(b * .5 - .6) * l2); stroke(ctx, 32, INK); stroke(ctx, 20, c); };
    limb(20, 80, 80, -rr2 * .9, ink(.3, .9, .2)); limb(-80, 60, 60, rr2 * 1.2 + Math.PI, NEON);
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(10, -90); stroke(ctx, 44, INK); stroke(ctx, 32, NEON);
    limb(20, 80, 80, rr2 * .9, ink(.3, .9, .2)); limb(-80, 60, 60, -rr2 * 1.2 + Math.PI, NEON);
    ctx.beginPath(); ctx.arc(14, -140, 40, 0, 7); fill(ctx, SKIN); stroke(ctx, 7); ctx.beginPath(); ctx.arc(10, -152, 41, Math.PI, 0); fill(ctx, INK);
    ctx.restore();
  }
  uiOverlay(ctx, '@run.forever', 'wait for the last jump 😳 #parkour', '1.2M', ((lt % 9) + 9) % 9 / 9, lt);
}
// B — тоннель-спираль с глубиной
function clipSpiral(ctx, lt) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1080, 1920);
  ctx.save(); ctx.translate(540, 950);
  const rings = []; for (let i = 0; i < 18; i++) rings.push([((i - lt * 3) % 18 + 18) % 18, i]); rings.sort((p, q) => q[0] - p[0]);
  for (const [z, i] of rings) { const r = 40 * Math.pow(1.22, z), a = lt * 1.5 + z * .25;
    ctx.save(); ctx.rotate(a); ctx.beginPath(); for (let k = 0; k < 6; k++) ctx.lineTo(Math.cos(k / 6 * 6.28) * r, Math.sin(k / 6 * 6.28) * r); ctx.closePath();
    fill(ctx, [NEON, NEON_Y, NEON_B][Math.floor(i) % 3]); stroke(ctx, 6); ctx.restore(); }
  ctx.restore(); glow(ctx, 540, 950, 260, ink(0, 0, 1, .7));
  title(ctx, 'STARE FOR 10 SEC 👁'); uiOverlay(ctx, '@hypno.daily', 'you will see colors after #illusion', '890K', lt / 6, lt);
}
// C — резка мыла (объём)
function clipSoap(ctx, lt) {
  vgrad(ctx, ink(.25, 0, .15), ink(.45, .1, .3));
  rr(ctx, 100, 1180, 880, 110, 24); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 8); ctx.fillStyle = ink(.65, .3, .8); ctx.fillRect(110, 1270, 860, 20);
  const cuts = Math.floor(lt / .26), sub = (lt / .26) % 1, bx = 240 + cuts * 38, bw = 580 - cuts * 38;
  const block = (x, y, w, h, top) => { ctx.fillStyle = ink(.6, .1, .05); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50, y - 40); ctx.lineTo(x + w + 50, y - 40); ctx.lineTo(x + w, y); fill(ctx, top); stroke(ctx, 6);
    rr(ctx, x, y, w, h, 6); fill(ctx, ink(.45, .05, 0)); stroke(ctx, 6); ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + 50, y - 40); ctx.lineTo(x + w + 50, y + h - 40); ctx.lineTo(x + w, y + h); fill(ctx, ink(.6, .12, .1)); stroke(ctx, 6);
    for (let k = 1; k < 4; k++) { ctx.fillStyle = ink(.6, 0, .3); ctx.fillRect(x, y + k * h / 4, w, 10); } };
  block(bx, 830, bw, 350, ink(.3, 0, .05));
  for (let i = Math.max(0, cuts - 6); i < cuts; i++) { const age = lt - i * .26, fx = 240 + i * 38 - age * 380, fy = 830 + Math.max(0, age - .05) ** 2 * 2200;
    ctx.save(); ctx.translate(fx, Math.min(fy, 1180 - 30)); ctx.rotate(-Math.min(age * 3, 1.5)); block(-20, -350, 38, 350, ink(.3, 0, .05)); ctx.restore(); }
  const ky = 420 + (sub < .5 ? sub * 2 : 2 - sub * 2) * 760; ctx.beginPath(); ctx.moveTo(bx + 10, ky); ctx.lineTo(bx + 20, ky - 520); ctx.lineTo(bx + 130, ky - 520); ctx.lineTo(bx + 10, ky + 24); fill(ctx, PAPER); stroke(ctx, 7);
  ctx.beginPath(); ctx.moveTo(bx + 40, ky - 480); ctx.lineTo(bx + 34, ky - 120); stroke(ctx, 8, ink(0, .3, 0)); rr(ctx, bx, ky - 760, 150, 250, 30); fill(ctx, INK);
  for (let i = 0; i < 26; i++) { const u = (lt * 1.7 + hash(i)) % 1; ctx.fillStyle = ink(.45, .05, 0); ctx.fillRect(bx + (hash(i + 5) - .5) * 260, 1160 - u * 80 + u * u * 160, 12, 12); }
  title(ctx, 'ASMR 🔊'); uiOverlay(ctx, '@asmr.cuts', 'so satisfying 😩 #asmr #soap', '3.4M', lt / 5, lt);
}
// D — мяч в вращающихся кольцах (свечение, след)
function clipRings(ctx, lt) {
  ctx.fillStyle = ink(.55, 1, .45); ctx.fillRect(0, 0, 1080, 1920);
  const esc = Math.floor(lt / .6);
  for (let k = 7; k >= 0; k--) { if (k < esc) continue; const r = 110 + k * 55, gap = .6, a0 = lt * (k % 2 ? 2.6 : -2.2) + k, c = [NEON, NEON_Y, NEON_B][k % 3];
    ctx.beginPath(); ctx.arc(540, 950, r, a0 + gap, a0 + Math.PI * 2); stroke(ctx, 28, ink(0, 0, 0, .0)); ctx.globalAlpha = .35; stroke(ctx, 34, c); ctx.globalAlpha = 1; stroke(ctx, 16, c); }
  for (let k = 0; k < esc; k++) { const age = lt - k * .6; if (age > .5) continue; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28, r = 110 + k * 55 + age * 600; ctx.fillStyle = [NEON, NEON_Y, NEON_B][k % 3]; ctx.save(); ctx.translate(540 + Math.cos(a) * r, 950 + Math.sin(a) * r); ctx.rotate(a + age * 8); ctx.fillRect(-12, -6, 24, 12); ctx.restore(); } }
  const pos = s => { const br = 30 + Math.min(esc, 7) * 55, ba = s * 7.3; return [540 + Math.cos(ba) * br * .8, 950 + Math.sin(ba * 1.3) * br * .8]; };
  for (let i = 8; i >= 0; i--) { const [x, y] = pos(lt - i * .015); ctx.globalAlpha = i ? .12 : 1; ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); fill(ctx, PAPER); if (!i) stroke(ctx, 6); }
  ctx.globalAlpha = 1; title(ctx, `ESCAPED: ${Math.min(esc, 8)}/8`); uiOverlay(ctx, '@ball.escape', 'it gets crazy at the end 🤯', '5.8M', lt / 5, lt);
}
// E — пресс против мелков
function clipPress(ctx, lt) {
  vgrad(ctx, ink(.15, .35, .1), ink(.3, .5, .2));
  const cyc = Math.min(lt, .9) / .9, down = E.in(Math.min(1, cyc * 1.3)), py = 260 + down * 700, sq = clamp((py - 860) / 100);
  ctx.fillStyle = ink(.5, .8, .4); ctx.fillRect(470, 0, 140, py - 80); ctx.fillStyle = ink(.3, .5, .25); ctx.fillRect(570, 0, 30, py - 80);
  rr(ctx, 200, py - 100, 680, 120, 12); fill(ctx, ink(.65, .9, .5)); stroke(ctx, 8); ctx.fillStyle = ink(.4, .6, .3); ctx.fillRect(200, py - 10, 680, 30);
  const cols = [NEON, NEON_Y, NEON_B, ink(1, 0, 1), ink(0, 1, 1), ink(1, 1, 0)];
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(300 + i * 95, 1100); ctx.scale(1 + sq * 1.4, 1 - sq * .85); rr(ctx, -30, -130, 60, 130, 8); fill(ctx, cols[i]); stroke(ctx, 6); ctx.restore(); }
  if (sq > .9) for (let i = 0; i < 30; i++) { const a = hash(i) * 3.14 + 3.14, r = (lt - .7) * 1500 * hash(i + 3); ctx.fillStyle = cols[i % 6]; ctx.fillRect(540 + Math.cos(a) * r, 1080 + Math.sin(a) * r * .5, 16, 16); }
  rr(ctx, 120, 1100, 840, 70, 8); fill(ctx, ink(.65, .9, .5)); stroke(ctx, 8);
  title(ctx, 'CRAYONS vs 20 TONS', 60); uiOverlay(ctx, '@press.it', 'wait for it 💥 #hydraulicpress', '7.7M', lt / 5, lt);
}
// F — бег по рельсам, три полосы
function clipRunner(ctx, lt) {
  vgrad(ctx, ink(.1, .55, 0), ink(.3, .2, .6)); const HY = 700, V0 = 1920;
  ctx.fillStyle = ink(.5, .4, .55); ctx.beginPath(); ctx.moveTo(500, HY); ctx.lineTo(580, HY); ctx.lineTo(1300, V0); ctx.lineTo(-220, V0); ctx.fill();
  for (let k = 0; k < 14; k++) { const z = ((k - lt * 6) % 14 + 14) % 14 / 14, y = HY + (V0 - HY) * z * z, w = 80 + 1500 * z * z; ctx.fillStyle = ink(.6, .5, .65); ctx.fillRect(540 - w / 2, y, w, 8 + 20 * z); }
  for (const lx of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(540 + lx * 20, HY); ctx.lineTo(540 + lx * 520, V0); stroke(ctx, 10, ink(0, .2, .1)); }
  for (let k = 0; k < 6; k++) { const z = ((k * .37 - lt * .9) % 1 + 1) % 1, lane = [-1, 0, 1][(k * 7) % 3], y = HY + (V0 - HY) * z * z, s = .1 + 1.4 * z * z;
    if (k % 2) { rr(ctx, 540 + lane * 330 * z * z - 120 * s, y - 260 * s, 240 * s, 260 * s, 16 * s); fill(ctx, NEON); stroke(ctx, 5); ctx.fillStyle = NEON_Y; ctx.fillRect(540 + lane * 330 * z * z - 90 * s, y - 220 * s, 180 * s, 60 * s); }
    else { ctx.beginPath(); ctx.arc(540 + lane * 330 * z * z, y - 60 * s, 40 * s, 0, 7); fill(ctx, NEON_Y); stroke(ctx, 4); } }
  const lane = Math.sin(lt * 2.4) > .3 ? 1 : Math.sin(lt * 2.4) < -.3 ? -1 : 0, jump = Math.max(0, Math.sin(lt * 4)) ** 2 * 160, px = 540 + lane * 250;
  ctx.save(); ctx.translate(px, 1620 - jump); ctx.beginPath(); ctx.ellipse(0, 0, 80, 120, 0, 0, 7); fill(ctx, NEON_B); stroke(ctx, 7);
  ctx.beginPath(); ctx.arc(0, -150, 60, 0, 7); fill(ctx, ink(.7, .9, .7)); stroke(ctx, 7); rr(ctx, -70, -190, 140, 40, 12); fill(ctx, NEON); ctx.restore();
  ctx.font = '900 54px Inter'; ctx.textAlign = 'left'; ctx.fillStyle = NEON_Y; ctx.fillText(`🪙 ${Math.floor(lt * 37 + 1204)}`, 50, 520);
  uiOverlay(ctx, '@rails.run', 'new high score?? #runner', '2.9M', lt / 5, lt);
}
// G — слайм между руками
function clipSlime(ctx, lt) {
  vgrad(ctx, ink(0, .2, .55), ink(.2, .4, .3)); const s = .5 + .5 * Math.sin(lt * 3.2), L0 = 180 + s * 280;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(540 + sd * (L0 + 120), 1000, 140, 180, sd * .3, 0, 7); fill(ctx, SKIN); stroke(ctx, 7); }
  ctx.beginPath(); ctx.moveTo(540 - L0, 880); ctx.bezierCurveTo(540 - L0 / 2, 960 + s * 80, 540 + L0 / 2, 960 + s * 80, 540 + L0, 880); ctx.lineTo(540 + L0, 1120); ctx.bezierCurveTo(540 + L0 / 2, 1040 - s * 60, 540 - L0 / 2, 1040 - s * 60, 540 - L0, 1120); ctx.closePath();
  fill(ctx, ink(.85, 0, .35)); stroke(ctx, 7);
  ctx.beginPath(); ctx.moveTo(540 - L0 + 40, 920); ctx.bezierCurveTo(540 - L0 / 2, 985 + s * 70, 540 + L0 / 2, 985 + s * 70, 540 + L0 - 40, 920); stroke(ctx, 16, PAPER);
  for (let i = 0; i < 7; i++) { const u = (lt * .8 + hash(i)) % 1; ctx.beginPath(); ctx.arc(540 + (hash(i + 3) - .5) * L0 * 1.4, 1010 + (hash(i + 7) - .5) * 60, 10 + u * 14, 0, 7); stroke(ctx, 4, PAPER); }
  title(ctx, 'GALAXY SLIME 🌌'); uiOverlay(ctx, '@slime.lab', 'the stretch at 0:03 😮‍💨 #slime', '4.1M', lt / 5, lt);
}
// H — домино по спирали
function clipDomino(ctx, lt) {
  vgrad(ctx, ink(.05, .3, .45), ink(.25, .55, .5));
  const n = 46, front = lt * 14;
  for (let i = n - 1; i >= 0; i--) { const a = i * .32, r = 80 + i * 10, x = 540 + Math.cos(a) * r * 1.2, y = 1000 + Math.sin(a) * r * .55, s = .6 + (y - 700) / 1200;
    const fall = clamp(front - i), ang = fall * 1.25 * (Math.cos(a) > 0 ? 1 : -1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); rr(ctx, -16 * s, -90 * s, 32 * s, 90 * s, 4 * s); fill(ctx, i % 2 ? PAPER : NEON); stroke(ctx, 4); ctx.restore(); }
  title(ctx, `${Math.min(n, Math.floor(front))} / ${n}`); uiOverlay(ctx, '@domino.zen', 'took 9 hours to set up 😭 #domino', '6.3M', lt / 5, lt);
}
// I — «это торт?»: кроссовок, который режут
function clipCake(ctx, lt) {
  vgrad(ctx, ink(0, .05, .3), ink(.15, .1, .45));
  ctx.beginPath(); ctx.ellipse(540, 1220, 420, 90, 0, 0, 7); fill(ctx, PAPER); stroke(ctx, 7);
  const cut = clamp((lt - .15) / .35), open = clamp((lt - .5) / .3);
  const shoe = (dx, clip) => { ctx.save(); ctx.translate(dx, 0); ctx.beginPath(); ctx.rect(clip[0], 0, clip[1], 1920); ctx.clip();
    ctx.beginPath(); ctx.moveTo(250, 1180); ctx.lineTo(260, 1000); ctx.quadraticCurveTo(420, 880, 560, 960); ctx.lineTo(820, 1080); ctx.quadraticCurveTo(880, 1130, 850, 1180); ctx.closePath(); fill(ctx, NEON_B); stroke(ctx, 7);
    ctx.fillStyle = PAPER; ctx.fillRect(250, 1140, 610, 40); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(470 + i * 40, 960 + i * 18); ctx.lineTo(500 + i * 40, 1000 + i * 18); stroke(ctx, 6, PAPER); } ctx.restore(); };
  shoe(-open * 80, [0, 560]); shoe(open * 80, [560, 1080]);
  if (open > 0) { for (let k = 0; k < 4; k++) { ctx.fillStyle = [ink(.1, 0, .4), NEON, ink(.1, 0, .4), ink(.6, .3, .9)][k]; ctx.fillRect(560 - open * 80, 1000 + k * 45, open * 160, 45); } }
  const ky = lerp(700, 1200, cut); ctx.beginPath(); ctx.moveTo(560, ky); ctx.lineTo(575, ky - 420); ctx.lineTo(620, ky - 420); ctx.lineTo(565, ky + 10); fill(ctx, PAPER); stroke(ctx, 6);
  title(ctx, 'IS IT CAKE? 🎂'); uiOverlay(ctx, '@cake.or.not', 'guess before the cut 👀 #isitcake', '9.1M', lt / 5, lt);
}
// J — плинко
function clipPlinko(ctx, lt) {
  ctx.fillStyle = ink(.6, 1, .5); ctx.fillRect(0, 0, 1080, 1920);
  for (let r = 0; r < 11; r++) for (let c = 0; c <= r; c++) { const x = 540 + (c - r / 2) * 80, y = 520 + r * 90; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); fill(ctx, PAPER); }
  for (let s = 0; s < 12; s++) { const x = 540 + (s - 5.5) * 80; rr(ctx, x - 36, 1520, 72, 120, 8); fill(ctx, [NEON, NEON_Y, NEON_B][s % 3]); stroke(ctx, 4); ctx.font = '900 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(['x9', 'x3', 'x1', 'x.5'][Math.min(3, Math.abs(Math.round(s - 5.5)))], x, 1590); }
  for (let b = 0; b < 3; b++) { const u = ((lt + b * .3) % .9) / .9, r = u * 11, side = Math.round(Math.sin((Math.floor(r) + b) * 7.1) * 1), x = 540 + Math.sin(r * 2.2 + b) * r * 22 + side * 10, y = 470 + u * 1050;
    glow(ctx, x, y, 60, ink(0, 0, 1, .6)); ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); fill(ctx, NEON_Y); stroke(ctx, 5); }
  title(ctx, 'x9 OR NOTHING'); uiOverlay(ctx, '@plinko.tv', 'all in 😤 #plinko', '1.7M', lt / 5, lt);
}
// K — бесконечный зум (вложенные квадраты-цветы)
function clipZoom(ctx, lt) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1080, 1920); ctx.save(); ctx.translate(540, 960);
  const z = Math.pow(1.6, (lt * 2) % 1);
  for (let i = 10; i >= 0; i--) { const s = 900 * Math.pow(.62, i) * z; ctx.save(); ctx.rotate(i * .35 + lt * .4);
    for (let p = 0; p < 6; p++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.ellipse(s * .45, 0, s * .45, s * .16, 0, 0, 7); fill(ctx, [NEON, NEON_Y, NEON_B, PAPER][(i + p) % 4]); stroke(ctx, 4); } ctx.restore(); }
  ctx.restore(); title(ctx, 'NEVER ENDS ∞'); uiOverlay(ctx, '@loop.art', 'watch till the end (there is none)', '3.3M', lt / 5, lt);
}
// L — заливка краской
function clipPaint(ctx, lt) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, 1920);
  const cols = [NEON, NEON_Y, NEON_B, ink(1, 0, 1), INK];
  for (let k = 9; k >= 0; k--) { const r = Math.max(0, (lt * 2.2 - k * .18)) * 620; if (r <= 0) continue; ctx.beginPath();
    for (let a = 0; a < 6.3; a += .1) { const rr2 = r * (1 + .12 * Math.sin(a * 5 + k + lt * 3)); ctx.lineTo(540 + Math.cos(a) * rr2, 1000 + Math.sin(a) * rr2); } ctx.closePath(); fill(ctx, cols[k % 5]); }
  ctx.beginPath(); ctx.moveTo(520, 0); ctx.lineTo(560, 0); ctx.lineTo(548, 1000); ctx.lineTo(532, 1000); fill(ctx, cols[Math.floor(lt * 5) % 5]);
  title(ctx, 'PAINT POUR 🎨'); uiOverlay(ctx, '@pour.flow', 'the cells at the end 😍 #art', '2.2M', lt / 5, lt);
}
// M — кот и стакан
function clipCat(ctx, lt) {
  vgrad(ctx, ink(.2, .1, .4), ink(.35, .2, .55)); rr(ctx, -40, 1150, 760, 60, 6); fill(ctx, ink(.5, .2, .75)); stroke(ctx, 7);
  const push = clamp(lt / .45), fall = Math.max(0, lt - .45), gx = 420 + push * 260, gy = 1150 + fall * fall * 4000, ga = fall * 6;
  ctx.save(); ctx.translate(220, 1150); ctx.beginPath(); ctx.ellipse(0, -110, 140, 110, 0, 0, 7); fill(ctx, ink(.75, .6, .95)); stroke(ctx, 7);
  ctx.beginPath(); ctx.arc(110, -230, 90, 0, 7); fill(ctx, ink(.75, .6, .95)); stroke(ctx, 7);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(110 + s * 40, -300); ctx.lineTo(110 + s * 80, -360); ctx.lineTo(110 + s * 90, -280); fill(ctx, ink(.75, .6, .95)); stroke(ctx, 6); }
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(110 + s * 32, -240, 14, 22, 0, 0, 7); fill(ctx, NEON_Y); ctx.beginPath(); ctx.ellipse(110 + s * 32, -238, 5, 18, 0, 0, 7); fill(ctx, INK); }
  ctx.beginPath(); ctx.moveTo(150, -150); ctx.quadraticCurveTo(220, -120, 160 + push * 120, -70); stroke(ctx, 40, INK); stroke(ctx, 28, ink(.75, .6, .95)); ctx.restore();
  ctx.save(); ctx.translate(gx, Math.min(gy, 1820)); ctx.rotate(ga); ctx.beginPath(); ctx.moveTo(-50, -180); ctx.lineTo(50, -180); ctx.lineTo(40, 0); ctx.lineTo(-40, 0); ctx.closePath(); fill(ctx, ink(0, .25, .05)); stroke(ctx, 6); ctx.fillStyle = ink(0, .5, .1); ctx.fillRect(-42, -90, 84, 88); ctx.restore();
  title(ctx, 'he knew exactly what he was doing', 44); uiOverlay(ctx, '@chaos.cat', '😐 #cat #fyp', '12M', lt / 5, lt);
}
// N — яйцо на сковороде
function clipEgg(ctx, lt) {
  vgrad(ctx, ink(.3, .4, .3), ink(.5, .55, .4)); ctx.beginPath(); ctx.ellipse(540, 1050, 380, 300, 0, 0, 7); fill(ctx, INK); ctx.beginPath(); ctx.ellipse(540, 1040, 330, 250, 0, 0, 7); fill(ctx, ink(.6, .8, .5));
  rr(ctx, 880, 1000, 340, 60, 20); fill(ctx, INK);
  const sp = clamp(lt / .5); ctx.beginPath(); for (let a = 0; a < 6.3; a += .2) { const r = 40 + sp * 190 * (1 + .1 * Math.sin(a * 5)); ctx.lineTo(540 + Math.cos(a) * r, 1040 + Math.sin(a) * r * .8); } ctx.closePath(); fill(ctx, PAPER); stroke(ctx, 5);
  ctx.beginPath(); ctx.arc(540, 1030, 70, 0, 7); fill(ctx, ink(.3, 0, 1)); stroke(ctx, 5); ctx.beginPath(); ctx.arc(515, 1005, 18, 0, 7); fill(ctx, PAPER);
  for (let i = 0; i < 14; i++) { const u = (lt * 2 + hash(i)) % 1; ctx.beginPath(); ctx.arc(540 + (hash(i + 2) - .5) * 440, 1040 + (hash(i + 5) - .5) * 300, 6 + Math.abs(u) * 10, 0, 7); stroke(ctx, 3, PAPER); }
  if (lt < .3) { ctx.beginPath(); ctx.ellipse(540, 700 + lt * 600, 80, 100, 0, 0, 7); fill(ctx, PAPER); stroke(ctx, 6); }
  title(ctx, 'SIZZLE ASMR 🍳'); uiOverlay(ctx, '@morning.asmr', 'sound on 🔊 #cooking', '1.1M', lt / 5, lt);
}
// O — паркур по блокам от первого лица
function clipBlocks(ctx, lt) {
  vgrad(ctx, ink(.1, .45, 0), ink(.0, .15, .05)); const HZ = 760;
  for (let k = 7; k >= 0; k--) { const z = ((k - lt * 2.5) % 8 + 8) % 8 + .2, s = 520 / z, x = 540 + Math.sin(k * 1.7) * 900 / z, y = HZ + 900 / z;
    ctx.fillStyle = ink(.3, .9, .5); ctx.fillRect(x - s, y, s * 2, s * .5); ctx.fillStyle = ink(0, .6, .9); ctx.fillRect(x - s, y - s * .25, s * 2, s * .25); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(x - s, y - s * .25, s * 2, s * .75); }
  ctx.fillStyle = PAPER; ctx.fillRect(530, 930, 20, 60); ctx.fillRect(510, 950, 60, 20);
  ctx.save(); ctx.translate(860, 1700 + Math.sin(lt * 12) * 20); ctx.rotate(-.3); rr(ctx, -80, -200, 160, 300, 20); fill(ctx, SKIN); stroke(ctx, 7); ctx.restore();
  title(ctx, 'IMPOSSIBLE JUMP?'); uiOverlay(ctx, '@block.pov', 'first try 😎 #parkour #pov', '2.6M', lt / 5, lt);
}
// P — прыгающий логотип «в угол?»
function clipCorner(ctx, lt) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1080, 1920);
  const W2 = 1080 - 300, H2 = 1600 - 140, x = Math.abs(((lt * 520 + 100) % (2 * W2)) - W2), y = Math.abs(((lt * 610 + 180) % (2 * H2)) - H2) + 160;
  rr(ctx, x, y, 300, 140, 20); fill(ctx, [NEON, NEON_Y, NEON_B][Math.floor(lt * 3) % 3]); stroke(ctx, 6, PAPER);
  ctx.font = '900 52px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('LOGO', x + 150, y + 88);
  title(ctx, 'IT WILL HIT THE CORNER…', 54); uiOverlay(ctx, '@corner.wait', 'day 412 waiting 🥲', '980K', lt / 5, lt);
}
// Q — волна маятников
function clipPendulum(ctx, lt) {
  ctx.fillStyle = ink(.05, .25, .5); ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = INK; ctx.fillRect(100, 500, 880, 30);
  for (let i = 0; i < 15; i++) { const L = 500 + i * 40, a = .5 * Math.sin(lt * (5 + i * .25)), x = 140 + i * 57;
    const bx = x + Math.sin(a) * L, by = 515 + Math.cos(a) * L; ctx.beginPath(); ctx.moveTo(x, 515); ctx.lineTo(bx, by); stroke(ctx, 3, PAPER);
    ctx.beginPath(); ctx.arc(bx, by, 28, 0, 7); fill(ctx, [NEON, NEON_Y, NEON_B][i % 3]); stroke(ctx, 5); }
  title(ctx, 'PENDULUM WAVE'); uiOverlay(ctx, '@physics.fun', 'watch the pattern 🌀 #science', '4.4M', lt / 5, lt);
}
// R — сортировка шариков по колбам
function clipSort(ctx, lt) {
  vgrad(ctx, ink(.4, .1, .5), ink(.2, .3, .6));
  const cols = [NEON, NEON_Y, NEON_B, ink(1, 0, 1)];
  for (let tb = 0; tb < 5; tb++) { const x = 180 + tb * 180; rr(ctx, x - 60, 760, 120, 560, 40); fill(ctx, ink(0, .1, 0, .3)); stroke(ctx, 6, PAPER);
    for (let b = 0; b < 4; b++) { const k = (tb * 4 + b + Math.floor(lt * 4)) % 4, done = lt > .3 + tb * .08; ctx.beginPath(); ctx.arc(x, 1250 - b * 120, 48, 0, 7); fill(ctx, cols[done ? tb % 4 : k]); stroke(ctx, 5); } }
  const u = (lt * 2.5) % 1, ax = lerp(180, 900, u), ay = 680 - Math.sin(u * Math.PI) * 200; ctx.beginPath(); ctx.arc(ax, ay, 48, 0, 7); fill(ctx, cols[Math.floor(lt * 2.5) % 4]); stroke(ctx, 5);
  title(ctx, 'LEVEL 999'); uiOverlay(ctx, '@sort.it', 'oddly satisfying #puzzle', '3.7M', lt / 5, lt);
}
// S — идеальный круг от руки
function clipCircle(ctx, lt) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, 1920); for (let y = 0; y < 1920; y += 60) { ctx.fillStyle = ink(0, .25, 0); ctx.fillRect(0, y, 1080, 3); }
  const u = clamp(lt / .4), a1 = u * 6.28 - Math.PI / 2;
  ctx.beginPath(); ctx.arc(540, 1000, 320, -Math.PI / 2, a1); stroke(ctx, 16, NEON);
  const hx = 540 + Math.cos(a1) * 320, hy = 1000 + Math.sin(a1) * 320; ctx.save(); ctx.translate(hx, hy); ctx.rotate(.6); rr(ctx, -14, -200, 28, 200, 8); fill(ctx, NEON_Y); stroke(ctx, 5); ctx.beginPath(); ctx.ellipse(40, -260, 90, 120, .3, 0, 7); fill(ctx, SKIN); stroke(ctx, 6); ctx.restore();
  title(ctx, u >= 1 ? '99.8% PERFECT 🤯' : 'DRAWING A PERFECT CIRCLE', 520, 54); uiOverlay(ctx, '@steady.hand', 'no ruler 👀 #art', '8.8M', lt / 5, lt);
}
// T — мойка ковра: грязь сходит полосами, проступает узор
function clipWash(ctx, lt) {
  const rug = () => { ctx.fillStyle = NEON; ctx.fillRect(0, 0, 1080, 1920); for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { const x = 120 + c * 210, y = 300 + r * 190; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = (r + c) % 2 ? NEON_Y : NEON_B; ctx.fillRect(-60, -60, 120, 120); ctx.restore(); }
    ctx.strokeStyle = NEON_Y; ctx.lineWidth = 30; ctx.strokeRect(60, 240, 960, 1440); for (let i = 0; i < 40; i++) { ctx.fillStyle = PAPER; ctx.fillRect(60 + i * 24, 1680, 6, 60); } };
  rug();
  const cl = clamp(lt / .42) * 1600 + 200;                                    // всё, что ниже cl — ещё грязное
  ctx.save(); ctx.beginPath(); ctx.rect(0, cl, 1080, 1920); ctx.clip(); ctx.fillStyle = ink(.6, .7, .9); ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = ink(.75, .85, 1); ctx.beginPath(); ctx.arc(hash(i) * 1080, cl + hash(i + 3) * 1700, 20 + hash(i + 5) * 50, 0, 7); ctx.fill(); } ctx.restore();
  ctx.fillStyle = ink(0, .3, 0, .5); ctx.fillRect(0, cl - 120, 1080, 120);                                   // мокрая полоса
  rr(ctx, 280, cl - 40, 520, 70, 16); fill(ctx, INK); rr(ctx, 500, cl - 700, 80, 680, 14); fill(ctx, ink(.6, .9, .5)); stroke(ctx, 6);
  for (let i = 0; i < 24; i++) { const u = (lt * 3 + hash(i)) % 1; ctx.fillStyle = PAPER; ctx.fillRect(300 + hash(i + 9) * 480, cl - 20 - u * 140, 8, 14); }
  title(ctx, 'RUG CLEANING 🧽'); uiOverlay(ctx, '@rug.rescue', '10 years of dirt 🤢→😍 #cleaning', '6.6M', lt / 5, lt);
}
// W — мукбанг
function clipMukbang(ctx, lt) {
  vgrad(ctx, ink(.1, .05, .35), ink(.3, .15, .5));
  const lift = Math.max(0, Math.sin(lt * 7)), chew = Math.abs(Math.sin(lt * 14));
  const P = { x: 540, y: 2700, R: 220, kind: 'man', age: 24, outfit: 'tee', hair: 'bun', hairCol: ink(.7, .95, .7), t: lt, seed: 7, look: [0, .5], eye: .7, happyEyes: true, smile: .3, open: lift > .7 ? .6 : 0, blow: false };
  const G = drawPerson(ctx, P);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(G.hc[0] + sd * 150, G.hc[1] + 110, 40 + chew * 25, 0, 7); fill(ctx, SKIN); }      // щёки набиты
  rr(ctx, 380, 1180, 70, 260, 30); fill(ctx, INK); ctx.beginPath(); ctx.arc(415, 1170, 60, 0, 7); fill(ctx, ink(.6, .9, .5)); stroke(ctx, 6);   // микрофон
  ctx.beginPath(); ctx.ellipse(620, 1520, 330, 120, 0, 0, Math.PI); fill(ctx, PAPER); stroke(ctx, 7); ctx.beginPath(); ctx.ellipse(620, 1520, 330, 70, 0, 0, 7); fill(ctx, ink(.2, 0, .8)); stroke(ctx, 7);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(470 + i * 34, 1500); ctx.quadraticCurveTo(560 + i * 10, 1500 - lift * 300, 600, G.hc[1] + 140 + (1 - lift) * 300); stroke(ctx, 10, ink(.1, 0, .9)); }
  for (const dx of [0, 40]) { ctx.beginPath(); ctx.moveTo(760 + dx, 1500); ctx.lineTo(640 + dx, G.hc[1] + 120 + (1 - lift) * 300); stroke(ctx, 12, ink(.5, .2, .8)); }
  title(ctx, '10,000 CALORIE MUKBANG 🍜', 520, 52); uiOverlay(ctx, '@eat.with.me', 'slurp warning 🔊 #mukbang', '15M', lt / 5, lt);
}
// X — сплит-скрин: сверху «история», снизу геймплей
function clipSplit(ctx, lt) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 960, 1080, 960); ctx.clip(); ctx.translate(0, 960); ctx.scale(1, .5); clipRunner(ctx, lt + 3); ctx.restore();
  ctx.fillStyle = ink(.05, .1, .05); ctx.fillRect(0, 0, 1080, 960);
  rr(ctx, 60, 160, 960, 700, 30); fill(ctx, PAPER); stroke(ctx, 6); ctx.beginPath(); ctx.arc(130, 230, 36, 0, 7); fill(ctx, NEON);
  ctx.font = '900 34px Inter'; ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.fillText('r/story · 23h', 190, 242);
  const words = 'so my roommate has been eating my food for 3 months and yesterday I finally'.split(' '), k = Math.floor(lt * 9);
  ctx.font = '800 44px Inter'; let x = 100, y = 340;
  words.forEach((w, i) => { const ww = ctx.measureText(w + ' ').width; if (x + ww > 980) { x = 100; y += 62; } ctx.fillStyle = i === k % words.length ? NEON : INK; ctx.fillText(w, x, y); x += ww; });
  ctx.fillStyle = NEON; ctx.fillRect(0, 955, 1080, 10);
  title(ctx, (words[k % words.length] || '').toUpperCase(), 1250, 90, NEON_Y);
}
// U — песочная картина
function clipSand(ctx, lt) {
  ctx.fillStyle = ink(.1, .3, .2); ctx.fillRect(0, 0, 1080, 1920); rr(ctx, 240, 600, 600, 1000, 60); fill(ctx, ink(0, .05, 0)); stroke(ctx, 7, PAPER);
  const cols = [NEON, NEON_Y, NEON_B, ink(1, 0, 1), ink(0, 1, 1)];
  ctx.save(); rr(ctx, 240, 600, 600, 1000, 60); ctx.clip();
  for (let k = 0; k < 14; k++) { const top = 1600 - k * 70 - lt * 120; ctx.beginPath(); ctx.moveTo(240, 1600); for (let x = 240; x <= 840; x += 20) ctx.lineTo(x, top + Math.sin(x * .02 + k) * 30); ctx.lineTo(840, 1600); fill(ctx, cols[k % 5]); }
  ctx.restore(); ctx.beginPath(); ctx.moveTo(530, 0); ctx.lineTo(550, 0); ctx.lineTo(545, 900); ctx.lineTo(535, 900); fill(ctx, cols[Math.floor(lt * 3) % 5]);
  title(ctx, 'SAND ART'); uiOverlay(ctx, '@sand.lines', 'calming 😌 #sandart', '1.9M', lt / 5, lt);
}
// V — лава-лампа
function clipLava(ctx, lt) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1080, 1920); rr(ctx, 330, 400, 420, 1200, 200); fill(ctx, ink(.1, .6, 0)); stroke(ctx, 7, PAPER);
  ctx.save(); rr(ctx, 330, 400, 420, 1200, 200); ctx.clip();
  for (let i = 0; i < 6; i++) { const y = 1600 - ((lt * 220 + i * 260) % 1400), x = 540 + Math.sin(lt + i) * 80, r = 70 + hash(i) * 60; ctx.beginPath(); ctx.ellipse(x, y, r, r * (1.2 + .3 * Math.sin(lt * 2 + i)), 0, 0, 7); fill(ctx, NEON); }
  ctx.restore(); glow(ctx, 540, 1000, 400, ink(1, 0, .3, .3));
  title(ctx, 'VIBES ONLY'); uiOverlay(ctx, '@lava.lamp', '3am mood #aesthetic', '2.4M', lt / 5, lt);
}
const CLIPS = { W: clipMukbang, X: clipSplit, A: clipParkour, B: clipSpiral, C: clipSoap, D: clipRings, E: clipPress, F: clipRunner, G: clipSlime, H: clipDomino, I: clipCake, J: clipPlinko, K: clipZoom, L: clipPaint, M: clipCat,
  N: clipEgg, O: clipBlocks, P: clipCorner, Q: clipPendulum, R: clipSort, S: clipCircle, T: clipWash, U: clipSand, V: clipLava };
