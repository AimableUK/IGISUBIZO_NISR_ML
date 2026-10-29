import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Load the repository-root .env for local development, then an API-local override.
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_URL: z.string().url().default("http://localhost:4000"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().default("no-reply@example.com"),
  BREVO_SENDER_NAME: z.string().default("Isesengura"),
  CONTACT_INBOX: z.string().email().default("malostechnologies@gmail.com"),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  PLANNER_MODEL: z.string().default("claude-sonnet-5-5"),
  /** Python FastAPI model service base URL (no trailing path). */
  MODEL_URL: z.string().url().default("http://127.0.0.1:8000"),
  /** If true, fall back to in-process sample engine when model is down. */
  MODEL_FALLBACK: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
