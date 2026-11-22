// ЛАВА — GLSL-рейтрейсер SDF. Проход 1: сцена → RGBA16F (rgb + глубина). Проход 2: пост (DOF, bloom, тон, виньетка).
window.SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT;
uniform vec3 uRo, uTa; uniform float uFov, uRoll;
#define NB 12
#define NF 4
uniform vec4 uB[NB];   // центр, радиус (<=0 — нет)
uniform vec4 uBS[NB];  // масштаб xyz, жар 0..1
uniform vec4 uBX[NB];  // x: внутри лампы (1) / снаружи (0), y: мягкость слияния
uniform vec4 uF0[NF];  // индекс капли, размер глаза, верхнее веко, нижнее веко
uniform vec4 uF1[NF];  // взгляд x, взгляд y, поворот лица, наклон лица
uniform vec4 uF2[NF];  // рот открыт, рот ширина, зрачок, наклон век (злость/грусть)
uniform vec4 uCap;     // сдвиг крышки xyz, поворот
uniform vec4 uEnv;     // рассвет 0..1, лампа 0..1, вспышка, луч солнца
uniform int uNB, uNF;
out vec4 outC;

#define PI 3.14159265
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*noise(p); p*=2.03; a*=.5; } return s; }
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
float smax(float a,float b,float k){ return -smin(-a,-b,k); }
float sdEll(vec3 p, vec3 r){ float k0=length(p/r), k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-5); }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float sdPoly12(vec2 p, vec2 v[12]){
  float d=dot(p-v[0],p-v[0]); float s=1.;
  for(int i=0,j=11;i<12;j=i,i++){
    vec2 e=v[j]-v[i], w=p-v[i];
    vec2 b=w-e*clamp(dot(w,e)/dot(e,e),0.,1.);
    d=min(d,dot(b,b));
    bvec3 c=bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);
    if(all(c)||all(not(c))) s*=-1.;
  }
  return s*sqrt(d);
}
float sdPoly8(vec2 p, vec2 v[8]){
  float d=dot(p-v[0],p-v[0]); float s=1.;
  for(int i=0,j=7;i<8;j=i,i++){
    vec2 e=v[j]-v[i], w=p-v[i];
    vec2 b=w-e*clamp(dot(w,e)/dot(e,e),0.,1.);
    d=min(d,dot(b,b));
    bvec3 c=bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);
    if(all(c)||all(not(c))) s*=-1.;
  }
  return s*sqrt(d);
}
// колба/основание/крышка: аналитические профили вращения (быстро)
float bottleR(float y, out float k){ // полином 4-й степени по профилю
  float x=clamp(y,.92,3.18)-2.05;
  k=((4.*-.03927*x+3.*.08288)*x+2.*-.05269)*x-.18254;
  return (((-.03927*x+.08288)*x-.05269)*x-.18254)*x+.52989;
}
float sdBottle(vec3 p){
  float k; float r=bottleR(p.y,k);
  float ds=(length(p.xz)-r)/sqrt(1.+k*k);
  return smax(ds, max(.92-p.y, p.y-3.18), .03);
}
float sdCone(vec3 p, float y0, float y1, float r0, float r1){
  float k=(r1-r0)/(y1-y0); float r=mix(r0,r1,clamp((p.y-y0)/(y1-y0),0.,1.));
  return smax((length(p.xz)-r)/sqrt(1.+k*k), max(y0-p.y,p.y-y1), .015);
}
float sdBase(vec3 p){ return min(sdCone(p,0.,.88,.75,.52), sdCone(p,.86,.93,.545,.545)); }
float sdCapLocal(vec3 p){ return sdCone(p,3.15,3.62,.335,.195); }
float sdCap(vec3 p){
  vec3 q=p-uCap.xyz; q-=vec3(0,3.39,0); q.xy=rot(uCap.w)*q.xy; q+=vec3(0,3.39,0);
  return sdCapLocal(q);
}
float sdBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
float sdDesk(vec3 p){ return sdBox(p-vec3(0,-.08,-1.),vec3(6.,.08,3.2),.02); }
float sdBooks(vec3 p){
  float a=sdBox(p-vec3(2.05,.16,-1.1),vec3(.75,.16,.55),.02);
  vec3 q=p-vec3(2.0,.44,-1.05); q.xz=rot(.18)*q.xz;
  float b=sdBox(q,vec3(.62,.12,.48),.02);
  return min(a,b);
}
float sdMug(vec3 p){
  vec3 q=p-vec3(-1.55,0.,.15);
  float c=max(length(q.xz)-.30, abs(q.y-.36)-.36);
  c=max(c,-max(length(q.xz)-.26, -(q.y-.12)));
  float h=length(vec2(length(q.xy-vec2(.33,.38))-.17, q.z))-.045;
  return min(c, max(h, -(length(q.xz)-.29)));
}

