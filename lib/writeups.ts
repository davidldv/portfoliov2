import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { parse as parseYaml } from "yaml";

/**
 * Writeups live as Markdown in `content/writeups/*.md` with YAML frontmatter.
 * Everything is read at build time; pages are fully static.
 */

const DIR = join(process.cwd(), "content/writeups");

export const CATEGORIES = {
  appsec: "AppSec",
  research: "Research",
  htb: "Hack The Box",
  thm: "TryHackMe",
  bugbounty: "Bug bounty",
  ctf: "CTF",
} as const;
export type Category = keyof typeof CATEGORIES;

export const DIFFICULTIES = ["easy", "medium", "hard", "insane"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type WriteupMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  updated?: string;
  tags: string[];
  category: Category;
  difficulty?: Difficulty;
  cve?: string;
  readingMinutes: number;
  words: number;
};

export type Writeup = WriteupMeta & { body: string };

/** One spelling per topic, so filters don't split "next.js" and "nextjs". */
const TAG_ALIASES: Record<string, string> = { "next.js": "nextjs", eval: "evals", postgresql: "postgres" };
function normalizeTag(t: string): string {
  const k = t.trim().toLowerCase();
  return TAG_ALIASES[k] ?? k;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toIsoDate(v: unknown, field: string, file: string): string {
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) throw new Error(`${file}: invalid ${field} "${String(v)}"`);
  return d.toISOString().slice(0, 10);
}

/** Validate frontmatter explicitly so a typo fails the build instead of shipping a broken page. */
function parseFile(file: string, raw: string): Writeup | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = (parseYaml(m[1]) ?? {}) as Record<string, unknown>;
  const body = m[2];

  const slug = file.replace(/\.md$/, "");
  if (!SLUG_RE.test(slug)) throw new Error(`${file}: file name must be a kebab-case slug`);
  if (fm.draft === true) return null;

  if (typeof fm.title !== "string" || !fm.title.trim()) throw new Error(`${file}: title is required`);
  if (typeof fm.description !== "string" || !fm.description.trim()) throw new Error(`${file}: description is required`);

  const category = (fm.category ?? "appsec") as Category;
  if (!(category in CATEGORIES)) throw new Error(`${file}: unknown category "${String(category)}"`);

  const difficulty = fm.difficulty as Difficulty | undefined;
  if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) throw new Error(`${file}: unknown difficulty "${String(difficulty)}"`);

  const tags = Array.isArray(fm.tags) ? [...new Set(fm.tags.map((t) => normalizeTag(String(t))))] : [];

  // Reading time on prose only: fenced code is skimmed, not read.
  const prose = body.replace(/```[\s\S]*?```/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: fm.title.trim(),
    description: fm.description.trim(),
    date: toIsoDate(fm.date, "date", file),
    updated: fm.updated ? toIsoDate(fm.updated, "updated", file) : undefined,
    tags,
    category,
    difficulty,
    cve: typeof fm.cve === "string" ? fm.cve : undefined,
    words,
    readingMinutes: Math.max(1, Math.round(words / 230)),
    body,
  };
}

/** All published writeups, newest first. Cached per request/build. */
export const getWriteups = cache(async (): Promise<Writeup[]> => {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"));
  const all = await Promise.all(files.map(async (f) => parseFile(f, await readFile(join(DIR, f), "utf8"))));
  return all.filter((w): w is Writeup => w !== null).sort((a, b) => b.date.localeCompare(a.date));
});

export async function getWriteupMetas(): Promise<WriteupMeta[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (await getWriteups()).map(({ body, ...meta }) => meta);
}

export async function getWriteup(slug: string): Promise<{ writeup: Writeup; prev?: WriteupMeta; next?: WriteupMeta } | null> {
  const all = await getWriteups();
  const i = all.findIndex((w) => w.slug === slug);
  if (i === -1) return null;
  // `all` is newest-first: "next" is the newer post, "prev" the older one.
  const strip = (w?: Writeup): WriteupMeta | undefined => {
    if (!w) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { body, ...meta } = w;
    return meta;
  };
  return { writeup: all[i], prev: strip(all[i + 1]), next: strip(all[i - 1]) };
}

export function formatDate(iso: string, style: "long" | "short" = "long"): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: style === "long" ? "numeric" : undefined,
    timeZone: "UTC",
  });
}
