// STORY — «PIECES». Планы: {a,b,f(t,lt)} lt — время от начала плана.
(function(){
const{K,ss,eo,eio,ei,cl,lerp,rnd,P,Ps,Pe,Pr,piece,pline}=E;
const SH=[];const CUES=[];
const shot=(a,b,f)=>SH.push({a,b,f});
const cue=(t,id,g=1,o={})=>CUES.push(Object.assign({t,id,g},o));
const ban=(txt,t,a,b,y=330,o={})=>{if(t<a||t>b)return;const ap=Math.min(eo((t-a)/.45),1-ss(b-.3,b,t));E.save();E.screen();E.banner(txt,540,y,Object.assign({size:58,ap},o));E.restore();};
const breath=(t,ph=0)=>Math.sin(t*2.2+ph)*.012;
const blinkAt=(t,ts)=>{for(const b of ts){const d=t-b;if(d>0&&d<.16)return Math.sin(d/.16*Math.PI);}return 0;};
const blinks=(t,seed=0)=>{const p=3.1+seed*.7;const d=((t+seed*1.3)%p);return d<.15?Math.sin(d/.15*Math.PI):0;};
const shake=(t,t0,amp,dur=.4)=>{const u=(t-t0)/dur;if(u<0||u>1)return[0,0];const k=amp*(1-u);return[Math.sin(t*90)*k,Math.cos(t*77)*k];};

// ================= 1. ХУК: мяч в экран =================
const S1=(t)=>{Wd.mood('day');E.cam={x:540+t*20,y:960-t*30,z:1+t*.05,r:0};E.view();
  Wd.sky('#1a48a8','#6aa8e8',200,1300,4);Wd.sun(820,330,70);Wd.cloud(250,420,1.2);Wd.cloud(700,600,.8);
  Wd.church(860,1180,.9);Wd.hills(1080,'#3a7a30',60,2,200);Wd.house(80,1180,150,130);Wd.house(300,1200,120,110,'#e0c890','#3a5aa0');
  Wd.hills(1330,'#2a6a24',50,5,210);
  // мальчик бьёт
  const kick=K(t,[[0,-.7],[.3,-.95,eio],[.42,1.25,eo],[.9,.9,eio]]);
  const kn=K(t,[[0,1.2],[.3,1.5],[.42,.1,eo],[.9,.3]]);
  C.fig({x:360,y:1500-K(t,[[0,0],[.4,18],[.9,6]]),kind:'boy',s:2.0,lean:K(t,[[0,.12],[.35,.2],[.45,-.15,eo],[.9,-.08]]),legL:[kick,kn],legR:[-.15,.1],
    armL:[K(t,[[0,.6],[.42,-.7,eo]]),.4],armR:[K(t,[[0,-.6],[.42,.9,eo]]),.5],head:{mouth:t<.42?'flat':'smile',open:.4,look:[.6,-.3],brow:.3,blink:blinks(t,1)}});
  // мяч
  const u=cl((t-.4)/.55);
  if(t<.4){Wd.ball(560,1590,46,0);}else{const z=1+Math.pow(u,2.2)*6.2;Wd.ball(560,lerp(1590,980,eo(u)),46*z,u*7);}
  E.screen();
  ban('I WAS 8 WHEN I BROKE IT.',t,.08,9,330,{size:60});
  if(t>=.95)Wd.cracks(560,980,(t-.95)/.2+.01,3);};
shot(0,1.15,(t)=>S1(t));
cue(0,'amb_day',.6,{dur:1.2});cue(0.4,'kick',1);cue(.95,'crack',1);cue(1.15,'shatter',1.2);cue(0,'hit_low',.8);

// ================= 2. окно с дырой, мальчик в дыре =================
const holePts=[[420,640],[470,560],[520,610],[600,530],[640,640],[700,620],[690,720],[740,790],[650,830],[640,900],[560,860],[500,930],[470,840],[390,820],[420,740],[360,700]];
const quarry=(x,y,w,h,seed)=>{const dw=150,dh=210;
  for(let j=-1;j<h/dh*2+2;j++)for(let i=-1;i<w/dw+2;i++){const cx=x+i*dw+(j%2?dw/2:0),cy=y+j*dh/2;const p=E.P([[cx,cy-dh/2],[cx+dw/2,cy],[cx,cy+dh/2],[cx-dw/2,cy]]);
    piece(p,E.jit((i+j)%3?'#e6d39a':'#cfdcc0',i*7+j*13+seed,.1),{seed:rnd(i*3.1+j*7.7)});
    E.pline([[cx,cy-dh*.18],[cx,cy+dh*.18]],4,.45);E.pline([[cx-dw*.14,cy],[cx+dw*.14,cy]],4,.45);E.pfill(Pe(cx,cy,9,9),.35);}
  // кайма
  const ar=E.Parch(x,y,w,h),inner=E.Parch(x+44,y+44,w-88,h-88);const band=new Path2D();band.addPath(ar);band.addPath(inner);
  E.X.G.save();E.X.M.save();E.X.T.save();E.X.G.clip(band,'evenodd');E.X.M.clip(band,'evenodd');E.X.T.clip(band,'evenodd');
  E.mosaic(E.Pr(x,y,w,h),[x,y,w,h],60,(xx,yy,i)=>Wd.SHC[i%6],{split:0,jit:.1,seed:seed+5});E.X.G.restore();E.X.M.restore();E.X.T.restore();E.lead(inner,9);};const S2=(t,lt)=>{Wd.mood('day');E.L.light=1.15;
  const z=K(lt,[[0,1.0],[3.8,1.18]]);E.cam={x:K(lt,[[0,540],[3.8,560]]),y:K(lt,[[0,900],[3.8,780]]),z,r:0};E.view();
  // снаружи (видно через дыру): небо и мальчик
  E.save();E.clip(E.Ps(holePts));
  Wd.sky('#2458b8','#7ab4f0',160,1200,9);
  const peek=eo((lt-.5)/.6);
  C.fig({x:560,y:1250+ (1-peek)*400,kind:'boy',s:2.4,armL:[1.9,.8],armR:[1.9,.8],head:{mouth:'o',open:K(lt,[[0,.3],[1.5,.6]]),brow:-.8,raise:1,look:[K(lt,[[0,0],[2.2,0],[2.6,.8]]),K(lt,[[0,.4],[2.2,.4],[2.6,.6]])],blink:blinkAt(lt,[1.3,3.2])}});
  E.restore();
  // стена мастерской
  const wallP=new Path2D();wallP.rect(-300,-300,1680,2600);const ar=E.Parch(150,180,780,1260);wallP.addPath(ar);
  E.save();E.X.G.save();E.X.M.save();E.X.T.save();E.X.G.clip(wallP,'evenodd');E.X.M.clip(wallP,'evenodd');E.X.T.clip(wallP,'evenodd');
  Wd.wall('#6a4224',140,5);E.X.G.restore();E.X.M.restore();E.X.T.restore();E.restore();
  // остатки окна вокруг дыры
  const rest=new Path2D();rest.addPath(ar);rest.addPath(E.Ps(holePts));
  E.save();E.X.G.save();E.X.M.save();E.X.T.save();E.X.G.clip(rest,'evenodd');E.X.M.clip(rest,'evenodd');E.X.T.clip(rest,'evenodd');
  quarry(150,180,780,1260,4);
  // цветная роза наверху окна
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;piece(E.P([[540+Math.cos(a-.3)*70,400+Math.sin(a-.3)*70],[540+Math.cos(a)*150,400+Math.sin(a)*150],[540+Math.cos(a+.3)*70,400+Math.sin(a+.3)*70]]),i%2?'#c8282c':'#2a5cc0');}
  piece(Pe(540,400,72),'#e8b030');E.pvig(Pe(540,400,72),540,400,20,72,.4);
  E.X.G.restore();E.X.M.restore();E.X.T.restore();E.restore();
  E.lead(E.Ps(holePts),9);E.lead(ar,24);
  // трещины от дыры
  for(let i=0;i<7;i++){const a=i/7*6.28+.3,r0=150,r1=260+rnd(i)*180;E.leadLine([[555+Math.cos(a)*r0,730+Math.sin(a)*r0*1.1],[555+Math.cos(a+.1)*r1,730+Math.sin(a+.1)*r1*1.1]],4);}
  // пол с осколками
  const fl=E.P([[-300,1440],[1380,1440],[1380,2300],[-300,2300]]);E.mosaic(fl,[-300,1440,1680,900],170,(x,y,i)=>E.jit('#5a3a22',i,.2),{split:.1,seed:31,ky:.45});
  for(let i=0;i<22;i++)Wd.shard(200+rnd(i*3)*700,1480+rnd(i*5)*300,14+rnd(i*7)*22,Wd.SHC[i%8],rnd(i)*6,i+1,.4+.6*Math.max(0,Math.sin(lt*3+i)));
  E.screen();
  ban('IT WAS THE OLD GLAZIER’S WINDOW.',lt,1.2,9,330,{size:52});};
shot(1.15,5.0,(t)=>{const lt=t-1.15;S2(t,lt);E.shatter={key:'s1',cx:560,cy:980,u:lt/1.0,seed:3,draw:()=>S1(1.15)};});
cue(1.3,'shards_fall',.8);cue(1.6,'amb_room',.5,{dur:3.4});cue(2.2,'tinkle',.5);

// ================= 3. он не кричал =================
const S3=(t,lt)=>{Wd.mood('day');E.cam={x:K(lt,[[0,560],[4.6,530]]),y:K(lt,[[0,1000],[4.6,960]]),z:K(lt,[[0,1.0],[4.6,1.08]]),r:0};E.view();
  Wd.sky('#1e50ae','#78b0ea',200,1100,6);Wd.cloud(800,300,1);
  // стена мастерской с дверью
  E.piece(E.Pr(-200,350,1480,1000),'#b08a5a',{tex:.4,lead:false});E.mosaic(E.Pr(-200,350,1480,1000),[-200,350,1480,1000],150,(x,y,i)=>E.jit('#a87a48',i,.18),{split:.05,seed:41,ky:.6});
  Wd.window(80,560,300,460,()=>{E.mosaic(E.Pr(80,560,300,460),[80,560,300,460],80,(x,y,i)=>E.jit(Wd.SHC[i%8],i,.1),{split:.2,seed:12});});
  piece(E.Parch(640,620,300,730),'#5a3418',{tex:.85});
  // мостовая
  const gr=E.P([[-300,1300],[1380,1300],[1380,2300],[-300,2300]]);E.mosaic(gr,[-300,1300,1680,1000],120,(x,y,i)=>E.jit('#8a8478',i,.25),{split:.15,seed:44,ky:.5});
  for(let i=0;i<16;i++)Wd.shard(150+rnd(i*3+1)*800,1360+rnd(i*5+2)*240,14+rnd(i*7)*18,Wd.SHC[i%8],rnd(i)*6,i+40,.3+.7*Math.max(0,Math.sin(lt*2.5+i)));
  // стекольщик (по пояс) поднимает красный осколок к солнцу и смотрит сквозь него на мальчика
  const lift=eio((lt-.9)/1.1);const look=eio((lt-2.3)/.6);
  const shardHold=()=>{if(lift>0.02){E.xf(-4,30,0,.62,()=>{const p=E.P([[-34,-44],[30,-52],[42,10],[2,48],[-40,14]]);piece(p,'#c80c10',{seed:.9,lw:7});E.emit(p,.05+.12*look);});}};
  C.fig({x:320,y:1560,kind:'old',s:2.25,lean:K(lt,[[0,.32],[.9,.32],[2.0,.06]]),legL:[.1,0],legR:[-.1,0],
    armL:[K(lt,[[0,.5],[.9,.6],[2.0,1.2]]),K(lt,[[0,.4],[.9,.5],[2.0,2.3]])],armR:[.2,.4],hold:shardHold,
    head:{mouth:look>.5?'smile':'flat',open:.15,look:[K(lt,[[0,.2],[1.8,.4],[2.4,.9]]),K(lt,[[0,.7],[1.6,-.5],[2.4,0]])],blink:blinkAt(lt,[.6,2.0,3.9]),brow:-.15*look}});
  if(look>0)E.emitDot(560,1000,120*look,.18*look);
  // мальчик съёжился → открывает глаза
  const peek=ss(2.6,3.0,lt);
  C.fig({x:800,y:1700,kind:'boy',s:2.35,dir:-1,lean:K(lt,[[0,.1],[2.8,.1],[3.2,0]]),headDy:K(lt,[[0,16],[2.8,16],[3.2,0]]),
    armL:[K(lt,[[0,.7],[2.8,.7],[3.3,.2]]),K(lt,[[0,2.0],[2.8,2.0],[3.3,.3]])],armR:[K(lt,[[0,.8],[2.8,.8],[3.3,.1]]),K(lt,[[0,1.9],[2.8,1.9],[3.3,.3]])],
    head:{blink:Math.max(1-peek,blinkAt(lt,[4.2])),brow:-.9*(1-peek)+(-.5)*peek,mouth:peek>.5?'o':'frown',open:.2,look:[.7,.1],raise:peek}});
  // передний план: камни мостовой закрывают ноги
  const fg=E.P([[-300,1500],[1380,1460],[1380,2300],[-300,2300]]);E.mosaic(fg,[-300,1450,1680,900],130,(x,y,i)=>E.jit('#7a7468',i,.25),{split:.15,seed:46,ky:.55});
  for(let i=0;i<10;i++)Wd.shard(120+rnd(i*3+5)*840,1560+rnd(i*5+6)*140,16+rnd(i*7)*20,Wd.SHC[i%8],rnd(i)*6,i+60,.3+.7*Math.max(0,Math.sin(lt*2.5+i*2)));
  E.screen();
  ban('HE DIDN’T YELL.',lt,.3,2.1,330,{size:62});
  ban(['HE SAID:','“BRING ME EVERY PIECE.”'],lt,2.3,9,330,{size:56});};
shot(5.0,9.6,(t)=>S3(t,t-5.0));
cue(5.0,'amb_day',.5,{dur:4.6});cue(5.3,'glass_pick',.6);cue(6.4,'shimmer',.5);cue(7.6,'chime',.6);

// ================= 4. собирает каждый кусок =================
const S4=(t,lt)=>{Wd.mood('eve');E.cam={x:K(lt,[[0,520],[3.8,560]]),y:1000,z:K(lt,[[0,1.15],[3.8,1.25]]),r:0};E.view();
  Wd.sky('#4a2a6a','#f09048',190,1200,15);Wd.sun(240,900,90);Wd.hills(1000,'#2a4a3a',60,7,200);
  const gr=E.P([[-300,1250],[1380,1250],[1380,2300],[-300,2300]]);E.mosaic(gr,[-300,1250,1680,1000],120,(x,y,i)=>E.jit('#6a5a50',i,.25),{split:.15,seed:47,ky:.5});
  // цикл: нагнуться — взять — положить в ящик (период 1.2 с)
  const per=1.25,ph=(lt%per)/per,n=Math.floor(lt/per);
  const reach=ph<.45?eio(ph/.45):1-eio((ph-.45)/.55);
  for(let i=0;i<12;i++){if(i<n+2&&i<6)continue;Wd.shard(250+rnd(i*3+9)*620,1300+rnd(i*5+3)*200,14+rnd(i*7)*16,Wd.SHC[(i+3)%8],rnd(i)*6,i+80,.4+.6*Math.max(0,Math.sin(lt*3+i)));}
  Wd.box(700,1400,240,150,1);
  for(let i=0;i<Math.min(n,8);i++)Wd.shard(740+i*22,1270,13,Wd.SHC[i%8],i,i+120,.6);
  const held=()=>{if(ph>.3&&ph<.85)Wd.shard(0,36,14,Wd.SHC[(n+3)%8],n,n+80,.8);};
  C.fig({x:500,y:1350,kind:'boy',s:2.1,lean:.12+reach*.3,legL:[.2,0],legR:[-.1,0],
    armL:[lerp(.5,.15,reach)+(ph>.45?lerp(0,1.0,eio((ph-.45)/.35)):0),lerp(.7,.05,reach)],armR:[.35,1.2],hold:held,
    head:{mouth:'sad',look:[lerp(.8,.2,reach),lerp(-.1,.8,reach)],blink:blinks(lt,2),brow:-.3}});
  const fg=E.P([[-300,1390],[400,1370],[1380,1400],[1380,2300],[-300,2300]]);E.mosaic(fg,[-300,1360,1680,900],130,(x,y,i)=>E.jit('#5a4a42',i,.25),{split:.15,seed:48,ky:.55});
  for(let i=0;i<8;i++)Wd.shard(150+rnd(i*3+15)*800,1440+rnd(i*5+16)*120,16+rnd(i*7)*16,Wd.SHC[(i+5)%8],rnd(i)*6,i+150,.4+.6*Math.max(0,Math.sin(lt*3+i*2)));
  E.screen();
  ban('EVERY. SINGLE. PIECE.',lt,.4,9,330,{size:60});};
shot(9.6,13.4,(t)=>S4(t,t-9.6));
cue(9.6,'amb_eve',.5,{dur:3.8});[10.2,11.45,12.7].forEach(x=>cue(x,'glass_pick',.55));

// ================= 5. ночная мастерская: свинец и пайка =================
const workshop=(lt,mood,o={})=>{
  Wd.wall('#4a3222',150,o.wseed||5);
  Wd.window(380,300,320,520,()=>{if(o.season)o.season();else{Wd.sky('#0a1030','#1a2450',90,900,3);for(let i=0;i<14;i++)E.emitDot(400+rnd(i)*280,320+rnd(i*3)*480,4,.3);}});
  Wd.shelf(-40,880,380,['#c8282c','#2a5cc0','#e8b030','#2a8a4a','#7a3ab0'],3);Wd.shelf(760,820,380,['#3ab0c0','#e86a20','#c8282c','#2a8a4a'],7);
  if(o.hook){piece(E.Pr(70,420,16,40),'#3a2a1a',{tex:.9});C.apronOnHook&&C.apronOnHook(78,450);}
};
const tableFront=(y=1250)=>Wd.table(y,'#4a2e1a');
const S5=(t,lt)=>{Wd.mood('night');E.L.lamp=[.9,.36,.2,1+.06*Math.sin(lt*13)+.04*Math.sin(lt*7.3)];
  E.cam={x:540,y:K(lt,[[0,1020],[5,980]]),z:K(lt,[[0,1.08],[5,1.15]]),r:0};E.view();
  workshop(lt,'night');
  const touch=[1.5,2.8];const tc=touch.find(x=>lt>x-.35&&lt<x+.5);const press=tc!=null?Math.sin(cl((lt-tc+.35)/.85)*Math.PI):0;
  C.fig({x:310,y:1760,kind:'old',s:2.55,lean:.14+press*.05,armL:[.5+press*.1,1.25-press*.2],armR:[.25,1.55],gripL:1,
    hold:()=>{E.xf(0,40,-.5,1,()=>Wd.iron(0,0,0));},head:{look:[.6,.8],blink:blinks(lt,1),mouth:'flat',brow:-.1}});
  const amaze=ss(1.6,1.9,lt),smile=ss(3.4,3.7,lt);
  C.fig({x:800,y:1530,kind:'boy',s:2.45,dir:-1,lean:.1+amaze*.12,armL:[.35,1.75],armR:[.25,1.8],
    head:{mouth:smile>.5?'smile':(amaze>.3?'o':'flat'),open:.3+amaze*.3,raise:amaze*(1-smile),brow:-.3*amaze,look:[.4,.7],blink:blinks(lt,3)}});
  tableFront(1340);
  // на столе: узор из осколков в свинце (банка-цветок)
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const r1=60,r2=130;piece(E.P([[560+Math.cos(a)*r1,1395+Math.sin(a)*r1*.35],[560+Math.cos(a)*r2,1395+Math.sin(a)*r2*.35],[560+Math.cos(a+.7)*r2,1395+Math.sin(a+.7)*r2*.35],[560+Math.cos(a+.7)*r1,1395+Math.sin(a+.7)*r1*.35]]),Wd.SHC[i%8],{lw:6});}
  piece(E.Pe(560,1395,60,21),'#e8b030',{lw:6});
  Wd.lamp(985,1345,1,1.1);
  if(tc!=null)Wd.sparks(480,1385,lt-tc,Math.round(tc*10),16,1.1);
  E.screen();ban('NOTHING HERE GETS THROWN AWAY.',lt,.4,9,330,{size:54});};
