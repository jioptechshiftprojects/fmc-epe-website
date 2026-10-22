import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, Loading } from "../components/StateBlock";

export default function TrainingProgram() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading } = useQuery(() => api.trainingPrograms(), []);

  if (loading) return <main className="px-4 py-16"><Loading label="Loading programme..." /></main>;
  const prog = (data ?? []).find((p) => p.slug === slug);
  if (!prog)
    return <main className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Programme not found" hint="It may not be published yet." /></main>;

  const paragraphs = (prog.details ?? "").split(/\n{2,}/);

  return (
    <main>
      <div className="bg-forest-700 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Link to="/training" className="text-xs font-semibold text-gold-400 hover:underline">← All training programmes</Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">{prog.name}</h1>
            {(prog.badge || "") !== "" && (
              <span className={`mt-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                (prog.badge || "").toLowerCase().includes("soon")
                  ? "bg-gold-500 text-forest-900"
                  : "bg-white/15 text-gold-400 border border-gold-500/60"
              }`}>{prog.badge}</span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm text-cream/85">{prog.summary}</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <article className="space-y-4 text-[15px] leading-relaxed text-forest-900/85">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </article>

        {(prog.slug === "housemanship" || prog.slug === "residency") && (
          <div className="mt-8 rounded-xl border border-gold-500 bg-gold-100 p-5">
            <p className="font-bold text-forest-800">Programme in view</p>
            <p className="mt-1 text-sm text-forest-900/70">
              This programme is being planned. Official entry requirements and application windows will be
              published here by the training office when admissions open.
            </p>
          </div>
        )}

        {prog.slug === "nursing-internship" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/contact" className="card transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-bold text-forest-800">Enquiries</p>
              <p className="mt-1 text-sm text-forest-900/65">
                Fresh nursing graduates should contact the training office for placement schedules and requirements.
              </p>
              <span className="mt-3 inline-block text-xs font-bold text-gold-600">Contact the office →</span>
            </Link>
            <Link to="/training/nursing" className="card transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-bold text-forest-800">Looking for the School of Nursing?</p>
              <p className="mt-1 text-sm text-forest-900/65">
                The School of Nursing is the student training programme — applications run through its own portal.
              </p>
              <span className="mt-3 inline-block text-xs font-bold text-gold-600">Go to School of Nursing →</span>
            </Link>
          </div>
        )}

        {prog.slug === "nursing" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/training/nursing/apply" className="card border-gold-500 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-bold text-forest-800">Apply for Admission</p>
              <p className="mt-1 text-sm text-forest-900/65">
                Create your applicant account and submit your application for the current intake.
              </p>
              <span className="mt-3 inline-block text-xs font-bold text-gold-600">Start application →</span>
            </Link>
            <Link to="/portal" className="card transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-lg font-bold text-forest-800">Student Portal</p>
              <p className="mt-1 text-sm text-forest-900/65">
                Applicants track their application; students manage profiles, fee evidence and results.
              </p>
              <span className="mt-3 inline-block text-xs font-bold text-gold-600">Sign in →</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
