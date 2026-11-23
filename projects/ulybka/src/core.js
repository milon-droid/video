// «SMILE» — движок «проклятого мультфильма 1932»: кадр рисуется векторно на 2D-холсте (сетка 1080×1920),
// потом WebGL-шейдер плёнки: ч/б с тёплым тоном, зерно, пыль, царапины, мерцание, дрожание кадра, ореол, рамка гейта, прожиг.
export const W = 720, H = 1280, K = W / 1080;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const win = (t, a, b) => clamp((t - a) / (b - a));
export const sm = k => k * k * (3 - 2 * k);
export const outE = k => 1 - Math.pow(1 - k, 3);
export const inE = k => k * k * k;
export const inoutE = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const backE = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const ease = (t, a, b, f = sm) => f(win(t, a, b));
export const h1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise = (seed, t) => { const i = Math.floor(t), f = t - i, a = h1(i + seed * 13.1), b = h1(i + 1 + seed * 13.1); return lerp(a, b, sm(f)) * 2 - 1; };
export const on12 = t => Math.floor(t * 12) / 12;   // мультипликация «на двойках» — 12 рисунков в секунду
export const spring = (t, t0, f = 3, d = 6) => t < t0 ? 0 : 1 - Math.exp(-(t - t0) * d) * Math.cos((t - t0) * f * 6.283);

// --- холст рисунка ---
export const C = document.createElement('canvas'); C.width = W; C.height = H;
export const g = C.getContext('2d');
// тона плёнки (рисуем сразу в серых)
export const INK = '#121110', PAPER = '#f3efe4', G1 = '#d9d4c8', G2 = '#b4aea2', G3 = '#8c867b', G4 = '#5f5a52', G5 = '#36322d';
export function reset() { g.setTransform(K, 0, 0, K, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.lineJoin = 'round'; g.lineCap = 'round'; }
// камера: zoom вокруг точки (cx, cy) мира, сдвиг кадра
export function camera(cx = 540, cy = 960, z = 1, rot = 0) { reset(); g.translate(540, 960); g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); }
export function path(pts, close = false) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); }
export function ell(x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, 6.2832); }
export function fillStroke(fill, lw = 7, stroke = INK) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } }

