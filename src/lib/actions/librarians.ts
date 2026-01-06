'use server';

import getSupabaseAdmin from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get current user's library ID
async function getCurrentUserLibraryId() {
    const supabase = await createClient();
    const adminClient = getSupabaseAdmin();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await adminClient
        .from('profiles')
        .select('library_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.library_id) throw new Error('No library assigned');
    if (profile.role !== 'library_admin') throw new Error('Only library admins can manage staff');

    return { userId: user.id, libraryId: profile.library_id };
}

// Get all librarians in the current library
export async function getLibrarians() {
    const { libraryId } = await getCurrentUserLibraryId();
    const adminClient = getSupabaseAdmin();

    const { data, error } = await adminClient
        .from('profiles')
        .select('*')
        .eq('library_id', libraryId)
        .in('role', ['librarian', 'library_admin'])
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Add an existing user as librarian to this library
export async function addLibrarianByEmail(email: string) {
    const { libraryId, userId } = await getCurrentUserLibraryId();
    const adminClient = getSupabaseAdmin();

    // Find user by email
    const { data: existingUser } = await adminClient
        .from('profiles')
        .select('id, library_id, role')
        .eq('email', email.toLowerCase().trim())
        .single();

    if (!existingUser) {
        return { error: 'User not found. They need to sign up first.' };
    }

    if (existingUser.id === userId) {
        return { error: 'You cannot add yourself as a librarian.' };
    }

    if (existingUser.library_id) {
        return { error: 'User is already assigned to a library.' };
    }

    if (existingUser.role === 'system_operator') {
        return { error: 'Cannot assign system operators to libraries.' };
    }

    // Assign user to this library as librarian
    const { error } = await adminClient
        .from('profiles')
        .update({ 
            library_id: libraryId, 
            role: 'librarian' 
        })
        .eq('id', existingUser.id);

    if (error) throw error;

    revalidatePath('/librarians');
    return { success: true };
}

// Update librarian role (promote to library_admin or demote to librarian)
export async function updateLibrarianRole(librarianId: string, newRole: 'librarian' | 'library_admin') {
    const { libraryId, userId } = await getCurrentUserLibraryId();
    const adminClient = getSupabaseAdmin();

    // Verify the target user is in the same library
    const { data: targetUser } = await adminClient
        .from('profiles')
        .select('library_id')
        .eq('id', librarianId)
        .single();

    if (!targetUser || targetUser.library_id !== libraryId) {
        return { error: 'User not found in your library.' };
    }

    if (librarianId === userId) {
        return { error: 'You cannot change your own role.' };
    }

    const { error } = await adminClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', librarianId);

    if (error) throw error;

    revalidatePath('/librarians');
    return { success: true };
}

// Remove librarian from library
export async function removeLibrarian(librarianId: string) {
    const { libraryId, userId } = await getCurrentUserLibraryId();
    const adminClient = getSupabaseAdmin();

    // Verify the target user is in the same library
    const { data: targetUser } = await adminClient
        .from('profiles')
        .select('library_id')
        .eq('id', librarianId)
        .single();

    if (!targetUser || targetUser.library_id !== libraryId) {
        return { error: 'User not found in your library.' };
    }

    if (librarianId === userId) {
        return { error: 'You cannot remove yourself from the library.' };
    }

    // Remove from library (set library_id to null, reset role to librarian)
    const { error } = await adminClient
        .from('profiles')
        .update({ 
            library_id: null, 
            role: 'librarian' 
        })
        .eq('id', librarianId);

    if (error) throw error;

    revalidatePath('/librarians');
    return { success: true };
}
