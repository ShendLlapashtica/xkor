import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';
import Filters from '../components/Filters.jsx';

const PAGE_SIZE = 24;
const EMPTY_FILTERS = { manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

export default function Home() {
  const [cars, setCars]       = useState([]);
  const [total, setTotal]     = useState(null);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const session               = useRef(0);
  const sentinel              = useRef(null);

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
      { rootMargin: '300px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, done, filters, loadPage]);

  return (
    <div className="min-h-screen bg-[#070711]">
      {/* Hero */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-7 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold mb-1.5">
              Tregti direkte · Korea Jugore
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              {total != null ? (
                <>{total.toLocaleString('de-DE')}<span className="text-blue-500"> makina</span></>
              ) : (
                <span className="text-gray-700 animate-pulse">Duke ngarkuar...</span>
              )}
            </h1>
            <p className="text-sm text-gray-600 mt-1.5">Çmimet përfshijnë transport deri në Durrës</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500/15 hidden md:block" />
        </div>
      </div>

      {/* Filters */}
      <Filters filters={filters} onChange={setFilters} />

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/25 rounded-xl text-red-300 text-sm">
            ⚠ {error}
          </div>
        )}

        {cars.length === 0 && loading ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-[#0d0d1c] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-white/[0.03]" style={{ aspectRatio: '4/3' }} />
                <div className="p-4 space-y-3">
                  <div className="h-2.5 bg-white/[0.04] rounded w-1/4" />
                  <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                  <div className="pt-3 flex justify-between items-center">
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

            {/* Sentinel for infinite scroll */}
            <div ref={sentinel} className="h-12 flex items-center justify-center mt-8">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                  Duke ngarkuar...
                </div>
              )}
              {done && cars.length > 0 && (
                <p className="text-xs text-gray-700">
                  Të gjitha {total?.toLocaleString('de-DE')} makina u ngarkuan
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
