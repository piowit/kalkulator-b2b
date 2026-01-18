import { MonthRow } from './MonthRow';
import { InfoTooltip, TOOLTIP_CONTENT } from './InfoTooltip';
import type { MonthData, MonthlyBreakdown } from '../types';

interface MonthlyFormProps {
  months: MonthData[];
  breakdowns: MonthlyBreakdown[] | null;
  onMonthChange: (index: number, data: MonthData) => void;
  onFillFromMonth: (fromIndex: number) => void;
  onCalculate: () => void;
  onClear: () => void;
}

export function MonthlyForm({
  months,
  breakdowns,
  onMonthChange,
  onFillFromMonth,
  onCalculate,
  onClear,
}: MonthlyFormProps) {
  const hasBreakdowns = breakdowns !== null && breakdowns.length > 0;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Dane miesięczne</h5>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onCalculate}
          >
            Oblicz
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onClear}
          >
            Wyczyść
          </button>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Miesiąc</th>
                <th>Przychód</th>
                <th>ZUS</th>
                <th className="text-center">Chor.</th>
                <th></th>
                {hasBreakdowns && (
                  <>
                    <th
                      className="text-end border-start"
                      colSpan={2}
                    >
                      <span className="d-flex align-items-center justify-content-end">
                        Składki ZUS
                        <InfoTooltip>{TOOLTIP_CONTENT.skladkiSpoleczne}</InfoTooltip>
                      </span>
                    </th>
                    <th
                      className="text-end border-start"
                      colSpan={3}
                      style={{ backgroundColor: '#e8f5e9' }}
                    >
                      <span className="d-flex align-items-center justify-content-end">
                        Ryczałt 12%
                        <InfoTooltip>{TOOLTIP_CONTENT.ryczaltHeader}</InfoTooltip>
                      </span>
                    </th>
                    <th
                      className="text-end border-start"
                      colSpan={3}
                      style={{ backgroundColor: '#e3f2fd' }}
                    >
                      <span className="d-flex align-items-center justify-content-end">
                        Skala
                        <InfoTooltip>{TOOLTIP_CONTENT.skalaHeader}</InfoTooltip>
                      </span>
                    </th>
                  </>
                )}
              </tr>
              {hasBreakdowns && (
                <tr className="small">
                  <th colSpan={5}></th>
                  <th className="text-end border-start text-muted">
                    <span className="d-flex align-items-center justify-content-end">
                      ZUS
                      <InfoTooltip>{TOOLTIP_CONTENT.zusBezChorobowej}</InfoTooltip>
                    </span>
                  </th>
                  <th className="text-end text-muted">
                    <span className="d-flex align-items-center justify-content-end">
                      Chor.
                      <InfoTooltip>{TOOLTIP_CONTENT.skladkaChorobowa}</InfoTooltip>
                    </span>
                  </th>
                  <th
                    className="text-end border-start"
                    style={{ backgroundColor: '#e8f5e9' }}
                  >
                    <span className="d-flex align-items-center justify-content-end">
                      Zdr.
                      <InfoTooltip>{TOOLTIP_CONTENT.ryczaltZdrowotna}</InfoTooltip>
                    </span>
                  </th>
                  <th className="text-end" style={{ backgroundColor: '#e8f5e9' }}>
                    <span className="d-flex align-items-center justify-content-end">
                      Podat.
                      <InfoTooltip>{TOOLTIP_CONTENT.ryczaltPodatek}</InfoTooltip>
                    </span>
                  </th>
                  <th
                    className="text-end fw-bold"
                    style={{ backgroundColor: '#c8e6c9' }}
                  >
                    <span className="d-flex align-items-center justify-content-end">
                      Netto
                      <InfoTooltip>{TOOLTIP_CONTENT.ryczaltNetto}</InfoTooltip>
                    </span>
                  </th>
                  <th
                    className="text-end border-start"
                    style={{ backgroundColor: '#e3f2fd' }}
                  >
                    <span className="d-flex align-items-center justify-content-end">
                      Zdr.
                      <InfoTooltip>{TOOLTIP_CONTENT.skalaZdrowotna}</InfoTooltip>
                    </span>
                  </th>
                  <th className="text-end" style={{ backgroundColor: '#e3f2fd' }}>
                    <span className="d-flex align-items-center justify-content-end">
                      Podat.
                      <InfoTooltip>{TOOLTIP_CONTENT.skalaPodatek}</InfoTooltip>
                    </span>
                  </th>
                  <th
                    className="text-end fw-bold"
                    style={{ backgroundColor: '#bbdefb' }}
                  >
                    <span className="d-flex align-items-center justify-content-end">
                      Netto
                      <InfoTooltip>{TOOLTIP_CONTENT.skalaNetto}</InfoTooltip>
                    </span>
                  </th>
                </tr>
              )}
            </thead>
            <tbody>
              {months.map((month, index) => (
                <MonthRow
                  key={index}
                  monthIndex={index}
                  data={month}
                  breakdown={breakdowns?.[index] ?? null}
                  onChange={(data) => onMonthChange(index, data)}
                  onFillNext={() => onFillFromMonth(index)}
                  isLast={index === 11}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
