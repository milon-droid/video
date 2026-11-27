// «ХОЛОД» (COLD) — хоррор от первого лица через тепловизор. Монтаж, камера, интерфейс, субтитры.
import { THREE, scene, camera, renderer, POST, AMB, renderThermal, readT, ctx, out, glCanvas, W, H, K, project, ironbowCSS,
  clamp, lerp, win, sm, ease, inoutE, outE, noise, h1, V3, setHeat, tMat, mesh, G } from './core.js';
import { buildSet, S, steam } from './set.js';
import { makeHuman, poseHuman, makeDog, poseDog } from './rig.js';
import LINES from '../vo/lines.json';
import DUR from '../vo/durations.json';

buildSet();
// --- персонажи ---
const dog = makeDog(0); scene.add(dog.g);
const me = makeHuman({ cold: true, device: true }, 1); scene.add(me.g);   // «я» — только в отражениях (слой 1)
const ghost = makeHuman({ cold: true }, 0); scene.add(ghost.g);
const holeM = tMat({ T: -40, nz: 0, fres: 0, heatK: 0 }); const holes = [0, 1, 2].map(i => { const m = mesh(G.sph(i < 2 ? .026 : .032, 12), holeM); ghost.g.add(m); return m; });
const jess = makeHuman({ longHair: true, dress: true, cloth: 30.5, short: true, slim: true }, 0); scene.add(jess.g);
// Джесс в кровати: голова на подушке, волосы, рука поверх одеяла
const jb = new THREE.Group(); scene.add(jb);
const jbHead = mesh(G.sph(.105, 18), tMat({ T: 35.2, nz: .2, nzs: 9, fres: .6, heatK: 0 })); jbHead.scale.set(1.12, .95, 1); jbHead.position.set(-2.13, .76, -7.0); jb.add(jbHead);
const jbHair = mesh(G.sph(.15, 16), tMat({ T: 27.4, nz: .5, nzs: 12, fres: .6, heatK: 0 })); jbHair.scale.set(1.1, .55, 1.25); jbHair.position.set(-2.25, .73, -7.06); jb.add(jbHair);
const jbEye = mesh(G.sph(.017, 10), tMat({ T: 36.7, nz: 0, heatK: 0 })); jbEye.position.set(-2.08, .79, -6.92); jb.add(jbEye);
const armM = tMat({ T: 33.4, nz: .2, nzs: 9, fres: .6, heatK: 0 });
const jbArm = mesh(new THREE.CapsuleGeometry(.04, .32, 4, 10), armM); jbArm.position.set(-1.68, .73, -6.72); jbArm.rotation.set(Math.PI / 2, 0, .9); jbArm.rotation.order = 'YXZ'; jb.add(jbArm);
const jbHand = mesh(G.sph(.048, 12), tMat({ T: 33.8, nz: .2, heatK: 0 })); jbHand.scale.set(1, .5, 1.2); jbHand.position.set(-1.5, .72, -6.55); jb.add(jbHand);
// рука «я» на переднем плане (слой 0, привязана к камере)
const fh = new THREE.Group(); camera.add(fh); scene.add(camera);
const handM = tMat({ T: 4.1, nz: .15, nzs: 14, fres: .35, heatK: 0 });
const fhArm = mesh(G.cyl(.03, .042, .5, 12), handM); fh.add(fhArm);
const fhPalm = mesh(G.sph(.05, 16), handM); fhPalm.scale.set(.85, 1, .36); fh.add(fhPalm);
const FL = [.05, .068, .076, .07, .055]; const fhF = FL.map((L, i) => { const m = mesh(new THREE.CapsuleGeometry(i === 0 ? .012 : .0095, L, 4, 8), handM); fh.add(m); return m; });
fh.visible = false;

// --- монтаж: длительность плана = реплики + запас (реплики из durations.json) ---
const D = id => DUR[id] ?? 2.5;
const SHOTS = [
  { id: 'H', lines: ['l01'], lead: .5, tail: .45, min: 3.2 },
  { id: 'A', lines: ['l02'], lead: .45, tail: .5, min: 4.2 },
  { id: 'B', lines: ['l03'], lead: .35, tail: .65, min: 2.4 },
  { id: 'C', lines: ['l04', 'l05'], lead: .2, gap: .35, tail: .45, min: 4.6 },
  { id: 'D', lines: ['l06'], lead: .3, tail: .6, min: 5 },
  { id: 'E', lines: ['l07'], lead: .3, tail: .7, min: 3 },
  { id: 'F', lines: ['l08'], lead: .4, tail: .7, min: 5 },
  { id: 'G', lines: ['l09', 'l09c'], lead: .4, gap: .5, tail: 1.0, min: 7 },
  { id: 'I', lines: ['l10'], lead: .55, tail: .8, min: 3.8 },
  { id: 'J', lines: ['l11'], lead: .4, tail: 1.1, min: 4 },
  { id: 'Kk', lines: ['l12'], lead: .35, tail: .5, min: 3.4 },
  { id: 'L', lines: ['l13'], lead: .3, tail: .9, min: 2.6 },
  { id: 'M', lines: ['l14'], lead: .25, tail: 1.3, min: 2.8 },
  { id: 'N', lines: ['l15'], lead: 1.1, tail: .7, min: 3.6 },
  { id: 'O', lines: ['l16'], lead: .55, tail: .5, min: 3.6 },
  { id: 'P', lines: ['l17'], lead: 1.4, tail: .5, min: 3.8 },
  { id: 'Q', lines: [], min: 2.95 },
];
let T0 = 0; const VO = [];
for (const s of SHOTS) {
  let t = s.lead || 0; s.t0 = T0;
  s.lines.forEach((id, i) => { if (i) t += s.gap || .3; VO.push({ id, t: T0 + t, d: D(id), text: LINES.lines.find(l => l.id === id).text, role: LINES.lines.find(l => l.id === id).role }); s['v' + i] = t; t += D(id); });
  s.d = Math.max(s.min, t + (s.tail || 0)); T0 += s.d;
}
export const TOTAL = T0;
window.VO_TIMELINE = VO; window.SHOTS = SHOTS.map(s => ({ id: s.id, t0: s.t0, d: s.d }));
const SH = Object.fromEntries(SHOTS.map(s => [s.id, s]));
// NUC: камера калибруется — кадр замирает, щелчок, серое поле
const QS = 2.2; // финал: ложный конец «03:14», затем внезапный скример
// подсознательные вспышки силуэта (план, локальное время; отрицательное — от конца плана) и короткие сбои картинки
const MICRO = [8.9, 17.3, 23.6, 29.0, 35.8, 41.2, 50.0, 62.3]; // короткие сбои картинки (с)
const GFL = [['C', .95], ['E', -.65], ['F', .9], ['G', 2.2]];
const NUC = [SH.B.t0 + .35, SH.F.t0 + .15];

