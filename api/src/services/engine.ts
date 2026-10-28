import { randomUUID } from "node:crypto";
import {
  AnalyticalResultSchema,
  DISTRICT_TILES,
  DISTRICTS,
  type AnalyticalResult,
} from "@shared";
import { parseIntent } from "./nlu";

/**
 * In-process fallback engine — generates proxy demo values when the Python model service is unavailable.
 */
export const ANALYSIS_VERSION = "engine-2.0.0";
export const DATASET_VERSIONS: Record<string, string> = {
  nisr_lfs: "2024.1",
  nisr_eicv7: "2024.1",
  nisr_dhs: "2025.1",
  nisr_sas: "2024.1",
  nisr_emis: "2024.1",
  nisr_nesa: "2024.1",
  nisr_ec: "2023.1",
  nisr_tvet: "2024.1",
  nisr_hec: "2024.1",
  nisr_lmis: "2024.1",
};

const DATASET_SOURCE_TITLES: Record<string, string> = {
  nisr_lfs: "Rwanda Labour Force Survey (LFS) — NISR",
  nisr_eicv7: "EICV7 Integrated Household Living Conditions Survey — NISR",
  nisr_dhs: "Rwanda Demographic and Health Survey (DHS) — NISR",
  nisr_sas: "Seasonal Agricultural Survey (SAS) — NISR",
  nisr_emis: "Rwanda Education Management Information System (EMIS) — REB",
  nisr_nesa:
    "National Examinations and School Inspection Authority (NESA) — Rwanda",
  nisr_ec: "Rwanda Establishment Census — NISR",
  nisr_tvet: "Rwanda Polytechnic / WDA — TVET Statistics",
  nisr_hec: "Rwanda Higher Education Council (HEC) — University Statistics",
  nisr_lmis: "Rwanda Labour Market Information System (LMIS) / KORA",
};
const LATEST_YEAR = 2024;
const FIRST_YEAR = 2019;

