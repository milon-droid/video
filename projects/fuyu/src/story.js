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

window.STORY={SH,dur:SH[SH.length-1].b,draw(t){let sh=SH.find(s=>t>=s.a&&t<s.b)||SH[SH.length-1];const lt=t-sh.a;
  E.cam={x:540,y:960,z:1,r:0};E.P.rev.fill(1);E.regBase(sh.seed);E.P.cut=[0,0,0,0];E.P.slide=0;E.P.fade=0;E.P.grain=1;
  if(sh.print){ORDER.forEach((id,k)=>{E.P.rev[id]=cl((lt-k*.065)/.2);});}
  sh.draw(lt,t,sh);}};
window.DURATION=window.STORY.dur;
})();
