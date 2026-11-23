// DAY 214 — движок «живой скетчбук»: графит (кипящие линии, штриховка) + акварель (растекание, тёмные края, грануляция)
// на кремовой бумаге; страницы перелистываются (сгиб у корешка слева), поверх — наклейки с текстом.
// Слои страницы: G — плотность графита (альфа), C — акварель (цвет+альфа). Шейдер «печатает» их на бумагу в текстуру страницы,
// второй проход сводит две страницы (переворот) + верхний слой O (стикеры/текст).
(function () {
  const W = 720, H = 1280;
  const E = window.E = { W, H, T: 0, boil: 0, lw: 1 };
  const cv = document.getElementById('c'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const G = mk(), C = mk(), O = mk();
  const gx = G.getContext('2d'), cx = C.getContext('2d'), ox = O.getContext('2d');
  E.g = gx; E.c = cx; E.o = ox;

  // ---------- утилиты
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
  const eo = k => 1 - (1 - clamp(k)) ** 3;
  const ei = k => clamp(k) ** 3;
  const back = k => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  Object.assign(E, { clamp, lerp, ss, eio, eo, ei, back, hash, noise1, seg });

  // ---------- геометрия
  // кубическая Безье → точки
  E.bz = function (p0, p1, p2, p3, n = 16) {
    const o = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
              u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return o;
  };
  // гладкая кривая через точки (Катмулл-Ром)
  E.cr = function (P, n = 8, closed = false) {
    const o = [], L = P.length; if (L < 2) return P.slice();
    const g = i => closed ? P[(i + L) % L] : P[clamp(i, 0, L - 1)];
    const M = closed ? L : L - 1;
    for (let i = 0; i < M; i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        o.push([.5 * (2 * b[0] + (-a[0] + c[0]) * t + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * t2 + (-a[0] + 3 * b[0] - 3 * c[0] + d[0]) * t3),
                .5 * (2 * b[1] + (-a[1] + c[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * t3)]);
      }
    }
    o.push(closed ? P[0] : P[L - 1]);
    return o;
  };
  E.ell = function (x, y, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 28, rot = 0) {
    const o = [], cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), px = Math.cos(a) * rx, py = Math.sin(a) * ry; o.push([x + px * cr - py * sr, y + px * sr + py * cr]); }
    return o;
  };
  E.rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  E.tf = (P, f) => P.map(p => f(p[0], p[1]));
  function plen(P) { let l = 0; for (let i = 1; i < P.length; i++) l += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return l; }
  function cut(P, p) {
    if (p >= 1) return P; if (p <= 0) return [];
    const L = plen(P) * p, o = [P[0]]; let s = 0;
    for (let i = 1; i < P.length; i++) {
      const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (s + d < L) { o.push(P[i]); s += d; } else { const k = (L - s) / (d || 1); o.push([lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]); break; }
    }
    return o;
  }
  E.plen = plen; E.cut = cut; E.sidNow = () => sid; E.hid = () => E.measure || (E.rv !== undefined && E.rv < sid);

  // ---------- карандаш
  // кипение линии: смещение точки меняется 12 раз в секунду (как у рисованной анимации), но плавно вдоль линии
  let sid = 0;               // счётчик линий в кадре → у каждой своя «рука»
  function jit(P, j, s) {
    if (!j) return P;
    const b = E.boil * 7.31 + s * 1.37;
    return P.map((p, i) => [p[0] + noise1(b + i * .23) * j, p[1] + noise1(b + 50 + i * .23) * j]);
  }
  // pen(P, {w, a, p (доля нарисованного), j (дрожь), ctx, taper})
  E.pen = function (P, o = {}) {
    const c = o.ctx || gx, s = (o.s ?? sid++);
    if (E.measure) { E.lens[s - E.m0] = Math.max(4, plen(P)); return; }   // замер длины штрихов (для рисования с постоянной скоростью)
    let pp = o.p; if (E.rv !== undefined && o.s === undefined) { const q = clamp(E.rv - s); if (q <= 0) return; pp = Math.min(pp ?? 1, q); }
    let Q = pp !== undefined ? cut(P, pp) : P; if (Q.length < 2) return;
    if (E.rv !== undefined && o.s === undefined && pp < 1) { const m = c.getTransform(), e = Q[Q.length - 1]; E.tip = [m.a * e[0] + m.c * e[1] + m.e, m.b * e[0] + m.d * e[1] + m.f]; }
    const w = (o.w ?? 2.2) * E.lw, a = (o.a ?? .85) * (E.pa ?? 1), j = (o.j ?? 1.1) * E.lw;
    c.lineCap = 'round'; c.lineJoin = 'round';
    // 3 прохода: основной, «эхо» рядом, лёгкая строительная линия с перелётом концов
    const L0 = plen(Q), passes = (o.sketch === false || L0 < 30) ? 2 : 3;
    for (let pass = 0; pass < passes; pass++) {
      let R = jit(Q, j * [1, 1.5, 3.2][pass], s + pass * 9.7);
      if (pass === 2) { const n0 = R.length, a0 = R[0], a1 = R[1], z0 = R[n0 - 1], z1 = R[n0 - 2], e = 7 + 6 * hash(s);
        const d0 = Math.hypot(a0[0] - a1[0], a0[1] - a1[1]) || 1, d1 = Math.hypot(z0[0] - z1[0], z0[1] - z1[1]) || 1;
        R = [[a0[0] + (a0[0] - a1[0]) / d0 * e, a0[1] + (a0[1] - a1[1]) / d0 * e]].concat(R, [[z0[0] + (z0[0] - z1[0]) / d1 * e, z0[1] + (z0[1] - z1[1]) / d1 * e]]); }
      const n = R.length;
      const ww = [w, w * .5, w * .4][pass], aa = [a, a * .42, a * .2][pass];
      if (o.taper === false || n < 4) {
        c.strokeStyle = `rgba(255,255,255,${aa})`; c.lineWidth = ww; c.beginPath(); c.moveTo(R[0][0], R[0][1]);
        for (let i = 1; i < n; i++) c.lineTo(R[i][0], R[i][1]); c.stroke();
      } else {
        // концы тоньше и светлее — нажим карандаша
        const parts = 6;
        for (let k = 0; k < parts; k++) {
          const i0 = Math.floor(k * (n - 1) / parts), i1 = Math.floor((k + 1) * (n - 1) / parts); if (i1 <= i0) continue;
          const m = (k + .5) / parts, pr = Math.sin(Math.PI * m) ** .5;
          c.strokeStyle = `rgba(255,255,255,${aa * (.45 + .55 * pr)})`; c.lineWidth = ww * (.45 + .55 * pr);
          c.beginPath(); c.moveTo(R[i0][0], R[i0][1]); for (let i = i0 + 1; i <= i1; i++) c.lineTo(R[i][0], R[i][1]); c.stroke();
        }
      }
    }
  };
  // штриховка внутри контура: параллельные штрихи под углом, кипят вместе с линиями
  E.hatch = function (clip, o = {}) {
    const c = o.ctx || gx, ang = o.ang ?? -.9, gap = (o.gap ?? 7), w = (o.w ?? 1.3) * E.lw, s = sid++;
    if (E.measure) { E.lens[s - E.m0] = 90; return; }
    let a = (o.a ?? .35) * (E.pa ?? 1); if (E.rv !== undefined) { const q = clamp(E.rv - s); if (q <= 0) return; a *= q; }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of clip) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    c.save(); c.beginPath(); c.moveTo(clip[0][0], clip[0][1]); for (const p of clip) c.lineTo(p[0], p[1]); c.closePath(); c.clip();
    const cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 10;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    c.lineCap = 'round'; c.lineWidth = w;
    const b = E.boil * 3.7 + s;
    for (let d = -R, k = 0; d <= R; d += gap, k++) {
      const off = noise1(b + k * .9) * 1.6, l0 = -R * (1 - .25 * hash(k + s)), l1 = R * (1 - .25 * hash(k * 3 + s));
      const px = cxm - sa * (d + off), py = cym + ca * (d + off);
      c.strokeStyle = `rgba(255,255,255,${a * (.7 + .3 * hash(k * 7 + s))})`;
      c.beginPath(); c.moveTo(px + ca * l0, py + sa * l0); c.lineTo(px + ca * l1 + noise1(b + k) * 2, py + sa * l1); c.stroke();
    }
    if (o.cross) { E.hatch(clip, Object.assign({}, o, { ang: ang + 1.5, cross: false, a: a * .8 })); }
    c.restore();
  };
  // мягкий тон (растушёвка пальцем)
  E.tone = function (P, a = .2, blur = 6, ctx = gx) {
    if (E.measure) return; a *= (E.pa ?? 1);
    if (E.lateK !== undefined) { a *= ss(.5, .95, E.lateK); if (a <= 0) return; }   // тушёвка — после контура
    else if (E.rv !== undefined) { const q = clamp(E.rv - sid); if (q <= 0) return; a *= q; }
    ctx.save(); ctx.filter = `blur(${blur * E.lw}px)`; ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.restore();
  };
  // стереть графит (ластик) в области
  E.erase = function (P, a = 1, blur = 4, ctx = gx) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.filter = `blur(${blur}px)`; ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); ctx.restore();
  };

  // ---------- акварель
  // заливка контура с неровным краем; grow — растекание от центра (0..1); n — сид края
  E.wash = function (P, col, a = .6, o = {}) {
    if (E.measure) return;
    const c = o.ctx || cx, grow = (o.grow ?? 1) * (E.wg ?? 1); a *= (E.wa ?? 1); if (grow <= 0 || a <= 0) return;
    let mx = 0, my = 0; for (const p of P) { mx += p[0]; my += p[1]; } mx /= P.length; my /= P.length;
    if (o.cx !== undefined) { mx = o.cx; my = o.cy; }
    const sd = o.seed ?? 1, rough = o.rough ?? 5, wob = E.T * .15;
    const Q = P.map((p, i) => {
      const k = eo(grow), nx = noise1(sd * 3.1 + i * .37 + wob) * rough, ny = noise1(sd * 5.3 + i * .37 + 9 + wob) * rough;
      return [lerp(mx, p[0], k) + nx, lerp(my, p[1], k) + ny];
    });
    c.save(); c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    c.beginPath(); c.moveTo(Q[0][0], Q[0][1]); for (const p of Q) c.lineTo(p[0], p[1]); c.closePath(); c.fill();
    // второй, меньший слой — неравномерный пигмент
    if (o.layer !== false) {
      c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a * .35})`; c.beginPath();
      Q.forEach((p, i) => { const k = .82 + .1 * noise1(sd + i * .5); const x = lerp(mx, p[0], k), y = lerp(my, p[1], k); i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.closePath(); c.fill();
    }
    c.restore();
  };
  // клякса-пятно с неровным краем (цветение по мокрому)
  E.blot = function (x, y, r, col, a = .5, o = {}) {
    const n = 40, sd = o.seed ?? (x * .13 + y * .07), P = [];
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, rr = r * (1 + .22 * noise1(sd + Math.cos(t) * 2.1 + 3) + .12 * noise1(sd * 2 + Math.sin(t) * 4.3)); P.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr * (o.sy ?? 1)]); }
    E.wash(P, col, a, Object.assign({ rough: 2, layer: true }, o, { cx: x, cy: y }));
  };
  // цветовые константы акварели (r,g,b)
  E.PAL = {
    red: [205, 52, 48], rose: [232, 120, 120], blush: [240, 150, 140], ochre: [222, 160, 62], yellow: [246, 206, 96],
    sky: [118, 168, 214], blue: [58, 104, 170], teal: [70, 150, 150], green: [118, 160, 92], navy: [44, 60, 102],
    violet: [140, 108, 170], brown: [140, 96, 66], skin: [244, 196, 168], grey: [150, 150, 160], hood: [104, 128, 112]
  };

  // ---------- рукописный текст (Hershey futural печатными буквами, рукой: дрожь + нажим)
  const TC = new Map();
  E.textPolys = function (str, size = 60, align = 'c') {
    const key = str + '|' + size + '|' + align; if (TC.has(key)) return TC.get(key);
    const F = window.HFONT.futural, sc = size / 21; let pen = 0; const polys = [];
    for (const ch of str) {
      if (ch === ' ') { pen += 11; continue; }
      const g = F[ch.charCodeAt(0) - 33]; if (!g) continue;
      let mxx = -1e9, mn = 1e9; g[0].replace(/(-?\d+),(-?\d+)/g, (_, a) => { mxx = Math.max(mxx, +a); mn = Math.min(mn, +a); });
      const off = pen - mn;
      for (const sg of g[0].split('M').filter(s => s.trim())) { const pts = []; sg.replace(/(-?\d+),(-?\d+)/g, (_, a, b) => pts.push([(+a + off) * sc, +b * sc])); polys.push(pts); }
      pen = off + mxx + 3;
    }
    const w = pen * sc, ox0 = align === 'c' ? -w / 2 : align === 'r' ? -w : 0, oy = -size * .55;
    let L = 0; const out = polys.map(p => { const q = p.map(([a, b]) => [a + ox0, b + oy]); const l = plen(q); L += l; return { q, l }; });
    const r = { polys: out, L, w }; TC.set(key, r); return r;
  };
  // hand(str, x, y, size, p, {w, a, rot, ctx, j})
  E.hand = function (str, x, y, size, p = 1, o = {}) {
    const T = E.textPolys(str, size, o.align || 'c'); if (p <= 0) return T;
    const c = o.ctx || gx; const lim = T.L * clamp(p);
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot);
    let acc = 0, k = 0;
    for (const { q, l } of T.polys) {
      if (acc >= lim) break;
      const part = clamp((lim - acc) / l);
      if (o.color) { // цветной текст на верхнем слое (стикеры) — обычной краской
        const R = jit(cut(q, part), (o.j ?? 1) , 300 + k); if (R.length > 1) { c.strokeStyle = o.color; c.lineWidth = o.w ?? size * .1; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(R[0][0], R[0][1]); for (const p2 of R) c.lineTo(p2[0], p2[1]); c.stroke(); }
      } else E.pen(q, { ctx: c, w: o.w ?? size * .085, a: o.a ?? .95, p: part, j: o.j ?? 1, taper: false, s: 300 + k });
      acc += l; k++;
    }
    c.restore(); return T;
  };

  // ---------- WebGL
  const VS = `#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
  const NOISE = `
  float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }`;
  // проход 1: страница = бумага × акварель × графит
  const FS_PAGE = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform sampler2D G, C; uniform float T, warm; uniform vec2 R; ${NOISE}
  void main(){
    vec2 px = uv*R;
    // бумага: тёплый крем, волокна, зерно (бугорки)
    float fib = fbm(px*vec2(.012,.09)) * .6 + fbm(px*.035)*.4;
    float tooth = vn(px*.5)*.65 + vn(px*1.05)*.35;
    vec3 paper = vec3(.962,.936,.878) * (.965 + .05*fib) + (tooth-.5)*.018;
    // акварель: край чуть плывёт, пигмент оседает в ямках, по краю темнее
    vec2 d = vec2(fbm(px*.02+3.), fbm(px*.02+9.)) - .5;
    vec2 u2 = uv + d*vec2(6.,6.)/R + vec2(-3.,3.)/R;
    vec4 c = texture(C, vec2(u2.x, 1.-u2.y));
    vec4 cb = textureLod(C, vec2(u2.x, 1.-u2.y), 3.2);
    float a = c.a;
    vec3 rgb = a > .001 ? c.rgb : vec3(1.);
    float edge = clamp(a - cb.a*.92, 0., 1.);
    float gran = vn(px*.18)*.6 + vn(px*.45)*.4;
    float pig = clamp(a*(.78 + .38*(gran-.5)*2.*.5 + .1*(1.-tooth)) + edge*1.15, 0., 1.);
    vec3 dye = mix(rgb, rgb*rgb*.92, clamp(edge*1.6,0.,1.));
    vec3 col = paper * mix(vec3(1.), dye, pig);
    // графит: ложится на бугорки бумаги, плотный — блестит холодным серым
    float g = texture(G, vec2(uv.x, 1.-uv.y)).a;
    float ge = g * mix(.3, 1.08, smoothstep(.3, .78, tooth*1.1 + g*.28 + (vn(px*1.3)-.5)*.18));
    ge = clamp(ge, 0., 1.);
    vec3 lead = vec3(.17,.17,.2);
    col = mix(col, col*lead/.95, ge*.92);
    o = vec4(col, 1.);
  }`;
  // проход 2: сведение — переворот страницы A над B + верхний слой O + свет лампы
  const FS_COMP = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform sampler2D A, B, O; uniform float flip, T, fade, shake; uniform vec2 R; ${NOISE}
  void main(){
    vec2 q = uv;
    vec3 col;
    float th = flip * 1.5707;         // 0..90°
    float cw = cos(th);
    if (flip <= 0.) col = texture(A, q).rgb;
    else {
      float xe = cw;                  // правый край переворачиваемой страницы
      if (q.x < xe) {
        float u = q.x / xe;
        float s = 1. + .16*sin(th)*u; // дальний край ближе к зрителю — выше
        float v = (q.y - .5)/s + .5;
        if (v < 0. || v > 1.) col = texture(B, q).rgb * (1. - .35*(1.-cw));
        else {
          col = texture(A, vec2(u, v)).rgb;
          col *= 1. - .28*sin(th)*(.4+.6*u) - .1*pow(u, 6.)*sin(th);   // страница уходит от света
          col += .05*sin(th)*smoothstep(.85, 1., u);                     // блик на сгибе
        }
      } else {
        col = texture(B, q).rgb;
        float sh = exp(-(q.x - xe) * 9.) * sin(th) * .45;               // тень от поднятой страницы
        col *= 1. - sh;
      }
    }
    // верхний слой (стикеры и надписи): обычные цвета × зерно бумаги
    vec4 ov = texture(O, vec2(q.x, 1.-q.y));
    float tooth = vn(q*R*.55);
    col = mix(col, ov.rgb*(.97+.05*tooth), ov.a);
    // настольная лампа: тёплое пятно сверху-слева, мягкая виньетка
    vec2 lp = q - vec2(.35, .72);
    float lamp = exp(-dot(lp*vec2(1.,.62), lp*vec2(1.,.62))*2.4);
    col *= mix(.8, 1.06, lamp);
    col *= mix(vec3(1.), vec3(1.04,1.,.92), .5);
    float vig = smoothstep(1.25, .45, length((q-.5)*vec2(1.,.7)));
    col *= mix(.72, 1., vig);
    col = mix(col, vec3(.06,.05,.05), fade);
    // плёночное зерно
    col += (h21(q*R + fract(T*7.)*91.) - .5) * .022;
    o = vec4(col, 1.);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  const PP = prog(FS_PAGE), PC = prog(FS_COMP);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  function bindQuad(p) { const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); }
  function tex(mip) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const tG = tex(false), tC = tex(true), tO = tex(false);
  const pages = [0, 1].map(() => { const t = tex(false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f }; });
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  function up(t, c, mip) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); if (mip) gl.generateMipmap(gl.TEXTURE_2D); }
  function reset(c) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); }

  // камера внутри страницы: (x,y) — центр, z — зум
  E.cam = function (x = W / 2, y = H / 2, z = 1, r = 0) {
    for (const c of [gx, cx]) { c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.rotate(r); c.scale(z, z); c.translate(-x, -y); }
    E.lw = 1 / Math.sqrt(z);   // при наезде линии толстеют, но не пропорционально
  };
  // нарисовать страницу в слот (0 — верхняя/текущая, 1 — нижняя/следующая)
  E.page = function (slot, fn) {
    reset(gx); reset(cx); sid = 0; E.cam(); fn();
    up(tG, G, false); up(tC, C, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, pages[slot].f); gl.viewport(0, 0, W, H);
    gl.useProgram(PP); bindQuad(PP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tG); gl.uniform1i(gl.getUniformLocation(PP, 'G'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tC); gl.uniform1i(gl.getUniformLocation(PP, 'C'), 1);
    gl.uniform1f(gl.getUniformLocation(PP, 'T'), E.T); gl.uniform2f(gl.getUniformLocation(PP, 'R'), W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  E.overlay = function (fn) { reset(ox); if (fn) fn(ox); };
  E.compose = function (flip = 0, fade = 0) {
    up(tO, O, false);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.useProgram(PC); bindQuad(PC);
    [['A', pages[0].t], ['B', pages[1].t], ['O', tO]].forEach(([n, t], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(gl.getUniformLocation(PC, n), i); });
    gl.uniform1f(gl.getUniformLocation(PC, 'flip'), flip); gl.uniform1f(gl.getUniformLocation(PC, 'fade'), fade);
    gl.uniform1f(gl.getUniformLocation(PC, 'T'), E.T); gl.uniform2f(gl.getUniformLocation(PC, 'R'), W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  E.grab = function () { const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const o = new Uint8Array(W * H * 4), row = W * 4; for (let y = 0; y < H; y++) o.set(px.subarray((H - 1 - y) * row, (H - y) * row), y * row); return o; };

  // ---------- стикер с надписью (верхний слой): бумажка с тенью, текст тёмным карандашом
  E.note = function (c, x, y, w, h, rot, lines, p = 1, o = {}) {
    if (p <= 0) return;
    const k = eo(clamp(p * 3)); c.save(); c.translate(x, y); c.rotate(rot + (1 - k) * .2); c.scale(lerp(.85, 1, k), lerp(.85, 1, k)); c.globalAlpha = k;
    c.fillStyle = 'rgba(40,30,20,.22)'; c.filter = 'blur(10px)'; c.fillRect(-w / 2 + 8, -h / 2 + 14, w, h); c.filter = 'none';
    c.fillStyle = o.bg || '#f7f0dc'; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2 + 3); c.lineTo(w / 2 - 2, h / 2); c.lineTo(-w / 2 + 3, h / 2 - 2); c.closePath(); c.fill();
    if (o.tape !== false) { c.fillStyle = 'rgba(236,226,196,.82)'; c.save(); c.rotate(-.06); c.fillRect(-55, -h / 2 - 16, 110, 32); c.restore(); }
    c.globalAlpha = 1;
    const tp = clamp((p - .12) / .88), n = lines.length;
    lines.forEach((ln, i) => {
      const [s, sz] = Array.isArray(ln) ? ln : [ln, o.size || 54];
      E.hand(s, 0, (i - (n - 1) / 2) * (o.lh || sz * 1.35), sz, clamp(tp * n - i), { ctx: c, color: o.ink || '#2b2a30', w: sz * .1 });
    });
    c.restore();
  };
})();

// рисование «по-настоящему»: штрихи появляются по длине с постоянной скоростью, E.tip — где сейчас кончик карандаша (пиксели холста)
(function () {
  const cache = new Map();
  E.drawLive = function (key, fn, k) {
    if (!cache.has(key)) {
      E.measure = true; E.lens = []; E.m0 = E.sidNow(); const g = E.g, c = E.c; g.save(); c.save(); fn(); g.restore(); c.restore(); E.measure = false;
      const L = E.lens.map(v => v || 0), cum = [0]; for (const v of L) cum.push(cum[cum.length - 1] + v); cache.set(key, { L, cum });
    }
    const { L, cum } = cache.get(key), tot = cum[cum.length - 1], tg = E.clamp(k) * tot;
    let i = 0; while (i < L.length - 1 && cum[i + 1] <= tg) i++;
    const s0 = E.sidNow(); E.tip = null;
    E.rv = k >= 1 ? 1e9 : s0 + i + (L[i] ? (tg - cum[i]) / L[i] : 0); E.lateK = k;
    fn(); E.rv = undefined; E.lateK = undefined;
    return E.tip;
  };
})();
