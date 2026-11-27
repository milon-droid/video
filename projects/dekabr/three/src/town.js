// Городок: улица с домами, площадь (ёлка, ярмарка, каток, церковь), дома-«кукольные домики» с интерьерами.
import { THREE, scene, mat, glow, mesh, G, grp, at, stringLights, addBulb, BULB_COLS, hash, softTex } from './core.js';
import { C, house, bakeLights, tree, bakeTreeLights, person, car, stall, carousel, gift, steam } from './build.js';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const T = { houses: [], fam: {} };
const root = grp(); scene.add(root); T.root = root;

// земля, дорога, сугробы
const ground = mesh(G.plane(200, 200), mat(C.snow, { r: .95 })); ground.rotation.x = -Math.PI / 2; root.add(ground);
const road = mesh(G.plane(60, 2.6), mat('#d9dee8', { r: .9 })); road.rotation.x = -Math.PI / 2; road.position.y = .005; root.add(road);
for (const z of [-1.5, 1.5]) { const curb = mesh(G.box(60, .12, .3), mat('#eef2f8', { r: .95 })); curb.position.set(0, .06, z); root.add(curb); }
// лес вокруг
for (let i = 0; i < 160; i++) { const a = hash(i * 1.7) * 6.283, r = 30 + hash(i * 3.1) * 25; const tr = tree(2 + hash(i) * 2.5, { snow: true, col: '#3d6a52', dk: '#2a4c3a' }); at(tr, Math.cos(a) * r + 6, 0, Math.sin(a) * r); root.add(tr); }
// холмы
for (let i = 0; i < 9; i++) { const h = mesh(G.sph(1, 20), mat('#eef2f8', { r: 1 })); h.scale.set(14 + hash(i) * 10, 4 + hash(i * 2) * 4, 10); const a = i / 9 * 6.283; h.position.set(Math.cos(a) * 60 + 6, -1, Math.sin(a) * 60); root.add(h); }

// ---------- дома вдоль улицы
const XS = [-17, -13, -9, -5.2, -1, 3.2, 7.4, 11.4, 15.4];
const WALLS = [C.burg, C.cream, C.hunter, C.navy, C.mustard, C.brick, C.teal, C.plum, C.cream, C.burg];
const ROOFS = [C.navy, C.burg, '#3a3040', C.hunter, '#2c2c40'];
// семьи с интерьерами (передняя стена снимается): индексы на южной стороне
const INTERIOR = { 3: 'kitchen', 4: 'living', 5: 'dining' };
let hi = 0;
for (const side of [-1, 1]) XS.forEach((x, j) => {
  const id = hi++; const z = side * 3.4, ry = side < 0 ? 0 : Math.PI;
  const day = side < 0 && (j == 2 || j == 3) ? 24 : hash(id * 4.7 + 1) < .4 ? 0 : 1 + Math.floor(hash(id * 2.3 + 5) * 17);
  if (side < 0 && INTERIOR[j]) { const H = dollhouse(INTERIOR[j], WALLS[(id + 3) % 10], ROOFS[id % 5], 'h' + id); at(H, x, 0, z - .4, ry); root.add(H); T.houses.push({ id, g: H, day: 2 + Math.floor(hash(id) * 15), x, z, side, kind: INTERIOR[j] }); T.fam[INTERIOR[j]] = H; return; }
  const g = house({ w: 2.6, h: 1.9, d: 2.2, wall: WALLS[(id + 3) % 10], roof: ROOFS[id % 5], door: [C.red, C.hunter, C.navy][id % 3], set: 'h' + id });
  at(g, x, 0, z, ry); root.add(g); T.houses.push({ id, g, day, x, z, side });
  // во дворе: снеговик или светящийся олень
  const yz = z - side * -1.6;
  if (hash(id * 9.1) > .5) { const sm = snowman(.7 + hash(id) * .3); at(sm, x - .9, 0, side < 0 ? z + 1.7 : z - 1.7); root.add(sm); T.houses[T.houses.length - 1].yard = sm; }
  else { const rd = reindeer('d' + id); at(rd, x + .9, 0, side < 0 ? z + 1.6 : z - 1.6, side < 0 ? .4 : Math.PI - .4); root.add(rd); T.houses[T.houses.length - 1].yard = rd; }
});
// уличные фонари и гирлянды поперёк улицы
T.lamps = [];
for (let x = -18; x <= 18; x += 6) { const lp = grp(at(mesh(G.cyl(.05, .07, 2.4, 8), mat('#1e2236', { r: .4, m: .5 })), 0, 1.2, 0), at(mesh(G.sph(.16, 12), glow('#ffd9a0', 2.2)), 0, 2.45, 0));
  at(lp, x, 0, 2.05); root.add(lp); T.lamps.push(lp); const wr = mesh(G.tor(.16, .05, 14), mat(C.green)); wr.position.set(x, 1.8, 2.12); root.add(wr); }
