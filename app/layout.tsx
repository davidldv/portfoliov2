import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";

import { site } from "@/content/site";
import { Providers } from "@/components/layout/Providers";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

const instrumentSerif = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: ["application security", "appsec", "security engineer", "IDOR", "BOLA", "JWT", "LLM security", "Next.js", "TypeScript"],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    url: site.url,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
    creator: "@yuvdxv",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090c" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before first paint: restores the saved theme so there is no flash,
 * flags reduced motion for the CSS fallbacks, and marks JS as available.
 * Kept dependency-free and tiny on purpose.
 */
const bootScript = `
(function(){
  try {
    var d = document.documentElement;
    d.classList.remove('no-js');
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') d.setAttribute('data-theme', t);
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) d.setAttribute('data-theme', 'light');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) d.setAttribute('data-motion', 'reduced');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`no-js ${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main" className="relative flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
