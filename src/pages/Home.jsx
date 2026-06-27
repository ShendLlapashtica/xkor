import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Shield, Truck, BadgeCheck, Clock, HeartHandshake, Globe } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';
import Filters from '../components/Filters.jsx';

const PAGE_SIZE = 24;
const EMPTY_FILTERS = { manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

function filtersFromParams(params) {
  return {
    manufacturer: params.get('brand')    || '',
    fuel:         params.get('fuel')     || '',
    yearFrom:     params.get('yearFrom') || '',
    yearTo:       params.get('yearTo')   || '',
    mileageTo:    params.get('kmMax')    || '',
  };
}

function paramsFromFilters(f) {
  const p = {};
  if (f.manufacturer) p.brand    = f.manufacturer;
  if (f.fuel)         p.fuel     = f.fuel;
  if (f.yearFrom)     p.yearFrom = f.yearFrom;
  if (f.yearTo)       p.yearTo   = f.yearTo;
  if (f.mileageTo)    p.kmMax    = f.mileageTo;
  return p;
}

const WHY_US = [
  { icon: BadgeCheck,    title: 'Vetëm Makina të Verifikuara',  desc: 'Çdo makinë ka raport inspektimi nga Encar — historik dëmtimesh, numër pronarësh, aksidente.' },
  { icon: Globe,         title: '200,000+ Listëzime Live',      desc: 'Direkta nga platforma koreane Encar.com — çmimet dhe disponueshmëria janë në kohë reale.' },
  { icon: Truck,         title: 'Çmim All-in Durrës',          desc: 'Çmimi që shohim përfshin transportin deri në Durrës. Pa kosto të fshehura.' },
  { icon: Clock,         title: 'Dorëzim 30-45 Ditë',          desc: 'Pas konfirmimit të porosisë, makina mbërrin në portë brenda 4-6 javësh.' },
  { icon: HeartHandshake,title: 'Asistencë e Plotë Doganore',  desc: 'E organizojmë gjithë procesin e doganes, TVSH-ës dhe regjistrimit për ju.' },
  { icon: Shield,        title: 'Garanci Kthimi',              desc: 'Nëse makina nuk përputhet me përshkrimin, marrim kujdesin e plotë. Zero risk.' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars]       = useState([]);
  const [total, setTotal]     = useState(null);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const session               = useRef(0);
  const sentinel              = useRef(null);

  // Sync filters → URL
  function handleFilterChange(updater) {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSearchParams(paramsFromFilters(next), { replace: true });
      return next;
    });
  }

  const loadPage = useCallback(async (pg, flt, replace) => {
    const sid = ++session.current;
    setLoading(true);
    if (replace) { setCars([]); setDone(false); }
    setError(null);

    try {
      const params = new URLSearchParams({ page: pg, count: PAGE_SIZE });
      Object.entries(flt).forEach(([k, v]) => v && params.set(k, v));

      const r = await fetch(`/api/cars?${params}`);
      const data = await r.json();
      if (sid !== session.current) return;
      if (data.error) throw new Error(data.error);

      const newCars = data.results || data.SearchResults || [];
      const tot     = data.total ?? data.Count ?? 0;

      setCars(prev => {
        const next = replace ? newCars : [...prev, ...newCars];
        if (next.length >= tot || newCars.length < PAGE_SIZE) setDone(true);
        return next;
      });
      setTotal(tot);
    } catch (e) {
      if (sid !== session.current) return;
      setError(e.message);
    } finally {
      if (sid === session.current) setLoading(false);
    }
  }, []);

  // Reset on filter change
  useEffect(() => {
    setPage(0);
    loadPage(0, filters, true);
  }, [filters, loadPage]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !done) {
          setPage(prev => {
            const next = prev + 1;
            loadPage(next, filters, false);
            return next;
          });
        }
      },
      { rootMargin: '400px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, done, filters, loadPage]);

  return (
    <div className="min-h-screen bg-[#070711]">

      {/* ── Hero ── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold mb-2 font-mono">
              Tregti direkte · Korea Jugore
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              {total != null ? (
                <>
                  <span className="font-mono">{total.toLocaleString('de-DE')}</span>
                  <span className="text-blue-500"> makina</span>
                </>
              ) : (
                <span className="text-gray-700 animate-pulse">Duke ngarkuar...</span>
              )}
            </h1>
            <p className="text-sm text-gray-600 mt-2">Çmimet përfshijnë transport deri në Durrës · all-in</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500/15 hidden md:block" />
        </div>
      </div>

      {/* ── Filters ── */}
      <Filters filters={filters} onChange={handleFilterChange} />

      {/* ── Car grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/25 rounded-xl text-red-300 text-sm">
            ⚠ {error}
          </div>
        )}

        {cars.length === 0 && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-[#0d0d1c] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-white/[0.03]" style={{ aspectRatio: '16/10' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-3 bg-white/[0.03] rounded" />
                    ))}
                  </div>
                  <div className="pt-2 flex justify-between">
                    <div className="h-5 bg-white/[0.04] rounded w-1/3" />
                    <div className="h-3 bg-white/[0.04] rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg font-medium">Nuk u gjetën makina</p>
            <p className="text-gray-700 text-sm mt-1">Provo të ndryshosh filtrat</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map(car => <CarCard key={`${car.Id}-${car.Price}`} car={car} />)}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinel} className="h-16 flex items-center justify-center mt-6">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                  Duke ngarkuar...
                </div>
              )}
              {done && cars.length > 0 && (
                <p className="text-xs text-gray-700 font-mono">
                  Të gjitha {total?.toLocaleString('de-DE')} makina u ngarkuan
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Pse të na zgjidhni ne ── */}
      <section className="border-t border-white/[0.04] mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold font-mono mb-3">
              Avantazhi ynë
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Pse të na zgjidhni ne?
            </h2>
            <p className="text-gray-600 text-sm mt-3 max-w-xl mx-auto">
              Importojmë direkt nga Korea Jugore — pa ndërmjetës, pa surpriza.
              Transparencë totale nga listëzimi deri te portat e Durrësit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-[#0c0c1c] border border-white/[0.05] rounded-2xl p-6
                           hover:border-blue-500/20 hover:bg-[#0d0d20] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4
                                group-hover:bg-blue-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
               className="btn-primary px-8 py-3 text-sm">
              Na Kontaktoni Tani
            </a>
            <p className="text-xs text-gray-700 mt-3">Pa asnjë angazhim · Konsultë falas</p>
          </div>
        </div>
      </section>
    </div>
  );
}
