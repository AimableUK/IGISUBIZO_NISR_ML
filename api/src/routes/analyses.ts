import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { AskRequestSchema, emptyCustomizations } from "@shared";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { analyzeViaModel } from "../services/model-client";
import { planPresentation } from "../services/planner";
import { emitProgress } from "../socket";

export const analyses = Router();
const json = (v: unknown) => v as Prisma.InputJsonValue;

analyses.post("/", requireAuth, async (req, res) => {
  const parsed = AskRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid request." });
  const { question, requestId } = parsed.data;
  const userId = req.userId!;
  const step = (s: Parameters<typeof emitProgress>[2]) => emitProgress(userId, requestId, s);

  try {
    step("interpreting");
    step("validating");
    step("computing");
    const { result } = await analyzeViaModel(question, requestId);
    if (result.status !== "ok" && result.status !== "partial") {
      step("ready");
      return res.json({ result, artifactId: null });
    }
    step("planning");
    const { spec, plannerVersion } = await planPresentation(result);
    step("saving");
    const artifact = await prisma.$transaction(async (tx) => {
      const analysis = await tx.analysisResult.create({ data: { userId, question, result: json(result), analysisVersion: result.meta.analysisVersion } });
      return tx.artifact.create({
        data: {
          userId, question, title: spec.title,
          versions: { create: { version: 1, analysisId: analysis.id, presentationSpec: json(spec), customizations: json(emptyCustomizations()), plannerVersion, schemaVersion: 1, note: "Generated" } },
        },
      });
    });
    step("ready");
    res.json({ result, artifactId: artifact.id });
  } catch (e) {
    console.error("[analysis] failed", e);
    res.status(500).json({ error: "analysis_failed", message: "The analysis could not be completed. Nothing was saved. Try again in a moment." });
  }
});
