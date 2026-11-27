// «ХОЛОД» — движок тепловизора. Сцена рендерится не в цвет, а в ТЕМПЕРАТУРУ (°C, float),
// потом шейдер камеры: авто-усиление, палитра ironbow / white-hot, изотерма, ореолы, шум матрицы, NUC-калибровка.
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
export { THREE };
THREE.ColorManagement.enabled = false;

export const W = 720, H = 1280, K = W / 1080;      // 2D-координаты пишем в сетке 1080×1920
export const SW = 432, SH = 768;                   // «матрица» тепловизора
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

// --- рендерер ---
export const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true, alpha: false });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(56, W / H, .03, 60);
camera.layers.enable(0);
export const rtT = new THREE.WebGLRenderTarget(SW, SH, { type: THREE.FloatType, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });

// --- общие источники тепла (тёплое пятно на одеяле, холодный след на кровати…) ---
export const NH = 10;
export const HEATP = { value: Array.from({ length: NH }, () => new THREE.Vector4(0, -99, 0, .01)) };
export const HEATT = { value: new Array(NH).fill(0) };
export const AMB = { value: 17 };   // «отражённый фон» — к нему стремятся края под углом (излучательность падает)
export function setHeat(i, x, y, z, r, T) { HEATP.value[i].set(x, y, z, r); HEATT.value[i] = T; }
export function clearHeat() { for (let i = 0; i < NH; i++) HEATP.value[i].set(0, -99, 0, .01); }

const NOISE_GLSL = `
float hs(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return .55*vn(p)+.3*vn(p*2.1)+.15*vn(p*4.3); }`;

const VERT = `varying vec3 vWP; varying vec3 vN; varying vec2 vUv;
void main(){ vec4 wp = modelMatrix*vec4(position,1.); vWP = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); vUv = uv; gl_Position = projectionMatrix*viewMatrix*wp; }`;
const FRAG = `uniform vec3 uGv, uP0; uniform float uT, uNz, uNzs, uStuds, uFres, uHeatK, uDecalK, uHasDecal, uAmbK; uniform vec2 uStudAx; uniform vec3 uEdge;
uniform vec4 uHP[${NH}]; uniform float uHT[${NH}]; uniform float uAmb; uniform sampler2D uDecal;
varying vec3 vWP; varying vec3 vN; varying vec2 vUv; ${NOISE_GLSL}
void main(){
  float T = uT + dot(uGv, vWP-uP0);
  T += uNz*(fbm(vWP*uNzs)-.5)*2.;
  if(uStuds>0.){ float u = dot(vWP.xz,uStudAx); float f = fract(u/.41); T -= uStuds*(1.-smoothstep(.025,.06,abs(f-.5))); }
  for(int i=0;i<${NH};i++){ float d = distance(vWP,uHP[i].xyz)/uHP[i].w; T = mix(T, uHT[i], exp(-d*d)*uHeatK); }
  if(uEdge.z!=0.) T += uEdge.z*(exp(-abs(vWP.y-uEdge.x)/.12)+exp(-abs(vWP.y-uEdge.y)/.12));
  if(uHasDecal>0.) T += uDecalK*texture2D(uDecal,vUv).r;
  vec3 V = normalize(cameraPosition-vWP); float ndv = abs(dot(normalize(vN),V));
  float e = 1. - uFres*pow(1.-ndv,2.5);
  T = mix(mix(uAmb,T,uAmbK), T, e);
  gl_FragColor = vec4(T,0.,0.,1.);
}`;
// материал «температура»: T — °C, grad — °C на метр [x,y,z] от точки p0 (число = по высоте), nz — неоднородность, studs — стойки каркаса в стене
export function tMat({ T = 19, grad = [0, 0, 0], p0 = [0, 0, 0], nz = .15, nzs = 2.5, studs = 0, studAx = [1, 0], fres = .55, heatK = 1, decal = null, decalK = -6, side = THREE.FrontSide, ambK = 1, edge = [0, 0, 0] } = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side,
    uniforms: { uT: { value: T }, uGv: { value: new THREE.Vector3(...(typeof grad === 'number' ? [0, grad, 0] : grad)) }, uP0: { value: new THREE.Vector3(...p0) }, uNz: { value: nz }, uNzs: { value: nzs }, uStuds: { value: studs }, uStudAx: { value: new THREE.Vector2(...studAx) },
      uFres: { value: fres }, uHeatK: { value: heatK }, uDecalK: { value: decalK }, uHasDecal: { value: decal ? 1 : 0 }, uDecal: { value: decal }, uHP: HEATP, uHT: HEATT, uAmb: AMB, uAmbK: { value: ambK }, uEdge: { value: new THREE.Vector3(...edge) } },
  });
  return m;
}
export const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
export const G = {
  sph: (r, s = 20) => new THREE.SphereGeometry(r, s, Math.round(s * .75)),
  box: (w, h, d, s = 1) => new THREE.BoxGeometry(w, h, d, s, s, s),
  cyl: (r1, r2, h, s = 16) => new THREE.CylinderGeometry(r1, r2, h, s),
  plane: (w, h, sx = 1, sy = 1) => new THREE.PlaneGeometry(w, h, sx, sy),
};
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, w, h); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.flipY = true; return t; }

