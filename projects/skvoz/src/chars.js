// DAY 214 — герои карандашом: он (кудри, худи, блокнот) и она (длинные волосы, пальто, красный шарф-акварель).
// Две проекции головы: профиль (общие планы) и анфас (крупные). Лицо из частей: брови, веки (моргание), зрачки (взгляд), рот.
(function () {
  const { lerp, clamp, ell, cr, bz, noise1, hash } = E;
  const P = E.PAL;
  // перенос/масштаб/зеркало на оба слоя
  E.push = function (x, y, s = 1, f = 1, r = 0) { for (const c of [E.g, E.c]) { c.save(); c.translate(x, y); c.rotate(r); c.scale(s * f, s); } (E._lws = E._lws || []).push(E.lw); E.lw = E.lw / Math.sqrt(s); };
  E.pop = function () { for (const c of [E.g, E.c]) c.restore(); E.lw = E._lws.pop(); };
  const pen = E.pen, T = (P0, dx, dy) => P0.map(p => [p[0] + dx, p[1] + dy]);
  const fillG = (Q, a) => { if (E.hid()) return; const c = E.g; c.save(); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); c.restore(); };
  // «бумага» под фигурой: стирает фон за силуэтом, чтобы линии окна не просвечивали сквозь лицо
  const knock = (Q) => { if (E.measure) return; const c = E.g; c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); c.restore(); };
  const knockC = (Q) => { if (E.measure) return; const c = E.c; c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); c.restore(); };
  E.knock = knock; E.knockC = knockC; E.fillG = fillG;
  // пружина скетчбука вдоль ребра a→b: петли проволоки, пересекающие край
  E.spiral = function (a, b, step = 11, r = 6) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.floor(L / step)), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
    for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t);
      const Q = []; for (let k = 0; k <= 10; k++) { const u = Math.PI * (k / 10) * 1.6 - .3; Q.push([x + ux * Math.cos(u) * r * .5 + nx * Math.sin(u) * r - nx * r * .3, y + uy * Math.cos(u) * r * .5 + ny * Math.sin(u) * r - ny * r * .3]); }
      pen(Q, { w: 1.6, a: .9, sketch: false }); }
  };
  // обложка-подложка, стопка листов снизу/справа, пружина сверху (или слева)
  E.skBook = function (Bk, o = {}) {
    const off = o.off || [4, 5], back = Bk.map(p => [p[0] + off[0], p[1] + off[1]]);
    knock(back); knockC(back);
    if (o.blue) E.wash(back, E.PAL.blue, .85, { seed: 43, rough: 1 }); else { E.fillG(back, .55); }
    pen(back.concat([back[0]]), { w: 2, a: .8 });
    knock(Bk); knockC(Bk);
    pen(Bk.concat([Bk[0]]), { w: 2.6, a: .9 });
    for (let i = 1; i <= 2; i++) { const d = i * 1.8; pen([[Bk[3][0] + d, Bk[3][1] + d], [Bk[2][0] + d, Bk[2][1] + d], [Bk[1][0] + d, Bk[1][1] + d]], { w: 1, a: .45, sketch: false }); }
    if (o.side === 'left') E.spiral(Bk[3], Bk[0], o.step || 10, o.r || 5); else E.spiral(Bk[0], Bk[1], o.step || 11, o.r || 6);
  };


  // ================= ГЛАЗ, БРОВЬ, РОТ =================
  // eye(x,y,s,o): o.lx,o.ly — взгляд (-1..1), o.blink 0..1, o.lid — прикрытость (лукаво), o.lash — ресницы
  function eye(x, y, s, o) {
    const b = clamp((o.blink || 0) + (o.lid || 0) * .45), h = 7.5 * s * (1 - b);
    if (b > .85) { pen(cr([[x - 9 * s, y], [x, y + 2.5 * s], [x + 9 * s, y]]), { w: 2.6, a: .95 }); if (o.lash) pen([[x + 8 * s, y], [x + 13 * s, y - 3 * s]], { w: 2, a: .9 }); return; }
    // верхнее веко — жирная линия, нижнее — тонкая
    const top = cr([[x - 10 * s, y + 1 * s], [x - 3 * s, y - h], [x + 6 * s, y - h * .95], [x + 10 * s, y]]);
    const bot = cr([[x - 9 * s, y + 1.5 * s], [x, y + h * .55], [x + 9 * s, y + 1 * s]]);
    const px = x + (o.lx || 0) * 4.2 * s, py = y + (o.ly || 0) * 2.6 * s + (o.lid || 0) * 2 * s;
    // зрачок — плотный графит
    const r = 4.6 * s * Math.min(1, (1 - b) * 1.3);
    const c = E.g; c.save(); c.beginPath(); top.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath(); c.clip();
    if (!E.hid()) { c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); }
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.beginPath(); c.arc(px - 1.5 * s, py - 1.7 * s, r * .32, 0, 7); c.fill(); c.restore();
    pen(top, { w: 3, a: .95 }); pen(bot, { w: 1.2, a: .5 });
    if (o.lash) { pen([[x + 9 * s, y - .5 * s], [x + 14 * s, y - 4 * s]], { w: 2.2, a: .9 }); pen([[x + 6 * s, y - h * .9], [x + 10 * s, y - h - 3 * s]], { w: 1.6, a: .8 }); }
  }
  function brow(x, y, s, up, tilt, w = 1) { // up — поднята (удивление), tilt — домик (+) / хмурь (−)
    pen(cr([[x - 10 * s, y - up * 4 * s + tilt * 3 * s], [x, y - 2.5 * s - up * 6 * s], [x + 10 * s, y - up * 4 * s - tilt * 3 * s]]), { w: 3.2 * w, a: .85 });
  }
  // m: 0 — ровно, 1 — улыбка, 2 — широкая улыбка/смех (открыт), 3 — «о», 4 — неуверенная волна
  function mouth(x, y, s, m, open = 0) {
    if (m === 3) { pen(ell(x, y + 2 * s, 4 * s, 5.5 * s * (.6 + open)), { w: 2.4, a: .9 }); E.fillG(ell(x, y + 2 * s, 3 * s, 4.5 * s * (.6 + open)), .55); return; }
    if (m === 2) {
      const Q = cr([[x - 13 * s, y - 2 * s], [x, y + 3 * s], [x + 13 * s, y - 2 * s]]), B = cr([[x - 13 * s, y - 2 * s], [x - 5 * s, y + (8 + 6 * open) * s], [x + 5 * s, y + (8 + 6 * open) * s], [x + 13 * s, y - 2 * s]]);
      E.fillG(Q.concat(B.slice().reverse()), .6); pen(B, { w: 2.4, a: .9 }); pen(Q, { w: 2, a: .8 }); return;
    }
    if (m === 4) { pen(cr([[x - 9 * s, y + 1 * s], [x - 3 * s, y - 1.5 * s], [x + 3 * s, y + 1.5 * s], [x + 9 * s, y - 1 * s]]), { w: 2.2, a: .85 }); return; }
    const k = m === 1 ? 1 : 0;
    pen(cr([[x - 10 * s, y - k * 3 * s], [x, y + k * 3.5 * s + .5 * s], [x + 10 * s, y - k * 3 * s]]), { w: 2.4, a: .9 });
    if (k) { pen([[x - 11 * s, y - 4 * s], [x - 9 * s, y - 1 * s]], { w: 1.5, a: .6 }); pen([[x + 11 * s, y - 4 * s], [x + 9 * s, y - 1 * s]], { w: 1.5, a: .6 }); }
  }
  E.eye = eye; E.brow = brow; E.mouth = mouth;

  // ================= ВОЛОСЫ =================
  // кудри: петли-завитки по дуге (он)
  function curls(x, y, r, a0, a1, n, sz, seed = 1, a = .9) {
    for (let i = 0; i < n; i++) {
      const t = lerp(a0, a1, (i + .5) / n) + (hash(i * 9 + seed) - .5) * .25, rr = r * (1 + .12 * noise1(seed + i * 1.7)) - hash(i + seed * 3) * sz * .6;
      const cx = x + Math.cos(t) * rr, cy = y + Math.sin(t) * rr, z = sz * (.55 + .8 * hash(i + seed)), dir = hash(i * 5 + seed) < .5 ? 1 : -1;
      const L = [], turns = 1.3 + hash(i * 2 + seed) * .9, ph = hash(i * 7) * 6.28;
      for (let k = 0; k <= 26; k++) { const q = k / 26, u = ph + dir * q * Math.PI * 2 * turns, rz = z * (1 - q * .55); L.push([cx + Math.cos(u) * rz, cy + Math.sin(u) * rz * .8]); }
      pen(L, { w: 2.1 + hash(i) * .8, a: a * (.75 + .25 * hash(i * 3)), sketch: false });
    }
  }
  // длинные волнистые пряди (она)
  function strands(P0, P1, n, a, seed = 1, wv = 6) {
    for (let i = 0; i < n; i++) {
      const k = (i + .5) / n, Q = [];
      for (let m = 0; m <= 10; m++) { const t = m / 10; const x = lerp(lerp(P0[0][0], P0[1][0], k), lerp(P1[0][0], P1[1][0], k), t), y = lerp(lerp(P0[0][1], P0[1][1], k), lerp(P1[0][1], P1[1][1], k), t);
        Q.push([x + Math.sin(t * 5 + seed + i * .7) * wv * t, y]); }
      pen(cr(Q, 3), { w: 1 + hash(i + seed) * 1.4, a: a * (.5 + .5 * hash(i * 3 + seed)), sketch: false });
    }
  }
  E.strands = strands;

  // ================= ОН — АНФАС (крупный план) =================
  // o: lx, ly, blink, browUp, browTilt, m, open, blush (0..1), book (0..1: верх блокнота от подбородка до бровей), sweat
  E.himFront = function (x, y, s, o = {}) {
    E.push(x, y, s);
    // шея, плечи худи
    pen(cr([[-150, 260], [-120, 170], [-60, 135], [0, 128], [60, 135], [120, 170], [150, 260]]), { w: 3, a: .8 });
    pen(cr([[-26, 92], [-24, 132]]), { w: 2.5, a: .8 }); pen(cr([[26, 92], [24, 132]]), { w: 2.5, a: .8 });
    pen(cr([[-62, 140], [-30, 175], [0, 182], [30, 175], [62, 140]]), { w: 2.4, a: .7 });  // ворот капюшона
    E.hatch([[-150, 260], [-120, 170], [-62, 140], [-30, 178], [30, 178], [62, 140], [120, 170], [150, 260]], { gap: 8, a: .22, ang: -1.1 });
    // лицо
    const face = cr([[0, -78], [44, -66], [58, -20], [52, 30], [30, 74], [0, 90], [-30, 74], [-52, 30], [-58, -20], [-44, -66]], 6, true);
    knock(face);
    pen(cr([[56, -24], [53, 30], [32, 72], [0, 89], [-32, 72], [-53, 30], [-56, -24]]), { w: 3, a: .9 });
    pen(ell(-60, 6, 8, 15), { w: 2, a: .7 }); pen(ell(60, 6, 8, 15), { w: 2, a: .7 });
    E.hatch(cr([[34, -62], [56, -20], [52, 30], [30, 72], [12, 84], [34, 36], [40, -18]], 4, true), { gap: 5, a: .2, ang: -1.1 });
    E.tone(cr([[-26, 92], [26, 92], [24, 118], [-24, 118]], 2, true), .28, 4);
    if (o.blush) { E.blot(-34, 34, 15, P.blush, .45 * o.blush, { seed: 3 }); E.blot(34, 34, 15, P.blush, .45 * o.blush, { seed: 4 }); }
    eye(-22, 0, 1.15, { lx: o.lx, ly: o.ly, blink: o.blink }); eye(22, 0, 1.15, { lx: o.lx, ly: o.ly, blink: o.blink });
    brow(-22, -22, 1.2, o.browUp || 0, o.browTilt || 0); brow(22, -22, 1.2, o.browUp || 0, -(o.browTilt || 0));
    pen(cr([[3, 6], [6, 28], [-2, 33]]), { w: 2, a: .7 });  // нос
    mouth(0, 54, 1.2, o.m ?? 0, o.open || 0);
    // кудри шапкой
    const hair = cr([[-64, 10], [-74, -40], [-50, -92], [0, -110], [52, -94], [76, -42], [64, 10], [52, -36], [20, -60], [-20, -58], [-52, -34]], 5, true);
    knock(hair); E.tone(hair, .55, 5); E.hatch(hair, { gap: 5, a: .25, ang: .6, cross: true });
    curls(0, -38, 68, Math.PI * .95, Math.PI * 2.05, 22, 17, 2, .9);
    curls(0, -46, 46, Math.PI * 1.05, Math.PI * 1.95, 14, 15, 7, .75);
    curls(0, -60, 22, Math.PI * 1.1, Math.PI * 1.9, 6, 13, 11, .7);
    if (o.sweat) { const k = o.sweat; pen(cr([[68, -50], [74, -38], [70, -30], [66, -38], [68, -50]]), { w: 2, a: .8 * k }); pen([[80, -70], [92, -82]], { w: 2, a: .7 * k }); pen([[84, -54], [100, -58]], { w: 2, a: .7 * k }); }
    // блокнот снизу закрывает лицо
    if (o.book !== undefined) {
      const by = lerp(150, -40, o.book), bw = 168, tilt = -.04;
      const B = [[-bw / 2, by], [bw / 2, by + bw * tilt], [bw / 2 + 4, by + 236], [-bw / 2 - 4, by + 236]];
      knock(B); knockC(B);
      pen(B.concat([B[0]]), { w: 3.2, a: .9 });
      E.hatch(B, { gap: 5, a: .28, ang: .5, cross: true });
      E.hand('SKETCH', 0, by + 120, 22, 1, { w: 2.2, a: .5 });
      E.spiral([-bw / 2 + 8, by + 4], [bw / 2 - 8, by + 4 + bw * tilt], 13, 9);
      // пальцы на верхнем крае
      for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
        const fx = sx * (bw / 2 - 22 - i * 13), fy = by + (sx > 0 ? bw * tilt : 0);
        const F = cr([[fx - 6, fy + 16], [fx - 6, fy - 6], [fx, fy - 11], [fx + 6, fy - 6], [fx + 6, fy + 16]], 4);
        knock(F); pen(F, { w: 2.2, a: .85 });
      }
    }
    E.pop();
  };

  // ================= ОНА — АНФАС =================
  // o: lx, ly, blink, browUp, browTilt, m, open, blush, turn (−1..1 поворот головы), lid
  E.herFront = function (x, y, s, o = {}) {
    E.push(x, y, s);
    const tn = o.turn || 0, tx = tn * 10;
    // волосы сзади — длинные пряди
    const back = cr([[-70, -60], [-92, 40], [-100, 170], [-80, 260], [80, 260], [100, 170], [92, 40], [70, -60], [0, -104]], 6, true);
    knock(back); E.tone(back, .5, 8);
    strands([[-50, -80], [-96, -10]], [[-60, 250], [-104, 240]], 16, .8, 1, 10);
    strands([[50, -80], [96, -10]], [[60, 250], [104, 240]], 16, .8, 4, 10);
    pen(cr([[-70, -60], [-94, 40], [-104, 170], [-92, 258]]), { w: 2.6, a: .8 }); pen(cr([[70, -60], [94, 40], [104, 170], [92, 258]]), { w: 2.6, a: .8 });
    // шея, пальто, шарф
    pen(cr([[-22, 86], [-20, 130]]), { w: 2.4, a: .8 }); pen(cr([[22, 86], [20, 130]]), { w: 2.4, a: .8 });
    pen(cr([[-170, 270], [-130, 175], [-70, 150]]), { w: 3, a: .8 }); pen(cr([[170, 270], [130, 175], [70, 150]]), { w: 3, a: .8 });
    const scarf = cr([[-80, 118], [-30, 108], [30, 108], [80, 118], [86, 160], [40, 178], [-10, 180], [-60, 172], [-88, 150]], 5, true);
    knock(scarf); E.wash(scarf, P.red, .78, { seed: 11, rough: 3 });
    E.wash(cr([[10, 170], [40, 175], [52, 260], [20, 262], [6, 200]], 4, true), P.red, .7, { seed: 12, rough: 3 });
    pen(scarf, { w: 2.4, a: .75 }); pen(cr([[-60, 135], [0, 148], [60, 135]]), { w: 1.4, a: .5 });
    // лицо
    const face = cr([[0, -80], [44, -66], [54, -20], [48, 30], [26, 70], [0, 84], [-26, 70], [-48, 30], [-54, -20], [-44, -66]], 6, true);
    knock(face);
    pen(cr([[52, -22], [47, 30], [26, 68], [0, 83], [-26, 68], [-47, 30], [-52, -22]]), { w: 2.8, a: .85 });
    E.hatch(cr([[-34, -60], [-54, -20], [-48, 30], [-28, 68], [-12, 80], [-32, 34], [-38, -18]], 4, true), { gap: 5, a: .16, ang: 1.1 });
    E.tone(cr([[-22, 88], [22, 88], [20, 112], [-20, 112]], 2, true), .25, 4);
    if (o.blush) { E.blot(-30 + tx, 34, 14, P.blush, .5 * o.blush, { seed: 5 }); E.blot(30 + tx, 34, 14, P.blush, .5 * o.blush, { seed: 6 }); }
    eye(-21 + tx, 2, 1.1, { lx: o.lx, ly: o.ly, blink: o.blink, lash: true, lid: o.lid }); eye(21 + tx, 2, 1.1, { lx: o.lx, ly: o.ly, blink: o.blink, lash: true, lid: o.lid });
    brow(-21 + tx, -20, 1.05, o.browUp || 0, o.browTilt || 0, .8); brow(21 + tx, -20, 1.05, o.browUp || 0, -(o.browTilt || 0), .8);
    pen(cr([[4 + tx, 10], [6 + tx, 28], [0 + tx, 31]]), { w: 1.8, a: .6 });
    mouth(tx, 52, 1.05, o.m ?? 0, o.open || 0);
    // чёлка/пробор
    const fr = cr([[-56, -10], [-58, -58], [-20, -98], [30, -96], [60, -56], [56, -10], [40, -50], [8, -70], [-30, -58]], 5, true);
    knock(fr); E.tone(fr, .5, 5);
    for (let i = 0; i < 9; i++) pen(cr([[6 - i * 3, -100], [-10 - i * 6, -74 + i * 3], [-40 - i * 2, -44 + i * 4], [-54 + i, -4 - i]]), { w: 1.2 + hash(i) , a: .6, sketch: false });
    for (let i = 0; i < 9; i++) pen(cr([[6 + i * 3, -100], [30 + i * 4, -74 + i * 3], [50 + i, -44 + i * 4], [54 - i, -4 - i]]), { w: 1.2 + hash(i + 4), a: .6, sketch: false });
    E.erase(cr([[-30, -84], [-10, -92], [-36, -50], [-46, -40]], 3, true), .5, 5);
    pen(cr([[-56, 0], [-70, -60], [-40, -100], [6, -104], [50, -98], [72, -60], [56, 0]]), { w: 2.6, a: .85 });
    E.pop();
  };

  // ================= ГОЛОВА В ПРОФИЛЬ (смотрит вправо) =================
  function headSide(o, who) {
    const face = cr([[-8, -50], [26, -44], [40, -18], [42, -6], [52, 6], [43, 12], [45, 20], [42, 26], [44, 30], [34, 44], [12, 52], [-14, 50], [-34, 30], [-44, 0], [-38, -32]], 5, true);
    knock(face);
    // передний контур: лоб, нос, губы, подбородок, линия челюсти
    pen(cr([[26, -42], [38, -20], [42, -6], [52, 6], [43, 13], [45, 20], [42, 26], [44, 31], [34, 44], [14, 50]]), { w: 2.8, a: .9 });
    pen(cr([[14, 50], [-4, 44], [-12, 28]]), { w: 2, a: .6 });
    pen(ell(-6, 4, 7, 11), { w: 2, a: .7 });
    eye(26, -6, .8, { lx: o.lx ?? .8, ly: o.ly || 0, blink: o.blink, lash: who === 'her', lid: o.lid });
    brow(26, -21, .8, o.browUp || 0, o.browTilt || 0, who === 'her' ? .8 : 1);
    if (o.m === 1 || o.m === 2) { pen(cr([[36, 25], [41, 28], [45, 24]]), { w: 2.2, a: .9 }); if (o.m === 2) E.fillG(cr([[38, 25], [44, 30], [46, 24]]), .5); }
    else if (o.m === 3) { pen(ell(43, 25, 3, 4), { w: 2, a: .9 }); }
    if (o.talk > .05) { const k = o.talk; E.fillG(ell(41, 26, 3.4, 1.5 + 3.5 * k, 0, 6.3, 12), .7); pen(ell(41, 26, 3.6, 1.6 + 3.6 * k, 0, 6.3, 14), { w: 1.8, a: .9, sketch: false }); }
    if (o.blush) E.blot(24, 18, 10, P.blush, .5 * o.blush, { seed: 9 });
    if (who === 'him') {
      const hair = cr([[30, -40], [10, -62], [-30, -58], [-52, -26], [-48, 18], [-36, 28], [-30, 4], [-14, -18], [12, -30]], 5, true);
      knock(hair); E.tone(hair, .3, 4);
      curls(-6, -12, 48, Math.PI * .7, Math.PI * 1.85, 13, 11, 3, .85);
    } else {
      const hair = cr([[32, -42], [6, -60], [-34, -52], [-54, -14], [-58, 60], [-52, 150], [-30, 150], [-30, 60], [-28, 20], [-10, -20], [18, -34]], 5, true);
      knock(hair); E.tone(hair, .2, 6);
      for (let i = 0; i < 6; i++) pen(cr([[24 - i * 6, -44 + i * 2], [-20 - i * 4, -48 + i * 6], [-46 + i * 2, -10 + i * 4], [-50 + i * 3, 60], [-44 + i * 2, 146]]), { w: i ? 1.4 : 2.4, a: i ? .55 : .85 });
    }
  }

  // ================= ОН СИДИТ (профиль, вправо) =================
  // o: book: 'up' | 'lap' | 'out' (тянет к ней) | 'show' (показывает лист), bk (0..1 перехода), headY (вжался), + лицо
  E.himSit = function (x, y, s, o = {}) {
    E.push(x, y, s);
    const sink = o.sink || 0, hy = -235 + sink * 30;
    // ноги
    const legs = cr([[-30, -10], [110, -8], [138, 10], [140, 150], [168, 168], [118, 172], [104, 30], [-30, 40]], 4, true);
    knock(legs);
    pen(cr([[-30, -12], [110, -8], [136, 8], [142, 150]]), { w: 2.8, a: .85 }); pen(cr([[-20, 40], [100, 34], [112, 150]]), { w: 2.4, a: .75 });
    pen(cr([[110, 150], [150, 152], [172, 168], [110, 172], [110, 150]]), { w: 2.8, a: .9 });
    E.hatch([[-30, 0], [110, 0], [138, 14], [140, 148], [112, 148], [100, 36], [-30, 40]], { gap: 7, a: .28, ang: -.6 });
    // торс-худи
    const torso = cr([[-40, 30], [-52, -60], [-38, -150], [-6, -190], [34, -184], [50, -120], [56, -30], [50, 30]], 5, true);
    knock(torso); knockC(torso);
    E.wash(torso, P.hood, .0);  // (цвет — позже, когда мир окрасится)
    pen(cr([[-40, 30], [-52, -60], [-38, -150], [-6, -190], [34, -184], [50, -120], [56, -30], [50, 30]]), { w: 3, a: .85 });
    pen(cr([[-30, -178], [-56, -170], [-60, -140], [-36, -128]]), { w: 2.4, a: .75 });   // капюшон
    E.hatch(torso, { gap: 6, a: .26, ang: -1 }); E.tone(cr([[20, -180], [50, -120], [56, -30], [50, 30], [20, 30]], 3, true), .12, 8);
    if (o.hoodColor) E.wash(torso, P.ochre, .55 * o.hoodColor, { seed: 21, grow: o.hoodColor });
    // голова
    E.push(22, hy + 4 * Math.sin(E.T * 2), 1, 1, o.tilt || 0); headSide(o, 'him'); E.pop();
    // руки + блокнот
    const sh = [16, -170];
    let bx, by, br, bw = o.book === 'show' ? 176 : 100, bh = o.book === 'show' ? 140 : 136;
    const mode = o.book || 'lap';
    const POS = { up: [86, hy + 78, -.12], lap: [76, -36, 1.25], draw: [76, -36, 1.25], out: [200, -110, .1], show: [104, hy + 96, 0], down: [80, -64, .5] };
    const A = POS[o.from || mode], B = POS[mode], k = E.eio(o.bk ?? 1);
    bx = lerp(A[0], B[0], k); by = lerp(A[1], B[1], k); br = lerp(A[2], B[2], k);
    if (o.bookDy) by += o.bookDy;
    // блокнот (вид с ребра чуть повернут): прямоугольник
    const cs = Math.cos(br), sn = Math.sin(br);
    const bp = (u, v) => [bx + u * cs - v * sn, by + u * sn + v * cs];
    const thin = mode === 'show' ? 1 : .32;   // в профиль блокнот узкий; когда показывает — разворачивает лист к ней
    const Bk = [bp(-bw * .5 * thin, -bh / 2), bp(bw * .5 * thin, -bh / 2), bp(bw * .5 * thin, bh / 2), bp(-bw * .5 * thin, bh / 2)];
    // локоть и кисть
    const hand = bp(-bw * .5 * thin + 4, 20), el = [sh[0] + 36, sh[1] + 110 - (by < -150 ? 30 : 0)];
    pen(cr([sh, el, hand]), { w: 3, a: .85 }); pen(cr([[sh[0] + 22, sh[1] + 10], [el[0] + 16, el[1] - 8], [hand[0] + 4, hand[1] - 14]]), { w: 2.2, a: .6 });
    knock(Bk); knockC(Bk);
    if (mode === 'show') E.skBook(Bk, { blue: o.bookBlue, off: [-5, 5] }); else { pen(Bk.concat([Bk[0]]), { w: 2.6, a: .9 }); if (o.bookBlue) E.wash(Bk, P.blue, .85, { rough: 1 }); E.spiral(Bk[0], Bk[3], 9, 4); }
    if (o.bookText && mode === 'show' && k > .85) { E.push(bx, by, 1, 1, br); const ls = o.bookText.split('|'), sz = o.textSize || 60; ls.forEach((l, i) => E.hand(l, 0, 4 + (i - (ls.length - 1) / 2) * sz * 1.3, sz, clamp((o.textP ?? 1) * ls.length - i), { w: Math.max(2.6, sz * .1), a: 1 })); E.pop(); }
    else if (!o.bookBlue) E.hatch(Bk, { gap: 4, a: .3, ang: .8 });
    const Hd = ell(hand[0] + 4, hand[1], 13, 11); knock(Hd); pen(Hd, { w: 2.4, a: .85 });
    pen([[hand[0] + 10, hand[1] - 6], [hand[0] + 18, hand[1] - 9]], { w: 2, a: .7 });
    if (mode === 'draw') { // вторая рука рисует: карандаш бегает по странице
      const ph = E.T * 9, dx = Math.sin(ph) * 10 + Math.sin(ph * .37) * 14, dy = Math.cos(ph * 1.3) * 6;
      const hp = [bx + 6 + dx, by - 26 + dy], el2 = [sh[0] + 50, sh[1] + 104];
      pen(cr([[sh[0] + 26, sh[1] + 6], el2, hp]), { w: 2.8, a: .85 });
      const H2 = ell(hp[0], hp[1], 12, 10); knock(H2); pen(H2, { w: 2.4, a: .85 });
      pen([[hp[0] + 4, hp[1] + 6], [hp[0] + 22, hp[1] + 30]], { w: 3, a: .95 });
      if (o.redPencil) E.wash([[hp[0] + 2, hp[1] + 2], [hp[0] + 8, hp[1]], [hp[0] - 10, hp[1] - 30], [hp[0] - 16, hp[1] - 28]], P.red, .9, { rough: .5 });
      else pen([[hp[0] + 4, hp[1] + 6], [hp[0] - 14, hp[1] - 26]], { w: 3.4, a: .7 });
    }
    E.pop();
  };

  // ================= ОНА СИДИТ / ВСТАЁТ (профиль; f=−1 — смотрит влево) =================
  // o: stand 0..1, walk (смещение вправо при уходе), holdBook (0..1 — её блокнот в руке), give (0..1 — кладёт на стол)
  E.herSit = function (x, y, s, f, o = {}) {
    E.push(x, y, s, f);
    const st = E.eio(o.stand || 0), hipY = lerp(0, -175, st);
    // ноги: сидя — бедро вперёд, стоя — вертикально
    const wp = o.walk || 0, sw = Math.sin(wp) * 30 * st, lift = Math.max(0, Math.cos(wp)) * 10 * st;
    const knee = [lerp(118, 30, st) + sw * .5, lerp(-8, hipY + 175 * .5 - 10, st)], foot = [lerp(128, 30, st) + sw, 160 - lift];
    const kneeB = [knee[0] - 12 - sw, knee[1] + 34 * (1 - st)], footB = [foot[0] - 16 - sw * 2, 160 - Math.max(0, -Math.cos(wp)) * 10 * st];
    const legA = cr([[-20, hipY], knee, foot]), legB = cr([[-10, hipY + 40 * (1 - st)], kneeB, footB]);
    knock(legA.concat(legB.slice().reverse()));
    pen(legA, { w: 2.8, a: .85 }); pen(legB, { w: 2.2, a: .7 });
    pen(cr([[foot[0] - 20, foot[1] - 4], [foot[0] + 24, foot[1]], [foot[0] + 24, foot[1] + 10], [foot[0] - 20, foot[1] + 10]]), { w: 2.6, a: .9 }); if (st > .5) pen(cr([[footB[0] - 20, footB[1] - 4], [footB[0] + 24, footB[1]], [footB[0] + 24, footB[1] + 10], [footB[0] - 20, footB[1] + 10]]), { w: 2.2, a: .7 });
    // пальто
    const coat = cr([[-46, hipY + 60], [-50, hipY - 60], [-36, hipY - 150], [-4, hipY - 188], [30, hipY - 182], [44, hipY - 120], [48, hipY - 20], [60, hipY + 60]], 5, true);
    knock(coat); knockC(coat);
    pen(coat, { w: 2.8, a: .85 });
    E.hatch(coat, { gap: 6, a: .2, ang: -.9, cross: true });
    if (o.coatColor) E.wash(coat, P.navy, .45 * o.coatColor, { seed: 31, grow: o.coatColor });
    // шарф (всегда акварель)
    const sc = cr([[-30, hipY - 196], [26, hipY - 190], [34, hipY - 168], [12, hipY - 150], [22, hipY - 90], [4, hipY - 86], [-6, hipY - 150], [-34, hipY - 164]], 4, true);
    knock(sc); E.wash(sc, P.red, .8, { seed: 33, rough: 2.5 }); pen(sc, { w: 2, a: .7 });
    // голова
    const bob = Math.sin(E.T * 1.7 + 1) * 2;
    E.push(0, hipY - 236 + bob, 1, 1, o.tilt || 0); headSide(o, 'her'); E.pop();
    // рука: держит её блокнот (синяя обложка) / кладёт
    const sh = [6, hipY - 168];
    const g = E.eio(o.give || 0), hb = o.holdBook || 0;
    const hand = [lerp(44, lerp(150, 230, g), hb), lerp(hipY - 60, lerp(hipY - 110, -80, g), hb)];
    const el = [sh[0] + 20 + 30 * hb, sh[1] + 100 - 40 * hb];
    pen(cr([sh, el, hand]), { w: 2.8, a: .85 });
    if (hb > 0) {
      const bw = 84, bh = 104, ang = lerp(-.2, .0, g);
      const cs = Math.cos(ang), sn = Math.sin(ang), bp = (u, v) => [hand[0] + 50 + u * cs - v * sn, hand[1] - 20 + u * sn + v * cs * lerp(1, .25, g)];
      const Bk = [bp(-bw / 2, -bh / 2), bp(bw / 2, -bh / 2), bp(bw / 2, bh / 2), bp(-bw / 2, bh / 2)];
      knock(Bk); E.wash(Bk, P.blue, .8, { seed: 41, rough: 2 }); pen(Bk.concat([Bk[0]]), { w: 2.6, a: .85 }); E.spiral(Bk[0], Bk[3], 10, 4);
    }
    if (o.show) { // показывает разворот ему (и нам): лист к зрителю
      const k = E.eio(o.show), bx = lerp(40, 118, k), by = hipY - lerp(70, 160, k), bw = 176, bh = 140;
      const Bk = [[bx - bw / 2, by - bh / 2], [bx + bw / 2, by - bh / 2], [bx + bw / 2, by + bh / 2], [bx - bw / 2, by + bh / 2]];
      knock(Bk); knockC(Bk); pen(Bk.concat([Bk[0]]), { w: 2.8, a: .9 });
      E.wash([[bx - bw / 2 - 6, by - bh / 2 - 4], [bx - bw / 2, by - bh / 2 - 4], [bx - bw / 2, by + bh / 2 + 4], [bx - bw / 2 - 6, by + bh / 2 + 4]], P.blue, .9, { rough: .5 });
      pen(cr([sh, [sh[0] + 50, sh[1] + 70], [bx - bw / 2 + 10, by + 20]]), { w: 2.8, a: .85 });
      const H3 = ell(bx - bw / 2 + 12, by + 22, 11, 10); knock(H3); pen(H3, { w: 2.2, a: .85 });
      if (o.showText && k > .9) { E.push(bx, by, 1, f); const ls = o.showText.split('|');
        ls.forEach((l, i) => E.hand(l, 0, (i - (ls.length - 1) / 2) * (o.showSize || 34) * 1.3, o.showSize || 34, clamp((o.showP ?? 1) * ls.length - i), { ctx: E.c, color: 'rgba(30,60,140,1)', w: 3.8 }));
        E.pop(); }
    }
    const Hd = ell(hand[0], hand[1], 11, 10); knock(Hd); pen(Hd, { w: 2.2, a: .85 });
    E.pop();
  };
})();