// --- шейдер плёнки ---
export const out = document.getElementById('out'); out.width = W; out.height = H;
const gl = out.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
const FS = `precision highp float; varying vec2 uv; uniform sampler2D tex; uniform vec2 res;
uniform float uT, uFrame, uFlick, uGrain, uDust, uScratch, uFade, uBurn, uHal, uGate, uExpo;
uniform vec2 uWeave, uBurnP;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
void main(){
  vec2 q = uv + uWeave; q.y = 1.-q.y;
  float L = lum(texture2D(tex, q).rgb);
  // ореол: свет «растекается» по эмульсии
  float hb = 0.; for(int i=0;i<8;i++){ float a=float(i)*.785; hb += lum(texture2D(tex, q+vec2(cos(a),sin(a))*vec2(.012,.007)).rgb); } hb/=8.;
  L = mix(L, max(L, hb), uHal*.55);
  // кривая плёнки: чуть сжатые тени и света
  L = smoothstep(-.04, 1.04, L); L = pow(L, 1.08);
  L *= uExpo * (1. + uFlick*(hash(vec2(uFrame,1.3))-.5)*.16 + uFlick*.05*sin(uT*47.));
  // зерно
  float gr = hash(floor(uv*res*.8)+uFrame*1.37) - .5; L += gr*uGrain*.16;
  // пыль и волоски
  for(int i=0;i<6;i++){ float fi=float(i); vec2 c = vec2(hash(vec2(uFrame,fi)), hash(vec2(fi,uFrame*1.7)));
    float r = .002+.006*hash(vec2(fi*3.1,uFrame)); float d = length((uv-c)*vec2(1.,1.78));
    float on = step(.55, hash(vec2(uFrame*.31,fi*7.))); float dark = step(.5,hash(vec2(fi,uFrame*.9)));
    float m = (1.-smoothstep(r*.5,r,d))*on*uDust; L = mix(L, dark>.5 ? .05 : .95, m*.85); }
  // волосок-дуга
  { vec2 c = vec2(hash(vec2(uFrame,9.)), hash(vec2(uFrame,11.))); float on = step(.8, hash(vec2(uFrame,13.)))*uDust;
    float d = abs(length((uv-c)*vec2(1.,1.78)) - .03) ; L = mix(L, .08, (1.-smoothstep(.0008,.0022,d))*on*step(uv.x,c.x+.02)); }
  // царапины вдоль плёнки
  for(int i=0;i<3;i++){ float fi=float(i); float seed = floor(uFrame/ (3.+fi*2.)); float x = hash(vec2(seed,fi*5.)); float on = step(.45, hash(vec2(seed*1.3,fi)))*uScratch;
    float w = .0007+.0012*hash(vec2(seed,fi)); x += sin(uv.y*6.+seed)*.004;
    L = mix(L, hash(vec2(seed,fi*2.))>.5?.92:.1, (1.-smoothstep(w*.4,w,abs(uv.x-x)))*on*.7*(.6+.4*vn(vec2(uv.y*40.,seed)))); }
  // виньетка и скруглённая рамка гейта
  vec2 c = (uv-.5)*vec2(1.,1.)*2.; float v = 1.-dot(c*vec2(.85,.6),c*vec2(.85,.6))*.42; L *= v;
  vec2 b = abs(uv-.5)*2.; vec2 rr = max(b-vec2(1.-.09,1.-.05),0.)/vec2(.09,.05); float gate = 1.-smoothstep(.75,1.,length(rr)); L *= mix(1.,gate,uGate);
  // прожиг плёнки
  if(uBurn>0.){ float d = length((uv-uBurnP)*vec2(1.,1.78)); float n = vn(uv*18.+uT)*.12+vn(uv*60.)*.04; float r = uBurn*1.2;
    float hole = 1.-smoothstep(r-.02, r, d+n); float ring = smoothstep(r-.12, r-.01, d+n)*(1.-smoothstep(r, r+.05, d+n));
    L = mix(L, .02, ring*.9); L = mix(L, 1.15, hole); }
  vec3 col = vec3(L)*vec3(1.04,1.0,.9) + vec3(.012,.008,0.);   // тёплый тон старой копии
  gl_FragColor = vec4(col*uFade, 1.);
}`;
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
const U = n => gl.getUniformLocation(prog, n);
export function film(t, o = {}) {
  gl.viewport(0, 0, W, H); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, C);
  const fr = Math.floor(t * 24);
  gl.uniform2f(U('res'), W, H); gl.uniform1f(U('uT'), t); gl.uniform1f(U('uFrame'), fr);
  gl.uniform1f(U('uFlick'), o.flick ?? 1); gl.uniform1f(U('uGrain'), o.grain ?? 1); gl.uniform1f(U('uDust'), o.dust ?? 1); gl.uniform1f(U('uScratch'), o.scratch ?? 1);
  gl.uniform1f(U('uFade'), o.fade ?? 1); gl.uniform1f(U('uBurn'), o.burn || 0); gl.uniform2f(U('uBurnP'), ...(o.burnP || [.5, .5])); gl.uniform1f(U('uHal'), o.hal ?? 1);
  gl.uniform1f(U('uGate'), o.gate ?? 1); gl.uniform1f(U('uExpo'), o.expo ?? 1);
  const wv = o.weave ?? 1; gl.uniform2f(U('uWeave'), (noise(3, t * 3) * .0016 + (h1(fr) - .5) * .0012) * wv, (noise(5, t * 2.3) * .002 + (h1(fr * 1.3) - .5) * .0016) * wv + (o.jump || 0));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