shot(13.4,18.4,(t)=>S5(t,t-13.4));
cue(13.4,'amb_night',.5,{dur:5});cue(14.9,'solder',.8);cue(16.2,'solder',.8);cue(13.6,'lamp',.3);

// ================= 6. десять лет =================
const S6=(t,lt)=>{const D=1.87,b=Math.min(2,Math.floor(lt/D)),u=lt-b*D;
  const seasons=[()=>{Wd.sky('#4a8ad8','#a8d8f0',110,900,5);for(let i=0;i<10;i++)piece(E.Pe(400+rnd(i)*280,700+rnd(i*3)*120,22),'#f0a0c0',{lw:5});},
    ()=>{Wd.sky('#e07a30','#f0c060',110,900,6);for(let i=0;i<8;i++)piece(E.Pe(400+rnd(i)*280,400+((rnd(i*3)*480+u*120)%480),18,12,i),'#c8501a',{lw:5});},
    ()=>{Wd.sky('#5a6a90','#a0b0c8',110,900,7);Wd.snow(u,400,320,280,480,25);}];
  Wd.mood(b==1?'eve':(b==2?'winter':'day'));E.L.light*=b==2?1.25:1;E.L.light+=Math.max(0,1-u/.22)*1.6*(b>0?1:0);
  E.cam={x:540,y:1000,z:1.08+u*.02,r:0};E.view();
  workshop(lt,'day',{season:seasons[b]});
  const kinds=[['boy',2.4,1530],['youth',2.2,1700],['youth',2.5,1760]];const[kd,ks,ky]=kinds[b];
  const act=b==0?Math.sin(u*5)*.12:(b==1?0:ss(.5,1.1,u));
  C.fig({x:300,y:1760,kind:'old',s:2.5,lean:.1+b*.1,headDy:b*4,armL:[.45+(b==2?ss(.9,1.3,u)*.6:0),1.3],armR:[.25,1.5],head:{look:[.6,.3],mouth:b==2?'smile':'flat',blink:blinks(lt,1),brow:-.1}});
  const pane=()=>{if(b==2){E.xf(0,30,0,1,()=>{const p=E.Pr(-60,-120,120,150);E.mosaic(p,[-60,-120,120,150],50,(x,y,i)=>Wd.SHC[i%8],{split:.3,seed:3});E.emit(p,act*.15);});}
    else if(b==0){E.xf(0,40,-.4,1,()=>{piece(E.P([[-6,0],[6,0],[4,90],[-4,90]]),'#9aa0aa');});}
    else{E.xf(0,40,-.5,1,()=>Wd.iron(0,0,0));}};
  C.fig({x:790,y:ky,kind:kd,s:ks,dir:-1,lean:.1,armL:[b==2?K(u,[[0,.4],[.5,.4],[1.1,1.35]]):.4+act,b==2?K(u,[[0,1.6],[1.1,.9]]):1.6],armR:[.25,1.7],hold:pane,
    head:{look:b==2?[.2,-.6]:[.5,.8],mouth:b==2?'smile':'flat',blink:blinks(lt,2),brow:-.1}});
  tableFront(1340);Wd.lamp(985,1345,0,1.1);
  if(b==1&&u>.6&&u<1.6)Wd.sparks(600,1360,(u-.6)%.5,b*7,10,.9);
  if(b==0&&u>.3)E.emitDot(lerp(560,680,cl((u-.3)/1.2)),1370,18,.7);
  E.screen();ban('HE TAUGHT ME FOR TEN YEARS.',lt,.2,9,330,{size:54});
  E.save();E.screen();E.banner('AGE '+[10,14,18][b],540,470,{size:40,ap:Math.min(1,u/.3),col:'#d8c890'});E.restore();};