// ---- предметы и знаки
(function () {
  const { cr, ell, rect, lerp, clamp, hash } = E; const pen = E.pen;
  // её синий блокнот, лежит на столе (вид чуть сверху)
  E.blueBook = function (x, y, s = 1, rot = 0) {
    E.push(x, y, s, 1, rot);
    const B = [[-50, -12], [46, -15], [52, 9], [-46, 12]]; E.knock(B); E.knockC(B);
    E.wash(B, E.PAL.blue, .82, { seed: 91, rough: 1.5 }); pen(B.concat([B[0]]), { w: 2.6, a: .85 }); E.spiral(B[0], B[1], 9, 3.5); pen([[-46, 12], [-44, 17], [54, 14], [52, 9]], { w: 1.6, a: .6 });
    E.pop();
  };
  // облачко мысли
  E.cloud = function (x, y, w, h, p = 1, tailX, tailY) {
    const n = 14, Q = [];
    for (let i = 0; i <= n * 6; i++) { const t = i / (n * 6) * Math.PI * 2, bump = Math.abs(Math.sin(t * n / 2)) * 16; Q.push([x + Math.cos(t) * (w / 2 + bump), y + Math.sin(t) * (h / 2 + bump * .8)]); }
    E.knock(Q); pen(Q, { w: 2.6, a: .85, p });
    if (tailX !== undefined) for (let i = 0; i < 3; i++) { const k = (i + 1) / 4; const r = 14 - i * 4; pen(ell(lerp(x, tailX, k + .1), lerp(y + h / 2 + 20, tailY, k + .1), r, r * .8), { w: 2.2, a: .8, p }); }
  };
  // ластик (рисованный) + крошки
  E.eraser = function (x, y, rot = .5) {
    E.push(x, y, 1, 1, rot);
    const B = [[-26, -60], [26, -60], [26, 60], [-26, 60]]; E.knock(B); E.knockC(B);
    E.wash([[-26, 10], [26, 10], [26, 60], [-26, 60]], E.PAL.rose, .7, { seed: 95, rough: 1 }); E.wash([[-26, -60], [26, -60], [26, 10], [-26, 10]], E.PAL.sky, .5, { seed: 96, rough: 1 });
    pen(B.concat([B[0]]), { w: 2.6, a: .9 }); pen([[-26, 10], [26, 10]], { w: 2, a: .7 });
    E.pop();
  };
  E.crumbs = function (x, y, t, n = 10, seed = 1) {
    for (let i = 0; i < n; i++) { const vx = (hash(i + seed) - .5) * 160, vy = -40 - hash(i * 3 + seed) * 80, tt = t; const px = x + vx * tt, py = y + vy * tt + 600 * tt * tt;
      if (py > 1280) continue; E.fillG(ell(px, py, 3 + hash(i) * 3, 2.5, 0, 6.3, 8, i), .5); }
  };
})();

