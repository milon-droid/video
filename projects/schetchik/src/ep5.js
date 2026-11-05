// «Счётчик» · серия 5 «Комиссия» — финал (0:59). Таймкоды и тексты — по ТЗ, раздел 6.
'use strict';
const DUR = 59;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
// 3-я ночь: 04:55:00 в 03:17 (27:12 в 05:00 минус 22:17), тикает; в 43,6 с — 00:00:00; потом +47 лет 3 мес, комиссия −9 лет 5 мес → 37 лет 10 мес
const hm = c => `${String(Math.floor(c / 3600)).padStart(2, '0')}:${String(Math.floor(c / 60) % 60).padStart(2, '0')}`;
const clockAt = t => 3 * 3600 + 17 * 60 + Math.max(0, t - 22) * 2; // ночь 3 с 22 с ролика, время в кадре идёт быстрее
const life = t => { if (t < 43.6) return storyBalance(ST(2, 3, 17) + Math.max(0, t - 22) * 2); if (t < 46.6) return '00:00:00'; // единая функция сюжета (lib.js): 04:55:00 в 03:17
  if (t < 51.6) return '47 Л 3 МЕС'; return '37 Л 10 МЕС · ' + hms(24 * 3600 - 1 - (t - 51.6)); }; // длинный баланс — в две строки
const NIGHT3 = t => ({ night: 3, time: hm(clockAt(t)), temp: '−27°', balance: life(t), flash: t > 43.6 && t < 44.6 ? 1 : t > 51.6 && t < 52.2 ? 1 - win(t, 51.6, 52.2) : 0 });
const REC = () => ({ label: 'ЗАПИСЬ', time: '03:17', temp: '05.11.2025' });

// ───── голос (черновой) ─────
const VO_AT = { e5s01: 0.0, e5s02: 3.6, e5s03: 9.0, e5s04: 14.6, e5s05: 18.6, e5s06: 24.4, e5s07: 27.6, e5s08: 33.2, e5s09: 38.0, e5s11: 47.6, e5s13: 51.4 };
const VO_GAIN = { e5s07: 4.8, e5s04: 3.4 };
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);

// ───── запись регистратора ─────
function dashView(t, draw) { DashcamFrame(t, '● REC  05.11.2025 · 03:17', tt => { ctx.save(); ctx.translate(540, 900); ctx.scale(1.08, 1.08); ctx.translate(-540, -900); draw(tt); ctx.restore(); }, null);
  ctx.save(); ctx.globalAlpha = .1; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 2); ctx.restore(); } // строки развёртки
function road(t, crash = 0) { ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, W, H); terricons(700, '#0b1124');
  ctx.fillStyle = '#26304a'; ctx.fillRect(0, 700, W, H); // снежное поле ночью
  ctx.fillStyle = '#0c1224'; ctx.beginPath(); ctx.moveTo(515, 700); ctx.lineTo(565, 700); ctx.lineTo(1150, 1500); ctx.lineTo(-70, 1500); ctx.closePath(); ctx.fill(); // трасса
  ctx.strokeStyle = 'rgba(223,233,247,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(515, 700); ctx.lineTo(-70, 1500); ctx.moveTo(565, 700); ctx.lineTo(1150, 1500); ctx.stroke(); // кромки
  ctx.fillStyle = 'rgba(223,233,247,.5)'; for (let i = 0; i < 5; i++) { const k = ((i / 5) + t * .5) % 1, y = lerp(710, 1500, k * k), w2 = lerp(3, 44, k * k); ctx.fillRect(540 - w2 / 2, y, w2, lerp(8, 90, k * k)); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 1500, 0, 540, 1500, 800); g.addColorStop(0, 'rgba(255,236,180,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (crash > 0) { ctx.save(); ctx.translate(340, 1000); ctx.rotate(Math.PI + .05); ctx.scale(.8, .8); sedan(0, 0, 1, { lights: 0, tail: 0 }); ctx.restore(); ctx.fillStyle = 'rgba(223,233,247,.6)'; ctx.beginPath(); ctx.ellipse(340, 1020, 280, 26, 0, 0, Math.PI * 2); ctx.fill(); // перевёрнутая машина в кювете — целиком
    if (Math.floor(t * 2.2) % 2) { glow(150, 1000, 130, 'rgba(255,150,40,.95)'); glow(530, 990, 130, 'rgba(255,150,40,.95)'); } } // аварийка
  snow(t, .6, 40, 1.4); }
