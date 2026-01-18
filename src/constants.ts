// Stałe na rok 2026

// Wynagrodzenia bazowe
export const MINIMUM_WAGE = 4806; // płaca minimalna 2026
export const AVERAGE_WAGE = 9420; // prognozowane przeciętne wynagrodzenie 2026
export const ENTERPRISE_WAGE_Q4_2024 = 8549.18; // przeciętne w sektorze przedsiębiorstw (IV kw. 2024) - GUS

// Składki społeczne - MAŁY ZUS
export const SMALL_ZUS_BASE = 1441.8;
export const SMALL_ZUS = {
  emerytalna: 281.44,
  rentowa: 115.34,
  chorobowa: 35.32, // dobrowolna
  wypadkowa: 24.08,
  funduszPracy: 0, // podstawa < min. wynagrodzenia
  razem: 420.86, // bez chorobowej
  razemZChorobowa: 456.18,
} as const;

// Składki społeczne - DUŻY ZUS
export const BIG_ZUS_BASE = 5652.0;
export const BIG_ZUS = {
  emerytalna: 1103.27,
  rentowa: 452.16,
  chorobowa: 138.47, // dobrowolna
  wypadkowa: 94.4,
  funduszPracy: 138.47,
  razem: 1788.3, // bez chorobowej
  razemZChorobowa: 1926.77,
} as const;

// Maksymalna podstawa składki chorobowej (250% przeciętnego wynagrodzenia)
export const MAX_ZUS_BASE = AVERAGE_WAGE * 2.5; // 23 550 zł w 2026

// Stawki składek społecznych (procenty)
export const ZUS_RATES = {
  emerytalna: 0.1952, // 19,52%
  rentowa: 0.08, // 8%
  chorobowa: 0.0245, // 2,45%
  wypadkowa: 0.0167, // 1,67%
  funduszPracy: 0.0245, // 2,45%
} as const;

// Składka zdrowotna
export const MIN_HEALTH_CONTRIBUTION = 432.54; // od 1 lutego 2026 (9% * 4806)
export const HEALTH_RATE = 0.09; // 9%

// Składka zdrowotna RYCZAŁT (podstawy wg progów przychodu rocznego)
export const HEALTH_RYCZALT = {
  // Próg do 60 000 zł przychodu rocznie
  threshold1: {
    maxRevenue: 60000,
    base: 5129.51, // 60% * 8549.18
    monthly: 461.66, // 9% * 5129.51
  },
  // Próg 60 000 - 300 000 zł przychodu rocznie
  threshold2: {
    maxRevenue: 300000,
    base: 8549.18, // 100% * 8549.18
    monthly: 769.43, // 9% * 8549.18
  },
  // Próg powyżej 300 000 zł przychodu rocznie
  threshold3: {
    base: 15388.52, // 180% * 8549.18
    monthly: 1384.97, // 9% * 15388.52
  },
} as const;

// Progi podatkowe (Skala)
export const TAX_THRESHOLD = 120000;
export const TAX_RATE_LOW = 0.12; // 12%
export const TAX_RATE_HIGH = 0.32; // 32%
export const TAX_FREE_REDUCTION = 3600; // kwota zmniejszająca podatek (30000 * 12%)

// Ryczałt
export const RYCZALT_RATE = 0.12; // 12% dla IT
export const RYCZALT_HEALTH_DEDUCTION = 0.5; // 50% składki zdrowotnej można odliczyć

// Nazwy miesięcy
export const MONTH_NAMES = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
] as const;
