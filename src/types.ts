export type ZusType = 'ulga_na_start' | 'maly_zus' | 'duzy_zus';

export interface MonthData {
  revenue: number; // przychód netto z faktury
  zusType: ZusType;
  voluntarySickness: boolean; // dobrowolne chorobowe
}

export interface YearlyInput {
  months: MonthData[]; // 12 miesięcy
}

// Szczegóły obliczone dla pojedynczego miesiąca
export interface MonthlyBreakdown {
  // Wspólne
  przychod: number;
  skladkiZusBezChorobowej: number; // emerytalna + rentowa + wypadkowa + fundusz pracy
  skladkaChorobowa: number; // dobrowolna, 0 jeśli nie opłacana
  // Ryczałt
  ryczalt: {
    skladkaZdrowotna: number;
    podatek: number;
    netto: number;
  };
  // Skala
  skala: {
    skladkaZdrowotna: number;
    podatek: number;
    netto: number;
  };
}

export interface RyczaltResult {
  przychod: number;
  skladkiSpoleczne: number;
  skladkaZdrowotna: number;
  odliczenie50Zdrowotnej: number;
  podstawaOpodatkowania: number;
  podatek: number;
  netto: number;
}

export interface SkalaResult {
  przychod: number;
  skladkiSpoleczne: number;
  dochod: number;
  skladkaZdrowotna: number;
  podstawaOpodatkowania: number;
  podatek: number;
  netto: number;
}

export interface CalculationResult {
  ryczalt: RyczaltResult;
  skala: SkalaResult;
  roznica: number; // dodatnia = ryczałt lepszy
  lepszyWariant: 'ryczalt' | 'skala';
  monthlyBreakdowns: MonthlyBreakdown[]; // szczegóły dla każdego miesiąca
}

export const ZUS_LABELS: Record<ZusType, string> = {
  ulga_na_start: 'Ulga na start',
  maly_zus: 'Mały ZUS',
  duzy_zus: 'Duży ZUS',
};
