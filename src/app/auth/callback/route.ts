import { createClient } from '@/lib/supabase/server'
import getSupabaseAdmin from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Use Railway URL for production, fallback to origin for local dev
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lms-production-7a65.up.railway.app';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    const supabase = await createClient()

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Ensure profile exists
            await ensureProfileExists(data.user.id, data.user.email!)
            return NextResponse.redirect(`${SITE_URL}/dashboard`)
        }
    }

    // Handle token_hash for email confirmation
    if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })

        if (!error && data.user) {
            // Ensure profile exists
            await ensureProfileExists(data.user.id, data.user.email!)
            return NextResponse.redirect(`${SITE_URL}/dashboard`)
        }
    }

    // Check if user is already logged in (magic link case)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await ensureProfileExists(user.id, user.email!)
        return NextResponse.redirect(`${SITE_URL}/dashboard`)
    }

    // Redirect to login on error
    return NextResponse.redirect(`${SITE_URL}/login?error=auth_callback_error`)
}

async function ensureProfileExists(userId: string, email: string) {
    try {
        const adminClient = getSupabaseAdmin()
        
        // Check if profile exists
        const { data: existingProfile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        if (!existingProfile) {
            // Create profile
            await adminClient.from('profiles').insert({
                id: userId,
                email: email,
                name: null,
                role: 'librarian',
            })
        }
    } catch (err) {
        console.error('Error ensuring profile exists:', err)
    }
}
