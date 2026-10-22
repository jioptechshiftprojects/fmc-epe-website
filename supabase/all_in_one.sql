-- ============================================================
-- FMC EPE — ALL-IN-ONE MIGRATION (0001 → 0007)
-- Convenience file for the Supabase SQL Editor: paste this ENTIRE
-- file once and click Run. Equivalent to running the seven numbered
-- files in order.
--   ⚠ Use EITHER this file OR the numbered files — never both.
--   ⚠ If this errors part-way, switch to the numbered files one by
--     one to find the exact failing statement; already-applied
--     statements will report "already exists" — that is expected.
-- ============================================================



-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0001_extensions_and_types.sql
-- ════════════════════════════════════════════════════════════

-- 0001_extensions_and_types.sql
-- Prerequisites: pgcrypto for gen_random_uuid(); shared enums.

create extension if not exists pgcrypto;

create type public.admin_role as enum ('super_admin', 'content_admin', 'hr_admin', 'procurement_admin', 'viewer');
create type public.publish_status as enum ('draft', 'pending_review', 'published', 'archived');
create type public.appointment_status as enum ('new', 'confirmed', 'completed', 'cancelled');
create type public.feedback_status as enum ('new', 'in_review', 'resolved', 'closed');


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0002_admin_and_audit.sql
-- ════════════════════════════════════════════════════════════

-- 0002_admin_and_audit.sql
-- Admin identity mapping, audit log, and shared helper functions.
-- Created before content tables because news_articles.author_id references admin_profiles.

-- Maps auth.users (Supabase Auth) to a hospital role. Rows exist ONLY for
-- accounts invited by an existing super_admin — there is intentionally no
-- self-registration path.
create table public.admin_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  role       public.admin_role not null default 'viewer',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Immutable audit trail. Written ONLY by the security-definer trigger below;
-- even admins cannot update or delete (no policies granted).
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_email text,
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name  text not null,
  record_id   text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_table_time on public.audit_logs (table_name, created_at desc);

-- Helper: is the current session an active admin (any role)?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true
  );
$$;

-- Helper: does the current session hold one of the allowed roles?
create or replace function public.has_role(allowed public.admin_role[])
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true and role = any (allowed)
  );
$$;

revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_role(public.admin_role[]) from anon;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Generic audit trigger: attach to every admin-managed table.
create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, actor_email, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    coalesce((to_jsonb(old) ->> 'id'), (to_jsonb(new) ->> 'id')),
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return case TG_OP when 'DELETE' then old else new end;
end;
$$;


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0003_core_content_tables.sql
-- ════════════════════════════════════════════════════════════

-- 0003_core_content_tables.sql
-- Public-facing content. Anonymous visitors may SELECT only rows with
-- status = 'published' (enforced by RLS in 0005).

create table public.departments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  image_path    text,                       -- storage path in public-media bucket
  display_order integer not null default 0,
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.clinical_services (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name          text not null,
  slug          text not null,
  summary       text,
  details       text,
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (department_id, slug)
);

