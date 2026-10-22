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