// --- камера «с рук» ---
let shakeK = 1;
function cam(p, look, t, { shake = 1, fov = 56, roll = 0, walk = 0, ph = 0 } = {}) {
  const s = shake * shakeK, bob = walk * Math.sin(ph) * .018, sway = walk * Math.sin(ph / 2) * .012;
  camera.position.set(p.x + noise(1, t * .6) * .008 * s + sway, p.y + noise(2, t * .55) * .006 * s + bob, p.z + noise(3, t * .5) * .008 * s);
  camera.lookAt(look.x + noise(4, t * .8) * .025 * s, look.y + noise(5, t * .7) * .02 * s + bob * .5, look.z + noise(6, t * .75) * .025 * s);
  camera.rotateZ(roll + noise(7, t * .4) * .012 * s + walk * Math.sin(ph / 2) * .01);
  camera.fov = fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
}
const L3 = (a, b, k) => a.clone().lerp(b, k);
// «я» в отражении повторяет камеру: голова за камерой, корпус по направлению взгляда
function syncMe(t, ph = 0, walkAmp = 0, armL = null, o = {}) {
  const f = new THREE.Vector3(); camera.getWorldDirection(f); const yaw = Math.atan2(f.x, f.z);
  const fh2 = V3(Math.sin(yaw), 0, Math.cos(yaw));
  const pos = camera.position.clone().addScaledVector(fh2, -.12).setY(0);
  me.dev.visible = false; me.lens.visible = false;
  poseHuman(me, { pos, yaw, headPitch: o.pitch || 0, headRoll: o.roll || 0, walk: ph, walkAmp, t: 0, armR: null, armL: armL || null });
}
// СКРИМЕР: дёргающееся лицо в упор, рот вывихнут, руки тянутся к объективу, палитра мигает (w — время от начала удара)
function screamer(w, p, u, len = .55) {
  hideAll(); me.g.visible = false; dog.g.visible = false; jb.visible = false; jess.g.visible = false; ghost.g.visible = true;
  cam(p, p.clone().add(V3(0, .12, -2)), u, { fov: 50, shake: 6 });
  const jt = (a, f) => noise(a, w * f + p.z * 3);
  const gz = lerp(-8.25, -7.95, clamp(w / .12)) + (p.z + 7.32);
  const pr = poseHuman(ghost, { pos: V3(p.x + jt(1, 30) * .03, 0, gz), yaw: jt(2, 26) * .25, t: 0, headRoll: .3 + jt(3, 34) * .28, headPitch: -.25 + jt(4, 29) * .25, lean: 0,
    armL: V3(p.x - .3 + jt(5, 20) * .05, 1.6, p.z - .28), armR: V3(p.x + .3 + jt(6, 22) * .05, 1.52, p.z - .28) });
  ghost.balls.head.scale.set(.86, 1.55, 1.0); ghost.balls.hairCap.visible = false;
  holes[0].position.copy(pr.hp2(-.034, .05, .085)); holes[1].position.copy(pr.hp2(.034, .044, .085)); holes[2].position.copy(pr.hp2(0, -.12, .07));
  holes[0].scale.set(.9, 1.5, .9); holes[1].scale.set(.8, 1.3, .9); holes[2].scale.set(1.0, 3.6 + jt(7, 40) * .6, .8);
  const on = w < len;
  return { lo: 3, hi: 28, iso: 9, isoK: 1, pal: Math.floor(w * 18) % 3 === 1 ? 1 : 0, zoom: 1.0 + w * .5 + (Math.floor(w * 24) % 2) * .06, glitch: .55 + (Math.floor(w * 20) % 2) * .4, fade: on ? 1 : 0, hudA: on ? 1 : 0, scream: 1 };
}
function ghostFlash(id, u, s, pos, yaw, roll = .5) {
  for (const [sid, tt] of GFL) if (sid === id) { const a = tt < 0 ? s.d + tt : tt; if (u >= a && u < a + .1) { ghost.g.visible = true; poseHuman(ghost, { pos, yaw, t: 0, headRoll: roll }); holes.forEach(m => m.scale.setScalar(.01)); return true; } }
  return false;
}
function hideAll() { ghost.g.visible = false; ghost.balls.head.scale.set(.93, 1.05, 1.0); ghost.balls.hairCap.visible = true; me.g.visible = true; jess.g.visible = false; jb.visible = true; dog.g.visible = true; fh.visible = false; }
const DOG_A = V3(2.0, 0, -1.15), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
function bedHeat(t, on = 1) {
  S.bodyHeat.forEach(([x, z, r], i) => setHeat(2 + i, x, .62, z, r * 1.7, 31.6 + Math.sin(t * 1.5) * .2));
  setHeat(7, -1.5, .58, -6.15, .45, 8.6);
  jbHead.position.y = .76 + Math.sin(t * 1.5) * .003;
}
// рука на переднем плане: k — 0 (внизу) … 1 (перед объективом), spread пальцев
function poseHand(k, t) {
  fh.visible = k > .001;
  const y = lerp(-.5, -.075, outE(k)), x = -.075 + (1 - k) * .03, z = -.56;
  const tr = noise(31, t * 9) * .004 * k; // дрожь
  fhArm.position.set(x - .03, y - .3, z + .06); fhArm.rotation.set(-.2, 0, .12);
  fhPalm.position.set(x + tr, y, z); fhPalm.rotation.set(0, 0, .08);
  // пальцы веером: [смещение x, y основания, угол]
  const base = [[-.042, -.012, .95], [-.03, .045, .2], [-.01, .05, .06], [.011, .048, -.06], [.03, .04, -.22]];
  fhF.forEach((m, i) => { const [bx, by, a] = base[i]; const L = FL[i] + .02; const ca = a + .08;
    m.position.set(x + tr + bx - Math.sin(ca) * L * .5, y + by + Math.cos(ca) * L * .5, z + .003); m.rotation.set(0, 0, ca); });
}

