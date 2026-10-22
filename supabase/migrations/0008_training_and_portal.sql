-- 0008_training_and_portal.sql
-- Training programs, homepage hero slides, nursing-school application + student portal.

create type public.student_category as enum ('applicant', 'fresh', 'returning');
create type public.admission_status as enum ('submitted', 'under_review', 'admitted', 'rejected');
create type public.fee_kind as enum ('admission', 'session');
create type public.fee_status as enum ('pending', 'verified', 'rejected');

-- ---------- Training programs (info pages) ----------
create table public.training_programs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  summary     text,
  details     text,
  display_order integer not null default 0,
  badge        text not null default 'Ongoing',  -- e.g. Applications open / Currently running / Coming soon
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now()
);

-- ---------- Homepage hero slides ----------
create table public.hero_slides (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  subtitle     text,
  image_path   text,  -- storage path, site-relative '/assets/...', or https URL
  video_path   text,  -- optional; when set, video plays instead of image
  display_order integer not null default 0,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now()
);

-- ---------- Nursing school applications (public write-only intake) ----------
create table public.nursing_applications (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name    text not null check (char_length(full_name) between 2 and 120),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text not null check (char_length(phone) between 7 and 20),
  dob          date,
  intake       text not null,
  qualification text,
  status       public.admission_status not null default 'submitted',
  created_at   timestamptz not null default now(),
  unique (email)
);

-- ---------- Student profiles (one per student account) ----------
create table public.student_profiles (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid not null unique references auth.users(id) on delete cascade,
  full_name        text not null,
  email            text not null,
  phone            text,
  dob              date,
  address          text,
  guardian_name    text,
  guardian_phone   text,
  current_year     integer not null default 0,
  current_session  text,
  photo_path       text,
  category         public.student_category not null default 'applicant',
  admission_status public.admission_status not null default 'submitted',
  created_at       timestamptz not null default now()
);

-- ---------- Fee payments (evidence uploads) ----------
create table public.fee_payments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.student_profiles(id) on delete cascade,
  kind         public.fee_kind not null default 'session',
  session_label text not null,
  amount       numeric(12,2) check (amount is null or amount >= 0),
  payment_date date,
  evidence_path text not null,
  status       public.fee_status not null default 'pending',
  created_at   timestamptz not null default now()
);

