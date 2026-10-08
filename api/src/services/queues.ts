import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";
import { sendMail, type Mail } from "./mailer";

export const emailQueue = new Queue<Mail>("email", {
  connection: redis,
  defaultJobOptions: { attempts: 5, backoff: { type: "exponential", delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 },
});

export const enqueueMail = (mail: Mail) => emailQueue.add("send", mail);

export function startWorkers() {
  const worker = new Worker<Mail>("email", async (job) => sendMail(job.data), { connection: redis, concurrency: 5 });
  worker.on("failed", (job, err) => console.error(`[email] job ${job?.id} failed: ${err.message}`));
  return [worker];
}
