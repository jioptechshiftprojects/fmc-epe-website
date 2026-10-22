import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

const fmtDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(d)) : "";

export default function Procurement() {
  const { data, error, loading } = useQuery(api.procurement);
  return (
    <main>
      <PageHero title="Procurement Notices" subtitle="Tenders and procurement opportunities — published in line with public procurement rules" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        {loading && <Loading label="Loading notices…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No published notices" hint="Procurement notices will be published here." />
        )}
        {data?.map((p) => (
          <div key={p.id} className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Ref: {p.reference_no}</p>
            <h2 className="mt-1 text-lg font-bold text-forest-800">{p.title}</h2>
            {p.description && <p className="mt-1 text-sm text-forest-900/65">{p.description}</p>}
            {p.deadline && <p className="mt-2 text-xs font-semibold text-gold-600">Submission deadline: {fmtDate(p.deadline)}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
