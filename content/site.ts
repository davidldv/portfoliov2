/**
 * Single source of truth for everything the site says.
 * Edit copy here; components only render it.
 */

export const site = {
  name: "David Londoño",
  shortName: "David",
  handle: "davidldv",
  role: "AI-Native Full-Stack Engineer",
  location: "Pereira, Colombia",
  timezone: "America/Bogota",
  email: "hello@davidlondon.dev",
  url: "https://davidlondon.dev",
  resumeHref: "/David-Londono-AI-FullStack.pdf",
  description:
    "AI-native full-stack engineer. I ship production systems in TypeScript, Next.js and PostgreSQL, and I build them with coding agents that work from a written architecture and spec.",
  availability: "Full-stack engineer at KitchenSync from Oct 2026 · always up for an AppSec conversation",
  languages: [
    { code: "ES", level: "Native" },
    { code: "EN", level: "C1" },
    { code: "DE", level: "B1" },
  ],
} as const;

export const socials = [
  { label: "GitHub", href: "https://github.com/davidldv", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/davidldv/", icon: "linkedin" },
  { label: "X", href: "https://x.com/nulodev", icon: "x" },
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
    { text: "and run the agents that", em: false },
    { text: "build them.", em: true },
  ],
  /** The four facts a recruiter needs in ten seconds, readable, right under the headline. */
  status: [
    ["AI-native full-stack", "Pereira, Colombia (UTC−5)"],
    ["Full-stack engineer at KitchenSync", "From Oct 2026"],
  ],
  sub: "Ghost AI turns a plain-English description of a system into a shared canvas that exports as a Markdown spec. authzscan sends agents through an existing Next.js codebase to review its authorization logic and publishes its own accuracy. Both were built from a written architecture and spec, with agents doing most of the typing.",
  primaryCta: { label: "See the work", href: "#work" },
  secondaryCta: { label: "Resume", href: site.resumeHref },
  hud: [
    { label: "authzscan on the seeded benchmark", value: "16/16", note: "recall · 0 false positives" },
    { label: "authzscan on a real repository", value: "1/11", note: "candidates confirmed · the gap was in the benchmark" },
    { label: "Deploy time at Tambora", value: "15", note: "minutes, down from two hours over SSH · Azure CI/CD" },
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
    slug: "ghost-ai",
    name: "Ghost AI",
    tagline: "A team describes a system, an agent draws it, the graph exports as a spec",
    description:
      "A real-time workspace where a team describes a system in plain English, an agent lays it onto a shared canvas, and the final graph exports as a Markdown spec you can hand to an implementation pipeline.",
    highlights: [
      "Next.js, Liveblocks for presence and shared state, React Flow for the canvas, Prisma and PostgreSQL underneath. The agent runs on the Vercel AI SDK with Gemini and edits the graph through structured mutations instead of free-form text. Templates give a new project a starting graph.",
      "Built from four context files (project overview, architecture, code standards, progress tracker) that every coding session starts from. The writeup covers the workflow.",
    ],
    tags: ["Next.js", "Liveblocks", "React Flow", "Vercel AI SDK", "Prisma"],
    href: "https://ghost-aildv.vercel.app/",
    repo: "https://github.com/davidldv/ghost-ai",
    kind: "product",
    featured: true,
  },
  {
    slug: "authzscan",
    name: "authzscan",
    tagline: "Agents that review an existing Next.js codebase for authorization bugs",
    description:
      "An automated review of authorization logic in Next.js App Router repos. Agents follow each client-controlled identifier to the database query it reaches and flag the ones with no ownership check. Pattern-matching SAST mostly cannot see this class of bug; an agent that reads the code can, and the benchmark says how far to trust it.",
    highlights: [
      "Four phases: a deterministic endpoint inventory with ts-morph (route handlers, Server Actions, auth-library detection), an agent trace pass, an adversarial verify pass whose whole job is killing false positives, and reports in Markdown, SARIF or JSON with exit codes CI can gate on.",
      "Accuracy is measured against a seeded benchmark of 16 IDOR/BOLA bugs plus 6 correctly written twins as false-positive traps, recall and precision gates, and an oracle runner that proves the harness scores correctly regardless of how good the model is.",
      "An endpoint it could not analyze is reported as not analyzed rather than clean. The inventory has run on repos of up to about 3,000 files and 647 endpoints.",
    ],
    tags: ["TypeScript", "ts-morph", "Anthropic SDK", "SARIF", "Next.js"],
    repo: "https://github.com/davidldv/authzscan",
    kind: "tool",
    featured: true,
    benchmark: { found: 16, seeded: 16, twins: 6, twinsFlagged: 0 },
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
  },
];

