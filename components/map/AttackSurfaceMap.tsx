"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Crosshair, ShieldCheck, RotateCcw, Play } from "lucide-react";
import { edges as EDGES, nodes as NODES, STRIDE, ZONES, type MapEdge, type MapNode, type Severity, type Zone } from "@/content/attack-surface";
import { cn } from "@/lib/utils";

type View = "attacker" | "defender";
type SimNode = MapNode & d3.SimulationNodeDatum & { w: number; h: number };
type SimEdge = Omit<MapEdge, "source" | "target"> & { source: SimNode; target: SimNode; curve: number };
type Selection = { type: "node"; id: string } | { type: "edge"; id: string } | null;

const NODE_H = 56;
const ZONE_ORDER: Zone[] = ["untrusted", "app", "data"];

/**
 * Deterministic positions (fractions of the canvas) so the diagram reads the
 * same every time; the force simulation only relaxes drags back into place.
 */
const LAYOUT: Record<"h" | "v", Record<string, [number, number]>> = {
  h: {
    browser: [0.165, 0.3],
    attacker: [0.165, 0.72],
    api: [0.5, 0.17],
    auth: [0.5, 0.43],
    ws: [0.5, 0.69],
    rbac: [0.5, 0.92],
    users: [0.835, 0.22],
    tokens: [0.835, 0.5],
    db: [0.835, 0.78],
  },
  v: {
    browser: [0.27, 0.08],
    attacker: [0.73, 0.18],
    api: [0.27, 0.34],
    auth: [0.73, 0.43],
    ws: [0.27, 0.52],
    rbac: [0.73, 0.61],
    users: [0.27, 0.78],
    tokens: [0.73, 0.87],
    db: [0.5, 0.955],
  },
};
const BANDS: Record<"h" | "v", Array<[number, number]>> = {
  h: [
    [0.015, 0.315],
    [0.345, 0.655],
    [0.685, 0.985],
  ],
  v: [
    [0.02, 0.255],
    [0.28, 0.7],
    [0.725, 0.995],
  ],
};
const SEVERITY_VAR: Record<Severity, string> = {
  critical: "var(--status-critical)",
  serious: "var(--status-serious)",
  warning: "var(--status-warning)",
  good: "var(--status-good)",
};
const TRACE_PATH = ["attack-forge", "query"]; // attacker → api → db: the IDOR path authzscan hunts

/** Icons drawn inline so the SVG has no external dependencies. */
const ICONS: Record<MapNode["kind"], string> = {
  actor: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  service: "M4 6h16v5H4zM4 13h16v5H4zM7 8.5h.01M7 15.5h.01",
  store: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm-8 3v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
};

