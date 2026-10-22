import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAdmin } from "../../lib/auth";

export default function AdminDashboard() {
  const { profile, role } = useAdmin();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const out: Record<string, number> = {};
      const grab = async (key: string, table: string, eqCol?: string, eqVal?: string) => {
        let q = supabase.from(table).select("id", { count: "exact", head: true });
        if (eqCol) q = q.eq(eqCol, eqVal!);
        const { count } = await q;
        out[key] = count ?? 0;
      };
      await grab("newAppointments", "appointment_requests", "status", "new");
      await grab("newFeedback", "feedback_submissions", "status", "new");
      await grab("publishedDepartments", "departments", "status", "published");
      await grab("publishedNews", "news_articles", "status", "published");
      await grab("totalAppointments", "appointment_requests");
      setStats(out);
    })();
  }, []);

  const cards = [
    { label: "New appointment requests", value: stats.newAppointments, to: "/admin/inbox/appointments", accent: true },
    { label: "New feedback messages", value: stats.newFeedback, to: "/admin/inbox/feedback", accent: true },
    { label: "Total appointments", value: stats.totalAppointments, to: "/admin/inbox/appointments" },
    { label: "Departments published", value: stats.publishedDepartments, to: "/admin/content/departments" },
    { label: "News articles published", value: stats.publishedNews, to: "/admin/content/news" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-forest-800">Welcome, {profile?.full_name}</h1>
      <p className="mb-6 text-sm text-forest-900/60 capitalize">Role: {role?.replace("_", " ")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`card transition hover:-translate-y-0.5 hover:border-gold-500 ${c.accent && (c.value ?? 0) > 0 ? "border-gold-500 bg-gold-100" : ""}`}>
            <p className="text-3xl font-bold text-forest-800">{stats ? c.value : "…"}</p>
            <p className="text-sm text-forest-900/65">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="card mt-6">
        <h2 className="mb-2 font-bold text-forest-800">How publishing works</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-forest-900/70">
          <li>Create or edit content, set <b>Status</b>: draft → pending_review → published → archived.</li>
          <li>Only <b>published</b> items appear on the public website — drafts are safe to experiment with.</li>
          <li>Appointment &amp; feedback inboxes: respond by phone/email, then update the status here.</li>
          <li>Every change is recorded in the audit log (super admin).</li>
        </ul>
      </div>
    </div>
  );
}
