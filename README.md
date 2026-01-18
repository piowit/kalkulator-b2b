# Kalkulator B2B - Ryczałt vs Skala (2026)

Kalkulator podatkowy dla samozatrudnionych w branży IT w Polsce. Porównuje dwie formy opodatkowania i pomaga wybrać korzystniejszą opcję.

## Funkcje

- **Porównanie form opodatkowania**: Ryczałt 12% vs Skala podatkowa (12%/32%)
- **Elastyczne dane miesięczne**: Osobne ustawienia ZUS dla każdego miesiąca
- **Typy ZUS**: Ulga na start, Mały ZUS, Duży ZUS
- **Dobrowolne chorobowe**: Opcja włączenia/wyłączenia składki chorobowej
- **Auto-kalkulacja**: Wyniki aktualizują się automatycznie
- **Kalkulator L4**: Symulacja zasiłku chorobowego z analizą opłacalności
- **Tooltips**: Szczegółowe wyjaśnienia przy każdym polu

## Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/user/kalkulator-b2b.git
cd kalkulator-b2b

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev
```

## Użycie

1. Wpisz miesięczne przychody netto z faktur
2. Wybierz rodzaj ZUS dla każdego miesiąca
3. Zaznacz czy płacisz dobrowolne chorobowe
4. Wyniki pojawią się automatycznie

Możesz użyć przycisku "↓" aby skopiować dane z danego miesiąca do wszystkich następnych.

## Stałe podatkowe (2026)

| Parametr | Wartość |
|----------|---------|
| Płaca minimalna | 4 806 zł |
| Przeciętne wynagrodzenie | 9 420 zł |
| Mały ZUS (podstawa) | 1 441,80 zł |
| Duży ZUS (podstawa) | 5 652,00 zł |
| Próg podatkowy | 120 000 zł |
| Kwota wolna | 30 000 zł |
| Ryczałt IT | 12% |

## Technologie

- [React 19](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/) - bundler
- [Bootstrap 5](https://getbootstrap.com/) - stylizacja
- [Tippy.js](https://atomiks.github.io/tippyjs/) - tooltipy

## Budowanie

```bash
# Build produkcyjny
npm run build

# Podgląd builda
npm run preview
```

Pliki produkcyjne znajdziesz w katalogu `dist/`.

## Licencja

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) - Możesz używać i modyfikować do celów niekomercyjnych z podaniem autorstwa. Użycie komercyjne wymaga zgody autora.

## Zastrzeżenie

Kalkulator służy celom informacyjnym. Skonsultuj się z księgowym przed podjęciem decyzji podatkowych. Autor nie ponosi odpowiedzialności za decyzje podjęte na podstawie wyników kalkulatora.
