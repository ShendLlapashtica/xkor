import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070711]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tighter text-white">
            X<span className="text-blue-500">KOR</span>
          </span>
          <span className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-600 font-medium">
            Auto Korea
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live · Encar Korea
          </span>
        </div>
      </div>
    </header>
  );
}