// ---------- воск ----------
float gBot; // кэш расстояния до колбы в текущей точке
float waxField(vec3 p, out float heat, out float mouth){
  float d=1e5, hs=0., ws=0.;
  for(int i=0;i<NB;i++){
    if(i>=uNB) break;
    float r=uB[i].w; if(r<=0.) continue;
    vec3 q=p-uB[i].xyz;
    float bnd=length(q)-r*max(uBS[i].x,max(uBS[i].y,uBS[i].z));
    float di = bnd>0.25 ? bnd : sdEll(q, r*uBS[i].xyz);
    if(uBX[i].x>.5) di=max(di, gBot+0.006);
    float k=max(uBX[i].y,0.001);
    d=smin(d,di,k);
    float w=exp(-14.*max(di,0.)); hs+=w*uBS[i].w; ws+=w;
  }
  heat=hs/max(ws,1e-4);
  mouth=1e5;
  return d;
}
// лица: всё геометрическое считается в JS (engine.js), здесь только SDF
uniform vec4 uFB[NF];   // центр капли, радиус охвата
uniform vec4 uFE[8];    // центры глаз, радиус глаза
uniform vec4 uFR[NF];   // ось вправо, наклон век
uniform vec4 uFU[NF];   // ось вверх, высота верхнего века
uniform vec4 uFF[NF];   // ось вперёд, высота нижнего века
uniform vec4 uFM[NF];   // центр рта, рот открыт
uniform vec4 uFMs[NF];  // радиусы рта, зрачок
uniform vec4 uFL[NF];   // взгляд, внутри лампы
float gEyeD; vec3 gEyeC; vec3 gEyeL; float gEyeP; float gMouthD;
float faces(vec3 p, float wax){
  gEyeD=1e5; gMouthD=1e5;
  for(int f=0;f<NF;f++){
    if(f>=uNF) break;
    if(length(p-uFB[f].xyz)-uFB[f].w>wax) continue;
    vec3 R=uFR[f].xyz, U=uFU[f].xyz, F=uFF[f].xyz;
    bool ins=uFL[f].w>.5;
    if(uFM[f].w>.02){
      vec3 q=p-uFM[f].xyz; vec3 ql=vec3(dot(q,R),dot(q,U),dot(q,F));
      float dm=sdEll(ql, uFMs[f].xyz);
      gMouthD=min(gMouthD,dm);
      wax=smax(wax,-dm,uFMs[f].z*.04+.004);
    }
    for(int s=0;s<2;s++){
      vec4 E=uFE[f*2+s]; float er=E.w; if(er<=0.) continue;
      vec3 q=p-E.xyz;
      float de=length(q)-er;
      if(ins) de=max(de, gBot+0.004);
      float qx=dot(q,R), qyy=dot(q,U);
      float a=uFR[f].w*(s==0?-1.:1.);
      float qy=qyy*cos(a)+qx*sin(a);
      float shell=length(q)-er*1.13;
      float lid=min(max(shell,uFU[f].w-qy),max(shell,qyy-uFF[f].w));
      if(ins) lid=max(lid, gBot+0.006);
      wax=smin(wax,lid,er*.03+.002);
      if(de<gEyeD){ gEyeD=de; gEyeC=E.xyz; gEyeL=uFL[f].xyz; gEyeP=uFMs[f].w; }
    }
  }
  return wax;
}

