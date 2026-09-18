/**
 * Single source of truth for everything the site says.
 * Edit copy here; components only render it.
 */

export const site = {
  name: "David Londoño",
  shortName: "David",
  handle: "davidldv",
  role: "Application Security Engineer",
  location: "Pereira, Colombia",
  timezone: "America/Bogota",
  email: "dlondon.dev@gmail.com",
  url: "https://davidlondon.dev",
  resumeHref: "/David-Londono-Security.pdf",
  description:
    "Application Security Engineer. I ship production systems in TypeScript, Next.js and PostgreSQL, and I write the tools that attack them.",
  availability: "Open to remote AppSec & security engineering roles · US / EU / LATAM",
  languages: [
    { code: "ES", level: "Native" },
    { code: "EN", level: "C1" },
    { code: "DE", level: "B1" },
  ],
} as const;

export const socials = [
  { label: "GitHub", href: "https://github.com/davidldv", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/davidldv/", icon: "linkedin" },
  { label: "X", href: "https://x.com/yuvdxv", icon: "x" },
  { label: "Hack The Box", href: "https://app.hackthebox.com/users/3395439", icon: "box" },
  { label: "TryHackMe", href: "https://tryhackme.com/p/dlondon.dev", icon: "terminal" },
  { label: "Email", href: `mailto:${site.email}`, icon: "mail" },
] as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "attack-surface", label: "Attack surface" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "timeline", label: "Timeline" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

export const hero = {
  /** Rendered as three lines; `em` gets the serif italic treatment. */
  headline: [
    { text: "I ship production systems", em: false },
    { text: "and write the tools that", em: false },
    { text: "attack them.", em: true },
  ],
  /** The four facts a recruiter needs in ten seconds, readable, right under the headline. */
  status: [
    ["Application security", "Pereira, Colombia (UTC−5)"],
    ["Remote US / EU / LATAM or relocation", "Available now"],
  ],
  sub: "authzscan finds IDOR/BOLA in Next.js codebases and publishes its own false-positive rate. Two labs cover JWT internals and LLM/MCP attack surfaces. Everything on this page is something I built and then attacked, and the fixes are in the repos.",
  primaryCta: { label: "See the work", href: "#work" },
  secondaryCta: { label: "Resume", href: site.resumeHref },
  hud: [
    { label: "authzscan on the seeded benchmark", value: "16/16", note: "recall · 0 false positives" },
    { label: "authzscan on a real repository", value: "1/11", note: "candidates confirmed · the gap was in the benchmark" },
    { label: "JWT flaws reproduced", value: "5", note: "alg=none → kid injection" },
  ],
} as const;

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  tags: string[];
  href?: string;
  repo?: string;
  kind: "tool" | "lab" | "product" | "research";
  featured?: boolean;
  /** Optional benchmark visual for authzscan. */
  benchmark?: { found: number; seeded: number; twins: number; twinsFlagged: number };
};

