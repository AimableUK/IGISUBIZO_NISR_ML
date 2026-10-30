import { Router } from "express";
import { ConversationRequestSchema, ConversationTurnSchema } from "@shared";
import { requireAuth } from "../middleware/auth";
import { analyzeViaModel } from "../services/model-client";
import { saveAnalysisArtifact } from "../services/analysis-artifact";
import { prisma } from "../lib/prisma";
import { emitProgress } from "../socket";
import type { ConversationTurn } from "@shared";
import {
  analysisQuestion,
  extractLocation,
  fetchWeatherForecast,
  replyToClarification,
  replyToConversation,
  replyToUnsupported,
  replyToWeather,
  selectConversationTool,
  weatherContext,
} from "../services/conversation";
import { env } from "../env";

export const conversation = Router();

conversation.get("/:id", requireAuth, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const record = await prisma.conversation.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!record) {
    return res.status(404).json({ error: "not_found", message: "Conversation not found." });
  }
  const messages = ConversationTurnSchema.array().parse(record.messages);
  return res.json({
    id: record.id,
    title: record.title,
    messages,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
});

conversation.post("/", requireAuth, async (req, res) => {
  const parsed = ConversationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid_request",
      message: parsed.error.issues[0]?.message ?? "Invalid conversation message.",
    });
  }

  let conversationIdForError = parsed.data.conversationId;
  try {
    const { message, history, useAi, requestId } = parsed.data;
    let conversationId = parsed.data.conversationId;
    let record = conversationId
      ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: req.userId! } })
      : null;
    if (conversationId && !record) {
      return res.status(404).json({ error: "not_found", message: "Conversation not found." });
    }
    if (!record) {
      const initial: ConversationTurn[] = [
        ...history,
        { role: "user", content: message },
      ];
      record = await prisma.conversation.create({
        data: {
          userId: req.userId!,
          title: message.slice(0, 120),
          messages: initial,
        },
      });
      conversationId = record.id;
    } else {
      const stored = ConversationTurnSchema.array().parse(record.messages);
      record = await prisma.conversation.update({
        where: { id: record.id },
        data: { messages: [...stored, { role: "user", content: message }] },
      });
    }
    conversationIdForError = record.id;
    const savedMessages = ConversationTurnSchema.array().parse(record.messages);
    const priorHistory = savedMessages.slice(0, -1).slice(-10)
      .map(({ role, content }) => ({ role, content: content.slice(0, 2000) }));
    await prisma.conversation.update({
      where: { id: record.id },
      data: { updatedAt: new Date() },
    });
    if (useAi && !env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "ai_adviser_unavailable",
        message: "AI-assisted replies are not configured. Turn off AI-assisted replies to use guided mode.",
        conversationId: record.id,
      });
    }
    const choice = await selectConversationTool(message, priorHistory, useAi);
    if (choice.tool === "clarify") {
      const reply = await replyToClarification(message, priorHistory, useAi);
      return res.json(await saveReply(record.id, savedMessages, reply, null));
    }
    if (choice.tool === "unsupported") {
      const reply = await replyToUnsupported(message, priorHistory, useAi);
      return res.json(await saveReply(record.id, savedMessages, reply, null));
    }
    if (choice.tool === "weather") {
      let forecast;
      try {
        forecast = await fetchWeatherForecast(
          extractLocation(choice.question)
          ?? extractLocation(message)
          ?? extractLocation(weatherContext(priorHistory) ?? ""),
        );
      } catch (error) {
        console.error("[conversation] weather source failed", error);
        return res.status(503).json({
          error: "weather_source_unavailable",
          message: "I couldn’t reach the weather forecast service right now. Please try again shortly.",
          conversationId: record.id,
        });
      }
      const reply = await replyToWeather(message, priorHistory, forecast, useAi);
      return res.json(await saveReply(record.id, savedMessages, reply, null));
    }
    emitProgress(req.userId!, requestId, "interpreting");
    const question = analysisQuestion(choice.question || message, priorHistory);
    emitProgress(req.userId!, requestId, "validating");
    emitProgress(req.userId!, requestId, "computing");
    const { result } = await analyzeViaModel(question, requestId);
    emitProgress(req.userId!, requestId, "planning");
    const reply = await replyToConversation(message, priorHistory, result, useAi);
    emitProgress(req.userId!, requestId, "saving");
    const assistantTurn: ConversationTurn = {
      role: "assistant",
      content: reply.reply,
      mode: reply.mode,
      sources: reply.sources,
      artifactId: null,
    };
    const artifactId = await saveAnalysisArtifact(req.userId!, question, result, record.id, assistantTurn);
    const response = artifactId
      ? { ...reply, conversationId: record.id, artifactId }
      : await saveReply(record.id, savedMessages, reply, null);
    emitProgress(req.userId!, requestId, "ready");
    return res.json(response);
  } catch (error) {
    console.error("[conversation] failed", error);
    return res.status(503).json({
      error: "conversation_unavailable",
      message: "The adviser could not complete this reply. Your message is saved; you can try again.",
      ...(conversationIdForError ? { conversationId: conversationIdForError } : {}),
    });
  }
});

async function saveReply(
  conversationId: string,
  previous: ConversationTurn[],
  reply: { reply: string; mode: "ai" | "guided"; sources: { title: string; period: string; isSample: boolean; url?: string }[] },
  artifactId: string | null,
) {
  const assistantTurn: ConversationTurn = {
    role: "assistant",
    content: reply.reply,
    mode: reply.mode,
    sources: reply.sources,
    artifactId,
  };
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { messages: [...previous, assistantTurn] },
  });
  return { ...reply, conversationId, artifactId };
}
