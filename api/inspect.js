// Encar inspection / accident report
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
  'Cache-Control': 'no-cache',
};

async function safeFetch(url, signal, headers = BROWSER_HEADERS) {
  try {
    const r = await fetch(url, { signal, headers });
    if (!r.ok) return null;
    const text = await r.text();
    if (!text || text.trim()[0] !== '{') return null;
    return JSON.parse(text);
  } catch { return null; }
}

async function proxyFetch(url, signal) {
  const enc = encodeURIComponent(url);
  const proxies = [
    { url: `https://api.allorigins.win/get?url=${enc}`, extract: d => { const o = JSON.parse(d); return o.contents ? JSON.parse(o.contents) : null; } },
    { url: `https://corsproxy.io/?url=${enc}`, extract: d => JSON.parse(d) },
    { url: `https://api.codetabs.com/v1/proxy?quest=${enc}`, extract: d => JSON.parse(d) },
  ];
  for (const p of proxies) {
    try {
      const r = await fetch(p.url, { signal });
      if (!r.ok) continue;
      const text = await r.text();
      const result = p.extract(text);
      if (result && typeof result === 'object') return result;
    } catch { /* try next */ }
  }
  return null;
}

function normalizeCode(raw) {
  if (!raw || raw === 'X' || raw === 'N' || raw === '0' || raw === 'N/A') return null;
  const s = String(raw).trim();
  if (s === 'W' || s === '교환' || s.includes('교환')) return 'N';
  if (s === 'C' || s === '판금' || s.includes('판금')) return 'R';
  if (s === 'U' || s === '부식' || s.includes('부식')) return 'K';
  if (s === 'A' || s === '흠집' || s.includes('흠집')) return 'G';
  if (s === 'T' || s === '요철' || s.includes('요철')) return 'P';
  if (s === 'Y') return 'R'; // generic yes = repaired
  return null;
}

function parseCarCondition(raw) {
  if (!raw) return null;

  // Try multiple paths to find the exterior condition object
  const candidates = [
    raw?.Exterior,
    raw?.CarCondition?.Exterior,
    raw?.Inspection?.Exterior,
    raw?.CarCondition,
    raw?.Condition,
    raw,
  ].filter(c => c && typeof c === 'object');

  if (!candidates.length) return null;

  const PANEL_KEYS = {
    frontBumper:      ['FrontBumper', '앞범퍼', 'frontBumper'],
    hood:             ['Hood', '보닛', 'hood'],
    frontLeftFender:  ['FrontLeftFender', '앞왼쪽휀더', 'frontLeftFender'],
    frontRightFender: ['FrontRightFender', '앞오른쪽휀더', 'frontRightFender'],
    frontLeftDoor:    ['FrontLeftDoor', '앞왼쪽도어', 'frontLeftDoor'],
    frontRightDoor:   ['FrontRightDoor', '앞오른쪽도어', 'frontRightDoor'],
    rearLeftDoor:     ['RearLeftDoor', '뒤왼쪽도어', 'rearLeftDoor'],
    rearRightDoor:    ['RearRightDoor', '뒤오른쪽도어', 'rearRightDoor'],
    rearLeftPanel:    ['RearLeftFender', 'RearLeftPanel', '뒤왼쪽휀더', 'rearLeftPanel'],
    rearRightPanel:   ['RearRightFender', 'RearRightPanel', '뒤오른쪽휀더', 'rearRightPanel'],
    trunk:            ['Trunk', '트렁크', 'trunk'],
    rearBumper:       ['RearBumper', '뒤범퍼', 'rearBumper'],
    roof:             ['Roof', '루프', 'roof'],
  };

  const result = {};
  let hasAnyKey = false;

  for (const [panelKey, aliases] of Object.entries(PANEL_KEYS)) {
    let found = null;
    for (const ext of candidates) {
      for (const alias of aliases) {
        if (ext[alias] !== undefined) { found = ext[alias]; break; }
      }
      if (found !== undefined && found !== null) break;
    }

    if (found !== undefined && found !== null) {
      hasAnyKey = true;
      if (typeof found === 'string') {
        result[panelKey] = normalizeCode(found);
      } else if (typeof found === 'object') {
        const code =
          (found.ExchangeYN === 'Y' || found.Exchange === 'Y') ? 'N' :
          (found.PlatingYN === 'Y'  || found.Plating === 'Y')  ? 'R' :
          (found.CorrosionYN === 'Y')  ? 'K' :
          (found.ScarchYN === 'Y')     ? 'G' :
          (found.UnevenYN === 'Y')     ? 'P' :
          null;
        result[panelKey] = code;
      } else {
        result[panelKey] = null;
      }
    } else {
      result[panelKey] = null;
    }
  }

  return hasAnyKey ? result : null;
}