// --- стекло / зеркало: отражает тепло ---
const MIRROR_SH = {
  name: 'ThermalMirror',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uGlass: { value: 12 }, uRefl: { value: .8 }, uSmudge: { value: .4 } },
  vertexShader: `uniform mat4 textureMatrix; varying vec4 vUvP; varying vec3 vWP; void main(){ vUvP = textureMatrix*vec4(position,1.); vec4 wp = modelMatrix*vec4(position,1.); vWP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uGlass, uRefl, uSmudge; varying vec4 vUvP; varying vec3 vWP; ${NOISE_GLSL}
  void main(){ float r = texture2DProj(tDiffuse, vUvP).r; float s = (fbm(vWP*6.)-.5)*uSmudge; gl_FragColor = vec4(mix(uGlass, r, uRefl)+s, 0.,0.,1.); }`,
};
export function thermalMirror(w, h, { glass = 12, refl = .8, layers = [], res = 1 } = {}) {
  const m = new Reflector(G.plane(w, h), { textureWidth: SW * res, textureHeight: SH * res, shader: MIRROR_SH, multisample: 0, clipBias: .003 });
  // цель рендера — HalfFloat: точность ~0,02 °C при 20 °C, этого хватает
  layers.forEach(l => m.camera.layers.enable(l));
  m.material.uniforms.uGlass.value = glass; m.material.uniforms.uRefl.value = refl;
  return m;
}

// --- пар / дыхание: частицы добавляют тепло (аддитивно) ---
export function steamPoints(n) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('a', new THREE.BufferAttribute(new Float32Array(n), 1)); geo.setAttribute('sz', new THREE.BufferAttribute(new Float32Array(n), 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uDT: { value: 14 } },
    vertexShader: `attribute float a; attribute float sz; varying float vA; void main(){ vA=a; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = sz*${SH}.0*.9/(-mv.z); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uDT; varying float vA; void main(){ vec2 c = gl_PointCoord-.5; float d = dot(c,c)*4.; float k = exp(-d*3.)*vA; gl_FragColor = vec4(uDT*k,0.,0.,0.); }` });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; return p;
}

