import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface InfoTooltipProps {
  children: React.ReactNode;
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <Tippy
      content={
        <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
          {children}
        </div>
      }
      placement="bottom"
      arrow={true}
      delay={[0, 0]}
      duration={[150, 150]}
      maxWidth={350}
      interactive={false}
      appendTo={() => document.body}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#6c757d',
          color: 'white',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'help',
          marginLeft: '4px',
          flexShrink: 0,
        }}
      >
        ?
      </span>
    </Tippy>
  );
}

// Szczegółowe opisy obliczeń
export const TOOLTIP_CONTENT = {
  skladkiSpoleczne: (
    <>
      <strong>Składki społeczne ZUS</strong>
      {'\n\n'}
      Składają się z:
      {'\n'}• Emerytalna: 19,52% podstawy
      {'\n'}• Rentowa: 8% podstawy
      {'\n'}• Wypadkowa: 1,67% podstawy
      {'\n'}• Chorobowa: 2,45% podstawy (dobrowolna)
      {'\n'}• Fundusz Pracy: 2,45% (tylko duży ZUS)
      {'\n\n'}
      <strong>Mały ZUS:</strong> 420,86 zł (bez chor.) / 456,18 zł (z chor.)
      {'\n'}
      <strong>Duży ZUS:</strong> 1788,30 zł (bez chor.) / 1926,77 zł (z chor.)
      {'\n'}
      <strong>Ulga na start:</strong> 0 zł
    </>
  ),

  ryczaltHeader: (
    <>
      <strong>Ryczałt od przychodów ewidencjonowanych 12%</strong>
      {'\n\n'}
      Uproszczona forma opodatkowania dla IT.
      {'\n\n'}
      <strong>Zalety:</strong>
      {'\n'}• Stała stawka 12% (niezależna od dochodu)
      {'\n'}• Można odliczyć 50% składki zdrowotnej
      {'\n'}• Składka zdrowotna stała (wg progu przychodu)
      {'\n\n'}
      <strong>Wady:</strong>
      {'\n'}• Brak możliwości odliczenia kosztów
      {'\n'}• Brak kwoty wolnej od podatku
    </>
  ),

  skalaHeader: (
    <>
      <strong>Skala podatkowa (zasady ogólne)</strong>
      {'\n\n'}
      Progresywne opodatkowanie dochodu.
      {'\n\n'}
      <strong>Stawki:</strong>
      {'\n'}• 12% — dochód do 120 000 zł
      {'\n'}• 32% — dochód powyżej 120 000 zł
      {'\n\n'}
      <strong>Zalety:</strong>
      {'\n'}• Kwota wolna 30 000 zł (zmniejsza podatek o 3 600 zł)
      {'\n'}• Możliwość odliczenia kosztów
      {'\n\n'}
      <strong>Wady:</strong>
      {'\n'}• Wyższe stawki przy wysokich dochodach
      {'\n'}• Składka zdrowotna 9% od dochodu
    </>
  ),

  ryczaltZdrowotna: (
    <>
      <strong>Składka zdrowotna (ryczałt)</strong>
      {'\n\n'}
      Stała miesięczna kwota zależna od rocznego przychodu:
      {'\n\n'}
      <strong>Progi przychodu rocznego:</strong>
      {'\n'}• do 60 000 zł → 461,66 zł/mies.
      {'\n'}• 60 000 – 300 000 zł → 769,43 zł/mies.
      {'\n'}• powyżej 300 000 zł → 1 384,97 zł/mies.
      {'\n\n'}
      <strong>Wzór:</strong> 9% × podstawa (60%/100%/180% przec. wynagr.)
      {'\n'}
      <strong>Minimum:</strong> 432,54 zł/mies.
    </>
  ),

  ryczaltPodatek: (
    <>
      <strong>Podatek dochodowy (ryczałt)</strong>
      {'\n\n'}
      <strong>Wzór:</strong>
      {'\n'}Podatek = 12% × (Przychód − 50% składki zdrowotnej)
      {'\n\n'}
      <strong>Przykład (przychód 13 200 zł/mies.):</strong>
      {'\n'}• Roczny przychód: 158 400 zł
      {'\n'}• Składka zdrowotna roczna: 9 233 zł
      {'\n'}• Odliczenie 50%: 4 617 zł
      {'\n'}• Podstawa: 158 400 − 4 617 = 153 783 zł
      {'\n'}• Podatek: 12% × 153 783 = 18 454 zł
    </>
  ),

  ryczaltNetto: (
    <>
      <strong>Kwota netto "na rękę" (ryczałt)</strong>
      {'\n\n'}
      <strong>Wzór:</strong>
      {'\n'}Netto = Przychód − Składki ZUS − Składka zdrowotna − Podatek
      {'\n\n'}
      <strong>Przykład (przychód 13 200 zł/mies.):</strong>
      {'\n'}• Przychód roczny: 158 400 zł
      {'\n'}• − Składki ZUS: 23 121 zł
      {'\n'}• − Składka zdrowotna: 9 233 zł
      {'\n'}• − Podatek: 18 454 zł
      {'\n'}• = Netto: 107 592 zł (8 966 zł/mies.)
    </>
  ),

  skalaZdrowotna: (
    <>
      <strong>Składka zdrowotna (skala)</strong>
      {'\n\n'}
      <strong>Wzór:</strong>
      {'\n'}Składka = 9% × Dochód
      {'\n'}(gdzie Dochód = Przychód − Składki społeczne)
      {'\n\n'}
      <strong>Minimum:</strong> 432,54 zł/mies.
      {'\n\n'}
      <strong>Przykład (przychód 13 200 zł/mies.):</strong>
      {'\n'}• Dochód roczny: 158 400 − 23 121 = 135 279 zł
      {'\n'}• Składka: 9% × 135 279 = 12 175 zł rocznie
      {'\n'}• Miesięcznie: ~1 015 zł
      {'\n\n'}
      <strong>Uwaga:</strong> Składka zdrowotna NIE obniża podatku!
    </>
  ),

  skalaPodatek: (
    <>
      <strong>Podatek dochodowy (skala)</strong>
      {'\n\n'}
      <strong>Wzór:</strong>
      {'\n'}• Dochód ≤ 120 000 zł:
      {'\n'}  Podatek = 12% × Dochód − 3 600 zł
      {'\n\n'}
      • Dochód {'>'} 120 000 zł:
      {'\n'}  Podatek = 10 800 zł + 32% × (Dochód − 120 000)
      {'\n\n'}
      <strong>Przykład (przychód 13 200 zł/mies.):</strong>
      {'\n'}• Dochód: 135 279 zł (powyżej progu!)
      {'\n'}• Podatek z I progu: 10 800 zł
      {'\n'}• Nadwyżka: 135 279 − 120 000 = 15 279 zł
      {'\n'}• Podatek z nadwyżki: 32% × 15 279 = 4 889 zł
      {'\n'}• Razem: 10 800 + 4 889 = 15 689 zł
    </>
  ),

  skalaNetto: (
    <>
      <strong>Kwota netto "na rękę" (skala)</strong>
      {'\n\n'}
      <strong>Wzór:</strong>
      {'\n'}Netto = Przychód − Składki ZUS − Składka zdrowotna − Podatek
      {'\n\n'}
      <strong>Przykład (przychód 13 200 zł/mies.):</strong>
      {'\n'}• Przychód roczny: 158 400 zł
      {'\n'}• − Składki ZUS: 23 121 zł
      {'\n'}• − Składka zdrowotna: 12 175 zł
      {'\n'}• − Podatek: 15 689 zł
      {'\n'}• = Netto: 107 415 zł (8 951 zł/mies.)
    </>
  ),

  zusBezChorobowej: (
    <>
      <strong>Składki społeczne ZUS (bez chorobowej)</strong>
      {'\n\n'}
      Obowiązkowe składki społeczne:
      {'\n'}• Emerytalna: 19,52% podstawy
      {'\n'}• Rentowa: 8% podstawy
      {'\n'}• Wypadkowa: 1,67% podstawy
      {'\n'}• Fundusz Pracy: 2,45% (tylko duży ZUS)
      {'\n\n'}
      <strong>Kwoty miesięczne:</strong>
      {'\n'}• Mały ZUS: 420,86 zł
      {'\n'}• Duży ZUS: 1 788,30 zł
      {'\n'}• Ulga na start: 0 zł
    </>
  ),

  skladkaChorobowa: (
    <>
      <strong>Składka chorobowa (dobrowolna)</strong>
      {'\n\n'}
      Ubezpieczenie chorobowe jest dobrowolne dla przedsiębiorców.
      {'\n\n'}
      <strong>Stawka:</strong> 2,45% podstawy wymiaru
      {'\n\n'}
      <strong>Kwoty miesięczne:</strong>
      {'\n'}• Mały ZUS: 35,32 zł
      {'\n'}• Duży ZUS: 138,47 zł
      {'\n'}• Ulga na start: niedostępne
      {'\n\n'}
      <strong>Korzyści:</strong>
      {'\n'}• Prawo do zasiłku chorobowego (L4)
      {'\n'}• Zasiłek macierzyński/tacierzyński
      {'\n'}• Zasiłek opiekuńczy
      {'\n\n'}
      <strong>Uwaga:</strong> Aby uzyskać prawo do zasiłku, wymagany jest
      {'\n'}90-dniowy okres wyczekiwania (ciągłego opłacania składki).
    </>
  ),
};
