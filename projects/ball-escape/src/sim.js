// Детерминированная физика «шарик выбирается из вращающихся колец».
// Работает и в браузере (window.simulate), и в node (module.exports) — для подбора параметров.
(function (root) {
  function simulate(o) {
    const P = Object.assign({ cx: 540, cy: 860, rings: 12, r0: 110, dr: 24, thick: 9, br: 14, g: 1100, gap: 0.62, w0: 0.9, dw: 0.07,
      a0: -1.2, v0: 820, kick: 0.18, vmin: 650, vmax: 1550, T: 30, fps: 30, sub: 16, seed: 1, schedule: null, margin: 0.12 }, o || {});
    const hist = Array.from({ length: P.rings }, () => []);
    const R = Array.from({ length: P.rings }, (_, i) => ({ r: P.r0 + i * P.dr, w: (i % 2 ? -1 : 1) * (P.w0 + i * P.dw), a: i * 2.399 + P.seed }));
    let x = P.cx, y = P.cy, vx = Math.cos(P.a0) * P.v0, vy = Math.sin(P.a0) * P.v0, k = 0;
    const dt = 1 / (P.fps * P.sub), frames = [], bounces = [], breaks = [];
    const angd = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d < -Math.PI) d += 2 * Math.PI; if (d > Math.PI) d -= 2 * Math.PI; return Math.abs(d); };
    for (let f = 0; f <= P.T * P.fps; f++) {
      frames.push({ x, y, vx, vy, k });
      for (let s = 0; s < P.sub; s++) {
        const t = (f * P.sub + s) * dt;
        vy += P.g * dt; x += vx * dt; y += vy * dt;
        if (k >= P.rings) continue;
        const ring = R[k], dx = x - P.cx, dy = y - P.cy, d = Math.hypot(dx, dy), lim = ring.r - P.thick / 2 - P.br;
        if (d >= lim) {
          const phi = Math.atan2(dy, dx);
          if (P.schedule) { // режиссёрский режим: прорезь ставится в точку удара, если раньше сюда не били
            if (t >= P.schedule[k]) { const a = phi - ring.w * t;
              if (hist[k].every(([tj, pj]) => angd(pj, a + ring.w * tj) > P.gap / 2 + P.margin)) { ring.a = a; breaks.push({ t, ring: k, ang: phi }); k++; continue; } }
          } else if (angd(phi, ring.a + ring.w * t) < P.gap / 2 - P.br / ring.r) { breaks.push({ t, ring: k, ang: phi }); k++; continue; }
          const nx = dx / d, ny = dy / d, vn = vx * nx + vy * ny;
          if (vn > 0) { vx -= 2 * vn * nx; vy -= 2 * vn * ny;
            const tx = -ny, ty = nx, wall = ring.w * ring.r * P.kick; vx += tx * wall; vy += ty * wall;
            let sp = Math.hypot(vx, vy), sc = Math.min(P.vmax, Math.max(P.vmin, sp)) / sp; vx *= sc; vy *= sc;
            bounces.push({ t, ring: k, ang: phi }); hist[k].push([t, phi]); }
          x = P.cx + nx * lim; y = P.cy + ny * lim;
        }
      }
    }
    return { P, R, frames, bounces, breaks };
  }
  if (typeof module !== 'undefined') module.exports = { simulate }; else root.simulate = simulate;
})(this);
