import { z } from "zod";

/**
 * Fail-fast validation of public environment variables.
 * The app refuses to boot with missing/invalid configuration
 * so misconfiguration is never silently deployed.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(20, "VITE_SUPABASE_ANON_KEY looks too short"),
});

export const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
