import axios from "axios";
import {
  PresentationSpecSchema, validateSpec, validateSpecAgainstResult,
  type AnalyticalResult, type PresentationSpec,
} from "@shared";
import { env } from "../env";

export const RULES_PLANNER = "rules-1.0.0";

/** Deterministic presentation planner: picks components from the shape of the result, never from invented values. */
export function planWithRules(r: AnalyticalResult): PresentationSpec {
  const label = r.datasets.by_district_latest?.label ?? "Analysis";
  const src = Object.keys(r.sources);
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
