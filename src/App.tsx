import { useState, useEffect } from 'react';
import { MonthlyForm } from './components/MonthlyForm';
import { ResultsPanel } from './components/ResultsPanel';
import { SickLeavePanel } from './components/SickLeavePanel';
import { compare } from './calculations';
import type { MonthData, CalculationResult } from './types';

const STORAGE_KEY = 'podatki-b2b-calculator';

// Domyślna kwota ~13200 zł daje praktycznie zerową różnicę między ryczałtem a skalą
const DEFAULT_REVENUE = 13200;

const createDefaultMonth = (): MonthData => ({
  revenue: DEFAULT_REVENUE,
  zusType: 'duzy_zus',
  voluntarySickness: true,
});

const createEmptyMonth = (): MonthData => ({
  revenue: 0,
  zusType: 'duzy_zus',
  voluntarySickness: true,
});

const createDefaultMonths = (): MonthData[] =>
  Array.from({ length: 12 }, createDefaultMonth);

const createEmptyMonths = (): MonthData[] =>
  Array.from({ length: 12 }, createEmptyMonth);

function loadFromStorage(): { months: MonthData[]; isFromStorage: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const months = JSON.parse(saved) as MonthData[];
      if (Array.isArray(months) && months.length === 12) {
        return { months, isFromStorage: true };
      }
    }
  } catch {
    // ignore parse errors
  }
  // Brak zapisanych danych - użyj domyślnych wartości
  return { months: createDefaultMonths(), isFromStorage: false };
}

function App() {
  const [months, setMonths] = useState<MonthData[]>(() => loadFromStorage().months);
  const [result, setResult] = useState<CalculationResult | null>(() => {
    // Zawsze oblicz wyniki przy starcie (domyślne dane lub zapisane)
    const { months } = loadFromStorage();
    return compare(months);
  });

  // Zapisz do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
  }, [months]);

  // Auto-obliczanie z debounce (300ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasAnyRevenue = months.some((m) => m.revenue > 0);
      if (hasAnyRevenue) {
        const calculationResult = compare(months);
        setResult(calculationResult);
      } else {
        setResult(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [months]);

  const handleMonthChange = (index: number, data: MonthData) => {
    setMonths((prev) => {
      const newMonths = [...prev];
      newMonths[index] = data;
      return newMonths;
    });
  };

  const handleFillFromMonth = (fromIndex: number) => {
    setMonths((prev) => {
      const newMonths = [...prev];
      const sourceData = prev[fromIndex];
      for (let i = fromIndex + 1; i < 12; i++) {
        newMonths[i] = { ...sourceData };
      }
      return newMonths;
    });
  };

  const handleCalculate = () => {
    const calculationResult = compare(months);
    setResult(calculationResult);
  };

  const handleClear = () => {
    const emptyMonths = createEmptyMonths();
    setMonths(emptyMonths);
    setResult(null);
    // Zapisz puste dane do localStorage (nie usuwaj, bo useEffect i tak zapisze)
  };

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <header className="text-center mb-4">
          <h1 className="h2">Kalkulator Podatkowy B2B</h1>
          <p className="text-muted">
            Porównanie: Ryczałt 12% vs Skala Podatkowa (rok 2026)
          </p>
        </header>

        <div className="row g-4">
          <div className="col-12">
            <MonthlyForm
              months={months}
              breakdowns={result?.monthlyBreakdowns ?? null}
              onMonthChange={handleMonthChange}
              onFillFromMonth={handleFillFromMonth}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          </div>
          <div className="col-12">
            <ResultsPanel result={result} />
          </div>
          <div className="col-12">
            <SickLeavePanel months={months} />
          </div>
        </div>

        <footer className="text-center text-muted mt-5 pt-4 border-top">
          <small>
            Kalkulator służy celom informacyjnym. Skonsultuj się z księgowym
            przed podjęciem decyzji podatkowych.
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
