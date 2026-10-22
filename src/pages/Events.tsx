import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

const fmt = (d: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));

export default function Events() {
  const { data, error, loading } = useQuery(api.events);
  return (
    <main>
      <PageHero title="Events &amp; Programmes" subtitle="Health outreaches, ceremonies, CMEs and community programmes" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        {loading && <Loading label="Loading events…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No upcoming events" hint="Scheduled programmes will be listed here." />
        )}
        {data?.map((e) => (
          <div key={e.id} className="card flex flex-wrap items-start gap-4">
            <div className="rounded-lg bg-forest-600 px-3 py-2 text-center text-white">
              <p className="text-lg font-bold leading-none">{new Date(e.start_at).getDate()}</p>
              <p className="text-[10px] uppercase">{new Date(e.start_at).toLocaleString("en-NG", { month: "short" })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-forest-800">{e.title}</h2>
              <p className="text-xs font-semibold text-gold-600">{fmt(e.start_at)}{e.end_at ? ` – ${fmt(e.end_at)}` : ""}</p>
              {e.venue && <p className="text-sm text-forest-900/65">📍 {e.venue}</p>}
              {e.description && <p className="mt-1 text-sm text-forest-900/70">{e.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