type Indicator = {
  id: string;
  label: string;
  short: string;
  dataset: string;
  min: number;
  max: number;
  match: RegExp;
};
const INDICATORS: Indicator[] = [
  {
    id: "youth_employment_rate",
    label: "Youth employment rate (ages 16–30)",
    short: "youth employment",
    dataset: "nisr_lfs",
    min: 38,
    max: 72,
    match: /youth.*(employ|job|work)|employ.*youth/,
  },
  {
    id: "secondary_enrolment",
    label: "Secondary school net enrolment",
    short: "secondary enrolment",
    dataset: "nisr_emis",
    min: 18,
    max: 75,
    match: /secondary.*(enrol|school)|enrol.*secondary/,
  },
  {
    id: "poverty_headcount",
    label: "Poverty headcount rate",
    short: "poverty rate",
    dataset: "nisr_eicv7",
    min: 5,
    max: 55,
    match: /poverty|poor|headcount/,
  },
  {
    id: "extreme_poverty_headcount",
    label: "Extreme poverty headcount rate",
    short: "extreme poverty",
    dataset: "nisr_eicv7",
    min: 1,
    max: 25,
    match: /extreme.poverty|destitut/,
  },
  {
    id: "access_to_electricity",
    label: "Household access to electricity (%)",
    short: "electricity access",
    dataset: "nisr_eicv7",
    min: 20,
    max: 99,
    match: /electric|power.access|energy.access/,
  },
  {
    id: "access_to_clean_water",
    label: "Household access to clean water (%)",
    short: "clean water access",
    dataset: "nisr_eicv7",
    min: 45,
    max: 99,
    match: /clean.water|water.access|safe.water/,
  },
  {
    id: "skilled_birth_attendance",
    label: "Skilled birth attendance rate (%)",
    short: "skilled birth attendance",
    dataset: "nisr_dhs",
    min: 60,
    max: 99,
    match: /birth.attend|skilled.birth|deliver/,
  },
  {
    id: "stunting_under5",
    label: "Stunting prevalence in children under 5 (%)",
    short: "child stunting",
    dataset: "nisr_dhs",
    min: 8,
    max: 48,
    match: /stunt|malnutrit|child.growth/,
  },
  {
    id: "child_vaccination_full",
    label: "Full child vaccination coverage (%)",
    short: "child vaccination",
    dataset: "nisr_dhs",
    min: 55,
    max: 98,
    match: /vaccin|immuniz/,
  },
  {
    id: "hiv_prevalence",
    label: "HIV prevalence (%)",
    short: "HIV prevalence",
    dataset: "nisr_dhs",
    min: 0.5,
    max: 5.0,
    match: /hiv|aids/,
  },
  {
    id: "crop_production_mt",
    label: "Crop production (metric tonnes)",
    short: "crop production",
    dataset: "nisr_sas",
    min: 2000,
    max: 120000,
    match: /crop.produc|harvest|yield.ton/,
  },
  {
    id: "yield_kg_per_ha",
    label: "Crop yield (kg per hectare)",
    short: "crop yield",
    dataset: "nisr_sas",
    min: 800,
    max: 3500,
    match: /yield|kg.per.ha|productivity.*agri/,
  },
  {
    id: "pct_using_fertilizer",
    label: "Farmers using fertilizer (%)",
    short: "fertilizer use",
    dataset: "nisr_sas",
    min: 15,
    max: 70,
    match: /fertil/,
  },
  {
    id: "pct_irrigated",
    label: "Irrigated cultivated area (%)",
    short: "irrigation",
    dataset: "nisr_sas",
    min: 2,
    max: 35,
    match: /irrig/,
  },
  {
    id: "primary_net_enrolment",
    label: "Primary school net enrolment (%)",
    short: "primary enrolment",
    dataset: "nisr_emis",
    min: 70,
    max: 99,
    match: /primary.*(enrol|school)|enrol.*primary/,
  },
  {
    id: "adult_literacy_rate",
    label: "Adult literacy rate (%)",
    short: "adult literacy",
    dataset: "nisr_emis",
    min: 60,
    max: 99,
    match: /literat|read.*write/,
  },
  {
    id: "school_dropout_rate",
    label: "School dropout rate (%)",
    short: "school dropout",
    dataset: "nisr_emis",
    min: 2,
    max: 22,
    match: /dropout|drop.out|school.leav/,
  },
  {
    id: "unemployment_rate",
    label: "Unemployment rate (%)",
    short: "unemployment",
    dataset: "nisr_lfs",
    min: 5,
    max: 22,
    match: /unemploy/,
  },
  {
    id: "labour_force_participation",
    label: "Labour force participation rate (%)",
    short: "labour force participation",
    dataset: "nisr_lfs",
    min: 62,
    max: 85,
    match: /labour.force|lfp|participation.rate/,
  },
  {
    id: "pct_formal",
    label: "Share of formal employment (%)",
    short: "formal employment",
    dataset: "nisr_lfs",
    min: 8,
    max: 55,
    match: /formal.employ|formal.sector/,
  },
  {
    id: "total_establishments",
    label: "Total registered establishments",
    short: "establishments",
    dataset: "nisr_ec",
    min: 200,
    max: 12000,
    match: /establish|business|firm|enterprise/,
  },
  // TVET
  {
    id: "tvet_pass_rate",
    label: "TVET course pass rate (%)",
    short: "TVET pass rate",
    dataset: "nisr_tvet",
    min: 55,
    max: 92,
    match: /tvet.pass|technical.*pass|vocational.*pass/,
  },
  {
    id: "tvet_employed_6months",
    label: "TVET graduates employed within 6 months (%)",
    short: "TVET graduate employment",
    dataset: "nisr_tvet",
    min: 20,
    max: 78,
    match: /tvet.*employ|vocational.*employ|trade.*employ/,
  },
  {
    id: "tvet_enrolled",
    label: "TVET enrolled students",
    short: "TVET enrolment",
    dataset: "nisr_tvet",
    min: 8,
    max: 180,
    match: /tvet.*enrol|vocational.*enrol|trade.*school/,
  },
  // Higher education
  {
    id: "higher_graduation_rate",
    label: "University graduation rate (%)",
    short: "university graduation rate",
    dataset: "nisr_hec",
    min: 55,
    max: 92,
    match: /universit.*grad|higher.*ed.*grad|degree.*grad/,
  },
  {
    id: "higher_employed_1year",
    label: "University graduates employed within 1 year (%)",
    short: "graduate employment",
    dataset: "nisr_hec",
    min: 45,
    max: 88,
    match: /graduate.*employ|universit.*employ|degree.*employ/,
  },
  {
    id: "higher_enrolled",
    label: "University enrolled students",
    short: "university enrolment",
    dataset: "nisr_hec",
    min: 15,
    max: 800,
    match: /universit.*enrol|higher.*ed.*enrol|college.*enrol/,
  },
  // National exams
  {
    id: "exam_pass_rate",
    label: "National exam pass rate (%)",
    short: "national exam pass rate",
    dataset: "nisr_nesa",
    min: 45,
    max: 95,
    match: /exam.*pass|national.*exam|p6|s3|s6|leaving.*cert/,
  },
  {
    id: "exam_distinction_rate",
    label: "National exam distinction rate (%)",
    short: "exam distinction rate",
    dataset: "nisr_nesa",
    min: 3,
    max: 28,
    match: /distinction|merit|top.*exam/,
  },
  {
    id: "exam_mean_score",
    label: "National exam mean score",
    short: "exam mean score",
    dataset: "nisr_nesa",
    min: 42,
    max: 78,
    match: /mean.*score|average.*score|exam.*score/,
  },
  // Career demand
  {
    id: "job_vacancies",
    label: "Job vacancies by occupation",
    short: "job vacancies",
    dataset: "nisr_lmis",
    min: 2,
    max: 80,
    match: /vacanc|job.*open|position.*open/,
  },
  {
    id: "skill_gap_score",
    label: "Skill gap score (1–9)",
    short: "skill gap",
    dataset: "nisr_lmis",
    min: 1,
    max: 9,
    match: /skill.*gap|talent.*gap|shortage/,
  },
  {
    id: "avg_advertised_wage_rwf",
    label: "Average advertised wage (RWF)",
    short: "advertised wage",
    dataset: "nisr_lmis",
    min: 35000,
    max: 500000,
    match: /advertis.*wage|job.*salary|career.*pay|occupation.*wage/,
  },
];

