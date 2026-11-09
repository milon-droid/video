// «Звёзды 2026»: 10 с, три плана. A — Вини чеканит и бьёт в камеру (0–3,6), B — Сэди позирует под вспышками (3,6–7,6),
// C — пас Вини → Сэди останавливает мяч каблуком, общая поза и титр (7,6–10). Звук — public/stars-mix.wav.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, lerp, noise, shake, spr } from '../anim';
import { blendPose, Limb, Pose, POSES } from '../chars/Person';
import { Glow } from '../bg/Bg';
import { Cam } from '../ui/Ui';
import { FONT } from '../theme';
import { Ball, legPts, Sadie, smooth, Vini } from './Stars';

export const STARS_FRAMES = 300;
export const T_B = 3.6, T_C = 7.6, T_STRIKE = 3.0;
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);
const track = (t: number, keys: [number, Partial<Pose>][]) => { let i = 0; while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  const [a, pa] = keys[i], [b, pb] = keys[i + 1]; return blendPose(full(pa), full(pb), smooth(a, b, t)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rotAround = (p: [number, number], c: [number, number], a: number): [number, number] => { const dx = p[0] - c[0], dy = p[1] - c[1], cs = Math.cos(a), sn = Math.sin(a); return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; };
// центр мяча над подъёмом стопы / над коленом (локальные координаты фигуры)
const footTop = (side: -1 | 1, l: Limb, lean = 0): [number, number] => { const { an } = legPts(side, l), th = -(l[0] + l[1]);
  const p: [number, number] = [an[0] + side * 26 * Math.cos(th) + 14 * Math.sin(th), an[1] + side * 26 * Math.sin(th) - 14 * Math.cos(th) - 36]; return rotAround(p, [0, -268], lean * 57 * Math.PI / 180); };
const kneeTop = (side: -1 | 1, l: Limb): [number, number] => { const { kn } = legPts(side, l); return [kn[0], kn[1] - 58]; };

// ───── фон: ночной стадион ─────
const Stadium: React.FC<{ t: number; flash?: number }> = ({ t, flash = 0 }) => (<g>
  <defs><linearGradient id="sdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040817" /><stop offset=".7" stopColor="#14275a" /><stop offset="1" stopColor="#2a3f7a" /></linearGradient>
    <linearGradient id="sdPitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f8a4a" /><stop offset="1" stopColor="#14502a" /></linearGradient>
    <linearGradient id="sdBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff2ff" stopOpacity=".32" /><stop offset="1" stopColor="#dff2ff" stopOpacity="0" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#sdSky)" />
  {/* трибуны в два яруса со зрителями и вспышками телефонов */}
  <path d="M-40,760 Q540,640 1120,760 L1120,1180 L-40,1180 Z" fill="#0d1430" />
  <path d="M-40,960 Q540,880 1120,960 L1120,1000 Q540,920 -40,1000 Z" fill="#1d2a55" />
  {Array.from({ length: 260 }, (_, i) => { const x = hash(i) * 1120 - 20, row = hash(i * 3.1), y = 780 + row * 380 - Math.sin(x / 1080 * Math.PI) * 90 * (1 - row * .5);
    const c = ['#3a4a8a', '#5a3a6a', '#2a4a6a', '#6a5a3a', '#e8e8f0'][i % 5], tw = hash(i * 9 + Math.floor(t * 6)) > .985 ? 1 : 0;
    return <g key={i}><circle cx={x} cy={y} r={7 + row * 4} fill={c} opacity={.55} />{tw > 0 && <circle cx={x} cy={y - 6} r={5} fill="#fff" />}</g>; })}
  {/* прожекторы */}
  {[150, 930].map((x, j) => <g key={x}>
    <path d={`M${x - 70},560 L${x - 260 + j * 520},1800 L${x + 260 - j * 520 + (j ? -200 : 200)},1800 L${x + 70},560 Z`} fill="url(#sdBeam)" opacity={.55 + .15 * Math.sin(t * 3 + j)} />
    <rect x={x - 6} y={600} width={12} height={180} fill="#0a0f22" /><rect x={x - 80} y={500} width={160} height={100} rx={8} fill="#1a2240" />
    {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x - 70 + (k % 4) * 36} y={510 + Math.floor(k / 4) * 46} width={30} height={38} rx={5} fill="#f4fbff" />)}
    <Glow x={x} y={550} r={360} c="#cfe8ff" o={.8} id={'fl' + j} /></g>)}
  {/* газон: полосы стрижки, разметка */}
  <rect y={1170} width={1080} height={750} fill="url(#sdPitch)" />
  {Array.from({ length: 7 }, (_, i) => { const y0 = 1170 + (i * i) * 16 + i * 30, y1 = 1170 + ((i + 1) * (i + 1)) * 16 + (i + 1) * 30;
    return i % 2 ? <rect key={i} y={y0} width={1080} height={y1 - y0} fill="#ffffff" opacity={.05} /> : null; })}
  <path d="M-40,1228 L1120,1228" stroke="#e8f4ea" strokeWidth={6} opacity={.7} />
  <ellipse cx={540} cy={1500} rx={620} ry={150} fill="none" stroke="#e8f4ea" strokeWidth={7} opacity={.45} />
  <Glow x={540} y={1500} r={600} c="#bfe8c8" o={.25 + flash * .4} id="pitchGlow" />
</g>);

