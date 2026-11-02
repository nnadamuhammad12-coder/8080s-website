export function nearestTopic(pointer, topics, radius = 165) {
  if (!pointer) return {index:-1,strength:0};
  let index=-1,distance=radius;
  topics.forEach((p,i)=>{const d=Math.hypot(pointer.x-p.x,pointer.y-p.y);if(d<distance){distance=d;index=i;}});
  return {index,strength:index<0?0:Math.pow(1-distance/radius,.65)};
}
function curve(a,b,c,t){const u=1-t;return [u*u*a[0]+2*u*t*b[0]+t*t*c[0],u*u*a[1]+2*u*t*b[1]+t*t*c[1]];}
export function createInteractionField({area,buttons,redraw,reduced}) {
  let pointer=null,keyboard=-1,current=-1,weights=buttons.map(()=>0);
  area.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=area.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};redraw();});
  area.addEventListener('pointerleave',()=>{pointer=null;redraw();});
  buttons.forEach((button,i)=>{button.addEventListener('focus',()=>{keyboard=i;redraw();});button.addEventListener('blur',()=>{keyboard=-1;redraw();});});
  return {
    get pointer(){return pointer;},
    get keyboard(){return keyboard;},
    get tilt(){if(!pointer)return {x:0,y:0};const r=area.getBoundingClientRect();return {x:(pointer.x/r.width-.5)*.14,y:(pointer.y/r.height-.5)*.1};},
    draw(ctx,{width,height,scale,ink,time,vertices,anchors,focus,moving}) {
      const points=buttons.map(b=>({x:parseFloat(b.style.left),y:parseFloat(b.style.top)}));
      const near=focus??(keyboard>=0?{index:keyboard,strength:1}:nearestTopic(pointer,points,Math.min(180,width*.37)));
      if(current!==near.index){current=near.index;area.dataset.focusedTopic=current<0?'':buttons[current].textContent;buttons.forEach((b,i)=>b.classList.toggle('is-near',i===current));}
      const t=time/1000;
      ctx.save();ctx.lineWidth=1;
      points.forEach((target,i)=>{
        const wanted=near.index===i?near.strength:0;
        weights[i]=reduced.matches?wanted:weights[i]+(wanted-weights[i])*.14;
        const w=weights[i];
        const anchor=anchors?.[i]??vertices.reduce((best,p)=>Math.hypot(p[0]-target.x,p[1]-target.y)<Math.hypot(best[0]-target.x,best[1]-target.y)?p:best,vertices[0]);
        const dx=target.x-anchor[0],dy=target.y-anchor[1],distance=Math.hypot(dx,dy)||1;
        const end=[target.x-dx/distance*Math.min(25,distance*.45),target.y-dy/distance*Math.min(25,distance*.45)];
        const bend=(Math.sin(t*.55+i*1.7)*5+(1-w)*5)*Math.min(1,distance/90);
        const control=[(anchor[0]+end[0])/2-dy/distance*bend,(anchor[1]+end[1])/2+dx/distance*bend];
        ctx.beginPath();ctx.moveTo(anchor[0],anchor[1]);ctx.quadraticCurveTo(...control,...end);ctx.strokeStyle=`rgba(${ink},${.27+w*.48})`;ctx.setLineDash([2,6]);ctx.stroke();ctx.setLineDash([]);
        if(!reduced.matches){
          const count=Math.max(3,Math.round(distance/14))+Math.round(w*16);
          for(let n=0;n<count;n++){
            const phase=(t*(.13+w*.16)+n/count+i*.137)%1;
            // Approaching a topic draws the particles towards its end of the route.
            const progress=phase*(1-w*.58)+w*.58;
            const p=curve(anchor,control,end,progress),size=n%4===0?4:2.5;
            ctx.fillStyle=`rgba(${ink},${.58+w*.35})`;ctx.fillRect(Math.round(p[0]),Math.round(p[1]),size,size);
          }
          if(w>.08){const r=buttons[i].offsetWidth/2+10;for(let n=0;n<16;n++){const angle=n*Math.PI/8+t*.8;const x=target.x+Math.cos(angle)*(r+3*Math.sin(t+n)),y=target.y+Math.sin(angle)*27;ctx.fillStyle=`rgba(${ink},${w*.85})`;ctx.fillRect(Math.round(x),Math.round(y),3,3);}}
        }
      });
      if(!reduced.matches){
        // Small background visitors: a pair of flapping birds.
        for(let i=0;i<2;i++){
          const phase=(t*.035+i*.43)%1,x=-20+phase*(width+40),y=height*.13+Math.sin(t*.7+i)*11+i*18;
          const wing=Math.sin(t*9+i)*6;ctx.strokeStyle=`rgba(${ink},.78)`;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-10,y+wing);ctx.lineTo(x,y+3);ctx.lineTo(x+10,y+wing);ctx.stroke();
        }
      }
      ctx.restore();
    }
  };
}
