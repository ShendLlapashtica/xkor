// Encar inspection / accident report
import { checkApiKey } from '../src/lib/rateLimit.js';
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

// Same pattern as api/car.js — the only proven-working fetch strategy
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

// Unwrap search/car/view/general (may return {SearchResults:[car]} or car directly)
function unwrapCar(d) {
  if (!d) throw new Error('null');
  const car = Array.isArray(d.SearchResults) && d.SearchResults.length > 0 ? d.SearchResults[0] : d;
  if (!car || typeof car !== 'object') throw new Error('no car');
  return car;
}

function normalizeCode(raw) {
  if (!raw || raw === 'X' || raw === 'N' || raw === '0' || raw === 'N/A') return null;
  const s = String(raw).trim();
  if (s === 'W' || s === '교환' || s.includes('교환')) return 'N';
  if (s === 'C' || s === '판금' || s.includes('판금')) return 'R';
  if (s === 'U' || s === '부식' || s.includes('부식')) return 'K';
  if (s === 'A' || s === '흠집' || s.includes('흠집')) return 'G';
  if (s === 'T' || s === '요철' || s.includes('요철')) return 'P';
  if (s === 'Y') return 'R';
  return null;
}

function parseCarCondition(raw) {
  if (!raw) return null;

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

function trMap(s, map) {
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
      type: trMap(h.WorkType || h.AccidentType || h.Type, WORK_MAP) || null,
      totalCost: h.WorkCost || h.TotalCost || h.RepairCost || h.Cost || null,
      insurance: h.InsuranceApplyYN === 'Y' || h.Insurance === 'Y',
      parts: rawParts.map(p => ({
        part: trMap(p.PartName || p.Name || p.Part || '', PART_MAP) || '—',
        work: trMap(p.WorkType || p.Work || p.Type || '', WORK_MAP) || '',
        cost: p.WorkCost || p.Cost || p.Price || null,
      })),
    };
  });
  return { list, historyAvailable };
}

// ── Internal inspection (engine, transmission, etc.) ─────────────────────────

const INSPECT_LABELS = {
  // Engine
  WorkingStatusAtIdle: 'Gjendja e funksionimit (në punë boshe)',
  IdleStatus: 'Gjendja e funksionimit (në punë boshe)',
  OilLeakAroundCylinderHeadCover: 'Rrjedhja e vajit rreth kapakut të kokës së motorit',
  HeadCoverOilLeak: 'Rrjedhja e vajit rreth kapakut të kokës',
  OilLeakAroundCylinderHead: 'Rrjedhja e vajit në kokën e motorit',
  HeadOilLeak: 'Rrjedhja e vajit në kokën e motorit',
  OilLeakAroundCylinderBlockOilPan: 'Rrjedhja e vajit rreth bllokut dhe karterit të vajit',
  BlockOilPanOilLeak: 'Rrjedhja e vajit rreth bllokut dhe karterit të vajit',
  OilCirculation: 'Qarkullimi i vajit',
  CoolantLeakAroundCylinderHeadGasket: 'Rrjedhja e ujit ftohës nga izoluesi i kokës së motorit',
  HeadGasketCoolantLeak: 'Rrjedhja e ujit ftohës nga izoluesi i kokës',
  CoolantLeakAroundWaterPump: 'Rrjedhja e ujit ftohës nga pompa e ujit',
  WaterPumpCoolantLeak: 'Rrjedhja e ujit ftohës nga pompa e ujit',
  CoolantLeakAroundRadiator: 'Rrjedhja e ujit ftohës nga radiatori',
  RadiatorCoolantLeak: 'Rrjedhja e ujit ftohës nga radiatori',
  CoolantQuantity: 'Sasia e ujit ftohës (antifreeze)',
  // Transmission
  TransmissionOilLeak: 'Rrjedhja e vajit nga transmisioni',
  OilLeak: 'Rrjedhja e vajit',
  TransmissionOilCirculation: 'Qarkullimi i vajit të transmisionit',
  Differential: 'Diferenciali',
  DriveShaftAndBearings: 'Boshti dhe kushinetat',
  DriveShaftBearings: 'Boshti dhe kushinetat',
  // Steering
  SteeringGearboxOilLeak: 'Rrjedhje e vajit nga koka e timonit',
  GearboxOilLeak: 'Rrjedhje e vajit nga koka e timonit',
  ElectricSteeringGear: 'Ingranazhet drejtuese dhe sistemi elektrik',
  ElectricSteering: 'Ingranazhet drejtuese dhe sistemi elektrik',
  SteeringJoint: 'Nyja e drejtimit',
  TieRodBallJoint: 'Koka e shufrës së drejtimit dhe nyja sferike',
  TieRodEndBallJoint: 'Koka e shufrës së drejtimit dhe nyja sferike',
  HighPressureHose: 'Tubi i presionit të lartë të drejtimit',
  // Brake
  MasterCylinderOilLeak: 'Rrjedhja e vajit nga cilindri kryesor',
  BrakePipeOilLeak: 'Rrjedhja e vajit nga tubat e frenimit',
  BrakeLineOilLeak: 'Rrjedhja e vajit nga tubat e frenimit',
  BrakeCondition: 'Gjendja e sistemit të frenimit',
  BrakingForce: 'Gjendja e sistemit të frenimit',
  // Electrical
  Alternator: 'Alternatori',
  StarterMotor: 'Startuesi i motorit',
  WiperMotor: 'Motori i fshësave të xhamave',
  BlowerMotor: 'Motori i ventilatorit të kabinës',
  InteriorFanMotor: 'Motori i ventilatorit të kabinës',
  RadiatorFanMotor: 'Motori i ventilatorit të radiatorit',
  PowerWindowMotor: 'Motori i xhamave elektrikë',
  WindowMotor: 'Motori i xhamave elektrikë',
  // Fuel
  FuelLeak: 'Rrjedhja e karburantit',
  FuelLeakage: 'Rrjedhja e karburantit',
};

