// Существо: 2,25 м, истощённое, руки до колен, длинные пальцы, рёбра, лицо — глубокие глазницы и вытянутый рот.
import { THREE, mesh, mat, G, V3, clamp, lerp, noise } from './core.js';
const UP = V3(0, 1, 0), YAX = V3(0, 1, 0);
import { canvasTex } from './core.js';
const skinTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#4a443d'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { const x = Math.random() * w, y = Math.random() * h, r = 6 + Math.random() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${110 + Math.random() * 40},${95 + Math.random() * 30},${100 + Math.random() * 40},.18)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.strokeStyle = 'rgba(70,80,110,.22)'; for (let i = 0; i < 40; i++) { g.lineWidth = .6 + Math.random(); g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - .5) * 40; y += Math.random() * 30; g.lineTo(x, y); } g.stroke(); } }, [2, 2]);
const skin = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: skinTex, roughness: .42, clearcoat: .9, clearcoatRoughness: .3 }), skinDark = mat(0x9a9186, { roughness: .6 }), voidM = new THREE.MeshBasicMaterial({ color: 0x000000 }), shineM = new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), toothM = new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: .3 });
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true); cylGeo.translate(0, .5, 0);
function headGeo() {
  const g = new THREE.SphereGeometry(1, 96, 72); const p = g.attributes.position, v = V3();
  const eye = [V3(-.36, .14, .92).normalize(), V3(.36, .14, .92).normalize()];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const d = v.clone().normalize(); let r = 1;
    for (const e of eye) { const a = d.angleTo(e); r -= .26 * Math.exp(-Math.pow(a / .2, 2)); r += .05 * Math.exp(-Math.pow((a - .3) / .08, 2)); } // глазницы + края
    const mx = d.x / .12, my = (d.y + .42) / .3; if (d.z > 0) r -= .34 * Math.exp(-(mx * mx + my * my)) * d.z;         // рот — вытянутая дыра
    r += .06 * Math.exp(-Math.pow((d.y - .05) / .1, 2)) * Math.exp(-Math.pow((Math.abs(d.x) - .55) / .15, 2));               // скулы
    if (d.y < -.3) r *= 1 + (-.3 - d.y) * .35;                                                                      // длинный подбородок
    r -= .04 * Math.exp(-Math.pow((d.y - .38) / .08, 2)) * (d.z > 0 ? 1 : 0);                                             // надбровье
    p.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals(); return g;
}
export function makeFigure() {
  const F = { g: new THREE.Group(), s: {}, b: {} };
  const seg = (n, r1, r2, m = skin) => { const geo = new THREE.CylinderGeometry(r2, r1, 1, 24, 1, true); geo.translate(0, .5, 0); const x = mesh(geo, m); F.g.add(x); F.s[n] = x; return x; };
  const ball = (n, r, m = skin, sc = [1, 1, 1]) => { const x = mesh(G.sph(r, 28), m); x.scale.set(...sc); F.g.add(x); F.b[n] = x; return x; };
  F.head = mesh(headGeo(), skin); F.head.scale.set(.1, .18, .12); F.g.add(F.head);
  for (const sd of [-1, 1]) { const e = mesh(G.sph(.2, 16), voidM, false, false); F.head.add(e); e.position.set(sd * .33, .13, .66); const sh = mesh(G.sph(.075, 12), shineM, false, false); sh.position.set(sd * .33, .13, .8); F.head.add(sh); F['eye' + sd] = sh; }
  // зубы по краю рта
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; const x = Math.sin(a) * .1, y = -.42 + Math.cos(a) * .27; const t = mesh(new THREE.ConeGeometry(.03, .16, 6), toothM, false, false);
    t.position.set(x, y, .86 - Math.abs(Math.cos(a)) * .05); t.lookAt(0, -.42, .86); t.rotateX(Math.PI / 2); F.head.add(t); }
  F.mouth = mesh(G.sph(.15, 16), voidM, false, false); F.mouth.position.set(0, -.42, .62); F.head.add(F.mouth);
  seg('neck', .034, .03);
  const prof = [[.0, 0], [.085, .02], [.108, .08], [.1, .16], [.074, .25], [.08, .32], [.108, .4], [.128, .48], [.134, .56], [.13, .63], [.112, .69], [.07, .74], [.04, .77], [0, .78]].map(([r, y]) => new THREE.Vector2(r, y));
  const tg = new THREE.LatheGeometry(prof, 48); const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { let x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i); const r = Math.hypot(x, z) || 1, ca = z / r;
    let d = 0; if (y > .36 && y < .64 && ca > 0) d += .013 * Math.pow(Math.max(0, Math.sin((y - .36) * 75)), 3) * Math.min(1, ca * 1.6);  // рёбра
    if (ca < -.85) d += .006 * Math.max(0, Math.sin(y * 90));                                                          // позвонки
    if (y > .66 && y < .72 && Math.abs(x / r) > .3 && ca > 0) d += .01;                                                 // ключицы
    if (y > .18 && y < .33 && ca > 0) d -= .018 * ca;                                                                           // впалый живот
    d += (Math.sin(x * 140 + y * 60) * Math.sin(z * 120 - y * 90)) * .003;
    const k = (r + d) / r; tp.setXYZ(i, x * k, y, z * k * .66); }
  tg.computeVertexNormals(); F.torso = mesh(tg, skin); F.g.add(F.torso);
  const cap = (n, r, len) => { const x = mesh(new THREE.CapsuleGeometry(r, len, 8, 20), skin); x.geometry.translate(0, len / 2, 0); F.g.add(x); F.s[n] = x; x.userData.cap = 1; return x; };
  for (const sd of ['L', 'R']) {
    ball('sh' + sd, .046); ball('el' + sd, .04); ball('kn' + sd, .05); ball('wr' + sd, .03); cap('ua' + sd, .034, .46); cap('fa' + sd, .027, .46); ball('palm' + sd, .045, skin, [.78, 1.15, .36]);
    for (let f = 0; f < 4; f++) { cap(`f${sd}${f}a`, .0095, .075); cap(`f${sd}${f}b`, .008, .06); }
    cap('th' + sd, .045, .52); cap('sn' + sd, .032, .52); cap('ft' + sd, .024, .2);
  }
  // длинные мокрые чёрные волосы — пряди
  const hairM = mat(0x0c0b0a, { roughness: .35, metalness: .1 }); F.hair = [];
  for (let i = 0; i < 0; i++) { const a = (i / 70) * Math.PI * 2, front = Math.cos(a) > .2; const len = (front ? .38 : .55) + Math.random() * .2;
    const pts = [0, .25, .5, .75, 1].map(k => new THREE.Vector3(Math.sin(a) * (.95 + k * .25), .55 - k * len / .165 * (front ? .9 : 1), Math.cos(a) * (.95 + k * (front ? .15 : .35))));
    const tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, .035, 5), hairM, true, false); F.head.add(tube); F.hair.push(tube); if (front && Math.abs(Math.sin(a)) < .25) tube.visible = false; }
  // «пустота»: всё тело — абсолютно чёрное, без отражений; мягкий дымчатый край — полупрозрачные оболочки
  const voidBody = new THREE.MeshBasicMaterial({ color: 0x000000 }), haze = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .32, depthWrite: false });
  const list = []; F.g.traverse(o => { if (o.isMesh && o.material !== shineM && o.material !== toothM) list.push(o); });
  for (const o of list) { o.material = voidBody; o.castShadow = false;
    if (o === F.head || o.userData.cap || o === F.torso) { const h = new THREE.Mesh(o.geometry, haze); h.scale.set(1.12, o.userData.cap ? 1.04 : 1.06, 1.12); h.renderOrder = 2; o.add(h); } }
  return F;
}
const put = (m, a, b) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(YAX, d.divideScalar(L || 1)); if (!m.userData.cap) m.scale.set(m.scale.x, L, m.scale.z); };
function ik(a, t, l1, l2, pole) {
  const d = t.clone().sub(a), L = clamp(d.length(), .02, (l1 + l2) * .999); d.normalize();
  const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - x * x)); const pv = pole.clone().sub(d.clone().multiplyScalar(pole.dot(d))).normalize();
  return { mid: a.clone().addScaledVector(d, x).addScaledVector(pv, h), end: a.clone().addScaledVector(d, L) };
}
// P: pos (ступни), yaw, crouch 0…1, lean (вперёд), headTilt (набок), headTurn, headPitch, armL/armR (цели кистей) или reach 0…1, curl (пальцы), t (дрожь), ceiling (вверх ногами на потолке, y потолка)
export function poseFigure(F, P) {
  const yaw = P.yaw || 0, f = V3(Math.sin(yaw), 0, Math.cos(yaw)), r = V3(-Math.cos(yaw), 0, Math.sin(yaw));
  const cr = P.crouch || 0, lean = (P.lean || 0) + cr * .5, t = P.t || 0, tw = (P.twitch || 0) * noise(3, t * 20) * .03;
  const flip = P.ceiling != null;
  const base = flip ? V3(P.pos.x, P.ceiling, P.pos.z) : P.pos.clone();
  const U = flip ? V3(0, -1, 0) : UP.clone();
  const L = (x, y, z) => base.clone().addScaledVector(r, x).addScaledVector(U, y).addScaledVector(f, z);
  const hipY = 1.18 - cr * .5;
  const hip = L(0, hipY, 0);
  const tilt = (q) => q.clone().sub(hip).applyAxisAngle(r, -lean * (flip ? -1 : 1)).add(hip);
  const chest = tilt(L(tw, hipY + .5, 0)), neck0 = tilt(L(tw, hipY + .7, 0)), headC = tilt(L(tw * 1.5, hipY + .93, .03));
  F.torso.position.copy(hip.clone().addScaledVector(U, -.03)); F.torso.quaternion.setFromEuler(new THREE.Euler(lean * (flip ? -1 : 1), yaw, 0, 'YXZ')); if (flip) F.torso.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(f, Math.PI));
  // голова: наклон набок — главная «неправильность»
  const hp = P.headPitch || 0, ht = P.headTilt || 0, hy = yaw + (P.headTurn || 0);
  F.head.position.copy(headC);
  F.head.quaternion.setFromEuler(new THREE.Euler(hp + lean * .5, hy, ht, 'YXZ'));
  if (flip) F.head.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(f, Math.PI));
  put(F.s.neck, neck0, headC.clone().addScaledVector(U, -.08));
  const mo = P.mouth ?? .6; F.mouth.scale.set(.9, 1.2 + mo * 1.3, .8);
  // руки
  for (const sd of ['L', 'R']) {
    const sx = sd === 'L' ? -1 : 1, sh = tilt(L(sx * .17, hipY + .66, 0));
    const reach = P.reach || 0;
    const rest = sh.clone().addScaledVector(U, -.9 + reach * .6).addScaledVector(r, sx * .08).addScaledVector(f, .05 + reach * .7);
    const tgt = P['arm' + sd] || rest;
    const k = ik(sh, tgt, .46, .46, r.clone().multiplyScalar(sx).addScaledVector(f, -.4).addScaledVector(U, -.2));
    F.b['sh' + sd].position.copy(sh); put(F.s['ua' + sd], sh, k.mid); put(F.s['fa' + sd], k.mid, k.end); F.b['el' + sd].position.copy(k.mid); F.b['wr' + sd].position.copy(k.end);
    const dir = k.end.clone().sub(k.mid).normalize(), side = dir.clone().cross(f).normalize();
    const palm = k.end.clone().addScaledVector(dir, .05); F.b['palm' + sd].position.copy(palm); F.b['palm' + sd].quaternion.setFromUnitVectors(YAX, dir);
    const curl = P.curl ?? .3;
    for (let fi = 0; fi < 4; fi++) {
      const base2 = palm.clone().addScaledVector(dir, .045).addScaledVector(side, (fi - 1.5) * .018);
      const d1 = dir.clone().applyAxisAngle(side, curl * .5 * sx).applyAxisAngle(dir, 0).addScaledVector(side, (fi - 1.5) * .12).normalize();
      const m1 = base2.clone().addScaledVector(d1, .075);
      const d2 = d1.clone().applyAxisAngle(side, curl * .9 * sx).normalize(); const e2 = m1.clone().addScaledVector(d2, .06);
      put(F.s[`f${sd}${fi}a`], base2, m1); put(F.s[`f${sd}${fi}b`], m1, e2);
    }
  }
  // ноги
  for (const sd of ['L', 'R']) {
    const sx = sd === 'L' ? -1 : 1, hp2 = L(sx * .09, hipY, 0);
    const ph = (P.walk || 0) + (sd === 'L' ? 0 : Math.PI), wa = P.walkAmp || 0;
    const ank = L(sx * (.12 + cr * .1), .06 + Math.max(0, Math.cos(ph)) * .1 * wa, Math.sin(ph) * .3 * wa + cr * .15);
    const k = ik(hp2, ank, .52, .52, f.clone().addScaledVector(r, sx * cr * .6));
    put(F.s['th' + sd], hp2, k.mid); put(F.s['sn' + sd], k.mid, k.end); F.b['kn' + sd].position.copy(k.mid);
    put(F.s['ft' + sd], k.end, k.end.clone().addScaledVector(f, .2).addScaledVector(U, -.04));
  }
}
