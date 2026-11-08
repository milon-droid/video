import React from "react";
import { Composition, Still } from "remotion";
import { Ep1Native } from "./ep1/Ep1";
import { CharTest } from "./CharTest";
import { Ep1Cover } from "./ep1/Cover";
import { Ep2, EP2_FRAMES } from "./ep2/Ep2";

// Серия 1 v3 — нативный Remotion (SVG/HTML). Ep1 — 1080×1920 (финал), Ep1-720 — черновик.
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Ep1" component={Ep1Native} durationInFrames={2514} fps={30} width={1080} height={1920} />
  <Composition id="Ep1-720" component={Ep1Native} durationInFrames={2514} fps={30} width={720} height={1280} />
  <Composition id="Ep2" component={Ep2} durationInFrames={EP2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Ep2-720" component={Ep2} durationInFrames={EP2_FRAMES} fps={30} width={720} height={1280} />
  <Composition id="Ep2-silent" component={Ep2} defaultProps={{ audio: false }} durationInFrames={EP2_FRAMES} fps={30} width={720} height={1280} />
  <Still id="Ep1Cover" component={Ep1Cover} width={1080} height={1920} />
  <Still id="CharTest" component={CharTest} width={1080} height={1920} />
</>);
