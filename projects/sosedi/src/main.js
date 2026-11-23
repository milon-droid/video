// Камера, сцена, титры, печать.
window.SCENE = { duration: DUR, fps: 30, width: CW * RES, height: CH * RES };
const V = (cx, cy, vw) => ({ cx, cy, vw });
const mixC = (a, b, u) => V(lerp(a.cx, b.cx, u), lerp(a.cy, b.cy, u), Math.exp(lerp(Math.log(a.vw), Math.log(b.vw), u)));
const CF3 = V(650, 440, 760), CF2 = V(650, 1330, 760), CBOTH = V(560, 900, 1100), CSTAIR = V(220, 1250, 720), CTL = V(640, 1330, 820);
const CAM = [[0, CF3], [2.6, CF3], [3.6, CF2], [7.2, CF2], [8.0, CBOTH], [16.0, CBOTH], [16.6, V(930, 520, 720)], [17.8, V(930, 1230, 720)], [18.3, V(900, 1300, 520)], [20.0, V(900, 1300, 520)],
  [20.7, V(760, 960, 1040)], [21.5, V(760, 960, 1040)], [22.0, V(900, 1290, 600)], [22.3, V(930, 1250, 720)], [23.5, V(930, 520, 720)], [24.2, CBOTH], [26.3, CBOTH], [26.9, CSTAIR],
  [32.5, CSTAIR], [33.0, CTL], [41.0, CTL], [41.8, V(660, 1360, 700)], [48.1, V(660, 1360, 700)], [DUR, CF3]];
