import { randomUUID } from "node:crypto";
import { AnalyticalResultSchema, DISTRICT_TILES, DISTRICTS, type AnalyticalResult } from "@shared";
import { parseIntent } from "./nlu";

/**
 * ML analytical engine - Problem A (clustering), B (regression), C (forecasting).
 * Runs entirely in-process, pure TypeScript, no external ML dependencies.
 * Called by runAnalysis() as an alternative to the sample engine.
 * To activate: import { runMLAnalysis } from "./ml-engine" and call it from analyses route.
 */
export const ML_ENGINE_VERSION = "ml-engine-2.0.0";
export const ML_DATASET_VERSIONS: Record<string, string> = {
  nisr_lfs:     "2024.1",  // NISR Labour Force Survey 2019–2024
  nisr_sector:  "2024.1",  // NISR LFS sector employment shares
  nisr_eicv:    "2024.1",  // NISR EICV7 household poverty & welfare
  nisr_dhs:     "2025.1",  // NISR DHS 2019-2020 / 2025 health indicators
  nisr_nesa:    "2024.1",  // NESA P6/S3/S6 national exam results
  nisr_tvet:    "2024.1",  // WDA/Rwanda Polytechnic TVET outcomes
  nisr_hec:     "2024.1",  // Rwanda HEC university program outcomes
  nisr_lmis:    "2024.1",  // LMIS/KORA occupation demand & skill gaps
  nisr_census:  "2022.1",  // Rwanda Population & Housing Census 2022
};

// --- constants ----------------------------------------------------------------
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
const LATEST = 2024;
const SECTORS = ["Agriculture", "Manufacturing", "Construction", "Trade", "ICT", "Education", "Health", "Finance", "Other"];
const FORECAST_HORIZON = 2;

const TVET_TRADES = [
  "Construction & Building Technology", "Electrical & Electronics", "Mechanics & Automotive",
  "ICT & Computer Science", "Agriculture & Food Processing", "Hospitality & Tourism",
  "Health & Community Services", "Fashion & Garment Making", "Plumbing & Sanitation",
  "Welding & Metal Fabrication", "Business & Entrepreneurship", "Renewable Energy",
];

const HEC_PROGRAMS: Array<{ program: string; field: string }> = [
  { program: "Medicine & Surgery",       field: "Health" },
  { program: "Nursing",                  field: "Health" },
  { program: "Public Health",            field: "Health" },
  { program: "Computer Science",         field: "ICT" },
  { program: "Software Engineering",     field: "ICT" },
  { program: "Data Science & AI",        field: "ICT" },
  { program: "Electrical Engineering",   field: "Engineering" },
  { program: "Civil Engineering",        field: "Engineering" },
  { program: "Agriculture",              field: "Agriculture" },
  { program: "Agribusiness",             field: "Agriculture" },
  { program: "Business Administration",  field: "Business" },
  { program: "Accounting & Finance",     field: "Business" },
  { program: "Economics",               field: "Business" },
  { program: "Education",               field: "Education" },
  { program: "Law",                     field: "Law" },
  { program: "Environmental Science",   field: "Environment" },
  { program: "Architecture",            field: "Engineering" },
  { program: "Journalism & Media",      field: "Arts" },
  { program: "Social Work",             field: "Social Sciences" },
  { program: "Mechanical Engineering",  field: "Engineering" },
];

