import { Router } from "express";
import type { Prisma } from "@prisma/client";
import {
  AnalyticalResultSchema, CustomizationsSchema, PresentationSpecSchema, SaveVersionRequestSchema,
  flattenComponents, validateSpecAgainstResult, type ArtifactPayload, type ArtifactSummary,
} from "@shared";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { ANALYSIS_VERSION, DATASET_VERSIONS } from "../services/engine";

export const artifacts = Router();
artifacts.use(requireAuth);
const json = (v: unknown) => v as Prisma.InputJsonValue;
const param = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

artifacts.get("/", async (req, res) => {
  const rows = await prisma.artifact.findMany({
    where: { userId: req.userId! }, orderBy: { updatedAt: "desc" }, take: 200,
    include: { _count: { select: { versions: true } }, versions: { orderBy: { version: "desc" }, take: 1, include: { analysis: { select: { result: true } } } } },
  });
  const list: ArtifactSummary[] = rows.map((a) => {
    const v = a.versions[0]!;
    const spec = PresentationSpecSchema.safeParse(v.presentationSpec);
    const result = AnalyticalResultSchema.safeParse(v.analysis.result);
    return {
      id: a.id, conversationId: a.conversationId, title: a.title, question: a.question, currentVersion: a.currentVersion, versionCount: a._count.versions,
      createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString(),
      isSample: result.success ? result.data.meta.isSample : true,
      componentTypes: spec.success ? [...new Set(flattenComponents(spec.data).map((c) => c.type))] : [],
    };
  });
  res.json(list);
});

async function payload(userId: string, id: string, version?: number): Promise<ArtifactPayload | null> {
  const a = await prisma.artifact.findFirst({ where: { id, userId }, include: { _count: { select: { versions: true } } } });
  if (!a) return null;
  const v = await prisma.artifactVersion.findFirst({ where: { artifactId: id, version: version ?? a.currentVersion }, include: { analysis: true } });
  if (!v) return null;
  const result = AnalyticalResultSchema.parse(v.analysis.result);
  const drift: ArtifactPayload["drift"] = { changed: false, items: [] };
  for (const [ds, saved] of Object.entries(result.meta.datasetVersions)) {
    const current = DATASET_VERSIONS[ds] ?? "unavailable";
    if (current !== saved) drift.items.push({ kind: "dataset", id: ds, saved, current });
  }
  if (result.meta.analysisVersion !== ANALYSIS_VERSION) drift.items.push({ kind: "engine", id: "analysis", saved: result.meta.analysisVersion, current: ANALYSIS_VERSION });
  drift.changed = drift.items.length > 0;
  return {
    artifact: { id: a.id, conversationId: a.conversationId, title: a.title, question: a.question, currentVersion: a.currentVersion, versionCount: a._count.versions, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString(), isSample: result.meta.isSample, componentTypes: [] },
    version: { version: v.version, note: v.note, createdAt: v.createdAt.toISOString(), plannerVersion: v.plannerVersion, schemaVersion: v.schemaVersion, analysisId: v.analysisId },
    result, spec: PresentationSpecSchema.parse(v.presentationSpec), customizations: CustomizationsSchema.parse(v.customizations), drift,
  };
}

artifacts.get("/:id", async (req, res) => {
  const n = req.query.version ? Number(req.query.version) : undefined;
  if (n !== undefined && !Number.isInteger(n)) return res.status(400).json({ error: "invalid_version", message: "Version must be a whole number." });
  const p = await payload(req.userId!, param(req.params.id), n);
  if (!p) return res.status(404).json({ error: "not_found", message: "This analysis does not exist or you do not have access to it." });
  res.json(p);
});

artifacts.get("/:id/versions", async (req, res) => {
  const a = await prisma.artifact.findFirst({ where: { id: param(req.params.id), userId: req.userId! } });
  if (!a) return res.status(404).json({ error: "not_found", message: "Analysis not found." });
  const vs = await prisma.artifactVersion.findMany({ where: { artifactId: a.id }, orderBy: { version: "desc" }, select: { version: true, note: true, createdAt: true, plannerVersion: true } });
  res.json(vs.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })));
});

artifacts.post("/:id/versions", async (req, res) => {
  const parsed = SaveVersionRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_spec", message: "The presentation specification is invalid.", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  const a = await prisma.artifact.findFirst({ where: { id: param(req.params.id), userId: req.userId! }, include: { versions: { orderBy: { version: "desc" }, take: 1 } } });
  if (!a || !a.versions[0]) return res.status(404).json({ error: "not_found", message: "Analysis not found." });
  const latest = a.versions[0];
  const analysis = await prisma.analysisResult.findUniqueOrThrow({ where: { id: latest.analysisId } });
  const issues = validateSpecAgainstResult(parsed.data.spec, AnalyticalResultSchema.parse(analysis.result));
  if (issues.length) return res.status(400).json({ error: "invalid_spec", message: "The specification points at data that does not exist in this analysis.", issues });
  const next = latest.version + 1;
  await prisma.$transaction([
    prisma.artifactVersion.create({ data: { artifactId: a.id, version: next, analysisId: latest.analysisId, presentationSpec: json(parsed.data.spec), customizations: json(parsed.data.customizations), plannerVersion: latest.plannerVersion, schemaVersion: 1, note: parsed.data.note ?? null } }),
    prisma.artifact.update({ where: { id: a.id }, data: { currentVersion: next, title: parsed.data.spec.title } }),
  ]);
  res.status(201).json({ version: next });
});

artifacts.delete("/:id", async (req, res) => {
  const r = await prisma.artifact.deleteMany({ where: { id: param(req.params.id), userId: req.userId! } });
  if (!r.count) return res.status(404).json({ error: "not_found", message: "Analysis not found." });
  res.status(204).end();
});
