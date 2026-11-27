// DECEMBER v2 — дрон над городком. Дата — только из dateAt().
import { THREE, scene, camera, renderer, clamp, lerp, ss, eio, eo, back, hash, noise1, key, updateBulbs, updateSnow, present, FRAME, BL, mat, glow, mesh, G, at } from './core.js';
import { C, pose, person, gift, updSteam } from './build.js';
import { T } from './town.js';
const DUR = window.DURATION = 44.5;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- свет и небо
const hemi = new THREE.HemisphereLight('#8fa6d8', '#3a2a30', .7); scene.add(hemi);
const moon = new THREE.DirectionalLight('#9fb4ff', .9); moon.position.set(-20, 30, 15); moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 }); moon.shadow.bias = -.0008; scene.add(moon); scene.add(moon.target);
const warm = new THREE.PointLight('#ffb070', 0, 14, 1.5); scene.add(warm);
scene.fog = new THREE.FogExp2('#2a3460', .018);
const skyC = document.createElement('canvas'); skyC.width = 4; skyC.height = 256; const skyX = skyC.getContext('2d'); const skyT = new THREE.CanvasTexture(skyC); skyT.colorSpace = THREE.SRGBColorSpace; scene.background = skyT;
function sky(cols) { const g = skyX.createLinearGradient(0, 0, 0, 256); cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c)); skyX.fillStyle = g; skyX.fillRect(0, 0, 4, 256); skyT.needsUpdate = true; }
const mixC = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
const NIGHT = ['#0e1430', '#1c2654', '#3a3f74', '#7a5a86'], DUSK = ['#1c2654', '#40447e', '#a0668a', '#f0a07a'], MORN = ['#7aa6d8', '#b8cce6', '#f4d6c0', '#ffe2b0'];
function skyMix(A, B, k) { sky(A.map((c, i) => mixC(c, B[i], k))); scene.fog.color.set(mixC(A[2], B[2], k)).multiplyScalar(.7); }

// ---------- дата
function dateAt(t) {
  if (t < 14) return { d: 1 + Math.min(22, Math.floor(t / 14 * 23)), sub: null };
  if (t < 31.5) return { d: 24, sub: 'Christmas Eve' };
  if (t < 34.5) return { d: 24, sub: 'Christmas Eve · night' };
  return { d: 25, sub: 'Christmas Day' };
}
const dayF = t => t < 14 ? 1 + t / 14 * 23 : t < 34.5 ? 24 : 25; // дробный день для декора
function pill(v, t, a = 1) {
  if (a <= 0) return; const D = dateAt(t); const txt = `DEC ${D.d}`, sub = D.sub || `${25 - D.d} days to Christmas`;
  v.save(); v.globalAlpha = a; const f1 = z => `900 ${z}px IB`, f2 = z => `600 ${z}px IS`;
  const b1 = boxFor(v, txt, { font: f1, size: 36, maxW: 420, pad: .12 }), b2 = boxFor(v, sub, { font: f2, size: 22, maxW: 420, pad: .12 });
  const w = Math.max(b1.w, b2.w) + 10, h = b1.h + b2.h - 6, x = (720 - w) / 2, y = 150;
  v.fillStyle = 'rgba(246,238,222,.94)'; v.beginPath(); v.roundRect(x, y, w, h, 16); v.fill(); v.fillStyle = C.red; v.fillRect(x + 12, y, w - 24, 6);
  drawBoxText(v, txt, x, y + 4, w, b1.h, { font: f1, size: 36, min: 18, color: '#131a30', pad: .12, lines: 1 });
  drawBoxText(v, sub, x, y + b1.h - 6, w, b2.h, { font: f2, size: 22, min: 12, color: C.burg, pad: .12, lines: 1 });
  v.restore();
}
function cap(v, text, y, o = {}) { const a = o.a ?? 1; if (a <= 0) return; const size = o.size || 50, font = z => `900 ${z}px IB`, maxW = o.maxW || 660;
  const bx = boxFor(v, text, { font, size, maxW, pad: .08, lineH: 1.08 }); const w = Math.min(maxW, bx.w + 10), h = bx.h + 6, x = (720 - w) / 2;
  v.save(); v.globalAlpha = a; v.translate(360, y + h / 2); const sc = o.pop ?? 1; v.scale(sc, sc); v.translate(-360, -(y + h / 2));
  v.fillStyle = 'rgba(19,26,48,.8)'; v.beginPath(); v.roundRect(x, y, w, h, 18); v.fill();
  drawBoxText(v, text, x, y, w, h, { font, size, min: 22, color: '#f6eede', pad: .08, lines: 3, lineH: 1.08 }); v.restore(); }