create table public.staff_profiles (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  full_name     text not null,
  title         text,
  specialty     text,
  bio           text,
  photo_path    text,
  email         text,
  display_order integer not null default 0,
  is_public     boolean not null default true,   -- never expose private staff
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.news_articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  body             text not null,
  cover_image_path text,
  author_id        uuid references public.admin_profiles(id) on delete set null,
  published_at     timestamptz,
  status           public.publish_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  starts_at    timestamptz,
  ends_at      timestamptz,
  is_urgent    boolean not null default false,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  venue       text,
  start_at    timestamptz not null,
  end_at      timestamptz,
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.faqs (
  id            uuid primary key default gen_random_uuid(),
  category      text not null default 'general',
  question      text not null,
  answer        text not null,
  display_order integer not null default 0,
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes for the public read patterns
create index idx_departments_status   on public.departments (status, display_order);
create index idx_services_department  on public.clinical_services (department_id) where status = 'published';
create index idx_staff_department     on public.staff_profiles (department_id) where status = 'published' and is_public;
create index idx_news_status          on public.news_articles (status, published_at desc);
create index idx_events_start         on public.events (start_at) where status = 'published';


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0004_submission_tables.sql
-- ════════════════════════════════════════════════════════════

-- 0004_submission_tables.sql
-- Public write-only intake tables plus HR/procurement notices.
-- Anonymous visitors may INSERT (validated); they can never SELECT these
-- (RLS in 0005). These tables may contain personal data — treat as
-- confidential, minimise fields, and define retention in the security plan.

create table public.appointment_requests (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null check (char_length(full_name) between 2 and 120),
  phone         text not null check (char_length(phone) between 7 and 20),
  email         text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  department_id uuid references public.departments(id) on delete set null,
  preferred_date date,
  preferred_time text,
  reason        text check (reason is null or char_length(reason) <= 1000),
  status        public.appointment_status not null default 'new',
  created_at    timestamptz not null default now()
);
create index idx_appointments_status on public.appointment_requests (status, created_at desc);

create table public.feedback_submissions (
  id         uuid primary key default gen_random_uuid(),
  category   text not null check (category in ('enquiry', 'complaint', 'compliment', 'suggestion')),
  full_name  text check (full_name is null or char_length(full_name) <= 120),
  email      text,
  phone      text,
  message    text not null check (char_length(message) between 5 and 3000),
  status     public.feedback_status not null default 'new',
  created_at timestamptz not null default now()
);
create index idx_feedback_status on public.feedback_submissions (status, created_at desc);

create table public.recruitment_notices (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  summary          text,
  body             text,
  requirements     text,
  deadline         date,
  attachment_path  text,                       -- usually protected-documents bucket
  is_open          boolean not null default true,
  status           public.publish_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.procurement_notices (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  reference_no    text not null unique,
  description     text,
  deadline        date,
  attachment_path text,
  status          public.publish_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Media library registry. The file bytes live in Supabase Storage;
-- this row is the queryable metadata layer.
create table public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  bucket       text not null check (bucket in ('public-media', 'protected-documents')),
  storage_path text not null unique,
  file_name    text,
  mime_type    text,
  size_bytes   bigint check (size_bytes is null or size_bytes >= 0),
  alt_text     text,
  uploaded_by  uuid references public.admin_profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0005_rls_policies.sql
-- ════════════════════════════════════════════════════════════

-- 0005_rls_policies.sql
-- Row Level Security on EVERY table. Principles:
--   * anonymous/authenticated public clients: read only published public
--     content; insert only into explicitly permitted submission tables.
--   * admin clients (is_admin / has_role): full manage within their role.
--   * no policy on a table means NO access for that group.

alter table public.departments         enable row level security;
alter table public.clinical_services   enable row level security;
alter table public.staff_profiles      enable row level security;
alter table public.news_articles       enable row level security;
alter table public.announcements       enable row level security;
alter table public.events              enable row level security;
alter table public.faqs                enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.recruitment_notices enable row level security;
alter table public.procurement_notices enable row level security;
alter table public.media_assets        enable row level security;
alter table public.admin_profiles      enable row level security;
alter table public.audit_logs          enable row level security;

-- ---------- Published public content: read-only to the world ----------
create policy "public read published departments"
  on public.departments for select to anon, authenticated
  using (status = 'published');

create policy "public read published services"
  on public.clinical_services for select to anon, authenticated
  using (status = 'published');

create policy "public read published public staff"
  on public.staff_profiles for select to anon, authenticated
  using (status = 'published' and is_public = true);

create policy "public read published news"
  on public.news_articles for select to anon, authenticated
  using (status = 'published');

create policy "public read published announcements"
  on public.announcements for select to anon, authenticated
  using (status = 'published');

create policy "public read published events"
  on public.events for select to anon, authenticated
  using (status = 'published');

create policy "public read published faqs"
  on public.faqs for select to anon, authenticated
  using (status = 'published');

create policy "public read published recruitment"
  on public.recruitment_notices for select to anon, authenticated
  using (status = 'published');

create policy "public read published procurement"
  on public.procurement_notices for select to anon, authenticated
  using (status = 'published');

-- ---------- Media: public bucket readable by everyone ----------
create policy "public read public media assets"
  on public.media_assets for select to anon, authenticated
  using (bucket = 'public-media');
create policy "admins read all media assets"
  on public.media_assets for select to authenticated
  using (public.is_admin());
create policy "content admins manage media assets"
  on public.media_assets for insert to authenticated
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));
create policy "content admins update media assets"
  on public.media_assets for update to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));
create policy "content admins delete media assets"
  on public.media_assets for delete to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

-- ---------- Submissions: anonymous INSERT only, never SELECT ----------
create policy "anyone may request an appointment"
  on public.appointment_requests for insert to anon, authenticated
  with check (true);

create policy "anyone may send feedback"
  on public.feedback_submissions for insert to anon, authenticated
  with check (true);

create policy "admins read appointments"
  on public.appointment_requests for select to authenticated
  using (public.is_admin());
create policy "content admins update appointments"
  on public.appointment_requests for update to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));
create policy "super admins delete appointments"
  on public.appointment_requests for delete to authenticated
  using (public.has_role(array['super_admin']::public.admin_role[]));

create policy "admins read feedback"
  on public.feedback_submissions for select to authenticated
  using (public.is_admin());
