import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Calculator } from 'lucide-react';
import CustomsCalculator from './CustomsCalculator.jsx';
import MobileMenu from './MobileMenu.jsx';

export default function Header() {
  const [calc, setCalc] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname }    = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060610]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group select-none">
            <span className="font-mono font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
              X<span className="text-blue-500">K</span>OR
            </span>
            <span className="hidden sm:inline text-[10px] text-gray-600 font-mono uppercase tracking-widest pt-0.5">
              · Makina Koreane
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" label="Ballina" active={pathname === '/'} />
            <button
              onClick={() => setCalc(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-400
                         hover:text-white hover:bg-white/5 transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              Doganë
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
               className="hidden sm:inline-flex btn-primary text-sm py-2 px-4">
              WhatsApp
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenu(true)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5
                         hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {calc && <CustomsCalculator onClose={() => setCalc(false)} />}
      {menu && <MobileMenu onClose={() => setMenu(false)} onOpenCalc={() => { setMenu(false); setCalc(true); }} />}
    </>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all
        ${active ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {label}
    </Link>
  );
}
