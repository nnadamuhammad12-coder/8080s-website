import {prism,rotate,project,faces,segments,segmentFaces,OUTER_FACE,explodeOffset,convexHull,insidePolygon} from './geometry.mjs?v=9';
import {createInteractionField,nearestTopic} from './interaction.mjs?v=9';

const sections = [
  {name:'academic',sub:'studio & tech',body:'Academic work, organised into Studio and Tech.',note:'Selected projects and drawings will be added here.'},
  {name:'design',sub:'objects & systems',body:'Objects, making and visual experiments.',note:'The project selection is being assembled.'},
  {name:'Function',sub:'El Gouna / a film',body:'Fishing, wakeboarding, camping and spearfishing in El Gouna.',note:''},
  {name:'initiative',sub:'alchemy & more',body:'A space for initiatives, collaborations and ideas put into action.',note:'Selected initiatives will be added here.'},
  {name:'art',sub:'digital & physical',body:'A space for visual work, digital explorations and things made by hand.',note:''},
  {name:'notes',sub:'thoughts, sketches & fragments',body:'Ideas in the margins. Sketches, observations and fragments from an ongoing practice.',note:'This notebook is waiting for its first entries.'},
  {name:'Form',sub:'a section through me',body:'Movement, people, detail and experimentation.',note:''},
  {name:'contact',sub:'start a conversation',body:'For conversations about architecture, design, making or a possible collaboration.',note:''}
];
// Sub-topics that fan out from the core when a side is in focus. Only material Muhammad has supplied.
const chipSets = {
};
const $=s=>document.querySelector(s), canvas=$('#octagon'),ctx=canvas.getContext('2d'), labelRoot=$('#labels'), area=$('.model-area');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let yaw=.35,pitch=-.78,roll=0,wobble=0,auto=!reduced.matches,shadow=true,sound=false,audio,active=0,drag=null,width=600,height=650,scale=150,last=0,motionTime=0;
let frozenTilt=null,hoverLabel=false,contactLock=false,nearCentre=false,spin=auto?1:0,explode=0,lastNear=-1e9,pinned=-1,overChips=false,velocity={x:0,y:0},pendingYaw=0,focus={index:-1,strength:0},chipIndex=-1;
// The plan of the octagon, set out on its middle plane: rings, circles, axes, an inscribed star and ticks.
// It turns with the form but stays put when the wedges open, like a drawing the pieces lift off.
const plan=(()=>{
  const lines=[],T=Math.PI*2,vAng=i=>i*Math.PI/4+Math.PI/8,mAng=i=>i*Math.PI/4+Math.PI/4,at=(r,a)=>[Math.cos(a)*r,0,Math.sin(a)*r];
  const ring=(r,alpha,dash)=>lines.push({pts:[...Array.from({length:8},(_,i)=>at(r,vAng(i))),at(r,vAng(0))],alpha,dash});
  const circle=(r,alpha,dash)=>lines.push({pts:Array.from({length:73},(_,i)=>at(r,i/72*T)),alpha,dash});
  ring(.5,.1);ring(1.22,.09);ring(1.48,.07,[2,4]);
  circle(1.0/Math.cos(Math.PI/8),.07,[1,3]);circle(1.7,.06,[1,5]);
  for(let i=0;i<8;i++){
    lines.push({pts:[at(.12,vAng(i)),at(1.62,vAng(i))],alpha:.08,dash:[3,5]});
    lines.push({pts:[at(0,0),at(1.86,mAng(i))],alpha:.1,dash:[6,3,1,3]});
    lines.push({pts:[at(1,vAng(i)),at(1,vAng(i+3))],alpha:.06});
    for(const r of [1.22,1.48,1.7]){const a=mAng(i),d=.035;lines.push({pts:[at(r,a-d),at(r,a+d)],alpha:.14});}
  }
  return lines;
})();
const pieces=segments({inner:.5,outer:1,depth:.26}), core=prism(.36,.46), focusWeights=sections.map(()=>0);

