import { DAMAGE_CODES } from '../lib/translations.js';

// Car area definitions — positioned within the car body SVG (viewBox 0 0 200 380)
const AREAS = [
  { key: 'frontBumper',      label: 'Bufera Përpara',          x: 62,  y: 6,   w: 76,  h: 20, rx: 3 },
  { key: 'hood',             label: 'Kapuç',                   x: 38,  y: 26,  w: 124, h: 66, rx: 4 },
  { key: 'frontLeftFender',  label: 'Parafango Para Majtë',    x: 12,  y: 30,  w: 30,  h: 62, rx: 4 },
  { key: 'frontRightFender', label: 'Parafango Para Djathas',  x: 158, y: 30,  w: 30,  h: 62, rx: 4 },
  { key: 'frontLeftDoor',    label: 'Portë Para Majtë',        x: 12,  y: 96,  w: 30,  h: 75, rx: 4 },
  { key: 'frontRightDoor',   label: 'Portë Para Djathas',      x: 158, y: 96,  w: 30,  h: 75, rx: 4 },
  { key: 'roof',             label: 'Çati',                    x: 44,  y: 108, w: 112, h: 116, rx: 4 },
  { key: 'rearLeftDoor',     label: 'Portë Mbrapa Majtë',      x: 12,  y: 175, w: 30,  h: 75, rx: 4 },
  { key: 'rearRightDoor',    label: 'Portë Mbrapa Djathas',    x: 158, y: 175, w: 30,  h: 75, rx: 4 },
  { key: 'rearLeftPanel',    label: 'Panel Mbrapa Majtë',      x: 14,  y: 254, w: 28,  h: 66, rx: 4 },
  { key: 'rearRightPanel',   label: 'Panel Mbrapa Djathas',    x: 158, y: 254, w: 28,  h: 66, rx: 4 },
  { key: 'trunk',            label: 'Bagazh',                  x: 38,  y: 252, w: 124, h: 68, rx: 4 },
  { key: 'rearBumper',       label: 'Bufera Mbrapa',           x: 62,  y: 322, w: 76,  h: 20, rx: 3 },
];

function areaStyle(code) {
  if (!code) return { fill: 'rgba(255,255,255,0.025)', stroke: 'rgba(255,255,255,0.07)', sw: 0.8 };
  const c = DAMAGE_CODES[code];
  return c
    ? { fill: c.color + '28', stroke: c.color, sw: 1.5 }
    : { fill: 'rgba(255,255,255,0.025)', stroke: 'rgba(255,255,255,0.07)', sw: 0.8 };
}