// ---------- путь дрона: [время, позиция, цель]
const PATH = [ // [время, позиция, цель, режим сегмента ДО этой точки: 'm' плавно, 'c' — висим, потом быстрый перелёт за 0.6 с]
  [0, V(-27, 7, .4), V(-6, .5, 0)], [5, V(-14, 10, .4), V(8, 0, 0), 'm'], [9.5, V(9, 13, 9), V(25, 2, 0), 'm'], [12.5, V(36, 9, 14), V(25, 3, 0), 'm'],
  [14, V(-12.6, 5.6, 1.4), V(-12.6, .2, -2.4), 'c'], [17.2, V(-12.2, 5.2, 1.3), V(-12.4, .2, -2.4), 'm'],
  [17.7, V(-9.6, 4.2, 1.3), V(-9.2, .6, -2.6), 'c'], [20.8, V(-8.8, 3.8, 1.2), V(-9, .8, -2.6), 'm'],
  [21.4, V(-5.5, 1.5, 1.0), V(-5.2, 1.0, -4.2), 'c'], [24.3, V(-4.9, 1.45, .8), V(-5.2, 1.0, -4.2), 'm'],
  [24.8, V(-1.3, 1.5, 1.0), V(-1, 1.0, -4.2), 'c'], [27.8, V(-.7, 1.45, .8), V(-1, 1.0, -4.2), 'm'],
  [28.3, V(2.9, 1.5, 1.0), V(3.2, 1.0, -4.2), 'c'], [31.3, V(3.5, 1.45, .8), V(3.2, 1.0, -4.2), 'm'],
  [32.0, V(13.5, 2.3, .5), V(-20, 3.4, 0), 'c'], [34.3, V(11.5, 2.5, .5), V(-20, 3.8, 0), 'm'],
  [35.0, V(-1.3, 1.5, 1.0), V(-1, 1.0, -4.2), 'c'], [38.8, V(-.9, 1.4, .7), V(-1, 1.0, -4.2), 'm'],
  [40.3, V(2, 9, 6), V(12, 0, 6), 'm'], [43.2, V(25, 30, 14.01), V(25, 0, 14), 'm'], [44.6, V(25, 29, 14.01), V(25, 0, 14), 'm'],
];
function drone(t) {
  let i = 0; while (i < PATH.length - 2 && t >= PATH[i + 1][0]) i++;
  const [a, pa, ta] = PATH[i], [b, pb, tb, mode] = PATH[i + 1];
  let k = mode == 'c' ? eio(clamp((t - (b - .6)) / .6)) : eio(clamp((t - a) / (b - a))) * .7 + clamp((t - a) / (b - a)) * .3;
  const p = pa.clone().lerp(pb, k), tg = ta.clone().lerp(tb, k);
  p.x += noise1(t * .4) * .05; p.y += noise1(t * .5 + 9) * .04;
  return { p, tg };
}

