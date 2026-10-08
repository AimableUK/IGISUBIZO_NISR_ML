import cron from "node-cron";
import { prisma } from "./lib/prisma";

export function startCron() {
  // Daily 03:00 — remove expired sessions and verification tokens.
  cron.schedule("0 3 * * *", async () => {
    const now = new Date();
    const [s, v] = await Promise.all([
      prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);
    console.info(`[cron] purged ${s.count} sessions, ${v.count} verification tokens`);
  });
}
