// Серия 2 «Хаос на улицах» — нативный Remotion: планы по Sequence, поверх — табло, субтитры, стикер, зерно, звук.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { CAPS, DUR, SHOTS, storyAt, T } from './data';
import { EndCard, Hud, KineticCaption, PartSticker, Post } from '../ui/Overlays';
import * as Sh from './Shots';

const SHOT: Record<string, React.FC<{ t: number }>> = {
  e2s01: Sh.DoorOpen, e2s02: Sh.KitchenGulp, e2s03: Sh.MetroFlash, e2s04: Sh.TunnelWalk, e2s05: Sh.KitchenSit, e2s06: Sh.DiasJacket, e2s07a: Sh.ChatFail2, e2s07b: Sh.DiasDecide,
  e2s08: Sh.WatchClose, e2s09: Sh.Stairs, e2s10: Sh.Yard, e2s11: Sh.JetAvenue, e2s12: Sh.AvenuePan, e2s13: Sh.Crossing, e2s14a: Sh.TaxiRun, e2s14b: Sh.TaxiStranger,
  e2s15: Sh.WatchesStreet, e2s16: Sh.TurnFreeze, e2s17: Sh.TruckDown, e2s18: Sh.Cab, e2s19: Sh.Headlights, e2s20: Sh.White, e2s21: Sh.White,
  e2s22: ({ t }) => <EndCard t={t} t0={T.end} text={['ОН НЕ', 'ТОРМОЗИТ']} next="ЧАСТЬ 3 →" />,
};
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const C = SHOT[id]; return C ? <C t={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps, end = t >= T.end, white = t >= T.white, st = storyAt(t);
  return (<AbsoluteFill>{!end && <Post t={t} />}{!white && <Hud t={t} time={st.time} signal={st.signal as 'lost'} rewind={st.rewind} />}<PartSticker t={t} n={2} /><KineticCaption t={t} caps={CAPS} hidden={end} /></AbsoluteFill>); };
export const Ep2: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#0B1020', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0' }}>
    {SHOTS.map(([id, a, b]) => <Sequence key={id} name={id} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((Math.min(b, DUR) - a) * fps))}><ShotAt id={id} a={Math.round(a * fps) / fps} /></Sequence>)}
    <Overlay /></div>{audio && <Audio src={staticFile('ep2-mix.wav')} />}</AbsoluteFill>); };
export const EP2_FRAMES = Math.round(DUR * 30);
