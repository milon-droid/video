// Пластилиновая игрушка-персонаж: суставы (плечо-локоть-кисть, бедро-колено-стопа), лицо из частей (глаза моргают, брови, рот), волосы-комки.
// Рост ≈ 1.15. Смотрит в +z. Поза — объект углов (радианы); walk(dist) — шаг от пройденного пути (ноги не скользят).
import { THREE, G, clay, mesh, glow, clamp, lerp, h1, noise } from './core.js';

const P = (x, y, z, ...ch) => { const g = new THREE.Group(); g.position.set(x, y, z); ch.forEach(c => c && g.add(c)); return g; };

export const LOOK = {
  senya: { skin: '#f2c9ad', hair: '#3a2a22', top: '#8e96a8', top2: '#6e7688', pants: '#2e3550', shoes: '#f2f2f2', hood: true, eye: '#1a1210', blush: .5 },
};

export function makeToy(L = LOOK.senya, { shadow = false, uniq = false } = {}) {
  const C = (c, o = {}) => uniq ? new THREE.MeshStandardMaterial({ color: c, roughness: .82, metalness: 0, ...o }) : clay(c, o);
  const S = shadow; const ink = new THREE.MeshBasicMaterial({ color: '#05050a', transparent: true, opacity: .9 });
  const M = c => S ? ink : C(c);
  const root = new THREE.Group(); root.userData.kind = 'toy';
  const hips = P(0, .42, 0); root.add(hips);
  // торс-худи
  const spine = P(0, .02, 0); hips.add(spine);
  const torso = mesh(G.cap(.155, .2), M(L.top)); torso.position.y = .2; torso.scale.set(1, 1, .82); spine.add(torso);
  const belly = mesh(G.sph(.16), M(L.top2)); belly.position.set(0, .1, .02); belly.scale.set(1, .55, .8); spine.add(belly);
  if (L.hood) { const hood = mesh(new THREE.TorusGeometry(.1, .045, 10, 20), M(L.top2)); hood.position.set(0, .4, -.05); hood.rotation.x = Math.PI / 2.4; spine.add(hood); }
  // карман-кенгуру и шнурки
  if (!S) { const pk = mesh(G.rbox(.16, .07, .02, .01), C(L.top2)); pk.position.set(0, .12, .125); spine.add(pk);
    [-1, 1].forEach(s => { const st = mesh(G.cap(.008, .07), C('#e8e8f0')); st.position.set(s * .035, .33, .125); spine.add(st); }); }
  const pelvis = mesh(G.sph(.15), M(L.pants)); pelvis.scale.set(1, .5, .8); pelvis.position.y = -.01; hips.add(pelvis);
  // голова
  const neck = P(0, .43, 0); spine.add(neck);
  const head = P(0, .2, .0); neck.add(head);
  const skull = mesh(G.sph(.235, 32), M(L.skin)); skull.scale.set(1, .96, .94); head.add(skull);
  const face = new THREE.Group(); head.add(face);
  let eyes = [], brows = [], mouthO, mouthS, lids = [];
  if (!S) {
    [-1, 1].forEach(s => {
      const e = P(s * .078, .015, .205); const ball = mesh(G.sph(.034, 16), C(L.eye, { roughness: .3 }), false); ball.scale.set(.82, 1.1, .5); e.add(ball);
      const hi = mesh(G.sph(.009, 8), glow('#ffffff', 1.2), false); hi.position.set(.01, .015, .016); e.add(hi);
      face.add(e); eyes.push(e);
      const lid = mesh(G.sph(.036, 16, ), C(L.skin), false); lid.scale.set(.95, .05, .55); lid.position.set(s * .078, .055, .207); face.add(lid); lids.push(lid);
      const b = mesh(G.cap(.011, .045), C(L.hair), false); b.rotation.z = Math.PI / 2; b.position.set(s * .08, .085, .215); face.add(b); brows.push(b);
      const bl = mesh(G.sph(.03, 12), new THREE.MeshStandardMaterial({ color: '#ff8a8a', transparent: true, opacity: L.blush ?? .4, roughness: 1 }), false); bl.scale.set(1, .6, .3); bl.position.set(s * .13, -.04, .19); face.add(bl);
    });
    const nose = mesh(G.sph(.024, 12), C(L.skin), false); nose.position.set(0, -.02, .232); nose.scale.set(1, .8, .8); face.add(nose);
    mouthO = mesh(G.sph(.03, 16), C('#4a1a1a', { roughness: .5 }), false); mouthO.position.set(0, -.085, .215); mouthO.scale.set(1, .2, .4); face.add(mouthO);
    mouthS = mesh(new THREE.TorusGeometry(.03, .007, 6, 16, Math.PI), C('#4a1a1a'), false); mouthS.position.set(0, -.07, .218); mouthS.rotation.z = Math.PI; face.add(mouthS);
    // волосы: комки
    const hm = C(L.hair, { roughness: .9 });
    const blobs = [[0, .13, -.02, .2, 1, .7, 1], [-.12, .1, -.04, .13], [.12, .1, -.04, .13], [0, .06, -.12, .2, 1, .9, .8], [-.17, .0, -.06, .09], [.17, .0, -.06, .09], [-.07, .17, .1, .1], [.06, .18, .11, .095], [.15, .12, .08, .08], [-.15, .12, .08, .08], [0, .2, .03, .12]];
    blobs.forEach(([x, y, z, r, sx = 1, sy = .8, sz = 1]) => { const b = mesh(G.sph(r, 16), hm); b.position.set(x, y, z); b.scale.set(sx, sy, sz); head.add(b); });
    // чёлка
    [[-.09, .13, .17, .4], [-.02, .15, .19, .1], [.06, .14, .18, -.3]].forEach(([x, y, z, rz]) => { const b = mesh(G.cap(.035, .06), hm); b.position.set(x, y, z); b.rotation.z = rz; b.rotation.x = .9; head.add(b); });
    [-1, 1].forEach(s => { const ear = mesh(G.sph(.04, 12), C(L.skin)); ear.scale.set(.5, 1, .8); ear.position.set(s * .228, 0, 0); head.add(ear); });
  } else {
    const hm = ink; [[0, .13, -.02, .2], [-.13, .08, -.04, .13], [.13, .08, -.04, .13], [-.07, .17, .1, .1], [.06, .18, .11, .095]].forEach(([x, y, z, r]) => { const b = mesh(G.sph(r, 12), hm, false, false); b.position.set(x, y, z); b.scale.set(1, .8, 1); head.add(b); });
    // светящиеся глаза тени
    [-1, 1].forEach(s => { const e = new THREE.Group(); e.position.set(s * .085, .02, 0); [.25, -.25].forEach(z => { const m = mesh(G.sph(.036, 16), glow('#f4f8ff', 1.6), false, false); m.position.z = z; e.add(m); }); face.add(e); eyes.push(e); });
  }
  // руки
  const arm = s => { const sh = P(s * .2, .36, 0); spine.add(sh);
    const up = mesh(G.cap(.052, .12), M(L.top)); up.position.y = -.08; sh.add(up);
    const el = P(0, -.17, 0); sh.add(el); const fo = mesh(G.cap(.047, .11), M(L.top)); fo.position.y = -.07; el.add(fo);
    const cuff = mesh(G.cyl(.05, .05, .03), M(L.top2)); cuff.position.y = -.14; el.add(cuff);
    const hand = P(0, -.18, 0); el.add(hand); const hb = mesh(G.sph(.058, 16), M(L.skin)); hb.scale.set(.9, 1, .75); hand.add(hb);
    const th = mesh(G.cap(.02, .03), M(L.skin)); th.position.set(-s * .0 + .0, -.0, .05); th.rotation.x = .8; hand.add(th);
    const fing = mesh(G.cap(.022, .09), M(L.skin)); fing.position.set(0, -.1, 0); fing.visible = false; hand.add(fing);
    return { sh, el, hand, fing }; };
  const leg = s => { const hp = P(s * .085, -.02, 0); hips.add(hp);
    const th = mesh(G.cap(.07, .1), M(L.pants)); th.position.y = -.08; hp.add(th);
    const kn = P(0, -.17, 0); hp.add(kn); const sn = mesh(G.cap(.062, .09), M(L.pants)); sn.position.y = -.07; kn.add(sn);
    const ft = P(0, -.17, 0); kn.add(ft); const sh = mesh(G.rbox(.12, .075, .2, .035), M(L.shoes)); sh.position.set(0, -.025, .04); ft.add(sh);
    if (!S) { const sole = mesh(G.rbox(.125, .02, .205, .01), C('#c8c8d0')); sole.position.set(0, -.058, .04); ft.add(sole); }
    return { hp, kn, ft }; };
  const aL = arm(-1), aR = arm(1), lL = leg(-1), lR = leg(1);
  root.traverse(o => { if (o.isMesh && S) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, hips, spine, neck, head, face, eyes, lids, brows, mouthO, mouthS, aL, aR, lL, lR, shadow: S };
}

// поза: { lean, twist, headY, headX, headZ, crouch, aL:[вперёд, вбок, локоть], aR, lL:[бедро, колено], lR, bob }
export const POSE = {
  stand: { aL: [0, .12, .15], aR: [0, -.12, .15] },
  phone: { aL: [0, .12, .15], aR: [.9, -.2, 1.9], headX: .35 },
  armsUp: { aL: [0, 2.7, .2], aR: [0, -2.7, .2], headX: -.2 },
  shrug: { aL: [.3, .5, 1.6], aR: [.3, -.5, 1.6], headZ: .15 },
  reach: { aL: [0, .12, .15], aR: [1.45, -.1, .1], lean: .12 },
  scared: { aL: [.9, .3, 2.1], aR: [.9, -.3, 2.1], headX: .1, crouch: .03 },
  facepalm: { aL: [0, .12, .15], aR: [1.3, -.1, 2.4], headX: .3 },
  wave: { aL: [0, .12, .15], aR: [0, -2.4, .9] },
  tired: { aL: [.5, .2, .3], aR: [.5, -.2, .3], lean: .5, crouch: .08, headX: -.3 },
};
const Z = { lean: 0, twist: 0, headY: 0, headX: 0, headZ: 0, crouch: 0, aL: [0, .12, .15], aR: [0, -.12, .15], lL: [0, 0], lR: [0, 0], bob: 0, hipsZ: 0 };
const mixA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
export const blendPose = (a, b, k) => { const A = { ...Z, ...a }, B = { ...Z, ...b }; const o = {}; for (const key in Z) o[key] = Array.isArray(Z[key]) ? mixA(A[key], B[key], k) : lerp(A[key], B[key], k); return o; };
// ключи: [[t, поза], ...] с перелётом
export const keys = (t, ks) => { const f = p => typeof p === 'string' ? POSE[p] : p; if (t <= ks[0][0]) return blendPose(f(ks[0][1]), f(ks[0][1]), 0);
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const k = (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]); const c = 1.4, e = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); return blendPose(f(ks[i - 1][1]), f(ks[i][1]), e); }
  return blendPose(f(ks[ks.length - 1][1]), f(ks[ks.length - 1][1]), 0); };
