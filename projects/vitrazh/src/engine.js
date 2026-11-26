// E — движок «живого витража». Мир рисуется кусками стекла в три холста, шейдер «просвечивает» их светом сзади.
// G: цвет стекла (RGB).  M: R=свинец, G=гризайль (краска), B=номер куска (семя фактуры).  T: R=тип стекла (0 собор, .5 опал, 1 непрозрачно),
// G=силуэт (интерьер), B=свечение (искры, блики). Дизайн 1080×1920, вывод 720×1280.
(function(){
const W=1080,H=1920,OW=720,OH=1280,S=OW/W;
const mk=()=>{const c=document.createElement('canvas');c.width=OW;c.height=OH;return c;};
const CV={G:mk(),M:mk(),T:mk()};const X={G:CV.G.getContext('2d'),M:CV.M.getContext('2d'),T:CV.T.getContext('2d')};
const XS=[X.G,X.M,X.T];CV.O=mk();X.O=CV.O.getContext('2d');
const E={W,H,S,CV,X,cam:{x:W/2,y:H/2,z:1,r:0}};
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
// ---------- трансформы на все три холста ----------
E.save=()=>XS.forEach(x=>x.save());E.restore=()=>XS.forEach(x=>x.restore());
E.tr=(x,y)=>XS.forEach(c=>c.translate(x,y));E.rot=a=>XS.forEach(c=>c.rotate(a));E.sc=(a,b=a)=>XS.forEach(c=>c.scale(a,b));
E.xf=(x,y,r=0,s=1,f)=>{E.save();E.tr(x,y);if(r)E.rot(r);if(s!=1)E.sc(s);f();E.restore();};
E.clip=p=>XS.forEach(c=>c.clip(p));
E.scaleNow=()=>{const m=X.G.getTransform();return Math.sqrt(m.a*m.a+m.b*m.b)/S;};
E.clear=()=>{X.O.setTransform(1,0,0,1,0,0);X.O.clearRect(0,0,OW,OH);for(const x of XS){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.filter='none';x.fillStyle='#000';x.fillRect(0,0,OW,OH);}};
E.view=(par=1)=>{const c=E.cam,z=1+(c.z-1)*par;const m=new DOMMatrix();m.scaleSelf(S,S);m.translateSelf(W/2,H/2);if(c.r)m.rotateSelf(c.r*par*57.3);m.scaleSelf(z,z);
  m.translateSelf(-W/2-(c.x-W/2)*par,-H/2-(c.y-H/2)*par);for(const x of XS)x.setTransform(m);};
E.screen=()=>{const m=new DOMMatrix().scaleSelf(S,S);for(const x of XS)x.setTransform(m);};
// ---------- пути ----------
E.P=pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();return p;};
E.Pr=(x,y,w,h)=>{const p=new Path2D();p.rect(x,y,w,h);return p;};
E.Pe=(x,y,rx,ry,a=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry||rx,a,0,Math.PI*2);return p;};
// гладкий замкнутый путь по точкам (Catmull-Rom)
E.Ps=(pts,closed=true)=>{const p=new Path2D();const n=pts.length;const g=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
  p.moveTo(pts[0][0],pts[0][1]);const m=closed?n:n-1;for(let i=0;i<m;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
    p.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(closed)p.closePath();return p;};
// стрельчатая арка (окно)
E.Parch=(x,y,w,h,pt=1)=>{const p=new Path2D();const r=w*pt;p.moveTo(x,y+h);p.lineTo(x,y+w*.5*1.0+ (r>w?0:0));
  const top=y,cy=y+w*.86;p.lineTo(x,cy);p.arcTo(x,top+w*.3,x+w/2,top,w*.9);p.lineTo(x+w/2,top);p.arcTo(x+w,top+w*.3,x+w,cy,w*.9);p.lineTo(x+w,y+h);p.closePath();return p;};
// ---------- стекло ----------
let SEED=1;E.seed=s=>{SEED=s;};
E.LW=10; // ширина свинца в дизайн-пикселях экрана
// piece(path, color|gradient|fn(ctx)->style, {tex, seed, lead, lw, emit})
E.PIDX=0;E.ASM=null;E.ASMQ=[];E.PAPER='#e9dcbc';
E.SIL=0;
E.piece=(p,col,o={})=>{if(E.SIL){E.occ(p);return;}
  if(E.ASM&&!o.noasm){const idx=E.PIDX++;const a=E.ASM(idx);
    if(a.u<1){const sv=E.ASM;E.ASM=null;E.piece(p,E.PAPER,{tex:.6,lead:false,seed:.5});E.ppath(p,2.2/E.scaleNow(),.75);
      if(a.u>0){const m=E.X.G.getTransform();E.ASMQ.push({p,col,o,m,a});}E.ASM=sv;return;}}
  const sd=o.seed!=null?o.seed:E.rnd(SEED++*1.37);
  X.G.fillStyle=typeof col=='function'?col(X.G):(col instanceof CanvasGradient?col:E.rgb(col));X.G.fill(p);
  X.M.fillStyle=`rgb(0,0,${Math.round(sd*255)})`;X.M.fill(p);
  X.T.fillStyle=`rgb(${Math.round((o.tex||0)*255)},${Math.round((o.occ||0)*255)},${Math.round((o.emit||0)*255)})`;X.T.fill(p);
  if(o.lead!==false)E.lead(p,o.lw);};
E.lead=(p,lw)=>{if(E.SIL||(E.ASM&&E.ASMlead===false))return;const k=E.scaleNow();const w=(lw||E.LW)/k;X.M.lineJoin='round';X.M.lineWidth=w;X.M.strokeStyle='rgb(255,0,0)';
  X.M.globalCompositeOperation='lighten';X.M.stroke(p);X.M.globalCompositeOperation='source-over';
  X.T.lineWidth=w;X.T.strokeStyle='rgb(255,0,0)';X.T.stroke(p);};
E.leadLine=(pts,lw)=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));E.lead(p,lw);};
// летящие куски сборки — поверх всего
E.flushASM=()=>{const q=E.ASMQ;E.ASMQ=[];const sv=E.ASM;E.ASM=null;for(const it of q){const{p,col,o,m,a}=it;const f=1-E.eo(a.u);
  for(const x of XS){x.save();x.setTransform(1,0,0,1,0,0);x.translate(a.dx*f*S,a.dy*f*S);x.transform(m.a,m.b,m.c,m.d,m.e,m.f);}
  E.piece(p,col,Object.assign({},o,{lead:a.u>.85}));E.emit(p,(1-a.u)*.35);XS.forEach(x=>x.restore());}E.ASM=sv;};
