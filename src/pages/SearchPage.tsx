import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loading, PageHero } from "../components/StateBlock";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const safe = q.replace(/[%,()]/g, " ").trim();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!safe) return;
    let alive = true;
    (async () => {
      const like = `%${safe}%`;
      const [d, s, st, n, ev, f] = await Promise.all([
        supabase.from("departments").select("name,slug,description").eq("status", "published").or(`name.ilike.${like},description.ilike.${like}`),
        supabase.from("clinical_services").select("name,summary").eq("status", "published").or(`name.ilike.${like},summary.ilike.${like}`),
        supabase.from("staff_profiles").select("full_name,title,specialty").eq("status", "published").eq("is_public", true).or(`full_name.ilike.${like},title.ilike.${like},specialty.ilike.${like}`),
        supabase.from("news_articles").select("title,slug,excerpt,published_at").eq("status", "published").or(`title.ilike.${like},excerpt.ilike.${like}`),
        supabase.from("events").select("title,description,start_at").eq("status", "published").or(`title.ilike.${like},description.ilike.${like}`),
        supabase.from("faqs").select("question,answer,category").eq("status", "published").or(`question.ilike.${like},answer.ilike.${like}`),
      ]);
      if (alive)
        setData({
          departments: d.data ?? [], services: s.data ?? [], staff: st.data ?? [],
          news: n.data ?? [], events: ev.data ?? [], faqs: f.data ?? [],
        });
    })();
    return () => { alive = false; };
  }, [safe]);

  const total = data ? Object.values(data).reduce((n: number, arr: any) => n + arr.length, 0) : 0;

  const Section = ({ title, children }: { title: string; children: any }) =>
    children && children.length > 0 ? (
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-forest-800">{title} <span className="text-xs font-semibold text-gold-600">({children.length})</span></h2>
        <div className="space-y-3">{children}</div>
      </section>
    ) : null;

  return (
    <main>
      <PageHero title={`Search results for "${q}"`} subtitle={data ? `${total} match(es) across the website` : "Searching…"} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {!data && <Loading label="Searching…" />}
        {data && total === 0 && (
          <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center">
            <p className="font-semibold text-forest-800">No results for "{q}"</p>
            <p className="text-sm text-forest-900/60">Try a different word — e.g. a department name, a service, or a staff member's name.</p>
          </div>
        )}
        {data && (
          <>
            <Section title="Departments">
              {data.departments.map((r: any) => (
                <Link key={r.slug} to={`/departments/${r.slug}`} className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.name}</p>
                  {r.description && <p className="text-sm text-forest-900/65">{r.description.slice(0, 140)}…</p>}
                </Link>
              ))}
            </Section>
            <Section title="Services">
              {data.services.map((r: any, i: number) => (
                <Link key={i} to="/services" className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.name}</p>
                  {r.summary && <p className="text-sm text-forest-900/65">{r.summary.slice(0, 140)}…</p>}
                </Link>
              ))}
            </Section>
            <Section title="Staff">
              {data.staff.map((r: any, i: number) => (
                <Link key={i} to="/staff" className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.full_name}</p>
                  <p className="text-sm text-forest-900/65">{[r.title, r.specialty].filter(Boolean).join(" · ")}</p>
                </Link>
              ))}
            </Section>
            <Section title="News">
              {data.news.map((r: any) => (
                <Link key={r.slug} to={`/news/${r.slug}`} className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.title}</p>
                  {r.excerpt && <p className="text-sm text-forest-900/65">{r.excerpt.slice(0, 140)}…</p>}
                </Link>
              ))}
            </Section>
            <Section title="Events">
              {data.events.map((r: any) => (
                <Link key={r.id ?? r.start_at} to="/events" className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.title}</p>
                  {r.description && <p className="text-sm text-forest-900/65">{r.description.slice(0, 140)}…</p>}
                </Link>
              ))}
            </Section>
            <Section title="FAQs">
              {data.faqs.map((r: any, i: number) => (
                <Link key={i} to="/faqs" className="card block transition hover:border-gold-500">
                  <p className="font-bold text-forest-800">{r.question}</p>
                  <p className="text-sm text-forest-900/65">{r.answer.slice(0, 140)}…</p>
                </Link>
              ))}
            </Section>
          </>
        )}
      </div>
    </main>
  );
}