// шаг/бег от пройденного пути
export const walk = (dist, run = 0, extra = {}) => { const stride = lerp(.42, .7, run); const ph = dist / stride * Math.PI; const a = Math.sin(ph) * lerp(.55, .95, run);
  return { ...Z, ...extra, lL: [a, Math.max(0, -Math.cos(ph)) * lerp(.7, 1.5, run) + .1], lR: [-a, Math.max(0, Math.cos(ph)) * lerp(.7, 1.5, run) + .1],
    aL: [-a * lerp(.8, 1.2, run), .15, lerp(.3, 1.6, run)], aR: [a * lerp(.8, 1.2, run), -.15, lerp(.3, 1.6, run)], bob: Math.abs(Math.cos(ph)) * lerp(.025, .06, run), lean: lerp(.04, .28, run), ...(extra.aR ? { aR: extra.aR } : {}), ...(extra.aL ? { aL: extra.aL } : {}) }; };

// применить позу + «жизнь» (дыхание, моргание, микродвижения), лицо
export function applyPose(T, pose, t, face = {}, seed = 1) {
  const p = { ...Z, ...pose };
  const br = Math.sin(t * 2.3 + seed) * .012;
  T.hips.position.y = .42 - p.crouch + p.bob; T.hips.rotation.z = p.hipsZ;
  T.spine.rotation.x = p.lean + br; T.spine.rotation.y = p.twist; T.spine.scale.y = 1 + br * .5;
  T.neck.rotation.set(p.headX + noise(seed + 1, t * .6) * .04 - p.lean * .5, p.headY + noise(seed + 2, t * .5) * .06, p.headZ + noise(seed + 3, t * .4) * .03);
  const setA = (A, [fw, side, elb], s) => { A.sh.rotation.set(-fw, 0, side + s * noise(seed + 5 + s, t * .5) * .03); A.el.rotation.set(-elb, 0, 0); };
  setA(T.aL, p.aL, -1); setA(T.aR, p.aR, 1);
  const setL = (Lg, [hip, knee]) => { Lg.hp.rotation.x = -hip - p.crouch * 2.2; Lg.kn.rotation.x = knee + p.crouch * 4; Lg.ft.rotation.x = -(knee + p.crouch * 4) + hip + p.crouch * 2.2; };
  setL(T.lL, p.lL); setL(T.lR, p.lR);
  T.aR.fing.visible = !!face.finger; T.aL.fing.visible = !!face.fingerL;
  // лицо
  if (T.shadow) { const b = blinkK(t, seed + 9) * (face.open ?? 1); const m = face.mood || 'calm';
    T.eyes.forEach((e, i) => { const s = i ? 1 : -1; e.children.forEach(c => c.scale.set(1.25, (m === 'happy' ? .35 : m === 'wide' ? 1.1 : .7) * Math.max(.06, b), .3)); e.rotation.z = m === 'angry' ? s * .4 : m === 'sly' ? s * -.25 : m === 'sad' ? s * -.35 : 0; e.position.x = s * .085 + (face.look || 0) * .03; e.position.y = .02 + (m === 'happy' ? .01 : 0); });
    return; }
  const b = face.noBlink ? 1 : blinkK(t, seed); const lx = (face.lookX || 0) * .022, ly = (face.lookY || 0) * .018;
  T.eyes.forEach((e, i) => { const s = i ? 1 : -1; e.position.set(s * .078 + lx, .015 + ly, .205); e.scale.setScalar(face.wide ? 1.25 : 1); });
  T.lids.forEach((l, i) => { const close = 1 - b; l.scale.y = .05 + close * 1.05 + (face.lid || 0); l.position.y = .055 - close * .03; });
  const ex = face.expr || 'calm';
  const BR = { calm: [0, 0], sad: [.35, .0], scared: [.4, .015], angry: [-.4, -.01], happy: [-.1, .01], determined: [-.3, -.008], surprised: [0, .025] }[ex] || [0, 0];
  T.brows.forEach((bw, i) => { const s = i ? 1 : -1; bw.rotation.z = Math.PI / 2 + s * BR[0]; bw.position.y = .085 + BR[1]; });
  const mo = clamp(face.mouth || 0); const smile = face.smile ?? (ex === 'happy' ? 1 : ex === 'calm' ? .4 : 0);
  T.mouthO.scale.set(lerp(.7, 1, mo), lerp(.15, 1.2, mo), .45); T.mouthO.visible = mo > .05 || smile < .2;
  T.mouthS.visible = mo < .3 && smile >= .2; T.mouthS.scale.set(lerp(.7, 1.2, smile), lerp(.4, 1, smile), 1);
}
export const blinkK = (t, seed = 1) => { const per = 2.4 + h1(seed) * 2.2, ph = (t + h1(seed + 7) * per) % per, d = .16; if (ph > d) return 1; return Math.abs(1 - 2 * ph / d); };

