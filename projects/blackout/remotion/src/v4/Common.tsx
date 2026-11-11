// «Блэкаут» с.1 v4 — общее для планов: фоны пользователя, камера, массовка, машины, телеэкран, предзагрузка.
import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { clamp, noise } from '../anim';
import DATA from './cutData.json';

export const K = 1080 / 941; // пиксель вертикального фона пользователя → пиксель кадра
type CD = { parts: Record<string, number[]>; top: number; foot: number; cx: number };
const D = DATA as unknown as Record<string, CD>;
export const bg = (name: string) => staticFile(`v4/bg/${name}`);

// все картинки серии — в DOM с первого кадра, кадр ждёт их загрузки (иначе SVG <image> может не успеть)
const BGS = ['arbat-blackout.jpg', 'arbat-lit.jpg', 'ascension-cathedral-blackout.jpg', 'ascension-cathedral-lit.jpg', 'city-blackout.jpg', 'city-lit.jpg',
  'door-flashlight.jpg', 'eurasia-map.png', 'fighter-jet.png', 'historic-street.jpg', 'hotel-kazakhstan-blackout.jpg', 'hotel-kazakhstan-lit.jpg',
  'koktobe-cableway-blackout-v2.jpg', 'koktobe-cableway-lit-v2.jpg', 'koktobe-cableway-reaction-v2.jpg', 'room-blackout-v3.jpg', 'room-lit-v3.jpg',
  'study-cozy-room.jpg', 'tv-anchor.jpg', 'tv-eastern-europe.jpg', 'tv-japan.jpg', 'tv-russia.jpg', 'tv-substation-aftermath.jpg', 'tv-substation-strike.jpg',
  'kbtu-lit.jpg', 'kbtu-blackout.jpg'];
const CUTS = Object.entries(D).flatMap(([id, d]) => Object.keys(d.parts).map(k => id.startsWith('civ_') ? `v4/civ/${id.slice(4)}.png` : id.startsWith('table_') ? `v4/room/table-${id.slice(6)}.png` : `v4/${id}/${k}.png`));
const ALL = [...BGS.map(bg), ...CUTS.map(c => staticFile(c))];
export const Preload: React.FC = () => {
  const [h] = useState(() => delayRender('v4 images'));
  const left = React.useRef(ALL.length), done = React.useRef(false);
  const fin = () => { left.current -= 1; if (left.current <= 0 && !done.current) { done.current = true; continueRender(h); } };
  useEffect(() => { const tm = setTimeout(() => { if (!done.current) { done.current = true; continueRender(h); } }, 40000); return () => clearTimeout(tm); }, [h]);
  return <svg width={2} height={2} style={{ position: 'absolute', left: 0, top: 0, opacity: .004, pointerEvents: 'none' }}>
    {ALL.map(s => <image key={s} href={s} width={2} height={2} onLoad={fin} onError={fin} />)}</svg>;
};

// камера: зум z вокруг точки (fx, fy) кадра, сдвиг, лёгкая «ручная» дрожь
export const Cam: React.FC<{ z?: number; fx?: number; fy?: number; dx?: number; dy?: number; r?: number; children: React.ReactNode }> = ({ z = 1, fx = 540, fy = 960, dx = 0, dy = 0, r = 0, children }) =>
  <g transform={`translate(${540 + dx},${960 + dy}) rotate(${r}) scale(${z}) translate(${-fx},${-fy})`}>{children}</g>;
// фон пользователя на весь кадр (вертикальный 9:16)
export const BG: React.FC<{ n: string; o?: number; filter?: string }> = ({ n, o = 1, filter }) => o <= 0 ? null : <image href={bg(n)} x={0} y={0} width={1080} height={1920} preserveAspectRatio="xMidYMid slice" opacity={o} style={filter ? { filter } : undefined} />;
// вырезанный слой (стол, массовка) в координатах фона
export const Piece: React.FC<{ id: string; o?: number }> = ({ id, o = 1 }) => { const [x, y, w, h] = D[id].parts.full; const src = id.startsWith('civ_') ? `v4/civ/${id.slice(4)}.png` : `v4/room/table-${id.slice(6)}.png`;
  return <image href={staticFile(src)} x={x * K} y={y * K} width={w * K} height={h * K} opacity={o} />; };

// прохожий из массовки: x,y — ступни в кадре, h — рост в кадре; тревога — лёгкий наклон головы назад, перенос веса; свет телефона
export const Civ: React.FC<{ id: 'c1' | 'c2' | 'c3' | 'c4'; x: number; y: number; h: number; t: number; dark?: number; look?: number; flip?: boolean; phone?: [number, number] }> = ({ id, x, y, h, t, dark = 0, look = 0, flip, phone }) => {
  const d = D['civ_' + id], [bx, by, bw, bh] = d.parts.full, s = h / (d.foot - d.top);
  const sway = noise(id + 'sw', t, .6) * 1.2 + look * -2.5, k = 1 - dark * .72;
  const fid = 'civ' + id + Math.round(x);
  return (<g transform={`translate(${x},${y}) rotate(${sway}) scale(${flip ? -s : s},${s}) translate(${-d.cx},${-d.foot})`}>
    <defs><filter id={fid}><feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k + dark * .04} 0 0 0  0 0 ${k + dark * .2} 0 ${dark * .04}  0 0 0 1 0`} /></filter></defs>
    <ellipse cx={d.cx} cy={d.foot} rx={bw * .4} ry={22} fill="#000" opacity={.3} />
    <image href={staticFile(`v4/civ/${id}.png`)} x={bx} y={by} width={bw} height={bh} filter={dark > .01 ? `url(#${fid})` : undefined} />
    {phone && dark > .01 && <><circle cx={phone[0]} cy={phone[1]} r={130} fill="url(#phoneGlow)" opacity={dark} /><rect x={phone[0] - 9} y={phone[1] - 16} width={18} height={30} rx={4} fill="#dfe9ff" opacity={dark} /></>}
  </g>);
};
export const GlowDefs: React.FC = () => (<defs>
  <radialGradient id="phoneGlow"><stop offset="0" stopColor="#cfe0ff" stopOpacity=".8" /><stop offset=".4" stopColor="#9fbfff" stopOpacity=".28" /><stop offset="1" stopColor="#9fbfff" stopOpacity="0" /></radialGradient>
  <radialGradient id="warmGlow"><stop offset="0" stopColor="#ffd38a" stopOpacity=".6" /><stop offset="1" stopColor="#ffb54a" stopOpacity="0" /></radialGradient>
  <radialGradient id="headGlow"><stop offset="0" stopColor="#fff6d8" stopOpacity="1" /><stop offset=".3" stopColor="#ffe9a8" stopOpacity=".55" /><stop offset="1" stopColor="#ffd070" stopOpacity="0" /></radialGradient>
  <linearGradient id="beamG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffbe8" stopOpacity=".55" /><stop offset="1" stopColor="#fffbe8" stopOpacity="0" /></linearGradient>
</defs>);

