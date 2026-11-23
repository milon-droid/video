// node render.cjs out.mp4 [from] [to]   — параллельный рендер (WORKERS=4, RS=1), readPixels → ffmpeg
const {chromium}=require('playwright');const {spawn,execFileSync}=require('child_process');const fs=require('fs');const path=require('path');
const out=process.argv[2]||'render/liniya.mp4';const FPS=30;const N=+(process.env.WORKERS||4);
(async()=>{
  const b0=await chromium.launch();const p0=await b0.newPage();await p0.goto('file://'+__dirname+'/src/scene.html');
  const D=await p0.evaluate(()=>window.DURATION);await b0.close();
  const from=+(process.argv[3]||0), to=+(process.argv[4]||D);const f0=Math.round(from*FPS), f1=Math.round(to*FPS);
  const tmp=fs.mkdtempSync('/tmp/lnr');const per=Math.ceil((f1-f0)/N);const t0=Date.now();let done=0;
  await Promise.all(Array.from({length:N},async(_,w)=>{
    const a=f0+w*per, z=Math.min(f1,a+per); if(a>=z) return;
    const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
    await p.goto('file://'+__dirname+'/src/scene.html');
    const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s','720x1280','-r',''+FPS,'-i','-','-c:v','libx264','-crf','16','-preset','medium','-pix_fmt','yuv420p',`${tmp}/${w}.mp4`]);
    for(let f=a;f<z;f++){const px=await p.evaluate(t=>{renderFrame(t);const a=grab();let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s);},f/FPS);
      await new Promise(r=>ff.stdin.write(Buffer.from(px,'base64'),r));done++;
      if(done%30==0){const el=(Date.now()-t0)/1000;console.log(`${done}/${f1-f0} кадров, ${el.toFixed(0)} с, осталось ~${(el/done*(f1-f0-done)/60).toFixed(1)} мин`);}}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();}));
  const list=Array.from({length:N},(_,w)=>`${tmp}/${w}.mp4`).filter(fs.existsSync);
  fs.writeFileSync(`${tmp}/l.txt`,list.map(f=>`file '${f}'`).join('\n'));
  fs.mkdirSync(path.dirname(out),{recursive:true});
  execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${tmp}/l.txt`,'-c','copy',out]);
  console.log('готово',out,((Date.now()-t0)/60000).toFixed(1),'мин');})();