// ───── фон: красная дорожка, стена с логотипами-звёздами, фотографы ─────
const STAR = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return `${i ? 'L' : 'M'}${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ') + 'Z';
const PHOTOGS: [number, number, number][] = [[70, 1150, 1], [230, 1215, .9], [120, 1300, 1.05], [1010, 1150, 1], [850, 1215, .9], [960, 1300, 1.05]];
const flashAt = (t: number, beats: number[], i: number) => beats.reduce((m, b) => { const t0 = b + hash(i * 5 + b) * .12; return t >= t0 ? Math.max(m, clamp(1 - (t - t0) / .22)) : m; }, 0);
const RedCarpet: React.FC<{ t: number; beats: number[] }> = ({ t, beats }) => (<g>
  <defs><linearGradient id="rcWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0812" /><stop offset="1" stopColor="#4a1426" /></linearGradient>
    <linearGradient id="rcFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a1424" /><stop offset="1" stopColor="#c42a3a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#rcWall)" />
  {Array.from({ length: 6 * 9 }, (_, i) => { const cx = 90 + (i % 6) * 180 + (Math.floor(i / 6) % 2) * 90, cy = 120 + Math.floor(i / 6) * 130;
    return <path key={i} d={STAR(cx, cy, 28)} fill="#e8c46a" opacity={.16} />; })}
  <Glow x={540} y={760} r={620} c="#ffb0c0" o={.55} id="rcBack" />
  {/* дорожка в перспективе */}
  <path d="M300,1260 L780,1260 L1180,1920 L-100,1920 Z" fill="url(#rcFloor)" />
  <rect y={1240} width={1080} height={24} fill="#12060c" opacity={.7} />
  {/* стойки с бархатными канатами */}
  {[[250, 1290], [120, 1520], [830, 1290], [960, 1520]].map(([x, y], i) => <g key={i}><rect x={x - 7} y={y - 150} width={14} height={150} fill="#e8c46a" /><circle cx={x} cy={y - 156} r={14} fill="#f4d88a" /><ellipse cx={x} cy={y} rx={30} ry={8} fill="#b8943a" /></g>)}
  <path d="M250,1150 Q190,1230 120,1380" stroke="#6a0a1a" strokeWidth={14} fill="none" /><path d="M830,1150 Q890,1230 960,1380" stroke="#6a0a1a" strokeWidth={14} fill="none" />
  {/* фотографы-силуэты и их вспышки */}
  {PHOTOGS.map(([x, y, k], i) => { const f = flashAt(t, beats, i), sd = x < 540 ? 1 : -1, bob = noise('ph' + i, t, .8) * 6;
    return (<g key={i} transform={`translate(${x},${y + bob}) scale(${k})`}>
      <path d="M-70,200 Q-74,40 -30,20 L30,20 Q74,40 70,200 Z" fill="#0c0a10" /><circle cx={0} cy={-10} r={38} fill="#0c0a10" />
      <rect x={sd * 20 - 30} y={-40} width={60} height={42} rx={8} fill="#1c1a22" /><rect x={sd * 34 - 10} y={-62} width={20} height={20} fill="#2a2830" />
      {f > 0 && <><Glow x={sd * 34} y={-56} r={230 * f + 40} c="#ffffff" o={f} id={'pf' + i} /><circle cx={sd * 34} cy={-56} r={16} fill="#fff" opacity={f} /></>}</g>); })}
</g>);

const Confetti: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => { if (t < t0) return null; const u = t - t0;
  return <g>{Array.from({ length: 70 }, (_, i) => { const x = hash(i) * 1080 + Math.sin(u * 3 + i) * 30, y = -40 + (hash(i * 2) * 300 + u * (380 + hash(i * 3) * 260)), c = ['#ffd23f', '#ff5a7a', '#4ad0ff', '#7dffb0', '#ffffff'][i % 5];
    return <rect key={i} x={x} y={y} width={16} height={26} rx={3} fill={c} transform={`rotate(${u * 300 * (hash(i * 7) - .5) + i * 40} ${x + 8} ${y + 13})`} />; })}</g>; };

// ───── подпись-бирка ─────
const NameTag: React.FC<{ t: number; t0: number; x: number; y: number; name: string; sub: string; col: string }> = ({ t, t0, x, y, name, sub, col }) => { if (t < t0) return null; const k = spr(t, t0, { damping: 11, stiffness: 160 });
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(${(1 - k) * -60}px)`, opacity: clamp(k * 1.5), background: 'rgba(14,12,22,.82)', borderLeft: `10px solid ${col}`, borderRadius: 14, padding: '12px 24px', fontFamily: FONT, color: '#fbf8f2' }}>
    <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.05, letterSpacing: 1 }}>{name}</div><div style={{ fontSize: 30, fontWeight: 800, color: col, marginTop: 4 }}>{sub}</div></div>; };

