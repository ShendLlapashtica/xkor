import { DAMAGE_CODES } from '../lib/translations.js';

// Encar-style car body areas — exterior top-down view
const EXT_AREAS = [
  { key: 'frontBumper',      label: 'Bufera Përpara',         x: 58,  y: 8,   w: 104, h: 20 },
  { key: 'hood',             label: 'Kapuç',                  x: 44,  y: 30,  w: 132, h: 70 },
  { key: 'frontLeftFender',  label: 'Parafango Para Majtë',   x: 6,   y: 36,  w: 36,  h: 54 },
  { key: 'frontRightFender', label: 'Parafango Para Djathas', x: 178, y: 36,  w: 36,  h: 54 },
  { key: 'frontLeftDoor',    label: 'Portë Para Majtë',       x: 6,   y: 94,  w: 36,  h: 60 },
  { key: 'frontRightDoor',   label: 'Portë Para Djathas',     x: 178, y: 94,  w: 36,  h: 60 },
  { key: 'roof',             label: 'Çati',                   x: 44,  y: 100, w: 132, h: 90 },
  { key: 'rearLeftDoor',     label: 'Portë Mbrapa Majtë',     x: 6,   y: 158, w: 36,  h: 60 },
  { key: 'rearRightDoor',    label: 'Portë Mbrapa Djathas',   x: 178, y: 158, w: 36,  h: 60 },
  { key: 'rearLeftPanel',    label: 'Panel Mbrapa Majtë',     x: 6,   y: 222, w: 36,  h: 66 },
  { key: 'rearRightPanel',   label: 'Panel Mbrapa Djathas',   x: 178, y: 222, w: 36,  h: 66 },
  { key: 'trunk',            label: 'Bagazh',                 x: 44,  y: 192, w: 132, h: 70 },
  { key: 'rearBumper',       label: 'Bufera Mbrapa',          x: 58,  y: 264, w: 104, h: 20 },
];

function AreaRect({ area, code }) {
  const info = code ? DAMAGE_CODES[code] : null;
  const fill   = info ? info.color + '2a' : 'rgba(255,255,255,0.025)';
  const stroke = info ? info.color        : 'rgba(255,255,255,0.06)';
  const sw     = info ? 1.5 : 0.8;

  return (
    <g>
      <rect
        x={area.x} y={area.y} width={area.w} height={area.h}
        rx={3} fill={fill} stroke={stroke} strokeWidth={sw}
      />
      {code && (
        <text
          x={area.x + area.w / 2} y={area.y + area.h / 2 + 4}
          textAnchor="middle" fontSize={9} fontWeight="700"
          fill={stroke} style={{ userSelect: 'none' }}
        >
          {code}
        </text>
      )}
    </g>
  );
}

export default function AccidentDiagram({ damage }) {
  const damaged = EXT_AREAS.filter(a => damage?.[a.key]);
  const clean   = !damaged.length;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 pb-4 border-b border-white/5">
        {[['N','Nderrim'],['R','Riparim'],['K','Korrozion'],['G','Gervishtje'],['P','Parregullsi']].map(([code, label]) => (
          <div key={code} className="flex items-center gap-2 text-xs text-gray-400">
            <span
              className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
              style={{ background: DAMAGE_CODES[code]?.color + '22', border: `1.5px solid ${DAMAGE_CODES[code]?.color}`, color: DAMAGE_CODES[code]?.color }}
            >
              {code}
            </span>
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* SVG car diagram */}
        <div className="flex-shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-medium text-center">Jashtë</p>
          <svg viewBox="0 0 220 290" className="w-44 sm:w-52">
            {/* Body background */}
            <rect x="44" y="30" width="132" height="232" rx="6"
              fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            {/* Windshields */}
            <rect x="50" y="94" width="120" height="46" rx="2"
              fill="rgba(147,197,253,0.06)" stroke="rgba(147,197,253,0.12)" strokeWidth="1" />
            <rect x="50" y="186" width="120" height="46" rx="2"
              fill="rgba(147,197,253,0.06)" stroke="rgba(147,197,253,0.12)" strokeWidth="1" />
            {EXT_AREAS.map(area => (
              <AreaRect key={area.key} area={area} code={damage?.[area.key] || null} />
            ))}
          </svg>
        </div>

        {/* Damage table */}
        <div className="flex-1 min-w-0">
          {clean ? (
            <div className="flex items-center gap-2 py-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-sm text-green-400 font-semibold">Nuk janë raportuar dëmtime</span>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3 font-medium">
                Zonat me dëmtime
              </p>
              <div className="space-y-1">
                {damaged.map(area => {
                  const code = damage[area.key];
                  const info = DAMAGE_CODES[code];
                  return (
                    <div key={area.key}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                      style={{ background: info?.color + '10' }}
                    >
                      <span className="text-sm text-gray-300">{area.label}</span>
                      {info && (
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: info.color + '22', color: info.color, border: `1px solid ${info.color}44` }}
                        >
                          {code} · {info.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* All areas checklist */}
          <div className="mt-5 grid grid-cols-1 gap-0.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-medium">Të gjitha zonat</p>
            {EXT_AREAS.map(area => {
              const code = damage?.[area.key];
              const info = code ? DAMAGE_CODES[code] : null;
              return (
                <div key={area.key} className="flex items-center justify-between py-1 text-xs border-b border-white/4">
                  <span className={code ? 'text-gray-200' : 'text-gray-600'}>{area.label}</span>
                  {info ? (
                    <span style={{ color: info.color }} className="font-semibold">{code} · {info.label}</span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
