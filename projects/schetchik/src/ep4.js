// «Счётчик» · серия 4 «Объезд» (0:58). Таймкоды и тексты — по ТЗ, раздел 6.
'use strict';
const DUR = 58;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
// баланс: 54:06:00 в 03:56, тикает вниз; с 03:58 до 05:00 — штраф 25 мин за каждую минуту объезда → в 05:00 ровно 27:12:00
const B0 = 54 * 3600 + 6 * 60, T0356 = 3 * 3600 + 56 * 60, P0 = 3 * 3600 + 58 * 60, P1 = 5 * 3600;
const bal = c => storyBalance(ST(1, 0, 0, c > P1 && c < P1 + 5 ? P1 : c)); // единая функция сюжета; на кадре паузы в 05:00 — ровно 27:12:00
const hm = c => `${String(Math.floor(c / 3600)).padStart(2, '0')}:${String(Math.floor(c / 60) % 60).padStart(2, '0')}`;
// часы сцены: [время ролика, время на часах] — между точками линейно (ночью время в кадре ускорено)
const CLOCK = [[0, T0356], [7, T0356 + 60], [11, P0], [16, P0 + 120], [20, 4 * 3600 + 20 * 60], [24, 4 * 3600 + 41 * 60], [29, 4 * 3600 + 59 * 60], [29.5, P1], [34, P1 + 4.5], [34.01, P1 + 25 * 60], [58, P1 + 30 * 60]]; // в 05:00 штраф останавливается: на HUD ровно 27:12
const clock = t => { for (let i = 1; i < CLOCK.length; i++) if (t <= CLOCK[i][0]) { const [a, ca] = CLOCK[i - 1], [b, cb] = CLOCK[i]; return ca + (cb - ca) * (t - a) / (b - a); } return CLOCK[CLOCK.length - 1][1]; };
let LAST = null;
const NIGHT = t => { const c = clock(t), b = bal(c), fl = LAST !== null && LAST - b > 600 ? 1 : 0; LAST = b; return { night: 2, time: hm(c), temp: '−29°', balance: b, flash: t > 11 && t < 29.5 ? Math.max(fl, .5 * (Math.floor(t * 4) % 2)) : (t > 29.5 && t < 31 ? 1 - win(t, 29.5, 31) : 0) }; };
const HOME = t => { const c = clock(t); return { label: 'УТРО', time: hm(c), temp: '−30°', balance: bal(c) }; };

// ───── голос (черновой) ─────
const VO_AT = { e4s01: 0.0, e4nav: 0.0, e4s02: 3.5, e4s04: 11.8, e4s05: 17.0, e4s06: 24.6, e4s07: 29.6, e4s08: 35.5, e4s09: 40.3, e4s12: 54.2 };
const VO_GAIN = { e4nav: .9, e4s09: 3.6 };
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);

// ───── карта сверху ─────
function cityMap(t) { ctx.fillStyle = '#0b1226'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#121b38'; for (let i = 0; i < 8; i++) for (let j = 0; j < 11; j++) rr(130 + i * 120 + 6, 330 + j * 160 + 6, 108, 148, 8), ctx.fill();
  ctx.strokeStyle = '#1B2547'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(130 + i * 120, 0); ctx.lineTo(130 + i * 120, H); ctx.stroke(); } for (let j = 0; j < 12; j++) { ctx.beginPath(); ctx.moveTo(0, 330 + j * 160); ctx.lineTo(W, 330 + j * 160); ctx.stroke(); }
  terriconDots(); }
function terriconDots() { ctx.fillStyle = 'rgba(207,232,255,.06)'; circle(940, 1500, 120); ctx.fill(); circle(200, 520, 90); ctx.fill(); }
function homePin(x, y, k = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(0, -34); ctx.lineTo(34, 0); ctx.lineTo(24, 0); ctx.lineTo(24, 30); ctx.lineTo(-24, 30); ctx.lineTo(-24, 0); ctx.closePath(); fillOL(T.window, 4); glow(0, 0, 90, 'rgba(242,179,61,.4)'); ctx.restore(); }
function poly(path, col, w = 12, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); }
function along(path, k) { const segs = []; let tot = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(d); tot += d; } let s = k * tot;
  for (let i = 0; i < segs.length; i++) { if (s <= segs[i]) { const u = s / segs[i]; return [lerp(path[i][0], path[i + 1][0], u), lerp(path[i][1], path[i + 1][1], u), Math.atan2(path[i + 1][1] - path[i][1], path[i + 1][0] - path[i][0])]; } s -= segs[i]; } const n = path.length - 1; return [path[n][0], path[n][1], 0]; }
