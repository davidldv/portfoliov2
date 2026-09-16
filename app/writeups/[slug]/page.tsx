import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, Mail } from "lucide-react";
import { site } from "@/content/site";
import { CATEGORIES, formatDate, getWriteup, getWriteups } from "@/lib/writeups";
import { renderMarkdown } from "@/lib/markdown";
import { ReadingProgress } from "@/components/writeups/ReadingProgress";
import { TableOfContents } from "@/components/writeups/TableOfContents";
import { DifficultyMeter } from "@/components/writeups/DifficultyMeter";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getWriteups()).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writeups/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getWriteup(slug);
  if (!found) return {};
  const { writeup: w } = found;
  return {
    title: w.title,
    description: w.description,
    keywords: w.tags,
    alternates: { canonical: `/writeups/${w.slug}` },
    openGraph: {
      type: "article",
      title: w.title,
      description: w.description,
      url: `/writeups/${w.slug}`,
      publishedTime: w.date,
      modifiedTime: w.updated ?? w.date,
      authors: [site.name],
      tags: w.tags,
    },
    twitter: { card: "summary_large_image", title: w.title, description: w.description },
  };
}

export default async function WriteupPage({ params }: PageProps<"/writeups/[slug]">) {
  const { slug } = await params;
  const found = await getWriteup(slug);
  if (!found) notFound();
  const { writeup: w, prev, next } = found;
  const { content, toc } = await renderMarkdown(w.body);

  // Structured data. JSON.stringify output is escaped so a "</script>" in a title can't break out of the tag.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: w.title,
    description: w.description,
    datePublished: w.date,
    dateModified: w.updated ?? w.date,
    keywords: w.tags.join(", "),
    wordCount: w.words,
    author: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/writeups/${w.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress targetId="article-body" />

      <article className="relative z-10">
        <div className="bg-grid mask-fade-radial pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[70vmin] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--accent-glow), transparent 70%)" }}
          aria-hidden
        />

        <header className="container-x relative pb-12 pt-32 md:pb-16 md:pt-40">
          <Reveal className="mx-auto flex max-w-[46rem] flex-col gap-7 xl:max-w-6xl xl:pr-[19rem]" stagger={0.08} y={18} start="top 100%">
            <Link
              href="/writeups"
              className="group inline-flex w-fit items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-fg"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
              All writeups
            </Link>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-[0.72rem] text-fg-muted">
              <span className="uppercase tracking-[0.14em] text-accent">
                {CATEGORIES[w.category]}
              </span>
              <time dateTime={w.date}>{formatDate(w.date)}</time>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {w.readingMinutes} min read
              </span>
              {w.difficulty && <DifficultyMeter level={w.difficulty} />}
              {w.cve && <span className="text-status-critical">{w.cve}</span>}
            </div>

            <h1 className="display text-[2.3rem] leading-[1.04] sm:text-5xl md:text-[3.6rem]">{w.title}</h1>
            <p className="max-w-3xl text-[1.08rem] leading-relaxed text-fg-muted sm:text-xl sm:leading-relaxed">{w.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <span className="display inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface font-mono text-[0.8rem]">
                  DL
                </span>
                <div className="flex flex-col">
                  <span className="text-sm text-fg">{site.name}</span>
                  <span className="font-mono text-[0.68rem] text-fg-dim">{site.role}</span>
                </div>
              </div>
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {w.tags.map((t) => (
                  <li key={t} className="chip">
                    #{t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </header>

        <div className="container-x relative pb-24">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16">
            <div className="mx-auto w-full min-w-0 max-w-[46rem] xl:mx-0">
              {toc.length > 2 && (
                <div className="mb-10 xl:hidden">
                  <TableOfContents items={toc} variant="inline" />
                </div>
              )}

              <div id="article-body" className="prose-writeup">
                {content}
              </div>

              <aside className="mt-16 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[0.95rem] font-medium text-fg">Found a mistake, or want to argue about it?</p>
                  <p className="text-sm text-fg-muted">Corrections and counter-arguments are welcome. I read everything.</p>
                </div>
                <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Re: ${w.title}`)}`} className="btn-ghost h-10 shrink-0 px-4 text-sm">
                  <Mail className="h-4 w-4" aria-hidden />
                  Email me
                </a>
              </aside>

              {(prev || next) && (
                <nav aria-label="More writeups" className="mt-10 grid gap-4 sm:grid-cols-2">
                  {prev ? (
                    <SpotlightCard className="flex">
                      <Link href={`/writeups/${prev.slug}`} className="group flex w-full flex-col gap-2 p-5" data-cursor-label="Read">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-dim">
                          <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
                          Older
                        </span>
                        <span className="text-[0.98rem] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent">{prev.title}</span>
                        <span className="font-mono text-[0.68rem] text-fg-dim">
                          {formatDate(prev.date, "short")} · {prev.readingMinutes} min
                        </span>
                      </Link>
                    </SpotlightCard>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  {next && (
                    <SpotlightCard className="flex">
                      <Link href={`/writeups/${next.slug}`} className="group flex w-full flex-col items-end gap-2 p-5 text-right" data-cursor-label="Read">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-dim">
                          Newer
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                        </span>
                        <span className="text-[0.98rem] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent">{next.title}</span>
                        <span className="font-mono text-[0.68rem] text-fg-dim">
                          {formatDate(next.date, "short")} · {next.readingMinutes} min
                        </span>
                      </Link>
                    </SpotlightCard>
                  )}
                </nav>
              )}
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-28 flex flex-col gap-8">
                {toc.length > 0 && <TableOfContents items={toc} />}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-6 font-mono text-[0.7rem]">
                  <dt className="text-fg-dim">Published</dt>
                  <dd className="text-right text-fg-muted">{formatDate(w.date, "short")}</dd>
                  {w.updated && (
                    <>
                      <dt className="text-fg-dim">Updated</dt>
                      <dd className="text-right text-fg-muted">{formatDate(w.updated, "short")}</dd>
                    </>
                  )}
                  <dt className="text-fg-dim">Words</dt>
                  <dd className="text-right text-fg-muted">{w.words.toLocaleString("en-US")}</dd>
                  <dt className="text-fg-dim">Reading</dt>
                  <dd className="text-right text-fg-muted">{w.readingMinutes} min</dd>
                </dl>
                <a
                  href="https://github.com/davidldv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-[0.8rem] text-fg-muted transition-colors hover:text-fg"
                >
                  Code on GitHub
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
