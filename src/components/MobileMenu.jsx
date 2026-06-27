import { Link } from 'react-router-dom';
import { X, Calculator, Home, MessageCircle, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function MobileMenu({ onClose, onOpenCalc }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 h-full bg-[#0a0a18] border-l border-white/10 flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-mono font-bold text-lg text-white tracking-tight">
            X<span className="text-blue-500">K</span>OR
          </span>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10
                       text-gray-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          <MenuItem icon={Home} label="Ballina" onClick={onClose} to="/" />
          <button
            onClick={onOpenCalc}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300
                       hover:text-white hover:bg-white/5 transition-all group"
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="flex-1 text-left text-sm font-medium">Kalkulatori i Doganës</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
          </button>
        </nav>

        {/* Footer CTA */}
        <div className="p-4 border-t border-white/[0.06]">
          <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
             className="btn-primary w-full" onClick={onClose}>
            <MessageCircle className="w-4 h-4" />
            Na Kontaktoni
          </a>
          <p className="text-[10px] text-gray-700 text-center mt-3">
            Makina koreane te gatshme për import
          </p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300
                 hover:text-white hover:bg-white/5 transition-all group"
    >
      <Icon className="w-4 h-4 text-blue-400" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
    </Link>
  );
}
