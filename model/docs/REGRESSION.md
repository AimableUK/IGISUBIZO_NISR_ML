# Problem B — Youth NEET Rate Regression

## Problem statement

What district characteristics are statistically associated with high youth NEET rates?

## Method

Ordinary Least Squares (OLS) regression fitted to district-level data for the latest survey year.

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

1. Load district data for the latest year (30 districts)
2. Build design matrix X (n=30, p=5) and target vector y
3. Solve normal equations: β = (XᵀX)⁻¹Xᵀy via Gaussian elimination
4. Compute predicted values and R²
5. Compute relative feature importance as |coef| / sum(|coef|)

## Output

- `feature_importance` dataset — coefficients, relative importance, direction per feature
- `predictions` dataset — actual vs predicted NEET rate + residual per district
- Metrics: R², intercept
- Insights: model fit quality, top predictor

## Caveats

- OLS assumes linear relationships and homoscedasticity
- n=30 districts is a small sample; results should be interpreted cautiously
- Coefficients show statistical association, **not causation**
- No train/test split at this sample size; model is descriptive, not predictive

## Real data replacement

Replace `buildDistrict()` in `ml-engine.ts` with real LFS district aggregates. The OLS logic is unchanged.

**Source:** Rwanda Labour Force Survey (NISR) — https://microdatabk.statistics.gov.rw/catalog/125
