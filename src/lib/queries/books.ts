import { createClient } from "@/lib/supabase/server";

/**
 * Get all books for the current user's library
 */
export async function getBooks() {
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

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("library_id", profile.library_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Search books by name, author, or ISBN
 */
export async function searchBooks(query: string) {
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

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("library_id", profile.library_id)
    .or(`name.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
