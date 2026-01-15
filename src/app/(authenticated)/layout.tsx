import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure profile exists (using admin client to bypass RLS)
  const adminClient = getSupabaseAdmin();

  let { data: profile } = await adminClient
    .from("profiles")
    .select("*, libraries(*)")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create it
  if (!profile) {
    await adminClient.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      name: null,
      role: "librarian",
    });

    // Fetch the newly created profile
    const { data: newProfile } = await adminClient
      .from("profiles")
      .select("*, libraries(*)")
      .eq("id", user.id)
      .single();

    profile = newProfile;
  }

  const userRole = (profile?.role ?? "librarian") as UserRole;
  const userName = profile?.name || user.email;
  const libraryName = profile?.libraries?.name || null;

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        userRole={userRole}
        userName={userName}
        libraryName={libraryName}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
