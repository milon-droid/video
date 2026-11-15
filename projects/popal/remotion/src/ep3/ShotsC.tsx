// Планы серии 3, часть 3 (Король → ворота замка → Рыцарь смерти → выбор).
import React from 'react';
import { clamp, lerp, out, io, spr, win, shake, shakeMany } from '../anim';
import { Person, POSES, BowProp } from '../chars/Person';
import { KingBull, Slime, ChibiSlime } from '../chars/Cast';
import { DeathKnight, GateWorld, FriedEgg, knightHand } from '../chars/Cast3';
import { Throne, Glow } from '../bg/Bg';
import { Frame, Cam, Tag, Choice } from '../ui/Ui';
import { Puffs } from '../ep1/Shots';
import { Silh } from '../ep1/Shots3';
import { html } from '../ep2/ShotsA';
import { P, mouth, dur, V, Heart } from './common';

// ───────────── 16. Король: «Лилиана… ест яичницу?!» — «Рыцарь смерти. К воротам» ─────────────
export const Throne3: React.FC<P> = ({ t, T }) => { const bx = 540, by = 1360, go = V('l2', 'throne'), k = io(win(t, go + .3, go + 1.8)), s = shake(t, go + .1, 14, .4);
  return (<Frame bg="#1a0a1e"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('throne'))))} fy={1000} dx={s[0]} dy={s[1]}><Throne t={T} />
    <Silh x={950 + k * 420} y={1640 - Math.abs(Math.sin(k * 9)) * 26} s={1.0} kind="knight" t={T + (t > go ? 3 : 0)} />
    {[-1, 1].map(sd => <g key={sd}><rect x={bx + sd * 300 - 80} y={by - 20} width={160} height={80} rx={18} fill="#2a1424" /><rect x={bx + sd * 300 - 70} y={by + 60} width={140} height={360} fill="#1a0c18" /></g>)}
    {[-1, 1].map(sd => <g key={'l' + sd}><path d={`M${bx + sd * 40},${by + 40} L${bx + sd * 230},${by + 40} L${bx + sd * 250},${by + 230} L${bx + sd * 60},${by + 240} Z`} fill="#1c1820" />
      <path d={`M${bx + sd * 80},${by + 230} L${bx + sd * 230},${by + 230} L${bx + sd * 220},${by + 470} L${bx + sd * 100},${by + 470} Z`} fill="#141118" /></g>)}
    <KingBull x={bx} y={by + 30} s={1.0} t={T} mouth={mouth('king', T)} steam={t > 1.2} />
    {/* в шаре — яичница и сердечки */}
    <g transform={`translate(${bx + 260},${by - 170})`}><circle r={70} fill="#2a0a3a" opacity={.8} /><FriedEgg x={0} y={6} s={.62} t={T} /><Heart x={-34} y={-30 - ((T * 20) % 20)} s={.6} /><Heart x={36} y={-24 - ((T * 26) % 20)} s={.5} /><circle r={70} fill="none" stroke="#ff7ad9" strokeWidth={5} opacity={.6} /></g>
  </Cam></Frame>); };

// ───────────── 17. Замок: проезд вниз по воротам; «Как мой офис. Только уютнее» ─────────────
const GY = 1480; // сдвиг декорации ворот: низ ворот (2960) оказывается на y = 1480
export const Castle: React.FC<P> = ({ t, T }) => { const cut = V('m2', 'castle') - .2;
  if (t < cut) { const ty = lerp(0, GY, io(win(t, .25, cut - .5))), walk = win(t, 0, cut);
    return (<Frame bg="#1a0408"><Cam z={1.02} dx={Math.sin(T * .7) * 6}><g transform={`translate(0,${-ty})`}><GateWorld t={T} />
      <Slime x={lerp(250, 330, walk)} y={2992} s={.2} t={T} /><Person x={lerp(330, 410, walk)} y={2990} s={.34} t={T} hold="pan" expr="shock" eye={[.3, -.9]} pose={{ legL: [Math.sin(T * 7) * .35, .1], legR: [-Math.sin(T * 7) * .35, .1] } as any} />
      <Person x={lerp(440, 520, walk)} y={2990} s={.34} t={T} look="lira" bowBack eye={[.2, -.9]} pose={{ legL: [-Math.sin(T * 7) * .35, .1], legR: [Math.sin(T * 7) * .35, .1] } as any} /></g></Cam></Frame>); }
  const q = t - cut;
  return (<Frame bg="#1a0408"><Cam z={lerp(1.0, 1.07, q / 2.6)} fy={950}><g transform="translate(-270,-2540) scale(1.5)"><GateWorld t={T} /></g><rect width={1080} height={1920} fill="#14060a" opacity={.35} /><Glow x={540} y={1500} r={800} c="#ff5a2a" o={.3} id="csG" />
    <Person x={760} y={2010} s={1.45} t={T} look="lira" bowBack expr="deadpan" eye={[-.8, 0]} flip />
    <Person x={390} y={2030} s={1.55} t={T} hold="pan" expr="neutral" mouth={mouth('max', T)} eye={[.2, -.7]} pose={{ ...POSES.stand, armL: [-.9, 2.2] } as any} />
    <Slime x={120} y={1560} s={.55} t={T} look={[.6, -.7]} /></Cam></Frame>); };

