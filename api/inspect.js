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

// Maps Encar inspection condition codes to our standard codes
function normalizeCode(raw) {
  if (!raw || raw === 'X' || raw === 'N' || raw === '0') return null;
  if (raw === 'W' || raw === '교환') return 'N'; // Change/Replace
  if (raw === 'C' || raw === '판금') return 'R'; // Repair
  if (raw === 'U' || raw === '부식') return 'K'; // Corrosion
  if (raw === 'A' || raw === '흠집') return 'G'; // Scratch
  if (raw === 'T' || raw === '요철') return 'P'; // Uneven
  return raw; // pass through if already mapped
}

function parseCarCondition(raw) {
  if (!raw) return null;
  // raw.CarBody, raw.Exterior, raw.CarCondition, raw.Condition — try all shapes
  const ext = raw.Exterior || raw.CarCondition || raw.Condition || raw;
  if (!ext || typeof ext !== 'object') return null;

  const areas = {
    frontBumper:    ext.FrontBumper || ext.앞범퍼,
    hood:           ext.Hood || ext.보닛,
    frontLeftFender: ext.FrontLeftFender || ext.앞왼쪽휀더,
    frontRightFender: ext.FrontRightFender || ext.앞오른쪽휀더,
    frontLeftDoor:  ext.FrontLeftDoor || ext.앞왼쪽도어,
    frontRightDoor: ext.FrontRightDoor || ext.앞오른쪽도어,
    rearLeftDoor:   ext.RearLeftDoor || ext.뒤왼쪽도어,
    rearRightDoor:  ext.RearRightDoor || ext.뒤오른쪽도어,
    rearLeftPanel:  ext.RearLeftFender || ext.RearLeftPanel || ext.뒤왼쪽휀더,
    rearRightPanel: ext.RearRightFender || ext.RearRightPanel || ext.뒤오른쪽휀더,
    trunk:          ext.Trunk || ext.트렁크,
    rearBumper:     ext.RearBumper || ext.뒤범퍼,
    roof:           ext.Roof || ext.루프,
  };

  const result = {};
  for (const [key, val] of Object.entries(areas)) {
    // val might be a string code or an object with ExchangeYN, PlatingYN, etc.
    if (typeof val === 'string') {
      result[key] = normalizeCode(val);
    } else if (val && typeof val === 'object') {
      // pick worst damage
      const code =
        (val.ExchangeYN === 'Y' || val.Exchange === 'Y') ? 'N' :
        (val.PlatingYN === 'Y' || val.Plating === 'Y')   ? 'R' :
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

    // Try to find inspection data
    const conditionData = raw.Inspection || raw.CarCondition || raw.Condition || raw;
    const parsed = parseCarCondition(conditionData);

    const ownerCount = raw.OwnerCount ?? raw.OwnerChanges ?? raw.OwnerHistory?.length ?? null;
    const accidentCount = raw.AccidentCount ?? raw.AccidentHistoryCount ?? null;

    return res.status(200).json({
      raw,
      damage: parsed,
      ownerCount,
      accidentCount,
    });
  } catch (err) {
    clearTimeout(timer);
    return res.status(404).json({ error: 'Inspection data not available', detail: err.message });
  }
}
