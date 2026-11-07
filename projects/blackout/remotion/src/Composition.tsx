import React from "react";
import { Audio, staticFile } from "remotion";
import { CanvasEpisode } from "./engine/CanvasEpisode";

// Серия 1 «Тень над Алматы»: картинка — движок серии, звук — готовый микс (tools/sfx.py → out/ep1-mix.wav)
export const Ep1: React.FC = () => (<>
  <CanvasEpisode scripts={["ep1-words.js", "ep1-mouth.js", "ep1.js"]} />
  <Audio src={staticFile("ep1-mix.wav")} />
</>);
export const Ep1Cover: React.FC = () => <CanvasEpisode scripts={["ep1-words.js", "ep1-mouth.js", "ep1.js", "cover1.js"]} />;
