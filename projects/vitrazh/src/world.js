// Wd — витражный мир: небо, холмы, мастерская, осколки, искры, окно, ленты.
(function(){
const Wd={};const{P,Ps,Pe,Pr,piece,pline,pfill,pmatte,pgrad,mosaic,jit,mix,shade,rnd}=E;
// свет-настроения
Wd.MOOD={
  day:{skyT:[.35,.6,1.05],skyB:[1,.95,.82],sunC:[1.2,1.0,.75],sun:[.78,.86,.11],light:1.05,amb:.004,lamp:[.5,.5,.2,0]},
  eve:{skyT:[.55,.35,.6],skyB:[1.3,.7,.35],sunC:[1.4,.65,.25],sun:[.25,.35,.14],light:.95,amb:.004,lamp:[.5,.5,.2,0]},
  night:{skyT:[.03,.04,.09],skyB:[.06,.06,.12],sunC:[.2,.25,.45],sun:[.8,.9,.05],light:1,amb:.002,lampC:[1.5,.75,.3],lamp:[.5,.45,.22,1]},
  winter:{skyT:[.22,.3,.48],skyB:[.5,.58,.72],sunC:[.4,.45,.6],sun:[.5,.9,.2],light:.75,amb:.003,lamp:[.5,.5,.2,0]},
  dawn:{skyT:[.4,.45,.9],skyB:[1.4,.85,.55],sunC:[1.6,1.1,.6],sun:[.5,.6,.16],light:1.1,amb:.004,lamp:[.5,.5,.2,0]},
};
Wd.mood=(a,b,u=0)=>{const A=Wd.MOOD[a],B=Wd.MOOD[b||a];const L=E.L;for(const k of['skyT','skyB','sunC','sun','lamp','lampC'])if(A[k]||B[k]){const x=A[k]||L[k],y=B[k]||L[k];L[k]=x.map((v,i)=>v+(y[i]-v)*u);}
  L.light=E.lerp(A.light,B.light,u);L.amb=E.lerp(A.amb,B.amb,u);};
// ---------- пейзаж ----------
Wd.sky=(c1,c2,cell=190,y1=1920,seed=3)=>mosaic(Pr(-200,-200,1480,y1+200),[-200,-200,1480,y1+200],cell,(x,y,i)=>jit(mix(c1,c2,E.cl((y+200)/(y1+200))),i,.2),{split:.12,seed});
Wd.sun=(x,y,r)=>{for(let i=0;i<12;i++){const a=i/12*Math.PI*2,a2=a+.18;piece(P([[x+Math.cos(a-.12)*r*1.1,y+Math.sin(a-.12)*r*1.1],[x+Math.cos(a)*r*1.75,y+Math.sin(a)*r*1.75],[x+Math.cos(a+.12)*r*1.1,y+Math.sin(a+.12)*r*1.1]]),jit('#f0b030',i,.1));}
  piece(Pe(x,y,r),'#ffd860');pmatte(x,y,r,.0);};
Wd.cloud=(x,y,s=1)=>{const p=Ps([[x-120*s,y+30*s],[x-90*s,y-25*s],[x-30*s,y-55*s],[x+40*s,y-45*s],[x+100*s,y-20*s],[x+130*s,y+30*s]]);piece(p,'#e8eef5',{tex:.6});pgrad(p,0,y-55*s,0,y+30*s,0,.25);};
Wd.hills=(y,c,amp=80,seed=1,cell=190)=>{const pts=[];for(let i=0;i<=8;i++){const x=-100+i*160;pts.push([x,y+Math.sin(i*1.3+seed)*amp+E.noise(i*.7+seed*3)*amp*.6]);}
  pts.push([1180,2100],[-100,2100]);const p=Ps(pts);mosaic(p,[-150,y-amp*2,1400,2200-y+amp*2],cell,(x,yy,i)=>jit(c,i+seed*100,.2),{split:.12,seed:seed*11});return p;};
Wd.house=(x,y,w,h,wall='#d9c08a',roof='#a83a2a')=>{piece(Pr(x,y-h,w,h),wall,{tex:.3});pgrad(Pr(x,y-h,w,h),x,0,x+w,0,0,.25);
  piece(P([[x-w*.12,y-h],[x+w/2,y-h-w*.55],[x+w*1.12,y-h]]),roof);piece(Pr(x+w*.35,y-h*.55,w*.3,h*.55),'#5a3a22',{tex:.4});
  piece(Pr(x+w*.12,y-h*.85,w*.2,h*.22),'#ffd070',{emit:.15});};
Wd.church=(x,y,s=1)=>{E.xf(x,y,0,s,()=>{piece(P([[-90,0],[-90,-260],[0,-330],[90,-260],[90,0]]),'#cfc6b0',{tex:.4});piece(P([[-40,-330],[-40,-520],[0,-640],[40,-520],[40,-330]]),'#bdb39a',{tex:.4});
  piece(E.Parch(-30,-180,60,140),'#3a62b0');piece(Pr(-6,-600,12,60),'#c9a23a');piece(Pr(-22,-582,44,10),'#c9a23a');});};
// ---------- мастерская ----------
Wd.wall=(c='#8a5a2e',cell=150,seed=5,y0=-200,y1=2100)=>mosaic(Pr(-200,y0,1480,y1-y0),[-200,y0,1480,y1-y0],cell,(x,y,i)=>{const r=rnd(i*.37+seed);return jit(r<.12?'#24423e':(r<.2?'#4a3a5a':c),i,.3);},{split:.1,seed,ky:.62});
Wd.window=(x,y,w,h,inside)=>{const ar=E.Parch(x,y,w,h);E.save();E.clip(ar);inside();E.restore();
  // переплёт
  E.lead(ar,22);E.leadLine([[x+w/2,y+h*.18],[x+w/2,y+h]],14);E.leadLine([[x,y+h*.55],[x+w,y+h*.55]],14);};
Wd.shelf=(x,y,w,cols,seed=1)=>{piece(Pr(x,y,w,26),'#5a3818',{tex:.9});let cx=x+14;for(let i=0;cx<x+w-30;i++){const ww=36+rnd(i+seed)*40,hh=150+rnd(i*3+seed)*120;
  const p=P([[cx,y],[cx+ww,y],[cx+ww+8,y-hh],[cx+8,y-hh]]);piece(p,cols[i%cols.length],{seed:rnd(i*7+seed)});pgrad(p,cx,0,cx+ww,0,0,.15);cx+=ww+6;}};
Wd.table=(y,c='#5a3a20',x0=-200,x1=1280)=>{const top=P([[x0,y],[x1,y],[x1,y+60],[x0,y+60]]);piece(top,shade(c,1.15),{tex:.6});
  const fr=P([[x0,y+60],[x1,y+60],[x1,2100],[x0,2100]]);mosaic(fr,[x0,y+60,x1-x0,2100-y],230,(xx,yy,i)=>jit(c,i,.15),{split:0,seed:21,ky:.5});
  for(let i=0;i<6;i++)pline([[x0,y+10+i*9],[x1,y+14+i*9+Math.sin(i)*4]],2,.18);};
Wd.lamp=(x,y,on=1,s=1)=>{E.xf(x,y,0,s,()=>{piece(P([[-40,0],[40,0],[30,-18],[-30,-18]]),'#6a4a22',{tex:.9});
  const gl=Ps([[-34,-18],[-44,-70],[-26,-118],[26,-118],[44,-70],[34,-18]]);piece(gl,'#ffd27a',{emit:.25*on,tex:.3});
  if(on){E.emitDot(0,-62,60,.55*on);E.emitDot(0,-62,16,1*on);}piece(P([[-24,-118],[24,-118],[16,-140],[-16,-140]]),'#6a4a22',{tex:.9});});};
// осколок
Wd.shard=(x,y,sz,col,rot=0,seed=1,glint=0)=>{const n=3+Math.floor(rnd(seed)*3);const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rnd(seed+i)*1.2;const r=sz*(.55+rnd(seed*3+i)*.6);pts.push([Math.cos(a+rot)*r,Math.sin(a+rot)*r*.7]);}
  E.xf(x,y,0,1,()=>{piece(P(pts),col,{lw:6,seed:rnd(seed*9)});if(glint>0){const k=E.cl(glint);E.emitDot(pts[0][0]*.5,pts[0][1]*.5,sz*.35*k,k);}});};
Wd.SHC=['#c8282c','#2a5cc0','#e8b030','#2a8a4a','#7a3ab0','#e86a20','#3ab0c0','#d8d0c0'];
// ящик
Wd.box=(x,y,w,h,lid=0)=>{const fr=P([[x,y-h],[x+w,y-h],[x+w,y],[x,y]]);piece(fr,'#7a4a20',{tex:.85});for(let i=1;i<3;i++)pline([[x,y-h+i*h/3],[x+w,y-h+i*h/3]],3,.4);
  if(lid>0){E.xf(x,y-h,-lid*1.9,1,()=>piece(P([[0,0],[w,0],[w,-16],[0,-16]]),'#8a5626',{tex:.85}));}};
// мяч
Wd.ball=(x,y,r,rot=0)=>{E.xf(x,y,rot,1,()=>{const b=Pe(0,0,r);piece(b,'#b8742e',{seed:.2});
  E.save();E.clip(b);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const p=new Path2D();p.ellipse(Math.cos(a)*r*.5,Math.sin(a)*r*.5,r*.9,r*.42,a+1.57,0,Math.PI*2);E.lead(p,Math.max(6,r*.05));
    E.pline([[Math.cos(a)*r*.1,Math.sin(a)*r*.1],[Math.cos(a)*r*.9,Math.sin(a)*r*.9]],r*.02,.4);}E.restore();
  E.pvig(b,-r*.35,-r*.35,r*.15,r*1.05,.55);E.pscratch([[-r*.45,-r*.3],[-r*.3,-r*.48]],r*.08);});};// паяльник
