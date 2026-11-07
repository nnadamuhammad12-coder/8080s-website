try{const t=localStorage.getItem('nada-theme');if(['blue','yellow','red'].includes(t))document.body.dataset.theme=t;}catch{}
// add new sketches here: [file, native width]
const SK=[['sketch-1.png',1414],['sketch-2.png',1488],['sketch-3.png',1878],['sketch-4.png',1370],['sketch-5.png',1554],['sketch-6.png',1569],['sketch-7.png',1387],['sketch-8.png',1362],['sketch-9.png',1481],['sketch-10.png',1550],['sketch-11.png',1563]];
const field=document.getElementById('drift');
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const items=SK.map(([f,nw],i)=>{
  const fig=document.createElement('figure');fig.className='sk';
  const img=new Image();img.src='/assets/notes/'+f;img.alt='Conceptual sketch '+(i+1);img.draggable=false;img.decoding='async';
  fig.appendChild(img);field.appendChild(fig);
  const w=Math.round(nw*(.085+((i*41)%5)*.006));fig.style.width=w+'px';
  return {fig,w,nw,x:Math.random(),lane:(i+.5)/SK.length,sp:12+((i*37)%10),ph:i*1.7,paused:false};
});
items.forEach(it=>{
  it.fig.addEventListener('mouseenter',()=>it.paused=true);
  it.fig.addEventListener('mouseleave',()=>{it.paused=false;});
  it.fig.addEventListener('click',()=>{const o=it.fig.classList.toggle('open');it.fig.style.width=(o?Math.min(it.nw,innerWidth*.7):it.w)+'px';});
});
let last=performance.now();
function tick(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  const W=innerWidth,H=innerHeight;
  for(const it of items){
    const w=it.fig.offsetWidth,h=it.fig.offsetHeight||w*.4;
    if(!it.paused&&!still&&!it.fig.classList.contains('open'))it.x+=it.sp*dt/(W+w);
    if(it.x>1)it.x-=1;
    const px=it.x*(W+w)-w;
    const py=90+it.lane*(H-180-h)+Math.sin(now/4000+it.ph)*14;
    it.fig.style.transform=`translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
