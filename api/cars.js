// Encar reverse-engineering proxy — uncapped, multi-fallback
// Supports full pagination over 200k+ listings

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

const FUEL_MAP = {
  diesel: '디젤', dizel: '디젤',
  benzin: '가솔린', benzine: '가솔린', gasoline: '가솔린', petrol: '가솔린',
  electric: '전기', elektrik: '전기', ev: '전기',
  hybrid: '하이브리드', hibrid: '하이브리드',
  lpg: 'LPG',
};

async function attempt(fetchUrl, isWrapped, signal, label, extraHeaders = {}) {
  const r = await fetch(fetchUrl, { signal, headers: extraHeaders });
  if (!r.ok) throw new Error(`${label}: HTTP ${r.status}`);
  const text = await r.text();

  let data;
  if (isWrapped) {
    const outer = JSON.parse(text);
    if (outer.status?.http_code === 403) throw new Error(`${label}: Encar 403 via proxy`);
    if (!outer.contents) throw new Error(`${label}: empty proxy contents`);
    data = JSON.parse(outer.contents);
  } else {
    data = JSON.parse(text);
  }

  if (!Array.isArray(data?.SearchResults)) throw new Error(`${label}: no SearchResults`);
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query;

  // Pagination — no artificial cap
  const page  = Math.max(0, parseInt(q.page  ?? '0'));
  const count = Math.min(500, Math.max(1, parseInt(q.count ?? '500'))); // Encar max per request = 500
  const offset = page * count;

  // Build Encar DSL filter
  const parts = [];

  if (q.manufacturer) parts.push(`Manufacturer.${q.manufacturer}`);
  if (q.model)        parts.push(`Model.${q.model}`);

  if (q.fuel) {
    const mapped = FUEL_MAP[q.fuel.toLowerCase().trim()] ?? q.fuel;
    parts.push(`FuelType.${mapped}`);
  }

  if (q.yearFrom || q.yearTo) {
    parts.push(`Year.range(${q.yearFrom ?? 2000}..${q.yearTo ?? 2030})`);
  }

  if (q.mileageFrom || q.mileageTo) {
    parts.push(`Mileage.range(${q.mileageFrom ?? 0}..${q.mileageTo ?? 9999999})`);
  }

  if (q.priceFrom || q.priceTo) {
    parts.push(`Price.range(${q.priceFrom ?? 0}..${q.priceTo ?? 999999})`);
  }

  const filter = parts.length > 0
    ? `(And.Hidden.N._.${parts.join('._.')}.)`
    : `(And.Hidden.N.)`;

  const encarUrl = `https://api.encar.com/search/car/list/general?${new URLSearchParams({
    count: 'true',
    q: filter,
    sr: `|ModifiedDate|${offset}|${count}`,
    inav: '|Metadata|Sort',
  })}`;

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  const enc   = encodeURIComponent(encarUrl);

  try {
    const data = await Promise.any([
      attempt(encarUrl,                                           false, ctrl.signal, 'direct',     BROWSER_HEADERS),
      attempt(`https://api.allorigins.win/get?url=${enc}`,       true,  ctrl.signal, 'allorigins',  {}),
      attempt(`https://corsproxy.io/?${enc}`,                    false, ctrl.signal, 'corsproxy',   {}),
      attempt(`https://api.codetabs.com/v1/proxy?quest=${enc}`,  false, ctrl.signal, 'codetabs',    {}),
    ]);

    clearTimeout(timer);
    return res.status(200).json({
      total:   data.Count,
      page,
      count:   data.SearchResults.length,
      results: data.SearchResults,
    });

  } catch (err) {
    clearTimeout(timer);
    const isTimeout = ctrl.signal.aborted;
    const detail    = err instanceof AggregateError
      ? err.errors.map(e => e.message).join(' | ')
      : err.message;

    return res.status(isTimeout ? 504 : 502).json({
      error:  isTimeout ? 'Request timed out. Retry.' : 'All proxies failed. Retry.',
      code:   isTimeout ? 'TIMEOUT' : 'ALL_FAILED',
      detail,
    });
  }
}
