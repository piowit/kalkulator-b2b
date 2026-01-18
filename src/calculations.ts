import {
  SMALL_ZUS,
  BIG_ZUS,
  MIN_HEALTH_CONTRIBUTION,
  HEALTH_RATE,
  HEALTH_RYCZALT,
  TAX_THRESHOLD,
  TAX_RATE_LOW,
  TAX_RATE_HIGH,
  TAX_FREE_REDUCTION,
  RYCZALT_RATE,
  RYCZALT_HEALTH_DEDUCTION,
} from './constants';
import type {
  ZusType,
  MonthData,
  MonthlyBreakdown,
  RyczaltResult,
  SkalaResult,
  CalculationResult,
} from './types';

/**
 * Oblicza miesięczną składkę społeczną na podstawie typu ZUS i opcji chorobowego
 */
export function getSocialContribution(
  zusType: ZusType,
  voluntarySickness: boolean
): number {
  switch (zusType) {
    case 'ulga_na_start':
      // Ulga na start = brak składek społecznych
      return 0;
    case 'maly_zus':
      return voluntarySickness ? SMALL_ZUS.razemZChorobowa : SMALL_ZUS.razem;
    case 'duzy_zus':
      return voluntarySickness ? BIG_ZUS.razemZChorobowa : BIG_ZUS.razem;
    default:
      return 0;
  }
}

/**
 * Zwraca rozbicie składek: ZUS bez chorobowej i chorobowa osobno
 */
export function getSocialContributionBreakdown(
  zusType: ZusType,
  voluntarySickness: boolean
): { zusBezChorobowej: number; chorobowa: number } {
  switch (zusType) {
    case 'ulga_na_start':
      return { zusBezChorobowej: 0, chorobowa: 0 };
    case 'maly_zus':
      return {
        zusBezChorobowej: SMALL_ZUS.razem,
        chorobowa: voluntarySickness ? SMALL_ZUS.chorobowa : 0,
      };
    case 'duzy_zus':
      return {
        zusBezChorobowej: BIG_ZUS.razem,
        chorobowa: voluntarySickness ? BIG_ZUS.chorobowa : 0,
      };
    default:
      return { zusBezChorobowej: 0, chorobowa: 0 };
  }
}

/**
 * Oblicza roczną składkę zdrowotną dla ryczałtu na podstawie rocznego przychodu
 */
export function getHealthContributionRyczalt(yearlyRevenue: number): number {
  let monthlyContribution: number;

  if (yearlyRevenue <= HEALTH_RYCZALT.threshold1.maxRevenue) {
    monthlyContribution = HEALTH_RYCZALT.threshold1.monthly;
  } else if (yearlyRevenue <= HEALTH_RYCZALT.threshold2.maxRevenue) {
    monthlyContribution = HEALTH_RYCZALT.threshold2.monthly;
  } else {
    monthlyContribution = HEALTH_RYCZALT.threshold3.monthly;
  }

  // Zastosuj minimum (432.54 zł)
  monthlyContribution = Math.max(monthlyContribution, MIN_HEALTH_CONTRIBUTION);

  return monthlyContribution * 12;
}

/**
 * Oblicza roczną składkę zdrowotną dla skali podatkowej na podstawie rocznego dochodu
 */
export function getHealthContributionSkala(yearlyIncome: number): number {
  // 9% od dochodu, ale nie mniej niż minimum miesięczne
  const calculatedMonthly = (yearlyIncome * HEALTH_RATE) / 12;
  const monthlyContribution = Math.max(
    calculatedMonthly,
    MIN_HEALTH_CONTRIBUTION
  );

  return monthlyContribution * 12;
}

/**
 * Oblicza podatek według skali podatkowej (12%/32%) z kwotą wolną
 */
export function calculateTaxSkala(taxBase: number): number {
  if (taxBase <= 0) return 0;

  let tax: number;
  if (taxBase <= TAX_THRESHOLD) {
    // 12% minus kwota zmniejszająca
    tax = taxBase * TAX_RATE_LOW - TAX_FREE_REDUCTION;
  } else {
    // 10800 zł (12% * 120000 - 3600) + 32% od nadwyżki
    const taxFromFirstThreshold = TAX_THRESHOLD * TAX_RATE_LOW - TAX_FREE_REDUCTION;
    tax = taxFromFirstThreshold + (taxBase - TAX_THRESHOLD) * TAX_RATE_HIGH;
  }

  // Podatek nie może być ujemny
  return Math.max(0, Math.round(tax));
}

/**
 * Oblicza wynik dla ryczałtu 12%
 */
export function calculateRyczalt(months: MonthData[]): RyczaltResult {
  // Suma przychodów
  const przychod = months.reduce((sum, m) => sum + m.revenue, 0);

  // Suma składek społecznych (miesięcznie)
  const skladkiSpoleczne = months.reduce(
    (sum, m) => sum + getSocialContribution(m.zusType, m.voluntarySickness),
    0
  );

  // Składka zdrowotna (zależna od progu przychodu rocznego)
  const skladkaZdrowotna = getHealthContributionRyczalt(przychod);

  // 50% składki zdrowotnej można odliczyć od przychodu
  const odliczenie50Zdrowotnej = skladkaZdrowotna * RYCZALT_HEALTH_DEDUCTION;

  // Podstawa opodatkowania = przychód - 50% składki zdrowotnej
  const podstawaOpodatkowania = Math.max(0, przychod - odliczenie50Zdrowotnej);

  // Podatek = 12% od podstawy
  const podatek = Math.round(podstawaOpodatkowania * RYCZALT_RATE);

  // Netto = przychód - składki społeczne - składka zdrowotna - podatek
  const netto = przychod - skladkiSpoleczne - skladkaZdrowotna - podatek;

  return {
    przychod,
    skladkiSpoleczne,
    skladkaZdrowotna,
    odliczenie50Zdrowotnej,
    podstawaOpodatkowania,
    podatek,
    netto,
  };
}

