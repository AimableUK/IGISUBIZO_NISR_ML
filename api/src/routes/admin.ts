import { Router } from "express";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { env } from "../env";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const admin = Router();

const REAL_DATA = path.resolve(process.cwd(), "../model/data/real");
const TRAINING_LABELS = [
  "greeting",
  "student_intro",
  "program_query",
  "career_pathways",
  "career_decision",
  "data_query",
  "other",
] as const;
const ExamplesRequestSchema = z.object({
  examples: z.array(z.object({
    text: z.string().trim().min(3).max(500),
    label: z.enum(TRAINING_LABELS),
  })).min(1).max(200),
});

function readCsv(name: string): Record<string, string>[] {
  const file = path.join(REAL_DATA, name);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",");
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header.trim(), (vals[index] ?? "").trim()]));
  });
}

async function requireAdmin(
  req: Parameters<typeof requireAuth>[0],
  res: Parameters<typeof requireAuth>[1],
  next: Parameters<typeof requireAuth>[2],
) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: "unauthenticated" });
  const first = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (first?.id !== session.user.id) return res.status(403).json({ error: "forbidden", message: "Admin only." });
  req.userId = session.user.id;
  next();
}

function modelError(res: Parameters<typeof requireAuth>[1], error: unknown, action: string) {
  console.error(`[admin] ${action} failed`, error);
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
  return res.status(status === 422 ? 422 : 503).json({
    error: status === 422 ? "training_request_rejected" : "model_unavailable",
    message: status === 422
      ? String(detail ?? "The model rejected the training request.")
      : "The model service is unavailable; the requested action did not complete.",
  });
}

const modelUrl = (route: string) => `${env.MODEL_URL.replace(/\/$/, "")}${route}`;

admin.get("/stats", requireAdmin, async (_req, res) => {
  const [totalUsers, totalArtifacts, totalAnalyses, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.artifact.count(),
    prisma.analysisResult.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);
  const labour = readCsv("district_labour.csv").filter((row) => row.year === "2024");
  const mean = (key: string) => labour.length
    ? Math.round((labour.reduce((sum, row) => sum + parseFloat(row[key] ?? "0"), 0) / labour.length) * 10) / 10
    : null;

  res.json({
    platform: { totalUsers, totalArtifacts, totalAnalyses },
    recentUsers: recentUsers.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() })),
    labourSummary: {
      year: 2024,
      avgEmploymentRate: mean("employment_rate"),
      avgUnemploymentRate: mean("unemployment_rate"),
      avgYouthNeet: mean("youth_neet_rate"),
      avgFormalEmployment: mean("pct_formal"),
      avgWageRwf: mean("avg_wage_rwf"),
    },
  });
});

admin.get("/training", requireAdmin, async (_req, res) => {
  try {
    const { data } = await axios.get(modelUrl("/admin/training"), { timeout: 10_000 });
    res.json(data);
  } catch (error) {
    return modelError(res, error, "reading training status");
  }
});

admin.post("/training/examples", requireAdmin, async (req, res) => {
  const parsed = ExamplesRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid_training_examples",
      message: "Provide 1–200 examples with text and a supported intent label.",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  try {
    const { data } = await axios.post(modelUrl("/admin/training/examples"), parsed.data, { timeout: 15_000 });
    res.json(data);
  } catch (error) {
    return modelError(res, error, "saving training examples");
  }
});

admin.post("/train", requireAdmin, async (req, res) => {
  if (req.body?.action !== "train_intents") {
    return res.status(400).json({
      error: "invalid_action",
      message: "Use { action: 'train_intents' } to train the conversation intent model.",
    });
  }
  try {
    const { data } = await axios.post(modelUrl("/admin/training/train"), {}, { timeout: 60_000 });
    res.json(data);
  } catch (error) {
    return modelError(res, error, "training intent model");
  }
});

admin.get("/career-guide", requireAdmin, (_req, res) => {
  const latest = readCsv("career_demand.csv").filter((row) => row.year === "2024");
  const byOccupation: Record<string, {
    vacancies: number[];
    skillGap: number[];
    wage: number[];
    trend: string;
    sector: string;
  }> = {};
  for (const row of latest) {
    const occupation = row.occupation ?? "";
    if (!byOccupation[occupation]) {
      byOccupation[occupation] = {
        vacancies: [],
        skillGap: [],
        wage: [],
        trend: row.demand_trend ?? "",
        sector: row.sector ?? "",
      };
    }
    byOccupation[occupation]!.vacancies.push(parseFloat(row.job_vacancies ?? "0"));
    byOccupation[occupation]!.skillGap.push(parseFloat(row.skill_gap_score ?? "0"));
    byOccupation[occupation]!.wage.push(parseFloat(row.avg_advertised_wage_rwf ?? "0"));
  }
  const avg = (values: number[]) => values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
  const avgF = (values: number[]) => values.length
    ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
    : 0;
  const guide = Object.entries(byOccupation)
    .map(([occupation, data]) => ({
      occupation,
      sector: data.sector,
      avgVacancies: avg(data.vacancies),
      avgSkillGap: avgF(data.skillGap),
      avgWageRwf: avg(data.wage),
      demandTrend: data.trend,
      demandScore: Math.round(avg(data.vacancies) * avgF(data.skillGap)),
    }))
    .sort((left, right) => right.demandScore - left.demandScore);
  res.json(guide);
});
