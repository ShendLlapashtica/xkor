// Encar inspection / accident report
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

async function tryFetch(url, signal, isWrapped = false) {
  const r = await fetch(url, { signal, headers: isWrapped ? {} : BROWSER_HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const text = await r.text();
  if (isWrapped) {
    const outer = JSON.parse(text);
    if (!outer.contents) throw new Error('no contents');
    return JSON.parse(outer.contents);
  }
  return JSON.parse(text);
}

function normalizeCode(raw) {
  if (!raw || raw === 'X' || raw === 'N' || raw === '0') return null;
  if (raw === 'W' || raw === '교환') return 'N';
  if (raw === 'C' || raw === '판금') return 'R';
  if (raw === 'U' || raw === '부식') return 'K';
  if (raw === 'A' || raw === '흠집') return 'G';
  if (raw === 'T' || raw === '요철') return 'P';
  return raw;
}

function parseCarCondition(raw) {
  if (!raw) return null;
  const ext = raw.Exterior || raw.CarCondition || raw.Condition || raw;
  if (!ext || typeof ext !== 'object') return null;

  const areas = {
    frontBumper:      ext.FrontBumper      || ext['앞범퍼'],
    hood:             ext.Hood             || ext['보닛'],
    frontLeftFender:  ext.FrontLeftFender  || ext['앞왼쪽휀더'],
    frontRightFender: ext.FrontRightFender || ext['앞오른쪽휀더'],
    frontLeftDoor:    ext.FrontLeftDoor    || ext['앞왼쪽도어'],
    frontRightDoor:   ext.FrontRightDoor   || ext['앞오른쪽도어'],
    rearLeftDoor:     ext.RearLeftDoor     || ext['뒤왼쪽도어'],
    rearRightDoor:    ext.RearRightDoor    || ext['뒤오른쪽도어'],
    rearLeftPanel:    ext.RearLeftFender   || ext.RearLeftPanel  || ext['뒤왼쪽휀더'],
    rearRightPanel:   ext.RearRightFender  || ext.RearRightPanel || ext['뒤오른쪽휀더'],
    trunk:            ext.Trunk            || ext['트렁크'],
    rearBumper:       ext.RearBumper       || ext['뒤범퍼'],
    roof:             ext.Roof             || ext['루프'],
  };

  const result = {};
  for (const [key, val] of Object.entries(areas)) {
    if (typeof val === 'string') {
      result[key] = normalizeCode(val);
    } else if (val && typeof val === 'object') {
      const code =
        (val.ExchangeYN === 'Y' || val.Exchange === 'Y') ? 'N' :
        (val.PlatingYN === 'Y'  || val.Plating === 'Y')  ? 'R' :
        (val.CorrosionYN === 'Y')  ? 'K' :
        (val.ScarchYN === 'Y')     ? 'G' :
        (val.UnevenYN === 'Y')     ? 'P' :
        null;
      result[key] = code;
    } else {
      result[key] = null;
    }
  }
  return result;
}

// Map Korean part names to Albanian
const PART_MAP = {
  '앞범퍼': 'Bufera Përpara', '뒤범퍼': 'Bufera Mbrapa',
  '보닛': 'Kapuç', '트렁크': 'Bagazh', '루프': 'Çati',
  '앞왼쪽휀더': 'Parafango Para Majtë', '앞오른쪽휀더': 'Parafango Para Djathas',
  '앞왼쪽도어': 'Portë Para Majtë', '앞오른쪽도어': 'Portë Para Djathas',
  '뒤왼쪽도어': 'Portë Mbrapa Majtë', '뒤오른쪽도어': 'Portë Mbrapa Djathas',
  '뒤왼쪽휀더': 'Panel Mbrapa Majtë', '뒤오른쪽휀더': 'Panel Mbrapa Djathas',
  '전면': 'Pjesa Përpara', '후면': 'Pjesa Mbrapa', '좌측': 'Ana Majtë', '우측': 'Ana Djathas',
};

const WORK_MAP = {
  '판금': 'Ripare kallaji', '도장': 'Rilyerje', '교환': 'Zëvendësim',
  '부식': 'Korrozion', '흠집': 'Gërvishtje', '수리': 'Riparim', '복원': 'Rivendosje',
};

function translatePart(s) {
  if (!s) return s;
  for (const [kr, alb] of Object.entries(PART_MAP)) {
    if (s.includes(kr)) return alb;
  }
  return s;
}

function translateWork(s) {
  if (!s) return s;
  for (const [kr, alb] of Object.entries(WORK_MAP)) {
    if (s.includes(kr)) return alb;
  }
  return s;
}

function formatKoreanDate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6,8)}.${s.slice(4,6)}.${s.slice(0,4)}`;
  if (s.length === 6) return `${s.slice(4,6)}.${s.slice(0,4)}`;
  return raw;
}

function extractRepairHistory(raw) {
  const candidates = [
    raw?.CarHistryList,
    raw?.CarHistoryList,
    raw?.InspectCondition?.CarHistryList,
    raw?.Inspection?.CarHistryList,
    raw?.AccidentHistoryList,
    raw?.HistoryList,
    raw?.RepairList,
    raw?.AccidentList,
  ].filter(a => Array.isArray(a) && a.length > 0);

  const historyAvailable = candidates.length > 0;

  const list = historyAvailable ? candidates[0].map(h => {
    const rawParts = h.PerfParts || h.Parts || h.PartList || [];
    const parts = Array.isArray(rawParts)
      ? rawParts.map(p => ({
          part: translatePart(p.PartName || p.Name || p.Part || ''),
          work: translateWork(p.WorkType || p.Work || p.Type || ''),
          cost: p.WorkCost || p.Cost || p.Price || null,
        }))
      : [];

    return {
      date: formatKoreanDate(h.PerfDateTime || h.DateTime || h.InsuranceDate || h.Date),
      type: h.WorkType || h.AccidentType || h.Type || null,
      totalCost: h.WorkCost || h.TotalCost || h.RepairCost || h.Cost || null,
      insurance: h.InsuranceApplyYN === 'Y' || h.Insurance === 'Y',
      parts,
    };
  }) : [];

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
  const timer = setTimeout(() => ctrl.abort(), 9000);

  const urls = [
    `https://api.encar.com/inspection/view/general?carid=${id}`,
    `https://api.encar.com/inspection/car/${id}`,
    `https://api.encar.com/inspection/car/perform/${id}`,
    `https://api.encar.com/search/car/view/general?carid=${id}`,
  ];

  try {
    const raw = await Promise.any(
      urls.flatMap(url => {
        const enc = encodeURIComponent(url);
        return [
          tryFetch(url, ctrl.signal),
          tryFetch(`https://api.allorigins.win/get?url=${enc}`, ctrl.signal, true),
        ];
      })
    );

    clearTimeout(timer);

    const conditionData = raw.Inspection || raw.CarCondition || raw.Condition || raw;
    const parsed = parseCarCondition(conditionData);
    const { list: repairHistory, historyAvailable } = extractRepairHistory(raw);

    const ownerCount    = raw.OwnerCount    ?? raw.OwnerChanges ?? raw.OwnerHistory?.length ?? null;
    const accidentCount = raw.AccidentCount ?? raw.AccidentHistoryCount ?? null;
    const inspectionDate = formatKoreanDate(
      raw.InspectionDate || raw.PerfDate || raw.InspectDate || null
    );
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
  } catch (err) {
    clearTimeout(timer);
    return res.status(404).json({ error: 'Inspection data not available', detail: err.message });
  }
}