for (const x of [-15, -7.1, 1.1, 9.3]) root.add(stringLights('street' + x, [V(x, 3.1, -2.1), V(x + .01, 3.1, 2.1)], 14, .35));

// ---------- площадь
const SQ = V(25, 0, 0); T.SQ = SQ;
T.bigTree = tree(6.5, { orn: 40, lights: 'bigtree', star: true, col: C.green, dk: C.hunter }); at(T.bigTree, SQ.x, 0, SQ.z); root.add(T.bigTree);
T.stalls = []; [[-4, -3.5, C.burg], [-1, -4.4, C.hunter], [2.2, -4.4, C.navy], [5, -3.5, C.red]].forEach(([dx, dz, col], i) => { const s = stall(col, 'stall' + i); at(s, SQ.x + dx, 0, SQ.z + dz, -dx * .12); root.add(s); T.stalls.push(s); });
T.rink = grp(mesh(G.cyl(3.2, 3.2, .06, 40), mat('#cfe3f0', { r: .08, m: .1 })), at(mesh(G.tor(3.2, .09, 40), mat(C.red)), 0, .1, 0)); T.rink.children[1].rotation.x = Math.PI / 2; at(T.rink, SQ.x + 1, 0, SQ.z + 5.5); root.add(T.rink);
T.skaters = []; for (let i = 0; i < 6; i++) { const p = person({ coat: [C.red, C.teal, C.mustard, C.plum, C.navy, C.green][i], hatC: C.cream, hatT: [C.red, C.green][i % 2] }); T.rink.add(p); T.skaters.push(p); }
T.carousel = carousel(); at(T.carousel, SQ.x + 8, 0, SQ.z + 1); T.carousel.scale.setScalar(.8); root.add(T.carousel);
// церковь со шпилем
T.church = grp(at(mesh(G.box(3, 3.2, 5), mat(C.cream)), 0, 1.6, 0), at(mesh(G.box(1.4, 5.4, 1.4), mat(C.cream)), 0, 2.7, 2.6), at(mesh(G.cone(1.1, 2.6, 4), mat(C.navy)), 0, 6.7, 2.6));
const cr = new THREE.Shape(); cr.moveTo(-1.6, 0); cr.lineTo(0, 1.4); cr.lineTo(1.6, 0); const crg = new THREE.ExtrudeGeometry(cr, { depth: 5, bevelEnabled: false }); crg.translate(0, 0, -2.5); T.church.add(at(mesh(crg, mat(C.navy)), 0, 3.2, 0));
T.church.children[2].rotation.y = Math.PI / 4; for (let i = 0; i < 3; i++) T.church.add(at(mesh(G.box(.5, 1.1, .05), glow('#ffcf7a', 1.4), false, false), -1 + i, 1.6, 2.52 + 0));
at(T.church, SQ.x - 1, 0, SQ.z - 10); root.add(T.church);
// гирлянды над площадью
for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; root.add(stringLights('sq' + i, [V(SQ.x, 6.2, SQ.z), V(SQ.x + Math.cos(a) * 7, 2.6, SQ.z + Math.sin(a) * 7)], 22, .5)); }
// финальная световая инсталляция «glean.» на поле за площадью (видна сверху)
T.gleanSet = 'glean'; (() => { const c = document.createElement('canvas'); c.width = 600; c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.font = '900 150px IB, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('glean.', 300, 100);
  const d = x.getImageData(0, 0, 600, 200).data; let n = 0; for (let y = 0; y < 200; y += 5) for (let xx = 0; xx < 600; xx += 5) if (d[(y * 600 + xx) * 4 + 3] > 128) addBulb(V(SQ.x + (xx - 300) * .022, .08, SQ.z + 14 + (y - 100) * .022), '#ffd27a', 'glean', n++, 1.0); T.gleanN = n; })();

