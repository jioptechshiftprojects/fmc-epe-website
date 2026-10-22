import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useStudent } from "./useStudent";

export default function PortalProfile() {
  const { profile, refresh } = useStudent();
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifiedAdmission, setVerifiedAdmission] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({ ...profile });
    supabase
      .from("fee_payments")
      .select("id")
      .eq("student_id", profile.id)
      .eq("kind", "admission")
      .eq("status", "verified")
      .then(({ data }) => setVerifiedAdmission((data ?? []).length > 0));
  }, [profile?.id]);

  if (!profile) return null;
  const set = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
  const input = "w-full rounded-lg border border-forest-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { error } = await supabase.from("student_profiles").update({
      full_name: form.full_name,
      phone: form.phone || null,
      dob: form.dob || null,
      address: form.address || null,
      guardian_name: form.guardian_name || null,
      guardian_phone: form.guardian_phone || null,
      current_year: Number(form.current_year) || 0,
      current_session: form.current_session || null,
      photo_path: form.photo_path || null,
    }).eq("id", profile.id);
    setBusy(false);
    setMsg(error ? "Save failed: " + error.message : "Profile saved.");
    refresh();
  }

  async function advance(target: "fresh" | "returning") {
    setBusy(true); setMsg("");
    const { error } = await supabase.from("student_profiles").update({ category: target }).eq("id", profile.id);
    setBusy(false);
    if (error) setMsg("Update failed: " + error.message);
    else { setMsg(target === "fresh" ? "Enrollment completed — you are now a Fresh Student." : "Upgraded — you are now a Returning Student."); refresh(); }
  }

  const canEnroll = profile.category === "applicant" && profile.admission_status === "admitted" && verifiedAdmission;
  const canUpgrade = profile.category === "fresh" && Number(form.current_year) >= 2;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-forest-800">My Profile</h1>

      {profile.category === "applicant" && profile.admission_status === "admitted" && !verifiedAdmission && (
        <p className="mb-4 rounded-xl border border-gold-500 bg-gold-100 p-4 text-sm text-forest-900/80">
          You have been offered admission. Pay the admission fee at the school office, upload the evidence under{" "}
          <strong>Fees</strong>, and return here to complete your enrollment once it is verified.
        </p>
      )}

      <form onSubmit={save} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Full name</label>
            <input className={input} value={form.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Phone</label>
            <input className={input} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Date of birth</label>
            <input type="date" className={input} value={(form.dob ?? "").slice(0, 10)} onChange={(e) => set("dob", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Photo URL or path (optional)</label>
            <input className={input} placeholder="/assets/... or https://..." value={form.photo_path ?? ""} onChange={(e) => set("photo_path", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-forest-800">Home address</label>
          <input className={input} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Guardian / next of kin</label>
            <input className={input} value={form.guardian_name ?? ""} onChange={(e) => set("guardian_name", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Guardian phone</label>
            <input className={input} value={form.guardian_phone ?? ""} onChange={(e) => set("guardian_phone", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Current year / session no.</label>
            <input type="number" min={0} max={6} className={input} value={form.current_year ?? 0} onChange={(e) => set("current_year", e.target.value)} />
            {profile.category === "fresh" && Number(form.current_year) >= 2 && (
              <p className="mt-1 text-xs font-semibold text-gold-600">Year 2+ qualifies you as a Returning Student — save, then use the button below.</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Session label</label>
            <input className={input} placeholder="e.g. 2026/2027" value={form.current_session ?? ""} onChange={(e) => set("current_session", e.target.value)} />
          </div>
        </div>

        {msg && <p className="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-700">{msg}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
          {canEnroll && (
            <button type="button" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-forest-900 hover:bg-gold-400" onClick={() => advance("fresh")} disabled={busy}>
              Complete enrollment (become Fresh Student)
            </button>
          )}
          {canUpgrade && (
            <button type="button" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-forest-900 hover:bg-gold-400" onClick={() => advance("returning")} disabled={busy}>
              Upgrade to Returning Student
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