function holderPhone(t, lines, { buttons = false, press = 0, cx = 540, cy = 1080, s = 1 } = {}) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.fillStyle = '#05060b'; rr(-60, 260, 120, 140, 10); ctx.fill(); // держатель
  rr(-230, -300, 460, 580, 40); fillOL('#0b0d16', 6); rr(-210, -280, 420, 540, 28); ctx.fillStyle = '#0c1124'; ctx.fill();
  txt('ПОСЛЕДНИЙ', -180, -230, 26, 'rgba(207,232,255,.75)', { weight: 900 }); lines.forEach(([s2, acc], i) => txt(s2.toUpperCase(), -180, -130 + i * 80, acc ? 50 : 44, acc ? T.danger : T.text, { weight: 900 }));
  if (buttons) { rr(-190, 100, 180, 110, 22); fillOL(T.ok, 4); txt('ДОВЕЗТИ', -100, 156, 30, '#06140c', { weight: 900, align: 'center' }); rr(10, 100, 180, 110, 22); fillOL(lerp(0, 1, press) > .5 ? '#ff6b6e' : T.danger, 4); txt('ОТМЕНИТЬ', 100, 156, 30, '#fff', { weight: 900, align: 'center' }); }
  ctx.restore(); }
function maratHand(x, y, k) { ctx.save(); ctx.translate(x + (1 - k) * 260, y + (1 - k) * 260); ctx.rotate(-.75); ctx.scale(.8, .8);
  rr(190, -55, 420, 120, 50); fillOL('#E8641C', 5); ctx.fillStyle = 'rgba(230,240,255,.85)'; ctx.fillRect(300, -55, 26, 120); // рукав оранжевого жилета
  ctx.beginPath(); ctx.ellipse(130, 5, 80, 60, 0, 0, Math.PI * 2); fillOL('#e2a57f', 5); rr(-10, -14, 120, 30, 15); fillOL('#e2a57f', 4); ctx.restore(); } // кончик пальца — в точке (x, y)
function tear(t, k) { if (k <= 0) return; const r = seeded(Math.floor(t * 12) + 3); for (let i = 0; i < 7; i++) { const y = r() * H, h = 20 + r() * 80; ctx.fillStyle = `rgba(${r() < .5 ? '207,232,255' : '0,0,0'},${.5 * k})`; ctx.fillRect(0, y, W, h); }
  FrostOverlay(k, { x: 0, y: 0, w: W, h: H }, { x: 540, y: 900 }, 97); }
// ───── настоящее: двор, зеркало, кнопки ─────
function yard(t) { nightSky(); terricons(1150); panelBlock(60, 1450, 960, 5, 6, { lit: ['0-2', '3-4'] }); ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1450, W, H); sedan(540, 1640, 1.1, { lights: 1 }); snow(t, .8, 20); }
function thumbButtons(t, pressAt = 99) { windshield(t, .35); const tr = Math.sin(t * 38) * 6 * (t < pressAt ? 1 : 0), pk = E.io(win(t, pressAt - .3, pressAt));
  HandPhone(t, tt => { PhoneScreen(tt, 'order', [['Пассажир: Марат Т.']], 0); const by = PHN.y + 560; rr(PHN.x + 40, by, PHN.w - 80, 120, 26); fillOL(t > pressAt ? '#7dffb5' : T.ok, 4); txt('ДОВЕЗТИ', PHN.x + PHN.w / 2, by + 62, 48, '#06140c', { weight: 900, align: 'center' });
    rr(PHN.x + 40, by + 150, PHN.w - 80, 120, 26); fillOL(T.danger, 4); txt('ОТМЕНИТЬ', PHN.x + PHN.w / 2, by + 212, 48, '#fff', { weight: 900, align: 'center' }); }, { cracked: true });
  withPhone(() => { ctx.save(); ctx.translate(PHN.x - 40 + tr + pk * 220, PHN.y + 980 - pk * 330); ctx.rotate(-.5); rr(0, -40, 90, 260, 44); fillOL('#e9b08a', 6); ctx.restore(); }); // большой палец дрожит
  if (t > pressAt) withPhone(() => glow(PHN.x + PHN.w / 2, PHN.y + 620, 300, 'rgba(61,220,132,.5)')); }