// ───────────── 18. Ворота открываются: Рыцарь смерти ─────────────
export const Knight: React.FC<P> = ({ t, T }) => { const open = out(win(t, .2, 1.3)) * .7, come = io(win(t, .7, 1.7)), s = shakeMany(t, [[.2, 8, .3], [.9, 16, .35], [1.4, 20, .4]]), step = t > .7 && t < 1.7 ? Math.max(0, Math.sin((t - .7) * 6.28)) : 0;
  return (<><Frame bg="#1a0408"><Cam z={lerp(1.0, 1.16, io(win(t, 1.6, dur('knight'))))} fy={1000} dx={s[0]} dy={s[1]}><g transform={`translate(0,${-GY})`}><GateWorld t={T} open={open} />
    <g opacity={clamp(come * 3)}><DeathKnight x={540} y={2960} s={lerp(.6, .86, come)} t={T} step={step} glow={.5 + come * .5} /></g>
    <Puffs t={t} t0={.9} x={540} y={2960} n={8} col="#3a1a1a" spread={300} up={60} size={50} id="knP1" /><Puffs t={t} t0={1.4} x={540} y={2960} n={8} col="#3a1a1a" spread={340} up={60} size={54} id="knP2" />
    <Slime x={130} y={3010} s={.2} t={T} squish={.2} /><Person x={210} y={3010} s={.34} t={T} hold="pan" expr="shock" eye={[.8, -.8]} pose={{ ...POSES.stand, lean: -.12 } as any} /><Person x={310} y={3010} s={.34} t={T} look="lira" hold="bow" draw={.3} eye={[.8, -.8]} /></g>
  </Cam></Frame><Tag t={t} t0={1.9} x={90} y={380} title="РЫЦАРЬ СМЕРТИ" sub="ГЕНЕРАЛ КОРОЛЯ · УР. 99" col="#5affd9" w={560} /></>); };

