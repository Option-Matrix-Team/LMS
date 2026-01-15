import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLibraries } from "@/lib/queries/libraries";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LibrariesClient } from "./libraries-client";

export const metadata: Metadata = {
  title: "Libraries",
  description: "Manage library organizations",
};
export default async function LibrariesPage() {
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

  const libraries = await getLibraries();

  return <LibrariesClient initialLibraries={libraries || []} />;
}
