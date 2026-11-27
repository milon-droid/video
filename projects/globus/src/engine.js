// SNOW GLOBE — движок «макросъёмка снежного шара».
// Мир шара — 3 расписные плоскости на разной глубине (z), снег — частицы в вязкой жидкости.
// Шейдер для каждого пикселя: луч камеры × сфера → френель-отражение комнаты, преломление по Снеллю в жидкость
// (n=1.33, выше уровня — воздух), пересечение плоскостей-слоев, преломление поверхности воды, выход из шара,
// полное внутреннее отражение, фон-боке за шаром с хроматической аберрацией. Второй проход — блум, зерно, виньетка, титры.
(function () {
  const W = 720, H = 1280;
  const E = window.E = { W, H };
  const cv = document.getElementById('c');
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // слои: 0 — дальний, 1 — средний, 2 — ближний
  const LW = 1024, LH = 1536;
  E.L = [0, 1, 2].map(() => mk(LW, LH)); E.lx = E.L.map(c => c.getContext('2d'));
  E.OUT = mk(936, 1664); E.ox = E.OUT.getContext('2d');           // мир снаружи: «экранные» px −108…828 × −192…1472
  E.OV = mk(W, H); E.vx = E.OV.getContext('2d');                    // передний план: руки, подставка, коробка, титры

  // ---------- утилиты
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
  const eo = k => 1 - (1 - clamp(k)) ** 3;
  const back = k => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  const v3 = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
  Object.assign(E, { clamp, lerp, ss, eio, eo, back, hash, noise1, v3 });

  // ---------- шар: поворот вокруг точки опоры (низ подставки) + сдвиг; камера переводится в систему шара
  // rotX/rotZ — наклон, off — сдвиг; всё в единицах радиуса шара
  function rotM(rx, rz) { const cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
    // R = Rz * Rx
    return [[cz, -sz * cx, sz * sx], [sz, cz * cx, -cz * sx], [0, sx, cx]]; }
  const mv = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];
  const mtv = (M, p) => [M[0][0] * p[0] + M[1][0] * p[1] + M[2][0] * p[2], M[0][1] * p[0] + M[1][1] * p[1] + M[2][1] * p[2], M[0][2] * p[0] + M[1][2] * p[1] + M[2][2] * p[2]];
  const PIV = [0, -1.25, 0];
  E.globe = { rx: 0, rz: 0, off: [0, 0, 0] };
  // мир → шар и обратно
  E.toG = p => { const g = E.globe, M = rotM(g.rx, g.rz); return v3.add(mtv(M, v3.sub(v3.sub(p, g.off), PIV)), PIV); };
  E.fromG = p => { const g = E.globe, M = rotM(g.rx, g.rz); return v3.add(v3.add(mv(M, v3.sub(p, PIV)), PIV), g.off); };
  E.dirG = d => { const g = E.globe, M = rotM(g.rx, g.rz); return mtv(M, d); };

  // ---------- камера в мире (не в шаре): pos, target, fov (верт., градусы), roll
  E.cam = { p: [0, 0, 5], t: [0, 0, 0], fov: 40, roll: 0 };
  function camBasis() {
    const c = E.cam, f = v3.norm(v3.sub(c.t, c.p)); let r = v3.norm(v3.cross(f, [0, 1, 0])); let u = v3.cross(r, f);
    const cr = Math.cos(c.roll), sr = Math.sin(c.roll); const r2 = v3.add(v3.mul(r, cr), v3.mul(u, sr)), u2 = v3.sub(v3.mul(u, cr), v3.mul(r, sr));
    return { f, r: r2, u: u2, tan: Math.tan(c.fov * Math.PI / 360) };
  }
  // мировая точка → экран (px 720×1280); z — глубина
  E.project = function (p) {
    const b = camBasis(), d = v3.sub(p, E.cam.p), z = v3.dot(d, b.f);
    const x = v3.dot(d, b.r) / (z * b.tan), y = v3.dot(d, b.u) / (z * b.tan);
    return { x: W / 2 + x * H / 2, y: H / 2 - y * H / 2, z, s: H / 2 / (z * b.tan) }; // s — px на единицу на этой глубине
  };
  E.projG = p => E.project(E.fromG(p));   // точка в системе шара → экран

  // ---------- слои: окна (прямоугольник плоскости z, который виден) и перевод контекста в единицы шара
  E.LZ = [-0.42, 0.02, 0.42];
  E.LWIN = [[-1, -1, 1, 1], [-1, -1, 1, 1], [-1, -1, 1, 1]];
  E.OUTOFF = [0, 0]; // сдвиг фона (px) — фон «качается» при тряске
  function windows(b, cpG, fG, rG, uG) {
    const asp = W / H, m = 1.25;
    for (let i = 0; i < 3; i++) {
      const z = E.LZ[i]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, ok = 0;
      const inside = Math.hypot(...cpG) < 1;
      if (!inside) { E.LWIN[i] = [-1.02, -1.02, 1.02, 1.02]; continue; }
      for (const sx of [-1, -.5, 0, .5, 1]) for (const sy of [-1, -.5, 0, .5, 1]) {
        const d = v3.norm(v3.add(fG, v3.add(v3.mul(rG, sx * asp * b.tan * m), v3.mul(uG, sy * b.tan * m))));
        if (Math.abs(d[2]) < 1e-4) continue; const t = (z - cpG[2]) / d[2]; if (t <= 0) continue;
        const x = cpG[0] + d[0] * t, y = cpG[1] + d[1] * t; ok++;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      if (!ok) { E.LWIN[i] = [-1.02, -1.02, 1.02, 1.02]; continue; }
      x0 = Math.max(x0, -1.02); y0 = Math.max(y0, -1.02); x1 = Math.min(x1, 1.02); y1 = Math.min(y1, 1.02);
      if (x1 - x0 < .05 || y1 - y0 < .05) { x0 = -1.02; y0 = -1.02; x1 = 1.02; y1 = 1.02; }
      E.LWIN[i] = [x0, y0, x1, y1];
    }
  }
  E.layerCtx = function (i) {
    const c = E.lx[i], w = E.LWIN[i];
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.setTransform(LW / (w[2] - w[0]), 0, 0, -LH / (w[3] - w[1]), -w[0] * LW / (w[2] - w[0]), w[3] * LH / (w[3] - w[1]));
    c.lineCap = 'round'; c.lineJoin = 'round';
    return c;
  };
  // px слоя на единицу (для толщин линий)
  E.lpx = i => LW / (E.LWIN[i][2] - E.LWIN[i][0]);

  // ---------- снег в жидкости (детерминированно по времени): шейки — [{t, s, x}] (x — откуда толчок)
  E.SHAKES = [];
  const NS = 520, FL = [];
  for (let i = 0; i < NS; i++) {
    const a = hash(i * 3.1) * 6.283, r = Math.sqrt(hash(i * 7.7)) * .82;
    FL.push({ x: Math.cos(a) * r, z: Math.sin(a) * r * .9, s: .006 + hash(i * 1.3) ** 2 * .016, k: hash(i * 5.9),
      g: hash(i * 9.1) < .07, vx: hash(i * 2.2) * 2 - 1, vy: hash(i * 4.4), vz: hash(i * 6.6) * 2 - 1, ph: hash(i * 8.8) * 6.28 });
  }
  E.ground = (x, z) => -0.47 + .05 * Math.cos(x * 2.3 + .5) + .03 * Math.sin(z * 3.1) - .12 * x * x;
  E.flakes = function (t) {
    let sh = null; for (const s of E.SHAKES) if (s.t <= t) sh = s; if (!sh) return [];
    const tau = t - sh.t, out = [], k = 1.6, vt = .085 * (sh.vt || 1);
    for (const f of FL) {
      if (f.k > sh.s + .15) continue;                         // слабая тряска поднимает не весь снег
      const v0 = [f.vx * .9 * sh.s + (sh.x || 0) * .6, (1.1 + f.vy * 1.4) * sh.s, f.vz * .6 * sh.s];
      const e = (1 - Math.exp(-k * tau)) / k, term = tau - e;
      const vtf = vt * (.6 + f.k * .8);
      let x = f.x + v0[0] * e + Math.sin(tau * .9 + f.ph) * .05 * Math.min(1, tau),
        y = E.ground(f.x, f.z) + .02 + v0[1] * e - vtf * term,
        z = f.z + v0[2] * e + Math.cos(tau * .7 + f.ph) * .04 * Math.min(1, tau);
      const r = Math.hypot(x, y, z); if (r > .93) { x *= .93 / r; y *= .93 / r; z *= .93 / r; }
      if (E.H2O < 1 && y > E.H2O - .01) continue;             // над водой снег не держится
      if (y < E.ground(x, z) + .005) continue;                // лёг
      out.push({ x, y, z, s: f.s, g: f.g, ph: f.ph });
    }
    return out;
  };
  // нарисовать снежинки в слои: каждая проецируется лучом камеры на ближайшую плоскость
  E.drawFlakes = function (t, cpG, alpha = 1) {
    const fl = E.flakes(t);
    for (const f of fl) {
      let bi = 0, bd = 9; for (let i = 0; i < 3; i++) { const d = Math.abs(f.z - E.LZ[i]); if (d < bd) { bd = d; bi = i; } }
      const zp = E.LZ[bi], dz = f.z - cpG[2]; let x = f.x, y = f.y, s = f.s;
      if (Math.abs(dz) > .02) { const k = (zp - cpG[2]) / dz; if (k > 0) { x = cpG[0] + (f.x - cpG[0]) * k; y = cpG[1] + (f.y - cpG[1]) * k; s *= k; } }
      const c = E.layerCtx(bi);
      if (f.g) { // блёстка: вспыхивает при повороте
        const tw = Math.max(0, Math.sin(t * 5 + f.ph * 3)) ** 6;
        c.fillStyle = `rgba(255,214,140,${(.35 + tw * .65) * alpha})`; c.beginPath(); c.arc(x, y, s * .6, 0, 7); c.fill();
        if (tw > .3) { c.strokeStyle = `rgba(255,240,200,${tw * alpha})`; c.lineWidth = s * .25; c.beginPath(); c.moveTo(x - s * 2, y); c.lineTo(x + s * 2, y); c.moveTo(x, y - s * 2); c.lineTo(x, y + s * 2); c.stroke(); }
      } else {
        const g = c.createRadialGradient(x, y, 0, x, y, s);
        g.addColorStop(0, `rgba(255,255,255,${.95 * alpha})`); g.addColorStop(.55, `rgba(240,246,255,${.7 * alpha})`); g.addColorStop(1, 'rgba(230,240,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
      }
    }
  };

  // ---------- GL
  const VS = `#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
  const FS1 = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform vec3 uC, uR, uU, uF; uniform float uTan, uAsp;
  uniform sampler2D uL0, uL1, uL2, uO; uniform vec4 uW0, uW1, uW2; uniform vec3 uLz, uLb;
  uniform float uH, uOD, uOB, uExpo, uEnv, uT; uniform vec2 uOOff; uniform vec3 uAmb, uRoom; uniform float uInside;
  vec4 lay(int i, vec3 p){
    vec4 w = i==0?uW0:(i==1?uW1:uW2);
    vec2 t = vec2((p.x-w.x)/(w.z-w.x), (w.w-p.y)/(w.w-w.y));
    if(t.x<0.||t.y<0.||t.x>1.||t.y>1.) return vec4(0);
    float b = i==0?uLb.x:(i==1?uLb.y:uLb.z);
    vec4 c = i==0?textureLod(uL0,t,b):(i==1?textureLod(uL1,t,b):textureLod(uL2,t,b));
    return c;
  }
  // фон: плоскость ⟂ взгляду на расстоянии uOD; координаты — «экранные» px
  vec3 outs(vec3 p, vec3 d, float extra){
    float dn = dot(d,uF); if(dn<.05) return uRoom*.35;
    float t = (uOD - dot(p-uC,uF))/dn; vec3 q = p + d*max(t,0.);
    vec2 a = vec2(dot(q-uC,uR), dot(q-uC,uU))/(uOD*uTan);
    vec2 px = vec2(360. + a.x*640., 640. - a.y*640.) + uOOff;
    vec2 tt = vec2((px.x+108.)/936., (px.y+192.)/1664.);
    if(tt.x<0.||tt.y<0.||tt.x>1.||tt.y>1.) return uRoom*.3;
    return textureLod(uO, tt, uOB+extra).rgb;
  }
  vec3 env(vec3 d){ // отражение комнаты: тёплые окна-софтбоксы, гирлянда, тёмный низ
    float up = d.y; vec3 c = mix(uRoom*.25, uRoom*.9, smoothstep(-.4,.7,up));
    float win = smoothstep(.75,.95, d.x*.6+d.y*.7+.2) * smoothstep(-.2,.3,d.z);
    c += vec3(1.,.93,.8)*win*1.4*uExpo;
    float rim = pow(max(0.,1.-abs(d.y-.15)*3.),8.)*smoothstep(.0,.5,-d.x);
    c += vec3(1.,.6,.3)*rim*.5;
    return c;
  }
  float fres(float c, float n){ float r0 = pow((1.-n)/(1.+n),2.); return r0 + (1.-r0)*pow(1.-c,5.); }
  // от точки p внутри шара по направлению d до выхода; собирает слои, преломляется о воду
  vec4 inner(vec3 p, vec3 d, out vec3 pe, out vec3 de){
    vec3 acc = vec3(0); float A = 0.; float path = 0.;
    for(int seg=0; seg<2; seg++){
      float b = dot(p,d), c = dot(p,p)-1.; float tex = -b + sqrt(max(b*b-c,0.));
      float th = abs(d.y)>1e-4 ? (uH - p.y)/d.y : 1e9; bool cross = th>1e-4 && th<tex && uH<1.;
      float tend = cross ? th : tex;
      // слои по порядку вдоль луча
      float ts[3]; for(int i=0;i<3;i++){ float z = i==0?uLz.x:(i==1?uLz.y:uLz.z); ts[i] = abs(d.z)>1e-5 ? (z-p.z)/d.z : -1.; }
      for(int k=0;k<3;k++){
        int bi=-1; float bt=1e9;
        for(int i=0;i<3;i++){ if(ts[i]>1e-4 && ts[i]<tend && ts[i]<bt){ bt=ts[i]; bi=i; } }
        if(bi<0) break; ts[bi] = -1.;
        vec4 l = lay(bi, p+d*bt); bool wet = (p+d*bt).y < uH;
        vec3 lc = l.rgb * uAmb * (wet? vec3(.93,.98,1.02) : vec3(1.));
        acc += (1.-A)*lc; A += (1.-A)*l.a; if(A>.995) break;
      }
      path += tend;
      if(A>.995){ pe = p; de = d; return vec4(acc, A); }
      p = p + d*tend;
      if(!cross) break;
      // поверхность воды: френель + преломление
      vec3 n = vec3(0., d.y>0.?-1.:1., 0.); bool fromW = d.y>0.;
      float eta = fromW ? 1.33 : 1./1.33; vec3 r = refract(d, n, eta);
      float F = fres(abs(d.y), 1.33);
      acc += (1.-A)*F*vec3(.75,.85,.95)*uExpo*.6; A += (1.-A)*F*.5;
      if(dot(r,r)<.5){ d = reflect(d,n); } else d = normalize(r);
    }
    pe = p; de = d;
    acc += (1.-A)*vec3(.0,.02,.03)*min(path,2.)*.15;
    return vec4(acc, A);
  }
  void main(){
    vec2 s = (uv*2.-1.); s.x *= uAsp;
    vec3 d = normalize(uF + uR*s.x*uTan + uU*s.y*uTan);
    vec3 p = uC; vec3 col;
    float b = dot(p,d), c = dot(p,p)-1., h = b*b-c;
    if(uInside < .5){
      if(h<0. || -b-sqrt(h)<0.){ col = outs(p,d,0.); }
      else {
        float t0 = -b - sqrt(h); vec3 P = p + d*t0, N = normalize(P);
        float cs = -dot(d,N); float F = fres(cs, 1.5);
        vec3 refl = env(reflect(d,N));
        bool wet = P.y < uH; float n2 = wet?1.33:1.;
        vec3 d1 = normalize(refract(d, N, 1./n2));
        vec3 pe, de; vec4 in1 = inner(P+d1*1e-3, d1, pe, de);
        vec3 back;
        if(pe.y < -.78 && length(pe)>.98){ back = vec3(.16,.09,.05)*uAmb; } // подставка изнутри
        else {
          vec3 Ne = normalize(pe); bool w2 = pe.y < uH; float ne = w2?1.33:1.;
          vec3 d2 = refract(de, -Ne, ne);
          if(dot(d2,d2)<.5) back = env(reflect(de,-Ne))*.4;
          else { d2 = normalize(d2); vec3 dd = d2 - de;
            back = vec3(outs(pe, normalize(de+dd*1.04), 2.5).r, outs(pe, d2, 2.5).g, outs(pe, normalize(de+dd*.96), 2.5).b); back = mix(back, uRoom*.5, .2); }
        }
        vec3 inside = in1.rgb + (1.-in1.a)*back*vec3(.92,.97,1.);
        col = mix(inside, refl, F) + refl*.04*uEnv;
        // блик-софтбокс на стекле
        vec3 Rf = reflect(d,N);
        col += vec3(1.,.97,.9)*pow(max(0.,dot(Rf, normalize(vec3(-.55,.6,.6)))),90.)*1.8*uEnv;
        col += vec3(.9,.95,1.)*pow(max(0.,dot(Rf, normalize(vec3(.6,.3,.75)))),40.)*.35*uEnv;
        // ободок
        col += vec3(.7,.8,.9)*pow(1.-cs, 6.)*.25*uEnv;
      }
    } else {
      // камера внутри шара
      vec3 pe, de; vec4 in1 = inner(p, d, pe, de);
      vec3 back;
      if(pe.y < -.78){ back = vec3(.16,.09,.05)*uAmb; }
      else {
        vec3 Ne = normalize(pe); bool w2 = pe.y < uH; float ne = w2?1.33:1.;
        vec3 d2 = refract(de, -Ne, ne);
        if(dot(d2,d2)<.5) back = env(reflect(de,-Ne))*.35 + vec3(.05,.08,.1);
        else { d2 = normalize(d2); vec3 dd = d2-de;
          back = vec3(outs(pe, normalize(de+dd*1.05), 0.).r, outs(pe, d2, 0.).g, outs(pe, normalize(de+dd*.95), 0.).b);
          float cs = abs(dot(de,Ne)); back *= (1.-fres(cs,1.33)*.8);
          back += env(reflect(de,-Ne))*fres(cs,1.33)*.25*uEnv; }
        // стекло купола изнутри: лёгкие блики
        back += vec3(.9,.95,1.)*pow(max(0.,dot(reflect(de,-Ne), normalize(vec3(-.5,.7,.5)))),60.)*.5*uEnv;
      }
      col = in1.rgb + (1.-in1.a)*back;
    }
    o = vec4(col*uExpo, 1.);
  }`;
  const FS2 = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o; uniform sampler2D uA, uV; uniform float uT, uBl, uVig, uFade, uGr;
  float hh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uT*61.7)*43758.5453); }
  void main(){
    vec2 q = vec2(uv.x, 1.-uv.y);
    vec3 c = texture(uA, uv).rgb;
    vec3 bl = textureLod(uA, uv, 3.).rgb*.5 + textureLod(uA, uv, 5.).rgb*.35 + textureLod(uA, uv, 6.5).rgb*.3;
    c += max(bl-.8, 0.)*uBl*.7;
    vec4 v = texture(uV, q); c = c*(1.-v.a) + v.rgb;
    c *= 1.12; c = clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14), 0., 1.); // ACES
    c = pow(c, vec3(.95,1.,1.04));
    float r = length((uv-.5)*vec2(.85,1.)); c *= 1. - uVig*smoothstep(.35,.85,r);
    c += (hh(gl_FragCoord.xy)-.5)*uGr;
    o = vec4(c*uFade, 1.);
  }`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  function prog(fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  const P1 = prog(FS1), P2 = prog(FS2);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  function tex(mip) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  const TL = [tex(1), tex(1), tex(1)], TO = tex(1), TV = tex(0), TA = tex(1);
  gl.bindTexture(gl.TEXTURE_2D, TA); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, TA, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  function up(t, c, mip) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); if (mip) gl.generateMipmap(gl.TEXTURE_2D); }
  const U = (p, n) => gl.getUniformLocation(p, n);

  // параметры кадра (сцена задаёт каждую секунду)
  E.P = {};
  E.defaults = () => Object.assign(E.P, { H2O: 1.2, expo: 1, env: 1, amb: [1, 1, 1], room: [.5, .38, .3], outD: 6, outB: 1.5, lb: [0, 0, 0], bloom: .9, vig: .4, fade: 1, grain: .035 });
  E.defaults();

  // рисование кадра: сцена заранее нарисовала слои/фон/передний план
  E.clearAll = function () {
    for (const c of E.lx) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, LW, LH); }
    E.ox.setTransform(1, 0, 0, 1, 0, 0); E.ox.globalAlpha = 1; E.ox.filter = 'none'; E.ox.globalCompositeOperation = 'source-over'; E.ox.clearRect(0, 0, 936, 1664);
    E.ox.setTransform(1, 0, 0, 1, 108, 192);
    E.vx.setTransform(1, 0, 0, 1, 0, 0); E.vx.globalAlpha = 1; E.vx.filter = 'none'; E.vx.globalCompositeOperation = 'source-over'; E.vx.clearRect(0, 0, W, H);
  };
  // вызывается до рисования слоёв: считает окна слоёв по камере
  E.prepare = function () {
    const b = camBasis();
    const cpG = E.toG(E.cam.p), fG = E.dirG(b.f), rG = E.dirG(b.r), uG = E.dirG(b.u);
    windows(b, cpG, fG, rG, uG);
    E._b = { b, cpG, fG, rG, uG };
    E.H2O = E.P.H2O;
    return cpG;
  };
  E.present = function (t) {
    const { b, cpG, fG, rG, uG } = E._b, P = E.P;
    for (let i = 0; i < 3; i++) up(TL[i], E.L[i], 1);
    up(TO, E.OUT, 1); up(TV, E.OV, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, W, H); gl.useProgram(P1);
    gl.uniform3fv(U(P1, 'uC'), cpG); gl.uniform3fv(U(P1, 'uR'), rG); gl.uniform3fv(U(P1, 'uU'), uG); gl.uniform3fv(U(P1, 'uF'), fG);
    gl.uniform1f(U(P1, 'uTan'), b.tan); gl.uniform1f(U(P1, 'uAsp'), W / H);
    ['uL0', 'uL1', 'uL2'].forEach((n, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, TL[i]); gl.uniform1i(U(P1, n), i); });
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, TO); gl.uniform1i(U(P1, 'uO'), 3);
    ['uW0', 'uW1', 'uW2'].forEach((n, i) => gl.uniform4fv(U(P1, n), E.LWIN[i]));
    gl.uniform3fv(U(P1, 'uLz'), E.LZ); gl.uniform3fv(U(P1, 'uLb'), P.lb);
    gl.uniform1f(U(P1, 'uH'), P.H2O); gl.uniform1f(U(P1, 'uOD'), P.outD); gl.uniform1f(U(P1, 'uOB'), P.outB);
    gl.uniform1f(U(P1, 'uExpo'), P.expo); gl.uniform1f(U(P1, 'uEnv'), P.env); gl.uniform1f(U(P1, 'uT'), t);
    gl.uniform2fv(U(P1, 'uOOff'), E.OUTOFF); gl.uniform3fv(U(P1, 'uAmb'), P.amb); gl.uniform3fv(U(P1, 'uRoom'), P.room);
    gl.uniform1f(U(P1, 'uInside'), Math.hypot(...cpG) < .995 ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, TA); gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.useProgram(P2);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TA); gl.uniform1i(U(P2, 'uA'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TV); gl.uniform1i(U(P2, 'uV'), 1);
    gl.uniform1f(U(P2, 'uT'), t); gl.uniform1f(U(P2, 'uBl'), P.bloom); gl.uniform1f(U(P2, 'uVig'), P.vig); gl.uniform1f(U(P2, 'uFade'), P.fade); gl.uniform1f(U(P2, 'uGr'), P.grain);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const buf = new Uint8Array(W * H * 4), flip = new Uint8Array(W * H * 4);
  window.grab = function () { gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    for (let y = 0; y < H; y++) flip.set(buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); return flip; };
})();