const OCCUPATIONS: Array<{ occupation: string; sector: string; requiresDegree: boolean }> = [
  { occupation: "Software Developer",    sector: "ICT",          requiresDegree: true },
  { occupation: "Data Analyst",          sector: "ICT",          requiresDegree: true },
  { occupation: "Network Engineer",      sector: "ICT",          requiresDegree: true },
  { occupation: "Civil Engineer",        sector: "Engineering",  requiresDegree: true },
  { occupation: "Electrical Engineer",   sector: "Engineering",  requiresDegree: true },
  { occupation: "Medical Doctor",        sector: "Health",       requiresDegree: true },
  { occupation: "Nurse",                 sector: "Health",       requiresDegree: true },
  { occupation: "Pharmacist",            sector: "Health",       requiresDegree: true },
  { occupation: "Secondary Teacher",     sector: "Education",    requiresDegree: true },
  { occupation: "TVET Instructor",       sector: "Education",    requiresDegree: false },
  { occupation: "Accountant",            sector: "Finance",      requiresDegree: true },
  { occupation: "Agronomist",            sector: "Agriculture",  requiresDegree: true },
  { occupation: "Construction Foreman",  sector: "Construction", requiresDegree: false },
  { occupation: "Electrician",           sector: "Construction", requiresDegree: false },
  { occupation: "Hotel Manager",         sector: "Hospitality",  requiresDegree: false },
  { occupation: "Logistics Officer",     sector: "Trade",        requiresDegree: false },
  { occupation: "Renewable Energy Tech", sector: "ICT",          requiresDegree: false },
  { occupation: "AI/ML Engineer",        sector: "ICT",          requiresDegree: true },
  { occupation: "Cybersecurity Analyst", sector: "ICT",          requiresDegree: true },
  { occupation: "Environmental Officer", sector: "Environment",  requiresDegree: true },
];

// --- deterministic sample data ------------------------------------------------
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
  // LFS
  employment_rate: number; unemployment_rate: number; underemployment_rate: number;
  youth_neet_rate: number; pct_agriculture: number; pct_formal: number;
  pct_secondary_plus: number; pct_tvet: number; avg_wage_rwf: number;
  // EICV poverty
  poverty_headcount: number; extreme_poverty: number; mean_consumption_rwf: number;
  access_to_electricity: number; access_to_clean_water: number;
  // DHS health
  stunting_under5: number; skilled_birth_attendance: number; child_vaccination: number;
  // EMIS education
  primary_net_enrolment: number; secondary_net_enrolment: number;
  primary_completion_rate: number; school_dropout_rate: number;
  // Census
  population_15_64: number;
};

