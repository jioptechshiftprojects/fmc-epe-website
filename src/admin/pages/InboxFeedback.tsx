import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../lib/auth";

const STATUSES = ["new", "in_review", "resolved", "closed"];

export default function InboxFeedback() {
  const { can } = useAdmin();
  const editable = can(["super_admin", "hr_admin"]);
  const [filter, setFilter] = useState("new");
  const [rows, setRows] = useState<any[] | null>(null);

  async function load() {
    let q = supabase.from("feedback_submissions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows(data ?? []);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  async function setStatus(id: string, status: string) {
    await supabase.from("feedback_submissions").update({ status }).eq("id", id);
    load();
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—");
  const tab = (v: string) => (
    <button
      key={v}
      onClick={() => setFilter(v)}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${filter === v ? "bg-forest-600 text-white" : "bg-white text-forest-800 border border-forest-100"}`}
    >
      {v.replace("_", " ")}
    </button>
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Feedback &amp; Enquiries</h1>
      <p className="mb-4 text-sm text-forest-900/60">
        Complaints, compliments, enquiries and suggestions from the public.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">{["all", ...STATUSES].map(tab)}</div>
      {!rows && <p className="py-10 text-center text-sm text-forest-900/50">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center text-sm text-forest-900/60">
          No {filter === "all" ? "" : filter.replace("_", " ") + " "}messages.
        </div>
      )}
      <div className="space-y-3">
        {rows?.map((r) => (
          <div key={r.id} className="card !p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-700 border border-forest-200">
                    {r.category}
                  </span>
                  <p className="text-xs text-forest-900/55">
                    {r.full_name || "Anonymous"}{r.phone ? ` · ${r.phone}` : ""}{r.email ? ` · ${r.email}` : ""}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-forest-900/80">{r.message}</p>
                <p className="mt-1 text-[11px] text-forest-900/45">Received {fmt(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  r.status === "new" ? "bg-gold-100 text-gold-600" :
                  r.status === "in_review" ? "bg-forest-50 text-forest-700 border border-forest-200" :
                  "bg-slate-100 text-slate-600"
                }`}>{r.status.replace("_", " ")}</span>
                {editable && (
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="rounded-lg border border-forest-100 px-2 py-1.5 text-xs font-semibold"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
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
