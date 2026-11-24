// node stills.cjs out.png t1 t2 ...  — лист кадров (SCALE=.5 по умолчанию)
const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
const out=process.argv[2];const ts=process.argv.slice(3).map(Number);const SC=+(process.env.SCALE||.5);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
p.on('console',m=>console.log('>',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/src/scene.html');await p.evaluate(()=>window.ready);
const tmp='/tmp/fuyu_st';fs.mkdirSync(tmp,{recursive:true});const files=[];
for(const t of ts){const px=await p.evaluate(t=>{renderFrame(t);const a=grab();let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s);},t);
 const f=`${tmp}/${t}.raw`;fs.writeFileSync(f,Buffer.from(px,'base64'));files.push(f);}
await b.close();
execFileSync('python3',['-c',`
import sys,numpy as np
from PIL import Image,ImageDraw
fs=sys.argv[3:];sc=float(sys.argv[2]);ims=[]
for f in fs:
  a=np.fromfile(f,np.uint8).reshape(1280,720,4)[:,:,:3];im=Image.fromarray(a).resize((int(720*sc),int(1280*sc)));d=ImageDraw.Draw(im);d.text((6,6),f.split('/')[-1][:-4],fill=(255,0,0));ims.append(im)
n=len(ims);c=min(n,5);r=(n+c-1)//c;W,H=ims[0].size;S=Image.new('RGB',(W*c,H*r),'white')
for i,im in enumerate(ims):S.paste(im,((i%c)*W,(i//c)*H))
S.save(sys.argv[1])`,out,''+SC,...files]);console.log('ok',out);})();
