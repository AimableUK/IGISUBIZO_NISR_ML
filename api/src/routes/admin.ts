import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const admin = Router();

const REAL_DATA = path.resolve(process.cwd(), "../model/data/real");

function readCsv(name: string): Record<string, string>[] {
  const file = path.join(REAL_DATA, name);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",");
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? "").trim()]));
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

// GET /api/admin/stats
admin.get("/stats", requireAdmin, async (_req, res) => {
  const [totalUsers, totalArtifacts, totalAnalyses, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.artifact.count(),
    prisma.analysisResult.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const labour = readCsv("district_labour.csv").filter((r) => r.year === "2024");
  const mean = (key: string) =>
    labour.length
      ? Math.round((labour.reduce((s, r) => s + parseFloat(r[key] ?? "0"), 0) / labour.length) * 10) / 10
      : null;

  res.json({
    platform: { totalUsers, totalArtifacts, totalAnalyses },
    recentUsers: recentUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
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

// GET /api/admin/career-guide
admin.get("/career-guide", requireAdmin, (_req, res) => {
  const latest = readCsv("career_demand.csv").filter((r) => r.year === "2024");

  const byOcc: Record<string, { vacancies: number[]; skillGap: number[]; wage: number[]; trend: string; sector: string }> = {};
  for (const r of latest) {
    const occ = r.occupation ?? "";
    if (!byOcc[occ]) byOcc[occ] = { vacancies: [], skillGap: [], wage: [], trend: r.demand_trend ?? "", sector: r.sector ?? "" };
    byOcc[occ]!.vacancies.push(parseFloat(r.job_vacancies ?? "0"));
    byOcc[occ]!.skillGap.push(parseFloat(r.skill_gap_score ?? "0"));
    byOcc[occ]!.wage.push(parseFloat(r.avg_advertised_wage_rwf ?? "0"));
  }

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const avgF = (arr: number[]) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  const guide = Object.entries(byOcc)
    .map(([occupation, d]) => ({
      occupation,
      sector: d.sector,
      avgVacancies: avg(d.vacancies),
      avgSkillGap: avgF(d.skillGap),
      avgWageRwf: avg(d.wage),
      demandTrend: d.trend,
      demandScore: Math.round(avg(d.vacancies) * avgF(d.skillGap)),
    }))
    .sort((a, b) => b.demandScore - a.demandScore);

  res.json(guide);
});