shot(18.4,24.0,(t)=>S6(t,t-18.4));
cue(18.4,'amb_room',.45,{dur:5.6});cue(18.5,'cut_glass',.6);cue(20.27,'flare',.5);cue(20.9,'solder',.6);cue(22.14,'flare',.5);cue(23.0,'chime',.6);

// ================= 7. «ещё кусочки» =================
const S7=(t,lt)=>{Wd.mood('eve');E.L.light=1.1;E.cam={x:K(lt,[[0,560],[4.4,540]]),y:K(lt,[[0,1000],[4.4,980]]),z:K(lt,[[0,1.25],[4.4,1.32]]),r:0};
  const sk=shake(lt,1.45,6,.3);E.cam.x+=sk[0];E.cam.y+=sk[1];E.view();
  workshop(lt,'eve',{season:()=>Wd.sky('#e07a30','#f0c060',110,900,6)});
  const drop=1.0;const fall=cl((lt-drop)/.45);const laugh=ss(1.9,2.1,lt);
  const trem=lt<drop?Math.sin(lt*38)*.05*ss(.2,.5,lt):0;
  const held=()=>{if(lt<drop)E.xf(0,40,0,1,()=>piece(E.P([[-30,-30],[30,-34],[34,28],[-26,32]]),'#2a5cc0',{lw:6}));};
  C.fig({x:330,y:1700,kind:'old',s:2.4,lean:.12+laugh*Math.abs(Math.sin(lt*9))*.05,armL:[.7,1.3],wristL:trem,armR:[.25,1.5],hold:held,headDy:laugh*Math.sin(lt*18)*4,
    head:{mouth:laugh>.5?'laugh':(fall>0?'o':'flat'),open:laugh*(.5+.5*Math.abs(Math.sin(lt*16))),look:[lt<drop?.3:0,lt<drop?.4:.9],blink:laugh>.5?.75:blinks(lt,1),brow:laugh>.5?-.3:0}});
  const flinch=ss(1.4,1.5,lt)*(1-ss(1.9,2.4,lt));const sm=ss(2.6,2.9,lt);
  C.fig({x:790,y:1740+flinch*12,kind:'youth',s:2.4,dir:-1,lean:.08,headDy:flinch*12,armL:[.3+flinch*.4,1.7],armR:[.2,1.8],
    head:{blink:Math.max(flinch,blinks(lt,2)),mouth:sm>.5?'laugh':'flat',open:sm*.4,brow:-.5*flinch,look:[.6,.3+(1-sm)*.4]}});
  // падение синего куска
  if(fall>0&&fall<1){const y=lerp(1180,1750,fall*fall);E.xf(560,y,fall*5,1,()=>piece(E.P([[-30,-30],[30,-34],[34,28],[-26,32]]),'#2a5cc0',{lw:6}));}
  tableFront(1380);
  if(lt>drop+.45){const u=lt-drop-.45;for(let i=0;i<14;i++){const a=-Math.PI/2+(rnd(i)-.5)*2.4,v=300+rnd(i*3)*500;if(u>.7)break;Wd.shard(560+Math.cos(a)*v*u,1750+Math.sin(a)*v*u+1400*u*u,10+rnd(i*5)*12,'#2a5cc0',u*8+i,i+300,1-u);}}
  E.screen();ban('HA! MORE PIECES.',lt,1.95,9,330,{size:62});};
