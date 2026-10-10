import { randomUUID } from "node:crypto";
import { AnalyticalResultSchema, DISTRICT_TILES, DISTRICTS, type AnalyticalResult } from "@shared";

/**
 * ML analytical engine — Problem A (clustering), B (regression), C (forecasting).
 * Runs entirely in-process, pure TypeScript, no external ML dependencies.
 * Called by runAnalysis() as an alternative to the sample engine.
 * To activate: import { runMLAnalysis } from "./ml-engine" and call it from analyses route.
 */
export const ML_ENGINE_VERSION = "ml-engine-1.0.0";
export const ML_DATASET_VERSIONS: Record<string, string> = {
  sample_lfs: "2026.1-sample",
  sample_sector: "2026.1-sample",
};

// ─── constants ────────────────────────────────────────────────────────────────
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const LATEST = 2025;
const SECTORS = ["Agriculture", "Manufacturing", "Construction", "Trade", "ICT", "Education", "Health", "Finance", "Other"];
const FORECAST_HORIZON = 2;

// ─── deterministic sample data ────────────────────────────────────────────────
const fnv = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const r01 = (s: string) => (fnv(s) % 10000) / 10000;
const r1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function dv(district: string, key: string, year: number, lo: number, hi: number, trend = 0): number {
  const base = lo + r01(key + district) * (hi - lo);
  const noise = (r01(key + district + String(year)) - 0.5) * 0.8;
  return r1(clamp(base + trend * (year - 2019) + noise, lo, hi));
}

type DR = {
  district: string; province: string; year: number;
  employment_rate: number; unemployment_rate: number; underemployment_rate: number;
  youth_neet_rate: number; pct_agriculture: number; pct_formal: number;
  pct_secondary_plus: number; pct_tvet: number;
};

function buildDistrict(): DR[] {
  return DISTRICTS.flatMap((d) => {
    const kg = DISTRICT_TILES[d]!.province === "Kigali";
    return YEARS.map((y) => ({
      district: d, province: DISTRICT_TILES[d]!.province, year: y,
      employment_rate:      dv(d, "emp",    y, kg ? 55 : 42, kg ? 78 : 65,  0.4),
      unemployment_rate:    dv(d, "unemp",  y, kg ? 12 : 5,  kg ? 22 : 14, -0.2),
      underemployment_rate: dv(d, "under",  y, kg ? 8  : 18, kg ? 20 : 42, -0.5),
      youth_neet_rate:      dv(d, "neet",   y, kg ? 10 : 22, kg ? 25 : 48, -0.6),
      pct_agriculture:      dv(d, "agri",   y, kg ? 5  : 40, kg ? 20 : 75, -0.8),
      pct_formal:           dv(d, "formal", y, kg ? 25 : 8,  kg ? 55 : 22,  0.6),
      pct_secondary_plus:   dv(d, "sec",    y, kg ? 30 : 12, kg ? 72 : 45,  0.7),
      pct_tvet:             dv(d, "tvet",   y, 4, 18, 0.3),
    }));
  });
}

type SR = { district: string; year: number; sector: string; employment_share: number };
function buildSector(): SR[] {
  return DISTRICTS.flatMap((d) => YEARS.flatMap((y) => SECTORS.map((s) => ({
    district: d, year: y, sector: s,
    employment_share: dv(d, "sec_" + s, y, 2, 40, 0.1),
  }))));
}

// ─── math ─────────────────────────────────────────────────────────────────────
const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