export const about = {
  eyebrow: "About",
  heading: "Full-stack engineer who writes the spec before the code.",
  paragraphs: [
    "I'm a full-stack engineer from Pereira, Colombia: React and Next.js on the front, Node, TypeScript and PostgreSQL on the back. Most of my code is now written with coding agents, and what I have learned is that the output is only as good as the architecture and the spec the agent starts from. The prompt matters much less.",
    "In practice that means writing the context files before the feature: what the system is, how it is laid out, what the standards are, where the work stands. Ghost AI was built that way from the first commit. authzscan turns the same idea around and sends agents through an existing codebase to evaluate it, with a benchmark that says how much to trust the result.",
    "I came to this through application security and kept the habit. I threat model a feature before it ships and attack my own work before anyone else can, which matters more now that agents, retrieval and tool calls are part of the app.",
  ],
  facts: [
    { label: "Based in", value: "Pereira, Colombia" },
    { label: "Working hours", value: "LATAM · US · EU overlap" },
    { label: "Languages", value: "Spanish, English C1, German B1" },
    { label: "Daily driver", value: "Claude Code, Arch Linux, Burp Suite" },
    { label: "Disclosure", value: "Credited: unauthenticated PII leak in rallly", href: "https://github.com/lukevella/rallly/pull/3247" },
  ],
} as const;

export const skills = [
  {
    id: "ai",
    title: "AI engineering",
    accent: true,
    items: [
      "Spec-driven development with agents",
      "Claude Code",
      "Anthropic SDK",
      "Vercel AI SDK",
      "MCP servers",
      "RAG pipelines",
      "Structured outputs",
      "Agent evals & benchmarks",
      "Prompt-injection defense",
      "SSE streaming",
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    accent: true,
    items: ["React 19", "Next.js (App Router, RSC)", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "D3", "Astro"],
  },
  {
    id: "backend",
    title: "Backend",
    accent: true,
    items: ["Node.js", "Next.js (Server Actions, Route Handlers)", "Express", "FastAPI", "Prisma", "PostgreSQL", "MongoDB", "Redis", "WebSockets", "Zod", "Jest"],
  },
  {
    id: "appsec",
    title: "Application security",
    items: ["OWASP Top 10 (Web + LLM)", "Broken access control / IDOR", "Threat modeling (STRIDE)", "OAuth 2.0 / OIDC", "JWT (EdDSA, RS256)", "RBAC & session hardening", "Secure code review"],
  },
  {
    id: "offensive",
    title: "Security tooling",
    items: ["Burp Suite", "Semgrep", "Trivy", "SARIF / code scanning", "OWASP ZAP", "nmap"],
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
    date: "Oct 2026 – now",
    title: "AI Full Stack Engineer",
    org: "KitchenSync",
    kind: "work",
    description: "Building agent-driven solutions for the restaurant industry.",
  },
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
    date: "May 2026",
    title: "Ghost AI",
    org: "Product · Writeup",
    kind: "shipped",
    description: "Real-time architecture canvas on Next.js, Liveblocks and React Flow that exports the graph as a Markdown spec. Built with coding agents from four context files; the writeup covers the workflow.",
    href: "/writeups/ghost-ai-architecture-first",
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
  heading: "Let's build the next one from a spec.",
  intro:
    "I'm joining KitchenSync as a full-stack engineer in October 2026, so I'm not looking for a new role. If you want to talk authorization bugs, agent tooling, or something you're building, write to me.",
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
