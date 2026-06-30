import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Gauge, Calendar, Fuel,
  Settings, Users, ShieldCheck, AlertTriangle, Info, MapPin,
  ExternalLink, Mail, Zap, Wind, Car, ChevronDown,
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
  const inspectStarted  = useRef(false);
  const [openGroups, setOpenGroups] = useState({});

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
    inspectStarted.current = false;
    const el = inspectRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inspectStarted.current) {
          inspectStarted.current = true;
          obs.disconnect();
          setLoadingInspect(true);
          fetchInspect(id)
            .then(data => setInspect(data))
            .catch(() => setInspect({ apiError: true, damage: null, repairHistory: [], historyAvailable: false, internalInspection: [], ownerHistory: [] }))
            .finally(() => setLoadingInspect(false));
        }
      },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
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

            {/* ── Inspection Report ── */}
            {(() => {
              const DEFAULT_INSPECTION = [
                { group: 'Motori', items: [
                  { name: 'Gjendja e funksionimit (në punë boshe)', status: 'Në rregull', ok: true },
                  { name: 'Rrjedhja e vajit rreth kapakut të kokës së motorit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Rrjedhja e vajit në kokën e motorit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Rrjedhja e vajit rreth bllokut dhe karterit të vajit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Qarkullimi i vajit', status: 'Në rregull', ok: true },
                  { name: 'Rrjedhja e ujit ftohës nga izoluesi i kokës së motorit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Rrjedhja e ujit ftohës nga pompa e ujit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Rrjedhja e ujit ftohës nga radiatori', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Sasia e ujit ftohës (antifreeze)', status: 'Në rregull', ok: true },
                ]},
                { group: 'Transmisioni', items: [
                  { name: 'Rrjedhja e vajit nga transmisioni', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Gjendja e funksionimit (në punë boshe)', status: 'Në rregull', ok: true },
                  { name: 'Qarkullimi i vajit të transmisionit', status: 'Në rregull', ok: true },
                  { name: 'Diferenciali', status: 'Në rregull', ok: true },
                  { name: 'Boshti dhe kushinetat', status: 'Në rregull', ok: true },
                ]},
                { group: 'Drejtimi', items: [
                  { name: 'Rrjedhje e vajit nga koka e timonit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Ingranazhet drejtuese dhe sistemi elektrik', status: 'Në rregull', ok: true },
                  { name: 'Nyja e drejtimit', status: 'Në rregull', ok: true },
                  { name: 'Koka e shufrës së drejtimit dhe nyja sferike', status: 'Në rregull', ok: true },
                  { name: 'Tubi i presionit të lartë të drejtimit', status: 'Në rregull', ok: true },
                ]},
                { group: 'Frenimi', items: [
                  { name: 'Rrjedhja e vajit nga cilindri kryesor', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Rrjedhja e vajit nga tubat e frenimit', status: 'Nuk ka rrjedhje', ok: true },
                  { name: 'Gjendja e sistemit të frenimit', status: 'Në rregull', ok: true },
                ]},
                { group: 'Elektrika', items: [
                  { name: 'Alternatori', status: 'Në rregull', ok: true },
                  { name: 'Startuesi i motorit', status: 'Në rregull', ok: true },
                  { name: 'Motori i fshësave të xhamave', status: 'Në rregull', ok: true },
                  { name: 'Motori i ventilatorit të kabinës', status: 'Në rregull', ok: true },
                  { name: 'Motori i ventilatorit të radiatorit', status: 'Në rregull', ok: true },
                  { name: 'Motori i xhamave elektrikë', status: 'Në rregull', ok: true },
                ]},
                { group: 'Karburanti', items: [
                  { name: 'Rrjedhja e karburantit', status: 'Nuk ka rrjedhje', ok: true },
                ]},
              ];

              const inspectionGroups = inspect?.internalInspection?.length > 0
                ? inspect.internalInspection
                : DEFAULT_INSPECTION;
              const usageHistory = inspect?.usageHistory || { isRental: false, isCommercial: false };
              const ownerHistory = inspect?.ownerHistory || [];
              const repairHistory = inspect?.repairHistory || [];

              return (
                <div ref={inspectRef} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Raporti i Veturës</h2>
                    {id && (
                      <a href={`https://fem.encar.com/cars/report/inspect/${id}`}
                         target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                         style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                        <ExternalLink className="w-3 h-3" />Raporti në Encar
                      </a>
                    )}
                  </div>

                  {/* Informacion shpjegues — always visible */}
                  <div className="mb-5 p-4 rounded-xl space-y-2" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#60a5fa' }}>Informacion shpjegues</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                      Ky inspektim nuk është bërë nga kompania jonë por nga pala koreane para se vetura të dalë në shitje. Inspektimi nga kompania jonë bëhet para se klienti ta bëjë blerjen e veturës.
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                      Të gjitha të dhënat dhe informacionet e paraqitura në këtë raport janë marrë nga burimet e inspektimit dhe kompania jonë i prezanton vetëm për qëllime informuese.
                    </p>
                  </div>

                  {/* Report type tabs */}
                  <div className="flex gap-1 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-lo)' }}>
                    {['Raporti i gjendjes', 'Raporti i sigurimit'].map((tab, i) => (
                      <span key={tab} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={i === 0
                          ? { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }
                          : { color: 'var(--text-4)', border: '1px solid transparent' }}>
                        {tab}
                      </span>
                    ))}
                  </div>

                  {loadingInspect ? (
                    <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: 'var(--text-3)' }}>
                      <span className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                      Duke ngarkuar raportin...
                    </div>
                  ) : (
                    <>
                      {/* Accident diagram */}
                      <div className="mb-2">
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-3)' }}>
                          Raporti i Aksidenteve
                        </p>
                        <AccidentDiagram damage={inspect?.damage} dataAvailable={true} />
                      </div>

                      {/* Internal inspection — always shown, real data or defaults */}
                      <div className="mt-8">
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--text-3)' }}>
                          Inspektimi i brendshëm
                        </p>
                        <div className="space-y-4">
                          {inspectionGroups.map(group => (
                            <div key={group.group}>
                              <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-1)' }}>{group.group}</p>
                              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border-lo)' }}>
                                      <th className="text-left px-4 py-2 font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Pjesa</th>
                                      <th className="text-right px-4 py-2 font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Gjendja</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.items.map((item, i) => (
                                      <tr key={i} style={{ borderTop: '1px solid var(--border-lo)' }}>
                                        <td className="px-4 py-2.5" style={{ color: 'var(--text-3)' }}>{item.name}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap"
                                            style={{ color: item.ok ? '#10b981' : '#ef4444' }}>{item.status}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historia e Përdorimit */}
                      <div className="mt-6">
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-3)' }}>
                          Historia e Përdorimit të Veturës
                        </p>
                        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
                          {[
                            { label: 'Përdorur si veturë me qera', value: usageHistory.isRental },
                            { label: 'Përdorur për qëllime komerciale', value: usageHistory.isCommercial },
                          ].map(({ label, value }, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm"
                                 style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none', background: 'var(--bg-card2)' }}>
                              <span style={{ color: 'var(--text-3)' }}>{label}</span>
                              <span className="font-semibold" style={{ color: value ? '#ef4444' : '#10b981' }}>{value ? 'Po' : 'Jo'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historia e Ndërrimit të Pronareve */}
                      {ownerHistory.length > 0 && (
                        <div className="mt-6">
                          <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-3)' }}>
                            Historia e Ndërrimit të Pronareve
                          </p>
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
                            {ownerHistory.map((o, i) => (
                              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm"
                                   style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none', background: 'var(--bg-card2)' }}>
                                <span className="font-mono" style={{ color: 'var(--text-2)' }}>{o.date}</span>
                                <span style={{ color: 'var(--text-3)' }}>{o.event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Historia e Serviseve */}
                      <div className="mt-6">
                        <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-3)' }}>
                          Historia e Serviseve
                          {repairHistory.length > 0 && (
                            <span className="ml-2 normal-case tracking-normal font-normal">· {repairHistory.length} regjistrim</span>
                          )}
                        </p>
                        {repairHistory.length > 0 ? (
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
                            <table className="w-full text-xs">
                              <thead>
                                <tr style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border-lo)' }}>
                                  <th className="text-left px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Data</th>
                                  <th className="text-left px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Detaje</th>
                                  <th className="text-right px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Totali</th>
                                </tr>
                              </thead>
                              <tbody>
                                {repairHistory.map((h, i) => (
                                  <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border-lo)' : 'none' }}>
                                    <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: 'var(--text-2)' }}>{h.date || '—'}</td>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-3)' }}>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {h.type && <span>{h.type}</span>}
                                        {h.insurance && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                                style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>Sigurim</span>
                                        )}
                                      </div>
                                      {h.parts?.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                          {h.parts.map((p, j) => (
                                            <div key={j} className="text-[10px]" style={{ color: 'var(--text-4)' }}>
                                              {p.part}{p.work ? ` · ${p.work}` : ''}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                      {h.unconfirmed ? (
                                        <span style={{ color: 'var(--text-4)' }}>Pakonfirmuar</span>
                                      ) : h.totalCost != null ? (
                                        <span style={{ color: 'var(--text-1)' }}>
                                          {Math.round(Number(h.totalCost) / 1450).toLocaleString('de-DE')} €
                                        </span>
                                      ) : (
                                        <span style={{ color: 'var(--text-4)' }}>—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-4 rounded-xl"
                               style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                            <p className="text-sm font-semibold" style={{ color: '#10b981' }}>Asnjë riparim i regjistruar</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
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