export const projects: Project[] = [
  {
    slug: "authzscan",
    name: "authzscan",
    tagline: "IDOR/BOLA review that runs itself, on Claude agents",
    description:
      "An automated review of authorization logic in Next.js App Router repos. Agents follow each client-controlled identifier to the database query it reaches and flag the ones with no ownership check. It is the top OWASP risk, and pattern-matching SAST mostly cannot see it.",
    highlights: [
      "Four phases: a deterministic endpoint inventory with ts-morph (route handlers, Server Actions, auth-library detection), an agent trace pass, an adversarial verify pass whose whole job is killing false positives, and reports in Markdown, SARIF or JSON with exit codes CI can gate on.",
      "Accuracy is measured against a seeded benchmark of 16 IDOR/BOLA bugs plus 6 correctly written twins as false-positive traps, recall and precision gates, and an oracle runner that proves the harness scores correctly regardless of how good the model is.",
      "An endpoint it could not analyze is reported as not analyzed rather than clean.",
    ],
    tags: ["TypeScript", "ts-morph", "Anthropic SDK", "SARIF", "Next.js"],
    repo: "https://github.com/davidldv/authzscan",
    kind: "tool",
    featured: true,
    benchmark: { found: 16, seeded: 16, twins: 6, twinsFlagged: 0 },
  },
  {
    slug: "jwt-lab",
    name: "JWT Security Lab + jwt-scan",
    tagline: "A JWT lab with a broken half and a fixed half, shipped as an npm scanner",
    description:
      "Two versions of the same API, one vulnerable and one hardened. Every attack lands on the first and bounces off the second, so you can run the fixes instead of taking my word for them. The detection logic ships as jwt-scan, an npm CLI.",
    highlights: [
      "JWT signing and verification written from scratch in TypeScript, no libraries, reproducing five flaws that reach production: alg=none bypass, HS256/RS256 key confusion, weak-secret brute force, kid header injection, and missing iss/aud/exp validation.",
      "jwt-scan has token and live-endpoint modes with CI-friendly exit codes. The hardened mirror removes whole classes of bug at once: one allowed algorithm (RS256), a fixed kid registry with rotation, generic errors so nothing leaks through an oracle, scrypt for passwords.",
    ],
    tags: ["TypeScript", "Node.js", "OpenSSL", "Docker", "npm CLI"],
    repo: "https://github.com/davidldv/jwtsecuritylab",
    kind: "lab",
    featured: true,
  },
  {
    slug: "llmseclab",
    name: "LLM/RAG Security Lab",
    tagline: "OWASP LLM Top 10, attack side and defense side",
    description:
      "Two FastAPI services with the same RAG surface: one left vulnerable on purpose, one hardened. Every attack in the suite works on the first and fails on the second.",
    highlights: [
      "Five scenarios as a pytest attack suite: cross-tenant retrieval leak (confused deputy), indirect prompt injection through retrieved documents, vector-store poisoning via forged ingest metadata, excessive agency over a real MCP tool server, and stored XSS straight out of the model.",
      "Excessive agency is stopped with a deny-by-default authorization hook on the host side, so every MCP tool call is authorized before dispatch. A deterministic mock LLM means CI can check that every attack fails against the secure API.",
    ],
    tags: ["Python", "FastAPI", "MCP", "RAG", "pytest"],
    repo: "https://github.com/davidldv/llmseclab",
    kind: "lab",
    featured: true,
  },
  {
    slug: "paircode",
    name: "PairCode",
    tagline: "Secure real-time collaborative workspace",
    description:
      "A collaborative workspace where I wrote the identity and auth layer myself instead of importing one, plus a realtime layer built to match it. It is the system modeled in the attack-surface map below.",
    highlights: [
      "Auth built in-house: EdDSA JWTs, rotating refresh tokens that detect reuse, Argon2id hashing, CSRF protection.",
      "A custom WebSocket server. The handshake uses a single-use ticket, every event is authorized on its own, and RBAC is checked server-side.",
    ],
    tags: ["Node.js", "Express", "PostgreSQL", "WebSockets", "EdDSA"],
    href: "https://paircode-lime.vercel.app/",
    kind: "product",
  },
  {
    slug: "la-bodega",
    name: "Materiales La Bodega",
    tagline: "Solo-built e-commerce platform, live in production",
    description:
      "A live storefront for a family-owned hardware retailer that moves roughly $1.5M COP a day. Real customers pay real money through it, and when it breaks I am the only one who can fix it.",
    highlights: [
      "Authentication, session security and RBAC that keep the staff side separate from the customer side, with Mercado Pago wired up for live transactions.",
      "Hardened against the OWASP Top 10: parameterized queries, server-side validation, CSRF protection on anything that changes state, least-privilege database roles.",
    ],
    tags: ["Next.js", "PostgreSQL", "Mercado Pago", "RBAC"],
    href: "https://materialeslabodega.com.co",
    kind: "product",
  },
  {
    slug: "ghost-ai",
    name: "Ghost AI",
    tagline: "Architecture-first collaborative canvas",
    description:
      "A real-time workspace where a team describes a system in plain English, an agent lays it onto a shared canvas, and the final graph exports as a Markdown spec you can hand to an implementation pipeline.",
    highlights: [
      "Next.js, Liveblocks, React Flow and the Vercel AI SDK. The interesting part is the context-managed workflow that built it.",
    ],
    tags: ["Next.js", "Liveblocks", "React Flow", "AI SDK"],
    href: "https://ghost-aildv.vercel.app/",
    kind: "research",
  },
];

