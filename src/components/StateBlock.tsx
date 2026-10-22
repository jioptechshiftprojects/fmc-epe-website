export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="py-10 text-center text-sm text-forest-900/60">{label}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Something went wrong: {message}
    </p>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-forest-200 bg-white/60 px-6 py-10 text-center">
      <p className="font-semibold text-forest-800">{title}</p>
      {hint && <p className="mt-1 text-sm text-forest-900/60">{hint}</p>}
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-forest-700 px-4 py-10 text-center">
      <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm text-cream/85">{subtitle}</p>}
    </div>
  );
}
