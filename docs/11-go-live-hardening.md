# 11 — Go-Live Hardening: Turnstile anti-spam + SEO/shareability

## What is included in the code (already deployed with the next zip drop)
- `src/lib/turnstile.ts` — widget loader + verifier client (graceful when unconfigured)
- Turnstile widgets wired into the Appointment and Contact forms
- `public/robots.txt` and `public/sitemap.xml`
- Per-page `<title>` tags via `src/components/Layout.tsx`
- Social-share meta (Open Graph / Twitter) in `index.html` + a branded `public/assets/og-image.jpg`
- CSP in `_headers` updated to allow Cloudflare challenges

## ONE-TIME SETUP (all in dashboards, no Termux)

### 1. Create a Turnstile widget (Cloudflare)
1. dash.cloudflare.com → **Turnstile** → **Add widget**
2. Name: `fmc-epe-forms` · Domain: `fmc-epe-website.pages.dev` (add the future custom domain later too)
3. Copy the **Site Key** and **Secret Key** (shown once).

### 2. Create the verifier Worker (Cloudflare, browser-only)
1. **Workers & Pages → Create application → Create Worker** → Deploy (hello-world is fine)
2. **Edit code** → replace everything with:
```js
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
    let token = "";
    try { token = String((await request.json()).token ?? ""); } catch {}
    if (!token) return Response.json({ success: false }, { headers: cors });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json", ...cors } });
  },
};
```
3. Worker → **Settings → Variables and Secrets** → Add **Secret**: name `TURNSTILE_SECRET_KEY`, value = your Secret Key → Deploy.
4. Copy the Worker's URL: `https://verify-turnstile.<something>.workers.dev`

### 3. Tell the website the keys (Cloudflare Pages)
1. **Workers & Pages → fmc-epe-website → Settings → Environment variables → Production**:
   - `VITE_TURNSTILE_SITE_KEY` = your Site Key
   - `VITE_TURNSTILE_VERIFY_URL` = your Worker URL
2. **Save** → **Deployments → (latest) → Retry deployment**.

### 4. Test
- Open Book Appointment / Contact on the live site → a Turnstile checkbox appears.
- Submit with the box unchecked → blocked with a message. Check it → submits normally.
- View a submitted row in the admin inbox to confirm end-to-end.

### Note for the future (optional hard lockdown)
Today the check is a soft gate (verifier + client flow), because the database still accepts
anonymous inserts directly. Full lockdown (insert only via a service function) is possible
later — documented as a future migration when you're ready to run Supabase CLI from a
computer. The current setup already stops ordinary spam bots.

### SEO notes
- After go-live on a custom domain: update `public/robots.txt` + `public/sitemap.xml` + the
  `og:url`/`og:image` absolute URLs in `index.html`.
- Submit the sitemap to Google Search Console once the domain is live.
