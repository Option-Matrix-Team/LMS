import { createClient } from '@/lib/supabase/server';
import { OverdueClient } from './overdue-client';
import { redirect } from 'next/navigation';

export default async function OverduePage() {
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

    const { data: borrowings } = await supabase
        .from('borrowings')
        .select('*, books(*), members(*)')
        .is('returned_at', null)
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true });

    // Filter to library's books only
    const libraryBorrowings = (borrowings || []).filter(
        b => b.books?.library_id === profile.library_id
    );

    return <OverdueClient initialBorrowings={libraryBorrowings} />;
}