// линейный градиент цвета стекла
E.lg=(x0,y0,x1,y1,stops)=>{const g=X.G.createLinearGradient(x0,y0,x1,y1);stops.forEach(([t,c])=>g.addColorStop(t,E.rgb(c)));return g;};
E.rg=(x,y,r0,r1,stops)=>{const g=X.G.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([t,c])=>g.addColorStop(t,E.rgb(c)));return g;};
// ---------- гризайль (краска по стеклу) ----------
const pc=d=>`rgb(0,${Math.round(E.cl(d)*255)},0)`;
E.pfill=(p,d=1)=>{if(E.SIL)return;X.M.globalCompositeOperation='lighter';X.M.fillStyle=typeof d=='number'?pc(d):d;X.M.fill(p);X.M.globalCompositeOperation='source-over';};
E.pline=(pts,w=4,d=1,smooth=false)=>{if(E.SIL)return;const p=smooth?E.Ps(pts,false):(()=>{const q=new Path2D();pts.forEach((v,i)=>i?q.lineTo(v[0],v[1]):q.moveTo(v[0],v[1]));return q;})();
  X.M.globalCompositeOperation='lighter';X.M.lineCap='round';X.M.lineJoin='round';X.M.lineWidth=w;X.M.strokeStyle=pc(d);X.M.stroke(p);X.M.globalCompositeOperation='source-over';};
E.ppath=(p,w=4,d=1)=>{if(E.SIL)return;X.M.globalCompositeOperation='lighter';X.M.lineCap='round';X.M.lineJoin='round';X.M.lineWidth=w;X.M.strokeStyle=pc(d);X.M.stroke(p);X.M.globalCompositeOperation='source-over';};
// мягкая тень-«матовка» (радиальный градиент краски)
E.pmatte=(x,y,r,d=.5,clipP)=>{if(E.SIL)return;const g=X.M.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,pc(d));g.addColorStop(1,pc(0));X.M.save();if(clipP)X.M.clip(clipP);
  X.M.globalCompositeOperation='lighter';X.M.fillStyle=g;X.M.fillRect(x-r,y-r,2*r,2*r);X.M.restore();};
E.pgrad=(clipP,x0,y0,x1,y1,d0,d1)=>{if(E.SIL)return;const g=X.M.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,pc(d0));g.addColorStop(1,pc(d1));X.M.save();X.M.clip(clipP);
  X.M.globalCompositeOperation='lighter';X.M.fillStyle=g;X.M.fill(clipP);X.M.restore();};
E.pvig=(clipP,x,y,r0,r1,d=.4)=>{if(E.SIL)return;const g=X.M.createRadialGradient(x,y,r0,x,y,r1);g.addColorStop(0,pc(0));g.addColorStop(1,pc(d));X.M.save();X.M.clip(clipP);
  X.M.globalCompositeOperation='lighter';X.M.fillStyle=g;X.M.fill(clipP);X.M.restore();};
