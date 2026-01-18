import { useState } from 'react';
import { formatPLN, getSocialContribution } from '../calculations';
import { InfoTooltip } from './InfoTooltip';
import type { MonthData } from '../types';
import {
  SMALL_ZUS,
  BIG_ZUS,
  BIG_ZUS_BASE,
  SMALL_ZUS_BASE,
  MAX_ZUS_BASE,
  ZUS_RATES,
  TAX_THRESHOLD,
  TAX_RATE_LOW,
  TAX_RATE_HIGH
} from '../constants';

interface SickLeavePanelProps {
  months: MonthData[];
}

// Procent składek odliczanych od podstawy zasiłku (em. + rent. + chor.)
const SOCIAL_DEDUCTION_RATE = 0.1371; // 13,71%

// Oblicz składki społeczne na podstawie zadeklarowanej podstawy
function calculateZusFromBase(base: number, includeChorobowa: boolean, includeFP: boolean) {
  const emerytalna = base * ZUS_RATES.emerytalna;
  const rentowa = base * ZUS_RATES.rentowa;
  const wypadkowa = base * ZUS_RATES.wypadkowa;
  const chorobowa = includeChorobowa ? base * ZUS_RATES.chorobowa : 0;
  const funduszPracy = includeFP ? base * ZUS_RATES.funduszPracy : 0;

  return {
    emerytalna,
    rentowa,
    wypadkowa,
    chorobowa,
    funduszPracy,
    razem: emerytalna + rentowa + wypadkowa + funduszPracy,
    razemZChorobowa: emerytalna + rentowa + wypadkowa + chorobowa + funduszPracy,
  };
}

// Pobierz podstawę składek ZUS dla danego typu
function getZusBase(zusType: 'ulga_na_start' | 'maly_zus' | 'duzy_zus'): number {
  switch (zusType) {
    case 'ulga_na_start':
      return 0; // Brak składek społecznych = brak podstawy do zasiłku
    case 'maly_zus':
      return SMALL_ZUS_BASE;
    case 'duzy_zus':
      return BIG_ZUS_BASE;
    default:
      return 0;
  }
}

