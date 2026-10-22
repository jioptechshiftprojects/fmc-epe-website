import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading } from "../components/StateBlock";

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dept = useQuery(() => api.departmentBySlug(slug!), [slug]);
  const services = useQuery(
    () => (dept.data ? api.servicesByDepartment(dept.data[0].id) : Promise.resolve({ data: null, error: null })),
    [dept.data]
  );
  const staff = useQuery(
    () => (dept.data ? api.staffByDepartment(dept.data[0].id) : Promise.resolve({ data: null, error: null })),
    [dept.data]
  );

  if (dept.loading) return <main className="px-4 py-16"><Loading label="Loading department…" /></main>;
  if (dept.error || !dept.data || dept.data.length === 0)
    return <main className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Department not found" hint="It may not be published yet." /></main>;

  const d = dept.data[0];

  return (
    <main>
      <div className="bg-forest-700 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Link to="/departments" className="text-xs font-semibold text-gold-400 hover:underline">← All departments</Link>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">{d.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-cream/85">{d.description}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-10 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold text-forest-800">Services offered</h2>
          {services.loading ? <Loading /> : services.error ? <ErrorState message={services.error} /> :
            !services.data || services.data.length === 0 ? <EmptyState title="Services to be announced" /> : (
              <ul className="space-y-2">
                {services.data.map((s) => (
                  <li key={s.id} className="rounded-lg border border-forest-100 bg-white px-4 py-3">
                    <p className="font-semibold text-forest-800">{s.name}</p>
                    {s.summary && <p className="text-sm text-forest-900/65">{s.summary}</p>}
                  </li>
                ))}
              </ul>
            )}
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold text-forest-800">Clinical team</h2>
          {staff.loading ? <Loading /> : staff.error ? <ErrorState message={staff.error} /> :
            !staff.data || staff.data.length === 0 ? <EmptyState title="Team profiles coming soon" /> : (
              <ul className="space-y-2">
                {staff.data.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border border-forest-100 bg-white px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-600 font-bold text-white">
                      {s.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="font-semibold text-forest-800">{s.full_name}</p>
                      <p className="text-xs text-forest-900/60">{[s.title, s.specialty].filter(Boolean).join(" · ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </main>
  );
}
