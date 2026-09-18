"use client";

import { ArrowUpRight, GitBranch } from "lucide-react";
import { projects, type Project } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";
import { BenchmarkWaffle } from "@/components/ui/BenchmarkWaffle";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<Project["kind"], string> = {
  tool: "Security tool",
  lab: "Offense / defense lab",
  product: "Production system",
  research: "Research",
};

function Links({ p, className }: { p: Project; className?: string }) {
  return (
    <div className={cn("relative z-10 flex flex-wrap items-center gap-2", className)}>
      {p.repo && (
        <a href={p.repo} target="_blank" rel="noopener noreferrer" className="btn-ghost h-8 px-3 text-[0.78rem]">
          <GitBranch className="h-3.5 w-3.5" aria-hidden />
          Source
        </a>
      )}
      {p.href && (
        <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn-ghost h-8 px-3 text-[0.78rem]">
          Live
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
      {tags.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  );
}

function StretchedLink({ p }: { p: Project }) {
  const href = p.repo ?? p.href;
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-[1]" aria-label={`Open ${p.name}`} tabIndex={-1} />;
}

function FeaturedCard({ p, wide }: { p: Project; wide?: boolean }) {
  return (
    <SpotlightCard as="article" className={cn("flex flex-col", wide && "lg:col-span-2")}>
      <StretchedLink p={p} />
      <div className={cn("flex flex-1 flex-col gap-6 p-6 sm:p-8", wide && "lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10")}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow">{KIND_LABEL[p.kind]}</span>
            {p.kind === "tool" && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] text-fg-dim">
                open source
              </span>
            )}
          </div>
          <div>
            <h3 className="display text-[1.7rem] leading-tight sm:text-3xl">{p.name}</h3>
            <p className="mt-1.5 text-[0.95rem] text-fg-muted">{p.tagline}</p>
          </div>
          <p className="text-[0.95rem] leading-relaxed text-fg-muted">{p.description}</p>
          <ul className="flex flex-col gap-2.5">
            {p.highlights.map((h, i) => (
              <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-fg-muted">
                <span className="mt-[0.62rem] h-px w-4 shrink-0 bg-accent" aria-hidden />
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-4 pt-2">
            <Tags tags={p.tags} />
            <Links p={p} />
          </div>
        </div>

        {wide && p.benchmark && (
          <div className="relative z-10 flex flex-col justify-between gap-6 rounded-[var(--radius)] border border-border bg-surface p-5">
            <div>
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-dim">Seeded benchmark · live eval</span>
              <BenchmarkWaffle {...p.benchmark} className="mt-4" />
            </div>
            <ol className="flex flex-col gap-2 border-t border-border pt-5 font-mono text-[0.72rem]">
              {[
                ["01", "inventory", "ts-morph · deterministic"],
                ["02", "trace", "agent follows each id to its query"],
                ["03", "verify", "adversarial pass kills false positives"],
                ["04", "report", "SARIF · Markdown · JSON · exit codes"],
              ].map(([n, k, v]) => (
                <li key={k} className="grid grid-cols-[1.6rem_5.2rem_1fr] items-baseline gap-2">
                  <span className="text-fg-dim">{n}</span>
                  <span className="text-fg">{k}</span>
                  <span className="text-fg-muted">{v}</span>
                </li>
              ))}
            </ol>
            <dl className="grid grid-cols-3 gap-3 border-t border-border pt-5">
              {[
                { k: "Recall", v: "100%" },
                { k: "Precision", v: "100%" },
                { k: "Cost · time", v: "$2.10 · 19m" },
              ].map((s) => (
                <div key={s.k} className="flex flex-col gap-1">
                  <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-fg-dim">{s.k}</dt>
                  <dd className="display font-mono text-lg tabular-nums text-fg">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[0.78rem] leading-relaxed text-fg-muted">
              Then it ran on a real repository and found one genuine bug in eleven candidates. The gap turned out to be in the benchmark rather than
              the model, and the writeup says so.
            </p>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

function CompactCard({ p }: { p: Project }) {
  return (
    <SpotlightCard as="article" className="flex flex-col">
      <StretchedLink p={p} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <span className="eyebrow">{KIND_LABEL[p.kind]}</span>
        <div>
          <h3 className="display text-xl">{p.name}</h3>
          <p className="mt-1 text-sm text-fg-muted">{p.tagline}</p>
        </div>
        <p className="text-sm leading-relaxed text-fg-muted">{p.highlights[0]}</p>
        <div className="mt-auto flex flex-col gap-4 pt-2">
          <Tags tags={p.tags.slice(0, 4)} />
          <Links p={p} />
        </div>
      </div>
    </SpotlightCard>
  );
}

export function Work() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="work" className="relative z-10 bg-bg py-24 md:py-32">
      <div className="container-x flex flex-col gap-14">
        <SectionHeader
          index="01"
          eyebrow="Work"
          heading={
            <>
              Tools that attack, labs that prove it, <span className="serif-italic text-accent">products</span> that survived real users.
            </>
          }
          intro="Every security claim on this page maps to a repository you can run. The labs ship a broken half and a fixed half; the scanners ship their own benchmark."
        />

        <Reveal stagger={0.12} className="grid gap-4 lg:grid-cols-2">
          <FeaturedCard p={featured[0]} wide />
          {featured.slice(1).map((p) => (
            <FeaturedCard key={p.slug} p={p} />
          ))}
        </Reveal>

        <Reveal stagger={0.1} className="grid gap-4 md:grid-cols-3">
          {rest.map((p) => (
            <CompactCard key={p.slug} p={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
