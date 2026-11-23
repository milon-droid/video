// ЛИНИЯ — движок «луч осциллографа»: всё рисуется одной светящейся линией.
// Слои bg/mid/fg (глубина резкости), свечение (bloom), голова луча, шлейф свежего люминофора, обратные ходы, зерно.
(() => {
const W = 720, H = 1280;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const out = cv.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LAY = { bg: mk(W, H), mid: mk(W, H), fg: mk(W, H) };
const LX = {}; for (const k in LAY) LX[k] = LAY[k].getContext('2d');
const P = mk(W, H), PX = P.getContext('2d');
const B = [mk(W / 4, H / 4), mk(W / 8, H / 8), mk(W / 16, H / 16)], BX = B.map(c => c.getContext('2d'));
const GR = []; for (let i = 0; i < 6; i++) { const c = mk(W / 2, H / 2), x = c.getContext('2d'), d = x.createImageData(W / 2, H / 2);
  let s = 1234 + i * 777; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let j = 0; j < d.data.length; j += 4) { const v = r() ** 3 * 255; d.data[j] = v * .6; d.data[j + 1] = v; d.data[j + 2] = v * .8; d.data[j + 3] = 255; }
  x.putImageData(d, 0, 0); GR.push(c); }

const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const k01 = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  io: k => k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2,
  o: k => 1 - (1 - k) ** 3, i: k => k * k * k,
  o5: k => 1 - (1 - k) ** 5,
  back: k => { const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; },
  el: k => k === 0 || k === 1 ? k : 2 ** (-9 * k) * Math.sin((k * 10 - .75) * 2.1) + 1,
};
const COL = { g: [110, 255, 165], a: [255, 172, 72], w: [235, 255, 245], r: [255, 90, 80], dim: [60, 150, 110] };

// ---------- выборка SVG-путей (только абсолютные команды; M = обратный ход луча)
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('style', 'position:absolute;left:-9999px'); document.body.appendChild(svg);
const pel = document.createElementNS(svgNS, 'path'); svg.appendChild(pel);
const CACHE = new Map();
function sampleD(d, step = 2.5) {
  const key = d + '|' + step; if (CACHE.has(key)) return CACHE.get(key);
  const subs = d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
  const xs = [], ys = [], jp = [];
  for (const s of subs) {
    pel.setAttribute('d', s); const L = pel.getTotalLength(); const n = Math.max(2, Math.ceil(L / step));
    for (let i = 0; i <= n; i++) { const p = pel.getPointAtLength(L * i / n); xs.push(p.x); ys.push(p.y); jp.push(i === 0 && xs.length > 1 ? 1 : 0); }
  }
  const r = mkShape(xs, ys, jp); CACHE.set(key, r); return r;
}
function mkShape(xs, ys, jp) {
  const n = xs.length, c = new Float32Array(n); for (let i = 1; i < n; i++) c[i] = c[i - 1] + (jp[i] ? 0 : Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
  return { x: Float32Array.from(xs), y: Float32Array.from(ys), j: Uint8Array.from(jp), c, n, len: c[n - 1] };
}
// точки → фигура (strokes: [[x,y,x,y...], ...])
function fromStrokes(strokes, step = 2.5) {
  const xs = [], ys = [], jp = [];
  for (const s of strokes) {
    for (let i = 0; i + 3 < s.length; i += 2) {
      const ax = s[i], ay = s[i + 1], bx = s[i + 2], by = s[i + 3], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / step));
      for (let k = (i === 0 ? 0 : 1); k <= n; k++) { xs.push(ax + (bx - ax) * k / n); ys.push(ay + (by - ay) * k / n); jp.push(i === 0 && k === 0 && xs.length > 1 ? 1 : 0); }
    }
  }
  return mkShape(xs, ys, jp);
}
// равномерная выборка по длине — для морфинга
const RCACHE = new WeakMap();
function resample(sh, N) {
  let m = RCACHE.get(sh); if (!m) { m = {}; RCACHE.set(sh, m); } if (m[N]) return m[N];
  const xs = new Float32Array(N), ys = new Float32Array(N), jp = new Uint8Array(N); let k = 0;
  for (let i = 0; i < N; i++) {
    const L = sh.len * i / (N - 1); let jumped = 0;
    while (k < sh.n - 2 && sh.c[k + 1] < L) { k++; if (sh.j[k]) jumped = 1; }
    if (sh.j[k + 1] && sh.c[k + 1] <= L) { k++; jumped = 1; }
    const seg = sh.c[k + 1] - sh.c[k], f = seg > 0 ? clamp((L - sh.c[k]) / seg) : 0;
    xs[i] = lerp(sh.x[k], sh.x[k + 1], f); ys[i] = lerp(sh.y[k], sh.y[k + 1], f); jp[i] = jumped && i > 0 ? 1 : 0;
  }
  return m[N] = { xs, ys, jp, N };
}
function morph(a, b, k, N = 700) {
  const A = resample(a, N), Bq = resample(b, N), xs = [], ys = [], jp = [];
  for (let i = 0; i < N; i++) { xs.push(lerp(A.xs[i], Bq.xs[i], k)); ys.push(lerp(A.ys[i], Bq.ys[i], k)); jp.push(k < .5 ? A.jp[i] : Bq.jp[i]); }
  return mkShape(xs, ys, jp);
}

