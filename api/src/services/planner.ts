import axios from "axios";
import {
  PresentationSpecSchema, validateSpec, validateSpecAgainstResult,
  type AnalyticalResult, type PresentationSpec,
} from "@shared";
import { env } from "../env";

export const RULES_PLANNER = "rules-1.1.0";

type Spec = PresentationSpec;

function srcIds(r: AnalyticalResult): string[] {
  return Object.keys(r.sources);
}

function metricCards(r: AnalyticalResult, limit = 4) {
  const ids = Object.keys(r.metrics).slice(0, limit);
  const span = ids.length <= 1 ? 12 : ids.length === 2 ? 6 : ids.length === 3 ? 4 : 3;
  return ids.map((id) => ({
    id: `m_${id}`,
    type: "metric" as const,
    title: r.metrics[id]?.label ?? id,
    valueRef: `metrics.${id}`,
    layout: { span, height: "sm" as const },
    sourceIds: srcIds(r),
  }));
}

function planDecision(r: AnalyticalResult): Spec {
  const src = srcIds(r);
  const hasScores = Boolean(r.datasets.option_scores);
  const spec = {
    schemaVersion: 1,
    type: "dashboard",
    title: r.decision?.decisionType?.replace(/_/g, " ") ?? "Decision comparison",
    subtitle: `${r.intent.geography ?? "Rwanda"} · ${r.intent.periodFrom ?? ""}–${r.intent.periodTo ?? ""}`,
    components: [
      {
        id: "headline", type: "section", title: "Decision evidence", layout: { span: 12 },
        children: metricCards(r, 2),
      },
      ...(hasScores
        ? [
            { id: "ranking", type: "bar", title: "Options by composite score", dataRef: "datasets.option_scores", x: "option", y: "score", layout: { span: 7, height: "lg" }, sourceIds: src },
            { id: "table", type: "table", title: "Ranked options", dataRef: "datasets.option_scores", columns: ["option", "rank", "score"], layout: { span: 5, height: "lg" }, sourceIds: src },
          ]
        : []),
      { id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 12, height: "md" } },
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

function planClustering(r: AnalyticalResult): Spec {
  const src = srcIds(r);
  const hasDistricts = Boolean(r.datasets.district_clusters);
  const hasProfiles = Boolean(r.datasets.cluster_profiles);
  const valueKey = hasDistricts
    ? (r.datasets.district_clusters!.columns.find((c) => c.key === "underemployment_rate")?.key
      ?? r.datasets.district_clusters!.columns.find((c) => c.kind === "percent" || c.kind === "number")?.key
      ?? "underemployment_rate")
    : "underemployment_rate";
  const spec = {
    schemaVersion: 1,
    type: "dashboard",
    title: "District underutilization clusters",
    subtitle: `${r.intent.periodFrom ?? ""}–${r.intent.periodTo ?? ""}`,
    components: [
      { id: "headline", type: "section", title: "Cluster summary", layout: { span: 12 }, children: metricCards(r, 3) },
      ...(hasDistricts
        ? [
            { id: "map", type: "map", title: "Districts by underemployment", dataRef: "datasets.district_clusters", regionKey: "district", valueKey, layout: { span: 6, height: "lg" }, sourceIds: src },
            { id: "districts", type: "table", title: "District assignments", dataRef: "datasets.district_clusters", columns: ["district", "province", "cluster_label", valueKey], layout: { span: 6, height: "lg" }, sourceIds: src },
          ]
        : []),
      ...(hasProfiles
        ? [{ id: "profiles", type: "table", title: "Cluster profiles", dataRef: "datasets.cluster_profiles", columns: r.datasets.cluster_profiles!.columns.slice(0, 6).map((c) => c.key), layout: { span: 12, height: "md" }, sourceIds: src }]
        : []),
      { id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 12, height: "md" } },
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

function planRegression(r: AnalyticalResult): Spec {
  const src = srcIds(r);
  const spec = {
    schemaVersion: 1,
    type: "dashboard",
    title: "Youth NEET predictors",
    subtitle: `Panel ${r.intent.periodFrom ?? ""}–${r.intent.periodTo ?? ""}`,
    components: [
      { id: "headline", type: "section", title: "Model fit", layout: { span: 12 }, children: metricCards(r, 4) },
      ...(r.datasets.feature_importance
        ? [{ id: "importance", type: "bar", title: "Relative feature importance", dataRef: "datasets.feature_importance", x: "feature", y: "importance_pct", layout: { span: 6, height: "lg" }, sourceIds: src }]
        : []),
      ...(r.datasets.predictions
        ? [
            { id: "map", type: "map", title: "Actual NEET by district", dataRef: "datasets.predictions", regionKey: "district", valueKey: "actual_neet", layout: { span: 6, height: "lg" }, sourceIds: src },
            { id: "preds", type: "table", title: "Actual vs predicted", dataRef: "datasets.predictions", columns: ["district", "province", "actual_neet", "predicted_neet", "residual"], layout: { span: 8, height: "lg" }, sourceIds: src },
          ]
        : []),
      ...(r.formulas.ols
        ? [{ id: "formula", type: "formula", title: "Model", formulaRef: "formulas.ols", layout: { span: 4, height: "lg" } }]
        : []),
      { id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 12, height: "md" } },
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

function planForecast(r: AnalyticalResult): Spec {
  const src = srcIds(r);
  const spec = {
    schemaVersion: 1,
    type: "dashboard",
    title: "Sector employment trends",
    subtitle: `${r.intent.periodFrom ?? ""}–${r.intent.periodTo ?? ""}`,
    components: [
      { id: "headline", type: "section", title: "Headline", layout: { span: 12 }, children: metricCards(r, 3) },
      ...(r.datasets.sector_trends
        ? [{ id: "trend", type: "line", title: "Employment share over time", dataRef: "datasets.sector_trends", x: "year", y: "actual_share", series: "sector", layout: { span: 12, height: "lg" }, sourceIds: src }]
        : []),
      ...(r.datasets.sector_ranking
        ? [{ id: "ranking", type: "bar", title: "Sector growth ranking", dataRef: "datasets.sector_ranking", x: "sector", y: "slope", layout: { span: 6, height: "md" }, sourceIds: src }]
        : []),
      ...(r.datasets.sector_forecast
        ? [{ id: "forecast", type: "table", title: "Near-term projections", dataRef: "datasets.sector_forecast", columns: ["sector", "year", "projected_share", "projected_lower", "projected_upper", "trend_slope"], layout: { span: 6, height: "md" }, sourceIds: src }]
        : []),
      { id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 12, height: "md" } },
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

function planLegacy(r: AnalyticalResult): Spec {
  const label = r.datasets.by_district_latest?.label ?? "Analysis";
  const src = srcIds(r);
  const trendFirst = r.intent.operation === "trend";
  const bar = { id: "ranking", type: "bar", title: "Districts ranked", dataRef: "datasets.by_district_latest", x: "district", y: "value", layout: { span: 6, height: "lg" }, sourceIds: src, a11y: {} };
  const map = { id: "map", type: "map", title: "Where it is higher and lower", dataRef: "datasets.by_district_latest", regionKey: "district", valueKey: "value", layout: { span: 6, height: "lg" }, sourceIds: src };
  const line = { id: "trend", type: "line", title: "Change over time", dataRef: "datasets.trend_by_district", x: "year", y: "value", series: "district", layout: { span: 12, height: "md" }, sourceIds: src };
  const middle = trendFirst ? [line, bar, map] : [bar, map, line];
  const spec = {
    schemaVersion: 1, type: "dashboard", title: label,
    subtitle: `${r.intent.geography ?? "All districts"} · ${r.intent.periodFrom}–${r.intent.periodTo}`,
    components: [
      {
        id: "headline", type: "section", title: "Headline indicators", layout: { span: 12 },
        children: [
          { id: "m_national", type: "metric", title: "National mean", valueRef: "metrics.national_latest", layout: { span: 4, height: "sm" }, sourceIds: src },
          { id: "m_high", type: "metric", title: "Highest district", valueRef: "metrics.highest", layout: { span: 4, height: "sm" }, sourceIds: src },
          { id: "m_low", type: "metric", title: "Lowest district", valueRef: "metrics.lowest", layout: { span: 4, height: "sm" }, sourceIds: src },
        ],
      },
      { id: "province_filter", type: "filter", title: "Province", control: "select", dataRef: "datasets.by_district_latest", field: "province", targets: ["ranking", "map", "table"], layout: { span: 12, height: "sm" } },
      ...middle,
      { id: "table", type: "table", title: "Exact values", dataRef: "datasets.by_district_latest", columns: ["district", "province", "value", "change"], layout: { span: 8, height: "lg" }, sourceIds: src },
      { id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 4, height: "lg" } },
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

function planGeneric(r: AnalyticalResult): Spec {
  const src = srcIds(r);
  const firstDs = Object.keys(r.datasets)[0];
  const cols = firstDs ? r.datasets[firstDs]!.columns.map((c) => c.key).slice(0, 6) : [];
  const spec = {
    schemaVersion: 1,
    type: "dashboard",
    title: firstDs ? r.datasets[firstDs]!.label : "Analysis",
    subtitle: r.question.slice(0, 120),
    components: [
      ...(Object.keys(r.metrics).length
        ? [{ id: "headline", type: "section", title: "Metrics", layout: { span: 12 }, children: metricCards(r, 4) }]
        : []),
      ...(firstDs
        ? [{ id: "table", type: "table", title: r.datasets[firstDs]!.label, dataRef: `datasets.${firstDs}`, columns: cols, layout: { span: 12, height: "lg" }, sourceIds: src }]
        : []),
      ...(Object.keys(r.insights).length
        ? [{ id: "insights", type: "text", title: "What the data shows", insightRefs: Object.keys(r.insights).map((k) => `insights.${k}`), layout: { span: 12, height: "md" } }]
        : []),
    ],
  };
  return PresentationSpecSchema.parse(spec);
}

/** Deterministic presentation planner: picks components from the shape of the result. */
export function planWithRules(r: AnalyticalResult): PresentationSpec {
  if (r.decision?.optionComparison?.length) return planDecision(r);
  if (r.datasets.feature_importance || r.datasets.predictions) return planRegression(r);
  if (r.datasets.sector_trends || r.datasets.sector_forecast || r.datasets.sector_ranking) return planForecast(r);
  if (r.datasets.cluster_profiles || r.datasets.district_clusters) return planClustering(r);
  if (r.datasets.by_district_latest) return planLegacy(r);
  return planGeneric(r);
}

const SPEC_GUIDE = `Return ONLY one JSON object (no prose, no markdown fences): a dashboard presentation spec.
{ "schemaVersion":1, "type":"dashboard", "title":string, "subtitle"?:string, "palette"?:"default"|"categorical"|"monochrome",
  "components":[ ... 3-8 items ... ] }
Component types (each has id, title, layout:{span:3-12,height:"sm"|"md"|"lg"}, sourceIds?):
 metric{valueRef:"metrics.<id>"} | bar{dataRef,x,y,orientation?,sort?,limit?} | line{dataRef,x,y,series?} | area{...like line}
 scatter{dataRef,x,y,label?} | table{dataRef,columns?} | map{dataRef,regionKey,valueKey} | text{insightRefs:["insights.<id>"]}
 formula{formulaRef:"formulas.<id>"} | filter{control:"select"|"multiselect"|"range",dataRef,field,targets:[componentIds]}
 section{children:[leaf components]}
Rules: refs must exist in the catalog. Never write numbers or statistics anywhere. Line charts for time, bars for ranking, map only for geo columns, table for exact values.`;

/** Optional LLM planner. Sees only the *structure* of the result. Output is validated; any failure falls back to rules. */
export async function planWithLLM(r: AnalyticalResult): Promise<PresentationSpec | null> {
  if (!env.ANTHROPIC_API_KEY) return null;
  const catalog = {
    question: r.question, intent: r.intent,
    datasets: Object.fromEntries(Object.entries(r.datasets).map(([k, d]) => [k, { label: d.label, rows: d.rows.length, columns: d.columns.map((c) => ({ key: c.key, kind: c.kind })) }])),
    metrics: Object.keys(r.metrics), insights: Object.keys(r.insights), formulas: Object.keys(r.formulas), sources: Object.keys(r.sources),
  };
  try {
    const { data } = await axios.post(
      "https://api.anthropic.com/v1/messages",
      { model: env.PLANNER_MODEL, max_tokens: 3000, system: SPEC_GUIDE, messages: [{ role: "user", content: JSON.stringify(catalog) }] },
      { headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, timeout: 30_000 },
    );
    const text: string = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const v = validateSpec(json);
    if (!v.ok) return null;
    return validateSpecAgainstResult(v.spec, r).length === 0 ? v.spec : null;
  } catch (e) {
    console.warn("[planner] LLM planning failed, using rules:", (e as Error).message);
    return null;
  }
}

export async function planPresentation(r: AnalyticalResult): Promise<{ spec: PresentationSpec; plannerVersion: string }> {
  const llm = await planWithLLM(r);
  if (llm) return { spec: llm, plannerVersion: `llm:${env.PLANNER_MODEL}` };
  const spec = planWithRules(r);
  const issues = validateSpecAgainstResult(spec, r);
  if (issues.length) throw new Error(`Rule planner produced an invalid spec: ${issues[0]?.message}`);
  return { spec, plannerVersion: RULES_PLANNER };
}
