import { supabase } from "../lib/supabase";
import { useQuery } from "../lib/hooks";
import { useStudent } from "./useStudent";

export default function PortalResults() {
  const { profile } = useStudent();
  const { data: results } = useQuery(
    () => supabase.from("academic_results").select("*").eq("student_id", profile!.id).order("created_at", { ascending: false }),
    [profile?.id]
  );

  if (!profile) return null;
  const bySession = new Map<string, any[]>();
  (results ?? []).forEach((r) => {
    if (!bySession.has(r.session_label)) bySession.set(r.session_label, []);
    bySession.get(r.session_label)!.push(r);
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-xl font-bold text-forest-800">My Results</h1>
      <p className="mb-5 text-sm text-forest-900/60">Published by the school. Contact the school office about any discrepancies.</p>
      {bySession.size === 0 && (
        <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center">
          <p className="font-semibold text-forest-800">No results published yet</p>
          <p className="text-sm text-forest-900/60">Your results will appear here once the school releases them.</p>
        </div>
      )}
      {[...bySession.entries()].map(([session, rows]) => (
        <div key={session} className="card mb-5 !p-0">
          <p className="border-b border-forest-100 px-4 py-3 text-sm font-bold text-forest-800">{session}</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-forest-900/45">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2 text-right">Score</th>
                <th className="px-4 py-2 text-right">Grade</th>
                <th className="px-4 py-2">Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-forest-50">
                  <td className="px-4 py-2 font-semibold text-forest-800">{r.course_code}</td>
                  <td className="px-4 py-2 text-forest-900/75">{r.course_title}</td>
                  <td className="px-4 py-2 text-right">{r.score ?? "—"}</td>
                  <td className="px-4 py-2 text-right font-bold">{r.grade ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-forest-900/55">{r.remark ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
