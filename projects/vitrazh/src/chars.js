// C — витражные персонажи: куски стекла в свинце + гризайль лица. Корень — таз (x,y). Углы: 0 — вниз, + — против часовой... (вперёд = +x при dir=1)
(function(){
const C={};const{P,Ps,Pe,piece,pline,pfill,pmatte,pgrad,ppath,lead}=E;
const sin=Math.sin,cos=Math.cos,PI=Math.PI;
// сужающийся сегмент вдоль +y длины L
C.seg=(L,w0,w1,r0=1,r1=1)=>{return Ps([[-w0/2,0],[-w0*.42,-w0*.3*r0],[0,-w0*.5*r0],[w0*.42,-w0*.3*r0],[w0/2,0],[w1/2,L],[w1*.4,L+w1*.35*r1],[0,L+w1*.5*r1],[-w1*.4,L+w1*.35*r1],[-w1/2,L]]);};
// FK: точка конца цепочки
const fk=(x,y,a,L)=>[x-sin(a)*L,y+cos(a)*L];
// ---------- ГОЛОВА (центр 0,0, радиус r) ----------
// o:{r, skin, hair, hairStyle:'boy'|'old'|'girl'|'youth'|'man', beard, look:[x,y], blink, brow, mouth, open, tilt, specs, age, tear, crack}
C.head=o=>{const r=o.r||55,sk=o.skin||'#e3a57e';const lk=o.look||[0,0];const bl=E.cl(o.blink||0);const br=o.brow||0;const md=o.mouth||'flat';const op=o.open||0;
  E.save();if(o.tilt)E.rot(o.tilt);
  // волосы сзади
  const hc=o.hair||'#6b3f1e';
  if(o.hairStyle=='girl'){piece(Ps([[-r*1.05,-r*.2],[-r*1.1,r*1.1],[-r*.6,r*1.35],[r*.6,r*1.35],[r*1.1,r*1.1],[r*1.05,-r*.2],[0,-r*1.2]]),hc,{tex:.15});}
  // шея
  piece(P([[-r*.32,r*.6],[r*.32,r*.6],[r*.38,r*1.25],[-r*.38,r*1.25]]),E.shade(sk,.86));
  // уши
  piece(Pe(-r*.92,r*.12,r*.2,r*.28),E.shade(sk,.93));piece(Pe(r*.92,r*.12,r*.2,r*.28),E.shade(sk,.93));
  // лицо
  const face=Ps([[0,-r*1.02],[r*.72,-r*.8],[r*.93,-r*.15],[r*.86,r*.5],[r*.5,r*.92],[0,r*1.04],[-r*.5,r*.92],[-r*.86,r*.5],[-r*.93,-r*.15],[-r*.72,-r*.8]]);
  piece(face,sk,{seed:.55});
  // матовка: объём лица
  E.pvig(face,-r*.1,-r*.15,r*.35,r*1.15,.42);pgrad(face,-r,0,r,0,.12,0);
  pmatte(-r*.5,r*.35,r*.3,o.blush||.06,face);pmatte(r*.5,r*.35,r*.3,o.blush||.06,face);
  // глаза
  const ey=-r*.06,ex=r*.37,ew=r*.27,eh=r*.17;
  for(const s of[-1,1]){const cx=s*ex;
    const lid=eh*(1-bl);
    if(bl<.9){const eye=Ps([[cx-ew,ey],[cx-ew*.3,ey-lid*1.1],[cx+ew*.4,ey-lid*1.05],[cx+ew,ey-eh*.1],[cx+ew*.3,ey+lid*.7],[cx-ew*.4,ey+lid*.7]]);
      // зрачок
      const px=cx+lk[0]*ew*.45,py=ey+lk[1]*eh*.5;E.save();E.clip(eye);pfill(Pe(px,py,eh*.85,eh*.95),.55);pfill(Pe(px,py,eh*.45,eh*.5),1);E.restore();
      ppath(eye,r*.05,1);pline([[cx-ew*1.05,ey+eh*.05],[cx-ew*.3,ey-lid*1.15],[cx+ew*.4,ey-lid*1.1],[cx+ew*1.05,ey-eh*.1]],r*.09,1,true);
      E.pscratch([[px+eh*.25,py-eh*.3],[px+eh*.3,py-eh*.32]],r*.07);}
    else pline([[cx-ew,ey+eh*.1],[cx,ey+eh*.35],[cx+ew,ey+eh*.1]],r*.05,.9,true);
    // веко-складка
    pline([[cx-ew*.9,ey-eh*1.5],[cx,ey-eh*1.85],[cx+ew*.9,ey-eh*1.45]],r*.03,.55,true);
    // бровь: br>0 злость (внутренний край вниз), br<0 грусть/удивление (внутренний вверх)
    const by=-r*.42-(o.raise||0)*r*.12;
    pline([[cx-s*ew*1.0,by+br*r*.12],[cx,by-r*.07],[cx+s*ew*1.05,by+r*.02-br*r*.04]],r*(o.bw||.1),1,true);
    if(o.age){pline([[cx+s*ew*1.1,ey-eh*.3],[cx+s*ew*1.45,ey-eh*.6]],r*.025,.5);pline([[cx+s*ew*1.1,ey+eh*.2],[cx+s*ew*1.45,ey+eh*.4]],r*.025,.5);
      pline([[cx-ew*.7,ey+eh*1.5],[cx,ey+eh*1.9],[cx+ew*.7,ey+eh*1.5]],r*.025,.45,true);}
    if(o.tear&&s==1){const ty=ey+eh*1.2+o.tear*r*.6;E.pscratch([[cx-ew*.2,ey+eh*1.1],[cx-ew*.25,ty]],r*.07);E.emitDot(cx-ew*.25,ty,r*.08,.6);}
  }
  // нос
  pline([[r*.08,-r*.18],[r*.12,r*.24],[r*.02,r*.36],[-r*.14,r*.3]],r*.06,.9,true);pline([[-r*.14,r*.3],[-r*.2,r*.22]],r*.05,.8);
  pmatte(-r*.12,r*.12,r*.2,.12,face);
  // рот
  const my=r*.58,mw=r*.3;
  if(md=='smile'){pline([[-mw,my-r*.05],[0,my+r*.1+op*r*.05],[mw,my-r*.05]],r*.06,.9,true);if(op>.1)pfill(Ps([[-mw*.8,my-r*.02],[0,my+r*.05],[mw*.8,my-r*.02],[0,my+r*.05+op*r*.22]]),.95);}
  else if(md=='laugh'){pfill(Ps([[-mw*1.05,my-r*.06],[0,my-r*.02],[mw*1.05,my-r*.06],[mw*.6,my+r*.14+op*r*.1],[0,my+r*.22+op*r*.14],[-mw*.6,my+r*.14+op*r*.1]]),.95);
    E.pscratch([[-mw*.6,my-r*.02],[mw*.6,my-r*.02]],r*.06);}
  else if(md=='o'){pfill(Pe(0,my+r*.04,r*.1+op*r*.03,r*.13+op*r*.08),.96);}
  else if(md=='frown'){pline([[-mw,my+r*.08],[0,my-r*.02],[mw,my+r*.08]],r*.06,.9,true);}
  else if(md=='sad'){pline([[-mw*.8,my+r*.06],[0,my+r*.01],[mw*.8,my+r*.06]],r*.05,.85,true);}
  else pline([[-mw*.8,my+r*.02],[0,my+r*.04],[mw*.8,my+r*.02]],r*.05,.85,true);
  // борода
  if(o.beard){const bc=o.beard;const bd=Ps([[-r*.9,r*.15],[-r*.75,r*.95],[-r*.35,r*1.55],[0,r*1.72],[r*.35,r*1.55],[r*.75,r*.95],[r*.9,r*.15],[r*.6,r*.62],[r*.25,r*.78],[0,r*.74],[-r*.25,r*.78],[-r*.6,r*.62]]);
    piece(bd,bc,{tex:.4});for(let i=0;i<9;i++){const x=(i-4)/4*r*.65;pline([[x,r*.85+Math.abs(x)*-.2],[x*1.1,r*1.15],[x*.9,r*1.45-Math.abs(x)*.3]],r*.022,.35,true);}
    // усы
    const mu=Ps([[-r*.55,r*.55],[-r*.2,r*.42],[0,r*.47],[r*.2,r*.42],[r*.55,r*.55],[r*.3,r*.62],[0,r*.56],[-r*.3,r*.62]]);piece(mu,E.shade(bc,.95),{tex:.4});
    if(md=='laugh'||md=='o'||op>.2){pfill(Pe(0,r*.66,r*.16,r*.07+op*r*.06),.95);}}
  // волосы спереди
  if(o.hairStyle=='boy'){piece(Ps([[-r*.98,-r*.05],[-r*1.0,-r*.65],[-r*.6,-r*1.08],[0,-r*1.2],[r*.62,-r*1.1],[r*1.0,-r*.62],[r*.98,-r*.1],[r*.7,-r*.62],[r*.35,-r*.55],[r*.05,-r*.72],[-r*.3,-r*.55],[-r*.68,-r*.6]]),hc,{tex:.1});
    for(let i=0;i<5;i++)pline([[-r*.6+i*r*.3,-r*1.0],[-r*.5+i*r*.3,-r*.7]],r*.03,.5);}
  else if(o.hairStyle=='youth'){piece(Ps([[-r*.98,-r*.05],[-r*1.02,-r*.7],[-r*.55,-r*1.12],[r*.2,-r*1.18],[r*.85,-r*.9],[r*1.0,-r*.2],[r*.75,-r*.6],[r*.1,-r*.68],[-r*.6,-r*.45]]),hc,{tex:.1});
    for(let i=0;i<5;i++)pline([[-r*.5+i*r*.32,-r*1.05],[-r*.2+i*r*.3,-r*.72]],r*.03,.5);}
  else if(o.hairStyle=='old'){piece(Ps([[-r*.97,r*.1],[-r*1.05,-r*.45],[-r*.8,-r*.75],[-r*.55,-r*.62],[-r*.85,-r*.15]]),hc,{tex:.4});piece(Ps([[r*.97,r*.1],[r*1.05,-r*.45],[r*.8,-r*.75],[r*.55,-r*.62],[r*.85,-r*.15]]),hc,{tex:.4});
    pmatte(0,-r*.9,r*.5,.08,face);pline([[-r*.4,-r*.62],[0,-r*.67],[r*.4,-r*.62]],r*.02,.4,true);}
  else if(o.hairStyle=='man'){piece(Ps([[-r*.97,r*.0],[-r*1.03,-r*.6],[-r*.6,-r*1.05],[r*.1,-r*1.15],[r*.75,-r*.98],[r*1.02,-r*.55],[r*.97,0],[r*.7,-r*.55],[0,-r*.7],[-r*.7,-r*.5]]),hc,{tex:.3});
    for(let i=0;i<5;i++)pline([[-r*.55+i*r*.28,-r*1.0],[-r*.4+i*r*.28,-r*.72]],r*.025,.45);}
  else if(o.hairStyle=='girl'){piece(Ps([[-r*1.0,0],[-r*1.02,-r*.7],[-r*.55,-r*1.12],[r*.55,-r*1.12],[r*1.02,-r*.7],[r*1.0,0],[r*.75,-r*.6],[r*.2,-r*.72],[0,-r*.55],[-r*.2,-r*.72],[-r*.75,-r*.6]]),hc,{tex:.1});
    piece(Pe(r*.72,-r*.85,r*.22,r*.16,-.4),'#d8344a');}
  // очки (свинцовые кольца)
  if(o.specs){for(const s of[-1,1]){const g=Pe(s*r*.36,-r*.08,r*.27,r*.22);lead(g,5);}lead((()=>{const p=new Path2D();p.moveTo(-r*.1,-r*.12);p.quadraticCurveTo(0,-r*.2,r*.1,-r*.12);return p;})(),4);}
  // трещина по лицу (горе) → позже свинец (золото)
  if(o.crack){const k=o.crack;const pts=[[-r*1.0,-r*.7],[-r*.55,-r*.35],[-r*.25,-r*.4],[r*.05,r*.05],[r*.35,r*.0],[r*.6,r*.45],[r*1.05,r*.6]];const n=Math.max(2,Math.ceil(pts.length*E.cl(k)));
    const q=pts.slice(0,n);if(o.heal){lead((()=>{const p=new Path2D();q.forEach((v,i)=>i?p.lineTo(v[0],v[1]):p.moveTo(v[0],v[1]));return p;})(),5+o.heal*3);
      E.save();const XT=E.X.T;XT.save();XT.globalCompositeOperation='lighter';XT.strokeStyle=`rgb(0,0,${Math.round(o.heal*150)})`;XT.lineWidth=3/E.scaleNow();XT.lineJoin='round';
      const p=new Path2D();q.forEach((v,i)=>i?p.lineTo(v[0],v[1]):p.moveTo(v[0],v[1]));XT.stroke(p);XT.restore();E.restore();}
    else{pline(q,r*.04,1);E.pscratch(q.map(v=>[v[0]+2,v[1]+2]),r*.02);}}
  E.restore();};
// ---------- КИСТЬ ----------
C.hand=(sk,s=1,grip=0)=>{ // кисть вдоль +y, большой палец к +x
  piece(Ps([[-13*s,-3*s],[13*s,-3*s],[16*s,16*s],[11*s,31*s],[-5*s,34*s],[-15*s,20*s]]),sk);
  piece(Ps([[10*s,2*s],[21*s,9*s],[22*s,20*s],[15*s,21*s],[11*s,12*s]]),E.shade(sk,.94));
  if(grip){pline([[-12*s,14*s],[9*s,12*s]],3*s,.7);pline([[-11*s,23*s],[7*s,22*s]],3*s,.7);}
  else{pline([[-6*s,19*s],[-5*s,31*s]],3*s,.65);pline([[1*s,20*s],[1*s,32*s]],3*s,.65);}};
// складка драпировки: широкий полупрозрачный мазок + тонкая линия
C.fold=(pts,w=5)=>{pline(pts,w*3.2,.22,true);pline(pts,w,.7,true);};
C.KIND={
  old:{r:50,leg:330,tor:285,sw:92,col:'#3d5590',col2:'#2b3d6c',apron:'#9a5e2c',skin:'#dc9f78',hair:'#cfcac0',beard:'#d6d1c6',hs:'old',specs:1,age:1,pant:'#5a4632',roll:1,tunic:.45},
  man:{r:50,leg:340,tor:285,sw:94,col:'#7a2f3a',col2:'#561e2a',apron:'#9a5e2c',skin:'#da9c74',hair:'#bdb8b0',beard:'#c9c4bb',hs:'man',age:1,pant:'#3f3a52',roll:1,tunic:.4},
  youth:{r:47,leg:335,tor:270,sw:86,col:'#2f6b4f',col2:'#1f4a37',apron:'#9a5e2c',skin:'#e0a27a',hair:'#7a4a22',hs:'youth',pant:'#4a4060',roll:1,tunic:.35},
  boy:{r:50,leg:185,tor:170,sw:56,col:'#c8642a',col2:'#93441b',skin:'#e6a982',hair:'#8a5326',hs:'boy',pant:'#33447a',tunic:.3},
  girl:{r:46,leg:160,tor:145,sw:46,col:'#7a3d9c',col2:'#55286e',skin:'#e8ad86',hair:'#3a2414',hs:'girl',pant:'#e8ad86',dress:1},
};
C.fig=o=>{const k=Object.assign({},C.KIND[o.kind],o.over||{});const s=o.s||1,dir=o.dir||1;const J={};
  E.save();E.tr(o.x,o.y);E.sc(s*dir,s);
  const lean=o.lean||0;const sk=k.skin;const r=k.r;
  const legL=o.legL||[.05,0],legR=o.legR||[-.05,0];const aL=o.armL||[.12,.15],aR=o.armR||[-.08,.15];
  const th=r*.66;const T=k.tor,sw=k.sw;
  // НОГИ
  const leg=(a,front)=>{const[h,kn]=a;const L1=k.leg*.5,L2=k.leg*.5;const c=E.shade(k.pant,front?1:.78);E.save();E.tr(front?th*.42:-th*.42,0);E.rot(-h);
    const thigh=C.seg(L1,th*1.0,th*.78);piece(thigh,c);pgrad(thigh,-th/2,0,th/2,0,.05,.3);E.tr(0,L1);E.rot(kn);
    const shin=C.seg(L2,th*.78,th*.6);piece(shin,c);pgrad(shin,-th/2,0,th/2,0,.05,.3);
    E.tr(0,L2);const sh=Ps([[-th*.4,-6],[th*.36,-8],[th*1.1,th*.14],[th*1.05,th*.46],[-th*.45,th*.46]]);piece(sh,'#3b2a1e',{tex:.3});pgrad(sh,0,-6,0,th*.46,0,.4);E.restore();};
  leg(legR,false);leg(legL,true);
  E.save();E.rot(-lean);
  // РУКА
  const arm=(a,front)=>{const[sh,el]=a;E.save();E.tr(front?sw*.78:-sw*.78,-T+r*.45);E.rot(-sh);
    const L1=T*.6,L2=T*.56;const c=front?k.col:k.col2;
    const up=C.seg(L1,r*.66,r*.54);piece(up,c);pgrad(up,-r*.33,0,r*.33,0,.32,.02);
    E.tr(0,L1);E.rot(-el);
    if(k.roll){const fa=C.seg(L2,r*.46,r*.38);piece(fa,E.shade(sk,front?1:.88));pgrad(fa,-r*.25,0,r*.25,0,.3,.02);
      const cuff=Ps([[-r*.36,-r*.12],[r*.36,-r*.12],[r*.34,r*.2],[-r*.34,r*.2]]);piece(cuff,E.shade(c,1.15));}
    else{const fa=C.seg(L2,r*.54,r*.46);piece(fa,c);pgrad(fa,-r*.25,0,r*.25,0,.3,.02);
      piece(Ps([[-r*.3,L2-r*.1],[r*.3,L2-r*.1],[r*.32,L2+r*.08],[-r*.32,L2+r*.08]]),E.shade(c,.8));}
    E.tr(0,L2+2);E.rot(o[front?'wristL':'wristR']||0);C.hand(sk,r/50*1.05,front?(o.gripL??1):(o.gripR??1));
    J[front?'hL':'hR']=E.X.G.getTransform();
    if(front&&o.hold)o.hold();if(!front&&o.holdB)o.holdB();
    E.restore();};
  arm(aR,false);
  // ТОРС
  const bot=k.dress?k.leg*.82:k.leg*k.tunic;const fl=k.dress?1.75:1.12;
  const torso=Ps([[-sw*.8,-T+r*.25],[-sw*.25,-T+r*.05],[sw*.25,-T+r*.05],[sw*.8,-T+r*.25],[sw*1.0,-T+r*.75],[sw*.86,-T*.35],[sw*.8,-T*.1],[sw*fl,bot],[sw*fl*.5,bot+8],[0,bot+3],[-sw*fl*.5,bot+8],[-sw*fl,bot],[-sw*.8,-T*.1],[-sw*.86,-T*.35],[-sw*1.0,-T+r*.75]]);
  piece(torso,k.col);
  pgrad(torso,-sw,0,sw*1.1,0,.34,.0);E.pvig(torso,-sw*.2,-T*.55,sw*.5,sw*1.9,.28);
  C.fold([[-sw*.35,-T*.75],[-sw*.4,-T*.4],[-sw*.55,bot-10]],4);C.fold([[sw*.25,-T*.6],[sw*.32,-T*.25],[sw*.5,bot-12]],4);C.fold([[-sw*.05,-T*.1],[0,bot-8]],3.5);
  // пояс
  if(!k.dress){const belt=P([[-sw*.84,-T*.16],[sw*.84,-T*.16],[sw*.84,-T*.04],[-sw*.84,-T*.04]]);piece(belt,'#4a2e18',{tex:.3});
    piece(P([[-r*.18,-T*.18],[r*.18,-T*.18],[r*.18,-T*.02],[-r*.18,-T*.02]]),'#c9a23a',{tex:.2});}
  else{piece(P([[-sw*.82,-T*.32],[sw*.82,-T*.32],[sw*.84,-T*.22],[-sw*.84,-T*.22]]),'#e7c25a',{tex:.2});}
  // фартук стекольщика
  if(k.apron&&!o.noApron){const ab=k.leg*(o.apronLen||.55);const ap=P([[-sw*.46,-T*.74],[sw*.46,-T*.74],[sw*.5,-T*.22],[sw*.86,-T*.12],[sw*.92,ab],[-sw*.92,ab],[-sw*.86,-T*.12],[-sw*.5,-T*.22]]);
    piece(ap,k.apron,{tex:.5});pgrad(ap,-sw,0,sw,0,.3,.05);E.pvig(ap,0,-T*.3,sw*.4,sw*2,.3);
    C.fold([[-sw*.4,-T*.05],[-sw*.55,ab-20]],4);C.fold([[sw*.35,0],[sw*.5,ab-20]],4);
    E.leadLine([[-sw*.44,-T*.74],[-r*.5,-T+r*.25]],7);E.leadLine([[sw*.44,-T*.74],[r*.5,-T+r*.25]],7);
    const pk=P([[-sw*.42,-T*.02],[sw*.42,-T*.02],[sw*.38,T*.17],[-sw*.38,T*.17]]);piece(pk,E.shade(k.apron,.78),{tex:.5});
    if(o.tools!==false){piece(P([[sw*.15,-T*.12],[sw*.24,-T*.12],[sw*.22,T*.05],[sw*.16,T*.05]]),'#9aa0a8');}}
  // ворот
  piece(Ps([[-r*.58,-T+r*.2],[0,-T+r*.85],[r*.58,-T+r*.2],[0,-T+r*.42]]),E.shade(k.col,.66));
  // голова
  E.save();E.tr(0,-T-r*.98+(o.headDy||0));E.rot(o.headRot||0);
  const hd=Object.assign({r,skin:sk,hair:k.hair,hairStyle:k.hs,beard:k.beard,specs:k.specs,age:k.age},o.head||{});
  C.head(hd);J.head=E.X.G.getTransform();E.restore();
  arm(aL,true);
  E.restore();E.restore();return J;};
// взять точку (lx,ly) в системе матрицы m → дизайн-координаты
C.pt=(m,lx=0,ly=0)=>[(m.a*lx+m.c*ly+m.e)/E.S,(m.b*lx+m.d*ly+m.f)/E.S];
// ходьба: фаза → ноги и руки
C.walk=(ph,amp=1)=>{const a=sin(ph)*.38*amp,b=sin(ph+PI)*.38*amp;const kn=x=>Math.max(0,-cos(x))*.55*amp;
  return{legL:[a,kn(ph)],legR:[b,kn(ph+PI)],armL:[-a*.8,-.25],armR:[-b*.8,-.25],bob:Math.abs(cos(ph))*-8*amp};};
window.C=C;})();
