# Isesengura

**An interactive analytical workspace for exploring Rwanda's public data and turning evidence into clearer decisions.**

Isesengura helps people explore statistical data through structured analyses, indicators, charts, tables, and explanatory insights. Instead of returning only a conversational answer, the goal is to make findings easier to inspect, compare, understand, and revisit.

> **Hackathon project:** Developed by Team Igisubizo for the 2026 NISR Big Data Hackathon.

## Overview

Public data is most useful when people can find relevant evidence, understand what it means, and inspect how conclusions were reached. Isesengura is being built to make that process more accessible through an analytical workspace that combines data, visualizations, and explanations.

The project focuses on:

- Making statistical information easier to explore.
- Presenting results through suitable charts, tables, indicators, and summaries.
- Supporting comparisons across available locations, periods, and categories.
- Keeping data sources and analytical limitations visible.
- Helping users move from a question to an inspectable result, rather than relying on an unsupported answer.

The availability of any specific analysis depends on the datasets and analytical methods integrated into the current deployment. The project does not claim that every topic, district, or period is already covered.

## Why Isesengura?

Statistical publications and datasets can be difficult to navigate when a user needs to compare indicators, understand a trend, or find evidence for a decision. Isesengura aims to reduce that friction by bringing the question, evidence, visualization, and explanation into one workspace.

Our goal is not to replace official statistics or expert judgment. It is to make credible data easier to work with while keeping the underlying evidence inspectable.

## Core experience

Depending on the data and analysis available in the deployed version, Isesengura is designed to support:

- **Question-led analysis:** Start with a question about a supported dataset or indicator.
- **Visual results:** Present findings using suitable metrics, charts, tables, and other supported visual components.
- **Comparison and exploration:** Inspect differences across available groups, locations, or time periods.
- **Explanatory insights:** Read concise interpretations alongside the results.
- **Source-aware results:** Connect outputs to the available data sources and disclose relevant limitations.
- **Reusable workspace:** Make analyses easier to review and revisit where history is enabled.
- **Accessible presentation:** Aim to make findings understandable through more than visual charts alone, including readable values and text explanations.

These are project goals and supported capabilities should be judged against what is actually enabled in the submitted deployment.

## Responsible use of data and AI

Isesengura is designed around a clear separation between analytical results and their presentation. A visualization should communicate the result, not silently change it.

Our principles are:

1. **Evidence before claims.** Findings should be grounded in available data and documented analytical methods.
2. **Traceability.** Source information and relevant limitations should accompany results where available.
3. **Validation.** Generated dashboard specifications must be checked against the result data and the supported component schema.
4. **No invented official statistics.** Example or synthetic data must not be presented as verified NISR data.
5. **Careful interpretation.** Correlation, prediction, or a model score should not be described as proof of causation.
6. **Human responsibility.** AI tools may assist development, but the team is responsible for the implementation, sources, methods, and reported findings.

The presence of a chart or model output does not, by itself, establish that a conclusion is statistically valid. Users should consider the source, coverage, period, definitions, and limitations of each result.

## Data

The project is intended to use credible public datasets, prioritizing the National Institute of Statistics of Rwanda (NISR) and relevant official or reputable public sources.

Useful starting points:

