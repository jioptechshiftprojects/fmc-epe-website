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
