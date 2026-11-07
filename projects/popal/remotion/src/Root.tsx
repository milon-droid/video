import React from 'react';
import { Composition, Still } from 'remotion';
import './fonts';
import { Test } from './Test';
import { Ep1, EP1_FRAMES } from './ep1/Ep1';
// «ПОПАЛ» с.1: Ep1-720 — сдача (720×1280 по ТЗ), Ep1 — 1080×1920, Ep1-mute — для кадров-превью без звука.
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Ep1-720" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: true }} />
  <Composition id="Ep1" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: true }} />
  <Composition id="Ep1-mute" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={720} height={1280} defaultProps={{ audio: false }} />
  <Still id="Test" component={Test} width={1080} height={1920} />
</>);
