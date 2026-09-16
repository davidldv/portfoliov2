"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Clock, X } from "lucide-react";
import type { Category, WriteupMeta } from "@/lib/writeups";
import { DifficultyMeter } from "@/components/writeups/DifficultyMeter";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function fmt(iso: string, month: "short" | "long" = "short") {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: "UTC" });
}

type Props = { writeups: WriteupMeta[]; categories: { id: Category; label: string }[] };

export function WriteupsIndex({ writeups, categories }: Props) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState(false);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    writeups.forEach((w) => w.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [writeups]);

  const filtered = writeups.filter((w) => (category === "all" || w.category === category) && (!tag || w.tags.includes(tag)));
  const filtering = category !== "all" || tag !== null;
  const featured = writeups[0];
  const labelFor = (c: Category) => categories.find((x) => x.id === c)?.label ?? c;

  return (
    <div className="flex flex-col gap-16">
      {/* Latest */}
      <Reveal y={32}>
        <SpotlightCard as="article" className="group" data-cursor-label="Read">
          <Link href={`/writeups/${featured.slug}`} className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] text-fg-muted">
                <span className="uppercase tracking-[0.14em] text-accent">Latest</span>
                <span className="uppercase tracking-[0.14em]">{labelFor(featured.category)}</span>
                <span className="text-fg-dim">·</span>
                <time dateTime={featured.date}>{fmt(featured.date, "long")}</time>
              </div>
              <h2 className="display text-[1.9rem] leading-[1.08] transition-colors duration-300 group-hover:text-accent sm:text-[2.6rem]">{featured.title}</h2>
              <p className="max-w-2xl text-[1.02rem] leading-relaxed text-fg-muted">{featured.description}</p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-fg">
                Read the writeup
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-[var(--radius)] border border-border bg-border">
              <div className="flex flex-col gap-1 bg-bg-panel p-4">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-fg-dim">Reading</dt>
                <dd className="display font-mono text-2xl tabular-nums">{featured.readingMinutes} min</dd>
              </div>
              <div className="flex flex-col gap-1 bg-bg-panel p-4">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-fg-dim">Words</dt>
                <dd className="display font-mono text-2xl tabular-nums">{featured.words.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex flex-col gap-2 bg-bg-panel p-4">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-fg-dim">Difficulty</dt>
                <dd>{featured.difficulty ? <DifficultyMeter level={featured.difficulty} /> : <span className="text-fg-muted">n/a</span>}</dd>
              </div>
              <div className="flex flex-col gap-2 bg-bg-panel p-4">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-fg-dim">Topics</dt>
                <dd className="font-mono text-[0.72rem] leading-relaxed text-fg-muted">{featured.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</dd>
              </div>
            </dl>
          </Link>
        </SpotlightCard>
      </Reveal>

      {/* Filters */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="Category" className="relative inline-flex rounded-sm border border-border bg-surface p-0.5">
            {[{ id: "all" as const, label: "All" }, ...categories].map((c) => {
              const on = category === c.id;
              const count = c.id === "all" ? writeups.length : writeups.filter((w) => w.category === c.id).length;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCategory(c.id)}
                  className={cn("relative inline-flex h-8 items-center gap-2 rounded-sm px-3.5 text-[0.82rem] font-medium transition-colors duration-300", on ? "text-bg" : "text-fg-muted hover:text-fg")}
                >
                  {on && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-sm bg-fg" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                  <span className="relative">{c.label}</span>
                  <span className={cn("relative font-mono text-[0.68rem]", on ? "text-bg/60" : "text-fg-dim")}>{count}</span>
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[0.72rem] text-fg-dim" aria-live="polite">
            {filtered.length} of {writeups.length} shown
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" aria-label="Filter by tag">
          {(allTags ? tagCounts : tagCounts.filter(([t, n], i) => i < 10 || n > 1 || t === tag)).map(([t, n]) => {
            const on = tag === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTag(on ? null : t)}
                className={cn("chip gap-1.5", on && "border-accent/50 bg-accent-soft text-accent hover:border-accent hover:text-accent")}
              >
                #{t}
                <span className={cn("text-[0.62rem]", on ? "text-accent/70" : "text-fg-dim")}>{n}</span>
              </button>
            );
          })}
          {tagCounts.length > 10 && (
            <button
              type="button"
              onClick={() => setAllTags((v) => !v)}
              aria-expanded={allTags}
              className="inline-flex items-center rounded-sm px-2.5 py-1 font-mono text-[0.72rem] text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              {allTags ? "Fewer topics" : `+${tagCounts.length - 10} more`}
            </button>
          )}
          <AnimatePresence>
            {filtering && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => {
                  setCategory("all");
                  setTag(null);
                }}
                className="ml-1 inline-flex items-center gap-1 rounded-sm px-2.5 py-1 font-mono text-[0.72rem] text-fg-muted hover:text-fg"
              >
                <X className="h-3 w-3" aria-hidden />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* List */}
      <ol className="flex flex-col border-t border-border">
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((w, i) => (
            <motion.li
              key={w.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE, delay: filtering ? i * 0.03 : 0 }}
              className="group border-b border-border"
            >
              <Link
                href={`/writeups/${w.slug}`}
                data-cursor-label="Read"
                className="grid gap-4 py-7 transition-colors md:grid-cols-[8.5rem_minmax(0,1fr)_11rem] md:gap-10"
              >
                <div className="flex flex-row items-center gap-3 font-mono text-[0.72rem] text-fg-dim md:flex-col md:items-start md:gap-1.5">
                  <time dateTime={w.date}>{fmt(w.date)}</time>
                  <span className="uppercase tracking-[0.14em] text-fg-muted">{labelFor(w.category)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] transition-colors duration-300 group-hover:text-accent sm:text-[1.35rem]">
                    {w.title}
                  </h3>
                  <p className="max-w-2xl text-[0.93rem] leading-relaxed text-fg-muted">{w.description}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.68rem] text-fg-dim">
                    {w.tags.map((t) => (
                      <span key={t} className={cn(tag === t && "text-accent")}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-start">
                  <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] text-fg-muted">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {w.readingMinutes} min
                    </span>
                    {w.difficulty && <DifficultyMeter level={w.difficulty} />}
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-fg-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink md:mt-2">
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <li className="py-12 text-center text-sm text-fg-muted">Nothing matches that combination yet.</li>}
      </ol>
    </div>
  );
}
