// «ҚУАТ» — персонажи и фоны (плоский вектор, части анимируются отдельно, детерминированно по t).
'use strict';
const SKIN = '#e3a67f', HAIR = '#17151f', STREAK = '#eef3f8', HOODIE = '#8e939e', HOODIE_D = '#6c717c', JEANS = '#3b4a6b', STRAP = '#24305a';
const dvec = a => [Math.sin(a), Math.cos(a)]; // угол от «вниз»: 0 — вниз, +π/2 — вправо, π — вверх

// ───── головы ─────
// o: { lid 0..1 (веки), look, lookY, mouth: flat|smile|smirk|open|grit|o|grin, brow: sad|up|angry, streak, stat (волосы дыбом 0..1), rot, glowEyes, sweat }
function eyes(r, o, ex = .33, ey = .05) { const lk = (o.look || 0) * r * .08, lky = (o.lookY || 0) * r * .06, lid = clamp(Math.max(o.lid || 0, o.noBlink || o.glowEyes ? 0 : autoBlink(r * .07 + (o.seed || 0))));
  for (const s2 of [-1, 1]) { const x = s2 * r * ex + lk, y = r * ey + lky, rx = r * .078, ry = r * .1;
    if (lid > .92) { ctx.strokeStyle = T.ol; ctx.lineWidth = r * .045; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y - ry * .2, rx * 1.3, .25, Math.PI - .25); ctx.stroke(); continue; }
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = o.glowEyes ? T.charge : T.ol; ctx.fillRect(x - rx, y - ry, rx * 2, ry * 2); if (!o.glowEyes) { ctx.fillStyle = '#fff'; circle(x + rx * .3, y - ry * .35, r * .024); ctx.fill(); }
    if (lid > 0) { ctx.fillStyle = o.skin || SKIN; ctx.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 2 * lid + 2); ctx.strokeStyle = T.ol; ctx.lineWidth = r * .03; ctx.beginPath(); ctx.moveTo(x - rx, y - ry + ry * 2 * lid); ctx.lineTo(x + rx, y - ry + ry * 2 * lid); ctx.stroke(); }
    ctx.restore(); if (o.glowEyes) glow(x, y, r * .3, 'rgba(61,255,143,.7)'); }
  ctx.strokeStyle = T.ol; ctx.lineWidth = r * .055; ctx.lineCap = 'round';
  for (const s2 of [-1, 1]) { const x = s2 * r * ex + lk, y = -r * .2 + lky * .5, inner = o.brow === 'sad' ? -r * .07 : o.brow === 'angry' ? r * .06 : 0, up = o.brow === 'up' ? -r * .08 : 0;
    ctx.beginPath(); ctx.moveTo(x - s2 * r * .13, y + up + inner); ctx.lineTo(x + s2 * r * .13, y + up); ctx.stroke(); } }
function mouth(r, m = 'flat', y = .45) { ctx.strokeStyle = T.ol; ctx.lineWidth = r * .05; ctx.lineCap = 'round'; ctx.beginPath();
  if (m === 'smile') { ctx.moveTo(-r * .16, r * y); ctx.quadraticCurveTo(0, r * (y + .14), r * .16, r * y); ctx.stroke(); }
  else if (m === 'smirk') { ctx.moveTo(-r * .14, r * (y + .03)); ctx.quadraticCurveTo(r * .04, r * (y + .05), r * .17, r * (y - .05)); ctx.stroke(); }
  else if (m === 'open' || m === 'grin' || m === 'o') { const w2 = m === 'o' ? r * .09 : m === 'grin' ? r * .22 : r * .14, h2 = m === 'grin' ? r * .13 : r * .12; ctx.ellipse(0, r * (y + .03), w2, h2, 0, 0, m === 'grin' ? Math.PI : Math.PI * 2); if (m === 'grin') ctx.closePath(); ctx.fillStyle = '#4a1e24'; ctx.fill(); ctx.stroke(); if (m === 'grin') { ctx.fillStyle = '#fff'; ctx.fillRect(-w2 * .8, r * (y + .03), w2 * 1.6, h2 * .35); } }
  else if (m === 'grit') { rr(-r * .2, r * (y - .04), r * .4, r * .12, r * .04); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * .2, r * (y + .02)); ctx.lineTo(r * .2, r * (y + .02)); ctx.stroke(); }
  else { ctx.moveTo(-r * .12, r * y); ctx.lineTo(r * .12, r * y); ctx.stroke(); } }
function bekaHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); const lw = Math.max(4, r * .05);
  for (const s2 of [-1, 1]) { circle(s2 * r * .97, r * .1, r * .19); fillOL(SKIN, lw * .8); }
  if (o.stat) { ctx.fillStyle = HAIR; for (let i = -4; i <= 4; i++) { const a = -Math.PI / 2 + i * .26, L = r * (.2 + .35 * o.stat * (1 + .3 * Math.sin(i * 3.1))); ctx.beginPath(); ctx.moveTo(Math.cos(a - .12) * r * .9, Math.sin(a - .12) * r * .9); ctx.lineTo(Math.cos(a) * (r + L), Math.sin(a) * (r + L)); ctx.lineTo(Math.cos(a + .12) * r * .9, Math.sin(a + .12) * r * .9); ctx.closePath(); ctx.fill(); } }
  circle(0, 0, r); fillOL(SKIN, lw);
  ctx.save(); circle(0, 0, r * 1.04); ctx.clip();
  const hairPath = () => { ctx.beginPath(); ctx.moveTo(-r * 1.05, -r * .02); ctx.arc(0, 0, r * 1.04, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(r * 1.02, -r * .06);
    for (const [px, py] of [[.72, -.42], [.46, -.3], [.22, -.47], [-.04, -.33], [-.3, -.49], [-.58, -.35], [-.86, -.22]]) ctx.lineTo(px * r, py * r); ctx.closePath(); };
  hairPath(); ctx.fillStyle = HAIR; ctx.fill();
  if (o.streak) { ctx.save(); hairPath(); ctx.clip(); ctx.fillStyle = STREAK; ctx.beginPath(); ctx.moveTo(r * .08, -r * 1.1); ctx.quadraticCurveTo(r * .1, -r * .7, r * .22, -r * .45); ctx.lineTo(r * .46, -r * .28); ctx.quadraticCurveTo(r * .42, -r * .75, r * .36, -r * 1.1); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore(); hairPath(); ctx.lineWidth = lw; ctx.strokeStyle = T.ol; ctx.stroke();
  eyes(r, o); mouth(r, o.mouth);
  if (o.sweat) { ctx.fillStyle = 'rgba(207,232,255,.9)'; ctx.beginPath(); ctx.ellipse(-r * .7, -r * .1 + (o.sweat * r * .3) % (r * .3), r * .05, r * .08, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore(); }
// Ержан: кепка задом наперёд, щёки, широкий рот
function erzhanHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); const lw = Math.max(4, r * .05), sk = '#c98b64';
  ctx.save(); ctx.translate(r * .55, -r * .72); ctx.rotate(.35); ctx.beginPath(); ctx.ellipse(r * .35, 0, r * .55, r * .15, 0, 0, Math.PI * 2); fillOL('#d8325f', lw); ctx.restore(); // козырёк смотрит назад
  for (const s2 of [-1, 1]) { circle(s2 * r * .98, r * .12, r * .19); fillOL(sk, lw * .8); }
  circle(0, 0, r); fillOL(sk, lw);
  ctx.beginPath(); ctx.moveTo(-r * 1.02, -r * .18); ctx.quadraticCurveTo(-r * 1.0, -r * 1.12, 0, -r * 1.1); ctx.quadraticCurveTo(r * 1.0, -r * 1.12, r * 1.02, -r * .18); ctx.quadraticCurveTo(0, -r * .4, -r * 1.02, -r * .18); ctx.closePath(); fillOL('#ff4f7e', lw); // кепка
  ctx.beginPath(); ctx.arc(0, -r * .3, r * .2, Math.PI, 0); ctx.closePath(); fillOL(HAIR, lw * .7); // застёжка спереди, видны волосы
  ctx.fillStyle = 'rgba(230,110,100,.35)'; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s2 * r * .5, r * .32, r * .16, r * .1, 0, 0, Math.PI * 2); ctx.fill(); }
  eyes(r, { ...o, skin: sk }); mouth(r, o.mouth || 'grin', .42); ctx.restore(); }