create policy "hr admins update feedback"
  on public.feedback_submissions for update to authenticated
  using (public.has_role(array['super_admin', 'hr_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'hr_admin']::public.admin_role[]));
create policy "super admins delete feedback"
  on public.feedback_submissions for delete to authenticated
  using (public.has_role(array['super_admin']::public.admin_role[]));

-- ---------- Admin-managed content: role-scoped management ----------
create policy "content admins manage departments"
  on public.departments for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage services"
  on public.clinical_services for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage staff"
  on public.staff_profiles for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage news"
  on public.news_articles for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage announcements"
  on public.announcements for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage events"
  on public.events for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "content admins manage faqs"
  on public.faqs for all to authenticated
  using (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'content_admin']::public.admin_role[]));

create policy "hr admins manage recruitment"
  on public.recruitment_notices for all to authenticated
  using (public.has_role(array['super_admin', 'hr_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'hr_admin']::public.admin_role[]));

create policy "procurement admins manage procurement"
  on public.procurement_notices for all to authenticated
  using (public.has_role(array['super_admin', 'procurement_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin', 'procurement_admin']::public.admin_role[]));

-- ---------- Admin identity: users may read their own profile only ----------
create policy "admins read own profile"
  on public.admin_profiles for select to authenticated
  using (id = auth.uid() or public.has_role(array['super_admin']::public.admin_role[]));
-- No INSERT/UPDATE/DELETE policies: admin rows are created exclusively by the
-- service-role Edge Function (admin-invite). This blocks privilege escalation
-- even if an anon/authenticated key is misused.

-- ---------- Audit logs: insert only via security-definer trigger ----------
create policy "super admins read audit logs"
  on public.audit_logs for select to authenticated
  using (public.has_role(array['super_admin']::public.admin_role[]));

-- ---------- updated_at + audit triggers on managed tables ----------
create trigger trg_set_updated_at before update on public.departments
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.clinical_services
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.staff_profiles
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.news_articles
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.recruitment_notices
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.procurement_notices
  for each row execute function public.set_updated_at();

create trigger trg_audit_departments before insert or update or delete on public.departments
  for each row execute function public.audit_row_change();
create trigger trg_audit_services before insert or update or delete on public.clinical_services
  for each row execute function public.audit_row_change();
create trigger trg_audit_staff before insert or update or delete on public.staff_profiles
  for each row execute function public.audit_row_change();
create trigger trg_audit_news before insert or update or delete on public.news_articles
  for each row execute function public.audit_row_change();
create trigger trg_audit_announcements before insert or update or delete on public.announcements
  for each row execute function public.audit_row_change();
create trigger trg_audit_events before insert or update or delete on public.events
  for each row execute function public.audit_row_change();
create trigger trg_audit_faqs before insert or update or delete on public.faqs
  for each row execute function public.audit_row_change();
create trigger trg_audit_recruitment before insert or update or delete on public.recruitment_notices
  for each row execute function public.audit_row_change();
create trigger trg_audit_procurement before insert or update or delete on public.procurement_notices
  for each row execute function public.audit_row_change();


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0006_storage_and_test_seed.sql
-- ════════════════════════════════════════════════════════════

-- 0006_storage_and_test_seed.sql
-- Storage buckets + object-level policies, and the connection-proof table.

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('protected-documents', 'protected-documents', false)
on conflict (id) do nothing;

-- public-media: world-readable, admin-writable
create policy "public reads public-media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');
create policy "admins insert public-media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());
create policy "admins update public-media"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin())
  with check (bucket_id = 'public-media' and public.is_admin());
create policy "admins delete public-media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());

-- protected-documents: admins only, end to end
create policy "admins select protected-documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'protected-documents' and public.is_admin());
create policy "admins insert protected-documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'protected-documents' and public.is_admin());
create policy "admins update protected-documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'protected-documents' and public.is_admin())
  with check (bucket_id = 'protected-documents' and public.is_admin());
create policy "admins delete protected-documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'protected-documents' and public.is_admin());

-- ---------- Proof-of-connection table (test data only) ----------
-- Design: anonymous clients may read all test rows and insert short notes,
-- but there is deliberately NO update/delete policy — used by the automated
-- test to prove unauthorised writes are denied by RLS.
create table public.connection_tests (
  id         uuid primary key default gen_random_uuid(),
  note       text not null check (char_length(note) between 1 and 280),
  created_by text not null default 'anonymous',
  created_at timestamptz not null default now()
);

alter table public.connection_tests enable row level security;

create policy "anon can read test rows"
  on public.connection_tests for select to anon, authenticated
  using (true);

create policy "anon can insert test rows"
  on public.connection_tests for insert to anon, authenticated
  with check (char_length(note) between 1 and 280);

-- Approved seed record: check #1 of the proof reads this row.
insert into public.connection_tests (note, created_by)
values ('Approved seed record — inserted by migration 0006.', 'migration');


-- ════════════════════════════════════════════════════════════
-- FILE: supabase/migrations/0007_rls_auto_enable.sql
-- ════════════════════════════════════════════════════════════

-- 0007_rls_auto_enable.sql
-- Records the dashboard "Enable automatic RLS" setting (rls_auto_enable +
-- ensure_rls event trigger) in version control, so every environment
-- (local, staging, production) behaves identically even when rebuilt from
-- migrations alone. Safe to run whether or not the dashboard checkbox was
-- ticked at project creation.

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception when others then
        raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (schema %)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$function$;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

comment on function public.rls_auto_enable() is
  'Safety net: enables RLS on new public tables. Writes no policies - tables remain deny-all until policies are granted.';
