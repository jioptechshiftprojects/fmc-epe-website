import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function TrainingHome() {
  const { data, error, loading } = useQuery(api.trainingPrograms);

  return (
    <main>
      <PageHero
        title="Training &amp; Education"
        subtitle="Building the next generation of healthcare professionals — housemanship, residency and nursing education"
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="mb-8 max-w-3xl rounded-xl border border-forest-100 bg-white px-5 py-4 text-sm leading-relaxed text-forest-900/75">
          <strong className="text-forest-800">Please note the distinction:</strong> the{" "}
          <strong>Nursing Internship Programme</strong> is post-graduation clinical training for{" "}
          <em>fresh nursing graduates</em>, while the <strong>School of Nursing</strong> trains{" "}
          <em>enrolled students</em> through academic sessions (Fresh and Returning students). They are separate programmes.
        </p>
        {loading && <Loading label="Loading programmes..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="Programme details coming soon" hint="The training office is preparing the official programme information." />
        )}
        {data && data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {data.map((p) => {
              const soon = (p.badge || "").toLowerCase().includes("soon");
              return (
                <Link
                  key={p.id}
                  to={`/training/${p.slug}`}
                  className="card flex flex-col transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-forest-800">{p.name}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      soon ? "bg-gold-100 text-gold-600 border border-gold-500" : "bg-forest-50 text-forest-700 border border-forest-200"
                    }`}>{p.badge || "Ongoing"}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm text-forest-900/65">{p.summary}</p>
                  <span className="mt-4 text-xs font-bold text-gold-600">
                    {p.slug === "nursing" ? "Learn more & apply →" : "Learn more →"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 rounded-xl border border-gold-500 bg-gold-100 p-5">
          <p className="font-bold text-forest-800">Already applied or enrolled?</p>
          <p className="mt-1 text-sm text-forest-900/70">
            Nursing applicants and students can{" "}
            <Link to="/portal" className="font-bold underline underline-offset-2">sign in to the student portal</Link>{" "}
            to track applications, upload fee evidence and view results.
          </p>
        </div>
      </div>
    </main>
  );
}