// студенты общаги: hair: short|long|bun|buzz|beanie
function studentHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(3, r * .05), sk = o.skin || '#d9a07a', hc = o.hairCol || HAIR;
  if (o.hair === 'long') { rr(-r * 1.1, -r * .6, r * 2.2, r * 1.9, r * .6); fillOL(hc, lw); }
  if (o.hair === 'bun') { circle(0, -r * 1.05, r * .38); fillOL(hc, lw); }
  for (const s2 of [-1, 1]) { circle(s2 * r * .97, r * .1, r * .18); fillOL(sk, lw * .8); }
  circle(0, 0, r); fillOL(sk, lw);
  if (o.hair === 'beanie') { ctx.beginPath(); ctx.arc(0, -r * .1, r * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(r, -r * .25); ctx.lineTo(-r, -r * .25); ctx.closePath(); fillOL(o.beanieCol || '#3d6b8a', lw); rr(-r * 1.05, -r * .4, r * 2.1, r * .26, r * .1); fillOL(o.beanieCol || '#3d6b8a', lw); }
  else if (o.hair !== 'buzz') { ctx.beginPath(); ctx.arc(0, 0, r * 1.03, Math.PI * 1.04, Math.PI * 1.96); ctx.quadraticCurveTo(r * .2, -r * .55, -r * 1.0, -r * .08); ctx.closePath(); fillOL(hc, lw); }
  else { ctx.beginPath(); ctx.arc(0, 0, r * 1.01, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(0, -r * .62, -r * .95, -r * .3); ctx.closePath(); ctx.fillStyle = 'rgba(23,21,31,.7)'; ctx.fill(); }
  eyes(r, { ...o, skin: sk }); if (o.glasses) { ctx.strokeStyle = T.ol; ctx.lineWidth = r * .05; for (const s2 of [-1, 1]) { rr(s2 * r * .33 - r * .17, -r * .08, r * .34, r * .26, r * .06); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-r * .16, r * .02); ctx.lineTo(r * .16, r * .02); ctx.stroke(); }
  if (o.beard) { ctx.fillStyle = o.hairCol || HAIR; ctx.beginPath(); ctx.arc(0, r * .2, r * .8, .2, Math.PI - .2); ctx.quadraticCurveTo(0, r * .6, r * .75, r * .35); ctx.fill(); }
  mouth(r, o.mouth || 'flat'); ctx.restore(); }

// ───── тело (общее для всех) ─────
// o: { head: fn(x, y, r), top: hoodie|puffer|pajama, topCol, legsCol, shoeCol, straps, phones (наушники на шее), hood,
//      armL/armR: [плечо, локоть] (углы от «вниз»), legs: walk-фаза | null, lean, hideLegs, holdL/holdR: fn(x, y) — предмет в руке }
// Возвращает точки в координатах вызывающего: { handL, handR, heart, head }
function person(x, y, s, t, o = {}) { const M0 = ctx.getTransform(), toCaller = (px, py) => { const p = M0.inverse().multiply(ctx.getTransform()).transformPoint(new DOMPoint(px, py)); return [p.x, p.y]; };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.hideLegs && !o.sit && o.shadow !== false) { const g = ctx.createRadialGradient(0, 8, 10, 0, 8, 130); g.addColorStop(0, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.save(); ctx.scale(1, .22); ctx.beginPath(); ctx.arc(0, 36, 130, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } // тень на полу
  ctx.rotate(o.lean || 0); const out = {};
  const seed = o.seed ?? (Math.abs(x * 7 + y * 3) % 10), ph0 = o.walk, bob = ph0 != null ? -Math.abs(Math.cos(ph0)) * 9 : o.still ? 0 : Math.sin(NOW * 1.9 + seed) * 3.2; // шаг — подпрыгивание корпуса, в покое — дыхание
  const topCol = o.topCol || HOODIE, wide = o.top === 'puffer' ? 1.16 : 1, limb = (pts, w, col) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.strokeStyle = T.ol; ctx.lineWidth = w + 10; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); };
  if (o.straps) { rr(-92 * wide, -300, 184 * wide, 150, 40); fillOL('#2b3a6e', 5); } // рюкзак за спиной
  if (!o.hideLegs) { const ph = o.walk; for (const sx of [-1, 1]) { const a1 = ph == null ? sx * .05 : .38 * Math.sin(ph + (sx > 0 ? Math.PI : 0)), a2 = ph == null ? 0 : -.35 * Math.max(0, Math.sin(ph + (sx > 0 ? 0 : Math.PI)));
      const hip = [sx * 30, -130], kn = [hip[0] + 66 * Math.sin(a1), hip[1] + 66 * Math.cos(a1)], ft = [kn[0] + 62 * Math.sin(a1 + a2), kn[1] + 62 * Math.cos(a1 + a2)];
      if (o.sit) { const k2 = [sx * 38, -60]; limb([hip, [sx * 34, -96], k2], 40, o.legsCol || JEANS); }
      else { limb([hip, kn, ft], 40, o.legsCol || JEANS); ctx.beginPath(); ctx.ellipse(ft[0] + sx * 6, ft[1] + 4, 32, 15, 0, 0, Math.PI * 2); fillOL(o.shoeCol || '#e9edf2', 5); } } }
  ctx.translate(0, bob); // корпус и голова над бёдрами
  // торс
  if (o.top === 'coat') { ctx.beginPath(); ctx.moveTo(-78, -318); ctx.lineTo(78, -318); ctx.lineTo(92, -30); ctx.lineTo(-92, -30); ctx.closePath(); fillOL(topCol, 6); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, -318); ctx.lineTo(0, -210); ctx.lineTo(40, -318); ctx.moveTo(0, -210); ctx.lineTo(0, -30); ctx.stroke(); ctx.fillStyle = '#ece8f2'; ctx.beginPath(); ctx.moveTo(-26, -318); ctx.lineTo(0, -236); ctx.lineTo(26, -318); ctx.closePath(); ctx.fill(); }
  else rr(-76 * wide, -318, 152 * wide, 206, 48), fillOL(topCol, 6);
  if (o.top === 'coat') { }
  else if (o.top === 'puffer') { ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 4; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-84, -318 + i * 42); ctx.quadraticCurveTo(0, -310 + i * 42, 84, -318 + i * 42); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -312); ctx.lineTo(0, -116); ctx.stroke(); }
  else if (o.top === 'pajama') { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-70, -300 + i * 40); ctx.lineTo(70, -300 + i * 40); ctx.stroke(); } }
  else { rr(-46, -196, 92, 52, 16); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 4; ctx.stroke(); // карман
    ctx.strokeStyle = '#e8e8ea'; ctx.lineWidth = 4; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 18, -300); ctx.lineTo(sx * 20, -246); ctx.stroke(); } }
  if (o.straps) { ctx.fillStyle = STRAP; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 40, -318); ctx.lineTo(sx * 62, -318); ctx.lineTo(sx * 66, -180); ctx.lineTo(sx * 48, -180); ctx.closePath(); ctx.fill(); ctx.strokeStyle = T.ol; ctx.lineWidth = 3; ctx.stroke(); } }
  out.heart = toCaller(-22, -262);
  // руки
  const [L1, L2] = o.armLen || [80, 76];
  for (const sx of [-1, 1]) { const arm = (sx < 0 ? o.armL : o.armR) || (ph0 != null ? [sx * .12 + .32 * Math.sin(ph0 + (sx > 0 ? 0 : Math.PI)), -.25] : [sx * .16, 0]), sh = [sx * 64 * wide, -296], el = [sh[0] + L1 * Math.sin(arm[0]), sh[1] + L1 * Math.cos(arm[0])], hd = [el[0] + L2 * Math.sin(arm[0] + arm[1]), el[1] + L2 * Math.cos(arm[0] + arm[1])];
    limb([sh, el, hd], 36 * wide, topCol); circle(hd[0], hd[1], 19); fillOL(o.skin || SKIN, 5);
    const hold = sx < 0 ? o.holdL : o.holdR; if (hold) hold(hd[0], hd[1]);
    out[sx < 0 ? 'handL' : 'handR'] = toCaller(hd[0], hd[1]); out[sx < 0 ? 'elbowL' : 'elbowR'] = toCaller(el[0], el[1]); out[sx < 0 ? 'shoulderL' : 'shoulderR'] = toCaller(sh[0], sh[1]); }
  // капюшон и наушники на шее
  if (o.top !== 'puffer' && o.top !== 'pajama' && o.top !== 'coat') { ctx.beginPath(); ctx.ellipse(0, -318, 92, 30, 0, 0, Math.PI * 2); fillOL(HOODIE_D, 5); }
  else if (o.top === 'puffer') { rr(-60, -340, 120, 40, 18); fillOL(topCol, 5); }
  if (o.phones) { ctx.strokeStyle = '#1c1f2a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -328, 60, .15, Math.PI - .15); ctx.stroke(); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 62, -318, 20, 26, 0, 0, Math.PI * 2); fillOL('#2a2f3e', 4); ctx.fillStyle = T.cyan; circle(sx * 62, -318, 5); ctx.fill(); } }
  const hy = -400; (o.head || ((hx, hy2, r) => bekaHead(hx, hy2, r, o.face || {})))(0, hy, 84); out.head = toCaller(0, hy);
  ctx.restore(); return out; }
