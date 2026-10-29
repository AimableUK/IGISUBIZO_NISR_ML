import { Router } from "express";
import { randomUUID } from "node:crypto";
import { ConversationRequestSchema } from "@shared";
import { requireAuth } from "../middleware/auth";
import { analyzeViaModel } from "../services/model-client";
import { analysisQuestion, replyToConversation } from "../services/conversation";
import { env } from "../env";

export const conversation = Router();

conversation.post("/", requireAuth, async (req, res) => {
  const parsed = ConversationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid_request",
      message: parsed.error.issues[0]?.message ?? "Invalid conversation message.",
    });
  }

  try {
    const { message, history, useAi } = parsed.data;
    if (useAi && !env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "ai_adviser_unavailable",
        message: "AI-assisted replies are not configured. Turn off AI-assisted replies to use guided mode.",
      });
    }
    const question = analysisQuestion(message, history);
    const { result } = await analyzeViaModel(question, randomUUID());
    const reply = await replyToConversation(message, history, result, useAi);
    return res.json(reply);
  } catch (error) {
    console.error("[conversation] failed", error);
    return res.status(503).json({
      error: "conversation_unavailable",
      message: "The adviser could not complete this reply. Your conversation was not saved; please try again.",
    });
  }
});
