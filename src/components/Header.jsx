import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Calculator, Sun, Moon, Search, X } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import CustomsCalculator from './CustomsCalculator.jsx';
import MobileMenu from './MobileMenu.jsx';

export default function Header() {
  const [calc, setCalc]     = useState(false);
  const [menu, setMenu]     = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { country, setCountry } = useCountry();
  const { dark, toggle }        = useTheme();
  const { pathname }            = useLocation();
  const navigate                = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/?q=${encodeURIComponent(search.trim())}`);
    setShowSearch(false);
  }

  const headerBg = dark
    ? 'bg-[#060610]/90 border-white/[0.06]'
    : 'bg-white/95 border-black/[0.06]';

  return (
    <>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-3 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group select-none flex-shrink-0">
            <span className="font-mono font-bold text-xl tracking-tight group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-1)' }}>
              X<span className="text-blue-500">K</span>OR
            </span>
          </Link>

          {/* Search — desktop inline */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Kërko: BMW X5, Hyundai Tucson..."
                className="input pl-9 pr-4 text-sm h-9 text-sm"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 ml-auto">

            {/* Country toggle */}
            <div className="hidden sm:flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setCountry('AL')}
                title="Shqipëri – çmim Durrës"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all
                  ${country === 'AL' ? 'bg-blue-600 text-white' : 'text-secondary hover:bg-card2'}`}
              >
                🇦🇱 AL
              </button>
              <button
                onClick={() => setCountry('XK')}
                title="Kosovë – çmim Prishtinë"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all
                  ${country === 'XK' ? 'bg-blue-600 text-white' : 'text-secondary hover:bg-card2'}`}
              >
                🇽🇰 XK
              </button>
            </div>

            {/* Desktop: Dogane + Theme + WhatsApp */}
            <button
              onClick={() => setCalc(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all btn-ghost"
            >
              <Calculator className="w-3.5 h-3.5" />
              Doganë
            </button>

            <button
              onClick={toggle}
              title={dark ? 'Light mode' : 'Dark mode'}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl btn-ghost"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
               className="hidden sm:inline-flex btn-primary text-xs py-1.5 px-3">
              WhatsApp
            </a>

            {/* Mobile: search toggle + hamburger */}
            <button
              onClick={() => setShowSearch(s => !s)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost"
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMenu(true)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="sm:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="BMW X5, Hyundai Tucson..."
                className="input flex-1 text-sm h-10"
              />
              <button type="submit" className="btn-primary px-4 h-10 text-sm">
                Kërko
              </button>
            </form>
          </div>
        )}
      </header>

      {calc && <CustomsCalculator onClose={() => setCalc(false)} />}
      {menu && (
        <MobileMenu
          onClose={() => setMenu(false)}
          onOpenCalc={() => { setMenu(false); setCalc(true); }}
          country={country}
          setCountry={setCountry}
          dark={dark}
          toggleTheme={toggle}
        />
      )}
    </>
  );
}
