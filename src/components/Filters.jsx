import { useState } from 'react';
import { ChevronDown, RotateCcw, X } from 'lucide-react';

const BRANDS = [
  'BMW','Mercedes-Benz','Audi','Volkswagen','Porsche',
  'Hyundai','Kia','Genesis','Lexus','Toyota','Honda',
  'Chevrolet','SsangYong','Renault Samsung','Volvo',
  'Land Rover','Mini','Peugeot','Subaru','Mitsubishi',
  'Nissan','Infiniti','Maserati','Ferrari','Lamborghini',
];

const FUELS = [
  { val: '',         label: 'Të gjitha' },
  { val: 'diesel',   label: 'Naftë (Diesel)' },
  { val: 'gasoline', label: 'Benzinë (Petrol)' },
  { val: 'electric', label: 'Elektrik' },
  { val: 'hybrid',   label: 'Hibrid' },
  { val: 'lpg',      label: 'LPG' },
];

const YEARS = Array.from({ length: 21 }, (_, i) => String(2025 - i));

const KM_MAX = [
  { val: '',       label: 'Pa limit' },
  { val: '50000',  label: '≤ 50,000 km' },
  { val: '100000', label: '≤ 100,000 km' },
  { val: '150000', label: '≤ 150,000 km' },
  { val: '200000', label: '≤ 200,000 km' },
];

const EMPTY = { manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

function Sel({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-wider font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="select pr-8 text-sm appearance-none w-full"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-3)' }} />
      </div>
    </div>
  );
}

export default function Filters({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  function set(key) { return val => onChange(prev => ({ ...prev, [key]: val })); }
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters  = activeCount > 0;

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Sel label="Prodhuesi" value={filters.manufacturer} onChange={set('manufacturer')}>
        <option value="">Të gjithë</option>
        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
      </Sel>
      <Sel label="Karburanti" value={filters.fuel} onChange={set('fuel')}>
        {FUELS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
      </Sel>
      <Sel label="Viti nga" value={filters.yearFrom} onChange={set('yearFrom')}>
        <option value="">Çdo vit</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </Sel>
      <Sel label="Viti deri" value={filters.yearTo} onChange={set('yearTo')}>
        <option value="">Çdo vit</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </Sel>
      <Sel label="Km maksimum" value={filters.mileageTo} onChange={set('mileageTo')}>
        {KM_MAX.map(k => <option key={k.val} value={k.val}>{k.label}</option>)}
      </Sel>
      {hasFilters ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] invisible">x</label>
          <button
            onClick={() => { onChange(EMPTY); setOpen(false); }}
            className="flex items-center justify-center gap-1.5 h-[42px] text-xs rounded-xl transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <RotateCcw className="w-3.5 h-3.5" />Pastro
          </button>
        </div>
      ) : <div />}
    </div>
  );

  return (
    <>
      {/* Desktop always-visible filter row */}
      <div className="hidden sm:block" style={{ borderBottom: '1px solid var(--border-lo)', background: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {filterContent}
        </div>
      </div>

      {/* Mobile: slide-up drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] sm:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Sheet */}
          <div className="relative rounded-t-2xl p-5 pb-8 shadow-2xl animate-slide-up"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>
                Filtra
                {activeCount > 0 && (
                  <span className="ml-2 text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>

            {filterContent}

            <div className="flex gap-3 mt-5">
              {hasFilters && (
                <button
                  onClick={() => { onChange(EMPTY); setOpen(false); }}
                  className="flex-1 btn-ghost py-3 text-sm"
                >
                  Pastro
                </button>
              )}
              <button onClick={() => setOpen(false)} className={`btn-primary py-3 text-sm ${hasFilters ? 'flex-1' : 'w-full'}`}>
                Apliko
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: floating sticky Filtra button at bottom */}
      <div className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-2xl transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 8px 28px rgba(37,99,235,0.45)',
          }}
        >
          <span>⚙</span>
          Filtra
          {activeCount > 0 && (
            <span className="bg-white text-blue-600 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
