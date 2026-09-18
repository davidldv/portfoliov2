"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { hero, site } from "@/content/site";
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
      const hudCard = q<HTMLElement>("[data-hud-card]")[0];

      if (reduced) {
        gsap.set([headline, ...fadeUps, hudCard], { opacity: 1, y: 0, x: 0 });
        return;
      }

      // The one authored moment on the page: headline lines rise, the rest fades in behind them.
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

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
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-[38%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--accent-glow), transparent 70%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="container-x relative flex flex-1 flex-col justify-center pb-12 pt-24 md:pb-16 md:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            <h1
              data-headline
              className="display text-[2.6rem] leading-[1.02] opacity-0 xs:text-5xl sm:text-[3.4rem] md:text-[3.6rem] xl:text-[4rem] 2xl:text-[4.5rem]"
            >
              {hero.headline.map((line, i) => (
                <span key={i}>
                  {line.em ? <em className="serif-italic text-accent">{line.text}</em> : line.text}
                  {i < hero.headline.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p data-fade className="flex flex-col gap-y-1 text-[0.95rem] text-fg opacity-0 sm:text-base">
              {hero.status.map((row) => (
                <span key={row.join()} className="flex flex-wrap items-center gap-x-3">
                  {row.map((s, i) => (
                    <span key={s} className="inline-flex items-center gap-3">
                      {i > 0 && <span className="h-1 w-1 rounded-full bg-fg-dim" aria-hidden />}
                      {s}
                    </span>
                  ))}
                </span>
              ))}
            </p>

            <p data-fade className="max-w-xl text-base leading-relaxed text-fg-muted opacity-0 sm:text-[1.05rem]">
              {hero.sub}
            </p>

            <div data-fade className="flex flex-wrap items-center gap-3 opacity-0">
              <Magnetic>
                <button type="button" onClick={() => scrollTo("work")} className="btn-primary h-11 px-6">
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
                href={`mailto:${site.email}`}
                className="ml-1 inline-flex items-center gap-2 text-sm text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {site.email}
              </a>
            </div>
          </div>

          <Hud className="min-w-0 lg:w-full lg:max-w-md lg:justify-self-end" />
        </div>
      </div>
    </section>
  );
}
