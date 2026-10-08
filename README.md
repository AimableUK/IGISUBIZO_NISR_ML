# Isesengura — Rwanda Generative Analytical Workspace

Canonical repository: <https://github.com/AimableUK/IGISUBIZO_NISR_ML>

Ask a question about Rwanda's public data and get a **persistent, interactive analytical workspace** (charts, tables, a district map, key figures, sources) instead of a paragraph. Built for the 2026 NISR Big Data Hackathon from the SRS and "Prompt B".

> **This build runs on generated sample data** (youth employment, secondary enrolment; 30 districts; 2021–2025). It is labelled as sample everywhere and is **not** NISR data. See "Plugging in real data".

## Core idea

```
question ─▶ analysis engine ─▶ AnalyticalResult (numbers, sources, method)   ← immutable
                         └──▶ planner ─▶ PresentationSpec (components, layout) ← validated, versioned
                                           + user Customizations (order, size, type, filters)
```

* **Analytical result** and **presentation spec** are separate Zod schemas. Changing a chart type or layout only touches the spec/customizations, never a number.
* The planner (deterministic rules, or an optional LLM) outputs **data, not markup**. The spec is validated structurally *and* against the result (every `dataRef`, column and metric must exist). Only 11 component types can render; unknown types hit an "unsupported" block. No `eval`, no generated HTML/JS.
* Every displayed value resolves through a ref (`metrics.national_latest`, `datasets.by_district_latest`) into the result. The frontend never computes statistics (it only describes returned data in chart text summaries).
* An **artifact** = question + result + sources + spec + customizations + engine/planner/dataset versions + timestamps + version number. Reopening restores everything; if engine/datasets changed, a banner says so and the old result is kept.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Recharts · Zustand · Framer Motion · Tiptap · Lucide · Axios · Zod · better-auth · Express 5 · Prisma/PostgreSQL · Socket.IO · BullMQ/Redis · node-cron · Brevo · ImageKit · morgan · nodemon · Docker · GitHub Actions.

```
api/              Standalone Express API: auth, analyses, artifacts, queues, cron, socket, sample engine, planner
web/              Standalone Next.js frontend: renderer, workspace, playground, history, auth, legal/info pages
model/            Python 3.12 Docker template copied from IGISUBIZO_NISR_ML; service source is still needed
api/src/shared/   API-local copy of shared Zod schemas and helpers
web/src/shared/   Frontend-local copy of shared Zod schemas and helpers
```

The API and frontend build from separate Docker contexts and do not depend on a workspace install. The shared source is intentionally copied into each app so either can be built and deployed independently. When changing a shared schema or helper, keep the corresponding files in `api/src/shared/` and `web/src/shared/` in sync. Each app has its own `.env.example`; the root `.env.example` is for Docker Compose. pnpm is pinned to 12.8.2, and installs use `--lockfile=false`, so no lockfiles are generated or committed.

## Quick start

```bash
cp .env.example .env            # set BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm run dev                    # postgres, redis, api :4000, web :3000
```

Without Docker (needs Postgres + Redis running):

```bash
cd api
pnpm install --lockfile=false
pnpm run prisma:generate
pnpm exec prisma db push        # or: pnpm run prisma:migrate -- --name init
cd ../web && pnpm install --lockfile=false
# In separate terminals, run `pnpm run api:dev` and `pnpm run web:dev` from the repository root.
```

With no `BREVO_API_KEY`, emails (verification, password reset) are **printed in the API log**: click the link from there in development. Sign-up requires email verification.

Create your first migration before production from `api/`: `pnpm run prisma:migrate -- --name init` and commit `api/prisma/migrations`. The API container runs `migrate deploy` when migrations exist, otherwise `db push`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm run dev` | API, web, PostgreSQL, and Redis with Docker Compose, using `Dockerfile.dev` for each app |
| `pnpm run api:dev` / `pnpm run web:dev` | Run one app locally |
| `cd api && pnpm run typecheck && pnpm run build` | Typecheck and build the API alone |
| `cd web && pnpm run typecheck && pnpm run build` | Typecheck and build the frontend alone |
| `pnpm run prod` | Compose production stack |

## Features by SRS area

* **Workspace:** metric, bar, line, area, scatter, table, map (schematic tile map), text, formula, filter, section. Resize (buttons, keyboard, drag), reorder (buttons or drag), expand/focus dialog, collapse, filters, sortable/searchable tables, valid visualization switching (`alternativesFor`), colour palettes, reset, undo/redo (Ctrl/Cmd+Z).
* **Playground:** JSON spec editor, live preview, validation errors by path, component inspector, undo/redo, revert, save as new version. Controlled authoring, not code execution.
* **History:** saved analyses with title, question, preview chips, date, version count, open/delete; per-artifact version switcher.
* **Voice (optional):** browser speech recognition → visible transcript in the question box → normal request. Read-aloud shows the same text as a live caption.
* **Accessibility:** skip link, landmarks, visible focus, 44px targets, text scaling (100/115/130%), day/night/system theme, high contrast, reduced motion, no colour-only encoding (line dash + marker shapes, printed values), chart text summaries, data tables behind every chart/map, announced loading/filter/error states, visual notifications.
* **Error states:** loading, ambiguous, unsupported, no data, partial, invalid spec, network/server failure, 401/404.
* **Realtime:** Socket.IO streams real pipeline stages (interpreting → … → ready) to the requesting user.
* **Security:** strict schema validation at every boundary, markup stripped from titles/text, helmet, CORS allow-list, rate limits, better-auth sessions, secrets only in env.

## Plugging in real data

1. Replace `loadIndicator` logic in `api/src/services/engine.ts` with real NISR queries.
2. Return the same `AnalyticalResult` (datasets with typed columns, metrics, insights, formulas, **real sources/licences**, operation log, caveats, dataset versions, `isSample: false`).
3. Keep `DATASET_VERSIONS` current so drift notices work.
4. For real geography, add a GeoJSON choropleth component to the renderer registry (`web/src/components/renderer/Renderer.tsx`) and to the `map` spec; the schematic tile map stays as the accessible default.

## Optional AI planner

Set `ANTHROPIC_API_KEY` (and optionally `PLANNER_MODEL`). The planner receives only the *structure* of the result (ids, column names/kinds), returns a spec, and it is accepted only if it validates against the schema **and** the result. Otherwise the rule planner is used. `plannerVersion` is stored with each version.

## Before launch checklist

* Replace sample data and review `privacy`/`terms` pages with a lawyer (they are templates).
* Set a real `BETTER_AUTH_SECRET`, Brevo sender, ImageKit keys, public https `WEB_URL`/`API_URL`/`NEXT_PUBLIC_API_URL`.
* Run an accessibility audit with real assistive technology (this repo is built to the spec but not yet user-tested), and test Kinyarwanda speech support.
* Add i18n (English/Kinyarwanda) — strings are currently inline English.
* Add API integration tests and Playwright e2e for the ask → workspace → save → reopen flow.

Palette: `#253D2C` forest · `#2E6F40` fern · `#68BA7F` sage · `#CFFFDC` mint.
