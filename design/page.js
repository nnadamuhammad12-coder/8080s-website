const ART='/assets/design/';
// ---- Research diagrams: analytical linework, stippled material, dashed callouts into a zoom box, layer labels ----
const FONT='font-family="Helvetica Neue,Helvetica,Arial,sans-serif"';
let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
let uid=0;
// stipple: random dots clipped to a shape, denser towards one side (bias 0 = even)
function stipple(d,box,n,bias=0,biasDir=[1,0]){const id='c'+(++uid);let dots='';const [x,y,w,h]=box;
  for(let i=0;i<n;i++){let u=rnd(),v=rnd();if(bias){const t=biasDir[0]?u:v;if(rnd()>Math.pow(biasDir[0]>0||biasDir[1]>0?t:1-t,bias)){i--;continue;}}
    dots+=`<circle cx="${(x+u*w).toFixed(1)}" cy="${(y+v*h).toFixed(1)}" r="${(.35+rnd()*.45).toFixed(2)}"/>`;}
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})" fill="currentColor" opacity=".85">${dots}</g>`;}
const ln=(d,w=1,o=1,dash='')=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" opacity="${o}" ${dash?`stroke-dasharray="${dash}"`:''} stroke-linecap="round" stroke-linejoin="round"/>`;
const tx=(x,y,t,s=8,o=1,a='start')=>`<text x="${x}" y="${y}" font-size="${s}" ${FONT} fill="currentColor" opacity="${o}" text-anchor="${a}">${t}</text>`;
const mark=(x,y)=>`<rect x="${x-2}" y="${y-2}" width="4" height="4" fill="currentColor"/>`;
const arrow=(x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1),l=4;return ln(`M${x1} ${y1}L${x2} ${y2}`,.7)+`<path d="M${x2-l*Math.cos(a-.5)} ${y2-l*Math.sin(a-.5)}L${x2} ${y2}L${x2-l*Math.cos(a+.5)} ${y2-l*Math.sin(a+.5)}" fill="none" stroke="currentColor" stroke-width=".7"/>`;};
const svg=(label,body)=>`<svg viewBox="0 0 330 168" role="img" aria-label="${label}">${body}</svg>`;
const NOTES={
ceramics:svg('Diagram: the glazed vessel in elevation, with a callout into its wall: raw clay inside, glaze outside. Below, a bar: 29.7% below the national poverty line.',
  ln('M18 112c-4-22-2-38 6-48 10-4 24-4 32 0 6 8 8 26 4 48z',1.3)+ln('M24 64c8 4 24 4 32 0',.8,.7)+
  ln('M50 84h16v20H50z',.7,1,'2 2')+ln('M66 84L130 20M66 104L130 116',.6,.7,'2 2')+
  
  stipple('M168 20C178 50 178 86 168 116H262C252 86 252 50 262 20Z',[160,20,110,96],900,1.6,[1,0])+
  ln('M168 20C178 50 178 86 168 116',1.4)+ln('M262 20C252 86 252 50 262 116',.1,0)+ln('M262 20C252 50 252 86 262 116',2.6)+
  ln('M270 20C260 50 260 86 270 116',.9)+tx(140,14,'inner — raw clay',7.5)+tx(316,14,'outer — glaze',7.5,1,'end')+
  arrow(150,60,163,60)+arrow(296,60,276,60)+tx(130,128,'glazed vessel — wall section',7.5,.8)+
  stipple('M18 150h89.7v10H18z',[18,150,90,10],320)+
  ln('M107.7 146v18',.8)+tx(18,144,'29.7% — below the national poverty line',8))
};
// ---- Content: groups of pieces. Add a piece to a group, or a new group (e.g. Digital art), and it slots in. ----
const groups=[
 {id:'shadow-model',name:'shadow model',pieces:[
  {id:'shadow-1',photo:'sm-shadow-1.webp',w:590,h:476,alt:'Shadow model seen from above, dark planes and thread',caption:['shadow model', 'minimal support', 'Card planes, thread, light'],desc:'I chose this sketch model because I was drawn to how the model relied on very minimal structural support. The beams were few, but strategically placed. It made me question the need for excessive superstructures in architecture. Sometimes, efficiency and elegance come from restraint.'},
  {id:'shadow-2',photo:'sm-shadow-2.webp',w:736,h:442,alt:'Silhouette of the shadow model roof with a figure',caption:['shadow model', 'the roof', 'Card planes, thread, light'],desc:'What stood out to me most was the roof. Its form broke away from conventional design. It wasn’t just about looking different; its shape and the way it operated challenged typical expectations. That obscure and almost sculptural presence gave the whole structure an identity.'},
  {id:'shadow-3',photo:'sm-shadow-3.webp',w:550,h:458,alt:'The shadow model from above with a figure inside',caption:['shadow model', 'an experience', 'Card planes, thread, light'],desc:'This model felt like more than just a form. It shaped an experience. Between the lighting, the irregular roof, and the minimal structural system, it all came together to create a space that felt both intentional and experimental. That’s what made me want to take it further.'},
  {id:'shadow-4',photo:'sm-shadow-4.webp',w:717,h:451,alt:'The shadow model lit from behind, grey light through the planes',caption:['shadow model', 'light', 'Card planes, thread, light'],desc:'While taking pictures of the model, I realised how dramatically shadows and direct light can shift the feeling of a space. It wasn’t something I planned for, but seeing how the light carved through the structure and created contrast made me start thinking about atmosphere as a design element in itself.'}]},
 {id:'light-box',name:'light box',pieces:[
  {id:'light-box-1',photo:'sm-lightbox-1.webp',w:1874,h:1468,alt:'A small timber and acrylic box model casting a hard shadow, a scale figure inside',caption:['light box', '', 'Timber frame, clear acrylic, foam, wire'],desc:'A first-year sketch model: a timber frame wrapped in clear acrylic, with a carved foam ceiling, circular openings and a bent wire screen on one face.'},
  {id:'light-box-2',photo:'sm-lightbox-4.webp',w:1230,h:1332,alt:'The wire face of the box model',caption:['light box', 'the wire face', 'Timber frame, clear acrylic, foam, wire'],desc:'The front face: a single bent wire laid over a dark panel.'},
  {id:'light-box-3',photo:'sm-lightbox-2.webp',w:1164,h:909,alt:'Inside the box model, a figure under the carved ceiling',caption:['light box', 'inside', 'Timber frame, clear acrylic, foam, wire'],desc:'Inside, under the carved foam ceiling.'},
  {id:'light-box-4',photo:'sm-lightbox-3.webp',w:1588,h:2118,alt:'Close view through the acrylic of the box model',caption:['light box', 'close', 'Timber frame, clear acrylic, foam, wire'],desc:'Through the acrylic: the foam ceiling and the circular cut-outs.'}]},
 {id:'folded-roof',name:'folded roof',pieces:[
  {id:'folded-roof-1',photo:'sm-folded-roof-1.webp',w:1872,h:1114,alt:'A folded card roof raised on timber legs and thin copper rods, a scale figure beside it',caption:['folded roof', '', 'Folded card roof on timber and copper legs'],desc:'A first-year sketch model: a faceted, folded card roof held up on angled timber legs and thin copper rods.'}]},
 {id:'conceptual-sketches',name:'conceptual sketches',pieces:[
  {id:'sketches',photo:'sm-sketches.webp',w:1940,h:1195,alt:'Four loose, continuous-line conceptual sketches',caption:['conceptual sketches','','Pen on paper'],desc:'Four loose conceptual sketches, drawn alongside the models.'}]}
];
const label={plan:'plan',section:'section a—a',elevation:'elevation'};
const fig=(p,k)=>`<figure><img src="${ART}sketch/${p.sketch}-${k}.png" alt="${label[k]} sketch" style="width:${p.sk[k]}px" loading="lazy"><figcaption>${label[k]}</figcaption></figure>`;
const stage=document.getElementById('stage'),nav=document.getElementById('groups');
stage.innerHTML=groups.map((g,gi)=>`<section class="group${g.pieces.length<2?' single':''}" id="${g.id}" data-g="${gi}" aria-label="${g.name}"><h2>${g.name}</h2>
  <div class="track">${g.pieces.map((p,pi)=>`<article class="piece" id="${p.id}" data-g="${gi}" data-p="${pi}" aria-label="${p.caption[0]}">
    <div class="set"><div class="sk left">${p.sk?fig(p,'plan')+fig(p,'section'):''}</div>
      <figure class="photo"><img src="${ART}${p.photo}" alt="${p.alt}" width="${p.w}" height="${p.h}" ${gi||pi?'loading="lazy"':''}></figure>
      <div class="sk right"></div></div>
    <div class="m"><div class="mnote">${NOTES[p.note]||''}</div><strong>${p.caption[0]}</strong>${p.desc}</div></article>`).join('')}</div>
  <button class="side prev" aria-label="Previous piece"><span class="i">‹</span><span class="t">back</span></button>
  <button class="side next" aria-label="Next piece"><span class="t">next</span><span class="i">›</span></button>
  <div class="dots${g.pieces.length<2?' single':''}">${g.pieces.map((p,pi)=>`<button aria-label="Show ${p.caption[0]}" data-p="${pi}"></button>`).join('')}</div></section>`).join('');