// снять краску (процарапать — блик, «выскобленный» свет)
E.pscratch=(pts,w=3)=>{if(E.SIL)return;const q=new Path2D();pts.forEach((v,i)=>i?q.lineTo(v[0],v[1]):q.moveTo(v[0],v[1]));X.M.save();X.M.globalCompositeOperation='multiply';X.M.lineCap='round';
  X.M.lineWidth=w;X.M.strokeStyle='rgb(255,0,255)';X.M.stroke(q);X.M.restore();};
// свечение (искры, блики) — в T.B
E.emit=(p,d=1)=>{X.T.save();X.T.globalCompositeOperation='lighter';X.T.fillStyle=`rgb(0,0,${Math.round(E.cl(d)*255)})`;X.T.fill(p);X.T.restore();};
E.emitDot=(x,y,r,d=1)=>{const g=X.T.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgb(0,0,${Math.round(E.cl(d)*255)})`);g.addColorStop(1,'rgb(0,0,0)');
  X.T.save();X.T.globalCompositeOperation='lighter';X.T.fillStyle=g;X.T.fillRect(x-r,y-r,2*r,2*r);X.T.restore();};
// силуэт (интерьер собора): T.G
E.occ=(p,d=1)=>{X.T.save();X.T.globalCompositeOperation='lighten';X.T.fillStyle=`rgb(0,${Math.round(d*255)},0)`;X.T.fill(p);X.T.restore();};
// ---------- мозаика: область, разбитая на куски ----------
// mosaic(path, bbox[x,y,w,h], cell, colorFn(x,y,i)->rgb, {tex, jit, seed, rot})
E.mosaic=(region,bb,cell,colorFn,o={})=>{const[x0,y0,w,h]=bb;const nx=Math.ceil(w/cell)+1,ny=Math.ceil(h/(cell*(o.ky||1)))+1;const jit=o.jit==null?.38:o.jit;const sd=o.seed||7;
  const V=(i,j)=>{const ex=(i<=0||i>=nx)?0:1,ey=(j<=0||j>=ny)?0:1;return[x0+i*cell+(E.rnd(i*31.7+j*7.3+sd)-.5)*2*jit*cell*ex,y0+j*cell*(o.ky||1)+(E.rnd(i*13.1+j*57.9+sd*3)-.5)*2*jit*cell*ey*(o.ky||1)];};
  E.save();E.clip(region);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=V(i,j),b=V(i+1,j),c=V(i+1,j+1),d=V(i,j+1);const k=i*131+j*71+sd;
    const tri=E.rnd(k*.71)<(o.split==null?.35:o.split);
    const polys=tri?(E.rnd(k*.33)<.5?[[a,b,c],[a,c,d]]:[[a,b,d],[b,c,d]]):[[a,b,c,d]];
    polys.forEach((pg,q)=>{const cx=pg.reduce((s,v)=>s+v[0],0)/pg.length,cy=pg.reduce((s,v)=>s+v[1],0)/pg.length;
      E.piece(E.P(pg),colorFn(cx,cy,k*2+q),{tex:o.tex||0,seed:E.rnd(k*2+q+sd),noasm:o.noasm});});}
  E.restore();E.lead(region,o.lw);};
// случайный разброс оттенка
E.jit=(c,k,amt=.1)=>{c=typeof c=='string'?E.hex(c):c;const r=(E.rnd(k)-.5)*2*amt;return c.map(x=>E.cl(x*(1+r),0,255));};
// ---------- текст на ленте (филактерия) ----------
E.font=(px,w=700,fam='Cinzel')=>`${w} ${px}px ${fam}`;
// banner(lines, cx, cy, {size, w, col, t:появление 0..1})
E.banner=(lines,cx,cy,o={})=>{if(typeof lines=='string')lines=[lines];const sz=o.size||64;const ap=o.ap==null?1:o.ap;if(ap<=0)return;
  X.G.font=X.M.font=E.font(sz,o.weight||700,o.fam||'Cinzel');let lw=Math.max(...lines.map(l=>X.M.measureText(l).width));
  const mw=(o.maxw||940)-sz*1.6;if(lw>mw){const k=mw/lw;return E.banner(lines,cx,cy,Object.assign({},o,{size:Math.floor(sz*k),maxw:o.maxw||940}));}
  const bw=Math.min(o.maxw||960,lw+sz*1.6),lh=sz*1.22,bh=lines.length*lh+sz*.7;const ww=bw*E.eo(ap);
  E.save();E.tr(cx,cy);if(o.rot)E.rot(o.rot);
  const wav=x=>Math.sin(x/bw*Math.PI*2+(o.ph||0))*sz*.12;
  const top=[],bot=[];for(let i=0;i<=12;i++){const x=-ww/2+ww*i/12;top.push([x,-bh/2+wav(x)]);bot.push([x,bh/2+wav(x)]);}
  const body=E.P(top.concat(bot.reverse()));
  // хвосты ленты
  const tail=(s)=>{const x=s*ww/2,y=wav(x);return E.P([[x,y-bh/2+sz*.25],[x+s*sz*.9,y-bh/2+sz*.1],[x+s*sz*.45,y],[x+s*sz*.9,y+bh/2+sz*.15],[x,y+bh/2-sz*.1]]);};
  const c=o.col||'#efe2b8';E.piece(tail(-1),E.shade(c,.72),{tex:.35});E.piece(tail(1),E.shade(c,.72),{tex:.35});
  E.piece(body,c,{tex:.35,seed:.37});
  E.pgrad(body,0,-bh/2,0,bh/2,.05,.22);
  X.M.save();X.M.clip(body);X.M.globalCompositeOperation='lighter';X.M.fillStyle=pc(o.ink==null?1:o.ink);X.M.textAlign='center';X.M.textBaseline='middle';
  const vis=E.cl((ap-.25)/.75);
  lines.forEach((l,i)=>{const y=(i-(lines.length-1)/2)*lh+sz*.06;const n=Math.floor(l.length*vis+.999);const s=l.slice(0,n);
    const x0=-X.M.measureText(l).width/2;X.M.textAlign='left';X.M.fillText(s,x0,y+wav(0));});
  X.M.restore();E.restore();};
// надпись поверх (интерьер): пергаментная лента
E.obanner=(lines,cx,cy,o={})=>{if(typeof lines=='string')lines=[lines];const ap=o.ap==null?1:o.ap;if(ap<=0)return;const x=X.O;const sz=o.size||56;
  x.save();x.setTransform(S,0,0,S,0,0);x.font=E.font(sz);const lw=Math.max(...lines.map(l=>x.measureText(l).width));const bw=(lw+sz*1.6)*E.eo(ap),bh=lines.length*sz*1.22+sz*.7;
  x.globalAlpha=E.cl(ap*1.5);x.shadowColor='rgba(255,200,120,.5)';x.shadowBlur=30*S;x.fillStyle='#e6d6ae';x.beginPath();
  for(let i=0;i<=12;i++){const xx=cx-bw/2+bw*i/12;x.lineTo(xx,cy-bh/2+Math.sin(i/12*6.28)*sz*.12);}for(let i=12;i>=0;i--){const xx=cx-bw/2+bw*i/12;x.lineTo(xx,cy+bh/2+Math.sin(i/12*6.28)*sz*.12);}
  x.closePath();x.fill();x.shadowBlur=0;x.lineWidth=6;x.strokeStyle='#1a1410';x.stroke();
  x.fillStyle='#2a1c12';x.textAlign='center';x.textBaseline='middle';const vis=E.cl((ap-.25)/.75);
  lines.forEach((l,i)=>{const y=cy+(i-(lines.length-1)/2)*sz*1.22;const n=Math.floor(l.length*vis+.999);x.textAlign='left';x.fillText(l.slice(0,n),cx-x.measureText(l).width/2,y);});x.restore();};
// ---------- WebGL ----------
const cv=document.getElementById('c');cv.width=OW;cv.height=OH;
const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false,premultipliedAlpha:false});
E.gl=gl;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
const prog=(vs,fs)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;};
const VQ=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0,1);}`;
const NOISE=`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
`;
// проход 1: стекло на свету
const FS1=`#version 300 es
precision highp float;in vec2 uv;out vec4 o;
uniform sampler2D G,M,T;uniform float time;
uniform vec3 skyT,skyB,sunC,lampC;uniform vec3 sun;uniform vec4 lamp;uniform float light,amb;uniform vec2 res;
${NOISE}
vec3 back(vec2 p){ // свет за стеклом, p в 0..1 (y вверх)
  vec2 q=vec2(p.x,p.y*1.778);
  vec3 c=mix(skyB,skyT,smoothstep(0.,1.,p.y));
  float d=length(q-vec2(sun.x,sun.y*1.778));
  c+=sunC*(exp(-d*d/(sun.z*sun.z))*2.2+exp(-d/(sun.z*3.))*.6);
  float dl=length(q-vec2(lamp.x,lamp.y*1.778));
  c+=lampC*lamp.w*(exp(-dl*dl/(lamp.z*lamp.z))*1.6+exp(-dl/(lamp.z*2.5))*.7);
  return c*light+amb;}
void main(){
  vec2 f=vec2(uv.x,1.-uv.y);
  vec3 g=texture(G,f).rgb;vec4 m=texture(M,f);vec3 t=texture(T,f).rgb;
  float lead=m.r,paint=m.g,sd=m.b,tex=t.r;
  // фактура: волнистое собор-стекло, пузырьки
  vec2 pp=uv*res/res.y*7.;
  float rot=sd*6.28;mat2 R=mat2(cos(rot),-sin(rot),sin(rot),cos(rot));
  vec2 qq=R*pp*vec2(1.,2.6)+sd*40.;
  float n=fbm(qq*1.7);float n2=fbm(pp*9.+sd*13.);
  vec2 grad=vec2(fbm(qq*1.7+vec2(.05,0))-n,fbm(qq*1.7+vec2(0,.05))-n)*18.;
  vec2 off=grad*.012+vec2(n2-.5)*.004;
  vec3 b=back(uv+off);
  // толщина: каждый кусок свой тон
  float th=.72+.55*n+(sd-.5)*.38;
  vec3 gl=pow(g,vec3(2.2));float lu=dot(gl,vec3(.3,.55,.15));gl=max(mix(vec3(lu),gl,1.3),0.);
  float stk=vn(R*pp*vec2(.5,7.)+sd*7.);gl*=.82+.36*stk;
  gl*=mix(vec3(1.),vec3(1.06,.97,.92),vn(R*pp*.8+3.)); 
  vec3 tr=gl*b*th;
  // опал: молочное рассеяние
  vec3 milky=gl*(dot(back(uv),vec3(.33))*.9+.05);
  tr=mix(tr,milky,smoothstep(.2,.6,tex)*.75);
  // пузырьки
  vec2 bp=pp*6.+sd*91.;vec2 bi=floor(bp);float hb=h21(bi);vec2 bf=fract(bp)-.5-vec2(h21(bi+3.1),h21(bi+7.7))*.5+.25;
  float bub=step(.86,hb)*smoothstep(.13,.05,length(bf))*(1.-smoothstep(.0,.04,abs(length(bf)-.08)));
  tr*=1.+bub*.9;
  // грязь у свинца
  float lb=textureLod(M,f,3.).r;float lb2=textureLod(M,f,1.5).r;
  tr*=1.-clamp(lb*.85,0.,.55);
  // гризайль: кистевая фактура краски
  float pn=.85+.3*vn(pp*28.+sd*5.)+.15*vn(pp*90.);
  float pd=clamp(paint*pn,0.,1.);
  tr*=1.-pd*.94;
  tr+=gl*b*.02*pd; // краска чуть прозрачна
  // непрозрачное (дерево, камень) — свет спереди тусклый
  tr=mix(tr,gl*(amb*2.+.06*light)*(.8+.4*n),step(.95,tex));
  // свинец: тёмный, с бликом спереди
  float dx=textureLod(M,f+vec2(1.5/res.x,0),1.).r-textureLod(M,f-vec2(1.5/res.x,0),1.).r;
  float dy=textureLod(M,f+vec2(0,1.5/res.y),1.).r-textureLod(M,f-vec2(0,1.5/res.y),1.).r;
  float spec=clamp(-dx*.7-dy*.9,0.,1.);
  vec3 lc=vec3(.012,.013,.015)*(.7+.6*vn(pp*30.))+vec3(.5,.47,.42)*pow(spec,2.5)*(.18+amb*3.)*(.4+light*.6);
  float L=smoothstep(.35,.75,lead);
  vec3 col=mix(tr,lc,L);
  col+=pow(t.b,1.5)*vec3(1.,.82,.55)*3.2; // свечение
  o=vec4(col,1.);}`;
// проход 2: ореол, интерьер, плёнка → экран
const FS2=`#version 300 es
precision highp float;in vec2 uv;out vec4 o;
uniform sampler2D A,T,SN,OV;uniform float time,room,bloom,fade,grain,snap;uniform vec4 win;uniform vec2 res;uniform float exposure,vig,rays;
${NOISE}
vec3 tex(vec2 p,float l){return textureLod(A,p,l).rgb;}
vec3 glow(vec2 p){return tex(p,2.)*.25+tex(p,3.)*.25+tex(p,4.)*.22+tex(p,5.)*.18+tex(p,6.5)*.12;}
vec3 tm(vec3 c){c*=exposure;vec3 m=1.-exp(-c*1.25);float l=max(max(c.r,c.g),c.b);m=mix(m,vec3(1.-exp(-l*1.25)),smoothstep(1.5,5.,l)*.6);return pow(m,vec3(1./2.2));}
void main(){
  vec2 p=uv;vec3 c;
  if(room<.5){
    c=tex(p,0.)+glow(p)*bloom;
  }else{
    // интерьер: окно win=(x0,y0,x1,y1) в uv экрана (y вверх)
    vec2 wu=(p-win.xy)/(win.zw-win.xy);
    float inside=step(0.,wu.x)*step(wu.x,1.)*step(0.,wu.y)*step(wu.y,1.);
    float w=win.z-win.x;
    // арка сверху
    vec3 wcol=tex(wu,0.)+glow(wu)*bloom;
    // каменная стена
    vec2 sp=p*res/res.y*vec2(9.,9.);vec2 br=vec2(sp.x+floor(sp.y)*.5,sp.y);vec2 bf=fract(br);
    float mortar=smoothstep(.0,.06,bf.x)*smoothstep(1.,.94,bf.x)*smoothstep(.0,.09,bf.y)*smoothstep(1.,.91,bf.y);
    float st=(.55+.45*h21(floor(br)))*(.7+.3*fbm(sp*3.))*mortar;
    vec3 avg=tex(vec2(.5),8.)*1.;
    float dw=length((p-vec2((win.x+win.z)*.5,(win.y+win.w)*.5))*vec2(1.,1.778));
    vec3 wall=vec3(.06,.055,.05)*st*(.25+avg*2.2*exp(-dw*2.2));
    // пол: проекция окна
    float fy=win.y-.04;
    float fl=step(p.y,fy);
    float d=clamp((fy-p.y)/fy,0.,1.);
    vec2 fu=vec2(.5+(p.x-.5)/(.55+d*1.6)*1.15+ .0, 1.-d*1.05);
    vec3 proj=glow(fu)*1.25*smoothstep(1.02,.9,d)*step(0.,fu.x)*step(fu.x,1.)*step(0.,fu.y);
    vec2 fp=vec2(p.x/(.15+d),d*7.);float tile=.75+.25*h21(floor(fp*3.));
    vec3 floorc=(vec3(.05,.045,.04)*.4+proj*.95)*tile*(.8+.2*fbm(fp*4.));
    c=mix(wall,floorc,fl);
    c=mix(c,wcol,inside);
    // лучи в пыли: от окна вниз
    vec3 ray=vec3(0.);vec2 wc=vec2((win.x+win.z)*.5,(win.y+win.w)*.5);
    for(int i=0;i<18;i++){float k=float(i)/18.;vec2 q=mix(p,wc,k*.9);vec2 u2=(q-win.xy)/(win.zw-win.xy);
      float ins=step(0.,u2.x)*step(u2.x,1.)*step(0.,u2.y)*step(u2.y,1.);ray+=tex(clamp(u2,0.,1.),5.)*ins;}
    float dust=.7+.6*fbm(p*vec2(6.,3.)+vec2(time*.03,-time*.05));
    c+=ray/18.*rays*dust*(1.-inside)*smoothstep(.0,.5,1.-length(p-wc));
    // силуэты
    vec4 ts=texture(T,vec2(p.x,1.-p.y));float occ=ts.g;
    float occL=texture(T,vec2(p.x-2.5/res.x,1.-p.y)).g,occR=texture(T,vec2(p.x+2.5/res.x,1.-p.y)).g,occU=texture(T,vec2(p.x,1.-p.y-3./res.y)).g;
    float rim=clamp(occ-min(min(occL,occR),occU),0.,1.);
    vec3 lit=glow(fu)*.9+avg*.6;
    c=mix(c,vec3(.012,.011,.012)+lit*.06,occ)+rim*lit*2.2*occ;
    c+=pow(ts.b,1.5)*vec3(1.,.85,.6)*3.;
    c+=glow(p)*0.;
  }
  // снимок (переход)
  vec3 col=tm(c);
  vec2 q=p-.5;col*=1.-dot(q,q)*vig;
  col+=(h21(p*res+fract(time*7.)*91.)-.5)*grain;
  vec4 ov=texture(OV,vec2(p.x,1.-p.y));col=mix(col,ov.rgb,ov.a);
  col*=fade;
  o=vec4(col,1.);}`;
// осколки (переход): треугольники с текстурой снимка
const VS3=`#version 300 es
in vec3 p;in vec2 t;in float sh;out vec2 uv;out float s;uniform vec2 res;
void main(){uv=t;s=sh;float f=2.4;vec2 c=vec2(.5*res.x,.5*res.y);vec2 q=(p.xy-c)*f/(f-min(p.z/res.y,1.6))+c;gl_Position=vec4(q/res*2.-1.,0.,1.);gl_Position.y*=-1.;}`;
const FS3=`#version 300 es
precision highp float;in vec2 uv;in float s;out vec4 o;uniform sampler2D SN;
void main(){vec3 c=textureLod(SN,vec2(uv.x,1.-uv.y),0.).rgb;c=c*(.55+.6*s)+vec3(1.,.95,.85)*pow(max(s-.75,0.)*4.,3.)*.6;o=vec4(c,1.);}`;
const P1=prog(VQ,FS1),P2=prog(VQ,FS2),P3=prog(VS3,FS3);
const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const vao=gl.createVertexArray();gl.bindVertexArray(vao);const lp=gl.getAttribLocation(P1,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
const mkT=(mip)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
const TX={G:mkT(false),M:mkT(true),T:mkT(false),O:mkT(false)};
const ext=gl.getExtension('EXT_color_buffer_float');
const mkF=()=>{const t=mkT(true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,OW,OH,0,gl.RGBA,gl.HALF_FLOAT,null);gl.generateMipmap(gl.TEXTURE_2D);
  const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,f};};
const FA=mkF(),FS=mkF(); // FA — стекло, FS — снимок экрана для осколков (LDR)
const up=(t,c,mip)=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);if(mip)gl.generateMipmap(gl.TEXTURE_2D);};
const U=(p,n)=>gl.getUniformLocation(p,n);
// свет по умолчанию
E.LIGHT0=()=>({skyT:[.55,.75,1],skyB:[.95,.9,.8],sunC:[1,.9,.7],sun:[.7,.8,.12],lampC:[1,.6,.25],lamp:[.5,.5,.2,0],light:1,amb:.004});
E.L=E.LIGHT0();
E.FX0=()=>({room:0,bloom:.55,fade:1,grain:.025,exposure:1.15,vig:.9,rays:1,win:[.3,.45,.7,.9]});
E.FX=E.FX0();
E.reset=()=>{E.SIL=0;E.ASMlead=true;E.PIDX=0;E.ASM=null;E.ASMQ=[];E.L=E.LIGHT0();E.FX=E.FX0();E.cam={x:W/2,y:H/2,z:1,r:0};E.shatter=null;SEED=1;};
const v3=a=>new Float32Array(a);
const pass=(t,target)=>{
  up(TX.G,CV.G,false);up(TX.M,CV.M,true);up(TX.T,CV.T,false);
  gl.bindFramebuffer(gl.FRAMEBUFFER,FA.f);gl.viewport(0,0,OW,OH);gl.useProgram(P1);gl.bindVertexArray(vao);
  [['G',0],['M',1],['T',2]].forEach(([k,i])=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,TX[k]);gl.uniform1i(U(P1,k),i);});
  const L=E.L;gl.uniform3fv(U(P1,'skyT'),v3(L.skyT));gl.uniform3fv(U(P1,'skyB'),v3(L.skyB));gl.uniform3fv(U(P1,'sunC'),v3(L.sunC));gl.uniform3fv(U(P1,'sun'),v3(L.sun));
  gl.uniform3fv(U(P1,'lampC'),v3(L.lampC));gl.uniform4fv(U(P1,'lamp'),v3(L.lamp));gl.uniform1f(U(P1,'light'),L.light);gl.uniform1f(U(P1,'amb'),L.amb);
  gl.uniform1f(U(P1,'time'),t);gl.uniform2f(U(P1,'res'),OW,OH);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindTexture(gl.TEXTURE_2D,FA.t);gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.viewport(0,0,OW,OH);gl.useProgram(P2);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FA.t);gl.uniform1i(U(P2,'A'),0);
  gl.activeTexture(gl.TEXTURE2);up(TX.O,CV.O,false);gl.uniform1i(U(P2,'OV'),2);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,TX.T);gl.uniform1i(U(P2,'T'),1);
  const F=E.FX;gl.uniform1f(U(P2,'time'),t);gl.uniform1f(U(P2,'room'),F.room);gl.uniform1f(U(P2,'bloom'),F.bloom);gl.uniform1f(U(P2,'fade'),F.fade);
  gl.uniform1f(U(P2,'grain'),F.grain);gl.uniform1f(U(P2,'exposure'),F.exposure);gl.uniform1f(U(P2,'vig'),F.vig);gl.uniform1f(U(P2,'rays'),F.rays);
  gl.uniform4fv(U(P2,'win'),v3(F.win));gl.uniform2f(U(P2,'res'),OW,OH);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
