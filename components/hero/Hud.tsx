"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { hero } from "@/content/site";
import { LocalTime } from "@/components/ui/LocalTime";

/**
 * The panel next to the headline: three measured numbers that count up once.
 * The benchmark score and the real-repository score sit next to each other on purpose.
 */
export function Hud({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        if (reduced) {
          el.textContent = `${target}${suffix}`;
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          delay: 1.4,
          ease: "power3.out",
          onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      <div data-hud-card className="card relative p-5 opacity-0 sm:p-6">
        <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-muted">
          <span>Measured results</span>
          <LocalTime className="text-fg-dim" />
        </div>

        <ul className="mt-4 divide-y divide-border">
          {hero.hud.map((m) => (
            <li key={m.label} className="flex items-baseline justify-between gap-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm text-fg">{m.label}</span>
                <span className="font-mono text-[0.7rem] text-fg-dim">{m.note}</span>
              </div>
              <span
                className="display font-mono text-2xl tabular-nums text-fg"
                data-count={m.value.split("/")[0]}
                data-suffix={m.value.includes("/") ? `/${m.value.split("/")[1]}` : ""}
              >
                0{m.value.includes("/") ? `/${m.value.split("/")[1]}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