export default function AccidentDiagram({ damage }) {
  const damaged = AREAS.filter(a => damage?.[a.key]);
  const clean   = !damaged.length;

  return (
    <div>
      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 pb-4 border-b border-white/5">
        {[['N','Nderrim'],['R','Riparim'],['K','Korrozion'],['G','Gervishtje'],['P','Parregullsi']].map(([code, label]) => (
          <div key={code} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-mono w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
              style={{ background: DAMAGE_CODES[code]?.color + '22', border: `1.5px solid ${DAMAGE_CODES[code]?.color}`, color: DAMAGE_CODES[code]?.color }}>
              {code}
            </span>
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">

        {/* ── Car SVG ── */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 text-center font-mono">JASHTË</p>
          <svg viewBox="0 0 200 350" className="w-40 sm:w-48" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,50,0.8))' }}>

            {/* ── Car body shape ── */}
            <path
              d="M 68,8 L 132,8 C 148,8 160,20 164,38 L 172,82 L 175,168 L 172,258 C 168,290 156,320 140,328 L 60,328 C 44,320 32,290 28,258 L 25,168 L 28,82 C 36,38 52,8 68,8 Z"
              fill="rgba(8,8,20,0.9)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"
            />

            {/* ── Wheels ── */}
            <rect x="5" y="78" width="16" height="46" rx="5" fill="#0d0d1e" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            <rect x="179" y="78" width="16" height="46" rx="5" fill="#0d0d1e" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            <rect x="5" y="218" width="16" height="46" rx="5" fill="#0d0d1e" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            <rect x="179" y="218" width="16" height="46" rx="5" fill="#0d0d1e" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            {/* Wheel rims */}
            <rect x="8" y="83" width="10" height="36" rx="3" fill="rgba(255,255,255,0.05)" />
            <rect x="182" y="83" width="10" height="36" rx="3" fill="rgba(255,255,255,0.05)" />
            <rect x="8" y="223" width="10" height="36" rx="3" fill="rgba(255,255,255,0.05)" />
            <rect x="182" y="223" width="10" height="36" rx="3" fill="rgba(255,255,255,0.05)" />

            {/* ── Side mirrors ── */}
            <rect x="0" y="86" width="14" height="9" rx="3" fill="#0d0d1e" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <rect x="186" y="86" width="14" height="9" rx="3" fill="#0d0d1e" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* ── Hood line ── */}
            <line x1="100" y1="10" x2="100" y2="88" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

            {/* ── Front windshield (glass) ── */}
            <path d="M 48,94 L 152,94 L 148,112 L 52,112 Z"
              fill="rgba(147,197,253,0.09)" stroke="rgba(147,197,253,0.18)" strokeWidth="0.8" />

            {/* ── Rear windshield (glass) ── */}
            <path d="M 52,228 L 148,228 L 152,246 L 48,246 Z"
              fill="rgba(147,197,253,0.06)" stroke="rgba(147,197,253,0.14)" strokeWidth="0.8" />

            {/* ── Roof area ── */}
            <rect x="46" y="112" width="108" height="116" rx="4"
              fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />

            {/* ── Door separation line ── */}
            <line x1="22" y1="170" x2="178" y2="170" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />

            {/* ── Trunk line ── */}
            <line x1="100" y1="252" x2="100" y2="328" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

            {/* ── Damage areas (rendered on top) ── */}
            {AREAS.map(area => {
              const code = damage?.[area.key];
              const s = areaStyle(code);
              return (
                <g key={area.key}>
                  <rect x={area.x} y={area.y} width={area.w} height={area.h} rx={area.rx}
                    fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
                  {code && (
                    <text x={area.x + area.w / 2} y={area.y + area.h / 2 + 4}
                      textAnchor="middle" fontSize={9} fontWeight="700"
                      fill={s.stroke} fontFamily="JetBrains Mono, monospace">
                      {code}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Damage info ── */}
        <div className="flex-1 min-w-0 w-full">
          {clean ? (
            <div className="flex items-center gap-2 py-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-sm text-green-400 font-semibold">Nuk janë raportuar dëmtime</span>
            </div>
          ) : (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-mono font-semibold">
                Zona me Dëmtime
              </p>
              <div className="space-y-1">
                {damaged.map(area => {
                  const code = damage[area.key];
                  const info = DAMAGE_CODES[code];
                  return (
                    <div key={area.key} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                      style={{ background: info?.color + '12' }}>
                      <span className="text-sm text-gray-300">{area.label}</span>
                      {info && (
                        <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: info.color + '22', color: info.color, border: `1px solid ${info.color}44` }}>
                          {code} · {info.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full area checklist */}
          <p className="text-[10px] uppercase tracking-widest text-gray-700 mb-2 font-mono font-semibold">
            Të Gjitha Zonat
          </p>
          <div className="space-y-0">
            {AREAS.map(area => {
              const code = damage?.[area.key];
              const info = code ? DAMAGE_CODES[code] : null;
              return (
                <div key={area.key}
                  className="flex items-center justify-between py-1 text-xs border-b border-white/[0.03]">
                  <span className={code ? 'text-gray-200' : 'text-gray-700'}>{area.label}</span>
                  {info
                    ? <span className="font-mono font-semibold" style={{ color: info.color }}>{code} · {info.label}</span>
                    : <span className="text-gray-800 font-mono">—</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
