const rooms=[...document.querySelectorAll('.room')],links=[...document.querySelectorAll('[data-room]')];
let scheduled=false;
function update(){scheduled=false;const y=innerHeight*.38;let active=rooms[0];for(const room of rooms)if(room.getBoundingClientRect().top<=y)active=room;links.forEach(a=>a.setAttribute('aria-current',String(a.dataset.room===active.id)));const extent=document.documentElement.scrollHeight-innerHeight;document.querySelector('.form-progress span').style.width=`${extent>0?scrollY/extent*100:0}%`;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
try{const theme=localStorage.getItem('nada-theme');const t=theme==='green'?'blue':theme;if(['blue','yellow','red','light'].includes(t))document.body.dataset.theme=t;}catch{}
const viewer=document.querySelector('#photo-viewer'),large=document.querySelector('#large-photo');
document.querySelectorAll('.inspect').forEach(button=>button.onclick=()=>{const image=button.querySelector('img');large.src=image.src;large.alt=image.alt;document.querySelector('#large-caption').textContent=button.closest('figure').querySelector('figcaption').innerText.replace(/\n/g,' / ');viewer.showModal();});
document.querySelector('#close-photo').onclick=()=>viewer.close();