Wd.iron=(x,y,a=0)=>{E.xf(x,y,a,1,()=>{piece(P([[-8,0],[8,0],[10,-120],[-10,-120]]),'#9aa0aa');piece(P([[-16,-120],[16,-120],[18,-300],[-18,-300]]),'#7a4a22',{tex:.8});piece(P([[-6,0],[6,0],[0,24]]),'#e8803a',{emit:.5});});};
// искры
Wd.sparks=(x,y,t,seed=1,n=14,pw=1)=>{for(let i=0;i<n;i++){const t0=rnd(i+seed)*.25,u=t-t0;if(u<0||u>.55)continue;const a=-Math.PI/2+(rnd(i*3+seed)-.5)*2.6,v=260+rnd(i*7+seed)*380;
  const px=x+Math.cos(a)*v*u,py=y+Math.sin(a)*v*u+900*u*u;const k=(1-u/.55)*pw;E.emitDot(px,py,10*k+2,k);
  E.X.T.save();E.X.T.globalCompositeOperation='lighter';E.X.T.strokeStyle=`rgb(0,0,${Math.round(200*k)})`;E.X.T.lineWidth=3;E.X.T.beginPath();E.X.T.moveTo(px,py);E.X.T.lineTo(px-Math.cos(a)*v*.03,py-(Math.sin(a)*v+1800*u)*.03);E.X.T.stroke();E.X.T.restore();}};
