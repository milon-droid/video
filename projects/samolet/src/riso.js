// Печать ризографом: плотности трёх красок (холст dens) → растр, зерно, сдвиг слоёв, бумага.
const Riso = (() => {
  let gl, prog, tex, U = {};
  const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const FS = `precision highp float;
  uniform sampler2D uD; uniform vec2 uRes; uniform float uSeed; uniform vec2 uO0, uO1, uO2; uniform float uCell;
  float h(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1.,0.)),f.x), mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x), f.y); }
  float scr(vec2 px, float a){ float c=cos(a), s=sin(a); vec2 q = mat2(c,-s,s,c)*px/uCell;
    return .5 + .25*(cos(6.2832*q.x) + cos(6.2832*q.y)); }
  float cov(float d, vec2 px, float a, float k){
    d *= .86 + .14*n(px/34. + k*17.);                 // неровный накат краски
    float thr = mix(1. - scr(px, a), h(px + k*91.), .3);   // растр + стохастика
    float c = smoothstep(thr - .07, thr + .07, d*1.13 - .045);
    c *= step(.022, h(px*1.37 + k*7.));               // белые крапинки
    return c;
  }
  void main(){
    vec2 px = gl_FragCoord.xy; vec2 uv = px / uRes;
    float dp = texture2D(uD, uv + uO0/uRes).r;
    float db = texture2D(uD, uv + uO1/uRes).g;
    float dy = texture2D(uD, uv + uO2/uRes).b;
    vec3 paper = vec3(.962,.941,.897) * (.975 + .025*n(px*.7 + 3.)) * (.985 + .015*n(px*.05));
    vec3 c = paper;
    c *= mix(vec3(1.), vec3(1.,.282,.69), cov(dp, px, 1.309, 1.));
    c *= mix(vec3(1.), vec3(0.,.47,.75), cov(db, px, .262, 2.));
    c *= mix(vec3(1.), vec3(1.,.91,0.), cov(dy, px, 0., 3.));
    gl_FragColor = vec4(c, 1.);
  }`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function init(canvas) {
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    for (const u of ['uD', 'uRes', 'uSeed', 'uO0', 'uO1', 'uO2', 'uCell']) U[u] = gl.getUniformLocation(prog, u);
  }
  // t — время ролика; mis — сила сдвига слоёв (1 — обычная печать)
  function print(dens, t, mis = 1) {
    const f = Math.floor(t * 12);                    // «новый оттиск» 12 раз в секунду
    const j = k => (hash(f * 3.7 + k) - .5) * 1.4;
    gl.viewport(0, 0, CW, CH);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, dens);
    gl.uniform2f(U.uRes, CW, CH); gl.uniform1f(U.uSeed, (f % 97) * .173); gl.uniform1f(U.uCell, 4.6);
    gl.uniform2f(U.uO0, (1.6 + j(1)) * mis, (-1.1 + j(2)) * mis);
    gl.uniform2f(U.uO1, (-1.2 + j(3)) * mis, (1.4 + j(4)) * mis);
    gl.uniform2f(U.uO2, j(5) * mis * .6, j(6) * mis * .6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  return { init, print };
})();
