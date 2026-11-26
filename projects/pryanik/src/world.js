// Мир «CROOKED»: противень с пергаментом, мешок с насадкой, лопатка, подарочная коробка, ложка (сверху);
// ночной стол (спереди): окно со снегом и гирляндой, скатерть, свеча, мандарины, чашки, рука бабушки с часами; отражение в чае.
(function(){const WD={};const D=Math.PI/180;
const R=E.rnd;
// ---------- сверху ----------
WD.tray=(x,y,w,h)=>{E.depth(.55);E.mat(E.MATTE);const tb=E.Pr(-1500,-1500,4000,5000);E.fill(tb,'#5e3a22',{h:.0});E.texture(tb,E.PAT.wood,'C','multiply',1,1.2);E.texture(tb,E.PAT.wood,'H','multiply',.5,1.2);E.depth(.5);E.mat(E.METAL);E.obj(()=>{E.fill(E.Prr(x-40,y-40,w+80,h+80,46),'#5d5f63',{h:.12,bev:30,g:.6});});
  E.mat(E.MATTE);const p=E.Prr(x,y,w,h,18);E.fill(p,'#eadcbf',{h:.05,bev:4});E.texture(p,E.PAT.paper,'C','multiply',.55,2.2);E.texture(p,E.PAT.paper,'H','multiply',.35,2.2);
  // мука и крошки
  for(let i=0;i<70;i++){const cx=x+R(i*3.1)*w,cy=y+R(i*7.3)*h;const r=2+R(i*1.9)*5;E.mat(E.DOUGH);E.fill(E.Pe(cx,cy,r,r*.8,R(i)*3),E.rgb(E.mix('#8a4a1e','#c07a3c',R(i*5.5))),{h:.1+R(i*2.2)*.08,bev:2});}
  E.mat(E.MATTE);for(let i=0;i<40;i++){const cx=x+R(i*4.1+9)*w,cy=y+R(i*8.3+2)*h;X().C.globalAlpha=.25;E.fill(E.Pe(cx,cy,14+R(i)*30,8+R(i*2)*14,R(i*3)*3),'#fffaf0',{noH:true,noM:true});X().C.globalAlpha=1;}};
const X=()=>E.X;
// кондитерский мешок с насадкой сверху: (x,y) — кончик, a — угол мешка, squeeze — сжатие
WD.nozzle=(x,y,a=0,sq=0)=>{E.save();E.tr(x,y);E.rot(a);E.depth(.32);
  E.obj(()=>{E.mat(E.MATTE);const bag=E.Ps([[-30,-70],[-120,-520],[-200,-1400],[200,-1400],[120,-520],[30,-70]],true);
    const g=X().C.createLinearGradient(-200,0,200,0);g.addColorStop(0,'#c9c2b6');g.addColorStop(.45,'#f4efe6');g.addColorStop(1,'#a8a196');
    E.fill(bag,g,{h:.95,bev:60,g:.5});
    for(let i=0;i<5;i++)E.line([[-60+i*30,-120],[-110+i*55,-900]],6,null,{noM:true,h:.03,base:.93});
    E.mat(E.METAL);const tip=E.P([[-34,-74],[34,-74],[16,0],[-16,0]]);const tg=X().C.createLinearGradient(-34,0,34,0);tg.addColorStop(0,'#6d7076');tg.addColorStop(.4,'#e8ebef');tg.addColorStop(1,'#55585e');
    E.fill(tip,tg,{h:1,bev:10,g:1});for(let i=0;i<6;i++)E.line([[-30+i*12,-70],[-13+i*5.2,-2]],2.5,'#4a4d52',{noM:true,h:.02,base:.98});
    E.mat(E.ICING);E.fill(E.Pe(0,2,13,9),'#fbf7ef',{h:1,bev:4,g:1});});
  E.restore();};
// лопатка сверху: (x,y) — центр полотна, a — угол, lift — подъём (0..1)
WD.spatula=(x,y,a=0,lift=0)=>{E.save();E.tr(x,y);E.rot(a);E.sc(1+lift*.08);E.depth(.45-lift*.1);
  E.obj(()=>{E.mat(E.MATTE);E.fill(E.Prr(-38,150,76,900,30),'#6b3d22',{h:.5+lift*.35,bev:20,g:.25});E.texture(E.Prr(-38,150,76,900,30),E.PAT.wood,'C','multiply',1,.6);
    E.mat(E.METAL);E.fill(E.Prr(-14,90,28,90,8),'#9a9da3',{h:.45+lift*.35,bev:6,g:1});
    const bl=E.Prr(-150,-170,300,280,[60,60,30,30]);const g=X().C.createLinearGradient(-150,-170,150,110);g.addColorStop(0,'#d6d9de');g.addColorStop(.5,'#9fa3aa');g.addColorStop(1,'#c4c7cc');
    E.fill(bl,g,{h:.2+lift*.38,bev:6,g:1});for(let i=0;i<4;i++)E.fill(E.Prr(-100+i*58,-120,22,170,11),'#7c8087',{h:.15+lift*.38,bev:4,g:1});});
  E.restore();};
// коробка сверху (открытая/закрытая крышка lid 0..1)
WD.box=(x,y,w,h,lid=0,bow=0)=>{E.depth(.5);E.mat(E.MATTE);
  E.obj(()=>{E.fill(E.Prr(x,y,w,h,10),'#9c1c22',{h:.3,bev:10,g:.15});E.fill(E.Prr(x+22,y+22,w-44,h-44,6),'#5c0e12',{h:.04,bev:4});
    const p=E.Prr(x+26,y+26,w-52,h-52,6);E.fill(p,'#efe4cc',{h:.06});E.texture(p,E.PAT.paper,'C','multiply',.7,1.4);E.texture(p,E.PAT.paper,'H','multiply',.5,1.4);});};
WD.lid=(x,y,w,h,k,bow)=>{if(k<=0)return;E.depth(.48);E.mat(E.MATTE);const yy=y-h*(1-k)*1.3;
  E.obj(()=>{E.fill(E.Prr(x-8,yy-8,w+16,h+16,12),'#b0222a',{h:.75,bev:14,g:.2});
    E.mat(E.CANDY);E.fill(E.Pr(x+w/2-26,yy-8,52,h+16),'#d8b14a',{h:.8,bev:4,g:.9});E.fill(E.Pr(x-8,yy+h/2-26,w+16,52),'#d8b14a',{h:.8,bev:4,g:.9});
    if(bow>0){const s=E.back(bow);E.xf(x+w/2,yy+h/2,0,s,()=>{E.fill(E.Ps([[0,0],[-120,-80],[-150,10],[-110,70]],true),'#e2bd55',{h:.9,bev:20,g:.9});
      E.fill(E.Ps([[0,0],[120,-80],[150,10],[110,70]],true),'#e2bd55',{h:.9,bev:20,g:.9});E.fill(E.Pe(0,0,34,30),'#c99a35',{h:.96,bev:10,g:1});});}});};
// ложка сверху: отражение — функция рисования внутри чаши
WD.spoon=(x,y,a,refl)=>{E.save();E.tr(x,y);E.rot(a);E.depth(.5);E.mat(E.METAL);
  E.obj(()=>{E.fill(E.Ps([[-22,140],[-14,700],[14,700],[22,140]],true),'#b9bcc2',{h:.2,bev:10,g:1});
    const bowl=E.Pe(0,0,120,170);const g=X().C.createRadialGradient(-30,-50,10,0,0,170);g.addColorStop(0,'#f2f4f6');g.addColorStop(.6,'#9ea2a9');g.addColorStop(1,'#d3d6da');
    E.fill(bowl,g,{h:.22,bev:30,g:1});
    if(refl){X().C.save();X().C.clip(bowl);refl();X().C.restore();}});
  E.restore();};
// ---------- спереди: ночной стол ----------
// окно (дальний план, без света): снег, гирлянда-боке, фейерверк fw (0..1+)
WD.window=(t,o={})=>{E.mat(E.UNLIT);E.depth(1);const c=X().C;
  const g=c.createLinearGradient(0,-400,0,1500);g.addColorStop(0,'#0b1430');g.addColorStop(.6,'#1a2a55');g.addColorStop(1,'#2a3560');
  E.fill(E.Pr(-600,-800,2400,2600),g,{noH:true});
  // дома напротив: окна-огоньки
  for(let i=0;i<9;i++){const bx=-300+i*220,bh=500+R(i*3)*400;E.fill(E.Pr(bx,1100-bh,200,bh+600),'#0c1226',{noH:true});
    for(let k=0;k<10;k++)if(R(i*11+k)>.55){E.mat(E.UNLIT,.25+R(k+i)*.3);E.fill(E.Pr(bx+30+(k%3)*55,1100-bh+40+Math.floor(k/3)*90,30,44),'#ffcf7a',{noH:true});E.mat(E.UNLIT);}}
  // фейерверк
  if(o.fw){for(const f of o.fw){const u=t-f.t;if(u<0||u>2.2)continue;const k=E.eo(u/1.2),fade=1-E.ss(.5,2.2,u);E.mat(E.UNLIT,.45*fade);
    for(let j=0;j<40;j++){const an=j/40*Math.PI*2+f.t,rr=f.r*k*(.85+R(j+f.t)*.3);const px=f.x+Math.cos(an)*rr,py=f.y+Math.sin(an)*rr+u*u*40;
      E.fill(E.Pe(px,py,6,6),f.c,{noH:true});const px2=f.x+Math.cos(an)*rr*.8,py2=f.y+Math.sin(an)*rr*.8+u*u*30;E.fill(E.Pe(px2,py2,4,4),f.c,{noH:true});}E.mat(E.UNLIT);
    E.mat(E.UNLIT,.02*fade);E.fill(E.Pe(f.x,f.y,f.r*1.2,f.r*1.2),`rgba(${E.hex(f.c).join(',')},${.18*(1-k*.6)*fade})`,{noH:true});E.mat(E.UNLIT);}}
  // снег
  for(let i=0;i<120;i++){const sp=40+R(i*2.3)*60;const yy=((R(i*5.1)*2400+t*sp)%2400)-500;const xx=-400+R(i*7.7)*1900+Math.sin(t*.8+i)*30;const r=3+R(i*3.3)*6;
    E.mat(E.UNLIT,.15);E.depth(R(i)>.6?.95:1);E.fill(E.Pe(xx,yy,r,r),'#dfe6ff',{noH:true});}
  E.mat(E.UNLIT);E.depth(1);
  // гирлянда по раме окна — огни-боке
  const cols=['#ffb347','#ff5a5a','#7cd67c','#6ab8ff','#ffd56b'];
  for(let i=0;i<22;i++){const u=i/21;const gx=-200+u*1500,gy=o.gy??(80+Math.sin(u*Math.PI)*160);const on=.6+.4*Math.sin(t*2.2+i*1.7);
    E.mat(E.UNLIT,on*.9);E.fill(E.Pe(gx,gy,9,9),cols[i%5],{noH:true});}
  E.mat(E.UNLIT);};
// стена с оконным проёмом: рама и подоконник (рельеф), окно внутри
WD.wall=(t,o={})=>{const wx=o.wx??90,wy=o.wy??-250,ww=o.ww??900,wh=o.wh??1300;
  E.save();const c=X().C;c.save();const hole=E.Pr(wx,wy,ww,wh);
  E.mat(E.MATTE);E.depth(.9);E.obj(()=>{const p=new Path2D();p.rect(-800,-1200,2700,3600);p.rect(wx,wy,ww,wh);
    c.save();c.fillStyle='#4b3a33';c.fill(p,'evenodd');c.restore();X().M.save();X().M.fillStyle=`rgb(${E.MATTE*255|0},0,${.9*255|0})`;X().M.fill(p,'evenodd');X().M.restore();
    X().Q.save();X().Q.fillStyle='rgb(10,0,0)';X().Q.fill(p,'evenodd');X().Q.restore();
    E.mat(E.MATTE);E.tube(E.Pr(wx,wy,ww,wh),46,'#e9e1d3',{h:.25,prof:'puff',g:.3});E.line([[wx+ww/2,wy],[wx+ww/2,wy+wh]],30,'#e9e1d3',{h:.22,prof:'puff',g:.3});
    E.line([[wx,wy+wh*.42],[wx+ww,wy+wh*.42]],28,'#e9e1d3',{h:.22,prof:'puff',g:.3});});
  c.restore();E.restore();
  E.save();X().C.save();E.clip(E.Pr(wx,wy,ww,wh));WD.window(t,o);X().C.restore();E.restore();};
// скатерть (плоскость стола, видна под углом): от y0 до низа
WD.cloth=(y0,o={})=>{E.depth(o.d??.55);E.mat(E.MATTE);const p=E.Pr(-800,y0,2700,2600);const g=X().C.createLinearGradient(0,y0,0,y0+900);
  g.addColorStop(0,'#5a1418');g.addColorStop(1,'#8a2026');E.fill(p,g,{h:.03});E.texture(p,E.PAT.linen,'C','multiply',.6,1.5);E.texture(p,E.PAT.linen,'H','multiply',.5,1.5);
  // вышитая кайма
  E.mat(E.ICING);for(let i=0;i<40;i++){const x=-700+i*70;E.line([[x,y0+60],[x+35,y0+40],[x+70,y0+60]],7,'#d9c79a',{h:.03,base:.03,g:.3,noM:false});}};
// свеча спереди: (x,y) — низ, h — высота; возвращает позицию пламени
WD.candle=(t,x,y,hh=420,o={})=>{E.depth(o.d??.55);const w=90;const top=y-hh;
  E.obj(()=>{E.mat(E.METAL);E.fill(E.Pe(x,y,120,34),'#b08a3c',{h:.25,bev:16,g:.9});E.fill(E.Pe(x,y-14,70,22),'#c9a04a',{h:.32,bev:10,g:1});
    E.mat(E.SKIN);const body=E.Prr(x-w/2,top,w,hh-10,[16,16,4,4]);const g=X().C.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#7a0f14');g.addColorStop(.35,'#c22a2c');g.addColorStop(1,'#6a0c10');
    E.fill(body,g,{h:.55,bev:30,g:.6});
    // потёки воска
    for(let i=0;i<4;i++){const dx=-34+i*22,l=40+R(i*4.4)*110;E.line([[x+dx,top+6],[x+dx+R(i)*4,top+l]],16,'#d23436',{h:.06,base:.55,g:.8});E.dot(x+dx+R(i)*4,top+l,10,'#d23436',{h:.08,base:.55,g:.8});}
    E.mat(E.MATTE);E.line([[x,top],[x+2,top-26]],5,'#1a1210',{h:.1,base:.55});});
  const fl=1+.08*Math.sin(t*13)+.05*Math.sin(t*29+1);const fx=x+Math.sin(t*3.1)*3,fy=top-30;
  E.mat(E.UNLIT,1);E.depth(o.d??.55);
  const c=X().C;const g2=c.createRadialGradient(fx,fy-20*fl,4,fx,fy-20*fl,70*fl);g2.addColorStop(0,'#fff6d8');g2.addColorStop(.35,'#ffc35a');g2.addColorStop(.7,'rgba(255,120,30,.4)');g2.addColorStop(1,'rgba(255,90,20,0)');
  E.fill(E.Ps([[fx,fy-95*fl],[fx+22,fy-30],[fx+16,fy+4],[fx,fy+10],[fx-16,fy+4],[fx-22,fy-30]],true),g2,{noH:true});
  E.mat(E.UNLIT,.6);E.fill(E.Pe(fx,fy-4,9,14),'#7aa4ff',{noH:true});E.mat(E.MATTE);
  // ореол
  c.save();c.globalCompositeOperation='lighter';const g3=c.createRadialGradient(fx,fy-30,0,fx,fy-30,300);g3.addColorStop(0,'rgba(255,170,80,.22)');g3.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g3;c.fillRect(fx-300,fy-330,600,600);c.restore();
  return[fx,fy-30,fl];};
// мандарин спереди
WD.mandarin=(x,y,r,o={})=>{E.depth(o.d??.55);E.mat(E.CERAM);E.obj(()=>{const p=E.Pe(x,y-r*.86,r,r*.86);const g=X().C.createRadialGradient(x-r*.35,y-r*1.2,r*.1,x,y-r*.8,r*1.1);
  g.addColorStop(0,'#ffb04a');g.addColorStop(.7,'#ee7a12');g.addColorStop(1,'#a8470a');E.fill(p,g,{h:.15,g:.35,dome:[x,y-r*.86,r*1.05,.45]});
  E.texture(p,E.PAT.pores,'H','multiply',1,.55);
  if(!o.noLeaf){E.mat(E.CANDY);E.fill(E.Ps([[x,y-r*1.7],[x+r*.5,y-r*2.05],[x+r*.9,y-r*1.95],[x+r*.45,y-r*1.7]],true),'#3d7a2c',{h:.62,bev:6,g:.7});
    E.mat(E.MATTE);E.fill(E.Pe(x,y-r*1.7,10,7),'#4a5a22',{h:.62,bev:3});}});};
// чашка спереди (3/4): (x,y) — низ блюдца; up=false — перевёрнута; tea — функция (рисует поверхность чая в эллипсе)
WD.cup=(t,x,y,o={})=>{const s=o.s||1;E.save();E.tr(x,y);E.sc(s);E.depth(o.d??.55);E.mat(E.CERAM);
  E.obj(()=>{const sau=E.Pe(0,0,250,56);E.fill(sau,'#f3efe8',{h:.14,bev:20,g:.9});E.tube(E.Pe(0,-4,250,56),10,'#c9a24a',{h:.03,base:.14,g:1});
    E.fill(E.Pe(0,-10,120,26),'#ddd6cc',{h:.16,bev:10,g:.9});
    if(o.up!==false){
      const body=E.Ps([[-150,-300],[-140,-150],[-100,-40],[0,-14],[100,-40],[140,-150],[150,-300]],false);const bp=new Path2D(body);bp.closePath();
      const g=X().C.createLinearGradient(-150,0,150,0);g.addColorStop(0,'#c9c3b9');g.addColorStop(.3,'#fbf8f3');g.addColorStop(1,'#bdb6ab');
      E.tube(E.Ps([[150,-250],[235,-235],[230,-130],[132,-110]]),30,'#efeae2',{h:.42,prof:'round',g:.9});
      E.fill(bp,g,{h:.4,bev:40,g:.9,dome:[-20,-160,190,.2]});
      // узор: красная полоса с белыми точками
      X().C.save();X().C.clip(bp);X().C.fillStyle='#a3202a';X().C.fillRect(-160,-230,320,34);X().C.fillStyle='#f6efe2';for(let i=0;i<9;i++){X().C.beginPath();X().C.arc(-130+i*33,-213,6,0,7);X().C.fill();}X().C.restore();
      E.tube(E.Pe(0,-300,150,34),12,'#c9a24a',{h:.06,base:.42,g:1});
      const teaP=E.Pe(0,-300,140,28);E.fill(teaP,'#4a2208',{h:.38,g:1});
      if(o.tea){X().C.save();X().C.clip(teaP);o.tea();X().C.restore();}
      if(o.steam){E.mat(E.UNLIT,.06);for(let i=0;i<3;i++){const ph=t*.6+i*.33;const u=ph%1;E.fill(E.Pe(Math.sin(t*1.3+i*2)*30+i*30-30,-340-u*260,30+u*40,40+u*60),`rgba(255,240,220,${.12*(1-u)})`,{noH:true,noM:true});}E.mat(E.CERAM);}
    }else{ // перевёрнутая
      const body=E.Ps([[-115,-24],[-128,-150],[-150,-290],[0,-306],[150,-290],[128,-150],[115,-24]],true);
      const g=X().C.createLinearGradient(-150,0,150,0);g.addColorStop(0,'#c9c3b9');g.addColorStop(.3,'#fbf8f3');g.addColorStop(1,'#bdb6ab');
      E.tube(E.Ps([[-130,-80],[-215,-100],[-220,-200],[-140,-210]]),30,'#efeae2',{h:.42,g:.9});
      E.fill(body,g,{h:.4,bev:40,g:.9,dome:[-20,-160,190,.2]});
      X().C.save();X().C.clip(body);X().C.fillStyle='#a3202a';X().C.fillRect(-160,-110,320,34);X().C.restore();}
  });E.restore();};
// рука бабушки, держащая чашку спереди (поверх чашки): (x,y) — центр чашки на уровне пальцев; tr — дрожь (смещение)
WD.handCup=(t,x,y,o={})=>{const s=o.s||1;E.save();E.tr(x,y);E.sc(s);E.depth(o.d??.53);
  E.obj(()=>{// рукав-вязка и запястье справа
    E.mat(E.SKIN);const sk='#cf9a7c',skD='#a86a50';
    E.tube(E.Pl([[300,-40],[520,40],[900,180]]),170,sk,{h:.62,prof:'puff',g:.25,rim:skD,rimK:.85});
    // часы
    E.mat(E.MATTE);E.tube(E.Pl([[470,-60],[450,110]]),70,'#4a2a1a',{h:.66,prof:'puff',g:.3});
    E.mat(E.METAL);E.fill(E.Pe(462,20,52,52),'#c8a24c',{h:.74,bev:10,g:1});E.mat(E.CERAM);E.fill(E.Pe(462,20,42,42),'#f6f0e2',{h:.74,g:.9});
    const hm=o.time||[11,57];E.mat(E.MATTE);
    for(let i=0;i<12;i++){const a=i*30*D;E.line([[462+Math.sin(a)*34,20-Math.cos(a)*34],[462+Math.sin(a)*38,20-Math.cos(a)*38]],3,'#2a2420',{h:.02,base:.74,noM:true});}
    const ah=(hm[0]%12+hm[1]/60)*30*D,am=hm[1]*6*D;E.line([[462,20],[462+Math.sin(ah)*20,20-Math.cos(ah)*20]],5,'#1a1410',{h:.03,base:.75,noM:true});
    E.line([[462,20],[462+Math.sin(am)*32,20-Math.cos(am)*32]],3.5,'#1a1410',{h:.03,base:.75,noM:true});
    E.mat(E.MATTE);const sl=E.Ps([[560,-160],[980,-60],[1000,420],[600,300]],true);E.fill(sl,'#7a5a7e',{h:.78,bev:30,g:.1});E.texture(sl,E.PAT.knit,'H','multiply',1,1.4);E.texture(sl,E.PAT.knit,'C','multiply',.8,1.4);
    E.tube(E.Pl([[575,-150],[610,300]]),70,'#8a6a8e',{h:.82,prof:'puff',g:.1});
    // ладонь и пальцы, обхватившие чашку
    E.mat(E.SKIN);
    E.fill(E.Ps([[120,-150],[300,-120],[330,60],[160,120],[90,0]],true),sk,{h:.6,bev:40,g:.2});
    const fing=[[-40,-120,30],[-60,-50,31],[-55,20,30],[-30,82,27]];
    fing.forEach(([fx,fy,r],i)=>{E.tube(E.Ps([[200,fy-30+i*12],[80,fy],[fx,fy+4],[fx-30,fy+16]]),r*2,sk,{h:.66,prof:'puff',g:.25,rim:skD,rimK:.82});
      E.fill(E.Pe(fx-28,fy+14,13,10,.3),'#f0d2c4',{h:.7,bev:3,g:.8});
      E.line([[fx+40,fy-r*.7],[fx+46,fy+r*.6]],3,skD,{h:.0,base:.6,noM:true});E.line([[fx+100,fy-r*.75],[fx+106,fy+r*.65]],3,skD,{h:.0,base:.6,noM:true});});
    E.tube(E.Ps([[220,-160],[120,-210],[30,-215]]),58,sk,{h:.7,prof:'puff',g:.25,rim:skD,rimK:.82});E.fill(E.Pe(32,-214,14,11),'#f0d2c4',{h:.74,bev:3,g:.8});
    // морщины и вены
    for(let i=0;i<5;i++)E.curve([[200+i*25,-100],[215+i*24,0],[205+i*26,90]],2.5,skD,{h:0,base:.6,noM:true});
  });E.restore();};
// рука открытой ладонью (снизу справа), fingers — сгиб 0..1
WD.palm=(t,x,y,a,o={})=>{const s=o.s||1;E.save();E.tr(x,y);E.rot(a);E.sc(s);E.depth(o.d??.5);const sk='#cf9a7c',skD='#a86a50';const cu=o.curl||0;
  E.obj(()=>{E.mat(E.MATTE);const sl=E.Ps([[200,240],[700,200],[760,700],[220,700]],true);E.fill(sl,'#7a5a7e',{h:.7,bev:30,g:.1});E.texture(sl,E.PAT.knit,'H','multiply',1,1.4);E.texture(sl,E.PAT.knit,'C','multiply',.8,1.4);
    E.mat(E.SKIN);E.tube(E.Pl([[0,120],[240,330]]),220,sk,{h:.55,prof:'puff',g:.2,rim:skD,rimK:.86});
    E.fill(E.Ps([[-200,-20],[120,-60],[160,140],[-60,200],[-230,120]],true),sk,{h:.55,bev:50,g:.2,dome:[-40,60,200,.06]});
    [[-210,-10],[-140,-48],[-60,-64],[30,-60]].forEach(([fx,fy],i)=>{const L=150-i*8,an=-Math.PI/2-.5+i*.3;const c1=an-cu*1.2;
      const p1=[fx+Math.cos(c1)*L*.5,fy+Math.sin(c1)*L*.5];const p2=[p1[0]+Math.cos(c1-cu*.9)*L*.5,p1[1]+Math.sin(c1-cu*.9)*L*.5];
      E.tube(E.Ps([[fx,fy],p1,p2]),56-i*3,sk,{h:.6,prof:'puff',g:.25,rim:skD,rimK:.84});});
    E.tube(E.Ps([[140,60],[230,-40],[250,-150]]),62,sk,{h:.6,prof:'puff',g:.25,rim:skD,rimK:.84});
    E.curve([[-180,60],[-60,40],[60,90]],3,skD,{h:0,base:.55,noM:true});E.curve([[-160,120],[-40,140]],3,skD,{h:0,base:.55,noM:true});});
  E.restore();};
// ---------- отражение лица в чае (сверху, в чашке) ----------
// рисует в C; k — улыбка 0..1, ripple — амплитуда ряби, t — время
WD.face=(c,k,blink)=>{c.save();
  // волосы
  const hg=c.createRadialGradient(0,-40,40,0,-20,330);hg.addColorStop(0,'#d8d4cf');hg.addColorStop(1,'#8d8a87');c.fillStyle=hg;c.beginPath();c.ellipse(0,-30,300,330,0,0,7);c.fill();
  c.fillStyle='#e8e3dd';c.beginPath();c.ellipse(0,-300,110,80,0,0,7);c.fill();
  // лицо
  const fg=c.createRadialGradient(-40,-40,30,0,20,260);fg.addColorStop(0,'#f2c9b0');fg.addColorStop(.7,'#d9a184');fg.addColorStop(1,'#a8705a');c.fillStyle=fg;c.beginPath();c.ellipse(0,30,215,265,0,0,7);c.fill();
  c.strokeStyle='rgba(120,70,50,.45)';c.lineWidth=4;c.lineCap='round';
  // морщины лба и у глаз
  for(let i=0;i<3;i++){c.beginPath();c.moveTo(-110,-120-i*28);c.quadraticCurveTo(0,-135-i*30,110,-120-i*28);c.stroke();}
  for(const sd of[-1,1]){for(let i=0;i<3;i++){c.beginPath();c.moveTo(sd*150,-20+i*14);c.lineTo(sd*185,-34+i*22);c.stroke();}}
  // глаза — прищур улыбки
  c.strokeStyle='#3a2018';c.lineWidth=7;for(const sd of[-1,1]){c.beginPath();const ey=-25,ex=sd*80;const op=(1-blink)*(10-k*6);c.ellipse(ex,ey,34,Math.max(2,op),0,Math.PI*1.05,Math.PI*1.95);c.stroke();
    c.beginPath();c.moveTo(ex-36,ey+4);c.quadraticCurveTo(ex,ey+16+k*6,ex+36,ey+4);c.stroke();}
  // брови
  c.strokeStyle='#b9b2aa';c.lineWidth=10;for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*40,-75);c.quadraticCurveTo(sd*85,-92-k*6,sd*125,-72);c.stroke();}
  // очки
  c.strokeStyle='#c9a24a';c.lineWidth=7;for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*82,-22,62,54,0,0,7);c.stroke();}c.beginPath();c.moveTo(-20,-28);c.quadraticCurveTo(0,-40,20,-28);c.stroke();
  c.fillStyle='rgba(255,240,220,.18)';for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*82-18,-40,22,12,-.5,0,7);c.fill();}
  // нос
  c.strokeStyle='rgba(120,60,40,.6)';c.lineWidth=6;c.beginPath();c.moveTo(-8,10);c.quadraticCurveTo(-26,70,-4,84);c.quadraticCurveTo(14,92,28,80);c.stroke();
  // кривая улыбка (как у пряника: левый угол вверх, правый вниз)
  const sm=CH.smile({mood:.8*k+.1,crooked:true,droop:1});c.strokeStyle='#8a3a30';c.lineWidth=9;c.beginPath();
  sm.forEach(([a,b],i)=>{const X2=a*3.1,Y2=150+(b-20)*2.6;i?c.lineTo(X2,Y2):c.moveTo(X2,Y2);});c.stroke();
  c.strokeStyle='rgba(120,60,40,.45)';c.lineWidth=5;c.beginPath();c.moveTo(-120,110);c.quadraticCurveTo(-130,150,-112,180);c.stroke();c.beginPath();c.moveTo(118,130);c.quadraticCurveTo(130,170,112,205);c.stroke();
  // щёки
  c.fillStyle='rgba(230,120,110,.25)';for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*120,70,50,34,0,0,7);c.fill();}
  c.restore();};
