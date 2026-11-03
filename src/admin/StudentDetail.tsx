import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { openEvidence } from "../lib/api";

export default function StudentDetail({ student, onClose }: { student: any; onClose: () => void }) {
  const [fees, setFees] = useState<any[] | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from("fee_payments").select("*").eq("student_id", student.id).order("created_at", { ascending: false })
      .then(({ data }) => setFees(data ?? []));
    supabase.from("academic_results").select("*").eq("student_id", student.id).order("created_at", { ascending: false })
      .then(({ data }) => setResults(data ?? []));
  }, [student.id]);

  const badge = (s: string) =>
    s === "verified" ? "bg-forest-50 text-forest-700 border border-forest-200"
    : s === "rejected" ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-gold-100 text-gold-600";

  const rows: [string, string][] = [
    ["Email", student.email],
    ["Phone", student.phone],
    ["Category", student.category],
    ["Admission status", student.admission_status],
    ["Current year / session", `${student.current_year || 0} · ${student.current_session || "—"}`],
    ["Guardian", student.guardian_name ? `${student.guardian_name} (${student.guardian_phone ?? ""})` : "—"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-cream-50 p-5 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-forest-800">{student.full_name}</h2>
            <p className="text-xs text-forest-900/55 capitalize">{student.category} student · {student.admission_status?.replace("_", " ")}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-forest-100 bg-white px-3 py-1.5 text-xs font-bold text-forest-700">Close</button>
        </div>

        <div className="card mb-4 grid grid-cols-2 gap-2 !p-4">
          {rows.map(([k, v]) => (
            <div key={k} className="text-xs"><span className="font-bold text-forest-800">{k}: </span><span className="text-forest-900/70">{String(v ?? "—")}</span></div>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-bold text-forest-800">Fee payments</h3>
        {!fees ? <p className="text-xs text-forest-900/50">Loading…</p> : fees.length === 0 ? <p className="mb-3 text-xs text-forest-900/50">No fee records.</p> : (
          <div className="mb-4 space-y-2">
            {fees.map((f) => (
              <div key={f.id} className="card flex flex-wrap items-center justify-between gap-2 !p-3">
                <div className="text-xs">
                  <span className="font-bold capitalize text-forest-800">{f.kind}</span> · {f.session_label}
                  {f.amount ? <span className="text-forest-900/60"> · NGN {Number(f.amount).toLocaleString()}</span> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className={"rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize " + badge(f.status)}>{f.status}</span>
                  {f.evidence_path && (
                    <button onClick={() => void openEvidence(f.evidence_path)} className="text-[11px] font-bold text-gold-600 underline underline-offset-2">
                      View evidence
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 className="mb-2 text-sm font-bold text-forest-800">Academic results</h3>
        {!results ? <p className="text-xs text-forest-900/50">Loading…</p> : results.length === 0 ? <p className="text-xs text-forest-900/50">No results published yet.</p> : (
          <div className="card overflow-x-auto !p-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-forest-100 text-forest-900/50">
                  <th className="px-3 py-2">Session</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2 text-right">Score</th><th className="px-3 py-2 text-right">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-forest-50 last:border-0">
                    <td className="px-3 py-2">{r.session_label}</td>
                    <td className="px-3 py-2 font-bold text-forest-800">{r.course_code}</td>
                    <td className="px-3 py-2">{r.course_title}</td>
                    <td className="px-3 py-2 text-right">{r.score ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-bold">{r.grade ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