const PART_MAP = {
  '앞범퍼': 'Bufera Përpara', '뒤범퍼': 'Bufera Mbrapa',
  '보닛': 'Kapuç', '트렁크': 'Bagazh', '루프': 'Çati',
  '앞왼쪽휀더': 'Parafango Para Majtë', '앞오른쪽휀더': 'Parafango Para Djathas',
  '앞왼쪽도어': 'Portë Para Majtë', '앞오른쪽도어': 'Portë Para Djathas',
  '뒤왼쪽도어': 'Portë Mbrapa Majtë', '뒤오른쪽도어': 'Portë Mbrapa Djathas',
  '뒤왼쪽휀더': 'Panel Mbrapa Majtë', '뒤오른쪽휀더': 'Panel Mbrapa Djathas',
};
const WORK_MAP = {
  '판금': 'Ripare kallaji', '도장': 'Rilyerje', '교환': 'Zëvendësim',
  '부식': 'Korrozion', '흠집': 'Gërvishtje', '수리': 'Riparim', '복원': 'Rivendosje',
};

function tr(s, map) {
  if (!s) return s;
  for (const [kr, alb] of Object.entries(map)) {
    if (String(s).includes(kr)) return alb;
  }
  return s;
}

function fmtDate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6,8)}.${s.slice(4,6)}.${s.slice(0,4)}`;
  if (s.length === 6) return `${s.slice(4,6)}.${s.slice(0,4)}`;
  return String(raw);
}

function extractRepairHistory(raw) {
  const candidates = [
    raw?.CarHistryList,
    raw?.CarHistoryList,
    raw?.InspectCondition?.CarHistryList,
    raw?.Inspection?.CarHistryList,
    raw?.CarCondition?.CarHistryList,
    raw?.AccidentHistoryList,
    raw?.HistoryList,
    raw?.RepairList,
    raw?.AccidentList,
  ].filter(a => Array.isArray(a) && a.length > 0);

  const historyAvailable = candidates.length > 0;
  const list = !historyAvailable ? [] : candidates[0].map(h => {
    const rawParts = Array.isArray(h.PerfParts || h.Parts || h.PartList) ? (h.PerfParts || h.Parts || h.PartList) : [];
    return {
      date: fmtDate(h.PerfDateTime || h.DateTime || h.InsuranceDate || h.Date),
      type: tr(h.WorkType || h.AccidentType || h.Type, WORK_MAP) || null,
      totalCost: h.WorkCost || h.TotalCost || h.RepairCost || h.Cost || null,
      insurance: h.InsuranceApplyYN === 'Y' || h.Insurance === 'Y',
      parts: rawParts.map(p => ({
        part: tr(p.PartName || p.Name || p.Part || '', PART_MAP) || '—',
        work: tr(p.WorkType || p.Work || p.Type || '', WORK_MAP) || '',
        cost: p.WorkCost || p.Cost || p.Price || null,
      })),
    };
  });
  return { list, historyAvailable };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'missing id' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 13000);

  // Direct endpoints to try
  const directUrls = [
    `https://api.encar.com/inspection/view/general?carid=${id}`,
    `https://api.encar.com/inspection/car/${id}`,
    `https://api.encar.com/inspection/car/perform/${id}`,
    `https://api.encar.com/search/car/view/general?carid=${id}`,
    `https://api.encar.com/v1/readside/car/${id}`,
  ];

  let raw = null;

  // 1. Try all direct URLs first (fast, parallel)
  const directResults = await Promise.allSettled(
    directUrls.map(url => safeFetch(url, ctrl.signal))
  );
  for (const r of directResults) {
    if (r.status === 'fulfilled' && r.value) { raw = r.value; break; }
  }

  // 2. If direct failed, try proxy for each URL (sequential to avoid hammering)
  if (!raw) {
    for (const url of directUrls.slice(0, 3)) {
      raw = await proxyFetch(url, ctrl.signal);
      if (raw) break;
    }
  }

  clearTimeout(timer);

  // Always return 200 — never leave the frontend with a hard error
  if (!raw) {
    return res.status(200).json({
      damage: null,
      repairHistory: [],
      historyAvailable: false,
      inspectionDate: null,
      ownerCount: null,
      accidentCount: null,
      apiError: true,
    });
  }

  const conditionData = raw.Inspection || raw.CarCondition || raw.Condition || raw;
  const parsed = parseCarCondition(conditionData);
  const { list: repairHistory, historyAvailable } = extractRepairHistory(raw);

  const ownerCount    = raw.OwnerCount    ?? raw.OwnerChanges ?? raw.OwnerHistory?.length ?? null;
  const accidentCount = raw.AccidentCount ?? raw.AccidentHistoryCount ?? null;
  const inspectionDate = fmtDate(raw.InspectionDate || raw.PerfDate || raw.InspectDate || null);
  const rawKeys = Object.keys(raw);

  return res.status(200).json({
    raw,
    damage: parsed,
    repairHistory,
    historyAvailable,
    inspectionDate,
    ownerCount,
    accidentCount,
    rawKeys,
  });
}