const FC=document.createElement('canvas');FC.width=FC.height=720;const fcx=FC.getContext('2d');const RC=document.createElement('canvas');RC.width=RC.height=720;const rcx=RC.getContext('2d');
WD.teaReflection=(t,cx,cy,R0,o)=>{// o: k улыбка, rip амплитуда ряби, vis видимость лица, blink
  fcx.setTransform(1,0,0,1,0,0);fcx.clearRect(0,0,720,720);fcx.translate(360,360);fcx.scale(.92,.92);WD.face(fcx,o.k,o.blink||0);
  const c=X().C;E.mat(E.UNLIT);E.depth(.5);
  const tg=c.createRadialGradient(cx,cy,0,cx,cy,R0);tg.addColorStop(0,'#5a2a0c');tg.addColorStop(1,'#2a1204');E.fill(E.Pe(cx,cy,R0,R0),tg,{h:.3,g:1});
  rcx.setTransform(1,0,0,1,0,0);rcx.clearRect(0,0,720,720);
  const N=30;for(let i=N;i>=1;i--){const r=330*i/N;const sc=1+o.rip*Math.sin(r*.12-t*9)*.035;rcx.save();rcx.beginPath();rcx.arc(360,360,r,0,7);rcx.clip();
    rcx.translate(360,360);rcx.scale(sc,sc);rcx.drawImage(FC,-360,-360);rcx.restore();}
  c.save();c.beginPath();c.ellipse(cx,cy,R0,R0,0,0,7);c.clip();c.globalAlpha=o.vis*.62;c.globalCompositeOperation='screen';c.filter=`blur(${(1+o.rip*3).toFixed(1)}px) sepia(.35)`;
  c.drawImage(RC,cx-R0*360/330,cy-R0*360/330,R0*720/330,R0*720/330);c.restore();c.globalAlpha=1;
  // кольца ряби (рельеф) и блик свечи
  E.mat(E.CERAM);for(let i=0;i<6;i++){const r=((t*90+i*R0/6)%R0);const a=o.rip*(1-r/R0);if(a>.02)E.tube(E.Pe(cx,cy,r,r),14,null,{noM:true,h:.04*a,base:.3,g:1});}
  E.mat(E.UNLIT,1.3);E.fill(E.Pe(cx-R0*.45+Math.sin(t*9)*o.rip*6,cy-R0*.5,16,9,-.5),'#fff0c8',{noH:true});E.mat(E.CERAM);};
window.WD=WD;})();
