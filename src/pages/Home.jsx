import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';
import Filters from '../components/Filters.jsx';

const PAGE_SIZE = 24;

const EMPTY_FILTERS = {
  manufacturer: '',
  fuel: '',
  yearFrom: '',
  yearTo: '',
  mileageTo: '',
};

export default function Home() {
  const [cars, setCars]     = useState([]);
  const [total, setTotal]   = useState(null);
  const [page, setPage]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const session = useRef(0);

  const loadPage = useCallback(async (pg, flt, replace) => {
    const sid = ++session.current;
    setLoading(true);
    if (replace) setCars([]);
    setError(null);

    try {
      const params = new URLSearchParams({ page: pg, count: PAGE_SIZE });
      Object.entries(flt).forEach(([k, v]) => v && params.set(k, v));

      const r = await fetch(`/api/cars?${params}`);
      const data = await r.json();

      if (sid !== session.current) return;

      if (data.error) throw new Error(data.error);

      const newCars = data.results || data.SearchResults || [];
      setCars(prev => replace ? newCars : [...prev, ...newCars]);
      if (data.total != null) setTotal(data.total);
      else if (data.Count != null) setTotal(data.Count);
    } catch (e) {
      if (sid !== session.current) return;
      setError(e.message);
    } finally {
      if (sid === session.current) setLoading(false);
    }
  }, []);

  // Reset when filters change
  useEffect(() => {
    setPage(0);
    loadPage(0, filters, true);
  }, [filters, loadPage]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadPage(next, filters, false);
  }

  const hasMore = total != null && cars.length < total;

  return (
    <div className="min-h-screen bg-[#070711]">
      {/* Hero bar */}
      <div className="border-b border-white/5 bg-gradient-to-r from-[#070711] via-[#09091a] to-[#070711]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-400/70 font-medium mb-1">
              Tregti e drejtpërdrejtë · Korea Jugore
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {total != null ? (
                <>
                  <span className="text-blue-400">{total.toLocaleString('de-DE')}</span>
                  {' '}makina
                </>
              ) : (
                <span className="text-gray-600 animate-pulse">Duke ngarkuar...</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">direkt nga Encar · Korea Jugore</p>
          </div>
          <TrendingUp className="w-12 h-12 text-blue-500/20 hidden md:block" />
        </div>
      </div>

      {/* Filters */}
      <Filters filters={filters} onChange={setFilters} />

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && cars.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#0d0d1c] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-white/[0.03]" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-white/[0.04] rounded w-1/3" />
                  <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                  <div className="pt-2 flex justify-between">
                    <div className="h-5 bg-white/[0.04] rounded w-1/3" />
                    <div className="h-3 bg-white/[0.04] rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg font-medium">Nuk u gjetën makina</p>
            <p className="text-sm mt-1">Provo të ndryshosh filtrat</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map(car => <CarCard key={car.Id} car={car} />)}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-primary px-10 py-3 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Duke ngarkuar...
                    </span>
                  ) : (
                    `Ngarko më shumë (+${Math.min(PAGE_SIZE, total - cars.length).toLocaleString('de-DE')} makina)`
                  )}
                </button>
                <p className="text-xs text-gray-600">
                  Duke shfaqur {cars.length.toLocaleString('de-DE')} nga {total?.toLocaleString('de-DE')} makina
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
