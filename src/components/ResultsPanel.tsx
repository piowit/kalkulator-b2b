import type { CalculationResult } from '../types';
import { formatPLN } from '../calculations';

interface ResultsPanelProps {
  result: CalculationResult | null;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted py-5">
          <p className="mb-0">Wprowadź dane i kliknij "Oblicz" aby zobaczyć wyniki</p>
        </div>
      </div>
    );
  }

  const { ryczalt, skala, roznica, lepszyWariant } = result;
  const isRyczaltBetter = lepszyWariant === 'ryczalt';

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
          </p>
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
