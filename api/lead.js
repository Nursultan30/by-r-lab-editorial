const DOMAIN_PATTERN = /^[a-z0-9-]+\.amocrm\.(?:ru|com)$/i;
const PHONE = /^\+?[0-9 ()-]{7,25}$/;

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^996\d{9}$/.test(digits)) return '+' + digits;
  if (/^0\d{9}$/.test(digits)) return '+996' + digits.slice(1);
  if (/^\d{9}$/.test(digits)) return '+996' + digits;
  if (/^\d{10,15}$/.test(digits)) return '+' + digits;
  return '';
}
function safe(value, max = 300) {
  return String(value ?? '').trim().slice(0, max);
}
function cleanDomain(raw) {
  const domain = String(raw || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return DOMAIN_PATTERN.test(domain) ? domain : null;
}
async function amo(domain, token, method, path, body) {
  const response = await fetch('https://' + domain + '/api/v4/' + path, {
    method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error('amoCRM request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}
function searchMatches(contact, phone) {
  const fields = contact.custom_fields_values || [];
  return fields.some(field => field.field_code === 'PHONE' &&
    (field.values || []).some(value => normalizePhone(value.value) === phone));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Метод не поддерживается' });
  const allowedHosts = new Set(['www.by-r-lab.com', 'by-r-lab.com']);
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
  const origin = req.headers.origin;
  if (origin) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || (url.hostname !== host && !allowedHosts.has(url.hostname))) {
        return res.status(403).json({ ok: false, error: 'Недопустимый источник запроса' });
      }
    } catch (_) {
      return res.status(403).json({ ok: false, error: 'Недопустимый источник запроса' });
    }
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (safe(body.website, 200)) return res.status(200).json({ ok: true });
  if (JSON.stringify(body).length > 10000) return res.status(413).json({ ok: false, error: 'Слишком большой запрос' });
  const name = safe(body.name, 120);
  const rawPhone = safe(body.phone, 25);
  const phone = normalizePhone(rawPhone);
  if (name.length < 2 || !PHONE.test(rawPhone) || !phone) {
    return res.status(400).json({ ok: false, error: 'Укажите имя и корректный телефон' });
  }
  const domain = cleanDomain(process.env.AMOCRM_DOMAIN);
  const token = process.env.AMOCRM_TOKEN;
  const pipeline = Number(process.env.AMOCRM_PIPELINE_ID);
  const status = Number(process.env.AMOCRM_STATUS_ID);
  if (!domain || !token || !Number.isSafeInteger(pipeline) || !Number.isSafeInteger(status)) {
    return res.status(503).json({ ok: false, error: 'Приём заявок временно недоступен' });
  }
  try {
    const found = await amo(domain, token, 'GET', 'contacts?query=' + encodeURIComponent(phone) + '&limit=50');
    let contact = (found._embedded?.contacts || []).find(c => searchMatches(c, phone));
    let contactId = contact?.id;
    if (!contactId) {
      const created = await amo(domain, token, 'POST', 'contacts', [{
        name,
        custom_fields_values: [{ field_code: 'PHONE', values: [{ value: phone, enum_code: 'WORK' }] }]
      }]);
      contactId = created._embedded?.contacts?.[0]?.id;
    }
    if (!contactId) throw new Error('Missing contact ID');
    const source = safe(body.page || '', 300);
    const note = [
      'Заявка с сайта By_R_Lab', 'Имя: ' + name, 'Телефон: ' + phone,
      'Услуга: ' + safe(body.service, 120), 'Роль: ' + safe(body.role, 120),
      'Страна: ' + safe(body.country, 80), 'Количество: ' + safe(body.quantity, 30),
      'Компания: ' + safe(body.company, 120), 'Сфера: ' + safe(body.sector, 120),
      'Размеры: ' + safe(body.sizes, 80), 'Комментарий: ' + safe(body.message, 2000),
      'Страница: ' + source,
      ...['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k => k + ': ' + safe(body[k], 160))
    ].join('\n');
    const createdLead = await amo(domain, token, 'POST', 'leads', [{
      name: 'Заявка с сайта — ' + name,
      pipeline_id: pipeline, status_id: status,
      _embedded: { contacts: [{ id: contactId }] }
    }]);
    const leadId = createdLead._embedded?.leads?.[0]?.id;
    if (!leadId) throw new Error('Missing lead ID');
    try {
      await amo(domain, token, 'POST', 'leads/notes', [{ entity_id: leadId, note_type: 'common', params: { text: note } }]);
    } catch (error) {
      console.error('amoCRM note failed', { status: error.status || null });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('amoCRM lead failed', { status: error.status || null });
    return res.status(502).json({ ok: false, error: 'Не удалось отправить заявку. Попробуйте позже или напишите в WhatsApp.' });
  }
};
