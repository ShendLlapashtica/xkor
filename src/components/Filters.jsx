import { ChevronDown, RotateCcw } from 'lucide-react';

const BRANDS = [
  'BMW','Mercedes-Benz','Audi','Volkswagen','Porsche','Hyundai','Kia',
  'Genesis','Lexus','Toyota','Honda','Chevrolet','SsangYong','Renault',
  'Volvo','Land Rover','Mini','Peugeot',
];

const FUELS = [
  { val: '',        label: 'Të gjitha' },
  { val: 'diesel',   label: 'Naftë' },
  { val: 'gasoline', label: 'Benzinë' },
  { val: 'electric', label: 'Elektrik' },
  { val: 'hybrid',   label: 'Hibrid' },
  { val: 'lpg',      label: 'LPG' },
];

const YEARS = ['', ...Array.from({ length: 20 }, (_, i) => String(2025 - i))];
const KM_OPTIONS = [
  { val: '',       label: 'Pa limit' },
  { val: '50000',  label: 'deri 50,000 km' },
  { val: '100000', label: 'deri 100,000 km' },
  { val: '150000', label: 'deri 150,000 km' },
  { val: '200000', label: 'deri 200,000 km' },
];

function Sel({ label, value, onChange, children }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="block text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className="select pr-8 text-sm appearance-none">
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Filters({ filters, onChange }) {
  function set(key) {
    return val => onChange(prev => ({ ...prev, [key]: val }));
  }

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="border-b border-white/5 bg-[#070711]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-wrap gap-3 items-end">
          <Sel label="Prodhuesi" value={filters.manufacturer} onChange={set('manufacturer')}>
            <option value="">Të gjithë</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </Sel>

          <Sel label="Karburanti" value={filters.fuel} onChange={set('fuel')}>
            {FUELS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
          </Sel>

          <Sel label="Viti (nga)" value={filters.yearFrom} onChange={set('yearFrom')}>
            <option value="">Çdo vit</option>
            {YEARS.filter(Boolean).map(y => <option key={y} value={y}>{y}</option>)}
          </Sel>

          <Sel label="Viti (deri)" value={filters.yearTo} onChange={set('yearTo')}>
            <option value="">Çdo vit</option>
            {YEARS.filter(Boolean).map(y => <option key={y} value={y}>{y}</option>)}
          </Sel>

          <Sel label="Km max" value={filters.mileageTo} onChange={set('mileageTo')}>
            {KM_OPTIONS.map(k => <option key={k.val} value={k.val}>{k.label}</option>)}
          </Sel>

          {hasFilters && (
            <button
              onClick={() => onChange({ manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' })}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-400 hover:text-white
                         bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl transition-all self-end"
            >
              <RotateCcw className="w-3 h-3" />
              Reseto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
