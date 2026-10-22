# 02 — Proposed Architecture

## System view

```
                        ┌────────────────────────────────────────────┐
                        │                Supabase                    │
                        │  PostgreSQL (RLS on every table)           │
                        │  Auth (invite-only, no public sign-up)     │
                        │  Storage: public-media | protected-docs    │
                        │  Edge Functions: admin-invite (svc key)    │
                        └───────────────▲───────────────▲──────────┘
                                        │ anon key      │ user's JWT
┌───────────────────────┐               │               │
│ React SPA (Vite + TS) │───────────────┘               │
│ public pages: read    │                               │
│ published content;    │      ┌─────────────────────┐  │
│ submit forms (write-  │      │ Admin SPA (same app,│  │
│ only intake tables)   │      │ role-gated routes)  │──┘
└───────────────────────┘      └─────────────────────┘
```

## Key decisions

1. **Single React SPA, role-gated routes.** Public visitors and staff use the
   same app; admin routes require an authenticated `admin_profiles` row. This
   avoids a second deployment and keeps content previews trivial.
2. **Supabase is the only backend.** No custom API server is introduced;
   Postgres + RLS + Edge Functions cover persistence, authorisation and
   privileged operations. (Your brief forbids replacing Supabase; none of the
   below violates that — Vercel/Netlify in doc 07 is only a static-file host
   for the SPA build.)
3. **Defence in depth on access control.** RLS is the enforcement layer;
   `is_admin()`/`has_role()` SECURITY DEFINER helpers centralise role checks;
   the service-role key exists only as an Edge Function secret.
4. **Write-only public intake.** `appointment_requests` and
   `feedback_submissions` accept anonymous INSERT but have no public SELECT —
   personal data cannot be enumerated even if the anon key leaks.
5. **Auditability.** A security-definer trigger writes immutable rows to
   `audit_logs` for every change on managed tables (super_admin read-only).
6. **Content workflow.** `publish_status` = draft → pending_review → published
   → archived. Public reads are always filtered to `published`.

## Frontend structure (staged)

Stage 0 (this deliverable): app shell, design tokens, connection test.
Stage 1: public pages — Home, About/Mandate, Departments & Services,
Staff directory, News/Events/Announcements/FAQs, Careers, Procurement,
Contact/Feedback + Appointment request forms.
Stage 2: admin console — content CRUD, submissions inbox, media library,
admin management (super_admin), audit log viewer.

## Backend layout

- `supabase/migrations/` — forward-only, numbered, applied via CLI.
- `supabase/functions/` — one function per privileged capability
  (admin-invite now; e.g. publish-newsletter, export-report later).
- Storage — `public-media` (logos, photos, public PDFs) and
  `protected-documents` (application uploads, procurement attachments).
