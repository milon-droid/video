// EP2 «HIS EYES»
EPS[2] = () => {
  const { W, H, pal, rgrad, grad, glow, lerp, cl, sm, seg, ss, eo, eio } = E; const L = Wd.layer; const B = C.blink;
  const LEO16 = { who: 'leo', age: 16, cloth: [150, 30, 30] };
  const GPA = { who: 'gpa', cloth: [212, 38, 34], scarf: [355, 72, 42] };
  // натюрморт для сплита: тюльпаны, яблоки, кресло у окна
  const still = (x, t) => { x.drawImage(Wd.studioWall('day'), -200, -150); Wd.armchair(x, 520, 1020, 170); Wd.seasonWindow(x, 70, 230, 300, 470, 'spring', t);
    x.fillStyle = pal(28, 40, 30); x.fillRect(40, 830, 420, 30); x.fillRect(80, 860, 20, 260); x.fillRect(400, 860, 20, 260); Wd.tulips(x, 250, 830, 300);
    for (let i = 0; i < 3; i++) { x.fillStyle = rgrad(x, 120 + i * 50 - 8, 805, 2, 30, [[0, '#ee5a4a'], [1, '#8e1414']]); x.beginPath(); x.arc(120 + i * 55, 812, 26, 0, 6.283); x.fill(); }
    x.strokeStyle = '#a3181e'; x.lineWidth = 30; x.lineCap = 'round'; x.beginPath(); x.moveTo(420, 720); x.quadraticCurveTo(470, 800, 450, 900); x.stroke(); };
  return [
    // 1 ХУК: глаз деда мутнеет
    { d: 2.8, cues: [[0, 'hook2', 1], [.1, 'drone', .6, { dur: 3 }], [1.2, 'heart', .6]], draw: (lt, t) => {
      const c = K.drift(lt, 2.8, { x: 360, y: 640, z: 1.0 }, { x: 360, y: 640, z: 1.15 });
      L(c, 1, x => { const cl_ = eo(seg(lt, .4, 2.4)); C.face(x, { who: 'gpa', x: 625, y: 610, s: 1500, glasses: true, look: [-.2 + Math.sin(lt * 4) * .15, 0], blink: lt > 1.9 && lt < 2.1 ? Math.sin((lt - 1.9) / .2 * Math.PI) : 0, cloudy: cl_, brow: { worry: .8 }, detail: .6 });
        x.save(); x.globalAlpha = cl_ * .55; x.filter = 'blur(18px)'; x.fillStyle = '#e8e6e0'; x.beginPath(); x.arc(365, 640, 150 + cl_ * 40, 0, 6.283); x.fill(); x.restore(); });
      E.sub(['GRANDPA WAS', 'GOING BLIND.'], lt, .1, 2.8, { size: 70, y: 1080 }); } },
    // 2 бросил писать
    { d: 4.6, tr: { type: 'smear', d: .5, dir: [0, 1] }, cues: [[0, 'room', .5, { dur: 4.6 }], [.3, 'clock', .4, { dur: 4 }], [2.6, 'door', .4]], draw: (lt, t) => {
      const c = K.drift(lt, 4.6, { x: 380, y: 640, z: 1.0 }, { x: 330, y: 640, z: 1.1 });
      Wd.studio(c, t, { lamp: false, dust: 1 });
      L(c, .9, x => { Wd.canvasBack(x, 600, 1120, 230, 300); Wd.canvasBack(x, 680, 1150, 200, 260); x.fillStyle = 'rgba(180,200,220,.18)'; x.beginPath(); x.moveTo(70, 230); x.lineTo(370, 230); x.lineTo(700, 1300); x.lineTo(150, 1300); x.fill(); });
      L(c, 1, x => { Wd.armchair(x, 300, 1060, 170);
        C.fig(x, Object.assign({}, GPA, { x: 300, y: 690, s: 165, t, legs: false, hands: [[-.9, 1.8], [.9, 1.8]], face: { look: [-.9, -.1], turn: -.35, blink: B(t, 1), lidDown: .5, cloudy: .6, mouth: { smile: -.15 }, brow: { worry: .5 } } }));
        x.fillStyle = 'rgba(160,200,230,.5)'; x.beginPath(); x.moveTo(540, 1000); x.lineTo(600, 1000); x.lineTo(595, 1090); x.lineTo(545, 1090); x.fill(); x.strokeStyle = '#6b4a2b'; x.lineWidth = 6; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(555 + i * 10, 1080); x.lineTo(545 + i * 16, 930 - i * 8); x.stroke(); } });
      E.sub(['HE STOPPED', 'PAINTING.'], lt, .6, 4.6, { size: 66, y: 1140 }); } },
    // 3 сплит: он видит цвет, я — форму; вместе — целое
    { d: 7.0, tr: { type: 'smear', d: .5, dir: [1, 0] }, cues: [[0, 'split', .7], [3.9, 'merge', .9], [4.1, 'swell', .8]], draw: (lt, t) => {
      const c = K.drift(lt, 7, { x: 360, y: 640, z: 1.05 }, { x: 330, y: 660, z: 1.12 }); const mg = eio(seg(lt, 3.9, 5.0));
      const sy = lerp(640, 1400, mg);
      L(c, 1, x => { x.save(); x.beginPath(); x.rect(-300, -300, 1400, sy + 300 - (c.y - 640)); x.clip(); x.filter = `blur(${lerp(14, 0, mg)}px)`; still(x, t); x.restore();
        x.save(); x.beginPath(); x.rect(-300, sy - (c.y - 640), 1400, 2000); x.clip(); still(x, t); x.restore(); });
      E.nocam(); E.truth(m => { m.rect(0, 0, W, sy); });
      const x = E.ctx(); x.strokeStyle = '#f3ead6'; x.lineWidth = 12; x.beginPath(); x.moveTo(0, sy); for (let i = 1; i <= 20; i++) x.lineTo(W * i / 20, sy + Math.sin(i * 1.7 + t) * 10); x.stroke();
      const lab = 1 - ss(lt, 3.6, 3.9);
      E.text('HIS EYES: COLOR, NO SHAPE', 36, sy - 62, { size: 32, align: 'left', weight: 700, a: lab * ss(lt, .3, .6), ls: 2 });
      E.text('MY EYES: SHAPE, NO RED', 36, sy + 62, { size: 32, align: 'left', weight: 700, a: lab * ss(lt, .3, .6), ls: 2 });
      E.sub(['HE SAW COLOR.', 'I SAW SHAPE.'], lt, .6, 3.8, { size: 62, y: 1040 });
      E.sub(['TOGETHER —', 'ONE PAIR OF EYES.'], lt, 4.4, 7, { size: 62, y: 1040 }); } },
    // 4 Лео даёт кисть
    { d: 5.0, tr: { type: 'smear', d: .5, dir: [-1, 0] }, cues: [[.2, 'room', .5, { dur: 5 }], [1.0, 'cloth', .5], [1.6, 'brushtap', .6]], draw: (lt, t) => {
      const c = K.drift(lt, 5, { x: 360, y: 620, z: 1.05 }, { x: 380, y: 600, z: 1.14 }); const gv = eo(seg(lt, .6, 1.6));
      Wd.studio(c, t, { lampX: 500 });
      L(c, 1, x => { Wd.armchair(x, 260, 1080, 175);
        C.fig(x, Object.assign({}, GPA, { x: 260, y: 700, s: 165, t, legs: false, hands: [[-.8, 1.9], [lerp(.9, 1.3, gv), lerp(1.8, 1.4, gv)]], grip: [0, gv > .8], hold: [null, gv > .8 ? C.props.brush() : null],
          face: { look: [.6, .4], turn: .25, blink: B(t, 1), cloudy: .6, lidDown: .3, mouth: { smile: lerp(-.1, .7, ss(lt, 2.0, 2.8)) }, brow: { raise: ss(lt, 1.6, 2.4) * .5, worry: .3 } } }));
        C.fig(x, Object.assign({}, LEO16, { x: 540, y: 800, s: 150, t, legs: false, hands: [[lerp(-.6, -1.75, gv), lerp(1.3, .45, gv)], [lerp(-.2, -1.6, gv), lerp(1.2, .6, gv)]], grip: [gv < .7, 0], hold: [gv < .7 ? C.props.brush() : null, null],
          face: { look: [-.8, -.1], turn: -.3, blink: B(t, 5), mouth: { smile: .5, open: ss(lt, 2.4, 2.6) * (1 - ss(lt, 4.2, 4.5)) * Math.abs(Math.sin(lt * 10)) * .4 }, brow: { raise: .2 } } })); });
      K.quote(['“I’LL DRAW THE SHAPES.', 'YOU PICK THE COLORS.”'], lt, 2.2, 5, { y: 1140, size: 56 }); } },
    // 5 узелки на тюбиках
    { d: 4.8, tr: { type: 'smear', d: .5, dir: [0, -1] }, cues: [[.4, 'string', .7], [1.6, 'string', .7], [2.8, 'string', .7]], draw: (lt, t) => {
      const c = K.drift(lt, 4.8, { x: 360, y: 600, z: 1.0 }, { x: 360, y: 640, z: 1.1 });
      Wd.table(c, t);
      L(c, 1, x => { const T = [['#c71f1f', 'WARM', 1], ['#2a5cc8', 'RIVER', 2], ['#f2c230', 'SUN ON YOUR NECK', 3]];
        T.forEach(([col, lab, n], i) => { const cy = 360 + i * 220; Wd.tube(x, 330, cy, 460, col, lab, 1, { r: .03 - i * .02 });
          const k = eo(seg(lt, .3 + i * 1.2, 1.0 + i * 1.2)); for (let j = 0; j < n; j++) { if (k <= j / n) continue; x.fillStyle = '#f4ead2'; x.beginPath(); x.ellipse(470 - j * 40, cy - 2, 16, 24, 0, 0, 6.283); x.fill(); x.strokeStyle = '#8a7650'; x.lineWidth = 4; x.stroke(); E.detail(470 - j * 40, cy, 40, .8); }
          x.strokeStyle = '#f4ead2'; x.lineWidth = 7; x.beginPath(); x.moveTo(486, cy); x.quadraticCurveTo(520, cy + 40, 505, cy + 80 * k); x.stroke(); });
        const fi = Math.min(2, Math.floor(lt / 1.6)); const fy = 360 + fi * 220; const fx = 470 - fi * 30 + Math.sin(lt * 6) * 12;
        C.sleeve(x, fx + 380, fy + 420, fx + 40, fy + 40, 80, 45, [212, 38, 32]); C.hand(x, fx + 40, fy + 40, -2.4, 52, C.P.gpa.skin); });
      E.sub(['ONE KNOT — WARM.', 'TWO — RIVER.'], lt, .5, 4.8, { size: 54, y: 1110 }); } },
    // 6 вместе пишут — осень / зима / весна
    ...['autumn', 'winter', 'spring'].map((sea, k) => ({ d: 3.2, tr: { type: 'smear', d: .55, dir: [k % 2 ? -1 : 1, .2] }, cues: [[0, 'brushlong', .6, { dur: 3 }], [.1, sea === 'winter' ? 'wind' : 'room', .4, { dur: 3.2 }]], draw: (lt, t) => {
      const c = K.drift(lt, 3.2, { x: 360 + (k - 1) * 30, y: 640, z: 1.04 }, { x: 360 - (k - 1) * 30, y: 620, z: 1.1 });
      Wd.studio(c, t, { lampX: 560 });
      L(c, .7, x => Wd.seasonWindow(x, 70, 230, 300, 470, sea, t));
      L(c, 1, x => { const sw = Math.sin(lt * 2.2 + k) ; const hand = [1.25 + sw * .25, .7 + Math.cos(lt * 2.9 + k) * .2];
        C.fig(x, Object.assign({}, GPA, { x: 300, y: 690, s: 160, t: t + k, legs: false, hands: [[-.6, 1.9], hand], grip: [0, 1], hold: [null, C.props.brush()],
          face: { look: [.3, .2], turn: .2, blink: B(t, 1), cloudy: .6, mouth: { smile: .55 }, brow: { raise: .2 } } }));
        C.fig(x, Object.assign({}, LEO16, { x: 440, y: 770, s: 150, t: t + k, legs: false, hands: [[.4 + sw * .27, .2 + Math.cos(lt * 2.9 + k) * .2], [.4, 1.4]], grip: [0, 0], front: 0,
          face: { look: [.4, -.2], turn: .2, blink: B(t, 5), mouth: { smile: .5 }, brow: {} } }));
        Wd.canvasBack(x, 650, 1220, 250, 400); });
      E.sub([['WE PAINTED', 'EVERY DAY.'], 'FOR A YEAR.', 'HE NEVER LET ME LOOK.'][k], lt, .4, 3.2, { size: 58, y: 1140 }); } })),
    // 7 ткань: «увидишь однажды»
    { d: 5.2, tr: { type: 'smear', d: .5, dir: [0, 1] }, cues: [[.5, 'cloth', .8], [1.4, 'room', .4, { dur: 3.8 }]], draw: (lt, t) => {
      const c = K.drift(lt, 5.2, { x: 360, y: 620, z: 1.05 }, { x: 360, y: 600, z: 1.14 }); const cv = eo(seg(lt, .4, 1.4));
      Wd.studio(c, t, { lampX: 470 });
      L(c, 1, x => { Wd.easel(x, 470, 1170, 300, 380, null, { cloth: cv });
        C.fig(x, Object.assign({}, GPA, { x: 220, y: 680, s: 165, t, legs: false, hands: [[lerp(1.5, .9, cv), lerp(-.6, 1.2, cv)], [-.6, 1.9]], front: 0,
          face: { look: [.7, -.2], turn: .2, blink: B(t, 1), cloudy: .6, mouth: { smile: .75, open: ss(lt, 1.8, 2) * (1 - ss(lt, 4.4, 4.7)) * Math.abs(Math.sin(lt * 9)) * .35 }, brow: { raise: .4 } } })); });
      K.quote(['“IT’S FOR YOU.', 'YOU’LL SEE IT ONE DAY.”'], lt, 1.6, 5.2, { y: 1140, size: 58 }); } },
    // 8 ночь: последний мазок, шарф на плечи Лео
    { d: 6.4, tr: { type: 'dip', d: .8 }, cues: [[0, 'clock', .5, { dur: 6.4 }], [.6, 'brush', .6], [1.6, 'brushtap', .5], [3.4, 'cloth', .6], [4.6, 'breath', .4]], draw: (lt, t) => {
      const c = K.drift(lt, 6.4, { x: 380, y: 640, z: 1.02 }, { x: 360, y: 620, z: 1.15 }); const sc = eo(seg(lt, 3.0, 4.4));
      Wd.studio(c, t, { mood: 'night', lampX: 330 });
      L(c, 1, x => { Wd.canvasBack(x, 560, 1180, 320, 400);
        // Лео спит на табурете, голова на руках
        C.fig(x, Object.assign({}, LEO16, { x: 450, y: 870, s: 145, t, legs: false, lean: .25, hands: [[-.8, .9], [.9, .9]], headDx: .1, headDy: .3, face: { shut: 1, tilt: .45, mouth: { smile: .1 } }, scarf: sc > .95 ? [355, 72, 42] : null }));
        x.fillStyle = grad(x, 0, 960, 0, 1300, [[0, pal(25, 40, 20)], [1, pal(25, 35, 10)]]); x.fillRect(300, 960, 450, 340); x.fillStyle = pal(25, 40, 26); x.fillRect(290, 950, 470, 22);
        const hx = sc > 0 && sc < 1 ? [lerp(1.6, 1.4, sc), lerp(.4, .1, sc)] : lt < 2.4 ? [1.85, .4 + Math.sin(lt * 3) * .1] : [1.0, 1.6];
        C.fig(x, Object.assign({}, GPA, { scarf: sc < .05 ? [355, 72, 42] : null, x: 170, y: 700, s: 165, t, legs: false, hands: [[-.5, 1.9], hx], grip: [0, lt < 2.4], hold: [null, lt < 2.4 ? C.props.brush() : null],
          face: { look: lt < 2.4 ? [.9, .1] : [.9, .5], turn: .3, blink: B(t, 1), cloudy: .6, lidDown: .3, mouth: { smile: lt > 1.8 ? .8 : .3 }, brow: { raise: lt > 1.8 ? .3 : 0, worry: .2 } } }));
        if (sc > 0 && sc < 1) { x.strokeStyle = '#8f1b20'; x.lineWidth = 40; x.lineCap = 'round'; x.beginPath(); x.moveTo(lerp(250, 400, sc), lerp(720, 780, sc)); x.quadraticCurveTo(lerp(300, 450, sc), lerp(640, 760, sc) - 60, lerp(330, 480, sc), lerp(700, 800, sc)); x.stroke(); }
        x.fillStyle = 'rgba(8,10,20,.3)'; x.fillRect(-200, -200, 1200, 1700); glow(x, 330, 260, 650, 'rgba(255,190,110,.35)', 1); });
      K.quote('“DONE.”', lt, 1.7, 3.2, { y: 1130, size: 70 });
      E.sub(['HE PUT HIS SCARF', 'ON MY SHOULDERS.'], lt, 3.6, 6.4, { size: 56, y: 1130 }); } },
    // 9 утро: пустое кресло
    { d: 6.2, tr: { type: 'dip', d: 1.2 }, cues: [[0, 'birds', .5, { dur: 6.2 }], [1.2, 'endnote2', .6]], draw: (lt, t) => {
      const c = K.drift(lt, 6.2, { x: 360, y: 640, z: 1.12 }, { x: 330, y: 680, z: 1.0 });
      Wd.studio(c, t, { lamp: false, dust: 1 });
      L(c, .9, x => { x.fillStyle = 'rgba(255,240,200,.22)'; x.beginPath(); x.moveTo(70, 230); x.lineTo(370, 230); x.lineTo(760, 1300); x.lineTo(200, 1300); x.fill(); });
      L(c, 1, x => { Wd.armchair(x, 330, 1080, 180); x.save(); x.translate(470, 1150); x.rotate(.3); x.fillStyle = '#6b4a2b'; x.fillRect(-90, -6, 180, 12); x.fillStyle = '#2a201a'; x.beginPath(); x.ellipse(98, 0, 16, 7, 0, 0, 6.283); x.fill(); x.restore();
        x.fillStyle = 'rgba(30,20,10,.35)'; x.beginPath(); x.ellipse(470, 1165, 110, 12, 0, 0, 6.283); x.fill(); });
      E.sub(['THAT WAS HIS', 'LAST PAINTING.'], lt, 1.5, 6.2, { size: 64, y: 1060 }); } },
    // 10 карточка
    { d: 3.4, tr: { type: 'cut' }, out: .5, cues: [[0, 'endnote', .8]], draw: (lt, t) => K.card(lt, 3.4, 2, 'HIS EYES', 'NEXT: RED') },
  ];
};
