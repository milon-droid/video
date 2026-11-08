# После озвучки серии 2: длительности, тайминг слов (faster-whisper), рот, проверка ударений по звуку.
set -e
cd "$(dirname "$0")/../../../.."   # корень репозитория
P=projects/popal; VO=$P/assets/vo/ep2; DATA=$P/remotion/src/data/ep2; SP=${SP:-/tmp}
python3 - <<PY
import json, subprocess
from pathlib import Path
d = {}
for f in sorted(Path("$VO").glob("*.wav")):
    d[f.stem] = round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(f)])), 3)
d["p1"] = json.load(open("$P/remotion/src/data/durations.json"))["m1"]
json.dump(d, open("$DATA/durations.json","w"), indent=1)
# подписи для тайминга слов — из CAP модуля серии (без скобок акцента)
import re
src = open("$P/remotion/src/ep2/timeline.mjs", encoding="utf-8").read()
cap = dict(re.findall(r"(\w\d): '([^']*)'", src.split("export const CAP = {")[1].split("};")[0]))
lines = json.load(open("$P/vo/ep2.json"))["lines"]
json.dump([{"id": l["id"], "text": l["text"].replace("+",""), "caption": cap[l["id"]].replace("{","").replace("}","")} for l in lines], open("$SP/ep2-words-in.json","w"), ensure_ascii=False)
print("durations", len(d), "сумма речи", round(sum(d.values()),1))
PY
python3 tools/words.py $SP/ep2-words-in.json $VO -o $DATA/words.json
python3 tools/mouth.py $VO -o $SP/ep2-mouth.js
python3 - <<PY
import json; s = open("$SP/ep2-mouth.js").read(); s = s[s.index("{"):s.rindex("}")+1]; m = json.loads(s)
json.dump({k: v["v"] if isinstance(v, dict) else v for k, v in m.items()}, open("$DATA/mouth.json","w"))
print("mouth", len(m))
PY
