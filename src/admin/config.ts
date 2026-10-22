import type { AdminRole } from "../lib/auth";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "date" | "relation";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  relationTable?: string;
  relationLabel?: string;
}

export interface EntityConfig {
  key: string;
  title: string;
  table: string;
  roles: AdminRole[];
  nameField: string;
  listFields: string[];
  fields: Field[];
}

const STATUS_OPTIONS = ["draft", "pending_review", "published", "archived"];

export const ENTITIES: EntityConfig[] = [
  {
    key: "departments", title: "Departments", table: "departments",
    roles: ["super_admin", "content_admin"], nameField: "name",
    listFields: ["name", "display_order", "status"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug (blank = auto from name)", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "image_path", label: "Image path (from Media library)", type: "text" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "services", title: "Clinical Services", table: "clinical_services",
    roles: ["super_admin", "content_admin"], nameField: "name",
    listFields: ["name", "department_id", "status"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug (blank = auto from name)", type: "text" },
      { name: "department_id", label: "Department", type: "relation", relationTable: "departments", relationLabel: "name", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "details", label: "Details", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "staff", title: "Staff Profiles", table: "staff_profiles",
    roles: ["super_admin", "content_admin"], nameField: "full_name",
    listFields: ["full_name", "title", "status"],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "department_id", label: "Department", type: "relation", relationTable: "departments", relationLabel: "name" },
      { name: "title", label: "Title", type: "text" },
      { name: "specialty", label: "Specialty", type: "text" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photo_path", label: "Photo path (from Media library)", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "is_public", label: "Visible to public", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "news", title: "News Articles", table: "news_articles",
    roles: ["super_admin", "content_admin"], nameField: "title",
    listFields: ["title", "published_at", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug (blank = auto from title)", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body (a blank line starts a new paragraph)", type: "textarea", required: true },
      { name: "cover_image_path", label: "Cover image path (from Media library)", type: "text" },
      { name: "published_at", label: "Publish date", type: "date" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "events", title: "Events", table: "events",
    roles: ["super_admin", "content_admin"], nameField: "title",
    listFields: ["title", "start_at", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "start_at", label: "Starts at (e.g. 2026-11-05T09:00)", type: "text" },
      { name: "end_at", label: "Ends at (optional)", type: "text" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "announcements", title: "Announcements", table: "announcements",
    roles: ["super_admin", "content_admin"], nameField: "title",
    listFields: ["title", "is_urgent", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea", required: true },
      { name: "is_urgent", label: "Mark as URGENT (gold highlight)", type: "boolean" },
      { name: "starts_at", label: "Starts at (optional, e.g. 2026-11-01T00:00)", type: "text" },
      { name: "ends_at", label: "Ends at (optional)", type: "text" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "faqs", title: "FAQs", table: "faqs",
    roles: ["super_admin", "content_admin"], nameField: "question",
    listFields: ["question", "category", "status"],
    fields: [
      { name: "category", label: "Category (e.g. Appointments)", type: "text", required: true },
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "recruitment", title: "Recruitment Notices", table: "recruitment_notices",
    roles: ["super_admin", "hr_admin"], nameField: "title",
    listFields: ["title", "deadline", "is_open", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug (blank = auto from title)", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "body", label: "Full notice text", type: "textarea" },
      { name: "requirements", label: "Requirements", type: "textarea" },
      { name: "deadline", label: "Deadline (YYYY-MM-DD)", type: "text" },
      { name: "is_open", label: "Open for applications", type: "boolean" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "procurement", title: "Procurement Notices", table: "procurement_notices",
    roles: ["super_admin", "procurement_admin"], nameField: "title",
    listFields: ["title", "reference_no", "deadline", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "reference_no", label: "Reference number (e.g. FMC-EPE/2026/001)", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "deadline", label: "Deadline (YYYY-MM-DD)", type: "text" },
      { name: "attachment_path", label: "Attachment path (optional)", type: "text" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "hero-slides", title: "Homepage Slides", table: "hero_slides",
    roles: ["super_admin", "content_admin"], nameField: "title",
    listFields: ["title", "display_order", "status"],
    fields: [
      { name: "title", label: "Slide title", type: "text" },
      { name: "subtitle", label: "Subtitle (optional)", type: "text" },
      { name: "image_path", label: "Image path or URL (Media library, /assets/..., or https://...)", type: "text" },
      { name: "video_path", label: "Video path or URL (optional; overrides image)", type: "text" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "training", title: "Training Programs", table: "training_programs",
    roles: ["super_admin", "content_admin"], nameField: "name",
    listFields: ["name", "display_order", "status"],
    fields: [
      { name: "name", label: "Program name", type: "text", required: true },
      { name: "slug", label: "Slug (blank = auto)", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "details", label: "Full details (blank line = new paragraph)", type: "textarea" },
      { name: "display_order", label: "Display order", type: "number" },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
    ],
  },
  {
    key: "applications", title: "Nursing Applications", table: "nursing_applications",
    roles: ["super_admin", "content_admin"], nameField: "full_name",
    listFields: ["full_name", "email", "intake", "status"],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "dob", label: "Date of birth", type: "date" },
      { name: "intake", label: "Intake / session applied for", type: "text", required: true },
      { name: "qualification", label: "Qualifications", type: "textarea" },
      { name: "status", label: "Admission status", type: "select", options: ["submitted", "under_review", "admitted", "rejected"], required: true },
    ],
  },
  {
    key: "students", title: "Students", table: "student_profiles",
    roles: ["super_admin", "content_admin"], nameField: "full_name",
    listFields: ["full_name", "email", "category", "admission_status", "current_year"],
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "current_year", label: "Current year/session number", type: "number" },
      { name: "current_session", label: "Session label (e.g. 2026/2027)", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["applicant", "fresh", "returning"], required: true },
      { name: "admission_status", label: "Admission status", type: "select", options: ["submitted", "under_review", "admitted", "rejected"], required: true },
    ],
  },
  {
    key: "fees", title: "Fee Payments", table: "fee_payments",
    roles: ["super_admin", "content_admin"], nameField: "session_label",
    listFields: ["student_id", "kind", "session_label", "amount", "status"],
    fields: [
      { name: "student_id", label: "Student", type: "relation", relationTable: "student_profiles", relationLabel: "full_name", required: true },
      { name: "kind", label: "Kind", type: "select", options: ["admission", "session"], required: true },
      { name: "session_label", label: "Session label", type: "text", required: true },
      { name: "amount", label: "Amount (NGN)", type: "number" },
      { name: "payment_date", label: "Payment date", type: "date" },
      { name: "evidence_path", label: "Evidence file path", type: "text" },
      { name: "status", label: "Verification", type: "select", options: ["pending", "verified", "rejected"], required: true },
    ],
  },
  {
    key: "results", title: "Academic Results", table: "academic_results",
    roles: ["super_admin", "content_admin"], nameField: "course_title",
    listFields: ["student_id", "session_label", "course_code", "score", "grade"],
    fields: [
      { name: "student_id", label: "Student", type: "relation", relationTable: "student_profiles", relationLabel: "full_name", required: true },
      { name: "session_label", label: "Session label", type: "text", required: true },
      { name: "course_code", label: "Course code", type: "text", required: true },
      { name: "course_title", label: "Course title", type: "text", required: true },
      { name: "score", label: "Score (0-100)", type: "number" },
      { name: "grade", label: "Grade", type: "text" },
      { name: "remark", label: "Remark", type: "text" },
    ],
  }

];

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
