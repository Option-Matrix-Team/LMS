"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function addMember(formData: FormData) {
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

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const address = (formData.get("address") as string) || null;

  const { error } = await supabase.from("members").insert({
    library_id: profile.library_id,
    name,
    email,
    phone,
    address,
  });

  if (error) throw error;

  revalidatePath("/members");
  return { success: true };
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const address = (formData.get("address") as string) || null;

  const { error } = await supabase
    .from("members")
    .update({ name, email, phone, address })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/members");
  return { success: true };
}

export async function deleteMember(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/members");
  return { success: true };
}

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
