import { type Job, Worker } from "bullmq";
import IORedis from "ioredis";
import { type EmailJobData, QUEUE_NAMES } from "./queue";
import { sendEmail } from "./send";

let worker: Worker<EmailJobData> | null = null;

// Create and start the email worker
export function createEmailWorker(): Worker<EmailJobData> {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job: Job<EmailJobData>) => {
      console.log(`Processing email job: ${job.id} - ${job.data.type}`);

      const result = await sendEmail(job.data);

      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

      return result;
    },
    {
      connection,
      concurrency: 5, // Process 5 emails at a time
    },
  );

  // Event handlers for logging
  worker.on("completed", (job) => {
    console.log(`✓ Email sent: ${job.id} - ${job.data.type} to ${job.data.to}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`✗ Email failed: ${job?.id} - ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  console.log("📧 Email worker started");

  return worker;
}

// Graceful shutdown
export async function closeEmailWorker() {
  if (worker) {
    await worker.close();
    worker = null;
    console.log("Email worker stopped");
  }
}
