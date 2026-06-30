import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Gauge, Calendar, Fuel,
  Settings, Users, ShieldCheck, AlertTriangle, Info, MapPin,
  ExternalLink, Mail, Zap, Wind, Car, ChevronDown, ChevronRight, X,
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery.jsx';
import AccidentDiagram from '../components/AccidentDiagram.jsx';
import CarCard from '../components/CarCard.jsx';
import {
  carYear, manwonToEur, durresPrice, pristinePrice,
  fmtEur, fmtKm, allPhotoUrls, tr, trCity,
} from '../lib/utils.js';
import { translateFuel, translateTrans, translateOption, translateColor } from '../lib/translations.js';
import { useCountry } from '../contexts/CountryContext.jsx';
import { fetchInspect } from '../lib/inspectClient.js';

const WHATSAPP    = '38349644168';
const PHONE       = '+383 49 644 168';
const PHONE_DISP  = '049 644 168';
const EMAIL       = 'shendillapashtica@gmail.com';

const MONTHS_ALB = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj'];

function getMonth(yearField) {
  const s = String(yearField || '');
  if (s.length === 6) {
    const m = parseInt(s.slice(4, 6));
    return m >= 1 && m <= 12 ? MONTHS_ALB[m - 1] : null;
  }
  return null;
}

function Row({ label, value, mono, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start py-2.5" style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <span className="text-xs w-40 flex-shrink-0 pt-0.5" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''}`}
        style={{ color: highlight ? '#60a5fa' : 'var(--text-2)' }}>
        {value}
      </span>
    </div>
  );
}