const buttons=sections.map((section,i)=>{
  const b=document.createElement([0,1,3,4,5,6].includes(i)?'a':'button');b.className='face-label';b.textContent=section.name;
  if(i===6)b.href='/form/';else if(i===4)b.href='/art/';else if(i===5)b.href='/notes/';else if(i===1)b.href='/design/';else if(i===3)b.href='/initiatives/';else if(i===0)b.href='/academic/';else b.onclick=()=>openSection(i);
  labelRoot.append(b);return b;
});
buttons.forEach(b=>{b.addEventListener('pointerenter',()=>hoverLabel=true);b.addEventListener('pointerleave',()=>hoverLabel=false);});
const chipRoot=document.createElement('div');chipRoot.className='chips';chipRoot.id='academic-branches';labelRoot.append(chipRoot);
chipRoot.addEventListener('pointerenter',()=>{overChips=true;hoverLabel=true;});chipRoot.addEventListener('pointerleave',()=>{overChips=false;hoverLabel=false;});
chipRoot.addEventListener('focusin',()=>overChips=true);chipRoot.addEventListener('focusout',()=>overChips=false);
buttons[0].setAttribute('aria-expanded','false');buttons[0].setAttribute('aria-controls','academic-branches');
const field=createInteractionField({area,buttons,redraw:()=>{},reduced});

function tickSound(freq=460,level=.025){if(!sound)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.setValueAtTime(level,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.065);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.07);}catch{}}

function showChips(i){
  if(chipIndex===i)return;chipIndex=i;chipRoot.replaceChildren();
  for(const [text,target] of chipSets[i]??[]){
    const el=document.createElement(typeof target==='string'?'a':'button');el.className='chip';el.textContent=text;
    if(typeof target==='string')el.href=target;else el.onclick=target;
    chipRoot.append(el);
  }
  buttons[0].setAttribute('aria-expanded',String(i===0));
  requestAnimationFrame(()=>chipRoot.querySelectorAll('.chip').forEach(c=>c.classList.add('show')));
}
function toggleAcademic(){pinned=pinned===0?-1:0;if(pinned<0)overChips=false;tickSound();}

const dialog=$('#detail');
const slug=s=>s.name.toLowerCase().replaceAll(' ','-');
const wide=()=>innerWidth>760;
function openAcademic(){location.assign('/academic/');}
function openSection(i,updateHash=true){
  active=(i+8)%8;if(active===0){location.assign('/academic/');return;}if(active===5){location.assign('/notes/');return;}if(active===1){location.assign('/design/');return;}if(active===3){location.assign('/initiatives/');return;}if(active===6){location.assign('/form/');return;}if(active===4){location.assign('/art/');return;}if(active===2){if(dialog.open)closeSection();openVideo();return;}
  const s=sections[active];$('#detail-title').textContent=s.name;$('#detail-number').textContent=`0${active+1} / eight sides of a practice`;$('#detail-body').replaceChildren();
  const p=document.createElement('p');p.textContent=s.body;$('#detail-body').append(p);
  if(s.note){const note=document.createElement('p');note.className='empty-note';note.textContent=s.note;$('#detail-body').append(note);}
  if(active===0){const nav=document.createElement('div');nav.className='branch-picker';for(const branch of ['studio','tech']){const b=document.createElement('button');b.textContent=branch;b.onclick=()=>openAcademic(branch);nav.append(b);}$('#detail-body').append(nav);}
  if(active===7){const contact=document.createElement('div');contact.className='contact-links';for(const [value,href] of [['+447538361491','tel:+447538361491'],['M.nada2@uni.brighton.ac.uk','mailto:M.nada2@uni.brighton.ac.uk'],['+201005695777','tel:+201005695777'],['nnadamuhammad12@gmail.com','mailto:nnadamuhammad12@gmail.com']]){const a=document.createElement('a');a.textContent=value;a.href=href;contact.append(a);}$('#detail-body').append(contact);}
  // On wide screens the section opens as a card beside its label, keeping the octagon in view.
  if(dialog.open&&dialog.classList.contains('card')!==wide())dialog.close();
  dialog.classList.toggle('card',wide());
  if(!dialog.open){if(wide())dialog.show();else dialog.showModal();}
  pinned=active;contactLock=active===7&&dialog.classList.contains('card');placeCard();
  if(updateHash)history.replaceState(null,'',`#${slug(s)}`);tickSound();
}
function placeCard(){
  if(!dialog.open||!dialog.classList.contains('card'))return;
  const r=buttons[active].getBoundingClientRect(),w=dialog.offsetWidth,h=dialog.offsetHeight;
  let x=r.right+14;if(x+w>innerWidth-16)x=r.left-14-w;x=Math.max(16,Math.min(x,innerWidth-16-w));
  const y=Math.max(16,Math.min(r.top-12,innerHeight-16-h));
  dialog.style.left=`${Math.round(x)}px`;dialog.style.top=`${Math.round(y)}px`;
}
const videoDialog=$('#stage-two'),video=$('#trip-video');
const VIDEO_SRC='/assets/el-gouna/index.m3u8';let videoReady=false;
function loadVideo(){if(videoReady)return;videoReady=true;
  if(window.Hls&&window.Hls.isSupported()){const h=new window.Hls({enableWorker:false,capLevelToPlayerSize:false});h.loadSource(VIDEO_SRC);h.attachMedia(video);h.on(window.Hls.Events.MANIFEST_PARSED,()=>{if(videoDialog.open)video.play().catch(()=>{});});h.on(window.Hls.Events.ERROR,(e,d)=>{if(d.fatal)$('#video-error').hidden=false;});return;}
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=VIDEO_SRC;return;}
  $('#video-error').hidden=false;}