function carDot(x, y, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rr(-30, -18, 60, 36, 10); fillOL('#e8ecf3', 4); ctx.fillStyle = T.window; ctx.fillRect(-6, -18, 12, 8); ctx.restore(); glow(x, y, 80, 'rgba(255,236,170,.35)'); }
function navMap(t, phase) { cityMap(t); const plan = [[610, 1610], [610, 970], [970, 970], [970, 650]]; homePin(970, 600);
  if (phase === 'nav') { poly(plan, T.ok, 14); const [x, y, a] = along(plan, .02 + .02 * win(t, 0, 3)); carDot(x, y, a);
    ctx.fillStyle = 'rgba(14,22,48,.94)'; rr(110, 450, 820, 120, 26); ctx.fill(); ctx.strokeStyle = T.ok; ctx.lineWidth = 3; ctx.stroke(); txt('⌂ ДОМ · 6 МИН', 150, 510, 58, T.text, { weight: 900 }); }
  else { const drive = [[610, 1610], [610, 330]], k = E.io(win(t, 7.2, 10.8)), [x, y, a] = along(drive, k), missed = y < 960; poly(missed ? [[x, y], [610, 970], [970, 970], [970, 650]] : plan, missed ? T.danger : T.ok, 14, missed ? [26, 18] : null); carDot(x, y, a);
    if (missed) txt('МАРШРУТ ПЕРЕСТРОЕН', CXC, 1420, 48, T.danger, { weight: 900, align: 'center', alpha: win(t, 9.0, 9.3) * (Math.floor(t * 4) % 2 ? 1 : .5) }); } }
function loopMap(t) { cityMap(t); homePin(970, 440, .9); const loop = [[370, 810], [850, 810], [850, 1130], [370, 1130], [370, 810]], k = ((t - 16) / 1.6) % 1, [x, y, a] = along(loop, k);
  poly(loop, T.danger, 12, [22, 16]); for (let i = 1; i <= 6; i++) { const [gx, gy] = along(loop, (k - i * .03 + 1) % 1); ctx.fillStyle = `rgba(229,56,59,${.4 - i * .06})`; circle(gx, gy, 14); ctx.fill(); } carDot(x, y, a);
  txt(`КРУГ ${Math.floor((t - 16) / 1.6) + 1}`, 370, 760, 40, T.danger, { font: 'JBM', weight: 800 }); }
function rearWindow(t, palms) { ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H); const kn = palms.reduce((m, p) => Math.max(m, t > p ? Math.exp(-(t - p) * 12) : 0), 0), sh = Math.sin(t * 70) * 10 * kn;
  ctx.save(); ctx.translate(sh, 0); const R = { x: 90, y: 420, w: 860, h: 520 }; rr(R.x - 30, R.y - 30, R.w + 60, R.h + 60, 60); fillOL('#1b2033', 8); rr(R.x, R.y, R.w, R.h, 40); fillOL('#0b1226', 6);
  ctx.save(); rr(R.x, R.y, R.w, R.h, 40); ctx.clip(); bokeh(t * 2, 13, 16, R.y, R.y + R.h, .9); snow(t, .5, -30); FrostOverlay(.35 + .3 * win(t, 19.4, 24), R, 'edges', 81);
  palms.forEach((p, i) => { if (t > p) frostPalm(R.x + 200 + i * 230, R.y + 300 - (i % 2) * 40, 1, t); }); ctx.restore();
  rr(R.x + 40, R.y + R.h + 80, R.w - 80, 380, 60); fillOL('#22283d', 6); ctx.restore(); } // заднее сиденье — пустое
