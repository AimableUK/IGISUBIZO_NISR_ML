# Problem B — Youth NEET Rate Regression

## Problem statement

What district characteristics are statistically associated with high youth NEET rates?

## Method

Panel Ordinary Least Squares (OLS) on district × year observations with **year fixed effects**, ridge stabilization, and leave-one-district-out cross-validation.

## Target variable

`youth_neet_rate` — percentage of youth (15–30) not in employment, education or training.

## Features

| Feature | Description |
|---|---|
| `pct_agriculture` | Share of workforce in agriculture |
| `pct_formal` | Share in formal employment |
| `pct_secondary_plus` | Share with secondary or higher education |
| `pct_tvet` | Share with TVET qualification |
| `unemployment_rate` | District unemployment rate |

## How it works

1. Load all district × year rows (e.g. 30 × 6 = 180)
2. Build design matrix with 5 substantive features + year dummies (omit baseline year)
3. Solve ridge-stabilized normal equations via Gaussian elimination
4. Report panel R² / adjusted R² and leave-one-district-out Q² / RMSE
5. Relative importance on substantive |coef| only (year FE excluded from ranking)
6. Latest-year actual vs predicted table for maps

## Output

- `feature_importance` dataset — coefficients, relative importance, direction per feature
- `predictions` dataset — actual vs predicted NEET rate + residual (latest year)
- Metrics: panel R², adjusted R², leave-district-out RMSE/Q², n_observations, intercept
- Insights: model fit quality, top predictor

## Caveats

- OLS assumes linear relationships and homoscedasticity
- Year FE absorb national time shocks; coefficients are within-year associations
- Coefficients show statistical association, **not causation**
- Synthetic real-structure CSVs include idiosyncratic noise so R² is not artificially ~1.0

## Real data replacement

Replace `buildDistrict()` in `ml-engine.ts` with real LFS district aggregates. The OLS logic is unchanged.

**Source:** Rwanda Labour Force Survey (NISR) — https://microdatabk.statistics.gov.rw/catalog/125
