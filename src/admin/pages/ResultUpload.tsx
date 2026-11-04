import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../lib/auth";

interface Row {
  email: string; session_label: string; course_code: string; course_title: string;
  score: number | null; grade: string; remark: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cur.trim()); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur.trim()); cur = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur.trim()); rows.push(row);
  return rows;
}

function autoGrade(score: number | null): string {
  if (score === null) return "";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

const TEMPLATE = [
  ["email", "session_label", "course_code", "course_title", "score", "grade", "remark"],
  ["student@example.com", "2026/2027", "NUR 101", "Foundations of Nursing", "72", "", ""],
];

export default function ResultUpload() {
  const { can } = useAdmin();
  const allowed = can(["super_admin", "content_admin"]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function downloadTemplate() {
    const csv = TEMPLATE.map((r) => r.map((c) => (c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "results-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File) {
    setMsg(""); setProblems([]);
    const text = await file.text();
    const grid = parseCSV(text);
    if (grid.length < 2) { setRows(null); setProblems(["The file appears empty — use the template."]); return; }
    const head = grid[0].map((h) => h.toLowerCase());
    const need = ["email", "session_label", "course_code", "course_title"];
    const missing = need.filter((h) => !head.includes(h));
    if (missing.length) { setRows(null); setProblems(["Missing column(s): " + missing.join(", ")]); return; }
    const idx = (n: string) => head.indexOf(n);
    const out: Row[] = [];
    const probs: string[] = [];
    grid.slice(1).forEach((r, i) => {
      const email = (r[idx("email")] ?? "").toLowerCase();
      if (!email) return;
      const scoreRaw = r[idx("score")] ?? "";
      const score = scoreRaw === "" ? null : Number(scoreRaw);
      if (score !== null && (isNaN(score) || score < 0 || score > 100))
        probs.push(`Row ${i + 2}: score "${scoreRaw}" is not 0–100`);
      out.push({
        email,
        session_label: r[idx("session_label")] ?? "",
        course_code: r[idx("course_code")] ?? "",
        course_title: r[idx("course_title")] ?? "",
        score,
        grade: (r[idx("grade")] ?? "").toUpperCase() || autoGrade(score),
        remark: r[idx("remark")] ?? "",
      });
    });
    setRows(out);
    setProblems(probs);
  }

  async function importRows() {
    if (!rows || !allowed) return;
    setBusy(true); setMsg("");
    const emails = [...new Set(rows.map((r) => r.email))];
    const { data: profiles } = await supabase.from("student_profiles").select("id,email").in("email", emails);
    const byEmail = new Map((profiles ?? []).map((p: any) => [p.email, p.id]));
    const unknown = emails.filter((e) => !byEmail.has(e));
    const inserts = rows
      .filter((r) => byEmail.has(r.email))
      .map((r) => ({
        student_id: byEmail.get(r.email),
        session_label: r.session_label,
        course_code: r.course_code,
        course_title: r.course_title,
        score: r.score,
        grade: r.grade || null,
        remark: r.remark || null,
      }));
    let inserted = 0, failed = 0;
    for (let i = 0; i < inserts.length; i += 200) {
      const { error } = await supabase.from("academic_results").insert(inserts.slice(i, i + 200));
      if (error) failed += inserts.slice(i, i + 200).length; else inserted += inserts.slice(i, i + 200).length;
    }
    setBusy(false);
    setMsg(
      `Imported ${inserted} result(s).` +
      (failed ? ` ${failed} failed (check duplicates or data).` : "") +
      (unknown.length ? ` Skipped — unknown email(s): ${unknown.join(", ")}` : "") +
      " Students can now see them in their portal."
    );
  }

  if (!allowed)
    return <p className="py-10 text-center text-sm text-red-600">Your role cannot upload results.</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-xl font-bold text-forest-800">Upload Results (CSV)</h1>
      <p className="mb-5 text-sm text-forest-900/60">
        Publish results for many students at once. Each import is recorded in the audit log;
        students see results immediately in their portal.
      </p>

      <div className="card mb-5 space-y-3">
        <p className="text-sm font-bold text-forest-800">Step 1 — get the template</p>
        <button className="btn-outline text-xs" onClick={downloadTemplate}>Download CSV template</button>
        <p className="text-xs text-forest-900/55">
          Columns: <code>email, session_label, course_code, course_title, score, grade, remark</code>.
          Leave <code>grade</code> blank to auto-compute (A ≥70, B ≥60, C ≥50, D ≥45, E ≥40, F below).
          Use the student's portal email. Fill it in Excel or Google Sheets, then export/save as CSV.
        </p>
      </div>

      <div className="card mb-5">
        <p className="mb-2 text-sm font-bold text-forest-800">Step 2 — choose your filled CSV</p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
        <button className="btn-primary text-xs" onClick={() => fileRef.current?.click()}>Choose CSV file…</button>
      </div>

      {rows && (
        <div className="card mb-5">
          <p className="mb-2 text-sm font-bold text-forest-800">Step 3 — preview & import ({rows.length} row(s))</p>
          <div className="mb-3 max-h-64 overflow-auto rounded-lg border border-forest-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-forest-100 text-forest-900/50">
                  <th className="px-2 py-1.5">Email</th><th className="px-2 py-1.5">Session</th><th className="px-2 py-1.5">Course</th>
                  <th className="px-2 py-1.5">Score</th><th className="px-2 py-1.5">Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-b border-forest-50 last:border-0">
                    <td className="px-2 py-1.5">{r.email}</td><td className="px-2 py-1.5">{r.session_label}</td>
                    <td className="px-2 py-1.5">{r.course_code}</td><td className="px-2 py-1.5">{r.score ?? "—"}</td>
                    <td className="px-2 py-1.5 font-bold">{r.grade || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && <p className="mb-2 text-[11px] text-forest-900/50">Showing first 50 of {rows.length}.</p>}
          <button className="btn-primary text-xs" onClick={importRows} disabled={busy || rows.length === 0}>
            {busy ? "Importing…" : `Import ${rows.length} result(s)`}
          </button>
        </div>
      )}

      {problems.length > 0 && (
        <div className="mb-4 rounded-lg border border-gold-500 bg-gold-100 px-3 py-2 text-xs font-semibold text-gold-600">
          {problems.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      {msg && <p className="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-700">{msg}</p>}

      <p className="mt-4 text-xs text-forest-900/50">
        Tip: individual results can still be added under{" "}
        <Link to="/admin/content/results" className="font-bold underline">Academic Results</Link>.
      </p>
    </div>
  );
}
