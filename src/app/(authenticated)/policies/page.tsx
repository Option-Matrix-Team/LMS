import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBorrowingPolicy } from "@/lib/actions/policies";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PoliciesClient } from "./policies-client";

export const metadata: Metadata = {
  title: "Policies",
  description: "Configure library borrowing policies",
};
export default async function PoliciesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile
  const adminClient = getSupabaseAdmin();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, library_id")
    .eq("id", user.id)
    .single();

  // Only library admins and librarians can view policies
  if (!profile?.library_id || profile.role === "system_operator") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          Only library staff can view borrowing policies.
        </p>
      </div>
    );
  }

  // Get current policy
  const policy = await getBorrowingPolicy();
  const isAdmin = profile.role === "library_admin";

  return <PoliciesClient initialPolicy={policy} isAdmin={isAdmin} />;
}