// mode 0: снаружи (всё + стекло), 1: внутри (воск + стенка изнутри), 2: снаружи без стекла
float gMat; float gHeat;
uniform float uOutB; // есть ли капли снаружи
float map(vec3 p, int mode){
  float d=1e5; gMat=0.; gEyeD=1e5; gMouthD=1e5;
  float lampB=max(length(p.xz)-.80, max(-p.y, p.y-3.75));
  bool nearLamp = lampB<.06 || mode==1;
  gBot = nearLamp ? sdBottle(p) : lampB+.02;
  if((nearLamp && mode==1) || uOutB>.5){
    float h, m;
    float w=waxField(p,h,m);
    w=faces(p,w);
    d=w; gMat=1.;
    if(gEyeD<d){ d=gEyeD; gMat=2.; }
    gHeat=h;
  }
  if(mode==1){
    float wall=-gBot; if(wall<d){ d=wall; gMat=3.; }
    return d;
  }
  if(!nearLamp){ if(lampB<d){ d=lampB+.01; gMat=0.; } }
  else {
  if(mode==0){ if(gBot<d){ d=gBot; gMat=3.; } }
  float b=sdBase(p); if(b<d){ d=b; gMat=4.; }
  float cp=sdCap(p); if(cp<d){ d=cp; gMat=4.; }
  }
  float dk=sdDesk(p); if(dk<d){ d=dk; gMat=5.; }
  float bk=length(p-vec3(2.05,.35,-1.1))-1.15; if(bk<d) bk=sdBooks(p); if(bk<d){ d=bk; gMat=6.; }
  float mg=length(p-vec3(-1.55,.36,.15))-.62; if(mg<d) mg=sdMug(p); if(mg<d){ d=mg; gMat=8.; }
  return d;
}
float mapWax(vec3 p){
  gBot=sdBottle(p); float h,m; float w=waxField(p,h,m); w=faces(p,w); return min(w,gEyeD);
}
float mapStatic(vec3 p){
  float d=min(sdBase(p),sdCap(p));
  d=min(d,sdDesk(p));
  float bk=length(p-vec3(2.05,.35,-1.1))-1.15; if(bk<.2) bk=sdBooks(p); d=min(d,bk);
  float mg=length(p-vec3(-1.55,.36,.15))-.62; if(mg<.2) mg=sdMug(p); d=min(d,mg);
  return d;
}
vec3 nrmF(vec3 p, int which){
  vec2 e=vec2(.0012,-.0012); vec4 v;
  if(which==0){ v=vec4(mapWax(p+e.xyy),mapWax(p+e.yyx),mapWax(p+e.yxy),mapWax(p+e.xxx)); }
  else if(which==1){ v=vec4(sdBottle(p+e.xyy),sdBottle(p+e.yyx),sdBottle(p+e.yxy),sdBottle(p+e.xxx)); }
  else { v=vec4(mapStatic(p+e.xyy),mapStatic(p+e.yyx),mapStatic(p+e.yxy),mapStatic(p+e.xxx)); }
  return normalize(e.xyy*v.x+e.yyx*v.y+e.yxy*v.z+e.xxx*v.w);
}
vec3 nrm(vec3 p, int mode){ return nrmF(p,0); }
// ---------- комната и небо ----------
vec3 sunDir(){ return normalize(mix(vec3(-.55,.42,-.72), vec3(-.62,.16,-.77), uEnv.x)); }
vec3 sky(vec3 rd){
  float y=rd.y;
  vec3 night=mix(vec3(.03,.05,.14),vec3(.005,.01,.04),clamp(y*1.5,0.,1.));
  vec3 dawn=mix(vec3(1.0,.52,.25),vec3(.32,.30,.62),clamp(y*2.2+.1,0.,1.));
  vec3 c=mix(night,dawn,uEnv.x);
  // звёзды
  vec2 sp=rd.xy/(rd.z-1.)*90.; float st=hash(floor(sp)); c+=vec3(.9,.9,1.)*step(.985,st)*smoothstep(.5,.0,length(fract(sp)-.5))*(1.-uEnv.x)*1.2;
  // луна / солнце
  vec3 md=normalize(vec3(-.45,.38,-.80));
  float m=dot(rd,md); c+=vec3(.75,.82,1.)*smoothstep(.9988,.9993,m)*(1.-uEnv.x)*2.2 + vec3(.25,.3,.6)*pow(max(m,0.),300.)*(1.-uEnv.x);
  vec3 sd=-sunDir(); sd=normalize(vec3(-sd.x, -sd.y, -sd.z));
  float s=dot(rd,normalize(vec3(-.40,.10+.12*uEnv.x,-.90)));
  c+=vec3(1.,.75,.4)*(smoothstep(.9975,.9985,s)*6.+pow(max(s,0.),60.)*1.2)*uEnv.x;
  return c;
}
vec3 cityView(vec3 rd, vec2 wuv){
  vec3 c=sky(rd);
  // силуэты домов по горизонтали окна
  float x=wuv.x*9.;
  float hgt=.18+.22*hash(vec2(floor(x),3.))+.12*hash(vec2(floor(x*.5),7.));
  if(wuv.y<hgt){
    vec3 b=mix(vec3(.01,.012,.03),vec3(.18,.10,.14),uEnv.x);
    vec2 g=vec2(wuv.x*60.,wuv.y*55.);
    float lit=step(.62,hash(floor(g)))*step(.25,fract(g.x))*step(.3,fract(g.y));
    b+=vec3(1.,.75,.35)*lit*.55*(1.-uEnv.x*.85);
    c=b;
  }
  return c;
}
const float WALLZ=-4.6;
vec3 lampGlowCol(){ return mix(vec3(1.,.38,.12),vec3(.9,.25,.6),.35)*uEnv.y; }
vec3 room(vec3 ro, vec3 rd){
  if(rd.z<-0.01){
    float t=(WALLZ-ro.z)/rd.z; vec3 w=ro+rd*t;
    if(w.y<-0.15) { // под столом
      return vec3(.012,.01,.02);
    }
    vec2 wmin=vec2(-4.2,1.0), wmax=vec2(-1.0,5.2);
    if(w.x>wmin.x&&w.x<wmax.x&&w.y>wmin.y&&w.y<wmax.y){
      vec2 wuv=(w.xy-wmin)/(wmax-wmin);
      float bar=step(abs(wuv.x-.5),.012)+step(abs(wuv.y-.55),.010)+step(min(min(wuv.x,1.-wuv.x),min(wuv.y,1.-wuv.y)),.02);
      vec3 c=cityView(rd,wuv);
      return mix(c, vec3(.02,.02,.035)+lampGlowCol()*.02, clamp(bar,0.,1.));
    }
    // стена
    vec3 wall=vec3(.06,.07,.13)*.7;
    float dl=length(w-vec3(0,1.9,0));
    vec3 c=wall*(.35+.4*uEnv.x) + lampGlowCol()*.55/(1.+dl*dl*.18)*vec3(.5,.4,.6);
    // солнечный прямоугольник на стене при рассвете — мягкий
    c+=vec3(1.,.6,.3)*uEnv.x*.08*smoothstep(3.,0.,length(w.xy-vec2(1.,2.)));
    // гирлянда: только две ближайшие лампочки
    float kf=clamp(floor((w.x+.6)/.52),0.,13.);
    for(int j=0;j<2;j++){
      float kk=clamp(kf+float(j),0.,13.);
      float fx=-.6+kk*.52;
      float fy=4.55-.55*exp(-pow((fx-2.6)/2.2,2.));
      vec2 dd=w.xy-vec2(fx,fy);
      int k=int(kk);
      vec3 lc=k%3==0?vec3(1.,.55,.2):(k%3==1?vec3(1.,.3,.5):vec3(.4,.6,1.));
      c+=lc*(exp(-dot(dd,dd)*900.)*3.5+exp(-dot(dd,dd)*14.)*.05)*(1.-uEnv.x*.7);
    }
    // постер — тёмный прямоугольник с рамкой
    vec2 pp=w.xy-vec2(2.4,2.6);
    if(abs(pp.x)<.8&&abs(pp.y)<1.05){
      vec3 pc=mix(vec3(.12,.05,.18),vec3(.25,.08,.12),smoothstep(-1.,1.,pp.y));
      pc+=vec3(.9,.4,.2)*smoothstep(.45,.40,length(pp-vec2(0,.2)))*.35;
      c=pc*(.3+.6*uEnv.x)+lampGlowCol()*.06;
    }
    return c;
  }
  return vec3(.015,.012,.025);
}
vec3 env(vec3 rd){ // для отражений — упрощённая комната
  vec3 c=vec3(.03,.035,.07)*(.6+uEnv.x)+lampGlowCol()*.06;
  if(rd.z<-0.01){
    float t=(WALLZ-1.8*0.)/rd.z; vec2 w=vec2(0.,1.8)+rd.xy*((WALLZ)/rd.z);
    vec2 e=min(w-vec2(-4.2,1.0), vec2(-1.0,5.2)-w);
    float win=smoothstep(0.,.15,min(e.x,e.y));
    c=mix(c, mix(vec3(.10,.16,.38),vec3(1.2,.75,.45)*1.6,uEnv.x), win);
  }
  if(rd.y<-0.05) c=mix(c, vec3(.10,.05,.04)*(.4+uEnv.x)+lampGlowCol()*.15, smoothstep(-.05,-.3,rd.y));
  return c;
}
// свет из окна: маска через раму
float windowMask(vec3 p, vec3 L){
  if(L.z>=-0.01) return 0.;
  float t=(WALLZ-p.z)/L.z; vec3 w=p+L*t;
  vec2 wmin=vec2(-4.2,1.0), wmax=vec2(-1.0,5.2);
  vec2 e=min(w.xy-wmin, wmax-w.xy);
  float m=smoothstep(0.,.25,min(e.x,e.y));
  vec2 wuv=(w.xy-wmin)/(wmax-wmin);
  m*=1.-.85*(step(abs(wuv.x-.5),.015)+step(abs(wuv.y-.55),.012));
  return m;
}
vec3 outsideLight(vec3 p, vec3 n, vec3 rd, out vec3 spec){
  vec3 Lp=vec3(0,1.9,0); vec3 l=Lp-p; float dl=length(l); l/=dl;
  float lw=max(dot(n,l)*.8+.2,0.);
  vec3 c=lampGlowCol()*lw*1.6/(1.+dl*dl*.9);
  vec3 L=sunDir(); float wm=windowMask(p,L);
  vec3 sc=mix(vec3(.25,.35,.85)*.55, vec3(1.25,.72,.38)*2.4, uEnv.x)*(1.+uEnv.w*1.5);
  c+=sc*max(dot(n,L),0.)*wm;
  c+=vec3(.05,.06,.12)*(.5+.5*n.y)*(1.+uEnv.x*2.);
  vec3 h=normalize(l-rd); spec=lampGlowCol()*pow(max(dot(n,h),0.),40.)*.6/(1.+dl*dl*.5)+sc*pow(max(dot(n,normalize(L-rd)),0.),60.)*wm;
  return c;
}

