const KRW_TO_EUR = 0.00067; // 1 KRW ≈ €0.00067
const DELIVERY_DURRES = 350;
const DELIVERY_PRISHTINA = 700;

export { DELIVERY_DURRES, DELIVERY_PRISHTINA };

// Korean → English name mappings
const KO_EN = [
  ['더 뉴 ', 'The New '], ['더뉴 ', 'The New '], ['뉴 ', 'New '], [' 뉴', ' New'],
  ['GLE-클래스', 'GLE-Class'], ['GLC-클래스', 'GLC-Class'], ['C-클래스', 'C-Class'],
  ['E-클래스', 'E-Class'], ['S-클래스', 'S-Class'], ['A-클래스', 'A-Class'],
  ['B-클래스', 'B-Class'], ['CLA-클래스', 'CLA-Class'], ['CLS-클래스', 'CLS-Class'],
  ['GLA-클래스', 'GLA-Class'], ['GLB-클래스', 'GLB-Class'], ['GLS-클래스', 'GLS-Class'],
  ['G-클래스', 'G-Class'], ['클래스', 'Class'],
  ['5시리즈', '5 Series'], ['3시리즈', '3 Series'], ['7시리즈', '7 Series'],
  ['1시리즈', '1 Series'], ['2시리즈', '2 Series'], ['4시리즈', '4 Series'],
  ['6시리즈', '6 Series'], ['8시리즈', '8 Series'], ['시리즈', ' Series'],
  ['플러그인 하이브리드', 'Plug-in Hybrid'], ['플러그인', 'Plug-in'],
  ['하이브리드', 'Hybrid'], ['투어러', 'Tourer'], ['에디션', 'Edition'],
  ['스포츠', 'Sport'], ['프리미엄', 'Premium'], ['럭셔리', 'Luxury'],
  ['라인', 'Line'], ['익스클루시브', 'Exclusive'], ['컴포트', 'Comfort'],
  ['엘레강스', 'Elegance'], ['아방가르드', 'Avantgarde'], ['어드밴스드', 'Advanced'],
  ['모던', 'Modern'], ['디자인', 'Design'], ['패키지', 'Package'], ['팩키지', 'Package'],
  ['테크', 'Tech'], ['세단', 'Sedan'], ['쿠페', 'Coupe'], ['왜건', 'Wagon'],
  ['컨버터블', 'Convertible'], ['카브리올레', 'Cabriolet'], ['해치백', 'Hatchback'],
  ['SUV', 'SUV'], ['4WD', '4WD'], ['AWD', 'AWD'], ['FWD', 'FWD'], ['RWD', 'RWD'],
];

const MANUFACTURER_MAP = {
  '현대': 'Hyundai', '기아': 'Kia', '벤츠': 'Mercedes-Benz',
  '메르세데스-벤츠': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '포르쉐': 'Porsche', '렉서스': 'Lexus', '제네시스': 'Genesis',
  '쌍용': 'SsangYong', '르노삼성': 'Renault', '르노': 'Renault',
  '쉐보레': 'Chevrolet', '볼보': 'Volvo', '랜드로버': 'Land Rover',
  '미니': 'Mini', '도요타': 'Toyota', '혼다': 'Honda', '마세라티': 'Maserati',
  '페라리': 'Ferrari', '람보르기니': 'Lamborghini', '벤틀리': 'Bentley',
  '롤스로이스': 'Rolls-Royce', '푸조': 'Peugeot', '오펠': 'Opel',
  '시트': 'Seat', '스즈키': 'Suzuki', '닷지': 'Dodge', '재규어': 'Jaguar',
  '닛산': 'Nissan', '인피니티': 'Infiniti', '링컨': 'Lincoln', '캐딜락': 'Cadillac',
  '크라이슬러': 'Chrysler', '지프': 'Jeep', '포드': 'Ford', '볼보': 'Volvo',
  '스바루': 'Subaru', '미쓰비시': 'Mitsubishi',
};

export function tr(text) {
  if (!text) return '';
  let s = String(text);
  // Check manufacturer map first
  if (MANUFACTURER_MAP[s.trim()]) return MANUFACTURER_MAP[s.trim()];
  // Apply KO→EN replacements
  for (const [ko, en] of KO_EN) s = s.split(ko).join(en);
  // Remove remaining Korean characters
  s = s.replace(/[ᄀ-ᇿ㄰-㆏가-힯]+/g, '');
  return s.replace(/\s{2,}/g, ' ').trim();
}

// Photos: location = "/carpicture02/pic4212/42127613_001.jpg"
// Full URL = "https://ci.encar.com" + location
export function carPhotoUrl(car, idx = 0) {
  if (Array.isArray(car.Photos) && car.Photos[idx]?.location) {
    return 'https://ci.encar.com' + car.Photos[idx].location;
  }
  // Photo field is a path prefix: "/carpicture02/pic4212/42127613_"
  if (car.Photo) {
    return 'https://ci.encar.com' + car.Photo + '001.jpg';
  }
  return null;
}

export function allPhotoUrls(car) {
  if (Array.isArray(car.Photos) && car.Photos.length > 0) {
    return car.Photos.map(p => 'https://ci.encar.com' + p.location);
  }
  if (car.Photo) {
    return ['https://ci.encar.com' + car.Photo + '001.jpg'];
  }
  return [];
}

export function carYear(car) {
  // FormYear = "2015" (string) — most accurate display year
  if (car.FormYear) return String(car.FormYear).slice(0, 4);
  if (!car.Year) return null;
  const s = String(car.Year);
  // Year = 201405 (YYYYMM) or 2014 or 17 (old format)
  if (s.length >= 6) return s.slice(0, 4);
  const n = parseInt(s);
  if (n > 100) return String(n);
  return String(n >= 0 && n <= 30 ? 2000 + n : 1900 + n);
}

export function manwonToEur(manwon) {
  if (!manwon) return 0;
  return Math.round(manwon * 10000 * KRW_TO_EUR);
}

export function durresPrice(manwon) {
  return manwonToEur(manwon) + DELIVERY_DURRES;
}

export function pristinePrice(manwon) {
  return manwonToEur(manwon) + DELIVERY_PRISHTINA;
}

export function fmtEur(amount) {
  return '€' + Math.round(amount).toLocaleString('de-DE');
}

export function fmtKm(km) {
  if (!km && km !== 0) return '—';
  return Number(km).toLocaleString('de-DE') + ' km';
}
