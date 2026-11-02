// Light deterrent against casual image saving: no right-click menu or dragging on images.
// (Anything shown in a browser can still be screenshotted; this only stops one-click copying.)
document.addEventListener('contextmenu',e=>{if(e.target.closest('img,canvas,video,.sheet-view,.photo'))e.preventDefault();});
document.addEventListener('dragstart',e=>{if(e.target.closest('img,canvas,video'))e.preventDefault();});