bakeLights(root);
[T.bigTree].forEach(bakeTreeLights);
// стойки ларьков
T.stalls.forEach((s, i) => { s.updateMatrixWorld(true); const p = s.userData.lightsPts.map(v => v.clone().applyMatrix4(s.matrixWorld)); root.add(stringLights('stall' + i, p, 12, .12)); });

// ---------- снеговик и светящийся олень
function snowman(s = 1) { const g = grp(); [[.32, .3], [.24, .78], [.17, 1.13]].forEach(([r, y]) => g.add(at(mesh(G.sph(r, 18), mat(C.snow, { r: .9 })), 0, y, 0)));
  g.add(at(mesh(G.cone(.04, .2, 8), mat('#e87a2e')), 0, 1.13, .25)); g.children[3].rotation.x = Math.PI / 2;
  for (const sd of [-1, 1]) g.add(at(mesh(G.sph(.025, 6), mat('#111')), sd * .06, 1.18, .15));
  g.add(at(mesh(G.tor(.17, .05, 12), mat(C.red)), 0, .98, 0)); g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  g.add(at(mesh(G.cyl(.14, .14, .2, 14), mat('#1b1b22')), 0, 1.34, 0)); g.scale.setScalar(s); return g; }
T.snowman = snowman;
function reindeer(set) { const g = grp(); // контур из лампочек (позиции локальные → мировые при bake)
  const pts = []; const body = (a, rx, ry, cx, cy) => { for (let i = 0; i < 14; i++) { const t = i / 14 * 6.283; pts.push(V(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, 0)); } };
  body(0, .45, .2, 0, .75); body(0, .13, .11, .55, 1.15); for (const lx of [-.3, .3]) for (let i = 0; i < 5; i++) pts.push(V(lx, .55 - i * .11, 0)); for (let i = 0; i < 4; i++) pts.push(V(.45 + i * .03, .85 + i * .07, 0));
  for (let i = 0; i < 5; i++) { pts.push(V(.5 - i * .04, 1.25 + i * .08, 0)); pts.push(V(.6 + i * .04, 1.25 + i * .08, 0)); }
  g.userData.pts = pts; g.userData.set = set; const frame = mesh(G.box(.02, .02, .02), mat('#fff')); g.add(frame); return g; }
T.bakeReindeer = () => { T.houses.forEach(h => { const y = h.yard; if (!y || !y.userData.pts) return; y.updateMatrixWorld(true); y.userData.pts.forEach((p, i) => addBulb(p.clone().applyMatrix4(y.matrixWorld), i % 3 ? '#fff4d6' : '#ffd27a', y.userData.set, i, .8)); }); };
T.bakeReindeer();

