import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const sans = await readFile(join(process.cwd(), "assets/Geist-SemiBold.ttf"));
const mono = await readFile(join(process.cwd(), "assets/GeistMono-Regular.ttf"));
const serif = await readFile(join(process.cwd(), "assets/instrument-serif-latin-400-italic.woff"));

/** Social card, generated at build time. Same tokens as the site's dark theme. */
export default async function Image() {
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
          backgroundImage: "radial-gradient(circle at 78% 30%, rgba(124,177,255,0.22), transparent 45%), radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 28px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Geist Mono", fontSize: 22, color: "#9a9ca6", letterSpacing: 4 }}>
          <div style={{ width: 40, height: 2, background: "#7cb1ff" }} />
          AI-NATIVE FULL-STACK · BUILT WITH AGENTS
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 68, lineHeight: 1.06, letterSpacing: -2.5 }}>
          <div>I ship production systems</div>
          <div>and run the agents that</div>
          <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", color: "#7cb1ff", letterSpacing: -0.5, fontSize: 74 }}>build them.</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 30 }}>{site.name}</div>
            <div style={{ fontFamily: "Geist Mono", fontSize: 18, color: "#9a9ca6" }}>{`${site.role} · ${site.location}`}</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[
              ["16/16", "authzscan benchmark"],
              ["647", "endpoints inventoried"],
              ["15 min", "deploys at Tambora"],
            ].map(([v, l]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                <div style={{ fontFamily: "Geist Mono", fontSize: 26 }}>{v}</div>
                <div style={{ fontFamily: "Geist Mono", fontSize: 13, color: "#9a9ca6" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: sans, style: "normal", weight: 600 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: serif, style: "italic", weight: 400 },
      ],
    },
  );
}
