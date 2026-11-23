const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const e of (process.env.EXPS||'none,flat,steps').split(',')){const p=await b.newPage({viewport:{width:720,height:1280}});
await p.goto('file://'+__dirname+'/src/lava.html?rs=.5&exp='+e);await p.evaluate(()=>{renderFrame(0);grab();});
if(e=='nofaces')await p.evaluate(()=>{const S0=STORY;window.STORY=t=>{const s=S0(t);s.faces=[];return s;}});
let tot=0;for(const t of [7.5,20,32]){const t0=Date.now();await p.evaluate(t=>{renderFrame(+t);grab();},t);tot+=Date.now()-t0;}console.log(e,tot);await p.close();}
await b.close();})();
