import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, Loading } from "../components/StateBlock";

const fmtDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(d)) : "";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading } = useQuery(() => api.newsBySlug(slug!), [slug]);

  if (loading) return <main className="px-4 py-16"><Loading label="Loading article…" /></main>;
  if (!data || data.length === 0)
    return <main className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Article not found" hint="It may not be published yet." /></main>;

  const article = data[0];
  const paragraphs = article.body.split(/\n{2,}/);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/news" className="text-xs font-semibold text-forest-700 hover:underline">← All news</Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-600">{fmtDate(article.published_at)}</p>
      <h1 className="mt-1 text-2xl font-bold text-forest-800 md:text-3xl">{article.title}</h1>
      <article className="mt-6 space-y-4 text-[15px] leading-relaxed text-forest-900/85">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </article>
    </main>
  );
}
