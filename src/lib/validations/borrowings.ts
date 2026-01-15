import { z } from "zod";

/**
 * Schema for issuing a book to a member
 */
export const IssueBookSchema = z.object({
  book_id: z.string().uuid("Invalid book ID"),
  member_id: z.string().uuid("Invalid member ID"),
  phone: z.string().min(1, "Phone number is required"),
});

export type IssueBookInput = z.infer<typeof IssueBookSchema>;

/**
 * Schema for borrowing policy
 */
export const BorrowingPolicySchema = z.object({
  max_books_per_member: z.coerce.number().min(1, "Must allow at least 1 book"),
  borrow_duration_days: z.coerce.number().min(1, "Must be at least 1 day"),
  extension_duration_days: z.coerce.number().min(1, "Must be at least 1 day"),
});

export type BorrowingPolicyInput = z.infer<typeof BorrowingPolicySchema>;
