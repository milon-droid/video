// Фоны серии: ночная улица с фонарём, кухня утром, коридор, дневная улица, площадь, фонтан, крыша на закате, неоновая улица.
import React from 'react';
import { clamp, noise } from '../anim';
const h1 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// дальние дома силуэтами с окнами
export const Skyline: React.FC<{ y: number; color: string; win?: string; seed?: number; h?: number; n?: number; winK?: number; t?: number; x0?: number; w?: number }> = ({ y, color, win = '#ffd88a', seed = 1, h = 500, n = 9, winK = .35, t = 0, x0 = -100, w = 1280 }) => {
  const bw = w / n;
  return <g>{Array.from({ length: n }).map((_, i) => { const hh = h * (.45 + h1(i + seed * 10) * .55), x = x0 + i * bw, ww = bw * (.8 + h1(i * 3 + seed) * .35);
    const cols = Math.max(2, Math.floor(ww / 34)), rows = Math.floor(hh / 46);
    return <g key={i}><rect x={x} y={y - hh} width={ww} height={hh + 4} fill={color} />
      {h1(i * 7 + seed) > .6 && <rect x={x + ww * .4} y={y - hh - 40} width={6} height={40} fill={color} />}
      {Array.from({ length: cols * rows }).map((_, j) => { const r = h1(i * 100 + j + seed * 1000); if (r > winK) return null; const on = r < winK * .2 ? .5 + .5 * Math.sin(t * 2 + j) : 1;
        return <rect key={j} x={x + 10 + (j % cols) * ((ww - 20) / cols)} y={y - hh + 16 + Math.floor(j / cols) * 46} width={(ww - 20) / cols - 10} height={24} fill={win} opacity={.75 * on} />; })}
    </g>; })}</g>;
};

