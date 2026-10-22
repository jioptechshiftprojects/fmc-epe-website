import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

const fmtDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(d)) : "";

export default function Careers() {
  const { data, error, loading } = useQuery(api.careers);
  return (
    <main>
      <PageHero title="Careers &amp; Recruitment" subtitle="Vacancies and recruitment notices from the Centre" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        {loading && <Loading label="Loading vacancies…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No active vacancies" hint="New recruitment notices will be published here." />
        )}
        {data?.map((r) => (
          <div key={r.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-forest-800">{r.title}</h2>
                {r.summary && <p className="mt-1 text-sm text-forest-900/65">{r.summary}</p>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.is_open ? "bg-forest-50 text-forest-700 border border-forest-200" : "bg-slate-100 text-slate-500"}`}>
                {r.is_open ? "Open" : "Closed"}
              </span>
            </div>
            {r.deadline && <p className="mt-2 text-xs font-semibold text-gold-600">Application deadline: {fmtDate(r.deadline)}</p>}
            {r.requirements && <p className="mt-2 whitespace-pre-line text-sm text-forest-900/70">{r.requirements}</p>}
            <p className="mt-3 text-xs text-forest-900/50">
              Application instructions: follow the guidance in the official notice or contact the HR unit. [Application portal to be configured.]
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
