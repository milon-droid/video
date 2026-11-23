// Мир «МАЯК»: небо и молнии, море из слоёв, скалы, утёс с лугом, маяк, корабль, фонарная комната и линза.
const Wd = (() => {
  const { poly, smooth, fill, blob, cloud, wave, foam, rock, rain, grass, spark, TAU } = P;
  const { paper, glow, bg, hash } = E;
  // ---------- молнии: вспышки по времени (яркость 0..1)
  let FL = [];
  const setFlashes = a => FL = a;
  function flash(t) { let v = 0; for (const f of FL) { const d = t - f; if (d >= 0 && d < .7) v = Math.max(v, (d < .06 ? 1 : Math.exp(-(d - .06) * 7)) * (d > .12 && d < .2 ? .5 : 1)); } return v; }
  // цвет: смешать два hex
  function hx(a) { if (a[0] === '#') return parseInt(a.slice(1), 16); const m = a.match(/\d+/g).map(Number); return (m[0] << 16) | (m[1] << 8) | m[2]; }
  function mix(a, b, k) { const pa = hx(a), pb = hx(b); const r = (pa >> 16) * (1 - k) + (pb >> 16) * k, g = ((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k, bl = (pa & 255) * (1 - k) + (pb & 255) * k; return `rgb(${r | 0},${g | 0},${bl | 0})`; }
  // ---------- палитры: шторм ночью / рассвет
  const PAL = {
    night: { sky0: '#0f1630', sky1: '#2a3760', cl: ['#1a2342', '#222d52', '#2a3762'], sea: ['#11283f', '#153452', '#1b4365', '#215279', '#285f8a'], foam: 'rgba(214,230,244,.92)', rock: ['#161b23', '#20262f'], cliff: '#1b2a2c', grass: '#21382f' },
    dawn: { sky0: '#f3b58a', sky1: '#ffe2b8', cl: ['#e99a8a', '#f2ad94', '#f8c6a6'], sea: ['#6d7fa6', '#7c90b4', '#8ea2c2', '#a3b4cf', '#b8c6dc'], foam: 'rgba(255,248,238,.95)', rock: ['#4b4a5a', '#5b5a6b'], cliff: '#4c5a4a', grass: '#6b8a5a' },
  };
  function pal(m) { // m: 0 ночь … 1 рассвет
    if (m <= 0) return PAL.night; if (m >= 1) return PAL.dawn; const o = {};
    for (const k in PAL.night) { const a = PAL.night[k], b = PAL.dawn[k]; o[k] = Array.isArray(a) ? a.map((x, i) => mix(x, b[i], m)) : (a.startsWith('#') ? mix(a, b, m) : (m < .5 ? a : b)); }
    return o;
  }
  // ---------- небо: фон + облака + молния
  function sky(t, o = {}) {
    const m = o.dawn || 0, p = pal(m), f = o.flash == null ? flash(t) : o.flash;
    bg(g => { const gr = g.createLinearGradient(0, 0, 0, 1280); gr.addColorStop(0, mix(p.sky0, '#c9d6ff', f * .55)); gr.addColorStop(.75, mix(p.sky1, '#e6ecff', f * .6)); gr.addColorStop(1, mix(p.sky1, '#e6ecff', f * .6)); g.fillStyle = gr; g.fillRect(0, 0, 720, 1280);
      if (m > 0) { const sy = 900 - m * 260; const sg = g.createRadialGradient(360, sy, 10, 360, sy, 700); sg.addColorStop(0, `rgba(255,240,200,${.9 * m})`); sg.addColorStop(.12, `rgba(255,214,160,${.6 * m})`); sg.addColorStop(1, 'rgba(255,200,160,0)'); g.fillStyle = sg; g.fillRect(0, 0, 720, 1280); } });
    if (m > .3) paper({ z: 7, shadow: 0, glow: 'rgba(255,230,180,.9)', glowR: 60, draw: c => { c.fillStyle = '#fff3d6'; c.beginPath(); c.arc(360, 900 - m * 260, 70, 0, TAU); c.fill(); } });
    const drift = o.drift == null ? t * 14 : o.drift;
    const yOff = o.skyY || 0;
    paper({ z: 6, shadow: 10, par: o.par, shade: f ? null : null, tint: f ? `rgba(220,230,255,${f * .35})` : null, draw: c => { c.fillStyle = p.cl[0];
      for (let i = 0; i < 6; i++) { cloud(c, ((i * 330 + drift * .6) % 2200) - 700, 160 + yOff + (i % 3) * 120, 520, 120, 2 + i); c.fill(); } } });
    if (o.bolt != null) { const b = o.bolt; if (f > .3) paper({ z: 5.5, shadow: 0, glow: 'rgba(220,230,255,1)', glowR: 50, alpha: Math.min(1, f * 1.4), draw: c => { c.fillStyle = '#f4f7ff'; c.beginPath(); let x = b[0], y = b[1]; c.moveTo(x, y); const pts = [];
      for (let i = 0; i < 9; i++) { x += (hash(b[0] + i) - .5) * 90; y += 55; pts.push([x, y]); c.lineTo(x + 9, y); } for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0] - 3, pts[i][1] - 6); c.closePath(); c.fill(); } }); }
    paper({ z: 4.5, shadow: 14, par: o.par, tint: f ? `rgba(220,230,255,${f * .3})` : null, draw: c => { c.fillStyle = p.cl[1];
      for (let i = 0; i < 5; i++) { cloud(c, ((i * 380 + drift) % 2300) - 700, 260 + yOff + (i % 2) * 150, 600, 140, 11 + i); c.fill(); } } });
    return f;
  }
  // ---------- море: n слоёв от горизонта к камере. o: {y0 (горизонт), z0, z1, storm(0..1), f(вспышка), dawn, front:fn(i,c) — вставка между слоями}
  function sea(t, o = {}) {
    const p = pal(o.dawn || 0), st = o.storm == null ? 1 : o.storm, n = o.n || 5, f = o.flash || 0;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1); const z = A.lerp(o.z0 || 3.2, o.z1 || 1.05, k);
      const wv = { y: A.lerp(o.y0 || 720, o.y1 || 1150, k), amp: (8 + 30 * k) * (.25 + .75 * st), len: 180 + 160 * k, ph: t * (.9 + .5 * k) * (.4 + .6 * st) + i * 1.7, seed: i + 1, curl: (6 + 18 * k) * st, x0: -900, x1: 1700 };
      if (o.before) o.before(i, z);
      paper({ z, shadow: 10 + 10 * k, tint: f ? `rgba(200,215,255,${f * .25})` : null, draw: c => { wave(c, wv); fill(c, p.sea[Math.min(4, i)], .22); if (st > .2) foam(c, wv, p.foam); } });
    }
  }
  // ---------- маяк (в локальных координатах: основание (x,y), высота h)
  function lighthouse(c, x, y, h, o = {}) {
    const wB = h * .2, wT = h * .13, top = y - h;
    // башня
    c.beginPath(); c.moveTo(x - wB / 2, y); c.lineTo(x - wT / 2, top); c.lineTo(x + wT / 2, top); c.lineTo(x + wB / 2, y); c.closePath(); fill(c, o.white || '#e7e1d3', .25);
    c.save(); c.clip(); c.fillStyle = o.red || '#bf3a31'; for (let i = 0; i < 3; i++) { const yy = y - h * (.2 + i * .27); c.fillRect(x - wB, yy - h * .07, wB * 2, h * .11); }
    const sg = c.createLinearGradient(x - wB / 2, 0, x + wB / 2, 0); sg.addColorStop(0, 'rgba(0,0,0,.05)'); sg.addColorStop(.7, 'rgba(0,0,0,.12)'); sg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = sg; c.fillRect(x - wB, top, wB * 2, h); c.restore();
    // окошки
    c.fillStyle = o.win || '#202838'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(x, y - h * (.33 + i * .22), wT * .1, wT * .16, 0, 0, TAU); c.fill(); }
    // галерея и фонарная
    c.fillStyle = '#2a2f3a'; c.fillRect(x - wT * .85, top - 8, wT * 1.7, 12);
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 2; for (let i = 0; i <= 8; i++) { const xx = x - wT * .8 + i * wT * .2; c.beginPath(); c.moveTo(xx, top - 8); c.lineTo(xx, top - 30); c.stroke(); } c.fillRect(x - wT * .85, top - 33, wT * 1.7, 4);
    c.fillStyle = o.lamp || '#1d2433'; c.fillRect(x - wT * .42, top - h * .14, wT * .84, h * .14 - 8);
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 3; for (let i = 0; i <= 3; i++) { const xx = x - wT * .42 + i * wT * .28; c.beginPath(); c.moveTo(xx, top - h * .14); c.lineTo(xx, top - 8); c.stroke(); }
    c.fillStyle = '#2a2f3a'; c.beginPath(); c.moveTo(x - wT * .55, top - h * .14); c.lineTo(x, top - h * .22); c.lineTo(x + wT * .55, top - h * .14); c.closePath(); c.fill(); c.fillRect(x - 2, top - h * .25, 4, h * .04);
    return { lamp: [x, top - h * .07], top };
  }
  // утёс с лугом справа
  function cliff(c, x0, y, p, o = {}) {
    c.beginPath(); c.moveTo(x0, 2000); c.lineTo(x0, y + 120); c.lineTo(x0 + 30, y + 40); c.lineTo(x0 + 70, y + 10); c.lineTo(x0 + 140, y - 6); c.lineTo(1400, y - 20); c.lineTo(1400, 2000); c.closePath(); fill(c, p.cliff, .12);
    c.fillStyle = p.grass; grass(c, x0 + 40, 1400, y - 4, 18, 3, o.sway || 0); c.fill();
  }
  // корабль: бортом, нос вправо. o: {flip (−1..1: поворот бумажкой), heel, lit (окна), bob}
  function ship(c, x, y, s, o = {}) {
    c.save(); c.translate(x, y); c.rotate(o.heel || 0); c.scale(s * (o.flip == null ? 1 : o.flip), s);
    // корпус
    c.beginPath(); c.moveTo(-150, -20); c.lineTo(160, -26); c.quadraticCurveTo(150, 10, 120, 34); c.lineTo(-130, 34); c.quadraticCurveTo(-148, 10, -150, -20); c.closePath(); fill(c, '#3a2c2c', .2);
    c.fillStyle = '#b33a32'; c.fillRect(-140, 24, 270, 10);
    c.fillStyle = '#f0e8d8'; c.fillRect(-150, -26, 312, 6);
    // рубка
    c.beginPath(); c.rect(-70, -86, 120, 62); fill(c, '#e3d8c3', .25); c.beginPath(); c.rect(-40, -120, 70, 36); fill(c, '#d4c8b0', .25);
    c.fillStyle = '#3a2c2c'; c.fillRect(-78, -92, 136, 8); c.fillRect(-46, -124, 82, 6);
    // труба и мачта
    c.fillStyle = '#b33a32'; c.fillRect(70, -100, 26, 76); c.fillStyle = '#2a2020'; c.fillRect(70, -106, 26, 8);
    c.strokeStyle = '#2a2020'; c.lineWidth = 4; c.beginPath(); c.moveTo(-110, -24); c.lineTo(-110, -170); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.moveTo(-110, -168); c.lineTo(150, -28); c.moveTo(-110, -168); c.lineTo(-150, -24); c.stroke();
    // окна (цвет — тёплый, свечение отдельно)
    c.fillStyle = o.lit ? '#ffcf73' : '#2d3446'; for (let i = 0; i < 4; i++) c.fillRect(-60 + i * 28, -70, 16, 18); c.fillRect(-30, -112, 18, 16); c.fillRect(0, -112, 18, 16);
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-110 + i * 42, 4, 6, 0, TAU); c.fill(); }
    c.restore();
  }
  function shipGlow(g, x, y, s, o = {}, a = 1) { // тёплые окна и топовый огонь
    const pts = [[-52, -61], [-24, -61], [4, -61], [32, -61], [-21, -104], [9, -104], [-110, -172]];
    const fl = o.flip == null ? 1 : o.flip, he = o.heel || 0, ch = Math.cos(he), sh = Math.sin(he);
    for (const [px, py] of pts) { const lx = px * s * fl, ly = py * s; const X = x + lx * ch - ly * sh, Y = y + lx * sh + ly * ch; const r = (py < -150 ? 26 : 18) * s * 1.3 + 2;
      const gr = g.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, `rgba(255,220,150,${a})`); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, r, 0, TAU); g.fill(); }
  }
  // ---------- линза Френеля (вид спереди): кольца-призмы. lit: 0..1 общая, ring(i)->0..1 по кольцам
  function lens(c, x, y, R, o = {}) {
    const n = 7, lit = o.lit || 0;
    // латунная рама
    c.fillStyle = '#7a5d32'; c.beginPath(); c.arc(x, y, R * 1.08, 0, TAU); c.fill();
    for (let i = 0; i < n; i++) { const r = R * (1 - i / n), rl = o.ring ? o.ring(i) : lit;
      c.beginPath(); c.arc(x, y, r, 0, TAU); const gr = c.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
      gr.addColorStop(0, mix('#3f5266', '#fff6c8', rl)); gr.addColorStop(.85, mix('#273647', '#e8f59a', rl)); gr.addColorStop(1, mix('#566d85', '#ffffff', rl)); c.fillStyle = gr; c.fill();
      c.strokeStyle = `rgba(255,255,255,${.25 + .5 * rl})`; c.lineWidth = 1.5; c.stroke(); }
    // рёбра каркаса
    c.strokeStyle = '#6b5129'; c.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * R * .15, y + Math.sin(a) * R * .15); c.lineTo(x + Math.cos(a) * R * 1.05, y + Math.sin(a) * R * 1.05); c.stroke(); }
    // центр — «бычий глаз»
    c.fillStyle = mix('#33475c', '#fffbe0', lit); c.beginPath(); c.arc(x, y, R * .14, 0, TAU); c.fill();
    if (o.bulb != null) { c.fillStyle = mix('#3b3b36', '#fff2b0', o.bulb); c.beginPath(); c.arc(x, y, R * .09, 0, TAU); c.fill(); }
  }
  // ---------- интерьер фонарной: стена с окнами-переплётами (за ними шторм), пол, пульт
  function roomBack(c, t, o = {}) {
    const f = o.flash || 0;
    c.fillStyle = mix('#1a2133', '#8d9bc4', f * .5); c.fillRect(-400, -400, 1600, 2200);
    // окна-переплёты
    for (let i = 0; i < 3; i++) { const x = -40 + i * 300; c.fillStyle = mix('#22305a', '#d8e2ff', f); c.fillRect(x, 160, 230, 560);
      c.strokeStyle = '#3c3324'; c.lineWidth = 12; c.strokeRect(x, 160, 230, 560); c.lineWidth = 7; c.beginPath(); c.moveTo(x + 115, 160); c.lineTo(x + 115, 720); c.moveTo(x, 440); c.lineTo(x + 230, 440); c.stroke(); }
  }
  return { flash, setFlashes, pal, mix, sky, sea, lighthouse, cliff, ship, shipGlow, lens, roomBack, PAL };
})();
