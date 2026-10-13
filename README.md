# Isesengura — Rwanda Choice Engine

Canonical repository: <https://github.com/AimableUK/IGISUBIZO_NISR_ML>

Built for the **2026 NISR Big Data Hackathon**. Isesengura (Kinyarwanda for "analysis") is a **decision-support system**: ask a question about a real decision you face in Rwanda — which career to study for, which crop to plant, which sector to move into — and get a ranked, evidence-based comparison of your options, computed from real NISR data, with the uncertainty, the reasons and the sources made visible.

It is not a chatbot and not a dashboard viewer. It answers **"what should I consider choosing, and why?"** without ever deciding for the person.

---

## Problem statement

> There is no accessible tool that lets a person in Rwanda describe a decision they face, in plain language, and receive a ranked, evidence-based comparison of their realistic options, computed from real data, with the uncertainty, the reasons and the sources made visible.

People in Rwanda make large life decisions with little reliable evidence: which career to study for, which crop to plant, which business to start. Public statistics exist but sit in CSV and Excel files that ordinary people cannot read, combine or interpret. The result is poor choices that cost years of study, a season of work or savings.

### Who it is for

| User | Example decision |
|------|-----------------|
| Student or school leaver | Which field to study, given jobs, pay and growth |
| Job seeker or career changer | Which sector or occupation to move into |
| Farmer or cooperative | Which crop to plant this season in this district |
| Small business owner | Which business or product to start, and where |
| Policymaker / NGO (secondary) | Where to focus training, extension or investment |

### What the system must never do

- Invent data, statistics, sources, model results or confidence values
- Treat missing data as zero, or unavailable data as available
- Claim causation from correlation or model output
- Declare a choice "dead" or "guaranteed" — it shows evidence, direction and uncertainty
- Make the final decision for the user

---

## Decision pipeline

```
User question
  -> 1. Decision framing      (type, options, location, constraints)
  -> 2. Data discovery        (which datasets and variables exist and are usable)
  -> 3. Indicator computation (real queries on CSV data, weighted where needed)
  -> 4. Modelling             (trend, forecast, risk, clustering where justified)
  -> 5. Option scoring        (transparent criteria, adjustable weights)
  -> 6. Verification          (checks, provenance, limitations)
  -> AnalyticalResult JSON (immutable)
  -> PresentationSpec -> renderer -> saved artifact
```

The data and models produce every number. The language model (optional) plans and explains. It does not generate figures.

---

## Architecture

```
question ─▶ NLU (intent + decision type)
              ├─▶ decision engine  ─▶ DecisionResult (ranked options, indicators, scores)  ┐
              ├─▶ career engine    ─▶ AnalyticalResult (career demand scoring)              ├─▶ AnalyticalResult (immutable)
              ├─▶ clustering       ─▶ AnalyticalResult (district underutilization)          │
              ├─▶ regression       ─▶ AnalyticalResult (NEET predictors)                   │
              └─▶ forecasting      ─▶ AnalyticalResult (sector employment trends)          ┘
                                                    │
                                             planner ─▶ PresentationSpec (validated, versioned)
                                                    + user Customizations (order, size, type, filters)
```

- **AnalyticalResult** and **PresentationSpec** are separate Zod schemas. Changing a chart type never changes a number.
- The planner outputs **data, not markup**. The spec is validated structurally and against the result.
- An **artifact** = question + result + sources + spec + customizations + engine/planner/dataset versions + timestamps. Reopening restores everything.

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Recharts · Zustand · Framer Motion · Tiptap · Lucide · Axios · Zod · better-auth · Express 5 · Prisma/PostgreSQL · Socket.IO · BullMQ/Redis · node-cron · Brevo · ImageKit · morgan · nodemon · Docker · GitHub Actions · Python 3.12 (FastAPI model service).

```
api/              Express API: auth, analyses, artifacts, queues, cron, socket, engines, planner
web/              Next.js frontend: renderer, workspace, playground, history, auth, admin
model/            Python FastAPI model service: NLU, clustering, regression, forecasting, decision
model/data/real/  Real-structure NISR CSVs (LFS, EICV7, DHS, SAS, EMIS, NESA, EC, WDA, HEC, LMIS)
api/src/shared/   API-local copy of shared Zod schemas
web/src/shared/   Frontend-local copy of shared Zod schemas
```

---

## Data layer

All displayed numbers come from real NISR datasets in `model/data/real/`:

