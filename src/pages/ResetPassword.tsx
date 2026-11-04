import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the email link's URL automatically.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
      setChecked(true);
    });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    if (password.length < 8) { setMsg("Password must be at least 8 characters."); return; }
    if (password !== password2) { setMsg("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg("Could not update password: " + error.message);
    else setDone(true);
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <div className="mb-4 flex items-center gap-3">
          <img src="/assets/fmc-logo.jpg" alt="" className="h-12 w-12 rounded-full border-2 border-gold-500 bg-white object-contain" />
          <div>
            <h1 className="text-lg font-bold text-forest-800">Set a new password</h1>
            <p className="text-xs text-forest-900/60">Federal Medical Centre, Epe</p>
          </div>
        </div>

        {!checked && <p className="text-sm text-forest-900/60">Verifying your reset link…</p>}

        {checked && !ready && (
          <div className="space-y-3">
            <p className="rounded-lg border border-gold-500 bg-gold-100 px-3 py-2 text-sm text-forest-900/80">
              This reset link is invalid, has expired, or was already used. Please request a new one from the sign-in page.
            </p>
            <div className="flex gap-3 text-xs font-bold">
              <Link to="/portal/login" className="underline">Student sign-in</Link>
              <Link to="/admin/login" className="underline">Staff sign-in</Link>
            </div>
          </div>
        )}

        {checked && ready && !done && (
          <form onSubmit={submit} className="space-y-3">
            <input type="password" required minLength={8} placeholder="New password (min 8 characters)" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" required minLength={8} placeholder="Confirm new password" className={input} value={password2} onChange={(e) => setPassword2(e.target.value)} />
            {msg && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}
            <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          </form>
        )}

        {done && (
          <div className="text-center">
            <p className="font-bold text-forest-700">Password updated successfully.</p>
            <p className="mt-1 text-sm text-forest-900/65">Use your new password the next time you sign in.</p>
            <div className="mt-4 flex justify-center gap-4 text-xs font-bold">
              <Link to="/portal/login" className="underline">Student sign-in</Link>
              <Link to="/admin/login" className="underline">Staff sign-in</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
