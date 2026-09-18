"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useThemeAttr } from "@/lib/hooks";

/* ───────────────────────────── Theme ───────────────────────────── */

type Theme = "dark" | "light";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeContext = createContext<ThemeCtx | null>(null);

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <Providers>");
  return ctx;
}

/* ───────────────────────────── Lenis ───────────────────────────── */

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/** A ref to the Lenis instance (null before mount). Read `.current` inside handlers and effects, never during render. */
export function useLenis(): RefObject<Lenis | null> {
  const ref = useContext(LenisContext);
  if (!ref) throw new Error("useLenis must be used inside <Providers>");
  return ref;
}

export function Providers({ children }: { children: ReactNode }) {
  // The boot script in layout.tsx sets data-theme before paint; useThemeAttr mirrors it.
  const theme = useThemeAttr();
  const lenisRef = useRef<Lenis | null>(null);

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: true, // offsets come from CSS scroll-margin-top, which Lenis honors
      respectReducedMotion: true,
    });
    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Recalculate after fonts load — line wraps change the page height.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // After a client-side navigation the page height changes: re-measure Lenis and every ScrollTrigger.
  const pathname = usePathname();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const themeValue = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <LenisContext.Provider value={lenisRef}>
        {children}
      </LenisContext.Provider>
    </ThemeContext.Provider>
  );
}
