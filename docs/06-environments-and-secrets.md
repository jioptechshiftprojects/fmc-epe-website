# 06 — Required Environment Variables

## Browser-safe (bundled by Vite — public by design, protected by RLS)

| Variable | Example | Where set |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://abcdefghijkl.supabase.co` | `.env` locally; host env dashboard in production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (JWT) | same as above |
| `VITE_SITE_URL` (optional) | `https://www.fmcepe.gov.ng` | same as above |

## Server-only (NEVER in the repo, NEVER prefixed VITE_)

| Variable | Where set | Purpose |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | auto-injected into Edge Functions | caller-context client |
| `SERVICE_ROLE_KEY` | `supabase secrets set SERVICE_ROLE_KEY=...` | privileged ops inside Edge Functions |
| `SITE_URL` | same secrets command | invite email redirect target |

## Rules

- Anything prefixed `VITE_` is embedded in the public bundle — only the two
  public Supabase values may carry that prefix, ever.
- Rotation: anon key can be reset for hygiene (public clients refetch);
  service-role rotation requires updating the Edge Function secret and
  redeploying nothing (secrets are read at invocation time).
- Recommended environments: `local` (.env), `staging` (second Supabase
  project), `production`. Migrations flow local → staging → production via
  `supabase db push` per linked project.