// ═════════ план A: Вини ═════════
const VX = 540, VY = 1530, VS = 1.12;
const KR: Partial<Pose> = { legR: [.9, -1.4], legL: [-.04, .06], armL: [-.7, .5], armR: [.45, -.5] };
const FR: Partial<Pose> = { legR: [.55, .35], legL: [-.04, .06], armL: [-.75, .45], armR: [.4, -.4] };
const FLp: Partial<Pose> = { legL: [-.55, -.35], legR: [.04, -.06], armL: [-.4, .4], armR: [.75, -.45] };
const KL: Partial<Pose> = { legL: [-.9, 1.4], legR: [.04, -.06], armL: [-.45, .5], armR: [.7, -.5] };
const BAL: Partial<Pose> = { armL: [-.5, .35], armR: [.5, -.35] };
const WIND: Partial<Pose> = { legR: [-.4, -1.25], legL: [-.1, .12], armL: [-1.25, .3], armR: [1.0, .3], lean: -.06 };
const STRIKE: Partial<Pose> = { legR: [1.2, .05], legL: [-.12, .1], armL: [-1.6, .25], armR: [.35, .3], lean: -.14 };
const FOLLOW: Partial<Pose> = { legR: [1.5, .1], legL: [-.14, .1], armL: [-1.7, .2], armR: [.3, .3], lean: -.16 };
const CELEB: Partial<Pose> = { legR: [.3, -.1], legL: [-.1, .05], armL: [-2.6, .3], armR: [2.6, -.3], lean: -.04 };
const V_KEYS: [number, Partial<Pose>][] = [[0, BAL], [.25, BAL], [.45, KR], [.55, KR], [.75, BAL], [.95, FR], [1.15, BAL], [1.25, BAL], [1.45, FLp], [1.65, BAL], [1.75, BAL], [1.95, KL], [2.15, BAL],
  [2.22, BAL], [2.4, FR], [2.55, BAL], [2.6, BAL], [2.85, WIND], [3.0, STRIKE], [3.25, FOLLOW], [3.45, CELEB], [3.6, CELEB]];