/**
 * Oblicza wynik dla skali podatkowej
 */
export function calculateSkala(months: MonthData[]): SkalaResult {
  // Suma przychodów
  const przychod = months.reduce((sum, m) => sum + m.revenue, 0);

  // Suma składek społecznych
  const skladkiSpoleczne = months.reduce(
    (sum, m) => sum + getSocialContribution(m.zusType, m.voluntarySickness),
    0
  );

  // Dochód = przychód - składki społeczne (zakładamy brak innych kosztów)
  const dochod = Math.max(0, przychod - skladkiSpoleczne);

  // Składka zdrowotna = 9% od dochodu
  const skladkaZdrowotna = getHealthContributionSkala(dochod);

  // Podstawa opodatkowania = dochód (zaokrąglony)
  const podstawaOpodatkowania = Math.round(dochod);

  // Podatek według skali (12%/32%)
  const podatek = calculateTaxSkala(podstawaOpodatkowania);

  // Netto = przychód - składki społeczne - składka zdrowotna - podatek
  const netto = przychod - skladkiSpoleczne - skladkaZdrowotna - podatek;

  return {
    przychod,
    skladkiSpoleczne,
    dochod,
    skladkaZdrowotna,
    podstawaOpodatkowania,
    podatek,
    netto,
  };
}

/**
 * Oblicza miesięczną składkę zdrowotną dla ryczałtu (stała kwota zależna od progu rocznego)
 */
export function getMonthlyHealthRyczalt(yearlyRevenue: number): number {
  let monthlyContribution: number;

  if (yearlyRevenue <= HEALTH_RYCZALT.threshold1.maxRevenue) {
    monthlyContribution = HEALTH_RYCZALT.threshold1.monthly;
  } else if (yearlyRevenue <= HEALTH_RYCZALT.threshold2.maxRevenue) {
    monthlyContribution = HEALTH_RYCZALT.threshold2.monthly;
  } else {
    monthlyContribution = HEALTH_RYCZALT.threshold3.monthly;
  }

  return Math.max(monthlyContribution, MIN_HEALTH_CONTRIBUTION);
}

/**
 * Oblicza miesięczną składkę zdrowotną dla skali (9% dochodu, min. 432.54)
 */
export function getMonthlyHealthSkala(monthlyIncome: number): number {
  const calculated = monthlyIncome * HEALTH_RATE;
  return Math.max(calculated, MIN_HEALTH_CONTRIBUTION);
}

/**
 * Oblicza szczegóły dla każdego miesiąca
 */
export function calculateMonthlyBreakdowns(
  months: MonthData[],
  ryczaltResult: RyczaltResult,
  skalaResult: SkalaResult
): MonthlyBreakdown[] {
  const yearlyRevenue = ryczaltResult.przychod;
  const monthlyHealthRyczalt = getMonthlyHealthRyczalt(yearlyRevenue);

  // Efektywna stawka podatku dla skali (aby rozłożyć proporcjonalnie)
  const effectiveTaxRateSkala =
    skalaResult.dochod > 0 ? skalaResult.podatek / skalaResult.dochod : 0;

  return months.map((month) => {
    const przychod = month.revenue;
    const { zusBezChorobowej, chorobowa } = getSocialContributionBreakdown(
      month.zusType,
      month.voluntarySickness
    );
    const skladkiSpoleczne = zusBezChorobowej + chorobowa;

    // Ryczałt
    const ryczaltZdrowotna = monthlyHealthRyczalt;
    const ryczaltOdliczenie = ryczaltZdrowotna * RYCZALT_HEALTH_DEDUCTION;
    const ryczaltPodstawaPodatku = Math.max(0, przychod - ryczaltOdliczenie);
    const ryczaltPodatek = ryczaltPodstawaPodatku * RYCZALT_RATE;
    const ryczaltNetto =
      przychod - skladkiSpoleczne - ryczaltZdrowotna - ryczaltPodatek;

    // Skala
    const skalaDochod = Math.max(0, przychod - skladkiSpoleczne);
    const skalaZdrowotna = getMonthlyHealthSkala(skalaDochod);
    const skalaPodatek = skalaDochod * effectiveTaxRateSkala;
    const skalaNetto = przychod - skladkiSpoleczne - skalaZdrowotna - skalaPodatek;

    return {
      przychod,
      skladkiZusBezChorobowej: zusBezChorobowej,
      skladkaChorobowa: chorobowa,
      ryczalt: {
        skladkaZdrowotna: ryczaltZdrowotna,
        podatek: ryczaltPodatek,
        netto: ryczaltNetto,
      },
      skala: {
        skladkaZdrowotna: skalaZdrowotna,
        podatek: skalaPodatek,
        netto: skalaNetto,
      },
    };
  });
}

/**
 * Porównuje oba warianty i zwraca pełny wynik
 */
export function compare(months: MonthData[]): CalculationResult {
  const ryczalt = calculateRyczalt(months);
  const skala = calculateSkala(months);

  const roznica = ryczalt.netto - skala.netto;
  const lepszyWariant = roznica >= 0 ? 'ryczalt' : 'skala';

  const monthlyBreakdowns = calculateMonthlyBreakdowns(months, ryczalt, skala);

  return {
    ryczalt,
    skala,
    roznica,
    lepszyWariant,
    monthlyBreakdowns,
  };
}

/**
 * Formatuje kwotę jako PLN
 */
export function formatPLN(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