shot(24.0,28.4,(t)=>S7(t,t-24.0));
cue(24.0,'amb_eve',.4,{dur:4.4});cue(25.45,'glass_small',1);cue(25.95,'laugh_bed',.0);

// ================= 8. зима. его нет =================
C.apronOnHook=(x,y)=>{const p=E.P([[x-60,y],[x+60,y],[x+80,y+380],[x-80,y+380]]);piece(p,'#9a5e2c',{tex:.5});E.pgrad(p,x-80,0,x+80,0,.3,.05);E.leadLine([[x-50,y],[x,y-30],[x+50,y]],7);};
const S8=(t,lt)=>{Wd.mood('winter');E.L.light=.7;E.cam={x:K(lt,[[0,560],[5,700]]),y:K(lt,[[0,1000],[5,900]]),z:K(lt,[[0,1.05],[5,1.5]]),r:0};E.view();
  workshop(lt,'winter',{season:()=>{Wd.sky('#3a4a70','#7a8aa8',110,900,8);Wd.snow(lt,380,300,320,520,30);},hook:1});
  // пустой табурет
  piece(E.Pe(330,1380,110,26),'#6a4020',{tex:.8});piece(E.P([[250,1395],[270,1395],[250,1700],[230,1700]]),'#5a3418',{tex:.8});piece(E.P([[390,1395],[410,1395],[430,1700],[410,1700]]),'#5a3418',{tex:.8});
  const cr=ss(1.4,3.0,lt);
  C.fig({x:790,y:1770,kind:'youth',s:2.55,dir:-1,lean:.1,headRot:.12,armL:[.15,.1],armR:[.1,.1],
    head:{mouth:'sad',brow:-.7,look:[-.6,.7],blink:Math.max(.35,blinks(lt,2)),crack:cr,tear:ss(3.0,4.6,lt)}});
  tableFront(1560);
  E.L.light*=1-ss(4.6,5.0,lt)*.85;
  E.screen();ban('THEN HE WAS GONE.',lt,.5,4.7,330,{size:62});};
