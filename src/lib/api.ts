import { supabase } from "./supabase";
import type {
  Announcement, ClinicalService, Department, EventItem, Faq,
  NewsArticle, ProcurementNotice, RecruitmentNotice, StaffProfile,
} from "./types";

/**
 * Public read helpers. RLS already guarantees only `published` rows are
 * visible to this (anonymous) client — the .eq("status", "published")
 * filters are belt-and-braces and keep partial indexes hot.
 */
export const api = {
  departments: () =>
    supabase.from("departments").select("*").eq("status", "published").order("display_order"),
  departmentBySlug: (slug: string) =>
    supabase.from("departments").select("*").eq("slug", slug).eq("status", "published"),
  services: () =>
    supabase.from("clinical_services")
      .select("*, departments(name, slug)")
      .eq("status", "published")
      .order("name"),
  servicesByDepartment: (departmentId: string) =>
    supabase.from("clinical_services")
      .select("*")
      .eq("department_id", departmentId)
      .eq("status", "published")
      .order("name"),
  staff: () =>
    supabase.from("staff_profiles")
      .select("*, departments(name)")
      .eq("status", "published")
      .eq("is_public", true)
      .order("display_order")
      .order("full_name"),
  staffByDepartment: (departmentId: string) =>
    supabase.from("staff_profiles")
      .select("*, departments(name)")
      .eq("department_id", departmentId)
      .eq("status", "published")
      .eq("is_public", true)
      .order("display_order"),
  news: () =>
    supabase.from("news_articles").select("*").eq("status", "published")
      .order("published_at", { ascending: false }),
  newsBySlug: (slug: string) =>
    supabase.from("news_articles").select("*").eq("slug", slug).eq("status", "published"),
  events: () =>
    supabase.from("events").select("*").eq("status", "published")
      .order("start_at", { ascending: false }),
  announcements: () =>
    supabase.from("announcements").select("*").eq("status", "published")
      .order("created_at", { ascending: false }),
  heroSlides: () =>
    supabase.from("hero_slides").select("*").eq("status", "published").order("display_order"),
  trainingPrograms: () =>
    supabase.from("training_programs").select("*").eq("status", "published").order("display_order"),
  faqs: () =>
    supabase.from("faqs").select("*").eq("status", "published")
      .order("category").order("display_order"),
  careers: () =>
    supabase.from("recruitment_notices").select("*").eq("status", "published")
      .order("created_at", { ascending: false }),
  procurement: () =>
    supabase.from("procurement_notices").select("*").eq("status", "published")
      .order("created_at", { ascending: false }),
};

/** Resolve a storage path in the public-media bucket to a public URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}
