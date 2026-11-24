// E — движок «живой гравюры укиё-э». Мир рисуется в 9 «досок» (каналы RGB трёх холстов), шейдер печатает их на васи.
// Дизайн-координаты 1080×1920, вывод 720×1280. Краски: id → [холст, канал].
(function(){
const W=1080,H=1920,OW=720,OH=1280,S=OW/W;
const INK={KEY:0,AI:1,BENI:2,KI:3,MIDORI:4,NEZU:5,MOMO:6,HADA:7,GOFUN:8};
const CH=i=>[Math.floor(i/3),i%3];
const L=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=OW;c.height=OH;return c;});
const X=L.map(c=>c.getContext('2d'));
const tmp=document.createElement('canvas');tmp.width=OW;tmp.height=OH;const TX=tmp.getContext('2d');
const E={W,H,INK,L,X,cam:{x:W/2,y:H/2,z:1,r:0},sil:null};
Object.assign(window,INK);
// ---------- служебное ----------
E.rnd=s=>{let x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
E.cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
E.lerp=(a,b,t)=>a+(b-a)*t;
E.ss=(a,b,t)=>{t=E.cl((t-a)/(b-a));return t*t*(3-2*t);};
E.eio=t=>{t=E.cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
E.eo=t=>1-Math.pow(1-E.cl(t),3);
E.ei=t=>Math.pow(E.cl(t),3);
E.back=t=>{t=E.cl(t);const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
// ключи: K(t,[[t0,v0,ease],[t1,v1,ease]...]) — значение между ключами с easing (ease на входе в ключ)
E.K=(t,ks)=>{if(t<=ks[0][0])return ks[0][1];for(let i=1;i<ks.length;i++){const[a,va]=ks[i-1],[b,vb,e]=ks[i];if(t<=b){const u=(t-a)/(b-a);const f=(e||E.eio)(u);
  if(Array.isArray(va))return va.map((x,j)=>x+(vb[j]-x)*f);return va+(vb-va)*f;}}return ks[ks.length-1][1];};
E.noise=(x)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return E.lerp(E.rnd(i),E.rnd(i+1),u)*2-1;};
// ---------- кадр ----------
E.clear=()=>{for(const x of X){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.filter='none';x.globalAlpha=1;x.fillStyle='#000';x.fillRect(0,0,OW,OH);}};
// вид: par — параллакс (0 — неподвижно, 1 — с камерой)
E.view=(par=1,ctx)=>{const c=E.cam,z=1+(c.z-1)*par;const m=new DOMMatrix();m.scaleSelf(S,S);m.translateSelf(W/2,H/2);m.rotateSelf(c.r*par*57.3);m.scaleSelf(z,z);
  m.translateSelf(-W/2-(c.x-W/2)*par,-H/2-(c.y-H/2)*par);E.M=m;for(const x of (ctx?[ctx]:X))x.setTransform(m);if(!ctx)TX.setTransform(m);};
E.screen=()=>{const m=new DOMMatrix().scaleSelf(S,S);E.M=m;for(const x of X)x.setTransform(m);TX.setTransform(m);};
const col=(c,v)=>{v=Math.round(E.cl(v)*255);return c==0?`rgb(${v},0,0)`:c==1?`rgb(0,${v},0)`:`rgb(0,0,${v})`;};
// спецификация краски: число (плотность) | {g:[x0,y0,x1,y1], s:[[t,d],...]} | {r:[x,y,r0,r1], s:[...]}
const style=(ctx,c,spec)=>{if(typeof spec=='number')return col(c,spec);
  let g=spec.g?ctx.createLinearGradient(...spec.g):ctx.createRadialGradient(spec.r[0],spec.r[1],spec.r[2],spec.r[0],spec.r[1],spec.r[3]);
  for(const[t,d]of spec.s)g.addColorStop(t,col(c,d));return g;};
E.blur=0;
// fill(path, {KEY:1, AI:{g..}}, carve=true): вырезать всё под формой (непрозрачный предмет) и напечатать свои краски
E.fill=(p,inks,carve=true)=>{
  if(E.sil){E.silFill(p);return;}
  if(carve)E.carve(p);
  for(const k in inks){const id=typeof k=='string'&&isNaN(k)?INK[k]:+k;const[ci,c]=CH(id);const x=X[ci];
    x.globalCompositeOperation='lighter';x.fillStyle=style(x,c,inks[k]);x.filter=E.blur?`blur(${E.blur*S}px)`:'none';x.fill(p);x.filter='none';}
};
E.carve=(p,only)=>{if(E.sil)return;for(let ci=0;ci<3;ci++){const x=X[ci];let m=[255,255,255],any=false;
  for(let c=0;c<3;c++){const id=ci*3+c;if(!only||only.includes(id)){m[c]=0;any=true;}}if(!any)continue;
  x.globalCompositeOperation='multiply';x.fillStyle=`rgb(${m})`;x.fill(p);}};
E.stroke=(p,id,w,d=1,cap='round')=>{if(E.sil){TX.lineWidth=w;TX.lineCap=cap;TX.lineJoin='round';TX.strokeStyle=E.silCol;TX.stroke(p);return;}
  const[ci,c]=CH(typeof id=='string'?INK[id]:id);const x=X[ci];x.globalCompositeOperation='lighter';x.strokeStyle=col(c,d);x.lineWidth=w;x.lineCap=cap;x.lineJoin='round';
  x.filter=E.blur?`blur(${E.blur*S}px)`:'none';x.stroke(p);x.filter='none';};
// силуэт: всё, что нарисует fn, ложится одной краской id плотностью d с размытием blur (тень на сёдзи)
E.silhouette=(id,d,blur,fn,clip)=>{TX.setTransform(1,0,0,1,0,0);TX.globalCompositeOperation='source-over';TX.clearRect(0,0,OW,OH);TX.setTransform(E.M);
  const[ci,c]=CH(id);E.silCol=col(c,1);E.sil={id};fn();E.sil=null;
  const x=X[ci];x.save();x.setTransform(1,0,0,1,0,0);if(clip){x.setTransform(E.M);x.clip(clip);x.setTransform(1,0,0,1,0,0);}
  x.globalCompositeOperation='lighter';x.globalAlpha=d;x.filter=blur?`blur(${blur*S}px)`:'none';x.drawImage(tmp,0,0);x.restore();};
E.silFill=p=>{TX.fillStyle=E.silCol;TX.fill(p);};
// кисть: полоса по точкам с переменной шириной (ключевая доска — «живая» линия)
E.brush=(pts,w0,w1,wm)=>{const p=new Path2D();const n=pts.length;if(n<2)return p;const L1=[],R1=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const u=i/(n-1);let w=E.lerp(w0,w1,u);if(wm!=null)w*=1+wm*Math.sin(u*Math.PI);w/=2;
    L1.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);R1.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);}
  p.moveTo(...L1[0]);for(const q of L1)p.lineTo(...q);for(let i=n-1;i>=0;i--)p.lineTo(...R1[i]);p.closePath();return p;};
