/* Motion enhances an already visible document. No loader or JS-dependent visibility. */
(()=>{
 const fine=matchMedia('(pointer:fine)').matches;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const cursor=document.getElementById('cursor');
 let cleanup=()=>{};
 function init(){
  cleanup();cleanup=()=>{};
  if(reduce.matches||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger,Flip);
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const timeline=gsap.timeline({defaults:{ease:'power3.out'}});
   timeline.from('.hero-line',{yPercent:28,opacity:0,duration:1,stagger:.1,clearProps:'all'})
    .from('.hero-photo-mask img',{scale:1.06,opacity:.3,duration:1.4,clearProps:'all'},0)
    .from('.hero-description,.hero .button-row',{y:15,opacity:0,duration:.7,stagger:.12,clearProps:'all'},.45);
   gsap.utils.toArray('main section:not(#hero) h2').forEach(el=>{
    gsap.from(el,{y:32,opacity:.15,duration:.9,clearProps:'all',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
   });
   gsap.utils.toArray('.editorial-photo,.bureau-image,.benefit-sketch').forEach(el=>{
    gsap.fromTo(el,{clipPath:'inset(8% 0 8% 0)'},{clipPath:'inset(0% 0 0% 0)',duration:1.1,clearProps:'clipPath',ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
   });
   if(innerWidth>800){
    gsap.utils.toArray('.bureau-image img,.editorial-photo img').forEach(img=>{
     gsap.fromTo(img,{yPercent:-3,scale:1.06},{yPercent:3,scale:1.06,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:1}});
    });
   }
   const paths=gsap.utils.toArray('.pattern-svg path');
   paths.forEach(p=>{const len=p.getTotalLength();gsap.set(p,{strokeDasharray:len,strokeDashoffset:len});gsap.to(p,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'#process',start:'top 65%',end:'bottom 80%',scrub:1}})});
   const steps=gsap.utils.toArray('.step');
   steps.forEach((step,i)=>ScrollTrigger.create({trigger:step,start:'top 60%',end:'bottom 40%',onEnter:()=>setStep(i),onEnterBack:()=>setStep(i)}));
   function setStep(i){const el=document.querySelector('.process-counter');if(el)el.textContent=String(i+1).padStart(2,'0')+' — 06'}
   return ()=>{gsap.set('.pattern-svg path',{clearProps:'all'});};
  });
  const off=[];
  function listen(el,event,fn){el.addEventListener(event,fn);off.push(()=>el.removeEventListener(event,fn))}
  if(fine&&cursor){
   document.body.classList.add('motion-ready');
   listen(document,'pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
   document.querySelectorAll('.byr-gallery-deck,.hero-figure,.byr-showcase-photo-frame').forEach(el=>{
    listen(el,'pointerenter',()=>{cursor.textContent=el.matches('.byr-gallery-deck')?'Листать':'Смотреть';cursor.classList.add('active')});
    listen(el,'pointerleave',()=>cursor.classList.remove('active'));
   });
   document.querySelectorAll('.magnetic').forEach(el=>{
    listen(el,'pointermove',e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.1,y:(e.clientY-r.top-r.height/2)*.15,duration:.4,overwrite:true})});
    listen(el,'pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.5,clearProps:'transform',overwrite:true}));
   });
  }
  cleanup=()=>{mm.revert();off.forEach(fn=>fn());document.body.classList.remove('motion-ready');cursor?.classList.remove('active')};
 }
 init();reduce.addEventListener('change',init);
 // Recalculate image-dependent scroll positions without making content invisible.
 window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
})();

// Independent of GSAP: decorative sewing scales remain visible if motion is disabled.
(()=>{
 const rulers=[...document.querySelectorAll('.measure-ruler')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 function paint(){frame=0;if(reduced.matches)return;const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?Math.max(0,Math.min(1,scrollY/max)):0;rulers.forEach(el=>el.style.setProperty('--ruler-progress',(progress*100).toFixed(3)+'%'))}
 function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);paint();
})();
