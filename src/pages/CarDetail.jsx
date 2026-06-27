import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Gauge, Calendar, Fuel,
  Settings, Users, ShieldCheck, AlertTriangle, Info, MapPin, ExternalLink,
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery.jsx';
import AccidentDiagram from '../components/AccidentDiagram.jsx';
import {
  carYear, durresPrice, pristinePrice, manwonToEur,
  fmtEur, fmtKm, allPhotoUrls, tr,
} from '../lib/utils.js';
import {
  translateFuel, translateTrans, translateOption,
  translateColor, DAMAGE_CODES,
} from '../lib/translations.js';

const WHATSAPP = '38349000000';
const PHONE    = '+38349000000';
const DELIVERY_DURRES     = 350;
const DELIVERY_PRISHTINA  = 700;

function Row({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-600 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-gray-200 font-medium ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

export default function CarDetail() {
  const { id }       = useParams();
  const { state }    = useLocation();

  const [car, setCar]         = useState(state?.car || null);
  const [inspect, setInspect] = useState(null);
  const [loadingCar, setLoadingCar]     = useState(!state?.car);
  const [loadingInspect, setLoadingInspect] = useState(true);
  const [error, setError]     = useState(null);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  // Load car detail if not passed via router state
  useEffect(() => {
    if (car) return;
    fetch(`/api/car?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setCar(data.SearchResults?.[0] || data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingCar(false));
  }, [id]);

  // Load inspection report
  useEffect(() => {
    fetch(`/api/inspect?id=${id}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setInspect(data); })
      .catch(() => {})
      .finally(() => setLoadingInspect(false));
  }, [id]);

  if (loadingCar) return (
    <div className="min-h-screen bg-[#070711] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !car) return (
    <div className="min-h-screen bg-[#070711] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Makina nuk u gjet.</p>
      <Link to="/" className="text-blue-400 hover:underline text-sm">← Kthehu</Link>
    </div>
  );

  const year        = carYear(car);
  const fuel        = translateFuel(car.FuelType);
  const trans       = translateTrans(car.Transmission);
  const color       = translateColor(car.Color || car.Spec?.Color);
  const manufacturer = tr(car.Manufacturer);
  const model        = tr(car.Model);
  const badge        = tr(car.Badge);
  const badgeDetail  = tr(car.BadgeDetail);
  const subtitle     = [badge, badgeDetail].filter(Boolean).join(' · ');

  const photos      = allPhotoUrls(car);
  const options     = car.OptionList || car.Options || [];
  const displacement = car.Spec?.Displacement || car.CylinderCapacity;
  const seats       = car.Spec?.Seats || car.Seats;
  const vin         = car.Spec?.Vin || car.Vin || car.VinCode;
  const drive       = car.Spec?.Drive || car.Drive || car.DriveType;

  const eurBase    = manwonToEur(car.Price);
  const eurDurres  = eurBase + DELIVERY_DURRES;
  const eurKosovo  = eurBase + DELIVERY_PRISHTINA;

  const waMsg = encodeURIComponent(
    `Jam i interesuar për: ${manufacturer} ${model} ${badge} (${year}) — Encar ID: ${id}`
  );

  return (
    <div className="min-h-screen bg-[#070711] pb-24">
      {/* Breadcrumb nav */}
      <div className="border-b border-white/5 bg-[#070711]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-11 flex items-center gap-3 text-sm">
          <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Kthehu
          </Link>
          <span className="text-gray-800">/</span>
          <span className="text-gray-400 truncate">{manufacturer} {model}</span>
          {id && (
            <a
              href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`}
              target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-gray-600 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />Encar
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* LEFT */}
          <div className="space-y-6">

            {/* Gallery */}
            {photos.length > 0
              ? <ImageGallery photos={photos} alt={`${manufacturer} ${model}`} />
              : <div className="rounded-2xl bg-[#0d0d1c] border border-white/5 flex items-center justify-center h-64 text-gray-700">
                  Foto nuk disponohet
                </div>
            }

            {/* Title */}
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500/70 font-semibold mb-1">{manufacturer}</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{model}</h1>
              {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {year && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-full text-sm text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-600" />{year}
                </span>
              )}
              {car.Mileage != null && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-full text-sm text-gray-300">
                  <Gauge className="w-3.5 h-3.5 text-gray-600" />{fmtKm(car.Mileage)}
                </span>
              )}
              {fuel && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-full text-sm text-gray-300">
                  <Fuel className="w-3.5 h-3.5 text-gray-600" />{fuel}
                </span>
              )}
              {trans && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-full text-sm text-gray-300">
                  <Settings className="w-3.5 h-3.5 text-gray-600" />{trans}
                </span>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-[#0c0c1a] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Specifikimet e Mjetit
              </h2>
              <Row label="Marka"           value={manufacturer} />
              <Row label="Modeli"          value={model} />
              <Row label="Varianti"        value={subtitle || undefined} />
              <Row label="Viti i Prodhimit" value={year} />
              <Row label="Kilometra"       value={car.Mileage != null ? fmtKm(car.Mileage) : undefined} />
              <Row label="Lloji Karburantit" value={fuel} />
              <Row label="Transmisioni"   value={trans} />
              <Row label="Drivetrain"     value={drive || undefined} />
              <Row label="Motori (cc)"    value={displacement ? `${displacement} cc` : undefined} />
              <Row label="Ngjyra"         value={color !== '—' ? color : undefined} />
              <Row label="Numri Ulëseve"  value={seats} />
              <Row label="Lokacioni (KR)" value={car.OfficeCityState} />
              {vin && <Row label="Numri Shasisë" value={vin} mono />}
              {id  && <Row label="ID Encar"      value={String(id)} mono />}
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="bg-[#0c0c1a] border border-white/5 rounded-2xl p-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Opsionet e Mjetit
                  <span className="ml-2 text-gray-700 normal-case tracking-normal font-normal text-xs">
                    {options.length} gjithsej
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 flex-shrink-0" />
                      <span className="text-gray-300">{translateOption(opt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection / Accident Report */}
            <div className="bg-[#0c0c1a] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Raporti i Inspektimit
              </h2>

              {loadingInspect ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 py-4">
                  <span className="w-4 h-4 border-2 border-gray-700 border-t-gray-500 rounded-full animate-spin" />
                  Duke ngarkuar raportin...
                </div>
              ) : inspect ? (
                <>
                  {/* Summary badges */}
                  {(inspect.ownerCount != null || inspect.accidentCount != null) && (
                    <div className="flex flex-wrap gap-3 mb-5">
                      {inspect.ownerCount != null && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/8 rounded-xl text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300">
                            Pronarë të ndërruar: <strong className="text-white">{inspect.ownerCount}</strong>
                          </span>
                        </div>
                      )}
                      {inspect.accidentCount != null && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border ${
                          inspect.accidentCount > 0
                            ? 'bg-red-900/15 border-red-500/25 text-red-300'
                            : 'bg-green-900/15 border-green-500/25 text-green-300'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                          {inspect.accidentCount > 0
                            ? `${inspect.accidentCount} aksident i raportuar`
                            : 'Asnjë aksident i raportuar'}
                        </div>
                      )}
                    </div>
                  )}

                  <AccidentDiagram damage={inspect.damage} />

                  {/* Disclaimer */}
                  <p className="mt-5 text-[11px] text-gray-700 border-t border-white/5 pt-4">
                    Ky inspektim është bërë nga pala koreane para se mjeti të dalë në shitje.
                    Inspektimi nga kompania jonë bëhet para se klienti ta bëjë blerjen.
                    Të gjitha të dhënat janë marrë nga burimet e inspektimit Encar dhe paraqiten vetëm për qëllime informuese.
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <AccidentDiagram damage={null} />
                  <div className="flex items-start gap-3 mt-4 p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium">Raport i detajuar nga Encar</p>
                      <p className="text-xs text-blue-400/60 mt-0.5">
                        Kontaktoni ekipin tonë ose shikoni raportin e plotë direkt në Encar.
                      </p>
                      {id && (
                        <a
                          href={`https://www.encar.com/inspection/car/carConditionDetail.do?carid=${id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Shiko raportin Encar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — sticky price & contact */}
          <div className="space-y-4">
            <div className="bg-[#0c0c1a] border border-white/5 rounded-2xl p-6 lg:sticky lg:top-28">

              {/* Price — Durres as primary */}
              <div className="space-y-4">
                {/* Primary: Durres */}
                <div className="pb-4 border-b border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1.5">
                    Çmimi deri në Durrës
                  </p>
                  <p className="text-4xl font-extrabold text-white tracking-tight">
                    {eurBase > 0 ? fmtEur(eurDurres) : '—'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Transport + doganë e përfshira</p>
                </div>

                {/* Secondary prices */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      Çmimi i bazës (Korea)
                    </span>
                    <span className="text-gray-400 font-medium">{eurBase > 0 ? fmtEur(eurBase) : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      Deri në terminalin Prishtinë
                    </span>
                    <span className="text-gray-300 font-semibold">{eurBase > 0 ? fmtEur(eurKosovo) : '—'}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-700 pt-1">
                  * Çmimi bazë + transport + doganë. Për çmim final me taksa importi kontaktoni.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 space-y-3">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Kontakto me WhatsApp
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-gray-300 hover:text-white bg-white/5 border border-white/8 hover:bg-white/10 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Thirr Shitësin
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Shërbim Inspektimi Profesional
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Transport i Siguruar Deri Te Ju
                </div>
                {id && (
                  <a
                    href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-400 transition-colors mt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Shiko listimin Encar origjinal
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