// машины: пара фар (и габариты сзади) едет по своей полосе — прямая a→b в кадре, скорость постоянная, не обгоняют друг друга
export type Car = { a: [number, number]; b: [number, number]; t0: number; dur: number; s: number; taxi?: boolean; dir?: 1 | -1 };
export const Cars: React.FC<{ t: number; cars: Car[]; dark?: number }> = ({ t, cars, dark = 1 }) => (<g>{cars.map((c, i) => {
  const k = ((t - c.t0) / c.dur % 1 + 1) % 1, x = c.a[0] + (c.b[0] - c.a[0]) * k, y = c.a[1] + (c.b[1] - c.a[1]) * k, s = c.s * (.7 + .3 * (y / 1920));
  const dir = c.b[0] > c.a[0] ? 1 : -1;
  return (<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
    <path d={`M${dir * 20},0 L${dir * 230},-34 L${dir * 230},34 Z`} fill="#fff4cf" opacity={.22 * dark} />
    <rect x={-46} y={-14} width={92} height={24} rx={9} fill={c.taxi ? '#c99a1c' : '#1c2130'} />
    <rect x={-30} y={-28} width={56} height={18} rx={7} fill={c.taxi ? '#b48616' : '#151a26'} />
    {c.taxi && <rect x={-12} y={-38} width={24} height={9} rx={2} fill="#ffe27a" />}
    <circle cx={dir * 44} cy={-2} r={6} fill="#fffbe6" /><circle cx={dir * 44} cy={-2} r={20} fill="#fff6d0" opacity={.35} />
    <circle cx={-dir * 44} cy={-2} r={4.5} fill="#ff3b30" opacity={.9} />
    {[-28, 26].map(wx => <circle key={wx} cx={wx} cy={10} r={7} fill="#0b0d12" />)}
  </g>);
})}</g>);

// листья (падают медленно, кружатся)
export const Leaves: React.FC<{ t: number; n?: number; seed?: number; dark?: number }> = ({ t, n = 9, seed = 1, dark = 0 }) => (<g opacity={1 - dark * .5}>{[...Array(n)].map((_, i) => {
  const h = (q: number) => { const v = Math.sin((i + 1) * 91.3 * q + seed * 17.7) * 43758.5; return v - Math.floor(v); };
  const sp = 70 + h(1) * 70, y = ((t * sp + h(2) * 1920) % 2100) - 100, x = h(3) * 1080 + Math.sin(t * (1 + h(4)) + i) * 50, r = t * (60 + h(5) * 120) + i * 40;
  return <path key={i} d="M0,-14 C10,-8 10,8 0,14 C-10,8 -10,-8 0,-14 Z" transform={`translate(${x},${y}) rotate(${r}) scale(${.9 + h(6)},${(.9 + h(6)) * Math.abs(Math.cos(t * 3 + i))})`} fill={['#d9892b', '#b8621f', '#e5a83a'][i % 3]} />;
})}</g>);

// дым: мягкие клубы с градиентом поднимаются и тают
export const Smoke: React.FC<{ t: number; x: number; y: number; s?: number; n?: number }> = ({ t, x, y, s = 1, n = 7 }) => (<g>
  <defs><radialGradient id="smk"><stop offset="0" stopColor="#8c95a6" stopOpacity=".55" /><stop offset="1" stopColor="#8c95a6" stopOpacity="0" /></radialGradient></defs>
  {[...Array(n)].map((_, i) => { const k = ((t * .45 + i / n) % 1); return <circle key={i} cx={x + Math.sin(k * 5 + i) * 18 * s + k * 40 * s} cy={y - k * 260 * s} r={(30 + k * 90) * s} fill="url(#smk)" opacity={Math.sin(k * Math.PI)} />; })}
</g>);

// подложка «ручная съёмка очевидца»: тряска + медленный зум
export const handCam = (t: number, a = 7) => ({ dx: noise('hcx', t, 1.6) * a, dy: noise('hcy', t, 1.4) * a, r: noise('hcr', t, .9) * .5 });
export const flick = (t: number, seed: string, amt = .15) => 1 - amt * (.5 + .5 * noise(seed, t, 6));
export const step = (t: number, at: number) => t >= at ? 1 : 0;
export const fadeK = (t: number, a: number, d = .12) => clamp((t - a) / d);