function history(t) { windshield(t, .35); HandPhone(t, tt => { const X = PHN.x + 44; ctx.fillStyle = '#0c1124'; ctx.fillRect(PHN.x, PHN.y, PHN.w, PHN.h); txt('ИСТОРИЯ', X, PHN.y + 120, 44, T.text, { weight: 900 });
    const hl = i => win(tt, 37.6 + i * .6, 38.0 + i * .6); [['04:03 · +47 мин'], ['03:55 · +05:12:00']].forEach(([s2], i) => { const y = PHN.y + 230 + i * 110; ctx.fillStyle = `rgba(242,179,61,${.25 * hl(i)})`; rr(X - 12, y - 42, PHN.w - 64, 84, 16); ctx.fill(); txt(s2.toUpperCase(), X, y, 44, hl(i) > .5 ? T.window : T.text, { weight: 900 }); });
    const m = E.io(win(tt, 39.6, 41.0)), y1 = lerp(PHN.y + 560, PHN.y + 640, m), y2 = lerp(PHN.y + 740, PHN.y + 640, m); // строки съезжаются и совпадают
    txt('ПОЛУЧАТЕЛЬ:', X, y1 - 34, 30, 'rgba(244,241,234,.7)', { weight: 900, alpha: 1 - m * .6 }); txt('БЕКЗАТ Н.', X, y1 + 14, 52, T.danger, { weight: 900 });
    txt('ВОДИТЕЛЬ:', X + lerp(0, 260, m), y2 - 34, 30, 'rgba(244,241,234,.7)', { weight: 900, alpha: 1 - m * .6 }); txt('БЕКЗАТ Н.', X, y2 + 14, 52, T.danger, { weight: 900, alpha: lerp(1, .85, m) }); }, { cracked: true }); }
function vestSeat(t) { rearSeat(t); const cx = MIR.x + MIR.w / 2 + 40, cy = MIR.y + 250; ctx.save(); ctx.translate(cx, cy); rr(-130, -40, 260, 80, 14); fillOL('#E8641C', 4); ctx.fillStyle = 'rgba(230,240,255,.85)'; ctx.fillRect(-120, -6, 240, 12); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, 40); ctx.stroke(); ctx.restore(); } // сложенный жилет
function seatbelt5(t, t0) { const k = E.io(win(t, t0, t0 + .7)), x0 = MIR.x + 150, y0 = MIR.y + 30, x1 = MIR.x + 560, y1 = MIR.y + 300, sag = lerp(120, 0, k);
  ctx.strokeStyle = '#1a1c24'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 - sag * .3, (y0 + y1) / 2 + sag, x1, y1); ctx.stroke(); rr(x1 - 30, y1 - 22, 60, 44, 8); fillOL('#8d93a6', 4);
  if (t > t0 + .7) glow(x1, y1, 120, `rgba(207,232,255,${.7 * (1 - win(t, t0 + .7, t0 + 1.1))})`); }
function mergeType(t) { ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H); bokeh(t, 7, 10, 300, 1100, .35); const m = E.io(win(t, 40.1, 41.4)); // «Получатель» и «Водитель» сливаются в одно имя
  const y1 = lerp(560, 760, m), y2 = lerp(960, 760, m);
  txt('ПОЛУЧАТЕЛЬ', CXC, y1 - 80, 48, 'rgba(244,241,234,.75)', { weight: 900, align: 'center', alpha: 1 - m * .5 }); txt('ВОДИТЕЛЬ', CXC, y2 + 80, 48, 'rgba(244,241,234,.75)', { weight: 900, align: 'center', alpha: 1 - m * .5 });
  ctx.save(); ctx.shadowColor = T.danger; ctx.shadowBlur = 20 + 40 * m; txt('БЕКЗАТ Н.', CXC, y1, 110, T.danger, { weight: 900, align: 'center' }); txt('БЕКЗАТ Н.', CXC, y2, 110, T.danger, { weight: 900, align: 'center', alpha: 1 - m }); ctx.restore();
  if (m >= 1) txt('=', CXC, 900, 90, T.text, { weight: 900, align: 'center', alpha: win(t, 41.4, 41.7) }); }
