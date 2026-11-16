(() => {
  'use strict';
  const phone = '996551005454';
  const waURL = message => 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  document.querySelectorAll('[data-uniform-message]').forEach(link => {
    link.href = waURL(link.dataset.uniformMessage);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
  const form = document.querySelector('#uniformForm');
  document.querySelectorAll('[data-uniform-sector]').forEach(link => {
    link.addEventListener('click', () => { form.elements.sector.value = link.dataset.uniformSector; });
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const field = name => String(data.get(name) || '').trim() || 'уточним';
    const message = `Здравствуйте, By_R.Lab! Хочу обсудить униформу для команды.\n\nКомпания: ${field('company')}\nНаправление: ${field('sector')}\nСтрана: ${field('country')}\nСотрудников: ${field('count')}\nДиапазон размеров: ${field('sizeMin')} — ${field('sizeMax')}\nКомплект и пожелания: ${field('garments')}\n\nХочу согласовать пробный образец, размерную линейку для примерки сотрудников и условия пошива партии.`;
    window.open(waURL(message), '_blank', 'noopener,noreferrer');
  });
  const header = document.querySelector('#header');
  const toggle = document.querySelector('#menuToggle');
  const menu = document.querySelector('#mobileMenu');
  const background = [...document.querySelectorAll('main,footer,.u-credits,.sticky-wa')];
  function setMenu(open, returnFocus = false) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    toggle.textContent = open ? '×' : '☰';
    document.body.style.overflow = open ? 'hidden' : '';
    background.forEach(element => { element.inert = open; });
    if (open) menu.querySelector('a')?.focus();
    else if (returnFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    if (event.key !== 'Tab') return;
    const elements = [toggle, ...menu.querySelectorAll('a')];
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width:801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rulers = [...document.querySelectorAll('.measure-ruler')];
  let frame = 0;
  function paint() {
    frame = 0;
    header?.classList.toggle('scrolled', scrollY > 24);
    if (reduced.matches) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    rulers.forEach(element => element.style.setProperty('--ruler-progress', (progress * 100).toFixed(3) + '%'));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  paint();
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
