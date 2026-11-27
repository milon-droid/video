// Строители игрушечного мира: дома, ёлки, человечки, машина, ларьки, карусель, комната.
import { THREE, mat, glow, mesh, G, grp, at, stringLights, addBulb, BULB_COLS, hash, clamp, softTex } from './core.js';
export const C = { navy: '#24345e', burg: '#8a2433', red: '#c8343c', hunter: '#2c5a40', green: '#3e7a52', gold: '#e6b450', cream: '#f4ead6',
  snow: '#f6f8fc', skin: '#f4c7a6', brown: '#6b4430', wood: '#a0683c', teal: '#3f8a8c', mustard: '#d89a34', plum: '#6a3a62', pink: '#e8a3a0', brick: '#a5503a' };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// снежная шапка-валик
const snowCap = (w, d, h = .08) => { const m = mesh(G.box(w, h, d), mat(C.snow, { r: .9 })); return m; };
// ---------- дом: w ширина, h высота стен, d глубина; o: wall, roof, door, wreath, set (для гирлянды), lights: true
export function house(o = {}) {
  const w = o.w || 2, h = o.h || 1.6, d = o.d || 1.6, g = grp();
  const wall = mesh(G.box(w, h, d), mat(o.wall || C.burg, { r: .8 })); wall.position.y = h / 2; g.add(wall);
  // крыша — треугольная призма
  const rh = w * .45, shape = new THREE.Shape(); shape.moveTo(-w / 2 - .12, 0); shape.lineTo(0, rh); shape.lineTo(w / 2 + .12, 0); shape.lineTo(-w / 2 - .12, 0);
  const roofG = new THREE.ExtrudeGeometry(shape, { depth: d + .24, bevelEnabled: false }); roofG.translate(0, 0, -(d + .24) / 2);
  const roof = mesh(roofG, mat(o.roof || C.navy, { r: .7 })); roof.position.y = h; g.add(roof);
  // снег на скатах
  const sl = Math.hypot(w / 2 + .12, rh), ang = Math.atan2(rh, w / 2 + .12);
  for (const sd of [-1, 1]) { const s = mesh(G.box(sl * .98, .1, d + .3), mat(C.snow, { r: .95 })); s.position.set(sd * (w / 4 + .03), h + rh / 2 + .06, 0); s.rotation.z = -sd * ang; g.add(s); }
  // труба
  const ch = mesh(G.box(.26, .6, .26), mat(C.brick)); ch.position.set(w * .25, h + rh * .7, -d * .15); g.add(ch); const cs = snowCap(.32, .32, .1); cs.position.set(w * .25, h + rh * .7 + .33, -d * .15); g.add(cs);
  // окна (светятся)
  const winM = o.dark ? mat('#2a2a3a') : glow('#ffc066', 1.15);
  const wins = [];
  for (const [fx, fy] of (o.wins || [[-.28, .62], [.28, .62], [-.28, .25]])) {
    const wm = mesh(G.box(w * .2, h * .24, .02), winM, false, false); wm.position.set(fx * w, fy * h, d / 2 + .011); g.add(wm); wins.push(wm);
    const fr = mesh(G.box(w * .23, .03, .05), mat(C.cream)); fr.position.set(fx * w, fy * h, d / 2 + .02); g.add(fr);
    const fv = mesh(G.box(.03, h * .26, .05), mat(C.cream)); fv.position.set(fx * w, fy * h, d / 2 + .02); g.add(fv);
    const sill = snowCap(w * .26, .12, .05); sill.position.set(fx * w, fy * h - h * .13, d / 2 + .05); g.add(sill);
  }
  // дверь
  const door = mesh(G.box(w * .2, h * .45, .04), mat(o.door || C.hunter, { r: .5 })); door.position.set(w * .26, h * .225, d / 2 + .02); g.add(door);
  const knob = mesh(G.sph(.025, 8), mat(C.gold, { m: .8, r: .3 })); knob.position.set(w * .32, h * .22, d / 2 + .05); g.add(knob);
  const wr = grp(mesh(G.tor(.1, .04, 16), mat(C.green, { r: .9 })), at(mesh(G.box(.06, .08, .02), mat(C.red)), 0, -.1, .03));
  for (let i = 0; i < 6; i++) wr.add(at(mesh(G.sph(.018, 6), mat(C.red, { r: .4 })), Math.cos(i) * .1, Math.sin(i) * .1, .04));
  wr.position.set(w * .26, h * .34, d / 2 + .06); g.add(wr); wr.visible = o.wreath !== false;
  // гирлянда по краю крыши
  if (o.set) { const z = d / 2 + .14; g.add(stringLightsLocal(g, o.set + ':roof', [V(-w / 2 - .12, h, z), V(0, h + rh, z), V(w / 2 + .12, h, z)], 18, .02)); }
  // сугроб у стены
  const drift = mesh(G.sph(1, 16), mat(C.snow, { r: .95 })); drift.scale.set(w * .6, .18, .4); drift.position.set(0, 0, d / 2 + .1); g.add(drift);
  g.userData = { wins, wreath: wr, door };
  return g;
}
// гирлянда в локальных координатах группы: позиции пересчитываются при добавлении в мир (после позиционирования)
const pending = [];
function stringLightsLocal(g, set, pts, n, sag) { pending.push({ g, set, pts, n, sag }); return null; }
export function bakeLights(root) { root.updateMatrixWorld(true);
  for (const p of pending) { const w = p.pts.map(v => v.clone().applyMatrix4(p.g.matrixWorld)); const tube = stringLights(p.set, w, p.n, p.sag); root.add(tube); }
  pending.length = 0; }
