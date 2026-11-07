// Серия 1 «Тень над Алматы» v3 — нативный Remotion: планы по Sequence, поверх — табло, субтитры, стикер, зерно, звук.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { CAPS, DUR, SHOTS, storyAt } from './data';
import { EndCard, Hud, KineticCaption, PartSticker, Post } from '../ui/Overlays';
import * as Sh from './Shots';
import { shakeMany } from '../anim';
import { KNOCKS_END } from './shared.mjs';

const SHOT: Record<string, React.FC<{ t: number }>> = {
  e1s01: Sh.Hook, e1s02: Sh.Facade, e1s03: Sh.KitchenPour, e1s04: Sh.Split, e1s05: Sh.AlikPC, e1s06: Sh.DiasIron,
  e1s07a: ({ t }) => <Sh.DiasFace t={t} outfit="diasT" expr="smile" look={[0, .6]} />, e1s07b: Sh.ChatIn, e1s08a: Sh.ChatSend,
  e1s08b: ({ t }) => <Sh.DiasFace t={t} outfit="dias" expr="bigsmile" look={[.2, .5]} collar />, e1s09: Sh.Ripple, e1s10: Sh.Jet, e1s11: Sh.Chaos, e1s12: Sh.DiasFrozen, e1s13: Sh.BekaPhone, e1s14: Sh.Messenger,
  e1s15a: ({ t }) => <Sh.DiasFace t={t} expr="worry" look={[0, .7]} collar />, e1s15b: Sh.ChatFail, e1s16a: Sh.CallScreen,
  e1s16b: ({ t }) => <Sh.DiasFace t={t} expr="whisper" look={[-.4, .2]} lit={.3} collar ear={Math.min(1, (t - 41.8) / .3)} closed={t > 42.6 && t < 43.4} />,
  e1s17: Sh.TvOn, e1s18a: ({ t }) => <Sh.FootageShot t={t} kind="europe" t0={47} />, e1s18b: ({ t }) => <Sh.FootageShot t={t} kind="russia" t0={48.7} />, e1s18c: ({ t }) => <Sh.FootageShot t={t} kind="japan" t0={50.4} />,
  e1s19a: Sh.Map1, e1s19b: Sh.ReactTV, e1s20a: Sh.Anchor, e1s20b: Sh.Map2, e1s21: Sh.TvCollapse, e1s22: Sh.KitchenOut,
  e1s23a: Sh.CityA, e1s23b: Sh.CityB, e1s23c: Sh.CityC, e1s23d: Sh.CityD, e1s23e: Sh.CityE, e1s23f: Sh.CityF, e1s24: Sh.DiasWindow, e1s25: Sh.Avenue,
  e1s26: Sh.DarkFaces, e1s27: ({ t }) => <Sh.DarkFaces t={t} snap={76.6 + 0.94} />, e1s28: Sh.Door,
  e1s29: ({ t }) => <EndCard t={t} t0={80.8} text={['КТО-ТО', 'СТУЧИТ']} next="ЧАСТЬ 2 →" shakeX={shakeMany(t, KNOCKS_END.map(k => [k, 10, .25] as [number, number, number]))[0]} />,
};
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const C = SHOT[id]; return C ? <C t={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps, end = t >= 80.8, st = storyAt(t);
  return (<AbsoluteFill>{!end && <><Post t={t} /><Hud t={t} time={st.time} signal={st.signal} rewind={st.rewind} flashAt={33.6} /></>}<PartSticker t={t} n={1} /><KineticCaption t={t} caps={CAPS} hidden={end} /></AbsoluteFill>); };
export const Ep1Native: React.FC = () => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#0B1020', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0' }}>
    {SHOTS.map(([id, a, b]) => <Sequence key={id} name={id} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((Math.min(b, DUR) - a) * fps))}><ShotAt id={id} a={Math.round(a * fps) / fps} /></Sequence>)}
    <Overlay /></div><Audio src={staticFile('ep1-mix.wav')} /></AbsoluteFill>); };
