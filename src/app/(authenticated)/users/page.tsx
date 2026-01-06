import { createClient } from '@/lib/supabase/server';
import getSupabaseAdmin from '@/lib/supabase/admin';
import { UsersClient } from './users-client';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Check if user is system operator
    const adminClient = getSupabaseAdmin();
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'system_operator') {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
                <p className="text-muted-foreground">
                    Only System Operators can access this page.
                </p>
            </div>
        );
    }

    // Get all users with their library info
    const { data: users } = await adminClient
        .from('profiles')
        .select('*, libraries(name)')
        .order('created_at', { ascending: false });

    // Get all libraries for the dropdown
    const { data: libraries } = await adminClient
        .from('libraries')
        .select('*')
        .order('name');

    return (
        <UsersClient 
            initialUsers={users || []} 
            allLibraries={libraries || []}
        />
    );
}