// Ночная улица: стена-кирпич (на неё встанет тень), тротуар, фонарь с конусом света
export const NightStreet: React.FC<{ t: number; lampX?: number; wallY?: number; groundY?: number; flick?: number; noWall?: boolean }> = ({ t, lampX = 300, wallY = 1240, groundY = 1240, flick = 0 }) => {
  const fl = 1 - flick * (h1(Math.floor(t * 24)) > .6 ? .5 : 0);
  return <g>
    <defs>
      <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0f2a" /><stop offset=".6" stopColor="#1b1d4a" /><stop offset="1" stopColor="#3a2a5a" /></linearGradient>
      <linearGradient id="nwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2440" /><stop offset="1" stopColor="#3e3352" /></linearGradient>
      <linearGradient id="nground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2a40" /><stop offset="1" stopColor="#14131f" /></linearGradient>
      <radialGradient id="lampPool" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd890" stopOpacity=".75" /><stop offset=".5" stopColor="#ffb860" stopOpacity=".25" /><stop offset="1" stopColor="#ffb860" stopOpacity="0" /></radialGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe0a0" stopOpacity=".45" /><stop offset="1" stopColor="#ffe0a0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#nsky)" />
    {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={h1(i) * 1080} cy={h1(i + 50) * 500} r={1.5 + h1(i + 9) * 2} fill="#fff" opacity={.4 + .4 * Math.sin(t * 2 + i)} />)}
    <Skyline y={760} color="#221f44" seed={2} h={520} t={t} />
    {/* стена дома с кирпичом */}
    <rect x={-50} y={640} width={1180} height={wallY - 640} fill="url(#nwall)" />
    {Array.from({ length: 13 }).map((_, r) => Array.from({ length: 10 }).map((_, c) => <rect key={r + '-' + c} x={-60 + c * 124 + (r % 2) * 62} y={650 + r * 46} width={116} height={40} rx={4} fill="#4a3e60" opacity={.25 + h1(r * 10 + c) * .2} />))}
    <rect x={-50} y={640} width={1180} height={24} fill="#1c1830" />
    {/* окно в стене */}
    <rect x={720} y={760} width={180} height={230} fill="#ffcf7a" opacity={.85} /><rect x={720} y={760} width={180} height={230} fill="none" stroke="#1c1830" strokeWidth={12} /><path d="M810 760 V990 M720 875 H900" stroke="#1c1830" strokeWidth={8} />
    {/* тротуар */}
    <rect x={-50} y={groundY} width={1180} height={2900 - groundY} fill="url(#nground)" />
    <rect x={-50} y={groundY} width={1180} height={16} fill="#4a4566" />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${-200 + i * 220} ${groundY + 16} L${-700 + i * 330} 1920`} stroke="#000" strokeWidth={3} opacity={.25} />)}
    <path d={`M-50 ${groundY + 230} H1130 M-50 ${groundY + 470} H1130`} stroke="#000" strokeWidth={3} opacity={.2} />
    {/* фонарь */}
    <ellipse cx={lampX} cy={groundY + 200} rx={520} ry={180} fill="url(#lampPool)" opacity={fl} />
    <path d={`M${lampX - 30} ${groundY - 900} L${lampX - 420} ${groundY + 300} L${lampX + 420} ${groundY + 300} L${lampX + 30} ${groundY - 900}Z`} fill="url(#cone)" opacity={.6 * fl} />
    <rect x={lampX - 10} y={groundY - 940} width={20} height={940} fill="#151424" />
    <path d={`M${lampX} ${groundY - 940} q0 -60 70 -60 h10`} stroke="#151424" strokeWidth={14} fill="none" />
    <path d={`M${lampX + 40} ${groundY - 1000} h80 l-14 30 h-52Z`} fill="#151424" />
    <ellipse cx={lampX + 80} cy={groundY - 966} rx={34} ry={12} fill="#fff4d0" opacity={fl} />
    <circle cx={lampX + 80} cy={groundY - 960} r={120} fill="url(#lampPool)" opacity={.8 * fl} />
  </g>;
};

// Кухня утром: окно слева с солнцем, лучи, стол, чайник, кружка; тени предметов падают вправо
export const Kitchen: React.FC<{ t: number }> = ({ t }) => <g>
  <defs>
    <linearGradient id="kwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe8c8" /><stop offset="1" stopColor="#f0c8a0" /></linearGradient>
    <linearGradient id="kfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c89a6e" /><stop offset="1" stopColor="#9a6e4a" /></linearGradient>
    <linearGradient id="ksun" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stopColor="#fff6d0" stopOpacity=".7" /><stop offset="1" stopColor="#fff6d0" stopOpacity="0" /></linearGradient>
    <linearGradient id="kout" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ad0ff" /><stop offset="1" stopColor="#ffe4b0" /></linearGradient>
  </defs>
  <rect width={1080} height={1920} fill="url(#kwall)" />
  {/* плитка-фартук */}
  {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 12 }).map((_, c) => <rect key={r + '-' + c} x={c * 92} y={1000 + r * 60} width={88} height={56} fill="#fff" opacity={.35} />))}
  {/* окно */}
  <rect x={60} y={360} width={400} height={560} fill="url(#kout)" />
  <circle cx={180} cy={470} r={60} fill="#fff8d0" /><circle cx={180} cy={470} r={130} fill="#fff8d0" opacity={.3} />
  <Skyline y={920} color="#9ab4d0" win="#e8f4ff" seed={5} h={300} n={5} x0={60} w={400} winK={.2} />
  <rect x={60} y={360} width={400} height={560} fill="none" stroke="#fff" strokeWidth={22} /><path d="M260 360 V920 M60 640 H460" stroke="#fff" strokeWidth={14} />
  <rect x={40} y={920} width={440} height={30} fill="#f4f4f4" />
  {/* лучи */}
  <path d="M100 380 L1180 1100 L1180 1700 L420 920Z" fill="url(#ksun)" opacity={.55 + .08 * Math.sin(t)} />
  {/* пол */}
  <rect x={0} y={1420} width={1080} height={900} fill="url(#kfloor)" />
  {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${i * 180 - 100} 1420 L${i * 260 - 400} 1920`} stroke="#7a5236" strokeWidth={3} opacity={.4} />)}
  {/* солнечное пятно на полу */}
  <path d="M380 1440 L900 1440 L1080 1700 L560 1700Z" fill="#fff4c8" opacity={.35} />
  {/* столешница справа */}
  <rect x={640} y={940} width={460} height={60} fill="#e8d8c0" stroke="#7a5a40" strokeWidth={4} />
  <rect x={660} y={1000} width={420} height={420} fill="#b88a5e" stroke="#7a5a40" strokeWidth={4} />
  <path d="M870 1000 V1420" stroke="#7a5a40" strokeWidth={4} /><circle cx={850} cy={1200} r={8} fill="#5a3a20" /><circle cx={890} cy={1200} r={8} fill="#5a3a20" />
  {/* тени предметов на стене (вправо) */}
  <path d="M760 940 l140 -10 l20 -150 q-80 -40 -140 0Z" fill="#5a3a20" opacity={.28} filter="url(#soft8)" />
  <rect x={930} y={860} width={70} height={80} fill="#5a3a20" opacity={.28} filter="url(#soft8)" />
  {/* чайник */}
  <g transform="translate(740 940)">
    <path d="M-10 0 Q-20 -110 60 -120 Q140 -110 130 0Z" fill="#e85a4a" stroke="#3a1a14" strokeWidth={5} />
    <path d="M10 -100 Q60 -150 110 -100" stroke="#3a1a14" strokeWidth={10} fill="none" />
    <path d="M128 -60 Q170 -70 180 -110" stroke="#e85a4a" strokeWidth={16} fill="none" /><path d="M-2 -70 h-14" stroke="#3a1a14" strokeWidth={6} />
    <ellipse cx={40} cy={-80} rx={18} ry={30} fill="#fff" opacity={.35} />
    {[0, 1, 2].map(i => { const ph = (t * .5 + i / 3) % 1; return <circle key={i} cx={180 + Math.sin(ph * 8 + i) * 14} cy={-120 - ph * 160} r={12 + ph * 30} fill="#fff" opacity={(1 - ph) * .5} filter="url(#soft8)" />; })}
  </g>
  {/* кружка */}
  <g transform="translate(900 940)"><rect x={0} y={-80} width={70} height={80} rx={8} fill="#4a8ad8" stroke="#1a2a4a" strokeWidth={5} /><path d="M70 -60 q30 0 30 25 q0 25 -30 25" stroke="#1a2a4a" strokeWidth={8} fill="none" /></g>