function translateCondition(val) {
  if (val === undefined || val === null) return { status: 'Nuk ka', ok: true };
  const s = String(val).trim();
  if (s === 'X' || s === '정상' || s === '없음' || s === '0' || s === 'Normal') return { status: 'Në rregull', ok: true };
  if (s === 'Y' || s === '불량' || s === '있음' || s === '1') return { status: 'Defekt', ok: false };
  if (s.includes('누유없음') || s.includes('누수없음')) return { status: 'Nuk ka rrjedhje', ok: true };
  if (s.includes('누유있음')) return { status: 'Ka rrjedhje vaji', ok: false };
  if (s.includes('누수있음')) return { status: 'Ka rrjedhje uji', ok: false };
  if (s.includes('정상') || s.includes('없음')) return { status: 'Në rregull', ok: true };
  if (s.includes('있음') || s.includes('불량')) return { status: 'Defekt', ok: false };
  return { status: s, ok: true };
}

const GROUP_DEFS = [
  {
    aliases: ['Engine', 'engine', '원동기'],
    label: 'Motori',
    fields: [
      ['WorkingStatusAtIdle', 'IdleStatus'],
      ['OilLeakAroundCylinderHeadCover', 'HeadCoverOilLeak'],
      ['OilLeakAroundCylinderHead', 'HeadOilLeak'],
      ['OilLeakAroundCylinderBlockOilPan', 'BlockOilPanOilLeak'],
      ['OilCirculation'],
      ['CoolantLeakAroundCylinderHeadGasket', 'HeadGasketCoolantLeak'],
      ['CoolantLeakAroundWaterPump', 'WaterPumpCoolantLeak'],
      ['CoolantLeakAroundRadiator', 'RadiatorCoolantLeak'],
      ['CoolantQuantity'],
    ],
  },
  {
    aliases: ['Transmission', 'transmission', '변속기'],
    label: 'Transmisioni',
    fields: [
      ['TransmissionOilLeak', 'OilLeak'],
      ['WorkingStatusAtIdle', 'IdleStatus'],
      ['TransmissionOilCirculation', 'OilCirculation'],
      ['Differential'],
      ['DriveShaftAndBearings', 'DriveShaftBearings'],
    ],
  },
  {
    aliases: ['Steering', 'steering', '조향'],
    label: 'Drejtimi',
    fields: [
      ['SteeringGearboxOilLeak', 'GearboxOilLeak'],
      ['ElectricSteeringGear', 'ElectricSteering'],
      ['SteeringJoint'],
      ['TieRodBallJoint', 'TieRodEndBallJoint'],
      ['HighPressureHose'],
    ],
  },
  {
    aliases: ['Brake', 'brake', '제동', 'Brakes'],
    label: 'Frenimi',
    fields: [
      ['MasterCylinderOilLeak'],
      ['BrakePipeOilLeak', 'BrakeLineOilLeak'],
      ['BrakeCondition', 'BrakingForce'],
    ],
  },
  {
    aliases: ['Electrical', 'electrical', '전기', 'Electric'],
    label: 'Elektrika',
    fields: [
      ['Alternator'],
      ['StarterMotor'],
      ['WiperMotor'],
      ['BlowerMotor', 'InteriorFanMotor'],
      ['RadiatorFanMotor'],
      ['PowerWindowMotor', 'WindowMotor'],
    ],
  },
  {
    aliases: ['Fuel', 'fuel', '연료'],
    label: 'Karburanti',
    fields: [
      ['FuelLeak', 'FuelLeakage'],
    ],
  },
];