// ---------- материалы ----------
vec3 waxShade(vec3 p, vec3 n, vec3 rd, float heat, bool inside, float fogT){
  float hh=clamp(heat,0.,1.);
  vec3 cold=vec3(.62,.30,.16);
  vec3 warm=vec3(.95,.22,.035);
  vec3 hot=vec3(1.,.55,.16);
  vec3 base=mix(cold,warm,smoothstep(0.,.45,hh)); base=mix(base,hot,smoothstep(.75,1.,hh));
  float fr=pow(1.-max(dot(n,-rd),0.),3.);
  vec3 c;
  if(inside){
    vec3 Lp=vec3(0,.88,0); vec3 l=Lp-p; float dl=length(l); l/=dl;
    float dif=max(dot(n,l)*.5+.5,0.);
    c=base*(.18+1.1*dif/(1.+dl*dl*.8))*uEnv.y;
    c+=base*vec3(.9,.25,.5)*.25*(.5+.5*n.y);
    float face=max(dot(n,-rd),0.);
    c+=base*hh*(.25+.65*face*face)*.75*uEnv.y; // свечение изнутри
    c+=vec3(.9,.2,.6)*fr*.45*uEnv.y;
    vec3 h=normalize(l-rd); c+=vec3(1.,.8,.6)*pow(max(dot(n,h),0.),70.)*1.2*uEnv.y;
    c+=env(reflect(rd,n))*fr*.6;
  } else {
    vec3 sp; vec3 li=outsideLight(p,n,rd,sp);
    c=base*li*(1.-hh*.3);
    float face=max(dot(n,-rd),0.);
    c+=base*hh*(.2+.5*face*face)*.6;
    // восковая просвечиваемость
    c+=base*vec3(1.,.4,.2)*.12*(1.-face)*(.3+hh);
    c+=sp*(.4+hh)*1.5;
    c+=env(reflect(rd,n))*fr*(.15+.5*hh);
  }
  return c;
}
vec3 eyeShade(vec3 p, vec3 n, vec3 rd, bool inside){
  vec3 nl=normalize(p-gEyeC);
  float d=dot(nl,gEyeL);
  float pa=cos(.42*gEyeP+.08);
  vec3 alb=vec3(.96,.94,.92);
  alb=mix(alb,vec3(.10,.05,.03),smoothstep(pa-.035,pa-.02,d));
  alb=mix(alb,vec3(.005),smoothstep(pa+.03,pa+.045,d));
  vec3 c;
  vec3 spec;
  if(inside){
    vec3 l=normalize(vec3(0,.88,0)-p);
    c=alb*(.35+.75*max(dot(n,l)*.5+.5,0.))*uEnv.y*vec3(1.,.85,.85) + alb*vec3(.5,.2,.5)*.15;
    spec=vec3(1.,.95,.9)*pow(max(dot(reflect(rd,n),normalize(vec3(.3,.8,.6))),0.),90.)*1.6*uEnv.y;
  } else {
    vec3 li=outsideLight(p,n,rd,spec);
    c=alb*(li*1.2+.08);
    spec+=vec3(1.)*pow(max(dot(reflect(rd,n),normalize(vec3(-.4,.6,.7))),0.),80.)*1.;
  }
  return c+spec+env(reflect(rd,n))*.12;
}
vec3 metalShade(vec3 p, vec3 n, vec3 rd){
  vec3 r=reflect(rd,n);
  vec3 c=(env(r)*1.6+vec3(.05,.04,.06))*vec3(.95,.8,.7);
  c+=vec3(1.,.6,.4)*pow(1.-max(dot(-rd,n),0.),3.)*.25*uEnv.y;
  vec3 sp; vec3 li=outsideLight(p,n,rd,sp);
  c+=li*vec3(.25,.18,.15)+sp*2.;
  // горлышко основания светится от лампы
  c+=lampGlowCol()*smoothstep(.6,.9,p.y)*smoothstep(1.0,.9,p.y)*.6*max(n.y,0.);
  return c;
}
vec3 deskShade(vec3 p, vec3 n, vec3 rd){
  float g=fbm(vec2(p.x*1.2,p.z*14.+fbm(p.xz*2.)*3.));
  vec3 alb=mix(vec3(.30,.16,.08),vec3(.48,.28,.14),g)*.9;
  if(n.y<.5) alb*=.6;
  vec3 sp; vec3 li=outsideLight(p,n,rd,sp);
  float ao=smoothstep(.0,.55,length(p.xz)-.70)*.75+.25;
  vec3 c=alb*li*ao + sp*.25;
  // лужица света от лампы под колбой
  c+=alb*lampGlowCol()*.9*exp(-max(length(p.xz)-.7,0.)*2.2)*step(.5,n.y)*ao;
  c+=env(reflect(rd,n))*.05;
  return c;
}
vec3 propShade(vec3 p, vec3 n, vec3 rd, vec3 alb){
  vec3 sp; vec3 li=outsideLight(p,n,rd,sp);
  return alb*li+sp*.3;
}
vec3 shadeOut(vec3 p, vec3 rd, float mat){
  float hsave=gHeat;
  vec3 n=nrmF(p, mat<2.5?0:2);
  gHeat=hsave;
  if(mat<1.5){ vec3 c=waxShade(p,n,rd,gHeat,false,1.); if(gMouthD<.006) c=vec3(.05,.008,.012)+c*.04; return c; }
  if(mat<2.5) return eyeShade(p,n,rd,false);
  if(mat<4.5) return metalShade(p,n,rd);
  if(mat<5.5) return deskShade(p,n,rd);
  if(mat<6.5){ vec3 a=p.y>.3?vec3(.12,.25,.45):vec3(.55,.15,.12); if(abs(n.y)>.5) a=vec3(.8,.75,.65); return propShade(p,n,rd,a); }
  return propShade(p,n,rd,vec3(.85,.80,.72));
}

