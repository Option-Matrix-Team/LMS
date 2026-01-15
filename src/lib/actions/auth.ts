"use server";

import { redirect } from "next/navigation";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signInWithOtp(email: string) {
  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://lms-production-7a65.up.railway.app";

  // shouldCreateUser: false - Only existing users can login
  // New users must be created by system operators
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("SignInWithOtp error:", error);

    // Provide user-friendly error for unregistered users
    if (
      error.message.includes("Signups not allowed") ||
      error.message.includes("User not found")
    ) {
      return {
        error:
          "This email is not registered. Please contact your administrator to get access.",
      };
    }

    return { error: error.message };
  }

  return { success: true, message: "Check your email for the login code" };
}

/**
 * Verifies OTP token and completes email authentication.
 * Creates user profile if it doesn't exist after successful verification.
 * 
 * @param email - User's email address
 * @param token - OTP token from email
 * @returns Success result or error message
 */
export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("VerifyOtp error:", error);
    return { error: error.message };
  }

  // Create profile using admin client (bypasses RLS)
  if (data.user) {
    try {
      const adminClient = getSupabaseAdmin();

      // Check if profile exists
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // Create profile using admin client
        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: data.user.id,
            email: data.user.email ?? "",
            name: null,
            role: "librarian",
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail login if profile creation fails - user can still login
        }
      }
    } catch (err) {
      console.error("Profile check/create error:", err);
    }
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, libraries(*)")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Ensures a user profile exists for the authenticated user.
 * Creates a default librarian profile if one doesn't exist.
 * Called from dashboard to handle edge cases.
 * 
 * @returns User profile with library data, or null if not authenticated
 */
export async function ensureProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = getSupabaseAdmin();

  // Check if profile exists
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    // Create profile
    await adminClient.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      name: null,
      role: "librarian",
    });

    // Fetch the newly created profile
    const { data: newProfile } = await adminClient
      .from("profiles")
      .select("*, libraries(*)")
      .eq("id", user.id)
      .single();

    return newProfile;
  }

  return existingProfile;
}
