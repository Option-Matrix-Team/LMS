/**
 * Email Worker - Standalone process
 * 
 * This script runs the BullMQ worker that processes email jobs.
 * Start with: npm run email-worker
 * 
 * For production, run this as a separate process alongside the Next.js app.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { QUEUE_NAMES, EmailJobData } from '../lib/email/queue';
import { processOverdueReminders, processDueReminders } from '../lib/email/scheduler';

// Email templates
import BookBorrowedEmail from '../lib/emails/BookBorrowed';
import BookReturnedEmail from '../lib/emails/BookReturned';
import BookExtendedEmail from '../lib/emails/BookExtended';
import DueReminderEmail from '../lib/emails/DueReminder';
import OverdueReminderEmail from '../lib/emails/OverdueReminder';

// Initialize
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🚀 Starting Email Worker...');
console.log(`📡 Connecting to Redis: ${redisUrl.replace(/\/\/.*@/, '//*****@')}`);

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
});

// Render email based on type
async function renderEmail(data: EmailJobData): Promise<string> {
    switch (data.type) {
        case 'book-borrowed':
            return render(BookBorrowedEmail({
                memberName: data.memberName,
                bookTitle: data.bookTitle,
                bookAuthor: data.bookAuthor,
                dueDate: data.dueDate || '',
                libraryName: data.libraryName,
            }));
        case 'book-returned':
            return render(BookReturnedEmail({
                memberName: data.memberName,
                bookTitle: data.bookTitle,
                bookAuthor: data.bookAuthor,
                libraryName: data.libraryName,
            }));
        case 'book-extended':
            return render(BookExtendedEmail({
                memberName: data.memberName,
                bookTitle: data.bookTitle,
                bookAuthor: data.bookAuthor,
                newDueDate: data.newDueDate || '',
                libraryName: data.libraryName,
            }));
        case 'due-reminder':
            return render(DueReminderEmail({
                memberName: data.memberName,
                bookTitle: data.bookTitle,
                bookAuthor: data.bookAuthor,
                dueDate: data.dueDate || '',
                libraryName: data.libraryName,
            }));
        case 'overdue-reminder':
            return render(OverdueReminderEmail({
                memberName: data.memberName,
                bookTitle: data.bookTitle,
                bookAuthor: data.bookAuthor,
                dueDate: data.dueDate || '',
                daysOverdue: data.daysOverdue || 1,
                libraryName: data.libraryName,
            }));
        default:
            throw new Error(`Unknown email type: ${data.type}`);
    }
}

// Get email subject
function getSubject(type: string, bookTitle: string): string {
    switch (type) {
        case 'book-borrowed': return `You have borrowed: ${bookTitle}`;
        case 'book-returned': return `Book returned: ${bookTitle}`;
        case 'book-extended': return `Borrowing extended: ${bookTitle}`;
        case 'due-reminder': return `Reminder: ${bookTitle} is due tomorrow`;
        case 'overdue-reminder': return `OVERDUE: ${bookTitle} needs to be returned`;
        default: return 'Library Notification';
    }
}

// Email Worker
const emailWorker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job) => {
        console.log(`📧 Processing: ${job.id} - ${job.data.type} to ${job.data.to}`);
        
        const html = await renderEmail(job.data);
        const subject = getSubject(job.data.type, job.data.bookTitle);
        
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Library <onboarding@resend.dev>',
            to: job.data.to,
            subject,
            html,
        });

        if (error) {
            console.error(`❌ Failed: ${error.message}`);
            throw new Error(error.message);
        }

        console.log(`✅ Sent: ${data?.id}`);
        return { emailId: data?.id };
    },
    {
        connection,
        concurrency: 5,
    }
);

// Cron Worker for scheduled tasks
const cronWorker = new Worker(
    'cron-scheduler',
    async (job) => {
        console.log(`⏰ Running cron job: ${job.name}`);
        
        if (job.name === 'check-overdue') {
            await processOverdueReminders();
            await processDueReminders();
        }
    },
    { connection }
);

// Event handlers
emailWorker.on('completed', (job) => {
    console.log(`✓ Email completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`✗ Email failed: ${job?.id} - ${err.message}`);
});

cronWorker.on('completed', (job) => {
    console.log(`✓ Cron completed: ${job.name}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down workers...');
    await emailWorker.close();
    await cronWorker.close();
    await connection.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Shutting down workers...');
    await emailWorker.close();
    await cronWorker.close();
    await connection.quit();
    process.exit(0);
});

console.log('📧 Email worker is running...');
console.log('⏰ Cron scheduler active (daily at 9 AM for overdue check)');
console.log('Press Ctrl+C to stop');