vec3 liquidInscatter(vec3 a, vec3 b){
  vec3 s=vec3(0.); float L=length(b-a);
  for(int i=0;i<5;i++){
    vec3 q=mix(a,b,(float(i)+.5)/5.);
    float g=exp(-(q.y-.92)*1.8)*.8+.22;
    s+=g*exp(-float(i)/5.*L*.9);
  }
  return s/5.*L*vec3(.42,.06,.62)*.75*uEnv.y;
}
const vec3 ABS=vec3(.9,2.2,.55);

float marchT(vec3 ro, vec3 rd, int mode, float tmax, out float mat){
  float t=0.; mat=0.;
  for(int i=0;i<96;i++){
    float d=map(ro+rd*t,mode);
    if(abs(d)<.0009*(1.+t*1.5)){ mat=gMat; return t; }
    t+=d*.9; if(t>tmax) break;
  }
  return -1.;
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 ww=normalize(uTa-uRo);
  vec3 uu=normalize(cross(ww,vec3(sin(uRoll),cos(uRoll),0.)));
  vec3 vv=cross(uu,ww);
  vec3 rd=normalize(uv.x*uu+uv.y*vv+ww/tan(uFov*.5*PI/180.)*.5);
  vec3 ro=uRo;
  vec3 col=vec3(0.), tr=vec3(1.);
  float depth=-1.;
  bool inside=sdBottle(ro)<0.;
  float tot=0.;
  int stage=inside?1:0;
  int hit=0; vec3 hp=vec3(0.); float hm=0.; bool hin=false;
  for(int k=0;k<4;k++){
    float mat;
    int md=stage==1?1:(stage==2?2:0);
    float t=marchT(ro,rd,md,stage==1?3.:30.,mat);
    if(t<0.){
      if(stage==1){ break; }
      col+=tr*room(ro,rd); if(depth<0.) depth=tot+12.; tr=vec3(0.); break;
    }
    vec3 p=ro+rd*t; tot+=t;
    if(stage==1){
      col+=tr*liquidInscatter(ro,p);
      tr*=exp(-ABS*t);
      if(mat<2.5){ if(depth<0.) depth=tot; hit=1; hp=p; hm=mat; hin=true; break; }
      // стенка изнутри: выходим наружу
      vec3 n=-nrmF(p,1);
      float fr=.02+.5*pow(1.-max(dot(-rd,-n),0.),5.);
      col+=tr*fr*vec3(.35,.12,.4)*.4;
      tr*=1.-fr;
      vec3 r2=refract(rd,n,1.03);
      if(dot(r2,r2)<.1) r2=reflect(rd,-n);
      rd=r2; ro=p+n*.004; stage=2;
      continue;
    }
    if(mat>2.5&&mat<3.5){
      vec3 n=nrmF(p,1);
      float fr=.03+.75*pow(1.-max(dot(-rd,n),0.),5.);
      col+=tr*fr*env(reflect(rd,n))*1.3;
      tr*=(1.-fr)*vec3(.97,.95,1.);
      rd=refract(rd,n,1./1.03); ro=p-n*.004; stage=1;
      continue;
    }
    if(depth<0.) depth=tot;
    hit=1; hp=p; hm=mat; hin=false;
    break;
  }
  // единое затенение попадания (снаружи или внутри)
  if(hit==1){
    map(hp, hin?1:2); // gHeat, gMouthD, глаз
    float hh=gHeat; float mD=gMouthD; vec3 eC=gEyeC, eL=gEyeL; float eP=gEyeP;
    vec3 n=nrmF(hp, hm<2.5?0:2);
    gHeat=hh; gEyeC=eC; gEyeL=eL; gEyeP=eP;
    vec3 c;
    if(hm<1.5){ c=waxShade(hp,n,rd,hh,hin,1.); if(mD<.006) c=vec3(.05,.008,.012)+c*.04; }
    else if(hm<2.5) c=eyeShade(hp,n,rd,hin);
    else if(hm<4.5) c=metalShade(hp,n,rd);
    else if(hm<5.5) c=deskShade(hp,n,rd);
    else if(hm<6.5){ vec3 a=hp.y>.3?vec3(.12,.25,.45):vec3(.55,.15,.12); if(abs(n.y)>.5) a=vec3(.8,.75,.65); c=propShade(hp,n,rd,a); }
    else c=propShade(hp,n,rd,vec3(.85,.80,.72));
    col+=tr*c; tr=vec3(0.);
  }
  col+=tr*room(ro,rd)*.6;
  if(depth<0.) depth=tot+10.;
  col+=uEnv.z*vec3(1.,.8,.6);
  outC=vec4(col,depth);
}`;

window.POST_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes; uniform float uFocus, uAper, uT, uBloom, uFade;
out vec4 outC;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float luma(vec3 c){ return dot(sqrt(max(c,0.)),vec3(.299,.587,.114)); }
vec3 fxaa(vec2 uv){ // FXAA-lite по текселям исходника
  vec2 px=1./vec2(textureSize(uTex,0));
  vec3 cM=texture(uTex,uv).rgb;
  float lM=luma(cM), lNW=luma(texture(uTex,uv+vec2(-1,-1)*px).rgb), lNE=luma(texture(uTex,uv+vec2(1,-1)*px).rgb),
        lSW=luma(texture(uTex,uv+vec2(-1,1)*px).rgb), lSE=luma(texture(uTex,uv+vec2(1,1)*px).rgb);
  float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))), lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));
  vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)), (lNW+lSW)-(lNE+lSE));
  float red=max((lNW+lNE+lSW+lSE)*.03125,1./128.);
  dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+red),-6.,6.)*px;
  vec3 a=.5*(texture(uTex,uv+dir*(1./3.-.5)).rgb+texture(uTex,uv+dir*(2./3.-.5)).rgb);
  vec3 b=a*.5+.25*(texture(uTex,uv-dir*.5).rgb+texture(uTex,uv+dir*.5).rgb);
  float lB=luma(b);
  return (lB<lMin||lB>lMax)?a:b;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec4 c0=vec4(fxaa(uv),texture(uTex,uv).a);
  float coc=clamp(abs(1./max(c0.a,.01)-1./uFocus)*uAper,0.,1.);
  // размытие по mip-уровням: 8 отсчётов по кругу
  float lod=coc*5.5+log2(float(textureSize(uTex,0).y)/uRes.y);
  vec3 b=vec3(0.); float px=exp2(lod)/uRes.y;
  for(int i=0;i<8;i++){
    float a=float(i)*.785398+.4;
    vec2 o=vec2(cos(a),sin(a))*px*.9*vec2(uRes.y/uRes.x,1.);
    b+=textureLod(uTex,uv+o,max(lod-1.,0.)).rgb;
  }
  b/=8.;
  vec3 col=mix(c0.rgb,b,smoothstep(.02,.18,coc));
  // bloom
  vec3 bl=textureLod(uTex,uv,3.).rgb*.5+textureLod(uTex,uv,5.).rgb*.35+textureLod(uTex,uv,6.5).rgb*.3;
  col+=max(bl-.35,0.)*uBloom;
  // хроматика по краям
  vec2 d=uv-.5;
  col.r=mix(col.r,texture(uTex,uv-d*.006).r,.5*smoothstep(.1,.5,length(d)));
  col.b=mix(col.b,texture(uTex,uv+d*.006).b,.5*smoothstep(.1,.5,length(d)));
  col=aces(col*1.25);
  col=pow(col,vec3(.92));
  col*=1.-.45*pow(length(d*vec2(.9,1.1))*1.25,2.6);
  col+=(hash(gl_FragCoord.xy)-.5)/255.;
  col*=uFade;
  outC=vec4(col,1.);
}`;
window.VS = `#version 300 es
in vec2 p; void main(){ gl_Position=vec4(p,0,1); }`;
