import { PageHero } from "../components/StateBlock";

export default function About() {
  return (
    <main>
      <PageHero title="About the Centre" subtitle="Our mandate, our values and our story" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-forest-900/85">
        <section>
          <h2 className="text-xl font-bold text-forest-800">Who we are</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Federal Medical Centre, Epe is a federal tertiary health institution located in Epe,
            Lagos State, Nigeria. [Official profile text to be supplied by the hospital PRO —
            this paragraph is a placeholder.]
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-forest-800">Our mandate</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>Provide accessible, affordable and quality secondary and tertiary healthcare.</li>
            <li>Train doctors, nurses and allied health professionals.</li>
            <li>Conduct and support health research responsive to community needs.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-forest-800">Our values</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {["Compassion", "Integrity", "Excellence"].map((v) => (
              <div key={v} className="card text-center">
                <p className="font-bold text-forest-700">{v}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-forest-800">Leadership</h2>
          <p className="mt-2 text-sm leading-relaxed">
            [Names and profiles of the Medical Director and management team to be published here.]
          </p>
        </section>
      </div>
    </main>
  );
}
