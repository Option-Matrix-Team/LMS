import { createClient } from "@supabase/supabase-js";
import { Queue } from "bullmq";
import { differenceInDays, format } from "date-fns";
import IORedis from "ioredis";
import { addEmailJob } from "./queue";

/**
 * Initializes the cron scheduler for daily background jobs.
 * Sets up a BullMQ queue with Redis connection for overdue book checks.
 * Runs daily at 9 AM.
 *
 * @returns The configured cron queue instance
 */
export async function startCronScheduler() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  const cronQueue = new Queue("cron-scheduler", { connection });

  // Add repeating job for overdue check (runs daily at 9 AM)
  await cronQueue.add(
    "check-overdue",
    {},
    {
      repeat: {
        pattern: "0 9 * * *", // Daily at 9 AM
      },
      jobId: "daily-overdue-check",
    },
  );

  console.log("📅 Cron scheduler started - overdue check runs daily at 9 AM");

  return cronQueue;
}

/**
 * Processes all overdue borrowings and queues reminder emails.
 * Fetches borrowings past due date that haven't been returned,
 * then sends overdue reminder emails to each member.
 *
 * @remarks
 * Uses Supabase admin client to bypass RLS for cross-library access.
 * Calculates days overdue for each borrowing.
 */
export async function processOverdueReminders() {
  // Initialize Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );

  const now = new Date();

  // Get all overdue borrowings (not returned, due date passed)
  const { data: overdueBorrowings, error } = await supabase
    .from("borrowings")
    .select(`
            id,
            due_date,
            phone_at_borrow,
            books (
                id,
                name,
                author,
                library_id,
                libraries (name)
            ),
            members (
                id,
                name,
                email
            )
        `)
    .is("returned_at", null)
    .lt("due_date", now.toISOString());

  if (error) {
    console.error("Error fetching overdue borrowings:", error);
    return;
  }

  console.log(`Found ${overdueBorrowings?.length || 0} overdue borrowings`);

  // Send reminder for each overdue book
  for (const borrowing of overdueBorrowings || []) {
    const member = borrowing.members as unknown as {
      name: string;
      email: string;
    } | null;
    const book = borrowing.books as unknown as {
      name: string;
      author: string;
      libraries?: { name: string } | null;
    } | null;
    const library = book?.libraries;

    if (!member?.email) continue;

    const daysOverdue = differenceInDays(now, new Date(borrowing.due_date));

    await addEmailJob({
      type: "overdue-reminder",
      to: member.email,
      memberName: member.name,
      bookTitle: book?.name || "Unknown",
      bookAuthor: book?.author || "Unknown",
      libraryName: library?.name || "Library",
      dueDate: format(new Date(borrowing.due_date), "MMMM d, yyyy"),
      daysOverdue,
      borrowingId: borrowing.id,
    });

    console.log(`Queued overdue reminder for ${member.email}`);
  }
}

/**
 * Processes borrowings due within 24 hours and queues reminder emails.
 * Fetches active borrowings with due dates in the next day,
 * then sends due-soon reminder emails to each member.
 *
 * @remarks
 * Uses Supabase admin client to bypass RLS for cross-library access.
 */
export async function processDueReminders() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(tomorrow.getHours() + 24);

  // Get borrowings due in next 24 hours
  const { data: dueSoonBorrowings, error } = await supabase
    .from("borrowings")
    .select(`
            id,
            due_date,
            books (
                id,
                name,
                author,
                library_id,
                libraries (name)
            ),
            members (
                id,
                name,
                email
            )
        `)
    .is("returned_at", null)
    .gte("due_date", now.toISOString())
    .lte("due_date", tomorrow.toISOString());

  if (error) {
    console.error("Error fetching due soon borrowings:", error);
    return;
  }

  console.log(`Found ${dueSoonBorrowings?.length || 0} books due in 24 hours`);

  for (const borrowing of dueSoonBorrowings || []) {
    const member = borrowing.members as unknown as {
      name: string;
      email: string;
    } | null;
    const book = borrowing.books as unknown as {
      name: string;
      author: string;
      libraries?: { name: string } | null;
    } | null;
    const library = book?.libraries;

    if (!member?.email) continue;

    await addEmailJob({
      type: "due-reminder",
      to: member.email,
      memberName: member.name,
      bookTitle: book?.name || "Unknown",
      bookAuthor: book?.author || "Unknown",
      libraryName: library?.name || "Library",
      dueDate: format(new Date(borrowing.due_date), "MMMM d, yyyy"),
      borrowingId: borrowing.id,
    });

    console.log(`Queued due reminder for ${member.email}`);
  }
}
