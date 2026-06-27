export const FUEL_ALB = {
  '가솔린': 'Benzinë', Gasoline: 'Benzinë', gasoline: 'Benzinë',
  '디젤': 'Naftë', Diesel: 'Naftë', diesel: 'Naftë',
  '전기': 'Elektrik', Electric: 'Elektrik', electric: 'Elektrik',
  '하이브리드': 'Hibrid', Hybrid: 'Hibrid', hybrid: 'Hibrid',
  '가솔린+전기': 'Hibrid (Plug-in)', 'Plug-in Hybrid': 'Hibrid (Plug-in)',
  LPG: 'LPG', lpg: 'LPG',
};

export const TRANS_ALB = {
  '오토': 'Automatik', Automatic: 'Automatik', automatic: 'Automatik',
  '수동': 'Manual', Manual: 'Manual', manual: 'Manual',
  '세미오토': 'Semi-Automatik',
  DCT: 'DCT',
};

export const DRIVE_ALB = {
  '2WD': 'FWD / RWD',
  '4WD': 'AWD',
  FWD: 'FWD',
  RWD: 'RWD',
  AWD: 'AWD',
};

export const OPTION_ALB = {
  '썬루프': 'Sunroof',
  '파노라마선루프': 'Çati Panoramike',
  '전동시트(운전)': 'Sedilje Elektrike (Shofer)',
  '전동시트(동승)': 'Sedilje Elektrike (Pasagjer)',
  '열선시트(전)': 'Sedilje të Ngrohura (Para)',
  '열선시트(후)': 'Sedilje të Ngrohura (Pas)',
  '통풍시트(운전)': 'Sedilje me Ajrim (Shofer)',
  '통풍시트(동승)': 'Sedilje me Ajrim (Pasagjer)',
  '메모리시트(운전)': 'Sedilje me Memorje (Shofer)',
  '메모리시트(동승)': 'Sedilje me Memorje (Pasagjer)',
  '네비게이션': 'Navigacion',
  '블루투스': 'Bluetooth',
  '후방카메라': 'Kamera Mbrapa',
  '전방카메라': 'Kamera Përpara',
  '어라운드뷰': 'Kamera 360°',
  '스마트키': 'Çelës i Mençur',
  '전자식사이드브레이크(EPB)': 'Frena Elektrike e Parkimit (EPB)',
  'ABS': 'ABS',
  'TCS': 'Sistem Kundër Rrëshqitjes (TCS)',
  'ESC': 'Kontroll Stabiliteti (ESC)',
  'TPMS': 'Sensor Presioni i Gomave (TPMS)',
  '사이드에어백': 'Airbag Anësor',
  '에어백': 'Airbag',
  '파워윈도우': 'Dritare Elektrike',
  '오토라이트': 'Ndezja Automatike e Dritave',
  '열선핸들': 'Timoni i Ngrohur',
  '전동조절(핸들)': 'Timoni i Rregullueshëm Elektrik',
  '스티어링리모컨': 'Komanda në Timon',
  '전동트렁크': 'Bagazh Elektrik',
  '전동사이드미러': 'Pasqyra Anësore Elektrike',
  '자동주차': 'Parkim Automatik',
  '전방주차센서': 'Sensorë Parkimi (Përpara)',
  '후방주차센서': 'Sensorë Parkimi (Mbrapa)',
  'HUD': 'Head-Up Display',
  '어댑티브크루즈': 'Cruise Control Adaptiv',
  '크루즈컨트롤': 'Cruise Control',
  '차선이탈경보': 'Alarm Largimi nga Shiriti',
  '자동긴급제동': 'Frenazh Emergjent Automatik (AEB)',
  '후측방경보': 'Alarm Anësor Mbrapa (BSD)',
  'ECM미러': 'Pasqyra ECM e Brendshme',
  '자동잠금': 'Mbyllje Elektrike e Dyerve',
  '키리스엔트리': 'Mbyllje Pa Çelës',
  '자동에어컨': 'Klimë Automatike',
  '듀얼에어컨': 'Klimë Duale',
  '이그니션스타트': 'Nisje pa Çelës (Start/Stop)',
  '전동접이미러': 'Pasqyra Anësore Elektrike (Palosje)',
  '후진기어': 'Kamera Mbrapa',
  '빌트인캠': 'Kamera e Integruar (BlackBox)',
  '하이패스': 'Kalim Automatik Tarif',
  '통합주차지원': 'Sistem Parkimi i Integruar',
  '360어라운드뷰': 'Kamera 360°',
  '후방주차': 'Sensorë Parkimi (Mbrapa)',
};

export function translateFuel(val) { return FUEL_ALB[val] || val || '—'; }
export function translateTrans(val) { return TRANS_ALB[val] || val || '—'; }
export function translateOption(val) { return OPTION_ALB[val] || val; }
export function translateDrive(val) { return DRIVE_ALB[val] || val || '—'; }

export const DAMAGE_CODES = {
  N: { label: 'Nderrim (Pjesë e re)', color: '#ef4444', bg: 'bg-red-500' },
  R: { label: 'Riparim (Llamarinë)', color: '#f97316', bg: 'bg-orange-500' },
  K: { label: 'Korrozion', color: '#a16207', bg: 'bg-yellow-700' },
  G: { label: 'Gervishtje', color: '#eab308', bg: 'bg-yellow-500' },
  P: { label: 'Parregullsi', color: '#6b7280', bg: 'bg-gray-500' },
  W: { label: 'Nderrim (Pjesë e re)', color: '#ef4444', bg: 'bg-red-500' },
  C: { label: 'Riparim (Llamarinë)', color: '#f97316', bg: 'bg-orange-500' },
  U: { label: 'Korrozion', color: '#a16207', bg: 'bg-yellow-700' },
  A: { label: 'Gervishtje', color: '#eab308', bg: 'bg-yellow-500' },
  T: { label: 'Parregullsi', color: '#6b7280', bg: 'bg-gray-500' },
};
