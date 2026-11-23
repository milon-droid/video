// ПЕСОК — движок «песочная анимация на световом столе».
// Всё рисуется в canvas-«плотность песка» (альфа = толщина слоя), затем шейдер просвечивает её лампой снизу:
// тонкий слой — янтарный, толстый — чёрный, края зернистые, зёрна привязаны к миру (камера едет — песок едет).
(function () {
  const W = 720, H = 1280;
  const RS = window.RS || 1, PW = W * RS, PH = H * RS;   // множитель разрешения (3 → 4K)
  const E = window.E = { W, H, RS };
  const cv = document.getElementById('c'); cv.width = PW; cv.height = PH;
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const mk = () => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; return c; };
  const D = mk(), A = mk(), B = mk(), M = mk();           // итог, кадр A, кадр B, маска перехода
  const dx = D.getContext('2d'), ax = A.getContext('2d'), bx = B.getContext('2d'), mx = M.getContext('2d');
  E.ctx = ax;

  // ---------- утилиты
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
  const eo = k => 1 - (1 - clamp(k)) ** 3;
  const back = k => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  Object.assign(E, { clamp, lerp, ss, eio, eo, back, hash, noise1 });

  // ---------- камера (мир 720×1280; z — зум)
  E.cam = { x: W / 2, y: H / 2, z: 1, r: 0 };
  E.setCam = function (c, x, y, z = 1, r = 0) {
    c.setTransform(RS, 0, 0, RS, 0, 0);
    c.translate(W / 2, H / 2); c.rotate(r); c.scale(z, z); c.translate(-x, -y);
  };

  // ---------- рисование песком
  // плотность: 1 — непрозрачный толстый слой, .3 — тонкий просвечивающий
  E.sand = (c, a = 1) => { c.fillStyle = `rgba(255,255,255,${a})`; c.strokeStyle = `rgba(255,255,255,${a})`; c.globalCompositeOperation = 'source-over'; };
  E.carve = (c, a = 1) => { c.fillStyle = `rgba(0,0,0,${a})`; c.strokeStyle = `rgba(0,0,0,${a})`; c.globalCompositeOperation = 'destination-out'; };
  E.reset = c => { c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.lineCap = 'round'; c.lineJoin = 'round'; c.filter = 'none'; };
  // мягкое пятно (горка песка)
  E.blob = function (c, x, y, r, a = 1, sy = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.55, `rgba(255,255,255,${a * .75})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.save(); c.translate(x, y); c.scale(1, sy); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
  };
  // процарапанное пальцем светлое пятно
  E.clear = function (c, x, y, r, a = 1, sy = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .8})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'destination-out'; c.translate(x, y); c.scale(1, sy); c.translate(-x, -y);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
  };
  // линия пальцем: светлая борозда с валиком песка по краям
  E.groove = function (c, pts, w, a = 1, rim = .35) {
    if (pts.length < 2) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    if (rim > 0) { E.sand(c, rim); c.lineWidth = w * 2.2; path(c, pts); c.stroke(); }
    E.carve(c, a); c.lineWidth = w; path(c, pts); c.stroke(); c.restore(); E.reset(c);
  };
  // линия песком (насыпанная): тёмная на свету
  E.sline = function (c, pts, w, a = 1) {
    if (pts.length < 2) return; c.save(); E.sand(c, a); c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; path(c, pts); c.stroke(); c.restore();
  };
  function path(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }
  E.path = path;
  // рассыпанные зёрна (крупинки, пыль на стекле)
  E.grains = function (c, x, y, rx, ry, n, seed = 1, a = 1, sz = 1.4) {
    E.sand(c, a);
    for (let i = 0; i < n; i++) {
      const u = hash(seed * 13.1 + i * 1.7), v = hash(seed * 7.7 + i * 3.3), r = Math.sqrt(u);
      const ang = v * 6.283, gx = x + Math.cos(ang) * rx * r, gy = y + Math.sin(ang) * ry * r;
      const s = sz * (.6 + hash(i + seed) * .9); c.fillRect(gx - s / 2, gy - s / 2, s, s);
    }
  };
  // струя сыплющегося песка: от (x,y0) до (x,y1)
  E.stream = function (c, x, y0, y1, w, t, a = 1, seed = 3) {
    E.sand(c, a * .85);
    c.beginPath(); c.moveTo(x - w / 2, y0); c.lineTo(x + w / 2, y0); c.lineTo(x + w * .3, y1); c.lineTo(x - w * .3, y1); c.fill();
    const L = y1 - y0, n = Math.max(6, L / 5 | 0);
    for (let i = 0; i < n; i++) {
      const k = ((hash(i * 3.1 + seed) + t * (1.6 + hash(i) * .8)) % 1), yy = y0 + k * L;
      const sp = w * (.5 + k * 1.4) * (hash(i * 9.3) - .5) * 2;
      const s = 1.2 + hash(i * 5.5) * 1.6; c.fillRect(x + sp - s / 2, yy - s / 2, s, s * 1.8);
    }
  };

  // ---------- текст пальцем (Hershey, однолинейный шрифт)
  const TC = new Map();
  E.textPolys = function (str, font = 'scripts', size = 60, align = 'c') {
    const key = str + '|' + font + '|' + size + '|' + align; if (TC.has(key)) return TC.get(key);
    const F = window.HFONT[font], sc = size / 21; let pen = 0; const polys = [];
    for (const ch of str) {
      if (ch === ' ') { pen += font === 'scripts' ? 8 : 11; continue; }
      const g = F[ch.charCodeAt(0) - 33]; if (!g) continue;
      let mxx = -1e9, mn = 1e9; g[0].replace(/(-?\d+),(-?\d+)/g, (_, a) => { mxx = Math.max(mxx, +a); mn = Math.min(mn, +a); });
      const off = font === 'scripts' ? pen : pen - mn;
      for (const seg of g[0].split('M').filter(s => s.trim())) {
        const pts = []; seg.replace(/(-?\d+),(-?\d+)/g, (_, a, b) => pts.push([(+a + off) * sc, +b * sc]));
        polys.push(pts);
      }
      pen = font === 'scripts' ? pen + mxx - .5 : off + mxx + 3;
    }
    const w = pen * sc, ox = align === 'c' ? -w / 2 : align === 'r' ? -w : 0, oy = -size * .55;
    let L = 0;
    const out = polys.map(p => { const q = p.map(([a, b]) => [a + ox, b + oy]); let l = 0; for (let i = 1; i < q.length; i++) l += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); L += l; return { q, l }; });
    const r = { polys: out, L, w }; TC.set(key, r); return r;
  };
  // mode: 'carve' — процарапать (светлое по песку), 'sand' — насыпать (тёмное по свету). p — доля написанного
  E.write = function (c, str, x, y, size, p = 1, o = {}) {
    const T = E.textPolys(str, o.font || 'scripts', size, o.align || 'c'); if (p <= 0) return T;
    const lim = T.L * clamp(p), w = o.w || size * .11;
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot);
    let acc = 0;
    for (const { q, l } of T.polys) {
      if (acc >= lim) break;
      const keep = [], rem = lim - acc; let s = 0; keep.push(q[0]);
      for (let i = 1; i < q.length; i++) {
        const d = Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
        if (s + d <= rem) { keep.push(q[i]); s += d; } else { const k = (rem - s) / d; keep.push([lerp(q[i - 1][0], q[i][0], k), lerp(q[i - 1][1], q[i][1], k)]); s = rem; break; }
      }
      if (keep.length === 1) keep.push([keep[0][0] + .1, keep[0][1]]);
      if (o.mode === 'sand') E.sline(c, keep, w, o.a ?? 1); else E.groove(c, keep, w, o.a ?? 1, o.rim ?? .3);
      acc += l;
    }
    c.restore(); E.reset(c); return T;
  };

  // ---------- переходы: «ладонь сметает» кадр A, под ним уже насыпан B
  // kind: 'sweep' (угол ang), 'pour' (сверху вниз струями), 'iris' (из точки)
  E.compose = function (drawA, drawB, k, kind = 'sweep', o = {}) {
    E.reset(ax); E.reset(bx); ax.setTransform(1, 0, 0, 1, 0, 0); ax.clearRect(0, 0, PW, PH);
    if (k < 1) { E.ctx = ax; drawA(ax); }
    dx.setTransform(1, 0, 0, 1, 0, 0); dx.globalCompositeOperation = 'source-over'; dx.clearRect(0, 0, PW, PH);
    if (k <= 0) { dx.drawImage(A, 0, 0); E.ctx = ax; return; }
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, PW, PH); E.ctx = bx; drawB(bx); E.reset(bx);
    if (k >= 1) { dx.drawImage(B, 0, 0); return; }
    // маска: где показывать B
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, PW, PH); mx.setTransform(RS, 0, 0, RS, 0, 0); mx.fillStyle = '#fff';
    const front = []; const seed = o.seed || 1;
    if (kind === 'iris') {
      const cx = o.x ?? W / 2, cy = o.y ?? H / 2, R = eio(k) * 1600;
      mx.beginPath();
      for (let i = 0; i <= 64; i++) { const a = i / 64 * 6.283, r = R * (1 + .12 * noise1(i * .7 + seed * 5) + .05 * noise1(i * 2.3)); const p = [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; front.push(p); i ? mx.lineTo(...p) : mx.moveTo(...p); }
      mx.fill();
    } else {
      const ang = kind === 'pour' ? Math.PI / 2 : (o.ang ?? 0), ca = Math.cos(ang), sa = Math.sin(ang);
      const span = 1700, pos = lerp(-span / 2 - 120, span / 2 + 120, eio(k));
      // фронт — линия, перпендикулярная направлению, с неровностями «ладони»
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const u = (i / 48 - .5) * span, wob = 70 * noise1(i * .35 + seed * 3) + 26 * noise1(i * 1.3 + seed) + (kind === 'pour' ? 90 * Math.abs(Math.sin(i * .9 + seed)) : 0);
        const d = pos + wob; pts.push([W / 2 + ca * d - sa * u, H / 2 + sa * d + ca * u]);
      }
      front.push(...pts);
      mx.beginPath(); mx.moveTo(...pts[0]); for (const p of pts) mx.lineTo(...p);
      const far = 3000; mx.lineTo(pts[48][0] - ca * far, pts[48][1] - sa * far); mx.lineTo(pts[0][0] - ca * far, pts[0][1] - sa * far); mx.fill();
    }
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-in'; mx.drawImage(B, 0, 0); mx.globalCompositeOperation = 'source-over';
    // A стирается там, где B
    const am = mk.cache || (mk.cache = mk()); const amx = am.getContext('2d');
    amx.setTransform(1, 0, 0, 1, 0, 0); amx.globalCompositeOperation = 'source-over'; amx.clearRect(0, 0, PW, PH); amx.drawImage(A, 0, 0);
    amx.setTransform(RS, 0, 0, RS, 0, 0); amx.globalCompositeOperation = 'destination-out'; amx.fillStyle = '#fff';
    if (kind === 'iris') { amx.beginPath(); front.forEach((p, i) => i ? amx.lineTo(...p) : amx.moveTo(...p)); amx.fill(); }
    else { const ang = kind === 'pour' ? Math.PI / 2 : (o.ang ?? 0), ca = Math.cos(ang), sa = Math.sin(ang), far = 3000;
      amx.beginPath(); amx.moveTo(...front[0]); for (const p of front) amx.lineTo(...p); amx.lineTo(front[48][0] - ca * far, front[48][1] - sa * far); amx.lineTo(front[0][0] - ca * far, front[0][1] - sa * far); amx.fill(); }
    amx.globalCompositeOperation = 'source-over'; amx.setTransform(1, 0, 0, 1, 0, 0);
    dx.drawImage(am, 0, 0); dx.drawImage(M, 0, 0); dx.setTransform(RS, 0, 0, RS, 0, 0);
    // валик сметённого песка вдоль фронта + разлёт крупинок
    dx.save(); dx.lineCap = 'round'; dx.lineJoin = 'round';
    const ridge = Math.sin(clamp(k) * Math.PI);
    dx.strokeStyle = `rgba(255,255,255,${.35 * ridge})`; dx.lineWidth = 34; path(dx, front); dx.stroke();
    dx.strokeStyle = `rgba(255,255,255,${.75 * ridge})`; dx.lineWidth = 9; path(dx, front); dx.stroke();
    for (let i = 0; i < front.length; i++) E.grains(dx, front[i][0], front[i][1], 40, 40, 22, i + seed * 31 + Math.floor(k * 30), .75 * ridge, 1.1);
    dx.restore(); dx.setTransform(1, 0, 0, 1, 0, 0); E.ctx = bx;
  };
  // один кадр без перехода
  E.single = function (draw) { E.compose(draw, null, 0); };

  // ---------- шейдер светового стола
  const vs = `#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
  const fs = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform sampler2D D; uniform vec2 res; uniform vec4 cam; uniform float t, warm, lampX, lampY, expo, dust, rs, gf, bandY;
  uniform vec3 cA, cB;
  float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  void main(){
    vec2 px = vec2(uv.x, 1.-uv.y)*res;                     // экранные пиксели (верх = 0)
    float c = cos(cam.w), s = sin(cam.w);
    vec2 q = (px - res*.5)/(cam.z*rs); q = vec2(c*q.x + s*q.y, -s*q.x + c*q.y); vec2 wp = q + cam.xy;   // мировые координаты
    float g1 = h(floor(wp*gf)), g2 = h(floor(wp*.62)+3.1), g3 = h(floor(px)+floor(t*12.)*17.);
    float clump = vn(wp*.045)*.6 + vn(wp*.13)*.4;
    vec2 j = (vec2(h(floor(wp*gf)+.7), h(floor(wp*gf)+5.3))-.5) * 2.2 * rs;  // зернистый край
    vec2 tu = (px + j)/res;
    float d0 = texture(D, tu).a;
    float d1 = 0.; for(int i=0;i<6;i++){ float a = float(i)*1.047 + g1*6.28; d1 += texture(D, tu + vec2(cos(a),sin(a))*2.2*rs/res).a; } d1/=6.;
    float d = mix(d0, d1, .45);
    float th = d*(.82 + .36*clump);
    th += (g1-.5)*.22*smoothstep(.02,.35,d)*(1.-smoothstep(.75,1.,d));    // отдельные зёрна в тонком слое
    th += (g2-.5)*.12*d;
    th += step(.9993, g1)*.3*dust;             // пылинки на чистом стекле
    th = max(th, 0.);
    float T = exp(-th*5.2);
    // лампа под стеклом: горячее пятно + спад к краям
    vec2 l = vec2(lampX, lampY)*res; float r = length((px - l)/res.y);
    float lamp = 1.15*exp(-r*r*2.1) + .25;
    vec3 back = mix(cB, cA, clamp(lamp-.2, 0., 1.)) * lamp;
    float bk = smoothstep(bandY + 10.*rs, bandY + 50.*rs, px.y);
    back = mix(back, vec3(1.25, 1.12, .92), bk);
    vec3 col = back * T;
    // ореол света через край (halation) — размытая плотность из мип-уровней
    float bl = textureLod(D, tu, 4.5 + log2(rs)).a, bl2 = textureLod(D, tu, 6. + log2(rs)).a;
    col += back * (exp(-bl*4.) - T) * .16 * (1.-d);
    col += cA * exp(-bl2*3.) * .05;
    // верхний свет: песок не абсолютно чёрный, видна фактура
    float top = (1.-T);
    col += vec3(.20,.12,.06) * top * (.25 + .9*g1) * (.35 + .65*clump) * .55;
    col += vec3(.33,.22,.12) * step(.992, g1) * top * .35;                  // блестящие песчинки
    col *= expo;
    // виньетка, зерно плёнки, мягкое тональное сжатие
    vec2 vv = uv-.5; col *= 1. - dot(vv*vec2(1.05,.8), vv*vec2(1.05,.8))*.9;
    col += (g3-.5)*.016;
    col = col/(1.+col*.18);
    col = pow(max(col, 0.), vec3(.95));
    o = vec4(col, 1);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const U = n => gl.getUniformLocation(pr, n);
  // свет: тёплый / холодный / золотой
  E.LIGHT = {
    warm: { a: [1.0, .84, .55], b: [.62, .30, .10] },
    cold: { a: [.70, .82, 1.0], b: [.12, .20, .36] },
    dusk: { a: [1.0, .66, .45], b: [.36, .14, .16] },
    gold: { a: [1.0, .90, .62], b: [.75, .42, .14] },
  };
  E.light = { a: E.LIGHT.warm.a, b: E.LIGHT.warm.b, x: .5, y: .42, expo: 1, dust: 1 };
  E.mixLight = (p, q, k) => ({ a: p.a.map((v, i) => lerp(v, q.a[i], k)), b: p.b.map((v, i) => lerp(v, q.b[i], k)) });
  E.present = function (t) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, D); gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform2f(U('res'), PW, PH); gl.uniform1f(U('rs'), RS); gl.uniform1f(U('gf'), RS > 1 ? 2.1 : 1.35); gl.uniform1f(U('bandY'), (E.bandY ?? 815) * RS); const c = E.cam; gl.uniform4f(U('cam'), c.x, c.y, c.z, c.r || 0);
    gl.uniform1f(U('t'), t); gl.uniform1f(U('lampX'), E.light.x); gl.uniform1f(U('lampY'), E.light.y);
    gl.uniform1f(U('expo'), E.light.expo); gl.uniform1f(U('dust'), E.light.dust);
    gl.uniform3f(U('cA'), ...E.light.a); gl.uniform3f(U('cB'), ...E.light.b);
    gl.viewport(0, 0, PW, PH); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  E.grab = function () { const px = new Uint8Array(PW * PH * 4); gl.readPixels(0, 0, PW, PH, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const o = new Uint8Array(PW * PH * 4), row = PW * 4; for (let y = 0; y < PH; y++) o.set(px.subarray((PH - 1 - y) * row, (PH - y) * row), y * row); return o; };
})();
