"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/layout/Providers";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);
  return active;
}

export function TableOfContents({ items, variant = "rail" }: { items: TocItem[]; variant?: "rail" | "inline" }) {
  const lenisRef = useLenis();
  const active = useActiveHeading(items.map((i) => i.id));

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { duration: 1.1 });
    else el.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  const list = (
    <ol className="relative flex flex-col">
      {items.map((item) => {
        const on = item.id === active;
        return (
          <li key={item.id} className="relative">
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id)}
              aria-current={on ? "location" : undefined}
              className={cn(
                "block border-l py-1.5 text-[0.82rem] leading-snug transition-colors duration-300",
                item.depth === 3 ? "pl-7" : "pl-4",
                on ? "border-accent text-fg" : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="group rounded-[var(--radius)] border border-border bg-surface px-4 py-3 open:pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg-muted">
          On this page
          <span className="transition-transform duration-300 group-open:rotate-45" aria-hidden>
            +
          </span>
        </summary>
        <nav aria-label="Table of contents" className="mt-3">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-3">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg-dim">On this page</span>
      {list}
    </nav>
  );
}
