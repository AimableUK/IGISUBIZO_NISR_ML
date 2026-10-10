# Project TODO

## MODEL

### Done ✅
- [x] `api/src/services/ml-engine.ts` — TypeScript ML engine (clustering, regression, forecasting)
- [x] `model/data/sample/` — sample CSVs (30 districts × 7 years)
- [x] `model/docs/` — separate MD for each engine + sample data guide
- [x] `model/MODEL.md` — overview doc
- [x] Branch `Rwanda_training_modal_analytics` pushed to GitHub

### Remaining

#### 1. Wire ml-engine into the analyses route
**File:** `api/src/routes/analyses.ts`

Change line:
```ts
import { runAnalysis } from "../services/engine";
```
To:
```ts
import { runAnalysis } from "../services/engine";
import { runMLAnalysis } from "../services/ml-engine";
```
Then in the route handler, decide which engine to call based on question keywords,
or replace `runAnalysis(question)` with `runMLAnalysis(question)` to use ML engine for all questions.

Simple swap (ML engine handles all questions):
```ts
const result: AnalyticalResult = runMLAnalysis(question);
```

#### 2. Plug in real NISR data
- Download LFS microdata: https://microdatabk.statistics.gov.rw/catalog/125
- Aggregate to district × year summary (same columns as `model/data/sample/district_labour.csv`)
- Replace `buildDistrict()` and `buildSector()` in `ml-engine.ts` with real data loaders
- Set `isSample: false` and update `ML_DATASET_VERSIONS`

#### 3. Add more indicators to clustering / regression
Current features cover LFS basics. Can extend with:
- Establishment Census: `total_establishments`, `pct_formal_business`, `dominant_sector`
- EICV: poverty rate, household income
- Population Census: dependency ratio, urbanisation rate

#### 4. Improve regression model
- Current: OLS on 30 district observations (latest year only)
- Next: panel OLS across all years (30 districts × 7 years = 210 obs) for more reliable estimates
- Consider: add year fixed effects to control for national trends

#### 5. Improve forecasting
- Current: simple linear trend per sector
- Next: add confidence intervals around projections
- Consider: ARIMA or exponential smoothing if time series is long enough with real data

#### 6. FAQ / methodology page content
- Document what each engine does in plain language for the `/methodology` page
- Add "how to interpret" notes for clustering profiles, regression coefficients, forecast caveats

---

## How to run the ML engine locally

### With Docker (recommended)
```bash
cp .env.example .env
# set BETTER_AUTH_SECRET: openssl rand -base64 32
docker compose up --build
# API on :4000, web on :3000
```

### Without Docker
```bash
# Terminal 1 — API
cd api
pnpm install --lockfile=false
pnpm run prisma:generate
pnpm exec prisma db push
pnpm run dev

# Terminal 2 — Web
cd web
pnpm install --lockfile=false
pnpm run dev
```

### Test the ML engine directly (no server needed)
```bash
cd api
npx tsx -e "
import { runMLAnalysis } from './src/services/ml-engine.ts';
console.log(JSON.stringify(runMLAnalysis('cluster districts by underutilization'), null, 2));
"
```

Or test each engine individually:
```bash
# Clustering
npx tsx -e "import { runClustering } from './src/services/ml-engine.ts'; console.log(runClustering('cluster').status);"

# Regression
npx tsx -e "import { runRegression } from './src/services/ml-engine.ts'; console.log(runRegression('what predicts neet rate').metrics.r_squared.value);"

# Forecasting
npx tsx -e "import { runForecasting } from './src/services/ml-engine.ts'; console.log(runForecasting('employment trend by sector').metrics.growing_sectors.value);"
```

---

## API

## WEB