// ───────────── 19. «Эльфийку — в темницу» — «Макс! Не лезь! Иди к Королю!» ─────────────
export const Grab: React.FC<P> = ({ t, T }) => { const cut = V('n3', 'grab') - .15, r = out(win(t, .3, .6)), got = t > .58 ? 1 : 0, lift = io(win(t, .6, 1.2)), s = shake(t, .6, 16, .35);
  const kx = 770, ky = 1760, ks = .95, [hx0, hy0] = knightHand(r), hx = kx + hx0 * ks, hy = ky + hy0 * ks, kick = Math.sin(T * 13) * .5;
  const lx = got ? hx - 95 : 300, ly = got ? hy + 400 : 1760, close = t >= cut;
  return (<Frame bg="#1a0408"><Cam z={close ? lerp(1.55, 1.65, (t - cut) / 2.4) : lerp(1.0, 1.06, t / cut)} fx={close ? 300 : 540} fy={close ? 1180 : 1100} dx={s[0]} dy={s[1] - (close ? 60 : 100)}>
    <g transform="translate(-270,-2690) scale(1.5)"><GateWorld t={T} open={.7} /></g><rect width={1080} height={1920} fill="#14060a" opacity={.3} />
    <Person x={100} y={1790} s={.9} t={T} hold="pan" expr="shock" mouth={got && !close ? .7 : 0} eye={[.8, -.4]} pose={{ ...POSES.stand, armL: [1.2 * lift, -.4], lean: .1 * lift } as any} /><Slime x={-10} y={1790} s={.4} t={T} squish={.2} />
    {got ? <g transform={`translate(${340},${lerp(1500, 1770, clamp((t - .6) / .4) ** 2)}) rotate(${lerp(0, 200, clamp((t - .6) / .4))}) scale(.9)`}><BowProp arrow={false} /></g> : null}
    <Person x={lx} y={ly - lift * 40} s={.9} t={T} look="lira" hold={got ? null : 'bow'} bowBack={false} expr={close ? 'determined' : got ? 'shock' : 'determined'} mouth={mouth('lira', T)} eye={[close ? -.8 : .8, got ? .1 : -.4]}
      pose={got ? { armL: [-1.9 - kick * .4, .5], armR: [1.9 + kick * .4, -.5], legL: [kick * .7, .5], legR: [-kick * .7, .5] } as any : POSES.stand} shadow={!got} />
    <g transform={`translate(0,${-lift * 40})`}><DeathKnight x={kx} y={ky + lift * 40} s={ks} t={T} reach={r} /></g>
    {/* кулак на вороте плаща — поверх Лиры */}
    {got ? <g transform={`translate(${hx},${hy - lift * 40})`}><circle r={46} fill="#14121c" /><circle r={46} fill="none" stroke="#5affd9" strokeWidth={5} opacity={.5} /></g> : null}
  </Cam></Frame>); };

// ───────────── 20. Развилка в одном кадре: слева уносят Лиру, справа закрываются ворота ─────────────
export const Dilemma: React.FC<P> = ({ t, T }) => { const D = dur('dilemma'), k = t / D, eye = Math.sin(t * 4.5) > 0 ? .9 : -.9, sec = Math.max(1, Math.ceil(5 - t * 1.1));
  return (<><Frame bg="#14060a"><Cam z={lerp(1.0, 1.1, io(k))} fy={900}>
    <clipPath id="dlL"><rect x={-100} y={-100} width={640} height={2200} /></clipPath><clipPath id="dlR"><rect x={540} y={-100} width={640} height={2200} /></clipPath>
    <g clipPath="url(#dlL)"><rect x={-100} y={-100} width={640} height={2200} fill="#0e2a30" /><Glow x={200} y={1000} r={600} c="#5affd9" o={.35} id="dlG1" />
      <g transform={`translate(${-k * 60},0)`}><Person x={lerp(130, 100, k)} y={lerp(1420, 1380, k)} s={lerp(.42, .34, k)} t={T} look="lira" hold={null} bowBack={false} expr="shock" pose={{ armL: [-1.9, .5], armR: [1.9, -.5], legL: [Math.sin(T * 13) * .4, .5], legR: [-Math.sin(T * 13) * .4, .5] } as any} shadow={false} />
        <DeathKnight x={lerp(330, 290, k)} y={lerp(1500, 1440, k)} s={lerp(.5, .4, k)} t={T} reach={.45} step={Math.max(0, Math.sin(T * 6))} /></g></g>
    <g clipPath="url(#dlR)"><rect x={540} y={-100} width={640} height={2200} fill="#3a0a0c" /><g transform="translate(405,-720) scale(.75)"><GateWorld t={T} open={lerp(.7, .12, k)} /></g></g>
    <rect x={532} y={-100} width={16} height={2200} fill="#ffd23f" /><Glow x={540} y={900} r={520} c="#000" o={.5} id="dlS" />
    <Person x={540} y={2000} s={1.9} t={T} hold="pan" expr="scared" sweat={1} eye={[eye, 0]} mouth={0} pose={{ ...POSES.stand, armL: [-.5, 1.9] } as any} />
  </Cam></Frame>
    <div style={html({ left: 590, top: 390, width: 430, textAlign: 'center', background: 'rgba(20,18,28,.85)', border: '4px solid #ff4a6a', borderRadius: 14, padding: '8px 0', fontWeight: 900, fontSize: 40, color: '#fff', opacity: out(win(t, .3, .6)) })}>ВОРОТА: <span style={{ color: '#ff4a6a' }}>0:0{sec}</span></div>
    <div style={html({ left: 60, top: 390, width: 430, textAlign: 'center', background: 'rgba(20,18,28,.85)', border: '4px solid #5affd9', borderRadius: 14, padding: '8px 0', fontWeight: 900, fontSize: 40, color: '#fff', opacity: out(win(t, .3, .6)) })}>ЛИРА: <span style={{ color: '#5affd9' }}>В ПЛЕНУ</span></div></>); };

