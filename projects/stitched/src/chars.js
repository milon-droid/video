// C — вышитые персонажи (риг: плечо-локоть-кисть, бедро-колено-стопа, лицо из стежков) + иголка (настоящий металл).
(function(){
const C={};const{fill,stitch,run,drop}=E;
const D2R=Math.PI/180;
const ell=(cx,cy,rx,ry,n=24,a0=0,a1=Math.PI*2)=>{const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;};
C.ell=ell;
// кривая рта: тип и амплитуда
const mouthPts=(m,w,open)=>{const p=[];const n=8;for(let i=0;i<=n;i++){const u=i/n*2-1;let y=0;
  if(m=='smile')y=(1-u*u)*w*.38;else if(m=='grin')y=(1-u*u)*w*.5;else if(m=='frown')y=-(1-u*u)*w*.28;else if(m=='wavy')y=Math.sin(u*Math.PI*2)*w*.08;
  p.push([u*w*.5,y]);}return p;};
// лицо: центр головы (0,0), радиус r
C.face=(r,o)=>{const lx=(o.look||[0,0])[0]*r*.12,ly=(o.look||[0,0])[1]*r*.1;const dir=o.dir||0;const ex=r*.36,ey=-r*.02;
  const bl=o.blink||0;const ew=r*.115;
  for(const s of[-1,1]){const x=s*ex+dir*r*.12+lx,y=ey+ly;
    if(bl>.5){stitch(x-ew,y+1,x+ew,y+1,4.5,'#2a1d1a');}
    else{const sq=1-bl*1.6;const P=E.Pe(x,y,ew,ew*Math.max(.25,sq*(o.wide?1.25:1)));
      fill(P,'#221a1d',{t:'knot',sx:ew/8,ox:x-ew*2,oy:y-ew*2,seed:7});
      fill(E.Pe(x-ew*.35,y-ew*.38,ew*.28),'#ffffff',{t:'sat',h:.6});}
    // брови
    const br=o.brow||0;const by=y-r*.27-(o.browUp||0)*r*.08;const inner=s*(-1);
    stitch(x-ew*1.3,by+(s>0?br:-br)*r*.06*(inner<0?1:-1),x+ew*1.3,by-(s>0?br:-br)*r*.06*(inner<0?1:-1),4,o.hairc||'#5a3524');}
  // щёки
  for(const s of[-1,1])fill(E.Pe(s*r*.58+dir*r*.08+lx*.5,r*.22,r*.13,r*.09),'#ef8f86',{t:'knot',sx:.5,h:.7});
  // рот
  const m=o.mouth||'smile',mw=r*(m=='o'?.18:.42);const mx=dir*r*.12+lx*.6,my=r*.36+ly*.4;
  if(m=='o'){const P=E.Pe(mx,my+r*.02,mw*.6,mw*(o.open||1));fill(P,'#5b1f26',{t:'tat',a:0,h:.8});}
  else if(m=='open'){const P=E.Ps([[mx-r*.22,my-r*.02],[mx+r*.22,my-r*.02],[mx+r*.1,my+r*.2*(o.open||1)],[mx-r*.1,my+r*.2*(o.open||1)]]);fill(P,'#5b1f26',{t:'tat',h:.8});
    stitch(mx-r*.2,my-r*.01,mx+r*.2,my-r*.01,4,'#f5f0e6');}
  else{const pts=mouthPts(m,mw*(o.mw||1)).map(q=>[q[0]+mx,q[1]+my]);run(pts,'#7a2b2b',{w:4.5,len:7,gap:-2});}
};
// ---------- фигура ----------
const LOOK={
  ollie:{skin:'#f3c9a2',hair:'#6b3f26',top:'#e3a52b',topA:90,legs:'#35588f',shoe:'#4a2e22',scarf:'#c8323a',hairStyle:'curly'},
  lady:{skin:'#f0c09a',hair:'#a8452a',top:'#e77fa6',topA:90,legs:'#f0c09a',shoe:'#7a2f45',dress:true,hat:'#f4ecd2',hairStyle:'bun'},
  mail:{skin:'#d9a27a',hair:'#2f2622',top:'#3f6fb0',topA:90,legs:'#2b3d63',shoe:'#2b211c',cap:'#2b3d63',hairStyle:'short',bag:'#8a5a2c'},
  man:{skin:'#e8b48c',hair:'#3a2a20',top:'#5f9a5a',topA:90,legs:'#6b5a48',shoe:'#3a2a20',hairStyle:'short'},
};C.LOOK=LOOK;
// o: x,y (ступни), s масштаб, look, dir (-1..1 поворот), walk (фаза в шагах), arm:[[плечо,локоть] л, п] (рад., 0 — вниз, + вперёд/в сторону),
//    head (наклон рад.), face{…}, lean, squash, scarfLen (0..1 сколько осталось шарфа)
C.fig=(o)=>{const sxm0=E.SXM;E.SXM=o.sxm||.6;const L=typeof o.look=='string'?LOOK[o.look]:o.look;const s=o.s||1;const dir=o.dir||0;
  const ph=(o.walk||0)*Math.PI;const wk=o.walk!=null&&o.walkAmp!==0?(o.walkAmp==null?1:o.walkAmp):0;
  const bob=wk?Math.abs(Math.sin(ph))*-7:0;const sq=o.squash||0;
  E.save();E.tr(o.x,o.y);E.sc(s*(1+sq*.12),s*(1-sq*.12));if(o.lean)E.rot(o.lean);
  // тень под ногами
  E.tint(E.Pe(0,4,62,13),'#000',.28,6);
  const hipY=-92+bob,shY=-200+bob;
  // ноги
  const leg=(side,swing)=>{const hx=side*20;const kA=swing,shA=Math.max(0,-swing)*.35+(wk?Math.max(0,Math.sin(ph+(side>0?0:Math.PI)))*.45:0)+(o.knee||0);
    const kx=hx+Math.sin(kA)*46*(dir>=0?1:-1),ky=hipY+Math.cos(kA)*46;const fa=kA-shA;const fx=kx+Math.sin(fa)*46*(dir>=0?1:-1),fy=ky+Math.cos(fa)*46;
    if(!L.dress)fill(E.Pcap(hx,hipY,kx,ky,16,14),L.legs,{t:'tat',a:90+kA*57,seed:2});
    fill(E.Pcap(kx,ky,fx,fy,14,12),L.dress?L.skin:L.legs,{t:'tat',a:90+fa*57,seed:3});
    const sd=dir>=0?1:-1;const sh=E.Pe(fx+sd*8,fy+2,20,11);drop(sh,.3,4,3,4);fill(sh,L.shoe,{t:'sat',a:0,seed:4});};
  const sw=wk?Math.sin(ph)*.5:0;
  leg(-1,(o.legs?o.legs[0]:0)+sw);leg(1,(o.legs?o.legs[1]:0)-sw);
  // рука
  const arm=(side,a)=>{const sx=side*42,sy=shY+16;const[sa,ea]=a;const ex=sx+Math.sin(sa)*side*40,ey=sy+Math.cos(sa)*40;
    const fa=sa+ea;const hx=ex+Math.sin(fa)*side*38,hy=ey+Math.cos(fa)*38;
    fill(E.Pcap(sx,sy,ex,ey,14,12),L.top,{t:'tat',a:90-sa*side*57,seed:5});
    fill(E.Pcap(ex,ey,hx,hy,12,11),L.top,{t:'tat',a:90-fa*side*57,seed:6});
    const hp=E.Pe(hx,hy,12.5);fill(hp,L.skin,{t:'sat',a:30});return[hx,hy];};
  const aw=wk?Math.sin(ph)*.45:0;const A=o.arm||[[.15,.1],[.15,.1]];
  const al=[A[0][0]-aw,A[0][1]],ar=[A[1][0]+aw,A[1][1]];
  const back=dir>0?-1:1;
  let hands={};
  hands[back]=arm(back,back<0?al:ar);
  // тело
  if(L.dress){const P=E.Ps([[-30,shY],[30,shY],[58,hipY+30],[-58,hipY+30]]);drop(P,.3,8,5,7);fill(P,L.top,{t:'tat',a:90});
    run([[-56,hipY+22],[56,hipY+22]],'#fff4f8',{w:4,len:10,gap:6});}
  else{const P=E.Prr(-44,shY,88,hipY-shY+16,[26,26,14,14]);drop(P,.3,8,5,7);fill(P,L.top,{t:'tat',a:L.topA,len:.5});
    // резинка свитера
    run([[-40,hipY+6],[40,hipY+6]],E.shade(L.top,.78),{w:5,len:6,gap:3});}
  if(L.bag){const P=E.Prr(16,hipY-46,48,40,8);fill(P,L.bag,{t:'tat',a:0});stitch(-38,shY+6,40,hipY-40,6,E.shade(L.bag,.8));}
  // шарф (ключевой предмет): петля на шее + хвост
  if(L.scarf&&(o.scarfLen==null||o.scarfLen>0)){const k=o.scarfLen==null?1:o.scarfLen;
    const P=E.Prr(-38,shY-12,76,26,12);fill(P,L.scarf,{t:'sat',a:-35});
    if(k>.05){const tl=70*k;const fl=(o.scarfFly||0)+(wk?Math.sin(ph*2)*.12:0);const x0=dir>0?-22:22,sd=dir>0?-1:1;
      const pts=[[x0,shY+4],[x0+sd*Math.sin(fl)*tl*.5,shY+4+tl*.5],[x0+sd*Math.sin(fl*1.6)*tl,shY+4+tl]];
      const P2=E.Pcap(pts[0][0],pts[0][1],pts[2][0],pts[2][1],13,11);fill(P2,L.scarf,{t:'sat',a:60});
      for(let i=0;i<4;i++)stitch(pts[2][0]-9+i*6,pts[2][1]+8,pts[2][0]-10+i*7+sd*4,pts[2][1]+22,3.5,L.scarf);}
    // полоски шарфа
    run([[-30,shY+1],[30,shY+1]],'#f2e6d0',{w:4,len:7,gap:5});}
  hands[-back]=arm(-back,-back<0?al:ar);
  // голова
  const hr=56;E.save();E.tr(0,shY-48);if(o.head)E.rot(o.head);
  if(L.hairStyle=='bun'){const P=E.Pe(0,-hr*1.02,hr*.42);fill(P,L.hair,{t:'knot',sx:.8});}
  const HP=E.Pe(0,0,hr,hr*.94);drop(HP,.35,9,5,8);fill(HP,L.skin,{t:'sat',a:8,seed:1});
  // волосы
  if(L.hairStyle=='curly'){const P=E.Ps([[-hr*1.02,-hr*.05],[-hr*.9,-hr*.7],[-hr*.3,-hr*1.08],[hr*.4,-hr*1.05],[hr*.95,-hr*.62],[hr*1.02,-hr*.08],[hr*.6,-hr*.42],[0,-hr*.55],[-hr*.6,-hr*.4]]);
    fill(P,L.hair,{t:'knot',sx:.75,seed:3});}
  else if(L.hairStyle=='bun'||L.hairStyle=='short'){const P=E.Ps([[-hr*1.0,-hr*.1],[-hr*.85,-hr*.72],[0,-hr*1.0],[hr*.85,-hr*.72],[hr*1.0,-hr*.1],[hr*.7,-hr*.5],[0,-hr*.62],[-hr*.7,-hr*.5]]);
    fill(P,L.hair,{t:'tat',a:-60,seed:3});}
  if(L.cap){const P=E.Ps([[-hr*.95,-hr*.4],[-hr*.7,-hr*.95],[hr*.7,-hr*.95],[hr*.95,-hr*.4]]);fill(P,L.cap,{t:'tat',a:0});
    fill(E.Prr(-hr*.2+dir*hr*.5,-hr*.52,hr*1.1,hr*.2,6),E.shade(L.cap,.8),{t:'sat',a:90});}
  if(L.hat){const P=E.Pe(0,-hr*.72,hr*1.25,hr*.22);drop(P,.3,6,3,5);fill(P,L.hat,{t:'sat',a:80});fill(E.Pe(0,-hr*.95,hr*.62,hr*.34),L.hat,{t:'sat',a:80});
    run(ell(0,-hr*.8,hr*.6,hr*.08,12,0,Math.PI),'#e77fa6',{w:5,len:9,gap:2});}
  C.face(hr,{...(o.face||{}),dir:dir*.8,hairc:L.hairStyle=='curly'?'#4a2a18':L.hair});
  E.restore();
  E.restore();
  // кисти в мировых координатах (для предметов)
  E.SXM=sxm0;const tf=(p)=>[o.x+p[0]*s,o.y+p[1]*s];return{hl:tf(hands[-1]),hr:tf(hands[1]),head:[o.x,o.y+(shY-48)*s]};
};
// ---------- шар (красный) на нитке ----------
C.balloon=(hx,hy,t,s=1)=>{const bx=hx+Math.sin(t*1.7)*10*s,by=hy-180*s;const pts=[[hx,hy],[hx+(bx-hx)*.5+Math.sin(t*2.3)*8*s,(hy+by)/2],[bx,by+50*s]];
  run(pts,'#efe6d6',{w:3,len:200,gap:0});const P=E.Pe(bx,by,40*s,48*s);drop(P,.3,10,8,10);fill(P,'#d8343c',{t:'sat',a:70});
  fill(E.Pe(bx-14*s,by-18*s,9*s,13*s,-.4),'#ff9a8f',{t:'sat',a:70,h:.6});};
// ---------- пёс-узелки ----------
C.dog=(x,y,s,t,dir=1)=>{E.save();E.tr(x,y);E.sc(s*dir,s);E.tint(E.Pe(0,4,55,10),'#000',.25,5);
  const b=Math.sin(t*14)*.3;for(const[lx,ph]of[[-30,0],[-14,Math.PI],[20,Math.PI],[34,0]]){const a=Math.sin(t*14+ph)*.4;stitch(lx,-30,lx+Math.sin(a)*14,-2,10,'#efe9df');}
  const P=E.Pe(0,-46,48,26);drop(P,.3,6,4,6);fill(P,'#f4f0e8',{t:'knot',sx:.9});const Hd=E.Pe(46,-74,25,23);fill(Hd,'#f4f0e8',{t:'knot',sx:.9});
  fill(E.Pe(38,-90,10,16,.5),'#c9a27e',{t:'sat',a:20});fill(E.Pe(56,-78,4.5),'#221a1d',{t:'knot',sx:.6,ox:56-9,oy:-78-9});fill(E.Pe(70,-70,6,5),'#221a1d',{t:'sat'});
  stitch(-44,-52,-66,-74+Math.sin(t*20)*10,8,'#efe9df');E.restore();};
// ---------- иголка (металл, «настоящая») ----------
// x,y — точка прокола (кончик, если up>0 — висит над тканью), ang — угол (рад., от кончика к ушку), len — длина, up — высота над тканью 0..1,
// dep — насколько ушла в ткань (видимая часть короче), thr — цвет нити
C.needle=(x,y,ang,len,up=0,dep=0,thr='#f2b632',thrEnd=null)=>{const ca=Math.cos(ang),sa=Math.sin(ang);const w=len*.026;
  const lift=up*len*.18;const sx=x+lift*.8,sy=y+lift*1.1; // тень на ткани (смещена светом)
  // тень
  E.save();E.tr(sx,sy);E.rot(ang);const SP=new Path2D();SP.moveTo(dep*len,0);SP.lineTo(len,-w*1.1);SP.lineTo(len,w*1.1);SP.closePath();
  E.tint(SP,'#000',.32*(1-up*.5),4+up*16);E.restore();
  // нить от ушка вверх
  const ex=x+ca*len*.93,ey=y+sa*len*.93-lift;
  const te=thrEnd||[ex+260,ey-900];
  E.save();E.alpha(1);X_C_line(ex,ey,te[0],te[1],thr,len*.012);E.restore();
  // тело иглы
  E.save();E.tr(x,y-lift);E.rot(ang);
  const P=new Path2D();const t0=dep*len;P.moveTo(t0,-(t0/len)*w);P.quadraticCurveTo(len*.3,-w,len*.85,-w);P.lineTo(len,-w*.8);P.arc(len,0,w*.8,-Math.PI/2,Math.PI/2);P.lineTo(len*.85,w);P.quadraticCurveTo(len*.3,w,t0,(t0/len)*w);P.closePath();
  E.fill(P,(c)=>{const g=c.createLinearGradient(0,-w,0,w);g.addColorStop(0,'#5d6168');g.addColorStop(.28,'#f4f6f8');g.addColorStop(.42,'#ffffff');g.addColorStop(.6,'#9aa0a8');g.addColorStop(1,'#3a3d42');return g;},{t:'real'});
  // ушко
  E.fill(E.Prr(len*.86,-w*.28,len*.1,w*.56,w*.28),'#2a2c30',{t:'real'});
  E.glow(E.Pe(len*.5,-w*.35,len*.25,w*.12),'#ffffff',.25);
  E.restore();};
// нить в воздухе (настоящая) — рисуем три штриха на C с типом real
function X_C_line(x0,y0,x1,y1,col,w){const p=new Path2D();const mx=(x0+x1)/2+60,my=(y0+y1)/2;p.moveTo(x0,y0);p.quadraticCurveTo(mx,my,x1,y1);
  const XC=E.X.C,XD=E.X.D;for(const[c,ww,a]of[[E.shade(col,.55),w*1.3,1],[col,w,1],[E.mix(col,'#ffffff',.5),w*.3,.8]]){XC.save();XC.globalAlpha=a;XC.lineWidth=ww;XC.lineCap='round';XC.strokeStyle=E.rgb(c);XC.stroke(p);XC.restore();}
  XD.save();XD.lineWidth=w*1.3;XD.lineCap='round';XD.strokeStyle=`rgb(0,${6*32},0)`;XD.stroke(p);XD.restore();}
C.thread=(pts,col,w=5,sh=.2)=>{const p=E.Ps(pts,false);const XC=E.X.C,XD=E.X.D;
  if(sh){XC.save();XC.translate(6,9);XC.globalAlpha=sh;XC.lineWidth=w*1.5;XC.filter=`blur(${3*E.scaleNow()}px)`;XC.strokeStyle='#000';XC.stroke(p);XC.restore();}
  for(const[c,ww,a]of[[E.shade(col,.5),w*1.35,1],[col,w,1],[E.mix(col,'#ffffff',.45),w*.3,.85]]){XC.save();XC.globalAlpha=a;XC.lineWidth=ww;XC.lineCap='round';XC.lineJoin='round';XC.strokeStyle=E.rgb(c);XC.stroke(p);XC.restore();}
  XD.save();XD.lineWidth=w*1.35;XD.lineCap='round';XD.strokeStyle=`rgb(0,${6*32},0)`;XD.stroke(p);XD.restore();
};
window.C=C;
})();
