# 05 — Security Plan

1. **Least privilege by default.** RLS enabled on 100% of tables; new tables
   ship with zero policies (deny-all) until an explicit grant is added.
2. **No public self-registration.** Supabase Auth sign-up disabled; accounts
   are invited by a super_admin through the `admin-invite` Edge Function,
   which re-verifies the caller's role server side and rolls back the auth
   user if the profile insert fails.
3. **Key separation.** Browser holds only the anon/publishable key.
   The service-role key exists solely as an Edge Function secret
   (`supabase secrets set SERVICE_ROLE_KEY=...`) and is never committed,
   never prefixed `VITE_`, never logged.
4. **Write-only public intake.** Appointment/feedback tables: anonymous
   INSERT (with CHECK validation) and no SELECT — personal data cannot be
   enumerated from the client. Fields are minimised (no clinical details,
   no diagnoses — forms must not collect medical records).
5. **Validation in three layers.** Zod schemas on the client for UX;
   PostgreSQL CHECK constraints as the data layer backstop; explicit
   validation inside Edge Functions for privileged operations.
6. **Audit trail.** Trigger-written, append-only `audit_logs` capturing
   actor, action, table, record id and old/new JSON for every managed row;
   readable only by super_admin; no UPDATE/DELETE path exists.
7. **Data protection (NDPA 2023).** Personal data stays in Lagos-closest
   region; retention schedule for submissions (recommend: purge resolved
   feedback after 24 months, completed appointment requests after 12);
   right-to-erasure implemented as super_admin delete; privacy notice on
   every form; no third-party trackers at launch.
8. **Transport & headers.** TLS everywhere; CSP, X-Content-Type-Options,
   X-Frame-Options, Referrer-Policy set at the static host; Supabase APIs
   are HTTPS-only.
9. **Rate limiting & abuse.** Static host/CDN rate limits on form routes;
   Supabase default per-IP limits on auth; consider Cloudflare Turnstile on
   public forms before launch.
10. **Secrets & dependency hygiene.** `.env` git-ignored; dependency review
    before each stage; rotate service-role key immediately if ever exposed
    (Dashboard → Settings → API → Reset).
11. **Backups & recovery.** Supabase scheduled backups (PITR on paid tiers);
    take a manual backup dump before every migration batch.
12. **Pre-launch gate.** All checks in `docs/09-test-plan.md` must pass on
    the PRODUCTION project before DNS cut-over; repeat checks 4–5 after any
    schema change.
