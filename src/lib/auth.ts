import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AdminRole = "super_admin" | "content_admin" | "hr_admin" | "procurement_admin" | "viewer";

export interface AdminProfile {
  id: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
}

/** Session + admin profile + role helpers for the whole /admin area. */
export function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    let alive = true;
    async function load(id?: string) {
      if (id) {
        const { data } = await supabase.from("admin_profiles").select("*").eq("id", id).maybeSingle();
        if (!alive) return;
        setProfile((data as AdminProfile | null) ?? null);
      }
      if (alive) setLoading(false);
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) load(data.session.user.id);
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setProfile(null);
      if (s) {
        setLoading(true);
        supabase.from("admin_profiles").select("*").eq("id", s.user.id).maybeSingle().then(({ data }) => {
          setProfile((data as AdminProfile | null) ?? null);
          setLoading(false);
        });
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role = profile && profile.is_active ? profile.role : null;
  return {
    loading, session, profile, role,
    can: (roles: AdminRole[]) => !!role && roles.includes(role),
    signOut: () => supabase.auth.signOut(),
  };
}