</g>;

// Коридор: светлая стена с обоями, плинтус, лампа сверху
export const Hall: React.FC<{ t: number; tint?: string }> = ({ t, tint = '#efe6d6' }) => <g>
  <defs><radialGradient id="hlamp" cx=".5" cy="0" r=".9"><stop offset="0" stopColor="#fff8e0" stopOpacity=".8" /><stop offset="1" stopColor="#fff8e0" stopOpacity="0" /></radialGradient></defs>
  <rect width={1080} height={1920} fill={tint} />
  {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${i * 84} 0 V1600`} stroke="#d8ccb8" strokeWidth={22} opacity={.45} />)}
  {Array.from({ length: 14 }).map((_, i) => Array.from({ length: 18 }).map((_, j) => <circle key={i + '-' + j} cx={42 + i * 84} cy={40 + j * 90 + (i % 2) * 45} r={6} fill="#c8b89c" opacity={.4} />))}
  <rect width={1080} height={1920} fill="url(#hlamp)" opacity={.7} />
  <rect x={0} y={1600} width={1080} height={40} fill="#8a6a4a" /><rect x={0} y={1640} width={1080} height={280} fill="#6a4e36" />
  {/* дверная рама справа */}
  <rect x={930} y={300} width={200} height={1300} fill="#d8c8ae" stroke="#8a6a4a" strokeWidth={10} />
</g>;

// Дневная улица: небо, дома, дорога; солнце справа-сверху → тени влево-вниз
export const DayStreet: React.FC<{ t: number; x?: number; sky?: string; sky2?: string }> = ({ t, x = 0, sky = '#7ac4ff', sky2 = '#ffe2b8' }) => <g>
  <defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky} /><stop offset="1" stopColor={sky2} /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#dsky)" />
  {[0, 1, 2].map(i => <ellipse key={i} cx={((i * 420 + t * 20 - x * .1) % 1500) - 200} cy={260 + i * 90} rx={150} ry={40} fill="#fff" opacity={.7} />)}
  <g transform={`translate(${-x * .3} 0)`}><Skyline y={1000} color="#a8b8d8" win="#e8f0ff" seed={7} h={520} n={12} x0={-400} w={2400} winK={.2} /></g>
  <g transform={`translate(${-x * .6} 0)`}><Skyline y={1060} color="#e8a070" win="#fff0c8" seed={3} h={420} n={10} x0={-500} w={2800} winK={.3} /></g>
  <rect x={-50} y={1060} width={1180} height={70} fill="#c8c0b8" /><rect x={-50} y={1060} width={1180} height={10} fill="#8a8078" />
  <rect x={-50} y={1130} width={1180} height={1400} fill="#5a5866" />
  {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={((i * 260 - x) % 2600 + 2600) % 2600 - 300} y={1450} width={140} height={16} fill="#f4f0e0" opacity={.8} />)}
</g>;

// Крыша на закате: огромное солнце, город внизу, парапет, вентшахта
export const Roof: React.FC<{ t: number; sun?: number; gold?: number }> = ({ t, sun = 0, gold = 1 }) => <g>
  <defs>
    <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2058" /><stop offset=".45" stopColor="#c8487a" /><stop offset=".75" stopColor="#ff8a4a" /><stop offset="1" stopColor="#ffd07a" /></linearGradient>
    <radialGradient id="rsun"><stop offset="0" stopColor="#fff4c8" /><stop offset=".35" stopColor="#ffd07a" /><stop offset="1" stopColor="#ff8a4a" stopOpacity="0" /></radialGradient>
  </defs>
  <rect width={1080} height={1920} fill="url(#rsky)" />
  <circle cx={560} cy={960 + sun * 160} r={420} fill="url(#rsun)" opacity={.8 * gold} />
  <circle cx={560} cy={960 + sun * 160} r={150} fill="#fff0c0" />
  {[0, 1, 2, 3].map(i => <ellipse key={i} cx={((i * 380 + t * 14) % 1500) - 200} cy={520 + i * 120} rx={220} ry={22} fill="#ffb08a" opacity={.35} />)}
  <Skyline y={1130} color="#7a3a6a" win="#ffd08a" seed={11} h={420} n={11} winK={.12} t={t} />
  <Skyline y={1180} color="#4a2048" win="#ffcf6a" seed={13} h={320} n={8} winK={.25} t={t} />
  {/* крыша и парапет */}
  <rect x={-50} y={1180} width={1180} height={1400} fill="#2a1830" />
  <rect x={-50} y={1180} width={1180} height={40} fill="#5a3048" />
  <rect x={-50} y={1180} width={1180} height={8} fill="#ffb07a" opacity={.6} />
  {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${i * 220 - 80} 1220 L${i * 330 - 400} 1920`} stroke="#000" strokeWidth={3} opacity={.25} />)}
