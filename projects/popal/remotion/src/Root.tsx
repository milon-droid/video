import React from 'react';
import { Composition, Still } from 'remotion';
import './fonts';
import { Test } from './Test';
import { Ep1, EP1_FRAMES } from './ep1/Ep1';
import { Sheet } from './ep2/Sheet';
import { Ep2, EP2_FRAMES } from './ep2/Ep2';
import { StarsClip, STARS_FRAMES } from './stars/Clip';
import { NeSheet } from './ne/Sheet';
import { NeTv } from './ne/TvTest';
import { NeClip, NE_FRAMES, neFrames } from './ne/Ne';
// «ПОПАЛ» с.1: Ep1-720 — сдача (720×1280 по ТЗ), Ep1 — 1080×1920, Ep1-mute — для кадров-превью без звука.
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Ep1-720" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: true }} />
  <Composition id="Ep1" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: true }} />
  <Composition id="Ep1-mute" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: false }} />
  <Composition id="Ep2-720" component={Ep2} durationInFrames={EP2_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: true }} />
  <Composition id="Ep2-mute" component={Ep2} durationInFrames={EP2_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: false }} />
  {/* «Звёзды 2026» (projects/stars-2026): Сэди Синк и Винисиус Жуниор, 10 с, 720p */}
  <Composition id="Stars-720" component={StarsClip} durationInFrames={STARS_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: true }} />
  <Composition id="Stars-mute" component={StarsClip} durationInFrames={STARS_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: false }} />
  {/* «Didn't Want To Anyway» (projects/ne-ochen) */}
  <Composition id="Ne-720" component={NeClip} durationInFrames={NE_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: true }} />
  <Composition id="Ne-mute" component={NeClip} durationInFrames={NE_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: false }} />
  <Composition id="NeRu-720" component={NeClip} durationInFrames={neFrames('ru')} fps={30} width={720} height={1280} defaultProps={{ audio: true, lang: 'ru' as const }} />
  <Composition id="NeRu-mute" component={NeClip} durationInFrames={neFrames('ru')} fps={30} width={720} height={1280} defaultProps={{ audio: false, lang: 'ru' as const }} />
  <Composition id="Ne-tv" component={NeTv} durationInFrames={170} fps={30} width={720} height={1280} />
  <Still id="NeSheet" component={NeSheet} width={1440} height={1280} />
  <Still id="Sheet2" component={Sheet} width={1080} height={1920} />
  <Still id="Test" component={Test} width={1080} height={1920} />
</>);
