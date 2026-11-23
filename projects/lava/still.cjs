// node still.cjs out.png t1 t2 ...  — лист превью (SCALE по умолчанию .4)
const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
(async()=>{const [out,...ts]=process.argv.slice(2);const sc=+(process.env.SCALE||.4);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:720,height:1280}});p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/src/lava.html?rs='+(process.env.RS||1));const dir=fs.mkdtempSync('/tmp/lvs');const files=[];
for(const t of ts){const t0=Date.now();await p.evaluate(t=>renderFrame(+t),t);const f=`${dir}/${files.length}.png`;await p.locator('canvas').screenshot({path:f});files.push(f);console.log(t,Date.now()-t0,'ms');}
await b.close();const cols=Math.min(files.length,6);
execFileSync('ffmpeg',['-y','-loglevel','error',...files.flatMap(f=>['-i',f]),'-filter_complex',files.map((_,i)=>`[${i}]scale=${Math.round(720*sc)}:-1,drawtext=fontfile=../../fonts/Inter-Bold.otf:text='${ts[i]}':x=8:y=8:fontsize=22:fontcolor=white[v${i}]`).join(';')+';'+files.map((_,i)=>`[v${i}]`).join('')+(files.length>1?`xstack=inputs=${files.length}:layout=${files.map((_,i)=>`${(i%cols)?Array.from({length:i%cols},()=>'w0').join('+'):'0'}_${Math.floor(i/cols)?Array.from({length:Math.floor(i/cols)},()=>'h0').join('+'):'0'}`).join('|')}:fill=black`:'null'),out]);})();