// --- камера тепловизора: шейдер ---
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
export const POST = {
  tT: { value: rtT.texture }, uLo: { value: 12 }, uHi: { value: 37 }, uPal: { value: 0 }, uIso: { value: -100 }, uIsoK: { value: 0 }, uTime: { value: 0 },
  uNoise: { value: .34 }, uNuc: { value: 0 }, uZoom: { value: 1 }, uSharp: { value: .9 }, uGlitch: { value: 0 }, uFade: { value: 1 }, uSeed: { value: 0 },
};
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: POST, depthTest: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D tT; uniform float uLo,uHi,uPal,uIso,uIsoK,uTime,uNoise,uNuc,uZoom,uSharp,uGlitch,uFade,uSeed; varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  vec3 ironbow(float k){
    vec3 c0=vec3(0.), c1=vec3(.10,.0,.32), c2=vec3(.45,.0,.55), c3=vec3(.80,.08,.35), c4=vec3(.96,.38,.04), c5=vec3(1.,.72,.05), c6=vec3(1.,.95,.55), c7=vec3(1.);
    if(k<.12) return mix(c0,c1,k/.12); if(k<.30) return mix(c1,c2,(k-.12)/.18); if(k<.46) return mix(c2,c3,(k-.30)/.16);
    if(k<.62) return mix(c3,c4,(k-.46)/.16); if(k<.78) return mix(c4,c5,(k-.62)/.16); if(k<.92) return mix(c5,c6,(k-.78)/.14); return mix(c6,c7,(k-.92)/.08); }
  void main(){
    vec2 uv = vUv;
    // строки «рвутся» при сбое
    float row = floor(uv.y*${SH}.0/6.0); float g = uGlitch*step(.82, hash(vec2(row, floor(uTime*24.)+uSeed)));
    uv.x += g*(hash(vec2(row,uTime))-.5)*.12;
    uv = (uv-.5)/uZoom+.5;
    vec2 c = uv-.5; uv = .5 + c*(1.+.035*dot(c,c));
    vec2 px = 1./vec2(${SW}.0,${SH}.0);
    float T = texture2D(tT, uv).r;
    float B = 0.; for(int i=0;i<8;i++){ float a = float(i)*.785398; B += texture2D(tT, uv+vec2(cos(a),sin(a))*px*5.).r; } B /= 8.;
    float B2 = 0.; for(int i=0;i<8;i++){ float a = float(i)*.785398+.39; B2 += texture2D(tT, uv+vec2(cos(a),sin(a))*px*1.6).r; } B2 /= 8.;
    float Tm = mix(T, B2, .35);                       // мягкость оптики
    Tm += uSharp*(T-B)*.6;                            // ореолы вокруг горячих тел (как у настоящих микроболометров)
    vec2 sp = floor(uv*vec2(${SW}.0,${SH}.0));
    float n = hash(sp + vec2(floor(uTime*30.)*1.37, uSeed)) - .5;
    float colN = hash(vec2(sp.x, 7.1)) - .5, rowN = hash(vec2(3.3, sp.y + floor(uTime*30.))) - .5;
    float span = uHi-uLo;
    Tm += (n*uNoise + colN*uNoise*.35 + rowN*uNoise*.25)*span*.04;
    float k = clamp((Tm-uLo)/span, 0., 1.);
    vec3 col = mix(ironbow(k), vec3(pow(k,.9)), uPal);
    // изотерма: всё холоднее порога — бирюзой
    float iso = (1.-smoothstep(uIso-.25, uIso+.25, Tm))*uIsoK;
    // холодное — светится голубым изнутри (как призрак), мягкий ореол вокруг; совсем ледяное (глазницы, рот) — чёрная пустота
    float core = clamp((uIso - Tm)/5., 0., 1.);
    vec3 cold = mix(vec3(.06,.22,.85), vec3(.42,.95,1.), smoothstep(.0,.9,core)) * (.9 + .25*n);
    cold = mix(cold, vec3(.0,.01,.04), smoothstep(uIso-11., uIso-17., Tm));
    col = mix(col, cold, iso);
    float gm = 0.; for(int i=0;i<12;i++){ float a = float(i)*.5236; float Ts = texture2D(tT, uv+vec2(cos(a),sin(a))*px*vec2(9.,9.)*(1.+float(i-i/2*2))).r; gm += 1.-smoothstep(uIso-.5, uIso+.5, Ts); } gm /= 12.;
    col += vec3(.12,.45,1.)*gm*uIsoK*.6*(1.-iso);
    // виньетка объектива и края матрицы
    float v = dot(c,c); col *= 1.-.55*v; col *= .93+.07*smoothstep(.0,.02,uv.x)*smoothstep(1.,.98,uv.x);
    col = mix(col, vec3(.42+.02*n), uNuc);
    col += g*.15;
    if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.) col = vec3(0.);
    gl_FragColor = vec4(col*uFade,1.);
  }` }));
quadScene.add(quad);

const px = new Float32Array(4);
export function renderThermal() {
  renderer.setRenderTarget(rtT); renderer.setClearColor(new THREE.Color(AMB.value, 0, 0), 1); renderer.clear(); renderer.render(scene, camera);
  let tc = null; try { renderer.readRenderTargetPixels(rtT, SW >> 1, SH >> 1, 1, 1, px); tc = px[0]; } catch (e) { }
  renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(quadScene, quadCam);
  return tc;
}
export function readT(sx, sy) { try { renderer.readRenderTargetPixels(rtT, Math.round(sx * SW), Math.round((1 - sy) * SH), 1, 1, px); return px[0]; } catch (e) { return null; } }

// палитра для шкалы на экране (та же, что в шейдере)
export function ironbowCSS(k, pal = 0) {
  const S = [[0, 0, 0, 0], [.12, .10, 0, .32], [.30, .45, 0, .55], [.46, .80, .08, .35], [.62, .96, .38, .04], [.78, 1, .72, .05], [.92, 1, .95, .55], [1, 1, 1, 1]];
  let c = [1, 1, 1]; for (let i = 1; i < S.length; i++) if (k <= S[i][0]) { const f = (k - S[i - 1][0]) / (S[i][0] - S[i - 1][0]); c = [1, 2, 3].map(j => lerp(S[i - 1][j], S[i][j], f)); break; }
  const g = Math.pow(k, .9); c = c.map(x => lerp(x, g, pal));
  return `rgb(${c.map(x => Math.round(x * 255)).join(',')})`;
}

// --- 2D-слой: интерфейс камеры и субтитры ---
export const out = document.getElementById('out'); out.width = W; out.height = H;
export const ctx = out.getContext('2d');
export function project(v) { const p = v.clone().project(camera); return { x: (p.x * .5 + .5) * 1080, y: (-p.y * .5 + .5) * 1920, z: p.z, ok: p.z < 1 && p.z > -1 }; }