nav.innerHTML=groups.map(g=>`<a href="#${g.id}" data-id="${g.id}">${g.name}</a>`).join('');
let cur={g:-1,p:0},sound=false,audio;const along=groups.map(()=>0);
function tick(f=460){if(!sound)return;try{audio??=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.065);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.07);}catch{}}
function show(gi,pi){if(cur.g===gi&&cur.p===pi)return;cur={g:gi,p:pi};along[gi]=pi;const g=groups[gi],p=g.pieces[pi];
  nav.querySelectorAll('a').forEach((a,k)=>a.setAttribute('aria-current',String(k===gi)));
  const c=document.getElementById('caption');c.innerHTML='<strong></strong><span></span><br><span></span><br><i class="sig" role="img" aria-label="Muhammad Nada, signature"></i>';c.querySelector('strong').textContent=p.caption[0];c.querySelectorAll('span').forEach((s,k)=>s.textContent=p.caption[k+1]);
  document.getElementById('desc').textContent=p.desc;document.getElementById('note').innerHTML=NOTES[p.note]||'';
  document.getElementById('counter').textContent=`${pi+1} / ${g.pieces.length}`;
  const sec=stage.querySelector(`.group[data-g="${gi}"]`);sec.querySelector('.prev').disabled=pi===0;sec.querySelector('.next').disabled=pi===g.pieces.length-1;
  sec.querySelectorAll('.dots button').forEach((b,k)=>b.setAttribute('aria-current',String(k===pi)));
  history.replaceState(null,'','#'+p.id);tick(520);}
