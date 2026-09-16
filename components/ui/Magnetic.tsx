"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Wraps a button/link so it gently follows the pointer within a small radius.
 * Strength is intentionally low — it should feel like surface tension, not a
 * magnet. No-op on touch devices and with reduced motion.
 */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!window.matchMedia("(hover: hover)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const target = el.firstElementChild as HTMLElement | null;
      if (!target) return;
      const xTo = gsap.quickTo(target, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(target, "y", { duration: 0.6, ease: "power3.out" });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className ?? "inline-block p-2 -m-2"}>
      {children}
    </div>
  );
}