shot(28.4,33.4,(t)=>S8(t,t-28.4));
cue(28.4,'amb_winter',.6,{dur:5});cue(28.5,'bell',.9);cue(29.8,'crack_slow',.8);

// ================= 9. ящик и записка =================
const S9=(t,lt)=>{
  if(lt<2.3){Wd.mood('winter');E.L.light=lerp(.25,.8,ss(0,.6,lt));E.cam={x:600,y:1050,z:1.25,r:0};E.view();
    workshop(lt,'winter',{season:()=>{Wd.sky('#3a4a70','#7a8aa8',110,900,8);Wd.snow(lt,380,300,320,520,30);}});
    const lid=ss(.8,1.4,lt);
    C.fig({x:540,y:1780,kind:'youth',s:2.4,lean:.45,armL:[.6+lid*.3,.5],armR:[.3,.9],head:{mouth:lid>.5?'o':'sad',open:.2,brow:-.4+lid*.2,raise:lid,look:[.5,.9],blink:blinks(lt,1),crack:1}});
    tableFront(1400);
    Wd.box(600,1600,300,170,lid);if(lid>.3){for(let i=0;i<6;i++)E.emitDot(640+i*40,1440,16,.35*lid);E.emitDot(750,1440,90,.12*lid);}
  }else{const u=lt-2.3;Wd.mood('dawn');E.L.light=.5;E.L.sun=[.5,.55,.5];E.L.skyB=[1.1,.8,.55];
    E.cam={x:540,y:K(u,[[0,1100],[3.3,1000]]),z:K(u,[[0,1.15],[3.3,1.05]]),r:K(u,[[0,.03],[3.3,0]])};E.view();
    E.ASM=()=>({u:0});E.ASMlead=false;Wd.design(lt);E.ASM=null;E.ASMlead=true;
    // записка
    const note=E.P([[110,1270],[970,1250],[985,1660],[95,1680]]);piece(note,'#f2e6c6',{tex:.6,lw:6});
    E.X.M.save();E.X.M.globalCompositeOperation='lighter';E.X.M.fillStyle='rgb(0,255,0)';E.X.M.font="italic 600 112px Corm";E.X.M.lineWidth=3;E.X.M.strokeStyle="rgb(0,255,0)";E.X.M.textAlign='center';
    const l1='I kept every piece.',l2='Finish it.';const vis=cl((u-.3)/1.6);const n1=Math.floor(l1.length*cl(vis*1.6)),n2=Math.floor(l2.length*cl(vis*1.6-1));
    E.X.M.textAlign='left';for(const f of['fillText','strokeText']){E.X.M[f](l1.slice(0,n1),540-E.X.M.measureText(l1).width/2,1430);E.X.M[f](l2.slice(0,n2),540-E.X.M.measureText(l2).width/2,1570);}E.X.M.restore();
    for(let i=0;i<5;i++)Wd.shard(200+i*170,1740+rnd(i)*40,26,['#e6d39a','#c8282c','#2a5cc0','#e8b030','#cfdcc0'][i],i,i+400,.5+.5*Math.sin(u*2+i));}
};
shot(33.4,39.0,(t)=>S9(t,t-33.4));
cue(33.4,'amb_winter',.4,{dur:2.3});cue(34.2,'box',.8);cue(34.6,'shimmer',.6);cue(35.7,'paper',.7);cue(36.0,'choir_soft',.0);