// тень-персонаж: приплюснутый двойник. yawG (поворот на земле) → holder (сплющивание по z, подъём) → root (поза, поворот фигуры).
// rise 0 — лежит на земле (голова к +z относительно yawG), 1 — стоит на стене. len — вытянутость тени.
export function makeShade() { const T = makeToy(LOOK.senya, { shadow: true }); const yawG = new THREE.Group(), holder = new THREE.Group(); yawG.add(holder); holder.add(T.root); return { ...T, holder: yawG, flat: holder }; }
export function placeShade(Sh, { x = 0, y = 0, z = 0, rise = 1, len = 1.3, yaw = 0, scale = 1, turn = 0, op = .92 }) {
  Sh.holder.position.set(x, y + .004, z); Sh.holder.rotation.set(0, yaw, 0);
  Sh.flat.rotation.set((1 - rise) * Math.PI / 2, 0, 0); Sh.flat.scale.set(scale, scale * lerp(len, 1, rise), .03 * scale);
  Sh.root.rotation.y = turn; Sh.root.position.z = 0;
  Sh.holder.visible = op > 0.01; Sh.root.traverse(o => { if (o.isMesh && o.material.transparent) o.material.opacity = o.material.color && o.material.color.r < .1 ? op : 1; });
}

// растворение героя: sat 0…1 (обесцвечивание), alpha — прозрачность, cast — отбрасывает ли настоящую тень
export function setFade(T, sat = 1, alpha = 1, cast = false) {
  T.root.traverse(o => { if (!o.isMesh) return; const m = o.material; if (!m.color) return; if (!m.userData.c0) m.userData.c0 = m.color.clone();
    if (m.emissive) m.emissiveIntensity = 0;
    const c = m.userData.c0, g = c.r * .3 + c.g * .59 + c.b * .11; m.color.setRGB(lerp(g, c.r, sat) * lerp(1.15, 1, sat), lerp(g, c.g, sat) * lerp(1.15, 1, sat), lerp(g, c.b, sat) * lerp(1.25, 1, sat));
    const tr = alpha < .999; if (m.alphaHash !== tr) { m.alphaHash = tr; m.needsUpdate = true; } m.transparent = false; m.opacity = alpha; o.castShadow = cast; });
}
