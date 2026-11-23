
(()=>{'use strict';
const WA='996551005454';const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const messages={consult:'Здравствуйте! Я представляю бренд одежды / занимаюсь дизайном. Хочу обсудить разработку лекал, образца или пошив небольшой партии в By_R.Lab.',patterns:'Здравствуйте! Хочу обсудить разработку электронных лекал в By_R.Lab.',sewing:'Здравствуйте! Хочу рассчитать пошив небольшой партии одежды в By_R.Lab.'};
function waUrl(text){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(text)};
$$('[data-wa]').forEach(a=>{a.href=waUrl(messages[a.dataset.wa]||messages.consult);a.target='_blank';a.rel='noopener noreferrer'});
const header=$('#header');function updateHeader(){header.classList.toggle('scrolled',scrollY>24)}addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const toggle=$('#menuToggle'),menu=$('#mobileMenu');function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';document.body.style.overflow=''}toggle.addEventListener('click',()=>{let on=!menu.classList.contains('open');menu.classList.toggle('open',on);toggle.setAttribute('aria-expanded',String(on));toggle.textContent=on?'×':'☰';document.body.style.overflow=on?'hidden':''});$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
$$('[data-select-role]').forEach(e=>e.addEventListener('click',()=>{$('#role').value=e.dataset.selectRole}));$$('[data-select-service]').forEach(e=>e.addEventListener('click',()=>{$('#service').value=e.dataset.selectService}));
$('#quoteForm').addEventListener('submit',e=>{e.preventDefault();const role=$('#role').value,country=$('#country').value,service=$('#service').value,qty=$('#quantity').value||'не указано',garment=$('#garment').value.trim()||'опишу в переписке';const msg=`Здравствуйте, By_R.Lab! Хочу рассчитать модель.\n\nЯ: ${role}\nСтрана: ${country}\nУслуга: ${service}\nКоличество изделий: ${qty}\nМодель / ТЗ: ${garment}\n\nПодскажите, пожалуйста, условия, стоимость и следующий шаг. Фото или эскиз могу отправить в чат.`;window.open(waUrl(msg+'\n\nИсточник: САЙТ By_R_Lab\nСтраница: '+location.pathname),'_blank','noopener,noreferrer')});
$('#year').textContent=new Date().getFullYear();
})();


(function(){
  'use strict';
  const WA='996551005454';
  document.querySelectorAll('[data-service-whatsapp]').forEach(a=>{
    const service=a.getAttribute('data-service-whatsapp')||'услуги';
    const text=`Здравствуйте, By_R.Lab! Хочу обсудить услугу «${service}». Подскажите, пожалуйста, условия и стоимость.`;
    a.href=`https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  });
  document.querySelectorAll('.service-editorial').forEach(card=>{
    const toggle=card.querySelector('.service-card-toggle');
    if(!toggle)return;
    const setOpen=(v)=>{card.classList.toggle('is-open',v);toggle.setAttribute('aria-expanded',String(v));};
    toggle.addEventListener('click',()=>setOpen(!card.classList.contains('is-open')));
    card.addEventListener('keydown',e=>{
      if(e.key==='Escape'){setOpen(false);card.focus();}
      if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();setOpen(!card.classList.contains('is-open'));}
    });
    card.addEventListener('mouseleave',()=>setOpen(false));
  });
  document.addEventListener('click',e=>{
    document.querySelectorAll('.service-editorial.is-open').forEach(card=>{
      if(!card.contains(e.target)){
        card.classList.remove('is-open');
        const t=card.querySelector('.service-card-toggle');if(t)t.setAttribute('aria-expanded','false');
      }
    });
  });

})();
// Keyboard focus follows the visible mobile menu, and returns to its trigger.
(()=>{
 const toggle=document.querySelector('#menuToggle'),menu=document.querySelector('#mobileMenu');
 const background=[document.querySelector('main'),document.querySelector('footer'),document.querySelector('.sticky-wa')];
 const sync=()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');background.forEach(x=>{if(x)x.inert=open});if(open)menu.querySelector('a')?.focus()};
 toggle.addEventListener('click',sync);
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>background.forEach(x=>{if(x)x.inert=false})));
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){background.forEach(x=>{if(x)x.inert=false});toggle.setAttribute('aria-label','Открыть меню');if(menu.contains(document.activeElement))toggle.focus()}
  if(e.key!=='Tab'||toggle.getAttribute('aria-expanded')!=='true')return;
  const links=[toggle,...menu.querySelectorAll('a')];const first=links[0],last=links.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 });
 const media=matchMedia('(min-width:801px)');media.addEventListener('change',e=>{if(e.matches&&toggle.getAttribute('aria-expanded')==='true'){toggle.click()}});
})();
