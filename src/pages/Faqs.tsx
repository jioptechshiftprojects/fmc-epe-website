import { useState } from "react";
import { api } from "../lib/api";
import { useQuery } from "../lib/hooks";
import type { Faq } from "../lib/types";
import { EmptyState, ErrorState, Loading, PageHero } from "../components/StateBlock";

export default function Faqs() {
  const { data, error, loading } = useQuery(api.faqs);
  const [open, setOpen] = useState<string | null>(null);

  const byCat = new Map<string, Faq[]>();
  (data ?? []).forEach((f) => {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category)!.push(f);
  });

  return (
    <main>
      <PageHero title="Frequently Asked Questions" subtitle="Quick answers to common enquiries" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        {loading && <Loading label="Loading FAQs…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && byCat.size === 0 && <EmptyState title="FAQs coming soon" />}
        {[...byCat.entries()].map(([cat, faqs]) => (
          <section key={cat}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gold-600">{cat}</h2>
            <div className="space-y-2">
              {faqs.map((f) => (
                <div key={f.id} className="rounded-lg border border-forest-100 bg-white">
                  <button
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-forest-800"
                    onClick={() => setOpen(open === f.id ? null : f.id)}
                    aria-expanded={open === f.id}
                  >
                    {f.question}
                    <span className="text-gold-600">{open === f.id ? "−" : "+"}</span>
                  </button>
                  {open === f.id && <p className="border-t border-forest-100 px-4 py-3 text-sm text-forest-900/75">{f.answer}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
