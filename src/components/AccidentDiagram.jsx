import { DAMAGE_CODES } from '../lib/translations.js';

const AREA_DEFS = [
  { key: 'frontBumper',     label: 'Bufera Përpara',         x: 55,  y: 8,   w: 110, h: 22 },
  { key: 'hood',            label: 'Kapuç',                  x: 42,  y: 32,  w: 136, h: 68 },
  { key: 'roof',            label: 'Çati',                   x: 48,  y: 148, w: 124, h: 84 },
  { key: 'trunk',           label: 'Bagazh',                 x: 42,  y: 280, w: 136, h: 68 },
  { key: 'rearBumper',      label: 'Bufera Mbrapa',          x: 55,  y: 350, w: 110, h: 22 },
  { key: 'frontLeftFender', label: 'Parafango Para Majtë',   x: 8,   y: 38,  w: 32,  h: 58 },
  { key: 'frontRightFender',label: 'Parafango Para Djathas', x: 180, y: 38,  w: 32,  h: 58 },
  { key: 'frontLeftDoor',   label: 'Portë Para Majtë',       x: 8,   y: 100, w: 32,  h: 66 },
  { key: 'frontRightDoor',  label: 'Portë Para Djathas',     x: 180, y: 100, w: 32,  h: 66 },
  { key: 'rearLeftDoor',    label: 'Portë Mbrapa Majtë',     x: 8,   y: 170, w: 32,  h: 66 },
  { key: 'rearRightDoor',   label: 'Portë Mbrapa Djathas',   x: 180, y: 170, w: 32,  h: 66 },
  { key: 'rearLeftPanel',   label: 'Panel Mbrapa Majtë',     x: 8,   y: 240, w: 32,  h: 96 },
  { key: 'rearRightPanel',  label: 'Panel Mbrapa Djathas',   x: 180, y: 240, w: 32,  h: 96 },
];

function colorFor(code) {
  if (!code) return { fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.08)' };
  const c = DAMAGE_CODES[code];
  if (!c) return { fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.08)' };
  return { fill: c.color + '33', stroke: c.color };
}

export default function AccidentDiagram({ damage }) {
  const hasDamage = damage && Object.values(damage).some(Boolean);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Raporti i Aksidenteve</h3>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* SVG Diagram */}
        <div className="flex-shrink-0">
          <svg
            viewBox="0 0 220 380"
            className="w-40 sm:w-48"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
          >
            {/* Car silhouette background */}
            <rect x="42" y="32" width="136" height="316" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            {/* Windshields */}
            <rect x="52" y="100" width="116" height="48" rx="3" fill="rgba(147,197,253,0.07)" stroke="rgba(147,197,253,0.15)" strokeWidth="1" />
            <rect x="52" y="232" width="116" height="48" rx="3" fill="rgba(147,197,253,0.07)" stroke="rgba(147,197,253,0.15)" strokeWidth="1" />

            {/* Each area */}
            {AREA_DEFS.map(area => {
              const code = damage?.[area.key];
              const { fill, stroke } = colorFor(code);
              return (
                <g key={area.key}>
                  <rect
                    x={area.x} y={area.y} width={area.w} height={area.h}
                    rx="4"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                  />
                  {code && (
                    <text
                      x={area.x + area.w / 2}
                      y={area.y + area.h / 2 + 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill={stroke}
                    >
                      {code}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend + damage list */}
        <div className="flex-1 space-y-4">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DAMAGE_CODES).filter(([k]) => ['N','R','K','G','P'].includes(k)).map(([code, info]) => (
              <div key={code} className="flex items-center gap-2 text-xs">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                  style={{ background: info.color + '33', border: `1px solid ${info.color}` }}
                >
                  {code}
                </span>
                <span className="text-gray-400">{info.label.split(' (')[0]}</span>
              </div>
            ))}
          </div>

          {/* Damage list */}
          {hasDamage ? (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Zona me dëmtime</p>
              {AREA_DEFS.filter(a => damage?.[a.key]).map(area => {
                const code = damage[area.key];
                const info = DAMAGE_CODES[code];
                return (
                  <div key={area.key} className="flex items-center justify-between text-xs py-1 border-b border-white/4">
                    <span className="text-gray-300">{area.label}</span>
                    {info && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: info.color + '22', color: info.color, border: `1px solid ${info.color}55` }}
                      >
                        {info.label.split(' (')[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300 font-medium">Nuk janë raportuar dëmtime</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
