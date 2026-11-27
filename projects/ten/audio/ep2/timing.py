"""Серия 2: монтаж и время реплик из three/src/ep2-lines.js (тот же расчёт, что в картинке)."""
import json, os, subprocess
R = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(R, '..', '..', 'three', 'src')
def load():
    durs = json.load(open(os.path.join(SRC, 'ep2-durs.json')))
    js = f"import('{SRC}/ep2-lines.js').then(m=>console.log(JSON.stringify({{...m.build({json.dumps(durs)})}})))"
    o = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
    o['durs'] = durs; o['at'] = o.pop('AT'); o['total'] = o.pop('TOTAL'); return o
if __name__ == '__main__':
    o = load(); print('всего', round(o['total'], 2)); print(o['starts'])
