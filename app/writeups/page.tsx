import type { Metadata } from "next";
import { CATEGORIES, getWriteupMetas } from "@/lib/writeups";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WriteupsIndex } from "@/components/writeups/WriteupsIndex";

export const metadata: Metadata = {
  title: "Writeups",
  description: "Security writeups: agent-driven IDOR detection, JWT attacks, scanner engineering and AppSec research, with the parts that failed left in.",
  alternates: { canonical: "/writeups" },
};

export default async function WriteupsPage() {
  const writeups = await getWriteupMetas();
  const minutes = writeups.reduce((n, w) => n + w.readingMinutes, 0);
  const tags = new Set(writeups.flatMap((w) => w.tags));
  const categories = [...new Set(writeups.map((w) => w.category))].map((c) => ({ id: c, label: CATEGORIES[c] }));

  return (
    <div className="relative z-10">
      <div className="bg-grid mask-fade-radial pointer-events-none absolute inset-x-0 top-0 h-[640px] opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute right-[8%] top-10 h-[460px] w-[60vmin] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent-glow), transparent 70%)" }}
        aria-hidden
      />

      <section className="container-x relative pb-10 pt-32 md:pt-40">
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <SectionHeader
            index="06"
            eyebrow="Writeups"
            heading={
              <>
                Notes from <span className="serif-italic text-accent">breaking</span> things, then fixing them.
              </>
            }
            intro="How the attacks work, how I stopped them, and what my own tools got wrong. Benchmarks and dead ends included."
          />
          <Reveal stagger={0.08} className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border">
            {[
              { v: writeups.length, l: "Writeups" },
              { v: minutes, l: "Minutes of reading" },
              { v: tags.size, l: "Topics" },
            ].map((s) => (
              <div key={s.l} className="flex min-w-[7.5rem] flex-col gap-1 bg-bg-elevated px-5 py-4">
                <span className="display font-mono text-3xl tabular-nums">{s.v}</span>
                <span className="text-[0.72rem] text-fg-muted">{s.l}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container-x relative pb-28">
        <WriteupsIndex writeups={writeups} categories={categories} />
      </section>
    </div>
  );
}
