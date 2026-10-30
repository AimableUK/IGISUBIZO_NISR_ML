import { Router } from "express";
import { randomUUID } from "node:crypto";
import { ConversationRequestSchema } from "@shared";
import { requireAuth } from "../middleware/auth";
import { analyzeViaModel } from "../services/model-client";
import { saveAnalysisArtifact } from "../services/analysis-artifact";
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
    const choice = await selectConversationTool(message, history, useAi);
    if (choice.tool === "clarify") {
      return res.json({ ...(await replyToClarification(message, history, useAi)), artifactId: null });
    }
    if (choice.tool === "unsupported") {
      return res.json({ ...(await replyToUnsupported(message, history, useAi)), artifactId: null });
    }
    if (choice.tool === "weather") {
      let forecast;
      try {
        forecast = await fetchWeatherForecast(
          extractLocation(choice.question)
          ?? extractLocation(message)
          ?? extractLocation(weatherContext(history) ?? ""),
        );
      } catch (error) {
        console.error("[conversation] weather source failed", error);
        return res.status(503).json({
          error: "weather_source_unavailable",
          message: "I couldn’t reach the weather forecast service right now. Please try again shortly.",
        });
      }
      return res.json({ ...(await replyToWeather(message, history, forecast, useAi)), artifactId: null });
    }
    const question = analysisQuestion(choice.question || message, history);
    const { result } = await analyzeViaModel(question, randomUUID());
    const reply = await replyToConversation(message, history, result, useAi);
    const artifactId = await saveAnalysisArtifact(req.userId!, question, result);
    return res.json({ ...reply, artifactId });
  } catch (error) {
    console.error("[conversation] failed", error);
    return res.status(503).json({
      error: "conversation_unavailable",
      message: "The adviser could not complete this reply. Your conversation was not saved; please try again.",
    });
  }
});
