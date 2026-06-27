import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, Calendar, MapPin } from 'lucide-react';
import { carPhotoUrl, manwonToEur, fmtEur, fmtKm, carYear } from '../lib/utils.js';
import { translateFuel, translateTrans } from '../lib/translations.js';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="400" height="250" fill="%230d0d1a"/><text x="200" y="130" text-anchor="middle" fill="%23334155" font-size="14" font-family="sans-serif">Foto nuk disponohet</text></svg>';

export default function CarCard({ car }) {
  const [imgSrc, setImgSrc] = useState(carPhotoUrl(car));
  const [imgFailed, setImgFailed] = useState(false);

  const year = carYear(car);
  const eur  = manwonToEur(car.Price);
  const fuel = translateFuel(car.FuelType);
  const trans = translateTrans(car.Transmission);

  function handleImgError() {
    if (!imgFailed) {
      setImgFailed(true);
      setImgSrc(PLACEHOLDER);
    }
  }

  const title = [car.Manufacturer, car.Model].filter(Boolean).join(' ');
  const subtitle = [car.Badge, car.BadgeDetail].filter(Boolean).join(' ');

  return (
    <Link
      to={`/car/${car.Id}`}
      state={{ car }}
      className="group block bg-[#0d0d1c] border border-white/5 rounded-2xl overflow-hidden
                 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-950/30
                 transition-all duration-200"
    >
      {/* Photo */}
      <div className="relative overflow-hidden aspect-[4/3] bg-[#0a0a14]">
        <img
          src={imgSrc}
          alt={title}
          onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Year badge */}
        {year && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-lg">
            {year}
          </div>
        )}
        {/* Fuel badge */}
        {fuel && (
          <div className="absolute bottom-2 left-2">
            <span className={`badge text-xs font-medium px-2 py-0.5 rounded-full ${
              fuel === 'Elektrik' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              fuel === 'Hibrid'   ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
              fuel === 'Naftë'    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {fuel}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-medium mb-0.5">
          {car.Manufacturer}
        </p>
        <h3 className="text-base font-bold text-white leading-tight mb-0.5 truncate">
          {car.Model || '—'}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mb-3 truncate">{subtitle}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {car.Mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-gray-500" />
              {fmtKm(car.Mileage)}
            </span>
          )}
          {trans && (
            <span className="flex items-center gap-1 text-gray-500">
              {trans}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            {eur > 0 ? (
              <>
                <p className="text-lg font-bold text-white">{fmtEur(eur)}</p>
                <p className="text-[10px] text-gray-600">çmim korea ≈ bazë</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Kontakto për çmim</p>
            )}
          </div>
          <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
            Shiko →
          </span>
        </div>
      </div>
    </Link>
  );
}
