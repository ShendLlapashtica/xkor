import { useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';

const BRANDS = [
  'BMW','Mercedes-Benz','Audi','Volkswagen','Porsche','Hyundai','Kia',
  'Genesis','Lexus','Toyota','Honda','Chevrolet','SsangYong','Renault Samsung',
  'Volvo','Land Rover','Mini','Peugeot','Subaru','Mitsubishi','Nissan',
  'Infiniti','Maserati','Ferrari','Lamborghini',
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
  { val: '50000',  label: 'deri 50,000 km' },
  { val: '100000', label: 'deri 100,000 km' },
  { val: '150000', label: 'deri 150,000 km' },
  { val: '200000', label: 'deri 200,000 km' },
];

const EMPTY = { manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

function Sel({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1">
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
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider font-mono font-semibold invisible">x</label>
          <button
            onClick={() => { onChange(EMPTY); setOpen(false); }}
            className="flex items-center justify-center gap-1.5 h-[42px] text-xs rounded-xl transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Pastro
          </button>
        </div>
      ) : <div />}
    </div>
  );

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)', background: 'var(--bg-page)' }}>
      {/* Mobile toggle */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-2)' }}
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          Filtra
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={() => onChange(EMPTY)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Pastro të gjitha
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden px-4 pb-4 pt-4" style={{ borderTop: '1px solid var(--border-lo)' }}>
          {filterContent}
          <button onClick={() => setOpen(false)} className="mt-4 w-full btn-primary">
            Apliko Filtrat
          </button>
        </div>
      )}

      {/* Desktop row */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 md:px-8 py-4">
        {filterContent}
      </div>
    </div>
  );
}
