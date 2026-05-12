---
inclusion: always
---

# Thai Fuel Price Website

## Project Overview
A Thai fuel price comparison website that displays daily oil/fuel prices and lets users calculate cost differences over time.

## Tech Stack
- Runtime: Bun
- Framework: Preact with `@preact/signals` for reactive state
- Build: Vite with `@preact/preset-vite`
- Language: TypeScript (strict mode)
- Styling: Plain CSS — Material Design inspired (no CSS framework)
- Data: Static JSON (`data/prices.json`) — daily fuel prices in THB/litre

## Project Structure
```
src/
  main.tsx          — App entry point
  app.tsx           — Root component
  app.css           — All styles
data/
  prices.json       — Fuel price data (array of { date, prices })
public/             — Static assets served as-is
```

## Fuel Types
- `gasoline_95`, `gasohol_95`, `gasohol_91`, `gasohol_e20`, `gasohol_e85`, `diesel`, `diesel_b20`
- Not all fuel types exist in every date entry — always handle missing keys.

## Coding Conventions
- Use `@preact/signals` (`signal`, `computed`) for state — not `useState`.
- Use Preact imports (`import { signal } from '@preact/signals'`), never from `react`.
- Use `class` attribute (not `className`) in JSX — this is Preact, not React.
- Keep components in `src/` as flat files unless a feature warrants its own directory.
- All monetary values display to 2 decimal places with ฿ (Baht) symbol.

## Design Theme — Material Dark with Purple Accent
- Font: Roboto (loaded from Google Fonts)
- Background: `#121212` (Material dark surface)
- Card surface: `#1e1e2e`
- Card elevated: `box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2)`
- Card border-radius: `16px`
- Input/select background: `#2a2a3e`
- Input/select border: `1px solid #3a3a5c`
- Input focus border: `#b39ddb`
- Primary purple accent: `#b39ddb` (labels, focus states)
- Headline purple: `#ce93d8` (large price numbers)
- Divider: `#3a3a5c`
- Text primary: `#e0e0e0`
- Text secondary: `#888`
- Text caption: `#777`
- Save/positive: `#81c784` on `#1e2e1e` gradient
- Extra/negative: `#e57373` on `#2e1e1e` gradient
- Neutral: `#b39ddb` on `#1e1e2e` gradient
- Typography: Material type scale (overline, headline, body, caption)
- Header card: gradient `linear-gradient(135deg, #1e1e2e, #2a1e3e)`

## Data Handling
- Import `prices.json` directly in components (Vite handles JSON imports).
- Date strings are `YYYY-MM-DD` format.
- When looking up a date that doesn't exist, fall back to the nearest earlier date.

## Do Not
- Install CSS frameworks (Tailwind, styled-components, etc.).
- Use React-specific APIs — this is Preact.
- Use `useState`/`useEffect` — prefer `@preact/signals`.
- Fetch data from external APIs — all data is local JSON.
