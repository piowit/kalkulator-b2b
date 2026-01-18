import type { MonthData, MonthlyBreakdown, ZusType } from '../types';
import { ZUS_LABELS } from '../types';
import { MONTH_NAMES } from '../constants';
import { formatPLN } from '../calculations';

interface MonthRowProps {
  monthIndex: number;
  data: MonthData;
  breakdown: MonthlyBreakdown | null;
  onChange: (data: MonthData) => void;
  onFillNext: () => void;
  isLast: boolean;
}

export function MonthRow({
  monthIndex,
  data,
  breakdown,
  onChange,
  onFillNext,
  isLast,
}: MonthRowProps) {
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onChange({ ...data, revenue: value });
  };

  const handleZusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zusType = e.target.value as ZusType;
    const voluntarySickness =
      zusType === 'ulga_na_start' ? false : data.voluntarySickness;
    onChange({ ...data, zusType, voluntarySickness });
  };

  const handleSicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, voluntarySickness: e.target.checked });
  };

  const isUlgaNaStart = data.zusType === 'ulga_na_start';

  return (
    <tr>
      <td className="align-middle fw-medium" style={{ minWidth: '90px' }}>
        {MONTH_NAMES[monthIndex]}
      </td>
      <td style={{ minWidth: '140px' }}>
        <div className="input-group input-group-sm">
          <input
            type="number"
            className="form-control"
            value={data.revenue || ''}
            onChange={handleRevenueChange}
            placeholder="0"
            min="0"
            step="100"
          />
          <span className="input-group-text">zł</span>
        </div>
      </td>
      <td style={{ minWidth: '130px' }}>
        <select
          className="form-select form-select-sm"
          value={data.zusType}
          onChange={handleZusChange}
        >
          {(Object.keys(ZUS_LABELS) as ZusType[]).map((type) => (
            <option key={type} value={type}>
              {ZUS_LABELS[type]}
            </option>
          ))}
        </select>
      </td>
      <td className="align-middle text-center" style={{ width: '50px' }}>
        <div className="form-check d-flex justify-content-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={data.voluntarySickness}
            onChange={handleSicknessChange}
            disabled={isUlgaNaStart}
            title={
              isUlgaNaStart
                ? 'Niedostępne przy Uldze na start'
                : 'Dobrowolne chorobowe'
            }
          />
        </div>
      </td>
      <td style={{ width: '40px' }}>
        {!isLast && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm py-0 px-1"
            onClick={onFillNext}
            title="Wypełnij następne miesiące"
          >
            ↓
          </button>
        )}
      </td>

      {/* Kolumny z obliczeniami - widoczne tylko gdy są dane */}
      {breakdown && (
        <>
          <td className="text-end small text-muted border-start">
            {formatPLN(breakdown.skladkiZusBezChorobowej)}
          </td>
          <td className={`text-end small ${breakdown.skladkaChorobowa > 0 ? 'bg-sickness' : ''}`}>
            {formatPLN(breakdown.skladkaChorobowa)}
          </td>
          <td className="text-end small border-start bg-ryczalt">
            {formatPLN(breakdown.ryczalt.skladkaZdrowotna)}
          </td>
          <td className="text-end small bg-ryczalt">
            {formatPLN(breakdown.ryczalt.podatek)}
          </td>
          <td className="text-end small fw-medium bg-ryczalt-strong">
            {formatPLN(breakdown.ryczalt.netto)}
          </td>
          <td className="text-end small border-start bg-skala">
            {formatPLN(breakdown.skala.skladkaZdrowotna)}
          </td>
          <td className="text-end small bg-skala">
            {formatPLN(breakdown.skala.podatek)}
          </td>
          <td className="text-end small fw-medium bg-skala-strong">
            {formatPLN(breakdown.skala.netto)}
          </td>
        </>
      )}
    </tr>
  );
}