- [NISR official website](https://www.statistics.gov.rw/)
- [NISR Microdata Catalog](https://microdatabk.statistics.gov.rw/catalog/)
- [Rwanda Data Sharing Platform](https://data.gov.rw/datasets)
- [NISR PxWeb database](https://pxweb.statistics.gov.rw/pxweb/en/)
- [2026 NISR Big Data Hackathon](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition)

Dataset availability, geographic detail, time coverage, definitions, and permitted uses differ by source. Isesengura should only make a claim when the integrated data and method support it. A dataset being publicly available does not mean it has already been integrated into the application.

## Technology

The current development stack is organized into separate services:

| Layer                    | Technology              |
| ------------------------ | ----------------------- |
| Web application          | Next.js and TypeScript  |
| API                      | Node.js and TypeScript  |
| Analytical/model service | Python                  |
| Database                 | PostgreSQL              |
| Cache / queue service    | Redis                   |
| Local development        | Docker Compose and pnpm |

The repository is organized around `web/`, `api/`, and `model/`, with shared infrastructure services managed through Docker Compose.

## Run locally

### Prerequisites

Install the following before starting the project:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) with Docker Compose
- [Node.js](https://nodejs.org/) compatible with the project dependencies
- [pnpm](https://pnpm.io/)

Python is also needed if you intend to run model/data preparation commands directly on your machine. The standard development path runs the services in Docker.

### 1. Clone the repository

```bash
git clone <YOUR_PUBLIC_GITHUB_REPOSITORY_URL>
cd isesengura
```

Replace the repository URL with the public GitHub URL for this project.

### 2. Configure environment variables

The development Compose file loads environment variables from a root `.env` file for the API service. Create that file before starting the stack:

```bash
touch .env
```

Populate it with the required API environment variables. Check the API environment schema/configuration in the repository for the exact names and required values. Do not commit real secrets or production credentials.

If the repository includes an `.env.example`, prefer copying it:

```bash
cp .env.example .env
```

The local Compose configuration sets the development database and Redis connection strings for the API. The web service is configured to call the API at `http://localhost:4000`.

### 3. Start the development stack

Build the images and start the services:

```bash
pnpm run dev:build
```

Alternatively, start without explicitly forcing a rebuild:

```bash
pnpm run dev
```

Once the services are ready, open:

- **Web application:** http://localhost:3000
- **API:** http://localhost:4000
- **Analytical/model service:** http://localhost:8000

The API depends on PostgreSQL, Redis, and the model service. Initial startup may take longer while Docker builds the images and installs dependencies.

### 4. Useful development commands

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `pnpm run dev`       | Start the development Docker Compose stack |
| `pnpm run dev:build` | Build images and start the stack           |
| `pnpm run dev:logs`  | Follow logs from the Compose services      |
| `pnpm run dev:down`  | Stop the development stack                 |

To stop the stack, run:

```bash
pnpm run dev:down
```

The Compose configuration uses a persistent Docker volume for PostgreSQL data. Stopping the stack does not normally remove that volume.

### Optional data preparation

If you are working on the data/model service and its dependencies are installed, the repository may provide this script:

```bash
python3 model/generate_real.py
```

Use it only when you need to regenerate the model's CSV inputs. Check the script and model documentation for required datasets, dependencies, and output paths before running it.

## Testing the submitted application

For hackathon reviewers, the deployed application should be the simplest way to evaluate Isesengura. Add the public deployment URL below before submitting this README:

**Live application:** `https://isesengura.vercel.app`

Suggested review flow:

1. Open the application and try a question that matches a dataset currently integrated into the deployment.
2. Inspect the displayed indicators, visualizations, tables, and written interpretation.
3. Check the source information, period, geographic coverage, and caveats shown for the result.
4. Try a supported comparison or filter, if available.
5. Confirm that the visualization represents the underlying result rather than changing the values.
6. If a feature or dataset is not available, treat it as outside the current implementation rather than assuming it is supported.

### Local troubleshooting

- **Compose reports that `.env` is missing:** Create the root `.env` file and add the required API variables.
- **A port is already in use:** Stop the other process using port `3000`, `4000`, `5432`, `6379`, or `8000`, or update the relevant Compose port mapping.
- **A code or dependency change is not reflected:** Rebuild the relevant service, or run `pnpm run dev:build`.
- **The web page loads but an analysis fails:** Inspect logs with `pnpm run dev:logs`, especially the API and model service logs.
- **The model service is unavailable:** Check its container health/logs and whether the API's configured fallback behavior is enabled.

## Hackathon relevance

Isesengura is intended to support evidence-informed decisions by making public statistics easier to explore and interpret. Its relevance to the NISR Big Data Hackathon depends on the selected challenge, the datasets actually integrated, and the validity of the methods used.

The project should be evaluated on:

- How clearly it addresses the selected problem.
- Whether the data sources and methods are appropriate and traceable.
- Whether the analytical results are validated and interpreted responsibly.
- Whether the interface helps users understand the evidence.
- Whether the outputs can inform a real decision without overstating what the data proves.

## Team Igisubizo

Built by:

- **[Aimable Ukobizaba](https://github.com/AimableUK)**
- **[Humureenock](https://github.com/EnockHumure)**

## Project status

Isesengura is a hackathon project under active development. Available functionality, integrated datasets, and analytical coverage may change as the team validates sources and improves the application.

## Acknowledgements

We acknowledge NISR and other public data providers for making statistical resources available for analysis. Dataset owners remain the authoritative sources for their published statistics.

---

**Isesengura | Team Igisubizo | NISR Big Data Hackathon 2026**
