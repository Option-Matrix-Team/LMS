"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AddBookSchema, UpdateBookSchema } from "@/lib/validations/books";

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

  // Validate input
  const result = AddBookSchema.safeParse({
    name: formData.get("name"),
    author: formData.get("author"),
    isbn: formData.get("isbn") || null,
    description: formData.get("description") || null,
    location: formData.get("location") || null,
    total_copies: formData.get("total_copies"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { name, author, isbn, description, location, total_copies } =
    result.data;

  const { data, error } = await supabase
    .from("books")
    .insert({
      library_id: profile.library_id,
      name,
      author,
      isbn,
      description,
      location,
      total_copies,
      available_copies: total_copies,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/catalog");
  return { success: true, bookId: data?.id };
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();

  // Validate input
  const result = UpdateBookSchema.safeParse({
    name: formData.get("name"),
    author: formData.get("author"),
    isbn: formData.get("isbn") || null,
    description: formData.get("description") || null,
    location: formData.get("location") || null,
    total_copies: formData.get("total_copies"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { name, author, isbn, description, location, total_copies } =
    result.data;

  const { error } = await supabase
    .from("books")
    .update({
      name,
      author,
      isbn,
      description,
      location,
      total_copies,
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