// ---------- ёлка из ярусов; o: lights (set имя), orn — группа игрушек (видимость по одной), star
export function tree(h = 2, o = {}) {
  const g = grp(); const trunk = mesh(G.cyl(.06 * h, .08 * h, .2 * h, 10), mat(C.brown)); trunk.position.y = .1 * h; g.add(trunk);
  const tiers = 4;
  for (let i = 0; i < tiers; i++) { const k = i / tiers, r = h * (.36 - k * .24), ch = h * .38, y = h * (.18 + k * .2) + ch / 2;
    const cone = mesh(G.cone(r, ch, 14), mat(i % 2 ? (o.col || C.green) : (o.dk || C.hunter), { r: .85 })); cone.position.y = y; g.add(cone);
    if (o.snow) { const sc = mesh(G.cone(r * .98, ch * .25, 14), mat(C.snow, { r: .95 })); sc.position.y = y + ch * .02 - ch * .3; sc.scale.set(1.02, 1, 1.02); sc.position.y = y - ch * .36; sc.rotation.x = Math.PI; sc.visible = false; g.add(sc);
      const cap = mesh(G.cone(r * .55, ch * .35, 14), mat(C.snow, { r: .95 })); cap.position.y = y + ch * .33; g.add(cap); } }
  const orn = []; if (o.orn) for (let i = 0; i < (o.orn === true ? 26 : o.orn); i++) { const k = hash(i * 3.3), y = h * (.22 + k * .66), r = h * (.36 - (k * .9) * .26) * .92, a = hash(i * 7.1) * 6.283;
    const b = mesh(G.sph(h * .028, 10), mat([C.red, C.gold, C.cream, C.teal, '#c0c8d8'][i % 5], { r: .35, m: .1, e: [C.red, C.gold, C.cream, C.teal, '#c0c8d8'][i % 5], ei: .25 })); b.position.set(Math.cos(a) * r, y - h * .05, Math.sin(a) * r); g.add(b); orn.push(b); }
  if (o.lights) { const pts = []; for (let i = 0; i < 60; i++) { const k = i / 60, y = h * (.22 + k * .7), r = h * (.36 - k * .27) * 1.0, a = k * 6.283 * 5; pts.push(V(Math.cos(a) * r, y - h * .04, Math.sin(a) * r)); }
    g.userData.lightPts = pts; g.userData.lightSet = o.lights; }
  let star = null; if (o.star) { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? .45 : 1; i ? s.lineTo(Math.cos(a) * rr, -Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, -Math.sin(a) * rr); }
    star = mesh(new THREE.ExtrudeGeometry(s, { depth: .3, bevelEnabled: false }), glow('#ffd36a', 2.2)); star.scale.setScalar(h * .07); star.position.set(0, h * 1.0, -h * .01); g.add(star); }
  g.userData.orn = orn; g.userData.star = star; return g;
}
export function bakeTreeLights(t) { t.updateMatrixWorld(true); const ud = t.userData; if (!ud.lightPts) return;
  ud.lightPts.forEach((p, i) => addBulb(p.clone().applyMatrix4(t.matrixWorld), BULB_COLS[i % 5], ud.lightSet, i, ud.lightSet == 'bigtree' ? 1.2 : .55)); }
