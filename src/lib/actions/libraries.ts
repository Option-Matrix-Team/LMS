"use server";

import { revalidatePath } from "next/cache";
import getSupabaseAdmin from "@/lib/supabase/admin";

export async function createLibrary(formData: FormData) {
  const adminClient = getSupabaseAdmin();

  const name = formData.get("name") as string;
  const address = (formData.get("address") as string) || null;

  const { data, error } = await adminClient
    .from("libraries")
    .insert({ name, address })
    .select()
    .single();

  if (error) throw error;

  // Create default borrowing policy for the library
  await adminClient.from("borrowing_policies").insert({
    library_id: data.id,
    max_books_per_member: 5,
    borrow_duration_days: 14,
    extension_duration_days: 7,
  });

  revalidatePath("/libraries");
  return { success: true, library: data };
}

export async function updateLibrary(id: string, formData: FormData) {
  const adminClient = getSupabaseAdmin();

  const name = formData.get("name") as string;
  const address = (formData.get("address") as string) || null;

  const { error } = await adminClient
    .from("libraries")
    .update({ name, address })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/libraries");
  return { success: true };
}

export async function deleteLibrary(id: string) {
  const adminClient = getSupabaseAdmin();

  const { error } = await adminClient.from("libraries").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/libraries");
  return { success: true };
}

export async function assignLibraryAdmin(libraryId: string, userId: string) {
  const adminClient = getSupabaseAdmin();

  const { error } = await adminClient
    .from("profiles")
    .update({ library_id: libraryId, role: "library_admin" })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/libraries");
  return { success: true };
}
