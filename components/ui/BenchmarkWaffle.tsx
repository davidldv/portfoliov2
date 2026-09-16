"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Props = {
  found: number;
  seeded: number;
  twins: number;
  twinsFlagged: number;
  className?: string;
};

/**
 * The authzscan benchmark as a waffle: one cell per seeded case. Filled cells are
 * bugs the scanner found; outlined cells are correctly-authorized twins it
 * (correctly) left alone. Drawn with D3 so the fill animates in on scroll.
 */
export function BenchmarkWaffle({ found, seeded, twins, twinsFlagged, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cells = [
      ...Array.from({ length: seeded }, (_, i) => ({ i, kind: "bug" as const, hit: i < found })),
      ...Array.from({ length: twins }, (_, i) => ({ i: seeded + i, kind: "twin" as const, hit: i < twinsFlagged })),
    ];
    const cols = 11;
    const size = 18;
    const gap = 6;
    const rows = Math.ceil(cells.length / cols);
    const w = cols * (size + gap) - gap;
    const h = rows * (size + gap) - gap;

    const svg = d3.select(el).attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    svg.selectAll("*").remove();

    const g = svg
      .selectAll("rect")
      .data(cells)
      .join("rect")
      .attr("x", (d) => (d.i % cols) * (size + gap))
      .attr("y", (d) => Math.floor(d.i / cols) * (size + gap))
      .attr("width", size)
      .attr("height", size)
      .attr("rx", 4)
      .attr("fill", (d) => (d.kind === "bug" ? "var(--accent)" : "transparent"))
      .attr("stroke", (d) => (d.kind === "bug" ? "none" : d.hit ? "var(--status-critical)" : "var(--border-strong)"))
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) => (d.kind === "twin" ? "3 3" : null))
      .attr("opacity", 0);

    g.append("title").text((d) =>
      d.kind === "bug" ? `Seeded IDOR/BOLA bug #${d.i + 1} — ${d.hit ? "found" : "missed"}` : `Authorized twin #${d.i - seeded + 1} — ${d.hit ? "false positive" : "correctly ignored"}`,
    );

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const play = () => {
      if (reduced) {
        g.attr("opacity", 1);
        return;
      }
      g.transition()
        .delay((d) => 120 + d.i * 45)
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [found, seeded, twins, twinsFlagged]);

  return (
    <figure className={className}>
      <svg ref={ref} role="img" aria-label={`Benchmark: ${found} of ${seeded} seeded bugs found, ${twinsFlagged} of ${twins} authorized twins flagged.`} className="h-auto max-w-full" />
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.68rem] text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent" aria-hidden />
          {found}/{seeded} seeded bugs found
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] border border-dashed border-border-strong" aria-hidden />
          {twins - twinsFlagged}/{twins} twins correctly ignored
        </span>
      </figcaption>
    </figure>
  );
}
