const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:720,height:1280}});
await p.goto('file://'+__dirname+'/src/lava.html?rs='+(process.env.RS||1));const t=+process.argv[2];
await p.evaluate(t=>{renderFrame(t);grab();},t);
for(const v of ['full','post']){const t0=Date.now();await p.evaluate(([t,v])=>{if(v=='post'){window.SKIPSCENE=1;}renderFrame(t);grab();},[t,v]);console.log(v,Date.now()-t0);}
await b.close();})();
