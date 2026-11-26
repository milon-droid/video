// STITCHED — 11 планов. Каждый план: a..b (с), draw(u — время от начала плана, t — общее).
(function(){
const{K,ss,cl,lerp,eio,eo,ei,back,rnd}=E;const GY=Wd.GY;
const CUES=[];const cue=(t,id,g=1,o={})=>CUES.push({t:+t.toFixed(3),id,g,...o});
// ---------- интерфейс трансляции (O, поверх) ----------
const UI={};
UI.ctx=()=>{const o=E.X.O;o.setTransform(E.S,0,0,E.S,0,0);return o;};
UI.live=(a,viewers,title='OLLIE 24/7 · AI-DIRECTED')=>{if(a<=0)return;const o=UI.ctx();o.save();o.globalAlpha=cl(a);const y=150-(1-eo(a))*60;
  o.fillStyle='#ff2d55';o.beginPath();o.roundRect(60,y,150,58,12);o.fill();o.fillStyle='#fff';o.font='700 34px InterB';o.textBaseline='middle';o.fillText('● LIVE',78,y+30);
  o.fillStyle='rgba(0,0,0,.55)';o.beginPath();o.roundRect(222,y,230,58,12);o.fill();o.fillStyle='#fff';o.fillText('👁 '+viewers,240,y+30);
  o.font='600 28px InterS';o.fillStyle='rgba(255,255,255,.9)';o.shadowColor='rgba(0,0,0,.6)';o.shadowBlur=8;o.fillText(title,62,y+92);o.restore();};
UI.fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':''+Math.round(n);
// чат: msgs [[t0,name,text,color]], t — текущее время
UI.chat=(t,msgs,a=1,y0=1380)=>{const o=UI.ctx();o.save();o.globalAlpha=cl(a);const vis=msgs.filter(m=>t>=m[0]).slice(-5);let y=y0;
  for(let i=vis.length-1;i>=0;i--){const m=vis[i];const age=t-m[0];const k=eo(age*4);o.font='700 30px InterB';const nw=o.measureText(m[1]).width;o.font='600 30px InterS';const tw=o.measureText(m[2]).width;
    const w=nw+tw+52,h=56;o.globalAlpha=cl(a)*k*(i<vis.length-4?.5:1);o.fillStyle='rgba(10,10,14,.55)';o.beginPath();o.roundRect(60-(1-k)*40,y-h,w,h,28);o.fill();
    o.textBaseline='middle';o.font='700 30px InterB';o.fillStyle=m[3]||'#9fd3ff';o.fillText(m[1],82-(1-k)*40,y-h/2);o.font='600 30px InterS';o.fillStyle='#fff';o.fillText(m[2],82+nw+12-(1-k)*40,y-h/2);y-=h+12;}
  o.restore();};
UI.hearts=(t,t0,a=1,n=14)=>{const o=UI.ctx();o.save();for(let i=0;i<n;i++){const st=t0+i*.28+rnd(i)*.2;const age=t-st;if(age<0||age>2.4)continue;
  const x=960+Math.sin(age*3+i)*30-age*20,y=1600-age*380;o.globalAlpha=cl(a)*(1-age/2.4);o.font=`${44+rnd(i+3)*20}px InterB`;o.fillText(['❤️','😱','🔥','❤️','👀'][i%5],x,y);}o.restore();};
UI.ended=(a)=>{if(a<=0)return;const o=UI.ctx();o.save();o.globalAlpha=cl(a);o.fillStyle='rgba(0,0,0,.6)';o.beginPath();o.roundRect(300,150,480,64,14);o.fill();o.fillStyle='#fff';o.font='700 32px InterB';o.textAlign='center';o.textBaseline='middle';o.fillText('LIVE ENDED',540,183);o.restore();};
// подпись-нашивка в экранных координатах
const label=(lines,a,y=1430,sz=62,col='#8a2433',rot=-1.5,out=1)=>{if(a<=0||out<=0)return;E.screen();E.label(lines,540,y,sz,{app:cl(a*3)*eo(out),prog:cl(a*1.6-.15),col,rot});};
// иголка-«режиссёр»: колебание вверх-вниз во время шитья
const needleAt=(p,u,ang=-1.0,len=760,thr='#f3b42c',rate=13)=>{if(!p)return;const s=Math.sin(u*rate*6.283/2);C.needle(p[0],p[1],ang,len,Math.max(0,-s)*.35,Math.max(0,s)*.1,thr);};
const town=(t,o)=>Wd.town(t,o);
// дыра в небе: распущенные ряды (ступеньками, как распускается гладь)
const holeRows=(cx,cy,R,seed=1)=>{const rows=[];const rh=8;for(let y=-R;y<=R;y+=rh){const k=Math.sqrt(Math.max(0,1-(y/R)**2));const w=R*k*(.82+.3*rnd(y*.37+seed));if(w>4)rows.push([cx-w*(1+.12*rnd(y+9)),cy+y,w*(2+.1*rnd(y*1.3)),rh+.5]);}return rows;};
const drawHole=(t,cx,cy,R,notesA)=>{if(R<=2)return;const rows=holeRows(cx,cy,R);const P=new Path2D();rows.forEach(r=>P.rect(...r));
  E.save();E.clip(P);E.fill(E.Pr(cx-R*1.4,cy-R*1.2,R*2.8,R*2.4),'#e9dfc9',{t:'fab',seed:3});
  // проколы от стежков
  const XC=E.X.C;XC.save();XC.fillStyle='rgba(60,45,30,.35)';for(let y=cy-R;y<cy+R;y+=8)for(let x=cx-R*1.3;x<cx+R*1.3;x+=32){const xx=x+((y/8)%4)*6;XC.beginPath();XC.arc(xx,y,1.6,0,6.28);XC.fill();}XC.restore();
  Wd.notes(notesA);E.restore();
  // торчащие нитки по краю
  rows.forEach((r,i)=>{if(i%3)return;const col=r[1]<150?'#6ea8d6':'#86bce2';const ex=r[0]+r[2];const wv=Math.sin(t*3+i)*6;C.thread([[ex,r[1]+4],[ex+14,r[1]+8+wv],[ex+26,r[1]+2+wv]],col,4,.12);
    C.thread([[r[0],r[1]+4],[r[0]-14,r[1]+9-wv],[r[0]-24,r[1]+3]],col,4,.12);});};
// ---------- ПЛАНЫ ----------
const SH=[];const shot=(a,b,draw)=>SH.push({a,b,draw});
// 1. ХУК: иголка вышивает солнце
shot(0,3.2,(u,t)=>{const z=K(u,[[0,1.48],[3.2,1.62]],E.lin);E.cam={x:K(u,[[0,745],[3.2,730]]),y:K(u,[[0,600],[3.2,610]]),z,r:K(u,[[0,-.03],[3.2,0]])};E.view();
  const pr=lerp(.3,1,ss(0,2.3,u));const nd=town(t,{sun:pr});
  const wv=Math.sin(u*10);C.fig({x:560,y:GY,s:1,look:'ollie',face:{look:[1,-1],mouth:'grin',blink:u>2.9&&u<3.02?1:0},arm:[[.15,.1],[2.7+wv*.25,.3]]});
  if(u<2.55){const p=nd||[Wd.SUN[0]+60,Wd.SUN[1]-60];needleAt(p,u,-1.0,1000,'#f3b42c',14);}
  else{const k=ei((u-2.55)/.5);C.needle(Wd.SUN[0]+130+k*500,Wd.SUN[1]+40-k*900,-1.0,1000,.4,0);}
  label(['EVERY MORNING,','SOMEONE STITCHES HIS SUN.'],(u-.35)/1.2,1010,60);});
// 2. Городок: Олли выходит, все машут синхронно
shot(3.2,7.6,(u,t)=>{const k=eio(u/1.3);E.cam={x:lerp(690,640,k),y:lerp(610,1075,k),z:lerp(1.62,1.12,k)+u*.015,r:0};E.view();town(t,{});
  const wave=Math.sin(u*9);const wv=u>1.4&&u<3.6;
  const A=wv?[[.15,.1],[2.7+wave*.25,.3]]:[[.15,.1],[.15,.1]];
  for(const[x,lk,dir]of[[820,'lady',-.4],[1080,'mail',-.6],[60,'man',.5]])C.fig({x,y:GY-6,s:.95,look:lk,dir,arm:A,face:{mouth:'grin',look:[dir<0?-1:1,0],blink:(u%2.6)>2.48?1:0}});
  C.fig({x:560,y:GY,s:1,look:'ollie',dir:0,arm:u<.6?[[.15,.1],[2.7+Math.sin(u*10)*.25,.3]]:A,face:{mouth:wv?'grin':'smile',look:u<1.4?[0,-.6]:[1,0],blink:(u%3)>2.85?1:0}});
  C.balloon(820+42,GY-150,t,.95);
  label(["OLLIE'S LIFE WAS PERFECT."],(u-1.6)/1.2,1430,62);});
// 3. Дама с шариком проходит трижды
shot(7.6,12.4,(u,t)=>{const ox=lerp(520,1150,cl(u/3.0)*(2-cl(u/3.0))*.5+cl(u/3)*.5);const stop=u>3.0;
  E.cam={x:ox+40,y:K(u,[[0,1085],[3.4,1088],[4.8,960]]),z:K(u,[[0,1.2],[3.4,1.25],[4.8,1.75]]),r:0};E.view();town(t,{});
  for(let i=0;i<3;i++){const st=.1+i*.95;const lu=u-st;if(lu<0)continue;const lx=ox+700-lu*420;if(lx<ox-900)continue;
    C.fig({x:lx,y:GY+70,s:1.04,look:'lady',dir:-1,walk:lu*2.6,face:{mouth:'grin',look:[-1,0]}});C.balloon(lx-50,GY+70-166,t+i*0,1.04);}
  const tn=ss(1.6,2.2,u)-ss(2.4,3.0,u);
  C.fig({x:ox,y:GY,s:1,look:'ollie',dir:stop?0:.6,walk:stop?null:u*2.2,head:stop?-.08:0,
    face:{mouth:stop?'frown':'smile',brow:stop?-1:0,look:stop?[0,0]:[1-2*cl((u-1)/2)*0,0],blink:(u%2.2)>2.08?1:0}});
  label(['A LITTLE TOO PERFECT.'],(u-3.2)/1.2,330,62);});
// 4. Дождь только над ним
shot(12.4,17,(u,t)=>{const ox=K(u,[[0,600],[1,600],[1.5,420],[2.2,420],[2.7,780],[4.6,780]]);
  const cx=K(u,[[0,600],[1.3,600],[1.9,420],[2.6,420],[3.2,780]],);const cy=GY-560;
  E.cam={x:K(u,[[0,620],[3.6,640],[4.6,ox]]),y:K(u,[[0,1050],[3.6,1060],[4.6,930]]),z:K(u,[[0,1.15],[3.6,1.2],[4.6,1.85]]),r:0};E.view();town(t,{});
  // нити-тросы к облаку
  const sw=Math.sin(t*5)*12;C.thread([[cx-90,cy-30],[cx-60+sw,cy-500],[cx-40,cy-1600]],'#9aa3ad',3,.1);C.thread([[cx+100,cy-30],[cx+80+sw,cy-500],[cx+60,cy-1600]],'#9aa3ad',3,.1);
  // дождь
  for(let i=0;i<34;i++){const x=cx-130+rnd(i)*260;const y=cy+40+((rnd(i*3)*480+u*900)%480);if(y>GY-20)continue;E.stitch(x,y,x-3,y+30,5,'#5b8fd0');}
  const P=E.Ps([[cx-170,cy+40],[cx-150,cy-30],[cx-70,cy-80],[cx+20,cy-95],[cx+120,cy-60],[cx+180,cy+20],[cx+120,cy+55],[cx-100,cy+58]]);E.drop(P,.3,14,10,12);E.fill(P,'#8d96a3',{t:'sat',a:10});
  E.fill(E.Ps([[cx-110,cy-20],[cx-40,cy-60],[cx+40,cy-62],[cx+20,cy-30],[cx-60,cy-12]]),'#a9b1bb',{t:'sat',a:10,h:.6});
  const mv=Math.abs(ox-K(u-.05,[[0,600],[1,600],[1.5,420],[2.2,420],[2.7,780],[4.6,780]]))>1;
  C.fig({x:ox,y:GY,s:1,look:'ollie',dir:mv?(u<2?-.6:.6):0,walk:mv?u*3:null,arm:u>3.4?[[.4,.6],[.4,.6]]:[[.2,.2],[.2,.2]],
    face:{mouth:u>3.3?'flat':'frown',brow:-1,look:u>3.6?[0,-1]:[u<2?-1:1,0],blink:(u%2)>1.9?1:0}});
  // капли на нём
  for(let i=0;i<8;i++){const y=GY-300+((rnd(i*5)*300+u*600)%300);E.stitch(ox-50+rnd(i+1)*100,y,ox-52+rnd(i+1)*100,y+18,4,'#7fb1e8');}
  label(['THE RAIN ONLY FOLLOWED HIM.'],(u-.7)/1.2,1430,60,'#8a2433',-1.5,(3.6-u)/.3);});
// 5. Свисающая нитка → распускает небо → «сценарий» на льне
shot(17,21.5,(u,t)=>{const ox=640;const pull=ss(1.3,3.2,u);const R=pull*430;
  E.cam={x:K(u,[[0,660],[1.4,660],[3.2,520],[4.5,520]]),y:K(u,[[0,1010],[1.4,1010],[3.2,560],[4.5,500]]),z:K(u,[[0,1.45],[1.4,1.45],[3.2,1.08],[4.5,1.14]]),r:0};E.view();
  town(t,{});drawHole(t,380,140,R,ss(2.2,3.6,u));
  // свисающая нитка
  const hx=700,hy=GY-520;const sway=Math.sin(t*2.2)*14*(1-pull);const grab=u>1.2;const hand=[ox+38,GY-330];
  const end=grab?[hand[0]+pull*-30,hand[1]+pull*40]:[hx+20+sway,GY-360+Math.sin(t*3)*6];
  C.thread([[hx-60,hy-250+pull*-200],[hx-10+sway*.5,hy-80],[(hx+end[0])/2+sway,(hy+end[1])/2],end],'#86bce2',5);
  if(grab&&pull>.05){const pts=[end];for(let i=1;i<6;i++)pts.push([end[0]-20+Math.sin(i*1.7)*30,end[1]+i*22*pull]);C.thread(pts,'#86bce2',5);} // вытянутая нить кучкой
  C.fig({x:ox,y:GY,s:1,look:'ollie',lean:grab?-.12*pull*(1+Math.sin(u*18)*.2):0,arm:grab?[[.3,.4],[2.5-pull*.7,.2]]:[[.15,.1],[u>.6?1.2:.2,.3]],
    face:{mouth:u>3.0?'o':(grab?'flat':'smile'),wide:u>3.0,brow:u>3?1:0,browUp:u>3?1:0,look:u>2.6?[-.5,-1]:[.6,-.8],open:1.2}});
  label(['THEN HE PULLED','A LOOSE THREAD.'],(u-.2)/1.2,330,60,'#8a2433',-1.5,(2.4-u)/.3);});
// 6. Отъезд: пяльцы, студия, LIVE
const CHAT1=[[23.6,'mira_k','HE FOUND THE NOTES 😱'],[24.3,'dan99','restitch it!!','#ffb36b'],[24.9,'zoe','best episode ever'],[25.5,'tomasz','is the balloon lady a loop?? 💀','#b6ff9f'],[26.1,'k1ra','10,950 days lol']];
shot(21.5,27,(u,t)=>{const k=eio(cl(u/2.6));const z=Math.exp(lerp(Math.log(1.12),Math.log(.135),k));
  E.cam={x:lerp(520,700,k),y:lerp(500,1550,k),z,r:0};E.view();
  if(z<.6)Wd.studio(t,lerp(9,3.5,k));
  // ткань за пределами обода
  if(z<.6){const XC=E.X.C;const CP=E.Ps([[-1500,-1300],[900,-1550],[3300,-1300],[3500,900],[3250,3200],[900,3350],[-1450,3150],[-1700,900]]);E.drop(CP,.5,60,40,60);E.fill(CP,'#d9ccb0',{t:'fab',seed:3});}
  E.save();const HP=new Path2D();HP.arc(Wd.HOOP.cx,Wd.HOOP.cy,Wd.HOOP.r,0,6.29);E.clip(HP);town(t,{});drawHole(t,380,140,430,1);
  C.fig({x:640,y:GY,s:1,look:'ollie',face:{mouth:'o',wide:true,brow:1,look:[-.5,-1]},arm:[[.3,.4],[1.8,.2]]});E.restore();
  if(z<.6)Wd.hoop();
  E.LIGHT.vig=lerp(.28,.5,k);
  const ua=ss(2.3,2.8,u);UI.live(ua,UI.fmt(lerp(2.4e6,3.1e6,ss(2.3,5,u))));UI.chat(t,CHAT1,ua,1200);UI.hearts(t,23.8,ua);
  label(['HIS WHOLE LIFE','WAS A LIVESTREAM.'],(u-3.0)/1.2,1480,54);});
// 7. Иголка зашивает небо; соседи синхронно оборачиваются; «STAY.»
const CHAT2=[[27.4,'dan99','YES fix it','#ffb36b'],[28.6,'luv_ollie','why are they all staring 😨','#ff9fd6'],[30.4,'mira_k','STAY OLLIE'],[31.4,'zoe','he has to stay right??']];
shot(27,32.5,(u,t)=>{const R=430*(1-ss(.2,1.9,u));
  E.cam={x:K(u,[[0,520],[1.9,560],[2.4,640],[5.5,640]]),y:K(u,[[0,500],[1.9,520],[2.5,1150],[5.5,1170]]),z:K(u,[[0,1.08],[1.9,1.12],[2.5,1.1],[5.5,1.25]]),r:0};E.view();town(t,{});
  drawHole(t,380,140,R,1);
  if(u<2.1){const ang=u*40;const p=[380+Math.cos(ang)*R*.95,140+Math.sin(ang*1.3)*R*.7];needleAt(p,u,-1.0,760,'#86bce2',22);}
  // соседи поворачиваются разом
  const turn=ss(1.0,1.25,u);
  for(const[x,lk]of[[200,'man'],[1020,'lady'],[1250,'mail']])C.fig({x,y:GY-8,s:.95,look:lk,dir:x<640?turn*.7:-turn*.7,face:{mouth:turn>.5?'grin':'smile',look:[x<640?turn:-turn,0],mw:1+turn*.2}});
  const back=ss(3.0,3.6,u);
  C.fig({x:640-back*60,y:GY,s:1,look:'ollie',dir:0,walk:back>0&&back<1?back*2:null,face:{mouth:u>3?'o':'flat',brow:1,browUp:1,wide:u>3,look:u<2.4?[-.7,-1]:(u<3?[1,0]:[0,1])},arm:u>3?[[.6,.9],[.6,.9]]:[[.2,.2],[.2,.2]]});
  // «STAY.» — иголка вышивает на траве
  if(u>2.4){const pr=cl((u-2.4)/1.2);E.save();const cp=new Path2D();const tw=E.tw('STAY.',200);cp.rect(640-tw/2-30,GY+120,(tw+60)*pr,260);E.clip(cp);
    E.stext('STAY.',640,GY+250,200,'#f3efe6',{a:40,olc:'#8e9aa6'});E.restore();
    if(pr<1)needleAt([640-tw/2+tw*pr,GY+250+Math.sin(u*30)*60],u,-1.0,760,'#f3efe6',22);}
  if(u>3.8){const pr=cl((u-3.8)/1.0);E.save();const cp=new Path2D();const tw=E.tw('OUT THERE IS NOTHING.',64);cp.rect(640-tw/2-20,GY+380,(tw+40)*pr,100);E.clip(cp);
    E.stext('OUT THERE IS NOTHING.',640,GY+430,64,'#f3efe6',{a:40,olc:'#8e9aa6'});E.restore();
    if(pr<1)needleAt([640-tw/2+tw*pr,GY+430+Math.sin(u*30)*20],u,-1.0,760,'#f3efe6',26);else{const k2=ei((u-4.8)/.5);C.needle(640+tw/2+k2*500,GY+430-k2*1200,-1.0,760,.4,0,'#f3efe6');}}
  UI.live(1,UI.fmt(lerp(3.1e6,3.6e6,u/5.5)));UI.chat(t,CHAT2,1,640);});
// 8. Край мира: обод, за ним — пустая ткань
const CHAT3=[[33.2,'zoe',"don't do it"],[34.4,'dan99','he wont lol','#ffb36b'],[35.6,'mira_k','STAY STAY STAY']];
const RX=()=>Wd.HOOP.cx+Math.sqrt(Wd.HOOP.r**2-(GY-Wd.HOOP.cy)**2);
const edge=(t,dim=0)=>{const rx=RX();Wd.blank(-3000,-3000,rx+4000,5000,t);
  E.save();const HP=new Path2D();HP.arc(Wd.HOOP.cx,Wd.HOOP.cy,Wd.HOOP.r,0,6.29);E.clip(HP);town(t,{});E.restore();Wd.hoop();return rx;};
shot(32.5,37,(u,t)=>{const rx=RX();const ox=K(u,[[0,rx-700],[1.4,rx-190]],eo);
  E.cam={x:K(u,[[0,rx-420],[1.6,rx-120],[4.5,rx-160]]),y:K(u,[[0,1070],[1.6,1085],[4.5,980]]),z:K(u,[[0,1.05],[1.6,1.2],[4.5,1.65]]),r:0};E.view();edge(t);
  const lookB=u>1.8&&u<2.9;
  C.fig({x:ox,y:GY,s:1,look:'ollie',dir:u<1.4?.7:(lookB?-.7:.5),walk:u<1.4?u*2.6:null,head:lookB?.06:0,
    face:{mouth:u>3.2?'flat':'frown',brow:u>3.2?-1:.6,look:lookB?[-1,0]:[1,0],blink:u>2.95&&u<3.08?1:0}});
  UI.live(1,UI.fmt(lerp(3.6e6,4.2e6,u/4.5)));UI.chat(t,CHAT3,1,640);});
// 9. Перелезает через обод; иголка бьёт мимо; шарф цепляется
shot(37,42,(u,t)=>{const rx=RX();
  const ox=K(u,[[0,rx-190],[.8,rx-60],[1.6,rx],[2.5,rx],[3.2,rx+260],[5,rx+420]]);
  const lift=K(u,[[0,0],[.8,0],[1.6,-46],[2.5,-46],[2.85,-90,eo],[3.2,0,ei]]);
  E.cam={x:K(u,[[0,rx-80],[5,rx+180]]),y:K(u,[[0,1010],[5,1060]]),z:K(u,[[0,1.4],[2.5,1.3],[5,1.15]]),r:0};E.view();edge(t);
  // нить шарфа от обода к нему
  const snag=[rx+20,GY-160];if(u>3.0){const sc=[ox-20,GY-185];C.thread([snag,[(snag[0]+sc[0])/2,Math.max(snag[1],sc[1])+30],sc],'#c8323a',5);}
  const climb=u>.8&&u<1.6,land=u>3.2&&u<3.5;
  C.fig({x:ox,y:GY+lift,s:1,look:'ollie',dir:u>2.5?.6:(u>1.8?-.6:.6),walk:(u<.8||u>3.4)?u*2.4:null,squash:land?.6*Math.sin((u-3.2)/.3*Math.PI):0,
    arm:climb?[[2.6,.3],[2.4,.4]]:(u>2.5&&u<3.2?[[2.2,.2],[2.2,.2]]:[[.2,.2],[.2,.2]]),knee:climb?.6:0,scarfLen:u>3.4?1-ss(3.4,5,u)*.35:1,
    face:{mouth:u>1.8&&u<2.6?'o':(u>3.5?'smile':'flat'),brow:u<1.8?-1:.8,look:u>1.8&&u<2.5?[-1,-.4]:[1,0],wide:u>2.1&&u<2.6}});
  // иголка: удар туда, где он стоял
  const st=ss(1.95,2.15,u),up=ss(2.6,3.2,u);if(u>1.5){const p=[rx-170,GY-30];C.needle(p[0]-(1-st)*400-up*500,p[1]-(1-st)*700-up*900,-2.15,900,(1-st)*.5,st*(1-up)*.18,'#f3efe6');}
  UI.live(1,UI.fmt(lerp(4.2e6,4.4e6,u/5)));});
// 10. Пустая ткань: его кривая красная строчка
const CHAT4=[[43.2,'dan99','boring','#ffb36b'],[44.3,'tomasz','where is he even going','#b6ff9f'],[45.5,'zoe','nothing is happening'],[46.6,'k1ra','bring back the balloon lady'],[48.4,'luv_ollie','...go ollie ❤️','#ff9fd6']];
const trail=(rx)=>{const p=[[rx+20,GY-160],[rx+120,GY-20]];for(let i=1;i<24;i++){const x=rx+120+i*95;p.push([x+Math.sin(i*1.9)*30,GY-20+i*42+Math.sin(i*1.3)*40]);}return p;};
shot(42,50,(u,t)=>{const rx=RX();const tp=trail(rx);const L=E.polyLen(tp);const walked=lerp(320,L*.92,cl(u/8));const pos=E.at(tp,walked);
  E.cam={x:K(u,[[0,rx+500],[8,rx+800]]),y:K(u,[[0,1250],[8,1500]]),z:K(u,[[0,.95],[3,.6],[8,.42]]),r:0};E.view();edge(t);
  // строчка до него
  E.run(tp,'#c8323a',{w:8,len:24,gap:16,prog:(walked-40)/L,jit:5,seed:3});
  const lastSt=E.at(tp,walked-30);C.thread([[lastSt[0],lastSt[1]],[(lastSt[0]+pos[0])/2,(lastSt[1]+pos[1])/2-40],[pos[0]-16,pos[1]-180]],'#c8323a',5,.15);
  C.fig({x:pos[0],y:pos[1],s:1,look:'ollie',dir:.6,walk:walked/90,scarfLen:1-.35-cl(u/8)*.45,face:{mouth:'smile',look:[1,0]}});
  const v=K(u,[[0,4.4e6],[2,3.2e6],[4,9e5],[6,4.1e4],[8,1.2e4]]);UI.live(1,UI.fmt(v));UI.chat(t,CHAT4,1,640);
  label(u<5?['CROOKED.']:['CROOKED.','BUT HIS OWN.'],u<5?(u-3)/1.2:1,1430,62,'#8a2433');});
// 11. Финал: красная нить вышивает вывод
shot(50,57.5,(u,t)=>{E.cam={x:540,y:K(u,[[0,980],[7.5,1010]]),z:K(u,[[0,1],[7.5,1.06]]),r:0};E.view();Wd.blank(-1500,-1500,2600,3600,t);
  const l1='IF IT FEELS',l2='TOO PERFECT —',l3='PULL THE',l4='THREAD.';
  const wr=(s,y,sz,a0,a1,col)=>{const pr=cl((u-a0)/(a1-a0));if(pr<=0)return;const tw=E.tw(s,sz);E.save();const cp=new Path2D();cp.rect(540-tw/2-30,y-sz,(tw+60)*pr,sz*2);E.clip(cp);
    E.stext(s,540,y,sz,col,{a:35});E.restore();if(pr<1){const x=540-tw/2+tw*pr;C.thread([[x,y],[x+30,y-60],[x+90,y-160]],col,5,.15);}};
  wr(l1,560,92,.2,1.2,'#3b3f57');wr(l2,680,92,1.2,2.3,'#3b3f57');wr(l3,900,150,2.8,3.8,'#c8323a');wr(l4,1070,150,3.8,4.8,'#c8323a');
  // маленький Олли уходит по своей строчке
  const ox=lerp(250,900,cl(u/7.5));E.run([[-200,1330],[ox-30,1330+Math.sin(ox*.01)*10]],'#c8323a',{w:6,len:20,gap:14,jit:4});
  C.fig({x:ox,y:1330,s:.42,look:'ollie',dir:.6,walk:u*2.4,scarfLen:.15,face:{mouth:'smile'}});
  if(u>5.3){E.screen();const a=ss(5.3,6,u);E.save();E.alpha(a);E.stext('STITCHED',540,1560,64,'#efe6d6',{a:30,olc:'#6b5b4a'});E.restore();}
  UI.ended(ss(.3,.8,u)*(1-ss(4.5,5.2,u)));});
window.DURATION=57.5;
window.STORY={SH,CUES,draw(t){let s=SH.find(s=>t>=s.a&&t<s.b)||SH[SH.length-1];s.draw(t-s.a,t);}};
})();
