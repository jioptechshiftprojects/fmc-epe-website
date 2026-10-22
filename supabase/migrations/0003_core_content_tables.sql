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