const beka = (x, y, s, t, o = {}) => person(x, y, s, t, { straps: o.straps ?? false, phones: true, ...o, head: (hx, hy, r) => bekaHead(hx, hy, r, o.face || {}) });
const erzhan = (x, y, s, t, o = {}) => person(x, y, s, t, { top: 'puffer', topCol: '#ff8a2a', legsCol: '#2a2d3a', shoeCol: '#ffffff', skin: '#c98b64', ...o, head: (hx, hy, r) => erzhanHead(hx, hy, r, o.face || {}) });
const student = (x, y, s, t, o = {}) => person(x, y, s, t, { ...o, head: (hx, hy, r) => studentHead(hx, hy, r, o.face || {}) });

// ───── телефон в руке (вымышленный, без марок): уровень заряда на экране ─────
function phone(x, y, s, lvl, { rot = 0, lit = 1, full = 0 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(-34, -62, 68, 124, 12); fillOL('#14182a', 4); const col = full > 0 ? T.charge : lvl <= 5 ? T.empty : lvl < 20 ? T.empty : lvl <= 50 ? T.low : T.charge;
  ctx.fillStyle = lit ? (full > 0 ? 'rgba(61,255,143,.22)' : '#0c1124') : '#05060b'; rr(-28, -54, 56, 108, 8); ctx.fill();
  if (lit) { ctx.strokeStyle = col; ctx.lineWidth = 3; rr(-16, -36, 32, 18, 3); ctx.stroke(); ctx.fillStyle = col; rr(-13, -33, Math.max(2, 26 * clamp(full > 0 ? 1 : lvl / 100)), 12, 2); ctx.fill();
    txt(full > 0 ? '100%' : `${lvl}%`, 0, 12, full > 0 ? 20 : 24, col, { font: 'JBM', weight: 800, align: 'center' }); if (full > 0) glow(0, 0, 90 * full, 'rgba(61,255,143,.5)'); }
  ctx.restore(); }

// ───── фоны ─────
function nightSky(t, lit = 0) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070c1c'); g.addColorStop(.5, T.night); g.addColorStop(1, '#22305a'); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  const r = seeded(3); for (let i = 0; i < 9; i++) { const x = r() * W, y = 80 + r() * 600, w2 = 300 + r() * 400; ctx.fillStyle = `rgba(${lerp(30, 200, lit)},${lerp(40, 215, lit)},${lerp(70, 255, lit)},${.55 + .2 * r()})`; ctx.beginPath(); ctx.ellipse(x + Math.sin(t * .1 + i) * 30, y, w2, 70 + r() * 60, 0, 0, Math.PI * 2); ctx.fill(); } // тучи
  if (lit > 0) { ctx.fillStyle = `rgba(200,220,255,${.35 * lit})`; ctx.fillRect(-400, -400, W + 800, H + 800); } }
// общежитие снизу: 9 этажей, тёплые окна, гирлянды, антенна на крыше
function dorm(t, { lit = 0, antennaGlow = 0, roofY = 560 } = {}) { const x0 = 120, x1 = 960, floors = 9, fh = (H + 60 - roofY) / floors;
  ctx.beginPath(); ctx.moveTo(x0 - 60, H + 60); ctx.lineTo(x0 + 30, roofY); ctx.lineTo(x1 - 30, roofY); ctx.lineTo(x1 + 60, H + 60); ctx.closePath(); fillOL('#2a3458', 6); // перспектива снизу — к верху уже
  ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(x0 + 18, roofY - 14, x1 - x0 - 36, 18); // снег на крыше
  const r = seeded(44); for (let f = 0; f < floors; f++) { const y = roofY + 30 + f * fh, sh = lerp(30, -60, f / floors), xa = x0 + 30 - sh * .0 + f * -10, xb = x1 - 30 + f * 10, cols = 6, cw = (xb - xa) / cols;
    for (let c = 0; c < cols; c++) { const wx = xa + c * cw + cw * .18, ww = cw * .64, wh = fh * .56, on = r() < .7, gar = r() < .25; rr(wx, y, ww, wh, 4); fillOL(on ? T.dorm : '#141b33', 3);
      if (on) { glow(wx + ww / 2, y + wh / 2, cw * .9, 'rgba(242,215,166,.18)'); ctx.fillStyle = 'rgba(120,80,40,.25)'; ctx.fillRect(wx, y + wh * .62, ww, wh * .38); } // подоконник с хламом
      if (on && gar) { for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#ff4f7e', '#ffd23d', '#4fd8ff', '#ff8a2a'][(i + Math.floor(t * 3)) % 4]; circle(wx + 8 + i * (ww - 16) / 5, y + 10 + Math.sin(i * 1.4) * 5, 5); ctx.fill(); } } } }
  if (lit > 0) { ctx.fillStyle = `rgba(210,225,255,${.4 * lit})`; ctx.beginPath(); ctx.moveTo(x0 + 30, roofY); ctx.lineTo(x1 - 30, roofY); ctx.lineTo(x1 + 60, H + 60); ctx.lineTo(x0 - 60, H + 60); ctx.closePath(); ctx.fill(); }
  antenna(660, roofY, 1, t, antennaGlow); }
function antenna(x, y, s, t, k = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = T.ol; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -300); ctx.stroke(); ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 9; ctx.stroke();
  for (const [yy, w2] of [[-280, 120], [-220, 90], [-160, 70]]) { ctx.strokeStyle = T.ol; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-w2, yy); ctx.lineTo(w2, yy + 6); ctx.stroke(); ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 6; ctx.stroke(); }
  ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -140); ctx.bezierCurveTo(-60, -80, -40, -30, -110, 0); ctx.stroke(); rr(-140, -8, 50, 24, 6); fillOL('#e9edf2', 3); // удлинитель висит на мачте
  if (k > 0) { glow(0, -150, 260 * k, `rgba(200,230,255,${.8 * k})`); } ctx.restore(); }