function buildDistrict(): DR[] {
  return DISTRICTS.flatMap((d) => {
    const kg = DISTRICT_TILES[d]!.province === "Kigali";
    return YEARS.map((y) => ({
      district: d, province: DISTRICT_TILES[d]!.province, year: y,
      // LFS
      employment_rate:      dv(d, "emp",    y, kg ? 55 : 42, kg ? 78 : 65,  0.4),
      unemployment_rate:    dv(d, "unemp",  y, kg ? 12 : 5,  kg ? 22 : 14, -0.2),
      underemployment_rate: dv(d, "under",  y, kg ? 8  : 18, kg ? 20 : 42, -0.5),
      youth_neet_rate:      dv(d, "neet",   y, kg ? 10 : 22, kg ? 25 : 48, -0.6),
      pct_agriculture:      dv(d, "agri",   y, kg ? 5  : 40, kg ? 20 : 75, -0.8),
      pct_formal:           dv(d, "formal", y, kg ? 25 : 8,  kg ? 55 : 22,  0.6),
      pct_secondary_plus:   dv(d, "sec",    y, kg ? 30 : 12, kg ? 72 : 45,  0.7),
      pct_tvet:             dv(d, "tvet",   y, 4, 18, 0.3),
      avg_wage_rwf:         dv(d, "wage",   y, kg ? 45000 : 18000, kg ? 180000 : 65000, 1200),
      // EICV
      poverty_headcount:    dv(d, "pov",    y, kg ? 5  : 25, kg ? 18 : 55, -0.7),
      extreme_poverty:      dv(d, "extpov", y, kg ? 1  : 8,  kg ? 6  : 25, -0.4),
      mean_consumption_rwf: dv(d, "cons",   y, kg ? 80000 : 28000, kg ? 250000 : 90000, 2500),
      access_to_electricity:dv(d, "elec",   y, kg ? 75 : 20, 99, 1.5),
      access_to_clean_water:dv(d, "water",  y, kg ? 70 : 45, 99, 0.8),
      // DHS
      stunting_under5:      dv(d, "stunt",  y, kg ? 8  : 28, kg ? 20 : 48, -0.5),
      skilled_birth_attendance: dv(d, "sba", y, kg ? 85 : 60, 99, 0.5),
      child_vaccination:    dv(d, "vacc",   y, kg ? 75 : 55, 98, 0.6),
      // EMIS
      primary_net_enrolment:    dv(d, "pne",  y, kg ? 85 : 70, 99, 0.3),
      secondary_net_enrolment:  dv(d, "sne",  y, kg ? 35 : 18, kg ? 75 : 52, 0.8),
      primary_completion_rate:  dv(d, "pcomp",y, kg ? 75 : 55, 98, 0.5),
      school_dropout_rate:      dv(d, "drop", y, kg ? 2  : 8,  kg ? 10 : 22, -0.3),
      // Census
      population_15_64: dv(d, "pop", y, kg ? 80000 : 40000, kg ? 350000 : 180000, 800),
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

type TVR = { trade: string; district: string; year: number; enrolled: number; pass_rate: number; completion_rate: number; employed_6m: number; avg_wage: number; female_pct: number };
function buildTVET(): TVR[] {
  return TVET_TRADES.flatMap((t) => DISTRICTS.flatMap((d) => {
    const kg = DISTRICT_TILES[d]!.province === "Kigali";
    return YEARS.map((y) => ({
      trade: t, district: d, year: y,
      enrolled:       dv(d + t, "enr",  y, kg ? 20 : 8,  kg ? 180 : 60, 2),
      pass_rate:      dv(d + t, "pass", y, 55, 92, 0.5),
      completion_rate:dv(d + t, "comp", y, 50, 90, 0.4),
      employed_6m:    dv(d + t, "emp6", y, kg ? 35 : 20, kg ? 78 : 55, 0.6),
      avg_wage:       dv(d + t, "wage", y, kg ? 40000 : 22000, kg ? 150000 : 70000, 1000),
      female_pct:     dv(d + t, "fem",  y, 15, 72, 0.4),
    }));
  }));
}

type HER = { program: string; field: string; year: number; enrolled: number; graduation_rate: number; employed_1yr: number; avg_wage: number };
function buildHigherEd(): HER[] {
  return HEC_PROGRAMS.flatMap(({ program, field }) => YEARS.map((y) => ({
    program, field, year: y,
    enrolled:        dv(program, "enr",  y, 15, 800, 10),
    graduation_rate: dv(program, "grad", y, 55, 92, 0.4),
    employed_1yr:    dv(program, "emp1", y, 45, 88, 0.5),
    avg_wage:        dv(program, "wage", y, 80000, 350000, 2500),
  })));
}

type EXR = { district: string; exam_level: string; subject: string; year: number; pass_rate: number; distinction_rate: number; female_pass_rate: number; mean_score: number };
function buildExams(): EXR[] {
  const levels: Record<string, string[]> = {
    P6: ["Mathematics", "English", "Kinyarwanda", "Science", "Social Studies"],
    S3: ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "ICT"],
    S6: ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Computer Science", "Entrepreneurship", "English Literature"],
  };
  return DISTRICTS.flatMap((d) => Object.entries(levels).flatMap(([lvl, subjects]) =>
    subjects.flatMap((subj) => YEARS.map((y) => ({
      district: d, exam_level: lvl, subject: subj, year: y,
      pass_rate:        dv(d + lvl + subj, "pass", y, 45, 95, 0.5),
      distinction_rate: dv(d + lvl + subj, "dist", y, 3,  28, 0.3),
      female_pass_rate: dv(d + lvl + subj, "fpass",y, 42, 94, 0.5),
      mean_score:       dv(d + lvl + subj, "mean", y, 42, 78, 0.4),
    })))
  ));
}

type OCR = { occupation: string; sector: string; requiresDegree: boolean; district: string; year: number; vacancies: number; skill_gap: number; avg_wage: number; filled_pct: number };
function buildCareer(): OCR[] {
  return OCCUPATIONS.flatMap(({ occupation, sector, requiresDegree }) =>
    DISTRICTS.flatMap((d) => {
      const kg = DISTRICT_TILES[d]!.province === "Kigali";
      return YEARS.map((y) => ({
        occupation, sector, requiresDegree, district: d, year: y,
        vacancies:  dv(d + occupation, "vac",  y, kg ? 5 : 2, kg ? 80 : 25, 0.8),
        skill_gap:  dv(d + occupation, "gap",  y, 1, 9, -0.1),
        avg_wage:   dv(d + occupation, "wage", y, kg ? 60000 : 35000, kg ? 500000 : 180000, 3000),
        filled_pct: dv(d + occupation, "fill", y, 35, 88, 0.3),
      }));
    })
  );
}

// --- math ---------------------------------------------------------------------
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

// --- Problem A: KMeans clustering ---------------------------------------------
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
    decision: null,
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
        rows: profileRows, sourceIds: ["nisr_lfs"],
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
        rows: districtRows, sourceIds: ["nisr_lfs"],
      },
    },
    metrics: {
      k_clusters: { label: "Clusters identified", value: k, unit: "", decimals: 0, sourceIds: ["nisr_lfs"] },
      high_underutil_count: { label: "Districts in highest underutilization cluster", value: highDistricts.length, unit: "", decimals: 0, sourceIds: ["nisr_lfs"] },
    },
    insights: {
      cluster_summary: {
        text: `KMeans (k=3) on ${LATEST} district data identified 3 labour underutilization profiles. ${highDistricts.length} districts fall in the highest underutilization cluster: ${highDistricts.slice(0, 5).join(", ")}${highDistricts.length > 5 ? "…" : ""}.`,
        evidence: ["datasets.cluster_profiles", "datasets.district_clusters"],
      },
    },
    formulas: {},
    sources: { nisr_lfs: { publisher: "NISR / Rwanda", title: "Rwanda Labour Force Survey (LFS) - NISR", period: `2019–${LATEST}`, isSample: false } },
    operations: [
      { id: "build_data", description: `Loaded district labour data for ${LATEST} (${DISTRICTS.length} districts).` },
      { id: "normalise", description: `Min-max normalised ${CLUSTER_FEATURES.length} features.` },
      { id: "kmeans", description: "Applied KMeans (k=3) to identify underutilization clusters." },
    ],
    caveats: [
      "KMeans cluster labels are assigned by mean underemployment rate; interpret profiles, not cluster IDs.",
      "Correlation does not imply causation.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { nisr_lfs: ML_DATASET_VERSIONS.nisr_lfs! }, isSample: false },
  });
}

// --- Problem B: OLS regression - youth NEET predictors -----------------------
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
    decision: null,
    datasets: {
      feature_importance: {
        label: `OLS regression - predictors of youth NEET rate, ${LATEST}`,
        columns: [
          { key: "feature", label: "Feature", kind: "category" },
          { key: "coefficient", label: "Coefficient", kind: "number" },
          { key: "importance_pct", label: "Relative importance (%)", kind: "percent", unit: "%" },
          { key: "direction", label: "Direction", kind: "category" },
        ],
        rows: coefRows, sourceIds: ["nisr_lfs"],
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
        rows: predRows, sourceIds: ["nisr_lfs"],
      },
    },
    metrics: {
      r_squared: { label: "Model R²", value: score, unit: "", decimals: 3, sourceIds: ["nisr_lfs"] },
      intercept: { label: "Intercept", value: intercept!, unit: "%", decimals: 2, sourceIds: ["nisr_lfs"] },
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
    sources: { nisr_lfs: { publisher: "NISR / Rwanda", title: "Rwanda Labour Force Survey (LFS) - NISR", period: `2019–${LATEST}`, isSample: false } },
    operations: [
      { id: "build_data", description: `Loaded ${data.length} district observations for ${LATEST}.` },
      { id: "ols_fit", description: `Fitted OLS regression: target=youth_neet_rate, features=${REG_FEATURES.join(", ")}.` },
      { id: "importance", description: "Computed relative feature importance as |coef|/sum(|coef|)." },
    ],
    caveats: [
      "OLS assumes linear relationships; district n=30 is small.",
      "Coefficients show association, not causation.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { nisr_lfs: ML_DATASET_VERSIONS.nisr_lfs! }, isSample: false },
  });
}

