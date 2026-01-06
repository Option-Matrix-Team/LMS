export type UserRole = 'system_operator' | 'library_admin' | 'librarian';

export interface Library {
    id: string;
    name: string;
    address: string | null;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    library_id: string | null;
    created_at: string;
    libraries?: Library;
}

export interface Book {
    id: string;
    library_id: string;
    name: string;
    author: string;
    description: string | null;
    isbn: string | null;
    location: string | null;
    thumbnail_url: string | null;
    available_copies: number;
    total_copies: number;
    created_at: string;
}

export interface Member {
    id: string;
    library_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    created_at: string;
}

export interface Borrowing {
    id: string;
    book_id: string;
    member_id: string;
    librarian_id: string;
    borrowed_at: string;
    due_date: string;
    returned_at: string | null;
    extended_at: string | null;
    phone_at_borrow: string;
    books?: Book;
    members?: Member;
}

export interface BorrowingPolicy {
    id: string;
    library_id: string;
    max_books_per_member: number;
    borrow_duration_days: number;
    extension_duration_days: number;
}
