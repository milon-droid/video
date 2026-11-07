import React from "react";
import { Composition, Still } from "remotion";
import { Ep1, Ep1Cover } from "./Composition";

export const RemotionRoot: React.FC = () => (<>
  <Composition id="Ep1" component={Ep1} durationInFrames={2514} fps={30} width={1080} height={1920} />
  <Composition id="Ep1-720" component={Ep1} durationInFrames={2514} fps={30} width={720} height={1280} />
  <Still id="Ep1Cover" component={Ep1Cover} width={1080} height={1920} />
</>);
