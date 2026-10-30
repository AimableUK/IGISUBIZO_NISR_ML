import { Router } from "express";
import { AskRequestSchema } from "@shared";
import { requireAuth } from "../middleware/auth";
import { analyzeViaModel } from "../services/model-client";
import { saveAnalysisArtifact } from "../services/analysis-artifact";
import { emitProgress } from "../socket";

export const analyses = Router();

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
    step("saving");
    const artifactId = await saveAnalysisArtifact(userId, question, result);
    step("ready");
    res.json({ result, artifactId });
  } catch (e) {
    console.error("[analysis] failed", e);
    res.status(500).json({ error: "analysis_failed", message: "The analysis could not be completed. Nothing was saved. Try again in a moment." });
  }
});