// ---------- текст Hershey (луч пишет сам)
const TCACHE = new Map();
function textShape(str, font = 'scripts', size = 60, align = 'c') {
  const key = str + font + size + align; if (TCACHE.has(key)) return TCACHE.get(key);
  const F = window.HFONT[font], sc = size / 21; let pen = 0; const parts = [];
  for (const ch of str) {
    if (ch === ' ') { pen += (font === 'scripts' ? 9 : 12); continue; }
    const g = F[ch.charCodeAt(0) - 33]; if (!g) continue;
    if (ch === ' ') { pen += (font === 'scripts' ? 9 : 12); continue; }
    let mx = -1e9, mn = 1e9; g[0].replace(/(-?\d+),(-?\d+)/g, (_, a) => { mx = Math.max(mx, +a); mn = Math.min(mn, +a); });
    const off = font === 'scripts' ? pen : pen - mn;
    parts.push(g[0].replace(/(-?\d+),(-?\d+)/g, (_, a, b) => `${((+a + off) * sc).toFixed(1)},${(+b * sc).toFixed(1)}`));
    pen = font === 'scripts' ? pen + mx - .5 : off + mx + 3;
  }
  const w = pen * sc, dx = align === 'c' ? -w / 2 : align === 'r' ? -w : 0, dy = -size * .55;
  const d = parts.join(' ').replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, a, b) => `${(+a + dx).toFixed(1)},${(+b + dy).toFixed(1)}`).replace(/L/g, 'L ');
  const r = sampleD(d, 1.6); r.w = w; TCACHE.set(key, r); return r;
}

