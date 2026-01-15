import { createClient } from "@/lib/supabase/server";

/**
 * Get all members for the current user's library
 */
export async function getMembers() {
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
    .from("members")
    .select("*")
    .eq("library_id", profile.library_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Find members by email or phone
 */
export async function findMemberByEmailOrPhone(query: string) {
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
    .from("members")
    .select("*")
    .eq("library_id", profile.library_id)
    .or(`email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}
