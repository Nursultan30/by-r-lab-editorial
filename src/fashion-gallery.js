(()=>{'use strict';
const phone='996700551335';
const images=[
 {title:'Пиджаки',filter:'Пиджаки',img:'assets/gallery-tailoring.webp',desc:'Конструирование жакетов и пиджаков'},
 {title:'Пальто',filter:'Верхняя одежда',img:'assets/gallery-coat.webp',desc:'Верхняя одежда и сложные конструкции'},
 {title:'Платья',filter:'Платья',img:'assets/gallery-dress.webp',desc:'Платья и капсульные коллекции'},
 {title:'Блузы',filter:'Все',img:'assets/gallery-blouse.webp',desc:'Блузы и лёгкая одежда'},
 {title:'Трикотаж',filter:'Трикотаж',img:'assets/gallery-tricot.webp',desc:'Повседневный трикотаж'},
 {title:'Костюмы',filter:'Костюмы',img:'assets/gallery-black-suit.webp',desc:'Костюмные группы'}
];
function wa(title){return 'https://wa.me/'+phone+'?text='+encodeURIComponent('Здравствуйте! Хочу обсудить разработку лекал и пошив категории «'+title+'» для моего бренда.');}
const showcase=document.getElementById('fashion-showcase');
let cidx=0;
if(showcase){
 const front=showcase.querySelector('.byr-showcase-photo');
 const back=showcase.querySelector('.byr-showcase-backdrop img');
 const head=showcase.querySelector('#byr-showcase-title');
 const count=showcase.querySelector('.byr-showcase-count');
 const cta=showcase.querySelector('#byr-showcase-cta');
 const tabs=[...showcase.querySelectorAll('[data-slide]')];
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const AUTOPLAY_MS=7500, MANUAL_PAUSE_MS=6500;
 let busy=false, visible=false, pointerOver=false, focusWithin=false;
 let autoTimer=null, manualUntil=0, pendingTimers=[];
 const preload=images.map(x=>{const i=new Image();i.src=x.img;return i});
 function later(fn,ms){const id=setTimeout(fn,ms);pendingTimers.push(id);return id;}
 function clearSequence(){pendingTimers.forEach(clearTimeout);pendingTimers=[];}
 function clearAuto(){if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;}}
 function canAuto(){return false&&visible&&!document.hidden&&!pointerOver&&!focusWithin&&!reduceMotion.matches&&!busy&&Date.now()>=manualUntil;}
 function scheduleAuto(){
  clearAuto(); return;
  if(reduceMotion.matches || !visible || document.hidden)return;
  const delay=Math.max(AUTOPLAY_MS,manualUntil-Date.now()+100);
  autoTimer=setTimeout(()=>{
   if(!canAuto()){scheduleAuto();return;}
   pick(cidx+1,{manual:false});
  },delay);
 }
 function setContent(n){
  cidx=n;
  const item=images[n];
  front.src=item.img;
  front.alt='Демонстрационная fashion-фотография: '+item.title;
  back.src=item.img;
  head.textContent=item.title;
  count.textContent=String(n+1).padStart(2,'0')+' / '+String(images.length).padStart(2,'0');
  cta.href=wa(item.title);
  tabs.forEach((tab,k)=>{tab.classList.toggle('is-active',k===n);tab.setAttribute('aria-selected',String(k===n));});
 }
 function pick(i,{manual=true}={}){
  if(manual){manualUntil=Date.now()+MANUAL_PAUSE_MS;clearAuto();}
  if(busy)return;
  const n=(i+images.length)%images.length;
  if(n===cidx){scheduleAuto();return;}
  if(reduceMotion.matches){setContent(n);scheduleAuto();return;}
  busy=true;
  const direction=(manual && i<cidx)?'right':'left';
  // OUT: current card + caption leave left, revealing the next slide from the right.
  showcase.classList.remove('is-entering-left','is-entering-right','is-leaving-left','is-leaving-right');
  void showcase.offsetWidth;
  showcase.classList.add('is-leaving-'+direction);
  later(()=>{
    setContent(n);
    showcase.classList.remove('is-leaving-'+direction);
    showcase.classList.add(direction==='left'?'is-entering-right':'is-entering-left');
    void showcase.offsetWidth;
    requestAnimationFrame(()=>showcase.classList.remove('is-entering-left','is-entering-right'));
    later(()=>{busy=false;clearSequence();scheduleAuto();},520);
  },330);
 }
 tabs.forEach((tab,i)=>tab.addEventListener('click',()=>pick(i,{manual:true})));
 showcase.querySelector('[data-direction="prev"]').addEventListener('click',()=>pick(cidx-1,{manual:true}));
 showcase.querySelector('[data-direction="next"]').addEventListener('click',()=>pick(cidx+1,{manual:true}));
 showcase.addEventListener('keydown',e=>{
   if(e.target.closest('.byr-showcase-tabs')&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){
    e.preventDefault();const n=(cidx+(e.key==='ArrowRight'?1:-1)+images.length)%images.length;
    tabs[n].focus();pick(n,{manual:true});
   }
 });
 let x0=null;
 showcase.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
 showcase.addEventListener('touchend',e=>{if(x0!==null){const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>55)pick(cidx+(d<0?1:-1),{manual:true});x0=null;}},{passive:true});
 showcase.addEventListener('mouseenter',()=>{pointerOver=true;clearAuto()});
 showcase.addEventListener('mouseleave',()=>{pointerOver=false;scheduleAuto()});
 showcase.addEventListener('focusin',()=>{focusWithin=true;clearAuto()});
 showcase.addEventListener('focusout',()=>{setTimeout(()=>{focusWithin=showcase.contains(document.activeElement);scheduleAuto()},0)});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAuto();else scheduleAuto()});
 if(reduceMotion.addEventListener)reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)clearAuto();else scheduleAuto()});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)scheduleAuto();else clearAuto()},{threshold:.35});
  observer.observe(showcase);
 }else{visible=true;scheduleAuto()}
 // Match initial CTA to initial title, not any stale link in the HTML.
 setContent(0);
}

