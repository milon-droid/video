// «Didn't Want To Anyway» (projects/ne-ochen): сборка планов по timeline.json, субтитры, бирки, звук public/ne-mix.wav.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../anim';
import { FONT } from '../theme';
import { NameTag } from '../stars/Clip';
import { ShotCouch, ShotTv } from './Movie';
import { ShotBench, ShotBox, ShotCorridor, ShotDoor, ShotFans, ShotGrab, ShotHandshake, ShotHearts, ShotSteal, ShotRun, ShotBenchSad, ShotToss, ShotWave } from './Stadium';
import { PhoneUI, ShotFlash, ShotFrozen, ShotLounge, Sub } from './Final';
import TL_EN from './timeline.json';
import MOUTH_EN from './mouth.json';
import { Lang, setLang, T as tr } from './i18n';

type Shot = { id: string; a: number; b: number; vo?: string; at?: number; voDur?: number; text?: string };
// русская версия снята по решению пользователя (2026-11-10); экранные строки RU остаются в i18n.ts
const TLS: Record<Lang, typeof TL_EN> = { en: TL_EN, ru: TL_EN }, MOUTHS: Record<Lang, any> = { en: MOUTH_EN, ru: MOUTH_EN };
export const neFrames = (l: Lang) => Math.round(TLS[l].total * 30);
export const NE_FRAMES = neFrames('en');
let SHOTS = TL_EN.shots as Shot[], MOUTH: any = MOUTH_EN;
// рот по голосу: только реплика в кадре (b2 — рукопожатие и флешбэк)
const mouth = (s: Shot, t: number) => { if (!s.vo || s.vo !== 'b2') return 0; const M = MOUTH[s.vo], i = Math.floor((t - (s.at ?? 0)) * M.fps); return i >= 0 && i < M.v.length ? M.v[i] * .7 : 0; };

const Scene: React.FC<{ s: Shot; t: number }> = ({ s, t }) => { const m = mouth(s, t);
  switch (s.id) {
    case 'tv': return <ShotTv t={t} />;
    case 'couch': return <ShotCouch t={t} crush={1.0} />;
    case 'grab': return <ShotGrab t={t} />;
    case 'toss': return <ShotToss t={t} toss={1.0} />;
    case 'bench': return <ShotBench t={t} up={.45} />;
    case 'shake': return <ShotHandshake t={t} m={m} />;
    case 'run': return <ShotRun t={t} />;
    case 'box': return <ShotBox t={t} />;
    case 'hearts': return <ShotHearts t={t} />;
    case 'steal': return <ShotSteal t={t} />;
    case 'benchSad': return <ShotBenchSad t={t} />;
    case 'fans': return <ShotFans t={t} />;
    case 'wave': return <ShotWave t={t} />;
    case 'corridor': return <ShotCorridor t={t} swap={1.05} />;
    case 'door': return <ShotDoor t={t} />;
    case 'lounge': return <ShotLounge t={t} reveal={1.0} />;
    case 'frozen': return <ShotFrozen t={t} />;
    case 'flash': return <ShotFlash t={t} m={m} cut={1.1} />;
    case 'hide': return <ShotFrozen t={t} hide={.25} />;
    default: return <rect width={1080} height={1920} fill="#000" />;
  } };