// ---------- человечек-игрушка. Возвращает группу с частями для анимации
export function person(o = {}) {
  const g = grp(), s = o.kid ? .75 : 1;
  const coatM = mat(o.coat || C.red, { r: .85 }), skin = mat(C.skin, { r: .6 });
  const body = mesh(G.cyl(.13, .2, .42, 16), coatM); body.position.y = .42; g.add(body);
  const legs = [-1, 1].map(sd => { const l = grp(mesh(G.cap(.045, .16, 8), mat(o.legs || '#2a2a3a')), at(mesh(G.sph(.055, 10), mat('#222')), 0, -.12, .03)); l.children[0].position.y = -.06; l.position.set(sd * .07, .22, 0); g.add(l); return l; });
  const arms = [-1, 1].map(sd => { const a = grp(at(mesh(G.cap(.045, .22, 8), coatM), 0, -.13, 0), at(mesh(G.sph(.05, 10), mat(o.mitt || C.cream)), 0, -.27, 0)); a.position.set(sd * .15, .58, 0); g.add(a); return a; });
  const head = grp(mesh(G.sph(.15, 24), skin)); head.position.y = .8; g.add(head);
  [-1, 1].forEach(sd => { head.add(at(mesh(G.sph(.022, 10), mat('#1a1418', { r: .2 })), sd * .055, .02, .135)); head.add(at(mesh(G.sph(.008, 6), glow('#fff', 1)), sd * .055 + .008, .03, .155));
    const ch = mesh(G.sph(.03, 10), mat('#f08a8a', { r: .8, op: .6 })); ch.position.set(sd * .085, -.04, .12); ch.scale.z = .3; head.add(ch); });
  const mouth = mesh(G.sph(.025, 10), mat('#7a2030')); mouth.position.set(0, -.065, .135); mouth.scale.set(1, .4, .4); head.add(mouth);
  const nose = mesh(G.sph(.02, 8), mat('#eaa88a')); nose.position.set(0, -.01, .15); head.add(nose);
  // шапка
  const hatType = o.hat || 'beanie'; let hat;
  if (hatType == 'beanie') { hat = grp(at(mesh(G.sph(.155, 20, 10), mat(o.hatC || C.cream, { r: .95 })), 0, .03, 0), at(mesh(G.cyl(.158, .158, .06, 20), mat(o.hatT || C.red, { r: .95 })), 0, .02, 0), at(mesh(G.sph(.05, 12), mat(o.hatT || C.red, { r: 1 })), 0, .19, 0));
    hat.children[0].scale.y = .75; }
  else if (hatType == 'party') { hat = grp(at(mesh(G.cone(.08, .26, 16), mat(o.hatC || C.gold, { r: .4, m: .3 })), 0, .2, 0), at(mesh(G.sph(.03, 8), mat(C.red)), 0, .34, 0)); }
  else if (hatType == 'hair') { hat = grp(at(mesh(G.sph(.158, 20), mat(o.hatC || C.brown, { r: .9 })), 0, .03, -.02)); hat.children[0].scale.set(1, .9, 1); if (o.long) { hat.add(at(mesh(G.cap(.06, .18, 8), mat(o.hatC || C.brown)), -.13, -.1, -.03)); hat.add(at(mesh(G.cap(.06, .18, 8), mat(o.hatC || C.brown)), .13, -.1, -.03)); } }
  else if (hatType == 'none') hat = grp();
  if (hatType == 'hair') { hat.children[0].scale.set(1.02, .92, 1.02); const cut = hat.children[0]; cut.position.set(0, .05, -.03); }
  head.add(hat);
  // шарф
  if (o.scarf !== false) { const sc = mesh(G.tor(.11, .04, 16), mat(o.scarf || C.cream, { r: 1 })); sc.rotation.x = Math.PI / 2; sc.position.y = .66; g.add(sc); const tail = mesh(G.box(.06, .2, .03), mat(o.scarf || C.cream)); tail.position.set(.06, .56, .12); g.add(tail); }
  g.scale.setScalar(s * (o.s || 1));
  g.userData = { legs, arms, head, mouth, body };
  return g;
}
// поза: aL/aR — подъём рук (рад, 0 вниз, π вверх), walk фаза, look поворот головы, mouth 0..1, bob
export function pose(p, o = {}) {
  const u = p.userData; u.arms[0].rotation.z = -(o.aL ?? .15); u.arms[1].rotation.z = (o.aR ?? .15);
  u.arms[0].rotation.x = -(o.fL || 0); u.arms[1].rotation.x = -(o.fR || 0);
  const w = o.walk; if (w !== undefined) { u.legs[0].rotation.x = Math.sin(w) * .6; u.legs[1].rotation.x = -Math.sin(w) * .6; u.body.position.y = .42 + Math.abs(Math.sin(w)) * .02; if (o.aL === undefined) u.arms[0].rotation.x = -Math.sin(w) * .5; if (o.aR === undefined) u.arms[1].rotation.x = Math.sin(w) * .5; }
  else { u.legs[0].rotation.x = 0; u.legs[1].rotation.x = 0; }
  u.head.rotation.y = o.look || 0; u.head.rotation.x = o.nod || 0; u.head.rotation.z = o.tilt || 0;
  u.mouth.scale.set(1, .35 + (o.mouth || 0) * 1.1, .45);
}
// ---------- машина с ёлкой на крыше
export function car(col = C.teal) {
  const g = grp(); const body = mesh(G.box(1.5, .32, .7), mat(col, { r: .35, m: .2 })); body.position.y = .3; g.add(body);
  const cab = mesh(G.box(.9, .3, .64), mat(col, { r: .35, m: .2 })); cab.position.set(-.08, .6, 0); g.add(cab);
  const gl = mesh(G.box(.84, .22, .66), mat('#bcd6e6', { r: .1, m: .4 })); gl.position.set(-.08, .62, 0); g.add(gl);
  for (const x of [-.48, .48]) for (const z of [-.34, .34]) { const wl = mesh(G.cyl(.15, .15, .1, 16), mat('#1b1b22')); wl.rotation.x = Math.PI / 2; wl.position.set(x, .15, z); g.add(wl); }
  const hl = mesh(G.sph(.05, 8), glow('#fff2c0', 2)); hl.position.set(.76, .32, .22); g.add(hl); const hl2 = hl.clone(); hl2.position.z = -.22; g.add(hl2);
  const trim = mesh(G.box(1.52, .05, .72), mat(C.cream)); trim.position.y = .2; g.add(trim);
  const tr = tree(1.3, { col: C.green, dk: C.hunter }); tr.rotation.z = Math.PI / 2; tr.position.set(.6, .8, 0); g.add(tr);
  g.userData = { tree: tr }; return g;
}
// ---------- ларёк ярмарки
export function stall(col, setName) {
  const g = grp(); const base = mesh(G.box(1.6, 1.0, 1.0), mat(col)); base.position.y = .5; g.add(base);
  const open = mesh(G.box(1.3, .5, .05), glow('#ffb35a', 1.2)); open.position.set(0, .72, .51); g.add(open);
  const counter = mesh(G.box(1.5, .08, .3), mat(C.wood)); counter.position.set(0, .5, .6); g.add(counter);
  for (let i = 0; i < 6; i++) { const it = mesh(G.sph(.06, 10), mat([C.gold, C.red, C.cream, C.teal][i % 4], { r: .3, m: .4 })); it.position.set(-.6 + i * .24, .6, .62); g.add(it); }
  // полосатая крыша
  for (let i = 0; i < 8; i++) { const st = mesh(G.box(.2, .04, 1.3), mat(i % 2 ? C.red : C.cream)); st.position.set(-.7 + i * .2, 1.25, .1); st.rotation.x = -.35; g.add(st); }
  const roofTop = mesh(G.box(1.7, .1, .5), mat(C.snow)); roofTop.position.set(0, 1.42, -.2); g.add(roofTop);
  g.userData.lightsPts = [V(-.8, 1.12, .75), V(.8, 1.12, .75)]; g.userData.set = setName; return g;
}
// ---------- карусель
export function carousel() {
  const g = grp(); const base = mesh(G.cyl(1.6, 1.7, .25, 32), mat(C.cream)); base.position.y = .12; g.add(base);
  const pole = mesh(G.cyl(.12, .12, 2.2, 12), mat(C.gold, { m: .7, r: .3 })); pole.position.y = 1.2; g.add(pole);
  const roof = mesh(G.cone(2.0, .9, 24), mat(C.red, { r: .5 })); roof.position.y = 2.7; g.add(roof);
  const rim = mesh(G.cyl(2.0, 2.0, .2, 32, 1, true), mat(C.gold, { m: .6, r: .3 })); rim.position.y = 2.2; g.add(rim);
  const rot = grp(); g.add(rot);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; const p = mesh(G.cyl(.03, .03, 1.9, 8), mat(C.gold, { m: .8, r: .3 })); p.position.set(Math.cos(a) * 1.3, 1.2, Math.sin(a) * 1.3); rot.add(p);
    const horse = grp(at(mesh(G.cap(.12, .35, 10), mat(i % 2 ? C.cream : C.teal)), 0, 0, 0), at(mesh(G.cap(.07, .18, 8), mat(i % 2 ? C.cream : C.teal)), .26, .14, 0));
    horse.children[0].rotation.z = Math.PI / 2; horse.children[1].rotation.z = -.6; horse.position.set(Math.cos(a) * 1.3, .9, Math.sin(a) * 1.3); horse.rotation.y = -a; horse.userData.ph = i; rot.add(horse); }
  g.userData.rot = rot; return g;
}
// ---------- подарок
export function gift(w, h, d, col, rib = C.gold) {
  const g = grp(mesh(G.box(w, h, d), mat(col, { r: .5 }))); g.children[0].position.y = h / 2;
  const r1 = mesh(G.box(w * 1.01, h * 1.01, d * .15), mat(rib, { r: .3, m: .5 })); r1.position.y = h / 2; g.add(r1); const r2 = mesh(G.box(w * .15, h * 1.01, d * 1.01), mat(rib, { r: .3, m: .5 })); r2.position.y = h / 2; g.add(r2);
  const bow = grp(at(mesh(G.tor(.06, .025, 12), mat(rib, { r: .3, m: .5 })), -.05, 0, 0), at(mesh(G.tor(.06, .025, 12), mat(rib, { r: .3, m: .5 })), .05, 0, 0)); bow.children[0].rotation.y = .6; bow.children[1].rotation.y = -.6; bow.position.y = h + .04; bow.scale.setScalar(Math.min(w, d) * 2.2); g.add(bow);
  g.userData = { bow }; return g;
}
// ---------- пар (спрайты)
export function steam(n = 4) { const g = grp(); for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: '#ffffff', transparent: true, opacity: .4, depthWrite: false })); s.userData.ph = i / n; g.add(s); } return g; }
export function updSteam(g, t, sc = 1) { g.children.forEach(s => { const ph = (t * .6 + s.userData.ph) % 1; s.position.set(Math.sin(ph * 6 + s.userData.ph * 9) * .05 * sc, ph * .5 * sc, 0); s.scale.setScalar((.08 + ph * .2) * sc); s.material.opacity = (1 - ph) * .45; }); }
