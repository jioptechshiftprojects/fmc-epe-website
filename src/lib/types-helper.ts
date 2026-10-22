// Shim so hooks.ts has a stable import surface; re-export from supabase-js if needed.
export type PostgrestResponse<T> = { data: T[] | null; error: { message: string } | null };
