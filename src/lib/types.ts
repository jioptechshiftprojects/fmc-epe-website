export interface ConnectionTestRow {
  id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export type CheckStatus = "idle" | "running" | "pass" | "fail";

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

/* ---------- Public content models (rows readable only when status = 'published') ---------- */

export type PublishStatus = "draft" | "pending_review" | "published" | "archived";

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  display_order: number;
}

export interface ClinicalService {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  summary: string | null;
  details: string | null;
  departments?: { name: string; slug: string } | null;
}

export interface StaffProfile {
  id: string;
  department_id: string | null;
  full_name: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  photo_path: string | null;
  departments?: { name: string } | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image_path: string | null;
  published_at: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  start_at: string;
  end_at: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  starts_at: string | null;
  ends_at: string | null;
  is_urgent: boolean;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface RecruitmentNotice {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  requirements: string | null;
  deadline: string | null;
  is_open: boolean;
}

export interface ProcurementNotice {
  id: string;
  title: string;
  reference_no: string;
  description: string | null;
  deadline: string | null;
}

export interface MediaRef {
  bucket: string;
  path: string;
}