// ── комната 412: стена, окно с метелью, гирлянда, часы, полка ──
function roomWall(t, { winX = 640, winY = 330, winW = 360, winH = 460, clock = null, light = 1, winFlash = 0 } = {}) {
  const g = ctx.createRadialGradient(400, 700, 100, 400, 800, 1300); g.addColorStop(0, '#e6c695'); g.addColorStop(.6, '#b8925f'); g.addColorStop(1, '#5a4430'); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.strokeStyle = 'rgba(90,60,30,.18)'; ctx.lineWidth = 3; for (let x = -400; x < W + 400; x += 90) { ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x, 1500); ctx.stroke(); } // обои
  ctx.fillStyle = '#6b4a35'; ctx.fillRect(-400, 1500, W + 800, H); ctx.fillStyle = '#4e3426'; ctx.fillRect(-400, 1500, W + 800, 18); // пол
  // окно
  rr(winX - 20, winY - 20, winW + 40, winH + 40, 10); fillOL('#e9e4d8', 6); ctx.save(); rr(winX, winY, winW, winH, 4); ctx.clip();
  const sg = ctx.createLinearGradient(0, winY, 0, winY + winH); sg.addColorStop(0, '#0b1430'); sg.addColorStop(1, '#22305a'); ctx.fillStyle = sg; ctx.fillRect(winX, winY, winW, winH);
  const r = seeded(8); ctx.fillStyle = '#18213f'; ctx.fillRect(winX + 30, winY + 180, 140, winH); ctx.fillRect(winX + 210, winY + 120, 120, winH); for (let i = 0; i < 18; i++) { ctx.fillStyle = r() < .6 ? T.dorm : '#0e1530'; ctx.fillRect(winX + 44 + (i % 3) * 40 + (i > 8 ? 180 : 0), winY + 200 + Math.floor((i % 9) / 3) * 70 - (i > 8 ? 60 : 0), 22, 34); } // дома напротив
  if (winFlash > 0) { ctx.fillStyle = `rgba(61,255,143,${.55 * winFlash})`; ctx.fillRect(winX, winY, winW, winH); bolt(winX + winW * .7, winY - 20, winX + winW * .45, winY + 150, 21, { w: 5, glowCol: '61,255,143', a: winFlash }); }
  ctx.save(); ctx.translate(winX - 300, 0); snow(t, .9, 160, .9); ctx.restore(); ctx.restore();
  ctx.strokeStyle = '#e9e4d8'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(winX + winW / 2, winY); ctx.lineTo(winX + winW / 2, winY + winH); ctx.moveTo(winX, winY + winH * .3); ctx.lineTo(winX + winW, winY + winH * .3); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(winX + winW / 2, winY + winH - 6, winW / 2, 14, 0, Math.PI, 0); ctx.fill(); // снег на отливе
  garland(t, -100, W + 100, 250);
  if (clock) { const [cx, cy, hh, mm] = clock; circle(cx, cy, 70); fillOL('#f6f1e6', 6); ctx.strokeStyle = T.ol; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 56, cy - Math.cos(a) * 56); ctx.lineTo(cx + Math.sin(a) * 62, cy - Math.cos(a) * 62); ctx.stroke(); }
    const am = mm / 60 * Math.PI * 2, ah = (hh % 12 + mm / 60) / 12 * Math.PI * 2; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ah) * 34, cy - Math.cos(ah) * 34); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(am) * 52, cy - Math.cos(am) * 52); ctx.stroke(); }
  if (light < 1) dim(1 - light); }
function garland(t, x0, x1, y) { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = x0; x <= x1; x += 20) { const yy = y + Math.abs(Math.sin((x - x0) / 260 * Math.PI)) * 60; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke();
  const cols = ['#ff4f7e', '#ffd23d', '#4fd8ff', '#ff8a2a', '#b98cff']; let i = 0; for (let x = x0 + 30; x < x1; x += 65, i++) { const yy = y + Math.abs(Math.sin((x - x0) / 260 * Math.PI)) * 60 + 12, on = (i + Math.floor(t * 2.5)) % 3 !== 0, c = cols[i % cols.length];
    ctx.beginPath(); ctx.ellipse(x, yy, 11, 16, 0, 0, Math.PI * 2); ctx.fillStyle = on ? c : '#555'; ctx.fill(); if (on) glow(x, yy, 46, c + '88'); } }
function bed(x, y, w, { blanket = '#3d6b8a', pillow = '#eae6dc', back = 1 } = {}) { rr(x, y - 40, w, 180, 16); fillOL('#5a3d2c', 6); rr(x + 10, y - 90, w - 20, 90, 30); fillOL(blanket, 6);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 8; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 5, y - 86); ctx.lineTo(x + i * w / 5 - 20, y - 4); ctx.stroke(); }
  if (back) { rr(x + w - 170, y - 150, 150, 80, 30); fillOL(pillow, 5); } }
function desk(x, y, w, h = 70) { rr(x, y, w, h, 8); fillOL('#8a5a3a', 6); ctx.fillStyle = '#6e4529'; ctx.fillRect(x + 8, y + h - 14, w - 16, 10); }
function deskLamp(x, y, on = 1) { ctx.strokeStyle = T.ol; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y - 170); ctx.lineTo(x + 150, y - 230); ctx.stroke(); ctx.strokeStyle = '#3db37a'; ctx.lineWidth = 8; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, 60, 16, 0, 0, Math.PI * 2); fillOL('#3db37a', 5); ctx.save(); ctx.translate(x + 150, y - 230); ctx.rotate(.5); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.lineTo(30, -60); ctx.lineTo(-30, -60); ctx.closePath(); fillOL('#3db37a', 5); ctx.restore();
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x + 190, y - 90, 10, x + 190, y + 40, 420); g.addColorStop(0, 'rgba(255,236,190,.45)'); g.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g; ctx.fillRect(x - 300, y - 400, 900, 800); ctx.restore(); } }
function noodles(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, -90); ctx.lineTo(50, -90); ctx.lineTo(38, 0); ctx.lineTo(-38, 0); ctx.closePath(); fillOL('#f4f1ea', 5); ctx.fillStyle = '#e5383b'; ctx.fillRect(-44, -66, 88, 24);
  ctx.strokeStyle = '#c9a23a'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-36 + i * 18, -90); ctx.quadraticCurveTo(-30 + i * 18, -108, -24 + i * 18, -92); ctx.stroke(); } ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, -88); ctx.lineTo(60, -170); ctx.moveTo(24, -88); ctx.lineTo(74, -166); ctx.stroke(); // вилка-палочки
  for (let i = 0; i < 3; i++) { const ph = (t * .5 + i / 3) % 1; ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - ph)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-20 + i * 20, -100 - ph * 80); ctx.quadraticCurveTo(-30 + i * 20 + Math.sin(t * 3 + i) * 12, -130 - ph * 80, -20 + i * 20, -160 - ph * 80); ctx.stroke(); }
  ctx.restore(); }
