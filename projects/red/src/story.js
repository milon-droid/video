const STORY=(()=>{const S={};let SH=[];
S.init=ep=>{SH=[{a:0,b:10,draw:(t)=>{const c={x:360,y:640,z:1+t*.01};Wd.studio(c,t,{});
 Wd.layer(c,1,x=>{Wd.easel(x,520,1180,300,380,(x,w,h)=>Wd.sunsetPic(x,w,h));
  C.fig(x,{who:'gpa',x:250,y:760,s:170,t,cloth:[215,35,36],apron:1,scarf:[355,72,44],hands:[[-.3,1.8],[1.3,.6]],hold:[null,C.props.brush()],grip:[0,1],face:{look:[.6,0],blink:C.blink(t,1),mouth:{smile:.6},brow:{raise:.3}}});
  C.fig(x,{who:'leo',age:7,x:470,y:900,s:150,t,cloth:[45,75,55],hands:[[-.4,1.2],[.4,1.2]],face:{look:[-.6,-.3],blink:C.blink(t,2),mouth:{smile:.4,open:.3},turn:-.3}});});
 E.sub('GRANDPA DIDN\'T.',t,.2,9);}}];window.DURATION=10;window.CUES=[];};
S.draw=t=>{const s=SH.find(s=>t>=s.a&&t<s.b)||SH[SH.length-1];E.target('A');s.draw(t-s.a,t);};
S.SH=()=>SH;return S;})();
