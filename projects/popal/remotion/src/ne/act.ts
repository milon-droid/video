// Актёрская игра по ключам: K — число, PK — поза. Между ключами — плавный вход-выход или перелёт (bk) для резких жестов.
import { Pose, POSES } from '../chars/Person';
const io = (k: number) => k * k * (3 - 2 * k);
const back = (k: number) => { const c = 2.0; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
export const K = (t: number, ks: [number, number][], bk = false) => { if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const k = (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]); return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * (bk ? back(k) : io(k)); }
  return ks[ks.length - 1][1]; };
export type PP = Partial<Pose>;
export const PK = (t: number, ks: [number, PP][], bk = true): Pose => { const f = (p: PP) => ({ ...POSES.stand, ...p } as Pose);
  if (t <= ks[0][0]) return f(ks[0][1]);
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const k0 = (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]), k = bk ? back(k0) : io(k0), a = f(ks[i - 1][1]), b = f(ks[i][1]);
    const L = (x: [number, number], y: [number, number]): [number, number] => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k];
    return { armL: L(a.armL, b.armL), armR: L(a.armR, b.armR), legL: L(a.legL, b.legL), legR: L(a.legR, b.legR), lean: (a.lean ?? 0) + ((b.lean ?? 0) - (a.lean ?? 0)) * k, hip: (a.hip ?? 0) + ((b.hip ?? 0) - (a.hip ?? 0)) * k }; }
  return f(ks[ks.length - 1][1]); };