// ---------- осколки ----------
// shatter = {cx,cy (дизайн), u (0..1 прогресс), seed, draw:()=>{} рисует сцену-снимок, back: флаг — сцена за осколками рисуется обычным кадром}
const sb=gl.createBuffer();const svao=gl.createVertexArray();gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,sb);
[['p',3,0],['t',2,3],['sh',1,5]].forEach(([n,k,o])=>{const l=gl.getAttribLocation(P3,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,k,gl.FLOAT,false,24,o*4);});
E.shards=(cx,cy,seed=3)=>{ // сетка: лучи от удара × кольца
  const NA=15,R=[0,26,70,140,250,420,700,1100,1800,2600];const ang=[];for(let i=0;i<NA;i++)ang.push((i+(E.rnd(i*9.1+seed)-.5)*.7)/NA*Math.PI*2);
  const V=(i,j)=>{const a=ang[(i+NA)%NA]+(i>=NA?Math.PI*2:0),r=R[j]*(j?(.82+.36*E.rnd(i*3.3+j*7.7+seed)):0);return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
  const out=[];for(let j=0;j<R.length-1;j++)for(let i=0;i<NA;i++){const a=V(i,j),b=V(i+1,j),c=V(i+1,j+1),d=V(i,j+1);
    if(j>0&&E.rnd(i*5.1+j*2.3+seed)<.5){out.push([a,b,c]);out.push([a,c,d]);}else out.push(j==0?[a,c,d]:[a,b,c,d]);}
  return out.map((pg,k)=>{const c=[pg.reduce((s,v)=>s+v[0],0)/pg.length,pg.reduce((s,v)=>s+v[1],0)/pg.length];return{pg,c,k,r:E.rnd(k*1.7+seed)};});};
const drawShards=(sh)=>{const{cx,cy,u}=sh;const list=sh.list||(sh.list=E.shards(cx,cy,sh.seed||3));const data=[];
  for(const s of list){const dx=s.c[0]-cx,dy=s.c[1]-cy,dist=Math.hypot(dx,dy)+1;const del=Math.min(.25,dist/4000);const k=E.cl((u-del)/(1-del));if(sh.hold&&dist>sh.hold&&u<1){}
    const sp=(1200+s.r*900)/Math.sqrt(dist/200+1);const tt=k*1.2;
    const mx=dx/dist*sp*tt*(sh.out||1)*.6,my=dy/dist*sp*tt*.5+1800*tt*tt*(sh.grav==null?1:sh.grav),mz=(sh.toward||650)*tt*(1+s.r*.6);
    const ax=(E.rnd(s.k*3.1)-.5)*9*tt,ay=(E.rnd(s.k*4.7)-.5)*9*tt,az=(E.rnd(s.k*5.9)-.5)*5*tt;
    const ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sbb=Math.sin(ay),cc=Math.cos(az),sc=Math.sin(az);
    const rotv=(x,y,z)=>{let y1=y*ca-z*sa,z1=y*sa+z*ca;let x2=x*cb+z1*sbb,z2=-x*sbb+z1*cb;return[x2*cc-y1*sc,x2*sc+y1*cc,z2];};
    const nz=rotv(0,0,1);const shade=E.cl(Math.abs(nz[2])*.6+.4*Math.abs(Math.sin(ax*2+ay)) );
    const P=s.pg.map(v=>{const r=rotv(v[0]-s.c[0],v[1]-s.c[1],0);return[(s.c[0]+r[0]+mx)*S,(s.c[1]+r[1]+my)*S,(r[2]+mz)*S];});
    for(let i=1;i<P.length-1;i++)for(const q of[0,i,i+1]){const v=P[q],o=s.pg[q];data.push(v[0],v[1],v[2],o[0]/W,o[1]/H,shade);}}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,OW,OH);gl.useProgram(P3);gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,sb);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FS.t);gl.uniform1i(U(P3,'SN'),0);
  gl.uniform2f(U(P3,'res'),OW,OH);gl.drawArrays(gl.TRIANGLES,0,data.length/6);gl.bindVertexArray(vao);};
