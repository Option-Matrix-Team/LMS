import { render } from "@react-email/components";
import { Resend } from "resend";
import BookBorrowedEmail from "@/lib/emails/BookBorrowed";
import BookExtendedEmail from "@/lib/emails/BookExtended";
import BookReturnedEmail from "@/lib/emails/BookReturned";
import DueReminderEmail from "@/lib/emails/DueReminder";
import OverdueReminderEmail from "@/lib/emails/OverdueReminder";
import type { EmailJobData, EmailJobType } from "./queue";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Get email subject based on type
function getSubject(type: EmailJobType, bookTitle: string): string {
  switch (type) {
    case "book-borrowed":
      return `You have borrowed: ${bookTitle}`;
    case "book-returned":
      return `Book returned: ${bookTitle}`;
    case "book-extended":
      return `Borrowing extended: ${bookTitle}`;
    case "due-reminder":
      return `Reminder: ${bookTitle} is due tomorrow`;
    case "overdue-reminder":
      return `OVERDUE: ${bookTitle} needs to be returned`;
    default:
      return `Library Notification`;
  }
}

// Render email template based on type
async function renderEmail(data: EmailJobData): Promise<string> {
  switch (data.type) {
    case "book-borrowed":
      return render(
        BookBorrowedEmail({
          memberName: data.memberName,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          dueDate: data.dueDate || "",
          libraryName: data.libraryName,
        }),
      );

    case "book-returned":
      return render(
        BookReturnedEmail({
          memberName: data.memberName,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          libraryName: data.libraryName,
        }),
      );

    case "book-extended":
      return render(
        BookExtendedEmail({
          memberName: data.memberName,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          newDueDate: data.newDueDate || "",
          libraryName: data.libraryName,
        }),
      );

    case "due-reminder":
      return render(
        DueReminderEmail({
          memberName: data.memberName,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          dueDate: data.dueDate || "",
          libraryName: data.libraryName,
        }),
      );

    case "overdue-reminder":
      return render(
        OverdueReminderEmail({
          memberName: data.memberName,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          dueDate: data.dueDate || "",
          daysOverdue: data.daysOverdue || 1,
          libraryName: data.libraryName,
        }),
      );

    default:
      throw new Error(`Unknown email type: ${data.type}`);
  }
}

// Send email using Resend
export async function sendEmail(
  data: EmailJobData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await renderEmail(data);
    const subject = getSubject(data.type, data.bookTitle);

    const { data: result, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Library <onboarding@resend.dev>",
      to: data.to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`Email sent successfully: ${result?.id}`);
    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
