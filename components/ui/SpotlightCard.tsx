"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Card whose border and background carry a soft radial highlight that follows
 * the pointer (the Linear/Vercel "spotlight" treatment). Pure CSS variables —
 * no re-renders per mouse move.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "a";
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as never}
      onMouseMove={onMove}
      className={cn(
        "group/spot relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-elevated shadow-card transition-[border-color,transform] duration-500",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] hover:before:opacity-100",
        "before:[background:radial-gradient(520px_circle_at_var(--mx,50%)_var(--my,50%),var(--accent-soft),transparent_45%)]",
        "hover:border-border-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