function camera(t) {
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) { const [t0, a] = CAM[i - 1], [t1, b] = CAM[i]; return mixC(a, b, E.io(clamp((t - t0) / (t1 - t0)))); }
  return CF3;
}
const CAPS = [
  [3.8, 6.7, ['She lives right above me.', 'We’ve never met.'], 905],
  [11.4, 13.7, ['Every night, we talked like this.'], 905],
  [18.5, 20.1, ['“Play the one about the moon.”'], 905],
  [25.0, 26.7, ['Two knocks.', 'That’s a yes.'], 905],
  [28.8, 30.2, ['You’re terrible at guitar.'], 905],
  [30.3, 31.7, ['You’re terrible at knocking.'], 905],
  [43.6, 46.3, ['Fifty years ago…', 'you knocked first.'], 905],
  [46.4, 47.9, ['And you knocked back.'], 905],
];
const VOT = { l1: 3.8, l2: 11.4, l3: 18.5, l4: 25.0, m1: 28.8, l5: 30.3, o1: 43.6, om1: 46.4 };
const talk = (t, a, b) => t > a && t < b ? .2 + .3 * Math.abs(Math.sin(t * 17)) * Math.abs(Math.sin(t * 5.3)) : 0;
function caption(ctx, t) {
  for (const [t0, t1, lines, yc] of CAPS) {
    if (t < t0 || t > t1) continue;
    const out = clamp((t1 - t) / .2);
    ctx.save(); ctx.font = '900 46px Inter';
    const fs = Math.min(46, 46 * 600 / Math.max(...lines.map(l => ctx.measureText(l).width)));
    ctx.font = `900 ${fs}px Inter`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const lh = fs * 1.3, y0 = yc - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => {
      const li = clamp((t - t0 - i * .35) / .16); if (li <= 0) return;
      const w = ctx.measureText(l).width + 36, x = 360 - w / 2 - 14 + (i % 2 ? 24 : 0), y = y0 + i * lh;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1.4 : -1.1) * Math.PI / 180); ctx.scale(E.back(li) * out, 1);
      ctx.fillStyle = ink(.45, .08, .75); ctx.fillRect(8, -lh / 2 + 10, w, lh - 6); ctx.fillStyle = ink(0, 0, .92); ctx.fillRect(0, -lh / 2 + 4, w, lh - 6);
      ctx.fillStyle = ink(.3, 1, .9); ctx.fillText(l, 18, 2); ctx.restore();
    });
    ctx.restore();
  }
}
function stampS(ctx, txt, x, y, r, col, size) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * .6, h = size * 1.3; ctx.fillStyle = PAPER; rr(ctx, -w / 2, -h / 2, w, h, size * .15); ctx.fill();
  stroke(ctx, size * .1, col); ctx.fillStyle = col; ctx.fillText(txt, 0, size * .05); ctx.restore();
}
const cup = (ctx, x, y) => { rr(ctx, x - 18, y - 26, 36, 44, 6); fill(ctx, PAPER); stroke(ctx, 4); ctx.beginPath(); ctx.arc(x + 20, y - 4, 10, -1.2, 1.2); stroke(ctx, 4); };
function walk(t, path) {                   // path: [[t, x, y], ...] → позиция и шаг
  for (let i = 1; i < path.length; i++) if (t <= path[i][0]) { const [t0, x0, y0] = path[i - 1], [t1, x1, y1] = path[i], u = clamp((t - t0) / (t1 - t0)); return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), mv: (x0 !== x1 || y0 !== y1) && u > 0 && u < 1 }; }
  const l = path[path.length - 1]; return { x: l[1], y: l[2], mv: false };
}
function people(ctx, t) {
  const ak = ageK(t);
  // этаж 3: молодая Мия (в начале и в конце петли)
  if (t < 26.3 || t > 48.2) { const M = miaPose(t); M.open = Math.max(M.open || 0, 0); drawPerson(ctx, M); if (M.broom) broom(ctx, M.broom[0], M.broom[1], M.broom[1] - 380); }
  // этаж 2: молодой Лео
  if (t < 26.6) { const P0 = leoPose(t); rr(ctx, P0.x - 60, F2 - 150, 120, 30, 6); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 5); ctx.beginPath(); ctx.moveTo(P0.x - 45, F2 - 120); ctx.lineTo(P0.x - 55, F2); ctx.moveTo(P0.x + 45, F2 - 120); ctx.lineTo(P0.x + 55, F2); stroke(ctx, 10);
    const P = P0; P.open = Math.max(P.open || 0, talk(t, VOT.l1, VOT.l1 + 2.8) * 0, 0); const G = drawPerson(ctx, P); if (P.guitar) guitar(ctx, P, G); }
  // лестница: встреча
  if (t >= 26.6 && t < 32.5) {
    const lp = walk(t, [[26.6, 400, F2], [27.2, 300, F2], [28.4, 205, 1330]]), mp = walk(t, [[26.8, 400, F3], [27.4, 300, F3], [28.5, 25, 1330]]);
    const meet = t > 28.5, give = sstep(31.4, 31.7, t);
    const M = { x: mp.x, y: mp.y, R: 60, kind: 'woman', age: 24, outfit: 'sweater', pants: ink(.1, .55, 0), hair: 'bob', hairCol: hairMia(0), browCol: hairMia(0), t, seed: 2, legSwing: mp.mv ? Math.sin(t * 10) * .3 : 0, bob: mp.mv ? -Math.abs(Math.sin(t * 10)) * 8 : 0,
      look: meet ? [1, 0] : [-.6, .6], face: meet ? .5 : 0, smile: meet ? 1 : .5, open: talk(t, 28.8, 30.2) + (t > 31.7 ? .3 : 0), hA: [mp.x - 30, mp.y - 300], hB: give ? [mp.x + 60, mp.y - 330] : [mp.x + 40, mp.y - 250], brow: .5 };
    const L = { x: lp.x, y: lp.y, R: 62, kind: 'man', age: 25, outfit: 'tee', pants: ink(.45, .8, .3), hair: 'curly', hairCol: hairLeo(0), browCol: hairLeo(0), t, seed: 1, legSwing: lp.mv ? Math.sin(t * 10) * .3 : 0, bob: lp.mv ? -Math.abs(Math.sin(t * 10)) * 8 : 0,
      look: meet ? [-1, 0] : [-.5, -.6], face: meet ? -.5 : 0, smile: 1, open: talk(t, 30.3, 31.7) + (t > 31.7 ? .3 : 0), hA: [lp.x - 60 - give * 20, lp.y - 330], hB: [lp.x + 50, lp.y - 330], armsFront: true };
    drawPerson(ctx, M); broom(ctx, mp.x - 40, mp.y - 20, mp.y - 400); drawPerson(ctx, L);
    cup(ctx, L.hB[0], L.hB[1] - 20); cup(ctx, give ? lerp(L.hA[0], M.hB[0], give) : L.hA[0], (give ? lerp(L.hA[1], M.hB[1], give) : L.hA[1]) - 20);
  }
  // таймлапс: годы в квартире Лео
  if (t >= TL[0] && t < TL[1]) tlScene(ctx, t, ak);
  if (t >= TL[1]) oldScene(ctx, t);
}
function sofa(ctx) { rr(ctx, 430, F2 - 240, 440, 120, 30); fill(ctx, ink(.85, .1, .3)); stroke(ctx, 6); rr(ctx, 420, F2 - 140, 460, 110, 24); fill(ctx, ink(.9, .15, .35)); stroke(ctx, 6); }
function tlScene(ctx, t, ak) {
  const si = Math.min(5, Math.floor(ak * 6)), lt = t, gl = ak < .4 ? 'glassesNo' : 'g';
  const hl = hairLeo(ak), hm = hairMia(ak), age = 25 + ak * 50;
  broom(ctx, 370, F2 - 30, F2 - 410);                                       // швабра Мии в углу — навсегда
  if (si >= 1) { rr(ctx, 440, 1000, 150, 120, 6); fill(ctx, PAPER); stroke(ctx, 6); ctx.font = '900 22px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(1, 0, .4); ctx.fillText('♥ L + M ♥', 515, 1070); }
  if (si >= 1) sofa(ctx);
  const base = { R: 62, t, age, hairCol: hl, browCol: hl, kind: 'man', hair: 'curly', outfit: si >= 4 ? 'cardigan' : 'tee', pants: ink(.45, .8, .3), seed: 1, glasses: ak > .6 };
  const mb = { R: 58, t, age, hairCol: hm, browCol: hm, kind: 'woman', hair: 'bob', outfit: 'sweater', pants: ink(.1, .55, 0), seed: 2, glasses: ak > .7 };
  if (si === 0) {                                       // переезд: коробки, цветок на окно
    for (const [x, y] of [[470, F2 - 90], [560, F2 - 90], [510, F2 - 180]]) { rr(ctx, x - 45, y - 45, 90, 90, 6); fill(ctx, ink(.35, .1, .6)); stroke(ctx, 5); }
    drawPerson(ctx, { ...mb, x: 820, y: F2, smile: 1, look: [1, -.5], hB: [900, 1160], hA: [780, 1400] });
    drawPerson(ctx, { ...base, x: 660, y: F2, smile: 1, look: [.8, 0], hA: [620, 1450], hB: [700, 1450] }); rr(ctx, 600, 1380, 120, 90, 6); fill(ctx, ink(.35, .1, .6)); stroke(ctx, 5);
  } else if (si === 1) {                                // танцуют
    const sw = Math.sin(lt * 4) * 25;
    drawPerson(ctx, { ...base, x: 600 + sw, y: F2, smile: 1, eye: .3, happyEyes: true, face: .5, hA: [540, 1330], hB: [680 + sw, 1320] });
    drawPerson(ctx, { ...mb, x: 740 + sw, y: F2, smile: 1, eye: .3, happyEyes: true, face: -.5, tilt: -.12, hA: [680 + sw, 1320], hB: [810, 1240] });
  } else if (si === 2) {                                // младенец
    rr(ctx, 760, F2 - 200, 150, 120, 10); fill(ctx, PAPER); stroke(ctx, 6);
    drawPerson(ctx, { ...base, x: 560, y: F2, sit: 1, smile: .8, look: [.8, .3], hA: [520, 1640], hB: [610, 1660 + Math.sin(lt * 9) * 14] }); guitar(ctx, { x: 560 }, { hipY: F2 - 155, shY: 1450 });
    const P = { ...mb, x: 830, y: F2, smile: 1, look: [0, .8], tilt: Math.sin(lt * 3) * .06, hA: [790, 1480], hB: [870, 1480], armsFront: true }; drawPerson(ctx, P);
    ctx.save(); ctx.translate(830, 1470); ctx.rotate(Math.sin(lt * 3) * .2); ctx.beginPath(); ctx.ellipse(0, 0, 66, 36, 0, 0, 7); fill(ctx, ink(.75, .05, .15)); stroke(ctx, 5); ctx.beginPath(); ctx.arc(-38, -4, 24, 0, 7); fill(ctx, SKIN); stroke(ctx, 4); ctx.restore();
  } else if (si === 3) {                                // дочка рисует
    drawPerson(ctx, { ...base, x: 560, y: F2, sit: 1, smile: 1, look: [.6, .6] }); drawPerson(ctx, { ...mb, x: 740, y: F2, sit: 1, smile: 1, look: [-.3, .6] });
    drawPerson(ctx, { x: 650, y: F2 + 30, R: 40, kind: 'girl', age: 6, sit: 1, outfit: 'stripes', hair: 'pig', hairCol: hairMia(0), t, seed: 8, smile: 1, open: .4, look: [0, .9], hA: [620, F2 - 40], hB: [680 + Math.sin(lt * 12) * 20, F2 - 40] });
    rr(ctx, 590, F2 - 50, 140, 30, 4); fill(ctx, PAPER); stroke(ctx, 4);
  } else if (si === 4) {                                // дочь уезжает
    drawPerson(ctx, { ...base, x: 520, y: F2, smile: .7, look: [1, 0], hB: [600, 1250 + Math.sin(lt * 9) * 25] });
    drawPerson(ctx, { x: 790, y: F2, R: 56, kind: 'woman', age: 18, outfit: 'tee', hair: 'bob', hairCol: hairMia(0), t, seed: 9, smile: 1, look: [-1, 0], face: -.4, hA: [720, 1420], hB: [860, 1560] });
    drawPerson(ctx, { ...mb, x: 680, y: F2, smile: .8, eye: .4, happyEyes: true, look: [1, 0], face: .4, hB: [760, 1380], hA: [630, 1420] });
    rr(ctx, 840, F2 - 170, 110, 150, 10); fill(ctx, ink(0, .7, .1)); stroke(ctx, 5);
  } else {                                              // вдвоём
    drawPerson(ctx, { ...base, x: 580, y: F2, sit: 1, smile: .8, look: [.6, .3] }); drawPerson(ctx, { ...mb, x: 740, y: F2, sit: 1, smile: .8, look: [-.6, .3] });
  }
}
function oldScene(ctx, t) {
  sofa(ctx); broom(ctx, 370, F2 - 30, F2 - 410);
  rr(ctx, 440, 1000, 150, 120, 6); fill(ctx, PAPER); stroke(ctx, 6); ctx.font = '900 22px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(1, 0, .4); ctx.fillText('♥ L + M ♥', 515, 1070);
  const up = t > 43.0 && t < 44.0, gup = sstep(47.6, 47.85, t) * (1 - sstep(48.3, 48.6, t)), lean = 1 - sstep(42.95, 43.2, t) * (1 - sstep(44.5, 45, t));
  const L = { x: 580, y: F2, R: 64, kind: 'old', age: 75, sit: 1, outfit: 'cardigan', pants: ink(.3, .6, .4), hair: 'curly', hairCol: hairLeo(1), browCol: ink(.2, .35, .2), glasses: true, t, seed: 1,
    look: up || gup ? [0, -1] : [.7, .2], face: up || gup ? 0 : .3, smile: .8, open: talk(t, 43.6, 46.3), gup,
    hA: [lerp(545, 560, gup), lerp(1630, 1250, gup)], hB: [lerp(620, 600, gup), lerp(1650 + (t < 43 ? Math.sin(t * 6) * 12 : 0), 1330, gup)] };
  const M = { x: 740, y: F2, R: 60, kind: 'woman', age: 74, sit: 1, outfit: 'sweater', pants: ink(.1, .55, 0), hair: 'bob', hairCol: hairMia(1), browCol: ink(.2, .3, .2), glasses: true, t, seed: 2,
    look: up ? [0, -1] : [-.8, .1], face: up ? 0 : -.4, smile: 1, brow: up ? .9 : .2, open: talk(t, 46.4, 47.9), headDX: -.4 * lean, tilt: -.22 * lean, eye: up ? 1 : .55, happyEyes: true, hA: [660, 1610], hB: [800, 1640] };
  drawPerson(ctx, M); const G = drawPerson(ctx, L); guitar(ctx, L, G);
}
function world(ctx, t) {
  shell(ctx, t); stairs(ctx); room3(ctx, t); room2(ctx, t, ageK(t) > 0 ? 1 : 0);
  // записка на верёвке
  if (t > 16 && t < 17.9) note(ctx, 1065, lerp(380, 1250, sstep(16.2, 17.8, t)), 'PLAY THE ONE\nABOUT THE MOON');
  if (t > 22.3 && t < 23.6) note(ctx, 1065, lerp(1250, 380, sstep(22.3, 23.5, t)), 'COFFEE?');
  people(ctx, t);
  if (t > 17.9 && t < 21.5) { const s = t < 20 ? 1.8 : 1.1; ctx.save(); ctx.translate(t < 20 ? 830 : 900, t < 20 ? 1150 : 1250); rr(ctx, -70 * s, -40 * s, 140 * s, 90 * s, 4); fill(ctx, PAPER); stroke(ctx, 4); ctx.font = `900 ${18 * s}px Inter`; ctx.textAlign = 'center'; ctx.fillStyle = ink(1, .05, .6); ctx.fillText('PLAY THE ONE', 0, -4 * s); ctx.fillText('ABOUT THE MOON', 0, 18 * s); ctx.restore(); }
  if (t > 21.5 && t < 22.3) { ctx.save(); ctx.translate(900, 1300); rr(ctx, -84, -48, 168, 108, 4); fill(ctx, PAPER); stroke(ctx, 4); ctx.font = '900 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(.1, 1, .1); ctx.fillText('COFFEE?'.slice(0, Math.floor(sstep(21.55, 22.2, t) * 7)), 0, 12); ctx.restore(); }
  if (t > 23.5 && t < 24.4) { ctx.save(); ctx.translate(960, 500); rr(ctx, -84, -48, 168, 108, 4); fill(ctx, PAPER); stroke(ctx, 4); ctx.font = '900 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(.1, 1, .1); ctx.fillText('COFFEE?', 0, 12); ctx.restore(); }
  // стук: штампы и пыль
  knockFx(ctx, t, KNOCKS_UP.filter(k => k < 26), 650, F3 - 60, ink(1, .05, .6)); dust(ctx, t, KNOCKS_UP.filter(k => k < 26), 650, 900);
  knockFx(ctx, t, KNOCKS_LEO, 650, 1000, ink(.1, 1, .1));
  knockFx(ctx, t, KNOCKS_ROOF, 650, 1000, ink(1, .05, .6)); dust(ctx, t, KNOCKS_ROOF, 650, 900);
  if (t > 20 && t < 21.6 || t > 11 && t < 16 && sky(t) < .3) { const mx = 1140, my = 260; ctx.beginPath(); ctx.arc(mx, my, 60, 0, 7); fill(ctx, ink(0, 0, 1)); }
}
let dens, dctx, ready = false;
async function setup() {
  dens = document.createElement('canvas'); dens.width = CW * RES; dens.height = CH * RES; dctx = dens.getContext('2d');
  if (RES !== 1) { const st = dctx.setTransform.bind(dctx), gt = dctx.getTransform.bind(dctx), R = RES;
    dctx.setTransform = (a, b, c, d, e, f) => st(a * R, b * R, c * R, d * R, e * R, f * R);
    dctx.getTransform = () => { const m = gt(); return new DOMMatrix([m.a / R, m.b / R, m.c / R, m.d / R, m.e / R, m.f / R]); };
    const cv = document.getElementById('c'); cv.width = CW * R; cv.height = CH * R; }
  Riso.init(document.getElementById('c'));
  await Promise.all(['900 40px Inter', '700 20px Inter'].map(f => document.fonts.load(f)));
  ready = true;
}
window.renderFrame = async t => {
  if (!ready) await setup();
  CUR_T = t;
  const cam = camera(t), a = CW / cam.vw, ctx = dctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CW, CH);
  ctx.setTransform(a, 0, 0, a, -(cam.cx - cam.vw / 2) * a, -(cam.cy - cam.vw * 8 / 9) * a);
  world(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t > TL[0] && t < TL[1]) { const y = Math.round(50 * Math.pow(tlStage(t), 1.4)); stampS(ctx, y < 1 ? 'THAT YEAR' : `+${y} YEARS`, 360, 230, -.05, ink(1, .05, .95), 54); }
  caption(ctx, t);
  let mis = 1; const k = Math.floor(ageK(t) * 6); if (t > TL[0] && t < TL[1] && ((ageK(t) * 6) % 1) < .06) mis = 5;      // «перепечатка» на смене лет
  Riso.print(dens, t, mis);
};
