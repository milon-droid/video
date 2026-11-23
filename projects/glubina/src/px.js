// ГЛУБИНА — пиксельный дизеринг-движок.
// Рисуем в маленький буфер 240×427: R = яркость, G = «янтарь» (тёплый свет приманки).
// post(): упорядоченный дизеринг Bayer 8×8 в палитру (5 холодных тонов + 3 янтарных), пиксель ×3 → 720×1280.
const PX = (() => {
  const F = 3, W = 240, H = 427, OW = 720, OH = 1280;
  const out = document.getElementById('c'); out.width = OW; out.height = OH;
  const octx = out.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const buf = mk(), ctx = buf.getContext('2d', { willReadFrequently: true });
  const t1 = mk(), c1 = t1.getContext('2d'), t2 = mk(), c2 = t2.getContext('2d');
  const img = octx.createImageData(OW, OH);

  const B8 = [0,32,8,40,2,34,10,42, 48,16,56,24,50,18,58,26, 12,44,4,36,14,46,6,38, 60,28,52,20,62,30,54,22,
              3,35,11,43,1,33,9,41, 51,19,59,27,49,17,57,25, 15,47,7,39,13,45,5,37, 63,31,55,23,61,29,53,21].map(v => (v + .5) / 64);
  const hex = h => [1,3,5].map(i => parseInt(h.slice(i, i + 2), 16));
  const PAL = {
    abyss:   ['#03050a', '#0b1828', '#173c4b', '#3f8584', '#d3eee0'].map(hex),
    surface: ['#0e1d3d', '#245296', '#4aa0d8', '#a6def0', '#fff7e3'].map(hex),
    amber:   ['#5a220e', '#d9681c', '#ffd47e'].map(hex),
  };

  // ---------- утилиты ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const inv = (a, b, v) => clamp((v - a) / (b - a));
  const E = {
    io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
    o: k => 1 - Math.pow(1 - k, 3), i: k => k * k * k,
    back: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
    el: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * 2.094) + 1,
  };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
  // ключи [[t, v], ...] с easing
  const K = (keys, t, ease = E.io) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [ta, va] = keys[i - 1], [tb, vb] = keys[i]; const k = (keys[i][2] || ease)((t - ta) / (tb - ta));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
    return keys[keys.length - 1][1];
  };
  // цвет буфера: l — яркость 0..1, a — янтарь 0..1, al — прозрачность
  const C = (l, a = 0, al = 1) => `rgba(${Math.round(clamp(l) * 255)},${Math.round(clamp(a) * 255)},0,${al})`;

  // ---------- свет ----------
  // Спрайт с освещением: draw(c) рисует силуэт базовыми цветами; lights = [{x,y,r,l,a}] в координатах буфера.
  // База рисуется как есть, свет — аддитивно и только внутри силуэта.
  function lit(draw, lights, setT) {
    c1.setTransform(1,0,0,1,0,0); c1.clearRect(0, 0, W, H); c1.globalCompositeOperation = 'source-over';
    setT && setT(c1); draw(c1); c1.setTransform(1,0,0,1,0,0);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(t1, 0, 0); ctx.restore();
    if (!lights || !lights.length) return;
    c2.setTransform(1,0,0,1,0,0); c2.globalCompositeOperation = 'source-over'; c2.clearRect(0, 0, W, H);
    c2.globalCompositeOperation = 'lighter';
    for (const L of lights) {
      const ll = L.l || 0, la = L.a || 0;
      if (!(L.r > 0) || (!ll && !la)) continue;
      const g = c2.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
      g.addColorStop(0, C(ll, la)); g.addColorStop(.35, C(ll * .45, la * .45)); g.addColorStop(1, C(0, 0));
      c2.fillStyle = g; c2.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    }
    c2.globalCompositeOperation = 'destination-in'; c2.drawImage(t1, 0, 0);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(t2, 0, 0); ctx.restore();
  }
  // Свечение в воздухе/воде (аддитивно)
  function glow(x, y, r, l, a = 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, C(l, a)); g.addColorStop(.3, C(l * .35, a * .35)); g.addColorStop(1, C(0, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }
  // Луч фонаря: из (x,y) под углом ang, длина len, раствор half (рад)
  function beam(x, y, ang, len, half, l, a = 0) {
    if (l <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, C(l, a)); g.addColorStop(.25, C(l * .5, a * .5)); g.addColorStop(1, C(0, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.arc(x, y, len, ang - half, ang + half); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .6; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, len * .8, ang - half * .45, ang + half * .45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- пиксельный шрифт 5×7 ----------
  const G = {
    A:'01110100011000111111100011000110001', B:'11110100011000111110100011000111110', C:'01110100011000010000100001000101110',
    D:'11110100011000110001100011000111110', E:'11111100001000011110100001000011111', F:'11111100001000011110100001000010000',
    G:'01110100011000010111100011000101111', H:'10001100011000111111100011000110001', I:'01110001000010000100001000010001110',
    J:'00111000100001000010000101001001100', K:'10001100101010011000101001001010001', L:'10000100001000010000100001000011111',
    M:'10001110111010110101100011000110001', N:'10001100011100110101100111000110001', O:'01110100011000110001100011000101110',
    P:'11110100011000111110100001000010000', Q:'01110100011000110001101011001001101', R:'11110100011000111110101001001010001',
    S:'01111100001000001110000010000111110', T:'11111001000010000100001000010000100', U:'10001100011000110001100011000101110',
    V:'10001100011000110001100010101000100', W:'10001100011000110101101011010101010', X:'10001100010101000100010101000110001',
    Y:'10001100010101000100001000010000100', Z:'11111000010001000100010001000011111',
    0:'01110100011001110101110011000101110', 1:'00100011000010000100001000010001110', 2:'01110100010000100010001000100011111',
    3:'11111000100010000010000011000101110', 4:'00010001100101010010111110001000010', 5:'11111100001111000001000011000101110',
    6:'00110010001000011110100011000101110', 7:'11111000010001000100010000100001000', 8:'01110100011000101110100011000101110',
    9:'01110100011000101111000010001001100', ',':'00000000000000000000001100010001000', '.':'00000000000000000000000000110001100',
    ':':'00000011000110000000011000110000000', '!':'00100001000010000100001000000000100', '?':'01110100010000100010001000000000100',
    "'":'00100001000100000000000000000000000', '-':'00000000000000011111000000000000000', '/':'00001000100001000100010000100010000',
    ' ':'00000000000000000000000000000000000',
  };
  // text(str, cx, y, size, {l, a, al, align}) — с тёмной обводкой 1 пиксель буфера
  function text(str, x, y, s = 2, o = {}) {
    str = String(str).toUpperCase(); const adv = 6 * s, tw = str.length * adv - s;
    let x0 = o.align === 'left' ? x : o.align === 'right' ? x - tw : x - tw / 2;
    x0 = Math.round(x0); y = Math.round(y);
    const vis = o.chars ?? str.length;
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = o.al ?? 1;
    for (const pass of [0, 1]) {
      ctx.fillStyle = pass ? C(o.l ?? 1, o.a ?? 0) : C(0, 0);
      for (let i = 0; i < Math.min(vis, str.length); i++) {
        const g = G[str[i]] || G[' '];
        for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === '1') {
          const px = x0 + i * adv + q * s, py = y + r * s;
          if (pass) ctx.fillRect(px, py, s, s); else ctx.fillRect(px - 1, py - 1, s + 2, s + 2);
        }
      }
    }
    ctx.restore(); return tw;
  }

  // ---------- финальный дизеринг ----------
  // o.pal(y) → 0 (бездна) … 1 (поверхность) для строки буфера; o.flash — прибавка яркости; o.fade — затемнение 0..1
  function post(o = {}) {
    const d = ctx.getImageData(0, 0, W, H).data, od = img.data;
    const flash = o.flash || 0, fade = o.fade ?? 0, lumK = o.gain ?? 1;
    const A = PAL.abyss, S = PAL.surface, M = PAL.amber;
    const row = new Array(5);
    for (let y = 0; y < H; y++) {
      const p = o.pal ? clamp(o.pal(y)) : 0;
      for (let i = 0; i < 5; i++) row[i] = [lerp(A[i][0], S[i][0], p), lerp(A[i][1], S[i][1], p), lerp(A[i][2], S[i][2], p)];
      for (let x = 0; x < W; x++) {
        const k = (y * W + x) * 4, b = B8[(y & 7) * 8 + (x & 7)];
        let l = Math.pow(d[k] / 255, .82) * lumK + flash, a = d[k + 1] / 255;
        l *= 1 - fade; a *= 1 - fade;
        let col;
        if (a > .04 && a > .12 + b * .3) { // тёплый свет: своя лестница тонов от черноты до светлого янтаря
          const v = clamp(l * 1.45 + a * .1) * 3, i = Math.floor(v), f = v - i, j = Math.min(3, f > b ? i + 1 : i);
          col = j === 0 ? row[0] : M[j - 1];
        } else {
          const v = clamp(l) * 4, i = Math.floor(v), f = v - i;
          col = row[Math.min(4, f > b ? i + 1 : i)];
        }
        const yy = y * F;
        for (let dy = 0; dy < F; dy++) {
          if (yy + dy >= OH) break;
          let q = ((yy + dy) * OW + x * F) * 4;
          for (let dx = 0; dx < F; dx++, q += 4) { od[q] = col[0]; od[q + 1] = col[1]; od[q + 2] = col[2]; od[q + 3] = 255; }
        }
      }
    }
    octx.putImageData(img, 0, 0);
  }
  function clear(l = 0) { ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.fillStyle = C(l); ctx.fillRect(0, 0, W, H); }

  return { W, H, ctx, C, lit, glow, beam, text, post, clear, clamp, lerp, inv, E, K, hash, noise1 };
})();
