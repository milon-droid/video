// DECEMBER — движок «открытка середины века»: 3 слоя параллакса + слой света (огни, окна, салют) → шейдер гуаши:
// сухая кисть по краям (сдвиг выборки шумом, кипит «на двойках»), пигмент неровный, зерно бумаги, брызги-спаттер,
// сдвиг печати тёмной краски, блум огней из mip, смаз «вжух» между планами, тёплая цветокоррекция. Титры поверх.
(function () {
  const W = 720, H = 1280;
  const E = window.E = { W, H };
  const cv = document.getElementById('c');
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  E.C = [mk(), mk(), mk(), mk(), mk()];               // 0 фон, 1 середина, 2 передний, 3 свет (аддитивно), 4 титры
  E.X = E.C.map(c => c.getContext('2d'));
  // ---------- утилиты
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
  const eo = k => 1 - (1 - clamp(k)) ** 3;
  const back = (k, c = 1.7) => { k = clamp(k); return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  const key = (u, ks, ez = eio) => { if (u <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (u < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, ez((u - a) / (b - a))); } return ks[ks.length - 1][1]; };
  Object.assign(E, { clamp, lerp, ss, eio, eo, back, hash, noise1, key });

  // ---------- камера: x,y — центр в координатах сцены (720×1280), z — зум; слой i с глубиной d: параллакс
  E.cam = { x: W / 2, y: H / 2, z: 1, r: 0 };
  E.DEPTH = [.45, 1, 1.6, 1]; E.ZM = 1.22; E.CY = 50;
  E.L = function (i, depth) {
    const c = E.X[i], d = depth ?? E.DEPTH[i], cm = { x: E.cam.x, y: E.cam.y + E.CY, z: E.cam.z * E.ZM, r: E.cam.r }, z = 1 + (cm.z - 1) * d;
    c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.rotate(cm.r * d); c.scale(z, z);
    c.translate(-(W / 2 + (cm.x - W / 2) * d), -(H / 2 + (cm.y - H / 2) * d));
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.lineCap = 'round'; c.lineJoin = 'round'; c.filter = 'none';
    return c;
  };
  E.clearAll = () => { for (const c of E.X) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = 'none'; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); } };

  // ---------- GL
  const VS = `#version 300 es
  in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
  const FS1 = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o;
  uniform sampler2D u0,u1,u2,u3; uniform float uSeed, uB0, uB2, uWhip, uBrush, uPaper; uniform vec2 uWdir;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
  vec4 over(vec4 a, vec4 b){ return b + a*(1.-b.a); } // b поверх a (premultiplied)
  vec4 scene(vec2 q){
    vec2 px = q*vec2(720.,1280.);
    // сухая кисть: смещение выборки по шуму, кипит на двойках (uSeed)
    vec2 d = (vec2(fbm(px*.045+uSeed), fbm(px*.045+uSeed+17.3)) - .5) * uBrush / vec2(720.,1280.);
    vec2 d2 = (vec2(vn(px*.35+uSeed*3.), vn(px*.35+uSeed*3.+9.)) - .5) * uBrush*.5 / vec2(720.,1280.);
    vec4 b0 = textureLod(u0, q + d*1.4, uB0);
    vec4 b1 = texture(u1, q + d + d2);
    vec4 b2 = textureLod(u2, q + d*.8, uB2);
    vec4 c = over(over(b0, b1), b2);
    return c;
  }
  void main(){
    vec2 q = vec2(uv.x, 1.-uv.y);
    vec4 c = vec4(0);
    if(uWhip > .001){ for(int i=0;i<10;i++){ c += scene(q + uWdir*(float(i)/9.-.5)*uWhip); } c /= 10.; }
    else c = scene(q);
    vec3 col = c.rgb + vec3(.95,.92,.85)*(1.-c.a);
    vec2 px = q*vec2(720.,1280.);
    // пигмент неровный (пятна) и бумага
    float pig = fbm(px*.012 + 3.1) ; col *= .93 + .14*pig;
    float paper = fbm(px*.5) * .6 + vn(px*1.7)*.4; col *= 1. - uPaper*(paper-.5)*.18;
    // волокна бумаги
    float fib = smoothstep(.72,.78, vn(vec2(px.x*.02, px.y*.9))); col *= 1. - fib*.04*uPaper;
    // спаттер (брызги гуаши) — светлые и тёмные точки
    float sp = h(floor(px/2.)+floor(uSeed)); float spm = smoothstep(.55,.75, fbm(px*.004+7.));
    if(sp > .9965) col = mix(col, vec3(.98,.95,.88), .55*spm);
    if(sp < .0025) col *= 1. - .35*spm;
    // свет: аддитивно
    vec4 L = texture(u3, q);
    col += L.rgb*.8;
    o = vec4(col, 1.);
  }`;
  const FS2 = `#version 300 es
  precision highp float; in vec2 uv; out vec4 o; uniform sampler2D uA, uL, uV; uniform float uT, uBl, uFade, uVig;
  float hh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uT*61.7)*43758.5453); }
  void main(){
    vec2 q = vec2(uv.x, 1.-uv.y);
    vec3 c = texture(uA, uv).rgb;
    vec3 bl = textureLod(uL, q, 2.).rgb*.6 + textureLod(uL, q, 4.).rgb*.6 + textureLod(uL, q, 6.).rgb*.5;
    c += bl*uBl;
    c = c/(1.+max(c-1.,0.)*.6);                       // мягкий потолок
    c = mix(c, c*vec3(1.05,1.,.92), .5);              // тёплая печать
    float r = length((uv-.5)*vec2(.9,1.)); c *= 1. - uVig*smoothstep(.4,.9,r);
    vec4 v = texture(uV, q); c = c*(1.-v.a) + v.rgb;
    c += (hh(gl_FragCoord.xy)-.5)*.03;
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
  const T = [tex(1), tex(0), tex(1), tex(1), tex(0)], TA = tex(0);
  gl.bindTexture(gl.TEXTURE_2D, TA); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, TA, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const U = (p, n) => gl.getUniformLocation(p, n);
  E.P = {};
  E.defaults = () => Object.assign(E.P, { b0: 1.2, b2: 0, whip: 0, wdir: [1, 0], brush: 3.2, paper: 1, bloom: .65, fade: 1, vig: .35 });
  E.defaults();
  E.present = function (t) {
    const P = E.P;
    E.C.forEach((c, i) => { gl.bindTexture(gl.TEXTURE_2D, T[i]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); if (i == 0 || i == 2 || i == 3) gl.generateMipmap(gl.TEXTURE_2D); });
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, W, H); gl.useProgram(P1);
    ['u0', 'u1', 'u2', 'u3'].forEach((n, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, T[i]); gl.uniform1i(U(P1, n), i); });
    gl.uniform1f(U(P1, 'uSeed'), Math.floor(t * 12) * 1.37 % 50); gl.uniform1f(U(P1, 'uB0'), P.b0); gl.uniform1f(U(P1, 'uB2'), P.b2);
    gl.uniform1f(U(P1, 'uWhip'), P.whip); gl.uniform2fv(U(P1, 'uWdir'), P.wdir); gl.uniform1f(U(P1, 'uBrush'), P.brush); gl.uniform1f(U(P1, 'uPaper'), P.paper);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(P2);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TA); gl.uniform1i(U(P2, 'uA'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T[3]); gl.uniform1i(U(P2, 'uL'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, T[4]); gl.uniform1i(U(P2, 'uV'), 2);
    gl.uniform1f(U(P2, 'uT'), t); gl.uniform1f(U(P2, 'uBl'), P.bloom); gl.uniform1f(U(P2, 'uFade'), P.fade); gl.uniform1f(U(P2, 'uVig'), P.vig);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const buf = new Uint8Array(W * H * 4), flip = new Uint8Array(W * H * 4);
  window.grab = function () { gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    for (let y = 0; y < H; y++) flip.set(buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); return flip; };
})();