function arrival(t) { if (t < 43.4) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); txt('ВЫ НА МЕСТЕ', CXC, 820, 96, T.ok, { weight: 900, align: 'center', alpha: win(t, 43, 43.15) }); }
  else { MirrorShot(t, tt => rearSeat(tt), { frost: .6 * (1 - win(t, 44.4, 46)) }); } // пустое зеркало
  const f = win(t, 43.4, 43.6) * (1 - win(t, 44.2, 45.4)); if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } } // белая вспышка на весь экран
function commission(t) { ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H); bokeh(t, 9, 12, 300, 1100, .35); const k = E.back(win(t, 51.6, 52.0));
  txt('КОМИССИЯ СЕРВИСА 20%', CXC, 640, 52, 'rgba(244,241,234,.8)', { weight: 900, align: 'center', alpha: win(t, 51.1, 51.4) });
  ctx.save(); ctx.translate(CXC, 820); ctx.scale(lerp(.6, 1, k), lerp(.6, 1, k)); ctx.shadowColor = T.danger; ctx.shadowBlur = 40; txt('−9 ЛЕТ 5 МЕС', 0, 0, 110, T.danger, { weight: 900, align: 'center', alpha: clamp(k * 2) }); ctx.restore();
  txt('ОСТАЛОСЬ: 37 ЛЕТ 10 МЕС', CXC, 990, 44, T.window, { weight: 900, align: 'center', alpha: win(t, 52.6, 53.0) }); }