export default function CarDetail() {
  const { id }    = useParams();
  const { state } = useLocation();
  const { priceFor, country } = useCountry();

  // useState initializer runs fresh on each mount (guaranteed by key={id} in App.jsx)
  const [car, setCar]           = useState(state?.car || null);
  const [inspect, setInspect]   = useState(null);
  const [similar, setSimilar]   = useState([]);
  const [loadingCar, setLoadingCar]         = useState(!state?.car);
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [error, setError]       = useState(null);
  const inspectRef      = useRef(null);
  const [openGroups, setOpenGroups] = useState({});
  const [inspModal, setInspModal] = useState(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

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
  }, [id, car]);

  useEffect(() => {
    if (!id) return;
    setLoadingInspect(true);
    fetchInspect(id)
      .then(data => setInspect(data))
      .catch(() => setInspect({
        apiError: true, damage: null, repairHistory: [],
        historyAvailable: false, internalInspection: [],
        ownerHistory: [], usageHistory: null
      }))
      .finally(() => setLoadingInspect(false));
  }, [id]);

  useEffect(() => {
    if (!car?.Manufacturer) return;
    fetch(`/api/cars?manufacturer=${encodeURIComponent(car.Manufacturer)}&count=16`)
      .then(r => r.json())
      .then(data => {
        const results = (data.results || []).filter(c => String(c.Id) !== String(id));
        setSimilar(results.slice(0, 16));
      })
      .catch(() => {});
  }, [car?.Manufacturer, id]);

  if (loadingCar) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !car) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-page)' }}>
      <p style={{ color: 'var(--text-3)' }}>Makina nuk u gjet.</p>
      <Link to="/" className="text-blue-400 hover:underline text-sm">← Kthehu</Link>
    </div>
  );

  const year         = carYear(car);
  const month        = getMonth(car.Year);
  const regDate      = month && year ? `${month} ${year}` : year;
  const fuel         = translateFuel(car.FuelType);
  const trans        = translateTrans(car.Transmission);
  const color        = translateColor(car.Color || car.Spec?.Color);
  const manufacturer = tr(car.Manufacturer);
  const model        = tr(car.Model);
  const badge        = tr(car.Badge);
  const badgeDetail  = tr(car.BadgeDetail);
  const subtitle     = [badge, badgeDetail].filter(Boolean).join(' · ');
  const city         = trCity(car.OfficeCityState);

  const photos       = allPhotoUrls(car);
  const options      = car.OptionList || car.Options || [];
  const displacement = car.Spec?.Displacement || car.CylinderCapacity;
  const seats        = car.Spec?.Seats || car.Seats;
  const vin          = car.Spec?.Vin || car.Vin || car.VinCode;
  const drive        = car.Spec?.Drive || car.Drive || car.DriveType;
  const doors        = car.Spec?.Doors || car.Doors;
  const bodyType     = car.Spec?.BodyType || car.BodyType;
  const maxPower     = car.Spec?.MaxPower;
  const maxTorque    = car.Spec?.MaxTorque;
  const fuelEff      = car.Spec?.FuelEfficiency;
  const weight       = car.Spec?.Weight;
  const length       = car.Spec?.Length;
  const width        = car.Spec?.Width;

  const eurBase  = manwonToEur(car.Price);
  const eurMain  = priceFor(car.Price);
  const eurOther = country === 'AL' ? pristinePrice(car.Price) : durresPrice(car.Price);
  const otherCity = country === 'AL' ? 'Prishtinë' : 'Durrës';

  const waMsg = encodeURIComponent(
    `Jam i interesuar për: ${manufacturer} ${model} ${badge} (${year}) — Encar ID: ${id}`
  );

  const conditions = car.Condition || [];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-page)' }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-11 flex items-center gap-3 text-sm">
          <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-blue-400" style={{ color: 'var(--text-3)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />Kthehu
          </Link>
          <span style={{ color: 'var(--text-4)' }}>/</span>
          <span className="truncate" style={{ color: 'var(--text-2)' }}>{manufacturer} {model}</span>
          {id && (
            <a href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`}
               target="_blank" rel="noopener noreferrer"
               className="ml-auto flex items-center gap-1 text-xs transition-colors hover:text-blue-400"
               style={{ color: 'var(--text-3)' }}>
              <ExternalLink className="w-3 h-3" />Encar
            </a>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <div className="space-y-6">

            {/* Gallery */}
            {photos.length > 0
              ? <ImageGallery photos={photos} alt={`${manufacturer} ${model}`} />
              : <div className="rounded-2xl flex items-center justify-center h-64"
                     style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-3)' }}>Foto nuk disponohet</span>
                </div>
            }

            {/* ── Price Card — right below gallery ── */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Main price block */}
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-1 font-mono" style={{ color: 'var(--text-3)' }}>
                    Çmimi deri në {country === 'AL' ? 'Durrës' : 'Prishtinë'} 🇽🇰
                  </p>
                  <p className="text-4xl font-extrabold tracking-tight font-mono" style={{ color: 'var(--text-1)' }}>
                    {eurBase > 0 ? fmtEur(eurMain) : '—'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Transport + doganë të përfshira</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
                    <span>🇰🇷 Korea: <strong style={{ color: 'var(--text-2)' }}>{eurBase > 0 ? fmtEur(eurBase) : '—'}</strong></span>
                    <span>📍 {otherCity}: <strong style={{ color: 'var(--text-2)' }}>{eurBase > 0 ? fmtEur(eurOther) : '—'}</strong></span>
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--text-4)' }}>
                    * Çmimi bazë + transport + doganë. Për çmim final kontaktoni.
                  </p>
                </div>
                {/* CTA buttons */}
                <div className="flex flex-col gap-2 sm:w-56 flex-shrink-0">
                  <a href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
                     target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 active:scale-95"
                     style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
                    <MessageCircle className="w-4 h-4" />WhatsApp
                  </a>
                  <a href="tel:+38349644168"
                     className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all btn-ghost">
                    <Phone className="w-4 h-4" />{PHONE_DISP}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 text-xs" style={{ borderTop: '1px solid var(--border-lo)', color: 'var(--text-3)' }}>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />Shërbim Inspektimi Profesional</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />Transport i Siguruar Deri Te Ju</span>
                {id && (
                  <a href={`https://www.encar.com/dc/dc_cardetailview.do?carid=${id}`}
                     target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1 hover:text-blue-400 transition-colors ml-auto">
                    <ExternalLink className="w-3.5 h-3.5" />Shiko origjinalin Encar
                  </a>
                )}
              </div>
            </div>

            {/* Title + status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-500/70 font-semibold mb-1">{manufacturer}</p>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>{model}</h1>
                {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{subtitle}</p>}
              </div>
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {conditions.map(c => (
                    <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {c === 'Inspection' ? '✓ Inspektuar' : c === 'Warranty' ? '✓ Garanci' : c === 'Record' ? '✓ Histori' : c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {[
                year && { icon: Calendar, label: regDate || year },
                car.Mileage != null && { icon: Gauge, label: fmtKm(car.Mileage) },
                fuel && { icon: Fuel, label: fuel },
                trans && { icon: Settings, label: trans },
                displacement && { icon: Zap, label: `${Number(displacement).toLocaleString('de-DE')} cc` },
                drive && { icon: Wind, label: drive },
                city && { icon: MapPin, label: city },
                bodyType && { icon: Car, label: bodyType },
              ].filter(Boolean).map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />{label}
                </span>
              ))}
            </div>

            {/* Inspection highlight */}
            {inspect && (inspect.ownerCount != null || inspect.accidentCount != null) && (
              <div className="flex flex-wrap gap-3">
                {inspect.ownerCount != null && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                       style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                    <Users className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                    <span style={{ color: 'var(--text-2)' }}>
                      Pronarë: <strong style={{ color: 'var(--text-1)' }}>{inspect.ownerCount}</strong>
                    </span>
                  </div>
                )}
                {inspect.accidentCount != null && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border font-medium ${
                    inspect.accidentCount > 0
                      ? 'bg-red-900/15 border-red-500/25 text-red-300'
                      : 'bg-green-900/15 border-green-500/25 text-green-300'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    {inspect.accidentCount > 0
                      ? `${inspect.accidentCount} aksident i raportuar`
                      : '✓ Asnjë aksident'}
                  </div>
                )}
              </div>
            )}

            {/* ── Specifications ── */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                Specifikimet e Mjetit
              </h2>
              <Row label="Marka"              value={manufacturer} />
              <Row label="Modeli"             value={model} />
              <Row label="Varianti"           value={subtitle || undefined} />
              <Row label="Viti Regjistrimit"  value={regDate || year} />
              <Row label="Kilometra"          value={car.Mileage != null ? fmtKm(car.Mileage) : undefined} />
              <Row label="Lloji Karburantit"  value={fuel} />
              <Row label="Transmisioni"       value={trans} />
              <Row label="Drivetrain"         value={drive} />
              <Row label="Motori (cc)"        value={displacement ? `${Number(displacement).toLocaleString('de-DE')} cc` : undefined} />
              {maxPower  && <Row label="Fuqi Maksimale"  value={maxPower} />}
              {maxTorque && <Row label="Tork Maksimal"   value={maxTorque} />}
              {fuelEff   && <Row label="Konsumi (km/L)"  value={fuelEff} />}
              <Row label="Tipi i Karrocerisë" value={bodyType} />
              {doors     && <Row label="Numri Dyerve"    value={String(doors)} />}
              <Row label="Numri Ulëseve"      value={seats} />
              <Row label="Ngjyra"             value={color !== '—' ? color : undefined} />
              <Row label="Lokacioni (KR)"     value={city} />
              {weight    && <Row label="Pesha (kg)"      value={`${Number(weight).toLocaleString('de-DE')} kg`} />}
              {length    && <Row label="Gjatësia (mm)"   value={`${Number(length).toLocaleString('de-DE')} mm`} />}
              {vin       && <Row label="Numri Shasisë"   value={vin} mono />}
              {id        && <Row label="ID Encar"        value={String(id)} mono highlight />}
            </div>

            {/* ── Options ── */}
            {options.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                  Opsionet e Mjetit
                  <span className="ml-2 normal-case tracking-normal font-normal text-xs" style={{ color: 'var(--text-4)' }}>
                    {options.length} gjithsej
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 flex-shrink-0" />
                      <span style={{ color: 'var(--text-2)' }}>{translateOption(opt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Raporti i Veturës ── */}
            <div ref={inspectRef} className="rounded-2xl overflow-hidden"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

              {/* Header */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-lo)' }}>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                  Raporti i Veturës
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                  Inspektim zyrtar · Encar Korea
                </p>
              </div>

              <div className="p-5">
                {loadingInspect ? (
                  <div className="flex items-center gap-2 py-8 justify-center"
                       style={{ color: 'var(--text-3)' }}>
                    <span className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">Duke ngarkuar raportin...</span>
                  </div>
                ) : (
                  <>
                    {/* 1. Accident diagrams */}
                    <AccidentDiagram
                      damage={inspect?.damage}
                      dataAvailable={!inspect?.apiError && inspect?.damage !== null}
                    />

                    {/* 2. Tab pills */}
                    <div className="flex gap-2 mt-5 mb-5">
                      {['Raporti i gjendjes', 'Raporti i sigurimit'].map((label, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={i === 0
                            ? { background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                                border: '1px solid rgba(59,130,246,0.3)' }
                            : { color: 'var(--text-4)', border: '1px solid var(--border-lo)' }}>
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* 3. Inspektimi i brendshëm — accordion groups */}
                    {inspect?.internalInspection?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                           style={{ color: 'var(--text-3)' }}>
                          Inspektimi i brendshëm
                        </p>
                        <div className="space-y-1">
                          {inspect.internalInspection.map(group => (
                            <div key={group.group} className="rounded-xl overflow-hidden"
                                 style={{ border: '1px solid var(--border-lo)' }}>
                              <button
                                onClick={() => setOpenGroups(prev => ({
                                  ...prev, [group.group]: !prev[group.group]
                                }))}
                                className="w-full flex items-center justify-between px-4 py-3"
                                style={{ background: 'var(--bg-card2)', color: 'var(--text-1)' }}>
                                <span className="text-sm font-semibold">{group.group}</span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${openGroups[group.group] ? 'rotate-180' : ''}`}
                                  style={{ color: 'var(--text-3)' }} />
                              </button>
                              {openGroups[group.group] && (
                                <table className="w-full text-xs"
                                       style={{ background: 'var(--bg-card)' }}>
                                  <thead>
                                    <tr style={{ borderTop: '1px solid var(--border-lo)' }}>
                                      <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider font-semibold"
                                          style={{ color: 'var(--text-4)' }}>Pjesa</th>
                                      <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider font-semibold"
                                          style={{ color: 'var(--text-4)' }}>Gjendja</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.items.map((item, i) => (
                                      <tr key={i} style={{ borderTop: '1px solid var(--border-lo)' }}>
                                        <td className="px-4 py-2.5"
                                            style={{ color: 'var(--text-3)' }}>{item.name}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold"
                                            style={{ color: item.ok ? '#10b981' : '#ef4444' }}>
                                          {item.status}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Historia e perdorimit te vetures */}
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                         style={{ color: 'var(--text-3)' }}>
                        Historia e Përdorimit të Veturës
                      </p>
                      <div className="rounded-xl overflow-hidden"
                           style={{ border: '1px solid var(--border-lo)' }}>
                        {[
                          { label: 'Përdorur si veturë me qera',
                            value: inspect?.usageHistory?.isRental ? 'Po' : 'Jo',
                            bad: inspect?.usageHistory?.isRental },
                          { label: 'Përdorur për qëllime komerciale',
                            value: inspect?.usageHistory?.isCommercial ? 'Po' : 'Jo',
                            bad: inspect?.usageHistory?.isCommercial },
                        ].map(({ label, value, bad }, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 text-sm"
                               style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none',
                                        background: 'var(--bg-card2)' }}>
                            <span style={{ color: 'var(--text-3)' }}>{label}</span>
                            <span className="font-semibold"
                                  style={{ color: bad ? '#ef4444' : '#10b981' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Historia e nderrimit te pronareve */}
                    {inspect?.ownerHistory?.length > 0 && (
                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                           style={{ color: 'var(--text-3)' }}>
                          Historia e Ndërrimit të Pronareve
                        </p>
                        <div className="rounded-xl overflow-hidden"
                             style={{ border: '1px solid var(--border-lo)' }}>
                          {inspect.ownerHistory.map((o, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm"
                                 style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none',
                                          background: 'var(--bg-card2)' }}>
                              <span className="font-mono text-xs"
                                    style={{ color: 'var(--text-2)' }}>{o.date}</span>
                              <span style={{ color: 'var(--text-3)' }}>{o.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. Historia e Serviseve */}
                    {inspect?.repairHistory?.length > 0 && (
                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                           style={{ color: 'var(--text-3)' }}>
                          Historia e Serviseve · {inspect.repairHistory.length} regjistrim
                        </p>
                        <div className="rounded-xl overflow-hidden"
                             style={{ border: '1px solid var(--border-lo)' }}>
                          {inspect.repairHistory.map((h, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3"
                                 style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none',
                                          background: 'var(--bg-card2)' }}>
                              <div>
                                <span className="font-mono text-xs"
                                      style={{ color: 'var(--text-2)' }}>{h.date || '—'}</span>
                                {h.insurance && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                                        style={{ background: 'rgba(59,130,246,0.12)',
                                                 color: '#60a5fa' }}>Sigurim</span>
                                )}
                              </div>
                              <span className="text-xs font-semibold"
                                    style={{ color: 'var(--text-1)' }}>
                                {h.totalCost
                                  ? `${Math.round(Number(h.totalCost)/1450).toLocaleString('de-DE')} €`
                                  : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback link if no data loaded */}
                    {inspect?.apiError && (
                      <div className="mt-4 text-center">
                        <a href={`https://fem.encar.com/cars/report/inspect/${id}`}
                           target="_blank" rel="noopener noreferrer"
                           className="text-xs"
                           style={{ color: 'var(--text-4)' }}>
                          Shiko raportin e plotë direkt në Encar ↗
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
        </div>

        {/* ── Similar Cars ── */}
        {similar.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
                Makina të ngjashme ·{' '}
                <span className="text-blue-400">{manufacturer}</span>
              </h2>
              <Link
                to={`/?brand=${encodeURIComponent(manufacturer)}`}
                className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Shiko të gjitha →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {similar.map(c => <CarCard key={c.Id} car={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

