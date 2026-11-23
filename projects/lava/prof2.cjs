const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:720,height:1280}});
await p.goto('file://'+__dirname+'/src/lava.html');const t=+process.argv[2];
await p.evaluate(t=>{renderFrame(t);grab();},t);
for(const v of ['full','nofaces','noblobs']){const t0=Date.now();await p.evaluate(([t,v])=>{const S0=window.STORY0||(window.STORY0=window.STORY);window.STORY=tt=>{const s=S0(tt);if(v!='full')s.faces=[];if(v=='noblobs')s.blobs=[];return s;};renderFrame(t);grab();},[t,v]);console.log(v,Date.now()-t0);}
await b.close();})();
