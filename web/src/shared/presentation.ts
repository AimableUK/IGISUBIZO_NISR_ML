import { z } from "zod";
import { IdKey, type AnalyticalResult, type Dataset, type Row } from "./analytical";

/** Strip markup + control characters from any user/model supplied string. */
const clean = (max: number) =>
  z.string().max(max).transform((s) => s.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f\u007f]/g, " ").trim());

export const ComponentId = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/, "Invalid component id");
const Field = IdKey;
const ref = (kind: string) => new RegExp(`^${kind}\\.[a-zA-Z][a-zA-Z0-9_]{0,63}$`);
const DatasetRef = z.string().regex(ref("datasets"), "Expected a reference like datasets.<id>");
const MetricRef = z.string().regex(ref("metrics"), "Expected a reference like metrics.<id>");
const InsightRef = z.string().regex(ref("insights"), "Expected a reference like insights.<id>");
const FormulaRef = z.string().regex(ref("formulas"), "Expected a reference like formulas.<id>");

const Base = z.object({
  id: ComponentId,
  title: clean(120),
  description: clean(300).optional(),
  layout: z
    .object({
      span: z.number().int().min(3).max(12).default(6),
      height: z.enum(["sm", "md", "lg"]).default("md"),
    })
    .default({}),
  a11y: z.object({ summary: clean(500).optional() }).default({}),
  sourceIds: z.array(IdKey).max(10).default([]),
});

const MetricC = Base.extend({ type: z.literal("metric"), valueRef: MetricRef });
const BarC = Base.extend({
  type: z.literal("bar"),
  dataRef: DatasetRef,
  x: Field,
  y: Field,
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  sort: z.enum(["asc", "desc", "none"]).default("desc"),
  limit: z.number().int().min(1).max(60).optional(),
});
const LineC = Base.extend({ type: z.literal("line"), dataRef: DatasetRef, x: Field, y: Field, series: Field.optional() });
const AreaC = Base.extend({ type: z.literal("area"), dataRef: DatasetRef, x: Field, y: Field, series: Field.optional() });
const ScatterC = Base.extend({ type: z.literal("scatter"), dataRef: DatasetRef, x: Field, y: Field, label: Field.optional() });
const TableC = Base.extend({
  type: z.literal("table"),
  dataRef: DatasetRef,
  columns: z.array(Field).max(20).optional(),
  searchable: z.boolean().default(true),
  sortable: z.boolean().default(true),
  pageSize: z.number().int().min(5).max(100).default(15),
});
const MapC = Base.extend({ type: z.literal("map"), dataRef: DatasetRef, regionKey: Field, valueKey: Field });
const TextC = Base.extend({
  type: z.literal("text"),
  insightRefs: z.array(InsightRef).max(12).default([]),
  body: clean(1200).optional(),
});
const FormulaC = Base.extend({ type: z.literal("formula"), formulaRef: FormulaRef });
const FilterC = Base.extend({
  type: z.literal("filter"),
  control: z.enum(["select", "multiselect", "range"]),
  dataRef: DatasetRef,
  field: Field,
  targets: z.array(ComponentId).max(24).default([]),
});

export const LeafSchema = z.discriminatedUnion("type", [
  MetricC, BarC, LineC, AreaC, ScatterC, TableC, MapC, TextC, FormulaC, FilterC,
]);
const SectionC = Base.extend({ type: z.literal("section"), children: z.array(LeafSchema).max(12) });
export const ComponentSchema = z.discriminatedUnion("type", [
  MetricC, BarC, LineC, AreaC, ScatterC, TableC, MapC, TextC, FormulaC, FilterC, SectionC,
]);

export const PALETTES = ["default", "categorical", "monochrome"] as const;

export const PresentationSpecSchema = z.object({
  schemaVersion: z.literal(1),
  type: z.literal("dashboard"),
  title: clean(160),
  subtitle: clean(300).optional(),
  layout: z.object({ columns: z.literal(12) }).default({ columns: 12 }),
  palette: z.enum(PALETTES).default("default"),
  components: z.array(ComponentSchema).min(1).max(24),
});

export const FilterValue = z.union([z.string().max(100), z.array(z.string().max(100)).max(60), z.tuple([z.number(), z.number()]), z.null()]);
export const CustomizationsSchema = z.object({
  palette: z.enum(PALETTES).optional(),
  order: z.array(ComponentId).max(64).default([]),
  overrides: z
    .record(
      ComponentId,
      z.object({
        type: z.enum(["bar", "line", "area", "table", "map"]).optional(),
        span: z.number().int().min(3).max(12).optional(),
        height: z.enum(["sm", "md", "lg"]).optional(),
        collapsed: z.boolean().optional(),
      }),
    )
    .default({}),
  filters: z.record(ComponentId, FilterValue).default({}),
});