// ---------- семейные сцены (анимации поверх общего мира)
const H = T.fam; const KP = H.kitchen.userData.P, LP = H.living.userData.P, DP = H.dining.userData.P;
// улица: семья 1 чистит снег (дом x=-13), семья 2 украшает фасад (дом x=-9)
const S1 = T.houses.find(h => h.side < 0 && h.x == -13), S2 = T.houses.find(h => h.side < 0 && h.x == -9);
const dad = person({ coat: C.red, hatC: C.cream, hatT: C.navy }), teen = person({ coat: C.teal, hat: 'hair', hatC: C.brown }), tot = person({ kid: true, coat: C.mustard, hatC: C.red, hatT: C.cream });
const shovel = () => { const g = new THREE.Group(); g.add(at(mesh(G.cyl(.015, .015, .7, 6), mat(C.wood)), 0, -.35, 0)); g.add(at(mesh(G.box(.22, .02, .18), mat('#c03a3a', { m: .3, r: .4 })), 0, -.7, .05)); return g; };
const sh1 = shovel(), sh2 = shovel(); dad.userData.arms[1].add(sh1); sh1.position.y = -.25; teen.userData.arms[1].add(sh2); sh2.position.y = -.25;
[dad, teen, tot].forEach(p => scene.add(p));
const drive = mesh(G.box(1.2, .14, 2.6), mat(C.snow, { r: .95 })); drive.position.set(-12.8, .07, -1.9); scene.add(drive);
const pile = mesh(G.sph(1, 14), mat(C.snow, { r: .95 })); pile.position.set(-14.2, 0, -1.4); scene.add(pile);
const kidSnowman = T.snowman(.7); kidSnowman.position.set(-11.6, 0, -1.9); scene.add(kidSnowman);
const mom2 = person({ coat: C.hunter, hat: 'hair', hatC: '#3a2418', long: true }), kid2 = person({ kid: true, coat: C.red, hatC: C.cream, hatT: C.green }), kid3 = person({ kid: true, coat: C.plum, hat: 'hair', hatC: '#e0b070', long: true });
[mom2, kid2, kid3].forEach(p => scene.add(p));
const ladder = new THREE.Group(); for (const sd of [-1, 1]) ladder.add(at(mesh(G.box(.04, 1.8, .04), mat('#b0b0b8', { m: .6 })), sd * .18, .9, 0)); for (let i = 0; i < 6; i++) ladder.add(at(mesh(G.box(.36, .03, .03), mat('#b0b0b8', { m: .6 })), 0, .2 + i * .3, 0)); ladder.rotation.x = -.25; ladder.position.set(-10.1, 0, -1.9); scene.add(ladder);