const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const r01 = (s: string) => (hash(s) % 10000) / 10000;
const round1 = (n: number) => Math.round(n * 10) / 10;

function valueFor(ind: Indicator, district: string, year: number) {
  const base = ind.min + r01(ind.id + district) * (ind.max - ind.min);
  const slope = (r01(`${ind.id}:s:${district}`) - 0.35) * 1.6;
  const wiggle = (r01(`${ind.id}:${district}:${year}`) - 0.5) * 0.8;
  return round1(
    Math.min(99, Math.max(1, base + slope * (year - FIRST_YEAR) + wiggle)),
  );
}

type Intent = {
  ind?: Indicator;
  operation: "compare" | "trend" | "rank" | "summary";
  districts: string[];
  from: number;
  to: number;
  ambiguous: boolean;
};

function parse(question: string): Intent {
  const nlu = parseIntent(question);
  const q = question.toLowerCase();
  // Use NLU subjects + original question for indicator matching so synonyms are covered
  const enriched = q + " " + nlu.subjects.join(" ");
  const ind = INDICATORS.find((i) => i.match.test(enriched));
  const n = /last (\d)\s*years?/.exec(q)?.[1];
  const since = /since (20\d\d)/.exec(q)?.[1];
  const years = n
    ? Math.min(5, Math.max(2, Number(n)))
    : since
      ? LATEST_YEAR - Number(since) + 1
      : 5;
  const from = Math.max(FIRST_YEAR, LATEST_YEAR - years + 1);
  return {
    ind,
    operation: nlu.operation,
    districts: nlu.districts,
    from,
    to: LATEST_YEAR,
    ambiguous: nlu.engine === "ambiguous",
  };
}

