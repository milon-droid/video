// «Блэкаут» — графика: персонажи-«вырезанные фигурки» (без чёрного контура, тень срезом) и места сериала.
// Новый стиль для этого сериала: силуэты отличаются ростом, головой, одеждой; свет тёплый сверху до блэкаута
// и холодный снизу после (фонарики/экраны). Нужны lib.js (ctx, C(), cutShade, LIGHT) и anim-kit.js.
'use strict';
const CAST = {
  dias: { skin: '#E2A97F', hair: '#1C1820', top: '#DCE8F2', style: 'styled', glasses: 1, collar: 1, hw: 1.08, hh: 1.0, sh: 1.0, neck: .16, seed: 1 },
  diasT: { skin: '#E2A97F', hair: '#1C1820', top: '#F4F1EA', style: 'styled', glasses: 1, tee: 1, hw: 1.08, hh: 1.0, sh: 1.0, neck: .16, seed: 1 },
  beka: { skin: '#CF9266', hair: '#221C18', top: '#26357F', style: 'buzz', stripes: 1, watch: 'smart', hw: 1.04, hh: .94, sh: 1.3, neck: .05, seed: 3 },
  alik: { skin: '#E6B48C', hair: '#3B2416', top: '#A8432C', style: 'curly', plaid: 1, watch: 'mech', hw: .88, hh: 1.14, sh: .84, neck: .42, seed: 4 },
  anchor: { skin: '#E8B892', hair: '#1A1416', top: '#1F2A4A', style: 'bun', blouse: 1, hw: .94, hh: 1.05, sh: .9, neck: .22, seed: 5, lips: '#B5484A' },
};
const SHADE = 'rgba(30,12,40,.26)';
function ell(x, y, rx, ry, rot = 0) { return (dx, dy) => { ctx.moveTo(x + dx + rx * Math.cos(rot), y + dy + rx * Math.sin(rot)); ctx.ellipse(x + dx, y + dy, rx, ry, rot, 0, Math.PI * 2); }; }
// мягкий свет снизу (фонарик/экран телефона в руках)
function underLight(x, y, r, k, rgb = '127,179,255') { if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y + r * 1.25, 0, x, y + r * 1.1, r * 1.9);
  g.addColorStop(0, `rgba(${rgb},${.55 * k})`); g.addColorStop(.5, `rgba(${rgb},${.18 * k})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r * 2.2, y - r * 1.5, r * 4.4, r * 4.4); ctx.restore(); }

// ───── голова. o: look [lx, ly], blink 0..1, brow −1..1 (1 — страх/удивление), wide 1..1.4, mouth 0..1, smile, tilt, lens(cx,cy,w,h) — отражение в очках ─────
function head(x, y, R, who, o = {}) { const c = CAST[who], rx = R * c.hw, ry = R * c.hh, [lx, ly] = o.look || [0, 0], sk = C(c.skin), hr = C(c.hair);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0);
  // за головой: капюшон, пучок
  if (c.hood) { ctx.fillStyle = C(mix(c.top, '#000000', .18)); ctx.beginPath(); ctx.ellipse(0, ry * .55, rx * 1.35, ry * 1.05, 0, 0, Math.PI * 2); ctx.fill(); }
  if (c.style === 'bun') { ctx.fillStyle = hr; circle(rx * .55, -ry * .95, R * .34); ctx.fill(); }
  if (c.style === 'curly') { ctx.fillStyle = hr; for (let i = 0; i < 9; i++) { const a = Math.PI * (.95 + i * .14); circle(Math.cos(a) * rx * 1.02, Math.sin(a) * ry * .98 - R * .05, R * .24); ctx.fill(); } }
  // уши
  ctx.fillStyle = sk; for (const sx of [-1, 1]) { circle(sx * rx * .98, R * .06, R * .17); ctx.fill(); } ctx.fillStyle = 'rgba(120,50,40,.25)'; for (const sx of [-1, 1]) { circle(sx * rx * 1.0, R * .07, R * .08); ctx.fill(); }
  // лицо
  const face = ell(0, 0, rx, ry); ctx.beginPath(); face(0, 0); ctx.fillStyle = sk; ctx.fill(); cutShade(face, -R * .2, -R * .16, SHADE);
  ctx.fillStyle = 'rgba(230,90,80,.16)'; for (const sx of [-1, 1]) { circle(sx * rx * .55 + lx * R * .08, R * .3, R * .16); ctx.fill(); } // румянец
  // волосы спереди
  ctx.fillStyle = hr;
  if (c.style === 'short' || c.style === 'quiff') { ctx.beginPath(); ctx.ellipse(0, -ry * .2, rx * 1.03, ry * .92, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(rx * .9, -ry * .42);
    for (let i = 0; i <= 6; i++) ctx.quadraticCurveTo(rx * (.9 - (i + .5) * .3), -ry * (.32 + (i % 2) * .12), rx * (.9 - (i + 1) * .3), -ry * .42); ctx.closePath(); ctx.fill();
    if (c.style === 'quiff') { ctx.beginPath(); ctx.ellipse(-rx * .15, -ry * .98, rx * .6, ry * .28, -.25, 0, Math.PI * 2); ctx.fill(); } }
  if (c.style === 'styled') { ctx.beginPath(); ctx.ellipse(0, -ry * .2, rx * 1.04, ry * .9, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(rx * .5, -ry * .62, -rx * .25, -ry * .55); ctx.quadraticCurveTo(-rx * .7, -ry * .45, -rx * 1.02, -ry * .25); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rx * .12, -ry * .92, rx * .62, ry * .26, .18, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = R * .05; ctx.beginPath(); ctx.ellipse(rx * .1, -ry * .9, rx * .45, ry * .15, .18, Math.PI * 1.1, Math.PI * 1.8); ctx.stroke(); }
  if (c.style === 'buzz') { ctx.save(); ctx.beginPath(); face(0, 0); ctx.clip(); ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(0, -ry * .1, rx * 1.1, ry * .95, 0, Math.PI, 0); ctx.lineTo(rx, -ry * .5); ctx.quadraticCurveTo(0, -ry * .62, -rx, -ry * .5); ctx.fill(); ctx.restore(); }
  if (c.style === 'curly') { for (let i = 0; i < 7; i++) { circle(-rx * .72 + i * rx * .24, -ry * .62 - Math.sin(i * 1.7) * R * .06, R * .2); ctx.fill(); } }
  if (c.style === 'bun') { ctx.beginPath(); ctx.ellipse(0, -ry * .18, rx * 1.04, ry * .9, 0, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(rx * .3, -ry * .5, -rx * .1, -ry * .62); ctx.quadraticCurveTo(-rx * .6, -ry * .45, -rx * 1.04, -ry * .1); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.ellipse(0, -ry * .2, rx * .8, ry * .7, 0, Math.PI * 1.25, Math.PI * 1.7); ctx.stroke(); }
  // глаза
  const op = clamp(o.blink ?? 1), wd = o.wide || 1, ex = rx * .36, ey = -R * .02 + (ly || 0) * R * .04, erx = R * .155, ery = R * .19 * wd;
  for (const sx of [-1, 1]) { const cx = sx * ex + lx * R * .1; ctx.save(); ctx.beginPath(); ctx.ellipse(cx, ey, erx, ery, 0, 0, Math.PI * 2); ctx.fillStyle = C('#F7F3EA'); ctx.fill(); ctx.clip();
    ctx.fillStyle = '#15121A'; circle(cx + lx * R * .06, ey + ly * R * .06 + R * .02, R * .088 * (wd > 1.15 ? .8 : 1)); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.9)'; circle(cx + lx * R * .06 + R * .03, ey + ly * R * .06 - R * .02, R * .026); ctx.fill();
    const lid = (1 - op) * ery * 2 + (wd > 1.1 ? 0 : ery * .28); ctx.fillStyle = sk; ctx.fillRect(cx - erx - 2, ey - ery - 2, erx * 2 + 4, lid + 2); ctx.fillStyle = 'rgba(30,12,40,.25)'; ctx.fillRect(cx - erx - 2, ey - ery - 2 + lid, erx * 2 + 4, R * .03); ctx.restore(); }
  // брови: 1 — домиком вверх (страх), −1 — сведены вниз (злость)
  const br = o.brow || 0; ctx.strokeStyle = hr; ctx.lineCap = 'round'; ctx.lineWidth = R * .075;
  for (const sx of [-1, 1]) { const cx = sx * ex + lx * R * .1, by = ey - ery - R * .1 - Math.max(0, br) * R * .1; ctx.beginPath(); ctx.moveTo(cx - sx * R * .15, by + (br < 0 ? R * .06 : 0) - (br > 0 ? br * R * .07 : 0)); ctx.lineTo(cx + sx * R * .15, by + (br > 0 ? br * R * .02 : 0)); ctx.stroke(); }
  // нос и рот
  ctx.fillStyle = 'rgba(150,60,50,.28)'; ctx.beginPath(); ctx.ellipse(lx * R * .14, R * .22, R * .09, R * .06, 0, 0, Math.PI * 2); ctx.fill();
  const my = R * .48, mx = lx * R * .12, m = clamp(o.mouth || 0);
  if (m > .06) { ctx.fillStyle = '#4a1c22'; ctx.beginPath(); ctx.ellipse(mx, my, R * (.13 + m * .05), R * (.03 + m * .13), 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c4535a'; ctx.beginPath(); ctx.ellipse(mx, my + R * m * .08, R * .08, R * m * .05, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = c.lips ? C(c.lips) : '#5a2228'; ctx.lineWidth = R * .045; ctx.beginPath(); const sm = o.smile ?? .3; ctx.moveTo(mx - R * .14, my - sm * R * .05); ctx.quadraticCurveTo(mx, my + sm * R * .1, mx + R * .14, my - sm * R * .05); ctx.stroke(); }
  // очки (Диас): отражение в стёклах рисует o.lens
  if (c.glasses) { for (const sx of [-1, 1]) { const cx = sx * ex + lx * R * .1, gw = R * .44, gh = R * .38; ctx.save(); rr(cx - gw / 2, ey - gh / 2, gw, gh, R * .12); ctx.fillStyle = 'rgba(170,200,255,.10)'; ctx.fill(); ctx.clip(); if (o.lens) o.lens(cx, ey, gw, gh);
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(cx - gw * .4, ey + gh * .5); ctx.lineTo(cx - gw * .1, ey - gh * .5); ctx.lineTo(cx + gw * .05, ey - gh * .5); ctx.lineTo(cx - gw * .25, ey + gh * .5); ctx.fill(); ctx.restore();
      rr(cx - gw / 2, ey - gh / 2, gw, gh, R * .12); ctx.strokeStyle = C('#3A2A22'); ctx.lineWidth = R * .05; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-ex + lx * R * .1 + R * .22, ey - R * .04); ctx.quadraticCurveTo(lx * R * .1, ey - R * .12, ex + lx * R * .1 - R * .22, ey - R * .04); ctx.stroke(); }
  ctx.restore(); }

// ───── рука: плечо → локоть → кисть, рукав сужается к запястью (урок ҚУАТ: рука не шире ⅓ головы) ─────
function arm(x, y, a1, a2, l1, l2, w, col, skin, o = {}) { const ex = x + Math.sin(-a1) * l1, ey = y + Math.cos(a1) * l1, hx = ex + Math.sin(-(a1 + a2)) * l2, hy = ey + Math.cos(a1 + a2) * l2;
  const seg = (ax, ay, bx, by, wa, wb) => { const d = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / d, ny = (bx - ax) / d; ctx.beginPath(); ctx.moveTo(ax + nx * wa / 2, ay + ny * wa / 2); ctx.lineTo(bx + nx * wb / 2, by + ny * wb / 2); ctx.lineTo(bx - nx * wb / 2, by - ny * wb / 2); ctx.lineTo(ax - nx * wa / 2, ay - ny * wa / 2); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle = C(col); seg(x, y, ex, ey, w, w * .84); circle(x, y, w / 2); ctx.fill(); circle(ex, ey, w * .42); ctx.fill(); seg(ex, ey, hx, hy, w * .84, w * .66);
  ctx.fillStyle = 'rgba(30,12,40,.18)'; seg(ex, ey, hx, hy, w * .3, w * .2);
  if (o.stripes) { ctx.fillStyle = C('#E9ECF2'); seg(x + (ex - x) * .1, y + (ey - y) * .1, ex, ey, w * .16, w * .14); seg(ex, ey, ex + (hx - ex) * .86, ey + (hy - ey) * .86, w * .14, w * .12); }
  const ang = Math.atan2(hy - ey, hx - ex);
  if (o.watch) watchOnWrist(ex + (hx - ex) * .82, ey + (hy - ey) * .82, ang, w * .7, o.watch, o.watchK ?? 1);
  drawHand(hx, hy, ang, w * 1.05, skin, { grip: o.grip, flip: o.flipThumb });
  if (o.hold) o.hold(hx + Math.cos(ang) * w * .3, hy + Math.sin(ang) * w * .3, ang);
  return [hx, hy]; }
// кисть целиком: ладонь, четыре пальца (сомкнуты или обхватывают предмет), большой палец. ang — направление предплечья
function drawHand(x, y, ang, w, skin, { grip = 0, flip = 0, open = 0 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const sk = C(skin), dk = 'rgba(120,50,40,.28)', sy = flip ? -1 : 1;
  ctx.fillStyle = sk; rr(-w * .1, -w * .55, w * 1.0, w * 1.1, w * .38); ctx.fill(); // ладонь
  const fl = w * lerp(.85, .38, grip); for (let i = 0; i < 4; i++) { const fy = -w * .5 + i * w * .33 + (open ? (i - 1.5) * w * .12 : 0); ctx.fillStyle = sk; rr(w * .62, fy, fl, w * .3, w * .15); ctx.fill(); if (i) { ctx.fillStyle = dk; ctx.fillRect(w * .66, fy - 1, fl * .8, 2.5); } }
  ctx.fillStyle = sk; ctx.save(); ctx.translate(w * .35, -sy * w * .5); ctx.rotate(-sy * (grip ? .2 : .75)); rr(0, -w * .16, w * .62, w * .32, w * .16); ctx.fill(); ctx.restore();
  ctx.fillStyle = dk; ctx.fillRect(w * .1, w * .3 * sy - 1, w * .5, 2.5); ctx.restore(); }
function watchOnWrist(x, y, ang, s, kind, k = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
  if (kind === 'smart') { ctx.fillStyle = '#111318'; rr(-s * .62, -s * .2, s * 1.24, s * .4, s * .08); ctx.fill(); rr(-s * .4, -s * .36, s * .8, s * .72, s * .16); ctx.fill(); ctx.fillStyle = k > 0 ? `rgba(127,179,255,${.9 * k})` : '#05060a'; rr(-s * .32, -s * .28, s * .64, s * .56, s * .12); ctx.fill();
    if (k > 0) { ctx.globalCompositeOperation = 'lighter'; glow(0, 0, s * 1.2, `rgba(127,179,255,${.35 * k})`); } }
  else { ctx.fillStyle = C('#6B3E22'); rr(-s * .62, -s * .2, s * 1.24, s * .4, s * .08); ctx.fill(); ctx.fillStyle = C('#C9A45A'); circle(0, 0, s * .4); ctx.fill(); ctx.fillStyle = C('#F2E8D2'); circle(0, 0, s * .32); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(1.5, s * .05); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * .24); ctx.moveTo(0, 0); ctx.lineTo(-s * .17, s * .1); ctx.stroke(); }
  ctx.restore(); }

// ───── по пояс: (x, y) — основание шеи. part: 'body' | 'arms' | 'all'. armL/armR: [a1, a2] или { to: [x, y] } ─────
function bust(x, y, s, t, who, o = {}) { const c = CAST[who], R = 95 * s, br = AK.breathe(t, c.seed, 3 * s), sw = 125 * s * c.sh, part = o.part || 'all'; y += br;
  const hx = x + (o.lean || 0) * R * .4, hy = y - R * (c.neck + c.hh * .96) - (o.duck || 0) * R * .5;
  if (part !== 'arms') {
    const torso = (dx, dy) => { ctx.moveTo(x - sw + dx, y + 70 * s + dy); ctx.quadraticCurveTo(x - sw + dx, y + 4 * s + dy, x - sw * .45 + dx, y + dy); ctx.lineTo(x + sw * .45 + dx, y + dy); ctx.quadraticCurveTo(x + sw + dx, y + 4 * s + dy, x + sw + dx, y + 70 * s + dy); ctx.lineTo(x + sw * 1.08 + dx, y + 640 * s + dy); ctx.lineTo(x - sw * 1.08 + dx, y + 640 * s + dy); ctx.closePath(); };
    ctx.fillStyle = C(c.skin); rr(hx - R * .26, hy + R * c.hh * .6, R * .52, y - hy - R * c.hh * .6 + 20 * s, R * .2); ctx.fill(); // шея
    ctx.beginPath(); torso(0, 0); ctx.fillStyle = C(c.top); ctx.fill();
    if (c.plaid) { ctx.save(); ctx.beginPath(); torso(0, 0); ctx.clip(); ctx.strokeStyle = C('#5E2216'); ctx.lineWidth = 9 * s; for (let i = -6; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + i * 46 * s, y - 10); ctx.lineTo(x + i * 46 * s, y + 700 * s); ctx.moveTo(x - 400 * s, y + 30 * s + i * 46 * s); ctx.lineTo(x + 400 * s, y + 30 * s + i * 46 * s); ctx.stroke(); }
      ctx.strokeStyle = C('#E3B25C'); ctx.lineWidth = 3 * s; for (let i = -6; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + i * 46 * s + 18 * s, y - 10); ctx.lineTo(x + i * 46 * s + 18 * s, y + 700 * s); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = C('#8E3624'); ctx.beginPath(); ctx.moveTo(x - 40 * s, y); ctx.lineTo(x, y + 60 * s); ctx.lineTo(x + 40 * s, y); ctx.closePath(); ctx.fill(); }
    if (c.stripes) { ctx.fillStyle = C('#1A1A22'); ctx.fillRect(x - 4 * s, y + 20 * s, 8 * s, 620 * s); ctx.fillStyle = C('#E9ECF2'); ctx.fillRect(x - sw * .98, y + 60 * s, 10 * s, 560 * s); ctx.fillRect(x + sw * .98 - 10 * s, y + 60 * s, 10 * s, 560 * s);
      ctx.fillStyle = C('#1B2662'); rr(x - 70 * s, y - 14 * s, 140 * s, 40 * s, 16 * s); ctx.fill(); }
    if (c.collar) { ctx.fillStyle = C('#BCCADB'); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y + 40 * s); ctx.lineTo(x + sx * 78 * s, y - 16 * s); ctx.lineTo(x + sx * 92 * s, y + 30 * s); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = C(c.skin); ctx.beginPath(); ctx.moveTo(x - 26 * s, y); ctx.lineTo(x, y + 70 * s); ctx.lineTo(x + 26 * s, y); ctx.fill(); ctx.fillStyle = C('#9FB2C8'); for (let i = 0; i < 4; i++) { circle(x, y + 110 * s + i * 95 * s, 7 * s); ctx.fill(); } ctx.fillStyle = 'rgba(80,100,130,.25)'; ctx.fillRect(x - 2 * s, y + 80 * s, 4 * s, 560 * s); }
    if (c.tee) { ctx.fillStyle = C('#D8D2C4'); rr(x - 60 * s, y - 10 * s, 120 * s, 26 * s, 13 * s); ctx.fill(); }
    if (who === 'dias_old') { ctx.fillStyle = C('#B7811F'); rr(x - 66 * s, y - 12 * s, 132 * s, 36 * s, 18 * s); ctx.fill(); ctx.strokeStyle = 'rgba(80,40,10,.18)'; ctx.lineWidth = 4 * s; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - sw * .9 + i * 6, y + 120 * s + i * 90 * s); ctx.lineTo(x + sw * .9, y + 120 * s + i * 90 * s); ctx.stroke(); } }
    if (c.hood) { ctx.fillStyle = C('#E9ECF2'); for (const sx of [-1, 1]) ctx.fillRect(x + sx * 30 * s - 3 * s, y + 10 * s, 6 * s, 150 * s); ctx.fillStyle = C(mix(c.top, '#000000', .2)); rr(x - sw * .7, y + 300 * s, sw * 1.4, 150 * s, 30 * s); ctx.fill(); }
    if (c.blouse) { ctx.fillStyle = C('#F2EEE6'); ctx.beginPath(); ctx.moveTo(x - 50 * s, y - 4); ctx.lineTo(x, y + 120 * s); ctx.lineTo(x + 50 * s, y - 4); ctx.fill(); ctx.fillStyle = C('#141B33'); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * 50 * s, y); ctx.lineTo(x + sx * 8 * s, y + 140 * s); ctx.lineTo(x + sx * 90 * s, y + 70 * s); ctx.fill(); } }
    cutShade(torso, -sw * .22, -20 * s, 'rgba(30,12,40,.22)');
    head(hx, hy, R, who, { ...o, blink: o.blink ?? AK.blink(t, c.seed) });
    if (c.phones && !o.phonesOff) { ctx.strokeStyle = C(c.phones); ctx.lineWidth = 16 * s; ctx.beginPath(); ctx.ellipse(hx, y - 6 * s, R * .75, R * .32, 0, .1, Math.PI - .1); ctx.stroke(); for (const sx of [-1, 1]) { ctx.fillStyle = C('#2a2a30'); rr(hx + sx * R * .78 - 22 * s, y - 50 * s, 44 * s, 62 * s, 16 * s); ctx.fill(); ctx.fillStyle = C(c.phones); rr(hx + sx * R * .78 - 16 * s, y - 44 * s, 32 * s, 50 * s, 12 * s); ctx.fill(); } }
    if (o.under) underLight(hx, hy, R, o.under, o.underRgb);
  }
  if (part !== 'body' && !o.noArms) { const l1 = 150 * s, l2 = 140 * s, w = 34 * s; /* рука не шире трети головы (урок ҚУАТ, правки с.1) */
    for (const [sx, key] of [[-1, 'armL'], [1, 'armR']]) { const ax = x + sx * sw * .86, ay = y + 46 * s; let a = o[key] || [sx * -.15, sx * .2]; if (a.to) a = AK.reach(ax, ay, a.to[0], a.to[1], l1, l2, a.flip ?? -sx);
      const wk = (sx === 1 && c.watch) ? c.watch : null; arm(ax, ay, a[0], a[1], l1, l2, w, c.top, c.skin, { stripes: c.stripes, watch: wk, watchK: o.watchK, hold: sx === 1 ? o.holdR : o.holdL, flipThumb: sx < 0, grip: sx === 1 ? o.gripR : o.gripL }); } }
  return { hx, hy, R }; }

// ───── предметы ─────
function phoneObj(x, y, s, ang = 0, { screen = 0, torch = 0, back = 0 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = '#16181f'; rr(-34 * s, -64 * s, 68 * s, 128 * s, 12 * s); ctx.fill();
  if (!back) { ctx.fillStyle = screen ? `rgba(127,179,255,${.35 + .6 * screen})` : '#0a0c12'; rr(-29 * s, -58 * s, 58 * s, 116 * s, 9 * s); ctx.fill(); }
  else { ctx.fillStyle = '#2b2f3a'; rr(-26 * s, -56 * s, 22 * s, 30 * s, 6 * s); ctx.fill(); if (torch) { ctx.fillStyle = '#fffbe8'; circle(-15 * s, -48 * s, 6 * s); ctx.fill(); } }
  ctx.restore(); }
function kese(x, y, s, { tea = 1, jitter = 0 } = {}) { ctx.save(); ctx.translate(x + jitter, y); ctx.fillStyle = C('#F4F1EA'); ctx.beginPath(); ctx.moveTo(-46 * s, -30 * s); ctx.quadraticCurveTo(-44 * s, 30 * s, 0, 34 * s); ctx.quadraticCurveTo(44 * s, 30 * s, 46 * s, -30 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C('#2E5AA8'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(-40 * s, -12 * s); ctx.quadraticCurveTo(0, 2 * s, 40 * s, -12 * s); ctx.stroke(); for (let i = -2; i <= 2; i++) { ctx.fillStyle = C('#2E5AA8'); circle(i * 16 * s, 10 * s, 3.5 * s); ctx.fill(); }
  ctx.fillStyle = C('#EDE6D8'); ctx.beginPath(); ctx.ellipse(0, -30 * s, 46 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill(); if (tea) { ctx.fillStyle = C('#8A4A1C'); ctx.beginPath(); ctx.ellipse(0, -28 * s, 38 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
function steam(x, y, t, k = 1, s = 1) { for (let i = 0; i < 4; i++) { const ph = ((t * .5 + i * .25) % 1); AK.puff(x + Math.sin(t * 1.3 + i) * 18 * s * ph, y - ph * 160 * s, (20 + ph * 50) * s, '255,245,230', .16 * k * Math.sin(ph * Math.PI)); } }
function teapot(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = C('#F4F1EA'); ctx.beginPath(); ctx.ellipse(0, 0, 80 * s, 66 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(70 * s, 0); ctx.quadraticCurveTo(130 * s, -10 * s, 140 * s, -60 * s); ctx.lineTo(126 * s, -64 * s); ctx.quadraticCurveTo(112 * s, -26 * s, 60 * s, -26 * s); ctx.fill();
  ctx.fillStyle = C('#2E5AA8'); ctx.beginPath(); ctx.ellipse(0, -60 * s, 40 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill(); circle(0, -76 * s, 12 * s); ctx.fill(); ctx.strokeStyle = C('#2E5AA8'); ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.ellipse(0, 4 * s, 56 * s, 30 * s, 0, .3, Math.PI - .3); ctx.stroke(); cutShade(ell(0, 0, 80 * s, 66 * s), -22 * s, -16 * s, 'rgba(30,12,40,.2)'); ctx.restore(); }
function plov(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = C('#E9E1D0'); ctx.beginPath(); ctx.ellipse(0, 0, 230 * s, 62 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C('#2E5AA8'); ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.ellipse(0, 0, 210 * s, 54 * s, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C('#E8B95A'); ctx.beginPath(); ctx.ellipse(0, -14 * s, 170 * s, 44 * s, 0, Math.PI, 0); ctx.quadraticCurveTo(120 * s, -6 * s, 0, -2 * s); ctx.quadraticCurveTo(-120 * s, -6 * s, -170 * s, -14 * s); ctx.fill();
  const r = seeded(9); for (let i = 0; i < 26; i++) { ctx.fillStyle = C(i % 3 ? '#E07A2A' : '#7A3E22'); rr((r() - .5) * 280 * s, -18 * s - r() * 36 * s, (i % 3 ? 26 : 34) * s, (i % 3 ? 8 : 16) * s, 4 * s); ctx.fill(); } ctx.restore(); }
function bread(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = C('#C98A44'); ctx.beginPath(); ctx.ellipse(0, 0, 110 * s, 34 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C('#E2B26C'); ctx.beginPath(); ctx.ellipse(0, -4 * s, 66 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C('#9A6230'); for (let i = 0; i < 7; i++) { circle(-40 * s + i * 13 * s, -4 * s + Math.sin(i) * 6 * s, 3 * s); ctx.fill(); } ctx.restore(); }

// ───── люстра: латунное кольцо, рожки, хрусталь; swing — угол, on 0..1 ─────
function chandelier(x, y, s, t, { swing = 0, on = 1, jit = 0 } = {}) { ctx.save(); ctx.translate(x, 0); ctx.rotate(swing); ctx.strokeStyle = C('#6E5530'); ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, y - 40 * s); ctx.stroke();
  if (on > 0) glow(0, y, 520 * s, `rgba(255,200,110,${.55 * on})`);
  ctx.fillStyle = C('#B8893A'); ctx.beginPath(); ctx.ellipse(0, y, 150 * s, 30 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C('#8A6426'); ctx.beginPath(); ctx.ellipse(0, y + 6 * s, 150 * s, 24 * s, 0, 0, Math.PI); ctx.fill();
  for (let i = 0; i < 5; i++) { const bx = (i - 2) * 64 * s, by = y - 34 * s - Math.abs(i - 2) * -6 * s; ctx.fillStyle = C('#B8893A'); rr(bx - 10 * s, by, 20 * s, 34 * s, 4 * s); ctx.fill();
    ctx.fillStyle = on > 0 ? `rgba(255,236,190,${.4 + .6 * on})` : C('#6b6458'); ctx.beginPath(); ctx.ellipse(bx, by - 18 * s, 15 * s, 22 * s, 0, 0, Math.PI * 2); ctx.fill(); if (on > 0) glow(bx, by - 18 * s, 70 * s, `rgba(255,220,150,${.7 * on})`); }
  for (let i = 0; i < 11; i++) { const dx = (i - 5) * 27 * s, j = Math.sin(t * 40 + i) * jit, dy = y + 30 * s + (i % 2) * 14 * s; ctx.strokeStyle = 'rgba(220,220,230,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx, y + 22 * s); ctx.lineTo(dx + j, dy); ctx.stroke();
    ctx.fillStyle = on > 0 ? `rgba(255,240,210,${.5 + .4 * on})` : 'rgba(150,160,190,.45)'; ctx.beginPath(); ctx.moveTo(dx + j, dy - 6 * s); ctx.lineTo(dx + j + 7 * s, dy + 8 * s); ctx.lineTo(dx + j, dy + 22 * s); ctx.lineTo(dx + j - 7 * s, dy + 8 * s); ctx.fill(); }
  ctx.restore(); }

// ───── комната Диаса: обои, ковёр на стене, окно с городом и горами, люстра ─────
function wallpaper(x0, y0, w, h) { const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, C('#5E3A33')); g.addColorStop(1, C('#3E2522')); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = 'rgba(255,220,170,.05)'; for (let x = x0; x < x0 + w; x += 90) ctx.fillRect(x, y0, 26, h); ctx.fillStyle = 'rgba(255,220,170,.06)'; for (let x = x0 + 45; x < x0 + w; x += 90) for (let y = y0 + 40; y < y0 + h; y += 110) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-9, -9, 18, 18); ctx.restore(); } }
function carpet(x, y, w, h) { ctx.fillStyle = C('#6E1A26'); rr(x, y, w, h, 8); ctx.fill(); ctx.strokeStyle = C('#C98B3A'); ctx.lineWidth = 10; ctx.strokeRect(x + 26, y + 26, w - 52, h - 52); ctx.strokeStyle = C('#2A3A6A'); ctx.lineWidth = 16; ctx.strokeRect(x + 50, y + 50, w - 100, h - 100);
  ctx.fillStyle = C('#C98B3A'); const cx = x + w / 2, cy = y + h / 2; for (const [k, col] of [[1, '#C98B3A'], [.7, '#2A3A6A'], [.4, '#E8D3A0']]) { ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(cx, cy - h * .3 * k); ctx.lineTo(cx + w * .22 * k, cy); ctx.lineTo(cx, cy + h * .3 * k); ctx.lineTo(cx - w * .22 * k, cy); ctx.fill(); }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { ctx.fillStyle = C('#E8D3A0'); ctx.beginPath(); const px = cx + sx * w * .33, py = cy + sy * h * .28; ctx.moveTo(px, py - 30); ctx.lineTo(px + 22, py); ctx.lineTo(px, py + 30); ctx.lineTo(px - 22, py); ctx.fill(); }
  ctx.fillStyle = C('#E8D3A0'); for (let i = 0; i < w; i += 22) { ctx.fillRect(x + i, y + h, 6, 26); } }
// окно: город с огнями и горами. lightsK(x) → 0..1 — горит ли огонь по x (для волны блэкаута)
function cityWindow(x, y, w, h, t, lightsK = () => 1) { ctx.save(); rr(x, y, w, h, 6); ctx.clip(); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0E1530'); g.addColorStop(1, '#2A2A48'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1A2340'; ctx.beginPath(); ctx.moveTo(x, y + h * .5); for (let i = 0; i <= 8; i++) ctx.lineTo(x + w * i / 8, y + h * (.36 + .12 * Math.sin(i * 2.1))); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.fill();
  const r = seeded(31); for (let i = 0; i < 60; i++) { const px = x + r() * w, py = y + h * (.55 + r() * .45), k = lightsK(px); if (k > 0) { ctx.fillStyle = `rgba(242,179,61,${(.5 + r() * .5) * k})`; ctx.fillRect(px, py, 6, 8); } }
  ctx.restore(); ctx.strokeStyle = C('#E8E0D0'); ctx.lineWidth = 16; ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h * .35); ctx.lineTo(x + w, y + h * .35); ctx.lineWidth = 10; ctx.stroke(); }
// стол: скатерть с красной каймой. top — y верха, перспектива сверху
function table(y, { x0 = 60, x1 = 1020 } = {}) { ctx.fillStyle = C('#EFE6D4'); ctx.beginPath(); ctx.moveTo(x0 + 60, y); ctx.lineTo(x1 - 60, y); ctx.lineTo(x1 + 40, y + 160); ctx.lineTo(x0 - 40, y + 160); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C('#DCD0B8'); ctx.fillRect(x0 - 40, y + 160, x1 - x0 + 80, 620); ctx.fillStyle = C('#B22A2E'); ctx.fillRect(x0 - 40, y + 190, x1 - x0 + 80, 26); for (let i = 0; i < 26; i++) { ctx.fillStyle = C('#B22A2E'); ctx.beginPath(); ctx.moveTo(x0 - 40 + i * 44, y + 216); ctx.lineTo(x0 - 18 + i * 44, y + 250); ctx.lineTo(x0 + 4 + i * 44, y + 216); ctx.fill(); }
  ctx.fillStyle = 'rgba(30,12,40,.25)'; ctx.fillRect(x0 - 40, y + 160, x1 - x0 + 80, 16); }

// ───── сталинка: фасад с карнизом, пилястрами, арками; windows(i, j) → { on, col } ─────
function stalinka(x0, top, w, floorH, t, { lit = () => 1, sign = 0 } = {}) { const floors = 4, bottom = top + floors * floorH + 160;
  ctx.fillStyle = C('#7A644E'); ctx.fillRect(x0, top, w, bottom - top); const g = ctx.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, 'rgba(255,200,120,.0)'); g.addColorStop(1, 'rgba(255,190,110,.18)'); ctx.fillStyle = g; ctx.fillRect(x0, top, w, bottom - top);
  ctx.fillStyle = C('#8E775E'); for (let i = 0; i <= 5; i++) ctx.fillRect(x0 + i * w / 5 - 14, top, 28, bottom - top - 160); // пилястры
  ctx.fillStyle = C('#9C8468'); ctx.fillRect(x0 - 30, top - 60, w + 60, 46); ctx.fillStyle = C('#5E4C3A'); ctx.fillRect(x0 - 30, top - 14, w + 60, 14); for (let i = 0; i < w / 40; i++) { ctx.fillStyle = C('#8E775E'); ctx.fillRect(x0 + i * 40, top - 14, 18, 22); } // карниз с сухариками
  ctx.fillStyle = C('#5E4C3A'); ctx.fillRect(x0 - 10, top + floorH * 1 - 10, w + 20, 14); // межэтажный пояс
  const cols = 5; for (let f = 0; f < floors; f++) for (let j = 0; j < cols; j++) { const wx = x0 + (j + .5) * w / cols - 52, wy = top + 40 + f * floorH, wh = floorH - 90, L = lit(f, j, wx + 52);
    ctx.fillStyle = C('#4C3C2E'); rr(wx - 12, wy - 12, 128, wh + 24, f === 1 ? 64 : 6); ctx.fill();
    ctx.fillStyle = L.on > 0 ? mix('#1a1f33', L.col || '#F2B33D', L.on) : '#141a2c'; rr(wx, wy, 104, wh, f === 1 ? 52 : 4); ctx.fill();
    if (L.on > 0) { glow(wx + 52, wy + wh / 2, 150, `rgba(242,179,61,${.22 * L.on})`); ctx.fillStyle = `rgba(150,60,40,${.45 * L.on})`; ctx.fillRect(wx, wy + 6, 26, wh - 6); ctx.fillRect(wx + 78, wy + 6, 26, wh - 6); if (L.who) { ctx.fillStyle = 'rgba(40,20,20,.55)'; circle(wx + 52, wy + wh - 60, 22); ctx.fill(); rr(wx + 26, wy + wh - 40, 52, 50, 18); ctx.fill(); } }
    ctx.fillStyle = C('#B8A487'); ctx.fillRect(wx - 16, wy + wh + 4, 136, 12); ctx.strokeStyle = 'rgba(30,20,20,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + 52, wy); ctx.lineTo(wx + 52, wy + wh); ctx.moveTo(wx, wy + wh * .3); ctx.lineTo(wx + 104, wy + wh * .3); ctx.stroke(); }
  // первый этаж: арка подъезда
  ctx.fillStyle = C('#5E4C3A'); ctx.fillRect(x0, bottom - 170, w, 20); const ax = x0 + w / 2; ctx.fillStyle = C('#2A2220'); rr(ax - 90, bottom - 150, 180, 150, 80); ctx.fill(); ctx.fillStyle = 'rgba(242,179,61,.5)'; rr(ax - 60, bottom - 120, 120, 120, 56); ctx.fill(); glow(ax, bottom - 60, 200, 'rgba(242,179,61,.3)');
  return bottom; }
// Заилийский Алатау: силуэт с белыми вершинами
function mountains(y, t, { k = 1, seed = 4, amp = 1 } = {}) { const r = seeded(seed), pts = []; for (let i = 0; i <= 12; i++) pts.push([-80 + i * 104, y - (120 + r() * 260) * amp * (i % 2 ? .7 : 1)]);
  ctx.fillStyle = C('#1A2340'); ctx.beginPath(); ctx.moveTo(-100, y + 400); pts.forEach(([x, yy]) => ctx.lineTo(x, yy)); ctx.lineTo(1200, y + 400); ctx.fill();
  ctx.fillStyle = `rgba(200,212,240,${.55 * k})`; pts.forEach(([x, yy], i) => { if (i % 2) return; const h = 70 * amp; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - 46, yy + h); ctx.lineTo(x - 18, yy + h * .8); ctx.lineTo(x + 6, yy + h * 1.05); ctx.lineTo(x + 30, yy + h * .75); ctx.lineTo(x + 52, yy + h); ctx.closePath(); ctx.fill(); });
  const g = ctx.createLinearGradient(0, y - 200, 0, y + 200); g.addColorStop(0, 'rgba(26,35,64,0)'); g.addColorStop(1, 'rgba(40,40,70,.8)'); ctx.fillStyle = g; ctx.fillRect(-100, y - 200, 1300, 600); }
function nightSky(t, { cityGlow = 1, storm = 0 } = {}) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0B1020'); g.addColorStop(.55, '#1A2340'); g.addColorStop(1, mix('#1A2340', '#6B4A3A', .6 * cityGlow)); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  for (let i = 0; i < 9; i++) { const x = ((i * 173 + t * 12) % 1500) - 200, y = 300 + (i % 4) * 140; AK.puff(x, y, 260 + (i % 3) * 80, cityGlow > .1 ? '90,70,80' : '40,46,72', .5); }
  if (storm > 0) { glow(760, 380, 600, `rgba(185,198,255,${.45 * storm})`); } }
// лист клёна/тополя, падает с покачиванием
function leaf(x, y, s, rot, col = '#E8A42A') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(0, -26 * s); ctx.quadraticCurveTo(22 * s, -10 * s, 0, 26 * s); ctx.quadraticCurveTo(-22 * s, -10 * s, 0, -26 * s); ctx.fill(); ctx.strokeStyle = 'rgba(120,60,10,.6)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(0, -22 * s); ctx.lineTo(0, 30 * s); ctx.stroke(); ctx.restore(); }
function fallingLeaves(t, n, seed, { s = 1, area = [0, 1080, -100, 1900] } = {}) { const r = seeded(seed); for (let i = 0; i < n; i++) { const x0 = area[0] + r() * (area[1] - area[0]), sp = 60 + r() * 90, ph = r() * 10, sz = (.7 + r() * .8) * s, col = ['#E8A42A', '#D9782A', '#F2C14E'][i % 3];
  const y = area[2] + ((t * sp + r() * 2000) % (area[3] - area[2])); leaf(x0 + Math.sin(t * 1.6 + ph) * 50, y, sz, Math.sin(t * 2.3 + ph) * 1.2, col); } }
// фонарь: столб и тёплый конус
function streetLamp(x, y, h, on = 1) { ctx.fillStyle = C('#22262F'); ctx.fillRect(x - 7, y - h, 14, h); ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + 10, y - h - 50, x + 70, y - h - 40); ctx.lineWidth = 10; ctx.strokeStyle = C('#22262F'); ctx.stroke();
  ctx.fillStyle = C('#22262F'); rr(x + 50, y - h - 46, 56, 24, 8); ctx.fill(); if (on > 0) { ctx.fillStyle = `rgba(255,214,140,${on})`; ctx.fillRect(x + 56, y - h - 24, 44, 8); glow(x + 78, y - h - 16, 260, `rgba(242,179,61,${.5 * on})`);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, `rgba(242,179,61,${.18 * on})`); g.addColorStop(1, 'rgba(242,179,61,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 58, y - h - 18); ctx.lineTo(x + 98, y - h - 18); ctx.lineTo(x + 260, y); ctx.lineTo(x - 100, y); ctx.fill(); ctx.restore(); } }

// ───── силуэт истребителя без опознавательных знаков (вид снизу) ─────
function jetSilhouette(x, y, s, rot, t, { burn = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (burn > 0) { glow(-300, -30, 160, `rgba(255,150,70,${.7 * burn})`); glow(-300, 30, 160, `rgba(255,150,70,${.7 * burn})`); for (let i = 1; i < 6; i++) AK.puff(-300 - i * 90, 0, 60 + i * 30, '120,110,130', .08 * burn); }
  ctx.fillStyle = '#0E1222'; ctx.beginPath(); ctx.moveTo(330, 0); ctx.quadraticCurveTo(250, -26, 120, -40); ctx.lineTo(30, -50); ctx.lineTo(-90, -250); ctx.lineTo(-150, -250); ctx.lineTo(-110, -60); ctx.lineTo(-230, -56); ctx.lineTo(-300, -130); ctx.lineTo(-330, -130); ctx.lineTo(-300, -40);
  ctx.lineTo(-300, 40); ctx.lineTo(-330, 130); ctx.lineTo(-300, 130); ctx.lineTo(-230, 56); ctx.lineTo(-110, 60); ctx.lineTo(-150, 250); ctx.lineTo(-90, 250); ctx.lineTo(30, 50); ctx.lineTo(120, 40); ctx.quadraticCurveTo(250, 26, 330, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(242,179,61,.25)'; ctx.lineWidth = 4; ctx.stroke(); // подсветка снизу огнями города
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.ellipse(60, 0, 220, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

// ───── входная дверь изнутри: дерматин с «пуговицами», глазок, ручка ─────
function door(t, { hit = { dx: 0, dy: 0, sx: 1, sy: 1 }, gap = null } = {}) { ctx.fillStyle = C('#3C2A2A'); ctx.fillRect(-200, -200, W + 400, H + 400); wallpaper(-200, 0, W + 400, H);
  ctx.fillStyle = C('#5A4436'); ctx.fillRect(170, 300, 740, 1320); // наличник
  ctx.save(); ctx.translate(540 + hit.dx, 960 + hit.dy); ctx.scale(hit.sx, hit.sy); ctx.translate(-540, -960);
  ctx.fillStyle = C('#5B1F22'); rr(210, 340, 660, 1260, 18); ctx.fill(); ctx.strokeStyle = C('#3E1214'); ctx.lineWidth = 4; for (let i = 0; i < 6; i++) for (let j = 0; j < 11; j++) { const px = 270 + i * 108 + (j % 2) * 54, py = 400 + j * 110; if (px > 840) continue;
    ctx.beginPath(); ctx.moveTo(px, py - 55); ctx.lineTo(px + 54, py); ctx.lineTo(px, py + 55); ctx.lineTo(px - 54, py); ctx.closePath(); ctx.stroke(); ctx.fillStyle = C('#C9A45A'); circle(px, py - 55, 7); ctx.fill(); }
  ctx.fillStyle = C('#C9A45A'); circle(540, 700, 16); ctx.fill(); ctx.fillStyle = '#111'; circle(540, 700, 8); ctx.fill(); // глазок
  ctx.fillStyle = C('#C9A45A'); rr(760, 1000, 30, 90, 8); ctx.fill(); rr(690, 1030, 100, 26, 12); ctx.fill(); // ручка
  ctx.strokeStyle = C('#8A8F99'); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(800, 900); ctx.quadraticCurveTo(760, 960, 820, 1000); ctx.stroke(); // цепочка
  ctx.restore();
  // щель под дверью: свет с площадки и тень ног
  ctx.fillStyle = '#05060a'; ctx.fillRect(210, 1600, 660, 22); if (gap) { ctx.save(); ctx.beginPath(); ctx.rect(210, 1600, 660, 22); ctx.clip(); const gx = gap.x; const g = ctx.createLinearGradient(gx - 260, 0, gx + 260, 0); g.addColorStop(0, 'rgba(255,250,230,0)'); g.addColorStop(.5, `rgba(255,250,230,${gap.k})`); g.addColorStop(1, 'rgba(255,250,230,0)'); ctx.fillStyle = g; ctx.fillRect(210, 1600, 660, 22);
    ctx.fillStyle = '#05060a'; for (const fx of gap.feet) ctx.fillRect(fx - 40, 1600, 80, 22); ctx.restore(); glow(gap.x, 1640, 240, `rgba(255,250,230,${.25 * gap.k})`); }
  ctx.fillStyle = C('#2E2422'); ctx.fillRect(-200, 1622, W + 400, 400); ctx.fillStyle = C('#4A3A30'); rr(300, 1650, 480, 90, 10); ctx.fill(); // пол, коврик
  for (const [sx, col] of [[380, '#2a2a30'], [500, '#4a2a20'], [640, '#22262f']]) { ctx.fillStyle = C(col); rr(sx, 1680, 90, 40, 18); ctx.fill(); } }

// ───── телевизор: корпус и экран. Внутри экрана рисует draw(x, y, w, h) ─────
function tvSet(x, y, w, h, draw, { on = 1 } = {}) { ctx.fillStyle = '#0d0e12'; rr(x - 22, y - 22, w + 44, h + 44, 20); ctx.fill(); ctx.save(); rr(x, y, w, h, 8); ctx.clip(); ctx.fillStyle = '#05060a'; ctx.fillRect(x, y, w, h); if (on > 0) draw(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let yy = y; yy < y + h; yy += 6) ctx.fillRect(x, yy, w, 2); ctx.restore(); if (on > 0) glow(x + w / 2, y + h / 2, Math.max(w, h) * .9, `rgba(127,179,255,${.25 * on})`); }
