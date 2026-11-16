(()=>{
'use strict';
const items=window.BYRLAB_GALLERY;
const root=document.querySelector('#portfolio'),mosaic=document.querySelector('#eg-mosaic'),dialog=document.querySelector('#eg-dialog');
if(!root||!mosaic||!dialog||!Array.isArray(items))return;
const filters=[...root.querySelectorAll('[data-eg-filter]')];
const titles={tailoring:'Жакеты и костюмы',dresses:'Платья',shirts:'Рубашки и жилеты',couture:'Вечерние образы',casual:'Повседневная одежда',corporate:'Корпоративная одежда'};
const byId=new Map(items.map(x=>[x.id,x]));
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const reduced=matchMedia('(prefers-reduced-motion:reduce)'),desktop=matchMedia('(min-width:901px)');
let active='all',animations=[],refreshTimer=0,modalPhotos=[],modalIndex=0,modalProduct=null,lastOpener=null,oldOverflow='';
function photosFor(item,v){
 const all=[v.image,v.editorial_image,v.original_image,...(v.detail_images||[])].filter(Boolean);
 return [...new Set(all)].map(src=>({src,kind:src.includes('/optimized/')?'Оригинальный снимок':'AI-визуализация'}));
}
function pictureHTML(v,wide,i){
 const main=wide&&v.editorial_image?v.editorial_image:v.image;
 return `<picture>${wide&&v.editorial_image?`<source media="(max-width:600px)" srcset="${safe(v.image)}">`:''}<img src="${safe(main)}" alt="" width="${wide?1536:1024}" height="${wide?1024:1536}" loading="${i<2?'eager':'lazy'}" decoding="async"></picture>`;
}
function cardHTML(item,i){
 const v=item.variants[0],wide=i===2||i>5&&(i-3)%8===6;
 const confirmed=item.variants_confirmed===true&&item.variants.length>1;
 const color=confirmed?`<div class="eg-swatches" role="group" aria-label="Цветовые варианты ${safe(item.title)}">${item.variants.map((x,j)=>`<button type="button" data-eg-variant="${j}" style="--tone:${safe(x.color)}" aria-label="Показать цвет ${safe(x.label)}" aria-pressed="${j===0}"><span></span></button>`).join('')}<span data-eg-color>${safe(v.label)}</span></div>`:`<span class="eg-color"><i style="--tone:${safe(v.color)}" aria-hidden="true"></i>${safe(v.label)}</span>`;
 const detail=i>3&&v.detail_images?.length>1?v.detail_images[1]:null;
 return `<article class="eg-card ${wide?'eg-card--wide':i<2?'eg-card--lead':'eg-card--position-'+((i-3)%6)}" data-eg-product="${safe(item.id)}"><div class="eg-image-pair"><button class="eg-media" type="button" data-eg-open="${safe(item.id)}" data-eg-wide="${wide}" aria-label="Открыть полноэкранный просмотр: ${safe(item.title)}">${pictureHTML(v,wide,i)}<span class="eg-index" aria-hidden="true">${String(i+1).padStart(2,'0')} / ${safe(titles[item.category])}</span><span class="eg-view" aria-hidden="true">${arrow}</span></button>${detail?`<button type="button" class="eg-inset" data-eg-detail="${safe(detail)}" data-eg-open="${safe(item.id)}" aria-label="Дополнительный ракурс: ${safe(item.title)}"><img src="${safe(detail)}" alt="" loading="lazy" decoding="async"><span>Детали</span></button>`:''}</div><div class="eg-card-info"><div><h3>${safe(item.title)}</h3><p>${safe(item.subtitle)}</p></div>${color}</div></article>`;
}
function ctaHTML(){return `<aside class="eg-inquiry"><div><span class="eyebrow">Ваша следующая коллекция</span><h3>Увидели идею<br><em>для своего бренда?</em></h3></div><div><p>Обсудим лекала, образец и пошив небольшой партии по вашей модели.</p><a class="cta" href="https://wa.me/996700551335?text=${encodeURIComponent('Здравствуйте, By_R.Lab! Хочу обсудить пошив своей коллекции. Посмотрел(а) вашу fashion-галерею.')}" target="_blank" rel="noopener noreferrer"><span>Обсудить пошив своей коллекции</span><span class="arr">${arrow}</span></a></div></aside>`}
function clearMotion(){animations.forEach(a=>{a.scrollTrigger?.kill();a.kill()});animations=[];if(window.gsap)gsap.set(root.querySelectorAll('.eg-media,.eg-media img'),{clearProps:'clipPath,opacity,transform'})}
function enhanceMotion(){
 clearMotion();if(reduced.matches||!desktop.matches||!window.gsap||!window.ScrollTrigger)return;
 root.querySelectorAll('.eg-media').forEach(el=>{
  animations.push(gsap.fromTo(el,{clipPath:'inset(7% 0 7% 0)',opacity:.75},{clipPath:'inset(0% 0 0% 0)',opacity:1,duration:.9,ease:'power3.out',clearProps:'clipPath,opacity',scrollTrigger:{trigger:el,start:'top 95%',once:true}}));
 });
 ScrollTrigger.refresh();
}
function render(){
 clearMotion();const data=active==='all'?items:items.filter(x=>x.category===active);
 const html=data.map((x,i)=>cardHTML(x,i)+(i===2?ctaHTML():'')).join('');mosaic.innerHTML=html;
 const n=data.length;root.querySelector('#eg-result-count').textContent=`${n} ${n%10===1&&n%100!==11?'образец':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'образца':'образцов'}`;
 enhanceMotion();
}
function updateModal(){
 const photo=modalPhotos[modalIndex],img=dialog.querySelector('#eg-detail-image');if(!photo)return;
 img.src=photo.src;img.alt=modalProduct.title+' — '+photo.kind.toLowerCase()+', кадр '+(modalIndex+1);
 dialog.querySelector('#eg-photo-kind').textContent=photo.kind;
 dialog.querySelector('#eg-modal-counter').textContent=String(modalIndex+1).padStart(2,'0')+' / '+String(modalPhotos.length).padStart(2,'0');
 dialog.querySelectorAll('[data-eg-photo]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===modalIndex)));
 dialog.querySelectorAll('#eg-modal-prev,#eg-modal-next').forEach(b=>b.disabled=modalPhotos.length<2);
}
function open(item,v,opener,requested){
 modalProduct=item;modalPhotos=photosFor(item,v);modalIndex=Math.max(0,modalPhotos.findIndex(p=>p.src===requested));lastOpener=opener;
 dialog.querySelector('#eg-detail-title').textContent=item.title;
 dialog.querySelector('#eg-detail-subtitle').textContent=item.subtitle+' / '+v.label;
 dialog.querySelector('#eg-modal-note').textContent=item.ai_note;
 dialog.querySelector('.eg-modal-inquiry').href='https://wa.me/996700551335?text='+encodeURIComponent('Здравствуйте, By_R.Lab! Хочу обсудить разработку модели: '+item.title+'.');
 dialog.querySelector('#eg-modal-thumbnails').innerHTML=modalPhotos.map((p,i)=>`<button type="button" data-eg-photo="${i}" aria-pressed="${i===modalIndex}" aria-label="${safe(p.kind)}, кадр ${i+1}"><img src="${safe(p.src)}" alt="" loading="lazy"></button>`).join('');
 oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';updateModal();dialog.showModal();
}
function move(delta){modalIndex=(modalIndex+delta+modalPhotos.length)%modalPhotos.length;updateModal()}
mosaic.addEventListener('click',e=>{
 const card=e.target.closest('[data-eg-product]');if(!card)return;
 const item=byId.get(card.dataset.egProduct);if(!item)return;
 const switcher=e.target.closest('[data-eg-variant]');
 if(switcher){
  if(!item.variants_confirmed)return;const i=Number(switcher.dataset.egVariant),v=item.variants[i];if(!v)return;
  card.dataset.variant=String(i);card.querySelector('.eg-media picture').outerHTML=pictureHTML(v,card.classList.contains('eg-card--wide'),9);
  card.querySelectorAll('[data-eg-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===switcher)));card.querySelector('[data-eg-color]').textContent=v.label;return;
 }
 const opener=e.target.closest('[data-eg-open]');if(!opener)return;
 const v=item.variants[Number(card.dataset.variant||0)];
 const requested=opener.dataset.egDetail||(opener.dataset.egWide==='true'&&innerWidth>600?v.editorial_image:null)||v.image;
 open(item,v,opener,requested);
});
filters.forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.egFilter;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));render()}));
dialog.querySelector('#eg-modal-close').addEventListener('click',()=>dialog.close());
dialog.querySelector('#eg-modal-prev').addEventListener('click',()=>move(-1));dialog.querySelector('#eg-modal-next').addEventListener('click',()=>move(1));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();const button=e.target.closest('[data-eg-photo]');if(button){modalIndex=Number(button.dataset.egPhoto);updateModal()}});
dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;if(lastOpener?.isConnected)lastOpener.focus()});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
let touchX=null;const area=dialog.querySelector('.eg-modal-picture');area.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchX=e.clientX},{passive:true});area.addEventListener('pointerup',e=>{if(touchX!==null){const dx=e.clientX-touchX;if(Math.abs(dx)>50)move(dx<0?1:-1);touchX=null}},{passive:true});area.addEventListener('pointercancel',()=>{touchX=null});
root.addEventListener('load',e=>{if(e.target.tagName==='IMG'&&window.ScrollTrigger){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>ScrollTrigger.refresh(),120)}},true);
reduced.addEventListener('change',enhanceMotion);desktop.addEventListener('change',enhanceMotion);
root.querySelector('#eg-all-total').textContent=items.length;render();
})();