function families(t) {
  const u1 = t - 14, eve = t >= 14 && t < 34.5;
  // семья 1: чистят дорожку
  [dad, teen, tot, drive, pile, kidSnowman].forEach(o => o.visible = t >= 14);
  if (t >= 14) {
    const clr = ss(0, 3.2, u1);
    drive.scale.z = 1 - clr * .95; drive.position.z = -1.9 - clr * 1.25; pile.scale.set(.35 + clr * .3, .25 + clr * .35, .4 + clr * .3);
    const sc = Math.sin(u1 * 5); at(dad, -12.6, 0, lerp(-.6, -2.9, clr), .35); pose(dad, { aR: .9 + sc * .4, aL: .9 + sc * .4, fR: 1.0, fL: 1.0, nod: .3, walk: u1 * 3 });
    at(teen, -13.3, 0, lerp(-.3, -2.6, clr), -.35); pose(teen, { aR: .9 - sc * .4, aL: .8, fR: 1.0, nod: .25, mouth: sc > .7 ? .5 : 0 });
    const sb = ss(.3, 2.8, u1); kidSnowman.scale.setScalar(.25 + sb * .5); at(tot, -11.1, 0, -1.5, -1.0); pose(tot, { aL: 1.2 + Math.sin(u1 * 7) * .3, aR: 1.2, fL: 1, fR: 1, mouth: .4, look: .3 });
    // семья 2: венок, гирлянда, олень
    at(mom2, -8.6, 0, -1.9, 0); pose(mom2, { aR: t < 18.6 ? 2.6 : lerp(2.6, .3, ss(18.6, 19, t)), aL: .3, look: .2, mouth: t > 19.6 ? .5 : 0 });
    at(kid2, -10.0, .3 + Math.max(0, Math.sin(clamp((t - 17.5) / 1.6) * Math.PI)) * .2, -1.55, 0); pose(kid2, { aL: 2.5, aR: 2.5, mouth: t > 19.6 ? .7 : 0 });
    at(kid3, -7.6, 0, -.9, -.6); pose(kid3, { aL: t > 19.6 ? 2.7 : .4, aR: t > 19.6 ? 2.5 : 1.3, fR: .6, mouth: t > 19.6 ? .8 : 0, walk: t > 19.6 && t < 21 ? t * 12 : undefined });
    S2.g.userData.wreath.scale.setScalar(t < 18.4 ? .01 : back(ss(18.4, 18.8, t)));
  }
  // кухня (21–24.5): духовка, индейка, пар, ребёнок таскает печенье
  const uk = t - 21;
  KP.pots.forEach((s, i) => updSteam(s, t + i * .4, 1.2));
  KP.ovenDoor.material.color.set('#ff8a3a').multiplyScalar(1 + .3 * Math.sin(t * 6));
  const tk = ss(1.0, 1.8, uk); KP.turkey.position.set(lerp(-.2, -.9, tk), lerp(1.05, .55, tk), lerp(.2, -.6, tk)); KP.turkey.visible = tk < .98;
  pose(KP.grandma, { aR: 1.2 + Math.sin(t * 4) * .3, aL: 1.1, fR: 1, fL: 1, nod: .3, mouth: Math.sin(t * 3) > .5 ? .4 : 0 });
  pose(KP.mom, { aL: lerp(1.3, .6, tk), aR: lerp(1.3, .6, tk), fL: 1.2, fR: 1.2, look: -.3, mouth: uk > 2 ? .5 : 0 }); KP.mom.position.x = lerp(-.4, -.95, tk);
  const steal = ss(2.0, 2.6, uk); pose(KP.kid, { aR: 1.4 + steal * .6, fR: 1.2, look: steal > .5 ? .8 : 0, mouth: steal > .9 ? .3 : 0 }); KP.cookies[5].visible = steal < .8;
  // гостиная (24.5–28) + утро (34.5–38.6)
  const ul = t - 24.5;
  LP.tree.userData.orn.forEach((b, i) => { const k = ss(i * .07, i * .07 + .25, ul); b.scale.setScalar(t > 34 ? 1 : back(k) + .001); });
  if (LP.tree.userData.star) LP.tree.userData.star.scale.setScalar(1.9 * .07 * (t > 34 ? 1 : back(ss(2.4, 2.9, ul)) + .001));
  LP.socks.forEach((s, i) => { s.scale.setScalar(t > 34 ? 1 : back(ss(.6 + i * .3, .9 + i * .3, ul)) + .001); s.rotation.z = Math.sin(t * 2 + i) * .05; });
  LP.fire.scale.set(1 + .15 * Math.sin(t * 13), 1 + .25 * noise1(t * 7), 1); LP.fire.material.color.set('#ff8a3a').multiplyScalar(2.2 + noise1(t * 9) * .5);
  const morning = t >= 34.5;
  pose(LP.dad, { aR: morning ? 1.6 : 2.4 + Math.sin(t * 3) * .2, aL: .4, fR: .8, look: -.4, mouth: morning ? .6 : 0 });
  pose(LP.kid1, { aL: morning ? 2.8 : 1.6, aR: morning ? 2.6 : 2.3, fR: .6, mouth: morning ? .9 : .3, walk: morning && t < 36 ? t * 12 : undefined }); LP.kid1.position.x = morning ? lerp(-1.2, .3, ss(34.6, 35.8, t)) : -1.2;
  pose(LP.kid2, { aL: morning ? 2.7 : 1.2, aR: morning ? 2.7 : 1.4, fL: .8, mouth: morning ? .9 : .4, walk: morning && t < 36 ? t * 12 + 1 : undefined }); LP.kid2.position.x = morning ? lerp(-.6, .9, ss(34.7, 36, t)) : -.6;
  LP.cat.position.y = .12 + Math.max(0, Math.sin(clamp((t - 26.2) / .7) * Math.PI)) * .3;
  // подарки открываются утром + бумага летит
  LP.gifts.forEach((g, i) => { const o = ss(35.9 + i * .4, 36.3 + i * .4, t); g.userData.bow.position.y = .26 + o * .6; g.userData.bow.rotation.z = o * 2; g.userData.bow.visible = o < .95; });
  paper.visible = t > 35.9 && t < 39; if (paper.visible) paper.children.forEach((p, i) => { const k = t - 35.9 - (i % 3) * .4; if (k < 0) { p.visible = false; return; } p.visible = true;
    const a = hash(i) * 6.283, v = .6 + hash(i * 3) * .9; p.position.set(Math.cos(a) * v * k + LP.gifts[i % 3].position.x, .4 + v * 1.6 * k - 1.6 * k * k, Math.sin(a) * v * k * .5 + LP.gifts[i % 3].position.z); p.rotation.set(k * 6 + i, k * 4, 0); });
  // столовая (28–31.5): скатерть, тарелки, бокалы, свечи, жаркое, гости
  const ud = t - 28;
  DP.cloth.scale.x = Math.max(.01, t > 31.5 ? 1 : ss(0, .5, ud));
  DP.items.forEach((it, i) => { const k = t > 31.5 ? 1 : ss(.4 + i * .12, .65 + i * .12, ud); it.scale.setScalar(back(k) + .001); });
  DP.candles.forEach((c, i) => { c.userData.fl.visible = ud > 1.9 + i * .1 || t > 31.5; c.userData.fl.scale.set(1, 1.6 + .3 * Math.sin(t * 14 + i), 1); });
  pose(DP.host, { aR: 1.3 + Math.sin(t * 4) * .3, aL: .8, fR: 1, look: ud > 2.2 ? 1.2 : -.2, mouth: ud > 2.4 ? .6 : 0 });
  DP.guests.forEach((p, i) => { const k = ss(2.2 + i * .25, 3.2 + i * .25, ud), x = lerp(.4 + i * .5, 1.0 + i * .3, k); at(p, x + (1 - k) * 0, .12, lerp(2.6, .7, k) - i * .15, Math.PI * .85); p.scale.setScalar((i == 2 ? .75 : 1)); pose(p, { aL: 1.2, aR: .3, fL: 1, walk: k < 1 ? t * 10 + i : undefined, mouth: k > .9 ? .6 : 0 });
    const gg = DP.ggifts[i]; gg.position.set(p.position.x - .18, .55 * p.scale.x + .12, p.position.z + .12); gg.visible = t >= 28 && ud < 6; });
  // передние стены уезжают, когда дрон у дома
  [['kitchen', 21, 24.5], ['living', 24.5, 28], ['dining', 28, 31.5], ['living', 34.5, 40]].forEach(([k, a, b]) => {});
  for (const [k, Hh] of Object.entries(H)) { const ranges = { kitchen: [[21, 24.5]], living: [[24.5, 28], [34.5, 39.6]], dining: [[28, 31.5]] }[k];
    let o = 0; for (const [a, b] of ranges) o = Math.max(o, ss(a - .2, a + .5, t) * (1 - ss(b - .3, b + .2, t)));
    const f = Hh.userData.front; f.position.y = o * 2.6; f.children.forEach(m => { m.material.opacity = 1 - o * .9; }); f.visible = o < .99;
    Hh.userData.lamp.intensity = o * 5; }
}
const paper = new THREE.Group(); for (let i = 0; i < 36; i++) { const p = mesh(G.box(.08, .06, .005), mat([C.red, C.gold, C.green, C.cream][i % 4], { r: .5 }), false, false); paper.add(p); } H.living.add(paper);

