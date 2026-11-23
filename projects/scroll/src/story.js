// Таймлайн «FOR YOU». z — нырок в экран (1 — ролик на весь кадр, 0 — комната от первого лица). ra — сколько жизни прошло (0..1).
const DUR = 43, REAL_DUR = DUR; var CUR_T = 0;
const FEEDS = [                                   // все ролики разные (паркур A повторяется только на стыке петли)
  [0, ['A', 1.5], ['B', 1.1], ['C', 1.0]],
  [6.2, ['D', .85], ['E', .85], ['F', .85], ['G', .85]],
  [12.8, ['H', .6], ['I', .6], ['J', .6], ['K', .6], ['L', .6], ['M', .6]],
  [21.8, ...'NOPWRSTX'.split('').map(k => [k, .47])],
];
const SW = .16;                                   // свайп
function feedAt(t) {                              // какой ролик на экране: {k, lt, k2, lt2, sw}
  if (t >= 40.6) return { k: 'A', lt: t - DUR, sw: 0 };
  for (const [t0, ...cl] of FEEDS) {
    let tt = t0;
    for (let i = 0; i < cl.length; i++) {
      const [k, d] = cl[i];
      if (t < tt + d) {
        const lt = t - tt, sw = i > 0 && lt < SW ? lt / SW : 0;
        return sw > 0 ? { k, lt, sw, k2: cl[i - 1][0], lt2: lt + cl[i - 1][1] } : { k, lt: t0 === 0 && i === 0 ? t : lt, sw: 0 };
      }
      tt += d;
    }
  }
  return { k: 'A', lt: 0, sw: 0, off: true };
}
const ZK = [[0, 1], [3.6, 1], [4.4, 0], [5.4, 0], [6.2, 1], [9.6, 1], [10.2, 0], [12.0, 0], [12.8, 1], [16.4, 1], [17.0, 0], [21.0, 0], [21.8, 1], [25.6, 1], [26.2, 0], [30.6, 0], [31.4, 1], [34.4, 1], [35.2, 0], [40.6, 0], [DUR, 1]];
function zoomAt(t) { for (let i = 1; i < ZK.length; i++) if (t <= ZK[i][0]) { const [a, va] = ZK[i - 1], [b, vb] = ZK[i]; return lerp(va, vb, E.io(clamp((t - a) / (b - a)))); } return 1; }
const FACE = [[12.0, 12.8, .1], [21.0, 21.8, .45]];                 // крупно лицо (склейка)
// ЕДИНОЕ ВРЕМЯ: сколько часов прошло с 23:59 первой ночи. От него — счётчик, календарь, часы, телефон, возраст, пёс, цветок.
const HY = 8766;                                                     // часов в году
const END_H = 17167 * 24;                                            // ≈47 лет ровно в сутках → в конце снова 23:59 (петля)
const EK = [[0, 0], [10.2, 10.2 / 3600], [11.8, 6], [12.8, 6], [16.4, 6.4], [17.0, 6.4], [21.0, 9 * HY], [21.8, 9 * HY], [25.6, 9.3 * HY], [26.2, 9.3 * HY], [30.4, END_H]];
function elapsed(t) {
  if (t >= 30.4) return END_H;                                       // до самого стыка — 2073, комната старая
  for (let i = 1; i < EK.length; i++) if (t <= EK[i][0]) { const [a, va] = EK[i - 1], [b, vb] = EK[i], u = clamp((t - a) / (b - a));
    return va > 1000 || vb > 1000 ? Math.exp(lerp(Math.log(va + 1), Math.log(vb + 1), u)) - 1 : lerp(va, vb, u); }
  return END_H;
}
const yearsAt = t => elapsed(t) / HY;
function raAt(t) { return clamp(yearsAt(t) / 47); }
function phoneClock(t) { const m = Math.floor((23 * 60 + 59 + elapsed(t) * 60) % 1440); return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
const lapse = t => (t > 10.2 && t < 11.8) || (t > 17 && t < 21) || (t > 26.2 && t < 30.4);
const DEAD = [30.4, 39.0];                                          // телефон сел
function screenTime(t) {                                            // экранное время = прошедшее время (он ничего другого не делал)
  const h = elapsed(t), y = h / HY;
  if (h < 1) { const sec = Math.floor(h * 3600) + 1; return `0:${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }
  if (h < 48) return `${Math.floor(h)} HOURS`;
  if (h < 24 * 60) return `${Math.floor(h / 24)} DAYS`;
  if (y < 1) return `${Math.floor(h / 730)} MONTHS`;
  return `${Math.floor(y)} YEAR${Math.floor(y) > 1 ? 'S' : ''}`;
}
const NOTES = [[10.4, 11.4, 'Mom', 'did you eat today?'], [17.1, 18.05, 'Mia', 'happy birthday!! 🎂'], [18.1, 19.05, 'Friends', 'we’re at the beach ☀️'], [19.1, 20.05, 'Dad', 'call me back'], [26.4, 27.6, 'Mom', 'I miss you'], [27.8, 29.3, 'Mom', '⚠ number no longer in service']];