function shoulderMirror(t, k) { ctx.fillStyle = '#0a0d18'; ctx.fillRect(MIR.x, MIR.y, MIR.w, MIR.h); rearSeat(t); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(MIR.x, MIR.y, MIR.w, MIR.h);
  ctx.beginPath(); ctx.ellipse(MIR.x + MIR.w - 120, MIR.y + MIR.h + 40, 260, 170, 0, 0, Math.PI * 2); fillOL('#1d2133', 6); // плечо Беки в зеркале
  FrostOverlay(k, { x: MIR.x, y: MIR.y, w: MIR.w, h: MIR.h }, { x: MIR.x + 80, y: MIR.y + 120 }, 91);
  ctx.save(); ctx.strokeStyle = 'rgba(225,240,255,.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const ex = lerp(MIR.x + 100, MIR.x + MIR.w - 200 + i * 20, k), ey = lerp(MIR.y + 120 + i * 30, MIR.y + MIR.h - 40 + i * 6, k);
    ctx.beginPath(); ctx.moveTo(MIR.x + 80, MIR.y + 110 + i * 34); ctx.quadraticCurveTo((MIR.x + ex) / 2, MIR.y + 60 + i * 50, ex, ey); ctx.stroke(); } ctx.restore(); } // иней тянется, как пальцы
function homeKitchen(t) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a3a52'); g.addColorStop(1, '#1d1f2e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rr(620, 300, 340, 440, 8); fillOL('#cfd8e6', 8); ctx.save(); rr(636, 316, 308, 408, 4); ctx.clip(); ctx.fillStyle = '#0b1226'; ctx.fillRect(0, 0, W, H); panelBlock(640, 760, 300, 5, 3, { lit: ['1-1', '3-0'] }); FrostOverlay(.7, { x: 636, y: 316, w: 308, h: 408 }, 'edges', 15); ctx.restore(); // за окном ещё ночь
  rr(380, 120, 120, 40, 10); fillOL('#2b2b33', 4); glow(440, 170, 700, 'rgba(255,214,150,.4)'); // лампа
  rr(40, 980, 520, 500, 10); fillOL('#e6e1d6', 6); ctx.save(); ctx.translate(360, 900); rr(-70, -60, 140, 110, 30); fillOL('#b9c4cf', 5); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 16; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const ph = (t * .9 + i / 4) % 1; ctx.globalAlpha = .65 * (1 - ph); ctx.beginPath(); ctx.moveTo(430, 860 - ph * 280); ctx.bezierCurveTo(390, 820 - ph * 320, 480, 780 - ph * 340, 440, 740 - ph * 380); ctx.stroke(); } ctx.restore(); } // кипит чайник
function hug(t, close = 0) { const s = lerp(1, 1.35, close), cx = 520, cy = lerp(1500, 1620, close); ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  circle(150, -560, 78); fillOL('#d8a07c', 5); ctx.beginPath(); ctx.arc(150, -560, 90, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(150, -610, 60, -566); ctx.closePath(); fillOL('#3c5a8a', 5); ctx.beginPath(); ctx.moveTo(70, -530); ctx.quadraticCurveTo(40, -470, 70, -430); ctx.lineTo(90, -500); ctx.closePath(); fillOL('#3c5a8a', 4); // мама: платок, лицо через плечо
  ctx.strokeStyle = T.ol; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const ex of [125, 175]) { ctx.beginPath(); ctx.arc(ex, -548, 11, .2, Math.PI - .2); ctx.stroke(); } // глаза закрыты, спокойна
  ctx.beginPath(); ctx.moveTo(-240, 0); ctx.quadraticCurveTo(-250, -380, -150, -450); ctx.quadraticCurveTo(0, -500, 150, -450); ctx.quadraticCurveTo(250, -380, 240, 0); ctx.closePath(); fillOL('#1d2133', 6); // пуховик Беки со спины
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 5; for (const yy of [-380, -280, -180, -80]) { ctx.beginPath(); ctx.moveTo(-230, yy); ctx.quadraticCurveTo(0, yy + 20, 230, yy); ctx.stroke(); }
  circle(-10, -560, 110); fillOL('#e9b08a', 6); ctx.beginPath(); ctx.arc(-10, -570, 118, Math.PI * .95, Math.PI * 2.05); ctx.lineTo(108, -500); ctx.lineTo(-128, -500); ctx.closePath(); fillOL('#111318', 6); // шапка, затылок
  for (const [hx, hy] of [[-190, -300], [180, -330]]) { ctx.beginPath(); ctx.ellipse(hx, hy, 46, 36, .4, 0, Math.PI * 2); fillOL('#d8a07c', 4); } ctx.restore(); } // руки мамы на спине
