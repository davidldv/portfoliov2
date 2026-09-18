"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, Briefcase, GraduationCap, Rocket } from "lucide-react";
import { certs, timeline, type TimelineEntry } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const KIND: Record<TimelineEntry["kind"], { label: string; Icon: typeof Rocket; tone: string }> = {
  shipped: { label: "Shipped", Icon: Rocket, tone: "text-accent" },
  work: { label: "Work", Icon: Briefcase, tone: "text-fg" },
  education: { label: "Education", Icon: GraduationCap, tone: "text-fg-muted" },
  cert: { label: "Credential", Icon: Award, tone: "text-success" },
};

export function Timeline() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const line = root.querySelector<HTMLElement>("[data-line]");
      const items = gsap.utils.toArray<HTMLElement>("[data-entry]", root);
      const rails = gsap.utils.toArray<HTMLElement>("[data-rail]", root);

      if (reduced) {
        gsap.set(items, { opacity: 1, y: 0 });
        gsap.set(line, { scaleY: 1 });
        rails.forEach((r) => (r.style.transform = `scaleX(${r.dataset.rail})`));
        return;
      }

      // The spine draws itself as you scroll past the entries.
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: root.querySelector("[data-list]"), start: "top 70%", end: "bottom 70%", scrub: 0.4 },
          },
        );
      }
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 82%", once: true } },
        );
        const dot = item.querySelector<HTMLElement>("[data-dot]");
        if (dot) {
          gsap.to(dot, {
            backgroundColor: "var(--accent)",
            duration: 0.4,
            scrollTrigger: { trigger: item, start: "top 70%", toggleActions: "play none none reverse" },
          });
        }
      });
      rails.forEach((r) => {
        gsap.fromTo(
          r,
          { scaleX: 0 },
          { scaleX: Number(r.dataset.rail), duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: r, start: "top 90%", once: true } },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="timeline" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="container-x flex flex-col gap-14">
        <SectionHeader
          index="05"
          eyebrow="Timeline"
          heading={
            <>
              From shipping features to shipping the <span className="serif-italic text-accent">specs</span> agents build from.
            </>
          }
          intro="Work, study and the open-source releases, newest first."
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
          <ol data-list className="relative flex flex-col gap-2 pl-8 sm:pl-10">
            <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-border sm:left-[9px]" />
            <span aria-hidden data-line className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-accent sm:left-[9px]" style={{ transform: "scaleY(0)" }} />
            {timeline.map((t, i) => {
              const k = KIND[t.kind];
              return (
                <li key={i} data-entry className="relative rounded-sm p-4 opacity-0 transition-colors duration-300 hover:bg-surface sm:p-5">
                  <span
                    data-dot
                    aria-hidden
                    className="absolute -left-[25px] top-[1.85rem] h-px w-4 bg-border-strong sm:-left-[31px] sm:w-5"
                  />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-mono text-[0.72rem] text-fg-dim">{t.date}</span>
                    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[0.72rem]", k.tone)}>
                      <k.Icon className="h-3 w-3" aria-hidden />
                      {k.label}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[1.08rem] font-semibold tracking-[-0.01em]">
                    {t.href?.startsWith("/") ? (
                      <Link href={t.href} className="group inline-flex items-center gap-1.5 hover:text-accent">
                        {t.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
                      </Link>
                    ) : t.href ? (
                      <a href={t.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 hover:text-accent">
                        {t.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
                      </a>
                    ) : (
                      t.title
                    )}
                  </h3>
                  <p className="text-[0.82rem] text-fg-muted">{t.org}</p>
                  <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-fg-muted">{t.description}</p>
                </li>
              );
            })}
          </ol>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card flex flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Credentials</span>
                <span className="font-mono text-[0.68rem] text-fg-dim">{certs.filter((c) => c.status === "completed").length} done</span>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {certs.map((c) => (
                  <li key={c.name} className="flex flex-col gap-2.5 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[0.95rem] font-medium leading-snug">{c.name}</h4>
                        <p className="text-[0.78rem] text-fg-muted">{c.issuer}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-[0.72rem]",
                          c.status === "completed" ? "text-success" : "text-accent",
                        )}
                      >
                        {c.status === "completed" ? "Done" : "In progress"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 overflow-hidden bg-border">
                        <div
                          data-rail={c.progress}
                          className={cn("h-full w-full origin-left", c.status === "completed" ? "bg-success" : "bg-accent")}
                          style={{ transform: `scaleX(${c.progress})` }}
                        />
                      </div>
                      <span className="font-mono text-[0.68rem] text-fg-dim">{c.target}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-[0.8rem] leading-relaxed text-fg-muted">
                Practice on Hack The Box and TryHackMe, plus CTFs. The projects above are the other half of the argument.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
