# 09 — Proof of Connection: Test Plan & Results

**Status: ✅ VERIFIED — all five checks passed on 2026-10-20 (tester v2, two consecutive full runs).**
No credentials have been supplied and no live connection has been attempted
from this workspace, so per the project rule nothing is claimed connected.
Run the steps below and paste results back; I will record them here.

Prereqs: migrations 0001–0006 applied; `.env` filled; `npm install` done.

## Automated path

```
npm run dev                      # then open http://localhost:5173/connection-test
# and/or the CLI equivalent:
SUPABASE_URL=... SUPABASE_ANON_KEY=... npm run test:connection
```

## Checks (must all PASS before real data / public deploy)

| # | Check | Expected result | Status |
|---|---|---|---|
| 1 | Read approved record | ≥1 row returned, incl. migration seed | ⏳ |
| 2 | Submit harmless record | INSERT succeeds, row id returned | ⏳ |
| 3 | Persistence after refresh | Row from check 2 still present on re-read | ⏳ |
| 4 | Unauthorised read | `admin_profiles` SELECT returns 0 rows (RLS) | ⏳ |
| 5 | Unauthorised write | anonymous DELETE on `connection_tests` rejected | ⏳ |

## Results log

| Date | Runner | Environment | Outcome | Notes |
|---|---|---|---|---|
| 2026-10-21 | Project owner | **Production**: `https://fmc-epe-website.pages.dev` | Site live; Stage-1 homepage + demo announcement rendering | Deployment pipeline verified end-to-end (GitHub push → Cloudflare auto-build). Live /connection-test + live appointment-submission checks pending owner confirmation. |
| 2026-10-20 15:09 UTC | Project owner | Android Chrome · tester v2 · same project | **ALL 5 PASS** (run A: insert `887ac591…`; run B: insert `43bec4ee…`) | Definitive check 5 confirmed: anonymous UPDATE against a real row had no effect — stored value untouched. Foundation verified. |
| 2026-10-20 14:59 UTC | Project owner | Android Chrome · standalone tester v1 vs `gjsdiowtrvvtzikmyjkk.supabase.co` | Checks 1–4 **PASS** · Check 5 FAIL (false alarm) | Seed read OK; insert OK (`b6ad6bc5…`); persistence after refresh OK; `admin_profiles` read denied (0 rows). Check 5 failed because v1 deleted a **non-existent** UUID — zero-row writes never evaluate RLS, so Postgres reports success with 0 rows and the test misread it as "permitted". Corrected in tester/app/CLI v2: check 5 now UPDATEs the real check-2 row and verifies the stored value is untouched. Awaiting v2 confirmation run. |

## Post-verification housekeeping

- Delete test rows: `truncate table public.connection_tests;`  ← **done/pending: run before Stage 1 demo seed**
- Keep or drop the `connection_tests` table before launch (recommend: drop;
  it is recreated any time by re-running 0006 on a scratch project).
- Proceed to Stage 1 (public website build) only after checks 4–5 also pass
  on the production project.