// ---------- камера и рисование
let CAM = { x: W / 2, y: H / 2, z: 1, r: 0 }, T = 0, GA = 1;
const DEP = { bg: .88, mid: 1, fg: 1.18 };
function toScreen(layer, x, y) {
  const d = DEP[layer] || 1, z = CAM.z * (1 + (d - 1) * Math.min(1.5, CAM.z)), c = Math.cos(CAM.r), s = Math.sin(CAM.r);
  const dx = (x - CAM.x) * z, dy = (y - CAM.y) * z;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c, z];
}
const rgba = (c, a, hot = 0) => `rgba(${lerp(c[0], 255, hot) | 0},${lerp(c[1], 255, hot) | 0},${lerp(c[2], 255, hot) | 0},${a})`;
// главная функция: нарисовать фигуру sh от доли a до доли b длины
// o: {x,y,s,rot,sx,sy,col,al,w,layer,head,wob,fresh,ret}
function draw(sh, a = 0, b = 1, o = {}) {
  if (!sh || b <= a) return null;
  const layer = o.layer || 'mid', X = LX[layer], col = o.col || COL.g, al = (o.al == null ? 1 : o.al) * GA; if (al <= .002) return null;
  const s = o.s || 1, sx = s * (o.sx || 1), sy = s * (o.sy || 1), cr = Math.cos(o.rot || 0), sr = Math.sin(o.rot || 0), ox = o.x || 0, oy = o.y || 0;
  const wob = o.wob == null ? .7 : o.wob, seed = o.seed || 0;
  const L0 = a * sh.len, L1 = b * sh.len;
  let i0 = 0; while (i0 < sh.n - 1 && sh.c[i0 + 1] < L0) i0++;
  let i1 = i0; while (i1 < sh.n - 1 && sh.c[i1] < L1) i1++;
  const pts = []; let zz = 1;
  const pt = (i, f) => { // точка на сегменте i→i+1 с долей f
    const x0 = sh.x[i], y0 = sh.y[i], x1 = sh.x[Math.min(i + 1, sh.n - 1)], y1 = sh.y[Math.min(i + 1, sh.n - 1)];
    let lx = (x0 + (x1 - x0) * f) * sx, ly = (y0 + (y1 - y0) * f) * sy;
    const wx = ox + lx * cr - ly * sr, wy = oy + lx * sr + ly * cr;
    const q = toScreen(layer, wx, wy); zz = q[2];
    if (wob) { const u = (i + f) * .21 + seed; q[0] += wob * Math.sin(u * 1.7 + T * 2.3) * Math.sin(u * .53 + T * 1.1); q[1] += wob * Math.sin(u * 1.3 - T * 1.9) * Math.cos(u * .41 + T * .7); }
    return q;
  };
  const fA = sh.c[i0 + 1] > sh.c[i0] ? clamp((L0 - sh.c[i0]) / (sh.c[i0 + 1] - sh.c[i0])) : 0;
  pts.push([...pt(i0, fA), 0]);
  for (let i = i0 + 1; i < i1; i++) pts.push([...pt(i, 0), sh.j[i]]);
  const iL = Math.max(i1 - 1, i0), segL = sh.c[iL + 1] - sh.c[iL], fB = segL > 0 ? clamp((L1 - sh.c[iL]) / segL) : 1;
  pts.push([...pt(iL, fB), i1 > i0 && sh.j[i1] && fB > .999 ? 1 : 0]);
  const w = (o.w || 2.4) * Math.min(2.2, Math.max(.6, Math.sqrt(zz)));
  X.lineCap = 'round'; X.lineJoin = 'round'; X.globalCompositeOperation = 'lighter';
  const path = (from = 0, withJumps = false) => { X.beginPath(); for (let i = from; i < pts.length; i++) { const p = pts[i]; if (i === from || (p[3] && !withJumps)) X.moveTo(p[0], p[1]); else X.lineTo(p[0], p[1]); } };
  // обратные ходы луча — едва видно
  if (o.ret !== 0) { X.beginPath(); for (let i = 1; i < pts.length; i++) if (pts[i][3]) { X.moveTo(pts[i - 1][0], pts[i - 1][1]); X.lineTo(pts[i][0], pts[i][1]); }
    X.strokeStyle = rgba(col, .05 * al); X.lineWidth = w * .5; X.stroke(); }
  path(); X.strokeStyle = rgba(col, .16 * al); X.lineWidth = w * 3.2; X.stroke();
  path(); X.strokeStyle = rgba(col, .9 * al, o.hot || .12); X.lineWidth = w; X.stroke();
  // свежий люминофор у головы — горячее
  const fresh = o.fresh == null ? 60 : o.fresh;
  if (fresh > 0 && o.head !== 0) {
    let acc = 0, k = pts.length - 1; while (k > 0 && acc < fresh) { acc += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); k--; }
    for (let m = k; m < pts.length - 1; m++) { if (pts[m + 1][3]) continue; const f = (m - k) / Math.max(1, pts.length - 1 - k);
      X.beginPath(); X.moveTo(pts[m][0], pts[m][1]); X.lineTo(pts[m + 1][0], pts[m + 1][1]);
      X.strokeStyle = rgba(col, .8 * f * al, .6); X.lineWidth = w * (1 + f * .6); X.stroke(); }
  }
  const hp = pts[pts.length - 1];
  if (o.head !== 0 && o.head !== undefined) headDot(X, hp[0], hp[1], col, (o.head === true ? 1 : o.head) * al, w);
  return hp;
}
function headDot(X, x, y, col, k, w = 2.4) {
  if (k <= 0) return; X.globalCompositeOperation = 'lighter';
  const r = w * 7 * (.7 + .3 * k), g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, .95 * k, .9)); g.addColorStop(.18, rgba(col, .55 * k, .4)); g.addColorStop(1, rgba(col, 0));
  X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill();
}
// мягкое пятно (туман на стекле, свет окна) — без жёстких краёв
function glow(layer, x, y, r, col, a) {
  const X = LX[layer], q = toScreen(layer, x, y), R = r * q[2], g = X.createRadialGradient(q[0], q[1], 0, q[0], q[1], R);
  g.addColorStop(0, rgba(col, a * GA)); g.addColorStop(1, rgba(col, 0)); X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.beginPath(); X.arc(q[0], q[1], R, 0, 7); X.fill();
}
// прямой отрезок/ломаная из мировых координат
function line(pts, o = {}) { return draw(fromStrokes([pts], o.step || 3), o.a || 0, o.b == null ? 1 : o.b, o); }

