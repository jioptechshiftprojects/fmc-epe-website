import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { feedbackSchema } from "../lib/schemas";
import { loadTurnstile, verifyToken, resetWidget } from "../lib/turnstile";
import { PageHero } from "../components/StateBlock";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const SITE_KEY = ((import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? "").trim();

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
      category: String(fd.get("category") ?? "enquiry"),
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = feedbackSchema.safeParse(payload);
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
    const { error } = await supabase.from("feedback_submissions").insert({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      full_name: parsed.data.full_name || null,
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
      <PageHero title="Contact &amp; Feedback" subtitle="Enquiries, complaints, compliments and suggestions" />
      <div className="mx-auto max-w-2xl px-4 py-10">
        {status === "success" ? (
          <div className="card text-center">
            <p className="text-lg font-bold text-forest-700">Thank you — your message has been received.</p>
            <p className="mt-1 text-sm text-forest-900/65">The appropriate unit will review it and respond where contact details were provided.</p>
            <button className="btn-outline mt-5" onClick={() => setStatus("idle")}>Send another message</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Message type *</label>
              <select name="category" className={input} defaultValue="enquiry">
                <option value="enquiry">Enquiry</option>
                <option value="complaint">Complaint</option>
                <option value="compliment">Compliment</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Full name</label>
                <input name="full_name" className={input} maxLength={120} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-forest-800">Phone</label>
                <input name="phone" className={input} maxLength={20} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Email</label>
              <input name="email" type="email" className={input} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-forest-800">Message *</label>
              <textarea name="message" rows={5} className={input} maxLength={3000} placeholder="Please do not include detailed medical records or clinical information." />
            </div>
            <p className="text-xs text-forest-900/55">
              Your submission is handled confidentially under our data-protection policy. Please do not include clinical details.
            </p>
            {SITE_KEY && <div ref={widgetRef} className="min-h-[65px]" />}
            {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Submit message"}
            </button>
            {status === "error" && <p className="text-center text-xs text-red-600">Submission failed. Please try again.</p>}
          </form>
        )}
      </div>
    </main>
  );
}