// ================= 10. сборка =================
const S10=(t,lt)=>{
  if(lt<5.0){Wd.mood('dawn');E.L.light=1;E.L.sun=[.5,.62,.3];
    E.cam={x:540,y:K(lt,[[0,1150],[5,960]]),z:K(lt,[[0,1.55],[5,1.0]]),r:0};E.view();
    const N=260;
    E.ASM=i=>{const d=.2+(rnd(i*1.31)*.55+ (i/N)*.45)*3.9;const u=cl((lt-d)/.55);const a=rnd(i*7.7)*6.28,r=700+rnd(i*3.3)*600;return{u,dx:Math.cos(a)*r,dy:Math.sin(a)*r};};
    Wd.design(lt);E.ASM=null;E.flushASM();
    // искры пайки в стыках
    for(let k=0;k<6;k++){const tk=.8+k*.62;if(lt>tk&&lt<tk+.5)Wd.sparks(250+rnd(k*9)*580,500+rnd(k*5)*1100,lt-tk,k+50,10,.9);}
  }else{const u=lt-5.0;Wd.mood('dawn');E.L.light=1.05;E.L.sun=[.3,.6,.25];E.cam={x:540,y:K(u,[[0,900],[2,870]]),z:K(u,[[0,1],[2,1.05]]),r:0};E.view();
    Wd.wall('#5a3a20',150,5);
    C.fig({x:540,y:2500,kind:'youth',s:4.6,armL:[.1,.1],armR:[.1,.1],head:{mouth:u>.9?'smile':'flat',look:[-.2,-.6],blink:blinkAt(u,[1.4]),brow:-.15,crack:1,heal:ss(.1,.9,u)}});
    if(u<1.2)E.emitDot(540+lerp(-210,230,cl(u/1)),1040+lerp(-150,130,cl(u/1)),40,1-cl(u/1.1));}
  E.screen();};
