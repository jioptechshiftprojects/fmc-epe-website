import { api, mediaUrl } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function StaffDirectory() {
  const { data, error, loading } = useQuery(api.staff);
  return (
    <main>
      <PageHero title="Our Team" subtitle="Meet the clinicians and specialists of the Centre" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading && <Loading label="Loading team…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (data?.length === 0 || !data) && (
          <EmptyState title="Team profiles coming soon" hint="Clinician profiles will be published here." />
        )}
        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((s) => {
              const photo = mediaUrl(s.photo_path);
              return (
                <div key={s.id} className="card text-center">
                  {photo ? (
                    <img src={photo} alt={s.full_name} className="mx-auto h-20 w-20 rounded-full border-2 border-gold-500 object-cover" />
                  ) : (
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-500 bg-forest-600 text-xl font-bold text-white">
                      {s.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <p className="mt-3 font-bold text-forest-800">{s.full_name}</p>
                  <p className="text-xs font-semibold text-gold-600">{[s.title, s.specialty].filter(Boolean).join(" · ")}</p>
                  <p className="text-xs text-forest-900/60">{s.departments?.name}</p>
                  {s.bio && <p className="mt-2 line-clamp-3 text-xs text-forest-900/65">{s.bio}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
