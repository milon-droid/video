// E — движок «живой вышивки». Мир рисуется в холсты-данные, шейдер превращает их в нитки на ткани.
// C: цвет нити (RGB).  D: R=параметр (длина стежка / радиус нити / размытие), G=тип/8, B=высота нити (1 нить, 0 ткань).
// U: RG = локальные координаты узора (0..64 ед., ×4), B = семя куска. Узор едет вместе с объектом (CanvasPattern в его системе координат).
// GL: свечение (bloom).  O: интерфейс поверх (резкий, «цифровой»).  Дизайн 1080×1920, вывод 720×1280.
(function(){
const W=1080,H=1920,OW=720,OH=1280,S=OW/W;
const mk=()=>{const c=document.createElement('canvas');c.width=OW;c.height=OH;return c;};
const CV={C:mk(),D:mk(),U:mk(),GL:mk(),O:mk()};
const X={};for(const k in CV)X[k]=CV[k].getContext('2d');
const XS=[X.C,X.D,X.U,X.GL];
const E={SXM:1,W,H,S,CV,X,cam:{x:W/2,y:H/2,z:1,r:0}};
const T={fab:1,tat:2,sat:3,knot:4,strand:5,real:6,glow:7};E.T=T;
// ---------- служебное ----------
E.rnd=s=>{let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
E.cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
E.lerp=(a,b,t)=>a+(b-a)*t;
E.ss=(a,b,t)=>{t=E.cl((t-a)/(b-a));return t*t*(3-2*t);};
E.eio=t=>{t=E.cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
E.eo=t=>1-Math.pow(1-E.cl(t),3);
E.ei=t=>Math.pow(E.cl(t),3);
E.lin=t=>E.cl(t);
E.back=t=>{t=E.cl(t);const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
E.K=(t,ks)=>{if(t<=ks[0][0])return ks[0][1];for(let i=1;i<ks.length;i++){const[a,va]=ks[i-1],[b,vb,e]=ks[i];if(t<=b){const u=(t-a)/(b-a);const f=(e||E.eio)(u);
  if(Array.isArray(va))return va.map((x,j)=>x+(vb[j]-x)*f);return va+(vb-va)*f;}}return ks[ks.length-1][1];};
E.noise=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return E.lerp(E.rnd(i),E.rnd(i+1),u)*2-1;};
E.hex=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
E.mix=(a,b,t)=>{a=typeof a=='string'?E.hex(a):a;b=typeof b=='string'?E.hex(b):b;return a.map((x,i)=>x+(b[i]-x)*t);};
E.rgb=(c,a)=>{c=typeof c=='string'?E.hex(c):c;return a==null?`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`:`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;};
E.shade=(c,k)=>{c=typeof c=='string'?E.hex(c):c;return c.map(x=>E.cl(x*k,0,255));};
// ---------- узор координат ----------
const PAT=[];{for(let k=0;k<8;k++){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const im=g.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;im.data[i]=x;im.data[i+1]=y;im.data[i+2]=k*32+16;im.data[i+3]=255;}g.putImageData(im,0,0);
  PAT.push(X.U.createPattern(c,'repeat'));}}
const pat=(seed,deg,sx=1,ox=0,oy=0)=>{const p=PAT[((seed|0)%8+8)%8];const m=new DOMMatrix();if(ox||oy)m.translateSelf(ox,oy);if(deg)m.rotateSelf(deg);m.scaleSelf(.5*sx*E.SXM,.5*sx*E.SXM);p.setTransform(m);return p;};
// ---------- трансформы ----------
E.save=()=>XS.forEach(x=>x.save());E.restore=()=>XS.forEach(x=>x.restore());
E.tr=(x,y)=>XS.forEach(c=>c.translate(x,y));E.rot=a=>XS.forEach(c=>c.rotate(a));E.sc=(a,b=a)=>XS.forEach(c=>c.scale(a,b));
E.xf=(x,y,r=0,s=1,f)=>{E.save();E.tr(x,y);if(r)E.rot(r);if(s!=1)E.sc(s);f();E.restore();};
E.clip=p=>XS.forEach(c=>c.clip(p));
E.alpha=a=>XS.forEach(c=>c.globalAlpha=a);
E.scaleNow=()=>{const m=X.C.getTransform();return Math.sqrt(m.a*m.a+m.b*m.b)/S;};
E.clear=()=>{X.O.setTransform(1,0,0,1,0,0);X.O.clearRect(0,0,OW,OH);
  for(const x of XS){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.filter='none';x.fillStyle='#000';x.fillRect(0,0,OW,OH);}
  E.LIGHT={tint:[1.04,1.02,.98],vig:.28,blur:0,bloom:1,expo:1,flash:0,shake:0};};
E.view=()=>{const c=E.cam;const m=new DOMMatrix();m.scaleSelf(S,S);m.translateSelf(W/2,H/2);if(c.r)m.rotateSelf(c.r*57.2958);m.scaleSelf(c.z,c.z);
  m.translateSelf(-c.x,-c.y);for(const x of XS)x.setTransform(m);};
E.screen=()=>{const m=new DOMMatrix().scaleSelf(S,S);for(const x of XS)x.setTransform(m);};
// ---------- пути ----------
E.P=(pts,closed=true)=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));if(closed)p.closePath();return p;};
E.Pr=(x,y,w,h)=>{const p=new Path2D();p.rect(x,y,w,h);return p;};
E.Prr=(x,y,w,h,r)=>{const p=new Path2D();p.roundRect(x,y,w,h,r);return p;};
E.Pe=(x,y,rx,ry,a=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry==null?rx:ry,a,0,Math.PI*2);return p;};
E.Ps=(pts,closed=true)=>{const p=new Path2D();const n=pts.length;const g=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
  p.moveTo(pts[0][0],pts[0][1]);const m=closed?n:n-1;for(let i=0;i<m;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    p.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)p.closePath();return p;};
// капсула (конечность) от a до b с радиусами ra, rb
E.Pcap=(ax,ay,bx,by,ra,rb=ra)=>{const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1e-3,a=Math.atan2(dy,dx);const p=new Path2D();
  const s=Math.asin(E.cl((ra-rb)/L,-1,1));p.arc(ax,ay,ra,a+Math.PI/2+s,a-Math.PI/2-s);p.arc(bx,by,rb,a-Math.PI/2-s,a+Math.PI/2+s);p.closePath();return p;};
// ---------- главная: вышитая (или «настоящая») заливка ----------
// o: t тип ('tat','sat','knot','fab','real','glow','strand'), a угол стежка (град.), len 0 короткий/.5/1 гладь, h высота, seed, sx масштаб узора,
//    blur (real), glow (доп. свечение 0..1), shadow (тень на ткань — рисуется отдельно E.drop)
E.fill=(p,col,o={})=>{const t=T[o.t||'tat'];
  X.C.fillStyle=typeof col=='function'?col(X.C):(col instanceof CanvasGradient?col:E.rgb(col));X.C.fill(p);
  const par=o.t=='real'?E.cl((o.blur||0)/6):o.t=='strand'?E.cl((o.w||4)/32):(o.len!=null?o.len:0);
  const h=(o.t=='real'||o.t=='glow')?0:(o.h!=null?o.h:(o.t=='fab'?0:1));
  X.D.fillStyle=`rgb(${par*255|0},${t*32},${h*255|0})`;X.D.fill(p);
  X.U.fillStyle=pat(o.seed!=null?o.seed:(t*3),o.a||0,o.sx||1,o.ox||0,o.oy||0);X.U.fill(p);
  if(o.glow){X.GL.fillStyle=E.rgb(o.gcol||col,o.glow);X.GL.fill(p);}};
// только цвет (тень/свет поверх уже вышитого — нить остаётся нитью)
E.tint=(p,col,a=1,blur=0)=>{X.C.save();X.C.globalAlpha=a;if(blur)X.C.filter=`blur(${blur*E.scaleNow()*S}px)`;X.C.fillStyle=typeof col=='function'?col(X.C):E.rgb(col);X.C.fill(p);X.C.restore();};
E.drop=(p,a=.35,blur=10,dx=8,dy=10)=>{X.C.save();X.C.translate(dx,dy);X.C.globalAlpha=a;X.C.filter=`blur(${blur*E.scaleNow()*S}px)`;X.C.fillStyle='#000';X.C.fill(p);X.C.restore();};
E.glow=(p,col,a=1,blur=0)=>{X.GL.save();X.GL.globalAlpha=a;if(blur)X.GL.filter=`blur(${blur*E.scaleNow()*S}px)`;X.GL.fillStyle=E.rgb(col);X.GL.fill(p);X.GL.restore();};
// один стежок-нить от (x0,y0) до (x1,y1), толщина w: свой кадр (ось x вдоль нити, центр на y=32 узора)
E.stitch=(x0,y0,x1,y1,w,col,o={})=>{const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);
  E.save();E.tr(x0,y0);E.rot(a);const p=E.Pcap(0,0,L,0,w/2);
  E.fill(p,col,{t:'strand',w,h:o.h,seed:o.seed,oy:-32*0,ox:0,...{a:0}});E.restore();};
// патч на стежок: узор strand центрирован на y=32 → сдвигаем узор
{const f0=E.stitch;E.stitch=(x0,y0,x1,y1,w,col,o={})=>{const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0)||.01;
  E.save();E.tr(x0,y0);E.rot(a);const p=E.Pcap(0,0,L,0,w/2);
  E.fill(p,col,{t:'strand',w,h:o.h,seed:o.seed==null?(x0*.37+y0*.11|0):o.seed,ox:-(o.phase||0),oy:-32});
  if(o.glow)E.glow(p,col,o.glow);E.restore();};}
// строчка по ломаной: стежки длиной len с промежутком gap (gap<0 — стебельчатый шов внахлёст); prog 0..1 — сколько уже прошито
E.polyLen=pts=>{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;};
E.at=(pts,s)=>{for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(s<=l||i==pts.length-1){const u=l?E.cl(s/l):0;
  return[E.lerp(pts[i-1][0],pts[i][0],u),E.lerp(pts[i-1][1],pts[i][1],u),Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])];}s-=l;}return[...pts[0],0];};
E.run=(pts,col,o={})=>{const w=o.w||5,len=o.len||16,gap=o.gap!=null?o.gap:8,L=E.polyLen(pts),end=L*(o.prog==null?1:o.prog);let last=null;
  for(let s=o.start||0,i=0;s<end-1;s+=len+gap,i++){const e=Math.min(s+len,end);const a=E.at(pts,s),b=E.at(pts,e);
    const jx=o.jit?(E.rnd(i*3.1+(o.seed||0))-.5)*o.jit:0,jy=o.jit?(E.rnd(i*7.3+(o.seed||0))-.5)*o.jit:0;
    E.stitch(a[0]+jx,a[1]+jy,b[0]-jx*.5,b[1]+jy*.5,w,typeof col=='function'?col(i):col,{seed:i+(o.seed||0),glow:o.glow});last=b;}return last;};
E.ribbonPts=(x,y,w,h,r=0)=>{const p=[];const n=Math.max(4,Math.round((w+h)/12));
  for(let i=0;i<=n;i++)p.push([x+w*i/n,y]);for(let i=1;i<=n;i++)p.push([x+w,y+h*i/n]);for(let i=1;i<=n;i++)p.push([x+w-w*i/n,y+h]);for(let i=1;i<=n;i++)p.push([x,y+h-h*i/n]);return p;};
// ---------- вышивка с прогрессом (строки нити появляются по одной) ----------
// path — фигура, box=[x0,y0,x1,y1] в кадре узора (после поворота a), prog 0..1. Возвращает точку иголки (в пользовательских координатах).
E.fillProg=(p,col,o,box,prog)=>{if(prog<=0)return null;if(prog>=1){E.fill(p,col,o);return null;}
  const a=(o.a||0)*Math.PI/180,sw=4*(o.sx||1);const[x0,y0,x1,y1]=box;const rows=Math.ceil((y1-y0)/sw);const fr=prog*rows,ri=Math.floor(fr),rf=fr-ri;
  const ry=y0+ri*sw;const dirR=ri%2==0;const xc=dirR?E.lerp(x0,x1,rf):E.lerp(x1,x0,rf);
  E.save();E.rot(a);const cp=new Path2D();cp.rect(x0-4,y0-400,x1-x0+8,ry-y0+400);
  if(dirR)cp.rect(x0-4,ry,xc-x0+4,sw);else cp.rect(xc,ry,x1-xc+4,sw);E.clip(cp);E.rot(-a);E.fill(p,col,o);E.restore();
  return[xc*Math.cos(a)-(ry+sw/2)*Math.sin(a),xc*Math.sin(a)+(ry+sw/2)*Math.cos(a)];};
// ---------- текст (вышитый) ----------
E.font=(sz,w=700,fam='Fred')=>`${w} ${sz}px ${fam}`;
E.textPath=null;
E.stext=(s,x,y,sz,col,o={})=>{for(const k of['C','D','U']){const c=X[k];c.font=E.font(sz,o.w||700);c.textAlign=o.align||'center';c.textBaseline='middle';}
  const ol=o.ol==null?Math.max(2,sz*.05):o.ol;
  // окантовка — тёмная нить
  if(ol){X.C.lineJoin=X.D.lineJoin=X.U.lineJoin='round';X.C.lineWidth=X.D.lineWidth=X.U.lineWidth=ol*2;
    X.C.strokeStyle=E.rgb(o.olc||E.shade(col,.7));X.C.strokeText(s,x,y);X.D.strokeStyle=`rgb(0,${T.tat*32},255)`;X.D.strokeText(s,x,y);
    X.U.strokeStyle=pat(5,(o.a||40)+90);X.U.strokeText(s,x,y);}
  X.C.fillStyle=E.rgb(col);X.C.fillText(s,x,y);X.D.fillStyle=`rgb(${(o.len||0)*255|0},${T.tat*32},255)`;X.D.fillText(s,x,y);
  X.U.fillStyle=pat(2,o.a==null?40:o.a);X.U.fillText(s,x,y);
  if(o.glow){X.GL.font=X.C.font;X.GL.textAlign=X.C.textAlign;X.GL.textBaseline='middle';X.GL.fillStyle=E.rgb(col,o.glow);X.GL.fillText(s,x,y);}};
E.tw=(s,sz,w=700)=>{X.C.font=E.font(sz,w);return X.C.measureText(s).width;};
// подпись-нашивка: ткань-лента, по краю пунктир, текст вышивается слева направо (prog)
E.label=(lines,cx,cy,sz,o={})=>{const lh=sz*1.18;const wmax=Math.max(...lines.map(l=>E.tw(l,sz)));const pw=wmax+sz*1.2,ph=lines.length*lh+sz*.7;
  const x=cx-pw/2,y=cy-ph/2;const app=o.app==null?1:o.app,prog=o.prog==null?1:o.prog;if(app<=0)return;
  E.save();E.tr(cx,cy);E.rot((o.rot||0)*Math.PI/180);const s=E.lerp(.6,1,E.back(app));E.sc(s);E.tr(-cx,-cy);
  const P=E.Prr(x,y,pw,ph,sz*.25);E.drop(P,.45,14,6,10);E.fill(P,o.bg||'#efe4cf',{t:'fab',h:.35,seed:6});
  E.run(E.ribbonPts(x+sz*.22,y+sz*.22,pw-sz*.44,ph-sz*.44),o.edge||'#b0533c',{w:4,len:12,gap:8,prog:E.cl(app*1.2)});
  const tot=lines.reduce((a,l)=>a+l.length,0);let acc=0;
  lines.forEach((l,i)=>{const ly=y+sz*.35+lh*(i+.5);const lw=E.tw(l,sz);const p0=acc/tot,p1=(acc+l.length)/tot;acc+=l.length;
    const u=E.cl((prog-p0)/(p1-p0));if(u<=0)return;E.save();const cp=new Path2D();cp.rect(cx-lw/2-20,ly-lh,(lw+40)*u,lh*2);E.clip(cp);
    E.stext(l,cx,ly,sz,o.col||'#2b2a3a',{a:35});E.restore();});
  E.restore();};
// ---------- интерфейс (O, резкий) ----------
E.O=X.O;
// ---------- GL ----------
const gl=document.getElementById('c').getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
document.getElementById('c').width=OW;document.getElementById('c').height=OH;
const VS=`#version 300 es
in vec2 p;out vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0,1);}`;
const FS1=`#version 300 es
precision highp float;in vec2 v;out vec4 o;
uniform sampler2D tC,tD,tU;uniform vec2 R;uniform vec3 Ld;uniform float tm;
float h1(float n){return fract(sin(n*127.1)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 px=1./R;ivec2 ip=ivec2(v*R);
  vec4 c=texture(tC,v);vec4 d=texelFetch(tD,ip,0);vec4 u=texelFetch(tU,ip,0);
  int ty=int(d.g*255./32.+.5);
  vec2 q=u.rg*255./4.;float seed=u.b;
  vec3 col=c.rgb;
  // рельеф по высоте нитей
  float e=1.6;
  float hl=textureLod(tD,v-vec2(px.x*e,0),1.3).b,hr=textureLod(tD,v+vec2(px.x*e,0),1.3).b,hu=textureLod(tD,v-vec2(0,px.y*e),1.3).b,hd=textureLod(tD,v+vec2(0,px.y*e),1.3).b;
  float hb=textureLod(tD,v,2.).b;
  vec3 n=normalize(vec3((hl-hr)*1.6,(hu-hd)*1.6,.5));
  vec3 L=normalize(Ld);
  float dif=clamp(dot(n,L),0.,1.);
  vec2 dqx=abs(dFdx(q)),dqy=abs(dFdy(q));dqx=min(dqx,64.-dqx);dqy=min(dqy,64.-dqy);float fw=clamp(length(dqx+dqy),0.,6.);
  float k=1.;vec3 spc=vec3(0);
  if(ty==2||ty==3){ // гладь / татами
    float sw=4.;float Ls=ty==3?64.:(d.r<.33?16.:(d.r<.66?32.:64.));
    float row=floor(q.y/sw),a=fract(q.y/sw);float off=fract(row*.1875)*Ls;if(ty==3)off=fract(row*.4375)*64.;
    float s=(q.x+off)/Ls,si=floor(s),sf=fract(s);
    float pr=pow(max(0.,1.-pow(2.*a-1.,2.)),.35);
    float aa=smoothstep(0.,1.,fw*.5);pr=mix(pr,.75,aa);
    float en=ty==3?1.:smoothstep(0.,.09*16./Ls,sf)*smoothstep(1.,1.-.09*16./Ls,sf);en=mix(en,1.,aa);
    float tw=.92+.08*sin((q.x*.75+a*3.)*6.2832/1.);
    float jt=1.+(h2(vec2(row,si+seed*97.))-.5)*.12;
    vec2 gd=vec2(dFdx(q.x),dFdy(q.x));if(abs(gd.x)>16.||abs(gd.y)>16.)gd=vec2(1,0);vec2 td=normalize(gd+1e-5);
    float shn=.35+.65*(1.-abs(dot(td,normalize(vec2(L.x,-L.y)))));
    k=(.42+.64*pr)*mix(.8,1.,en)*(.95+.1*sin(q.x*.35+row*1.7))*mix(tw,1.,aa)*jt*(.9+.2*shn);
    spc=vec3(1.,.97,.9)*pow(pr,5.)*(ty==3?.42:.3)*shn*en*(1.-aa*.6);
  }else if(ty==4){ // узелки
    float ks=8.;float r=floor(q.y/ks);float qx=q.x+mod(r,2.)*ks*.5;float ci=floor(qx/ks);
    vec2 l=vec2(fract(qx/ks),fract(q.y/ks))-.5;l+=(vec2(h2(vec2(ci,r)),h2(vec2(r,ci+3.)))-.5)*.1;
    float dd=length(l)/.5;float b=sqrt(max(0.,1.-dd*dd));float an=atan(l.y,l.x);
    float ln=.8+.2*sin(an*3.+dd*9.+h2(vec2(ci,r))*6.);
    vec3 nn=normalize(vec3(l*1.6,b+.15));
    k=(.4+.75*b*ln)*(.8+.4*clamp(dot(nn,L),0.,1.));
    spc=vec3(1.)*pow(max(dot(reflect(-L,nn),vec3(0,0,1)),0.),10.)*.22*b;
  }else if(ty==5){ // одна нить
    float hw=max(d.r*32./2.,.5);float ac=clamp((q.y-32.)/hw,-1.,1.);
    float pr=sqrt(max(0.,1.-ac*ac));
    float tw=.88+.12*sin((q.x*(6.2832*24./64.))-ac*2.4);
    k=(.55+.6*pr)*tw;
    spc=vec3(1.,.97,.9)*pow(pr,8.)*.28;
    n=normalize(vec3(0.,0.,1.));
  }else if(ty==1){ // лён
    float p=2.;vec2 cc=floor(q/p),f=fract(q/p);float ov=mod(cc.x+cc.y,2.);
    float pr=ov>.5?sin(f.x*3.1416):sin(f.y*3.1416);
    float sl=.94+.06*sin(q.y*.8+h1(cc.x)*6.)*(ov>.5?1.:0.)+.06*sin(q.x*.7+h1(cc.y+9.)*6.)*(ov>.5?0.:1.);
    float amp=1.-smoothstep(.6,1.4,fw);
    k=mix(1.,(.8+.24*pr)*sl,amp);
    float sh=textureLod(tD,v+vec2(-L.x,L.y)*px*4.,2.5).b; // тень от нитей
    k*=1.-.42*sh;
  }else if(ty==6){ col=textureLod(tC,v,d.r*6.).rgb; }
  if(ty>=2&&ty<=4){
    float ed=smoothstep(.15,.85,hb);
    k*=mix(.62,1.,ed)*(.8+.38*dif);
  }
  col=col*k+spc;
  o=vec4(col,1.);
}`;
const FS2=`#version 300 es
precision highp float;in vec2 v;out vec4 o;
uniform sampler2D tF,tG,tO;uniform vec2 R;uniform float tm,blur,vig,bloom,expo,flash,grain;uniform vec3 tint;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 vf=vec2(v.x,1.-v.y);vec3 c=textureLod(tF,vf,0.).rgb;
  if(blur>0.){vec3 b=vec3(0);float w=0.;for(int i=0;i<12;i++){float a=float(i)*2.39996;float r=sqrt(float(i)+.5)/3.5*blur;vec2 off=vec2(cos(a),sin(a))*r/R;b+=textureLod(tF,vf+vec2(off.x,-off.y),log2(max(blur*.6,1.))).rgb;w+=1.;}c=mix(c,b/w,clamp(blur/2.,0.,1.));}
  vec3 g=textureLod(tG,v,2.).rgb*.5+textureLod(tG,v,4.).rgb*.8+textureLod(tG,v,6.).rgb*1.1;
  c+=g*bloom;
  c*=tint*expo;
  vec2 q=v-.5;q.x*=.62;c*=1.-vig*smoothstep(.15,.75,length(q)*1.25);
  c+=flash;
  c=c/(1.+c*.08);
  c+= (h2(v*R+fract(tm*13.)*91.)-.5)*grain;
  vec4 ov=texture(tO,v);c=c*(1.-ov.a)+ov.rgb;
  o=vec4(clamp(c,0.,1.),1.);
}`;
const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(x));return x;};
const prog=fs=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;};
const P1=prog(FS1),P2=prog(FS2);
const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const tex=(mip,near)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,near?gl.NEAREST:(mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,near?gl.NEAREST:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
const TX={C:tex(1),D:tex(1),U:tex(0,1),GL:tex(1),O:tex(0),F:tex(1)};
gl.bindTexture(gl.TEXTURE_2D,TX.F);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,OW,OH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,TX.F,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
const up=(k,mip)=>{gl.bindTexture(gl.TEXTURE_2D,TX[k]);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k=='O');gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,CV[k]);if(mip)gl.generateMipmap(gl.TEXTURE_2D);};
const bind=(p,name,k,unit)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,TX[k]);gl.uniform1i(gl.getUniformLocation(p,name),unit);};
const U1=(p,n,...v)=>{const l=gl.getUniformLocation(p,n);if(v.length==1)gl.uniform1f(l,v[0]);else if(v.length==2)gl.uniform2f(l,...v);else gl.uniform3f(l,...v);};
E.present=t=>{const Lg=E.LIGHT;up('C',1);up('D',1);up('U',0);up('GL',1);up('O',0);
  gl.viewport(0,0,OW,OH);gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.useProgram(P1);bind(P1,'tC','C',0);bind(P1,'tD','D',1);bind(P1,'tU','U',2);
  U1(P1,'R',OW,OH);U1(P1,'Ld',...(Lg.dir||[-.5,.6,.8]));U1(P1,'tm',t);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindTexture(gl.TEXTURE_2D,TX.F);gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(P2);bind(P2,'tF','F',0);bind(P2,'tG','GL',1);bind(P2,'tO','O',2);
  U1(P2,'R',OW,OH);U1(P2,'tm',t);U1(P2,'blur',Lg.blur);U1(P2,'vig',Lg.vig);U1(P2,'bloom',Lg.bloom);U1(P2,'expo',Lg.expo);U1(P2,'flash',Lg.flash);U1(P2,'grain',.035);U1(P2,'tint',...Lg.tint);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
const buf=new Uint8Array(OW*OH*4),out=new Uint8Array(OW*OH*4);
E.grab=()=>{gl.readPixels(0,0,OW,OH,gl.RGBA,gl.UNSIGNED_BYTE,buf);for(let y=0;y<OH;y++)out.set(buf.subarray((OH-1-y)*OW*4,(OH-y)*OW*4),y*OW*4);return out;};
window.E=E;
})();
