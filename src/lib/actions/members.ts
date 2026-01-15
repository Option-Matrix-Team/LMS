"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AddMemberSchema, UpdateMemberSchema } from "@/lib/validations/members";

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

  // Validate input
  const result = AddMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    address: formData.get("address") || null,
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { name, email, phone, address } = result.data;

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

  // Validate input
  const result = UpdateMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    address: formData.get("address") || null,
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { name, email, phone, address } = result.data;

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