function openVideo(){loadVideo();videoDialog.showModal();history.replaceState(null,'','#function');video.play().catch(()=>{});tickSound();}
function closeVideo(){video.pause();videoDialog.close();history.replaceState(null,'',location.pathname);}
$('#close-video').onclick=closeVideo;videoDialog.addEventListener('cancel',()=>{video.pause();history.replaceState(null,'',location.pathname);});videoDialog.addEventListener('close',()=>video.pause());video.addEventListener('error',()=>$('#video-error').hidden=false);
function closeSection(){if(dialog.open)dialog.close();pinned=-1;contactLock=false;history.replaceState(null,'',location.pathname);}
$('.close').onclick=closeSection;
dialog.addEventListener('click',e=>{if(e.target===dialog&&!dialog.classList.contains('card')){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSection();}});
dialog.addEventListener('cancel',()=>{pinned=-1;history.replaceState(null,'',location.pathname);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(dialog.open&&dialog.classList.contains('card'))closeSection();else if(pinned>=0){pinned=-1;}}});
document.addEventListener('pointerdown',e=>{if(e.target.closest('dialog,.face-label,.chip,.rotation-controls'))return;if(contactLock)return;if(dialog.open&&dialog.classList.contains('card'))closeSection();else if(pinned>=0&&!e.target.closest('#octagon'))pinned=-1;});
// Contact holds the screen: the card and the octagon stay put until the cursor drops below the line of the auto rotate button.
document.addEventListener('pointermove',e=>{if(!contactLock||!dialog.open||e.pointerType==='touch'||dialog.contains(e.target))return;if(e.clientY>$('#spin').getBoundingClientRect().bottom)closeSection();});
$('#prev-section').onclick=()=>openSection(active-1);$('#next-section').onclick=()=>openSection(active+1);

