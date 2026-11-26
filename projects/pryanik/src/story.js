// «CROOKED» — история кривого пряника. Тайминг — секунды ролика.
(function(){const ST={};const K=E.K,ss=E.ss,eio=E.eio,eo=E.eo,cl=E.cl,R=E.rnd;
const CUES=[];const cue=(t,id,o={})=>CUES.push({t,id,...o});
// ---------- подписи глазурью (экранные) ----------
const cap=(t,str,a,b,y,size=60,o={})=>{if(t<a||t>b+.3)return;const p=cl((t-a)/(o.pipe||.06*str.length+.25));const out=1-ss(b,b+.3,t);
  E.save();E.screen();const T=E.textPolys(str,o.font||'futural',size,'c');const c=E.X.C;c.save();c.globalAlpha=.55*out*cl(p*3);c.filter=`blur(${(size*.22*E.S).toFixed(1)}px)`;c.strokeStyle='#0c0604';c.lineWidth=(o.w||size*.15)*3.2;c.lineCap=c.lineJoin='round';
  c.translate(o.x||540,y+size*.08);for(const{q}of T.polys){c.beginPath();q.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.stroke();}c.restore();
  E.X.C.globalAlpha=out;E.X.H.globalAlpha=out;E.pipeText(str,o.x||540,y,size,p,{font:o.font||'futural',w:o.w||size*.15,e:o.e??.18,col:o.col,d:E.FX.focus});
  E.X.C.globalAlpha=1;E.X.H.globalAlpha=1;E.restore();};
// ---------- противень: сетка пряников ----------
const TR={x:110,y:330,w:860,h:1300};const S0=.55;
const cells=[];for(let r=0;r<4;r++)for(let c=0;c<3;c++)cells.push({x:TR.x+145+c*285,y:TR.y+80+r*312+232*S0+20,i:r*3+c});
const HERO=11;const hx=cells[HERO].x,hy=cells[HERO].y;const headY=hy-338*S0;
const btn=[['#c4232d','#2c8a3f','#f2efe6'],['#2c8a3f','#f2efe6','#c4232d'],['#f2efe6','#c4232d','#2c8a3f']];
// идеальные пряники: моргание, взгляд
const blinkAt=(t,seed)=>{const p=2.6+R(seed)*1.8;const u=((t+R(seed*3)*p)%p);return u<.14?Math.sin(u/.14*Math.PI):0;};
const perfect=(t,c,o={})=>CH.draw({x:c.x,y:c.y,s:S0,buttons:btn[c.i%3],mood:.85,blink:blinkAt(t,c.i+1),cheeks:true,...o});
// ---------- лопатка забирает: расписание ----------
const LIFT=[];{let tt=9.1;for(let i=0;i<11;i++){LIFT.push({i,t:tt});tt+=i<3?.62:.45;}}
const liftState=(t,L)=>{const u=t-L.t;if(u<0)return null;// 0..0.22 подъезд, 0.22..0.32 подъём, дальше уносит вниз
  const c=cells[L.i];const enter=eo(u/.22);const lift=ss(.18,.32,u);const carry=E.ei(cl((u-.3)/.42));
  return{sx:c.x+(1-enter)*-700,sy:c.y-120+(1-enter)*220+carry*1700,a:-.25*(1-enter)+.08*carry,lift,carry,cx:c.x+carry*40,cy:c.y+carry*1700,u};};
// ---------- сцены ----------
const SH=[];const shot=(a,b,f)=>SH.push({a,b,f});
// S1 — рождение: крупно лицо, насадка рисует улыбку, рука дрожит
shot(0,3.7,(t)=>{
  E.cam={x:hx+K(t,[[0,4],[3.7,0]]),y:headY+40,z:K(t,[[0,6.2],[3.7,6.8]]),r:-.02};E.view();
  E.L.Lp=[260,180,1500];E.L.Lc=[2.3,1.85,1.35];E.L.amb=.35;E.FX.focus=.5;E.FX.dof=60;
  WD.tray(TR.x,TR.y,TR.w,TR.h);perfect(t,cells[10]);perfect(t,cells[8]);
  const eyes=K(t,[[0,.5],[.05,.5],[.3,1]]);const mp=K(t,[[0,0],[.85,0],[1.35,.45,E.lin],[2.05,1,E.lin]]);const drip=K(t,[[2.05,0],[2.6,1,eo]]);
  const shock=ss(2.05,2.25,t);const bl=t>.42&&t<.62?Math.sin((t-.42)/.2*Math.PI):(t>2.9&&t<3.08?Math.sin((t-2.9)/.18*Math.PI):0);
  const look=t<.6?[0,0]:t<2.0?[K(t,[[.6,0],[.9,.5],[1.5,.3],[2,.6]]),-.9]:[.5*(1-shock)+.2,K(t,[[2,-.9],[2.3,.9]])];
  CH.draw({x:hx,y:hy,s:S0,crooked:true,mouthP:mp,drip,eyes,blink:bl,look,brow:K(t,[[0,0],[.6,.4],[1.5,.1],[2.05,1.1,eo]]),browT:shock*.4,mood:.8,buttons:btn[2]});
  // насадка: глаз → начало улыбки → улыбка с дрожью → вверх
  const hs=S0;const H0=[hx,headY];const sm=CH.smile({mood:.8,crooked:true});
  const along=u=>{const f=u*(sm.length-1);const i=Math.min(sm.length-2,Math.floor(f));const v=f-i;return[sm[i][0]+(sm[i+1][0]-sm[i][0])*v,sm[i][1]+(sm[i+1][1]-sm[i][1])*v];};
  let nx,ny;
  if(t<.35){nx=H0[0]+27*hs;ny=H0[1]-14*hs;}
  else if(t<.85){const u=eio((t-.35)/.5);const a=[27,-14],b=sm[0];nx=H0[0]+E.lerp(a[0],b[0],u)*hs;ny=H0[1]+(E.lerp(a[1],b[1],u)-Math.sin(u*Math.PI)*30)*hs;}
  else if(t<2.05){const p=along(mp);nx=H0[0]+p[0]*hs;ny=H0[1]+p[1]*hs;}
  else{const p=along(1);nx=H0[0]+p[0]*hs;ny=H0[1]+p[1]*hs-E.ei(cl((t-2.4)/.6))*300;}
  const tr=t>1.3&&t<2.2?(ss(1.3,1.45,t)*(1-ss(2.0,2.2,t))):0;
  nx+=tr*(Math.sin(t*61)*3+Math.sin(t*37)*2);ny+=tr*Math.sin(t*53)*2.5;
  E.xf(nx,ny,0,.32,()=>WD.nozzle(0,0,.35+tr*.05*Math.sin(t*40),0));
  cap(t,'Dec 31. The last batch.',.25,3.4,250,46);
});
// S2 — противень: одиннадцать идеальных и он
shot(3.7,9.0,(t)=>{const u=eio((t-3.7)/1.4);
  E.cam={x:E.lerp(hx,540,u),y:E.lerp(headY+40,980,u),z:Math.exp(E.lerp(Math.log(6.8),0,u)),r:-.02*(1-u)};E.view();
  E.L.Lp=[260,180,1500];E.L.Lc=[2.3,1.85,1.35];E.L.amb=.35;E.FX.focus=.5;E.FX.dof=60;
  WD.tray(TR.x,TR.y,TR.w,TR.h);
  const turn=ss(5.2,5.5,t);const hp=[hx,headY];
  for(const c of cells){if(c.i==HERO)continue;const dx=hp[0]-c.x,dy=hp[1]-(c.y-338*S0);const l=Math.hypot(dx,dy);
    const gig=(c.i==7||c.i==10||c.i==4)?ss(6.0,6.15,t)*(1-ss(7.2,7.6,t)):0;
    perfect(t,c,{look:[dx/l*turn,dy/l*turn],r:gig*Math.sin(t*38+c.i)*.06,mood:.85+gig*.2,brow:gig*.4});}
  const sad=ss(6.4,7.2,t);const bl=t>7.5&&t<7.68?Math.sin((t-7.5)/.18*Math.PI):0;
  CH.draw({x:hx,y:hy,s:S0,crooked:true,buttons:btn[2],look:t<5.6?[.5,.9]:t<6.5?[-.7,-.6]:[0,1],brow:K(t,[[3.7,1.1],[4.6,.3],[6.4,.2],[7.2,-1]]),mood:.8-sad*.3,droop:1+sad*.4,blink:bl,
    arm:{l:[28+sad*20,8],r:[28-ss(5.6,5.9,t)*(1-sad)*50,8]}});
  cap(t,'Eleven perfect smiles.',5.0,8.8,215,54);cap(t,'...and his.',6.9,8.8,1730,58);
});
// S3 — лопатка уносит идеальных; его отодвигают
shot(9.0,16.2,(t)=>{E.cam={x:540,y:980,z:1,r:0};E.view();
  E.L.Lp=[260,180,1500];E.L.Lc=[2.3,1.85,1.35];E.L.amb=.35;E.FX.focus=.5;E.FX.dof=60;
  WD.tray(TR.x,TR.y,TR.w,TR.h);
  // кто ещё лежит
  for(const L of LIFT){const s=liftState(t,L);if(!s)perfect(t,cells[L.i],{look:[0,-.4],brow:.2});}
  // герой: надеется, потом отодвинут
  const push=K(t,[[15.25,0],[15.55,1,E.ei]]);const bump=t>15.55?Math.exp(-(t-15.55)*6)*Math.sin((t-15.55)*30):0;
  const hope=ss(14.5,14.8,t)*(1-ss(15.25,15.35,t));
  CH.draw({x:hx+push*95+bump*6,y:hy+push*60,s:S0,r:push*.35+bump*.04,crooked:true,buttons:btn[2],look:t<14.4?[-.4,-.2]:[-.8,-.8],brow:K(t,[[9,-.6],[14.4,-.4],[14.7,1],[15.3,1],[15.5,-1]]),
    mood:.6+hope*.4,droop:1.2-hope*.2,arm:{l:[28-hope*60,8],r:[28-hope*60,8]},blink:t>12.3&&t<12.45?1:0});
  // лопатки
  for(const L of LIFT){const s=liftState(t,L);if(!s||s.u>1)continue;const c=cells[L.i];
    WD.spatula(s.sx,s.sy+5,s.a,s.lift);
    perfect(t,{...c,x:s.cx,y:s.cy},{s:S0*(1+s.lift*.08),mood:1,brow:.5,look:[0,-.6],d:.45});}
  // последняя: подъезжает к нему, замирает, толкает
  if(t>14.4){const a=K(t,[[14.4,-900],[14.75,-160,eo],[15.25,-160],[15.55,-70,E.ei],[15.9,-900]]);WD.spatula(hx+a,hy-110,Math.PI/2*.92,0);}
  cap(t,'Not that one.',14.95,16.1,215,60);
});
// S3b — коробка закрывается, колокольчик
shot(16.2,18.6,(t)=>{E.cam={x:540,y:1000,z:1.05,r:.01};E.view();E.L.Lp=[260,180,1500];E.L.Lc=[2.3,1.85,1.35];E.L.amb=.35;E.FX.focus=.5;E.FX.dof=60;
  E.mat(E.MATTE);E.depth(.55);const tb=E.Pr(-200,-200,1500,2400);E.fill(tb,'#6e4428',{h:.02});E.texture(tb,E.PAT.wood,'C','multiply',1,1.2);E.texture(tb,E.PAT.wood,'H','multiply',.6,1.2);
  const go=E.ei(cl((t-17.7)/.8));E.save();E.tr(0,-go*1500);
  const bx=150,by=520,bw=780,bh=900;WD.box(bx,by,bw,bh);
  for(let i=0;i<11;i++){const r=Math.floor(i/4),c=i%4;const x=bx+120+c*180+(r%2)*40,y=by+250+r*270;CH.draw({x,y,s:.42,buttons:btn[i%3],mood:.9,look:[0,-.3],blink:blinkAt(t,i+30),r:(R(i)-.5)*.15});}
  WD.lid(bx,by,bw,bh,eio(cl((t-16.35)/.45)),cl((t-16.85)/.3));E.restore();
  cap(t,'Everyone had somewhere to be.',16.9,18.5,215,48);
});
// S4 — один; ложка-зеркало; пытается исправить; свет гаснет
shot(18.6,25.2,(t)=>{const px=hx+95+K(t,[[18.6,0],[19.6,-120]]),py=hy+60+K(t,[[18.6,0],[19.6,-190]]);
  E.cam={x:K(t,[[18.6,hx+20],[19.6,px+40],[25.2,px+30]]),y:K(t,[[18.6,hy-120],[19.6,py-170],[25.2,py-150]]),z:K(t,[[18.6,2.2],[25.2,2.7]]),r:.03};E.view();
  const off=ss(23.0,23.25,t);E.L.Lp=[260,180,1500];E.L.Lc=E.mix([2.3,1.85,1.35].map(v=>v*100),[.25,.3,.5].map(v=>v*100),off).map(v=>v/100);
  E.L.amb=.35-off*.27;E.L.ambC=E.mix([50,55,70],[30,40,80],off).map(v=>v/100);E.L.Fc=[.12-off*.06,.14-off*.04,.2+off*.05];E.L.spark=1-off*.7;E.FX.exposure=1-off*.35;E.FX.warm=.3-off*.5;E.FX.focus=.5;E.FX.dof=60;
  WD.tray(TR.x,TR.y,TR.w,TR.h);
  // ложка с отражением
  const fix=ss(20.4,21.4,t);const sad=ss(21.6,22.4,t);
  E.xf(px+175,py-200,0,.55,()=>WD.spoon(0,0,-.5,()=>{E.X.C.save();E.X.C.translate(0,0);E.X.C.rotate(-.5);E.X.C.scale(.9,1.25);E.X.C.globalAlpha=.55;
    E.X.C.translate(0,30);E.X.C.rotate(Math.PI);// отражение вверх ногами
    // простой силуэт отражения: голова пряника
    const c=E.X.C;c.fillStyle='#8a4a1e';c.beginPath();c.arc(0,0,70,0,7);c.fill();c.fillRect(-55,40,110,140);c.strokeStyle='#fff';c.lineWidth=8;c.lineCap='round';
    c.beginPath();const sm=CH.smile({mood:.8,crooked:true});sm.forEach(([a,b],i)=>i?c.lineTo(a*1.2,b*1.2):c.moveTo(a*1.2,b*1.2));c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(-27,-14,11,0,7);c.arc(27,-14,11,0,7);c.fill();c.restore();}));
  const walk=t<19.6?CH.walk((t-18.6)*260,.8):null;
  CH.draw({x:px,y:py,s:S0,r:(walk?walk.r:0)+K(t,[[18.6,.35],[19.4,0]]),crooked:true,buttons:btn[2],
    look:t<20.2?[.7,-.7]:t<21.6?[.3,.3]:[0,.9],brow:K(t,[[18.6,-.4],[20.2,.3],[21.0,.8],[21.6,-1]]),browT:fix*.3,smear:fix,mood:.75-sad*.3,droop:1+sad*.5,
    arm:{l:walk?walk.arm.l:[28+sad*25,8],r:walk?walk.arm.r:t<21.6?[28-ss(20.1,20.4,t)*95,K(t,[[20.1,8],[20.4,-110],[21.4,-130]])]:[28+sad*25,8]},
    leg:walk?walk.leg:undefined,sq:1-sad*.05,blink:t>22.6&&t<22.8?1:0});
  cap(t,'He tried to fix it.',20.0,22.7,215,56);
});
// S5 — ночь: идёт по столу к свече
const NIGHT=(t,o={})=>{E.L.ambC=[.35,.42,.7];E.L.amb=.22;E.L.Fd=[.3,-.8,.5];E.L.Fc=[.06,.08,.16];E.L.spark=1;E.FX.focus=.55;E.FX.dof=42;};
const candleL=(f,par=1)=>{const s=E.toScreen(f[0],f[1],par);E.L.Lp=[s[0],s[1],380];const k=f[2];E.L.Lc=[2.6*k,1.55*k,.75*k];};
shot(25.2,33.2,(t)=>{const walkStart=26.0;const wx=K(t,[[25.2,250],[25.6,250],[25.95,330,eo],[31.0,1150,E.lin],[31.4,1190,eo]]);
  E.cam={x:K(t,[[25.2,420],[31.4,1250]],),y:1300,z:1.55,r:0};NIGHT(t);
  E.view(.25);WD.wall(t,{wx:-160,wy:-200,ww:1300,wh:1150});
  E.view();WD.cloth(1320);
  // противень (край) слева
  E.mat(E.METAL);E.depth(.55);E.obj(()=>E.fill(E.Prr(-400,1250,700,90,20),'#4d4f53',{h:.35,bev:20,g:.7}));
  WD.mandarin(900,1460,120);WD.mandarin(1040,1500,95,{noLeaf:true});
  const fl=WD.candle(t,1560,1520,430);candleL(fl);
  WD.mandarin(1850,1470,130);
  // герой
  const hop=t<26?K(t,[[25.2,0],[25.6,0],[25.78,1,eo],[25.95,0,E.ei]]):0;const w=CH.walk(Math.max(0,wx-330)*1.4,.9);const walking=t>25.95&&t<31.2;
  const hear=ss(31.3,31.6,t);
  CH.draw({x:wx,y:(t<25.95?1290:1440)-hop*60+(walking?-w.bob:0),s:.62,crooked:true,buttons:btn[2],r:walking?w.r:0,leg:walking?w.leg:{l:[14+hop*10,0],r:[14+hop*10,0]},
    arm:walking?w.arm:{l:[28-hop*50,8],r:[28-hop*50,8]},look:hear?[1,-.2]:[.6,0],brow:-.5+hear*1.2,mood:.55,droop:1.4,blink:t>28.2&&t<28.35?1:0,d:.55});
  // передний план: размытая крошка и ёлочная ветка
  E.view(1.4);E.depth(.05);E.mat(E.MATTE);for(let i=0;i<5;i++){E.fill(E.Pe(200+i*520,1880+R(i)*60,60,30),'#5a2a12',{h:.4,bev:20});}
  E.mat(E.CANDY);E.depth(.0);for(let i=0;i<9;i++){const x=1800+i*40;E.line([[x,1980],[x+120,1700-i*10]],18,'#1f4a2a',{h:.5,g:.4});}
});
// S6 — её стол: дрожащая рука, перевёрнутая вторая чашка, часы 11:57
const trem=(t,amp)=>[amp*(Math.sin(t*47)*3+Math.sin(t*29)*2),amp*(Math.sin(t*41)*2.5+Math.sin(t*23)*1.5)];
const teaRip=(t,amp)=>()=>{E.mat(E.CERAM);for(let i=0;i<4;i++){const r=((t*60+i*35)%140);const a=amp*(1-r/140);if(a>.03)E.tube(E.Pe(0,-300,r,r*.2),5,null,{noM:true,h:.03*a,base:.38,g:1});}
  E.mat(E.UNLIT,1.1);E.fill(E.Pe(-60+amp*Math.sin(t*40)*4,-306,14,4),'#ffe2a8',{noH:true});E.mat(E.CERAM);};
shot(33.2,41.6,(t)=>{E.cam={x:K(t,[[33.2,560],[41.6,600]]),y:K(t,[[33.2,1050],[41.6,1080]]),z:K(t,[[33.2,1.0],[41.6,1.18]]),r:0};NIGHT(t);
  E.view(.25);WD.wall(t,{wx:-60,wy:-260,ww:1200,wh:1100});
  E.view();WD.cloth(1200);
  const fl=WD.candle(t,180,1430,380,{d:.62});candleL(fl);
  WD.cup(t,330,1560,{up:false,s:.8,d:.58});
  const tr=trem(t,1);WD.cup(t,780+tr[0]*.3,1640,{s:.95,tea:teaRip(t,1),steam:true});
  WD.handCup(t,840+tr[0],1480+tr[1],{s:.8,time:[11,57]});
  // герой выглядывает из-за мандарина (передний план слева)
  const peek=ss(35.5,36.2,t);CH.draw({x:K(t,[[33.2,60],[36.2,215]]),y:1770,s:.66,crooked:true,buttons:btn[2],look:[1,-.3],brow:-.2+peek*.4,mood:.6,droop:1.3,r:-.08,d:.5,blink:t>38.3&&t<38.45?1:0});
  WD.mandarin(150,1860,165,{d:.45});
  cap(t,'Not everyone did.',36.4,41.4,215,58);
});
// S7 — он забирается на блюдце и улыбается во весь рот; дрожь стихает
shot(41.6,45.4,(t)=>{E.cam={x:700,y:K(t,[[41.6,1180],[45.4,1220]]),z:K(t,[[41.6,1.25],[45.4,1.5]]),r:0};NIGHT(t);
  E.view(.25);WD.wall(t,{wx:-60,wy:-260,ww:1200,wh:1100});E.view();WD.cloth(1200);
  const fl=WD.candle(t,180,1430,380,{d:.62});candleL(fl);
  const calm=1-ss(43.8,44.8,t);const tr=trem(t,calm);
  WD.cup(t,780+tr[0]*.3,1640,{s:.95,tea:teaRip(t,calm),steam:true});
  // герой на блюдце, слева от чашки
  const hop=K(t,[[41.6,0],[42.0,0],[42.25,1,eo],[42.5,0,E.ei]]);const x=K(t,[[41.6,430],[42.5,560]]);const ta=ss(42.8,43.2,t);
  CH.draw({x,y:1610-hop*90,s:.62,crooked:true,buttons:btn[2],look:[.8,-.8],brow:-.2+ta*1.1,mood:.6+ta*.6,droop:1.3-ta*.3,arm:{l:[28-ta*70,-10],r:[28-ta*70,-10]},sq:1+ta*.03,d:.53,blink:t>44.6&&t<44.75?1:0});
  WD.handCup(t,840+tr[0],1480+tr[1],{s:.8,time:[11,58]});
});
// S7b — в чае: рябь стихает, отражение её лица — та же кривая улыбка
shot(45.4,50.6,(t)=>{E.cam={x:540,y:960,z:K(t,[[45.4,1],[50.6,1.15]]),r:K(t,[[45.4,.05],[50.6,0]])};E.view();
  E.L.Lp=[200,500,600];E.L.Lc=[2.2,1.4,.7];E.L.amb=.2;E.FX.focus=.5;E.FX.dof=30;
  E.mat(E.MATTE);E.depth(.7);E.fill(E.Pr(-300,-300,1700,2500),'#3a1012',{h:0});E.texture(E.Pr(-300,-300,1700,2500),E.PAT.linen,'C','multiply',.6,1.5);
  // блюдце и чашка сверху
  E.mat(E.CERAM);E.depth(.5);E.obj(()=>{E.fill(E.Pe(540,980,560,560),'#f3efe8',{h:.12,bev:30,g:.9});E.tube(E.Pe(540,980,540,540),12,'#c9a24a',{h:.03,base:.12,g:1});
    E.fill(E.Pe(540,960,420,420),'#f8f5ef',{h:.55,bev:24,g:1});E.tube(E.Pe(540,960,408,408),12,'#c9a24a',{h:.04,base:.55,g:1});
    E.tube(E.Ps([[930,860],[1060,880],[1060,1040],[930,1060]]),50,'#efeae2',{h:.5,g:.9});});
  const rip=1-ss(45.6,47.2,t);WD.teaReflection(t,540,960,380,{k:ss(47.4,48.6,t),rip:rip*1.2,vis:ss(45.8,46.8,t),blink:t>49.4&&t<49.6?1:0});
  // край пряника на ободке (его рука) — он смотрит в чашку
  CH.draw({x:150,y:1650,s:.72,crooked:true,buttons:btn[2],r:.6,look:[1,-.6],brow:.4,mood:1,droop:1,d:.48});
  cap(t,'He was the only one',46.6,50.5,215,54);cap(t,'who looked like her.',48.0,50.5,320,54);
});
// S8 — ладонь; его ставят у второй чашки — гость на Новый год; полночь, салют
const FW=[{t:55.6,x:300,y:200,r:220,c:'#ff6a5a'},{t:56.3,x:820,y:120,r:260,c:'#ffd26a'},{t:57.2,x:520,y:330,r:200,c:'#7ae0ff'},{t:58.0,x:180,y:80,r:240,c:'#b98aff'},
  {t:58.8,x:900,y:300,r:230,c:'#8aff9a'},{t:59.6,x:450,y:60,r:280,c:'#ff9ad5'},{t:60.5,x:700,y:240,r:250,c:'#ffd26a'},{t:61.3,x:250,y:280,r:220,c:'#7ae0ff'},
  {t:62.1,x:850,y:90,r:260,c:'#ff6a5a'},{t:63.0,x:520,y:200,r:300,c:'#ffe9a8'},{t:63.8,x:300,y:120,r:240,c:'#b98aff'},{t:64.6,x:780,y:260,r:250,c:'#8aff9a'},{t:65.5,x:540,y:150,r:320,c:'#ffd26a'}];
ST.FW=FW;
const fwLight=t=>{let s=[0,0,0];for(const f of FW){const u=t-f.t;if(u<0||u>2)continue;const k=Math.exp(-u*2.2)*(u<.08?u/.08:1);const c=E.hex(f.c);s=s.map((v,i)=>v+c[i]/255*k*1.6);}return s;};
shot(50.6,55.4,(t)=>{E.cam={x:K(t,[[50.6,420],[55.4,520]]),y:K(t,[[50.6,1330],[55.4,1200]]),z:K(t,[[50.6,1.7],[55.4,1.25]]),r:0};NIGHT(t);
  E.view(.25);WD.wall(t,{wx:-60,wy:-260,ww:1200,wh:1100});E.view();WD.cloth(1200);
  const fl=WD.candle(t,180,1430,380,{d:.62});candleL(fl);
  // вторая чашка теперь стоит как надо, с чаем — место для гостя
  WD.cup(t,330,1560,{s:.8,d:.58,steam:true});
  const sit=ss(51.4,51.8,t);
  CH.draw({x:520,y:1560,s:.6,crooked:true,buttons:btn[2],look:t<52.4?[-1,-.6]:[1,-.5],brow:K(t,[[50.6,1],[52.4,1],[53,.5]]),mood:1,droop:1,arm:{l:[28,8],r:[28-ss(53.2,53.6,t)*40,8]},d:.5,blink:t>53.9&&t<54.05?1:0});
  WD.cup(t,800,1640,{s:.95,steam:true});
  WD.handCup(t,860,1480,{s:.8,time:[11,59]});
});
shot(55.4,63.4,(t)=>{E.cam={x:K(t,[[55.4,560],[63.4,540]]),y:K(t,[[55.4,1180],[63.4,1080]]),z:K(t,[[55.4,1.2],[63.4,1.08]]),r:0};NIGHT(t);
  const fw=fwLight(t);E.L.L2p=[540,200,900];E.L.L2c=fw;E.FX.bloom=1.3;
  E.view(.25);WD.wall(t,{wx:-60,wy:-260,ww:1200,wh:1100,fw:FW});E.view();WD.cloth(1200);
  const fl=WD.candle(t,180,1430,380,{d:.62});candleL(fl);
  WD.cup(t,330,1560,{s:.8,d:.58,steam:true});
  const cheer=ss(57.6,58.2,t)*(1-ss(59.4,60,t));
  CH.draw({x:520,y:1560-cheer*10,s:.6,crooked:true,buttons:btn[2],look:t<56?[.2,-1]:[1,-.5],brow:.7,mood:1,droop:1,arm:{l:[28,8],r:[28-cheer*90,-20]},d:.5,blink:t>60.8&&t<60.95?1:0});
  WD.cup(t,800-cheer*60,1640-cheer*40,{s:.95,steam:true});
  WD.handCup(t,860-cheer*60,1480-cheer*40,{s:.8,time:[12,0]});
  cap(t,'The perfect ones get sold.',56.6,63.2,215,50);cap(t,'The crooked ones get kept.',59.2,63.2,320,50);
});
// финал: тот же стол, фокус уходит на салют в окне, надпись глазурью
shot(63.4,68.5,(t)=>{E.cam={x:540,y:K(t,[[63.4,1080],[68.5,980]]),z:K(t,[[63.4,1.08],[68.5,1.0]]),r:0};NIGHT(t);
  const fw=fwLight(t);E.L.L2p=[540,200,900];E.L.L2c=fw;E.FX.bloom=1.4;E.FX.focus=K(t,[[63.4,.55],[65,.98]]);E.FX.dof=36;
  E.view(.25);WD.wall(t,{wx:-60,wy:-260,ww:1200,wh:1100,fw:FW});E.view();WD.cloth(1200);
  const fl=WD.candle(t,180,1430,380,{d:.62});candleL(fl);
  WD.cup(t,330,1560,{s:.8,d:.58,steam:true});
  CH.draw({x:520,y:1560,s:.6,crooked:true,buttons:btn[2],look:[-.2,-1],brow:.7,mood:1,droop:1,d:.5,blink:t>65.5&&t<65.65?1:0});
  WD.cup(t,800,1640,{s:.95,steam:true});WD.handCup(t,860,1480,{s:.8,time:[12,1]});
  cap(t,'Happy New Year',63.9,68.4,620,84,{font:'scripts',w:12,pipe:2.0,e:.25});
  E.FX.fade=1-ss(67.7,68.5,t);
});
window.DURATION=68.5;
ST.SH=SH;
ST.draw=t=>{for(const s of SH){if(t>=s.a&&t<s.b){s.f(t);return;}}SH[SH.length-1].f(t);};
window.STORY=ST;window.CUES=CUES;
})();