shot(39.0,46.0,(t)=>S10(t,t-39.0));
cue(39.0,'build_bed',.0);for(let k=0;k<6;k++)cue(39.8+k*.62,'solder',.45);cue(44.0,'heal',.8);

// ================= 11. собор: свет на полу, девочка и чашка =================
const S11=(t,lt)=>{Wd.mood('dawn');E.L.light=lerp(.08,1.25,ss(0,2.0,lt));E.L.sun=[.5,.62,.3];
  E.FX.room=1;E.FX.win=[.3,.5,.7,.93];E.FX.rays=1.3;E.FX.bloom=.6;E.FX.exposure=1.3;
  E.cam={x:540,y:960,z:1,r:0};E.view();Wd.design(lt);
  // силуэты (в экранных координатах)
  E.screen();E.SIL=1;
  const kneel=ss(3.5,4.3,lt);const drop=2.6,fall=cl((lt-drop)/.35);
  C.fig({x:440,y:1610+kneel*196,kind:'man',s:1.15,lean:kneel*.25,legL:[kneel*1.57,kneel*1.57],legR:[-kneel*.2,kneel*1.37],armL:[.1+kneel*.9,.2+kneel*.3],armR:[.1,.2+kneel*.3]});
  C.fig({x:640,y:1690,kind:'girl',s:1.15,dir:-1,armL:[fall>0?.4:1.2,fall>0?.3:1.0],armR:[.1,.2],headRot:kneel*.1});
  if(fall<1&&lt>1){const y=lerp(1440,1830,fall*fall);E.occ(E.Pe(lt<drop?585:585-fall*10,lt<drop?1445:y,16,20));}
  E.SIL=0;
  if(lt>drop+.35){const u=lt-drop-.35;for(let i=0;i<12;i++){const a=-Math.PI*(.15+rnd(i)*.7),v=150+rnd(i*3)*250;const k=Math.max(0,1-u*.9);E.emitDot(585+Math.cos(a)*v*Math.min(u,.35)*2,1830+Math.sin(a)*v*Math.min(u,.25)*.6,6,.5*k+.25);}}
  if(lt>3.9)E.obanner('\u201CBRING ME EVERY PIECE.\u201D',540,1180,{size:52,ap:eo((lt-3.9)/.45)});};
