import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getWriteupMetas } from "@/lib/writeups";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const writeups = await getWriteupMetas();
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/writeups`, lastModified: writeups[0]?.date, changeFrequency: "weekly", priority: 0.8 },
    ...writeups.map((w) => ({ url: `${site.url}/writeups/${w.slug}`, lastModified: w.updated ?? w.date, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
