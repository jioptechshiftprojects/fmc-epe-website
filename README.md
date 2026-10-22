# FMC Epe — Official Website Platform (Foundation)

React + TypeScript frontend on **Supabase** (PostgreSQL, Auth, Storage, Edge Functions),
for Federal Medical Centre, Epe, Lagos.

> **STATUS: FOUNDATION ✅ VERIFIED · STAGE 1 PUBLIC WEBSITE ✅ LIVE at `https://fmc-epe-website.pages.dev`** · STAGE 2 ADMIN CONSOLE ✅ LIVE at `/admin` — verified by super_admin (2026-10-21); guide: `docs/10-stage2-admin.md` · HARDENING (Turnstile + SEO) ready — one-time dashboard setup: `docs/11-go-live-hardening.md` · TRAINING + STUDENT PORTAL built — setup order: `docs/12-training-portal.md`
> The complete public website (pages below) reads live from Supabase. Optional
> demo content for layout verification: run `supabase/seed_demo_content.sql` in
> the SQL Editor (clearly marked placeholders — replace before launch).

## Quickstart (first run)

1. **Create a Supabase project** (supabase.com → New Project). Choose the region
   closest to Lagos (**Central EU / Frankfurt**) and tick **Enable automatic RLS**
   at creation — migration 0007 also records the same event trigger in version
   control so every environment behaves identically. Copy the **Project URL** and
   **anon public key** (Project Settings → API).
2. **Apply migrations.** Easiest: open `supabase/all_in_one.sql`, copy the
   entire file, paste into the SQL Editor and Run once. Equivalent: paste each
   numbered file in `supabase/migrations/` (0001 → 0007) in order. CLI route for
   later: `supabase link --project-ref YOUR_REF` + `supabase db push`.
3. **Disable public sign-up.** Authentication → Sign In / Providers →
   disable "Allow new users to sign up". Privileged accounts are created only
   via the `admin-invite` Edge Function.
4. **Bootstrap the first super_admin.** In Authentication → Users, invite your
   own email, then in the SQL Editor run:

   ```sql
   insert into public.admin_profiles (id, full_name, role)
   values ('<auth-user-uuid-from-dashboard>', 'Site Administrator', 'super_admin');
   ```
5. **Configure environment.** `cp .env.example .env` and fill in your
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. **Install and run.** `npm install && npm run dev`, then open
   `http://localhost:5173/connection-test`.
7. **Verify.** All five checks must pass. Alternatively:
   `SUPABASE_URL=... SUPABASE_ANON_KEY=... npm run test:connection`.

## Repository layout

```
supabase/
  migrations/     0001–0006: schema, RLS, storage, audit, test seed
  functions/      admin-invite Edge Function (service-role, server side)
src/
  lib/            supabase client, env validation, zod schemas, API helpers, useQuery hook
  pages/          Home, About, Departments(+detail), Services, Staff, News(+detail),
                  Events, Announcements, FAQs, Careers, Procurement,
                  Contact (feedback form), Appointments (request form), ConnectionTest
  components/     Public header/footer, layout, state blocks — official logo + campus photo
scripts/          test-connection.mjs (CLI version of the proof)
docs/             the eight foundation documents + test plan
public/assets/    official logo + campus photo (authoritative references)
```

## Design system

Forest green `#1B5E20` / deep `#0A2B0D`, gold `#C9A227`, cream `#F7F3E4`, white.
Tokens live in `tailwind.config.js`.

## Publishing to GitHub (from your phone, via Termux)

```bash
pkg install -y git
cd ~/fmc
git init && git add -A && git commit -m "FMC Epe platform: foundation + Stage 1"
# On github.com (browser): create a NEW empty repository (no README), copy its URL
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
# GitHub no longer accepts passwords for git — create a token first:
# github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
# → generate with ONLY the "repo" scope → paste it as the password when prompted.
git push -u origin main
```

`.env` is git-ignored and will never be uploaded. Updates later are just:
`git add -A && git commit -m "describe change" && git push`.
