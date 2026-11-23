// Таймлайн «FOR YOU». z — нырок в экран (1 — ролик на весь кадр, 0 — комната от первого лица). ra — сколько жизни прошло (0..1).
const DUR = 40, REAL_DUR = DUR; var CUR_T = 0;
const FEEDS = [                                   // все ролики разные (паркур A повторяется только на стыке петли)
  [0, ['A', 1.5], ['B', 1.1], ['C', 1.0]],
  [6.2, ['D', .85], ['E', .85], ['F', .85], ['G', .85]],
  [12.8, ['H', .6], ['I', .6], ['J', .6], ['K', .6], ['L', .6], ['M', .6]],
  [21.8, ...'NOPWRSTXV'.split('').map(k => [k, .42])],
];
const SW = .16;                                   // свайп
function feedAt(t) {                              // какой ролик на экране: {k, lt, k2, lt2, sw}
  if (t >= 37.0) return { k: 'A', lt: t - DUR, sw: 0 };
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
const ZK = [[0, 1], [3.6, 1], [4.4, 0], [5.4, 0], [6.2, 1], [9.6, 1], [10.2, 0], [12.0, 0], [12.8, 1], [16.4, 1], [17.0, 0], [21.0, 0], [21.8, 1], [25.6, 1], [26.2, 0], [30.6, 0], [31.4, .8], [33.4, .8], [34.2, 0], [37.4, 0], [DUR, 1]];
function zoomAt(t) { for (let i = 1; i < ZK.length; i++) if (t <= ZK[i][0]) { const [a, va] = ZK[i - 1], [b, vb] = ZK[i]; return lerp(va, vb, E.io(clamp((t - a) / (b - a)))); } return 1; }
const FACE = [[12.0, 12.8, .1], [21.0, 21.8, .45]];                 // крупно лицо (склейка)
const RA = [[0, 0], [10.2, 0], [11.8, .08], [17.0, .08], [21.0, .45], [26.2, .45], [30.4, 1], [DUR, 1]];
function raAt(t) { if (t >= 37.0) return 1; for (let i = 1; i < RA.length; i++) if (t <= RA[i][0]) { const [a, va] = RA[i - 1], [b, vb] = RA[i]; return lerp(va, vb, clamp((t - a) / (b - a))); } return 1; }
const lapse = t => (t > 10.2 && t < 11.8) || (t > 17 && t < 21) || (t > 26.2 && t < 30.4);
const DEAD = [30.4, 36.0];                                          // телефон сел
function screenTime(t) {                                            // значение счётчика
  if (t < 10.2) return `0:00:${String(Math.floor(t + 1)).padStart(2, '0')}`;
  if (t < 11.8) return `${Math.floor(lerp(0, 6, (t - 10.2) / 1.6))} HOURS`;
  if (t < 17) return '6 HOURS';
  if (t < 21) { const y = lerp(0, 9, ((t - 17) / 4) ** 1.5); return y < 1 ? `${Math.max(1, Math.floor(y * 12))} MONTHS` : `${Math.floor(y)} YEARS`; }
  if (t < 26.2) return '9 YEARS';
  return `${Math.floor(lerp(9, 47, clamp((t - 26.2) / 4.2)))} YEARS`;
}
const NOTES = [[10.4, 11.4, 'Mom', 'did you eat today?'], [17.3, 18.1, 'Gym bro', 'tomorrow 7am?'], [18.2, 19.0, 'Mia', 'happy birthday!! 🎂'], [19.1, 19.9, 'Friends', 'we’re at the beach ☀️'], [20.0, 20.8, 'Dad', 'call me back'], [26.5, 27.6, 'Mom', 'I miss you']];
