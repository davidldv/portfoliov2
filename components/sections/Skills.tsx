"use client";

import { useRef } from "react";
import { ShieldCheck, Bug, BrainCircuit, Server, Monitor, Layers } from "lucide-react";
import { skills } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const ICONS = {
  appsec: ShieldCheck,
  offensive: Bug,
  ai: BrainCircuit,
  backend: Server,
  frontend: Monitor,
  platform: Layers,
} as const;

export function Skills() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-skill-card]", root);
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 });
        gsap.set(root.querySelectorAll("[data-chip]"), { opacity: 1, y: 0 });
        return;
      }
      cards.forEach((card, i) => {
        const chips = card.querySelectorAll("[data-chip]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 88%", once: true } });
        tl.fromTo(card, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: (i % 3) * 0.08 });
        tl.fromTo(chips, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power2.out" }, "-=0.5");
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="skills" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="container-x flex flex-col gap-14">
        <SectionHeader
          index="04"
          eyebrow="Skills"
          heading={
            <>
              Full-stack, with agents doing most of the <span className="serif-italic text-accent">typing</span>.
            </>
          }
          intro="AI engineering, frontend and backend are the job. Application security is the habit that keeps what the agents write from shipping with holes in it."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => {
            const Icon = ICONS[group.id];
            const accent = "accent" in group && group.accent;
            return (
              <SpotlightCard
                key={group.id}
                data-skill-card=""
                className={cn(
                  "flex flex-col gap-5 p-6 opacity-0",
                  group.id === "ai" && "md:col-span-2 lg:col-span-1 lg:row-span-2",
                  group.id === "platform" && "md:col-span-2 lg:col-span-3",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-sm border",
                        accent ? "border-accent/30 bg-accent-soft text-accent" : "border-border bg-surface text-fg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <h3 className="text-[1.02rem] font-semibold tracking-[-0.01em]">{group.title}</h3>
                  </div>
                  <span className="font-mono text-[0.68rem] text-fg-dim">{group.items.length}</span>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map((s) => (
                    <li
                      key={s}
                      data-chip=""
                      className={cn("chip opacity-0", accent && "border-accent/20 hover:border-accent/50 hover:text-accent")}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
