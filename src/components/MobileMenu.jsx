import { Link } from 'react-router-dom';
import { X, Calculator, Sun, Moon, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function MobileMenu({ onClose, onOpenCalc, country, setCountry, dark, toggleTheme }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const drawerBg = dark ? 'bg-[#0a0a18] border-white/10' : 'bg-white border-black/10';

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-72 h-full border-l flex flex-col shadow-2xl animate-slide-in-right ${drawerBg}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-mono font-bold text-lg" style={{ color: 'var(--text-1)' }}>
            X<span className="text-blue-500">K</span>OR
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Country toggle */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest mb-2 font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
            Çmim për
          </p>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              onClick={() => setCountry('AL')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all
                ${country === 'AL' ? 'bg-blue-600 text-white' : ''}`}
              style={country !== 'AL' ? { color: 'var(--text-2)' } : {}}
            >
              🇦🇱 Durrës
            </button>
            <button
              onClick={() => setCountry('XK')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all
                ${country === 'XK' ? 'bg-blue-600 text-white' : ''}`}
              style={country !== 'XK' ? { color: 'var(--text-2)' } : {}}
            >
              🇽🇰 Prishtinë
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/" onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-card2"
          >
            <span className="text-base">🏠</span>
            <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-1)' }}>Ballina</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
          </Link>
          <button
            onClick={onOpenCalc}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-card2"
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="flex-1 text-left text-sm font-medium" style={{ color: 'var(--text-1)' }}>Kalkulatori i Doganës</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-card2"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span className="flex-1 text-left text-sm font-medium" style={{ color: 'var(--text-1)' }}>
              {dark ? '☀️' : '🌙'}
            </span>
          </button>
        </nav>

        {/* Footer CTA */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
             className="btn-primary w-full" onClick={onClose}>
            💬 Na Kontaktoni
          </a>
        </div>
      </div>
    </div>
  );
}
