import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection - lazy initialized
let connection: IORedis | null = null;

function getRedisConnection(): IORedis {
    if (!connection) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        connection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null, // Required by BullMQ
        });
    }
    return connection;
}

// Queue names
export const QUEUE_NAMES = {
    EMAIL: 'email-notifications',
} as const;

// Job types
export type EmailJobType = 
    | 'book-borrowed'
    | 'book-returned'
    | 'book-extended'
    | 'due-reminder'
    | 'overdue-reminder';

export interface EmailJobData {
    type: EmailJobType;
    to: string;
    memberName: string;
    bookTitle: string;
    bookAuthor: string;
    libraryName: string;
    dueDate?: string;
    newDueDate?: string;
    daysOverdue?: number;
    borrowingId?: string;
}

// Get or create email queue
let emailQueue: Queue<EmailJobData> | null = null;

export function getEmailQueue(): Queue<EmailJobData> {
    if (!emailQueue) {
        emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
            connection: getRedisConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
    }
    return emailQueue;
}

// Add email job to queue
export async function addEmailJob(data: EmailJobData, options?: {
    delay?: number;
    jobId?: string;
}) {
    const queue = getEmailQueue();
    
    return queue.add(data.type, data, {
        delay: options?.delay,
        jobId: options?.jobId,
    });
}

// Schedule due reminder (24 hours before due date)
export async function scheduleDueReminder(
    borrowingId: string,
    dueDate: Date,
    data: Omit<EmailJobData, 'type'>
) {
    const reminderTime = new Date(dueDate);
    reminderTime.setHours(reminderTime.getHours() - 24);
    
    const delay = reminderTime.getTime() - Date.now();
    
    // Only schedule if due date is more than 24 hours away
    if (delay > 0) {
        await addEmailJob(
            { ...data, type: 'due-reminder' },
            { 
                delay,
                jobId: `due-reminder-${borrowingId}`,
            }
        );
    }
}

// Cancel scheduled reminder (when book is returned early)
export async function cancelDueReminder(borrowingId: string) {
    const queue = getEmailQueue();
    const job = await queue.getJob(`due-reminder-${borrowingId}`);
    
    if (job) {
        await job.remove();
    }
}

// Close connection (for cleanup)
export async function closeEmailQueue() {
    if (emailQueue) {
        await emailQueue.close();
        emailQueue = null;
    }
    if (connection) {
        await connection.quit();
        connection = null;
    }
}