shot(46.0,52.0,(t)=>S11(t,t-46.0));
cue(46.0,'amb_church',.7,{dur:6});cue(46.2,'swell',.7);cue(48.95,'cup_break',.9);

// ================= 12. финал =================
const S12=(t,lt)=>{Wd.mood('dawn');E.L.light=1.2;E.L.sun=[.5,.7,.25];
  E.cam={x:540,y:K(lt,[[0,1150],[6.5,960]]),z:K(lt,[[0,1.6],[6.5,1.0]]),r:0};E.view();Wd.design(lt,{blink:blinkAt(lt,[2.0])});
  E.FX.fade=1-ss(6.1,6.5,lt);
  ban(['A STAINED GLASS WINDOW','IS JUST BROKEN GLASS'],lt,.3,2.9,330,{size:58});
  ban(['THAT SOMEONE REFUSED','TO THROW AWAY.'],lt,2.95,5.2,330,{size:58});
  ban('PIECES',lt,5.25,9,330,{size:110,weight:900});};
shot(52.0,58.5,(t)=>S12(t,t-52.0));
cue(52.0,'amb_church',.5,{dur:6.5});cue(57.25,'bell',.8);

window.STORY={SH,draw(t){for(const s of SH)if(t>=s.a&&t<s.b){s.f(t);return;}SH[SH.length-1].f(Math.min(t,SH[SH.length-1].b-.001));}};
window.DURATION=SH[SH.length-1].b;window.CUES=CUES;window.S_={ban,blinks,blinkAt,shake,breath,shot,cue,SH};
})();
