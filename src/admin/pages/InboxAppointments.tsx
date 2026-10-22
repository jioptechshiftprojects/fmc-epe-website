import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../lib/auth";

const STATUSES = ["new", "confirmed", "completed", "cancelled"];

export default function InboxAppointments() {
  const { can } = useAdmin();
  const editable = can(["super_admin", "content_admin"]);
  const [filter, setFilter] = useState("new");
  const [rows, setRows] = useState<any[] | null>(null);
  const [depts, setDepts] = useState<Record<string, string>>({});

  async function load() {
    let q = supabase.from("appointment_requests").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows(data ?? []);
  }

  useEffect(() => {
    load();
    supabase.from("departments").select("id,name").then(({ data }) => {
      const m: Record<string, string> = {};
      (data ?? []).forEach((d: any) => (m[d.id] = d.name));
      setDepts(m);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: string) {
    await supabase.from("appointment_requests").update({ status }).eq("id", id);
    load();
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—");
  const tab = (v: string) => (
    <button
      key={v}
      onClick={() => setFilter(v)}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${filter === v ? "bg-forest-600 text-white" : "bg-white text-forest-800 border border-forest-100"}`}
    >
      {v}
    </button>
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Appointment Requests</h1>
      <p className="mb-4 text-sm text-forest-900/60">
        Website submissions appear here as “new”. Call the patient to arrange the slot, then mark “confirmed”.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">{["all", ...STATUSES].map(tab)}</div>
      {!rows && <p className="py-10 text-center text-sm text-forest-900/50">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center text-sm text-forest-900/60">
          No {filter === "all" ? "" : filter + " "}requests.
        </div>
      )}
      <div className="space-y-3">
        {rows?.map((r) => (
          <div key={r.id} className="card !p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-forest-800">{r.full_name}</p>
                <p className="text-xs text-forest-900/60">
                  📞 {r.phone}{r.email ? ` · ✉️ ${r.email}` : ""}
                </p>
                <p className="mt-1 text-sm text-forest-900/75">
                  {depts[r.department_id] ?? "Any department"} · {r.preferred_date ?? "any date"} {r.preferred_time ?? ""}
                </p>
                {r.reason && <p className="mt-1 text-sm text-forest-900/65">{r.reason}</p>}
                <p className="mt-1 text-[11px] text-forest-900/45">Received {fmt(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  r.status === "new" ? "bg-gold-100 text-gold-600" :
                  r.status === "confirmed" ? "bg-forest-50 text-forest-700 border border-forest-200" :
                  r.status === "completed" ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600 border border-red-200"
                }`}>{r.status}</span>
                {editable && (
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="rounded-lg border border-forest-100 px-2 py-1.5 text-xs font-semibold"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
