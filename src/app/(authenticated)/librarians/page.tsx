import { redirect } from "next/navigation";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LibrariansClient } from "./librarians-client";

export default async function LibrariansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user is library admin
  const adminClient = getSupabaseAdmin();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, library_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "library_admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          Only Library Admins can manage staff members.
        </p>
      </div>
    );
  }

  if (!profile?.library_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">
          No Library Assigned
        </h2>
        <p className="text-muted-foreground">
          You need to be assigned to a library first.
        </p>
      </div>
    );
  }

  // Get all librarians in this library
  const { data: librarians } = await adminClient
    .from("profiles")
    .select("*")
    .eq("library_id", profile.library_id)
    .in("role", ["librarian", "library_admin"])
    .order("role", { ascending: false }) // Admins first
    .order("created_at", { ascending: false });

  return (
    <LibrariansClient
      initialLibrarians={librarians || []}
      currentUserId={user.id}
    />
  );
}
