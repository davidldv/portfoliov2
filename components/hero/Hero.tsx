"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { hero, site } from "@/content/site";
import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { Hud } from "@/components/hero/Hud";
import { Magnetic } from "@/components/ui/Magnetic";
import { useLenis } from "@/components/layout/Providers";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const lenisRef = useLenis();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const headline = q<HTMLElement>("[data-headline]")[0];
      const fadeUps = q<HTMLElement>("[data-fade]");
      // Scroll choreography animates the wrappers; the entrance animates their
      // children. Keeping the two on different elements avoids tween conflicts.
      const backdrop = q<HTMLElement>("[data-backdrop]")[0];
      const backdropInner = q<HTMLElement>("[data-backdrop-inner]")[0];
      const content = q<HTMLElement>("[data-content]")[0];
      const hud = q<HTMLElement>("[data-hud]")[0];
      const hudCard = q<HTMLElement>("[data-hud-card]")[0];

      if (reduced) {
        gsap.set([headline, ...fadeUps, backdropInner, hudCard], { opacity: 1, y: 0, x: 0 });
        return;
      }

      // ── Entrance ───────────────────────────────────────────────
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro.fromTo(backdropInner, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" }, 0);

      // Split after fonts load so line breaks are final; autoSplit re-splits on resize.
      SplitText.create(headline, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(headline, { opacity: 1 });
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.3,
            ease: "power4.out",
            stagger: 0.1,
            delay: 0.25,
          });
        },
      });

      intro.fromTo(fadeUps, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.75);
      intro.fromTo(hudCard, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 1.2 }, 0.9);

      // ── Scroll choreography ────────────────────────────────────
      // The hero is pinned for a short distance while the next section slides over
      // it; the content recedes (scale + fade) and the backdrop drifts up.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=70%",
            pin: true,
            pinSpacing: false,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
        tl.to(content, { yPercent: -8, scale: 0.94, opacity: 0.25, transformOrigin: "50% 60%", ease: "none" }, 0)
          .to(hud, { yPercent: -14, opacity: 0.15, ease: "none" }, 0)
          .to(backdrop, { yPercent: -10, opacity: 0.15, ease: "none" }, 0);
      });
      mm.add("(max-width: 767px)", () => {
        gsap.to(backdrop, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      });

      // Pointer parallax on the glow
      const glow = q<HTMLElement>("[data-glow]")[0];
      const gx = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3.out" });
      const gy = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        gx((e.clientX - r.width / 2) * 0.08);
        gy((e.clientY - r.height / 2) * 0.08);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        ScrollTrigger.refresh();
      };
    },
    { scope: ref },
  );

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} id="top" className="relative z-0 flex min-h-[100svh] flex-col overflow-hidden">
      {/* backdrop layers */}
      <div data-backdrop className="pointer-events-none absolute inset-0">
        <div data-backdrop-inner className="absolute inset-0 opacity-0">
          <div className="bg-dots mask-fade-radial absolute inset-0" />
          <HeroBackdrop className="absolute inset-0 h-full w-full" />
          <div
            data-glow
            className="absolute left-1/2 top-[38%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent-glow), transparent 70%)" }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="container-x relative flex flex-1 flex-col justify-center pb-16 pt-32 md:pb-24 md:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <div data-content className="flex min-w-0 flex-col gap-7">
            <div data-fade className="flex flex-wrap items-center gap-3 opacity-0">
              <span className="eyebrow">{hero.eyebrow}</span>
            </div>

            <h1
              data-headline
              className="display text-[2.6rem] leading-[1.02] opacity-0 xs:text-5xl sm:text-[3.6rem] md:text-[4rem] lg:text-[4.1rem] xl:text-[4.5rem]"
            >
              {hero.headline.map((line, i) => (
                <span key={i}>
                  {line.em ? <em className="serif-italic text-accent">{line.text}</em> : line.text}
                  {i < hero.headline.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p data-fade className="max-w-xl text-[1.05rem] leading-relaxed text-fg-muted opacity-0 sm:text-lg">
              {hero.sub}
            </p>

            <div data-fade className="flex flex-wrap items-center gap-3 opacity-0">
              <Magnetic>
                <button type="button" onClick={() => scrollTo("work")} className="btn-primary h-11 px-6" data-cursor>
                  {hero.primaryCta.label}
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </button>
              </Magnetic>
              <Magnetic>
                <a href={hero.secondaryCta.href} target="_blank" rel="noopener noreferrer" className="btn-ghost h-11 px-6">
                  {hero.secondaryCta.label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </Magnetic>
              <a
                href="https://github.com/davidldv"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-sm text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                github.com/{site.handle}
              </a>
            </div>

            <div data-fade className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.72rem] text-fg-dim opacity-0">
              <span>{site.name}</span>
              <span aria-hidden>·</span>
              <span>{site.role}</span>
              <span aria-hidden>·</span>
              <span>{site.location}</span>
            </div>
          </div>

          <Hud className="min-w-0 lg:w-full lg:max-w-md lg:justify-self-end" data-hud />
        </div>

        <div data-fade className="mt-16 flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-fg-dim opacity-0 md:mt-24">
          <span className="relative h-10 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-accent [animation:scan_2.2s_ease-in-out_infinite]" />
          </span>
          Scroll
        </div>
      </div>
    </section>
  );
}
