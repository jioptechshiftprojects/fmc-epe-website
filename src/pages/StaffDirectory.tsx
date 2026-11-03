import { useState } from "react";
import { api, mediaUrl } from "../lib/api";
import { useQuery } from "../lib/hooks";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

function PersonCard({ s, expandable, onZoom }: { s: any; expandable?: boolean; onZoom?: (s: any) => void }) {
  const photo = mediaUrl(s.photo_path);
  const img = photo ? (
    <img
      src={photo}
      alt={s.full_name}
      onClick={expandable ? () => onZoom?.(s) : undefined}
      className={`mx-auto h-20 w-20 rounded-full border-2 border-gold-500 object-cover ${expandable ? "cursor-zoom-in transition hover:scale-105" : ""}`}
    />
  ) : (
    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-500 bg-forest-600 text-xl font-bold text-white">
      {s.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
    </span>
  );
  return (
    <div className="card text-center">
      {img}
      <p className="mt-3 font-bold text-forest-800">{s.full_name}</p>
      <p className="text-xs font-semibold text-gold-600">{[s.title, s.specialty].filter(Boolean).join(" · ")}</p>
      <p className="text-xs text-forest-900/60">{s.departments?.name}</p>
      {s.bio && <p className="mt-2 line-clamp-3 text-xs text-forest-900/65">{s.bio}</p>}
      {expandable && <p className="mt-2 text-[10px] font-semibold text-forest-900/40">Tap photo to enlarge</p>}
    </div>
  );
}

export default function StaffDirectory() {
  const { data, error, loading } = useQuery(api.staff);
  const [zoom, setZoom] = useState<any | null>(null);

  const management = (data ?? []).filter((s) => s.is_management);
  const clinicians = (data ?? []).filter((s) => !s.is_management);

  return (
    <main>
      <PageHero
        title="Management Team"
        subtitle="The leadership of the Centre — and the clinicians and specialists of FMC Epe"
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading && <Loading label="Loading team…" />}
        {error && <ErrorState message={error} />}

        {!loading && !error && management.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-forest-800">
              Management Team <span className="text-xs font-semibold text-gold-600">({management.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {management.map((s) => <PersonCard key={s.id} s={s} expandable onZoom={setZoom} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-lg font-bold text-forest-800">
            Clinicians and Specialists of FMC Epe <span className="text-xs font-semibold text-gold-600">({clinicians.length})</span>
          </h2>
          {!loading && !error && clinicians.length === 0 ? (
            <EmptyState title="Clinician profiles coming soon" hint="Clinician profiles will be published here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {clinicians.map((s) => <PersonCard key={s.id} s={s} />)}
            </div>
          )}
        </section>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6"
          onClick={() => setZoom(null)}
        >
          <img
            src={mediaUrl(zoom.photo_path) ?? ""}
            alt={zoom.full_name}
            className="max-h-[70vh] w-auto rounded-2xl border-4 border-gold-500 object-contain"
          />
          <p className="mt-4 text-lg font-bold text-white">{zoom.full_name}</p>
          <p className="text-sm text-gold-400">{[zoom.title, zoom.specialty].filter(Boolean).join(" · ")}</p>
          <p className="mt-3 text-xs text-white/60">Tap anywhere to close</p>
        </div>
      )}
    </main>
  );
}
