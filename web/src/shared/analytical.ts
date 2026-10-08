import { z } from "zod";

/** Keys that are safe to use as object keys / refs (no prototype tricks, no punctuation). */
export const IdKey = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, "Use letters, digits and underscores, starting with a letter");

const Cell = z.union([z.string().max(300), z.number(), z.null()]);

export const ColumnSchema = z.object({
  key: IdKey,
  label: z.string().max(120),
  kind: z.enum(["category", "time", "number", "percent", "geo"]),
  unit: z.string().max(24).optional(),
});

export const DatasetSchema = z.object({
  label: z.string().max(160),
  columns: z.array(ColumnSchema).min(1).max(40),
  rows: z.array(z.record(IdKey, Cell)).max(5000),
  sourceIds: z.array(IdKey).default([]),
});

export const MetricSchema = z.object({
  label: z.string().max(160),
  value: z.number(),
  unit: z.string().max(24).default(""),
  decimals: z.number().int().min(0).max(4).default(1),
  delta: z.object({ label: z.string().max(160), value: z.number() }).optional(),
  sourceIds: z.array(IdKey).default([]),
});

export const InsightSchema = z.object({
  text: z.string().max(600),
  evidence: z.array(z.string().max(100)).default([]),
});

export const FormulaSchema = z.object({
  label: z.string().max(160),
  expression: z.string().max(200),
  description: z.string().max(400),
  inputs: z.record(IdKey, z.number()),
  value: z.number(),
  unit: z.string().max(24).default(""),
  decimals: z.number().int().min(0).max(4).default(1),
});

export const SourceSchema = z.object({
  publisher: z.string().max(160),
  title: z.string().max(240),
  period: z.string().max(60),
  file: z.string().max(240).optional(),
  url: z.string().url().optional(),
  licence: z.string().max(160).optional(),
  isSample: z.boolean(),
});

export const OperationSchema = z.object({ id: IdKey, description: z.string().max(400) });

export const AnalysisStatus = z.enum(["ok", "partial", "ambiguous", "unsupported", "no_data"]);

export const AnalyticalResultSchema = z.object({
  id: z.string(),
  question: z.string().max(1000),
  status: AnalysisStatus,
  message: z.string().max(600).optional(),
  intent: z.object({
    metric: z.string().optional(),
    operation: z.enum(["compare", "trend", "rank", "summary"]).optional(),
    geography: z.string().optional(),
    periodFrom: z.number().int().optional(),
    periodTo: z.number().int().optional(),
  }),
  datasets: z.record(IdKey, DatasetSchema),
  metrics: z.record(IdKey, MetricSchema),
  insights: z.record(IdKey, InsightSchema),
  formulas: z.record(IdKey, FormulaSchema),
  sources: z.record(IdKey, SourceSchema),
  operations: z.array(OperationSchema),
  caveats: z.array(z.string().max(400)),
  meta: z.object({
    analysisVersion: z.string(),
    computedAt: z.string(),
    datasetVersions: z.record(IdKey, z.string()),
    isSample: z.boolean(),
  }),
});

export type Column = z.infer<typeof ColumnSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type Formula = z.infer<typeof FormulaSchema>;
export type AnalyticalResult = z.infer<typeof AnalyticalResultSchema>;
export type Row = Dataset["rows"][number];
