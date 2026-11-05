import {rotate,project,segments,segmentFaces,OUTER_FACE} from '/geometry.mjs?v=9';
const ITEMS=[['Nuri','https://nurihair.care/'],['Alchemy',null],['Rowad','https://rowad-rme.com/'],['TDF+','https://tdfplus.design/'],['Beltone','https://www.beltoneholding.com/en'],['LOGIC','https://logic-consulting.com/'],['MUN',null],['Outreach',null]];
const CHOICES={1:[['Analogue ↗','https://analogueegypt.com/','website'],['Kyme','/initiatives/alchemy/','mn residence']]};
const pop=document.createElement('div');pop.className='choices';pop.hidden=true;let popFor=-1;
function showChoices(i){if(popFor===i){pop.hidden=true;popFor=-1;hold=false;return;}popFor=i;pop.innerHTML='';for(const [t,h,sub] of CHOICES[i]){const a=document.createElement('a');a.href=h;a.innerHTML=`${t}<small>${sub}</small>`;if(ext(h)){a.target='_blank';a.rel='noopener noreferrer';}pop.append(a);}pop.hidden=false;hold=true;}
addEventListener('click',e=>{if(popFor>=0&&!e.target.closest('.choices')&&!e.target.closest('.lab')){pop.hidden=true;popFor=-1;hold=false;}});
const ext=h=>/^https?:/.test(h);
try{const t=localStorage.getItem('nada-theme');if(['blue','yellow','red'].includes(t))document.body.dataset.theme=t;}catch{}
const cv=document.getElementById('oct'),ctx=cv.getContext('2d'),labRoot=document.getElementById('labels'),list=document.getElementById('list');
const segs=segments({inner:.6,outer:1,depth:.32,gap:.05});
let hot=-1,hold=false,yaw=.4,pitch=-.62,roll=0,drag=null,soonTimer;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function open(i){const [n,href]=ITEMS[i];if(!n)return;if(CHOICES[i]){showChoices(i);return;}if(href){ext(href)?window.open(href,'_blank','noopener'):location.assign(href);return;}const el=labs[i];el.classList.add('soon');clearTimeout(soonTimer);soonTimer=setTimeout(()=>el.classList.remove('soon'),2200);}
const labs=ITEMS.map(([n],i)=>{if(!n)return null;const b=document.createElement(ITEMS[i][1]?'a':'button');b.className='lab';b.textContent=n;if(ITEMS[i][1]){b.href=ITEMS[i][1];if(ext(ITEMS[i][1])){b.target='_blank';b.rel='noopener noreferrer';}}else b.onclick=()=>open(i);
 b.onmouseenter=()=>{hot=i;hold=true;mark();};b.onmouseleave=()=>{hot=-1;hold=popFor>=0;mark();};b.onfocus=b.onmouseenter;b.onblur=b.onmouseleave;labRoot.append(b);
 const li=document.createElement('li'),a=document.createElement('a');a.textContent=n;a.href=ITEMS[i][1]||'#';if(ITEMS[i][1]&&ext(ITEMS[i][1])){a.target='_blank';a.rel='noopener noreferrer';a.textContent=n+' ↗';}a.onclick=e=>{if(!ITEMS[i][1]){e.preventDefault();open(i);}};a.onmouseenter=b.onmouseenter;a.onmouseleave=b.onmouseleave;li.append(a);if(CHOICES[i]){a.removeAttribute('href');a.onclick=null;a.classList.add('nolink');for(const [t,h,sub] of CHOICES[i]){const x=document.createElement('a');x.className='sub';x.textContent='· '+t.toLowerCase()+(sub?' ('+sub+')':'');x.href=h;if(ext(h)){x.target='_blank';x.rel='noopener noreferrer';}li.append(x);}}list.append(li);b._li=a;return b;});
function mark(){labs.forEach((b,i)=>{if(!b)return;if(i===hot){b.dataset.hot='';b._li.dataset.hot='';}else{delete b.dataset.hot;delete b._li.dataset.hot;}});}
function face(){return getComputedStyle(document.body).getPropertyValue('--face').trim()||'34,35,33';}
let W=0,H=0,dpr=1;function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;}addEventListener('resize',size);size();
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)*.008;pitch=Math.max(-1.3,Math.min(-.15,drag.pitch+(e.clientY-drag.y)*.006));});
cv.addEventListener('pointerup',()=>drag=null);
let last=performance.now();
function frame(t){const dt=Math.min(50,t-last);last=t;
 if(!hold&&!drag&&!reduced){yaw+=dt*.00032;roll=Math.sin(t*.0004)*.08;}
 const ink=face(),scale=Math.min(W,H)*.23,cx=W*.5;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
 const P=v=>{const r=rotate(v,yaw,pitch,roll);return project(r,W,H,scale);};
 // floor shadow
 const fl=[];segs.forEach(s=>s.vertices.forEach(v=>{const r=rotate(v,yaw,0,0);fl.push([cx+r[0]*scale*1.02,H*.45+scale*1.55+r[2]*scale*.28]);}));
 fl.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],hi=[];for(const p of fl){while(lo.length>1&&cr(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of fl.slice().reverse()){while(hi.length>1&&cr(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}
 const hull=[...lo.slice(0,-1),...hi.slice(0,-1)];ctx.beginPath();hull.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=`rgba(${ink},.07)`;ctx.filter='blur(6px)';ctx.fill();ctx.filter='none';
 const polys=[];
 segs.forEach((s,i)=>{const pv=s.vertices.map(P);segmentFaces.forEach((f,k)=>{const pts=f.map(j=>pv[j]);const z=pts.reduce((a,p)=>a+p[2],0)/pts.length;polys.push({pts,z,i,k});});
  const of=segmentFaces[OUTER_FACE].map(j=>pv[j]);const c=of.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4,a[2]+p[2]/4],[0,0,0]);s._c=c;});
 polys.sort((a,b)=>b.z-a.z);
 for(const p of polys){ctx.beginPath();p.pts.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
  const named=!!ITEMS[p.i][0];ctx.fillStyle=`rgba(${ink},${p.i===hot?.34:named?.09:.035})`;ctx.fill();ctx.strokeStyle=`rgba(${ink},${named?.6:.3})`;ctx.lineWidth=.8;ctx.setLineDash(named?[]:[3,3]);ctx.stroke();ctx.setLineDash([]);}
 const centre=P([0,0,0]);
 segs.forEach((s,i)=>{const b=labs[i];if(!b)return;const c=s._c;const dx=c[0]-centre[0],dy=c[1]-centre[1],L=Math.hypot(dx,dy)||1;const lx=c[0]+dx/L*46,ly=c[1]+dy/L*30;
  ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(lx,ly);ctx.setLineDash([2,3]);ctx.strokeStyle=`rgba(${ink},.5)`;ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(${ink},.9)`;ctx.fillRect(c[0]-2,c[1]-2,4,4);
  b.style.left=lx+'px';b.style.top=ly+'px';if(popFor===i){pop.style.left=lx+'px';pop.style.top=(ly+18)+'px';}b.style.opacity=c[2]>.25&&i!==hot?.55:1;b.style.zIndex=c[2]>0?1:3;});
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);

labRoot.append(pop);
