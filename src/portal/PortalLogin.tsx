import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PortalLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetMsg, setResetMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setResetMsg("");
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      setResetMsg(
        error
          ? "Could not send reset email: " + error.message
          : "If an account exists for this email, a password-reset link is on its way. Open it within 1 hour."
      );
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError("Sign in failed: " + error.message);
    else nav("/portal");
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <img src="/assets/fmc-logo.jpg" alt="" className="h-12 w-12 rounded-full border-2 border-gold-500 bg-white object-contain" />
          <div>
            <h1 className="text-lg font-bold text-forest-800">Student Portal</h1>
            <p className="text-xs text-forest-900/60">School of Nursing · FMC Epe</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email used in your application" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === "login" && (
            <input type="password" required placeholder="Password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {resetMsg && <p className="rounded-lg border border-gold-500 bg-gold-100 px-3 py-2 text-sm text-forest-900/80">{resetMsg}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Send reset link"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <button
            className="text-xs font-bold text-forest-700 underline underline-offset-2"
            onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setResetMsg(""); }}
          >
            {mode === "login" ? "Forgot password?" : "← Back to sign in"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-forest-900/55">
          New applicant?{" "}
          <Link to="/training/nursing/apply" className="font-bold underline">Start your application</Link>
          {" · "}
          <Link to="/training" className="underline">Back to Training</Link>
        </p>
      </div>
    </main>
  );
}
