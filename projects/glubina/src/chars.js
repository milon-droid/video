// Персонажи кодом: водолаз в медном шлеме и удильщик. Рисуют силуэт базовыми яркостями (× amb), свет добавляет PX.lit.
const CH = (() => {
  const { C, clamp, lerp } = PX;
  const OUT = .02; // цвет контура (пиксель-арт обводка)

  // локальные → координаты буфера
  const xf = (P) => (lx, ly) => {
    const s = P.s, d = P.dir || 1, r = P.rot || 0;
    const x = lx * s * d, y = ly * s;
    return [P.x + x * Math.cos(r) - y * Math.sin(r), P.y + x * Math.sin(r) + y * Math.cos(r)];
  };
  const limb = (c, x0, y0, a1, l1, a2, l2) => { // углы от вертикали вниз, рад (вперёд = +)
    const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1;
    const x2 = x1 + Math.sin(a1 + a2) * l2, y2 = y1 + Math.cos(a1 + a2) * l2;
    return [x1, y1, x2, y2];
  };
  function stroke(c, pts, w, l, s) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = C(OUT); c.lineWidth = w + 2 / s; c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
    c.strokeStyle = C(l); c.lineWidth = w; c.stroke();
  }
  function blob(c, l, s, f) { c.beginPath(); f(c); c.fillStyle = C(l); c.fill(); c.strokeStyle = C(OUT); c.lineWidth = 1.2 / s; c.stroke(); }

  // ---------- ВОДОЛАЗ ----------
  // P: {x,y (таз), s, dir, rot, amb, walk (фаза шага, рад) | legs:[[hip,knee],[hip,knee]], arms:[[sh,el],[sh,el]] (задняя, передняя),
  //     lamp 0..1, eye 0..1 (свет на лице), blink 0..1, look -1..1, pupil 0..1, head (наклон), hose (фаза)}
  function diver(c, P) {
    const s = P.s, amb = P.amb ?? .3, A = v => v * amb;
    c.save(); c.translate(P.x, P.y); c.rotate(P.rot || 0); c.scale(s * (P.dir || 1), s);
    const w = P.walk;
    const legs = P.legs || (w != null ? [[Math.sin(w) * .55, Math.max(0, -Math.cos(w)) * .9 + .1], [Math.sin(w + Math.PI) * .55, Math.max(0, -Math.cos(w + Math.PI)) * .9 + .1]] : [[.15, .1], [-.1, .15]]);
    const arms = P.arms || [[-.3, -.5], [.35, -.6]];
    const bob = w != null ? Math.abs(Math.cos(w)) * 1.2 : 0;
    c.translate(0, -bob);
    const leg = (i, l) => {
      const [hip, kn] = legs[i]; const [x1, y1, x2, y2] = limb(c, 0, 0, hip, 13, -kn, 13);
      stroke(c, [0, 0, x1, y1, x2, y2], 8.5, A(l), s);
      c.save(); c.translate(x2, y2); c.rotate(hip - kn); blob(c, A(l * .5), s, c => c.roundRect(-3.5, -1.5, 10.5, 5.5, 2)); c.restore();
    };
    const arm = (i, l) => {
      const [sh, el] = arms[i]; const [x1, y1, x2, y2] = limb(c, 2, -20, sh, 10.5, el, 9.5);
      stroke(c, [2, -20, x1, y1, x2, y2], 7, A(l), s);
      blob(c, A(l * 1.1), s, c => c.arc(x2, y2, 3.6, 0, 7));
      return [x2, y2];
    };
    // шланг (обрубок) сзади шлема
    const hp = P.hose || 0;
    c.strokeStyle = C(A(.16)); c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, -38);
    c.bezierCurveTo(-18, -40 + Math.sin(hp) * 3, -24 + Math.sin(hp * 1.3) * 4, -30, -26 + Math.sin(hp + 1) * 5, -18 + Math.cos(hp) * 3); c.stroke();
    leg(1, .16); arm(0, .16);
    // баллон
    blob(c, A(.24), s, c => c.roundRect(-16, -27, 8, 22, 3.5));
    c.fillStyle = C(A(.4)); c.fillRect(-15, -24, 1.4, 16);
    // корпус
    blob(c, A(.26), s, c => c.roundRect(-9, -26, 19, 28, 6));
    c.fillStyle = C(A(.14)); c.fillRect(-8, -6, 17, 3); // пояс
    c.fillStyle = C(A(.5)); c.fillRect(4, -6, 3, 3);
    leg(0, .28);
    // шлем: воротник, купол, иллюминатор
    blob(c, A(.42), s, c => c.ellipse(1, -26, 12, 4, 0, 0, 7));
    const ht = P.head || 0;
    c.save(); c.translate(1, -27); c.rotate(ht); c.translate(-1, 27);
    blob(c, A(.44), s, c => c.arc(1, -36, 12.5, 0, 7));
    c.fillStyle = C(A(.62)); c.beginPath(); c.arc(-3, -41, 4, 0, 7); c.fill(); // блик на меди
    for (const [bx, by] of [[-7, -31], [-9, -39], [-5, -46]]) { c.fillStyle = C(A(.6)); c.fillRect(bx, by, 1.5, 1.5); }
    // фонарь
    blob(c, A(.3), s, c => c.roundRect(2, -51, 9, 5, 1.5));
    c.fillStyle = C(.25 + P.lamp * .75); c.fillRect(10, -50.5, 1.8, 4);
    // иллюминатор
    blob(c, A(.55), s, c => c.arc(6.5, -35, 7.5, 0, 7));
    c.fillStyle = C(.03 + (P.eye || 0) * .06); c.beginPath(); c.arc(6.5, -35, 5.8, 0, 7); c.fill();
    // лицо за стеклом (видно, если на него падает свет): кожа, глаза, брови, рот
    const e = P.eye || 0;
    if (e > .02) {
      const op = 1 - (P.blink || 0), lk = (P.look || 0) * .7, pu = P.pupil ?? .5, fr = P.fear || 0, ea = P.eyeA || 0;
      c.save(); c.beginPath(); c.arc(6.5, -35, 5.8, 0, 7); c.clip();
      c.fillStyle = C(e * .34, ea * .55); c.beginPath(); c.ellipse(6.8, -34.6, 4.7, 5.6, 0, 0, 7); c.fill();
      for (const ex of [4.7, 8.7]) {
        c.fillStyle = C(e * .95, ea * .25); c.beginPath(); c.ellipse(ex, -36, 1.25, Math.max(.12, (1.15 + fr * .35) * op), 0, 0, 7); c.fill();
        if (op > .35) { c.fillStyle = C(0); c.beginPath(); c.arc(ex + lk, -36, .35 + pu * .55, 0, 7); c.fill(); }
        c.strokeStyle = C(e * .08); c.lineWidth = .7; c.beginPath(); // бровь: страх — домиком и выше
        const by = -38.2 - fr * .9; c.moveTo(ex - 1.3, by + (ex < 6 ? fr * .5 : -fr * .5) * -1); c.lineTo(ex + 1.3, by + (ex < 6 ? -fr * .5 : fr * .5) * -1); c.stroke();
      }
      const mo = P.mo ?? 0; c.fillStyle = C(e * .06);
      c.beginPath(); c.ellipse(6.8, -31.6, .9 + (1 - mo) * .5, .35 + mo * 1.1, 0, 0, 7); c.fill();
      c.restore();
    }
    c.fillStyle = C(.35 + e * .5); c.fillRect(8.5, -39.5, 1.5, 1.5); // блик стекла
    c.restore();
    const hand = arm(1, .3);
    c.restore();
    const T = xf(P);
    return { lamp: T(11, -48.5 - bob), hand: T(hand[0], hand[1] - bob), face: T(6.5, -35 - bob), head: T(1, -36 - bob) };
  }

  // ---------- УДИЛЬЩИК ----------
  // F: {x,y (центр головы), s, dir (−1 смотрит влево), amb, mouth 0..1, eye 0..1, pupil 0..1, sway, lure:{ang, len}, lureOn, broken, tail}
  function fish(c, F) {
    const s = F.s, amb = F.amb ?? .3, A = v => v * amb, m = F.mouth ?? .3;
    c.save(); c.translate(F.x, F.y); c.rotate(F.rot || 0); c.scale(s * (F.dir || 1), s);
    const tl = Math.sin(F.tail || 0) * 8;
    // хвост
    blob(c, A(.13), s, c => { c.moveTo(-95, -6); c.lineTo(-150, -38 + tl); c.lineTo(-138, 0 + tl * .5); c.lineTo(-152, 34 + tl); c.lineTo(-95, 10); c.closePath(); });
    // спинной плавник с лучами
    blob(c, A(.12), s, c => { c.moveTo(-60, -52); c.lineTo(-78, -78); c.lineTo(-70, -58); c.lineTo(-92, -70); c.lineTo(-84, -40); c.closePath(); });
    // нижняя челюсть (сначала — чтобы верхняя легла сверху)
    const jy = 18 + m * 46, jx = 96;
    blob(c, A(.2), s, c => { c.moveTo(-40, 40); c.quadraticCurveTo(10, 66 + m * 20, jx, jy + 8); c.lineTo(jx + 4, jy - 4); c.quadraticCurveTo(50, 22 + m * 22, 6, 8); c.closePath(); });
    // тело и голова
    blob(c, A(.19), s, c => {
      c.moveTo(-100, -4); c.quadraticCurveTo(-96, -52, -40, -66); c.quadraticCurveTo(10, -80, 50, -58);
      c.quadraticCurveTo(84, -40, 92, -12); c.lineTo(80, -8); c.quadraticCurveTo(40, -2, 6, 8);
      c.quadraticCurveTo(-10, 40, -40, 44); c.quadraticCurveTo(-90, 36, -100, 10); c.closePath();
    });
    // пасть изнутри
    c.fillStyle = C(.0); c.beginPath(); c.moveTo(88, -10); c.quadraticCurveTo(40, -3, 8, 9); c.quadraticCurveTo(48, 22 + m * 22, jx + 2, jy - 4); c.closePath(); c.fill();
    // зубы — иглы
    const tooth = (x, y, dx, dy, w) => { c.beginPath(); c.moveTo(x - w, y); c.lineTo(x + dx, y + dy); c.lineTo(x + w, y); c.closePath(); c.fill(); };
    c.fillStyle = C(A(.95) + (F.toothL ?? .12));
    for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(14, 86, k), y = lerp(6, -9, k) + Math.sin(k * 3) * 2; tooth(x, y, 1 + Math.sin(i * 7) * 2, 9 + (i % 3) * 6 + Math.sin(i) * 3, 1.8); }
    for (let i = 0; i < 8; i++) { const k = i / 7, x = lerp(18, jx, k), y = lerp(14 + m * 10, jy - 3, k); tooth(x, y, -1 + Math.sin(i * 5), -(8 + (i % 2) * 7 + Math.sin(i * 3) * 3), 1.7); }
    // грудной плавник
    blob(c, A(.15), s, c => { c.moveTo(-20, 20); c.quadraticCurveTo(-50, 44 + tl * .6, -66, 30 + tl); c.quadraticCurveTo(-46, 22, -24, 12); c.closePath(); });
    // глаз
    const eo = F.eye ?? 1;
    c.fillStyle = C(OUT); c.beginPath(); c.arc(38, -36, 10.5, 0, 7); c.fill();
    if (eo > .02) {
      c.save(); c.beginPath(); c.ellipse(38, -36, 9.5, 9.5 * eo, -.15, 0, 7); c.clip();
      c.fillStyle = C(A(1.6) + .1, F.eyeA || 0); c.beginPath(); c.arc(38, -36, 9.5, 0, 7); c.fill();
      c.fillStyle = C(.0); c.beginPath(); c.ellipse(36 - (F.look || 0) * 2, -36, 1.2 + (F.pupil ?? .6) * 5.5, 2 + (F.pupil ?? .6) * 6, 0, 0, 7); c.fill();
      c.fillStyle = C(.9); c.fillRect(41, -41, 2.4, 2.4);
      c.restore();
    }
    // удочка (иллиций) от лба
    const L = F.lure || { ang: -.2, len: 120 }, bx0 = 30, by0 = -70;
    const ang = L.ang + Math.sin(F.sway || 0) * .18;
    const bx = bx0 + Math.cos(ang) * L.len, by = by0 + Math.sin(ang) * L.len + 50;
    let bulb = null;
    if (!F.broken) {
      c.strokeStyle = C(A(.25)); c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx0, by0);
      c.quadraticCurveTo(bx0 + Math.cos(ang) * L.len * .45, by0 - 40, bx, by - 6); c.stroke();
      bulb = [bx, by];
    }
    c.restore();
    const T = xf(F);
    return { bulb: bulb && T(bulb[0], bulb[1]), eye: T(38, -36), mouth: T(70, 10), root: T(bx0, by0), stalkMid: T(bx0 + Math.cos(ang) * L.len * .6, by0 - 14) };
  }
  // светящаяся приманка
  function bulb(c, x, y, r, on) {
    PX.glow(x, y, r * 16 * on, .55 * on, .9 * on);
    c.fillStyle = C(.9 * on + .1, on); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = C(1, on * .6); c.fillRect(x - r * .4, y - r * .5, Math.max(1, r * .4), Math.max(1, r * .4));
  }
  return { diver, fish, bulb };
})();