const CONTACTS: [number, [number, number], number][] = [[.45, kneeTop(1, KR.legR!), 220], [.95, footTop(1, FR.legR!), 250], [1.45, footTop(-1, FLp.legL!), 240], [1.95, kneeTop(-1, KL.legL!), 210],
  [2.4, footTop(1, FR.legR!), 560], [T_STRIKE, footTop(1, STRIKE.legR!, STRIKE.lean), 0]];
const ballLocal = (t: number): [number, number] => { const [t1, p1] = CONTACTS[0];
  if (t < t1) { const k = clamp(t / t1); return [lerp(-30, p1[0], k), lerp(-1500, p1[1], k * k)]; }
  let i = 0; while (i < CONTACTS.length - 2 && t >= CONTACTS[i + 1][0]) i++; const [a, pa, h] = CONTACTS[i], [b, pb] = CONTACTS[i + 1], k = clamp((t - a) / (b - a));
  return [lerp(pa[0], pb[0], k), lerp(pa[1], pb[1], k) - 4 * h * k * (1 - k)]; };
const ShotA: React.FC<{ t: number }> = ({ t }) => {
  const pose = track(t, V_KEYS), sh = shake(t, T_STRIKE, 16, .45), z = 1.03 + .05 * smooth(0, 3, t);
  const bl = ballLocal(Math.min(t, T_STRIKE)), bw: [number, number] = [VX + bl[0] * VS, VY + bl[1] * VS];
  const fk = clamp((t - T_STRIKE) / .5), fly = t > T_STRIKE;
  const bx = fly ? lerp(bw[0], 560, fk ** 1.4) : bw[0], by = fly ? lerp(bw[1], 900, fk ** 1.4) : bw[1], br = fly ? lerp(34 * VS, 1500, fk ** 2.6) : 34 * VS;
  const eye: [number, number] = fly ? [.1, .2] : [clamp(bl[0] / 220, -1, 1), clamp((bl[1] + 610) / 260, -1, 1)];
  const ring = clamp((t - T_STRIKE) / .28);
  return (<>
    <Cam z={z} fy={1200} dx={sh[0]} dy={sh[1] - 60}>
      <Stadium t={t} flash={clamp(1 - Math.abs(t - T_STRIKE) / .2)} />
      <Vini x={VX} y={VY} s={VS} t={t} pose={pose} expr={t > T_STRIKE + .1 ? 'happy' : 'determined'} teeth={t > T_STRIKE + .1} mouth={t > T_STRIKE + .1 ? .15 : 0} eye={eye} headTilt={t > T_STRIKE + .2 ? -4 : 0} />
      {t > T_STRIKE && ring < 1 && <circle cx={bw[0]} cy={bw[1]} r={40 + ring * 170} fill="none" stroke="#fff" strokeWidth={22 * (1 - ring)} opacity={1 - ring} />}
    </Cam>
    {fly && Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2 + .2, r0 = 260 + fk * 300, r1 = r0 + 180 + fk * 400;
      return <path key={i} d={`M${560 + Math.cos(a) * r0},${900 + Math.sin(a) * r0} L${560 + Math.cos(a) * r1},${900 + Math.sin(a) * r1}`} stroke="#fff" strokeWidth={8} opacity={.5 * (1 - fk * .5)} strokeLinecap="round" />; })}
    <Cam z={fly ? 1 : z} fy={1200} dx={fly ? 0 : sh[0]} dy={fly ? 0 : sh[1] - 60}><Ball x={bx} y={by} r={br} rot={t * (fly ? 1400 : 520)} /></Cam>
  </>); };

