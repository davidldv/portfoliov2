import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";
import { CATEGORIES, getWriteup, getWriteups } from "@/lib/writeups";

export const alt = "Writeup by David Londoño";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getWriteups()).map((w) => ({ slug: w.slug }));
}

const sans = await readFile(join(process.cwd(), "assets/Geist-SemiBold.ttf"));
const mono = await readFile(join(process.cwd(), "assets/GeistMono-Regular.ttf"));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getWriteup(slug);
  const w = found?.writeup;
  const title = w?.title ?? "Writeup";
  const fontSize = title.length > 70 ? 54 : title.length > 45 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: "#08090c",
          color: "#f2f3f5",
          fontFamily: "Geist",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(124,177,255,0.2), transparent 45%), radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 28px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Geist Mono", fontSize: 20, color: "#9a9ca6", letterSpacing: 3 }}>
          <div style={{ width: 40, height: 2, background: "#7cb1ff" }} />
          <div style={{ display: "flex" }}>{`WRITEUP · ${(w ? CATEGORIES[w.category] : "AppSec").toUpperCase()}`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize, lineHeight: 1.06, letterSpacing: -2 }}>{title}</div>
          {w && (
            <div style={{ display: "flex", gap: 12, fontFamily: "Geist Mono", fontSize: 18, color: "#9a9ca6" }}>
              {w.tags.slice(0, 4).map((t) => (
                <div key={t} style={{ display: "flex", padding: "5px 12px", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999 }}>{`#${t}`}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "Geist Mono", fontSize: 20, color: "#9a9ca6" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontFamily: "Geist", fontSize: 28, color: "#f2f3f5" }}>{site.name}</div>
            <div style={{ display: "flex" }}>{site.url.replace("https://", "")}</div>
          </div>
          {w && <div style={{ display: "flex" }}>{`${w.readingMinutes} min read${w.difficulty ? ` · ${w.difficulty}` : ""}`}</div>}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: sans, style: "normal", weight: 600 }, { name: "Geist Mono", data: mono, style: "normal", weight: 400 }] },
  );
}
