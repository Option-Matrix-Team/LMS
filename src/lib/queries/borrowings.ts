import { createClient } from "@/lib/supabase/server";

/**
 * Get all active borrowings for the current user's library
 */
export async function getBorrowings() {
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
    .from("borrowings")
    .select("*, books(*), members(*)")
    .eq("books.library_id", profile.library_id)
    .is("returned_at", null)
    .order("borrowed_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get overdue borrowings for the current user's library
 */
export async function getOverdueBorrowings() {
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
    .from("borrowings")
    .select("*, books(*), members(*)")
    .eq("books.library_id", profile.library_id)
    .is("returned_at", null)
    .lt("due_date", new Date().toISOString())
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}
