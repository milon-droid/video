import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Test, TestHeads } from './Test';
import { TestCity } from './TestCity';
import { Compare } from './Compare';
import { Ep1 } from './ep1/Ep1';
import { TOTAL } from './ep1/timeline';
import { Ep2 } from './ep2/Ep2';
import { TOTAL as TOTAL2 } from './ep2/timeline';
import { VarA, VarB, VarC, VTOT } from './ep2v/Variants';
export const RemotionRoot: React.FC = () => <>
  <Composition id="Ep1" component={Ep1} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Ep2" component={Ep2} durationInFrames={Math.round(TOTAL2 * 30)} fps={30} width={1080} height={1920} />
  <Composition id="VarA" component={VarA} durationInFrames={Math.round(VTOT.A * 30)} fps={30} width={1080} height={1920} />
  <Composition id="VarB" component={VarB} durationInFrames={Math.round(VTOT.B * 30)} fps={30} width={1080} height={1920} />
  <Composition id="VarC" component={VarC} durationInFrames={Math.round(VTOT.C * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestHeads" component={TestHeads} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestCity" component={TestCity} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Compare" component={Compare} durationInFrames={120} fps={30} width={1080} height={1920} />
</>;
