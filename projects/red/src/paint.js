// paint.js — «живая масляная живопись»: сцена рисуется в 2D-холст (цвет) + маска (R=детали, G=правда-цвет, B=глянец),
// затем GLSL: тензор структуры → анизотропный Кувахара (мазок по форме) → рельеф мазков (LIC щетины) → импасто под косым
// светом, сырой блик, холст, дейтеранопия (глаза Лео), переход «мазок размазывает кадр в кадр».
const E = (() => {
  const W = 720, H = 1280;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const cA = mk(), cB = mk(), cMA = mk(), cMB = mk(), cT = mk();
  const X = { A: cA.getContext('2d'), B: cB.getContext('2d'), MA: cMA.getContext('2d'), MB: cMB.getContext('2d'), T: cT.getContext('2d') };
  const out = document.getElementById('c'); out.width = W; out.height = H;
  const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
  gl.getExtension('EXT_color_buffer_float'); gl.getExtension('OES_texture_float_linear');

  // ---------- GL helpers ----------
  const VS = `#version 300 es
  in vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }`;
  function prog(fs) {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) + '\n' + s.split('\n').map((l, i) => (i + 1) + ' ' + l).join('\n').slice(0, 3000)); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); p.u[a.name] = gl.getUniformLocation(p, a.name); }
    return p;
  }
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const W2 = W / 2, H2 = H / 2;
  function tex(fl, w = W, h = H) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); t.w = w; t.h = h;
    if (fl) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  function fbo(...ts) { const f = gl.createFramebuffer(); f.w = ts[0].w; f.h = ts[0].h; gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    ts.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
    gl.drawBuffers(ts.map((_, i) => gl.COLOR_ATTACHMENT0 + i)); return f; }
  const tA = tex(), tB = tex(), tMA = tex(), tMB = tex(), tT = tex();
  const tCol = tex(true), tMsk = tex(), tTen = tex(true, W2, H2), tTen2 = tex(true, W2, H2), tTen3 = tex(true, W2, H2), tKuw = tex(true, W2, H2), tKuwD = tex(true), tHgt = tex(true);
  const fMix = fbo(tCol, tMsk), fTen = fbo(tTen), fTen2 = fbo(tTen2), fTen3 = fbo(tTen3), fKuw = fbo(tKuw), fKuwD = fbo(tKuwD), fHgt = fbo(tHgt);
  // текстура шума 256² (REPEAT, LINEAR) — value noise одной выборкой
  const tNz = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tNz); { const a = new Uint8Array(256 * 256 * 4); let r = 12345; for (let i = 0; i < a.length; i++) { r = (r * 16807) % 2147483647; a[i] = r & 255; }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, a); }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  function up(t, c) { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c); }

  const HDR = `#version 300 es
  precision highp float; uniform vec2 res; uniform float seed;
  float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
  `;
  // P0: смешение кадров A/B мазком (MRT: цвет + маска)
  const pMix = prog(HDR + `
  uniform sampler2D A,B,MA,MB; uniform float pr; uniform vec2 dir; uniform float kind;
  layout(location=0) out vec4 oC; layout(location=1) out vec4 oM;
  void main(){ vec2 uv=gl_FragCoord.xy/res;
    if(pr<=0.){ oC=texture(A,uv); oM=texture(MA,uv); return; }
    if(pr>=1.){ oC=texture(B,uv); oM=texture(MB,uv); return; }
    vec2 d=normalize(dir); vec2 q=(uv-.5)*vec2(res.x/res.y,1.);
    float co=dot(q,d)/ (abs(d.x)*res.x/res.y*.5+abs(d.y)*.5) *.5+.5;      // 0..1 вдоль направления мазка
    vec2 pp=vec2(-d.y,d.x); float acr=dot(q,pp);
    float n=fbm(vec2(acr*9.,co*1.5)+seed)*.55 + vn(vec2(acr*60.,co*3.))*.25;  // рваный край, полосы щетины поперёк
    float e=pr*1.5-.25; float x=co + (n-.4)*.35;
    float m=1.-smoothstep(e-.06,e+.06,x);                                  // 1 = новый кадр
    float bell=exp(-pow((x-e)/.12,2.));
    vec2 dd=vec2(d.x, d.y);
    vec2 uA=uv - dd*vec2(res.y/res.x,1.)*.06*bell*(.6+n);                 // старую краску тащит кистью
    vec2 uB=uv + dd*vec2(res.y/res.x,1.)*.03*bell;
    oC=mix(texture(A,uA),texture(B,uB),m); oM=mix(texture(MA,uA),texture(MB,uB),m);
  }`);
  // P1: тензор структуры (Собель по цвету)
  const pTen = prog(HDR + `
  uniform sampler2D C; out vec4 o;
  vec3 c(vec2 p, float dx, float dy){ return texture(C,(p+vec2(dx,dy))/res).rgb; }
  void main(){ vec2 p=gl_FragCoord.xy;
    vec3 gx=(-c(p,-1.,-1.)-2.*c(p,-1.,0.)-c(p,-1.,1.)+c(p,1.,-1.)+2.*c(p,1.,0.)+c(p,1.,1.))*.25;
    vec3 gy=(-c(p,-1.,-1.)-2.*c(p,0.,-1.)-c(p,1.,-1.)+c(p,-1.,1.)+2.*c(p,0.,1.)+c(p,1.,1.))*.25;
    o=vec4(dot(gx,gx),dot(gy,gy),dot(gx,gy),1.); }`);
  // P2: размытие тензора (раздельный гаусс)
  const pBlur = prog(HDR + `
  uniform sampler2D C; uniform vec2 st; out vec4 o;
  void main(){ vec2 uv=gl_FragCoord.xy/res; vec4 s=vec4(0.); float ws=0.;
    for(int i=-6;i<=6;i++){ float w=exp(-float(i*i)/8.); s+=texture(C,uv+st*float(i)/res)*w; ws+=w; } o=s/ws; }`);
  // P3: анизотропный Кувахара (Kyprianidis, полиномиальные веса), радиус по маске деталей
  const pKuw = prog(HDR + `
  uniform sampler2D C,T,M; uniform float rad, stride, only; out vec4 o;
  void main(){ vec2 uv=gl_FragCoord.xy/res;
    vec3 t=texture(T,uv).xyz; float E=t.x,G=t.y,F=t.z;
    float D=sqrt(max(0.,(E-G)*(E-G)+4.*F*F)); float l1=.5*(E+G+D), l2=.5*(E+G-D);
    vec2 v=vec2(l1-E,-F); vec2 tt=length(v)>1e-6?normalize(v):vec2(0.,1.);
    float phi=-atan(tt.y,tt.x); float A=(l1+l2>1e-6)?(l1-l2)/(l1+l2):0.;
    vec4 mk=texture(M,uv); if(only>0. && mk.r<.04){ o=vec4(0.); return; } float r=only>0.?rad:rad*mix(1.,.5,mk.r);
    float a=r*clamp((1.+A),.1,2.), b=r*clamp(1./(1.+A),.1,2.);
    float cp=cos(phi), sp=sin(phi); mat2 R=mat2(cp,sp,-sp,cp); mat2 S=mat2(.5/a,0.,0.,.5/b); mat2 SR=S*R;
    int mx=int(sqrt(a*a*cp*cp+b*b*sp*sp)), my=int(sqrt(a*a*sp*sp+b*b*cp*cp));
    float zeta=2./r, zc=.58, sz=sin(zc), eta=(zeta+cos(zc))/(sz*sz);
    vec4 m[8]; vec3 s[8]; for(int k=0;k<8;k++){ m[k]=vec4(0.); s[k]=vec3(0.); }
    int stp=int(stride); if(r<3.) stp=1;
    for(int y=-my;y<=my;y+=stp) for(int x=-mx;x<=mx;x+=stp){
      vec2 q=SR*vec2(float(x),float(y)); if(dot(q,q)>.25) continue;
      vec3 c=clamp(texture(C,uv+vec2(float(x),float(y))/res).rgb,0.,1.);
      float w[8]; float sum=0., z, vxx, vyy;
      vxx=zeta-eta*q.x*q.x; vyy=zeta-eta*q.y*q.y;
      z=max(0.,q.y+vxx); w[0]=z*z; z=max(0.,-q.x+vyy); w[2]=z*z; z=max(0.,-q.y+vxx); w[4]=z*z; z=max(0.,q.x+vyy); w[6]=z*z;
      q=.70710678*vec2(q.x-q.y,q.x+q.y); vxx=zeta-eta*q.x*q.x; vyy=zeta-eta*q.y*q.y;
      z=max(0.,q.y+vxx); w[1]=z*z; z=max(0.,-q.x+vyy); w[3]=z*z; z=max(0.,-q.y+vxx); w[5]=z*z; z=max(0.,q.x+vyy); w[7]=z*z;
      for(int k=0;k<8;k++) sum+=w[k];
      float g=exp(-3.125*dot(q,q))/max(sum,1e-6);
      for(int k=0;k<8;k++){ float wk=w[k]*g; m[k]+=vec4(c*wk,wk); s[k]+=c*c*wk; }
    }
    vec4 acc=vec4(0.);
    for(int k=0;k<8;k++){ if(m[k].w<1e-6) continue; vec3 mu=m[k].rgb/m[k].w; vec3 sg=abs(s[k]/m[k].w-mu*mu);
      float w=1./(1.+pow(8000.*(sg.r+sg.g+sg.b),4.)); acc+=vec4(mu*w,w); }
    o=vec4(acc.w>0.?acc.rgb/acc.w:texture(C,uv).rgb, A); }`);
  // P3b: мазки-дэбы: ячейки в мировых координатах, у каждой — эллипс вдоль потока, щетина поперёк, цвет из центра
  const pHgt = prog(HDR + `
  uniform sampler2D T,M,NZ; uniform float boil, zoom; uniform vec2 pan; out vec4 o;
  float tn(vec2 q){ return texture(NZ,q/256.).r; }
  vec2 flowAt(vec2 sp){ vec3 t=texture(T,sp/res).xyz; float E=t.x,G=t.y,F=t.z;
    float D=sqrt(max(0.,(E-G)*(E-G)+4.*F*F)); float l1=.5*(E+G+D); vec2 g=vec2(l1-G,F); float gn=length(g);
    vec2 base=normalize(vec2(.6,1.)+.9*vec2(tn(sp/37.)-.5,tn(sp/37.+71.)-.5));
    if(gn<1e-6) return base; vec2 tg=vec2(-g.y,g.x)/gn; tg*=sign(dot(tg,base)+1e-4);
    return normalize(mix(base,tg,clamp((E+G)*60.,0.,1.))); }
  void main(){ vec2 p=gl_FragCoord.xy, uv=p/res;
    float det=texture(M,uv).r; float cs=mix(17.,7.,det)/zoom;
    vec2 wp=(p-pan)/zoom; vec2 gi=floor(wp/cs);
    float best=-1., hh=0., rid=0.; vec2 off=vec2(0.);
    float bj=boil*.37;
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
      vec2 c=gi+vec2(float(i),float(j));
      vec4 rn=texture(NZ,(mod(c,256.)+.5)/256.);
      vec4 rb=texture(NZ,(mod(c+vec2(bj*41.,bj*17.),256.)+.5)/256.);
      vec2 cw=(c+.15+.7*rn.xy)*cs + (rb.xy-.5)*cs*.12;
      vec2 cp=cw*zoom+pan;
      vec2 tg=flowAt(cp); float an=(rn.z-.5)*.5+(rb.z-.5)*.06; tg=vec2(tg.x*cos(an)-tg.y*sin(an), tg.x*sin(an)+tg.y*cos(an));
      vec2 d=wp-cw; float u=dot(d,tg), v=dot(d,vec2(-tg.y,tg.x));
      float L=cs*(1.05+rn.w*.8), Wd=cs*(.5+rn.x*.3);
      float e=u*u/(L*L)+v*v/(Wd*Wd);
      if(e<1.){ float pr=fract(rn.w*7.13+rn.y*3.1);
        if(pr>best){ best=pr; float prof=sqrt(1.-e); float tip=smoothstep(-L,-L*.3,u)*.35+.65;
          float bris=tn(vec2(v/(cs*.11)+rn.x*90., u/(cs*.9))+rn.yz*60.);
          hh=prof*tip*(.5+.5*bris); off=-d*zoom; rid=rn.z; } } }
    if(best<0.){ hh=tn(p*.9)*.08; }
    o=vec4(hh, best<0.?0.:.5+.5*rid, off); }`);
  // P4: финал — импасто, блик, холст, CVD, текст, виньетка
  const pFin = prog(HDR + `
  uniform sampler2D K,KD,Hh,M,TX; uniform float cvd, fade, time, gloss, warm; out vec4 o;
  vec3 deut(vec3 c){ return clamp(mat3(0.367322,0.280085,-0.011820, 0.860646,0.672501,0.042940, -0.227968,0.047413,0.968881)*c,0.,1.); }
  void main(){ vec2 p=gl_FragCoord.xy, uv=p/res;
    vec4 tx=texture(TX,uv); vec4 mk=texture(M,uv);
    vec4 hs=texture(Hh,uv); float det=smoothstep(.04,.45,mk.r);
    vec2 su=uv+hs.ba*(.55-.4*det)/res;
    vec3 col=mix(texture(K,uv).rgb,texture(K,su).rgb,.75); vec4 kd=texture(KD,uv); col=mix(col,kd.rgb,smoothstep(.04,.45,mk.r)*step(.001,kd.r+kd.g+kd.b));
    float h=texture(Hh,uv).r;
    float hx=texture(Hh,uv+vec2(1.,0.)/res).r-texture(Hh,uv-vec2(1.,0.)/res).r;
    float hy=texture(Hh,uv+vec2(0.,1.)/res).r-texture(Hh,uv-vec2(0.,1.)/res).r;
    float ta=tx.a; float relief=1.-.55*mk.r;                       // на лицах рельеф мягче
    col=mix(col,tx.rgb,ta);
    vec3 n=normalize(vec3(-hx*1.1*relief, -hy*1.1*relief, 1.));
    vec3 L=normalize(vec3(-.55,-.65,.55)); vec3 V=vec3(0.,0.,1.);
    float dif=dot(n,L); float sp=pow(max(dot(reflect(-L,n),V),0.),28.);
    float rid=hs.g>0.?(hs.g-.5)*2.:.5; col*= .94 + .12*(h-.45) + (rid-.5)*.07*(1.-det);
    col*= 1. + .3*(dif-.55);
    col+= vec3(1.,.97,.9)*sp*(.10+.25*mk.b)*gloss;
    // холст: переплетение там, где краска тонкая
    float wv=sin(p.x*1.9)*sin(p.y*1.9+sin(p.x*.13)*.6); float thin=hs.g>0.?.15:1.;
    col*= 1. + wv*.04*thin;
    // глаза Лео: дейтеранопия, кроме «правды» (маска G)
    float amt=cvd*(1.-mk.g);
    col=mix(col, deut(col), amt);
    col=mix(col, col*vec3(1.035,1.,.93), warm);                     // лак
    vec2 q=uv-.5; col*= 1.-.55*pow(length(q*vec2(1.05,.8)),2.4);
    col+= (h21(p+fract(time)*91.)-.5)*.025;
    col*= 1.-fade;
    o=vec4(clamp(col,0.,1.),1.); }`);

  setTimeout(()=>{pMix.nm='mix';pTen.nm='ten';pBlur.nm='blur';pKuw.nm='kuw';pHgt.nm='hgt';pFin.nm='fin';});
  function draw(p, f, tx, un) { if (E.SKIP && E.SKIP.includes(p.nm)) return; gl.bindFramebuffer(gl.FRAMEBUFFER, f); const w = f ? f.w : W, h = f ? f.h : H; gl.viewport(0, 0, w, h); gl.useProgram(p);
    gl.uniform2f(p.u.res, w, h); if (p.u.seed) gl.uniform1f(p.u.seed, S.seed);
    let i = 0; for (const k in tx) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx[k]); gl.uniform1i(p.u[k], i); i++; }
    for (const k in un) { const v = un[k]; if (p.u[k] == null) continue; Array.isArray(v) ? gl['uniform' + v.length + 'f'](p.u[k], ...v) : gl.uniform1f(p.u[k], v); }
    if (E.PROF) { gl.finish(); const t0 = performance.now(); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); E.PROF.push((performance.now() - t0) | 0); return; }
    gl.drawArrays(gl.TRIANGLES, 0, 3); }

  // ---------- состояние кадра ----------
  const S = { seed: 0, pr: 0, dir: [1, 0], cvd: 1, fade: 0, gloss: 1, warm: .6, rad: 11, radD: 3, stride: 2, boil: 0, pan: [0, 0], zoom: 1 };
  let cur = 'A';
  const E = { W, H, S, X, gl };
  E.ctx = () => X[cur]; E.msk = () => X['M' + cur];
  E.target = w => { cur = w; };
  E.clear = () => { for (const k of ['A', 'B']) { X[k].setTransform(1, 0, 0, 1, 0, 0); X[k].globalAlpha = 1; X[k].globalCompositeOperation = 'source-over'; X[k].filter = 'none'; X[k].fillStyle = '#000'; X[k].fillRect(0, 0, W, H); }
    for (const k of ['MA', 'MB']) { X[k].setTransform(1, 0, 0, 1, 0, 0); X[k].globalAlpha = 1; X[k].globalCompositeOperation = 'source-over'; X[k].fillStyle = '#000'; X[k].fillRect(0, 0, W, H); X[k].globalCompositeOperation = 'lighter'; }
    X.T.setTransform(1, 0, 0, 1, 0, 0); X.T.clearRect(0, 0, W, H); cur = 'A';
    Object.assign(S, { pr: 0, dir: [1, 0], cvd: 1, fade: 0, gloss: 1, warm: .6, rad: 11, radD: 3, pan: [0, 0], zoom: 1 }); };
  E.present = t => {
    S.seed = Math.floor(t * 6) * 0.137 % 50; S.boil = Math.floor(t * 6);       // мазки «перекрашиваются» 8 раз в секунду
    up(tA, cA); up(tMA, cMA); if (S.pr > 0) { up(tB, cB); up(tMB, cMB); } up(tT, cT);
    draw(pMix, fMix, { A: tA, B: tB, MA: tMA, MB: tMB }, { pr: S.pr, dir: S.dir });
    draw(pTen, fTen, { C: tCol }, {});
    draw(pBlur, fTen2, { C: tTen }, { st: [1, 0] }); draw(pBlur, fTen3, { C: tTen2 }, { st: [0, 1] });
    draw(pKuw, fKuw, { C: tCol, T: tTen3, M: tMsk }, { rad: S.rad / 2, stride: S.stride, only: 0 });
    draw(pKuw, fKuwD, { C: tCol, T: tTen3, M: tMsk }, { rad: S.radD, stride: 1, only: 1 });
    draw(pHgt, fHgt, { T: tTen3, M: tMsk, NZ: tNz }, { boil: S.boil % 97, pan: S.pan, zoom: S.zoom });
    draw(pFin, null, { K: tKuw, KD: tKuwD, Hh: tHgt, M: tMsk, TX: tT }, { cvd: S.cvd, fade: S.fade, time: t, gloss: S.gloss, warm: S.warm });
  };
  const px = new Uint8Array(W * H * 4);
  E.grab = () => { gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };

  // ---------- математика ----------
  E.cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  E.lerp = (a, b, k) => a + (b - a) * k;
  E.sm = x => { x = E.cl(x); return x * x * (3 - 2 * x); };
  E.seg = (t, a, b) => E.cl((t - a) / (b - a));
  E.ss = (t, a, b) => E.sm((t - a) / (b - a));
  E.eo = x => 1 - Math.pow(1 - E.cl(x), 3);
  E.ei = x => Math.pow(E.cl(x), 3);
  E.eio = x => { x = E.cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  E.back = x => { x = E.cl(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  E.rng = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  E.hash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  E.noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return E.lerp(E.hash(i), E.hash(i + 1), u) * 2 - 1; };
  E.wob = (t, f = 1, s = 0) => E.noise(t * f + s * 13.7) * .6 + E.noise(t * f * 2.3 + s * 7.1 + 40) * .4;
  E.pal = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

  // ---------- кисть / кэш фонов ----------
  const cache = {};
  E.cache = (key, w, h, fn) => { if (cache[key]) return cache[key]; const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); fn(x, w, h); cache[key] = c; return c; };
  // мазки: n эллипсов вдоль поля angle(x,y), цвет col(x,y,r) → [h,s,l]
  E.dabs = (x, o) => { const r = E.rng(o.seed || 7); const n = o.n || 400;
    for (let i = 0; i < n; i++) { const px = (o.x0 || 0) + r() * (o.w || W), py = (o.y0 || 0) + r() * (o.h || H);
      if (o.clip && !o.clip(px, py)) continue;
      const a = o.angle ? o.angle(px, py, r) : r() * 6.28; const L = (o.len || 30) * (.5 + r()), T = (o.wid || 8) * (.6 + r() * .8);
      const c = o.col(px, py, r); if (!c) continue;
      x.save(); x.translate(px, py); x.rotate(a); x.globalAlpha = o.alpha == null ? .8 : o.alpha;
      const g = x.createLinearGradient(0, -T, 0, T); const cs = Array.isArray(c) ? E.pal(c[0], c[1], c[2]) : c;
      g.addColorStop(0, Array.isArray(c) ? E.pal(c[0], c[1], c[2] + 6) : cs); g.addColorStop(1, Array.isArray(c) ? E.pal(c[0], c[1], c[2] - 6) : cs);
      x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, L / 2, T / 2, 0, 0, 6.283); x.fill(); x.restore(); }
    x.globalAlpha = 1; };
  E.grad = (x, x0, y0, x1, y1, stops) => { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach(([k, c]) => g.addColorStop(k, c)); return g; };
  E.rgrad = (x, cx, cy, r0, r1, stops) => { const g = x.createRadialGradient(cx, cy, r0, cx, cy, r1); stops.forEach(([k, c]) => g.addColorStop(k, c)); return g; };
  E.glow = (x, cx, cy, r, col, a = 1, op = 'lighter') => { x.save(); x.globalCompositeOperation = op; x.globalAlpha = a;
    x.fillStyle = E.rgrad(x, cx, cy, 0, r, [[0, col], [1, 'rgba(0,0,0,0)']]); x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore(); };

  // ---------- камера: одинаковая трансформация для цвета и маски ----------
  E.cam = (c) => { const k = c.z || 1; const a = c.r || 0; const m = [k * Math.cos(a), k * Math.sin(a), -k * Math.sin(a), k * Math.cos(a)];
    const tx = W / 2 - (m[0] * (c.x || W / 2) + m[2] * (c.y || H / 2)), ty = H / 2 - (m[1] * (c.x || W / 2) + m[3] * (c.y || H / 2));
    E.ctx().setTransform(m[0], m[1], m[2], m[3], tx, ty); E.msk().setTransform(m[0], m[1], m[2], m[3], tx, ty); if (cur === 'A' || S.pr === 0) { S.pan = [tx, ty]; S.zoom = k; } };
  E.nocam = () => { E.ctx().setTransform(1, 0, 0, 1, 0, 0); E.msk().setTransform(1, 0, 0, 1, 0, 0); };
  // маска: детали (лица, руки — мелкий мазок), правда-цвет, глянец
  E.detail = (cx, cy, r, a = 1) => { const m = E.msk(); m.fillStyle = E.rgrad(m, cx, cy, 0, r, [[0, `rgba(255,0,0,${a})`], [.6, `rgba(255,0,0,${a * .8})`], [1, 'rgba(255,0,0,0)']]); m.fillRect(cx - r, cy - r, 2 * r, 2 * r); };
  E.truth = (fn, a = 1) => { const m = E.msk(); m.save(); m.fillStyle = `rgba(0,255,0,${a})`; m.beginPath(); fn(m); m.fill(); m.restore(); };
  E.truthAll = (a = 1) => { const m = E.msk(); m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.fillStyle = `rgba(0,255,0,${a})`; m.fillRect(0, 0, W, H); m.restore(); };
  E.shine = (cx, cy, r, a = 1) => { const m = E.msk(); m.fillStyle = E.rgrad(m, cx, cy, 0, r, [[0, `rgba(0,0,255,${a})`], [1, 'rgba(0,0,255,0)']]); m.fillRect(cx - r, cy - r, 2 * r, 2 * r); };

  // ---------- текст (поверх, но «написан краской» — получает рельеф) ----------
  E.text = (s, x, y, o = {}) => { const t = X.T; const sz = o.size || 54; t.save(); t.globalAlpha = o.a == null ? 1 : o.a;
    t.font = `${o.weight || 900} ${sz}px ${o.font || 'Fr'}`; t.textAlign = o.align || 'center'; t.textBaseline = 'middle';
    const lines = Array.isArray(s) ? s : [s]; const lh = sz * (o.lh || 1.12);
    lines.forEach((ln, i) => { const yy = y + (i - (lines.length - 1) / 2) * lh; const cut = o.reveal == null ? ln : ln.slice(0, Math.floor(ln.length * o.reveal + .001));
      t.shadowColor = 'rgba(10,6,4,.85)'; t.shadowBlur = sz * .35; t.shadowOffsetY = sz * .06;
      t.fillStyle = o.color || '#f6efe2'; if (o.ls) t.letterSpacing = o.ls + 'px'; t.fillText(cut, x, yy);
      t.shadowBlur = 0; t.shadowOffsetY = 0; t.lineWidth = sz * .035; t.strokeStyle = 'rgba(30,20,12,.5)'; t.strokeText(cut, x, yy); });
    t.restore(); };
  // подпись-сабтитр внизу безопасной зоны: появляется по буквам
  E.sub = (s, t, a, b, o = {}) => { if (t < a || t > b) return; const k = E.cl(Math.min((t - a) / .25, (b - t) / .3));
    E.text(s, W / 2, o.y || 1000, Object.assign({ size: 50, a: k, reveal: E.cl((t - a) / Math.max(.35, (Array.isArray(s) ? s.join('').length : s.length) * .035)) }, o)); };
  return E;
})();
