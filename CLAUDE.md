# CLAUDE.md - Instrukcje dla Claude Code

## Opis projektu

Kalkulator podatkowy B2B dla samozatrudnionych w Polsce (rok 2026). Porównuje dwie formy opodatkowania:
- **Ryczałt 12%** - uproszczona forma dla IT
- **Skala podatkowa** - progresywna (12%/32%)

## Technologie

- React 19 + TypeScript
- Vite (bundler)
- Bootstrap 5 (stylizacja)
- Tippy.js (tooltipy)

## Struktura projektu

```
src/
├── App.tsx              # Główny komponent, stan aplikacji
├── constants.ts         # Stałe podatkowe i ZUS na 2026
├── calculations.ts      # Logika obliczeń podatkowych
├── types.ts             # Typy TypeScript
└── components/
    ├── MonthlyForm.tsx  # Formularz z 12 miesiącami
    ├── MonthRow.tsx     # Wiersz pojedynczego miesiąca
    ├── ResultsPanel.tsx # Wyniki porównania
    ├── SickLeavePanel.tsx # Kalkulator zasiłku chorobowego
    └── InfoTooltip.tsx  # Komponenty tooltipów
```

## Komendy

```bash
npm run dev      # Serwer deweloperski
npm run build    # Build produkcyjny
npm run preview  # Podgląd builda
npm run lint     # Linting
```

## Ważne stałe (2026)

- Płaca minimalna: 4 806 zł
- Przeciętne wynagrodzenie: 9 420 zł
- Mały ZUS podstawa: 1 441,80 zł
- Duży ZUS podstawa: 5 652,00 zł
- Próg podatkowy (skala): 120 000 zł
- Kwota wolna: 30 000 zł (zmniejsza podatek o 3 600 zł)

## Zasady przy modyfikacji

1. Wszystkie stałe podatkowe trzymaj w `constants.ts`
2. Logikę obliczeń trzymaj w `calculations.ts`
3. Używaj Bootstrap 5 do stylizacji (nie custom CSS)
4. Tooltipy dodawaj przez komponent `InfoTooltip`
5. Pamiętaj o różnicy w opodatkowaniu zasiłku chorobowego:
   - Ryczałtowiec: ~0% (korzysta z kwoty wolnej 30k)
   - Skala: pełna stawka krańcowa (12% lub 32%)
