# 10 — Stage 2: Admin Console (usage guide)

> **STATUS: LIVE (2026-10-21)** — super_admin sign-in verified on production. Invite-service deployment optional.

**Entry point:** `https://fmc-epe-website.pages.dev/admin` (also "staff login" in the site footer).

## Signing in
Staff use the Supabase Auth account issued to them (invite-only; public sign-up is disabled).
The console checks the account's `admin_profiles` row: no row → "No admin access" screen.

## Roles (enforced by database RLS, not just the UI)
| Role | Can do |
|---|---|
| super_admin | Everything + invite admins + delete records + audit log |
| content_admin | Departments, services, staff, news, events, announcements, FAQs, media, appointments inbox |
| hr_admin | Recruitment notices + feedback inbox |
| procurement_admin | Procurement notices |
| viewer | Read appointments/feedback inboxes only (read-only) |

## Daily operations
1. **Appointments:** inbox → call patient → set status `confirmed` → after visit `completed`.
2. **Feedback:** inbox → investigate → `in_review` → `resolved`/`closed`.
3. **Publishing:** content section → New/Edit → set Status `published` → appears on the public site instantly.
4. **Media:** upload images, copy the path into content image fields.
5. **New staff account:** Admins page → Send invite. If the invite service isn't deployed yet,
   the page prints the exact manual steps (dashboard invite + one SQL statement).

## Inviting staff without the Edge Function (works today)
1. Supabase dashboard → Authentication → Users → **Add user → Invite** their email.
2. SQL Editor:
   ```sql
   insert into public.admin_profiles (id, full_name, role)
   select id, 'Full Name', 'content_admin' from auth.users where email = 'name@example.com';
   ```

## Deploying the invite Edge Function (optional, from Termux)
```bash
cd ~/fmc4 && npm install -g supabase
supabase login            # paste an access token (dashboard → Settings → API → ...or use `supabase login` browser flow)
supabase link --project-ref gjsdiowtrvvtzikmyjkk
supabase functions deploy admin-invite
supabase secrets set SERVICE_ROLE_KEY=<service-role-key> SITE_URL=https://fmc-epe-website.pages.dev
```

## Audit
Every create/update/delete in managed tables is recorded automatically (super_admin → Audit log).
