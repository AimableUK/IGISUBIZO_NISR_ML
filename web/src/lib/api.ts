import axios, { AxiosError } from "axios";
import { z } from "zod";
import {
  ArtifactPayloadSchema, ArtifactSummarySchema, AskResponseSchema, VersionMetaSchema,
  ConversationResponseSchema, type ArtifactPayload, type ArtifactSummary, type Customizations,
  type ConversationMessage, type PresentationSpec,
} from "@/shared";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const http = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true, timeout: 45_000 });

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string, public issues?: { path: string; message: string }[]) { super(message); }
}
function toApiError(e: unknown): ApiError {
  if (e instanceof AxiosError) {
    if (!e.response) return new ApiError("We could not reach the server. Check your connection and try again.", 0, "network");
    const d = e.response.data as { message?: string; error?: string; issues?: { path: string; message: string }[] } | undefined;
    return new ApiError(d?.message ?? "Something went wrong.", e.response.status, d?.error, d?.issues);
  }
  return e instanceof ApiError ? e : new ApiError("Unexpected error.", 0);
}
async function call<T>(p: Promise<{ data: unknown }>, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
  try {
    const { data } = await p;
    const parsed = schema.safeParse(data); // validate the system boundary
    if (!parsed.success) throw new ApiError("The server returned data in an unexpected shape.", 502, "bad_response");
    return parsed.data;
  } catch (e) { throw toApiError(e); }
}

export const api = {
  ask: (question: string, requestId: string) => call(http.post("/analyses", { question, requestId }), AskResponseSchema),
  converse: (message: string, history: ConversationMessage[], useAi: boolean) => call(
    http.post("/conversation", { message, history, useAi }),
    ConversationResponseSchema,
  ),
  list: (): Promise<ArtifactSummary[]> => call(http.get("/artifacts"), z.array(ArtifactSummarySchema)),
  get: (id: string, version?: number): Promise<ArtifactPayload> => call(http.get(`/artifacts/${id}`, { params: version ? { version } : undefined }), ArtifactPayloadSchema),
  versions: (id: string) => call(http.get(`/artifacts/${id}/versions`), z.array(VersionMetaSchema.pick({ version: true, note: true, createdAt: true, plannerVersion: true }))),
  saveVersion: (id: string, body: { spec: PresentationSpec; customizations: Customizations; note?: string }) => call(http.post(`/artifacts/${id}/versions`, body), z.object({ version: z.number() })),
  remove: async (id: string) => { try { await http.delete(`/artifacts/${id}`); } catch (e) { throw toApiError(e); } },
  contact: async (body: { name: string; email: string; message: string }) => { try { await http.post("/contact", body); } catch (e) { throw toApiError(e); } },
  imagekitAuth: () => call(http.get("/uploads/imagekit-auth"), z.object({ token: z.string(), expire: z.number(), signature: z.string(), publicKey: z.string() })),
};
