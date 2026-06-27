import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Settings } from 'lucide-react';
import { carPhotoUrl, durresPrice, fmtEur, fmtKm, carYear, tr } from '../lib/utils.js';
import { translateFuel, translateTrans } from '../lib/translations.js';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%230d0d1a'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='%23334155' font-size='13' font-family='sans-serif'%3EFoto nuk disponohet%3C/text%3E%3C/svg%3E";

export default function CarCard({ car }) {
  const [imgSrc, setImgSrc] = useState(() => carPhotoUrl(car) || PLACEHOLDER);
  const [imgOk, setImgOk]   = useState(true);

  const year  = carYear(car);
  const price = durresPrice(car.Price);
  const fuel  = translateFuel(car.FuelType);
  const trans = translateTrans(car.Transmission);

  const manufacturer = tr(car.Manufacturer);
  const model        = tr(car.Model);
  const badge        = tr(car.Badge);

  const fuelColor =
    fuel === 'Elektrik' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
    fuel === 'Hibrid'   ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
    fuel === 'Naftë'    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
    'bg-blue-500/20 text-blue-300 border-blue-500/30';

  return (
    <Link
      to={`/car/${car.Id}`}
      state={{ car }}
      className="group block bg-[#0d0d1c] border border-white/5 rounded-2xl overflow-hidden
                 hover:border-blue-500/25 hover:shadow-2xl hover:shadow-blue-950/20
                 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Photo */}
      <div className="relative overflow-hidden bg-[#0a0a14]" style={{ aspectRatio: '4/3' }}>
        <img
          src={imgSrc}
          alt={`${manufacturer} ${model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => { setImgOk(false); setImgSrc(PLACEHOLDER); }}
        />
        {year && (
          <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            {year}
          </span>
        )}
        {fuel && (
          <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fuelColor}`}>
            {fuel}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">{manufacturer}</p>
        <h3 className="text-[15px] font-bold text-white leading-snug truncate">{model || '—'}</h3>
        {badge && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{badge}</p>}

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {car.Mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-gray-600" />{fmtKm(car.Mileage)}
            </span>
          )}
          {trans && <span className="text-gray-600">·</span>}
          {trans && <span>{trans}</span>}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between">
          <div>
            <p className="text-xl font-extrabold text-white tracking-tight">{fmtEur(price)}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">deri në Durrës</p>
          </div>
          <span className="text-xs font-semibold text-blue-500 group-hover:text-blue-400 transition-colors pb-0.5">
            Shiko →
          </span>
        </div>
      </div>
    </Link>
  );
}
