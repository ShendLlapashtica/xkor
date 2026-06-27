import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Gauge, Calendar, Fuel,
  Settings, Palette, Car, Users, ShieldCheck, AlertTriangle, Info,
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery.jsx';
import AccidentDiagram from '../components/AccidentDiagram.jsx';
import { carYear, manwonToEur, fmtEur, fmtKm, allPhotoUrls } from '../lib/utils.js';
import { translateFuel, translateTrans, translateOption, translateDrive, DAMAGE_CODES } from '../lib/translations.js';

const WHATSAPP = '+38349000000'; // update with real number
const PHONE    = '+38349000000';

const DELIVERY_DURRES  = 350;
const DELIVERY_PRISHTINA = 700;

function SpecRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
      <span className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-200 font-medium">{value}</span>
    </div>
  );
}

export default function CarDetail() {
  const { id } = useParams();
  const { state } = useLocation();

  const [car, setCar]         = useState(state?.car || null);
  const [inspect, setInspect] = useState(null);
  const [loadingCar, setLoadingCar] = useState(!state?.car);
  const [loadingInspect, setLoadingInspect] = useState(true);
  const [error, setError]     = useState(null);

  // Load full car detail if not passed via navigation state
  useEffect(() => {
    if (!car) {
      setLoadingCar(true);
      fetch(`/api/car?id=${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setCar(data.SearchResults?.[0] || data);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoadingCar(false));
    }
  }, [id]);

  // Load inspection/accident report
  useEffect(() => {
    fetch(`/api/inspect?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setInspect(data);
      })
      .catch(() => {})
      .finally(() => setLoadingInspect(false));
  }, [id]);

  if (loadingCar) return (
    <div className="min-h-screen bg-[#070711] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !car) return (
    <div className="min-h-screen bg-[#070711] flex flex-col items-center justify-center gap-4 text-gray-400">
      <p>Makina nuk u gjet.</p>
      <Link to="/" className="text-blue-400 hover:underline text-sm">← Kthehu</Link>
    </div>
  );

  const year   = carYear(car);
  const fuel   = translateFuel(car.FuelType);
  const trans  = translateTrans(car.Transmission);
  const drive  = translateDrive(car.Drive || car.DriveType);
  const eurBase = manwonToEur(car.Price);
  const eurDurres   = eurBase + DELIVERY_DURRES;
  const eurPrishtina = eurBase + DELIVERY_PRISHTINA;
  const photos = allPhotoUrls(car, 30);

  const title    = [car.Manufacturer, car.Model].filter(Boolean).join(' ');
  const subtitle = [car.Badge, car.BadgeDetail].filter(Boolean).join(' ');
  const options  = car.OptionList || car.Options || [];
  const displacement = car.Spec?.Displacement || car.Displacement;
  const seats = car.Spec?.Seats || car.Seats;
  const vin = car.Spec?.Vin || car.Vin || car.VinCode;
  const color = car.Spec?.Color || car.Color;

  return (
    <div className="min-h-screen bg-[#070711] pb-20">
      {/* Top nav */}
      <div className="sticky top-16 z-40 border-b border-white/5 bg-[#070711]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kthehu
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-300 truncate">{title}</span>
          {car.Id && (
            <a
              href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${car.Id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-blue-400 hover:underline"
            >
              Shiko në Encar ↗
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Gallery + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <ImageGallery photos={photos} alt={title} />

            {/* Title */}
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400/80 font-semibold mb-1">{car.Manufacturer}</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{car.Model}</h1>
              {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
            </div>

            {/* Quick specs chips */}
            <div className="flex flex-wrap gap-2">
              {year && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-sm text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />{year}
                </span>
              )}
              {car.Mileage != null && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-sm text-gray-300">
                  <Gauge className="w-3.5 h-3.5 text-gray-500" />{fmtKm(car.Mileage)}
                </span>
              )}
              {fuel && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-sm text-gray-300">
                  <Fuel className="w-3.5 h-3.5 text-gray-500" />{fuel}
                </span>
              )}
              {trans && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-sm text-gray-300">
                  <Settings className="w-3.5 h-3.5 text-gray-500" />{trans}
                </span>
              )}
              {drive && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-sm text-gray-300">
                  <Car className="w-3.5 h-3.5 text-gray-500" />{drive}
                </span>
              )}
            </div>

            {/* Full specs */}
            <div className="bg-[#0d0d1c] border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Specifikimet</h2>
              <SpecRow icon={Car}      label="Marka"        value={car.Manufacturer} />
              <SpecRow icon={Car}      label="Modeli"       value={car.Model} />
              <SpecRow icon={Car}      label="Varianti"     value={subtitle || undefined} />
              <SpecRow icon={Calendar} label="Viti"         value={year} />
              <SpecRow icon={Gauge}    label="Kilometra"    value={car.Mileage != null ? fmtKm(car.Mileage) : undefined} />
              <SpecRow icon={Fuel}     label="Karburanti"   value={fuel} />
              <SpecRow icon={Settings} label="Transmisioni" value={trans} />
              <SpecRow icon={Car}      label="Drivetrain"   value={drive || undefined} />
              <SpecRow icon={Palette}  label="Ngjyra"       value={color} />
              <SpecRow icon={Settings} label="Motori"       value={displacement ? `${(displacement/1000).toFixed(1)}L` : undefined} />
              <SpecRow icon={Users}    label="Ulëse"        value={seats} />
              {vin && <SpecRow icon={ShieldCheck} label="VIN" value={vin} />}
              {car.Id && <SpecRow icon={Info} label="ID Encar" value={String(car.Id)} />}
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="bg-[#0d0d1c] border border-white/5 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  Opsionet e Veturës
                  <span className="ml-2 text-xs text-gray-600 normal-case tracking-normal font-normal">
                    ({options.length} total)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {translateOption(opt)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accident Report */}
            <div className="bg-[#0d0d1c] border border-white/5 rounded-2xl p-5">
              {loadingInspect ? (
                <div className="flex items-center gap-3 text-sm text-gray-500 py-4">
                  <span className="w-4 h-4 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
                  Duke ngarkuar raportin...
                </div>
              ) : inspect ? (
                <>
                  {/* Owner + accident summary */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {inspect.ownerCount != null && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">{inspect.ownerCount} pronar</span>
                      </div>
                    )}
                    {inspect.accidentCount != null && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border ${
                        inspect.accidentCount > 0
                          ? 'bg-red-900/20 border-red-500/30 text-red-300'
                          : 'bg-green-900/20 border-green-500/30 text-green-300'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                        {inspect.accidentCount > 0
                          ? `${inspect.accidentCount} aksident`
                          : 'Asnjë aksident'}
                      </div>
                    )}
                  </div>
                  <AccidentDiagram damage={inspect.damage} />
                </>
              ) : (
                <div className="flex items-start gap-3 text-sm text-gray-500">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-600" />
                  <div>
                    <p className="text-gray-400 font-medium">Raporti i inspektimit</p>
                    <p className="text-xs mt-0.5">
                      Raporti i detajuar disponohet pas blerjes.
                      Kontaktoni ekipin tonë për informacione të plota për gjendjen e mjetit.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Price + Contact */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-[#0d0d1c] border border-white/5 rounded-2xl p-6 sticky top-32">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">Çmimi</p>

              {eurBase > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-white">{fmtEur(eurBase)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">Çmimi bazë (Korea)</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deri në Durrës</span>
                      <span className="text-gray-300 font-semibold">
                        {fmtEur(eurDurres)}
                        <span className="text-gray-600 font-normal text-xs"> +€{DELIVERY_DURRES}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deri në Prishtinë</span>
                      <span className="text-gray-300 font-semibold">
                        {fmtEur(eurPrishtina)}
                        <span className="text-gray-600 font-normal text-xs"> +€{DELIVERY_PRISHTINA}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 pt-2">
                    * Çmimi bazë nga Encar Korea. Çmimet finale përfshijnë transport, dogana dhe taksa. Kontaktoni për ofertë personale.
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Kontaktoni për çmimin aktual</p>
              )}

              {/* CTA buttons */}
              <div className="mt-6 space-y-3">
                <a
                  href={`https://wa.me/${WHATSAPP.replace('+','')}?text=${encodeURIComponent(`Jam i interesuar për: ${title} ${subtitle} (${year}) - Encar ID: ${car.Id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-3"
                  style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Kontakto me WhatsApp
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="btn-ghost w-full py-3 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Thirr Shitësin
                </a>
              </div>

              {/* Encar link */}
              {car.Id && (
                <a
                  href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${car.Id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Shiko listimin origjinal në Encar
                </a>
              )}
            </div>

            {/* Inspection notice */}
            <div className="bg-blue-950/20 border border-blue-500/15 rounded-2xl p-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-300">Shërbimi i Inspektimit</p>
                  <p className="text-xs text-blue-400/60 mt-1">
                    Ofrojmë inspektim profesional të mjetit para blerjes.
                    Kontaktoni ekipin tonë për detaje.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