function momClose(t) { homeKitchen(t); const cx = 470, cy = 760; // мама крупно через плечо Беки: лицо видно, спокойна
  circle(cx, cy, 200); fillOL('#d8a07c', 7); ctx.beginPath(); ctx.arc(cx, cy - 6, 218, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(cx + 120, cy - 150, cx, cy - 150); ctx.quadraticCurveTo(cx - 140, cy - 150, cx - 218, cy - 6); ctx.closePath(); fillOL('#3c5a8a', 7); // платок
  ctx.beginPath(); ctx.moveTo(cx - 218, cy - 6); ctx.quadraticCurveTo(cx - 250, cy + 160, cx - 150, cy + 250); ctx.lineTo(cx - 120, cy + 120); ctx.closePath(); fillOL('#3c5a8a', 6); ctx.beginPath(); ctx.moveTo(cx + 218, cy - 6); ctx.quadraticCurveTo(cx + 250, cy + 160, cx + 150, cy + 250); ctx.lineTo(cx + 120, cy + 120); ctx.closePath(); fillOL('#3c5a8a', 6);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx, cy - 6, 190 - i * 2, Math.PI * (1.1 + i * .17), Math.PI * (1.18 + i * .17)); ctx.stroke(); } // узор платка
  const blink = (t % 3.3) < .12; for (const s2 of [-1, 1]) { ctx.save(); ctx.translate(cx + s2 * 70, cy + 20); if (blink) { ctx.strokeStyle = T.ol; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke(); } else { ctx.fillStyle = T.ol; circle(0, 0, 15); ctx.fill(); ctx.fillStyle = '#fff'; circle(5, -5, 4); ctx.fill(); }
    ctx.strokeStyle = 'rgba(120,70,60,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 18, 16, .3, Math.PI - .3); ctx.stroke(); ctx.restore(); } // морщинки
  ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 34, cy + 110); ctx.quadraticCurveTo(cx, cy + 120, cx + 34, cy + 108); ctx.stroke(); // спокойный рот
  ctx.beginPath(); ctx.ellipse(cx + 330, cy + 330, 330, 260, -.2, 0, Math.PI * 2); fillOL('#1d2133', 8); circle(cx + 420, cy + 60, 190); fillOL('#111318', 8); } // плечо и затылок Беки в чёрной шапке на переднем плане
function bedImprint(t) { ctx.fillStyle = '#1a2240'; ctx.fillRect(0, 0, W, H); rr(140, 280, 300, 400, 8); fillOL('#2b3558', 6); ctx.save(); rr(156, 296, 268, 368, 4); ctx.clip(); ctx.fillStyle = '#0d1430'; ctx.fillRect(0, 0, W, H); FrostOverlay(.8, { x: 156, y: 296, w: 268, h: 368 }, 'edges', 17); ctx.restore();
  ctx.fillStyle = '#141a33'; ctx.fillRect(0, 1240, W, H); rr(100, 800, 880, 560, 30); fillOL('#3b2c2c', 6); rr(120, 760, 840, 520, 40); fillOL('#8590b3', 6); // кровать, одеяло
  ctx.save(); ctx.fillStyle = 'rgba(30,36,70,.55)'; ctx.beginPath(); ctx.ellipse(330, 860, 90, 70, 0, 0, Math.PI * 2); ctx.fill(); rr(380, 830, 520, 160, 80); ctx.fill(); rr(560, 980, 340, 90, 45); ctx.fill(); ctx.restore(); // вмятина по форме тела
  ctx.beginPath(); ctx.ellipse(300, 820, 160, 80, -.05, 0, Math.PI * 2); fillOL('#e6eaf3', 6); FrostOverlay(1, { x: 140, y: 740, w: 320, h: 160 }, { x: 300, y: 820 }, 19); // подушка в инее
  glow(300, 820, 260, 'rgba(207,232,255,.25)'); }
