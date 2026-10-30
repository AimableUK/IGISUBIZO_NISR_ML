import type { Prisma } from "@prisma/client";
import { ConversationTurnSchema, emptyCustomizations, type AnalyticalResult, type ConversationTurn } from "@shared";
import { prisma } from "../lib/prisma";
import { planPresentation } from "./planner";

const json = (value: unknown) => value as Prisma.InputJsonValue;

export async function saveAnalysisArtifact(
  userId: string,
  question: string,
  result: AnalyticalResult,
  conversationId?: string,
  assistantTurn?: ConversationTurn,
) {
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
    const createdArtifact = await tx.artifact.create({
      data: {
        userId,
        conversationId,
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
    if (conversationId && assistantTurn) {
      const conversation = await tx.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) throw new Error("Conversation was not found while saving its analysis.");
      const messages = ConversationTurnSchema.array().parse(conversation.messages);
      await tx.conversation.update({
        where: { id: conversationId },
        data: { messages: [...messages, { ...assistantTurn, artifactId: createdArtifact.id }] },
      });
    }
    return createdArtifact;
  });
  return artifact.id;
}
