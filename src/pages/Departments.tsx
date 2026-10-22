import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function Departments() {
  const { data, error, loading } = useQuery(api.departments);
  return (
    <main>
      <PageHero title="Departments" subtitle="Clinical departments and units of the Centre" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading && <Loading label="Loading departments…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="No departments published yet" hint="Content is being prepared by the hospital team." />
        )}
        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => (
              <Link key={d.id} to={`/departments/${d.slug}`} className="card transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
                <h3 className="text-lg font-bold text-forest-800">{d.name}</h3>
                <p className="mt-2 text-sm text-forest-900/70">{d.description}</p>
                <span className="mt-4 inline-block text-xs font-semibold text-gold-600">View department →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
