import getSupabaseAdmin from "@/lib/supabase/admin";

/**
 * Get all users with their library information
 */
export async function getAllUsers() {
  const adminClient = getSupabaseAdmin();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*, libraries(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get users not assigned to any library
 */
export async function getUnassignedUsers() {
  const adminClient = getSupabaseAdmin();

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .is("library_id", null)
    .neq("role", "system_operator")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get stats for all libraries (System Operator dashboard)
 */
export async function getLibraryStats() {
  const adminClient = getSupabaseAdmin();

  // Get all libraries with counts
  const { data: libraries } = await adminClient
    .from("libraries")
    .select("id, name");

  if (!libraries) return [];

  const stats = await Promise.all(
    libraries.map(async (library) => {
      const [booksRes, membersRes, usersRes, borrowingsRes] = await Promise.all(
        [
          adminClient
            .from("books")
            .select("id", { count: "exact", head: true })
            .eq("library_id", library.id),
          adminClient
            .from("members")
            .select("id", { count: "exact", head: true })
            .eq("library_id", library.id),
          adminClient
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("library_id", library.id),
          adminClient
            .from("borrowings")
            .select("id", { count: "exact", head: true })
            .in(
              "book_id",
              (
                await adminClient
                  .from("books")
                  .select("id")
                  .eq("library_id", library.id)
              ).data?.map((b) => b.id) || [],
            )
            .is("returned_at", null),
        ],
      );

      return {
        id: library.id,
        name: library.name,
        books: booksRes.count || 0,
        members: membersRes.count || 0,
        users: usersRes.count || 0,
        activeBorrowings: borrowingsRes.count || 0,
      };
    }),
  );

  return stats;
}
