// «Блэкаут» с.1 v4 — перекладные герои из PNG пользователя (нарезка tools/cut4.py → public/v4/<id>/*.png, cutData.json).
// Внешность — пиксель в пиксель из картинки; двигаются голова, плечо, предплечье с кистью (цепь плечо → локоть → кисть),
// у сидящего профиля — бедро и голень. Предмет в руке рисуется в координатах кисти и движется вместе с ней.
import React from 'react';
import { staticFile } from 'remotion';
import { clamp, noise } from '../anim';
import DATA from './cutData.json';

type CD = { view: string; W: number; H: number; top: number; foot: number; cx: number; parts: Record<string, number[]>; piv: Record<string, number[]> };
const D = DATA as unknown as Record<string, CD>;
export type FigId = 'alik' | 'beka' | 'dias' | 'alikP' | 'bekaP' | 'diasP';

// лицо (пиксели исходника): глаза [x, y, rx, ry], рот [x, y, полуширина], брови, кожа
const FACE: Record<string, { eyes: number[][]; m: number[]; br?: number[][]; skin: string; brow: string; lip: string }> = {
  alik: { eyes: [[403, 221, 22, 11], [489, 221, 22, 11]], m: [445, 301, 26], br: [[401, 194], [494, 194]], skin: '#e2a07a', brow: '#2a1a12', lip: '#8a4a3a' },
  beka: { eyes: [[395, 277, 21, 10], [483, 277, 21, 10]], m: [442, 357, 26], br: [[400, 252], [487, 252]], skin: '#cf9068', brow: '#1a1210', lip: '#7a4434' },
  dias: { eyes: [[474, 264, 19, 9], [550, 264, 19, 9]], m: [512, 334, 25], skin: '#e3ad8b', brow: '#1a1414', lip: '#a05a4e' },
};
// профиль (смотрит влево): глаз и рот
const PFACE: Record<string, { eye: number[]; m: number[]; skin: string }> = {
  alikP: { eye: [360, 208, 9, 8], m: [332, 282, 12], skin: '#e2a07a' },
};

