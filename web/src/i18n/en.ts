/**
 * English dictionary. This file defines the shape every language must follow:
 * `rw.ts` is typed as `Dict`, so TypeScript errors if a key is missing.
 *
 * Inline markup supported inside any string rendered through <RichText>:
 *   **bold**   `code`   [label](/internal-or-https-link)
 */

export interface Block {
  id?: string;
  h?: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  /** Question and answer pairs, rendered as native <details> accordions. */
  qa?: [string, string][];
}

export interface DocPage {
  metaTitle: string;
  title: string;
  intro: string;
  updated?: string;
  notice?: string;
  sections: Block[];
}

export interface DocsPage extends DocPage {
  ctaTitle: string;
  ctaBody: string;
}

export interface Example {
  /** What the visitor sees (translated). */
  label: string;
  /** What is sent to the analysis engine. Keep this in the language the engine understands. */
  q: string;
}

export const en = {
  common: {
    brand: "Mboni",
    brandHome: "Mboni home",
    language: "Language",
    startChatting: "Start chatting",
    exploreData: "Explore data",
    readDocs: "Read the documentation",
    demoBadge: "NISR data",
    onThisPage: "On this page",
    lastUpdated: "Last updated",
    nisrBuilt: "Built for the 2026 NISR Big Data Hackathon",
    nisrFull: "National Institute of Statistics of Rwanda",
  },

  footer: {
    tagline:
      "Ask questions about Rwanda’s statistics and get charts, tables and maps you can check.",
    rights: "© 2026 Mboni",
    groups: [
      {
        title: "Product",
        links: [
          { href: "/docs", label: "Documentation" },
          { href: "/methodology", label: "Methodology" },
          { href: "/ai-transparency", label: "AI transparency" },
        ],
      },
      {
        title: "Company",
        links: [
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { href: "/privacy", label: "Privacy policy" },
          { href: "/terms", label: "Terms of service" },
          { href: "/accessibility", label: "Accessibility" },
        ],
      },
    ],
  },

  home: {
    metaTitle: "Ask questions about Rwanda’s statistics",
    hero: {
      title: "Ask questions about Rwanda’s statistics",
      lead: "Choosing a career, starting a business, or looking for lessons in Rwanda’s past? Ask in plain words. Mboni shows what the statistics say, with sources you can check.",
      primary: "Start chatting",
      secondary: "Explore data",
      sceneLabel:
        "Illustration of Rwanda’s green hills, volcanoes and bamboo at sunrise",
    },
    paths: {
      title: "What you can use it for",
      lead: "Pick the situation closest to yours. Each one opens a workspace with charts, tables and maps.",
      tryLabel: "Try this question",
      items: [
        {
          key: "career",
          title: "Choose a career or a course of study",
          body: "Compare study programmes using enrolment, graduate employment and wage indicators, then see which skills point to which kinds of work.",
          hint: "It shows evidence and trade-offs. It never promises a job and never decides for you.",
          examples: [
            {
              label:
                "Which study programmes lead to jobs for applied mathematics graduates?",
              q: "Which study programme is best for an applied mathematics graduate?",
            },
            {
              label: "How has employment changed by sector over the years?",
              q: "Show employment trends by sector",
            },
            {
              label: "Where is youth unemployment highest?",
              q: "Which districts have the highest youth NEET rate?",
            },
          ] as Example[],
        },
        {
          key: "business",
          title: "Start or grow a business",
          body: "See how many businesses operate in each sector and district, how the local economy is changing, and what the population and household picture looks like.",
          hint: "Counts alone do not prove a location will work. Check demand and costs too.",
          examples: [
            {
              label: "Show businesses by sector and district",
              q: "Show establishments by sector and district",
            },
            {
              label: "Which districts have the highest poverty?",
              q: "Which districts have the highest poverty rate?",
            },
          ] as Example[],
        },
        {
          key: "farming",
          title: "Plan around farming and food",
          body: "Compare crop yields across districts and seasons, with food-security indicators beside them.",
          hint: "Past yields show patterns, not what will happen in your field.",
          examples: [
            {
              label: "Which crops have the highest yield by district?",
              q: "Which crops have the highest yield by district?",
            },
          ] as Example[],
        },
        {
          key: "past",
          title: "Learn from Rwanda’s past",
          body: "Follow any indicator over the years, compare districts side by side, and see where the data has gaps.",
          hint: "Two things rising together is not proof that one caused the other.",
          examples: [
            {
              label: "Show how the population has grown over the years",
              q: "Show population trend over the years",
            },
            {
              label: "Compare districts on underemployment",
              q: "Compare districts on underemployment",
            },
          ] as Example[],
        },
      ],
    },
    ask: {
      title: "Or ask your own question",
      label: "Your question",
      placeholder:
        "For example: Which districts have the highest youth unemployment?",
      button: "Ask",
    },
    how: {
      title: "From question to workspace",
      lead: "No queries and no spreadsheets. Four steps.",
      steps: [
        {
          t: "Ask",
          d: "Type your question in plain words, or use your voice if you prefer.",
        },
        {
          t: "Calculate",
          d: "Statistical code works out the numbers. The AI never makes up statistics.",
        },
        {
          t: "See",
          d: "You get charts, tables, maps and a short explanation on one screen.",
        },
        {
          t: "Check and keep",
          d: "Open the sources and caveats, rearrange the layout, and save the analysis to reopen later.",
        },
      ],
    },
    data: {
      title: "Explore the data behind the answers",
      lead: "Mboni is organised around the main areas of Rwanda’s development statistics.",
      topics: [
        {
          t: "Labour and jobs",
          d: "Employment, unemployment and underemployment, by age, sex and district.",
        },
        {
          t: "Education and skills",
          d: "Participation, completion, exams, and vocational training.",
        },
        {
          t: "Agriculture and food",
          d: "Crop production and yield, inputs, and food security.",
        },
        {
          t: "Poverty and households",
          d: "Household welfare and living conditions across areas.",
        },
        {
          t: "Financial inclusion",
          d: "Access to financial services and how people use them.",
        },
        {
          t: "Health and population",
          d: "Population structure and population-level health indicators.",
        },
        {
          t: "Business activity",
          d: "Establishments by sector and place, and how they change.",
        },
        {
          t: "Access to services",
          d: "Electricity, water, sanitation and connectivity, where measured.",
        },
      ],
      mapTitle: "30 districts, one map",
      mapLead:
        "Every geographic question is drawn on this district grid, grouped here by province. Coverage differs between datasets, so some districts may be missing from a result.",
      mapLabel: "Rwanda districts grouped by province",
    },
    trust: {
      title: "Numbers you can check",
      items: [
        {
          t: "Every number has a trail",
          d: "Values come only from the analytical result. Sources, method and caveats sit beside every workspace.",
        },
        {
          t: "Yours to rearrange",
          d: "Resize, reorder, switch chart types and save versions. The underlying result never changes when you do.",
        },
        {
          t: "Built for everyone",
          d: "Keyboard navigation, screen-reader summaries, a data table for every chart, high contrast, and voice that is always optional.",
        },
      ],
      links:
        "Read the [documentation](/docs) or the [methodology](/methodology).",
    },
    cta: {
      title: "Start with one question",
      lead: "Ask about a career, a business idea, a crop or a district, and see what Rwanda’s statistics say.",
    },
  },

  contact: {
    metaTitle: "Contact",
    title: "Contact us",
    lead: "Questions, corrections, data requests or accessibility problems. We read everything.",
    name: "Name",
    email: "Email",
    message: "Message",
    placeholder: "How can we help?",
    send: "Send message",
    minHint: "Write at least 10 characters to send.",
    sentTitle: "Message sent",
    sentBody: "Thank you. We will reply to the address you gave.",
    failed: "Your message could not be sent.",
    namePlaceholder: "Enter your full name",
    emailPlaceholder: "Enter your email address",
  },

  voice: {
    unsupported:
      "Voice input is not supported in this browser. Type your question instead.",
    start: "Ask by voice",
    stop: "Stop voice input",
    listening: "Listening… your words appear in the question box.",
    blocked: "Microphone access was blocked. You can still type your question.",
    stopped: "Voice input stopped. You can type your question instead.",
  },

  about: {
    metaTitle: "About",
    title: "About Mboni",
    intro:
      "Mboni (Kinyarwanda for “analysis”) helps people understand Rwanda’s public statistics and use them in real decisions about careers, business, farming and community planning.",
    sections: [
      {
        h: "Why we built it",
        p: [
          "Official statistics are most useful when people can explore them without writing queries or waiting for a report. A chatbot answers with a paragraph. A static dashboard answers one question. Mboni builds an interactive workspace for the question you actually asked, then saves it.",
          "The goal is not to decide for you. It is to show what the available evidence says, compare options, explain the trade-offs and point to the questions that deserve a closer look.",
        ],
      },
      {
        h: "Who it helps",
        ul: [
          "**Students and school leavers** exploring study and career pathways.",
          "**Job seekers and career changers** looking at employment conditions and skills.",
          "**Entrepreneurs and small-business owners** exploring local economic activity before they plan.",
          "**Farmers and cooperatives** comparing production patterns and risks.",
          "**Households and community organisations** trying to understand poverty and access to services.",
          "**Researchers, teachers and journalists** exploring public data and explaining it clearly.",
          "**Development partners and public teams** comparing local conditions and planning needs.",
        ],
      },
      {
        h: "What makes it different",
        ul: [
          "**Results and presentation are separate.** The analysis engine computes the results. A planner only describes how to show them. Changing a chart type or layout never changes a number.",
          "**No generated code runs.** The AI proposes a structured specification. The product validates it and draws it with its own components.",
          "**Work is kept.** Every analysis is saved with its layout, sources and version history.",
          "**Accessible by design.** Keyboard use, screen-reader summaries, data tables, high contrast and optional voice, with typed input always available.",
        ],
      },
      {
        h: "Principles we hold ourselves to",
        ul: [
          "Never invent datasets, statistics, citations or confidence levels.",
          "Show the source, period, coverage, units and definitions where known.",
          "Say plainly when data is missing, old, too small or not comparable.",
          "Keep observed values, calculations and forecasts clearly apart.",
          "Report associations, not causes, unless a study design supports it.",
          "Respect privacy: never help identify people from granular data.",
        ],
      },
      {
        h: "Where it stands",
        p: [
          "This build was created for the 2026 NISR Big Data Hackathon, using NISR data and other public datasets. It is an independent project and not an official NISR service.",
          "The benefits described on this site are intended benefits, not measured impact. Any claim that Mboni improved employment, raised yields or changed policy would need a proper evaluation.",
          "Read the [documentation](/docs), the [methodology](/methodology) and [AI transparency](/ai-transparency), or [get in touch](/contact).",
        ],
      },
    ],
  } as DocPage,

  docs: {
    metaTitle: "Documentation",
    title: "Documentation",
    intro:
      "What Mboni is, how to use it for career guidance, starting a business, farming and learning from Rwanda’s data, and how it works underneath.",
    updated: "October 2026",
    ctaTitle: "Ready to try it?",
    ctaBody: "Ask your first question and open the workspace.",
    sections: [
      {
        id: "overview",
        h: "What Mboni is",
        p: [
          "Mboni (Kinyarwanda for “analysis”) is an analysis and decision-support tool for Rwanda’s public statistics. You ask a question in plain words. Mboni finds the matching data, calculates the result with statistical code, and shows it as a workspace you can inspect: metrics, charts, tables, maps, a short explanation, and the sources and caveats.",
          "It is not a general chatbot and it is not a fixed dashboard. Think of three parts working together. The question box helps you say what you want to understand. The analysis engine finds and calculates the evidence. The presentation layer arranges the findings so you can read and check them. You see both the answer and the evidence behind it.",
          "Mboni is an independent project built by Team Igisubizo for the 2026 NISR Big Data Hackathon. It is not an official NISR service.",
        ],
      },
      {
        id: "problem",
        h: "Why it exists",
        p: [
          "Public statistics are valuable, but using them takes effort. Datasets are published in different places and formats, a question often needs more than one table, and raw tables are hard to read without training. Understanding change over time means comparing years that were measured in compatible ways. Decisions about study, work, business or farming are rarely settled by a single number.",
          "A generic AI answer that is not tied to real data can sound confident and still mislead. Mboni takes the opposite approach: every number comes from a calculation on a named dataset, and the workspace shows you how to check it.",
        ],
      },
      {
        id: "who",
        h: "Who it is for",
        ul: [
          "**Students and school leavers** exploring study and career pathways before they choose a course.",
          "**Job seekers and career changers** looking at employment conditions and skills.",
          "**Entrepreneurs and small-business owners** doing a first round of local research before they plan. It comes before market research and does not replace it.",
          "**Farmers and cooperatives** comparing production patterns across districts and seasons.",
          "**Researchers, teachers and journalists** exploring public data and explaining it clearly.",
          "**Development partners, public teams and investors** who want a first look at Rwanda’s economic and demographic picture. This is an initial exploration, not professional due diligence.",
        ],
      },
      {
        id: "capabilities",
        h: "What you can do today",
        p: [
          "Each of these is explained below. A question Mboni cannot route or answer is declined with an explanation. It is never guessed.",
        ],
        ul: [
          "**Ask in plain words** in English or Kinyarwanda, by typing or by optional voice input.",
          "**Compare study programmes** and map skills to sectors, occupations and places.",
          "**Explore labour and district patterns:** group districts by labour underutilisation, see what is associated with youth NEET rates, and follow sector employment trends with a forecast.",
          "**Ask general dataset questions** across 12 CSV datasets: summarise a topic, compare or rank districts and categories, filter named places and see trends where the years exist. Crop-yield questions use a published NISR table.",
          "**Check the evidence:** sources, caveats and a data table behind every chart.",
          "**Customise and keep your work:** resize and reorder panels, switch chart types, and reopen saved analyses with their versions from History.",
        ],
      },
      {
        id: "start",
        h: "Getting started",
        p: [
          "Mboni lets you ask questions about Rwanda’s statistics in plain words. It answers with a workspace: charts, tables, maps and a short explanation, with the sources beside them.",
          "It is most useful for three kinds of question: choosing a career or course of study, starting or growing a business, and learning from what Rwanda’s data shows about the past.",
        ],
        ol: [
          "Choose [Start chatting](/workspace) and sign in or create an account.",
          "Type a question, or pick one of the examples on the home page.",
          "Read the workspace, open the sources and caveats, and save it if you want to come back.",
        ],
      },
      {
        id: "questions",
        h: "Asking good questions",
        p: [
          "Mboni works best with specific questions that name a topic, a place or a period. Simple words are fine.",
        ],
        ul: [
          "**Too broad:** “Tell me about jobs.” **Better:** “How has employment changed by sector over the years?”",
          "**Too broad:** “Is farming good?” **Better:** “Which crops have the highest yield by district?”",
          "**Too broad:** “Where should I open a shop?” **Better:** “Show establishments by sector and district.”",
        ],
      },
      {
        id: "unclear",
        h: "When a question is not understood",
        p: [
          "Questions are routed by rules, not guessed. If a question is unclear, the workspace says what it understood or asks you to narrow it. Try a shorter question that names one topic and, if you can, one place or period.",
        ],
      },
      {
        id: "career",
        h: "Career and study guidance",
        p: [
          "Use Mboni to look beyond a single headline number. It can compare study programmes using enrolment, graduation, graduate-employment and wage indicators, and map skills such as applied mathematics to sectors, occupations and places.",
          "You can also explore employment and underemployment by age, sex, district and sector, and young people not in education, employment or training, where the data supports it.",
          "**What it will not do:** promise that a career leads to a job, treat advertised vacancies as the whole labour market, or tell you which option is best for you. Rankings show how options compare on the chosen measures. The decision stays yours.",
          "Skills-to-occupation links come only from the datasets Mboni holds. They are not evidence of what any employer requires, and past employment does not predict a future job.",
        ],
      },
      {
        id: "business",
        h: "Starting or growing a business",
        p: [
          "Before you plan a business it helps to understand the local economy. Mboni can show how many establishments operate by sector and district, how that has changed, and what population, poverty and service-access indicators look like nearby.",
          "**What it will not do:** business counts and population alone cannot show that a place is commercially viable. You still need current information on demand, competition, rent, costs, regulation and customers.",
        ],
      },
      {
        id: "agriculture",
        h: "Farming and food security",
        p: [
          "Compare crop yields across districts and seasons, and see food-security indicators next to them.",
          "**What it will not do:** past patterns cannot tell you which crop to plant. Weather, soil, water, prices, input costs, markets and your own experience all matter. Any forecast is labelled an estimate, not a guarantee.",
        ],
      },
      {
        id: "past",
        h: "Learning from Rwanda’s past",
        p: [
          "Many questions are really about change. Ask for an indicator over time to see its trend, compare districts side by side, or see how several indicators move together.",
          "Two indicators that rise together are reported as an association. Mboni does not say that one caused the other. Sector employment forecasts use a linear trend with 95% prediction intervals, tested on years held back from the model.",
          "Compare like with like. Two indicators with similar names can be defined differently, and a single survey year cannot show a trend on its own. Mboni tells you when years are missing or definitions differ.",
        ],
      },
      {
        id: "results",
        h: "Reading a result",
        p: [
          "A workspace is drawn from a validated presentation specification. The renderer only draws component types the specification schema defines.",
        ],
        ul: [
          "**Metrics** give the headline numbers for your question.",
          "**Charts** show trends, distributions or comparisons. Every chart has a text summary and a data table with the exact values.",
          "**Maps** draw districts on a schematic tile map, so every district is large enough to read.",
          "**Explanation** describes the main pattern in plain language.",
          "**Sources and caveats** list where the data came from, what was calculated, and the limits you should keep in mind.",
          "**Data source** names the dataset used, its reporting period and its coverage.",
        ],
      },
      {
        id: "workspace",
        h: "Customising and saving",
        ul: [
          "Resize and reorder panels, with buttons as an alternative to dragging.",
          "Switch chart types. The numbers never change when you do.",
          "Every analysis is saved with its layout and versions. Reopen it from History, or delete it there.",
        ],
      },
      {
        id: "access",
        h: "Language, voice and accessibility",
        p: [
          "Switch between English and Kinyarwanda with the language button. The display menu has theme, text size, contrast and reduced motion.",
          "Voice input is optional. Browser speech recognition may not recognise Kinyarwanda, so typing is always available. See the [accessibility statement](/accessibility).",
        ],
      },
      {
        id: "pipeline",
        h: "How a question becomes a workspace",
        p: [
          "The analytical result and the presentation are kept apart. The result is immutable. A layout or chart-type change is saved as a new presentation version and never alters a number.",
        ],
        ol: [
          "**Route.** The question is routed by rules to the right engine: decision and career, general dataset, clustering, regression or forecasting.",
          "**Load.** The Python analysis service loads the prepared datasets built from NISR and other public sources.",
          "**Calculate.** Statistical and decision-rule code computes the result. The result names its sources, the operations performed and its caveats.",
          "**Plan the layout.** A planner turns the result into a `PresentationSpec`: which metrics, charts, tables, maps and insights to show, and where.",
          "**Validate and draw.** The specification is validated against its schema and against the real result, then drawn with Mboni’s own components.",
          "**Save.** The question, result, sources, specification and versions are saved as one artifact that reopens unchanged.",
        ],
      },
      {
        id: "engines",
        h: "The analysis engines",
        p: [
          "The full method, with data sources and limits, is on the [methodology](/methodology) page.",
        ],
        ul: [
          "**Career and study decisions.** Compares named study programmes using enrolment, graduation, graduate-employment and wage indicators, and maps skills such as applied mathematics to potential sectors, occupations and places. It shows how options compare. It is not evidence of what any employer requires, and it never makes the final decision.",
          "**General dataset questions.** Matches supported measures in 12 CSV datasets. It can summarise a topic, compare or rank districts and categories, filter named places and show historical trends when the requested years are available.",
          "**District labour underutilisation (clustering).** K-means with k=3 on normalised features: underemployment, unemployment, youth NEET, agriculture share, formal employment share and secondary-plus education share. It produces district clusters and profiles.",
          "**Youth NEET predictors (regression).** Panel OLS on district-by-year observations with year fixed effects, ridge stabilisation and leave-one-district-out cross-validation. It reports coefficients, R² and adjusted R², Q² and RMSE, and feature importance. Coefficients show association, not cause, and the sample is small.",
          "**Sector employment trends and forecast.** A linear trend per sector with 95% prediction intervals, tested on years held back from the model.",
        ],
      },
      {
        id: "planner",
        h: "How the layout is chosen",
        p: [
          "A planner turns a finished result into a presentation specification (`PresentationSpec`), a structured description of what to show and where. The planner reads the shape of the result. It cannot calculate or change a statistic.",
        ],
        ul: [
          "**Rule-based planner (always available).** A deterministic planner that picks components from the structure of the result. The same result gives the same layout.",
          "**Optional AI planner.** When enabled, a language model may propose the specification instead. It receives only the structure of the result (dataset and column names, available components), never your account details.",
          "**Validation.** An AI proposal must pass the `PresentationSpec` schema and be checked against the actual result. If it references something that does not exist, or fails validation, it is rejected and the rule-based planner is used.",
          "**Not a dependency.** Mboni works without the AI planner. No generated code runs. The AI is never the source of a number. See [AI transparency](/ai-transparency).",
        ],
      },
      {
        id: "architecture",
        h: "Architecture",
        p: [
          "In production the API always calls the separate analysis service, and its in-process fallback is turned off.",
        ],
        ul: [
          "**Web app:** Next.js and TypeScript. The question box, workspace, History, settings and this documentation.",
          "**API service:** Node.js and TypeScript with Express. It routes questions to the analysis service.",
          "**Analysis service:** Python with FastAPI, in `model/`. It loads the prepared datasets and runs the statistical code.",
          "**PostgreSQL and Redis** run alongside the services in the Docker Compose stack.",
          "**Tooling:** pnpm and Docker Compose.",
        ],
      },
      {
        id: "reliability",
        h: "Reliability and safeguards",
        ul: [
          "**Unsupported or unclear questions** are declined, with what Mboni understood. They are not guessed.",
          "**Missing observations** are left out of calculations, never treated as zero.",
          "**AI planner unavailable or invalid:** the rule-based planner takes over.",
          "**Results are immutable** and saved with sources, operations, caveats and versions, so a workspace can be checked later.",
          "**Models report associations,** and forecasts are labelled estimates with prediction intervals tested on held-back years.",
        ],
      },
      {
        id: "data",
        h: "Data coverage and status",
        p: [
          "Mboni is built on datasets from NISR and other public sources. Useful starting points: [NISR website](https://www.statistics.gov.rw/), [NISR Microdata Catalog](https://microdatabk.statistics.gov.rw/catalog/), [Rwanda Data Sharing Platform](https://data.gov.rw/datasets), [NISR PxWeb database](https://pxweb.statistics.gov.rw/pxweb/en/) and the [2026 NISR Big Data Hackathon](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition).",
          "Every result names the dataset it used, with its reporting period, units and definitions where known. Check the definitions before comparing two datasets.",
          "Rwanda has 30 districts in five provinces, but not every dataset covers all of them. Coverage varies by source, year and indicator.",
        ],
      },
      {
        id: "knownlimits",
        h: "Known limits of the current data and methods",
        ul: [
          "Coverage varies by source, year and indicator, so a result may not include every district.",
          "The NISR crop-yield table includes Season A and B observations but does not state a reference year.",
          "The NEET regression uses a small number of observations and shows association only.",
          "The sector forecast is a linear trend. It assumes the recent pattern continues and cannot anticipate policy changes, new technology or shocks.",
          "Question routing is rule-based, so short, specific questions work best.",
          "The district map is a schematic tile map, not a geographic one.",
          "Browser speech recognition may not recognise Kinyarwanda.",
          "The benefits described here are intended benefits. No user numbers or measured impact are claimed.",
        ],
      },
      {
        id: "limits",
        h: "What Mboni does not do",
        ul: [
          "It does not replace professional advice, official statistics or field research.",
          "It does not infer one person’s income, eligibility or circumstances from group statistics.",
          "It does not rank communities by worth or decide where funding should go.",
          "It is not a medical service and gives no individual health advice.",
          "It does not claim that a programme caused an outcome unless the study design supports it.",
        ],
      },
      {
        id: "privacy",
        h: "Privacy and security",
        p: [
          "Your questions, results and layouts are saved with your account so you can reopen them, and you can delete any analysis from History. The optional AI planner never receives account details. Read the [privacy policy](/privacy) and the [terms of service](/terms). This page makes no claims about security certifications or legal compliance.",
        ],
      },
      {
        id: "developer",
        h: "For developers",
        p: [
          "The repository runs as a Docker Compose stack of PostgreSQL, Redis, the Python analysis service, the API and the web app. The root scripts wrap Docker Compose. They do not start individual services outside Docker.",
        ],
        ul: [
          "`pnpm run dev` starts the full stack from `docker-compose.yml`.",
          "`pnpm run dev:build` rebuilds the images and starts the stack.",
          "`pnpm run dev:logs` follows the logs of all services.",
          "`pnpm run dev:down` stops the stack.",
        ],
      },
      {
        id: "hackathon",
        h: "The 2026 NISR Big Data Hackathon",
        p: [
          "Mboni was built for the [2026 NISR Big Data Hackathon](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition). It addresses one problem: making Rwanda’s public statistics easier to explore, understand and check. It does not claim to address every track equally.",
        ],
        ul: [
          "**Problem understanding and relevance:** public statistics are hard to find, combine and interpret, and decisions on study, work, business and farming need more than one number.",
          "**Data use and methodology:** NISR and other public datasets, with K-means, panel OLS, linear trends and weighted decision rules, and sources named on every result.",
          "**Technical innovation:** results and presentation are separate, an AI-proposed layout is validated against the real result, and a rule-based planner is the fallback.",
          "**Usability and design:** a workspace you can rearrange, a data table behind every chart, English and Kinyarwanda, keyboard use and an accessibility statement. See [accessibility](/accessibility).",
          "**Tangible impact:** the intended impact is more evidence-informed decisions. It has not been measured.",
        ],
      },
      {
        id: "team",
        h: "Team",
        p: [
          "Team Igisubizo: [Aimable Ukobizaba](https://github.com/aimableuk) and [EnockHumure](https://github.com/EnockHumure).",
        ],
      },
      {
        id: "faq",
        h: "Frequently asked questions",
        qa: [
          [
            "Is this an official NISR service?",
            "No. Mboni is an independent project built for the 2026 NISR Big Data Hackathon using NISR data and other public datasets. It is not run by NISR.",
          ],
          [
            "Are the numbers real?",
            "Yes. They are computed from NISR and other public datasets, not invented. Each result lists its source, period and coverage so you can check it against the original. See the [methodology](/methodology).",
          ],
          [
            "Can I rely on a result for a real decision?",
            "Use results as evidence and context, not as your only input. Check the source, period and caveats, and add current local information before you decide.",
          ],
          [
            "Does the AI make up numbers?",
            "No. Statistical code computes every number. The optional AI only proposes how a workspace is laid out, and its proposal is validated against the real result. See [AI transparency](/ai-transparency).",
          ],
          [
            "Can I use it in Kinyarwanda?",
            "The whole interface is available in Kinyarwanda. Questions are routed by rules, so short, specific wording works best, and you are told if a question is not understood.",
          ],
          [
            "How do I delete my data?",
            "Delete any analysis from History. To remove your account, ask through the [contact page](/contact).",
          ],
          [
            "Can Mboni tell me which business to start or which career to choose?",
            "No. It shows what the available evidence says and how options compare, and where the evidence stops. Choosing is up to you, together with current local information.",
          ],
          [
            "Is a forecast a promise?",
            "No. A forecast is an estimate from a linear trend, shown with a 95% prediction interval and tested on years held back from the model. It cannot know about policy changes, new technology or unexpected events.",
          ],
        ],
      },
    ],
  } as DocsPage,

  methodology: {
    metaTitle: "Methodology",
    title: "Methodology and data sources",
    intro:
      "How Mboni routes questions through statistical analysis code and reports which dataset each result comes from.",
    sections: [
      {
        h: "From question to result",
        ol: [
          "The natural-language question is routed to the right engine (decision and career, clustering, regression, or forecasting).",
          "The Python analysis service loads the prepared datasets built from NISR and other public sources.",
          "Statistical and decision-rule code computes a result. Each result identifies its source.",
          "A deterministic rule-based planner maps the result to a `PresentationSpec` (charts, tables, maps, metrics, insights). The layout never changes the numbers.",
          "Everything is saved as an artifact (question, result, sources, spec, versions) and can be reopened unchanged.",
        ],
      },
      {
        h: "Engines",
        ul: [
          "**Career and study decisions.** Compares named study programmes with enrolment, graduation, graduate-employment and wage indicators, and maps skills such as applied mathematics to potential sectors, occupations and locations. Results show how options compare on the available indicators. They are not evidence of what any employer requires.",
          "**General dataset questions.** Matches supported measures in 12 CSV datasets and can summarise a topic, compare or rank districts and categories, filter named locations, and show historical trends when the requested years are available. Crop-yield questions use a published NISR table.",
          "**Problem A: district labour underutilisation (clustering).** K-means (k=3) on normalised features: underemployment, unemployment, youth NEET, agriculture share, formal employment share and secondary-plus education share. Produces district clusters and profiles.",
          "**Problem B: youth NEET predictors (regression).** Panel OLS on district-by-year observations with year fixed effects, ridge stabilisation and leave-one-district-out cross-validation. Reports coefficients, R² and adjusted R², Q² and RMSE, and feature importance. Coefficients show association, not causation, and n is small.",
          "**Problem C: sector employment trends and forecast.** Linear trend per sector with 95% prediction intervals, backtested on held-out years.",
          "**Decision and career.** Makes weighted comparisons across the available indicators. The system ranks options and never makes the final decision.",
        ],
      },
      {
        h: "Data sources",
        p: [
          "The datasets come from these portals: [NISR website](https://www.statistics.gov.rw/), [NISR Microdata Catalog](https://microdatabk.statistics.gov.rw/catalog/), [Rwanda Data Sharing Platform](https://data.gov.rw/datasets) and [NISR PxWeb database](https://pxweb.statistics.gov.rw/pxweb/en/). Each result names the exact dataset it used.",
          "Crop-yield results use NISR’s public [district and crop yield table](https://pxweb.statistics.gov.rw/pxweb/en/NISR%20Statistical%20Databases/Agriculture/Crop%20area,%20production%20and%20yield%20for%20major%20crops/yield.px). It includes Season A and B observations but does not state a reference year. See `model/README.md` for details.",
        ],
      },
      {
        h: "Limits and principles",
        ul: [
          "**Missing data:** missing observations are left out rather than treated as zero. The NISR crop-yield table does not state a reference year.",
          "**Transparency:** every result lists sources, operations, caveats and versions.",
          "**Separation of concerns:** models compute numbers. The language model, if used, only plans layout and explains. It never generates statistics.",
          "**Reproducibility:** analytical results are immutable. Presentation changes are versioned separately.",
          "**Coverage:** Rwanda has 30 districts, but coverage varies by source, year and indicator, so a result may not include every district.",
        ],
      },
    ],
  } as DocPage,

  ai: {
    metaTitle: "AI transparency",
    title: "AI transparency",
    intro:
      "What the analysis code computes, where optional AI is used, and where the data comes from.",
    sections: [
      {
        h: "What the automated system does",
        p: [
          "The Python service uses rule-based question routing and statistical code: K-means, panel OLS, linear trends and weighted decision rules. It is not a trained neural network or chatbot. The optional AI planner may propose a *presentation specification*: which components to show and how to arrange them. It does not calculate the statistics.",
        ],
      },
      {
        h: "Where the data comes from",
        p: [
          "Analysis inputs come from NISR and other public datasets. Mboni computes results from them and shows each source, so you can check a figure against the original. Results are Mboni’s own calculations and are not official NISR publications.",
        ],
      },
      {
        h: "What the system does not do",
        ul: [
          "**The optional planner does not calculate.** Statistical operations run in the Python analysis service. The planner only proposes layouts.",
          "**Not an official NISR product.** Results are calculated by Mboni from public data and are not published by NISR.",
          "**No causation claims.** Models report associations, for example NEET predictors. The interface shows limitations and does not present correlation as causation.",
          "**No final decisions.** For crop and career choices, the system ranks options with evidence and never picks a single “best” option for you.",
          "**Strictly validated output.** Any AI-proposed layout must validate against the `PresentationSpec` schema and against the actual result. Unsupported references are rejected and replaced by a deterministic rule-based planner.",
        ],
      },
      {
        h: "How you can verify",
        ul: [
          "**Sources and caveats:** each workspace lists data sources, operations performed, limitations, and analysis and planner versions.",
          "**Traceable:** the analytical result is immutable. Presentation changes are versioned separately.",
          "**Inspectable:** charts include data tables. You can rearrange layouts in the workspace.",
          "**Explainable routing:** the system explains what it understood. Ambiguous requests are declined rather than guessed.",
        ],
      },
      {
        h: "Architecture notes",
        p: [
          "The analysis service runs separately (`model/`, FastAPI). The Express API routes questions to it, and production disables its in-process fallback. Sources and data limitations appear in the workspace provenance panel.",
        ],
      },
    ],
  } as DocPage,

  accessibility: {
    metaTitle: "Accessibility",
    title: "Accessibility statement",
    intro:
      "Mboni is designed so that people with different abilities can use every part of it.",
    updated: "October 2026",
    sections: [
      {
        h: "What we build in",
        ul: [
          "**Keyboard:** everything works without a mouse, with a visible focus ring and a skip link. Resizing and reordering have button alternatives to dragging.",
          "**Screen readers:** semantic headings and landmarks, labelled controls, a text summary for every chart and an accessible data table behind every chart and map.",
          "**Vision:** day and night themes, a high-contrast mode, text sizes up to 130%, and charts that never rely on colour alone.",
          "**Hearing:** nothing requires sound. Voice transcripts are visible, and read-aloud shows the same text on screen. Notifications are visual.",
          "**Motion:** animations respect your system setting, and there is a reduce-motion switch in the display menu.",
          "**Voice is optional:** typed input is always available.",
          "**Language:** the interface is available in English and Kinyarwanda.",
        ],
      },
      {
        h: "Known limits",
        p: [
          "The district map is a schematic tile map rather than a geographic one, so that every district is large enough to read and operate. Browser speech recognition is not available in all browsers and may not recognise Kinyarwanda.",
        ],
      },
      {
        h: "Tell us about a barrier",
        p: [
          "If something does not work for you, [contact us](/contact) and say what you were trying to do and what assistive technology you use. We treat accessibility problems as bugs.",
        ],
      },
    ],
  } as DocPage,

  privacy: {
    metaTitle: "Privacy policy",
    title: "Privacy policy",
    intro: "What Mboni collects, why, and the choices you have.",
    updated: "October 2026",
    notice:
      "Template notice for operators: have this text reviewed against Rwanda’s Law No. 058/2021 on the protection of personal data and privacy, and any other law that applies to you, before launch.",
    sections: [
      {
        h: "What we collect",
        ul: [
          "**Account data:** your name, email address and a securely hashed password. If you add one, your profile photo.",
          "**Your work:** the questions you ask, the analytical results, the workspace layouts and the versions you save.",
          "**Contact messages:** what you send through the contact form.",
          "**Technical data:** session cookies, IP address and browser type, used to keep you signed in and protect the service.",
        ],
      },
      {
        h: "How we use it",
        p: [
          "To run your account, produce and save your analyses, send transactional email (confirmations and password resets), answer your messages, and keep the service secure. We do not sell personal data and we do not show advertising.",
        ],
      },
      {
        h: "Voice input",
        p: [
          "Voice input is optional. Speech recognition is performed by your browser’s speech service, which may send audio to that browser vendor. Mboni receives only the text transcript that appears in the question box. You can always type instead.",
        ],
      },
      {
        h: "AI processing",
        p: [
          "If the optional AI planner is enabled, it receives only the structure of an analytical result (dataset and column names, available components) and never your account details. See [AI transparency](/ai-transparency).",
        ],
      },
      {
        h: "Service providers",
        p: [
          "We use providers for email delivery (Brevo), image hosting for profile photos (ImageKit) and hosting. They process data only to provide those services.",
        ],
      },
      {
        h: "Cookies and preferences",
        p: [
          "We use one essential session cookie. Your display preferences (theme, text size, contrast, motion) and your language choice are stored in your browser. We do not use advertising or cross-site tracking cookies.",
        ],
      },
      {
        h: "Retention and your rights",
        p: [
          "You can delete any saved analysis from History. You may ask us to access, correct, export or delete your personal data, or to close your account, through the [contact page](/contact). Expired sessions and verification tokens are removed automatically every day.",
        ],
      },
      {
        h: "Changes",
        p: [
          "If we change this policy in a way that matters, we will say so on this page and update the date above.",
        ],
      },
    ],
  } as DocPage,

  terms: {
    metaTitle: "Terms of service",
    title: "Terms of service",
    intro: "The rules for using Mboni.",
    updated: "October 2026",
    notice:
      "Template notice for operators: have a lawyer review and complete these terms (operator name, governing law, jurisdiction) before launch.",
    sections: [
      {
        h: "Using the service",
        p: [
          "You may use Mboni to explore public data and to create and keep analytical workspaces. You agree to give accurate account information, keep your password secure, and not misuse the service, for example by attempting to break its security, overload it, or submit unlawful content.",
        ],
      },
      {
        h: "Data and accuracy",
        p: [
          "Results are computed from NISR and other public datasets and are not official NISR statistics. They depend on the source, the method shown in each workspace and the caveats listed there. Check them before relying on a figure.",
        ],
      },
      {
        h: "AI-assisted presentation",
        p: [
          "An AI system may suggest how a workspace is laid out. It does not compute the numbers shown. You remain responsible for how you interpret and use results. See [AI transparency](/ai-transparency).",
        ],
      },
      {
        h: "Your content",
        p: [
          "You keep ownership of the questions you ask and the customisations you make. You give us permission to store and display them to you in order to provide the service. Underlying datasets remain subject to their publishers’ licences, shown with each source.",
        ],
      },
      {
        h: "Availability",
        p: [
          "We try to keep the service available but do not promise uninterrupted access. We may change or withdraw features, and will try to give notice when a change affects saved work.",
        ],
      },
      {
        h: "Liability",
        p: [
          "To the extent the law allows, the operators are not liable for losses that result from decisions made using the service. Nothing here limits liability that cannot lawfully be limited.",
        ],
      },
      {
        h: "Ending your account",
        p: [
          "You can stop using the service at any time and ask us to delete your account through the [contact page](/contact). We may suspend accounts that break these terms.",
        ],
      },
    ],
  } as DocPage,

  mboniPrompt: {
    ariaLabel: "Ask Mboni",
    title: "What can Mboni help with?",
    placeholder: "Ask a question about Rwanda's statistics...",
    inputLabel: "Your question for Mboni",
    send: "Send question",
    moreExamples: "More",
    fewerExamples: "Show less",
  },

  auth: {
    panel: {
      title: "Ask questions about Rwanda’s statistics",
      body: "Sign in to keep your analyses, reopen them any time, and check the source behind every number.",
      points: [
        "Choose a career or course of study",
        "Start or grow a business",
        "Learn from Rwanda’s past",
      ],
      sceneLabel:
        "Illustration of Rwanda’s green hills, volcanoes and bamboo at sunrise",
    },
    modes: {
      login: {
        h: "Sign in",
        cta: "Sign in",
        sub: "Welcome back. Pick up where you left off.",
      },
      signup: {
        h: "Create your account",
        cta: "Create account",
        sub: "Save your questions and analyses so you can come back to them.",
      },
      forgot: {
        h: "Reset your password",
        cta: "Send reset link",
        sub: "Enter your email and we will send you a link to choose a new password.",
      },
      reset: {
        h: "Choose a new password",
        cta: "Save new password",
        sub: "Pick a new password of at least 10 characters.",
      },
    },
    fields: {
      name: "Name",
      email: "Email",
      password: "Password",
      newPassword: "New password",
      pwHint: "At least 10 characters.",
      show: "Show password",
      hide: "Hide password",
      phName: "Enter your full name",
      phEmail: "Enter your email address",
      phPassword: "Enter your password",
      phNewPassword: "Choose a password",
    },
    links: {
      forgot: "Forgot your password?",
      newHere: "New here?",
      create: "Create an account",
      already: "Already registered?",
      signIn: "Sign in",
      back: "Back to sign in",
      home: "Back to home",
    },
    done: { title: "Check your email", back: "Back to sign in" },
    messages: {
      confirmEmailFirst:
        "Confirm your email first. We sent you a link when you signed up.",
      badCredentials: "That email and password do not match.",
      createFailed: "We could not create your account.",
      signupDone:
        "Account created. Check your inbox for a link to confirm your email, then sign in.",
      forgotDone: "If that address has an account, a reset link is on its way.",
      missingToken: "This reset link is missing its token. Request a new one.",
      resetExpired: "This reset link has expired. Request a new one.",
      network:
        "We could not reach the server. Check your connection and try again.",
    },
  },
  header: {
    homeLabel: "Mboni home",
    logoAlt: "Mboni logo",
    navMain: "Main",
    navMobile: "Mobile",
    about: "About",
    methodology: "Methodology",
    contact: "Contact",
    signIn: "Sign in",
    createAccount: "Create account",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    goToWorkspace: "Go to workspace",
  },

  admin: {
    title: "Model Training",
    badge: "Admin",
    home: "Home",
    intro:
      "Regenerate the NISR-structure dataset and run model training and evaluation. Requires admin access (first registered user).",
    steps: {
      generate: {
        step: "Step 1",
        title: "Regenerate data",
        desc: "Rebuilds the training dataset following the NISR structure.",
        cta: "Regenerate Data",
        busy: "Generating...",
      },
      evaluate: {
        step: "Step 2",
        title: "Train & evaluate",
        desc: "Trains the models on the current dataset and reports evaluation metrics.",
        cta: "Train & Evaluate",
        busy: "Evaluating...",
      },
    },
    console: "Output",
    empty: "No output yet. Run a step above to see logs here.",
    running: "Running...",
    copy: "Copy",
    copied: "Copied",
    clear: "Clear",
    status: {
      idle: "Idle",
      running: "Running",
      success: "Completed",
      error: "Failed",
    },
    stderr: "STDERR",
    denied: "Access denied. Sign in with the admin account.",
    tip: "Tip: run Step 1 first whenever the data structure changes.",
  },
  app: {
    shell: { skip: "Skip to content" },
    nav: {
      main: "Main navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      collapse: "Hide sidebar",
      expand: "Show sidebar",
      new: "New analysis",
      search: "Search analyses",
      searchPlaceholder: "Search your analyses",
      history: "Analysis history",
      all: "All analyses",
      empty: "No analyses yet. Ask a question to get started.",
      noMatch: "No matches",
      loadError: "Could not load your analyses.",
      retry: "Try again",
    },
    group: {
      today: "Today",
      yesterday: "Yesterday",
      week: "Previous 7 days",
      older: "Older",
    },
    user: { menu: "Account menu", settings: "Settings", signOut: "Sign out" },
    lang: { change: "Change language", en: "English", rw: "Kinyarwanda" },
    q: {
      placeholder: "Ask a question about Rwanda's statistics...",
      voice: "Ask by voice",
      voiceStop: "Stop listening",
      send: "Send question",
      examples: "Example questions",
    },
    ws: {
      title: "What would you like to understand?",
      subtitle:
        "Ask in plain language. You will get a saved workspace you can rearrange and revisit.",
      stage: {
        interpreting: "Reading your question",
        validating: "Checking it against supported analyses",
        computing: "Computing the demo analysis",
        planning: "Designing the workspace",
        saving: "Saving the analysis",
        ready: "Opening your workspace",
      },
      done: "(done)",
      inProgress: "(in progress)",
      building: "Building your workspace",
      blocked: {
        ambiguous: "Your question needs more detail",
        unsupported: "That analysis is not supported yet",
        no_data: "No data found for that question",
        fallback: "We could not answer that",
      },
      tryOne: "Try one of these questions",
      errorTitle: "Something went wrong",
      errorBody: "The analysis could not be completed.",
      tryAgain: "Try again",
    },
    hist: {
      title: "Saved analyses",
      subtitle:
        "Each item is a workspace with its result, sources, layout and versions.",
      searchLabel: "Search saved analyses",
      searchPlaceholder: "Search by title or question",
      loadError: "Could not load history.",
      loading: "Loading your analyses…",
      emptyTitle: "No saved analyses yet",
      emptyBody: "Ask a question and your first workspace will appear here.",
      emptyCta: "Start an analysis",
      noMatch: "Nothing matches “{q}”.",
      open: "Open",
      delete: "Delete {title}",
      contains: "Contains",
      updated: "Updated {date}",
      version: "Version {n} of {total}",
      delTitle: "Delete this analysis?",
      delBody:
        "“{title}” and all {n} of its versions will be removed. This cannot be undone.",
      keep: "Keep it",
      delConfirm: "Delete analysis",
      deleted: "Analysis deleted.",
      deleteFail: "Could not delete the analysis.",
    },
    ctype: {
      bar: "Bar chart",
      line: "Line chart",
      area: "Area chart",
      map: "Map",
      table: "Table",
      metric: "Key figures",
      text: "Insights",
    },
    set: {
      title: "Settings",
      profile: "Profile",
      photoAlt: "Your profile photo",
      changePhoto: "Change photo",
      name: "Name",
      saveName: "Save name",
      signedInAs: "Signed in as {email}",
      photoInvalid: "Choose a PNG, JPG or WebP image under 2 MB.",
      photoUpdated: "Profile photo updated.",
      photoFail: "The photo could not be uploaded.",
      nameUpdated: "Name updated.",
      signOut: "Sign out",
    },
    an: {
      notFound: "We could not find this analysis",
      loadFail: "This analysis could not be loaded",
      notFoundBody: "It may have been deleted, or the link is not correct.",
      loadFailBody: "Check your connection and try again.",
      goHistory: "Go to history",
      opening: "Opening saved analysis…",
    },
    pg: {
      back: "Back to workspace",
      title: "Playground",
      intro:
        "Edit the presentation specification. Only supported component types render, nothing here can run code, and the analytical result stays fixed.",
      tools: "Editor tools",
      undo: "Undo",
      redo: "Redo",
      revert: "Revert to saved",
      reverted: "Reverted to the saved specification.",
      specLabel: "Presentation specification (JSON)",
      valid: "Valid specification",
      problemsOne:
        "{n} problem to fix. The preview shows the last valid version.",
      problemsMany:
        "{n} problems to fix. The preview shows the last valid version.",
      inspector: "Component inspector",
      component: "Component",
      selectComponent: "Select a component",
      compTitle: "Title",
      width: "Width (3–12)",
      height: "Height",
      small: "Small",
      medium: "Medium",
      large: "Large",
      allProps: "All properties (read-only)",
      save: "Save",
      note: "Note (optional)",
      saveVersion: "Save as new version",
      changeFirst: "Make a change to enable saving.",
      savedAs: "Saved as version {n}.",
      saveFail: "Could not save.",
      defaultNote: "Edited in playground",
      preview: "Live preview",
      loading: "Loading playground…",
      loadFail: "Could not load the playground.",
      backHistory: "Back to history",
    },
    // label = what the visitor sees, q = what is sent to the engine (keep in the engine's language)
    examples: [
      {
        label:
          "Compare youth employment across districts over the last five years",
        q: "Compare youth employment across districts over the last five years",
      },
      {
        label: "Which districts have the highest poverty rates?",
        q: "Which districts have the highest poverty rates?",
      },
      {
        label: "Show child vaccination coverage by district",
        q: "Show child vaccination coverage by district",
      },
      {
        label: "How has school dropout changed since 2020?",
        q: "How has school dropout changed since 2020?",
      },
      {
        label:
          "How has Software Engineering enrollment changed from 2021 to 2025?",
        q: "How has Software Engineering enrollment changed from 2021 to 2025?",
      },
      {
        label: "Which sectors hire applied mathematics graduates?",
        q: "Which sectors hire applied mathematics graduates?",
      },
      {
        label: "Compare maize yield across districts",
        q: "Compare maize yield across districts",
      },
      {
        label: "Which sectors have the highest employment share?",
        q: "Which sectors have the highest employment share?",
      },
      {
        label: "Show job vacancies by occupation",
        q: "Show job vacancies by occupation",
      },
      {
        label: "Compare TVET pass rates by trade",
        q: "Compare TVET pass rates by trade",
      },
      {
        label: "Which exam subjects have the highest pass rates?",
        q: "Which exam subjects have the highest pass rates?",
      },
      {
        label: "Compare household electricity access across districts",
        q: "Compare household electricity access across districts",
      },
    ] as Example[],
  },
  a11y: {
    label: "Display and accessibility settings",
    theme: "Theme",
    day: "Day",
    night: "Night",
    system: "System",
    textSize: "Text size",
    contrast: "High contrast",
    motion: "Reduce motion",
  },
};

export type Dict = typeof en;
