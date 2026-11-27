// node stills.cjs out.png t1 t2 ... [PAGE=src/test.html MODE=1 SCALE=.5] — лист кадров
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2];const ts=process.argv.slice(3).map(Number);const PAGE=process.env.PAGE||'src/scene.html';
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/'+PAGE+(process.env.MODE?'?':''));if(process.env.MODE)await p.evaluate(m=>window.MODE=+m,process.env.MODE);
await p.evaluate(()=>window.ready);await p.evaluate(()=>document.fonts.ready);
const S=+(process.env.SCALE||.5);const imgs=[];
for(const t of ts){const t0=Date.now();await p.evaluate(t=>renderFrame(t),t);imgs.push(await p.screenshot({type:'png'}));console.log('t',t,(Date.now()-t0)+'ms');}
const iss=await p.evaluate(()=>globalThis.TEXT_ISSUES||[]);if(iss.length)console.log('ТЕКСТ ЗА ПЛАШКОЙ',JSON.stringify(iss));
await b.close();
const dir=fs.mkdtempSync('/tmp/claude-0/st');imgs.forEach((b,i)=>fs.writeFileSync(`${dir}/${String(i).padStart(3,'0')}.png`,b));
const cols=Math.min(ts.length,5);require('child_process').execSync(`ffmpeg -y -loglevel error -pattern_type glob -i '${dir}/*.png' -vf "scale=${Math.round(720*S)}:-1,tile=${cols}x${Math.ceil(ts.length/cols)}" ${out}`);console.log('лист',out);})();
