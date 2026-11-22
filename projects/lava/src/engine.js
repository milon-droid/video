// WebGL2: проход сцены в RGBA16F с mip-уровнями → пост-проход на экран. window.renderFrame(t) — состояние из story.js.
(function(){
  const W = SCENE.width, H = SCENE.height; const RS = +(new URLSearchParams(location.search).get('rs') || 1); const SW = Math.round(W*RS), SH = Math.round(H*RS);
  const cv = document.getElementById('c'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  if (!gl.getExtension('EXT_color_buffer_float')) gl.getExtension('EXT_color_buffer_half_float');
  function sh(t, s){ const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
  function prog(fs){ const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); const nm = a.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, a.name); }
    return { p, u }; }
  const PS = prog(SCENE_FS), PP = prog(POST_FS);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  const levels = Math.floor(Math.log2(Math.max(SW, SH))) + 1;
  gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA16F, SW, SH);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('FBO float не поддерживается');

  function flat(arr, n){ const o = new Float32Array(n * 4); arr.slice(0, n).forEach((v, i) => o.set(v, i * 4)); return o; }
  window.renderFrame = function(t){
    const S = STORY(t);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, SW, SH); gl.useProgram(PS.p);
    const u = PS.u;
    gl.uniform2f(u.uRes, SW, SH); gl.uniform1f(u.uT, t);
    gl.uniform3fv(u.uRo, S.cam.ro); gl.uniform3fv(u.uTa, S.cam.ta); gl.uniform1f(u.uFov, S.cam.fov); gl.uniform1f(u.uRoll, S.cam.roll || 0);
    const B = [], BS = [], BX = [];
    for (const b of S.blobs) { if (!(b.r > 0)) continue; B.push([b.p[0], b.p[1], b.p[2], b.r]); BS.push([...(b.s || [1,1,1]), b.heat ?? .7]); BX.push([b.out ? 0 : 1, b.k ?? .09, 0, 0]); }
    const NBc = B.length;
    while (B.length < 12) { B.push([0,0,0,0]); BS.push([1,1,1,0]); BX.push([1,.1,0,0]); }
    gl.uniform1i(u.uNB, NBc); gl.uniform1i(u.uNF, S.faces.length); gl.uniform4fv(u.uB, flat(B, 12)); gl.uniform4fv(u.uBS, flat(BS, 12)); gl.uniform4fv(u.uBX, flat(BX, 12));
    const FB = [], FE = [], FR = [], FU = [], FF = [], FM = [], FMs = [], FL = [];
    for (const f of S.faces) {
      const bl = S.blobs[f.b]; const r = bl.r; const s = bl.s || [1,1,1];
      const yaw = f.yaw || 0, pit = f.pitch || 0;
      const Fv = [Math.sin(yaw)*Math.cos(pit), Math.sin(pit), Math.cos(yaw)*Math.cos(pit)];
      const Rv = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const Uv = [Fv[1]*Rv[2]-Fv[2]*Rv[1], Fv[2]*Rv[0]-Fv[0]*Rv[2], Fv[0]*Rv[1]-Fv[1]*Rv[0]];
      const S3 = s.map(v => v * r);
      const at = (x, y, z) => [0,1,2].map(i => bl.p[i] + (Rv[i]*x + Uv[i]*y + Fv[i]*z) * S3[i]);
      const er = (f.eye ?? .34) * r * (1 + (s[0] - 1) * .5);
      FB.push([...bl.p, r * 1.9 * Math.max(...s)]);
      FE.push([...at(-.36, .22, .84), er], [...at(.36, .22, .84), er]);
      FR.push([...Rv, f.tilt || 0]); FU.push([...Uv, er * 1.2 * (1 - 2 * (f.up ?? .15))]); FF.push([...Fv, -er * 1.2 * (1 - 2 * (f.lo ?? 0))]);
      const mo = f.mo || 0, mw = f.mw ?? .6;
      FM.push([...at(0, -.30, .90), mo]); FMs.push([r * (.22 * mw + .05), r * (.17 * mo + .01), r * .30, f.pu ?? .9]);
      const lx = f.lx || 0, ly = f.ly || 0; const L = [0,1,2].map(i => Fv[i] + Rv[i]*lx + Uv[i]*ly); const ln = Math.hypot(...L);
      FL.push([L[0]/ln, L[1]/ln, L[2]/ln, bl.out ? 0 : 1]);
    }
    const pad = (a, n) => { while (a.length < n) a.push([0,0,0,0]); return a; };
    gl.uniform4fv(u.uFB, flat(pad(FB,4), 4)); gl.uniform4fv(u.uFE, flat(pad(FE,8), 8)); gl.uniform4fv(u.uFR, flat(pad(FR,4), 4));
    gl.uniform4fv(u.uFU, flat(pad(FU,4), 4)); gl.uniform4fv(u.uFF, flat(pad(FF,4), 4)); gl.uniform4fv(u.uFM, flat(pad(FM,4), 4));
    gl.uniform4fv(u.uFMs, flat(pad(FMs,4), 4)); gl.uniform4fv(u.uFL, flat(pad(FL,4), 4));
    gl.uniform4fv(u.uCap, S.cap || [0,0,0,0]);
    gl.uniform4fv(u.uEnv, S.env || [0,1,0,0]); gl.uniform1f(u.uOutB, S.blobs.some(b=>b.out)?1:0);
    if(!window.SKIPSCENE) gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.useProgram(PP.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(PP.u.uTex, 0); gl.uniform2f(PP.u.uRes, W, H);
    gl.uniform1f(PP.u.uFocus, S.cam.focus || 3); gl.uniform1f(PP.u.uAper, S.cam.ap ?? .5);
    gl.uniform1f(PP.u.uT, t); gl.uniform1f(PP.u.uBloom, S.bloom ?? 1); gl.uniform1f(PP.u.uFade, S.fade ?? 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return S.label || '';
  };
  window.grab = function(){ const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
})();