// ---------- огни: какой набор горит
function bulbOn(t) {
  const d = dayF(t), night = t >= 31.5 && t < 34.5 ? 1 - ss(32.2, 34.2, t) * .4 : 1;
  return (set, i) => {
    if (set == 'glean') return ss(40.0 + (i % 40) * .01, 40.8 + (i % 40) * .01, t) * (.85 + .15 * Math.sin(t * 6 + i));
    if (set == 'bigtree') { const k = ss(5.5, 7.5, d); return clamp(k * 70 - i) * (.8 + .2 * Math.sin(t * 5 + i)); }
    if (set.startsWith('stall') || set.startsWith('sq')) return ss(7, 8, d) * (.85 + .15 * Math.sin(t * 4 + i));
    if (set.startsWith('street')) return ss(10, 11, d);
    const m = set.match(/^[hd](\d+)/); if (m) { const h = T.houses.find(h => h.id == +m[1]); let day = h ? h.day : 30;
      if (h === S2 && set.endsWith(':roof')) { const k = ss(19.0, 19.9, t); return clamp(k * 22 - i) * night; }
      if (h === S2 && set.startsWith('d')) return ss(19.9, 20.3, t) * night;
      if (set.endsWith(':tree')) { if (t >= 24.5 && t < 28) return clamp(ss(24.6, 25.8, t) * 62 - i); return t >= 28 ? 1 : 0; }
      if (t >= 14) day = Math.min(day, 23);
      const k = clamp((d - day) * 3); return clamp(k * 22 - i) * night * (.85 + .15 * Math.sin(t * 3 + i * 1.3)); }
    return 1;
  };
}
const ALLSETS = new Set(BL.map(b => b.set));

