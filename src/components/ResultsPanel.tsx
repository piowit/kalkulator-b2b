import { useState } from 'react';
import type { CalculationResult } from '../types';
import { formatPLN } from '../calculations';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MONTH_NAMES } from '../constants';

interface ResultsPanelProps {
  result: CalculationResult | null;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [zoomChart, setZoomChart] = useState(false);

  if (!result) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted py-5">
          <p className="mb-0">Wprowadź dane i kliknij "Oblicz" aby zobaczyć wyniki</p>
        </div>
      </div>
    );
  }

  const { ryczalt, skala, roznica, lepszyWariant, monthlyBreakdowns } = result;
  const isRyczaltBetter = lepszyWariant === 'ryczalt';
  const monthlyDiff = Math.round(Math.abs(roznica) / 12);

  // Dane do wykresu porównania netto rocznego
  const yearlyNettoData = [
    {
      name: 'Ryczałt 12%',
      netto: Math.round(ryczalt.netto),
      fill: '#4caf50',
    },
    {
      name: 'Skala',
      netto: Math.round(skala.netto),
      fill: '#2196f3',
    },
  ];

  // Dane do wykresu miesięcznego netto
  const monthlyNettoData = monthlyBreakdowns.map((breakdown, index) => ({
    name: MONTH_NAMES[index].slice(0, 3), // Skrócone nazwy miesięcy
    Ryczałt: Math.round(breakdown.ryczalt.netto),
    Skala: Math.round(breakdown.skala.netto),
  }));

  // Custom tooltip dla wykresu
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const ryczaltValue = payload.find(p => p.dataKey === 'Ryczałt')?.value ?? 0;
      const skalaValue = payload.find(p => p.dataKey === 'Skala')?.value ?? 0;
      const diff = ryczaltValue - skalaValue;
      const hasBothValues = payload.length === 2 && ryczaltValue > 0 && skalaValue > 0;

      return (
        <div className="bg-white border rounded p-2 shadow-sm">
          <p className="fw-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="mb-0 small" style={{ color: entry.color }}>
              {entry.name || entry.dataKey}: {formatPLN(entry.value)}
            </p>
          ))}
          {hasBothValues && (
            <p className={`mb-0 small fw-bold mt-1 pt-1 border-top ${diff > 0 ? 'text-success' : 'text-primary'}`}>
              Różnica: {diff > 0 ? '+' : ''}{formatPLN(diff)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Porównanie roczne</h5>
      </div>
      <div className="card-body">
        {/* Główne podsumowanie */}
        <div
          className={`alert ${isRyczaltBetter ? 'alert-success' : 'alert-info'} mb-4`}
        >
          <h5 className="alert-heading">
            {isRyczaltBetter ? 'Ryczałt 12%' : 'Skala Podatkowa'} jest
            korzystniejszy!
          </h5>
          <p className="mb-0">
            Różnica: <strong>{formatPLN(Math.abs(roznica))}</strong> więcej "na
            rękę" rocznie
            <span className="text-muted ms-2">
              (czyli ~<strong>{formatPLN(monthlyDiff)}</strong>/mies.)
            </span>
          </p>
        </div>

        {/* Wykresy */}
        <div className="row g-4 mb-4">
          {/* Wykres porównania netto rocznego */}
          <div className="col-md-5">
            <h6 className="text-center mb-3">Netto roczne "na rękę"</h6>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={yearlyNettoData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="netto" radius={[0, 4, 4, 0]}>
                  {yearlyNettoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center small text-muted mt-2">
              Różnica: <strong className={isRyczaltBetter ? 'text-success' : 'text-primary'}>
                {formatPLN(Math.abs(roznica))}
              </strong> na korzyść {isRyczaltBetter ? 'Ryczałtu' : 'Skali'}
            </div>
          </div>

          {/* Wykres liniowy miesięcznego netto */}
          <div className="col-md-7">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Netto miesięczne przez rok</h6>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="zoomToggle"
                  checked={zoomChart}
                  onChange={() => setZoomChart(!zoomChart)}
                />
                <label className="form-check-label small" htmlFor="zoomToggle">
                  Zoom
                </label>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={monthlyNettoData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  tick={{ fontSize: 11 }}
                  width={40}
                  domain={zoomChart ? ['dataMin - 500', 'dataMax + 500'] : [0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Ryczałt"
                  stroke="#4caf50"
                  strokeWidth={2}
                  dot={{ fill: '#4caf50', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Skala"
                  stroke="#2196f3"
                  strokeWidth={2}
                  dot={{ fill: '#2196f3', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela porównawcza */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th></th>
                <th
                  className={`text-center ${isRyczaltBetter ? 'table-success' : ''}`}
                >
                  Ryczałt 12%
                </th>
                <th
                  className={`text-center ${!isRyczaltBetter ? 'table-success' : ''}`}
                >
                  Skala Podatkowa
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Przychód roczny</td>
                <td className="text-end">{formatPLN(ryczalt.przychod)}</td>
                <td className="text-end">{formatPLN(skala.przychod)}</td>
              </tr>
              <tr>
                <td>Składki społeczne (ZUS)</td>
                <td className="text-end text-danger">
                  -{formatPLN(ryczalt.skladkiSpoleczne)}
                </td>
                <td className="text-end text-danger">
                  -{formatPLN(skala.skladkiSpoleczne)}
                </td>
              </tr>
              <tr className="table-light">
                <td>Dochód (przychód - składki)</td>
                <td className="text-end">
                  {formatPLN(ryczalt.przychod - ryczalt.skladkiSpoleczne)}
                </td>
                <td className="text-end">{formatPLN(skala.dochod)}</td>
              </tr>
              <tr>
                <td>Składka zdrowotna</td>
                <td className="text-end text-danger">
                  -{formatPLN(ryczalt.skladkaZdrowotna)}
                </td>
                <td className="text-end text-danger">
                  -{formatPLN(skala.skladkaZdrowotna)}
                </td>
              </tr>
              <tr>
                <td>
                  Odliczenie 50% zdrowotnej
                  <small className="text-muted d-block">
                    (tylko ryczałt)
                  </small>
                </td>
                <td className="text-end text-success">
                  {formatPLN(ryczalt.odliczenie50Zdrowotnej)}
                </td>
                <td className="text-end text-muted">-</td>
              </tr>
              <tr className="table-light">
                <td>Podstawa opodatkowania</td>
                <td className="text-end">
                  {formatPLN(ryczalt.podstawaOpodatkowania)}
                </td>
                <td className="text-end">
                  {formatPLN(skala.podstawaOpodatkowania)}
                </td>
              </tr>
              <tr>
                <td>Podatek dochodowy</td>
                <td className="text-end text-danger">
                  -{formatPLN(ryczalt.podatek)}
                </td>
                <td className="text-end text-danger">
                  -{formatPLN(skala.podatek)}
                </td>
              </tr>
              <tr className="table-primary fw-bold">
                <td>Netto "na rękę"</td>
                <td
                  className={`text-end ${isRyczaltBetter ? 'text-success' : ''}`}
                >
                  {formatPLN(ryczalt.netto)}
                </td>
                <td
                  className={`text-end ${!isRyczaltBetter ? 'text-success' : ''}`}
                >
                  {formatPLN(skala.netto)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Szczegóły obliczeń */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Ryczałt 12% - szczegóły</h6>
                <ul className="list-unstyled mb-0 small">
                  <li>
                    Podatek = {formatPLN(ryczalt.podstawaOpodatkowania)} × 12% ={' '}
                    {formatPLN(ryczalt.podatek)}
                  </li>
                  <li>
                    Składka zdrowotna zależy od progu przychodu rocznego
                  </li>
                  <li>50% składki zdrowotnej odliczane od przychodu</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Skala Podatkowa - szczegóły</h6>
                <ul className="list-unstyled mb-0 small">
                  <li>
                    Stawki: 12% do 120 000 zł, 32% powyżej
                  </li>
                  <li>
                    Kwota wolna: 30 000 zł (zmniejsza podatek o 3 600 zł)
                  </li>
                  <li>Składka zdrowotna = 9% dochodu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
