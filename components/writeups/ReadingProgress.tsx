"use client";

import { useEffect, useRef } from "react";

/** 2px bar under the nav that tracks how far through the article body the reader is. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById(targetId);
    // Capture the node: during client navigation React detaches refs before effect
    // cleanup runs, so a late scroll event must not read `bar.current`.
    const node = bar.current;
    if (!el || !node) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!el.isConnected) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = total <= 0 ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / total));
      node.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={bar} className="h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
