import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { getWriteupMetas, formatDate } from "@/lib/writeups";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { DifficultyMeter } from "@/components/writeups/DifficultyMeter";

export async function Writing() {
  const writeups = (await getWriteupMetas()).slice(0, 5);

  return (
    <section id="writing" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="container-x flex flex-col gap-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            index="06"
            eyebrow="Writing"
            heading={
              <>
                Writeups that show the <span className="serif-italic text-accent">whole</span> attack, including the parts that failed.
              </>
            }
          />
          <Link href="/writeups" className="btn-ghost h-10 shrink-0 px-5 text-sm">
            All writeups
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <Reveal stagger={0.08} as="ol" className="flex flex-col border-t border-border">
          {writeups.map((w, i) => (
            <li key={w.slug} className="group border-b border-border">
              <Link
                href={`/writeups/${w.slug}`}
                data-cursor-label="Read"
                className="grid gap-3 py-6 transition-colors duration-300 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:items-baseline md:gap-8"
              >
                <span className="font-mono text-[0.72rem] text-fg-dim">
                  {String(i + 1).padStart(2, "0")} · {formatDate(w.date, "short")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[1.08rem] font-semibold tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent sm:text-xl">{w.title}</h3>
                  <p className="max-w-2xl text-[0.9rem] leading-relaxed text-fg-muted">{w.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.66rem] text-fg-dim">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      {w.readingMinutes} min
                    </span>
                    {w.difficulty && <DifficultyMeter level={w.difficulty} />}
                    {w.tags.slice(0, 3).map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-fg-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink md:justify-self-end">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
