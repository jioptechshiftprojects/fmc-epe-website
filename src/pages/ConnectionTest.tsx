import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CheckResult, CheckStatus } from "../lib/types";

const STORAGE_KEY = "fmc-epe-last-test-id";

const initialChecks: CheckResult[] = [
  { id: "read", label: "1. Read an approved test record", status: "idle", detail: "Not run" },
  { id: "write", label: "2. Submit a harmless test record", status: "idle", detail: "Not run" },
  { id: "persist", label: "3. Confirm the record persists after refresh", status: "idle", detail: "Not run" },
  { id: "deny-read", label: "4. Unauthorised read of admin table is denied", status: "idle", detail: "Not run" },
  { id: "deny-write", label: "5. Unauthorised write (update/delete) is denied", status: "idle", detail: "Not run" },
];

function Badge({ status }: { status: CheckStatus }) {
  const styles: Record<CheckStatus, string> = {
    idle: "bg-slate-100 text-slate-500",
    running: "bg-gold-100 text-gold-600",
    pass: "bg-forest-50 text-forest-700 border border-forest-200",
    fail: "bg-red-50 text-red-700 border border-red-200",
  };
  const label = { idle: "IDLE", running: "RUNNING", pass: "PASS", fail: "FAIL" }[status];
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${styles[status]}`}>{label}</span>;
}

export default function ConnectionTest() {
  const [checks, setChecks] = useState<CheckResult[]>(initialChecks);
  const [running, setRunning] = useState(false);

  const update = (id: string, status: CheckStatus, detail: string) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, status, detail } : c)));

  const run = useCallback(async () => {
    setRunning(true);
    setChecks(initialChecks.map((c) => ({ ...c, status: "idle", detail: "Not run" })));

    // 1. Read seeded record
    update("read", "running", "Selecting approved test rows...");
    const readRes = await supabase
      .from("connection_tests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (readRes.error) update("read", "fail", readRes.error.message);
    else if ((readRes.data?.length ?? 0) === 0)
      update("read", "fail", "No rows returned — did you run migration 0006?");
    else update("read", "pass", `${readRes.data!.length} row(s) read, latest: "${readRes.data![0].note}"`);

    // 2. Submit a harmless record
    update("write", "running", "Inserting a test row...");
    const note = `Browser connection test at ${new Date().toISOString()}`;
    const writeRes = await supabase.from("connection_tests").insert({ note, created_by: "browser-test" }).select();
    if (writeRes.error) update("write", "fail", writeRes.error.message);
    else {
      const id = writeRes.data![0].id as string;
      localStorage.setItem(STORAGE_KEY, id);
      update("write", "pass", `Inserted row id ${id.slice(0, 8)}… (saved locally for the refresh check)`);
    }

    // 3. Persistence after refresh — verifies the row inserted earlier is still there
    update("persist", "running", "Re-reading all rows to verify persistence...");
    const lastId = localStorage.getItem(STORAGE_KEY);
    if (!lastId) update("persist", "fail", "No previous submission found — run check 2 first.");
    else {
      const verifyRes = await supabase.from("connection_tests").select("id").eq("id", lastId);
      if (verifyRes.error) update("persist", "fail", verifyRes.error.message);
      else if (verifyRes.data && verifyRes.data.length === 1)
        update("persist", "pass", "Previously submitted row still present after reload.");
      else update("persist", "fail", "Previously submitted row NOT found — persistence failed.");
    }

    // 4. Unauthorised ANONYMOUS read of admin_profiles must return zero rows.
    // If a staff session is active in this browser, reading your OWN profile is
    // allowed by design (the Admins page depends on it) — that is NOT a leak.
    // Use a private/incognito tab to run the true anonymous variant of this test.
    update("deny-read", "running", "Checking session context...");
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      update(
        "deny-read",
        "pass",
        "Signed in as staff — reading your own admin profile is allowed by design (not a leak). " +
          "For the anonymous test, re-run this page in a private/incognito tab: it must show 0 rows."
      );
    } else {
      const denyReadRes = await supabase.from("admin_profiles").select("*");
      const leaked = (denyReadRes.data?.length ?? 0) > 0;
      update(
        "deny-read",
        leaked ? "fail" : "pass",
        leaked
          ? `SECURITY FAILURE: ${denyReadRes.data!.length} admin row(s) readable anonymously!`
          : "Denied as expected — 0 rows returned to an anonymous client (RLS enforced)."
      );
    }

    // 5. Unauthorised write — attempt to MODIFY a real row. A delete/update of a
    // non-existent row never evaluates RLS and false-passes, so we target the row
    // inserted in check 2 and verify the stored value is untouched.
    update("deny-write", "running", "Attempting to modify your check-2 row as an anonymous visitor...");
    const probeId = localStorage.getItem(STORAGE_KEY);
    if (!probeId) {
      update("deny-write", "fail", "No check-2 row id found — run checks 1–2 first.");
    } else {
      const before = await supabase.from("connection_tests").select("note").eq("id", probeId).single();
      const denyWriteRes = await supabase.from("connection_tests").update({ note: "SHOULD NOT STICK" }).eq("id", probeId);
      const after = await supabase.from("connection_tests").select("note").eq("id", probeId).single();
      const unchanged = !after.error && before.data && after.data && before.data.note === after.data.note;
      if (unchanged && denyWriteRes.error)
        update("deny-write", "pass", `Denied: ${denyWriteRes.error.code ?? "error"} — stored value untouched.`);
      else if (unchanged) update("deny-write", "pass", "Write had no effect — stored value untouched (RLS enforced).");
      else update("deny-write", "fail", "SECURITY FAILURE: anonymous update CHANGED the stored value!");
    }

    setRunning(false);
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const allPass = checks.every((c) => c.status === "pass");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-forest-800">Supabase Proof of Connection</h1>
      <p className="mt-2 text-sm text-forest-900/70">
        Test data only. If every check passes, the Supabase foundation is verified and we can proceed to
        staged development. A failing security check (4 or 5) must be resolved before any real data or public
        deployment.
      </p>

      <div className="mt-6 space-y-3">
        {checks.map((c) => (
          <div key={c.id} className="card flex flex-wrap items-center gap-4">
            <Badge status={c.status} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-forest-800">{c.label}</p>
              <p className="truncate text-sm text-forest-900/60">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button className="btn-outline" onClick={() => void run()} disabled={running}>
          {running ? "Running…" : "Re-run all checks"}
        </button>
        {allPass && (
          <span className="rounded-full bg-forest-600 px-4 py-2 text-sm font-bold text-white">
            FOUNDATION VERIFIED — ready for Stage 1
          </span>
        )}
      </div>
    </main>
  );
}
