// «12 SHOTS» — мир видно только во вспышке. three.js: вспышка = прожектор у объектива с тенями (резкий контур тени за предметами),
// молния через окно, лампа — когда вернётся свет. 2D-компоновщик: вспышка держится в глазах и гаснет, остаточный след, зерно, виньетка, дата на кадре.
import * as THREE from 'three';
export { THREE };
export const W = 720, H = 1280, K = W / 1080;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const win = (t, a, b) => clamp((t - a) / (b - a));
export const sm = k => k * k * (3 - 2 * k);
export const outE = k => 1 - Math.pow(1 - k, 3);
export const inoutE = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const ease = (t, a, b, f = sm) => f(win(t, a, b));
export const h1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise = (seed, t) => { const i = Math.floor(t), f = t - i, a = h1(i + seed * 13.1), b = h1(i + 1 + seed * 13.1); return lerp(a, b, sm(f)) * 2 - 1; };
export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
export const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
export const camera = new THREE.PerspectiveCamera(62, W / H, .03, 40); scene.add(camera);

// --- свет ---
export const flash = new THREE.SpotLight(0xfff6ea, 0, 14, 1.15, .75, 2); flash.castShadow = true;
flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -.0006; flash.shadow.camera.near = .1; flash.shadow.radius = 1.5;
camera.add(flash); flash.position.set(-.05, .07, 0); camera.add(flash.target); flash.target.position.set(-.02, 0, -1);
export const lightning = new THREE.DirectionalLight(0xbcd2ff, 0); lightning.castShadow = true; lightning.shadow.mapSize.set(1024, 1024);
lightning.shadow.camera.left = -6; lightning.shadow.camera.right = 6; lightning.shadow.camera.top = 6; lightning.shadow.camera.bottom = -6; lightning.shadow.bias = -.0008;
scene.add(lightning); scene.add(lightning.target);
export const lamp = new THREE.PointLight(0xffd7a0, 0, 10, 2); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.001; scene.add(lamp);
export const moon = new THREE.HemisphereLight(0x3a4a6a, 0x050505, 0); scene.add(moon);

// --- материалы и текстуры ---
export function canvasTex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; }
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .75, metalness: 0, ...o });
export const mesh = (geo, m, cast = true, recv = true) => { const x = new THREE.Mesh(geo, m); x.castShadow = cast; x.receiveShadow = recv; return x; };
export const G = { box: (w, h, d) => new THREE.BoxGeometry(w, h, d), sph: (r, s = 32) => new THREE.SphereGeometry(r, s, Math.round(s * .75)), cyl: (a, b, h, s = 24) => new THREE.CylinderGeometry(a, b, h, s), plane: (w, h) => new THREE.PlaneGeometry(w, h), cap: (r, l, s = 16) => new THREE.CapsuleGeometry(r, l, 8, s) };

// --- 2D-компоновщик ---
export const out = document.getElementById('out'); out.width = W; out.height = H;
export const ctx = out.getContext('2d');
export const flashBuf = document.createElement('canvas'); flashBuf.width = W; flashBuf.height = H; const fctx = flashBuf.getContext('2d');
export const darkBuf = document.createElement('canvas'); darkBuf.width = W; darkBuf.height = H; const dctx = darkBuf.getContext('2d');
export function snap(target) { (target === 'flash' ? fctx : dctx).drawImage(glCanvas, 0, 0); }
// зерно: несколько заранее сделанных кадров шума
const GR = Array.from({ length: 6 }, (_, k) => { const c = document.createElement('canvas'); c.width = W / 2; c.height = H / 2; const g = c.getContext('2d'); const d = g.createImageData(c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (h1(i * .37 + k * 91.7) - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); return c; });
// flashAge: сек с последней вспышки (null — не было); afterK — сила остаточного следа
export function composite(t, { flashAge = null, dark = 1, grain = .16, vign = .6, shake = 0, stamp = null, expo = 1 } = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = dark; ctx.drawImage(darkBuf, 0, 0); ctx.globalAlpha = 1;
  if (flashAge != null && flashAge >= 0) {
    const hold = .09; const a = flashAge < hold ? 1 : Math.exp(-(flashAge - hold) / .32);
    if (a > .003) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * expo; ctx.drawImage(flashBuf, 0, 0); ctx.globalAlpha = 1; }
    // остаточный след на сетчатке: размытый, зеленовато-лиловый, гаснет дольше
    const af = flashAge > .15 ? .12 * Math.exp(-(flashAge - .15) / 1.1) : 0;
    if (af > .004) { ctx.globalCompositeOperation = 'screen'; ctx.filter = `blur(${10 * K}px) sepia(1) hue-rotate(${70 + flashAge * 60}deg) saturate(2.2)`; ctx.globalAlpha = af; ctx.drawImage(flashBuf, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1; }
    if (flashAge < .05) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,250,240,${.35 * (1 - flashAge / .05)})`; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over';
    if (stamp && a > .05) { ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.3); ctx.font = `${40 * K}px "Seg"`; ctx.textAlign = 'right'; ctx.shadowColor = 'rgba(255,120,30,.9)'; ctx.shadowBlur = 8 * K; ctx.fillStyle = '#ff9a3c'; ctx.fillText(stamp, W - 60 * K, H - 330 * K); ctx.restore(); }
  }
  // виньетка
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${vign})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // зерно
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain; ctx.drawImage(GR[Math.floor(t * 24) % GR.length], 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