const SC = [
  [0, 3, 'e5s01', t => dashView(t, tt => road(tt)), REC],
  [3, 8, 'e5s02', t => dashView(t, tt => { road(tt); holderPhone(tt, [['Получатель:'], ['Бекзат Н.', true]], { cy: 800, s: 1.0 }); }), REC],
  [8, 13, 'e5s03', t => push(t, 8, 13, () => dashView(t, tt => road(tt, 1)), 340, 1000), REC],
  [13, 18, 'e5s04', t => dashView(t, tt => { road(tt, 1); holderPhone(tt, [['Получатель:'], ['Бекзат Н.', true]], { buttons: true, press: win(tt, 16.2, 16.4), cy: 800, s: 1.0 }); maratHand(640, 955, E.out(win(tt, 14.4, 16.3))); }), REC],
  [18, 22, 'e5s05', t => { const ft = Math.min(t, 18.6); dashView(ft, tt => { road(tt, 1); holderPhone(tt, [['Заказ отменён'], ['00:00:00', true]], { cy: 800, s: 1.0 }); }); tear(t, win(t, 18.8, 21.6)); if (t > 18.8 && t < 19.2) Glitch(t, 1); }, REC],
  [22, 24.3, 'e5s06a', t => push(t, 22, 24.3, () => yard(t), 540, 1300), NIGHT3],
  [24.3, 27, 'e5s06b', t => { windshield(t, .4); HandPhone(t, tt => PhoneScreen(tt, 'system', [['Возобновлён заказ #0001'], ['Пассажир: Марат Т.', true]], 24.4), { k: E.out(win(t, 24.3, 24.6)), cracked: true }); }, NIGHT3],
  [27, 32, 'e5s07', t => push(t, 27, 32, () => MirrorShot(t, tt => { rearSeat(tt); maratMirror(tt, { headUp: 1, eyesWhite: 1 }); }, { frost: .45 }), 540, 720, 1.05, 1.3), NIGHT3],
  [32, 34.5, 'e5s08a', t => push(t, 32, 34.5, () => MirrorShot(t, tt => { bekaEyes(tt, .3 * Math.sin(tt * 2), 1.2); ctx.fillStyle = 'rgba(80,130,255,.2)'; ctx.fillRect(MIR.x, MIR.y, MIR.w, MIR.h); }), 540, 720, 1.15, 1.3), NIGHT3], // реакция: глаза Беки
  [34.5, 37, 'e5s08b', t => thumbButtons(t), NIGHT3],
  [37, 40, 'e5s09a', t => history(t), NIGHT3],
  [40, 42, 'e5s09b', t => mergeType(t), NIGHT3],
  [42, 43, 'e5s10a', t => thumbButtons(t, 42.6), NIGHT3],
  [43, 46, 'e5s10b', t => arrival(t), NIGHT3],
  [46, 47.6, 'e5s11a', t => { ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H); bokeh(t, 5, 14, 300, 1400, .5); const k = E.back(win(t, 46.1, 46.5)); ctx.save(); ctx.translate(CXC, 800); ctx.scale(lerp(.6, 1, k), lerp(.6, 1, k));
      ctx.shadowColor = T.window; ctx.shadowBlur = 40; txt('НАЧИСЛЕНО', 0, -110, 40, 'rgba(244,241,234,.7)', { font: 'JBM', weight: 800, align: 'center' }); txt('+47 ЛЕТ 3 МЕС', 0, 0, 110, T.window, { weight: 900, align: 'center' }); ctx.restore(); }, NIGHT3],
  [47.6, 51, 'e5s11b', t => push(t, 47.6, 51, () => MirrorShot(t, tt => vestSeat(tt), { frost: .5 * (1 - win(t, 47.6, 50.4)) }), 580, 800, 1.05, 1.3), NIGHT3],
  [51, 55, 'e5s13', t => commission(t), NIGHT3],
  [55, 56.6, 'e5s14a', t => { windshield(t, .35); HandPhone(t, tt => PhoneScreen(tt, 'order', [['Следующий заказ:'], ['03:17', true]], 55.1), { cracked: true }); }, NIGHT3],
  [56.6, 57.7, 'e5s14b', t => push(t, 56.6, 57.7, () => MirrorShot(t, tt => { rearSeat(tt); seatbelt5(tt, 56.7); }), 540, 720, 1.1, 1.2), NIGHT3],
  [57.7, 59.01, 'e5s14c', t => { ENDCARD_AT = t; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.shadowColor = T.danger; ctx.shadowBlur = 30; txt('КОНЕЦ', CXC, 900, 120, T.danger, { weight: 900, align: 'center', alpha: E.out(win(t, 57.75, 58.1)) }); ctx.restore(); }, null],
];

// ───── субтитры по голосу ─────
const CAPS = buildCaptions([
  [0.0, 3.0, 'Регистратор Марата. **Ровно год назад**', { times: VT('e5s01'), whole: true, size: 56, maxW: 940 }],
  [3.0, 8.0, 'Его последний заказ. Получатель — **я**', { times: VT('e5s02') }],
  [8.0, 13.0, 'В ту ночь я разбился на **трассе**', { times: VT('e5s03') }],
  [13.0, 18.0, '— Это мой братишка. **Не повезу**', { times: VT('e5s04'), color: '#ffd9c2' }],
  [18.0, 22.0, 'Я выжил, потому что Марат **отменил** мою смерть', { times: VT('e5s05') }],
  [22.0, 27.0, 'Сегодня этот заказ **вернулся**', { times: VT('e5s06') }],
  [27.0, 32.0, '— Прости, братишка. Год — это **очень долго**', { times: VT('e5s07'), dead: true }],
  [32.0, 37.0, 'Довезу — умру. Отменю — стану **как он**', { times: VT('e5s08') }],
  [37.0, 42.0, 'Водителю платят **жизнью получателя**. А получатель — я', { times: VT('e5s09') }],
  [46.0, 51.0, 'Марат ушёл. Долг **закрыт**', { times: VT('e5s11') }],
  [51.0, 55.0, 'Только сервис взял свою **комиссию**', { times: VT('e5s13') }],
], { tail: .3 });
CAPS[0].a = 0; CAPS[0].words[0].t = 0;
window.CAPTION_PHRASES = CAPS;

function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore(); const k = 1 - win(t, a, a + .15); if (i > 0 && k > 0 && !['e5s14b'].includes(id)) { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); }
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(5, t, true); KineticCaption(t, CAPS); }

