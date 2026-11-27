// Движок «ТЕНЬ»: three.js (пластилиновые игрушки, настоящие тени) + 2D-компоновщик (тилт-шифт, свет, зерно, текст).
import * as THREE from 'three';
export { THREE };
export const RS = window.RENDER_SCALE || 1; // 1 = 720p, 1.5 = 1080p, 3 = 4K (2160×3840)
export const W = Math.round(720 * RS), H = Math.round(1280 * RS), K = W / 1080; // 2D-координаты пишем в сетке 1080×1920
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const win = (t, a, b) => clamp((t - a) / (b - a));
export const sm = k => k * k * (3 - 2 * k);
export const outE = k => 1 - Math.pow(1 - k, 3);
export const ease = (t, a, b, f = outE) => f(win(t, a, b));
export const back = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const h1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise = (seed, t) => { const i = Math.floor(t), f = t - i, a = h1(i + seed * 13.1), b = h1(i + 1 + seed * 13.1); return lerp(a, b, sm(f)) * 2 - 1; };
export const spring = (t, t0, f = 7, d = 5) => t < t0 ? 0 : 1 - Math.exp(-(t - t0) * d) * Math.cos((t - t0) * f * 2);

// --- рендерер ---
export const SS = window.SUPERSAMPLE || 1; // сглаживание: 3D рисуется крупнее и ужимается
export const glCanvas = document.createElement('canvas'); glCanvas.width = Math.round(W * SS); glCanvas.height = Math.round(H * SS);
export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(glCanvas.width, glCanvas.height, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
export const camera = new THREE.PerspectiveCamera(32, W / H, .05, 200);

// --- материалы «пластилин» ---
const matCache = {};
export const clay = (color, o = {}) => { const k = color + JSON.stringify(o); if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color, roughness: .82, metalness: 0, ...o }); return matCache[k]; };
export const glow = (color, i = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(i), toneMapped: false });
export const mesh = (geo, mat, cast = true, recv = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; return m; };
export const G = {
  sph: (r, s = 24) => new THREE.SphereGeometry(r, s, Math.round(s * .75)),
  cap: (r, l, s = 16) => new THREE.CapsuleGeometry(r, l, 6, s),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  rbox: (w, h, d, r = .03) => { const g = new THREE.BoxGeometry(w, h, d, 4, 4, 4); const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r; const c = new THREE.Vector3(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz)); const n = v.clone().sub(c); if (n.length() > 0) n.setLength(r); p.setXYZ(i, c.x + n.x, c.y + n.y, c.z + n.z); }
    g.computeVertexNormals(); return g; },
  cyl: (r1, r2, h, s = 20) => new THREE.CylinderGeometry(r1, r2, h, s),
  plane: (w, h) => new THREE.PlaneGeometry(w, h), cone: (r, h, s = 16) => new THREE.ConeGeometry(r, h, s),
};

// текстура из 2D-канваса (вывески, надписи, небо)
export const TEX_REDRAW = [];
export const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TEX_REDRAW.push(() => { const g = c.getContext('2d'); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }); return t; };
export const skyTex = stops => canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

// --- 2D-компоновщик ---
export const out = document.getElementById('out'); out.width = W; out.height = H;
export const ctx = out.getContext('2d');
const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tctx = tmp.getContext('2d');
// тилт-шифт: верх и низ кадра размыты, полоса фокуса fy (0…1) шириной fw
export function composite({ tilt = 1, fy = .5, fw = .22, blur = 7, vign = .5, grain = .06, t = 0, warm = 0, bloom = 0 } = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(glCanvas, 0, 0, W, H);
  if (bloom > 0) { ctx.save(); ctx.filter = `blur(${18 * K}px) brightness(1.3)`; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = bloom; ctx.drawImage(glCanvas, 0, 0, W, H); ctx.restore(); }
  if (tilt > 0) {
    tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, W, H);
    tctx.filter = `blur(${blur * K * tilt}px)`; tctx.drawImage(out, 0, 0); tctx.filter = 'none';
    tctx.globalCompositeOperation = 'destination-in'; const g = tctx.createLinearGradient(0, 0, 0, H);
    const a = clamp(fy - fw), b = clamp(fy + fw); g.addColorStop(0, '#000'); g.addColorStop(clamp(a - .12), '#000'); g.addColorStop(a, 'rgba(0,0,0,0)'); g.addColorStop(b, 'rgba(0,0,0,0)'); g.addColorStop(clamp(b + .12), '#000'); g.addColorStop(1, '#000');
    tctx.fillStyle = g; tctx.fillRect(0, 0, W, H); ctx.drawImage(tmp, 0, 0);
  }
  if (warm) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = Math.abs(warm); ctx.fillStyle = warm > 0 ? '#ff9a3a' : '#3a6aff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (vign) { const g = ctx.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,6,20,${vign})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  if (grain) { const f = Math.floor(t * 24); ctx.save(); ctx.globalAlpha = grain; for (let i = 0; i < 900 * RS * RS; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#000"; ctx.fillRect(h1(i * 3.1 + f * 17.7) * W, h1(i * 7.3 + f * 3.9) * H, 1.4 * RS, 1.4 * RS); } ctx.restore(); }
  ctx.setTransform(K, 0, 0, K, 0, 0); // дальше рисуем в сетке 1080×1920
}
