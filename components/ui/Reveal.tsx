"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Animate direct children with a stagger instead of the wrapper. */
  stagger?: number;
  delay?: number;
  y?: number;
  /** Scroll position that triggers the reveal. Defaults to "top 85%". */
  start?: string;
  id?: string;
};

/**
 * Scroll-triggered entrance. Targets are hidden via CSS (`[data-reveal]` or
 * `[data-reveal-children] > *`) so nothing flashes before GSAP takes over; if
 * JS or motion is unavailable the CSS fallback shows them immediately.
 */
export function Reveal({ children, className, as: Tag = "div", stagger, delay = 0, y = 28, start = "top 85%", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const staggered = stagger != null;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targets = staggered ? Array.from(el.children) : [el];
      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: stagger ?? 0,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref },
  );

  const attrs = staggered ? { "data-reveal-children": "" } : { "data-reveal": "" };

  return (
    <Tag ref={ref} id={id} className={cn(className)} {...attrs}>
      {children}
    </Tag>
  );
}
