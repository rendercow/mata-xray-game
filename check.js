
'use strict';
const C=document.querySelector('#game'),g=C.getContext('2d'),$=id=>document.getElementById(id),W=C.width,H=C.height;
const rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const CATS={weapon:{name:'총·도검',points:100},drug:{name:'마약 의심',points:150},luxury:{name:'명품',points:70},liquid:{name:'액체류',points:50},normal:{name:'일반물품',points:0}};
const OPTIONS={
weapon:['pistol','revolver','rifle','knife','chefknife','dagger','sword','longknife','machete','scissors','longknife','machete'],
drug:['vacuumbrick','doublebrick','zipbag','powderpouch','capsulestrip','pillbottle','vialpack','bundle'],
luxury:['bag_lv','bag_gg','bag_cc','bag_prada','bag_dior','watch','watch2','jewelry'],
liquid:['bottle','flask','vial','spray'],
normal:['laptop','book','headphone','shoe','tshirt','coat','pants','dress','charger','camera','umbrella','comb','tablet','backpack','duffel']};
const SCALE={
pistol:[84,50],revolver:[86,52],rifle:[128,43],knife:[86,22],chefknife:[108,28],dagger:[72,24],sword:[132,26],longknife:[116,24],machete:[126,34],scissors:[78,58],
vacuumbrick:[72,50],doublebrick:[78,64],zipbag:[76,58],powderpouch:[82,61],capsulestrip:[82,50],pillbottle:[50,82],vialpack:[78,58],bundle:[88,56],
bag_lv:[86,72],bag_gg:[88,74],bag_cc:[88,72],bag_prada:[92,74],bag_dior:[92,74],watch:[49,82],watch2:[50,80],jewelry:[62,46],
bottle:[39,87],flask:[53,80],vial:[34,66],spray:[47,78],
laptop:[91,65],book:[70,75],headphone:[66,72],shoe:[95,40],tshirt:[82,70],coat:[86,84],pants:[72,88],dress:[76,90],charger:[67,55],camera:[64,51],umbrella:[100,34],comb:[81,29],tablet:[67,90],backpack:[84,88],duffel:[102,56]};
const CATS={weapon:{name:'총·도검',points:100},drug:{name:'마약 의심',points:150},luxury:{name:'명품',points:70},liquid:{name:'액체류',points:50},normal:{name:'일반물품',points:0}};
const OPTIONS={\
weapon:['pistol','revolver','rifle','knife','chefknife','dagger','sword','longknife','machete','scissors','longknife','machete'],\
drug:['vacuumbrick','doublebrick','zipbag','powderpouch','capsulestrip','pillbottle','vialpack','bundle'],\
luxury:['bag_lv','bag_gg','bag_cc','bag_prada','bag_dior','watch','watch2','jewelry'],\
liquid:['bottle','flask','vial','spray'],\
normal:['laptop','book','headphone','shoe','tshirt','coat','pants','dress','charger','camera','umbrella','comb','tablet','backpack','duffel']};\
const SCALE={\
pistol:[84,50],revolver:[86,52],rifle:[128,43],knife:[86,22],chefknife:[108,28],dagger:[72,24],sword:[132,26],longknife:[116,24],machete:[126,34],scissors:[78,58],\
vacuumbrick:[72,50],doublebrick:[78,64],zipbag:[76,58],powderpouch:[82,61],capsulestrip:[82,50],pillbottle:[50,82],vialpack:[78,58],bundle:[88,56],\
bag_lv:[86,72],bag_gg:[88,74],bag_cc:[88,72],bag_prada:[92,74],bag_dior:[92,74],watch:[49,82],watch2:[50,80],jewelry:[62,46],\
bottle:[39,87],flask:[53,80],vial:[34,66],spray:[47,78],\
laptop:[91,65],book:[70,75],headphone:[66,72],shoe:[95,40],tshirt:[82,70],coat:[86,84],pants:[72,88],dress:[76,90],charger:[67,55],camera:[64,51],umbrella:[100,34],comb:[81,29],tablet:[67,90],backpack:[84,88],duffel:[102,56]};
let bags=[],fx=[],running=false,paused=false,remain=45,score=0,hits=0,errors=0,combo=0,elapsed=0,spawn=0,last=0,raf=0,seq=0,sound=true,audioCtx=null,counts={weapon:0,drug:0,luxury:0,liquid:0},best=0;
let mataPoseClock=0,mataState='inspect';
const dog={x:150,y:798,dir:1,patrolMin:142,patrolMax:W-155,step:0,mode:'patrol',targetX:150,barkClock:0,barkCooldown:0,pantCooldown:.2,targetBagId:null,lastAnnouncedBagId:null,lookPhase:0,sniffPhase:0};
const barkAudio=new Audio('assets/bark.mp3'); barkAudio.preload='auto'; barkAudio.volume=.84;
const pantAudio=new Audio('assets/pant.mp3'); pantAudio.preload='auto'; pantAudio.volume=.58;
const dogSprite=new Image(); dogSprite.src='assets/dog_neon_tight.png';
const dogDraw={x:0,y:0,w:0,h:0,scale:0};
try{best=Number(localStorage.getItem('mata_xray_best_v06')||localStorage.getItem('mata_xray_best_v05')||localStorage.getItem('mata_xray_best_v04')||0)}catch(e){}$('best').textContent=best;
function tone(freq=640,dur=.085,kind='sine',vol=.05,start=0){if(!sound)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();let now=audioCtx.currentTime+start,o=audioCtx.createOscillator(),v=audioCtx.createGain();o.type=kind;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.72),now+dur);v.gain.setValueAtTime(vol,now);v.gain.exponentialRampToValueAtTime(.001,now+dur);o.connect(v).connect(audioCtx.destination);o.start(now);o.stop(now+dur)}catch(e){}}
function beep(freq=640,dur=.085,kind='sine'){tone(freq,dur,kind,.052)}
function playFile(a){if(!sound)return;try{a.pause();a.currentTime=0;a.play().catch(()=>{});}catch(e){}}
function say(title,desc,sub,pose='inspect'){ $('speechTitle').textContent=title; $('speechDesc').textContent=desc; $('speechSub').textContent=sub; $('heroMata').src='assets/'+pose+'.png'; mataState=pose; mataPoseClock=2.5; }
function factor(){return clamp(1+Math.max(0,combo-1)*.13+elapsed*.007,1,2.45)}
function beltSpeed(){return 143*factor()}
function updateHud(){const vals={time:Math.max(0,Math.ceil(remain)),score,hits,combo,errors,speed:'×'+factor().toFixed(1)};for(let k in vals)$(k).textContent=vals[k];$('records').textContent=`적발 실적  |  총·도검 ${counts.weapon}   ·   마약 의심 ${counts.drug}   ·   명품 ${counts.luxury}   ·   액체류 ${counts.liquid}`}
function bagFactory(){
let sizeType=pick(['small','small','medium','medium','large']);
let w,h,n;
if(sizeType==='small'){w=rand(170,235);h=rand(135,180);n=3+Math.floor(rand(0,2));}
else if(sizeType==='large'){w=rand(310,420);h=rand(205,275);n=5+Math.floor(rand(0,3));}
else{w=rand(235,320);h=rand(170,225);n=4+Math.floor(rand(0,3));}
let items=[],suspectCount=Math.random()<.12?0:Math.random()<.36?2:1;
let suspectSlots=new Set();
while(suspectSlots.size<suspectCount && suspectSlots.size<n)suspectSlots.add(Math.floor(rand(0,n)));
for(let i=0;i<n;i++){
  let cat=suspectSlots.has(i)?pick(['weapon','drug','luxury','liquid']):'normal',type=pick(OPTIONS[cat]);
  let base=SCALE[type],stretch=['rifle','sword','longknife','machete','chefknife'].includes(type)?1.12:1;
  let size=rand(.64,1.24)*(sizeType==='large'?1.08:(sizeType==='small'?.9:1))*stretch;
  let iw=base[0]*size,ih=base[1]*size;
  let dx=0,dy=0;
  for(let attempts=0;attempts<48;attempts++){
    dx=rand(-w*.37,w*.37);dy=rand(-h*.31,h*.31);
    if(items.every(p=>Math.hypot((dx-p.dx)*.82,(dy-p.dy)*1.08)>(sizeType==='large'?48:40))) break;
  }
  items.push({cat,type,dx,dy,w:iw,h:ih,angle:rand(-.65,.65),found:false,seed:rand(0,10)})
}
let shellStyle=sizeType==='large'?pick(['hard','hard','soft']):pick(['hard','soft','duffel']);
return{x:W+w/2+10,y:rand(222,300),w,h,items,id:++seq,done:false,alertFlash:0,sizeType,shellStyle}
}
function path(points,close=true){g.beginPath();g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);if(close)g.closePath()}
function strokeFill(){g.fill();g.stroke()}
function rr(x,y,w,h,r=3){g.beginPath();g.roundRect(x,y,w,h,r);strokeFill()}
function line(pts){path(pts,false);g.stroke()}
function ellipse(x,y,rx,ry){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);strokeFill()}
function itemDraw(it,cx,cy){if(it.found)return;g.save();g.translate(cx,cy);g.rotate(it.angle);g.scale(it.w/90,it.h/90);let cat=it.cat;let palette={weapon:['#3e89c6','#0b3658'],drug:['#7b3a0a','#2c1808'],luxury:['#dc9d49','#6c5321'],liquid:['#eca33b','#91612a'],normal:['#79b79d','#2e6e79']};g.fillStyle=palette[cat][0];g.strokeStyle=palette[cat][1];g.lineWidth=4.2;g.globalAlpha=.9;g.lineJoin='round';g.lineCap='round';
const drawLogo=(txt,y=10,size=15)=>{g.save();g.fillStyle='#ffe7a5';g.strokeStyle='rgba(78,55,18,.88)';g.lineWidth=1.4;g.font=`900 ${size}px system-ui`;g.textAlign='center';g.strokeText(txt,0,y);g.fillText(txt,0,y);g.textAlign='left';g.restore()};
const drawBagBase=(style='satchel')=>{g.fillStyle='#d69a46';g.strokeStyle='#704e20';g.lineWidth=4.3;if(style==='tote'){path([[-39,-24],[39,-24],[34,40],[-34,40]]);strokeFill();g.beginPath();g.arc(-14,-18,14,Math.PI,0);g.stroke();g.beginPath();g.arc(14,-18,14,Math.PI,0);g.stroke();g.strokeStyle='#b87d36';line([[-30,-4],[30,-4]]);}else if(style==='structured'){rr(-39,-14,78,54,10);g.beginPath();g.arc(0,-13,22,Math.PI,0);g.stroke();rr(-8,1,16,12,2);g.strokeStyle='#b87d36';line([[-31,10],[31,10]]);}else if(style==='flap'){rr(-40,-9,80,50,10);path([[-36,-6],[36,-6],[24,16],[-24,16]]);strokeFill();g.beginPath();g.arc(0,-8,21,Math.PI,0);g.stroke();rr(-8,9,16,10,3);}else{rr(-40,-14,80,55,9);g.beginPath();g.arc(0,-14,22,Math.PI,0);g.stroke();g.strokeStyle='#b5662f';rr(-8,3,16,12,2);}};
switch(it.type){
case 'pistol': path([[-41,-18],[14,-18],[28,-10],[28,-2],[17,3],[12,10],[7,10],[-3,38],[-18,32],[-12,8],[-41,8]]);strokeFill();g.fillStyle='#2b597e';rr(-23,-26,36,9,2);g.strokeStyle='#8ec6ef';g.lineWidth=2.2;line([[-29,-5],[9,-5]]);g.beginPath();g.arc(3,10,9,.15,Math.PI-.2);g.stroke();break;
case 'revolver': rr(-42,-11,62,16,3);ellipse(8,-3,15,15);path([[10,5],[18,36],[1,41],[-10,11]]);strokeFill();rr(-31,-25,15,8,2);g.beginPath();g.arc(-2,7,11,.2,Math.PI-.15);g.stroke();break;
case 'rifle': path([[-44,-7],[26,-7],[43,-11],[44,-4],[27,0],[24,6],[-3,6],[-8,17],[-18,20],[-14,6],[-44,6]]);strokeFill();rr(-22,-18,25,9,2);rr(-8,6,12,24,2);line([[24,-7],[44,-20],[45,-20]]);line([[-36,7],[-28,19]]);break;
case 'knife': path([[-44,-7],[-6,-7],[34,-1],[41,3],[34,8],[-6,8],[-44,8]]);strokeFill();g.fillStyle='#203f5d';rr(-45,-12,24,25,4);break;
case 'chefknife': path([[-42,-9],[-7,-9],[34,-6],[44,0],[33,11],[-7,8],[-42,8]]);strokeFill();g.fillStyle='#203f5d';path([[-44,-13],[-29,-13],[-18,12],[-44,12]]);strokeFill();break;
case 'longknife': path([[-44,-8],[-8,-8],[32,-4],[44,0],[32,9],[-8,7],[-44,7]]);strokeFill();g.fillStyle='#203f5d';rr(-45,-13,21,25,4);g.strokeStyle='#a2d8ff';line([[-9,-2],[29,2]]);break;
case 'machete': path([[-40,-10],[-8,-10],[23,-8],[42,2],[29,13],[-8,10],[-40,10]]);strokeFill();g.fillStyle='#22445f';path([[-42,-14],[-28,-14],[-22,14],[-42,14]]);strokeFill();break;
case 'dagger': path([[0,-42],[12,-4],[0,18],[-12,-4]]);strokeFill();line([[-20,18],[20,18]]);rr(-5,18,10,28,3);break;
case 'sword': path([[0,-45],[9,-31],[10,27],[-10,27],[-9,-31]]);strokeFill();g.strokeStyle='#95d7ff';line([[0,-34],[0,18]]);line([[-24,27],[24,27]]);rr(-5,27,10,20,3);break;
case 'scissors': g.lineWidth=6.5;line([[3,-1],[41,-35]]);line([[4,2],[41,36]]);g.strokeStyle='#86c7f0';line([[5,0],[31,-19]]);line([[5,1],[31,20]]);g.strokeStyle=palette[cat][1];ellipse(-18,-16,14,12);ellipse(-18,18,14,12);ellipse(4,0,5,5);break;
case 'vacuumbrick': rr(-36,-24,72,48,7); g.strokeStyle='#b56426'; g.lineWidth=2.5; line([[-30,-16],[30,16]]); line([[-30,16],[30,-16]]); rr(-28,-18,56,36,3); break;
case 'doublebrick': rr(-41,-38,64,46,4); rr(-12,-4,56,42,4); g.strokeStyle='#b56426'; line([[-30,-22],[10,5]]); line([[-2,20],[30,-2]]); break;
case 'zipbag': path([[-36,-30],[36,-30],[41,26],[-41,26]]); strokeFill(); g.strokeStyle='#f2bb79'; g.lineWidth=3; line([[-34,-22],[34,-22]]); line([[-28,-10],[18,15]]); break;
case 'powderpouch': path([[-39,-26],[33,-33],[41,18],[26,31],[-29,27],[-43,-4]]); strokeFill(); g.strokeStyle='#f2bb79'; line([[-18,-7],[15,10]]); line([[-8,-18],[23,-3]]); break;
case 'capsulestrip': rr(-40,-24,80,48,6); g.strokeStyle='#f2bb79'; g.lineWidth=2.5; for(let yy=-11;yy<=11;yy+=22){ for(let xx=-26;xx<=26;xx+=13){ ellipse(xx,yy,5,5); } } break;
case 'pillbottle': rr(-17,-30,34,70,9); rr(-12,-43,24,15,4); g.strokeStyle='#f2bb79'; line([[-11,-4],[11,-4]]); line([[-11,10],[11,10]]); g.fillStyle='rgba(255,210,116,.35)'; rr(-11,-16,22,35,3); break;
case 'vialpack': for(let i=0;i<4;i++){ rr(-39+i*20,-24,14,50,4); } g.strokeStyle='#f2bb79'; line([[-42,-6],[35,-6]]); break;
case 'bundle': for(let i=0;i<3;i++){ rr(-40+i*24,-18+(i%2)*10,34,26,5); } g.strokeStyle='#f2bb79'; g.lineWidth=3; line([[-26,-18],[-8,29]]); line([[8,-20],[25,26]]); break;
case 'bag_lv': drawBagBase('structured'); drawLogo('LV',18,17); break;
case 'bag_gg': drawBagBase('tote'); drawLogo('GG',18,17); break;
case 'bag_cc': drawBagBase('flap'); drawLogo('CC',16,17); break;
case 'bag_prada': drawBagBase('structured'); drawLogo('PRADA',17,11); break;
case 'bag_dior': drawBagBase('flap'); drawLogo('DIOR',17,12); break;
case 'watch': case 'watch2': rr(-16,-45,32,90,5);g.fillStyle='#ceba60';ellipse(0,0,27,27);g.fillStyle='#628eac';ellipse(0,0,19,19);line([[0,0],[0,-14]]);line([[0,0],[12,8]]);break;
case 'jewelry': ellipse(0,7,36,22);g.fillStyle='#f7c667';path([[-14,-20],[0,-40],[14,-20],[0,0]]);strokeFill();break;
case 'bottle': rr(-17,-31,34,75,9);rr(-9,-43,18,14,3);g.strokeStyle='#ffd87d';line([[-13,15],[13,15]]);break;
case 'flask': path([[-12,-44],[12,-44],[12,-23],[30,28],[22,42],[-22,42],[-30,28],[-12,-23]]);strokeFill();line([[-21,10],[21,10]]);break;
case 'vial': rr(-15,-36,30,68,4);rr(-18,-45,36,12,3);break;
case 'spray': rr(-18,-25,36,67,8);rr(-9,-44,16,20,3);rr(7,-43,30,9,3);break;
case 'laptop': rr(-42,-27,84,52,4);g.fillStyle='#356783';rr(-35,-21,70,38,2);g.strokeStyle='#a5e5dd';line([[-45,30],[46,30]]);break;
case 'book': rr(-39,-39,78,78,4);line([[-26,-35],[-26,34]]);for(let y=-23;y<30;y+=12)line([[-16,y],[26,y]]);break;
case 'headphone': g.beginPath();g.arc(0,-3,34,Math.PI,0);g.stroke();rr(-43,-4,18,37,6);rr(25,-4,18,37,6);break;
case 'shoe': path([[-45,9],[-24,-12],[5,-10],[19,8],[45,19],[43,29],[-44,29]]);strokeFill();line([[-17,1],[17,13]]);break;
case 'tshirt': path([[-22,-35],[0,-22],[22,-35],[42,-9],[27,9],[20,40],[-20,40],[-27,9],[-42,-9]]);strokeFill(); break;
case 'coat': path([[-20,-41],[0,-29],[20,-41],[34,-21],[27,40],[10,40],[7,-2],[0,6],[-7,-2],[-10,40],[-27,40],[-34,-21]]);strokeFill(); line([[0,-28],[0,39]]);break;
case 'pants': path([[-24,-42],[24,-42],[18,10],[8,42],[-2,42],[-8,10],[-14,42],[-24,42],[-18,10]]);strokeFill(); break;
case 'dress': path([[0,-43],[18,-28],[30,-4],[18,42],[-18,42],[-30,-4],[-18,-28]]);strokeFill(); line([[0,-43],[0,42]]); break;
case 'charger': rr(-23,-26,45,55,5);line([[20,-2],[43,0],[45,32]]);rr(-13,-36,6,13,1);rr(2,-36,6,13,1);break;
case 'camera': rr(-40,-21,80,56,6);ellipse(0,9,18,18);rr(-25,-32,26,11,2);break;
case 'umbrella': g.beginPath();g.arc(0,0,43,Math.PI,0);g.stroke();line([[0,-42],[0,35],[12,42],[23,31]]);break;
case 'comb': rr(-40,-12,80,17,2);for(let i=-36;i<40;i+=8)line([[i,5],[i,33]]);break;
case 'tablet': rr(-32,-44,64,88,7);g.fillStyle='#407d95';rr(-26,-36,52,67,2);break;
case 'backpack': rr(-30,-39,60,82,12);g.beginPath();g.arc(0,-38,14,Math.PI,0);g.stroke();line([[-18,-20],[-18,34]]);line([[18,-20],[18,34]]);g.strokeStyle='#a2ded4';line([[-16,-4],[16,-4]]);break;
case 'duffel': path([[-41,-12],[-26,-30],[26,-30],[41,-12],[36,23],[-36,23]]);strokeFill();g.beginPath();g.arc(-10,-26,14,Math.PI,0);g.stroke();g.beginPath();g.arc(10,-26,14,Math.PI,0);g.stroke();line([[-20,-3],[20,-3]]);break;
}
g.restore()}
function bagHasUnfoundDrug(b){return b.items.some(it=>it.cat==='drug'&&!it.found)}
function drawBag(b){g.save();g.translate(b.x,b.y);g.shadowColor='#ffb75e55';g.shadowBlur=15;g.fillStyle='#efaa5333';g.strokeStyle='#f8bc6f';g.lineWidth=6;
if(b.shellStyle==='duffel'){
  path([[-b.w*.48,-b.h*.18],[-b.w*.32,-b.h*.44],[b.w*.32,-b.h*.44],[b.w*.48,-b.h*.18],[b.w*.43,b.h*.33],[-b.w*.43,b.h*.33]]);strokeFill();
  g.shadowBlur=0;g.lineWidth=3;g.strokeStyle='#c79057';
  g.beginPath();g.arc(-b.w*.12,-b.h*.42,b.w*.12,Math.PI,0);g.stroke();g.beginPath();g.arc(b.w*.12,-b.h*.42,b.w*.12,Math.PI,0);g.stroke();
  for(let i=0;i<3;i++){g.fillStyle='#f8bd7540';g.fillRect(-b.w*.28+i*(b.w*.56)/2,-b.h*.08,8,b.h*.25)}
}else if(b.shellStyle==='soft'){
  g.beginPath();g.roundRect(-b.w/2,-b.h/2,b.w,b.h,26);strokeFill();
  g.shadowBlur=0;g.lineWidth=2;g.strokeStyle='#ffda9b6a';g.beginPath();g.roundRect(-b.w/2+12,-b.h/2+12,b.w-24,b.h-24,19);g.stroke();
  g.strokeStyle='#c79057';g.lineWidth=4;g.beginPath();g.roundRect(-b.w*.22,-b.h/2-11,b.w*.44,16,7);g.stroke();
  g.strokeStyle='#f2c480';line([[-b.w*.35,0],[b.w*.35,0]]);line([[-b.w*.35,12],[b.w*.35,12]]);
}else{
  g.beginPath();g.roundRect(-b.w/2,-b.h/2,b.w,b.h,17);g.stroke();g.fill();
  g.shadowBlur=0;g.lineWidth=2;g.strokeStyle='#ffda9b6a';g.beginPath();g.roundRect(-b.w/2+9,-b.h/2+9,b.w-18,b.h-18,12);g.stroke();
  g.strokeStyle='#c79057';g.lineWidth=4;g.beginPath();g.roundRect(-b.w*.25,-b.h/2-12,b.w*.5,18,3);g.stroke();
  for(let i=0;i<4;i++){g.fillStyle='#f8bd7540';g.fillRect(-b.w/2+20+i*(b.w-40)/4,-b.h/2+14,9,b.h-28)}
}
for(let it of b.items)itemDraw(it,it.dx,it.dy);
if(b.alertFlash>0&&bagHasUnfoundDrug(b)){let a=.45+.45*Math.sin(elapsed*10);g.strokeStyle='rgba(255,84,84,'+a.toFixed(3)+')';g.lineWidth=5;if(b.shellStyle==='duffel'){path([[-b.w*.5,-b.h*.2],[-b.w*.34,-b.h*.46],[b.w*.34,-b.h*.46],[b.w*.5,-b.h*.2],[b.w*.44,b.h*.35],[-b.w*.44,b.h*.35]]);g.stroke();}else{g.beginPath();g.roundRect(-b.w/2-5,-b.h/2-5,b.w+10,b.h+10,20);g.stroke();}g.fillStyle='rgba(255,230,117,'+a.toFixed(3)+')';g.beginPath();g.roundRect(-42,-b.h/2-38,84,26,9);g.fill();g.fillStyle='#8b2b22';g.font='900 15px system-ui';g.textAlign='center';g.fillText('탐지견 반응!',0,-b.h/2-19);g.textAlign='left';}
g.restore()}
function paw(x,y,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);g.fillStyle='#ffe3a0';g.strokeStyle='#a85b4d';g.lineWidth=2;for(let [a,b] of [[-16,-15],[-5,-24],[8,-23],[20,-12]]){g.beginPath();g.ellipse(a,b,6,8,-.2,0,7);strokeFill()}g.beginPath();g.moveTo(-24,12);g.bezierCurveTo(-23,-5,-11,-10,0,-4);g.bezierCurveTo(12,-12,24,-1,25,13);g.bezierCurveTo(20,27,-19,27,-24,12);strokeFill();g.restore()}
function effect(x,y,label,good=true,kind='paw'){fx.push({x,y,label,good,kind,life:.9,max:.9})}
function drawFx(){for(let f of fx){let a=Math.max(0,f.life/f.max);g.save();g.globalAlpha=a;g.translate(f.x,f.y-(1-a)*46);if(f.kind==='paw')paw(0,0,1.15);g.textAlign='center';g.fillStyle=f.good?'#ffe7a0':'#ff919b';g.shadowColor='#07253d';g.shadowBlur=7;g.font='900 26px system-ui';g.fillText(f.label,0,f.kind==='paw'?53:0);g.restore()}}
function background(){let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#071b31');gr.addColorStop(.44,'#174963');gr.addColorStop(.77,'#0b2941');gr.addColorStop(1,'#10231a');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='#204c5f';g.fillRect(0,108,W,302);g.fillStyle='#143951';g.fillRect(0,126,W,265);let shift=elapsed*beltSpeed()*.55%65;g.strokeStyle='#3d7582';g.lineWidth=1.4;for(let x=-shift;x<W;x+=65){g.beginPath();g.moveTo(x,125);g.lineTo(x,393);g.stroke()}for(let y=155;y<392;y+=47){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}g.fillStyle='#77b4c7';g.fillRect(0,115,W,9);g.fillRect(0,394,W,10);let gr2=g.createLinearGradient(0,418,0,H);gr2.addColorStop(0,'#16231d');gr2.addColorStop(.52,'#253729');gr2.addColorStop(1,'#111913');g.fillStyle=gr2;g.fillRect(0,418,W,172);g.fillStyle='#2b4331';g.fillRect(0,423,W,5);let laneShift=(elapsed*72*.25)%92;g.strokeStyle='#425545';g.lineWidth=2;for(let x=-laneShift;x<W+92;x+=92){g.beginPath();g.moveTo(x,430);g.lineTo(x+35,585);g.stroke()}g.fillStyle='#68806b';g.fillRect(0,584,W,4);g.fillStyle='#bddfe3';g.textAlign='left';g.font='bold 16px system-ui';g.fillText('MATA X-RAY · SCANNER 06',23,32);g.fillStyle='#ffcf78';g.font='bold 14px system-ui';g.fillText('◀ BELT MOVING    SPEED ×'+factor().toFixed(1)+(combo>=3?'   ⚡ COMBO BOOST!':''),23,60);g.fillStyle='#d4f1d0';g.fillText('🐕 RETRIEVER PATROL  '+(dog.mode==='alert'?'DRUG ALERT!':'SNIFFING...'),23,440);g.textAlign='right';g.fillStyle='#b8dce3';g.font='13px system-ui';g.fillText('SIMULATED DUAL-ENERGY PALETTE',W-23,32);g.textAlign='left';for(let y=0;y<H;y+=5){g.fillStyle='rgba(170,239,242,.023)';g.fillRect(0,y,W,1)}}
function drawRetriever(){
g.save();
g.translate(dog.x,dog.y);
if(dog.dir<0)g.scale(-1,1);
let scale=(dog.mode==='alert'?0.481:0.465);
let w=dogSprite.width*scale,h=dogSprite.height*scale;
let scanTurn=(dog.mode==='alert'?Math.sin(elapsed*14)*0.02:Math.sin(dog.lookPhase)*0.05);
let sniffDip=(dog.mode==='alert'?Math.abs(Math.sin(elapsed*12))*1.2:Math.abs(Math.sin(dog.sniffPhase))*3.0);
let bob=(dog.mode==='alert'?Math.sin(elapsed*18)*1.3:Math.sin(dog.step)*0.9);
let x=-w/2,y=-h+18+bob+sniffDip;
dogDraw.x=dog.x+x; dogDraw.y=dog.y+y; dogDraw.w=w; dogDraw.h=h; dogDraw.scale=scale;
g.fillStyle='rgba(0,0,0,.28)';
g.beginPath();g.ellipse(0,24,w*0.22,h*0.025,0,0,Math.PI*2);g.fill();
if(dogSprite.complete && dogSprite.naturalWidth){
  g.save();
  if(scanTurn!==0) g.rotate(scanTurn);
  g.drawImage(dogSprite,x,y,w,h);
  g.restore();
  // subtle nose-targeting motion while patrolling: tiny overlay nudge of the head area
  if(dog.mode!=='alert'){
    g.save();
    g.beginPath();g.rect(x+w*0.52,y,w*0.28,h*0.18);g.clip();
    g.translate(Math.sin(dog.lookPhase)*2.3, Math.abs(Math.sin(dog.sniffPhase))*1.8);
    g.drawImage(dogSprite,x,y,w,h);
    g.restore();
  }
}else{
  g.fillStyle='#111'; g.beginPath(); g.ellipse(0,-40,40,65,0,0,Math.PI*2); g.fill();
}
if(dog.mode==='alert'&&dog.barkClock>0){
  g.globalAlpha=Math.min(1,dog.barkClock/.55);
  g.fillStyle='#fff1af';g.strokeStyle='#67531d';g.lineWidth=3;
  g.beginPath();g.roundRect(66,-h+42,84,36,12);strokeFill();
  g.fillStyle='#553c12';g.font='900 20px system-ui';g.fillText('멍!',84,-h+66);
}
g.restore()}
function draw(){background();for(let b of bags)drawBag(b);drawRetriever();drawFx();if(!running||paused){g.fillStyle='#061a2bc9';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#fff0bd';g.font='900 41px system-ui';g.fillText(paused?'⏸ 일시정지':remain<=0?'🐾 검사 완료!':'🐾 마타의 탐지 대작전',W/2,248);g.fillStyle='#eaf8ff';g.font='22px system-ui';g.fillText(paused?'계속하기 버튼으로 재개':remain<=0?`최종 ${score}점 · 적발 ${hits}건`:'45초 동안 의심물품을 찾아봐!',W/2,300);g.font='18px system-ui';g.fillStyle='#d6f3df';g.fillText('리트리버는 마약 의심 캐리어 앞에서만 컹컹 경고해!',W/2,336);g.textAlign='left'}}
function pointHitsDog(px,py){
  if(!(dogSprite.complete && dogSprite.naturalWidth)) return false;
  let x0=dogDraw.x, y0=dogDraw.y, w=dogDraw.w, h=dogDraw.h;
  // Narrower click block only over the visible upper torso / head that overlaps the belt.
  let blockTop=y0+h*0.02, blockBottom=y0+h*0.48, blockLeft=x0+w*0.16, blockRight=x0+w*0.82;
  return px>=blockLeft && px<=blockRight && py>=blockTop && py<=blockBottom;
}
function visibleDrugTarget(){let candidates=bags.filter(b=>bagHasUnfoundDrug(b)&&b.x+b.w/2>0&&b.x-b.w/2<W);if(!candidates.length)return null;candidates.sort((a,b)=>Math.abs(a.x-dog.x)-Math.abs(b.x-dog.x));return candidates[0]}
function updateDog(dt){
dog.step+=dt*(dog.mode==='alert'?2.4:3.4);
dog.lookPhase+=dt*(dog.mode==='alert'?2.8:2.1);
dog.sniffPhase+=dt*(dog.mode==='alert'?7.0:5.6);
dog.barkClock=Math.max(0,dog.barkClock-dt);
dog.barkCooldown=Math.max(0,dog.barkCooldown-dt);
dog.pantCooldown=Math.max(0,dog.pantCooldown-dt);
for(let b of bags)b.alertFlash=Math.max(0,b.alertFlash-dt);
let target=visibleDrugTarget();
if(target){
  dog.targetBagId=target.id;
  dog.targetX=clamp(target.x,dog.patrolMin,dog.patrolMax);
  if(Math.abs(dog.x-dog.targetX)>10){
    dog.mode='track';
    dog.dir=dog.targetX>dog.x?1:-1;
    dog.x+=dog.dir*118*dt;
    if(dog.pantCooldown<=0){playFile(pantAudio);dog.pantCooldown=2.9}
  }else{
    dog.mode='alert';
    dog.x=dog.targetX;
    dog.dir=target.x>=dog.x?1:-1;
    target.alertFlash=.22;
    if(dog.lastAnnouncedBagId!==target.id){
      say('탐지견 반응!', '리트리버가 마약 의심 캐리어를 알려주고 있어!', '강아지가 짖는 캐리어 안에 마약 의심 물질이 있을 수 있어. 마약류를 우선 확인해봐!', 'search');
      dog.lastAnnouncedBagId=target.id;
      playFile(barkAudio);
      dog.barkClock=.55;
      target.alertFlash=.82;
    }
  }
}else{
  dog.targetBagId=null;
  dog.mode='patrol';
  dog.x+=dog.dir*92*dt;
  if(dog.x>dog.patrolMax){dog.x=dog.patrolMax;dog.dir=-1}else if(dog.x<dog.patrolMin){dog.x=dog.patrolMin;dog.dir=1}
  if(dog.pantCooldown<=0){playFile(pantAudio);dog.pantCooldown=3.2}
}
}
function finish(){running=false;paused=false;remain=0;pantAudio.pause();if(score>best){best=score;try{localStorage.setItem('mata_xray_best_v06',String(best))}catch(e){}$('best').textContent=best;say('신기록 달성!', '마타와 탐지견의 호흡이 최고였어!', '최고기록을 경신했어. 다시 도전해서 더 높은 점수를 노려보자!', 'love')}else say('검사 완료!', '수고했어! 오늘의 검사를 마쳤어.', `최종 ${score}점 · 적발 ${hits}건`, 'success');$('start').textContent='↻ 처음부터';updateHud();draw()}
function frame(t){if(!running||paused)return;let dt=Math.min(.05,(t-last)/1000);last=t;remain-=dt;elapsed+=dt;spawn-=dt;mataPoseClock-=dt;if(mataPoseClock<0&&mataState!=='inspect'){ $('heroMata').src='assets/inspect.png'; mataState='inspect'; }
if(spawn<=0){bags.push(bagFactory());spawn=rand(1.65,2.1)/Math.sqrt(factor())}let v=beltSpeed();for(let b of bags){b.x-=v*dt;if(b.x+b.w/2<0&&!b.done){b.done=true;let missed=b.items.filter(it=>it.cat!=='normal'&&!it.found).length;if(missed){score-=40*missed;combo=0;say('앗, 놓쳤어!', '의심물품을 그냥 보내버렸어!', `미적발 ${missed}개 · -${40*missed}점`, 'sad');beep(210,.15,'triangle')}}}bags=bags.filter(b=>b.x+b.w/2>-24);updateDog(dt);for(let f of fx)f.life-=dt;fx=fx.filter(f=>f.life>0);updateHud();if(remain<=0){finish();return}draw();raf=requestAnimationFrame(frame)}
function itemHit(it,px,py){let dx=px-it.dx,dy=py-it.dy,c=Math.cos(-it.angle),s=Math.sin(-it.angle),xx=dx*c-dy*s,yy=dx*s+dy*c;let rx=it.w*.54,ry=it.h*.55;return (xx*xx)/(rx*rx)+(yy*yy)/(ry*ry)<=1}
C.addEventListener('pointerdown',e=>{if(!running||paused)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(err){}let r=C.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(pointHitsDog(x,y)){say('앗, 탐지견이 가렸어!', '아래쪽 탐지견 때문에 시야가 조금 방해됐어!', '탐지견이 컨베이어 쪽을 들여다보는 중이라 몸통 근처 클릭은 일부 막을 수 있어.', 'think'); draw(); return;}let hitsFound=[];for(let i=0;i<bags.length;i++){let b=bags[i];for(let j=0;j<b.items.length;j++){let it=b.items[j];if(it.found)continue;if(itemHit(it,x-b.x,y-b.y)){let priority=(it.cat==='normal'?0:1000)+i*10-j;hitsFound.push({bagIndex:i,itemIndex:j,b,it,priority});}}}if(!hitsFound.length)return;hitsFound.sort((a,b)=>b.priority-a.priority);let hit=hitsFound[0], it=hit.it;it.found=true;if(it.cat==='normal'){score-=30;errors++;combo=0;effect(x,y,'-30',false,'text');say('앗! 일반 물품이야!', '조금 더 신중하게 판독해봐!', '오적발 -30점 · 콤보 초기화', 'think');beep(210,.17,'sawtooth')}else{combo++;let bonus=Math.min(130,(combo-1)*15),pts=CATS[it.cat].points+bonus;score+=pts;hits++;counts[it.cat]++;effect(x,y,'+'+pts);if(it.cat==='drug'){say(combo>=3?'좋아, 탐지견 힌트 적중!':'마약 의심 물질 발견!', combo>=3?'마타와 탐지견의 합동 적발이야!':'탐지견이 알려준 캐리어에서 의심 물질을 찾았어!', `+${pts}점 · 컨베이어 속도 ${factor().toFixed(1)}배`, combo>=3?'love':'success')}else if(combo>=3){say('콤보 시작!', '좋아, 리듬을 탔어!', `+${pts}점 · 컨베이어 속도 ${factor().toFixed(1)}배`, 'wave')}else{say(CATS[it.cat].name+' 발견!', '마타가 발바닥 도장을 찍었어!', `+${pts}점 · 계속 찾아보자!`, 'success')}beep(650+Math.min(8,combo)*70,.095)}updateHud();draw();});
$('start').onclick=()=>{cancelAnimationFrame(raf);bags=[];fx=[];running=true;paused=false;remain=45;score=hits=errors=combo=elapsed=0;counts={weapon:0,drug:0,luxury:0,liquid:0};spawn=.1;last=performance.now();dog.x=150;dog.y=798;dog.dir=1;dog.mode='patrol';dog.step=0;dog.barkClock=0;dog.barkCooldown=0;dog.pantCooldown=.2;dog.targetBagId=null;dog.lastAnnouncedBagId=null;dog.lookPhase=0;dog.sniffPhase=0;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(err){}$('start').textContent='↻ 처음부터';$('pause').textContent='⏸ 일시정지';say('수색 준비 완료!', '마타와 함께 수상한 물품을 찾아보자!', '리트리버는 아래쪽에서 냄새를 맡으며 순찰하고, 마약 의심 캐리어가 지나갈 때만 컹컹 알려줘.', 'inspect');updateHud();raf=requestAnimationFrame(frame)};
$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'▶ 계속하기':'⏸ 일시정지';if(paused){pantAudio.pause()}else{last=performance.now();raf=requestAnimationFrame(frame)}draw()};
$('sound').onclick=()=>{sound=!sound;if(!sound){pantAudio.pause();barkAudio.pause()}$('sound').textContent=sound?'🔊 효과음 ON':'🔇 효과음 OFF'};
updateHud();draw();
