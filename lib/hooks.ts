"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** SSR-safe media query hook. Returns `false` during server render and hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useCoarsePointer = () => useMediaQuery("(pointer: coarse)");
export const useHoverCapable = () => useMediaQuery("(hover: hover)");

const noopSubscribe = () => () => {};

/** True once the component has mounted on the client (false during SSR and hydration). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function subscribeAttr(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/**
 * The current theme, read from `<html data-theme>` which the boot script sets
 * before paint. Server snapshot is "dark" (the default), so there is never a
 * hydration mismatch — React re-renders with the real value right after.
 */
export function useThemeAttr(): "dark" | "light" {
  return useSyncExternalStore(
    subscribeAttr,
    () => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"),
    () => "dark",
  );
}
