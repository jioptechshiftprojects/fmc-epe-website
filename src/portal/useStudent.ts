import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  current_year: number;
  current_session: string | null;
  photo_path: string | null;
  category: "applicant" | "fresh" | "returning";
  admission_status: "submitted" | "under_review" | "admitted" | "rejected";
}

/** Current signed-in user's student profile (null if not a student account). */
export function useStudent() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  async function refresh() {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id ?? null;
    setUserId(uid);
    if (!uid) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.from("student_profiles").select("*").eq("auth_user_id", uid).maybeSingle();
    setProfile((data as StudentProfile | null) ?? null);
    setLoading(false);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return { loading, userId, profile, refresh, signOut: () => supabase.auth.signOut() };
}

export async function uploadEvidence(userId: string, file: File): Promise<{ path: string } | { error: string }> {
  const path = `student-evidence/${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("protected-documents").upload(path, file);
  if (error) return { error: error.message };
  return { path };
}