// ───── звук ─────
const M = 'projects/schetchik/assets/music-ep5.wav';
window.SFX_CUES = [
  // ретро-звук: акценты в сценах без своего звука (2026-11-05)
  { t: 22, type: 'engine', dur: 2.4, gain: .1 }, { t: 22, type: 'tires', dur: 2.4, gain: .07 },                    // такси в снегу
  { t: 40.05, type: 'lib', id: 'impact-deep-firm', gain: .45 },                                                      // «получатель — я»
  { t: 47.7, type: 'lib', id: 'bsb-car-door-outside', gain: .45, align: 'start', dur: 1.6 }, { t: 48, type: 'lib', id: 'bsb-wind-whistle-chimney', gain: .12, align: 'start', dur: 3 }, // Марат ушёл
  { t: 0, type: 'file', path: M, gain: .09, dur: 37 }, { t: 51, type: 'file', path: M, gain: .08, from: 51, dur: 8 }, // 37–50: аккорды вместо гула; тишина 50–51
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/schetchik/assets/vo/ep5/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 0, type: 'lib', id: 'bsb-vhs-playback', gain: .12, align: 'start', dur: 22 },                                       // tape_hiss под всей записью
  { t: 5.3, type: 'lib', id: 'notification-alert-clear', gain: .35, rate: .9 },                                             // ping на записи
  { t: 8, type: 'lib', id: 'bsb-car-turn-signal-loop', gain: .25, align: 'start', dur: 10 }, { t: 8, type: 'lib', id: 'bsb-wind-strong-outside', gain: .08, align: 'start', dur: 10 }, // hazard_tick, wind
  { t: 16.25, type: 'lib', id: 'click-button-firm', gain: .8 },                                                             // button_click
  { t: 18.8, type: 'lib', id: 'bsb-ice-crack-2', gain: .5, align: 'start', dur: 2 }, { t: 18.8, type: 'lib', id: 'digital-glitch-clear', gain: .45 }, // ice_crack, glitch
  { t: 24.35, type: 'lib', id: 'notification-alert-clear', gain: .5 },                                                      // ping
  { t: 27.2, type: 'lib', id: 'bsb-ice-crack-3', gain: .35, align: 'start', dur: 2 },                                       // ice_crack
  ...[32.2, 33.0, 33.8, 34.5, 35.2, 35.8, 36.4].map(t => ({ t, type: 'heartbeat', gain: .14 })),                            // heartbeat
  { t: 37, type: 'chord', notes: [45, 52, 57, 60], dur: 6, attack: 4.5, gain: .22 },                                         // первый нарастающий аккорд
  { t: 42.8, type: 'lib', id: 'click-button-firm', gain: .8 }, { t: 43.6, type: 'tone', freq: 1000, dur: 1.0, gain: .35 },  // нажатие, 1 с ровного писка
  { t: 46.1, type: 'chord', notes: [45, 49, 52, 57, 61], dur: 3.9, attack: 1.2, warm: 1, gain: .16 },                       // тёплый аккорд (мажор)
  { t: 51.6, type: 'lib', id: 'money-coin-drop', gain: .5, rate: .62 },                                                     // coin_distorted
  { t: 55.05, type: 'lib', id: 'notification-alert-clear', gain: .45 },
  { t: 57.4, type: 'lib', id: 'bsb-seatbelt-in', gain: 1.0, align: 'start', dur: .6 }, { t: 57.8, type: 'lib', id: 'notification-alert-clear', gain: .5 }, // belt_click (как в 1-й серии), ping
];
window.STORYBOARD = { episode: 5, title: 'Комиссия', duration: DUR, hud: { night: 3, temp: '−27°', balanceStart: '04:55:00' },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +b.toFixed(2), vo: c.length ? { speaker: id === 'e5s04' ? 'marat_record' : id === 'e5s07' ? 'marat' : 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: s.t })), hud: h ? { time: h.time, balance: h.balance === undefined ? null : h.balance } : null, overlays: a === 0 ? ['PartSticker:5:final', 'DashcamFrame'] : id === 'e5s14c' ? ['EndCard:КОНЕЦ'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
