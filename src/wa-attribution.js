(() => {
  'use strict';
  const label = 'Источник: САЙТ By_R_Lab';
  function mark(url) {
    try {
      const parsed = new URL(url, location.origin);
      if (!['wa.me', 'www.wa.me', 'api.whatsapp.com'].includes(parsed.hostname)) return null;
      const original = parsed.searchParams.get('text') || '';
      const cleaned = original.replace(/\n*\s*Источник:\s*САЙТ By_R_Lab(?:\nСтраница:[^\n]*)?/gi, '').trim();
      const text = (cleaned || 'Здравствуйте! Пишу с сайта By_R_Lab.') +
        '\n\n' + label + '\nСтраница: ' + location.origin + location.pathname;
      parsed.searchParams.set('text', text);
      return parsed.href;
    } catch (_) { return null; }
  }
  function updateLinks() {
    document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]').forEach(anchor => {
      const updated = mark(anchor.href);
      if (updated) {
        anchor.href = updated;
        anchor.rel = 'noopener noreferrer';
      }
    });
  }
  updateLinks();
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    const updated = mark(anchor.href);
    if (updated) anchor.href = updated;
  }, true);
})();