export const about = {
  eyebrow: "About",
  heading: "Security engineer who still ships the feature.",
  paragraphs: [
    "I'm an application security engineer from Pereira, Colombia, with a full-stack background: React and Next.js on the front, Node, TypeScript and PostgreSQL on the back. I spend more of my time than most engineers on code that works correctly and is still a security problem.",
    "In practice that means threat modeling a feature before it ships and attacking my own work before anyone else can, with the OWASP Top 10 as the baseline. I practice on Hack The Box, TryHackMe and the PortSwigger Web Security Academy, since I find it hard to defend against an attack I have never run myself.",
    "The part I'm most interested in right now is securing applications with an LLM inside them. Retrieval, tool calls and agents add attack surface that traditional web security does not cover, and most teams are shipping it anyway.",
  ],
  facts: [
    { label: "Based in", value: "Pereira, Colombia" },
    { label: "Working hours", value: "LATAM · US · EU overlap" },
    { label: "Languages", value: "Spanish, English C1, German B1" },
    { label: "Daily driver", value: "Arch Linux, Burp Suite, Claude Code" },
  ],
} as const;

export const skills = [
  {
    id: "appsec",
    title: "Application security",
    accent: true,
    items: [
      "OWASP Top 10 (Web + LLM)",
      "IDOR / BOLA & broken access control",
      "Threat modeling (STRIDE)",
      "OAuth 2.0 / OIDC",
      "JWT cryptography (EdDSA, RS256)",
      "RBAC & session hardening",
      "CSRF / XSS / SQLi defense",
      "Argon2id / scrypt",
      "Secure code review",
      "Secrets management",
      "Prompt-injection defense",
    ],
  },
  {
    id: "offensive",
    title: "Offensive & tooling",
    accent: true,
    items: ["Burp Suite", "OWASP ZAP", "nmap", "Wireshark", "sqlmap", "ffuf", "Nuclei", "Semgrep", "Trivy", "SARIF / code scanning", "Hydra"],
  },
  {
    id: "ai",
    title: "AI & LLM security",
    items: ["Anthropic SDK", "MCP servers", "RAG pipelines", "LLM guardrails", "Agent evals & benchmarks", "SSE streaming"],
  },
  {
    id: "backend",
    title: "Backend",
    items: ["Node.js", "Next.js (RSC, Server Actions)", "Express", "FastAPI", "Prisma", "PostgreSQL", "MongoDB", "Redis", "WebSockets", "Zod", "Jest"],
  },
  {
    id: "frontend",
    title: "Frontend",
    items: ["React 19", "TypeScript", "Tailwind CSS", "GSAP", "D3", "Framer Motion", "Astro"],
  },
  {
    id: "platform",
    title: "Platform & languages",
    items: ["TypeScript", "Python", "C", "SQL", "Bash", "Docker", "Linux", "GitHub Actions", "Azure Pipelines", "AWS"],
  },
] as const;

export type TimelineEntry = {
  date: string;
  title: string;
  org: string;
  kind: "work" | "education" | "shipped" | "cert";
  description: string;
  href?: string;
};

