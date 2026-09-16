"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once, on the client. Every component imports gsap from here so the
// plugin registration and the shared defaults live in a single place.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Shared easing so every reveal feels like the same product. */
export const EASE = {
  out: "power3.out",
  outExpo: "expo.out",
  inOut: "power2.inOut",
} as const;
