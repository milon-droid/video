// Обложка с.1: экшен и интрига — истребитель с форсажем над Алматы, город гаснет по диагонали, Диас в ужасе смотрит вверх,
// в очках красное «Не доставлено»; «БЛЭКАУТ» со сбоем, красное 20:03, крючок «ДО КОНЦА СВЕТА 5 МИНУТ».
import React from 'react';
import { AbsoluteFill } from 'remotion';
import '../fonts';
import { C, FONT, MONO } from '../theme';
import { Character } from '../char/Character';
import { Mountains, Sky, Zhk, HotelTower } from '../bg/City';
import { Fighter } from '../bg/Exterior';
import { Glow } from '../bg/Kitchen';
import { Post } from '../ui/Overlays';
const lens = (cx: number, cy: number, w: number, h: number) => (<g><rect x={cx - w * .32} y={cy - h * .22} width={w * .54} height={h * .74} fill="#7FB3FF" opacity={.6} /><rect x={cx - w * .26} y={cy + h * .16} width={w * .4} height={h * .14} fill="#E5383B" /></g>);
export const Ep1Cover: React.FC = () => { const t = 25.9, cut = (x: number) => 220 + (1300 - x) * 0; const wave = (y: number) => 260 + (1300 - y) * .55;
  return (<AbsoluteFill style={{ background: C.night }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
    <Sky t={t} glow={.8} storm={1} /><path d="M930,170 L880,330 L920,360 L860,520" stroke="#EEF2FF" strokeWidth={7} fill="none" style={{ filter: 'drop-shadow(0 0 18px #B9C6FF)' }} />
    <Mountains y={1000} amp={280} seed={33} moon={.7} />
    <Zhk x={-60} base={1330} w={300} floors={15} lit={(f, c) => (c < 4 ? 0 : 1)} col="#3E4560" seed={2} /><HotelTower x={560} base={1330} s={.72} lit={() => 1} crown={1} /><Zhk x={760} base={1350} w={300} floors={16} lit={() => 1} col="#4A4E6A" seed={4} />
    <path d={`M-10,600 L${wave(600)},600 L${wave(1400)},1400 L-10,1400 Z`} fill="#020409" opacity={.6} />
    <path d={`M${wave(700)},700 L${wave(1360)},1360`} stroke="#E5383B" strokeWidth={14} opacity={.5} style={{ filter: 'blur(8px)' }} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={380} y1={760 + i * 30} x2={-100} y2={1000 + i * 40} stroke="#E6ECFF" strokeWidth={4} opacity={.18} />)}
    <Fighter x={600} y={640} s={1.25} rot={-24} t={t} burn={1.2} /><Glow x={540} y={1900} r={600} col="#7FB3FF" a={.35} />
    <Character who="dias" x={540} y={1930} s={2.55} t={1.3} expr="shock" mouth={.45} look={[.15, -1]} under={1} lens={lens} collarOpen armL={null} armR={null} blinkOff />
  </svg>
    <Post t={0} />
    <div style={{ position: 'absolute', left: 60, width: 900, top: 900, textAlign: 'center', rotate: '-3deg' }}>
      <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 176, lineHeight: 1, color: C.danger, textShadow: '0 0 40px rgba(229,56,59,.9), -10px 5px 0 rgba(0,200,255,.65), 0 8px 0 #05060c' }}>БЛЭКАУТ</div></div>
    <div style={{ position: 'absolute', left: 60, width: 900, top: 1112, display: 'flex', justifyContent: 'center' }}><div style={{ background: 'rgba(5,7,16,.85)', borderRadius: 18, padding: '14px 28px', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.text }}>ДО КОНЦА СВЕТА <span style={{ color: '#FFD23F' }}>5 МИНУТ</span></div></div>
    <div style={{ position: 'absolute', left: 660, top: 420, rotate: '4deg', background: 'rgba(5,7,16,.88)', border: `5px solid ${C.danger}`, borderRadius: 18, padding: '8px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 76, color: C.danger }}>20:03</div>
    <div style={{ position: 'absolute', left: 96, top: 448, rotate: '-4deg', background: '#FFD23F', padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink, boxShadow: '0 8px 20px rgba(0,0,0,.45)' }}>ЧАСТЬ 1</div>
  </AbsoluteFill>); };
