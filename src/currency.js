(() => {
  'use strict';
  const prices = [...document.querySelectorAll('[data-price-kgs]')];
  const notes = [...document.querySelectorAll('.fx-rate-note')];
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  // Verified NBKR snapshot: 16.11.2026, 1 KZT = 0.1972 KGS.
  // Always disclose its date if the current quote cannot be retrieved.
  let quote = { kztPerKgs: 1 / 0.1972, asOf: '16.11.2026' };
  let tenge = false;
  function render() {
    for (const node of prices) {
      const amount = Number(node.dataset.priceKgs);
      const prefix = node.dataset.pricePrefix || '';
      const kgs = prefix + number.format(amount) + ' сом';
      const kzt = '≈ ' + prefix + number.format(amount * quote.kztPerKgs) + ' ₸';
      node.textContent = tenge ? kzt : kgs;
      node.setAttribute('aria-live', 'off');
      node.setAttribute('aria-label', kgs + '; ' + kzt + ', ориентировочно. Курс НБКР на ' + quote.asOf);
    }
  }
  function rateNote(fallback) {
    const rate = quote.kztPerKgs.toLocaleString('ru-RU', { maximumFractionDigits: 5 });
    for (const note of notes) note.textContent = `Тенге — ориентир: 1 сом ≈ ${rate} ₸. НБКР, ${quote.asOf}.${fallback ? ' Показан последний сохранённый курс; обновление временно недоступно.' : ''} Окончательную стоимость и валюту оплаты согласуем при расчёте.`;
    for (const node of prices) node.title = 'Курс НБКР на ' + quote.asOf + (fallback ? ' · сохранённый курс' : '');
  }
  async function refreshRate() {
    try {
      const response = await fetch('/api/exchange-rate', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Rate unavailable');
      const value = await response.json();
      if (!Number.isFinite(value.kztPerKgs) || value.kztPerKgs <= 0 || !/^\d{2}\.\d{2}\.\d{4}$/.test(value.asOf)) throw new Error('Invalid rate');
      quote = value;
      rateNote(false);
    } catch {
      rateNote(true);
    }
    render();
  }
  render();
  rateNote(true);
  refreshRate();
  setInterval(() => { if (!document.hidden) { tenge = !tenge; render(); } }, 1000);
  setInterval(refreshRate, 3600000);
})();
