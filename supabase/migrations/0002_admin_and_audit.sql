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
