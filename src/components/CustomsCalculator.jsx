import { useState } from 'react';
import { X, Calculator, ChevronDown } from 'lucide-react';

function calcAlbania(valueEur) {
  const duty    = valueEur * 0.05;          // 5% customs duty
  const vat     = (valueEur + duty) * 0.20; // 20% VAT on CIF+duty
  const eco     = valueEur > 15000 ? 150 : valueEur > 8000 ? 80 : 40; // eco-tax estimate
  const reg     = 120;                       // registration estimate
  const total   = duty + vat + eco + reg;
  return { duty, vat, eco, reg, total, finalPrice: valueEur + total };
}

function calcKosovo(valueEur) {
  const duty    = valueEur * 0.10;          // 10% customs
  const vat     = (valueEur + duty) * 0.18; // 18% VAT
  const fees    = 80;                        // admin fees
  const total   = duty + vat + fees;
  return { duty, vat, fees, total, finalPrice: valueEur + total };
}

function fmt(n) { return '€' + Math.round(n).toLocaleString('de-DE'); }

export default function CustomsCalculator({ onClose }) {
  const [value, setValue] = useState('');
  const [country, setCountry] = useState('AL');
  const result = value > 0
    ? (country === 'AL' ? calcAlbania(Number(value)) : calcKosovo(Number(value)))
    : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-[#0c0c1a] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Kalkulatori i Doganës</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Country */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono font-semibold mb-1.5">
              Shteti i Importit
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="select w-full appearance-none pr-8"
              >
                <option value="AL">🇦🇱 Shqipëri (Albania)</option>
                <option value="XK">🇽🇰 Kosovë (Kosovo)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Value input */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono font-semibold mb-1.5">
              Vlera e Mjetit (EUR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono font-bold">€</span>
              <input
                type="number"
                min="0"
                placeholder="p.sh. 12500"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="input pl-8 font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Bazuar në çmimin e automjetit (CIF - Korea → port)</p>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-[#080812] border border-white/5 rounded-xl p-4 space-y-2 mt-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-semibold mb-3">
                Llogaritja
              </p>

              {country === 'AL' ? (
                <>
                  <Line label="Çmimi bazë" val={fmt(Number(value))} />
                  <Line label="Dogana (5%)" val={fmt(result.duty)} />
                  <Line label="TVSH 20%" val={fmt(result.vat)} />
                  <Line label="Taksa Ekologjike" val={fmt(result.eco)} muted />
                  <Line label="Regjistrimi" val={fmt(result.reg)} muted />
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <Line label="Totali i Taksave" val={fmt(result.total)} accent />
                    <Line label="Çmimi Final (AL)" val={fmt(result.finalPrice)} bold />
                  </div>
                </>
              ) : (
                <>
                  <Line label="Çmimi bazë" val={fmt(Number(value))} />
                  <Line label="Dogana (10%)" val={fmt(result.duty)} />
                  <Line label="TVSH 18%" val={fmt(result.vat)} />
                  <Line label="Tarifat Admin" val={fmt(result.fees)} muted />
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <Line label="Totali i Taksave" val={fmt(result.total)} accent />
                    <Line label="Çmimi Final (XK)" val={fmt(result.finalPrice)} bold />
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-500 text-center">
            * Llogaritje afërsisht. Tarifat zyrtare mund të ndryshojnë sipas vitit, kubaturës dhe gjendjes së mjetit.
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({ label, val, accent, bold, muted }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={muted ? 'text-gray-600' : 'text-gray-400'}>{label}</span>
      <span className={`font-mono font-semibold ${bold ? 'text-white text-base' : accent ? 'text-blue-400' : 'text-gray-300'}`}>
        {val}
      </span>
    </div>
  );
}
