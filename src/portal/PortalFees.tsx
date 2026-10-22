import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useQuery } from "../lib/hooks";
import { useStudent, uploadEvidence } from "./useStudent";

export default function PortalFees() {
  const { profile, userId } = useStudent();
  const [kind, setKind] = useState("session");
  const [sessionLabel, setSessionLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { data: fees } = useQuery(
    () => supabase.from("fee_payments").select("*").eq("student_id", profile!.id).order("created_at", { ascending: false }),
    [profile?.id, tick]
  );
  const refresh = () => setTick((t) => t + 1);

  if (!profile || !userId) return null;
  const verifiedAdmission = (fees ?? []).some((f) => f.kind === "admission" && f.status === "verified");
  const canPayAdmission = profile.category === "applicant" && profile.admission_status === "admitted" && !verifiedAdmission;

  async function submit() {
    setMsg("");
    if (!file) { setMsg("Choose your payment evidence file (photo or PDF)."); return; }
    if (!sessionLabel.trim()) { setMsg("Enter the session label (e.g. 2026/2027)."); return; }
    setBusy(true);
    const up = await uploadEvidence(userId, file);
    if ("error" in up) { setMsg("Upload failed: " + up.error); setBusy(false); return; }
    const { error } = await supabase.from("fee_payments").insert({
      student_id: profile.id,
      kind: canPayAdmission && kind === "admission" ? "admission" : "session",
      session_label: sessionLabel.trim(),
      amount: amount ? Number(amount) : null,
      payment_date: payDate || null,
      evidence_path: up.path,
      status: "pending",
    });
    setBusy(false);
    if (error) { setMsg("Record failed: " + error.message); return; }
    setMsg("Evidence submitted. The school will verify it shortly.");
    setKind("session"); setSessionLabel(""); setAmount(""); setPayDate(""); setFile(null); setInputKey((k) => k + 1);
    refresh();
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";
  const badge = (s: string) =>
    s === "verified" ? "bg-forest-50 text-forest-700 border border-forest-200"
    : s === "rejected" ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-gold-100 text-gold-600";

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-forest-800">Fees &amp; Payment Evidence</h1>
      <p className="mb-5 text-sm text-forest-900/60">
        Upload a clear photo or PDF of your payment teller / receipt. It is visible only to you and the school admin.
      </p>

      <div className="card mb-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Payment type</label>
            <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
              {canPayAdmission && <option value="admission">Admission fee</option>}
              <option value="session">School fees (session)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Session label</label>
            <input className={input} placeholder="e.g. 2026/2027" value={sessionLabel} onChange={(e) => setSessionLabel(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Amount paid (NGN, optional)</label>
            <input type="number" className={input} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-forest-800">Payment date</label>
            <input type="date" className={input} value={payDate} onChange={(e) => setPayDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-forest-800">Evidence file</label>
          <input key={inputKey} ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {!file ? (
            <button type="button" className="btn-outline text-xs" onClick={() => fileRef.current?.click()}>Choose evidence file...</button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="truncate text-sm font-semibold text-forest-800">{file.name}</p>
              <button type="button" className="text-xs font-bold text-red-600 underline" onClick={() => { setFile(null); setInputKey((k) => k + 1); }}>Remove</button>
            </div>
          )}
        </div>
        {msg && <p className="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-700">{msg}</p>}
        <button type="button" className="btn-primary" onClick={submit} disabled={busy}>{busy ? "Submitting..." : "Submit evidence"}</button>
      </div>

      <h2 className="mb-3 text-lg font-bold text-forest-800">Submission history</h2>
      {(!fees || fees.length === 0) && (
        <p className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-8 text-center text-sm text-forest-900/60">
          No fee evidence submitted yet.
        </p>
      )}
      <div className="space-y-3">
        {fees?.map((f) => (
          <div key={f.id} className="card !p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold text-forest-800 capitalize">{f.kind} fee · {f.session_label}</p>
                <p className="text-xs text-forest-900/55">
                  {f.amount ? "NGN " + Number(f.amount).toLocaleString() + " · " : ""}{f.payment_date ?? "date not set"}
                </p>
              </div>
              <span className={"rounded-full px-3 py-1 text-xs font-bold capitalize " + badge(f.status)}>{f.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