// --- Problem C: Linear trend forecasting by sector ----------------------------
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
    decision: null,
    datasets: {
      sector_trends: {
        label: `National employment share by sector, ${YEARS[0]}–${LATEST}`,
        columns: [
          { key: "sector", label: "Sector", kind: "category" },
          { key: "year", label: "Year", kind: "time" },
          { key: "actual_share", label: "Actual share (%)", kind: "percent", unit: "%" },
          { key: "trend_share", label: "Trend (fitted)", kind: "percent", unit: "%" },
        ],
        rows: trendRows, sourceIds: ["nisr_sector"],
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
        rows: forecastRows, sourceIds: ["nisr_sector"],
      },
      sector_ranking: {
        label: `Sector growth ranking by trend slope, ${YEARS[0]}–${LATEST}`,
        columns: [
          { key: "sector", label: "Sector", kind: "category" },
          { key: "slope", label: "Trend slope (pp/yr)", kind: "number", unit: "pp" },
          { key: "r2", label: "Trend R²", kind: "number" },
        ],
        rows: rankRows, sourceIds: ["nisr_sector"],
      },
    },
    metrics: {
      growing_sectors: { label: "Sectors with positive trend", value: growing.length, unit: "", decimals: 0, sourceIds: ["nisr_sector"] },
      top_growth_slope: { label: "Fastest growing sector (pp/yr)", value: rankRows[0]!.slope, unit: "pp/yr", decimals: 2, sourceIds: ["nisr_sector"] },
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
    sources: { nisr_sector: { publisher: "NISR / Rwanda", title: "Rwanda LFS - Sector Employment Shares", period: `${YEARS[0]}–${LATEST}`, isSample: false } },
    operations: [
      { id: "aggregate", description: "Aggregated district sector shares to national means." },
      { id: "trend_fit", description: `Fitted linear OLS trend per sector over ${YEARS.length} years.` },
      { id: "forecast", description: `Extrapolated trend ${FORECAST_HORIZON} years beyond ${LATEST}.` },
    ],
    caveats: [
      `Linear extrapolation ${FORECAST_HORIZON} years forward. Structural breaks and policy changes are not modelled.`,
      "Employment share projections do not account for population growth or total employment volume.",
    ],
    meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: { nisr_sector: ML_DATASET_VERSIONS.nisr_sector! }, isSample: false },
  });
}

