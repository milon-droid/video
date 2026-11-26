// EP1 «WARM»
EPS[1] = () => {
  const { W, H, pal, rgrad, grad, glow, lerp, cl, sm, seg, ss, eo, eio, back } = E; const L = Wd.layer; const B = C.blink;
  const RED = '#c71f1f', GRN = '#007418';           // в глазах Лео одинаковые
  const LEO7 = { who: 'leo', age: 7, cloth: [46, 80, 56], stripes: 'hsla(30,60%,45%,.55)' };
  const GPA = { who: 'gpa', cloth: [212, 38, 34], apron: 1, scarf: [355, 72, 42] };
  const apple = (x, cx, cy, r) => { x.fillStyle = rgrad(x, cx - r * .35, cy - r * .35, r * .1, r * 1.1, [[0, '#f0574a'], [.5, '#c51e1c'], [1, '#5e0d10']]);
    x.beginPath(); x.moveTo(cx, cy - r * .7); x.bezierCurveTo(cx + r * .9, cy - r * 1.15, cx + r * 1.25, cy + r * .2, cx + r * .55, cy + r * .9); x.bezierCurveTo(cx + r * .25, cy + r * 1.05, cx - r * .25, cy + r * 1.05, cx - r * .55, cy + r * .9);
    x.bezierCurveTo(cx - r * 1.25, cy + r * .2, cx - r * .9, cy - r * 1.15, cx, cy - r * .7); x.fill();
    x.fillStyle = 'rgba(255,240,230,.7)'; x.beginPath(); x.ellipse(cx - r * .45, cy - r * .3, r * .14, r * .26, .5, 0, 6.283); x.fill();
    x.strokeStyle = '#4a2c16'; x.lineWidth = r * .07; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy - r * .65); x.quadraticCurveTo(cx + r * .05, cy - r * .95, cx + r * .15, cy - r * 1.05); x.stroke();
    x.fillStyle = '#3f8f2c'; x.beginPath(); x.ellipse(cx + r * .35, cy - r * .95, r * .3, r * .12, -.5, 0, 6.283); x.fill(); E.detail(cx, cy, r * 1.3, .5); E.shine(cx - r * .4, cy - r * .3, r * .5, .8); };
  const bigHand = (x, hx, hy, ang, sz, sk, grip) => C.hand(x, hx, hy, ang, sz, sk || C.P.leo.skin, { grip });
  const brushAt = (x, hx, hy, tx, ty, w = 7) => { x.strokeStyle = '#5a3c22'; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(hx + (hx - tx) * .6, hy + (hy - ty) * .6); x.lineTo(tx, ty); x.stroke();
    x.fillStyle = '#2a201a'; x.beginPath(); x.ellipse(tx, ty, w * .7, w * 1.6, Math.atan2(ty - hy, tx - hx) + 1.57, 0, 6.283); x.fill(); };

  return [
    // 1 ХУК: яблоко — сверху как у всех, снизу как у Лео
    { d: 2.8, cues: [[0, 'hook', 1], [0.05, 'brush', .8], [2.15, 'swipe', .8]], draw: (lt, t) => {
      const c = K.drift(lt, 2.8, { x: 360, y: 640, z: 1.04 }, { x: 360, y: 640, z: 1.12 });
      L(c, .4, x => x.drawImage(E.cache('orchard', W + 400, H + 300, (x, w, h) => { x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(205, 55, 62)], [.5, pal(120, 35, 38)], [1, pal(110, 30, 22)]]); x.fillRect(0, 0, w, h);
        E.dabs(x, { n: 1300, w, h, len: 46, wid: 20, seed: 101, alpha: .7, angle: (px, py, r) => r() * 6, col: (px, py, r) => py < h * .25 ? [205, 50, 60 + r() * 20] : r() < .12 ? [358, 75, 45] : [100 + r() * 30, 35 + r() * 15, 25 + r() * 20] }); }), -200, -150));
      L(c, 1, x => { glow(x, 360, 560, 420, 'rgba(255,230,180,.35)', 1);
        const sw = Math.sin(t * 1.4) * .02; x.save(); x.translate(360, 330); x.rotate(sw);
        x.strokeStyle = pal(28, 35, 22); x.lineCap = 'round'; x.lineWidth = 40; x.beginPath(); x.moveTo(-500, -120); x.quadraticCurveTo(-100, -20, 300, -110); x.stroke(); x.lineWidth = 12; x.beginPath(); x.moveTo(0, -55); x.quadraticCurveTo(10, 0, 0, 90); x.stroke();
        for (let i = 0; i < 7; i++) { x.fillStyle = pal(105 + i * 6, 45, 32 + (i % 3) * 8); x.save(); x.translate(-380 + i * 110, -110 + Math.sin(i * 2) * 25); x.rotate(.6 + i); x.beginPath(); x.ellipse(0, 40, 30, 70, 0, 0, 6.283); x.fill(); x.restore(); }
        apple(x, 0, 310, 190); x.restore(); });
      const sy = 640 - E.ei(seg(lt, 2.1, 2.75)) * 760;   // граница уходит вверх — дальше весь мир «мой»
      E.nocam(); E.truth(m => { m.moveTo(0, 0); m.lineTo(W, 0); for (let i = 20; i >= 0; i--) m.lineTo(W * i / 20, sy + Math.sin(i * 1.3 + lt * 2) * 14); });
      const x = E.ctx(); x.strokeStyle = '#f3ead6'; x.lineWidth = 14; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i <= 20; i++) { const px = W * i / 20 * eo(lt / .5), py = sy + Math.sin(i * 1.3 + lt * 2) * 14; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      E.text('WHAT YOU SEE', 40, sy - 50, { size: 36, align: 'left', a: ss(lt, .25, .5) * (1 - ss(lt, 2.0, 2.3)), weight: 700, ls: 3 });
      E.text('WHAT I SEE', 40, sy + 52, { size: 36, align: 'left', a: ss(lt, .25, .5) * (1 - ss(lt, 2.0, 2.3)), weight: 700, ls: 3 });
      E.sub(['I WAS BORN', 'WITHOUT RED.'], lt, .1, 2.8, { size: 70, y: 1020 }); } },

    // 2 класс: мама зелёная
    { d: 4.4, tr: { type: 'smear', d: .5, dir: [0, -1] }, cues: [[.3, 'class', .5], [.4, 'brush', .5], [1.45, 'truth', .7], [2.15, 'laugh', .9]], draw: (lt, t) => {
      const c = K.drift(lt, 4.4, { x: 360, y: 660, z: 1.0 }, { x: 380, y: 640, z: 1.08 }); const laugh = ss(lt, 2.1, 2.4);
      Wd.classroom(c, t);
      L(c, .8, x => { for (let i = 0; i < 4; i++) { const kx = [90, 250, 480, 640][i], ky = 560 + (i % 2) * 20; const hh = laugh * Math.abs(Math.sin(t * 14 + i)) * 6;
          Wd.kid(x, i, kx, ky - hh, 78, t, { hands: laugh > .5 && i % 2 ? [[-.4, 1.1], [kx < 360 ? 1.6 : -1.6, -.2]] : [[-.45, 1.0], [.45, 1.0]], face: { mouth: { open: laugh * .8, smile: .2 + laugh * .8 }, look: [kx < 400 ? .7 : -.7, .2], blink: laugh * .7, brow: { raise: laugh * .6 } } }); }
        x.fillStyle = pal(28, 40, 26); x.fillRect(-80, 690, 900, 40); });
      L(c, 1, x => { // мольберт с рисунком
        const green = 1; Wd.easel(x, 510, 1160, 290, 340, (x, w, h) => Wd.momPic(x, w, h, green));
        const shy = ss(lt, 2.2, 2.6);
        C.fig(x, Object.assign({}, LEO7, { x: 240, y: 770, s: 150, t, legs: false, hands: [[-.5, 1.3], [lerp(1.65 + Math.sin(lt * 5) * .12, .5, shy), lerp(.5 + Math.cos(lt * 5) * .15, 1.2, shy)]], grip: [0, 1],
          hold: [null, shy < .5 ? C.props.brush('#3c8c3a') : null], face: { look: shy > .3 ? [.8, -.2] : [.9, .1], turn: .25, blink: B(t, 2), mouth: { smile: lerp(.7, -.4, shy), open: lerp(.2, .25, shy) }, brow: { worry: shy, raise: shy * .5 } } }));
        x.fillStyle = grad(x, 0, 1040, 0, 1300, [[0, pal(30, 40, 30)], [1, pal(28, 40, 18)]]); x.fillRect(-100, 1040, 950, 300); });
      // «правда»: на миг видно, какого цвета мама на самом деле
      const tk = ss(lt, 1.4, 1.7) * (1 - ss(lt, 3.6, 4.0));
      if (tk > 0) { E.cam(c); E.truth(m => { const r = 230 * tk; m.ellipse(510, 650, r, r * 1.15, 0, 0, 6.283); }); E.cam(c); const x = E.ctx(); x.strokeStyle = `rgba(245,235,215,${tk})`; x.lineWidth = 8; x.beginPath(); x.ellipse(510, 650, 230 * tk, 265 * tk, 0, 0, 6.283); x.stroke(); }
      E.sub(['I PAINTED', 'MOM GREEN.'], lt, 1.5, 4.4, { size: 64, y: 1030 }); } },

    // 3 дождь, домой
    { d: 3.8, tr: { type: 'smear', d: .55, dir: [1, 0] }, cues: [[0, 'rain', .7, { dur: 4.2 }], [.2, 'steps', .6, { dur: 3.4 }]], draw: (lt, t) => {
      const c = K.drift(lt, 3.8, { x: 360, y: 640, z: 1.0 }, { x: 360, y: 620, z: 1.1 });
      Wd.rainStreet(c, t);
      L(c, 1, x => { const k = lt / 3.8; const s = lerp(120, 150, k); const y = lerp(700, 730, k);
        x.fillStyle = 'rgba(10,12,20,.35)'; x.beginPath(); x.ellipse(360, y + s * 3.2, s * .9, s * .15, 0, 0, 6.283); x.fill();
        C.fig(x, Object.assign({}, LEO7, { x: 360, y: y + Math.abs(Math.sin(lt * 5.2)) * -6, s, t, cloth: [50, 90, 55], hood: 1, stripes: null, walk: lt * .83, boots: '#1d3a6a',
          hands: [[-.55, 1.35 + Math.sin(lt * 5.2) * .1], [.5, 1.3 - Math.sin(lt * 5.2) * .1]], grip: [0, 1],
          hold: [null, (x, s) => { x.fillStyle = '#e8e0cf'; x.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, r = s * (.22 + E.hash(i, 5) * .08); x.lineTo(s * .5 + Math.cos(a) * r, Math.sin(a) * r); } x.fill(); }],
          face: { look: [0, .8], lidDown: .5, blink: B(t, 3), mouth: { smile: -.5 }, brow: { worry: 1 }, tilt: .05 }, headDy: .06 }));
        // капюшон поверх головы
        const hy = y - s * .52 + s * .06; x.fillStyle = pal(50, 90, 52); x.beginPath(); x.ellipse(360, hy - s * .12, s * .58, s * .55, 0, Math.PI * 1.02, Math.PI * 1.98); x.fill();
        Wd.rain(x, t, 1, 180); });
      E.sub('EVERYONE LAUGHED.', lt, .5, 3.8, { size: 60, y: 1080 }); } },

    // 4 мастерская: дед не смеётся
    { d: 4.6, tr: { type: 'smear', d: .55, dir: [-1, 0] }, cues: [[0, 'room', .5, { dur: 5 }], [.4, 'paper', .7], [1.3, 'paper', .5], [2.4, 'hum', .5]], draw: (lt, t) => {
      const c = K.drift(lt, 4.6, { x: 340, y: 640, z: 1.05 }, { x: 380, y: 610, z: 1.13 }); const look = ss(lt, 2.2, 2.6);
      Wd.studio(c, t, { lampX: 430 });
      L(c, 1, x => {
        C.fig(x, Object.assign({}, GPA, { x: 440, y: 660, s: 165, t, legs: false, hands: [[-.6 + Math.sin(lt * 3) * .25 * (1 - look), 2.0], [.7 - Math.sin(lt * 3) * .25 * (1 - look), 2.0]], front: 1,
          face: { look: lerp(0, 1, 0) ? [0, 0] : [lerp(-.2, -.9, look), lerp(.8, .1, look)], turn: -look * .25, blink: B(t, 1), lidDown: .3 * (1 - look), mouth: { smile: lerp(.25, .8, look) }, brow: { raise: look * .4 } } }));
        C.fig(x, Object.assign({}, LEO7, { x: 165, y: 790, s: 140, t, legs: false, hands: [[-.3, 1.4], [.9, 1.0]], grip: [1, 0],
          face: { look: [lerp(.5, .8, look), lerp(.4, -.5, look)], turn: .25, blink: B(t, 2), wet: .6, mouth: { smile: lerp(-.5, .1, look) }, brow: { worry: lerp(1, .4, look), raise: look * .3 } } }));
        // стол и рисунок
        x.fillStyle = grad(x, 0, 960, 0, 1300, [[0, pal(28, 45, 32)], [1, pal(25, 45, 18)]]); x.fillRect(-100, 960, 950, 340);
        x.save(); x.translate(430, 1050); x.transform(1, 0, -.25, .55, 0, 0); x.rotate(.06); Wd.momPic(x, 260, 230, 1); x.strokeStyle = 'rgba(60,40,30,.3)'; x.lineWidth = 3; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(E.hash(i) * 260, 0); x.lineTo(E.hash(i, 2) * 260, 230); x.stroke(); } x.restore();
        bigHand(x, 330 + Math.sin(lt * 3) * 40 * (1 - look), 1075, -.2, 34, C.P.gpa.skin); bigHand(x, 560 - Math.sin(lt * 3) * 40 * (1 - look), 1080, 3.3, 34, C.P.gpa.skin); });
      E.sub("GRANDPA DIDN'T.", lt, 1.0, 4.6, { size: 64, y: 1180 }); } },

    // 5 тюбики: новые имена цветов
    { d: 6.8, tr: { type: 'smear', d: .5, dir: [0, 1] }, cues: [[.5, 'pen', .7, { dur: .9 }], [1.9, 'pen', .7, { dur: .9 }], [3.3, 'pen', .7, { dur: .9 }], [4.7, 'pen', .8, { dur: 1 }], [4.6, 'warmnote', .7]], draw: (lt, t) => {
      const c = K.drift(lt, 6.8, { x: 360, y: 600, z: 1.0 }, { x: 360, y: 860, z: 1.22 });
      Wd.table(c, t);
      const T = [['#f2c230', 'SUN ON YOUR NECK', 'CADMIUM YELLOW'], ['#2a5cc8', 'RIVER', 'ULTRAMARINE'], [GRN, 'GRASS AFTER RAIN', 'VIRIDIAN'], [RED, 'WARM', 'CADMIUM RED']];
      L(c, 1, x => { let tip = null;
        T.forEach((tb, i) => { const a = .5 + i * 1.4, rv = eo(seg(lt, a, a + (i === 3 ? 1.1 : .9))); const cy = 330 + i * 190;
          Wd.tube(x, 330, cy, 470, tb[0], tb[1], rv, { old: rv > 0 ? null : tb[2], r: -.04 + i * .02 });
          if (lt > a - .3 && lt < a + 1.15) { const lx = 330 - 470 * .045; tip = [lx - 95 + 190 * rv, cy + 6 + Math.sin(lt * 30) * 4 * (rv > 0 && rv < 1)]; } });
        if (!tip) tip = lt < .5 ? [600, 300] : [560, 960];
        const hx = tip[0] + 120, hy = tip[1] + 150; C.sleeve(x, hx + 420, hy + 520, hx + 34, hy + 40, 70, 40, [212, 38, 32]); brushAt(x, hx, hy, tip[0], tip[1], 9); C.hand(x, hx, hy, -2.3, 46, C.P.gpa.skin, { grip: 1 }); });
      E.sub(['HE RENAMED', 'EVERY COLOR.'], lt, .3, 4.2, { size: 62, y: 1130 }); } },

    // 6а «THIS IS RED» — ладони на горячей кружке
    { d: 3.3, tr: { type: 'smear', d: .5, dir: [1, 0] }, cues: [[0, 'tea', .6], [.4, 'cup', .5], [.9, 'heart', .35]], draw: (lt, t) => {
      const c = K.drift(lt, 3.3, { x: 360, y: 640, z: 1.05 }, { x: 360, y: 640, z: 1.15 });
      L(c, .4, x => { x.save(); x.filter = 'blur(6px)'; x.drawImage(Wd.studioWall('night'), -400, -250, W + 800, H + 500); x.restore(); glow(x, 360, 700, 700, 'rgba(255,170,90,.55)', 1); });
      L(c, 1, x => { const cx = 360, cy = 700;
        for (let i = 0; i < 4; i++) { const sx = cx - 60 + i * 40 + Math.sin(t * 1.3 + i) * 20, ph = (t * .5 + i * .25) % 1; x.strokeStyle = `rgba(240,235,225,${.5 * (1 - ph)})`; x.lineWidth = 20 * (1 - ph * .5); x.beginPath(); x.moveTo(sx, cy - 200 - ph * 300); x.bezierCurveTo(sx + 40, cy - 260 - ph * 300, sx - 40, cy - 330 - ph * 300, sx + 10, cy - 400 - ph * 300); x.stroke(); }
        x.fillStyle = grad(x, cx - 170, 0, cx + 170, 0, [[0, '#7a2620'], [.35, '#c2443a'], [1, '#4a1512']]); x.beginPath(); x.roundRect(cx - 170, cy - 210, 340, 400, 40); x.fill();
        x.fillStyle = '#3a1a10'; x.beginPath(); x.ellipse(cx, cy - 205, 165, 30, 0, 0, 6.283); x.fill(); E.shine(cx - 90, cy - 50, 80, 1);
        x.strokeStyle = '#a63a30'; x.lineWidth = 38; x.beginPath(); x.arc(cx + 190, cy, 80, -1.3, 1.3); x.stroke();
        const sq = Math.sin(lt * 2) * 4, g = eo(seg(lt, .3, 1.1));
        C.sleeve(x, cx - 520, cy + 420, cx - 175, cy + 70 + sq, 90, 55, [46, 80, 50]); C.sleeve(x, cx + 520, cy + 440, cx + 175, cy + 80 - sq, 90, 55, [46, 80, 50]);
        bigHand(x, cx - 175, cy + 70 + sq, -.35, 70, C.P.leo.skin); bigHand(x, cx + 175, cy + 80 - sq, 3.5, 70, C.P.leo.skin);
        C.sleeve(x, cx - 700, cy + 200, cx - 250 + g * 40, cy + 30, 120, 75, [212, 38, 32]); C.sleeve(x, cx + 700, cy + 230, cx + 250 - g * 40, cy + 50, 120, 75, [212, 38, 32]);
        C.hand(x, cx - 250 + g * 40, cy + 30, .05, 95, C.P.gpa.skin); C.hand(x, cx + 250 - g * 40, cy + 50, 3.1, 95, C.P.gpa.skin);
        E.detail(cx, cy, 420, .5); });
      K.quote('“THIS IS RED.”', lt, .7, 3.3, { y: 1150 }); } },

    // 6б «THIS IS BLUE» — ладонь на морозном стекле
    { d: 3.3, tr: { type: 'smear', d: .5, dir: [0, -1] }, cues: [[0, 'wind', .5, { dur: 3.6 }], [.35, 'glass', .7]], draw: (lt, t) => {
      const c = K.drift(lt, 3.3, { x: 360, y: 640, z: 1.05 }, { x: 360, y: 640, z: 1.14 });
      Wd.frost(c, t);
      L(c, 1, x => { const p = eo(seg(lt, .1, .5)); const hx = 360, hy = 640 + (1 - p) * 300;
        glow(x, hx, hy - 60, 260, 'rgba(240,250,255,.5)', ss(lt, .5, 1.5), 'source-over');
        x.save(); x.translate(hx, hy); x.rotate(-1.57); const sk = C.P.leo.skin; x.fillStyle = rgrad(x, 0, 0, 10, 180, [[0, pal(sk[0], sk[1], sk[2] + 4)], [1, pal(sk[0], sk[1] + 8, sk[2] - 14)]]);
        x.beginPath(); x.ellipse(40, 0, 110, 95, 0, 0, 6.283); x.fill(); for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(170 + (i === 0 || i === 3 ? -20 : 0), (i - 1.5) * 44, 70, 20, 0, 0, 6.283); x.fill(); }
        x.beginPath(); x.ellipse(40, -110, 60, 22, -.6, 0, 6.283); x.fill(); x.restore(); C.sleeve(x, hx + 60, hy + 700, hx, hy + 80, 110, 80, [46, 80, 50]); E.detail(hx, hy - 100, 260, .6); });
      K.quote('“THIS IS BLUE.”', lt, .7, 3.3, { y: 1150 }); } },

    // 7 рисует с закрытыми глазами
    { d: 6.0, tr: { type: 'smear', d: .55, dir: [-1, 0] }, cues: [[0, 'room', .5, { dur: 6 }], [.3, 'brushlong', .7, { dur: 5.4 }], [3.2, 'hum', .4]], draw: (lt, t) => {
      const c = K.drift(lt, 6, { x: 330, y: 640, z: 1.02 }, { x: 400, y: 600, z: 1.12 });
      Wd.studio(c, t, { lampX: 520, dust: 1 });
      L(c, 1, x => { const rv = eo(lt / 5.5);
        C.fig(x, Object.assign({}, GPA, { x: 170, y: 540, s: 170, t, legs: false, hands: [[1.05, .9], [.6, 2.1]], front: 0,
          face: { look: [.8, .5], turn: .3, blink: B(t, 1), lidDown: .3, mouth: { smile: .8 }, brow: { raise: .3, worry: .2 } } }));
        Wd.easel(x, 520, 1160, 300, 360, (x, w, h) => { x.save(); x.beginPath(); for (let i = 0; i < Math.floor(rv * 60); i++) { const a = E.hash(i, 77) * w, b = E.hash(i, 78) * h; x.ellipse(a, b, 50, 26, E.hash(i, 79) * 3, 0, 6.283); } x.clip(); Wd.sunsetPic(x, w, h); x.restore(); });
        const bx = 1.7 + Math.sin(lt * 2.4) * .35, by = .45 + Math.cos(lt * 3.1) * .3;
        C.fig(x, Object.assign({}, LEO7, { x: 330, y: 760, s: 150, t, legs: false, hands: [[-.3, 1.3], [bx, by]], grip: [0, 1], hold: [null, C.props.brush('#c13a2a')],
          face: { shut: 1, turn: .2, mouth: { smile: .75, open: .1 }, brow: { raise: .4 }, tilt: Math.sin(lt * 1.2) * .06 } }));
        x.fillStyle = grad(x, 0, 1060, 0, 1300, [[0, pal(25, 35, 16)], [1, pal(25, 30, 8)]]); x.fillRect(-100, 1060, 950, 260); });
      E.sub(['I LEARNED TO PAINT', 'WHAT THINGS FEEL LIKE.'], lt, .6, 6, { size: 50, y: 1130 }); } },

    // 8 выставка: картины верные
    { d: 7.4, tr: { type: 'smear', d: .8, dir: [1, -.3] }, cues: [[0, 'gallery', .5, { dur: 7.4 }], [.9, 'applause', .6], [2.3, 'truth', .7], [3.0, 'camera', .5], [4.9, 'camera', .4]], draw: (lt, t) => {
      const c = K.drift(lt, 7.4, { x: 360, y: 640, z: 1.0 }, { x: 420, y: 600, z: 1.12 });
      Wd.gallery(c, t);
      L(c, .9, x => { x.fillStyle = pal(35, 55, 32); x.fillRect(250, 330, 420, 500); x.fillStyle = '#efe7d6'; x.fillRect(270, 350, 380, 460); x.save(); x.translate(270, 350); Wd.sunsetPic(x, 380, 460); x.restore();
        glow(x, 460, 300, 420, 'rgba(255,240,210,.35)', 1);
        // лента 1st
        x.save(); x.translate(620, 380); x.rotate(.2 + Math.sin(t * 2) * .03); x.fillStyle = '#2f55b8'; x.beginPath(); x.moveTo(-20, 20); x.lineTo(-40, 120); x.lineTo(-10, 100); x.lineTo(5, 130); x.lineTo(20, 20); x.fill();
        x.fillStyle = '#d8a824'; x.beginPath(); x.arc(0, 0, 48, 0, 6.283); x.fill(); x.fillStyle = '#2f55b8'; x.beginPath(); x.arc(0, 0, 36, 0, 6.283); x.fill(); x.fillStyle = '#fff'; x.font = '900 30px Fr'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('1st', 0, 2); x.restore(); E.detail(620, 380, 70, .9);
        const fl = (lt > 3 && lt < 3.15) || (lt > 4.9 && lt < 5.02); if (fl) glow(x, 500, 600, 900, 'rgba(255,255,255,.6)', 1);
        C.fig(x, { who: 'leo', age: 12, x: 170, y: 740, s: 140, t, cloth: [214, 50, 42], legs: false, hands: [[-.5, 1.6], [.5, 1.6]], face: { look: [lerp(.7, -.2, ss(lt, 3.6, 4.2)), lerp(-.2, .2, ss(lt, 3.6, 4.2))], turn: .2, blink: B(t, 4), mouth: { smile: .55, open: .1 }, brow: { raise: .2 }, blush: .6 } }); });
      L(c, 1.15, x => { for (let i = 0; i < 6; i++) { const hx = -40 + i * 150, hy = 1110 + (i % 2) * 40; x.fillStyle = pal(220, 20, 14 + i * 2); x.beginPath(); x.ellipse(hx, hy, 70, 85, 0, 0, 6.283); x.fill(); x.beginPath(); x.ellipse(hx, hy + 170, 130, 110, 0, 0, 6.283); x.fill(); }
        const cl_ = Math.abs(Math.sin(lt * 9)) > .5 ? 1 : 0; C.fig(x, Object.assign({}, GPA, { apron: 0, x: 560, y: 950, s: 150, t, legs: false, hands: [[-.15 - cl_ * .15, .9], [.15 + cl_ * .15, .9]], front: 1, face: { look: [-.8, -.6], turn: -.2, blink: B(t, 1), mouth: { smile: .9, open: .3 }, brow: { raise: .5 } } })); });
      const tk = ss(lt, 2.3, 2.7) * (1 - ss(lt, 6.4, 7.2));
      if (tk > 0) { E.cam({ x: c.x, y: c.y, z: 1 + (c.z - 1) * .9 }); E.truth(m => { m.rect(460 - 210 * tk, 580 - 250 * tk, 420 * tk, 500 * tk); }); }
      E.sub(['I NEVER SAW', 'MY PAINTINGS.'], lt, .5, 3.9, { size: 58, y: 1040 }); E.sub(['BUT THEY', 'WERE RIGHT.'], lt, 4.0, 7.4, { size: 66, y: 1040 }); } },

    // 9 ночь: кисть промахнулась
    { d: 6.5, tr: { type: 'dip', d: .8 }, cues: [[0, 'clock', .5, { dur: 6.5 }], [.5, 'brush', .5], [2.1, 'slip', .9], [3.2, 'glasses', .6], [4.6, 'breath', .5]], draw: (lt, t) => {
      const c = K.drift(lt, 6.5, { x: 360, y: 640, z: 1.0 }, { x: 430, y: 560, z: 1.25 });
      Wd.studio(c, t, { mood: 'night', lampX: 300 });
      L(c, 1, x => { const slip = eo(seg(lt, 2.1, 2.35)); const rub = ss(lt, 2.9, 3.3) * (1 - ss(lt, 4.3, 4.7)); const lean = ss(lt, 4.5, 5.6);
        Wd.easel(x, 470, 1170, 300, 360, (x, w, h) => { x.fillStyle = pal(205, 40, 70); x.fillRect(0, 0, w, h); x.fillStyle = pal(40, 70, 60); x.beginPath(); x.arc(w * .3, h * .3, 40, 0, 6.283); x.fill();
          x.strokeStyle = pal(215, 50, 30); x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(w * .1, h * .7); x.quadraticCurveTo(w * .5, h * .6, w * .6, h * .68); x.stroke();
          if (slip > 0) { x.beginPath(); x.moveTo(w * .6, h * .68); x.lineTo(w * .6 + slip * w * .35, h * .68 + slip * h * .25); x.stroke(); } });
        const hand = rub > 0 ? [.15, -.35] : lt < 2.1 ? [1.55 + Math.sin(lt * 2) * .2, .6] : lt < 2.9 ? [1.55 + slip * .45, .6 + slip * .4] : [1.2, 1.4];
        C.fig(x, Object.assign({}, GPA, { x: 210 + lean * 60, y: 700 - lean * 20, s: 170 + lean * 15, t, legs: false, lean: lean * .12, hands: [[-.5, 2.0], hand], grip: [0, 1], hold: [null, rub > 0 ? null : C.props.brush()],
          face: { look: lt < 2.1 ? [.9, .1] : [lerp(.3, .9, lean), lerp(.2, 0, lean)], turn: .25, shut: rub, blink: B(t, 1), lidDown: .4 + lean * .4, mouth: { smile: lt < 2.1 ? .3 : -.2 + lean * -.2 }, brow: { worry: lt > 2.2 ? .9 : 0 }, glassesOff: 0 } }));
        x.fillStyle = 'rgba(8,10,20,.35)'; x.fillRect(-200, -200, 1200, 1700); glow(x, 300, 260, 650, 'rgba(255,190,110,.35)', 1); });
      E.sub(['ONE NIGHT,', 'HIS BRUSH MISSED.'], lt, 2.4, 6.4, { size: 58, y: 1120 }); } },

    // 10а два тюбика без ярлыков
    { d: 3.8, tr: { type: 'cut' }, cues: [[0, 'drone', .6, { dur: 7 }], [.4, 'tubes', .6]], draw: (lt, t) => {
      const c = K.drift(lt, 3.8, { x: 360, y: 640, z: 1.0 }, { x: 360, y: 660, z: 1.12 });
      L(c, .5, x => { x.fillStyle = pal(220, 30, 10); x.fillRect(-300, -300, 1400, 1900); glow(x, 360, 400, 800, 'rgba(255,180,100,.35)', 1); });
      L(c, .7, x => { x.save(); C.bust(x, 360, 650, 420, [212, 38, 30], { who: 'gpa', scarf: [355, 72, 42] }); C.face(x, { who: 'gpa', x: 360, y: 400, s: 420, glasses: true, look: [0, .1], blink: B(t, 1), cloudy: .5, mouth: { smile: -.1, open: ss(lt, .5, .7) * (1 - ss(lt, 2.8, 3.1)) * .3 * Math.abs(Math.sin(lt * 9)) }, brow: { worry: .8 }, detail: 0 }); x.restore();
        C.bust(x, 360, 650, 420, [212, 38, 30], { who: 'gpa', scarf: [355, 72, 42] }); });
      L(c, 1, x => { const fw = eo(lt / .6);
        for (const [sd, col] of [[-1, RED], [1, GRN]]) { const hx = 360 + sd * 165, hy = 700 + (1 - fw) * 200; C.sleeve(x, hx + sd * 160, hy + 600, hx + sd * 10, hy + 150, 100, 60, [212, 38, 32]);
          x.save(); x.translate(hx, hy); x.rotate(sd * .1 + Math.sin(t * 2 + sd) * .03); Wd.tubeV(x, 0, 0, 380, col); x.restore(); C.hand(x, hx + sd * 5, hy + 120, -1.57, 72, C.P.gpa.skin, { grip: 1 }); } });
      K.quote(['“LEO…', 'WHICH ONE IS WARM?”'], lt, .6, 3.8, { y: 1130, size: 64 }); } },

    // 10б лицо Лео: не различить
    { d: 3.0, tr: { type: 'cut' }, cues: [[.2, 'heart', .7], [1.2, 'heart', .7], [2.2, 'heart', .7]], draw: (lt, t) => {
      const c = K.drift(lt, 3, { x: 360, y: 600, z: 1.0 }, { x: 360, y: 560, z: 1.18 });
      L(c, .5, x => { x.fillStyle = pal(222, 30, 12); x.fillRect(-300, -300, 1400, 1900); glow(x, 200, 300, 700, 'rgba(255,180,100,.3)', 1); });
      L(c, 1, x => { const lk = Math.sin(lt * 3.2); C.bust(x, 360, 830, 470, [46, 80, 52]); C.face(x, { who: 'leo', age: 7, x: 360, y: 560, s: 470, look: [lk * .9, .4], blink: 0, mouth: { smile: -.4, open: .25 }, brow: { worry: 1, raise: .6 }, wet: ss(lt, 1.5, 2.5) });
});
      E.sub("I COULDN'T TELL.", lt, 1.0, 3, { size: 64, y: 1140 }); } },

    // 11 карточка
    { d: 3.4, tr: { type: 'cut' }, out: .5, cues: [[0, 'endnote', .8]], draw: (lt, t) => K.card(lt, 3.4, 1, 'WARM', 'NEXT: HIS EYES') },
  ];
};
