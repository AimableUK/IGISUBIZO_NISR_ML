# Model Service — Overview

The model service receives a plain-English question from the Express API, runs a statistical/rule-based analysis, and returns an `AnalyticalResult` for the frontend renderer.

## Location

```
model/main.py                    ← active FastAPI /analyze endpoint
model/engine/                    ← Python routing, clustering, regression, forecasting, decisions
model/data/real/                  ← generated proxy CSVs; not verified NISR data
api/src/services/model-client.ts ← API client with a development fallback
```

The active engine is pure Python with no external ML/statistical libraries. It runs as a FastAPI service. The algorithms are code, not trained neural-network weights or a chatbot.

## Problems solved

See [docs/PROBLEM_STATEMENT.md](docs/PROBLEM_STATEMENT.md) for the full problem context, decision-making rationale, and how the three problems connect.

| # | Problem | Method | Doc |
|---|---|---|---|
| A | District labour underutilization profiles | KMeans clustering (k=3) | [CLUSTERING.md](docs/CLUSTERING.md) |
| B | Predict youth NEET rate from district characteristics | OLS regression | [REGRESSION.md](docs/REGRESSION.md) |
| C | Employment trends and near-term forecast by sector | Linear trend + extrapolation | [FORECASTING.md](docs/FORECASTING.md) |

## How a question becomes a result

```
website → Express API → FastAPI /analyze
                         └─▶ regex/synonym intent router
                               ├─▶ decision scoring
                               ├─▶ K-means clustering
                               ├─▶ panel OLS regression
                               └─▶ linear trend forecasting
                                     └─▶ AnalyticalResult → planner → frontend renderer
```

## Intent routing

| Keywords in question | Engine |
|---|---|
| `neet`, `predict`, `factor`, `regression` | Regression (B) |
| `trend`, `forecast`, `sector`, `over time`, `grow` | Forecasting (C) |
| anything else | Clustering (A) — most general overview |

## Algorithms (pure Python)

- **KMeans** — iterative centroid update, min-max normalised features, deterministic initialisation
- **OLS** — normal equations solved via Gaussian elimination, exact
- **Linear trend** — simple OLS on time index per series

## Output contract

Every engine returns an `AnalyticalResult` validated by the API and frontend schemas. The frontend only renders what the engine returns.

## Data

The checked-in CSVs are generated proxy data shaped around NISR dataset categories, not verified source-table extracts. Results are marked as demo data. Do not treat them as official statistics or use them for real-world decisions. See [README.md](README.md) for details.

The analyses route already calls `analyzeViaModel()` and sends requests to `MODEL_URL`. Production Compose starts the model service and disables fallback, so an unavailable model fails visibly rather than returning a different in-process result.