const SC = [
  [0, 3, 'e4s01', t => push(t, 0, 3, () => navMap(t, 'nav'), 610, 1100), NIGHT],
  [3, 7, 'e4s02', t => push(t, 3, 7, () => MirrorShot(t, tt => { ctx.fillStyle = '#05060c'; ctx.fillRect(MIR.x, MIR.y, MIR.w, MIR.h); for (let i = 0; i < 3; i++) { const ph = ((tt - 3) * .45 + i / 3) % 1; ctx.save(); ctx.globalAlpha = .55 * Math.sin(ph * Math.PI); ctx.fillStyle = '#dfeaff'; ctx.beginPath(); ctx.ellipse(MIR.x + MIR.w / 2 + Math.sin(ph * 6 + i) * 40, MIR.y + MIR.h - ph * 260, 60 + ph * 90, 34 + ph * 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }), 540, 720), NIGHT],
  [7, 11, 'e4s03', t => navMap(t, 'miss'), NIGHT],
  [11, 16, 'e4s04', t => { windshield(t, .5); HandPhone(t, tt => PhoneScreen(tt, 'system', [['Отклонение'], ['Штраф −25 мин за минуту', true]], 11.1), { k: E.out(win(t, 11, 11.3)), cracked: true }); }, NIGHT],
  [16, 19.4, 'e4s05a', t => loopMap(t), NIGHT],
  [19.4, 24, 'e4s05b', t => push(t, 19.4, 24, () => rearWindow(t, [19.6, 20.1, 20.6]), 540, 700), NIGHT],
  [24, 26.8, 'e4s06a', t => push(t, 24, 26.8, () => MirrorShot(t, tt => shoulderMirror(tt, E.io(win(tt, 24.2, 28.6)))), 600, 760), NIGHT],
  [26.8, 29, 'e4s06b', t => push(t, 26.8, 29, () => MirrorShot(t, tt => shoulderMirror(tt, E.io(win(tt, 24.2, 28.6)))), MIR.x + MIR.w - 170, MIR.y + 250, 2.1, 2.4), NIGHT], // крупно: иней у плеча
  [29, 30.4, 'e4s07a', t => MirrorShot(t, tt => shoulderMirror(tt, 1 - E.io(win(tt, 29.4, 30.4)))), NIGHT],
  [30.4, 34, 'e4s07b', t => { windshield(t, .4); HandPhone(t, tt => PhoneScreen(tt, 'system', [['Поездка приостановлена'], ['Продолжение 03:17', true]], 30.5), { k: E.out(win(t, 30.4, 30.7)), cracked: true }); }, NIGHT],
  [34, 40, 'e4s08', t => push(t, 34, 40, () => { homeKitchen(t); hug(t, 0); }, 540, 1000), HOME],
  [40, 44, 'e4s09a', t => push(t, 40, 44, () => momClose(t), 520, 820), HOME],
  [44, 48, 'e4s09b', t => push(t, 44, 48, () => bekaFace(t, { bg: homeKitchen, wide: 1.2 }), CXC, 820, 1, 1.12), HOME], // реакция Беки
  [48, 52, 'e4s10', t => push(t, 48, 52, () => bedImprint(t), 320, 840, 1, 1.12), HOME],
  [52, 53, 'e4s11', t => { bedImprint(t); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, W, H); }, HOME],
  [53, 55.5, 'e4s12a', t => { windshield(t, .3); HandPhone(t, tt => PhoneScreen(tt, 'order', [['Получатель:'], ['Бекзат Н.', true]], 53.1), { k: E.out(win(t, 53, 53.3)), cracked: true }); }, HOME],
  [55.5, 58.01, 'e4s12b', t => EndCard(t, 55.5, '', 'ЧАСТЬ 5 · ФИНАЛ →'), null],
];

// ───── субтитры по голосу ─────
const T12 = VT('e4s12') || [];
const CAPS = buildCaptions([
  [0.0, 3.0, 'Смерть едет к моей **маме**. А везу её — **я**', { times: VT('e4s01'), whole: true, size: 56, maxW: 940 }],
  [3.0, 7.0, 'Отменять нельзя. Но про **объезд** правил не было', { times: VT('e4s02') }],
  [11.0, 16.0, 'Каждая минута — почти **полчаса** моей жизни', { times: VT('e4s04') }],
  [16.0, 24.0, 'Я кружил по городу. Сзади стучали в стекло. **Изнутри**', { times: VT('e4s05') }],
  [24.0, 29.0, 'Иней дополз до моего **плеча**', { times: VT('e4s06') }],
  [29.0, 34.0, 'Пять утра. Поездку не отменили. **Отложили**', { times: VT('e4s07') }],
  [34.0, 40.0, 'Мама была **жива**', { times: VT('e4s08') }],
  [40.0, 48.0, '— Ты ночью приходил? Лежал у себя, не дышал. Включила свет — **пусто**', { times: VT('e4s09'), color: '#ffd9c2' }],
  [53.0, 55.5, 'Заказ был не за мамой.', { times: T12.slice(0, 5) }],
  [55.5, 58.0, '**За мной**', { times: T12.slice(5).map(x => Math.max(x, 55.6)), y: 900, size: 96 }],
], { tail: .3 });
CAPS[0].a = 0; CAPS[0].words[0].t = 0;
window.CAPTION_PHRASES = CAPS;

function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore(); const k = 1 - win(t, a, a + .15); if (i > 0 && k > 0 && id !== 'e4s11') { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); }
  post(t); LAST = null; if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(4, t); KineticCaption(t, CAPS); }