// ═════════ план B: Сэди ═════════
const S_BEATS = [.05, 1.0, 2.1, 3.15];
const HIP_L: Limb = [-.7, 1.32], HIP_R: Limb = [.7, -1.32];
const S_POSES: Partial<Pose>[] = [
  { armL: HIP_L, armR: [2.55, .45], legL: [-.04, .03], legR: [.16, -.16], lean: .02 },          // машет в камеру
  { armL: HIP_L, armR: [2.4, 1.27], legL: [-.14, .1], legR: [.06, -.02], lean: -.04 },          // рука в волосах
  { armL: HIP_L, armR: HIP_R, legL: [-.04, .02], legR: [.24, -.22], lean: .03 },                // руки на талии
  { armL: [-2.4, -1.27], armR: HIP_R, legL: [-.2, .18], legR: [.05, -.03], lean: .05 },         // другая рука в волосах
];
const S_LOOK: { expr: any; tilt: number; eye: [number, number] }[] = [{ expr: 'happy', tilt: 0, eye: [0, .05] }, { expr: 'smug', tilt: -8, eye: [.25, 0] }, { expr: 'happy', tilt: 6, eye: [0, 0] }, { expr: 'cool', tilt: 9, eye: [-.25, .05] }];
const ShotB: React.FC<{ t: number }> = ({ t }) => { let i = 0; while (i < S_BEATS.length - 1 && t >= S_BEATS[i + 1]) i++;
  const prev = full(S_POSES[Math.max(0, i - 1)]), cur = full(S_POSES[i]), k = i === 0 ? 1 : spr(t, S_BEATS[i], { damping: 10, stiffness: 170 });
  let pose = blendPose(prev, cur, k); if (i === 0) pose = { ...pose, armR: [2.55 + Math.sin(t * 11) * .18, .45 + Math.sin(t * 11 + 1) * .3] };
  const L = S_LOOK[i], z = 1.0 + .07 * smooth(0, 4, t), hx = noise('hhB', t, .7) * 6;
  return (<Cam z={z} fy={1150} dx={hx} dy={-40}>
    <RedCarpet t={t} beats={S_BEATS} />
    <Sadie x={540} y={1585} s={1.18} t={t} pose={pose} expr={L.expr} eye={L.eye} headTilt={lerp(S_LOOK[Math.max(0, i - 1)].tilt, L.tilt, k)} />
  </Cam>); };

