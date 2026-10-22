# 04 — Role & Permission Matrix

Roles live in `admin_profiles.role`; enforcement is exclusively via RLS
(`is_admin()` / `has_role(...)`) plus storage policies. "Public" = anonymous
or any authenticated non-admin visitor.

| Capability | Public | Viewer | HR Admin | Procurement Admin | Content Admin | Super Admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Read published content (all modules) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit appointment / feedback forms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read submissions (appointments/feedback) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Update appointment status | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage feedback cases (resolve/close) | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage departments/services/staff/news/events/announcements/FAQs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage recruitment notices | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage procurement notices | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Upload/delete public-media files | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Access protected-documents bucket | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Read audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Invite/deactivate admins (via Edge Function) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete submission rows | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Viewer is deliberately read-only: it can see drafts and submissions for
operational awareness but has no UPDATE/DELETE path in any policy.
