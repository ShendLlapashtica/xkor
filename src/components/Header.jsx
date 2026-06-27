import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  function onSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/?search=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070711]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tighter text-white">
            X<span className="text-blue-500">KOR</span>
          </span>
          <span className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-500 font-medium mt-0.5">
            Korea Auto
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={onSearch} className="flex-1 max-w-md hidden sm:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="BMW 530i, Hyundai Sonata..."
            className="input pl-9 text-sm"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live nga Encar
          </span>
        </div>
      </div>
    </header>
  );
}