function syncSpin(){$('#spin').setAttribute('aria-pressed',String(auto));$('#spin span').textContent=auto?'● on':'○ off';}
$('#spin').onclick=()=>{auto=!auto;syncSpin();tickSound();};syncSpin();
// Each step turns the form by exactly one of its eight sides.
$('#left').onclick=()=>{pendingYaw-=Math.PI/4;tickSound(380);};$('#right').onclick=()=>{pendingYaw+=Math.PI/4;tickSound(540);};
$('#shadow').onclick=()=>{shadow=!shadow;$('#shadow').setAttribute('aria-pressed',String(shadow));};
$('#sound').onclick=()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound small').textContent=sound?'sound on':'sound off';tickSound();};
function setTheme(theme){document.body.dataset.theme=theme;document.querySelectorAll('[data-theme]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.theme===theme));});try{localStorage.setItem('nada-theme',theme);}catch{}}
document.querySelectorAll('.theme-controls [data-theme]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.theme);tickSound();});

canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,t:performance.now()};velocity={x:0,y:0};canvas.setPointerCapture(e.pointerId);area.classList.add('is-dragging');});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const now=performance.now(),dt=Math.max(8,now-drag.t),dx=(e.clientX-drag.x)*.008,dy=(e.clientY-drag.y)*.006;yaw+=dx;pitch+=dy;velocity={x:dx/dt,y:dy/dt};drag={x:e.clientX,y:e.clientY,t:now};});
const endDrag=()=>{if(drag&&performance.now()-drag.t>90)velocity={x:0,y:0};drag=null;area.classList.remove('is-dragging');};
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
canvas.tabIndex=0;canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch-=.1;if(e.key==='ArrowDown')pitch+=.1;lastNear=performance.now();}});

function polygon(points,fill,stroke,dash=null,lineWidth=.85){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.setLineDash(dash??[]);ctx.stroke();ctx.setLineDash([]);}}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], avg=pts=>pts.reduce((s,p)=>s.map((v,k)=>v+p[k]/pts.length),[0,0,0]);

