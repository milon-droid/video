// node still.cjs out.png t1 t2 ...   (SCALE=.4) — лист кадров
const {chromium}=require('playwright');const {execFileSync}=require('child_process');const fs=require('fs');
(async()=>{const out=process.argv[2];const ts=process.argv.slice(3).map(Number);const S=+(process.env.SCALE||.4);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/src/scene.html');await p.evaluate(()=>window.ready);const tmp=fs.mkdtempSync('/tmp/lst');const files=[];
for(const [i,t] of ts.entries()){await p.evaluate(t=>renderFrame(t),t);const f=`${tmp}/${String(i).padStart(3,'0')}.png`;
 await (await p.$('canvas')).screenshot({path:f});files.push(f);}
await b.close();const cols=Math.min(ts.length,+(process.env.COLS||5));
const lab=ts.map((t,i)=>`[${i}:v]scale=${Math.round(720*S)}:-1,drawtext=fontfile=/home/user/video/fonts/Inter-Regular.ttf:text='${t}':x=6:y=6:fontsize=18:fontcolor=white[v${i}]`).join(';');
const rows=Math.ceil(ts.length/cols);const lay=ts.map((_,i)=>`${(i%cols)*Math.round(720*S)}_${Math.floor(i/cols)*Math.round(1280*S)}`).join('|');
const args=['-y','-loglevel','error'];files.forEach(f=>args.push('-i',f));
args.push('-filter_complex',ts.length>1?`${lab};${ts.map((_,i)=>`[v${i}]`).join('')}xstack=inputs=${ts.length}:layout=${lay}:fill=black`:lab.replace('[v0]',''),out);
execFileSync('ffmpeg',args);console.log('ok',out);})();
