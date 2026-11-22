const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:720,height:1280}});
await p.goto('file://'+__dirname+'/src/lava.html?rs='+(process.env.RS||1));await p.evaluate(()=>{renderFrame(0);grab();});
for(const t of process.argv.slice(2)){const t0=Date.now();await p.evaluate(t=>{renderFrame(+t);grab();},t);console.log(t,Date.now()-t0);}
await b.close();})();
