import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOverdueBorrowings } from "@/lib/queries/borrowings";
import { OverdueClient } from "./overdue-client";

export default async function OverduePage() {
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

  const borrowings = await getOverdueBorrowings();

  return <OverdueClient initialBorrowings={borrowings || []} />;
}
