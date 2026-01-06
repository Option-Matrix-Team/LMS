'use server';

import { createClient } from '@/lib/supabase/server';
import getSupabaseAdmin from '@/lib/supabase/admin';

export async function searchBooks(query: string) {
    const supabase = await createClient();
    const adminClient = getSupabaseAdmin();
    
    // Get current user's library
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await adminClient
        .from('profiles')
        .select('library_id')
        .eq('id', user.id)
        .single();

    if (!profile?.library_id) throw new Error('No library assigned');

    // Use the search function if query is provided
    if (query && query.trim()) {
        const { data, error } = await adminClient
            .rpc('search_books', {
                search_query: query.trim(),
                lib_id: profile.library_id,
            });

        if (error) {
            console.error('Search error:', error);
            // Fallback to basic ILIKE search if RPC fails
            return fallbackSearch(adminClient, profile.library_id, query);
        }

        return data || [];
    }

    // No query - return all books
    const { data, error } = await adminClient
        .from('books')
        .select('*')
        .eq('library_id', profile.library_id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

async function fallbackSearch(adminClient: any, libraryId: string, query: string) {
    // Fallback to basic ILIKE search
    const { data, error } = await adminClient
        .from('books')
        .select('*')
        .eq('library_id', libraryId)
        .or(`name.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
