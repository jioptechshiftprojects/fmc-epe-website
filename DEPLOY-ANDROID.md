# Deploy FMC Epe to the Internet — Android Only, One Continuous Flow

Target: `https://<project>.pages.dev` live, auto-redeploying on every update.
Prereqs: the latest `fmc-epe-foundation.zip` downloaded to your **Download** folder.

────────────────────────────────────────────────────────────
## STEP A — Termux base (open Termux, paste this whole block)
────────────────────────────────────────────────────────────
```bash
pkg update && pkg upgrade -y
pkg install -y git unzip nano
termux-setup-storage          # tap "Allow" on the popup
cd /storage/emulated/0/Download
ls fmc-epe-foundation.zip     # must show the file; if not, re-download it
unzip -o fmc-epe-foundation.zip -d ~/fmc
cd ~/fmc
cp .env.example .env
nano .env
```
Inside nano: replace the two placeholder lines with your real values (Supabase →
Project Settings → API): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
No quotes. Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

────────────────────────────────────────────────────────────
## STEP B — GitHub (Chrome; ~5 min; do this once)
────────────────────────────────────────────────────────────
1. **github.com** → Sign up (or log in) → verify email.
2. **Token** (GitHub's push password): profile picture → Settings → Developer
   settings → Personal access tokens → Tokens (classic) → Generate new token
   (classic) → note `fmc-epe-deploy`, expiry 90 days, tick **repo** only →
   Generate → copy the `ghp_…` token ONCE into your Notes app.
3. **New repository**: **+** → New repository → name `fmc-epe-website` →
   Public → do NOT add README/.gitignore/license → Create repository → copy
   the URL `https://github.com/YOU/fmc-epe-website.git`.

────────────────────────────────────────────────────────────
## STEP C — Push the code (back in Termux, paste this whole block)
────────────────────────────────────────────────────────────
```bash
cd ~/fmc
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
git init
git add -A
git commit -m "FMC Epe platform: foundation + Stage 1 public website"
git branch -M main
git remote add origin https://github.com/YOU/fmc-epe-website.git
git push -u origin main
```
Prompts: username = GitHub username; password = paste your `ghp_…` token
(it stays invisible). Refresh the repo page — ~60 files, and **no `.env`**.

────────────────────────────────────────────────────────────
## STEP D — Cloudflare Pages (Chrome, Desktop site ON; ~5 min)
────────────────────────────────────────────────────────────
1. **dash.cloudflare.com** → sign up free (verify email; no card).
2. **Workers & Pages → Create application → Pages → Connect to Git** →
   authorize Cloudflare on GitHub → select `fmc-epe-website` → Begin setup.
3. Project name `fmc-epe-website` · branch `main`.
4. Framework preset **Vite** (auto-fills `npm run build` / `dist`).
5. Environment variables → Production → add:
   - `VITE_SUPABASE_URL`      (same value as .env)
   - `VITE_SUPABASE_ANON_KEY` (same value as .env)
   - `VITE_SITE_URL`          `https://fmc-epe-website.pages.dev`
6. **Save and Deploy** → wait for the green checkmark (~2 min) → open your
   `https://fmc-epe-website.pages.dev` URL.

────────────────────────────────────────────────────────────
## STEP E — Verify the live site
────────────────────────────────────────────────────────────
1. Browse Departments, Services, Team, News, FAQs, Careers, Procurement.
2. Visit `/connection-test` — all 5 checks PASS on the live URL.
3. Submit a test appointment on the live site; confirm it lands in Supabase:
   `select * from public.appointment_requests order by created_at desc;`

────────────────────────────────────────────────────────────
## UPDATING THE SITE
────────────────────────────────────────────────────────────
Any push to `main` auto-rebuilds and redeploys in ~1 minute.

**With Termux (best for many files / new features):**
```bash
cd ~/fmc
# ...apply the changed files (e.g. from a new zip into ~/fmc, or edit directly)...
git add -A && git commit -m "describe the change" && git push
```

**Without Termux — two practical options:**

1. **GitHub web editor (phone browser, no Termux):**
   Chrome → github.com (Desktop site ON) → your repo → navigate to the file →
   pencil ✎ icon → edit → **Commit changes** → type a message → Commit.
   Cloudflare redeploys automatically. Ideal for small fixes (wording, phone
   numbers, a single file). Clunky for many files at once.

2. **GitHub web upload (phone browser):** repo → **Add file → Upload files** →
   choose files → Commit. Fine for replacing a handful of files; tedious for
   a whole new version.

3. **Any computer, later:** the same git commands from STEP C work on any PC —
   the GitHub repo is the single source of truth, so Termux was never
   mandatory, just the most convenient phone tool.

**Rule of thumb:** edit in browser for one-file fixes; use Termux (or a PC)
when a whole batch of files changes — e.g. when Stage 2 (admin console) ships.
