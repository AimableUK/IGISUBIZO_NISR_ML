# Isesengura — Hackathon progress notes

**Hackathon:** 2026 NISR Big Data Hackathon  
**Repo:** IGISUBIZO_NISR_ML  
**Last updated:** 2026-10-26

Use this file to resume work. Update the checklist and "Where we left off" when you stop.

---

## Product in one line

Ask a real Rwanda decision (crop, career, sector) → ranked evidence from NISR-shaped data → immutable `AnalyticalResult` → presentation workspace. Models compute numbers; LLMs (optional) only plan/explain.

---

## Architecture (current)

```
web (:3000) → api (:4000) → MODEL_URL /analyze (:8000 Python FastAPI)
                              ├─ NLU router
                              ├─ decision (crop / career)
                              ├─ clustering (district underutilization)
                              ├─ regression (youth NEET, panel OLS)
                              └─ forecasting (sector trends + intervals)
```

Data: `model/data/real/*.csv` (regenerate with `python3 model/generate_real.py`).

---

## Session log

### 2026-10-26 — Full model training, API wiring, admin UI, docs

**Done**
1. Confirmed `python3 model/train_eval.py` passes all engines.
2. Model service: venv + lean deps, `uvicorn main:app --host 127.0.0.1 --port 8000`.
3. Expanded dataset to **2017–2025** with stronger published NISR aggregates across all sources (labour, agriculture, health, poverty, education, establishments, sector employment, TVET, HE, exams, career demand). Regenerated and retrained.
4. Panel OLS (multi-year + year FE) with leave-one-district-out CV; forecast with 95% prediction intervals.
5. Wired Express → Python model via `MODEL_URL` + adaptive rule planner + schema normalization + fallback to local engine.
6. Improved NLU routing.
7. Updated Methodology and AI Transparency pages.
8. Added Playwright config + e2e smoke test (`tests/e2e/ask-workspace.spec.ts`).
9. Added `/admin` page + `POST /api/admin/train` (first-user admin) to run `generate_real.py` / `train_eval.py` from web.
10. Added `docs/WEB_E2E_TEST.md` checklist.
11. Decision scoring review noted.

**Verified `/analyze`**
| Question | Engine | Signal |
|----------|--------|--------|
| crop in Musanze | decision/crop_choice | Sweet potato ~0.59 |
| career vs | decision/career_choice | Software Developer ranked |
| NEET predictors | regression | Panel R²~0.75, LOOCV Q²~0.71 (expanded data) |
| sector trends | forecasting | trends + 95% intervals |
| district clusters | clustering | cluster profiles/district clusters |

---

## Checklist

### Model service
- [x] Venv + lean deps + uvicorn on `:8000`
- [x] `/health` and `/analyze` tested
- [x] `train_eval.py` passing
- [x] Training realism improved
- [x] Panel OLS + leave-one-district-out CV
- [x] Forecast 95% prediction intervals
- [x] Expanded dataset 2017–2025 with published aggregates

### API integration
- [x] `MODEL_URL` in env + `api/src/env.ts`
- [x] `api/src/services/model-client.ts` → POST `/analyze` with normalization + fallback
- [x] `api/src/routes/analyses.ts` uses model client
- [x] Adaptive rule planner
- [x] `docker-compose.yml` model service
- [x] Admin training endpoints

### Product / polish
- [x] Methodology / AI transparency updated
- [x] Playwright e2e smoke test
- [x] Admin training UI
- [x] Web E2E checklist (`docs/WEB_E2E_TEST.md`)
- [x] Decision scoring review documented
- [ ] i18n (EN / Kinyarwanda)

---

## How to run

### Quick start (all together with Docker)
```bash
cp .env.example .env
# set BETTER_AUTH_SECRET: openssl rand -base64 32
docker compose up --build
# API :4000  Web :3000  Model :8000
```

### Without Docker
```bash
# Terminal A - Model
cd model
python3 -m venv .venv
.venv/bin/pip install 'fastapi>=0.115' 'uvicorn[standard]>=0.32' 'pydantic>=2.9' 'python-dotenv>=1.0'
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal B - API
cd api
pnpm install --lockfile=false
pnpm run prisma:generate
pnpm exec prisma db push
pnpm run dev  # :4000

# Terminal C - Web
cd web
pnpm install --lockfile=false
pnpm run dev  # :3000
```

### Train/regenerate
```bash
cd model
python3 generate_real.py
python3 train_eval.py
# or via web: http://localhost:3000/admin (first-user admin)
```

### Test
```bash
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/analyze -H 'Content-Type: application/json' -d '{"question":"what crop should I plant in Musanze?","requestId":"test"}'
npx playwright test  # after installing browsers
```

---

## Key files
| Path | Role |
|------|------|
| `model/main.py` | FastAPI `/health`, `/analyze` |
| `model/train_eval.py` | Train/eval suite |
| `model/generate_real.py` | Data generator (2017–2025) |
| `model/engine/*.py` | Engines + NLU router |
| `api/src/services/model-client.ts` | HTTP client to model (fallback) |
| `api/src/routes/analyses.ts` | Ask flow |
| `api/src/routes/admin.ts` | Admin stats + train endpoints |
| `api/src/services/planner.ts` | Presentation planner |
| `web/src/app/admin/page.tsx` | Admin training UI |
| `web/src/app/(marketing)/methodology/page.tsx` | Methodology |
| `web/src/app/(marketing)/ai-transparency/page.tsx` | AI transparency |
| `docs/WEB_E2E_TEST.md` | Web e2e checklist |
| `playwright.config.ts`, `tests/e2e/ask-workspace.spec.ts` | E2E smoke test |

---

## Where we left off
Model service running with expanded dataset (2017–2025), all engines trained/validated, API wired to Python model with fallback, admin training UI added, docs updated. Ready for web e2e testing.

**Next:** Run end-to-end test through web with auth (ask → workspace → save → reopen) using `docs/WEB_E2E_TEST.md`. Then deploy and prepare hackathon submission (GitHub public, deployed link, 3-min screen recording).

## Data sources (documented)
All data comes from NISR published aggregates via `model/generate_real.py` (2017–2025): LFS, EICV, DHS, SAS, EMIS/REB, NESA, Establishment Census, WDA/HEC, LMIS/KORA. Microdata catalogs referenced: https://microdatabk.statistics.gov.rw/catalog/, https://microdata.statistics.gov.rw/index.php/catalog/. District-level panels written to `model/data/real/*.csv` used by all engines.
