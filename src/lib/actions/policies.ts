'use server';

import getSupabaseAdmin from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get current library's policy
export async function getBorrowingPolicy() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const adminClient = getSupabaseAdmin();
    
    // Get user's library
    const { data: profile } = await adminClient
        .from('profiles')
        .select('library_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.library_id) throw new Error('No library assigned');

    // Get policy for this library
    const { data: policy, error } = await adminClient
        .from('borrowing_policies')
        .select('*')
        .eq('library_id', profile.library_id)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    // Return defaults if no policy exists
    return policy || {
        library_id: profile.library_id,
        max_books_per_member: 5,
        borrow_duration_days: 14,
        extension_duration_days: 7,
    };
}

// Update or create borrowing policy
export async function updateBorrowingPolicy(data: {
    max_books_per_member: number;
    borrow_duration_days: number;
    extension_duration_days: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const adminClient = getSupabaseAdmin();
    
    // Get user's profile and check role
    const { data: profile } = await adminClient
        .from('profiles')
        .select('library_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.library_id) throw new Error('No library assigned');
    if (profile.role !== 'library_admin') {
        throw new Error('Only library admins can update policies');
    }

    // Validate input
    if (data.max_books_per_member < 1 || data.max_books_per_member > 50) {
        throw new Error('Max books must be between 1 and 50');
    }
    if (data.borrow_duration_days < 1 || data.borrow_duration_days > 365) {
        throw new Error('Borrow duration must be between 1 and 365 days');
    }
    if (data.extension_duration_days < 0 || data.extension_duration_days > 30) {
        throw new Error('Extension duration must be between 0 and 30 days');
    }

    // Check if policy exists
    const { data: existingPolicy } = await adminClient
        .from('borrowing_policies')
        .select('id')
        .eq('library_id', profile.library_id)
        .single();

    if (existingPolicy) {
        // Update existing policy
        const { error } = await adminClient
            .from('borrowing_policies')
            .update({
                max_books_per_member: data.max_books_per_member,
                borrow_duration_days: data.borrow_duration_days,
                extension_duration_days: data.extension_duration_days,
            })
            .eq('library_id', profile.library_id);

        if (error) throw error;
    } else {
        // Create new policy
        const { error } = await adminClient
            .from('borrowing_policies')
            .insert({
                library_id: profile.library_id,
                max_books_per_member: data.max_books_per_member,
                borrow_duration_days: data.borrow_duration_days,
                extension_duration_days: data.extension_duration_days,
            });

        if (error) throw error;
    }

    revalidatePath('/policies');
    return { success: true };
}
