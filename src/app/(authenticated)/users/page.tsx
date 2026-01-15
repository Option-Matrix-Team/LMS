import { redirect } from "next/navigation";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/queries/users";
import { getLibraries } from "@/lib/queries/libraries";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user is system operator
  const adminClient = getSupabaseAdmin();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "system_operator") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          Only System Operators can access this page.
        </p>
      </div>
    );
  }

  const [users, libraries] = await Promise.all([
    getAllUsers(),
    getLibraries(),
  ]);

  return (
    <UsersClient initialUsers={users || []} allLibraries={libraries || []} />
  );
}
