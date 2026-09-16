import { about, site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { LocalTime } from "@/components/ui/LocalTime";

export function About() {
  return (
    <section id="about" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader index="03" eyebrow={about.eyebrow} heading={about.heading} />
          <Reveal stagger={0.1} className="flex max-w-2xl flex-col gap-5 text-[1.02rem] leading-relaxed text-fg-muted sm:text-lg">
            {about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-fg" : undefined}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <Reveal y={36} className="lg:pt-24">
          <div className="card flex flex-col gap-6 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Facts</span>
              <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] text-fg-dim">
                <LocalTime />
              </span>
            </div>
            <dl className="divide-y divide-border">
              {about.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3.5 text-sm">
                  <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-fg-dim">{f.label}</dt>
                  <dd className="text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-3 border-t border-border pt-5">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fg-dim">Languages</span>
              <ul className="flex gap-2">
                {site.languages.map((l) => (
                  <li key={l.code} className="flex flex-1 flex-col gap-0.5 rounded-sm border border-border bg-surface px-3 py-2.5">
                    <span className="display font-mono text-lg">{l.code}</span>
                    <span className="text-[0.72rem] text-fg-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-fg-muted">{site.availability}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
