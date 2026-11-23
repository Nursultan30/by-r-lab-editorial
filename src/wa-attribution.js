(() => {
  'use strict';
  const phone = '996551005454';
  const marker = 'Источник: САЙТ By_R_Lab';
  const urlLabel = 'https://www.by-r-lab.com';
  function augment(href) {
    try {
      const u = new URL(href, location.origin);
      if (!['wa.me','www.wa.me','api.whatsapp.com'].includes(u.hostname)) return null;
      const original = u.searchParams.get('text') || '';
      const safeText = original.replace(/\n?Источник:\s*САЙТ By_R_Lab(?:\nСтраница:[^\n]*)?/gi,'').trim();
      const message = (safeText || 'Здравствуйте! Пишу с сайта By_R_Lab. Хочу обсудить заказ.') +
        '\n\n' + marker + '\nСтраница: ' + urlLabel + location.pathname;
      const destination = new URL('https://wa.me/' + phone);
      destination.searchParams.set('text', message);
      return destination.toString();
    } catch (_) { return null; }
  }
  function apply(link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const next = augment(href);
    if (next) {
      link.href = next;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  }
  function refresh() {
    document.querySelectorAll('a[href*="wa.me/"],a[href*="api.whatsapp.com/"]').forEach(apply);
  }
  refresh();
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a');
    if (link) apply(link);
  }, true);
})();