function notebook(x, y, s, label, rot = 0, col = '#2f5d9a') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(-110, -70, 220, 140, 6); fillOL(col, 5); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-80, -36, 160, 52); txt(label, 0, -10, 38, T.ink, { align: 'center' }); ctx.restore(); }
// ── коридор в перспективе: точка схода (vx, vy) ──
function corridorPersp(t, { vx = 540, vy = 820, light = 1 } = {}) { ctx.fillStyle = '#c7cbb8'; ctx.fillRect(-400, -400, W + 800, H + 800);
  const quad = (pts, col) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  const fw = 120, fh = 150; quad([[-400, -400], [vx - fw, vy - fh], [vx - fw, vy + fh], [-400, H + 400]], '#a9b39a'); quad([[W + 400, -400], [vx + fw, vy - fh], [vx + fw, vy + fh], [W + 400, H + 400]], '#9aa58c');
  quad([[-400, H + 400], [vx - fw, vy + fh], [vx + fw, vy + fh], [W + 400, H + 400]], '#7a6a58'); quad([[-400, -400], [vx - fw, vy - fh], [vx + fw, vy - fh], [W + 400, -400]], '#dfe3d6');
  ctx.fillStyle = '#5d7a5a'; ctx.fillRect(vx - fw, vy - fh, fw * 2, fh * 2); rr(vx - 40, vy - 100, 80, 250, 4); fillOL('#e8e4d8', 3); // окно в конце
  for (let i = 0; i < 6; i++) { const k = Math.pow(.62, i), z = 1 - k; // лампы и двери
    const ly = lerp(-200, vy - fh, z), lw = lerp(700, fw * 2, z) * .5; rr(vx - lw * .5, ly, lw, 20 * k + 4, 4); ctx.fillStyle = Math.floor(t * 7 + i) % 23 === 0 ? '#9aa' : '#f4fbff'; ctx.fill(); glow(vx, ly + 10, 300 * k + 40, 'rgba(240,250,255,.25)');
    for (const sx of [-1, 1]) { const dx = lerp(sx > 0 ? W + 200 : -200, vx + sx * fw, z), dk = k * 1.0, dh = 620 * dk + 40, dw = 150 * dk + 10, dy = lerp(H + 300, vy + fh, z) - dh; ctx.fillStyle = '#7a4e32'; ctx.fillRect(dx - (sx > 0 ? 0 : dw), dy, dw, dh); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; ctx.strokeRect(dx - (sx > 0 ? 0 : dw), dy, dw, dh);
      if (k > .2) txt(String(400 + i * 2 + (sx > 0 ? 1 : 0)), dx - (sx > 0 ? -dw / 2 : dw / 2), dy + dh * .15, 26 * k + 6, '#f4f1ea', { align: 'center', font: 'JBM', weight: 800 }); } }
  if (light < 1) dim(1 - light); }
// ── стена коридора сбоку (для проходов и розетки) ──
function corridorSide(t, scroll = 0, { light = 1 } = {}) { ctx.fillStyle = '#a9b39a'; ctx.fillRect(-400, -400, W + 800, H + 800); ctx.fillStyle = '#7f8c70'; ctx.fillRect(-400, 1180, W + 800, 30); ctx.fillStyle = '#93a084'; ctx.fillRect(-400, 1210, W + 800, 340); // панель
  ctx.fillStyle = '#6e5e4e'; ctx.fillRect(-400, 1550, W + 800, H); const g = ctx.createLinearGradient(0, 1550, 0, H); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); ctx.fillStyle = g; ctx.fillRect(-400, 1550, W + 800, H);
  for (let i = -2; i < 12; i++) { const dx = i * 620 - scroll; if (dx < -800 || dx > W + 400) continue; rr(dx, 560, 260, 990, 6); fillOL('#7a4e32', 5); circle(dx + 220, 1080, 14); fillOL('#d8c27a', 3); rr(dx + 80, 640, 100, 46, 6); fillOL('#e9e4d8', 3); txt(String(405 + i), dx + 130, 664, 30, T.ink, { align: 'center', font: 'JBM', weight: 800 }); }
  for (let i = -2; i < 14; i++) { const lx = i * 420 - scroll * .2; rr(lx, 120, 240, 26, 8); ctx.fillStyle = '#f4fbff'; ctx.fill(); glow(lx + 120, 140, 300, 'rgba(240,250,255,.25)'); }
  if (light < 1) dim(1 - light); }
function outlet(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-60, -60, 120, 120, 16); fillOL('#eeeae0', 5); for (const sx of [-1, 1]) { circle(sx * 22, 0, 10); ctx.fillStyle = '#333'; ctx.fill(); } ctx.restore(); }
// удлинитель-тройник с проводами к телефонам на полу
function powerStrip(x, y, s, n, { lit = [], phonesY = 260, spread = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-260, -50, 520, 100, 30); fillOL('#f4f1ea', 6); const pts = [];
  for (let i = 0; i < n; i++) { const px = -220 + i * (440 / (n - 1)); rr(px - 18, -24, 36, 48, 8); fillOL('#d8d4ca', 3); const tx = (i - (n - 1) / 2) * 104 * spread, ty = phonesY + Math.abs(i - (n - 1) / 2) * 18;
    ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px, 20); ctx.bezierCurveTo(px, 120, tx, ty - 140, tx, ty - 60); ctx.stroke(); pts.push([tx, ty]); }
  ctx.restore(); return pts.map(([px, py]) => [x + px * s, y + py * s]); }
// ── крыша: парапет, антенна, ночной город внизу ──
function cityFar(t, y, { k = 1 } = {}) { const r = seeded(91); for (let layer = 0; layer < 3; layer++) { const yy = y + layer * 40, col = ['#121a38', '#18234a', '#1e2b58'][layer]; let x = -100;
    while (x < W + 100) { const w2 = 50 + r() * 110, h2 = 60 + r() * (layer === 0 ? 260 : 140); ctx.fillStyle = col; ctx.fillRect(x, yy - h2, w2, h2 + 400); for (let i = 0; i < 10; i++) { if (r() < .55 * k) { ctx.fillStyle = r() < .8 ? 'rgba(242,215,166,.85)' : 'rgba(79,216,255,.8)'; ctx.fillRect(x + 6 + r() * (w2 - 14), yy - h2 + 10 + r() * (h2 - 20), 6, 8); } } x += w2 + 6; } } }
function roof(t, { mastX = 640, flashK = 0 } = {}) { nightSky(t, flashK); cityFar(t, 1150); glow(540, 1150, 700, 'rgba(242,215,166,.12)');
  ctx.fillStyle = '#2b3557'; ctx.fillRect(-400, 1300, W + 800, H); ctx.fillStyle = T.snow; ctx.beginPath(); ctx.moveTo(-400, 1320); for (let x = -400; x <= W + 400; x += 60) ctx.lineTo(x, 1310 + Math.sin(x * .02) * 14); ctx.lineTo(W + 400, H + 400); ctx.lineTo(-400, H + 400); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150,170,210,.35)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(100 + i * 190, 1500 + (i % 2) * 120, 160, 26, 0, 0, Math.PI * 2); ctx.fill(); }
  antenna(mastX, 1330, 2.6, t, flashK); }