// снег / листья за окном
Wd.snow=(t,x0,y0,w,h,n=40)=>{for(let i=0;i<n;i++){const sx=x0+((rnd(i)*w+Math.sin(t*.8+i)*20)%w+w)%w,sy=y0+((rnd(i*3)*h+t*(60+rnd(i*5)*60))%h);E.emitDot(sx,sy,5+rnd(i*7)*5,.35);}};
// дым
Wd.smoke=(x,y,t,seed=1)=>{for(let i=0;i<6;i++){const u=((t*.6+i/6)%1);const px=x+Math.sin(u*6+i+seed)*30*u,py=y-u*220;const r=18+u*50;
  const g=E.X.M.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(0,${Math.round(90*(1-u))},0,1)`);g.addColorStop(1,'rgba(0,0,0,0)');}};
// трещины на экране (до разлёта осколков)
Wd.cracks=(cx,cy,k,seed=3)=>{const list=E.shards(cx,cy,seed);E.save();E.screen();
  for(const s of list){const d=Math.hypot(s.c[0]-cx,s.c[1]-cy);if(d/1500>k)continue;const p=P(s.pg);E.X.M.globalCompositeOperation='lighten';E.X.M.lineWidth=3;E.X.M.strokeStyle='rgb(255,0,0)';E.X.M.stroke(p);
    E.X.T.save();E.X.T.globalCompositeOperation='lighter';E.X.T.strokeStyle='rgb(0,0,90)';E.X.T.lineWidth=1.5;E.X.T.stroke(p);E.X.T.restore();}
  E.X.M.globalCompositeOperation='source-over';E.emitDot(cx,cy,60*E.cl(k*4),1);E.restore();};
// рамка «окна-витража» по краям кадра (каменная арка)
Wd.frame=()=>{E.save();E.screen();const o=new Path2D();o.rect(-10,-10,1100,1940);const ar=E.Parch(40,40,1000,1840);E.X.M.fillStyle='rgb(255,0,0)';
  E.restore();};
window.Wd=Wd;})();
// финальный витраж: стекольщик протягивает мальчику красный осколок
Wd.design=(t=0,o={})=>{const ar=E.Parch(60,60,960,1800);
  E.save();E.clip(ar);
  Wd.sky('#173a96','#3f78d0',170,1500,77);
  // солнце-нимб
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;E.piece(E.P([[540+Math.cos(a-.17)*130,520+Math.sin(a-.17)*130],[540+Math.cos(a)*290,520+Math.sin(a)*290],[540+Math.cos(a+.17)*130,520+Math.sin(a+.17)*130]]),i%2?'#f0b030':'#e86a20');}
  E.piece(E.Pe(540,520,130),'#ffd860');E.pvig(E.Pe(540,520,130),540,520,40,130,.35);
  Wd.hills(1420,'#2f7a2a',50,9,170);
  // мастерская сбоку
  Wd.house(780,1430,190,170,'#d9c08a','#a83a2a');
  // осколки на земле
  for(let i=0;i<9;i++)Wd.shard(150+E.rnd(i*3+70)*780,1640+E.rnd(i*5+71)*160,16+E.rnd(i*7)*16,Wd.SHC[i%8],E.rnd(i)*6,i+200,0);
  C.fig({x:390,y:1470,kind:'old',s:1.75,lean:.18,legL:[.1,0],legR:[-.1,0],armL:[1.35,.35],armR:[.15,.3],apronLen:.5,
    hold:()=>{E.xf(0,40,0,1,()=>{E.piece(E.P([[-30,-40],[26,-46],[38,8],[2,42],[-36,12]]),'#c80c10',{lw:7});});},head:{mouth:'smile',look:[.8,.2],blink:o.blink||0}});
  C.fig({x:760,y:1620,kind:'boy',s:1.85,dir:-1,armL:[1.5,.3],armR:[.1,.2],head:{mouth:'smile',open:.3,look:[.8,-.5],raise:.5,brow:-.2}});
  E.restore();
  // кайма
  const inner=E.Parch(110,110,860,1700);const band=new Path2D();band.addPath(ar);band.addPath(inner);
  E.X.G.save();E.X.M.save();E.X.T.save();E.X.G.clip(band,'evenodd');E.X.M.clip(band,'evenodd');E.X.T.clip(band,'evenodd');
  E.mosaic(E.Pr(50,50,980,1820),[50,50,980,1820],62,(xx,yy,i)=>['#c8282c','#e8b030','#2a5cc0','#2a8a4a'][i%4],{split:0,jit:.08,seed:91});
  E.X.G.restore();E.X.M.restore();E.X.T.restore();E.lead(inner,10);E.lead(ar,26);
  // камень вокруг
  const st=new Path2D();st.rect(-200,-200,1480,2320);st.addPath(ar);E.X.G.save();E.X.M.save();E.X.T.save();E.X.G.clip(st,'evenodd');E.X.M.clip(st,'evenodd');E.X.T.clip(st,'evenodd');
  E.mosaic(E.Pr(-200,-200,1480,2320),[-200,-200,1480,2320],140,(x,y,i)=>E.jit('#3a3430',i,.2),{split:0,seed:93,ky:.6,tex:1,noasm:true});
  E.X.G.restore();E.X.M.restore();E.X.T.restore();};
