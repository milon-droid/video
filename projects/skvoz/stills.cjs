// node stills.cjs out.png t1 t2 ...  — лист кадров (SCALE=.4)
const {chromium}=require('playwright');const {execFileSync}=require('child_process');const fs=require('fs');
(async()=>{const out=process.argv[2];const ts=process.argv.slice(3).map(Number);const S=+(process.env.SCALE||.4);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/src/scene.html');await p.waitForFunction(()=>window.ready);
const tmp=fs.mkdtempSync('/tmp/skst');const files=[];
for(const [i,t] of ts.entries()){await p.evaluate(t=>renderFrame(t),t);const f=`${tmp}/${String(i).padStart(3,'0')}.png`;await p.locator('canvas').screenshot({path:f});files.push(f);}
await b.close();const cols=Math.min(ts.length,+(process.env.COLS||6));
execFileSync('ffmpeg',['-y','-loglevel','error','-pattern_type','glob','-i',`${tmp}/*.png`,'-vf',`scale=${Math.round(720*S)}:-1,tile=${cols}x${Math.ceil(ts.length/cols)}:padding=4`,'-frames:v','1',out]);
console.log('ok',out);})();
