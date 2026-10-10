# ML Engine — Overview

The ML engine is the analytical intelligence layer of Isesengura. It receives a plain-English question, runs the appropriate statistical/ML operation, and returns a validated `AnalyticalResult` that the frontend renderer displays as an interactive workspace.

## Location

```
api/src/services/ml-engine.ts   ← active ML engine (TypeScript, in-process)
api/src/services/engine.ts      ← original sample engine (unchanged, still active)
model/                          ← Python Docker template + docs + sample CSVs
```

The ML engine is pure TypeScript — no Python, no external ML libraries. It runs inside the existing Express API process.

## Problems solved

| # | Problem | Method | File |
|---|---|---|---|
| A | District labour underutilization profiles | KMeans clustering (k=3) | [CLUSTERING.md](docs/CLUSTERING.md) |
| B | Predict youth NEET rate from district characteristics | OLS regression | [REGRESSION.md](docs/REGRESSION.md) |
| C | Employment trends and near-term forecast by sector | Linear trend + extrapolation | [FORECASTING.md](docs/FORECASTING.md) |

## How a question becomes a result

```
question
  └─▶ runMLAnalysis()          intent router (keyword matching)
        ├─▶ runClustering()    Problem A
        ├─▶ runRegression()    Problem B
        └─▶ runForecasting()   Problem C
              └─▶ AnalyticalResult (Zod-validated)
                    └─▶ planner → PresentationSpec → frontend renderer
```

## Intent routing

| Keywords in question | Engine |
|---|---|
| `neet`, `predict`, `factor`, `regression` | Regression (B) |
| `trend`, `forecast`, `sector`, `over time`, `grow` | Forecasting (C) |
| anything else | Clustering (A) — most general overview |

## Algorithms (all pure TypeScript)

- **KMeans** — iterative centroid update, min-max normalised features, deterministic initialisation
- **OLS** — normal equations solved via Gaussian elimination, exact
- **Linear trend** — simple OLS on time index per series

## Output contract

Every engine returns an `AnalyticalResult` validated by the Zod schema in `api/src/shared/analytical.ts`. The frontend never computes statistics — it only renders what the engine returns.

## Data

See [docs/SAMPLE_DATA.md](docs/SAMPLE_DATA.md) for the full column reference and instructions for plugging in real NISR data.

## Activating the ML engine

The ML engine is ready to use. To route questions through it, import `runMLAnalysis` from `./ml-engine` in `api/src/routes/analyses.ts` alongside or instead of `runAnalysis` from `./engine`.
