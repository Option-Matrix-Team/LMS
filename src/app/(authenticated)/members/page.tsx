import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMembers } from "@/lib/queries/members";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("library_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.library_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No Library Assigned</h2>
        <p className="text-muted-foreground">
          Please contact your administrator to assign you to a library.
        </p>
      </div>
    );
  }

  const members = await getMembers();

  return <MembersClient initialMembers={members || []} />;
}
