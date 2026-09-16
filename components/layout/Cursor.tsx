"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useCoarsePointer, useHoverCapable, useReducedMotion } from "@/lib/hooks";

/**
 * A restrained custom cursor: a 6px dot that tracks the pointer 1:1 and a ring
 * that lags slightly behind. Interactive elements grow the ring; elements with
 * `data-cursor-label` show a word inside it. Disabled on touch devices and for
 * users who prefer reduced motion — the native cursor is untouched there.
 */
export function Cursor() {
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const hover = useHoverCapable();
  const enabled = hover && !coarse && !reduced;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-cursor");
      return;
    }
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    document.documentElement.setAttribute("data-cursor", "custom");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      show();
    };

    const interactive = "a, button, [role='button'], input, textarea, select, label, [data-cursor]";
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest(interactive) as HTMLElement | null;
      if (!target) {
        gsap.to(ring, { width: 36, height: 36, borderWidth: 1, backgroundColor: "rgba(0,0,0,0)", duration: 0.35, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.3 });
        label.textContent = "";
        return;
      }
      const text = target.getAttribute("data-cursor-label");
      if (text) {
        label.textContent = text;
        gsap.to(ring, { width: 84, height: 84, borderWidth: 0, backgroundColor: "rgba(255,255,255,1)", duration: 0.4, ease: "power3.out" });
        gsap.to(dot, { scale: 0, duration: 0.3 });
      } else {
        label.textContent = "";
        gsap.to(ring, { width: 52, height: 52, borderWidth: 1, backgroundColor: "rgba(0,0,0,0)", duration: 0.35, ease: "power3.out" });
        gsap.to(dot, { scale: 0.5, duration: 0.3 });
      }
    };

    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.15 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    const onLeave = () => hide();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeAttribute("data-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex h-9 w-9 items-center justify-center rounded-full border border-white mix-blend-difference"
      >
        <span ref={labelRef} className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-black" />
      </div>
    </>
  );
}