// ───── звук ─────
const M = 'projects/schetchik/assets/music-ep4.wav';
const ticks = (a, b, s0, s1) => { const r = []; let t = a; while (t < b) { r.push(+t.toFixed(2)); t += lerp(s0, s1, (t - a) / (b - a)); } return r; };
window.SFX_CUES = [
  // ретро-звук: акценты в сценах без своего звука (2026-11-05)
  { t: 0.05, type: 'lib', id: 'whoosh-fast-hard', gain: .4 }, ...[0.4, 0.9, 1.4, 1.9, 2.4].map((t, i) => ({ t, type: 'lib', id: 'data-tick', gain: .25 + i * .05 })), // маршрут рисуется
  { t: 40, type: 'hum', dur: 8, gain: .05, pitch: 1.2 }, ...[40.5, 41.5, 42.5, 43.5, 45.5, 46.5, 47.5].map(t => ({ t, type: 'lib', id: 'data-tick', gain: .1, rate: .7 })), // тишина квартиры, часы
  { t: 44.15, type: 'lib', id: 'click-button-firm', gain: .55 },                                                     // выключатель
  { t: 0, type: 'file', path: M, gain: .1, dur: 52 }, { t: 53, type: 'file', path: M, gain: .08, from: 53, dur: 5 }, // тишина 52–53
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/schetchik/assets/vo/ep4/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 3.2, type: 'lib', id: 'bsb-breathing-man-slow', gain: .3, align: 'start', dur: 3.8 },                               // breath_rear
  { t: 8.9, type: 'lib', id: 'bsb-tires-screech', gain: .4, align: 'start', dur: 1.6 },                                    // tires_screech
  { t: 11.1, type: 'lib', id: 'notification-failure-wobble', gain: .5 }, ...[12.5, 14.5].map(t => ({ t, type: 'lib', id: 'digital-glitch-subtle', gain: .35 })), // tick со сбоем
  ...ticks(11.2, 16, .5, .5).map(t => ({ t, type: 'lib', id: 'data-tick', gain: .2 })),
  ...ticks(16, 29.4, .5, .18).map(t => ({ t, type: 'lib', id: 'data-tick', gain: .14 })),                                   // tick ускоряется, обрывается в 05:00
  { t: 16, type: 'tires', dur: 3.4, gain: .06 },
  ...[19.6, 20.1, 20.6].map(t => ({ t, type: 'lib', id: 'bsb-knock-glass', gain: .5, align: 'start', dur: .3 })),          // knock ×3 изнутри
  { t: 24.3, type: 'lib', id: 'bsb-ice-crack-3', gain: .35, align: 'start', dur: 2.5 }, { t: 26.5, type: 'lib', id: 'bsb-ice-crack-1', gain: .3, align: 'start', dur: 1.5 }, // ice_near_ear
  { t: 30.5, type: 'lib', id: 'notification-alert-soft', gain: .4 },
  { t: 34.0, type: 'lib', id: 'bsb-door-creak-close', gain: .3, align: 'start', dur: 1.2 }, { t: 34, type: 'lib', id: 'bsb-kettle-electric', gain: .12, align: 'start', dur: 14 }, // door, kettle
  { t: 48, type: 'drone', dur: 4, pitch: .7, gain: .18 },                                                                     // drone_rise
  { t: 53.0, type: 'lib', id: 'notification-alert-clear', gain: .5 }, { t: 55.5, type: 'lib', id: 'impact-deep-firm', gain: .4 }, // ping в конце
];
window.STORYBOARD = { episode: 4, title: 'Объезд', duration: DUR, hud: { night: 2, temp: '−29°', balanceStart: '54:06:00' },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +b.toFixed(2), vo: c.length ? { speaker: id === 'e4s09' ? 'mom' : 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: s.t })), hud: h ? { time: h.time, balance: h.balance === undefined ? null : hms(h.balance) } : null, overlays: a === 0 ? ['PartSticker:4'] : id === 'e4s12b' ? ['EndCard'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