E.line=(pts,w0,w1,wm,d=1,id=0)=>E.fill(E.brush(pts,w0,w1,wm),{[id]:d},false);
E.poly=(pts,close=true)=>{const p=new Path2D();p.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)p.lineTo(...pts[i]);if(close)p.closePath();return p;};
// гладкий контур через точки (Catmull-Rom)
E.smooth=(pts,close=true)=>{const p=new Path2D();const n=pts.length;const P=i=>pts[close?(i+n)%n:Math.max(0,Math.min(n-1,i))];
  p.moveTo(...P(0));const m=close?n:n-1;for(let i=0;i<m;i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
    p.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  if(close)p.closePath();return p;};
E.ell=(x,y,rx,ry,r=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry,r,0,Math.PI*2);return p;};
E.rect=(x,y,w,h)=>{const p=new Path2D();p.rect(x,y,w,h);return p;};
// контур с ключевой линией: заливка + обводка KEY
E.clipped=(p,fn)=>{const cs=[...X,TX];for(const x of cs){x.save();x.clip(p);}fn();for(const x of cs)x.restore();};
// локальное преобразование (поворот/масштаб вокруг точки) для всего, что нарисует fn
E.xf=(cx,cy,ang,sc,fn,dx=0,dy=0)=>{const m0=E.M;const m=E.M.translate(cx+dx,cy+dy).rotate(ang*57.2958).scale(sc,sc).translate(-cx,-cy);E.M=m;for(const x of [...X,TX])x.setTransform(m);fn();E.M=m0;for(const x of [...X,TX])x.setTransform(m0);};
E.shape=(p,inks,kw=4,kd=1)=>{E.fill(p,inks);if(kw>0)E.stroke(p,0,kw,kd);};
E.text=(s,x,y,size,o={})=>{const font=o.font||'Ship';const id=o.id==null?0:o.id;const[ci,c]=CH(id);
  const ctx=E.sil?TX:X[ci];ctx.font=`${o.w||800} ${size}px ${font}`;ctx.textAlign=o.align||'center';ctx.textBaseline='middle';
  if(o.ls)ctx.letterSpacing=o.ls+'px';else ctx.letterSpacing='0px';
  if(o.carve){for(const xx of X){xx.globalCompositeOperation='multiply';xx.font=ctx.font;xx.textAlign=ctx.textAlign;xx.textBaseline='middle';xx.letterSpacing=ctx.letterSpacing;xx.fillStyle='#000';xx.fillText(s,x,y);}}
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=col(c,o.d==null?1:o.d);ctx.fillText(s,x,y);
  return ctx.measureText(s).width;};