const gallery=document.getElementById('byr-gallery');
if(gallery){
 const deck=gallery.querySelector('.byr-gallery-deck');
 const filters=[...gallery.querySelectorAll('[data-filter]')];
 let filtered=images.slice(),active=0,frame=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 filters.forEach(b=>{b.setAttribute('role','tab');b.setAttribute('aria-controls','portfolio-gallery-panel');});
 deck.id='portfolio-gallery-panel';deck.setAttribute('role','tabpanel');deck.tabIndex=0;
 deck.setAttribute('aria-label','Fashion-фотографии. Используйте стрелки для переключения.');
 function update(){
  const item=filtered[active];if(!item)return;
  gallery.querySelector('.byr-gallery-title').textContent=item.title;
  gallery.querySelector('.byr-gallery-subtitle').textContent=item.desc+' · демонстрационное фото';
  gallery.querySelector('.byr-gallery-current').textContent=String(active+1).padStart(2,'0');
  gallery.querySelector('.byr-gallery-total').textContent=String(filtered.length).padStart(2,'0');
  gallery.querySelector('.byr-gallery-progress span').style.width=((active+1)/filtered.length*100)+'%';
  gallery.querySelectorAll('.byr-gallery-arrow').forEach(b=>b.disabled=filtered.length<2);
 }
 function build(){
  const state=window.Flip&&!reduced.matches?Flip.getState(deck.children):null;
  deck.replaceChildren(...filtered.map(item=>{
   const card=document.createElement('div');card.className='byr-gallery-card';card.dataset.flipId=item.title;
   const img=document.createElement('img');img.src=item.img;img.alt='Демонстрационная fashion-фотография — '+item.title;img.loading='lazy';img.draggable=false;
   card.append(img);return card;
  }));
  deck.scrollLeft=0;active=0;update();
  if(state)Flip.from(state,{duration:.5,ease:'power2.out',absolute:false,onEnter:els=>gsap.fromTo(els,{opacity:.4,y:20},{opacity:1,y:0,duration:.45,clearProps:'all'})});
 }
 function move(step){
  active=(active+step+filtered.length)%filtered.length;
  const card=deck.children[active];
  deck.scrollTo({left:card.offsetLeft-deck.children[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});update();
 }
 gallery.querySelector('.byr-gallery-arrow--prev').addEventListener('click',()=>move(-1));
 gallery.querySelector('.byr-gallery-arrow--next').addEventListener('click',()=>move(1));
 filters.forEach((b,i)=>b.addEventListener('click',()=>{
  filtered=b.dataset.filter==='Все'?images.slice():images.filter(x=>x.filter===b.dataset.filter);
  filters.forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1});build();
 }));
 filters.forEach((b,i)=>b.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?filters.length-1:(i+(e.key==='ArrowRight'?1:-1)+filters.length)%filters.length;
  filters[n].focus();filters[n].click();
 }));
 deck.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 deck.addEventListener('scroll',()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
  const first=deck.children[0];if(!first)return;
  const width=first.getBoundingClientRect().width+parseFloat(getComputedStyle(deck).gap||0);
  active=Math.max(0,Math.min(filtered.length-1,Math.round(deck.scrollLeft/width)));update();
 })},{passive:true});
 // Native touch scrolling and pointer dragging share the same horizontal rail.
 let start=null,left=0;
 deck.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;start=e.clientX;left=deck.scrollLeft;deck.setPointerCapture(e.pointerId);deck.style.scrollSnapType='none'});
 deck.addEventListener('pointermove',e=>{if(start!==null)deck.scrollLeft=left+start-e.clientX});
 function stop(){start=null;deck.style.scrollSnapType=''}
 deck.addEventListener('pointerup',stop);deck.addEventListener('pointercancel',stop);
 build();
}
})();
