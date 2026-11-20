import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Test, TestHeads } from './Test';
import { TestCity } from './TestCity';
import { Compare } from './Compare';
import { Ep1 } from './ep1/Ep1';
import { TOTAL } from './ep1/timeline';
export const RemotionRoot: React.FC = () => <>
  <Composition id="Ep1" component={Ep1} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestHeads" component={TestHeads} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestCity" component={TestCity} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Compare" component={Compare} durationInFrames={120} fps={30} width={1080} height={1920} />
</>;