type M = [number, number, number, number, number, number];
const mul = (m: M, n: M): M => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const tr = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const rot = (deg: number, cx = 0, cy = 0): M => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return mul(tr(cx, cy), mul([c, s, -s, c, 0, 0], tr(-cx, -cy))); };
const scl = (sx: number, sy: number, cx = 0, cy = 0): M => mul(tr(cx, cy), mul([sx, 0, 0, sy, 0, 0], tr(-cx, -cy)));
export const ap = (m: M, p: number[]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const ms = (m: M) => `matrix(${m.map(v => +v.toFixed(4)).join(' ')})`;
// укорочение вдоль оси сегмента (рука к камере / от камеры)
const along = (a: number[], b: number[], k: number): M => { if (k === 1) return [1, 0, 0, 1, 0, 0]; const ang = Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI; return mul(rot(-ang, a[0], a[1]), mul(scl(1, k, a[0], a[1]), rot(ang, a[0], a[1]))); };

// рука: [плечо°, локоть°] — положительный угол ведёт кисть к середине тела (для обеих сторон); fu/ff — укорочение плеча/предплечья
export type Arm = { u: number; f: number; fu?: number; ff?: number };
export type Hold = 'phone' | 'phoneEar' | 'iron' | 'remote' | 'flash' | null;
export type FigProps = {
  id: FigId; x: number; y: number; s: number; t: number; flip?: boolean;
  L?: Arm; R?: Arm; head?: number; nod?: number; lean?: number; bob?: number;
  mouth?: number; o?: number; smile?: number; brows?: number; worry?: number; lid?: number; noBlink?: boolean; look?: number;
  holdL?: Hold; holdR?: Hold; screen?: number; // свет экрана телефона 0…1
  dark?: number; // 0 — свет в комнате, 1 — блэкаут (силуэт тёмный, свет только от телефона)
  sit?: number; // профиль: 0 стоит, 1 сидит
  opacity?: number; shadow?: number;
  phoneMid?: boolean; // телефон двумя руками перед грудью (одна держит, большой палец другой листает)
  thumb?: number;     // 0…1 — прокрутка большим пальцем
  only?: 'body' | 'arms'; // слой: корпус с головой или только руки с предметами (доска между ними)
};
const REST: Arm = { u: 0, f: 0 };

export const figKin = (p: FigProps) => {
  const d = D[p.id], P = d.piv, t = p.t;
  const br = Math.sin(t * 2.2 + p.id.length) * 1;               // дыхание
  const lean = p.lean ?? 0;
  const base: M = mul(rot(lean, d.cx, d.foot), tr(0, (p.bob ?? 0)));
  const torso: M = mul(base, scl(1, 1 + br * .0025, d.cx, d.foot));
  const hn = (p.head ?? 0) + (p.look ?? 0) * 3 + noise(p.id + 'h', t, .35) * 1.6;
  const head: M = mul(mul(torso, tr(0, br * .8 + (p.nod ?? 0))), rot(hn, P.neck[0], P.neck[1]));
  const arm = (sd: 'L' | 'R') => {
    const a = (sd === 'L' ? p.L : p.R) ?? REST, sg = sd === 'L' ? -1 : 1;
    const S = P['S' + sd], E = P['E' + sd], Wr = P['W' + sd], Hd = P['H' + sd];
    const u: M = mul(mul(torso, rot(sg * a.u, S[0], S[1])), along(S, E, a.fu ?? 1));
    const E2 = ap(u, E);
    const f: M = mul(mul(tr(E2[0] - E[0], E2[1] - E[1]), rot(sg * (a.u + a.f), E[0], E[1])), along(E, Hd, a.ff ?? 1));
    const hand = ap(f, [(Wr[0] + Hd[0]) / 2, Wr[1] * .45 + Hd[1] * .55]);
    return { u, f, hand, ang: sg * (a.u + a.f) };
  };
  const root = `translate(${p.x},${p.y}) scale(${(p.flip ? -1 : 1) * p.s},${p.s}) translate(${-d.cx},${-d.foot})`;
  const rootM: M = mul(mul(tr(p.x, p.y), scl((p.flip ? -1 : 1) * p.s, p.s)), tr(-d.cx, -d.foot));
  return { d, P, torso, head, arm, root, rootM };
};
// кисть в координатах сцены
export const handAt = (p: FigProps, sd: 'L' | 'R' = 'R') => { const k = figKin(p); if (k.d.view !== 'front') return [p.x, p.y] as [number, number]; return ap(k.rootM, k.arm(sd).hand); };

const img = (id: string, k: string, m?: M) => { const [x, y, w, h] = D[id].parts[k]; return <image key={k} href={staticFile(`v4/${id}/${k}.png`)} x={x} y={y} width={w} height={h} transform={m ? ms(m) : undefined} />; };

// мигание: короткое, у каждого свой ритм
const blinkK = (t: number, seed: number) => { const per = 3.1 + (seed % 5) * .37, ph = ((t + seed * .71) % per) / per; return ph < .045 ? Math.sin(ph / .045 * Math.PI) : 0; };

// предметы в руке (координаты кисти, ед. — пиксели исходника; угол — по предплечью)
const Prop: React.FC<{ kind: Hold; at: [number, number]; ang: number; screen: number; side: 'L' | 'R' }> = ({ kind, at, ang, screen, side }) => {
  if (!kind) return null;
  const a = -ang; // предмет следует повороту предплечья
  if (kind === 'phoneEar') return (<g transform={`translate(${at[0] - 18},${at[1] - 20}) rotate(-8)`}><rect x={-20} y={-80} width={40} height={150} rx={12} fill="#14161c" stroke="#3a3f4b" strokeWidth={3} /></g>);
  if (kind === 'phone') return (<g transform={`translate(${at[0]},${at[1]})`}>
    <rect x={-34} y={-66} width={68} height={132} rx={11} fill="#14161c" stroke="#2c303a" strokeWidth={3} />
    <rect x={-29} y={-60} width={58} height={120} rx={8} fill={screen > 0 ? '#9fc4ff' : '#1d2230'} opacity={.35 + screen * .65} />
    {/* большой палец поверх края — хват, а не «прилипший» предмет */}
    <path d={side === 'R' ? 'M30,6 q16,-4 14,22 q-4,14 -20,10 z' : 'M-30,6 q-16,-4 -14,22 q4,14 20,10 z'} fill="#d9a07c" stroke="#b97f5c" strokeWidth={2} />
  </g>);
  if (kind === 'remote') return (<g transform={`translate(${at[0]},${at[1]}) rotate(${a + 180})`}><rect x={-15} y={-10} width={30} height={92} rx={9} fill="#1c1f26" /><circle cx={0} cy={6} r={5} fill="#d44" /></g>);
  if (kind === 'iron') return (<g transform={`translate(${at[0]},${at[1] + 34})`}>
    <path d="M-120,40 L118,40 Q130,40 120,22 Q70,-36 -60,-30 Q-112,-26 -120,12 Z" fill="#e8e8ec" stroke="#9aa0ad" strokeWidth={4} />
    <path d="M-120,40 L118,40 L112,52 L-116,52 Z" fill="#7d838f" />
    <path d="M-62,-30 Q-50,-78 10,-74 Q48,-70 52,-24" fill="none" stroke="#3c7fd1" strokeWidth={22} strokeLinecap="round" />
    <circle cx={-20} cy={4} r={7} fill="#e5383b" opacity={.9} /></g>);
  return null;
};

export const Fig: React.FC<FigProps> = (p) => {
  const { d, P, torso, head, arm, root } = figKin(p);
  const t = p.t, dark = p.dark ?? 0, scr = p.screen ?? (p.holdL === 'phone' || p.holdR === 'phone' || p.holdR === 'phoneEar' ? 1 : 0);
  const fid = 'f' + p.id + Math.round(p.x) + Math.round(p.y);
  let body: React.ReactNode;
  if (d.view === 'front') {
    const F = FACE[p.id], aL = arm('L'), aR = arm('R');
    const lid = Math.max(p.noBlink ? 0 : blinkK(t, p.id.length + Math.round(p.x) % 7), p.lid ?? 0);
    const talk = clamp(p.mouth ?? 0), o = clamp(p.o ?? 0), worry = clamp(p.worry ?? 0), brows = clamp(p.brows ?? 0);
    const face = talk > .02 || o > .02 || worry > .02 || (p.smile ?? 0) > .02;
    const [mx, my, mw] = F.m;
    const look = (p.look ?? 0) * 6;
    const B = p.only !== 'arms', A = p.only !== 'body';
    body = (<>
      {B && img(p.id, 'torso', torso)}
      {B && <g transform={ms(head)}>
        {img(p.id, 'head')}
        {/* веки */}
        {lid > .02 && F.eyes.map((e, i) => <rect key={i} x={e[0] - e[2] * 1.2} y={e[1] - e[3] * 1.5} width={e[2] * 2.4} height={e[3] * 3 * lid} rx={e[3]} fill={F.skin} />)}
        {lid > .5 && F.eyes.map((e, i) => <path key={'l' + i} d={`M${e[0] - e[2]},${e[1] - e[3] * 1.5 + e[3] * 3 * lid} q${e[2]},${4} ${e[2] * 2},0`} stroke={F.brow} strokeWidth={3} fill="none" opacity={.7} />)}
        {/* брови: тревога — внутренние концы вверх; удивление — обе вверх */}
        {F.br && (worry > .02 || brows > .02) && F.br.map(([bx, by], i) => { const sg = i ? 1 : -1, up = brows * 9;
          return <g key={'b' + i}><ellipse cx={bx} cy={by} rx={34} ry={12} fill={F.skin} filter={`url(#${fid}bl)`} />
            <path d={`M${bx - sg * 30},${by - up + 2} Q${bx},${by - up - 7 - worry * 4} ${bx + sg * 30},${by - up + 3 - worry * 12}`} transform={`translate(${sg * 0},0)`} stroke={F.brow} strokeWidth={9} strokeLinecap="round" fill="none" /></g>; })}
        {/* рот: пятно кожи закрывает нарисованный, поверх — новый (говорит / «О» тревоги / мягкая улыбка) */}
        {face && <><ellipse cx={mx} cy={my + 2} rx={mw * 1.35} ry={mw * .62} fill={F.skin} filter={`url(#${fid}bl)`} />
          {o > .02 || talk > .02
            ? <ellipse cx={mx} cy={my + 3} rx={mw * (o > talk ? .42 : .62 + talk * .1)} ry={Math.max(3, mw * (o > talk ? .55 * o : .38 * talk))} fill="#4a1f1c" stroke={F.lip} strokeWidth={3} />
            : <path d={`M${mx - mw * .7},${my} Q${mx},${my + (p.smile ?? 0) * 12 - worry * 7} ${mx + mw * .7},${my}`} stroke={F.lip} strokeWidth={5} strokeLinecap="round" fill="none" />}</>}
      </g>}
      {/* руки поверх корпуса: плечо, затем предплечье с кистью */}
      {A && <>{img(p.id, 'uaL', aL.u)}{img(p.id, 'faL', aL.f)}
      <Prop kind={p.holdL ?? null} at={aL.hand} ang={aL.ang} screen={scr} side="L" />
      {img(p.id, 'uaR', aR.u)}
      {p.holdR === 'phoneEar' && <Prop kind="phoneEar" at={aR.hand} ang={aR.ang} screen={scr} side="R" />}
      {img(p.id, 'faR', aR.f)}
      {p.holdR !== 'phoneEar' && !p.phoneMid && <Prop kind={p.holdR ?? null} at={aR.hand} ang={aR.ang} screen={scr} side="R" />}
      {p.phoneMid && (() => { const c: [number, number] = [(aL.hand[0] + aR.hand[0]) / 2, (aL.hand[1] + aR.hand[1]) / 2 - 20], th = (p.thumb ?? 0);
        return <g transform={`translate(${c[0]},${c[1]})`}>
          <rect x={-46} y={-88} width={92} height={176} rx={14} fill="#14161c" stroke="#2c303a" strokeWidth={3} />
          <rect x={-40} y={-80} width={80} height={160} rx={10} fill={scr > 0 ? '#a9c9ff' : '#1d2230'} opacity={.4 + scr * .6} />
          {[0, 1, 2].map(i => <rect key={i} x={-30} y={-62 + i * 44 - (th * 30) % 44} width={60} height={30} rx={6} fill="#fff" opacity={.45} />)}
          {/* пальцы обхватывают корпус с боков, большой палец правой руки листает */}
          <path d="M-46,-10 q-14,6 -10,34 q4,16 14,12 z M-46,30 q-12,6 -8,28 q4,12 12,8 z" fill="#c98d66" stroke="#a8714e" strokeWidth={2} />
          <path d="M46,0 q14,6 10,34 q-4,16 -14,12 z M46,40 q12,6 8,26 q-4,12 -12,8 z" fill="#c98d66" stroke="#a8714e" strokeWidth={2} />
          <path d={`M44,${70 - th * 40} q-26,-8 -34,-34 q-2,-10 8,-10 q20,10 34,22 z`} fill="#d29a72" stroke="#a8714e" strokeWidth={2} />
        </g>; })()}</>}
    </>);
  } else if (d.view === 'profile') {
    // сидящий профиль: бедро поворачивается вперёд (влево) на 90°, голень висит от колена
    const sit = clamp(p.sit ?? 0), Pp = P.P, K = P.K;
    const drop = sit * (K[1] - Pp[1]) * .98;
    const bodyM: M = mul(tr(0, drop), torso);
    const headM: M = mul(tr(0, drop), head);
    const th: M = mul(tr(0, drop), rot(sit * 88, Pp[0], Pp[1]));
    const K2 = ap(th, K);
    const sh: M = tr(K2[0] - K[0], K2[1] - K[1]);
    const a = p.R ?? REST, S = P.S, E = P.E;
    const u: M = mul(mul(bodyM, rot(a.u, S[0], S[1])), along(S, E, a.fu ?? 1));
    const E2 = ap(u, E);
    const f: M = mul(tr(E2[0] - E[0], E2[1] - E[1]), rot(a.u + a.f, E[0], E[1]));
    const hand = ap(f, [P.W[0] - 10, P.W[1] + 80]);
    const F = PFACE[p.id]; const lid = Math.max(p.noBlink ? 0 : blinkK(t, 3), p.lid ?? 0); const talk = clamp(p.mouth ?? 0);
    body = (<>
      {img(p.id, 'sh', sh)}{img(p.id, 'th', th)}{img(p.id, 'body', bodyM)}
      <g transform={ms(headM)}>{img(p.id, 'head')}
        {F && lid > .02 && <rect x={F.eye[0] - 12} y={F.eye[1] - 12} width={24} height={24 * lid} rx={6} fill={F.skin} />}
        {F && talk > .02 && <><ellipse cx={F.m[0] + 4} cy={F.m[1]} rx={13} ry={9} fill={F.skin} filter={`url(#${fid}bl)`} /><ellipse cx={F.m[0] + 3} cy={F.m[1] + 2} rx={7} ry={3 + talk * 7} fill="#4a1f1c" /></>}
      </g>
      {img(p.id, 'ua', u)}{img(p.id, 'fa', f)}
      <Prop kind={p.holdR ?? null} at={hand} ang={a.u + a.f} screen={scr} side="L" />
    </>);
  } else {
    body = (<>{img(p.id, 'body', torso)}<g transform={ms(head)}>{img(p.id, 'head')}</g></>);
  }
  // свет: днём — как есть; в блэкаут — тёмно-синий силуэт, свет телефона — локальное пятно на кисти и лице
  const ph = d.view === 'front' && (p.holdR || p.holdL) ? arm(p.holdR ? 'R' : 'L').hand : null;
  return (<g transform={root} opacity={p.opacity ?? 1}>
    <defs>
      <filter id={`${fid}bl`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id={`${fid}dk`}><feColorMatrix type="matrix" values={`${1 - dark * .78} 0 0 0 ${dark * .01}  0 ${1 - dark * .74} 0 0 ${dark * .02}  0 0 ${1 - dark * .6} 0 ${dark * .07}  0 0 0 1 0`} /></filter>
      {ph && <radialGradient id={`${fid}lg`} gradientUnits="userSpaceOnUse" cx={ph[0]} cy={ph[1] - 120} r={520}><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>}
      {ph && <mask id={`${fid}mk`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}><rect x={-2000} y={-2000} width={6000} height={6000} fill={`url(#${fid}lg)`} /></mask>}
    </defs>
    {(p.shadow ?? .25) > 0 && !(p.sit) && p.only !== 'arms' && <ellipse cx={d.cx} cy={d.foot - 6} rx={d.W * .3} ry={34} fill="#000" opacity={p.shadow ?? .25} />}
    <g filter={dark > .01 ? `url(#${fid}dk)` : undefined}>{body}</g>
    {dark > .01 && ph && scr > 0 && <g mask={`url(#${fid}mk)`} opacity={dark * .85 * scr} style={{ mixBlendMode: 'screen' }}><g filter={`url(#${fid}cool)`}>{body}</g></g>}
    <defs><filter id={`${fid}cool`}><feColorMatrix type="matrix" values=".55 0 0 0 0  0 .62 0 0 .02  0 0 .8 0 .08  0 0 0 1 0" /></filter></defs>
  </g>);
};