</g>;

// Неоновая ночная улица с дверью «ПРОФСОЮЗ ТЕНЕЙ»
export const NeonStreet: React.FC<{ t: number; sign?: number; sign2?: number }> = ({ t, sign = 1, sign2 = 1 }) => {
  const fl = (k: number, s: number) => k * (h1(Math.floor(t * 18) + s) > .93 ? .3 : 1);
  return <g>
    <defs><linearGradient id="nsk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060818" /><stop offset="1" stopColor="#1a1440" /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#nsk2)" />
    <Skyline y={600} color="#120f2a" win="#7a6aff" seed={21} h={400} winK={.15} t={t} />
    <rect x={-50} y={560} width={1180} height={760} fill="#1e1a36" />
    {Array.from({ length: 16 }).map((_, r) => Array.from({ length: 10 }).map((_, c) => <rect key={r + '-' + c} x={-60 + c * 124 + (r % 2) * 62} y={570 + r * 46} width={116} height={40} rx={4} fill="#2e2850" opacity={.4} />))}
    {/* дверь */}
    <rect x={410} y={900} width={260} height={420} fill="#0a0814" stroke="#3a3260" strokeWidth={10} />
    <rect x={430} y={920} width={220} height={400} fill="#120e22" />
    <circle cx={620} cy={1120} r={10} fill="#8a7aff" />
    {/* табличка */}
    <g opacity={fl(sign, 1)}>
      <rect x={150} y={640} width={780} height={150} rx={20} fill="#0a0814" stroke="#ff3a8a" strokeWidth={8} filter="url(#eyeGlow)" />
      <text x={540} y={745} textAnchor="middle" fontFamily="Russo" fontSize={72} fill="#ff6aa8" stroke="#ff3a8a" strokeWidth={2} filter="url(#eyeGlow)">ПРОФСОЮЗ ТЕНЕЙ</text>
    </g>
    <g opacity={fl(sign2, 7)}>
      <text x={540} y={866} textAnchor="middle" fontFamily="Russo" fontSize={50} fill="#7af0ff" filter="url(#eyeGlow)">ЗАБАСТОВКА — ЗАВТРА</text>
    </g>
    <rect x={-50} y={1320} width={1180} height={600} fill="#100c20" /><rect x={-50} y={1320} width={1180} height={14} fill="#3a3260" />
    <ellipse cx={540} cy={1420} rx={600} ry={140} fill="#ff3a8a" opacity={.12 * sign} />
  </g>;
};
export { clamp, noise };