-- ---------- Academic results ----------
create table public.academic_results (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.student_profiles(id) on delete cascade,
  session_label text not null,
  course_code  text not null,
  course_title text not null,
  score        numeric(5,2) check (score is null or score between 0 and 100),
  grade        text,
  remark       text,
  created_at   timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.training_programs   enable row level security;
alter table public.hero_slides         enable row level security;
alter table public.nursing_applications enable row level security;
alter table public.student_profiles    enable row level security;
alter table public.fee_payments        enable row level security;
alter table public.academic_results      enable row level security;

-- public content
create policy "public read published training programs"
  on public.training_programs for select to anon, authenticated
  using (status = 'published');
create policy "content admins manage training programs"
  on public.training_programs for all to authenticated
  using (public.has_role(array['super_admin','content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin','content_admin']::public.admin_role[]));

create policy "public read published hero slides"
  on public.hero_slides for select to anon, authenticated
  using (status = 'published');
create policy "content admins manage hero slides"
  on public.hero_slides for all to authenticated
  using (public.has_role(array['super_admin','content_admin']::public.admin_role[]))
  with check (public.has_role(array['super_admin','content_admin']::public.admin_role[]));

-- applications: anyone may apply; applicant reads own via session email; admins manage
create policy "anyone may submit application"
  on public.nursing_applications for insert to anon, authenticated
  with check (true);
create policy "applicant reads own application"
  on public.nursing_applications for select to authenticated
  using (email = (auth.jwt() ->> 'email'));
create policy "admins manage applications"
  on public.nursing_applications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- student profile: owner reads; admins all; owner updates own fields with forward-only category
create policy "student reads own profile"
  on public.student_profiles for select to authenticated
  using (auth_user_id = auth.uid());
create policy "admins manage student profiles"
  on public.student_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "student updates own profile"
  on public.student_profiles for update to authenticated
  using (auth_user_id = auth.uid())
  with check (
    auth_user_id = auth.uid()
    and case category when 'applicant' then 0 when 'fresh' then 1 else 2 end >=
        (select case p.category when 'applicant' then 0 when 'fresh' then 1 else 2 end
         from public.student_profiles p where p.id = student_profiles.id)
    and admission_status = (select p.admission_status from public.student_profiles p where p.id = student_profiles.id)
  );

-- fees: student sees own, uploads own (always pending), admins verify
create policy "student reads own fees"
  on public.fee_payments for select to authenticated
  using (student_id = (select id from public.student_profiles where auth_user_id = auth.uid()));
create policy "student uploads own fee evidence"
  on public.fee_payments for insert to authenticated
  with check (
    student_id = (select id from public.student_profiles where auth_user_id = auth.uid())
    and status = 'pending'
  );
create policy "admins manage fees"
  on public.fee_payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- results: student reads own; admins enter/manage
create policy "student reads own results"
  on public.academic_results for select to authenticated
  using (student_id = (select id from public.student_profiles where auth_user_id = auth.uid()));
create policy "admins manage results"
  on public.academic_results for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: student evidence inside protected-documents ----------
create policy "students upload own evidence"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'protected-documents'
    and (storage.foldername(name))[1] = 'student-evidence'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
create policy "students read own evidence"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'protected-documents'
    and (storage.foldername(name))[1] = 'student-evidence'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- ---------- Audit triggers on new managed tables ----------
create trigger trg_audit_training_programs before insert or update or delete on public.training_programs
  for each row execute function public.audit_row_change();
create trigger trg_audit_hero_slides before insert or update or delete on public.hero_slides
  for each row execute function public.audit_row_change();
create trigger trg_audit_applications before insert or update or delete on public.nursing_applications
  for each row execute function public.audit_row_change();
create trigger trg_audit_student_profiles before insert or update or delete on public.student_profiles
  for each row execute function public.audit_row_change();
create trigger trg_audit_fee_payments before insert or update or delete on public.fee_payments
  for each row execute function public.audit_row_change();
create trigger trg_audit_academic_results before insert or update or delete on public.academic_results
  for each row execute function public.audit_row_change();

-- ---------- Seed content ----------
insert into public.training_programs (name, slug, summary, details, display_order, badge, status) values
('School of Nursing', 'nursing',
 'Professional nursing education for enrolled students — progress from Fresh Student (first session) to Returning Student (second session and above).',
 'The School of Nursing admits candidates per academic session. Students combine classroom instruction with supervised clinical experience, progressing session by session.

This portal supports the full student journey: apply for admission, track your application, and after admission manage your profile, fee evidence and academic results.

[Accreditation details, entry requirements and fee schedule to be published by the school administration.]', 1, 'Applications open', 'published'),
('Nursing Internship Programme', 'nursing-internship',
 'Structured clinical internship for FRESH NURSING GRADUATES — a post-graduation programme, distinct from the School of Nursing.',
 'The Nursing Internship Programme is for newly graduated nurses (fresh graduates of an accredited School of Nursing) preparing for professional registration. Interns rotate through clinical departments under preceptor supervision, consolidating competence in patient care, documentation and professional practice.

Note: this programme is different from the School of Nursing, which trains enrolled students through academic sessions.

[Eligibility, duration, placement schedule and application details to be published by the training office.]', 2, 'Currently running', 'published'),
('Housemanship', 'housemanship',
 'One-year supervised clinical practice for newly graduated doctors — programme in view.',
 'House officers will rotate through core departments — Medicine, Surgery, Paediatrics, Obstetrics & Gynaecology, Community Health — under consultant supervision.

[Programme in view: official entry requirements and application windows will be published by the training office when admissions open.]', 3, 'Coming soon', 'published'),
('Residency Training Programme', 'residency',
 'Postgraduate specialist training for doctors — programme in view.',
 'Residency programmes will span the major specialties, combining service responsibilities with structured teaching, research and fellowship examinations.

[Programme in view: specialties, entry requirements and vacancies will be published by the training office when admissions open.]', 4, 'Coming soon', 'published')
on conflict (slug) do nothing;

insert into public.hero_slides (title, subtitle, image_path, display_order, status) values
('Excellence in Service Delivery and Training', 'Federal Medical Centre, Epe — Lagos', '/assets/fmc-campus-wall.jpg', 1, 'published')
on conflict do nothing;
