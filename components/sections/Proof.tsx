"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { proof } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The strip right under the hero: one sentence of positioning and four numbers
 * that count up when they scroll into view. Every number is a measured result.
 */
export function Proof() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-metric]", root);
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 });
        cards.forEach((c) => {
          const n = c.querySelector<HTMLElement>("[data-value]")!;
          n.textContent = `${n.dataset.value}${n.dataset.suffix ?? ""}`;
        });
        return;
      }
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
          onStart: () => {
            cards.forEach((c, i) => {
              const n = c.querySelector<HTMLElement>("[data-value]")!;
              const target = Number(n.dataset.value);
              const suffix = n.dataset.suffix ?? "";
              const obj = { v: 0 };
              gsap.to(obj, {
                v: target,
                duration: 1.4,
                delay: 0.2 + i * 0.1,
                ease: "power3.out",
                onUpdate: () => (n.textContent = `${Math.round(obj.v)}${suffix}`),
              });
            });
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Proof" className="relative z-10 border-t border-border bg-bg">
      <div className="container-x grid gap-10 py-20 md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:gap-16">
        <Reveal as="p" className="display max-w-lg text-[1.35rem] leading-snug tracking-[-0.02em] text-fg sm:text-2xl">
          {proof.lead}
        </Reveal>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border lg:grid-cols-4">
          {proof.metrics.map((m) => (
            <li key={m.label} data-metric className="flex flex-col gap-3 bg-bg-elevated p-5 opacity-0 sm:p-6">
              <span className="display font-mono text-3xl tabular-nums sm:text-4xl" data-value={m.value} data-suffix={m.suffix}>
                0{m.suffix}
              </span>
              <span className="text-sm font-medium leading-snug text-fg">{m.label}</span>
              <span className="text-[0.78rem] leading-snug text-fg-muted">{m.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
