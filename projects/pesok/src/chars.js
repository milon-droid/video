// Персонажи — силуэты из песка в профиль. Риг: таз → корпус → шея → голова; руки и ноги с локтями/коленями.
// Лицо читается по контуру (нос, губы, подбородок) + процарапанные пальцем глаз, бровь, очки, линия волос.
(function () {
  const { lerp, clamp, hash, noise1 } = E;
  const R = Math.PI / 180;
  // пропорции (единицы мира при s=1): ноги, корпус, голова, плечо, предплечье, толщины
  const KIND = {
    man:   { leg: 150, torso: 112, head: 31, au: 66, al: 62, wT: 58, wL: 21, wA: 15, neck: 14 },
    old:   { leg: 142, torso: 104, head: 30, au: 62, al: 58, wT: 60, wL: 19, wA: 14, neck: 10 },
    girl5: { leg: 66, torso: 58, head: 27, au: 30, al: 28, wT: 34, wL: 13, wA: 10, neck: 6 },
    girl10:{ leg: 98, torso: 76, head: 28, au: 44, al: 40, wT: 40, wL: 15, wA: 11, neck: 8 },
    teen:  { leg: 138, torso: 98, head: 29, au: 58, al: 54, wT: 44, wL: 17, wA: 12, neck: 12 },
    woman: { leg: 142, torso: 102, head: 29, au: 60, al: 56, wT: 46, wL: 17, wA: 12, neck: 12 },
    kid:   { leg: 64, torso: 56, head: 27, au: 29, al: 27, wT: 33, wL: 13, wA: 10, neck: 6 },
  };
  E.KIND = KIND;
  // моргание: 0 открыт … 1 закрыт
  E.blink = function (t, seed = 0) {
    const per = 2.6 + hash(seed) * 1.6, ph = ((t + hash(seed + 3) * per) % per);
    return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0;
  };
  // шаг: поза ног по фазе (фаза = пройденный путь / длина шага)
  E.walk = function (ph, amp = 1) {
    const s = Math.sin(ph * 6.283), c = Math.cos(ph * 6.283);
    return { hip: [26 * s * amp, -26 * s * amp], knee: [Math.max(0, -c) * 38 * amp + 4, Math.max(0, c) * 38 * amp + 4],
      sh: [-22 * s * amp, 22 * s * amp], el: [18, 18], bob: Math.abs(c) * 4 * amp };
  };
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  // P: {x,y — точка между ступнями (или сиденье, если sit), s — масштаб, f — 1 вправо / −1 влево, kind,
  //     lean, head (наклон головы, °), hip:[ближн, дальн], knee:[..], sh:[..], el:[..] (°), sit (бедро горизонтально),
  //     blink, mouth 0..1, brow −1 грусть … 1 удивление, eye 0..1 (открытость), look (зрачок вперёд/вверх), breathe t,
  //     hold:[fnNear, fnFar] — (c, x, y, ang) рисовать предмет в кисти, carveA — сила процарапывания деталей}
  E.person = function (c, P) {
    const K = KIND[P.kind || 'man'], s = P.s || 1, f = P.f || 1;
    const lean = (P.lean || 0) * R, hip = P.hip || [0, 0], knee = P.knee || [0, 0], sh = P.sh || [8, -8], el = P.el || [14, 14];
    const br = Math.sin((P.t || 0) * 2.1 + (P.seed || 0)) * .5 + .5; // дыхание
    c.save(); c.translate(P.x, P.y); c.scale(f * s, s); if (P.rot) c.rotate(P.rot * R);
    E.sand(c, P.a ?? 1); c.lineCap = 'round'; c.lineJoin = 'round';
    const hipY = P.sit ? 0 : -K.leg + (P.bob || 0) - (P.crouch || 0);
    const H0 = [0, hipY];
    // ноги
    const legs = [];
    for (let i = 0; i < 2; i++) {
      const a = (P.sit ? 88 : 0) + hip[i], kb = (P.sit ? -86 : 0) - knee[i];
      const k = [H0[0] + Math.sin(a * R) * K.leg * .5, H0[1] + Math.cos(a * R) * K.leg * .5];
      const a2 = a + kb, ft = [k[0] + Math.sin(a2 * R) * K.leg * .5, k[1] + Math.cos(a2 * R) * K.leg * .5];
      legs.push([H0, k, ft, a2]);
    }
    for (const [h, k, ft, a2] of legs) {
      c.lineWidth = K.wL; E.path(c, [h, k, ft]); c.stroke();
      // ступня
      c.save(); c.translate(ft[0], ft[1]); c.rotate(-(a2) * R * .3);
      c.beginPath(); c.ellipse(K.wL * .55, -K.wL * .1, K.wL * .95, K.wL * .42, 0, 0, 7); c.fill(); c.restore();
    }
    // корпус
    const tl = K.torso * (1 + br * .012);
    const S0 = [H0[0] + Math.sin(lean) * tl, H0[1] - Math.cos(lean) * tl];
    c.save(); c.translate(H0[0], H0[1]); c.rotate(lean);
    const wT = K.wT, chest = br * 1.5;
    c.beginPath();
    c.moveTo(-wT * .42, 6); c.bezierCurveTo(-wT * .55, -tl * .45, -wT * .48 - (P.hunch || 0) * 10, -tl * .85, -wT * .2, -tl - 4);
    c.lineTo(wT * .22, -tl - 2); c.bezierCurveTo(wT * .52 + chest, -tl * .8, wT * .5, -tl * .35, wT * .4, 6); c.closePath(); c.fill();
    // юбка / пальто
    if (P.dress) { c.beginPath(); c.moveTo(-wT * .45, -tl * .25); c.lineTo(wT * .45, -tl * .25); c.lineTo(wT * .95 + (P.sway || 0) * 6, 26); c.lineTo(-wT * .95 + (P.sway || 0) * 6, 26); c.closePath(); c.fill(); }
    c.restore();
    // руки
    const hands = [];
    for (let i = 0; i < 2; i++) {
      const sp = [S0[0] + (i ? -4 : 4), S0[1] + 10];
      const a = (sh[i]) * R + lean, e = [sp[0] + Math.sin(a) * K.au, sp[1] + Math.cos(a) * K.au];
      const a2 = a + Math.abs(el[i]) * R, w = [e[0] + Math.sin(a2) * K.al, e[1] + Math.cos(a2) * K.al];
      c.lineWidth = K.wA; E.path(c, [sp, e, w]); c.stroke();
      c.beginPath(); c.arc(w[0] + Math.sin(a2) * K.wA * .4, w[1] + Math.cos(a2) * K.wA * .4, K.wA * .62, 0, 7); c.fill();
      hands.push([w[0] + Math.sin(a2) * K.wA * .5, w[1] + Math.cos(a2) * K.wA * .5, a2]);
    }
    // шея и голова
    const ha = lean * .6 + (P.head || 0) * R;
    const N0 = [S0[0] + Math.sin(lean) * K.neck * .3, S0[1] - K.neck * .3];
    const HC = [N0[0] + Math.sin(ha) * (K.neck + K.head * .75), N0[1] - Math.cos(ha) * (K.neck + K.head * .75)];
    c.lineWidth = K.wA * 1.1; E.path(c, [S0, N0, [HC[0] - 4, HC[1] + K.head * .5]]); c.stroke();
    c.save(); c.translate(HC[0], HC[1]); c.rotate(ha);
    head(c, K.head, P);
    c.restore();
    // предметы в руках (в координатах фигуры, рисуются поверх)
    if (P.hold) for (let i = 0; i < 2; i++) if (P.hold[i]) { c.save(); E.sand(c, 1); P.hold[i](c, hands[i][0], hands[i][1], hands[i][2]); c.restore(); }
    c.restore(); E.reset(c);
    return { hands, head: HC, f, s };
  };

  // голова в профиль, смотрит вправо; r — радиус черепа
  function head(c, r, P) {
    const kid = /girl5|kid|girl10/.test(P.kind), jaw = (P.mouth || 0) * r * .16;
    const nose = kid ? .07 : (P.kind === 'old' ? .2 : .15);
    c.beginPath();
    c.moveTo(-r * .35, r * .95);
    c.bezierCurveTo(-r * 1.15, r * .7, -r * 1.12, -r * 1.05, -r * .05, -r * 1.02);
    c.bezierCurveTo(r * .62, -r * 1.0, r * .9, -r * .55, r * .86, -r * .22);      // лоб
    c.lineTo(r * (.98 + nose), r * .14);                                           // кончик носа
    c.lineTo(r * .9, r * .3);
    c.lineTo(r * .95, r * .4);                                                     // верхняя губа
    c.lineTo(r * .86, r * .49 + jaw * .5);
    c.lineTo(r * .92, r * .58 + jaw);                                              // нижняя губа
    c.bezierCurveTo(r * .9, r * .8 + jaw, r * .72, r * (kid ? .92 : .95) + jaw, r * .45, r * .92 + jaw);  // подбородок
    c.lineTo(r * .05, r * .95); c.closePath(); c.fill();
    // волосы
    const k = P.kind;
    if (k === 'man' || k === 'teen' && false) {
      c.beginPath(); c.moveTo(-r * .9, r * .3); c.bezierCurveTo(-r * 1.25, -r * .5, -r * .7, -r * 1.3, r * .1, -r * 1.18);
      c.bezierCurveTo(r * .65, -r * 1.12, r * .95, -r * .82, r * .8, -r * .55); c.lineTo(r * .2, -r * .78); c.lineTo(-r * .6, -r * .2); c.closePath(); c.fill();
    }
    if (k === 'old') {   // лысина сверху, венчик сзади
      c.beginPath(); c.ellipse(-r * .72, r * .02, r * .4, r * .5, .3, 0, 7); c.fill();
    }
    if (/girl|teen|woman|kid/.test(k)) {
      // чёлка и шапка волос
      c.beginPath(); c.moveTo(-r * .95, r * .45); c.bezierCurveTo(-r * 1.3, -r * .6, -r * .6, -r * 1.35, r * .25, -r * 1.16);
      c.bezierCurveTo(r * .8, -r * 1.02, r * 1.0, -r * .62, r * .82, -r * .38); c.lineTo(r * .3, -r * .62); c.lineTo(-r * .5, -r * .1); c.closePath(); c.fill();
      // хвост (качается)
      const sw = (P.tail || 0), L = r * (k === 'woman' ? 1.7 : k === 'teen' ? 1.6 : 1.25);
      if (k === 'kid') {   // два хвостика
        for (const [bx, by] of [[-r * .55, -r * .82], [-r * .9, -r * .2]]) {
          const ex = bx - L * .75 * Math.cos(sw * .5), ey = by + L * .25 + Math.sin(sw) * 6;
          c.beginPath(); c.moveTo(bx, by - r * .14); c.quadraticCurveTo(bx - L * .4, by - r * .3, ex, ey); c.quadraticCurveTo(bx - L * .3, by + r * .1, bx, by + r * .14); c.fill();
        }
      } else {
        const bx = -r * .85, by = -r * .55;
        const mx = bx - L * .45, my = by + L * .1 - sw * 4, ex = bx - L * .55 * Math.cos(sw) - 4, ey = by + L * Math.cos(sw * .6) * .9 + sw * L * .3;
        c.beginPath(); c.moveTo(bx + 2, by - r * .2); c.quadraticCurveTo(mx - r * .2, my - r * .1, ex, ey);
        c.quadraticCurveTo(mx + r * .1, my + r * .3, bx + 4, by + r * .2); c.closePath(); c.fill();
      }
    }
    // процарапанные детали
    const ca = P.carveA ?? 1;
    E.carve(c, ca);
    const ex = r * .48, ey = -r * .1, open = (1 - (P.blink || 0)) * (P.eye ?? 1);
    c.beginPath(); c.ellipse(ex, ey, r * .13, Math.max(.6, r * .12 * open), 0, 0, 7); c.fill();
    // бровь
    const b = P.brow || 0; c.lineWidth = r * .08;
    c.beginPath(); c.moveTo(ex - r * .2, ey - r * .25 + b * -r * .04 + (b < 0 ? r * .08 : 0)); c.lineTo(ex + r * .2, ey - r * .3 - b * r * .06 - (b < 0 ? -r * .02 : 0)); c.stroke();
    if (k === 'man' || k === 'old') {   // очки — черта героя через всю жизнь
      c.lineWidth = r * .07; c.beginPath(); c.ellipse(ex + r * .04, ey + r * .02, r * .24, r * .2, 0, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(ex - r * .2, ey); c.lineTo(-r * .4, ey + r * .06); c.stroke();
    }
    if (k === 'old') { c.lineWidth = r * .05; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-r * .72, r * .02, r * (.18 + i * .1), 2.2, 4.2); c.stroke(); } }
    if (k === 'man') { c.lineWidth = r * .05; c.beginPath(); c.moveTo(-r * .3, -r * .95); c.quadraticCurveTo(r * .2, -r * 1.05, r * .55, -r * .7); c.stroke(); }
    if (/girl|teen|woman|kid/.test(k)) { c.lineWidth = r * .06; c.beginPath(); c.arc(-r * .3, -r * .2, r * .62, 3.6, 4.6); c.stroke();
      c.beginPath(); c.arc(-r * .85, -r * .55, r * .1, 0, 7); c.fill(); }   // резинка хвоста
    if (k === 'teen' && P.phones) {   // наушники
      E.sand(c, 1); c.lineWidth = r * .14; c.beginPath(); c.arc(-r * .1, -r * .15, r * 1.12, 3.6, 5.9); c.stroke();
      c.beginPath(); c.ellipse(-r * .15, r * .05, r * .3, r * .38, 0, 0, 7); c.fill();
    }
    if (P.mouth > .15) { E.carve(c, ca); c.beginPath(); c.moveTo(r * .95, r * .45); c.lineTo(r * .7, r * .5 + jaw * .5); c.lineTo(r * .95, r * .55 + jaw); c.fill(); }
    if (P.tear) { E.carve(c, ca); c.beginPath(); c.ellipse(ex + r * .05, ey + r * .3 + P.tear * r * .4, r * .05, r * .08, 0, 0, 7); c.fill(); }
    E.sand(c, 1);
  }

  // ---------- предметы
  E.bucket = function (c, x, y, s = 1, ang = 0, a = 1) {   // ведёрко с ручкой; (x,y) — ручка в кисти
    c.save(); c.translate(x, y); c.rotate(ang * .15); c.scale(s, s); E.sand(c, a);
    c.lineWidth = 3; c.beginPath(); c.arc(0, 14, 15, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.beginPath(); c.moveTo(-17, 14); c.lineTo(17, 14); c.lineTo(12, 44); c.lineTo(-12, 44); c.closePath(); c.fill();
    E.carve(c, .8); c.lineWidth = 2.2; c.beginPath(); c.moveTo(-15, 21); c.lineTo(15, 21); c.stroke();
    // звёздочка-наклейка
    c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.5 : 6, a2 = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a2) * r, 32 + Math.sin(a2) * r); } c.fill();
    c.restore(); E.reset(c);
  };
  E.shovel = function (c, x, y, s = 1, ang = 0) {
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); E.sand(c, 1); c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 30); c.stroke(); c.beginPath(); c.moveTo(-7, 30); c.lineTo(7, 30); c.lineTo(5, 44); c.lineTo(0, 48); c.lineTo(-5, 44); c.closePath(); c.fill();
    c.restore(); E.reset(c);
  };
  // песочные часы: level — доля песка наверху (1 полные, 0 пусто); flow — сыплется ли
  E.hourglass = function (c, x, y, h, level, t, o = {}) {
    const w = h * .36;
    c.save(); c.translate(x, y); E.sand(c, 1);
    // рамка
    c.fillRect(-w * .72, -h / 2 - h * .06, w * 1.44, h * .06); c.fillRect(-w * .72, h / 2, w * 1.44, h * .06);
    c.lineWidth = Math.max(2, h * .018);
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * w * .62, -h / 2); c.lineTo(sx * w * .62, h / 2); c.stroke(); }
    // стекло (контур)
    const glass = () => { c.beginPath(); c.moveTo(-w * .5, -h / 2); c.bezierCurveTo(-w * .5, -h * .12, -w * .05, -h * .08, -w * .05, 0);
      c.bezierCurveTo(-w * .05, h * .08, -w * .5, h * .12, -w * .5, h / 2); c.lineTo(w * .5, h / 2); c.bezierCurveTo(w * .5, h * .12, w * .05, h * .08, w * .05, 0);
      c.bezierCurveTo(w * .05, -h * .08, w * .5, -h * .12, w * .5, -h / 2); c.closePath(); };
    c.save(); glass(); c.clip();
    if (o.inside !== false) { E.carve(c, 1); c.fillRect(-w, -h, w * 2, h * 2); E.sand(c, 1); }
    // верхний песок: поверхность опускается, воронка в центре
    const top = -h / 2 + (1 - level) * h * .46 + h * .02;
    if (level > .002) { c.beginPath(); c.moveTo(-w, top - 2); c.quadraticCurveTo(0, top + h * .06 * Math.min(1, level * 4), w, top - 2); c.lineTo(w, 0); c.lineTo(-w, 0); c.closePath(); c.fill(); }
    // нижний песок: горка растёт
    const bot = h / 2 - (1 - level) * h * .4;
    c.beginPath(); c.moveTo(-w, h / 2); c.lineTo(-w, bot + h * .1); c.quadraticCurveTo(0, bot - h * .08, w, bot + h * .1); c.lineTo(w, h / 2); c.fill();
    if (level > .002 && o.flow !== false) E.stream(c, 0, 0, bot - h * .04, Math.max(2, h * .018), t, 1, 5);
    c.restore();
    c.lineWidth = Math.max(1.6, h * .012); E.sand(c, .9); glass(); c.stroke();
    c.restore(); E.reset(c);
  };
})();
