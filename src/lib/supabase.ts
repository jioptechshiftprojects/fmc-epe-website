import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Public Supabase client used by the browser.
 * - Uses the ANON (publishable) key only.
 * - The service-role key must NEVER appear here; it lives only
 *   in Supabase Edge Function secrets (server side).
 * - Row Level Security on every table is the real access control;
 *   this key is not a secret and is safe to ship in the bundle.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