// Which group is in view (vertical), and which piece within it (horizontal).
const vio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.55){const gi=+e.target.dataset.g;show(gi,along[gi]);}}),{root:stage,threshold:[.55]});
stage.querySelectorAll('.group').forEach(s=>vio.observe(s));
stage.querySelectorAll('.track').forEach(t=>{const hio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.6){const gi=+e.target.dataset.g,pi=+e.target.dataset.p;along[gi]=pi;if(cur.g===gi)show(gi,pi);}}),{root:t,threshold:[.6]});t.querySelectorAll('.piece').forEach(p=>hio.observe(p));});
const smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const goGroup=gi=>{gi=Math.max(0,Math.min(groups.length-1,gi));stage.querySelector(`.group[data-g="${gi}"]`).scrollIntoView({behavior:smooth()});};
const goPiece=(gi,pi)=>{const g=groups[gi];pi=Math.max(0,Math.min(g.pieces.length-1,pi));const t=stage.querySelector(`.group[data-g="${gi}"] .track`);t.scrollTo({left:pi*t.clientWidth,behavior:smooth()});};
stage.querySelectorAll('.group').forEach(s=>{const gi=+s.dataset.g;s.querySelector('.prev').onclick=()=>goPiece(gi,along[gi]-1);s.querySelector('.next').onclick=()=>goPiece(gi,along[gi]+1);s.querySelectorAll('.dots button').forEach(b=>b.onclick=()=>goPiece(gi,+b.dataset.p));});
nav.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();goGroup(groups.findIndex(g=>g.id===a.dataset.id));});
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'){e.preventDefault();goPiece(cur.g,cur.p+1);}else if(e.key==='ArrowLeft'){e.preventDefault();goPiece(cur.g,cur.p-1);}
  else if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();goGroup(cur.g+1);}else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();goGroup(cur.g-1);}});
// Themes are shared with the rest of the site.
function setTheme(t){document.body.dataset.theme=t;document.querySelectorAll('.theme [data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===t)));try{localStorage.setItem('nada-theme',t);}catch{}}
document.querySelectorAll('.theme [data-theme]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.theme);tick();});
try{const s=localStorage.getItem('nada-theme'),t=s==='green'?'blue':s;if(['blue','yellow','red','light'].includes(t))setTheme(t);}catch{}
document.getElementById('shadow').onclick=e=>{const off=document.body.classList.toggle('no-shadow');e.currentTarget.setAttribute('aria-pressed',String(!off));};
document.getElementById('sound').onclick=e=>{sound=!sound;e.currentTarget.setAttribute('aria-pressed',String(sound));e.currentTarget.querySelector('small').textContent=sound?'sound on':'sound off';tick();};
// Open on the piece or group named in the address, if any.
const h=location.hash.slice(1);let sg=groups.findIndex(g=>g.id===h),sp=0;
if(sg<0)groups.forEach((g,gi)=>g.pieces.forEach((p,pi)=>{if(p.id===h){sg=gi;sp=pi;}}));
if(sg<0){sg=0;sp=0;}
requestAnimationFrame(()=>{if(sg>0)stage.querySelector(`.group[data-g="${sg}"]`).scrollIntoView();if(sp>0){const t=stage.querySelector(`.group[data-g="${sg}"] .track`);t.scrollLeft=sp*t.clientWidth;}show(sg,sp);});
