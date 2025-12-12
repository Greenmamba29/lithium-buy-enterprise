import { createClient } from "@supabase/supabase-js";

function ensureSupabaseEnv() {
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }

  if (process.env.NODE_ENV === "test") {
    if (!process.env.SUPABASE_URL) {
      process.env.SUPABASE_URL = "https://example.supabase.test";
      console.warn("Using placeholder SUPABASE_URL for tests; set a real value if needed.");
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
      console.warn(
        "Using placeholder SUPABASE_SERVICE_ROLE_KEY for tests; set a real value if needed."
      );
    }
  }
}

ensureSupabaseEnv();

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

/**
 * Supabase client for server-side operations
 * Uses service role key for admin operations
 * DO NOT expose this key to the client
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase client for user operations
 * Uses anon key - respects RLS policies
 */
export const supabase = process.env.SUPABASE_ANON_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    )
  : supabaseAdmin;