const empty = (
  question: string,
  status: AnalyticalResult["status"],
  message: string,
  intent: Partial<Intent> = {},
): AnalyticalResult =>
  AnalyticalResultSchema.parse({
    id: randomUUID(),
    question,
    status,
    message,
    intent: { metric: intent.ind?.id, operation: intent.operation },
    decision: null,
    datasets: {},
    metrics: {},
    insights: {},
    formulas: {},
    sources: {},
    operations: [],
    caveats: [],
    meta: {
      analysisVersion: ANALYSIS_VERSION,
      computedAt: new Date().toISOString(),
      datasetVersions: {},
      isSample: true,
    },
  });

export function runAnalysis(question: string): AnalyticalResult {
  const it = parse(question);
  const nlu = parseIntent(question);
  if (it.ambiguous) return empty(question, "ambiguous", nlu.understood, it);
  if (!it.ind)
    return empty(
      question,
      "unsupported",
      `I understood: "${nlu.understood}" — but this indicator is not yet available. ` +
        `Available indicators: ${INDICATORS.map((i) => i.short).join(", ")}. ` +
        `Try asking about one of these, or rephrase using words like employment, poverty, health, education, or career.`,
      it,
    );
  const ind = it.ind;
  const years = Array.from(
    { length: it.to - it.from + 1 },
    (_, i) => it.from + i,
  );

  const latest = DISTRICTS.map((d) => {
    const v = valueFor(ind, d, it.to);
    const first = valueFor(ind, d, it.from);
    return {
      district: d,
      province: DISTRICT_TILES[d]!.province,
      value: v,
      first,
      change: round1(v - first),
    };
  });
  const sorted = [...latest].sort((a, b) => b.value - a.value);
  const top = sorted[0]!,
    bottom = sorted[sorted.length - 1]!;
  const mean = (arr: number[]) =>
    round1(arr.reduce((a, b) => a + b, 0) / arr.length);
  const national = years.map((y) => ({
    year: String(y),
    value: mean(DISTRICTS.map((d) => valueFor(ind, d, y))),
  }));
  const natLatest = national[national.length - 1]!.value;
  const natFirst = national[0]!.value;
  const improved = latest.filter((r) => r.change > 0).length;

  const chosen = it.districts.length
    ? it.districts.slice(0, 6)
    : [...sorted.slice(0, 3), ...sorted.slice(-2)].map((r) => r.district);
  const trendRows = chosen.flatMap((d) =>
    years.map((y) => ({
      year: String(y),
      district: d,
      province: DISTRICT_TILES[d]!.province,
      value: valueFor(ind, d, y),
    })),
  );
  const unit = "%";
  const pct = { unit, kind: "percent" as const };
  const caveats = [
    "National values are simple means across the 30 districts, not population-weighted.",
  ];
  const partial = it.districts.length > 6;
  if (partial)
    caveats.push(
      "Only the first six named districts are shown in the trend chart.",
    );

  const raw = {
    id: randomUUID(),
    question,
    status: partial ? "partial" : "ok",
    message: partial ? "Showing the first six districts you named." : undefined,
    decision: null,
    intent: {
      metric: ind.id,
      operation: it.operation,
      geography: it.districts.length
        ? it.districts.join(", ")
        : "All districts",
      periodFrom: it.from,
      periodTo: it.to,
    },
    datasets: {
      by_district_latest: {
        label: `${ind.label}, ${it.to}, by district`,
        columns: [
          { key: "district", label: "District", kind: "geo" },
          { key: "province", label: "Province", kind: "category" },
          { key: "value", label: `${ind.short} (${it.to})`, ...pct },
          {
            key: "change",
            label: `Change since ${it.from} (pp)`,
            kind: "number",
            unit: "pp",
          },
        ],
        rows: latest.map(({ district, province, value, change }) => ({
          district,
          province,
          value,
          change,
        })),
        sourceIds: [ind.dataset],
      },
      trend_by_district: {
        label: `${ind.label}, ${it.from}–${it.to}, selected districts`,
        columns: [
          { key: "year", label: "Year", kind: "time" },
          { key: "district", label: "District", kind: "category" },
          { key: "province", label: "Province", kind: "category" },
          { key: "value", label: ind.short, ...pct },
        ],
        rows: trendRows,
        sourceIds: [ind.dataset],
      },
      trend_national: {
        label: `${ind.label}, national mean`,
        columns: [
          { key: "year", label: "Year", kind: "time" },
          { key: "value", label: "National mean", ...pct },
        ],
        rows: national,
        sourceIds: [ind.dataset],
      },
    },
    metrics: {
      national_latest: {
        label: `National mean, ${it.to}`,
        value: natLatest,
        unit,
        decimals: 1,
        delta: {
          label: `since ${it.from}`,
          value: round1(natLatest - natFirst),
        },
        sourceIds: [ind.dataset],
      },
      highest: {
        label: `Highest: ${top.district}`,
        value: top.value,
        unit,
        decimals: 1,
        sourceIds: [ind.dataset],
      },
      lowest: {
        label: `Lowest: ${bottom.district}`,
        value: bottom.value,
        unit,
        decimals: 1,
        sourceIds: [ind.dataset],
      },
    },
    insights: {
      extremes: {
        text: `${top.district} has the highest ${ind.short} in ${it.to} at ${top.value.toFixed(1)}%, and ${bottom.district} the lowest at ${bottom.value.toFixed(1)}%, a gap of ${(top.value - bottom.value).toFixed(1)} percentage points.`,
        evidence: ["datasets.by_district_latest"],
      },
      national: {
        text: `The national mean moved from ${natFirst.toFixed(1)}% in ${it.from} to ${natLatest.toFixed(1)}% in ${it.to}.`,
        evidence: ["datasets.trend_national"],
      },
      direction: {
        text: `${improved} of ${latest.length} districts recorded a higher value in ${it.to} than in ${it.from}.`,
        evidence: ["datasets.by_district_latest"],
      },
    },
    formulas: {
      change_pp: {
        label: "Change in percentage points",
        expression: "latest − first",
        description:
          "Difference between the national mean in the last and first year of the period.",
        inputs: { first: natFirst, latest: natLatest },
        value: round1(natLatest - natFirst),
        unit: "pp",
        decimals: 1,
      },
    },
    sources: {
      [ind.dataset]: {
        publisher: "Isesengura demo data",
        title: `${DATASET_SOURCE_TITLES[ind.dataset] ?? ind.label} (generated proxy)`,
        period: `${it.from}–${it.to}`,
        file: ind.dataset,
        isSample: true,
      },
    },
    operations: [
      {
        id: "select_indicator",
        description: `Mapped the question to indicator "${ind.id}" and operation "${it.operation}".`,
      },
      {
        id: "district_values",
        description: `Read district values for ${it.from}–${it.to} (30 districts).`,
      },
      {
        id: "national_mean",
        description:
          "Computed the national mean as an unweighted average of district values.",
      },
      { id: "rank", description: "Ranked districts by the latest-year value." },
    ],
    caveats: [
      "Demo only: values are generated proxies, not verified NISR observations.",
      ...caveats,
    ],
    meta: {
      analysisVersion: ANALYSIS_VERSION,
      computedAt: new Date().toISOString(),
      datasetVersions: { [ind.dataset]: DATASET_VERSIONS[ind.dataset]! },
      isSample: true,
    },
  };
  return AnalyticalResultSchema.parse(raw);
}