function frame(dt){
  const now=performance.now(),pointer=field.pointer,keyboard=field.keyboard,cx=width/2,cy=height*.45;
  let tilt=field.tilt;if(hoverLabel&&frozenTilt)tilt=frozenTilt;else frozenTilt=tilt;const Y=yaw+tilt.x,P=pitch+tilt.y,R=roll;
  // Build the eight wedges at their current opening.
  const built=pieces.map((seg,i)=>{
    const offset=explodeOffset(seg,explode,focusWeights[i]);
    const world=seg.vertices.map(v=>rotate(add(v,offset),Y,P,R));
    const proj=world.map(p=>project(p,width,height,scale));
    const centre=rotate(add(seg.centre,offset),Y,P,R);
    const outerFace=segmentFaces[OUTER_FACE].map(k=>world[k]);
    const labelPoint=project(rotate(add(add(seg.centre,offset),seg.dir.map(v=>v*.62)),Y,P,R),width,height,scale);
    return {seg,world,proj,centre,cproj:project(centre,width,height,scale),anchor:project(avg(outerFace),width,height,scale),labelPoint,hull:convexHull(proj.map(p=>[p[0],p[1]]))};
  });
  // The inner octagon turns a half-step against the outer one as the form opens.
  const coreWorld=core.map(p=>rotate(p,Y-explode*Math.PI/8,P,R)),coreProj=coreWorld.map(p=>project(p,width,height,scale)),coreCentre=project(rotate([0,0,0],Y,P,R),width,height,scale);

  buttons.forEach((b,i)=>{const [x,y,z]=built[i].labelPoint;b.style.left=`${x}px`;b.style.top=`${y}px`;b.style.zIndex=String(Math.round(60-z*20));});

  // Focus: pinned side, then the chips in use, keyboard, the wedge under the cursor, then the nearest label.
  let next={index:-1,strength:0};
  if(pinned>=0)next={index:pinned,strength:1};
  else if(overChips&&focus.index>=0)next=focus;
  else if(keyboard>=0)next={index:keyboard,strength:1};
  else if(pointer&&!drag){
    let hit=-1,depth=Infinity;built.forEach((b,i)=>{if(insidePolygon([pointer.x,pointer.y],b.hull)&&b.centre[2]<depth){hit=i;depth=b.centre[2];}});
    next=hit>=0?{index:hit,strength:1}:nearestTopic(pointer,built.map(b=>({x:b.labelPoint[0],y:b.labelPoint[1]})),Math.min(130,width*.3));
  }
  if(next.index!==focus.index&&next.index>=0)tickSound(620,.012);
  focus=next;
  const nearForm=pointer&&Math.hypot(pointer.x-cx,pointer.y-cy)<scale*2.5;
  // Only the centre of the form stops it turning; the rest of the field opens it without stopping it.
  nearCentre=!!pointer&&Math.hypot(pointer.x-cx,pointer.y-cy)<scale*.8;
  if(drag||nearForm||focus.index>=0||Math.hypot(velocity.x,velocity.y)>.0004)lastNear=now;
  const open=now-lastNear<700?1:0;
  const ease=k=>reduced.matches?1:1-Math.exp(-dt/k);
  if(!hoverLabel)explode+=(open-explode)*ease(open?170:420);
  if(!hoverLabel)focusWeights.forEach((w,i)=>focusWeights[i]=w+((i===focus.index?focus.strength:0)-w)*ease(140));
  buttons.forEach((b,i)=>b.classList.toggle('is-dim',focus.index>=0&&focus.strength>.3&&i!==focus.index));
  area.classList.toggle('is-open',explode>.5);
  const chipsFor=focus.index>=0&&focus.strength>.3&&chipSets[focus.index]?focus.index:-1;showChips(chipsFor);

  ctx.clearRect(0,0,width,height);
  const css=getComputedStyle(document.body),ink=css.getPropertyValue('--face').trim()||'34,35,33';

  if(shadow){
    // A grounded shadow: every wedge and the core cast onto one floor plane below the form.
    const G=1.5,cast=([x,y,z])=>[cx+(x+(G-y)*.1)*scale*.92,cy+G*scale+z*scale*.16];
    ctx.beginPath();
    for(const hull of [...built.map(b=>convexHull(b.world.map(cast))),convexHull(coreWorld.map(cast))])hull.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p)),ctx.closePath();
    ctx.fillStyle=`rgba(${ink},.1)`;ctx.fill('nonzero');
  }

  // The faint plan drawing, behind everything that follows.
  ctx.save();ctx.lineWidth=.7;
  for(const l of plan){ctx.beginPath();l.pts.forEach((v,k)=>{const q=project(rotate(v,Y,P,R),width,height,scale);k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.strokeStyle=`rgba(${ink},${Math.min(.32,l.alpha*2.1)})`;ctx.setLineDash(l.dash??[]);ctx.stroke();}
  ctx.setLineDash([]);ctx.restore();

  // A light frame linking the pieces once they separate.
  if(explode>.04){
    ctx.lineWidth=.8;
    built.forEach((b,i)=>{const n=built[(i+1)%8];ctx.beginPath();ctx.moveTo(b.cproj[0],b.cproj[1]);ctx.lineTo(n.cproj[0],n.cproj[1]);ctx.strokeStyle=`rgba(${ink},${.22*explode})`;ctx.stroke();
      ctx.beginPath();ctx.moveTo(coreCentre[0],coreCentre[1]);ctx.lineTo(b.cproj[0],b.cproj[1]);ctx.setLineDash([2,4]);ctx.strokeStyle=`rgba(${ink},${.3*explode})`;ctx.stroke();ctx.setLineDash([]);});
  }

  const all=[];
  built.forEach((b,i)=>segmentFaces.forEach((f,fi)=>{const z=f.reduce((s,k)=>s+b.world[k][2],0)/f.length;all.push({pts:f.map(k=>b.proj[k]),z,piece:i,outer:fi===OUTER_FACE,back:z>b.centre[2]+.01});}));
  const coreZ=0;faces.forEach(f=>{const z=f.reduce((s,k)=>s+coreWorld[k][2],0)/f.length;all.push({pts:f.map(k=>coreProj[k]),z,piece:-1,back:z>coreZ+.01});});
  all.sort((a,b)=>b.z-a.z);
  for(const face of all){
    const w=face.piece>=0?focusWeights[face.piece]:0,isCore=face.piece<0;
    const alpha=isCore?.15:.085-w*.06,fillA=alpha+(face.back?0:.03);
    const strokeA=face.back?.24:(.72+w*.2);
    polygon(face.pts,`rgba(${ink},${Math.max(.02,fillA)})`,`rgba(${ink},${strokeA})`,face.back?[3,3]:null,face.back?.75:.9);
    if(face.outer&&!face.back){
      // A smaller inset frame on each outward face: a second octagon side nested in the first.
      const c=face.pts.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]);
      polygon(face.pts.map(p=>[c[0]+(p[0]-c[0])*.52,c[1]+(p[1]-c[1])*.52]),null,`rgba(${ink},${.42+w*.3})`,[2,3],.75);
    }
  }

  // Lines from the core to the chips of the side in focus.
  const chips=[...chipRoot.children];
  if(chips.length&&chipIndex>=0){
    const L=built[chipIndex].labelPoint,dx=L[0]-coreCentre[0],dy=L[1]-coreCentre[1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
    const base=[coreCentre[0]+dx*.5,coreCentre[1]+dy*.5];
    chips.forEach((chip,k)=>{
      const spread=(k-(chips.length-1)/2)*30;
      const x=base[0]+nx*spread,y=base[1]+ny*spread;
      chip.style.left=`${x}px`;chip.style.top=`${y}px`;
      ctx.beginPath();ctx.moveTo(coreCentre[0],coreCentre[1]);ctx.lineTo(x,y);ctx.strokeStyle=`rgba(${ink},.55)`;ctx.lineWidth=.8;ctx.stroke();
    });
    ctx.fillStyle=`rgba(${ink},.9)`;ctx.fillRect(Math.round(coreCentre[0])-3,Math.round(coreCentre[1])-3,6,6);
  }

  field.draw(ctx,{width,height,scale,ink,time:motionTime,vertices:built.flatMap(b=>b.proj),anchors:built.map(b=>b.anchor),focus,moving:auto});
  placeCard();
}

