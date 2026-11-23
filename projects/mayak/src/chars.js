// Бумажные куклы из частей: девочка (Мира) и дедушка. Один риг, разный «наряд».
// Поза: {x,y,s, lean, side(1/-1 зеркало), aL,eL,aR,eR (руки: угол от «вниз», изгиб локтя), legL,legR,
//        look:[x,y], mouth, brow(-1 тревога … 1 злость), blink, hood(0..1), tail (угол косичек), hem (взмах подола),
//        hold:'flash'|'candle'|'scope'|null, holdA (угол предмета), flashOn, jump}
const C = (() => {
  const { poly, smooth, fill, blob, TAU } = P;
  const LOOKS = {
    mira: { coat: '#f2b632', coatD: '#d98f1c', boot: '#c8423a', skin: '#f4cfae', cheek: 'rgba(235,120,110,.55)', hair: '#4b2c20',
      H: 300, headR: 40, headY: -248, sh: -196, hip: -104, coatW: [62, 116], pigtails: true, hoodCol: '#f2b632' },
    grandpa: { coat: '#2f5d55', coatD: '#22443f', boot: '#3a2b24', skin: '#e9bf9b', cheek: 'rgba(220,110,95,.5)', hair: '#e8e4dc',
      H: 420, headR: 46, headY: -362, sh: -305, hip: -160, coatW: [96, 128], beard: true, hat: '#c33b32', nose: true },
  };
  const ink = '#2a1d1a';
  function limb(c, x, y, a, e, side, l1, l2, w, col, handCol, handR) {
    const dx = Math.sin(a) * side, dy = Math.cos(a); const ex = x + dx * l1, ey = y + dy * l1;
    const fx = Math.sin(a + e) * side, fy = Math.cos(a + e); const hx = ex + fx * l2, hy = ey + fy * l2;
    c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - fx * 3, ey - fy * 3); c.lineTo(ex + fx * 6, ey + fy * 6); c.stroke();
    if (handCol) { c.fillStyle = handCol; c.beginPath(); c.arc(hx + fx * 3, hy + fy * 3, handR, 0, TAU); c.fill(); }
    return { ex, ey, hx: hx + fx * 3, hy: hy + fy * 3, ang: Math.atan2(fy, fx) };
  }
  function mouthShape(c, m, x, y, k, open = 0) {
    c.fillStyle = ink; c.strokeStyle = ink; c.lineCap = 'round'; c.lineWidth = 2.6 * k;
    if (m === 'o') { c.beginPath(); c.ellipse(x, y + 2 * k, 5 * k, (7 + 3 * open) * k, 0, 0, TAU); c.fill(); }
    else if (m === 'open') { c.beginPath(); c.moveTo(x - 11 * k, y - 2 * k); c.quadraticCurveTo(x, y + 2 * k, x + 11 * k, y - 2 * k); c.quadraticCurveTo(x, y + 18 * k, x - 11 * k, y - 2 * k); c.fill();
      c.fillStyle = '#d9645c'; c.beginPath(); c.ellipse(x, y + 8 * k, 5 * k, 3 * k, 0, 0, TAU); c.fill(); }
    else if (m === 'frown') { c.beginPath(); c.arc(x, y + 9 * k, 8 * k, -2.5, -.64); c.stroke(); }
    else if (m === 'flat') { c.beginPath(); c.moveTo(x - 7 * k, y + 1 * k); c.lineTo(x + 7 * k, y); c.stroke(); }
    else if (m === 'grit') { c.beginPath(); c.moveTo(x - 9 * k, y + 2 * k); c.quadraticCurveTo(x, y - 1 * k, x + 9 * k, y + 2 * k); c.stroke(); }
    else if (m === 'small') { c.beginPath(); c.arc(x, y - 2 * k, 5 * k, .5, 2.64); c.stroke(); }
    else { c.beginPath(); c.arc(x, y - 6 * k, 10 * k, .55, 2.6); c.stroke(); } // smile
  }
  function face(c, L, p, k) {
    const hy = L.headY, R = L.headR, lx = (p.look ? p.look[0] : 0), ly = (p.look ? p.look[1] : 0);
    const ex = 15 * k * (R / 40), eyY = hy + (L.beard ? -6 : 2) * k;
    const bl = Math.max(p.blink || 0, A.blink(E.S.t, p.seed || 0));
    // глаза: тёмные овалы с бликом, моргание — сжатие
    for (const sd of [-1, 1]) {
      const x = sd * ex + lx * 4 * k, y = eyY + ly * 3 * k;
      c.fillStyle = ink; c.beginPath(); c.ellipse(x, y, 5.2 * k, 7.5 * k * Math.max(.08, 1 - bl), 0, 0, TAU); c.fill();
      if (bl < .6) { c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 1.6 * k, y - 2.4 * k, 1.8 * k, 0, TAU); c.fill(); }
      // бровь
      const br = p.brow || 0; c.strokeStyle = L.beard ? '#f3f0ea' : ink; c.lineWidth = (L.beard ? 5 : 2.8) * k; c.lineCap = 'round';
      c.beginPath(); const by = eyY - 13 * k - (p.browUp || 0) * 4 * k; c.moveTo(sd * ex - 7 * k * sd + lx * 2 * k, by + br * 3.5 * k); c.lineTo(sd * ex + 7 * k * sd + lx * 2 * k, by - br * 3.5 * k - (br < 0 ? -br * 0 : 0)); c.stroke();
    }
    c.fillStyle = L.cheek; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 23 * k * (R / 40) + lx * 2 * k, eyY + 13 * k, 6 * k, 4 * k, 0, 0, TAU); c.fill(); }
    if (L.nose) { c.fillStyle = '#d99c7f'; c.beginPath(); c.ellipse(lx * 4 * k, eyY + 12 * k, 8 * k, 10 * k, 0, 0, TAU); c.fill(); }
    else { c.fillStyle = 'rgba(190,120,95,.5)'; c.beginPath(); c.ellipse(lx * 4 * k, eyY + 10 * k, 2.5 * k, 2 * k, 0, 0, TAU); c.fill(); }
    if (L.beard) {
      c.fillStyle = '#f3f0ea'; blob(c, lx * 2 * k, hy + 52 * k, 36 * k, 9, .14, 14, 1.1); c.fill();
      c.fillStyle = '#e2ddd3'; c.beginPath(); c.ellipse(lx * 4 * k - 12 * k, eyY + 24 * k, 13 * k, 6 * k, .3, 0, TAU); c.ellipse(lx * 4 * k + 12 * k, eyY + 24 * k, 13 * k, 6 * k, -.3, 0, TAU); c.fill();
      mouthShape(c, p.mouth || 'smile', lx * 4 * k, eyY + 36 * k, k * .9, p.open || 0);
    } else mouthShape(c, p.mouth || 'smile', lx * 4 * k, eyY + 24 * k, k, p.open || 0);
  }
  // IK: цель в координатах слоя → углы руки (a,e)
  function ik(L, p, arm, X, Y, bend = 1) {
    const s = p.s || 1, side = p.side || 1, lean = (p.lean || 0) * side;
    let dx = (X - p.x) / (s * side), dy = (Y - (p.y - (p.jump || 0))) / s; const ca = Math.cos(-lean), sa = Math.sin(-lean); [dx, dy] = [dx * ca - dy * sa, dx * sa + dy * ca];
    const sw = L.coatW[0] / 2, shx = arm === 'R' ? sw - 6 : -(sw - 6), shy = L.sh + 10; let vx = dx - shx, vy = dy - shy; if (arm === 'L') vx = -vx;
    const l1 = L.H * .15, l2 = L.H * .14 + 3; const D = Math.min(l1 + l2 - .5, Math.max(8, Math.hypot(vx, vy))); const phi = Math.atan2(vx, vy);
    const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D)))), be = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + l2 * l2 - D * D) / (2 * l1 * l2))));
    return { a: phi + al * bend, e: -bend * (Math.PI - be) };
  }
  // главный риг. Возвращает мировые координаты кистей
  function person(c, who, p) {
    const L = LOOKS[who]; p = Object.assign({}, p);
    if (p.ikR) { const r = ik(L, p, 'R', p.ikR[0], p.ikR[1], p.bendR || 1); p.aR = r.a; p.eR = r.e; }
    if (p.ikL) { const r = ik(L, p, 'L', p.ikL[0], p.ikL[1], p.bendL || 1); p.aL = r.a; p.eL = r.e; }
    const s = p.s || 1, side = p.side || 1, k = 1;
    c.save(); c.translate(p.x, p.y - (p.jump || 0)); c.scale(s * side, s * (1 + .012 * Math.sin(E.S.t * 2.3 + (p.seed || 0)))); c.rotate((p.lean || 0) * side);
    const shY = L.sh, hip = L.hip, sw = L.coatW[0] / 2, hw = L.coatW[1] / 2;
    const tail = p.tail || 0, hem = p.hem || 0;
    // косички сзади (за головой)
    const hands = {};
    const armL = (back) => limb(c, -sw + 6, shY + 10, p.aL == null ? .15 : p.aL, p.eL || 0, -1, L.H * .15, L.H * .14, L.H * .055, back ? L.coatD : L.coat, L.skin, L.H * .032);
    const armR = (back) => limb(c, sw - 6, shY + 10, p.aR == null ? .15 : p.aR, p.eR || 0, 1, L.H * .15, L.H * .14, L.H * .055, back ? L.coatD : L.coat, L.skin, L.H * .032);
    // ноги
    c.lineCap = 'round';
    for (const [sd, a] of [[-1, p.legL || 0], [1, p.legR || 0]]) {
      const x0 = sd * hw * .38, y0 = hip; const lx = x0 + Math.sin(a) * (-hip), ly = 0 - (1 - Math.cos(a)) * (-hip) * .3;
      c.strokeStyle = who === 'mira' ? '#3b4a6b' : '#3a3433'; c.lineWidth = L.H * .06; c.beginPath(); c.moveTo(x0, y0); c.lineTo(lx, ly - L.H * .08); c.stroke();
      c.fillStyle = L.boot; poly(c, [[lx - L.H * .035, ly - L.H * .14], [lx + L.H * .035, ly - L.H * .14], [lx + L.H * .04, ly - L.H * .02], [lx + L.H * .07 * sd, ly], [lx - L.H * .045, ly]], 0); c.fill();
    }
    // пальто (трапеция с подолом)
    const hs = hem * 12;
    c.beginPath(); c.moveTo(-sw, shY); c.quadraticCurveTo(-sw - 4, shY - 10, 0, shY - 12); c.quadraticCurveTo(sw + 4, shY - 10, sw, shY);
    c.lineTo(hw + hs, hip + 8); c.quadraticCurveTo(hw * .5 + hs, hip + 16, 0 + hs * .5, hip + 12); c.quadraticCurveTo(-hw * .5 + hs, hip + 16, -hw + hs, hip + 8); c.closePath();
    fill(c, L.coat, .2); c.save(); c.clip();
    const gr = c.createLinearGradient(-hw, 0, hw, 0); gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(.45, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); c.fillStyle = gr; c.fillRect(-hw - 20, shY - 20, hw * 2 + 40, hip - shY + 50); c.restore();
    // пуговицы / молния
    c.fillStyle = 'rgba(40,30,20,.55)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(4, shY + 22 + i * (hip - shY - 30) / 3, L.H * .009, 0, TAU); c.fill(); }
    if (L.beard) { c.fillStyle = '#e8e2d4'; c.fillRect(-10, shY - 8, 20, 30); }
    // руки
    const ra = armL(false); hands.L = ra; const rb = armR(false); hands.R = rb;
    // голова
    const hy = L.headY, R = L.headR;
    if (L.pigtails) { c.fillStyle = L.hair; for (const sd of [-1, 1]) { c.save(); c.translate(sd * R * .92, hy + 4); c.rotate(-sd * .25 + tail); blob(c, 0, 20, 11, 3 + sd, .15, 10, .8); c.fill(); c.fillStyle = '#e04b5a'; c.fillRect(-8, 2, 16, 6); c.fillStyle = L.hair; blob(c, 0, 40, 9, 5 + sd, .2, 10, .8); c.fill(); c.restore(); } }
    if (p.hood > 0) { c.fillStyle = L.coatD; blob(c, 0, hy - 2, R * 1.32, 4, .05, 16); c.fill(); }
    c.fillStyle = L.skin; c.beginPath(); c.ellipse(0, hy, R, R * 1.05, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2; c.stroke();
    // волосы / шапка
    if (L.hat) { c.fillStyle = L.hat; c.beginPath(); c.moveTo(-R * 1.02, hy - R * .42); c.quadraticCurveTo(-R * .9, hy - R * 1.6, 0, hy - R * 1.6); c.quadraticCurveTo(R * .9, hy - R * 1.6, R * 1.02, hy - R * .42); c.closePath(); c.fill();
      c.fillStyle = '#a92e27'; c.fillRect(-R * 1.06, hy - R * .7, R * 2.12, R * .3); c.fillStyle = '#efe9df'; c.beginPath(); c.arc(0, hy - R * 1.65, R * .2, 0, TAU); c.fill(); }
    else { c.fillStyle = L.hair; c.beginPath(); c.moveTo(-R * 1.02, hy + 2); c.quadraticCurveTo(-R * 1.05, hy - R * 1.12, 0, hy - R * 1.08); c.quadraticCurveTo(R * 1.05, hy - R * 1.12, R * 1.02, hy + 2);
      c.lineTo(R * .7, hy - R * .45); c.lineTo(R * .35, hy - R * .3); c.lineTo(0, hy - R * .5); c.lineTo(-R * .3, hy - R * .32); c.lineTo(-R * .72, hy - R * .48); c.closePath(); c.fill(); }
    if (p.hood > 0) { // козырёк капюшона спереди
      c.save(); c.globalAlpha = Math.min(1, p.hood); c.strokeStyle = L.hoodCol; c.lineWidth = R * .36; c.beginPath(); c.ellipse(0, hy - 2, R * 1.12, R * 1.18, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, hy - 2, R * .95, R * 1.0, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.restore();
    }
    c.save(); c.translate(0, 0); face(c, L, p, R / 40); c.restore();
    // предмет в руке (поверх фигуры)
    if (p.hold) {
      const h = p.holdHand === 'L' ? ra : rb; c.save(); c.translate(h.hx, h.hy); c.rotate(p.holdA != null ? p.holdA : h.ang);
      if (p.hold === 'flash') { c.fillStyle = '#3d4b5e'; c.fillRect(-6, -7, 34, 14); c.fillStyle = '#9aa7b8'; c.fillRect(26, -10, 12, 20); c.fillStyle = p.flashOn ? '#fff7cf' : '#56606e'; c.fillRect(37, -8, 3, 16);
        c.fillStyle = L.skin; c.beginPath(); c.arc(4, 0, L.H * .034, 0, TAU); c.fill(); }
      if (p.hold === 'scope') { c.fillStyle = '#7a5a3a'; c.fillRect(-10, -9, 80, 18); c.fillStyle = '#c9a463'; c.fillRect(-14, -11, 10, 22); c.fillRect(60, -12, 14, 24); c.fillStyle = L.skin; c.beginPath(); c.arc(0, 0, L.H * .034, 0, TAU); c.fill(); }
      if (p.hold === 'candle') { c.fillStyle = '#efe6cf'; c.fillRect(-7, -38, 14, 40); c.fillStyle = '#8a6a4a'; c.fillRect(-14, 0, 28, 6); c.fillStyle = L.skin; c.beginPath(); c.arc(0, 3, L.H * .034, 0, TAU); c.fill(); }
      c.restore();
    }
    c.restore();
    // мировые координаты кистей и предмета
    const toW = (x, y) => { const a = (p.lean || 0) * side, ca = Math.cos(a), sa = Math.sin(a); const xx = x * ca - y * sa, yy = x * sa + y * ca; return [p.x + xx * s * side, p.y - (p.jump || 0) + yy * s]; };
    const hh = p.holdHand === 'L' ? ra : rb; const ang = (p.holdA != null ? p.holdA : hh.ang);
    const tipLocal = [hh.hx + Math.cos(ang) * 40, hh.hy + Math.sin(ang) * 40];
    const topLocal = [hh.hx + Math.sin(ang) * 40, hh.hy - Math.cos(ang) * 40];
    return { L: toW(ra.hx, ra.hy), R: toW(rb.hx, rb.hy), tip: toW(...tipLocal), top: toW(...topLocal), tipA: side > 0 ? ang + (p.lean || 0) : Math.PI - ang - (p.lean || 0), head: toW(0, hy) };
  }
  // светлячок: бумажное тельце, крылья, светящееся брюшко (свечение — в glow-проходе: C.fireflyGlow)
  function firefly(c, x, y, s, t, o = {}) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.rot || 0);
    const flap = o.flap == null ? Math.sin(t * 60) : o.flap;
    // задние прозрачные крылья
    c.fillStyle = 'rgba(220,235,255,.45)'; for (const sd of [-1, 1]) { c.save(); c.rotate(sd * (.6 + .5 * flap)); c.beginPath(); c.ellipse(sd * 4, -18, 8, 22, sd * .2, 0, TAU); c.fill(); c.restore(); }
    // брюшко
    c.fillStyle = o.lit ? '#f4ff9a' : '#9a9a5a'; c.beginPath(); c.ellipse(0, 14, 8, 13, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(60,40,30,.6)'; for (let i = 0; i < 3; i++) c.fillRect(-7, 3 + i * 4, 14, 1.4);
    // надкрылья
    c.fillStyle = '#3a2a24'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 4.5, 0, 5, 14, sd * (.12 + (o.open || 0) * .5), 0, TAU); c.fill(); }
    c.strokeStyle = '#d8b25a'; c.lineWidth = 1; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 8.5, -10); c.lineTo(sd * 8.5, 10); c.stroke(); }
    // голова-щиток
    c.fillStyle = '#d0563c'; c.beginPath(); c.ellipse(0, -15, 8, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#2a1d1a'; c.beginPath(); c.arc(0, -18, 4, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-2, -19.5, 1.2, 0, TAU); c.arc(2, -19.5, 1.2, 0, TAU); c.fill();
    c.strokeStyle = '#2a1d1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-2, -21); c.quadraticCurveTo(-8, -30, -11, -31); c.moveTo(2, -21); c.quadraticCurveTo(8, -30, 11, -31); c.stroke();
    c.restore();
  }
  function fireflyGlow(g, x, y, s, lit) { if (lit <= 0.01) return; const r = 26 * s; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(250,255,190,${lit})`); gr.addColorStop(.25, `rgba(210,255,110,${.6 * lit})`); gr.addColorStop(1, 'rgba(120,200,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  return { person, firefly, fireflyGlow, LOOKS, ik };
})();
