try{const t=localStorage.getItem('nada-theme');if(['blue','yellow','red'].includes(t))document.body.dataset.theme=t;}catch{}
// add new sketches here: [file, native width, native height]
const SK=[['sketch-1.png',1414,1086],['sketch-2.png',1488,1086],['sketch-3.png',1878,814],['sketch-4.png',1370,774],['sketch-5.png',1554,407],['sketch-6.png',1569,374],['sketch-7.png',1387,393],['sketch-8.png',1362,596],['sketch-9.png',1481,330],['sketch-10.png',1565,714],['sketch-11.png',1563,576]];
const field=document.getElementById('drift');
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const items=SK.map(([f,nw,nh],i)=>{
  const fig=document.createElement('figure');fig.className='sk';
  const img=new Image();img.src='/assets/notes/'+f;img.alt='Conceptual sketch '+(i+1);img.draggable=false;img.decoding='async';
  fig.appendChild(img);field.appendChild(fig);
  return {fig,ar:nw/nh,nh};
});
let rows=[],H0=0,last=performance.now(),open=null;
function layout(){
  const W=innerWidth,H=innerHeight,mob=W<700;
  H0=Math.round(mob?Math.max(38,Math.min(48,H*.055)):Math.max(46,Math.min(70,H*.07)));
  const top=mob?90:110,bottom=mob?100:120,avail=H-top-bottom;
  const n=Math.max(3,Math.min(mob?4:5,Math.floor(avail/(H0*2.1))));
  const step=n>1?(avail-H0)/(n-1):0;
  rows=Array.from({length:n},(_,r)=>({y:top+r*step,list:[],len:0,off:0,sp:(mob?9:14)+((r*5)%4)*2,paused:0}));
  items.forEach((it,i)=>{it.w=Math.round(H0*it.ar);it.fig.style.width=it.w+'px';it.fig.style.height=H0+'px';rows[i%n].list.push(it);});
  for(const [r,row] of rows.entries()){row.shift=0;
    const maxw=Math.max(...row.list.map(it=>it.w));row.shift=maxw;const total=row.list.reduce((s,it)=>s+it.w,0);
    row.len=Math.max(total+row.list.length*(mob?50:90),W+maxw+(mob?50:90));
    const sp=(row.len-total)/row.list.length;   // even spacing along the loop
    let x=0;for(const it of row.list){it.rx=x;it.row=row;x+=it.w+sp;}
    row.off=row.len*((r*0.37)%1);               // stagger rows
  }
}
items.forEach(it=>{
  it.fig.addEventListener('mouseenter',()=>it.row&&it.row.paused++);
  it.fig.addEventListener('mouseleave',()=>it.row&&(it.row.paused=Math.max(0,it.row.paused-1)));
  it.fig.addEventListener('click',()=>{
    if(open&&open!==it)close(open);
    if(it.fig.classList.toggle('open')){open=it;const h=Math.min(it.nh,innerHeight*.5,innerWidth*.85/it.ar);it.fig.style.width=Math.round(h*it.ar)+'px';it.fig.style.height=Math.round(h)+'px';}
    else close(it);
  });
});
function close(it){it.fig.classList.remove('open');it.fig.style.width=it.w+'px';it.fig.style.height=H0+'px';if(open===it)open=null;}
function tick(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  for(const row of rows){
    if(!row.paused&&!still&&!(open&&open.row===row))row.off=(row.off+row.sp*dt)%row.len;
    for(const it of row.list){
      let px=((it.rx+row.off)%row.len)-row.shift,py=row.y;
      if(it===open){const h=it.fig.offsetHeight,w=it.fig.offsetWidth;py=Math.max(80,Math.min(row.y,innerHeight-h-80));px=Math.max(16,Math.min(px,innerWidth-w-16));}
      it.fig.style.transform=`translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
    }
  }
  requestAnimationFrame(tick);
}
layout();addEventListener('resize',layout);requestAnimationFrame(tick);
