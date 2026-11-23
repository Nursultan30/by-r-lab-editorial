(() => {
  'use strict';
  function addField(form, label, name, type, autocomplete) {
    if (form.querySelector('[name="' + name + '"]')) return;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const id = 'crm-' + form.id + '-' + name;
    const lab = document.createElement('label');
    lab.htmlFor = id; lab.textContent = label;
    const input = document.createElement('input');
    input.id = id; input.name = name; input.type = type;
    input.autocomplete = autocomplete; input.required = true;
    input.maxLength = type === 'tel' ? 25 : 120;
    if (type === 'tel') { input.inputMode = 'tel'; input.placeholder = '+996 700 000 000'; }
    wrap.append(lab, input);
    form.insertBefore(wrap, form.firstElementChild);
  }
  function collect(form) {
    const data = new FormData(form);
    const params = new URLSearchParams(location.search);
    const get = key => String(data.get(key) || '').trim();
    return {
      name: get('name'), phone: get('phone'), website: get('website'),
      role: get('role'), service: get('service'), country: get('country'),
      quantity: get('quantity') || get('count'), company: get('company'), sector: get('sector'),
      sizes: [get('sizeMin'), get('sizeMax')].filter(Boolean).join(' — '),
      message: get('garment') || get('garments'), page: location.href.slice(0, 500),
      ...Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k => [k, (params.get(k) || '').slice(0,160)]))
    };
  }
  function wire(id) {
    const form = document.getElementById(id);
    if (!form) return;
    addField(form, 'Телефон / WhatsApp', 'phone', 'tel', 'tel');
    addField(form, 'Ваше имя', 'name', 'text', 'name');
    const trap = document.createElement('input');
    trap.type = 'text'; trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden','true'); trap.style.display='none'; form.append(trap);
    const submit = form.querySelector('[type="submit"]');
    const caption = submit?.querySelector('span');
    if (caption) caption.textContent = 'Отправить заявку';
    const disclaimer = form.querySelector('.disclaimer');
    if (disclaimer) disclaimer.textContent = 'Заявка будет передана в By_R.Lab для связи с вами. Если форма недоступна, воспользуйтесь WhatsApp.';
    const status = document.createElement('p');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live','polite'); status.style.marginTop='12px';
    submit?.insertAdjacentElement('afterend', status);
    let busy = false;
    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (busy || !form.reportValidity()) return;
      busy = true; if(submit) submit.disabled = true;
      status.textContent = 'Отправляем заявку…';
      try {
        const response = await fetch('/api/lead', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(collect(form))
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error('CRM unavailable');
        status.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
        form.reset();
      } catch (_) {
        status.textContent = 'Не удалось отправить заявку. Напишите нам в WhatsApp или повторите попытку.';
      } finally {
        busy = false; if(submit) submit.disabled = false;
      }
    }, { capture: true });
  }
  wire('quoteForm');
  wire('uniformForm');
})();
