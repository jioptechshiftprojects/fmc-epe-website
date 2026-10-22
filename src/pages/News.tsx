import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

const fmtDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(d)) : "";

export default function News() {
  const { data, error, loading } = useQuery(api.news);
  return (
    <main>
      <PageHero title="News &amp; Press" subtitle="Announcements of achievements, programmes and milestones" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        {loading && <Loading label="Loading news…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No news published yet" hint="News articles will appear here." />
        )}
        {data?.map((n) => (
          <Link key={n.id} to={`/news/${n.slug}`} className="card block transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{fmtDate(n.published_at)}</p>
            <h2 className="mt-1 text-lg font-bold text-forest-800">{n.title}</h2>
            {n.excerpt && <p className="mt-1 text-sm text-forest-900/65">{n.excerpt}</p>}
            <span className="mt-3 inline-block text-xs font-semibold text-gold-600">Read more →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
