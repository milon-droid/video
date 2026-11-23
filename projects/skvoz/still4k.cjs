const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+__dirname+'/src/scene_4k.html');await p.waitForFunction(()=>window.ready);
const fs=require('fs');for(const t of process.argv.slice(3)){const d=await p.evaluate(t=>{renderFrame(t);return document.getElementById('c').toDataURL('image/png');},+t);
fs.writeFileSync(process.argv[2]+'_'+t+'.png',Buffer.from(d.split(',')[1],'base64'));}await b.close();})();
