// 1 만원 = 10,000 KRW; 1 EUR ≈ 1450 KRW
const KRW_PER_EUR = 1450;

export function manwonToEur(manwon) {
  if (!manwon) return 0;
  return Math.round((manwon * 10000) / KRW_PER_EUR);
}

export function fmtEur(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fmtKm(km) {
  if (!km && km !== 0) return '—';
  return new Intl.NumberFormat('de-DE').format(km) + ' km';
}

export function carYear(car) {
  if (car.FormYear) return parseInt(car.FormYear);
  if (!car.Year) return null;
  const n = parseInt(car.Year);
  if (n > 100) return n;
  return n >= 0 && n <= 30 ? 2000 + n : 1900 + n;
}

export function carPhotoUrl(car, idx = 0) {
  // Full URL in Photo field
  if (car.Photo && car.Photo.startsWith('http')) return car.Photo;
  // Relative suffix: "17/car42175964/001.jpg"
  if (car.Photo) return 'https://ci.encar.com/carpicture' + car.Photo;
  // Photos array (detail endpoint)
  if (Array.isArray(car.Photos) && car.Photos[idx]) {
    const p = car.Photos[idx];
    if (typeof p === 'string') return p.startsWith('http') ? p : 'https://ci.encar.com/carpicture' + p;
    if (p.location) return p.location;
    if (p.url) return p.url;
  }
  // Construct from ID + year
  const yr = carYear(car) || 2020;
  const yy = String(yr).slice(-2);
  const num = String(idx + 1).padStart(3, '0');
  return `https://ci.encar.com/carpicture${yy}/car${car.Id}/${num}.jpg`;
}

export function allPhotoUrls(car, max = 20) {
  const yr = carYear(car) || 2020;
  const yy = String(yr).slice(-2);
  if (Array.isArray(car.Photos) && car.Photos.length > 0) {
    return car.Photos.slice(0, max).map((p, i) => {
      if (typeof p === 'string') return p.startsWith('http') ? p : 'https://ci.encar.com/carpicture' + p;
      return p.location || p.url || carPhotoUrl(car, i);
    });
  }
  return Array.from({ length: max }, (_, i) =>
    `https://ci.encar.com/carpicture${yy}/car${car.Id}/${String(i + 1).padStart(3, '0')}.jpg`
  );
}