export function SickLeavePanel({ months }: SickLeavePanelProps) {
  const [increasedBase, setIncreasedBase] = useState(BIG_ZUS_BASE);

  // Oblicz średni miesięczny przychód
  const monthsWithRevenue = months.filter((m) => m.revenue > 0);
  if (monthsWithRevenue.length === 0) {
    return null;
  }

  // Oblicz roczny dochód do określenia stawki podatkowej
  const yearlyRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const yearlyZus = months.reduce(
    (sum, m) => sum + getSocialContribution(m.zusType, m.voluntarySickness),
    0
  );
  const yearlyIncome = yearlyRevenue - yearlyZus;

  // Dla przedsiębiorcy na skali: zasiłek dodaje się do dochodu, więc używamy stawki krańcowej
  // Dla ryczałtowca: zasiłek to JEDYNY przychód na skali, więc korzysta z kwoty wolnej
  // (zakładamy że roczny zasiłek < 30 000 zł, więc efektywnie ~0% lub bardzo niski podatek)
  const marginalTaxRateSkala = yearlyIncome > TAX_THRESHOLD ? TAX_RATE_HIGH : TAX_RATE_LOW;

  // Sprawdź czy są miesiące z opłacaną składką chorobową
  const monthsWithSickness = months.filter(
    (m) => m.revenue > 0 && m.zusType !== 'ulga_na_start' && m.voluntarySickness
  );

  const hasSicknessInsurance = monthsWithSickness.length > 0;

  // WAŻNE: Podstawa zasiłku = średnia PODSTAWA SKŁADEK ZUS (nie przychód!) × 86,29%
  // Oblicz średnią podstawę składek z 12 miesięcy
  const monthsWithZusBase = months.map((m) => ({
    ...m,
    zusBase: m.revenue > 0 && m.voluntarySickness ? getZusBase(m.zusType) : 0,
  }));

  // Zlicz miesiące z przychodem (do obliczenia średniej)
  const activeMonthsCount = months.filter((m) => m.revenue > 0).length;

  // Suma podstaw ZUS z miesięcy z ubezpieczeniem chorobowym
  const totalZusBase = monthsWithZusBase.reduce((sum, m) => sum + m.zusBase, 0);

  // Średnia podstawa ZUS (dzielona przez liczbę aktywnych miesięcy)
  const avgZusBase = activeMonthsCount > 0 ? totalZusBase / activeMonthsCount : 0;

  // Miesiące z Ulgą na start (zaniżają średnią!)
  const monthsWithUlga = months.filter((m) => m.revenue > 0 && m.zusType === 'ulga_na_start').length;
  const hasUlgaWarning = monthsWithUlga > 0 && hasSicknessInsurance;

  // Podstawa wymiaru zasiłku = średnia podstawa ZUS × (1 - 13,71%)
  const sickLeaveBase = avgZusBase * (1 - SOCIAL_DEDUCTION_RATE);

  // Zasiłek dzienny (brutto)
  const dailyBase = sickLeaveBase / 30;
  const daily80Brutto = dailyBase * 0.8;
  const daily100Brutto = dailyBase;

  // Netto dla SKALI (pełna stawka krańcowa, bo kwota wolna już zużyta)
  const daily80NettoSkala = daily80Brutto * (1 - marginalTaxRateSkala);
  const daily100NettoSkala = daily100Brutto * (1 - marginalTaxRateSkala);

  // Netto dla RYCZAŁTU: przy krótkim L4 ~0% podatku dzięki kwocie wolnej 30 000 zł
  // Dla uproszczenia używamy kwoty brutto (daily80Brutto, daily100Brutto)

  // Przykłady: 5, 7 i 30 dni L4
  const exampleDaysOptions = [5, 7, 30];

  // Oblicz składki za pełny miesiąc i za okres choroby
  const lastMonthWithZus = [...months]
    .reverse()
    .find((m) => m.zusType !== 'ulga_na_start' && m.revenue > 0);

  const zusType = lastMonthWithZus?.zusType || 'duzy_zus';
  const hasVoluntarySickness = lastMonthWithZus?.voluntarySickness ?? true;

  const zusData = zusType === 'maly_zus' ? SMALL_ZUS : BIG_ZUS;

  // Funkcja do obliczania składek za dany okres L4
  const calculateBreakdown = (sickDays: number) => {
    const workingDays = 30 - sickDays;
    const ratio = workingDays / 30;

    const breakdown = {
      emerytalna: { full: zusData.emerytalna, reduced: zusData.emerytalna * ratio },
      rentowa: { full: zusData.rentowa, reduced: zusData.rentowa * ratio },
      wypadkowa: { full: zusData.wypadkowa, reduced: zusData.wypadkowa * ratio },
      chorobowa: hasVoluntarySickness
        ? { full: zusData.chorobowa, reduced: zusData.chorobowa * ratio }
        : { full: 0, reduced: 0 },
      funduszPracy: { full: zusData.funduszPracy, reduced: zusData.funduszPracy * ratio },
    };

    const totalFull =
      breakdown.emerytalna.full +
      breakdown.rentowa.full +
      breakdown.wypadkowa.full +
      breakdown.chorobowa.full +
      breakdown.funduszPracy.full;

    const totalReduced =
      breakdown.emerytalna.reduced +
      breakdown.rentowa.reduced +
      breakdown.wypadkowa.reduced +
      breakdown.chorobowa.reduced +
      breakdown.funduszPracy.reduced;

    return { breakdown, totalFull, totalReduced, workingDays };
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="card-title mb-0">
          Zasiłek chorobowy (L4)
          <InfoTooltip>
            <>
              <strong>Zasiłek chorobowy dla przedsiębiorcy</strong>
              {'\n\n'}
              <strong>Warunki:</strong>
              {'\n'}• Opłacanie dobrowolnej składki chorobowej
              {'\n'}• Okres wyczekiwania: 90 dni ciągłego ubezpieczenia
              {'\n\n'}
              <strong>Podstawa wymiaru:</strong>
              {'\n'}Średnia PODSTAWA SKŁADEK ZUS z 12 mies. × 86,29%
              {'\n'}(nie przychód z faktur!)
              {'\n\n'}
              <strong>Wysokość zasiłku:</strong>
              {'\n'}• 80% — choroba zwykła
              {'\n'}• 100% — ciąża, wypadek, dawca organów
              {'\n\n'}
              <strong>Podatek:</strong>
              {'\n'}Zasiłek jest ZAWSZE opodatkowany wg skali (12%/32%),
              {'\n'}nawet jeśli jesteś na ryczałcie!
            </>
          </InfoTooltip>
        </h5>
      </div>
      <div className="card-body">
        {!hasSicknessInsurance ? (
          <div className="alert alert-warning mb-0">
            <strong>Brak ubezpieczenia chorobowego!</strong>
            <p className="mb-0 mt-2">
              Aby otrzymać zasiłek chorobowy, musisz opłacać dobrowolną składkę
              chorobową (dostępną przy Małym lub Dużym ZUS). Zaznacz checkbox
              "Chor." przy wybranym miesiącu.
            </p>
          </div>
        ) : (
          <>
            {/* Ostrzeżenie o Uldze na start */}
            {hasUlgaWarning && (
              <div className="alert alert-warning small mb-3">
                <strong>Uwaga!</strong> Masz {monthsWithUlga} mies. z "Ulgą na start" (0 zł składek).
                {' '}ZUS uśrednia podstawę z 12 miesięcy — miesiące bez składek zaniżają Twój zasiłek!
              </div>
            )}

            {/* Info o podatku - RÓŻNICA między Ryczałtem a Skalą */}
            <div className="alert alert-secondary small mb-3">
              <strong>Podatek od zasiłku — ważna różnica!</strong>
              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="p-2 rounded" style={{ backgroundColor: '#e8f5e9' }}>
                    <strong>Ryczałtowiec:</strong>
                    <br />
                    Zasiłek = jedyny przychód na skali
                    <br />
                    → <strong>Korzysta z kwoty wolnej 30 000 zł</strong>
                    <br />
                    → Przy krótkim L4: <span className="text-success fw-bold">~0% podatku</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-2 rounded" style={{ backgroundColor: '#e3f2fd' }}>
                    <strong>Skala podatkowa:</strong>
                    <br />
                    Zasiłek dodaje się do dochodu z firmy
                    <br />
                    → Kwota wolna już "zużyta"
                    <br />
                    → Podatek: <span className="text-primary fw-bold">{Math.round(marginalTaxRateSkala * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Podstawa i stawki */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small">
                    Średnia podstawa składek ZUS
                    <InfoTooltip>
                      <>
                        <strong>Podstawa składek ZUS</strong>
                        {'\n\n'}
                        Zasiłek chorobowy liczy się od PODSTAWY SKŁADEK,
                        nie od przychodu z faktur!
                        {'\n\n'}
                        <strong>Podstawy w 2026:</strong>
                        {'\n'}• Duży ZUS: {formatPLN(BIG_ZUS_BASE)}
                        {'\n'}• Mały ZUS: {formatPLN(SMALL_ZUS_BASE)}
                        {'\n'}• Ulga na start: 0 zł (brak składek!)
                        {'\n\n'}
                        <strong>Twoja średnia:</strong>
                        {'\n'}Suma podstaw ÷ liczba aktywnych miesięcy
                        {'\n'}= {formatPLN(totalZusBase)} ÷ {activeMonthsCount}
                        {'\n'}= {formatPLN(avgZusBase)}
                      </>
                    </InfoTooltip>
                  </div>
                  <div className="fs-5 fw-bold">{formatPLN(avgZusBase)}</div>
                  <div className="text-muted small mt-1">
                    z {activeMonthsCount} mies. aktywnych
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small">
                    Podstawa wymiaru zasiłku
                    <InfoTooltip>
                      <>
                        <strong>Podstawa wymiaru zasiłku</strong>
                        {'\n\n'}
                        Średnia podstawa ZUS pomniejszona o 13,71%:
                        {'\n'}• Emerytalna: 9,76%
                        {'\n'}• Rentowa: 1,5%
                        {'\n'}• Chorobowa: 2,45%
                        {'\n\n'}
                        <strong>Obliczenie:</strong>
                        {'\n'}
                        {formatPLN(avgZusBase)} × (1 − 13,71%)
                        {'\n'}= {formatPLN(avgZusBase)} × 86,29%
                        {'\n'}= {formatPLN(sickLeaveBase)}
                      </>
                    </InfoTooltip>
                  </div>
                  <div className="fs-5 fw-bold">{formatPLN(sickLeaveBase)}</div>
                  <div className="text-muted small mt-1">
                    podstawa ZUS × 86,29%
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small">Stawka dzienna</div>
                  <div className="fs-5 fw-bold">{formatPLN(dailyBase)}</div>
                  <div className="text-muted small mt-1">podstawa ÷ 30 dni</div>
                </div>
              </div>
            </div>

            {/* Zasiłek 80% vs 100% */}
            <h6 className="mb-3">
              Wysokość zasiłku
              <InfoTooltip>
                <>
                  <strong>Różnica w opodatkowaniu zasiłku</strong>
                  {'\n\n'}
                  <strong>Ryczałtowiec:</strong>
                  {'\n'}Zasiłek to jedyny przychód na skali.
                  {'\n'}Korzysta z kwoty wolnej 30 000 zł.
                  {'\n'}Przy krótkim L4 → ~0% podatku!
                  {'\n\n'}
                  <strong>Skala podatkowa:</strong>
                  {'\n'}Zasiłek dodaje się do dochodu z firmy.
                  {'\n'}Kwota wolna już wykorzystana.
                  {'\n'}Podatek: {Math.round(marginalTaxRateSkala * 100)}%
                  {'\n\n'}
                  <strong>Uwaga:</strong> Zasiłek NIE podlega składkom ZUS ani
                  składce zdrowotnej — tylko podatkowi dochodowemu.
                </>
              </InfoTooltip>
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div
                  className="border rounded p-3"
                  style={{ backgroundColor: '#fff3cd' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">80% — choroba zwykła</div>
                      <div className="text-muted small">
                        przeziębienie, grypa, kontuzja itp.
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div>
                      <span className="text-muted small">brutto: </span>
                      <span className="fw-bold">{formatPLN(daily80Brutto)}</span>
                      <span className="text-muted small"> / dzień</span>
                    </div>
                  </div>
                  <div className="mt-2 small border-top pt-2">
                    <table className="table table-sm mb-0" style={{ fontSize: '0.85em' }}>
                      <thead>
                        <tr>
                          <th></th>
                          {exampleDaysOptions.map((days) => (
                            <th key={days} className="text-end">{days} dni</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: '#e8f5e9' }}>
                          <td><strong>Ryczałt</strong> <span className="text-muted">(~0% PIT)</span></td>
                          {exampleDaysOptions.map((days) => (
                            <td key={days} className="text-end fw-bold text-success">
                              {formatPLN(daily80Brutto * days)}
                            </td>
                          ))}
                        </tr>
                        <tr style={{ backgroundColor: '#e3f2fd' }}>
                          <td><strong>Skala</strong> <span className="text-muted">(−{Math.round(marginalTaxRateSkala * 100)}%)</span></td>
                          {exampleDaysOptions.map((days) => (
                            <td key={days} className="text-end fw-bold text-primary">
                              {formatPLN(daily80NettoSkala * days)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className="border rounded p-3"
                  style={{ backgroundColor: '#d1e7dd' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">100% — szczególne przypadki</div>
                      <div className="text-muted small">
                        ciąża, wypadek przy pracy, dawca
                      </div>
                    </div>
                    <InfoTooltip>
                      <>
                        <strong>Zasiłek 100%</strong>
                        {'\n\n'}
                        Przysługuje w przypadku:
                        {'\n'}• Niezdolności w okresie ciąży
                        {'\n'}• Wypadku przy pracy
                        {'\n'}• Wypadku w drodze do/z pracy
                        {'\n'}• Poddania się badaniom dla dawców
                        {'\n'}• Oddania komórek/narządów
                      </>
                    </InfoTooltip>
                  </div>
                  <div className="mt-2">
                    <div>
                      <span className="text-muted small">brutto: </span>
                      <span className="fw-bold">{formatPLN(daily100Brutto)}</span>
                      <span className="text-muted small"> / dzień</span>
                    </div>
                  </div>
                  <div className="mt-2 small border-top pt-2">
                    <table className="table table-sm mb-0" style={{ fontSize: '0.85em' }}>
                      <thead>
                        <tr>
                          <th></th>
                          {exampleDaysOptions.map((days) => (
                            <th key={days} className="text-end">{days} dni</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: '#e8f5e9' }}>
                          <td><strong>Ryczałt</strong> <span className="text-muted">(~0% PIT)</span></td>
                          {exampleDaysOptions.map((days) => (
                            <td key={days} className="text-end fw-bold text-success">
                              {formatPLN(daily100Brutto * days)}
                            </td>
                          ))}
                        </tr>
                        <tr style={{ backgroundColor: '#e3f2fd' }}>
                          <td><strong>Skala</strong> <span className="text-muted">(−{Math.round(marginalTaxRateSkala * 100)}%)</span></td>
                          {exampleDaysOptions.map((days) => (
                            <td key={days} className="text-end fw-bold text-primary">
                              {formatPLN(daily100NettoSkala * days)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Pomniejszenie składek */}
            <h6 className="mb-3">
              Pomniejszenie składek za okres choroby
              <InfoTooltip>
                <>
                  <strong>Składki społeczne za okres L4</strong>
                  {'\n\n'}
                  Gdy przebywasz na L4, składki społeczne są proporcjonalnie
                  mniejsze — płacisz tylko za dni, w których prowadziłeś
                  działalność.
                  {'\n\n'}
                  <strong>Które składki są pomniejszane:</strong>
                  {'\n'}• Emerytalna (19,52% podstawy)
                  {'\n'}• Rentowa (8% podstawy)
                  {'\n'}• Wypadkowa (1,67% podstawy)
                  {'\n'}• Chorobowa (2,45% podstawy) — jeśli opłacana
                  {'\n'}• Fundusz Pracy (2,45%) — tylko przy Dużym ZUS
                  {'\n\n'}
                  <strong>Przykłady:</strong>
                  {'\n'}• 5 dni L4 → płacisz 25/30 = 83,33% składek
                  {'\n'}• 7 dni L4 → płacisz 23/30 = 76,67% składek
                  {'\n'}• 30 dni L4 → płacisz 0/30 = 0% składek
                  {'\n\n'}
                  <strong>Uwaga:</strong> Składka zdrowotna jest niepodzielna —
                  płacisz pełną kwotę nawet za 1 dzień działalności w miesiącu.
                </>
              </InfoTooltip>
            </h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Składka ({zusType === 'maly_zus' ? 'Mały' : 'Duży'} ZUS)</th>
                    <th className="text-end">Pełny miesiąc</th>
                    {exampleDaysOptions.map((days) => (
                      <th key={days} className="text-end">
                        {days} dni L4
                        <br />
                        <small className="text-muted fw-normal">
                          ({30 - days} dni pracy)
                        </small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Emerytalna
                      <small className="text-muted ms-1">(19,52%)</small>
                    </td>
                    <td className="text-end">{formatPLN(zusData.emerytalna)}</td>
                    {exampleDaysOptions.map((days) => {
                      const { breakdown } = calculateBreakdown(days);
                      return (
                        <td key={days} className="text-end">
                          {formatPLN(breakdown.emerytalna.reduced)}
                          <br />
                          <small className="text-success">
                            −{formatPLN(breakdown.emerytalna.full - breakdown.emerytalna.reduced)}
                          </small>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      Rentowa
                      <small className="text-muted ms-1">(8%)</small>
                    </td>
                    <td className="text-end">{formatPLN(zusData.rentowa)}</td>
                    {exampleDaysOptions.map((days) => {
                      const { breakdown } = calculateBreakdown(days);
                      return (
                        <td key={days} className="text-end">
                          {formatPLN(breakdown.rentowa.reduced)}
                          <br />
                          <small className="text-success">
                            −{formatPLN(breakdown.rentowa.full - breakdown.rentowa.reduced)}
                          </small>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      Wypadkowa
                      <small className="text-muted ms-1">(1,67%)</small>
                    </td>
                    <td className="text-end">{formatPLN(zusData.wypadkowa)}</td>
                    {exampleDaysOptions.map((days) => {
                      const { breakdown } = calculateBreakdown(days);
                      return (
                        <td key={days} className="text-end">
                          {formatPLN(breakdown.wypadkowa.reduced)}
                          <br />
                          <small className="text-success">
                            −{formatPLN(breakdown.wypadkowa.full - breakdown.wypadkowa.reduced)}
                          </small>
                        </td>
                      );
                    })}
                  </tr>
                  {hasVoluntarySickness && (
                    <tr className="table-info">
                      <td>
                        <strong>Chorobowa</strong>
                        <small className="text-muted ms-1">(2,45%, dobrowolna)</small>
                      </td>
                      <td className="text-end">{formatPLN(zusData.chorobowa)}</td>
                      {exampleDaysOptions.map((days) => {
                        const { breakdown } = calculateBreakdown(days);
                        return (
                          <td key={days} className="text-end">
                            {formatPLN(breakdown.chorobowa.reduced)}
                            <br />
                            <small className="text-success">
                              −{formatPLN(breakdown.chorobowa.full - breakdown.chorobowa.reduced)}
                            </small>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  {zusData.funduszPracy > 0 && (
                    <tr>
                      <td>
                        Fundusz Pracy
                        <small className="text-muted ms-1">(2,45%)</small>
                      </td>
                      <td className="text-end">{formatPLN(zusData.funduszPracy)}</td>
                      {exampleDaysOptions.map((days) => {
                        const { breakdown } = calculateBreakdown(days);
                        return (
                          <td key={days} className="text-end">
                            {formatPLN(breakdown.funduszPracy.reduced)}
                            <br />
                            <small className="text-success">
                              −{formatPLN(breakdown.funduszPracy.full - breakdown.funduszPracy.reduced)}
                            </small>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  <tr className="table-warning">
                    <td>
                      Składka zdrowotna
                      <InfoTooltip>
                        <>
                          <strong>Składka zdrowotna jest niepodzielna</strong>
                          {'\n\n'}
                          W przeciwieństwie do składek społecznych, składka
                          zdrowotna nie podlega proporcjonalnemu zmniejszeniu.
                          {'\n\n'}
                          Jeśli prowadziłeś działalność choćby 1 dzień w miesiącu,
                          płacisz pełną składkę zdrowotną.
                        </>
                      </InfoTooltip>
                    </td>
                    <td className="text-end">pełna</td>
                    {exampleDaysOptions.map((days) => (
                      <td key={days} className="text-end text-muted">
                        pełna
                        <br />
                        <small>−0 zł</small>
                      </td>
                    ))}
                  </tr>
                </tbody>
                <tfoot className="table-success">
                  <tr>
                    <td className="fw-bold">Suma składek społecznych</td>
                    <td className="text-end fw-bold">{formatPLN(calculateBreakdown(0).totalFull)}</td>
                    {exampleDaysOptions.map((days) => {
                      const { totalReduced, totalFull } = calculateBreakdown(days);
                      return (
                        <td key={days} className="text-end fw-bold">
                          {formatPLN(totalReduced)}
                          <br />
                          <small className="text-success">
                            −{formatPLN(totalFull - totalReduced)}
                          </small>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Podsumowanie łącznej korzyści */}
            <h6 className="mt-4 mb-3">
              Łączna korzyść finansowa z L4
              <InfoTooltip>
                <>
                  <strong>Co składa się na korzyść z L4?</strong>
                  {'\n\n'}
                  <strong>1. Zasiłek chorobowy (netto)</strong>
                  {'\n'}Kwota wypłacana przez ZUS po odjęciu podatku dochodowego.
                  {'\n'}• Ryczałt: ~0% PIT (kwota wolna 30 000 zł)
                  {'\n'}• Skala: {Math.round(marginalTaxRateSkala * 100)}% PIT (kwota wolna zużyta)
                  {'\n\n'}
                  <strong>2. Oszczędność na składkach ZUS</strong>
                  {'\n'}Składki społeczne są proporcjonalnie mniejsze za okres L4.
                  {'\n\n'}
                  <strong>Łączna korzyść</strong> = zasiłek netto + oszczędność ZUS
                </>
              </InfoTooltip>
            </h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th rowSpan={2}>Składnik</th>
                    {exampleDaysOptions.map((days) => (
                      <th key={days} className="text-center" colSpan={2}>
                        {days} dni L4
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {exampleDaysOptions.map((days) => (
                      <>
                        <th key={`${days}-ryczalt`} className="text-end small" style={{ backgroundColor: '#e8f5e9' }}>Ryczałt</th>
                        <th key={`${days}-skala`} className="text-end small" style={{ backgroundColor: '#e3f2fd' }}>Skala</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Zasiłek 80% (netto)
                    </td>
                    {exampleDaysOptions.map((days) => (
                      <>
                        <td key={`${days}-ryczalt`} className="text-end" style={{ backgroundColor: '#e8f5e9' }}>
                          {formatPLN(daily80Brutto * days)}
                        </td>
                        <td key={`${days}-skala`} className="text-end" style={{ backgroundColor: '#e3f2fd' }}>
                          {formatPLN(daily80NettoSkala * days)}
                        </td>
                      </>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      Zasiłek 100% (netto)
                    </td>
                    {exampleDaysOptions.map((days) => (
                      <>
                        <td key={`${days}-ryczalt`} className="text-end" style={{ backgroundColor: '#e8f5e9' }}>
                          {formatPLN(daily100Brutto * days)}
                        </td>
                        <td key={`${days}-skala`} className="text-end" style={{ backgroundColor: '#e3f2fd' }}>
                          {formatPLN(daily100NettoSkala * days)}
                        </td>
                      </>
                    ))}
                  </tr>
                  <tr className="table-success">
                    <td>Oszczędność na składkach ZUS</td>
                    {exampleDaysOptions.map((days) => {
                      const { totalFull, totalReduced } = calculateBreakdown(days);
                      return (
                        <>
                          <td key={`${days}-ryczalt`} className="text-end text-success" colSpan={2}>
                            +{formatPLN(totalFull - totalReduced)}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="fw-bold">
                      Łącznie przy 80%
                      <small className="text-muted ms-1 fw-normal">(zasiłek + ZUS)</small>
                    </td>
                    {exampleDaysOptions.map((days) => {
                      const { totalFull, totalReduced } = calculateBreakdown(days);
                      const zusSavings = totalFull - totalReduced;
                      const totalRyczalt = daily80Brutto * days + zusSavings;
                      const totalSkala = daily80NettoSkala * days + zusSavings;
                      return (
                        <>
                          <td key={`${days}-ryczalt`} className="text-end fw-bold" style={{ backgroundColor: '#c8e6c9' }}>
                            {formatPLN(totalRyczalt)}
                          </td>
                          <td key={`${days}-skala`} className="text-end fw-bold" style={{ backgroundColor: '#bbdefb' }}>
                            {formatPLN(totalSkala)}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="fw-bold">
                      Łącznie przy 100%
                      <small className="text-muted ms-1 fw-normal">(zasiłek + ZUS)</small>
                    </td>
                    {exampleDaysOptions.map((days) => {
                      const { totalFull, totalReduced } = calculateBreakdown(days);
                      const zusSavings = totalFull - totalReduced;
                      const totalRyczalt = daily100Brutto * days + zusSavings;
                      const totalSkala = daily100NettoSkala * days + zusSavings;
                      return (
                        <>
                          <td key={`${days}-ryczalt`} className="text-end fw-bold" style={{ backgroundColor: '#c8e6c9' }}>
                            {formatPLN(totalRyczalt)}
                          </td>
                          <td key={`${days}-skala`} className="text-end fw-bold" style={{ backgroundColor: '#bbdefb' }}>
                            {formatPLN(totalSkala)}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Opłacalność składki chorobowej */}
            <h6 className="mt-4 mb-3">
              Czy składka chorobowa się opłaca?
              <InfoTooltip>
                <>
                  <strong>Analiza opłacalności składki chorobowej</strong>
                  {'\n\n'}
                  Ile dni L4 w roku musisz mieć, żeby odzyskać koszt
                  dobrowolnej składki chorobowej?
                  {'\n\n'}
                  <strong>Wzór:</strong>
                  {'\n'}Break-even = Roczny koszt składki ÷ Dzienny zasiłek netto
                </>
              </InfoTooltip>
            </h6>
            {(() => {
              // Roczny koszt składki chorobowej
              const yearlySicknessCost = zusData.chorobowa * 12;

              // Break-even dla Ryczałtu (zasiłek ≈ brutto, bo kwota wolna)
              const breakEvenRyczalt = Math.ceil(yearlySicknessCost / daily80Brutto);

              // Break-even dla Skali (zasiłek po podatku)
              const breakEvenSkala = Math.ceil(yearlySicknessCost / daily80NettoSkala);

              return (
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="border rounded p-3" style={{ backgroundColor: '#e8f5e9' }}>
                      <div className="fw-bold text-success">Ryczałt</div>
                      <div className="small text-muted mb-2">
                        Zasiłek ~bez podatku (kwota wolna 30 000 zł)
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small">Koszt chorobowej rocznie:</div>
                          <div className="small">Zasiłek 80% dziennie:</div>
                          <div className="fw-bold mt-1">Break-even:</div>
                        </div>
                        <div className="text-end">
                          <div className="small">{formatPLN(yearlySicknessCost)}</div>
                          <div className="small">{formatPLN(daily80Brutto)}</div>
                          <div className="fw-bold mt-1 fs-5 text-success">{breakEvenRyczalt} dni L4</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded p-3" style={{ backgroundColor: '#e3f2fd' }}>
                      <div className="fw-bold text-primary">Skala podatkowa</div>
                      <div className="small text-muted mb-2">
                        Zasiłek −{Math.round(marginalTaxRateSkala * 100)}% podatku
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small">Koszt chorobowej rocznie:</div>
                          <div className="small">Zasiłek 80% dziennie (netto):</div>
                          <div className="fw-bold mt-1">Break-even:</div>
                        </div>
                        <div className="text-end">
                          <div className="small">{formatPLN(yearlySicknessCost)}</div>
                          <div className="small">{formatPLN(daily80NettoSkala)}</div>
                          <div className="fw-bold mt-1 fs-5 text-primary">{breakEvenSkala} dni L4</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="alert alert-light small mb-0">
                      <strong>Wniosek:</strong> Przy {zusType === 'maly_zus' ? 'Małym' : 'Dużym'} ZUS,
                      składka chorobowa ({formatPLN(zusData.chorobowa)}/mies.) zwraca się po{' '}
                      <strong className="text-success">{breakEvenRyczalt} dniach</strong> L4 dla ryczałtu
                      lub <strong className="text-primary">{breakEvenSkala} dniach</strong> dla skali.
                      {breakEvenRyczalt <= 14 && (
                        <> Statystycznie chorujemy ~10-14 dni rocznie, więc <strong>warto płacić</strong>.</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Analiza podwyższonej podstawy */}
            {zusType === 'duzy_zus' && (
              <>
                <h6 className="mt-4 mb-3">
                  Opcjonalnie: Podwyższenie podstawy składek
                  <InfoTooltip>
                    <>
                      <strong>Czy warto płacić WYŻSZE składki?</strong>
                      {'\n\n'}
                      Możesz dobrowolnie zwiększyć podstawę składek społecznych
                      ponad standardowe {formatPLN(BIG_ZUS_BASE)}, aby otrzymać
                      wyższy zasiłek chorobowy.
                      {'\n\n'}
                      <strong>Ważne:</strong> Podwyższając podstawę, automatycznie
                      zwiększasz WSZYSTKIE składki (em., rent., wyp., chor., FP).
                      {'\n\n'}
                      <strong>Limity (2026):</strong>
                      {'\n'}• Minimum: {formatPLN(BIG_ZUS_BASE)} (standardowy Duży ZUS)
                      {'\n'}• Maksimum: {formatPLN(MAX_ZUS_BASE)} (250% przec. wynagr.)
                      {'\n\n'}
                      <strong>Uwaga:</strong> Ta sekcja analizuje czy opłaca się płacić
                      WIĘCEJ niż standardowy Duży ZUS, a nie czy opłaca się samo
                      ubezpieczenie chorobowe (to powyżej).
                    </>
                  </InfoTooltip>
                </h6>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small">
                      Zadeklarowana podstawa składek: <strong>{formatPLN(increasedBase)}</strong>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min={BIG_ZUS_BASE}
                      max={MAX_ZUS_BASE}
                      step={100}
                      value={increasedBase}
                      onChange={(e) => setIncreasedBase(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>{formatPLN(BIG_ZUS_BASE)}</span>
                      <span>{formatPLN(MAX_ZUS_BASE)}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted mb-1">Szybki wybór:</div>
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className={`btn ${increasedBase === BIG_ZUS_BASE ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setIncreasedBase(BIG_ZUS_BASE)}
                      >
                        Minimum
                      </button>
                      <button
                        type="button"
                        className={`btn ${increasedBase === 10000 ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setIncreasedBase(10000)}
                      >
                        10 000 zł
                      </button>
                      <button
                        type="button"
                        className={`btn ${increasedBase === 15000 ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setIncreasedBase(15000)}
                      >
                        15 000 zł
                      </button>
                      <button
                        type="button"
                        className={`btn ${increasedBase === MAX_ZUS_BASE ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setIncreasedBase(MAX_ZUS_BASE)}
                      >
                        Maksimum
                      </button>
                    </div>
                  </div>
                </div>

                {(() => {
                  // Obliczenia dla standardowej i podwyższonej podstawy
                  const standardZus = calculateZusFromBase(BIG_ZUS_BASE, true, true);
                  const increasedZus = calculateZusFromBase(increasedBase, true, true);
                  const extraMonthlyCost = increasedZus.razemZChorobowa - standardZus.razemZChorobowa;
                  const extraYearlyCost = extraMonthlyCost * 12;

                  // Zasiłek chorobowy przy różnych podstawach
                  const standardSickBase = BIG_ZUS_BASE * (1 - SOCIAL_DEDUCTION_RATE);
                  const increasedSickBase = increasedBase * (1 - SOCIAL_DEDUCTION_RATE);

                  const standardDaily80Brutto = (standardSickBase / 30) * 0.8;
                  const increasedDaily80Brutto = (increasedSickBase / 30) * 0.8;
                  const standardDaily80Netto = standardDaily80Brutto * (1 - marginalTaxRateSkala);
                  const increasedDaily80Netto = increasedDaily80Brutto * (1 - marginalTaxRateSkala);

                  const extraDailyBenefit = increasedDaily80Netto - standardDaily80Netto;

                  // Break-even: ile dni L4 potrzeba, żeby odzyskać dodatkowy roczny koszt
                  const breakEvenDays = extraDailyBenefit > 0 ? Math.ceil(extraYearlyCost / extraDailyBenefit) : Infinity;

                  return (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-3">
                        <thead className="table-light">
                          <tr>
                            <th></th>
                            <th className="text-end">Standardowa<br/><small className="text-muted fw-normal">{formatPLN(BIG_ZUS_BASE)}</small></th>
                            <th className="text-end">Podwyższona<br/><small className="text-muted fw-normal">{formatPLN(increasedBase)}</small></th>
                            <th className="text-end">Różnica</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Składki ZUS miesięcznie</td>
                            <td className="text-end">{formatPLN(standardZus.razemZChorobowa)}</td>
                            <td className="text-end">{formatPLN(increasedZus.razemZChorobowa)}</td>
                            <td className="text-end text-danger">+{formatPLN(extraMonthlyCost)}</td>
                          </tr>
                          <tr>
                            <td>Składki ZUS rocznie</td>
                            <td className="text-end">{formatPLN(standardZus.razemZChorobowa * 12)}</td>
                            <td className="text-end">{formatPLN(increasedZus.razemZChorobowa * 12)}</td>
                            <td className="text-end text-danger">+{formatPLN(extraYearlyCost)}</td>
                          </tr>
                          <tr className="table-info">
                            <td>Zasiłek 80% dziennie (netto)</td>
                            <td className="text-end">{formatPLN(standardDaily80Netto)}</td>
                            <td className="text-end">{formatPLN(increasedDaily80Netto)}</td>
                            <td className="text-end text-success">+{formatPLN(extraDailyBenefit)}</td>
                          </tr>
                          <tr className="table-warning">
                            <td>
                              <strong>Break-even</strong>
                              <InfoTooltip>
                                <>
                                  <strong>Punkt break-even</strong>
                                  {'\n\n'}
                                  Ile dni L4 w roku potrzebujesz, aby dodatkowy koszt
                                  składek zwrócił się w postaci wyższego zasiłku.
                                  {'\n\n'}
                                  <strong>Obliczenie:</strong>
                                  {'\n'}Dodatkowy roczny koszt ÷ Dodatkowy dzienny zasiłek
                                  {'\n'}= {formatPLN(extraYearlyCost)} ÷ {formatPLN(extraDailyBenefit)}
                                  {'\n'}= {breakEvenDays} dni
                                </>
                              </InfoTooltip>
                            </td>
                            <td colSpan={2} className="text-center">
                              {breakEvenDays === Infinity ? (
                                <span className="text-muted">—</span>
                              ) : (
                                <strong>{breakEvenDays} dni L4 w roku</strong>
                              )}
                            </td>
                            <td className="text-end small text-muted">
                              {breakEvenDays <= 14 && breakEvenDays !== Infinity && '(opłacalne)'}
                              {breakEvenDays > 14 && breakEvenDays <= 30 && '(umiarkowane)'}
                              {breakEvenDays > 30 && breakEvenDays !== Infinity && '(nieopłacalne)'}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {breakEvenDays !== Infinity && breakEvenDays > 0 && (
                        <div className={`alert ${breakEvenDays <= 14 ? 'alert-success' : breakEvenDays <= 30 ? 'alert-warning' : 'alert-danger'} small mb-0`}>
                          {breakEvenDays <= 14 && (
                            <>
                              <strong>Może być opłacalne!</strong> Jeśli chorujesz więcej niż {breakEvenDays} dni
                              w roku, podwyższenie podstawy się opłaci. Dodatkowo budujesz wyższą emeryturę.
                            </>
                          )}
                          {breakEvenDays > 14 && breakEvenDays <= 30 && (
                            <>
                              <strong>Umiarkowana opłacalność.</strong> Potrzebujesz {breakEvenDays} dni L4 rocznie,
                              żeby wyjść na zero. Rozważ, czy to realistyczne w Twoim przypadku.
                            </>
                          )}
                          {breakEvenDays > 30 && (
                            <>
                              <strong>Prawdopodobnie nieopłacalne.</strong> Potrzebujesz aż {breakEvenDays} dni L4
                              rocznie. Chyba że planujesz dłuższe zwolnienie (np. ciąża, operacja).
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            <div className="alert alert-info mt-3 mb-0 small">
              <strong>Ważne informacje:</strong>
              <ul className="mb-0 mt-2">
                <li>
                  <strong>Okres wyczekiwania:</strong> 90 dni ciągłego
                  ubezpieczenia chorobowego
                </li>
                <li>
                  <strong>Maksymalny okres zasiłku:</strong> 182 dni (270 dni przy
                  gruźlicy lub ciąży)
                </li>
                <li>
                  <strong>Dokumenty:</strong> e-ZLA (elektroniczne zwolnienie
                  lekarskie)
                </li>
                <li>
                  <strong>Wypłata:</strong> ZUS wypłaca zasiłek w ciągu 30 dni od
                  złożenia dokumentów
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
