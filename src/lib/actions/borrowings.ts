"use server";

import { revalidatePath } from "next/cache";
import {
  queueBorrowedEmail,
  queueExtendedEmail,
  queueReturnedEmail,
} from "@/lib/email/notifications";
import { createClient } from "@/lib/supabase/server";
import { IssueBookSchema } from "@/lib/validations/borrowings";

/**
 * Issues a book to a library member.
 * Validates member eligibility, updates book availability,
 * and queues notification email.
 * 
 * @param formData - Form data containing book_id, member_id, and phone
 * @returns Success result object
 * @throws Error if user not authenticated, no library assigned, or member has overdue books
 */
export async function issueBook(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("library_id, libraries(name)")
    .eq("id", user.id)
    .single();

  if (!profile?.library_id) throw new Error("No library assigned");

  // Validate input
  const result = IssueBookSchema.safeParse({
    book_id: formData.get("book_id"),
    member_id: formData.get("member_id"),
    phone: formData.get("phone"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { book_id: bookId, member_id: memberId, phone } = result.data;

  // Check if member has overdue books
  const { data: overdueBooks } = await supabase
    .from("borrowings")
    .select("id")
    .eq("member_id", memberId)
    .is("returned_at", null)
    .lt("due_date", new Date().toISOString());

  if (overdueBooks && overdueBooks.length > 0) {
    throw new Error("Member has overdue books. Cannot issue new book.");
  }

  // Update member phone
  await supabase.from("members").update({ phone }).eq("id", memberId);

  // Get book and member details for email
  const { data: book } = await supabase
    .from("books")
    .select("name, author")
    .eq("id", bookId)
    .single();

  const { data: member } = await supabase
    .from("members")
    .select("name, email")
    .eq("id", memberId)
    .single();

  // Get borrow duration from policy
  const { data: policy } = await supabase
    .from("borrowing_policies")
    .select("borrow_duration_days")
    .eq("library_id", profile.library_id)
    .single();

  const borrowDuration = policy?.borrow_duration_days || 14;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + borrowDuration);

  // Create borrowing record
  const { data: newBorrowing, error } = await supabase
    .from("borrowings")
    .insert({
      book_id: bookId,
      member_id: memberId,
      librarian_id: user.id,
      due_date: dueDate.toISOString(),
      phone_at_borrow: phone,
    })
    .select("id")
    .single();

  if (error) throw error;

  // Decrease available copies
  await supabase.rpc("decrement_book_copies", { book_id: bookId });

  // Queue email notification
  if (member?.email && book && newBorrowing) {
    try {
      const libraryName = (profile.libraries as { name?: string })?.name || "Library";
      await queueBorrowedEmail(
        { name: member.name, email: member.email },
        { name: book.name, author: book.author },
        { name: libraryName },
        dueDate,
        newBorrowing.id,
      );
    } catch (emailError) {
      console.error("Failed to queue email:", emailError);
      // Don't fail the borrow operation if email fails
    }
  }

  revalidatePath("/borrowings");
  return { success: true };
}

/**
 * Processes a book return for a borrowing record.
 * Marks the borrowing as returned, increases available copies,
 * and queues return confirmation email.
 * 
 * @param borrowingId - UUID of the borrowing record to return
 * @returns Success result object
 * @throws Error if borrowing not found
 */
export async function returnBook(borrowingId: string) {
  const supabase = await createClient();

  // Get borrowing with book and member details for email
  const { data: borrowing } = await supabase
    .from("borrowings")
    .select(
      "book_id, books(name, author, library_id, libraries(name)), members(name, email)",
    )
    .eq("id", borrowingId)
    .single();

  if (!borrowing) throw new Error("Borrowing not found");

  // Mark as returned
  const { error } = await supabase
    .from("borrowings")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", borrowingId);

  if (error) throw error;

  // Increase available copies
  await supabase.rpc("increment_book_copies", { book_id: borrowing.book_id });

  // Queue email notification
  const member = borrowing.members as { name: string; email: string } | null;
  const book = borrowing.books as { name: string; author: string; libraries?: { name: string } | null } | null;
  if (member?.email && book) {
    try {
      const libraryName = book.libraries?.name || "Library";
      await queueReturnedEmail(
        { name: member.name, email: member.email },
        { name: book.name, author: book.author },
        { name: libraryName },
        borrowingId,
      );
    } catch (emailError) {
      console.error("Failed to queue email:", emailError);
    }
  }

  revalidatePath("/borrowings");
  revalidatePath("/overdue");
  return { success: true };
}

/**
 * Extends the due date for an existing borrowing.
 * Applies library's extension policy and queues notification email.
 * Each borrowing can only be extended once.
 * 
 * @param borrowingId - UUID of the borrowing record to extend
 * @returns Success result object
 * @throws Error if user not authenticated, borrowing not found, or already extended
 */
export async function extendBorrowing(borrowingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("library_id")
    .eq("id", user.id)
    .single();

  if (!profile?.library_id) throw new Error("No library assigned");

  // Get extension duration from policy
  const { data: policy } = await supabase
    .from("borrowing_policies")
    .select("extension_duration_days")
    .eq("library_id", profile.library_id)
    .single();

  const extensionDays = policy?.extension_duration_days || 7;

  // Get borrowing with book and member details
  const { data: borrowing } = await supabase
    .from("borrowings")
    .select(
      "due_date, extended_at, books(name, author, libraries(name)), members(name, email)",
    )
    .eq("id", borrowingId)
    .single();

  if (!borrowing) throw new Error("Borrowing not found");
  if (borrowing.extended_at) throw new Error("Book has already been extended");

  const newDueDate = new Date(borrowing.due_date);
  newDueDate.setDate(newDueDate.getDate() + extensionDays);

  const { error } = await supabase
    .from("borrowings")
    .update({
      due_date: newDueDate.toISOString(),
      extended_at: new Date().toISOString(),
    })
    .eq("id", borrowingId);

  if (error) throw error;

  // Queue email notification
  const member = borrowing.members as { name: string; email: string } | null;
  const book = borrowing.books as { name: string; author: string; libraries?: { name: string } | null } | null;
  if (member?.email && book) {
    try {
      const libraryName = book.libraries?.name || "Library";
      await queueExtendedEmail(
        { name: member.name, email: member.email },
        { name: book.name, author: book.author },
        { name: libraryName },
        newDueDate,
        borrowingId,
      );
    } catch (emailError) {
      console.error("Failed to queue email:", emailError);
    }
  }

  revalidatePath("/borrowings");
  revalidatePath("/overdue");
  return { success: true };
}
