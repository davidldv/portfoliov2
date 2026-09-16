# davidlondon.dev — v2

Portfolio for David Londoño, Application Security Engineer. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, GSAP, D3 and Motion.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` to enable the contact form. Without it, the form opens the visitor's mail client instead.

## Where things live

| Path | What |
| --- | --- |
| `content/site.ts` | **All page copy**: hero, projects, skills, timeline, certs, contact. Edit this, not the components. |
| `content/attack-surface.ts` | Nodes, trust zones and STRIDE edges for the PairCode threat-model map. |
| `content/writeups/*.md` | **Writeups.** One Markdown file per post; the file name is the URL slug. |
| `lib/writeups.ts` | Loads and validates writeup frontmatter, reading time, prev/next. |
| `lib/markdown.tsx` | Markdown → React: GFM, heading ids, TOC, TL;DR card, Shiki highlighting (dual theme). |
| `app/writeups/` | Index with category/tag filters, article pages with TOC, reading progress, per-post OG images. |
| `app/globals.css` | Design tokens (dark default, `[data-theme="light"]`), Tailwind theme, map styles, motion fallbacks. |
| `app/layout.tsx` | Fonts, metadata, and the pre-paint boot script (theme + reduced-motion flags). |
| `components/hero/` | Pinned hero, constellation canvas, status HUD with the typed scan log. |
| `components/map/AttackSurfaceMap.tsx` | The D3 attack-surface map: attacker/defender views, drag, IDOR trace animation, detail panel. |
| `components/sections/` | Proof strip, Work, Attack surface, About, Skills, Timeline, Writing, Contact. |
| `components/ui/` | Reveal, SectionHeader (SplitText lines), SpotlightCard, Magnetic, BenchmarkWaffle (D3), Logo. |
| `components/layout/` | Providers (theme + Lenis on GSAP's ticker), Nav, Cursor, ThemeToggle, Footer. |
| `lib/gsap.ts` | Registers ScrollTrigger, SplitText and `useGSAP` once; import GSAP from here. |
| `app/opengraph-image.tsx` | Social card generated at build time. |
| `next.config.ts` | Security headers (CSP, HSTS, frame-ancestors, permissions policy). |

## Writing a new writeup

Add `content/writeups/my-post-slug.md`:

```md
---
title: "The title"
description: "One or two sentences for the index card and social previews."
date: 2026-09-20
updated: 2026-09-22        # optional
tags: ["jwt", "auth"]
category: appsec           # appsec | research | htb | thm | bugbounty | ctf
difficulty: medium         # optional: easy | medium | hard | insane
cve: CVE-2026-12345        # optional
draft: false               # true hides it everywhere
---

## TL;DR

Rendered as a summary card at the top of the post.
```

Frontmatter is validated at build time, so a bad category or date fails `pnpm build` instead of shipping a broken page. Raw HTML inside Markdown is dropped and links are sanitized: only `http(s)://`, site-relative paths, `#anchors` and `mailto:` render as links.

## Motion rules

- One easing family (`power3/power4.out`, `expo.out`); entrances are 0.9–1.3s, hovers 0.3s.
- Everything animated starts at `opacity: 0` and has a CSS fallback: with JS off or `prefers-reduced-motion`, content renders in its final state (see the end of `globals.css`).
- The hero pins only at `md` and up; mobile gets a simple parallax.
- Custom cursor and magnetic buttons only turn on for fine pointers with hover and without reduced motion.
- Canvas and D3 loops pause off-screen and when the tab is hidden.

## Before you publish

- **Review `content/attack-surface.ts` against PairCode's real code.** The controls are written from the project notes. Make sure every `control`/`controlDetail` describes what the repo actually does.
- Update the certification `progress` values in `content/site.ts` as they move.
- Resume: `public/David-Londono-Security.pdf`.
