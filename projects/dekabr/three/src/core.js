// DECEMBER 3D — «уютная игрушечная диорама»: three.js, тёплые окна и гирлянды (emissive + блум), мягкие тени, туман глубины,
// снег частицами, боке переднего плана. Поверх — 2D-титры (text-fit).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
export { THREE };
export const W = 720, H = 1280;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ss = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
export const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
export const eo = k => 1 - (1 - clamp(k)) ** 3;
export const back = (k, c = 1.7) => { k = clamp(k); return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
export const key = (u, ks) => { if (u <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (u < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, eio((u - a) / (b - a))); } return ks[ks.length - 1][1]; };

export const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(38, W / H, .05, 300);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
export const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .9, .55, .82);
composer.addPass(bloom); composer.addPass(new OutputPass());
// итоговый 2D-холст: 3D + титры
export const out = document.getElementById('c'); out.width = W; out.height = H; const ox = out.getContext('2d');
export const ov = document.createElement('canvas'); ov.width = W; ov.height = H; export const vx = ov.getContext('2d');

// ---------- материалы
const MC = {};
export const mat = (color, o = {}) => { const k = color + JSON.stringify(o); return MC[k] || (MC[k] = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? .75, metalness: o.m ?? 0, emissive: new THREE.Color(o.e || '#000000'), emissiveIntensity: o.ei ?? 1, transparent: !!o.op, opacity: o.op ?? 1 })); };
export const glow = (color, i = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(i), toneMapped: false });
export const mesh = (geo, m, cast = true, recv = true) => { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = recv; return o; };
export const G = {
  sph: (r, s = 20) => new THREE.SphereGeometry(r, s, Math.round(s * .7)), box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (a, b, h, s = 20) => new THREE.CylinderGeometry(a, b, h, s), cone: (r, h, s = 20) => new THREE.ConeGeometry(r, h, s),
  cap: (r, l, s = 12) => new THREE.CapsuleGeometry(r, l, 4, s), tor: (r, t, s = 24) => new THREE.TorusGeometry(r, t, 10, s), plane: (w, h) => new THREE.PlaneGeometry(w, h),
};
export const grp = (...ch) => { const g = new THREE.Group(); ch.forEach(c => c && g.add(c)); return g; };
export const at = (o, x = 0, y = 0, z = 0, ry = 0, s = 1) => { o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); return o; };

// ---------- гирлянды: один InstancedMesh на весь мир; каждой лампочке — цвет и «включена ли»
export const BULB_COLS = ['#ffcf6a', '#ff5a4a', '#6ac8ff', '#8cf27a', '#ff9ad6'];
const MAXB = 6000; const bulbGeo = G.sph(.045, 8);
export const bulbs = new THREE.InstancedMesh(bulbGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), MAXB);
bulbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bulbs.count = 0; bulbs.frustumCulled = false; scene.add(bulbs);
export const BL = []; // {p: Vector3, col, grp: имя набора, i: порядковый номер, scale}
export const addBulb = (p, col, setName, i, s = 1) => BL.push({ p: p.clone(), col: new THREE.Color(col), set: setName, i, s });
const _m = new THREE.Matrix4(), _c = new THREE.Color();
// on(set, i) → яркость 0..1
export function updateBulbs(on, visibleSets) {
  let n = 0;
  for (const b of BL) { if (!visibleSets.has(b.set)) continue; const k = on(b.set, b.i); _m.makeScale(b.s, b.s, b.s); _m.setPosition(b.p); bulbs.setMatrixAt(n, _m);
    _c.copy(b.col).multiplyScalar(k > .05 ? 2.6 * k : .08); bulbs.setColorAt(n, _c); n++; }
  bulbs.count = n; bulbs.instanceMatrix.needsUpdate = true; if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
}
// гирлянда по кривой
export function stringLights(set, pts, n, sag = .15, cols = BULB_COLS, s = 1) {
  const curve = []; for (let i = 0; i < n; i++) { const k = i / (n - 1), seg = k * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(seg)), f = seg - j;
    const p = new THREE.Vector3().lerpVectors(pts[j], pts[j + 1], f); p.y -= Math.sin(f * Math.PI) * sag; addBulb(p, cols[i % cols.length], set, i, s); curve.push(p); }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve), n * 2, .008, 4, false); return mesh(geo, mat('#222'), false, false);
}

// ---------- снег (частицы, детерминированно)
const NSN = 2500; const snowGeo = new THREE.BufferGeometry(); const snowPos = new Float32Array(NSN * 3); snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const snowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
export const softTex = snowTex;
export const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: .07, map: snowTex, transparent: true, depthWrite: false, color: '#ffffff' }));
snow.frustumCulled = false; scene.add(snow);
export function updateSnow(t, box, speed = .6, dens = 1) {
  const [cx, cy, cz, sx, sy, sz] = box; const n = Math.floor(NSN * dens);
  for (let i = 0; i < NSN; i++) { if (i >= n) { snowPos[i * 3 + 1] = -999; continue; }
    const fx = hash(i * 1.3), fz = hash(i * 2.7), fy = hash(i * 4.1), sp = speed * (.6 + hash(i * 5.3) * .8);
    snowPos[i * 3] = cx + (fx - .5) * sx + Math.sin(t * .7 + i) * .15; snowPos[i * 3 + 2] = cz + (fz - .5) * sz + Math.cos(t * .6 + i) * .1;
    snowPos[i * 3 + 1] = cy + sy / 2 - (((fy * sy) + t * sp) % sy); }
  snowGeo.attributes.position.needsUpdate = true;
}

// ---------- кадр
export const FRAME = { exposure: 1, bloom: .9, fade: 1, vig: .35 };
export function present(drawOverlay, t) {
  renderer.toneMappingExposure = FRAME.exposure; bloom.strength = FRAME.bloom;
  composer.render();
  ox.globalAlpha = 1; ox.drawImage(glCanvas, 0, 0);
  // виньетка
  const g = ox.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,5,20,${FRAME.vig})`); ox.fillStyle = g; ox.fillRect(0, 0, W, H);
  vx.setTransform(1, 0, 0, 1, 0, 0); vx.clearRect(0, 0, W, H); drawOverlay && drawOverlay(vx, t); ox.drawImage(ov, 0, 0);
  if (FRAME.fade < 1) { ox.fillStyle = `rgba(0,0,0,${1 - FRAME.fade})`; ox.fillRect(0, 0, W, H); }
}
window.grab = () => ox.getImageData(0, 0, W, H).data;
