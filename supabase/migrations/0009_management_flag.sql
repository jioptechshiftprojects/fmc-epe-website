-- 0009_management_flag.sql
-- Distinguish management staff from clinicians on the Our Team page.

alter table public.staff_profiles add column if not exists is_management boolean not null default false;

-- Flag existing records by senior titles (safe heuristic; admins can adjust per person).
update public.staff_profiles set is_management = true
where title ~* 'director|chief|chairman|chairperson|head|provost|administrator|coordinator';