// ---------- печать (WebGL) ----------
const cv=document.getElementById('c');cv.width=OW;cv.height=OH;
const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
const VS=`#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
const FS=`#version 300 es
precision highp float;out vec4 o;
uniform sampler2D T0,T1,T2;uniform vec2 R;uniform float uT,uFr;uniform float uRev[9];uniform vec2 uReg[9];
uniform vec4 uCut;uniform float uCutSlide,uFade,uGrain;uniform vec3 uFadeC;
float h(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p.yx+19.19);return fract((p.x+p.y)*p.x);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
vec3 INKC[9]=vec3[9](vec3(.11,.10,.10),vec3(.17,.33,.53),vec3(.82,.22,.15),vec3(.95,.77,.36),vec3(.50,.63,.43),vec3(.62,.62,.64),vec3(.97,.70,.71),vec3(.99,.86,.75),vec3(.985,.975,.95));
float chan(int i,vec2 q){vec2 uv=q/R;vec4 c=(i<3)?texture(T0,uv):(i<6)?texture(T1,uv):texture(T2,uv);int k=i-(i/3)*3;return k==0?c.r:k==1?c.g:c.b;}
void main(){
  vec2 p=vec2(gl_FragCoord.x,gl_FragCoord.y); // y вниз (как холст): readPixels даёт строки сверху вниз
  vec2 sp=p;float gap=0.;float edge=1e3;
  if(uCut.w>0.){vec2 c=uCut.xy;vec2 d=vec2(cos(uCut.z),sin(uCut.z)),n=vec2(-d.y,d.x);float dd=dot(p-c,n);float s=sign(dd);
    float jag=(vn(vec2(dot(p-c,d)*.35,s*3.))-.5)*3.+(vn(vec2(dot(p-c,d)*.06,s*7.))-.5)*5.;
    float a=abs(dd)-uCut.w*.5+jag;edge=a;if(a<0.)gap=1.;sp=p-s*n*uCut.w*.5-s*d*uCutSlide;}
  float fr=floor(uFr/2.5); // «кипение» приводки раз в 2.5 кадра
  // бумага васи
  vec2 pp=sp/R*vec2(720.,1280.);
  float fib=0.;for(int k=0;k<3;k++){float a=float(k)*2.1+.4;vec2 r=mat2(cos(a),-sin(a),sin(a),cos(a))*pp;fib+=smoothstep(.62,.98,vn(r*vec2(.035,.9)))*.5;}
  float pg=fbm(pp*.08)*.5+vn(pp*.9)*.5;
  vec3 col=vec3(.955,.925,.85)*(1.-.035*pg)+fib*.03-vec3(0.,.01,.03)*fbm(pp*.004);
  float mot=fbm(pp*.012);
  for(int ii=0;ii<9;ii++){int i=ii==0?8:ii==8?0:ii;
    vec2 jit=(vec2(h(vec2(fr,float(i))),h(vec2(float(i),fr+3.)))-.5)*.5;
    vec2 q=sp+uReg[i]*(R.x/720.)+jit;
    float d=chan(i,q);
    if(i==0){col*=mix(vec3(1.),INKC[0],0.);}
    float b=(chan(i,q+vec2(2.2,0))+chan(i,q-vec2(2.2,0))+chan(i,q+vec2(0,2.2))+chan(i,q-vec2(0,2.2)))*.25;
    float rim=max(d-b,0.);
    // волокна доски (горизонтальные, с завитками), пятна барэна, «кунжут» гомадзури
    float ang=.06*float(i)-.1;vec2 g=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*pp;
    float w=g.y*.33+fbm(g*vec2(.006,.03)+float(i)*5.)*9.;float grain=pow(.5+.5*sin(w*6.283),6.);
    float spk=step(.78,vn(pp*.55+float(i)*11.));
    float cov=d*(1.-uGrain*(.16*grain+.10*mot+.08*spk))+rim*(i==0?.0:.35);
    if(i==0)cov=smoothstep(.15,.6,d)*(1.-.10*uGrain*spk)*(1.-.06*grain);
    // печать «проявляется» проходами барэна
    float rv=uRev[i];if(rv<1.){float n=fbm(pp*.011+float(i)*3.7)*.75+(1.-pp.y/1280.)*.12+pp.x/720.*.13;cov*=smoothstep(n-.06,n+.02,rv*1.12-.04);}
    cov=clamp(cov,0.,1.);
    if(i==8)col=mix(col,INKC[8],cov*.92);
    else if(i!=0)col*=mix(vec3(1.),INKC[i],cov);
    else col*=mix(vec3(1.),INKC[0],cov*.94);
  }
  if(gap>0.){col=vec3(.07,.06,.06)+fib*.02;}
  else if(edge<4.){float f=1.-edge/4.;col=mix(col,vec3(.97,.95,.9),f*.85*step(.35,vn(p*.5)));}
  // старение листа к краям
  vec2 v=pp/vec2(720.,1280.)-.5;col*=1.-.10*smoothstep(.25,.75,length(v*vec2(1.,.8)));
  col=mix(col,uFadeC,uFade);
  o=vec4(col,1);}`;
const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x;};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
const tex=[0,1,2].map(i=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(pr,'T'+i),i);return t;});
const U=n=>gl.getUniformLocation(pr,n);
E.P={rev:new Array(9).fill(1),reg:new Array(18).fill(0),cut:[0,0,0,0],slide:0,fade:0,fadeC:[0,0,0],grain:1};
E.regBase=s=>{for(let i=1;i<9;i++){E.P.reg[i*2]=(E.rnd(s*9+i)-.5)*3.2;E.P.reg[i*2+1]=(E.rnd(s*9+i+.5)-.5)*3.2;}};
E.present=(t)=>{gl.viewport(0,0,OW,OH);
  for(let i=0;i<3;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,L[i]);}
  gl.uniform2f(U('R'),OW,OH);gl.uniform1f(U('uT'),t);gl.uniform1f(U('uFr'),Math.floor(t*30+.001));
  gl.uniform1fv(U('uRev'),E.P.rev);gl.uniform2fv(U('uReg'),E.P.reg);gl.uniform4f(U('uCut'),...E.P.cut);gl.uniform1f(U('uCutSlide'),E.P.slide);
  gl.uniform1f(U('uFade'),E.P.fade);gl.uniform3f(U('uFadeC'),...E.P.fadeC);gl.uniform1f(U('uGrain'),E.P.grain);
  gl.drawArrays(gl.TRIANGLES,0,3);};
E.grab=()=>{const a=new Uint8Array(OW*OH*4);gl.readPixels(0,0,OW,OH,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
window.E=E;
})();
