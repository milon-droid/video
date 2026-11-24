// Wd — элементы мира гравюры: небо-бокаси, снег, дождь, горы, деревья, сёдзи, картуши, печать, занавес.
(function(){
const Wd={};const r=E.rnd,cl=E.cl,lerp=E.lerp;
const FW=1080,FH=1920;
Wd.sky=(inks)=>E.fill(E.rect(-600,-600,FW+1200,FH+1200),inks);
Wd.bok=(id,y0,y1,d0,d1,x0=-600,x1=FW+600)=>({[id]:{g:[0,y0,0,y1],s:[[0,d0],[1,d1]]}});
// снег: белые хлопья (гофун) с ключевой точкой-обводкой, падают по времени
Wd.snow=(t,n,o={})=>{const p=new Path2D();const sp=o.speed||90,sz=o.size||7,wind=o.wind||20;
  for(let i=0;i<n;i++){const s=sz*(.5+r(i*3.1)*.9);const x=((r(i)*1.3*FW+t*wind*(.6+r(i+2))+Math.sin(t*1.3+i)*14)%(FW*1.3)+FW*1.3)%(FW*1.3)-FW*.15;
    const y=((r(i+9)*FH*1.2+t*sp*(.6+r(i+5)*.8))%(FH*1.2))-FH*.1;p.moveTo(x+s,y);p.arc(x,y,s,0,7);}
  E.fill(p,{GOFUN:1},true);if(o.key)E.stroke(p,0,1.2,.35);};
// дождь Хиросигэ: тонкие косые линии двух наклонов
Wd.rain=(t,n,ang=.18,o={})=>{for(const lay of [0,1]){const p=new Path2D();const a=ang+lay*.07,L=o.len||260;const dx=Math.sin(a),dy=Math.cos(a);
  for(let i=0;i<n;i++){const k=i+lay*1000;const x=r(k)*FW*1.4-FW*.2,y=((r(k+7)*FH*1.3+t*(1800+lay*400))%(FH*1.3))-FH*.15;const l=L*(.6+r(k+3)*.8);
    p.moveTo(x,y);p.lineTo(x+dx*l,y+dy*l);}E.stroke(p,0,lay?1.6:2.4,lay?.55:.75);}};
// хребет: линия гор с бокаси
Wd.ridge=(y,amp,seed,inks,o={})=>{const pts=[[-400,FH+600]];for(let x=-400;x<=FW+400;x+=30){const n=E.noise(x*.004+seed)*amp+E.noise(x*.013+seed*3)*amp*.35;pts.push([x,y+n]);}
  pts.push([FW+400,FH+600]);const p=E.poly(pts);E.fill(p,inks);if(o.key)E.line(pts.slice(1,-1),o.key,o.key,0,.9);return p;};
// сосна в снегу
Wd.pine=(x,y,s,seed=0,snow=true)=>{E.line([[x,y],[x+s*.05,y-s*.5],[x-s*.03,y-s]],s*.05,s*.02,0,1);
  for(let i=0;i<5;i++){const yy=y-s*(.25+i*.17),w=s*(.42-i*.07)*(1+r(seed+i)*.3);const p=E.smooth([[x-w,yy],[x,yy-s*.12],[x+w,yy],[x+w*.5,yy+s*.03],[x-w*.5,yy+s*.03]]);
    E.fill(p,{MIDORI:.9,AI:.4,KEY:.15});E.stroke(p,0,s*.008);if(snow){const q=E.smooth([[x-w*.8,yy-s*.02],[x,yy-s*.13],[x+w*.8,yy-s*.02],[x,yy-s*.07]]);E.fill(q,{GOFUN:1});}}};
// сёдзи: рама с решёткой и светящаяся бумага
Wd.shojiPaper=(x,y,w,h,glow=1,gx,gy)=>{const p=E.rect(x,y,w,h);gx=gx==null?x+w/2:gx;gy=gy==null?y+h*.55:gy;
  E.fill(p,{KI:{r:[gx,gy,0,Math.max(w,h)*.8],s:[[0,.75*glow],[1,.22*glow]]},MOMO:{r:[gx,gy,0,w],s:[[0,.25*glow],[1,0]]}});return p;};
Wd.shojiFrame=(x,y,w,h,cols=4,rows=6,o={})=>{const fw=o.fw||22,bw=o.bw||7;const wood={KI:.55,NEZU:.75,BENI:.15};
  const p=new Path2D();for(let i=1;i<cols;i++){p.rect(x+w*i/cols-bw/2,y,bw,h);}for(let j=1;j<rows;j++){p.rect(x,y+h*j/rows-bw/2,w,bw);}
  E.fill(p,wood);E.stroke(p,0,1.5,.8);const fr=new Path2D();fr.rect(x-fw,y-fw,w+fw*2,fw);fr.rect(x-fw,y+h,w+fw*2,fw);fr.rect(x-fw,y,fw,h);fr.rect(x+w,y,fw,h);
  E.fill(fr,wood);E.stroke(fr,0,2.5);};
// брызги киновари
Wd.splat=(cx,cy,t,seed,sc=1)=>{if(t<=0)return;const p=new Path2D();const g=E.eo(t*3);
  for(let i=0;i<46;i++){const a=-1.2+r(seed+i)*2.6+(r(seed+i*2)<.3?Math.PI:0),d=(30+r(seed+i*3)**1.7*520)*g*sc,s=(4+r(seed+i*5)*20*(1-d/600/sc))*sc;
    const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.8;p.moveTo(x+s,y);p.ellipse(x,y,s*1.3,s,a,0,7);
    const run=Math.max(0,t-.25)*90*r(seed+i*7)*sc;if(run>2&&s>8*sc){p.moveTo(x+s*.35,y);p.rect(x-s*.35,y,s*.7,run);p.moveTo(x+s*.5,y+run);p.arc(x,y+run,s*.5,0,7);}}
  p.moveTo(cx+60*sc,cy);p.ellipse(cx,cy,70*sc*g,48*sc*g,.3,0,7);E.fill(p,{BENI:.95,KEY:.12},false);};
// картуш: прямоугольная плашка с двойной рамкой и надписью (как названия на гравюрах)
Wd.cart=(s,x,y,size,o={})=>{const a=o.a==null?1:o.a;if(a<=0)return;const font=o.font||'Ship';
  const ctx=E.X[0];ctx.font=`${o.w||800} ${size}px ${font}`;ctx.letterSpacing=(o.ls||size*.08)+'px';const tw=ctx.measureText(s).width;
  const pw=tw+size*1.1,ph=size*1.65;const k=E.back(a);const sx=x-pw/2*k,sy=y-ph/2;
  const box=E.rect(sx,sy,pw*k,ph);E.fill(box,o.inks||{KI:.75,GOFUN:.0});E.stroke(box,0,size*.07);
  E.stroke(E.rect(sx+size*.16,sy+size*.16,pw*k-size*.32,ph-size*.32),0,size*.025,.9);
  if(a>.25)E.text(s,x,y+size*.04,size,{font,ls:o.ls||size*.08,w:o.w,d:cl((a-.25)/.3)});};
// вертикальный тандзаку с иероглифами
Wd.tanzaku=(s,x,y,size,a=1,sub)=>{if(a<=0)return;const n=[...s].length;const w=size*1.45,h=size*(n*1.08+.7)*E.eo(a);
  const box=E.rect(x-w/2,y,w,h);E.fill(box,{KI:.6,MOMO:.35});E.stroke(box,0,size*.06);E.stroke(E.rect(x-w/2+size*.12,y+size*.12,w-size*.24,h-size*.24),0,size*.025);
  E.clipped(box,()=>{[...s].forEach((ch,i)=>E.text(ch,x,y+size*(.85+i*1.08),size,{font:'Yuji',w:400}));});
  if(sub&&a>.6){Wd.cart(sub,x-size*.9,y+h+size*.75,size*.36,{a:cl((a-.6)/.4)});}};
// печать ханко
Wd.seal=(x,y,s,a=1,txt)=>{if(a<=0)return;const k=a<1?1+(1-E.eo(a))*.6:1;const sz=s*k;
  const p=E.rect(x-sz/2,y-sz/2,sz,sz);E.fill(p,{BENI:.95*cl(a*2)},true);
  if(txt){const ch=[...txt];const n=ch.length;const cols=n>2?2:1,rows=Math.ceil(n/cols);
    ch.forEach((c,i)=>{const cx=x+(cols==2?(i<rows?sz*.22:-sz*.22):0),cy=y-sz*.42+sz*.84*((i%rows)+.5)/rows;E.text(c,cx,cy,sz*.84/rows*.95,{font:'Yuji',w:400,carve:true,d:0});});}};
// занавес кабуки: чёрный / хурма / зелёный
Wd.curtain=(u)=>{if(u<=0)return;const w=FW*1.15*E.eio(u);const cols=[{KEY:1},{BENI:.75,KI:.7},{MIDORI:.95,AI:.35}];const sw=FW*1.15/9;
  for(let i=0;i<9;i++){const x0=FW-w+i*sw;if(x0>FW+10)continue;const sway=Math.sin(i*1.7+u*9)*6;const p=E.poly([[x0,-20],[x0+sw+1,-20],[x0+sw+1+sway,FH+20],[x0+sway,FH+20]]);E.fill(p,cols[i%3]);}
  E.stroke(E.poly([[FW-w,-20],[FW-w,FH+20]],false),0,4);};
// мягкий клуб дыма (градиент, не кружок)
Wd.puff=(x,y,rad,d,id=NEZU)=>E.fill(E.ell(x,y,rad,rad*.8),{[id]:{r:[x,y,0,rad],s:[[0,d],[.6,d*.5],[1,0]]}},false);
// луна с ореолом (бокаси)
Wd.moon=(x,y,R,o={})=>{E.fill(E.ell(x,y,R*3.2,R*3.2),{KI:{r:[x,y,R,R*3.2],s:[[0,.5],[1,0]]}},false);const m=E.ell(x,y,R,R);E.fill(m,{GOFUN:1,KI:.25});E.stroke(m,0,3,.6);};
// лепестки сакуры / листья клёна
Wd.petals=(t,n,seed,o={})=>{const p=new Path2D();const sz=o.size||10;for(let i=0;i<n;i++){const k=seed+i;const x=((r(k)*FW*1.2+t*(o.wind||60)*(.5+r(k+1))+Math.sin(t*2+i)*30)%(FW*1.2)+FW*1.2)%(FW*1.2)-FW*.1;
  const y=((r(k+2)*FH*1.1+t*(o.fall||70)*(.5+r(k+3)))%(FH*1.1))-FH*.05;const a=t*2+i,s=sz*(.6+r(k+4)*.7);p.moveTo(x+Math.cos(a)*s,y+Math.sin(a)*s*.5);p.ellipse(x,y,s,s*.55,a,0,7);}
  E.fill(p,o.inks||{MOMO:1,BENI:.1},false);};
Wd.maple=(x,y,s,a,inks)=>{const pts=[];for(let i=0;i<10;i++){const aa=a+i/10*Math.PI*2;const rr=i%2?s*.42:s;pts.push([x+Math.cos(aa)*rr,y+Math.sin(aa)*rr]);}
  const p=E.poly(pts);E.fill(p,inks||{BENI:.95,KI:.3});E.stroke(p,0,1.2,.6);return p;};
window.Wd=Wd;
})();
