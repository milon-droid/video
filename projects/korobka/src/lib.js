// Общие константы, краски, треки. Мир: комната 1080×1920 «единиц уровня»; коробка на столе = та же комната ×1/S.
const W = 1080, H = 1920, S = 4.5, BW = W / S, BH = H / S, BX = 360, BY = 1330 - BH;
const PX = BX / (1 - 1 / S), PY = BY / (1 - 1 / S);     // неподвижная точка бесконечного зума
const DT = 3;                                            // каждый уровень вглубь живёт на +3 с
const CW = 720, CH = 1280;                               // холст (рендер 720p)

// Цвет = плотность трёх красок ризографа: R — флуо-розовая, G — синяя, B — жёлтая.
const ink = (p = 0, b = 0, y = 0, a = 1) => `rgba(${Math.round(p * 255)},${Math.round(b * 255)},${Math.round(y * 255)},${a})`;
const PAPER = 'rgb(0,0,0)';
const OUT = ink(.55, 1, .3);          // контур: тёмно-фиолетовый
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const E = {
  lin: u => u,
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  in: u => u * u * u,
  back: u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
  el: u => u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * 2.094) + 1,
  step: u => u < 1 ? 0 : 1,
};
// Трек: [[t, v, ease], ...]; ease — для отрезка, который кончается на этом ключе. v — число или [x,y].
function trk(keys) {
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (t <= k[0]) {
        const p = keys[i - 1], u = (E[k[2] || 'io'])((t - p[0]) / (k[0] - p[0]));
        if (Array.isArray(k[1])) return [lerp(p[1][0], k[1][0], u), lerp(p[1][1], k[1][1], u)];
        return lerp(p[1], k[1], u);
      }
    }
    return keys[keys.length - 1][1];
  };
}
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// Моргание — функция только времени героя τ, поэтому одинаково на всех уровнях.
function blink(t) {
  let m = 1;
  for (let i = Math.floor(t / 3.1) - 1; i <= Math.floor(t / 3.1) + 1; i++) {
    const tb = i * 3.1 + hash(i) * 1.6, d = Math.abs(t - tb);
    if (d < .09) m = Math.min(m, d / .09);
  }
  return m;
}
// Затухающая тряска от событий (в единицах уровня)
function shake(t, events) {
  let x = 0, y = 0;
  for (const [t0, amp, dur = .5, ph = t0] of events) {
    const u = t - t0;
    if (u < 0 || u > dur) continue;
    const e = amp * Math.pow(1 - u / dur, 2);
    x += e * Math.sin(u * 71 + ph); y += e * Math.cos(u * 57 + ph * 3);
  }
  return [x, y];
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function star(ctx, x, y, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rad = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath();
}
function stroke(ctx, w, c = OUT) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function fill(ctx, c) { ctx.fillStyle = c; ctx.fill(); }

// Язык кадра: scene.html — русский, scene_en.html задаёт window.LANG = 'en'
const EN = (typeof window !== 'undefined' && window.LANG === 'en');
const TX = (ru, en) => EN ? en : ru;
