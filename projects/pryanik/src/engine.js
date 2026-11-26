// E — движок «живой рельеф»: пряник, глазурь, сахар, воск, керамика. Мир рисуется в три холста,
// шейдер освещает его как настоящий рельеф: нормали из карты высот, самозатенение лучом по высотам,
// глянец по материалу, искры сахара, подповерхностный свет глазури и воска, глубина резкости (боке), ореол.
// C: альбедо RGB.  H: R=высота, G=искры (семя сахара), B=глянец.  M: R=материал, G=свечение, B=глубина (для DOF).
// Дизайн 1080×1920, вывод 720×1280.
(function(){
const W=1080,H=1920,OW=720,OH=1280,S=OW/W;
const mk=()=>{const c=document.createElement('canvas');c.width=OW;c.height=OH;return c;};
const CV={C:mk(),H:mk(),M:mk(),Q:mk()};
const X={C:CV.C.getContext('2d'),H:CV.H.getContext('2d'),M:CV.M.getContext('2d'),Q:CV.Q.getContext('2d')};
const XS=[X.C,X.H,X.M,X.Q];
const E={W,H,S,CV,X,cam:{x:W/2,y:H/2,z:1,r:0}};
// материалы (M.r)
E.DOUGH=.0;E.ICING=.2;E.CANDY=.3;E.MATTE=.42;E.METAL=.55;E.CERAM=.68;E.SKIN=.82;E.UNLIT=1;
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
E.rgb=c=>{c=typeof c=='string'?E.hex(c):c;return`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;};
E.shade=(c,k)=>{c=typeof c=='string'?E.hex(c):c;return c.map(x=>E.cl(x*k,0,255));};
// ---------- трансформы на все холсты ----------
E.save=()=>XS.forEach(x=>x.save());E.restore=()=>XS.forEach(x=>x.restore());
E.tr=(x,y)=>XS.forEach(c=>c.translate(x,y));E.rot=a=>XS.forEach(c=>c.rotate(a));E.sc=(a,b=a)=>XS.forEach(c=>c.scale(a,b));
E.xf=(x,y,r=0,s=1,f,sy)=>{E.save();E.tr(x,y);if(r)E.rot(r);if(s!=1||sy)E.sc(s,sy||s);f();E.restore();};
E.clip=p=>XS.forEach(c=>c.clip(p));
E.scaleNow=()=>{const m=X.C.getTransform();return Math.sqrt(m.a*m.a+m.b*m.b);}; // пиксели вывода на 1 ед. дизайна
E.clear=()=>{for(const x of XS){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.filter='none';}
  X.C.fillStyle='#000';X.C.fillRect(0,0,OW,OH);X.H.fillStyle='#000';X.H.fillRect(0,0,OW,OH);X.M.fillStyle='rgb(255,0,255)';X.M.fillRect(0,0,OW,OH);X.Q.clearRect(0,0,OW,OH);};
// камера: par — доля параллакса слоя (0 — неподвижный фон, 1 — основной план, >1 — передний)
E.view=(par=1)=>{const c=E.cam,z=1+(c.z-1)*par;const m=new DOMMatrix();m.scaleSelf(S,S);m.translateSelf(W/2,H/2);if(c.r)m.rotateSelf(c.r*par*57.3);m.scaleSelf(z,z);
  m.translateSelf(-W/2-(c.x-W/2)*par,-H/2-(c.y-H/2)*par);for(const x of XS)x.setTransform(m);};
E.toScreen=(x,y,par=1)=>{const c=E.cam,z=1+(c.z-1)*par;return[W/2+(x-W/2-(c.x-W/2)*par)*z,H/2+(y-H/2-(c.y-H/2)*par)*z];};
E.screen=()=>{const m=new DOMMatrix().scaleSelf(S,S);for(const x of XS)x.setTransform(m);};
// ---------- пути ----------
E.P=pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();return p;};
E.Pr=(x,y,w,h)=>{const p=new Path2D();p.rect(x,y,w,h);return p;};
E.Prr=(x,y,w,h,r)=>{const p=new Path2D();p.roundRect(x,y,w,h,r);return p;};
E.Pe=(x,y,rx,ry,a=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry||rx,a,0,Math.PI*2);return p;};
E.Pl=pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));return p;};
// гладкая кривая через точки (Катмулл-Ром)
E.Ps=(pts,closed)=>{const p=new Path2D();const n=pts.length;const g=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];p.moveTo(pts[0][0],pts[0][1]);
  for(let i=0;i<(closed?n:n-1);i++){const a=g(i-1),b=g(i),c=g(i+1),d=g(i+2);p.bezierCurveTo(b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(d[0]-b[0])/6,c[1]-(d[1]-b[1])/6,c[0],c[1]);}
  if(closed)p.closePath();return p;};
// ---------- состояние материала ----------
// depth: 0 — ближе всего, 1 — дальше всего; фокус — E.FX.focus
E.st={m:0,e:0,d:.5};
E.mat=(m,e=0)=>{E.st.m=m;E.st.e=e;};E.depth=d=>{E.st.d=d;};
const mcol=()=>`rgb(${E.st.m*255|0},${E.st.e*255|0},${E.st.d*255|0})`;
const hcol=(h,g=0,sp=0)=>`rgb(${E.cl(h)*255|0},${sp*255|0},${E.cl(g)*255|0})`;
// объект: высоты внутри объекта складываются «максимумом», а сам объект ложится поверх старого
let inObj=0;
const XH=()=>inObj?X.Q:X.H;
E.obj=f=>{inObj++;if(inObj==1){X.Q.globalCompositeOperation='lighten';}f();
  if(--inObj==0){X.Q.globalCompositeOperation='source-over';X.H.save();X.H.setTransform(1,0,0,1,0,0);X.H.drawImage(CV.Q,0,0);X.H.restore();
    X.Q.save();X.Q.setTransform(1,0,0,1,0,0);X.Q.clearRect(0,0,OW,OH);X.Q.restore();}};
// ---------- примитивы ----------
// заливка: col — цвет/градиент, h — высота плато, bev — ширина скоса (ед. дизайна), g — глянец, sp — искры
E.fill=(p,col,o={})=>{const h=o.h??.1,bev=o.bev??0,g=o.g??0;
  if(col){X.C.fillStyle=col;X.C.fill(p);}
  if(!o.noM){X.M.fillStyle=mcol();X.M.fill(p);}
  if(o.noH)return;const xh=XH();
  xh.fillStyle=hcol(h,g);xh.fill(p);
  if(bev>0){xh.save();xh.clip(p);const op=xh.globalCompositeOperation;xh.globalCompositeOperation='darken';xh.lineJoin='round';const n=10;
    for(let i=0;i<n;i++){const r=1-i/n;const f=Math.sin(Math.PI/2*(1-r));xh.strokeStyle=hcol(h*(.12+.88*Math.pow(f,.8)),g);xh.lineWidth=bev*2*r;xh.stroke(p);}
    xh.globalCompositeOperation=op;xh.restore();}
  if(o.dome){E.dome(p,o.dome[0],o.dome[1],o.dome[2],h+o.dome[3],g);}};
// купол: радиальная «выпуклость» поверх (для пухлости)
E.dome=(p,cx,cy,r,hTop,g=0)=>{const xh=XH();xh.save();xh.clip(p);const gr=xh.createRadialGradient(cx,cy,0,cx,cy,r);
  for(let i=0;i<=6;i++){const u=i/6;gr.addColorStop(u,hcol(hTop*Math.sqrt(Math.max(0,1-u*u)),g));}
  xh.fillStyle=gr;xh.fillRect(cx-r,cy-r,r*2,r*2);xh.restore();};
// трубка (линия глазури, рука-тесто): профиль round — полукруг, puff — плоский верх
E.tube=(path,w,col,o={})=>{const h=o.h??.08,base=o.base??0,g=o.g??0,prof=o.prof||'round',sp=o.sp||0;const steps=Math.round(E.cl(w*E.scaleNow()/2.5,o.steps||6,40));
  for(const x of XS){x.lineCap=o.cap||'round';x.lineJoin='round';}
  if(col){if(o.rim){X.C.strokeStyle=o.rim;X.C.lineWidth=w;X.C.stroke(path);X.C.strokeStyle=col;X.C.lineWidth=w*(o.rimK||.78);X.C.stroke(path);}
    else{X.C.strokeStyle=col;X.C.lineWidth=w;X.C.stroke(path);}}
  if(!o.noM){X.M.strokeStyle=mcol();X.M.lineWidth=w;X.M.stroke(path);}
  const xh=XH();const op=xh.globalCompositeOperation;if(!inObj)xh.globalCompositeOperation='lighten';
  for(let i=0;i<steps;i++){const r=1-i/steps;const k=prof=='round'?Math.sqrt(1-r*r*.98):Math.pow(1-r*r*.98,.28);
    xh.strokeStyle=hcol(base+h*k,g,sp);xh.lineWidth=Math.max(.6,w*r);xh.stroke(path);}
  xh.globalCompositeOperation=op;};
E.line=(pts,w,col,o)=>E.tube(E.Pl(pts),w,col,o);
E.curve=(pts,w,col,o)=>E.tube(E.Ps(pts),w,col,o);
E.dot=(x,y,r,col,o={})=>{const p=new Path2D();p.moveTo(x,y);p.lineTo(x+.01,y);E.tube(p,r*2,col,o);};
// текстура в высоте/цвете: узор (холст-плитка) внутри пути, режим op
E.texture=(p,pat,ch,op,alpha=1,scale=1)=>{const x=ch=='H'?XH():X[ch];x.save();x.clip(p);x.globalCompositeOperation=op;x.globalAlpha=alpha;
  const P=x.createPattern(pat,'repeat');P.setTransform(new DOMMatrix().scaleSelf(scale,scale));x.fillStyle=P;x.fill(p);x.restore();};
// узоры (генерируются один раз)
const tile=(n,f)=>{const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');const id=x.createImageData(n,n);f(id.data,n);x.putImageData(id,0,0);return c;};
const vnoise=(n,cells,seed)=>{const g=[];for(let i=0;i<cells*cells;i++)g.push(E.rnd(i*1.7+seed));
  return (x,y)=>{const fx=x/n*cells,fy=y/n*cells;const i=Math.floor(fx),j=Math.floor(fy),u=fx-i,v=fy-j;const s=t=>t*t*(3-2*t);
    const G=(a,b)=>g[((b%cells+cells)%cells)*cells+((a%cells+cells)%cells)];
    return E.lerp(E.lerp(G(i,j),G(i+1,j),s(u)),E.lerp(G(i,j+1),G(i+1,j+1),s(u)),s(v));};};
E.PAT={};
E.PAT.pores=tile(256,(d,n)=>{const a=vnoise(n,16,1),b=vnoise(n,48,2);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  let v=.82+.12*a(x,y)+.08*b(x,y);if(E.rnd(x*13.1+y*7.7)>.99)v-=.12;v=E.cl(v);d[i]=v*255;d[i+1]=255;d[i+2]=255;d[i+3]=255;}});
E.PAT.crumb=tile(256,(d,n)=>{const a=vnoise(n,8,3),b=vnoise(n,32,4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  const v=E.cl(.88+.14*a(x,y)+.08*b(x,y)-(E.rnd(x*3.1+y*9.7)>.985?.08:0));d[i]=v*255;d[i+1]=v*248;d[i+2]=v*235;d[i+3]=255;}});
E.PAT.sugar=tile(128,(d,n)=>{for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;const r=E.rnd(x*17.3+y*3.9+.5);d[i]=0;d[i+1]=r>.93?60+E.rnd(x+y*.3)*195:0;d[i+2]=0;d[i+3]=255;}});
E.PAT.wood=tile(512,(d,n)=>{const a=vnoise(n,6,5),b=vnoise(n,64,6);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  const w=Math.sin((y/n*26+a(x,y)*5+b(x,y)*.4)*Math.PI*2)*.5+.5;const v=E.cl(.75+.25*Math.pow(w,3)-.05*b(x,y));d[i]=v*255;d[i+1]=v*255;d[i+2]=v*255;d[i+3]=255;}});
E.PAT.linen=tile(128,(d,n)=>{const a=vnoise(n,16,7);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  const v=E.cl(.8+.1*Math.sin(x*1.6)*Math.sin(y*.3+a(x,y)*3)+.1*Math.sin(y*1.6)*Math.sin(x*.3)+.06*a(x,y));d[i]=v*255;d[i+1]=v*255;d[i+2]=v*255;d[i+3]=255;}});
E.PAT.knit=tile(64,(d,n)=>{for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;const cx=(x%16)-8,cy=(y%12);
  const k=Math.abs(cx+(cy-6)*(cx<0?.6:-.6));const v=E.cl(1-Math.pow(Math.abs((Math.abs(cx)-4)/4),2)*.7-cy/40);d[i]=v*255;d[i+1]=v*255;d[i+2]=v*255;d[i+3]=255;}});
E.PAT.skin=tile(256,(d,n)=>{const a=vnoise(n,32,8),b=vnoise(n,8,9);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  const v=E.cl(.9+.06*a(x,y)+.05*b(x,y));d[i]=v*255;d[i+1]=v*255;d[i+2]=v*255;d[i+3]=255;}});
E.PAT.paper=tile(256,(d,n)=>{const a=vnoise(n,6,10),b=vnoise(n,40,11);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4;
  const cr=Math.abs(Math.sin((x*.7+y*.2)/n*9+a(x,y)*4))<.04?.9:1;const v=E.cl((.88+.08*a(x,y)+.05*b(x,y))*cr);d[i]=v*255;d[i+1]=v*255;d[i+2]=v*255;d[i+3]=255;}});
// пряник: тесто с порами (в высоте) и запёкшимися краями (в цвете)
E.dough=(p,o={})=>{const h=o.h??.3;E.fill(p,o.col||'#b5692f',{h,bev:o.bev??10,g:.06,noH:o.noH});
  E.texture(p,E.PAT.pores,'H','multiply',1,o.ps||1);E.texture(p,E.PAT.crumb,'C','multiply',1,o.ps||1);};
// ---------- текст глазурью (Hershey, однолинейный) ----------
const TC=new Map();
E.textPolys=(str,font='futural',size=60,align='c')=>{const key=str+'|'+font+'|'+size+'|'+align;if(TC.has(key))return TC.get(key);
  const F=window.HFONT[font],sc=size/21;let pen=0;const polys=[];
  for(const ch of str){if(ch===' '){pen+=font==='scripts'?8:11;continue;}const g=F[ch.charCodeAt(0)-33];if(!g)continue;
    let mxx=-1e9,mn=1e9;g[0].replace(/(-?\d+),(-?\d+)/g,(_,a)=>{mxx=Math.max(mxx,+a);mn=Math.min(mn,+a);});
    const off=font==='scripts'?pen:pen-mn;
    for(const seg of g[0].split('M').filter(s=>s.trim())){const pts=[];seg.replace(/(-?\d+),(-?\d+)/g,(_,a,b)=>pts.push([(+a+off)*sc,+b*sc]));polys.push(pts);}
    pen=font==='scripts'?pen+mxx-.5:off+mxx+3;}
  const w=pen*sc,ox=align==='c'?-w/2:align==='r'?-w:0,oy=-size*.55;let L=0;
  const out=polys.map(p=>{const q=p.map(([a,b])=>[a+ox,b+oy]);let l=0;for(let i=1;i<q.length;i++)l+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);L+=l;return{q,l};});
  const r={polys:out,L,w};TC.set(key,r);return r;};
// p — доля выдавленного (0..1); глазурь ложится трубкой, на кончике — капля
E.pipeText=(str,x,y,size,p=1,o={})=>{const T=E.textPolys(str,o.font||'futural',size,o.align||'c');if(p<=0)return null;
  const w=o.w||size*.16,col=o.col||'#fbf6ee';const lim=T.L*E.cl(p);let acc=0,tip=null;
  E.save();E.tr(x,y);if(o.rot)E.rot(o.rot);
  E.mat(E.ICING,o.e||0);E.depth(o.d??.2);
  E.obj(()=>{
    // тень-подложка: чуть темнее под глазурью (влажный след)
    for(const {q,l} of T.polys){if(acc>=lim)break;let pts=q;if(acc+l>lim){const need=lim-acc;let s=0;pts=[q[0]];
        for(let i=1;i<q.length;i++){const d=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);if(s+d>=need){const u=(need-s)/d;pts.push([q[i-1][0]+(q[i][0]-q[i-1][0])*u,q[i-1][1]+(q[i][1]-q[i-1][1])*u]);break;}s+=d;pts.push(q[i]);}
        tip=pts[pts.length-1];}
      acc+=l;if(pts.length<2)pts=[pts[0],[pts[0][0]+.01,pts[0][1]]];
      E.tube(E.Pl(pts),w,col,{h:o.h??.12,base:o.base??.5,g:1,sp:.0,steps:5});}
    if(tip&&p<1)E.dot(tip[0],tip[1],w*.62,col,{h:(o.h??.12)*1.25,base:o.base??.5,g:1});});
  E.restore();return tip?[x+tip[0],y+tip[1]]:null;};
// ---------- WebGL ----------
const cv=document.getElementById('c');cv.width=OW;cv.height=OH;
const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false,premultipliedAlpha:false});
E.gl=gl;
const shd=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
const prog=(vs,fs)=>{const p=gl.createProgram();gl.attachShader(p,shd(gl.VERTEX_SHADER,vs));gl.attachShader(p,shd(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;};
const VQ=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0,1);}`;
const NOISE=`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
`;
// проход 1 — свет по рельефу
const F1=`#version 300 es
precision highp float;in vec2 uv;out vec4 o;
uniform sampler2D C,Hh,M;uniform vec2 res;uniform float HS,time,amb,spark;
uniform vec3 Lp,Lc,ambC,Fd,Fc,L2p,L2c;
${NOISE}
float hg(vec2 q){return texture(Hh,q/res).r*HS;}
void main(){vec2 px=uv*res;vec4 c=texture(C,uv);vec4 hh=texture(Hh,uv);vec4 m=texture(M,uv);
  vec3 al=pow(c.rgb,vec3(2.2));float mat=m.r,emi=m.g;
  if(mat>.92){o=vec4(al*(1.+emi*6.),1);return;}
  float h=hh.r*HS;
  float e=1.5;float dx=0.,dy=0.;
  for(int i=-1;i<=1;i++){float o2=float(i)*1.2;dx+=hg(px+vec2(e,o2))-hg(px-vec2(e,-o2));dy+=hg(px+vec2(o2,e))-hg(px-vec2(-o2,e));}
  dx/=3.;dy/=3.;float dx2=hg(px+vec2(4,0))-hg(px-vec2(4,0)),dy2=hg(px+vec2(0,4))-hg(px-vec2(0,4));
  vec3 N=normalize(vec3(-(dx*.75+dx2*.2),-(dy*.75+dy2*.2),2.*e));
  vec3 P=vec3(px,h);vec3 V=vec3(0,0,1);
  vec3 col=vec3(0);
  // окклюзия
  float ao=0.;for(int i=0;i<8;i++){float a=float(i)*.785;for(int k=1;k<3;k++){float r=float(k)*7.;ao+=max(0.,hg(px+vec2(cos(a),sin(a))*r)-h)/r;}}
  ao=clamp(1.-ao*.09,.25,1.);
  float gl=hh.b;float sh=mat<.1?6.:mat<.25?90.:mat<.35?140.:mat<.5?10.:mat<.6?60.:mat<.75?110.:18.;
  for(int li=0;li<2;li++){vec3 lp=li==0?Lp:L2p;vec3 lc=li==0?Lc:L2c;if(dot(lc,lc)<1e-5)continue;
    vec3 Lv=lp-P;float dist=length(Lv);vec3 L=Lv/dist;float att=1./(1.+pow(dist/(res.y*.9),2.));
    // тень: шаг по карте высот к свету
    float s=1.;float t=1.+h21(px+time)*2.5;for(int i=0;i<32;i++){vec3 q=P+L*t;if(q.z>HS*1.05||t>dist)break;float hf=hg(q.xy);
      s=min(s,clamp(1.-(hf-q.z)/(1.5+t*.09),0.,1.));t+=1.6+t*.1;}
    float nl=dot(N,L);float dif;
    if(mat>.15&&mat<.25||mat>.78)dif=clamp((nl+.45)/1.45,0.,1.);else dif=max(nl,0.);
    vec3 Hv=normalize(L+V);float sp=pow(max(dot(N,Hv),0.),sh)*(sh+8.)/40.;
    vec3 d=al*dif*s;vec3 spc=vec3(gl*sp*s);
    if(mat>.5&&mat<.6){d*=.35;spc*=mix(vec3(1),al*2.,.6);}
    // подповерхностный свет: глазурь, воск, кожа светятся тёплым на краях
    if(mat>.15&&mat<.25)d+=al*vec3(1.,.85,.6)*pow(1.-max(nl,0.),2.)*.25*s;
    if(mat>.78)d+=al*vec3(1.,.45,.3)*pow(1.-max(nl,0.),2.)*.35;
    col+=(d+spc)*lc*att;}
  // заполняющий свет (из окна) и окружение
  col+=al*Fc*max(dot(N,normalize(Fd)),0.)*ao;
  col+=al*ambC*amb*ao*(.6+.4*N.z);
  // запёкшийся край пряника
  if(mat<.1)col*=mix(.55,1.,smoothstep(.0,.55,hh.r));
  // искры сахара
  if(hh.g>.2){float tw=.5+.5*sin(time*6.+hh.g*90.);vec3 L=normalize(Lp-P);vec3 Hv=normalize(L+V);col+=Lc*pow(max(dot(N,Hv),0.),8.)*hh.g*tw*spark*3.;}
  // металл и керамика отражают «комнату»
  if(mat>.5&&mat<.75){float f=pow(1.-N.z,2.);col+=mix(ambC*amb*2.,Lc*.15,smoothstep(-.3,.6,-N.y))*f*(mat<.6?al*3.:vec3(.6));}
  col+=al*emi*6.;
  o=vec4(col,1);}`;
// проход 2 — глубина резкости (боке), ореол, плёнка
const F2=`#version 300 es
precision highp float;in vec2 uv;out vec4 o;
uniform sampler2D A,M;uniform vec2 res;uniform float time,focus,dof,bloom,exposure,vig,grain,fade,warm,maxR;
${NOISE}
float coc(vec2 q){float d=texture(M,q).b;return clamp(abs(d-focus)*dof,0.,maxR);}
void main(){float c0=coc(uv);vec3 acc=texture(A,uv).rgb;float wsum=1.;
  if(c0>.6){for(int i=1;i<48;i++){float fi=float(i);float r=sqrt(fi/48.)*c0;float a=fi*2.39996;vec2 q=uv+vec2(cos(a),sin(a))*r/res;
      float cs=coc(q);float w=clamp(cs-r+1.,0.,1.);acc+=texture(A,q).rgb*w;wsum+=w;}}
  vec3 col=acc/wsum;
  vec3 bl=vec3(0);for(int k=2;k<7;k++){vec3 s=textureLod(A,uv,float(k)).rgb;bl+=max(s-.7,0.)*(1.+float(k)*.3);}
  col+=bl*bloom*.18;
  col*=exposure;
  col=col*(2.51*col+.03)/(col*(2.43*col+.59)+.14);
  col=pow(clamp(col,0.,1.),vec3(1./2.2));
  col=mix(col,col*vec3(1.05,.98,.9),warm);
  vec2 d=uv-.5;col*=mix(1.,smoothstep(.95,.25,length(d*vec2(.85,1.))),vig);
  col+=(h21(uv*res+fract(time*7.)*91.)-.5)*grain;
  o=vec4(col*fade,1);}`;
const P1=prog(VQ,F1),P2=prog(VQ,F2);
const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const vao=gl.createVertexArray();gl.bindVertexArray(vao);const lp=gl.getAttribLocation(P1,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
const mkT=(mip)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
const TX={C:mkT(false),H:mkT(false),M:mkT(false)};
gl.getExtension('EXT_color_buffer_float');gl.getExtension('OES_texture_float_linear');
const mkF=()=>{const t=mkT(true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,OW,OH,0,gl.RGBA,gl.HALF_FLOAT,null);gl.generateMipmap(gl.TEXTURE_2D);
  const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,f};};
const FA=mkF();
const up=(t,c)=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);};
const U=(p,n)=>gl.getUniformLocation(p,n);
// свет: Lp — позиция главного света в дизайн-координатах экрана (x,y) и высота z (ед. дизайна), Lc — цвет×сила
E.L0=()=>({Lp:[300,300,700],Lc:[2.2,1.7,1.2],L2p:[800,1500,400],L2c:[0,0,0],ambC:[.5,.55,.7],amb:.35,Fd:[-.4,-.6,.7],Fc:[.12,.14,.2],HS:34,spark:1});
E.FX0=()=>({focus:.5,dof:40,maxR:22,bloom:1,exposure:1,vig:.8,grain:.03,fade:1,warm:.3});
E.reset=()=>{E.L=E.L0();E.FX=E.FX0();E.cam={x:W/2,y:H/2,z:1,r:0};E.st={m:0,e:0,d:.5};};
E.reset();
const v3=a=>new Float32Array(a);
E.present=t=>{up(TX.C,CV.C);up(TX.H,CV.H);up(TX.M,CV.M);
  gl.bindFramebuffer(gl.FRAMEBUFFER,FA.f);gl.viewport(0,0,OW,OH);gl.useProgram(P1);gl.bindVertexArray(vao);
  [['C',0],['Hh',1],['M',2]].forEach(([k,i])=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,TX[k=='Hh'?'H':k]);gl.uniform1i(U(P1,k),i);});
  const L=E.L;const sp=a=>[a[0]*S,a[1]*S,a[2]*S];
  gl.uniform3fv(U(P1,'Lp'),v3(sp(L.Lp)));gl.uniform3fv(U(P1,'Lc'),v3(L.Lc));gl.uniform3fv(U(P1,'L2p'),v3(sp(L.L2p)));gl.uniform3fv(U(P1,'L2c'),v3(L.L2c));
  gl.uniform3fv(U(P1,'ambC'),v3(L.ambC));gl.uniform1f(U(P1,'amb'),L.amb);gl.uniform3fv(U(P1,'Fd'),v3(L.Fd));gl.uniform3fv(U(P1,'Fc'),v3(L.Fc));
  gl.uniform1f(U(P1,'HS'),L.HS*S*E.cam.z);gl.uniform1f(U(P1,'spark'),L.spark);
  gl.uniform1f(U(P1,'time'),t);gl.uniform2f(U(P1,'res'),OW,OH);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindTexture(gl.TEXTURE_2D,FA.t);gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,OW,OH);gl.useProgram(P2);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FA.t);gl.uniform1i(U(P2,'A'),0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,TX.M);gl.uniform1i(U(P2,'M'),1);
  const F=E.FX;for(const k of['focus','dof','bloom','exposure','vig','grain','fade','warm','maxR'])gl.uniform1f(U(P2,k),F[k]);
  gl.uniform1f(U(P2,'time'),t);gl.uniform2f(U(P2,'res'),OW,OH);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
E.camZ=()=>Math.sqrt(E.cam.z);
E.grab=()=>{const a=new Uint8Array(OW*OH*4);gl.readPixels(0,0,OW,OH,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
window.E=E;
})();
