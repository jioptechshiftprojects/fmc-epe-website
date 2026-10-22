import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../../lib/supabase";

const ROLES = ["super_admin", "content_admin", "hr_admin", "procurement_admin", "viewer"];

export default function AdminsPage() {
  const [profiles, setProfiles] = useState<any[] | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("content_admin");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("admin_profiles").select("*").order("created_at");
    setProfiles(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { data, error } = await supabase.functions.invoke("admin-invite", {
      body: { email, full_name: fullName, role },
    });
    setBusy(false);
    if (error || (data && data.error)) {
      setMsg(
        "Invite service not deployed yet — use the manual method: (1) Supabase dashboard → Authentication → Users → Add user → Invite " +
          email +
          ". (2) After they appear, run in SQL Editor: insert into public.admin_profiles (id, full_name, role) select id, '" +
          fullName.replace(/'/g, "") + "', '" + role + "' from auth.users where email = '" + email.replace(/'/g, "") + "';"
      );
    } else {
      setMsg("Invitation sent to " + email);
      setEmail(""); setFullName("");
      load();
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Admin Accounts</h1>
      <p className="mb-4 text-sm text-forest-900/60">
        Invite staff and assign roles. Roles control what each person can see and change (enforced by the database, not just this screen).
      </p>

      <form onSubmit={invite} className="card mb-6 grid gap-3 sm:grid-cols-4 sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest-800">Full name</label>
          <input className="w-full rounded-lg border border-forest-100 px-3 py-2 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest-800">Email</label>
          <input type="email" className="w-full rounded-lg border border-forest-100 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest-800">Role</label>
          <select className="w-full rounded-lg border border-forest-100 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
        </div>
        <button className="btn-primary text-xs" disabled={busy}>{busy ? "Inviting…" : "Send invite"}</button>
        {msg && <p className="whitespace-pre-line text-xs text-forest-900/75 sm:col-span-4">{msg}</p>}
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-forest-900/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <tr key={p.id} className="border-b border-forest-50 last:border-0">
                <td className="px-4 py-2.5">{p.full_name}</td>
                <td className="px-4 py-2.5 capitalize">{p.role.replace("_", " ")}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.is_active ? "bg-forest-50 text-forest-700 border border-forest-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    {p.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-forest-900/55">{new Date(p.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-forest-900/50">
        To disable an account: Supabase dashboard → SQL Editor →
        <code className="mx-1 rounded bg-forest-50 px-1.5 py-0.5">update public.admin_profiles set is_active = false where id = 'USER_UUID';</code>
      </p>
    </div>
  );
}
