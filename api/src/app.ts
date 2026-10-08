import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { env, isProd } from "./env";
import { analyses } from "./routes/analyses";
import { artifacts } from "./routes/artifacts";
import { misc } from "./routes/misc";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(morgan(isProd ? "combined" : "dev"));
  app.use(helmet());
  app.use(cors({ origin: env.WEB_URL, credentials: true }));

  // better-auth must be mounted before express.json()
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json({ limit: "1mb" }));
  app.use("/api", misc);
  app.use("/api/analyses", rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false }), analyses);
  app.use("/api/artifacts", artifacts);

  app.use((_req, res) => res.status(404).json({ error: "not_found", message: "Route not found." }));
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Something went wrong on our side." });
  });
  return app;
}
