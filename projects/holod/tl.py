# таймлайн планов (та же логика, что в main.js) — для листов превью
import json,re,sys
D=json.load(open('vo/durations.json'))
src=open('src/main.js').read(); blk=src[src.index('const SHOTS = ['):src.index('];',src.index('const SHOTS = ['))]
T=0; out=[]
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\], lead: ([\d.]+)(?:, gap: ([\d.]+))?, tail: ([\d.]+), min: ([\d.]+)",blk):
    i,ls,lead,gap,tail,mn=m.groups(); ls=re.findall(r"'(\w+)'",ls); t=float(lead)
    for k,l in enumerate(ls):
        if k: t+=float(gap or .3)
        t+=D.get(l,2.5)
    d=max(float(mn),t+float(tail)); out.append((i,T,d)); T+=d
if '-q' not in sys.argv:
    for i,t0,d in out: print(f"{i:3} {t0:6.2f} {d:5.2f}")
    print('TOTAL',round(T,2))
else: print(' '.join(f"{t0+d*f:.2f}" for i,t0,d in out for f in map(float,sys.argv[2:])))