export type Leaf = z.infer<typeof LeafSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type PresentationSpec = z.infer<typeof PresentationSpecSchema>;
export type Customizations = z.infer<typeof CustomizationsSchema>;
export type FilterValueT = z.infer<typeof FilterValue>;
export type FilterComponent = Extract<Leaf, { type: "filter" }>;
export type ComponentType = Component["type"];
export const COMPONENT_TYPES = ["metric", "bar", "line", "area", "scatter", "table", "map", "text", "formula", "filter", "section"] as const;
export const emptyCustomizations = (): Customizations => CustomizationsSchema.parse({});

/* ------------------------------ validation ------------------------------ */

export type SpecIssue = { path: string; message: string; code: string };
export type SpecValidation = { ok: true; spec: PresentationSpec } | { ok: false; issues: SpecIssue[] };
export const MAX_SPEC_BYTES = 200_000;

export function validateSpec(input: unknown): SpecValidation {
  const r = PresentationSpecSchema.safeParse(input);
  if (r.success) return { ok: true, spec: r.data };
  return { ok: false, issues: r.error.issues.map((i) => ({ path: i.path.join(".") || "(root)", message: i.message, code: i.code })) };
}

export function parseSpecJson(text: string): SpecValidation {
  if (text.length > MAX_SPEC_BYTES) return { ok: false, issues: [{ path: "(root)", message: "Specification is too large.", code: "too_big" }] };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return { ok: false, issues: [{ path: "(root)", message: `Not valid JSON: ${(e as Error).message}`, code: "invalid_json" }] };
  }
  return validateSpec(json);
}

export function flattenComponents(spec: PresentationSpec): Component[] {
  const out: Component[] = [];
  for (const c of spec.components) {
    out.push(c);
    if (c.type === "section") out.push(...c.children);
  }
  return out;
}

export type RefKind = "datasets" | "metrics" | "insights" | "formulas";
export function resolveRef<K extends RefKind>(result: AnalyticalResult, ref: string, kind: K): AnalyticalResult[K][string] | undefined {
  const [k, id] = ref.split(".");
  if (k !== kind || !id) return undefined;
  const bucket = result[kind] as Record<string, unknown>;
  return Object.hasOwn(bucket, id) ? (bucket[id] as AnalyticalResult[K][string]) : undefined;
}

/** Cross-check a structurally valid spec against the analytical result it presents. */
export function validateSpecAgainstResult(spec: PresentationSpec, result: AnalyticalResult): SpecIssue[] {
  const issues: SpecIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message, code: "reference" });
  const all = flattenComponents(spec);
  const ids = new Set<string>();
  all.forEach((c, i) => {
    if (ids.has(c.id)) add(`components[${i}].id`, `Duplicate component id "${c.id}".`);
    ids.add(c.id);
  });
  all.forEach((c, i) => {
    const p = `component "${c.id}"`;
    for (const s of c.sourceIds) if (!Object.hasOwn(result.sources, s)) add(p, `Unknown source "${s}".`);
    const ds = "dataRef" in c ? resolveRef(result, c.dataRef, "datasets") : undefined;
    if ("dataRef" in c && !ds) add(`${p}.dataRef`, `Dataset "${c.dataRef}" does not exist in the analytical result.`);
    const col = (k: string) => ds?.columns.find((x) => x.key === k);
    const need = (field: string, key: string, numeric = false) => {
      if (!ds) return;
      const x = col(key);
      if (!x) add(`${p}.${field}`, `Column "${key}" is not in ${"dataRef" in c ? c.dataRef : "dataset"}.`);
      else if (numeric && x.kind !== "number" && x.kind !== "percent") add(`${p}.${field}`, `Column "${key}" is not numeric.`);
    };
    switch (c.type) {
      case "metric":
        if (!resolveRef(result, c.valueRef, "metrics")) add(`${p}.valueRef`, `Metric "${c.valueRef}" does not exist.`);
        break;
      case "bar": case "line": case "area": case "scatter":
        need("x", c.x, c.type === "scatter"); need("y", c.y, true);
        if ("series" in c && c.series) need("series", c.series);
        break;
      case "table":
        c.columns?.forEach((k) => need("columns", k));
        break;
      case "map":
        need("regionKey", c.regionKey); need("valueKey", c.valueKey, true);
        break;
      case "text":
        c.insightRefs.forEach((r) => { if (!resolveRef(result, r, "insights")) add(`${p}.insightRefs`, `Insight "${r}" does not exist.`); });
        break;
      case "formula":
        if (!resolveRef(result, c.formulaRef, "formulas")) add(`${p}.formulaRef`, `Formula "${c.formulaRef}" does not exist.`);
        break;
      case "filter":
        need("field", c.field);
        c.targets.forEach((t) => { if (!ids.has(t)) add(`${p}.targets`, `Target "${t}" is not a component in this specification.`); });
        break;
      case "section":
        break;
    }
    void i;
  });
  return issues;
}

