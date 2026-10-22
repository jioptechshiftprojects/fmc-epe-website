# 03 — Database Entity-Relationship Plan

Fourteen entity groups; full DDL in `supabase/migrations/`.

## Entities

| Entity | Key columns | Notes |
|---|---|---|
| `departments` | name, slug, description, image_path, display_order, status | 1—∞ services, staff |
| `clinical_services` | department_id→departments, name, slug, summary, details, status | unique (department, slug) |
| `staff_profiles` | department_id→departments, full_name, title, specialty, bio, photo_path, is_public, status | private staff stay hidden |
| `news_articles` | title, slug, excerpt, body, cover_image_path, author_id→admin_profiles, published_at, status | |
| `announcements` | title, body, starts_at, ends_at, is_urgent, status | |
| `events` | title, description, venue, start_at, end_at, status | |
| `faqs` | category, question, answer, display_order, status | |
| `appointment_requests` | full_name, phone, email, department_id→departments, preferred_date/time, reason, status | write-only for public |
| `feedback_submissions` | category(enquiry/complaint/compliment/suggestion), contact fields, message, status | write-only for public |
| `recruitment_notices` | title, slug, summary, body, requirements, deadline, attachment_path, is_open, status | HR-managed |
| `procurement_notices` | title, reference_no, description, deadline, attachment_path, status | procurement-managed |
| `media_assets` | bucket, storage_path, file_name, mime_type, size_bytes, alt_text, uploaded_by→admin_profiles | metadata layer over Storage |
| `admin_profiles` | id→auth.users, full_name, role, is_active | invite-only mapping |
| `audit_logs` | actor_id/email, action, table_name, record_id, old_data, new_data | trigger-written, immutable |
| `connection_tests` | note, created_by | Stage-0 proof only; drop before launch |

## Relationships (text ERD)

```
auth.users 1—1 admin_profiles
admin_profiles 1—∞ news_articles(author), media_assets(uploaded_by)
departments 1—∞ clinical_services, staff_profiles, appointment_requests
content tables (news, events, announcements, faqs, recruitment, procurement)
   reference image/document paths that live in Storage (public-media |
   protected-documents); media_assets is the queryable index of those paths.
audit_logs —∞ references any managed table row (actor_id → auth.users)
```

## Constraints & indexes (summary)

- Enums for roles and workflow states; every content table carries
  `status publish_status` default `draft`.
- Unique slugs/reference numbers; CHECK constraints on lengths and email
  format; FK deletes: cascade within a department, set-null for content
  references (never orphan published pages).
- Partial indexes match public read patterns (e.g. published-only service
  lists) so public traffic never scans drafts.
