"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  index: string;
  eyebrow: string;
  heading: ReactNode;
  intro?: ReactNode;
  className?: string;
  align?: "left" | "center";
};

/**
 * Section heading with an index, an eyebrow and a line-masked headline reveal.
 * The SplitText reveal runs once when the header scrolls into view.
 */
export function SectionHeader({ index, eyebrow, heading, intro, className, align = "left" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const h = root.querySelector<HTMLElement>("[data-heading]");
      const rest = root.querySelectorAll<HTMLElement>("[data-fade]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!h) return;
      if (reduced) {
        gsap.set([h, ...rest], { opacity: 1, y: 0 });
        return;
      }

      // autoSplit re-splits when fonts load or the width changes and keeps the
      // returned timeline in sync, so line breaks are always correct.
      SplitText.create(h, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(h, { opacity: 1 });
          const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 82%", once: true } });
          tl.from(self.lines, { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.08 }).fromTo(
            rest,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 },
            "-=0.7",
          );
          return tl;
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      <div data-fade className="flex items-center gap-3 opacity-0">
        <span className="font-mono text-[0.7rem] tracking-[0.18em] text-fg-dim">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 data-heading className="display max-w-3xl text-[2.1rem] leading-[1.05] opacity-0 sm:text-5xl md:text-[3.4rem]">
        {heading}
      </h2>
      {intro && (
        <p data-fade className="max-w-2xl text-[1.02rem] leading-relaxed text-fg-muted opacity-0 sm:text-lg">
          {intro}
        </p>
      )}
    </div>
  );
}