function ols(X: number[][], y: number[]): number[] {
  const p = X[0]!.length + 1;
  const Xa = X.map((r) => [1, ...r]);
  const XtX = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => Xa.reduce((s, r) => s + r[i]! * r[j]!, 0)));
  const Xty = Array.from({ length: p }, (_, i) => Xa.reduce((s, r, ri) => s + r[i]! * y[ri]!, 0));
  const aug = XtX.map((row, i) => [...row, Xty[i]!]);
  for (let col = 0; col < p; col++) {
    const piv = aug.slice(col).reduce((b, r, i) => Math.abs(r[col]!) > Math.abs(aug[b + col]![col]!) ? i + col : b, col);
    [aug[col], aug[piv]] = [aug[piv]!, aug[col]!];
    const f = aug[col]![col]!;
    if (Math.abs(f) < 1e-12) continue;
    aug[col] = aug[col]!.map((v) => v / f);
    for (let r = 0; r < p; r++) {
      if (r === col) continue;
      const fac = aug[r]![col]!;
      aug[r] = aug[r]!.map((v, j) => v - fac * aug[col]![j]!);
    }
  }
  return aug.map((row) => r1(row[p]!));
}

function r2(y: number[], yp: number[]): number {
  const ym = avg(y);
  const ssR = y.reduce((s, v, i) => s + (v - yp[i]!) ** 2, 0);
  const ssT = y.reduce((s, v) => s + (v - ym) ** 2, 0);
  return ssT === 0 ? 0 : r1(1 - ssR / ssT);
}

function trend(xs: number[], ys: number[]) {
  const xm = avg(xs), ym = avg(ys);
  const ssXY = xs.reduce((s, x, i) => s + (x - xm) * (ys[i]! - ym), 0);
  const ssXX = xs.reduce((s, x) => s + (x - xm) ** 2, 0);
  const slope = ssXX ? ssXY / ssXX : 0;
  const intercept = ym - slope * xm;
  const yp = xs.map((x) => slope * x + intercept);
  return { slope: r1(slope), intercept: r1(intercept), r2: r2(ys, yp) };
}

// ─── Problem A: KMeans clustering ─────────────────────────────────────────────
const CLUSTER_FEATURES = ["underemployment_rate", "unemployment_rate", "youth_neet_rate", "pct_agriculture", "pct_formal", "pct_secondary_plus"] as const;
const CLUSTER_LABELS: Record<number, string> = {
  0: "High underutilization / rural",
  1: "Moderate underutilization / transitional",
  2: "Low underutilization / urban",
};

function kmeans(pts: number[][], k: number): number[] {
  const step = Math.floor(pts.length / k);
  let centroids = Array.from({ length: k }, (_, i) => [...pts[i * step]!]);
  let labels = new Array<number>(pts.length).fill(0);
  for (let iter = 0; iter < 100; iter++) {
    const next = pts.map((p) => {
      const d = centroids.map((c) => c.reduce((s, v, j) => s + (v - p[j]!) ** 2, 0));
      return d.indexOf(Math.min(...d));
    });
    if (next.every((v, i) => v === labels[i])) break;
    labels = next;
    for (let ci = 0; ci < k; ci++) {
      const m = pts.filter((_, i) => labels[i] === ci);
      if (m.length) centroids[ci] = m[0]!.map((_, j) => avg(m.map((r) => r[j]!)));
    }
  }
  return labels;
}

