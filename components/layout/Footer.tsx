"use client";

import { ArrowUpRight } from "lucide-react";
import { site, socials } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/ui/LocalTime";

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="container-x flex flex-col gap-10 py-14">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-7" />
              <span className="display text-xl">{site.name}</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{site.description}</p>
          </div>

          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-1 text-sm text-fg-muted transition-colors duration-300 hover:text-fg"
                >
                  {s.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hairline" />

        <div className="flex flex-col gap-3 font-mono text-[0.72rem] text-fg-dim sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.name}.
          </span>
          <span className="inline-flex items-center gap-2">
            {site.location} · <LocalTime />
          </span>
        </div>
      </div>
    </footer>
  );
}