// ===== ПЛАНЫ =====
const SHOT = {
  H(u, s) { // хук: короткий скример (0,38 с) → собака в упор смотрит в объектив; в зеркале — холодная фигура, которая вдруг склоняет голову
    if (u < .38) { const o = screamer(u, V3(2.0, 1.6, -7.32), u, .38); o.hook = 0; return o; }
    hideAll(); jb.visible = false;
    const p = V3(1.86, .82, -6.75 + u * .04); cam(p, V3(1.97, 1.12, -8.97), u, { fov: 54, shake: 1 + (u > 2.76 && u < 2.98 ? 3 : 0) });
    const jerk = u > 2.78 ? .55 + noise(9, u * 3) * .05 : 0;
    syncMe(u, 0, 0, null, { roll: jerk });
    const dp = V3(1.78, 0, -8.55); poseDog(dog, { pos: dp, yaw: yawTo(dp, p), t: u + 5, growl: .8, headYaw: 0, look: -.3 });
    const gl = u < .5 ? .9 * (1 - (u - .38) / .12) : (u > 2.76 && u < 2.9) ? .9 : 0;
    return { lo: 4, hi: 40, iso: 9, isoK: 1, zoom: 1.04 + u * .015, glitch: gl, hook: 1 };
  },
  A(u, s) { // собака рычит в коридор
    hideAll(); jb.visible = false;
    const k = u / s.d;
    cam(L3(V3(-.55, .7, -.3), V3(-.1, .66, -.55), sm(k)), V3(2.1, .55, -1.9), u, { fov: 58 });
    poseDog(dog, { pos: DOG_A, yaw: Math.PI + noise(9, u * .5) * .05, t: u + 10, growl: .55 + .45 * ease(u, .3, 1.6) });
    steam(S.steam, u + 3, V3(-1.3, .53, .45));
    return { lo: 16, hi: 39, spots: [[V3(2, 1.2, -4.5), null, 'corridor']] , clock: 1 };
  },
  B(u, s) { // включение камеры: белый-горячий → ironbow
    hideAll(); jb.visible = false;
    cam(V3(-.4, 1.5, .6), V3(1.9, .55, -1.6), u, { fov: 58 });
    poseDog(dog, { pos: DOG_A, yaw: Math.PI, t: u + 20, growl: 1 });
    steam(S.steam, u + 8, V3(-1.3, .53, .45));
    return { lo: 16, hi: 39, pal: 1 - ease(u, 1.25, 1.45), boot: u, fade: ease(u, 0, .25) };
  },
  C(u, s) { // «живое светится» — собака крупно; «холодное — тёмное» — окно
    hideAll(); jb.visible = false;
    const tw = s.v1 - .25, k = ease(u, tw, tw + .9, inoutE);
    const dogHead = V3(1.93, .66, -1.58);
    cam(L3(V3(.35, .74, -2.3), V3(.5, 1.35, -1.6), k), L3(dogHead.clone().add(V3(0, -.12, 0)), V3(-1.0, 1.4, -2.5), k), u, { fov: lerp(44, 58, k) });
    poseDog(dog, { pos: DOG_A, yaw: Math.PI, t: u + 30, growl: .9 - ease(u, 0, 1.2) * .5, headYaw: ease(u, .5, 1.3) * .8, look: -.08 });
    steam(S.steam, u + 9, V3(-1.3, .53, .45));
    const spots = k < .5 ? [[dogHead.clone().add(V3(-.04, .02, .08)), 'eye', 'ALIVE']] : [[V3(-1.45, 1.25, -2.53), 'win', 'COLD']];
    ghostFlash('C', u, s, V3(2.75, 0, -.35), -2.2, .6);
    return { lo: 16, hi: 39, spots };
  },
  D(u, s) { // стекло отражает тепло: собака у окна и её отражение
    hideAll(); jb.visible = false;
    const w = ease(u, 0, 2.6), p0 = V3(1.6, 0, -1.3), p1 = V3(-.35, 0, -1.75), dp = L3(p0, p1, sm(w));
    const ph = sm(w) * 2.0 / .55 * Math.PI;
    poseDog(dog, { pos: dp, yaw: lerp(yawTo(p0, p1), -2.3, ease(u, 2.2, 3.2)), t: u + 40, walk: ph, walkAmp: 1 - ease(u, 2.0, 2.5), growl: .2, headYaw: ease(u, 2.4, 3.6) * .3, look: ease(u, 2.6, 3.4) * .25, wag: .3 });
    cam(V3(.9, 1.45, .7), V3(-.65, .95, -2.5), u, { fov: 52 });
    steam(S.steam, u + 12, V3(-1.3, .53, .45));
    return { lo: 16, hi: 39, rule: ease(u, s.v0 + 1.0, s.v0 + 1.5), ruleT: u - s.v0 - 1.0, refl: dp };
  },
  E(u, s) { // собака не идёт; камера поворачивает в коридор
    hideAll(); jb.visible = false;
    const k = ease(u, .5, s.d, inoutE);
    const dp = V3(-.55, 0, -1.85).lerp(V3(-.7, 0, -1.5), ease(u, .3, 1.6));
    poseDog(dog, { pos: dp, yaw: yawTo(dp, V3(1.5, 0, -1.3)), t: u + 50, growl: 1, walk: -ease(u, .3, 1.6) * 3, walkAmp: 1 - ease(u, 1.4, 1.7), look: .05 });
    const ph = k * 2.2 / .35 * Math.PI;
    cam(L3(V3(.6, 1.6, .2), V3(1.95, 1.6, -2.4), k), L3(V3(-.6, .55, -1.7), V3(2.0, 1.3, -7), sm(clamp(k * 1.3))), u, { fov: 56, walk: k > .05 ? 1 : 0, ph });
    steam(S.steam, u + 15, V3(-1.3, .53, .45));
    ghostFlash('E', u, s, V3(2.0, 0, -8.45), Math.PI, .4);
    return { lo: lerp(14, 6, k), hi: lerp(40, 36, k) };
  },
  F(u, s) { // коридор: холодно, следы, ладони на стене
    hideAll(); dog.g.visible = false; jb.visible = false;
    const k = u / s.d, z = lerp(-2.6, -4.2, sm(k)), ph = (z + 2.6) / -.35 * Math.PI;
    const look1 = V3(2.05, 0, z - 1.2), look2 = V3(2.6, 1.2, z - 1.5);
    const tl = ease(u, s.v0 + 1.4, s.v0 + 2.3, inoutE);
    const look = tl > 0 ? L3(look1, look2, tl) : L3(V3(2.0, 1.4, -8), look1, ease(u, .2, 1.4, inoutE));
    cam(V3(2.0 - tl * .12, 1.6, z), look, u, { fov: 56, walk: .7, ph });
    const minT = lerp(14.8, 11.2, k);
    ghostFlash('F', u, s, V3(2.0, 0, -6.9), Math.PI, .7);
    return { lo: 6, hi: 36, minT, temp: 1 };
  },
  G(u, s) { // спальня: Джесс спит, моя половина холодная… и свеча на моей тумбочке
    hideAll(); dog.g.visible = false; bedHeat(u);
    const k = ease(u, 0, s.v1 - .2), pan = ease(u, s.v1 - .4, s.v1 + .6, inoutE);
    const look = L3(L3(V3(-1.6, .55, -6.6), V3(-1.8, .55, -6.62), k), V3(-2.3, .66, -5.42), pan);
    cam(L3(V3(.5, 1.7, -6.45), V3(.15, 1.66, -6.55), sm(k)), look, u, { fov: lerp(58, 46, pan) });
    S.flame.scale.set(1, 1.8 + noise(4, u * 9) * .3, 1);
    const spots = pan < .5 ? [[V3(-2.1, .79, -6.95), 'jess', null]] : [[V3(-2.3, .72, -5.4), 'flame', '?']];
    if (pan < .5 && u > s.v0 + 1.6) spots.push([V3(-1.5, .58, -6.15), 'cold', null]);
    ghostFlash('G', u, s, V3(-2.4, 0, -7.45), Math.PI / 2 + .2, .6);
    return { lo: 8, hi: 38, spots };
  },
  I(u, s) { // в конце коридора — фигура
    hideAll(); dog.g.visible = false; bedHeat(u);
    const k = ease(u, .25, .75, inoutE);
    const p = V3(1.75 + k * .25, 1.6, -6.15 - k * .05);
    const look = L3(V3(-1.2, .7, -6.5), V3(2.0, 1.45, -8.97), k);
    cam(p, look, u, { fov: 52, shake: 1.6 }); syncMe(u);
    return { lo: 3, hi: 36, iso: 9, isoK: ease(u, .9, 1.3), zoom: 1 + ease(u, 1.2, 2.2, inoutE) * .9, heart: 1 };
  },
  J(u, s) { // «не двигалось, пока не двинулся я»
    hideAll(); dog.g.visible = false; bedHeat(u);
    const st = ease(u, s.v0 + .9, s.v0 + 1.5) + ease(u, s.v0 + 2.1, s.v0 + 2.7);
    const z = -6.2 - st * .45, ph = st * Math.PI;
    cam(V3(2.0, 1.6, z), V3(2.0, 1.45, -8.97), u, { fov: 52, walk: (st % 1 > .02 && st % 1 < .98) ? 1 : 0, ph, shake: 1.3 }); syncMe(u, ph, (st % 1 > .02 && st % 1 < .98) ? 1 : 0);
    return { lo: 3, hi: 36, iso: 9, isoK: 1, zoom: 1.9 - ease(u, 0, 1, inoutE) * .5, heart: 1 };
  },
  Kk(u, s) { // «стекло отражает тепло» — рамка зеркала
    hideAll(); dog.g.visible = false; bedHeat(u);
    const k = ease(u, 0, s.d, inoutE);
    cam(V3(2.0, 1.6, -7.15 - k * .15), V3(2.0 + Math.sin(u * 1.2) * .08, 1.6 - k * .15, -8.97), u, { fov: lerp(60, 54, k), shake: 1.2 }); syncMe(u);
    return { lo: 3, hi: 36, iso: 9, isoK: 1, zoom: 1, frame: ease(u, s.v0 + .7, s.v0 + 1.1), heart: 1 };
  },
  L(u, s) { // поднимаю руку
    hideAll(); dog.g.visible = false; bedHeat(u);
    const hk = ease(u, s.v0 + .2, s.v0 + 1.4, inoutE);
    cam(V3(2.0, 1.6, -7.32), V3(2.0, 1.55, -8.97), u, { fov: 54, shake: 1.1 });
    poseHand(hk, u);
    const hw = fhPalm.getWorldPosition(V3());
    syncMe(u, 0, 0, hk > .05 ? hw.clone().add(V3(0, -.05, .04)) : null);
    return { lo: 3, hi: 36, iso: 9, isoK: 1, heart: 1 - ease(u, 1, 2) * .5 };
  },
  M(u, s) { // «значит, это я»
    hideAll(); dog.g.visible = false; bedHeat(u);
    cam(V3(2.0, 1.6, -7.32), V3(2.0, 1.55, -8.97), u, { fov: 54 - u * .8, shake: .9 });
    poseHand(1, u); const hw = fhPalm.getWorldPosition(V3()); syncMe(u, 0, 0, hw.clone().add(V3(0, -.05, .04)));
    return { lo: 3, hi: 36, iso: 9, isoK: 1, spots: [[hw.clone(), 'hand', null]], heart: 0 };
  },
  N(u, s) { // в зеркале за спиной — Джесс
    hideAll(); dog.g.visible = false; jb.visible = false; jess.g.visible = true;
    const hk = 1 - ease(u, .1, .8);
    cam(V3(2.0, 1.6, -7.32), V3(2.0, 1.55, -8.97), u, { fov: 52 - u * .5, shake: 1 });
    poseHand(hk, u); const hw = fhPalm.getWorldPosition(V3()); syncMe(u, 0, 0, hk > .05 ? hw.clone().add(V3(0, -.05, .04)) : null);
    const w = ease(u, .2, 1.6), jp = L3(V3(1.05, 0, -6.15), V3(1.85, 0, -5.85), sm(w));
    poseHuman(jess, { pos: jp, yaw: lerp(Math.PI / 2, Math.PI, ease(u, .6, 1.6)), t: u, walk: sm(w) * .8 / .3 * Math.PI, walkAmp: 1 - ease(u, 1.3, 1.6), headYaw: 0,
      armR: u > 1.8 ? null : null, scale: .96 });
    return { lo: 3, hi: 36, iso: 9, isoK: 1, heart: ease(u, .8, 1.4) };
  },
  O(u, s) { // разворот: Джесс и собака смотрят на меня
    hideAll(); dog.g.visible = true; jb.visible = false; jess.g.visible = true;
    const k = ease(u, 0, .45, inoutE);
    const yaw = lerp(Math.PI, 0, k) + noise(11, u * 2) * .02; // смотрю -z → +z
    const p = V3(2.0, 1.6, -7.32);
    cam(p, p.clone().add(V3(Math.sin(yaw) * 2.2, -.75 * k - .3 * Math.sin(k * Math.PI), Math.cos(yaw) * 2.2)), u, { fov: 50, shake: 1.5 + (1 - k) * 2 });
    syncMe(u);
    const jp = V3(1.78, 0, -4.35).lerp(V3(1.72, 0, -3.95), ease(u, 1.2, 2.2));
    const pr = poseHuman(jess, { pos: jp, yaw: Math.PI + .1, t: u, headPitch: .05, walk: -ease(u, 1.2, 2.2) * 2, walkAmp: ease(u, 1.1, 1.3) * (1 - ease(u, 2.0, 2.3)), scale: .96 });
    poseHuman(jess, { pos: jp, yaw: Math.PI + .1, t: u, headPitch: .05, walk: -ease(u, 1.2, 2.2) * 2, walkAmp: ease(u, 1.1, 1.3) * (1 - ease(u, 2.0, 2.3)), scale: .96,
      armL: pr.chest.clone().add(V3(.1, -.08, -.14)) });
    const dp = V3(2.02, 0, -5.1);
    poseDog(dog, { pos: dp, yaw: yawTo(dp, p) + noise(12, u) * .04, t: u + 60, growl: 1, headYaw: 0, look: -.38 });
    return { lo: 3, hi: 40, iso: 9, isoK: 1, breathDog: 1 };
  },
  P(u, s) { // лай → сбой → темнота
    hideAll(); dog.g.visible = true; jb.visible = false; jess.g.visible = true;
    const p = V3(2.0, 1.6, -7.32), bark = (a) => Math.max(0, Math.sin(clamp((u - a) / .32) * Math.PI));
    const bk = bark(.35) + bark(.85) + bark(1.25);
    shakeK = 1 + bk * 2;
    cam(p, V3(2.0, .75, -4.2), u, { fov: 48, shake: 1.6 }); shakeK = 1; syncMe(u);
    const dp = V3(2.02, 0, -5.1).lerp(V3(2.0, 0, -5.25), ease(u, .3, .6));
    poseDog(dog, { pos: dp, yaw: yawTo(dp, p), t: u + 70, growl: 1, bark: bk, headYaw: 0, look: -.4 });
    const pr = poseHuman(jess, { pos: V3(1.72, 0, -3.95), yaw: Math.PI + .1, t: u, scale: .96 });
    poseHuman(jess, { pos: V3(1.72, 0, -3.95), yaw: Math.PI + .1, t: u, scale: .96, armL: pr.chest.clone().add(V3(.1, -.08, -.14)) });
    return { lo: 3, hi: 40, iso: 9, isoK: 1, glitch: clamp(bk * .6), bark: bk, breathDog: 1 };
  },
  Q(u, s) { // разворот к зеркалу: МОЕГО отражения нет, пусто. Тишина. Затемнение, «03:14» — будто конец… и вдруг лицо в упор (СКРИМЕР)
    hideAll(); me.g.visible = false; dog.g.visible = false; jb.visible = false; jess.g.visible = false;
    const p = V3(2.0, 1.6, -7.32);
    if (u < QS) {
      const k = ease(u, 0, .35, inoutE), yaw = lerp(0, Math.PI, k);
      cam(p.clone().add(V3(0, 0, -ease(u, .35, 1.3) * .2)), p.clone().add(V3(Math.sin(yaw) * 2, -.2 * (1 - k), Math.cos(yaw) * 2)), u, { fov: 54, shake: 1 + (1 - k) * 3 });
      const fo = ease(u, 1.1, 1.3);
      return { lo: 3, hi: 28, iso: 9, isoK: 1, fade: 1 - fo, end: u > 1.3 ? u - 1.3 + 1.0 : -1, hudA: 1 - fo };
    }
    return screamer(u - QS, p, u);
  },
};

