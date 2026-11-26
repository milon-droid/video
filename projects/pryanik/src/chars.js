// Пряничный человечек: тело — единый пряник (капсулы рук/ног/тела/головы в одном пути), лицо и узоры — глазурь.
// o: x,y — точка между ступнями; s — масштаб; r — наклон (вокруг ступней или o.pivot); sq — сжатие (1 норм., <1 присел)
// arm: {l:[плечо°, локоть°], r:[...]} — углы от горизонтали вниз; leg: {l:[бедро°, колено°], r:[...]} — от вертикали наружу
// look:[x,y] -1..1; blink 0..1; brow: -1 грусть .. 1 удивление; mood: улыбка (1 широкая, 0 ровная, -1 грусть); open: рот «О» 0..1
// crooked: кривая улыбка героя; mouthP: доля выдавленной улыбки (для кадра рождения); eyes: 0..1 сколько глаз уже есть
(function(){
const D=Math.PI/180;
const CH={};
const DOUGH='#b8692c',RIM='#6e3a1c',ICE='#fbf7ef';
function cap(p,a,b,r){const dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||.01;const ux=dx/l,uy=dy/l;const nx=-uy,ny=ux;const an=Math.atan2(ny,nx);
  p.moveTo(a[0]+nx*r,a[1]+ny*r);p.lineTo(b[0]+nx*r,b[1]+ny*r);p.arc(b[0],b[1],r,an,an+Math.PI,true);p.lineTo(a[0]-nx*r,a[1]-ny*r);p.arc(a[0],a[1],r,an+Math.PI,an,true);p.closePath();}
function circ(p,x,y,r){p.moveTo(x+r,y);p.arc(x,y,r,0,Math.PI*2,true);p.closePath();}
// кинематика: точки суставов
CH.joints=o=>{const sq=o.sq??1,st=o.stretch??1;const arm=o.arm||{},leg=o.leg||{};
  const A=(side,def)=>{const v=arm[side]||def;const sgn=side=='l'?-1:1;const sh=[sgn*58,-238*sq];
    const a1=v[0]*D,a2=(v[0]+v[1])*D;const el=[sh[0]+sgn*Math.cos(a1)*66,sh[1]+Math.sin(a1)*66];const ha=[el[0]+sgn*Math.cos(a2)*60,el[1]+Math.sin(a2)*60];return[sh,el,ha];};
  const Lg=(side,def)=>{const v=leg[side]||def;const sgn=side=='l'?-1:1;const hp=[sgn*36,-122*sq];
    const a1=v[0]*D,a2=(v[0]+v[1])*D;const L1=62*Math.min(1,sq*1.1),L2=62*Math.min(1,sq*1.1);
    const kn=[hp[0]+sgn*Math.sin(a1)*L1,hp[1]+Math.cos(a1)*L1];const ft=[kn[0]+sgn*Math.sin(a2)*L2,kn[1]+Math.cos(a2)*L2];return[hp,kn,ft];};
  return{al:A('l',[28,8]),ar:A('r',[28,8]),ll:Lg('l',[14,0]),lr:Lg('r',[14,0]),head:[0,(-338+(o.headDy||0))*sq*st],neck:[0,-250*sq]};};
// улыбки (в координатах головы, центр головы 0,0)
CH.smile=(o)=>{const k=o.mood??.8,cr=o.crooked;
  if(cr){const dr=(o.droop??1);return[[-34,8-12*k],[-18,20+2*k],[0,25+4*k*.5],[16,26+6*dr],[30,30+12*dr]];}
  return[[-34,10-14*k],[-17,21+4*k],[0,25+6*k],[17,21+4*k],[34,10-14*k]];};
CH.draw=(o)=>{const J=CH.joints(o);const s=o.s||1;
  E.save();E.tr(o.x,o.y);if(o.r){const pv=o.pivot||[0,0];E.tr(pv[0]*s,pv[1]*s);E.rot(o.r);E.tr(-pv[0]*s,-pv[1]*s);}E.sc(s*(o.fx||1),s*(o.sy||1));
  const sh=o.shade??1;
  E.mat(E.DOUGH);E.depth(o.d??.5);
  E.obj(()=>{
    // тело — один путь
    const p=new Path2D();const[sl,el,hl]=J.al,[sr,er,hr]=J.ar;const[pl,kl,fl]=J.ll,[pr,kr,fr]=J.lr;
    cap(p,sl,el,29);cap(p,el,hl,27);cap(p,sr,er,29);cap(p,er,hr,27);
    cap(p,pl,kl,33);cap(p,kl,fl,32);cap(p,pr,kr,33);cap(p,kr,fr,32);
    cap(p,[0,J.neck[1]+6],[0,-118*(o.sq??1)],66);circ(p,J.head[0],J.head[1],78);circ(p,0,-128*(o.sq??1),62);
    const g=E.X.C.createLinearGradient(0,-420,0,0);g.addColorStop(0,E.rgb(E.shade(o.dough||DOUGH,1.06*sh)));g.addColorStop(1,E.rgb(E.shade(o.dough||DOUGH,.92*sh)));
    E.fill(p,g,{noH:true});
    const tb=(pts,r)=>E.tube(E.Pl(pts),r*2,null,{noM:true,h:.58,prof:'puff',steps:9,g:.05});
    tb([sl,el,hl],28);tb([sr,er,hr],28);tb([pl,kl,fl],32.5);tb([pr,kr,fr],32.5);tb([[0,J.neck[1]+6],[0,-118*(o.sq??1)]],66);
    E.dot(J.head[0],J.head[1],78,null,{noM:true,h:.58,prof:'puff',steps:9,g:.05});E.dot(0,-128*(o.sq??1),62,null,{noM:true,h:.58,prof:'puff',steps:9,g:.05});
    // запёкшийся край (цвет)
    E.X.C.save();E.X.C.clip(p);E.X.C.filter=`blur(${(7*E.scaleNow()).toFixed(1)}px)`;E.X.C.strokeStyle=E.rgb(E.shade(RIM,sh));E.X.C.lineWidth=22;E.X.C.stroke(p);E.X.C.restore();
    E.texture(p,E.PAT.pores,'H','multiply',1,1.3);E.texture(p,E.PAT.crumb,'C','multiply',.9,1.3);
    if(o.bite){} // запас
    // глазурь
    E.mat(E.ICING);
    const ice=o.ice||ICE,IH=.58,iw=9;
    const zig=(a,b,u)=>{const x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;const l=Math.hypot(b[0]-a[0],b[1]-a[1]);const nx=-(b[1]-a[1])/l,ny=(b[0]-a[0])/l,tx=(b[0]-a[0])/l,ty=(b[1]-a[1])/l;
      const pts=[];for(let i=0;i<=6;i++){const w=(i/6-.5)*50;const z=(i%2?7:-7);pts.push([x+nx*w+tx*z,y+ny*w+ty*z]);}return pts;};
    if(o.cuffs!==false){E.line(zig(el,hl,.62),iw,ice,{h:.09,base:IH,g:1});E.line(zig(er,hr,.62),iw,ice,{h:.09,base:IH,g:1});
      E.line(zig(kl,fl,.7),iw,ice,{h:.09,base:IH,g:1});E.line(zig(kr,fr,.7),iw,ice,{h:.09,base:IH,g:1});}
    // пуговицы-конфеты
    const bc=o.buttons||['#c4232d','#2c8a3f','#f2efe6'];
    bc.forEach((c,i)=>{const y=(-214+i*38)*(o.sq??1);E.mat(i==2?E.ICING:E.CANDY);E.fill(E.Pe(0,y,13,13),c,{h:IH+.05,bev:3,g:1,dome:[-3,y-3,14,.07]});});
    // лицо
    E.save();E.tr(J.head[0],J.head[1]);if(o.headR)E.rot(o.headR);
    const lk=o.look||[0,0],bl=E.cl(o.blink||0),ey=o.eyes??1;
    for(const sd of[-1,1]){if(ey<(sd<0?.5:1)&&ey<1){if(sd<0&&ey<.5)continue;if(sd>0)continue;}
      const ex=sd*27,eyy=-14;const ry=Math.max(1.5,13*(1-bl))*(o.eyeK||1),rx=13*(o.eyeK||1);
      E.mat(E.ICING);E.fill(E.Pe(ex,eyy,rx,ry),ice,{h:IH+.06,bev:2,g:1,dome:[ex-3,eyy-4,15,.06]});
      if(bl<.6){E.mat(E.CANDY);const pr=6.5*(o.pupK||1);E.fill(E.Pe(ex+lk[0]*5,eyy+lk[1]*5*(1-bl),pr,pr*(1-bl)),'#2a140a',{h:IH+.1,bev:1,g:1});}}
    // брови
    const br=o.brow||0;E.mat(E.ICING);
    for(const sd of[-1,1]){const bx=sd*27,by=-42-br*7;const tilt=(o.browT??0)*sd;
      E.curve([[bx-sd*-14,by+(br<0?-sd*0:0)+(-br*5)*0+tilt*-6+(br<0?6:0)*1],[bx,by-3],[bx+sd*14,by+tilt*6+(br<0?-4:2)]],7,ice,{h:.08,base:IH,g:1});}
    // рот
    E.mat(E.ICING);
    if((o.open||0)>.05){const op=o.open;E.fill(E.Pe(o.crooked?4:0,30,10+op*6,6+op*12),'#3a1a0a',{h:IH-.02,bev:2,g:.3,noM:false});
      E.tube(E.Pe(o.crooked?4:0,30,10+op*6,6+op*12),7,ice,{h:.08,base:IH,g:1});}
    else{const pts=CH.smile(o);const mp=o.mouthP??1;
      if(mp>0){let use=pts;if(mp<1){const n=pts.length;const f=mp*(n-1);const i=Math.floor(f);use=pts.slice(0,i+1);if(i<n-1){const u=f-i;use.push([pts[i][0]+(pts[i+1][0]-pts[i][0])*u,pts[i][1]+(pts[i+1][1]-pts[i][1])*u]);}}
        if(use.length>1)E.curve(use,10,ice,{h:.1,base:IH,g:1});
        if(o.crooked&&mp>=1){const dp=o.drip??1;E.fill(E.Pe(31,33+dp*5,6,6+dp*4),ice,{h:IH+.1,bev:2,g:1,dome:[30,36+dp*5,9,.04]});}
        if(o.smear){const sm=o.smear;E.fill(E.Pe(26+sm*10,24-sm*8,8+sm*10,5+sm*5,-.6),ice,{h:IH+.06,bev:4,g:.9});}
        // щёки — розовая глазурь
        }}
    if(o.cheeks!==false){E.mat(E.ICING);for(const sd of[-1,1])E.fill(E.Pe(sd*48,14,9,7),'#e8a0a0',{h:IH+.03,bev:3,g:.6});}
    E.restore();
  });
  E.restore();};
// ходьба: фаза по пройденному пути; возвращает позу
CH.walk=(dist,amp=1)=>{const ph=dist/150*Math.PI;const s=Math.sin(ph);
  return{leg:{l:[14+s*16*amp,Math.max(0,-s)*18*amp],r:[14-s*16*amp,Math.max(0,s)*18*amp]},arm:{l:[34-s*14*amp,10],r:[34+s*14*amp,10]},r:s*.06*amp,bob:Math.abs(Math.cos(ph))*8*amp};};
window.CH=CH;
})();
