// МАЯК — движок бумажной диорамы (Canvas2D).
// Слой = функция рисования в своих координатах (720×1280 при камере в покое) + глубина z.
// Камера: x,y (сдвиг), zoom, dz (наезд вглубь). Параллакс: s = zoom*z/(z-dz), сдвиг cam/z.
// Каждый слой: рисуем в черновой холст → фактура бумаги (source-atop) → свет/затемнение → на главный холст
// с мягкой тенью (размер ∝ глубине) и размытием по глубине резкости. Светящееся — отдельный проход + bloom.
const W = 720, H = 1280, CX = 360, CY = 640;
const E = (() => {
  const cv = document.getElementById('c'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const L = mk(), lg = L.getContext('2d');            // черновой слой
  const GL = mk(W / 2, H / 2), gg = GL.getContext('2d'); // свечение (полразмера)
  const GB = mk(W / 2, H / 2), gb = GB.getContext('2d');
  // ---------- детерминированный шум
  const hash = (n) => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const rnd = (s) => { let x = s * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
  // ---------- фактура бумаги: светлые волокна + тёмные крапины + пятна
  const TEX = mk(512, 512); {
    const t = TEX.getContext('2d'); const r = rnd(7);
    for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, rr = 20 + r() * 70;
      const gr = t.createRadialGradient(x, y, 0, x, y, rr); const a = r() < .5 ? `rgba(255,255,255,${.035 * r()})` : `rgba(0,0,0,${.04 * r()})`;
      gr.addColorStop(0, a); gr.addColorStop(1, 'rgba(0,0,0,0)'); t.fillStyle = gr; t.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    t.lineCap = 'round';
    for (let i = 0; i < 2600; i++) { const x = r() * 512, y = r() * 512, a = r() * 6.28, l = 3 + r() * 14;
      t.strokeStyle = r() < .7 ? `rgba(255,255,255,${.05 + .12 * r()})` : `rgba(0,0,0,${.05 + .08 * r()})`; t.lineWidth = .5 + r() * .8;
      t.beginPath(); t.moveTo(x, y); t.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); t.stroke(); }
    for (let i = 0; i < 9000; i++) { t.fillStyle = r() < .5 ? `rgba(0,0,0,${.08 * r()})` : `rgba(255,255,255,${.08 * r()})`; t.fillRect(r() * 512, r() * 512, 1, 1); }
  }
  const texPat = g.createPattern(TEX, 'repeat');
  // ---------- зерно кадра (несколько кадров, по очереди)
  const GRAIN = [0, 1, 2, 3].map(k => { const c = mk(360, 640), t = c.getContext('2d'), d = t.createImageData(360, 640), r = rnd(31 + k);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } t.putImageData(d, 0, 0); return c; });
  // ---------- камера и кадр
  const S = { t: 0, cam: { x: 0, y: 0, zoom: 1, dz: 0, rot: 0 }, focus: 1, aperture: 0, light: '#fff', shake: 0 };
  function layerXf(c, z, par = 1) {
    const cam = S.cam, zz = Math.max(.08, z - cam.dz), s = cam.zoom * z / zz;
    const sx = (Math.sin(S.t * 37) + Math.sin(S.t * 23.3)) * S.shake / z, sy = (Math.cos(S.t * 31) + Math.sin(S.t * 19.7)) * S.shake / z;
    c.setTransform(1, 0, 0, 1, 0, 0); c.translate(CX, CY); if (cam.rot) c.rotate(cam.rot); c.scale(s, s);
    c.translate(-CX - (cam.x * par) / z + sx, -CY - (cam.y * par) / z + sy);
    return s;
  }
  // слой бумаги. o: {z, draw(ctx,t), shadow:px, tex:alpha, shade:[top,bottom] rgba, glow:color (ореол сзади), blur:+px, alpha, par}
  function paper(o) {
    const z = o.z || 1; lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.filter = 'none';
    lg.clearRect(0, 0, W, H); const s = layerXf(lg, z, o.par);
    lg.save(); o.draw(lg, S.t, s); lg.restore();
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-atop';
    if (o.tex !== 0) { lg.globalAlpha = o.tex == null ? 1 : o.tex; lg.fillStyle = texPat; const off = (z * 173) % 512; lg.translate(-off, -off * .7); lg.fillRect(off, off * .7, W, H); lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalAlpha = 1; }
    if (o.shade) { const gr = lg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, o.shade[0]); gr.addColorStop(1, o.shade[1]); lg.fillStyle = gr; lg.fillRect(0, 0, W, H); }
    if (o.tint) { lg.fillStyle = o.tint; lg.fillRect(0, 0, W, H); }
    if (o.post) o.post(lg);
    lg.globalCompositeOperation = 'source-over';
    // DOF
    const dof = S.aperture * Math.abs(1 / Math.max(.08, z - S.cam.dz) - 1 / S.focus) * 6 + (o.blur || 0);
    g.save(); g.globalAlpha = o.alpha == null ? 1 : o.alpha;
    if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = (o.glowR || 40) * s; g.shadowOffsetX = 0; g.shadowOffsetY = 0; g.filter = dof > .4 ? `blur(${dof.toFixed(1)}px)` : 'none'; g.drawImage(L, 0, 0); }
    const sh = o.shadow == null ? 14 : o.shadow;
    if (sh > 0) { g.shadowColor = o.shadowColor || 'rgba(0,0,0,.55)'; g.shadowBlur = sh * s * 1.2; g.shadowOffsetX = sh * s * .35; g.shadowOffsetY = sh * s * .6; }
    else { g.shadowColor = 'transparent'; }
    g.filter = dof > .4 ? `blur(${dof.toFixed(1)}px)` : 'none';
    g.drawImage(L, 0, 0); g.restore();
  }
  // светящийся проход: рисуем на полразмерный холст (координаты кадра /2 при камере слоя z) — потом bloom
  function glow(z, fn, par) { gg.save(); layerXf(gg, z, par); gg.setTransform(new DOMMatrix([.5, 0, 0, .5, 0, 0]).multiply(gg.getTransform())); gg.globalCompositeOperation = 'lighter'; fn(gg, S.t); gg.restore(); }
  function flushGlow(strength = 1) {
    // ядро
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.drawImage(GL, 0, 0, W, H);
    // bloom: два радиуса
    gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, W / 2, H / 2); gb.filter = 'blur(10px)'; gb.drawImage(GL, 0, 0); gb.filter = 'none';
    g.globalAlpha = .9 * strength; g.drawImage(GB, 0, 0, W, H);
    gb.clearRect(0, 0, W / 2, H / 2); gb.filter = 'blur(34px)'; gb.drawImage(GL, 0, 0); gb.filter = 'none';
    g.globalAlpha = .8 * strength; g.drawImage(GB, 0, 0, W, H); g.restore();
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, W / 2, H / 2);
  }
  function bg(fn) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); fn(g); g.restore(); }
  function overlay(fn) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); fn(g); g.restore(); }
  function post(o = {}) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    // виньетка
    const v = g.createRadialGradient(CX, CY * .95, H * .28, CX, CY, H * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${o.vig == null ? .55 : o.vig})`);
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // зерно
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = o.grain == null ? .10 : o.grain; g.drawImage(GRAIN[Math.floor(S.t * 24) % 4], 0, 0, W, H);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (o.fade) { g.fillStyle = `rgba(0,0,0,${o.fade})`; g.fillRect(0, 0, W, H); }
    if (o.white) { g.fillStyle = `rgba(255,250,235,${o.white})`; g.fillRect(0, 0, W, H); }
    g.restore();
  }
  function frame(t, story) {
    S.t = t; Object.assign(S.cam, { x: 0, y: 0, zoom: 1, dz: 0, rot: 0 }); S.focus = 1; S.aperture = 0; S.shake = 0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.shadowColor = 'transparent';
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    story(t);
  }
  window.grab = () => g.getImageData(0, 0, W, H).data;
  return { W, H, CX, CY, S, g, paper, glow, flushGlow, bg, overlay, post, frame, hash, rnd, noise1, mk, TEX };
})();

// ---------- анимация: ключи, сглаживания
const A = (() => {
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = {
    lin: k => k, io: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k,
    back: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
    el: k => k === 0 || k === 1 ? k : Math.pow(2, -9 * k) * Math.sin((k * 10 - .75) * 2.094) + 1,
    sine: k => .5 - .5 * Math.cos(Math.PI * k),
  };
  // K(t, [[t0,v0],[t1,v1,'back'],...]) — значение по ключам (ease на входе в ключ)
  function K(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i]; const k = (ease[e || 'io'])((t - t0) / (t1 - t0));
      if (Array.isArray(v0)) return v0.map((a, j) => lerp(a, v1[j], k)); return lerp(v0, v1, k);
    }
    return keys[keys.length - 1][1];
  }
  const seg = (t, a, b) => cl((t - a) / (b - a));
  // пружина: отклик на скачок значения fn вокруг t (инерция по истории)
  function lag(fn, t, k = 10, damp = 5) { // приближённо: вторичное движение = f(t) - f(t-dt) свёрнутое затухающим колебанием
    let s = 0; const dt = 1 / 60;
    for (let i = 1; i < 60; i++) { const tau = i * dt; const w = Math.exp(-damp * tau) * Math.sin(k * tau); s += (fn(t - tau + dt) - fn(t - tau)) * w; }
    return s;
  }
  const blink = (t, seed = 0) => { const p = 3.1 + (seed % 3) * .7, ph = ((t + seed * 1.37) % p) / p; return ph > .955 ? Math.sin((ph - .955) / .045 * Math.PI) : 0; };
  return { cl, lerp, ease, K, seg, lag, blink };
})();