function extractInternalInspection(raw) {
  const sources = [
    raw?.InspectCondition,
    raw?.InspectionCondition,
    raw?.Inspection?.InspectCondition,
    raw?.CarCondition?.InspectCondition,
    raw?.PerfCheck,
    raw?.PerformanceCheck,
    raw?.InspectResults,
  ].filter(c => c && typeof c === 'object' && !Array.isArray(c));

  if (!sources.length) return [];

  const result = [];

  for (const def of GROUP_DEFS) {
    let groupObj = null;
    for (const src of sources) {
      for (const alias of def.aliases) {
        if (src[alias] && typeof src[alias] === 'object') {
          groupObj = src[alias];
          break;
        }
      }
      if (groupObj) break;
    }
    if (!groupObj) continue;

    let items = [];

    if (Array.isArray(groupObj)) {
      items = groupObj.map(item => {
        const rawName = item.ItemName || item.Name || '';
        const rawVal  = item.ItemStatus || item.Status || item.Value || 'X';
        return { name: INSPECT_LABELS[rawName] || rawName, ...translateCondition(rawVal) };
      }).filter(i => i.name);
    } else {
      for (const fieldAliases of def.fields) {
        let val;
        for (const f of fieldAliases) {
          if (groupObj[f] !== undefined) { val = groupObj[f]; break; }
        }
        if (val === undefined) continue;
        const labelKey = fieldAliases.find(f => INSPECT_LABELS[f]);
        items.push({ name: INSPECT_LABELS[labelKey] || fieldAliases[0], ...translateCondition(val) });
      }
    }

    if (items.length) result.push({ group: def.label, items });
  }

  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!await checkApiKey(req, res)) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'missing id' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);

  const viewUrl = `https://api.encar.com/search/car/view/general?carid=${id}`;
  const perfUrl = `https://api.encar.com/inspection/car/perform/${id}`;
  const inspUrl = `https://api.encar.com/inspection/view/general?carid=${id}`;
  const listUrl = `https://api.encar.com/search/car/list/general?${new URLSearchParams({
    count: 'true', q: `(And.Hidden.N._.Carid.${id}.)`, sr: `|ModifiedDate|0|1`, inav: '|Metadata|Sort',
  })}`;

  const ev = encodeURIComponent(viewUrl);
  const ep = encodeURIComponent(perfUrl);
  const ei = encodeURIComponent(inspUrl);
  const el = encodeURIComponent(listUrl);

  // Accept any object from perform/inspection endpoints (may or may not have SearchResults wrapper)
  function unwrapAny(d) {
    if (!d || typeof d !== 'object') throw new Error('null');
    if (Array.isArray(d.SearchResults) && d.SearchResults.length > 0) return d.SearchResults[0];
    return d;
  }
  const unwrapList = d => { const c = d?.SearchResults?.[0]; if (!c) throw new Error('not found'); return c; };

  // Parallel independent fetches:
  // Chain A → car data from view/list (has OwnerCount, AccidentCount, panel damage)
  // Chain B → inspection data from perform/inspection (has CarHistryList, InspectCondition)
  const [carRes, perfRes] = await Promise.allSettled([
    Promise.any([
      tryFetch(viewUrl,                                             ctrl.signal        ).then(unwrapCar),
      tryFetch(`https://api.allorigins.win/get?url=${ev}`,         ctrl.signal, true  ).then(unwrapCar),
      tryFetch(`https://corsproxy.io/?${ev}`,                      ctrl.signal        ).then(unwrapCar),
      tryFetch(`https://thingproxy.freeboard.io/fetch/${viewUrl}`, ctrl.signal        ).then(unwrapCar),
      tryFetch(listUrl,                                             ctrl.signal        ).then(unwrapList),
      tryFetch(`https://api.allorigins.win/get?url=${el}`,         ctrl.signal, true  ).then(unwrapList),
      tryFetch(`https://corsproxy.io/?${el}`,                      ctrl.signal        ).then(unwrapList),
    ]),
    Promise.any([
      tryFetch(perfUrl,                                             ctrl.signal        ).then(unwrapAny),
      tryFetch(`https://api.allorigins.win/get?url=${ep}`,         ctrl.signal, true  ).then(unwrapAny),
      tryFetch(`https://corsproxy.io/?${ep}`,                      ctrl.signal        ).then(unwrapAny),
      tryFetch(`https://thingproxy.freeboard.io/fetch/${perfUrl}`, ctrl.signal        ).then(unwrapAny),
      tryFetch(inspUrl,                                             ctrl.signal        ).then(unwrapAny),
      tryFetch(`https://api.allorigins.win/get?url=${ei}`,         ctrl.signal, true  ).then(unwrapAny),
      tryFetch(`https://corsproxy.io/?${ei}`,                      ctrl.signal        ).then(unwrapAny),
    ]),
  ]);

  clearTimeout(timer);

  const carRaw  = carRes.status  === 'fulfilled' ? carRes.value  : null;
  const perfRaw = perfRes.status === 'fulfilled' ? perfRes.value : null;

  if (!carRaw && !perfRaw) {
    return res.status(200).json({
      damage: null, repairHistory: [], historyAvailable: false,
      inspectionDate: null, ownerCount: null, accidentCount: null,
      internalInspection: [], usageHistory: null, ownerHistory: [], apiError: true,
    });
  }

  // Merge: carRaw is base (OwnerCount, panel damage, basic fields).
  // perfRaw fills in inspection-specific fields only where carRaw has nothing.
  const raw = { ...(carRaw || {}) };
  if (perfRaw) {
    for (const [k, v] of Object.entries(perfRaw)) {
      if (v == null) continue;
      const cur = raw[k];
      if (cur == null || (Array.isArray(cur) && cur.length === 0)) raw[k] = v;
    }
  }

  const conditionData = raw.Inspection || raw.CarCondition || raw.Condition || raw;
  const parsed = parseCarCondition(conditionData);
  const { list: repairHistory, historyAvailable } = extractRepairHistory(raw);
  const internalInspection = extractInternalInspection(raw);

  const ownerCount    = raw.OwnerCount    ?? raw.OwnerChanges ?? raw.OwnerHistory?.length ?? null;
  const accidentCount = raw.AccidentCount ?? raw.AccidentHistoryCount ?? null;
  const inspectionDate = fmtDate(raw.InspectionDate || raw.PerfDate || raw.InspectDate || null);

  const src = raw?.CarUsageHistory || raw?.UsageHistory || raw?.CarCondition?.Usage || {};
  const usageHistory = {
    isRental:     src.TaxiUsedYn === 'Y' || src.RentalUsedYn === 'Y' ||
                  raw?.IsRentalCar === true || raw?.RentalCar === 'Y' ||
                  raw?.CarCondition?.TaxiUsedYn === 'Y' || raw?.CarCondition?.RentalUsedYn === 'Y',
    isCommercial: src.CommercialUsedYn === 'Y' ||
                  raw?.IsCommercialCar === true || raw?.CommercialCar === 'Y' ||
                  raw?.CarCondition?.CommercialUsedYn === 'Y',
  };

  const ownerHistoryCandidates = [
    raw?.OwnerHistory, raw?.CarHistory?.OwnerHistory,
    raw?.CarCondition?.OwnerHistory, raw?.OwnerChanges, raw?.OwnerChangeHistory,
  ].filter(a => Array.isArray(a) && a.length > 0);
  const ownerHistory = ownerHistoryCandidates.length === 0 ? [] :
    ownerHistoryCandidates[0].map(o => ({
      date: fmtDate(o.Date || o.ChangeDate || o.TransferDate || o.OwnerChangeDate || ''),
      event: 'Nderrim pronari',
    })).filter(o => o.date);

  return res.status(200).json({
    damage: parsed, repairHistory, historyAvailable, inspectionDate,
    ownerCount, accidentCount, internalInspection, usageHistory, ownerHistory,
    apiError: false,
  });
}