// ---------- кукольный домик с интерьером: передняя стена — отдельная, уезжает вверх
function dollhouse(kind, wallC, roofC, set) {
  const w = 3.4, h = 2.2, d = 2.6, g = grp(); const wm = mat(wallC, { r: .8 });
  const inner = { kitchen: '#efe1c4', living: '#3c4a6a', dining: '#7a2a34' }[kind];
  const im = mat(inner, { r: .9 });
  g.add(at(mesh(G.box(w, .12, d), mat('#8a5a36', { r: .7 })), 0, .06, 0)); // пол
  g.add(at(mesh(G.box(w, h, .12), im), 0, h / 2, -d / 2)); // задняя стена (изнутри цвет обоев)
  g.add(at(mesh(G.box(.12, h, d), wm), -w / 2, h / 2, 0)); g.add(at(mesh(G.box(.12, h, d), wm), w / 2, h / 2, 0));
  g.add(at(mesh(G.box(w, .1, d), wm), 0, h, 0));
  // обои-полосы на задней стене
  for (let i = 0; i < 12; i++) g.add(at(mesh(G.box(.06, h - .2, .01), mat(kind == 'kitchen' ? '#d9c39a' : kind == 'living' ? '#34405e' : '#6a2430'), false, false), -w / 2 + .2 + i * .28, h / 2, -d / 2 + .07));
  // крыша
  const rh = w * .42, sh = new THREE.Shape(); sh.moveTo(-w / 2 - .15, 0); sh.lineTo(0, rh); sh.lineTo(w / 2 + .15, 0); sh.lineTo(-w / 2 - .15, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + .3, bevelEnabled: false }); rg.translate(0, 0, -(d + .3) / 2); g.add(at(mesh(rg, mat(roofC)), 0, h, 0));
  const sl = Math.hypot(w / 2 + .15, rh), ang = Math.atan2(rh, w / 2 + .15); for (const sd of [-1, 1]) { const s = mesh(G.box(sl, .1, d + .36), mat(C.snow, { r: .95 })); s.position.set(sd * (w / 4 + .04), h + rh / 2 + .06, 0); s.rotation.z = -sd * ang; g.add(s); }
  // окно в задней стене (снег снаружи) и лампа
  g.add(at(mesh(G.box(.9, .7, .02), glow('#2a3a66', 1), false, false), w * .28, h * .6, -d / 2 + .08));
  const lamp = new THREE.PointLight('#ffb870', 0, 6, 1.6); lamp.position.set(0, h * .8, .2); g.add(lamp);
  // передняя стена с окнами и дверью (прозрачная, чтобы плавно исчезать)
  const front = grp(); const fm = new THREE.MeshStandardMaterial({ color: wallC, roughness: .8, transparent: true, opacity: 1 });
  front.add(at(mesh(G.box(w + .02, h, .1), fm), 0, h / 2, 0));
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc066').multiplyScalar(1.6), toneMapped: false, transparent: true });
  for (const fx of [-.3, .3]) front.add(at(mesh(G.box(.7, .6, .02), winM, false, false), fx * w, h * .6, .06));
  front.add(at(mesh(G.box(.5, 1.0, .03), new THREE.MeshStandardMaterial({ color: C.red, transparent: true })), 0, .5, .06));
  front.position.z = d / 2; g.add(front);
  g.userData = { front, lamp, kind, w, h, d, set };
  // гирлянда по крыше
  g.updateMatrixWorld(true); g.userData.roofPts = [V(-w / 2 - .15, h, d / 2 + .2), V(0, h + rh, d / 2 + .2), V(w / 2 + .15, h, d / 2 + .2)];
  interior(g, kind);
  return g;
}
function interior(g, kind) {
  const { w, h, d } = g.userData; const P = g.userData.P = {};
  if (kind == 'kitchen') {
    g.add(at(mesh(G.box(w * .9, .8, .55), mat('#e8e2d6')), 0, .4, -d / 2 + .4)); // столешница
    const oven = grp(at(mesh(G.box(.7, .75, .55), mat('#cfc8bc')), 0, .375, 0)); const od = mesh(G.box(.5, .35, .02), glow('#ff8a3a', 1.2), false, false); od.position.set(0, .35, .28); oven.add(od); at(oven, -.9, 0, -d / 2 + .45); g.add(oven); P.ovenDoor = od;
    P.pots = []; for (let i = 0; i < 2; i++) { const pot = grp(mesh(G.cyl(.14, .12, .18, 16), mat('#b0b8c0', { m: .7, r: .3 }))); at(pot, .3 + i * .45, .89, -d / 2 + .4); g.add(pot); const st = steam(4); st.position.set(.3 + i * .45, 1.0, -d / 2 + .4); g.add(st); P.pots.push(st); }
    P.turkey = at(grp(mesh(G.sph(.2, 16), mat('#b8662e', { r: .4 })), at(mesh(G.cyl(.28, .28, .03, 20), mat('#f4f4f0')), 0, -.15, 0)), -.2, 1.05, .2); P.turkey.children[0].scale.set(1.2, .8, 1); g.add(P.turkey);
    g.add(at(mesh(G.box(1.2, .06, .7), mat(C.wood)), .5, .62, .45)); g.add(at(mesh(G.cyl(.05, .05, .6, 8), mat(C.wood)), .5, .3, .45));
    P.cookies = []; for (let i = 0; i < 6; i++) { const ck = mesh(G.cyl(.06, .06, .02, 12), mat('#b5652e')); ck.position.set(.25 + (i % 3) * .15, .67, .35 + Math.floor(i / 3) * .15); g.add(ck); P.cookies.push(ck); }
    P.grandma = at(person({ coat: C.plum, hat: 'hair', hatC: '#d8d8dc', scarf: false }), -.4, .12, -.2); g.add(P.grandma);
    P.mom = at(person({ coat: C.teal, hat: 'hair', hatC: C.brown, long: true, scarf: C.cream }), -1.0, .12, .3, .5); g.add(P.mom);
    P.kid = at(person({ kid: true, coat: C.red, hatC: C.cream, hatT: C.green, hat: 'hair' }), 1.2, .12, .6, -.6); g.add(P.kid);
  }
  if (kind == 'living') {
    // камин
    const fp = grp(at(mesh(G.box(1.2, 1.0, .4), mat(C.brick)), 0, .5, 0), at(mesh(G.box(1.35, .1, .5), mat(C.cream)), 0, 1.02, .02), at(mesh(G.box(.7, .5, .1), mat('#1a0e0a')), 0, .35, .17));
    const fire = mesh(G.cone(.18, .4, 8), glow('#ff8a3a', 2.4), false, false); fire.position.set(0, .3, .2); fp.add(fire); P.fire = fire; at(fp, -.9, .12, -d / 2 + .3); g.add(fp);
    P.socks = []; for (let i = 0; i < 3; i++) { const s = grp(at(mesh(G.box(.14, .26, .05), mat(i % 2 ? C.green : C.red)), 0, -.13, 0), at(mesh(G.box(.18, .07, .06), mat(C.cream)), 0, 0, 0), at(mesh(G.box(.2, .1, .05), mat(i % 2 ? C.green : C.red)), .05, -.27, 0)); at(s, -1.3 + i * .4, 1.0, -d / 2 + .56); g.add(s); P.socks.push(s); }
    P.tree = tree(1.9, { orn: 22, lights: g.userData.set + ':tree', star: true }); at(P.tree, .9, .12, -.5); g.add(P.tree);
    P.gifts = [[.5, .3, C.red], [1.25, .2, C.teal], [.85, .65, C.gold]].map(([x, z, col]) => { const gg = gift(.3, .22, .3, col, col == C.gold ? C.red : C.gold); at(gg, x, .12, z - .3); g.add(gg); return gg; });
    g.add(at(mesh(G.box(1.2, .35, .5), mat(C.burg)), -.3, .3, .75)); g.add(at(mesh(G.box(1.2, .4, .15), mat(C.burg)), -.3, .5, 1.0));
    P.dad = at(person({ coat: C.navy, hat: 'hair', hatC: C.brown }), .3, .12, .3, -.4); g.add(P.dad);
    P.kid1 = at(person({ kid: true, coat: C.mustard, hat: 'hair', hatC: '#e0b070', long: true }), -1.2, .12, .1, .3); g.add(P.kid1);
    P.kid2 = at(person({ kid: true, coat: C.green, hatC: C.red, hatT: C.cream }), -.6, .12, .25, .2); g.add(P.kid2);
    P.cat = at(grp(at(mesh(G.sph(.12, 12), mat('#e08a3a')), 0, .1, 0), at(mesh(G.sph(.08, 12), mat('#e08a3a')), .12, .2, 0), at(mesh(G.cone(.03, .06, 6), mat('#e08a3a')), .1, .29, .03), at(mesh(G.cone(.03, .06, 6), mat('#e08a3a')), .16, .29, -.03)), .1, .12, .9); P.cat.children[0].scale.set(1.4, 1, 1); g.add(P.cat);
  }
  if (kind == 'dining') {
    g.add(at(mesh(G.box(2.0, .08, .9), mat(C.wood)), 0, .7, 0)); for (const x of [-.9, .9]) for (const z of [-.35, .35]) g.add(at(mesh(G.cyl(.04, .04, .7, 8), mat(C.wood)), x, .35, z));
    P.cloth = at(mesh(G.box(2.1, .02, 1.0), mat(C.cream)), 0, .75, 0); g.add(P.cloth);
    P.items = [];
    for (let i = 0; i < 4; i++) { const pl = mesh(G.cyl(.14, .12, .02, 16), mat('#f8f6f0', { r: .3 })); pl.position.set(-.7 + i * .47, .77, .28); g.add(pl); P.items.push(pl); }
    for (let i = 0; i < 4; i++) { const gl = grp(at(mesh(G.cyl(.04, .03, .12, 10), mat('#dfe8f0', { r: .1, op: .6 })), 0, .16, 0), at(mesh(G.cyl(.005, .005, .1, 6), mat('#dfe8f0', { op: .6 })), 0, .05, 0)); gl.position.set(-.55 + i * .47, .76, .1); g.add(gl); P.items.push(gl); }
    P.candles = []; for (let i = 0; i < 3; i++) { const cd = grp(at(mesh(G.cyl(.025, .025, .25, 8), mat(C.cream)), 0, .125, 0)); const fl = mesh(G.sph(.025, 8), glow('#ffcf6a', 1.8), false, false); fl.position.y = .28; fl.scale.y = 1.6; cd.add(fl); cd.userData.fl = fl; cd.position.set(-.4 + i * .4, .77, -.15); g.add(cd); P.candles.push(cd); P.items.push(cd); }
    P.roast = at(grp(mesh(G.sph(.18, 16), mat('#a85a2a', { r: .4 })), at(mesh(G.cyl(.26, .26, .03, 20), mat('#f4f4f0')), 0, -.12, 0)), 0, .9, -.05); P.roast.children[0].scale.set(1.3, .8, 1); g.add(P.roast); P.items.push(P.roast);
    P.host = at(person({ coat: C.red, hat: 'hair', hatC: '#3a2418', long: true }), -1.2, .12, .2, .6); g.add(P.host);
    P.guests = [person({ coat: C.teal, hatC: C.snow, hatT: C.red }), person({ coat: C.mustard, hat: 'hair', hatC: C.brown, long: true }), person({ kid: true, coat: C.plum, hatC: C.cream, hatT: C.teal })];
    P.guests.forEach(p => g.add(p));
    P.ggifts = P.guests.map((p, i) => { const gg = gift(.2, .16, .2, [C.gold, C.red, C.green][i], C.cream); g.add(gg); return gg; });
  }
}
// гирлянды кукольных домиков и ёлки в гостиной
Object.values(T.fam).forEach(H => { H.updateMatrixWorld(true); const p = H.userData.roofPts.map(v => v.clone().applyMatrix4(H.matrixWorld)); root.add(stringLights(H.userData.set + ':roof', p, 20, .02)); if (H.userData.P.tree) bakeTreeLights(H.userData.P.tree); });
// машина у дома + луна + сани
T.car = car(C.teal); at(T.car, -12.8, 0, -1.0, 0); T.car.userData.tree.visible = false; root.add(T.car);
T.moon = mesh(G.sph(3, 24), glow('#fff4d8', 1.4), false, false); T.moon.position.set(-75, 9, -6); T.moon.scale.setScalar(1.3); root.add(T.moon);
T.sleigh = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#0b1024';
  for (let i = 0; i < 4; i++) { const dx = 250 + i * 60; x.beginPath(); x.ellipse(dx, 60, 24, 10, 0, 0, 7); x.fill(); x.fillRect(dx - 18, 60, 4, 22); x.fillRect(dx + 14, 60, 4, 22); x.fillRect(dx + 20, 38, 4, 18); x.beginPath(); x.ellipse(dx + 26, 36, 9, 7, 0, 0, 7); x.fill(); }
  x.beginPath(); x.moveTo(110, 50); x.lineTo(210, 50); x.lineTo(200, 80); x.lineTo(120, 80); x.fill(); x.fillRect(100, 84, 120, 5); x.beginPath(); x.arc(150, 38, 14, 0, 7); x.fill();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false })); s.scale.set(16, 4, 1); root.add(s); return s; })();
