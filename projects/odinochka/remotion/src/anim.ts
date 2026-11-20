// Плавность: пружины, кривые, шум покачивания, тряска. Всё от времени t (с) — детерминированно.
import { Easing, interpolate, spring } from 'remotion';
import { noise2D } from '@remotion/noise';
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const win = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const out = Easing.bezier(0.16, 1, 0.3, 1), io = Easing.bezier(0.65, 0, 0.35, 1);
export const ease = (t: number, a: number, b: number, e = out) => e(win(t, a, b));
// пружина от момента t0 (перелёт и успокоение) — для поз, жестов, появлений
export const spr = (t: number, t0: number, { damping = 12, mass = .6, stiffness = 120 } = {}) => t < t0 ? 0 : spring({ frame: (t - t0) * 30, fps: 30, config: { damping, mass, stiffness } });
export const noise = (seed: string, t: number, speed = 1) => noise2D(seed, t * speed, 0);
export const shake = (t: number, t0: number, amp = 8, dur = .6) => { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * 87) * amp * k, Math.cos((t - t0) * 61) * amp * k]; };
export const shakeMany = (t: number, list: [number, number, number][]) => list.reduce((a, [t0, amp, d]) => { const s = shake(t, t0, amp, d); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
export const handheld = (t: number, amp = 6, seed = 'hh') => [noise(seed + 'x', t, .9) * amp, noise(seed + 'y', t, .8) * amp, noise(seed + 'r', t, .5) * amp * .08];
export const blink = (t: number, seed = 1) => { const h = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }; const per = 2.6 + h(seed) * 2.4, ph = (t + h(seed + 7) * per) % per, d = .15; if (ph > d) return 1; return Math.abs(1 - 2 * ph / d) ** .7; };
export const mix = (a: string, b: string, k: number) => { const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
export { interpolate };
