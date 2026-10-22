# Running the FMC Epe Website Locally on Android (Termux)

Tested path for the Stage 1 public website. The site runs entirely on your
phone at http://localhost:5173 — no one else can see it until we deploy.

## 1. Install Termux (once)
- Get **Termux from F-Droid** (f-droid.org) or GitHub releases — NOT the Google
  Play version (it is outdated and cannot run current Node).
- Also install **Termux:API** from the same source (optional, for wake locks).

## 2. One-time setup (~5 min)
```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts unzip nano
termux-setup-storage          # tap "Allow" so Termux can reach Downloads
```

## 3. Put the project on the phone
- Download `fmc-epe-foundation.zip` from the Kimi chat into **Download**.
```bash
cd /sdcard/Download
unzip fmc-epe-foundation.zip -d ~/fmc
cd ~/fmc
```

## 4. Configure environment
```bash
cp .env.example .env
nano .env
```
Replace the two placeholder values (keep no quotes):
- `VITE_SUPABASE_URL` — from Supabase → Project Settings → API
- `VITE_SUPABASE_ANON_KEY` — the anon public key, same page
Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

## 5. Install dependencies (~3–8 min on phones)
```bash
npm install
```
Needs ~300 MB free space. If it errors midway, just run it again.

## 6. Run the site
```bash
npm run dev
```
Then open Chrome → **http://localhost:5173**

## 7. Browse and verify
- Departments, Services, Our Team, News, Events, FAQs, Careers, Procurement
  should show the demo content (run `supabase/seed_demo_content.sql` in the
  Supabase SQL Editor first if you have not).
- Try **Book Appointment** and **Contact** — submissions land in Supabase;
  check with: `select * from public.appointment_requests order by created_at desc;`

## Keeping the server alive
Android kills background apps. To prevent it while you browse:
```bash
termux-wake-lock        # keep CPU awake (needs Termux:API)
```
Keep the Termux session in the foreground, or use Android split-screen
(Termux on top, Chrome below).

## Stop / restart
- Stop the server: `Ctrl+C` — on Termux, Ctrl is the **Volume Down** key
  (Volume Down + C), or the CTRL key in the extra-keys row above the keyboard.
- Resume later:
```bash
cd ~/fmc && npm run dev
```

## Troubleshooting
| Symptom | Fix |
|---|---|
| `Permission denied` on /sdcard | Run `termux-setup-storage` again and allow |
| `npm: command not found` | `pkg install nodejs-lts` |
| Port 5173 busy | Vite prints an alternative port (5174…) — use the URL it shows |
| White page / env error | `.env` values wrong or missing — fix and restart `npm run dev` |
| `npm install` network errors | Re-run; check connection; `npm cache clean --force` as last resort |
