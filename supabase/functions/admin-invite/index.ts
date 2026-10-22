/**
 * admin-invite — the ONLY way new privileged accounts are created.
 *
 * Why this exists: public self-registration is disabled in Supabase Auth,
 * and admin_profiles has no INSERT policy. A super_admin calls this function
 * (with their own session token) to invite a new staff account. The
 * service-role key is used here, server side, and is never shipped to browsers.
 *
 * Deploy:
 *   supabase functions deploy admin-invite
 *   supabase secrets set SERVICE_ROLE_KEY=<service-role-key>
 *
 * Invoke (from an authenticated super_admin session):
 *   POST { functionsUrl }/admin-invite
 *   Authorization: Bearer <user-access-token>
 *   body: { "email": "name@fmcepe.gov.ng", "full_name": "Jane Doe", "role": "content_admin" }
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const ROLES = ["super_admin", "content_admin", "hr_admin", "procurement_admin", "viewer"] as const;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // 1. Authenticate the CALLER with their own token (public client).
  const authHeader = req.headers.get("Authorization") ?? "";
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await callerClient.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // 2. Authorise: caller must be an ACTIVE super_admin (RLS-safe read via anon key:
  //    admin_profiles allows each user to read their own row).
  const { data: profile } = await callerClient
    .from("admin_profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.is_active || profile.role !== "super_admin") {
    return new Response("Forbidden: super_admin role required", { status: 403 });
  }

  // 3. Validate input.
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const fullName = String(body?.full_name ?? "").trim();
  const role = String(body?.role ?? "viewer");
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!emailOk || fullName.length < 2 || !(ROLES as readonly string[]).includes(role)) {
    return Response.json({ error: "Invalid email, full_name or role" }, { status: 400 });
  }

  // 4. Privileged work with the service-role client (server side only).
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${Deno.env.get("SITE_URL") ?? ""}/admin`,
  });
  if (inviteError || !invited.user) {
    return Response.json({ error: inviteError?.message ?? "Invite failed" }, { status: 400 });
  }

  const { error: profileError } = await admin.from("admin_profiles").insert({
    id: invited.user.id,
    full_name: fullName,
    role,
  });
  if (profileError) {
    // Roll back the auth user so we do not leave an orphan account.
    await admin.auth.admin.deleteUser(invited.user.id);
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  return Response.json({ ok: true, invited: email, role });
});
