import { randomUUID } from "node:crypto";
import { AnalyticalResultSchema, DISTRICT_TILES, DISTRICTS, type AnalyticalResult } from "@shared";

/**
 * SAMPLE analytical engine.
 * Generates deterministic, clearly-labelled sample indicators so the product can be built end-to-end.
 * Replace `loadIndicator` with real NISR queries; the AnalyticalResult contract stays the same.
 */
export const ANALYSIS_VERSION = "sample-engine-1.0.0";
export const DATASET_VERSIONS: Record<string, string> = {
  sample_youth_employment: "2026.1-sample",
  sample_secondary_enrolment: "2026.1-sample",
};
const LATEST_YEAR = 2025;
const FIRST_YEAR = 2021;

type Indicator = { id: string; label: string; short: string; dataset: string; min: number; max: number; match: RegExp };
const INDICATORS: Indicator[] = [
  { id: "youth_employment_rate", label: "Youth employment rate (ages 16–30)", short: "youth employment", dataset: "sample_youth_employment", min: 38, max: 72, match: /youth|employ|job|work/ },
  { id: "secondary_enrolment", label: "Secondary school net enrolment", short: "secondary enrolment", dataset: "sample_secondary_enrolment", min: 28, max: 66, match: /school|enrol|educat|student/ },
];

const hash = (s: string) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const r01 = (s: string) => (hash(s) % 10000) / 10000;
const round1 = (n: number) => Math.round(n * 10) / 10;

function valueFor(ind: Indicator, district: string, year: number) {
  const base = ind.min + r01(ind.id + district) * (ind.max - ind.min);
  const slope = (r01(`${ind.id}:s:${district}`) - 0.35) * 1.6;
  const wiggle = (r01(`${ind.id}:${district}:${year}`) - 0.5) * 0.8;
  return round1(Math.min(99, Math.max(1, base + slope * (year - FIRST_YEAR) + wiggle)));
}

type Intent = { ind?: Indicator; operation: "compare" | "trend" | "rank" | "summary"; districts: string[]; from: number; to: number; ambiguous: boolean };

function parse(question: string): Intent {
  const q = question.toLowerCase();
  const ind = INDICATORS.find((i) => i.match.test(q));
  const districts = DISTRICTS.filter((d) => new RegExp(`\\b${d.toLowerCase()}\\b`).test(q));
  const n = /last (\d)\s*years?/.exec(q)?.[1];
  const since = /since (20\d\d)/.exec(q)?.[1];
  const years = n ? Math.min(5, Math.max(2, Number(n))) : since ? LATEST_YEAR - Number(since) + 1 : 5;
  const from = Math.max(FIRST_YEAR, LATEST_YEAR - years + 1);
  const operation = /trend|over time|change|growth|last \d/.test(q) ? "trend" : /rank|top|highest|lowest|best|worst/.test(q) ? "rank" : /compare|across|between|district|versus|vs/.test(q) ? "compare" : "summary";
  return { ind, operation, districts, from, to: LATEST_YEAR, ambiguous: q.trim().split(/\s+/).length < 3 };
}

const empty = (question: string, status: AnalyticalResult["status"], message: string, intent: Partial<Intent> = {}): AnalyticalResult =>
  AnalyticalResultSchema.parse({
    id: randomUUID(), question, status, message,
    intent: { metric: intent.ind?.id, operation: intent.operation },
    datasets: {}, metrics: {}, insights: {}, formulas: {}, sources: {}, operations: [], caveats: [],
    meta: { analysisVersion: ANALYSIS_VERSION, computedAt: new Date().toISOString(), datasetVersions: {}, isSample: true },
  });

