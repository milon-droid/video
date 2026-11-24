// Таймлайн «20 WINTERS». Каждый план: [a,b) секунд, draw(lt,t). print — печать гравюры по доскам в начале плана.
(function(){
const K=E.K,cl=E.cl,lerp=E.lerp,ss=E.ss,eo=E.eo,eio=E.eio,r=E.rnd;
const SH=[];const CUES=[];window.CUES=CUES;
const shot=(a,b,draw,o={})=>SH.push(Object.assign({a,b,draw,seed:SH.length+1},o));
const cue=(t,id,g=1,o={})=>CUES.push(Object.assign({t:+t.toFixed(3),id,g},o));
const ORDER=[KEY,KI,HADA,MOMO,MIDORI,NEZU,BENI,AI,GOFUN];
const CAPY=1420;
const cap=(s,lt,a,b,size=46)=>{const u=cl((lt-a)/.35)*(lt<b-.25?1:cl((b-lt)/.25));if(u>0){E.screen();Wd.cart(s,540,CAPY,size,{a:u});}};
const cap2=(s1,s2,lt,a,b,size=44)=>{const u=cl((lt-a)/.35)*(lt<b-.25?1:cl((b-lt)/.25));if(u>0){E.screen();Wd.cart(s1,540,CAPY-44,size,{a:u});Wd.cart(s2,540,CAPY+52,size,{a:cl(u*1.6-.6)});}};
const shake=(lt,t0,amp,dur=.35)=>{const u=lt-t0;if(u<0||u>dur)return[0,0];const k=amp*(1-u/dur);return[Math.sin(u*90)*k,Math.cos(u*77)*k];};
const winter=(n,lt,a=.3)=>{const u=cl((lt-a)/.3);if(u<=0)return;E.screen();Wd.cart('WINTER '+n,200,330,40,{a:u,inks:{GOFUN:.0,KI:.0,MOMO:.0,BENI:.0,NEZU:.0}});};
// убийца-тень: поза с поднятым мечом → удар (u 0..1)
const killerPose=(x,y,h,u,f=1)=>{const up=[x-f*h*.02,y-h*1.02],dn=[x+f*h*.30,y-h*.55];const g=[lerp(up[0],dn[0],u),lerp(up[1],dn[1],u)];
  const ang=f>0?lerp(-2.25,.55,u):lerp(-Math.PI+2.25,Math.PI-.55,u);return {x,y,h,f,kind:'man',lean:lerp(-.08,.35,u),stance:h*.2,sword:{mode:'hand',grip:g,ang,noSaya:false},head:{blink:0}};};

// ===== 1. ХУК: тени на сёдзи =====
shot(0,1.9,(lt)=>{const st=.52;const u=K(lt,[[0,0],[st-.12,-.06,eio],[st+.1,1,E.ei],[st+.3,1.04]]);
  const sk=shake(lt,st+.1,14);E.cam={x:540+sk[0],y:900+sk[1],z:1.04+lt*.05,r:0};E.view();
  const fl=1+Math.sin(lt*23)*.04+Math.sin(lt*7)*.03;
  const pp=Wd.shojiPaper(-40,-80,1160,1520,fl,560,780);
  E.silhouette(KEY,.85,7,()=>{C.fig(Object.assign(killerPose(360,1250,960,cl(u)),{t:lt}));
    const fall=K(lt,[[st+.08,0],[st+.6,1,E.ei]]);
    E.xf(780,1250,fall*1.25,1,()=>C.fig({x:780,y:1250,h:860,f:-1,kind:'father',kneel:1,lean:.15-fall*.2,t:lt,head:{nod:.2}}));},pp);
  Wd.splat(680,760,lt-st-.08,11,1.1);
  Wd.shojiFrame(-40,-80,1160,1520,4,6,{fw:40,bw:12});
  E.fill(E.rect(-100,1440,1300,600),{KI:.6,NEZU:.8,BENI:.15,KEY:{g:[0,1440,0,1900],s:[[0,.1],[1,.6]]}});for(let i=0;i<6;i++)E.line([[-100,1500+i*75*(1+i*.15)],[1300,1500+i*75*(1+i*.15)]],3,3,0,.7);E.stroke(E.rect(-100,1440,1300,8),0,4);
  cap('HE NEVER SAW HIS FACE.',lt,-.4,2.2,50);
},{});
cue(0,'hyoshigi_double',1);cue(.02,'room_tone_fire',.5,{dur:1.9});cue(.15,'sword_raise',.6);cue(.55,'swing',1);cue(.62,'tsuke_hit',1.1);cue(.63,'splash',.9);cue(.66,'taiko_big',.9);cue(.95,'body_fall',.6);
// ===== 2. Глаз мальчика =====
shot(1.9,3.6,(lt)=>{E.cam={x:540,y:880,z:1.08+lt*.07,r:0};E.view();
  E.fill(E.rect(-200,-200,1500,2400),{AI:.8,KEY:.55});
  const face=E.smooth([[-200,300],[1300,250],[1300,1500],[-200,1550]]);E.fill(face,{HADA:.9,KI:{g:[1100,0,0,0],s:[[0,.7],[1,.0]]},NEZU:{g:[0,0,1080,0],s:[[0,.55],[1,0]]}});
  const tr=[Math.sin(lt*31)*3,Math.cos(lt*27)*2];const cx=540+tr[0],cy=860+tr[1];
  // бровь
  E.line([[180,520],[420,470],[700,470],[880,505]],70,24,.4,1);
  const eyeP=E.smooth([[160,880],[330,720],[560,680],[800,730],[940,860],[760,960],[520,990],[300,960]]);
  E.fill(eyeP,{GOFUN:.92,NEZU:.12});
  E.clipped(eyeP,()=>{const ir=E.ell(cx,cy-10,205,215);E.fill(ir,{KEY:.55,KI:.55,BENI:.25,NEZU:.3});
    for(let i=0;i<28;i++){const a=i/28*6.283;E.line([[cx+Math.cos(a)*95,cy-10+Math.sin(a)*95],[cx+Math.cos(a)*195,cy-10+Math.sin(a)*195]],5,2,0,.35);}
    const pr=lerp(80,118,ss(0,.6,lt));E.fill(E.ell(cx,cy-10,pr,pr),{KEY:1});
    // отражение: сёдзи с тенью
    const rx=cx+40,ry=cy-50;E.fill(E.rect(rx-60,ry-75,120,150),{KI:.85,GOFUN:.5});
    E.silhouette(KEY,.95,1.5,()=>C.fig(Object.assign(killerPose(rx-12,ry+70,140,1),{t:0})),E.rect(rx-60,ry-75,120,150));
    E.stroke(E.rect(rx-60,ry-75,120,150),0,3,.7);E.fill(E.ell(cx-90,cy-110,22,22),{GOFUN:1});
    E.fill(E.rect(0,600,1080,140),{NEZU:.35},false);});
  E.line([[150,890],[330,715],[560,672],[800,725],[950,865]],14,34,.6,1);
  for(let i=0;i<7;i++){const x=300+i*95;const y=720-Math.sin((i+.5)/7*3.14)*45;const dx=(i-3)*14;E.line([[x,y],[x+dx*.6+8,y-38],[x+dx+22,y-62]],10,1.5,0,1);}
  E.line([[300,965],[520,995],[760,962]],6,3,0,.6);
  // слеза
  const tu=ss(.45,1.6,lt);if(lt>.3){const ty=lerp(985,1350,E.ei(tu));const tx=lerp(640,670,tu);const s=lerp(14,30,ss(.3,.6,lt));
    const td=E.smooth([[tx,ty-s*2],[tx+s,ty],[tx,ty+s],[tx-s,ty]]);E.fill(td,{GOFUN:1,AI:.2});E.stroke(td,0,3,.8);
    if(tu>0)E.line([[640,990],[lerp(640,tx,.5),lerp(990,ty,.5)],[tx,ty-s*1.5]],8,3,0,.25,GOFUN);}
  cap('ONLY HIS SHADOW.',lt,.05,1.75,52);
});
cue(1.9,'heartbeat',.8);cue(2.0,'drone_low',.6,{dur:1.7});cue(2.5,'heartbeat',.8);cue(3.05,'heartbeat',.7);cue(2.4,'tear_drip',.5);
// ===== 3. Утро: пепелище, снег, меч отца =====
shot(3.6,7.4,(lt)=>{E.cam={x:lerp(500,600,lt/3.8),y:960,z:1.06,r:0};
  E.view(.2);Wd.sky(Wd.bok(NEZU,-200,1000,.8,.05));Wd.snow(lt+3,70,{size:6,speed:60});
  E.view(.4);Wd.ridge(860,70,3,{AI:{g:[0,780,0,1100],s:[[0,.45],[1,.05]]},NEZU:.15},{key:2.5});
  E.view(1);const g=E.rect(-300,1150,1700,900);E.fill(g,{AI:{g:[0,1150,0,1500],s:[[0,.18],[1,0]]}});E.line([[-300,1152],[1400,1148]],3,3,0,.8);
  // пепелище
  const posts=[[690,1180,560],[820,1200,420],[960,1170,620],[1080,1190,380]];
  for(const[x,y,h]of posts){const p=E.poly([[x-16,y],[x-11,y-h],[x+12,y-h+12],[x+16,y]]);E.fill(p,{KEY:1});E.fill(E.ell(x,y-h+2,24,10),{GOFUN:1});}
  E.fill(E.poly([[640,680],[1120,850],[1112,880],[635,712]]),{KEY:1});E.fill(E.poly([[640,676],[1120,846],[1115,836],[650,668]]),{GOFUN:1});
  for(let i=0;i<7;i++){const y=900-((lt*40+i*120)%700);Wd.puff(840+Math.sin(i*1.7+lt)*60+i*8,y,90+i*18,.35*(1-(900-y)/700));}
  for(let i=0;i<5;i++)E.fill(E.ell(700+i*90,1200+r(i)*20,60+r(i+3)*40,14),{KEY:.9});
  // мальчик и меч
  const reach=K(lt,[[1.0,0],[1.6,1]]),lift=K(lt,[[1.9,0],[2.9,1,E.back]]);
  const sg0=[600,1300],sg1=[470,1080];const sg=[lerp(sg0[0],sg1[0],lift),lerp(sg0[1],sg1[1],lift)+Math.sin(lt*14)*lift*4];
  const ang=lerp(0,.22,lift);
  const lying=lift<.02;
  if(lying)C.sword(sg0,0,520*1.0,{});
  C.fig({x:400,y:1310,h:520,f:1,kind:'boy',t:lt,kneel:1,lean:lerp(.35,.15,lift)+reach*.25*(1-lift),seed:3,
    hF:lying?(reach>0?[lerp(500,sg0[0],reach),lerp(1180,sg0[1],reach)]:null):null,
    sword:lying?{}:{mode:'hand',grip:sg,ang,noSaya:true},head:{nod:lerp(.35,-.1,lift),look:.3,brow:lerp(.3,-.3,lift)}});
  E.view(1.4);E.xf(-60,-40,.15+Math.sin(lt*1.3)*.015,1,()=>{for(let i=0;i<4;i++){const x=-60+i*130,y=-40+i*70;E.line([[-120,-120],[x+120,y+60]],46-i*8,20,0,1);}
    Wd.pine(150,330,420,7,true);});
  E.view(.2);
  Wd.snow(lt,40,{size:9,speed:110,key:1});
  E.screen();Wd.tanzaku('二十の冬',938,240,72,ss(.4,1.1,lt),'20 WINTERS');Wd.seal(938,240+72*5.3+90,62,ss(1.0,1.2,lt),'冬');
  winter(1,lt,1.4);
},{print:1});
cue(3.6,'print_pass',.7);cue(3.62,'wind_cold',.6,{dur:3.8});cue(4.0,'shamisen_motif',.8);cue(4.62,'snow_reach',.4);cue(5.5,'sword_drag',.6);cue(6.3,'tsuke_soft',.6);cue(4.65,'seal_stamp',.6);
// ===== 4. Ночь: рисует тень на ширме =====
shot(7.4,10.9,(lt)=>{E.cam={x:lerp(560,600,lt/3.5),y:900,z:lerp(1.0,1.1,lt/3.5),r:0};E.view();
  E.fill(E.rect(-200,-200,1500,2400),{NEZU:{r:[230,950,120,1300],s:[[0,.0],[1,.95]]},AI:{r:[230,950,200,1300],s:[[0,.0],[1,.6]]},KEY:{r:[230,950,300,1500],s:[[0,0],[1,.45]]},KI:{r:[230,950,40,900],s:[[0,.85],[1,.15]]},BENI:{r:[230,950,40,600],s:[[0,.12],[1,0]]}});
  const fl=Math.sin(lt*19)*.04;
  E.fill(E.rect(-200,1180,1500,900),{MIDORI:.4,KI:.6,NEZU:{r:[230,1100,100,1200],s:[[0,.1],[1,.8]]}});for(let i=0;i<8;i++)E.line([[-200+i*240,1180],[-500+i*300,2000]],3,3,0,.5);
  E.line([[-200,1182],[1400,1182]],4,4,0,.8);
  // андон
  const an=E.rect(140,820,170,330);E.fill(an,{KI:.9+fl,GOFUN:.5});E.stroke(an,0,6);E.line([[140,985],[310,985]],5,5,0,.8);
  // ширма
  const pnl=[[560,420,1000,380],[1000,380,1300,430]];const scr=E.poly([[560,420],[1000,380],[1000,1240],[560,1210]]);
  E.fill(scr,{KI:.35,GOFUN:.6,MOMO:.08});E.stroke(scr,0,10);E.fill(E.poly([[1000,380],[1300,430],[1300,1260],[1000,1240]]),{KI:.45,GOFUN:.45,NEZU:.15});E.stroke(E.poly([[1000,380],[1300,430],[1300,1260],[1000,1240]]),0,10);
  // силуэт рисуется полосами-мазками
  const N=7,prog=ss(.2,3.0,lt)*N;const rev=new Path2D();let tip=[620,500];
  for(let i=0;i<N;i++){const u=cl(prog-i);if(u<=0)break;const y0=470+i*105;const x0=600,x1=980;const xe=lerp(x0,x1,u);
    rev.moveTo(x0,y0);for(let x=x0;x<=xe;x+=20)rev.lineTo(x,y0-8+Math.sin(x*.05+i)*8);rev.lineTo(xe,y0+120);rev.lineTo(x0,y0+120);rev.closePath();if(u<1)tip=[xe,y0+55];}
  E.clipped(rev,()=>{E.silhouette(KEY,.92,0,()=>C.fig(Object.assign(killerPose(770,1170,760,0),{t:0})),scr);});
  // мальчик с кистью
  const hb=[tip[0]-30+Math.sin(lt*30)*4,tip[1]+10];
  C.fig({x:390,y:1300,h:440,f:1,kind:'boy',t:lt,kneel:1,lean:.25,seed:5,hF:hb,head:{look:.6,brow:-.6,nod:-.05}});
  E.line([[hb[0]-10,hb[1]+14],[hb[0]+40,hb[1]-8]],7,4,0,1);
  cap2('HE DREW IT ON PAPER.','SO HE WOULD NEVER FORGET.',lt,.3,3.5,40);
},{print:1});
cue(7.4,'print_pass',.6);cue(7.42,'room_tone_fire',.45,{dur:3.5});for(let i=0;i<7;i++)cue(7.6+i*.4,'brush_stroke',.5);

// удар мечом двумя руками: u 0 (замах) → 1 (удар)
const strike=(o,u)=>Object.assign(killerPose(o.x,o.y,o.h,u,o.f),o,{sword:killerPose(o.x,o.y,o.h,u,o.f).sword,lean:lerp(-.08,.35,u)});
// цикл ката: замах-удар с периодом P
const kata=(lt,P,off=0)=>{const ph=((lt+off)%P)/P;return ph<.55?-.08*eio(ph/.55):ph<.68?lerp(-.08,1,E.ei((ph-.55)/.13)):lerp(1,0,eio((ph-.68)/.32));};
// ===== 5. Весна: сакура, рубит ширму, девочка зовёт =====
shot(10.9,14.5,(lt)=>{const sk=shake(lt,1.05,8);E.cam={x:540+sk[0],y:960+sk[1],z:lerp(1.02,1.1,lt/3.6),r:0};
  E.view(.2);Wd.sky({AI:{g:[0,-200,0,1000],s:[[0,.45],[1,0]]},MOMO:{g:[0,600,0,1200],s:[[0,0],[1,.25]]}});
  E.view(.4);Wd.ridge(1000,50,8,{MIDORI:{g:[0,950,0,1200],s:[[0,.55],[1,.15]]},AI:.12},{key:2});
  E.view(1);E.fill(E.rect(-300,1180,1700,900),{KI:.35,MIDORI:{g:[0,1180,0,1600],s:[[0,.4],[1,.2]]}});E.line([[-300,1182],[1400,1178]],3,3,0,.8);
  // столб и бумага с силуэтом
  E.fill(E.rect(232,560,36,640),{KI:.6,NEZU:.7,BENI:.15});E.stroke(E.rect(232,560,36,640),0,3);
  const hit=1.05,tear=K(lt,[[hit,0],[hit+.9,1,E.ei]]);
  const paper=(side)=>{const pr=E.rect(150,620,200,300);E.xf(side<0?150:350,620,side*tear*.5,1,()=>{E.clipped(E.poly(side<0?[[100,560],[262,560],[238,980],[100,980]]:[[262,560],[420,560],[420,980],[238,980]]),()=>{
      E.fill(pr,{GOFUN:.85,KI:.25});E.stroke(pr,0,3);E.silhouette(KEY,.9,0,()=>C.fig(Object.assign(killerPose(255,900,260,0),{t:0})),pr);});},0,tear*tear*260);};
  if(lt<hit){paper(-1);paper(1);}else{paper(-1);paper(1);}
  // подросток
  const u=lt<hit-.45?K(lt,[[0,0],[hit-.45,-.08]]):K(lt,[[hit-.45,-.08],[hit-.05,1,E.ei],[hit+.6,.85],[3.6,.8]]);
  const tn={x:600,y:1260,h:640,f:-1,kind:'teen',t:lt,seed:8};C.fig(Object.assign(strike(tn,u),{head:{brow:-.9,look:lt>1.8?-.6:0},lag:[u*1.2,-.3]}));
  // девочка
  const wave=lt>1.6&&lt<2.9?Math.sin((lt-1.6)*9):0,down=ss(2.9,3.3,lt);
  C.fig({x:940,y:1230,h:420,f:-1,kind:'girl',t:lt,seed:9,hF:[lerp(820,830,down)+wave*20,lerp(lt>1.6?700:1000,1010,down)-ss(1.4,1.7,lt)*120*(1-down)],head:{mouth:lt>1.7&&lt<2.8?.5+.4*Math.sin(lt*14):0,brow:down*.6,nod:down*.25,smile:1-down}});
  // ветка сакуры
  E.view(1.3);E.line([[1200,-60],[900,140],[700,180],[520,120]],60,14,0,1);E.line([[900,140],[820,300],[700,360]],26,8,0,1);
  for(let i=0;i<34;i++){const x=520+r(i)*640,y=60+r(i+4)*330;const p=E.ell(x,y,30+r(i+2)*26,24+r(i+3)*20);E.fill(p,{MOMO:.95,GOFUN:.35});E.stroke(p,0,2,.5);}
  E.view(1);const burst=lt-hit;if(burst>0)for(let i=0;i<26;i++){const a=r(i*3)*6.28,d=eo(burst*1.4)*(120+r(i)*260);const x=250+Math.cos(a)*d,y=760+Math.sin(a)*d*.7+burst*burst*120;
    E.fill(E.ell(x,y,11,6,a+burst*4),{MOMO:1},false);}
  Wd.petals(lt,40,30,{size:10,wind:-60,fall:80});
  winter(5,lt,.6);cap2('FRIENDS CALLED.',"HE DIDN'T TURN.",lt,1.7,3.6,44);
},{print:1});
cue(10.9,'print_pass',.6);cue(10.92,'spring_birds',.5,{dur:3.6});cue(11.5,'sword_raise',.5);cue(11.9,'swing',1);cue(11.95,'paper_rip',1);cue(11.97,'tsuke_hit',.9);cue(12.6,'girl_call',.0);cue(13.8,'shamisen_sad',.6);
// ===== 6. Ливень на мосту =====
shot(14.5,17.9,(lt)=>{E.cam={x:lerp(520,580,lt/3.4),y:950,z:1.05,r:0};
  E.view(.2);Wd.sky({NEZU:{g:[0,0,0,900],s:[[0,.55],[1,.15]]},KEY:{g:[0,-100,0,560],s:[[0,.95],[1,0]]}});
  E.view(.4);const sh=Wd.ridge(720,30,5,{NEZU:.55,AI:.2});for(let i=0;i<14;i++){const x=-100+i*95,y=700+E.noise(i*.3)*20;E.fill(E.ell(x,y-40,30,70),{NEZU:.6,AI:.25},false);}
  E.view(1);E.fill(E.rect(-300,760,1700,1400),{AI:{g:[0,760,0,1800],s:[[0,.55],[1,.85]]}});
  for(let i=0;i<22;i++){const y=820+i*55,x0=((i*173)%900)-150+Math.sin(lt*2+i)*20;E.line([[x0,y],[x0+60,y-8],[x0+120,y]],3,3,0,.45);}
  // мост
  const A=[-150,1560],B=[1250,880];const deck=E.poly([A,B,[B[0],B[1]+70],[A[0],A[1]+90]]);
  for(let i=0;i<9;i++){const u=i/8;const x=lerp(A[0],B[0],u),y=lerp(A[1],B[1],u);E.fill(E.rect(x-12,y+60,24,500),{KI:.5,NEZU:.85});E.stroke(E.rect(x-12,y+60,24,500),0,2);}
  E.fill(deck,{KI:.55,NEZU:.7,BENI:.1});E.stroke(deck,0,4);
  // прохожие с зонтами
  for(const[k,o0]of[[0,.15],[1,.8]]){const u=(o0+lt*(k?-.07:.09)+1)%1;const x=lerp(A[0],B[0],u),y=lerp(A[1],B[1],u)+30;
    C.fig({x,y,h:300,f:k?-1:1,kind:k?'woman':'father',t:lt,walk:lt*1.6+k*.5,lean:.25,hF:[x+(k?-1:1)*20,y-200],seed:20+k});
    const um=E.smooth([[x-120,y-240],[x,y-330],[x+120,y-240],[x,y-262]]);E.fill(um,{KI:.7,BENI:.15});E.stroke(um,0,3);E.line([[x,y-320],[x+(k?-1:1)*20,y-190]],4,4,0,1);}
  // юноша
  const u=kata(lt,1.3,.3);const p=lerp(.38,.42,0);const x=lerp(A[0],B[0],.48),y=lerp(A[1],B[1],.48)+40;
  C.fig(Object.assign(strike({x,y,h:440,f:1,kind:'teen',t:lt,seed:12},u),{head:{brow:-.8},lag:[-.2,.2]}));
  E.view(.9);Wd.rain(lt,140,.2);E.view(1);
  winter(9,lt,.5);cap('NO FRIENDS. NO HOME.',lt,1.0,3.4,46);
},{print:1});
cue(14.5,'print_pass',.6);cue(14.5,'rain',.85,{dur:3.4});[0.55,1.85,3.15].forEach(x=>{cue(14.5+x-.1,'swing',.6);});cue(15.4,'thunder',.5);
// ===== 7. Большая волна =====
shot(17.9,21.3,(lt)=>{const sk=shake(lt,1.6,10);E.cam={x:540+sk[0],y:980+sk[1],z:lerp(1.0,1.08,lt/3.4),r:0};
  E.view(.2);Wd.sky({KI:{g:[0,0,0,1400],s:[[0,.25],[1,.45]]},NEZU:{g:[0,-100,0,700],s:[[0,.7],[1,0]]}});
  E.view(.3);const fj=E.poly([[520,1150],[740,880],[790,880],[1010,1150]]);E.fill(fj,{AI:.7});E.stroke(fj,0,3);E.fill(E.poly([[690,940],[740,880],[790,880],[840,940],[800,925],[765,945],[730,925]]),{GOFUN:1});
  E.view(1);E.fill(E.rect(-300,1150,1700,900),{AI:{g:[0,1150,0,1900],s:[[0,.6],[1,.9]]}});
  // волна: гребень растёт и закручивается
  const g=eio(lt/3.4);const cx=lerp(380,520,g),cy=lerp(560,470,g);
  const wpts=[[-300,1950],[-300,900],[-60,700],[cx-150,cy+20],[cx,cy-20],[cx+180,cy+40],[cx+260,cy+170],[cx+200,cy+230],[cx+120,cy+140],[cx+20,cy+150],[cx-40,cy+330],[cx+60,cy+700],[cx+260,1150],[cx+500,1950]];
  const wv=E.smooth(wpts);E.fill(wv,{AI:1,KEY:.1});
  E.clipped(wv,()=>{for(let i=0;i<10;i++){const k=i*40;E.line([[-300+k*.2,1900],[-100+k*.3,900+k],[cx-120+k*.3,cy+60+k*.6],[cx+120-k*.2,cy+120+k*.4]],4,4,0,.5);}
    E.fill(E.smooth([[cx-60,cy+60],[cx+150,cy+90],[cx+160,cy+170],[cx+40,cy+330],[cx+80,cy+600],[cx+260,1160],[cx+600,1160],[cx+300,600]]),{GOFUN:.0,AI:-0,KEY:0,NEZU:.0},false);});
  E.stroke(wv,0,5);
  // когти пены
  for(let i=0;i<16;i++){const u=i/15;const bx=lerp(cx-140,cx+250,u),by=cy+Math.sin(u*3.1)*-40+u*u*180;const L=40+r(i)*40+g*30;const a=-.6+u*2.4;
    const p=E.smooth([[bx,by],[bx+Math.cos(a)*L,by+Math.sin(a)*L],[bx+Math.cos(a+.6)*L*.6,by+Math.sin(a+.6)*L*.6],[bx+12,by+8]]);E.fill(p,{GOFUN:1});E.stroke(p,0,2);}
  Wd.snow(lt,60,{size:6,speed:-200,wind:250});
  // скала и герой
  const rk=E.smooth([[640,1960],[700,1380],[820,1290],[980,1300],[1150,1400],[1200,1960]]);E.fill(rk,{KEY:.75,NEZU:.6});E.stroke(rk,0,4);
  const u=lt<1.0?K(lt,[[0,0],[1.0,-.08]]):K(lt,[[1.0,-.08],[1.55,1,E.ei],[2.4,.9]]);
  C.fig(Object.assign(strike({x:900,y:1305,h:460,f:-1,kind:'teen',col:C.COL.man,t:lt,seed:13},u),{head:{brow:-1},lag:[u,-.5]}));
  // разрубленные брызги
  const sl=lt-1.6;if(sl>0){E.fill(E.brush([[540,560],[620,700],[720,830]],4,30*(1-cl(sl*2)),.5),{GOFUN:1});for(let i=0;i<30;i++){const a=r(i)*6.28,d=sl*300*(.4+r(i+1));E.fill(E.ell(640+Math.cos(a)*d,700+Math.sin(a)*d+sl*sl*200,8,8),{GOFUN:1});}}
  winter(13,lt,.4);cap('ONLY THE SHADOW.',lt,1.8,3.4,48);
},{print:1});
cue(17.9,'print_pass',.6);cue(17.9,'wave_roar',.9,{dur:3.4});cue(18.9,'sword_raise',.5);cue(19.45,'swing',1);cue(19.5,'water_splash',.9);cue(19.5,'tsuke_hit',.9);cue(19.52,'taiko_big',.7);
// ===== 8. Осень: разрезанный лист =====
shot(21.3,24.7,(lt)=>{E.cam={x:540,y:lerp(900,960,lt/3.4),z:lerp(1.08,1.0,lt/3.4),r:0};
  E.view(.2);Wd.sky({KI:{g:[0,0,0,1600],s:[[0,.85],[1,.5]]},BENI:{g:[0,200,0,1800],s:[[0,.0],[1,.45]]},MOMO:{r:[700,700,50,700],s:[[0,0],[1,.25]]}});
  E.view(.3);const sun=E.ell(800,640,170,170);E.fill(sun,{GOFUN:.75,KI:.25});
  Wd.ridge(1150,60,11,{BENI:.35,NEZU:.45},{key:2});
  E.view(1);
  // герой средним планом
  const cutT=1.55;const drawn=lt>=cutT;const after=lt-cutT;
  const uu=drawn?K(after,[[0,0],[.08,1,E.eo],[1.5,.95]]):0;
  const hero={x:430,y:1900,h:1150,f:1,kind:'teen',col:C.COL.man,t:lt,seed:14,stance:220,crouch:.25};
  if(!drawn)C.fig(Object.assign({},hero,{sword:{mode:'hip'},hF:[560,1170],hB:[520,1200],lean:.12,head:{brow:-.6,look:ss(0,1.4,lt)*.4-0.2}}));
  else{const g=[lerp(560,760,uu),lerp(1150,880,uu)];C.fig(Object.assign({},hero,{lean:.2,sword:{mode:'hand',grip:g,ang:lerp(-.3,-1.15,uu),one:1},hB:[420,1150],head:{brow:-1,look:.4},lag:[-1,0]}));}
  // лист
  const lx=lerp(820,690,ss(0,cutT,lt))+Math.sin(lt*4)*30,ly=lerp(80,560,ss(0,cutT,lt));
  if(!drawn)Wd.maple(lx,ly,58,lt*2);
  else{for(const s of [-1,1]){const a=after;E.xf(lx,ly,s*a*1.2,1,()=>{E.clipped(E.poly(s<0?[[lx-200,ly-200],[lx+200,ly-260],[lx-200,ly+200]]:[[lx+200,ly-260],[lx+200,ly+200],[lx-200,ly+200]]),()=>Wd.maple(lx,ly,58,cutT*2));},s*(30+a*160),a*a*160+a*40);}
    E.fill(E.brush([[480,860],[700,560],[930,380]],3,22*(1-cl(after*2.5)),.6),{GOFUN:1});}
  E.view(1.3);const br=[[-120,60],[120,150],[330,170],[520,120]];E.line(br,40,10,0,1);E.line([[120,150],[200,280],[330,330]],18,6,0,1);E.line([[330,170],[420,250]],12,4,0,1);
  for(let i=0;i<26;i++){const q=br[1+(i%3)];Wd.maple(q[0]+(r(i)-.5)*260,q[1]+40+(r(i+2)-.3)*180,26+r(i+5)*18,r(i+7)*6,{BENI:.95,KI:.35*r(i)});}
  E.view(1);Wd.petals(lt,14,70,{size:12,inks:{BENI:.9,KI:.4},wind:40,fall:90});
  winter(17,lt,.4);
},{print:1});
cue(21.3,'print_pass',.6);cue(21.3,'wind_soft',.5,{dur:3.4});cue(22.85,'unsheathe',1);cue(22.86,'swing',.8);cue(22.9,'tsuke_hit',.8);cue(23.1,'shamisen_pluck_hi',.6);
// ===== 9. Деревня: старуха указывает в горы =====
shot(24.7,28.3,(lt)=>{E.cam={x:lerp(500,560,lt/3.6),y:960,z:1.05,r:0};
  E.view(.2);Wd.sky({AI:{g:[0,-100,0,1000],s:[[0,.9],[1,.15]]},KI:{g:[0,500,0,1150],s:[[0,0],[1,.5]]}});
  E.view(.35);Wd.ridge(820,140,2,{AI:.45,NEZU:.3},{key:3});E.fill(E.ell(930,470,14,10),{KI:1,GOFUN:.5});Wd.puff(930,470,60,.3,KI);
  E.view(.6);for(let i=0;i<4;i++){const x=-60+i*330,y=1080+r(i)*30;const w=280;
    const roof=E.smooth([[x-w*.6,y-120],[x,y-300],[x+w*.6,y-120],[x+w*.4,y-100],[x-w*.4,y-100]]);const wall=E.rect(x-w*.42,y-110,w*.84,140);
    E.fill(wall,{KI:.45,NEZU:.5});E.stroke(wall,0,3);E.fill(E.rect(x-40,y-80,80,70),{KI:.95,GOFUN:.4});E.stroke(E.rect(x-40,y-80,80,70),0,3);E.fill(roof,{GOFUN:1});E.stroke(roof,0,3);}
  E.view(1);E.fill(E.rect(-300,1150,1700,900),{AI:{g:[0,1150,0,1500],s:[[0,.18],[1,0]]}});E.line([[-300,1152],[1400,1148]],3,3,0,.8);
  // старуха и герой
  const pt=ss(1.5,2.1,lt);
  C.fig({x:780,y:1300,h:470,f:-1,kind:'old',col:C.COL.old,t:lt,seed:16,lean:.35,hF:[lerp(690,860,pt),lerp(1110,800,pt)],head:{look:lerp(-.3,.8,pt),brow:.3+pt*.3,mouth:lt>1.6&&lt<2.4?.4:0}});
  const sh=ss(.2,.9,lt);const hx=440;
  const hF=[lerp(480,600,sh),lerp(1060,960,sh)];
  C.fig({x:hx,y:1310,h:640,f:1,kind:'man',t:lt,seed:17,hF,sword:{mode:'hip'},head:{stub:1,scar:1,kasa:1,brow:-.4,look:lerp(0,.8,ss(1.8,2.4,lt)),nod:-ss(1.8,2.4,lt)*.15}});
  const pr=E.rect(hF[0]-20,hF[1]-170,130,170);E.fill(pr,{GOFUN:.85,KI:.3});E.stroke(pr,0,3);E.silhouette(KEY,.9,0,()=>C.fig(Object.assign(killerPose(hF[0]+45,hF[1]-10,150,0),{t:0})),pr);
  E.view(.3);Wd.snow(lt,60,{size:7,speed:70,key:1});
  winter(20,lt,.3);cap('SOMEONE FINALLY KNEW HIM.',lt,1.4,3.6,44);
},{print:1});
cue(24.7,'print_pass',.6);cue(24.7,'wind_cold',.6,{dur:3.6});cue(25.0,'paper_rustle',.6);cue(26.3,'tsuke_soft',.7);cue(26.4,'shamisen_motif',.7);
// ===== 10. Подъём под луной =====
shot(28.3,31.8,(lt)=>{const u=eio(lt/3.5);E.cam={x:540,y:lerp(1250,620,u),z:1.0,r:0};
  E.view(.3);Wd.sky({AI:{g:[0,-600,0,1400],s:[[0,.95],[1,.35]]},KEY:{g:[0,-800,0,400],s:[[0,.4],[1,0]]}});Wd.moon(650,150,230);
  E.view(.55);Wd.ridge(700,180,4,{AI:.55,NEZU:.35},{key:2.5});
  E.view(.8);Wd.ridge(1050,220,9,{NEZU:.45,AI:.2},{key:2.5});
  E.view(1);
  const path=[[200,2300],[700,1900],[300,1500],[760,1150],[420,820],[600,560]];
  const sl=E.poly([[-300,2600],[-300,1000],[200,700],[600,420],[1000,700],[1400,1100],[1400,2600]]);E.fill(sl,{AI:{g:[0,400,0,2200],s:[[0,.0],[1,.2]]}});E.stroke(sl,0,3);
  E.line(path,10,6,0,.55);
  for(let i=0;i<6;i++)Wd.pine(lerp(-50,1100,r(i+40)),lerp(900,2200,r(i+44)),lerp(200,320,r(i+47)),i,true);
  // хижина
  const hx=600,hy=560;const roof=E.smooth([[hx-170,hy-110],[hx,hy-250],[hx+170,hy-110],[hx+120,hy-90],[hx-120,hy-90]]);E.fill(E.rect(hx-130,hy-110,260,120),{KI:.45,NEZU:.6});E.stroke(E.rect(hx-130,hy-110,260,120),0,3);
  E.fill(E.rect(hx-50,hy-85,100,80),{KI:1,GOFUN:.5});Wd.puff(hx,hy-45,110,.35,KI);E.fill(roof,{GOFUN:1});E.stroke(roof,0,3);
  // фигура идёт вверх по тропе
  const pu=lerp(.35,.62,lt/3.5);const seg=pu*(path.length-1);const i0=Math.floor(seg),fu=seg-i0;const a=path[i0],b=path[Math.min(path.length-1,i0+1)];
  const fx=lerp(a[0],b[0],fu),fy=lerp(a[1],b[1],fu);C.fig({x:fx,y:fy,h:150,f:b[0]>a[0]?1:-1,kind:'man',t:lt,walk:lt*1.4,lean:.25,sword:{mode:'hip'},head:{kasa:1}});
  // вороны
  for(let i=0;i<5;i++){const x=((lt*170+i*230)%1500)-200,y=300+i*60+Math.sin(lt*3+i)*20;const fl=Math.sin(lt*14+i*2)*24;
    E.fill(E.poly([[x-34,y-fl],[x-6,y],[x,y+6],[x+6,y],[x+34,y-fl],[x+4,y+10],[x-4,y+10]]),{KEY:1});}
  Wd.snow(lt,50,{size:6,speed:50,wind:40});
});
cue(28.3,'wind_howl',.75,{dur:3.5});cue(28.6,'crows',.6);cue(28.4,'footsteps_snow',.5,{dur:3.4});cue(29.3,'temple_bell',.45);

// ===== 11. Хижина: огромная тень на сёдзи, рисунок совпадает =====
const hutWall=(lt,glow=1)=>{E.fill(E.rect(-300,-300,1700,2600),{AI:.85,KEY:.45,NEZU:.4});};
shot(31.8,35.8,(lt)=>{E.cam={x:lerp(560,600,lt/4),y:900,z:lerp(1.0,1.07,lt/4),r:0};E.view();
  hutWall(lt);
  const pp=Wd.shojiPaper(380,180,640,1100,1+Math.sin(lt*17)*.04,700,700);
  E.silhouette(KEY,.88,9,()=>C.fig(Object.assign(killerPose(700,1300,1250,0),{kind:'old',t:lt,lean:-.02})),pp);
  Wd.shojiFrame(380,180,640,1100,2,5,{fw:30,bw:10});
  E.fill(E.rect(-300,1300,1700,800),{GOFUN:.0,AI:{g:[0,1300,0,1700],s:[[0,.12],[1,.3]]}});E.line([[-300,1302],[1400,1298]],3,3,0,.8);
  E.fill(E.ell(700,1320,330,40),{KI:.6},false);
  // герой спиной-вполоборота слева
  const up=ss(1.0,1.3,lt)*(1-ss(3.0,3.15,lt));const drop=lt>3.1;
  const hF=[lerp(330,560,up),lerp(1150,660,up)];
  if(drop||up<=0)C.fig({x:150,y:1700,h:1250,f:1,kind:'man',t:lt,seed:21,sword:{mode:'hip'},hF:drop?[330,1180]:hF,head:{stub:1,scar:1,kasa:1,brow:-.7,look:.3}});
  if(!drop&&up>0){const al=1-ss(1.75,2.6,lt);const sc=lerp(1,.4,al),dx=-250*al,dy=330*al+(1-up)*500;const c=[700,740];
    E.xf(c[0],c[1],0,sc,()=>{const pr=E.rect(410,150,580,1160);E.fill(pr,{GOFUN:lerp(.25,.92,al),KI:.12},false);E.stroke(pr,0,5/sc,.9);
      E.silhouette(KEY,lerp(.35,.92,al),0,()=>C.fig(Object.assign(killerPose(700,1300,1250,0),{t:0,kind:'man'})),pr);},dx,dy);
    const hc=[c[0]+(430-c[0])*sc+dx,c[1]+(1290-c[1])*sc+dy];
    C.fig({x:150,y:1700,h:1250,f:1,kind:'man',t:lt,seed:21,sword:{mode:'hip'},hF:hc,head:{stub:1,scar:1,kasa:1,brow:-.7,look:.3}});}
  else{const fu=lt-3.1;const px=300+fu*80,py=1100+fu*fu*900;E.xf(px,py,fu*3,1,()=>{const pr=E.rect(px-100,py-140,200,280);E.fill(pr,{GOFUN:.6,KI:.2},false);E.stroke(pr,0,3,.7);});}
  Wd.snow(lt,30,{size:6,speed:40,wind:30});
});
cue(31.8,'wind_howl',.5,{dur:4});cue(31.8,'drone_low',.6,{dur:4});cue(32.3,'heartbeat',.9);cue(33.1,'heartbeat',.9);cue(33.0,'paper_rustle',.6);cue(33.85,'heartbeat',1);cue(34.5,'heartbeat',1);cue(34.9,'paper_rustle',.4);
// бюст для крупных планов: шея, плечи, ворот кимоно
const bust=(white)=>{const nk=E.poly([[470,980],[610,990],[620,1180],[460,1180]]);E.fill(nk,{HADA:.85*(1-white),GOFUN:.9*white});E.stroke(nk,0,5);
  const sh=E.smooth([[60,1560],[230,1190],[460,1110],[560,1150],[700,1110],[900,1190],[1060,1560],[1150,2050],[-50,2050]]);E.fill(sh,{AI:1});
  E.clipped(sh,()=>{for(let i=0;i<9;i++){const x=120+i*110;E.line([[x,1200],[x-60,2000]],4,4,0,.35);}});E.stroke(sh,0,7);
  E.fill(E.poly([[455,1120],[505,1110],[640,1480],[590,1500]]),{GOFUN:.95});E.fill(E.poly([[690,1115],[640,1105],[520,1420],[570,1440]]),{GOFUN:.95});
  E.line([[455,1120],[590,1500]],6,6,0,1);E.line([[505,1110],[640,1480]],5,5,0,1);E.line([[690,1115],[570,1440]],6,6,0,1);E.line([[640,1105],[520,1420]],5,5,0,1);
  E.fill(E.poly([[560,1440],[620,1440],[640,1500],[590,1500]]),{KEY:.0});};
// ===== 12. Ми-э: грим кумадори, удары цукэ =====
shot(35.8,38.8,(lt)=>{const pk=[1.6,1.95,2.3];let zb=0;for(const p of pk){const u=lt-p;if(u>0&&u<.25)zb+=.06*(1-u/.25);}
  E.cam={x:540,y:880,z:1.0+lt*.04+zb,r:0};E.view(.4);
  E.fill(E.rect(-300,-300,1700,2600),{KI:.8,BENI:{g:[0,0,0,1900],s:[[0,.0],[1,.55]]}});
  const rays=new Path2D();for(let i=0;i<48;i++){const a=i/48*6.283;rays.moveTo(540,800);rays.lineTo(540+Math.cos(a)*2000,800+Math.sin(a)*2000);rays.lineTo(540+Math.cos(a+.035)*2000,800+Math.sin(a+.035)*2000);}
  E.fill(rays,{BENI:.45},false);
  E.view(1);
  const kuma=ss(.25,1.55,lt);const mie=lt>1.6;const tilt=mie?K(lt,[[1.6,0],[1.7,.18,E.eo],[1.95,.18],[2.05,-.08,E.eo],[2.3,-.08],[2.4,.05,E.eo]]):0;
  // тело (плечи) и рука на рукояти
  bust(1);
  C.head([540,800],640,1,{kind:'man',kuma,brow:-1,stub:1,scar:1,tilt,cross:mie?1:0,wide:mie,mouth:mie?.25:0,blink:0});
  // меч чуть из ножен — блик
  const gl=ss(2.4,2.9,lt);C.sword([300,1700],-0.62,1700,{glint:gl});
  // шляпа слетает
  const fu=lt;if(fu<.7){const hx=540+fu*900,hy=420-fu*700+fu*fu*300;E.xf(hx,hy,fu*6,1,()=>{const hp=E.smooth([[hx-330,hy+60],[hx,hy-110],[hx+330,hy+60],[hx,hy+20]]);E.fill(hp,{KI:.65,NEZU:.35});E.stroke(hp,0,5);});}
});
cue(35.8,'whoosh_hat',.7);cue(35.85,'drone_rise',.7,{dur:2.9});cue(36.1,'brush_stroke',.5);cue(36.5,'brush_stroke',.5);cue(36.9,'brush_stroke',.5);
cue(37.4,'tsuke_hit',1.1);cue(37.75,'tsuke_hit',1.1);cue(38.1,'tsuke_hit',1.2);cue(37.4,'kakegoe',.0);cue(38.2,'unsheathe',.9);cue(38.1,'taiko_big',.8);
// ===== 13. Сёдзи распахиваются =====
shot(38.8,40.6,(lt)=>{const op=K(lt,[[.25,0],[.55,1,E.eo]]);const sk=shake(lt,.55,10);E.cam={x:560+sk[0],y:920+sk[1],z:1.05,r:0};E.view();
  hutWall(lt);
  const inside=E.rect(380,180,640,1100);E.fill(inside,{KI:{r:[700,800,100,800],s:[[0,.85],[1,.35]]},GOFUN:.0});
  // открывающаяся створка
  const dx=op*620;const pp=Wd.shojiPaper(380+dx,180,640,1100,1,700,700);Wd.shojiFrame(380+dx,180,640,1100,2,5,{fw:30,bw:10});
  E.fill(E.rect(-300,1300,1700,800),{AI:{g:[0,1300,0,1700],s:[[0,.12],[1,.3]]}});E.line([[-300,1302],[1400,1298]],3,3,0,.8);
  E.fill(E.poly([[380,1300],[1020,1300],[1300,1900],[200,1900]]),{KI:.55*op},false);
  C.fig({x:230,y:1650,h:1200,f:1,kind:'man',t:lt,seed:21,sword:{mode:'hand',grip:[560,1000],ang:-.25,one:1},hB:[lerp(380,560,op),lerp(800,820,op)],lean:.15,head:{stub:1,scar:1,kuma:1,brow:-1}});
  for(let i=0;i<20;i++){const a=r(i)*6.28,d=op*(200+r(i+1)*400);Wd.puff(700+Math.cos(a)*d,1200+Math.sin(a)*d*.4,40+r(i)*40,.3*(1-op*.6),GOFUN);}
});
cue(39.05,'door_slam',1.1);cue(39.08,'tsuke_hit',.9);cue(39.1,'taiko_big',.7);
// ===== 14. Старик у свечи: «Я тоже ждал» =====
const candle=(x,y,lt)=>{E.fill(E.rect(x-14,y-90,28,90),{GOFUN:.9,KI:.2});E.stroke(E.rect(x-14,y-90,28,90),0,2);E.fill(E.rect(x-30,y,60,14),{KEY:.8});
  const fl=Math.sin(lt*21)*4;const fp=E.smooth([[x,y-150+fl],[x+12,y-110],[x,y-92],[x-12,y-110]]);E.fill(fp,{KI:1,BENI:.35});E.fill(E.ell(x,y-115,90,90),{KI:{r:[x,y-115,10,90],s:[[0,.5],[1,0]]}},false);};
const room=(lt,lx,ly)=>{E.fill(E.rect(-300,-300,1700,2600),{KI:{r:[lx,ly,60,1300],s:[[0,.7],[1,.25]]},NEZU:{r:[lx,ly,200,1300],s:[[0,.1],[1,.85]]},AI:{r:[lx,ly,300,1400],s:[[0,0],[1,.4]]}});
  for(let i=0;i<5;i++)E.line([[-300+i*400,-300],[-300+i*400,1250]],10,10,0,.6);E.line([[-300,1250],[1400,1250]],6,6,0,.8);
  E.fill(E.rect(-300,1250,1700,900),{MIDORI:.35,KI:.55,NEZU:{r:[lx,ly,100,1200],s:[[0,.1],[1,.8]]}});for(let i=0;i<7;i++)E.line([[-300+i*260,1250],[-700+i*330,2000]],3,3,0,.5);};
shot(40.6,45.6,(lt)=>{E.cam={x:lerp(620,660,lt/5),y:960,z:lerp(1.0,1.08,lt/5),r:0};E.view();
  room(lt,640,1100);
  E.silhouette(KEY,.35,14,()=>{C.fig({x:900,y:1250,h:900,f:-1,kind:'old',kneel:1,lean:.2,t:lt});},E.rect(-300,-300,1700,1550));
  candle(620,1250,lt);
  const bow=ss(1.3,2.6,lt);const look=ss(.3,.8,lt);
  C.sword([900,1318],0,600,{}); // его меч на полу
  C.fig({x:820,y:1300,h:760,f:-1,kind:'old',kneel:1,lean:lerp(.15,1.0,bow),t:lt,seed:30,hF:[lerp(690,640,bow),lerp(1200,1280,bow)+Math.sin(lt*25)*3],hB:[lerp(720,670,bow),lerp(1220,1290,bow)],
    head:{look:lerp(0,.5,look)*(1-bow),brow:.5,nod:bow*.5,blink:bow>.9?1:undefined,mouth:lt>2.8&&lt<3.6?.3+.2*Math.sin(lt*16):0}});
  C.fig({x:150,y:1800,h:1350,f:1,kind:'man',t:lt,seed:21,sword:{mode:'hand',grip:[520,1180],ang:.3,one:1},hB:[380,1200],lean:.05,head:{stub:1,scar:1,kuma:1,brow:lerp(-1,-.5,ss(2.5,4,lt)),look:.4}});
  cap('"I WAITED 20 WINTERS TOO."',lt,2.6,5.0,46);
});
cue(40.6,'room_tone_fire',.6,{dur:5});cue(41.0,'cloth',.4);cue(42.0,'cloth',.5);cue(43.3,'old_breath',.0);cue(43.2,'shamisen_low',.7);cue(44.3,'heartbeat',.7);
// ===== 15a. Тени на стене: та самая картинка =====
const wallShadows=(lt,u,cutState)=>{};
shot(45.6,47.9,(lt)=>{E.cam={x:560,y:lerp(820,760,lt/2.3),z:lerp(1.0,1.18,eio(lt/2.3)),r:0};E.view();
  room(lt,560,1500);
  const rise=K(lt,[[0,.55],[.9,0,E.eo]]);
  E.silhouette(KEY,.85,8,()=>{C.fig(Object.assign(killerPose(340,1250,960,0),{t:lt,lean:-.05,sword:killerPose(340,1250,960,rise*.0).sword}));
    C.fig({x:780,y:1250,h:860,f:-1,kind:'father',kneel:1,lean:.7,t:lt,head:{nod:.5}});},E.rect(-300,-300,1700,1550));
  E.view(1.2);candle(560,1720,lt);
});
cue(45.6,'hook_motif',1);cue(45.6,'drone_low',.7,{dur:2.3});cue(46.1,'heartbeat',1);cue(46.8,'heartbeat',1);cue(47.4,'heartbeat',1.1);
// ===== 15b. Лицо: он понял =====
shot(47.9,49.8,(lt)=>{if(lt>.75&&lt<.88){E.cam={x:540,y:900,z:1.1,r:0};E.view();SH[0].draw(.2);E.P.fade=.0;return;}
  E.cam={x:540,y:860,z:1.05+lt*.05,r:0};E.view(.4);E.fill(E.rect(-300,-300,1700,2600),{NEZU:.8,AI:.4,KI:{r:[700,1300,50,900],s:[[0,.7],[1,0]]}});E.view(1);
  bust(1);
  const real=ss(.9,1.4,lt);
  C.head([540,780],640,1,{kind:'man',kuma:1-real*.15,brow:lerp(-1,.9,ss(.95,1.3,lt)),stub:1,scar:1,wide:lt>.95,look:lt<.7?.0:-.15,tear:ss(1.2,1.9,lt)*.9+(lt>1.2?.1:0),mouth:real*.25,blink:0});
});
cue(47.9,'heartbeat',1.1);cue(48.62,'hook_flash',.9);cue(48.85,'breath_in',.0);cue(48.9,'silence_drop',1);
// ===== 16. Удар: разрезана его тень =====
shot(49.8,53.4,(lt)=>{const hit=.32;const cutU=lt-hit;
  E.cam={x:560,y:860,z:1.12-ss(1.2,3.4,lt)*.12,r:0};E.view();
  room(lt,560,1500);
  const after=lt>hit+.25;
  E.silhouette(KEY,.85,8,()=>{C.fig({x:780,y:1250,h:860,f:-1,kind:'father',kneel:1,lean:.7,t:lt,head:{nod:.5}});},E.rect(-300,-300,1700,1550));
  const hs=(side)=>{const sep=after?ss(hit+.6,hit+2.2,lt):0;const d=after?(1-ss(hit+1.0,hit+2.6,lt))*.85:.85;if(d<=.01)return;
    const clip=side<0?E.poly([[-300,-300],[1400,-300],[1400,300],[-300,1350]]):E.poly([[-300,1350],[1400,300],[1400,2000],[-300,2000]]);
    E.clipped(clip,()=>E.xf(0,0,0,1,()=>E.silhouette(KEY,d,8+sep*20,()=>C.fig(Object.assign(killerPose(340,1250,960,lt<hit?K(lt,[[0,0],[hit,.15]]):.15),{t:lt})),E.rect(-300,-300,1700,1550)),side*sep*-120,side*sep*160));};
  hs(-1);hs(1);
  if(after){const fl=lt-hit-.6;if(fl>0)for(let i=0;i<40;i++){const x=200+r(i)*500,y=500+r(i+3)*700;const dy=fl*fl*120*(.5+r(i+5))+fl*60;E.fill(E.ell(x+Math.sin(fl*3+i)*30,y+dy,8+r(i)*10,4+r(i+1)*5,fl*3+i),{KEY:.8*(1-ss(.5,2.2,fl))},false);}
    // разрез обоев
    E.line([[1250,280],[700,610],[160,1000]],5,2,.3,1);E.line([[1240,286],[700,616],[150,1008]],2,1,0,.5,GOFUN);}
  E.view(1.2);candle(560,1720,lt);
  // разрез гравюры
  if(cutU>0&&cutU<1.0){const o=eo(cutU/.18)*(1-ss(.55,.95,cutU));E.P.cut=[360,480,-.55+Math.PI,o*44];E.P.slide=o*70;}
  if(cutU>-.06&&cutU<.04)E.P.fade=.85,E.P.fadeC=[.98,.96,.9];
  // кумадори смывается — капли киновари стекают по кадру? (в 17)
});
cue(49.8,'silence',1);cue(50.0,'swing_big',1.2);cue(50.12,'paper_slash',1.2);cue(50.12,'tsuke_hit',1.2);cue(50.14,'taiko_big',1);cue(50.4,'shamisen_snap',.0);cue(50.9,'paper_flutter',.6);cue(51.2,'wind_soft',.4,{dur:2});
// ===== 17. Рассвет: меч в снегу, он уходит =====
shot(53.4,58.4,(lt)=>{E.cam={x:lerp(520,560,lt/5),y:960,z:lerp(1.05,1.0,lt/5),r:0};
  E.view(.2);Wd.sky({MOMO:{g:[0,-100,0,1100],s:[[0,.15],[1,.75]]},KI:{g:[0,400,0,1150],s:[[0,0],[1,.65]]},AI:{g:[0,-200,0,500],s:[[0,.4],[1,0]]}});
  E.fill(E.ell(300,1120,240,240),{KI:.6,BENI:.45},false);
  E.view(.4);Wd.ridge(1060,120,6,{AI:.35,MOMO:.3},{key:2.5});
  E.view(1);const sl=E.poly([[-300,2000],[-300,1150],[600,1180],[1400,1050],[1400,2000]]);E.fill(sl,{MOMO:{g:[0,1100,0,1500],s:[[0,.25],[1,0]]}});E.stroke(sl,0,3);
  // хижина справа, старик у двери
  const hx=980,hy=1080;E.fill(E.rect(hx-180,hy-160,330,170),{KI:.45,NEZU:.6});E.stroke(E.rect(hx-180,hy-160,330,170),0,3);E.fill(E.smooth([[hx-230,hy-150],[hx-10,hy-330],[hx+210,hy-150],[hx-10,hy-170]]),{GOFUN:1});E.stroke(E.smooth([[hx-230,hy-150],[hx-10,hy-330],[hx+210,hy-150],[hx-10,hy-170]]),0,3);
  C.fig({x:hx-80,y:hy+10,h:230,f:-1,kind:'old',t:lt,lean:ss(3.0,3.6,lt)*.6+.15,seed:40,head:{nod:ss(3,3.6,lt)*.3}});
  // уходит вниз по склону
  const wu=lt/5;const px=lerp(560,200,wu),py=lerp(1250,1520,wu),ph=lerp(330,520,wu);
  E.silhouette(AI,.5,3,()=>E.xf(px,py,0,1,()=>C.fig({x:px,y:py,h:ph,f:-1,kind:'man',t:lt,walk:lt*1.25,seed:41}),0,0),null);
  C.fig({x:px,y:py,h:ph,f:-1,kind:'man',t:lt,walk:lt*1.25,seed:41,head:{stub:1,scar:1,look:-.2,nod:.05}});
  // меч воткнут в снег (передний план)
  E.view(1.25);C.sword([840,1430],-1.7,1500,{glint:ss(.5,1.6,lt)});E.fill(E.ell(830,1440,70,16),{NEZU:.35},false);
  // ветка сакуры распускается
  E.view(1.4);E.line([[-150,240],[160,300],[420,240]],38,10,0,1);E.line([[160,300],[260,440]],16,5,0,1);
  for(let i=0;i<22;i++){const b=ss(1.2+i*.08,1.6+i*.08,lt);if(b<=0)continue;const q=[[160,300],[420,240],[260,440],[0,270]][i%4];const x=q[0]+(r(i)-.5)*220,y=q[1]+(r(i+3)-.5)*130;
    const p=E.ell(x,y,30*E.back(b),24*E.back(b));E.fill(p,{MOMO:.95,GOFUN:.3});E.stroke(p,0,2,.5);}
  E.view(1);if(lt>1.5)Wd.petals(lt-1.5,30,90,{size:10,wind:-40,fall:60});
});
cue(53.4,'dawn_birds',.5,{dur:5});cue(53.5,'shamisen_resolve',.8);cue(53.6,'footsteps_snow',.45,{dur:4.6});cue(56.5,'temple_bell',.5);
// ===== 18. Финал: мысль =====
shot(58.4,64.6,(lt)=>{E.cam={x:540,y:lerp(960,880,lt/6),z:1.0,r:0};
  E.view(.2);Wd.sky({MOMO:{g:[0,-100,0,1500],s:[[0,.1],[1,.45]]},KI:{g:[0,600,0,1500],s:[[0,0],[1,.35]]}});
  E.view(1);E.fill(E.rect(-300,1350,1700,800),{MOMO:{g:[0,1350,0,1700],s:[[0,.2],[1,0]]}});E.line([[-300,1352],[1400,1348]],3,3,0,.7);
  C.sword([540,1560],-1.62,1300,{});E.fill(E.ell(530,1570,60,14),{NEZU:.35},false);
  Wd.petals(lt+3.5,36,90,{size:11,wind:-40,fall:60});
  E.screen();
  const a1=cl((lt-.2)/.4)*(1-ss(2.6,2.9,lt)),a2=cl((lt-3.0)/.4);
  if(a1>0){Wd.cart('20 WINTERS',540,560,56,{a:a1});Wd.cart('HE HUNTED A SHADOW.',540,700,56,{a:cl(a1*1.4-.4)});}
  if(a2>0){Wd.cart('ONE SECOND MORE —',540,560,52,{a:a2});Wd.cart("AND HE'D HAVE BECOME ONE.",540,690,52,{a:cl((lt-3.5)/.4)});}
  Wd.seal(540,920,120,ss(4.6,4.75,lt),'二十の冬');
  Wd.curtain(ss(5.15,6.1,lt));
});
cue(58.4,'shamisen_end',.8);cue(58.6,'tsuke_soft',.5);cue(61.4,'tsuke_soft',.5);cue(63.0,'seal_stamp',1);cue(63.0,'taiko_big',.6);cue(63.55,'hyoshigi_roll',1);cue(63.5,'curtain',.7);

window.STORY={SH,dur:SH[SH.length-1].b,draw(t){let sh=SH.find(s=>t>=s.a&&t<s.b)||SH[SH.length-1];const lt=t-sh.a;
  E.cam={x:540,y:960,z:1,r:0};E.P.rev.fill(1);E.regBase(sh.seed);E.P.cut=[0,0,0,0];E.P.slide=0;E.P.fade=0;E.P.grain=1;
  if(sh.print){ORDER.forEach((id,k)=>{E.P.rev[id]=cl((lt-k*.065)/.2);});}
  sh.draw(lt,t,sh);}};
window.DURATION=window.STORY.dur;
})();
