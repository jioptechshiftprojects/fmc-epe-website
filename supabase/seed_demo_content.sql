-- ============================================================
-- ⚠ PLACEHOLDER DEMO CONTENT — FOR LAYOUT/STYLING VERIFICATION ONLY
-- These are NOT real FMC Epe services, staff or news. Replace with
-- approved hospital content before launch, then delete these rows.
-- Run AFTER migrations 0001–0007. IDEMPOTENT: safe to run any number
-- of times — duplicates are skipped automatically.
-- ============================================================

-- Departments
insert into public.departments (name, slug, description, display_order, status) values
('General Outpatient & Family Medicine', 'general-outpatient-family-medicine', 'First point of care for adults and families — consultations, preventive care and referrals.', 1, 'published'),
('Surgery', 'surgery', 'General and elective surgical services with pre- and post-operative care.', 2, 'published'),
('Paediatrics', 'paediatrics', 'Dedicated care for infants, children and adolescents.', 3, 'published'),
('Obstetrics & Gynaecology', 'obstetrics-gynaecology', 'Maternity, antenatal, gynaecological and reproductive health services.', 4, 'published')
on conflict (slug) do nothing;

-- Services (linked to the slugs above)
insert into public.clinical_services (department_id, name, slug, summary, status)
select id, x.name, x.slug, x.summary, 'published' from public.departments d
cross join (values
  ('General Consultation', 'general-consultation', 'OPD consultations with medical officers and consultants.'),
  ('Health Screening', 'health-screening', 'Routine checks: BP, blood sugar, BMI and wellness advice.')
) as x(name, slug, summary) where d.slug = 'general-outpatient-family-medicine'
  on conflict (department_id, slug) do nothing;

insert into public.clinical_services (department_id, name, slug, summary, status)
select id, x.name, x.slug, x.summary, 'published' from public.departments d
cross join (values
  ('Elective Surgery', 'elective-surgery', 'Planned general surgical procedures.'),
  ('Emergency Surgery', 'emergency-surgery', 'Urgent surgical intervention, 24/7 on-call team.')
) as x(name, slug, summary) where d.slug = 'surgery'
  on conflict (department_id, slug) do nothing;

insert into public.clinical_services (department_id, name, slug, summary, status)
select id, x.name, x.slug, x.summary, 'published' from public.departments d
cross join (values
  ('Child Welfare Clinic', 'child-welfare-clinic', 'Immunisation, growth monitoring and nutrition counselling.'),
  ('Paediatric Emergency Care', 'paediatric-emergency-care', 'Urgent care for ill children.')
) as x(name, slug, summary) where d.slug = 'paediatrics'
  on conflict (department_id, slug) do nothing;

insert into public.clinical_services (department_id, name, slug, summary, status)
select id, x.name, x.slug, x.summary, 'published' from public.departments d
cross join (values
  ('Antenatal Care', 'antenatal-care', 'Scheduled pregnancy monitoring and counselling.'),
  ('Family Planning', 'family-planning', 'Counselling and services for reproductive health choices.')
) as x(name, slug, summary) where d.slug = 'obstetrics-gynaecology'
  on conflict (department_id, slug) do nothing;

-- Staff (placeholder names)
insert into public.staff_profiles (department_id, full_name, title, specialty, bio, display_order, is_public, status)
select id, x.name, x.title, x.specialty, x.bio, x.ord, true, 'published' from public.departments d
cross join (values
  ('Dr. A. Placeholder', 'Chief Medical Officer', 'Family Medicine', 'Demo profile for layout verification only.', 1),
  ('Dr. B. Sample', 'Consultant', 'General Surgery', 'Demo profile for layout verification only.', 2)
) as x(name, title, specialty, bio, ord) where d.slug = 'general-outpatient-family-medicine'
  and not exists (select 1 from public.staff_profiles s where s.full_name = x.name and s.title = x.title);

insert into public.staff_profiles (department_id, full_name, title, specialty, bio, display_order, is_public, status)
select id, x.name, x.title, x.specialty, x.bio, x.ord, true, 'published' from public.departments d
cross join (values
  ('Dr. C. Example', 'Consultant', 'Paediatrics', 'Demo profile for layout verification only.', 1)
) as x(name, title, specialty, bio, ord) where d.slug = 'paediatrics'
  and not exists (select 1 from public.staff_profiles s where s.full_name = x.name and s.title = x.title);

