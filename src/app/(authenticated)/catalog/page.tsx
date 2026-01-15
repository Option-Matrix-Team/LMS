import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CatalogClient } from "./catalog-client";

export default async function CatalogPage() {
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

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("library_id", profile.library_id)
    .order("created_at", { ascending: false });

  return <CatalogClient initialBooks={books || []} />;
}
