// C — персонажи гравюры: фигура в кимоно/хакама из частей (IK рук и ног, рукава с запаздыванием, меч), голова в стиле укиё-э.
(function(){
const C={};
const cl=E.cl,lerp=E.lerp;
const ad=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k];
const mid=(a,b,t=.5)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
function ik(s,t,a,b,bend){let dx=t[0]-s[0],dy=t[1]-s[1];let d=Math.hypot(dx,dy)||1e-3;const md=(a+b)*.998;if(d>md){dx*=md/d;dy*=md/d;d=md;}
  const ang=Math.atan2(dy,dx);const c=cl((a*a+d*d-b*b)/(2*a*d),-1,1);const A=ang+bend*Math.acos(c);return[[s[0]+Math.cos(A)*a,s[1]+Math.sin(A)*a],[s[0]+dx,s[1]+dy]];}
C.ik=ik;
// моргание: раз в ~3 с, 0.14 с
C.blink=(t,seed=0)=>{const P=2.7+E.rnd(seed)*1.6;const u=((t+seed*1.3)%P)/P*P;return u<.14?Math.sin(u/.14*Math.PI):0;};
// палитры
C.COL={
  boy:{kim:{MIDORI:.85},kim2:{KI:.5},hak:{NEZU:.7,AI:.25},pat:'dots'},
  teen:{kim:{AI:.55},kim2:{KI:.5},hak:{NEZU:.8,AI:.2},pat:'cross'},
  man:{kim:{AI:1},kim2:{NEZU:.6},hak:{NEZU:.9,KEY:.0,AI:.45},pat:'stripe'},
  old:{kim:{KI:.55,NEZU:.75,BENI:.12},kim2:{NEZU:.4},hak:{KI:.5,NEZU:.85,BENI:.12},pat:'none'},
  father:{kim:{NEZU:.8},kim2:{KI:.4},hak:{NEZU:.9},pat:'none'},
  woman:{kim:{BENI:.55,MOMO:.6},kim2:{KI:.8},hak:{BENI:.55,MOMO:.6},pat:'flower'},
  girl:{kim:{MOMO:.9,KI:.2},kim2:{BENI:.6},hak:{MOMO:.9,KI:.2},pat:'flower'}};
// ---------- голова ----------
// c — центр черепа, s — высота головы, f — куда смотрит (±1). o: blink, look[-1..1], brow(-1 гнев..1 удивление), mouth(0..1), kuma(0..1), cross, tear, kind, tilt
C.head=(c,s,f,o={})=>{const k=o.kind||'man';const lw=Math.max(1.2,s*.018);const old=k=='old',boy=k=='boy'||k=='girl',girl=k=='girl'||k=='woman';
  const tilt=o.tilt||0;const R=(x,y)=>{const cs=Math.cos(tilt),sn=Math.sin(tilt);return[c[0]+(x*cs-y*sn)*f,c[1]+(x*sn*f*f+y*cs)];};
  const Rf=(x,y)=>{const cs=Math.cos(tilt*f),sn=Math.sin(tilt*f);return[c[0]+x*f*cs-y*sn,c[1]+x*f*sn+y*cs];};
  const P=(pts)=>pts.map(q=>Rf(q[0]*s,q[1]*s));
  const kd=1;const white=(o.kuma||0)>0?cl(o.kuma*1.6):0;
  const skin={HADA:lerp(boy?.95:.85,0,white),GOFUN:white*.9};if(old)skin.NEZU=.12;
  // волосы сзади (масса)
  const hairInk=old?{GOFUN:.9,NEZU:.25}:{KEY:1};
  const back=E.smooth(P([[-.04,-.47],[-.26,-.42],[-.38,-.22],[-.40,.02],[-.32,.20],[-.16,.26],[-.12,.02],[.02,-.30]]));
  E.fill(back,hairInk);if(old)E.stroke(back,0,lw*.8,.7);
  // ухо
  // лицо
  const face=E.smooth(P([[-.16,-.38],[.10,-.44],[.30,-.30],[.38,-.10],[.43,.08],[.37,.16],[.36,.24],[.30,.34],[.16,.44],[.0,.42],[-.16,.30],[-.24,.06]]));
  E.fill(face,skin);
  E.line(P([[.30,-.30],[.38,-.12],[.43,.07],[.37,.15]]),lw*.6,lw,.3,kd); // лоб-нос (профильная линия)
  E.line(P([[.36,.24],[.30,.34],[.16,.44],[.02,.42]]),lw,lw*.6,.2,kd); // подбородок
  const ear=E.smooth(P([[-.12,-.02],[-.04,-.06],[-.02,.06],[-.06,.16],[-.13,.12]]));E.fill(ear,skin);E.stroke(ear,0,lw*.8);
  // причёска
  if(boy){ // чёлка маэгами + пучок
    E.fill(E.smooth(P([[-.36,-.30],[-.10,-.52],[.18,-.48],[.34,-.30],[.30,-.20],[.12,-.28],[-.06,-.24],[-.20,-.10]])),girl?{KEY:1}:{KEY:1});
    if(girl){E.fill(E.ell(...Rf(-.10*s,-.58*s),s*.17,s*.12),{KEY:1});E.fill(E.ell(...Rf(-.05*s,-.66*s),s*.05,s*.05),{BENI:.9});}
    else E.fill(E.smooth(P([[-.18,-.56],[-.02,-.66],[.08,-.60],[-.04,-.52]])),{KEY:1});
  }else{
    // выбритая макушка сакаяки — сизая
    const pate=E.smooth(P([[-.20,-.40],[.0,-.52],[.24,-.44],[.30,-.30],[.12,-.33],[-.12,-.28]]));E.fill(pate,old?{HADA:.6,NEZU:.2}:{AI:.38,NEZU:.25});E.stroke(pate,0,lw*.6,.7);
    // виски
    E.fill(E.smooth(P([[-.32,-.36],[-.14,-.30],[-.04,-.14],[-.08,.04],[-.22,.10],[-.38,-.04]])),hairInk);
    // пучок тёнмагэ
    const tk=E.smooth(P([[-.26,-.42],[-.10,-.50],[.10,-.54],[.22,-.56],[.24,-.50],[.06,-.46],[-.14,-.38]]));E.fill(tk,hairInk);if(old)E.stroke(tk,0,lw*.7,.7);
  }
  if(old){ // морщины, борода
    E.line(P([[.12,-.20],[.22,-.22],[.30,-.20]]),lw*.4,lw*.4,0,.8);E.line(P([[.10,-.14],[.24,-.16]]),lw*.3,lw*.3,0,.6);
    E.line(P([[.22,.10],[.16,.22],[.20,.30]]),lw*.4,lw*.2,0,.7);
    const bd=E.smooth(P([[.04,.30],[.30,.30],[.34,.40],[.24,.62],[.14,.70],[.10,.52],[.0,.42]]));E.fill(bd,{GOFUN:.95});E.stroke(bd,0,lw*.6,.6);
    for(let i=0;i<4;i++)E.line(P([[.10+i*.05,.38],[.12+i*.04,.55+i*.02]]),lw*.3,lw*.15,0,.5);
  }
  if(o.stub){const st=E.smooth(P([[.06,.30],[.32,.28],[.30,.36],[.16,.44],[.0,.40]]));E.fill(st,{NEZU:.35*o.stub},false);}
  // кумадори: красные полосы от глаз вверх (рисуются сами, kuma 0..1)
  const ku=o.kuma||0;
  if(ku>0){const L=(pts,a,b,w)=>{const u=cl((ku-a)/(b-a));if(u<=0)return;const n=pts.length;const q=[];for(let i=0;i<n;i++){const tt=i/(n-1);if(tt<=u)q.push(pts[i]);}
      if(q.length>1)E.fill(E.brush(P(q),w*s*2.2,w*s*.5,.5),{BENI:1,KEY:.08},false);};
    const arc=(x0,y0,x1,y1,bx,by)=>{const r=[];for(let i=0;i<=10;i++){const t=i/10;r.push([lerp(lerp(x0,bx,t),lerp(bx,x1,t),t),lerp(lerp(y0,by,t),lerp(by,y1,t),t)]);}return r;};
    L(arc(.18,-.06,.0,-.44,.14,-.28),0,.4,.04);L(arc(.27,-.07,.28,-.42,.33,-.26),.15,.55,.03);L(arc(.04,-.03,-.18,-.30,-.08,-.10),.3,.7,.03);
    L(arc(.06,.03,-.12,.16,-.02,.14),.45,.85,.03);L(arc(.31,.20,.22,.36,.31,.32),.6,1,.025);}
  // брови
  const br=o.brow||0;const bw=(old?.035:.06)*s;
  const by=-.17-br*.04;const bi=br<0?-br*.06:0;
  E.fill(E.brush(P([[.03,by+.025+bi],[.11,by-.015],[.20,by-.01+bi*.6]]),bw*(boy?.8:1),bw*.35,.4),old?{GOFUN:1}:{KEY:1},false);
  if(old)E.line(P([[.06,by+.02],[.22,by]]),lw*.4,lw*.3,0,.6);
  E.fill(E.brush(P([[.27,by+.02-bi*.6],[.33,by-.01+bi*.2]]),bw*.7,bw*.3,.2),old?{GOFUN:1}:{KEY:1},false);
  // глаза: ближний (x .14) и дальний (.31, уже)
  const bl=cl(o.blink||0);const lk=cl(o.look||0,-1,1);const cr=o.cross||0;const sq=o.squint||0;
  const eye=(ex,ew,far)=>{const ey=-.05;const op=(old?.30:boy?.8:.55)*(1-bl)*(1-sq*.6)*(o.wide?1.6:1);
    const top=[[ex-ew,ey+.006],[ex-ew*.3,ey-.045*op-.008],[ex+ew*.5,ey-.03*op-.006],[ex+ew*1.08,ey-.012]],bot=[[ex+ew*.95,ey],[ex+ew*.2,ey+.03*op+.004],[ex-ew*.8,ey+.012]];
    if(op>.05){const wp=E.smooth(P([...top,...bot]));E.fill(wp,{GOFUN:.95});
      E.clipped(wp,()=>{const px=ex+ew*.2*lk+(far?-1:1)*cr*ew*.5;E.fill(E.ell(...Rf(px*s,(ey-.004)*s),ew*.36*s,ew*.40*s),{KEY:1},false);
        E.fill(E.ell(...Rf((px+.012)*s,(ey-.016)*s),ew*.09*s,ew*.09*s),{GOFUN:1},true);});}
    E.fill(E.brush(P(top),lw*(far?1.2:1.6),lw*(far?1.6:2.6),.5),{KEY:1},false);
    if(op>.05)E.line(P(bot.slice(0,2)),lw*.7,lw*.3,0,.7);};  eye(.12,boy?.08:.085,false);eye(.31,.035,true);
  // нос (тень ноздри)
  E.line(P([[.36,.14],[.32,.16]]),lw*.7,lw*.4,0,.8);
  // рот
  const mo=cl(o.mouth||0);const my=.27;
  if(mo>.08){const m=E.smooth(P([[.12,my],[.20,my-.012],[.27,my],[.20,my+.06*mo+.01]]));E.fill(m,{BENI:.75,KEY:.45});E.stroke(m,0,lw*.6);}
  else{E.line(P([[.13,my],[.20,my+.004+(o.smile||0)*-.02],[.26,my-(o.smile||0)*.02]]),lw*.8,lw*.5,.3,1);
    if(!old)E.fill(E.ell(...Rf(.21*s,(my+.018)*s),.03*s,.01*s),{BENI:.6},false);}
  if(o.tear){const tp=Rf(.18*s,(-.0+o.tear*.25)*s);const td=E.smooth([[tp[0],tp[1]-s*.04],[tp[0]+s*.018,tp[1]+s*.01],[tp[0],tp[1]+s*.03],[tp[0]-s*.018,tp[1]+s*.01]]);E.fill(td,{GOFUN:1,AI:.25});E.stroke(td,0,lw*.5,.8);}
  E.stroke(face,0,lw*.55,.85);
  if(o.scar)E.line(P([[.20,.02],[.28,.12],[.33,.20]]),lw*.9,lw*.4,0,.9,BENI);
  if(o.kasa){const hp=E.smooth(P([[-.85,-.22],[-.2,-.62],[.05,-.78],[.3,-.62],[.95,-.20],[.05,-.34]]));E.fill(hp,{KI:.65,NEZU:.35,BENI:.08});E.stroke(hp,0,lw);
    for(let i=-3;i<=3;i++)E.line(P([[.05,-.76],[.05+i*.26,-.26-Math.abs(i)*.0]]),lw*.4,lw*.4,0,.6);}
};
// ---------- меч ----------
C.sword=(g,ang,h,o={})=>{const d=[Math.cos(ang),Math.sin(ang)],n=[-d[1],d[0]];const L=h*.40,sw=h*.012;
  const tip=ad(g,d,L);const sori=o.sori==null?1:o.sori;
  if(!o.hiltOnly){const blade=[];for(let i=0;i<=12;i++){const t=i/12;const w=sw*(1-t*.55);const bend=Math.sin(t*Math.PI*.9)*h*.012*sori;
    const p=ad(ad(g,d,h*.025+t*(L-h*.025)),n,bend);blade.push([p,w]);}
  const up=blade.map(([p,w])=>ad(p,n,w)),dn=blade.map(([p,w])=>ad(p,n,-w*.3)).reverse();
  const bp=E.smooth([...up,ad(tip,n,h*.004),...dn],true);E.fill(bp,{GOFUN:1,NEZU:.12});E.stroke(bp,0,Math.max(1,h*.0035));
  E.line(blade.slice(1,11).map(([p,w])=>ad(p,n,w*.3)),h*.002,h*.001,0,.5,NEZU);
  if(o.glint){const q=blade[Math.floor(cl(o.glint)*11)][0];E.fill(E.ell(q[0],q[1],h*.03,h*.004,ang),{GOFUN:1},true);}}
  // цуба и рукоять
  E.fill(E.ell(...ad(g,d,h*.02),h*.022,h*.008,ang+Math.PI/2),{KEY:1});
  const hb=ad(g,d,-h*.11);const hp=E.poly([ad(g,n,h*.008),ad(hb,n,h*.007),ad(hb,n,-h*.007),ad(g,n,-h*.008)]);E.fill(hp,{KEY:1,BENI:.0});
  for(let i=1;i<6;i++){const q=ad(g,d,-h*.11*i/6);E.fill(E.ell(q[0],q[1],h*.005,h*.004,ang),{GOFUN:.8},false);}
};
C.saya=(p,ang,h,hilt=true)=>{const d=[Math.cos(ang),Math.sin(ang)],n=[-d[1],d[0]];const e=ad(p,d,h*.43);
  const sp=E.poly([ad(p,n,h*.011),ad(e,n,h*.009),ad(e,n,-h*.009),ad(p,n,-h*.011)]);E.fill(sp,{KEY:1,BENI:.0});
  E.line([ad(p,d,h*.1),ad(p,d,h*.12)],h*.02,h*.02,0,1,KI);
  if(hilt)C.sword(ad(p,d,-h*.01),ang,h,{hiltOnly:1});};
// ---------- фигура ----------
C.fig=o=>{const k=o.kind||'man',f=o.f||1,h=o.h,col=o.col||C.COL[k]||C.COL.man;const boy=k=='boy'||k=='girl';
  const hs=h/(boy?5.4:7.0);const lw=Math.max(1.5,h*.0045);
  const x=o.x,y=o.y;const cr=o.crouch||0,kn=o.kneel||0,lean=o.lean||0;const br=Math.sin((o.t||0)*2.2+(o.seed||0))*h*.003;
  // ноги
  let hip,kneeF,kneeB,ftF,ftB;
  const leg=h*.235;
  if(kn>0){hip=[x-f*hs*.1,y-h*.20+br*0];kneeF=[x+f*hs*.9,y-hs*.12];ftF=[x-f*hs*.6,y-hs*.05];kneeB=[x+f*hs*.75,y-hs*.1];ftB=[x-f*hs*.75,y-hs*.05];}
  else{const st=o.stance==null?hs*.8:o.stance;let wF=0,wB=0,lF=0,lB=0;
    if(o.walk!=null){const ph=o.walk*Math.PI*2;wF=Math.sin(ph)*hs*.9;wB=-wF;lF=Math.max(0,Math.cos(ph))*hs*.25;lB=Math.max(0,-Math.cos(ph))*hs*.25;}
    ftF=[x+f*(st/2+wF),y-lF];ftB=[x-f*(st/2-wB),y-lB];
    const hy=y-leg*2*(1-cr*.32)-(o.walk!=null?Math.abs(Math.cos(o.walk*Math.PI*2))*hs*.06:0);hip=[x+f*(o.hipShift||0),hy+br*.3];
    [kneeF]=ik(hip,ftF,leg,leg,-f);[kneeB]=ik(hip,ftB,leg,leg,-f);}
  const Lt=h*.27;const neck=[hip[0]+f*Math.sin(lean)*Lt,hip[1]-Math.cos(lean)*Lt+br];
  const rot=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a)];
  const L=(vx,vy)=>{const r=rot([vx*f,vy],lean*f);return r;}; // локальные оси корпуса
  const shF=ad(neck,L(hs*.30,hs*.30)),shB=ad(neck,L(-hs*.22,hs*.26));
  const headC=ad(neck,rot([f*hs*.06,-hs*.60],(lean+(o.head&&o.head.nod||0))*f));
  // руки: цели кистей
  const ua=h*.15,la=h*.14;let hF=o.hF,hB=o.hB;const sw=o.sword||{};
  if(sw.mode=='hand'){const d=[Math.cos(sw.ang),Math.sin(sw.ang)];hF=sw.grip;hB=sw.one?(hB||ad(shB,[f*hs*.1,h*.27])):ad(sw.grip,d,-h*.075);}
  if(!hF)hF=ad(shF,[f*hs*.15,h*.27]);if(!hB)hB=ad(shB,[f*hs*.05,h*.27]);
  const [elF,wrF]=ik(shF,hF,ua,la,o.bendF||f);const [elB,wrB]=ik(shB,hB,ua,la,o.bendB||f);
  const lag=o.lag||[0,0];
  const sleeve=(sh,el,back)=>{const sd=h*(boy?.12:.15);const g=[lag[0]*h*.08,sd+lag[1]*h*.04];const pit=mid(sh,el,.15);
    const pts=[sh,mid(sh,el,.5),el,ad(el,[g[0]*1.2-f*hs*.05,g[1]*.85]),ad(mid(sh,el,.45),[g[0],g[1]]),ad(pit,[g[0]*.6,g[1]*.6])];
    const p=E.smooth(pts);E.fill(p,back?Object.fromEntries(Object.entries(col.kim).map(([a,b])=>[a,b*.82+.12])):col.kim);E.stroke(p,0,lw);};
  const fore=(el,wr,back)=>{const p=E.brush([el,mid(el,wr),wr],hs*.17,hs*.12,0);E.fill(p,{HADA:back?.95:.85});E.stroke(p,0,lw*.8);
    const d=[wr[0]-el[0],wr[1]-el[1]];const a=Math.atan2(d[1],d[0]);const hp=E.ell(...ad(wr,[Math.cos(a),Math.sin(a)],hs*.07),hs*.12,hs*.085,a);E.fill(hp,{HADA:.85});E.stroke(hp,0,lw*.8);};
  const sil=o.silOnly;
  // --- задний план фигуры ---
  if(!kn){fore(elB,wrB,true);sleeve(shB,elB,true);}
  // хакама / подол
  const hk=col.hak;
  let hak;
  if(kn>0){hak=E.smooth([ad(hip,[-f*hs*.55,-hs*.1]),ad(hip,[f*hs*.5,-hs*.15]),ad(kneeF,[f*hs*.35,-hs*.15]),ad(kneeF,[f*hs*.3,hs*.1]),[x,y],ad(ftF,[-f*hs*.5,0]),ad(ftF,[-f*hs*.6,-hs*.4])]);}
  else{const cro=mid(kneeF,kneeB,.5);cro[1]=Math.max(cro[1],hip[1]+h*.17);
    const wide=k=='old'||k=='woman'||k=='girl'?.2:.32;
    hak=E.smooth([ad(hip,[-f*hs*.42,-hs*.25]),ad(mid(hip,kneeB),[-f*hs*.42,0]),ad(ftB,[-f*hs*(.35+wide),-hs*.05]),ad(ftB,[f*hs*.3,-hs*.05]),
      ad(cro,[0,hs*.3]),ad(ftF,[-f*hs*.25,-hs*.05]),ad(ftF,[f*hs*(.35+wide),-hs*.05]),ad(mid(hip,kneeF),[f*hs*.5,0]),ad(hip,[f*hs*.45,-hs*.25])]);}
  // ступни
  const foot=(p)=>{const fp=E.ell(p[0]+f*hs*.15,p[1]-hs*.05,hs*.24,hs*.09);E.fill(fp,{GOFUN:.9});E.stroke(fp,0,lw*.7);};
  if(!kn){foot(ftB);foot(ftF);}
  E.fill(hak,hk);
  if(col.pat=='stripe'||k=='man'||k=='teen'||k=='boy')E.clipped(hak,()=>{for(let i=-6;i<=6;i++){const q=ad(hip,[i*hs*.16,0]);E.line([q,ad(q,[i*hs*.05,h*.55])],lw*.7,lw*.7,0,.55);}});
  E.stroke(hak,0,lw);
  if(!kn){E.line([ad(hip,[f*hs*.05,hs*.0]),ad(mid(kneeF,ftF,.6),[-f*hs*.1,0])],lw*.8,lw*.4,0,.9);E.line([ad(hip,[-f*hs*.1,hs*.1]),ad(mid(kneeB,ftB,.6),[f*hs*.05,0])],lw*.8,lw*.4,0,.9);}
  // корпус (кимоно)
  const torso=E.smooth([ad(neck,L(-hs*.05,-hs*.05)),ad(neck,L(hs*.42,hs*.28)),ad(hip,L(hs*.55,-hs*.4)),ad(hip,L(hs*.45,hs*.12)),ad(hip,L(-hs*.45,hs*.12)),ad(hip,L(-hs*.5,-hs*.4)),ad(neck,L(-hs*.38,hs*.3))]);
  E.fill(torso,col.kim);
  if(col.pat=='dots'||col.pat=='flower')E.clipped(torso,()=>{for(let i=0;i<14;i++){const q=ad(neck,L((E.rnd(i)-.5)*hs*.9,E.rnd(i+5)*h*.27));E.fill(E.ell(q[0],q[1],hs*.05,hs*.05),col.pat=='flower'?{GOFUN:.9}:{KI:.7},false);}});
  if(col.pat=='cross')E.clipped(torso,()=>{for(let i=-5;i<6;i++){const q=ad(neck,L(i*hs*.14,0));E.line([q,ad(q,L(0,h*.3))],lw*.5,lw*.5,0,.4);}});
  // мон (герб) на спине/груди у взрослого
  E.stroke(torso,0,lw);
  // ворот (V)
  E.line([ad(neck,L(-hs*.12,-hs*.02)),ad(neck,L(hs*.10,hs*.25)),ad(hip,L(hs*.28,-hs*.42))],hs*.09,hs*.07,0,1,0);
  E.line([ad(neck,L(-hs*.09,-hs*.0)),ad(neck,L(hs*.08,hs*.23)),ad(hip,L(hs*.25,-hs*.44))],hs*.05,hs*.04,0,.9,GOFUN);
  // пояс оби
  const ob=E.poly([ad(hip,L(-hs*.44,-hs*.35)),ad(hip,L(hs*.47,-hs*.35)),ad(hip,L(hs*.45,-hs*.08)),ad(hip,L(-hs*.42,-hs*.08))]);E.fill(ob,col.kim2);E.stroke(ob,0,lw*.8);
  // ножны на поясе
  if(sw.mode&&sw.mode!='none'&&!sw.noSaya){const sp=ad(hip,L(hs*.35,-hs*.35));C.saya(sp,Math.atan2(Math.sin(.55),-f*Math.cos(.55)),h,sw.mode=='hip');}
  // голова
  const hd=Object.assign({kind:k},o.head||{});if(hd.blink==null)hd.blink=C.blink(o.t||0,o.seed||0);hd.tilt=(hd.tilt||0)+lean*.3;
  C.head(headC,hs,f,hd);
  // передняя рука
  if(kn>0&&!o.hF){}
  sleeve(shF,elF,false);fore(elF,wrF,false);
  if(sw.mode=='hand')C.sword(sw.grip,sw.ang,h,{glint:sw.glint});
  if(sw.mode=='hand'&&!sw.one){/* верхняя кисть поверх рукояти */const d=[Math.cos(sw.ang),Math.sin(sw.ang)];const q=ad(sw.grip,d,-h*.02);const hp=E.ell(q[0],q[1],hs*.1,hs*.08,sw.ang);E.fill(hp,{HADA:.85});E.stroke(hp,0,lw*.8);}
  return {hip,neck,headC,shF,shB,wrF,wrB,hs};
};
window.C=C;
})();