// ---------- кадр
function frame(t, story) {
  T = t; GA = 1;
  for (const k in LX) { LX[k].setTransform(1, 0, 0, 1, 0, 0); LX[k].globalCompositeOperation = 'source-over'; LX[k].clearRect(0, 0, W, H); }
  const st = story(t) || {}; CAM = st.cam || CAM;
  PX.globalCompositeOperation = 'source-over'; PX.clearRect(0, 0, W, H); PX.globalCompositeOperation = 'lighter';
  PX.filter = `blur(${st.bgBlur == null ? 2.2 : st.bgBlur}px)`; PX.globalAlpha = .75; PX.drawImage(LAY.bg, 0, 0);
  PX.filter = 'none'; PX.globalAlpha = 1; PX.drawImage(LAY.mid, 0, 0);
  PX.filter = `blur(${st.fgBlur == null ? 5 : st.fgBlur}px)`; PX.drawImage(LAY.fg, 0, 0); PX.filter = 'none';
  // свечение
  BX[0].globalCompositeOperation = 'copy'; BX[0].filter = 'blur(2px)'; BX[0].drawImage(P, 0, 0, W / 4, H / 4); BX[0].filter = 'none';
  BX[1].globalCompositeOperation = 'copy'; BX[1].filter = 'blur(3px)'; BX[1].drawImage(B[0], 0, 0, W / 8, H / 8); BX[1].filter = 'none';
  BX[2].globalCompositeOperation = 'copy'; BX[2].filter = 'blur(4px)'; BX[2].drawImage(B[1], 0, 0, W / 16, H / 16); BX[2].filter = 'none';
  // фон: тёмное стекло люминофора
  out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1;
  const bgc = st.bg || [5, 12, 11];
  const g = out.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .5, H * .75);
  g.addColorStop(0, `rgb(${bgc[0] + 7},${bgc[1] + 10},${bgc[2] + 9})`); g.addColorStop(1, `rgb(${bgc[0] * .4 | 0},${bgc[1] * .4 | 0},${bgc[2] * .4 | 0})`);
  out.fillStyle = g; out.fillRect(0, 0, W, H);
  out.globalCompositeOperation = 'lighter';
  out.drawImage(P, 0, 0);
  out.imageSmoothingQuality = 'high';
  const bl = st.bloom == null ? 1 : st.bloom;
  out.globalAlpha = .55 * bl; out.drawImage(B[0], 0, 0, W, H);
  out.globalAlpha = .5 * bl; out.drawImage(B[1], 0, 0, W, H);
  out.globalAlpha = .45 * bl; out.drawImage(B[2], 0, 0, W, H);
  // зерно люминофора
  out.globalAlpha = .05; out.drawImage(GR[Math.floor(t * 24) % GR.length], 0, 0, W, H);
  // строки развёртки (едва)
  out.globalCompositeOperation = 'source-over'; out.globalAlpha = st.scan == null ? .05 : st.scan; out.fillStyle = '#000';
  for (let y = 0; y < H; y += 3) out.fillRect(0, y, W, 1);
  // виньетка
  out.globalAlpha = 1; const v = out.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); out.fillStyle = v; out.fillRect(0, 0, W, H);
  if (st.fade) { out.fillStyle = `rgba(0,0,0,${st.fade})`; out.fillRect(0, 0, W, H); }
  if (st.flash) { out.globalCompositeOperation = 'lighter'; out.fillStyle = rgba(st.flashCol || COL.g, st.flash); out.fillRect(0, 0, W, H); out.globalCompositeOperation = 'source-over'; }
}
function cat(...ss) { const xs = [], ys = [], jp = []; ss.forEach((q, k) => { for (let i = 0; i < q.n; i++) { xs.push(q.x[i]); ys.push(q.y[i]); jp.push(i === 0 ? (k > 0 ? (q.jn ? 1 : 0) : 0) : q.j[i]); } }); return mkShape(xs, ys, jp); }
function shift(q, dx, dy, s = 1) { const r = mkShape(Array.from(q.x, v => v * s + dx), Array.from(q.y, v => v * s + dy), Array.from(q.j)); return r; }
function at(q, f) { const L = f * q.len; let i = 0; while (i < q.n - 2 && q.c[i + 1] < L) i++; const sg = q.c[i + 1] - q.c[i], k = sg > 0 ? clamp((L - q.c[i]) / sg) : 0; return [lerp(q.x[i], q.x[i + 1], k), lerp(q.y[i], q.y[i + 1], k)]; }
window.E = { W, H, mkShape, cat, shift, at, clamp, lerp, k01, ease, COL, sampleD, fromStrokes, morph, textShape, draw, line, glow, headDot, frame, toScreen, LX,
  setT: t => T = t, setCam: c => CAM = c, setGA: v => GA = v, get cam() { return CAM; } };
window.grab = () => out.getImageData(0, 0, W, H).data;
})();
