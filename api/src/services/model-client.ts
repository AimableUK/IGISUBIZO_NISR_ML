import axios from "axios";
import { AnalyticalResultSchema, type AnalyticalResult } from "@shared";
import { env } from "../env";
import { runAnalysis } from "./engine";

/** Drop nulls that mean "absent" for Zod .optional(), keep intentional nulls (scores, intervals, decision). */
function stripNullOptionals(value: unknown, key?: string): unknown {
  if (value === null) {
    if (key === "decision" || key === "score" || key === "value" || key === "interval" || key === "delta") {
      return null;
    }
    return undefined;
  }
  if (Array.isArray(value)) return value.map((v) => stripNullOptionals(v));
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const next = stripNullOptionals(v, k);
      if (next !== undefined) out[k] = next;
    }
    return out;
  }
  return value;
}

export class ModelServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ModelServiceError";
  }
}

/**
 * Call the Python FastAPI model service (POST /analyze).
 * Falls back to the in-process sample engine when MODEL_URL is unreachable
 * and MODEL_FALLBACK=true (default in development).
 */
export async function analyzeViaModel(
  question: string,
  requestId: string,
): Promise<{ result: AnalyticalResult; source: "model" | "fallback" }> {
  try {
    const { data } = await axios.post(
      `${env.MODEL_URL.replace(/\/$/, "")}/analyze`,
      { question, requestId },
      { timeout: 60_000, validateStatus: () => true },
    );

    if (data?.detail) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ")
            : "Model rejected the request.";
      throw new ModelServiceError(msg, 422);
    }

    // Pydantic serializes Optional fields as null; Zod .optional() rejects null.
    const normalized = stripNullOptionals(data);
    const parsed = AnalyticalResultSchema.safeParse(normalized);
    if (!parsed.success) {
      throw new ModelServiceError(
        `Model response failed schema validation: ${parsed.error.issues[0]?.message ?? "invalid"}`,
      );
    }
    return { result: parsed.data, source: "model" };
  } catch (e) {
    if (e instanceof ModelServiceError) throw e;
    if (!env.MODEL_FALLBACK) {
      throw new ModelServiceError(
        `Model service unavailable at ${env.MODEL_URL}: ${(e as Error).message}`,
      );
    }
    console.warn(
      `[model-client] ${env.MODEL_URL} unreachable - falling back to local engine:`,
      (e as Error).message,
    );
    return { result: runAnalysis(question), source: "fallback" };
  }
}
