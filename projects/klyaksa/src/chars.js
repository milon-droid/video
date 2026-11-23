// Клякса (глаза — просветы бумаги) и кисть мастера с рукой и тенью.
'use strict';
const C = {};
(function () {
  const { stroke, blob, erase, hash, n1, cl, lerp } = E;
  // st: {x,y,r,sx,sy,rot,t, open, blink, lx,ly (взгляд), brow ('calm','fear','angry','sad'), mouth ('none','o','smile','grit','flat'), sweat, morph (птица), flap, shiver, closed}
  C.blot = function (st) {
    const c = E.ctx, r = st.r, t = st.t || 0, sx = st.sx ?? 1, sy = st.sy ?? 1;
    const shv = (st.shiver || 0) * Math.sin(t * 60) * r * .04;
    const x = st.x + shv, y = st.y;
    c.save(); c.translate(x, y); c.rotate(st.rot || 0);
    // тень-лужица, когда клякса в прыжке над бумагой (lift)
    if (st.lift) { const g = c.createRadialGradient(st.lift * .5, st.lift * .9 + r * .6, 0, st.lift * .5, st.lift * .9 + r * .6, r * 1.3); g.addColorStop(0, E.col('ink', .22)); g.addColorStop(1, E.col('ink', 0)); c.fillStyle = g; c.beginPath(); c.arc(st.lift * .5, st.lift * .9 + r * .6, r * 1.3, 0, 7); c.fill(); }
    const m = st.morph || 0;
    if (m > 0) {   // крылья
      const f = Math.sin(st.flap || 0) * .9;
      for (const s of [-1, 1]) stroke([[s * r * .5, -r * .1, r * .55 * m], [s * r * 1.3, -r * .5 + f * r * .9 * s * s, r * .35 * m], [s * r * 2.3 * m, -r * .1 + f * r * 1.6, r * .1]], { a: .96, dry: .4, seed: 5 + s, bands: 5 });
      stroke([[0, r * .4, r * .4 * m], [-r * .1, r * 1.1, r * .3 * m], [r * .2, r * 1.5 * m, 1]], { a: .9, dry: .5, seed: 9, bands: 4 });
    }
    // тело
    E.ctx = c; blob(0, 0, r, .97, 'ink', .13 + .05 * Math.sin(t * 3), 3, t * .9, sx * (1 + m * .25), sy * (1 - m * .3));
    // капли-подтёки снизу
    if (!st.noDrip) for (let i = 0; i < 2; i++) { const dx = (i ? .45 : -.3) * r * sx, ph = (t * .7 + i * .5) % 1; blob(dx, r * sy * (.86 + ph * .25), r * (.12 + .05 * i) * (1 - ph * .5), .95, 'ink', .1, 20 + i, 0, 1, 1.4); }
    // лицо
    const fx = (st.lx || 0) * r * .12, fy = (st.ly || 0) * r * .08 - r * .08;
    const open = (st.open ?? 1) * (1 - (st.blink || 0)), ew = r * .27, eh = r * .34 * Math.max(.06, open);
    const big = st.big || 1;
    if (st.closed || open < .08) {
      for (const s of [-1, 1]) erase(cc => { cc.lineWidth = r * .06; cc.beginPath(); cc.moveTo(fx + s * r * .36 - ew * .8, fy); cc.quadraticCurveTo(fx + s * r * .36, fy + eh * .3 + r * .06, fx + s * r * .36 + ew * .8, fy); cc.stroke(); });
    } else {
      erase(cc => { for (const s of [-1, 1]) { cc.beginPath(); cc.ellipse(fx + s * r * .36, fy, ew * big, eh * big, 0, 0, 7); cc.fill(); } });
      const ps = r * .13 * (st.pupil ?? 1);
      for (const s of [-1, 1]) blob(fx + s * r * .36 + (st.lx || 0) * ew * .45, fy + (st.ly || 0) * eh * .4, ps, 1, 'ink', .05, 30 + s, 0, 1, Math.min(1, open * 1.3));
    }
    // брови (светлые штрихи на чёрном)
    const bt = { calm: [0, 0], fear: [-.35, -.1], angry: [.45, .05], sad: [-.3, .05], up: [0, -.12] }[st.brow || 'calm'];
    if (st.brow && st.brow !== 'none') for (const s of [-1, 1]) erase(cc => {
      cc.lineWidth = r * .075; cc.lineCap = 'round'; const bx = fx + s * r * .36, by = fy - eh * big - r * .13 + bt[1] * r;
      cc.beginPath(); cc.moveTo(bx - s * ew * .9, by + bt[0] * r * .35); cc.lineTo(bx + s * ew * .9, by - bt[0] * r * .35); cc.stroke(); });
    // рот
    const mo = st.mouth || 'none', my = fy + r * .42;
    if (mo === 'o') erase(cc => { cc.beginPath(); cc.ellipse(fx, my, r * .09, r * .14, 0, 0, 7); cc.fill(); });
    if (mo === 'O') erase(cc => { cc.beginPath(); cc.ellipse(fx, my + r * .04, r * .14, r * .2, 0, 0, 7); cc.fill(); });
    if (mo === 'smile') erase(cc => { cc.lineWidth = r * .07; cc.lineCap = 'round'; cc.beginPath(); cc.arc(fx, my - r * .14, r * .17, .5, Math.PI - .5); cc.stroke(); });
    if (mo === 'flat') erase(cc => { cc.lineWidth = r * .06; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(fx - r * .12, my); cc.lineTo(fx + r * .12, my + r * .02); cc.stroke(); });
    if (mo === 'grit') erase(cc => { cc.beginPath(); cc.rect(fx - r * .17, my - r * .05, r * .34, r * .1); cc.fill(); });
    if (mo === 'gulp') erase(cc => { cc.lineWidth = r * .06; cc.lineCap = 'round'; cc.beginPath(); for (let i = 0; i <= 8; i++) cc[i ? 'lineTo' : 'moveTo'](fx - r * .16 + i * r * .04, my + Math.sin(i * 1.6) * r * .03); cc.stroke(); });
    c.restore();
    if (st.sweat) E.waterDrop(x + r * .95 * sx, y - r * .55 + (1 - st.sweat) * -r * .3 + st.sweat * r * .25, r * .2 * cl(st.sweat * 3), 1, 1.35);
  };
  // кисть: tip (x,y) на бумаге, h — высота кончика над бумагой (тень), a — наклон, wet — водяная, hand — рука
  C.brush = function (o) {
    const c = E.ctx, a = o.a || 0, h = o.h || 0, s = o.s || 1;
    // тень на бумаге: смещена от света (свет слева сверху), мягче при высоте
    if (o.shadow !== false) {
      const ox = 20 + h * .55, oy = 26 + h * .75, sf = 1 + h * .004;
      c.save(); c.translate(o.x + ox, o.y + oy); c.rotate(a); c.scale(s * sf, s * sf);
      const sa = .2 * cl(1 - h / 900) * (o.shadowA ?? 1);
      const g = c.createLinearGradient(0, 0, 0, -700); g.addColorStop(0, E.col('ink', sa)); g.addColorStop(1, E.col('ink', sa * .6));
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(-26, -40, -18, -100); c.lineTo(-14, -900); c.lineTo(14, -900); c.lineTo(18, -100); c.quadraticCurveTo(26, -40, 0, 6); c.fill();
      if (o.hand !== false) { c.beginPath(); c.ellipse(-10, -400, 90, 70, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-90, -430); c.lineTo(-330, -1000); c.lineTo(160, -1000); c.lineTo(60, -440); c.fill(); }
      c.restore();
    }
    c.save(); c.translate(o.x, o.y); c.rotate(a); c.scale(s, s);
    const wet = o.wet || 0, T = o.t || 0;
    // силуэт стираем (кисть над рисунком непрозрачна)
    const sil = (cc) => { cc.beginPath(); cc.moveTo(0, 4); cc.bezierCurveTo(-30, -30, -22, -80, -19, -96); cc.lineTo(-15, -1200); cc.lineTo(15, -1200); cc.lineTo(19, -96); cc.bezierCurveTo(22, -80, 30, -30, 0, 4); cc.fill();
      if (o.hand !== false) { cc.beginPath(); cc.ellipse(-8, -392, 66, 52, 0, 0, 7); cc.fill(); cc.beginPath(); cc.moveTo(-70, -420); cc.lineTo(-300, -1300); cc.lineTo(170, -1300); cc.lineTo(46, -440); cc.fill(); } };
    E.fx(xc => { xc.save(); xc.translate(o.x, o.y); xc.rotate(a); xc.scale(s, s); xc.fillStyle = 'rgba(0,0,255,1)'; sil(xc); xc.restore(); });
    erase(cc => { cc.beginPath(); cc.moveTo(0, 4); cc.bezierCurveTo(-30, -30, -22, -80, -19, -96); cc.lineTo(-15, -1200); cc.lineTo(15, -1200); cc.lineTo(19, -96); cc.bezierCurveTo(22, -80, 30, -30, 0, 4); cc.fill();
      if (o.hand !== false) { cc.beginPath(); cc.ellipse(-8, -392, 66, 52, 0, 0, 7); cc.fill(); cc.beginPath(); cc.moveTo(-70, -420); cc.lineTo(-300, -1300); cc.lineTo(170, -1300); cc.lineTo(46, -440); cc.fill(); } });
    // ручка: бамбук
    c.fillStyle = E.col('ink', .1); c.fillRect(-14, -1200, 28, 1090);
    stroke([[-14, -110, 4], [-14, -1200, 4]], { a: .8, bands: 3, dry: .3, seed: 3, taper: .02, press: .02 });
    stroke([[14, -110, 3], [14, -1200, 3]], { a: .55, bands: 3, dry: .4, seed: 4, taper: .02, press: .02 });
    for (let i = 0; i < 6; i++) { const yy = -230 - i * 170; stroke([[-15, yy, 4], [0, yy + 3], [15, yy, 3]], { a: .85, bands: 3, dry: .3, seed: 10 + i }); }
    // обойма
    c.fillStyle = E.col('ink', .5); c.fillRect(-17, -118, 34, 22);
    stroke([[-17, -118, 3], [17, -118, 3]], { a: .9, bands: 2, dry: .1, seed: 20 }); stroke([[-18, -96, 3], [18, -96, 3]], { a: .9, bands: 2, dry: .1, seed: 21 });
    // ворс
    const hd = wet ? .32 : .96, wig = Math.sin(T * 4) * 1.5;
    c.beginPath(); c.moveTo(-18, -96); c.bezierCurveTo(-26, -60, -14, -20, wig, 4); c.bezierCurveTo(14, -20, 26, -60, 18, -96); c.closePath(); c.fillStyle = E.col('ink', hd); c.fill();
    for (let i = 0; i < 7; i++) { const xx = -14 + i * 4.6; stroke([[xx, -94, 1.6], [xx * .6, -50], [wig + xx * .05, 0, .6]], { a: wet ? .55 : .3, bands: 1, dry: .3, seed: 30 + i }); }
    if (o.load) blob(wig, 2 + o.load * 6, 4 + o.load * 6, .97, 'ink', .1, 40, T, 1, 1 + o.load * .4);   // капля туши на кончике
    // рука
    if (o.hand !== false) {
      const g = c.createLinearGradient(0, -460, 0, -330); g.addColorStop(0, E.col('ink', .28)); g.addColorStop(1, E.col('ink', .1));
      c.fillStyle = g; c.beginPath(); c.ellipse(-8, -392, 64, 50, 0, 0, 7); c.fill();
      for (let i = 0; i < 4; i++) { const yy = -414 + i * 17; stroke([[-58, yy - 4, 6], [-30, yy + 8], [0, yy + 10], [24, yy + 2, 4]], { a: .9, dry: .35, seed: 50 + i, bands: 5 }); }
      stroke([[54, -446, 9], [40, -420], [22, -404, 4]], { a: .92, dry: .35, seed: 60 });          // большой палец
      stroke([[-62, -380, 6], [-66, -420], [-52, -446, 4]], { a: .85, dry: .4, seed: 61 });
      // запястье и рукав
      stroke([[-56, -440, 7], [-110, -600], [-170, -800, 5]], { a: .85, dry: .5, seed: 62 });
      stroke([[50, -446, 6], [30, -600], [10, -800, 5]], { a: .8, dry: .5, seed: 63 });
      const sw = Math.sin(T * 1.3) * 10;
      c.beginPath(); c.moveTo(-150, -700); c.bezierCurveTo(-200, -760, -320 + sw, -900, -360, -1300); c.lineTo(200, -1300); c.bezierCurveTo(140 + sw, -900, 60, -760, 30, -700); c.closePath();
      const g2 = c.createLinearGradient(0, -700, 0, -1100); g2.addColorStop(0, E.col('ink', .45)); g2.addColorStop(1, E.col('ink', .65)); c.fillStyle = g2; c.fill();
      stroke([[-150, -700, 9], [-90, -680], [30, -700, 7]], { a: .95, dry: .5, seed: 64 });
      stroke([[-150, -700, 8], [-230, -820 + sw * .3], [-330 + sw, -1100, 5]], { a: .95, dry: .55, seed: 65 });
      stroke([[30, -700, 8], [90, -840], [160 + sw, -1100, 5]], { a: .9, dry: .55, seed: 66 });
      stroke([[-60, -760, 4], [-90, -900 + sw * .2], [-110, -1100, 2]], { a: .5, dry: .6, seed: 67 });
    }
    c.restore();
    // вода на кончике — линза
    if (wet && o.drop) { const [dx, dy] = E.toWorldLocal(o, 0, 6 + o.drop * 8); E.waterDrop(dx, dy, (6 + o.drop * 10) * s, 1, 1 + o.drop * .3); }
    if (wet) { const [dx, dy] = E.toWorldLocal(o, -6, -50); E.waterDrop(dx, dy, 10 * s, .7, 2.5); }
  };
  E.toWorldLocal = (o, lx, ly) => { const a = o.a || 0, s = o.s || 1; return [o.x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, o.y + (lx * Math.sin(a) + ly * Math.cos(a)) * s]; };
})();