export const timeline: TimelineEntry[] = [
  {
    date: "Aug 2026",
    title: "authzscan on real code",
    org: "Writeup",
    kind: "shipped",
    description: "Pointed the scanner at a real open-source repo after a 100% benchmark score. One genuine bug in eleven candidates. The gap turned out to be in the benchmark rather than the model.",
    href: "/writeups/authzscan-first-real-repository",
  },
  {
    date: "Jul 2026",
    title: "authzscan v1",
    org: "Open source",
    kind: "shipped",
    description: "Agent-driven IDOR/BOLA scanner for Next.js App Router with a seeded 16-bug benchmark and SARIF output.",
    href: "https://github.com/davidldv/authzscan",
  },
  {
    date: "Jun 2026",
    title: "LLM/RAG Security Lab",
    org: "Open source",
    kind: "shipped",
    description: "Five OWASP LLM Top 10 attacks as a pytest suite against a vulnerable/hardened FastAPI pair, including excessive agency over a live MCP server.",
    href: "https://github.com/davidldv/llmseclab",
  },
  {
    date: "Apr 2026",
    title: "JWT Security Lab & jwt-scan",
    org: "Open source · npm",
    kind: "shipped",
    description: "From-scratch JWT sign/verify reproducing five production flaws, then shipped as an npm CLI scanner.",
    href: "https://github.com/davidldv/jwtsecuritylab",
  },
  {
    date: "2026",
    title: "Google Professional Cybersecurity Certificate",
    org: "Google · Coursera",
    kind: "cert",
    description: "Completed alongside every free lab in the PortSwigger Web Security Academy.",
  },
  {
    date: "Jul – Sep 2025",
    title: "Frontend Developer (Contract)",
    org: "Tambora · Remote",
    kind: "work",
    description: "Migrated business-critical modules from jQuery to React (40% smaller bundles, DOM string injection gone), consolidated an Atomic Design library, and replaced manual SSH deploys with Azure CI/CD: two hours to under fifteen minutes.",
  },
  {
    date: "Jun – Jul 2024",
    title: "Full-Stack Development Bootcamp",
    org: "EliteStack · Pereira",
    kind: "education",
    description: "Linux/CLI, TypeScript, Node.js, Docker, REST, WebSockets, Next.js, AWS. The first time the pieces of a production system fit together for me.",
  },
  {
    date: "Feb 2022 – present",
    title: "Systems & Computing Engineering",
    org: "Universidad Tecnológica de Pereira",
    kind: "education",
    description: "In progress, alongside self-directed study in operating systems, networks, algorithms and applied ML.",
  },
];

export type Cert = {
  name: string;
  issuer: string;
  status: "completed" | "in-progress";
  target: string;
  progress: number;
};

export const certs: Cert[] = [
  { name: "Google Professional Cybersecurity Certificate", issuer: "Google · Coursera", status: "completed", target: "2026", progress: 1 },
  { name: "PortSwigger Web Security Academy", issuer: "PortSwigger", status: "completed", target: "All free labs", progress: 1 },
  { name: "Burp Suite Certified Practitioner", issuer: "PortSwigger", status: "in-progress", target: "2026 Q4", progress: 0.65 },
  { name: "CompTIA Security+", issuer: "CompTIA", status: "in-progress", target: "2026", progress: 0.5 },
];

export const contact = {
  eyebrow: "Contact",
  heading: "Let's find the bug before someone else does.",
  intro:
    "Open to application security and security engineering roles, remote across US, EU and LATAM hours, or relocation. If your team ships fast and wants someone who attacks what they build, write to me.",
  form: {
    name: "Name",
    email: "Email",
    message: "Message",
    submit: "Send message",
    sending: "Sending…",
    idle: "Usually answered within a day.",
    incomplete: "Name, email and message are all needed.",
    sent: "Sent. I'll reply within a day.",
    error: "The message didn't go through. Email me directly:",
    noBackend: "The contact form is off right now. Email works, and I usually answer within a day.",
    emailInstead: "Write to me",
  },
} as const;
