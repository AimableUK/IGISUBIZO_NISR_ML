import http from "node:http";
import { createApp } from "./app";
import { env } from "./env";
import { initSocket } from "./socket";
import { startWorkers } from "./services/queues";
import { startCron } from "./cron";
import { prisma } from "./lib/prisma";

const server = http.createServer(createApp());
initSocket(server);
const workers = startWorkers();
startCron();

server.listen(env.PORT, () => console.info(`API listening on :${env.PORT} (${env.NODE_ENV})`));

async function shutdown() {
  console.info("Shutting down…");
  server.close();
  await Promise.all(workers.map((w) => w.close()));
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