let snapKey=null;
// present(t): если задан E.shatter — сначала снимок старой сцены (кэш), потом текущая сцена, сверху осколки
E.present=t=>{const sh=E.shatter;
  if(sh&&sh.key!==snapKey){const keep=E.saveState();E.clear();E.reset();sh.draw();pass(t,FS.f);snapKey=sh.key;E.loadState(keep);}
  pass(t,null);
  if(sh&&sh.u>0&&sh.u<1.2)drawShards(sh);
  else if(sh&&sh.u<=0){gl.bindFramebuffer(gl.READ_FRAMEBUFFER,FS.f);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null);gl.blitFramebuffer(0,0,OW,OH,0,0,OW,OH,gl.COLOR_BUFFER_BIT,gl.NEAREST);}};
// сохранить/восстановить содержимое холстов (для снимка)
E.saveState=()=>({L:JSON.parse(JSON.stringify(E.L)),FX:JSON.parse(JSON.stringify(E.FX)),cam:{...E.cam},sh:E.shatter,img:XS.map(x=>{const c=document.createElement('canvas');c.width=OW;c.height=OH;c.getContext('2d').drawImage(x.canvas,0,0);return c;})});
E.loadState=s=>{E.L=s.L;E.FX=s.FX;E.cam=s.cam;E.shatter=s.sh;XS.forEach((x,i)=>{x.setTransform(1,0,0,1,0,0);x.drawImage(s.img[i],0,0);});};
E.grab=()=>{const a=new Uint8Array(OW*OH*4);gl.readPixels(0,0,OW,OH,gl.RGBA,gl.UNSIGNED_BYTE,a);const r=new Uint8Array(OW*OH*4);
  for(let y=0;y<OH;y++)r.set(a.subarray((OH-1-y)*OW*4,(OH-y)*OW*4),y*OW*4);return r;};
window.E=E;
})();
