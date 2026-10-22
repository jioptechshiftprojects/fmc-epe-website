# 07 — Deployment Approach

## Target shape

- **Supabase project** = backend (already live).
- **GitHub** = source-code repository (free).
- **Cloudflare Pages** = static host for the `dist/` build (free, unlimited
  static bandwidth, no non-commercial clause — the right $0 fit for a public
  institution). Alternatives at the same architecture: Netlify free (tighter
  credit limits), Vercel Pro $20/mo (Hobby plan's personal-use clause makes it
  unsuitable for an official institutional site).

## Cloudflare Pages steps (works fully from a phone browser)

1. Push this project to a GitHub repository (see README §"Publishing to GitHub";
   the `.gitignore` already excludes `.env`, `node_modules` and `dist`).
2. Sign in at **dash.cloudflare.com** (free account; "Desktop site" mode in
   Chrome makes the dashboard easier) → **Workers & Pages → Create application
   → Pages → "Connect to Git"** → authorize GitHub → select the repository.
3. Build settings (Cloudflare builds remotely — nothing is built on your phone):
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables before deploying:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (your future domain, or the `*.pages.dev` URL for now)
5. **Save and Deploy.** Cloudflare builds, deploys, and gives you a
   `https://<project>.pages.dev` URL. Every later `git push` to `main`
   auto-rebuilds and redeploys (with preview URLs per branch/PR).
6. `public/_redirects` (SPA fallback) and `public/_headers` (security headers)
   are applied automatically by Cloudflare Pages.

## Domain (when ready)
Add the hospital's custom domain in Pages → Custom domains; Cloudflare issues
free SSL. DNS can stay wherever the domain is registered (CNAME to the Pages
project) or the zone can move to Cloudflare.

## Rollback
Pages → Deployments → pick a previous deployment → "Rollback" (instant).

## Gate before public launch
Re-run the five checks in `docs/09-test-plan.md` against the production URL
(anon key). Keep demo content out of the public site (cleanup block in
`supabase/seed_demo_content.sql`).