// ── остальные герои сериала (для листа персонажей и серий 2–5) ──
function apaiHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05), sk = '#d7a07a';
  ctx.beginPath(); ctx.ellipse(0, r * .05, r * 1.32, r * 1.38, 0, 0, Math.PI * 2); fillOL('#d9d4cc', lw); // пуховой платок
  ctx.strokeStyle = 'rgba(120,110,100,.35)'; ctx.lineWidth = lw * .8; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(0, r * .05, r * (1.05 + i * .04), Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  circle(0, r * .05, r * .92); fillOL(sk, lw); ctx.strokeStyle = 'rgba(120,70,50,.45)'; ctx.lineWidth = lw * .6; for (const yy of [-.38, -.3]) { ctx.beginPath(); ctx.moveTo(-r * .35, r * yy); ctx.lineTo(r * .35, r * yy); ctx.stroke(); }
  eyes(r * .92, { ...o, skin: sk }); if (o.glasses !== false) { for (const s2 of [-1, 1]) { circle(s2 * r * .3, r * .06, r * .17); ctx.strokeStyle = '#b8902f'; ctx.lineWidth = lw * .8; ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-r * .13, r * .06); ctx.lineTo(r * .13, r * .06); ctx.stroke(); } // очки (снимаются: glasses: false)
  ctx.strokeStyle = '#d4b04a'; ctx.lineWidth = lw * .5; ctx.beginPath(); ctx.moveTo(-r * .47, r * .1); ctx.quadraticCurveTo(-r * .6, r * .9, 0, r * 1.05); ctx.quadraticCurveTo(r * .6, r * .9, r * .47, r * .1); ctx.stroke(); // цепочка
  mouth(r * .92, o.mouth || 'flat', .5); ctx.beginPath(); ctx.moveTo(-r * .5, r * .9); ctx.lineTo(0, r * 1.25); ctx.lineTo(r * .5, r * .9); ctx.closePath(); fillOL('#d9d4cc', lw); ctx.restore(); } // узел платка
function danaHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05), sk = '#e7b493';
  ctx.save(); ctx.translate(r * .9, -r * .4); ctx.rotate(-.5 + Math.sin((o.t || 0) * 3) * .05); rr(-r * .18, 0, r * .36, r * 1.1, r * .18); fillOL(HAIR, lw); ctx.restore(); // хвост
  for (const s2 of [-1, 1]) { circle(s2 * r * .97, r * .1, r * .18); fillOL(sk, lw * .8); }
  circle(0, 0, r); fillOL(sk, lw); ctx.beginPath(); ctx.arc(0, 0, r * 1.03, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(r * .5, -r * .3, 0, -r * .55); ctx.quadraticCurveTo(-r * .5, -r * .3, -r * 1.03, 0); ctx.closePath(); fillOL(HAIR, lw);
  eyes(r, { ...o, skin: sk }); mouth(r, o.mouth || 'flat'); ctx.restore(); }
function ruslanHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05), sk = '#dba582';
  for (const s2 of [-1, 1]) { circle(s2 * r * .97, r * .1, r * .18); fillOL(sk, lw * .8); }
  circle(0, 0, r); fillOL(sk, lw); ctx.fillStyle = 'rgba(40,30,40,.25)'; ctx.beginPath(); ctx.arc(0, r * .1, r * .9, .25, Math.PI - .25); ctx.fill(); // щетина
  ctx.beginPath(); ctx.moveTo(-r * 1.02, -r * .05); ctx.quadraticCurveTo(-r * 1.05, -r * 1.15, r * .1, -r * 1.12); ctx.quadraticCurveTo(r * 1.1, -r * 1.05, r * 1.02, -r * .2); ctx.quadraticCurveTo(r * .3, -r * .8, -r * .35, -r * .45); ctx.quadraticCurveTo(-r * .8, -r * .35, -r * 1.02, -r * .05); ctx.closePath(); fillOL('#2a2230', lw); // зачёс
  eyes(r, { ...o, skin: sk }); mouth(r, o.mouth || 'smirk'); ctx.restore(); }
const apai = (x, y, s, t, o = {}) => person(x, y, s, t, { topCol: '#5b4a6e', legsCol: '#3a3342', shoeCol: '#2a2430', skin: '#d7a07a', top: 'puffer', ...o, head: (hx, hy, r) => apaiHead(hx, hy, r, o.face || {}) });
const dana = (x, y, s, t, o = {}) => person(x, y, s, t, { top: 'puffer', topCol: '#f4f6fa', legsCol: '#2f3550', shoeCol: '#e9edf2', skin: '#e7b493', ...o, head: (hx, hy, r) => danaHead(hx, hy, r, { t, ...(o.face || {}) }) });
const ruslan = (x, y, s, t, o = {}) => { glow(x, y - 280 * s, 420 * s, 'rgba(138,92,255,.45)'); return person(x, y, s, t, { top: 'coat', topCol: '#2a2633', legsCol: '#1e1b26', shoeCol: '#ffffff', skin: '#dba582', ...o, head: (hx, hy, r) => ruslanHead(hx, hy, r, o.face || {}) }); };
function thermos(x, y) { rr(x - 16, y - 60, 32, 90, 10); fillOL('#8d9bb5', 4); rr(x - 18, y - 70, 36, 16, 5); fillOL('#5e6b85', 3); }
function keys(x, y) { ctx.strokeStyle = '#d4b04a'; ctx.lineWidth = 5; circle(x, y + 22, 16); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(x, y + 36); ctx.rotate(-.6 + i * .4); rr(-4, 0, 8, 40, 3); ctx.fillStyle = i % 2 ? '#d4b04a' : '#b8bcc6'; ctx.fill(); ctx.restore(); } }
function medBag(x, y) { rr(x - 60, y - 10, 120, 80, 14); fillOL('#ffffff', 5); ctx.fillStyle = T.pink; ctx.fillRect(x - 60, y + 24, 120, 12); ctx.fillStyle = T.empty; ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.bezierCurveTo(x - 26, y - 4, x - 22, y - 26, x, y - 10); ctx.bezierCurveTo(x + 22, y - 26, x + 26, y - 4, x, y + 18); ctx.fill(); } // сердечко, не красный крест
function watch(x, y) { rr(x - 14, y - 10, 28, 20, 5); fillOL('#e3c169', 3); glow(x, y, 30, 'rgba(255,230,150,.6)'); }
// где окажется кисть (без наклона): для предметов, которые рисуются раньше героя
function handOf(x, y, s, side, arm, { wide = 1, len = [80, 76] } = {}) { const sh = [side * 64 * wide, -296], el = [sh[0] + len[0] * Math.sin(arm[0]), sh[1] + len[0] * Math.cos(arm[0])]; return [x + (el[0] + len[1] * Math.sin(arm[0] + arm[1])) * s, y + (el[1] + len[1] * Math.cos(arm[0] + arm[1])) * s]; }

// ───── кисть и рука крупно (вместо «трубы»): запястье в (x, y), пальцы вдоль угла rot (0 — вверх) ─────
// pose: open (ладонь) | grip (держит) | fist | point | flat (ладонь вниз, касание)
function hand(x, y, s, rot, { pose = 'open', skin = SKIN, cuff = HOODIE } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(-66, -10, 132, 60, 22); fillOL(cuff, 6); // манжета
  const fingers = pose === 'fist' || pose === 'grip' ? [[-48, 28], [-20, 30], [8, 30], [36, 26]] : pose === 'point' ? [[-48, 30], [-20, 30], [8, 30], [36, 90]] : [[-50, 78], [-22, 92], [8, 88], [36, 72]];
  fingers.forEach(([fx, L], i) => { rr(fx - 2, -110 - L + 20, 28, L + 20, 14); fillOL(skin, 5); });
  rr(-58, -120, 116, 118, 40); fillOL(skin, 6); // ладонь
  ctx.save(); ctx.translate(52, -50); ctx.rotate(pose === 'fist' ? -.2 : .65); rr(-14, -70, 30, 74, 15); fillOL(skin, 5); ctx.restore(); // большой палец
  if (pose === 'fist' || pose === 'grip') { ctx.strokeStyle = 'rgba(10,15,30,.35)'; ctx.lineWidth = 4; for (const fx of [-34, -6, 22]) { ctx.beginPath(); ctx.moveTo(fx + 12, -120); ctx.lineTo(fx + 12, -96); ctx.stroke(); } }
  ctx.restore(); }
