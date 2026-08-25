# Thai Fuel Price ⛽

Compare Thai fuel prices across dates and see how much more you're paying since the US-Iran war.

## Features

- **Interactive price chart** — 3-month SVG area chart with click-to-select date comparison (A/B pins)
- **Preset ranges** — Quick compare: Pre US-Iran war, 7D, 14D, 30D
- **7 fuel types** — Gasoline 95, Gasohol 95/91/E20/E85, Diesel, Diesel B20
- **Car model estimator** — Select brand (Toyota, Honda, Mazda, Isuzu), model, and fill level to auto-calculate litres
- **EN/TH localization** — Full Thai language support with one-click toggle
- **Claymorphism design** — Playful 3D cards, chunky borders, indigo+orange palette

## Tech Stack

- **Preact** + `@preact/signals` for reactive state
- **Vite** for dev/build
- **TypeScript** (strict)
- **Plain CSS** — no frameworks, claymorphism design system
- **Zero chart dependencies** — pure SVG

## Getting Started

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
bun run preview
```

## Project Structure

```
src/
  main.tsx          — Entry point
  app.tsx           — Root component + all UI
  app.css           — Styles (claymorphism theme)
  PriceChart.tsx    — SVG area chart with date selection
  i18n.ts           — EN/TH translations
data/
  prices.json       — Daily fuel prices (THB/litre)
public/
  favicon.svg       — Fuel pump icon
```

## Data

Prices are stored in `data/prices.json` as an array of `{ date, prices }` entries. Dates are `YYYY-MM-DD` format. Not all fuel types exist in every entry.

### Data Source

Retail fuel prices are sourced from [EPPO](https://www.eppo.go.th) (Energy Policy and Planning Office, Ministry of Energy, Thailand). The daily updater reads EPPO's public retail-price API and records PTT prices for Bangkok metropolitan area.

- **Source URL**: https://www.eppo.go.th/index.php/th/petroleum/price/structure-oil-price
- **Update frequency**: Daily (business days), auto-fetched at 10 AM GMT+7 via GitHub Actions
- **Script**: `scripts/fetch-price.py` — fetches the current EPPO retail prices and appends them to `data/prices.json`

### Tank Capacity References

Car model fuel tank sizes are sourced from official Thai dealer spec pages:

| Brand | Model | Tank (L) | Source |
|-------|-------|----------|--------|
| Toyota | Yaris Ativ | 40 | [toyota.co.th](https://www.toyota.co.th/en/model/yarisativ/specification) |
| Toyota | Corolla Cross | 36 | [toyota.co.th](https://www.toyota.co.th/en/model/corollacross/specification) |
| Toyota | Hilux Revo | 80 | [toyota.co.th](https://www.toyota.co.th/en/model/hilux_revo_zedition/specification) |
| Toyota | Fortuner | 80 | [toyota.co.th](https://www.toyota.co.th/en/model/fortuner_leader/specification) |
| Honda | City | 40 | [honda.co.th](https://www.honda.co.th/en/city) |
| Honda | Civic | 47 | [honda.co.th](https://www.honda.co.th/en/civic) |
| Honda | HR-V | 40 | [honda.co.th](https://www.honda.co.th/en/hrv) |
| Honda | CR-V | 53 | [honda.co.th](https://www.honda.co.th/en/crv) |
| Mazda | Mazda 2 | 44 | [mazda.co.th](https://www.mazda.co.th/vehicles/mazda2/) |
| Mazda | Mazda 3 | 51 | [mazda.co.th](https://www.mazda.co.th/vehicles/mazda3/) |
| Mazda | CX-30 | 48 | [mazda.co.th](https://www.mazda.co.th/vehicles/mazda-cx-30/) |
| Mazda | CX-5 | 56 | [mazda.co.th](https://www.mazda.co.th/vehicles/mazda-cx-5/) |
| Isuzu | D-Max | 76 | [isuzu.co.th](https://www.isuzu.co.th/index.php) |
| Isuzu | MU-X | 80 | [isuzu.co.th](https://www.isuzu.co.th/index.php) |

## License

MIT
