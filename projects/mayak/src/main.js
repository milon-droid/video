// диспетчер кадров
function story(t) { const s = SH.find(s => t >= s.t0 && t < s.t1) || SH[SH.length - 1]; s.fn(t - s.t0, t, s.t1 - s.t0); }
