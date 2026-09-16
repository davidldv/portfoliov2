"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * A quiet constellation: ~70 drifting points joined by hairlines when close,
 * gently repelled by the pointer. Reads the accent from CSS so it follows the
 * theme. Paused when off-screen, when the tab is hidden, and for reduced motion.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;
    let points: P[] = [];
    const mouse = { x: -9999, y: -9999 };
    let accent = "124,177,255";

    const parseAccent = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      // --accent is a hex; convert to "r,g,b" for rgba() strings.
      const m = /^#([0-9a-f]{6})$/i.exec(v);
      if (m) {
        const n = parseInt(m[1], 16);
        accent = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(36, (w * h) / 16000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.2 + 0.6,
      }));
    };

    const LINK = 130;
    const step = () => {
      if (!running || !visible) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of points) {
        // pointer repulsion, very soft
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160 && d2 > 0.01) {
          const f = (1 - Math.sqrt(d2) / 160) * 0.06;
          p.vx += (dx / Math.sqrt(d2)) * f;
          p.vy += (dy / Math.sqrt(d2)) * f;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.22;
            ctx.strokeStyle = `rgba(${accent},${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of points) {
        ctx.fillStyle = `rgba(${accent},0.55)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (running && visible) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    parseAccent();
    resize();
    start();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    const onVis = () => {
      running = !document.hidden;
      start();
    };
    document.addEventListener("visibilitychange", onVis);
    const mo = new MutationObserver(parseAccent);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