export function runClustering(question: string): AnalyticalResult {
  const data = buildDistrict().filter((r) => r.year === LATEST);
  const matrix = data.map((r) => CLUSTER_FEATURES.map((f) => r[f]));
  const mins = CLUSTER_FEATURES.map((_, j) => Math.min(...matrix.map((r) => r[j]!)));
  const maxs = CLUSTER_FEATURES.map((_, j) => Math.max(...matrix.map((r) => r[j]!)));
  const normed = matrix.map((row) => row.map((v, j) => (v - mins[j]!) / (maxs[j]! - mins[j]! + 1e-9)));

  const k = 3;
  const raw = kmeans(normed, k);
  const clusterMeans = Array.from({ length: k }, (_, ci) => avg(data.filter((_, i) => raw[i] === ci).map((r) => r.underemployment_rate)));
  const order = [...clusterMeans.map((v, i) => ({ i, v }))].sort((a, b) => b.v - a.v).map((x) => x.i);
  const labels = raw.map((l) => order.indexOf(l));

  const profileRows = Array.from({ length: k }, (_, ci) => {
    const m = data.filter((_, i) => labels[i] === ci);
    return { cluster: ci, label: CLUSTER_LABELS[ci]!, district_count: m.length,
      ...Object.fromEntries(CLUSTER_FEATURES.map((f) => [f, r1(avg(m.map((r) => r[f])))])) };
  });
  const districtRows = data.map((r, i) => ({
    district: r.district, province: r.province, cluster_label: CLUSTER_LABELS[labels[i]!]!,
    underemployment_rate: r.underemployment_rate, youth_neet_rate: r.youth_neet_rate, pct_formal: r.pct_formal,
  }));
  const highDistricts = data.filter((_, i) => labels[i] === 0).map((r) => r.district);

  return AnalyticalResultSchema.parse({
    id: randomUUID(), question, status: "ok",
    intent: { metric: "underutilization_cluster", operation: "compare", periodFrom: LATEST, periodTo: LATEST },
    datasets: {
      cluster_profiles: {
        label: `Underutilization cluster profiles, ${LATEST}`,
        columns: [
          { key: "cluster", label: "Cluster ID", kind: "number" },
          { key: "label", label: "Profile", kind: "category" },
          { key: "district_count", label: "Districts", kind: "number" },
          { key: "underemployment_rate", label: "Underemployment (%)", kind: "percent", unit: "%" },
          { key: "unemployment_rate", label: "Unemployment (%)", kind: "percent", unit: "%" },
          { key: "youth_neet_rate", label: "Youth NEET (%)", kind: "percent", unit: "%" },
          { key: "pct_agriculture", label: "Agriculture share (%)", kind: "percent", unit: "%" },
          { key: "pct_formal", label: "Formal employment (%)", kind: "percent", unit: "%" },
          { key: "pct_secondary_plus", label: "Secondary+ education (%)", kind: "percent", unit: "%" },
        ],
        rows: profileRows, sourceIds: ["sample_lfs"],
      },
      district_clusters: {
        label: `District cluster assignments, ${LATEST}`,
        columns: [
          { key: "district", label: "District", kind: "geo" },
          { key: "province", label: "Province", kind: "category" },
          { key: "cluster_label", label: "Cluster", kind: "category" },
          { key: "underemployment_rate", label: "Underemployment (%)", kind: "percent", unit: "%" },
          { key: "youth_neet_rate", label: "Youth NEET (%)", kind: "percent", unit: "%" },
          { key: "pct_formal", label: "Formal employment (%)", kind: "percent", unit: "%" },
        ],
        rows: districtRows, sourceIds: ["sample_lfs"],
      },
    },
    metrics: {
      k_clusters: { label: "Clusters identified", value: k, unit: "", decimals: 0, sourceIds: ["sample_lfs"] },
      high_underutil_count: { label: "Districts in highest underutilization cluster", value: highDistricts.length, unit: "", decimals: 0, sourceIds: ["sample_lfs"] },
    },
    insights: {
      cluster_summary: {
        text: `KMeans (k=3) on ${LATEST} district data identified 3 labour underutilization profiles. ${highDistricts.length} districts fall in the highest underutilization cluster: ${highDistricts.slice(0, 5).join(", ")}${highDistricts.length > 5 ? "…" : ""}.`,
        evidence: ["datasets.cluster_profiles", "datasets.district_clusters"],
      },
    },
    formulas: {},
    sources: { sample_lfs: { publisher: "Isesengura sample generator", title: "Sample LFS-structure data", period: `2019–${LATEST}`, isSample: true } },
    operations: [
      { id: "build_data", description: `Generated sample district data for ${LATEST} (${DISTRICTS.length} districts).` },
      { id: "normalise", description: `Min-max normalised ${CLUSTER_FEATURES.length} features.` },
      { id: "kmeans", description: "Applied KMeans (k=3) to identify underutilization clusters." },
    ],
    caveats: [
      "SAMPLE DATA: values are generated for product development and are not NISR statistics.",
      "KMeans cluster labels are assigned by mean underemployment rate; interpret profiles, not cluster IDs.",
      "Correlation does not imply causation.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { sample_lfs: ML_DATASET_VERSIONS.sample_lfs! }, isSample: true },
  });
}

// ─── Problem B: OLS regression — youth NEET predictors ───────────────────────
const REG_FEATURES = ["pct_agriculture", "pct_formal", "pct_secondary_plus", "pct_tvet", "unemployment_rate"] as const;
const REG_LABELS: Record<string, string> = {
  pct_agriculture: "Agriculture share", pct_formal: "Formal employment",
  pct_secondary_plus: "Secondary+ education", pct_tvet: "TVET share", unemployment_rate: "Unemployment rate",
};

export function runRegression(question: string): AnalyticalResult {
  const data = buildDistrict().filter((r) => r.year === LATEST);
  const X = data.map((r) => REG_FEATURES.map((f) => r[f]));
  const y = data.map((r) => r.youth_neet_rate);
  const [intercept, ...coefs] = ols(X, y);
  const yp = data.map((_, i) => r1(intercept! + coefs.reduce((s, c, j) => s + c * X[i]![j]!, 0)));
  const score = r2(y, yp);
  const totalAbs = coefs.reduce((s, c) => s + Math.abs(c), 0) || 1;

  const coefRows = REG_FEATURES.map((f, i) => ({
    feature: REG_LABELS[f]!, coefficient: coefs[i]!,
    importance_pct: r1((Math.abs(coefs[i]!) / totalAbs) * 100),
    direction: coefs[i]! > 0 ? "increases NEET" : "decreases NEET",
  })).sort((a, b) => b.importance_pct - a.importance_pct);

  const predRows = data.map((r, i) => ({
    district: r.district, province: r.province,
    actual_neet: r.youth_neet_rate, predicted_neet: yp[i]!, residual: r1(r.youth_neet_rate - yp[i]!),
  }));

  return AnalyticalResultSchema.parse({
    id: randomUUID(), question, status: "ok",
    intent: { metric: "youth_neet_rate", operation: "summary", periodFrom: LATEST, periodTo: LATEST },
    datasets: {
      feature_importance: {
        label: `OLS regression — predictors of youth NEET rate, ${LATEST}`,
        columns: [
          { key: "feature", label: "Feature", kind: "category" },
          { key: "coefficient", label: "Coefficient", kind: "number" },
          { key: "importance_pct", label: "Relative importance (%)", kind: "percent", unit: "%" },
          { key: "direction", label: "Direction", kind: "category" },
        ],
        rows: coefRows, sourceIds: ["sample_lfs"],
      },
      predictions: {
        label: `Actual vs predicted youth NEET rate by district, ${LATEST}`,
        columns: [
          { key: "district", label: "District", kind: "geo" },
          { key: "province", label: "Province", kind: "category" },
          { key: "actual_neet", label: "Actual NEET (%)", kind: "percent", unit: "%" },
          { key: "predicted_neet", label: "Predicted NEET (%)", kind: "percent", unit: "%" },
          { key: "residual", label: "Residual (pp)", kind: "number", unit: "pp" },
        ],
        rows: predRows, sourceIds: ["sample_lfs"],
      },
    },
    metrics: {
      r_squared: { label: "Model R²", value: score, unit: "", decimals: 3, sourceIds: ["sample_lfs"] },
      intercept: { label: "Intercept", value: intercept!, unit: "%", decimals: 2, sourceIds: ["sample_lfs"] },
    },
    insights: {
      model_fit: {
        text: `OLS regression on ${LATEST} district data explains ${r1(score * 100)}% of variance in youth NEET rate (R²=${score}).`,
        evidence: ["datasets.feature_importance"],
      },
      top_predictor: {
        text: `The variable most associated with youth NEET rate is ${coefRows[0]!.feature} (relative importance ${coefRows[0]!.importance_pct}%). This is a statistical association, not a causal claim.`,
        evidence: ["datasets.feature_importance"],
      },
    },
    formulas: {
      ols: {
        label: "OLS regression equation",
        expression: "NEET = β₀ + β₁·agri + β₂·formal + β₃·secondary + β₄·tvet + β₅·unemp",
        description: "Ordinary least squares fit to district-level data for the latest survey year.",
        inputs: { intercept: intercept!, ...Object.fromEntries(REG_FEATURES.map((f, i) => [f, coefs[i]!])) },
        value: score, unit: "R²", decimals: 3,
      },
    },
    sources: { sample_lfs: { publisher: "Isesengura sample generator", title: "Sample LFS-structure data", period: `2019–${LATEST}`, isSample: true } },
    operations: [
      { id: "build_data", description: `Loaded ${data.length} district observations for ${LATEST}.` },
      { id: "ols_fit", description: `Fitted OLS regression: target=youth_neet_rate, features=${REG_FEATURES.join(", ")}.` },
      { id: "importance", description: "Computed relative feature importance as |coef|/sum(|coef|)." },
    ],
    caveats: [
      "SAMPLE DATA: values are generated for product development and are not NISR statistics.",
      "OLS assumes linear relationships; district n=30 is small.",
      "Coefficients show association, not causation.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { sample_lfs: ML_DATASET_VERSIONS.sample_lfs! }, isSample: true },
  });
}

// ─── Problem C: Linear trend forecasting by sector ────────────────────────────
export function runForecasting(question: string): AnalyticalResult {
  const data = buildSector();
  const forecastYrs = Array.from({ length: FORECAST_HORIZON }, (_, i) => LATEST + i + 1);

  const nat: Record<string, Record<number, number>> = {};
  for (const sec of SECTORS) {
    nat[sec] = {};
    for (const yr of YEARS) {
      const vals = data.filter((r) => r.sector === sec && r.year === yr).map((r) => r.employment_share);
      nat[sec]![yr] = r1(avg(vals));
    }
  }

  const trendRows: object[] = [], forecastRows: object[] = [];
  const rankRows: { sector: string; slope: number; r2: number }[] = [];

  for (const sec of SECTORS) {
    const ys = YEARS.map((y) => nat[sec]![y]!);
    const { slope, intercept, r2: tr2 } = trend(YEARS, ys);
    rankRows.push({ sector: sec, slope, r2: tr2 });
    for (const yr of YEARS) trendRows.push({ sector: sec, year: String(yr), actual_share: nat[sec]![yr]!, trend_share: r1(slope * yr + intercept) });
    for (const yr of forecastYrs) forecastRows.push({ sector: sec, year: String(yr), projected_share: Math.max(0, r1(slope * yr + intercept)), trend_slope: slope, r2: tr2 });
  }
  rankRows.sort((a, b) => b.slope - a.slope);
  const growing = rankRows.filter((r) => r.slope > 0);

  return AnalyticalResultSchema.parse({
    id: randomUUID(), question, status: "ok",
    intent: { metric: "employment_share", operation: "trend", periodFrom: YEARS[0], periodTo: LATEST + FORECAST_HORIZON },
    datasets: {
      sector_trends: {
        label: `National employment share by sector, ${YEARS[0]}–${LATEST}`,
        columns: [
          { key: "sector", label: "Sector", kind: "category" },
          { key: "year", label: "Year", kind: "time" },
          { key: "actual_share", label: "Actual share (%)", kind: "percent", unit: "%" },
          { key: "trend_share", label: "Trend (fitted)", kind: "percent", unit: "%" },
        ],
        rows: trendRows, sourceIds: ["sample_sector"],
      },
      sector_forecast: {
        label: `Projected employment share by sector, ${forecastYrs[0]}–${forecastYrs[forecastYrs.length - 1]}`,
        columns: [
          { key: "sector", label: "Sector", kind: "category" },
          { key: "year", label: "Year", kind: "time" },
          { key: "projected_share", label: "Projected share (%)", kind: "percent", unit: "%" },
          { key: "trend_slope", label: "Annual trend (pp/yr)", kind: "number", unit: "pp" },
          { key: "r2", label: "Trend R²", kind: "number" },
        ],
        rows: forecastRows, sourceIds: ["sample_sector"],
      },
      sector_ranking: {
        label: `Sector growth ranking by trend slope, ${YEARS[0]}–${LATEST}`,
        columns: [
          { key: "sector", label: "Sector", kind: "category" },
          { key: "slope", label: "Trend slope (pp/yr)", kind: "number", unit: "pp" },
          { key: "r2", label: "Trend R²", kind: "number" },
        ],
        rows: rankRows, sourceIds: ["sample_sector"],
      },
    },
    metrics: {
      growing_sectors: { label: "Sectors with positive trend", value: growing.length, unit: "", decimals: 0, sourceIds: ["sample_sector"] },
      top_growth_slope: { label: "Fastest growing sector (pp/yr)", value: rankRows[0]!.slope, unit: "pp/yr", decimals: 2, sourceIds: ["sample_sector"] },
    },
    insights: {
      growth_leaders: {
        text: `${growing.length} of ${SECTORS.length} sectors show a positive employment share trend. Fastest growing: ${rankRows.slice(0, 3).map((r) => r.sector).join(", ")}.`,
        evidence: ["datasets.sector_ranking"],
      },
      forecast_caveat: {
        text: `Linear projections to ${LATEST + FORECAST_HORIZON} assume historical trends continue. These are estimates, not predictions. Treat as directional signals only.`,
        evidence: ["datasets.sector_forecast"],
      },
    },
    formulas: {
      linear_trend: {
        label: "Linear trend model",
        expression: "share(t) = slope × t + intercept",
        description: "OLS fit of employment share on year for each sector using national district means.",
        inputs: { forecast_horizon_years: FORECAST_HORIZON },
        value: FORECAST_HORIZON, unit: "years", decimals: 0,
      },
    },
    sources: { sample_sector: { publisher: "Isesengura sample generator", title: "Sample sector employment data", period: `${YEARS[0]}–${LATEST}`, isSample: true } },
    operations: [
      { id: "aggregate", description: "Aggregated district sector shares to national means." },
      { id: "trend_fit", description: `Fitted linear OLS trend per sector over ${YEARS.length} years.` },
      { id: "forecast", description: `Extrapolated trend ${FORECAST_HORIZON} years beyond ${LATEST}.` },
    ],
    caveats: [
      "SAMPLE DATA: values are generated for product development and are not NISR statistics.",
      `Linear extrapolation ${FORECAST_HORIZON} years forward. Structural breaks and policy changes are not modelled.`,
      "Employment share projections do not account for population growth or total employment volume.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { sample_sector: ML_DATASET_VERSIONS.sample_sector! }, isSample: true },
  });
}

// ─── public entry point ───────────────────────────────────────────────────────
export function runMLAnalysis(question: string): AnalyticalResult {
  const q = question.trim().toLowerCase();
  if (q.split(/\s+/).length < 3) {
    return AnalyticalResultSchema.parse({
      id: randomUUID(), question, status: "ambiguous",
      message: "Question too short. Try: 'cluster districts by underutilization', 'what predicts youth NEET rate', or 'employment trend by sector'.",
      intent: {}, datasets: {}, metrics: {}, insights: {}, formulas: {}, sources: {}, operations: [], caveats: [],
      meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: {}, isSample: true },
    });
  }
  if (/neet|predict|factor|associat|regression/.test(q)) return runRegression(question);
  if (/trend|forecast|sector|over time|grow/.test(q)) return runForecasting(question);
  return runClustering(question);
}
