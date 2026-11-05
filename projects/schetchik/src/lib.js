// «Счётчик» — общие компоненты для всех серий (canvas, детерминированно по t).
// Имена совпадают с ТЗ (раздел 5): KineticCaption, Hud, PhoneScreen, HandPhone, MirrorShot,
// FrostOverlay, RuleCard, TopDownMap, DashcamFrame, PartSticker, EndCard, Glitch.
'use strict';
const W = 1080, H = 1920, CXC = 510; // центр для текста: правее 60 px от края и левее кнопок платформы
const T = { night: '#0E1630', night2: '#1B2547', window: '#F2B33D', danger: '#E5383B', frost: '#CFE8FF', ok: '#3DDC84', text: '#F4F1EA', dim: 'rgba(244,241,234,.35)', ink: '#070a16', ol: '#0a0d1c' };
let ctx;
const initLib = c => { ctx = c.getContext('2d'); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, win = (t, a, b) => clamp((t - a) / (b - a));
const E = { out: k => 1 - Math.pow(1 - k, 3), io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); } };
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function fillOL(col, lw = 5) { ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = T.ol; ctx.lineJoin = 'round'; ctx.stroke(); }
function txt(s, x, y, size, col = T.text, { font = 'Mont', weight = 900, align = 'left', alpha = 1, stroke = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.textAlign = align;
  if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(5,7,16,.9)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
function glow(x, y, r, col, a = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
const cam = (z, fx, fy, draw, dx = 0, dy = 0) => { ctx.save(); ctx.translate(fx + dx, fy + dy); ctx.scale(z, z); ctx.translate(-fx, -fy); draw(); ctx.restore(); };
// наезд 100→108% (правило кадра из ТЗ)
const push = (t, a, b, draw, fx = 540, fy = 900, z0 = 1, z1 = 1.08) => cam(lerp(z0, z1, E.io(win(t, a, b))), fx, fy, draw);
const pan = (t, a, b, draw, px = 60) => { ctx.save(); ctx.translate(-px * E.io(win(t, a, b)), 0); draw(); ctx.restore(); };

// ───── снег ─────
const FLAKES = (() => { const r = seeded(17); return Array.from({ length: 160 }, () => [r() * W, r() * H, 40 + r() * 120, 1.5 + r() * 4, r() * 6]); })();
function snow(t, a = .8, wind = 0, speed = 1) { ctx.save(); ctx.fillStyle = '#e8f2ff';
  for (const [x0, y0, sp, r, ph] of FLAKES) { const y = (y0 + t * sp * speed) % (H + 40) - 20, x = ((x0 + Math.sin(t * .8 + ph) * 22 + wind * t * sp * .02) % (W + 40) + W + 40) % (W + 40) - 20;
    ctx.globalAlpha = a * (.4 + r / 7); circle(x, y, r); ctx.fill(); } ctx.restore(); }
function bokeh(t, seed, n, y0, y1, a = .6) { const r = seeded(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0), rad = 14 + r() * 44, c = r() < .65 ? '242,179,61' : '207,232,255', fl = .65 + .35 * Math.sin(t * (.8 + r()) + i);
    ctx.fillStyle = `rgba(${c},${a * .3 * fl})`; circle(x, y, rad); ctx.fill(); } ctx.restore(); }

// ───── постобработка: зерно 6% + виньетка 35% ─────
const GRAIN = (() => { const arr = []; for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'), im = g.createImageData(270, 480), r = seeded(101 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); arr.push(c); } return arr; })();
function post(t) { ctx.save(); ctx.globalAlpha = .06; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = false; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ───── HUD: «• НОЧЬ 1 · 03:31 · −31°» слева, баланс справа ─────
const hms = s => { s = Math.max(0, Math.floor(s)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
function Hud(t, { night, label = null, time, temp, balance = null, flash = 0 }) {
  const left = `${label || 'НОЧЬ ' + night} · ${time} · ${temp}`; ctx.save(); ctx.font = '700 34px JBM'; const w = ctx.measureText(left).width + 64;
  ctx.fillStyle = 'rgba(7,10,22,.72)'; rr(70, 212, w, 58, 12); ctx.fill(); ctx.strokeStyle = 'rgba(229,56,59,.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = T.danger; circle(96, 241, 7); ctx.fill(); txt(left, 116, 242, 34, T.text, { font: 'JBM', weight: 700 }); ctx.restore();
  if (balance !== null) { const s = typeof balance === 'string' ? balance : hms(balance), x1 = 1010; ctx.save(); ctx.font = '800 34px JBM'; const bw = ctx.measureText(s).width + 48;
    if (flash > 0) { ctx.shadowColor = T.danger; ctx.shadowBlur = 40 * flash; }
    ctx.fillStyle = `rgba(${lerp(7, 120, flash)},${lerp(10, 16, flash)},${lerp(22, 22, flash)},.8)`; rr(x1 - bw, 212, bw, 92, 12); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = T.danger; ctx.lineWidth = 2; ctx.stroke();
    txt('БАЛАНС', x1 - bw + 24, 232, 20, 'rgba(244,241,234,.6)', { font: 'JBM', weight: 700 }); txt(s, x1 - bw + 24, 272, 34, T.danger, { font: 'JBM', weight: 800 }); ctx.restore(); } }

// ───── KineticCaption: слова загораются по одному, фразы по 3–5 слов ─────
// buildCaptions([[начало, конец, 'текст с **акцентом**'], ...]) → фразы со временем каждого слова (равномерно — пока нет голоса)
function buildCaptions(list, { lead = .05, tail = .35 } = {}) {
  const out = [];
  for (const [a, b, raw, opt = {}] of list) {
    const words = []; let acc = false;
    for (const tok of raw.split(/\s+/).filter(Boolean)) { let w = tok; const st = w.startsWith('**'); if (st) { acc = true; w = w.slice(2); } const en = w.includes('**'); w = w.replace(/\*\*/g, '');
      words.push({ text: w.toUpperCase(), accent: acc }); if (en) acc = false; }
    // разбить на фразы: по знакам препинания, не длиннее 5 слов, короткие (<3) склеить со следующей
    const segs = []; let cur = []; words.forEach(w => { cur.push(w); if (/[.!?]$/.test(w.text)) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const split = []; for (const sg of segs) { if (sg.length <= 5) { split.push(sg); continue; } const parts = Math.ceil(sg.length / 5), per = Math.ceil(sg.length / parts); for (let i = 0; i < sg.length; i += per) split.push(sg.slice(i, i + per)); }
    const nw = a => a.filter(w => w.text !== '—').length;
    const ph = []; for (const sg of split) { const last = ph[ph.length - 1]; if (last && (nw(last) < 3 || nw(sg) < 3) && nw(last) + nw(sg) <= 5) last.push(...sg); else if (last && nw(sg) < 2) { const all = [...last, ...sg], h = Math.ceil(all.length / 2); ph[ph.length - 1] = all.slice(0, h); ph.push(all.slice(h)); } else ph.push([...sg]); }
    const n = words.length, t0 = a + lead, t1 = b - tail; let k = 0, j = 0, prev = t0;
    // opt.times — времена слов по голосу (tools/words.py, без тире); иначе — равномерно внутри сцены
    for (const p of ph) { for (const w of p) { if (opt.times) { w.t = w.text === '—' ? prev : +(opt.times[j++] ?? prev).toFixed(3); prev = w.t; } else w.t = +(t0 + (t1 - t0) * k / n).toFixed(3); k++; }
      const { times, ...rest } = opt; out.push({ a: p[0].t, b, words: p, ...rest }); }
  }
  out.forEach((p, i) => { const nx = out[i + 1]; if (nx && nx.a < p.b) p.b = nx.a; });
  return out;
}
function KineticCaption(t, phrases, y = 1275) {
  const p = phrases.find(q => t >= q.a && t < q.b); if (!p) return; const size = p.size || 72, maxW = 780; if (p.y) y = p.y;
  ctx.save(); ctx.font = `900 ${size}px Mont`; ctx.textBaseline = 'middle'; const sp = ctx.measureText(' ').width * 1.7;
  const lines = [[]]; let lw = 0; for (const w of p.words) { const ww = ctx.measureText(w.text).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, ww]); lw += ww + sp; }
  lines.forEach((ln, i) => { const tw = ln.reduce((s, [, ww]) => s + ww, 0) + sp * (ln.length - 1); let x = CXC - tw / 2; const yy = y + (i - (lines.length - 1) / 2) * size * 1.12;
    for (const [w, ww] of ln) { const on = t >= w.t, k = E.out(win(t, w.t, w.t + .12)), sc = w.accent && on ? lerp(1, 1.06, k) : 1;
      ctx.save(); ctx.translate(x + ww / 2, yy); ctx.scale(sc, sc); ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(5,7,16,.92)'; ctx.lineJoin = 'round'; ctx.strokeText(w.text, -ww / 2, 0);
      ctx.fillStyle = !on ? T.dim : w.accent ? T.danger : (p.color || T.text); ctx.fillText(w.text, -ww / 2, 0); ctx.restore(); x += ww + sp; } });
  ctx.restore(); }

// ───── телефон в руке и экран тарифа «Последний» ─────
const PHN = { x: 270, y: 330, w: 520, h: 860 };
function HandPhone(t, drawScreen, { k = 1, cracked = false, dy = 0 } = {}) { ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - E.out(k)) * 260 + dy);
  ctx.fillStyle = '#1d2133'; ctx.beginPath(); ctx.moveTo(PHN.x + 70, H); ctx.lineTo(PHN.x + 110, PHN.y + PHN.h + 80); ctx.lineTo(PHN.x + PHN.w - 60, PHN.y + PHN.h + 80); ctx.lineTo(PHN.x + PHN.w + 10, H); ctx.fill(); // рукав пуховика
  ctx.beginPath(); ctx.ellipse(PHN.x + PHN.w / 2, PHN.y + PHN.h - 30, 240, 170, 0, 0, Math.PI * 2); fillOL('#e9b08a', 6); rr(PHN.x - 40, PHN.y + PHN.h - 320, 66, 250, 32); fillOL('#e9b08a', 6);
  ctx.shadowColor = 'rgba(207,232,255,.35)'; ctx.shadowBlur = 70; ctx.fillStyle = '#05060c'; rr(PHN.x - 16, PHN.y - 16, PHN.w + 32, PHN.h + 32, 64); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#0c1124'; rr(PHN.x, PHN.y, PHN.w, PHN.h, 50); ctx.fill(); ctx.save(); rr(PHN.x, PHN.y, PHN.w, PHN.h, 50); ctx.clip(); drawScreen(t);
  if (cracked) { ctx.strokeStyle = 'rgba(220,235,255,.55)'; ctx.lineWidth = 3; ctx.beginPath(); const cx = PHN.x + 380, cy = PHN.y + 150; for (const [dx, dy2] of [[-200, 90], [-90, 260], [120, 40], [60, -120], [-160, -60]]) { ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * .5, cy + dy2 * .5 + 10); ctx.lineTo(cx + dx, cy + dy2); } ctx.stroke(); }
  ctx.restore(); for (let i = 0; i < 4; i++) { rr(PHN.x + PHN.w - 16, PHN.y + 300 + i * 116, 70, 90, 32); fillOL('#e9b08a', 6); } ctx.restore(); }
// variant: order | accepted | history | drivers | buttons | system ; lines: [[текст, акцент?], ...] (максимум 2, кегль ≥ 44)
function PhoneScreen(t, variant, lines = [], t0 = 0) { const X = PHN.x + 44, w = PHN.w - 88, k = E.out(win(t, t0, t0 + .3));
  ctx.fillStyle = '#0c1124'; ctx.fillRect(PHN.x, PHN.y, PHN.w, PHN.h);
  txt('03:17', PHN.x + 46, PHN.y + 46, 26, 'rgba(244,241,234,.8)', { font: 'JBM', weight: 700 }); ctx.fillStyle = T.danger; rr(PHN.x + PHN.w - 92, PHN.y + 36, 14, 20, 3); ctx.fill(); // батарея почти пустая
  ctx.strokeStyle = 'rgba(244,241,234,.6)'; ctx.lineWidth = 3; rr(PHN.x + PHN.w - 96, PHN.y + 32, 46, 28, 5); ctx.stroke();
  txt('ПОСЛЕДНИЙ', X, PHN.y + 120, 30, 'rgba(207,232,255,.75)', { weight: 900 }); ctx.fillStyle = 'rgba(207,232,255,.25)'; ctx.fillRect(X, PHN.y + 148, w, 3);
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 40);
  if (variant === 'accepted' || variant === 'system') { const col = variant === 'accepted' ? T.ok : T.frost; circle(PHN.x + PHN.w / 2, PHN.y + 380, 90); ctx.fillStyle = col; ctx.globalAlpha *= .18; ctx.fill(); ctx.globalAlpha /= .18;
    ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.beginPath(); if (variant === 'accepted') { ctx.moveTo(PHN.x + PHN.w / 2 - 40, PHN.y + 382); ctx.lineTo(PHN.x + PHN.w / 2 - 6, PHN.y + 416); ctx.lineTo(PHN.x + PHN.w / 2 + 46, PHN.y + 346); } else { ctx.arc(PHN.x + PHN.w / 2, PHN.y + 380, 50, 0, Math.PI * 1.5); } ctx.stroke(); }
  if (variant === 'drivers') { txt('ВОДИТЕЛИ', X, PHN.y + 210, 44, T.text, { weight: 900 }); let y = PHN.y + 330;
    lines.slice(0, 2).forEach(([name, val, kind, at = 0]) => { const kk = E.out(win(t, at, at + .35)); if (kk <= 0) return; ctx.save(); ctx.globalAlpha *= kk; ctx.translate(0, (1 - kk) * 30);
      ctx.fillStyle = kind === 'dead' ? 'rgba(207,232,255,.08)' : 'rgba(229,56,59,.10)'; rr(X - 14, y - 70, w + 28, 250, 22); ctx.fill();
      circle(X + 50, y, 46); fillOL(kind === 'dead' ? '#9fb6d6' : '#e9b08a', 4); if (kind === 'dead') FrostOverlay(1, { x: X + 4, y: y - 46, w: 92, h: 92 }, { x: X + 50, y }, 21);
      txt(name.toUpperCase(), X + 120, y, 44, kind === 'dead' ? T.frost : T.text, { weight: 900 });
      const [v1, v2] = val.split(' · '); txt(v1, X, y + 100, kind === 'dead' ? 46 : 56, kind === 'dead' ? T.frost : T.danger, { font: 'JBM', weight: 800 });
      if (v2) txt(v2, X, y + 160, 44, T.frost, { weight: 900 }); ctx.restore(); y += 290; });
    ctx.restore(); return; }
  let y = variant === 'accepted' || variant === 'system' ? PHN.y + 560 : PHN.y + 300;
  for (const [s, acc] of lines.slice(0, 2)) { let size = acc ? 64 : 44; ctx.font = `900 ${size}px Mont`; const longest = Math.max(...s.toUpperCase().split(' ').map(x => ctx.measureText(x).width)); if (longest > w) { size = Math.max(40, Math.floor(size * w / longest)); ctx.font = `900 ${size}px Mont`; } const words = s.toUpperCase().split(' '); let line = '', rows = [];
    for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (ctx.measureText(tt).width > w && line) { rows.push(line); line = wd; } else line = tt; } rows.push(line);
    for (const r of rows) { txt(r, X, y, size, acc ? (variant === 'accepted' ? T.ok : T.danger) : T.text, { weight: 900 }); y += size * 1.2; } y += 40; }
  ctx.restore(); }

// ───── зеркало заднего вида ─────
const MIR = { x: 140, y: 560, w: 800, h: 320 };
function windshield(t, a = 1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1124'); g.addColorStop(1, '#05070f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  bokeh(t, 7, 18, 300, 1300, .7 * a); snow(t, .35 * a, 30, .6); ctx.fillStyle = '#04050b'; ctx.fillRect(0, 0, W, 180); ctx.beginPath(); ctx.moveTo(0, 1400); ctx.quadraticCurveTo(540, 1300, W, 1400); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill(); }
function MirrorShot(t, drawReflection, { glare = 0, frost = 0, dash = null } = {}) { windshield(t);
  ctx.fillStyle = '#0b0d16'; ctx.fillRect(MIR.x + MIR.w / 2 - 18, 0, 36, MIR.y + 10);
  rr(MIR.x - 16, MIR.y - 16, MIR.w + 32, MIR.h + 32, 70); fillOL('#0f1220', 8); ctx.save(); rr(MIR.x, MIR.y, MIR.w, MIR.h, 56); ctx.clip(); ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H);
  drawReflection(t); if (frost > 0) FrostOverlay(frost, MIR, 'edges', 5);
  if (glare > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(220,235,255,${.22 * glare})`; ctx.translate(MIR.x + MIR.w * (.2 + .6 * ((t * .3) % 1)), 0); ctx.rotate(.35); ctx.fillRect(-50, -200, 100, 1400); ctx.restore(); }
  ctx.restore(); ctx.strokeStyle = 'rgba(207,232,255,.35)'; ctx.lineWidth = 4; rr(MIR.x, MIR.y, MIR.w, MIR.h, 56); ctx.stroke();
  if (dash) dash(t); }
// заднее сиденье в отражении (зеркально, так что дверь слева)
function rearSeat(t) { ctx.fillStyle = '#141a30'; ctx.fillRect(MIR.x, MIR.y, MIR.w, 150); ctx.save(); ctx.beginPath(); ctx.rect(MIR.x + 60, MIR.y + 10, MIR.w - 120, 130); ctx.clip(); bokeh(t * 2, 9, 10, MIR.y, MIR.y + 140, 1); snow(t, .5, -40, .8); ctx.restore();
  rr(MIR.x - 20, MIR.y + 150, MIR.w + 40, 260, 40); fillOL('#272d45', 5); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(MIR.x + MIR.w / 2, MIR.y + 160); ctx.lineTo(MIR.x + MIR.w / 2, MIR.y + 320); ctx.stroke(); }

// ───── иней: растёт от краёв или от точки ─────
const FROST_CACHE = {};
function frostTree(seed, region, origin) { const key = seed + JSON.stringify(region) + JSON.stringify(origin); if (FROST_CACHE[key]) return FROST_CACHE[key]; const r = seeded(seed), br = [];
  const roots = []; const { x, y, w, h } = region;
  if (origin === 'edges') for (let i = 0; i < 26; i++) { const side = Math.floor(r() * 4), u = r(); roots.push(side === 0 ? [x + u * w, y, Math.PI / 2] : side === 1 ? [x + w, y + u * h, Math.PI] : side === 2 ? [x + u * w, y + h, -Math.PI / 2] : [x, y + u * h, 0]); }
  else for (let i = 0; i < 14; i++) roots.push([origin.x, origin.y, r() * Math.PI * 2]);
  const grow = (x0, y0, a, len, d, t0) => { const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; br.push([x0, y0, x1, y1, t0, t0 + len / 600]); if (d > 0) for (let i = 0; i < 2; i++) grow(x1, y1, a + (r() - .5) * 1.6, len * (.55 + r() * .25), d - 1, t0 + len / 600); };
  for (const [x0, y0, a] of roots) grow(x0, y0, a + (r() - .5) * .8, 60 + r() * 90, 3, r() * .2);
  return FROST_CACHE[key] = br; }
function FrostOverlay(progress, region, origin = 'edges', seed = 3) { if (progress <= 0) return; const p = progress * 1.15; ctx.save();
  const { x, y, w, h } = region; const g = origin === 'edges' ? null : ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, 600 * progress);
  if (origin === 'edges') { for (const [gx, gy, gw, gh, d] of [[x, y, w, 120 * progress, 0], [x, y + h - 120 * progress, w, 120 * progress, 1], [x, y, 120 * progress, h, 2], [x + w - 120 * progress, y, 120 * progress, h, 3]]) {
      const gr = d < 2 ? ctx.createLinearGradient(0, d ? y + h : y, 0, d ? y + h - 120 * progress : y + 120 * progress) : ctx.createLinearGradient(d === 2 ? x : x + w, 0, d === 2 ? x + 120 * progress : x + w - 120 * progress, 0);
      gr.addColorStop(0, `rgba(207,232,255,${.55 * progress})`); gr.addColorStop(1, 'rgba(207,232,255,0)'); ctx.fillStyle = gr; ctx.fillRect(gx, gy, gw, gh); } }
  else { g.addColorStop(0, `rgba(207,232,255,${.5 * progress})`); g.addColorStop(1, 'rgba(207,232,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  ctx.strokeStyle = 'rgba(225,240,255,.8)'; ctx.lineCap = 'round';
  for (const [x0, y0, x1, y1, a, b] of frostTree(seed, region, origin)) { const k = clamp((p - a) / (b - a)); if (k <= 0) continue; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); ctx.stroke(); }
  ctx.restore(); }

// ───── карточки и титры ─────
function PartSticker(n, t, final = false) { ctx.save(); ctx.translate(140, 360); ctx.rotate(-.06); const s = final ? 'ЧАСТЬ 5 · ФИНАЛ' : `ЧАСТЬ ${n}`; ctx.font = '900 44px Mont'; const w = ctx.measureText(s).width + 48;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; ctx.fillStyle = '#FFD23F'; rr(-24, -38, w, 76, 8); ctx.fill(); ctx.shadowBlur = 0; txt(s, 0, 2, 44, '#111', { weight: 900 }); ctx.restore(); }
function RuleCard(t, t0, n, text, y = 700) { const k = E.back(win(t, t0, t0 + .4)); if (k <= 0) return; ctx.save(); ctx.translate(0, (1 - k) * -220); ctx.globalAlpha = clamp(k * 2);
  ctx.fillStyle = 'rgba(14,22,48,.95)'; rr(110, y, 820, 170, 30); ctx.fill(); ctx.strokeStyle = T.frost; ctx.lineWidth = 3; ctx.stroke();
  txt(`ПРАВИЛО ${n}`, 150, y + 50, 26, 'rgba(207,232,255,.75)', { font: 'JBM', weight: 800 }); txt(text.toUpperCase(), 150, y + 112, 48, T.text, { weight: 900 }); ctx.restore(); }
function EndCard(t, t0, text, next) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const k = E.out(win(t, t0, t0 + .5)); ctx.save(); ctx.font = '900 84px Mont';
  const words = text.toUpperCase().split(' '), rows = []; let line = ''; for (const w of words) { const tt = line ? line + ' ' + w : w; if (ctx.measureText(tt).width > 820 && line) { rows.push(line); line = w; } else line = tt; } rows.push(line); ctx.restore();
  rows.forEach((r, i) => { ctx.save(); ctx.shadowColor = T.danger; ctx.shadowBlur = 30; txt(r, CXC, 880 + (i - (rows.length - 1) / 2) * 96, 84, T.danger, { weight: 900, align: 'center', alpha: k }); ctx.restore(); });
  if (next) txt(next, CXC, 1080 + rows.length * 30, 44, T.text, { weight: 900, align: 'center', alpha: win(t, t0 + .5, t0 + .9) }); }
function Glitch(t, k = 1) { if (k <= 0) return; const r = seeded(Math.floor(t * 30) + 7); const img = ctx.getImageData(0, 0, W, H); ctx.save();
  for (let i = 0; i < 9; i++) { const y = r() * H, h = 20 + r() * 90, dx = (r() - .5) * 120 * k; ctx.putImageData(img, dx, 0, 0, y, W, h); }
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(229,56,59,${.12 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function TopDownMap(t, path, prog, routeColor = T.ok) { ctx.fillStyle = '#0b1226'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#1B2547'; ctx.lineWidth = 46; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(0, 300 + i * 160); ctx.lineTo(W, 300 + i * 160); ctx.moveTo(100 + i * 120, 0); ctx.lineTo(100 + i * 120, H); ctx.stroke(); }
  ctx.strokeStyle = routeColor; ctx.lineWidth = 12; ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  const n = path.length - 1, f = prog * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, [ax, ay] = path[i], [bx, by] = path[i + 1]; circle(lerp(ax, bx, u), lerp(ay, by, u), 22); fillOL(T.window, 5); }
function DashcamFrame(t, stamp, draw, freezeAt = null) { const tt = freezeAt !== null && t > freezeAt ? freezeAt : t; ctx.save(); ctx.beginPath(); ctx.ellipse(540, 900, 640, 900, 0, 0, Math.PI * 2); ctx.clip(); draw(tt); ctx.restore();
  ctx.fillStyle = 'rgba(40,120,60,.18)'; ctx.fillRect(0, 0, W, H); txt(stamp, 90, 1450, 34, '#e8ffe8', { font: 'JBM', weight: 700 }); }

// ───── персонажи и предметы ─────
// старушка-пассажирка: силуэт (лица мёртвых не показываем), меховая шапка, термос, снег на плечах, морозная подсветка
function oldLady(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(-130, -260, -80, -330); ctx.quadraticCurveTo(0, -370, 80, -330); ctx.quadraticCurveTo(130, -260, 120, 0); ctx.closePath(); fillOL('#0c1020', 5); // пальто
  circle(0, -400, 74); fillOL('#0e1222', 5); // голова в тени
  ctx.beginPath(); for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI, rr2 = 92 + (i % 2 ? 10 : 0); ctx.lineTo(Math.cos(a) * rr2, -420 + Math.sin(a) * rr2 * .85); } ctx.lineTo(92, -410); ctx.lineTo(-92, -410); ctx.closePath(); fillOL('#3b2f2a', 5); // меховая шапка
  ctx.fillStyle = '#eef6ff'; for (const [dx, dy, rx] of [[-80, -330, 46], [80, -330, 46], [0, -500, 60]]) { ctx.beginPath(); ctx.ellipse(dx, dy, rx, 14, 0, 0, Math.PI * 2); ctx.fill(); } // снег на плечах и шапке
  rr(-34, -230, 68, 150, 18); fillOL('#8d9bb5', 4); rr(-38, -244, 76, 26, 8); fillOL('#5e6b85', 4); // термос
  ctx.strokeStyle = 'rgba(207,232,255,.65)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -400, 76, -1.2, .6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(118, -10); ctx.quadraticCurveTo(128, -250, 82, -326); ctx.stroke(); // морозный контур
  ctx.restore(); }
// глаза Беки в зеркале: шапка, точки-глаза, шрам над бровью
function bekaEyes(t, look = 0, wide = 1) { const X = MIR.x, Y = MIR.y; ctx.fillStyle = '#e9b08a'; ctx.fillRect(X, Y, MIR.w, MIR.h); ctx.fillStyle = '#111318'; rr(X - 20, Y - 40, MIR.w + 40, 120, 30); ctx.fill(); // шапка
  ctx.fillStyle = 'rgba(30,50,120,.32)'; ctx.fillRect(X, Y, MIR.w, MIR.h);
  for (const s of [-1, 1]) { const ex = X + MIR.w / 2 + s * 150, ey = Y + 190; ctx.fillStyle = T.ol; circle(ex + look * 30, ey, 22 * wide); ctx.fill(); ctx.fillStyle = '#fff'; circle(ex + look * 30 + 7, ey - 7, 6); ctx.fill();
    ctx.strokeStyle = T.ol; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 60, ey - 70 - (s > 0 ? 6 : 0)); ctx.lineTo(ex + 60, ey - 70 - (s < 0 ? 6 : 0)); ctx.stroke(); }
  const sx = X + MIR.w / 2 + 150; ctx.strokeStyle = '#f6d2bd'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(sx - 10, Y + 92); ctx.lineTo(sx + 40, Y + 132); ctx.stroke(); ctx.strokeStyle = '#c98466'; ctx.lineWidth = 3; // шрам
  ctx.beginPath(); for (const u of [.25, .5, .75]) { const px = lerp(sx - 10, sx + 40, u), py = lerp(Y + 92, Y + 132, u); ctx.moveTo(px - 9, py + 8); ctx.lineTo(px + 9, py - 8); } ctx.stroke(); }
// седан с шашечкой (вымышленный, без марки), сбоку
function sedan(x, y, s, { lights = 1, frost = 0, tail = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lights) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(240, 0, 900, 0); g.addColorStop(0, `rgba(255,236,170,${.4 * lights})`); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(240, -80); ctx.lineTo(900, -200); ctx.lineTo(900, 60); ctx.lineTo(240, -40); ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-250, -40); ctx.lineTo(-245, -105); ctx.lineTo(-150, -120); ctx.lineTo(-80, -190); ctx.lineTo(110, -190); ctx.lineTo(180, -120); ctx.lineTo(250, -110); ctx.lineTo(255, -40); ctx.closePath(); fillOL('#c7ccd8', 6);
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(10, -192, 120, 10, 0, 0, Math.PI * 2); ctx.fill(); // снег на крыше
  for (const [a, b, c] of [[-128, -132, 12], [24, -132, 140]]) { ctx.beginPath(); ctx.moveTo(a, -122); ctx.lineTo(a + (a < 0 ? 52 : 0), -180); ctx.lineTo(b + 120, -180); ctx.lineTo(c + 30, -122); ctx.closePath(); fillOL('#16203d', 5); }
  if (frost > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(-128, -122); ctx.lineTo(-76, -180); ctx.lineTo(-12, -180); ctx.lineTo(-12, -122); ctx.closePath(); ctx.clip(); FrostOverlay(frost, { x: -130, y: -182, w: 120, h: 62 }, { x: -70, y: -150 }, 11); ctx.restore(); }
  ctx.save(); ctx.translate(-36, -224); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#111' : T.window; ctx.fillRect(i * 12, 0, 12, 14); ctx.fillStyle = i % 2 ? T.window : '#111'; ctx.fillRect(i * 12, 14, 12, 14); } ctx.strokeStyle = T.ol; ctx.lineWidth = 4; ctx.strokeRect(0, 0, 72, 28); ctx.restore(); // шашечка
  for (const wx of [-150, 160]) { circle(wx, -36, 44); fillOL('#18181f', 6); circle(wx, -36, 18); fillOL('#8a8fa3', 3); }
  ctx.fillStyle = '#fff4c8'; rr(232, -100, 24, 20, 6); ctx.fill(); ctx.fillStyle = T.danger; rr(-256, -104, 16, 22, 5); ctx.fill(); if (tail) glow(-260, -94, 90, 'rgba(229,56,59,.5)');
  ctx.restore(); }
// панельная пятиэтажка
function panelBlock(x, y, w, floors, cols, { lit = [], seed = 3, callout = null, t = 0, offAt = null, fortochka = null } = {}) { const fh = 150, h = floors * fh + 40; rr(x, y - h, w, h, 4); fillOL('#1B2547', 6);
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 3; for (let f = 1; f < floors; f++) { ctx.beginPath(); ctx.moveTo(x, y - f * fh - 20); ctx.lineTo(x + w, y - f * fh - 20); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x - 8, y - h - 14, w + 16, 16); // снег на крыше
  const cw = w / cols; for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) { const wx = x + c * cw + cw * .2, wy = y - (f + 1) * fh + 20, ww = cw * .6, wh = 92, key = `${f}-${c}`; let on = lit.includes(key);
    if (on && offAt !== null && callout && callout.key === key && t > offAt) on = false;
    rr(wx, wy, ww, wh, 4); fillOL(on ? T.window : '#0f1530', 4); if (on) glow(wx + ww / 2, wy + wh / 2, 120, 'rgba(242,179,61,.35)');
    if (fortochka && fortochka === key) { ctx.save(); ctx.translate(wx + 6, wy + 6); ctx.transform(1, 0, -.35, 1, 0, 0); rr(0, 0, ww * .3, wh * .42, 2); fillOL('#2a3358', 3); ctx.restore(); }
    if (callout && callout.key === key) { const px = wx + ww / 2, py = wy; ctx.strokeStyle = T.frost; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 150); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(14,22,48,.92)'; rr(px - 130, py - 230, 260, 80, 12); ctx.fill(); ctx.strokeStyle = T.frost; ctx.stroke(); txt(callout.text, px, py - 190, 38, T.text, { font: 'JBM', weight: 800, align: 'center' }); } } }
// терриконы на горизонте (Караганда)
function terricons(y, col = '#151d3a') { ctx.fillStyle = col; for (const [x, w, h] of [[-80, 520, 300], [330, 640, 380], [820, 480, 260]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * .46, y - h); ctx.lineTo(x + w * .54, y - h * .97); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(207,232,255,.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w * .46, y - h); ctx.lineTo(x + w * .3, y); ctx.stroke(); } }
function nightSky() { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060a1c'); g.addColorStop(.55, T.night); g.addColorStop(1, '#1a2244'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// Марат в отражении: оранжевый жилет таксиста, иней на ресницах и плечах, полупрозрачные кисти
function maratMirror(t, { headUp = 0, palm = 0, eyesWhite = 0 } = {}) { const cx = MIR.x + MIR.w / 2, base = MIR.y + MIR.h + 20, hy = base - 300 + headUp * -30;
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx - 190, base + 40); ctx.quadraticCurveTo(cx - 200, base - 170, cx - 120, base - 210); ctx.lineTo(cx + 120, base - 210); ctx.quadraticCurveTo(cx + 200, base - 170, cx + 190, base + 40); ctx.closePath(); fillOL('#20263a', 5);
  ctx.beginPath(); ctx.moveTo(cx - 150, base + 40); ctx.lineTo(cx - 120, base - 200); ctx.lineTo(cx - 40, base - 200); ctx.lineTo(cx - 30, base + 40); ctx.closePath(); fillOL('#E8641C', 4);
  ctx.beginPath(); ctx.moveTo(cx + 150, base + 40); ctx.lineTo(cx + 120, base - 200); ctx.lineTo(cx + 40, base - 200); ctx.lineTo(cx + 30, base + 40); ctx.closePath(); fillOL('#E8641C', 4);
  ctx.fillStyle = 'rgba(230,240,255,.85)'; ctx.fillRect(cx - 142, base - 90, 104, 12); ctx.fillRect(cx + 38, base - 90, 104, 12); // светоотражающие полосы
  ctx.fillStyle = '#eef6ff'; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s2 * 130, base - 205, 60, 13, 0, 0, Math.PI * 2); ctx.fill(); } // иней на плечах
  ctx.save(); ctx.translate(cx, hy); ctx.rotate(.0); circle(0, 0, 92); fillOL('#cfd9e6', 5); ctx.fillStyle = '#1a1c26'; ctx.beginPath(); ctx.arc(0, 0, 92, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(10, -60, -88, -18); ctx.fill();
  const ey = 12 - (1 - headUp) * -10; for (const s2 of [-1, 1]) { ctx.save(); ctx.translate(s2 * 34, ey);
    if (headUp < .5) { ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -4, 14, .2, Math.PI - .2); ctx.stroke(); } // глаза опущены
    else { ctx.fillStyle = eyesWhite > 0 ? `rgba(240,248,255,${.6 + .4 * eyesWhite})` : T.ol; circle(0, 0, 11); ctx.fill(); }
    ctx.strokeStyle = '#f4faff'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 6, 8); ctx.lineTo(i * 7, 18); ctx.stroke(); } ctx.restore(); } // иней на ресницах
  if (headUp > .5) { ctx.strokeStyle = T.ol; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 48, 22, Math.PI * 1.15, Math.PI * 1.85, false); ctx.stroke(); } // грустная улыбка (с.5)
  ctx.restore(); FrostOverlay(.4, { x: cx - 100, y: hy - 100, w: 200, h: 200 }, { x: cx, y: hy - 60 }, 33);
  if (palm > 0) { ctx.save(); ctx.globalAlpha = .45 * palm; ctx.translate(cx + 120, base - 170 - palm * 120); ctx.beginPath(); ctx.ellipse(0, 0, 52, 62, 0, 0, Math.PI * 2); fillOL('#cfe8ff', 3);
    for (let i = 0; i < 4; i++) { rr(-46 + i * 26, -140, 20, 86, 10); fillOL('#cfe8ff', 3); } rr(44, -30, 22, 70, 10); fillOL('#cfe8ff', 3); ctx.restore(); }
  ctx.restore(); }
// отпечаток ладони из инея на стекле, тает: k 1 → 0, капли стекают
function frostPalm(x, y, k, t) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(225,240,255,.75)';
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 84, 0, 0, Math.PI * 2); ctx.fill(); for (let i = 0; i < 4; i++) { rr(-62 + i * 36, -190, 28, 118, 14); ctx.fill(); } rr(60, -40, 30, 96, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; FrostOverlay(1, { x: -80, y: -200, w: 180, h: 300 }, { x: 0, y: -40 }, 41); ctx.restore();
  ctx.save(); ctx.strokeStyle = `rgba(210,230,255,${.6})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; const melt = 1 - k;
  for (const [dx, sp] of [[-40, 1], [10, 1.4], [50, .8]]) { ctx.beginPath(); ctx.moveTo(x + dx, y + 60); ctx.lineTo(x + dx + 4, y + 60 + melt * 160 * sp); ctx.stroke(); } ctx.restore(); }
// мама со спины: платок, халат
function momBack(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-150, 0); ctx.quadraticCurveTo(-160, -300, -100, -380); ctx.quadraticCurveTo(0, -410, 100, -380); ctx.quadraticCurveTo(160, -300, 150, 0); ctx.closePath(); fillOL('#7a3b52', 5); // халат
  ctx.strokeStyle = 'rgba(255,220,200,.35)'; ctx.lineWidth = 6; for (const yy of [-300, -230, -160, -90]) { ctx.beginPath(); ctx.moveTo(-130, yy); ctx.quadraticCurveTo(0, yy + 14, 130, yy); ctx.stroke(); } // узор
  circle(0, -450, 82); fillOL('#d8a07c', 5); ctx.beginPath(); ctx.arc(0, -455, 92, Math.PI * .9, Math.PI * 2.1); ctx.lineTo(70, -370); ctx.lineTo(-70, -370); ctx.closePath(); fillOL('#3c5a8a', 5); // платок
  ctx.beginPath(); ctx.moveTo(-20, -380); ctx.lineTo(0, -330); ctx.lineTo(20, -380); fillOL('#3c5a8a', 4); ctx.restore(); }
function tvSet(x, y, w, h, draw) { rr(x - 20, y - 20, w + 40, h + 60, 20); fillOL('#2a2d36', 6); ctx.save(); rr(x, y, w, h, 10); ctx.clip(); draw(); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; rr(x, y, w, h, 10); ctx.stroke();
  rr(x + w / 2 - 60, y + h + 40, 120, 30, 6); fillOL('#2a2d36', 5); }

// мигающая метка в углу (например «ПРАВИЛО 2»)
function CornerTag(t, text, col = T.frost) { if (Math.floor(t * 3) % 2) return; ctx.save(); ctx.font = '800 30px JBM'; const w = ctx.measureText(text).width + 40; const x = 1010 - w, y = 330;
  ctx.fillStyle = 'rgba(14,22,48,.9)'; rr(x, y, w, 54, 10); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); txt(text, x + 20, y + 28, 30, col, { font: 'JBM', weight: 800 }); ctx.restore(); }
