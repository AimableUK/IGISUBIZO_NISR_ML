# Mboni

**Explore Rwanda's data. Understand what is changing. Make better-informed decisions.**

Mboni is an interactive analytical workspace designed to make Rwanda's public statistics easier to explore, interpret, compare, and use. It helps people move from a question to structured evidence through analytical results, indicators, visualizations, tables, and explanations.

Built by **Team Igisubizo** for the **2026 National Institute of Statistics of Rwanda (NISR) Big Data Hackathon**.

> **Live application:** https://mboni.vercel.app  
> **Public source repository:** Replace this line with the actual GitHub repository URL.  
> **Demonstration video:** Add the path to the screen recording in this repository.

---

## Contents

- [Project at a glance](#project-at-a-glance)
- [The problem](#the-problem)
- [Our approach](#our-approach)
- [Who Mboni is designed to help](#who-mboni-is-designed-to-help)
- [What users can explore](#what-users-can-explore)
- [How to use Mboni](#how-to-use-mboni)
- [Data sources and access](#data-sources-and-access)
- [Dataset inventory](#dataset-inventory-for-this-submission)
- [Analytical methodology](#analytical-methodology)
- [Responsible use of AI and statistics](#responsible-use-of-ai-and-statistics)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Run locally](#run-mboni-locally)
- [Repository structure](#repository-structure)
- [Reproducibility and data files](#reproducibility-and-data-files)
- [Demonstration video](#demonstration-video)
- [Limitations and scope](#limitations-and-scope)
- [Hackathon relevance](#relevance-to-the-nisr-big-data-hackathon)
- [Team](#team-and-contributions)
- [Acknowledgements](#acknowledgements-and-references)
- [Originality and AI disclosure](#declaration-of-originality-and-ai-assistance)

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
| Live application             | https://mboni.vercel.app                                               |

### What Mboni does

Mboni is designed to make statistical evidence more approachable to people who may not have the time, technical background, or specialist tools required to work directly with datasets and statistical publications.

A user starts with a question. Where the question is supported by the data and analytical capabilities available in the application, Mboni presents a structured result that can include:

- Key indicators and summary metrics.
- Charts selected to suit the type of result.
- Tables that allow users to inspect values.
- Comparisons across supported categories, places, or periods.
- Explanatory text that helps users interpret the result.
- Source information and limitations, where available.

The exact analyses available depend on the datasets, preprocessing, and methods integrated into the submitted version. Mboni does not claim that every Rwanda-related question can already be answered.

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

Instead of treating a response as only a block of generated text, the application is designed to present analytical findings as inspectable outputs. Users should be able to see the result, understand how it is being communicated, and examine available values and source context.

### From question to evidence

1. **Ask:** The user enters a question related to a supported topic or dataset.
2. **Understand:** The system identifies the analytical intent and relevant available data.
3. **Analyze:** The analytical services process the available data using supported methods.
4. **Structure:** The result is organized into a validated presentation specification.
5. **Visualize:** The application renders appropriate indicators, charts, tables, and explanations.
6. **Inspect:** The user reviews values, comparisons, source information, and caveats where provided.

The analytical result and its visual presentation are separate concerns. Changing how a result is displayed should not silently change the underlying analytical values.

### Why this approach matters

A chart can make a trend easier to see, but it must not obscure the underlying values. A generated explanation can make a result easier to understand, but it must not be treated as a substitute for the data. Mboni therefore emphasizes structured outputs, validation, and source-aware interpretation.

## Who Mboni is designed to help

Mboni is intended to serve people who need to understand Rwanda through evidence, including users who are not professional data analysts.

### Students and career explorers

Students and people exploring career options may use relevant historical and current datasets to investigate changes in employment, education, economic activity, and other indicators.

Example questions include:

- How have employment-related indicators changed over the available years?
- Which sectors have shown growth or decline in the available data?
- How do education-related indicators differ across available groups or locations?
- What does the available evidence suggest about changes in the labour market?

These analyses can help users ask better questions and identify areas for further research. Historical trends do **not** guarantee future job demand, individual employment outcomes, or the suitability of a particular career.

### Entrepreneurs and business researchers

People considering a business idea may use relevant public indicators to understand the context in which they plan to operate.

Example questions include:

- How do population characteristics differ across districts?
- What changes are visible in relevant economic or household indicators?
- Which regions differ on a selected indicator?
- What public evidence is available about a sector or market-related condition?

Mboni can help users investigate context. It does not replace market research, customer validation, financial planning, regulatory checks, or professional business advice. A favourable statistical indicator does not prove that a particular business will be profitable.

### Researchers, policymakers, and the public

Researchers may explore supported indicators, compare values, inspect trends, and identify questions for deeper statistical investigation. Policymakers and development practitioners may use relevant evidence to understand patterns and identify where further investigation is useful. Members of the public may use Mboni to approach official statistics more easily.

**These are intended user groups and use cases.** Availability depends on the data and functionality actually integrated into the deployed application.

## What users can explore

The topics below describe the intended analytical scope. They are not a claim that every dataset or analysis is already available in the current deployment.

| Area                           | Example questions                                                        | Potentially relevant evidence                                        |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Employment and labour          | How have employment indicators changed over time?                        | Labour-force and employment statistics                               |
| Education                      | How do education indicators vary across years or locations?              | Education participation, attainment, and related indicators          |
| Population and demographics    | How do population characteristics differ across locations?               | Census and population estimates                                      |
| Poverty and living conditions  | How have selected welfare indicators changed?                            | Household surveys and poverty statistics                             |
| Agriculture                    | How do agricultural indicators vary across seasons, years, or locations? | Agricultural surveys and related official data                       |
| Business and economic activity | What changes are visible in relevant economic indicators?                | Business, industry, national accounts, and other economic statistics |
| Financial inclusion            | What patterns are visible in access to financial services?               | Relevant household and financial inclusion statistics                |

The presence of a topic in this table does not mean that all of its indicators are integrated. Users should rely on the sources, periods, geographic coverage, and definitions shown for a particular analysis.

## How to use Mboni

**Open the deployed application:** https://mboni.vercel.app

The following is a suggested evaluation path. Exact labels and available interactions may differ depending on the current deployment.

1. Open the application.
2. Start with a question related to a dataset or topic currently supported by the application.
3. Submit the question and allow the analysis to complete.
4. Inspect the indicators, charts, tables, and explanation returned.
5. Review the available source details, time period, geographic coverage, and caveats.
6. Try another supported question or comparison.
7. If history or saved analyses are available in the deployment, use them to revisit a previous result.

## Screenshots

The following screenshots demonstrate Mboni's actual interface and functionality.

### 1. Main workspace

![Mboni main workspace](docs/screenshots/01-home.png)

### 2. Question and conversation

![Question and analytical response](docs/screenshots/02-question.png)

### 3. Analytical dashboard

![Charts, indicators, and insights](docs/screenshots/03-analysis.png)

### 4. Inspecting data

![Data tables and comparisons](docs/screenshots/04-data-inspection.png)

### 5. Geographic analysis (if implemented)

![Geographic analysis](docs/screenshots/05-geographic-analysis.png)

### 6. Analysis history (if implemented)

![Saved analyses and history](docs/screenshots/06-history.png)

### Suggested reviewer questions

Use these only if the relevant datasets and analyses are available in the deployed version:

- How has [supported indicator] changed over the available years?
- Compare [supported indicator] across the available districts.
- Which categories have the highest values for [supported indicator] in [available period]?
- What patterns can be observed in [supported dataset]?
- How do [group A] and [group B] compare on [supported indicator]?

Replace bracketed terms with indicators and periods that are actually present in the application. These examples are not claims that the application supports every question.

### What reviewers should inspect

- Does the result use data available in the application?
- Are values and units understandable?
- Is the visualization appropriate for the data?
- Can users inspect the underlying values?
- Are the source and period clear?
- Does the explanation distinguish observation from interpretation?
- Are uncertainty and limitations communicated appropriately?

## Data sources and access

Mboni prioritizes data published by the **National Institute of Statistics of Rwanda (NISR)** and may use other credible public sources where they add relevant context.

NISR is responsible for the collection and publication of statistics related to Rwanda's economy, population, and society. Its mission includes improving the use of information for evidence-based decision-making through the coordination, collection, archiving, analysis, documentation, and dissemination of reliable data.

### Official and relevant data portals

| Source                                     | What it provides                                                           | Link                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| National Institute of Statistics of Rwanda | Official statistics, publications, releases, and institutional information | [statistics.gov.rw](https://www.statistics.gov.rw/)                                        |
| NISR Microdata Catalog                     | Catalog of survey and census microdata and documentation                   | [Microdata Catalog](https://microdata.statistics.gov.rw/index.php/catalog)                 |
| Rwanda Data Sharing Platform               | Public datasets made available through the national data platform          | [data.gov.rw](https://data.gov.rw/datasets)                                                |
| NISR PxWeb                                 | Statistical tables and indicators available through the PxWeb database     | [PxWeb](https://pxweb.statistics.gov.rw/pxweb/en/)                                         |
| NISR 2026 Big Data Hackathon               | Competition information and official requirements                          | [Hackathon page](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition) |

### Accessing NISR microdata

The NISR preparatory webinar describes this process for accessing microdata:

1. Visit the [NISR Microdata Catalog](https://microdata.statistics.gov.rw/index.php/catalog).
2. Register for an account if required.
3. Browse or search the catalog for a relevant dataset.
4. Open the dataset's catalog page.
5. Select **Get Microdata** and submit the access request form.
6. Follow the access conditions and instructions provided for that dataset.

The webinar notes that access to public-use datasets is usually granted immediately. Access conditions can differ by dataset, so follow the current instructions on the portal.

### Data source and use principles

- Prefer original data-provider documentation when interpreting an indicator.
- Preserve dataset names, survey years, units, definitions, and geographic coverage.
- Do not assume that all datasets on a portal are integrated into Mboni.
- Respect access conditions, licenses, confidentiality requirements, and data-provider terms.
- Do not publish confidential microdata or personally identifiable information.
- Cite the source of each dataset used in an analysis.
- Where an external dataset is used, explain why it is relevant and how it relates to the NISR data.

## Dataset inventory for this submission

This section is important for evaluation. Complete it with the **exact datasets used by the deployed version**. Do not leave example entries or claim a source is integrated unless it is actually used by the application.

| Dataset name            | Data provider        | Reference year / period | Geographic coverage | Variables or indicators used | Source link           | Local file / location                           |
| ----------------------- | -------------------- | ----------------------- | ------------------- | ---------------------------- | --------------------- | ----------------------------------------------- |
| Add exact dataset title | NISR / provider name | Add period              | Add coverage        | Add fields used              | Add direct source URL | Add repository path or state external retrieval |
| Add exact dataset title | NISR / provider name | Add period              | Add coverage        | Add fields used              | Add direct source URL | Add repository path or state external retrieval |

For every dataset, document:

1. **Dataset title:** Use the official title shown by the provider.
2. **Publisher:** Identify NISR or the relevant external organization.
3. **Reference period:** State the year, range, survey round, or update date.
4. **Geographic coverage:** State whether the data is national, provincial, district-level, or another level.
5. **Relevant variables:** List the columns or indicators used by the application.
6. **Preparation:** Describe cleaning, filtering, aggregation, joins, or transformations performed.
7. **Limitations:** Note missing values, sampling limitations, definitional differences, or gaps relevant to interpretation.
8. **Access:** Link to the original dataset or its official catalog record.

### Data files in this repository

List the actual files committed to the repository. If a dataset is too large to include, provide its official source link and explain how an authorized user can obtain it.

| File or directory | Description                    | Included in Git? | Source / retrieval instructions |
| ----------------- | ------------------------------ | ---------------: | ------------------------------- |
| Add actual path   | Describe the file and its role |         Yes / No | Add source URL or instructions  |
| Add actual path   | Describe the file and its role |         Yes / No | Add source URL or instructions  |

Do not commit restricted microdata, personal information, credentials, or files that the provider does not permit you to redistribute.

## Analytical methodology

Mboni aims to make analytical results easier to inspect, not simply to generate plausible-sounding text. Reliability depends on the quality of the input data, the appropriateness of the method, and the validity of the interpretation.

### Analytical workflow

1. **Question and intent:** Identify what the user is asking and the type of analysis required.
2. **Dataset selection:** Identify relevant datasets and fields that are actually available.
3. **Data preparation:** Apply the required cleaning, filtering, aggregation, and transformations.
4. **Analysis:** Calculate indicators or apply the relevant analytical method.
5. **Result validation:** Check the analytical result and its structure.
6. **Presentation planning:** Select suitable visual components for the result.
7. **Rendering:** Display the result with available explanations and source context.

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

A map should only be used when valid geographic information is available. A time-series chart should only imply temporal change when the data has a meaningful time dimension.

### Presentation validation

The presentation layer should not invent statistical values. It should reference values from the analytical result and use supported component types. A presentation specification should be validated against the available result structure before rendering.

### Models and predictions

Where the application uses a predictive or machine-learning method, the documentation for that analysis should identify:

- The target variable and input features.
- The dataset and reference period.
- The preprocessing performed.
- The model or statistical method.
- The training and evaluation approach, where applicable.
- The evaluation metrics and their meaning.
- The limitations and intended use of the output.

A prediction is an estimate conditional on its data and assumptions. It is not a guarantee of a future outcome. If a deployed analysis does not use a predictive model, do not imply that it does.

## Responsible use of AI and statistics

Mboni uses AI-assisted interaction and structured analytical presentation as part of its intended experience. AI-generated language must not be confused with official statistical publication or independently verified evidence.

### Principles

1. **Evidence before claims.** Analytical statements should be supported by the data and method used.
2. **No fabricated statistics.** The system must not invent official figures, dataset contents, source references, or periods.
3. **Traceability.** Source details should be shown wherever the application has them.
4. **Separation of analysis and presentation.** Visual customization must not silently alter analytical values.
5. **Validation.** Generated presentation structures must be checked against the supported schema and result data.
6. **Appropriate interpretation.** Correlation does not establish causation. A trend does not, by itself, explain why a change occurred.
7. **Clear uncertainty.** Missing data, limited coverage, estimates, and model uncertainty should not be hidden.
8. **Human responsibility.** Users and the project team remain responsible for evaluating how outputs are used.

### Historical data and future-oriented questions

Historical data can help users understand what has changed and identify patterns worth investigating. It can provide context for questions about future possibilities.

However, historical patterns do not automatically predict the future. Labour-market conditions, for example, are affected by policy, investment, technology, education, demographics, global conditions, and other factors. Any future-oriented result should disclose its assumptions, method, uncertainty, and limitations.

### Decision support, not automated decision-making

Mboni is intended to support informed exploration. It should not be treated as the sole basis for decisions about employment, investment, credit, public policy, business viability, or individual welfare.

## Architecture

The current repository is organized as a multi-service application with a web client, API, and analytical/model service.

### Main components

| Component                | Responsibility                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Web application          | User interface, question entry, and presentation of analytical workspaces                                 |
| API                      | Application endpoints and coordination between the web application, data services, and analytical service |
| Analytical/model service | Python-based analytical and model functionality                                                           |
| PostgreSQL               | Persistent relational data storage                                                                        |
| Redis                    | Cache and/or queue infrastructure, according to implemented API workflows                                 |
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

This is a simplified conceptual view of service boundaries. The exact request sequence and persistence behavior depend on implemented endpoints and workflows.

### Presentation planner

The presentation-planning layer organizes an analytical result into supported visual components. The implementation includes a deterministic rules-based planning path and an optional language-model-assisted path when the relevant configuration is present.

The rules-based planner provides a fallback when the optional LLM planner is unavailable or cannot produce a valid specification. The planner is a presentation component; it should not be described as the statistical engine that produces the underlying analysis.

The final presentation specification must be validated before rendering. This helps keep the user interface within the supported component catalog and ties displayed values to the available analytical result.

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

The table describes the stack represented by the current project setup. It does not imply that every technology is used for every request or feature.

## Run Mboni locally

The repository includes a Docker Compose development setup. The root package scripts currently documented by the project are:

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
- [Node.js](https://nodejs.org/) compatible with the project dependencies
- [pnpm](https://pnpm.io/)

Python may also be needed for working directly with the model service or data preparation scripts. The standard development path uses Docker Compose to run the services.

### 1. Clone the repository

```bash
git clone <PUBLIC_GITHUB_REPOSITORY_URL>
cd mboni
```

Replace `<PUBLIC_GITHUB_REPOSITORY_URL>` with the actual public repository URL.

### 2. Configure environment variables

The development Compose configuration loads a root `.env` file for the API service. Create the file:

```bash
touch .env
```

If the repository contains a root `.env.example`, copy it instead:

```bash
cp .env.example .env
```

Review the API configuration and environment validation code to identify the exact required variables. Add the required local development values. Do not copy production secrets into the repository or share them in this README.

The Compose configuration supplies development connection values for PostgreSQL and Redis to the API service. The web service is configured to reach the API at `http://localhost:4000`.

### 3. Build and start the services

```bash
pnpm run dev:build
```

Or start the stack without explicitly requesting a rebuild:

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

The Compose configuration uses a named PostgreSQL volume. Stopping the services does not normally delete the database volume.

### Troubleshooting

| Problem                                  | What to check                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Docker reports that `.env` is missing    | Create the root `.env` and populate the variables required by the API                   |
| A port is already in use                 | Check ports `3000`, `4000`, `5432`, `6379`, and `8000`                                  |
| A service fails during startup           | Run `pnpm run dev:logs` and inspect the failing service                                 |
| Web application loads but analysis fails | Inspect API and model service logs and verify their configured URLs                     |
| Changes are not reflected                | Rebuild the relevant image or run `pnpm run dev:build`                                  |
| Database connection fails                | Confirm PostgreSQL is healthy and the API connection string matches the Compose service |

Do not run optional data-generation scripts without first checking their documented dependencies, input files, and output paths.

## Repository structure

The project is organized around separate application services. The outline below is representative; update it to match the exact paths and files in the submitted repository.

```text
mboni/
├── web/                    # Next.js web application
├── api/                    # Node.js / TypeScript API
├── model/                  # Python analytical/model service
├── docker-compose.yml      # Local development services
├── package.json            # Root development scripts
├── pnpm-lock.yaml          # Root package lockfile, if present
├── .env.example            # Environment variable template, if present
├── README.md               # Project documentation
├── data/                   # Include only if this directory exists
├── docs/                   # Additional documentation, if present
└── demo/                   # Screen recording, if present
```

Only paths that exist in the public repository should be presented as actual project files. Remove illustrative entries that do not exist.

## Reproducibility and data files

The NISR preparatory webinar asks teams to include the code needed to run their solution and either the data files used or links and instructions for obtaining data that is too large to include.

For this submission:

- Include the scripts and configuration required to run the project.
- Include permitted data files used by the application, where practical.
- For large datasets, provide the original source link and clear retrieval instructions.
- Document preprocessing scripts and expected input/output paths.
- State whether a dataset is downloaded manually, generated from a source, or retrieved by the application.
- Do not include restricted microdata, personal information, credentials, or secrets.
- Make sure reviewers can understand which data is required and how to obtain it.

For each important analysis, document the dataset, reference period, relevant variables, transformations, and method. Where a result depends on a model, document the model and evaluation approach. Where an analysis cannot be reproduced without restricted data, state the access requirement and provide the public documentation link.

## Demonstration video

The NISR preparatory webinar requests a screen recording demonstrating the user interface and functionality. The recording should not exceed **3 minutes**. It should be a screen recording of the application, not a mobile-phone recording of a desktop screen.

**Video file:** Add the actual path to the recording, for example `demo/mboni-demo.webm` or `demo/mboni-demo.gif`.

### Suggested three-minute demonstration

| Approximate time | What to show                                                                |
| ---------------- | --------------------------------------------------------------------------- |
| 0:00-0:20        | Introduce Mboni and the problem it addresses                                |
| 0:20-0:45        | Show the main interface and enter a question supported by the deployed data |
| 0:45-1:30        | Show the analytical result, indicators, charts, and explanation             |
| 1:30-2:10        | Inspect a table, comparison, filter, or other implemented interaction       |
| 2:10-2:40        | Show source details, data context, or limitations                           |
| 2:40-3:00        | Summarize the project's value and intended users                            |

Keep the recording focused on working functionality. Do not demonstrate planned features as though they are implemented.

## Limitations and scope

Mboni is a data-driven application, so its ability to answer a question is limited by the datasets, variables, geographic detail, reference periods, and methods actually available.

Users should be aware that:

- Not every public dataset is integrated into the application.
- Not every indicator is available for every year or geographic area.
- Different datasets may use different definitions, collection methods, and reference periods.
- Historical trends do not guarantee future outcomes.
- A statistical association does not establish causation.
- Model outputs depend on their input data, assumptions, and evaluation.
- An AI-generated explanation can be incomplete or mistaken and should be checked against displayed evidence and source documentation.
- Mboni is not a substitute for official NISR publications, professional statistical advice, market research, or expert policy analysis.

### Current implementation versus future possibilities

Only features that work in the submitted deployment should be treated as implemented. Capabilities such as voice input, audio responses, advanced conversational memory, broad coverage of every statistical domain, and automated forecasting must not be assumed to exist unless they are demonstrably available in the submitted application.

If a capability is not implemented, describe it as a future possibility rather than a current feature.

## Relevance to the NISR Big Data Hackathon

The NISR Big Data Hackathon aims to raise awareness of data science for official statistics, foster evidence-based policymaking through innovative tools, enhance the use of national data in public and private decision-making, identify emerging data-science talent in Rwanda, and build data-science capacity across academic institutions.

Mboni's objective is aligned with this broader purpose: make credible statistical evidence easier to explore and communicate so that more people can use it when investigating real questions.

### Connection to the judging criteria

The NISR preparatory webinar identifies five judging areas. This table explains how Mboni is intended to address them. Reviewers should assess the actual implementation, data, and results in the repository and deployed application.

| Judging criterion                 | How Mboni addresses it                                                                                                | Evidence reviewers should inspect                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Problem Understanding & Relevance | Focuses on the difficulty of discovering, interpreting, and comparing statistical evidence for decisions              | Problem statement, selected use cases, and connection to Rwanda's development context                    |
| Data Use & Methodology            | Prioritizes NISR data and documents sources, preparation, analytical methods, and limitations                         | Dataset inventory, source links, preprocessing code, analytical implementation, and result context       |
| Tech Innovation                   | Combines a question-led experience with structured analytical outputs and a multi-service application                 | Working application, architecture, analytical workflow, and validated presentation layer                 |
| Usability & Design                | Presents analytical results through indicators, visualizations, tables, and explanations                              | Deployed interface, demonstration video, interaction flow, and accessibility of information              |
| Tangible Impact                   | Aims to help citizens, students, researchers, entrepreneurs, and decision-makers investigate evidence-based questions | Realistic use cases, supported analyses, and clear explanation of what evidence can and cannot establish |

### Connection to national priorities

The webinar asks participants to consider alignment with national priorities, including NST2 and Vision 2050. Mboni's potential relevance depends on the datasets and analyses in the submission. Employment, education, agriculture, poverty, population, and economic indicators can provide evidence relevant to development questions when the data supports the analysis.

Do not claim that Mboni directly measures the impact of a national policy or proves that a policy caused an observed change unless the analysis has been designed to support that conclusion.

## Team and contributions

**Team name:** Igisubizo

| Team member       | Contribution                                              | GitHub                                         |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Aimable Ukobizaba | Full-stack application development and system integration | [@AimableUK](https://github.com/AimableUK)     |
| Humureenock       | Analytical/model development and related project work     | [@EnockHumure](https://github.com/EnockHumure) |

Update the contribution descriptions and profile links if the final division of work or account URLs differ. Contributions should accurately reflect the work completed by each team member.

## Acknowledgements and references

We acknowledge the National Institute of Statistics of Rwanda and other public data providers for making statistical resources and documentation available. Original data providers remain the authoritative sources for their published statistics.

### Primary references

- [National Institute of Statistics of Rwanda](https://www.statistics.gov.rw/)
- [NISR Microdata Catalog](https://microdata.statistics.gov.rw/index.php/catalog)
- [Rwanda Data Sharing Platform](https://data.gov.rw/datasets)
- [NISR PxWeb](https://pxweb.statistics.gov.rw/pxweb/en/)
- [NISR 2026 Big Data Hackathon](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition)

### NISR contact information from the preparatory webinar

- Website: [www.statistics.gov.rw](https://www.statistics.gov.rw/)
- Email: [info@statistics.gov.rw](mailto:info@statistics.gov.rw)
- Telephone: +250 788 383 103

These institutional contact details are reproduced from the NISR preparatory webinar. Consult the official NISR website for current contact information.

## Declaration of originality and AI assistance

### Originality and acknowledgement

This project is submitted by Team Igisubizo for the 2026 NISR Big Data Hackathon. The team is responsible for the submitted implementation, analysis, documentation, and claims. All external datasets, libraries, tools, and reference materials used in the project should be acknowledged in the relevant sections of the repository.

The team must ensure that the final submission complies with the competition's rules on originality, attribution, and intellectual property. The NISR preparatory webinar states that participants agree to assign and transfer intellectual property rights in submitted work to NISR, which reserves the right to use, reproduce, modify, publish, and distribute that work.

### AI assistance disclosure

AI tools may be used as assistants, but the team remains responsible for the submitted work and must disclose AI assistance in accordance with the competition rules.

**Suggested disclosure - edit this to match the tools actually used:**

> AI tools were used to assist with selected aspects of project planning, software development, documentation, and analytical-method exploration. The team reviewed the resulting work and remains responsible for the implementation, data sources, analytical methods, validation, and findings presented in this submission.

Do not retain any part of this statement that does not accurately describe the team's actual use of AI tools. The disclosure must be truthful and reflect the work performed.

---

<p align="center">
  <strong>Mboni</strong><br />
  Explore Rwanda's data. Understand what is changing. Make better-informed decisions.<br />
  <strong>Team Igisubizo | NISR Big Data Hackathon 2026</strong>
</p>