// ---------- декор дня: венки, дворы, ёлка, ярмарка, каток
function decor(t) {
  const d = dayF(t);
  T.houses.forEach(h => { if (h.kind) return; const on = d >= (h === S2 ? 99 : h.day) || (t >= 14 && h !== S2); if (h.g.userData.wreath && h !== S2) h.g.userData.wreath.visible = on; if (h.yard) h.yard.visible = d >= h.day - 1 || t >= 14; });
  if (S2 && S2.yard) S2.yard.visible = t >= 19.6 || t < 14 ? t >= 19.6 : false;
  const tr = ss(3, 5, d); T.bigTree.scale.setScalar(Math.max(.001, back(tr))); T.bigTree.visible = tr > 0;
  T.stalls.forEach((s, i) => { const k = ss(6 + i * .3, 7 + i * .3, d); s.scale.setScalar(Math.max(.001, back(k))); });
  const rk = ss(8, 9, d); T.rink.scale.setScalar(Math.max(.001, back(rk))); T.rink.visible = rk > 0;
  T.skaters.forEach((p, i) => { const a = t * .5 + i * 1.05; at(p, Math.cos(a) * 2.3, .06, Math.sin(a) * 2.3, -a); p.scale.setScalar(1); pose(p, { aL: 1.3, aR: 1.3, tilt: .1, walk: t * 4 + i }); });
  const cr = ss(9, 10, d); T.carousel.scale.setScalar(Math.max(.001, back(cr) * .8)); T.carousel.userData.rot.rotation.y = t * .6;
  T.carousel.userData.rot.children.forEach(o => { if (o.userData.ph !== undefined) o.position.y = .9 + Math.sin(t * 3 + o.userData.ph) * .12; });
  T.car.visible = false;
}

