import { z } from "zod";
import { AnalyticalResultSchema } from "./analytical";
import { CustomizationsSchema, PresentationSpecSchema } from "./presentation";

export const AskRequestSchema = z.object({
  question: z.string().trim().min(3, "Ask a question of at least three characters.").max(500),
  requestId: z.string().uuid(),
});
export const ConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});
export const ConversationRequestSchema = z.object({
  message: z.string().trim().min(2).max(500),
  history: z.array(ConversationMessageSchema).max(10).default([]),
  useAi: z.boolean().default(false),
});
export const ConversationResponseSchema = z.object({
  reply: z.string().min(1).max(6000),
  mode: z.enum(["ai", "guided"]),
  sources: z.array(z.object({
    title: z.string(),
    period: z.string(),
    isSample: z.boolean(),
    url: z.string().url().optional(),
  })),
});
export const SaveVersionRequestSchema = z.object({
  spec: PresentationSpecSchema,
  customizations: CustomizationsSchema,
  note: z.string().trim().max(200).optional(),
});
export const ContactRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(4000),
});

export const ArtifactSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  question: z.string(),
  currentVersion: z.number().int(),
  versionCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSample: z.boolean(),
  componentTypes: z.array(z.string()),
});
export const DriftSchema = z.object({
  changed: z.boolean(),
  items: z.array(z.object({ kind: z.enum(["dataset", "engine"]), id: z.string(), saved: z.string(), current: z.string() })),
});
export const VersionMetaSchema = z.object({
  version: z.number().int(),
  note: z.string().nullable(),
  createdAt: z.string(),
  plannerVersion: z.string(),
  schemaVersion: z.number().int(),
  analysisId: z.string(),
});
export const ArtifactPayloadSchema = z.object({
  artifact: ArtifactSummarySchema,
  version: VersionMetaSchema,
  result: AnalyticalResultSchema,
  spec: PresentationSpecSchema,
  customizations: CustomizationsSchema,
  drift: DriftSchema,
});
export const AskResponseSchema = z.object({ result: AnalyticalResultSchema, artifactId: z.string().nullable() });
export const ProgressStages = ["interpreting", "validating", "computing", "planning", "saving", "ready"] as const;
export type ProgressStage = (typeof ProgressStages)[number];

export type ArtifactSummary = z.infer<typeof ArtifactSummarySchema>;
export type ArtifactPayload = z.infer<typeof ArtifactPayloadSchema>;
export type VersionMeta = z.infer<typeof VersionMetaSchema>;
export type Drift = z.infer<typeof DriftSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
