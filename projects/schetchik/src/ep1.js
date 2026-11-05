// «Счётчик» · серия 1 «Минуты» (0:58). Таймкоды и тексты — по ТЗ, раздел 6.
'use strict';
const DUR = 58;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const BAL0 = 72 * 3600 + 47 * 60, T0403 = 4 * 3600 + 3 * 60; // бонус 72:00:00 + 47 мин, счётчик включился в 04:03
const clk = (h, m, s, t, t0) => h * 3600 + m * 60 + s + Math.max(0, t - t0);
const hm = c => `${String(Math.floor(c / 3600)).padStart(2, '0')}:${String(Math.floor(c / 60) % 60).padStart(2, '0')}`;
const bal = c => BAL0 - (c - T0403);

// ───── фоны серии ─────
function seatbelt(t) { const k = E.io(win(t, .45, 1.15)), x0 = MIR.x + 150, y0 = MIR.y + 30, x1 = MIR.x + 560, y1 = MIR.y + 300, sag = lerp(120, 0, k);
  ctx.strokeStyle = '#1a1c24'; ctx.lineWidth = 34; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 - sag * .3, (y0 + y1) / 2 + sag, x1, y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(207,232,255,.18)'; ctx.lineWidth = 4; ctx.stroke(); rr(x1 - 30, y1 - 22, 60, 44, 8); fillOL('#8d93a6', 4);
  if (t > 1.2) glow(x1, y1, 120, `rgba(207,232,255,${.7 * (1 - win(t, 1.2, 1.6))})`); }
