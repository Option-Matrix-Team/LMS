"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getBooks() {
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
    .from("books")
    .select("*")
    .eq("library_id", profile.library_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addBook(formData: FormData) {
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
  const author = formData.get("author") as string;
  const isbn = (formData.get("isbn") as string) || null;
  const description = (formData.get("description") as string) || null;
  const location = (formData.get("location") as string) || null;
  const totalCopies = parseInt(formData.get("total_copies") as string) || 1;

  const { data, error } = await supabase
    .from("books")
    .insert({
      library_id: profile.library_id,
      name,
      author,
      isbn,
      description,
      location,
      total_copies: totalCopies,
      available_copies: totalCopies,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/catalog");
  return { success: true, bookId: data?.id };
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const author = formData.get("author") as string;
  const isbn = (formData.get("isbn") as string) || null;
  const description = (formData.get("description") as string) || null;
  const location = (formData.get("location") as string) || null;
  const totalCopies = parseInt(formData.get("total_copies") as string) || 1;

  const { error } = await supabase
    .from("books")
    .update({
      name,
      author,
      isbn,
      description,
      location,
      total_copies: totalCopies,
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/catalog");
  return { success: true };
}

export async function deleteBook(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/catalog");
  return { success: true };
}

export async function searchBooks(query: string) {
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
    .from("books")
    .select("*")
    .eq("library_id", profile.library_id)
    .or(`name.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