function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width*.25,height*.235);}
new ResizeObserver(resize).observe(canvas);resize();
function animate(t){
  const dt=Math.min(t-last,50)||16;last=t;
  if(!videoDialog.open&&!document.hidden&&width){
    if(!reduced.matches)motionTime+=dt;
    // The form holds still while someone is looking closely, then resumes its tumble.
    const holding=pinned>=0||drag||nearCentre||hoverLabel;
    spin=hoverLabel?0:spin+((auto&&!holding?1:0)-spin)*(1-Math.exp(-dt/(holding?160:600)));
    if(!drag){yaw+=velocity.x*dt;pitch+=velocity.y*dt;const decay=Math.pow(.94,dt/16);velocity.x*=decay;velocity.y*=decay;}
    if(Math.abs(pendingYaw)>1e-4){const step=pendingYaw*(reduced.matches?1:1-Math.exp(-dt/140));yaw+=step;pendingYaw-=step;lastNear=performance.now();}
    // A full tumble: the form turns right round on all three axes, so top, bottom and every side come into view.
    // The three speeds are unrelated, so the same orientation rarely repeats.
    wobble+=dt*spin;yaw=(yaw+dt*.00027*spin)%(Math.PI*2);pitch=(pitch+dt*.00021*spin)%(Math.PI*2);roll=(roll+dt*.000135*spin)%(Math.PI*2);
    frame(dt);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
reduced.addEventListener('change',e=>{if(e.matches){auto=false;syncSpin();}});
function clock(){const now=new Date();for(const [city,zone] of [['cairo','Africa/Cairo'],['london','Europe/London'],['boston','America/New_York']]){$(`#time-${city}`).textContent=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(now);}$('#year').textContent=now.getFullYear();}clock();setInterval(clock,1000);
try{const saved=localStorage.getItem('nada-theme');const theme=saved==='green'?'blue':saved;if(['light','blue','yellow','red'].includes(theme))setTheme(theme);}catch{}
// Routes open after the first frame so cards can anchor to their labels.
requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(location.hash==='#about'||location.hash==='#form')location.replace('/form/');
  else if(location.hash==='#stage-2'||location.hash==='#function')openVideo();
  else if(location.hash==='#academic/studio'||location.hash==='#academic/tech')openAcademic(location.hash.split('/')[1]);
  else{const route=sections.findIndex(s=>`#${slug(s)}`===location.hash);if(route>=0)openSection(route,false);}
}));
