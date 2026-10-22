# 08 — Unresolved Dependencies & Decisions

| # | Decision needed | Owner | Blocks |
|---|---|---|---|
| 1 | Create the Supabase project (org, region closest to Lagos, plan tier) | Hospital ICT / FMC Epe | everything live |
| 2 | Static host choice: Vercel vs Netlify vs Cloudflare Pages (vs Kimi Websites if available on plan) | ICT | deployment |
| 3 | Custom domain + DNS (`fmcepe.gov.ng` or sub-domain) and SSL | ICT | go-live |
| 4 | Email provider for Auth invites (Supabase default vs custom SMTP for `@fmcepe.gov.ng` branding) | ICT | admin onboarding |
| 5 | Authoritative content: departments list, service catalogue, staff directory data (and who approves) | Hospital management | Stage 1 pages |
| 6 | Approval workflow for `pending_review` content (who presses "publish") | Management | Stage 2 |
| 7 | Data-retention schedule for submissions (proposal in `docs/05`) | Management + legal/NDPA | go-live |
| 8 | Backup tier (free daily vs PITR) | ICT | go-live |
| 9 | Vector/original of the logo (supplied file is a JPG with white background; a transparent PNG/SVG is needed for headers) | PRO/ICT | Stage 1 design polish |
| 10 | Usage rights/caption for the campus photograph | PRO | Stage 1 |
| 11 | Bot protection on public forms (Turnstile) — recommended yes | ICT | go-live |
| 12 | Analytics choice (recommend privacy-friendly, e.g. Plausible; avoid ad-tech) | Management | go-live |
| 13 | Future modules beyond brief: online payments, lab results portal, telemedicine — explicitly OUT of scope now | Management | later stages |
