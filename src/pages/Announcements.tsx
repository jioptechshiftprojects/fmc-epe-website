import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function Announcements() {
  const { data, error, loading } = useQuery(api.announcements);
  return (
    <main>
      <PageHero title="Announcements" subtitle="Official notices from the management of the Centre" />
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-10">
        {loading && <Loading label="Loading announcements…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No active announcements" />
        )}
        {data?.map((a) => (
          <div key={a.id} className={`rounded-xl border p-5 ${a.is_urgent ? "border-gold-500 bg-gold-100" : "border-forest-100 bg-white"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {a.is_urgent && <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-forest-900">Urgent</span>}
              <h2 className="font-bold text-forest-900">{a.title}</h2>
            </div>
            <p className="mt-1 text-sm text-forest-900/70">{a.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
