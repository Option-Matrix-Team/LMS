'use server';

import { createClient } from '@/lib/supabase/server';
import getSupabaseAdmin from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function signInWithOtp(email: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: 'https://lms-production-7a65.up.railway.app/auth/callback',
        },
    });

    if (error) {
        console.error('SignInWithOtp error:', error);
        return { error: error.message };
    }

    return { success: true, message: 'Check your email for the login link' };
}

export async function verifyOtp(email: string, token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    });

    if (error) {
        console.error('VerifyOtp error:', error);
        return { error: error.message };
    }

    // Create profile using admin client (bypasses RLS)
    if (data.user) {
        try {
            const adminClient = getSupabaseAdmin();
            
            // Check if profile exists
            const { data: existingProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!existingProfile) {
                // Create profile using admin client
                const { error: profileError } = await adminClient
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        name: null,
                        role: 'librarian',
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Don't fail login if profile creation fails - user can still login
                }
            }
        } catch (err) {
            console.error('Profile check/create error:', err);
        }
    }

    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, libraries(*)')
        .eq('id', user.id)
        .single();

    return profile;
}

// Helper to ensure profile exists (call from dashboard)
export async function ensureProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const adminClient = getSupabaseAdmin();
    
    // Check if profile exists
    const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!existingProfile) {
        // Create profile
        await adminClient.from('profiles').insert({
            id: user.id,
            email: user.email,
            name: null,
            role: 'librarian',
        });

        // Fetch the newly created profile
        const { data: newProfile } = await adminClient
            .from('profiles')
            .select('*, libraries(*)')
            .eq('id', user.id)
            .single();

        return newProfile;
    }

    return existingProfile;
}
