import { z } from "zod";

/**
 * Valid user roles
 */
export const UserRoleSchema = z.enum(["system_operator", "library_admin", "librarian"]);

/**
 * Schema for creating a new user (System Operator only)
 */
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  role: UserRoleSchema,
  libraryId: z.string().uuid().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Schema for updating user role
 */
export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.string().min(1, "Role is required"),
  libraryId: z.string().uuid().nullable(),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
