# Project TODO

## MODEL

### Done ✅
- [x] `api/src/services/ml-engine.ts` — TypeScript ML engine (clustering, regression, forecasting)
- [x] `model/data/sample/` — sample CSVs (30 districts × 7 years)
- [x] `model/docs/PROBLEM_STATEMENT.md` — full problem statement + decision-making context
- [x] `model/docs/CLUSTERING.md` — Problem A doc
- [x] `model/docs/REGRESSION.md` — Problem B doc
- [x] `model/docs/FORECASTING.md` — Problem C doc
- [x] `model/docs/SAMPLE_DATA.md` — column reference + real data guide
- [x] `model/MODEL.md` — engine overview
- [x] Branch `Rwanda_training_modal_analytics` pushed to GitHub

### Remaining

#### 1. Wire Python model into analyses route ✅
- `api/src/services/model-client.ts` → `POST {MODEL_URL}/analyze`
- `api/src/routes/analyses.ts` uses `analyzeViaModel` (fallback to local engine)
- See `Docs/HACKATHON_PROGRESS.md`

#### 2. Plug in real NISR data [ NEXT ]
- Download LFS microdata: https://microdatabk.statistics.gov.rw/catalog/125
- Aggregate to district × year (same columns as `model/data/real/district_labour.csv`)
- Replace generator noise with published district tables where available

#### 3. FAQ / methodology page content
- `/methodology` page — plain-language explanation of each engine for non-technical users
- `/ai-transparency` page — how the ML engine works, what it can and cannot claim

#### 4. Panel OLS (regression improvement) ✅
- Panel district×year + year FE in `model/engine/regression.py` (n=180)
- Leave-one-district-out CV

#### 5. Forecast confidence intervals ✅
- 95% prediction intervals in forecasting engine

#### 6. Training realism ✅
- Generator idiosyncratic noise; R² ~0.75 (was ~1.0)
- Fixed duplicate Nyamasheke → Nyaruguru

---

## How to run the ML engine

### With Docker
```bash
cp .env.example .env
# set BETTER_AUTH_SECRET: openssl rand -base64 32
docker compose up --build
# API :4000  Web :3000
```

### Without Docker
```bash
# Terminal 1
cd api && pnpm install --lockfile=false && pnpm run prisma:generate && pnpm exec prisma db push && pnpm run dev

# Terminal 2
cd web && pnpm install --lockfile=false && pnpm run dev
```

### Test engines directly (no server needed)
```bash
cd api

# Clustering
npx tsx src/services/ml-engine.ts

# Or import in a test script:
# import { runMLAnalysis } from "./src/services/ml-engine.ts"
# console.log(runMLAnalysis("cluster districts by underutilization"))
```

---

## API

## WEB
