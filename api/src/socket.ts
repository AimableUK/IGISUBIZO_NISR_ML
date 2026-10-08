import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";
import type { ProgressStage } from "@shared";
import { auth } from "./auth";
import { env } from "./env";

let io: Server | undefined;

export function initSocket(http: HttpServer) {
  io = new Server(http, { cors: { origin: env.WEB_URL, credentials: true } });
  io.use(async (socket, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(socket.handshake.headers) });
    if (!session) return next(new Error("unauthenticated"));
    socket.data.userId = session.user.id;
    next();
  });
  io.on("connection", (socket) => socket.join(`user:${socket.data.userId}`));
  return io;
}

export function emitProgress(userId: string, requestId: string, stage: ProgressStage, detail?: string) {
  io?.to(`user:${userId}`).emit("analysis:progress", { requestId, stage, detail });
}
