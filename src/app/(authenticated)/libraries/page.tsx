import { createClient } from '@/lib/supabase/server';
import getSupabaseAdmin from '@/lib/supabase/admin';
import { LibrariesClient } from './libraries-client';
import { redirect } from 'next/navigation';

export default async function LibrariesPage() {
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

    // Get all libraries
    const { data: libraries } = await adminClient
        .from('libraries')
        .select('*')
        .order('created_at', { ascending: false });

    return <LibrariesClient initialLibraries={libraries || []} />;
}