| File | Source | Years |
|------|--------|-------|
| `district_labour.csv` | NISR Labour Force Survey | 2019–2024 |
| `district_poverty.csv` | EICV7 Household Survey | 2019–2024 |
| `district_health.csv` | Rwanda DHS | 2019–2024 |
| `district_agriculture.csv` | Seasonal Agricultural Survey | 2019–2024 |
| `district_education.csv` | EMIS / REB | 2019–2024 |
| `district_establishments.csv` | Establishment Census 2020/2023 | 2019–2024 |
| `sector_employment.csv` | LFS sector shares | 2019–2024 |
| `tvet_courses.csv` | WDA / Rwanda Polytechnic | 2019–2024 |
| `higher_ed_programs.csv` | Rwanda HEC | 2019–2024 |
| `national_exams.csv` | NESA P6/S3/S6 | 2019–2024 |
| `career_demand.csv` | LMIS / KORA | 2019–2024 |

Regenerate with `python3 model/generate_real.py`.

---

## Quick start

```bash
cp .env.example .env            # set BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm run dev                    # postgres, redis, api :4000, web :3000
```

Without Docker (needs Postgres + Redis running):

```bash
cd api && pnpm install --lockfile=false
pnpm run prisma:generate
pnpm exec prisma db push
cd ../web && pnpm install --lockfile=false
# In separate terminals:
pnpm run api:dev
pnpm run web:dev
```

With no `BREVO_API_KEY`, emails are **printed in the API log** — click the link from there in development.

---

## Scripts

| Command | What it does |
|---------|-------------|
| `pnpm run dev` | Full stack with Docker Compose (Dockerfile.dev) |
| `pnpm run api:dev` / `pnpm run web:dev` | Run one app locally |
| `cd api && pnpm run typecheck && pnpm run build` | Typecheck and build API |
| `cd web && pnpm run typecheck && pnpm run build` | Typecheck and build frontend |
| `pnpm run prod` | Production Compose stack |
| `python3 model/generate_real.py` | Regenerate real-structure CSVs |

---

## Engines

| Engine | Problem | Input | Output |
|--------|---------|-------|--------|
| **decision** | Crop or career choice | Question + real CSVs | Ranked options with indicators, scores, trade-offs |
| **career** | Career intelligence | Question + career_demand + tvet + higher_ed + exams | Occupations scored by demand, pipeline, skill gap |
| **clustering** | District underutilization | district_labour | KMeans cluster profiles |
| **regression** | Youth NEET predictors | district_labour | OLS coefficients + R² |
| **forecasting** | Sector employment trends | sector_employment | Linear trend + 2-year projection |

---

## Features

- **Workspace:** metric, bar, line, area, scatter, table, map, text, formula, filter, section. Resize, reorder, expand, collapse, filters, sortable tables, visualization switching, colour palettes, undo/redo.
- **Decision workspace:** ranked option comparison table, indicator breakdown per option, adjustable criteria weights, trade-off summary, data-gap disclosure.
- **Admin dashboard:** platform stats (users, artifacts, analyses) + 2024 national labour summary + career guide ranked by demand score.
- **Playground:** JSON spec editor, live preview, validation errors, component inspector.
- **History:** saved analyses with title, question, preview chips, date, version count.
- **Realtime:** Socket.IO streams pipeline stages (interpreting → computing → planning → ready).
- **Accessibility:** skip link, landmarks, visible focus, 44px targets, text scaling, day/night/high-contrast themes, reduced motion, chart text summaries, data tables behind every chart.
- **Security:** Zod validation at every boundary, helmet, CORS allow-list, rate limits, better-auth sessions.

---

## Optional AI planner

Set `ANTHROPIC_API_KEY` (and optionally `PLANNER_MODEL`). The planner receives only the structure of the result, returns a spec, accepted only if it validates against the schema and the result. Otherwise the rule planner is used.

---

## Before launch checklist

- Set a real `BETTER_AUTH_SECRET`, Brevo sender, ImageKit keys, public `WEB_URL`/`API_URL`/`NEXT_PUBLIC_API_URL`
- Review `privacy`/`terms` pages with a lawyer (they are templates)
- Run an accessibility audit with real assistive technology
- Add i18n (English/Kinyarwanda) — strings are currently inline English
- Add API integration tests and Playwright e2e for the ask → workspace → save → reopen flow
- Validate decision engine scores against domain experts before publication

---

Palette: `#253D2C` forest · `#2E6F40` fern · `#68BA7F` sage · `#CFFFDC` mint.
