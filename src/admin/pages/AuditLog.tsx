import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const TABLES = ["", "departments", "clinical_services", "staff_profiles", "news_articles", "announcements", "events", "faqs", "recruitment_notices", "procurement_notices", "appointment_requests", "feedback_submissions", "media_assets"];

export default function AuditLog() {
  const [table, setTable] = useState("");
  const [rows, setRows] = useState<any[] | null>(null);

  async function load(t: string) {
    let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (t) q = q.eq("table_name", t);
    const { data } = await q;
    setRows(data ?? []);
  }
  useEffect(() => { load(table); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [table]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Audit Log</h1>
      <p className="mb-4 text-sm text-forest-900/60">
        Immutable record of every create, change and delete in the admin area (who, what, when, old → new values).
      </p>
      <select className="mb-4 rounded-lg border border-forest-100 px-3 py-2 text-sm" value={table} onChange={(e) => setTable(e.target.value)}>
        {TABLES.map((t) => <option key={t} value={t}>{t === "" ? "All tables" : t}</option>)}
      </select>
      {!rows && <p className="py-6 text-center text-sm text-forest-900/50">Loading…</p>}
      <div className="space-y-2">
        {rows?.map((r) => (
          <details key={r.id} className="rounded-lg border border-forest-100 bg-white">
            <summary className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
              <span className="font-bold text-forest-800">{r.action}</span>
              <span className="text-forest-900/65">{r.table_name}</span>
              <span className="text-xs text-forest-900/45">{r.actor_email ?? "system"} · {new Date(r.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
            </summary>
            <div className="grid gap-2 border-t border-forest-100 px-4 py-3 text-xs sm:grid-cols-2">
              <div>
                <p className="mb-1 font-bold text-forest-900/50">BEFORE</p>
                <pre className="max-h-40 overflow-auto rounded bg-cream-50 p-2 whitespace-pre-wrap">{r.old_data ? JSON.stringify(r.old_data, null, 2) : "—"}</pre>
              </div>
              <div>
                <p className="mb-1 font-bold text-forest-900/50">AFTER</p>
                <pre className="max-h-40 overflow-auto rounded bg-cream-50 p-2 whitespace-pre-wrap">{r.new_data ? JSON.stringify(r.new_data, null, 2) : "—"}</pre>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
