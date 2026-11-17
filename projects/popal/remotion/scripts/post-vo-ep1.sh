# После озвучки серии 1 (v7, Qwen): длительности, тайминг слов (faster-whisper), рот, проверка ударений по звуку.
#   bash projects/popal/remotion/scripts/post-vo-ep1.sh   (из любого места; нужен ~/.venvs/qwentts)
set -e
cd "$(dirname "$0")/../../../.."   # корень репозитория
P=projects/popal; VO=$P/assets/vo/ep1v10; DATA=$P/remotion/src/data; SP=${SP:-/tmp}; PY=~/.venvs/qwentts/bin/python
python3 - <<PY
import json, subprocess, re
from pathlib import Path
d = {}
for f in sorted(Path("$VO").glob("*.wav")):
    d[f.stem] = round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(f)])), 3)
json.dump(d, open("$DATA/durations.json","w"), indent=1)
src = open("$P/remotion/src/ep1/timeline.mjs", encoding="utf-8").read()
cap = dict(re.findall(r"(\w\d): '([^']*)'", src.split("const CAP = {")[1].split("};")[0]))
lines = json.load(open("$P/vo/ep1-v10.json"))["lines"]
json.dump([{"id": l["id"], "text": l["text"].replace("+",""), "caption": cap[l["id"]].replace("{","").replace("}","")} for l in lines], open("$SP/ep1-words-in.json","w"), ensure_ascii=False)
print("durations", len(d), "сумма речи", round(sum(d.values()),1))
PY
$PY tools/words.py $SP/ep1-words-in.json $VO -o $DATA/words.json
python3 tools/mouth.py $VO -o $SP/ep1-mouth.js
python3 - <<PY
import json; s = open("$SP/ep1-mouth.js").read(); s = s[s.index("{"):s.rindex("}")+1]; m = json.loads(s)
json.dump({k: v["v"] if isinstance(v, dict) else v for k, v in m.items()}, open("$DATA/mouth.json","w"))
print("mouth", len(m))
PY
python3 -c "import json;d=json.load(open('$P/vo/ep1-v10.json'));[l.update(text=' '.join(p['t'] for p in l['parts'])) for l in d['lines'] if l.get('parts')];json.dump(d,open('$SP/ep1-stress.json','w'),ensure_ascii=False)"  # ударения — по размеченным кускам, не по субтитрам
METER2_HEAD=~/models/rus/meter/head.pt $PY tools/vo-stress-check.py $SP/ep1-stress.json $VO 2>&1 | grep -v -i "warn" | tail -15