// рука в рукаве из-за кадра (x0, y0) к запястью (x1, y1); изгиб bend (−1..1); рисует кисть по направлению руки
function armTo(x0, y0, x1, y1, { w = 120, col = HOODIE, bend = .15, pose = 'open', s = 1, skin = SKIN, wristRot = 0 } = {}) { const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.strokeStyle = T.ol; ctx.lineWidth = w + 12; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = w * .3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke(); // складка рукава
  const a = Math.atan2(x1 - mx, -(y1 - my)); hand(x1, y1, s * w / 105, a + wristRot, { pose, skin, cuff: col });
  return { mid: [mx, my], dir: a }; }
// снег сверху: мягкая белая поверхность с голубыми тенями и искрами
function snowField(t, seed = 19) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#dfe7f2'); g.addColorStop(1, '#b9c7dd'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  const r = seeded(seed); ctx.strokeStyle = 'rgba(140,160,200,.25)'; ctx.lineWidth = 18; ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { const y = r() * H; ctx.beginPath(); ctx.moveTo(-100, y); ctx.bezierCurveTo(300, y - 60, 700, y + 60, W + 100, y - 20); ctx.stroke(); } // наст волнами
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H, tw = .5 + .5 * Math.sin(t * 3 + i); ctx.fillStyle = `rgba(255,255,255,${.7 * tw})`; circle(x, y, 2 + r() * 3); ctx.fill(); } dim(.28, '16,27,51'); }

// ════════ серия 2 ════════
// ── GroupChat: чат общаги в вымышленном мессенджере. msgs: [{ at, name, text, col, me }] ──
function GroupChat(t, msgs, { title = 'ОБЩАГА · 4 ЭТАЖ', members = '143 участника', x = 200, y = 250, w = 680, h = 860 } = {}) {
  ctx.save(); ctx.shadowColor = 'rgba(79,216,255,.3)'; ctx.shadowBlur = 60; ctx.fillStyle = '#05060c'; rr(x - 18, y - 18, w + 36, h + 36, 70); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#0f1630'; rr(x, y, w, h, 54); ctx.fill(); ctx.save(); rr(x, y, w, h, 54); ctx.clip();
  ctx.fillStyle = '#17224a'; ctx.fillRect(x, y, w, 150); circle(x + 80, y + 85, 42); fillOL(T.cyan, 4); txt('4', x + 80, y + 87, 44, T.ink, { align: 'center' });
  txt(title, x + 140, y + 70, 36, T.text); txt(members, x + 140, y + 112, 26, 'rgba(255,255,255,.6)', { weight: 700 });
  const shown = msgs.filter(m => t >= m.at); let yy = y + h - 30;
  for (let i = shown.length - 1; i >= 0 && yy > y + 160; i--) { const m = shown[i], k = E.out(win(t, m.at, m.at + .25)); ctx.font = '800 38px Mont'; const words = m.text.split(' '), rows = []; let line = '';
    for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (ctx.measureText(tt).width > w - 170 && line) { rows.push(line); line = wd; } else line = tt; } rows.push(line);
    const bh = 64 + rows.length * 46, bw = Math.min(w - 90, Math.max(...rows.map(r => ctx.measureText(r).width)) + 60), bx = m.me ? x + w - 30 - bw : x + 30; yy -= bh + 18;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 60); ctx.fillStyle = m.me ? '#1f5a46' : '#22305a'; rr(bx, yy, bw, bh, 26); ctx.fill();
    txt(m.name, bx + 28, yy + 34, 26, m.col || T.cyan, { weight: 900 }); rows.forEach((r, j) => txt(r, bx + 28, yy + 84 + j * 46, 38, T.text, { weight: 800 })); ctx.restore(); }
  ctx.restore(); ctx.restore(); }
// ── утренняя комната: роомWall с дневным окном ──
function dayWindow(x, y, w, h, t) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#9fc3e6'); g.addColorStop(1, '#f3d9b5'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); glow(x + w * .7, y + h * .75, 220, 'rgba(255,230,170,.8)');
  ctx.fillStyle = '#c9d6e6'; ctx.fillRect(x + 20, y + h * .45, w * .35, h); ctx.fillRect(x + w * .55, y + h * .35, w * .35, h); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x, y + h * .88, w, h * .12); }
// ── аудитория: доска с формулами ТОЭ, ряды парт ──
function auditorium(t, { light = 1 } = {}) { ctx.fillStyle = '#c9c2a8'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = '#b3ab8f'; ctx.fillRect(-300, 1000, W + 600, H);
  rr(40, 300, 1000, 560, 10); fillOL('#5a3d2c', 8); rr(64, 324, 952, 512, 6); ctx.fillStyle = '#21463a'; ctx.fill(); // доска
  const chalk = (s, x, y, sz = 46) => txt(s, x, y, sz, 'rgba(240,240,230,.9)', { font: 'JBM', weight: 700 });
  chalk('Z = R + jX', 110, 400); chalk('I = U / Z', 110, 480); chalk('φ = arctg(X/R)', 110, 560, 40); chalk('ТОЭ · ЛЕКЦИЯ 7', 600, 380, 34);
  ctx.strokeStyle = 'rgba(240,240,230,.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(600, 520); ctx.lineTo(680, 520); for (let i = 0; i < 4; i++) { ctx.lineTo(690 + i * 20, 500); ctx.lineTo(700 + i * 20, 540); } ctx.lineTo(780, 520); ctx.lineTo(860, 520); ctx.moveTo(860, 490); ctx.lineTo(860, 550); ctx.moveTo(880, 490); ctx.lineTo(880, 550); ctx.moveTo(880, 520); ctx.lineTo(960, 520); ctx.lineTo(960, 700); ctx.lineTo(600, 700); ctx.lineTo(600, 520); ctx.stroke(); // R и C
  glow(540, 200, 700, 'rgba(255,250,230,.25)'); if (light < 1) dim(1 - light); }
// ── вахта: стены в плитке, будка со стеклом, ключи, турникет ──
function vahtaBg(t, { light = 1, clock = null } = {}) { ctx.fillStyle = '#3d4a5e'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = '#4b5a70'; for (let y = 0; y < 1500; y += 70) for (let x = (y / 70) % 2 ? -35 : 0; x < W; x += 70) { ctx.fillRect(x + 3, y + 3, 64, 64); } // плитка
  ctx.fillStyle = '#5c4a3a'; ctx.fillRect(-300, 1500, W + 600, H); glow(300, 700, 600, 'rgba(255,200,130,.25)');
  if (clock) { const [cx, cy, hh, mm] = clock; circle(cx, cy, 60); fillOL('#f6f1e6', 5); ctx.strokeStyle = T.ol; ctx.lineCap = 'round'; const am = mm / 60 * Math.PI * 2, ah = (hh % 12 + mm / 60) / 12 * Math.PI * 2; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ah) * 28, cy - Math.cos(ah) * 28); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(am) * 44, cy - Math.cos(am) * 44); ctx.stroke(); }
  if (light < 1) dim(1 - light); }
function booth(x, y, w, h, drawInside) { rr(x - 24, y - 24, w + 48, h + 48, 12); fillOL('#7a5a3a', 8); ctx.save(); rr(x, y, w, h, 6); ctx.clip(); ctx.fillStyle = '#e8c890'; ctx.fillRect(x, y, w, h); glow(x + w / 2, y + h * .3, w, 'rgba(255,220,150,.6)'); drawInside();
  ctx.fillStyle = 'rgba(200,230,255,.12)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x + w * .15, y + h); ctx.lineTo(x + w * .45, y); ctx.stroke(); ctx.restore(); // стекло с бликом
  rr(x - 30, y + h, w + 60, 60, 8); fillOL('#8a6a48', 6); } // подоконник вахты