// ---- руки с инструментом (вид сверху на страницу) и двойной портрет
(function () {
  const { cr, ell, lerp, clamp, hash } = E; const pen = E.pen;
  // рука с карандашом (tool: 'pencil' | 'red' | 'brush'); (x,y) — кончик
  E.toolHand = function (x, y, tool = 'pencil', rot = .5, s = 1.15) {
    E.push(x, y, s, 1, rot);
    const L = 230;
    const body = [[-7, -30], [7, -30], [7, -L], [-7, -L]];
    E.knock(body.concat([[0, 0]])); E.knockC(body);
    if (tool === 'brush') {
      E.wash([[-6, -60], [6, -60], [5, -L], [-5, -L]], E.PAL.brown, .55, { rough: .5 }); pen([[-6, -60], [-5, -L]], { w: 2, a: .7 }); pen([[6, -60], [5, -L]], { w: 2, a: .7 });
      const tip = cr([[0, 0], [-8, -26], [-6, -60], [6, -60], [8, -26], [0, 0]], 4); E.knock(tip); pen(tip, { w: 2, a: .8 }); E.wash(tip, E.PAL.sky, .8, { rough: 1 });
    } else {
      pen([[-7, -30], [-7, -L]], { w: 2.2, a: .8 }); pen([[7, -30], [7, -L]], { w: 2.2, a: .8 }); pen([[0, -34], [0, -L]], { w: 1.2, a: .4 });
      pen([[-7, -30], [0, 0], [7, -30]], { w: 2.2, a: .85 }); E.fillG([[-2.5, -10], [0, 0], [2.5, -10]], .9);
      if (tool === 'red') { E.wash([[-7, -30], [7, -30], [7, -L], [-7, -L]], E.PAL.red, .85, { rough: .5 }); E.wash([[-3, -12], [0, 0], [3, -12]], E.PAL.red, 1, { rough: 0 }); }
    }
    // рука: щепоть у кончика, ладонь, согнутые пальцы, манжета, предплечье уходит за кадр
    const palm = cr([[-8, -62], [-34, -84], [-60, -118], [-66, -160], [-52, -200], [-10, -214], [34, -200], [46, -160], [36, -112], [16, -80]], 5, true);
    const arm = [[-56, -196], [40, -206], [70, -460], [-40, -470]];
    E.knock(arm); E.knockC(arm); E.knock(palm); E.knockC(palm);
    pen(cr([[-52, -206], [-46, -300], [-40, -470]]), { w: 2.6, a: .8 }); pen(cr([[40, -210], [56, -320], [70, -460]]), { w: 2.6, a: .8 });
    const cuff = [[-60, -196], [44, -206], [48, -240], [-58, -232]]; E.knock(cuff); pen(cuff.concat([cuff[0]]), { w: 2.6, a: .85 }); E.hatch(cuff, { gap: 5, a: .3, ang: .2 });
    E.hatch(cr([[-50, -240], [48, -246], [66, -460], [-42, -466]], 2, true), { gap: 6, a: .2, ang: 1.1 });
    if (tool === 'brush') { E.wash(cuff, E.PAL.navy, .5); E.wash([[-50, -240], [48, -246], [66, -460], [-42, -466]], E.PAL.navy, .4); }
    else if (E._handCol) E.wash([[-50, -240], [48, -246], [66, -460], [-42, -466]], E.PAL.ochre, .5 * E._handCol);
    pen(palm, { w: 2.8, a: .88 });
    // указательный лежит на карандаше сверху, большой — сбоку
    const idx = cr([[-6, -50], [-16, -46], [-24, -60], [-30, -86], [-40, -110]]); pen(idx, { w: 2.6, a: .88 });
    pen(cr([[4, -52], [16, -58], [26, -76], [32, -100]]), { w: 2.4, a: .85 });
    pen(cr([[-20, -58], [-14, -64]]), { w: 1.6, a: .6 });  // ноготь
    // костяшки согнутых пальцев
    pen(cr([[-40, -112], [-58, -116], [-62, -136], [-48, -142]]), { w: 2.2, a: .75 });
    pen(cr([[-48, -142], [-66, -150], [-66, -170], [-52, -176]]), { w: 2.2, a: .7 });
    E.hatch(cr([[6, -90], [36, -112], [46, -160], [34, -200], [4, -204]], 3, true), { gap: 5, a: .18, ang: .9 });
    E.wash(palm, E.PAL.skin, .18, { rough: 2 });
    E.pop();
  };
})();
