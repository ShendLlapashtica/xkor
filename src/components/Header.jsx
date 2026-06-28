import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Sun, Moon, Menu } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import CustomsCalculator from './CustomsCalculator.jsx';
import MobileMenu from './MobileMenu.jsx';

export default function Header() {
  const [calc, setCalc]         = useState(false);
  const [menu, setMenu]         = useState(false);
  const [search, setSearch]     = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { country, setCountry } = useCountry();
  const { dark, toggle }        = useTheme();
  const navigate                = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/?q=${encodeURIComponent(search.trim())}`);
    setShowSearch(false);
    setSearch('');
  }

  const hdrBg = dark
    ? 'bg-[#060610]/90 border-white/[0.06]'
    : 'bg-white/95 border-black/[0.07]';

  return (
    <>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${hdrBg}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group select-none flex-shrink-0 mr-2">
            <div className="flex flex-col leading-none">
              <span className="font-mono font-bold text-xl tracking-tight group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-1)' }}>
                X<span className="text-blue-500">K</span>OR
              </span>
              <span style={{ fontSize: '7.5px', letterSpacing: '0.4px', color: 'var(--text-4)', opacity: 0.45, marginTop: '1px', fontWeight: 400 }}>
                nga WEBORA.KS
              </span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="BMW X5, Hyundai Tucson..."
                className="input pl-8 text-sm h-9"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">

            {/* AL / XK flags */}
            <div className="hidden sm:flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setCountry('AL')}
                title="Shqipëri – çmim Durrës"
                className={`px-2.5 py-1.5 text-base leading-none transition-all
                  ${country === 'AL' ? 'bg-blue-600' : 'hover:bg-card2'}`}
              >
                🇦🇱
              </button>
              <button
                onClick={() => setCountry('XK')}
                title="Kosovë – çmim Prishtinë"
                className={`px-2.5 py-1.5 text-base leading-none transition-all
                  ${country === 'XK' ? 'bg-blue-600' : 'hover:bg-card2'}`}
              >
                🇽🇰
              </button>
            </div>

            {/* Dogane */}
            <button
              onClick={() => setCalc(true)}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium btn-ghost"
            >
              <span>⚖️</span> Doganë
            </button>

            {/* Theme toggle — icon only */}
            <button
              onClick={toggle}
              title={dark ? 'Light mode' : 'Dark mode'}
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl btn-ghost text-base"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a href="tel:+38349644168"
               className="hidden sm:inline-flex items-center text-xs font-mono px-2 py-1 rounded-lg btn-ghost"
               style={{ opacity: 0.55, letterSpacing: '0.2px' }}>
              049 644 168
            </a>

            <a href="https://wa.me/38349644168" target="_blank" rel="noopener noreferrer"
               className="hidden sm:inline-flex btn-primary text-xs py-1.5 px-3">
              WhatsApp
            </a>

            {/* Mobile: search + burger */}
            <button
              onClick={() => setShowSearch(s => !s)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost text-base"
            >
              {showSearch ? <X className="w-4 h-4" /> : '🔍'}
            </button>
            <button
              onClick={() => setMenu(true)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost"
              style={{ color: 'var(--text-1)' }}
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
                🔍
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
