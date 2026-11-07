// Серия «Блэкаута» внутри Remotion: тот же движок canvas (public/engine/*.js), кадр рисуется по useCurrentFrame().
// Так все компоненты ТЗ (KineticCaption, Hud, PhoneScreen, TvScreen, BlackoutMap, LightsOutWave, JetFlyover, ScreenShake…)
// остаются одним кодом для обоих рендеров: tools/render.mjs и `npx remotion render`.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BASE = ["lib.js", "anim-kit.js", "fx-kit.js", "art.js", "art2.js"];
declare global { interface Window { renderFrame?: (t: number) => void; READY?: Promise<unknown>; __epLoaded?: string } }

const loadScript = (src: string) => new Promise<void>((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.body.appendChild(s); });

export const CanvasEpisode: React.FC<{ scripts: string[] }> = ({ scripts }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("загрузка движка серии")); const [ready, setReady] = useState(false);
  useEffect(() => { const key = scripts.join(","); if (window.__epLoaded === key) { setReady(true); continueRender(handle); return; }
    (async () => { for (const f of [...BASE, ...scripts]) await loadScript(staticFile(`engine/${f}`)); await window.READY; window.__epLoaded = key; setReady(true); continueRender(handle); })(); }, [handle, scripts]);
  useLayoutEffect(() => { if (ready && window.renderFrame) window.renderFrame(frame / fps); }, [frame, fps, ready]);
  return (<AbsoluteFill style={{ backgroundColor: "#0B1020" }}>
    <style>{`@font-face{font-family:'Mont';font-weight:100 900;src:url('${staticFile("fonts/Montserrat-VF.ttf")}')}@font-face{font-family:'JBM';font-weight:100 800;src:url('${staticFile("fonts/JetBrainsMono-VF.ttf")}')}`}</style>
    <canvas id="c" ref={ref} width={1080} height={1920} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>);
};
