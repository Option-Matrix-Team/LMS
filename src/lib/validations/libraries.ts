import { z } from "zod";

/**
 * Schema for creating a new library
 */
export const CreateLibrarySchema = z.object({
  name: z.string().min(1, "Library name is required"),
  address: z.string().optional().nullable(),
});

export type CreateLibraryInput = z.infer<typeof CreateLibrarySchema>;

/**
 * Schema for updating a library
 */
export const UpdateLibrarySchema = z.object({
  name: z.string().min(1, "Library name is required"),
  address: z.string().optional().nullable(),
});

export type UpdateLibraryInput = z.infer<typeof UpdateLibrarySchema>;
