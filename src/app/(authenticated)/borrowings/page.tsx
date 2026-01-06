import { createClient } from '@/lib/supabase/server';
import { BorrowingsClient } from './borrowings-client';
import { redirect } from 'next/navigation';

export default async function BorrowingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('library_id, role')
        .eq('id', user.id)
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

    const [borrowingsRes, booksRes, membersRes] = await Promise.all([
        supabase
            .from('borrowings')
            .select('*, books(*), members(*)')
            .is('returned_at', null)
            .order('borrowed_at', { ascending: false }),
        supabase
            .from('books')
            .select('*')
            .eq('library_id', profile.library_id),
        supabase
            .from('members')
            .select('*')
            .eq('library_id', profile.library_id),
    ]);

    // Filter borrowings to only show those from current library's books
    const libraryBorrowings = (borrowingsRes.data || []).filter(
        b => b.books?.library_id === profile.library_id
    );

    return (
        <BorrowingsClient 
            initialBorrowings={libraryBorrowings}
            books={booksRes.data || []}
            members={membersRes.data || []}
        />
    );
}
