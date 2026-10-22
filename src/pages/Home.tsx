import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, Loading, ErrorState } from "../components/StateBlock";

const fmtDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(d)) : "";

function HeroSlideshow() {
  const { data: slides } = useQuery(api.heroSlides);
  const [index, setIndex] = useState(0);
  const list =
    slides && slides.length > 0
      ? slides
      : [{ id: "fallback", image_path: "/assets/fmc-campus-wall.jpg", video_path: null }];

  useEffect(() => {
    if (list.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 6000);
    return () => window.clearInterval(t);
  }, [list.length]);

  const active = index % list.length;
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {list.map((s: any, i: number) => (
        <div
          key={s.id}
          className={"absolute inset-0 transition-opacity duration-[1500ms] " + (i === active ? "opacity-100" : "opacity-0")}
        >
          {s.video_path && i === active ? (
            <video
              className="h-full w-full object-cover"
              src={mediaUrl(s.video_path) ?? undefined}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={mediaUrl(s.image_path) ?? "/assets/fmc-campus-wall.jpg"}
              alt=""
              className={"h-full w-full object-cover " + (i === active ? "animate-kenburns" : "")}
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/70 to-forest-900/25" />
    </div>
  );
}

export default function Home() {
  const { data: depts } = useQuery(api.departments);
  const { data: news } = useQuery(api.news);
  const { data: anns, loading: annLoading, error: annError } = useQuery(api.announcements);

  return (
    <main>
      {/* Hero with cinematic slideshow */}
      <section className="relative isolate overflow-hidden bg-forest-900">
        <HeroSlideshow />
        <div className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[640px]">
          <span className="inline-block w-fit rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest-900">
            Federal Tertiary Health Institution
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white drop-shadow md:text-5xl">
            Excellence in Service Delivery and Training
          </h1>
          <p className="mt-4 max-w-xl text-cream/90 drop-shadow">
            Compassionate, affordable and quality healthcare for Epe, Lagos East and beyond —
            backed by modern departments, skilled clinicians and a commitment to medical training.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/appointments" className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-forest-900 transition hover:bg-gold-400">
              Book an Appointment
            </Link>
            <Link to="/training" className="rounded-lg border border-cream/50 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-700/60">
              Explore Training
            </Link>
            <Link to="/departments" className="rounded-lg border border-cream/50 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-700/60">
              Explore Departments
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements strip */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        {annError && <ErrorState message={annError} />}
        {annLoading ? null : anns && anns.length > 0 ? (
          <div className="space-y-3">
            {anns.slice(0, 2).map((a) => (
              <div key={a.id} className={`flex flex-wrap items-start gap-3 rounded-xl border p-4 ${a.is_urgent ? "border-gold-500 bg-gold-100" : "border-forest-100 bg-white"}`}>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${a.is_urgent ? "bg-gold-500 text-forest-900" : "bg-forest-600 text-white"}`}>
                  {a.is_urgent ? "Urgent" : "Notice"}
                </span>
                <div>
                  <p className="font-semibold text-forest-900">{a.title}</p>
                  <p className="text-sm text-forest-900/70">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Departments preview */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-forest-800">Our Departments</h2>
            <p className="text-sm text-forest-900/60">Specialised care across key clinical areas.</p>
          </div>
          <Link to="/departments" className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline">View all →</Link>
        </div>
        {!depts ? <Loading /> : depts.length === 0 ? (
          <EmptyState title="Departments coming soon" hint="Published departments will appear here once the content team adds them." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {depts.slice(0, 4).map((d) => (
              <Link key={d.id} to={`/departments/${d.slug}`} className="card transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
                <h3 className="font-bold text-forest-800">{d.name}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-forest-900/65">{d.description}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-gold-600">Learn more →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest news */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-forest-800">Latest News</h2>
            <Link to="/news" className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline">All news →</Link>
          </div>
          {!news ? <Loading /> : news.length === 0 ? (
            <EmptyState title="No news yet" hint="Hospital news and press releases will be published here." />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {news.slice(0, 3).map((n) => (
                <Link key={n.id} to={`/news/${n.slug}`} className="card transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{fmtDate(n.published_at)}</p>
                  <h3 className="mt-1 font-bold leading-snug text-forest-800">{n.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-forest-900/65">{n.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-forest-700 px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">We value your feedback</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-cream/85">
          Questions, complaints, compliments or suggestions — help us serve you better.
        </p>
        <Link to="/contact" className="mt-5 inline-block rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-bold text-forest-900 hover:bg-gold-400">
          Contact Us
        </Link>
      </section>
    </main>
  );
}
