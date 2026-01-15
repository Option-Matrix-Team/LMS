"use server";

import { revalidatePath } from "next/cache";
import getSupabaseAdmin from "@/lib/supabase/admin";

export async function updateUserRole(
  userId: string,
  role: string,
  libraryId: string | null,
) {
  const adminClient = getSupabaseAdmin();

  const { error } = await adminClient
    .from("profiles")
    .update({
      role,
      library_id: libraryId,
    })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/users");
  return { success: true };
}

export async function removeUserFromLibrary(userId: string) {
  const adminClient = getSupabaseAdmin();

  const { error } = await adminClient
    .from("profiles")
    .update({
      library_id: null,
      role: "librarian", // Reset to default role
    })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/users");
  return { success: true };
}

// Create a new user (System Operator only)
// Creates both the auth user and profile
export async function createUser(data: {
  email: string;
  name: string;
  role: "system_operator" | "library_admin" | "librarian";
  libraryId?: string;
}) {
  const adminClient = getSupabaseAdmin();

  // Check if user already exists
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", data.email)
    .single();

  if (existingProfile) {
    throw new Error("A user with this email already exists");
  }

  // Create auth user using admin API
  const { data: authUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email: data.email,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: data.name,
      },
    });

  if (authError) {
    console.error("Create auth user error:", authError);
    throw new Error(authError.message);
  }

  if (!authUser.user) {
    throw new Error("Failed to create user");
  }

  // Create profile
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: authUser.user.id,
    email: data.email,
    name: data.name,
    role: data.role,
    library_id: data.libraryId || null,
  });

  if (profileError) {
    console.error("Create profile error:", profileError);
    // Try to clean up the auth user if profile creation fails
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    throw new Error("Failed to create user profile");
  }

  revalidatePath("/users");
  return { success: true, userId: authUser.user.id };
}

// Delete a user (System Operator only)
export async function deleteUser(userId: string) {
  const adminClient = getSupabaseAdmin();

  // Delete profile first
  const { error: profileError } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Delete profile error:", profileError);
    throw new Error("Failed to delete user profile");
  }

  // Delete auth user
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Delete auth user error:", authError);
    throw new Error("Failed to delete user authentication");
  }

  revalidatePath("/users");
  return { success: true };
}
