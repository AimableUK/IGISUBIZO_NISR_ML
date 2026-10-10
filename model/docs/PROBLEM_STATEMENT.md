# Rwanda Labour Market Intelligence — Problem Statement

## The challenge Rwanda faces

Rwanda's National Strategy for Transformation (NST2) targets 250,000 productive and decent jobs annually. Yet MIFOTRA's own National Employment and Skills Strategy 2024–2029 acknowledges that the existing Labour Market Information System (LMIS) still requires upgrading.

The data exists. NISR publishes the Labour Force Survey annually, the Establishment Census every few years, and household surveys regularly. What is missing is not data — it is **intelligence**: the ability to ask hard questions across these datasets and get verified, evidence-backed answers that decision-makers can act on.

The gap looks like this:

```
Workforce supply (LFS)        ←── not connected ──→   Business demand (Establishment Census)
       ↕                                                          ↕
Skills being acquired (TVET/Education)   ←── not connected ──→  Sectors growing or shrinking
```

Without connecting these, policymakers, training institutions, and planners are working blind.

---

## What this system does

Isesengura is a **generative analytical workspace** built on NISR public data. A user asks a plain-English question. The system runs verified statistical analysis and returns a persistent, interactive workspace — charts, maps, tables, metrics, sources — not a paragraph of text.

The ML engine (`api/src/services/ml-engine.ts`) is the analytical intelligence layer. It answers three specific intelligence questions that existing platforms are not answering.

---

## Problem A — Where is Rwanda's workforce being underutilized?

### The question
Where are workers employed below their capacity, and what district profiles emerge from the data?

### Why it matters for decision-making
Underemployment is invisible in headline employment figures. A district can have a high employment rate and still have most workers in low-productivity, low-hour, informal agriculture. Policymakers targeting productive employment need to know **which districts** have the worst underutilization profiles and **what characteristics** those districts share — so interventions can be targeted, not scattered.

### What the engine does
KMeans clustering (k=3) groups Rwanda's 30 districts into underutilization profiles using six LFS-derived features: underemployment rate, unemployment rate, youth NEET rate, agriculture share, formal employment share, and secondary+ education share.

### Decision-making output
- A map of Rwanda coloured by underutilization cluster
- A profile table showing what each cluster looks like (mean feature values)
- Which specific districts fall in the highest underutilization cluster
- A starting point for targeted workforce development investment

### Example question
> "Cluster districts by labour underutilization"

---

## Problem B — What is keeping young people outside employment, education and training?

### The question
What district-level characteristics are statistically associated with high youth NEET rates?

### Why it matters for decision-making
Rwanda's youth population is large and growing. Youth outside employment, education and training represent both a human cost and a lost economic opportunity. Understanding **which district characteristics are most associated with high NEET rates** helps training institutions, local government, and national planners know where to focus — and what levers may be worth pulling.

### What the engine does
OLS regression with `youth_neet_rate` as the target and five district-level predictors: agriculture share, formal employment share, secondary+ education share, TVET share, and unemployment rate. Returns coefficients, R², relative feature importance, and actual vs predicted NEET rate per district.

### Decision-making output
- Which factors are most strongly associated with high youth NEET rates
- Which districts are performing better or worse than the model predicts (residuals flag outliers worth investigating)
- A quantified, evidence-based starting point for policy targeting — not anecdote

### Honest limitations stated in every result
Coefficients show statistical association, not causation. n=30 districts is small. Results are a signal for investigation, not a prescription.

### Example question
> "What factors predict youth NEET rate across districts"

---

## Problem C — Which sectors are growing and what does the near-term trend suggest?

### The question
Which sectors are expanding or contracting in employment share, and what does the historical trend project forward?

### Why it matters for decision-making
Rwanda's NST2 explicitly targets sector-led job creation. Training institutions designing curricula, investors choosing sectors, and planners allocating workforce development resources all need to know **where employment demand is heading** — not just where it is today. A sector growing at 0.8 percentage points per year is a different planning target than one shrinking at 0.3.

### What the engine does
Linear OLS trend fitted per sector on national district-mean employment share (2019–2025), then extrapolated two years forward. Returns trend lines, sector growth ranking by slope, and projections with explicit caveats.

### Decision-making output
- Sector growth ranking — which sectors are expanding fastest
- Trend lines showing the direction of travel for each sector
- A 2-year directional projection — not a prediction, but a signal
- Explicit caveats: structural breaks, policy changes, and external shocks are not modelled

### Example question
> "Employment trend by sector over time"

---

## How the three problems connect

```
Problem A (Clustering)
  "District X is in the high underutilization cluster"
        ↓
Problem B (Regression)
  "High agriculture share and low formal employment are most associated with high NEET in that cluster"
        ↓
Problem C (Forecasting)
  "ICT and Manufacturing are the fastest-growing sectors in that region"
        ↓
Intelligence signal for a policymaker:
  District X has high underutilization, low formal employment, high NEET —
  but sits near sectors that are growing. Potential mismatch between
  workforce supply and emerging demand. Worth investigating.
```

This is the kind of intelligence question Rwanda's existing platforms are not answering. It is not a job board. It is not a static statistics page. It is a data-driven labour market intelligence layer built on NISR's own data.

---

## Data sources

| Dataset | Publisher | Years | What it provides |
|---|---|---|---|
| Rwanda Labour Force Survey | NISR | 2019–2025 | Employment, unemployment, underemployment, NEET, occupation, education, district |
| Rwanda Establishment Census | NISR | 2020, 2023 | Business count, sector, size, location |
| EICV Household Survey | NISR | 2023/24 | Poverty, household income, socioeconomic conditions |
| Population & Housing Census | NISR | 2022 | Working-age population, urbanisation |

All data is from NISR's public microdata catalog: https://microdatabk.statistics.gov.rw/catalog/

---

## What this is not

- Not a job board or matching platform
- Not a chatbot that returns prose
- Not a system that invents statistics
- Not a replacement for NISR's existing LMIS

It is a **complement** — a generative analytical workspace that makes NISR's existing data answerable to the intelligence questions that workforce planners, training institutions, and policymakers actually need answered.
