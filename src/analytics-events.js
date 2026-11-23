(() => {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  const send = (data) => { window.dataLayer.push(data); };
  document.addEventListener('click', event => {
    const a = event.target.closest?.('a[href]');
    if (!a) return;
    try {
      const href = new URL(a.href, location.href);
      if (!['wa.me', 'www.wa.me', 'api.whatsapp.com'].includes(href.hostname)) return;
      send({
        event: 'whatsapp_click',
        channel: 'whatsapp',
        source_location: 'website',
        page_path: location.pathname,
        link_section: a.closest('section')?.id || a.closest('footer')?.className || 'other'
      });
    } catch (_) {}
  }, true);
  document.addEventListener('submit', event => {
    if (!['quoteForm', 'uniformForm'].includes(event.target?.id)) return;
    send({ event: 'whatsapp_form_intent', source_location: 'website', form_id: event.target.id, page_path: location.pathname });
  }, true);
})();