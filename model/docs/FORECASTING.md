# Problem C — Employment Trend Forecasting by Sector

## Problem statement

Which sectors are growing or shrinking in employment share, and what does the near-term trend suggest?

## Method

Linear OLS trend fitted per sector on national district-mean employment share (2019–2025), then extrapolated 2 years forward.

## Data

- Source: sector employment share per district per year (from LFS / Establishment Census)
- Aggregation: national mean across all 30 districts per sector per year
- Sectors: Agriculture, Manufacturing, Construction, Trade, ICT, Education, Health, Finance, Other

## How it works

1. Aggregate district sector shares to national means (9 sectors × 7 years)
2. For each sector, fit OLS: `share(t) = slope × t + intercept`
3. Compute R² per sector trend
4. Rank sectors by slope (fastest growing first)
5. Extrapolate 2 years beyond the latest year

## Output

- `sector_trends` dataset — actual + fitted trend per sector per year (2019–2025)
- `sector_forecast` dataset — projected share per sector for 2026–2027
- `sector_ranking` dataset — sectors ranked by trend slope
- Metrics: count of growing sectors, fastest growing sector slope
- Insights: growth leaders, forecast caveat

## Caveats

- Linear extrapolation only — structural breaks, policy changes, and external shocks are not modelled
- Employment share projections do not account for population growth or total employment volume
- Short time series (7 years) limits trend reliability
- Projections are directional signals, **not predictions**

## Real data replacement

Replace `buildSector()` in `ml-engine.ts` with real LFS/Establishment Census sector aggregates using the same column names.

**Sources:**
- Rwanda Labour Force Survey (NISR) — https://microdatabk.statistics.gov.rw/catalog/125
- Rwanda Establishment Census 2023 (NISR) — https://microdatabk.statistics.gov.rw/catalog/105
