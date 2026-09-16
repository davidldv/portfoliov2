"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLenis } from "@/components/layout/Providers";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [sectionActive, setActive] = useState<string>("");
  // Off the home page, "Writing" is the active item while reading writeups.
  const active = isHome ? sectionActive : pathname.startsWith("/writeups") ? "writing" : "";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenisRef = useLenis();
  const linksRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // Track which section is in view. A single observer with a band in the middle
  // of the viewport — the section covering that band is the active one.
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sliding highlight pill behind the active link.
  useEffect(() => {
    const el = linksRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!el || !linksRef.current) {
      setPill(null);
      return;
    }
    const parent = linksRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPill({ x: r.left - parent.left, w: r.width });
  }, [active]);

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenisRef]);

  /** Section links scroll smoothly on the home page and navigate to /#id (or /writeups) elsewhere. */
  const hrefFor = (id: string) => (isHome ? `#${id}` : id === "writing" ? "/writeups" : `/#${id}`);

  const go = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
      >
        <nav
          aria-label="Main"
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-3 rounded-sm border px-2 py-2 transition-[background-color,border-color,box-shadow] duration-500",
            scrolled ? "glass border-border shadow-card" : "border-transparent bg-transparent",
          )}
        >
          <Link
            href="/"
            onClick={(e) => {
              if (!isHome) return;
              e.preventDefault();
              const lenis = lenisRef.current;
              if (lenis) lenis.scrollTo(0, { duration: 1.2 });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 rounded-sm py-1 pl-2 pr-3 text-sm font-medium"
            aria-label={`${site.name} — back to top`}
          >
            <Logo className="h-6 w-6" />
            <span className="hidden font-mono text-[0.8rem] tracking-tight text-fg sm:inline">{site.handle}</span>
          </Link>

          <div ref={linksRef} className="relative hidden items-center md:flex">
            {pill && (
              <motion.span
                layout
                initial={false}
                animate={{ x: pill.x, width: pill.w }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-sm bg-surface-hover"
                aria-hidden
              />
            )}
            {nav.map((n) => (
              <Link
                key={n.id}
                data-id={n.id}
                href={hrefFor(n.id)}
                onClick={(e) => {
                  if (!isHome) return;
                  e.preventDefault();
                  go(n.id);
                }}
                className={cn(
                  "relative z-10 rounded-sm px-3 py-1.5 text-[0.82rem] font-medium transition-colors duration-300",
                  active === n.id ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <a
              href={site.resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hidden h-9 px-4 text-[0.8rem] sm:inline-flex"
            >
              Resume
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface text-fg md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass fixed inset-0 z-40 flex flex-col justify-end px-6 pb-12 pt-28 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={hrefFor(n.id)}
                    onClick={(e) => {
                      if (!isHome) {
                        setOpen(false);
                        return;
                      }
                      e.preventDefault();
                      go(n.id);
                    }}
                    className="display flex items-baseline justify-between border-b border-border py-4 text-3xl text-fg"
                  >
                    {n.label}
                    <span className="font-mono text-xs text-fg-dim">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={site.resumeHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 h-12 w-full">
              Resume (PDF) <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
