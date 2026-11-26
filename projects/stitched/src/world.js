// Wd — вышитый городок в пяльцах, изнанка-«сценарий», обод, студия, пустая ткань.
(function(){
const Wd={};const{fill,stitch,run,drop}=E;
Wd.GY=1200;               // линия дороги (ступни героев)
Wd.SUN=[880,300,145];     // солнце
Wd.HOOP={cx:900,cy:900,r:2000,w:110};
Wd.RIMX=Wd.HOOP.cx+Wd.HOOP.r; // правый край обода (у дороги ≈)
const LINEN='#e9dfc9';
// волнистая полоса неба/холма
const band=(y0,y1,amp,ph,x0=-2400,x1=4200)=>{const p=[];const n=40;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;p.push([x,y1+Math.sin(x*.004+ph)*amp+Math.sin(x*.011+ph*2)*amp*.4]);}
  p.push([x1,y0],[x0,y0]);return E.P(p);};
Wd.boxC=(cx,cy,r,a)=>{a*=Math.PI/180;const x=cx*Math.cos(a)+cy*Math.sin(a),y=-cx*Math.sin(a)+cy*Math.cos(a);return[x-r,y-r,x+r,y+r];};
// ---------- небо ----------
// o.sun 0..1 прогресс вышивки солнца (null = готово), o.hole {x,y,r} дыра (распустили), o.dim
Wd.sky=(t,o={})=>{
  const cols=['#3f82c4','#5596cf','#70aadb','#8fc0e6','#b3d6ee'];
  const ys=[-2600,-300,150,520,820,1000];
  for(let i=0;i<5;i++){const P=band(ys[i]-400,ys[i+1],i?22:0,i*1.7);fill(P,cols[i],{t:'tat',a:i%2?3:-3,len:.5,seed:i});}
  // облака
  for(const[cx,cy,s,sp]of[[260,180,1,.0],[1500,120,1.2,.3],[-600,260,.9,.6],[2300,330,1,.2]]){const x=cx+Math.sin(t*.05+sp)*20;
    const P=E.Ps([[x-150*s,cy+40*s],[x-120*s,cy-20*s],[x-50*s,cy-60*s],[x+30*s,cy-70*s],[x+110*s,cy-35*s],[x+160*s,cy+30*s]]);drop(P,.18,10,6,8);fill(P,'#fbfbf7',{t:'sat',a:12,seed:5});
    run([[x-130*s,cy+28*s],[x+140*s,cy+28*s]],'#d9e6f0',{w:4,len:14,gap:6});}
};
Wd.sun=(t,prog=1)=>{const[cx,cy,r]=Wd.SUN;let nd=null;
  if(prog>0){const P=E.Pe(cx,cy,r);if(prog>=1)drop(P,.25,12,6,9);nd=E.fillProg(P,'#f3b42c',{t:'sat',a:90,glow:.18*E.cl(prog*1.4-.4),gcol:'#ffcf5a'},Wd.boxC(cx,cy,r,90),E.cl(prog*1.25));
    if(prog>=1)fill(E.Pe(cx-38,cy-40,34,26,-.5),'#ffd977',{t:'sat',a:90,h:.5});
    // лучи
    const nr=14;for(let i=0;i<nr;i++){const u=E.cl((prog-.78)*4.6-i/nr*.8);if(u<=0)continue;const a=i/nr*Math.PI*2+.1;const r0=r+22,r1=r0+(i%2?45:72)*u;
      stitch(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0,cx+Math.cos(a)*r1,cy+Math.sin(a)*r1,11,'#f6c443',{glow:.12});}}
  return nd;};
// ---------- холмы, дома, деревья ----------
Wd.house=(x,y,w,h,wall,roof,o={})=>{const P=E.Pr(x-w/2,y-h,w,h);drop(P,.3,12,8,10);fill(P,wall,{t:'tat',a:o.wa||0,len:.5,seed:(x|0)%7});
  const R=E.P([[x-w/2-28,y-h+4],[x,y-h-w*.55],[x+w/2+28,y-h+4]]);drop(R,.3,10,6,8);fill(R,roof,{t:'tat',a:-32,seed:(x|0)%5+1});
  run([[x-w/2-24,y-h+2],[x,y-h-w*.55+8],[x+w/2+24,y-h+2]],E.shade(roof,.7),{w:5,len:12,gap:-3});
  // окна
  const wy=y-h*.62;for(const s of o.door?[-1]:[-1,1]){const wx=x+s*w*.24;const Wn=E.Pr(wx-30,wy-30,60,60);fill(Wn,o.lit?'#ffd36b':'#cfe6f2',{t:'sat',a:90,glow:o.lit?.25:0});
    stitch(wx,wy-30,wx,wy+30,5,'#f7f2e6');stitch(wx-30,wy,wx+30,wy,5,'#f7f2e6');run(E.ribbonPts(wx-32,wy-32,64,64),'#f7f2e6',{w:5,len:12,gap:-2});
    fill(E.Pr(wx-38,wy+30,76,14),'#a7c957',{t:'knot',sx:.5});}
  if(o.door){const dx=x+w*.2;const D=E.Prr(dx-34,y-120,68,120,[30,30,0,0]);fill(D,o.door,{t:'tat',a:90,len:.5});fill(E.Pe(dx+18,y-60,6),'#f3b42c',{t:'knot',sx:.4});}
  // труба
  if(o.chim){const cx=x+w*.28;fill(E.Pr(cx-18,y-h-w*.42,36,70),'#9b5a43',{t:'tat',a:0});}
};
Wd.tree=(x,y,s,c='#4f8a3c')=>{const tr=E.Pr(x-14*s,y-110*s,28*s,110*s);fill(tr,'#7a4b2a',{t:'tat',a:90,len:.5});
  const P=E.Ps([[x-90*s,y-120*s],[x-110*s,y-200*s],[x-60*s,y-270*s],[x+10*s,y-290*s],[x+80*s,y-255*s],[x+105*s,y-180*s],[x+80*s,y-115*s],[x,y-100*s]]);drop(P,.3,12,8,10);
  fill(P,c,{t:'knot',sx:.9,seed:(x|0)%8});for(let i=0;i<5;i++){const a=E.rnd(x+i)*6.28,r=E.rnd(x*2+i)*60*s;fill(E.Pe(x+Math.cos(a)*r,y-200*s+Math.sin(a)*r*.7,9*s),'#d8343c',{t:'knot',sx:.5,h:.8});}};
Wd.flowers=(x0,x1,y,seed=1)=>{for(let x=x0,i=0;x<x1;x+=38+E.rnd(i*3+seed)*40,i++){const h=20+E.rnd(i+seed)*30;stitch(x,y,x+3,y-h,4,'#5f8f3e');
  fill(E.Pe(x+3,y-h,9),['#f2b632','#e77fa6','#ffffff','#9c6ad1'][(i+seed)%4],{t:'knot',sx:.45});}};
Wd.fence=(x0,x1,y)=>{for(let x=x0;x<x1;x+=46){stitch(x,y,x,y-80,9,'#fbf7ee');}run([[x0-10,y-58],[x1,y-58]],'#fbf7ee',{w:7,len:30,gap:-4});run([[x0-10,y-26],[x1,y-26]],'#fbf7ee',{w:7,len:30,gap:-4});};
// ---------- весь городок ----------
// o: sun (0..1), hole {x,y,r,t}, notes (0..1 видимость записей), skipSky
Wd.town=(t,o={})=>{
  E.fill(E.Pr(-3000,-3000,8000,8000),LINEN,{t:'fab'});
  if(!o.skipSky){Wd.sky(t,o);}
  const nd=Wd.sun(t,o.sun==null?1:o.sun);
  // холмы
  const hill=[['#7fb069',880,30,.5],['#6a9e55',960,40,2.1],['#5a8f47',1060,26,3.3]];
  const hillP=(y,a,ph)=>{const p=[];const n=40;for(let k=0;k<=n;k++){const x=-2400+6600*k/n;p.push([x,y+Math.sin(x*.003+ph)*a*2-Math.cos(x*.0017+ph)*a]);}p.push([4200,3000],[-2400,3000]);return E.P(p);};
  hill.forEach(([c,y,a,ph],i)=>fill(hillP(y,a,ph),c,{t:'tat',a:i==1?-12:10,len:.5,seed:i+3}));
  // дальние деревья (узелки)
  for(let i=0;i<14;i++){const x=-1500+i*300+E.rnd(i)*120;fill(E.Pe(x,930+E.rnd(i+4)*30,60+E.rnd(i)*30,46),i%2?'#4d7f3a':'#3f6e31',{t:'knot',sx:.7,seed:i});}
  // дома вдоль улицы
  const HS=[[-760,'#e3d3b0','#4b6f9e'],[-320,'#9cc5d9','#b0533c'],[200,'#f2e3c6','#c8323a',1],[700,'#e9b8a8','#5a3a6b'],[1250,'#d6e3c3','#7a4b2a'],[1800,'#f0d39a','#3f6fb0'],[2350,'#d7c4e6','#b0533c']];
  for(const[x,w,r,me]of HS){Wd.house(x,Wd.GY-40,me?300:270,me?250:230,w,r,{door:'#6b8f3e',chim:me,lit:o.lit});}
  for(const x of[-540,460,980,1530,2080])Wd.tree(x,Wd.GY-36,1);
  // забор, трава, дорога
  Wd.fence(-1000,2600,Wd.GY-36);
  const G=E.Pr(-3000,Wd.GY-40,8000,2000);fill(G,'#86b75f',{t:'tat',a:-20,len:.5,seed:2});
  const RD=E.Pr(-3000,Wd.GY-12,8000,100);drop(RD,.2,8,0,6);fill(RD,'#e8cf9e',{t:'sat',a:0,seed:4});
  run([[-3000,Wd.GY+38],[4000,Wd.GY+38]],'#cfae74',{w:5,len:24,gap:20});
  Wd.flowers(-1000,2600,Wd.GY+150,1);Wd.flowers(-1000,2600,Wd.GY+280,3);
  return nd;};
// ---------- изнанка-«сценарий»: записи маркером на голом льне ----------
Wd.notes=(a)=>{if(a<=0)return;const XC=E.X.C;XC.save();XC.globalAlpha=E.cl(a)*.85;XC.fillStyle='#2f5fb8';XC.strokeStyle='#2f5fb8';XC.lineWidth=3;
  XC.font='52px Cav';XC.textAlign='left';
  const L=[['DAY 10,950',230,-150,-.04],['6:00  SUN  ⟶',330,-50,.02],['9:14  RAIN → OLLIE ONLY',110,60,-.03],['BALLOON LADY ×3 (loop)',150,170,.03],['DO NOT LET HIM',190,290,-.02],['NEAR THE EDGE !!',230,355,-.02]];
  for(const[s,x,y,r]of L){XC.save();XC.translate(x,y);XC.rotate(r);XC.fillText(s,0,0);XC.restore();}
  // пунктир-разметка и стрелка
  XC.lineWidth=4;XC.beginPath();XC.moveTo(170,395);XC.lineTo(560,385);XC.stroke();
  XC.restore();};
// ---------- обод пялец (настоящее дерево) ----------
Wd.hoop=(o={})=>{const{cx,cy,r,w}=Wd.HOOP;const XC=E.X.C;
  // тень обода на ткань
  const R=new Path2D();R.arc(cx,cy,r+w/2,0,6.29);R.arc(cx,cy,r-w/2,0,6.29,true);
  E.drop(R,.45,24,18,26);
  E.fill(R,(c)=>{const g=c.createRadialGradient(cx,cy,r-w/2,cx,cy,r+w/2);g.addColorStop(0,'#7a4c26');g.addColorStop(.25,'#c98f55');g.addColorStop(.5,'#e2b07a');g.addColorStop(.8,'#b97c45');g.addColorStop(1,'#6a3f1e');return g;},{t:'real'});
  // волокна дерева
  XC.save();XC.clip(R);XC.globalAlpha=.18;XC.strokeStyle='#5a3416';for(let i=0;i<9;i++){XC.lineWidth=2+E.rnd(i)*3;XC.beginPath();XC.arc(cx,cy,r-w*.42+i*w*.1,0,6.29);XC.stroke();}XC.restore();
  // винт-зажим сверху
  const sx=cx,sy=cy-r-w*.5;const B=E.Prr(sx-70,sy-90,140,110,18);E.drop(B,.4,14,8,12);
  E.fill(B,(c)=>{const g=c.createLinearGradient(sx-70,0,sx+70,0);g.addColorStop(0,'#6d5a2a');g.addColorStop(.35,'#f0d27a');g.addColorStop(.6,'#b8963e');g.addColorStop(1,'#5a4820');return g;},{t:'real'});
  E.fill(E.Pe(sx,sy-130,50,50),(c)=>{const g=c.createRadialGradient(sx-15,sy-145,5,sx,sy-130,50);g.addColorStop(0,'#fff2c0');g.addColorStop(.4,'#d4b05a');g.addColorStop(1,'#5a4820');return g;},{t:'real'});};
// ---------- пустая ткань снаружи обода: складки ----------
Wd.blank=(x0,y0,x1,y1,t)=>{E.fill(E.Pr(x0,y0,x1-x0,y1-y0),LINEN,{t:'fab',seed:3});
  const XC=E.X.C;XC.save();XC.beginPath();XC.rect(x0,y0,x1-x0,y1-y0);XC.clip();
  for(let i=0;i<9;i++){const x=x0+(x1-x0)*(i+.5)/9+Math.sin(i*2.3)*120;const g=XC.createLinearGradient(x-90,0,x+90,0);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.45,'rgba(60,40,20,.16)');g.addColorStop(.55,'rgba(255,250,235,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
    XC.save();XC.translate(x,(y0+y1)/2);XC.rotate(.25+Math.sin(i)*.3);XC.fillStyle=g;XC.fillRect(-90,-(y1-y0),180,(y1-y0)*2);XC.restore();}
  XC.restore();};
// ---------- студия вокруг (размыто, по-настоящему) ----------
Wd.studio=(t,blur=4,rec=1)=>{const XC=E.X.C;const{cx,cy,r}=Wd.HOOP;
  E.fill(E.Pr(-12000,-12000,26000,26000),(c)=>{const g=c.createRadialGradient(cx,cy,r*.8,cx,cy,r*5);g.addColorStop(0,'#3a2f2a');g.addColorStop(.5,'#1c1717');g.addColorStop(1,'#0b0a0b');return g;},{t:'real',blur});
  // кольцевая лампа за пяльцами
  const RL=new Path2D();RL.arc(cx,cy,r*1.75,0,6.29);RL.arc(cx,cy,r*1.55,0,6.29,true);E.fill(RL,'#a89a86',{t:'glow',glow:.07,gcol:'#fff0d8'});
  // стол
  E.fill(E.Pr(-12000,cy+r*1.25,26000,9000),(c)=>{const g=c.createLinearGradient(0,cy+r*1.25,0,cy+r*3);g.addColorStop(0,'#6b4a33');g.addColorStop(1,'#2a1c14');return g;},{t:'real',blur:blur*.6});
  // подставка пялец
  E.fill(E.Pr(cx-90,cy+r,180,r*.4),'#5a3a22',{t:'real',blur:blur*.3});
  // камера на штативе (передний план слева внизу), объектив смотрит на пяльцы
  const kx=cx-r*1.25,ky=cy+r*1.35,k=r*.0042;
  for(const[dx,dy]of[[-150,700],[0,760],[170,700]]){const P=E.Pcap(kx,ky+60*k*.3,kx+dx*k,ky+dy*k,9*k,6*k);E.fill(P,'#121214',{t:'real',blur:blur*.4});}
  E.fill(E.Prr(kx-120*k,ky-90*k,240*k,170*k,22*k),(c)=>{const g=c.createLinearGradient(0,ky-90*k,0,ky+80*k);g.addColorStop(0,'#4a4a50');g.addColorStop(.15,'#2a2a2f');g.addColorStop(1,'#101012');return g;},{t:'real',blur:blur*.4});
  E.fill(E.Prr(kx-60*k,ky-130*k,120*k,44*k,10*k),'#1d1d21',{t:'real',blur:blur*.4});
  E.save();E.tr(kx+110*k,ky-20*k);E.rot(-.32);
  E.fill(E.Prr(0,-62*k,170*k,124*k,14*k),(c)=>{const g=c.createLinearGradient(0,-62*k,0,62*k);g.addColorStop(0,'#55555c');g.addColorStop(.3,'#26262b');g.addColorStop(1,'#0c0c0e');return g;},{t:'real',blur:blur*.4});
  E.fill(E.Pe(170*k,0,22*k,70*k),(c)=>{const g=c.createRadialGradient(170*k,-20*k,2,170*k,0,70*k);g.addColorStop(0,'#8fa6d8');g.addColorStop(.35,'#1b2133');g.addColorStop(1,'#050507');return g;},{t:'real',blur:blur*.4});
  E.restore();
  if(rec){const on=Math.sin(t*6)>-.3;E.fill(E.Pe(kx-80*k,ky-60*k,14*k),on?'#ff2a2a':'#5a1010',{t:'glow',glow:on?.9:0,gcol:'#ff2020'});}
  // экранчик камеры: в нём пяльцы
  E.fill(E.Prr(kx-112*k,ky-20*k,120*k,80*k,6*k),'#3a6aa0',{t:'glow',glow:.25,gcol:'#5a8ac0'});
  // монитор справа
  const mx=cx+r*2.5,my=cy+r*.1;E.fill(E.Prr(mx-500,my-330,1000,620,20),'#0d0f14',{t:'real',blur});E.fill(E.Prr(mx-460,my-290,920,540,10),'#2d5f9a',{t:'glow',glow:.25,gcol:'#3a78c0'});
};
window.Wd=Wd;
})();
