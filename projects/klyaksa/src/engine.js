// КЛЯКСА — движок «тушь на свитке».
// Холст K (2D, 'lighter'): R = тушь, G = киноварь, B = золотой свет. Холст X (пол-размера): R = вода (линза), G = размыв туши.
// Шейдер: бумага с волокнами (привязана к миру), рваный край, затёк к краю пятна, грануляция, размыв водой, bloom золота.
'use strict';
const W = 720, H = 1280, PW = 1000, PH = 2400;            // экран и свиток (мир)
const E = {};
(function () {
  const cv = document.getElementById('c');
  const K = document.createElement('canvas'); K.width = W; K.height = H;
  const k = K.getContext('2d');
  const X = document.createElement('canvas'); X.width = W / 2; X.height = H / 2;
  const x = X.getContext('2d');
  const G = document.createElement('canvas'); G.width = W / 4; G.height = H / 4; const g4 = G.getContext('2d');
  E.k = k; E.x = x; E.K = K; E.X = X;
  // ---------- шум
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function n1(t) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; }
  function n2(a, b) { const i = Math.floor(a), j = Math.floor(b), f = a - i, g = b - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
    const h = (p, q) => hash(p * 57.3 + q * 113.1); return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v; }
  E.hash = hash; E.n1 = n1; E.n2 = n2;
  // ---------- ключи и сглаживание
  const ez = {
    l: t => t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, o: t => 1 - Math.pow(1 - t, 3), i: t => t * t * t,
    o2: t => 1 - (1 - t) * (1 - t), s: t => t * t * (3 - 2 * t),
    back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    el: t => t === 0 || t === 1 ? t : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * 2.09) + 1,
  };
  E.ez = ez;
  E.cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  E.lerp = (a, b, t) => a + (b - a) * t;
  E.seg = (t, a, b, e = 'l') => ez[e](E.cl((t - a) / (b - a)));   // 0..1 на отрезке
  // K(t, [[t0, v0], [t1, v1, 'io'], ...]) — значения могут быть числами или массивами
  E.K = function (t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; const u = ez[e || 'io']((t - t0) / (t1 - t0));
        return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * u) : v0 + (v1 - v0) * u; }
    }
    return keys[keys.length - 1][1];
  };
  // ---------- камера
  E.cam = { x: 500, y: 600, z: 1, r: 0, sx: 0, sy: 0 };
  E.scale = () => .72 * E.cam.z;
  E.apply = function (c, res = 1) {
    const s = E.scale() * res, cm = E.cam, cs = Math.cos(cm.r), sn = Math.sin(cm.r);
    c.setTransform(s * cs, s * sn, -s * sn, s * cs, (W / 2 + cm.sx) * res, (H / 2 + cm.sy) * res);
    c.translate(-cm.x, -cm.y);
  };
  E.toScreen = (wx, wy) => { const s = E.scale(), cm = E.cam, dx = wx - cm.x, dy = wy - cm.y, cs = Math.cos(cm.r), sn = Math.sin(cm.r);
    return [W / 2 + cm.sx + s * (dx * cs - dy * sn), H / 2 + cm.sy + s * (dx * sn + dy * cs)]; };
  E.view = () => { const s = E.scale(), cm = E.cam, hw = W / 2 / s * 1.25, hh = H / 2 / s * 1.25; return [cm.x - hw, cm.y - hh, cm.x + hw, cm.y + hh]; };
  E.vis = (x0, y0, x1, y1) => { const v = E.view(); return !(x1 < v[0] || x0 > v[2] || y1 < v[1] || y0 > v[3]); };
  // ---------- краски
  const CH = { ink: [255, 0, 0], red: [0, 255, 0], gold: [0, 0, 255] };
  E.col = (ch, a) => { const c = CH[ch]; return `rgba(${c[0]},${c[1]},${c[2]},${E.cl(a)})`; };
  E.ctx = k;   // текущий холст рисования (можно временно подменить на кэш)
  // ---------- мазок кистью: полосы-щетинки с сухой кистью (飞白)
  // pts: [[x,y,w],...] — опорные точки (ширина в каждой), o: {a, ch, dry, prog, seed, bands, step, taper, press}
  function spline(pts, step) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(1, Math.ceil(d / step));
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, e) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (-a + 3 * b - 3 * c + e) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), (p1[2] ?? 6) * (1 - t) + (p2[2] ?? 6) * t]);
      }
    }
    const l = pts[pts.length - 1]; out.push([l[0], l[1], l[2] ?? 6]); return out;
  }
  E.spline = spline;
  E.stroke = function (pts, o = {}) {
    const c = o.ctx || E.ctx, a = o.a ?? .92, ch = o.ch || 'ink', dry = o.dry ?? .25, prog = o.prog ?? 1, seed = o.seed ?? 1;
    const B = o.bands ?? 7, step = o.step ?? 2.5, taper = o.taper ?? .35, press = o.press ?? .12;
    if (prog <= 0) return;
    const P = spline(pts, step), n = P.length; if (n < 2) return;
    const L = [0]; for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const tot = L[n - 1] || 1, end = tot * prog;
    // нормали и профиль ширины (нажим в начале, сход на конце)
    const N = [], WD = [];
    for (let i = 0; i < n; i++) {
      const a0 = P[Math.max(0, i - 1)], a1 = P[Math.min(n - 1, i + 1)]; let dx = a1[0] - a0[0], dy = a1[1] - a0[1]; const d = Math.hypot(dx, dy) || 1;
      N.push([-dy / d, dx / d]);
      const u = L[i] / tot; let w = P[i][2];
      if (u < press) w *= .55 + .45 * Math.sin(u / press * Math.PI / 2);
      if (u > 1 - taper) w *= Math.pow(Math.max(0, (1 - u) / taper), .7) * .85 + .15 * (1 - (u - 1 + taper) / taper);
      w *= 1 + .12 * (n1(L[i] * .03 + seed * 7) - .5);
      WD.push(Math.max(.3, w));
    }
    // кончик, который ещё рисуется: сужение у текущей точки
    for (let b = 0; b < B; b++) {
      const lo = -.5 + b / B - .012, hi = -.5 + (b + 1) / B + .012;
      const ba = a * (.78 + .3 * hash(seed * 31 + b * 7.7));
      let run = [];
      const flush = () => {
        if (run.length > 1) {
          c.beginPath();
          for (let j = 0; j < run.length; j++) { const i = run[j]; const wl = WD[i] * (lo + .04 * (n1(L[i] * .2 + b * 9 + seed) - .5)); c[j ? 'lineTo' : 'moveTo'](P[i][0] + N[i][0] * wl, P[i][1] + N[i][1] * wl); }
          for (let j = run.length - 1; j >= 0; j--) { const i = run[j]; const wh = WD[i] * (hi + .04 * (n1(L[i] * .2 + b * 5 + seed + 3) - .5)); c.lineTo(P[i][0] + N[i][0] * wh, P[i][1] + N[i][1] * wh); }
          c.closePath(); c.fillStyle = E.col(ch, ba); c.fill();
        }
        run = [];
      };
      const edge = Math.abs(lo + hi) / 2 * 2;   // крайние щетинки сохнут раньше
      for (let i = 0; i < n; i++) {
        if (L[i] > end) break;
        const u = L[i] / tot;
        const thr = dry * (.35 + 1.3 * Math.pow(u, 1.4) + .7 * edge) - .1;
        const nz = n1(L[i] * (.045 + .02 * hash(b + seed)) + b * 17.3 + seed * 3.1) * .7 + n1(L[i] * .3 + b * 3.3 + seed) * .3;
        if (nz > thr) run.push(i); else flush();
      }
      flush();
    }
  };
  // линия постоянной ширины (тонкие детали: усы, контуры глаз), с лёгкой дрожью
  E.line = function (pts, w, a = .9, ch = 'ink', ctx) {
    E.stroke(pts.map(p => [p[0], p[1], p[2] ?? w]), { a, ch, bands: 2, dry: .05, taper: .3, press: .1, step: 2, ctx });
  };
  // ---------- пятно (клякса, камень, облако): шумный замкнутый контур
  E.blobPath = function (cx, cy, r, wob = .15, seed = 1, t = 0, sx = 1, sy = 1, rot = 0, nPts = 56) {
    const c = E.ctx; c.beginPath();
    for (let i = 0; i <= nPts; i++) {
      const an = i / nPts * Math.PI * 2;
      const rr = r * (1 + wob * (n2(Math.cos(an) * 1.3 + seed * 3, Math.sin(an) * 1.3 + t) - .5) * 2 + wob * .4 * (n2(Math.cos(an) * 3.7 + seed, Math.sin(an) * 3.7 - t * 1.7) - .5));
      let px = Math.cos(an) * rr * sx, py = Math.sin(an) * rr * sy;
      const cs = Math.cos(rot), sn = Math.sin(rot);
      const X_ = cx + px * cs - py * sn, Y_ = cy + px * sn + py * cs;
      c[i ? 'lineTo' : 'moveTo'](X_, Y_);
    }
    c.closePath();
  };
  E.blob = function (cx, cy, r, a = .95, ch = 'ink', wob = .15, seed = 1, t = 0, sx = 1, sy = 1, rot = 0) {
    E.blobPath(cx, cy, r, wob, seed, t, sx, sy, rot); E.ctx.fillStyle = E.col(ch, a); E.ctx.fill();
  };
  E.erase = function (fn) {   // нарисовать «бумагу» (стереть все краски) — белки глаз
    const c = E.ctx, g = c.globalCompositeOperation; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.strokeStyle = '#000'; fn(c); c.globalCompositeOperation = g;
  };
  E.poly = function (pts, a, ch = 'ink') { const c = E.ctx; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.closePath(); c.fillStyle = E.col(ch, a); c.fill(); };
  // ---------- кэш мягких слоёв (заливки с размытием), в мировых координатах
  const CACHE = {};
  E.cache = function (key, x0, y0, w, h, res, blur, fn) {
    let o = CACHE[key];
    if (!o) {
      const pad = blur * 3; const c = document.createElement('canvas');
      c.width = Math.ceil((w + pad * 2) * res); c.height = Math.ceil((h + pad * 2) * res);
      const cc = c.getContext('2d'); cc.fillStyle = '#000'; cc.fillRect(0, 0, c.width, c.height);
      cc.globalCompositeOperation = 'lighter';
      if (blur) cc.filter = `blur(${blur * res}px)`;
      cc.setTransform(res, 0, 0, res, (pad - x0) * res, (pad - y0) * res);
      const prev = E.ctx; E.ctx = cc; fn(cc); E.ctx = prev;
      o = CACHE[key] = { c, x0: x0 - pad, y0: y0 - pad, w: w + pad * 2, h: h + pad * 2 };
    }
    return o;
  };
  E.draw = function (o, alpha = 1) {
    if (!E.vis(o.x0, o.y0, o.x0 + o.w, o.y0 + o.h)) return;
    const c = E.ctx; const ga = c.globalAlpha; c.globalAlpha = alpha; c.drawImage(o.c, o.x0, o.y0, o.w, o.h); c.globalAlpha = ga;
  };
  // ---------- WebGL постобработка
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  E.gl = gl;
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}';
  const FS = `precision highp float;varying vec2 v;uniform sampler2D tK,tX,tG;uniform vec2 R;uniform vec4 C;uniform float T,FL,FD,FDC,GR,BOIL,SH;
  float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
  float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
  vec2 toW(vec2 px){vec2 d=(px-R*.5-C.zw*0.)/ (C.z);return C.xy+d;}
  void main(){
    vec2 px=vec2(v.x,1.-v.y)*R;                          // экранные пиксели, y вниз
    float s=C.z; vec2 wp=C.xy+(px-R*.5)/s;                // мировые координаты (поворот камеры мал — пренебрегаем)
    vec2 uv=vec2(v.x,1.-v.y);
    // вода: линза
    vec2 e=vec2(2./R.x,2./R.y)*2.;
    float wh=texture2D(tX,uv).r;
    vec2 g=vec2(texture2D(tX,uv+vec2(e.x,0)).r-texture2D(tX,uv-vec2(e.x,0)).r,texture2D(tX,uv+vec2(0,e.y)).r-texture2D(tX,uv-vec2(0,e.y)).r);
    float dis=texture2D(tX,uv).g;
    vec2 ruv=uv-g*.09;
    // рваный край по волокнам бумаги + «живая» дрожь
    float fq=.9;
    vec2 wob=vec2(fb(wp*fq+vec2(BOIL*3.1,0.)),fb(wp*fq+vec2(5.2,BOIL*2.3)))-.5;
    vec2 wob2=vec2(n(wp*.08+3.),n(wp*.08+9.))-.5;
    vec2 su=ruv+(wob*1.6+wob2*(1.5+10.*dis))/R;
    vec4 k0=texture2D(tK,su);
    // размытие для затёка к краю и для размыва водой
    float r1=2.2+11.*dis; vec3 b=vec3(0.);
    for(int i=0;i<10;i++){float a=float(i)*2.39996+T*0.;float rr=r1*sqrt((float(i)+.5)/10.);b+=texture2D(tK,su+vec2(cos(a),sin(a))*rr/R).rgb;}
    b/=10.;
    vec3 d=mix(k0.rgb,b,clamp(dis*1.2,0.,1.));
    d.r*=1.-.6*dis; d.g*=1.-.5*dis;
    float edg=max(0.,k0.r-b.r)*(1.-dis), edgR=max(0.,k0.g-b.g);
    // бумага
    float fib=0.;
    for(int i=0;i<3;i++){float an=float(i)*1.9+.4;mat2 m=mat2(cos(an),-sin(an),sin(an),cos(an));vec2 q=m*wp;fib+=n(vec2(q.x*.9,q.y*.06+float(i)*7.))*.33;}
    float pn=fb(wp*.012), gr=n(wp*1.6)*.5+n(wp*3.3)*.5;
    vec3 paper=vec3(.938,.905,.835)*(.95+.06*pn)-vec3(.035,.03,.02)*smoothstep(.55,.85,fib);
    paper-=vec3(.05,.045,.03)*smoothstep(.45,.9,fb(wp*.004+2.));
    // монтировка свитка вне бумаги
    float out_=max(max(-wp.x,wp.x-${PW}.),max(-wp.y,wp.y-${PH}.));
    vec3 silk=vec3(.16,.2,.22)*(.85+.25*n(wp*.3)+.12*sin(wp.x*.6+sin(wp.y*.25)*3.)*sin(wp.y*.6));
    // тушь
    float dd=d.r+edg*1.35;
    dd*=mix(1.,.72+.5*gr,.5*(1.-smoothstep(.3,.9,dd)));
    float A=1.-exp(-dd*2.6);A=clamp(A/(1.-exp(-2.6)),0.,1.);
    vec3 inkC=mix(vec3(.30,.31,.34),vec3(.05,.05,.07),smoothstep(.15,.9,A));
    float om=smoothstep(0.,1.5,out_)*(1.-texture2D(tX,uv).b);
    paper=mix(paper,silk,om);
    paper=mix(paper,vec3(.55,.42,.2),smoothstep(1.5,0.,abs(out_-2.))*.7*(1.-texture2D(tX,uv).b));
    vec3 col=mix(paper,inkC,A);
    float rd=clamp(d.g+edgR*1.1,0.,1.)*(.85+.25*gr);
    col=mix(col,mix(vec3(.80,.24,.14),vec3(.62,.10,.07),rd*rd),clamp(rd*1.05,0.,1.)*(1.-A*.6));
    // золото: свечение
    float gl0=k0.b, gb=texture2D(tG,uv).b*1.6;
    col=mix(col,vec3(.95,.72,.25),clamp(gl0,0.,1.)*.9);
    col+=vec3(1.,.72,.3)*gb*.9+vec3(1.,.85,.5)*gl0*.25;
    // вода: блик и тень
    vec3 nn=normalize(vec3(-g*14.,1.));
    float rim=smoothstep(.02,.12,wh)*(1.-smoothstep(.12,.45,wh));
    col*=1.-.28*rim;
    col+=vec3(.95,.97,1.)*pow(clamp(dot(nn,normalize(vec3(-.45,.55,.7))),0.,1.),40.)*step(.03,wh)*1.1;
    col+=vec3(1.,.98,.9)*.10*smoothstep(.3,.9,wh)*clamp(dot(nn,normalize(vec3(.3,-.4,.8))),0.,1.);
    // свет, виньетка, зерно
    vec2 q=uv-.5; col*=1.-.32*dot(q*vec2(1.,.7),q*vec2(1.,.7))*1.8;
    col+=FL*vec3(1.,.9,.7);
    col=mix(col,vec3(FDC),FD);
    col+=(h(px+fract(T*7.)*100.)-.5)*GR;
    gl_FragColor=vec4(col,1.);
  }`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  function tex(u) { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  const tK = tex(0), tX = tex(1), tG = tex(2);
  const U = n => gl.getUniformLocation(pr, n);
  gl.uniform1i(U('tK'), 0); gl.uniform1i(U('tX'), 1); gl.uniform1i(U('tG'), 2); gl.uniform2f(U('R'), W, H);
  E.post = { FL: 0, FD: 0, FDC: .93, GR: .035 };
  E.begin = function () {
    k.setTransform(1, 0, 0, 1, 0, 0); k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1; k.filter = 'none'; k.fillStyle = '#000'; k.fillRect(0, 0, W, H);
    k.globalCompositeOperation = 'lighter'; E.apply(k);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, W / 2, H / 2);
    x.globalCompositeOperation = 'lighter'; E.apply(x, .5);
    E.ctx = k;
  };
  E.end = function (t) {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tK); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, K);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tX); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, X);
    g4.globalCompositeOperation = 'source-over'; g4.filter = 'none'; g4.fillStyle = '#000'; g4.fillRect(0, 0, W / 4, H / 4);
    g4.filter = 'blur(7px)'; g4.drawImage(K, 0, 0, W / 4, H / 4); g4.filter = 'none';
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tG); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, G);
    const cm = E.cam; gl.uniform4f(U('C'), cm.x - cm.sx / E.scale(), cm.y - cm.sy / E.scale(), E.scale(), 0);
    gl.uniform1f(U('T'), t); gl.uniform1f(U('BOIL'), Math.floor(t * 8) * .37);
    for (const kk of ['FL', 'FD', 'FDC', 'GR']) gl.uniform1f(U(kk), E.post[kk]);
    gl.viewport(0, 0, W, H); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  // FX-холст: вода и размыв (рисовать в мировых координатах)
  E.fx = function (fn) { const prev = E.ctx; E.ctx = x; fn(x); E.ctx = prev; };
  E.waterDrop = function (cx, cy, r, a = 1, sy = 1) {   // линза воды
    E.fx(c => { const g = c.createRadialGradient(cx, cy, 0, cx, cy, r); for (let i = 0; i <= 10; i++) { const q = i / 10; g.addColorStop(q, `rgba(${Math.round(255 * Math.sqrt(1 - q * q) * a)},0,0,1)`); }
      c.save(); c.translate(cx, cy); c.scale(1, sy); c.translate(-cx, -cy); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); c.restore(); });
  };
  E.dissolve = function (cx, cy, r, a = 1) {
    E.fx(c => { const g = c.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(0,255,0,${a})`); g.addColorStop(.6, `rgba(0,200,0,${a * .8})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); });
  };
  E.grab = function () { const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const o = new Uint8Array(W * H * 4), row = W * 4; for (let y = 0; y < H; y++) o.set(px.subarray((H - 1 - y) * row, (H - y) * row), y * row); return o; };
})();
