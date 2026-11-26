// chars.js — Лео (7/12/16/18) и дед. Голова в единицах высоты головы s, тело на IK.
const C = (() => {
  const { cl, lerp, sm, pal, rgrad, grad } = E;
  const P = {
    leo: { skin: [27, 58, 74], hair: [24, 48, 26], iris: [205, 45, 45] },
    gpa: { skin: [22, 46, 69], hair: [40, 12, 92], iris: [200, 30, 42] },
  };
  // автоматическое моргание и взгляд
  C_blink = (t, seed) => { const per = 2.6 + E.hash(seed) * 1.8; const ph = (t + seed * 1.3) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; };

  function face(x, o) {
    const leo = o.who === 'leo'; const age = o.age || 7; const kid = leo && age < 14;
    const PP = o.pal ? Object.assign({}, P[o.who], o.pal) : P[o.who]; const sk = PP.skin; const s = o.s; const turn = o.turn || 0;
    x.save(); x.translate(o.x, o.y); x.rotate(o.tilt || 0); x.scale(s, s);
    const fw = leo ? (kid ? .44 : .41) : .43;           // полуширина лица
    const L = o.light == null ? -1 : o.light;           // свет слева (-1) / справа (1)
    const skin = (dl = 0, ds = 0) => pal(sk[0], sk[1] + ds, sk[2] + dl);
    // волосы сзади
    if (leo) { x.fillStyle = pal(PP.hair[0], PP.hair[1], PP.hair[2] - 4);
      x.beginPath(); x.ellipse(0, -.12, fw * 1.12, .5, 0, 0, 6.283); x.fill(); }
    // уши
    for (const sd of [-1, 1]) { const ex = sd * (fw + .01) + turn * .05 * -sd; x.fillStyle = skin(sd === L ? 2 : -8);
      x.beginPath(); x.ellipse(ex, .04, .07, .11, 0, 0, 6.283); x.fill(); x.fillStyle = skin(-16, 6); x.beginPath(); x.ellipse(ex, .05, .03, .06, 0, 0, 6.283); x.fill(); }
    // лицо
    const fp = new Path2D(); const chin = kid ? .4 : (leo ? .44 : .46);
    fp.moveTo(0, -.48); fp.bezierCurveTo(fw * 1.05, -.48, fw * 1.08, -.1, fw, .1);
    fp.bezierCurveTo(fw * .9, .32, fw * .45, chin, 0, chin); fp.bezierCurveTo(-fw * .45, chin, -fw * .9, .32, -fw, .1);
    fp.bezierCurveTo(-fw * 1.08, -.1, -fw * 1.05, -.48, 0, -.48);
    x.fillStyle = rgrad(x, L * .22 + turn * .1, -.12, .05, .62, [[0, skin(9, -4)], [.55, skin(0)], [1, skin(-14, 6)]]); x.fill(fp);
    x.save(); x.clip(fp);
    // тень под волосами и по краю
    x.fillStyle = rgrad(x, -L * .5, .1, .1, .5, [[0, 'rgba(90,40,30,.28)'], [1, 'rgba(90,40,30,0)']]); x.fillRect(-1, -1, 2, 2);
    // щёки
    for (const sd of [-1, 1]) { x.fillStyle = rgrad(x, sd * .25 + turn * .08, .2, 0, .14, [[0, `hsla(${leo ? 4 : 6},65%,62%,${(o.blush || 0) * .45 + (leo ? .32 : .38)})`], [1, 'hsla(4,65%,62%,0)']]); x.fillRect(-1, -1, 2, 2); }
    if (o.who === 'gpa') { x.strokeStyle = skin(-18, 4); x.lineWidth = .012; x.lineCap = 'round';
      for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-.18 + turn * .1, -.33 + i * .045); x.quadraticCurveTo(turn * .1, -.35 + i * .045 - .02, .18 + turn * .1, -.33 + i * .045); x.stroke(); } }
    // объём: теневая сторона и тёплый контровой
    x.fillStyle = grad(x, L * fw, 0, -L * fw * 1.1, 0, [[0, 'rgba(60,30,50,0)'], [.55, 'rgba(60,30,50,0)'], [1, 'rgba(50,25,55,.42)']]); x.fillRect(-1, -1, 2, 2);
    x.fillStyle = grad(x, 0, -.5, 0, .45, [[0, 'rgba(255,230,190,.14)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(60,25,30,.22)']]); x.fillRect(-1, -1, 2, 2);
    if (o.rim) { x.strokeStyle = o.rim; x.lineWidth = .04; x.stroke(fp); }
    x.restore();
    const ex = .175, ey = kid ? .07 : .02; const er = kid ? 1.12 : 1;
    const look = o.look || [0, 0]; const bl = cl(Math.max(o.blink || 0, o.shut || 0));
    // глаза
    for (const sd of [-1, 1]) {
      const far = turn * sd < 0 ? 1 - Math.abs(turn) * .3 : 1;
      const cx = sd * ex * far + turn * .1, cy = ey; const rx = .085 * er * far, ry = .068 * er;
      x.save(); x.translate(cx, cy);
      // глазница
      x.fillStyle = `hsla(${sk[0]},${sk[1]}%,${sk[2] - 12}%,.5)`; x.beginPath(); x.ellipse(0, -.01, rx * 1.4, ry * 1.5, 0, 0, 6.283); x.fill();
      const ep = new Path2D(); ep.ellipse(0, 0, rx, ry, 0, 0, 6.283);
      x.fillStyle = o.cloudy ? '#e6e2d8' : '#f3efe6'; x.fill(ep); x.save(); x.clip(ep);
      const ix = look[0] * rx * .55, iy = look[1] * ry * .5; const ir = .058 * er;
      const ic = PP.iris;
      x.fillStyle = rgrad(x, ix, iy, 0, ir, [[0, pal(ic[0], ic[1], ic[2] + 18)], [.7, pal(ic[0], ic[1], ic[2])], [1, pal(ic[0], ic[1] + 10, ic[2] - 22)]]);
      x.beginPath(); x.arc(ix, iy, ir, 0, 6.283); x.fill();
      x.fillStyle = '#120c0a'; x.beginPath(); x.arc(ix, iy, ir * .45, 0, 6.283); x.fill();
      if (o.cloudy) { x.fillStyle = `rgba(235,235,228,${o.cloudy * .8})`; x.beginPath(); x.arc(ix, iy, ir * 1.05, 0, 6.283); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(ix - ir * .35, iy - ir * .4, ir * .26, 0, 6.283); x.fill();
      // веко сверху (тень) и моргание
      x.fillStyle = 'rgba(80,40,30,.25)'; x.fillRect(-rx, -ry, rx * 2, ry * .45);
      const lid = lerp(-ry * 1.05 + (o.lidDown || 0) * ry * .6, ry * 1.1, bl);
      x.fillStyle = skin(-2); x.beginPath(); x.moveTo(-rx * 1.2, -ry * 1.3); x.lineTo(rx * 1.2, -ry * 1.3); x.lineTo(rx * 1.2, lid); x.quadraticCurveTo(0, lid + ry * .35 * (1 - bl * .7), -rx * 1.2, lid); x.fill();
      x.restore();
      // ресницы / линия века
      x.strokeStyle = 'rgba(40,22,16,.9)'; x.lineWidth = .016; x.lineCap = 'round';
      const ly = lerp(-ry * .95 + (o.lidDown || 0) * ry * .6, ry * .9, bl);
      x.beginPath(); x.moveTo(-rx * 1.05, ly + ry * .15); x.quadraticCurveTo(0, ly - ry * .25 * (1 - bl), rx * 1.05, ly + ry * .15); x.stroke();
      x.restore();
      // слеза
      if (o.tear && sd === -1) { const k = o.tear % 1; const ty = cy + ry + k * .32;
        x.fillStyle = `rgba(200,225,240,${.85 * (1 - k * .6)})`; x.beginPath(); x.ellipse(cx + .02, ty, .022, .032, 0, 0, 6.283); x.fill();
        x.strokeStyle = 'rgba(200,225,240,.45)'; x.lineWidth = .012; x.beginPath(); x.moveTo(cx + .02, cy + ry); x.lineTo(cx + .02, ty); x.stroke(); }
      if (o.wet) { x.fillStyle = `rgba(210,230,245,${o.wet * .6})`; x.beginPath(); x.ellipse(cx, cy + ry * .85, rx * .9, ry * .25, 0, 0, 6.283); x.fill(); }
    }
    // брови: raise (вверх), worry (внутренние концы вверх), angry
    const br = o.brow || {}; const bc = o.who === 'gpa' ? pal(40, 10, 88) : pal(PP.hair[0], PP.hair[1], PP.hair[2] - 2);
    for (const sd of [-1, 1]) { const far = turn * sd < 0 ? 1 - Math.abs(turn) * .3 : 1;
      const cx = sd * ex * far + turn * .1, by = ey - .13 - (br.raise || 0) * .05;
      const inn = -(br.worry || 0) * .05 + (br.angry || 0) * .04, out = (br.worry || 0) * .015 - (br.angry || 0) * .01;
      x.strokeStyle = bc; x.lineCap = 'round'; x.lineWidth = o.who === 'gpa' ? .055 : .036;
      x.beginPath(); x.moveTo(cx - sd * .07, by + inn); x.quadraticCurveTo(cx + sd * .01, by - .03 + (inn + out) / 2, cx + sd * .1, by + out + .01); x.stroke();
      if (o.who === 'gpa') { x.lineWidth = .02; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(cx + sd * (.02 + i * .03), by - .01 + inn * .5); x.lineTo(cx + sd * (.05 + i * .04), by - .045 + i * .01); x.stroke(); } }
    }
    // нос
    const nx = turn * .14, ny = kid ? .19 : .17;
    if (o.who === 'gpa') { x.fillStyle = rgrad(x, nx - .02, ny, 0, .1, [[0, `hsl(8,52%,66%)`], [1, skin(-6, 6)]]); x.beginPath(); x.ellipse(nx, ny, .075, .07, 0, 0, 6.283); x.fill(); }
    x.strokeStyle = skin(-24, 8); x.lineWidth = .016; x.lineCap = 'round';
    x.beginPath(); x.moveTo(nx - .035, ny + .02); x.quadraticCurveTo(nx, ny + .05, nx + .035, ny + .02); x.stroke();
    x.fillStyle = skin(10, -6); x.beginPath(); x.ellipse(nx - L * .02, ny - .03, .018, .03, 0, 0, 6.283); x.fill();
    // борода деда (под ртом)
    const my = kid ? .29 : .3; const mo = o.mouth || {}; const op = cl(mo.open || 0), smi = mo.smile == null ? .3 : mo.smile;
    if (o.who === 'gpa') { x.fillStyle = rgrad(x, L * .1, .35, .05, .45, [[0, pal(40, 14, 95)], [.7, pal(38, 10, 84)], [1, pal(30, 8, 70)]]);
      x.beginPath(); x.moveTo(-fw * 1.0, .02); x.bezierCurveTo(-fw * 1.05, .4, -.25, .78, 0, .8); x.bezierCurveTo(.25, .78, fw * 1.05, .4, fw * 1.0, .02);
      x.bezierCurveTo(fw * .7, .18, .2, .2, 0, .22); x.bezierCurveTo(-.2, .2, -fw * .7, .18, -fw, .02); x.fill();
      x.strokeStyle = pal(35, 8, 74); x.lineWidth = .012; for (let i = 0; i < 9; i++) { const a = -fw * .8 + i * fw * .2; x.beginPath(); x.moveTo(a, .3 + Math.abs(a) * -.2); x.quadraticCurveTo(a * .8, .55, a * .5, .7); x.stroke(); } }
    // рот
    const mw = (kid ? .1 : .11) * (1 + smi * .25 - op * .1); const mxx = turn * .12;
    x.save(); x.translate(mxx, my);
    if (op > .05) { x.fillStyle = '#3d1714'; x.beginPath(); x.moveTo(-mw, -smi * .015); x.quadraticCurveTo(0, -.02 + op * .0, mw, -smi * .015);
      x.quadraticCurveTo(0, op * .14 + smi * .02, -mw, -smi * .015); x.fill();
      if (smi > .4 && op > .2) { x.fillStyle = '#efe8df'; x.beginPath(); x.moveTo(-mw * .7, -.008); x.quadraticCurveTo(0, -.012, mw * .7, -.008); x.lineTo(mw * .6, .015); x.quadraticCurveTo(0, .02, -mw * .6, .015); x.fill(); }
    }
    x.strokeStyle = o.who === 'gpa' ? '#6a3a2c' : '#8a3d32'; x.lineWidth = .02; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-mw, -smi * .03); x.quadraticCurveTo(0, smi * .04 + op * .02, mw, -smi * .03); x.stroke();
    if (op < .05) { x.strokeStyle = skin(-10, 5); x.lineWidth = .014; x.beginPath(); x.moveTo(-mw * .5, .05); x.quadraticCurveTo(0, .065, mw * .5, .05); x.stroke(); }
    x.restore();
    // усы деда
    if (o.who === 'gpa') { x.fillStyle = pal(40, 12, 93); for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(mxx, my - .07); x.bezierCurveTo(mxx + sd * .08, my - .1, mxx + sd * .17, my - .05, mxx + sd * .18, my + .01 + op * .01);
      x.bezierCurveTo(mxx + sd * .12, my - .01, mxx + sd * .06, my - .02, mxx, my - .02); x.fill(); } }
    // веснушки
    if (leo && !o.noFreckles) { x.fillStyle = 'rgba(150,80,50,.35)'; for (let i = 0; i < 14; i++) { const a = E.hash(i, 3), b = E.hash(i, 9); const sd = i % 2 ? 1 : -1;
      x.beginPath(); x.arc(sd * (.12 + a * .16) + turn * .1, .13 + b * .08, .008 + a * .006, 0, 6.283); x.fill(); } }
    // волосы спереди
    if (leo) { const hc = PP.hair; if (o.pig) { x.fillStyle = pal(hc[0], hc[1], hc[2]); for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sd * fw * 1.25, .05, .13, .2, sd * .3, 0, 6.283); x.fill(); } } x.fillStyle = grad(x, 0, -.55, 0, -.1, [[0, pal(hc[0], hc[1], hc[2] + 10)], [1, pal(hc[0], hc[1], hc[2] - 4)]]);
      x.beginPath(); x.moveTo(-fw * 1.1, .02); x.bezierCurveTo(-fw * 1.25, -.4, -.25, -.66, .05, -.6); x.bezierCurveTo(.35, -.62, fw * 1.25, -.4, fw * 1.1, .0);
      // чёлка-прядки
      const tuft = age > 15 ? .8 : 1; const sw = o.hairSwing || 0;
      x.lineTo(fw * .95, -.18); x.quadraticCurveTo(fw * .7 + sw * .02, -.2, fw * .55, -.12 * tuft); x.quadraticCurveTo(.3 + sw * .02, -.25, .2, -.2 * tuft);
      x.quadraticCurveTo(.05 + sw * .03, -.28, -.08, -.14 * tuft); x.quadraticCurveTo(-.2 + sw * .02, -.3, -.32, -.2 * tuft); x.quadraticCurveTo(-fw * .9, -.25, -fw * .98, -.05); x.closePath(); x.fill();
      x.strokeStyle = pal(hc[0], hc[1], hc[2] + 16); x.lineWidth = .014; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-.3 + i * .12, -.55); x.quadraticCurveTo(-.25 + i * .12, -.4, -.3 + i * .11, -.25); x.stroke(); } }
    else { x.fillStyle = pal(40, 10, 90); for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * fw * .9, -.32); x.bezierCurveTo(sd * fw * 1.3, -.3, sd * fw * 1.35, .0, sd * fw * 1.05, .1); x.bezierCurveTo(sd * fw * 1.0, -.05, sd * fw * .95, -.2, sd * fw * .8, -.28); x.fill(); }
      x.fillStyle = rgrad(x, L * .15, -.42, 0, .2, [[0, 'rgba(255,240,225,.45)'], [1, 'rgba(255,240,225,0)']]); x.fillRect(-.4, -.6, .8, .4); }
    // очки
    if (o.glasses) { const gC = o.glassesColor || 'rgba(60,45,35,.95)'; x.strokeStyle = gC; x.lineWidth = o.who === 'gpa' ? .016 : .022;
      for (const sd of [-1, 1]) { const far = turn * sd < 0 ? 1 - Math.abs(turn) * .3 : 1; const cx = sd * ex * far + turn * .1;
        x.beginPath(); if (o.who === 'gpa') x.arc(cx, ey, .105, 0, 6.283); else x.ellipse(cx, ey, .12, .09, 0, 0, 6.283); x.stroke();
        x.fillStyle = o.lensTint || 'rgba(200,220,235,.12)'; x.fill();
        x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(cx - .04, ey - .04, .03, .015, -.6, 0, 6.283); x.fill(); }
      x.beginPath(); x.moveTo(-ex + .1 + turn * .1, ey - .01); x.quadraticCurveTo(turn * .1, ey - .04, ex - .1 + turn * .1, ey - .01); x.stroke();
      x.beginPath(); x.moveTo(-ex - .1, ey - .01); x.lineTo(-fw, ey - .03); x.moveTo(ex + .1, ey - .01); x.lineTo(fw, ey - .03); x.stroke(); }
    if (o.gpaCap) { x.fillStyle = grad(x, 0, -.7, 0, -.3, [[0, pal(30, 20, 34)], [1, pal(28, 18, 22)]]); x.beginPath(); x.moveTo(-fw * 1.1, -.3); x.bezierCurveTo(-fw * 1.1, -.65, fw * 1.1, -.65, fw * 1.15, -.32); x.quadraticCurveTo(fw * 1.4, -.24, fw * .9, -.24); x.quadraticCurveTo(0, -.3, -fw * 1.1, -.3); x.fill(); }
    x.restore();
    // маска: мелкий мазок на лице
    E.detail(o.x, o.y + s * .05, s * .62, o.detail == null ? .95 : o.detail);
  }

  // двухзвенная IK: плечо (sx,sy) → кисть (tx,ty), длины a,b, изгиб bend (+1/-1)
  function ik(sx, sy, tx, ty, a, b, bend) { let dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); const dm = Math.min(d, a + b - .001);
    const ang = Math.atan2(dy, dx); const c = cl((a * a + dm * dm - b * b) / (2 * a * dm), -1, 1); const e = ang + bend * Math.acos(c);
    return [sx + Math.cos(e) * a, sy + Math.sin(e) * a, sx + dx / d * dm, sy + dy / d * dm]; }
  function limb(x, pts, w0, w1, col, col2) { x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = col2; x.lineWidth = w0 * 1.12; x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.stroke();
    x.strokeStyle = col; x.lineWidth = w0; x.beginPath(); x.moveTo(pts[0], pts[1]); x.lineTo(pts[2], pts[3]); x.stroke();
    x.lineWidth = (w0 + w1) / 2; x.beginPath(); x.moveTo(pts[2], pts[3]); x.lineTo(pts[4], pts[5]); x.stroke();
    x.save(); x.translate(-w0 * .18, -w0 * .18); x.strokeStyle = 'rgba(255,240,215,.22)'; x.lineWidth = w0 * .35; x.beginPath(); x.moveTo(pts[0], pts[1]); x.lineTo(pts[2], pts[3]); x.lineTo(pts[4], pts[5]); x.stroke(); x.restore();
    if (pts.length >= 6) { const a = Math.atan2(pts[5] - pts[3], pts[4] - pts[2]); x.strokeStyle = col2; x.lineWidth = w1 * 1.05; x.lineCap = 'butt'; x.beginPath(); x.moveTo(pts[4] - Math.cos(a) * w1 * .45, pts[5] - Math.sin(a) * w1 * .45); x.lineTo(pts[4] - Math.cos(a) * w1 * .1, pts[5] - Math.sin(a) * w1 * .1); x.stroke(); x.lineCap = 'round'; } }
  // кисть руки: варежка с большим пальцем; grip = сжата; ang = направление предплечья
  function hand(x, hx, hy, ang, sz, sk, o = {}) { x.save(); x.translate(hx, hy); x.rotate(ang); if (o.flip) x.scale(1, -1);
    const s = sz; x.fillStyle = rgrad(x, -s * .2, -s * .2, 0, s * 1.1, [[0, pal(sk[0], sk[1], sk[2] + 6)], [1, pal(sk[0], sk[1] + 6, sk[2] - 12)]]);
    x.beginPath(); x.ellipse(s * .45, 0, s * .55, s * .42, 0, 0, 6.283); x.fill();
    if (!o.grip) { x.beginPath(); for (let i = 0; i < 4; i++) { x.ellipse(s * 1.0, (i - 1.5) * s * .2, s * .32, s * .1, 0, 0, 6.283); } x.fill(); }
    else { x.beginPath(); x.ellipse(s * .85, 0, s * .28, s * .4, 0, 0, 6.283); x.fill(); }
    x.beginPath(); x.ellipse(s * .5, -s * .42, s * .28, s * .11, -.7, 0, 6.283); x.fill();
    x.strokeStyle = pal(sk[0], sk[1] + 10, sk[2] - 22, .6); x.lineWidth = s * .05; if (o.grip) { for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(s * .78, (i - 1) * s * .2); x.lineTo(s * 1.05, (i - 1) * s * .2); x.stroke(); } }
    x.restore(); }

  // фигура по пояс/целиком. o: who, age, x,y (основание шеи), s (размер головы), hands:[[lx,ly],[rx,ry]] в ед. s от шеи,
  // grip:[l,r], hold:{r:fn(x,len)}, sit, legs, walk(фаза), breathe t
  function fig(x, o) {
    const leo = o.who === 'leo'; const age = o.age || 7; const s = o.s; const kid = leo && age < 14;
    const sk = P[o.who].skin; const t = o.t || 0;
    const br = 1 + Math.sin(t * 2.1 + (leo ? 0 : 1)) * .012;
    const sw = (kid ? .62 : leo ? .78 : .85) * s, tl = (kid ? 1.25 : leo ? 1.7 : 1.75) * s;
    const cloth = o.cloth || (leo ? [45, 70, 52] : [215, 30, 34]); const cl2 = [cloth[0], cloth[1], cloth[2] - 12];
    const x0 = o.x, y0 = o.y; const lean = o.lean || 0;
    x.save(); x.translate(x0, y0); x.rotate(lean);
    // ноги
    if (o.legs !== false) { const hipY = tl * .98, hw = sw * .55; const pc = o.pants || (leo ? [220, 30, 28] : [30, 15, 25]); x.lineCap = 'round';
      if (o.sit) { for (const sd of [-1, 1]) { limb(x, [sd * hw * .5, hipY, sd * hw * .7, hipY + s * .2 * o.sit + s * .9 * (1 - o.sit), sd * hw * .75, hipY + s * 1.6], s * .34, s * .28, pal(pc[0], pc[1], pc[2]), pal(pc[0], pc[1], pc[2] - 8));
        x.fillStyle = '#2a1f1a'; x.beginPath(); x.ellipse(sd * hw * .8, hipY + s * 1.65, s * .22, s * .12, 0, 0, 6.283); x.fill(); } }
      else { const wf = o.walk == null ? 0 : o.walk; for (const sd of [-1, 1]) { const ph = Math.sin(wf * Math.PI * 2 + (sd > 0 ? Math.PI : 0));
        const lift = Math.max(0, ph) * s * .25; const ln = (kid ? 1.5 : 2.1) * s;
        limb(x, [sd * hw * .45, hipY, sd * hw * .5, hipY + ln * .5 - lift * .5, sd * hw * .5, hipY + ln - lift], s * .3, s * .26, pal(pc[0], pc[1], pc[2]), pal(pc[0], pc[1], pc[2] - 8));
        x.fillStyle = o.boots || '#2a1f1a'; x.beginPath(); x.ellipse(sd * hw * .5, hipY + ln - lift + s * .05, s * .2, s * .11 * (1 + ph * .2), 0, 0, 6.283); x.fill(); } } }
    // руки: задняя половина (под торсом не нужна — фронтальный вид, рисуем после торса)
    x.save(); x.scale(1, br);
    // шея
    x.fillStyle = pal(sk[0], sk[1] + 4, sk[2] - 10); x.fillRect(-s * .14, -s * .25, s * .28, s * .35);
    // торс
    const tp = new Path2D(); tp.moveTo(-sw * .45, 0); tp.bezierCurveTo(-sw * .7, s * .02, -sw * .78, s * .25, -sw * .74, tl * .45);
    tp.bezierCurveTo(-sw * .7, tl * .8, -sw * .6, tl, -sw * .5, tl * 1.02); tp.lineTo(sw * .5, tl * 1.02); tp.bezierCurveTo(sw * .6, tl, sw * .7, tl * .8, sw * .74, tl * .45);
    tp.bezierCurveTo(sw * .78, s * .25, sw * .7, s * .02, sw * .45, 0); tp.closePath();
    x.fillStyle = rgrad(x, -sw * .3, tl * .2, s * .1, tl * 1.1, [[0, pal(cloth[0], cloth[1], cloth[2] + 10)], [.6, pal(cloth[0], cloth[1], cloth[2])], [1, pal(cl2[0], cl2[1], cl2[2] - 6)]]); x.fill(tp);
    x.save(); x.clip(tp); x.fillStyle = grad(x, -sw * .8, 0, sw * .8, 0, [[0, 'rgba(255,230,190,.12)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(40,20,50,.35)']]); x.fillRect(-sw, -s, sw * 2, tl * 2); x.restore();
    if (o.stripes) { x.save(); x.clip(tp); x.strokeStyle = o.stripes; x.lineWidth = s * .09; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-sw, s * .3 + i * s * .28); x.quadraticCurveTo(0, s * .34 + i * s * .28, sw, s * .3 + i * s * .28); x.stroke(); } x.restore(); }
    if (o.apron) { x.save(); x.clip(tp); x.fillStyle = grad(x, 0, s * .3, 0, tl, [[0, pal(38, 25, 70)], [1, pal(36, 22, 58)]]); x.beginPath(); x.moveTo(-sw * .4, s * .35); x.lineTo(sw * .4, s * .35); x.lineTo(sw * .5, tl * 1.1); x.lineTo(-sw * .5, tl * 1.1); x.fill();
      const sp = [[200, 60, 45], [355, 70, 45], [45, 85, 55], [140, 45, 40], [25, 80, 50]]; for (let i = 0; i < 16; i++) { const c = sp[i % 5]; x.fillStyle = pal(c[0], c[1], c[2]); x.beginPath(); x.ellipse((E.hash(i, 1) - .5) * sw * .8, s * .5 + E.hash(i, 2) * (tl - s * .5), s * (.03 + E.hash(i, 3) * .05), s * (.02 + E.hash(i, 4) * .04), E.hash(i, 5) * 3, 0, 6.283); x.fill(); } x.restore(); }
    // воротник
    x.fillStyle = pal(cl2[0], cl2[1], cl2[2]); x.beginPath(); x.ellipse(0, s * .02, s * .26, s * .1, 0, 0, Math.PI); x.fill();
    if (o.hood) { x.fillStyle = pal(cloth[0], cloth[1], cloth[2] - 6); x.beginPath(); x.ellipse(0, -s * .02, sw * .5, s * .16, 0, 0, Math.PI * 2); x.fill(); }
    // шарф
    if (o.scarf) { const sc = o.scarf; const sv = o.scarfSwing || 0; x.fillStyle = grad(x, -s * .3, 0, s * .3, s * .2, [[0, pal(sc[0], sc[1], sc[2] + 8)], [1, pal(sc[0], sc[1], sc[2] - 8)]]);
      x.beginPath(); x.ellipse(0, s * .02, s * .36, s * .16, 0, 0, 6.283); x.fill();
      x.beginPath(); x.moveTo(s * .08, s * .08); x.quadraticCurveTo(s * .2 + sv * s * .1, s * .6, s * .12 + sv * s * .2, s * 1.1); x.lineTo(s * .34 + sv * s * .2, s * 1.05); x.quadraticCurveTo(s * .36 + sv * s * .1, s * .5, s * .28, s * .05); x.fill();
      x.strokeStyle = pal(sc[0], sc[1], sc[2] + 20, .6); x.lineWidth = s * .03; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(s * .14 + i * s * .05 + sv * s * .2, s * 1.08); x.lineTo(s * .14 + i * s * .05 + sv * s * .2, s * 1.2); x.stroke(); } }
    x.restore();
    // руки
    const ua = (kid ? .62 : .85) * s, fa = (kid ? .58 : .8) * s; const aw = (kid ? .18 : .21) * s;
    const H = o.hands || [[-.5, 1.5], [.5, 1.5]];
    const arms = [];
    for (let i = 0; i < 2; i++) { const sd = i ? 1 : -1; const sx = sd * sw * .62, sy = s * .14; const hx = H[i][0] * s, hy = H[i][1] * s;
      const [ex, ey, wx, wy] = ik(sx, sy, hx, hy, ua, fa, sd > 0 ? -1 : 1); arms.push([sx, sy, ex, ey, wx, wy, sd]); }
    const order = o.front === 0 ? [1, 0] : [0, 1];
    for (const i of order) { const [sx, sy, ex, ey, wx, wy, sd] = arms[i];
      limb(x, [sx, sy, ex, ey, wx, wy], aw, aw * .8, pal(cloth[0], cloth[1], cloth[2] + (sd < 0 ? 4 : -4)), pal(cl2[0], cl2[1], cl2[2] - 6));
      const ang = Math.atan2(wy - ey, wx - ex);
      if (o.hold && o.hold[i]) { x.save(); x.translate(wx, wy); x.rotate(ang); o.hold[i](x, s); x.restore(); }
      hand(x, wx, wy, ang, s * (kid ? .17 : .2), sk, { grip: o.grip && o.grip[i], flip: sd < 0 });
      E.detail(x0 + wx, y0 + wy, s * .4, .6); }
    x.restore();
    if (o.head !== false) face(x, Object.assign({ pal: o.pal, pig: o.pig, noFreckles: o.noFreckles }, o.face || {}, { who: o.who, age, x: x0 + (o.headDx || 0) * s + Math.sin(lean) * -s * .1, y: y0 - s * .52 + (o.headDy || 0) * s, s, glasses: o.who === 'gpa' ? true : (o.face && o.face.glasses) }));
    return arms;
  }

  // предметы в руке (локальные координаты кисти, ось x — вдоль предплечья)
  const props = {
    brush: (col) => (x, s) => { x.save(); x.rotate(-1.2); x.fillStyle = '#6b4a2b'; x.fillRect(-s * .05, -s * 1.1, s * .1, s * 1.5); x.fillStyle = '#b8b0a0'; x.fillRect(-s * .06, -s * 1.3, s * .12, s * .25);
      x.fillStyle = col || '#2b241e'; x.beginPath(); x.moveTo(-s * .06, -s * 1.3); x.quadraticCurveTo(0, -s * 1.65, s * .06, -s * 1.3); x.fill(); x.restore(); },
    tube: (col, label) => (x, s) => { x.save(); x.rotate(-1.4); x.fillStyle = '#d9d6cf'; x.beginPath(); x.roundRect(-s * .12, -s * .9, s * .24, s * .8, s * .04); x.fill();
      x.fillStyle = col; x.fillRect(-s * .12, -s * .75, s * .24, s * .35); x.fillStyle = '#333'; x.fillRect(-s * .06, -s * 1.02, s * .12, s * .12); x.restore(); },
    apple: (col) => (x, s) => { x.fillStyle = E.rgrad(x, s * .55, -s * .15, 0, s * .5, [[0, col[0]], [1, col[1]]]); x.beginPath(); x.ellipse(s * .6, 0, s * .42, s * .4, 0, 0, 6.283); x.fill(); },
    paper: (x, s) => { x.save(); x.rotate(-.3); x.fillStyle = '#efe9dc'; x.fillRect(-s * .1, -s * .6, s * .7, s * .9); x.restore(); },
  };
  // рукав-конус от края кадра к кисти
  function sleeve(x, x0, y0, x1, y1, w0, w1, col) { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    x.fillStyle = grad(x, x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0, [[0, pal(col[0], col[1], col[2] + 10)], [.5, pal(col[0], col[1], col[2])], [1, pal(col[0], col[1], col[2] - 14)]]);
    x.beginPath(); x.moveTo(x0 + nx * w0, y0 + ny * w0); x.lineTo(x1 + nx * w1, y1 + ny * w1); x.arc(x1, y1, w1, a + 1.57, a - 1.57, true); x.lineTo(x0 - nx * w0, y0 - ny * w0); x.fill();
    x.strokeStyle = pal(col[0], col[1], col[2] - 16); x.lineWidth = w1 * .5; x.beginPath(); x.moveTo(x1 + nx * w1 * .95 - Math.cos(a) * w1 * .3, y1 + ny * w1 * .95 - Math.sin(a) * w1 * .3); x.lineTo(x1 - nx * w1 * .95 - Math.cos(a) * w1 * .3, y1 - ny * w1 * .95 - Math.sin(a) * w1 * .3); x.stroke(); }
  // плечи для крупного плана
  function bust(x, cx, ny, s, col, o = {}) { x.fillStyle = rgrad(x, cx - s * .4, ny + s * .5, s * .1, s * 1.8, [[0, pal(col[0], col[1], col[2] + 8)], [1, pal(col[0], col[1], col[2] - 14)]]);
    x.beginPath(); x.moveTo(cx - s * .2, ny); x.bezierCurveTo(cx - s * .5, ny + s * .1, cx - s * 1.2, ny + s * .15, cx - s * 1.4, ny + s * 1.2); x.lineTo(cx + s * 1.4, ny + s * 1.2); x.bezierCurveTo(cx + s * 1.2, ny + s * .15, cx + s * .5, ny + s * .1, cx + s * .2, ny); x.fill();
    const sk = P[o.who || 'leo'].skin; x.fillStyle = pal(sk[0], sk[1] + 4, sk[2] - 12); x.beginPath(); x.moveTo(cx - s * .15, ny - s * .25); x.lineTo(cx + s * .15, ny - s * .25); x.lineTo(cx + s * .17, ny + s * .05); x.quadraticCurveTo(cx, ny + s * .15, cx - s * .17, ny + s * .05); x.fill();
    x.strokeStyle = pal(col[0], col[1], col[2] - 18); x.lineWidth = s * .06; x.beginPath(); x.moveTo(cx - s * .22, ny + s * .02); x.quadraticCurveTo(cx, ny + s * .2, cx + s * .22, ny + s * .02); x.stroke();
    if (o.scarf) { const c = o.scarf; x.fillStyle = pal(c[0], c[1], c[2]); x.beginPath(); x.ellipse(cx, ny + s * .04, s * .36, s * .14, 0, 0, 6.283); x.fill(); x.beginPath(); x.moveTo(cx + s * .05, ny + s * .1); x.lineTo(cx + s * .3, ny + s * .1); x.lineTo(cx + s * .34, ny + s * 1.2); x.lineTo(cx + s * .1, ny + s * 1.2); x.fill(); } }
  return { face, fig, hand, props, ik, P, blink: C_blink, sleeve, bust };
})();
var C_blink;
