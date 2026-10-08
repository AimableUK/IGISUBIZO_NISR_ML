import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ContactRequestSchema } from "@shared";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { env } from "../env";
import { enqueueMail } from "../services/queues";
import { templates } from "../services/mailer";
import { imagekit } from "../services/imagekit";
import { DATASET_VERSIONS, ANALYSIS_VERSION } from "../services/engine";

export const misc = Router();

misc.get("/health", (_req, res) => res.json({ ok: true, analysisVersion: ANALYSIS_VERSION }));
misc.get("/meta/datasets", (_req, res) => res.json({ datasets: DATASET_VERSIONS, analysisVersion: ANALYSIS_VERSION, isSample: true }));

misc.post("/contact", rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }), async (req, res) => {
  const p = ContactRequestSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: "invalid_request", message: p.error.issues[0]?.message ?? "Check the form and try again." });
  await prisma.contactMessage.create({ data: p.data });
  await enqueueMail({ to: env.CONTACT_INBOX, ...templates.contact(p.data.name, p.data.email, p.data.message) });
  res.status(202).json({ ok: true });
});

misc.get("/uploads/imagekit-auth", requireAuth, (_req, res) => {
  if (!imagekit) return res.status(503).json({ error: "uploads_disabled", message: "Image uploads are not configured." });
  res.json({ ...imagekit.getAuthenticationParameters(), publicKey: env.IMAGEKIT_PUBLIC_KEY });
});
