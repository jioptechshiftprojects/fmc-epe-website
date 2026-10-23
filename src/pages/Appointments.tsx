import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { appointmentSchema } from "../lib/schemas";
import { loadTurnstile, verifyToken, resetWidget } from "../lib/turnstile";
import { PageHero } from "../components/StateBlock";

type Status = "idle" | "sending" | "success" | "error";

export default function Appointments() {
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const SITE_KEY = ((import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? "").trim();
  const { data: departments } = useQuery(api.departments);

  useEffect(() => {
    if (!SITE_KEY) return;
    loadTurnstile().then((ok) => {
      if (ok && widgetRef.current && !widgetIdRef.current) {
        widgetIdRef.current = (window as any).turnstile.render(widgetRef.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
        });
      }
    });
  }, [SITE_KEY]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      department_id: String(fd.get("department_id") ?? ""),
      preferred_date: String(fd.get("preferred_date") ?? ""),
      preferred_time: String(fd.get("preferred_time") ?? ""),
      reason: String(fd.get("reason") ?? ""),
    };
    const parsed = appointmentSchema.safeParse(payload);
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((i) => i.message).join(" · "));
      return;
    }
    if (SITE_KEY) {
      if (!token) {
        setFormError("Please complete the security check below the form.");
        return;
      }
      const verified = await verifyToken(token);
      if (verified === false) {
        setFormError("Security check failed. Please try again.");
        if (widgetIdRef.current) resetWidget(widgetIdRef.current);
        setToken("");
        return;
      }
    }
    setStatus("sending");
    const { error } = await supabase.from("appointment_requests").insert({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      department_id: parsed.data.department_id || null,
      preferred_date: parsed.data.preferred_date || null,
      preferred_time: parsed.data.preferred_time || null,
      reason: parsed.data.reason || null,
    });
    if (error) {
      setStatus("error");
      setFormError(error.message);
    } else {
      setToken("");
      if (widgetIdRef.current) resetWidget(widgetIdRef.current);
      setStatus("success");
      e.currentTarget.reset();
    }
  }

  const input = "w-full rounded-lg border border-forest-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <main>
      <PageHero title="Book an Appointment" subtitle="Request an outpatient appointment — our team will confirm your slot" />
      <div className="mx-auto max-w-2xl px-4 py-10">
        {status === "success" ? (
          <div className="card text-center">
            <p className="text-lg font-bold text-forest-700">Appointment request received.</p>
            <p className="mt-1 text-sm text-forest-900/65">Please note this is a request, not a confirmed booking — the hospital will contact you on the phone number provided to confirm your slot.</p>
            <button className="btn-outline mt-5" onClick={() => setStatus("idle")}>Make another request</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Full name *</label>
                <input name="full_name" className={input} maxLength={120} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Phone *</label>
                <input name="phone" className={input} maxLength={20} placeholder="e.g. 0803 000 0000" required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Email</label>
              <input name="email" type="email" className={input} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Department</label>
              <select name="department_id" className={input} defaultValue="">
                <option value="">Any / Not sure</option>
                {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Preferred date</label>
                <input name="preferred_date" type="date" className={input} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Preferred time</label>
                <input name="preferred_time" type="time" className={input} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Reason for visit</label>
              <textarea name="reason" rows={3} className={input} maxLength={1000} placeholder="Brief description — please do not include detailed medical records." />
            </div>
            <p className="text-xs text-forest-900/55">
              For emergencies, please proceed to the hospital immediately or call the emergency line. This form is not monitored 24/7.
            </p>
            {SITE_KEY && <div ref={widgetRef} className="min-h-[65px]" />}
            {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Submit request"}
            </button>
            {status === "error" && <p className="text-center text-xs text-red-600">Submission failed. Please try again.</p>}
          </form>
        )}
      </div>
    </main>
  );
}