// ═════════ план C: вместе ═════════
const PASS = .2, ROLL_END = 1.0, POSE_C = 1.15;
const SADIE_STOP: Limb = [-1.1, .7];
const ShotC: React.FC<{ t: number }> = ({ t }) => {
  const vs = .95, vX = 330, sX = 770, Y = 1575;
  const vPose = track(t, [[0, { legR: [.06, -.04], armL: [-.4, .3], armR: [.35, -.3] }], [PASS, { legR: [-.35, -.5], armL: [-.6, .3], armR: [.6, -.3] }], [PASS + .15, { legR: [.55, 0], armL: [-.5, .3], armR: [.3, -.3] }],
    [.65, { legR: [.06, -.04], armL: [-.3, .3], armR: [.3, -.3] }], [POSE_C, { legR: [.06, -.04], armL: [-.3, .3], armR: [.3, -.3] }], [POSE_C + .25, { legR: [.2, -.1], legL: [-.12, .05], armL: [-2.6, .3], armR: [1.55, -.1], lean: -.03 }], [3, { legR: [.2, -.1], legL: [-.12, .05], armL: [-2.6, .3], armR: [1.55, -.1], lean: -.03 }]]);
  const sPose = track(t, [[0, { armL: HIP_L, armR: [.12, -.15] }], [.7, { armL: [-.5, .3], armR: [.3, -.2] }], [.92, { legL: SADIE_STOP, armL: [-.9, .3], armR: [.5, -.4], lean: .04 }],
    [POSE_C, { legL: SADIE_STOP, armL: [-.9, .3], armR: [.5, -.4], lean: .04 }], [POSE_C + .25, { legL: SADIE_STOP, armL: HIP_L, armR: [2.55, .45], lean: .02 }], [3, { legL: SADIE_STOP, armL: HIP_L, armR: [2.55, .45], lean: .02 }]]);
  if (t > POSE_C + .25) sPose.armR = [2.55 + Math.sin(t * 11) * .18, .45 + Math.sin(t * 11 + 1) * .3];
  const stop = footTop(-1, SADIE_STOP, .04), x0 = vX + 92 * vs, x1 = sX + stop[0] * vs, k = smooth(PASS + .1, ROLL_END, t) ** .8;
  const bx = t < PASS + .1 ? x0 : lerp(x0, x1, k), by = Y - 34 * vs, flash = Math.max(0, ...[POSE_C + .2, POSE_C + .6, POSE_C + .95].map(b => t >= b ? clamp(1 - (t - b) / .2) : 0));
  const z = 1.0 + .05 * smooth(0, 2.4, t);
  return (<>
    <Cam z={z} fy={1250} dy={-40}>
      <Stadium t={t + 5} flash={flash} />
      <Glow x={540} y={1100} r={700} c="#ffd0e0" o={.35} id="cGlow" />
      <Vini x={vX} y={Y} s={vs} t={t + 4} pose={vPose} expr={t > POSE_C ? 'happy' : 'determined'} teeth={t > POSE_C} eye={t < POSE_C ? [clamp((bx - vX) / 300, -1, 1), .9] : [.2, .1]} />
      <Sadie x={sX} y={Y} s={vs} t={t + 4} pose={sPose} expr={t > POSE_C ? 'happy' : 'neutral'} eye={t < POSE_C ? [-.8, .9] : [-.1, .05]} headTilt={t > POSE_C ? 6 : 0} />
      <Ball x={bx} y={by} r={34 * vs} rot={(bx - x0) * 1.6} />
      <Confetti t={t} t0={POSE_C} />
    </Cam>
    {flash > 0 && <rect width={1080} height={1920} fill="#fff" opacity={flash * .22} />}
  </>); };

const Title: React.FC<{ t: number }> = ({ t }) => { const t0 = T_C + POSE_C; if (t < t0) return null; const k = spr(t, t0, { damping: 9, stiffness: 180 });
  return <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', transform: `scale(${k})`, fontFamily: FONT, fontWeight: 900 }}>
    <div style={{ fontSize: 120, color: '#fff', lineHeight: 1, WebkitTextStroke: '14px #14121c', paintOrder: 'stroke fill', textShadow: '0 12px 0 #14121c, 0 0 40px #ff5a7a' }}>SADIE <span style={{ color: '#ffd23f' }}>×</span> VINI</div>
    <div style={{ marginTop: 18 }}><span style={{ background: '#ffd23f', color: '#14121c', fontSize: 52, padding: '6px 26px', borderRadius: 12 }}>2026</span></div></div>; };

export const StarsClip: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const f = useCurrentFrame(), { fps, width } = useVideoConfig(), t = f / fps;
  const wB = t >= T_B ? clamp(1 - (t - T_B) / .4) : 0, wC = t >= T_C ? clamp(1 - (t - T_C) / .3) : 0, wA = clamp((t - (T_B - .12)) / .12);
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {t < T_B ? <ShotA t={t} /> : t < T_C ? <ShotB t={t - T_B} /> : <ShotC t={t - T_C} />}
        <defs><radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" /></radialGradient></defs>
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
      {t < T_B && <NameTag t={t} t0={.55} x={60} y={210} name="VINÍCIUS JR." sub="№7 · 2026" col="#ffd23f" />}
      {t >= T_B && t < T_C && <NameTag t={t - T_B} t0={.45} x={60} y={210} name="SADIE SINK" sub="2026" col="#ff5a7a" />}
      <Title t={t} />
      {/* вспышка-переход: мяч в объектив → вспышка фотокамеры */}
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(wA * (t < T_B ? 1 : 0), wB, wC * .7), pointerEvents: 'none' }} />
    </div>{audio && <Audio src={staticFile('stars-mix.wav')} />}</AbsoluteFill>); };