-- News
insert into public.news_articles (title, slug, excerpt, body, published_at, status) values
('FMC Epe Launches New Official Website', 'fmc-epe-launches-new-official-website',
 'The Centre announces the development of its new official digital platform for information, appointments and feedback.',
 'Federal Medical Centre, Epe is pleased to announce the development of its new official website.

The platform will provide information about departments and services, enable appointment requests, publish news and procurement notices, and offer a channel for patient feedback.

This is a placeholder article for layout verification and will be replaced with approved content.',
 now(), 'published'),
('Free Medical Outreach Programme', 'free-medical-outreach-programme',
 'A community health outreach offering free screenings and consultations.',
 'A free medical outreach programme is being organised for residents of Epe and surrounding communities.

Services will include blood pressure and blood sugar screening, consultations and health education.

This is a placeholder article for layout verification and will be replaced with approved content.',
 now() - interval '7 days', 'published')
on conflict (slug) do nothing;

-- Announcements
insert into public.announcements (title, body, is_urgent, status) values
('Visiting hours: 4pm – 6pm daily', 'Ward visiting hours remain 4:00pm to 6:00pm daily. Please comply with infection-prevention guidance at all times.', false, 'published'),
('Blood donation drive this Friday', 'The laboratory unit invites staff and the public to donate blood at the blood bank this Friday, 9:00am – 2:00pm.', true, 'published');
delete from public.announcements a
where a.ctid not in (select min(ctid) from public.announcements group by title, body);

-- Events
insert into public.events (title, description, venue, start_at, status) values
('World Health Day Community Walk', 'A community awareness walk and free health talks, organised by the public health unit.', 'FMC Epe premises', now() + interval '14 days', 'published');
delete from public.events e
where e.ctid not in (select min(ctid) from public.events group by title, start_at);

-- FAQs
insert into public.faqs (category, question, answer, display_order, status) values
('Appointments', 'How do I book an appointment?', 'Use the "Book Appointment" form on this website. Your request is reviewed and the hospital contacts you by phone to confirm a slot.', 1, 'published'),
('Appointments', 'Is the online request a confirmed booking?', 'No — it is a request. Confirmation happens when the hospital calls you.', 2, 'published'),
('Visiting', 'What are the visiting hours?', 'Ward visiting hours are 4:00pm to 6:00pm daily, unless otherwise announced.', 3, 'published'),
('Billing', 'Where do I pay for services?', 'All official payments are made at the designated cash points within the hospital. Demand receipts for every payment.', 4, 'published'),
('Feedback', 'How can I make a complaint?', 'Use the Contact & Feedback form, select "Complaint", and provide your contact details so the unit can follow up.', 5, 'published');
delete from public.faqs f
where f.ctid not in (select min(ctid) from public.faqs group by question);

-- Recruitment + procurement
insert into public.recruitment_notices (title, slug, summary, body, requirements, deadline, is_open, status) values
('[DEMO] Vacancy: Medical Officer', 'demo-vacancy-medical-officer',
 'Demonstration notice for layout verification — not a real vacancy.',
 'This is a placeholder recruitment notice used only to style the Careers page. It will be replaced with approved vacancy notices.',
 'MBBS with valid practicing licence. [Demo requirements.]', current_date + 30, true, 'published')
on conflict (slug) do nothing;

insert into public.procurement_notices (title, reference_no, description, deadline, status) values
('[DEMO] Supply of Medical Consumables', 'FMC-EPE/DEMO/001',
 'Demonstration notice for layout verification — not a real tender.', current_date + 21, 'published')
on conflict (reference_no) do nothing;

-- ============================================================
-- CLEANUP (run when replacing with real content):
-- delete from public.staff_profiles where bio like 'Demo profile%';
-- delete from public.clinical_services where slug in ('general-consultation','health-screening','elective-surgery','emergency-surgery','child-welfare-clinic','paediatric-emergency-care','antenatal-care','family-planning');
-- delete from public.news_articles where slug in ('fmc-epe-launches-new-official-website','free-medical-outreach-programme');
-- delete from public.faqs where question like '%appointment%' or question like '%visiting%' or question like '%pay%' or question like '%complaint%';
-- delete from public.recruitment_notices where slug = 'demo-vacancy-medical-officer';
-- delete from public.procurement_notices where reference_no = 'FMC-EPE/DEMO/001';
-- delete from public.announcements where title like '%donation%' or title like '%Visiting hours%';
-- delete from public.events where title like '%World Health Day%';
-- delete from public.departments where slug in ('general-outpatient-family-medicine','surgery','paediatrics','obstetrics-gynaecology');
-- ============================================================
