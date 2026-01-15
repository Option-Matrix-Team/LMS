// Re-export database types from Supabase
import type { Database } from "./database.types";

// Export the Database type for direct use
export type { Database };

// Table row types using generated types
export type Library = Database["public"]["Tables"]["libraries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Borrowing = Database["public"]["Tables"]["borrowings"]["Row"];
export type BorrowingPolicy = Database["public"]["Tables"]["borrowing_policies"]["Row"];

// Insert types
export type LibraryInsert = Database["public"]["Tables"]["libraries"]["Insert"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type BookInsert = Database["public"]["Tables"]["books"]["Insert"];
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
export type BorrowingInsert = Database["public"]["Tables"]["borrowings"]["Insert"];
export type BorrowingPolicyInsert = Database["public"]["Tables"]["borrowing_policies"]["Insert"];

// Update types
export type LibraryUpdate = Database["public"]["Tables"]["libraries"]["Update"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type BookUpdate = Database["public"]["Tables"]["books"]["Update"];
export type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];
export type BorrowingUpdate = Database["public"]["Tables"]["borrowings"]["Update"];
export type BorrowingPolicyUpdate = Database["public"]["Tables"]["borrowing_policies"]["Update"];

// Custom union types
export type UserRole = "system_operator" | "library_admin" | "librarian";

// Extended types with relationships (for queries with joins)
export interface ProfileWithLibrary extends Profile {
  libraries?: Library | null;
}

export interface BorrowingWithRelations extends Borrowing {
  books?: Book | null;
  members?: Member | null;
}

export interface BookWithLibrary extends Book {
  libraries?: Library | null;
}