/* --------------------- switching, customization, filters --------------------- */

export type SwitchType = "bar" | "line" | "area" | "table" | "map";

function canonical(c: Component): { dataRef: string; x: string; y: string; series?: string } | null {
  if (c.type === "bar") return { dataRef: c.dataRef, x: c.x, y: c.y };
  if (c.type === "line" || c.type === "area") return { dataRef: c.dataRef, x: c.x, y: c.y, series: c.series };
  if (c.type === "map") return { dataRef: c.dataRef, x: c.regionKey, y: c.valueKey };
  return null;
}

/** Visualization forms that are semantically valid for this component's data. Includes its own type. */
export function alternativesFor(c: Component, result: AnalyticalResult): SwitchType[] {
  const k = canonical(c);
  if (!k) return [];
  const ds = resolveRef(result, k.dataRef, "datasets");
  const xc = ds?.columns.find((x) => x.key === k.x);
  if (!ds || !xc) return [];
  const out = new Set<SwitchType>([c.type as SwitchType, "table"]);
  if (!k.series && (xc.kind === "category" || xc.kind === "geo" || xc.kind === "time")) out.add("bar");
  if (xc.kind === "time") { out.add("line"); out.add("area"); }
  if (!k.series && xc.kind === "geo") out.add("map");
  return (["bar", "line", "area", "map", "table"] as SwitchType[]).filter((t) => out.has(t));
}

export function convertComponent(c: Component, to: SwitchType): Component {
  const k = canonical(c);
  if (!k || c.type === to) return c;
  const base = { id: c.id, title: c.title, description: c.description, layout: c.layout, a11y: c.a11y, sourceIds: c.sourceIds };
  switch (to) {
    case "bar": return { ...base, type: "bar", dataRef: k.dataRef, x: k.x, y: k.y, orientation: "horizontal", sort: "desc" };
    case "line": return { ...base, type: "line", dataRef: k.dataRef, x: k.x, y: k.y, series: k.series };
    case "area": return { ...base, type: "area", dataRef: k.dataRef, x: k.x, y: k.y, series: k.series };
    case "map": return { ...base, type: "map", dataRef: k.dataRef, regionKey: k.x, valueKey: k.y };
    case "table": return { ...base, type: "table", dataRef: k.dataRef, columns: [...new Set([k.x, k.series, k.y].filter(Boolean) as string[])], searchable: true, sortable: true, pageSize: 15 };
  }
}

function withOverride(c: Component, cz: Customizations, result: AnalyticalResult): Component {
  const o = Object.hasOwn(cz.overrides, c.id) ? cz.overrides[c.id] : undefined;
  let next: Component = c;
  if (o?.type && o.type !== c.type && alternativesFor(c, result).includes(o.type)) next = convertComponent(c, o.type);
  if (o && (o.span || o.height)) next = { ...next, layout: { span: o.span ?? next.layout.span, height: o.height ?? next.layout.height } };
  if (next.type === "section") next = { ...next, children: next.children.map((ch) => withOverride(ch, cz, result) as Leaf) };
  return next;
}

/** Spec + user customizations -> what is actually rendered. The spec itself is never mutated. */
export function composeView(spec: PresentationSpec, cz: Customizations, result: AnalyticalResult): Component[] {
  const byId = new Map(spec.components.map((c) => [c.id, c] as const));
  const ordered = [
    ...cz.order.filter((id) => byId.has(id)),
    ...spec.components.map((c) => c.id).filter((id) => !cz.order.includes(id)),
  ];
  return [...new Set(ordered)].map((id) => withOverride(byId.get(id)!, cz, result));
}

export function filterRows(ds: Dataset, componentId: string, filters: FilterComponent[], values: Customizations["filters"]): Row[] {
  let rows = ds.rows;
  for (const f of filters) {
    if (f.targets.length > 0 && !f.targets.includes(componentId)) continue;
    if (!ds.columns.some((c) => c.key === f.field)) continue;
    const v = Object.hasOwn(values, f.id) ? values[f.id] : null;
    if (v === null || v === undefined) continue;
    if (typeof v === "string") rows = v === "" ? rows : rows.filter((r) => String(r[f.field]) === v);
    else if (Array.isArray(v) && v.length && typeof v[0] === "string") rows = rows.filter((r) => (v as string[]).includes(String(r[f.field])));
    else if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") {
      const [lo, hi] = v as [number, number];
      rows = rows.filter((r) => typeof r[f.field] === "number" && (r[f.field] as number) >= lo && (r[f.field] as number) <= hi);
    }
  }
  return rows;
}
