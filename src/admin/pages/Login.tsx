import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    else nav("/admin");
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <img src="/assets/fmc-logo.jpg" alt="FMC Epe logo" className="h-12 w-12 rounded-full border-2 border-gold-500 bg-white object-contain" />
          <div>
            <h1 className="text-lg font-bold text-forest-800">Staff Login</h1>
            <p className="text-xs text-forest-900/60">Federal Medical Centre, Epe — admin console</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email address" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required placeholder="Password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-forest-900/55">
          Staff accounts are issued by the super administrator only.{" "}
          <Link to="/" className="underline">← Back to website</Link>
        </p>
      </div>
    </main>
  );
}