function keyBoard(x, y) { rr(x, y, 200, 260, 8); fillOL('#6b4a35', 5); for (let i = 0; i < 12; i++) { const kx = x + 30 + (i % 4) * 46, ky = y + 40 + Math.floor(i / 4) * 76; circle(kx, ky, 5); ctx.fillStyle = '#ccc'; ctx.fill(); if (i % 5 !== 2) { rr(kx - 6, ky + 4, 12, 40, 4); fillOL('#d4b04a', 2); } } }
function turnstile(x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-60, -300, 120, 300, 16); fillOL('#9aa3b5', 6); circle(0, -230, 40); fillOL('#5c6578', 5);
  for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI * 2 / 3; ctx.strokeStyle = T.ol; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(Math.cos(a) * 220, -230 + Math.sin(a) * 60); ctx.stroke(); ctx.strokeStyle = '#d8dde6'; ctx.lineWidth = 16; ctx.stroke(); }
  ctx.fillStyle = T.charge; circle(0, -150, 12); ctx.fill(); ctx.restore(); }
// фонарик: rot — направление луча (0 — вправо), k — яркость 0..1
function flashlight(x, y, s, rot, k = 1, { len = 900, spread = .32 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,245,210,${.6 * k})`); g.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(40 * s, -18 * s); ctx.lineTo(len, -len * spread); ctx.lineTo(len, len * spread); ctx.lineTo(40 * s, 18 * s); ctx.closePath(); ctx.fill(); ctx.restore(); glow(46 * s, 0, 60 * s, `rgba(255,250,220,${k})`); }
  ctx.scale(s, s); rr(-90, -16, 110, 32, 10); fillOL('#2a2f3e', 4); rr(14, -24, 34, 48, 8); fillOL('#5c6578', 4); ctx.restore(); }
// фото «ТЭЦ, бригада электриков»: старое, сепия; молодая апай в центре
function photoTEC(x, y, s, t, { hi = 0 } = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-230, -170, 460, 340, 6); fillOL('#5a3d2c', 8); rr(-206, -146, 412, 260, 2); ctx.fillStyle = '#d9c4a0'; ctx.fill();
  ctx.save(); rr(-206, -146, 412, 260, 2); ctx.clip(); ctx.fillStyle = '#b89a72'; ctx.fillRect(-206, -146, 412, 120); for (const [cx, w2] of [[-120, 60], [-40, 60]]) { ctx.beginPath(); ctx.moveTo(cx - w2 / 2, -26); ctx.lineTo(cx - w2 / 3, -140); ctx.lineTo(cx + w2 / 3, -140); ctx.lineTo(cx + w2 / 2, -26); ctx.fillStyle = '#9c7f5c'; ctx.fill(); } // градирни
    rr(80, -140, 22, 120, 3); ctx.fillStyle = '#8a6e4e'; ctx.fill(); // труба
    for (let i = 0; i < 5; i++) { const px = -160 + i * 80, mid = i === 2; ctx.fillStyle = mid ? '#7a5e48' : '#6e5440'; rr(px - 30, 20, 60, 100, 18); ctx.fill(); circle(px, -6, 26); ctx.fillStyle = '#c9a57e'; ctx.fill(); ctx.beginPath(); ctx.arc(px, -14, 28, Math.PI, 0); ctx.fillStyle = mid ? '#e8d48a' : '#d8c070'; ctx.fill(); // каски
      ctx.fillStyle = '#3a2a1e'; circle(px - 8, -6, 3); ctx.fill(); circle(px + 8, -6, 3); ctx.fill(); }
    ctx.fillStyle = 'rgba(120,80,40,.18)'; ctx.fillRect(-206, -146, 412, 260); ctx.restore();
  txt('ТЭЦ · БРИГАДА ЭЛЕКТРИКОВ · 1996', 0, 140, 22, '#3a2a1e', { align: 'center', weight: 800 });
  if (hi > 0) { ctx.strokeStyle = `rgba(255,179,71,${hi})`; ctx.lineWidth = 6; circle(0, 10, 70 + 6 * Math.sin(t * 5)); ctx.stroke(); } ctx.restore(); }
// ── CityGrid: ночная Астана сверху. dark(i, j) → 0..1 (квартал погас); mark — общага ──
const CITY = (() => { const r = seeded(77), out = []; for (let j = 0; j < 12; j++) for (let i = 0; i < 7; i++) out.push({ i, j, x: 40 + i * 150 + (j % 2) * 10, y: 120 + j * 150, w: 120 + r() * 10, h: 120, seed: r() * 1000 }); return out; })();
function CityGrid(t, { dark = () => 0, mark = null, river = true } = {}) { ctx.fillStyle = '#070b18'; ctx.fillRect(-300, -300, W + 600, H + 600);
  if (river) { ctx.strokeStyle = '#0d1a33'; ctx.lineWidth = 90; ctx.beginPath(); ctx.moveTo(-100, 1500); ctx.bezierCurveTo(300, 1300, 600, 1700, 1200, 1450); ctx.stroke(); } // река
  for (const b of CITY) { const d = clamp(dark(b.i, b.j, b)), on = 1 - d; ctx.fillStyle = `rgb(${lerp(14, 30, on)},${lerp(18, 38, on)},${lerp(30, 70, on)})`; rr(b.x, b.y, b.w, b.h, 8); ctx.fill();
    const r = seeded(Math.floor(b.seed) + 1); for (let k = 0; k < 14; k++) { const wx = b.x + 10 + r() * (b.w - 24), wy = b.y + 10 + r() * (b.h - 24), lit = r() < .75; if (!lit) continue; ctx.fillStyle = `rgba(242,215,166,${.9 * on})`; ctx.fillRect(wx, wy, 10, 8); }
    if (on > .05) glow(b.x + b.w / 2, b.y + b.h / 2, 110, `rgba(242,215,166,${.12 * on})`);
    if (d > 0 && d < 1) glow(b.x + b.w / 2, b.y + b.h / 2, 90, `rgba(200,220,255,${.5 * Math.sin(d * Math.PI)})`); } // вспышка при отключении
  ctx.strokeStyle = 'rgba(242,215,166,.25)'; ctx.lineWidth = 6; for (let j = 0; j <= 12; j++) { ctx.beginPath(); ctx.moveTo(0, 105 + j * 150); ctx.lineTo(W, 105 + j * 150); ctx.stroke(); } // улицы с фонарями
  if (mark) { const b = CITY.find(q => q.i === mark.i && q.j === mark.j), cx = b.x + b.w / 2, cy = b.y + b.h / 2, on = 1 - clamp(dark(b.i, b.j, b)); ctx.strokeStyle = T.charge; ctx.lineWidth = 6; rr(b.x - 10, b.y - 10, b.w + 20, b.h + 20, 12); ctx.stroke();
    ctx.fillStyle = 'rgba(10,15,30,.9)'; rr(cx - 120, b.y - 90, 240, 62, 14); ctx.fill(); ctx.strokeStyle = T.charge; ctx.lineWidth = 3; ctx.stroke(); txt(mark.label || 'ОБЩАГА', cx, b.y - 58, 32, on > .5 ? T.charge : T.empty, { align: 'center' }); } }
function glassesInHand(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#b8902f'; ctx.lineWidth = 6; for (const s2 of [-1, 1]) { circle(s2 * 26, -30, 22); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(6, -30); ctx.stroke(); ctx.strokeStyle = '#d4b04a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-48, -30); ctx.quadraticCurveTo(0, 40, 48, -30); ctx.stroke(); ctx.restore(); }
