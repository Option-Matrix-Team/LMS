import getSupabaseAdmin from "@/lib/supabase/admin";

/**
 * Get all libraries (System Operator only)
 */
export async function getLibraries() {
  const adminClient = getSupabaseAdmin();

  const { data, error } = await adminClient
    .from("libraries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all library admins for a specific library
 */
export async function getLibraryAdmins(libraryId: string) {
  const adminClient = getSupabaseAdmin();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("library_id", libraryId)
    .eq("role", "library_admin");

  if (error) throw error;
  return data;
}