// ТВ-графика матча: табло (вымышленные HOME/AWAY) и плашка замены
const Scoreboard: React.FC<{ min: number }> = ({ min }) => (<div style={{ position: 'absolute', left: 60, top: 150, display: 'flex', fontFamily: FONT, fontWeight: 900, fontSize: 38, borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.4)' }}>
  <div style={{ background: '#f6f6f3', color: '#1d2a5c', padding: '8px 18px' }}>{tr('home')}</div><div style={{ background: '#14121c', color: '#fff', padding: '8px 18px' }}>0 – 0</div>
  <div style={{ background: '#b8202e', color: '#fff', padding: '8px 18px' }}>{tr('away')}</div><div style={{ background: '#2a2838', color: '#7dffb0', padding: '8px 18px' }}>{min}'</div></div>);
const SubWidget: React.FC<{ t: number }> = ({ t }) => { const k = clamp((t - .15) / .3), e = 1 - (1 - k) ** 3;
  return (<div style={{ position: 'absolute', left: 60, right: 60, top: 1520, transform: `translateX(${(1 - e) * -1100}px)`, fontFamily: FONT, fontWeight: 900, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,.5)' }}>
    <div style={{ background: '#ffd23f', color: '#14121c', fontSize: 34, padding: '8px 26px', letterSpacing: 4 }}>{tr('subst')}</div>
    <div style={{ background: 'rgba(14,12,22,.92)', color: '#fff', fontSize: 46, padding: '14px 26px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div><span style={{ color: '#2aff6a' }}>▲</span> {tr('viniShort')} <span style={{ color: '#9aa0b0', fontSize: 34 }}>7</span></div>
      <div><span style={{ color: '#ff3a3a' }}>▼</span> {tr('diom')} <span style={{ color: '#9aa0b0', fontSize: 34 }}>25</span></div></div></div>); };

export const NeClip: React.FC<{ audio?: boolean; lang?: Lang }> = ({ audio = true, lang = 'en' }) => {
  setLang(lang); SHOTS = TLS[lang].shots as Shot[]; MOUTH = MOUTHS[lang];
  const f = useCurrentFrame(), { fps, width } = useVideoConfig(), T = f / fps;
  const s = SHOTS.find(x => T >= x.a && T < x.b) ?? SHOTS[SHOTS.length - 1], t = T - s.a;
  const prevFlash = s.id === 'flash' || s.id === 'hide' ? clamp(1 - t / .25) : 0;
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      {s.id === 'phone' ? <PhoneUI t={t} msg={tr('msg')} reply={tr('reply')} tSend={2.0} tReply={3.3} />
        : <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <Scene s={s} t={t} />
          {s.id !== 'black' && <><defs><radialGradient id="neVig" cx=".5" cy=".45" r=".78"><stop offset=".62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient></defs>
            <rect width={1080} height={1920} fill="url(#neVig)" /></>}
        </svg>}
      {s.id === 'tv' && <NameTag t={t} t0={.5} x={60} y={420} name={tr('sadie')} sub={tr('onTv')} col="#ff5a7a" />}
      {s.id === 'couch' && <NameTag t={t} t0={.2} x={60} y={210} name={tr('vini')} sub={tr('atHome')} col="#ffd23f" />}
      {['benchSad', 'bench', 'shake', 'run', 'hearts', 'steal', 'wave'].includes(s.id) && <Scoreboard min={s.id === 'benchSad' ? 64 : s.id === 'bench' || s.id === 'shake' ? 71 : 72} />}
      {s.id === 'benchSad' && t < 2.4 && <NameTag t={t} t0={.3} x={60} y={330} name={tr('diom')} sub={tr('newSign')} col="#5af0c8" />}
      {s.id === 'shake' && <SubWidget t={t} />}
      {s.id === 'black' && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: clamp((t - .55) / .3) }}>
        <div style={{ color: '#fff', fontSize: 92, fontWeight: 900, textAlign: 'center', lineHeight: 1.1, padding: '0 80px' }}>{tr('title1')}<br />{tr('title2')}</div>
        <div style={{ color: '#8a8a96', fontSize: 46, fontWeight: 700, marginTop: 40 }}>{tr('parody')}</div></div>}
      {s.vo && s.text && s.id !== 'flash' && (() => { const off = s.id === 'phone' ? -1020 : s.id === 'grab' ? -980 : s.id === 'benchSad' ? -760 : 0;
        // длинную фразу — двумя блоками по очереди (по «...»), чтобы не закрывать действие
        const parts = s.text.includes('... ') && s.id === 'benchSad' ? [s.text.slice(0, s.text.indexOf('... ') + 3), s.text.slice(s.text.indexOf('... ') + 4)] : [s.text];
        let acc = 0; const tot = parts.reduce((a, p) => a + p.length, 0);
        return <div style={{ position: 'absolute', inset: 0, transform: `translateY(${off}px)` }}>{parts.map((p, i) => { const t0 = (s.at ?? 0) + (s.voDur ?? 1) * acc / tot, d = (s.voDur ?? 1) * p.length / tot; acc += p.length;
          return <Sub key={i} t={i < parts.length - 1 && t > t0 + d ? -99 : t} t0={t0} dur={d} text={p} />; })}</div>; })()}
      {s.id === 'corridor' && t < 1.7 && <div style={{ position: 'absolute', top: 230, width: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: 6, opacity: clamp(t / .2) * clamp((1.7 - t) / .2), textShadow: '0 4px 0 #14121c' }}>{tr('after')}</div>}
      {s.id === 'flash' && t < 1.1 && <div style={{ position: 'absolute', top: 200, width: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#f4e4c0', letterSpacing: 6, opacity: .85 }}>{tr('earlier')}</div>}
      <AbsoluteFill style={{ background: '#fff', opacity: prevFlash * .3, pointerEvents: 'none' }} />
    </div>{audio && <Audio src={staticFile('ne-mix.wav')} />}</AbsoluteFill>); };
