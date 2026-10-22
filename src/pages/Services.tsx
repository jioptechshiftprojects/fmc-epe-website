import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import type { ClinicalService } from "../lib/types";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function Services() {
  const { data, error, loading } = useQuery<ClinicalService>(api.services);

  const byDept = new Map<string, ClinicalService[]>();
  (data ?? []).forEach((s) => {
    const key = s.departments?.name ?? "Other Services";
    if (!byDept.has(key)) byDept.set(key, []);
    byDept.get(key)!.push(s);
  });

  return (
    <main>
      <PageHero title="Clinical Services" subtitle="What we offer, organised by department" />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {loading && <Loading label="Loading services…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && byDept.size === 0 && (
          <EmptyState title="Services coming soon" hint="The clinical service catalogue is being prepared." />
        )}
        {[...byDept.entries()].map(([dept, services]) => (
          <section key={dept}>
            <h2 className="mb-3 text-lg font-bold text-forest-800">{dept}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="card">
                  <p className="font-semibold text-forest-800">{s.name}</p>
                  {s.summary && <p className="mt-1 text-sm text-forest-900/65">{s.summary}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