// ───────────── 21. Чиби-Желе спрашивает зрителей ─────────────
export const Ask: React.FC<P> = ({ t, T }) => { const look = t < 1.6 ? -1 : t < 2.8 ? 1 : Math.sin(t * 3), point = clamp((t - .7) / .3), hop = io(win(t, .05, .55));
  return (<Frame bg="#1a0408"><Cam z={lerp(1.0, 1.05, t / dur('ask'))}><g transform={`translate(0,${-GY})`}><GateWorld t={T} open={.3} />
    <DeathKnight x={150} y={2950} s={.5} t={T} reach={.45} /><Person x={-20} y={2890} s={.4} t={T} look="lira" hold={null} bowBack={false} expr="determined" shadow={false} pose={{ armL: [-1.9, .5], armR: [1.9, -.5], legL: [Math.sin(T * 9) * .4, .5], legR: [-Math.sin(T * 9) * .4, .5] } as any} />
    <Person x={600} y={3060} s={.62} t={T} hold="pan" expr="scared" sweat={1} eye={[look * .8, -.2]} /></g>
    <ChibiSlime x={lerp(600, 540, hop)} y={lerp(1300, 1140, hop) - Math.sin(hop * Math.PI) * 160} s={lerp(.22, .75, hop)} t={T} mouth={mouth('slime', T)} point={point} look={look} />
  </Cam></Frame>); };

// ───────────── 22. Сплит-экран: спасти Лиру или к Королю ─────────────
const SaveSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#0e2a30" /><Glow x={270} y={700} r={560} c="#5affd9" o={.4} id="svS" />
  <Person x={120} y={1010} s={.52} t={t} look="lira" hold={null} bowBack={false} expr="determined" shadow={false} pose={{ armL: [-1.9, .5], armR: [1.9, -.5], legL: [Math.sin(t * 9) * .4, .5], legR: [-Math.sin(t * 9) * .4, .5] } as any} />
  <DeathKnight x={340} y={1070} s={.62} t={t} reach={.5} /></g>);
const KingSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#3a0a0c" /><g transform="translate(-27,-558) scale(.55)"><GateWorld t={t} open={.4} /></g>
  <Person x={270} y={1070} s={.42} t={t} hold="pan" expr="determined" /></g>);
export const Split: React.FC<P> = ({ t, T }) => (<Choice t={t} left={{ title: 'СПАСТИ ЛИРУ', size: 52, sub: 'БОЙ С РЫЦАРЕМ СМЕРТИ', col: '#5affd9', art: <SaveSide t={T} /> }} right={{ title: 'К КОРОЛЮ', size: 56, sub: 'ПОКА ВОРОТА ОТКРЫТЫ', col: '#ff8a5a', art: <KingSide t={T} /> }}
  center={<div style={html({ left: 0, width: 1080, top: 1330, textAlign: 'center', opacity: out(win(t, 1.2, 1.4)) })}>
    <div style={{ transform: `scale(${spr(t, 1.2, { damping: 10 })})`, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: '#ffd23f', WebkitTextStroke: '13px #14121c', paintOrder: 'stroke fill' }}>ПИШИТЕ В КОММЕНТАХ:<br /><span style={{ color: '#5affd9' }}>А</span><span style={{ color: '#fff' }}> или </span><span style={{ color: '#ff8a5a' }}>Б</span><span style={{ color: '#fff' }}>?</span></div>
    <div style={{ marginTop: 26, opacity: out(win(t, 2.2, 2.5)) }}><span style={{ background: '#ffd23f', color: '#14121c', fontWeight: 900, fontSize: 40, padding: '8px 24px', borderRadius: 12 }}>СЕРИЯ 4 — ПО ВАШЕМУ ВЫБОРУ</span></div></div>} />);
