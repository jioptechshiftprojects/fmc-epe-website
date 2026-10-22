# 12 — Training Section & Student Portal

## What's included (deployed with the training zip drop)
- Public: `/training` hub + programme pages (Housemanship / Residency / Nursing), nursing application form
- Student portal: `/portal` — overview, profile, results, fee evidence
- Admin console: Applications, Students, Fee Payments, Academic Results, Training Programs, **Homepage Slides**
- Migration `0008_training_and_portal.sql` (tables, RLS, evidence-storage rules, seeds)

## Programme delineation
Four distinct programmes, each with a status badge:
1. **School of Nursing** — "Applications open" — enrolled students (Fresh/Returning), full portal.
2. **Nursing Internship Programme** — "Currently running" — post-graduation training for FRESH NURSING GRADUATES (distinct from the School of Nursing).
3. **Housemanship** — "Coming soon" (in view).
4. **Residency Training Programme** — "Coming soon" (in view).
Only the School of Nursing has self-serve applications; internship enquiries route to the contact office.
When housemanship/residency open for applications, the same portal pattern (Worker + table) extends to them.

## ORDER OF OPERATIONS (important)
1. **Run the migration FIRST** — Supabase → SQL Editor → paste `supabase/migrations/0008_training_and_portal.sql` → Run.
   Then verify: `select slug, status from public.training_programs;` should list 3 programmes.
2. **Deploy the zip drop** (~/fmc5 → push). Training pages, portal, slideshow appear.
3. **Create the application Worker** (below) so the nursing application form can create accounts.

## Application Worker (Cloudflare, browser-only — like the Turnstile verifier)
1. **Workers & Pages → Create application → Create Worker** → Deploy → Edit code → replace with:
```js
function cors(origin, env) {
  const allowed = String(env.ALLOWED_ORIGIN || "").split(",");
  const allow = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
export default {
  async fetch(request, env) {
    const h = cors(request.headers.get("origin") || "", env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method !== "POST") return Response.json({ ok: false, error: "method" }, { status: 405, headers: h });

    let b = {};
    try { b = await request.json(); } catch {}
    const email = String(b.email || "").toLowerCase().trim();
    const password = String(b.password || "");
    const full_name = String(b.full_name || "").trim();
    const phone = String(b.phone || "").trim();
    const intake = String(b.intake || "").trim();
    if (!email || !full_name || !phone || !intake || password.length < 8)
      return Response.json({ ok: false, error: "invalid" }, { headers: h });

    const hdr = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" };

    const q = await fetch(env.SUPABASE_URL + "/rest/v1/nursing_applications?email=eq." + encodeURIComponent(email) + "&select=id", { headers: hdr });
    if (q.ok) { const rows = await q.json(); if (Array.isArray(rows) && rows.length) return Response.json({ ok: false, error: "already" }, { headers: h }); }

    const cu = await fetch(env.SUPABASE_URL + "/auth/v1/admin/users", { method: "POST", headers: hdr, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } }) });
    if (!cu.ok) { const t = await cu.text(); return Response.json({ ok: false, error: t.includes("already") || cu.status === 422 ? "already" : "create-failed" }, { headers: h }); }
    const user = await cu.json();

    await fetch(env.SUPABASE_URL + "/rest/v1/nursing_applications", { method: "POST", headers: { ...hdr, Prefer: "return=minimal" }, body: JSON.stringify({ auth_user_id: user.id, full_name, email, phone, dob: b.dob || null, intake, qualification: b.qualification || null }) });
    await fetch(env.SUPABASE_URL + "/rest/v1/student_profiles", { method: "POST", headers: { ...hdr, Prefer: "return=minimal" }, body: JSON.stringify({ auth_user_id: user.id, full_name, email, phone, dob: b.dob || null, category: "applicant", admission_status: "submitted" }) });

    return Response.json({ ok: true }, { headers: h });
  },
};
```
2. **Settings → Variables and Secrets** — add secrets:
   - `SUPABASE_URL` = `https://gjsdiowtrvvtzikmyjkk.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (Supabase → Project Settings → API → **service_role** key — keep private)
   - `ALLOWED_ORIGIN` = `https://fmc-epe-website.pages.dev`
   → Deploy.
3. Copy the Worker URL (e.g. `https://fmc-student-apply.<sub>.workers.dev`).

## Wire the site to the Worker (Cloudflare Pages)
Pages → fmc-epe-website → Settings → Environment variables → Production:
- `VITE_STUDENT_API_URL` = your Worker URL
Then **Retry deployment**. The application form activates.

## Full student lifecycle (operational runbook)
1. Applicant submits at `/training/nursing/apply` (account created instantly) → signs into `/portal` → sees "Application submitted".
2. **Admin console → Nursing Applications**: review → set status `under_review` → `admitted` (or `rejected`).
3. Admitted applicant pays admission fee → portal **Fees** → uploads evidence (kind: Admission fee).
4. **Admin console → Fee Payments**: verify (set `verified`).
5. Student → **My Profile** → "Complete enrollment" → becomes **Fresh Student**.
6. Staff enter results via **Academic Results** (or session fees via Fee Payments by admin).
7. Student at year/session 2+: sets Current year = 2 in profile → "Upgrade to Returning Student".
8. Each subsequent session: student uploads school-fee evidence; admin verifies.

## Homepage slideshow
Admin console → **Homepage Slides**: add slides (image path from Media library, a site path like
`/assets/fmc-campus-wall.jpg`, or an https URL; optionally a video path which takes precedence),
set status `published`. Slides crossfade every 6 seconds with a slow zoom. One demo slide is seeded.

## Notes
- Student accounts are auto-confirmed (no email SMTP configured yet); students log in with the
  password they set. When hospital email/SMTP is configured, switch to invite-style emails.
- Staff and students share the same Supabase Auth; a browser holds one session at a time —
  use separate browsers/incognito when testing both.
- Every admission/fee/result change is audit-logged.
