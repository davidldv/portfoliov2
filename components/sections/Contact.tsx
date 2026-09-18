"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, Send } from "lucide-react";
import { contact, site, socials } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

type Status = "idle" | "incomplete" | "sending" | "sent" | "error";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: bots fill hidden fields, humans do not.
    if (data.get("botcheck")) return;

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    // The browser's own validation runs first; this only catches whitespace-only input.
    if (!name || !email || !message) {
      setStatus("incomplete");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New portfolio inquiry from ${name}`,
          from_name: "davidlondon.dev",
          name,
          email,
          message,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) throw new Error("submit failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-dim transition-[border-color,box-shadow] duration-300 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15";

  return (
    <section id="contact" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,var(--accent-glow),transparent_70%)] opacity-70" aria-hidden />
      <div className="container-x relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader index="07" eyebrow={contact.eyebrow} heading={contact.heading} intro={contact.intro} />
          <Reveal stagger={0.06} className="flex flex-col gap-2">
            <a href={`mailto:${site.email}`} className="display group inline-flex items-center gap-2 text-2xl text-fg sm:text-3xl">
              {site.email}
              <ArrowUpRight className="h-5 w-5 opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden />
            </a>
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials
                .filter((s) => s.icon !== "mail")
                .map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="chip h-8 gap-1.5 px-3 text-[0.78rem]">
                      {s.label}
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </a>
                  </li>
                ))}
            </ul>
          </Reveal>
        </div>

        <Reveal y={36} className="lg:pt-24">
          {!WEB3FORMS_KEY ? (
            <div className="card flex flex-col gap-3 p-6 sm:p-7">
              <p className="text-sm text-fg-muted">{contact.form.noBackend}</p>
              <a href={`mailto:${site.email}`} className="btn-primary h-11 w-fit px-6">
                <Send className="h-4 w-4" aria-hidden />
                {contact.form.emailInstead}
              </a>
            </div>
          ) : (
          <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-6 sm:p-7">
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[0.78rem] font-medium text-fg-muted">
                {contact.form.name}
                <input name="name" required autoComplete="name" placeholder="Your name" className={field} />
              </label>
              <label className="flex flex-col gap-1.5 text-[0.78rem] font-medium text-fg-muted">
                {contact.form.email}
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-[0.78rem] font-medium text-fg-muted">
              {contact.form.message}
              <textarea name="message" required rows={5} placeholder="The role, the team, the problem." className={cn(field, "resize-y")} />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className={cn("text-[0.78rem]", status === "error" || status === "incomplete" ? "text-status-serious" : "text-fg-dim")} role="status" aria-live="polite">
                {status === "sent" ? (
                  contact.form.sent
                ) : status === "error" ? (
                  <>
                    {contact.form.error}{" "}
                    <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                      {site.email}
                    </a>
                  </>
                ) : status === "incomplete" ? (
                  contact.form.incomplete
                ) : (
                  contact.form.idle
                )}
              </span>
              <Magnetic>
                <button type="submit" disabled={status === "sending"} className="btn-primary h-11 px-6 disabled:opacity-60">
                  {status === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                  {status === "sending" ? contact.form.sending : contact.form.submit}
                </button>
              </Magnetic>
            </div>
          </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