function snowPile(t) { const cx = MIR.x + 430, cy = MIR.y + 245; ctx.beginPath(); ctx.moveTo(cx - 170, cy + 40); ctx.quadraticCurveTo(cx - 120, cy - 60, cx - 30, cy - 70); ctx.quadraticCurveTo(cx + 60, cy - 90, cx + 110, cy - 30); ctx.quadraticCurveTo(cx + 170, cy, cx + 180, cy + 40); ctx.closePath(); fillOL('#eef6ff', 4);
  ctx.fillStyle = 'rgba(150,180,230,.45)'; ctx.beginPath(); ctx.ellipse(cx + 20, cy + 20, 120, 22, 0, 0, Math.PI * 2); ctx.fill();
  const r = seeded(4); for (let i = 0; i < 9; i++) { const sx = cx - 120 + r() * 260, sy = cy - 40 + r() * 70, a = .5 + .5 * Math.sin(t * 5 + i * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; circle(sx, sy, 3); ctx.fill(); } }
function dashTemp(t) { ctx.fillStyle = '#05060c'; rr(360, 1420, 300, 100, 18); ctx.fill(); ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 3; ctx.stroke(); glow(510, 1470, 160, 'rgba(242,179,61,.25)');
  txt('+24°', 510, 1472, 64, T.window, { font: 'JBM', weight: 800, align: 'center' }); txt('ПЕЧКА', 395, 1440, 18, 'rgba(242,179,61,.6)', { font: 'JBM', weight: 700 }); }
function street(t) { nightSky(); ctx.save(); ctx.translate(-20 * E.io(win(t, 3, 8)), 0); terricons(1120); ctx.restore();
  ctx.save(); ctx.translate(-50 * E.io(win(t, 3, 8)), 0); panelBlock(-40, 1250, 620, 5, 5, { lit: ['1-1', '3-3', '4-0'] }); panelBlock(640, 1250, 560, 5, 4, { lit: ['0-2', '2-1'] });
  for (const lx of [120, 560, 1000]) { ctx.fillStyle = '#0a0d1a'; ctx.fillRect(lx, 820, 12, 470); rr(lx - 40, 810, 70, 16, 8); ctx.fill(); glow(lx - 10, 840, 260, 'rgba(242,179,61,.35)'); } ctx.restore();
  ctx.fillStyle = '#0b1022'; ctx.fillRect(0, 1250, W, H); ctx.fillStyle = '#dfe9f7'; ctx.beginPath(); ctx.moveTo(0, 1290); ctx.quadraticCurveTo(540, 1250, W, 1300); ctx.lineTo(W, 1340); ctx.lineTo(0, 1340); ctx.fill();
  ctx.save(); ctx.translate(-80 * E.io(win(t, 3, 8)), 0); sedan(560, 1500, 1.2, { lights: 1 }); ctx.restore(); snow(t, .9, 40); }
function glovebox(t, { open = 1, phone = 1, hand = null, leak = 0 } = {}) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0c1020'); g.addColorStop(1, '#05060c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#121626'; ctx.beginPath(); ctx.moveTo(-20, 560); ctx.quadraticCurveTo(540, 470, 1100, 560); ctx.lineTo(1100, H); ctx.lineTo(-20, H); ctx.fill(); // торпеда
  rr(170, 760, 700, 440, 34); fillOL('#191e30', 8);
  if (open > 0) { ctx.fillStyle = '#04050a'; rr(200, 790, 640, 380, 22); ctx.fill(); glow(520, 980, 420 * open, 'rgba(207,232,255,.55)');
    if (phone > 0) { ctx.save(); ctx.translate(520, 1030); ctx.rotate(-.18); ctx.globalAlpha = phone; rr(-90, -50, 180, 100, 16); fillOL('#0b0d16', 4); rr(-78, -40, 156, 80, 10); ctx.fillStyle = 'rgba(207,232,255,.25)'; ctx.fill();
      ctx.strokeStyle = 'rgba(230,240,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, -38); ctx.lineTo(0, 0); ctx.lineTo(-40, 30); ctx.moveTo(0, 0); ctx.lineTo(50, 20); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(170, 1200); ctx.transform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(700, 0); ctx.lineTo(660, 160 * open); ctx.lineTo(40, 160 * open); ctx.closePath(); fillOL('#20263b', 6); ctx.restore(); } // откинутая крышка
  else { ctx.strokeStyle = '#05060c'; ctx.lineWidth = 8; rr(200, 790, 640, 380, 22); ctx.stroke(); rr(470, 830, 100, 26, 12); fillOL('#2b3149', 4);
    if (leak > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(207,232,255,${.9 * leak})`; ctx.lineWidth = 6; rr(200, 790, 640, 380, 22); ctx.stroke(); ctx.restore(); glow(520, 980, 520 * leak, `rgba(207,232,255,${.5 * leak})`); } }
  if (hand) { const [hx, hy] = hand; ctx.save(); ctx.translate(hx, hy); ctx.rotate(-.5); rr(0, -60, 600, 160, 70); fillOL('#1d2133', 6); ctx.beginPath(); ctx.ellipse(-20, 20, 90, 70, 0, 0, Math.PI * 2); fillOL('#e9b08a', 6);
    for (let i = 0; i < 4; i++) { rr(-150, -40 + i * 30, 90, 28, 14); fillOL('#e9b08a', 4); } ctx.restore(); } }
function cemetery(t) { nightSky(); terricons(1080, '#121a35');
  ctx.fillStyle = '#0a0e1d'; for (let i = 0; i < 9; i++) { const x = 40 + i * 125, h = 60 + (i % 3) * 30; ctx.fillRect(x, 1210 - h, 10, h); ctx.fillRect(x - 25, 1210 - h + 20, 60, 9); } // кресты вдали
  for (const px of [150, 790]) { rr(px, 640, 140, 720, 8); fillOL('#2a2f45', 6); ctx.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 660; y < 1350; y += 46) ctx.fillRect(px + 4, y, 132, 4); ctx.fillStyle = '#eef6ff'; rr(px - 12, 620, 164, 36, 14); ctx.fill(); }
  ctx.strokeStyle = '#0a0d18'; ctx.lineWidth = 12; for (let i = 0; i < 11; i++) { const x = 300 + i * 46, top = 760 - Math.sin(i / 10 * Math.PI) * 120; ctx.beginPath(); ctx.moveTo(x, 1350); ctx.lineTo(x, top); ctx.stroke(); ctx.fillStyle = '#0a0d18'; ctx.beginPath(); ctx.moveTo(x - 12, top + 4); ctx.lineTo(x, top - 30); ctx.lineTo(x + 12, top + 4); ctx.fill(); }
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(290, 1040); ctx.lineTo(790, 1040); ctx.moveTo(290, 1300); ctx.lineTo(790, 1300); ctx.stroke();
  rr(830, 560, 60, 70, 10); fillOL('#1a1d28', 5); glow(860, 620, 420, 'rgba(242,179,61,.6)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(242,179,61,.10)'; ctx.beginPath(); ctx.moveTo(840, 630); ctx.lineTo(880, 630); ctx.lineTo(980, 1400); ctx.lineTo(300, 1400); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1340, W, H); glow(560, 1380, 420, 'rgba(242,179,61,.18)');
  oldLady(520, 1360, 1.05, t); snow(t, 1, 20, 1.2); }
function carSide(t) { ctx.fillStyle = '#060914'; ctx.fillRect(0, 0, W, H); const r = seeded(31);
  for (let i = 0; i < 40; i++) { const y = 500 + r() * 900, len = 120 + r() * 380, sp = 1800 + r() * 1400, x = W - ((r() * W * 2 + t * sp) % (W * 2)), c = r() < .7 ? '242,179,61' : '207,232,255';
    ctx.strokeStyle = `rgba(${c},${.15 + r() * .3})`; ctx.lineWidth = 3 + r() * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke(); }
  ctx.fillStyle = '#0c1124'; ctx.fillRect(0, 1250, W, H); ctx.fillStyle = 'rgba(223,233,247,.25)'; for (let i = 0; i < 8; i++) { const x = W - ((i * 300 + t * 2200) % (W + 300)); ctx.fillRect(x, 1330, 140, 10); }
  const bob = Math.sin(t * 18) * 3; sedan(520, 1240 + bob, 1.7, { lights: 1, frost: E.io(win(t, 30.4, 34.6)) });
  ctx.save(); ctx.globalAlpha = .7; for (let i = 0; i < 60; i++) { const y = (r() * H), x = W - ((r() * W + t * 2600) % W); ctx.fillStyle = '#e8f2ff'; ctx.fillRect(x, y, 26, 3); } ctx.restore(); }
function fiveStorey(t, off = null) { nightSky(); terricons(1150); panelBlock(60, 1450, 960, 5, 6, { lit: ['0-1', '1-4', '2-3', '3-0', '4-2'], callout: { key: '2-3', text: '3 ЭТАЖ' }, t, offAt: off, fortochka: '2-3' });
  ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1450, W, H); rr(440, 1260, 200, 190, 6); fillOL('#141a30', 5); rr(470, 1230, 140, 24, 6); fillOL('#2a3150', 4); glow(540, 1240, 140, 'rgba(242,179,61,.45)'); // подъезд
  sedan(820, 1610, .9, { lights: 1 }); snow(t, .8, 20); }
function noTracks(t) { nightSky(); terricons(1000); ctx.fillStyle = '#e6eef9'; ctx.fillRect(0, 1180, W, H); const g = ctx.createLinearGradient(0, 1180, 0, 1700); g.addColorStop(0, 'rgba(120,150,200,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1180, W, 520);
  const sh = t > 37.15 ? Math.sin((t - 37.15) * 60) * 10 * Math.exp(-(t - 37.15) * 9) : 0; sedan(760 + sh, 1250, 2.4, { lights: 0, tail: 1 }); // машина вблизи, хлопок задней двери
  ctx.fillStyle = 'rgba(120,150,200,.35)'; ctx.beginPath(); ctx.ellipse(760, 1262, 640, 40, 0, 0, Math.PI * 2); ctx.fill(); // тень, снег ровный — ни одного следа
  const r = seeded(9); for (let i = 0; i < 30; i++) { const x = r() * 640, y = 1300 + r() * 260, a = .4 + .6 * Math.sin(t * 4 + i); ctx.fillStyle = `rgba(255,255,255,${a})`; circle(x, y, 3); ctx.fill(); } snow(t, .7, 10); }
function drift(t) { nightSky(); terricons(1150); ctx.fillStyle = '#0a0d1a'; ctx.fillRect(860, 640, 14, 700); rr(800, 630, 90, 18, 9); ctx.fill(); glow(820, 660, 340, 'rgba(242,179,61,.45)');
  ctx.fillStyle = '#0b1022'; ctx.fillRect(0, 1340, W, H); ctx.fillStyle = '#e6eef9'; ctx.beginPath(); ctx.moveTo(-40, 1360); ctx.quadraticCurveTo(160, 1080, 420, 1170); ctx.quadraticCurveTo(620, 1230, 700, 1360); ctx.closePath(); fillOL('#e6eef9', 5);
  const k = win(t, 50.4, 51.2); if (k > 0 && k < 1) { const x = lerp(900, 330, k), y = lerp(1380, 1170, k) - Math.sin(k * Math.PI) * 360; ctx.save(); ctx.translate(x, y); ctx.rotate(k * 9); rr(-34, -60, 68, 120, 12); fillOL('#0b0d16', 4); ctx.restore(); }
  if (t > 51.2) { const pk = win(t, 51.2, 52.0), r = seeded(5); for (let i = 0; i < 26; i++) { const a = r() * Math.PI, d = pk * (60 + r() * 120); ctx.fillStyle = `rgba(240,246,255,${1 - pk})`; circle(330 + Math.cos(a) * d * 1.4, 1170 - Math.sin(a) * d, 6 + r() * 6); ctx.fill(); } }
  sedan(820 + 900 * Math.pow(win(t, 51.5, 53.8), 1.8), 1560, 1, { lights: 1 }); snow(t, .8, 30); }

// ───── голос (черновой синтез) и субтитры по пословным меткам из tools/words.py ─────
const VO_AT = { e1s01: 0.0, e1s02: 3.2, e1s03: 8.4, e1s04: 13.3, e1s05: 18.6, e1s06: 24.4, e1s07: 30.6, e1s08: 36.6, e1s09: 42.0, e1s10: 45.2, e1s11: 50.2, e1s13: 55.1 };
const VO_GAIN = { e1s07: 11, e1s13: 7 }; // шёпот тише — поднять
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);
const CAPS = buildCaptions([
  [0.0, 3.0, 'За эту поездку мне заплатили **чужой жизнью**', { times: VT('e1s01') }],
  [3.0, 8.0, 'Машина досталась мне от брата. Марат пропал **год назад**', { times: VT('e1s02') }],
  [8.0, 13.0, 'Его телефон год был разряжен. В 03:17 он **сам** принял заказ', { times: VT('e1s03') }],
  [13.0, 18.0, 'Откуда — кладбище. Оплата — не в тенге. **В минутах**', { times: VT('e1s04') }],
  [18.0, 24.0, 'Она ждала у ворот. С термосом. **Для него**', { times: VT('e1s05') }],
  [24.0, 30.0, 'В салоне плюс двадцать четыре. А снег **не тает**', { times: VT('e1s06') }],
  [30.0, 35.0, '«Он всегда ждёт меня с **открытым окном**»', { color: T.frost, times: VT('e1s07') }],
  [35.0, 41.0, 'Она вышла. На снегу — **ни одного следа**', { times: VT('e1s08') }],
  [41.0, 45.0, 'Четыре ноль три. Сорок семь минут — **мне**', { times: VT('e1s09') }],
  [45.0, 50.0, 'А потом включился второй счётчик. **Мой**', { times: VT('e1s10') }],
  [50.0, 54.0, 'Я выкинул телефон в сугроб', { times: VT('e1s11') }],
  [55.0, 58.0, 'Через минуту он зазвонил в бардачке', { times: VT('e1s13') }],
], { tail: .3 });
CAPS[0].words[0].t = 0; CAPS[0].a = 0; // первый кадр: субтитр уже виден
window.CAPTION_PHRASES = CAPS;

// ───── сцены: [начало, конец, id, рисование, hud] ─────
const SC = [
  [0, 3, 'e1s01', t => { MirrorShot(t, tt => { rearSeat(tt); seatbelt(tt); }); }, t => ({ night: 1, time: '03:31', temp: '−31°' })],
  [3, 8, 'e1s02', t => street(t), t => ({ night: 1, time: '03:31', temp: '−31°' })],
  [8, 10.6, 'e1s03a', t => push(t, 8, 10.6, () => { const hk = E.out(win(t, 9.0, 9.9)), up = E.io(win(t, 10.0, 10.55)); glovebox(t, { phone: 1 - up, hand: [lerp(1300, 600, hk), lerp(1300, 1040, hk) - up * 500] }); }, 520, 980), t => ({ night: 1, time: '03:17', temp: '−31°' })],
  [10.6, 13, 'e1s03b', t => { windshield(t, .6); HandPhone(t, tt => PhoneScreen(tt, 'accepted', [['Заказ принят', true]], 10.7), { k: E.out(win(t, 10.6, 10.9)), cracked: true }); }, t => ({ night: 1, time: '03:17', temp: '−31°' })],
  [13, 18, 'e1s04', t => push(t, 13, 18, () => { windshield(t, .6); HandPhone(t, tt => PhoneScreen(tt, 'order', [['Откуда: кладбище'], ['Оплата: +47 мин', true]], 13.1), { cracked: true }); }, 540, 800), t => ({ night: 1, time: '03:17', temp: '−31°' })],
  [18, 24, 'e1s05', t => push(t, 18, 24, () => cemetery(t), 520, 1000), t => ({ night: 1, time: '03:24', temp: '−31°' })],
  [24, 30, 'e1s06', t => push(t, 24, 30, () => MirrorShot(t, tt => { rearSeat(tt); snowPile(tt); }, { glare: 1, dash: dashTemp }), 540, 760), t => ({ night: 1, time: '03:40', temp: '−31°' })],
  [30, 35, 'e1s07', t => carSide(t), t => ({ night: 1, time: '03:52', temp: '−31°' })],
  [35, 37, 'e1s08a', t => push(t, 35, 37, () => fiveStorey(t), 600, 900), t => ({ night: 1, time: '04:02', temp: '−31°' })],
  [37, 41, 'e1s08b', t => push(t, 37, 41, () => noTracks(t), 540, 1300), t => ({ night: 1, time: '04:02', temp: '−31°' })],
  [41, 42.6, 'e1s09a', t => cam(lerp(2.2, 2.4, win(t, 41, 42.6)), 627, 1030, () => fiveStorey(t, 41.6)), t => ({ night: 1, time: '04:03', temp: '−31°' })],
  [42.6, 45, 'e1s09b', t => { windshield(t, .6); HandPhone(t, tt => PhoneScreen(tt, 'system', [['Поездка завершена · 04:03'], ['+47 мин', true]], 42.7), { k: E.out(win(t, 42.6, 42.9)), cracked: true }); }, t => ({ night: 1, time: '04:03', temp: '−31°' })],
  [45, 50, 'e1s10', t => { windshield(t, .5); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, H); const c = clk(4, 3, 1, t, 45), sk = E.io(win(t, 47.9, 48.6));
      if (sk < 1) { ctx.save(); ctx.globalAlpha = 1 - sk; const s = lerp(1, .4, sk); ctx.translate(lerp(CXC, 900, sk), lerp(820, 260, sk)); ctx.scale(s, s); ctx.shadowColor = T.danger; ctx.shadowBlur = 40;
        txt('БАЛАНС', 0, -120, 44, 'rgba(244,241,234,.7)', { font: 'JBM', weight: 800, align: 'center' }); txt(hms(bal(c)), 0, 0, 150, T.danger, { font: 'JBM', weight: 800, align: 'center' }); ctx.restore(); } },
    t => ({ night: 1, time: hm(clk(4, 3, 1, t, 45)), temp: '−31°', balance: bal(clk(4, 3, 1, t, 45)), flash: Math.max(1 - win(t, 45, 45.6), win(t, 48.3, 48.6) * (1 - win(t, 48.6, 49.2))) })],
  [50, 54, 'e1s11', t => drift(t), t => ({ night: 1, time: hm(clk(4, 4, 0, t, 50)), temp: '−31°', balance: bal(clk(4, 4, 0, t, 50)) })],
  [54, 55, 'e1s12', t => MirrorShot(t, tt => bekaEyes(tt, E.io(win(tt, 54.2, 54.7)), 1.1)), t => ({ night: 1, time: '04:05', temp: '−31°', balance: bal(clk(4, 5, 0, t, 54)) })],
  [55, 56.5, 'e1s13a', t => glovebox(t, { open: 0, leak: E.out(win(t, 55.0, 55.6)) * (.8 + .2 * Math.sin(t * 20)) }), t => ({ night: 1, time: '04:05', temp: '−31°', balance: bal(clk(4, 5, 0, t, 54)) })],
  [56.5, 58.01, 'e1s13b', t => EndCard(t, 56.5, 'Пассажир уже в машине', 'ЧАСТЬ 2 →'), null],
];
function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, , , draw, hud] = SC[i];
  ctx.save(); draw(t); ctx.restore(); const k = 1 - win(t, a, a + .15); if (i > 0 && k > 0) { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); }
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(1, t); KineticCaption(t, CAPS); }

// ───── звук (только CC0 и синтез). Имена из ТЗ — в комментариях ─────
window.SFX_CUES = [
  { t: 0, type: 'file', path: 'projects/schetchik/assets/music-ep1.wav', gain: .1, dur: 54 },   // фон: тёмный эмбиент (tools/music.py --style dark), без мелодии и ритма
  { t: 55, type: 'file', path: 'projects/schetchik/assets/music-ep1.wav', gain: .08, from: 55, dur: 3 }, // 54–55 — тишина перед финальной фразой
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/schetchik/assets/vo/ep1/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 1.2, type: 'lib', id: 'bsb-seatbelt-in', gain: 1.0, align: 'start', dur: .6 }, { t: 1.22, type: 'lib', id: 'impact-deep-hard', gain: .7 }, // belt_click + удар баса
  { t: 3, type: 'lib', id: 'bsb-wind-strong-outside', gain: .14, align: 'start', dur: 5.2 },                                            // wind
  { t: 8.1, type: 'lib', id: 'bsb-glovebox', gain: .8, align: 'start', dur: 1.2 },
  { t: 10.7, type: 'lib', id: 'notification-alert-clear', gain: .8 },                      // ping
  { t: 13.15, type: 'lib', id: 'click-button-soft', gain: .7 },                            // ui_click
  { t: 18.4, type: 'lib', id: 'bsb-snow-footsteps-loop', gain: .55, align: 'start', dur: 4.2 }, { t: 18, type: 'lib', id: 'bsb-wind-foley', gain: .35, align: 'start', dur: 6 }, // snow_steps
  { t: 24, type: 'hum', dur: 6, gain: .1 },                                               // heater_hum
  { t: 30, type: 'tires', dur: 5, gain: .1 }, { t: 30, type: 'engine', dur: 5, gain: .08 }, // tires_snow (+ whisper_rear_left — голос от заказчика)
  { t: 37.15, type: 'lib', id: 'bsb-car-door-slam-inside', gain: .6, align: 'start', dur: 1.2 }, // door
  { t: 35, type: 'lib', id: 'bsb-wind-whistle-chimney', gain: .1, align: 'start', dur: 6 },
  { t: 41.6, type: 'lib', id: 'click-button-firm', gain: .5, rate: .7 },                  // свет гаснет
  { t: 42.8, type: 'lib', id: 'money-coin-drop', gain: .7, rate: .62 },                   // coin_distorted
  ...[45, 46, 47, 47.7, 48.3, 48.8, 49.2, 49.6, 49.9, 50.2, 50.5, 50.8, 51.05].map((t, i) => ({ t, type: 'lib', id: 'data-tick', gain: .35 + i * .04 })), // tick нарастает, обрывается
  { t: 50.3, type: 'lib', id: 'whoosh-medium-soft', gain: .25 }, { t: 51.2, type: 'puff', gain: .25 }, { t: 51.4, type: 'engine', dur: 2.6, gain: .14, pitch: 1.1 }, // бросок, сугроб, engine
  { t: 54.95, type: 'lib', id: 'notification-alert-clear', gain: .55 },                     // ping в конце
  { t: 56.5, type: 'lib', id: 'impact-deep-firm', gain: .4 },
];
// ───── раскадровка для storyboard/ep1.json (схема ТЗ, раздел 7) ─────
window.STORYBOARD = { episode: 1, title: 'Минуты', duration: DUR, hud: { night: 1, temp: '−31°', balanceStart: '72:00:00' },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +b.toFixed(2), vo: c.length ? { speaker: id === 'e1s07' ? 'old_woman' : 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: s.t })), hud: h ? { time: h.time, balance: h.balance === undefined ? null : hms(h.balance) } : null, overlays: a === 0 ? ['PartSticker:1'] : id === 'e1s13b' ? ['EndCard'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
