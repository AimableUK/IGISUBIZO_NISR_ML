import type { Prisma } from "@prisma/client";
import { emptyCustomizations, type AnalyticalResult } from "@shared";
import { prisma } from "../lib/prisma";
import { planPresentation } from "./planner";

const json = (value: unknown) => value as Prisma.InputJsonValue;

export async function saveAnalysisArtifact(userId: string, question: string, result: AnalyticalResult) {
  if (result.status !== "ok" && result.status !== "partial") return null;

  const { spec, plannerVersion } = await planPresentation(result);
  const artifact = await prisma.$transaction(async (tx) => {
    const analysis = await tx.analysisResult.create({
      data: {
        userId,
        question,
        result: json(result),
        analysisVersion: result.meta.analysisVersion,
      },
    });
    return tx.artifact.create({
      data: {
        userId,
        question,
        title: spec.title,
        versions: {
          create: {
            version: 1,
            analysisId: analysis.id,
            presentationSpec: json(spec),
            customizations: json(emptyCustomizations()),
            plannerVersion,
            schemaVersion: 1,
            note: "Generated",
          },
        },
      },
    });
  });
  return artifact.id;
}
