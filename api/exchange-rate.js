// NBKR publishes KGS per nominal KZT; invert it for the site's KGS prices.
module.exports = async function exchangeRate(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  try {
    const response = await fetch('https://www.nbkr.kg/XML/daily.xml', {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('NBKR returned ' + response.status);
    const xml = await response.text();
    const currency = xml.match(/<Currency\s+ISOCode="KZT">([\s\S]*?)<\/Currency>/)?.[1];
    const nominal = Number(currency?.match(/<Nominal>([^<]+)<\/Nominal>/)?.[1].replace(',', '.'));
    const value = Number(currency?.match(/<Value>([^<]+)<\/Value>/)?.[1].replace(',', '.'));
    const asOf = xml.match(/<CurrencyRates[^>]*\bDate="(\d{2}\.\d{2}\.\d{4})"/)?.[1];
    if (!asOf || !(nominal > 0) || !(value > 0)) throw new Error('Invalid NBKR KZT quote');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ kztPerKgs: nominal / value, asOf, source: 'НБКР' });
  } catch (error) {
    console.error('NBKR rate unavailable:', error.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Official exchange rate temporarily unavailable' });
  }
};
