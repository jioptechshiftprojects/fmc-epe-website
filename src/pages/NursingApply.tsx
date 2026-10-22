import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

type Status = "idle" | "sending" | "success" | "error";

export default function NursingApply() {
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const API_URL = ((import.meta.env.VITE_STUDENT_API_URL as string | undefined) ?? "").trim();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      phone: String(fd.get("phone") ?? "").trim(),
      dob: String(fd.get("dob") ?? "") || null,
      intake: String(fd.get("intake") ?? "").trim(),
      qualification: String(fd.get("qualification") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    };
    if (payload.password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    if (!API_URL) { setFormError("The application service is not yet connected. Please contact the school office."); return; }

    setStatus("sending");
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) {
        setStatus("error");
        setFormError(data.error === "already"
          ? "An application already exists for this email. Please sign in to the student portal instead."
          : "Submission failed: " + (data.error || r.statusText));
      } else {
        setStatus("success");
        e.currentTarget.reset();
      }
    } catch (err) {
      setStatus("error");
      setFormError("Network error: " + String(err));
    }
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <main>
      <div className="bg-forest-700 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/training/nursing" className="text-xs font-semibold text-gold-400 hover:underline">← School of Nursing</Link>
          <h1 className="mt-2 text-2xl font-bold text-white">Nursing Admission Application</h1>
          <p className="mt-2 text-sm text-cream/85">
            Submitting this form creates your personal student-portal account immediately, so you can track
            your application from day one.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {status === "success" ? (
          <div className="card text-center">
            <p className="text-lg font-bold text-forest-700">Application submitted successfully.</p>
            <p className="mt-1 text-sm text-forest-900/65">
              Your account has been created. You can now{" "}
              <Link to="/portal" className="font-bold underline underline-offset-2">sign in to the student portal</Link>{" "}
              to follow your application status.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Full name *</label>
                <input name="full_name" className={input} maxLength={120} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Email address *</label>
                <input name="email" type="email" className={input} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Phone *</label>
                <input name="phone" className={input} maxLength={20} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Date of birth</label>
                <input name="dob" type="date" className={input} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Intake / session applying for *</label>
              <input name="intake" className={input} placeholder="e.g. 2026/2027 Academic Session" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Qualifications (O'Level results etc.)</label>
              <textarea name="qualification" rows={3} className={input} placeholder="e.g. 5 credits including English, Mathematics, Biology, Chemistry, Physics" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Create password *</label>
                <input name="password" type="password" className={input} minLength={8} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Confirm password *</label>
                <input name="password2" type="password" className={input} minLength={8} required
                  onBlur={(e) => { const f = e.currentTarget.form; if (f && f.password.value !== e.currentTarget.value) e.currentTarget.setCustomValidity("Passwords do not match"); else e.currentTarget.setCustomValidity(""); }} />
              </div>
            </div>
            <p className="text-xs text-forest-900/55">
              Your details are held securely and used only for admission processing, in line with our data-protection policy.
            </p>
            {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
