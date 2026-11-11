// Серия 1 v4 — из картинок пользователя (правки pravki-ep1-v3.md): планы по Sequence, поверх — табло, субтитры, стикер, зерно.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { CAPS, DUR, storyAt } from '../ep1/data';
import { KNOCKS_END } from '../ep1/shared.mjs';
import { EndCard, Hud, KineticCaption, PartSticker, Post } from '../ui/Overlays';
import { shakeMany } from '../anim';
import { Preload } from './Common';
import * as S from './Shots';

// [план, начало, конец] — тайминг реплик тот же, что в v3 (shared.mjs)
export const SHOTS4: [string, number, number, React.FC<{ t: number }>][] = [
  ['hook', 0, 1.9, S.Hook], ['facade', 1.9, 6.0, S.Facade], ['room', 6.0, 7.9, S.RoomWide], ['split', 7.9, 10.3, S.Split], ['study', 10.3, 14.0, S.Study],
  ['iron', 14.0, 15.9, S.IronShot], ['smile', 15.9, 17.4, S.DiasFaceSmile], ['chatIn', 17.4, 19.0, S.ChatIn], ['chatSend', 19.0, 20.7, S.ChatSend], ['iron2', 20.7, 22.0, S.IronAgain],
  ['tremor', 22.0, 25.0, S.Tremor], ['jet', 25.0, 27.4, S.Jet], ['shock', 27.4, 29.0, S.RoomShock], ['frozen', 29.0, 31.0, S.DiasFrozen], ['beka', 31.0, 33.2, S.BekaCheck],
  ['feed', 33.2, 35.0, S.Feed], ['typing', 35.0, 37.3, S.DiasFaceTyping], ['chatFail', 37.3, 40.0, S.ChatFail], ['call', 40.0, 41.8, S.CallFail], ['ear', 41.8, 44.0, S.DiasEar],
  ['tvOn', 44.0, 46.0, S.TvOn], ['anchor', 46.0, 47.6, S.AnchorShot], ['russia', 47.6, 48.93, S.FootRussia], ['europe', 48.93, 50.93, S.FootEurope], ['japan', 50.93, 52.9, S.FootJapan],
  ['map1', 52.9, 54.95, S.Map1], ['substation', 54.95, 57.2, S.Substation], ['watch', 57.2, 57.9, S.Watch], ['stumble', 57.9, 59.3, S.AnchorStumble], ['mapKz', 59.3, 61.2, S.MapKz],
  ['tvOff', 61.2, 62.3, S.TvOff], ['roomOut', 62.3, 64.3, S.RoomOut], ['cityA', 64.3, 65.3, S.CityA], ['hotel', 65.3, 66.3, S.Hotel], ['cathedral', 66.3, 67.3, S.Cathedral],
  ['arbat', 67.3, 68.3, S.Arbat], ['cable', 68.3, 69.9, S.Cable], ['cityDark', 69.9, 71.2, S.CityDark], ['window', 71.2, 73.4, S.DiasWindow], ['avenue', 73.4, 75.6, S.Avenue],
  ['trio', 75.6, 77.9, S.DarkTrio], ['door', 77.9, 80.8, S.Door],
  ['end', 80.8, DUR, ({ t }) => <EndCard t={t} t0={80.8} text={['КТО-ТО', 'СТУЧИТ']} next="ЧАСТЬ 2 →" shakeX={shakeMany(t, KNOCKS_END.map(k => [k, 10, .25] as [number, number, number]))[0]} />],
];
const ShotAt: React.FC<{ C: React.FC<{ t: number }>; a: number }> = ({ C, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); return <C t={a + f / fps} />; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps, end = t >= 80.8, st = storyAt(t);
  return (<AbsoluteFill>{!end && <><Post t={t} /><Hud t={t} time={st.time} signal={st.signal} rewind={st.rewind} flashAt={33.6} /></>}<S.RewindFx t={t} /><PartSticker t={t} n={1} /><KineticCaption t={t} caps={CAPS} hidden={end} /></AbsoluteFill>); };
export const Ep1v4: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  const hasMix = audio && getStaticFiles().some(f => f.name === 'ep1-mix.wav');
  return (<AbsoluteFill style={{ background: '#0B1020', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0' }}>
    <Preload />
    {SHOTS4.map(([id, a, b, C]) => <Sequence key={id} name={id} from={Math.round(a * fps)} durationInFrames={Math.max(1, Math.round((Math.min(b, DUR) - a) * fps))}><ShotAt C={C} a={Math.round(a * fps) / fps} /></Sequence>)}
    <Overlay /></div>{hasMix && <Audio src={staticFile('ep1-mix.wav')} />}</AbsoluteFill>); };
