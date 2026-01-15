import { z } from "zod";

/**
 * Schema for adding a new book
 */
export const AddBookSchema = z.object({
  name: z.string().min(1, "Book name is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  total_copies: z.coerce.number().min(1, "Must have at least 1 copy").default(1),
});

export type AddBookInput = z.infer<typeof AddBookSchema>;

/**
 * Schema for updating a book
 */
export const UpdateBookSchema = z.object({
  name: z.string().min(1, "Book name is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  total_copies: z.coerce.number().min(1, "Must have at least 1 copy"),
});

export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
