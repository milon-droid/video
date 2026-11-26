import json,re,sys
D=json.load(open('vo/durations.json')); src=open('src/main.js').read(); blk=src[src.index('const SHOTS = ['):src.index('];',src.index('const SHOTS = ['))]
T=0; out=[]
for m in re.finditer(r"\{ id: '(\w+)', lines: \[([^\]]*)\](?:, lead: ([\d.]+))?(?:, tail: ([\d.]+))?, min: ([\d.]+)",blk):
    i,ls,lead,tail,mn=m.groups(); ls=re.findall(r"'(\w+)'",ls); t=float(lead or 0)
    for k,l in enumerate(ls):
        if k: t+=.35
        t+=D.get(l,2)
    d=max(float(mn),t+float(tail or 0)); out.append((i,T,d)); T+=d
if '-q' in sys.argv: print(' '.join(f"{t0+d*float(f):.2f}" for i,t0,d in out for f in sys.argv[2:]))
else:
    for i,t0,d in out: print(f"{i:4} {t0:6.2f} {d:5.2f}")
    print('TOTAL',round(T,2))
