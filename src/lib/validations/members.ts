import { z } from "zod";

/**
 * Schema for adding a new member
 */
export const AddMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type AddMemberInput = z.infer<typeof AddMemberSchema>;

/**
 * Schema for updating a member
 */
export const UpdateMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