// ---------- кадр
window.renderFrame = function (t) {
  globalThis.__T = t;
  const { p, tg } = drone(t); const up = ss(41.0, 43.0, t); camera.up.set(0, 1 - up, -up).normalize(); camera.position.copy(p); camera.lookAt(tg); camera.fov = t >= 31.6 && t < 34.5 ? 50 : (t >= 21 && t < 31.6) || (t >= 34.5 && t < 38.8) ? 56 : t >= 13.4 && t < 21 ? 52 : 40; camera.updateProjectionMatrix();
  // небо и свет по фазам
  if (t < 14) { skyMix(DUSK, NIGHT, .4 + .25 * Math.sin(t * 1.6)); hemi.intensity = .75; moon.intensity = .7; FRAME.exposure = 1.05; scene.fog.density = .012; }
  else if (t < 31.5) { skyMix(DUSK, NIGHT, .35); hemi.intensity = .8; moon.intensity = .8; FRAME.exposure = 1.1; scene.fog.density = .02; }
  else if (t < 34.5) { const k = ss(31.5, 33, t); skyMix(DUSK, NIGHT, .35 + k * .65); hemi.intensity = .8 - k * .35; moon.intensity = .8; FRAME.exposure = 1.05; scene.fog.density = .02; }
  else if (t < 39.4) { const k = ss(34.5, 35.5, t); skyMix(NIGHT, MORN, k); hemi.intensity = .45 + k * .7; hemi.color.set(mixC('#8fa6d8', '#ffe2c0', k)); moon.color.set(mixC('#9fb4ff', '#ffd2a0', k)); moon.intensity = .8 + k * .6; FRAME.exposure = 1.0; scene.fog.density = .015; }
  else { const k = ss(39.4, 40.4, t); skyMix(MORN, NIGHT, k); hemi.color.set(mixC('#ffe2c0', '#8fa6d8', k)); moon.color.set(mixC('#ffd2a0', '#9fb4ff', k)); hemi.intensity = 1.15 - k * .5; moon.intensity = 1.4 - k * .7; FRAME.exposure = 1.05; scene.fog.density = .008; }
  moon.target.position.copy(tg); moon.position.copy(tg).add(V(-14, 24, 12));
  warm.position.copy(p).add(V(0, .3, -.6)); warm.intensity = t >= 14 && t < 21 ? 1.5 : (t >= 21 && t < 31.6) || (t >= 34.5 && t < 39) ? 2.2 : 0;
  decor(t); families(t);
  // сани на фоне луны (ночь 24-го)
  T.sleigh.visible = t > 31.8 && t < 34.5; const sk = ss(31.8, 34.4, t); T.sleigh.position.set(-70, 12 + Math.sin(sk * 3) * 1.5, lerp(-26, 22, sk));
  // окна гаснут ночью
  const nightOff = ss(32.6, 34.3, t);
  T.houses.forEach((h, i) => { if (h.g.userData.wins) h.g.userData.wins.forEach((w, j) => { const off = t >= 31.5 && t < 34.5 && hash(i * 3 + j) < nightOff; w.visible = !off; }); });
  updateBulbs(bulbOn(t), ALLSETS);
  updateSnow(t, [p.x + (tg.x - p.x) * .3, Math.max(2, p.y * .6), p.z + (tg.z - p.z) * .3, 30, Math.max(8, p.y * 1.4), 30], t > 34.5 && t < 39.4 ? .3 : .7, t < 14 ? .8 : 1);
  FRAME.bloom = .85;
  present((v, t) => {
    pill(v, t, t < 40.0 ? 1 : 1 - ss(40.0, 40.4, t));
    if (t < 3.2) cap(v, 'WATCH THIS TOWN\nBECOME CHRISTMAS', 300, { size: 50, pop: lerp(.92, 1, back(t / .3)) });
    if (t > 14.2 && t < 16.8) cap(v, 'Dec 24: shovel the driveway', 250, { size: 40, a: ss(14.2, 14.5, t) * (1 - ss(16.5, 16.8, t)) });
    if (t > 17.7 && t < 20.6) cap(v, 'put up the lights', 250, { size: 40, a: ss(17.7, 18, t) * (1 - ss(20.3, 20.6, t)) });
    if (t > 21.4 && t < 24.2) cap(v, 'cook for everyone', 250, { size: 40, a: ss(21.4, 21.7, t) * (1 - ss(23.9, 24.2, t)) });
    if (t > 24.9 && t < 27.7) cap(v, 'hang the stockings', 250, { size: 40, a: ss(24.9, 25.2, t) * (1 - ss(27.4, 27.7, t)) });
    if (t > 28.4 && t < 31.2) cap(v, 'set the table', 250, { size: 40, a: ss(28.4, 28.7, t) * (1 - ss(30.9, 31.2, t)) });
    if (t > 35.0 && t < 38.6) cap(v, 'MERRY CHRISTMAS', 300, { size: 58, pop: back(ss(35.0, 35.4, t)), a: ss(35.0, 35.2, t) * (1 - ss(38.3, 38.6, t)) });
    if (t > 41.0) cap(v, 'Which house is yours?', 900, { size: 46, a: ss(41.0, 41.4, t) });
  }, t);
};
window.ready = Promise.all([document.fonts.load('900 40px IB'), document.fonts.load('600 30px IS')]);
