// Cloudflare Turnstile helpers. Everything degrades gracefully:
// - no VITE_TURNSTILE_SITE_KEY  -> no widget, forms unchanged
// - verifier URL unreachable    -> submission still allowed (soft gate)
let loader: Promise<boolean> | null = null;

export function loadTurnstile(): Promise<boolean> {
  if (loader) return loader;
  loader = new Promise((resolve) => {
    const w = window as any;
    if (w.turnstile) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
    let tries = 0;
    const t = window.setInterval(() => {
      if (w.turnstile) { window.clearInterval(t); resolve(true); }
      else if (++tries > 100) { window.clearInterval(t); resolve(false); }
    }, 200);
  });
  return loader;
}

export async function verifyToken(token: string): Promise<boolean | null> {
  const url = ((import.meta.env.VITE_TURNSTILE_VERIFY_URL as string | undefined) ?? "").trim();
  if (!url) return null;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.success === true;
  } catch {
    return null;
  }
}

export function resetWidget(id: string | null) {
  try { (window as any).turnstile?.reset(id); } catch { /* noop */ }
}
