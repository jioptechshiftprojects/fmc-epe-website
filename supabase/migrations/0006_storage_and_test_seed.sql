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