export function runAnalysis(question: string): AnalyticalResult {
  const it = parse(question);
  if (it.ambiguous) return empty(question, "ambiguous", "That question is too short to interpret. Name an indicator, for example youth employment, and what to do with it (compare, trend, rank).", it);
  if (!it.ind) return empty(question, "unsupported", `This sample build covers: ${INDICATORS.map((i) => i.short).join(", ")}. Rephrase your question around one of these.`, it);
  const ind = it.ind;
  const years = Array.from({ length: it.to - it.from + 1 }, (_, i) => it.from + i);

  const latest = DISTRICTS.map((d) => {
    const v = valueFor(ind, d, it.to);
    const first = valueFor(ind, d, it.from);
    return { district: d, province: DISTRICT_TILES[d]!.province, value: v, first, change: round1(v - first) };
  });
  const sorted = [...latest].sort((a, b) => b.value - a.value);
  const top = sorted[0]!, bottom = sorted[sorted.length - 1]!;
  const mean = (arr: number[]) => round1(arr.reduce((a, b) => a + b, 0) / arr.length);
  const national = years.map((y) => ({ year: String(y), value: mean(DISTRICTS.map((d) => valueFor(ind, d, y))) }));
  const natLatest = national[national.length - 1]!.value;
  const natFirst = national[0]!.value;
  const improved = latest.filter((r) => r.change > 0).length;

  const chosen = it.districts.length ? it.districts.slice(0, 6) : [...sorted.slice(0, 3), ...sorted.slice(-2)].map((r) => r.district);
  const trendRows = chosen.flatMap((d) => years.map((y) => ({ year: String(y), district: d, province: DISTRICT_TILES[d]!.province, value: valueFor(ind, d, y) })));
  const unit = "%";
  const pct = { unit, kind: "percent" as const };
  const caveats = [
    "SAMPLE DATA: values are generated for product development and are not NISR statistics.",
    "National values are simple means across the 30 districts, not population-weighted.",
  ];
  const partial = it.districts.length > 6;
  if (partial) caveats.push("Only the first six named districts are shown in the trend chart.");

  const raw = {
    id: randomUUID(), question, status: partial ? "partial" : "ok",
    message: partial ? "Showing the first six districts you named." : undefined,
    intent: { metric: ind.id, operation: it.operation, geography: it.districts.length ? it.districts.join(", ") : "All districts", periodFrom: it.from, periodTo: it.to },
    datasets: {
      by_district_latest: {
        label: `${ind.label}, ${it.to}, by district`,
        columns: [
          { key: "district", label: "District", kind: "geo" }, { key: "province", label: "Province", kind: "category" },
          { key: "value", label: `${ind.short} (${it.to})`, ...pct }, { key: "change", label: `Change since ${it.from} (pp)`, kind: "number", unit: "pp" },
        ],
        rows: latest.map(({ district, province, value, change }) => ({ district, province, value, change })),
        sourceIds: [ind.dataset],
      },
      trend_by_district: {
        label: `${ind.label}, ${it.from}–${it.to}, selected districts`,
        columns: [{ key: "year", label: "Year", kind: "time" }, { key: "district", label: "District", kind: "category" }, { key: "province", label: "Province", kind: "category" }, { key: "value", label: ind.short, ...pct }],
        rows: trendRows, sourceIds: [ind.dataset],
      },
      trend_national: {
        label: `${ind.label}, national mean`,
        columns: [{ key: "year", label: "Year", kind: "time" }, { key: "value", label: "National mean", ...pct }],
        rows: national, sourceIds: [ind.dataset],
      },
    },
    metrics: {
      national_latest: { label: `National mean, ${it.to}`, value: natLatest, unit, decimals: 1, delta: { label: `since ${it.from}`, value: round1(natLatest - natFirst) }, sourceIds: [ind.dataset] },
      highest: { label: `Highest: ${top.district}`, value: top.value, unit, decimals: 1, sourceIds: [ind.dataset] },
      lowest: { label: `Lowest: ${bottom.district}`, value: bottom.value, unit, decimals: 1, sourceIds: [ind.dataset] },
    },
    insights: {
      extremes: { text: `${top.district} has the highest ${ind.short} in ${it.to} at ${top.value.toFixed(1)}%, and ${bottom.district} the lowest at ${bottom.value.toFixed(1)}%, a gap of ${(top.value - bottom.value).toFixed(1)} percentage points.`, evidence: ["datasets.by_district_latest"] },
      national: { text: `The national mean moved from ${natFirst.toFixed(1)}% in ${it.from} to ${natLatest.toFixed(1)}% in ${it.to}.`, evidence: ["datasets.trend_national"] },
      direction: { text: `${improved} of ${latest.length} districts recorded a higher value in ${it.to} than in ${it.from}.`, evidence: ["datasets.by_district_latest"] },
    },
    formulas: {
      change_pp: { label: "Change in percentage points", expression: "latest − first", description: "Difference between the national mean in the last and first year of the period.", inputs: { first: natFirst, latest: natLatest }, value: round1(natLatest - natFirst), unit: "pp", decimals: 1 },
    },
    sources: {
      [ind.dataset]: { publisher: "Isesengura sample generator", title: `Sample series for ${ind.short}`, period: `${it.from}–${it.to}`, file: ind.dataset, licence: "Not for publication", isSample: true },
    },
    operations: [
      { id: "select_indicator", description: `Mapped the question to indicator "${ind.id}" and operation "${it.operation}".` },
      { id: "district_values", description: `Read district values for ${it.from}–${it.to} (30 districts).` },
      { id: "national_mean", description: "Computed the national mean as an unweighted average of district values." },
      { id: "rank", description: "Ranked districts by the latest-year value." },
    ],
    caveats,
    meta: { analysisVersion: ANALYSIS_VERSION, computedAt: new Date().toISOString(), datasetVersions: { [ind.dataset]: DATASET_VERSIONS[ind.dataset]! }, isSample: true },
  };
  return AnalyticalResultSchema.parse(raw);
}
