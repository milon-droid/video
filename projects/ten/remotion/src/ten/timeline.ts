// Монтажный лист серии 1: id, длительность (с). Старт плана = сумма предыдущих.
export const SHOTS: { id: string; d: number }[] = [
  { id: 'S1', d: 3.2 }, { id: 'S2', d: 4.0 }, { id: 'S3', d: 5.2 }, { id: 'S4', d: 6.0 }, { id: 'S5', d: 4.0 }, { id: 'S6', d: 5.0 },
  { id: 'S7', d: 4.8 }, { id: 'S8', d: 5.0 }, { id: 'S9', d: 5.0 }, { id: 'S10', d: 5.0 },
  { id: 'S11', d: 6.0 }, { id: 'S12', d: 6.0 }, { id: 'S13', d: 5.2 }, { id: 'S14', d: 2.2 }, { id: 'S15', d: 4.4 }, { id: 'S16', d: 2.6 },
];
export const starts = SHOTS.reduce<number[]>((a, s, i) => (a.push(i ? a[i - 1] + SHOTS[i - 1].d : 0), a), []);
export const TOTAL = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].d;