export function AttackSurfaceMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dataRef = useRef<{ nodes: SimNode[]; edges: SimEdge[] } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>("attacker");
  const [selected, setSelected] = useState<Selection>(null);
  const [hovered, setHovered] = useState<Selection>(null);
  const [tracing, setTracing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  /* ── measure ─────────────────────────────────────────────── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      const h = w < 640 ? 840 : 640;
      setSize((s) => (s.w === w ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── build + simulate ────────────────────────────────────── */
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || size.w === 0) return;
    const { w, h } = size;
    const horizontal = w >= 640;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NODE_W = horizontal ? 168 : Math.min(160, Math.floor(w * 0.44));
    const mode = horizontal ? "h" : "v";
    const nodes: SimNode[] = NODES.map((n) => {
      const [fx, fy] = LAYOUT[mode][n.id];
      return { ...n, w: NODE_W, h: NODE_H, x: fx * w, y: fy * h };
    });
    const byId = new Map(nodes.map((n) => [n.id, n]));

    // Parallel edges between the same pair get opposite curvature so they never overlap.
    const pairCount = new Map<string, number>();
    const edges: SimEdge[] = EDGES.map((e) => {
      const key = [e.source, e.target].sort().join("|");
      const i = pairCount.get(key) ?? 0;
      pairCount.set(key, i + 1);
      return { ...e, source: byId.get(e.source)!, target: byId.get(e.target)!, curve: i === 0 ? 0.12 : i === 1 ? -0.3 : 0.45 };
    });
    dataRef.current = { nodes, edges };

    const home = (d: SimNode) => LAYOUT[mode][d.id];
    const sim = d3
      .forceSimulation<SimNode, SimEdge>(nodes)
      .force("x", d3.forceX<SimNode>((d) => home(d)[0] * w).strength(0.9))
      .force("y", d3.forceY<SimNode>((d) => home(d)[1] * h).strength(0.9))
      .force("collide", d3.forceCollide<SimNode>().radius(NODE_H / 2 + 10).strength(0.7))
      .stop();
    for (let i = 0; i < 60; i++) sim.tick();
    // Keep nodes inside the canvas.
    const clampNodes = () => {
      for (const n of nodes) {
        n.x = Math.max(NODE_W / 2 + 6, Math.min(w - NODE_W / 2 - 6, n.x ?? 0));
        n.y = Math.max(NODE_H / 2 + 30, Math.min(h - NODE_H / 2 - 6, n.y ?? 0));
      }
    };
    clampNodes();

    /* ── draw ─────────────────────────────────────────────── */
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    const defs = svg.append("defs");
    for (const [id, color] of [
      ["arrow-default", "var(--border-strong)"],
      ["arrow-accent", "var(--accent)"],
      ["arrow-critical", SEVERITY_VAR.critical],
      ["arrow-serious", SEVERITY_VAR.serious],
      ["arrow-warning", SEVERITY_VAR.warning],
    ] as const) {
      defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9)
        .attr("refY", 5)
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,1 L9,5 L0,9 Z")
        .attr("fill", color);
    }
    const glow = defs.append("filter").attr("id", "node-glow").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
    glow.append("feGaussianBlur").attr("stdDeviation", 10).attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Trust zones
    const zones = svg.append("g").attr("class", "zones");
    ZONE_ORDER.forEach((z, i) => {
      const g = zones.append("g");
      const [a, b] = BANDS[mode][i];
      if (horizontal) {
        const x0 = a * w, x1 = b * w;
        g.append("rect").attr("x", x0).attr("y", 8).attr("width", x1 - x0).attr("height", h - 16).attr("rx", 18).attr("class", "zone-rect");
        g.append("text").attr("x", x0 + 16).attr("y", 30).attr("class", "zone-label").text(ZONES[z].label.toUpperCase());
      } else {
        const y0 = a * h, y1 = b * h;
        g.append("rect").attr("x", 8).attr("y", y0).attr("width", w - 16).attr("height", y1 - y0).attr("rx", 18).attr("class", "zone-rect");
        g.append("text").attr("x", 22).attr("y", y0 + 20).attr("class", "zone-label").text(ZONES[z].label.toUpperCase());
      }
    });

    // Edges
    const linkG = svg.append("g").attr("class", "links");
    const link = linkG
      .selectAll<SVGGElement, SimEdge>("g")
      .data(edges, (d) => d.id)
      .join("g")
      .attr("class", "link")
      .attr("data-id", (d) => d.id)
      .attr("data-severity", (d) => d.severity)
      .style("cursor", "pointer");
    link.append("path").attr("class", "link-hit").attr("fill", "none").attr("stroke", "transparent").attr("stroke-width", 22);
    link.append("path").attr("class", "link-path").attr("fill", "none").attr("stroke-width", 1.5);
    link.append("path").attr("class", "link-flow").attr("fill", "none").attr("stroke-width", 1.5);
    const badge = link.append("g").attr("class", "link-badge");
    badge.append("circle").attr("r", 11).attr("class", "badge-bg");
    badge.append("text").attr("text-anchor", "middle").attr("dy", "0.36em").attr("class", "badge-text").text((d) => d.stride);
    const flowLabel = link.append("g").attr("class", "link-label");
    flowLabel.append("rect").attr("rx", 5).attr("class", "label-bg");
    flowLabel.append("text").attr("text-anchor", "middle").attr("dy", "0.34em").attr("class", "label-text").text((d) => d.flow);
    flowLabel.each(function () {
      const t = d3.select(this).select<SVGTextElement>("text").node();
      const bw = (t?.getComputedTextLength() ?? 60) + 14;
      d3.select(this).select("rect").attr("x", -bw / 2).attr("y", -9).attr("width", bw).attr("height", 18);
    });

    // Nodes
    const nodeG = svg.append("g").attr("class", "nodes");
    const node = nodeG
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .attr("data-id", (d) => d.id)
      .attr("data-zone", (d) => d.zone)
      .style("cursor", "grab");
    node.append("rect").attr("class", "node-rect").attr("x", -NODE_W / 2).attr("y", -NODE_H / 2).attr("width", NODE_W).attr("height", NODE_H).attr("rx", 12);
    node.append("rect").attr("class", "node-accent").attr("x", -NODE_W / 2).attr("y", -NODE_H / 2 + 12).attr("width", 3).attr("height", NODE_H - 24).attr("rx", 1.5);
    node
      .append("path")
      .attr("class", "node-icon")
      .attr("d", (d) => ICONS[d.kind])
      .attr("transform", `translate(${-NODE_W / 2 + 14}, -9) scale(0.78)`)
      .attr("fill", "none")
      .attr("stroke-width", 1.7)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
    const compact = NODE_W < 168;
    node
      .append("text")
      .attr("class", "node-label")
      .attr("x", -NODE_W / 2 + 40)
      .attr("y", compact ? 4 : -3)
      .text((d) => d.label);
    if (!compact) node.append("text").attr("class", "node-sub").attr("x", -NODE_W / 2 + 40).attr("y", 13).text((d) => d.sub);

    // Position updates
    const curvePath = (d: SimEdge) => {
      const sx = d.source.x ?? 0, sy = d.source.y ?? 0, tx = d.target.x ?? 0, ty = d.target.y ?? 0;
      const dx = tx - sx, dy = ty - sy;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const mx = (sx + tx) / 2 + nx * len * d.curve;
      const my = (sy + ty) / 2 + ny * len * d.curve;
      // Trim the path so the arrow ends at the node's border instead of its center.
      const trim = (fx: number, fy: number, x: number, y: number, hw: number, hh: number) => {
        const vx = x - fx, vy = y - fy;
        const sxr = Math.abs(vx) > 0.001 ? hw / Math.abs(vx) : Infinity;
        const syr = Math.abs(vy) > 0.001 ? hh / Math.abs(vy) : Infinity;
        const s = Math.min(sxr, syr);
        return [x - vx * s, y - vy * s];
      };
      const [ex, ey] = trim(mx, my, tx, ty, NODE_W / 2 + 8, NODE_H / 2 + 8);
      const [bx, by] = trim(mx, my, sx, sy, NODE_W / 2 + 4, NODE_H / 2 + 4);
      return { d: `M${bx},${by} Q${mx},${my} ${ex},${ey}`, mx: (bx + 2 * mx + ex) / 4, my: (by + 2 * my + ey) / 4 };
    };

    const tick = () => {
      clampNodes();
      link.each(function (d) {
        const { d: path, mx, my } = curvePath(d);
        const g = d3.select(this);
        g.selectAll("path").attr("d", path);
        g.select(".link-badge").attr("transform", `translate(${mx},${my})`);
        g.select(".link-label").attr("transform", `translate(${mx},${my + 24})`);
      });
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    };
    tick();
    sim.on("tick", tick);

    // Drag
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
        node.filter((n) => n.id === d.id).style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        sim.alpha(0.6).restart(); // spring back home
        d.fx = null;
        d.fy = null;
        node.filter((n) => n.id === d.id).style("cursor", "grab");
      });
    node.call(drag);

    // Interaction
    node
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelected((s) => (s?.type === "node" && s.id === d.id ? null : { type: "node", id: d.id }));
      })
      .on("mouseenter", (_, d) => setHovered({ type: "node", id: d.id }))
      .on("mouseleave", () => setHovered(null));
    link
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelected((s) => (s?.type === "edge" && s.id === d.id ? null : { type: "edge", id: d.id }));
      })
      .on("mouseenter", (_, d) => setHovered({ type: "edge", id: d.id }))
      .on("mouseleave", () => setHovered(null));
    svg.on("click", () => setSelected(null));

    // Entrance
    if (!reduced) {
      node.attr("opacity", 0).attr("transform", (d) => `translate(${d.x},${(d.y ?? 0) + 14})`);
      link.attr("opacity", 0);
    }

    return () => {
      sim.stop();
      svg.on("click", null);
    };
  }, [size, layoutKey]);

  /* ── entrance once visible ───────────────────────────────── */
  useEffect(() => {
    if (!revealed || !svgRef.current || size.w === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svg = d3.select(svgRef.current);
    if (reduced) {
      svg.selectAll(".node, .link").attr("opacity", 1);
      return;
    }
    svg
      .selectAll<SVGGElement, SimNode>(".node")
      .transition()
      .delay((_, i) => 80 + i * 60)
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);
    svg
      .selectAll(".link")
      .transition()
      .delay((_, i) => 500 + i * 45)
      .duration(600)
      .attr("opacity", 1);
  }, [revealed, size, layoutKey]);

  /* ── restyle on view / selection changes ─────────────────── */
  const active = selected ?? hovered;
  useEffect(() => {
    const data = dataRef.current;
    const svgEl = svgRef.current;
    if (!data || !svgEl) return;
    const svg = d3.select(svgEl);
    const activeEdge = active?.type === "edge" ? data.edges.find((e) => e.id === active.id) : null;
    const activeNode = active?.type === "node" ? active.id : null;
    const connected = new Set<string>();
    if (activeEdge) {
      connected.add(activeEdge.source.id);
      connected.add(activeEdge.target.id);
    }
    if (activeNode) {
      connected.add(activeNode);
      data.edges.forEach((e) => {
        if (e.source.id === activeNode || e.target.id === activeNode) {
          connected.add(e.source.id);
          connected.add(e.target.id);
        }
      });
    }
    const hasFocus = Boolean(active);

    svg
      .selectAll<SVGGElement, SimNode>(".node")
      .attr("data-view", view)
      .attr("data-state", (d) => (!hasFocus ? "idle" : connected.has(d.id) ? "on" : "off"))
      .attr("data-selected", (d) => (selected?.type === "node" && selected.id === d.id ? "true" : null));

    svg
      .selectAll<SVGGElement, SimEdge>(".link")
      .attr("data-view", view)
      .attr("data-state", (d) => {
        if (!hasFocus) return "idle";
        if (activeEdge) return d.id === activeEdge.id ? "on" : "off";
        return d.source.id === activeNode || d.target.id === activeNode ? "on" : "off";
      })
      .attr("data-selected", (d) => (selected?.type === "edge" && selected.id === d.id ? "true" : null))
      .select(".link-path")
      .attr("marker-end", (d) => (view === "attacker" ? `url(#arrow-${d.severity})` : "url(#arrow-accent)"));
  }, [view, active, selected]);

  /* ── attack trace animation ──────────────────────────────── */
  const runTrace = useCallback(() => {
    const data = dataRef.current;
    const svgEl = svgRef.current;
    if (!data || !svgEl || tracing) return;
    setTracing(true);
    setView("attacker");
    setSelected(null);
    const svg = d3.select(svgEl);
    const layer = svg.append("g").attr("class", "trace");
    const dot = layer.append("circle").attr("r", 5).attr("fill", SEVERITY_VAR.critical).attr("filter", "url(#node-glow)");
    const halo = layer.append("circle").attr("r", 5).attr("fill", "none").attr("stroke", SEVERITY_VAR.critical).attr("stroke-width", 1.5);

    const steps = TRACE_PATH.map((id) => svg.select<SVGPathElement>(`.link[data-id="${id}"] .link-path`).node()).filter(Boolean) as SVGPathElement[];
    let i = 0;
    const next = () => {
      if (i >= steps.length) {
        halo.transition().duration(700).attr("r", 34).attr("opacity", 0);
        dot.transition().duration(500).attr("opacity", 0).on("end", () => {
          layer.remove();
          setTracing(false);
          setSelected({ type: "edge", id: "query" });
        });
        return;
      }
      const path = steps[i];
      const len = path.getTotalLength();
      const id = TRACE_PATH[i];
      svg.select(`.link[data-id="${id}"]`).attr("data-trace", "true");
      dot.transition()
        .duration(1100)
        .ease(d3.easeCubicInOut)
        .attrTween("transform", () => (t) => {
          const p = path.getPointAtLength(t * len);
          halo.attr("cx", p.x).attr("cy", p.y);
          return `translate(${p.x},${p.y})`;
        })
        .on("end", () => {
          i += 1;
          setTimeout(next, 250);
        });
    };
    const start = steps[0];
    if (!start) {
      layer.remove();
      setTracing(false);
      return;
    }
    const p0 = start.getPointAtLength(0);
    dot.attr("transform", `translate(${p0.x},${p0.y})`);
    halo.attr("cx", p0.x).attr("cy", p0.y);
    setTimeout(next, 200);
    setTimeout(() => svg.selectAll(".link").attr("data-trace", null), 4200);
  }, [tracing]);

  /* ── detail panel content ────────────────────────────────── */
  const detail = useMemo(() => {
    if (!active) return null;
    if (active.type === "node") {
      const n = NODES.find((x) => x.id === active.id)!;
      const inbound = EDGES.filter((e) => e.target === n.id);
      const outbound = EDGES.filter((e) => e.source === n.id);
      return { kind: "node" as const, n, inbound, outbound };
    }
    const e = EDGES.find((x) => x.id === active.id)!;
    return { kind: "edge" as const, e, s: NODES.find((n) => n.id === e.source)!, t: NODES.find((n) => n.id === e.target)! };
  }, [active]);

  const critical = EDGES.filter((e) => e.severity === "critical").length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="card relative overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div role="tablist" aria-label="Map view" className="inline-flex rounded-sm border border-border bg-surface p-0.5">
            {(["attacker", "defender"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] transition-colors duration-300",
                  view === v ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
                )}
              >
                {v === "attacker" ? <Crosshair className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={runTrace} disabled={tracing} className="btn-ghost h-8 px-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] disabled:opacity-50">
              <Play className="h-3.5 w-3.5" aria-hidden />
              Trace IDOR path
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setLayoutKey((k) => k + 1);
              }}
              aria-label="Reset layout"
              title="Reset layout"
              className="btn-ghost h-8 w-8 px-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>

        <div ref={wrapRef} className="asm relative w-full" style={{ height: size.h || 560 }} data-view={view}>
          <svg
            ref={svgRef}
            className="h-full w-full select-none"
            role="img"
            aria-label="Interactive threat model of PairCode: browser and attacker in the untrusted zone, REST API, auth service, realtime server and authorization in the application zone, and refresh tokens, credentials and PostgreSQL in the data zone. Each connection lists its STRIDE threat and the control that mitigates it."
          />
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 font-mono text-[0.68rem] text-fg-muted">
          <span className="text-fg-dim">Severity</span>
          {(["critical", "serious", "warning"] as Severity[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-px w-3" style={{ background: SEVERITY_VAR[s] }} aria-hidden />
              {s}
            </span>
          ))}
          <span className="ml-auto hidden text-fg-dim sm:inline">Drag nodes · click an edge for the control</span>
        </div>
      </div>

      {/* detail panel */}
      <aside className="card flex min-h-[320px] flex-col p-5" aria-live="polite">
        {!detail && (
          <div className="flex h-full flex-col">
            <span className="eyebrow">Threat model · PairCode</span>
            <h3 className="display mt-4 text-2xl">
              {NODES.length} components, {EDGES.length} trust-crossing flows, {critical} rated critical.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              STRIDE applied to the auth and realtime layer I wrote for PairCode. Every edge carries the threat that crosses it and the control that
              closes it. Switch to <span className="text-fg">defender</span> to read the mitigations, or trace the IDOR path that authzscan was
              built to find.
            </p>
            <dl className="mt-auto grid grid-cols-3 gap-3 pt-6 font-mono text-[0.7rem] text-fg-dim">
              {ZONE_ORDER.map((z) => (
                <div key={z} className="flex flex-col gap-1">
                  <dt className="uppercase tracking-[0.14em]">{ZONES[z].label}</dt>
                  <dd className="text-fg-muted">{NODES.filter((n) => n.zone === z).length} nodes</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {detail?.kind === "node" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{ZONES[detail.n.zone].label} zone</span>
              <span className="chip">{detail.n.kind}</span>
            </div>
            <div>
              <h3 className="display text-2xl">{detail.n.label}</h3>
              <p className="font-mono text-[0.72rem] text-fg-dim">{detail.n.sub}</p>
            </div>
            <p className="text-sm leading-relaxed text-fg-muted">{detail.n.summary}</p>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fg-dim">
                {view === "attacker" ? "Threats on this node" : "Controls on this node"}
              </span>
              <ul className="flex flex-col gap-1.5">
                {[...detail.inbound, ...detail.outbound].map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelected({ type: "edge", id: e.id })}
                      className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-hover"
                    >
                      <span className="mt-[0.55rem] inline-block h-px w-3 shrink-0" style={{ background: SEVERITY_VAR[e.severity] }} aria-hidden />
                      <span className="text-fg-muted">
                        <span className="text-fg">{e.flow}</span> · {view === "attacker" ? e.threat : e.control}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {detail?.kind === "edge" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">
                {detail.s.label} → {detail.t.label}
              </span>
              <span className="font-mono text-[0.68rem]" style={{ color: SEVERITY_VAR[detail.e.severity] }}>
                {detail.e.severity}
              </span>
            </div>
            <div>
              <div className="font-mono text-[0.72rem] text-fg-dim">
                STRIDE · {detail.e.stride} — {STRIDE[detail.e.stride]}
              </div>
              <h3 className="display mt-1 text-2xl">{detail.e.flow}</h3>
            </div>
            <div className="rounded-sm border border-border bg-surface p-3.5">
              <div className="mb-1 font-mono text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: SEVERITY_VAR[detail.e.severity] }}>
                Threat
              </div>
              <p className="text-sm leading-relaxed text-fg">{detail.e.threat}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-fg-muted">
                <span className="text-fg-dim">If missing:</span> {detail.e.ifMissing}
              </p>
            </div>
            <div className="rounded-sm border border-accent/30 bg-accent-soft p-3.5">
              <div className="mb-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-accent">Control</div>
              <p className="text-sm font-medium leading-relaxed text-fg">{detail.e.control}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-fg-muted">{detail.e.controlDetail}</p>
            </div>
          </div>
        )}
      </aside>

    </div>
  );
}
