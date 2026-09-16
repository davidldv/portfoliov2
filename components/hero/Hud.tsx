"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { hero, site } from "@/content/site";
import { LocalTime } from "@/components/ui/LocalTime";

const LOG: Array<{ t: string; kind: "cmd" | "step" | "ok" }> = [
  { t: "$ authzscan scan ./app --format sarif", kind: "cmd" },
  { t: "inventory   route handlers · server actions · auth libs", kind: "step" },
  { t: "trace       11 candidate identifiers", kind: "step" },
  { t: "verify      1 confirmed · 10 rejected", kind: "step" },
  { t: "report      authzscan.sarif · exit 1", kind: "ok" },
];

/**
 * The "system status" panel next to the headline: availability, three headline
 * numbers that count up, and a looping mock scan log. Purely decorative but
 * every number in it is real.
 */
export function Hud({ className, ...rest }: { className?: string } & Record<`data-${string}`, string | undefined>) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Count-ups
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

      // Typewriter log, looped
      const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-log]"));
      const texts = lines.map((l) => l.dataset.log ?? "");
      if (reduced) {
        lines.forEach((l, i) => (l.textContent = texts[i]));
        return;
      }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 2 });
      lines.forEach((line, i) => {
        const text = texts[i];
        const state = { n: 0 };
        tl.set(line, { opacity: 1 });
        tl.to(state, {
          n: text.length,
          duration: Math.max(0.3, text.length * 0.018),
          ease: "none",
          onUpdate: () => (line.textContent = text.slice(0, Math.round(state.n))),
        });
        tl.to({}, { duration: i === 0 ? 0.4 : 0.25 });
      });
      tl.to(lines, { opacity: 0, duration: 0.5, stagger: 0.04 }, "+=2.6");
      tl.call(() => lines.forEach((l) => (l.textContent = "")));
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} {...rest}>
      <div data-hud-card className="card relative overflow-hidden p-5 opacity-0 sm:p-6">
        {/* scanning highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-soft to-transparent opacity-70 [animation:scan_9s_linear_infinite]"
        />

        <div className="relative flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-muted">
          <span className="inline-flex items-center gap-2">
            Available · remote
          </span>
          <LocalTime className="text-fg-dim" />
        </div>

        <ul className="relative mt-5 divide-y divide-border">
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

        <div className="relative mt-4 overflow-hidden rounded-sm border border-border bg-bg/60 p-4 font-mono text-[0.72rem] leading-6">
          <div className="mb-2 flex items-center gap-1.5" aria-hidden>
            <span className="text-[0.65rem] text-fg-dim">{site.handle}@arch — zsh</span>
          </div>
          <div className="min-h-[7.5rem]" aria-live="off">
            {LOG.map((l, i) => (
              <div
                key={i}
                data-log={l.t}
                className={
                  l.kind === "cmd"
                    ? "truncate whitespace-pre text-fg opacity-0"
                    : l.kind === "ok"
                      ? "truncate whitespace-pre text-success opacity-0 before:mr-2 before:content-['✓']"
                      : "truncate whitespace-pre text-fg-muted opacity-0 before:mr-2 before:text-accent before:content-['▸']"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
