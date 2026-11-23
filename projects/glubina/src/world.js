// Окружение: толща воды, морской снег, дно, ил, пузыри, трос.
const WD = (() => {
  const { ctx, W, H, C, lit, glow, hash, noise1, clamp, lerp } = PX;

  // толща воды: сверху чуть светлее (lt — сколько света сверху)
  function water(top = .06, bot = 0, aTop = 0) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C(top, aTop)); g.addColorStop(1, C(bot));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // морской снег: cx,cy — смещение камеры, vy — скорость (для штрихов), lum — общая яркость, lights — подсветка
  function snow(cx, cy, vy = 0, lum = .35, lights = [], n = 170, t = 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const z = .25 + hash(i * 3.1) * .75;
      const sx = ((hash(i) * 480 - cx * z + Math.sin(t * .7 + i) * 2) % 480 + 480) % 480 - 120;
      const sy = ((hash(i * 7.7) * 640 - cy * z + t * 3 * z) % 640 + 640) % 640 - 100;
      if (sx < -2 || sx > W + 2 || sy < -40 || sy > H + 40) continue;
      let l = lum * (.3 + .7 * z);
      for (const L of lights) { const d = Math.hypot(sx - L.x, sy - L.y); if (d < L.r) l += (1 - d / L.r) * ((L.l||0) + (L.a||0)) * .9; }
      let a = 0; for (const L of lights) { const d = Math.hypot(sx - L.x, sy - L.y); if (d < L.r && L.a) a += (1 - d / L.r) * L.a; }
      const len = Math.abs(vy) * z;
      ctx.fillStyle = C(l, a);
      if (len > 1.2) ctx.fillRect(Math.round(sx), Math.round(sy), z > .7 ? 2 : 1, Math.round(len));
      else ctx.fillRect(Math.round(sx), Math.round(sy), z > .8 ? 2 : 1, z > .8 ? 2 : 1);
    }
    ctx.restore();
  }

  // профиль дна
  const gy = (x, base, amp = 5) => base + noise1(x * .02) * amp + noise1(x * .07 + 9) * amp * .4;
  // дно: base — y горизонта в буфере (при камере в 0), camX — сдвиг, zoom около точки (fx,fy)
  function seabed(o) {
    const { base, camX = 0, amb = .3, lights = [], far = true } = o;
    if (far) { // дальний хребет — без света, чуть светлее воды
      ctx.fillStyle = C(.035 * (o.farL ?? 1)); ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) ctx.lineTo(x, base - 26 - Math.abs(noise1((x + camX * .3) * .012)) * 40); ctx.lineTo(W, H); ctx.fill();
    }
    lit(c => {
      c.fillStyle = C(.13 * amb * 3); c.beginPath(); c.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) c.lineTo(x, gy(x + camX, base)); c.lineTo(W, H); c.fill();
      // камни и губки
      for (let i = -2; i < 14; i++) {
        const wx = i * 46 + hash(i) * 30, sx = wx - camX % 46 - Math.floor(camX / 46) * 0;
        const X = ((wx - camX) % 700 + 700) % 700 - 60; if (X < -40 || X > W + 40) continue;
        const Y = gy(X + camX, base) + 2, r = 4 + hash(i * 2.3) * 9;
        c.fillStyle = C(.17 * amb * 3); c.beginPath(); c.ellipse(X, Y, r * 1.5, r * .8, 0, Math.PI, 0); c.fill();
        c.fillStyle = C(.03); c.fillRect(X - r * 1.4, Y, r * 2.8, 1);
        if (hash(i * 5.1) > .5) { // трубчатые черви
          for (let j = 0; j < 3; j++) { const tx = X + r * 1.6 + j * 3, th = 7 + hash(i + j) * 9;
            c.strokeStyle = C(.2 * amb * 3); c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx, Y + 1); c.quadraticCurveTo(tx + 2, Y - th * .5, tx + Math.sin(i + j) * 2, Y - th); c.stroke(); }
        }
      }
      // рябь ила
      c.fillStyle = C(.2 * amb * 3);
      for (let k = 0; k < 40; k++) { const X = ((hash(k * 9.3) * 600 - camX) % 600 + 600) % 600 - 50, Y = gy(X + camX, base) + 6 + hash(k) * (H - base); c.fillRect(X, Y, 3 + hash(k * 2) * 6, 1); }
    }, lights);
  }

  // облако ила: мягкие клубы, размытые
  function silt(x, y, R, l, a = 0, seed = 1, al = 1) {
    if (R <= 0 || al <= 0) return;
    ctx.save(); ctx.filter = `blur(${Math.max(1, R * .18)}px)`; ctx.globalAlpha = al;
    for (let i = 0; i < 9; i++) {
      const an = hash(seed + i) * 6.28, d = R * (.2 + hash(seed * 2 + i) * .6), r = R * (.35 + hash(seed * 3 + i) * .4);
      const px = x + Math.cos(an) * d * 1.4, py = y + Math.sin(an) * d * .6 - r * .3;
      const g = ctx.createRadialGradient(px, py - r * .3, 0, px, py, r);
      g.addColorStop(0, C(l * 1.15, a)); g.addColorStop(.6, C(l * .7, a * .7, .8)); g.addColorStop(1, C(l * .4, a * .4, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // пузыри: от точки (x,y), возраст age (с), кол-во n
  function bubbles(x, y, age, n = 8, l = .7, seed = 1, spread = 10) {
    if (age < 0) return;
    ctx.save(); ctx.strokeStyle = C(l); ctx.lineWidth = 1; ctx.fillStyle = C(l * 1.2);
    for (let i = 0; i < n; i++) {
      const a = age - hash(seed + i) * .6; if (a < 0) continue;
      const r = 1 + hash(seed * 3 + i) * 2.5, vy = 28 + hash(i + seed) * 30;
      const bx = x + (hash(seed * 5 + i) - .5) * spread + Math.sin(a * 6 + i) * 2.5, by = y - a * vy - a * a * 8;
      if (by < -10) continue;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.stroke(); ctx.fillRect(Math.round(bx - r * .4), Math.round(by - r * .5), 1, 1);
    }
    ctx.restore();
  }

  // стальной трос из прядей: от (x,y0) до (x,y1); strands — сколько прядей осталось, fray — растрёпанность
  function cable(x, y0, y1, strands, l = .45, tw = 0) {
    for (let k = 0; k < 6; k++) {
      const alive = k < strands; if (!alive) continue;
      ctx.strokeStyle = C(l * (.7 + (k % 2) * .3)); ctx.lineWidth = 1.4; ctx.beginPath();
      for (let y = y0; y <= y1; y += 2) { const ph = y * .12 + k * 1.05 + tw; ctx.lineTo(x + Math.sin(ph) * 2.6 * (strands / 6 + .3), y); }
      ctx.stroke();
    }
  }
  // лопнувшая прядь: отлетает пружинкой
  function snapped(x, y, side, age, l = .5) {
    if (age < 0) return; const k = Math.min(1, age * 3);
    ctx.strokeStyle = C(l); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= 10; i++) { const u = i / 10; ctx.lineTo(x + side * u * 22 * PX.E.o(k) + Math.sin(u * 14 + age * 20) * 2 * u, y - u * 10 * k + Math.sin(u * 9) * 3 * u * k + u * u * 14 * k); }
    ctx.stroke();
  }

  // медуза (холодное свечение)
  function jelly(x, y, r, t, l = .5) {
    glow(x, y, r * 3, l * .35);
    ctx.save(); ctx.fillStyle = C(l * .6); ctx.strokeStyle = C(l * .8); ctx.lineWidth = 1;
    const p = 1 + Math.sin(t * 5) * .12;
    ctx.beginPath(); ctx.ellipse(x, y, r * p, r * .7 / p, 0, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 5; i++) { const tx = x - r * .8 + i * r * .4; ctx.beginPath(); ctx.moveTo(tx, y);
      ctx.quadraticCurveTo(tx + Math.sin(t * 4 + i) * 3, y + r, tx + Math.sin(t * 3 + i) * 4, y + r * 2.2); ctx.stroke(); }
    ctx.restore();
  }
  return { water, snow, seabed, gy, silt, bubbles, cable, snapped, jelly };
})();