// ===== ИНТЕРФЕЙС ТЕПЛОВИЗОРА =====
const MONO = '"Plex", monospace', BIG = '"Osw", sans-serif', HOOK = '"Hook", sans-serif';
const k2 = v => v * K;
function txt(s, x, y, size, { font = MONO, w = 700, color = '#fff', align = 'left', base = 'alphabetic', shadow = true, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${w} ${k2(size)}px ${font}`; ctx.textAlign = align; ctx.textBaseline = base;
  if (shadow) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(s, k2(x) + k2(2), k2(y) + k2(2)); }
  ctx.fillStyle = color; ctx.fillText(s, k2(x), k2(y)); ctx.restore();
}
const fmt = v => (v == null || !isFinite(v)) ? '--.-' : v.toFixed(1);
function hud(t, st, tc) {
  const a = st.hudA ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = k2(3);
  // уголки видоискателя
  const cx0 = 50, cy0 = 175, cx1 = 1030, cy1 = 1500, L = 54;
  for (const [x, y, dx, dy] of [[cx0, cy0, 1, 1], [cx1, cy0, -1, 1], [cx0, cy1, 1, -1], [cx1, cy1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(k2(x + dx * L), k2(y)); ctx.lineTo(k2(x), k2(y)); ctx.lineTo(k2(x), k2(y + dy * L)); ctx.stroke(); }
  // REC + время
  const rec = Math.floor(t * 1.6) % 2 === 0;
  if (rec) { ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(k2(92), k2(222), k2(11), 0, 7); ctx.fill(); }
  txt('REC', 112, 233, 30); const ss = Math.floor(t + 7); txt(`03:14:${String(ss % 60).padStart(2, '0')}`, 1000, 233, 30, { align: 'right' });
  if (!st.hook) txt(st.pal > .5 ? 'WHITE HOT' : 'IRONBOW', 82, 280, 22, { w: 500, color: 'rgba(255,255,255,.85)' });
  if (!st.hook) txt(`ε0.95  ${(st.zoom || 1).toFixed(1)}x`, 1000, 280, 22, { w: 500, align: 'right', color: 'rgba(255,255,255,.85)' });
  // батарея
  ctx.strokeRect(k2(840), k2(203), k2(46), k2(22)); ctx.fillStyle = '#fff'; ctx.fillRect(k2(888), k2(209), k2(5), k2(10)); ctx.fillRect(k2(844), k2(207), k2(st.end > 0 ? 6 : 26), k2(14));
  // шкала температур
  const sx = 990, sy0 = 360, sy1 = 860;
  for (let i = 0; i < 100; i++) { ctx.fillStyle = ironbowCSS(1 - i / 99, st.pal || 0); ctx.fillRect(k2(sx), k2(sy0 + (sy1 - sy0) * i / 100), k2(22), k2((sy1 - sy0) / 100 + 1)); }
  ctx.strokeRect(k2(sx), k2(sy0), k2(22), k2(sy1 - sy0));
  txt(fmt(st.hi), sx + 11, sy0 - 14, 22, { align: 'center', w: 500 }); txt(fmt(st.lo), sx + 11, sy1 + 32, 22, { align: 'center', w: 500 });
  if (st.isoK > .01) { const yk = sy0 + (sy1 - sy0) * (1 - (st.iso - st.lo) / (st.hi - st.lo)); ctx.globalAlpha = a * st.isoK; ctx.fillStyle = '#5ff5e8'; ctx.beginPath(); ctx.moveTo(k2(sx - 6), k2(yk)); ctx.lineTo(k2(sx - 24), k2(yk - 10)); ctx.lineTo(k2(sx - 24), k2(yk + 10)); ctx.fill();
    if (!st.hook) txt(`ISOTHERM < ${st.iso.toFixed(1)}°C`, 82, 326, 24, { color: '#5ff5e8' }); ctx.globalAlpha = a; }
  // прицел и температура в центре
  if (!st.noCross) {
    const cx = 540, cy = 960, g = 16, l = 30; ctx.lineWidth = k2(3);
    ctx.beginPath(); ctx.moveTo(k2(cx - g - l), k2(cy)); ctx.lineTo(k2(cx - g), k2(cy)); ctx.moveTo(k2(cx + g), k2(cy)); ctx.lineTo(k2(cx + g + l), k2(cy));
    ctx.moveTo(k2(cx), k2(cy - g - l)); ctx.lineTo(k2(cx), k2(cy - g)); ctx.moveTo(k2(cx), k2(cy + g)); ctx.lineTo(k2(cx), k2(cy + g + l)); ctx.stroke();
    const cold = tc != null && tc < (st.iso ?? -99) && st.isoK > .5;
    txt(`${fmt(tc)}°C`, cx + 58, cy - 22, 40, { color: cold ? '#5ff5e8' : '#fff' });
    if (cold) txt('LOW', cx + 58, cy + 22, 24, { color: '#5ff5e8', w: 500 });
  }
  if (st.minT != null) txt(`MIN ${st.minT.toFixed(1)}°`, 82, 326, 24, { color: '#9fd8ff' });
  ctx.restore();
}
// точечный замер: маркер + значение (читается из той же температурной карты)
function spotMeter(p, label, a = 1) {
  const s = project(p); if (!s.ok) return; const v = readT(s.x / 1080, s.y / 1920);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = k2(3);
  const x = k2(s.x), y = k2(s.y), r = k2(14); ctx.beginPath(); ctx.moveTo(x - r * 1.8, y); ctx.lineTo(x - r * .6, y); ctx.moveTo(x + r * .6, y); ctx.lineTo(x + r * 1.8, y); ctx.moveTo(x, y - r * 1.8); ctx.lineTo(x, y - r * .6); ctx.moveTo(x, y + r * .6); ctx.lineTo(x, y + r * 1.8); ctx.stroke();
  ctx.restore();
  const cold = v != null && v < 10;
  txt(`${fmt(v)}°`, s.x + 34, s.y - 18, 34, { alpha: a, color: cold ? '#5ff5e8' : '#fff' });
  if (label) txt(label, s.x + 34, s.y + 18, 24, { alpha: a, w: 500, color: cold ? '#5ff5e8' : '#ffd36b' });
}
function bootScreen(u) {
  const a = 1 - ease(u, 1.15, 1.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(k2(160), k2(820), k2(760), k2(260)); ctx.restore();
  txt('IR·CAM  THERMAL 2.14', 540, 890, 34, { align: 'center', alpha: a });
  txt(u < .7 ? 'CALIBRATING SENSOR…' : 'SHUTTER  NUC  OK', 540, 950, 26, { align: 'center', w: 500, alpha: a, color: '#ffd36b' });
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = k2(3); ctx.strokeRect(k2(240), k2(990), k2(600), k2(34)); ctx.fillStyle = '#fff'; ctx.fillRect(k2(246), k2(996), k2(588 * ease(u, 0, 1.0)), k2(22)); ctx.restore();
}
function hookText(u, d) {
  const a = ease(u, .38, .46) * (1 - ease(u, d - .3, d - .05)); if (a <= 0) return;
  const pop = 1 + (1 - ease(u, .38, .6, outE)) * .1, jit = (u > 2.76 && u < 2.9) ? 6 : 0;
  ctx.save(); ctx.translate(k2(540 + jit), k2(430)); ctx.scale(pop, pop); ctx.translate(-k2(540), -k2(430));
  txt('never point', 540, 400, 150, { font: HOOK, w: 900, align: 'center', alpha: a });
  txt('it at a mirror.', 540, 545, 150, { font: HOOK, w: 900, align: 'center', alpha: a });
  ctx.restore();
}
function ruleCard(a, u, refl) {
  if (a <= 0) return;
  // стрелка от собаки к её отражению в стекле
  const sp = project(refl.clone().add(V3(0, .45, 0))), rp = project(V3(refl.x, .95, -2.53 - (refl.z + 2.53)).add(V3(0, 0, 0)));
  ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([k2(10), k2(8)]); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = k2(4);
  ctx.beginPath(); ctx.moveTo(k2(sp.x), k2(sp.y)); ctx.quadraticCurveTo(k2((sp.x + rp.x) / 2), k2(Math.min(sp.y, rp.y) - 160), k2(rp.x), k2(rp.y)); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  ctx.save(); ctx.globalAlpha = a * .8; ctx.fillStyle = '#000'; ctx.fillRect(k2(150), k2(380), k2(780), k2(170)); ctx.globalAlpha = a; ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = k2(3); ctx.strokeRect(k2(150), k2(380), k2(780), k2(170)); ctx.restore();
  txt('GLASS = MIRROR', 540, 455, 58, { font: BIG, align: 'center', alpha: a, color: '#ffd36b' });
  txt('for heat', 540, 515, 30, { align: 'center', alpha: a, w: 500 });
}
function mirrorFrame(a) {
  if (a <= 0) return;
  const c = [V3(1.56, .33, -8.95), V3(2.44, .33, -8.95), V3(2.44, 2.27, -8.95), V3(1.56, 2.27, -8.95)].map(project);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = k2(4); ctx.setLineDash([k2(16), k2(10)]); ctx.lineDashOffset = -a * 60;
  ctx.beginPath(); c.forEach((p, i) => i ? ctx.lineTo(k2(p.x), k2(p.y)) : ctx.moveTo(k2(p.x), k2(p.y))); ctx.closePath(); ctx.stroke(); ctx.restore();
  const top = c[3];
  txt('GLASS · REFLECTION', clamp(top.x, 120, 700), clamp(top.y - 24, 380, 1700), 30, { alpha: a, color: '#ffd36b' });
}
// субтитры «как скрытые титры»: чёрная плашка, слова появляются по голосу
function captions(t) {
  const v = VO.find(l => t >= l.t - .05 && t < l.t + l.d + .35); if (!v || v.id === 'l01') return;
  const words = v.text.split(' '), tot = v.text.length; let acc = 0; const shown = [];
  for (const w of words) { const at = v.t + (acc / tot) * v.d * .92; if (t >= at - .04) shown.push(w); acc += w.length + 1; }
  ctx.save(); ctx.font = `700 ${k2(46)}px ${MONO}`;
  const lines = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > k2(860)) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur);
  const lh = 62, y0 = 1250 - (lines.length - 1) * lh / 2; let idx = 0;
  const jess = v.role.includes('jess');
  lines.forEach((ln, li) => {
    const lw = ln.split(' '); const full = ctx.measureText(ln).width; let x = k2(540) - full / 2; const y = k2(y0 + li * lh);
    const vis = lw.filter((w, j) => idx + j < shown.length); idx += lw.length; if (!vis.length) return;
    const vw = ctx.measureText(vis.join(' ')).width;
    ctx.fillStyle = 'rgba(0,0,0,.82)'; ctx.fillRect(x - k2(14), y - k2(44), vw + k2(28), k2(60));
    ctx.fillStyle = jess ? '#ffd36b' : '#fff'; ctx.fillText(vis.join(' '), x, y);
  });
  ctx.restore();
}

// ===== КАДР =====
window.SCENE = { duration: TOTAL, fps: 30, width: W, height: H };
let fontsReady = null;
window.renderFrame = async T => {
  if (!fontsReady) fontsReady = Promise.all([new FontFace('Plex', 'url(fonts/ibm-plex-mono-latin-700-normal.woff2)', { weight: '700' }), new FontFace('Plex', 'url(fonts/ibm-plex-mono-latin-500-normal.woff2)', { weight: '500' }), new FontFace('Osw', 'url(fonts/oswald-latin-700-normal.woff2)', { weight: '700' }), new FontFace('Hook', 'url(fonts/Inter-Black.otf)', { weight: '900' })].map(f => f.load().then(ff => document.fonts.add(ff))));
  await fontsReady;
  // NUC: замирание кадра
  let t = T, nuc = 0; for (const n of NUC) if (T >= n && T < n + .38) { t = n; nuc = T > n + .27 ? 1 : 0; }
  const s = SHOTS.find(x => t >= x.t0 && t < x.t0 + x.d) || SHOTS[SHOTS.length - 1]; const u = t - s.t0;
  const st = SHOT[s.id](u, s) || {};
  scene.updateMatrixWorld();
  for (const m of MICRO) if (T >= m && T < m + .07) st.glitch = Math.max(st.glitch || 0, .55);
  POST.uLo.value = st.lo ?? 12; POST.uHi.value = st.hi ?? 37; POST.uPal.value = st.pal || 0; POST.uIso.value = st.iso ?? -100; POST.uIsoK.value = st.isoK || 0;
  POST.uTime.value = T; POST.uNuc.value = nuc; POST.uZoom.value = st.zoom || 1; POST.uGlitch.value = st.glitch || 0; POST.uFade.value = st.fade ?? 1; POST.uSeed.value = s.t0;
  AMB.value = st.lo != null ? (st.lo + 13) : 17;
  const tc = renderThermal();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(glCanvas, 0, 0);
  if (st.hook) hookText(u, s.d);
  if (st.spots) st.spots.forEach(([p, , lab]) => spotMeter(p, lab, ease(u, .3, .6)));
  if (st.rule) ruleCard(st.rule, st.ruleT, st.refl);
  if (st.frame) mirrorFrame(st.frame);
  if (st.boot != null) bootScreen(st.boot);
  if (st.end > .6) { st.hudA = 0; }
  if (st.scream) { /* скример: без табличек */ }
  hud(T, st, tc);
  if (st.end > .9) { // финальная табличка
    const a = ease(st.end, .9, 1.2);
    txt('03:14', 540, 900, 120, { font: BIG, align: 'center', alpha: a * (Math.floor(T * 2) % 2 ? 1 : .35), color: '#5ff5e8' });
  }
  captions(T);
};
