# Mboni

**Explore Rwanda's data. Understand what is changing. Make better-informed decisions.**

Mboni is an interactive analytical workspace designed to make Rwanda's public statistics easier to explore, interpret, compare, and use. It helps people move from a question to structured evidence through analytical results, indicators, visualizations, tables, and explanations.

Built by **Team Igisubizo** for the **2026 National Institute of Statistics of Rwanda (NISR) Big Data Hackathon**.

> **Live application:** https://mboni-app.vercel.app

---

## Contents

- [Project at a glance](#project-at-a-glance)
- [The problem](#the-problem)
- [Our approach](#our-approach)
- [Who Mboni is designed to help](#who-mboni-is-designed-to-help)
- [What users can explore](#what-users-can-explore)
- [How to use Mboni](#how-to-use-mboni)
- [Screenshots](#screenshots)
- [Dataset inventory](#dataset-inventory)
- [Analytical methodology](#analytical-methodology)
- [Responsible use of AI and statistics](#responsible-use-of-ai-and-statistics)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Run locally](#run-mboni-locally)
- [Repository structure](#repository-structure)
- [Reproducibility and data files](#reproducibility-and-data-files)
- [Team](#team-and-contributions)

---

## Project at a glance

| Item                         | Details                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| Project                      | Mboni                                                                  |
| Team                         | Igisubizo                                                              |
| Competition                  | 2026 NISR Big Data Hackathon                                           |
| Project type                 | Interactive data exploration and analytical decision-support workspace |
| Primary context              | Rwanda's public statistics and development data                        |
| Frontend                     | Next.js and TypeScript                                                 |
| Backend API                  | Node.js and TypeScript                                                 |
| Analytical/model service     | Python                                                                 |
| Database                     | PostgreSQL                                                             |
| Cache / queue infrastructure | Redis                                                                  |
| Local orchestration          | Docker Compose and pnpm                                                |
| Live application             | https://mboni-app.vercel.app                                           |

### What Mboni does

Mboni makes statistical evidence more approachable to people who may not have the time, technical background, or specialist tools required to work directly with datasets and statistical publications.

A user starts with a question. Where the question is supported by the data and analytical capabilities in the application, Mboni presents a structured result that can include:

- Key indicators and summary metrics.
- Charts selected to suit the type of result.
- Tables that allow users to inspect values.
- Comparisons across supported categories, places, or periods.
- Explanatory text that helps users interpret the result.
- Source information and limitations.

## The problem

Rwanda produces and publishes statistics that can support decisions in government, business, education, research, civil society, and everyday life. However, finding and using statistical evidence can be difficult for people who are not familiar with statistical portals, data formats, analytical software, or the terminology used in official publications.

A person considering a career may want to understand how employment patterns have changed. An entrepreneur may want to investigate regional or sector-level conditions before exploring a business idea. A researcher may need to compare indicators across years. A policymaker or development practitioner may need to understand where a trend is improving, where a gap remains, and what evidence supports that interpretation.

These questions share a common need: **relevant data must be discoverable, understandable, and presented with enough context to be assessed.**

Mboni addresses this usability challenge by bringing question-led exploration, analytical outputs, visual communication, and explanations into one workspace.

### The problem we are addressing

1. **Discoverability:** Relevant information can be spread across datasets, portals, reports, and publications.
2. **Interpretability:** Raw tables and statistical files can be difficult to interpret without analytical experience.
3. **Comparison:** Understanding change over time or differences between groups often requires additional data preparation.
4. **Decision context:** A statistic is more useful when users can understand its definition, period, coverage, and limitations.
5. **Accessibility:** Statistical information should be communicated in forms that are easier for different users to inspect and understand.

Mboni is a decision-support tool, not an official statistics producer. It aims to improve access to evidence, not replace the institutions responsible for producing official statistics or the experts responsible for interpreting them.

## Our approach

Mboni combines a conversational entry point with a structured analytical workspace.

Instead of treating a response as only a block of generated text, the application presents analytical findings as inspectable outputs. Users can see the result, understand how it is being communicated, and examine available values and source context.

### From question to evidence

1. **Ask:** The user enters a question related to a supported topic or dataset.
2. **Understand:** The system identifies the analytical intent and relevant available data.
3. **Analyze:** The analytical services process the available data using supported methods.
4. **Structure:** The result is organized into a validated presentation specification.
5. **Visualize:** The application renders appropriate indicators, charts, tables, and explanations.
6. **Inspect:** The user reviews values, comparisons, source information, and caveats.

The analytical result and its visual presentation are separate concerns. Changing how a result is displayed does not change the underlying analytical values.

### Why this approach matters

A chart can make a trend easier to see, but it must not obscure the underlying values. A generated explanation can make a result easier to understand, but it must not be treated as a substitute for the data. Mboni therefore emphasizes structured outputs, validation, and source-aware interpretation.

## Who Mboni is designed to help

Mboni is intended to serve people who need to understand Rwanda through evidence, including users who are not professional data analysts.

### Students and career explorers

Students and people exploring career options can use historical and current datasets to investigate changes in employment, education, economic activity, and other indicators.

Example questions:

- How have employment-related indicators changed over the available years?
- Which sectors have shown growth or decline in the available data?
- How do education-related indicators differ across groups or locations?
- What does the available evidence suggest about changes in the labour market?

These analyses help users ask better questions and identify areas for further research. Historical trends do **not** guarantee future job demand, individual employment outcomes, or the suitability of a particular career.

### Entrepreneurs and business researchers

People considering a business idea can use public indicators to understand the context in which they plan to operate.

Example questions:

- How do population characteristics differ across districts?
- What changes are visible in relevant economic or household indicators?
- Which regions differ on a selected indicator?
- What public evidence is available about a sector or market-related condition?

Mboni helps users investigate context. It does not replace market research, customer validation, financial planning, regulatory checks, or professional business advice.

### Researchers, policymakers, and the public

Researchers can explore indicators, compare values, inspect trends, and identify questions for deeper statistical investigation. Policymakers and development practitioners can use relevant evidence to understand patterns and identify where further investigation is useful. Members of the public can use Mboni to approach official statistics more easily.

## What users can explore

| Area                           | Example questions                                                        | Relevant evidence                                                    |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Employment and labour          | How have employment indicators changed over time?                        | Labour-force and employment statistics                               |
| Education                      | How do education indicators vary across years or locations?              | Education participation, attainment, and related indicators          |
| Population and demographics    | How do population characteristics differ across locations?               | Census and population estimates                                      |
| Poverty and living conditions  | How have selected welfare indicators changed?                            | Household surveys and poverty statistics                             |
| Agriculture                    | How do agricultural indicators vary across seasons, years, or locations? | Agricultural surveys and related official data                       |
| Business and economic activity | What changes are visible in relevant economic indicators?                | Business, industry, national accounts, and other economic statistics |
| Financial inclusion            | What patterns are visible in access to financial services?               | Household and financial inclusion statistics                         |

Users should rely on the sources, periods, geographic coverage, and definitions shown for each analysis.

## How to use Mboni

**Open the deployed application:** https://mboni-app.vercel.app

1. Open the web application, then log in or create an account.
2. Start with a question on a supported topic.
3. Submit the question and allow the analysis to complete.
4. Inspect the indicators, charts, tables, and explanation returned.
5. Review the source details, time period, geographic coverage, and caveats.
6. Try another question or comparison.

## Try the app

Open https://mboni-app.vercel.app and sign in with the demo account below, or create your own account.

| Field    | Value                |
| -------- | -------------------- |
| Email    | `<demo email>`       |
| Password | `<demo password>`    |

The demo account is for evaluation only. Please do not change its password or save personal information in it.

## Screenshots

### 1. Main workspace

![Mboni main workspace](docs/screenshots/01-home.png)

### 2. Question and conversation

![Question and analytical response](docs/screenshots/02-question.png)

### 3. Analytical dashboard

![Charts, indicators, and insights](docs/screenshots/03-analysis.png)

### 4. Inspecting data

![Data tables and comparisons](docs/screenshots/04-data-inspection.png)

### 5. Geographic analysis

![Geographic analysis](docs/screenshots/05-geographic-analysis.png)

### 6. Final Conclusion analysis

![Geographic analysis](docs/screenshots/06-final-conclusion.png)

### 7. Analysis history

![Saved analyses and history](docs/screenshots/07-history.png)

## Dataset inventory

The datasets used by Mboni, with their providers, coverage, and sources.

| Dataset name              | Data provider                                                    | Reference year / period | Geographic coverage | Variables or indicators used                                                     | Source link                                                                    | Local file / location                                                                      |
| ------------------------- | ---------------------------------------------------------------- | ----------------------- | ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Career demand             | Rwanda Labour Market Information System (LMIS) / KORA Job Portal | 2025                    | National            | Occupation, job postings, skills demanded                                        | [LMIS](https://lmis.rw/) ; [KORA](https://jobportal.kora.rw/)                  | [model/data/real/career_demand.csv](model/data/real/career_demand.csv)                     |
| District agriculture      | NISR (Seasonal Agricultural Survey)                              | 2019-2025               | District            | Crop area, production, yield, agricultural households                            | [SAS 2025](https://microdatabk.statistics.gov.rw/catalog/124)                  | [model/data/real/district_agriculture.csv](model/data/real/district_agriculture.csv)       |
| District education        | NISR (Population and Housing Census)                             | 2022                    | District            | School attendance, literacy, education level attained                            | [PHC 2022](https://microdatabk.statistics.gov.rw/catalog/108)                  | [model/data/real/district_education.csv](model/data/real/district_education.csv)           |
| District establishments   | NISR (Establishment Census)                                      | 2020, 2023              | District            | Number of establishments, sector, size, employment                               | [Establishment Census 2023](https://microdatabk.statistics.gov.rw/catalog/105) | [model/data/real/district_establishments.csv](model/data/real/district_establishments.csv) |
| District health           | NISR (Demographic and Health Survey)                             | 2019-2020, 2025         | District / Province | Health access, child and maternal health, nutrition indicators                   | [DHS 2025](https://www.microdata.statistics.gov.rw/index.php/catalog/126)      | [model/data/real/district_health.csv](model/data/real/district_health.csv)                 |
| District labour           | NISR (Labour Force Survey)                                       | 2019-2025               | District            | Employment rate, unemployment rate, labour force participation, youth employment | [LFS 2025](https://microdatabk.statistics.gov.rw/catalog/125)                  | [model/data/real/district_labour.csv](model/data/real/district_labour.csv)                 |
| District poverty          | NISR (EICV7)                                                     | 2023/24                 | District            | Poverty rate, extreme poverty rate, household consumption                        | [EICV7](https://microdatabk.statistics.gov.rw/catalog/118)                     | [model/data/real/district_poverty.csv](model/data/real/district_poverty.csv)               |
| Higher education programs | Rwanda Data Sharing Platform (HEC / MINEDUC listings)            | 2025                    | National            | Institution, program name, field of study, level                                 | [data.gov.rw](https://data.gov.rw/datasets)                                    | [model/data/real/higher_ed_programs.csv](model/data/real/higher_ed_programs.csv)           |
| National exams            | Rwanda Data Sharing Platform (NESA results)                      | 2025                    | National / District | Pass rates, candidates, subject combinations, performance                        | [data.gov.rw](https://data.gov.rw/datasets)                                    | [model/data/real/national_exams.csv](model/data/real/national_exams.csv)                   |
| Sector employment         | NISR (Labour Force Survey)                                       | 2019-2025               | Sector / National   | Employment by industry sector, occupation, share of workforce                    | [LFS 2025](https://microdatabk.statistics.gov.rw/catalog/125)                  | [model/data/real/sector_employment.csv](model/data/real/sector_employment.csv)             |
| TVET courses              | Rwanda Data Sharing Platform (RTB / WDA listings)                | 2025                    | National            | Trade, course name, level, institution                                           | [data.gov.rw](https://data.gov.rw/datasets)                                    | [model/data/real/tvet_courses.csv](model/data/real/tvet_courses.csv)                       |

## Analytical methodology

Mboni aims to make analytical results easier to inspect, not simply to generate plausible-sounding text. Reliability depends on the quality of the input data, the appropriateness of the method, and the validity of the interpretation.

### Analytical workflow

1. **Question and intent:** Identify what the user is asking and the type of analysis required.
2. **Dataset selection:** Identify relevant datasets and fields that are available.
3. **Data preparation:** Apply the required cleaning, filtering, aggregation, and transformations.
4. **Analysis:** Calculate indicators or apply the relevant analytical method.
5. **Result validation:** Check the analytical result and its structure.
6. **Presentation planning:** Select suitable visual components for the result.
7. **Rendering:** Display the result with explanations and source context.

### Choosing a visualization

| Result type                            | Suitable presentation                   | What it helps users inspect          |
| -------------------------------------- | --------------------------------------- | ------------------------------------ |
| Single value or summary indicator      | Metric / KPI                            | A key value and its context          |
| Comparison across categories           | Bar chart or table                      | Relative differences                 |
| Change over time                       | Line or area chart                      | Direction and pattern over time      |
| Relationship between numeric variables | Scatter plot                            | Association and distribution         |
| Exact values or detailed records       | Table                                   | Values that should be read precisely |
| Geographic comparison                  | Map, when valid geographic fields exist | Spatial differences                  |
| Derived indicator                      | Formula and explanation                 | How a value was calculated           |

### Presentation validation

The presentation layer does not invent statistical values. It references values from the analytical result and uses supported component types. Each presentation specification is validated against the available result structure before rendering.

## Responsible use of AI and statistics

Mboni uses AI-assisted interaction and structured analytical presentation. AI-generated language must not be confused with official statistical publication or independently verified evidence.

### Historical data and future-oriented questions

Historical data helps users understand what has changed and identify patterns worth investigating. However, historical patterns do not automatically predict the future. Labour-market conditions, for example, are affected by policy, investment, technology, education, demographics, global conditions, and other factors. Any future-oriented result should be read with its assumptions, method, uncertainty, and limitations in mind.

### Decision support, not automated decision-making

Mboni supports informed exploration. It should not be treated as the sole basis for decisions about employment, investment, credit, public policy, business viability, or individual welfare.

## Architecture

Mboni is a multi-service application with a web client, an API, and an analytical/model service.

### Main components

| Component                | Responsibility                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Web application          | User interface, question entry, and presentation of analytical workspaces                                 |
| API                      | Application endpoints and coordination between the web application, data services, and analytical service |
| Analytical/model service | Python-based analytical and model functionality                                                           |
| PostgreSQL               | Persistent relational data storage                                                                        |
| Redis                    | Cache and queue infrastructure                                                                            |
| Docker Compose           | Local orchestration of development services                                                               |

### High-level request flow

```text
User
  |
  v
Next.js web application
  |
  v
Node.js / TypeScript API
  |
  +----------------------+
  |                      |
  v                      v
PostgreSQL              Redis
  |
  +--------------------------> Python analytical/model service
                                      |
                                      v
                              Analytical result
                                      |
                                      v
                              Validated presentation
                                      |
                                      v
                              Interactive workspace
```

### Presentation planner

The presentation-planning layer organizes an analytical result into supported visual components. It has a deterministic rules-based planning path and an optional language-model-assisted path when the relevant configuration is present.

The rules-based planner is the fallback when the optional LLM planner is unavailable or cannot produce a valid specification. The planner is a presentation component, not the statistical engine that produces the underlying analysis.

The final presentation specification is validated before rendering. This keeps the user interface within the supported component catalog and ties displayed values to the analytical result.

## Technology stack

| Layer                        | Technology             | Role                                            |
| ---------------------------- | ---------------------- | ----------------------------------------------- |
| Web application              | Next.js                | Web application framework                       |
| Frontend language            | TypeScript             | Typed application development                   |
| API                          | Node.js and TypeScript | Backend application services                    |
| Analytical service           | Python                 | Data and analytical/model functionality         |
| Database                     | PostgreSQL             | Relational persistence                          |
| Cache / queue infrastructure | Redis                  | Supporting infrastructure                       |
| Development orchestration    | Docker Compose         | Local multi-service environment                 |
| Package manager              | pnpm                   | Root development scripts and package management |

## Run Mboni locally

The repository includes a Docker Compose development setup. Root scripts:

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `pnpm run dev`       | Start the development Docker Compose stack |
| `pnpm run dev:build` | Build service images and start the stack   |
| `pnpm run dev:logs`  | Follow development service logs            |
| `pnpm run dev:down`  | Stop the development stack                 |

### Prerequisites

Install:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with the Docker Compose plugin
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### 1. Clone the repository

```bash
git clone https://github.com/AimableUK/IGISUBIZO_NISR_ML
cd IGISUBIZO_NISR_ML
```

### 2. Configure environment variables

The API service loads a root `.env` file. Copy the template and fill in the required values:

```bash
cp .env.example .env
```

The Compose configuration supplies the PostgreSQL and Redis connection values. The web service reaches the API at `http://localhost:4000`.

### 3. Build and start the services

```bash
pnpm run dev:build
```

Or start the stack without rebuilding:

```bash
pnpm run dev
```

### 4. Open the local services

| Service                  | Local address         |
| ------------------------ | --------------------- |
| Web application          | http://localhost:3000 |
| API                      | http://localhost:4000 |
| Analytical/model service | http://localhost:8000 |

The API depends on PostgreSQL, Redis, and the model service. The first startup may take longer while Docker builds images and installs dependencies.

### 5. View logs

```bash
pnpm run dev:logs
```

### 6. Stop the development stack

```bash
pnpm run dev:down
```

The PostgreSQL data is kept in a named Docker volume, so stopping the services does not delete the database.

### Troubleshooting

| Problem                                  | What to check                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Docker reports that `.env` is missing    | Create the root `.env` and populate the variables required by the API                   |
| A port is already in use                 | Check ports `3000`, `4000`, `5432`, `6379`, and `8000`                                  |
| A service fails during startup           | Run `pnpm run dev:logs` and inspect the failing service                                 |
| Web application loads but analysis fails | Inspect API and model service logs and verify their configured URLs                     |
| Changes are not reflected                | Rebuild the relevant image with `pnpm run dev:build`                                    |
| Database connection fails                | Confirm PostgreSQL is healthy and the API connection string matches the Compose service |

## Repository structure

```text
IGISUBIZO_NISR_ML/
├── web/                    # Next.js web application
├── api/                    # Node.js / TypeScript API
├── model/                  # Python analytical/model service
│   └── data/
│       ├── official/       # Official source files
│       └── real/           # Datasets used by the model
├── docs/
│   └── screenshots/        # README screenshots
├── docker-compose.yml      # Local development services
├── package.json            # Root development scripts
├── pnpm-lock.yaml          # Root package lockfile
├── .env.example            # Environment variable template
└── README.md               # Project documentation
```

## Reproducibility and data files

The datasets used by Mboni are stored in [`model/data/real/`](model/data/real/) and listed in the [dataset inventory](#dataset-inventory) with their providers and source links. Any dataset too large to include in the repository is linked from its source in the inventory and must be downloaded from there into the same folder.

## Team and contributions

**Team name:** Igisubizo

| Team member       | Contribution                                              | GitHub                                         |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Aimable Ukobizaba | Full-stack application development and system integration | [@AimableUK](https://github.com/AimableUK)     |
| EnockHumure       | Analytical/model development and related project work     | [@EnockHumure](https://github.com/EnockHumure) |

### AI assistance disclosure

> AI tools were used to assist with selected aspects of project planning, software development, documentation, and analytical-method exploration. The team reviewed the resulting work and remains responsible for the implementation, data sources, analytical methods, validation, and findings presented in this submission.

---

<p align="center">
  <strong>Mboni</strong><br />
  Explore Rwanda's data. Understand what is changing. Make better-informed decisions.<br />
  <strong>Team Igisubizo | NISR Big Data Hackathon 2026</strong>
</p>