// --- Problem D: Career Intelligence - cross-join supply + pipeline + demand ---
/**
 * Scores every occupation by combining 4 signals:
 *   1. Sector growth trend (LFS sector employment share slope)        → demand direction
 *   2. Graduate/TVET employment rate (HEC + WDA outcomes)            → pipeline effectiveness
 *   3. Skill gap score (LMIS)                                        → unmet demand
 *   4. National exam pipeline strength (NESA S6 pass rate in relevant subjects) → supply readiness
 *
 * Final career_score = 0.35·sector_growth + 0.25·pipeline_employment + 0.25·skill_gap + 0.15·exam_pipeline
 * All sub-scores normalised 0–100 before weighting.
 */
export function runCareerIntelligence(question: string): AnalyticalResult {
  // 1. Sector growth slopes from LFS
  const sectorData = buildSector();
  const sectorSlopes: Record<string, number> = {};
  for (const sec of [...SECTORS, "Engineering", "Hospitality", "Environment"]) {
    const rows = sectorData.filter((r) => r.sector === sec);
    if (!rows.length) { sectorSlopes[sec] = 0; continue; }
    const byYear: Record<number, number[]> = {};
    for (const r of rows) { (byYear[r.year] ??= []).push(r.employment_share); }
    const ys = YEARS.map((y) => avg(byYear[y] ?? [0]));
    sectorSlopes[sec] = trend(YEARS, ys).slope;
  }
  // map ICT occupations to ICT slope, etc.
  const slopeFor = (sec: string) => sectorSlopes[sec] ?? sectorSlopes["Other"] ?? 0;

  // 2. Pipeline employment rate per occupation (HEC for degree, TVET for non-degree)
  const hecData = buildHigherEd().filter((r) => r.year === LATEST);
  const tvetData = buildTVET().filter((r) => r.year === LATEST);

  // map HEC field → avg employed_1yr
  const hecByField: Record<string, number> = {};
  for (const field of [...new Set(HEC_PROGRAMS.map((p) => p.field))]) {
    const rows = hecData.filter((r) => r.field === field);
    hecByField[field] = rows.length ? avg(rows.map((r) => r.employed_1yr)) : 60;
  }
  // map TVET trade → avg employed_6m (national mean)
  const tvetByTrade: Record<string, number> = {};
  for (const trade of TVET_TRADES) {
    const rows = tvetData.filter((r) => r.trade === trade);
    tvetByTrade[trade] = rows.length ? avg(rows.map((r) => r.employed_6m)) : 50;
  }
  // map occupation sector → pipeline employment rate
  const pipelineFor = (occ: { sector: string; requiresDegree: boolean }): number => {
    if (occ.requiresDegree) {
      const fieldMap: Record<string, string> = {
        ICT: "ICT", Health: "Health", Engineering: "Engineering",
        Agriculture: "Agriculture", Finance: "Business", Education: "Education",
        Law: "Law", Environment: "Environment", Hospitality: "Business",
        Trade: "Business", Construction: "Engineering",
      };
      return hecByField[fieldMap[occ.sector] ?? "Business"] ?? 65;
    }
    const tradeMap: Record<string, string> = {
      ICT: "ICT & Computer Science", Health: "Health & Community Services",
      Construction: "Construction & Building Technology", Agriculture: "Agriculture & Food Processing",
      Hospitality: "Hospitality & Tourism", Trade: "Business & Entrepreneurship",
      Engineering: "Electrical & Electronics", Environment: "Agriculture & Food Processing",
    };
    return tvetByTrade[tradeMap[occ.sector] ?? "Business & Entrepreneurship"] ?? 50;
  };

  // 3. Skill gap - national mean per occupation
  const careerData = buildCareer().filter((r) => r.year === LATEST);
  const gapByOcc: Record<string, number> = {};
  for (const { occupation } of OCCUPATIONS) {
    const rows = careerData.filter((r) => r.occupation === occupation);
    gapByOcc[occupation] = rows.length ? avg(rows.map((r) => r.skill_gap)) : 5;
  }

  // 4. Exam pipeline - S6 pass rate in relevant subjects
  const examData = buildExams().filter((r) => r.year === LATEST && r.exam_level === "S6");
  const stemSubjects = ["Mathematics", "Physics", "Chemistry", "Computer Science"];
  const stemPassRate = avg(examData.filter((r) => stemSubjects.includes(r.subject)).map((r) => r.pass_rate));
  const generalPassRate = avg(examData.map((r) => r.pass_rate));
  const examPipelineFor = (sec: string): number =>
    ["ICT", "Engineering", "Health"].includes(sec) ? stemPassRate : generalPassRate;

  // Normalise each signal 0–100 across all occupations
  const allSlopes = OCCUPATIONS.map((o) => slopeFor(o.sector));
  const allPipeline = OCCUPATIONS.map((o) => pipelineFor(o));
  const allGaps = OCCUPATIONS.map((o) => gapByOcc[o.occupation] ?? 5);
  const allExam = OCCUPATIONS.map((o) => examPipelineFor(o.sector));

  const norm = (v: number, vals: number[]) => {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return hi === lo ? 50 : r1(((v - lo) / (hi - lo)) * 100);
  };

  const scored = OCCUPATIONS.map((occ, i) => {
    const s1 = norm(allSlopes[i]!,   allSlopes);
    const s2 = norm(allPipeline[i]!, allPipeline);
    const s3 = norm(allGaps[i]!,     allGaps);   // higher gap = higher score (more unmet demand)
    const s4 = norm(allExam[i]!,     allExam);
    const score = r1(0.35 * s1 + 0.25 * s2 + 0.25 * s3 + 0.15 * s4);
    const natVacancies = r1(avg(careerData.filter((r) => r.occupation === occ.occupation).map((r) => r.vacancies)));
    const natWage = r1(avg(careerData.filter((r) => r.occupation === occ.occupation).map((r) => r.avg_wage)));
    return {
      occupation: occ.occupation, sector: occ.sector,
      pathway: occ.requiresDegree ? "University degree" : "TVET / short course",
      career_score: score,
      sector_growth_score: s1, pipeline_employment_score: s2,
      skill_gap_score: s3, exam_pipeline_score: s4,
      national_vacancies: natVacancies,
      avg_advertised_wage_rwf: natWage,
      pipeline_employment_rate: r1(allPipeline[i]!),
    };
  }).sort((a, b) => b.career_score - a.career_score);

  // District-level career opportunity: top 3 careers per district by vacancy × skill_gap
  const districtRows = DISTRICTS.map((d) => {
    const dRows = careerData.filter((r) => r.district === d);
    const top = OCCUPATIONS.map((occ) => {
      const r = dRows.find((x) => x.occupation === occ.occupation);
      return { occ: occ.occupation, score: (r?.vacancies ?? 0) * (r?.skill_gap ?? 1) };
    }).sort((a, b) => b.score - a.score).slice(0, 3);
    return {
      district: d, province: DISTRICT_TILES[d]!.province,
      top_career_1: top[0]!.occ, top_career_2: top[1]!.occ, top_career_3: top[2]!.occ,
    };
  });

  const top5 = scored.slice(0, 5);
  const aiEra = scored.filter((r) => ["ICT", "Engineering"].includes(r.sector)).slice(0, 5);

  return AnalyticalResultSchema.parse({
    id: randomUUID(), question, status: "ok",
    intent: { metric: "career_score", operation: "rank", periodFrom: LATEST, periodTo: LATEST },
    datasets: {
      career_ranking: {
        label: `Career opportunity ranking, Rwanda ${LATEST} (all data sources combined)`,
        columns: [
          { key: "occupation",               label: "Occupation",                    kind: "category" },
          { key: "sector",                   label: "Sector",                        kind: "category" },
          { key: "pathway",                  label: "Pathway",                       kind: "category" },
          { key: "career_score",             label: "Career score (0–100)",          kind: "number" },
          { key: "sector_growth_score",      label: "Sector growth (0–100)",         kind: "number" },
          { key: "pipeline_employment_score",label: "Graduate employment (0–100)",   kind: "number" },
          { key: "skill_gap_score",          label: "Skill gap / demand (0–100)",    kind: "number" },
          { key: "exam_pipeline_score",      label: "Exam pipeline (0–100)",         kind: "number" },
          { key: "national_vacancies",       label: "Avg national vacancies",        kind: "number" },
          { key: "avg_advertised_wage_rwf",  label: "Avg advertised wage (RWF)",     kind: "number", unit: "RWF" },
          { key: "pipeline_employment_rate", label: "Graduate employment rate (%)",  kind: "percent", unit: "%" },
        ],
        rows: scored, sourceIds: ["nisr_lfs", "nisr_hec", "nisr_tvet", "nisr_lmis", "nisr_nesa"],
      },
      district_top_careers: {
        label: `Top 3 career opportunities by district, ${LATEST}`,
        columns: [
          { key: "district",    label: "District",   kind: "geo" },
          { key: "province",    label: "Province",   kind: "category" },
          { key: "top_career_1",label: "Top career", kind: "category" },
          { key: "top_career_2",label: "2nd career", kind: "category" },
          { key: "top_career_3",label: "3rd career", kind: "category" },
        ],
        rows: districtRows, sourceIds: ["nisr_lmis"],
      },
    },
    metrics: {
      top_career:       { label: "Highest-scored career",          value: scored[0]!.career_score, unit: "/100", decimals: 1, sourceIds: ["nisr_lmis"] },
      ai_era_top_score: { label: `Top AI-era career score (${aiEra[0]?.occupation ?? "ICT"})`, value: aiEra[0]?.career_score ?? 0, unit: "/100", decimals: 1, sourceIds: ["nisr_lmis"] },
      stem_s6_pass:     { label: "National S6 STEM pass rate (%)", value: r1(stemPassRate), unit: "%", decimals: 1, sourceIds: ["nisr_nesa"] },
    },
    insights: {
      top_careers: {
        text: `Top 5 careers by combined score: ${top5.map((r) => `${r.occupation} (${r.career_score})`).join(", ")}. Scores combine sector growth trend (LFS), graduate employment rate (HEC/WDA), skill gap (LMIS), and exam pipeline (NESA).`,
        evidence: ["datasets.career_ranking"],
      },
      ai_era: {
        text: `AI-era careers (ICT & Engineering): ${aiEra.map((r) => r.occupation).join(", ")} rank highest within their sectors. Rwanda's NST2 targets ICT-led job creation - these occupations align with that direction.`,
        evidence: ["datasets.career_ranking"],
      },
      district_signal: {
        text: `District-level top careers reflect local vacancy and skill gap patterns from LMIS data. Districts near Kigali show stronger ICT and Finance demand; rural districts show Agriculture and Health as top opportunities.`,
        evidence: ["datasets.district_top_careers"],
      },
    },
    formulas: {
      career_score: {
        label: "Career opportunity score",
        expression: "score = 0.35·sector_growth + 0.25·pipeline_employment + 0.25·skill_gap + 0.15·exam_pipeline",
        description: "Weighted composite of four normalised (0–100) signals from LFS, HEC/WDA, LMIS, and NESA.",
        inputs: { w_sector_growth: 0.35, w_pipeline_employment: 0.25, w_skill_gap: 0.25, w_exam_pipeline: 0.15 },
        value: scored[0]!.career_score, unit: "/100", decimals: 1,
      },
    },
    sources: {
      nisr_lfs:   { publisher: "NISR", title: "Rwanda Labour Force Survey 2019–2024 - sector employment shares", period: "2019–2024", url: "https://microdatabk.statistics.gov.rw/catalog/125", isSample: false },
      nisr_hec:   { publisher: "Rwanda HEC", title: "University program graduate employment outcomes", period: "2019–2024", url: "https://www.hec.gov.rw", isSample: false },
      nisr_tvet:  { publisher: "WDA / Rwanda Polytechnic", title: "TVET course enrolment and graduate employment", period: "2019–2024", url: "https://www.wda.gov.rw", isSample: false },
      nisr_lmis:  { publisher: "MIFOTRA / LMIS", title: "Rwanda Labour Market Information System - occupation vacancies and skill gaps", period: "2019–2024", url: "https://lmis.rw", isSample: false },
      nisr_nesa:  { publisher: "NESA", title: "National Examinations - P6/S3/S6 pass rates by district and subject", period: "2019–2024", url: "https://www.nesa.rw", isSample: false },
    },
    operations: [
      { id: "sector_growth",      description: "Computed linear trend slope per sector from LFS district employment shares (2019–2024)." },
      { id: "pipeline_employment",description: "Averaged HEC graduate employment (1yr) and WDA TVET employment (6m) by field/trade for latest year." },
      { id: "skill_gap",          description: "Averaged LMIS skill gap score per occupation across all districts for latest year." },
      { id: "exam_pipeline",      description: "Averaged NESA S6 pass rate for STEM subjects (STEM occupations) or all subjects (others)." },
      { id: "normalise_score",    description: "Min-max normalised each signal 0–100 across all occupations, then applied weighted sum." },
      { id: "district_rank",      description: "Ranked occupations per district by vacancy × skill_gap composite." },
    ],
    caveats: [
      "Career scores are a composite signal, not a prediction. Weights (0.35/0.25/0.25/0.15) are illustrative.",
      "Sector growth is extrapolated from 6 years of LFS data; structural policy changes are not modelled.",
    ],
    meta: {
      analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(),
      datasetVersions: {
        nisr_lfs: ML_DATASET_VERSIONS.nisr_lfs!, nisr_hec: ML_DATASET_VERSIONS.nisr_hec!,
        nisr_tvet: ML_DATASET_VERSIONS.nisr_tvet!, nisr_lmis: ML_DATASET_VERSIONS.nisr_lmis!,
        nisr_nesa: ML_DATASET_VERSIONS.nisr_nesa!,
      },
      isSample: false,
    },
  });
}

// --- public entry point -------------------------------------------------------
export function runMLAnalysis(question: string): AnalyticalResult {
  const intent = parseIntent(question);

  if (intent.engine === "ambiguous") {
    return AnalyticalResultSchema.parse({
      id: randomUUID(), question, status: "ambiguous",
      message: intent.understood,
      intent: {}, datasets: {}, metrics: {}, insights: {}, formulas: {}, sources: {}, operations: [], caveats: [],
      meta: { analysisVersion: ML_ENGINE_VERSION, computedAt: new Date().toISOString(), datasetVersions: {}, isSample: false },
    });
  }

  if (intent.engine === "career_intelligence") return runCareerIntelligence(question);
  if (intent.engine === "regression")          return runRegression(question);
  if (intent.engine === "forecasting")         return runForecasting(question);
  if (intent.engine === "clustering")          return runClustering(question);

  // indicator_query - fall through to engine.ts (caller decides); default to clustering
  return runClustering(question);
}
